import { state } from "../core/state.js";
import { emit } from "../core/events.js";

const translations = {
  es: {
    importBtn: "Importar .json", newScoreBtn: "+ Nueva partitura", backBtn: "← Volver",
    exportJsonBtn: "Descargar .json", exportPdfBtn: "Exportar PDF",
    heroTitle: "El arte de preservar la música",
    heroSub: "Tu repertorio merece un hogar a su altura. Un ecosistema digital diseñado para transcribir con precisión absoluta, practicar de forma interactiva y construir el archivo musical de tu vida.",
    goToCatalog: "Mi Catálogo", catalogTitle: "Mi Catálogo", codexTitle: "El Códice 📜",
    searchPlaceholder: "Buscar por título, autor...", searchCodexPlaceholder: "Buscar en El Códice...", filterBtn: "Filtros ⧨",
    lblHands: "Manos / Pentagramas", optAll: "Cualquiera", optBothHands: "Ambas manos", optTrebleOnly: "Solo Clave de Sol", optBassOnly: "Solo Clave de Fa",
    emptyLibraryTitle: "Tu catálogo está vacío", emptyLibrary: "Pulsa «Nueva partitura» en la esquina superior derecha o cambia los filtros de búsqueda para empezar.",
    lblScoreMeta: "Metadatos de la Obra", lblTitle: "Título de la Obra", plhTitle: "Ej: Claro de Luna", lblComposer: "Compositor/es", plhComposer: "Ej: L. V. Beethoven",
    lblTimeSig: "Compás", lblKeySig: "Tonalidad", lblDifficulty: "Nivel",
    diffBeginner: "🟢 Principiante", diffIntermediate: "🟠 Intermedio", diffAdvanced: "🔴 Avanzado",
    lblActiveMeasure: "Compás", btnPrev: "‹ ant", btnNext: "sig ›",
    btnAddMeasure: "+ compás", btnDelMeasure: "eliminar", lblInputStaff: "Inserción Musical", lblTreble: "Clave de Sol", lblBass: "Clave de Fa",
    lblNote: "Nota", lblRest: "Insertar como Silencio", lblPitch: "Nota", lblAccidental: "Alt.",
    optC: "Do (C)", optD: "Re (D)", optE: "Mi (E)", optF: "Fa (F)", optG: "Sol (G)", optA: "La (A)", optB: "Si (B)",
    lblOctave: "Octava", lblDuration: "Duración", lblDotted: "Añadir Puntillo", lblDynamics: "Dinámica",
    lblFingering: "Dedo", lblLyric: "Letra / Texto", plhLyric: "Ej: La",
    btnAddNote: "Añadir nota", btnAddChordNote: "+ Acorde", btnUndoNote: "Deshacer",
    lblMeasureDetails: "Estructura del Compás", lblRepStart: "‖: Iniciar Repetición", lblRepEnd: ":‖ Cerrar Repetición",
    lblDirective: "Salto o Final", untitled: "Sin título", unknownAuthor: "Desconocido", measuresTxt: "compases",
    editBtn: "✎ Editar", viewBtn: "👁 Ver", copyBtn: "⎘ Copiar", deleteBtn: "🗑️ Borrar", saveCopyBtn: "Guardar una copia", savedToCatalog: "Partitura guardada en Mi Catálogo", cloneBtn: "⎘ Duplicar",
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
    deleteAccount: "Borrar cuenta", deleteWarning: "Estás a punto de eliminar tu cuenta y todo tu catálogo privado. Esta acción es irreversible. ¿Deseas continuar?",
    sortLikes: "Más populares ❤️", sortRecent: "Más recientes", sortOldest: "Más antiguas", sortDateDesc: "Última edición (Reciente)", sortDateAsc: "Última edición (Antigua)", sortTitleAsc: "Título (A-Z)", sortAuthorAsc: "Autor (A-Z)",
    byPublisher: "por:", deletedUser: "usuario eliminado",
    footerText: "Ebony & Ivory es un proyecto creado por y para amantes de la música, diseñado para elevar la forma en que interactuamos con el pentagrama. Las obras musicales que transcribas siguen siendo propiedad de sus respectivos autores originales. Por favor, transcribe con responsabilidad.",
    termsLink: "Términos y Condiciones",
    reportLink: "Reportar Copyright (DMCA)",
    termsMsg: "Al usar Ebony & Ivory, confirmas que tienes los derechos para transcribir las obras que publicas o que estas pertenecen al Dominio Público. Nos reservamos el derecho a eliminar cualquier contenido que infrinja derechos de autor de terceros.",
    reportMsg: "Para notificar una infracción de derechos de autor, por favor envía un correo detallando la obra y el enlace a:<br><br><strong>ebonyivory.app@gmail.com</strong>",
    acceptBtn: "Aceptar",
    cancelBtn: "Cancelar",
    understoodBtn: "Entendido",
    savedCloud: "Guardado en la nube",
    syncing: "Sincronizando..."
  },
  en: {
    importBtn: "Import .json", newScoreBtn: "+ New Score", backBtn: "← Back",
    exportJsonBtn: "Download .json", exportPdfBtn: "Export PDF",
    heroTitle: "The art of preserving music",
    heroSub: "Your repertoire deserves a fitting home. A digital ecosystem designed to transcribe with absolute precision, practice interactively, and build the musical archive of your life.",
    goToCatalog: "My Catalog", catalogTitle: "My Catalog", codexTitle: "The Codex 📜",
    searchPlaceholder: "Search by title or author...", searchCodexPlaceholder: "Search in The Codex...", filterBtn: "Filters ⧨",
    lblHands: "Staves", optAll: "Any", optBothHands: "Both staves", optTrebleOnly: "Treble only (Right)", optBassOnly: "Bass only (Left)",
    emptyLibraryTitle: "Empty catalog", emptyLibrary: "Click «New Score» in the top right or change your search filters to start.",
    lblScoreMeta: "Score Metadata", lblTitle: "Title", plhTitle: "Ex: Moonlight Sonata", lblComposer: "Composer(s)", plhComposer: "Ex: L. V. Beethoven",
    lblTimeSig: "Time Sig.", lblKeySig: "Key", lblDifficulty: "Level",
    diffBeginner: "🟢 Beginner", diffIntermediate: "🟠 Intermediate", diffAdvanced: "🔴 Advanced",
    lblActiveMeasure: "Measure", btnPrev: "‹ prev", btnNext: "next ›",
    btnAddMeasure: "+ measure", btnDelMeasure: "delete", lblInputStaff: "Musical Input", lblTreble: "Treble", lblBass: "Bass",
    lblNote: "Note", lblRest: "Insert as Rest", lblPitch: "Pitch", lblAccidental: "Acc.",
    optC: "C", optD: "D", optE: "E", optF: "F", optG: "G", optA: "A", optB: "B",
    lblOctave: "Octave", lblDuration: "Duration", lblDotted: "Add Dot", lblDynamics: "Dynamics",
    lblFingering: "Finger", lblLyric: "Lyric", plhLyric: "Ex: Ah",
    btnAddNote: "Add note", btnAddChordNote: "+ Chord", btnUndoNote: "Undo",
    lblMeasureDetails: "Measure Structure", lblRepStart: "‖: Start Repeat", lblRepEnd: ":‖ End Repeat",
    lblDirective: "Jump/Fine", untitled: "Untitled", unknownAuthor: "Unknown", measuresTxt: "measures",
    editBtn: "✎ Edit", viewBtn: "👁 View", copyBtn: "⎘ Copy", deleteBtn: "🗑️ Delete", saveCopyBtn: "Save a copy", savedToCatalog: "Score saved to My Catalog", cloneBtn: "⎘ Clone",
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
    deleteAccount: "Delete account", deleteWarning: "You are about to delete your account and all your private catalog. This action cannot be undone. Proceed?",
    sortLikes: "Most Popular ❤️", sortRecent: "Newest first", sortOldest: "Oldest first", sortDateDesc: "Last edited (Newest)", sortDateAsc: "Last edited (Oldest)", sortTitleAsc: "Title (A-Z)", sortAuthorAsc: "Author (A-Z)",
    byPublisher: "by:", deletedUser: "deleted user",
    footerText: "Ebony & Ivory is a project built by and for music lovers, designed to elevate how we interact with the staff. The musical works you transcribe remain the property of their respective original authors. Please transcribe responsibly.",
    termsLink: "Terms and Conditions",
    reportLink: "Report Copyright (DMCA)",
    termsMsg: "By using Ebony & Ivory, you confirm that you have the rights to transcribe the published works or that they belong to the Public Domain. We reserve the right to remove any content that infringes third-party copyrights.",
    reportMsg: "To report a copyright infringement, please send an email detailing the work and the link to:<br><br><strong>ebonyivory.app@gmail.com</strong>",
    acceptBtn: "Accept",
    cancelBtn: "Cancel",
    understoodBtn: "Understood",
    savedCloud: "Saved to cloud",
    syncing: "Syncing..."
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
  
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (translations[lang][key]) el.placeholder = translations[lang][key];
  });
  
  const codexSub = document.getElementById("codexSubtitle");
  if (codexSub) codexSub.textContent = t("codexSubtitle");

  emit("langchange", lang);
};