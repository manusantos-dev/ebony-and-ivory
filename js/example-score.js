function note(letter, octave, duration, dotted) {
  return { rest: false, letter, accidental: "", octave, duration, dotted: !!dotted, dynamic: "" };
}

function measure(treble, bass, extra) {
  return Object.assign({ treble, bass, repeatStart: false, repeatEnd: false, directive: "" }, extra || {});
}

export function getExampleScore(lang) {
  const isEs = lang === "es";

  // Mano Derecha (Treble)
  const m1T = () => [note("E", 4, "q"), note("E", 4, "q"), note("F", 4, "q"), note("G", 4, "q")];
  const m2T = () => [note("G", 4, "q"), note("F", 4, "q"), note("E", 4, "q"), note("D", 4, "q")];
  const m3T = () => [note("C", 4, "q"), note("C", 4, "q"), note("D", 4, "q"), note("E", 4, "q")];
  const m4T = () => [note("E", 4, "q", true), note("D", 4, "8"), note("D", 4, "h")];
  const m8T = () => [note("D", 4, "q", true), note("C", 4, "8"), note("C", 4, "h")];
  const m9T = () => [note("D", 4, "q"), note("D", 4, "q"), note("E", 4, "q"), note("C", 4, "q")];
  const m10T = () => [note("D", 4, "q"), note("E", 4, "8"), note("F", 4, "8"), note("E", 4, "q"), note("C", 4, "q")];
  const m11T = () => [note("D", 4, "q"), note("E", 4, "8"), note("F", 4, "8"), note("E", 4, "q"), note("D", 4, "q")];
  const m12T = () => [note("C", 4, "q"), note("D", 4, "q"), note("C", 4, "h")];

  // Ayudante para crear redondas en la mano izquierda
  const bassN = (l, o, acc) => { 
    const n = note(l, o, "w"); 
    if (acc) n.accidental = acc; 
    return [n]; 
  };

  return {
    id: "example-ode-to-joy", isExample: true, plate: 0,
    title: isEs ? "Oda a la Alegría" : "Ode to Joy",
    composer: "Ludwig van Beethoven", timeSig: "4/4", keySig: "C", bpm: 100,
    measures: [
      measure(m1T(), bassN("C", 3)),
      measure(m2T(), bassN("B", 2)),
      measure(m3T(), bassN("A", 2)),
      measure(m4T(), bassN("G", 2)),
      measure(m1T(), bassN("C", 3)),
      measure(m2T(), bassN("B", 2)),
      measure(m3T(), bassN("A", 2)),
      measure(m8T(), [note("G", 3, "h"), note("C", 3, "h")], { directive: "Fine" }),
      measure(m9T(), bassN("G", 2)),
      measure(m10T(), bassN("G", 2)),
      measure(m11T(), [note("G", 3, "h"), (() => { const n = note("G", 3, "h"); n.accidental = "#"; return n; })()]),
      measure(m12T(), [note("A", 3, "h"), note("G", 3, "h")], { directive: "D.C. al Fine" })
    ],
    createdAt: 0, updatedAt: 0
  };
}
