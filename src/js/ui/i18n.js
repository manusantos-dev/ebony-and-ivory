import { state } from "../core/state.js";
import { emit } from "../core/events.js";

const translations = {
  es: {
    importBtn: "Importar .json", newScoreBtn: "+ Nueva partitura", backBtn: "← Volver",
    exportJsonBtn: "Descargar .json", exportPdfBtn: "Exportar PDF",
    heroTitle: "El arte de preservar la música",
    heroSub: "Un lienzo digital para transcribir y eternizar tus partituras.",
    goToCatalog: "Abrir mi Catálogo", viewExample: "Ver ejemplo", catalogTitle: "Catálogo",
    searchPlaceholder: "Buscar por título...", filterBtn: "Filtros ⧨",
    lblHands: "Pentagramas", optAll: "Cualquiera", optBothHands: "Ambas", optTrebleOnly: "Derecha", optBassOnly: "Izquierda",
    emptyLibraryTitle: "Catálogo vacío", emptyLibrary: "Crea una nueva partitura para empezar.",
    lblTitle: "Título", lblComposer: "Compositor", lblTimeSig: "Compás", lblKeySig: "Tonalidad",
    lblActiveMeasure: "Compás", btnPrev: "‹", btnNext: "›",
    btnAddMeasure: "+ compás", btnDelMeasure: "eliminar", lblTreble: "Sol", lblBass: "Fa",
    lblNote: "Nota", lblRest: "Silencio", lblPitch: "Nota", lblAccidental: "Alt.",
    lblOctave: "Octava", lblDuration: "Duración", lblDotted: "Puntillo", lblDynamics: "Dinámica",
    btnAddNote: "Añadir", btnUndoNote: "Deshacer",
    lblMeasureDetails: "Detalles", lblRepStart: "Inicio ‖:", lblRepEnd: "Fin :‖",
    lblDirective: "Indicación", untitled: "Sin título", unknownAuthor: "Desconocido", measuresTxt: "compases",
    editBtn: "✎ Editar", viewBtn: "👁 Ver", copyBtn: "⎘ Copiar", deleteBtn: "🗑️ Borrar",
    delConfirm: "¿Eliminar?", delMeasureConfirm: "¿Eliminar compás?",
    minMeasureAlert: "Mínimo un compás.", toggleViewBtn: "Visor", account: "Cuenta", login: "Login", register: "Registro",
    subtitleLogin: "Inicia sesión para sincronizar.", subtitleRegister: "Crea una cuenta gratuita.",
    logout: "Cerrar sesión", google: "Google", genericError: "Error.",
    lblPassword: "Password", displayName: "Nombre", photoUrl: "Foto (Opcional)", saveProfile: "Guardar",
    deleteAccount: "Borrar cuenta", deleteWarning: "¿Borrar datos?", reauthNeeded: "Re-autentícate."
  },
  en: {
    importBtn: "Import .json", newScoreBtn: "+ New Score", backBtn: "← Back",
    exportJsonBtn: "Download .json", exportPdfBtn: "Export PDF",
    heroTitle: "The art of preserving music",
    heroSub: "A digital canvas to transcribe and immortalize your sheet music.",
    goToCatalog: "Open Catalog", viewExample: "View example", catalogTitle: "Catalog",
    searchPlaceholder: "Search...", filterBtn: "Filters ⧨",
    lblHands: "Staves", optAll: "Any", optBothHands: "Both", optTrebleOnly: "Right", optBassOnly: "Left",
    emptyLibraryTitle: "Empty catalog", emptyLibrary: "Create a new score to start.",
    lblTitle: "Title", lblComposer: "Composer", lblTimeSig: "Time Sig.", lblKeySig: "Key",
    lblActiveMeasure: "Measure", btnPrev: "‹", btnNext: "›",
    btnAddMeasure: "+ measure", btnDelMeasure: "delete", lblTreble: "Treble", lblBass: "Bass",
    lblNote: "Note", lblRest: "Rest", lblPitch: "Pitch", lblAccidental: "Acc.",
    lblOctave: "Octave", lblDuration: "Duration", lblDotted: "Dotted", lblDynamics: "Dynamics",
    btnAddNote: "Add", btnUndoNote: "Undo",
    lblMeasureDetails: "Details", lblRepStart: "Start ‖:", lblRepEnd: "End :‖",
    lblDirective: "Directive", untitled: "Untitled", unknownAuthor: "Unknown", measuresTxt: "measures",
    editBtn: "✎ Edit", viewBtn: "👁 View", copyBtn: "⎘ Copy", deleteBtn: "🗑️ Delete",
    delConfirm: "Delete?", delMeasureConfirm: "Delete measure?",
    minMeasureAlert: "Minimum one measure.", toggleViewBtn: "Viewer", account: "Account", login: "Sign in", register: "Register",
    subtitleLogin: "Sign in to sync.", subtitleRegister: "Create free account.",
    logout: "Sign out", google: "Google", genericError: "Error.",
    lblPassword: "Password", displayName: "Name", photoUrl: "Photo (Optional)", saveProfile: "Save",
    deleteAccount: "Delete account", deleteWarning: "Delete data?", reauthNeeded: "Re-authenticate."
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