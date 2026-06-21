import { state } from '../core/state.js';
import { isAudioPlaying, playAudio, pauseAudio } from './player.js';
import { renderScore } from './notation-renderer.js';

export function initShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    if (e.code === 'Space') {
      e.preventDefault();
      if (state.currentScore) isAudioPlaying() ? pauseAudio() : playAudio();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (!state.currentScore) return;
      const staff = state.currentScore.measures[state.editorState.activeMeasure][state.editorState.activeStaff];
      if (staff.length > 0) { 
        staff.pop(); 
        renderScore(); 
      }
    }
  });
}