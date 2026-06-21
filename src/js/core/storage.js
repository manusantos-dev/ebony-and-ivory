import { STORAGE_KEY, DUR_Q } from "./config.js";
import { state } from "./state.js";

export const uid = () => "s_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const loadAll = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
};

export const saveAll = (map) => localStorage.setItem(STORAGE_KEY, JSON.stringify(map));

export const nextPlateNumber = () => {
  const scores = Object.values(loadAll());
  return scores.length === 0 ? 1 : Math.max(...scores.map(s => s.plate || 0)) + 1;
};

export const plateLabel = (n) => `E&I ${String(n).padStart(3, "0")}`;

export const slugify = (str) => (str || "score")
  .toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "") || "score";

export const formatDate = (ts) => new Date(ts).toLocaleDateString(state.lang === "es" ? "es-ES" : "en-US", { day: "2-digit", month: "short", year: "numeric" });

export const escapeHtml = (str) => {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
};

export const measureNeededQuarters = (timeSig) => {
  const [num, den] = timeSig.split("/").map(Number);
  return num * (4 / den);
};

export const quartersUsed = (notes) => notes.reduce((sum, n) => sum + (DUR_Q[n.duration] || 0) * (n.dotted ? 1.5 : 1), 0);

export const newMeasure = () => ({ treble: [], bass: [], repeatStart: false, repeatEnd: false, directive: "" });

export const newScore = () => ({
  id: uid(), plate: nextPlateNumber(), title: "", composer: "", timeSig: "4/4", keySig: "C", bpm: 100,
  measures: [newMeasure()], createdAt: Date.now(), updatedAt: Date.now()
});

export const downloadBlob = (filename, text, type = "application/json") => {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

export const persistScore = (score) => {
  if (score.isExample) return;
  score.updatedAt = Date.now();
  const all = loadAll();
  all[score.id] = score;
  saveAll(all);
};

export const deleteScoreById = (id) => {
  const all = loadAll();
  delete all[id];
  const scores = Object.values(all).sort((a, b) => a.plate - b.plate);
  const newAll = {};
  scores.forEach((s, index) => { s.plate = index + 1; newAll[s.id] = s; });
  saveAll(newAll);
};