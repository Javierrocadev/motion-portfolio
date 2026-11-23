import test from 'node:test';
import assert from 'node:assert/strict';
import { getProjects, normalizeProjectTitle, resolveProjectTones } from './projects.ts';

test('reads the shared published catalog in editorial order without credentials', async () => {
  const projects = await getProjects(async (url) => {
    assert.equal(url.origin, 'https://oq1tmoti.api.sanity.io');
    assert.match(url.pathname, /data\/query\/production$/);
    assert.equal(url.searchParams.get('perspective'), 'published');
    assert.match(url.searchParams.get('query'), /portfolioProjects/);
    return {result: [{id: 'b', title: 'Segundo'}, {id: 'a', title: 'Primero'}]};
  });
  assert.deepEqual(projects.map(p => [p.id, p.index]), [['b', '01'], ['a', '02']]);
});

test('resolves vibrant/dominant palette swatches with population and tames near-white backgrounds', () => {
  // Prefers populated vibrant over 0-population or muted swatches
  const kinetic = resolveProjectTones({
    dominant: { background: '#238fed', population: 1.36 },
    vibrant: { background: '#238fed', population: 1.36 },
    muted: { background: '#6e7b92', population: 0.07 },
    darkMuted: { background: '#424154', population: 0.51 },
    darkVibrant: { background: '#043c8c', population: 0 },
  });
  assert.equal(kinetic.softTone, '#238fed');
  assert.equal(kinetic.darkTone, '#424154');

  // Tames blinding white dominant swatch by blending toward the dark swatch
  const taskWall = resolveProjectTones({
    dominant: { background: '#f4fcfc', population: 56.54 },
    lightVibrant: { background: '#f4fcfc', population: 56.54 },
    vibrant: { background: '#36557c', population: 0.03 },
    darkMuted: { background: '#363b3f', population: 0.04 },
  });
  assert.equal(taskWall.softTone, '#36557c');
  assert.equal(taskWall.darkTone, '#363b3f');
});

test('requests English-first localized fields when locale is en', async () => {
  const projects = await getProjects('en', async (url) => {
    assert.match(url.searchParams.get('query'), /coalesce\(title\.en, title\.es/);
    return {
      result: [
        { id: 'p1', title: 'Kinetic lab', category: 'Labs', summary: 'Op-art', url: 'https://example.com', image: null, video: null, demoHtml: '<!doctype html><p>hi</p>' },
        { id: 'p2', title: 'Empty demo', category: 'Labs', summary: '', url: null, image: null, video: null, demoHtml: '   ' },
      ],
    };
  });
  assert.equal(projects[0]?.url, 'https://example.com');
  assert.equal(projects[0]?.index, '01');
  assert.equal(projects[0]?.demoUrl, '/demos/p1.html');
  assert.equal(projects[0]?.demoHtml, '<!doctype html><p>hi</p>');
  assert.equal(projects[1]?.demoUrl, null);
  assert.equal(projects[1]?.demoHtml, null);
});

test('normalizes project titles to sentence case across uppercase, title case, camelCase, and diacritics', () => {
  assert.equal(normalizeProjectTitle('COMPONENTES OPEN SOURCE', 'es'), 'Componentes open source');
  assert.equal(normalizeProjectTitle('ONETASK', 'es'), 'Onetask');
  assert.equal(normalizeProjectTitle('Gradient Wave Lab', 'en'), 'Gradient wave lab');
  assert.equal(normalizeProjectTitle('theTaskWall', 'en'), 'Thetaskwall');
  assert.equal(normalizeProjectTitle('ScrollCraft lab', 'es'), 'Scrollcraft lab');
  assert.equal(normalizeProjectTitle('PORTFOLIO DISEÑADORA', 'es'), 'Portfolio diseñadora');
  assert.equal(normalizeProjectTitle('ÁRBOL DE MOTION', 'es'), 'Árbol de motion');
  assert.equal(normalizeProjectTitle('  3D GALLERY  ', 'en'), '3D gallery');
  assert.equal(normalizeProjectTitle('   ', 'es'), '');
});

test('getProjects applies sentence-case normalization to titles and fallback image alt text', async () => {
  const projects = await getProjects('es', async () => ({
    result: [
      {
        id: 'open-source',
        title: 'COMPONENTES OPEN SOURCE',
        category: 'Componentes UI',
        summary: 'UI',
        url: null,
        image: { src: '/a.png', alt: 'COMPONENTES OPEN SOURCE' },
        video: null,
      },
      {
        id: 'thetaskwall',
        title: 'theTaskWall',
        category: 'Productividad',
        summary: 'Wall',
        url: null,
        image: { src: '/b.png', alt: 'Custom Alt Text' },
        video: null,
      },
    ],
  }));

  assert.equal(projects[0]?.title, 'Componentes open source');
  assert.equal(projects[0]?.image?.alt, 'Componentes open source');
  assert.equal(projects[1]?.title, 'Thetaskwall');
  assert.equal(projects[1]?.image?.alt, 'Custom Alt Text');

  const enProjects = await getProjects('en', async () => ({
    result: [
      {
        id: 'graphic',
        title: 'GRAPHIC DESIGNER PORTFOLIO',
        category: 'Portfolios',
        summary: 'Portfolio',
        url: null,
        image: null,
        video: null,
      },
    ],
  }));
  assert.equal(enProjects[0]?.title, 'Graphic designer portfolio');
});

