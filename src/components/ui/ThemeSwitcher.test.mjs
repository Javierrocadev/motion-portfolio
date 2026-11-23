import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parse } from '@astrojs/compiler-rs';

const switcherSource = await readFile(new URL('./ThemeSwitcher.astro', import.meta.url), 'utf8');
const leftMediaSource = await readFile(new URL('../hero/HeroLeftMedia.astro', import.meta.url), 'utf8');
const siteNavSource = await readFile(new URL('../nav/SiteNav.astro', import.meta.url), 'utf8');
const baseLayoutSource = await readFile(new URL('../../layouts/BaseLayout.astro', import.meta.url), 'utf8');
const transitionsSource = await readFile(new URL('../../styles/transitions.css', import.meta.url), 'utf8');

const { ast: switcherAst } = await parse(switcherSource);
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

function hasAttribute(node, name) {
  return (
    node.type === 'JSXElement' &&
    node.openingElement.attributes.some((attribute) => attribute.name?.name === name)
  );
}

test('ThemeSwitcher renders an accessible 3-mode control with active indicator and no tooltip', () => {
  const root = find(switcherAst, (node) => hasAttribute(node, 'data-theme-switcher'));
  assert.ok(root, 'ThemeSwitcher root element is required');
  assert.ok(
    root.openingElement.attributes.some(
      (attr) => attr.name?.name === 'role' && attr.value?.value === 'group',
    ),
    'ThemeSwitcher must expose role="group"',
  );

  const button = find(root, (node) => hasAttribute(node, 'data-theme-option'));
  assert.ok(button, 'ThemeSwitcher must render option buttons');
  assert.equal(button.openingElement.name.name, 'button');
  assert.ok(hasAttribute(button, 'aria-label'));
  assert.ok(hasAttribute(button, 'aria-pressed'));

  assert.match(switcherSource, /value:\s*'system'/);
  assert.match(switcherSource, /value:\s*'light'/);
  assert.match(switcherSource, /value:\s*'dark'/);
  assert.match(switcherSource, /theme-switcher__thumb/);
  assert.doesNotMatch(
    switcherSource,
    /data-theme-tooltip|theme-switcher__tooltip|data-theme-label|tooltipVisible/,
  );
  assert.match(switcherSource, /:global\(:root\[data-theme-preference='light'\]\)/);
  assert.match(switcherSource, /:global\(:root\[data-theme-preference='dark'\]\)/);
});

test('ThemeSwitcher collapses to the selected option and reveals alternatives to the left', () => {
  assert.match(switcherSource, /\.theme-switcher__btn\s*\{[^}]*visibility:\s*hidden/s);
  assert.match(switcherSource, /\.theme-switcher__btn\s*\{[^}]*pointer-events:\s*none/s);
  assert.match(switcherSource, /\.theme-switcher__btn\[aria-pressed='true'\]\s*\{[^}]*visibility:\s*visible/s);
  assert.match(switcherSource, /--theme-offset:\s*-2\.5rem/);
  assert.match(switcherSource, /--theme-offset:\s*-5rem/);
  assert.match(
    switcherSource,
    /\.theme-switcher__btn\[data-theme-option='system'\],\s*:global\(:root\[data-theme-preference='system'\]\)\s*\.theme-switcher__btn\[data-theme-option='light'\]\s*\{\s*--theme-offset:\s*-5rem;/,
  );
  assert.doesNotMatch(
    switcherSource,
    /\.theme-switcher__btn\[data-theme-option='dark'\]\s*[,{][^}]*--theme-offset:\s*-5rem/,
  );
  assert.match(switcherSource, /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)/);
  assert.match(switcherSource, /:has\(:focus-visible\)/);
  assert.match(switcherSource, /\[data-touch-open='true'\]/);
  assert.match(switcherSource, /event\.pointerType === 'touch'\) switcher\.dataset\.touchOpen = 'true'/);
  assert.match(switcherSource, /transform:\s*translateX\(var\(--theme-offset\)\)/);
  assert.match(switcherSource, /prefers-reduced-motion:\s*no-preference/);
  assert.doesNotMatch(switcherSource, /transition:\s*all|width\s+\d+ms/);
});

test('ThemeSwitcher is mounted at the bottom-right of HeroLeftMedia and removed from SiteNav', () => {
  assert.doesNotMatch(siteNavSource, /data-theme-select|theme-select/);

  const meta = find(
    leftMediaAst,
    (node) =>
      node.type === 'JSXElement' &&
      node.openingElement.attributes.some(
        (attr) => attr.name?.name === 'class' && attr.value?.value === 'left-media__meta',
      ),
  );
  assert.ok(meta, 'HeroLeftMedia must always render .left-media__meta');

  const switcherInLeft = find(
    meta,
    (node) => node.type === 'JSXElement' && node.openingElement.name.name === 'ThemeSwitcher',
  );
  assert.ok(switcherInLeft, 'ThemeSwitcher must be rendered inside .left-media__meta');

  assert.match(leftMediaSource, /\.left-media__meta\s*\{[^}]*inset-block-end:/);
  assert.match(leftMediaSource, /\.left-media__meta\s*\{[^}]*justify-content:\s*space-between/);
  assert.match(switcherSource, /\.theme-switcher\s*\{[^}]*margin-inline-start:\s*auto/);
});

test('BaseLayout initializes data-theme and data-theme-preference and syncs button options', () => {
  assert.match(baseLayoutSource, /root\.dataset\.themePreference\s*=\s*preference/);
  assert.match(baseLayoutSource, /root\.dataset\.theme\s*=/);
  assert.match(baseLayoutSource, /\[data-theme-option\]/);
  assert.match(baseLayoutSource, /aria-pressed/);
  assert.doesNotMatch(baseLayoutSource, /data-theme-select/);
});

test('theme switch uses View Transitions circular reveal from button origin with reduced-motion and fallback guards', () => {
  assert.match(baseLayoutSource, /document\.startViewTransition/);
  assert.match(baseLayoutSource, /prefers-reduced-motion:\s*reduce/);
  assert.match(baseLayoutSource, /root\.dataset\.themeTransition\s*=\s*'true'/);
  assert.match(baseLayoutSource, /pseudoElement:\s*'::view-transition-new\(root\)'/);
  assert.match(baseLayoutSource, /clipPath:\s*\[\s*`circle\(0px at \$\{x\}px \$\{y\}px\)`/);
  assert.match(baseLayoutSource, /if \(prevTheme === nextTheme \|\| reducedMotion\.matches\)/);

  assert.match(transitionsSource, /:root\[data-theme-transition='true'\]\s*\*\s*\{\s*view-transition-name:\s*none\s*!important;/);
  assert.match(transitionsSource, /:root\[data-theme-transition='true'\]::view-transition-new\(root\)\s*\{\s*z-index:\s*2;/);
});
