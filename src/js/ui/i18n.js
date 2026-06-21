import { state } from "../core/state.js";
import { emit } from "../core/events.js";

const translations = {
  es: {
    importBtn: "Importar .json", newScoreBtn: "+ Nueva partitura", backBtn: "← Volver",
    exportJsonBtn: "Descargar .json", exportPdfBtn: "Exportar PDF",
    heroTitle: "El arte de preservar la música",
    heroSub: "El entorno profesional para la notación y el grabado musical. Transcribe, clasifica y eterniza tu repertorio con precisión absoluta.",
    goToCatalog: "Abrir mi Catálogo", viewExample: "Ver ejemplo", catalogTitle: "Catálogo",
    searchPlaceholder: "Buscar por título...", filterBtn: "Filtros ⧨",
    lblHands: "Pentagramas", optAll: "Cualquiera", optBothHands: "Ambas", optTrebleOnly: "Derecha", optBassOnly: "Izquierda",
    emptyLibraryTitle: "Catálogo vacío", emptyLibrary: "Crea una nueva partitura para empezar.",
    lblTitle: "Título", lblComposer: "Compositor/es", lblTimeSig: "Compás", lblKeySig: "Tonalidad",
    lblActiveMeasure: "Compás", btnPrev: "‹", btnNext: "›",
    btnAddMeasure: "+ compás", btnDelMeasure: "eliminar", lblTreble: "Sol", lblBass: "Fa",
    lblNote: "Nota", lblRest: "Silencio", lblPitch: "Nota", lblAccidental: "Alt.",
    lblOctave: "Octava", lblDuration: "Duración", lblDotted: "Puntillo", lblDynamics: "Dinámica",
    lblFingering: "Dedo", lblLyric: "Letra", lblInputStaff: "Edición de Notas",
    btnAddNote: "Añadir nota", btnUndoNote: "Deshacer",
    lblMeasureDetails: "Indicaciones", lblRepStart: "Inicio ‖:", lblRepEnd: "Fin :‖",
    lblDirective: "Salto/Fin", untitled: "Sin título", unknownAuthor: "Desconocido", measuresTxt: "compases",
    editBtn: "✎ Editar", viewBtn: "👁 Ver", copyBtn: "⎘ Copiar", deleteBtn: "🗑️ Borrar",
    delConfirm: "¿Eliminar?", delMeasureConfirm: "¿Eliminar compás?",
    minMeasureAlert: "Mínimo un compás.", toggleViewBtn: "Alternar Visor", viewMode: "👁️ Ver Partitura", editMode: "✎ Editar Partitura", 
    practiceBtn: "🎤 Modo Práctica",
    account: "Cuenta", login: "Login", register: "Registro",
    subtitleLogin: "Inicia sesión para sincronizar.", subtitleRegister: "Crea una cuenta gratuita.",
    logout: "Cerrar sesión", google: "Google", genericError: "Error.",
    lblPassword: "Password", displayName: "Nombre", photoUrl: "Foto (Opcional)", saveProfile: "Guardar",
    deleteAccount: "Borrar cuenta", deleteWarning: "¿Borrar datos?", reauthNeeded: "Re-autentícate.",
    footerText: "Ebony & Ivory es un lienzo digital de grado profesional para archivística musical. Los derechos de las obras transcritas pertenecen a sus respectivos creadores."
  },
  en: {
    importBtn: "Import .json", newScoreBtn: "+ New Score", backBtn: "← Back",
    exportJsonBtn: "Download .json", exportPdfBtn: "Export PDF",
    heroTitle: "The art of preserving music",
    heroSub: "The professional environment for music notation and engraving. Transcribe, catalog, and preserve your repertoire with absolute precision.",
    goToCatalog: "Open Catalog", viewExample: "View example", catalogTitle: "Catalog",
    searchPlaceholder: "Search...", filterBtn: "Filters ⧨",
    lblHands: "Staves", optAll: "Any", optBothHands: "Both", optTrebleOnly: "Right", optBassOnly: "Left",
    emptyLibraryTitle: "Empty catalog", emptyLibrary: "Create a new score to start.",
    lblTitle: "Title", lblComposer: "Composer(s)", lblTimeSig: "Time Sig.", lblKeySig: "Key",
    lblActiveMeasure: "Measure", btnPrev: "‹", btnNext: "›",
    btnAddMeasure: "+ measure", btnDelMeasure: "delete", lblTreble: "Treble", lblBass: "Bass",
    lblNote: "Note", lblRest: "Rest", lblPitch: "Pitch", lblAccidental: "Acc.",
    lblOctave: "Octave", lblDuration: "Duration", lblDotted: "Dotted", lblDynamics: "Dynamics",
    lblFingering: "Finger", lblLyric: "Lyric", lblInputStaff: "Note Editor",
    btnAddNote: "Add note", btnUndoNote: "Undo",
    lblMeasureDetails: "Directives", lblRepStart: "Start ‖:", lblRepEnd: "End :‖",
    lblDirective: "Jump/Fine", untitled: "Untitled", unknownAuthor: "Unknown", measuresTxt: "measures",
    editBtn: "✎ Edit", viewBtn: "👁 View", copyBtn: "⎘ Copy", deleteBtn: "🗑️ Delete",
    delConfirm: "Delete?", delMeasureConfirm: "Delete measure?",
    minMeasureAlert: "Minimum one measure.", toggleViewBtn: "Toggle Viewer", viewMode: "👁️ View Score", editMode: "✎ Edit Score",
    practiceBtn: "🎤 Practice Mode",
    account: "Account", login: "Sign in", register: "Register",
    subtitleLogin: "Sign in to sync.", subtitleRegister: "Create free account.",
    logout: "Sign out", google: "Google", genericError: "Error.",
    lblPassword: "Password", displayName: "Name", photoUrl: "Photo (Optional)", saveProfile: "Save",
    deleteAccount: "Delete account", deleteWarning: "Delete data?", reauthNeeded: "Re-authenticate.",
    footerText: "Ebony & Ivory is a professional-grade digital canvas for musical archiving. Copyrights of transcribed works remain with their respective creators."
  }
};

export const t = (key) => translations[state.lang]?.[key] || key;

export const setLang = (lang) => {
  state.lang = lang;
  document.querySelectorAll(".lang-btn").forEach(b => b.classList.toggle("active", b.dataset.lang === lang));
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) el.innerHTML = translations[lang][key];
  });
  emit("langchange", lang);
};