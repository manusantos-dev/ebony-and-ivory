import { state } from '../core/state.js';
import { isAudioPlaying, playAudio, pauseAudio } from './player.js';
import { renderScore } from './notation-renderer.js';
import { showToast } from '../ui/toast.js';
import { emit } from '../core/events.js';

let clipboard = null;
export let redoStack = [];

export const clearRedoStack = () => { redoStack = []; };

export const initShortcuts = () => {
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

    if (e.code === 'Space') {
      e.preventDefault();
      if (state.currentScore) isAudioPlaying() ? pauseAudio() : playAudio();
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      if (!state.currentScore) return;
      clipboard = JSON.parse(JSON.stringify(state.currentScore.measures[state.editorState.activeMeasure]));
      showToast("Compás copiado", "success");
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
      e.preventDefault();
      if (!state.currentScore || !clipboard) return;
      state.currentScore.measures[state.editorState.activeMeasure] = JSON.parse(JSON.stringify(clipboard));
      renderScore();
      emit("measureselected", state.editorState.activeMeasure);
      showToast("Compás pegado", "success");
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (!state.currentScore || redoStack.length === 0) return;
      const { activeMeasure, activeStaff } = state.editorState;
      state.currentScore.measures[activeMeasure][activeStaff].push(redoStack.pop());
      renderScore();
      emit("measureselected", activeMeasure);
    } 
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (!state.currentScore) return;
      const { activeMeasure, activeStaff } = state.editorState;
      const staff = state.currentScore.measures[activeMeasure]?.[activeStaff];
      
      if (staff?.length > 0) { 
        redoStack.push(staff.pop()); 
        renderScore(); 
        emit("measureselected", activeMeasure);
      }
    }
  });
};