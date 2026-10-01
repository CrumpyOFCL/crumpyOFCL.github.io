// Small helpers shared by every template. No dependencies.

export const SITE_URL = 'https://crumpyofcl.github.io';

export const esc = (value = '') => String(value)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Joins template output, skipping empty values so optional content disappears cleanly.
export const join = (items, fn = (x) => x) => (items || []).map(fn).filter(Boolean).join('');

export const pad = (n) => String(n).padStart(2, '0');

export function externalLink(url, label, className = '', note = '') {
  const cls = className ? ` class="${className}"` : '';
  const small = note ? `<small>${esc(note)}</small>` : '';
  return `<a${cls} href="${esc(url)}" rel="noopener"><span>${esc(label)} <span aria-hidden="true">↗</span></span>${small}</a>`;
}

export function img({ src, alt, width, height, pixel = false, eager = false, className = '' }) {
  const cls = [className, pixel ? 'is-pixel' : ''].filter(Boolean).join(' ');
  const loading = eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
  return `<img${cls ? ` class="${cls}"` : ''} src="${esc(src)}" alt="${esc(alt)}" width="${width}" height="${height}" ${loading}>`;
}
