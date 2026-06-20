/* =========================================================================
   EBONY & IVORY — config.js
   Datos estáticos: Configuración Firebase, i18n y Partitura de Ejemplo
   ========================================================================= */
window.EI_CONFIG = {
  firebase: {
    apiKey: "AIzaSyBEtGSX5ZS8WMakeer6M0ekASismF9t87w",
    authDomain: "ebony-and-ivory-app.firebaseapp.com",
    projectId: "ebony-and-ivory-app",
    storageBucket: "ebony-and-ivory-app.firebasestorage.app",
    messagingSenderId: "1081906794092",
    appId: "1:1081906794092:web:77f1ec26b703b56ff3d249"
  },
  
  i18n: {
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
      logout: 'Cerrar sesión', google: 'Continuar con Google', genericError: 'Algo no ha ido bien.'
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
      logout: 'Sign out', google: 'Continue with Google', genericError: 'Something went wrong.'
    }
  },

  getExampleScore: function(lang) {
    function note(letter, octave, duration, dotted) { return { rest: false, letter: letter, accidental: '', octave: octave, duration: duration, dotted: !!dotted, dynamic: '' }; }
    function measure(trebleNotes, bassNotes, extra) { return Object.assign({ treble: trebleNotes, bass: bassNotes, repeatStart: false, repeatEnd: false, directive: '' }, extra || {}); }
    const m1 = () => [note('E', 4, 'q'), note('E', 4, 'q'), note('F', 4, 'q'), note('G', 4, 'q')];
    const m2 = () => [note('G', 4, 'q'), note('F', 4, 'q'), note('E', 4, 'q'), note('D', 4, 'q')];
    const m3 = () => [note('C', 4, 'q'), note('C', 4, 'q'), note('D', 4, 'q'), note('E', 4, 'q')];
    const m4 = () => [note('E', 4, 'q', true), note('D', 4, '8'), note('D', 4, 'h')];
    const m8 = () => [note('D', 4, 'q', true), note('C', 4, '8'), note('C', 4, 'h')];
    const bassRoot = (letter) => [note(letter, 3, 'w')];

    return {
      id: 'example-ode-to-joy', isExample: true, plate: 0,
      title: lang === 'es' ? 'Sinfonía N.º 9 - Himno a la Alegría' : 'Symphony No. 9 - Ode to Joy',
      composer: 'Ludwig van Beethoven',
      timeSig: '4/4', keySig: 'C', bpm: 100,
      measures: [
        measure(m1(), bassRoot('C'), { repeatStart: true }), measure(m2(), bassRoot('G')), measure(m3(), bassRoot('C')), measure(m4(), bassRoot('G')),
        measure(m1(), bassRoot('C')), measure(m2(), bassRoot('G')), measure(m3(), bassRoot('C')), measure(m8(), bassRoot('G'), { repeatEnd: true, directive: 'Fine' })
      ],
      createdAt: 0, updatedAt: 0,
    };
  }
};
