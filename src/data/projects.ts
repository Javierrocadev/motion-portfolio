export interface HeroLeftMediaOverride {
  src: string;
  alt: string;
  caption?: string;
}

export interface ProjectItem {
  id: string;
  index: string;
  title: string;
  category: string;
  year: string;
  summary: string;
  image: {
    src: string;
    alt: string;
  };
  /**
   * Reservado para el futuro: permitirá reemplazar la imagen estática
   * del panel izquierdo por otro recurso visual según el proyecto activo.
   */
  leftMediaOverride?: HeroLeftMediaOverride;
}

export const HERO_DEFAULT_PORTRAIT: HeroLeftMediaOverride = {
  src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=85',
  alt: 'Retrato editorial en estudio sobre fondo neutro',
  caption: 'Creative Developer & Motion Designer',
};

export const PROJECTS: ProjectItem[] = [
  {
    id: 'monolith-spatial-web',
    index: '01',
    title: 'Monolith Spatial Web',
    category: 'Creative Direction · WebGL',
    year: '2026',
    summary:
      'Arquitectura digital interactiva donde la luz, la tipografía y el scroll marcan el ritmo narrativo.',
    image: {
      src: 'https://images.unsplash.com/photo-1762017740727-86f6ad9eab18?auto=format&fit=crop&w=1800&q=85',
      alt: 'Superficie arquitectónica 3D en tonos oscuros con pliegues orgánicos',
    },
  },
  {
    id: 'kinetik-archive',
    index: '02',
    title: 'Kinetik Archive',
    category: 'Interactive Editorial · Motion',
    year: '2026',
    summary:
      'Archivo visual de diseño industrial con transiciones continuas entre plano general y detalle.',
    image: {
      src: 'https://images.unsplash.com/photo-1761998066484-daa29b9ad605?auto=format&fit=crop&w=1800&q=85',
      alt: 'Líneas oscuras onduladas con iluminación sutil de alto contraste',
    },
  },
  {
    id: 'nocturne-architecture',
    index: '03',
    title: 'Nocturne Concrete',
    category: 'Brand Experience · 3D',
    year: '2025',
    summary:
      'Recorrido sensorial por espacios brutalistas guiado por microinteracciones y profundidad.',
    image: {
      src: 'https://images.unsplash.com/photo-1554631919-e3ef0f8a654b?auto=format&fit=crop&w=1800&q=85',
      alt: 'Interior minimalista en penumbra con escaleras hacia una ventana iluminada',
    },
  },
  {
    id: 'afterlight-studio',
    index: '04',
    title: 'Afterlight Studio',
    category: 'Art Direction · Digital',
    year: '2025',
    summary: 'Estudio visual sobre la luz, el espacio y el ritmo de las formas.',
    image: {
      src: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1800&q=85',
      alt: 'Vista arquitectónica de una fachada geométrica',
    },
  },
  {
    id: 'form-field',
    index: '05',
    title: 'Form Field',
    category: 'Visual Identity · Editorial',
    year: '2025',
    summary: 'Sistema visual que explora el contraste entre geometría y textura.',
    image: {
      src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=85',
      alt: 'Edificios angulares vistos desde abajo',
    },
  },
];
