/* =========================================================================
   EBONY & IVORY — firebase-sync.js
   Cuentas (email/contraseña + Google) y sincronización de la biblioteca
   con Firestore. Si firebase-config.js no tiene claves reales, la app
   sigue funcionando en modo 100% local y este módulo solo informa de
   que la nube no está activa.
   ========================================================================= */
(function () {
  "use strict";

  function whenReady(fn) {
    if (window.EI) fn(); else window.addEventListener('ei:ready', fn, { once: true });
  }

  function isConfigured() {
    const c = window.FIREBASE_CONFIG;
    return !!(c && c.apiKey && !c.apiKey.startsWith('PEGA_'));
  }

  whenReady(init);

  function init() {
    const EI = window.EI;
    const configured = isConfigured() && typeof firebase !== 'undefined';

    /* ----------------------------- DOM ----------------------------- */
    const btnAccountLogin = document.getElementById('btnAccountLogin');
    const accountLogged = document.getElementById('accountLogged');
    const acctAvatar = document.getElementById('acctAvatar');
    const acctEmail = document.getElementById('acctEmail');
    const acctLoginLabel = document.getElementById('acctLoginLabel');
    const btnAccountLogout = document.getElementById('btnAccountLogout');

    const overlay = document.getElementById('authModalOverlay');
    const modalClose = document.getElementById('authModalClose');
    const tabLogin = document.getElementById('authTabLogin');
    const tabRegister = document.getElementById('authTabRegister');
    const subtitle = document.getElementById('authSubtitle');
    const form = document.getElementById('authForm');
    const emailInput = document.getElementById('authEmail');
    const passwordInput = document.getElementById('authPassword');
    const errorBox = document.getElementById('authError');
    const submitBtn = document.getElementById('authSubmitBtn');
    const googleBtn = document.getElementById('authGoogleBtn');
    const configHint = document.getElementById('authConfigHint');

    const STR = {
      es: {
        account: 'Cuenta', login: 'Iniciar sesión', register: 'Crear cuenta',
        subtitleLogin: 'Guarda tus partituras en la nube y ábrelas desde cualquier dispositivo.',
        subtitleRegister: 'Crea una cuenta gratuita para sincronizar tus partituras.',
        logout: 'Cerrar sesión', google: 'Continuar con Google', notConfigured: 'La nube no está configurada todavía.',
        genericError: 'Algo no ha ido bien. Revisa tus datos e inténtalo de nuevo.'
      },
      en: {
        account: 'Account', login: 'Sign in', register: 'Create account',
        subtitleLogin: 'Save your scores to the cloud and open them on any device.',
        subtitleRegister: 'Create a free account to sync your scores.',
        logout: 'Sign out', google: 'Continue with Google', notConfigured: 'Cloud sync is not configured yet.',
        genericError: 'Something went wrong. Check your details and try again.'
      }
    };
    function s(key) { const lang = EI.getLang(); return (STR[lang] || STR.en)[key] || key; }

    /* ----------------------------- Firebase init ----------------------------- */
    let auth = null, db = null;
    if (configured) {
      try {
        firebase.initializeApp(window.FIREBASE_CONFIG);
        auth = firebase.auth();
        db = firebase.firestore();
      } catch (e) {
        console.warn('No se pudo inicializar Firebase:', e);
      }
    } else {
      console.info('Ebony & Ivory: la nube no está configurada (ver firebase-config.js). La app funciona en modo local.');
    }

    let currentUser = null;
    let unsubscribeSnapshot = null;
    let pollTimer = null;
    let lastSnapshotMap = {};

    /* ----------------------------- UI: widget de cuenta ----------------------------- */
    if (acctLoginLabel) acctLoginLabel.textContent = s('account');

    function refreshLangTexts() {
      if (acctLoginLabel && !currentUser) acctLoginLabel.textContent = s('account');
      if (subtitle) subtitle.textContent = tabLogin.classList.contains('is-active') ? s('subtitleLogin') : s('subtitleRegister');
      if (submitBtn) submitBtn.textContent = tabLogin.classList.contains('is-active') ? s('login') : s('register');
      tabLogin.textContent = s('login'); tabRegister.textContent = s('register');
      googleBtn.lastChild.textContent = ' ' + s('google');
      if (btnAccountLogout) btnAccountLogout.title = s('logout');
      if (configHint) configHint.hidden = configured;
      if (configHint) configHint.textContent = configured ? '' : ('⚠️ ' + s('notConfigured') + ' (firebase-config.js)');
    }
    document.querySelectorAll('.lang-btn').forEach((b) => b.addEventListener('click', () => setTimeout(refreshLangTexts, 0)));
    refreshLangTexts();

    function updateAccountUI() {
      if (currentUser) {
        btnAccountLogin.hidden = true;
        accountLogged.hidden = false;
        acctEmail.textContent = currentUser.email || currentUser.displayName || '';
        acctAvatar.textContent = (currentUser.email || currentUser.displayName || '?').charAt(0).toUpperCase();
        if (currentUser.photoURL) {
          acctAvatar.style.backgroundImage = 'url(' + currentUser.photoURL + ')';
          acctAvatar.textContent = '';
        } else {
          acctAvatar.style.backgroundImage = '';
        }
      } else {
        btnAccountLogin.hidden = false;
        accountLogged.hidden = true;
      }
    }

    btnAccountLogin.addEventListener('click', () => openModal());
    btnAccountLogout.addEventListener('click', () => { if (auth) auth.signOut(); });

    function openModal() {
      overlay.hidden = false;
      errorBox.hidden = true;
      if (!configured) { configHint.hidden = false; }
      setTimeout(() => emailInput.focus(), 50);
    }
    function closeModal() { overlay.hidden = true; form.reset(); errorBox.hidden = true; }
    modalClose.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) closeModal(); });

    [tabLogin, tabRegister].forEach((tab) => {
      tab.addEventListener('click', () => {
        [tabLogin, tabRegister].forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        refreshLangTexts();
        errorBox.hidden = true;
      });
    });

    function showError(err) {
      errorBox.hidden = false;
      errorBox.textContent = translateFirebaseError(err);
    }
    function translateFirebaseError(err) {
      const code = err && err.code;
      const map = {
        'auth/invalid-email': EI.getLang() === 'es' ? 'Email no válido.' : 'Invalid email.',
        'auth/user-not-found': EI.getLang() === 'es' ? 'No existe ninguna cuenta con ese email.' : 'No account found with that email.',
        'auth/wrong-password': EI.getLang() === 'es' ? 'Contraseña incorrecta.' : 'Wrong password.',
        'auth/email-already-in-use': EI.getLang() === 'es' ? 'Ya existe una cuenta con ese email.' : 'An account already exists with that email.',
        'auth/weak-password': EI.getLang() === 'es' ? 'La contraseña debe tener al menos 6 caracteres.' : 'Password must be at least 6 characters.',
        'auth/popup-closed-by-user': EI.getLang() === 'es' ? 'Ventana de Google cerrada antes de terminar.' : 'Google popup closed before finishing.',
        'auth/invalid-api-key': s('notConfigured'),
      };
      return map[code] || s('genericError');
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!configured || !auth) { showError({}); configHint.hidden = false; return; }
      errorBox.hidden = true;
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const isRegister = tabRegister.classList.contains('is-active');
      submitBtn.disabled = true;
      const action = isRegister
        ? auth.createUserWithEmailAndPassword(email, password)
        : auth.signInWithEmailAndPassword(email, password);
      action.then(() => { closeModal(); }).catch(showError).finally(() => { submitBtn.disabled = false; });
    });

    googleBtn.addEventListener('click', () => {
      if (!configured || !auth) { showError({}); configHint.hidden = false; return; }
      errorBox.hidden = true;
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider).then(() => { closeModal(); }).catch(showError);
    });

    /* ----------------------------- Sincronización ----------------------------- */
    function snapshotOf(map) {
      const out = {};
      Object.keys(map).forEach((id) => { out[id] = map[id].updatedAt || 0; });
      return out;
    }

    function pushDiffToCloud(uid) {
      if (!db) return;
      const all = EI.loadAllScores();
      const prev = lastSnapshotMap;
      const coll = db.collection('users').doc(uid).collection('scores');
      const batch = db.batch();
      let writes = 0;

      Object.keys(all).forEach((id) => {
        const score = all[id];
        if (!prev[id] || prev[id] !== (score.updatedAt || 0)) {
          batch.set(coll.doc(id), score);
          writes++;
        }
      });
      Object.keys(prev).forEach((id) => {
        if (!all[id]) { batch.delete(coll.doc(id)); writes++; }
      });

      lastSnapshotMap = snapshotOf(all);
      if (writes > 0) {
        batch.commit().catch((err) => console.warn('Error al sincronizar con la nube:', err));
      }
    }

    function handlePull(uid, snap) {
      const cloudMap = {};
      snap.forEach((doc) => { cloudMap[doc.id] = doc.data(); });
      const localAll = EI.loadAllScores();
      let changed = false;

      Object.keys(cloudMap).forEach((id) => {
        const cloudScore = cloudMap[id];
        const localScore = localAll[id];
        if (!localScore || (cloudScore.updatedAt || 0) > (localScore.updatedAt || 0)) {
          localAll[id] = cloudScore;
          changed = true;
        }
      });

      if (changed) {
        EI.saveAllScores(localAll);
        lastSnapshotMap = snapshotOf(localAll);
        EI.renderLibrary();
      }
    }

    function startSync(uid) {
      lastSnapshotMap = {}; // primer ciclo: subir todo lo local que aún no esté en la nube
      const coll = db.collection('users').doc(uid).collection('scores');
      unsubscribeSnapshot = coll.onSnapshot(
        (snap) => handlePull(uid, snap),
        (err) => console.warn('Error de sincronización (lectura):', err)
      );
      pollTimer = setInterval(() => pushDiffToCloud(uid), 4000);
      pushDiffToCloud(uid);
    }

    function stopSync() {
      if (unsubscribeSnapshot) { unsubscribeSnapshot(); unsubscribeSnapshot = null; }
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
      lastSnapshotMap = {};
    }

    /* ----------------------------- Estado de autenticación ----------------------------- */
    if (auth) {
      auth.onAuthStateChanged((user) => {
        currentUser = user;
        updateAccountUI();
        refreshLangTexts();
        if (user) startSync(user.uid); else stopSync();
      });
    } else {
      updateAccountUI();
    }
  }
})();
