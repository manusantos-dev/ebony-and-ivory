import { state } from "./state.js";
import { emit } from "./events.js";

export const translations = {
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
    lblMeasureDetails: "Compás · Detalles", lblRepStart: "Inicio repetición ‖:", lblRepEnd: "Fin repetición :‖",
    lblDirective: "Indicación (Fine, D.C.)", lblTempo: "Tempo (BPM)",
    footerText: "Ebony & Ivory es una herramienta personal para transcribir y archivar partituras. Las obras que reescribas siguen perteneciendo a sus autores originales.",
    untitled: "Sin título", unknownAuthor: "Autor desconocido", measuresTxt: "compases",
    editBtn: "✎ Editar", viewBtn: "👁 Ver", copyBtn: "⎘ Copiar", deleteBtn: "🗑️ Borrar",
    delConfirm: "¿Eliminar partitura? No se puede deshacer.", delMeasureConfirm: "¿Eliminar este compás?",
    copySuffix: "(copia)", minMeasureAlert: "La partitura necesita al menos un compás.",
    toggleViewBtn: "Alternar Visor", optKeyAll: "Cualquiera", account: "Cuenta", login: "Iniciar sesión", register: "Crear cuenta",
    subtitleLogin: "Guarda tus partituras en la nube y ábrelas desde cualquier dispositivo.",
    subtitleRegister: "Crea una cuenta gratuita para sincronizar tus partituras.",
    logout: "Cerrar sesión", google: "Continuar con Google", genericError: "Algo falló. Revisa tus datos e inténtalo de nuevo.",
    lblPassword: "Contraseña", displayName: "Nombre / Nickname", photoUrl: "Subir foto de perfil (Opcional)", saveProfile: "Guardar Cambios",
    deleteAccount: "Eliminar mi cuenta", deleteWarning: "Esta acción borrará todas tus partituras de la nube permanentemente. ¿Estás seguro?",
    reauthNeeded: "Por seguridad, cierra sesión y vuelve a entrar con Google o tu contraseña antes de eliminar tu cuenta."
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
    lblMeasureDetails: "Measure · Details", lblRepStart: "Start repeat ‖:", lblRepEnd: "End repeat :‖",
    lblDirective: "Directive (Fine, D.C.)", lblTempo: "Tempo (BPM)",
    footerText: "Ebony & Ivory is a personal tool for transcribing and archiving sheet music. Rewritten works still belong to their original authors.",
    untitled: "Untitled", unknownAuthor: "Unknown author", measuresTxt: "measures",
    editBtn: "✎ Edit", viewBtn: "👁 View", copyBtn: "⎘ Copy", deleteBtn: "🗑️ Delete",
    delConfirm: "Delete this score? This cannot be undone.", delMeasureConfirm: "Delete this measure?",
    copySuffix: "(copy)", minMeasureAlert: "The score needs at least one measure.",
    toggleViewBtn: "Toggle Viewer", optKeyAll: "Any", account: "Account", login: "Sign in", register: "Create account",
    subtitleLogin: "Save your scores to the cloud and open them on any device.",
    subtitleRegister: "Create a free account to sync your scores.",
    logout: "Sign out", google: "Continue with Google", genericError: "Something went wrong. Check your details and try again.",
    lblPassword: "Password", displayName: "Display Name", photoUrl: "Upload profile photo (Optional)", saveProfile: "Save Changes",
    deleteAccount: "Delete my account", deleteWarning: "This will permanently delete all your scores from the cloud. Are you sure?",
    reauthNeeded: "For security, please sign out and sign in again before deleting your account."
  }
};

export function t(key) {
  return translations[state.lang][key] || key;
}

export function setLang(lang) {
  state.lang = lang;

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) el.innerHTML = translations[lang][key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (translations[lang][key]) el.setAttribute("placeholder", translations[lang][key]);
  });

  emit("langchange", lang);
}
