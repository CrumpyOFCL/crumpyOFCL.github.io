// Static site generator: content/*.json -> HTML at the repo root.
// Zero dependencies; needs Node 18+. Run: node src/build.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync, rmSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { layout } from './layout.mjs';
import { home } from './home.mjs';
import { caseStudy } from './case.mjs';
import { validate } from './validate.mjs';
import { setRootFromCanonical } from './lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = process.env.OUT_DIR ? join(root, process.env.OUT_DIR) : root;
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

const site = read('content/site.json');
const projects = readdirSync(join(root, 'content/projects')).filter(f => f.endsWith('.json'))
  .map(f => read(`content/projects/${f}`)).sort((a, b) => a.order - b.order);

const problems = validate(site, projects);
if (problems.length) { console.error('Content problems:\n- ' + problems.join('\n- ')); process.exit(1); }

const write = (p, s) => { const f = join(out, p); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, s); };
const copyDir = (from, to) => {
  if (!existsSync(from)) return;
  for (const f of readdirSync(from)) {
    const a = join(from, f), b = join(to, f);
    if (statSync(a).isDirectory()) { mkdirSync(b, { recursive: true }); copyDir(a, b); }
    else { mkdirSync(dirname(b), { recursive: true }); copyFileSync(a, b); }
  }
};

const homeNav = [
  { href: '#map', label: 'Map' },
  { href: '#work', label: 'List' },
  { href: '#skills', label: 'Quest log' },
  { href: '#save', label: 'Save file' },
  { href: '#contact', label: 'Continue?' },
];
const caseNav = [
  { href: '/index.html#map', label: 'Back to map' },
  { href: '/index.html#skills', label: 'Quest log' },
  { href: '/index.html#contact', label: 'Continue?' },
];

setRootFromCanonical('/');
write('index.html', layout({
  title: 'Tyler Crump — game designer (gameplay and tools)',
  description: 'Tyler Crump designs and builds puzzle and gameplay systems in Unity and C#. Flagship: A Course In Time, a time-switching puzzle-platformer in development.',
  body: home(site, projects), page: 'home', canonical: '/', nav: homeNav,
}));

// Clear stale case studies before writing (only inside /projects).
if (existsSync(join(out, 'projects'))) rmSync(join(out, 'projects'), { recursive: true });
for (const p of projects.filter(p => p.visible)) {
  const canonical = `/projects/${p.slug}/`;
  setRootFromCanonical(canonical);
  write(`projects/${p.slug}/index.html`, layout({
    title: `${p.title} — case study · Tyler Crump`,
    description: (p.tagline && p.tagline.value) || `${p.title} by Tyler Crump`,
    body: caseStudy(p), page: 'case', canonical, nav: caseNav,
  }));
}

copyDir(join(root, 'src/assets'), join(out, 'assets'));
copyDir(join(root, 'public'), out);
write('robots.txt', 'User-agent: *\nAllow: /\nSitemap: https://crumpyofcl.github.io/sitemap.xml\n');
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>https://crumpyofcl.github.io/</loc></url>\n${projects.filter(p => p.visible).map(p => `<url><loc>https://crumpyofcl.github.io/projects/${p.slug}/</loc></url>`).join('\n')}\n</urlset>\n`);
write('.nojekyll', '');
console.log(`Built home + ${projects.filter(p => p.visible).length} case studies into ${out}`);
