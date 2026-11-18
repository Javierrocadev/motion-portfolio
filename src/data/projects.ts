import { get } from 'node:https';

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
  video: string | null;
  summary: string;
  image: {
    src: string;
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

const query = `*[_type == "portfolioProjects" && _id == "portfolioProjects"][0].projects[]{
  "id": _key,
  "title": coalesce(title.es, title.en, ""),
  "summary": coalesce(description.es, description.en, ""),
  "category": array::join(categories[]->{"label": coalesce(title.es, title.en, "")}.label, " · "),
  "image": select(defined(image.asset) => {
    "src": image.asset->url,
    "alt": coalesce(image.alt.es, image.alt.en, title.es, title.en, "")
  }),
  "video": select(mediaType == "video" => video.asset->url)
}`;

async function readCatalog(url: URL): Promise<{ result: Omit<ProjectItem, 'index'>[] | null }> {
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
export async function getProjects(read = readCatalog): Promise<ProjectItem[]> {
  const url = new URL('https://oq1tmoti.api.sanity.io/v2024-01-01/data/query/production');
  url.searchParams.set('query', query);
  url.searchParams.set('perspective', 'published');
  const { result } = await read(url);
  return (result ?? []).map((item, i) => ({ ...item, index: String(i + 1).padStart(2, '0') }));
}
