/* =========================================================================
   EBONY & IVORY — firebase-config.js
   ========================================================================= 

   PASOS PARA ACTIVAR LA CUENTA Y EL GUARDADO EN LA NUBE:

   1. Ve a https://console.firebase.google.com y crea un proyecto nuevo
      (gratis, plan "Spark").

   2. Dentro del proyecto: ⚙️ Configuración del proyecto → pestaña
      "Tus apps" → pulsa el icono web </> → regístrala con cualquier
      nombre (no hace falta Firebase Hosting). Te dará un objeto
      `firebaseConfig` — cópialo y pégalo abajo, sustituyendo el de
      ejemplo.

   3. Activa Authentication: menú lateral → Build → Authentication →
      "Get started" → pestaña "Sign-in method" → activa:
        - "Email/Password"
        - "Google"
      (en Google, solo tienes que confirmar el correo de soporte)

   4. Activa Firestore: menú lateral → Build → Firestore Database →
      "Create database" → modo producción → elige una región cercana.

   5. En Firestore → pestaña "Rules", pega esto y publica, para que
      cada usuario solo pueda leer/escribir sus propias partituras:

        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /users/{userId}/scores/{scoreId} {
              allow read, write: if request.auth != null && request.auth.uid == userId;
            }
          }
        }

   6. Si vas a publicar el sitio en otro dominio (GitHub Pages, etc.),
      añádelo en Authentication → Settings → "Authorized domains".

   Mientras dejes los valores de abajo sin rellenar, la app funciona
   exactamente igual que antes (modo 100% local) — el botón de cuenta
   simplemente avisará de que la nube no está configurada.
   ========================================================================= */

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBEtGSX5ZS8WMakeer6M0ekASismF9t87w",
  authDomain: "ebony-and-ivory-app.firebaseapp.com",
  projectId: "ebony-and-ivory-app",
  storageBucket: "ebony-and-ivory-app.firebasestorage.app",
  messagingSenderId: "1081906794092",
  appId: "1:1081906794092:web:77f1ec26b703b56ff3d249"
};
