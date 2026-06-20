function note(letter, octave, duration, dotted) {
  return { rest: false, letter, accidental: "", octave, duration, dotted: !!dotted, dynamic: "" };
}

function measure(treble, bass, extra) {
  return Object.assign({ treble, bass, repeatStart: false, repeatEnd: false, directive: "" }, extra || {});
}

export function getExampleScore(lang) {
  const isEs = lang === "es";
  const bassNote = (l, o, d) => [note(l, o, d || "w")]; // Por defecto usa redondas

  const m1 = () => [note("E", 4, "q"), note("E", 4, "q"), note("F", 4, "q"), note("G", 4, "q")];
  const m2 = () => [note("G", 4, "q"), note("F", 4, "q"), note("E", 4, "q"), note("D", 4, "q")];
  const m3 = () => [note("C", 4, "q"), note("C", 4, "q"), note("D", 4, "q"), note("E", 4, "q")];
  const m4 = () => [note("E", 4, "q", true), note("D", 4, "8"), note("D", 4, "h")];
  const m8 = () => [note("D", 4, "q", true), note("C", 4, "8"), note("C", 4, "h")];
  const m9 = () => [note("D", 4, "q"), note("D", 4, "q"), note("E", 4, "q"), note("C", 4, "q")];
  const m10 = () => [note("D", 4, "q"), note("E", 4, "8"), note("F", 4, "8"), note("E", 4, "q"), note("C", 4, "q")];
  const m11 = () => [note("D", 4, "q"), note("E", 4, "8"), note("F", 4, "8"), note("E", 4, "q"), note("D", 4, "q")];
  const m12 = () => [note("C", 4, "q"), note("D", 4, "q"), note("C", 4, "h")];

  return {
    id: "example-ode-to-joy", isExample: true, plate: 0,
    title: isEs ? "Oda a la Alegría" : "Ode to Joy",
    composer: "Ludwig van Beethoven", timeSig: "4/4", keySig: "C", bpm: 100,
    measures: [
      measure(m1(), bassNote("C", 3)),
      measure(m2(), bassNote("G", 2)),
      measure(m3(), bassNote("C", 3)),
      measure(m4(), bassNote("G", 2)),
      
      measure(m1(), bassNote("C", 3)),
      measure(m2(), bassNote("G", 2)),
      measure(m3(), bassNote("C", 3)),
      measure(m8(), bassNote("C", 3), { directive: "Fine" }),
      
      measure(m9(), bassNote("G", 2)),
      measure(m10(), bassNote("C", 3)),
      measure(m11(), bassNote("G", 2)),
      measure(m12(), bassNote("C", 3), { directive: "D.C. al Fine" })
    ],
    createdAt: 0, updatedAt: 0
  };
}
