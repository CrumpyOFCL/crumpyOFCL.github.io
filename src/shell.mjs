// One-page app shell. Panels are the five tabs; smaller work expands on More.
import { esc, val, isPending, field, publicSlot, href } from './lib.mjs';

const TIER = {
  flagship: 'Flagship project',
  supporting: 'Supporting project',
  experiment: 'Experiment / prototype',
};
const NON_GAME = new Set(['tabi', 'sdcs-booking-app']);
const MORE = ['waking-nightmare', 'sdcs-booking-app', 'lit-flux-mechanics-showcase', 'gdt2'];

const NAME = {
  'a-course-in-time': 'A Course In Time',
  'sword-saint-broken-bridge': 'Sword Saint',
  tabi: 'Tabi',
  'waking-nightmare': 'Waking Nightmare Experience',
  'sdcs-booking-app': 'SDCS Booking App',
  'lit-flux-mechanics-showcase': 'LIT_Flux Mechanics Showcase',
  gdt2: 'GDT2',
};
const OPEN = {
  'a-course-in-time': ['A Course In Time', 'https://crumpyofcl.itch.io/a-course-in-time'],
  'lit-flux-mechanics-showcase': ['LIT_Flux Mechanics Showcase', 'https://crumpyofcl.itch.io/lit-flux-mechanics-showcasae'],
  'gdt2': ['GDT2', 'https://crumpyofcl.itch.io/gdt2'],
  'waking-nightmare': ['Waking Nightmare Experience', 'https://crumpyofcl.itch.io/waking-nightmare'],
  tabi: ['Tabi', 'https://japantrip-oeja.onrender.com'],
  'sdcs-booking-app': ['SDCS Booking App', 'https://github.com/CrumpyOFCL/Comp2750-Assignment'],
};
const ROUTE = {
  'a-course-in-time': '#acit',
  'sword-saint-broken-bridge': '#sword-saint',
  tabi: '#tabi',
  'waking-nightmare': '#waking-nightmare',
  'sdcs-booking-app': '#sdcs-booking-app',
  'lit-flux-mechanics-showcase': '#lit-flux-mechanics-showcase',
  gdt2: '#gdt2',
};

const ext = (url, text) => `<a href="${esc(url)}" rel="noopener">${esc(text)}<span class="visually-hidden"> (opens external site)</span></a>`;

function slotLine(label, f) {
  const slot = publicSlot(f, label);
  if (slot === `Coming soon: ${label}`) return slot;
  return `${label} — ${slot}`;
}

function notes() {
  const seen = new Set();
  const items = [];
  return {
    add(label, f) {
      if (f == null || !isPending(f)) return;
      const line = slotLine(label, f);
      if (seen.has(line)) return;
      seen.add(line);
      items.push(line);
    },
    list: () => items,
  };
}

function text(v) {
  return esc(Array.isArray(v) ? v.join(', ') : v);
}

function row(label, f, note, { always = false } = {}) {
  if (f == null) return '';
  if (isPending(f)) {
    if (always) return `<div><dt>${esc(label)}</dt><dd>${field(f, text, { inline: true, label })}</dd></div>`;
    note.add(label, f);
    return '';
  }
  return `<div><dt>${esc(label)}</dt><dd>${text(val(f))}</dd></div>`;
}

function eraDiagram() {
  const cells = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
    let k = 'empty';
    if (r === 3) k = 'floor';
    if (c === 5 && (r === 1 || r === 2)) k = 'wall';
    if (c === 6 && r === 1) k = 'platform';
    if (c === 2 && r === 2) k = 'crate';
    if (c === 0 && r === 2) k = 'player';
    cells.push(`<span class="dg__cell dg__cell--${k}"></span>`);
  }
  return `<figure class="diagram">
  <div class="diagram__controls" role="group" aria-label="Show the room in">
    <button type="button" class="era__btn" data-dg="past" aria-pressed="true">Past</button>
    <button type="button" class="era__btn" data-dg="present" aria-pressed="false">Present</button>
  </div>
  <div class="dg" data-dg-state="past" aria-hidden="true">${cells.join('')}</div>
  <figcaption>
    <p class="diagram__desc" aria-live="polite" data-dg-desc>Past: a wall blocks the way. The crate has just been pushed into place.</p>
    <p class="diagram__note">Diagram of the rule as I describe it. It is an illustration, not a level from the game.</p>
  </figcaption>
</figure>`;
}

function hero(p) {
  if (p.cover && !isPending(p.cover)) {
    const v = val(p.cover);
    return `<img class="hero" src="${esc(href(v.src))}" alt="${esc(v.alt || p.title)}" decoding="async" loading="lazy">`;
  }
  return `<div class="hero hero--empty"><span>Coming soon: cover image</span></div>`;
}

function actions(p, note) {
  const links = p.links || [];
  const ready = links.filter(l => l.item && !isPending(l.item));
  links.filter(l => l.item && isPending(l.item)).forEach(l => note.add(l.label, l.item));
  if (!ready.length) return '';
  return `<div class="screen-actions">${ready.map(l => ext(val(l.item), l.label)).join('')}</div>`;
}

function chips(tools) {
  const list = Array.isArray(tools) ? tools : String(tools).split(',').map(s => s.trim()).filter(Boolean);
  return `<ul class="chips">${list.map(t => `<li class="chip">${esc(t)}</li>`).join('')}</ul>`;
}

function projectInner(p, note) {
  const o = p.overview || {};
  const glance = [
    row('Role', o.role, note, { always: true }),
    row('Team', o.team, note, { always: true }),
    row('Stage', o.stage, note, { always: true }),
    row('Timeframe', o.timeframe, note, { always: true }),
    row('Genre', o.genre, note),
    row('Type', o.type, note),
    row('Engine', o.engine, note),
    row('Platforms', o.platforms, note),
    row('Characters', o.characters, note),
    row('Moves', o.moves, note),
  ].join('');

  let tools = '';
  if (o.tools) {
    if (isPending(o.tools)) note.add('Tools', o.tools);
    else tools = `<h2>Tools</h2>${chips(val(o.tools))}`;
  }

  let did = '';
  if (p.contributions) {
    if (isPending(p.contributions)) note.add('What I did', p.contributions);
    else did = `<h2>What I did</h2><ul class="bullets">${val(p.contributions).map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
  }

  let what = '';
  if (p.mechanics) {
    if (isPending(p.mechanics)) note.add(NON_GAME.has(p.slug) ? 'Features' : 'Mechanics', p.mechanics);
    else {
      const heading = NON_GAME.has(p.slug) ? 'Features' : (p.slug === 'a-course-in-time' ? 'Mechanics in the playable build' : 'Mechanics');
      const caveat = p.slug === 'a-course-in-time'
        ? '<p class="note">As described on the itch.io page. The project is in development, so this is not a shipped storefront credit.</p>'
        : '';
      const cls = NON_GAME.has(p.slug) ? 'spec-list' : 'mechanics';
      what += `<h2>${heading}</h2>${caveat}<dl class="${cls}">${val(p.mechanics).map(m => `<div><dt>${esc(m.name)}</dt><dd>${esc(m.text)}</dd></div>`).join('')}</dl>`;
    }
  }
  if (p.structure) {
    if (isPending(p.structure)) note.add('Structure', p.structure);
    else what += `<h2>Structure</h2><p>${esc(val(p.structure))}</p>`;
  }
  if (p.eraNote) {
    if (isPending(p.eraNote)) note.add('How many eras', p.eraNote);
    else what += `<h2>How many eras</h2><p>${esc(val(p.eraNote))}</p>`;
  }
  if (p.slug === 'a-course-in-time') what += `<h2>The rule, in one picture</h2>${eraDiagram()}`;

  let extra = '';
  if (p.clientWork) {
    const bits = [
      row('Communication', p.clientWork.cadence, note),
      row('Handover', p.clientWork.handover, note),
      row('Client', p.clientWork.clientName, note),
      row('Client feedback', p.clientWork.feedback, note),
      row('Handover documentation', p.clientWork.handoverNotes, note),
    ].join('');
    if (bits) extra += `<h2>Working with the client</h2><dl class="facts">${bits}</dl>`;
  }
  if (p.collaboration) {
    const ready = p.collaboration.filter(c => !isPending(c.item));
    p.collaboration.filter(c => isPending(c.item)).forEach(c => note.add(c.discipline, c.item));
    if (ready.length) extra += `<h2>Who did what</h2><ul class="bullets">${ready.map(c => `<li><strong>${esc(c.discipline)}.</strong> ${esc(val(c.item))}</li>`).join('')}</ul>`;
  }
  if (p.decisions && p.decisions.length) {
    const happened = p.slug === 'waking-nightmare';
    const blocks = p.decisions.map(d => {
      const fields = [
        [happened ? 'What happened' : 'Decision', d.detail],
        ['Why it mattered', d.why],
        ['Options considered', d.options],
        ['Evidence', d.evidence],
        ['Trade-off', d.tradeoff],
        ['Result', d.result],
      ];
      const rows = fields.map(([k, f]) => {
        if (f == null) return '';
        if (typeof f === 'string') return `<div><dt>${esc(k)}</dt><dd>${esc(f)}</dd></div>`;
        if (isPending(f)) { note.add(k, f); return ''; }
        return `<div><dt>${esc(k)}</dt><dd>${esc(val(f))}</dd></div>`;
      }).join('');
      if (!rows && !d.decision) return '';
      return `<article class="decision"><h3>${esc(d.decision)}</h3>${rows ? `<dl class="facts">${rows}</dl>` : ''}</article>`;
    }).join('');
    if (blocks.trim()) extra += `<h2>Design decisions</h2>${blocks}`;
  }
  if (p.levelDesign) {
    const l = p.levelDesign;
    const bits = [
      row('Level', l.overview, note),
      row('Goals', l.goals, note),
      row('Level structure', l.structure, note),
      row('Flow', l.flow, note),
      row('Mechanic introduction', l.mechanicIntroduction, note),
      row('Challenge curve', l.challengeCurve, note),
      row('Greybox', l.greybox, note),
      row('Final', l.final, note),
    ].join('');
    if (bits) extra += `<h2>Level design</h2><dl class="facts">${bits}</dl>`;
  }
  if (p.experience) {
    const exp = [
      row('Intended experience', p.experience.intended, note),
      row('Design tools used to shape it', p.experience.tools, note, { always: false }),
    ].join('');
    const toolsList = p.experience.tools && !isPending(p.experience.tools)
      ? `<ul class="bullets">${val(p.experience.tools).map(x => `<li>${esc(x)}</li>`).join('')}</ul>`
      : '';
    if (p.experience.evidence) {
      if (isPending(p.experience.evidence)) note.add('Experience evidence', p.experience.evidence);
    }
    if (exp || toolsList) extra += `<h2>Player experience</h2><dl class="facts">${row('Intended experience', p.experience.intended, note)}</dl>${toolsList}`;
  }
  if (p.playtesting) {
    if (p.playtesting.support && !isPending(p.playtesting.support)) extra += `<h2>Playtesting</h2><p>${esc(val(p.playtesting.support))}</p>`;
    else note.add('Playtesting', p.playtesting.support || p.playtesting.template);
    if (p.playtesting.template) note.add('Playtest write-up', p.playtesting.template);
  }
  for (const [key, label] of [['videos', 'Gameplay video'], ['results', 'Results'], ['reflection', 'Reflection'], ['next', 'Next'], ['problem', 'Problem'], ['designGoal', 'Design goal']]) {
    if (!p[key]) continue;
    if (isPending(p[key])) note.add(label, p[key]);
    else extra += `<h2>${esc(label)}</h2><p>${esc(val(p[key]))}</p>`;
  }
  if (p.media) p.media.forEach(m => { if (isPending(m.item)) note.add(m.label, m.item); });
  if (p.iterations) note.add('Iterations', { status: 'pending', request: 'Images for each version.' });

  const pending = note.list();
  const still = `<details class="still"><summary>Still to add (${pending.length})</summary><ul class="bullets">${pending.map(line => `<li>${esc(line)}</li>`).join('')}</ul></details>`;

  return `<div class="card meta-card"><dl class="meta-grid">${glance}</dl>${tools}</div>
  ${did ? `<div class="card">${did}</div>` : ''}
  ${what ? `<div class="card">${what}</div>` : ''}
  ${extra ? `<div class="card">${extra}</div>` : ''}
  <div class="card still-card">${still}</div>`;
}

function screenHead({ eyebrow, title, id, credit, sub, actions }) {
  return `<header class="page-head screen-head">
    <p class="eyebrow">${esc(eyebrow)}</p>
    <h1 class="page-title" id="${esc(id)}">${esc(title)}</h1>
    ${credit ? `<p class="page-credit">${credit}</p>` : ''}
    ${sub ? `<p class="page-sub">${sub}</p>` : ''}
    ${actions || ''}
  </header>`;
}

function projectPanel(p, route) {
  const note = notes();
  const credit = p.subtitle && !isPending(p.subtitle) ? esc(val(p.subtitle)) : '';
  const sub = p.tagline && !isPending(p.tagline) ? esc(val(p.tagline)) : '';
  if (p.subtitle && isPending(p.subtitle)) note.add('Subtitle', p.subtitle);
  if (p.tagline && isPending(p.tagline)) note.add('Summary', p.tagline);
  const act = actions(p, note);
  return `<!-- panel:${route} -->
<section id="${route}" class="panel" role="tabpanel" aria-labelledby="${route}-title">
  ${screenHead({
    eyebrow: TIER[p.tier] || 'Project',
    title: p.title,
    id: `${route}-title`,
    credit,
    sub,
    actions: act,
  })}
  ${hero(p)}
  ${projectInner(p, note)}
</section>
<!-- /panel:${route} -->`;
}

function workCard(p) {
  const note = notes();
  const stage = p.overview && p.overview.stage && !isPending(p.overview.stage)
    ? esc(val(p.overview.stage))
    : esc(publicSlot(p.overview && p.overview.stage, 'Stage'));
  const line = p.tagline && !isPending(p.tagline) ? esc(val(p.tagline)) : '';
  const act = actions(p, note);
  return `<!-- card:${p.slug} -->
<details class="card work" id="${esc(p.slug)}">
  <summary>
    <span class="eyebrow">${esc(TIER[p.tier] || 'Project')}</span>
    <span class="work-title">${esc(p.title)}</span>
    <span class="work-stage">${stage}</span>
    ${line ? `<span class="work-line">${line}</span>` : ''}
  </summary>
  <div class="card-detail">
    ${act}
    ${hero(p)}
    ${projectInner(p, note)}
  </div>
</details>
<!-- /card:${p.slug} -->`;
}

function skillLinks(row) {
  const slugs = row.projects || [];
  if (row.evidence === 'project') {
    return slugs.map(slug => {
      const open = OPEN[slug];
      if (!open) return '';
      return ext(open[1], open[0]);
    }).join('');
  }
  return slugs.map(slug => {
    const href = ROUTE[slug];
    if (!href) return '';
    return `<a href="${esc(href)}">${esc(NAME[slug] || slug)}</a>`;
  }).join('');
}

function skillMark(row) {
  if (row.evidence === 'project') return { label: 'Unlocked', cls: 'good' };
  if (row.evidence === 'coming') return { label: 'Locked', cls: 'locked' };
  return { label: 'In progress', cls: 'warn' };
}

function skillsBlock(site) {
  const rows = (site.skills && site.skills.rows || []).filter(r => !r.hide);
  const groups = [];
  for (const row of rows) {
    let g = groups.find(x => x.name === row.group);
    if (!g) { g = { name: row.group || 'Skills', rows: [] }; groups.push(g); }
    g.rows.push(row);
  }
  return groups.map(g => `<section class="card skill-group">
    <h2>${esc(g.name)}</h2>
    <ul class="skill-list">
      ${g.rows.map(row => {
        const mark = skillMark(row);
        const described = row.evidence === 'described'
          ? '<p class="skill-note">Described on the project page; artefact not published yet.</p>'
          : '';
        return `<li class="skill-row" data-skill="${esc(row.skill)}">
          <span class="skill-name">${esc(row.skill)}</span>
          <span class="badge badge--${mark.cls}">${mark.label}</span>
          <span class="skill-links">${skillLinks(row)}</span>
          ${described}
        </li>`;
      }).join('')}
    </ul>
  </section>`).join('');
}

function aboutPending(site) {
  const note = notes();
  note.add('A personal note', site.about && site.about.personal);
  note.add('Steam', site.contact && site.contact.steam);
  note.add('LinkedIn', site.contact && site.contact.linkedin);
  for (const d of site.documents || []) note.add(d.title, d.item);
  for (const j of site.journal || []) note.add('Journal entry', j);
  const steps = (site.approach && val(site.approach)) || [];
  for (const step of steps) if (step && step.example) note.add(`${step.step} example`, step.example);
  for (const row of (site.benchmark && site.benchmark.rows) || []) {
    if (row.level === 'pending') note.add(row.skill, { status: 'pending', request: 'Evidence still to add.' });
  }
  const items = note.list();
  return `<details class="still"><summary>Still to add (${items.length})</summary><ul class="bullets">${items.map(line => `<li>${esc(line)}</li>`).join('')}</ul></details>`;
}

function about(site) {
  const email = val(site.contact.email);
  const mail = `<a href="mailto:${esc(email)}">${esc(email)}</a>`;
  const github = val(site.contact.github);
  const itch = val(site.contact.itch);
  return `<!-- panel:about -->
<section id="about" class="panel" role="tabpanel" aria-labelledby="about-title">
  <header class="page-head screen-head">
    <p class="eyebrow">About</p>
    <h1 class="page-title" id="about-title">About me</h1>
    <p class="page-sub">Game design student targeting Game Designer, Level Designer, Gameplay Designer and UX/Player Experience roles.</p>
  </header>
  <div class="card">
    <p class="lede">${esc(val(site.lede))}</p>
    <p>${esc(val(site.intro))}</p>
    <p class="strengths">Team lead on a 5-person Unity 6 game (level design, audio, code) · Creative Director on a 5-person VR client project · Git · FMOD</p>
    <p>${esc(val(site.openTo))}</p>
  </div>
  <div class="card">
    <h2>Tools and skills</h2>
    <p class="note">Unlocked rows link to something a recruiter can open. In progress is work I have described or attested, without a public artefact for that row. Locked is attested, with evidence still to come.</p>
  </div>
  ${skillsBlock(site)}
  <div class="card" id="education">
    <h2>Education</h2>
    <p class="pending">${esc(publicSlot(site.about.education, 'Education'))}</p>
  </div>
  <div class="card" id="cv">
    <h2>CV</h2>
    <p>CV not published here yet. For now, email me at ${mail}.</p>
  </div>
  <div class="card" id="contact">
    <h2>Contact</h2>
    <p>${mail}</p>
    <p class="contact-links">${ext(github, 'GitHub')} ${ext(itch, 'itch.io')}</p>
  </div>
  <div class="card still-card">${aboutPending(site)}</div>
</section>
<!-- /panel:about -->`;
}

function more(projects) {
  const bySlug = Object.fromEntries(projects.map(p => [p.slug, p]));
  const cards = MORE.map(slug => workCard(bySlug[slug])).join('\n');
  return `<!-- panel:more -->
<section id="more" class="panel" role="tabpanel" aria-labelledby="more-title">
  <header class="page-head screen-head">
    <p class="eyebrow">Smaller work</p>
    <h1 class="page-title" id="more-title">More</h1>
    <p class="page-sub">Waking Nightmare Experience is the largest of these. The others are a coursework app and two browser prototypes. Open a card for the same fields as the other projects.</p>
  </header>
  ${cards}
</section>
<!-- /panel:more -->`;
}

export function shell(site, projects) {
  const bySlug = Object.fromEntries(projects.map(p => [p.slug, p]));
  return [
    about(site),
    projectPanel(bySlug['a-course-in-time'], 'acit'),
    projectPanel(bySlug['sword-saint-broken-bridge'], 'sword-saint'),
    projectPanel(bySlug.tabi, 'tabi'),
    more(projects),
  ].join('\n');
}
