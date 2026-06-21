export function showConfirm(title, message, acceptText = "Aceptar", isDanger = false) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('confirmModalOverlay');
    const btnAccept = document.getElementById('btnConfirmAccept');
    const btnCancel = document.getElementById('btnConfirmCancel');

    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    btnAccept.textContent = acceptText;
    
    btnAccept.className = isDanger ? 'btn btn-danger' : 'btn btn-primary';

    const cleanup = () => {
      overlay.hidden = true;
      btnAccept.removeEventListener('click', onAccept);
      btnCancel.removeEventListener('click', onCancel);
    };

    const onAccept = () => { cleanup(); resolve(true); };
    const onCancel = () => { cleanup(); resolve(false); };

    btnAccept.addEventListener('click', onAccept);
    btnCancel.addEventListener('click', onCancel);

    overlay.hidden = false;
  });
}