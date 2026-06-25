// INIT: Core Storage & Data Schema Module
import { STORAGE_KEY, DUR_Q } from "./config.js";
import { state } from "./state.js";

// UTILS: String and ID manipulation
export const uid = () => "s_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const plateLabel = (n) => `E&I ${String(n).padStart(3, "0")}`;
export const escapeHtml = (str) => { const d = document.createElement("div"); d.textContent = str; return d.innerHTML; };
export const trim = (n) => Number.isInteger(n) ? n : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
export const slugify = (str) => (str || "score").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "score";
export const formatDate = (ts) => new Date(ts).toLocaleDateString(state.lang === "es" ? "es-ES" : "en-US", { day: "2-digit", month: "short", year: "numeric" });

// MIGRATION: Backward-compatible schema validation and polyphony upgrade
const migratePolyphony = (score) => {
  if (!score || typeof score !== "object") return score;

  // FIX: Auto-repair corrupted or missing measures array
  if (!Array.isArray(score.measures) || score.measures.length === 0) {
    score.measures = [newMeasure()];
    return score;
  }

  score.measures.forEach(m => {
    if (!m || typeof m !== "object") return;
    ["treble", "bass"].forEach(clef => {
      if (!m[clef] || !Array.isArray(m[clef])) return;
      m[clef] = m[clef].map(n => {
        if (n && n.letter && !n.keys) {
          n.keys = [{ letter: n.letter, accidental: n.accidental || "", octave: n.octave || 4 }];
          delete n.letter; delete n.accidental; delete n.octave;
        }
        return n;
      });
    });
  });
  return score;
};

// PERSISTENCE: LocalStorage CRUD operations
export const loadAll = () => {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) return {};
    const data = JSON.parse(rawData);
    Object.values(data).forEach(migratePolyphony);
    return data;
  } catch (err) {
    // FIX: Graceful degradation on corrupted local data
    console.error("Storage Decode Error:", err);
    return {};
  }
};

export const saveAll = (map) => localStorage.setItem(STORAGE_KEY, JSON.stringify(map));

export const nextPlateNumber = () => {
  const scores = Object.values(loadAll());
  return scores.length === 0 ? 1 : Math.max(...scores.map(s => s.plate || 0)) + 1;
};

// LOGIC: Musical duration calculations
export const measureNeededQuarters = (timeSig) => {
  const [num, den] = (timeSig || "4/4").split("/").map(Number);
  return num * (4 / (den || 4));
};

export const quartersUsed = (notes) => {
  if (!Array.isArray(notes)) return 0;
  return notes.reduce((sum, n) => sum + (DUR_Q[n?.duration] || 0) * (n?.dotted ? 1.5 : 1), 0);
};

// FACTORIES: Default entity generators
export const newMeasure = () => ({ treble: [], bass: [], repeatStart: false, repeatEnd: false, directive: "" });

export const newScore = () => ({
  id: uid(), plate: nextPlateNumber(), title: "", composer: "", timeSig: "4/4", keySig: "C", bpm: 100,
  measures: [newMeasure()], createdAt: Date.now(), updatedAt: Date.now()
});

// ACTIONS: Store manipulations
export const persistScore = (score) => {
  if (!score || score.isExample) return;

  score.title = escapeHtml(score.title?.substring(0, 100));
  score.composer = escapeHtml(score.composer?.substring(0, 100));
  score.updatedAt = Date.now();

  const all = loadAll();
  all[score.id] = migratePolyphony(score);
  saveAll(all);
};

export const deleteScoreById = (id) => {
  const all = loadAll();
  if (!all[id]) return;
  delete all[id];

  const scores = Object.values(all).sort((a, b) => a.plate - b.plate);
  const newAll = {};
  scores.forEach((s, index) => { s.plate = index + 1; newAll[s.id] = s; });
  saveAll(newAll);
};

export const downloadBlob = (filename, text, type = "application/json") => {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};
