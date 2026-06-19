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
      exportJsonBtn: "Exportar .json", exportPdfBtn: "Exportar PDF", saveBtn: "Guardar",
      heroEyebrow: "Tu catálogo personal", heroTitle: "Cada partitura, bajo el mismo sello.",
      heroSub: "Reescribe partituras de dominio público o crea las tuyas. Mismo papel, misma tinta, mismo orden — para siempre.",
      emptyLibraryTitle: "Tu atril está vacío",
      emptyLibrary: "Pulsa «Nueva partitura» en la esquina superior derecha o importa un archivo .json para comenzar a llenar tu catálogo.",
      lblTitle: "Título", lblComposer: "Compositor / origen", lblTimeSig: "Compás", lblKeySig: "Tonalidad",
      lblActiveMeasure: "Compás activo", btnPrev: "‹ anterior", btnNext: "siguiente ›",
      btnAddMeasure: "+ añadir compás", btnDelMeasure: "eliminar compás", lblInputStaff: "Pentagrama de entrada",
      lblTreble: "Clave de Sol", lblBass: "Clave de Fa", lblNote: "Nota", lblRest: "Silencio",
      lblPitch: "Nota", lblAccidental: "Alteración", lblOctave: "Octava", lblDuration: "Duración",
      lblDotted: "Con puntillo", lblDynamics: "Dinámica", btnAddNote: "Añadir al compás", btnUndoNote: "Deshacer última nota",
      lblMeasureDetails: "Compás · Detalles", lblRepStart: "Inicio repetición ‖:", lblRepEnd: "Fin repetición :‖</",
      lblDirective: "Indicación (Fine, D.C.)", lblTempo: "Texto libre / Tempo",
      paperHint: "Pulsa un compás en la partitura para hacerlo el compás activo.",
      footerText: "Ebony & Ivory es una herramienta personal para transcribir y archivar partituras. Las obras que reescribas siguen perteneciendo a sus autores originales; usa solo material de dominio público o con permiso.",
      // Alertas y dinámicos
      untitled: "Sin título", unknownAuthor: "Autor desconocido", measuresTxt: "compases",
      editBtn: "✎ Editar", copyBtn: "⎘ Copiar", deleteBtn: "🗑️ Borrar",
      delConfirm: "¿Eliminar partitura? No se puede deshacer.", delMeasureConfirm: "¿Eliminar este compás?",
      copySuffix: "(copia)", saved: "Guardado ✓", minMeasureAlert: "La partitura necesita al menos un compás."
    },
    en: {
      importBtn: "Import .json", newScoreBtn: "+ New Score", backBtn: "← Back to Library",
      exportJsonBtn: "Export .json", exportPdfBtn: "Export PDF", saveBtn: "Save",
      heroEyebrow: "Your personal catalog", heroTitle: "Every score, under the same seal.",
      heroSub: "Rewrite public domain scores or create your own. Same paper, same ink, same layout — forever.",
      emptyLibraryTitle: "Your library is empty",
      emptyLibrary: "Click «New Score» in the top right corner or import a .json file to begin building your catalog.",
      lblTitle: "Title", lblComposer: "Composer / origin", lblTimeSig: "Time Sig.", lblKeySig: "Key Sig.",
      lblActiveMeasure: "Active Measure", btnPrev: "‹ previous", btnNext: "next ›",
      btnAddMeasure: "+ add measure", btnDelMeasure: "delete measure", lblInputStaff: "Input Staff",
      lblTreble: "Treble Clef", lblBass: "Bass Clef", lblNote: "Note", lblRest: "Rest",
      lblPitch: "Pitch", lblAccidental: "Accidental", lblOctave: "Octave", lblDuration: "Duration",
      lblDotted: "Dotted", lblDynamics: "Dynamics", btnAddNote: "Add to measure", btnUndoNote: "Undo last note",
      lblMeasureDetails: "Measure · Details", lblRepStart: "Start repeat ‖:", lblRepEnd: "End repeat :‖</",
      lblDirective: "Directive (Fine, D.C.)", lblTempo: "Free text / Tempo",
      paperHint: "Click a measure on the sheet to make it active.",
      footerText: "Ebony & Ivory is a personal tool for transcribing and archiving sheet music. Rewritten works still belong to their original authors; use only public domain material or with permission.",
      // Alerts & Dynamics
      untitled: "Untitled", unknownAuthor: "Unknown author", measuresTxt: "measures",
      editBtn: "✎ Edit", copyBtn: "⎘ Copy", deleteBtn: "🗑️ Delete",
      delConfirm: "Delete this score? This cannot be undone.", delMeasureConfirm: "Delete this measure?",
      copySuffix: "(copy)", saved: "Saved ✓", minMeasureAlert: "The score needs at least one measure."
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
    
    if (viewLibrary && !viewLibrary.hidden) renderLibrary();
    if (viewEditor && !viewEditor.hidden) renderLetterhead();
  };

  function t(key) { return translations[currentLang][key] || key; }

  /* -----------------------------------------------------------------------
     Constantes e Identificadores
     ----------------------------------------------------------------------- */
  const STORAGE_KEY = "ebony_ivory:scores";

  const DURATION_QUARTERS = { w: 4, h: 2, q: 1, "8": 0.5, "16": 0.25, "32": 0.125 };
  const MEASURES_PER_LINE = 2;
  const FIRST_OF_LINE_WIDTH = 300;
  const REST_OF_LINE_WIDTH = 230;
  const STAVE_GAP = 92;     
  const LINE_GAP = 215;     
  const TOP_MARGIN = 40;
  const LEFT_MARGIN = 20;

  let currentScore = null;     
  let editorState = { activeMeasure: 0, activeStaff: "treble", duration: "q", dotted: false };

  /* -----------------------------------------------------------------------
     Utilidades
     ----------------------------------------------------------------------- */
  function uid() { return "s_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  // FIX: Calcula el siguiente número de placa basándose en lo que hay guardado realmente.
  function nextPlateNumber() {
    const all = loadAll();
    const scores = Object.values(all);
    if (scores.length === 0) return 1;
    const maxPlate = Math.max(...scores.map(s => s.plate || 0));
    return maxPlate + 1;
  }

  function plateLabel(n) { return "E&I " + String(n).padStart(3, "0"); }

  function slugify(str) {
    return (str || "score")
      .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "score";
  }

  function formatDate(ts) {
    try { return new Date(ts).toLocaleDateString(currentLang === 'es' ? "es-ES" : "en-US", { day: "2-digit", month: "short", year: "numeric" }); } 
    catch (e) { return ""; }
  }

  function downloadBlob(filename, text, type) {
    const blob = new Blob([text], { type: type || "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  /* -----------------------------------------------------------------------
     Modelo de datos
     ----------------------------------------------------------------------- */
  function newMeasure() { return { treble: [], bass: [], repeatStart: false, repeatEnd: false, directive: "" }; }

  function newScore() {
    return {
      id: uid(), plate: nextPlateNumber(), title: "", composer: "",
      timeSig: "4/4", keySig: "C", tempoText: "", measures: [newMeasure()],
      createdAt: Date.now(), updatedAt: Date.now(),
    };
  }

  function loadAll() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch (e) { return {}; } }
  function saveAll(map) { localStorage.setItem(STORAGE_KEY, JSON.stringify(map)); }
  function persistScore(score) { score.updatedAt = Date.now(); const all = loadAll(); all[score.id] = score; saveAll(all); }
  function deleteScoreById(id) { const all = loadAll(); delete all[id]; saveAll(all); }

  /* -----------------------------------------------------------------------
     Navegación
     ----------------------------------------------------------------------- */
  const viewLibrary = document.getElementById("viewLibrary");
  const viewEditor = document.getElementById("viewEditor");
  const libraryActions = document.getElementById("libraryActions");
  const editorActions = document.getElementById("editorActions");

  function showLibrary() {
    currentScore = null;
    viewLibrary.hidden = false; viewEditor.hidden = true;
    libraryActions.hidden = false; editorActions.hidden = true;
    document.title = "Ebony & Ivory — Sheet Music Library";
    renderLibrary();
    window.scrollTo(0,0);
  }

  function showEditor(score) {
    currentScore = score;
    editorState = { activeMeasure: 0, activeStaff: "treble", duration: "q", dotted: false };
    viewLibrary.hidden = true; viewEditor.hidden = false;
    libraryActions.hidden = true; editorActions.hidden = false;
    document.title = (score.title || t('untitled')) + " — Ebony & Ivory";
    fillEditorFields(); renderScore();
    window.scrollTo(0,0);
  }

  /* -----------------------------------------------------------------------
     Biblioteca
     ----------------------------------------------------------------------- */
  const libraryGrid = document.getElementById("libraryGrid");
  const libraryEmpty = document.getElementById("libraryEmpty");

  function renderLibrary() {
    const all = loadAll();
    const scores = Object.values(all).sort((a, b) => b.updatedAt - a.updatedAt);
    libraryGrid.innerHTML = "";
    
    if (scores.length === 0) {
        libraryEmpty.hidden = false;
        libraryGrid.hidden = true;
    } else {
        libraryEmpty.hidden = true;
        libraryGrid.hidden = false;
        
        scores.forEach((score) => {
          const card = document.createElement("div");
          card.className = "score-card";
          
          // NUEVO DISEÑO DE TARJETA CON BOTONES VISIBLES
          card.innerHTML = `
            <span class="card-eyebrow">${plateLabel(score.plate)} · ${score.timeSig}</span>
            <h3>${escapeHtml(score.title || t('untitled'))}</h3>
            <p class="composer">${escapeHtml(score.composer || t('unknownAuthor'))}</p>
            <div class="meta"><span>${score.measures.length} ${t('measuresTxt')}</span><span>${formatDate(score.updatedAt)}</span></div>
            
            <div class="card-actions-row">
              <button class="btn-card" data-action="edit">${t('editBtn')}</button>
              <button class="btn-card" data-action="duplicate">${t('copyBtn')}</button>
              <button class="btn-card btn-danger-card" data-action="delete">${t('deleteBtn')}</button>
            </div>
          `;
          
          card.addEventListener("click", (e) => {
            const action = e.target.closest("[data-action]");
            if (action) {
              e.stopPropagation();
              if (action.dataset.action === "delete") {
                if (confirm(t('delConfirm'))) { deleteScoreById(score.id); renderLibrary(); }
              } else if (action.dataset.action === "duplicate") {
                const copy = JSON.parse(JSON.stringify(score));
                copy.id = uid(); copy.plate = nextPlateNumber();
                copy.title = (score.title || t('untitled')) + " " + t('copySuffix');
                copy.createdAt = copy.updatedAt = Date.now();
                persistScore(copy); renderLibrary();
              } else if (action.dataset.action === "edit") {
                showEditor(score);
              }
              return;
            }
            // Si hacen clic en cualquier otro lado de la tarjeta, también edita
            showEditor(score);
          });
          libraryGrid.appendChild(card);
        });
    }
  }

  function escapeHtml(str) { const d = document.createElement("div"); d.textContent = str; return d.innerHTML; }

  /* -----------------------------------------------------------------------
     Campos del editor
     ----------------------------------------------------------------------- */
  const elTitle = document.getElementById("scoreTitle");
  const elComposer = document.getElementById("scoreComposer");
  const elTimeSig = document.getElementById("timeSig");
  const elKeySig = document.getElementById("keySig");
  const elTempoText = document.getElementById("tempoText");

  function fillEditorFields() {
    elTitle.value = currentScore.title || "";
    elComposer.value = currentScore.composer || "";
    elTimeSig.value = currentScore.timeSig || "4/4";
    elKeySig.value = currentScore.keySig || "C";
    elTempoText.value = currentScore.tempoText || "";
    syncMeasureControls();
  }

  [elTitle, elComposer].forEach((el) =>
    el.addEventListener("input", () => {
      currentScore[el === elTitle ? "title" : "composer"] = el.value;
      renderLetterhead();
    })
  );
  elTimeSig.addEventListener("change", () => { currentScore.timeSig = elTimeSig.value; renderScore(); });
  elKeySig.addEventListener("change", () => { currentScore.keySig = elKeySig.value; renderScore(); });
  elTempoText.addEventListener("input", () => { currentScore.tempoText = elTempoText.value; renderScore(); });

  /* -----------------------------------------------------------------------
     Control de compás activo
     ----------------------------------------------------------------------- */
  const elActiveMeasureLabel = document.getElementById("activeMeasureLabel");
  const elRepeatStart = document.getElementById("repeatStart");
  const elRepeatEnd = document.getElementById("repeatEnd");
  const elDirective = document.getElementById("directiveSelect");

  function clampActiveMeasure() { editorState.activeMeasure = Math.max(0, Math.min(editorState.activeMeasure, currentScore.measures.length - 1)); }

  function syncMeasureControls() {
    clampActiveMeasure();
    const m = currentScore.measures[editorState.activeMeasure];
    elActiveMeasureLabel.textContent = (editorState.activeMeasure + 1) + " / " + currentScore.measures.length;
    elRepeatStart.checked = !!m.repeatStart; elRepeatEnd.checked = !!m.repeatEnd;
    elDirective.value = m.directive || "";
  }

  document.getElementById("btnPrevMeasure").addEventListener("click", () => { editorState.activeMeasure--; clampActiveMeasure(); syncMeasureControls(); renderScore(); });
  document.getElementById("btnNextMeasure").addEventListener("click", () => { editorState.activeMeasure++; clampActiveMeasure(); syncMeasureControls(); renderScore(); });
  document.getElementById("btnAddMeasure").addEventListener("click", () => { currentScore.measures.push(newMeasure()); editorState.activeMeasure = currentScore.measures.length - 1; syncMeasureControls(); renderScore(); });
  document.getElementById("btnDeleteMeasure").addEventListener("click", () => {
    if (currentScore.measures.length <= 1) { alert(t('minMeasureAlert')); return; }
    if (!confirm(t('delMeasureConfirm'))) return;
    currentScore.measures.splice(editorState.activeMeasure, 1);
    clampActiveMeasure(); syncMeasureControls(); renderScore();
  });
  elRepeatStart.addEventListener("change", () => { currentScore.measures[editorState.activeMeasure].repeatStart = elRepeatStart.checked; renderScore(); });
  elRepeatEnd.addEventListener("change", () => { currentScore.measures[editorState.activeMeasure].repeatEnd = elRepeatEnd.checked; renderScore(); });
  elDirective.addEventListener("change", () => { currentScore.measures[editorState.activeMeasure].directive = elDirective.value; renderScore(); });

  /* -----------------------------------------------------------------------
     Entrada
     ----------------------------------------------------------------------- */
  const btnStaffTreble = document.getElementById("btnStaffTreble");
  const btnStaffBass = document.getElementById("btnStaffBass");
  [btnStaffTreble, btnStaffBass].forEach((btn) =>
    btn.addEventListener("click", () => {
      editorState.activeStaff = btn.dataset.staff;
      btnStaffTreble.classList.toggle("is-active", editorState.activeStaff === "treble");
      btnStaffBass.classList.toggle("is-active", editorState.activeStaff === "bass");
    })
  );

  const elIsRest = document.getElementById("isRest");
  const elPitchFields = document.getElementById("pitchFields");
  const elPitchLetter = document.getElementById("pitchLetter");
  const elPitchAccidental = document.getElementById("pitchAccidental");
  const elPitchOctave = document.getElementById("pitchOctave");
  const elIsDotted = document.getElementById("isDotted");
  const elDynamicSelect = document.getElementById("dynamicSelect");
  const durationGrid = document.getElementById("durationGrid");

  elIsRest.addEventListener("change", () => {
    elPitchFields.style.opacity = elIsRest.checked ? 0.4 : 1;
    elPitchFields.querySelectorAll("select").forEach((s) => (s.disabled = elIsRest.checked));
  });

  durationGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".dur-btn");
    if (!btn) return;
    editorState.duration = btn.dataset.dur;
    durationGrid.querySelectorAll(".dur-btn").forEach((b) => b.classList.toggle("is-active", b === btn));
  });

  document.getElementById("btnAddNote").addEventListener("click", () => {
    const measure = currentScore.measures[editorState.activeMeasure];
    const list = measure[editorState.activeStaff];
    list.push({
      rest: elIsRest.checked, letter: elPitchLetter.value, accidental: elPitchAccidental.value,
      octave: parseInt(elPitchOctave.value, 10), duration: editorState.duration,
      dotted: elIsDotted.checked, dynamic: elDynamicSelect.value,
    });
    elDynamicSelect.value = ""; renderScore();
  });

  document.getElementById("btnUndoNote").addEventListener("click", () => {
    const measure = currentScore.measures[editorState.activeMeasure];
    if (measure[editorState.activeStaff].length > 0) {
        measure[editorState.activeStaff].pop();
        renderScore();
    }
  });

  /* -----------------------------------------------------------------------
     VexFlow Render
     ----------------------------------------------------------------------- */
  const vexContainer = document.getElementById("vexContainer");
  const plateMarkEl = document.getElementById("plateMark");

  function noteToVexKey(n) {
    let acc = n.accidental === "#" || n.accidental === "b" ? n.accidental : "";
    return n.letter.toLowerCase() + acc + "/" + n.octave;
  }

  function buildVexNotes(staffNotes, clef) {
    const VF = Vex.Flow;
    const restKey = clef === "bass" ? "d/3" : "b/4";
    const out = [];
    staffNotes.forEach((n) => {
      const durStr = n.duration + (n.rest ? "r" : "");
      const keys = n.rest ? [restKey] : [noteToVexKey(n)];
      const sn = new VF.StaveNote({ clef: clef, keys: keys, duration: durStr });
      if (n.dotted) VF.Dot.buildAndAttach([sn], { all: true });
      if (!n.rest && n.accidental) sn.addModifier(new VF.Accidental(n.accidental), 0);
      if (n.dynamic) {
        sn.addModifier(new VF.Annotation(n.dynamic).setFont("Times", 12, "italic bold").setVerticalJustification(
          clef === "bass" ? VF.Annotation.VerticalJustify.TOP : VF.Annotation.VerticalJustify.BOTTOM
        ), 0);
      }
      out.push(sn);
    });
    return out;
  }

  function quartersUsed(staffNotes) { return staffNotes.reduce((sum, n) => sum + (DURATION_QUARTERS[n.duration] || 0) * (n.dotted ? 1.5 : 1), 0); }
  function measureNeededQuarters(timeSig) { const [num, den] = timeSig.split("/").map(Number); return num * (4 / den); }

  function renderScore() {
    if (!currentScore) return;
    renderLetterhead();
    vexContainer.innerHTML = "";

    if (typeof Vex === "undefined") {
      vexContainer.innerHTML = '<p style="padding:40px;text-align:center;color:#8C2F39;font-weight:bold;">No se ha podido cargar el motor de partituras.<br><br>Parece que tu red o un bloqueador de anuncios (AdBlock/uBlock) está impidiendo la descarga de VexFlow.<br>Por favor, desactívalo y recarga la página.</p>';
      return;
    }

    try {
      const VF = Vex.Flow;
      const measures = currentScore.measures;
      const [num, den] = currentScore.timeSig.split("/").map(Number);
      const lines = Math.ceil(measures.length / MEASURES_PER_LINE);
      const totalWidth = LEFT_MARGIN * 2 + FIRST_OF_LINE_WIDTH + REST_OF_LINE_WIDTH;
      const totalHeight = TOP_MARGIN + lines * LINE_GAP + 40;

      const renderer = new VF.Renderer(vexContainer, VF.Renderer.Backends.SVG);
      renderer.resize(totalWidth, totalHeight);
      const ctx = renderer.getContext();
      const hitRects = [];

      measures.forEach((measure, idx) => {
        const posInLine = idx % MEASURES_PER_LINE;
        const lineIdx = Math.floor(idx / MEASURES_PER_LINE);
        const isFirstOfLine = posInLine === 0;
        const width = isFirstOfLine ? FIRST_OF_LINE_WIDTH : REST_OF_LINE_WIDTH;
        const x = LEFT_MARGIN + (isFirstOfLine ? 0 : FIRST_OF_LINE_WIDTH);
        const yTreble = TOP_MARGIN + lineIdx * LINE_GAP;
        const yBass = yTreble + STAVE_GAP;

        const staveTreble = new VF.Stave(x, yTreble, width);
        const staveBass = new VF.Stave(x, yBass, width);

        if (isFirstOfLine) {
          staveTreble.addClef("treble"); staveBass.addClef("bass");
          if (currentScore.keySig && currentScore.keySig !== "C") {
            staveTreble.addKeySignature(currentScore.keySig); staveBass.addKeySignature(currentScore.keySig);
          }
        }
        if (idx === 0) {
          staveTreble.addTimeSignature(currentScore.timeSig); staveBass.addTimeSignature(currentScore.timeSig);
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

        const trebleNotes = buildVexNotes(measure.treble, "treble");
        const bassNotes = buildVexNotes(measure.bass, "bass");

        if (trebleNotes.length > 0) {
          const vTreble = new VF.Voice({ num_beats: num, beat_value: den }).setMode(VF.Voice.Mode.SOFT);
          vTreble.addTickables(trebleNotes);
          VF.Beam.generateBeams(trebleNotes, { beam_rests: false }).forEach(b => b.setContext(ctx).draw());
          new VF.Formatter().joinVoices([vTreble]).format([vTreble], width - 30);
          vTreble.draw(ctx, staveTreble);
        }
        if (bassNotes.length > 0) {
          const vBass = new VF.Voice({ num_beats: num, beat_value: den }).setMode(VF.Voice.Mode.SOFT);
          vBass.addTickables(bassNotes);
          VF.Beam.generateBeams(bassNotes, { beam_rests: false }).forEach(b => b.setContext(ctx).draw());
          new VF.Formatter().joinVoices([vBass]).format([vBass], width - 30);
          vBass.draw(ctx, staveBass);
        }

        if (idx === 0 && currentScore.tempoText && trebleNotes.length > 0) {
          trebleNotes[0].addModifier(new VF.Annotation(currentScore.tempoText).setFont("Inter", 12, "bold").setVerticalJustification(VF.Annotation.VerticalJustify.TOP), 0);
        }
        if (measure.directive) {
          const targetArr = trebleNotes.length ? trebleNotes : bassNotes;
          if (targetArr.length) targetArr[targetArr.length - 1].addModifier(new VF.Annotation(measure.directive).setFont("Cormorant Garamond", 15, "italic").setVerticalJustification(VF.Annotation.VerticalJustify.TOP), 0);
        }

        hitRects.push({ x, y: yTreble - 28, width, height: (yBass + 70) - (yTreble - 28), idx });
      });

      const svg = vexContainer.querySelector("svg");
      if (svg) {
        svg.setAttribute("viewBox", `0 0 ${totalWidth} ${totalHeight}`);
        svg.removeAttribute("width"); svg.removeAttribute("height");
        const ns = "http://www.w3.org/2000/svg";
        hitRects.forEach((hr) => {
          const g = document.createElementNS(ns, "g");
          g.setAttribute("class", "measure-hit" + (hr.idx === editorState.activeMeasure ? " active" : ""));
          const rect = document.createElementNS(ns, "rect");
          rect.setAttribute("x", hr.x - 4); rect.setAttribute("y", hr.y);
          rect.setAttribute("width", hr.width + 4); rect.setAttribute("height", hr.height);
          rect.setAttribute("fill", hr.idx === editorState.activeMeasure ? "rgba(179, 142, 80, 0.15)" : "transparent");
          rect.setAttribute("rx", "4");
          g.appendChild(rect);
          g.addEventListener("click", () => { editorState.activeMeasure = hr.idx; syncMeasureControls(); renderScore(); });
          svg.insertBefore(g, svg.firstChild);
        });
      }

      plateMarkEl.textContent = plateLabel(currentScore.plate);
      updateBeatCounters();
    } catch (err) {
      console.error(err);
      vexContainer.innerHTML = `<p style="padding:24px;color:#8C2F39;">Error al dibujar. Revisa que las notas no superen la duración del compás.</p>`;
    }
  }

  function updateBeatCounters() {
    const m = currentScore.measures[editorState.activeMeasure];
    const needed = measureNeededQuarters(currentScore.timeSig);
    elActiveMeasureLabel.textContent = `${editorState.activeMeasure + 1}/${currentScore.measures.length} · ♩ Sol ${trim(quartersUsed(m.treble))}/${trim(needed)} · Fa ${trim(quartersUsed(m.bass))}/${trim(needed)}`;
  }
  function trim(n) { return Number.isInteger(n) ? n : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""); }

  window.renderLetterhead = function() {
    let head = vexContainer.parentElement.querySelector(".score-letterhead");
    if (!head) {
      head = document.createElement("div"); head.className = "score-letterhead";
      vexContainer.parentElement.insertBefore(head, vexContainer);
    }
    head.innerHTML = `<h2>${escapeHtml(currentScore.title || t('untitled'))}</h2><p>${escapeHtml(currentScore.composer || "")}</p>`;
  }

  /* -----------------------------------------------------------------------
     Guardar / Exportar / Importar
     ----------------------------------------------------------------------- */
  document.getElementById("btnSave").addEventListener("click", () => {
    persistScore(currentScore);
    const btn = document.getElementById("btnSave");
    const original = btn.textContent;
    btn.textContent = t('saved');
    setTimeout(() => (btn.textContent = original), 1200);
  });

  document.getElementById("btnExportJson").addEventListener("click", () => { persistScore(currentScore); downloadBlob(slugify(currentScore.title) + ".json", JSON.stringify(currentScore, null, 2)); });
  document.getElementById("btnExportPdf").addEventListener("click", () => { persistScore(currentScore); window.print(); });

  document.getElementById("btnImport").addEventListener("click", () => document.getElementById("fileImport").click());
  document.getElementById("fileImport").addEventListener("change", (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.measures) throw new Error("Format error");
        data.id = uid(); data.plate = nextPlateNumber(); data.updatedAt = Date.now();
        persistScore(data); renderLibrary();
      } catch (err) { alert("Error: " + err.message); }
      e.target.value = "";
    };
    reader.readAsText(file);
  });

  document.getElementById("btnNewScore").addEventListener("click", () => { const score = newScore(); persistScore(score); showEditor(score); });
  document.getElementById("btnBackLibrary").addEventListener("click", () => { persistScore(currentScore); showLibrary(); });
  
  // FUNCIONALIDAD DE VUELTA A CASA PULSANDO EL LOGO
  document.getElementById("brandHome").addEventListener("click", () => { 
      if (currentScore) persistScore(currentScore); 
      showLibrary(); 
  });

  /* -----------------------------------------------------------------------
     Arranque
     ----------------------------------------------------------------------- */
  setLang('es'); 
  showLibrary();
})();
