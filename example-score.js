/* =========================================================================
   EBONY & IVORY — example-score.js
   Partitura de ejemplo embebida (Oda a la Alegría / Ode to Joy, Beethoven,
   1824 — dominio público). Se usa para enseñar el potencial de la app sin
   necesidad de que el usuario haya creado nada todavía.
   ========================================================================= */
(function () {
  "use strict";

  function whenReady(fn) {
    if (window.EI) fn(); else window.addEventListener('ei:ready', fn, { once: true });
  }

  function note(letter, octave, duration, dotted) {
    return { rest: false, letter: letter, accidental: '', octave: octave, duration: duration, dotted: !!dotted, dynamic: '' };
  }
  function measure(trebleNotes, bassNotes, extra) {
    return Object.assign({ treble: trebleNotes, bass: bassNotes, repeatStart: false, repeatEnd: false, directive: '' }, extra || {});
  }

  function buildExampleScore(lang) {
    const isEs = lang === 'es';
    // Melodía clásica de método de piano para principiantes, en Do Mayor.
    const m1 = () => [note('E', 4, 'q'), note('E', 4, 'q'), note('F', 4, 'q'), note('G', 4, 'q')];
    const m2 = () => [note('G', 4, 'q'), note('F', 4, 'q'), note('E', 4, 'q'), note('D', 4, 'q')];
    const m3 = () => [note('C', 4, 'q'), note('C', 4, 'q'), note('D', 4, 'q'), note('E', 4, 'q')];
    const m4 = () => [note('E', 4, 'q', true), note('D', 4, '8'), note('D', 4, 'h')];
    const m8 = () => [note('D', 4, 'q', true), note('C', 4, '8'), note('C', 4, 'h')];
    const bassRoot = (letter) => [note(letter, 3, 'w')];

    const measures = [
      measure(m1(), bassRoot('C'), { repeatStart: true }),
      measure(m2(), bassRoot('G')),
      measure(m3(), bassRoot('C')),
      measure(m4(), bassRoot('G')),
      measure(m1(), bassRoot('C')),
      measure(m2(), bassRoot('G')),
      measure(m3(), bassRoot('C')),
      measure(m8(), bassRoot('G'), { repeatEnd: true, directive: 'Fine' }),
    ];

    return {
      id: 'example-ode-to-joy',
      isExample: true,
      plate: 0,
      title: isEs ? 'Himno a la Alegría (Oda a la Alegría)' : 'Ode to Joy',
      composer: 'Ludwig van Beethoven',
      timeSig: '4/4',
      keySig: 'C',
      tempoText: 'Allegro ♩ = 120',
      measures: measures,
      createdAt: 0,
      updatedAt: 0,
    };
  }

  function showExampleScore() {
    const EI = window.EI;
    const score = buildExampleScore(EI.getLang());
    EI.showEditorUI(score, true); // true = modo visor (sin panel de edición)
    const toggleBtn = document.getElementById('btnToggleViewer');
    if (toggleBtn) toggleBtn.hidden = true; // la partitura de ejemplo no se puede editar
    document.body.classList.add('is-example-score');
  }

  function handleHash() {
    if (window.location.hash === '#ejemplo' || window.location.hash === '#example') {
      showExampleScore();
    } else {
      const toggleBtn = document.getElementById('btnToggleViewer');
      if (toggleBtn) toggleBtn.hidden = false;
      document.body.classList.remove('is-example-score');
    }
  }

  whenReady(function () {
    window.EI.showExampleScore = showExampleScore;
    window.addEventListener('hashchange', handleHash);
    handleHash(); // por si la página se cargó directamente en #ejemplo

    // Botón de la home: "Ver partitura de ejemplo"
    document.querySelectorAll('[data-go-example]').forEach((btn) => {
      btn.addEventListener('click', () => { window.location.hash = '#ejemplo'; });
    });
  });
})();
