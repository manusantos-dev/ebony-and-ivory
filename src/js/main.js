/**
 * @file main.js
 * @description Main Application Controller.
 * Handles routing, DOM event bindings, state synchronization, and layout mode toggling.
 */

import { state, resetEditorState } from "./core/state";
import { on, emit } from "./core/events";
import { t, setLang } from "./ui/i18n.js";
import { loadAll, saveAll, uid, nextPlateNumber, plateLabel, slugify, formatDate, escapeHtml, measureNeededQuarters, quartersUsed, newMeasure, newScore, downloadBlob, persistScore, deleteScoreById } from "./core/storage";
import { DUR_Q } from "./core/config";
import { renderCustomSelects, updateCustomSelectUI, setupCustomSelect } from "./ui/custom-select.js";
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

state.codexState = { query: "", sortBy: "likesDesc", filterTime: "all", filterKey: "all", filterHands: "all" };
state.publicScores = [];
state.isViewingPublic = false;
state.editorState.layoutMode = "continuous";

// I18N: Inline localization helper for dynamic alerts without dictionary dependencies
const i18nText = (es, en) => state.lang === 'es' ? es : en;

const applyLayoutMode = () => {
  const wrap = document.getElementById("paperWrap");
  const btn = document.getElementById("btnToggleLayout");
  if (!wrap || !btn) return;
  const isBook = state.editorState.layoutMode === "book";
  wrap.className = `paper-wrap ${isBook ? "layout-book" : "layout-continuous"}`;
  btn.innerHTML = isBook ? "📖" : "📜";
  btn.title = isBook ? "Cambiar a Vista Continua (Pergamino)" : "Cambiar a Vista de Libro";
};

const handleNavigation = () => {
  const hash = window.location.hash;
  document.body.classList.remove("is-home", "is-viewer");
  stopPlayback();
  stopPracticeMode();

  const views = ["viewHome", "viewLibrary", "viewCodex", "viewEditor", "libraryActions", "editorActions", "btnToggleViewer", "btnBackLibrary", "topNavLinks", "btnTopCodex", "btnTopCatalog"].reduce((acc, id) => {
    acc[id] = document.getElementById(id);
    if (acc[id] && !id.startsWith("btn")) acc[id].hidden = true;
    return acc;
  }, {});

  if (views.btnToggleViewer) views.btnToggleViewer.hidden = false;

  if (hash.startsWith("#editor/") || hash.startsWith("#viewer/")) {
    const id = hash.split("/")[1];
    const localScore = loadAll()[id];
    const publicScore = state.publicScores.find(s => s.id === id);

    if (state.isViewingPublic && publicScore) state.currentScore = publicScore;
    else if (localScore) { state.currentScore = localScore; state.isViewingPublic = false; }
    else if (publicScore) { state.currentScore = publicScore; state.isViewingPublic = true; }
    else { window.location.hash = "#catalogo"; return; }

    if (hash.startsWith("#viewer/")) document.body.classList.add("is-viewer");
    initEditor(views);
    if (views.topNavLinks) views.topNavLinks.hidden = true;
  } else if (hash === "#catalogo") {
    state.currentScore = null;
    state.isViewingPublic = false;
    ["viewLibrary", "libraryActions", "topNavLinks", "btnTopCodex"].forEach(id => views[id] && (views[id].hidden = false));
    if (views.btnTopCatalog) views.btnTopCatalog.hidden = true;
    document.title = `${t("catalogTitle")} — Ebony & Ivory`;
    renderLibrary();
    window.scrollTo(0, 0);
  } else if (hash === "#codice") {
    state.currentScore = null;
    state.isViewingPublic = true;
    ["viewCodex", "topNavLinks", "btnTopCatalog"].forEach(id => views[id] && (views[id].hidden = false));
    if (views.btnTopCodex) views.btnTopCodex.hidden = true;
    document.title = `${t("codexBtn")} — Ebony & Ivory`;
    fetchAndRenderCodex();
    window.scrollTo(0, 0);
  } else {
    state.currentScore = null;
    state.isViewingPublic = false;
    if (views.viewHome) views.viewHome.hidden = false;
    if (views.topNavLinks) views.topNavLinks.hidden = true;
    document.body.classList.add("is-home");
    document.title = "Ebony & Ivory";
    window.scrollTo(0, 0);
  }

  if (views.btnBackLibrary) views.btnBackLibrary.hidden = !["#editor/", "#viewer/"].some(h => hash.startsWith(h));
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
  if (state.isViewingPublic) {
    btn.innerHTML = `⎘ ${t("saveCopyBtn")}`;
    btn.onclick = () => {
      const copy = { ...state.currentScore, id: uid(), plate: nextPlateNumber(), createdAt: Date.now(), updatedAt: Date.now() };
      delete copy.publisherName; delete copy.publisherUid; delete copy.likes; delete copy.views; delete copy.copies;
      persistScore(copy);
      showToast(t("savedToCatalog"), "success");
      state.isViewingPublic = false;
      window.location.hash = `#editor/${copy.id}`;
    };
  } else {
    btn.textContent = document.body.classList.contains("is-viewer") ? t("editMode") : t("viewMode");
    btn.onclick = () => window.location.hash = (document.body.classList.contains("is-viewer") ? "#editor/" : "#viewer/") + state.currentScore.id;
  }
};

const initEditor = (views) => {
  const preservedLayoutMode = state.editorState?.layoutMode || "continuous";
  resetEditorState();
  state.editorState.layoutMode = preservedLayoutMode;
  applyLayoutMode();

  ["viewEditor", "editorActions"].forEach(id => views[id] && (views[id].hidden = false));
  document.title = `${state.currentScore.title || t("untitled")} — Ebony & Ivory`;

  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  setVal("scoreTitle", state.currentScore.title || "");
  setVal("scoreComposer", state.currentScore.composer || "");
  setVal("timeSig", state.currentScore.timeSig || "4/4");
  setVal("scoreDifficulty", state.currentScore.difficulty || "beginner");
  setVal("scoreBpm", state.currentScore.bpm || 100);
  setVal("plBpm", state.currentScore.bpm || 100);
  updateCustomSelectUI("customKeySig", state.currentScore.keySig || "C");

  syncMeasureControls();
  renderScore();
  syncEditorStickyOffset();
  window.scrollTo(0, 0);
};

const getFormNote = () => ({
  rest: document.getElementById("isRest").checked,
  keys: [{ letter: document.getElementById("pitchLetter").value, accidental: document.getElementById("pitchAccidental").value, octave: parseInt(document.getElementById("pitchOctave").value, 10) }],
  duration: state.editorState.duration,
  dotted: document.getElementById("isDotted").checked,
  dynamic: document.getElementById("dynamicSelect").value,
  fingering: document.getElementById("fingeringSelect").value,
  lyric: document.getElementById("lyricInput").value
});

const saveCurrentNote = () => {
  const { activeMeasure, activeStaff, editingNoteIdx } = state.editorState;
  if (editingNoteIdx === null) return;
  const staffNotes = state.currentScore.measures[activeMeasure]?.[activeStaff];
  if (staffNotes && staffNotes[editingNoteIdx]) staffNotes[editingNoteIdx] = getFormNote();
};

const loadNoteIntoForm = (n, idx) => {
  state.editorState.editingNoteIdx = idx;
  const isRest = document.getElementById("isRest");
  isRest.checked = n.rest;
  isRest.dispatchEvent(new Event("change"));

  if (!n.rest && n.keys?.length > 0) {
    const primaryKey = n.keys[0];
    document.getElementById("pitchLetter").value = primaryKey.letter;
    document.getElementById("pitchAccidental").value = primaryKey.accidental || "";
    document.getElementById("pitchOctave").value = primaryKey.octave;
  }

  state.editorState.duration = n.duration;
  document.querySelectorAll(".dur-btn").forEach(b => b.classList.toggle("is-active", b.dataset.dur === n.duration));
  document.getElementById("isDotted").checked = !!n.dotted;
  document.getElementById("dynamicSelect").value = n.dynamic || "";
  document.getElementById("fingeringSelect").value = n.fingering || "";
  document.getElementById("lyricInput").value = n.lyric || "";

  const btnAdd = document.getElementById("btnAddNote");
  if (btnAdd) {
    btnAdd.textContent = "✓ Actualizar";
    Object.assign(btnAdd.style, { background: "var(--color-success)", borderColor: "var(--color-success)", color: "#FFF" });
  }
};

const syncMeasureControls = () => {
  const score = state.currentScore;
  state.editorState.editingNoteIdx = null;
  state.editorState.activeMeasure = Math.max(0, Math.min(state.editorState.activeMeasure, score.measures.length - 1));
  const m = score.measures[state.editorState.activeMeasure];

  const setChecked = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };
  setChecked("repeatStart", m.repeatStart);
  setChecked("repeatEnd", m.repeatEnd);
  const ds = document.getElementById("directiveSelect");
  if (ds) ds.value = m.directive || "";
  renderNoteList();
};

const renderNoteList = () => {
  const container = document.getElementById("noteListContainer");
  if (!container || !state.currentScore) return;
  const notes = state.currentScore.measures[state.editorState.activeMeasure][state.editorState.activeStaff] || [];

  container.innerHTML = "";
  const btnAdd = document.getElementById("btnAddNote");
  if (btnAdd && state.editorState.editingNoteIdx == null) {
    btnAdd.textContent = t("btnAddNote");
    Object.assign(btnAdd.style, { background: "", borderColor: "", color: "" });
  }

  let draggedIdx = null;

  notes.forEach((n, idx) => {
    const tag = document.createElement("div");
    tag.className = "note-tag";
    tag.draggable = true;
    tag.style.cursor = "grab";
    if (state.editorState.editingNoteIdx === idx) Object.assign(tag.style, { background: "var(--color-brass)", color: "#FFF" });

    const symbol = n.rest ? "Sil." : (n.keys || []).map(k => `${k.letter}${k.accidental || ""}${k.octave}`).join("+");
    tag.innerHTML = `<span class="note-text" style="cursor:pointer;" title="Clic para Editar">${symbol}</span> <span class="note-tag-del" data-idx="${idx}" title="Eliminar">✕</span>`;

    tag.addEventListener("dragstart", (e) => { draggedIdx = idx; tag.style.opacity = "0.4"; e.dataTransfer.effectAllowed = "move"; });
    tag.addEventListener("dragend", () => { tag.style.opacity = "1"; draggedIdx = null; });
    tag.addEventListener("dragover", (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; });
    tag.addEventListener("drop", (e) => {
      e.preventDefault();
      if (draggedIdx === null || draggedIdx === idx) return;
      const staffNotes = state.currentScore.measures[state.editorState.activeMeasure][state.editorState.activeStaff];
      staffNotes.splice(idx, 0, staffNotes.splice(draggedIdx, 1)[0]);
      state.editorState.editingNoteIdx = null;
      syncMeasureControls();
      renderScore();
    });

    tag.querySelector('.note-text').addEventListener("click", () => {
      if (state.editorState.editingNoteIdx !== null && state.editorState.editingNoteIdx !== idx) saveCurrentNote();
      loadNoteIntoForm(n, idx);
      renderNoteList();
    });
    container.appendChild(tag);
  });

  container.querySelectorAll(".note-tag-del").forEach(btn => btn.addEventListener("click", (e) => {
    const idx = parseInt(e.target.dataset.idx, 10);
    state.currentScore.measures[state.editorState.activeMeasure][state.editorState.activeStaff].splice(idx, 1);
    if (state.editorState.editingNoteIdx === idx) state.editorState.editingNoteIdx = null;
    syncMeasureControls();
    renderScore();
  }));
};

// UI: Card generator with strict ownership UI rendering
const generateCardScore = (score, context) => {
  const isAdmin = state.currentUser?.email === "jm.santos.dev@gmail.com";
  const isOwner = state.currentUser?.uid === score.publisherUid; // FIX: Determine true ownership
  const diffColors = { beginner: "var(--color-success)", intermediate: "#E67E22", advanced: "var(--color-danger)" };
  const dDot = `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${diffColors[score.difficulty || "beginner"]}; margin-right:6px;" title="Dificultad"></span>`;

  let innerHTML = '';
  if (context === "library") {
    innerHTML = `
      <span class="card-eyebrow">${score.timeSig}</span>
      <button class="btn-pin ${score.pinned ? 'is-pinned' : ''}" data-action="pin">★</button>
      <h3>${dDot}${escapeHtml(score.title || t("untitled"))}</h3>
      <p class="composer">${(score.composer || t("unknownAuthor")).split(",").map(c => escapeHtml(c.trim())).join(", ")}</p>
      <div class="meta"><span>${score.measures.length} ${t("measuresTxt")}</span><span>${formatDate(score.updatedAt)}</span></div>
      <div class="card-actions-row">
        <button class="btn-card" data-action="view">${t("viewBtn")}</button>
        <button class="btn-card" data-action="edit">${t("editBtn")}</button>
        <button class="btn-card" data-action="clone-private">${i18nText("Duplicar", "Clone")}</button>
        <button class="btn-card" data-action="publish" title="${i18nText("Publicar en El Códice", "Publish to Codex")}">${t("publishBtn")}</button>
        <button class="btn-card btn-danger-card" data-action="delete">🗑</button>
      </div>`;
  } else {
    const publisherLabel = escapeHtml(score.publisherName || t("unknownAuthor")).toLowerCase();
    const likesCount = score.likedBy?.length || score.likes || 0;
    const hasLiked = state.currentUser && score.likedBy?.includes(state.currentUser.uid);
    innerHTML = `
      <span class="card-eyebrow" style="text-transform: lowercase;">${t("byPublisher")} ${publisherLabel}</span>
      <div style="position:absolute; top: 12px; right: 12px; display:flex; gap: 8px;">
        <button class="btn-pin" data-action="like-codex" style="color:var(--color-danger);" title="Me gusta">${hasLiked ? '❤️' : '🤍'} ${likesCount}</button>
        <span style="font-size: 11px; color: var(--color-ink-soft); display:flex; align-items:center;" title="${i18nText("Veces guardada", "Times copied")}">⎘ ${score.copies || 0}</span>
      </div>
      <h3>${dDot}${escapeHtml(score.title || t("untitled"))}</h3>
      <p class="composer">${escapeHtml(score.composer || t("unknownAuthor"))}</p>
      <div class="meta"><span>${score.measures?.length || 0} ${t("measuresTxt")}</span></div>
      <div class="card-actions-row">
        <button class="btn-card" data-action="view-codex">${t("viewBtn")}</button>
        <button class="btn-card" data-action="clone-codex">${i18nText("Guardar copia", "Save copy")}</button>
        ${(isAdmin || isOwner) ? `<button class="btn-card btn-danger-card" data-action="delete-codex" title="${t("deleteBtn")}">🗑</button>` : ''}
      </div>`;
  }

  const card = document.createElement("div");
  card.className = "score-card";
  card.innerHTML = innerHTML;
  card.style.cursor = "pointer";
  return card;
};

const filterAndSortScores = (scores, libState) => {
  return scores.filter(s => {
    if (libState.query && !(s.title || "").toLowerCase().includes(libState.query) && !(s.composer || "").toLowerCase().includes(libState.query) && !(s.publisherName || "").toLowerCase().includes(libState.query)) return false;
    if (libState.filterTime !== "all" && s.timeSig !== libState.filterTime) return false;
    if (libState.filterKey !== "all" && s.keySig !== libState.filterKey) return false;
    if (libState.filterHands !== "all") {
      const hasT = s.measures.some(m => m.treble?.length > 0), hasB = s.measures.some(m => m.bass?.length > 0);
      if (libState.filterHands === "both" && (!hasT || !hasB)) return false;
      if (libState.filterHands === "treble" && hasB) return false;
      if (libState.filterHands === "bass" && hasT) return false;
    }
    return true;
  }).sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (libState.sortBy === "likesDesc") return ((b.likedBy?.length || b.likes || 0)) - ((a.likedBy?.length || a.likes || 0));
    if (libState.sortBy === "dateDesc") return b.updatedAt - a.updatedAt;
    if (libState.sortBy === "dateAsc") return a.updatedAt - b.updatedAt;
    if (libState.sortBy === "titleAsc") return (a.title || "").localeCompare(b.title || "");
    if (libState.sortBy === "authorAsc") return (a.composer || "").localeCompare(b.composer || "");
    return 0;
  });
};

// UI: Codex grid renderer with localized dynamic toasts
const fetchAndRenderCodex = async () => {
  const grid = document.getElementById("codexGrid");
  if (!grid) return;
  if (state.publicScores.length === 0) {
    grid.innerHTML = `<p style='text-align:center; grid-column: 1/-1;'>${t("codexLoading")}</p>`;
    try {
      const snap = await firebase.firestore().collection("public_scores").limit(100).get();
      if (snap.empty) return grid.innerHTML = `<p style='text-align:center; grid-column: 1/-1;'>${t("codexEmpty")}</p>`;
      state.publicScores = snap.docs.map(doc => doc.data());
    } catch (err) {
      return grid.innerHTML = `<p style='text-align:center; color:var(--color-danger); grid-column: 1/-1;'>${t("codexError")}</p>`;
    }
  }

  const scores = filterAndSortScores([...state.publicScores], state.codexState);
  grid.innerHTML = "";
  if (scores.length === 0) return grid.innerHTML = `<p style='text-align:center; grid-column: 1/-1;'>${t("codexFilterEmpty")}</p>`;

  scores.forEach(score => {
    const card = generateCardScore(score, "codex");
    card.addEventListener("click", async (e) => {
      const action = e.target.closest("[data-action]")?.dataset.action;

      if (!action || action === "view-codex") {
        state.isViewingPublic = true;
        state.currentScore = score;
        window.location.hash = `#viewer/${score.id}`;
        return;
      }
      e.stopPropagation();

      if (action === "clone-codex") {
        const copy = { ...score, id: uid(), plate: nextPlateNumber(), createdAt: Date.now(), updatedAt: Date.now() };
        ["publisherName", "publisherUid", "likes", "views", "copies"].forEach(k => delete copy[k]);
        persistScore(copy);
        showToast(i18nText("Guardado en tu catálogo", "Saved to your catalog"), "success");
        firebase.firestore().collection("public_scores").doc(score.id).update({ copies: firebase.firestore.FieldValue.increment(1) });
      } else if (action === "like-codex") {
        if (!state.currentUser) return showToast(i18nText("Inicia sesión para dar Me Gusta", "Log in to Like scores"), "error");
        const docRef = firebase.firestore().collection("public_scores").doc(score.id);
        const u = state.currentUser.uid;
        if (score.likedBy?.includes(u)) {
          docRef.update({ likedBy: firebase.firestore.FieldValue.arrayRemove(u) });
          score.likedBy = score.likedBy.filter(id => id !== u);
        } else {
          docRef.update({ likedBy: firebase.firestore.FieldValue.arrayUnion(u) });
          (score.likedBy = score.likedBy || []).push(u);
        }
        fetchAndRenderCodex();
      } else if (action === "delete-codex") {
        try {
          if (await showConfirm(t("deleteBtn"), i18nText("¿Eliminar definitivamente esta obra pública?", "Permanently delete this public score?"), t("deleteBtn"), true)) {
            await firebase.firestore().collection("public_scores").doc(score.id).delete();
            state.publicScores = state.publicScores.filter(s => s.id !== score.id);
            fetchAndRenderCodex();
            showToast(i18nText("Partitura eliminada del Códice", "Score deleted from Codex"), "success");
          }
        } catch(err) {
          console.error("Delete Codex Error:", err);
          showToast(i18nText("Error al eliminar. Revisa la consola.", "Delete error. Check console."), "error");
        }
      }
    });
    grid.appendChild(card);
  });
};

// UI: Private library renderer with localized dynamic toasts
const renderLibrary = () => {
  const grid = document.getElementById("libraryGrid");
  const empty = document.getElementById("libraryEmpty");
  if (!grid) return;

  const scores = filterAndSortScores(Object.values(loadAll()), state.libraryState);
  grid.innerHTML = "";

  if (scores.length === 0) {
    if (empty) empty.hidden = false;
    grid.hidden = true;
    return;
  }
  if (empty) empty.hidden = true;
  grid.hidden = false;

  scores.forEach((score) => {
    const card = generateCardScore(score, "library");
    card.addEventListener("click", async (e) => {
      const act = e.target.closest("[data-action]")?.dataset.action;
      if (!act) { window.location.hash = `#viewer/${score.id}`; return; }
      e.stopPropagation();

      if (act === "pin") { score.pinned = !score.pinned; persistScore(score); renderLibrary(); }
      else if (act === "clone-private") { persistScore({ ...score, id: uid(), plate: nextPlateNumber(), title: `${score.title} (Copia)`, createdAt: Date.now(), updatedAt: Date.now() }); renderLibrary(); showToast(i18nText("Partitura duplicada", "Score cloned"), "success"); }
      else if (act === "publish") publishToCodex(score);
      else if (act === "edit") window.location.hash = `#editor/${score.id}`;
      else if (act === "view") window.location.hash = `#viewer/${score.id}`;
      else if (act === "delete") {
        if (await showConfirm(t("delConfirm"), i18nText("¿Seguro que quieres borrar esta obra de tu catálogo?", "Are you sure you want to delete this score from your catalog?"), t("deleteBtn"), true)) {
          if (state.currentUser) {
            try {
              await firebase.firestore().collection("users").doc(state.currentUser.uid).collection("scores").doc(score.id).delete();
              showToast(i18nText("Obra eliminada del catálogo y la nube", "Score deleted from catalog and cloud"), "success");
            } catch(err) {
              console.error("Cloud delete error:", err);
              showToast(i18nText("Error de permisos en la nube. La partitura no se ha borrado.", "Cloud permission error. Score not deleted."), "error");
              return;
            }
          } else {
            showToast(i18nText("Obra eliminada localmente", "Score deleted locally"), "success");
          }
          deleteScoreById(score.id);
          renderLibrary();
        }
      }
    });
    grid.appendChild(card);
  });
};

const publishToCodex = async (score) => {
  if (!state.currentUser) return showToast("Inicia sesión para publicar", "error");
  try {
    await firebase.firestore().collection("public_scores").doc(score.id).set({
      ...score, publisherUid: state.currentUser.uid, publisherName: state.currentUser.displayName || state.currentUser.email || "Anónimo", likes: 0, views: 0
    });
    state.publicScores = [];
    showToast("¡Partitura inmortalizada en El Códice!", "success");
  } catch(e) { showToast("Error al publicar: " + e.message, "error"); }
};

const setupEventListeners = () => {
  const layoutBtn = document.getElementById("btnToggleLayout");
  if (layoutBtn) {
    state.editorState.layoutMode = state.editorState.layoutMode || "continuous";
    layoutBtn.innerHTML = state.editorState.layoutMode === "continuous" ? "📜" : "📖";

    layoutBtn.addEventListener("click", () => {
      state.editorState.layoutMode = state.editorState.layoutMode === "continuous" ? "book" : "continuous";
      state.editorState.bookSpread = 0;
      applyLayoutMode();
      renderScore();
    });
  }

  setupCustomSelect("customKeySig", "keySig", (val) => { if (state.currentScore) { state.currentScore.keySig = val; renderScore(); } });
  setupCustomSelect("customFilterKeySig", "filterKeySig", (val) => { state.libraryState.filterKey = val; renderLibrary(); });
  setupCustomSelect("customFilterCodexKeySig", "filterCodexKeySig", (val) => { state.codexState.filterKey = val; fetchAndRenderCodex(); });

  document.getElementById("btnShowTerms")?.addEventListener("click", (e) => {
    e.preventDefault();
    showConfirm(t("termsLink"), t("termsMsg"), t("acceptBtn"), false);
  });
  document.getElementById("btnReportCopyright")?.addEventListener("click", (e) => {
    e.preventDefault();
    showConfirm(t("reportLink"), t("reportMsg"), t("understoodBtn"), false);
  });

  document.querySelectorAll(".lang-btn").forEach(btn => btn.addEventListener("click", () => setLang(btn.dataset.lang)));
  document.getElementById("btnExportJson")?.addEventListener("click", (e) => { e.preventDefault(); if(state.currentScore) downloadBlob(`${slugify(state.currentScore.title)}.json`, JSON.stringify(state.currentScore, null, 2)); });
  document.getElementById("btnExportPdf")?.addEventListener("click", (e) => { e.preventDefault(); if(!state.currentScore) return; const oTitle = document.title; document.title = `${(state.currentScore.title || t("untitled")).trim()} — ${(state.currentScore.composer || t("unknownAuthor")).trim()}`; window.print(); setTimeout(() => document.title = oTitle, 500); });

  document.getElementById("btnImport")?.addEventListener("click", () => document.getElementById("fileImport").click());
  document.getElementById("fileImport")?.addEventListener("change", (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.measures) throw new Error("Format error");
        Object.assign(data, { id: uid(), plate: nextPlateNumber(), updatedAt: Date.now(), createdAt: Date.now() });
        persistScore(data);
        window.location.hash = "#catalogo"; renderLibrary();
      } catch (err) { showToast(`Error: ${err.message}`, 'error'); }
      e.target.value = "";
    };
    reader.readAsText(file);
  });

  document.getElementById("btnNewScore")?.addEventListener("click", () => { const score = newScore(); persistScore(score); window.location.hash = `#editor/${score.id}`; });

  document.getElementById("btnBackLibrary")?.addEventListener("click", () => {
    window.location.hash = state.isViewingPublic ? "#codice" : "#catalogo";
  });

  ["brandHome", "btnGoCatalog", "btnGoCodex", "btnGoCodexHero", "btnBackToMyCatalog"].forEach(id => {
    document.getElementById(id)?.addEventListener("click", () => {
      const paths = { brandHome: "#inicio", btnGoCatalog: "#catalogo", btnGoCodex: "#codice", btnGoCodexHero: "#codice", btnBackToMyCatalog: "#catalogo" };
      window.location.hash = paths[id];
    });
  });

  document.getElementById("btnToggleViewer")?.addEventListener("click", () => window.location.hash = (document.body.classList.contains("is-viewer") ? "#editor/" : "#viewer/") + state.currentScore.id);
  document.getElementById("btnTogglePractice")?.addEventListener("click", startPracticeMode);
  document.getElementById("btnStopPracticeFloating")?.addEventListener("click", stopPracticeMode);

  const bindFilter = (id, prop, targetObj, renderFn) => document.getElementById(id)?.addEventListener(id.includes("search") ? "input" : "change", (e) => { targetObj[prop] = e.target.value.toLowerCase(); renderFn(); });
  bindFilter("searchScores", "query", state.libraryState, renderLibrary);
  bindFilter("sortScores", "sortBy", state.libraryState, renderLibrary);
  bindFilter("filterTimeSig", "filterTime", state.libraryState, renderLibrary);
  bindFilter("filterHands", "filterHands", state.libraryState, renderLibrary);
  bindFilter("searchCodex", "query", state.codexState, fetchAndRenderCodex);
  bindFilter("sortCodex", "sortBy", state.codexState, fetchAndRenderCodex);
  bindFilter("filterCodexTimeSig", "filterTime", state.codexState, fetchAndRenderCodex);
  bindFilter("filterCodexHands", "filterHands", state.codexState, fetchAndRenderCodex);

  document.getElementById("btnToggleFilters")?.addEventListener("click", () => { const f = document.getElementById("catalogFilters"); if (f) f.hidden = !f.hidden; });
  document.getElementById("btnToggleCodexFilters")?.addEventListener("click", () => { const f = document.getElementById("codexFilters"); if (f) f.hidden = !f.hidden; });

  if (document.getElementById("scoreTitle")) {
    const debouncedRender = debounce(renderScore, 300);
    ["scoreTitle", "scoreComposer"].forEach(id => document.getElementById(id).addEventListener("input", (e) => { state.currentScore[id === "scoreTitle" ? "title" : "composer"] = e.target.value; debouncedRender(); }));
    ["timeSig", "scoreDifficulty"].forEach(id => document.getElementById(id).addEventListener("change", (e) => { state.currentScore[id === "timeSig" ? "timeSig" : "difficulty"] = e.target.value; renderScore(); }));

    // UI: Sync editor BPM changes strictly within 20-300 bounds and trigger canvas re-render
    document.getElementById("scoreBpm")?.addEventListener("change", (e) => {
      const newBpm = Math.max(20, Math.min(300, parseInt(e.target.value, 10) || 100));
      e.target.value = newBpm;
      state.currentScore.bpm = newBpm;
      const plBpmInput = document.getElementById("plBpm");
      if (plBpmInput) plBpmInput.value = newBpm;

      renderScore();
    });

    document.getElementById("btnPrevMeasure").addEventListener("click", () => { state.editorState.activeMeasure--; syncMeasureControls(); renderScore(); });
    document.getElementById("btnNextMeasure").addEventListener("click", () => { state.editorState.activeMeasure++; syncMeasureControls(); renderScore(); });
    document.getElementById("btnAddMeasure").addEventListener("click", () => { state.currentScore.measures.push(newMeasure()); state.editorState.activeMeasure = state.currentScore.measures.length - 1; syncMeasureControls(); renderScore(); });
    document.getElementById("btnDeleteMeasure").addEventListener("click", async () => {
      if (state.currentScore.measures.length <= 1) return showToast(t("minMeasureAlert"), 'error');
      if (await showConfirm(t("delMeasureConfirm"), "Se borrarán todas las notas de este compás.", t("btnDelMeasure"), true)) {
        state.currentScore.measures.splice(state.editorState.activeMeasure, 1);
        syncMeasureControls();
        renderScore();
      }
    });

    ["repeatStart", "repeatEnd"].forEach(id => document.getElementById(id).addEventListener("change", (e) => { state.currentScore.measures[state.editorState.activeMeasure][id] = e.target.checked; renderScore(); }));
    document.getElementById("directiveSelect").addEventListener("change", (e) => { state.currentScore.measures[state.editorState.activeMeasure].directive = e.target.value; renderScore(); });

    ["Treble", "Bass"].forEach(clef => document.getElementById("btnStaff" + clef).addEventListener("click", () => {
      state.editorState.activeStaff = clef.toLowerCase();
      document.getElementById("btnStaffTreble").classList.toggle("is-active", clef === "Treble");
      document.getElementById("btnStaffBass").classList.toggle("is-active", clef === "Bass");
      renderNoteList();
    }));

    document.getElementById("isRest").addEventListener("change", (e) => {
      const pitchFields = document.getElementById("pitchFields");
      pitchFields.style.opacity = e.target.checked ? 0.4 : 1;
      pitchFields.querySelectorAll("select").forEach(s => s.disabled = e.target.checked);
    });

    document.getElementById("durationGrid").addEventListener("click", (e) => {
      const btn = e.target.closest(".dur-btn"); if (!btn) return;
      state.editorState.duration = btn.dataset.dur;
      document.getElementById("durationGrid").querySelectorAll(".dur-btn").forEach(b => b.classList.toggle("is-active", b === btn));
    });

    document.getElementById("btnAddNote").addEventListener("click", () => {
      const isEditing = state.editorState.editingNoteIdx !== null;
      const staffNotes = state.currentScore.measures[state.editorState.activeMeasure][state.editorState.activeStaff];
      const needed = measureNeededQuarters(state.currentScore.timeSig);
      const durQ = (DUR_Q[state.editorState.duration] || 0) * (document.getElementById("isDotted").checked ? 1.5 : 1);

      let currentUsed = quartersUsed(staffNotes);
      if (isEditing) currentUsed -= (DUR_Q[staffNotes[state.editorState.editingNoteIdx].duration] || 0) * (staffNotes[state.editorState.editingNoteIdx].dotted ? 1.5 : 1);

      if (currentUsed + durQ > needed) {
        const desk = document.getElementById("engraveDesk");
        desk.style.transform = "translateX(10px)";
        setTimeout(() => desk.style.transform = "translateX(-10px)", 50);
        setTimeout(() => desk.style.transform = "translateX(0)", 100);
        return;
      }

      clearRedoStack();
      if (isEditing) { saveCurrentNote(); state.editorState.editingNoteIdx = null; }
      else { staffNotes.push(getFormNote()); }

      ["dynamicSelect", "fingeringSelect", "lyricInput"].forEach(id => document.getElementById(id).value = "");
      syncMeasureControls(); renderScore();
    });

    document.getElementById("btnAddChordNote")?.addEventListener("click", () => {
      const { activeMeasure, activeStaff, editingNoteIdx } = state.editorState;
      const notes = state.currentScore.measures[activeMeasure]?.[activeStaff];
      if (!notes || !notes.length) return showToast("Añade una nota base primero", "error");

      const target = editingNoteIdx !== null ? notes[editingNoteIdx] : notes[notes.length - 1];
      if (target.rest) return showToast("No puedes hacer acordes con silencios", "error");

      const k = { letter: document.getElementById("pitchLetter").value, accidental: document.getElementById("pitchAccidental").value, octave: parseInt(document.getElementById("pitchOctave").value, 10) };
      if (target.keys.some(x => x.letter === k.letter && x.octave === k.octave && x.accidental === k.accidental)) return showToast("Esa tecla ya está en el acorde", "error");

      clearRedoStack();
      target.keys.push(k);
      target.keys.sort((a, b) => (a.octave * 10 + { 'c': 0, 'd': 1, 'e': 2, 'f': 3, 'g': 4, 'a': 5, 'b': 6 }[a.letter.toLowerCase()]) - (b.octave * 10 + { 'c': 0, 'd': 1, 'e': 2, 'f': 3, 'g': 4, 'a': 5, 'b': 6 }[b.letter.toLowerCase()]));

      syncMeasureControls(); renderScore();
    });

    document.addEventListener("keydown", (e) => {
      if (document.getElementById("viewEditor").hidden || ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const score = state.currentScore; if (!score || !score.measures) return;
      let activeM = state.editorState.activeMeasure, staff = state.editorState.activeStaff;
      let notes = score.measures[activeM]?.[staff] || [];

      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        if (state.editorState.editingNoteIdx !== null) {
          saveCurrentNote();
          let targetIdx = state.editorState.editingNoteIdx + dir;
          if (targetIdx >= notes.length || targetIdx < 0) {
            let nextM = activeM + dir;
            if (nextM >= 0 && nextM < score.measures.length) {
              state.editorState.activeMeasure = nextM;
              syncMeasureControls();
              notes = score.measures[nextM][staff] || [];
              const startIdx = dir > 0 ? 0 : notes.length - 1;
              if (notes.length > 0) loadNoteIntoForm(notes[startIdx], startIdx);
              renderNoteList(); renderScore();
            } else {
              const boundaryIdx = dir > 0 ? notes.length - 1 : 0;
              loadNoteIntoForm(notes[boundaryIdx], boundaryIdx);
              renderNoteList();
            }
          } else {
            loadNoteIntoForm(notes[targetIdx], targetIdx);
            renderNoteList();
          }
        } else if (notes.length > 0) {
          const idx = dir > 0 ? 0 : notes.length - 1;
          loadNoteIntoForm(notes[idx], idx);
          renderNoteList();
        }
      }
    });
  }

  const btnPlay = document.getElementById("plBtnPlay");
  if (btnPlay) {
    btnPlay.addEventListener("click", () => isAudioPlaying() ? pauseAudio() : playAudio());
    document.getElementById("plBtnRewind").addEventListener("click", stopPlayback);
    document.querySelectorAll(".pl-speed-btn").forEach((b) => b.addEventListener("click", () => {
      const factor = parseFloat(b.dataset.speed); setSpeedFactor(factor);
      document.querySelectorAll(".pl-speed-btn").forEach(btn => btn.classList.toggle("is-active", parseFloat(btn.dataset.speed) === factor));
    }));
    // UI: Sync audio BPM with physical score state
    document.getElementById("plBpm")?.addEventListener("change", (e) => {
      const newBpm = Math.max(20, Math.min(300, parseInt(e.target.value, 10) || 100));
      e.target.value = newBpm;
      if (state.currentScore) {
        state.currentScore.bpm = newBpm;
      }
      refreshAudioBPM();
    });    document.addEventListener("click", (e) => { if (isAudioPlaying() && (e.target.closest("#engraveDesk") || e.target.closest(".measure-hit"))) pauseAudio(); });
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  // INIT: Core environment & theme preferences
  await checkMaintenanceStatus();
  const themeBtn = document.getElementById('themeToggleBtn');
  const isDark = (localStorage.getItem('theme') || 'light') === 'dark';
  if (isDark) { document.body.classList.add('dark-theme'); if (themeBtn) themeBtn.textContent = '☀️'; }
  if (themeBtn) themeBtn.onclick = () => {
    const active = document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', active ? 'dark' : 'light');
    themeBtn.textContent = active ? '☀️' : '🌙';
  };

  // INIT: External services & modular features
  initFirebase(); setupAuthUI(); setupProfileUI(); initShortcuts(); initDragAndDrop(); setupEventListeners();

  // UI: Canvas zoom handling via mouse wheel
  const paperWrap = document.getElementById('paperWrap');
  if (paperWrap) {
    let zoom = 1;
    paperWrap.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) { e.preventDefault(); zoom = Math.max(0.5, Math.min(zoom + (e.deltaY < 0 ? 0.1 : -0.1), 2)); paperWrap.style.setProperty('--zoom-level', zoom); }
    }, { passive: false });
  }

  // UI: Background animations rendering (Floating notes)
  const wrapSpawn = document.getElementById("floatingNotes");
  if (wrapSpawn && wrapSpawn.childElementCount === 0) {
    const glyphs = ["♪", "♫", "♩", "𝄞"];
    for (let i = 0; i < 12; i++) {
      const s = document.createElement("span"); s.className = "note-anim"; s.textContent = glyphs[i % 4];
      Object.assign(s.style, { left: `${Math.random() * 100}%`, animationDuration: `${14 + Math.random() * 12}s`, animationDelay: `-${Math.random() * 20}s`, fontSize: `${24 + Math.random() * 30}px` });
      wrapSpawn.appendChild(s);
    }
  }

  // UI: Sticky header dimensional observer
  const header = document.getElementById("mainHeader");
  if (header && typeof ResizeObserver !== "undefined") new ResizeObserver(syncEditorStickyOffset).observe(header);
  window.addEventListener("resize", syncEditorStickyOffset);

  // SYNC: Local state event listeners
  on("langchange", () => { renderCustomSelects(); if (!document.getElementById("viewLibrary")?.hidden) renderLibrary(); if (!document.getElementById("viewCodex")?.hidden) fetchAndRenderCodex(); if (!document.getElementById("viewEditor")?.hidden) renderScore(); updateViewerButtonText(); });
  on("scoreschanged", () => { if (!document.getElementById("viewLibrary")?.hidden) renderLibrary(); });
  on("measureselected", syncMeasureControls);

  // ROUTER: Navigation handling & auto-lang detection
  setLang((navigator.language || navigator.userLanguage || "en").toLowerCase().startsWith("es") ? "es" : "en");
  window.addEventListener("hashchange", handleNavigation);
  if (!window.location.hash || window.location.hash === "#") window.location.hash = "#inicio"; else handleNavigation();
});

// MAINTENANCE: Global exception handlers to prevent critical UI failures
window.addEventListener("error", (event) => {
  console.error("Critical Client Exception intercepted:", event.error);
  if (typeof showToast === "function") {
    showToast("An unexpected error occurred in the interface.", "danger");
  }
  event.preventDefault();
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Critical Async Promise Rejection intercepted:", event.reason);
  if (typeof showToast === "function") {
    showToast("Synchronization error or async process interrupted.", "danger");
  }
  event.preventDefault();
});
