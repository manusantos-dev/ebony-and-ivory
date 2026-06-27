// UI: Native Zero-Dependency Guided Tour Engine (State Machine, 60FPS Tracking & i18n)

interface TourStep {
  target: string | null;
  pointerTarget?: string;
  title: { es: string; en: string };
  text: { es: string; en: string };
  clickBefore?: string[]; // IDs of elements to explicitly illuminate and click before this step
}

const TOUR_STEPS: TourStep[] = [
  {
    target: null,
    title: { es: "Bienvenido a Ebony & Ivory", en: "Welcome to Ebony & Ivory" },
    text: {
      es: "Este breve recorrido te mostrará las funciones principales de la aplicación para que puedas empezar a transcribir, escuchar y gestionar tus partituras.",
      en: "This brief tour will show you the main features of the application so you can start transcribing, listening, and managing your scores."
    }
  },
  {
    target: "#viewLibrary .catalog-toolbar",
    title: { es: "Tu Catálogo Personal", en: "Your Personal Catalog" },
    text: {
      es: "Aquí guardas todas tus obras. Encuentra tus partituras rápidamente filtrando por título, autor, tonalidad, compás o nivel de dificultad.",
      en: "Here you keep all your works. Quickly find your scores by filtering by title, author, key, time signature, or difficulty level."
    },
    clickBefore: ['btnGoCatalog']
  },
  {
    target: "#viewCodex .catalog-toolbar",
    title: { es: "El Códice Comunitario", en: "The Community Codex" },
    text: {
      es: "El Códice es nuestro archivo público. Descubre partituras de otros músicos, apóyalas con un 'Me gusta' y publica tus propias obras.",
      en: "The Codex is our public archive. Discover scores from other musicians, support them with a 'Like', and publish your own works."
    },
    clickBefore: ['btnTopCodex']
  },
  {
    target: "#libraryActions",
    pointerTarget: "#btnNewScore",
    title: { es: "Nueva partitura", en: "New Score" },
    text: {
      es: "Haz clic aquí para importar un archivo JSON o crear un lienzo en blanco para empezar a componer.",
      en: "Click here to import a JSON file or create a blank canvas to start composing."
    },
    clickBefore: ['btnTopCatalog'] // Returns to catalog to reveal the New Score button
  },
  {
    target: "#engraveDesk",
    title: { es: "Panel de Edición", en: "Engraving Desk" },
    text: {
      es: "Selecciona duraciones, añade alteraciones, silencios, acordes, ligaduras y articulaciones. Los cambios se dibujarán inmediatamente en el lienzo.",
      en: "Select durations, add accidentals, rests, chords, slurs, and articulations. Changes will be drawn immediately on the canvas."
    },
    clickBefore: ['btnNewScore'] // Enters the editor
  },
  {
    target: "#editorActions",
    pointerTarget: "#btnToggleViewer",
    title: { es: "Modo Vista y Exportación", en: "View Mode & Export" },
    text: {
      es: "Descarga tu trabajo en PDF o JSON, activa el Modo Práctica, o alterna al Modo Vista para leer sin distracciones.",
      en: "Download your work in PDF or JSON, activate Practice Mode, or toggle to View Mode to read without distractions."
    }
  },
  {
    target: "#playerBar",
    title: { es: "Reproducción Inteligente", en: "Intelligent Playback" },
    text: {
      es: "Escucha la partitura con latencia cero. El motor de audio interpretará matemáticamente tus dinámicas y articulaciones en tiempo real.",
      en: "Listen to the score with zero latency. The audio engine will mathematically interpret your dynamics and articulations in real time."
    },
    clickBefore: ['btnToggleViewer'] // Clicks the eye icon to reveal the player bar safely
  }
];

class GuidedTour {
  private currentStep = 0;
  private overlay: HTMLElement;
  private tooltip: HTMLElement;
  private pointer: HTMLElement;
  private isTransitioning = false;

  private rafId: number = 0;
  private activeTarget: HTMLElement | null = null;

  constructor() {
    this.injectStyles();
    this.overlay = document.createElement('div');
    this.overlay.className = 'tour-focus-hole';

    this.pointer = document.createElement('div');
    this.pointer.className = 'tour-pointer-pulse';

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'tour-tooltip modal-card';
  }

  private get lang(): 'es' | 'en' {
    const activeBtn = document.querySelector('.lang-btn.active');
    return (activeBtn?.getAttribute('data-lang') as 'es' | 'en') || 'es';
  }

  private injectStyles() {
    if (document.getElementById('tour-styles')) return;
    const style = document.createElement('style');
    style.id = 'tour-styles';
    style.textContent = `
      .tour-focus-hole {
        position: fixed; pointer-events: none; z-index: 9998;
        box-shadow: 0 0 0 9999px rgba(18, 18, 18, 0.85);
        border-radius: 12px; transition: opacity 0.4s ease, top 0.4s ease, left 0.4s ease, width 0.4s ease, height 0.4s ease;
        top: 50%; left: 50%; width: 0; height: 0; transform: translate(-50%, -50%);
      }
      .tour-tooltip {
        position: fixed; z-index: 9999; width: 360px; max-width: 90vw;
        transition: opacity 0.4s ease, top 0.4s cubic-bezier(0.25, 1, 0.5, 1), left 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        opacity: 0; pointer-events: auto; box-sizing: border-box;
        padding: 24px;
      }
      .tour-tooltip.visible { opacity: 1; }
      .tour-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; }
      .tour-dots { display: flex; gap: 6px; }
      .tour-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--color-line-strong); transition: 0.3s; }
      .tour-dot.active { background: var(--color-brass); transform: scale(1.3); }
      .tour-logo { height: 24px; object-fit: contain; margin-right: 12px; filter: invert(0); transition: filter 0.3s; }
      body.dark-theme .tour-logo { filter: invert(0.9) hue-rotate(180deg) brightness(1.2); }
      .tour-header { display: flex; align-items: center; margin-bottom: 12px; position: relative; padding-right: 30px; }

      .tour-lang-btn {
        position: absolute; top: -4px; right: -4px;
        background: var(--color-paper-edge); border: 1px solid var(--color-line);
        border-radius: 6px; font-size: 11px; font-weight: 600; color: var(--color-ink-soft);
        cursor: pointer; padding: 4px 8px; transition: all 0.2s ease;
      }
      .tour-lang-btn:hover { background: var(--color-gold-wash); color: var(--color-ink); border-color: var(--color-brass); }

      .tour-ripple-click {
        position: fixed; width: 24px; height: 24px; background: var(--color-brass);
        border-radius: 50%; transform: translate(-50%, -50%) scale(0); opacity: 0.8;
        z-index: 10000; pointer-events: none; transition: transform 0.4s ease-out, opacity 0.4s ease-out;
      }
      .tour-ripple-click.active { transform: translate(-50%, -50%) scale(4); opacity: 0; }

      .tour-pointer-pulse {
        position: fixed; width: 32px; height: 32px; border-radius: 50%;
        background: rgba(179, 142, 80, 0.3); border: 2px solid var(--color-brass);
        transform: translate(-50%, -50%); z-index: 10000; pointer-events: none; display: none;
        animation: tourPulseAnim 1.5s infinite;
      }
      @keyframes tourPulseAnim {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  private waitForElement(selector: string, timeoutMs = 2500): Promise<HTMLElement | null> {
    return new Promise(resolve => {
      const startTime = Date.now();
      const check = () => {
        const el = document.querySelector(selector) as HTMLElement;
        if (el && el.offsetParent !== null && el.getBoundingClientRect().width > 0) {
          resolve(el);
        } else if (Date.now() - startTime < timeoutMs) {
          requestAnimationFrame(check);
        } else {
          resolve(null);
        }
      };
      check();
    });
  }

  // FIX: Moves spotlight specifically to a button, simulates the click, and waits
  private async executeClickBefore(elementId: string) {
    const el = await this.waitForElement(`#${elementId}`);
    if (!el) {
      // Fallback: forcefully trigger click if element is somehow hidden by UI state
      const fallbackEl = document.getElementById(elementId);
      if (fallbackEl) fallbackEl.click();
      return;
    }

    if (!el.closest('.topbar')) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // 1. Move Spotlight to the button
    const rect = el.getBoundingClientRect();
    this.overlay.style.transform = 'none';
    this.overlay.style.top = `${rect.top - 8}px`;
    this.overlay.style.left = `${rect.left - 8}px`;
    this.overlay.style.width = `${rect.width + 16}px`;
    this.overlay.style.height = `${rect.height + 16}px`;
    this.positionTooltip(el); // Move tooltip to the button safely

    await new Promise(r => setTimeout(r, 400)); // Wait for spotlight travel time

    // 2. Visual Ripple
    const ripple = document.createElement('div');
    ripple.className = 'tour-ripple-click';
    ripple.style.left = `${rect.left + rect.width / 2}px`;
    ripple.style.top = `${rect.top + rect.height / 2}px`;
    document.body.appendChild(ripple);

    requestAnimationFrame(() => ripple.classList.add('active'));
    await new Promise(r => setTimeout(r, 400));
    ripple.remove();

    // 3. Execute Click
    el.click();
    el.dispatchEvent(new Event('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 600)); // Buffer for app routing/transitions
  }

  public async start() {
    if (localStorage.getItem('ei_tour_done') === 'true') return;
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.pointer);
    document.body.appendChild(this.tooltip);
    await this.renderStep();
  }

  private async renderStep(skipAction = false) {
    cancelAnimationFrame(this.rafId);
    const step = TOUR_STEPS[this.currentStep];

    if (!skipAction && step.clickBefore) {
      for (const btnId of step.clickBefore) {
        await this.executeClickBefore(btnId);
      }
    }

    if (step.target) {
      this.activeTarget = await this.waitForElement(step.target);
      if (this.activeTarget && !this.activeTarget.closest('.topbar')) {
        this.activeTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      this.updatePositions(); // Starts 60FPS tracking loop
    } else {
      this.activeTarget = null;
      this.overlay.style.transform = 'translate(-50%, -50%)';
      this.overlay.style.top = '50%';
      this.overlay.style.left = '50%';
      this.overlay.style.width = '0px';
      this.overlay.style.height = '0px';
      this.pointer.style.display = 'none';
      this.positionTooltip(null);
    }

    this.updateTooltipHTML(step);

    requestAnimationFrame(() => {
      this.tooltip.classList.add('visible');
    });
  }

  private updatePositions = () => {
    if (!this.activeTarget) return;

    const rect = this.activeTarget.getBoundingClientRect();
    this.overlay.style.transform = 'none';
    this.overlay.style.top = `${rect.top - 8}px`;
    this.overlay.style.left = `${rect.left - 8}px`;
    this.overlay.style.width = `${rect.width + 16}px`;
    this.overlay.style.height = `${rect.height + 16}px`;

    const step = TOUR_STEPS[this.currentStep];
    if (step.pointerTarget) {
      const ptrEl = document.querySelector(step.pointerTarget) as HTMLElement;
      if (ptrEl && ptrEl.offsetParent !== null && ptrEl.getBoundingClientRect().width > 0) {
        const prect = ptrEl.getBoundingClientRect();
        this.pointer.style.display = 'block';
        this.pointer.style.left = `${prect.left + prect.width / 2}px`;
        this.pointer.style.top = `${prect.top + prect.height / 2}px`;
      } else {
        this.pointer.style.display = 'none';
      }
    } else {
      this.pointer.style.display = 'none';
    }

    this.positionTooltip(this.activeTarget);

    this.rafId = requestAnimationFrame(this.updatePositions);
  }

  private updateTooltipHTML(step: TourStep) {
    const isLast = this.currentStep === TOUR_STEPS.length - 1;
    const dots = TOUR_STEPS.map((_, i) => `<div class="tour-dot ${i === this.currentStep ? 'active' : ''}"></div>`).join('');

    const l = this.lang;
    const btnLangLabel = l === 'es' ? 'English' : 'Español';
    const btnSkipLabel = l === 'es' ? 'Saltar tour' : 'Skip tour';
    const btnNextLabel = isLast ? (l === 'es' ? 'Finalizar' : 'Finish') : (l === 'es' ? 'Siguiente ›' : 'Next ›');

    this.tooltip.innerHTML = `
      <button id="btnTourLang" class="tour-lang-btn" title="Change Language">${btnLangLabel}</button>
      <div class="tour-header">
        <img src="/assets/ebony-ivory-brand-mark.png" class="tour-logo" alt="Ebony & Ivory">
        <h3 style="margin:0; font-family: var(--font-display); font-size: 20px; color: var(--color-ink); font-weight: 700;">${step.title[l]}</h3>
      </div>
      <p style="color: var(--color-ink-soft); font-size: 14px; line-height: 1.6; margin: 0;">${step.text[l]}</p>
      <div class="tour-footer">
        <button id="btnTourSkip" class="btn-ghost-small" style="padding: 4px 8px; font-size: 12px;">${btnSkipLabel}</button>
        <div class="tour-dots">${dots}</div>
        <button id="btnTourNext" class="btn btn-primary" style="padding: 6px 16px;">${btnNextLabel}</button>
      </div>
    `;

    document.getElementById('btnTourNext')!.onclick = () => this.next();
    document.getElementById('btnTourSkip')!.onclick = () => this.end();
    document.getElementById('btnTourLang')!.onclick = () => {
      const targetLang = this.lang === 'es' ? 'en' : 'es';
      const appLangBtn = document.querySelector(`.lang-btn[data-lang="${targetLang}"]`) as HTMLElement;
      if (appLangBtn) appLangBtn.click();
      this.renderStep(true);
    };
  }

  private positionTooltip(target: HTMLElement | null) {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const tW = this.tooltip.offsetWidth || Math.min(360, screenW * 0.9);
    const tH = this.tooltip.offsetHeight || 180;

    let top = 0; let left = 0;

    if (!target) {
      top = (screenH - tH) / 2;
      left = (screenW - tW) / 2;
    } else {
      const rect = target.getBoundingClientRect();
      top = rect.bottom + 16;
      left = rect.left;

      if (rect.width > screenW * 0.5) left = (screenW - tW) / 2;
      if (top + tH > screenH - 16) top = rect.top - tH - 16;

      if (rect.height > screenH * 0.5) {
        top = Math.max(16, (screenH - tH) / 2);
        left = rect.right + 16;
      }

      if (screenW < 768) {
        left = (screenW - tW) / 2;
        if (top < rect.bottom && top > rect.top - tH) {
          if (rect.top > tH + 32) top = rect.top - tH - 16;
          else top = rect.bottom + 16;
        }
      }
    }

    left = Math.max(16, Math.min(left, screenW - tW - 16));
    top = Math.max(16, Math.min(top, screenH - tH - 16));

    this.tooltip.style.left = `${left}px`;
    this.tooltip.style.top = `${top}px`;
  }

  private async next() {
    if (this.isTransitioning) return;
    if (this.currentStep < TOUR_STEPS.length - 1) {
      this.isTransitioning = true;
      this.tooltip.classList.remove('visible');
      this.currentStep++;
      await this.renderStep();
      this.isTransitioning = false;
    } else {
      this.end();
    }
  }

  private end() {
    cancelAnimationFrame(this.rafId);
    this.overlay.remove();
    this.tooltip.remove();
    this.pointer.remove();
    localStorage.setItem('ei_tour_done', 'true');
  }
}

// SYSTEM: Initialize Tour on App Load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => { new GuidedTour().start(); }, 500);
});
