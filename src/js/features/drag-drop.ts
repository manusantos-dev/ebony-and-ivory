// INIT: Drag and Drop File Import Utility
import { uid, nextPlateNumber, persistScore } from '../core/storage';
import { showToast } from '../ui/toast';
import { emit } from '../core/events';

export const initDragAndDrop = (): void => {
  const { body } = document;

  body.addEventListener('dragover', (e: DragEvent) => {
    e.preventDefault();
    if (window.location.hash === '#catalogo') body.style.opacity = '0.7';
  });

  body.addEventListener('dragleave', (e: DragEvent) => {
    e.preventDefault();
    body.style.opacity = '1';
  });

  body.addEventListener('drop', (e: DragEvent) => {
    e.preventDefault();
    body.style.opacity = '1';

    if (window.location.hash !== '#catalogo') return;

    const file = e.dataTransfer?.files[0];
    if (!file || !file.name.endsWith('.json')) {
      showToast('Solo se admiten archivos .json', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!data.measures) throw new Error("Invalid format");

        const score = {
          ...data,
          id: uid(),
          plate: nextPlateNumber(),
          updatedAt: Date.now(),
          createdAt: Date.now()
        };
        delete score.isExample;

        persistScore(score);
        showToast('Partitura importada con éxito', 'success');
        emit('scoreschanged');
      } catch {
        showToast('Error al leer el archivo JSON', 'error');
      }
    };
    reader.readAsText(file);
  });
};
