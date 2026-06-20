import { state } from "./state.js";
import { DUR_Q } from "./config.js";
import { measureNeededQuarters } from "./storage.js";

let acousticPiano = null;
let isPlaying = false;
let rafId = null;
let part = null;
let measurePart = null;
let builtForScoreKey = null;
let totalQuarters = 0;
let speedFactor = 1;
const noteTimeouts = new Map();

function ensureAcousticPiano() {
  if (acousticPiano) return;
  acousticPiano = new Tone.Sampler({
    urls: { A0: "A0.mp3", C2: "C2.mp3", C4: "C4.mp3", C6: "C6.mp3" },
    release: 1.2,
    baseUrl: "https://tonejs.github.io/audio/salamander/"
  }).toDestination();
  acousticPiano.volume.value = -2;
}

function quarterToBBS(q) {
  const bars = Math.floor(q / 4);
  const beatsFloat = q - bars * 4;
  const beat = Math.floor(beatsFloat);
  return bars + ":" + beat + ":" + ((beatsFloat - beat) * 4).toFixed(3);
}

function scoreKeyOf(score) {
  const sig = score.measures.map((m) =>
    (m.treble ? m.treble.length : 0) + "," + (m.bass ? m.bass.length : 0) + "," +
    (m.repeatStart ? 1 : 0) + (m.repeatEnd ? 1 : 0) + ":" + (m.directive || "")
  ).join("|");
  return score.id + ":" + score.timeSig + ":" + score.bpm + ":" + sig;
}

// Construye el ORDEN DE REPRODUCCIÓN real (una lista de índices de compás,
// posiblemente repetidos) a partir de las repeticiones simples (‖: :‖) y
// las indicaciones de Fine / D.C. / D.S. (con o sin "al Fine"/"al Coda").
// Limitaciones asumidas, dada la sencillez del editor (un único símbolo de
// Coda/Segno por partitura, sin secciones de coda separadas):
//  - Las repeticiones simples ‖: :‖ se tocan exactamente dos veces.
//  - "D.C." vuelve al compás 1; "D.S." vuelve al compás marcado con Segno
//    (o al compás 1 si no hay ninguno marcado).
//  - "Fine" sólo detiene la reproducción si aparece DESPUÉS de un D.C./D.S.
//    (su uso normal); en una primera pasada se ignora.
//  - "al Coda" se trata, por simplicidad, igual que el salto sin Coda (las
//    partituras de este editor sólo admiten un compás de Coda, no dos
//    secciones independientes que saltar entre sí).
//  - Un guardia (maxIterations) evita bucles infinitos ante datos atípicos.
function buildPlayOrder(measures) {
  const order = [];
  const n = measures.length;
  if (n === 0) return order;

  const repeatedEnds = new Set();
  let jumped = false;
  let lastRepeatStart = 0;
  const segnoIdx = measures.findIndex((m) => /segno/i.test(m.directive || ""));

  let i = 0;
  let guard = 0;
  const maxIterations = n * 4 + 20;

  while (i < n && guard < maxIterations) {
    guard++;
    order.push(i);
    const m = measures[i];
    if (m.repeatStart) lastRepeatStart = i;

    if (m.repeatEnd && !repeatedEnds.has(i) && !jumped) {
      repeatedEnds.add(i);
      i = lastRepeatStart;
      continue;
    }

    const dir = m.directive || "";
    const isFine = /fine/i.test(dir) && !/D\.C\.|D\.S\./i.test(dir);
    const isDC = /^D\.C\./i.test(dir);
    const isDS = /^D\.S\./i.test(dir);

    if (jumped && isFine) break;

    if (!jumped && (isDC || isDS)) {
      jumped = true;
      i = isDS && segnoIdx >= 0 ? segnoIdx : 0;
      continue;
    }

    i++;
  }
  return order;
}

function updateAudioBPM() {
  const inputBpm = document.getElementById("plBpm");
  const activeBpm = inputBpm ? parseInt(inputBpm.value, 10) : (state.currentScore.bpm || 100);
  Tone.Transport.bpm.value = activeBpm * speedFactor;
}

function teardownAudio() {
  if (part) { part.dispose(); part = null; }
  if (measurePart) { measurePart.dispose(); measurePart = null; }
}

function buildTimeline() {
  const score = state.currentScore;
  if (!score) return false;
  ensureAcousticPiano();
  teardownAudio();

  const events = [];
  const measureEvents = [];
  let pos = 0;

  const playOrder = buildPlayOrder(score.measures);

  playOrder.forEach((idx) => {
    const measure = score.measures[idx];
    measureEvents.push({ time: quarterToBBS(pos), idx });
    ["treble", "bass"].forEach((staffName) => {
      let cursor = pos;
      (measure[staffName] || []).forEach((n, nIdx) => {
        const durQ = (DUR_Q[n.duration] || 0) * (n.dotted ? 1.5 : 1);
        if (!n.rest && durQ > 0) {
          events.push({
            time: quarterToBBS(cursor),
            note: n.letter.toUpperCase() + (n.accidental || "") + n.octave,
            durQ,
            id: `vf-note-${idx}-${staffName}-${nIdx}`
          });
        }
        cursor += durQ;
      });
    });
    pos += measureNeededQuarters(score.timeSig);
  });

  totalQuarters = pos;
  updateAudioBPM();

  part = new Tone.Part((time, ev) => {
    acousticPiano.triggerAttackRelease(ev.note, Math.max(0.05, ev.durQ * (60 / Tone.Transport.bpm.value) * 0.92), time);
    Tone.Draw.schedule(() => highlightNote(ev), time);
  }, events).start(0);

  measurePart = new Tone.Part((time, ev) => {
    const durationSec = measureNeededQuarters(score.timeSig) * (60 / Tone.Transport.bpm.value);
    Tone.Draw.schedule(() => highlightMeasureSweep(ev.idx, durationSec), time);
  }, measureEvents).start(0);

  Tone.Transport.scheduleOnce(() => {
    Tone.Draw.schedule(() => stopPlayback(true), Tone.now());
  }, quarterToBBS(totalQuarters));

  builtForScoreKey = scoreKeyOf(score);
  return true;
}

function highlightNote(ev) {
  const el = document.getElementById(ev.id);
  if (!el) return;
  if (noteTimeouts.has(ev.id)) clearTimeout(noteTimeouts.get(ev.id));
  el.classList.add("note-playing");
  const durationMs = Math.max(160, ev.durQ * (60 / Tone.Transport.bpm.value) * 1000);
  const timeoutId = setTimeout(() => { el.classList.remove("note-playing"); noteTimeouts.delete(ev.id); }, durationMs);
  noteTimeouts.set(ev.id, timeoutId);
}

function highlightMeasureSweep(idx, durationSec) {
  const g = document.querySelector(`.measure-hit[data-measure-idx="${idx}"]`);
  if (!g) return;

  const startX = parseFloat(g.getAttribute("data-start-x"));
  const endX = parseFloat(g.getAttribute("data-end-x"));
  const y = parseFloat(g.getAttribute("data-y"));
  const h = parseFloat(g.getAttribute("data-h"));

  const svg = g.closest("svg");
  let line = svg.querySelector(".playback-line-svg");
  if (!line) {
    line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("class", "playback-line-svg");
    line.setAttribute("stroke", "#B38E50");
    line.setAttribute("stroke-width", "2");
    svg.appendChild(line);
  }
  document.querySelectorAll(".playback-line-svg").forEach((l) => { if (l !== line) l.style.display = "none"; });
  line.style.display = "block";

  line.setAttribute("x1", startX); line.setAttribute("y1", y);
  line.setAttribute("x2", startX); line.setAttribute("y2", y + h);
  line.style.transition = "none";
  line.style.transform = "translateX(0px)";
  line.getBoundingClientRect();
  line.style.transition = `transform ${durationSec}s linear`;
  line.style.transform = `translateX(${endX - startX}px)`;
}

function clearHighlight() {
  document.querySelectorAll(".playback-line-svg").forEach((l) => { l.style.display = "none"; });
  document.querySelectorAll(".note-playing").forEach((n) => n.classList.remove("note-playing"));
  noteTimeouts.forEach((id) => clearTimeout(id));
  noteTimeouts.clear();
}

export function playAudio() {
  if (!state.currentScore) return;
  Tone.start().then(() => {
    if (scoreKeyOf(state.currentScore) !== builtForScoreKey) {
      if (!buildTimeline()) return;
    }
    Tone.Transport.start("+0.12");
    isPlaying = true;
    updatePlayerUI();
    tickProgress();
  });
}

export function pauseAudio() {
  Tone.Transport.pause();
  isPlaying = false;
  updatePlayerUI();
  cancelAnimationFrame(rafId);
}

export function stopPlayback() {
  Tone.Transport.stop();
  isPlaying = false;
  updatePlayerUI();
  cancelAnimationFrame(rafId);
  clearHighlight();
  const prog = document.getElementById("plProgressFill");
  if (prog) prog.style.width = "0%";
}

export function isAudioPlaying() {
  return isPlaying;
}

export function setSpeedFactor(factor) {
  speedFactor = factor;
  updateAudioBPM();
}

export function refreshAudioBPM() {
  if (state.currentScore) updateAudioBPM();
}

function updatePlayerUI() {
  const btn = document.getElementById("plBtnPlay");
  if (!btn) return;
  btn.innerHTML = isPlaying
    ? '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
    : '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  const bar = document.getElementById("playerBar");
  if (bar) bar.classList.toggle("is-playing", isPlaying);
}

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  return Math.floor(sec / 60) + ":" + String(Math.floor(sec % 60)).padStart(2, "0");
}

function tickProgress() {
  if (!isPlaying) return;
  const elapsedQ = Tone.Transport.seconds * (Tone.Transport.bpm.value / 60);
  const frac = totalQuarters > 0 ? Math.min(1, elapsedQ / totalQuarters) : 0;
  const prog = document.getElementById("plProgressFill");
  if (prog) prog.style.width = (frac * 100).toFixed(2) + "%";
  const secPerQ = 60 / Tone.Transport.bpm.value;
  const lbl = document.getElementById("plTimeLabel");
  if (lbl) lbl.textContent = formatTime(frac * totalQuarters * secPerQ) + " / " + formatTime(totalQuarters * secPerQ);
  rafId = requestAnimationFrame(tickProgress);
}
