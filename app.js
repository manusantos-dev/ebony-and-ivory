/* =========================================================================
   EBONY & IVORY — app.js
   ========================================================================= */
(function () {
  "use strict";

  /* -----------------------------------------------------------------------
     Diccionario Bilingüe (i18n)
     ----------------------------------------------------------------------- */
  const translations = {
    es: {
      importBtn: "Importar .json", newScoreBtn: "+ Nueva partitura", backBtn: "← Volver al Catálogo",
      exportJsonBtn: "Descargar .json", exportPdfBtn: "Exportar PDF", savedIndicator: "Guardado ✓",
      heroTitle: "El arte de preservar la música",
      heroSub: "Un lienzo digital estandarizado para transcribir, clasificar y eternizar tus partituras con una elegancia inigualable.",
      goToCatalog: "Abrir mi Catálogo", catalogTitle: "Catálogo de Partituras",
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
      lblDirective: "Indicación (Fine, D.C.)", lblTempo: "Texto libre / Tempo",
      footerText: "Ebony & Ivory es una herramienta personal para transcribir y archivar partituras. Las obras que reescribas siguen perteneciendo a sus autores originales.",
      untitled: "Sin título", unknownAuthor: "Autor desconocido", measuresTxt: "compases",
      editBtn: "✎ Editar", copyBtn: "⎘ Copiar", deleteBtn: "🗑️ Borrar",
      delConfirm: "¿Eliminar partitura? No se puede deshacer.", delMeasureConfirm: "¿Eliminar este compás?",
      copySuffix: "(copia)", minMeasureAlert: "La partitura necesita al menos un compás."
    },
    en: {
      importBtn: "Import .json", newScoreBtn: "+ New Score", backBtn: "← Back to Catalog",
      exportJsonBtn: "Download .json", exportPdfBtn: "Export PDF", savedIndicator: "Saved ✓",
      heroTitle: "The art of preserving music",
      heroSub: "A standardized digital canvas to transcribe, classify, and immortalize your sheet music with unmatched elegance.",
      goToCatalog: "Open my Catalog", catalogTitle: "Sheet Music Catalog",
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
      lblDirective: "Directive (Fine, D.C.)", lblTempo: "Free text / Tempo",
      footerText: "Ebony & Ivory is a personal tool for transcribing and archiving sheet music. Rewritten works still belong to their original authors.",
      untitled: "Untitled", unknownAuthor: "Unknown author", measuresTxt: "measures",
      editBtn: "✎ Edit", copyBtn: "⎘ Copy", deleteBtn: "🗑️ Delete",
      delConfirm: "Delete this score? This cannot be undone.", delMeasureConfirm: "Delete this measure?",
      copySuffix: "(copy)", minMeasureAlert: "The score needs at least one measure."
    }
  };

  let currentLang = "es";

  window.setLang = function(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang][key]) el.innerHTML = translations[lang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[lang][key]) el.setAttribute('placeholder', translations[lang][key]);
    });
    
    if (document.getElementById("viewLibrary") && !document.getElementById("viewLibrary").hidden) renderLibrary();
    if (document.getElementById("viewEditor") && !document.getElementById("viewEditor").hidden) renderScore();
  };

  function t(key) { return translations[currentLang][key] || key; }

  /* -----------------------------------------------------------------------
     Animación de Fondo (Inicio)
     ----------------------------------------------------------------------- */
  function createFloatingNotes() {
    const container = document.getElementById('floatingNotes');
    const symbols = ['♪', '♫', '♬', '♭', '♮', '♯', '𝄞', '𝄢'];
    for(let i=0; i<15; i++) {
        let note = document.createElement('div');
        note.className = 'note-anim'; note.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        note.style.left = Math.random() * 100 + 'vw';
        note.style.animationDuration = (Math.random() * 10 + 10) + 's';
        note.style.animationDelay = (Math.random() * 5) + 's';
        note.style.fontSize = (Math.random() * 30 + 20) + 'px';
        container.appendChild(note);
    }
  }
  createFloatingNotes();

  /* -----------------------------------------------------------------------
     Custom Dropdown Tonalidad (Notación US / EU)
     ----------------------------------------------------------------------- */
  const customKeySig = document.getElementById('customKeySig');
  const customKeySigSelected = document.getElementById('customKeySigSelected');
  const customKeySigOptions = document.getElementById('customKeySigOptions');
  const hiddenKeySigInput = document.getElementById('keySig');

  customKeySigSelected.addEventListener('click', function(e) {
      e.stopPropagation();
      customKeySig.classList.toggle('active');
  });

  customKeySigOptions.addEventListener('click', function(e) {
      const item = e.target.closest('div');
      if (item && item.hasAttribute('data-val')) {
          const val = item.getAttribute('data-val');
          hiddenKeySigInput.value = val;
          customKeySigSelected.innerHTML = item.innerHTML;
          customKeySig.classList.remove('active');
          if (currentScore) { currentScore.keySig = val; renderScore(); }
      }
  });

  document.addEventListener('click', function() { customKeySig.classList.remove('active'); });

  function updateCustomSelectUI(val) {
      const option = customKeySigOptions.querySelector(`div[data-val="${val}"]`);
      if (option) { customKeySigSelected.innerHTML = option.innerHTML; hiddenKeySigInput.value = val; }
  }

  /* -----------------------------------------------------------------------
     Constantes e Identificadores (PDF y VexFlow)
     ----------------------------------------------------------------------- */
  const STORAGE_KEY = "ebony_ivory:scores";
  const DURATION_QUARTERS = { w: 4, h: 2, q: 1, "8": 0.5, "16": 0.25, "32": 0.125 };
  
  // PARÁMETROS NUEVOS DE DISTRIBUCIÓN
  const MEASURES_PER_LINE = 4; // Cambiado a 4 según tu petición
  const LINES_PER_PAGE = 5;    // Líneas por hoja A4
  
  const FIRST_OF_LINE_WIDTH = 250; 
  const REST_OF_LINE_WIDTH = 210;
  const STAVE_GAP = 92;     
  const LINE_GAP = 180;     
  const TOP_MARGIN = 20;
  const LEFT_MARGIN = 10;

  let currentScore = null;     
  let editorState = { activeMeasure: 0, activeStaff: "treble", duration: "q", dotted: false };
  let saveTimeout = null;
  let libraryState = { query: "", sortBy: "numAsc", filterTime: "all", filterKey: "all", filterHands: "all" };

  /* -----------------------------------------------------------------------
     Utilidades
     ----------------------------------------------------------------------- */
  function uid() { return "s_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function nextPlateNumber() { const all = loadAll(); const scores = Object.values(all); if (scores.length === 0) return 1; return Math.max(...scores.map(s => s.plate || 0)) + 1; }
  function plateLabel(n) { return "E&I " + String(n).padStart(3, "0"); }
  function slugify(str) { return (str || "score").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "score"; }
  function formatDate(ts) { try { return new Date(ts).toLocaleDateString(currentLang === 'es' ? "es-ES" : "en-US", { day: "2-digit", month: "short", year: "numeric" }); } catch (e) { return ""; } }
  function downloadBlob(filename, text, type) { const blob = new Blob([text], { type: type || "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(() => URL.revokeObjectURL(url), 2000); }

  /* -----------------------------------------------------------------------
     Modelo de datos
     ----------------------------------------------------------------------- */
  function newMeasure() { return { treble: [], bass: [], repeatStart: false, repeatEnd: false, directive: "" }; }
  function newScore() { return { id: uid(), plate: nextPlateNumber(), title: "", composer: "", timeSig: "4/4", keySig: "C", tempoText: "", measures: [newMeasure()], createdAt: Date.now(), updatedAt: Date.now() }; }
  function loadAll() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch (e) { return {}; } }
  function saveAll(map) { localStorage.setItem(STORAGE_KEY, JSON.stringify(map)); }
  function persistScore(score) { score.updatedAt = Date.now(); const all = loadAll(); all[score.id] = score; saveAll(all); showSaveIndicator(); }
  function deleteScoreById(id) { const all = loadAll(); delete all[id]; saveAll(all); }

  function showSaveIndicator() {
      const ind = document.getElementById('saveIndicator');
      if(!ind) return;
      ind.classList.add('show');
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => { ind.classList.remove('show'); }, 1500);
  }

  /* -----------------------------------------------------------------------
     Navegación
     ----------------------------------------------------------------------- */
  const viewHome = document.getElementById("viewHome");
  const viewLibrary = document.getElementById("viewLibrary");
  const viewEditor = document.getElementById("viewEditor");
  const libraryActions = document.getElementById("libraryActions");
  const editorActions = document.getElementById("editorActions");

  function handleNavigation() {
    const hash = window.location.hash;
    if (hash.startsWith("#editor/")) {
        const scoreId = hash.split("/")[1];
        const allScores = loadAll();
        if (allScores[scoreId]) { showEditorUI(allScores[scoreId]); } else { window.location.hash = "#catalogo"; }
    } else if (hash === "#catalogo") {
        showLibraryUI();
    } else {
        showHomeUI();
    }
  }

  function showHomeUI() {
    currentScore = null;
    viewHome.hidden = false; viewLibrary.hidden = true; viewEditor.hidden = true;
    libraryActions.hidden = true; editorActions.hidden = true;
    document.body.classList.add('is-home');
    document.title = "Ebony & Ivory";
    window.scrollTo(0,0);
  }

  function showLibraryUI() {
    currentScore = null;
    viewHome.hidden = true; viewLibrary.hidden = false; viewEditor.hidden = true;
    libraryActions.hidden = false; editorActions.hidden = true;
    document.body.classList.remove('is-home');
    document.title = t('catalogTitle') + " — Ebony & Ivory";
    renderLibrary();
    window.scrollTo(0,0);
  }

  function showEditorUI(score) {
    currentScore = score;
    editorState = { activeMeasure: 0, activeStaff: "treble", duration: "q", dotted: false };
    viewHome.hidden = true; viewLibrary.hidden = true; viewEditor.hidden = false;
    libraryActions.hidden = true; editorActions.hidden = false;
    document.body.classList.remove('is-home');
    document.title = (score.title || t('untitled')) + " — Ebony & Ivory";
    fillEditorFields(); renderScore();
    window.scrollTo(0,0);
  }

  window.addEventListener("hashchange", handleNavigation);

  /* -----------------------------------------------------------------------
     Catálogo (Filtros y Búsqueda)
     ----------------------------------------------------------------------- */
  const libraryGrid = document.getElementById("libraryGrid");
  const libraryEmpty = document.getElementById("libraryEmpty");
  const elSearch = document.getElementById("searchScores");
  const elSort = document.getElementById("sortScores");
  const elBtnFilters = document.getElementById("btnToggleFilters");
  const elFiltersPanel = document.getElementById("catalogFilters");
  const elFilterTime = document.getElementById("filterTimeSig");
  const elFilterKey = document.getElementById("filterKeySig");
  const elFilterHands = document.getElementById("filterHands");

  elSearch.addEventListener("input", (e) => { libraryState.query = e.target.value.toLowerCase(); renderLibrary(); });
  elSort.addEventListener("change", (e) => { libraryState.sortBy = e.target.value; renderLibrary(); });
  elBtnFilters.addEventListener("click", () => { elFiltersPanel.hidden = !elFiltersPanel.hidden; });
  elFilterTime.addEventListener("change", (e) => { libraryState.filterTime = e.target.value; renderLibrary(); });
  elFilterKey.addEventListener("change", (e) => { libraryState.filterKey = e.target.value; renderLibrary(); });
  elFilterHands.addEventListener("change", (e) => { libraryState.filterHands = e.target.value; renderLibrary(); });

  function renderLibrary() {
    const all = loadAll(); let scores = Object.values(all);
    if (libraryState.query) { scores = scores.filter(s => (s.title || "").toLowerCase().includes(libraryState.query) || (s.composer || "").toLowerCase().includes(libraryState.query) || plateLabel(s.plate).toLowerCase().includes(libraryState.query)); }
    scores = scores.filter(s => {
        let match = true;
        if (libraryState.filterTime !== "all" && s.timeSig !== libraryState.filterTime) match = false;
        if (libraryState.filterKey !== "all" && s.keySig !== libraryState.filterKey) match = false;
        if (libraryState.filterHands !== "all") {
            let hasTreble = s.measures.some(m => m.treble && m.treble.length > 0); let hasBass = s.measures.some(m => m.bass && m.bass.length > 0);
            if (libraryState.filterHands === "both" && (!hasTreble || !hasBass)) match = false;
            if (libraryState.filterHands === "treble" && hasBass) match = false;
            if (libraryState.filterHands === "bass" && hasTreble) match = false;
        } return match;
    });

    scores.sort((a, b) => {
        if (libraryState.sortBy === "numAsc") return a.plate - b.plate; if (libraryState.sortBy === "numDesc") return b.plate - a.plate;
        if (libraryState.sortBy === "dateDesc") return b.updatedAt - a.updatedAt; if (libraryState.sortBy === "dateAsc") return a.updatedAt - b.updatedAt;
        if (libraryState.sortBy === "titleAsc") return (a.title || "").localeCompare(b.title || ""); if (libraryState.sortBy === "authorAsc") return (a.composer || "").localeCompare(b.composer || ""); return 0;
    });

    libraryGrid.innerHTML = "";
    if (scores.length === 0) { libraryEmpty.hidden = false; libraryGrid.hidden = true; } else {
        libraryEmpty.hidden = true; libraryGrid.hidden = false;
        scores.forEach((score) => {
          const card = document.createElement("div"); card.className = "score-card";
          card.innerHTML = `<span class="card-eyebrow">${plateLabel(score.plate)} · ${score.timeSig}</span><h3>${escapeHtml(score.title || t('untitled'))}</h3><p class="composer">${escapeHtml(score.composer || t('unknownAuthor'))}</p><div class="meta"><span>${score.measures.length} ${t('measuresTxt')}</span><span>${formatDate(score.updatedAt)}</span></div><div class="card-actions-row"><button class="btn-card" data-action="edit">${t('editBtn')}</button><button class="btn-card" data-action="duplicate">${t('copyBtn')}</button><button class="btn-card btn-danger-card" data-action="delete">${t('deleteBtn')}</button></div>`;
          card.addEventListener("click", (e) => {
            const action = e.target.closest("[data-action]");
            if (action) {
              e.stopPropagation();
              if (action.dataset.action === "delete") { if (confirm(t('delConfirm'))) { deleteScoreById(score.id); renderLibrary(); } } 
              else if (action.dataset.action === "duplicate") { const copy = JSON.parse(JSON.stringify(score)); copy.id = uid(); copy.plate = nextPlateNumber(); copy.title = (score.title || t('untitled')) + " " + t('copySuffix'); copy.createdAt = copy.updatedAt = Date.now(); persistScore(copy); renderLibrary(); } 
              else if (action.dataset.action === "edit") { window.location.hash = "#editor/" + score.id; }
              return;
            } window.location.hash = "#editor/" + score.id;
          }); libraryGrid.appendChild(card);
        });
    }
  }

  /* -----------------------------------------------------------------------
     Campos del editor
     ----------------------------------------------------------------------- */
  const elTitle = document.getElementById("scoreTitle"); const elComposer = document.getElementById("scoreComposer");
  const elTimeSig = document.getElementById("timeSig");
  const elTempoText = document.getElementById("tempoText"); const elActiveMeasureLabel = document.getElementById("activeMeasureLabel");
  const elRepeatStart = document.getElementById("repeatStart"); const elRepeatEnd = document.getElementById("repeatEnd");
  const elDirective = document.getElementById("directiveSelect");

  function fillEditorFields() { 
    elTitle.value = currentScore.title || ""; elComposer.value = currentScore.composer || ""; 
    elTimeSig.value = currentScore.timeSig || "4/4"; 
    updateCustomSelectUI(currentScore.keySig || "C");
    elTempoText.value = currentScore.tempoText || ""; syncMeasureControls(); 
  }

  [elTitle, elComposer].forEach((el) => el.addEventListener("input", () => { currentScore[el === elTitle ? "title" : "composer"] = el.value; renderScore(); }));
  elTimeSig.addEventListener("change", () => { currentScore.timeSig = elTimeSig.value; renderScore(); });
  elTempoText.addEventListener("input", () => { currentScore.tempoText = elTempoText.value; renderScore(); });

  function clampActiveMeasure() { editorState.activeMeasure = Math.max(0, Math.min(editorState.activeMeasure, currentScore.measures.length - 1)); }
  function syncMeasureControls() {
    clampActiveMeasure(); const m = currentScore.measures[editorState.activeMeasure];
    elActiveMeasureLabel.textContent = (editorState.activeMeasure + 1) + " / " + currentScore.measures.length;
    elRepeatStart.checked = !!m.repeatStart; elRepeatEnd.checked = !!m.repeatEnd; elDirective.value = m.directive || "";
  }

  document.getElementById("btnPrevMeasure").addEventListener("click", () => { editorState.activeMeasure--; clampActiveMeasure(); syncMeasureControls(); renderScore(); });
  document.getElementById("btnNextMeasure").addEventListener("click", () => { editorState.activeMeasure++; clampActiveMeasure(); syncMeasureControls(); renderScore(); });
  document.getElementById("btnAddMeasure").addEventListener("click", () => { currentScore.measures.push(newMeasure()); editorState.activeMeasure = currentScore.measures.length - 1; syncMeasureControls(); renderScore(); });
  document.getElementById("btnDeleteMeasure").addEventListener("click", () => {
    if (currentScore.measures.length <= 1) { alert(t('minMeasureAlert')); return; }
    if (!confirm(t('delMeasureConfirm'))) return;
    currentScore.measures.splice(editorState.activeMeasure, 1); clampActiveMeasure(); syncMeasureControls(); renderScore();
  });
  elRepeatStart.addEventListener("change", () => { currentScore.measures[editorState.activeMeasure].repeatStart = elRepeatStart.checked; renderScore(); });
  elRepeatEnd.addEventListener("change", () => { currentScore.measures[editorState.activeMeasure].repeatEnd = elRepeatEnd.checked; renderScore(); });
  elDirective.addEventListener("change", () => { currentScore.measures[editorState.activeMeasure].directive = elDirective.value; renderScore(); });

  const btnStaffTreble = document.getElementById("btnStaffTreble"); const btnStaffBass = document.getElementById("btnStaffBass");
  [btnStaffTreble, btnStaffBass].forEach((btn) => btn.addEventListener("click", () => { editorState.activeStaff = btn.dataset.staff; btnStaffTreble.classList.toggle("is-active", editorState.activeStaff === "treble"); btnStaffBass.classList.toggle("is-active", editorState.activeStaff === "bass"); }));
  const elIsRest = document.getElementById("isRest"); const elPitchFields = document.getElementById("pitchFields");
  const elPitchLetter = document.getElementById("pitchLetter"); const elPitchAccidental = document.getElementById("pitchAccidental");
  const elPitchOctave = document.getElementById("pitchOctave"); const elIsDotted = document.getElementById("isDotted");
  const elDynamicSelect = document.getElementById("dynamicSelect"); const durationGrid = document.getElementById("durationGrid");

  elIsRest.addEventListener("change", () => { elPitchFields.style.opacity = elIsRest.checked ? 0.4 : 1; elPitchFields.querySelectorAll("select").forEach((s) => (s.disabled = elIsRest.checked)); });
  durationGrid.addEventListener("click", (e) => { const btn = e.target.closest(".dur-btn"); if (!btn) return; editorState.duration = btn.dataset.dur; durationGrid.querySelectorAll(".dur-btn").forEach((b) => b.classList.toggle("is-active", b === btn)); });

  document.getElementById("btnAddNote").addEventListener("click", () => {
    currentScore.measures[editorState.activeMeasure][editorState.activeStaff].push({
      rest: elIsRest.checked, letter: elPitchLetter.value, accidental: elPitchAccidental.value, octave: parseInt(elPitchOctave.value, 10), duration: editorState.duration, dotted: elIsDotted.checked, dynamic: elDynamicSelect.value,
    }); elDynamicSelect.value = ""; renderScore();
  });
  document.getElementById("btnUndoNote").addEventListener("click", () => {
    if (currentScore.measures[editorState.activeMeasure][editorState.activeStaff].length > 0) { currentScore.measures[editorState.activeMeasure][editorState.activeStaff].pop(); renderScore(); }
  });

  /* -----------------------------------------------------------------------
     VexFlow Render Paginado (Para impresión perfecta en PDF)
     ----------------------------------------------------------------------- */
  const vexPagesContainer = document.getElementById("vexPagesContainer");

  function noteToVexKey(n) { let acc = n.accidental === "#" || n.accidental === "b" ? n.accidental : ""; return n.letter.toLowerCase() + acc + "/" + n.octave; }

  function buildVexNotes(staffNotes, clef) {
    const VF = Vex.Flow; const restKey = clef === "bass" ? "d/3" : "b/4"; const out = [];
    staffNotes.forEach((n) => {
      const durStr = n.duration + (n.dotted ? "d" : "") + (n.rest ? "r" : "");
      const keys = n.rest ? [restKey] : [noteToVexKey(n)];
      const sn = new VF.StaveNote({ clef: clef, keys: keys, duration: durStr });
      if (n.dotted) VF.Dot.buildAndAttach([sn], { all: true });
      if (!n.rest && n.accidental) sn.addModifier(new VF.Accidental(n.accidental), 0);
      if (n.dynamic) { sn.addModifier(new VF.Annotation(n.dynamic).setFont("Times", 12, "italic bold").setVerticalJustification( clef === "bass" ? VF.Annotation.VerticalJustify.TOP : VF.Annotation.VerticalJustify.BOTTOM ), 0); }
      out.push(sn);
    }); return out;
  }

  function quartersUsed(staffNotes) { return staffNotes.reduce((sum, n) => sum + (DURATION_QUARTERS[n.duration] || 0) * (n.dotted ? 1.5 : 1), 0); }
  function measureNeededQuarters(timeSig) { const [num, den] = timeSig.split("/").map(Number); return num * (4 / den); }

  function renderScore() {
    if (!currentScore) return;
    persistScore(currentScore);
    vexPagesContainer.innerHTML = "";

    if (typeof Vex === "undefined") {
      vexPagesContainer.innerHTML = '<p style="padding:40px;color:#8C2F39;font-weight:bold;">No se ha podido cargar VexFlow.</p>'; return;
    }

    try {
      const VF = Vex.Flow;
      const measures = currentScore.measures;
      const [num, den] = currentScore.timeSig.split("/").map(Number);
      
      const totalLines = Math.ceil(measures.length / MEASURES_PER_LINE);
      const totalPages = Math.ceil(totalLines / LINES_PER_PAGE) || 1;
      const totalWidth = LEFT_MARGIN * 2 + FIRST_OF_LINE_WIDTH + (REST_OF_LINE_WIDTH * (MEASURES_PER_LINE - 1));
      
      // Icono SVG para el pie de página
      const svgIcon = `<svg class="print-logo-isotipo" viewBox="0 0 100 100"><rect x="10" y="20" width="80" height="60" rx="8" fill="currentColor"/><rect x="25" y="20" width="12" height="35" fill="var(--paper)"/><rect x="44" y="20" width="12" height="35" fill="var(--paper)"/><rect x="63" y="20" width="12" height="35" fill="var(--paper)"/></svg>`;

      for (let p = 0; p < totalPages; p++) {
          const pageDiv = document.createElement('div');
          pageDiv.className = 'paper-page';
          
          // Encabezado de Impresión (Invisible en web, visible en PDF excepto pág 1)
          const printHeader = document.createElement('div');
          printHeader.className = 'print-header-content';
          printHeader.innerHTML = `<span>${escapeHtml(currentScore.title)} — ${escapeHtml(currentScore.composer)}</span> <span>${plateLabel(currentScore.plate)}</span>`;
          pageDiv.appendChild(printHeader);

          // Si es la página 1, añadimos el Título Grande
          let startY = TOP_MARGIN;
          if (p === 0) {
              const head = document.createElement("div"); head.className = "score-letterhead";
              head.innerHTML = `<h2>${escapeHtml(currentScore.title || t('untitled'))}</h2><p>${escapeHtml(currentScore.composer || "")}</p>`;
              pageDiv.appendChild(head);
              startY += 100; // Desplazar el primer pentagrama hacia abajo
          }

          // Pie de Página de Impresión
          const printFooter = document.createElement('div');
          printFooter.className = 'print-footer-content';
          printFooter.innerHTML = `<span>${svgIcon}</span> <span>Pág ${p + 1} de ${totalPages}</span>`;
          pageDiv.appendChild(printFooter);

          // Contenedor SVG de VexFlow
          const svgWrap = document.createElement('div');
          pageDiv.appendChild(svgWrap);
          vexPagesContainer.appendChild(pageDiv);

          // Determinar cuántas líneas tocan en esta página
          const linesOnThisPage = Math.min(LINES_PER_PAGE, totalLines - (p * LINES_PER_PAGE));
          const pageHeight = startY + (linesOnThisPage * LINE_GAP) + 20;

          const renderer = new VF.Renderer(svgWrap, VF.Renderer.Backends.SVG);
          renderer.resize(totalWidth, pageHeight);
          const ctx = renderer.getContext();
          const hitRects = [];

          for (let l = 0; l < linesOnThisPage; l++) {
              const globalLineIdx = (p * LINES_PER_PAGE) + l;
              
              for (let m = 0; m < MEASURES_PER_LINE; m++) {
                  const idx = (globalLineIdx * MEASURES_PER_LINE) + m;
                  if (idx >= measures.length) break;
                  
                  const measure = measures[idx];
                  const isFirstOfLine = (m === 0);
                  const width = isFirstOfLine ? FIRST_OF_LINE_WIDTH : REST_OF_LINE_WIDTH;
                  const x = LEFT_MARGIN + (isFirstOfLine ? 0 : FIRST_OF_LINE_WIDTH + (REST_OF_LINE_WIDTH * (m - 1)));
                  
                  const yTreble = startY + (l * LINE_GAP); 
                  const yBass = yTreble + STAVE_GAP;

                  const staveTreble = new VF.Stave(x, yTreble, width); const staveBass = new VF.Stave(x, yBass, width);

                  if (isFirstOfLine) {
                    staveTreble.addClef("treble"); staveBass.addClef("bass");
                    if (currentScore.keySig && currentScore.keySig !== "C") { staveTreble.addKeySignature(currentScore.keySig); staveBass.addKeySignature(currentScore.keySig); }
                  }
                  if (idx === 0) { staveTreble.addTimeSignature(currentScore.timeSig); staveBass.addTimeSignature(currentScore.timeSig); }

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

                  const trebleNotes = buildVexNotes(measure.treble, "treble"); const bassNotes = buildVexNotes(measure.bass, "bass");

                  if (trebleNotes.length > 0) {
                    const vTreble = new VF.Voice({ num_beats: num, beat_value: den }).setMode(VF.Voice.Mode.SOFT); vTreble.addTickables(trebleNotes);
                    try { VF.Beam.generateBeams(trebleNotes, { beam_rests: false }).forEach(b => b.setContext(ctx).draw()); } catch(e) {}
                    new VF.Formatter().joinVoices([vTreble]).format([vTreble], width - 30); vTreble.draw(ctx, staveTreble);
                  }
                  if (bassNotes.length > 0) {
                    const vBass = new VF.Voice({ num_beats: num, beat_value: den }).setMode(VF.Voice.Mode.SOFT); vBass.addTickables(bassNotes);
                    try { VF.Beam.generateBeams(bassNotes, { beam_rests: false }).forEach(b => b.setContext(ctx).draw()); } catch(e) {}
                    new VF.Formatter().joinVoices([vBass]).format([vBass], width - 30); vBass.draw(ctx, staveBass);
                  }

                  if (idx === 0 && currentScore.tempoText && trebleNotes.length > 0) { trebleNotes[0].addModifier(new VF.Annotation(currentScore.tempoText).setFont("Inter", 12, "bold").setVerticalJustification(VF.Annotation.VerticalJustify.TOP), 0); }
                  if (measure.directive) {
                    const targetArr = trebleNotes.length ? trebleNotes : bassNotes;
                    if (targetArr.length) targetArr[targetArr.length - 1].addModifier(new VF.Annotation(measure.directive).setFont("Cormorant Garamond", 15, "italic").setVerticalJustification(VF.Annotation.VerticalJustify.TOP), 0);
                  }
                  hitRects.push({ x, y: yTreble - 28, width, height: (yBass + 70) - (yTreble - 28), idx });
              }
          }

          // Interactividad y Clics (Ajustando ViewBox)
          const svg = svgWrap.querySelector("svg");
          if (svg) {
            svg.setAttribute("viewBox", `0 0 ${totalWidth} ${pageHeight}`);
            svg.removeAttribute("width"); svg.removeAttribute("height");
            const ns = "http://www.w3.org/2000/svg";
            hitRects.forEach((hr) => {
              const g = document.createElementNS(ns, "g"); g.setAttribute("class", "measure-hit" + (hr.idx === editorState.activeMeasure ? " active" : ""));
              const rect = document.createElementNS(ns, "rect");
              rect.setAttribute("x", hr.x - 4); rect.setAttribute("y", hr.y); rect.setAttribute("width", hr.width + 4); rect.setAttribute("height", hr.height);
              rect.setAttribute("fill", hr.idx === editorState.activeMeasure ? "rgba(179, 142, 80, 0.15)" : "transparent"); rect.setAttribute("rx", "4");
              g.appendChild(rect);
              g.addEventListener("click", () => { editorState.activeMeasure = hr.idx; syncMeasureControls(); renderScore(); });
              svg.insertBefore(g, svg.firstChild);
            });
          }
      }
      updateBeatCounters();
    } catch (err) { console.error(err); vexPagesContainer.innerHTML = `<p style="padding:40px;color:#8C2F39;font-weight:bold;">Error matemático crítico al renderizar.</p>`; }
  }

  function updateBeatCounters() {
    const m = currentScore.measures[editorState.activeMeasure]; const needed = measureNeededQuarters(currentScore.timeSig);
    elActiveMeasureLabel.textContent = `${editorState.activeMeasure + 1}/${currentScore.measures.length} · ♩ Sol ${trim(quartersUsed(m.treble))}/${trim(needed)} · Fa ${trim(quartersUsed(m.bass))}/${trim(needed)}`;
  }
  function trim(n) { return Number.isInteger(n) ? n : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""); }

  /* -----------------------------------------------------------------------
     Exportar / Importar
     ----------------------------------------------------------------------- */
  document.getElementById("btnExportJson").addEventListener("click", () => { downloadBlob(slugify(currentScore.title) + ".json", JSON.stringify(currentScore, null, 2)); });
  
  // FUNCION DE PDF MEJORADA (Cambia temporalmente el titulo para nombrar el archivo .pdf)
  document.getElementById("btnExportPdf").addEventListener("click", () => { 
      const originalTitle = document.title;
      const safeTitle = (currentScore.title || t('untitled')).trim();
      const safeAuthor = (currentScore.composer || t('unknownAuthor')).trim();
      document.title = `${safeTitle} — ${safeAuthor}`;
      
      window.print();
      
      // Tras imprimir, restaurar título
      setTimeout(() => { document.title = originalTitle; }, 500);
  });

  document.getElementById("btnImport").addEventListener("click", () => document.getElementById("fileImport").click());
  document.getElementById("fileImport").addEventListener("change", (e) => {
    const file = e.target.files[0]; if (!file) return; const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result); if (!data.measures) throw new Error("Format error");
        data.id = uid(); data.plate = nextPlateNumber(); data.updatedAt = Date.now();
        persistScore(data); window.location.hash = "#catalogo";
      } catch (err) { alert("Error: " + err.message); } e.target.value = ""; 
    }; reader.readAsText(file);
  });

  document.getElementById("btnNewScore").addEventListener("click", () => { const score = newScore(); persistScore(score); window.location.hash = "#editor/" + score.id; });
  document.getElementById("btnBackLibrary").addEventListener("click", () => { window.location.hash = "#catalogo"; });
  document.getElementById("brandHome").addEventListener("click", () => { window.location.hash = "#inicio"; });

  /* -----------------------------------------------------------------------
     Arranque Inicial
     ----------------------------------------------------------------------- */
  setLang('es'); 
  if(!window.location.hash || window.location.hash === "#" || window.location.hash === "") { window.location.hash = "#inicio"; } 
  else { handleNavigation(); }
})();
