// Tiny helpers shared by every template. No dependencies.
export const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// A field is "pending" when it is {status:"pending"} (or "to-confirm"/missing).
// Anything else is published. Plain strings/arrays count as confirmed.
export const isPending = (f) =>
  f == null || (typeof f === 'object' && !Array.isArray(f) && 'status' in f && f.status !== 'confirmed');

export const val = (f) =>
  (f && typeof f === 'object' && !Array.isArray(f) && 'status' in f) ? f.value : f;

export const html = (strings, ...vals) =>
  strings.reduce((out, s, i) => out + s + (i < vals.length ? [].concat(vals[i] ?? '').join('') : ''), '');

// Public label only. The request stays in JSON and is never printed.
export function publicSlot(f, label = 'this') {
  const name = label && label !== 'Evidence pending' ? label : 'this';
  return `Coming soon: ${name}`;
}

export function pending(f, { label = 'Evidence pending', inline = false, tag } = {}) {
  const t = tag || (inline ? 'span' : 'div');
  return `<${t} class="pending${inline ? ' pending--inline' : ''}"><span class="pending__label">${esc(publicSlot(f, label))}</span></${t}>`;
}

// Render a field: value through fn, or the placeholder.
export function field(f, fn = (v) => esc(v), opts) {
  return isPending(f) ? pending(f, opts) : fn(val(f));
}

export const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function countPending(obj) {
  let n = 0;
  (function walk(o, key) {
    if (key && key.startsWith('_')) return;
    if (o && typeof o === 'object') {
      if (!Array.isArray(o) && 'status' in o) { if (o.status !== 'confirmed') n++; return; }
      for (const [k, v] of Object.entries(o)) walk(v, k);
    }
  })(obj);
  return n;
}

// Root-absolute paths ("/projects/…") become relative to the page being
// rendered, so a preview host that is not the domain root still loads CSS,
// images and case studies. External, mailto and hash-only links pass through.
let rootPrefix = '';

export function setRootFromCanonical(canonical) {
  const depth = !canonical || canonical === '/' ? 0 : canonical.split('/').filter(Boolean).length;
  rootPrefix = '../'.repeat(depth);
}

export function href(path) {
  const s = String(path ?? '');
  if (!s.startsWith('/')) return s;
  return rootPrefix + s.slice(1);
}
