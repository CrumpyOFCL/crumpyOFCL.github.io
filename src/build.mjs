// Static portfolio pages. Node 18+, no runtime dependencies.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { document, home, caseStudy } from './pages.mjs';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = process.env.OUT_DIR ? join(root, process.env.OUT_DIR) : root;
const projects = JSON.parse(readFileSync(join(root, 'content/portfolio.json'), 'utf8'));
if (new Set(projects.map(p => p.slug)).size !== projects.length) throw new Error('Duplicate project slug');
for (const p of projects) {
 if (!/^[a-z0-9-]+$/.test(p.slug) || !p.title || !p.contributions.length || !p.systems.length) throw new Error(`Invalid project: ${p.slug}`);
 for (const [,url] of p.links) if (!url.startsWith('https://')) throw new Error(`Invalid project link: ${url}`);
}
const write = (path, text) => { const f = join(out,path); mkdirSync(dirname(f),{recursive:true}); writeFileSync(f,text); };
const copy = (from,to) => { mkdirSync(to,{recursive:true}); for(const f of readdirSync(from)){const a=join(from,f),b=join(to,f);statSync(a).isDirectory()?copy(a,b):copyFileSync(a,b);} };
const hash = createHash('sha256');
for(const f of ['styles.css','app.js']) hash.update(readFileSync(join(root,'src/assets',f)));
const asset=hash.digest('hex').slice(0,10);
const pages=[['index.html',document({title:'Game developer · Gameplay programmer · Game designer',description:'Tyler Crump — final-year game development student in Sydney. Unity, C#, VR, graphics and product work, with detailed project case studies.',body:home(projects),asset,home:true})], ...projects.map(p=>[`${p.slug}.html`,document({title:p.title,description:p.summary,body:caseStudy(p,projects),asset,canonical:`${p.slug}.html`})])];
for (const [path,html] of pages) write(path,html);
write('404.html',document({title:'Page not found',description:'Return to Tyler Crump’s portfolio.',body:'<section class="wrap section"><p class="eyebrow">404</p><h1>Off the map.</h1><p>This page could not be found.</p><a class="button" href="https://crumpyofcl.github.io/">Back to portfolio →</a></section>',asset,canonical:'404.html'}).replace('<head>', '<head><base href="https://crumpyofcl.github.io/">'));
copy(join(root,'src/assets'),join(out,'assets'));
copy(join(root,'public'),out);
write('robots.txt','User-agent: *\nAllow: /\nSitemap: https://crumpyofcl.github.io/sitemap.xml\n');
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(([p])=>`<url><loc>https://crumpyofcl.github.io/${p==='index.html'?'':p}</loc></url>`).join('')}</urlset>\n`);
write('.nojekyll','');
for(const [path,html] of pages) for(const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
 if (/^(https?:|mailto:|#)/.test(url)) continue;
 if(!existsSync(join(out,url.split(/[?#]/)[0]))) throw new Error(`Missing link in ${path}: ${url}`);
}
console.log(`Built ${pages.length} pages + 404 into ${out}`);
