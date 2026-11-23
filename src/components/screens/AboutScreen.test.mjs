import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { parse } from '@astrojs/compiler-rs';
import { translations } from '../../i18n/translations.ts';

const aboutSource = await readFile(new URL('./AboutScreen.astro', import.meta.url), 'utf8');
const portraitStageSource = await readFile(new URL('../about/AboutPortraitStage.astro', import.meta.url), 'utf8');
const leftMediaSource = await readFile(new URL('../hero/HeroLeftMedia.astro', import.meta.url), 'utf8');
const portfolioShellSource = await readFile(new URL('../../layouts/PortfolioShell.astro', import.meta.url), 'utf8');

const { ast: aboutAst } = await parse(aboutSource);
const { ast: portraitAst } = await parse(portraitStageSource);
const { ast: leftMediaAst } = await parse(leftMediaSource);

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

function findAll(node, predicate, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (predicate(node)) out.push(node);
  for (const value of Object.values(node)) {
    for (const child of Array.isArray(value) ? value : [value]) {
      findAll(child, predicate, out);
    }
  }
  return out;
}

function hasAttribute(node, name) {
  return (
    node.type === 'JSXElement' &&
    node.openingElement.attributes.some((attribute) => attribute.name?.name === name)
  );
}

function getAttr(node, name) {
  return node.openingElement.attributes.find((attribute) => attribute.name?.name === name);
}

test('local portrait and FLL about assets exist and are non-empty', async () => {
  const assetPaths = [
    '../../../public/images/perfil-bg.webp',
    '../../assets/about/fll1.png',
    '../../assets/about/fll2.png',
    '../../assets/about/fll3.png',
  ];

  for (const relPath of assetPaths) {
    const info = await stat(new URL(relPath, import.meta.url));
    assert.ok(info.isFile(), `${relPath} must exist as a file`);
    assert.ok(info.size > 0, `${relPath} must be non-empty`);
  }
});

test('PortfolioShell mounts portrait on HeroLeftMedia only for route === about and preloads /images/perfil-bg.webp', () => {
  assert.match(portfolioShellSource, /route === 'about'/);
  assert.match(portfolioShellSource, /src:\s*'\/images\/perfil-bg\.webp'/);
  assert.match(portfolioShellSource, /preloadImage=\{leftPortrait\?\.src\}/);
  assert.match(portfolioShellSource, /portrait=\{leftPortrait\}/);
});

test('HeroLeftMedia swaps the JR logo for AboutPortraitStage when portrait prop is supplied', () => {
  const stageNode = find(
    leftMediaAst,
    (node) => node.type === 'JSXElement' && node.openingElement.name.name === 'AboutPortraitStage',
  );
  assert.ok(stageNode, 'HeroLeftMedia must render AboutPortraitStage when portrait is set');
  assert.match(leftMediaSource, /hasPortrait && portrait/);
});

test('AboutPortraitStage renders interactive 4-circle SVG clipPath portrait with size-contained responsiveness', () => {
  const toggleBtn = find(portraitAst, (node) => hasAttribute(node, 'data-portrait-toggle'));
  assert.ok(toggleBtn, 'Portrait toggle button [data-portrait-toggle] is required');
  assert.equal(toggleBtn.openingElement.name.name, 'button');
  assert.equal(getAttr(toggleBtn, 'aria-pressed')?.value?.value, 'false');
  assert.ok(getAttr(toggleBtn, 'aria-label'), 'Portrait toggle button must have aria-label');

  const svg = find(toggleBtn, (node) => node.type === 'JSXElement' && node.openingElement.name.name === 'svg');
  assert.ok(svg, 'Portrait SVG must live inside the toggle button');

  const clipPath = find(svg, (node) => node.type === 'JSXElement' && node.openingElement.name.name === 'clipPath');
  assert.ok(clipPath, 'SVG must define a <clipPath> for the multi-circle mask');

  const circles = findAll(
    clipPath,
    (node) => node.type === 'JSXElement' && node.openingElement.name.name === 'circle',
  );
  assert.equal(circles.length, 4, 'clipPath must recover all 4 circles from javierrocadev');

  const coords = circles.map((circle) => ({
    cx: getAttr(circle, 'cx')?.value?.value,
    cy: getAttr(circle, 'cy')?.value?.value,
    r: getAttr(circle, 'r')?.value?.value,
  }));
  assert.deepEqual(coords, [
    { cx: '95', cy: '75', r: '71' },
    { cx: '31', cy: '157', r: '13' },
    { cx: '130', cy: '165', r: '15' },
    { cx: '170', cy: '135', r: '6' },
  ]);

  const clippedGroup = find(
    svg,
    (node) => node.type === 'JSXElement' && node.openingElement.name.name === 'g' && hasAttribute(node, 'clip-path'),
  );
  assert.ok(clippedGroup, 'Portrait <image> must be wrapped in a <g> bearing clip-path');

  const img = find(
    clippedGroup,
    (node) => node.type === 'JSXElement' && node.openingElement.name.name === 'image',
  );
  assert.ok(img, 'SVG <image> element is required');
  assert.equal(getAttr(img, 'preserveAspectRatio')?.value?.value, 'xMidYMid slice');

  assert.match(portraitStageSource, /\.portrait-frame:hover \.profile-circle/);
  assert.match(portraitStageSource, /\.portrait-frame:focus-visible \.profile-circle/);
  assert.match(portraitStageSource, /\.portrait-frame\[aria-pressed='true'\] \.profile-circle/);
  assert.match(portraitStageSource, /r:\s*210px;/);
  assert.match(portraitStageSource, /container-type:\s*size;/);
  assert.match(portraitStageSource, /prefers-reduced-motion:\s*no-preference/);
  assert.match(portraitStageSource, /prefers-reduced-motion:\s*reduce/);
  assert.match(portraitStageSource, /forced-colors:\s*active/);
  assert.doesNotMatch(portraitStageSource, /transition:\s*all/);
});

test('AboutScreen renders unboxed FLL gallery with plain captions, bare tags, no vertical timeline, and preserved footer controls', () => {
  assert.equal(
    find(aboutAst, (node) => hasAttribute(node, 'data-portrait-toggle')),
    undefined,
    'Right panel must not render the portrait toggle now placed in the left split pane',
  );

  assert.match(aboutSource, /\.\.\/\.\.\/assets\/about\/fll1\.png/);
  assert.match(aboutSource, /\.\.\/\.\.\/assets\/about\/fll2\.png/);
  assert.match(aboutSource, /\.\.\/\.\.\/assets\/about\/fll3\.png/);

  const gallery = find(
    aboutAst,
    (node) =>
      node.type === 'JSXElement' &&
      getAttr(node, 'class')?.value?.value === 'origin-gallery',
  );
  assert.ok(gallery, 'Origin gallery container .origin-gallery is required');

  const revealItems = findAll(gallery, (node) => hasAttribute(node, 'data-gallery-reveal'));
  assert.equal(revealItems.length, 3, 'All 3 FLL items must carry data-gallery-reveal');

  const images = findAll(
    gallery,
    (node) => node.type === 'JSXElement' && node.openingElement.name.name === 'Image',
  );
  assert.equal(images.length, 3, 'Origin gallery must render all 3 Astro <Image /> assets');

  const captions = findAll(
    gallery,
    (node) => node.type === 'JSXElement' && node.openingElement.name.name === 'figcaption',
  );
  assert.equal(captions.length, 3, 'Each FLL image must render a plain <figcaption> directly underneath');

  assert.doesNotMatch(aboutSource, /origin-card|origin-card__index|#f8f8f7/);
  assert.doesNotMatch(aboutSource, /about-timeline|chapter__node|chapter__pulse/);

  const metaTagRule = aboutSource.match(/\.meta-tag\s*\{([^}]+)\}/)?.[1];
  assert.ok(metaTagRule, '.meta-tag CSS rule must exist');
  assert.doesNotMatch(metaTagRule, /border|border-radius|background-color/);

  assert.match(aboutSource, /prefers-reduced-motion:\s*no-preference/);
  assert.match(aboutSource, /prefers-reduced-motion:\s*reduce/);
  assert.match(aboutSource, /forced-colors:\s*active/);
  assert.doesNotMatch(aboutSource, /transition:\s*all/);

  assert.match(aboutSource, /https:\/\/www\.linkedin\.com\/in\/javierrocap\//);
  assert.match(aboutSource, /https:\/\/uiverse\.io\/profile\/Javierrocadev/);
  assert.match(aboutSource, /https:\/\/github\.com\/Javierrocadev\//);

  const copyBtn = find(aboutAst, (node) => hasAttribute(node, 'data-copy-email'));
  assert.ok(copyBtn, 'Copy email button is required');
  assert.equal(getAttr(copyBtn, 'data-copy-email')?.value?.value, 'javierroca.dev@gmail.com');
  assert.ok(find(copyBtn, (node) => hasAttribute(node, 'data-copy-feedback')), 'Visual feedback span is required');

  const status = find(aboutAst, (node) => hasAttribute(node, 'data-copy-status'));
  assert.ok(status, 'Accessible live status region is required');
  assert.equal(getAttr(status, 'role')?.value?.value, 'status');
  assert.equal(getAttr(status, 'aria-live')?.value?.value, 'polite');
});

test('translations provide portrait and originGallery keys for es and en locales', () => {
  for (const locale of ['es', 'en']) {
    const about = translations[locale].about;
    assert.ok(about.portraitAlt && about.portraitAlt.length > 0, `${locale}.about.portraitAlt is required`);
    assert.ok(
      about.portraitToggleAria && about.portraitToggleAria.length > 0,
      `${locale}.about.portraitToggleAria is required`,
    );
    for (const key of [
      'tableAlt',
      'tableCaption',
      'codeAlt',
      'codeCaption',
      'trophyAlt',
      'trophyCaption',
    ]) {
      assert.ok(
        about.originGallery[key] && about.originGallery[key].length > 0,
        `${locale}.about.originGallery.${key} is required`,
      );
    }
  }
});
