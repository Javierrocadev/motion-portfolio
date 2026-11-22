import type { Locale, RouteKey } from './routes';

export interface TranslationDictionary {
  meta: Record<RouteKey, { title: string; description: string }>;
  layout: {
    heroAriaLabel: string;
    leftMediaAriaLabel: string;
    portraitAlt: string;
    portraitCaption: string;
    stageAriaLabel: string;
    trackAriaLabel: string;
    stageBadgeLabel: string;
    emptyProjects: string;
  };
  nav: {
    ariaLabel: string;
    brandHomeAria: string;
    menuButton: string;
    languageLabel: string;
    switchToLanguage: string;
    items: Record<RouteKey, string>;
  };
  projects: {
    eyebrow: string;
    title: string;
    intro: string;
    countLabel: string;
    visitProject: string;
    videoBadge: string;
  };
  projectDetails: { close: string; category: string; identifier: string; visit: string; demo: string };
  process: {
    eyebrow: string;
    title: string;
    subtitle: string;
    introPrimary: string;
    introSecondary: string;
    stepsTitle: string;
    steps: ReadonlyArray<{ index: string; title: string; detail: string }>;
    principlesTitle: string;
    principles: ReadonlyArray<string>;
  };
  about: {
    eyebrow: string;
    title: string;
    subtitle: string;
    rolesLabel: string;
    rolesValue: string;
    hobbiesLabel: string;
    hobbiesValue: string;
    originTitle: string;
    originText: string;
    nowTitle: string;
    nowText: string;
    processCta: string;
    linksTitle: string;
    copyEmailAria: string;
    copySuccess: string;
    copyError: string;
  };
}

export const translations: Record<Locale, TranslationDictionary> = {
  es: {
    projectDetails: { close: 'Cerrar detalles del proyecto', category: 'Categoría', identifier: 'ID', visit: 'Abrir proyecto en una nueva pestaña', demo: 'Demo interactiva' },
    meta: {
      home: {
        title: 'Javier Roca — Motion Portfolio',
        description: 'Portfolio interactivo de Javier Roca, Frontend Developer y diseñador de interfaces en movimiento.',
      },
      projects: {
        title: 'Proyectos — Javier Roca',
        description: 'Catálogo completo de proyectos interactivos, laboratorios visuales y componentes de Javier Roca.',
      },
      process: {
        title: 'Proceso — Javier Roca',
        description: 'Cómo diseño, prototipo y construyo interfaces web con movimiento en código.',
      },
      about: {
        title: 'Sobre mí — Javier Roca',
        description: 'Historia, enfoque creativo, roles y contacto de Javier Roca.',
      },
    },
    layout: {
      heroAriaLabel: 'Presentación principal y contenido interactivo',
      leftMediaAriaLabel: 'Identidad visual y logotipo de Javier Roca',
      portraitAlt: 'Logotipo geométrico animado JR de Javier Roca',
      portraitCaption: 'Creative Developer & Motion Designer',
      stageAriaLabel: 'Proyectos seleccionados',
      trackAriaLabel: 'Desplazamiento vertical de proyectos',
      stageBadgeLabel: 'Ver',
      emptyProjects: 'No hay proyectos publicados.',
    },
    nav: {
      ariaLabel: 'Navegación principal',
      brandHomeAria: 'Javier Roca — Inicio',
      menuButton: 'Menú',
      languageLabel: 'Idioma',
      switchToLanguage: 'Cambiar a inglés',
      items: {
        home: 'Inicio',
        projects: 'Proyectos',
        process: 'Proceso',
        about: 'Sobre mí',
      },
    },
    projects: {
      eyebrow: 'Archivo seleccionado',
      title: 'Proyectos',
      intro: 'Catálogo vivo conectado al Studio compartido: experimentos visuales, productos web y componentes interactivos.',
      countLabel: 'proyectos publicados',
      visitProject: 'Abrir proyecto',
      videoBadge: 'Motion',
    },
    process: {
      eyebrow: 'Método de trabajo',
      title: 'Mi proceso creativo',
      subtitle: 'Prototipar, diseñar y crear.',
      introPrimary:
        'Primero busco inspiración que refleje la idea que quiero transmitir. Tras hacer bocetos en papel, realizo una versión estática en Figma. La magia del movimiento ocurre en el propio código.',
      introSecondary:
        'El último paso es hacer variantes y probar diferentes combinaciones hasta encontrar el ritmo y la sensación ideal.',
      stepsTitle: 'Fases',
      steps: [
        {
          index: '01',
          title: 'Exploración y bocetos',
          detail: 'Referencias visuales, dirección de arte y estructura rápida sobre papel para definir la intención.',
        },
        {
          index: '02',
          title: 'Sistema estático en Figma',
          detail: 'Composición, tipografía, jerarquía espacial y contraste antes de escribir la primera línea.',
        },
        {
          index: '03',
          title: 'Movimiento en código',
          detail: 'Transiciones reales en navegador, físicas suaves y microinteracciones afinadas a 60fps.',
        },
        {
          index: '04',
          title: 'Variantes y refinamiento',
          detail: 'Iteración sobre tiempos, curvas y detalles hasta que cada transición se sienta natural.',
        },
      ],
      principlesTitle: 'Principios de diseño',
      principles: [
        'Usuario priorizado',
        'Pensamiento de diseño',
        'Wireframing',
        'Diseño de interfaces',
        'Implementación en código',
        'Diseño responsive',
      ],
    },
    about: {
      eyebrow: 'Perfil',
      title: 'Nacido en el barrio de La Boca, 2001.',
      subtitle: 'Pensando en código desde 2016.',
      rolesLabel: 'Roles',
      rolesValue: 'Front-End Developer · Diseñador Web · Full-Stack Developer',
      hobbiesLabel: 'Hobbies',
      hobbiesValue: 'Pádel · The Office · Origami',
      originTitle: '2016 — Mi inicio en la programación',
      originText:
        'Comencé mi viaje en el mundo de la tecnología y el desarrollo tras participar en la iniciativa First Lego League. Tras ganar en las regionales de Madrid, competí en la final española en Navarra y logramos plaza para un torneo internacional en Bath, Inglaterra.',
      nowTitle: 'En la actualidad',
      nowText:
        'Diseño y desarrollo interfaces web: programación, prototipado de componentes y dirección visual. Todo lo relacionado con la capa visual e interactiva de la web es en lo que me especializo.',
      processCta: 'Ver mi proceso',
      linksTitle: 'Conectar',
      copyEmailAria: 'Copiar correo electrónico',
      copySuccess: 'Correo copiado',
      copyError: 'No se pudo copiar el correo',
    },
  },
  en: {
    projectDetails: { close: 'Close project details', category: 'Category', identifier: 'ID', visit: 'Open project in a new tab', demo: 'Interactive demo' },
    meta: {
      home: {
        title: 'Javier Roca — Motion Portfolio',
        description: 'Interactive motion portfolio of Javier Roca, Frontend Developer and UI Designer.',
      },
      projects: {
        title: 'Projects — Javier Roca',
        description: 'Complete catalog of interactive projects, visual labs, and UI components by Javier Roca.',
      },
      process: {
        title: 'Process — Javier Roca',
        description: 'How I prototype, design, and craft web interfaces with motion directly in code.',
      },
      about: {
        title: 'About — Javier Roca',
        description: 'Background, creative focus, roles, and contact details for Javier Roca.',
      },
    },
    layout: {
      heroAriaLabel: 'Primary presentation and interactive content',
      leftMediaAriaLabel: 'Visual identity and Javier Roca logo',
      portraitAlt: 'Animated geometric JR monogram of Javier Roca',
      portraitCaption: 'Creative Developer & Motion Designer',
      stageAriaLabel: 'Selected projects',
      trackAriaLabel: 'Vertical project showcase',
      stageBadgeLabel: 'View',
      emptyProjects: 'No published projects yet.',
    },
    nav: {
      ariaLabel: 'Main navigation',
      brandHomeAria: 'Javier Roca — Home',
      menuButton: 'Menu',
      languageLabel: 'Language',
      switchToLanguage: 'Switch to Spanish',
      items: {
        home: 'Home',
        projects: 'Projects',
        process: 'Process',
        about: 'About',
      },
    },
    projects: {
      eyebrow: 'Selected archive',
      title: 'Projects',
      intro: 'Live catalog connected to the shared Studio: visual experiments, web products, and interactive components.',
      countLabel: 'published projects',
      visitProject: 'Open project',
      videoBadge: 'Motion',
    },
    process: {
      eyebrow: 'Workflow',
      title: 'My creative process',
      subtitle: 'Prototype, design and build.',
      introPrimary:
        'First, I look for inspiration that reflects the idea I want to convey. After sketching on paper, I create a static version in Figma. The magic of movement happens within the code itself.',
      introSecondary:
        'The last step is creating variants and testing different combinations until finding the ideal feel.',
      stepsTitle: 'Phases',
      steps: [
        {
          index: '01',
          title: 'Exploration & sketches',
          detail: 'Visual references, art direction, and quick paper sketches to lock in the core intent.',
        },
        {
          index: '02',
          title: 'Static system in Figma',
          detail: 'Composition, typography, spatial hierarchy, and contrast before writing the first line.',
        },
        {
          index: '03',
          title: 'Motion in code',
          detail: 'Real browser transitions, smooth curves, and micro-interactions tuned directly in CSS and JS.',
        },
        {
          index: '04',
          title: 'Variants & refinement',
          detail: 'Iterating timing, pacing, and small details until every screen change feels effortless.',
        },
      ],
      principlesTitle: 'Design principles',
      principles: [
        'User-Centered Design',
        'Design Thinking',
        'Wireframing',
        'UI Design',
        'Code Implementation',
        'Responsive Design',
      ],
    },
    about: {
      eyebrow: 'Profile',
      title: 'Born in Argentina, 2001.',
      subtitle: 'Thinking in code since 2016.',
      rolesLabel: 'Roles',
      rolesValue: 'Front-End Developer · Web Designer · Full-Stack Developer',
      hobbiesLabel: 'Hobbies',
      hobbiesValue: 'Padel · The Office · Origami',
      originTitle: '2016 — My start in programming',
      originText:
        'I began my journey in technology and development after taking part in First Lego League. After winning the Madrid regionals, I competed in the Spanish nationals in Navarra and earned a spot at an international tournament in Bath, England.',
      nowTitle: 'Today',
      nowText:
        'I design and build web interfaces: coding, component prototyping, and visual craft. Everything around the visual and interactive layer of the web is where I specialize.',
      processCta: 'Explore my process',
      linksTitle: 'Connect',
      copyEmailAria: 'Copy email address',
      copySuccess: 'Email copied',
      copyError: 'Could not copy email',
    },
  },
};

export function getTranslations(locale: Locale): TranslationDictionary {
  return translations[locale] ?? translations.es;
}
