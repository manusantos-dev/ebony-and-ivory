// UI: Native Zero-Dependency Guided Tour Engine (State Machine)

interface TourStep {
  target: string | null;
  title: string;
  text: string;
  actionBefore?: () => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: null,
    title: "¡Bienvenido a Ebony & Ivory! 🎼",
    text: "Vamos a dar un rápido paseo guiado por tu nuevo ecosistema musical. Descubre todo el potencial de esta herramienta en menos de 1 minuto."
  },
  {
    target: ".hero-actions",
    title: "Tu Punto de Partida",
    text: "Desde aquí puedes acceder a tu Catálogo privado o explorar el Códice comunitario. Vamos a echar un vistazo a tu biblioteca personal.",
    actionBefore: () => { document.getElementById('btnGoCatalog')?.click(); }
  },
  {
    target: ".catalog-toolbar",
    title: "Búsqueda y Filtros",
    text: "Aquí reside tu repertorio. Busca por autor, filtra por tonalidad, compás o dificultad, y mantén tu música siempre organizada."
  },
  {
    target: "#btnNewScore",
    title: "Crea tu Música",
    text: "Puedes importar archivos JSON externos o crear un lienzo en blanco. Vamos a crear una obra nueva para ver el Editor.",
    actionBefore: () => { document.getElementById('btnNewScore')?.click(); }
  },
  {
    target: "#engraveDesk",
    title: "El Cajón de Herramientas",
    text: "El corazón de la composición. Inserta notas, acordes, ligaduras de expresión, articulaciones y apoyaturas. Todo se dibuja en tiempo real."
  },
  {
    target: "#playerBar",
    title: "Motor Auditivo Dinámico",
    text: "No es solo visual. Escucha tu obra con expresividad real. El motor interpreta tus staccatos, acentos y ligaduras con latencia cero."
  },
  {
    target: "#editorActions",
    title: "Práctica y Exportación",
    text: "Exporta la partitura a PDF, guarda el JSON o activa el Modo Práctica interactivo. ¡Ya estás listo para componer tu primera obra maestra!"
  }
];

class GuidedTour {
  private currentStep = 0;
  private overlay: HTMLElement;
  private tooltip: HTMLElement;
  private resizeHandler: () => void;

  constructor() {
    this.injectStyles();
    this.overlay = document.createElement('div');
    this.overlay.className = 'tour-focus-hole';

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'tour-tooltip modal-card';

    this.resizeHandler = () => this.renderStep();
  }

  private injectStyles() {
    if (document.getElementById('tour-styles')) return;
    const style = document.createElement('style');
    style.id = 'tour-styles';
    style.textContent = `
      .tour-focus-hole {
        position: fixed; pointer-events: none; z-index: 9998;
        box-shadow: 0 0 0 9999px rgba(18, 18, 18, 0.85);
        border-radius: 8px; transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        top: 50%; left: 50%; width: 0; height: 0; transform: translate(-50%, -50%);
      }
      .tour-tooltip {
        position: fixed; z-index: 9999; max-width: 360px; width: 90vw;
        transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        opacity: 0; pointer-events: auto;
      }
      .tour-tooltip.visible { opacity: 1; }
      .tour-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; }
      .tour-dots { display: flex; gap: 4px; }
      .tour-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--color-line-strong); transition: 0.3s; }
      .tour-dot.active { background: var(--color-brass); transform: scale(1.3); }
    `;
    document.head.appendChild(style);
  }

  // Waits for DOM element to be visible after a simulated click/view transition
  private waitForElement(selector: string): Promise<HTMLElement> {
    return new Promise(resolve => {
      const check = () => {
        const el = document.querySelector(selector) as HTMLElement;
        if (el && el.offsetParent !== null) resolve(el);
        else requestAnimationFrame(check);
      };
      check();
    });
  }

  public async start() {
    if (localStorage.getItem('ei_tour_done') === 'true') return;
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.tooltip);
    window.addEventListener('resize', this.resizeHandler);
    await this.renderStep();
  }

  private async renderStep() {
    const step = TOUR_STEPS[this.currentStep];
    this.tooltip.classList.remove('visible');

    if (step.actionBefore) {
      step.actionBefore();
      await new Promise(r => setTimeout(r, 100)); // Buffer for routing initialization
    }

    let targetEl: HTMLElement | null = null;
    if (step.target) {
      targetEl = await this.waitForElement(step.target);
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await new Promise(r => setTimeout(r, 300)); // Buffer for smooth scroll

      const rect = targetEl.getBoundingClientRect();
      this.overlay.style.transform = 'none';
      this.overlay.style.top = `${rect.top - 8}px`;
      this.overlay.style.left = `${rect.left - 8}px`;
      this.overlay.style.width = `${rect.width + 16}px`;
      this.overlay.style.height = `${rect.height + 16}px`;
    } else {
      // Center mode (No specific target)
      this.overlay.style.transform = 'translate(-50%, -50%)';
      this.overlay.style.top = '50%';
      this.overlay.style.left = '50%';
      this.overlay.style.width = '0px';
      this.overlay.style.height = '0px';
    }

    this.updateTooltipHTML(step);
    this.positionTooltip(targetEl);

    requestAnimationFrame(() => this.tooltip.classList.add('visible'));
  }

  private updateTooltipHTML(step: TourStep) {
    const isLast = this.currentStep === TOUR_STEPS.length - 1;
    const dots = TOUR_STEPS.map((_, i) => `<div class="tour-dot ${i === this.currentStep ? 'active' : ''}"></div>`).join('');

    this.tooltip.innerHTML = `
      <h3 style="margin-top:0; font-family: var(--font-display); font-size: 24px; color: var(--color-brass);">${step.title}</h3>
      <p style="color: var(--color-ink-soft); font-size: 14px; line-height: 1.6; margin: 0;">${step.text}</p>
      <div class="tour-footer">
        <button id="btnTourSkip" class="btn-ghost-small" style="padding: 4px 8px; font-size: 12px;">Saltar tour</button>
        <div class="tour-dots">${dots}</div>
        <button id="btnTourNext" class="btn btn-primary" style="padding: 6px 16px;">${isLast ? '¡Empezar!' : 'Siguiente ›'}</button>
      </div>
    `;

    document.getElementById('btnTourNext')!.onclick = () => this.next();
    document.getElementById('btnTourSkip')!.onclick = () => this.end();
  }

  private positionTooltip(target: HTMLElement | null) {
    if (!target) {
      this.tooltip.style.top = '50%';
      this.tooltip.style.left = '50%';
      this.tooltip.style.transform = 'translate(-50%, -50%)';
      return;
    }

    const rect = target.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    let top = rect.bottom + 16;
    let left = rect.left;
    let transform = 'none';

    // Auto-adjust positioning if it overflows screen bounds
    if (top + tooltipRect.height > screenH) { top = rect.top - tooltipRect.height - 16; } // Place above
    if (left + tooltipRect.width > screenW) { left = screenW - tooltipRect.width - 16; } // Shift left

    // Mobile strict centering fallback
    if (screenW < 768) {
      left = 50; transform = 'translateX(-50%)';
      this.tooltip.style.left = '50%';
    } else {
      this.tooltip.style.left = `${left}px`;
    }

    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.transform = transform;
  }

  private next() {
    if (this.currentStep < TOUR_STEPS.length - 1) {
      this.currentStep++;
      this.renderStep();
    } else {
      this.end();
    }
  }

  private end() {
    this.overlay.remove();
    this.tooltip.remove();
    window.removeEventListener('resize', this.resizeHandler);
    localStorage.setItem('ei_tour_done', 'true');
  }
}

// SYSTEM: Initialize Tour on App Load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => { new GuidedTour().start(); }, 500);
});
