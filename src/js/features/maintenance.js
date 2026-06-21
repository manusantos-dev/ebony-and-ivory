import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

export let isMaintenanceMode = false;

export async function checkMaintenanceStatus() {
  try {
    const db = firebase.firestore();
    const doc = await db.collection('system').doc('status').get();
    
    if (doc.exists && doc.data().maintenance) {
      isMaintenanceMode = true;
      renderMaintenanceBanner();
    }
  } catch (err) {
    console.warn("Mantenimiento offline.");
  }
}

function renderMaintenanceBanner() {
  const banner = document.createElement('div');
  banner.className = 'maintenance-banner';
  banner.innerHTML = `<span>👨‍🔧 <strong>Afinando los pianos:</strong> Mantenimiento activo. Cambios guardados localmente.</span>`;
  document.body.prepend(banner);
}