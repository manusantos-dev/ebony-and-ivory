import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { FIREBASE_CONFIG, STORAGE_KEY } from './core/config.js';
import { state } from "./core/state";
import { t } from "./ui/i18n.js";
import { loadAll, saveAll } from "./core/storage";
import { emit, on } from "./core/events";
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

// SYNC: Two-way cloud synchronization logic
const syncToCloud = () => {
  if (isMaintenanceMode || !state.currentUser || !db) return;

  let all;
  try {
    all = loadAll();
    // FIX: Guard clause to prevent mass cloud deletion if local storage fails to parse
    if (Object.keys(all).length === 0 && Object.keys(lastSnapshotMap).length > 0) {
      if (localStorage.getItem(STORAGE_KEY)) {
         console.warn("Sync aborted: Local data present but unreadable. Preventing cloud wipe.");
         return;
      }
    }
  } catch (e) {
    return;
  }

  const coll = db.collection("users").doc(state.currentUser.uid).collection("scores");
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
    }).catch((err) => {
       console.error("Cloud batch commit failed:", err);
       showSynced();
    });
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
      // INIT: Set global state immediately
      state.currentUser = user;
      updateAccountUI();
      emit("authchange", user);

      if (user) {
        lastSnapshotMap = {};
        const coll = db.collection("users").doc(user.uid).collection("scores");

        // SYNC: Listen to cloud data and hydrate local storage
        unsubscribeSnapshot = coll.onSnapshot((snap) => {
          const cloudMap = {};
          snap.forEach((doc) => { cloudMap[doc.id] = doc.data(); });
          const localAll = loadAll();
          let changed = false;

          Object.keys(cloudMap).forEach((id) => {
            // FIX: Hydrate logic to accept cloud data if local is older or missing
            if (!localAll[id] || (cloudMap[id].updatedAt || 0) > (localAll[id].updatedAt || 0)) {
              localAll[id] = cloudMap[id];
              changed = true;
            }
          });

          if (changed) {
            saveAll(localAll);
            lastSnapshotMap = snapshotOf(localAll);
            // FIX: Emit global event to trigger UI re-renders across the app
            emit("scoreschanged");
            showToast("☁️ Catálogo sincronizado", "success");
          }
        }, (error) => {
           console.error("Firebase sync error:", error);
           showToast("Error conectando con la base de datos.", "error");
        });

        if (pollTimer) clearInterval(pollTimer);
        if (!isMaintenanceMode) pollTimer = setInterval(syncToCloud, 4000);

      } else {
        localStorage.removeItem(STORAGE_KEY);
        state.currentScore = null;
        if (unsubscribeSnapshot) { unsubscribeSnapshot(); unsubscribeSnapshot = null; }
        if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
        // FIX: Update UI immediately upon logout to show empty state
        emit("scoreschanged");
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

// I18N: Comprehensive and fuzzy Firebase error translation matching
export const translateFirebaseError = (err) => {
  const code = err?.code || "unknown";
  const isEs = state.lang === "es";

  if (code.includes("popup-closed")) return isEs ? "Inicio de sesión cancelado." : "Login cancelled.";
  if (code.includes("email-already-in-use")) return isEs ? "Este email ya está registrado." : "Email already in use.";
  if (code.includes("invalid-email")) return isEs ? "Email no válido." : "Invalid email.";
  if (code.includes("user-not-found")) return isEs ? "Cuenta no encontrada." : "No account found.";
  if (code.includes("wrong-password")) return isEs ? "Contraseña incorrecta." : "Wrong password.";
  if (code.includes("weak-password")) return isEs ? "La contraseña es muy débil." : "Weak password.";
  if (code.includes("requires-recent-login")) return isEs ? "Por seguridad, cierra sesión y vuelve a entrar." : "For security, please log out and log in again.";
  if (code.includes("different-credential")) return isEs ? "El email ya usa otro método (ej. Google)." : "Email uses a different login method.";
  if (code.includes("network")) return isEs ? "Error de conexión a internet." : "Network connection error.";
  if (code.includes("too-many-requests")) return isEs ? "Demasiados intentos. Prueba más tarde." : "Too many requests. Try again later.";

  return isEs ? `Error de acceso (${code})` : `Auth error (${code})`;
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

  // ACTIONS: Account deletion logic with pre-flight GDPR anonymization routine
  const btnDeleteAcc = document.getElementById("btnDeleteAccount");
  if (btnDeleteAcc) {
    btnDeleteAcc.addEventListener("click", async () => {
      if (await showConfirm(t("deleteAccount"), t("deleteWarning"), "Eliminar", true)) {
        try {
          const user = firebase.auth().currentUser;
          if (user) {
            const overlay = document.getElementById("profileModalOverlay");

            // UI: Show loading state to prevent double clicks during network operations
            btnDeleteAcc.disabled = true;
            btnDeleteAcc.textContent = "...";

            // FIX: Anonymize public scores before destroying identity permissions
            try {
              const snap = await db.collection("public_scores").where("publisherUid", "==", user.uid).get();
              const batch = db.batch();
              snap.forEach(doc => {
                batch.update(doc.ref, { publisherName: state.lang === 'es' ? "Usuario eliminado" : "Deleted User" });
              });
              await batch.commit();
            } catch (anonErr) {
              console.warn("Could not anonymize some public scores", anonErr);
            }

            if (unsubscribeSnapshot) {
              unsubscribeSnapshot();
              unsubscribeSnapshot = null;
            }

            await user.delete();
            showToast(state.lang === 'es' ? "Tu cuenta y tus datos han sido eliminados." : "Your account and data have been deleted.", "success");
            if (overlay) overlay.hidden = true;
          }
        } catch (error) {
          console.error("Account Deletion Error:", error);
          const reauthMsg = state.lang === 'es' ? "Por seguridad, cierra sesión y vuelve a entrar para borrar tu cuenta." : "For security, please log out and log in again to delete your account.";
          showToast(error?.code?.includes('requires-recent-login') ? reauthMsg : t("genericError"), "error");
        } finally {
          btnDeleteAcc.disabled = false;
          btnDeleteAcc.textContent = "Eliminar cuenta";
        }
      }
    });
  }
};

on("langchange", refreshLangTexts);
