export interface HeroProjectChangeDetail {
  projectId: string;
  index: string;
  leftMediaOverride?: {
    src: string;
    alt: string;
    caption?: string;
  };
}

export interface HeroScrollProgressDetail {
  progress: number;
}

export const HERO_EVENTS = {
  PROJECT_CHANGE: 'hero:project-change',
  SCROLL_PROGRESS: 'hero:scroll-progress',
} as const;

/**
 * Puente ligero de comunicación entre el layout del Hero y sus dos paneles
 * (izquierdo 40% y derecho 60%). Desacopla ambos componentes mediante
 * CustomEvents y CSS custom properties (--hero-scroll-progress).
 */
export function initHeroBridge(rootSelector = '[data-hero-root]') {
  const root = document.querySelector<HTMLElement>(rootSelector);
  if (!root) return null;

  const setScrollProgress = (rawProgress: number) => {
    const progress = Math.max(0, Math.min(1, rawProgress));
    root.style.setProperty('--hero-scroll-progress', progress.toFixed(4));
    root.dispatchEvent(
      new CustomEvent<HeroScrollProgressDetail>(HERO_EVENTS.SCROLL_PROGRESS, {
        detail: { progress },
      }),
    );
  };

  const notifyProjectChange = (detail: HeroProjectChangeDetail) => {
    root.dataset.activeProject = detail.projectId;
    root.dispatchEvent(
      new CustomEvent<HeroProjectChangeDetail>(HERO_EVENTS.PROJECT_CHANGE, {
        detail,
      }),
    );
  };

  // Inicializa la variable CSS base para animaciones dependientes del scroll
  setScrollProgress(0);

  return {
    root,
    setScrollProgress,
    notifyProjectChange,
  };
}
