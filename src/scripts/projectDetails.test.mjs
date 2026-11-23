import test from 'node:test';
import assert from 'node:assert/strict';
import { initProjectDetails, serializeProjectDetails } from './projectDetails.ts';

const project = {
  id: 'kinetic', index: '01', title: 'Kinetic lab', category: 'Creative coding',
  summary: 'An interactive experiment.\nBuilt with care.', url: 'https://example.com/lab',
  image: { src: '/poster.webp' }, video: '/demo.mp4', leftMediaOverride: { src: '/portrait.webp' },
};

class ElementStub extends EventTarget {
  dataset = {};
  attributes = new Map();
  children = new Map();
  hidden = false;
  inert = false;
  textContent = '';
  focus() { this.wasFocused = true; }
  setAttribute(name, value) { this.attributes.set(name, value); }
  removeAttribute(name) { this.attributes.delete(name); }
  hasAttribute(name) { return this.attributes.has(name); }
  querySelector(selector) { return this.children.get(selector) ?? null; }
  closest(selector) { return selector === '[data-project-frame]' ? this.frame : null; }
}

function fixture() {
  const root = new ElementStub(), track = new ElementStub(), panel = new ElementStub();
  const close = new ElementStub(), frame = new ElementStub();
  root.children.set('[data-project-details-panel]', panel);
  panel.children.set('[data-detail-close]', close);
  for (const field of ['id', 'index', 'title', 'category', 'summary', 'url']) {
    panel.children.set(`[data-detail-${field}]`, new ElementStub());
  }
  const demoBox = new ElementStub();
  demoBox.hidden = true;
  const demoFrame = new ElementStub();
  panel.children.set('[data-detail-demo]', demoBox);
  panel.children.set('[data-detail-demo-frame]', demoFrame);
  frame.frame = frame;
  frame.dataset.projectDetails = JSON.stringify(project);
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
  return { root, track, panel, close, frame, controller, click };
}

test('serializes every editorial field without any media data', () => {
  assert.deepEqual(JSON.parse(serializeProjectDetails(project)), {
    id: project.id, index: project.index, title: project.title, category: project.category,
    summary: project.summary, url: project.url,
  });
});

test('ready-card activation stays on-page and fills the non-media panel', () => {
  const { click, panel, frame, root } = fixture();
  assert.equal(click().defaultPrevented, true);
  assert.equal(root.hasAttribute('data-details-open'), true);
  assert.equal(frame.hasAttribute('data-selected'), true);
  assert.equal(frame.attributes.get('aria-expanded'), 'true');
  assert.equal(panel.inert, false);
  assert.equal(panel.attributes.get('aria-hidden'), 'false');
  for (const field of ['id', 'index', 'title', 'category', 'summary']) {
    assert.equal(panel.querySelector(`[data-detail-${field}]`).textContent, project[field]);
  }
  assert.equal(panel.querySelector('[data-detail-url]').href, project.url);
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
  const { click, frame, panel } = fixture();
  frame.dataset.projectDetails = JSON.stringify({ ...project, category: '', summary: '', url: 'javascript:alert(1)', demoUrl: 'https://evil.example/x.html' });
  click();
  for (const field of ['category', 'summary', 'url']) {
    assert.equal(panel.querySelector(`[data-detail-${field}]`).hidden, true);
  }
  assert.equal(panel.querySelector('[data-detail-demo]').hidden, true);
  assert.equal(panel.querySelector('[data-detail-demo-frame]').hasAttribute('src'), false);
});

test('mounts safe local HTML demo in left panel and clears iframe on dismiss', () => {
  const serialized = JSON.parse(serializeProjectDetails({ ...project, demoUrl: '/demos/logo.html', demoHtml: '<p>ignored</p>' }));
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
