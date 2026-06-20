<div align="center">

<img src="assets/logotipo.png" alt="Ebony & Ivory Logo" width="400">

<br>

> **The art of preserving music.**
> A serverless digital canvas to transcribe, play, classify, and immortalize your sheet music with unmatched elegance.

<br>

🌍 **Read this in other languages:** <a href="#english">English</a> | <a href="#español">Español</a>

<br>

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![VexFlow](https://img.shields.io/badge/VexFlow-Notation-8C2F39?style=flat-square)
![ToneJS](https://img.shields.io/badge/Tone.js-Audio-000000?style=flat-square)

</div>

<br>

### <img src="assets/isotipo.png" width="16" align="center"> The Origin Story
I just wanted to learn how to play the piano. But instead of actually practicing, I got frustrated searching for ugly, poorly scanned sheet music with completely different aesthetics all over the internet. 

So, like anyone with their priorities "straight", I decided to postpone my musical journey to code my own sheet music editor and manager from scratch. Maybe I should close my code editor, sit at the keyboard, and finally start practicing... but hey, at least my sheet music looks incredible now.

---

## <img src="assets/isotipo.png" width="20" align="center"> Technical Features

Built entirely without frameworks, this project demonstrates strong web fundamentals, focusing on performance, state management, cloud synchronization, and complex DOM manipulation.

* **Cloud Sync & Auth (Firebase):** Real-time Firestore synchronization and secure user authentication (Google & Email/Password) to keep your library safely backed up across devices.
* **Audio Playback Engine (Tone.js):** Polyphonic synthesized playback reading directly from the VexFlow data model, featuring dynamic tempo adjustments and real-time measure highlighting.
* **Algorithmic Engraving (VexFlow):** Deep integration with the VexFlow engine to dynamically calculate and render complex musical notation, including strict dotted math, Grand Staff support, and automatic beaming.
* **Custom Print Engine:** Uses advanced `@media print` CSS to hijack the browser's native print dialogue. It strips the UI, formats the SVG canvas into exact A4 pages (perfectly mapped to 4 measures per line), and injects custom headers/footers for a flawless PDF export.
* **Native i18n Implementation:** A custom bilingual system (EN/ES) that auto-detects the user's `navigator.language` on load and toggles the entire UI state instantly without page reloads.
* **Vanilla State Management:** Custom hash-based URL routing simulating a Single Page Application (SPA) experience using only Vanilla JS.

## <img src="assets/isotipo.png" width="20" align="center"> Live Demo

Access the live tool hosted on GitHub Pages:
**[https://manusantos-dev.github.io/ebony-and-ivory/](https://manusantos-dev.github.io/ebony-and-ivory/)**

## <img src="assets/isotipo.png" width="20" align="center"> Disclaimer & Copyright

Ebony & Ivory is an open-source personal tool. The musical works you transcribe remain the property of their respective original authors. Please transcribe responsibly.

---
<br><br><br>

<div align="center">
  
<h1 id="español"><img src="assets/logotipo.png" alt="Ebony & Ivory Logo" width="400"></h1>

> **El arte de preservar la música.**
> Un lienzo digital estandarizado para transcribir, reproducir, clasificar y eternizar tus partituras con una elegancia inigualable.

🌍 **Leer en otros idiomas:** <a href="#english">English</a> | <a href="#español">Español</a>

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![VexFlow](https://img.shields.io/badge/VexFlow-Notation-8C2F39?style=flat-square)
![ToneJS](https://img.shields.io/badge/Tone.js-Audio-000000?style=flat-square)

</div>

<br>

### <img src="assets/isotipo.png" width="16" align="center"> La verdadera historia
Yo solo quería aprender a tocar el piano. Pero en lugar de ponerme a practicar, me frustré buscando partituras feas, mal escaneadas y con estéticas completamente distintas por todo internet. 

Así que, como cualquier persona con sus prioridades "claras", decidí posponer mi aprendizaje musical para programar mi propio editor y gestor de partituras desde cero. Quizás debería cerrar el editor de código, sentarme frente al teclado y ponerme a practicar de una vez por todas... pero oye, al menos ahora mis partituras lucen increíbles.

---

## <img src="assets/isotipo.png" width="20" align="center"> Características Técnicas

Construido completamente sin *frameworks*, este proyecto demuestra fundamentos sólidos de desarrollo web, enfocándose en el rendimiento, la gestión del estado, la sincronización en la nube y la manipulación compleja del DOM.

* **Nube y Autenticación (Firebase):** Sincronización en tiempo real mediante Firestore y autenticación de usuarios segura (Google y Correo/Contraseña) para mantener tu catálogo a salvo en cualquier dispositivo.
* **Motor de Reproducción (Tone.js):** Reproducción polifónica sintetizada que lee directamente del modelo de datos de VexFlow, con ajustes dinámicos de tempo y resaltado de compases en tiempo real.
* **Renderizado Algorítmico (VexFlow):** Integración profunda con el motor VexFlow para calcular y dibujar dinámicamente notación musical compleja, incluyendo sistemas de piano completos e inserción matemática estricta de puntillos y alteraciones.
* **Motor de Impresión Custom:** Emplea CSS avanzado (`@media print`) para transformar el lienzo web en hojas A4 perfectas. Oculta la interfaz, fuerza una maquetación algorítmica de exactamente 4 compases por línea e inyecta encabezados y paginación personalizados.
* **Implementación i18n Nativa:** Un sistema bilingüe (EN/ES) construido desde cero que autodetecta el `navigator.language` del usuario al entrar y permite cambiar el idioma de toda la interfaz en tiempo real sin recargar.
* **Gestión de Estado Vanilla:** Enrutamiento de URLs mediante Hash simulando la fluidez de una *Single Page Application* (SPA) usando únicamente Javascript puro.

## <img src="assets/isotipo.png" width="20" align="center"> Live Demo

Accede a la herramienta en vivo alojada en GitHub Pages:
**[https://manusantos-dev.github.io/ebony-and-ivory/](https://manusantos-dev.github.io/ebony-and-ivory/)**

## <img src="assets/isotipo.png" width="20" align="center"> Aviso Legal y Copyright

Ebony & Ivory es una herramienta de código abierto. Las obras musicales que transcribas siguen siendo propiedad de sus respectivos autores originales. Por favor, transcribe con responsabilidad.

---
<div align="center">
  <em>Creado con pasión por el diseño, el código limpio y la música (aunque sea una excusa para no practicar).</em>
</div>
