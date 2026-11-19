import test from 'node:test';
import assert from 'node:assert/strict';
import { getProjects, resolveProjectTones } from './projects.ts';

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

