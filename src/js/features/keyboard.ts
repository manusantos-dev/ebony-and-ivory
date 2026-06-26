// INIT: Global Keyboard Shortcuts & Clipboard History Module
import { state } from '../core/state';
import { isAudioPlaying, playAudio, pauseAudio } from './player';
import { renderScore } from './notation-renderer';
import { showToast } from '../ui/toast';
import { emit } from '../core/events';
import { Note } from '../core/types';

let clipboard: { treble: Note[], bass: Note[] } | null = null;
export let redoStack: Note[] = [];

export const clearRedoStack = (): void => { redoStack = []; };

export const initShortcuts = (): void => {
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return;

    const isCtrl = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();

    if (e.code === 'Space') {
      e.preventDefault();
      if (state.currentScore) isAudioPlaying() ? pauseAudio() : playAudio();
      return;
    }

    if (!state.currentScore) return;
    const { activeMeasure, activeStaff } = state.editorState;
    const staffNotes = state.currentScore.measures[activeMeasure]?.[activeStaff];

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
      if (e.shiftKey) {
        if (redoStack.length > 0 && staffNotes) {
          staffNotes.push(redoStack.pop() as Note);
          renderScore();
          emit("measureselected", activeMeasure);
        }
      } else {
        if (staffNotes && staffNotes.length > 0) {
          redoStack.push(staffNotes.pop() as Note);
          renderScore();
          emit("measureselected", activeMeasure);
        }
      }
    }
  });
};
