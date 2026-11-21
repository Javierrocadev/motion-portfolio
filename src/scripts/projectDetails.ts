import type { ProjectItem } from '../data/projects';

type ProjectDetails = Pick<ProjectItem, 'id' | 'index' | 'title' | 'category' | 'summary' | 'url'>;

export function serializeProjectDetails(project: ProjectDetails): string {
  const { id, index, title, category, summary, url } = project;
  return JSON.stringify({ id, index, title, category, summary, url });
}

export function initProjectDetails(root: HTMLElement, track: HTMLElement) {
  const panel = root.querySelector<HTMLElement>('[data-project-details-panel]');
  let selected: HTMLAnchorElement | undefined;

  function dismiss(restoreFocus = false) {
    if (!selected || !panel) return;
    const previous = selected;
    selected = undefined;
    previous.removeAttribute('data-selected');
    previous.setAttribute('aria-expanded', 'false');
    root.removeAttribute('data-details-open');
    panel.setAttribute('aria-hidden', 'true');
    panel.inert = true;
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
    for (const field of ['id', 'index', 'title', 'category', 'summary'] as const) {
      const element = panel.querySelector<HTMLElement>(`[data-detail-${field}]`)!;
      element.textContent = details[field];
      element.hidden = !details[field];
    }
    const link = panel.querySelector<HTMLAnchorElement>('[data-detail-url]')!;
    const url = details.url && /^https?:\/\//i.test(details.url) ? details.url : '';
    link.hidden = !url;
    link.textContent = url;
    if (url) link.href = url;
    else link.removeAttribute('href');

    selected = frame;
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
  return { dismiss };
}
