export function showSyncing() {
  let ind = document.getElementById('syncIndicator');
  if (!ind) {
    ind = document.createElement('div');
    ind.id = 'syncIndicator';
    ind.className = 'sync-indicator';
    ind.innerHTML = `<div class="dot"></div><span>Sincronizando...</span>`;
    document.body.appendChild(ind);
  }
  ind.classList.add('is-visible', 'is-syncing');
  ind.querySelector('span').textContent = 'Sincronizando...';
}

export function showSynced() {
  const ind = document.getElementById('syncIndicator');
  if (!ind) return;
  ind.classList.remove('is-syncing');
  ind.querySelector('span').textContent = 'Guardado en la nube';
  setTimeout(() => ind.classList.remove('is-visible'), 3000);
}