import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { parse } from '@astrojs/compiler-rs';
import { translations } from '../../i18n/translations.ts';

const processScreenSource = await readFile(
  new URL('./ProcessScreen.astro', import.meta.url),
  'utf8',
);
const interactiveCardSource = await readFile(
  new URL('../process/InteractiveButtonCard.astro', import.meta.url),
  'utf8',
);

const { ast: processAst } = await parse(processScreenSource);
const { ast: cardAst } = await parse(interactiveCardSource);

function collectElements(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (node.type === 'JSXElement') out.push(node);
  for (const value of Object.values(node)) {
    for (const child of Array.isArray(value) ? value : [value]) {
      collectElements(child, out);
    }
  }
  return out;
}

test('process translations cover evolution pipeline, 3 variants, 3 user journey cards, and 6 skills', () => {
  for (const locale of ['es', 'en']) {
    const p = translations[locale].process;
    assert.ok(p.eyebrow && p.title && p.subtitle);
    assert.ok(p.introPrimary && p.introSecondary && p.interactHint);

    assert.ok(p.evolution.title && p.evolution.sketchLabel && p.evolution.hifiLabel && p.evolution.codeLabel);
    assert.ok(p.evolution.sketchAlt && p.evolution.hifiAlt && p.evolution.cardAriaLabel);

    assert.ok(p.variants.title);
    assert.equal(p.variants.items.length, 3);
    for (const item of p.variants.items) {
      assert.ok(item.index && item.label && item.ariaLabel);
    }

    assert.ok(p.journey.eyebrow && p.journey.titleLead && p.journey.titleAccent && p.journey.description);
    assert.equal(p.journey.cards.length, 3);
    for (const card of p.journey.cards) {
      assert.ok(card.tag && card.title && card.description);
    }

    assert.ok(p.skills.eyebrow && p.skills.title && p.skills.subtitle);
    assert.equal(p.principles.length, 6);
  }
});

test('recovered process images exist on disk and are imported in ProcessScreen', async () => {
  await access(new URL('../../assets/process/mock.jpeg', import.meta.url));
  await access(new URL('../../assets/process/hifi.jpg', import.meta.url));

  assert.match(processScreenSource, /import\s+mockImage\s+from\s+['"]\.\.\/\.\.\/assets\/process\/mock\.jpeg['"]/);
  assert.match(processScreenSource, /import\s+hifiImage\s+from\s+['"]\.\.\/\.\.\/assets\/process\/hifi\.jpg['"]/);
  assert.match(processScreenSource, /<Image\b[^>]*src=\{mockImage\}/s);
  assert.match(processScreenSource, /<Image\b[^>]*src=\{hifiImage\}/s);
});

test('InteractiveButtonCard implements all 4 variants in pure CSS without nested buttons', () => {
  const elements = collectElements(cardAst);
  const buttons = elements.filter((el) => el.openingElement.name?.name === 'button');
  assert.equal(buttons.length, 1, 'InteractiveButtonCard must have exactly one <button> root without nested buttons');
  assert.ok(
    buttons[0].openingElement.attributes.some((attr) => attr.name?.name === 'aria-pressed'),
    'Card root button must expose aria-pressed',
  );

  for (const variant of ['showcase', 'scale', 'slide', 'click']) {
    assert.match(interactiveCardSource, new RegExp(`'${variant}'`));
    assert.match(interactiveCardSource, new RegExp(`\\.proto-card--${variant}`));
  }

  assert.doesNotMatch(
    interactiveCardSource,
    /group-hover:|bg-\[#3d3c3d\]|bg-\[#323132\]|drop-shadow-xl|translate-x-32|blur-\[50px\]/,
  );
  assert.match(interactiveCardSource, /prefers-reduced-motion:\s*no-preference/);
  assert.match(interactiveCardSource, /prefers-reduced-motion:\s*reduce/);
});

test('ProcessScreen wires evolution, variants, user journey, principle list, and motion guards without rounded blocks', () => {
  const elements = collectElements(processAst);
  const interactiveCards = elements.filter(
    (el) => el.openingElement.name?.name === 'InteractiveButtonCard',
  );
  assert.equal(interactiveCards.length, 2, 'ProcessScreen renders showcase card and mapped variants card');
  assert.match(processScreenSource, /variant="showcase"/);
  assert.match(processScreenSource, /variantKeys\s*=\s*\[\s*'scale'\s*,\s*'slide'\s*,\s*'click'\s*\]/);
  assert.match(processScreenSource, /t\.process\.variants\.items\.map/);

  assert.match(processScreenSource, /data-journey-grid/);
  assert.match(processScreenSource, /data-journey-highlight/);
  assert.match(processScreenSource, /data-journey-card/);

  assert.match(processScreenSource, /<ol\s+class="principles-list">/);
  assert.match(processScreenSource, /class="principle-item"/);
  assert.match(processScreenSource, /@container\s+process/);
  assert.match(processScreenSource, /prefers-reduced-motion:\s*no-preference/);
  assert.match(processScreenSource, /prefers-reduced-motion:\s*reduce/);

  assert.doesNotMatch(
    processScreenSource,
    /process-stage|interact-pill|principle-pill|principles-funnel|journey-card__glow|journey-stepper/,
  );
  assert.doesNotMatch(
    processScreenSource,
    /section-index|section-kicker|artifact-index|journey-card__index|principle-item__index|interact-hint/,
  );
});
