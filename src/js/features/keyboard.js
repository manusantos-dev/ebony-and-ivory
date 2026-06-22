/**
 * Global Keyboard Shortcuts & History Module
 * Manages editor history stack (Undo/Redo) and transport keybindings.
 */

import { state } from '../core/state.js';
import { isAudioPlaying, playAudio, pauseAudio } from './player.js';
import { renderScore } from './notation-renderer.js';
import { showToast } from '../ui/toast.js';
import { emit } from '../core/events.js';

// -- Editor Clipboard & History --
let clipboard = null;
export let redoStack = [];

export const clearRedoStack = () => { redoStack = []; };

// -- Event Listeners --
export const initShortcuts = () => {
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

    const isCtrl = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();

    if (e.code === 'Space') {
      e.preventDefault();
      if (state.currentScore) isAudioPlaying() ? pauseAudio() : playAudio();
      return;
    }

    if (!state.currentScore) return;
    const { activeMeasure, activeStaff } = state.editorState;

    if (isCtrl && key === 'c') {
      e.preventDefault();
      clipboard = JSON.parse(JSON.stringify(state.currentScore.measures[activeMeasure]));
      showToast("Compás copiado", "success");
    }

    if (isCtrl && key === 'v') {
      e.preventDefault();
      if (!clipboard) return;
      state.currentScore.measures[activeMeasure] = JSON.parse(JSON.stringify(clipboard));
      renderScore();
      emit("measureselected", activeMeasure);
      showToast("Compás pegado", "success");
    }

    if (isCtrl && key === 'z') {
      e.preventDefault();
      const staffNotes = state.currentScore.measures[activeMeasure]?.[activeStaff];
      
      if (e.shiftKey) {
        if (redoStack.length > 0) {
          staffNotes.push(redoStack.pop());
          renderScore();
          emit("measureselected", activeMeasure);
        }
      } else {
        if (staffNotes?.length > 0) {
          redoStack.push(staffNotes.pop());
          renderScore();
          emit("measureselected", activeMeasure);
        }
      }
    }
  });
};