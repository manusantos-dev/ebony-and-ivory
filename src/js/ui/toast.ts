// INIT: Dynamic UI Toast Notifications
type ToastType = 'info' | 'success' | 'error';

export const showToast = (message: string, type: ToastType = 'info', duration: number = 3000): void => {
  const toast = document.createElement('div');
  toast.className = `custom-toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));

  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
};
