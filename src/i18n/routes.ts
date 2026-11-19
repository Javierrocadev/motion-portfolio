export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'es';

export const ROUTE_ORDER = ['home', 'projects', 'process', 'about'] as const;
export type RouteKey = (typeof ROUTE_ORDER)[number];

export type TransitionDirection = 'forward' | 'backward' | 'locale-switch';

export const ROUTES: Record<RouteKey, Record<Locale, string>> = {
  home: { es: '/', en: '/en' },
  projects: { es: '/proyectos', en: '/en/projects' },
  process: { es: '/proceso', en: '/en/process' },
  about: { es: '/sobre-mi', en: '/en/about' },
};

export function normalizePathname(pathname: string): string {
  const clean = pathname.split(/[?#]/)[0] || '/';
  const withLeading = clean.startsWith('/') ? clean : `/${clean}`;
  if (withLeading.length > 1) {
    return withLeading.replace(/\/+$/, '');
  }
  return '/';
}

export function resolveRoute(pathname: string): { locale: Locale; route: RouteKey } | null {
  const normalized = normalizePathname(pathname);
  for (const route of ROUTE_ORDER) {
    for (const locale of LOCALES) {
      if (ROUTES[route][locale] === normalized) {
        return { locale, route };
      }
    }
  }
  return null;
}

export function getLocaleFromPath(pathname: string): Locale {
  const resolved = resolveRoute(pathname);
  if (resolved) return resolved.locale;
  const normalized = normalizePathname(pathname);
  if (normalized === '/en' || normalized.startsWith('/en/')) return 'en';
  return DEFAULT_LOCALE;
}

export function getLocalizedPath(route: RouteKey, locale: Locale): string {
  return ROUTES[route][locale];
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === 'es' ? 'en' : 'es';
}

export function getAlternateLinks(
  route: RouteKey,
  site?: URL,
): Array<{ hreflang: Locale | 'x-default'; href: string }> {
  const toHref = (path: string) => (site ? new URL(path, site).href : path);
  return [
    { hreflang: 'es', href: toHref(ROUTES[route].es) },
    { hreflang: 'en', href: toHref(ROUTES[route].en) },
    { hreflang: 'x-default', href: toHref(ROUTES[route][DEFAULT_LOCALE]) },
  ];
}

export function getTransitionDirection(fromPathname: string, toPathname: string): TransitionDirection {
  const from = resolveRoute(fromPathname);
  const to = resolveRoute(toPathname);

  if (!from || !to) return 'forward';
  if (from.route === to.route && from.locale !== to.locale) {
    return 'locale-switch';
  }

  const fromIndex = ROUTE_ORDER.indexOf(from.route);
  const toIndex = ROUTE_ORDER.indexOf(to.route);
  return toIndex >= fromIndex ? 'forward' : 'backward';
}
