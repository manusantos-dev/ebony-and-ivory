/* =========================================================================
   EBONY & IVORY — example-score.js
   Partitura de ejemplo: "Oda a la Alegría" (tema de la Novena Sinfonía
   de Beethoven). Los datos replican exactamente la transcripción de
   referencia (verificada nota a nota), para que sirva como ejemplo fiable
   de lo que el editor es capaz de representar.
   ========================================================================= */

function n(letter, octave, duration, dotted, accidental) {
  return { rest: false, letter, accidental: accidental || "", octave, duration, dotted: !!dotted, dynamic: "" };
}
function rest(duration) {
  return { rest: true, letter: "G", accidental: "", octave: 4, duration, dotted: false, dynamic: "" };
}
function measure(treble, bass, extra) {
  return Object.assign({ treble, bass, repeatStart: false, repeatEnd: false, directive: "" }, extra || {});
}

export function getExampleScore(lang) {
  const isEs = lang === "es";

  const measures = [
    // 1
    measure(
      [n("E", 4, "q"), n("E", 4, "q"), n("F", 4, "q"), n("G", 4, "q")],
      [n("C", 4, "w")]
    ),
    // 2
    measure(
      [n("G", 4, "q"), n("F", 4, "q"), n("E", 4, "q"), n("D", 4, "q")],
      [n("B", 3, "w")]
    ),
    // 3
    measure(
      [n("C", 4, "q"), n("C", 4, "q"), n("D", 4, "q"), n("E", 4, "q")],
      [n("A", 3, "w")]
    ),
    // 4
    measure(
      [n("E", 4, "q", true), n("D", 4, "8"), n("D", 4, "h")],
      [n("G", 3, "w")]
    ),
    // 5
    measure(
      [n("E", 4, "q"), n("E", 4, "q"), n("F", 4, "q"), n("G", 4, "q")],
      [n("C", 4, "w")]
    ),
    // 6
    measure(
      [n("G", 4, "q"), n("F", 4, "q"), n("E", 4, "q"), n("D", 4, "q")],
      [n("B", 3, "w")]
    ),
    // 7
    measure(
      [n("C", 4, "q"), n("C", 4, "q"), n("D", 4, "q"), n("E", 4, "q")],
      [n("A", 3, "w")]
    ),
    // 8 — Fine
    measure(
      [n("D", 4, "q", true), n("C", 4, "8"), n("C", 4, "h")],
      [n("G", 3, "h"), n("C", 3, "h")],
      { directive: "Fine" }
    ),
    // 9
    measure(
      [n("D", 4, "q"), n("D", 4, "q"), n("E", 4, "q"), n("C", 4, "q")],
      [n("G", 3, "w")]
    ),
    // 10
    measure(
      [n("D", 4, "q"), n("E", 4, "8"), n("F", 4, "8"), n("E", 4, "q"), n("C", 4, "q")],
      [n("G", 3, "w")]
    ),
    // 11
    measure(
      [n("D", 4, "q"), n("E", 4, "8"), n("F", 4, "8"), n("E", 4, "q"), n("D", 4, "q")],
      [n("G", 3, "h"), n("G", 3, "h", false, "#")]
    ),
    // 12 — D.C. al Fine
    measure(
      [n("C", 4, "q"), n("D", 4, "q"), rest("h")],
      [n("A", 3, "h"), n("G", 3, "h")],
      { directive: "D.C. al Fine" }
    )
  ];

  return {
    id: "example-ode-to-joy", isExample: true, plate: 0,
    title: isEs ? "Oda a la Alegría" : "Ode to Joy",
    composer: "Ludwig van Beethoven", timeSig: "4/4", keySig: "C", bpm: 100,
    measures,
    createdAt: 0, updatedAt: 0
  };
}
