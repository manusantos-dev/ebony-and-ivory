// INIT: Polyphonic Audio Engine
import * as Tone from 'tone';
import { state } from '../core/state';
import { measureNeededQuarters, quartersUsed } from '../core/storage';
import { Score, Measure, Note } from '../core/types';

// TYPE: Audio Engine Internal State
interface AudioEngineState {
  piano: Tone.Sampler | null;
  isPlaying: boolean;
  rafId: number;
  part: Tone.Part | null;
  measurePart: Tone.Part | null;
  lastKey: string | null;
  quarters: number;
  speed: number;
  progress: number;
}

const AUDIO_CFG = { pianoUrl: "https://tonejs.github.io/audio/salamander/", baseVol: -2 };
const engine: AudioEngineState = { piano: null, isPlaying: false, rafId: 0, part: null, measurePart: null, lastKey: null, quarters: 0, speed: 1, progress: 0 };
const activeTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// -- Core Audio --
const initPiano = (): void => {
  if (engine.piano) return;
  engine.piano = new Tone.Sampler({
    urls: { A0: "A0.mp3", C2: "C2.mp3", C4: "C4.mp3", C6: "C6.mp3" },
    release: 1.2,
    baseUrl: AUDIO_CFG.pianoUrl
  }).toDestination();
  engine.piano.volume.value = AUDIO_CFG.baseVol;
};

// -- Time & Layout Utils --
const formatBBS = (q: number): string => {
  const bars = Math.floor(q / 4), beatFloat = q - bars * 4, beat = Math.floor(beatFloat);
  return `${bars}:${beat}:${((beatFloat - beat) * 4).toFixed(3)}`;
};

const formatTime = (sec: number): string => isFinite(sec) && sec >= 0 ? `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}` : "0:00";
const getBaseDuration = (durStr: string): number => ({"w": 4, "h": 2, "q": 1, "8": 0.5, "16": 0.25, "32": 0.125}[durStr] || 1);
const getScoreSignature = (s: Score): string => `${s.id}:${s.timeSig}:${s.bpm}:` + s.measures.map(m => `${m.treble?.length||0},${m.bass?.length||0},${m.repeatStart?1:0}${m.repeatEnd?1:0}:${m.directive||""}`).join("|");

// -- Timeline Compiler --
const buildPlayOrder = (measures: Measure[]): number[] => {
  const order: number[] = [], repeatedEnds = new Set<number>();
  let jumped = false, lastRepeatStart = 0;
  const segnoIdx = measures.findIndex(m => /segno/i.test(m.directive || ""));

  for (let i = 0, guard = 0; i < measures.length && guard < measures.length * 5; guard++) {
    order.push(i);
    const m = measures[i];
    if (m.repeatStart) lastRepeatStart = i;
    if (m.repeatEnd && !repeatedEnds.has(i) && !jumped) { repeatedEnds.add(i); i = lastRepeatStart; continue; }

    const dir = m.directive || "";
    if (jumped && /fine/i.test(dir) && !/D\.C\.|D\.S\./i.test(dir)) break;
    if (!jumped && (/^D\.C\./i.test(dir) || /^D\.S\./i.test(dir))) { jumped = true; i = /^D\.S\./i.test(dir) && segnoIdx >= 0 ? segnoIdx : 0; continue; }
    i++;
  }
  return order;
};

const buildTimeline = (): boolean => {
  const score = state.currentScore;
  if (!score) return false;

  initPiano();
  if (engine.part) { engine.part.dispose(); engine.part = null; }
  if (engine.measurePart) { engine.measurePart.dispose(); engine.measurePart = null; }

  const events: { time: string, notes: string[], durQ: number, id: string }[] = [];
  const measureEvents: { time: string, idx: number }[] = [];
  let pos = 0;

  buildPlayOrder(score.measures).forEach((idx) => {
    measureEvents.push({ time: formatBBS(pos), idx });
    const measure = score.measures[idx];

    (["treble", "bass"] as const).forEach(staff => {
      let cursor = pos;
      (measure[staff] || []).forEach((n: Note, nIdx: number) => {
        const durQ = getBaseDuration(n.duration) * (n.dotted ? 1.5 : 1);
        if (!n.rest && durQ > 0 && n.keys && n.keys.length > 0) {
          events.push({
            time: formatBBS(cursor),
            notes: n.keys.map(k => `${k.letter.toUpperCase()}${k.accidental || ""}${k.octave}`),
            durQ,
            id: `vf-note-${idx}-${staff}-${nIdx}`
          });
        }
        cursor += durQ;
      });
    });

    const needed = measureNeededQuarters(score.timeSig);
    const maxUsed = Math.max(quartersUsed(measure.treble), quartersUsed(measure.bass));
    pos += (maxUsed > 0 && maxUsed < needed) ? maxUsed : needed;
  });

  engine.quarters = pos;
  Tone.Transport.bpm.value = (parseFloat((document.getElementById("plBpm") as HTMLInputElement)?.value) || score.bpm || 100) * engine.speed;

  engine.part = new Tone.Part((time, ev) => {
    if (engine.piano) engine.piano.triggerAttackRelease(ev.notes, Math.max(0.05, ev.durQ * (60 / Tone.Transport.bpm.value) * 0.92), time);
    Tone.Draw.schedule(() => highlightNote(ev), time);
  }, events).start(0);

  engine.measurePart = new Tone.Part((time, ev) => {
    const sec = measureNeededQuarters(score.timeSig) * (60 / Tone.Transport.bpm.value);
    Tone.Draw.schedule(() => highlightSweep(ev.idx, sec), time);
  }, measureEvents).start(0);

  Tone.Transport.scheduleOnce(() => Tone.Draw.schedule(stopPlayback, Tone.now()), formatBBS(engine.quarters));
  engine.lastKey = getScoreSignature(score);
  return true;
};

// -- UI Synchronization --
const highlightNote = (ev: { id: string, durQ: number }): void => {
  const el = document.getElementById(ev.id);
  if (!el) return;
  if (activeTimeouts.has(ev.id)) clearTimeout(activeTimeouts.get(ev.id)!);
  el.classList.add("note-playing");
  activeTimeouts.set(ev.id, setTimeout(() => {
    el.classList.remove("note-playing");
    activeTimeouts.delete(ev.id);
  }, Math.max(160, ev.durQ * (60 / Tone.Transport.bpm.value) * 1000)));
};

const highlightSweep = (idx: number, sec: number): void => {
  const g = document.querySelector(`.measure-hit[data-measure-idx="${idx}"]`) as SVGElement;
  if (!g) return;
  const svg = g.closest("svg");
  if (!svg) return;

  let line = svg.querySelector(".playback-line-svg") as SVGLineElement;
  if (!line) {
    line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("class", "playback-line-svg");
    line.setAttribute("stroke", "var(--color-brass)");
    line.setAttribute("stroke-width", "2");
    svg.appendChild(line);
  }
  document.querySelectorAll(".playback-line-svg").forEach(l => (l as SVGElement).style.display = l === line ? "block" : "none");

  const startX = parseFloat(g.getAttribute("data-start-x") || "0"), endX = parseFloat(g.getAttribute("data-end-x") || "0");
  const y = parseFloat(g.getAttribute("data-y") || "0"), h = parseFloat(g.getAttribute("data-h") || "0");

  line.style.transition = "none";
  line.style.transform = `translateX(0px)`;
  line.setAttribute("x1", startX.toString()); line.setAttribute("y1", (y - 10).toString());
  line.setAttribute("x2", startX.toString()); line.setAttribute("y2", (y + h + 10).toString());
  line.getBoundingClientRect();
  line.style.transition = `transform ${sec}s linear`;
  line.style.transform = `translateX(${endX - startX}px)`;
};

const updateUI = (): void => {
  const btn = document.getElementById("plBtnPlay");
  if (btn) btn.innerHTML = engine.isPlaying ? '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  document.getElementById("playerBar")?.classList.toggle("is-playing", engine.isPlaying);
};

const tick = (): void => {
  if (!engine.isPlaying) return;
  const bpm = Tone.Transport.bpm.value;
  const frac = engine.quarters > 0 ? Math.min(1, Math.max(0, (Tone.Transport.seconds * (bpm / 60)) / engine.quarters)) : 0;

  const prog = document.getElementById("plProgressFill");
  if (prog && frac >= engine.progress) { prog.style.width = `${(frac * 100).toFixed(2)}%`; engine.progress = frac; }

  const lbl = document.getElementById("plTimeLabel");
  if (lbl) lbl.textContent = `${formatTime(frac * engine.quarters * (60 / bpm))} / ${formatTime(engine.quarters * (60 / bpm))}`;

  engine.rafId = requestAnimationFrame(tick);
};

// -- API --
export const playAudio = async (): Promise<void> => {
  if (!state.currentScore) return;
  await Tone.start();
  if (getScoreSignature(state.currentScore) !== engine.lastKey && !buildTimeline()) return;

  Tone.Transport.stop();
  engine.progress = 0;
  Tone.Transport.start("+0.1");
  engine.isPlaying = true;
  updateUI();
  cancelAnimationFrame(engine.rafId);
  tick();
};

export const pauseAudio = (): void => { Tone.Transport.pause(); engine.isPlaying = false; updateUI(); cancelAnimationFrame(engine.rafId); };

export const stopPlayback = (): void => {
  Tone.Transport.stop();
  engine.isPlaying = false;
  engine.progress = 0;
  updateUI();
  cancelAnimationFrame(engine.rafId);

  document.querySelectorAll(".playback-line-svg").forEach(l => (l as HTMLElement).style.display = "none");
  document.querySelectorAll(".note-playing").forEach(n => n.classList.remove("note-playing"));
  activeTimeouts.forEach(clearTimeout);
  activeTimeouts.clear();
  const prog = document.getElementById("plProgressFill");
  if (prog) prog.style.width = "0%";
};

export const isAudioPlaying = (): boolean => engine.isPlaying;
export const setSpeedFactor = (f: number): void => { engine.speed = f; if (state.currentScore) Tone.Transport.bpm.value = (state.currentScore.bpm||100) * engine.speed; };
export const refreshAudioBPM = (): void => { if (state.currentScore) Tone.Transport.bpm.value = (parseFloat((document.getElementById("plBpm") as HTMLInputElement)?.value) || state.currentScore.bpm || 100) * engine.speed; };
