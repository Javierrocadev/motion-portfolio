import type { ProjectItem } from '../data/projects';

type ProjectDetails = Pick<ProjectItem, 'title' | 'category' | 'summary' | 'url' | 'demoUrl'>;

const SAFE_DEMO_URL = /^\/demos\/[a-z0-9._%-]+\.html$/i;

export function parseCategories(category: string): string[] {
  return String(category ?? '')
    .split(/\s*·\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatDisplayUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.replace(/^www\./i, '');
    const path = parsed.pathname.replace(/\/+$/, '');
    return path && path !== '/' ? `${host}${path}` : host;
  } catch {
    return rawUrl;
  }
}

export function serializeProjectDetails(project: ProjectDetails): string {
  const { title, category, summary, url, demoUrl } = project;
  const safeDemoUrl = demoUrl && SAFE_DEMO_URL.test(demoUrl) ? demoUrl : undefined;
  return JSON.stringify(
    safeDemoUrl
      ? { title, category, summary, url, demoUrl: safeDemoUrl }
      : { title, category, summary, url },
  );
}

export function initProjectDetails(root: HTMLElement, track: HTMLElement) {
  const panel = root.querySelector<HTMLElement>('[data-project-details-panel]');
  let selected: HTMLAnchorElement | undefined;

  function clearDemo() {
    if (!panel) return;
    const demoBox = panel.querySelector<HTMLElement>('[data-detail-demo]');
    const demoFrame = panel.querySelector<HTMLIFrameElement>('[data-detail-demo-frame]');
    if (demoBox) demoBox.hidden = true;
    if (demoFrame) {
      demoFrame.removeAttribute('src');
      demoFrame.removeAttribute('title');
    }
  }

  function dismiss(restoreFocus = false) {
    if (!selected || !panel) return;
    const previous = selected;
    selected = undefined;
    previous.removeAttribute('data-selected');
    previous.setAttribute('aria-expanded', 'false');
    root.removeAttribute('data-details-open');
    panel.setAttribute('aria-hidden', 'true');
    panel.inert = true;
    clearDemo();
    for (const selector of ['.left-media__viewport', '.left-media__meta']) {
      const media = root.querySelector<HTMLElement>(selector);
      if (media) media.hidden = false;
    }
    if (restoreFocus) previous.focus({ preventScroll: true });
  }

  track.addEventListener('click', (event) => {
    const frame = (event.target as Element | null)?.closest<HTMLAnchorElement>('[data-project-frame]');
    if (!frame) return;
    if (!frame.hasAttribute('data-focused') || !frame.hasAttribute('data-focus-ready')) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (!panel || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (selected === frame) {
      dismiss();
      return;
    }

    const details = JSON.parse(frame.dataset.projectDetails!) as ProjectDetails;
    dismiss();

    for (const field of ['title', 'summary'] as const) {
      const element = panel.querySelector<HTMLElement>(`[data-detail-${field}]`);
      if (!element) continue;
      const value = details[field] ?? '';
      element.textContent = value;
      element.hidden = !value;
    }

    const categoryEl = panel.querySelector<HTMLElement>('[data-detail-category]');
    if (categoryEl) {
      const categories = parseCategories(details.category ?? '');
      categoryEl.hidden = categories.length === 0;
      if (categoryEl.ownerDocument && typeof categoryEl.replaceChildren === 'function') {
        const chips = categories.map((label) => {
          const chip = categoryEl.ownerDocument.createElement('span');
          chip.className = 'project-details__tag';
          chip.setAttribute('role', 'listitem');
          chip.textContent = label;
          return chip;
        });
        categoryEl.replaceChildren(...chips);
      } else {
        categoryEl.textContent = categories.join(' · ');
      }
    }

    const link = panel.querySelector<HTMLAnchorElement>('[data-detail-url]');
    const linkHost = panel.querySelector<HTMLElement>('[data-detail-url-host]');
    const url = details.url && /^https?:\/\//i.test(details.url) ? details.url : '';
    if (link) {
      link.hidden = !url;
      if (url) {
        link.href = url;
        (linkHost ?? link).textContent = formatDisplayUrl(url);
      } else {
        link.removeAttribute('href');
        (linkHost ?? link).textContent = '';
      }
    }

    const demoBox = panel.querySelector<HTMLElement>('[data-detail-demo]');
    const demoFrame = panel.querySelector<HTMLIFrameElement>('[data-detail-demo-frame]');
    const demoUrl = details.demoUrl && SAFE_DEMO_URL.test(details.demoUrl) ? details.demoUrl : '';
    if (demoBox) demoBox.hidden = !demoUrl;
    if (demoFrame) {
      if (demoUrl) {
        demoFrame.setAttribute('src', demoUrl);
        demoFrame.setAttribute('title', details.title || '');
      } else {
        demoFrame.removeAttribute('src');
        demoFrame.removeAttribute('title');
      }
    }

    selected = frame;
    panel.scrollTop = 0;
    root.setAttribute('data-detail-keyboard', String(event.detail === 0));
    root.setAttribute('data-details-open', '');
    frame.setAttribute('data-selected', '');
    frame.setAttribute('aria-expanded', 'true');
    panel.inert = false;
    panel.setAttribute('aria-hidden', 'false');
    for (const selector of ['.left-media__viewport', '.left-media__meta']) {
      const media = root.querySelector<HTMLElement>(selector);
      if (media) media.hidden = true;
    }
    if (event.detail === 0) panel.focus({ preventScroll: true });
  });

  panel?.querySelector('[data-detail-close]')?.addEventListener('click', () => dismiss(true));
  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !selected) return;
    event.preventDefault();
    dismiss(true);
  });
  return { dismiss, isOpen: () => Boolean(selected) };
}
