// Renders public/og.png (1200×630 social preview) from content/site.json.
// Run after changing the name, role or headline: npm run og
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(readFileSync(join(root, 'content/site.json'), 'utf8'));
// Inlined so the fonts load in a page that has no origin.
const font = (f) => `data:font/woff2;base64,${readFileSync(join(root, 'public/fonts', f)).toString('base64')}`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const row = '#####pppp###n###';
const tiles = [...row].map((c, x) => `<rect x="${x * 60}" y="0" width="56" height="56" rx="4" fill="${c === 'p' ? '#c8641e' : c === 'n' ? '#2447b8' : '#16161a'}"/>`).join('');

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face { font-family: A; src: url(${font('archivo.woff2')}); font-weight: 400 800; font-stretch: 100% 118%; }
@font-face { font-family: M; src: url(${font('jetbrains-mono.woff2')}); font-weight: 400 700; }
body { margin: 0; width: 1200px; height: 630px; background: #f3efe6; color: #16161a; font-family: A;
  background-image: linear-gradient(rgba(22,22,26,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(22,22,26,.06) 1px, transparent 1px); background-size: 30px 30px; }
.k { position: absolute; left: 72px; top: 64px; font: 500 22px M; letter-spacing: .06em; text-transform: uppercase; color: #45444c; }
h1 { position: absolute; left: 72px; top: 118px; width: 1000px; margin: 0; font-weight: 800; font-stretch: 112%; font-size: 74px; line-height: 1.02; letter-spacing: -.015em; }
svg { position: absolute; left: 72px; bottom: 60px; }
</style>
<p class="k">${esc(site.name)} · ${esc(site.role)}</p>
<h1>${esc(site.headline)}</h1>
<svg width="956" height="56" viewBox="0 0 956 56">${tiles}</svg>`;

const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: join(root, 'public/og.png') });
await browser.close();
console.log('Wrote public/og.png');
