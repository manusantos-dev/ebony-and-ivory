/* =========================================================================
   EBONY & IVORY — player.js
   Reproductor de piano: lee currentScore (vía window.EI) y lo reproduce
   con Tone.js. No modifica el modelo de datos ni el motor de grabado.
   ========================================================================= */
(function () {
  "use strict";

  function whenReady(fn) {
    if (window.EI) fn(); else window.addEventListener('ei:ready', fn, { once: true });
  }

  whenReady(init);

  function init() {
    const EI = window.EI;
    const DUR_Q = EI.DURATION_QUARTERS;

    /* ----------------------------- DOM ----------------------------- */
    const bar = document.getElementById('playerBar');
    if (!bar) return; // el HTML del reproductor no está presente
    const btnRewind = document.getElementById('plBtnRewind');
    const btnPlay = document.getElementById('plBtnPlay');
    const btnStop = document.getElementById('plBtnStop');
    const progressWrap = document.getElementById('plProgressWrap');
    const progressFill = document.getElementById('plProgressFill');
    const timeLabel = document.getElementById('plTimeLabel');
    const bpmInput = document.getElementById('plBpm');
    const speedButtons = Array.from(document.querySelectorAll('.pl-speed-btn'));
    const statusLabel = document.getElementById('plStatus');

    let baseBpm = 100;
    let speedFactor = 1;
    let totalQuarters = 0;
    let part = null;
    let measurePart = null;
    let isPlaying = false;
    let rafId = null;
    let synthTreble = null, synthBass = null;
    let builtForScoreKey = null;

    /* ----------------------------- Helpers ----------------------------- */
    function quarterToBBS(q) {
      const bars = Math.floor(q / 4);
      const beatsFloat = q - bars * 4;
      const beat = Math.floor(beatsFloat);
      const sixteenths = (beatsFloat - beat) * 4;
      return bars + ':' + beat + ':' + sixteenths.toFixed(3);
    }

    function noteToToneName(n) {
      let acc = '';
      if (n.accidental === '#') acc = '#';
      else if (n.accidental === 'b') acc = 'b';
      return n.letter.toUpperCase() + acc + n.octave;
    }

    function guessBaseBpm(score) {
      if (score.tempoText) {
        const m = score.tempoText.match(/=\s*(\d+)/);
        if (m) return Math.max(20, Math.min(300, parseInt(m[1], 10)));
      }
      return 100;
    }

    function formatTime(sec) {
      if (!isFinite(sec) || sec < 0) sec = 0;
      const m = Math.floor(sec / 60); const s = Math.floor(sec % 60);
      return m + ':' + String(s).padStart(2, '0');
    }

    function ensureSynths() {
      if (synthTreble) return;
      const reverb = new Tone.Reverb({ decay: 1.4, wet: 0.18 }).toDestination();
      synthTreble = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.006, decay: 0.35, sustain: 0.05, release: 0.6 }
      }).connect(reverb);
      synthBass = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.006, decay: 0.4, sustain: 0.08, release: 0.7 }
      }).connect(reverb);
      synthTreble.volume.value = -4;
      synthBass.volume.value = -6;
    }

    /* ----------------------------- Construir línea de tiempo ----------------------------- */
    function buildTimeline() {
      const score = EI.getCurrentScore();
      if (!score) return false;

      ensureSynths();
      teardown();

      const events = [];        // notas a sonar
      const measureEvents = []; // cambios de compás activo (para resaltar)
      let pos = 0;

      score.measures.forEach((measure, idx) => {
        measureEvents.push({ time: quarterToBBS(pos), idx });
        ['treble', 'bass'].forEach((staffName) => {
          let cursor = pos;
          (measure[staffName] || []).forEach((n) => {
            const base = DUR_Q[n.duration] || 0;
            const durQ = base * (n.dotted ? 1.5 : 1);
            if (!n.rest && durQ > 0) {
              events.push({
                time: quarterToBBS(cursor),
                note: noteToToneName(n),
                durQ: durQ,
                staff: staffName
              });
            }
            cursor += durQ;
          });
        });
        pos += EI.measureNeededQuarters(score.timeSig);
      });

      totalQuarters = pos;
      baseBpm = guessBaseBpm(score);
      if (bpmInput) bpmInput.value = Math.round(baseBpm * speedFactor);
      Tone.Transport.bpm.value = baseBpm * speedFactor;

      part = new Tone.Part((time, ev) => {
        const synth = ev.staff === 'bass' ? synthBass : synthTreble;
        const secPerQ = 60 / Tone.Transport.bpm.value;
        synth.triggerAttackRelease(ev.note, Math.max(0.05, ev.durQ * secPerQ * 0.92), time);
      }, events).start(0);
      part.loop = false;

      measurePart = new Tone.Part((time, ev) => {
        Tone.Draw.schedule(() => highlightMeasure(ev.idx), time);
      }, measureEvents).start(0);
      measurePart.loop = false;

      Tone.Transport.scheduleOnce(() => {
        Tone.Draw.schedule(() => stopPlayback(true), Tone.now());
      }, quarterToBBS(totalQuarters));

      builtForScoreKey = score.id + ':' + score.measures.length + ':' + JSON.stringify(score.timeSig);
      return true;
    }

    function teardown() {
      if (part) { part.dispose(); part = null; }
      if (measurePart) { measurePart.dispose(); measurePart = null; }
    }

    function currentScoreKey() {
      const score = EI.getCurrentScore();
      if (!score) return null;
      return score.id + ':' + score.measures.length + ':' + JSON.stringify(score.timeSig);
    }

    /* ----------------------------- Resaltado ----------------------------- */
    let lastHighlighted = null;
    function highlightMeasure(idx) {
      if (lastHighlighted !== null) {
        const prevEls = document.querySelectorAll('[data-measure-idx="' + lastHighlighted + '"]');
        prevEls.forEach((el) => el.classList.remove('playing'));
      }
      const els = document.querySelectorAll('[data-measure-idx="' + idx + '"]');
      els.forEach((el) => el.classList.add('playing'));
      lastHighlighted = idx;
    }
    function clearHighlight() {
      if (lastHighlighted !== null) {
        document.querySelectorAll('[data-measure-idx="' + lastHighlighted + '"]').forEach((el) => el.classList.remove('playing'));
      }
      lastHighlighted = null;
    }

    /* ----------------------------- Transporte ----------------------------- */
    function updateButtons() {
      btnPlay.textContent = isPlaying ? '⏸' : '▶';
      btnPlay.setAttribute('aria-label', isPlaying ? 'Pausar' : 'Reproducir');
      bar.classList.toggle('is-playing', isPlaying);
    }

    function play() {
      const score = EI.getCurrentScore();
      if (!score) return;
      Tone.start().then(() => {
        if (currentScoreKey() !== builtForScoreKey) { if (!buildTimeline()) return; }
        Tone.Transport.start();
        isPlaying = true;
        updateButtons();
        tickProgress();
      }).catch(() => {
        if (statusLabel) statusLabel.textContent = 'No se pudo iniciar el audio.';
      });
    }

    function pause() {
      Tone.Transport.pause();
      isPlaying = false;
      updateButtons();
      cancelAnimationFrame(rafId);
    }

    function stopPlayback(reachedEnd) {
      Tone.Transport.stop(); // stop() en Tone.js también rebobina a 0
      isPlaying = false;
      updateButtons();
      cancelAnimationFrame(rafId);
      clearHighlight();
      updateProgressUI(0);
      if (reachedEnd && statusLabel) {
        statusLabel.textContent = '';
      }
    }

    function togglePlayPause() { isPlaying ? pause() : play(); }

    function seekToFraction(frac) {
      frac = Math.max(0, Math.min(1, frac));
      if (currentScoreKey() !== builtForScoreKey) { if (!buildTimeline()) return; }
      Tone.Transport.position = quarterToBBS(totalQuarters * frac);
      updateProgressUI(frac);
    }

    function tickProgress() {
      if (!isPlaying) return;
      const elapsedQ = Tone.Transport.seconds * (Tone.Transport.bpm.value / 60);
      const frac = totalQuarters > 0 ? Math.min(1, elapsedQ / totalQuarters) : 0;
      updateProgressUI(frac);
      rafId = requestAnimationFrame(tickProgress);
    }

    function updateProgressUI(frac) {
      if (progressFill) progressFill.style.width = (frac * 100).toFixed(2) + '%';
      const secPerQ = 60 / Tone.Transport.bpm.value;
      const elapsedSec = frac * totalQuarters * secPerQ;
      const totalSec = totalQuarters * secPerQ;
      if (timeLabel) timeLabel.textContent = formatTime(elapsedSec) + ' / ' + formatTime(totalSec);
    }

    function setSpeed(factor) {
      speedFactor = factor;
      Tone.Transport.bpm.value = baseBpm * speedFactor;
      if (bpmInput) bpmInput.value = Math.round(baseBpm * speedFactor);
      speedButtons.forEach((b) => b.classList.toggle('is-active', parseFloat(b.dataset.speed) === factor));
    }

    /* ----------------------------- Eventos UI ----------------------------- */
    btnPlay.addEventListener('click', togglePlayPause);
    btnRewind.addEventListener('click', () => stopPlayback(false));
    if (btnStop) btnStop.addEventListener('click', pause);

    speedButtons.forEach((b) => b.addEventListener('click', () => setSpeed(parseFloat(b.dataset.speed))));

    if (bpmInput) {
      bpmInput.addEventListener('change', () => {
        const val = Math.max(20, Math.min(300, parseInt(bpmInput.value, 10) || 100));
        baseBpm = val; speedFactor = 1;
        Tone.Transport.bpm.value = baseBpm;
        speedButtons.forEach((b) => b.classList.toggle('is-active', parseFloat(b.dataset.speed) === 1));
        bpmInput.value = val;
      });
    }

    if (progressWrap) {
      progressWrap.addEventListener('click', (e) => {
        const rect = progressWrap.getBoundingClientRect();
        seekToFraction((e.clientX - rect.left) / rect.width);
      });
    }

    // Si el usuario edita notas o cambia de compás mientras la partitura está
    // sonando, lo más seguro es detener la reproducción para evitar incoherencias.
    document.addEventListener('click', (e) => {
      if (isPlaying && (e.target.closest('#engraveDesk') || e.target.closest('.measure-hit'))) {
        pause();
      }
    });

    window.addEventListener('hashchange', () => { stopPlayback(false); builtForScoreKey = null; });
  }
})();
