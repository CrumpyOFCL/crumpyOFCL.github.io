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
const outDir = join(root, 'test-results');
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
  const compressible = !['.png', '.woff2', '.jpg', '.txt'].includes(ext);
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
const robotsResponse = await fetch(`${origin}/robots.txt`);
const robotsText = await robotsResponse.text();
if (!robotsResponse.ok || !robotsText.includes('User-agent: *') || !robotsText.includes('Allow: /')) {
  throw new Error('Local robots.txt is missing or invalid');
}

const pages = [['home', '/'], ['a-course-in-time', '/a-course-in-time.html']];

const flags = {
  logLevel: 'error',
  onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  // Chrome's protocol resource fetch can fail for localhost; the file is checked above.
  skipAudits: ['robots-txt'],
  formFactor: 'mobile',
  screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
};

const browser = await chromium.launch({
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
  args: ['--remote-debugging-port=9222', '--headless=new', '--no-sandbox', '--disable-gpu'],
});

const summary = {};
let failed = false;
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
      if (process.env.LH_DEBUG) for (const id of ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index', 'largest-contentful-paint-element']) console.log('  ', id, result.lhr.audits[id].displayValue || JSON.stringify(result.lhr.audits[id].details?.items?.[0]?.items?.[0]?.node?.snippet || ''));
      console.log(`${name} ${form}:`, scores);
      for (const audit of Object.values(result.lhr.audits)) {
        if (audit.score !== null && audit.score < 1 && audit.id && result.lhr.categories.seo.auditRefs.some((ref) => ref.id === audit.id)) {
          console.log(`SEO audit ${audit.id}: ${audit.title} — ${audit.explanation || audit.displayValue || ''}`);
        }
      }
      const performanceFloor = 90;
      const otherFloor = 95;
      for (const [key, score] of Object.entries(scores)) {
        const floor = key === 'performance' ? performanceFloor : otherFloor;
        if (score < floor) {
          console.error(`${name} ${form} ${key} ${score} is below ${floor}`);
          failed = true;
        }
      }
    }
  }
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'lighthouse-scores.json'), JSON.stringify(summary, null, 2));
  if (failed) process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
