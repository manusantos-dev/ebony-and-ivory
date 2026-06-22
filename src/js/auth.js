import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { FIREBASE_CONFIG, STORAGE_KEY } from './core/config.js';
import { state } from "./core/state.js";
import { t } from "./ui/i18n.js";
import { loadAll, saveAll } from "./core/storage.js";
import { emit, on } from "./core/events.js";
import { showToast } from "./ui/toast.js";
import { isMaintenanceMode } from './features/maintenance.js';
import { showSyncing, showSynced } from './ui/sync-status.js';
import { showConfirm } from './ui/dialog.js';

let auth = null;
let db = null;
let unsubscribeSnapshot = null;
let pollTimer = null;
let lastSnapshotMap = {};

const snapshotOf = (map) => Object.fromEntries(Object.entries(map).map(([k, v]) => [k, v.updatedAt || 0]));

const syncToCloud = () => {
  if (isMaintenanceMode || !state.currentUser || !db) return;
  
  const coll = db.collection("users").doc(state.currentUser.uid).collection("scores");
  const all = loadAll();
  const batch = db.batch();
  let writes = 0;
  
  Object.keys(all).forEach((id) => {
    if (!lastSnapshotMap[id] || lastSnapshotMap[id] !== (all[id].updatedAt || 0)) {
      batch.set(coll.doc(id), all[id]);
      writes++;
    }
  });
  
  Object.keys(lastSnapshotMap).forEach((id) => {
    if (!all[id]) { batch.delete(coll.doc(id)); writes++; }
  });
  
  if (writes > 0) {
    showSyncing();
    batch.commit().then(() => {
      lastSnapshotMap = snapshotOf(all);
      showSynced();
    }).catch(showSynced);
  }
};

export const initFirebase = () => {
  try {
    if (typeof firebase === "undefined" || !FIREBASE_CONFIG.apiKey) {
      return "Error de conexión o configuración Firebase.";
    }

    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    auth = firebase.auth();
    db = firebase.firestore();

    auth.onAuthStateChanged((user) => {
      state.currentUser = user;
      updateAccountUI();
      emit("authchange", user);

      if (user) {
        lastSnapshotMap = {};
        const coll = db.collection("users").doc(user.uid).collection("scores");
        
        unsubscribeSnapshot = coll.onSnapshot((snap) => {
          const cloudMap = {};
          snap.forEach((doc) => { cloudMap[doc.id] = doc.data(); });
          const localAll = loadAll();
          let changed = false;
          
          Object.keys(cloudMap).forEach((id) => {
            if (!localAll[id] || (cloudMap[id].updatedAt || 0) > (localAll[id].updatedAt || 0)) {
              localAll[id] = cloudMap[id];
              changed = true;
            }
          });
          
          if (changed) {
            saveAll(localAll);
            lastSnapshotMap = snapshotOf(localAll);
            emit("scoreschanged");
          }
        });

        if (pollTimer) clearInterval(pollTimer);
        if (!isMaintenanceMode) pollTimer = setInterval(syncToCloud, 4000);

      } else {
        localStorage.removeItem(STORAGE_KEY);
        state.currentScore = null;
        if (unsubscribeSnapshot) { unsubscribeSnapshot(); unsubscribeSnapshot = null; }
        if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
        if (!["#ejemplo", "#inicio"].includes(window.location.hash)) window.location.hash = "#inicio";
      }
    });

    return null;
  } catch (e) {
    return `Error crítico Firebase: ${e.message}`;
  }
};

export const updateAccountUI = () => {
  const loginBtn = document.getElementById("btnAccountLogin");
  const loggedBox = document.getElementById("accountLogged");
  if (!loginBtn) return;
  const user = state.currentUser;

  if (user) {
    loginBtn.hidden = true;
    loggedBox.hidden = false;
    document.getElementById("acctEmail").textContent = user.displayName || user.email || "";
    const avatar = document.getElementById("acctAvatar");
    if (user.photoURL) {
      avatar.style.backgroundImage = `url(${user.photoURL})`;
      avatar.textContent = "";
    } else {
      avatar.style.backgroundImage = "none";
      avatar.textContent = (user.displayName || user.email || "?").charAt(0).toUpperCase();
    }
  } else {
    loginBtn.hidden = false;
    loggedBox.hidden = true;
  }
};

export const translateFirebaseError = (err) => {
  const map = {
    "auth/invalid-email": state.lang === "es" ? "Email no válido." : "Invalid email.",
    "auth/user-not-found": state.lang === "es" ? "Cuenta no encontrada." : "No account found.",
    "auth/wrong-password": state.lang === "es" ? "Contraseña incorrecta." : "Wrong password.",
    "auth/email-already-in-use": state.lang === "es" ? "Email en uso." : "Email in use.",
    "auth/weak-password": state.lang === "es" ? "La contraseña es muy débil." : "Weak password.",
    "auth/requires-recent-login": t("reauthNeeded")
  };
  return map[err?.code] || t("genericError");
};

export const processProfileImage = (file, callback) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 150; canvas.height = 150;
      const ctx = canvas.getContext("2d");
      const minSize = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - minSize) / 2, (img.height - minSize) / 2, minSize, minSize, 0, 0, 150, 150);
      callback(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

export const refreshLangTexts = () => {
  const tabLogin = document.getElementById("authTabLogin");
  if (!tabLogin) return;
  const loginLabel = document.getElementById("acctLoginLabel");
  if (loginLabel && !state.currentUser) loginLabel.textContent = t("account");

  const subtitle = document.getElementById("authSubtitle");
  const submitBtn = document.getElementById("authSubmitBtn");
  if (subtitle) subtitle.textContent = tabLogin.classList.contains("is-active") ? t("subtitleLogin") : t("subtitleRegister");
  if (submitBtn) submitBtn.textContent = tabLogin.classList.contains("is-active") ? t("login") : t("register");

  tabLogin.textContent = t("login");
  document.getElementById("authTabRegister").textContent = t("register");
};

export const setupAuthUI = () => {
  const overlay = document.getElementById("authModalOverlay");
  if (!overlay) return;

  document.getElementById("btnAccountLogin").addEventListener("click", () => {
    overlay.hidden = false;
    document.getElementById("authError").hidden = true;
    setTimeout(() => document.getElementById("authEmail").focus(), 50);
  });

  document.getElementById("authModalClose").addEventListener("click", () => overlay.hidden = true);

  ["authTabLogin", "authTabRegister"].forEach((id) => {
    document.getElementById(id).addEventListener("click", (e) => {
      document.getElementById("authTabLogin").classList.remove("is-active");
      document.getElementById("authTabRegister").classList.remove("is-active");
      e.target.classList.add("is-active");
      refreshLangTexts();
      document.getElementById("authError").hidden = true;
    });
  });

  document.getElementById("authForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const errBox = document.getElementById("authError");
    errBox.hidden = true;
    if (!auth) { errBox.hidden = false; errBox.textContent = "Error crítico."; return; }
    
    const isReg = document.getElementById("authTabRegister").classList.contains("is-active");
    const email = document.getElementById("authEmail").value;
    const pass = document.getElementById("authPassword").value;
    
    const promise = isReg ? auth.createUserWithEmailAndPassword(email, pass) : auth.signInWithEmailAndPassword(email, pass);
    promise.then(() => overlay.hidden = true).catch(err => { errBox.hidden = false; errBox.textContent = translateFirebaseError(err); });
  });

  document.getElementById("authGoogleBtn").addEventListener("click", () => {
    const errBox = document.getElementById("authError");
    errBox.hidden = true;
    if (!auth) return;
    auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(() => overlay.hidden = true)
      .catch(err => { errBox.hidden = false; errBox.textContent = translateFirebaseError(err); });
  });
};

export const setupProfileUI = () => {
  const overlay = document.getElementById("profileModalOverlay");
  if (!overlay) return;

  document.getElementById("accountLogged").addEventListener("click", () => {
    const user = state.currentUser;
    overlay.hidden = false;
    document.getElementById("profNameTitle").textContent = user.displayName || t("account");
    document.getElementById("profEmailText").textContent = user.email || "";
    document.getElementById("profDisplayName").value = user.displayName || "";

    const avatar = document.getElementById("profAvatarLg");
    if (user.photoURL) {
      avatar.style.backgroundImage = `url(${user.photoURL})`;
      avatar.textContent = "";
    } else {
      avatar.style.backgroundImage = "none";
      avatar.textContent = (user.displayName || user.email || "?").charAt(0).toUpperCase();
    }
  });

  document.getElementById("profileModalClose").addEventListener("click", () => overlay.hidden = true);
  document.getElementById("btnAccountLogout").addEventListener("click", () => { auth?.signOut(); overlay.hidden = true; });

  document.getElementById("profileForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    
    const updates = { displayName: document.getElementById("profDisplayName").value };
    const fileInput = document.getElementById("profPhotoFile");

    const apply = () => {
      state.currentUser.updateProfile(updates)
        .then(() => { updateAccountUI(); overlay.hidden = true; btn.disabled = false; })
        .catch((err) => { showToast(translateFirebaseError(err), 'error'); btn.disabled = false; });
    };

    if (fileInput.files.length > 0) {
      processProfileImage(fileInput.files[0], (base64Url) => { updates.photoURL = base64Url; apply(); });
    } else {
      apply();
    }
  });

  document.getElementById("btnDeleteAccount")?.addEventListener("click", async () => {
    if (confirm(t("deleteWarning"))) {
      try {
        const user = firebase.auth().currentUser;
        if (user) {
          const db = firebase.firestore();
          const publicScores = await db.collection("public_scores").where("publisherUid", "==", user.uid).get();
          const batch = db.batch();
          publicScores.forEach(doc => {
            batch.update(doc.ref, { publisherName: "usuario eliminado", publisherUid: "deleted" });
          });
          await batch.commit();
          
          await user.delete();
          localStorage.clear();
          window.location.reload();
        }
      } catch (err) {
        if (err.code === 'auth/requires-recent-login') {
          alert(t("reauthNeeded"));
          firebase.auth().signOut();
        } else {
          alert(t("genericError"));
        }
      }
    }
  });
};

on("langchange", refreshLangTexts);