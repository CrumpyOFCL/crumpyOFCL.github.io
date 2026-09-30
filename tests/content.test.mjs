// Checks the built pages for structure, links and the accuracy rules in CONTENT-NEEDED.md.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const projects = readdirSync('content/projects').map((f) => JSON.parse(readFileSync(`content/projects/${f}`, 'utf8')));
const site = JSON.parse(readFileSync('content/site.json', 'utf8'));
const home = readFileSync('index.html', 'utf8');
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

// Four published case studies; archived prototypes stay off the site.
assert.equal(projects.length, 4);
for (const removed of ['LIT_Flux', 'GDT2', 'SDCS']) assert.ok(!home.includes(removed), `${removed} should not be on the homepage`);

// First screen: who, what, where to start, résumé and contact.
const intro = home.slice(home.indexOf('class="intro"'), home.indexOf('id="work"'));
assert.match(intro, /<h1/);
assert.ok(intro.includes(`href="${site.start.slug}.html"`), 'intro links to the start project');
assert.ok(intro.includes(`mailto:${site.contact.email}`), 'intro shows the email');
assert.ok(intro.includes(`href="${site.resume.file}"`), 'intro links the résumé');
assert.ok(existsSync(site.resume.file), 'résumé file is published');

// Accuracy: A Course In Time is a Windows download on itch.io, not a browser build.
const acit = readFileSync('a-course-in-time.html', 'utf8');
assert.ok(!/play in (the )?browser/i.test(text(home + acit)), 'A Course In Time must not claim a browser build');
for (const name of ['Uttam Pachikayala', 'Xin Hu Dobbie', 'Ruby Cant', 'Payton Saunders']) assert.ok(acit.includes(name), `team credit ${name}`);
assert.match(text(acit), /36 respondents/);

for (const p of projects) {
  const html = readFileSync(`${p.slug}.html`, 'utf8');
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${p.slug}: one h1`);
  assert.ok(html.includes('In 30 seconds'), `${p.slug}: quick summary`);
  for (const s of p.sections) assert.ok(html.includes(`id="${s.id}"`), `${p.slug}: section ${s.id}`);
  assert.ok(home.includes(`href="${p.slug}.html"`), `${p.slug}: linked from home`);
  for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|#)/.test(url)) continue;
    assert.ok(existsSync(url.split(/[?#]/)[0]), `${p.slug}: missing ${url}`);
  }
  for (const [, alt] of html.matchAll(/<img [^>]*alt="([^"]*)"/g)) assert.ok(alt.length > 10, `${p.slug}: meaningful alt text`);
  for (const tag of html.matchAll(/<img [^>]+>/g)) assert.match(tag[0], /width="\d+" height="\d+"/, `${p.slug}: images reserve their size`);
}

// Old addresses keep working.
for (const [from, to] of [['phobiavr.html', 'waking-nightmare.html'], ['opengl-desert.html', 'index.html#about']]) {
  assert.ok(readFileSync(from, 'utf8').includes(`url=${to}`), `${from} redirects to ${to}`);
}
// Tabi's demo is reachable from its case study.
assert.ok(readFileSync('tabi.html', 'utf8').includes('Try the demo trip'), 'Tabi links the demo');
console.log(`Content checks passed for ${projects.length} case studies, the homepage and redirects.`);
