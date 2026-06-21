import { state, resetEditorState } from "./core/state.js";
import { on, emit } from "./core/events.js";
import { t, setLang } from "./ui/i18n.js";
import { loadAll, uid, nextPlateNumber, plateLabel, slugify, formatDate, escapeHtml, measureNeededQuarters, quartersUsed, newMeasure, newScore, downloadBlob, persistScore, deleteScoreById } from "./core/storage.js";
import { DUR_Q } from "./core/config.js";
import { renderCustomSelects, updateCustomSelectUI, setupCustomSelect } from "./ui/custom-select.js";
import { getExampleScore } from "./features/example-score.js";
import { renderScore } from "./features/notation-renderer.js";
import { playAudio, pauseAudio, stopPlayback, isAudioPlaying, setSpeedFactor, refreshAudioBPM } from "./features/player.js";
import { startPracticeMode, stopPracticeMode } from "./features/practice.js";
import { clearRedoStack } from "./features/keyboard.js";
import { initFirebase, setupAuthUI, setupProfileUI } from "./auth.js";
import { showToast } from "./ui/toast.js";
import { debounce } from './utils/debounce.js';
import { initShortcuts } from './features/keyboard.js';
import { initDragAndDrop } from './features/drag-drop.js';
import { checkMaintenanceStatus } from './features/maintenance.js';
import { showConfirm } from './ui/dialog.js';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const handleNavigation = () => {
  const hash = window.location.hash;
  document.body.classList.remove("is-home", "is-viewer", "is-example-score");

  const views = {
    home: document.getElementById("viewHome"),
    lib: document.getElementById("viewLibrary"),
    codex: document.getElementById("viewCodex"),
    edit: document.getElementById("viewEditor"),
    lAct: document.getElementById("libraryActions"),
    eAct: document.getElementById("editorActions"),
    btnV: document.getElementById("btnToggleViewer"),
    btnB: document.getElementById("btnBackLibrary")
  };

  Object.values(views).forEach(v => { if (v) v.hidden = true; });
  if (views.btnV) views.btnV.hidden = false;
  stopPlayback();
  stopPracticeMode();

  if (hash.startsWith("#editor/") || hash.startsWith("#viewer/")) {
    state.currentScore = loadAll()[hash.split("/")[1]];
    if (state.currentScore) {
      if (hash.startsWith("#viewer/")) document.body.classList.add("is-viewer");
      initEditor(views);
    } else {
      window.location.hash = "#catalogo";
    }
  } else if (hash === "#ejemplo" || hash === "#example") {
    state.currentScore = getExampleScore(state.lang);
    document.body.classList.add("is-viewer", "is-example-score");
    initEditor(views);
    if (views.btnV) views.btnV.hidden = true;
  } else if (hash === "#catalogo") {
    state.currentScore = null;
    if (views.lib) views.lib.hidden = false;
    if (views.lAct) views.lAct.hidden = false;
    document.title = `${t("catalogTitle")} — Ebony & Ivory`;
    renderLibrary();
    window.scrollTo(0, 0);
  } else if (hash === "#codice") {
    state.currentScore = null;
    if (views.codex) views.codex.hidden = false;
    document.title = `El Códice — Ebony & Ivory`;
    renderCodex();
    window.scrollTo(0, 0);
  } else {
    state.currentScore = null;
    if (views.home) views.home.hidden = false;
    document.body.classList.add("is-home");
    document.title = "Ebony & Ivory";
    window.scrollTo(0, 0);
  }
  
  if (views.btnB) views.btnB.hidden = !["#editor/", "#viewer/", "#ejemplo"].some(h => hash.startsWith(h));
  updateViewerButtonText();
};

const syncEditorStickyOffset = () => {
  const header = document.getElementById("mainHeader");
  const stickyTop = header ? Math.round(header.getBoundingClientRect().height) : 0;
  document.documentElement.style.setProperty("--editor-sticky-offset", `${stickyTop}px`);

  const desk = document.getElementById("engraveDesk");
  if (desk) desk.style.height = `calc(100vh - ${stickyTop}px)`;
};

const updateViewerButtonText = () => {
    const btn = document.getElementById("btnToggleViewer");
    if (!btn) return;
    btn.textContent = document.body.classList.contains("is-viewer") ? t("editMode") : t("viewMode");
};

const initEditor = (views) => {
  resetEditorState();
  if (views.edit) views.edit.hidden = false;
  if (views.eAct) views.eAct.hidden = false;
  document.title = `${state.currentScore.title || t("untitled")} — Ebony & Ivory`;

  const safeVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  safeVal("scoreTitle", state.currentScore.title || "");
  safeVal("scoreComposer", state.currentScore.composer || "");
  safeVal("timeSig", state.currentScore.timeSig || "4/4");
  safeVal("plBpm", state.currentScore.bpm || 100);
  updateCustomSelectUI("customKeySig", state.currentScore.keySig || "C");

  syncMeasureControls();
  renderScore();
  syncEditorStickyOffset();
  window.scrollTo(0, 0);
};

const syncMeasureControls = () => {
  const score = state.currentScore;
  state.editorState.activeMeasure = Math.max(0, Math.min(state.editorState.activeMeasure, score.measures.length - 1));
  const m = score.measures[state.editorState.activeMeasure];

  const rs = document.getElementById("repeatStart");
  const re = document.getElementById("repeatEnd");
  const ds = document.getElementById("directiveSelect");
  if (rs) rs.checked = !!m.repeatStart;
  if (re) re.checked = !!m.repeatEnd;
  if (ds) ds.value = m.directive || "";
  
  renderNoteList();
};

const renderNoteList = () => {
    const container = document.getElementById("noteListContainer");
    if (!container || !state.currentScore) return;
    
    const notes = state.currentScore.measures[state.editorState.activeMeasure][state.editorState.activeStaff] || [];
    container.innerHTML = "";
    
    notes.forEach((n, idx) => {
        const tag = document.createElement("div");
        tag.className = "note-tag";
        const symbol = n.rest ? "Sil." : `${n.letter}${n.accidental || ""}${n.octave}`;
        tag.innerHTML = `<span>${symbol}</span> <span class="note-tag-del" data-idx="${idx}">✕</span>`;
        container.appendChild(tag);
    });

    container.querySelectorAll(".note-tag-del").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idx = parseInt(e.target.dataset.idx, 10);
            state.currentScore.measures[state.editorState.activeMeasure][state.editorState.activeStaff].splice(idx, 1);
            syncMeasureControls();
            renderScore();
        });
    });
};

/* --- Catálogo Público (El Códice) --- */
const renderCodex = async () => {
  const grid = document.getElementById("codexGrid");
  if (!grid) return;
  grid.innerHTML = "<p style='text-align:center; grid-column: 1/-1;'>Cargando el Códice...</p>";

  try {
    const db = firebase.firestore();
    const snap = await db.collection("public_scores").limit(50).get();
    grid.innerHTML = "";
    if (snap.empty) {
       grid.innerHTML = "<p style='text-align:center; grid-column: 1/-1;'>Aún no hay partituras públicas.</p>";
       return;
    }

    snap.forEach(doc => {
      const score = doc.data();
      const card = document.createElement("div");
      card.className = "score-card";
      card.innerHTML = `
        <span class="card-eyebrow">Por: ${escapeHtml(score.publisherName || "Anónimo")}</span>
        <button class="btn-pin" style="color:var(--color-danger);">❤ ${score.likes || 0}</button>
        <h3>${escapeHtml(score.title || t("untitled"))}</h3>
        <p class="composer">${escapeHtml(score.composer || t("unknownAuthor"))}</p>
        <div class="meta"><span>${score.measures?.length || 0} compases</span></div>
        <div class="card-actions-row">
          <button class="btn-card" data-action="view-codex">Examinar obra</button>
          <button class="btn-card" data-action="clone-codex">Guardar en mi Catálogo</button>
        </div>`;
      
      card.addEventListener("click", (e) => {
        const action = e.target.closest("[data-action]");
        if (!action) return;
        if (action.dataset.action === "clone-codex") {
           const copy = { ...score, id: uid(), plate: nextPlateNumber(), createdAt: Date.now(), updatedAt: Date.now() };
           delete copy.publisherName; delete copy.likes; delete copy.views;
           persistScore(copy);
           showToast("Partitura guardada en Mi Catálogo", "success");
        } else if (action.dataset.action === "view-codex") {
           state.currentScore = score;
           window.location.hash = `#viewer/${score.id}`; 
        }
      });
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = "<p style='text-align:center; color:var(--color-danger); grid-column: 1/-1;'>No se pudo conectar con El Códice.</p>";
  }
};

const publishToCodex = async (score) => {
  if (!state.currentUser) { showToast("Inicia sesión para publicar", "error"); return; }
  try {
    const db = firebase.firestore();
    await db.collection("public_scores").doc(score.id).set({
      ...score,
      publisherUid: state.currentUser.uid,
      publisherName: state.currentUser.displayName || state.currentUser.email || "Anónimo",
      likes: 0,
      views: 0
    });
    showToast("¡Partitura inmortalizada en El Códice!", "success");
  } catch(e) {
    showToast("Error al publicar: " + e.message, "error");
  }
};

/* --- Mi Catálogo --- */
const renderLibrary = () => {
  const lib = state.libraryState;
  let scores = Object.values(loadAll());

  if (lib.query) {
    scores = scores.filter(s => 
      (s.title || "").toLowerCase().includes(lib.query) || 
      (s.composer || "").toLowerCase().includes(lib.query) || 
      plateLabel(s.plate).toLowerCase().includes(lib.query)
    );
  }

  scores = scores.filter((s) => {
    if (lib.filterTime !== "all" && s.timeSig !== lib.filterTime) return false;
    if (lib.filterKey !== "all" && s.keySig !== lib.filterKey) return false;
    if (lib.filterHands !== "all") {
      const hasT = s.measures.some(m => m.treble?.length > 0);
      const hasB = s.measures.some(m => m.bass?.length > 0);
      if (lib.filterHands === "both" && (!hasT || !hasB)) return false;
      if (lib.filterHands === "treble" && hasB) return false;
      if (lib.filterHands === "bass" && hasT) return false;
    }
    return true;
  });

  scores.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (lib.sortBy === "numAsc") return a.plate - b.plate;
    if (lib.sortBy === "numDesc") return b.plate - a.plate;
    if (lib.sortBy === "dateDesc") return b.updatedAt - a.updatedAt;
    if (lib.sortBy === "dateAsc") return a.updatedAt - b.updatedAt;
    if (lib.sortBy === "titleAsc") return (a.title || "").localeCompare(b.title || "");
    if (lib.sortBy === "authorAsc") return (a.composer || "").localeCompare(b.composer || "");
    return 0;
  });

  const grid = document.getElementById("libraryGrid");
  const empty = document.getElementById("libraryEmpty");
  if (!grid) return;
  grid.innerHTML = "";

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
    const composersHtml = (score.composer || t("unknownAuthor")).split(",").map(c => escapeHtml(c.trim())).join(", ");
    card.innerHTML = `
      <span class="card-eyebrow">${plateLabel(score.plate)} · ${score.timeSig}</span>
      <button class="btn-pin ${score.pinned ? 'is-pinned' : ''}" data-action="pin">★</button>
      <h3>${escapeHtml(score.title || t("untitled"))}</h3>
      <p class="composer">${composersHtml}</p>
      <div class="meta"><span>${score.measures.length} ${t("measuresTxt")}</span><span>${formatDate(score.updatedAt)}</span></div>
      <div class="card-actions-row">
        <button class="btn-card" data-action="view">${t("viewBtn")}</button>
        <button class="btn-card" data-action="edit">${t("editBtn")}</button>
        <button class="btn-card" data-action="publish" title="Publicar en El Códice">🌍 Publicar</button>
        <button class="btn-card btn-danger-card" data-action="delete">🗑</button>
      </div>`;

    card.addEventListener("click", async (e) => {
      const action = e.target.closest("[data-action]");
      if (!action) { window.location.hash = `#viewer/${score.id}`; return; }
      e.stopPropagation();
      
      const act = action.dataset.action;
      if (act === "pin") {
        score.pinned = !score.pinned;
        persistScore(score);
        renderLibrary();
      } else if (act === "delete") {
        if (await showConfirm("Eliminar partitura", "¿Seguro que quieres borrar esta obra?", "Borrar", true)) {
          deleteScoreById(score.id); renderLibrary();
        }
      } else if (act === "publish") {
        publishToCodex(score);
      } else if (act === "edit") window.location.hash = `#editor/${score.id}`;
      else if (act === "view") window.location.hash = `#viewer/${score.id}`;
    });
    grid.appendChild(card);
  });
};

const setupEventListeners = () => {
  setupCustomSelect("customKeySig", "keySig", (val) => { if (state.currentScore) { state.currentScore.keySig = val; renderScore(); } });
  setupCustomSelect("customFilterKeySig", "filterKeySig", (val) => { state.libraryState.filterKey = val; renderLibrary(); });

  document.querySelectorAll(".lang-btn").forEach(btn => btn.addEventListener("click", () => setLang(btn.dataset.lang)));

  document.getElementById("btnExportJson")?.addEventListener("click", (e) => {
    e.preventDefault();
    if(state.currentScore) downloadBlob(`${slugify(state.currentScore.title)}.json`, JSON.stringify(state.currentScore, null, 2));
  });

  document.getElementById("btnExportPdf")?.addEventListener("click", (e) => {
    e.preventDefault();
    if(!state.currentScore) return;
    const oTitle = document.title;
    document.title = `${(state.currentScore.title || t("untitled")).trim()} — ${(state.currentScore.composer || t("unknownAuthor")).trim()}`;
    window.print();
    setTimeout(() => { document.title = oTitle; }, 500);
  });

  document.getElementById("btnImport")?.addEventListener("click", () => document.getElementById("fileImport").click());
  document.getElementById("fileImport")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.measures) throw new Error("Format error");
        data.id = uid(); data.plate = nextPlateNumber(); data.updatedAt = Date.now(); data.createdAt = Date.now();
        delete data.isExample; 
        persistScore(data);
        window.location.hash = window.location.hash === "#catalogo" ? "#catalogo" : "#catalogo";
        renderLibrary();
      } catch (err) { showToast(`Error: ${err.message}`, 'error'); }
      e.target.value = "";
    };
    reader.readAsText(file);
  });

  document.getElementById("btnNewScore")?.addEventListener("click", () => {
    const score = newScore(); persistScore(score); window.location.hash = `#editor/${score.id}`;
  });

  document.getElementById("btnBackLibrary")?.addEventListener("click", () => window.location.hash = "#catalogo");
  document.getElementById("brandHome")?.addEventListener("click", () => window.location.hash = "#inicio");
  document.getElementById("btnGoCatalog")?.addEventListener("click", () => window.location.hash = "#catalogo");
  document.getElementById("btnGoExample")?.addEventListener("click", () => window.location.hash = "#ejemplo");
  document.getElementById("btnGoCodex")?.addEventListener("click", () => window.location.hash = "#codice");
  document.getElementById("btnBackToMyCatalog")?.addEventListener("click", () => window.location.hash = "#catalogo");
  
  document.getElementById("btnToggleViewer")?.addEventListener("click", () => {
    window.location.hash = (document.body.classList.contains("is-viewer") ? "#editor/" : "#viewer/") + state.currentScore.id;
  });

  document.getElementById("btnTogglePractice")?.addEventListener("click", startPracticeMode);
  document.getElementById("btnStopPracticeFloating")?.addEventListener("click", stopPracticeMode);

  document.getElementById("searchScores")?.addEventListener("input", (e) => { state.libraryState.query = e.target.value.toLowerCase(); renderLibrary(); });
  document.getElementById("sortScores")?.addEventListener("change", (e) => { state.libraryState.sortBy = e.target.value; renderLibrary(); });
  document.getElementById("btnToggleFilters")?.addEventListener("click", () => {
    const f = document.getElementById("catalogFilters"); if (f) f.hidden = !f.hidden;
  });
  document.getElementById("filterTimeSig")?.addEventListener("change", (e) => { state.libraryState.filterTime = e.target.value; renderLibrary(); });
  document.getElementById("filterHands")?.addEventListener("change", (e) => { state.libraryState.filterHands = e.target.value; renderLibrary(); });

  if (document.getElementById("scoreTitle")) {
    const debouncedRender = debounce(() => renderScore(), 300);
    document.getElementById("scoreTitle").addEventListener("input", (e) => { state.currentScore.title = e.target.value; debouncedRender(); });
    document.getElementById("scoreComposer").addEventListener("input", (e) => { state.currentScore.composer = e.target.value; debouncedRender(); });
    document.getElementById("timeSig").addEventListener("change", (e) => { state.currentScore.timeSig = e.target.value; renderScore(); });
    
    document.getElementById("btnPrevMeasure").addEventListener("click", () => { state.editorState.activeMeasure--; syncMeasureControls(); renderScore(); });
    document.getElementById("btnNextMeasure").addEventListener("click", () => { state.editorState.activeMeasure++; syncMeasureControls(); renderScore(); });
    document.getElementById("btnAddMeasure").addEventListener("click", () => {
      state.currentScore.measures.push(newMeasure());
      state.editorState.activeMeasure = state.currentScore.measures.length - 1;
      syncMeasureControls(); renderScore();
    });
    
    document.getElementById("btnDeleteMeasure").addEventListener("click", async () => {
      if (state.currentScore.measures.length <= 1) { showToast(t("minMeasureAlert"), 'error'); return; }
      if (await showConfirm("Eliminar compás", "Se borrarán todas las notas.", "Eliminar", true)) {
        state.currentScore.measures.splice(state.editorState.activeMeasure, 1);
        syncMeasureControls(); renderScore();
      }
    });

    document.getElementById("repeatStart").addEventListener("change", (e) => { state.currentScore.measures[state.editorState.activeMeasure].repeatStart = e.target.checked; renderScore(); });
    document.getElementById("repeatEnd").addEventListener("change", (e) => { state.currentScore.measures[state.editorState.activeMeasure].repeatEnd = e.target.checked; renderScore(); });
    document.getElementById("directiveSelect").addEventListener("change", (e) => { state.currentScore.measures[state.editorState.activeMeasure].directive = e.target.value; renderScore(); });

    ["Treble", "Bass"].forEach((clef) => {
      document.getElementById("btnStaff" + clef).addEventListener("click", () => {
        state.editorState.activeStaff = clef.toLowerCase();
        document.getElementById("btnStaffTreble").classList.toggle("is-active", clef === "Treble");
        document.getElementById("btnStaffBass").classList.toggle("is-active", clef === "Bass");
        renderNoteList();
      });
    });

    document.getElementById("isRest").addEventListener("change", (e) => {
      const pitchFields = document.getElementById("pitchFields");
      pitchFields.style.opacity = e.target.checked ? 0.4 : 1;
      pitchFields.querySelectorAll("select").forEach(s => s.disabled = e.target.checked);
    });

    document.getElementById("durationGrid").addEventListener("click", (e) => {
      const btn = e.target.closest(".dur-btn");
      if (!btn) return;
      state.editorState.duration = btn.dataset.dur;
      document.getElementById("durationGrid").querySelectorAll(".dur-btn").forEach(b => b.classList.toggle("is-active", b === btn));
    });

    document.getElementById("btnAddNote").addEventListener("click", () => {
      const needed = measureNeededQuarters(state.currentScore.timeSig);
      const durQ = (DUR_Q[state.editorState.duration] || 0) * (document.getElementById("isDotted").checked ? 1.5 : 1);
      const currentUsed = quartersUsed(state.currentScore.measures[state.editorState.activeMeasure][state.editorState.activeStaff]);

      if (currentUsed + durQ > needed) {
        if (typeof Tone !== "undefined" && Tone.Synth) {
          new Tone.Synth({ oscillator: { type: "square" }, envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 } })
            .toDestination().triggerAttackRelease("C2", "16n", undefined, 0.1);
        }
        const desk = document.getElementById("engraveDesk");
        desk.style.transform = "translateX(10px)";
        setTimeout(() => desk.style.transform = "translateX(-10px)", 50);
        setTimeout(() => desk.style.transform = "translateX(0)", 100);
        return;
      }

      clearRedoStack();
      state.currentScore.measures[state.editorState.activeMeasure][state.editorState.activeStaff].push({
        rest: document.getElementById("isRest").checked,
        letter: document.getElementById("pitchLetter").value,
        accidental: document.getElementById("pitchAccidental").value,
        octave: parseInt(document.getElementById("pitchOctave").value, 10),
        duration: state.editorState.duration,
        dotted: document.getElementById("isDotted").checked,
        dynamic: document.getElementById("dynamicSelect").value,
        fingering: document.getElementById("fingeringSelect").value,
        lyric: document.getElementById("lyricInput").value
      });
      document.getElementById("dynamicSelect").value = "";
      document.getElementById("fingeringSelect").value = "";
      document.getElementById("lyricInput").value = "";
      syncMeasureControls();
      renderScore();
    });
  }

  const btnPlay = document.getElementById("plBtnPlay");
  if (btnPlay) {
    btnPlay.addEventListener("click", () => isAudioPlaying() ? pauseAudio() : playAudio());
    document.getElementById("plBtnRewind").addEventListener("click", stopPlayback);

    document.querySelectorAll(".pl-speed-btn").forEach((b) => b.addEventListener("click", () => {
      const factor = parseFloat(b.dataset.speed);
      setSpeedFactor(factor);
      document.querySelectorAll(".pl-speed-btn").forEach(btn => btn.classList.toggle("is-active", parseFloat(btn.dataset.speed) === factor));
    }));

    document.getElementById("plBpm")?.addEventListener("change", (e) => {
      e.target.value = Math.max(20, Math.min(300, parseInt(e.target.value, 10) || 100));
      refreshAudioBPM(); 
    });

    document.addEventListener("click", (e) => {
      if (isAudioPlaying() && (e.target.closest("#engraveDesk") || e.target.closest(".measure-hit"))) pauseAudio();
    });
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  await checkMaintenanceStatus();
  
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') document.body.classList.add('dark-theme');
  const themeBtn = document.createElement('button');
  themeBtn.className = 'btn btn-ghost theme-toggle';
  themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  themeBtn.onclick = () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeBtn.textContent = isDark ? '☀️' : '🌙';
  };
  const langSwitch = document.querySelector('.lang-switch');
  if (langSwitch) langSwitch.before(themeBtn);

  initFirebase();
  setupAuthUI();
  setupProfileUI();
  initShortcuts();
  initDragAndDrop();

  const paperWrap = document.getElementById('paperWrap');
  if (paperWrap) {
    let zoom = 1;
    paperWrap.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        zoom = Math.max(0.5, Math.min(zoom + (e.deltaY < 0 ? 0.1 : -0.1), 2));
        paperWrap.style.setProperty('--zoom-level', zoom);
      }
    }, { passive: false });
  }

  setupEventListeners();

  const wrapSpawn = document.getElementById("floatingNotes");
  if (wrapSpawn && wrapSpawn.childElementCount === 0) {
    const glyphs = ["♪", "♫", "♩", "𝄞"];
    for (let i = 0; i < 12; i++) {
      const s = document.createElement("span");
      s.className = "note-anim"; s.textContent = glyphs[i % 4];
      s.style.left = `${Math.random() * 100}%`;
      s.style.animationDuration = `${14 + Math.random() * 12}s`;
      s.style.animationDelay = `-${Math.random() * 20}s`;
      s.style.fontSize = `${24 + Math.random() * 30}px`;
      wrapSpawn.appendChild(s);
    }
  }

  const header = document.getElementById("mainHeader");
  if (header && typeof ResizeObserver !== "undefined") {
    new ResizeObserver(syncEditorStickyOffset).observe(header);
  }
  window.addEventListener("resize", syncEditorStickyOffset);

  on("langchange", (lang) => {
    renderCustomSelects();
    if (state.currentScore?.isExample) {
      state.currentScore.title = lang === "es" ? "Oda a la Alegría" : "Ode to Joy";
      const tEl = document.getElementById("scoreTitle"); if (tEl) tEl.value = state.currentScore.title;
    }
    if (!document.getElementById("viewLibrary")?.hidden) renderLibrary();
    if (!document.getElementById("viewEditor")?.hidden) renderScore();
    updateViewerButtonText();
  });
  
  on("scoreschanged", () => { if (!document.getElementById("viewLibrary")?.hidden) renderLibrary(); });
  on("measureselected", syncMeasureControls);

  const uLang = (navigator.language || navigator.userLanguage || "en").toLowerCase();
  setLang(uLang.startsWith("es") ? "es" : "en");

  window.addEventListener("hashchange", handleNavigation);
  if (!window.location.hash || window.location.hash === "#") window.location.hash = "#inicio";
  else handleNavigation();
});