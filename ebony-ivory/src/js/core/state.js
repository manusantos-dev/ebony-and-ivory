const initialState = {
  lang: "en",
  currentScore: null,
  currentUser: null,
  editorState: { 
    activeMeasure: 0, 
    activeStaff: "treble", 
    duration: "q", 
    dotted: false 
  },
  libraryState: { 
    query: "", 
    sortBy: "numAsc", 
    filterTime: "all", 
    filterKey: "all", 
    filterHands: "all" 
  }
};

export const state = new Proxy(initialState, {
  set(target, property, value) {
    target[property] = value;
    return true;
  }
});

export function resetEditorState() {
  state.editorState = { 
    activeMeasure: 0, 
    activeStaff: "treble", 
    duration: "q", 
    dotted: false 
  };
}