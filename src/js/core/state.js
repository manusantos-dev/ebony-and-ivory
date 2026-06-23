/**
 * @file state.js
 * @description Global Application State
 * Implements a reactive Proxy with automated Pub/Sub event distribution.
 */

import { emit } from './events.js';

const initialState = {
  lang: "en",
  currentScore: null,
  currentUser: null,
  editorState: { 
    activeMeasure: 0, 
    activeStaff: "treble", 
    duration: "q", 
    dotted: false,
    editingNoteIdx: null,
    layoutMode: "continuous",
    bookSpread: 0
  },
  libraryState: { 
    query: "", 
    sortBy: "dateDesc", 
    filterTime: "all", 
    filterKey: "all", 
    filterHands: "all" 
  }
};

export const state = new Proxy(initialState, {
  set(target, property, value, receiver) {
    const oldValue = target[property];
    const success = Reflect.set(target, property, value, receiver);
    
    if (success && oldValue !== value) {
      emit(`state:${property}`, { value, oldValue });
    }
    return success;
  }
});

export function resetEditorState() {
  state.editorState = { 
    activeMeasure: 0, 
    activeStaff: "treble", 
    duration: "q", 
    dotted: false,
    editingNoteIdx: null,
    layoutMode: "continuous",
    bookSpread: 0
  };
}