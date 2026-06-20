/* =========================================================================
   EBONY & IVORY — main.js
   Punto de entrada: conecta todos los módulos, gestiona el enrutado por
   hash y cablea los eventos del DOM con la lógica de cada módulo.
   ========================================================================= */
import { state, resetEditorState } from "./state.js";
import { on, emit } from "./events.js";
import { t, setLang } from "./i18n.js";
import {
  loadAll, uid, nextPlateNumber, plateLabel, slugify, formatDate, escapeHtml,
  measureNeededQuarters, quartersUsed, newMeasure, newScore, downloadBlob,
  persistScore, deleteScoreById
} from "./storage.js";
import { DUR_Q } from "./config.js";
import { renderCustomSelects, updateCustomSelectUI, setupCustomSelect } from "./custom-select.js";
import { getExampleScore } from "./example-score.js";
import { renderScore } from "./notation-renderer.js";
import { playAudio, pauseAudio, stopPlayback, isAudioPlaying, setSpeedFactor, refreshAudioBPM } from "./player.js";
import { initFirebase, setupAuthUI, setupProfileUI } from "./auth.js";

/* ----------------------------- Enrutado por Hash ----------------------------- */
function handleNavigation() {
  const hash = window.location.hash;
  document.body.classList.remove("is-home", "is-viewer", "is-example-score");

  const vHome = document.getElementById("viewHome");
  const vLib = document.getElementById("viewLibrary");
  const vEdit = document.getElementById("viewEditor");
  const lAct = document.getElementById("libraryActions");
  const eAct = document.getElementById("editorActions");
  const btnToggleV = document.getElementById("btnToggleViewer");

  if (vHome) vHome.hidden = true;
  if (vLib) vLib.hidden = true;
  if (vEdit) vEdit.hidden = true;
  if (lAct) lAct.hidden = true;
  if (eAct) eAct.hidden = true;
  if (btnToggleV) btnToggleV.hidden = false;

  stopPlayback();

  if (hash.startsWith("#editor/")) {
    state.currentScore = loadAll()[hash.split("/")[1]];
    if (state.currentScore) { document.body.classList.remove("is-viewer"); initEditor(); }
    else window.location.hash = "#catalogo";
  } else if (hash.startsWith("#viewer/")) {
    state.currentScore = loadAll()[hash.split("/")[1]];
    if (state.currentScore) { document.body.classList.add("is-viewer"); initEditor(); }
    else window.location.hash = "#catalogo";
  } else if (hash === "#ejemplo" || hash === "#example") {
    state.currentScore = getExampleScore(state.lang);
    document.body.classList.add("is-viewer", "is-example-score");
    initEditor();
    if (btnToggleV) btnToggleV.hidden = true;
  } else if (hash === "#catalogo") {
    state.currentScore = null;
    if (vLib) vLib.hidden = false;
    if (lAct) lAct.hidden = false;
    document.title = t("catalogTitle") + " — Ebony & Ivory";
    renderLibrary();
    window.scrollTo(0, 0);
  } else {
    state.currentScore = null;
    if (vHome) vHome.hidden = false;
    document.body.classList.add("is-home");
    document.title = "Ebony & Ivory";
    window.scrollTo(0, 0);
  }
  const btnBackLib = document.getElementById("btnBackLibrary");
  if (btnBackLib) {
    btnBackLib.hidden = (hash === "#inicio" || hash === "#catalogo" || !hash);
  }
}

function initEditor() {
  resetEditorState();
  const vEdit = document.getElementById("viewEditor");
  const eAct = document.getElementById("editorActions");
  if (vEdit) vEdit.hidden = false;
  if (eAct) eAct.hidden = false;
  document.title = (state.currentScore.title || t("untitled")) + " — Ebony & Ivory";

  const elTitle = document.getElementById("scoreTitle");
  const elComposer = document.getElementById("scoreComposer");
  const elTimeSig = document.getElementById("timeSig");
  const elBpm = document.getElementById("plBpm");
  if (elTitle) elTitle.value = state.currentScore.title || "";
  if (elComposer) elComposer.value = state.currentScore.composer || "";
  if (elTimeSig) elTimeSig.value = state.currentScore.timeSig || "4/4";
  updateCustomSelectUI("customKeySig", state.currentScore.keySig || "C");
  if (elBpm) elBpm.value = state.currentScore.bpm || 100;

  syncMeasureControls();
  renderScore();
  window.scrollTo(0, 0);
}

function syncMeasureControls() {
  const score = state.currentScore;
  state.editorState.activeMeasure = Math.max(0, Math.min(state.editorState.activeMeasure, score.measures.length - 1));
  const m = score.measures[state.editorState.activeMeasure];

  const lbl = document.getElementById("activeMeasureLabel");
  if (lbl) lbl.textContent = `${state.editorState.activeMeasure + 1} / ${score.measures.length}`;

  const rs = document.getElementById("repeatStart");
  const re = document.getElementById("repeatEnd");
  const ds = document.getElementById("directiveSelect");
  if (rs) rs.checked = !!m.repeatStart;
  if (re) re.checked = !!m.repeatEnd;
  if (ds) ds.value = m.directive || "";
}

/* ----------------------------- Catálogo ----------------------------- */
function renderLibrary() {
  const lib = state.libraryState;
  let scores = Object.values(loadAll());

  if (lib.query) {
    scores = scores.filter((s) =>
      (s.title || "").toLowerCase().includes(lib.query) ||
      (s.composer || "").toLowerCase().includes(lib.query) ||
      plateLabel(s.plate).toLowerCase().includes(lib.query)
    );
  }

  scores = scores.filter((s) => {
    if (lib.filterTime !== "all" && s.timeSig !== lib.filterTime) return false;
    if (lib.filterKey !== "all" && s.keySig !== lib.filterKey) return false;
    if (lib.filterHands !== "all") {
      const hasTreble = s.measures.some((m) => m.treble && m.treble.length > 0);
      const hasBass = s.measures.some((m) => m.bass && m.bass.length > 0);
      if (lib.filterHands === "both" && (!hasTreble || !hasBass)) return false;
      if (lib.filterHands === "treble" && hasBass) return false;
      if (lib.filterHands === "bass" && hasTreble) return false;
    }
    return true;
  });

  scores.sort((a, b) => {
    if (lib.sortBy === "numAsc") return a.plate - b.plate;
    if (lib.sortBy === "numDesc") return b.plate - a.plate;
    if (lib.sortBy === "dateDesc") return b.updatedAt - a.updatedAt;
    if (lib.sortBy === "dateAsc") return a.updatedAt - b.updatedAt;
    if (lib.sortBy === "titleAsc") return (a.title || "").localeCompare(b.title || "");
    if (lib.sortBy === "authorAsc") return (a.composer || "").localeCompare(b.composer || "");
    return 0;
  });

  const grid = document.getElementById("libraryGrid");
  if (!grid) return;
  grid.innerHTML = "";
  const empty = document.getElementById("libraryEmpty");

  if (scores.length === 0) {
    if (empty) empty.hidden = false;
    grid.hidden = true;
    return;
  }

  if (empty) empty.hidden = true;
  grid.hidden = false;

  scores.forEach((score) => {
    const card = document.createElement("div");
    card.className = "score-card";
    card.innerHTML = `<span class="card-eyebrow">${plateLabel(score.plate)} · ${score.timeSig}</span><h3>${escapeHtml(score.title || t("untitled"))}</h3><p class="composer">${escapeHtml(score.composer || t("unknownAuthor"))}</p><div class="meta"><span>${score.measures.length} ${t("measuresTxt")}</span><span>${formatDate(score.updatedAt)}</span></div>
      <div class="card-actions-row">
        <button class="btn-card" data-action="view">${t("viewBtn")}</button>
        <button class="btn-card" data-action="edit">${t("editBtn")}</button>
        <button class="btn-card" data-action="duplicate">${t("copyBtn")}</button>
        <button class="btn-card btn-danger-card" data-action="delete">${t("deleteBtn")}</button>
      </div>`;

    card.addEventListener("click", (e) => {
      const action = e.target.closest("[data-action]");
      if (!action) { window.location.hash = "#viewer/" + score.id; return; }
      e.stopPropagation();
      if (action.dataset.action === "delete") {
        if (confirm(t("delConfirm"))) { deleteScoreById(score.id); renderLibrary(); }
      } else if (action.dataset.action === "duplicate") {
        const copy = JSON.parse(JSON.stringify(score));
        copy.id = uid();
        copy.plate = nextPlateNumber();
        copy.title = (score.title || t("untitled")) + " " + t("copySuffix");
        copy.createdAt = copy.updatedAt = Date.now();
        persistScore(copy);
        renderLibrary();
      } else if (action.dataset.action === "edit") {
        window.location.hash = "#editor/" + score.id;
      } else if (action.dataset.action === "view") {
        window.location.hash = "#viewer/" + score.id;
      }
    });

    grid.appendChild(card);
  });
}

/* ----------------------------- Notas Flotantes (decoración Home) ----------------------------- */
function spawnFloatingNotes() {
  const wrap = document.getElementById("floatingNotes");
  if (!wrap || wrap.childElementCount > 0) return;
  const glyphs = ["♪", "♫", "♩", "𝄞"];
  for (let i = 0; i < 12; i++) {
    const span = document.createElement("span");
    span.className = "note-anim";
    span.textContent = glyphs[i % glyphs.length];
    span.style.left = Math.random() * 100 + "%";
    span.style.animationDuration = 14 + Math.random() * 12 + "s";
    span.style.animationDelay = -(Math.random() * 20) + "s";
    span.style.fontSize = 24 + Math.random() * 30 + "px";
    wrap.appendChild(span);
  }
}

/* ----------------------------- Wiring de eventos (DOM listo) ----------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initFirebase();
  setupAuthUI();
  setupProfileUI();

  // Selects personalizados de tonalidad
  setupCustomSelect("customKeySig", "keySig", (val) => {
    if (state.currentScore) { state.currentScore.keySig = val; renderScore(); }
  });
  setupCustomSelect("customFilterKeySig", "filterKeySig", (val) => {
    state.libraryState.filterKey = val;
    renderLibrary();
  });

  // Idioma
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });

  // Catálogo: importar / exportar / nueva partitura
  const btnExpJson = document.getElementById("btnExportJson");
  if (btnExpJson) btnExpJson.addEventListener("click", () => {
    downloadBlob(slugify(state.currentScore.title) + ".json", JSON.stringify(state.currentScore, null, 2));
  });

  const btnExpPdf = document.getElementById("btnExportPdf");
  if (btnExpPdf) btnExpPdf.addEventListener("click", () => {
    const oTitle = document.title;
    document.title = `${(state.currentScore.title || t("untitled")).trim()} — ${(state.currentScore.composer || t("unknownAuthor")).trim()}`;
    window.print();
    setTimeout(() => { document.title = oTitle; }, 500);
  });

  const btnImport = document.getElementById("btnImport");
  if (btnImport) btnImport.addEventListener("click", () => document.getElementById("fileImport").click());

  const fileImport = document.getElementById("fileImport");
  if (fileImport) fileImport.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.measures) throw new Error("Format error");
        data.id = uid();
        data.plate = nextPlateNumber();
        data.updatedAt = Date.now();
        persistScore(data);
        if (window.location.hash === "#catalogo") renderLibrary();
        else window.location.hash = "#catalogo";
      } catch (err) {
        alert("Error: " + err.message);
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  });

  const btnNewScore = document.getElementById("btnNewScore");
  if (btnNewScore) btnNewScore.addEventListener("click", () => {
    const score = newScore();
    persistScore(score);
    window.location.hash = "#editor/" + score.id;
  });

  const btnBackLib = document.getElementById("btnBackLibrary");
  if (btnBackLib) btnBackLib.addEventListener("click", () => { window.location.hash = "#catalogo"; });

  const brandHome = document.getElementById("brandHome");
  if (brandHome) brandHome.addEventListener("click", () => { window.location.hash = "#inicio"; });

  const btnGoCat = document.getElementById("btnGoCatalog");
  if (btnGoCat) btnGoCat.addEventListener("click", () => { window.location.hash = "#catalogo"; });

  const btnGoEx = document.getElementById("btnGoExample");
  if (btnGoEx) btnGoEx.addEventListener("click", () => { window.location.hash = "#ejemplo"; });

  const btnToggleV = document.getElementById("btnToggleViewer");
  if (btnToggleV) btnToggleV.addEventListener("click", () => {
    window.location.hash = (document.body.classList.contains("is-viewer") ? "#editor/" : "#viewer/") + state.currentScore.id;
  });

  // Filtros del catálogo
  const elSearch = document.getElementById("searchScores");
  if (elSearch) elSearch.addEventListener("input", (e) => { state.libraryState.query = e.target.value.toLowerCase(); renderLibrary(); });

  const elSort = document.getElementById("sortScores");
  if (elSort) elSort.addEventListener("change", (e) => { state.libraryState.sortBy = e.target.value; renderLibrary(); });

  const elBtnFilters = document.getElementById("btnToggleFilters");
  const elFiltersPanel = document.getElementById("catalogFilters");
  if (elBtnFilters && elFiltersPanel) elBtnFilters.addEventListener("click", () => { elFiltersPanel.hidden = !elFiltersPanel.hidden; });

  const elFilterTime = document.getElementById("filterTimeSig");
  if (elFilterTime) elFilterTime.addEventListener("change", (e) => { state.libraryState.filterTime = e.target.value; renderLibrary(); });

  const elFilterHands = document.getElementById("filterHands");
  if (elFilterHands) elFilterHands.addEventListener("change", (e) => { state.libraryState.filterHands = e.target.value; renderLibrary(); });

  // Escritorio de edición
  const elScoreTitle = document.getElementById("scoreTitle");
  if (elScoreTitle) {
    elScoreTitle.addEventListener("input", (e) => { state.currentScore.title = e.target.value; renderScore(); });
    document.getElementById("scoreComposer").addEventListener("input", (e) => { state.currentScore.composer = e.target.value; renderScore(); });
    document.getElementById("timeSig").addEventListener("change", (e) => { state.currentScore.timeSig = e.target.value; renderScore(); });

    document.getElementById("btnPrevMeasure").addEventListener("click", () => { state.editorState.activeMeasure--; syncMeasureControls(); renderScore(); });
    document.getElementById("btnNextMeasure").addEventListener("click", () => { state.editorState.activeMeasure++; syncMeasureControls(); renderScore(); });
    document.getElementById("btnAddMeasure").addEventListener("click", () => {
      state.currentScore.measures.push(newMeasure());
      state.editorState.activeMeasure = state.currentScore.measures.length - 1;
      syncMeasureControls(); renderScore();
    });
    document.getElementById("btnDeleteMeasure").addEventListener("click", () => {
      if (state.currentScore.measures.length <= 1) { alert(t("minMeasureAlert")); return; }
      if (!confirm(t("delMeasureConfirm"))) return;
      state.currentScore.measures.splice(state.editorState.activeMeasure, 1);
      syncMeasureControls(); renderScore();
    });

    document.getElementById("repeatStart").addEventListener("change", (e) => { state.currentScore.measures[state.editorState.activeMeasure].repeatStart = e.target.checked; renderScore(); });
    document.getElementById("repeatEnd").addEventListener("change", (e) => { state.currentScore.measures[state.editorState.activeMeasure].repeatEnd = e.target.checked; renderScore(); });
    document.getElementById("directiveSelect").addEventListener("change", (e) => { state.currentScore.measures[state.editorState.activeMeasure].directive = e.target.value; renderScore(); });

    ["Treble", "Bass"].forEach((clef) => {
      document.getElementById("btnStaff" + clef).addEventListener("click", () => {
        state.editorState.activeStaff = clef.toLowerCase();
        document.getElementById("btnStaffTreble").classList.toggle("is-active", clef === "Treble");
        document.getElementById("btnStaffBass").classList.toggle("is-active", clef === "Bass");
      });
    });

    document.getElementById("isRest").addEventListener("change", (e) => {
      const pitchFields = document.getElementById("pitchFields");
      pitchFields.style.opacity = e.target.checked ? 0.4 : 1;
      pitchFields.querySelectorAll("select").forEach((s) => { s.disabled = e.target.checked; });
    });

    document.getElementById("durationGrid").addEventListener("click", (e) => {
      const btn = e.target.closest(".dur-btn");
      if (!btn) return;
      state.editorState.duration = btn.dataset.dur;
      document.getElementById("durationGrid").querySelectorAll(".dur-btn").forEach((b) => b.classList.toggle("is-active", b === btn));
    });

    document.getElementById("btnAddNote").addEventListener("click", () => {
      const needed = measureNeededQuarters(state.currentScore.timeSig);
      const durQ = (DUR_Q[state.editorState.duration] || 0) * (document.getElementById("isDotted").checked ? 1.5 : 1);
      const currentUsed = quartersUsed(state.currentScore.measures[state.editorState.activeMeasure][state.editorState.activeStaff]);

      // Denegación matemática sonora: evita que el compás se desborde
      if (currentUsed + durQ > needed) {
        if (typeof Tone !== "undefined" && Tone.Synth) {
          const errorSynth = new Tone.Synth({ oscillator: { type: "square" }, envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 } }).toDestination();
          errorSynth.volume.value = -10;
          errorSynth.triggerAttackRelease("C2", "16n");
        }
        const desk = document.getElementById("engraveDesk");
        desk.style.transform = "translateX(10px)";
        setTimeout(() => { desk.style.transform = "translateX(-10px)"; }, 50);
        setTimeout(() => { desk.style.transform = "translateX(0)"; }, 100);
        return;
      }

      state.currentScore.measures[state.editorState.activeMeasure][state.editorState.activeStaff].push({
        rest: document.getElementById("isRest").checked,
        letter: document.getElementById("pitchLetter").value,
        accidental: document.getElementById("pitchAccidental").value,
        octave: parseInt(document.getElementById("pitchOctave").value, 10),
        duration: state.editorState.duration,
        dotted: document.getElementById("isDotted").checked,
        dynamic: document.getElementById("dynamicSelect").value
      });
      document.getElementById("dynamicSelect").value = "";
      renderScore();
    });

    document.getElementById("btnUndoNote").addEventListener("click", () => {
      const staff = state.currentScore.measures[state.editorState.activeMeasure][state.editorState.activeStaff];
      if (staff.length > 0) { staff.pop(); renderScore(); }
    });
  }

  // Reproductor de audio
  const btnPlay = document.getElementById("plBtnPlay");
  if (btnPlay) {
    btnPlay.addEventListener("click", () => (isAudioPlaying() ? pauseAudio() : playAudio()));
    document.getElementById("plBtnRewind").addEventListener("click", () => stopPlayback());

    document.querySelectorAll(".pl-speed-btn").forEach((b) => b.addEventListener("click", () => {
      const factor = parseFloat(b.dataset.speed);
      setSpeedFactor(factor);
      document.querySelectorAll(".pl-speed-btn").forEach((btn) => btn.classList.toggle("is-active", parseFloat(btn.dataset.speed) === factor));
    }));

    const elBpm = document.getElementById("plBpm");
    if (elBpm) elBpm.addEventListener("change", (e) => {
      const val = Math.max(20, Math.min(300, parseInt(e.target.value, 10) || 100));
      if (state.currentScore) { state.currentScore.bpm = val; renderScore(); }
      refreshAudioBPM();
      e.target.value = val;
    });

    document.addEventListener("click", (e) => {
      if (isAudioPlaying() && (e.target.closest("#engraveDesk") || e.target.closest(".measure-hit"))) pauseAudio();
    });
  }

  spawnFloatingNotes();

  // Re-render al cambiar de idioma o al sincronizar con la nube
  on("langchange", () => {
    renderCustomSelects();
    const vLib = document.getElementById("viewLibrary");
    const vEdit = document.getElementById("viewEditor");
    if (vLib && !vLib.hidden) renderLibrary();
    if (vEdit && !vEdit.hidden) renderScore();
  });
  on("scoreschanged", () => {
    const vLib = document.getElementById("viewLibrary");
    if (vLib && !vLib.hidden) renderLibrary();
  });
  on("measureselected", syncMeasureControls);

  // Idioma inicial según el navegador, y arranque del enrutado
  const userLang = navigator.language || navigator.userLanguage;
  setLang(userLang && userLang.toLowerCase().startsWith("es") ? "es" : "en");

  window.addEventListener("hashchange", handleNavigation);
  if (!window.location.hash || window.location.hash === "#") window.location.hash = "#inicio";
  else handleNavigation();
});
