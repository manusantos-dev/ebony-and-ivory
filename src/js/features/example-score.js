const n = (letter, octave, duration, dotted = false, accidental = "") => ({ rest: false, letter, accidental, octave, duration, dotted, dynamic: "" });
const rest = (duration) => ({ rest: true, letter: "G", accidental: "", octave: 4, duration, dotted: false, dynamic: "" });
const measure = (treble, bass, extra = {}) => ({ treble, bass, repeatStart: false, repeatEnd: false, directive: "", ...extra });

export const getExampleScore = (lang) => ({
  id: "example-ode-to-joy",
  isExample: true,
  plate: 0,
  title: lang === "es" ? "Oda a la Alegría" : "Ode to Joy",
  composer: "Ludwig van Beethoven",
  timeSig: "4/4",
  keySig: "C",
  bpm: 100,
  createdAt: 0,
  updatedAt: 0,
  measures: [
    measure([n("E", 4, "q"), n("E", 4, "q"), n("F", 4, "q"), n("G", 4, "q")], [n("C", 4, "w")]),
    measure([n("G", 4, "q"), n("F", 4, "q"), n("E", 4, "q"), n("D", 4, "q")], [n("B", 3, "w")]),
    measure([n("C", 4, "q"), n("C", 4, "q"), n("D", 4, "q"), n("E", 4, "q")], [n("A", 3, "w")]),
    measure([n("E", 4, "q", true), n("D", 4, "8"), n("D", 4, "h")], [n("G", 3, "w")]),
    measure([n("E", 4, "q"), n("E", 4, "q"), n("F", 4, "q"), n("G", 4, "q")], [n("C", 4, "w")]),
    measure([n("G", 4, "q"), n("F", 4, "q"), n("E", 4, "q"), n("D", 4, "q")], [n("B", 3, "w")]),
    measure([n("C", 4, "q"), n("C", 4, "q"), n("D", 4, "q"), n("E", 4, "q")], [n("A", 3, "w")]),
    measure([n("D", 4, "q", true), n("C", 4, "8"), n("C", 4, "h")], [n("G", 3, "h"), n("C", 3, "h")], { directive: "Fine" }),
    measure([n("D", 4, "q"), n("D", 4, "q"), n("E", 4, "q"), n("C", 4, "q")], [n("G", 3, "w")]),
    measure([n("D", 4, "q"), n("E", 4, "8"), n("F", 4, "8"), n("E", 4, "q"), n("C", 4, "q")], [n("G", 3, "w")]),
    measure([n("D", 4, "q"), n("E", 4, "8"), n("F", 4, "8"), n("E", 4, "q"), n("D", 4, "q")], [n("G", 3, "h"), n("G", 3, "h", false, "#")]),
    measure([n("C", 4, "q"), n("D", 4, "q"), rest("h")], [n("A", 3, "h"), n("G", 3, "h")], { directive: "D.C. al Fine" })
  ]
});