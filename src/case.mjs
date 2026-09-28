import { esc, val, isPending, pending, field, countPending, href, publicSlot } from './lib.mjs';

const LOOP = ['Assumption', 'Test', 'Evidence', 'Insight', 'Decision', 'Iteration'];
const ext = (href, text) => `<a href="${esc(href)}" rel="noopener">${text}<span class="visually-hidden"> (opens external site)</span></a>`;

function section(id, title, inner, n) {
  return `<section id="${id}" class="cs-section" aria-labelledby="${id}-title">
  <h2 id="${id}-title" class="cs-section__title"><span class="cs-section__cp">Checkpoint ${n}</span>${esc(title)}</h2>
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

function decisions(ds, note, happened = false) {
  return `<div class="decisions">${ds.map((d, i) => {
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
      if (isPending(f)) { note(k); return ''; }
      return `<div><dt>${esc(k)}</dt><dd>${esc(val(f))}</dd></div>`;
    }).join('');
    return `<details class="decision"${i === 0 ? ' open' : ''}>
  <summary><span class="decision__title">${esc(d.decision)}</span></summary>
  <div class="decision__body">
    ${chain(d)}
    <dl class="facts facts--stack">${rows}</dl>
  </div>
</details>`;
  }).join('')}</div>`;
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
    const note = pendingItem ? `<span class="pending__label">${esc(publicSlot(m.item, m.label))}</span>` : '';
    return `<li><figure class="media-frame media-frame--${kind}">${visual}<figcaption><span class="media-frame__name">${esc(m.label)}</span>${note ? ` ${note}` : ''}</figcaption></figure></li>`;
  }).join('')}</ul>`;
}

export function caseStudy(p) {
  const o = p.overview || {};
  const S = [];
  const toc = [];
  const notes = [];
  const deferred = [];
  let cp = 0;
  const note = (label) => { if (label) notes.push(label); };
  const add = (id, title, inner) => {
    if (!inner || !String(inner).trim()) return;
    cp += 1;
    S.push(section(id, title, inner, cp));
    toc.push({ id, title, n: cp });
  };
  const show = (v) => esc(Array.isArray(v) ? v.join(', ') : v);
  const rowsHtml = (rows) => {
    const bits = [];
    for (const [k, f, fn] of rows) {
      if (f == null) continue;
      if (isPending(f)) note(k);
      else bits.push(`<div><dt>${esc(k)}</dt><dd>${(fn || show)(val(f))}</dd></div>`);
    }
    return bits.length ? `<dl class="facts">${bits.join('')}</dl>` : '';
  };

  const NON_GAME = new Set(['tabi', 'sdcs-booking-app']);
  add('overview', 'Overview', rowsHtml([
    ...(o.projectTitle ? [['Project title', o.projectTitle]] : []),
    ['Genre', o.genre], ...(o.characters ? [['Characters', o.characters]] : []), ...(o.moves ? [['Moves', o.moves]] : []),
    ['Type', o.type], ['My role', o.role], ['Team', o.team], ['Timeframe', o.timeframe],
    ['Engine', o.engine], ['Tools', o.tools], ['Platforms', o.platforms], ['Stage', o.stage],
  ]));

  if (p.contributions) {
    if (isPending(p.contributions)) note('What I did');
    else add('role', 'What I did', list(val(p.contributions)));
  }

  let what = '';
  if (p.mechanics && !isPending(p.mechanics)) {
    const heading = NON_GAME.has(p.slug) ? 'Features' : (p.slug === 'a-course-in-time' ? 'Mechanics in the playable build' : 'Mechanics');
    const caveat = p.slug === 'a-course-in-time' ? '<p class="source">As described on the itch.io page. The project is in development, so this is not a shipped storefront credit.</p>' : '';
    const listClass = NON_GAME.has(p.slug) ? 'spec-list' : 'mechanics';
    what += `<h3>${heading}</h3>${caveat}<dl class="${listClass}">${val(p.mechanics).map(m => `<div><dt>${esc(m.name)}</dt><dd>${esc(m.text)}</dd></div>`).join('')}</dl>`;
  } else if (p.mechanics) note(NON_GAME.has(p.slug) ? 'Features' : 'Mechanics');
  if (p.structure) {
    if (isPending(p.structure)) note('Structure');
    else what += `<h3>Structure</h3><p>${esc(val(p.structure))}</p>`;
  }
  if (p.eraNote) {
    if (isPending(p.eraNote)) note('How many eras');
    else what += `<h3>How many eras</h3><p>${esc(val(p.eraNote))}</p>`;
  }
  if (p.slug === 'a-course-in-time') what += `<h3>The rule, in one picture</h3>${eraDiagram()}`;
  add('what', 'What it is', what);

  if (p.clientWork) {
    const client = rowsHtml([
      ['Communication', p.clientWork.cadence], ['Handover', p.clientWork.handover], ['Client', p.clientWork.clientName],
      ['Client feedback', p.clientWork.feedback], ['Handover documentation', p.clientWork.handoverNotes],
    ]);
    add('client', 'Working with the client', client);
  }
  if (p.collaboration) {
    const ready = p.collaboration.filter(c => !isPending(c.item));
    p.collaboration.filter(c => isPending(c.item)).forEach(c => note(c.discipline));
    if (ready.length) add('team', 'Who did what', collaboration(ready));
  }
  if (p.decisions && p.decisions.length) add('decisions', 'Design decisions', decisions(p.decisions, note, p.slug === 'waking-nightmare'));

  if (p.process) {
    const filled = p.process.filter(s => !isPending(s.item));
    p.process.filter(s => isPending(s.item)).forEach(s => note(s.stage));
    if (filled.length) add('process', 'Process', `<ol class="process">${filled.map(s => `<li class="process__step is-filled"><span class="process__stage">${esc(s.stage)}</span>${esc(val(s.item))}</li>`).join('')}</ol>`);
  }
  if (p.levelDesign) {
    const l = p.levelDesign;
    const level = rowsHtml([
      ['Level', l.overview], ['Goals', l.goals], ['Structure', l.structure], ['Flow', l.flow],
      ['Mechanic introduction', l.mechanicIntroduction], ['Challenge curve', l.challengeCurve], ['Greybox', l.greybox], ['Final', l.final],
    ]);
    if (level) add('level', 'Level design', level);
    else deferred.push('<h3 id="level">Level design</h3>');
  }
  if (p.experience) {
    const exp = rowsHtml([
      ['Intended experience', p.experience.intended], ['Design tools used to shape it', p.experience.tools, v => list(v)], ['Evidence', p.experience.evidence],
    ]);
    add('experience', 'Player experience', exp);
  }
  if (p.playtesting) {
    const t = p.playtesting;
    if (t.support && !isPending(t.support)) add('playtesting', 'Playtesting', `<p>${esc(val(t.support))}</p>`);
    else note('Playtesting');
    deferred.push(`<div id="playtesting"><h3>Playtesting</h3>${t.sessions && t.sessions.length ? t.sessions.map(sessionBlock).join('') : `<div class="oicr" aria-label="Playtest write-up template"><ol class="oicr__steps"><li>Observation</li><li>Insight</li><li>Design change</li><li>Result</li></ol><p>${esc(publicSlot(t.template, 'Playtest write-up'))}</p></div>`}</div>`);
  }
  if (p.videos) {
    if (isPending(p.videos)) note('Gameplay video');
    else add('video', 'Gameplay video', `<p>${esc(val(p.videos))}</p>`);
  }
  if (p.results) {
    if (isPending(p.results)) note('Results');
    else add('results', 'Results', `<p>${esc(val(p.results))}</p>`);
  }
  if (p.reflection) {
    if (isPending(p.reflection)) {
      note('Reflection');
      deferred.push(`<h3 id="reflection">Reflection</h3><p>${esc(publicSlot(p.reflection, 'Reflection'))}</p>`);
    } else add('reflection', 'Reflection', `<p>${esc(val(p.reflection))}</p>`);
  }
  if (p.next) {
    if (isPending(p.next)) note('Next');
    else add('next', 'Next', `<p>${esc(val(p.next))}</p>`);
  }
  if (p.problem || p.designGoal) {
    const goal = rowsHtml([['Problem', p.problem], ['Design goal', p.designGoal]]);
    if (goal) add('goal', 'Problem and design goal', goal);
  }
  if (p.media && p.media.length) {
    p.media.filter(m => isPending(m.item)).forEach(m => note(m.label));
    deferred.push(`<div id="media"><h3>Media</h3><p class="media-lead">Frames for the sprite sheet, each character, the stage, and a gameplay clip.</p>${mediaGallery(p.media)}</div>`);
  }
  if (p.iterations) deferred.push(`<div id="iterations"><h3>Iterations</h3>${iterations(p.iterations, p.slug)}</div>`);
  if (p.cover && isPending(p.cover)) note('Cover image');

  const n = countPending(p);
  const summary = p.slug === 'a-course-in-time'
    ? `Still to add (${n}): level maps, playtest notes, gameplay clip and more`
    : `Still to add (${n})`;
  const listItems = [...new Set(notes)].map(label => `<li>Coming soon: ${esc(label)}</li>`).join('');
  cp += 1;
  S.push(`<section id="still" class="cs-section" aria-labelledby="still-title">
  <details class="still">
    <summary id="still-title"><span class="cs-section__cp">Checkpoint ${cp}</span> ${esc(summary)}</summary>
    <ul class="bullets">${listItems}</ul>
    ${deferred.join('\n')}
  </details>
</section>`);
  toc.push({ id: 'still', title: 'Still to add', n: cp });

  const HEADS = {
    'a-course-in-time': 'Playable build on itch.io. Level maps, playtest notes and a gameplay clip are still to come.',
    tabi: 'Live, invite-only. A cover image and the remaining write-up slots are still to come.',
    'ikemen-go': 'Coming soon: public build or page. Sprite sheet, character GIFs and a gameplay clip are still to come.',
    'waking-nightmare': 'Client handover of an in-progress build. Several write-up slots are still to come.',
  };
  const line = HEADS[p.slug] || 'Confirmed work is in the sections above. Empty slots are listed at the end and are not filled with guesses.';
  const glanceBits = [
    ['Role', o.role], ['Team', o.team], ['Tools', o.tools], ['Stage', o.stage],
  ].filter(([, f]) => f && !isPending(f));
  const glance = glanceBits.length
    ? `<dl class="glance">${glanceBits.map(([k, f]) => `<div><dt>${esc(k)}</dt><dd>${esc(val(f))}</dd></div>`).join('')}</dl>`
    : '';
  const links = (p.links || []).filter(l => !isPending(l.item));
  const cover = p.cover && !isPending(p.cover) ? `<img class="cs-cover" src="${esc(href(val(p.cover).src))}" alt="${esc(val(p.cover).alt)}" width="559" height="257" decoding="async">` : '';
  const checkpoints = toc.map(t => `<li><a href="#${t.id}">${esc(t.title)}</a></li>`).join('');

  return `<div class="wrap cs">
  <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="${href('/index.html#map')}">Map</a></li><li><a href="${href(`/projects/${p.slug}/index.html`)}" aria-current="page">${esc(p.title)}</a></li></ol></nav>
  <header class="cs-head level-head${cover ? '' : ' cs-head--solo'}">
    <div>
      <p class="cs-head__tier">Level · ${{ flagship: 'Flagship project', supporting: 'Supporting project', experiment: 'Experiment / prototype' }[p.tier]}</p>
      <h1>${esc(p.title)}</h1>${p.subtitle ? `\n      <p class="cs-head__sub">${field(p.subtitle, esc, { label: 'Subtitle' })}</p>` : ''}
      <p class="lede">${field(p.tagline, esc, { label: 'Summary' })}</p>
      <p class="evidence-line">${esc(line)}</p>
      ${p.access && !isPending(p.access) ? `<p>${esc(val(p.access))}</p>` : ''}
      ${links.length ? `<p class="cs-head__links">${links.map((l) => ext(val(l.item), `${esc(l.label)}`)).join('')}</p>` : ''}
      ${glance}
    </div>
    ${cover}
  </header>
  <div class="cs-body">
    <nav class="toc" aria-label="Checkpoints"><details class="toc__details" open><summary>Checkpoints</summary><ol class="toc__list">${checkpoints}</ol></details></nav>
    <div class="cs-sections">${S.join('\n')}</div>
  </div>
  <p class="cs-back"><a href="${href('/index.html#map')}">← Back to map</a></p>
</div>`;
}
