/* =========================================================================
   EBONY & IVORY — app.js
   ========================================================================= */
(function () {
  "use strict";

  /* ----------------------------- Textos e Idiomas ----------------------------- */
  const translations = {
    es: {
      importBtn: "Importar .json", newScoreBtn: "+ Nueva partitura", backBtn: "← Volver al Catálogo",
      exportJsonBtn: "Descargar .json", exportPdfBtn: "Exportar PDF", savedIndicator: "Guardado ✓",
      heroTitle: "El arte de preservar la música",
      heroSub: "Un lienzo digital estandarizado para transcribir, reproducir, clasificar y eternizar tus partituras con una elegancia inigualable.",
      goToCatalog: "Abrir mi Catálogo", viewExample: "Ver partitura de ejemplo", catalogTitle: "Catálogo de Partituras",
      searchPlaceholder: "Buscar por título, autor o E&I...", filterBtn: "Filtros ⧨",
      sortNumAsc: "Número (E&I asc.)", sortNumDesc: "Número (E&I desc.)", sortDateDesc: "Última edición (Reciente)", 
      sortDateAsc: "Última edición (Antigua)", sortTitleAsc: "Título (A-Z)", sortAuthorAsc: "Autor (A-Z)",
      lblHands: "Manos / Pentagramas", optAll: "Cualquiera", optBothHands: "Ambas manos", optTrebleOnly: "Solo mano derecha", optBassOnly: "Solo mano izquierda",
      emptyLibraryTitle: "Tu catálogo está vacío (o sin resultados)",
      emptyLibrary: "Pulsa «Nueva partitura» en la esquina superior derecha o cambia los filtros de búsqueda.",
      lblTitle: "Título", lblComposer: "Compositor / origen", lblTimeSig: "Compás", lblKeySig: "Tonalidad",
      lblActiveMeasure: "Compás activo", btnPrev: "‹ anterior", btnNext: "siguiente ›",
      btnAddMeasure: "+ añadir compás", btnDelMeasure: "eliminar compás", lblInputStaff: "Pentagrama de entrada",
      lblTreble: "Clave de Sol", lblBass: "Clave de Fa", lblNote: "Nota", lblRest: "Silencio",
      lblPitch: "Nota", lblAccidental: "Alteración", lblOctave: "Octava", lblDuration: "Duración",
      lblDotted: "Con puntillo", lblDynamics: "Dinámica", btnAddNote: "Añadir al compás", btnUndoNote: "Deshacer última nota",
      lblMeasureDetails: "Compás · Detalles", lblRepStart: "Inicio repetición ‖:", lblRepEnd: "Fin repetición :‖</",
      lblDirective: "Indicación (Fine, D.C.)", lblTempo: "Tempo (BPM)",
      footerText: "Ebony & Ivory es una herramienta personal para transcribir y archivar partituras. Las obras que reescribas siguen perteneciendo a sus autores originales.",
      untitled: "Sin título", unknownAuthor: "Autor desconocido", measuresTxt: "compases",
      editBtn: "✎ Editar", viewBtn: "👁 Ver", copyBtn: "⎘ Copiar", deleteBtn: "🗑️ Borrar",
      delConfirm: "¿Eliminar partitura? No se puede deshacer.", delMeasureConfirm: "¿Eliminar este compás?",
      copySuffix: "(copia)", minMeasureAlert: "La partitura necesita al menos un compás.",
      toggleViewBtn: "Alternar Visor", optKeyAll: "Cualquiera", account: 'Cuenta', login: 'Iniciar sesión', register: 'Crear cuenta',
      subtitleLogin: 'Guarda tus partituras en la nube y ábrelas desde cualquier dispositivo.',
      subtitleRegister: 'Crea una cuenta gratuita para sincronizar tus partituras.',
      logout: 'Cerrar sesión', google: 'Continuar con Google', genericError: 'Algo falló. Revisa tus datos e inténtalo de nuevo.',
      lblPassword: 'Contraseña', displayName: 'Nombre / Nickname', photoUrl: 'URL de la foto (Opcional)', saveProfile: 'Guardar Cambios',
      deleteAccount: 'Eliminar mi cuenta', deleteWarning: 'Esta acción borrará todas tus partituras de la nube permanentemente. ¿Estás seguro?',
      reauthNeeded: 'Por seguridad, cierra sesión y vuelve a entrar con Google o tu contraseña antes de eliminar tu cuenta.'
    },
    en: {
      importBtn: "Import .json", newScoreBtn: "+ New Score", backBtn: "← Back to Catalog",
      exportJsonBtn: "Download .json", exportPdfBtn: "Export PDF", savedIndicator: "Saved ✓",
      heroTitle: "The art of preserving music",
      heroSub: "A standardized digital canvas to transcribe, play, classify, and immortalize your sheet music with unmatched elegance.",
      goToCatalog: "Open my Catalog", viewExample: "View example score", catalogTitle: "Sheet Music Catalog",
      searchPlaceholder: "Search by title, author or E&I...", filterBtn: "Filters ⧨",
      sortNumAsc: "Number (E&I asc.)", sortNumDesc: "Number (E&I desc.)", sortDateDesc: "Last edited (Newest)", 
      sortDateAsc: "Last edited (Oldest)", sortTitleAsc: "Title (A-Z)", sortAuthorAsc: "Author (A-Z)",
      lblHands: "Hands / Staves", optAll: "Any", optBothHands: "Both hands", optTrebleOnly: "Right hand only", optBassOnly: "Left hand only",
      emptyLibraryTitle: "Your catalog is empty (or no results)",
      emptyLibrary: "Click «New Score» in the top right corner or change your search filters.",
      lblTitle: "Title", lblComposer: "Composer / origin", lblTimeSig: "Time Sig.", lblKeySig: "Key Sig.",
      lblActiveMeasure: "Active Measure", btnPrev: "‹ previous", btnNext: "next ›",
      btnAddMeasure: "+ add measure", btnDelMeasure: "delete measure", lblInputStaff: "Input Staff",
      lblTreble: "Treble Clef", lblBass: "Bass Clef", lblNote: "Note", lblRest: "Rest",
      lblPitch: "Pitch", lblAccidental: "Accidental", lblOctave: "Octave", lblDuration: "Duration",
      lblDotted: "Dotted", lblDynamics: "Dynamics", btnAddNote: "Add to measure", btnUndoNote: "Undo last note",
      lblMeasureDetails: "Measure · Details", lblRepStart: "Start repeat ‖:", lblRepEnd: "End repeat :‖</",
      lblDirective: "Directive (Fine, D.C.)", lblTempo: "Tempo (BPM)",
      footerText: "Ebony & Ivory is a personal tool for transcribing and archiving sheet music. Rewritten works still belong to their original authors.",
      untitled: "Untitled", unknownAuthor: "Unknown author", measuresTxt: "measures",
      editBtn: "✎ Edit", viewBtn: "👁 View", copyBtn: "⎘ Copy", deleteBtn: "🗑️ Delete",
      delConfirm: "Delete this score? This cannot be undone.", delMeasureConfirm: "Delete this measure?",
      copySuffix: "(copy)", minMeasureAlert: "The score needs at least one measure.",
      toggleViewBtn: "Toggle Viewer", optKeyAll: "Any", account: 'Account', login: 'Sign in', register: 'Create account',
      subtitleLogin: 'Save your scores to the cloud and open them on any device.',
      subtitleRegister: 'Create a free account to sync your scores.',
      logout: 'Sign out', google: 'Continue with Google', genericError: 'Something went wrong. Check your details and try again.',
      lblPassword: 'Password', displayName: 'Display Name', photoUrl: 'Photo URL (Optional)', saveProfile: 'Save Changes',
      deleteAccount: 'Delete my account', deleteWarning: 'This will permanently delete all your scores from the cloud. Are you sure?',
      reauthNeeded: 'For security, please sign out and sign in again before deleting your account.'
    }
  };

  const keysDB = [
    { val: "C", us: "C / Am", eu: "Do / La m" }, { val: "G", us: "G / Em", eu: "Sol / Mi m" },
    { val: "D", us: "D / Bm", eu: "Re / Si m" }, { val: "A", us: "A / F#m", eu: "La / Fa# m" },
    { val: "E", us: "E / C#m", eu: "Mi / Do# m" }, { val: "B", us: "B / G#m", eu: "Si / Sol# m" },
    { val: "F", us: "F / Dm", eu: "Fa / Re m" }, { val: "Bb", us: "Bb / Gm", eu: "Sib / Sol m" },
    { val: "Eb", us: "Eb / Cm", eu: "Mib / Do m" }, { val: "Ab", us: "Ab / Fm", eu: "Lab / Fa m" }
  ];

  /* ----------------------------- Motor Principal & i18n ----------------------------- */
  let currentLang = "en", currentScore = null;     
  let editorState = { activeMeasure: 0, activeStaff: "treble", duration: "q", dotted: false };
  let libraryState = { query: "", sortBy: "numAsc", filterTime: "all", filterKey: "all", filterHands: "all" };
  let saveTimeout = null;

  window.EI = {};
  window.EI.setLang = function(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = Array.from(document.querySelectorAll('.lang-btn')).find(btn => btn.textContent.toLowerCase() === lang);
    if(activeBtn) activeBtn.classList.add('active');
    
    document.querySelectorAll('[data-i18n]').forEach(el => { const key = el.getAttribute('data-i18n'); if (translations[lang][key]) el.innerHTML = translations[lang][key]; });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { const key = el.getAttribute('data-i18n-placeholder'); if (translations[lang][key]) el.setAttribute('placeholder', translations[lang][key]); });
    
    refreshLangTexts(); renderCustomSelects(); 
    if (document.getElementById("viewLibrary") && !document.getElementById("viewLibrary").hidden) renderLibrary();
    if (document.getElementById("viewEditor") && !document.getElementById("viewEditor").hidden) renderScore();
  };

  function t(key) { return translations[currentLang][key] || key; }

  function refreshLangTexts() {
    const tabLogin = document.getElementById('authTabLogin'); if(!tabLogin) return;
    if(document.getElementById('acctLoginLabel') && !currentUser) document.getElementById('acctLoginLabel').textContent = t('account');
    if(document.getElementById('authSubtitle')) document.getElementById('authSubtitle').textContent = tabLogin.classList.contains('is-active') ? t('subtitleLogin') : t('subtitleRegister');
    if(document.getElementById('authSubmitBtn')) document.getElementById('authSubmitBtn').textContent = tabLogin.classList.contains('is-active') ? t('login') : t('register');
    tabLogin.textContent = t('login'); document.getElementById('authTabRegister').textContent = t('register');
    if(document.getElementById('authGoogleBtn') && document.getElementById('authGoogleBtn').lastChild) document.getElementById('authGoogleBtn').lastChild.textContent = ' ' + t('google');
    if(document.getElementById('btnAccountLogout')) document.getElementById('btnAccountLogout').title = t('logout');
  }

  function renderCustomSelects() {
    const buildOptions = (isFilter) => {
        let html = isFilter ? `<div data-val="all"><span>${t('optKeyAll')}</span></div>` : '';
        keysDB.forEach(k => { html += `<div data-val="${k.val}"><span>${currentLang === 'es' ? k.eu : k.us}</span><span class="translucent">${currentLang === 'es' ? k.us : k.eu}</span></div>`; }); 
        return html;
    };
    if(document.getElementById('customKeySigOptions')) {
      document.getElementById('customKeySigOptions').innerHTML = buildOptions(false); updateCustomSelectUI('customKeySig', document.getElementById('keySig').value);
      document.getElementById('customFilterKeyOptions').innerHTML = buildOptions(true); updateCustomSelectUI('customFilterKeySig', document.getElementById('filterKeySig').value);
    }
  }

  function setupCustomSelect(wrapperId, inputId, isFilter) {
      const wrapper = document.getElementById(wrapperId); if(!wrapper) return;
      const selected = wrapper.querySelector('.select-selected'); const options = wrapper.querySelector('.select-items'); const hiddenInput = document.getElementById(inputId);
      selected.addEventListener('click', (e) => { e.stopPropagation(); wrapper.classList.toggle('active'); });
      options.addEventListener('click', (e) => {
          const item = e.target.closest('div');
          if (item && item.hasAttribute('data-val')) {
              const val = item.getAttribute('data-val'); hiddenInput.value = val; updateCustomSelectUI(wrapperId, val); wrapper.classList.remove('active');
              if (isFilter) { libraryState.filterKey = val; renderLibrary(); } else if (currentScore) { currentScore.keySig = val; renderScore(); }
          }
      });
  }

  function updateCustomSelectUI(wrapperId, val) {
      const wrapper = document.getElementById(wrapperId); if(!wrapper) return;
      const option = wrapper.querySelector(`.select-items div[data-val="${val}"]`);
      if (option) { wrapper.querySelector('.select-selected').innerHTML = option.innerHTML; document.getElementById(wrapperId === 'customKeySig' ? 'keySig' : 'filterKeySig').value = val; }
  }

  setupCustomSelect('customKeySig', 'keySig', false); setupCustomSelect('customFilterKeySig', 'filterKeySig', true);
  document.addEventListener('click', () => document.querySelectorAll('.custom-select').forEach(el => el.classList.remove('active')));

  /* ----------------------------- Partitura de Ejemplo (Beethoven N.º 9 EXACTA) ----------------------------- */
  function getExampleScore(lang) {
    const isEs = lang === 'es';
    const note = (l, o, d, dot) => ({ rest: false, letter: l, accidental: '', octave: o, duration: d, dotted: !!dot, dynamic: '' });
    const measure = (t, b, e) => Object.assign({ treble: t, bass: b, repeatStart: false, repeatEnd: false, directive: '' }, e || {});
    
    const m1 = () => [note('E',4,'q'), note('E',4,'q'), note('F',4,'q'), note('G',4,'q')];
    const m2 = () => [note('G',4,'q'), note('F',4,'q'), note('E',4,'q'), note('D',4,'q')];
    const m3 = () => [note('C',4,'q'), note('C',4,'q'), note('D',4,'q'), note('E',4,'q')];
    const m4 = () => [note('E',4,'q',true), note('D',4,'8'), note('D',4,'h')];
    const m8 = () => [note('D',4,'q',true), note('C',4,'8'), note('C',4,'h')];
    
    const m9 = () => [note('D',4,'q'), note('D',4,'q'), note('E',4,'q'), note('C',4,'q')];
    const m10 = () => [note('D',4,'q'), note('E',4,'8'), note('F',4,'8'), note('E',4,'q'), note('C',4,'q')];
    const m11 = () => [note('D',4,'q'), note('E',4,'8'), note('F',4,'8'), note('E',4,'q'), note('D',4,'q')];
    const m12 = () => [note('C',4,'q'), note('D',4,'q'), note('G',3,'h')];
    
    const bR = (l, o) => [note(l, o, 'w')];

    return {
      id: 'example-ode-to-joy', isExample: true, plate: 0,
      title: isEs ? 'Oda a la Alegría' : 'Ode to Joy',
      composer: 'Ludwig van Beethoven', timeSig: '4/4', keySig: 'C', bpm: 100,
      measures: [ 
        measure(m1(), bR('C',3), {repeatStart:true}), measure(m2(), bR('G',2)), measure(m3(), bR('C',3)), measure(m4(), bR('G',2)), 
        measure(m1(), bR('C',3)), measure(m2(), bR('G',2)), measure(m3(), bR('C',3)), measure(m8(), bR('G',2), {directive:'Fine'}),
        measure(m9(), bR('G',2)), measure(m10(), bR('G',2)), measure(m11(), bR('G',2)), measure(m12(), bR('G',2), {directive:'D.C. al Fine'}) 
      ],
      createdAt: 0, updatedAt: 0
    };
  }

  /* ----------------------------- Utils de Datos Local ----------------------------- */
  const STORAGE_KEY = "ebony_ivory:scores"; 
  const DUR_Q = { w: 4, h: 2, q: 1, "8": 0.5, "16": 0.25, "32": 0.125 };
  
  function uid() { return "s_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function loadAll() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch (e) { return {}; } }
  function saveAll(map) { localStorage.setItem(STORAGE_KEY, JSON.stringify(map)); }
  function nextPlateNumber() { const scores = Object.values(loadAll()); if (scores.length === 0) return 1; return Math.max(...scores.map(s => s.plate || 0)) + 1; }
  function plateLabel(n) { return "E&I " + String(n).padStart(3, "0"); }
  function slugify(str) { return (str || "score").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "score"; }
  function formatDate(ts) { try { return new Date(ts).toLocaleDateString(currentLang === 'es' ? "es-ES" : "en-US", { day: "2-digit", month: "short", year: "numeric" }); } catch (e) { return ""; } }
  function escapeHtml(str) { const d = document.createElement("div"); d.textContent = str; return d.innerHTML; }
  function measureNeededQuarters(timeSig) { const [num, den] = timeSig.split("/").map(Number); return num * (4 / den); }
  function quartersUsed(staffNotes) { return staffNotes.reduce((sum, n) => sum + (DUR_Q[n.duration] || 0) * (n.dotted ? 1.5 : 1), 0); }
  function newMeasure() { return { treble: [], bass: [], repeatStart: false, repeatEnd: false, directive: "" }; }
  function newScore() { return { id: uid(), plate: nextPlateNumber(), title: "", composer: "", timeSig: "4/4", keySig: "C", bpm: 100, measures: [newMeasure()], createdAt: Date.now(), updatedAt: Date.now() }; }
  function downloadBlob(filename, text, type) { const blob = new Blob([text], { type: type || "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(() => URL.revokeObjectURL(url), 2000); }
  
  function persistScore(score) { 
    if (score.isExample) return; score.updatedAt = Date.now(); const all = loadAll(); all[score.id] = score; saveAll(all); 
    const ind = document.getElementById('saveIndicator'); if(ind) { ind.classList.add('show'); clearTimeout(saveTimeout); saveTimeout = setTimeout(() => ind.classList.remove('show'), 1500); }
  }

  function deleteScoreById(id) { 
    const all = loadAll(); delete all[id]; const scores = Object.values(all).sort((a, b) => a.plate - b.plate);
    const newAll = {}; scores.forEach((s, index) => { s.plate = index + 1; newAll[s.id] = s; }); saveAll(newAll); 
  }

  /* ----------------------------- Firebase Auth, Sync & Profile ----------------------------- */
  let auth = null, db = null, currentUser = null, unsubscribeSnapshot = null, pollTimer = null, lastSnapshotMap = {};
  let firebaseInitError = null;

  function initFirebase() {
    try {
      if (typeof firebase === 'undefined') return "El navegador está bloqueando la conexión. Desactiva tu AdBlocker para iniciar sesión.";
      const fbConfig = window.FIREBASE_CONFIG || (window.EI_CONFIG && window.EI_CONFIG.firebase);
      if (!fbConfig || !fbConfig.apiKey || fbConfig.apiKey.startsWith('PEGA_')) return "La nube no está configurada. Faltan las claves en firebase-config.js.";
      
      if (!firebase.apps.length) firebase.initializeApp(fbConfig);
      auth = firebase.auth(); 
      db = firebase.firestore();
      
      auth.onAuthStateChanged((user) => {
        currentUser = user; updateAccountUI(); refreshLangTexts();
        if (user) {
          lastSnapshotMap = {}; const coll = db.collection('users').doc(user.uid).collection('scores');
          unsubscribeSnapshot = coll.onSnapshot((snap) => {
            const cloudMap = {}; snap.forEach((doc) => { cloudMap[doc.id] = doc.data(); });
            const localAll = loadAll(); let changed = false;
            Object.keys(cloudMap).forEach((id) => { if (!localAll[id] || (cloudMap[id].updatedAt || 0) > (localAll[id].updatedAt || 0)) { localAll[id] = cloudMap[id]; changed = true; } });
            if (changed) { saveAll(localAll); lastSnapshotMap = snapshotOf(localAll); if (document.getElementById("viewLibrary") && !document.getElementById("viewLibrary").hidden) renderLibrary(); }
          });
          pollTimer = setInterval(() => {
            const all = loadAll(); const batch = db.batch(); let writes = 0;
            Object.keys(all).forEach((id) => { if (!lastSnapshotMap[id] || lastSnapshotMap[id] !== (all[id].updatedAt || 0)) { batch.set(coll.doc(id), all[id]); writes++; } });
            Object.keys(lastSnapshotMap).forEach((id) => { if (!all[id]) { batch.delete(coll.doc(id)); writes++; } });
            lastSnapshotMap = snapshotOf(all); if (writes > 0) batch.commit();
          }, 4000);
        } else {
          if (unsubscribeSnapshot) { unsubscribeSnapshot(); unsubscribeSnapshot = null; }
          if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
        }
      });
      return null;
    } catch (e) { return "Error crítico de Firebase: " + e.message; }
  }

  function snapshotOf(map) { const out = {}; Object.keys(map).forEach((id) => { out[id] = map[id].updatedAt || 0; }); return out; }
  
  function updateAccountUI() {
    const loginBtn = document.getElementById('btnAccountLogin'); const loggedBox = document.getElementById('accountLogged'); if(!loginBtn) return;
    if (currentUser) {
      loginBtn.hidden = true; loggedBox.hidden = false; 
      document.getElementById('acctEmail').textContent = currentUser.displayName || currentUser.email || ''; 
      if(currentUser.photoURL) {
          document.getElementById('acctAvatar').style.backgroundImage = `url(${currentUser.photoURL})`;
          document.getElementById('acctAvatar').textContent = "";
      } else {
          document.getElementById('acctAvatar').style.backgroundImage = "none";
          document.getElementById('acctAvatar').textContent = (currentUser.displayName || currentUser.email || '?').charAt(0).toUpperCase();
      }
    } else { loginBtn.hidden = false; loggedBox.hidden = true; }
  }

  function translateFirebaseError(err) {
    const code = err && err.code;
    const map = {
      'auth/invalid-email': currentLang === 'es' ? 'Email no válido.' : 'Invalid email.',
      'auth/user-not-found': currentLang === 'es' ? 'No existe ninguna cuenta con este email.' : 'No account found.',
      'auth/wrong-password': currentLang === 'es' ? 'Contraseña incorrecta.' : 'Wrong password.',
      'auth/email-already-in-use': currentLang === 'es' ? 'Ya existe una cuenta con este email.' : 'Email already in use.',
      'auth/weak-password': currentLang === 'es' ? 'La contraseña debe tener al menos 6 caracteres.' : 'Password must be 6 characters.',
      'auth/popup-closed-by-user': currentLang === 'es' ? 'Ventana de Google cerrada antes de terminar.' : 'Popup closed.',
      'auth/requires-recent-login': t('reauthNeeded')
    }; return map[code] || t('genericError');
  }

  /* ----------------------------- DOM Loaded Events (Anti-Crashes) ----------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    
    firebaseInitError = initFirebase();

    // Eventos del Modal de Auth
    const authOverlay = document.getElementById('authModalOverlay');
    if(authOverlay) {
      const btnLogin = document.getElementById('btnAccountLogin');
      if(btnLogin) btnLogin.addEventListener('click', () => { authOverlay.hidden = false; document.getElementById('authError').hidden = true; setTimeout(()=>document.getElementById('authEmail').focus(),50);});
      
      const btnClose = document.getElementById('authModalClose');
      if(btnClose) btnClose.addEventListener('click', () => authOverlay.hidden = true);
      
      ['authTabLogin', 'authTabRegister'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('click', (e) => {
          document.getElementById('authTabLogin').classList.remove('is-active'); document.getElementById('authTabRegister').classList.remove('is-active');
          e.target.classList.add('is-active'); refreshLangTexts(); document.getElementById('authError').hidden = true;
        });
      });

      const form = document.getElementById('authForm');
      if(form) form.addEventListener('submit', (e) => {
        e.preventDefault(); const errBox = document.getElementById('authError'); errBox.hidden = true;
        if(!auth) { errBox.hidden = false; errBox.textContent = firebaseInitError || "Error crítico."; return; }
        const isReg = document.getElementById('authTabRegister').classList.contains('is-active');
        const p = isReg ? auth.createUserWithEmailAndPassword(document.getElementById('authEmail').value, document.getElementById('authPassword').value) : auth.signInWithEmailAndPassword(document.getElementById('authEmail').value, document.getElementById('authPassword').value);
        p.then(() => authOverlay.hidden = true).catch(err => { errBox.hidden = false; errBox.textContent = translateFirebaseError(err); });
      });
      
      const btnGoogle = document.getElementById('authGoogleBtn');
      if(btnGoogle) btnGoogle.addEventListener('click', () => {
        const errBox = document.getElementById('authError'); errBox.hidden = true;
        if(!auth) { errBox.hidden = false; errBox.textContent = firebaseInitError || "Error crítico."; return; }
        auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(() => authOverlay.hidden = true).catch(err => { errBox.hidden = false; errBox.textContent = translateFirebaseError(err); });
      });
    }

    // Eventos del Modal de Perfil
    const profOverlay = document.getElementById('profileModalOverlay');
    if(profOverlay) {
        document.getElementById('accountLogged').addEventListener('click', () => {
            profOverlay.hidden = false;
            document.getElementById('profNameTitle').textContent = currentUser.displayName || t('account');
            document.getElementById('profEmailText').textContent = currentUser.email || '';
            document.getElementById('profDisplayName').value = currentUser.displayName || '';
            document.getElementById('profPhotoUrl').value = currentUser.photoURL || '';
            if(currentUser.photoURL) {
                document.getElementById('profAvatarLg').style.backgroundImage = `url(${currentUser.photoURL})`;
                document.getElementById('profAvatarLg').textContent = "";
            } else {
                document.getElementById('profAvatarLg').style.backgroundImage = "none";
                document.getElementById('profAvatarLg').textContent = (currentUser.displayName || currentUser.email || '?').charAt(0).toUpperCase();
            }
        });
        document.getElementById('profileModalClose').addEventListener('click', () => profOverlay.hidden = true);
        
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            currentUser.updateProfile({
                displayName: document.getElementById('profDisplayName').value,
                photoURL: document.getElementById('profPhotoUrl').value
            }).then(() => { updateAccountUI(); profOverlay.hidden = true; }).catch(err => alert(translateFirebaseError(err)));
        });

        document.getElementById('btnDeleteAccount').addEventListener('click', async () => {
            if(!confirm(t('deleteWarning'))) return;
            try {
                // Borrar Partituras de la nube
                if(db) {
                    const docs = await db.collection('users').doc(currentUser.uid).collection('scores').get();
                    const batch = db.batch(); docs.forEach(d => batch.delete(d.ref)); await batch.commit();
                }
                // Destruir cuenta
                await currentUser.delete();
                profOverlay.hidden = true;
                localStorage.removeItem(STORAGE_KEY); // Limpiar local por seguridad
                window.location.hash = "#inicio";
            } catch(err) {
                alert(translateFirebaseError(err));
            }
        });
    }

    // Configurar Selects Personalizados
    setupCustomSelect('customKeySig', 'keySig', false); setupCustomSelect('customFilterKeySig', 'filterKeySig', true);

    // Eventos de Navegación del Catálogo
    const btnExpJson = document.getElementById("btnExportJson"); if(btnExpJson) btnExpJson.addEventListener("click", () => { downloadBlob(slugify(currentScore.title) + ".json", JSON.stringify(currentScore, null, 2)); });
    const btnExpPdf = document.getElementById("btnExportPdf"); if(btnExpPdf) btnExpPdf.addEventListener("click", () => { 
        const oTitle = document.title; document.title = `${(currentScore.title || t('untitled')).trim()} — ${(currentScore.composer || t('unknownAuthor')).trim()}`;
        window.print(); setTimeout(() => { document.title = oTitle; }, 500);
    });
    
    const btnImport = document.getElementById("btnImport"); if(btnImport) btnImport.addEventListener("click", () => document.getElementById("fileImport").click());
    const fileImport = document.getElementById("fileImport"); if(fileImport) fileImport.addEventListener("change", (e) => {
      const file = e.target.files[0]; if (!file) return; const reader = new FileReader();
      reader.onload = () => {
        try { const data = JSON.parse(reader.result); if (!data.measures) throw new Error("Format error");
          data.id = uid(); data.plate = nextPlateNumber(); data.updatedAt = Date.now(); persistScore(data); 
          if (window.location.hash === "#catalogo") renderLibrary(); else window.location.hash = "#catalogo";
        } catch (err) { alert("Error: " + err.message); } e.target.value = ""; 
      }; reader.readAsText(file);
    });

    const btnNewScore = document.getElementById("btnNewScore"); if(btnNewScore) btnNewScore.addEventListener("click", () => { const score = newScore(); persistScore(score); window.location.hash = "#editor/" + score.id; });
    const btnBackLib = document.getElementById("btnBackLibrary"); if(btnBackLib) btnBackLib.addEventListener("click", () => { window.location.hash = "#catalogo"; });
    const brandHome = document.getElementById("brandHome"); if(brandHome) brandHome.addEventListener("click", () => { window.location.hash = "#inicio"; });
    const btnGoCat = document.getElementById("btnGoCatalog"); if(btnGoCat) btnGoCat.addEventListener("click", () => { window.location.hash = "#catalogo"; });
    const btnGoEx = document.getElementById("btnGoExample"); if(btnGoEx) btnGoEx.addEventListener("click", () => { window.location.hash = "#ejemplo"; });
    const btnToggleV = document.getElementById("btnToggleViewer"); if(btnToggleV) btnToggleV.addEventListener("click", () => { window.location.hash = (document.body.classList.contains('is-viewer') ? "#editor/" : "#viewer/") + currentScore.id; });

    // Eventos de Filtros del Catálogo
    const elSearch = document.getElementById("searchScores"); if(elSearch) elSearch.addEventListener("input", (e) => { libraryState.query = e.target.value.toLowerCase(); renderLibrary(); });
    const elSort = document.getElementById("sortScores"); if(elSort) elSort.addEventListener("change", (e) => { libraryState.sortBy = e.target.value; renderLibrary(); });
    const elBtnFilters = document.getElementById("btnToggleFilters"); const elFiltersPanel = document.getElementById("catalogFilters");
    if(elBtnFilters && elFiltersPanel) elBtnFilters.addEventListener("click", () => { elFiltersPanel.hidden = !elFiltersPanel.hidden; });
    const elFilterTime = document.getElementById("filterTimeSig"); if(elFilterTime) elFilterTime.addEventListener("change", (e) => { libraryState.filterTime = e.target.value; renderLibrary(); });
    const elFilterHands = document.getElementById("filterHands"); if(elFilterHands) elFilterHands.addEventListener("change", (e) => { libraryState.filterHands = e.target.value; renderLibrary(); });

    // Eventos del Escritorio de Edición
    if(document.getElementById("scoreTitle")) {
      document.getElementById("scoreTitle").addEventListener("input", (e) => { currentScore.title = e.target.value; renderScore(); });
      document.getElementById("scoreComposer").addEventListener("input", (e) => { currentScore.composer = e.target.value; renderScore(); });
      document.getElementById("timeSig").addEventListener("change", (e) => { currentScore.timeSig = e.target.value; renderScore(); });
      
      document.getElementById("btnPrevMeasure").addEventListener("click", () => { editorState.activeMeasure--; syncMeasureControls(); renderScore(); });
      document.getElementById("btnNextMeasure").addEventListener("click", () => { editorState.activeMeasure++; syncMeasureControls(); renderScore(); });
      document.getElementById("btnAddMeasure").addEventListener("click", () => { currentScore.measures.push(newMeasure()); editorState.activeMeasure = currentScore.measures.length - 1; syncMeasureControls(); renderScore(); });
      document.getElementById("btnDeleteMeasure").addEventListener("click", () => {
        if (currentScore.measures.length <= 1) { alert(t('minMeasureAlert')); return; }
        if (!confirm(t('delMeasureConfirm'))) return;
        currentScore.measures.splice(editorState.activeMeasure, 1); syncMeasureControls(); renderScore();
      });

      document.getElementById("repeatStart").addEventListener("change", (e) => { currentScore.measures[editorState.activeMeasure].repeatStart = e.target.checked; renderScore(); });
      document.getElementById("repeatEnd").addEventListener("change", (e) => { currentScore.measures[editorState.activeMeasure].repeatEnd = e.target.checked; renderScore(); });
      document.getElementById("directiveSelect").addEventListener("change", (e) => { currentScore.measures[editorState.activeMeasure].directive = e.target.value; renderScore(); });

      ['Treble', 'Bass'].forEach(clef => { document.getElementById("btnStaff" + clef).addEventListener("click", () => { editorState.activeStaff = clef.toLowerCase(); document.getElementById("btnStaffTreble").classList.toggle("is-active", clef === 'Treble'); document.getElementById("btnStaffBass").classList.toggle("is-active", clef === 'Bass'); }); });

      document.getElementById("isRest").addEventListener("change", (e) => { document.getElementById("pitchFields").style.opacity = e.target.checked ? 0.4 : 1; document.getElementById("pitchFields").querySelectorAll("select").forEach(s => s.disabled = e.target.checked); });
      document.getElementById("durationGrid").addEventListener("click", (e) => { const btn = e.target.closest(".dur-btn"); if (!btn) return; editorState.duration = btn.dataset.dur; document.getElementById("durationGrid").querySelectorAll(".dur-btn").forEach(b => b.classList.toggle("is-active", b === btn)); });

      document.getElementById("btnAddNote").addEventListener("click", () => {
        const needed = measureNeededQuarters(currentScore.timeSig);
        const durQ = (DUR_Q[editorState.duration] || 0) * (document.getElementById("isDotted").checked ? 1.5 : 1);
        const currentUsed = quartersUsed(currentScore.measures[editorState.activeMeasure][editorState.activeStaff]);

        // DENEGACIÓN MATEMÁTICA SONORA (Evita colapso en el renderizado en bloque)
        if (currentUsed + durQ > needed) {
            if(Tone && Tone.Synth) {
                const errorSynth = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 } }).toDestination();
                errorSynth.volume.value = -10; errorSynth.triggerAttackRelease("C2", "16n");
            }
            const desk = document.getElementById("engraveDesk");
            desk.style.transform = "translateX(10px)";
            setTimeout(() => desk.style.transform = "translateX(-10px)", 50); setTimeout(() => desk.style.transform = "translateX(0)", 100);
            return;
        }

        currentScore.measures[editorState.activeMeasure][editorState.activeStaff].push({
          rest: document.getElementById("isRest").checked, letter: document.getElementById("pitchLetter").value, accidental: document.getElementById("pitchAccidental").value, 
          octave: parseInt(document.getElementById("pitchOctave").value, 10), duration: editorState.duration, dotted: document.getElementById("isDotted").checked, dynamic: document.getElementById("dynamicSelect").value
        }); document.getElementById("dynamicSelect").value = ""; renderScore();
      });
      document.getElementById("btnUndoNote").addEventListener("click", () => { if (currentScore.measures[editorState.activeMeasure][editorState.activeStaff].length > 0) { currentScore.measures[editorState.activeMeasure][editorState.activeStaff].pop(); renderScore(); } });
    }

    // Eventos del Audio Player
    const btnPlay = document.getElementById('plBtnPlay');
    if(btnPlay) {
      btnPlay.addEventListener('click', () => isPlaying ? pauseAudio() : playAudio());
      document.getElementById('plBtnRewind').addEventListener('click', () => window.stopPlayback(false));
      document.querySelectorAll('.pl-speed-btn').forEach((b) => b.addEventListener('click', () => { 
        speedFactor = parseFloat(b.dataset.speed); updateAudioBPM(); 
        document.querySelectorAll('.pl-speed-btn').forEach(btn => btn.classList.toggle('is-active', parseFloat(btn.dataset.speed) === speedFactor));
      }));
      const elBpm = document.getElementById('plBpm');
      if(elBpm) {
          elBpm.addEventListener('change', (e) => {
              const val = Math.max(20, Math.min(300, parseInt(e.target.value, 10) || 100));
              if (currentScore) { currentScore.bpm = val; renderScore(); } updateAudioBPM(); e.target.value = val;
          });
      }
      document.addEventListener('click', (e) => { if (isPlaying && (e.target.closest('#engraveDesk') || e.target.closest('.measure-hit'))) pauseAudio(); });
    }

    // Inicialización de la vista
    const userLang = navigator.language || navigator.userLanguage;
    window.EI.setLang((userLang && userLang.toLowerCase().startsWith('es')) ? 'es' : 'en');
    window.addEventListener("hashchange", handleNavigation);
    if(!window.location.hash || window.location.hash === "#" || window.location.hash === "") { window.location.hash = "#inicio"; } else { handleNavigation(); }
  });


  /* ----------------------------- Routing & Catalog Methods ----------------------------- */
  function handleNavigation() {
    const hash = window.location.hash; document.body.classList.remove('is-home', 'is-viewer');
    
    const vHome = document.getElementById("viewHome"); if(vHome) vHome.hidden = true; 
    const vLib = document.getElementById("viewLibrary"); if(vLib) vLib.hidden = true; 
    const vEdit = document.getElementById("viewEditor"); if(vEdit) vEdit.hidden = true;
    const lAct = document.getElementById("libraryActions"); if(lAct) lAct.hidden = true; 
    const eAct = document.getElementById("editorActions"); if(eAct) eAct.hidden = true;
    
    if(typeof window.stopPlayback === 'function') window.stopPlayback(false);

    if (hash.startsWith("#editor/")) {
      currentScore = loadAll()[hash.split("/")[1]]; if (currentScore) { document.body.classList.remove('is-viewer'); initEditor(); } else window.location.hash = "#catalogo";
    } else if (hash.startsWith("#viewer/")) {
      currentScore = loadAll()[hash.split("/")[1]]; if (currentScore) { document.body.classList.add('is-viewer'); initEditor(); } else window.location.hash = "#catalogo";
    } else if (hash === "#ejemplo" || hash === "#example") {
      currentScore = getExampleScore(currentLang); document.body.classList.add('is-viewer', 'is-example-score'); initEditor();
      if(document.getElementById('btnToggleViewer')) document.getElementById('btnToggleViewer').hidden = true;
    } else if (hash === "#catalogo") {
      currentScore = null; if(vLib) vLib.hidden = false; if(lAct) lAct.hidden = false;
      document.title = t('catalogTitle') + " — Ebony & Ivory"; renderLibrary(); window.scrollTo(0,0);
    } else {
      currentScore = null; if(vHome) vHome.hidden = false; document.body.classList.add('is-home'); document.title = "Ebony & Ivory"; window.scrollTo(0,0);
    }
  }

  function initEditor() {
    editorState = { activeMeasure: 0, activeStaff: "treble", duration: "q", dotted: false };
    const vEdit = document.getElementById("viewEditor"); if(vEdit) vEdit.hidden = false; 
    const eAct = document.getElementById("editorActions"); if(eAct) eAct.hidden = false;
    document.title = (currentScore.title || t('untitled')) + " — Ebony & Ivory";
    
    if(document.getElementById("scoreTitle")) document.getElementById("scoreTitle").value = currentScore.title || ""; 
    if(document.getElementById("scoreComposer")) document.getElementById("scoreComposer").value = currentScore.composer || ""; 
    if(document.getElementById("timeSig")) document.getElementById("timeSig").value = currentScore.timeSig || "4/4"; 
    updateCustomSelectUI('customKeySig', currentScore.keySig || "C"); 
    if(document.getElementById("plBpm")) document.getElementById("plBpm").value = currentScore.bpm || 100;
    syncMeasureControls(); renderScore(); window.scrollTo(0,0);
  }

  function renderLibrary() {
    let scores = Object.values(loadAll());
    if (libraryState.query) { scores = scores.filter(s => (s.title || "").toLowerCase().includes(libraryState.query) || (s.composer || "").toLowerCase().includes(libraryState.query) || plateLabel(s.plate).toLowerCase().includes(libraryState.query)); }
    scores = scores.filter(s => {
        if (libraryState.filterTime !== "all" && s.timeSig !== libraryState.filterTime) return false;
        if (libraryState.filterKey !== "all" && s.keySig !== libraryState.filterKey) return false;
        if (libraryState.filterHands !== "all") {
            let hasTreble = s.measures.some(m => m.treble && m.treble.length > 0); let hasBass = s.measures.some(m => m.bass && m.bass.length > 0);
            if (libraryState.filterHands === "both" && (!hasTreble || !hasBass)) return false;
            if (libraryState.filterHands === "treble" && hasBass) return false;
            if (libraryState.filterHands === "bass" && hasTreble) return false;
        } return true;
    });
    scores.sort((a, b) => {
        if (libraryState.sortBy === "numAsc") return a.plate - b.plate; if (libraryState.sortBy === "numDesc") return b.plate - a.plate;
        if (libraryState.sortBy === "dateDesc") return b.updatedAt - a.updatedAt; if (libraryState.sortBy === "dateAsc") return a.updatedAt - b.updatedAt;
        if (libraryState.sortBy === "titleAsc") return (a.title || "").localeCompare(b.title || ""); if (libraryState.sortBy === "authorAsc") return (a.composer || "").localeCompare(b.composer || ""); return 0;
    });

    const grid = document.getElementById("libraryGrid"); if(!grid) return;
    grid.innerHTML = "";
    if (scores.length === 0) { 
      if(document.getElementById("libraryEmpty")) document.getElementById("libraryEmpty").hidden = false; 
      grid.hidden = true; 
    } else {
        if(document.getElementById("libraryEmpty")) document.getElementById("libraryEmpty").hidden = true; 
        grid.hidden = false;
        scores.forEach((score) => {
          const card = document.createElement("div"); card.className = "score-card";
          card.innerHTML = `<span class="card-eyebrow">${plateLabel(score.plate)} · ${score.timeSig}</span><h3>${escapeHtml(score.title || t('untitled'))}</h3><p class="composer">${escapeHtml(score.composer || t('unknownAuthor'))}</p><div class="meta"><span>${score.measures.length} ${t('measuresTxt')}</span><span>${formatDate(score.updatedAt)}</span></div>
            <div class="card-actions-row">
              <button class="btn-card" data-action="view">${t('viewBtn')}</button>
              <button class="btn-card" data-action="edit">${t('editBtn')}</button>
              <button class="btn-card" data-action="duplicate">${t('copyBtn')}</button>
              <button class="btn-card btn-danger-card" data-action="delete">${t('deleteBtn')}</button>
            </div>`;
          card.addEventListener("click", (e) => {
            const action = e.target.closest("[data-action]");
            if (action) {
              e.stopPropagation();
              if (action.dataset.action === "delete") { if (confirm(t('delConfirm'))) { deleteScoreById(score.id); renderLibrary(); } } 
              else if (action.dataset.action === "duplicate") { const copy = JSON.parse(JSON.stringify(score)); copy.id = uid(); copy.plate = nextPlateNumber(); copy.title = (score.title || t('untitled')) + " " + t('copySuffix'); copy.createdAt = copy.updatedAt = Date.now(); persistScore(copy); renderLibrary(); } 
              else if (action.dataset.action === "edit") { window.location.hash = "#editor/" + score.id; }
              else if (action.dataset.action === "view") { window.location.hash = "#viewer/" + score.id; }
            } else { window.location.hash = "#viewer/" + score.id; }
          }); grid.appendChild(card);
        });
    }
  }

  function syncMeasureControls() {
    editorState.activeMeasure = Math.max(0, Math.min(editorState.activeMeasure, currentScore.measures.length - 1)); const m = currentScore.measures[editorState.activeMeasure];
    const lbl = document.getElementById("activeMeasureLabel"); if(lbl) lbl.textContent = `${editorState.activeMeasure + 1} / ${currentScore.measures.length}`;
    const rs = document.getElementById("repeatStart"); if(rs) rs.checked = !!m.repeatStart; 
    const re = document.getElementById("repeatEnd"); if(re) re.checked = !!m.repeatEnd; 
    const ds = document.getElementById("directiveSelect"); if(ds) ds.value = m.directive || "";
  }

  /* ----------------------------- VexFlow Renderer (Safe Block Formatting & Sync Data) ----------------------------- */
  const MEASURES_PER_LINE = 4; const LINES_PER_PAGE = 5; const TOTAL_WIDTH = 1000; 
  const LEFT_MARGIN = 40; const RIGHT_MARGIN = 40; const FIRST_OF_LINE_WIDTH = 260; 
  const REST_OF_LINE_WIDTH = (TOTAL_WIDTH - LEFT_MARGIN - RIGHT_MARGIN - FIRST_OF_LINE_WIDTH) / (MEASURES_PER_LINE - 1); 
  const STAVE_GAP = 92; const LINE_GAP = 180; const TOP_MARGIN = 20;

  function noteToVexKey(n) { return n.letter.toLowerCase() + (n.accidental === "#" || n.accidental === "b" ? n.accidental : "") + "/" + n.octave; }

  function renderScore() {
    if (!currentScore) return; persistScore(currentScore); const container = document.getElementById("vexPagesContainer"); if(!container) return; container.innerHTML = "";
    if (typeof Vex === "undefined") { container.innerHTML = '<p style="padding:40px;color:#8C2F39;font-weight:bold;">No se ha podido cargar VexFlow.</p>'; return; }

    try {
      const VF = Vex.Flow; const measures = currentScore.measures; const [num, den] = currentScore.timeSig.split("/").map(Number);
      const totalLines = Math.ceil(measures.length / MEASURES_PER_LINE); const totalPages = Math.ceil(totalLines / LINES_PER_PAGE) || 1;
      
      for (let p = 0; p < totalPages; p++) {
          const pageDiv = document.createElement('div'); pageDiv.className = 'paper-page';
          const printHeader = document.createElement('div'); printHeader.className = 'print-header-content';
          printHeader.innerHTML = `<span>${escapeHtml(currentScore.title || t('untitled'))} — ${escapeHtml(currentScore.composer)}</span> <span>${plateLabel(currentScore.plate)}</span>`;
          pageDiv.appendChild(printHeader);

          let startY = TOP_MARGIN;
          if (p === 0) {
              const head = document.createElement("div"); head.className = "score-letterhead";
              head.innerHTML = `<h2>${escapeHtml(currentScore.title || t('untitled'))}</h2><p>${escapeHtml(currentScore.composer || "")}</p>`;
              pageDiv.appendChild(head); startY += 60; // Margen reducido como se pedía
          }

          const printFooter = document.createElement('div'); printFooter.className = 'print-footer-content';
          printFooter.innerHTML = `<span><img src="assets/isotipo.png" class="print-logo-isotipo"></span> <span>${p + 1} / ${totalPages}</span>`;
          pageDiv.appendChild(printFooter);

          const svgWrap = document.createElement('div'); pageDiv.appendChild(svgWrap); container.appendChild(pageDiv);

          const linesOnThisPage = Math.min(LINES_PER_PAGE, totalLines - (p * LINES_PER_PAGE));
          const pageHeight = startY + (linesOnThisPage * LINE_GAP) + 20;

          const renderer = new VF.Renderer(svgWrap, VF.Renderer.Backends.SVG); renderer.resize(TOTAL_WIDTH, pageHeight);
          const ctx = renderer.getContext(); const hitRects = [];

          for (let l = 0; l < linesOnThisPage; l++) {
              const globalLineIdx = (p * LINES_PER_PAGE) + l;
              for (let m = 0; m < MEASURES_PER_LINE; m++) {
                  const idx = (globalLineIdx * MEASURES_PER_LINE) + m; if (idx >= measures.length) break;
                  
                  const measure = measures[idx]; const isFirstOfLine = (m === 0);
                  const width = isFirstOfLine ? FIRST_OF_LINE_WIDTH : REST_OF_LINE_WIDTH;
                  const x = LEFT_MARGIN + (isFirstOfLine ? 0 : FIRST_OF_LINE_WIDTH + (REST_OF_LINE_WIDTH * (m - 1)));
                  const yTreble = startY + (l * LINE_GAP); const yBass = yTreble + STAVE_GAP;

                  const staveTreble = new VF.Stave(x, yTreble, width); const staveBass = new VF.Stave(x, yBass, width);

                  if (isFirstOfLine) {
                    staveTreble.addClef("treble"); staveBass.addClef("bass");
                    if (currentScore.keySig && currentScore.keySig !== "C") { staveTreble.addKeySignature(currentScore.keySig); staveBass.addKeySignature(currentScore.keySig); }
                  }
                  if (idx === 0) { 
                    staveTreble.addTimeSignature(currentScore.timeSig); staveBass.addTimeSignature(currentScore.timeSig); 
                    staveTreble.setTempo({ duration: 'q', dots: 0, bpm: currentScore.bpm || 100 }, 0); 
                  }

                  staveTreble.setBegBarType(measure.repeatStart ? VF.Barline.type.REPEAT_BEGIN : VF.Barline.type.SINGLE);
                  staveBass.setBegBarType(measure.repeatStart ? VF.Barline.type.REPEAT_BEGIN : VF.Barline.type.SINGLE);
                  let endType = VF.Barline.type.SINGLE;
                  if (measure.repeatEnd) endType = VF.Barline.type.REPEAT_END;
                  if (idx === measures.length - 1 && !measure.repeatEnd) endType = VF.Barline.type.END;
                  staveTreble.setEndBarType(endType); staveBass.setEndBarType(endType);

                  staveTreble.setContext(ctx).draw(); staveBass.setContext(ctx).draw();

                  if (isFirstOfLine) {
                    new VF.StaveConnector(staveTreble, staveBass).setType(VF.StaveConnector.type.BRACE).setContext(ctx).draw();
                    new VF.StaveConnector(staveTreble, staveBass).setType(VF.StaveConnector.type.SINGLE_LEFT).setContext(ctx).draw();
                  }
                  new VF.StaveConnector(staveTreble, staveBass).setType(VF.StaveConnector.type.SINGLE_RIGHT).setContext(ctx).draw();

                  const buildNotes = (staffNotes, clef, staffName) => {
                    const out = []; const restKey = clef === "bass" ? "d/3" : "b/4";
                    staffNotes.forEach((n, nIdx) => {
                      const durStr = n.duration + (n.dotted ? "d" : "") + (n.rest ? "r" : "");
                      const keys = n.rest ? [restKey] : [noteToVexKey(n)];
                      const sn = new VF.StaveNote({ clef: clef, keys: keys, duration: durStr });
                      sn.addClass(`vf-note-${idx}-${staffName}-${nIdx}`);
                      if (n.dotted) VF.Dot.buildAndAttach([sn], { all: true });
                      if (!n.rest && n.accidental) sn.addModifier(new VF.Accidental(n.accidental), 0);
                      if (n.dynamic) { sn.addModifier(new VF.Annotation(n.dynamic).setFont("Times", 12, "italic bold").setVerticalJustification( clef === "bass" ? VF.Annotation.VerticalJustify.TOP : VF.Annotation.VerticalJustify.BOTTOM ), 0); }
                      out.push(sn);
                    }); return out;
                  };

                  const trebleNotes = buildNotes(measure.treble, "treble", "treble"); const bassNotes = buildNotes(measure.bass, "bass", "bass");
                  const vTreble = new VF.Voice({ num_beats: num, beat_value: den }).setMode(VF.Voice.Mode.SOFT);
                  const vBass = new VF.Voice({ num_beats: num, beat_value: den }).setMode(VF.Voice.Mode.SOFT);
                  
                  const voices = [];
                  if (trebleNotes.length > 0) { vTreble.addTickables(trebleNotes); voices.push(vTreble); }
                  if (bassNotes.length > 0) { vBass.addTickables(bassNotes); voices.push(vBass); }

                  if(voices.length > 0) {
                      const formatter = new VF.Formatter();
                      try { formatter.joinVoices(voices).format(voices, width - 40); } 
                      catch(e) { voices.forEach(v => { const f = new VF.Formatter(); f.joinVoices([v]).format([v], width - 40); }); }
                  }

                  if (trebleNotes.length > 0) { try { VF.Beam.generateBeams(trebleNotes, { beam_rests: false }).forEach(b => b.setContext(ctx).draw()); } catch(e) {} vTreble.draw(ctx, staveTreble); }
                  if (bassNotes.length > 0) { try { VF.Beam.generateBeams(bassNotes, { beam_rests: false }).forEach(b => b.setContext(ctx).draw()); } catch(e) {} vBass.draw(ctx, staveBass); }

                  if (measure.directive) {
                    const targetArr = trebleNotes.length ? trebleNotes : bassNotes;
                    if (targetArr.length) targetArr[targetArr.length - 1].addModifier(new VF.Annotation(measure.directive).setFont("Cormorant Garamond", 15, "italic").setVerticalJustification(VF.Annotation.VerticalJustify.TOP), 0);
                  }
                  
                  // Extraemos las matemáticas precisas para la Línea Dorada de Barrido
                  hitRects.push({ 
                      x: staveTreble.getX(), y: staveTreble.getYForLine(0) - 25, 
                      width: staveTreble.getWidth(), height: staveBass.getYForLine(4) - staveTreble.getYForLine(0) + 50, 
                      startX: staveTreble.getNoteStartX(), endX: staveTreble.getNoteEndX(), idx: idx 
                  });
              }
          }

          const svg = svgWrap.querySelector("svg");
          if (svg) {
            svg.setAttribute("viewBox", `0 0 ${TOTAL_WIDTH} ${pageHeight}`); svg.removeAttribute("width"); svg.removeAttribute("height");
            const ns = "http://www.w3.org/2000/svg";
            hitRects.forEach((hr) => {
              const g = document.createElementNS(ns, "g"); g.setAttribute("class", "measure-hit" + (hr.idx === editorState.activeMeasure ? " active" : "")); 
              g.setAttribute("data-measure-idx", hr.idx); g.setAttribute("data-start-x", hr.startX); g.setAttribute("data-end-x", hr.endX); 
              g.setAttribute("data-y", hr.y); g.setAttribute("data-h", hr.height);
              
              const rect = document.createElementNS(ns, "rect");
              rect.setAttribute("x", hr.x); rect.setAttribute("y", hr.y); rect.setAttribute("width", hr.width); rect.setAttribute("height", hr.height);
              rect.setAttribute("fill", hr.idx === editorState.activeMeasure ? "rgba(179, 142, 80, 0.15)" : "transparent"); rect.setAttribute("rx", "4");
              g.appendChild(rect); g.addEventListener("click", () => { editorState.activeMeasure = hr.idx; syncMeasureControls(); renderScore(); });
              svg.insertBefore(g, svg.firstChild);
            });
          }
      }
      const needed = measureNeededQuarters(currentScore.timeSig); const m = currentScore.measures[editorState.activeMeasure];
      const lbl = document.getElementById("activeMeasureLabel");
      if(lbl) lbl.textContent = `${editorState.activeMeasure + 1}/${currentScore.measures.length} · ♩ Sol ${trim(quartersUsed(m.treble))}/${trim(needed)} · Fa ${trim(quartersUsed(m.bass))}/${trim(needed)}`;
    } catch (err) { console.error(err); container.innerHTML = `<p style="padding:40px;color:#8C2F39;font-weight:bold;">Error matemático crítico al renderizar.</p>`; }
  }

  function trim(n) { return Number.isInteger(n) ? n : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""); }

  /* ----------------------------- Audio Player & Animaciones Mágicas ----------------------------- */
  let acousticPiano = null, isPlaying = false, rafId = null, part = null, measurePart = null, builtForScoreKey = null, totalQuarters = 0, speedFactor = 1;

  function ensureAcousticPiano() {
    if (acousticPiano) return;
    acousticPiano = new Tone.Sampler({ urls: { A0: "A0.mp3", C2: "C2.mp3", C4: "C4.mp3", C6: "C6.mp3" }, release: 1.2, baseUrl: "https://tonejs.github.io/audio/salamander/" }).toDestination(); acousticPiano.volume.value = -2;
  }

  function quarterToBBS(q) { const bars = Math.floor(q / 4); const beatsFloat = q - bars * 4; const beat = Math.floor(beatsFloat); return bars + ':' + beat + ':' + ((beatsFloat - beat) * 4).toFixed(3); }
  function updateAudioBPM() { Tone.Transport.bpm.value = (currentScore.bpm || 100) * speedFactor; }

  function buildTimeline() {
    if (!currentScore) return false; ensureAcousticPiano(); teardownAudio();
    const events = [], measureEvents = []; let pos = 0;
    currentScore.measures.forEach((measure, idx) => {
      measureEvents.push({ time: quarterToBBS(pos), idx });
      ['treble', 'bass'].forEach((staffName) => {
        let cursor = pos;
        (measure[staffName] || []).forEach((n, nIdx) => {
          const durQ = (DUR_Q[n.duration] || 0) * (n.dotted ? 1.5 : 1);
          if (!n.rest && durQ > 0) {
            events.push({ time: quarterToBBS(cursor), note: n.letter.toUpperCase() + (n.accidental.replace('b', 'b') || "") + n.octave, durQ: durQ, id: `vf-note-${idx}-${staffName}-${nIdx}` });
          } cursor += durQ;
        });
      }); pos += measureNeededQuarters(currentScore.timeSig);
    });

    totalQuarters = pos; updateAudioBPM();
    part = new Tone.Part((time, ev) => { 
        acousticPiano.triggerAttackRelease(ev.note, Math.max(0.05, ev.durQ * (60 / Tone.Transport.bpm.value) * 0.92), time); 
        // Iluminación exacta de las notas dibujadas por VexFlow
        Tone.Draw.schedule(() => {
            document.querySelectorAll('.' + ev.id).forEach(el => {
                el.classList.add('note-playing');
                setTimeout(() => el.classList.remove('note-playing'), ev.durQ * (60 / Tone.Transport.bpm.value) * 1000);
            });
        }, time);
    }, events).start(0);

    measurePart = new Tone.Part((time, ev) => { 
        const durationSec = measureNeededQuarters(currentScore.timeSig) * (60 / Tone.Transport.bpm.value);
        Tone.Draw.schedule(() => highlightMeasureSweep(ev.idx, durationSec), time); 
    }, measureEvents).start(0);
    
    Tone.Transport.scheduleOnce(() => { Tone.Draw.schedule(() => window.stopPlayback(true), Tone.now()); }, quarterToBBS(totalQuarters));
    builtForScoreKey = currentScore.id + ':' + currentScore.measures.length + ':' + currentScore.timeSig; return true;
  }

  function teardownAudio() { if (part) { part.dispose(); part = null; } if (measurePart) { measurePart.dispose(); measurePart = null; } }
  
  // Línea dorada de sincronización perfecta calculada vía VexFlow
  function highlightMeasureSweep(idx, durationSec) { 
    const g = document.querySelector(`.measure-hit[data-measure-idx="${idx}"]`);
    if(!g) return;
    
    const startX = parseFloat(g.getAttribute('data-start-x'));
    const endX = parseFloat(g.getAttribute('data-end-x'));
    const y = parseFloat(g.getAttribute('data-y'));
    const h = parseFloat(g.getAttribute('data-h'));

    const svg = g.closest('svg'); let line = svg.querySelector('.playback-line-svg');
    if(!line) { line = document.createElementNS("http://www.w3.org/2000/svg", "line"); line.setAttribute("class", "playback-line-svg"); line.setAttribute("stroke", "#B38E50"); line.setAttribute("stroke-width", "2"); svg.appendChild(line); }
    document.querySelectorAll('.playback-line-svg').forEach(l => { if(l !== line) l.style.display = 'none'; }); line.style.display = 'block';

    line.setAttribute('x1', startX); line.setAttribute('y1', y); line.setAttribute('x2', startX); line.setAttribute('y2', y + h);
    line.style.transition = 'none'; line.style.transform = `translateX(0px)`;
    line.getBoundingClientRect(); // Forzar renderizado
    line.style.transition = `transform ${durationSec}s linear`; line.style.transform = `translateX(${endX - startX}px)`;
  }
  
  function clearHighlight() { document.querySelectorAll('.playback-line-svg').forEach(l => l.style.display = 'none'); document.querySelectorAll('.note-playing').forEach(n => n.classList.remove('note-playing')); }

  function playAudio() {
    if (!currentScore) return;
    Tone.start().then(() => {
      if ((currentScore.id + ':' + currentScore.measures.length + ':' + currentScore.timeSig) !== builtForScoreKey) { if (!buildTimeline()) return; }
      Tone.Transport.start(); isPlaying = true; updatePlayerUI(); tickProgress();
    });
  }
  function pauseAudio() { Tone.Transport.pause(); isPlaying = false; updatePlayerUI(); cancelAnimationFrame(rafId); }
  window.stopPlayback = function(reachedEnd) { Tone.Transport.stop(); isPlaying = false; updatePlayerUI(); cancelAnimationFrame(rafId); clearHighlight(); const prog = document.getElementById('plProgressFill'); if(prog) prog.style.width = '0%'; }

  function updatePlayerUI() { const btn = document.getElementById('plBtnPlay'); if(!btn) return; btn.textContent = isPlaying ? '⏸' : '▶'; const bar = document.getElementById('playerBar'); if(bar) bar.classList.toggle('is-playing', isPlaying); }
  function tickProgress() {
    if (!isPlaying) return;
    const elapsedQ = Tone.Transport.seconds * (Tone.Transport.bpm.value / 60); const frac = totalQuarters > 0 ? Math.min(1, elapsedQ / totalQuarters) : 0;
    const prog = document.getElementById('plProgressFill'); if(prog) prog.style.width = (frac * 100).toFixed(2) + '%';
    const secPerQ = 60 / Tone.Transport.bpm.value; 
    const lbl = document.getElementById('plTimeLabel'); if(lbl) lbl.textContent = formatTime(frac * totalQuarters * secPerQ) + ' / ' + formatTime(totalQuarters * secPerQ);
    rafId = requestAnimationFrame(tickProgress);
  }
  function formatTime(sec) { if (!isFinite(sec) || sec < 0) sec = 0; return Math.floor(sec / 60) + ':' + String(Math.floor(sec % 60)).padStart(2, '0'); }

})();
