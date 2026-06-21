import { showToast } from "../ui/toast.js";

let audioCtx = null;
let analyser = null;
let micStream = null;
let rafId = null;
let isPracticing = false;

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

const tick = () => {
    if (!isPracticing || !analyser) return;
    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);
    const pitch = autoCorrelate(buffer, audioCtx.sampleRate);
    
    const uiEl = document.getElementById("practiceDetectedNote");
    if (pitch !== -1 && uiEl) {
        const detected = getNoteFromFreq(pitch);
        uiEl.textContent = detected;
        
        // Futuro: Aquí se compararía 'detected' con la nota actual de la partitura
        // para avanzar automáticamente el compás y disparar renderScore().
    } else if (uiEl) {
        uiEl.textContent = "--";
    }
    
    rafId = requestAnimationFrame(tick);
};

export const startPracticeMode = async () => {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        audioCtx.createMediaStreamSource(micStream).connect(analyser);
        
        isPracticing = true;
        const statusEl = document.getElementById("practiceMicStatus");
        if (statusEl) {
            statusEl.textContent = "¡Micrófono activo! Toca algo...";
            statusEl.style.background = "var(--color-success)";
            statusEl.style.color = "#fff";
        }
        
        tick();
        showToast("Modo práctica iniciado", "success");
    } catch (e) {
        showToast("Error de micrófono: " + e.message, "error");
        stopPracticeMode();
    }
};

export const stopPracticeMode = () => {
    isPracticing = false;
    cancelAnimationFrame(rafId);
    if (micStream) micStream.getTracks().forEach(t => t.stop());
    micStream = null;
    if (audioCtx) { audioCtx.close(); audioCtx = null; }
    
    const statusEl = document.getElementById("practiceMicStatus");
    if (statusEl) {
        statusEl.textContent = "Esperando micrófono...";
        statusEl.style.background = "var(--color-paper-edge)";
        statusEl.style.color = "var(--color-ink)";
    }
};