import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAlternateLinks,
  getLocaleFromPath,
  getLocalizedPath,
  getTransitionDirection,
  resolveRoute,
} from './routes.ts';

test('resolves localized routes for Spanish (default unprefixed) and English (/en)', () => {
  assert.deepEqual(resolveRoute('/'), { locale: 'es', route: 'home' });
  assert.deepEqual(resolveRoute('/proyectos/'), { locale: 'es', route: 'projects' });
  assert.deepEqual(resolveRoute('/proceso'), { locale: 'es', route: 'process' });
  assert.deepEqual(resolveRoute('/sobre-mi/'), { locale: 'es', route: 'about' });

  assert.deepEqual(resolveRoute('/en'), { locale: 'en', route: 'home' });
  assert.deepEqual(resolveRoute('/en/'), { locale: 'en', route: 'home' });
  assert.deepEqual(resolveRoute('/en/projects'), { locale: 'en', route: 'projects' });
  assert.deepEqual(resolveRoute('/en/process/'), { locale: 'en', route: 'process' });
  assert.deepEqual(resolveRoute('/en/about'), { locale: 'en', route: 'about' });

  assert.equal(getLocaleFromPath('/en/unknown'), 'en');
  assert.equal(getLocaleFromPath('/desconocida'), 'es');
  assert.equal(getLocalizedPath('about', 'es'), '/sobre-mi');
  assert.equal(getLocalizedPath('about', 'en'), '/en/about');
});

test('generates hreflang alternates including x-default for each route', () => {
  assert.deepEqual(getAlternateLinks('process'), [
    { hreflang: 'es', href: '/proceso' },
    { hreflang: 'en', href: '/en/process' },
    { hreflang: 'x-default', href: '/proceso' },
  ]);

  assert.deepEqual(getAlternateLinks('projects', new URL('https://example.com')), [
    { hreflang: 'es', href: 'https://example.com/proyectos' },
    { hreflang: 'en', href: 'https://example.com/en/projects' },
    { hreflang: 'x-default', href: 'https://example.com/proyectos' },
  ]);
});

test('computes forward, backward, and locale-switch view transition directions', () => {
  assert.equal(getTransitionDirection('/', '/proyectos'), 'forward');
  assert.equal(getTransitionDirection('/en/projects', '/en/about'), 'forward');
  assert.equal(getTransitionDirection('/sobre-mi', '/proceso'), 'backward');
  assert.equal(getTransitionDirection('/en/about', '/en'), 'backward');
  assert.equal(getTransitionDirection('/proyectos', '/en/projects'), 'locale-switch');
  assert.equal(getTransitionDirection('/en/about', '/sobre-mi'), 'locale-switch');
});
