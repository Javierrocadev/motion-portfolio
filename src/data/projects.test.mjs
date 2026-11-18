import test from 'node:test';
import assert from 'node:assert/strict';
import { getProjects } from './projects.ts';

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
