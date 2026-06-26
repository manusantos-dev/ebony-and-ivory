// INIT: Global Application State with Type-Safe Proxy
import { emit } from './events';
import { AppState, EditorState } from './types.js';

const initialEditorState: EditorState = {
  activeMeasure: 0,
  activeStaff: "treble",
  duration: "q",
  editingNoteIdx: null,
  layoutMode: "continuous",
  bookSpread: 0
};

const initialState: AppState = {
  lang: "en",
  currentScore: null,
  currentUser: null,
  publicScores: [],
  isViewingPublic: false,
  editorState: { ...initialEditorState },
  libraryState: { query: "", sortBy: "dateDesc", filterTime: "all", filterKey: "all", filterHands: "all" },
  codexState: { query: "", sortBy: "likesDesc", filterTime: "all", filterKey: "all", filterHands: "all" }
};

export const state = new Proxy<AppState>(initialState, {
  set(target, property: keyof AppState, value, receiver) {
    const oldValue = target[property];
    const success = Reflect.set(target, property, value, receiver);

    if (success && oldValue !== value) {
      emit(`state:${String(property)}`, { value, oldValue });
    }
    return success;
  }
});

export function resetEditorState(): void {
  state.editorState = { ...initialEditorState };
}
