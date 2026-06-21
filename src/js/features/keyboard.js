import { state } from '../core/state.js';
import { isAudioPlaying, playAudio, pauseAudio } from './player.js';
import { renderScore } from './notation-renderer.js';

export const initShortcuts = () => {
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

    if (e.code === 'Space') {
      e.preventDefault();
      if (state.currentScore) isAudioPlaying() ? pauseAudio() : playAudio();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (!state.currentScore) return;
      
      const { activeMeasure, activeStaff } = state.editorState;
      const staff = state.currentScore.measures[activeMeasure]?.[activeStaff];
      
      if (staff?.length > 0) { 
        staff.pop(); 
        renderScore(); 
      }
    }
  });
};