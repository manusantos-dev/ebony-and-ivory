export const state = {
  lang: "en",
  currentScore: null,
  currentUser: null,
  editorState: { activeMeasure: 0, activeStaff: "treble", duration: "q", dotted: false },
  libraryState: { query: "", sortBy: "numAsc", filterTime: "all", filterKey: "all", filterHands: "all" }
};

export function resetEditorState() {
  state.editorState = { activeMeasure: 0, activeStaff: "treble", duration: "q", dotted: false };
}
