import { uid, nextPlateNumber, persistScore } from '../core/storage.js';
import { showToast } from '../ui/toast.js';
import { emit } from '../core/events.js';

export const initDragAndDrop = () => {
  const { body } = document;

  body.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (window.location.hash === '#catalogo') body.style.opacity = '0.7';
  });

  body.addEventListener('dragleave', (e) => {
    e.preventDefault();
    body.style.opacity = '1';
  });

  body.addEventListener('drop', (e) => {
    e.preventDefault();
    body.style.opacity = '1';
    
    if (window.location.hash !== '#catalogo') return;

    const file = e.dataTransfer.files[0];
    if (!file || !file.name.endsWith('.json')) {
      return showToast('Solo se admiten archivos .json', 'error');
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
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