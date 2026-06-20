import { STORAGE_KEY, DUR_Q } from "./config.js";
import { state } from "./state.js";

let saveTimeout = null;

export function uid() {
  return "s_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch (e) {
    return {};
  }
}

export function saveAll(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function nextPlateNumber() {
  const scores = Object.values(loadAll());
  if (scores.length === 0) return 1;
  return Math.max(...scores.map((s) => s.plate || 0)) + 1;
}

export function plateLabel(n) {
  return "E&I " + String(n).padStart(3, "0");
}

export function slugify(str) {
  return (str || "score")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "score";
}

export function formatDate(ts) {
  try {
    return new Date(ts).toLocaleDateString(state.lang === "es" ? "es-ES" : "en-US", { day: "2-digit", month: "short", year: "numeric" });
  } catch (e) {
    return "";
  }
}

export function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

export function measureNeededQuarters(timeSig) {
  const [num, den] = timeSig.split("/").map(Number);
  return num * (4 / den);
}

export function quartersUsed(staffNotes) {
  return staffNotes.reduce((sum, n) => sum + (DUR_Q[n.duration] || 0) * (n.dotted ? 1.5 : 1), 0);
}

export function newMeasure() {
  return { treble: [], bass: [], repeatStart: false, repeatEnd: false, directive: "" };
}

export function newScore() {
  return {
    id: uid(), plate: nextPlateNumber(), title: "", composer: "", timeSig: "4/4", keySig: "C", bpm: 100,
    measures: [newMeasure()], createdAt: Date.now(), updatedAt: Date.now()
  };
}

export function downloadBlob(filename, text, type) {
  const blob = new Blob([text], { type: type || "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function persistScore(score) {
  if (score.isExample) return;
  score.updatedAt = Date.now();
  const all = loadAll();
  all[score.id] = score;
  saveAll(all);

  const indicator = document.getElementById("saveIndicator");
  if (indicator) {
    indicator.hidden = false;
    indicator.classList.add("show");
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => indicator.classList.remove("show"), 1500);
  }
}

export function deleteScoreById(id) {
  const all = loadAll();
  delete all[id];
  const scores = Object.values(all).sort((a, b) => a.plate - b.plate);
  const newAll = {};
  scores.forEach((s, index) => { s.plate = index + 1; newAll[s.id] = s; });
  saveAll(newAll);
}

export function trim(n) {
  return Number.isInteger(n) ? n : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}
