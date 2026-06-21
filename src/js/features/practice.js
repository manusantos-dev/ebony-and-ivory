import { showToast } from "../ui/toast.js";
import { state } from "../core/state.js";
import { renderScore } from "./notation-renderer.js";
import { emit } from "../core/events.js";

let audioCtx = null;
let analyser = null;
let micStream = null;
let rafId = null;
let isPracticing = false;

let practiceSequence = [];
let practiceCursor = 0;
let matchFrames = 0;
const FRAMES_TO_MATCH = 5;

const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const getNoteFromFreq = (freq) => {
    const noteNum = 12 * (Math.log(freq / 440) / Math.log(2));
    const midi = Math.round(noteNum) + 69;
    const noteStr = noteStrings[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${noteStr}${octave}`;
};

const autoCorrelate = (buf, sampleRate) => {
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
        for (let i = 0; i < maxSamples; i++) {
            correlation += Math.abs((buf[i]) - (buf[i + offset]));
        }
        correlation = 1 - (correlation / maxSamples);
        correlations[offset] = correlation;
        if ((correlation > 0.9) && (correlation > lastCorrelation)) {
            foundGoodCorrelation = true;
            if (correlation > bestCorr) {
                bestCorr = correlation;
                bestOffset = offset;
            }
        } else if (foundGoodCorrelation) {
            let shift = (correlations[bestOffset + 1] - correlations[bestOffset - 1]) / correlations[bestOffset];
            return sampleRate / (bestOffset + (8 * shift));
        }
        lastCorrelation = correlation;
    }
    if (bestCorr > 0.01) return sampleRate / bestOffset;
    return -1;
};

const buildPracticeSequence = () => {
    practiceSequence = [];
    const measures = state.currentScore.measures;
    for (let m = 0; m < measures.length; m++) {
        const trebleNotes = measures[m].treble || [];
        for (let n = 0; n < trebleNotes.length; n++) {
            const note = trebleNotes[n];
            if (!note.rest) {
                let expectedStr = note.letter.toUpperCase();
                if (note.accidental === "b") {
                    const flatToSharp = { "D": "C#", "E": "D#", "G": "F#", "A": "G#", "B": "A#" };
                    expectedStr = flatToSharp[expectedStr] || expectedStr;
                } else if (note.accidental === "#") {
                    expectedStr += "#";
                }
                expectedStr += note.octave;

                practiceSequence.push({
                    measureIdx: m,
                    noteIdx: n,
                    noteStr: expectedStr,
                    displayStr: `${note.letter}${note.accidental || ""}${note.octave}`
                });
            }
        }
    }
};

const advanceSequence = () => {
    practiceCursor++;
    if (practiceCursor >= practiceSequence.length) {
        showToast("¡Enhorabuena! Has completado la partitura.", "success");
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

const tick = () => {
    if (!isPracticing || !analyser) return;
    
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
                if (matchFrames >= FRAMES_TO_MATCH) {
                    matchFrames = 0;
                    advanceSequence();
                }
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

export const startPracticeMode = async () => {
    if (!state.currentScore || state.currentScore.measures.length === 0) {
        showToast("No hay partitura para practicar.", "error");
        return;
    }

    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        audioCtx.createMediaStreamSource(micStream).connect(analyser);
        
        buildPracticeSequence();
        if (practiceSequence.length === 0) {
            showToast("No se encontraron notas en la Clave de Sol para practicar.", "error");
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

        document.getElementById("practiceFloatingOverlay").hidden = false;
        
        const uiExpected = document.getElementById("practiceExpectedNote");
        if (uiExpected) uiExpected.textContent = firstTarget.displayStr;
        
        tick();
        showToast("Modo práctica (DEMO) iniciado. ¡Toca la nota indicada!", "success");
    } catch (e) {
        showToast("Error de micrófono: Da permisos en el navegador.", "error");
        stopPracticeMode();
    }
};

export const stopPracticeMode = () => {
    isPracticing = false;
    cancelAnimationFrame(rafId);
    if (micStream) micStream.getTracks().forEach(t => t.stop());
    micStream = null;
    if (audioCtx) { audioCtx.close(); audioCtx = null; }
    
    const overlay = document.getElementById("practiceFloatingOverlay");
    if (overlay) overlay.hidden = true;
};