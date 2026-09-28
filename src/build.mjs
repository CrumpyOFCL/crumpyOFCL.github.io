// Static site generator: content/*.json -> one HTML app at the repo root.
// Zero dependencies; needs Node 18+. Run: node src/build.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync, rmSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { layout, contactFrom } from './layout.mjs';
import { shell } from './shell.mjs';
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

const assetHash = createHash('sha256');
for (const rel of ['src/assets/styles.css', 'src/assets/app.js']) assetHash.update(readFileSync(join(root, rel)));
const asset = assetHash.digest('hex').slice(0, 10);

setRootFromCanonical('/');
const contact = contactFrom(site);
write('index.html', layout({
  title: 'Tyler Crump — game designer (gameplay and tools)',
  description: 'Tyler Crump is a game development student, looking for Game Designer, Level Designer, Gameplay Designer and UX/Player Experience roles. Flagship: A Course In Time.',
  body: shell(site, projects),
  page: 'home',
  canonical: '/',
  asset,
  ...contact,
}));

if (existsSync(join(out, 'projects'))) rmSync(join(out, 'projects'), { recursive: true });
for (const stale of ['assets/art', 'assets/fonts']) {
  const dir = join(out, stale);
  if (existsSync(dir)) rmSync(dir, { recursive: true });
}

copyDir(join(root, 'src/assets'), join(out, 'assets'));
copyDir(join(root, 'public'), out);
write('robots.txt', 'User-agent: *\nAllow: /\nSitemap: https://crumpyofcl.github.io/sitemap.xml\n');
write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>https://crumpyofcl.github.io/</loc></url>\n</urlset>\n');
write('.nojekyll', '');
console.log(`Built the app shell into ${out} (asset ${asset})`);
