import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { execSync } from 'node:child_process';
import assert from 'node:assert/strict';

const word = (codes) => String.fromCharCode(...codes);
const bannedWords = [
  [97, 105],
  [103, 112, 116],
  [99, 108, 97, 117, 100, 101],
  [99, 117, 114, 115, 111, 114],
  [99, 111, 112, 105, 108, 111, 116],
  [108, 108, 109],
  [103, 101, 110, 101, 114, 97, 116, 101, 100],
  [104, 97, 110, 100, 45, 97, 110, 105, 109, 97, 116, 101, 100],
  [104, 97, 110, 100, 45, 100, 114, 97, 119, 110],
  [118, 101, 114, 99, 101, 108],
].map(word);
const packed = word([105, 107, 101, 109, 97, 110, 103, 111, 97, 115, 115]);

const textExt = new Set(['.html', '.css', '.js', '.mjs', '.json', '.md', '.txt', '.xml', '.yml', '.yaml', '.svg']);

function decode(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number(num)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/%([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function normalize(value) {
  return decode(value)
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .toLowerCase();
}

const files = execSync('git ls-files -z', { encoding: 'utf8' }).split('\0').filter(Boolean);
const hits = [];
for (const path of files) {
  if (path === 'tests/banned.test.mjs') continue;
  const targets = [normalize(path)];
  if (textExt.has(extname(path))) targets.push(normalize(readFileSync(path, 'utf8')).replace(/cursor\s*:/g, ''));
  for (const text of targets) {
    for (const banned of bannedWords) {
      const pattern = new RegExp(`(?<![a-z0-9])${banned.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')}(?![a-z0-9])`);
      if (pattern.test(text)) hits.push(`${path}: ${banned}`);
    }
    if (text.replace(/[^a-z0-9]/g, '').includes(packed)) hits.push(`${path}: packed name`);
  }
}
assert.deepEqual(hits, [], hits.join('\n'));
console.log(`banned-string scan ok (${files.length} paths)`);
