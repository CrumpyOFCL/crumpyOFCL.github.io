import { readFileSync, readdirSync } from 'node:fs';
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

const htmlFiles = ['index.html', ...projects.filter(p => p.visible).map(p => `projects/${p.slug}/index.html`)];
const banned = [
  'japantrip-alpha',
  'comp2000',
  'Godot',
  'Jira',
  '>Steam<',
  'href="/assets/',
  'src="/img/',
];
for (const file of htmlFiles) {
  const html = readFileSync(join(root, file), 'utf8');
  for (const needle of banned) {
    assert.equal(html.includes(needle), false, `${file} should not contain ${needle}`);
  }
  assert.match(html, /<html lang="en"/);
  assert.match(html, /Evidence pending|evidence pending|evidence coming|Coming soon|LOCKED/i);
}

const tabi = readFileSync(join(root, 'projects/tabi/index.html'), 'utf8');
assert.match(tabi, /<h1>Tabi<\/h1>/);
assert.match(tabi, /https:\/\/japantrip-oeja\.onrender\.com/);
assert.match(tabi, /Designer and developer/);
assert.match(tabi, /any trip and any group/);
assert.match(tabi, /viewer and editor/);
assert.match(tabi, /Today(?:'|&#39;)s plan/);
assert.match(tabi, /countdown/);
assert.match(tabi, /Live currency conversion/);
assert.match(tabi, /budget-ceiling warning/);
assert.match(tabi, /first real use/);
assert.doesNotMatch(tabi, /Japan Trip Planner/);
assert.doesNotMatch(tabi.replace(/https:\/\/japantrip-oeja\.onrender\.com/g, ''), /japantrip/i);
assert.doesNotMatch(tabi, /github\.com\/CrumpyOFCL\/japantrip/i);
assert.doesNotMatch(tabi, /vercel/i);

const acit = readFileSync(join(root, 'projects/a-course-in-time/index.html'), 'utf8');
assert.match(acit, /not a shipped storefront credit/);
assert.match(acit, /How many eras/);
assert.match(acit, /illustration, not a level/);

const wn = readFileSync(join(root, 'projects/waking-nightmare/index.html'), 'utf8');
assert.match(wn, /Client handover/);
assert.doesNotMatch(wn, /shipped|released/i);

const ikemen = readFileSync(join(root, 'projects/ikemen-go/index.html'), 'utf8');
assert.match(ikemen, /IkemanGoAss/);
assert.match(ikemen, /Designed by Tyler Crump/);
assert.match(ikemen, /open-source fighting game engine/);
assert.match(ikemen, /mirror fighter/);
assert.match(ikemen, /two-projectile lightning special/);
assert.match(ikemen, /timed perfect block/);
assert.match(ikemen, /Fighter Factory Studio \(sprites and animation\)/);
assert.match(ikemen, /Notepad\+\+ \(editing character and stage files\)/);
assert.match(ikemen, /animated lightning and rain/);
assert.match(ikemen, /Supporting project/);
assert.doesNotMatch(ikemen, /hand-animated|hand-drawn|every frame/i);
assert.doesNotMatch(ikemen, /\bAI\b/);
assert.doesNotMatch(ikemen, /\bgeneration\b|\bpipeline\b/i);
assert.doesNotMatch(ikemen, /Aseprite/);
assert.doesNotMatch(ikemen, /github\.com\/CrumpyOFCL\/IkemanGoAss/i);
assert.match(ikemen, /Solo designer/);
assert.equal((ikemen.match(/Designed by Tyler Crump/g) || []).length, 1);
assert.doesNotMatch(tabi, /\bmechanics\b|\bshipped\b/i);
assert.doesNotMatch(wn, /shipped|released/i);

const home = readFileSync(join(root, 'index.html'), 'utf8');
assert.match(home, /node__label">Tabi</);
assert.match(home, /travel \/ multipurpose/);
assert.match(home, /class="suitcase"/);
assert.doesNotMatch(home, /Japan Trip Planner/);
assert.match(home, /data-skill="Notepad\+\+"/);
assert.match(home, /data-skill="Fighter Factory Studio"/);
assert.doesNotMatch(home, /Hand animation/);
assert.doesNotMatch(home, /\bAI opponents\b/);
assert.match(home, /data-skill="Character and moveset design"/);
assert.match(home, /data-skill="Combat design"/);
assert.match(home, /data-skill="Stage design"/);

console.log(`content ok — ${projects.length} projects, ${htmlFiles.length} pages scanned`);
