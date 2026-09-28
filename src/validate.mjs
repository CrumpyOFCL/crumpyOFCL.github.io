// Checks content before building so a typo can't publish half a page.
const TIERS = ['flagship', 'supporting', 'experiment'];
const STATUSES = ['confirmed', 'pending'];

export function validate(site, projects) {
  const errs = [];
  const walk = (o, path) => {
    if (!o || typeof o !== 'object') return;
    if (!Array.isArray(o) && 'status' in o) {
      if (!STATUSES.includes(o.status)) errs.push(`${path}: status must be one of ${STATUSES.join('/')}, got "${o.status}"`);
      if (o.status === 'confirmed' && !('value' in o)) errs.push(`${path}: confirmed field needs a "value"`);
      if (o.status === 'pending' && !o.request) errs.push(`${path}: pending field needs a "request" describing what to supply`);
      return;
    }
    for (const [k, v] of Object.entries(o)) if (!k.startsWith('_')) walk(v, `${path}.${k}`);
  };
  walk(site, 'site');
  const slugs = new Set();
  for (const p of projects) {
    const id = `projects/${p.slug || '?'}`;
    if (!p.slug || !/^[a-z0-9-]+$/.test(p.slug)) errs.push(`${id}: slug must be lowercase-with-dashes`);
    if (slugs.has(p.slug)) errs.push(`${id}: duplicate slug`); slugs.add(p.slug);
    if (!p.title) errs.push(`${id}: title is required`);
    if (!TIERS.includes(p.tier)) errs.push(`${id}: tier must be ${TIERS.join('/')}`);
    if (!p.overview) errs.push(`${id}: overview is required`);
    for (const k of ['role', 'team', 'timeframe']) if (p.overview && !p.overview[k]) errs.push(`${id}: overview.${k} is required (use a pending placeholder if unknown)`);
    walk(p, id);
  }
  if (projects.filter(p => p.visible && p.tier === 'flagship').length !== 1) errs.push('Exactly one visible project should be the flagship.');
  return errs;
}
