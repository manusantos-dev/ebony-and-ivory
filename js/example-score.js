function note(letter, octave, duration, dotted, accidental) {
  return { rest: false, letter, accidental: accidental || "", octave, duration, dotted: !!dotted, dynamic: "" };
}

function measure(treble, bass, extra) {
  return Object.assign({ treble, bass, repeatStart: false, repeatEnd: false, directive: "" }, extra || {});
}

function gSharp3(dur) {
  return { rest: false, letter: "G", accidental: "#", octave: 3, duration: dur, dotted: false, dynamic: "" };
}

export function getExampleScore(lang) {
  const isEs = lang === "es";

  return {
    id: "example-ode-to-joy", isExample: true, plate: 0,
    title: isEs ? "Oda a la Alegría" : "Ode to Joy",
    composer: "Ludwig van Beethoven", timeSig: "4/4", keySig: "C", bpm: 100,
    measures: [
      // M1
      measure(
        [note("E",4,"q"), note("E",4,"q"), note("F",4,"q"), note("G",4,"q")],
        [note("C",4,"w")]
      ),
      // M2
      measure(
        [note("G",4,"q"), note("F",4,"q"), note("E",4,"q"), note("D",4,"q")],
        [note("B",3,"w")]
      ),
      // M3
      measure(
        [note("C",4,"q"), note("C",4,"q"), note("D",4,"q"), note("E",4,"q")],
        [note("A",3,"w")]
      ),
      // M4
      measure(
        [note("E",4,"q",true), note("D",4,"8"), note("D",4,"h")],
        [note("G",3,"w")]
      ),
      // M5
      measure(
        [note("E",4,"q"), note("E",4,"q"), note("F",4,"q"), note("G",4,"q")],
        [note("C",4,"w")]
      ),
      // M6
      measure(
        [note("G",4,"q"), note("F",4,"q"), note("E",4,"q"), note("D",4,"q")],
        [note("B",3,"w")]
      ),
      // M7
      measure(
        [note("C",4,"q"), note("C",4,"q"), note("D",4,"q"), note("E",4,"q")],
        [note("A",3,"w")]
      ),
      // M8 - Fine
      measure(
        [note("D",4,"q",true), note("C",4,"8"), note("C",4,"h")],
        [note("G",3,"h"), note("C",3,"h")],
        { directive: "Fine" }
      ),
      // M9
      measure(
        [note("D",4,"q"), note("D",4,"q"), note("E",4,"q"), note("C",4,"q")],
        [note("G",3,"w")]
      ),
      // M10
      measure(
        [note("D",4,"q"), note("E",4,"8"), note("F",4,"8"), note("E",4,"q"), note("C",4,"q")],
        [note("G",3,"w")]
      ),
      // M11
      measure(
        [note("D",4,"q"), note("E",4,"8"), note("F",4,"8"), note("E",4,"q"), note("D",4,"q")],
        [note("G",3,"h"), gSharp3("h")]
      ),
      // M12 - D.C. al Fine
      measure(
        [note("C",4,"q"), note("D",4,"q"), { rest: true, letter: "G", accidental: "", octave: 4, duration: "h", dotted: false, dynamic: "" }],
        [note("A",3,"h"), note("G",3,"h")],
        { directive: "D.C. al Fine" }
      ),
    ],
    createdAt: 0, updatedAt: 0
  };
}
