<div align="center">

<img src="assets/logotipo-w.png" alt="Ebony & Ivory Logo" width="400">

<br>

> **The art of preserving music.**
> A digital canvas to transcribe, play, classify, and immortalize your sheet music with unmatched elegance.

<br>

🌍 **Read this in other languages:** <a href="#english">English</a> | <a href="#español">Español</a>

<br>

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![VexFlow](https://img.shields.io/badge/VexFlow-Notation-8C2F39?style=flat-square)
![Tone.js](https://img.shields.io/badge/Tone.js-Audio-8C2F39?style=flat-square)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Sync-FFCA28?style=flat-square&logo=firebase&logoColor=black)

</div>

<br>

### <img src="assets/isotipo-w.png" width="16" align="center"> The Origin Story
I just wanted to learn how to play the piano. But instead of actually practicing, I got frustrated searching for ugly, poorly scanned sheet music with completely different aesthetics all over the internet.

So, like anyone with their priorities "straight", I decided to postpone my musical journey to code my own browser-based sheet music editor and catalog from scratch. Maybe I should close my code editor, sit at the keyboard, and finally start practicing... but hey, at least my sheet music looks incredible now.

> **🤖 Transparency Note (or "How I built this without being a Frontend Guru")**
> If you inspect the codebase and think: *"wow, this guy breathes JavaScript"*, let me stop you right there. My natural habitats are math and cybersecurity. This project is the result of a lot of *vibe coding*: I designed the modular architecture, provided the mathematical logic so the measures wouldn't explode, and made the core product decisions; my AI assistant took care of typing out most of the syntax. It turns out that if you have a clear logic of what you want to build and know *how* to ask for it, you can create a full-fledged sheet music editor without having to search StackOverflow on how to center a div for the millionth time.

---

## <img src="assets/isotipo-w.png" width="20" align="center"> Technical Features

Built without any UI framework, as a set of vanilla ES Modules. The project demonstrates strong web fundamentals, focusing on performance, state management, and complex DOM/SVG manipulation.

* **Algorithmic Engraving (VexFlow):** Deep integration with the VexFlow engine to dynamically calculate and render complex grand-staff notation, including strict dotted-note math, key/time signatures, repeats, directives (Fine, D.C. al Coda...) and automatic beaming.
* **Playback Engine (Tone.js):** A sampled acoustic piano plays back the transcribed score in sync with the notation — adjustable tempo (BPM) and playback speed (0.5× to 2×), live progress bar, and a "magic line" that sweeps across the active measure while the corresponding notes light up.
* **Local-First Storage with Optional Cloud Sync:** Scores are saved instantly to the browser's `localStorage`, so the app works fully offline with zero setup. Creating a free account (email/password or Google, via Firebase Authentication) additionally syncs your catalog to Firestore in real time across devices; local data is purged on sign-out for privacy. JSON export/import is also available for manual backups.
* **Custom Print Engine:** Uses advanced `@media print` CSS to hijack the browser's native print dialogue. It strips the UI, formats the SVG canvas into exact A4 pages (4 measures per line), and injects custom headers/footers for a flawless PDF export.
* **Native i18n Implementation:** A custom bilingual system (EN/ES) that auto-detects the user's `navigator.language` on load and toggles the entire UI state instantly without page reloads.
* **Vanilla State Management:** Hash-based URL routing (`#catalogo`, `#editor/id`, `#viewer/id`, `#ejemplo`), a tiny pub/sub event bus to decouple modules, and real-time DOM filtering/sorting, simulating a Single Page Application (SPA) experience using only vanilla JS.

## <img src="assets/isotipo-w.png" width="20" align="center"> Live Demo

Access the live tool hosted on GitHub Pages:
**[https://manusantos-dev.github.io/ebony-and-ivory/](https://manusantos-dev.github.io/ebony-and-ivory/)**

## <img src="assets/isotipo-w.png" width="20" align="center"> Feedback & Support

This is a completely open-source tool made *by* a music lover, *for* musicians and anyone who simply enjoys playing. I don't want to monetize this with ads or paywalls. 

**The only thing I ask for in return is your feedback.**
Have you found a bug? Is there a feature you desperately miss? Do you just want to share how you're using it? Please open an issue on GitHub or reach out to me. Let's make this tool better together!

## <img src="assets/isotipo-w.png" width="20" align="center"> Disclaimer & Copyright

Ebony & Ivory is an open-source personal tool. The musical works you transcribe remain the property of their respective original authors. Please transcribe responsibly.

---
<br><br><br>

<div align="center">
  
<h1 id="español"><img src="assets/logotipo-w.png" alt="Ebony & Ivory Logo" width="400"></h1>

> **El arte de preservar la música.**
> Un lienzo digital para transcribir, reproducir, clasificar y eternizar tus partituras con una elegancia inigualable.

🌍 **Leer en otros idiomas:** <a href="#english">English</a> | <a href="#español">Español</a>

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![VexFlow](https://img.shields.io/badge/VexFlow-Notation-8C2F39?style=flat-square)
![Tone.js](https://img.shields.io/badge/Tone.js-Audio-8C2F39?style=flat-square)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Sync-FFCA28?style=flat-square&logo=firebase&logoColor=black)

</div>

<br>

### <img src="assets/isotipo-w.png" width="16" align="center"> La verdadera historia
Yo solo quería aprender a tocar el piano. Pero en lugar de ponerme a practicar, me frustré buscando partituras feas, mal escaneadas y con estéticas completamente distintas por todo internet.

Así que, como cualquier persona con sus prioridades "claras", decidí posponer mi aprendizaje musical para programar mi propio editor y gestor de partituras en el navegador desde cero. Quizás debería cerrar el editor de código, sentarme frente al teclado y ponerme a practicar de una vez por todas... pero oye, al menos ahora mis partituras lucen increíbles.

> **🤖 Nota de transparencia (o "Cómo construí esto sin ser un gurú del Frontend")**
> Si inspeccionas el código y piensas: *"wow, este chico respira JavaScript"*, te detengo ahí mismo. Mi hábitat natural son las matemáticas y la ciberseguridad. Este proyecto es el resultado de mucho *vibe coding*: yo diseñé la arquitectura modular, aporté la lógica matemática para que los compases no exploten y tomé las decisiones de producto; mi asistente de Inteligencia Artificial se encargó de teclear la mayor parte de la sintaxis. Resulta que si tienes clara la lógica de lo que quieres construir y sabes *cómo* pedirlo, puedes crear un editor musical completo sin tener que buscar en StackOverflow cómo centrar un div por enésima vez.

---

## <img src="assets/isotipo-w.png" width="20" align="center"> Características Técnicas

Construido sin ningún *framework* de UI, como un conjunto de módulos ES (ES Modules) en JavaScript puro. El proyecto demuestra fundamentos sólidos de desarrollo web, enfocándose en el rendimiento, la gestión del estado y la manipulación compleja del DOM/SVG.

* **Renderizado Algorítmico (VexFlow):** Integración profunda con el motor VexFlow para calcular y dibujar dinámicamente notación musical compleja en sistema de piano completo, incluyendo inserción matemática estricta de puntillos, armaduras, repeticiones e indicaciones (Fine, D.C. al Coda...) con beaming automático.
* **Motor de Reproducción (Tone.js):** Un piano acústico muestreado reproduce la partitura transcrita en sincronía con la notación — tempo (BPM) y velocidad de reproducción ajustables, barra de progreso en tiempo real y una "línea mágica" que recorre el compás activo iluminando las notas.
* **Almacenamiento Local con Sincronización en la Nube:** Las partituras se guardan al instante en el `localStorage` del navegador (funciona 100% offline). Crear una cuenta gratuita (email/contraseña o Google, vía Firebase) sincroniza tu catálogo con Firestore en tiempo real entre dispositivos.
* **Motor de Impresión Custom:** Emplea CSS avanzado (`@media print`) para transformar el lienzo web en hojas A4 perfectas. Oculta la interfaz, fuerza una maquetación algorítmica de 4 compases por línea e inyecta encabezados y paginación personalizados para generar PDFs impecables.
* **Implementación i18n Nativa:** Un sistema bilingüe (EN/ES) construido desde cero que autodetecta el `navigator.language` del usuario al entrar y permite cambiar el idioma de toda la interfaz en tiempo real sin recargar.
* **Gestión de Estado Vanilla:** Enrutamiento de URLs mediante Hash (`#catalogo`, `#editor`, `#viewer`), un pequeño bus de eventos pub/sub para desacoplar módulos y algoritmos de filtrado/ordenación en el DOM, simulando la fluidez de una SPA usando únicamente JavaScript puro.

## <img src="assets/isotipo-w.png" width="20" align="center"> Live Demo

Accede a la herramienta en vivo alojada en GitHub Pages:
**[https://manusantos-dev.github.io/ebony-and-ivory/](https://manusantos-dev.github.io/ebony-and-ivory/)**

## <img src="assets/isotipo-w.png" width="20" align="center"> Feedback y Contribuciones

Esta es una herramienta de código abierto hecha *por* un aficionado a la música *para* músicos y cualquiera que disfrute tocando. No tengo intención de monetizarla con anuncios ni versiones de pago.

**Lo único que me gustaría recibir a cambio es vuestro *feedback*.**
¿Has encontrado un fallo? ¿Echas en falta alguna funcionalidad? ¿O simplemente quieres contarme qué te parece? Por favor, abre un *issue* en GitHub o escríbeme directamente. ¡Ayúdame a mejorarla!

## <img src="assets/isotipo-w.png" width="20" align="center"> Aviso Legal y Copyright

Ebony & Ivory es una herramienta de uso personal. Las obras musicales que transcribas siguen siendo propiedad de sus respectivos autores originales. Por favor, transcribe con responsabilidad.

---
<div align="center">
  <em>Creado con pasión por el diseño, el código limpio y la música (aunque sea una excusa para no practicar).</em>
</div>
