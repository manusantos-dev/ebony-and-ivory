import { t } from './i18n.js';
let syncTimeout = null;

export const showSyncing = () => {
  let ind = document.getElementById('syncIndicator');
  if (!ind) {
    ind = document.createElement('div');
    ind.id = 'syncIndicator';
    ind.className = 'sync-indicator';
    ind.innerHTML = `<div class="dot"></div><span data-i18n="syncing">${t("syncing")}</span>`;
    document.body.appendChild(ind);
  }
  
  clearTimeout(syncTimeout);
  ind.classList.add('is-visible', 'is-syncing');
  
  const spanText = ind.querySelector('span');
  spanText.setAttribute('data-i18n', 'syncing');
  spanText.textContent = t("syncing");
};

export const showSynced = () => {
  const ind = document.getElementById('syncIndicator');
  if (!ind) return;
  
  ind.classList.remove('is-syncing');
  
  const spanText = ind.querySelector('span');
  spanText.setAttribute('data-i18n', 'savedCloud');
  spanText.textContent = t("savedCloud");
  
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => ind.classList.remove('is-visible'), 3000);
};