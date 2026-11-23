import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parse } from '@astrojs/compiler-rs';
import { runInNewContext } from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';

const source = await readFile(new URL('./HeroProjectStage.astro', import.meta.url), 'utf8');
const { ast } = await parse(source);

function find(node, predicate) {
  if (!node || typeof node !== 'object') return;
  if (predicate(node)) return node;
  for (const value of Object.values(node)) {
    for (const child of Array.isArray(value) ? value : [value]) {
      const match = find(child, predicate);
      if (match) return match;
    }
  }
}

function hasAttribute(node, name) {
  return node.type === 'JSXElement' &&
    node.openingElement.attributes.some(attribute => attribute.name?.name === name);
}

test('renders the corresponding project title inside each native scrolling slide', () => {
  const track = find(ast, node => hasAttribute(node, 'data-project-track'));
  const slide = find(track, node => hasAttribute(node, 'data-project-slide'));
  const title = slide.children.find(node => hasAttribute(node, 'data-project-name'));
  assert.ok(title, 'Each slide needs its own title so adjacent names scroll with the projects');
  const expression = find(title, node => node.type === 'MemberExpression');
  assert.equal(expression.object.name, 'project');
  assert.equal(expression.property.name, 'title');
  assert.ok(title.openingElement.attributes.some(attribute =>
    attribute.name?.name === 'aria-hidden' && attribute.value?.value === 'true'));
});

test('keeps the project link first for focus, media playback and seamless loop rebasing', () => {
  const slide = find(ast, node => hasAttribute(node, 'data-project-slide'));
  const children = slide.children.filter(node => node.type === 'JSXElement');
  assert.ok(hasAttribute(children[0], 'data-project-frame'));
  assert.equal(children[0].openingElement.name.name, 'a');
  assert.ok(hasAttribute(children[1], 'data-project-name'));
});

test('hides all names except the current slide and its immediate neighbors', () => {
  const base = source.match(/\.project-stage__name\s*\{([^}]+)\}/)[1];
  assert.match(base, /visibility:\s*hidden/);
  const neighbors = source.match(/([^{}]+)\{\s*visibility:\s*visible;\s*opacity:\s*0\.4;\s*\}/)?.[1];
  assert.ok(neighbors, 'Adjacent titles must be visible at a lower opacity');
  assert.match(neighbors, /:has\(\+ \.project-stage__slide > :is\(\[data-focused\], \[data-candidate\]\)\)/);
  assert.match(neighbors, /:has\(> :is\(\[data-focused\], \[data-candidate\]\)\) \+ \.project-stage__slide/);
  const active = source.match(/\.project-stage__slide:has\(> \[data-focused\], > \[data-candidate\]\) > \.project-stage__name\s*\{([^}]+)\}/)[1];
  assert.match(active, /visibility:\s*visible/);
  assert.match(active, /opacity:\s*1;/);
});

test('uses a smaller responsive title size', () => {
  const base = source.match(/\.project-stage__name\s*\{([^}]+)\}/)[1];
  assert.match(base, /font-size:\s*clamp\(0\.875rem, 0\.5rem \+ 1\.2cqw, 1\.25rem\)/);
});

function namePositions(scrollTop, reduced = false) {
  const measure = source.match(/    function measure\(\) \{[\s\S]*?\n    \}/)?.[0];
  const render = source.match(/    function renderNames\(\) \{[\s\S]*?\n    \}/)?.[0];
  assert.ok(render, 'Titles need compact spacing independent of image slide heights');
  const names = [20, 40, 20].map(offsetHeight => ({ offsetHeight, style: {} }));
  const context = {
    names,
    slides: names.map((_, index) => ({ offsetTop: 300 + index * 200, offsetHeight: 200 })),
    track: { clientWidth: 1000, clientHeight: 800, scrollTop },
    PREVIEW_WIDTH: 800, PREVIEW_RATIO: 16 / 9, NAME_GAP: 16,
    candidate: 1, reducedMotion: { matches: reduced },
  };
  runInNewContext(stripTypeScriptTypes(`let centers = [], nameCenters = [];
    let step = 1, baseWidth = 1, baseHeight = 1, peakScale = 1;
    ${measure}\n${render}\nmeasure(); renderNames();`), context);
  return names.map((name, index) => {
    const correction = Number(name.style.transform.match(/\+ ([\d.e+-]+)px/)[1]);
    return index * 200 - scrollTop + correction;
  });
}

test('keeps 16px between title boxes, including wrapped titles', () => {
  const [previous, active, next] = namePositions(200);
  assert.equal(active, 0);
  assert.equal(active - previous - (20 + 40) / 2, 16);
  assert.equal(next - active - (40 + 20) / 2, 16);
  assert.match(source, /const NAME_GAP = 16;/);
});

test('compact titles follow fractional scroll without changing their spacing', () => {
  const [previous, active, next] = namePositions(250);
  assert.equal(active, -11.5);
  assert.equal(active - previous, 46);
  assert.equal(next - active, 46);
});

test('reduced motion keeps the active name centered instead of rolling it', () => {
  assert.equal(namePositions(250, true)[1], 0);
});

test('extracts the supplied turbulence and displacement settings for the backdrop', () => {
  const element = name => find(ast, node => node.type === 'JSXElement' && node.openingElement.name.name === name);
  const attributes = node => Object.fromEntries(node.openingElement.attributes.map(attribute =>
    [attribute.name.name, attribute.value?.value]));
  assert.ok(element('feTurbulence'), 'The background needs the supplied SVG noise filter');
  const turbulence = attributes(element('feTurbulence'));
  assert.equal(turbulence.type, 'turbulence');
  assert.equal(turbulence.baseFrequency, '0.9');
  assert.equal(turbulence.numOctaves, '2');
  assert.equal(turbulence.seed, '1');
  assert.equal(turbulence.stitchTiles, 'stitch');
  const displacement = attributes(element('feDisplacementMap'));
  assert.equal(displacement.in, 'SourceGraphic');
  assert.equal(displacement.in2, 'turbulence');
  assert.equal(displacement.scale, '30');
  assert.equal(displacement.xChannelSelector, 'R');
  assert.equal(displacement.yChannelSelector, 'G');
});

test('isolates the filtered radial background from project images and titles', () => {
  const background = find(ast, node => hasAttribute(node, 'data-project-background'));
  assert.ok(background, 'The noisy background needs its own clipping layer');
  assert.equal(find(background, node => hasAttribute(node, 'data-project-track')), undefined);
  assert.equal(find(background, node => hasAttribute(node, 'data-project-name')), undefined);
  assert.match(source, /radial-gradient\(\s*circle at 50% 100%/);
  assert.match(source, /const noiseId = `project-stage-noise-\$\{crypto\.randomUUID\(\)\}`/);
  assert.match(source, /\.project-stage__background\s*\{[^}]*overflow:\s*hidden/);
});

test('tints only painted media pixels while preserving alpha and video fades', () => {
  const media = source.match(/\.project-stage__visual\s*\{([^}]+)\}/)?.[1];
  assert.ok(media, 'Image and video need a shared media layer');
  assert.doesNotMatch(media, /opacity\s*:/);
  assert.doesNotMatch(source, /\.project-stage__visual::after/);
  const matrix = find(ast, node => node.type === 'JSXElement' && node.openingElement.name.name === 'feColorMatrix');
  assert.ok(matrix, 'Tint must follow the media pixels, not the contain box');
  const values = matrix.openingElement.attributes.find(attribute => attribute.name.name === 'values').value.value.trim().split(/\s+/).map(Number);
  assert.deepEqual(values.slice(15), [0, 0, 0, 1, 0]);
  for (let channel = 0; channel < 3; channel++) {
    assert.equal(values[channel * 5 + channel], 0.7);
    assert.ok(Math.abs(values[channel * 5 + 4] - [24, 24, 27][channel] / 255 * 0.3) < 0.000001);
  }
  assert.match(source, /<figure class="project-stage__visual" style=\{\{ filter: `url\("#\$\{mediaTintId\}"\)` \}\}/);
  assert.doesNotMatch(source, /filter:\s*brightness\(0\.8\) saturate\(0\.92\)/);
  assert.match(source, /\.focus-video\[data-visible\]\)\s*\{\s*opacity:\s*1;/);
});

test('renders a tilted hollow open-ended cylinder contour with lateral glyphs', () => {
  const badge = find(ast, node => hasAttribute(node, 'data-stage-badge'));
  assert.ok(badge, 'Stage badge element is required');
  assert.doesNotMatch(source, /stage-badge__ring/);
  assert.doesNotMatch(source, /stage-badge__(cap|body|dot)/);

  const hasClass = (className) => find(badge, node =>
    node.type === 'JSXElement' &&
    node.openingElement.attributes.some(attribute =>
      attribute.name?.name === 'class' &&
      attribute.value?.value?.split(/\s+/).includes(className),
    ));

  for (const part of ['stage-badge__rig', 'stage-badge__contour--back', 'stage-badge__contour--front', 'stage-badge__scene', 'stage-badge__tilt', 'stage-badge__drum', 'stage-badge__glyph-inner']) {
    assert.ok(hasClass(part), `Hollow cylinder badge must render .${part}`);
  }
  assert.match(source, /'stage-badge__glyph--front'/);
  assert.match(source, /'stage-badge__glyph--back'/);

  const rig = source.match(/\.stage-badge__rig\s*\{([^}]+)\}/)?.[1];
  assert.match(rig, /transform:\s*rotate\(-12deg\)/);

  const contourStrokes = source.match(/\.stage-badge__rim,\s*\.stage-badge__edge\s*\{([^}]+)\}/)?.[1];
  assert.match(contourStrokes, /fill:\s*none/);

  const tilt = source.match(/\.stage-badge__tilt\s*\{([^}]+)\}/)?.[1];
  const drum = source.match(/\.stage-badge__drum\s*\{([^}]+)\}/)?.[1];
  assert.match(tilt, /transform-style:\s*preserve-3d/);
  assert.match(tilt, /transform:\s*rotateX\(-24deg\)/);
  assert.match(drum, /transform-style:\s*preserve-3d/);

  const glyph = source.match(/\.stage-badge__glyph\s*\{([^}]+)\}/)?.[1];
  assert.match(glyph, /backface-visibility:\s*hidden/);
  const glyphFront = source.match(/\.stage-badge__glyph--front\s*\{([^}]+)\}/)?.[1];
  assert.match(glyphFront, /rotateY\(var\(--glyph-angle\)\)\s*translateZ\(var\(--cyl-r\)\)/);
  const glyphInner = source.match(/\.stage-badge__glyph-inner\s*\{([^}]+)\}/)?.[1];
  assert.match(glyphInner, /transform:\s*scaleX\(-1\)/);
});

test('projects open cylinder rims and tangent side edges without overlapping caps', () => {
  const snippet = source.match(/const CYLINDER_VIEW_W[\s\S]*?const cylinderContour = \{[\s\S]*?\};/)?.[0];
  assert.ok(snippet, 'Frontmatter cylinder contour geometry block must exist');
  const context = {};
  runInNewContext(
    stripTypeScriptTypes(`${snippet}\nthis.out = { projectCylinder, horizonAngle, cylinderContour, CYLINDER_HALF_H };`),
    context,
  );
  const { projectCylinder, cylinderContour, CYLINDER_HALF_H } = context.out;

  const backBottomCenter = projectCylinder(180, CYLINDER_HALF_H);
  const frontTopCenter = projectCylinder(0, -CYLINDER_HALF_H);
  assert.ok(
    backBottomCenter.y < frontTopCenter.y,
    `Hollow opening must stay visible (backBottom=${backBottomCenter.y} < frontTop=${frontTopCenter.y})`,
  );

  const parsePoints = path => path.trim().split(/\s*[ML]\s*/).filter(Boolean).map(pair => pair.split(/\s+/).map(Number));
  const frontTopPts = parsePoints(cylinderContour.frontTop);
  const frontBottomPts = parsePoints(cylinderContour.frontBottom);
  const leftEdgePts = parsePoints(cylinderContour.leftEdge);
  const rightEdgePts = parsePoints(cylinderContour.rightEdge);

  assert.deepEqual(leftEdgePts[0], frontTopPts[0]);
  assert.deepEqual(leftEdgePts[1], frontBottomPts[0]);
  assert.deepEqual(rightEdgePts[0], frontTopPts.at(-1));
  assert.deepEqual(rightEdgePts[1], frontBottomPts.at(-1));
});

function buildCylinderGlyphs(badgeLabel) {
  const snippet = source.match(/const CYLINDER_REPEATS[\s\S]*?\}\)\.flat\(\);/)?.[0];
  assert.ok(snippet, 'Frontmatter cylinder glyph layout block must exist');
  const context = { badgeLabel };
  runInNewContext(stripTypeScriptTypes(`${snippet}\nthis.result = cylinderGlyphs;`), context);
  return JSON.parse(JSON.stringify(context.result));
}

test('rolls lateral glyphs left-to-right around the cylinder and places glyphs in readable order', () => {
  for (const [label, expectedLetters] of [['Ver', ['V', 'E', 'R']], ['View', ['V', 'I', 'E', 'W']]]) {
    const glyphs = buildCylinderGlyphs(label);
    const repeatSize = expectedLetters.length + 1;
    assert.equal(glyphs.length, 5 * repeatSize);

    for (let repeat = 0; repeat < 5; repeat++) {
      const slice = glyphs.slice(repeat * repeatSize, (repeat + 1) * repeatSize);
      const letters = slice.filter(g => !g.isSep);
      const sep = slice.find(g => g.isSep);
      assert.deepEqual(letters.map(g => g.char), expectedLetters);
      for (let i = 1; i < letters.length; i++) {
        assert.ok(letters[i].angle > letters[i - 1].angle, `${label} glyphs must read left-to-right`);
      }
      assert.ok(sep && sep.char === '•');
      assert.ok(sep.angle > letters.at(-1).angle, 'Separator must follow the repeat letters');
    }

    const sorted = [...glyphs].sort((a, b) => a.angle - b.angle);
    for (let i = 1; i < sorted.length; i++) {
      assert.ok(sorted[i].angle - sorted[i - 1].angle >= 5, 'Glyphs and separators must not collide');
    }
  }

  const keyframes = source.match(/@keyframes stageBadgeRoll\s*\{([\s\S]*?)\n  \}/)?.[1];
  assert.ok(keyframes, '@keyframes stageBadgeRoll must exist');
  assert.match(keyframes, /from\s*\{\s*transform:\s*rotateY\(0deg\);\s*\}/);
  assert.match(keyframes, /to\s*\{\s*transform:\s*rotateY\(360deg\);\s*\}/);

  const reducedMotionBlock = source.match(/@media \(prefers-reduced-motion: no-preference\)\s*\{\s*\.stage-badge\s*\{[\s\S]*?\.stage-badge\[data-visible\] \.stage-badge__drum\s*\{([^}]+)\}/)?.[1];
  assert.ok(reducedMotionBlock, 'Drum roll animation must be gated under prefers-reduced-motion: no-preference');
  assert.match(reducedMotionBlock, /animation:\s*stageBadgeRoll 10s linear infinite;/);
});

test('measures docked cylinder size after applying data-docked', () => {
  const dockFn = source.match(/    function dockBadge\(frame: HTMLElement\) \{[\s\S]*?\n    \}/)?.[0];
  assert.ok(dockFn, 'dockBadge function must exist');

  const events = [];
  let docked = false;
  const badge = {
    style: {},
    setAttribute(name) {
      events.push(`set:${name}`);
      if (name === 'data-docked') docked = true;
    },
    get offsetWidth() {
      events.push(`read:width:${docked}`);
      return docked ? 82 : 100;
    },
    get offsetHeight() {
      events.push(`read:height:${docked}`);
      return docked ? 56 : 68;
    },
  };
  const cursorAttrs = new Set();
  const cursor = {
    style: {},
    setAttribute(name) { cursorAttrs.add(name); },
    removeAttribute(name) { cursorAttrs.delete(name); },
    hasAttribute(name) { return cursorAttrs.has(name); },
  };
  const context = {
    badge,
    cursor,
    badgeRaf: 0,
    badgeX: 0,
    badgeY: 0,
    badgeTargetX: 0,
    badgeTargetY: 0,
    badgeVisible: false,
    coarseHover: { matches: false },
    cancelAnimationFrame() {},
    stage: {
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 500, height: 400 }),
      removeAttribute() {},
    },
    focusedMediaRect: () => ({ left: 50, top: 40, right: 450, bottom: 340, width: 400, height: 300 }),
  };

  runInNewContext(stripTypeScriptTypes(`${dockFn}\ndockBadge({});`), context);
  assert.equal(events[0], 'set:data-docked');
  assert.ok(events.includes('read:width:true'));
  assert.ok(events.includes('read:height:true'));
  // x = 450 - 0 - (82 / 2 + 18) = 391.0, y = 340 - 0 - (56 / 2 + 18) = 294.0
  assert.equal(badge.style.translate, '391.0px 294.0px');
  assert.equal(cursor.style.translate, '391.0px 294.0px');
  assert.ok(cursor.hasAttribute('data-docked'));
  assert.ok(cursor.hasAttribute('data-visible'));
});

test('keeps a fixed central cursor oval without bounce while the cylinder chases it', () => {
  const carousel = find(ast, node => hasAttribute(node, 'data-project-carousel'));
  const badgeNode = find(carousel, node => hasAttribute(node, 'data-stage-badge'));
  const cursorNode = carousel.children.find(node => hasAttribute(node, 'data-stage-cursor'));
  assert.ok(cursorNode, 'Fixed cursor element must be a direct sibling inside [data-project-carousel]');
  assert.equal(find(badgeNode, node => hasAttribute(node, 'data-stage-cursor')), undefined);
  assert.ok(cursorNode.openingElement.attributes.some(attribute =>
    attribute.name?.name === 'aria-hidden' && attribute.value?.value === 'true'));

  const cursorCss = source.match(/\.stage-cursor\s*\{([^}]+)\}/)?.[1];
  assert.ok(cursorCss, '.stage-cursor CSS rule is required');
  assert.match(cursorCss, /background-color:\s*var\(--fg\)/);
  assert.match(cursorCss, /transform:\s*rotate\(-12deg\)/);
  assert.match(cursorCss, /z-index:\s*7/);

  const reducedMotionSection = source.match(/@media \(prefers-reduced-motion: no-preference\)\s*\{\s*\.stage-badge\s*\{[\s\S]*?\.stage-cursor\s*\{([^}]+)\}/)?.[1];
  assert.ok(reducedMotionSection, 'Reduced-motion cursor transition must exist');
  assert.match(reducedMotionSection, /transition:\s*opacity 90ms ease-out;/);
  assert.doesNotMatch(reducedMotionSection, /scale|linear\(/);

  const hideFn = source.match(/    function hideBadge\(\) \{[\s\S]*?\n    \}/)?.[0];
  const stepFn = source.match(/    function stepBadge\(now: number\) \{[\s\S]*?\n    \}/)?.[0];
  const syncFn = source.match(/    function syncBadge\(snap = false\) \{[\s\S]*?\n    \}/)?.[0];
  assert.ok(hideFn && stepFn && syncFn, 'Badge tracking functions must exist');

  const badgeAttrs = new Set(['data-visible']);
  const cursorAttrs = new Set(['data-visible']);
  const badge = {
    style: { translate: '100.0px 100.0px' },
    setAttribute(name) { badgeAttrs.add(name); },
    removeAttribute(name) { badgeAttrs.delete(name); },
    hasAttribute(name) { return badgeAttrs.has(name); },
  };
  const cursor = {
    style: { translate: '100.0px 100.0px' },
    setAttribute(name) { cursorAttrs.add(name); },
    removeAttribute(name) { cursorAttrs.delete(name); },
    hasAttribute(name) { return cursorAttrs.has(name); },
  };

  const context = {
    badge,
    cursor,
    focused: { hasAttribute: name => name === 'data-focus-ready', matches: () => false },
    pointerActive: true,
    pointerX: 260,
    pointerY: 180,
    badgeX: 100,
    badgeY: 100,
    badgeTargetX: 100,
    badgeTargetY: 100,
    badgeVisible: true,
    badgeRaf: 0,
    badgeTime: 1000,
    finePointer: { matches: true },
    coarseHover: { matches: false },
    reducedMotion: { matches: false },
    stage: {
      getBoundingClientRect: () => ({ left: 0, top: 0 }),
      setAttribute() {},
      removeAttribute() {},
    },
    focusedMediaRect: () => ({ left: 0, top: 0, right: 500, bottom: 400 }),
    dockBadge() {},
    cancelAnimationFrame() {},
    requestAnimationFrame() { return 1; },
    performance: { now: () => 1000 },
  };

  runInNewContext(
    stripTypeScriptTypes(`${hideFn}\n${stepFn}\n${syncFn}\nsyncBadge(false);\nthis.afterSync = { cursorPos: cursor.style.translate, badgePos: badge.style.translate };\nstepBadge(1016);\nthis.afterStep = { cursorPos: cursor.style.translate, badgePos: badge.style.translate, badgeX, badgeY };\nhideBadge();\nthis.afterHide = { visible: cursor.hasAttribute('data-visible'), docked: cursor.hasAttribute('data-docked') };`),
    context,
  );

  assert.equal(context.afterSync.cursorPos, '260.0px 180.0px');
  assert.equal(context.afterSync.badgePos, '100.0px 100.0px');
  assert.equal(context.afterStep.cursorPos, '260.0px 180.0px');
  assert.ok(context.afterStep.badgeX > 100 && context.afterStep.badgeX < 260);
  assert.ok(context.afterStep.badgeY > 100 && context.afterStep.badgeY < 180);
  assert.equal(context.afterHide.visible, false);
  assert.equal(context.afterHide.docked, false);
});

test('renders a filling exit button inside the viewport and locks track overflow while details are open', () => {
  const carousel = find(ast, node => hasAttribute(node, 'data-project-carousel'));
  const exitBtn = carousel.children.find(node => hasAttribute(node, 'data-stage-exit'));
  assert.ok(exitBtn, 'Exit button [data-stage-exit] must be a direct sibling inside [data-project-carousel]');
  assert.equal(exitBtn.openingElement.name.name, 'button');
  assert.match(source, /:global\(\[data-details-open\]\) \.project-stage__track\s*\{[^}]*overflow-y:\s*hidden/);
  assert.match(source, /\.stage-exit__fill\s*\{[^}]*transform:\s*scaleX\(var\(--exit-progress\)\)/);
});

test('requires sustained downward scroll to fill the exit button before dismissing details and scrolling', () => {
  const block = source.match(/    const EXIT_SCROLL_THRESHOLD[\s\S]*?\n    function pushExitScroll\(rawDelta: number\) \{[\s\S]*?\n    \}/)?.[0];
  assert.ok(block, 'Exit scroll controller functions must exist');

  const btnAttrs = new Map();
  const exitButton = {
    style: {
      props: new Map(),
      setProperty(k, v) { this.props.set(k, v); },
    },
    tabIndex: -1,
    setAttribute(k, v) { btnAttrs.set(k, v); },
    removeAttribute(k) { btnAttrs.delete(k); },
    hasAttribute(k) { return btnAttrs.has(k); },
  };
  let now = 1000;
  const context = {
    exitButton,
    details: { isOpen: () => !context.dismissed, dismiss: () => { context.dismissed = true; } },
    root: { hasAttribute: () => !context.dismissed },
    focused: { id: 'project-1' },
    slides: [0, 1, 2, 3],
    candidate: 1,
    reducedMotion: { matches: false },
    track: {
      scrollTop: 200,
      setAttribute() {},
    },
    center: (i) => i * 200,
    released: false,
    dismissed: false,
    wheelStarted: false,
    releaseFocus() { context.released = true; context.dismissed = true; },
    renderScrollPosition() {},
    settle() {},
    advanceWheel() {},
    wheel: undefined,
    wheelFrame: 0,
    lastUserScroll: 0,
    performance: { now: () => now },
    cancelAnimationFrame() {},
    requestAnimationFrame() { context.wheelStarted = true; return 1; },
  };

  runInNewContext(
    stripTypeScriptTypes(`${block}
      pushExitScroll(300);
      this.afterSingleSpike = {
        progress: exitProgress,
        visible: exitButton.hasAttribute('data-visible'),
        released: this.released,
        cssProgress: exitButton.style.props.get('--exit-progress'),
      };
      pushExitScroll(120);
      this.afterTwoSteps = {
        progress: exitProgress,
        released: this.released,
      };
      pushExitScroll(120);
      this.afterSustained = {
        progress: exitProgress,
        visible: exitButton.hasAttribute('data-visible'),
        released: this.released,
        wheelStarted: this.wheelStarted,
        wheelTarget: wheel?.target,
      };
    `),
    context,
  );

  assert.ok(context.afterSingleSpike.progress > 0 && context.afterSingleSpike.progress < 0.5, 'Single spike must be capped');
  assert.equal(context.afterSingleSpike.visible, true);
  assert.equal(context.afterSingleSpike.released, false);
  assert.equal(context.afterTwoSteps.released, false);
  assert.equal(context.afterSustained.released, true);
  assert.equal(context.afterSustained.visible, false);
  assert.equal(context.afterSustained.wheelStarted, true);
  assert.equal(context.afterSustained.wheelTarget, 400);
});
