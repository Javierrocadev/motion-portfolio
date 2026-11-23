import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  formatDisplayUrl,
  initProjectDetails,
  parseCategories,
  serializeProjectDetails,
} from './projectDetails.ts';

const project = {
  id: 'kinetic',
  index: '01',
  title: 'Kinetic lab',
  category: 'Laboratorios · Asistido por IA',
  summary: 'An interactive experiment.\nBuilt with care.',
  url: 'https://www.example.com/lab/',
  image: { src: '/poster.webp' },
  video: '/demo.mp4',
  leftMediaOverride: { src: '/portrait.webp' },
};

class ElementStub extends EventTarget {
  dataset = {};
  attributes = new Map();
  children = new Map();
  childNodes = [];
  className = '';
  hidden = false;
  inert = false;
  scrollTop = 0;
  textContent = '';
  ownerDocument = {
    createElement: () => new ElementStub(),
  };
  focus() { this.wasFocused = true; }
  setAttribute(name, value) { this.attributes.set(name, value); }
  removeAttribute(name) { this.attributes.delete(name); }
  hasAttribute(name) { return this.attributes.has(name); }
  replaceChildren(...nodes) { this.childNodes = nodes; }
  querySelector(selector) { return this.children.get(selector) ?? null; }
  closest(selector) { return selector === '[data-project-frame]' ? this.frame : null; }
}

function fixture() {
  const root = new ElementStub();
  const track = new ElementStub();
  const panel = new ElementStub();
  const close = new ElementStub();
  const frame = new ElementStub();
  const urlLink = new ElementStub();
  const urlHost = new ElementStub();

  panel.scrollTop = 120;
  root.children.set('[data-project-details-panel]', panel);
  panel.children.set('[data-detail-close]', close);
  for (const field of ['title', 'category', 'summary']) {
    panel.children.set(`[data-detail-${field}]`, new ElementStub());
  }
  panel.children.set('[data-detail-url]', urlLink);
  panel.children.set('[data-detail-url-host]', urlHost);

  const demoBox = new ElementStub();
  demoBox.hidden = true;
  const demoFrame = new ElementStub();
  panel.children.set('[data-detail-demo]', demoBox);
  panel.children.set('[data-detail-demo-frame]', demoFrame);

  frame.frame = frame;
  frame.dataset.projectDetails = serializeProjectDetails(project);
  frame.setAttribute('data-focused', '');
  frame.setAttribute('data-focus-ready', '');
  track.closest = () => frame;

  const controller = initProjectDetails(root, track);
  const click = (properties = {}) => {
    const event = new Event('click', { cancelable: true });
    Object.assign(event, { button: 0, detail: 1, ...properties });
    track.dispatchEvent(event);
    return event;
  };
  return { root, track, panel, close, frame, urlLink, urlHost, controller, click };
}

test('serializes editorial details without id, index, or media data', () => {
  assert.deepEqual(JSON.parse(serializeProjectDetails(project)), {
    title: project.title,
    category: project.category,
    summary: project.summary,
    url: project.url,
  });
});

test('parses category pills and formats clean display URLs', () => {
  assert.deepEqual(parseCategories('Laboratorios · Asistido por IA'), ['Laboratorios', 'Asistido por IA']);
  assert.deepEqual(parseCategories(''), []);
  assert.equal(formatDisplayUrl('https://www.example.com/lab/'), 'example.com/lab');
  assert.equal(formatDisplayUrl('https://sandraguillen.com/'), 'sandraguillen.com');
  assert.equal(formatDisplayUrl('not-a-url'), 'not-a-url');
});

test('ready-card activation stays on-page, fills top-aligned details, and resets scroll', () => {
  const { click, panel, frame, root, urlLink, urlHost } = fixture();
  assert.equal(click().defaultPrevented, true);
  assert.equal(root.hasAttribute('data-details-open'), true);
  assert.equal(frame.hasAttribute('data-selected'), true);
  assert.equal(frame.attributes.get('aria-expanded'), 'true');
  assert.equal(panel.inert, false);
  assert.equal(panel.attributes.get('aria-hidden'), 'false');
  assert.equal(panel.scrollTop, 0);

  assert.equal(panel.querySelector('[data-detail-title]').textContent, project.title);
  assert.equal(panel.querySelector('[data-detail-summary]').textContent, project.summary);

  const categoryEl = panel.querySelector('[data-detail-category]');
  assert.equal(categoryEl.hidden, false);
  assert.equal(categoryEl.childNodes.length, 2);
  assert.deepEqual(
    categoryEl.childNodes.map((node) => ({
      className: node.className,
      role: node.attributes.get('role'),
      textContent: node.textContent,
    })),
    [
      { className: 'project-details__tag', role: 'listitem', textContent: 'Laboratorios' },
      { className: 'project-details__tag', role: 'listitem', textContent: 'Asistido por IA' },
    ],
  );

  assert.equal(urlLink.hidden, false);
  assert.equal(urlLink.href, project.url);
  assert.equal(urlHost.textContent, 'example.com/lab');
});

test('repeat click, close control, Escape, and carousel dismissal restore selection', () => {
  for (const method of ['repeat', 'close', 'escape', 'carousel']) {
    const { click, close, root, panel, frame, controller } = fixture();
    assert.equal(controller.isOpen(), false, method);
    click();
    assert.equal(controller.isOpen(), true, method);
    if (method === 'repeat') click();
    if (method === 'close') close.dispatchEvent(new Event('click'));
    if (method === 'escape') {
      const event = new Event('keydown', { cancelable: true });
      Object.assign(event, { key: 'Escape' });
      root.dispatchEvent(event);
    }
    if (method === 'carousel') controller.dismiss();
    assert.equal(controller.isOpen(), false, method);
    assert.equal(frame.hasAttribute('data-selected'), false, method);
    assert.equal(frame.attributes.get('aria-expanded'), 'false', method);
    assert.equal(root.hasAttribute('data-details-open'), false, method);
    assert.equal(panel.inert, true, method);
    assert.equal(panel.attributes.get('aria-hidden'), 'true', method);
    if (method === 'close' || method === 'escape') assert.equal(frame.wasFocused, true);
  }
});

test('preserves modified-click navigation and guards cards before focus readiness', () => {
  const { click, frame, root } = fixture();
  for (const modifier of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey']) {
    assert.equal(click({ [modifier]: true }).defaultPrevented, false);
    assert.equal(root.hasAttribute('data-details-open'), false);
  }
  frame.removeAttribute('data-focus-ready');
  assert.equal(click().defaultPrevented, true);
  assert.equal(root.hasAttribute('data-details-open'), false);
});

test('hides unavailable fields and never activates a non-web project URL', () => {
  const { click, frame, panel, urlHost } = fixture();
  frame.dataset.projectDetails = JSON.stringify({
    ...project,
    category: '',
    summary: '',
    url: 'javascript:alert(1)',
    demoUrl: 'https://evil.example/x.html',
  });
  click();
  for (const field of ['category', 'summary', 'url']) {
    assert.equal(panel.querySelector(`[data-detail-${field}]`).hidden, true);
  }
  assert.equal(urlHost.textContent, '');
  assert.equal(panel.querySelector('[data-detail-demo]').hidden, true);
  assert.equal(panel.querySelector('[data-detail-demo-frame]').hasAttribute('src'), false);
});

test('mounts safe local HTML demo in left panel and clears iframe on dismiss', () => {
  const serialized = JSON.parse(
    serializeProjectDetails({ ...project, demoUrl: '/demos/logo.html', demoHtml: '<p>ignored</p>' }),
  );
  assert.equal(serialized.demoUrl, '/demos/logo.html');
  assert.equal('demoHtml' in serialized, false);

  const { click, close, frame, panel } = fixture();
  frame.dataset.projectDetails = JSON.stringify({ ...project, demoUrl: '/demos/logo.html' });
  click();
  assert.equal(panel.querySelector('[data-detail-demo]').hidden, false);
  assert.equal(panel.querySelector('[data-detail-demo-frame]').attributes.get('src'), '/demos/logo.html');
  assert.equal(panel.querySelector('[data-detail-demo-frame]').attributes.get('title'), project.title);

  close.dispatchEvent(new Event('click'));
  assert.equal(panel.querySelector('[data-detail-demo]').hidden, true);
  assert.equal(panel.querySelector('[data-detail-demo-frame]').hasAttribute('src'), false);
});

test('HeroLeftMedia removes index, ID footer, and heavy box chrome while anchoring details from the top', async () => {
  const leftMediaSource = await readFile(
    new URL('../components/hero/HeroLeftMedia.astro', import.meta.url),
    'utf8',
  );

  assert.doesNotMatch(leftMediaSource, /data-detail-index/);
  assert.doesNotMatch(leftMediaSource, /data-detail-id/);
  assert.doesNotMatch(leftMediaSource, /project-details__footer/);
  assert.doesNotMatch(leftMediaSource, /project-details__demo-bar/);

  const bodyRule = leftMediaSource.match(/\.project-details__body\s*\{([^}]+)\}/)?.[1];
  assert.ok(bodyRule, '.project-details__body CSS rule must exist');
  assert.doesNotMatch(bodyRule, /margin-block:\s*auto/);

  assert.match(leftMediaSource, /\.project-details__categories\s+:global\(\.project-details__tag\)/);
  assert.match(leftMediaSource, /data-detail-url-host/);
});

test('HeroLeftMedia hides dotted logo guides by default and reveals them on hover', async () => {
  const leftMediaSource = await readFile(
    new URL('../components/hero/HeroLeftMedia.astro', import.meta.url),
    'utf8',
  );

  const baseGuidesRule = leftMediaSource.match(
    /(?:^|\n)\s*\.left-logo__guides\s+line,\s*\.left-logo__guides\s+circle\s*\{([^}]+)\}/,
  )?.[1];
  assert.ok(baseGuidesRule, 'Base .left-logo__guides CSS rule must exist');
  assert.match(baseGuidesRule, /opacity:\s*0\s*;/);

  const hoverGuidesRule = leftMediaSource.match(
    /\.left-logo:hover\s+\.left-logo__guides\s+line,\s*\.left-logo:hover\s+\.left-logo__guides\s+circle\s*\{([^}]+)\}/,
  )?.[1];
  assert.ok(hoverGuidesRule, 'Hover .left-logo__guides CSS rule must exist');
  assert.match(hoverGuidesRule, /opacity:\s*1\s*;/);
});
