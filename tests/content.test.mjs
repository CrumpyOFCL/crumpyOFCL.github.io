import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { validate } from '../src/validate.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

const site = read('content/site.json');
const projects = readdirSync(join(root, 'content/projects'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => read(`content/projects/${f}`));

const problems = validate(site, projects);
assert.deepEqual(problems, [], `content should validate, got:\n${problems.join('\n')}`);

assert.throws(() => validate(site, [{ slug: 'Bad Slug', tier: 'nope' }]), /required|missing/);

const html = readFileSync(join(root, 'index.html'), 'utf8');
const panel = (id) => {
  const start = html.indexOf(`<section id="${id}"`);
  assert.ok(start !== -1, `panel ${id} should exist`);
  const rest = html.slice(start + 1);
  const next = rest.search(/<section id="/);
  return html.slice(start, next === -1 ? undefined : start + 1 + next);
};

assert.match(html, /<html lang="en-AU"/);
assert.doesNotMatch(html, /title-screen|recruiter-skip|overworld|tab-switch|data-switch/);
assert.doesNotMatch(html, /Steam|Unlocked|In progress|Locked|Evidence pending|LOCKED/);
assert.doesNotMatch(html, /  your /);
assert.doesNotMatch(html.replace(/https:\/\/japantrip-oeja\.onrender\.com/g, ''), /japantrip/i);

const base = 'https://crumpyofcl.github.io/';
const allowedHosts = new Set(['github.com', 'japantrip-oeja.onrender.com', 'crumpyofcl.itch.io', 'crumpyofcl.github.io']);
const attrs = [...html.matchAll(/\b(?:href|src|srcset)="([^"]*)"/g)].map((match) => match[1]);
assert.ok(attrs.length > 0, 'the page should expose href or src attributes');
for (const raw of attrs) {
  if (raw.startsWith('mailto:')) {
    assert.match(raw, /^mailto:[^\s]+@[^\s]+$/);
    continue;
  }
  const url = new URL(raw, base);
  assert.equal(url.protocol, 'https:', raw);
  assert.ok(allowedHosts.has(url.host), url.href);
  if (url.host === 'github.com') assert.match(url.pathname, /^\/CrumpyOFCL(\/|$)/);
}

const homeFiles = ['index.html', 'assets/styles.css', 'assets/app.js', 'assets/boot.js', 'img/acit-mark.webp', 'img/tabi-mark.webp'];
const bytes = homeFiles.reduce((n, file) => n + statSync(join(root, file)).size, 0);
assert.ok(bytes < 150000, `home route raw bytes ${bytes} should be under 150000`);

assert.match(html, /class="appbar-title">Tyler Crump</);
assert.match(html, /class="appbar-sub">Game designer · gameplay and tools</);
assert.match(html, /id="account-btn"/);
assert.match(html, /id="contact-sheet"/);
assert.match(html, /aria-current="page"/);
assert.match(html, /<span>ACIT<\/span><span class="visually-hidden"> \(A Course In Time\)<\/span>/);
assert.doesNotMatch(html, /role="tab|aria-selected|aria-label="A Course In Time"/);
assert.doesNotMatch(html, /PR #\d+/);
assert.doesNotMatch(html, /\u2014/);
assert.match(html, /href="#about"/);
assert.match(html, /href="#acit"/);
assert.match(html, /href="#sword-saint"/);
assert.match(html, />Sword Saint</);
assert.match(html, /href="#tabi"/);
assert.match(html, /href="#more"/);
assert.match(html, /Game development student/);

const about = panel('about');
assert.match(about, /id="about-title"[^>]*>About me</);
assert.match(about, /I design and build gameplay systems/);
assert.match(about, /href="#acit"/);
assert.match(about, /href="#sword-saint"/);
assert.match(about, /href="#tabi"/);
assert.match(about, /Play A Course In Time/);
assert.match(about, /https:\/\/crumpyofcl\.itch\.io\/a-course-in-time/);
assert.match(about, /Coming soon: CV\. Email <a href="mailto:tylercrump@outlook\.com\.au">tylercrump@outlook\.com\.au<\/a> for a copy\./);
assert.match(about, /Notepad\+\+/);
assert.match(about, /Fighter Factory Studio/);
assert.match(about, /Full skills list/);
assert.doesNotMatch(about, /badge|Unlocked/);

const acit = panel('acit');
assert.match(acit, /Producer \/ team lead, also audio, level design and programming/);
assert.match(acit, /Session 1 2026/);
assert.match(acit, /Play in browser/);
assert.match(acit, /What I designed/);
assert.match(acit, /System breakdown/);
assert.doesNotMatch(acit, /class="diagram"|class="era-pair"/);
assert.match(acit, /Logo: A Course In Time team/);
assert.match(acit, /Coming soon: code sample/);
assert.match(acit, /not a shipped storefront credit/);
assert.doesNotMatch(acit, /<pre>/);

const sword = panel('sword-saint');
assert.match(sword, /Designed by Tyler Crump/);
assert.equal(sword.split('Designed by Tyler Crump').length - 1, 1);
assert.match(sword, /Diagram of the moveset\. Not a gameplay screenshot\./);
assert.match(sword, /The Sword Saint and Unknown/);
assert.match(sword, /6-layer storm bridge/);
assert.match(sword, /Ikemen GO/);
assert.doesNotMatch(sword, /Fighter Factory Studio|Notepad\+\+/);
assert.doesNotMatch(sword, /github\.com/);
assert.doesNotMatch(sword, /<pre>/);

const tabi = panel('tabi');
assert.match(tabi, /Open Tabi/);
assert.match(tabi, /https:\/\/japantrip-oeja\.onrender\.com/);
assert.match(tabi, /Visual Studio Code/);
assert.match(tabi, /GoodNotes/);
assert.match(tabi, /Aseprite/);
assert.match(tabi, /any trip and any group/);
assert.match(tabi, /viewer and editor/);
assert.match(tabi, /Today(&#39;|')s plan/);
assert.match(tabi, /countdown/);
assert.match(tabi, /Live currency conversion/);
assert.match(tabi, /budget-ceiling warning/);
assert.match(tabi, /first real use/);
assert.match(tabi, /precise money states/);
assert.match(tabi, /Diagram of the money states\. Not a screenshot\./);
assert.doesNotMatch(tabi, /github\.com/);
assert.doesNotMatch(tabi, /<pre>/);
assert.doesNotMatch(tabi, />Mechanics</);

const more = panel('more');
assert.match(more, /id="waking-nightmare"/);
assert.match(more, /id="sdcs-booking-app"/);
assert.match(more, /id="lit-flux-mechanics-showcase"/);
assert.match(more, /id="gdt2"/);
assert.match(more, /class="play-pill"/);
assert.match(more, />Details</);
assert.match(more, /handleCalculate/);
assert.match(more, /let cost = dogRate \* dogHours \+ serviceRate \* serviceQty;/);
assert.match(more, /https:\/\/github\.com\/CrumpyOFCL\/Comp2750-Assignment/);
assert.match(more, /Handover: an in-progress build/);
assert.doesNotMatch(more, /WakingNightmareExperience/);

for (const block of html.matchAll(/<details class="still">([\s\S]*?)<\/details>/g)) {
  const count = [...block[1].matchAll(/Coming soon:/g)].length;
  assert.ok(count <= 5, `a Still to add list has ${count} items`);
}

console.log(`content ok, home raw ${bytes} B`);
