import { state } from "../core/state.js";
import { emit } from "../core/events.js";

const translations = {
  es: {
    importBtn: "Importar .json", newScoreBtn: "+ Nueva partitura", backBtn: "← Volver",
    exportJsonBtn: "Descargar .json", exportPdfBtn: "Exportar PDF",
    heroTitle: "El arte de preservar la música",
    heroSub: "Tu repertorio merece un hogar a su altura. Un ecosistema digital diseñado para transcribir con precisión absoluta, practicar de forma interactiva y construir el archivo musical de tu vida.",
    goToCatalog: "Mi Catálogo", catalogTitle: "Mi Catálogo",
    searchPlaceholder: "Buscar por título...", searchCodexPlaceholder: "Buscar en El Códice...", filterBtn: "Filtros ⧨",
    lblHands: "Manos / Pentagramas", optAll: "Cualquiera", optBothHands: "Ambas manos", optTrebleOnly: "Solo Clave de Sol", optBassOnly: "Solo Clave de Fa",
    emptyLibraryTitle: "Tu catálogo está vacío", emptyLibrary: "Pulsa «Nueva partitura» en la esquina superior derecha o cambia los filtros de búsqueda para empezar.",
    lblTitle: "Título", lblComposer: "Compositor/es", lblTimeSig: "Compás", lblKeySig: "Tonalidad",
    lblActiveMeasure: "Compás", btnPrev: "‹", btnNext: "›",
    btnAddMeasure: "+ compás", btnDelMeasure: "eliminar", lblTreble: "Sol", lblBass: "Fa",
    lblNote: "Nota", lblRest: "Silencio", lblPitch: "Nota", lblAccidental: "Alt.",
    lblOctave: "Octava", lblDuration: "Duración", lblDotted: "Puntillo", lblDynamics: "Dinámica",
    lblFingering: "Dedo", lblLyric: "Letra", lblInputStaff: "Edición de Notas",
    btnAddNote: "Añadir nota", btnUndoNote: "Deshacer",
    lblMeasureDetails: "Indicaciones", lblRepStart: "Inicio ‖:", lblRepEnd: "Fin :‖",
    lblDirective: "Salto/Fin", untitled: "Sin título", unknownAuthor: "Desconocido", measuresTxt: "compases",
    editBtn: "✎ Editar", viewBtn: "👁 Examinar", copyBtn: "⎘ Copiar", deleteBtn: "🗑️ Borrar", saveCopyBtn: "Guardar una copia", savedToCatalog: "Partitura guardada en Mi Catálogo",
    delConfirm: "¿Eliminar?", delMeasureConfirm: "¿Eliminar compás?",
    minMeasureAlert: "Mínimo un compás.", toggleViewBtn: "Alternar Visor", viewMode: "👁️ Ver Partitura", editMode: "✎ Editar Partitura", 
    practiceBtn: "🎤 Modo Práctica", practiceDemo: "Modo práctica (DEMO) iniciado. ¡Toca la nota indicada!", practiceWin: "¡Enhorabuena! Has completado la partitura.", practiceErr: "No hay notas en la Clave de Sol para practicar.", practiceMicErr: "Error de micrófono: Da permisos en el navegador.",
    codexBtn: "El Códice", publishBtn: "🌍 Publicar",
    codexSubtitle: "La Biblioteca de Alejandría de las partituras. Explora, roba (con cariño) y estudia las obras maestras de la comunidad.",
    codexLoading: "Cargando el Códice...", codexEmpty: "Aún no hay partituras públicas.", codexFilterEmpty: "Ninguna obra coincide con tus filtros.", codexError: "No se pudo conectar con El Códice.", cloneCodexBtn: "⎘ Guardar copia",
    account: "Cuenta", login: "Login", register: "Registro",
    subtitleLogin: "Inicia sesión para sincronizar tu catálogo con la nube y publicar en El Códice.", subtitleRegister: "Crea una cuenta gratuita.",
    logout: "Cerrar sesión", google: "Google", genericError: "Error.",
    lblPassword: "Password", displayName: "Nombre", photoUrl: "Foto (Opcional)", saveProfile: "Guardar",
    deleteAccount: "Borrar cuenta", deleteWarning: "¿Borrar datos?", reauthNeeded: "Re-autentícate.",
    sortLikes: "Más populares ❤️", sortRecent: "Más recientes", sortOldest: "Más antiguas", sortNumAsc: "Número (asc.)", sortNumDesc: "Número (desc.)", sortTitleAsc: "Título (A-Z)", sortAuthorAsc: "Autor (A-Z)",
    byPublisher: "por:",
    footerText: "Ebony & Ivory es un proyecto creado por y para amantes de la música, diseñado para elevar la forma en que interactuamos con el pentagrama. Las obras musicales que transcribas siguen siendo propiedad de sus respectivos autores originales. Por favor, transcribe con responsabilidad."
  },
  en: {
    importBtn: "Import .json", newScoreBtn: "+ New Score", backBtn: "← Back",
    exportJsonBtn: "Download .json", exportPdfBtn: "Export PDF",
    heroTitle: "The art of preserving music",
    heroSub: "Your repertoire deserves a fitting home. A digital ecosystem designed to transcribe with absolute precision, practice interactively, and build the musical archive of your life.",
    goToCatalog: "My Catalog", catalogTitle: "My Catalog",
    searchPlaceholder: "Search...", searchCodexPlaceholder: "Search in The Codex...", filterBtn: "Filters ⧨",
    lblHands: "Staves", optAll: "Any", optBothHands: "Both staves", optTrebleOnly: "Treble only (Right)", optBassOnly: "Bass only (Left)",
    emptyLibraryTitle: "Empty catalog", emptyLibrary: "Click «New Score» in the top right or change your search filters to start.",
    lblTitle: "Title", lblComposer: "Composer(s)", lblTimeSig: "Time Sig.", lblKeySig: "Key",
    lblActiveMeasure: "Measure", btnPrev: "‹", btnNext: "›",
    btnAddMeasure: "+ measure", btnDelMeasure: "delete", lblTreble: "Treble", lblBass: "Bass",
    lblNote: "Note", lblRest: "Rest", lblPitch: "Pitch", lblAccidental: "Acc.",
    lblOctave: "Octave", lblDuration: "Duration", lblDotted: "Dotted", lblDynamics: "Dynamics",
    lblFingering: "Finger", lblLyric: "Lyric", lblInputStaff: "Note Editor",
    btnAddNote: "Add note", btnUndoNote: "Undo",
    lblMeasureDetails: "Directives", lblRepStart: "Start ‖:", lblRepEnd: "End :‖",
    lblDirective: "Jump/Fine", untitled: "Untitled", unknownAuthor: "Unknown", measuresTxt: "measures",
    editBtn: "✎ Edit", viewBtn: "👁 View", copyBtn: "⎘ Copy", deleteBtn: "🗑️ Delete", saveCopyBtn: "Save a copy", savedToCatalog: "Score saved to My Catalog",
    delConfirm: "Delete?", delMeasureConfirm: "Delete measure?",
    minMeasureAlert: "Minimum one measure.", toggleViewBtn: "Toggle Viewer", viewMode: "👁️ View Score", editMode: "✎ Edit Score",
    practiceBtn: "🎤 Practice Mode", practiceDemo: "Practice mode (DEMO) started. Play the highlighted note!", practiceWin: "Congratulations! You completed the score.", practiceErr: "No notes found in Treble clef to practice.", practiceMicErr: "Microphone error: Please grant browser permissions.",
    codexBtn: "The Codex", publishBtn: "🌍 Publish",
    codexSubtitle: "The Library of Alexandria for sheet music. Explore, clone, and study community masterpieces.",
    codexLoading: "Loading The Codex...", codexEmpty: "No public scores yet.", codexFilterEmpty: "No scores match your filters.", codexError: "Could not connect to The Codex.", cloneCodexBtn: "⎘ Save a copy",
    account: "Account", login: "Sign in", register: "Register",
    subtitleLogin: "Sign in to sync your catalog with the cloud and publish to The Codex.", subtitleRegister: "Create free account.",
    logout: "Sign out", google: "Google", genericError: "Error.",
    lblPassword: "Password", displayName: "Name", photoUrl: "Photo (Optional)", saveProfile: "Save",
    deleteAccount: "Delete account", deleteWarning: "Delete data?", reauthNeeded: "Re-authenticate.",
    sortLikes: "Most Popular ❤️", sortRecent: "Newest first", sortOldest: "Oldest first", sortNumAsc: "Number (asc.)", sortNumDesc: "Number (desc.)", sortTitleAsc: "Title (A-Z)", sortAuthorAsc: "Author (A-Z)",
    byPublisher: "by:",
    footerText: "Ebony & Ivory is a project built by and for music lovers, designed to elevate how we interact with the staff. The musical works you transcribe remain the property of their respective original authors. Please transcribe responsibly."
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
  
  const searchCodex = document.getElementById("searchCodex");
  if (searchCodex) searchCodex.placeholder = t("searchCodexPlaceholder");
  
  const codexSub = document.getElementById("codexSubtitle");
  if (codexSub) codexSub.textContent = t("codexSubtitle");

  emit("langchange", lang);
};