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
    stageExitLabel: string;
    prevProjectLabel: string;
    nextProjectLabel: string;
    stageReturnLabel: string;
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
  theme: {
    groupLabel: string;
    systemAria: string;
    lightAria: string;
    darkAria: string;
  };
  projects: {
    eyebrow: string;
    title: string;
    intro: string;
    countLabel: string;
    visitProject: string;
    videoBadge: string;
    allFilter: string;
    filterAriaLabel: string;
    demoBadge: string;
    openDemo: string;
  };
  projectDetails: { close: string; category: string; visit: string; openProject: string; demo: string };
  process: {
    eyebrow: string;
    title: string;
    subtitle: string;
    introPrimary: string;
    introSecondary: string;
    interactHint: string;
    evolution: {
      title: string;
      sketchLabel: string;
      sketchAlt: string;
      hifiLabel: string;
      hifiAlt: string;
      codeLabel: string;
      cardAriaLabel: string;
    };
    variants: {
      title: string;
      items: ReadonlyArray<{ index: string; label: string; ariaLabel: string }>;
    };
    journey: {
      eyebrow: string;
      titleLead: string;
      titleAccent: string;
      description: string;
      cards: ReadonlyArray<{ tag: string; title: string; description: string }>;
    };
    skills: {
      eyebrow: string;
      title: string;
      subtitle: string;
    };
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
    portraitAlt: string;
    portraitToggleAria: string;
    originGallery: {
      tableAlt: string;
      tableCaption: string;
      codeAlt: string;
      codeCaption: string;
      trophyAlt: string;
      trophyCaption: string;
    };
  };
}

export const translations: Record<Locale, TranslationDictionary> = {
  es: {
    projectDetails: {
      close: 'Cerrar detalles del proyecto',
      category: 'Categoría',
      visit: 'Abrir proyecto en una nueva pestaña',
      openProject: 'Abrir proyecto',
      demo: 'Demo interactiva',
    },
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
      stageReturnLabel: 'Volver',
      stageExitLabel: 'Sigue bajando para salir',
      prevProjectLabel: 'Proyecto anterior',
      nextProjectLabel: 'Siguiente proyecto',
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
    theme: {
      groupLabel: 'Tema de color',
      systemAria: 'Tema automático del sistema',
      lightAria: 'Tema claro',
      darkAria: 'Tema oscuro',
    },
    projects: {
      eyebrow: 'Archivo seleccionado',
      title: 'Proyectos',
      intro: 'Catálogo vivo conectado al Studio compartido: experimentos visuales, productos web y componentes interactivos.',
      countLabel: 'proyectos publicados',
      visitProject: 'Abrir proyecto',
      videoBadge: 'Motion',
      allFilter: 'Todos',
      filterAriaLabel: 'Filtrar proyectos por categoría',
      demoBadge: 'Demo',
      openDemo: 'Ver demo',
    },
    process: {
      eyebrow: 'Método de trabajo',
      title: 'Mi proceso creativo',
      subtitle: 'Prototipar, diseñar y crear.',
      introPrimary:
        'Primero busco inspiración que refleje la idea que quiero transmitir. Tras hacer bocetos en papel, realizo una versión estática en Figma. La magia del movimiento ocurre en el propio código.',
      introSecondary:
        'El último paso es hacer variantes y probar diferentes combinaciones hasta encontrar el ritmo y la sensación ideal.',
      interactHint: 'Pasa el cursor o pulsa',
      evolution: {
        title: 'Del boceto al código',
        sketchLabel: 'Boceto en papel',
        sketchAlt: 'Boceto en papel del componente de tarjeta de botones',
        hifiLabel: 'Hi-Fi en Figma',
        hifiAlt: 'Diseño estático de alta fidelidad en Figma',
        codeLabel: 'Movimiento en código',
        cardAriaLabel: 'Tarjeta interactiva: botones con 3 variantes en código',
      },
      variants: {
        title: 'Variantes en código',
        items: [
          {
            index: '01',
            label: 'Escala y banda',
            ariaLabel: 'Variante 01: botón con escala y banda de fondo animada',
          },
          {
            index: '02',
            label: 'Carrusel lineal',
            ariaLabel: 'Variante 02: carrusel horizontal de tres botones en CSS',
          },
          {
            index: '03',
            label: 'Coreografía de clic',
            ariaLabel: 'Variante 03: secuencia de carrusel y cursor haciendo clic',
          },
        ],
      },
      journey: {
        eyebrow: 'Arquitectura de flujo',
        titleLead: 'Diseñando el',
        titleAccent: 'recorrido del usuario',
        description:
          'Antes de abrir Figma o escribir una línea de código, necesito entender el viaje que hará cada persona en el sitio. ¿Qué busca? ¿Dónde puede perderse? ¿Qué acción quiero que realice?',
        cards: [
          {
            tag: '¿Qué busca?',
            title: 'Intención',
            description:
              'Cada visita llega con un objetivo. Entenderlo define qué debe aparecer primero y qué puede esperar.',
          },
          {
            tag: '¿Dónde puede perderse?',
            title: 'Fricción',
            description:
              'Los puntos de abandono son siempre los mismos: navegación confusa, carga lenta, o una jerarquía visual que no guía.',
          },
          {
            tag: '¿Qué acción quiero?',
            title: 'Conversión',
            description:
              'Un sitio sin acción clara es un folleto. Definir el CTA principal orienta cada decisión de diseño que viene después.',
          },
        ],
      },
      skills: {
        eyebrow: 'Principios',
        title: 'Mis habilidades de diseño',
        subtitle: 'Me guío por los siguientes principios',
      },
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
      portraitAlt: 'Retrato de Javier Roca',
      portraitToggleAria: 'Retrato de Javier Roca — alternar vista completa',
      originGallery: {
        tableAlt: 'Equipo compitiendo en la mesa de robótica de First Lego League Animal Allies',
        tableCaption: 'First Lego League · 2016',
        codeAlt: 'Bloques de programación visual LEGO Mindstorms EV3 para calibración de sensores',
        codeCaption: 'Lógica en bloques EV3',
        trophyAlt: 'Equipo sosteniendo el trofeo y diplomas de First Lego League',
        trophyCaption: 'Premio con el equipo',
      },
    },
  },
  en: {
    projectDetails: {
      close: 'Close project details',
      category: 'Category',
      visit: 'Open project in a new tab',
      openProject: 'Open project',
      demo: 'Interactive demo',
    },
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
      stageReturnLabel: 'Back',
      stageExitLabel: 'Keep scrolling to exit',
      prevProjectLabel: 'Previous project',
      nextProjectLabel: 'Next project',
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
    theme: {
      groupLabel: 'Color theme',
      systemAria: 'Automatic system theme',
      lightAria: 'Light theme',
      darkAria: 'Dark theme',
    },
    projects: {
      eyebrow: 'Selected archive',
      title: 'Projects',
      intro: 'Live catalog connected to the shared Studio: visual experiments, web products, and interactive components.',
      countLabel: 'published projects',
      visitProject: 'Open project',
      videoBadge: 'Motion',
      allFilter: 'All',
      filterAriaLabel: 'Filter projects by category',
      demoBadge: 'Demo',
      openDemo: 'Open demo',
    },
    process: {
      eyebrow: 'Workflow',
      title: 'My creative process',
      subtitle: 'Prototype, design and build.',
      introPrimary:
        'First, I look for inspiration that reflects the idea I want to convey. After sketching on paper, I create a static version in Figma. The magic of movement happens within the code itself.',
      introSecondary:
        'The last step is creating variants and testing different combinations until finding the ideal feel.',
      interactHint: 'Hover or tap',
      evolution: {
        title: 'From sketch to code',
        sketchLabel: 'Paper sketch',
        sketchAlt: 'Hand-drawn paper sketch of the button card component',
        hifiLabel: 'Hi-Fi in Figma',
        hifiAlt: 'Static high-fidelity UI design in Figma',
        codeLabel: 'Motion in code',
        cardAriaLabel: 'Interactive card: buttons with 3 variants in code',
      },
      variants: {
        title: 'Code variants',
        items: [
          {
            index: '01',
            label: 'Scale & reveal',
            ariaLabel: 'Variant 01: scaled button with sliding background band',
          },
          {
            index: '02',
            label: 'Linear track',
            ariaLabel: 'Variant 02: horizontal three-button track in pure CSS',
          },
          {
            index: '03',
            label: 'Click choreography',
            ariaLabel: 'Variant 03: sequenced track slide and animated cursor click',
          },
        ],
      },
      journey: {
        eyebrow: 'Flow architecture',
        titleLead: 'Designing the',
        titleAccent: 'user journey',
        description:
          'Before opening Figma or writing a line of code, I need to understand the journey each person will take on the site. What are they looking for? Where might they get lost? What action do I want them to take?',
        cards: [
          {
            tag: 'What are they looking for?',
            title: 'Intention',
            description:
              'Each visit arrives with a goal. Understanding it defines what should appear first and what can wait.',
          },
          {
            tag: 'Where might they get lost?',
            title: 'Friction',
            description:
              "The drop-off points are always the same: confusing navigation, slow loading, or a visual hierarchy that doesn't guide.",
          },
          {
            tag: 'What action do I want?',
            title: 'Conversion',
            description:
              'A site without a clear action is a brochure. Defining the main CTA guides every design decision that follows.',
          },
        ],
      },
      skills: {
        eyebrow: 'Principles',
        title: 'My design skills',
        subtitle: 'I am guided by the following principles',
      },
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
      portraitAlt: 'Portrait of Javier Roca',
      portraitToggleAria: 'Portrait of Javier Roca — toggle full frame view',
      originGallery: {
        tableAlt: 'Team competing at the First Lego League Animal Allies robotics table',
        tableCaption: 'First Lego League · 2016',
        codeAlt: 'LEGO Mindstorms EV3 visual programming blocks for sensor calibration',
        codeCaption: 'EV3 block logic',
        trophyAlt: 'Team holding the First Lego League trophy and certificates',
        trophyCaption: 'Team award',
      },
    },
  },
};

export function getTranslations(locale: Locale): TranslationDictionary {
  return translations[locale] ?? translations.es;
}
