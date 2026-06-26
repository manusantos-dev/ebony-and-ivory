// INIT: Main Application Controller & DOM Binder
import { state, resetEditorState } from "./core/state";
import { on } from "./core/events";
import { t, setLang } from "./ui/i18n";
import { loadAll, uid, nextPlateNumber, slugify, formatDate, escapeHtml, measureNeededQuarters, quartersUsed, newMeasure, newScore, downloadBlob, persistScore, deleteScoreById } from "./core/storage";
import { DUR_Q } from "./core/config";
import { renderCustomSelects, updateCustomSelectUI, setupCustomSelect } from "./ui/custom-select";
import { renderScore } from "./features/notation-renderer";
import { playAudio, pauseAudio, stopPlayback, isAudioPlaying, setSpeedFactor, refreshAudioBPM } from "./features/player";
import { startPracticeMode, stopPracticeMode } from "./features/practice";
import { clearRedoStack } from "./features/keyboard";
import { initFirebase, setupAuthUI, setupProfileUI } from "./auth";
import { showToast } from "./ui/toast";
import { debounce } from './utils/debounce';
import { initShortcuts } from './features/keyboard';
import { initDragAndDrop } from './features/drag-drop';
import { checkMaintenanceStatus } from './features/maintenance';
import { showConfirm } from './ui/dialog';
import { Score, Note } from "./core/types";
import { initPWA } from './core/pwa';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

state.codexState = { query: "", sortBy: "likesDesc", filterTime: "all", filterKey: "all", filterHands: "all" };
state.publicScores = [];
state.isViewingPublic = false;
state.editorState.layoutMode = "continuous";

const i18nText = (es: string, en: string): string => state.lang === 'es' ? es : en;

const applyLayoutMode = (): void => {
  const wrap = document.getElementById("paperWrap");
  const btn = document.getElementById("btnToggleLayout");
  if (!wrap || !btn) return;
  const isBook = state.editorState.layoutMode === "book";
  wrap.className = `paper-wrap ${isBook ? "layout-book" : "layout-continuous"}`;
  btn.innerHTML = isBook ? "📖" : "📜";
  btn.title = isBook ? "Cambiar a Vista Continua (Pergamino)" : "Cambiar a Vista de Libro";
};

const handleNavigation = (): void => {
  const hash = window.location.hash;
  document.body.classList.remove("is-home", "is-viewer");
  stopPlayback();
  stopPracticeMode();

  const viewIds = ["viewHome", "viewLibrary", "viewCodex", "viewEditor", "libraryActions", "editorActions", "btnToggleViewer", "btnBackLibrary", "topNavLinks", "btnTopCodex", "btnTopCatalog"];
  const views: Record<string, HTMLElement | null> = {};

  viewIds.forEach(id => {
    views[id] = document.getElementById(id);
    if (views[id] && !id.startsWith("btn")) views[id]!.hidden = true;
  });

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
    ["viewLibrary", "libraryActions", "topNavLinks", "btnTopCodex"].forEach(id => views[id] && (views[id]!.hidden = false));
    if (views.btnTopCatalog) views.btnTopCatalog.hidden = true;
    document.title = `${t("catalogTitle")} — Ebony & Ivory`;
    renderLibrary();
    window.scrollTo(0, 0);
  } else if (hash === "#codice") {
    state.currentScore = null;
    state.isViewingPublic = true;
    ["viewCodex", "topNavLinks", "btnTopCatalog"].forEach(id => views[id] && (views[id]!.hidden = false));
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

const syncEditorStickyOffset = (): void => {
  const header = document.getElementById("mainHeader");
  const stickyTop = header ? Math.round(header.getBoundingClientRect().height) : 0;
  document.documentElement.style.setProperty("--editor-sticky-offset", `${stickyTop}px`);
  const desk = document.getElementById("engraveDesk");
  if (desk) desk.style.height = `calc(100vh - ${stickyTop}px)`;
};

const updateViewerButtonText = (): void => {
  const btn = document.getElementById("btnToggleViewer");
  if (!btn) return;
  if (state.isViewingPublic) {
    btn.innerHTML = `⎘ ${t("saveCopyBtn")}`;
    btn.onclick = () => {
      if (!state.currentScore) return;
      const copy = { ...state.currentScore, id: uid(), plate: nextPlateNumber(), createdAt: Date.now(), updatedAt: Date.now() };
      delete copy.publisherName; delete copy.publisherUid; delete copy.likes; delete copy.views; delete copy.copies;
      persistScore(copy);
      showToast(t("savedToCatalog"), "success");
      state.isViewingPublic = false;
      window.location.hash = `#editor/${copy.id}`;
    };
  } else {
    btn.textContent = document.body.classList.contains("is-viewer") ? t("editMode") : t("viewMode");
    btn.onclick = () => window.location.hash = (document.body.classList.contains("is-viewer") ? "#editor/" : "#viewer/") + state.currentScore?.id;
  }
};

const initEditor = (views: Record<string, HTMLElement | null>): void => {
  if (!state.currentScore) return;
  const preservedLayoutMode = state.editorState?.layoutMode || "continuous";
  resetEditorState();
  state.editorState.layoutMode = preservedLayoutMode;
  applyLayoutMode();

  ["viewEditor", "editorActions"].forEach(id => views[id] && (views[id]!.hidden = false));
  document.title = `${state.currentScore.title || t("untitled")} — Ebony & Ivory`;

  const setVal = (id: string, val: string | number) => { const el = document.getElementById(id) as HTMLInputElement; if (el) el.value = String(val); };
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

const getFormNote = (): Note => ({
  rest: (document.getElementById("isRest") as HTMLInputElement).checked,
  keys: [{
    letter: (document.getElementById("pitchLetter") as HTMLInputElement).value,
    accidental: (document.getElementById("pitchAccidental") as HTMLInputElement).value,
    octave: parseInt((document.getElementById("pitchOctave") as HTMLInputElement).value, 10)
  }],
  duration: state.editorState.duration,
  dotted: (document.getElementById("isDotted") as HTMLInputElement).checked,
  dynamic: (document.getElementById("dynamicSelect") as HTMLInputElement).value,
  fingering: (document.getElementById("fingeringSelect") as HTMLInputElement).value,
  lyric: (document.getElementById("lyricInput") as HTMLInputElement).value
});

const saveCurrentNote = (): void => {
  if (!state.currentScore) return;
  const { activeMeasure, activeStaff, editingNoteIdx } = state.editorState;
  if (editingNoteIdx === null) return;
  const staffNotes = state.currentScore.measures[activeMeasure]?.[activeStaff];
  if (staffNotes && staffNotes[editingNoteIdx]) staffNotes[editingNoteIdx] = getFormNote();
};

const loadNoteIntoForm = (n: Note, idx: number): void => {
  state.editorState.editingNoteIdx = idx;
  const isRest = document.getElementById("isRest") as HTMLInputElement;
  isRest.checked = n.rest;
  isRest.dispatchEvent(new Event("change"));

  if (!n.rest && n.keys && n.keys.length > 0) {
    const primaryKey = n.keys[0];
    (document.getElementById("pitchLetter") as HTMLInputElement).value = primaryKey.letter;
    (document.getElementById("pitchAccidental") as HTMLInputElement).value = primaryKey.accidental || "";
    (document.getElementById("pitchOctave") as HTMLInputElement).value = String(primaryKey.octave);
  }

  state.editorState.duration = n.duration;
  document.querySelectorAll(".dur-btn").forEach(b => b.classList.toggle("is-active", (b as HTMLElement).dataset.dur === n.duration));
  (document.getElementById("isDotted") as HTMLInputElement).checked = !!n.dotted;
  (document.getElementById("dynamicSelect") as HTMLInputElement).value = n.dynamic || "";
  (document.getElementById("fingeringSelect") as HTMLInputElement).value = n.fingering || "";
  (document.getElementById("lyricInput") as HTMLInputElement).value = n.lyric || "";

  const btnAdd = document.getElementById("btnAddNote");
  if (btnAdd) {
    btnAdd.textContent = "✓ Actualizar";
    Object.assign(btnAdd.style, { background: "var(--color-success)", borderColor: "var(--color-success)", color: "#FFF" });
  }
};

const syncMeasureControls = (): void => {
  const score = state.currentScore;
  if (!score) return;
  state.editorState.editingNoteIdx = null;
  state.editorState.activeMeasure = Math.max(0, Math.min(state.editorState.activeMeasure, score.measures.length - 1));
  const m = score.measures[state.editorState.activeMeasure];

  const setChecked = (id: string, val: boolean) => { const el = document.getElementById(id) as HTMLInputElement; if (el) el.checked = !!val; };
  setChecked("repeatStart", m.repeatStart);
  setChecked("repeatEnd", m.repeatEnd);
  const ds = document.getElementById("directiveSelect") as HTMLInputElement;
  if (ds) ds.value = m.directive || "";
  renderNoteList();
};

const renderNoteList = (): void => {
  const container = document.getElementById("noteListContainer");
  if (!container || !state.currentScore) return;
  const notes = state.currentScore.measures[state.editorState.activeMeasure][state.editorState.activeStaff] || [];

  container.innerHTML = "";
  const btnAdd = document.getElementById("btnAddNote");
  if (btnAdd && state.editorState.editingNoteIdx == null) {
    btnAdd.textContent = t("btnAddNote");
    Object.assign(btnAdd.style, { background: "", borderColor: "", color: "" });
  }

  let draggedIdx: number | null = null;

  notes.forEach((n, idx) => {
    const tag = document.createElement("div");
    tag.className = "note-tag";
    tag.draggable = true;
    tag.style.cursor = "grab";
    if (state.editorState.editingNoteIdx === idx) Object.assign(tag.style, { background: "var(--color-brass)", color: "#FFF" });

    const symbol = n.rest ? "Sil." : (n.keys || []).map(k => `${k.letter}${k.accidental || ""}${k.octave}`).join("+");
    tag.innerHTML = `<span class="note-text" style="cursor:pointer;" title="Clic para Editar">${symbol}</span> <span class="note-tag-del" data-idx="${idx}" title="Eliminar">✕</span>`;

    tag.addEventListener("dragstart", (e) => { draggedIdx = idx; tag.style.opacity = "0.4"; if (e.dataTransfer) e.dataTransfer.effectAllowed = "move"; });
    tag.addEventListener("dragend", () => { tag.style.opacity = "1"; draggedIdx = null; });
    tag.addEventListener("dragover", (e) => { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = "move"; });
    tag.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!state.currentScore) return;
      if (draggedIdx === null || draggedIdx === idx) return;
      const staffNotes = state.currentScore.measures[state.editorState.activeMeasure][state.editorState.activeStaff];
      staffNotes.splice(idx, 0, staffNotes.splice(draggedIdx, 1)[0]);
      state.editorState.editingNoteIdx = null;
      syncMeasureControls();
      renderScore();
    });

    tag.querySelector('.note-text')?.addEventListener("click", () => {
      if (state.editorState.editingNoteIdx !== null && state.editorState.editingNoteIdx !== idx) saveCurrentNote();
      loadNoteIntoForm(n, idx);
      renderNoteList();
    });
    container.appendChild(tag);
  });

  container.querySelectorAll(".note-tag-del").forEach(btn => btn.addEventListener("click", (e) => {
    if (!state.currentScore) return;
    const idx = parseInt((e.target as HTMLElement).dataset.idx || "0", 10);
    state.currentScore.measures[state.editorState.activeMeasure][state.editorState.activeStaff].splice(idx, 1);
    if (state.editorState.editingNoteIdx === idx) state.editorState.editingNoteIdx = null;
    syncMeasureControls();
    renderScore();
  }));
};

const generateCardScore = (score: Score, context: string): HTMLDivElement => {
  const isAdmin = state.currentUser?.email === "jm.santos.dev@gmail.com";
  const isOwner = state.currentUser?.uid === score.publisherUid;
  const diffColors: Record<string, string> = { beginner: "var(--color-success)", intermediate: "#E67E22", advanced: "var(--color-danger)" };
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

const filterAndSortScores = (scores: Score[], libState: any): Score[] => {
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

const fetchAndRenderCodex = async (): Promise<void> => {
  const grid = document.getElementById("codexGrid");
  if (!grid) return;
  if (state.publicScores.length === 0) {
    grid.innerHTML = `<p style='text-align:center; grid-column: 1/-1;'>${t("codexLoading")}</p>`;
    try {
      const snap = await firebase.firestore().collection("public_scores").limit(100).get();
      if (snap.empty) { grid.innerHTML = `<p style='text-align:center; grid-column: 1/-1;'>${t("codexEmpty")}</p>`; return; }
      state.publicScores = snap.docs.map(doc => doc.data() as Score);
    } catch (err) {
      grid.innerHTML = `<p style='text-align:center; color:var(--color-danger); grid-column: 1/-1;'>${t("codexError")}</p>`; return;
    }
  }

  const scores = filterAndSortScores([...state.publicScores], state.codexState);
  grid.innerHTML = "";
  if (scores.length === 0) { grid.innerHTML = `<p style='text-align:center; grid-column: 1/-1;'>${t("codexFilterEmpty")}</p>`; return; }

  scores.forEach(score => {
    const card = generateCardScore(score, "codex");
    card.addEventListener("click", async (e) => {
      const action = (e.target as HTMLElement).closest("[data-action]")?.getAttribute("data-action");

      if (!action || action === "view-codex") {
        state.isViewingPublic = true;
        state.currentScore = score;
        window.location.hash = `#viewer/${score.id}`;
        return;
      }
      e.stopPropagation();

      if (action === "clone-codex") {
        const copy: Score = { ...score, id: uid(), plate: nextPlateNumber(), createdAt: Date.now(), updatedAt: Date.now() };
        ["publisherName", "publisherUid", "likes", "views", "copies"].forEach(k => delete (copy as any)[k]);
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

const renderLibrary = (): void => {
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
      const act = (e.target as HTMLElement).closest("[data-action]")?.getAttribute("data-action");
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

const publishToCodex = async (score: Score): Promise<void> => {
  if (!state.currentUser) return showToast("Inicia sesión para publicar", "error");
  try {
    await firebase.firestore().collection("public_scores").doc(score.id).set({
      ...score, publisherUid: state.currentUser.uid, publisherName: state.currentUser.displayName || state.currentUser.email || "Anónimo", likes: 0, views: 0
    });
    state.publicScores = [];
    showToast("¡Partitura inmortalizada en El Códice!", "success");
  } catch(e: any) { showToast("Error al publicar: " + e.message, "error"); }
};

const setupEventListeners = (): void => {
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

  document.getElementById("btnShowTerms")?.addEventListener("click", (e) => { e.preventDefault(); showConfirm(t("termsLink"), t("termsMsg"), t("acceptBtn"), false); });
  document.getElementById("btnReportCopyright")?.addEventListener("click", (e) => { e.preventDefault(); showConfirm(t("reportLink"), t("reportMsg"), t("understoodBtn"), false); });

  document.querySelectorAll(".lang-btn").forEach(btn => btn.addEventListener("click", () => setLang((btn as HTMLElement).dataset.lang || 'en')));
  document.getElementById("btnExportJson")?.addEventListener("click", (e) => { e.preventDefault(); if(state.currentScore) downloadBlob(`${slugify(state.currentScore.title)}.json`, JSON.stringify(state.currentScore, null, 2)); });
  document.getElementById("btnExportPdf")?.addEventListener("click", (e) => { e.preventDefault(); if(!state.currentScore) return; const oTitle = document.title; document.title = `${(state.currentScore.title || t("untitled")).trim()} — ${(state.currentScore.composer || t("unknownAuthor")).trim()}`; window.print(); setTimeout(() => document.title = oTitle, 500); });

  document.getElementById("btnImport")?.addEventListener("click", () => document.getElementById("fileImport")?.click());
  document.getElementById("fileImport")?.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!data.measures) throw new Error("Format error");
        Object.assign(data, { id: uid(), plate: nextPlateNumber(), updatedAt: Date.now(), createdAt: Date.now() });
        persistScore(data);
        window.location.hash = "#catalogo"; renderLibrary();
      } catch (err: any) { showToast(`Error: ${err.message}`, 'error'); }
      target.value = "";
    };
    reader.readAsText(file);
  });

  document.getElementById("btnNewScore")?.addEventListener("click", () => { const score = newScore(); persistScore(score); window.location.hash = `#editor/${score.id}`; });
  document.getElementById("btnBackLibrary")?.addEventListener("click", () => { window.location.hash = state.isViewingPublic ? "#codice" : "#catalogo"; });

  ["brandHome", "btnGoCatalog", "btnGoCodex", "btnGoCodexHero", "btnBackToMyCatalog"].forEach(id => {
    document.getElementById(id)?.addEventListener("click", () => {
      const paths: Record<string, string> = { brandHome: "#inicio", btnGoCatalog: "#catalogo", btnGoCodex: "#codice", btnGoCodexHero: "#codice", btnBackToMyCatalog: "#catalogo" };
      window.location.hash = paths[id];
    });
  });

  document.getElementById("btnToggleViewer")?.addEventListener("click", () => window.location.hash = (document.body.classList.contains("is-viewer") ? "#editor/" : "#viewer/") + state.currentScore?.id);
  document.getElementById("btnTogglePractice")?.addEventListener("click", startPracticeMode);
  document.getElementById("btnStopPracticeFloating")?.addEventListener("click", stopPracticeMode);

  const bindFilter = (id: string, prop: string, targetObj: any, renderFn: () => void) => document.getElementById(id)?.addEventListener(id.includes("search") ? "input" : "change", (e) => { targetObj[prop] = (e.target as HTMLInputElement).value.toLowerCase(); renderFn(); });
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
    ["scoreTitle", "scoreComposer"].forEach(id => document.getElementById(id)?.addEventListener("input", (e) => { if(state.currentScore) { (state.currentScore as any)[id === "scoreTitle" ? "title" : "composer"] = (e.target as HTMLInputElement).value; debouncedRender(); }}));
    ["timeSig", "scoreDifficulty"].forEach(id => document.getElementById(id)?.addEventListener("change", (e) => { if(state.currentScore) { (state.currentScore as any)[id === "timeSig" ? "timeSig" : "difficulty"] = (e.target as HTMLInputElement).value; renderScore(); }}));

    document.getElementById("scoreBpm")?.addEventListener("change", (e) => {
      const newBpm = Math.max(20, Math.min(300, parseInt((e.target as HTMLInputElement).value, 10) || 100));
      (e.target as HTMLInputElement).value = String(newBpm);
      if(state.currentScore) state.currentScore.bpm = newBpm;
      const plBpmInput = document.getElementById("plBpm") as HTMLInputElement;
      if (plBpmInput) plBpmInput.value = String(newBpm);
      renderScore();
    });

    document.getElementById("btnPrevMeasure")?.addEventListener("click", () => { state.editorState.activeMeasure--; syncMeasureControls(); renderScore(); });
    document.getElementById("btnNextMeasure")?.addEventListener("click", () => { state.editorState.activeMeasure++; syncMeasureControls(); renderScore(); });
    document.getElementById("btnAddMeasure")?.addEventListener("click", () => { if(state.currentScore) { state.currentScore.measures.push(newMeasure()); state.editorState.activeMeasure = state.currentScore.measures.length - 1; syncMeasureControls(); renderScore(); }});
    document.getElementById("btnDeleteMeasure")?.addEventListener("click", async () => {
      if (!state.currentScore) return;
      if (state.currentScore.measures.length <= 1) return showToast(t("minMeasureAlert"), 'error');
      if (await showConfirm(t("delMeasureConfirm"), "Se borrarán todas las notas de este compás.", t("btnDelMeasure"), true)) {
        state.currentScore.measures.splice(state.editorState.activeMeasure, 1);
        syncMeasureControls(); renderScore();
      }
    });

    ["repeatStart", "repeatEnd"].forEach(id => document.getElementById(id)?.addEventListener("change", (e) => { if(state.currentScore) { (state.currentScore.measures[state.editorState.activeMeasure] as any)[id] = (e.target as HTMLInputElement).checked; renderScore(); }}));
    document.getElementById("directiveSelect")?.addEventListener("change", (e) => { if(state.currentScore) { state.currentScore.measures[state.editorState.activeMeasure].directive = (e.target as HTMLInputElement).value; renderScore(); }});

    ["Treble", "Bass"].forEach(clef => document.getElementById("btnStaff" + clef)?.addEventListener("click", () => {
      state.editorState.activeStaff = clef.toLowerCase() as 'treble'|'bass';
      document.getElementById("btnStaffTreble")?.classList.toggle("is-active", clef === "Treble");
      document.getElementById("btnStaffBass")?.classList.toggle("is-active", clef === "Bass");
      renderNoteList();
    }));

    document.getElementById("isRest")?.addEventListener("change", (e) => {
      const pitchFields = document.getElementById("pitchFields");
      if(pitchFields) {
        pitchFields.style.opacity = (e.target as HTMLInputElement).checked ? "0.4" : "1";
        pitchFields.querySelectorAll("select").forEach(s => s.disabled = (e.target as HTMLInputElement).checked);
      }
    });

    document.getElementById("durationGrid")?.addEventListener("click", (e) => {
      const btn = (e.target as HTMLElement).closest(".dur-btn") as HTMLElement; if (!btn) return;
      state.editorState.duration = btn.dataset.dur || "q";
      document.getElementById("durationGrid")?.querySelectorAll(".dur-btn").forEach(b => b.classList.toggle("is-active", b === btn));
    });

    document.getElementById("btnAddNote")?.addEventListener("click", () => {
      if(!state.currentScore) return;
      const isEditing = state.editorState.editingNoteIdx !== null;
      const staffNotes = state.currentScore.measures[state.editorState.activeMeasure][state.editorState.activeStaff];
      const needed = measureNeededQuarters(state.currentScore.timeSig);
      const isDotted = (document.getElementById("isDotted") as HTMLInputElement).checked;
      const durQ = (DUR_Q[state.editorState.duration] || 0) * (isDotted ? 1.5 : 1);

      let currentUsed = quartersUsed(staffNotes);
      if (isEditing && state.editorState.editingNoteIdx !== null) currentUsed -= (DUR_Q[staffNotes[state.editorState.editingNoteIdx].duration] || 0) * (staffNotes[state.editorState.editingNoteIdx].dotted ? 1.5 : 1);

      if (currentUsed + durQ > needed) {
        const desk = document.getElementById("engraveDesk");
        if(desk) {
          desk.style.transform = "translateX(10px)";
          setTimeout(() => desk.style.transform = "translateX(-10px)", 50);
          setTimeout(() => desk.style.transform = "translateX(0)", 100);
        }
        return;
      }

      clearRedoStack();
      if (isEditing) { saveCurrentNote(); state.editorState.editingNoteIdx = null; }
      else { staffNotes.push(getFormNote()); }

      ["dynamicSelect", "fingeringSelect", "lyricInput"].forEach(id => { const el = document.getElementById(id) as HTMLInputElement; if(el) el.value = ""; });
      syncMeasureControls(); renderScore();
    });

    document.getElementById("btnAddChordNote")?.addEventListener("click", () => {
      if(!state.currentScore) return;
      const { activeMeasure, activeStaff, editingNoteIdx } = state.editorState;
      const notes = state.currentScore.measures[activeMeasure]?.[activeStaff];
      if (!notes || !notes.length) return showToast("Añade una nota base primero", "error");

      const target = editingNoteIdx !== null ? notes[editingNoteIdx] : notes[notes.length - 1];
      if (target.rest) return showToast("No puedes hacer acordes con silencios", "error");

      const k = { letter: (document.getElementById("pitchLetter") as HTMLInputElement).value, accidental: (document.getElementById("pitchAccidental") as HTMLInputElement).value, octave: parseInt((document.getElementById("pitchOctave") as HTMLInputElement).value, 10) };
      if (!target.keys) target.keys = [];
      if (target.keys.some(x => x.letter === k.letter && x.octave === k.octave && x.accidental === k.accidental)) return showToast("Esa tecla ya está en el acorde", "error");

      clearRedoStack();
      target.keys.push(k);
      target.keys.sort((a, b) => (a.octave * 10 + ({ 'c': 0, 'd': 1, 'e': 2, 'f': 3, 'g': 4, 'a': 5, 'b': 6 } as Record<string,number>)[a.letter.toLowerCase()]) - (b.octave * 10 + ({ 'c': 0, 'd': 1, 'e': 2, 'f': 3, 'g': 4, 'a': 5, 'b': 6 } as Record<string,number>)[b.letter.toLowerCase()]));

      syncMeasureControls(); renderScore();
    });

    document.addEventListener("keydown", (e) => {
      const viewEditor = document.getElementById("viewEditor");
      if ((viewEditor && viewEditor.hidden) || ['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
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
    document.getElementById("plBtnRewind")?.addEventListener("click", stopPlayback);
    document.querySelectorAll(".pl-speed-btn").forEach((b) => b.addEventListener("click", () => {
      const factor = parseFloat((b as HTMLElement).dataset.speed || "1"); setSpeedFactor(factor);
      document.querySelectorAll(".pl-speed-btn").forEach(btn => btn.classList.toggle("is-active", parseFloat((btn as HTMLElement).dataset.speed || "1") === factor));
    }));
    document.getElementById("plBpm")?.addEventListener("change", (e) => {
      const newBpm = Math.max(20, Math.min(300, parseInt((e.target as HTMLInputElement).value, 10) || 100));
      (e.target as HTMLInputElement).value = String(newBpm);
      if (state.currentScore) { state.currentScore.bpm = newBpm; }
      refreshAudioBPM();
    });
    document.addEventListener("click", (e) => { if (isAudioPlaying() && ((e.target as HTMLElement).closest("#engraveDesk") || (e.target as HTMLElement).closest(".measure-hit"))) pauseAudio(); });
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  await checkMaintenanceStatus();
  const themeBtn = document.getElementById('themeToggleBtn');
  const isDark = (localStorage.getItem('theme') || 'light') === 'dark';
  if (isDark) { document.body.classList.add('dark-theme'); if (themeBtn) themeBtn.textContent = '☀️'; }
  if (themeBtn) themeBtn.onclick = () => {
    const active = document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', active ? 'dark' : 'light');
    themeBtn.textContent = active ? '☀️' : '🌙';
  };

  initFirebase(); setupAuthUI(); setupProfileUI(); initShortcuts(); initDragAndDrop(); setupEventListeners();
  initPWA();

  const paperWrap = document.getElementById('paperWrap');
  if (paperWrap) {
    let zoom = 1;
    paperWrap.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) { e.preventDefault(); zoom = Math.max(0.5, Math.min(zoom + (e.deltaY < 0 ? 0.1 : -0.1), 2)); paperWrap.style.setProperty('--zoom-level', String(zoom)); }
    }, { passive: false });
  }

  const wrapSpawn = document.getElementById("floatingNotes");
  if (wrapSpawn && wrapSpawn.childElementCount === 0) {
    const glyphs = ["♪", "♫", "♩", "𝄞"];
    for (let i = 0; i < 12; i++) {
      const s = document.createElement("span"); s.className = "note-anim"; s.textContent = glyphs[i % 4];
      Object.assign(s.style, { left: `${Math.random() * 100}%`, animationDuration: `${14 + Math.random() * 12}s`, animationDelay: `-${Math.random() * 20}s`, fontSize: `${24 + Math.random() * 30}px` });
      wrapSpawn.appendChild(s);
    }
  }

  const header = document.getElementById("mainHeader");
  if (header && typeof ResizeObserver !== "undefined") new ResizeObserver(syncEditorStickyOffset).observe(header);
  window.addEventListener("resize", syncEditorStickyOffset);

  on("langchange", () => { renderCustomSelects(); if (!document.getElementById("viewLibrary")?.hidden) renderLibrary(); if (!document.getElementById("viewCodex")?.hidden) fetchAndRenderCodex(); if (!document.getElementById("viewEditor")?.hidden) renderScore(); updateViewerButtonText(); });
  on("scoreschanged", () => { if (!document.getElementById("viewLibrary")?.hidden) renderLibrary(); });
  on("measureselected", syncMeasureControls);

  setLang((navigator.language || (navigator as any).userLanguage || "en").toLowerCase().startsWith("es") ? "es" : "en");
  window.addEventListener("hashchange", handleNavigation);
  if (!window.location.hash || window.location.hash === "#") window.location.hash = "#inicio"; else handleNavigation();
});

window.addEventListener("error", (event) => {
  console.error("Critical Client Exception intercepted:", event.error);
  if (typeof showToast === "function") showToast("An unexpected error occurred in the interface.", "error");
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Critical Async Promise Rejection intercepted:", event.reason);
  if (typeof showToast === "function") showToast("Synchronization error or async process interrupted.", "error");
});
