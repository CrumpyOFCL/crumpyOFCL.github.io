import { esc, val, isPending, pending, field, href } from './lib.mjs';

const TIER_TITLES = { flagship: 'Flagship', supporting: 'Supporting work', experiment: 'Experiments and prototypes' };
const TIER_NODE = { flagship: 'Final world', supporting: 'World', experiment: 'Bonus stage' };
const DISCIPLINES = ['Game Design', 'Level Design', 'Gameplay', 'UX', 'Prototyping', 'Playtesting', 'Documentation', 'Programming', 'Tools', 'Team', 'Personal', 'Fighting game', 'Character design', 'Combat design', 'Stage design', 'Ikemen GO'];
const STATUS_TEXT = { evidenced: 'Evidenced', stated: 'Described', pending: 'Pending' };
const QUEST_FROM_LEDGER = { evidenced: 'unlocked', stated: 'described', pending: 'locked' };

const GLYPH = {
  T: '11111,00100,00100,00100,00100,00100,00100',
  Y: '10001,10001,01010,00100,00100,00100,00100',
  L: '10000,10000,10000,10000,10000,10000,11111',
  E: '11111,10000,10000,11110,10000,10000,11111',
  R: '11110,10001,10001,11110,10100,10010,10001',
  C: '01111,10000,10000,10000,10000,10000,01111',
  U: '10001,10001,10001,10001,10001,10001,01110',
  M: '10001,11011,10101,10001,10001,10001,10001',
  P: '11110,10001,10001,11110,10000,10000,10000',
};

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
  const gap = 1;
  const lh = 9;
  let width = 0;
  const rows = lines.map(line => [...line]);
  for (const chars of rows) {
    const w = chars.reduce((n, ch) => n + (GLYPH[ch] ? 5 : 3) + gap, -gap);
    width = Math.max(width, w);
  }
  const height = rows.length * lh - 2;
  let rects = '';
  rows.forEach((chars, li) => {
    let x = 0;
    const y0 = li * lh;
    for (const ch of chars) {
      const g = GLYPH[ch];
      if (!g) { x += 3 + gap; continue; }
      g.split(',').forEach((row, ry) => {
        [...row].forEach((bit, rx) => {
          if (bit === '1') rects += `<rect x="${x + rx}" y="${y0 + ry}" width="1" height="1"/>`;
        });
      });
      x += 5 + gap;
    }
  });
  return `<svg class="pixel-logo" viewBox="0 0 ${width} ${height}" role="img" aria-label="Tyler Crump">${rects}</svg>`;
}

function nodeKind(p) {
  if (p.slug === 'tabi') return 'travel / multipurpose';
  return TIER_NODE[p.tier];
}

function nodeArt(p) {
  if (p.tier === 'flagship') {
    return `<span class="castle" aria-hidden="true"><i></i><i class="castle__keep"></i><i></i><b></b></span>`;
  }
  if (p.slug === 'tabi') return `<span class="suitcase" aria-hidden="true"></span>`;
  if (p.tier === 'experiment') return `<span class="bonus" aria-hidden="true"></span>`;
  return `<span class="world" aria-hidden="true"></span>`;
}

function slotFact(label, text) {
  if (!text) {
    return `<div class="slot-lock"><span class="lock" aria-hidden="true"></span> <span class="slot-lock__name">${esc(label)}</span> <span class="slot-lock__state">LOCKED</span> <span class="slot-lock__note">evidence coming</span></div>`;
  }
  return `<div class="slot-fact"><dt>${esc(label)}</dt><dd>${esc(text)}</dd></div>`;
}

function statBar(name, text) {
  if (!text) {
    return `<div class="stat stat--locked"><p class="stat__name">${esc(name)}</p><p class="stat__lock"><span class="lock" aria-hidden="true"></span> LOCKED <span class="stat__note">evidence coming</span></p><p class="visually-hidden">${esc(name)} is locked. Evidence coming. This is not a rating.</p></div>`;
  }
  return `<div class="stat"><p class="stat__name">${esc(name)}</p><div class="stat__track" role="img" aria-label="${esc(name)} confirmed: ${esc(text)}. This is not a rating."><span class="stat__fill"></span></div><p class="stat__fact">${esc(text)}</p></div>`;
}

function statsFor(p) {
  const o = p.overview || {};
  const role = confirmed(o.role);
  const team = confirmed(o.team);
  const levelOver = p.levelDesign && confirmed(p.levelDesign.overview);
  const levelStruct = p.levelDesign && confirmed(p.levelDesign.structure);
  let level = null;
  if (levelOver) level = String(levelOver);
  else if (p.slug === 'a-course-in-time' && role && /level design/i.test(role)) {
    level = levelStruct ? `${role}. ${levelStruct}` : String(role);
  }
  let systems = null;
  if (p.mechanics && !isPending(p.mechanics)) {
    systems = `Playable-build mechanics: ${val(p.mechanics).map(m => m.name).join(', ')}.`;
  } else if (p.slug === 'ikemen-go' && Array.isArray(p.process)) {
    const combat = p.process.find(s => s.stage === 'Combat systems');
    if (combat && !isPending(combat.item)) systems = String(val(combat.item));
  } else if (p.slug === 'tabi') {
    const tools = toolsOf(o.tools);
    const engine = confirmed(o.engine);
    if (engine && tools) systems = `${engine}: ${tools.join(', ')}.`;
  } else if (p.slug === 'lit-flux-mechanics-showcase') {
    const tag = confirmed(p.tagline);
    if (tag) systems = String(tag);
  }
  let collab = null;
  if (team) collab = role && String(team) !== 'Solo' ? `${team}. ${role}.` : `${team}.`;
  return { level, systems, collab, role: role && String(role), team: team && String(team) };
}

function characterCard(p) {
  const o = p.overview || {};
  const s = statsFor(p);
  const pitch = confirmed(p.tagline);
  const engine = confirmed(o.engine);
  const tools = toolsOf(o.tools);
  const equip = [];
  if (engine) equip.push(engine);
  if (tools) equip.push(...tools.filter(t => t !== engine));
  const equipHtml = equip.length
    ? `<ul class="equip" aria-label="Equipment">${equip.map(t => `<li><span class="equip__mark" aria-hidden="true"></span>${esc(t)}</li>`).join('')}</ul>`
    : slotFact('Equipment', null);
  return `<dialog class="select-card" id="card-${p.slug}" aria-labelledby="card-title-${p.slug}">
  <p class="select-card__kicker${p.slug === 'tabi' ? ' select-card__kicker--plain' : ''}">Character select · ${esc(nodeKind(p))}</p>
  <h2 id="card-title-${p.slug}">${esc(p.title)}</h2>
  <dl class="select-card__facts">
    ${s.role ? `<div class="slot-fact"><dt>Role</dt><dd>${esc(s.role)}</dd></div>` : ''}
    ${s.team ? `<div class="slot-fact"><dt>Team</dt><dd>${esc(s.team)}</dd></div>` : ''}
  </dl>
  ${s.role ? '' : slotFact('Role', null)}
  ${s.team ? '' : slotFact('Team', null)}
  <h3>Equipment</h3>
  ${equipHtml}
  <h3>Skills</h3>
  <p class="stat-note">A filled bar is a confirmed fact. A locked bar has no confirmed fact yet. This is not a rating.</p>
  ${statBar('Level design', s.level)}
  ${statBar('Systems', s.systems)}
  ${statBar('Collaboration', s.collab)}
  ${s.team === 'Solo' ? '<p class="stat-note">Solo is the confirmed team size, not a collaboration score.</p>' : ''}
  <h3>Pitch</h3>
  ${pitch ? `<p class="select-card__pitch">${esc(pitch)}</p>` : slotFact('Pitch', null)}
  <p class="select-card__actions">
    <a class="btn btn--primary" href="${projectHref(p.slug)}">START LEVEL<span class="visually-hidden">: ${esc(p.title)}</span></a>
    <button type="button" class="btn" data-close-card>Close</button>
  </p>
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
  if (evidence === 'attested') return ['progress', 'In progress', 'Tyler-attested'];
  if (evidence === 'attested-pending') return ['progress', 'In progress', 'Tyler-attested, evidence pending'];
  if (evidence === 'general') return ['progress', 'In progress', 'Tyler-attested. No single project is attached.'];
  return ['locked', 'Locked', 'evidence coming'];
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
  <div class="title-screen__inner">
    ${pixelLogo()}
    <p class="title-screen__sub">Game / Level / Gameplay Designer</p>
    <p class="press-start">PRESS START</p>
    <p class="visually-hidden">Press any key, or click, to open the map. This screen also leaves on its own. Skip to CV / Recruiter view stays at the top right.</p>
  </div>
</div>`;

  const areaOf = { 'a-course-in-time': 'castle', 'waking-nightmare': 'wn', 'tabi': 'tabi', 'ikemen-go': 'ikemen', 'sdcs-booking-app': 'sdcs', 'lit-flux-mechanics-showcase': 'lit', 'gdt2': 'gdt' };
  const nodes = path.map(p => `<button type="button" class="node node--${p.tier} node--${areaOf[p.slug] || 'x'}" data-node="${p.slug}" id="node-${p.slug}">
    ${nodeArt(p)}
    <span class="node__label">${esc(p.title)}</span>
    <span class="node__tier">${esc(nodeKind(p))}</span>
  </button>`).join('');

  const map = `<section id="map" class="map-section" aria-labelledby="map-title">
  <div class="wrap map-section__head">
    <h1 id="map-title">Tyler Crump <span class="map-section__role">Level select</span></h1>
    <p id="map-help">Each project is a level. Arrow keys or WASD walk the path. Enter, click or tap opens that project. <button type="button" class="btn btn--small" data-list-toggle aria-pressed="false" aria-controls="work">List view</button></p>
  </div>
  <div class="overworld" aria-describedby="map-help">
    <svg class="map-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="50,16 20,46 50,46 80,46 20,78 50,78 80,78"/></svg>
    <div class="avatar" data-avatar aria-hidden="true"><i></i><b></b></div>
    ${nodes}
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
  <p class="section__intro">Unlocked means a project on this site backs it. In progress means Tyler-attested, and the file is not published yet. Locked means evidence coming. A described row in the record below is a written claim, not an unlocked achievement.</p>
  <ul class="quests" role="list">${skillRows.map(r => {
    const [state, label, note] = questState(r.evidence);
    const where = r.projects.map(slug => {
      const p = vis.find(x => x.slug === slug);
      return p ? `<a href="${projectHref(p.slug)}">${esc(p.title)}</a>` : '';
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
  <ol class="method">${approach.map((s, i) => `<li class="method__step"><h3><span class="method__n" aria-hidden="true">${i + 1}</span> ${esc(s.step)}</h3><p>${esc(s.means)}</p><div class="method__ex"><span class="method__exlabel">From my work</span> ${field(s.example, esc, { inline: true })}</div></li>`).join('')}</ol>
  <div class="loop-explainer">
    <h3>How decisions are written up here</h3>
    <p>Every design decision on a project page follows the same chain. Links I can't back up yet stay empty and marked, rather than being filled in.</p>
    <ol class="loop" aria-label="Evidence chain">${loop.map(s => `<li>${s}</li>`).join('')}</ol>
  </div>
</section>`;

  const docs = `<section id="docs" class="section wrap" aria-labelledby="docs-title">
  <h2 id="docs-title" class="section__title">Documentation</h2>
  <p class="section__intro">Design writing I'll publish here. Each opens to a preview.</p>
  <ul class="docs" role="list">${site.documents.map(d => `<li><details class="doc"><summary><span class="doc__title">${esc(d.title)}</span> <span class="status status--${isPending(d.item) ? 'pending' : 'evidenced'}">${isPending(d.item) ? 'Pending' : 'Available'}</span></summary><div class="doc__body">${field(d.item)}</div></details></li>`).join('')}</ul>
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
  <div class="journal">${site.journal.map((j, i) => isPending(j) ? `<article class="journal__entry journal__entry--pending" aria-label="Journal entry ${i + 1}, evidence pending"><ol class="journal__qs"><li>What I tried</li><li>Why it failed</li><li>What I learned</li><li>What I changed</li></ol>${pending(j)}</article>` : `<article class="journal__entry">${journalBody(j)}</article>`).join('')}</div>
</section>`;

  const save = `<section id="save" class="section wrap save-file" aria-labelledby="save-title">
  <h2 id="save-title" class="section__title">Save file</h2>
  <p class="section__intro">The short version for a recruiter. The role line is the confirmed one. The title screen uses a separate subtitle.</p>
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
      ${field(site.resume, v => `<p>${esc(v)}</p><p><a class="btn" href="${href('/cv.pdf')}" download>Download CV (PDF)</a></p>`)}
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
