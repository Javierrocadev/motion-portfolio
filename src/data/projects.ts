import { get } from 'node:https';
import type { Locale } from '../i18n/routes';

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
  url: string | null;
  video: string | null;
  demoHtml?: string | null;
  demoUrl?: string | null;
  summary: string;
  image: {
    src: string;
    softTone?: string | null;
    darkTone?: string | null;
    alt: string;
  } | null;
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

type PaletteSwatch = {
  background?: string | null;
  population?: number | null;
};

export interface ImagePalette {
  dominant?: PaletteSwatch | null;
  vibrant?: PaletteSwatch | null;
  darkVibrant?: PaletteSwatch | null;
  lightVibrant?: PaletteSwatch | null;
  muted?: PaletteSwatch | null;
  darkMuted?: PaletteSwatch | null;
  lightMuted?: PaletteSwatch | null;
}

function buildQuery(locale: Locale): string {
  const primary = locale === 'en' ? 'en' : 'es';
  const fallback = primary === 'en' ? 'es' : 'en';
  return `*[_type == "portfolioProjects" && _id == "portfolioProjects"][0].projects[]{
  "id": _key,
  "title": coalesce(title.${primary}, title.${fallback}, ""),
  "summary": coalesce(description.${primary}, description.${fallback}, ""),
  "category": array::join(categories[]->{"label": coalesce(title.${primary}, title.${fallback}, "")}.label, " · "),
  "url": url,
  "image": select(defined(image.asset) => {
    "src": image.asset->url,
    "palette": image.asset->metadata.palette,
    "softTone": coalesce(image.asset->metadata.palette.dominant.background, image.asset->metadata.palette.vibrant.background, image.asset->metadata.palette.muted.background),
    "darkTone": coalesce(image.asset->metadata.palette.darkVibrant.background, image.asset->metadata.palette.darkMuted.background),
    "alt": coalesce(image.alt.${primary}, image.alt.${fallback}, title.${primary}, title.${fallback}, "")
  }),
  "video": select(mediaType == "video" => video.asset->url),
  "demoHtml": coalesce(demoHtml.code, demoHtml)
}`;
}

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function parseRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${clamp(r)}${clamp(g)}${clamp(b)}`;
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function mixHex(hexA: string, hexB: string, weightB: number): string {
  const [r1, g1, b1] = parseRgb(hexA);
  const [r2, g2, b2] = parseRgb(hexB);
  const w = Math.max(0, Math.min(1, weightB));
  return toHex(r1 * (1 - w) + r2 * w, g1 * (1 - w) + g2 * w, b1 * (1 - w) + b2 * w);
}

function chroma([r, g, b]: [number, number, number]): number {
  return (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
}

export function resolveProjectTones(
  palette?: ImagePalette | null,
  fallbackSoft?: string | null,
  fallbackDark?: string | null,
): { softTone: string; darkTone: string } {
  const valid = (swatch?: PaletteSwatch | null, minPop = 0) =>
    swatch?.background && HEX_COLOR.test(swatch.background) && (swatch.population ?? 0) >= minPop
      ? swatch.background
      : null;

  const domBg = valid(palette?.dominant, 0.01);
  const vibBg = valid(palette?.vibrant, 0.01);
  const domPop = palette?.dominant?.population ?? 0;
  const vibPop = palette?.vibrant?.population ?? 0;

  let primary: string | null = null;
  if (domBg && vibBg) {
    // Prefer vibrant unless dominant has >= 4x the image area and meaningful chroma,
    // or if dominant is near-black (which we lift below with vibrant).
    const domLum = relativeLuminance(parseRgb(domBg));
    const domChroma = chroma(parseRgb(domBg));
    primary = (domPop >= vibPop * 4 && (domChroma > 0.12 || domLum < 0.02)) ? domBg : vibBg;
  } else if (vibBg) {
    primary = vibBg;
  } else if (domBg) {
    // If dominant is a tiny (< 0.05%) desaturated artifact (e.g. Biolume lab #8295a4 at 0.02%)
    // and Sanity found a rich vibrant swatch with 0 population, blend in that vibrant accent.
    const domChroma = chroma(parseRgb(domBg));
    const zeroPopVibrant = valid(palette?.vibrant);
    if (domPop < 0.05 && domChroma < 0.2 && zeroPopVibrant && chroma(parseRgb(zeroPopVibrant)) > 0.35) {
      primary = mixHex(zeroPopVibrant, valid(palette?.darkVibrant) ?? '#09090b', 0.35);
    } else {
      primary = domBg;
    }
  }

  primary =
    primary ??
    valid(palette?.lightVibrant, 0.05) ??
    valid(palette?.muted, 0.05) ??
    valid(palette?.darkVibrant, 0.01) ??
    valid(palette?.vibrant) ??
    valid(palette?.dominant) ??
    (fallbackSoft && HEX_COLOR.test(fallbackSoft) ? fallbackSoft : '#47464a');

  const secondaryRaw =
    valid(palette?.darkVibrant, 0.01) ??
    valid(palette?.darkMuted, 0.01) ??
    valid(palette?.darkVibrant) ??
    valid(palette?.darkMuted) ??
    (fallbackDark && HEX_COLOR.test(fallbackDark) ? fallbackDark : mixHex(primary, '#09090b', 0.55));

  // Tame blinding near-white/pastel dominant backgrounds so the stage frame still pops,
  // while lifting pitch-black dominant swatches slightly so the gradient keeps depth.
  const lum = relativeLuminance(parseRgb(primary));
  let softTone = primary;
  if (lum > 0.45) {
    const darkenFactor = Math.min(0.45, 0.18 + (lum - 0.45) * 0.5);
    softTone = mixHex(primary, secondaryRaw, darkenFactor);
  } else if (lum < 0.02 && valid(palette?.vibrant)) {
    softTone = mixHex(primary, valid(palette?.vibrant)!, 0.35);
  }

  let darkTone = secondaryRaw;
  if (softTone.toLowerCase() === darkTone.toLowerCase() || relativeLuminance(parseRgb(darkTone)) > relativeLuminance(parseRgb(softTone))) {
    darkTone = mixHex(softTone, '#09090b', 0.5);
  }

  return { softTone, darkTone };
}

type RawProjectItem = Omit<ProjectItem, 'index' | 'image'> & {
  url?: string | null;
  image: (NonNullable<ProjectItem['image']> & { palette?: ImagePalette | null }) | null;
};

type CatalogReader = (url: URL) => Promise<{ result: RawProjectItem[] | null }>;

async function readCatalog(url: URL): Promise<{ result: RawProjectItem[] | null }> {
  const response = await new Promise<import('node:http').IncomingMessage>((resolve, reject) => {
    get(url, { agent: false, signal: AbortSignal.timeout(15000) }, resolve).on('error', reject);
  });
  if (response.statusCode !== 200) {
    response.resume();
    throw new Error(`Sanity catalog request failed: HTTP ${response.statusCode}`);
  }
  response.setEncoding('utf8');
  let body = '';
  for await (const chunk of response) body += chunk;
  return JSON.parse(body);
}

const catalogCache = new Map<Locale, Promise<ProjectItem[]>>();

export function getProjects(
  localeOrRead: Locale | CatalogReader = 'es',
  customRead?: CatalogReader,
): Promise<ProjectItem[]> {
  const locale: Locale = typeof localeOrRead === 'string' ? localeOrRead : 'es';
  const read: CatalogReader = typeof localeOrRead === 'function' ? localeOrRead : (customRead ?? readCatalog);

  const load = async (): Promise<ProjectItem[]> => {
    const url = new URL('https://oq1tmoti.api.sanity.io/v2024-01-01/data/query/production');
    url.searchParams.set('query', buildQuery(locale));
    url.searchParams.set('perspective', 'published');
    const { result } = await read(url);
    return (result ?? []).map((item, i) => {
      let image: ProjectItem['image'] = null;
      if (item.image) {
        const { palette, ...rest } = item.image;
        const tones = resolveProjectTones(palette, rest.softTone, rest.darkTone);
        image = { ...rest, ...tones };
      }
      const demoHtml = typeof item.demoHtml === 'string' && item.demoHtml.trim() ? item.demoHtml : null;
      const demoUrl = demoHtml ? `/demos/${encodeURIComponent(item.id)}.html` : null;
      return {
        ...item,
        url: item.url ?? null,
        demoHtml,
        demoUrl,
        image,
        index: String(i + 1).padStart(2, '0'),
      };
    });
  };

  if (read !== readCatalog) return load();

  const cached = catalogCache.get(locale);
  if (cached) return cached;

  const promise = load().catch((error) => {
    catalogCache.delete(locale);
    throw error;
  });
  catalogCache.set(locale, promise);
  return promise;
}
