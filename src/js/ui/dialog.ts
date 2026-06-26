// INIT: Reusable Asynchronous UI Modal Dialog
export const showConfirm = (title: string, message: string, acceptText: string = "Aceptar", isDanger: boolean = false): Promise<boolean> => {
  return new Promise((resolve) => {
    const overlay = document.getElementById('confirmModalOverlay');
    const btnAccept = document.getElementById('btnConfirmAccept') as HTMLButtonElement | null;
    const btnCancel = document.getElementById('btnConfirmCancel') as HTMLButtonElement | null;
    const titleEl = document.getElementById('confirmTitle');
    const msgEl = document.getElementById('confirmMessage');

    if (!overlay || !btnAccept || !btnCancel || !titleEl || !msgEl) return resolve(false);

    titleEl.textContent = title;
    msgEl.innerHTML = message;

    btnAccept.textContent = acceptText;
    btnAccept.className = isDanger ? 'btn btn-danger' : 'btn btn-primary';
    btnCancel.hidden = (acceptText === "Entendido" || (acceptText === "Aceptar" && !isDanger && title !== "Borrar cuenta"));

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
};
