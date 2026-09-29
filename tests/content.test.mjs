import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const projects=JSON.parse(readFileSync('content/portfolio.json','utf8'));
const home=readFileSync('index.html','utf8');
assert.equal(projects.length,5);
for(const removed of ['LIT_Flux','GDT2','SDCS Booking']) assert.ok(!home.includes(removed));
assert.match(home,/36<\/strong><span>respondents across<br>three testing sessions/);
assert.match(home,/Tabi/);
for(const p of projects){
 const html=readFileSync(`${p.slug}.html`,'utf8');
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
 for(const id of ['overview','contribution','systems','process','reflection']) assert.ok(html.includes(`id="${id}"`));
 for(const [,url] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  if(/^(https?:|mailto:|#)/.test(url))continue;
  assert.ok(existsSync(url.split(/[?#]/)[0]),url);
 }
}
console.log('Five case studies, links, ownership sections, removed projects and playtest wording checked.');
