// INIT: Cloud Synchronization Visual Status UI
import { t } from './i18n';

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

export const showSyncing = (): void => {
  let ind = document.getElementById('syncIndicator');
  if (!ind) {
    ind = document.createElement('div');
    ind.id = 'syncIndicator';
    ind.className = 'sync-indicator';
    ind.innerHTML = `<div class="dot"></div><span data-i18n="syncing">${t("syncing")}</span>`;
    document.body.appendChild(ind);
  }

  if (syncTimeout) clearTimeout(syncTimeout);
  ind.classList.add('is-visible', 'is-syncing');

  const spanText = ind.querySelector('span');
  if (spanText) {
    spanText.setAttribute('data-i18n', 'syncing');
    spanText.textContent = t("syncing");
  }
};

export const showSynced = (): void => {
  const ind = document.getElementById('syncIndicator');
  if (!ind) return;

  ind.classList.remove('is-syncing');

  const spanText = ind.querySelector('span');
  if (spanText) {
    spanText.setAttribute('data-i18n', 'savedCloud');
    spanText.textContent = t("savedCloud");
  }

  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => ind.classList.remove('is-visible'), 3000);
};
