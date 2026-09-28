import { esc, val, isPending, pending, field, countPending, href } from './lib.mjs';
import { eraSwitch } from './layout.mjs';

const LOOP = ['Assumption', 'Test', 'Evidence', 'Insight', 'Decision', 'Iteration'];
const ext = (href, text) => `<a href="${esc(href)}" rel="noopener">${text}<span class="visually-hidden"> (opens external site)</span></a>`;

function section(id, lens, title, inner) {
  return `<section id="${id}" class="cs-section" data-lens="${lens}" aria-labelledby="${id}-title">
  <h2 id="${id}-title" class="cs-section__title"><span class="cs-section__era">${{ past: 'Past · how it was made', present: 'Present · what it is', future: "Future · what's next" }[lens]}</span>${esc(title)}</h2>
  ${inner}
</section>`;
}

const list = (arr) => `<ul class="bullets">${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
const dlRows = (rows) => `<dl class="facts">${rows.map(([k, f, fn]) => `<div><dt>${esc(k)}</dt><dd>${field(f, fn || (v => esc(Array.isArray(v) ? v.join(', ') : v)), { inline: true, label: 'Pending' })}</dd></div>`).join('')}</dl>`;

function eraDiagram() {
  // Illustration of the published rule, not a level from the game.
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
  return `<figure class="diagram" data-diagram>
  <div class="diagram__controls" role="group" aria-label="Show the room in">
    <button type="button" class="era__btn" data-dg="past" aria-pressed="true">Past</button>
    <button type="button" class="era__btn" data-dg="present" aria-pressed="false">Present</button>
  </div>
  <div class="dg" data-dg-state="past" aria-hidden="true">${cells.join('')}</div>
  <figcaption>
    <p class="diagram__desc" aria-live="polite" data-dg-desc>Past: a wall blocks the way. The crate has just been pushed into place.</p>
    <p class="diagram__note">Diagram of the rule as I describe it — the building changes between eras, what you move stays moved. It is an illustration, not a level from the game.</p>
    <ul class="dg__key" aria-hidden="true"><li><span class="dg__cell dg__cell--player"></span>Player</li><li><span class="dg__cell dg__cell--crate"></span>Crate</li><li><span class="dg__cell dg__cell--wall"></span>Wall</li><li><span class="dg__cell dg__cell--platform"></span>Platform</li></ul>
  </figcaption>
</figure>`;
}

function chain(d) {
  // Which links of the evidence chain are actually filled for this decision.
  const filled = {
    Assumption: !isPending(d.why), Test: !!d.test && !isPending(d.test), Evidence: !isPending(d.evidence),
    Insight: !!d.insight && !isPending(d.insight), Decision: true, Iteration: !isPending(d.result),
  };
  return `<ol class="loop loop--small" aria-label="Evidence chain: ${LOOP.filter(s => filled[s]).length} of 6 links published">${LOOP.map(s => `<li class="${filled[s] ? 'is-filled' : 'is-empty'}">${s}<span class="visually-hidden">${filled[s] ? ' (published)' : ' (pending)'}</span></li>`).join('')}</ol>`;
}

function decisions(ds) {
  return `<div class="decisions">${ds.map((d, i) => `<details class="decision"${i === 0 ? ' open' : ''}>
  <summary><span class="decision__title">${esc(d.decision)}</span></summary>
  <div class="decision__body">
    ${chain(d)}
    <dl class="facts facts--stack">
      <div><dt>Decision</dt><dd>${esc(d.detail)}</dd></div>
      <div><dt>Why it mattered</dt><dd>${field(d.why, esc, { inline: true })}</dd></div>
      <div><dt>Options considered</dt><dd>${field(d.options, esc, { inline: true })}</dd></div>
      <div><dt>Evidence</dt><dd>${field(d.evidence, esc, { inline: true })}</dd></div>
      <div><dt>Trade-off</dt><dd>${field(d.tradeoff, esc, { inline: true })}</dd></div>
      <div><dt>Result</dt><dd>${field(d.result, esc, { inline: true })}</dd></div>
    </dl>
  </div>
</details>`).join('')}</div>`;
}

function slot(f, cls = '') {
  if (isPending(f)) return `<div class="slot ${cls}">${pending(f, { label: 'Image pending' })}</div>`;
  const v = val(f);
  const w = v.width ? ` width="${esc(v.width)}"` : '';
  const h = v.height ? ` height="${esc(v.height)}"` : '';
  return `<img class="slot ${cls}" src="${esc(href(v.src))}" alt="${esc(v.alt)}"${w}${h} loading="lazy" decoding="async">`;
}

function iterations(its, slug) {
  return `<div class="iter" data-iter>
  <div class="iter__tabs" role="tablist" aria-label="Versions">${its.map((it, i) => `<button type="button" role="tab" id="${slug}-tab-${i}" aria-controls="${slug}-panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(it.label)}</button>`).join('')}</div>
  ${its.map((it, i) => {
    const prev = its[i - 1];
    const compare = prev ? `<div class="compare" data-compare style="--pos:50%">
      <div class="compare__stage">
        <div class="compare__a">${slot(prev.image)}<span class="compare__tag">${esc(prev.label)}</span></div>
        <div class="compare__b">${slot(it.image)}<span class="compare__tag">${esc(it.label)}</span></div>
      </div>
      <label class="compare__label" for="${slug}-cmp-${i}">Compare ${esc(prev.label)} (left) with ${esc(it.label)} (right)</label>
      <input class="compare__range" id="${slug}-cmp-${i}" type="range" min="0" max="100" value="50" aria-valuetext="50% ${esc(prev.label)}, 50% ${esc(it.label)}" data-a="${esc(prev.label)}" data-b="${esc(it.label)}">
    </div>` : `<div class="compare compare--single">${slot(it.image)}</div>`;
    return `<div class="iter__panel" role="tabpanel" id="${slug}-panel-${i}" aria-labelledby="${slug}-tab-${i}" tabindex="0"${i ? ' hidden' : ''}>
      ${compare}
      <dl class="facts facts--three"><div><dt>What changed</dt><dd>${field(it.what, esc, { inline: true })}</dd></div><div><dt>Why</dt><dd>${field(it.why, esc, { inline: true })}</dd></div><div><dt>Evidence</dt><dd>${field(it.evidence, esc, { inline: true })}</dd></div></dl>
    </div>`;
  }).join('')}
</div>`;
}

function sessionBlock(s) {
  const row = (k, f) => `<div><dt>${esc(k)}</dt><dd>${field(f, esc, { inline: true })}</dd></div>`;
  return `<article class="oicr"><dl class="facts facts--stack">
    ${row('Research question', s.question)}
    ${row('Method', s.method)}
    ${row('Observation', s.observation)}
    ${row('Insight', s.insight)}
    ${row('Design change', s.change)}
    ${row('Result', s.result)}
  </dl></article>`;
}

function collaboration(items) {
  return `<ul class="collab" role="list">${items.map(c => `<li class="collab__item${isPending(c.item) ? ' collab__item--pending' : ''}"><span class="collab__disc">${esc(c.discipline)}</span>${field(c.item, esc, { inline: true, label: 'Pending' })}</li>`).join('')}</ul>`;
}

function mediaMark(kind) {
  if (kind === 'sheet') return `<span class="sheet-cells">${'<i></i>'.repeat(6)}</span>`;
  if (kind === 'clip') return '<span class="play-mark"></span>';
  if (kind === 'gif') return '<span class="media-frame__glyph">GIF</span>';
  if (kind === 'stage') return '<span class="media-frame__glyph">Stage</span>';
  return '';
}

function mediaGallery(items) {
  return `<ul class="media-grid" role="list">${items.map(m => {
    const kind = ['sheet', 'gif', 'stage', 'clip'].includes(m.kind) ? m.kind : 'frame';
    const pendingItem = isPending(m.item);
    const v = pendingItem ? null : val(m.item);
    const visual = pendingItem
      ? `<div class="media-frame__canvas" aria-hidden="true">${mediaMark(kind)}</div>`
      : (v && typeof v === 'object' && v.src
        ? `<img class="media-frame__img" src="${esc(href(v.src))}" alt="${esc(v.alt || m.label)}" loading="lazy" decoding="async">`
        : `<div class="media-frame__canvas" aria-hidden="true"></div>`);
    const note = pendingItem ? `<span class="pending__label">Evidence pending</span> <span class="media-frame__note">${esc(m.item.request || '')}</span>` : '';
    return `<li><figure class="media-frame media-frame--${kind}">${visual}<figcaption><span class="media-frame__name">${esc(m.label)}</span>${note ? ` ${note}` : ''}</figcaption></figure></li>`;
  }).join('')}</ul>`;
}

export function caseStudy(p) {
  const o = p.overview || {};
  const S = [];
  const toc = [];
  const add = (id, lens, title, inner) => { S.push(section(id, lens, title, inner)); toc.push({ id, lens, title }); };

  // ---------------- Present: what it is
  if (p.media && p.media.length) add('media', 'present', 'Media', `<p class="media-lead">Frames for the sprite sheet, each character's animation, the stage, and a gameplay clip.</p>${mediaGallery(p.media)}`);
  add('overview', 'present', 'Overview', dlRows([
    ...(o.projectTitle ? [['Project title', o.projectTitle]] : []),
    ['Genre', o.genre], ...(o.characters ? [['Characters', o.characters]] : []), ...(o.moves ? [['Moves', o.moves]] : []),
    ['Type', o.type], ['My role', o.role], ['Team', o.team], ['Timeframe', o.timeframe],
    ['Engine', o.engine], ['Tools', o.tools], ['Platforms', o.platforms], ['Stage', o.stage],
  ]));
  if (p.mechanics || p.structure) add('what', 'present', 'What it is', `
    ${p.mechanics ? `<h3>Mechanics in the playable build</h3>${p.slug === 'a-course-in-time' ? '<p class="source">As described on the itch.io page. The project is in development, so this is not a shipped storefront credit.</p>' : ''}<dl class="mechanics">${val(p.mechanics).map(m => `<div><dt>${esc(m.name)}</dt><dd>${esc(m.text)}</dd></div>`).join('')}</dl>` : ''}
    ${p.structure ? `<h3>Structure</h3>${field(p.structure, v => `<p>${esc(v)}</p>`)}` : ''}
    ${p.eraNote ? `<h3>How many eras</h3>${field(p.eraNote, v => `<p>${esc(v)}</p>`)}` : ''}
    ${p.slug === 'a-course-in-time' ? `<h3>The rule, in one picture</h3>${eraDiagram()}` : ''}`);
  if (p.contributions) add('role', 'present', 'What I did', `${field(p.contributions, v => list(v))}${p.contributions.source && !isPending(p.contributions) ? `<p class="source">Source: ${esc(p.contributions.source)}</p>` : ''}`);
  if (p.clientWork) add('client', 'present', 'Working with the client', dlRows([
    ['Communication', p.clientWork.cadence], ['Handover', p.clientWork.handover], ['Client', p.clientWork.clientName],
    ['Client feedback', p.clientWork.feedback], ['Handover documentation', p.clientWork.handoverNotes],
  ]));
  if (p.collaboration) add('team', 'present', 'Who did what', collaboration(p.collaboration));
  if (p.videos) add('video', 'present', 'Gameplay video', field(p.videos, v => `<p>${esc(v)}</p>`));

  // ---------------- Past: how it was made
  if (p.problem || p.designGoal) add('goal', 'past', 'Problem and design goal', dlRows([['Problem', p.problem], ['Design goal', p.designGoal]]));
  if (p.process) add('process', 'past', 'Process', `<ol class="process">${p.process.map(s => `<li class="process__step${isPending(s.item) ? ' is-empty' : ' is-filled'}"><span class="process__stage">${esc(s.stage)}</span>${field(s.item, esc, { inline: true, label: 'Pending' })}</li>`).join('')}</ol><p class="source">Stages are only marked done where I can show them.</p>`);
  if (p.decisions && p.decisions.length) add('decisions', 'past', 'Design decisions', decisions(p.decisions));
  if (p.levelDesign) { const l = p.levelDesign; add('level', 'past', 'Level design', dlRows([
    ['Level', l.overview], ['Goals', l.goals], ['Structure', l.structure], ['Flow', l.flow],
    ['Mechanic introduction', l.mechanicIntroduction], ['Challenge curve', l.challengeCurve], ['Greybox', l.greybox], ['Final', l.final],
  ])); }
  if (p.experience) add('experience', 'past', 'Player experience', dlRows([
    ['Intended experience', p.experience.intended], ['Design tools used to shape it', p.experience.tools, v => list(v)], ['Evidence', p.experience.evidence],
  ]));
  if (p.playtesting) { const t = p.playtesting; add('playtesting', 'past', 'Playtesting', `
    ${field(t.support, v => `<p>${esc(v)}</p>`)}
    <h3>Sessions</h3>
    ${t.sessions && t.sessions.length ? t.sessions.map(sessionBlock).join('') : `<div class="oicr" aria-label="Playtest write-up template"><ol class="oicr__steps"><li>Observation</li><li>Insight</li><li>Design change</li><li>Result</li></ol>${pending(t.template)}</div>`}`); }
  if (p.iterations) add('iterations', 'past', 'Iterations', iterations(p.iterations, p.slug));

  // ---------------- Future: what's next
  if (p.results) add('results', 'future', 'Results', field(p.results, v => `<p>${esc(v)}</p>`));
  if (p.reflection) add('reflection', 'future', 'Reflection', `<ol class="journal__qs"><li>What I tried</li><li>Why it failed</li><li>What I learned</li><li>What I changed</li></ol>${field(p.reflection, v => `<p>${esc(v)}</p>`)}`);
  if (p.next) add('next', 'future', 'Next', field(p.next, v => `<p>${esc(v)}</p>`));
  const n = countPending(p);
  add('gaps', 'future', 'Evidence still to add', `<p>This page has <strong>${n}</strong> evidence slot${n === 1 ? '' : 's'} I haven't filled yet. They are marked with dashed boxes rather than filled with guesses.</p>`);

  const links = (p.links || []).filter(l => !isPending(l.item));
  const cover = p.cover && !isPending(p.cover) ? `<img class="cs-cover" src="${esc(href(val(p.cover).src))}" alt="${esc(val(p.cover).alt)}" width="559" height="257" decoding="async">` : (p.cover ? `<div class="cs-cover cs-cover--pending">${pending(p.cover, { label: 'Image pending' })}</div>` : '');

  const groups = ['present', 'past', 'future'].map(l => `<li class="toc__group"><span class="toc__era">${{ past: 'Past', present: 'Present', future: 'Future' }[l]}</span><ul>${toc.filter(t => t.lens === l).map(t => `<li><a href="#${t.id}" data-toc-lens="${t.lens}">${esc(t.title)}</a></li>`).join('')}</ul></li>`).join('');

  return `<div class="wrap cs">
  <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="${href('/index.html#work')}">Work</a></li><li><a href="${href(`/projects/${p.slug}/index.html`)}" aria-current="page">${esc(p.title)}</a></li></ol></nav>
  <header class="cs-head${cover ? '' : ' cs-head--solo'}">
    <div>
      <p class="cs-head__tier">${{ flagship: 'Flagship project', supporting: 'Supporting project', experiment: 'Experiment / prototype' }[p.tier]}</p>
      <h1>${esc(p.title)}</h1>${p.subtitle ? `\n      <p class="cs-head__sub">${field(p.subtitle)}</p>` : ''}
      <p class="lede">${field(p.tagline)}</p>
      <p class="evidence-line"><strong>${n}</strong> evidence slot${n === 1 ? '' : 's'} on this page ${n === 1 ? 'is' : 'are'} still empty. Present is the short version. Past and Future hold the process and the gaps.</p>
      ${p.access ? field(p.access, v => `<p>${esc(v)}</p>`) : ''}
      ${links.length ? `<p class="cs-head__links">${links.map((l) => ext(val(l.item), `${esc(l.label)}`)).join('')}</p>` : ''}
    </div>
    ${cover}
  </header>
  <div class="lensbar" data-lensbar>
    ${eraSwitch({ id: 'lens', lens: true })}
    <p class="lensbar__status visually-hidden" role="status" aria-live="polite" data-lens-status></p>
  </div>
  <div class="cs-body">
    <nav class="toc" aria-label="On this page"><details class="toc__details" open><summary>On this page</summary><ul>${groups}</ul></details></nav>
    <div class="cs-sections">${S.join('\n')}</div>
  </div>
  <p class="cs-back"><a href="${href('/index.html#work')}">← Back to all work</a></p>
</div>`;
}
