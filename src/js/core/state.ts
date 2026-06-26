// INIT: Deep Reactive Immutable State Vault (Vue/MobX Pattern)
import { emit } from './events';
import { AppState, EditorState, Score } from './types';

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

// UTILS: Deep Proxy Factory for nested reactivity tracking
const createDeepProxy = <T extends object>(target: T, path: string = "state"): T => {
  return new Proxy(target, {
    get(obj, prop) {
      const value = Reflect.get(obj, prop);
      // Recursively wrap nested objects to track deep mutations
      if (value !== null && typeof value === 'object' && !(value instanceof Date) && !(value instanceof Array)) {
        return createDeepProxy(value, `${path}:${String(prop)}`);
      }
      return value;
    },
    set(obj, prop, value, receiver) {
      const oldValue = Reflect.get(obj, prop);
      if (oldValue === value) return true; // Prevent unnecessary renders

      const success = Reflect.set(obj, prop, value, receiver);
      if (success) {
        // Emit high-precision granular events (e.g., "state:editorState:activeMeasure")
        emit(`${path}:${String(prop)}`, { value, oldValue });
        // Maintain backward compatibility for top-level listeners
        if (path === "state") emit(`state:${String(prop)}`, { value, oldValue });
      }
      return success;
    }
  });
};

export const state = createDeepProxy<AppState>(initialState);

export function resetEditorState(): void {
  state.editorState = { ...initialEditorState };
}
