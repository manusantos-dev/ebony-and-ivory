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
let firebaseInitError = null;

function snapshotOf(map) {
  const out = {};
  Object.keys(map).forEach((id) => { out[id] = map[id].updatedAt || 0; });
  return out;
}

function syncToCloud() {
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
    }).catch(() => showSynced());
  }
}

export function initFirebase() {
  try {
    if (typeof firebase === "undefined") {
      firebaseInitError = "El navegador está bloqueando la conexión. Desactiva tu AdBlocker para iniciar sesión.";
      return firebaseInitError;
    }
    if (!FIREBASE_CONFIG.apiKey || FIREBASE_CONFIG.apiKey.startsWith("PEGA_")) {
      firebaseInitError = "La nube no está configurada. Faltan las claves en config.js.";
      return firebaseInitError;
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
        if (!isMaintenanceMode) {
           pollTimer = setInterval(syncToCloud, 4000);
        }

      } else {
        localStorage.removeItem(STORAGE_KEY);
        state.currentScore = null;
        if (unsubscribeSnapshot) { unsubscribeSnapshot(); unsubscribeSnapshot = null; }
        if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
        if (window.location.hash !== "#ejemplo" && window.location.hash !== "#inicio") {
          window.location.hash = "#inicio";
        }
      }
    });

    return null;
  } catch (e) {
    firebaseInitError = "Error crítico de Firebase: " + e.message;
    return firebaseInitError;
  }
}

export function updateAccountUI() {
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
}

export function translateFirebaseError(err) {
  const code = err && err.code;
  const isEs = state.lang === "es";
  const map = {
    "auth/invalid-email": isEs ? "Email no válido." : "Invalid email.",
    "auth/user-not-found": isEs ? "No existe ninguna cuenta con este email." : "No account found.",
    "auth/wrong-password": isEs ? "Contraseña incorrecta." : "Wrong password.",
    "auth/email-already-in-use": isEs ? "Ya existe una cuenta con este email." : "Email already in use.",
    "auth/weak-password": isEs ? "La contraseña debe tener al menos 6 caracteres." : "Password must be 6 characters.",
    "auth/popup-closed-by-user": isEs ? "Ventana de Google cerrada antes de terminar." : "Popup closed.",
    "auth/requires-recent-login": t("reauthNeeded")
  };
  return map[code] || t("genericError");
}

export function processProfileImage(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const SIZE = 150;
      const canvas = document.createElement("canvas");
      canvas.width = SIZE; canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      const minSize = Math.min(img.width, img.height);
      const x = (img.width - minSize) / 2;
      const y = (img.height - minSize) / 2;
      ctx.drawImage(img, x, y, minSize, minSize, 0, 0, SIZE, SIZE);
      callback(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

export function refreshLangTexts() {
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

  const googleBtn = document.getElementById("authGoogleBtn");
  if (googleBtn && googleBtn.lastChild) googleBtn.lastChild.textContent = " " + t("google");
}

export function setupAuthUI() {
  const authOverlay = document.getElementById("authModalOverlay");
  if (!authOverlay) return;

  const btnLogin = document.getElementById("btnAccountLogin");
  btnLogin.addEventListener("click", () => {
    authOverlay.hidden = false;
    document.getElementById("authError").hidden = true;
    setTimeout(() => document.getElementById("authEmail").focus(), 50);
  });

  document.getElementById("authModalClose").addEventListener("click", () => { authOverlay.hidden = true; });

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
    if (!auth) { errBox.hidden = false; errBox.textContent = firebaseInitError || "Error crítico."; return; }
    const isReg = document.getElementById("authTabRegister").classList.contains("is-active");
    const email = document.getElementById("authEmail").value;
    const password = document.getElementById("authPassword").value;
    const promise = isReg ? auth.createUserWithEmailAndPassword(email, password) : auth.signInWithEmailAndPassword(email, password);
    promise.then(() => { authOverlay.hidden = true; }).catch((err) => { errBox.hidden = false; errBox.textContent = translateFirebaseError(err); });
  });

  document.getElementById("authGoogleBtn").addEventListener("click", () => {
    const errBox = document.getElementById("authError");
    errBox.hidden = true;
    if (!auth) { errBox.hidden = false; errBox.textContent = firebaseInitError || "Error crítico."; return; }
    auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(() => { authOverlay.hidden = true; })
      .catch((err) => { errBox.hidden = false; errBox.textContent = translateFirebaseError(err); });
  });
}

export function setupProfileUI() {
  const profOverlay = document.getElementById("profileModalOverlay");
  if (!profOverlay) return;

  document.getElementById("accountLogged").addEventListener("click", () => {
    const user = state.currentUser;
    profOverlay.hidden = false;
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

  document.getElementById("profileModalClose").addEventListener("click", () => { profOverlay.hidden = true; });

  document.getElementById("btnAccountLogout").addEventListener("click", () => {
    if (auth) auth.signOut();
    profOverlay.hidden = true;
  });

  document.getElementById("profileForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    const updates = { displayName: document.getElementById("profDisplayName").value };
    const fileInput = document.getElementById("profPhotoFile");

    const apply = () => {
      state.currentUser.updateProfile(updates)
        .then(() => { updateAccountUI(); profOverlay.hidden = true; btn.disabled = false; })
        .catch((err) => { showToast(translateFirebaseError(err), 'error'); btn.disabled = false; });
    };

    if (fileInput.files.length > 0) {
      processProfileImage(fileInput.files[0], (base64Url) => { updates.photoURL = base64Url; apply(); });
    } else {
      apply();
    }
  });

  document.getElementById("btnDeleteAccount").addEventListener("click", async () => {
    const isConfirmed = await showConfirm("Eliminar cuenta", "Se borrarán permanentemente todos tus datos y partituras de la nube.", "Eliminar cuenta", true);
    if (!isConfirmed) return;
    try {
      if (db) {
        const docs = await db.collection("users").doc(state.currentUser.uid).collection("scores").get();
        const batch = db.batch();
        docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
      await state.currentUser.delete();
      profOverlay.hidden = true;
      localStorage.removeItem(STORAGE_KEY);
      window.location.hash = "#inicio";
    } catch (err) {
      showToast(translateFirebaseError(err), 'error');
    }
  });
}

on("langchange", refreshLangTexts);