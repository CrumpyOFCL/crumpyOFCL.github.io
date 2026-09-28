import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { validate } from '../src/validate.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const site = read('content/site.json');
const projects = readdirSync(join(root, 'content/projects')).filter((f) => f.endsWith('.json')).map((f) => read(`content/projects/${f}`));
assert.deepEqual(validate(site, projects), []);
assert.throws(() => validate(site, [{ slug: 'Bad Slug', tier: 'nope' }]), /required|missing/);

const html = readFileSync(join(root, 'index.html'), 'utf8');
assert.match(html, /<html lang="en-AU"/);
assert.match(html, /<h1 id="hero-title">I design the rules/);
for (const id of ['work', 'acit', 'acit-case', 'sword-saint', 'tabi', 'approach', 'other-work', 'about', 'contact']) {
  assert.match(html, new RegExp(`id="${id}"`), `missing ${id}`);
}
assert.match(html, /https:\/\/crumpyofcl\.itch\.io\/a-course-in-time/);
assert.match(html, /https:\/\/japantrip-oeja\.onrender\.com/);
assert.match(html, /paid, committed and estimated/);
assert.match(html, /client liaison/i);
assert.match(html, /in-progress build/);
assert.doesNotMatch(html, /<a[^>]*href="#"/);

const base = 'https://crumpyofcl.github.io/';
const allowedHosts = new Set(['github.com', 'japantrip-oeja.onrender.com', 'crumpyofcl.itch.io', 'crumpyofcl.github.io']);
for (const match of html.matchAll(/\b(?:href|src|srcset)="([^"]*)"/g)) {
  const raw = match[1];
  if (raw.startsWith('mailto:')) { assert.match(raw, /^mailto:[^\s]+@[^\s]+$/); continue; }
  const url = new URL(raw, base);
  assert.equal(url.protocol, 'https:', raw);
  assert.ok(allowedHosts.has(url.host), url.href);
  if (url.host === 'github.com') assert.match(url.pathname, /^\/CrumpyOFCL(\/|$)/);
}
const bytes = ['index.html', 'assets/styles.css', 'assets/app.js', 'img/acit-logo.png', 'img/tabi-mark.webp']
  .reduce((n, file) => n + statSync(join(root, file)).size, 0);
assert.ok(bytes < 200000, `home route raw bytes ${bytes} should be under 200000`);
console.log(`content ok, home raw ${bytes} B`);
