// INIT: Core Storage & Type-Safe CRUD Operations
import { STORAGE_KEY, DUR_Q } from "./config";
import { state } from "./state";
import { Score, Measure } from "./types";

// UTILS: String and ID manipulation
export const uid = (): string => "s_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const plateLabel = (n: number): string => `E&I ${String(n).padStart(3, "0")}`;
export const escapeHtml = (str: string): string => { const d = document.createElement("div"); d.textContent = str; return d.innerHTML; };
export const trim = (n: number): string | number => Number.isInteger(n) ? n : Number(n.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""));
export const slugify = (str: string): string => (str || "score").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "score";
export const formatDate = (ts: number): string => new Date(ts).toLocaleDateString(state.lang === "es" ? "es-ES" : "en-US", { day: "2-digit", month: "short", year: "numeric" });

// MIGRATION: Schema validation & auto-repair
const migratePolyphony = (score: any): Score => {
  if (!score || typeof score !== "object") return score as Score;
  if (!Array.isArray(score.measures) || score.measures.length === 0) { score.measures = [newMeasure()]; return score as Score; }

  score.measures.forEach((m: any) => {
    if (!m || typeof m !== "object") return;
    ["treble", "bass"].forEach(clef => {
      if (!m[clef] || !Array.isArray(m[clef])) return;
      m[clef] = m[clef].map((n: any) => {
        if (n && n.letter && !n.keys) {
          n.keys = [{ letter: n.letter, accidental: n.accidental || "", octave: n.octave || 4 }];
          delete n.letter; delete n.accidental; delete n.octave;
        }
        return n;
      });
    });
  });
  return score as Score;
};

// PERSISTENCE: LocalStorage I/O
export const loadAll = (): Record<string, Score> => {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) return {};
    const data = JSON.parse(rawData);
    Object.values(data).forEach(migratePolyphony);
    return data;
  } catch (err) {
    console.error("Storage Decode Error:", err);
    return {};
  }
};

export const saveAll = (map: Record<string, Score>): void => localStorage.setItem(STORAGE_KEY, JSON.stringify(map));

export const nextPlateNumber = (): number => {
  const scores = Object.values(loadAll());
  return scores.length === 0 ? 1 : Math.max(...scores.map(s => s.plate || 0)) + 1;
};

// LOGIC: Music Theory Math
export const measureNeededQuarters = (timeSig: string): number => {
  const [num, den] = (timeSig || "4/4").split("/").map(Number);
  return num * (4 / (den || 4));
};

export const quartersUsed = (notes: any[]): number => {
  if (!Array.isArray(notes)) return 0;
  return notes.reduce((sum, n) => sum + (DUR_Q[n?.duration] || 0) * (n?.dotted ? 1.5 : 1), 0);
};

// FACTORIES: Entity Generation
export const newMeasure = (): Measure => ({ treble: [], bass: [], repeatStart: false, repeatEnd: false, directive: "" });

export const newScore = (): Score => ({
  id: uid(), plate: nextPlateNumber(), title: "", composer: "", timeSig: "4/4", keySig: "C", bpm: 100,
  measures: [newMeasure()], createdAt: Date.now(), updatedAt: Date.now()
});

// ACTIONS: Store manipulations
export const persistScore = (score: Score): void => {
  if (!score) return;
  score.title = escapeHtml(score.title?.substring(0, 100));
  score.composer = escapeHtml(score.composer?.substring(0, 100));
  score.updatedAt = Date.now();

  const all = loadAll();
  all[score.id] = migratePolyphony(score);
  saveAll(all);
};

export const deleteScoreById = (id: string): void => {
  const all = loadAll();
  if (!all[id]) return;
  delete all[id];

  const scores = Object.values(all).sort((a, b) => a.plate - b.plate);
  const newAll: Record<string, Score> = {};
  scores.forEach((s, index) => { s.plate = index + 1; newAll[s.id] = s; });
  saveAll(newAll);
};

export const downloadBlob = (filename: string, text: string, type: string = "application/json"): void => {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};
