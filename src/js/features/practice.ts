// INIT: Acoustic Practice Mode (Pitch Detection via Mic)
import { showToast } from "../ui/toast";
import { state } from "../core/state";
import { renderScore } from "./notation-renderer";
import { emit } from "../core/events";
import { t } from "../ui/i18n";
import { Note } from "../core/types";

let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let micStream: MediaStream | null = null;
let rafId: number = 0;
let isPracticing = false;

interface PracticeTarget { measureIdx: number; noteIdx: number; noteStr: string; displayStr: string; }
let practiceSequence: PracticeTarget[] = [];
let practiceCursor = 0;
let matchFrames = 0;
const FRAMES_TO_MATCH = 5;

const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const getNoteFromFreq = (freq: number): string => {
  const noteNum = 12 * (Math.log(freq / 440) / Math.log(2));
  const midi = Math.round(noteNum) + 69;
  const noteStr = noteStrings[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${noteStr}${octave}`;
};

const autoCorrelate = (buf: Float32Array, sampleRate: number): number => {
  let SIZE = buf.length;
  let maxSamples = Math.floor(SIZE / 2);
  let bestOffset = -1;
  let bestCorr = 0;
  let rms = 0;
  let foundGoodCorrelation = false;
  let correlations = new Array(maxSamples);

  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  let lastCorrelation = 1;
  for (let offset = 0; offset < maxSamples; offset++) {
    let correlation = 0;
    for (let i = 0; i < maxSamples; i++) correlation += Math.abs((buf[i]) - (buf[i + offset]));
    correlation = 1 - (correlation / maxSamples);
    correlations[offset] = correlation;
    if ((correlation > 0.9) && (correlation > lastCorrelation)) {
      foundGoodCorrelation = true;
      if (correlation > bestCorr) { bestCorr = correlation; bestOffset = offset; }
    } else if (foundGoodCorrelation) {
      let shift = (correlations[bestOffset + 1] - correlations[bestOffset - 1]) / correlations[bestOffset];
      return sampleRate / (bestOffset + (8 * shift));
    }
    lastCorrelation = correlation;
  }
  if (bestCorr > 0.01) return sampleRate / bestOffset;
  return -1;
};

const buildPracticeSequence = (): void => {
  practiceSequence = [];
  if (!state.currentScore) return;

  const measures = state.currentScore.measures;
  for (let m = 0; m < measures.length; m++) {
    const trebleNotes = measures[m].treble || [];
    for (let n = 0; n < trebleNotes.length; n++) {
      const note = trebleNotes[n] as Note;
      if (!note.rest && note.keys && note.keys.length > 0) {
        // Simple extraction based on the first key of the chord for acoustic practice
        const key = note.keys[0];
        let expectedStr = key.letter.toUpperCase();
        if (key.accidental === "b") {
          const flatToSharp: Record<string, string> = { "D": "C#", "E": "D#", "G": "F#", "A": "G#", "B": "A#" };
          expectedStr = flatToSharp[expectedStr] || expectedStr;
        } else if (key.accidental === "#") {
          expectedStr += "#";
        }
        expectedStr += key.octave;

        practiceSequence.push({
          measureIdx: m, noteIdx: n, noteStr: expectedStr,
          displayStr: `${key.letter}${key.accidental || ""}${key.octave}`
        });
      }
    }
  }
};

const advanceSequence = (): void => {
  practiceCursor++;
  if (practiceCursor >= practiceSequence.length) {
    showToast(t("practiceWin"), "success");
    stopPracticeMode();
    return;
  }

  const nextTarget = practiceSequence[practiceCursor];
  const uiExpected = document.getElementById("practiceExpectedNote");
  if (uiExpected) uiExpected.textContent = nextTarget.displayStr;

  if (state.editorState.activeMeasure !== nextTarget.measureIdx) {
    state.editorState.activeMeasure = nextTarget.measureIdx;
    emit("measureselected", nextTarget.measureIdx);
    renderScore();
  }
};

const tick = (): void => {
  if (!isPracticing || !analyser || !audioCtx) return;

  const buffer = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(buffer);
  const pitch = autoCorrelate(buffer, audioCtx.sampleRate);

  const uiDetected = document.getElementById("practiceDetectedNote");

  if (pitch !== -1 && uiDetected) {
    const detectedStr = getNoteFromFreq(pitch);
    uiDetected.textContent = detectedStr;

    if (practiceCursor < practiceSequence.length) {
      const target = practiceSequence[practiceCursor];
      if (detectedStr === target.noteStr) {
        matchFrames++;
        if (matchFrames >= FRAMES_TO_MATCH) { matchFrames = 0; advanceSequence(); }
      } else {
        matchFrames = 0;
      }
    }
  } else if (uiDetected) {
    uiDetected.textContent = "--";
    matchFrames = 0;
  }

  rafId = requestAnimationFrame(tick);
};

export const startPracticeMode = async (): Promise<void> => {
  if (!state.currentScore || state.currentScore.measures.length === 0) {
    showToast(t("practiceErr"), "error");
    return;
  }

  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    audioCtx.createMediaStreamSource(micStream).connect(analyser);

    buildPracticeSequence();
    if (practiceSequence.length === 0) {
      showToast(t("practiceErr"), "error");
      stopPracticeMode();
      return;
    }

    isPracticing = true;
    practiceCursor = 0;
    matchFrames = 0;

    const firstTarget = practiceSequence[0];
    state.editorState.activeMeasure = firstTarget.measureIdx;
    emit("measureselected", firstTarget.measureIdx);
    renderScore();

    const overlay = document.getElementById("practiceFloatingOverlay");
    if (overlay) overlay.hidden = false;

    const uiExpected = document.getElementById("practiceExpectedNote");
    if (uiExpected) uiExpected.textContent = firstTarget.displayStr;

    tick();
    showToast(t("practiceDemo"), "success");
  } catch (e) {
    showToast(t("practiceMicErr"), "error");
    stopPracticeMode();
  }
};

export const stopPracticeMode = (): void => {
  isPracticing = false;
  cancelAnimationFrame(rafId);
  if (micStream) micStream.getTracks().forEach(t => t.stop());
  micStream = null;
  if (audioCtx) { audioCtx.close(); audioCtx = null; }

  const overlay = document.getElementById("practiceFloatingOverlay");
  if (overlay) overlay.hidden = true;
};
