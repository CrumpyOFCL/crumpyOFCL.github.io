import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { validate } from '../src/validate.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

const site = read('content/site.json');
const projects = readdirSync(join(root, 'content/projects'))
  .filter(f => f.endsWith('.json'))
  .map(f => read(`content/projects/${f}`));

const problems = validate(site, projects);
assert.deepEqual(problems, [], `content should validate, got:\n${problems.join('\n')}`);

const bad = validate(site, [{ slug: 'Bad Slug', tier: 'nope' }]);
assert.ok(bad.length > 0, 'malformed project should fail validation');

const html = readFileSync(join(root, 'index.html'), 'utf8');
const slice = (name) => {
  const start = html.indexOf(`<!-- panel:${name} -->`);
  const end = html.indexOf(`<!-- /panel:${name} -->`);
  assert.ok(start !== -1 && end > start, `panel ${name} should be marked`);
  return html.slice(start, end);
};
const card = (slug) => {
  const start = html.indexOf(`<!-- card:${slug} -->`);
  const end = html.indexOf(`<!-- /card:${slug} -->`);
  assert.ok(start !== -1 && end > start, `card ${slug} should be marked`);
  return html.slice(start, end);
};

const banned = ['japantrip-alpha', 'comp2000', 'Godot', 'Jira', '>Steam<', 'href="/assets/', 'src="/img/', 'IkemanGoAss', 'Ikeman Go Ass'];
for (const needle of banned) assert.equal(html.includes(needle), false, `index should not contain ${needle}`);
assert.match(html, /<html lang="en"/);
assert.match(html, /Evidence pending|evidence pending|evidence coming|Coming soon|LOCKED/i);
assert.doesNotMatch(html, /title-screen|recruiter-skip|overworld|tab-switch|data-switch/);
assert.doesNotMatch(html.replace(/https:\/\/japantrip-oeja\.onrender\.com/g, ''), /japantrip/i);

const bytes = ['index.html', 'assets/styles.css', 'assets/app.js']
  .reduce((n, f) => n + statSync(join(root, f)).size, 0);
assert.ok(bytes < 150000, `home route raw bytes ${bytes} should be under 150000`);

assert.match(html, /class="appbar-title">Tyler Crump</);
assert.match(html, /class="appbar-sub">Game designer · gameplay and tools</);
assert.match(html, /id="account-btn"/);
assert.match(html, /id="contact-sheet"/);
assert.match(html, /href="#about"/);
assert.match(html, /href="#acit"/);
assert.match(html, /href="#sword-saint"/);
assert.match(html, />Sword Saint</);
assert.match(html, /href="#tabi"/);
assert.match(html, /href="#more"/);
assert.doesNotMatch(html, /class="tab tab-switch"|tabbar-add/);

const about = slice('about');
assert.match(about, /id="about-title">About me</);
assert.match(about, /Game Designer, Level Designer, Gameplay Designer and UX\/Player Experience roles/);
assert.match(about, /Team lead on a 5-person Unity 6 game/);
assert.match(about, /Creative Director on a 5-person VR client project/);
assert.match(about, /data-skill="Notepad\+\+"/);
assert.match(about, /data-skill="Fighter Factory Studio"/);
assert.match(about, /data-skill="Character and moveset design"/);
assert.match(about, /data-skill="Combat design"/);
assert.match(about, /data-skill="Stage design"/);
assert.match(about, /data-skill="Git"/);
assert.match(about, /https:\/\/github\.com\/CrumpyOFCL\/Comp2750-Assignment/);
assert.match(about, /Coming soon: Education/);
assert.match(about, /CV not published here yet/);
assert.match(about, /mailto:tylercrump@outlook\.com\.au/);
assert.match(about, /Unlocked/);
assert.match(about, /In progress/);
assert.match(about, /Described on the project page; artefact not published yet/);
assert.match(about, /Locked/);
assert.match(about, /Still to add/);
assert.doesNotMatch(about, /Hand animation/);
assert.doesNotMatch(about, /\bAI opponents\b/);

const acit = slice('acit');
assert.match(acit, /<h1 class="page-title" id="acit-title">A Course In Time<\/h1>/);
assert.match(acit, /not a shipped storefront credit/);
assert.match(acit, /How many eras/);
assert.match(acit, /illustration, not a level/);
assert.match(acit, /https:\/\/crumpyofcl\.itch\.io\/a-course-in-time/);
assert.match(acit, /Switch time/);

const wn = card('waking-nightmare');
assert.match(wn, /Waking Nightmare Experience/);
assert.match(wn, /Client handover/);
assert.match(wn, /What happened/);
assert.match(wn, /The project was delivered to the client unfinished, for them to clean up/);
assert.doesNotMatch(wn, /shipped|released/i);

const tabi = slice('tabi');
assert.match(tabi, /<h1 class="page-title" id="tabi-title">Tabi<\/h1>/);
assert.match(tabi, /https:\/\/japantrip-oeja\.onrender\.com/);
assert.match(tabi, /Open Tabi/);
assert.match(tabi, /Designer and developer/);
assert.match(tabi, /any trip and any group/);
assert.match(tabi, /viewer and editor/);
assert.match(tabi, /Today(?:'|&#39;)s plan/);
assert.match(tabi, /countdown/);
assert.match(tabi, /Live currency conversion/);
assert.match(tabi, /budget-ceiling warning/);
assert.match(tabi, /first real use/);
assert.match(tabi, /precise money states/);
assert.match(tabi, /PR #56/);
assert.match(tabi, /PR #59/);
assert.doesNotMatch(tabi, /Japan Trip Planner/);
assert.doesNotMatch(tabi.replace(/https:\/\/japantrip-oeja\.onrender\.com/g, ''), /japantrip/i);
assert.doesNotMatch(tabi, /github\.com\/CrumpyOFCL\/japantrip/i);
assert.doesNotMatch(tabi, /vercel/i);
assert.doesNotMatch(tabi, /\bmechanics\b|\bshipped\b/i);

const ikemen = slice('sword-saint');
assert.match(ikemen, /<h1 class="page-title" id="sword-saint-title">Sword Saint: Broken Bridge<\/h1>/);
assert.match(ikemen, /built in Ikemen GO/);
assert.match(ikemen, /Designed by Tyler Crump/);
assert.match(ikemen, /open-source fighting game engine/);
assert.match(ikemen, /mirror fighter/);
assert.match(ikemen, /two-projectile lightning special/);
assert.match(ikemen, /timed perfect block/);
assert.match(ikemen, /Fighter Factory Studio \(sprites and animation\)/);
assert.match(ikemen, /Notepad\+\+ \(editing character and stage files\)/);
assert.match(ikemen, /animated lightning and rain/);
assert.match(ikemen, /Supporting project/);
assert.match(ikemen, /Solo designer/);
assert.equal((ikemen.match(/Designed by Tyler Crump/g) || []).length, 1);
assert.doesNotMatch(ikemen, /hand-animated|hand-drawn|every frame/i);
assert.doesNotMatch(ikemen, /\bAI\b/);
assert.doesNotMatch(ikemen, /\bgeneration\b|\bpipeline\b/i);
assert.doesNotMatch(ikemen, /Aseprite/);
assert.doesNotMatch(ikemen, /github\.com\/CrumpyOFCL\/IkemanGoAss/i);
assert.doesNotMatch(ikemen, /IkemanGoAss|Ikeman Go Ass/);
assert.doesNotMatch(ikemen, /PLAYABLE/);

const more = slice('more');
const moreOrder = ['waking-nightmare', 'sdcs-booking-app', 'lit-flux-mechanics-showcase', 'gdt2'];
let at = 0;
for (const slug of moreOrder) {
  const i = more.indexOf(`id="${slug}"`);
  assert.ok(i > at, `${slug} should follow the previous More card`);
  at = i;
}
assert.match(card('sdcs-booking-app'), /https:\/\/github\.com\/CrumpyOFCL\/Comp2750-Assignment/);
assert.match(card('lit-flux-mechanics-showcase'), /https:\/\/crumpyofcl\.itch\.io\/lit-flux-mechanics-showcasae/);
assert.match(card('gdt2'), /https:\/\/crumpyofcl\.itch\.io\/gdt2/);
assert.doesNotMatch(html, /Source: Owner|source: Owner/);

console.log(`content ok — ${projects.length} projects, home raw bytes ${bytes}`);
