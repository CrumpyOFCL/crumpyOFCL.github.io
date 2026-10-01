// Builds the static site from content/*.json. Node 18+, no runtime dependencies.
// OUT_DIR=_site writes to a separate folder (used by the Pages workflow); the default
// writes to the repository root so branch-based Pages hosting also works.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync, statSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { page } from './layout.mjs';
import { home, caseStudy, moved, notFound } from './pages.mjs';
import { sectionTypes } from './blocks.mjs';
import { SITE_URL } from './lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = process.env.OUT_DIR ? join(root, process.env.OUT_DIR) : root;
const readJson = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));

const site = readJson('content/site.json');
const projects = readdirSync(join(root, 'content/projects'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => readJson(`content/projects/${f}`))
  .filter((p) => p.featured !== false)
  .sort((a, b) => a.order - b.order);

// ---------- Content checks: fail the build rather than publish a broken page ----------
const problems = [];
const need = (ok, message) => { if (!ok) problems.push(message); };
const slugs = new Set();
for (const p of projects) {
  const id = p.slug || '(missing slug)';
  need(/^[a-z0-9-]+$/.test(p.slug || ''), `${id}: slug must be lowercase-with-dashes`);
  need(!slugs.has(p.slug), `${id}: duplicate slug`); slugs.add(p.slug);
  for (const key of ['title', 'kicker', 'pitch', 'description', 'role', 'contribution']) need(typeof p[key] === 'string' && p[key].trim(), `${id}: "${key}" is required`);
  need(['game', 'product'].includes(p.group), `${id}: group must be "game" or "product"`);
  need(Array.isArray(p.facts) && p.facts.some(([k]) => k === 'Tools') && p.facts.some(([k]) => k === 'Status'), `${id}: facts need at least Tools and Status`);
  need(Array.isArray(p.quick) && p.quick.length === 3, `${id}: quick needs exactly three entries`);
  need(p.cover && p.cover.src && p.cover.alt && p.cover.width && p.cover.height, `${id}: cover needs src, alt, width and height`);
  need(p.cover && existsSync(join(root, 'public', p.cover.src || '')), `${id}: cover image ${p.cover?.src} not found in public/`);
  for (const l of p.links || []) need(/^https:\/\//.test(l.url) && l.label, `${id}: links need a label and an https URL`);
  const ids = new Set();
  for (const s of p.sections || []) {
    need(sectionTypes.includes(s.type), `${id}: unknown section type "${s.type}"`);
    need(s.id && !ids.has(s.id), `${id}: section ids must be present and unique (${s.id})`); ids.add(s.id);
    need(s.kicker && s.title, `${id}/${s.id}: sections need a kicker and title`);
    if (s.type === 'screens') for (const x of s.items || []) need(x.alt && x.width && x.height && existsSync(join(root, 'public', x.src)), `${id}/${s.id}: screen needs alt, size and an existing image`);
    if (s.type === 'figure') need(s.alt && s.width && s.height && existsSync(join(root, 'public', s.src)), `${id}/${s.id}: figure needs alt, size and an existing image`);
  }
}
need(projects.some((p) => p.slug === site.start?.slug), `site.start.slug "${site.start?.slug}" is not a published project`);
for (const c of site.capabilities || []) need(slugs.has(c.slug), `capability "${c.name}" points to unknown project ${c.slug}`);
if (problems.length) {
  console.error(`Content problems:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}

// ---------- Clean previous output (only folders and pages this script owns) ----------
if (out === root) {
  for (const dir of ['assets', 'img', 'fonts']) rmSync(join(out, dir), { recursive: true, force: true });
  for (const f of readdirSync(out)) if (f.endsWith('.html')) rmSync(join(out, f));
} else {
  rmSync(out, { recursive: true, force: true });
}

const write = (path, text) => { const f = join(out, path); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, text); };
const copy = (from, to) => {
  mkdirSync(to, { recursive: true });
  for (const f of readdirSync(from)) {
    const a = join(from, f); const b = join(to, f);
    if (statSync(a).isDirectory()) copy(a, b); else copyFileSync(a, b);
  }
};

const hash = createHash('sha256');
for (const f of ['styles.css', 'app.js']) hash.update(readFileSync(join(root, 'src/assets', f)));
const asset = hash.digest('hex').slice(0, 10);

const pages = [
  ['index.html', page({ site, title: site.role, description: `${site.name}: ${site.role} in ${site.location}. Case studies covering gameplay systems in Unity, combat design, VR and product UX.`, body: home(site, projects), asset })],
  ...projects.map((p) => [`${p.slug}.html`, page({ site, title: p.title, description: p.description, path: `${p.slug}.html`, body: caseStudy(site, p, projects), asset, current: 'work' })]),
];
for (const [path, html] of pages) write(path, html);

// Old URLs keep working: each redirects to its current page.
const redirects = [
  ...projects.flatMap((p) => (p.aliases || []).map((a) => [a, `${p.slug}.html`, p.title])),
  ['opengl-desert', 'index.html#about', 'Desert Scene'],
];
for (const [from, target, title] of redirects) {
  const html = page({ site, title, description: `${title} has moved.`, path: `${from}.html`, body: moved({ title, target, text: `This page now lives at a new address.` }), asset })
    .replace('<meta name="viewport"', `<meta http-equiv="refresh" content="0; url=${target}">\n<meta name="robots" content="noindex">\n<meta name="viewport"`)
    // An instant redirect shouldn't animate: browsers abort a page transition the refresh starts.
    .replace('</head>', '<style>@view-transition { navigation: none; }</style>\n</head>');
  write(`${from}.html`, html);
}

write('404.html', page({ site, title: 'Page not found', description: 'This page could not be found.', path: '404.html', body: notFound(), asset })
  .replace('<head>', '<head>\n<base href="/">')
  .replace('<meta name="viewport"', '<meta name="robots" content="noindex">\n<meta name="viewport"'));

copy(join(root, 'src/assets'), join(out, 'assets'));
copy(join(root, 'public'), out);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(([p]) => `  <url><loc>${SITE_URL}/${p === 'index.html' ? '' : p}</loc></url>`).join('\n')}\n</urlset>\n`);
write('.nojekyll', '');

// ---------- Link check: every local href/src must exist, every #fragment must exist ----------
const all = [...pages, ...redirects.map(([f]) => [`${f}.html`, readFileSync(join(out, `${f}.html`), 'utf8')])];
const idsOf = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
for (const [path, html] of all) {
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:)/.test(url)) continue;
    const [file, frag] = url.split('#');
    const target = (file || path).split('?')[0];
    if (!existsSync(join(out, target))) throw new Error(`Broken link in ${path}: ${url}`);
    if (frag && target.endsWith('.html') && !idsOf(readFileSync(join(out, target), 'utf8')).has(frag)) throw new Error(`Missing #${frag} in ${target} (linked from ${path})`);
  }
}
console.log(`Built ${pages.length} pages, ${redirects.length} redirects and 404 into ${out === root ? 'the repository root' : out}`);
