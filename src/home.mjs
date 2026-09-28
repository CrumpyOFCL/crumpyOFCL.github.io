import { esc, val, isPending, pending, field, href } from './lib.mjs';

const TIER_TITLES = { flagship: 'Flagship', supporting: 'Supporting work', experiment: 'Experiments and prototypes' };
const TIER_NODE = { flagship: 'Final world', supporting: 'World', experiment: 'Bonus stage' };
const DISCIPLINES = ['Game Design', 'Level Design', 'Gameplay', 'UX', 'Prototyping', 'Playtesting', 'Documentation', 'Programming', 'Tools', 'Team', 'Personal', 'Fighting game', 'Character design', 'Combat design', 'Stage design', 'Ikemen GO'];
const STATUS_TEXT = { evidenced: 'Evidenced', stated: 'Described', pending: 'Pending' };
const QUEST_FROM_LEDGER = { evidenced: 'unlocked', stated: 'described', pending: 'locked' };

const GLYPH = {
  A: '01110,10001,10001,11111,10001,10001,10001',
  B: '11110,10001,10001,11110,10001,10001,11110',
  C: '01111,10000,10000,10000,10000,10000,01111',
  D: '11110,10001,10001,10001,10001,10001,11110',
  E: '11111,10000,10000,11110,10000,10000,11111',
  F: '11111,10000,10000,11110,10000,10000,10000',
  G: '01111,10000,10000,10111,10001,10001,01111',
  H: '10001,10001,10001,11111,10001,10001,10001',
  I: '11111,00100,00100,00100,00100,00100,11111',
  J: '00111,00010,00010,00010,00010,10010,01100',
  K: '10001,10010,10100,11000,10100,10010,10001',
  L: '10000,10000,10000,10000,10000,10000,11111',
  M: '10001,11011,10101,10001,10001,10001,10001',
  N: '10001,11001,10101,10011,10001,10001,10001',
  O: '01110,10001,10001,10001,10001,10001,01110',
  P: '11110,10001,10001,11110,10000,10000,10000',
  Q: '01110,10001,10001,10001,10101,10010,01101',
  R: '11110,10001,10001,11110,10100,10010,10001',
  S: '01111,10000,10000,01110,00001,00001,11110',
  T: '11111,00100,00100,00100,00100,00100,00100',
  U: '10001,10001,10001,10001,10001,10001,01110',
  V: '10001,10001,10001,10001,10001,01010,00100',
  W: '10001,10001,10001,10101,10101,10101,01010',
  X: '10001,10001,01010,00100,01010,10001,10001',
  Y: '10001,10001,01010,00100,00100,00100,00100',
  Z: '11111,00001,00010,00100,01000,10000,11111',
};

function pixelsFor(lines, { gap = 1, lh = 8, rowOk } = {}) {
  const cells = [];
  let width = 0;
  lines.forEach((line, li) => {
    let x = 0;
    const y0 = li * lh;
    for (const ch of line) {
      if (ch === ' ') { x += 3; continue; }
      const g = GLYPH[ch];
      if (!g) { x += 3; continue; }
      g.split(',').forEach((row, ry) => {
        if (rowOk && !rowOk(ry)) return;
        [...row].forEach((bit, rx) => { if (bit === '1') cells.push([x + rx, y0 + ry]); });
      });
      x += 5 + gap;
    }
    width = Math.max(width, Math.max(0, x - gap));
  });
  return { cells, width, height: (lines.length - 1) * lh + 7 };
}

function pathFrom(cells) {
  const byY = new Map();
  for (const [x, y] of cells) {
    if (!byY.has(y)) byY.set(y, []);
    byY.get(y).push(x);
  }
  let d = '';
  for (const [y, xs] of byY) {
    xs.sort((a, b) => a - b);
    let start = xs[0];
    let prev = xs[0];
    const flush = (a, b) => { d += `M${a} ${y}h${b - a + 1}v1H${a}z`; };
    for (let i = 1; i <= xs.length; i++) {
      if (i < xs.length && xs[i] === prev + 1) prev = xs[i];
      else { flush(start, prev); if (i < xs.length) start = prev = xs[i]; }
    }
  }
  return d;
}

function pixelLine(text, fill) {
  const { cells, width, height } = pixelsFor(text.split('\n'), { lh: 8 });
  return `<svg class="title-line" viewBox="0 0 ${width} ${height}" aria-hidden="true"><path fill="${fill}" d="${pathFrom(cells)}"/></svg>`;
}

function link(url, text, cls = '') {
  const ext = /^https?:/.test(url);
  const dest = ext || url.startsWith('mailto:') || url.startsWith('#') ? url : href(url);
  return `<a class="${cls}" href="${esc(dest)}"${ext ? ' rel="noopener"' : ''}>${text}${ext ? '<span class="visually-hidden"> (opens external site)</span>' : ''}</a>`;
}

function projectHref(slug) {
  return href(`/projects/${slug}/index.html`);
}

function confirmed(f) {
  return isPending(f) ? null : val(f);
}

function toolsOf(f) {
  const v = confirmed(f);
  if (!v) return null;
  return Array.isArray(v) ? v.map(String) : [String(v)];
}

function pixelLogo() {
  const lines = ['TYLER', 'CRUMP'];
  const top = pixelsFor(lines, { lh: 9, rowOk: (ry) => ry < 4 });
  const bot = pixelsFor(lines, { lh: 9, rowOk: (ry) => ry >= 4 });
  const all = pixelsFor(lines, { lh: 9 });
  const shadow = pathFrom(all.cells.map(([x, y]) => [x + 1, y + 1]));
  return `<svg class="pixel-logo" viewBox="0 0 ${all.width} ${all.height}" role="img" aria-label="Tyler Crump"><path fill="#7A4A10" d="${shadow}"/><path fill="#FFE9A8" d="${pathFrom(top.cells)}"/><path fill="#F2B233" d="${pathFrom(bot.cells)}"/></svg>`;
}

function nodeKind(p) {
  if (p.slug === 'tabi') return 'travel / multipurpose';
  return TIER_NODE[p.tier];
}

const ART = {
  'a-course-in-time': 'castle',
  'waking-nightmare': 'wn',
  tabi: 'tabi',
  'ikemen-go': 'ikemen',
  'sdcs-booking-app': 'sdcs',
  'lit-flux-mechanics-showcase': 'lit',
  gdt2: 'gdt',
};
const PLAYABLE = new Set(['a-course-in-time', 'lit-flux-mechanics-showcase', 'gdt2']);

function nodeArt(p) {
  const kind = ART[p.slug] || 'wn';
  const mark = `<span class="landmark landmark--${kind}" aria-hidden="true"></span>`;
  return p.slug === 'tabi' ? `<span class="suitcase">${mark}</span>` : mark;
}

function equipList(engine, tools) {
  const out = [];
  const add = (t) => {
    const n = String(t).toLowerCase();
    if (out.some(e => {
      const h = e.toLowerCase();
      return h === n || h.includes(n) || n.includes(h);
    })) return;
    out.push(String(t));
  };
  if (engine) add(engine);
  (tools || []).forEach(add);
  return out;
}

function stageLabel(p) {
  const s = confirmed(p.overview && p.overview.stage);
  return s ? String(s) : 'LOCKED · evidence coming';
}

function timeLabel(p) {
  const t = confirmed(p.overview && p.overview.timeframe);
  if (t) return String(t);
  if (p.slug === 'a-course-in-time') return 'LOCKED · dates coming';
  return 'LOCKED · evidence coming';
}

function factRow(label, text) {
  const body = text
    ? esc(text)
    : '<span class="slot-lock__state">LOCKED · evidence coming</span>';
  return `<div class="slot-fact"><dt>${esc(label)}</dt><dd>${body}</dd></div>`;
}

function characterCard(p) {
  const o = p.overview || {};
  const role = confirmed(o.role);
  const team = confirmed(o.team);
  const pitch = confirmed(p.tagline);
  const equip = equipList(confirmed(o.engine), toolsOf(o.tools));
  const equipHtml = equip.length
    ? `<ul class="equip" aria-label="Tools">${equip.map(t => `<li><span class="equip__mark" aria-hidden="true"></span>${esc(t)}</li>`).join('')}</ul>`
    : factRow('Tools', null);
  const credit = p.slug === 'ikemen-go' ? '<p class="select-card__by">Designed by Tyler Crump</p>' : '';
  return `<dialog class="select-card" id="card-${p.slug}" aria-labelledby="card-title-${p.slug}">
  <div class="select-card__layout">
    <div class="select-card__portrait" aria-hidden="true">${nodeArt(p)}</div>
    <div class="select-card__main">
      <p class="select-card__kicker${p.slug === 'tabi' ? ' select-card__kicker--plain' : ''}">Character select · ${esc(nodeKind(p))}</p>
      <h2 id="card-title-${p.slug}">${esc(p.title)}</h2>
      ${credit}
      <dl class="select-card__facts">
        ${factRow('Role', role && String(role))}
        ${factRow('Team', team && String(team))}
        ${factRow('Stage', stageLabel(p))}
        ${factRow('Timeframe', timeLabel(p))}
      </dl>
      <h3>Tools</h3>
      ${equipHtml}
      <h3>Pitch</h3>
      ${pitch ? `<p class="select-card__pitch">${esc(pitch)}</p>` : factRow('Pitch', null)}
      <p class="select-card__actions">
        <a class="btn btn--primary" href="${projectHref(p.slug)}">START LEVEL<span class="visually-hidden">: ${esc(p.title)}</span></a>
        <button type="button" class="btn" data-close-card>Close</button>
      </p>
    </div>
  </div>
</dialog>`;
}

function card(p) {
  const o = p.overview || {};
  const f = p.filters || {};
  const play = (p.links || []).find(l => !isPending(l.item) && /itch\.io/.test(val(l.item)));
  const year = f.year || 'pending';
  return `<li class="card card--${p.tier}" data-project="${p.slug}" data-disciplines="${esc((f.disciplines || []).join('|'))}" data-engine="${esc(f.engine || 'pending')}" data-type="${esc(f.type || 'pending')}" data-stage="${esc(f.stage || 'pending')}" data-year="${esc(year)}">
  <article aria-labelledby="list-${p.slug}">
    <h4 class="card__title" id="list-${p.slug}"><a href="${projectHref(p.slug)}">${esc(p.title)}</a></h4>
    <p class="card__meta">${[o.type, o.engine, o.stage].filter(x => x && !isPending(x)).map(x => esc(val(x))).join(' · ')}</p>
    <p class="card__tagline">${field(p.tagline)}</p>
    <dl class="card__facts">
      <div><dt>Role</dt><dd>${field(o.role, esc, { inline: true, label: 'Pending' })}</dd></div>
      <div><dt>Team</dt><dd>${field(o.team, esc, { inline: true, label: 'Pending' })}</dd></div>
    </dl>
    <ul class="tags" aria-label="Disciplines">${(f.disciplines || []).map(d => `<li>${esc(d)}</li>`).join('')}</ul>
    <p class="card__links"><a href="${projectHref(p.slug)}">Case study<span class="visually-hidden">: ${esc(p.title)}</span></a>${play ? link(val(play.item), 'Play / itch.io page<span class="visually-hidden">: ' + esc(p.title) + '</span>') : ''}<button type="button" class="linklike" data-open-card="${p.slug}">Open character card<span class="visually-hidden">: ${esc(p.title)}</span></button></p>
  </article>
</li>`;
}

function select(name, label, values) {
  return `<div class="filter-select"><label for="f-${name}">${label}</label><select id="f-${name}" data-filter="${name}"><option value="">Any</option>${values.map(v => `<option value="${esc(v)}">${esc(v === 'pending' ? 'Not yet confirmed' : v)}</option>`).join('')}</select></div>`;
}

function questState(evidence) {
  if (evidence === 'project') return ['unlocked', 'Unlocked', 'Backed by a project on this site.'];
  if (evidence === 'described') return ['progress', 'In progress', 'Described on the project page; artefact not published yet.'];
  if (evidence === 'attested') return ['progress', 'In progress', 'Tyler-attested'];
  if (evidence === 'attested-pending') return ['progress', 'In progress', 'Tyler-attested, evidence pending'];
  if (evidence === 'general') return ['progress', 'In progress', 'Tyler-attested. No single project is attached.'];
  return ['locked', 'Locked', 'evidence coming'];
}

function stars() {
  let n = 17;
  let html = '';
  for (let i = 0; i < 24; i++) {
    n = (n * 37 + 11) % 97;
    const left = 3 + (n % 92);
    const top = 3 + ((n * 3) % 52);
    const tw = i < 8;
    const dur = 800 + (i % 5) * 200;
    html += `<i class="star${tw ? ' star--twinkle' : ''}" style="left:${left}%;top:${top}%${tw ? `;animation-duration:${dur}ms` : ''}"></i>`;
  }
  return html;
}

export function home(site, projects) {
  const vis = projects.filter(p => p.visible).sort((a, b) => a.order - b.order);
  const flagship = vis.find(p => p.tier === 'flagship');
  const flagPlay = flagship && (flagship.links || []).find(l => !isPending(l.item) && /itch\.io/.test(val(l.item)));
  const c = site.contact;
  const uniq = (k) => [...new Set(vis.map(p => (p.filters || {})[k] || 'pending'))].sort();
  const usedDisc = DISCIPLINES.filter(d => vis.some(p => (p.filters.disciplines || []).includes(d)));
  const unusedDisc = DISCIPLINES.filter(d => !usedDisc.includes(d));
  const approach = val(site.approach);

  const path = [...vis.filter(p => p.tier === 'flagship'), ...vis.filter(p => p.tier === 'supporting'), ...vis.filter(p => p.tier === 'experiment')];

  const title = `<div class="title-screen" id="title-screen">
  <div class="title-sky" aria-hidden="true">
    ${stars()}
    <svg class="title-hotel" viewBox="0 0 96 48">
      <path fill="#0F0A06" d="M6 28h84v18H6zM16 18h64v12H16zM34 8h28v12H34zM30 18h36L48 4z"/>
      <rect class="win" x="12" y="30" width="6" height="6"/>
      <rect class="win" x="24" y="30" width="6" height="6"/>
      <rect class="win" x="36" y="30" width="6" height="6"/>
      <rect class="win" x="54" y="30" width="6" height="6"/>
      <rect class="win" x="66" y="30" width="6" height="6"/>
      <rect class="win" x="78" y="30" width="6" height="6"/>
      <rect class="door" x="44" y="32" width="8" height="14"/>
    </svg>
    <div class="title-avatar"></div>
  </div>
  <div class="title-screen__inner">
    ${pixelLogo()}
    <p class="title-screen__sub">${pixelLine('GAME DESIGNER\nGAMEPLAY AND TOOLS', '#F4E7C8')}<span class="visually-hidden">Game designer · gameplay and tools</span></p>
    <p class="press-start">${pixelLine('PRESS START', '#F2B233')}<span class="visually-hidden">PRESS START</span></p>
    <p class="visually-hidden">Press any key, or click, to open the map. This screen also leaves on its own. Recruiter view stays at the top right.</p>
  </div>
</div>`;

  const nodes = path.map(p => {
    const locked = p.slug === 'ikemen-go';
    const play = PLAYABLE.has(p.slug);
    return `<button type="button" class="node node--${p.tier} node--${ART[p.slug] || 'x'}${locked ? ' node--locked' : ''}" data-node="${p.slug}" id="node-${p.slug}">
    <span class="node__cursor" aria-hidden="true"></span>
    ${nodeArt(p)}
    ${play ? '<span class="node__flag">PLAYABLE</span>' : ''}
    ${locked ? '<span class="node__lock">LOCKED</span>' : ''}
    <span class="node__label">${esc(p.title)}</span>
    <span class="node__tier">${esc(nodeKind(p))}</span>
  </button>`;
  }).join('');

  const map = `<section id="map" class="map-section" aria-labelledby="map-title">
  <h1 id="map-title" class="visually-hidden">Tyler Crump</h1>
  <div class="overworld" aria-describedby="map-help">
    <div class="hud">
      <p class="hud__plaque">WORLD 1: TYLER CRUMP</p>
      <p class="hud__count">WORLD 1 · 7 LEVELS · 3 PLAYABLE IN BROWSER</p>
      <p id="map-help">Each project is a level. Tap or click one to see its card. On a keyboard, use the arrow keys or WASD to move and Enter to open. <button type="button" class="btn btn--small" data-list-toggle aria-pressed="false" aria-controls="work">List view</button></p>
      <p class="hud__strength">Team lead on a 5-person Unity 6 game (level design, audio, code) · Creative Director on a 5-person VR client project · Git · FMOD <a href="#save">Recruiter view →</a></p>
    </div>
    <div class="world-stage" data-stage>
      <img class="world-map" src="${href('/assets/art/map.png')}" width="320" height="180" alt="">
      <i class="lake-shimmer" aria-hidden="true"></i>
      <svg class="map-road" data-road aria-hidden="true">
        <path class="road-ink" d="" fill="none" stroke="#1C140C" stroke-width="12" stroke-linecap="square" stroke-linejoin="miter"/>
        <path class="road-fill" d="" fill="none" stroke="#C4A36A" stroke-width="8" stroke-linecap="square" stroke-linejoin="miter"/>
        <g class="road-dots"></g>
      </svg>
      <div class="avatar" data-avatar aria-hidden="true"><i></i><span class="avatar__shadow"></span></div>
      ${nodes}
    </div>
  </div>
  ${path.map(characterCard).join('\n')}
</section>`;

  const plain = `<ol class="plain-list">${path.map(p => `<li><a href="${projectHref(p.slug)}">${esc(p.title)}</a> <span class="muted">${esc(nodeKind(p))}</span></li>`).join('')}</ol>`;

  const tiers = ['flagship', 'supporting', 'experiment'].map(t => {
    const list = vis.filter(p => p.tier === t);
    if (!list.length) return '';
    return `<div class="tier tier--${t}" data-tier="${t}"><h3 class="tier__title">${TIER_TITLES[t]}</h3><ul class="cards" role="list">${list.map(card).join('')}</ul></div>`;
  }).join('');

  const work = `<section id="work" class="section wrap list-panel" aria-labelledby="work-title">
  <h2 id="work-title" class="section__title">List view</h2>
  <p class="section__intro">Every level as a plain list. The same projects sit on the map.</p>
  ${plain}
  <details class="filters" open>
    <summary>Filter projects <span class="filters__count" data-filter-count></span></summary>
    <form class="filters__form" data-filters aria-describedby="filter-status">
      <fieldset class="filters__disc">
        <legend>Discipline <span class="legend-note">(any selected)</span></legend>
        ${usedDisc.map(d => `<label class="chip"><input type="checkbox" name="discipline" value="${esc(d)}"> <span>${esc(d)}</span></label>`).join('')}
        ${unusedDisc.length ? `<p class="filters__none">No published evidence yet for: ${unusedDisc.map(esc).join(', ')}.</p>` : ''}
      </fieldset>
      <div class="filters__selects">
        ${select('engine', 'Engine', uniq('engine'))}
        ${select('type', 'Type', uniq('type'))}
        ${select('stage', 'Stage', uniq('stage'))}
        ${select('year', 'Year', uniq('year'))}
      </div>
      <p class="filters__skill" data-skill-chip hidden></p>
      <button type="reset" class="btn btn--small">Clear filters</button>
    </form>
  </details>
  <p id="filter-status" class="filter-status" role="status" aria-live="polite" data-filter-status>Showing all ${vis.length} projects.</p>
  ${tiers}
  <p class="empty" data-empty hidden>No project matches those filters yet. <button type="button" class="linklike" data-clear>Clear filters</button></p>
</section>`;

  const skillRows = site.skills.rows.filter(r => !r.hide).map(r => ({ ...r, projects: (r.projects || []).filter(s => vis.some(p => p.slug === s)) }));
  const quests = `<section id="skills" class="section wrap" aria-labelledby="skills-title">
  <h2 id="skills-title" class="section__title">Quest log</h2>
  <p class="section__intro">Unlocked means a recruiter can open the work. In progress means it is described or Tyler-attested, and the artefact is not published yet. Locked means evidence coming.</p>
  <ul class="quests" role="list">${skillRows.map(r => {
    const [state, label, note] = questState(r.evidence);
    const where = r.projects.map(slug => {
      const p = vis.find(x => x.slug === slug);
      if (!p) return '';
      const label = r.skill === 'Git' ? `${p.title} (public repo)` : p.title;
      return `<a href="${projectHref(p.slug)}">${esc(label)}</a>`;
    }).filter(Boolean).join(', ');
    const name = r.projects.length
      ? `<button type="button" class="linklike matrix__skill" data-skill="${esc(r.skill)}" data-skill-projects="${r.projects.join(' ')}">${esc(r.skill)}</button>`
      : `<span class="matrix__skill">${esc(r.skill)}</span>`;
    return `<li class="quest quest--${state}"><span class="quest__badge">${label}</span><span class="quest__body"><span class="matrix__group">${esc(r.group)}</span> ${name} <span class="quest__note">${esc(note)}</span>${where ? `<span class="quest__where">${where}</span>` : ''}</span></li>`;
  }).join('')}</ul>
</section>`;

  const rows = site.benchmark.rows;
  const counts = rows.reduce((m, r) => (m[r.level] = (m[r.level] || 0) + 1, m), {});
  const evidence = `<section id="evidence" class="section wrap" aria-labelledby="evidence-title">
  <h2 id="evidence-title" class="section__title">Design record</h2>
  <p class="section__intro">What each design skill is backed by. <strong>Evidenced</strong> means you can open it. <strong>Described</strong> means it is written here and the artefact is not public. <strong>Pending</strong> means the work is still to come. ${counts.evidenced || 0} evidenced · ${counts.stated || 0} described · ${counts.pending || 0} pending.</p>
  <ul class="quests" role="list">${rows.map(r => {
    const state = QUEST_FROM_LEDGER[r.level] || 'locked';
    const badge = state === 'unlocked' ? 'Unlocked' : state === 'described' ? 'Described' : 'Locked';
    const p = r.where && vis.find(x => x.slug === r.where);
    return `<li class="quest quest--${state}"><span class="quest__badge">${badge}</span><span class="quest__body"><span class="quest__name">${esc(r.skill)}</span> <span class="status status--${r.level}">${STATUS_TEXT[r.level]}</span> ${p ? `<a href="${projectHref(p.slug)}">${esc(p.title)}</a>` : ''} <span class="quest__note">${esc(r.note)}</span></span></li>`;
  }).join('')}</ul>
</section>`;

  const loop = ['Assumption', 'Test', 'Evidence', 'Insight', 'Decision', 'Iteration'];
  const method = `<section id="method" class="section wrap" aria-labelledby="method-title">
  <h2 id="method-title" class="section__title">How I work</h2>
  <ol class="method">${approach.map((s, i) => `<li class="method__step"><h3><span class="method__n" aria-hidden="true">${i + 1}</span> ${esc(s.step)}</h3><p>${esc(s.means)}</p><div class="method__ex"><span class="method__exlabel">From my work</span> ${field(s.example, esc, { inline: true, label: s.step })}</div></li>`).join('')}</ol>
  <div class="loop-explainer">
    <h3>How decisions are written up here</h3>
    <p>Every design decision on a project page follows the same chain. Links I can't back up yet stay empty and marked, rather than being filled in.</p>
    <ol class="loop" aria-label="Evidence chain">${loop.map(s => `<li>${s}</li>`).join('')}</ol>
  </div>
</section>`;

  const docs = `<section id="docs" class="section wrap" aria-labelledby="docs-title">
  <h2 id="docs-title" class="section__title">Documentation</h2>
  <p class="section__intro">Design writing I'll publish here. Each opens to a preview.</p>
  <ul class="docs" role="list">${site.documents.map(d => `<li><details class="doc"><summary><span class="doc__title">${esc(d.title)}</span> <span class="status status--${isPending(d.item) ? 'pending' : 'evidenced'}">${isPending(d.item) ? 'Pending' : 'Available'}</span></summary><div class="doc__body">${field(d.item, v => esc(v), { label: d.title })}</div></details></li>`).join('')}</ul>
</section>`;

  const journalBody = (j) => {
    const v = val(j);
    if (v && typeof v === 'object') {
      const bits = [['What I tried', v.tried], ['Why it failed', v.failed], ['What I learned', v.learned], ['What I changed', v.changed]];
      return `<dl class="facts facts--stack">${bits.map(([k, f]) => `<div><dt>${k}</dt><dd>${field(f, esc, { inline: true })}</dd></div>`).join('')}</dl>`;
    }
    return `<p>${esc(v)}</p>`;
  };
  const journal = `<section id="journal" class="section wrap" aria-labelledby="journal-title">
  <h2 id="journal-title" class="section__title">Designer's journal</h2>
  <p class="section__intro">What didn't work, and what I did about it. Each entry uses the same four questions. Nothing is filled in until there is a real entry.</p>
  <div class="journal">${site.journal.map((j, i) => isPending(j) ? `<article class="journal__entry journal__entry--pending" aria-label="Journal entry ${i + 1}, evidence pending"><ol class="journal__qs"><li>What I tried</li><li>Why it failed</li><li>What I learned</li><li>What I changed</li></ol>${pending(j, { label: 'Journal entry' })}</article>` : `<article class="journal__entry">${journalBody(j)}</article>`).join('')}</div>
</section>`;

  const save = `<section id="save" class="section wrap save-file" aria-labelledby="save-title">
  <h2 id="save-title" class="section__title">Save file</h2>
  <p class="section__intro">The short version: who I am, what I'm looking for, and how to reach me.</p>
  <div class="save-grid">
    <div>
      <p class="save-file__name">Tyler Crump</p>
      <p class="save-file__role">${esc(val(site.role))}</p>
      <p class="lede">${esc(val(site.lede))}</p>
      <p>${esc(val(site.intro))}</p>
      <p class="hero__cta">
        ${flagship ? `<a class="btn btn--primary" href="${projectHref(flagship.slug)}">Read the flagship case study</a>` : ''}
        ${flagPlay ? link(val(flagPlay.item), `Play ${esc(flagship.title)}`, 'btn') : ''}
        <a class="btn" href="mailto:${esc(val(c.email))}">Email me</a>
      </p>
    </div>
    <aside class="glance" aria-labelledby="glance-title">
      <h3 id="glance-title" class="glance__title">At a glance</h3>
      <dl>
        <div><dt>Looking for</dt><dd>${esc(val(site.openTo))}</dd></div>
        <div><dt>Flagship</dt><dd>${flagship ? `<a href="${projectHref(flagship.slug)}">${esc(flagship.title)}</a> — ${esc(val(flagship.overview.genre))}, ${esc(val(flagship.overview.engine))}` : ''}</dd></div>
        <div><dt>Strongest at</dt><dd>${esc(val(site.strongestSkill))}</dd></div>
        <div><dt>Tools</dt><dd>Unity 6, C#, FMOD Studio, Git</dd></div>
        <div><dt>Work</dt><dd>${link(val(c.itch), 'itch.io')} · ${link(val(c.github), 'GitHub')}</dd></div>
        <div><dt>Contact</dt><dd><a href="mailto:${esc(val(c.email))}">${esc(val(c.email))}</a></dd></div>
      </dl>
    </aside>
  </div>
  <div class="about" id="about">
    <div>
      <h3 class="section__title">About</h3>
      <p>${esc(val(site.about.body))}</p>
      ${field(site.about.education, v => `<p>${esc(v)}</p>`)}
      ${field(site.about.personal, v => `<p>${esc(v)}</p>`)}
    </div>
    <div id="resume">
      <h3 class="section__title">CV file</h3>
      <p>CV not published here yet. For now, email me at <a href="mailto:${esc(val(c.email))}">${esc(val(c.email))}</a>.</p>
    </div>
  </div>
</section>`;

  const contact = `<section id="contact" class="section wrap continue" aria-labelledby="contact-title">
  <h2 id="contact-title" class="section__title">Continue?</h2>
  <p class="contact__lead">Open to ${esc(val(site.openTo).replace(/^./, m => m.toLowerCase()).replace(/\.$/, ''))} — and happy to talk about anything on this site.</p>
  <ul class="contact" role="list">
    <li><a class="btn btn--primary" href="mailto:${esc(val(c.email))}">Email ${esc(val(c.email))}</a></li>
    <li>${link(val(c.github), 'GitHub', 'btn')}</li>
    <li>${link(val(c.itch), 'itch.io', 'btn')}</li>
    ${isPending(c.steam) ? '' : `<li>${link(val(c.steam), 'Steam', 'btn')}</li>`}
    ${isPending(c.linkedin) ? '' : `<li>${link(val(c.linkedin), 'LinkedIn', 'btn')}</li>`}
  </ul>
</section>`;

  return title + map + work + quests + evidence + method + docs + journal + save + contact;
}
