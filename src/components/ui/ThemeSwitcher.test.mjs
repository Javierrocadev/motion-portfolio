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

test('ThemeSwitcher renders an accessible segmented 3-mode control with sliding thumb and tooltip', () => {
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
  assert.match(switcherSource, /data-theme-tooltip/);
  assert.match(switcherSource, /:global\(:root\[data-theme-preference='light'\]\)/);
  assert.match(switcherSource, /:global\(:root\[data-theme-preference='dark'\]\)/);
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
