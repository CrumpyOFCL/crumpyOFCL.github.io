// Lighthouse against the built site. Serves files with gzip, which is what
// GitHub Pages and Render do. Python's http.server does not, and that alone
// pulls the desktop performance score down.
import { createServer } from 'node:http';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import lighthouse from 'lighthouse';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'docs');
const port = 4322;
const origin = `http://127.0.0.1:${port}`;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

const server = createServer((req, res) => {
  const url = new URL(req.url, origin);
  let path = decodeURIComponent(url.pathname);
  if (path.endsWith('/')) path += 'index.html';
  const file = join(root, path.replace(/^\/+/, ''));
  if (!file.startsWith(root) || !existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
  const body = readFileSync(file);
  const ext = extname(file);
  const compressible = !['.png', '.woff2', '.jpg'].includes(ext);
  const headers = { 'content-type': types[ext] || 'application/octet-stream' };
  if (compressible) {
    const gz = gzipSync(body);
    headers['content-encoding'] = 'gzip';
    headers['content-length'] = gz.length;
    res.writeHead(200, headers);
    res.end(gz);
  } else {
    res.writeHead(200, headers);
    res.end(body);
  }
});
await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));

const pages = [
  ['home', '/'],
  ['acit', '/#acit'],
  ['tabi', '/#tabi'],
];

const flags = {
  logLevel: 'error',
  onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  formFactor: 'mobile',
  screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
};

const browser = await chromium.launch({
  args: ['--remote-debugging-port=9222', '--headless=new', '--no-sandbox', '--disable-gpu'],
});

const summary = {};
try {
  for (const [name, path] of pages) {
    summary[name] = {};
    for (const form of ['mobile', 'desktop']) {
      const mobile = form === 'mobile';
      const result = await lighthouse(`${origin}${path}`, {
        ...flags,
        port: 9222,
        formFactor: form,
        screenEmulation: mobile
          ? flags.screenEmulation
          : { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
      });
      const scores = {};
      for (const [key, cat] of Object.entries(result.lhr.categories)) {
        scores[key] = Math.round(cat.score * 100);
      }
      summary[name][form] = scores;
      console.log(`${name} ${form}:`, scores);
    }
  }
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'lighthouse-scores.json'), JSON.stringify(summary, null, 2));
} finally {
  await browser.close();
  server.close();
}
