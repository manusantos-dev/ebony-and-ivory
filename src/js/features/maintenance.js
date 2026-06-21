import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

export let isMaintenanceMode = false;

const renderMaintenanceBanner = () => {
  if (document.getElementById('maintenanceBanner')) return;
  const banner = document.createElement('div');
  banner.id = 'maintenanceBanner';
  banner.className = 'maintenance-banner';
  banner.innerHTML = `<span>👨‍🔧 <strong>Afinando los pianos:</strong> Mantenimiento activo. Cambios guardados localmente.</span>`;
  document.body.prepend(banner);
};

export const checkMaintenanceStatus = async () => {
  try {
    const db = firebase.firestore();
    const doc = await db.collection('system').doc('status').get();
    
    if (doc.exists && doc.data()?.maintenance) {
      isMaintenanceMode = true;
      renderMaintenanceBanner();
    }
  } catch {
    console.warn("Maintenance check offline.");
  }
};