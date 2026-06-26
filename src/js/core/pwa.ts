// INIT: Progressive Web App (PWA) Registration & Update Lifecycle
import { registerSW } from 'virtual:pwa-register';
import { showToast } from '../ui/toast';
import { t } from '../ui/i18n';

export const initPWA = (): void => {
  if (!('serviceWorker' in navigator)) return;

  const updateSW = registerSW({
    onNeedRefresh() {
      // EVENT: New version detected on server. Notify user.
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.style.position = 'fixed';
      btn.style.bottom = '20px';
      btn.style.right = '20px';
      btn.style.zIndex = '9999';
      btn.innerHTML = '✨ Actualización disponible. Clic para recargar.';

      btn.onclick = () => {
        btn.disabled = true;
        btn.textContent = 'Actualizando...';
        updateSW(true);
      };

      document.body.appendChild(btn);
    },
    onOfflineReady() {
      // EVENT: Caching complete. App is fully functional without internet.
      showToast(t("savedCloud") || "App lista para uso offline", "success", 4000);
    },
    onRegisterError(err: any) {
      console.error('PWA Registration Error:', err);
    }
  });
};
