import { esc, href, val, isPending } from './lib.mjs';

const confirmed = (f) => (isPending(f) ? null : val(f));

const ACIT = 'https://crumpyofcl.itch.io/a-course-in-time';
const TABI = 'https://japantrip-oeja.onrender.com';
const SDCS = 'https://github.com/CrumpyOFCL/Comp2750-Assignment';

const STILL = {
  about: ['Education', 'LinkedIn', 'Game design document', 'Playtest report', 'Level maps'],
  'a-course-in-time': ['Gameplay video', 'Level map', 'Playtest write-up', 'code sample', 'Devlog'],
  'sword-saint-broken-bridge': ['Sprite sheet', 'The Sword Saint GIF', 'Unknown GIF', 'Broken Bridge screenshot', 'Gameplay clip'],
  tabi: ['Screenshots of a trip', 'Tester feedback', 'Results'],
  'waking-nightmare': ['Timeframe', 'Cover image', 'Client feedback', 'Handover notes', 'Reflection'],
  'sdcs-booking-app': ['Cover image', 'Reflection', 'Problem', 'Design goal'],
  'lit-flux-mechanics-showcase': ['My role', 'Team', 'Timeframe', 'Cover image'],
  gdt2: ['My role', 'Team', 'Timeframe', 'Cover image'],
};

function still(slug) {
  const items = (STILL[slug] || []).slice(0, 5);
  if (!items.length) return '';
  return `<details class="still"><summary>Still to add</summary><ul>${items.map((item) => `<li>Coming soon: ${esc(item)}</li>`).join('')}</ul></details>`;
}

function chips(items) {
  return `<ul class="fact-chips">${items.filter(Boolean).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`;
}

function bullets(title, items) {
  const rows = (items || []).filter(Boolean).slice(0, 3);
  if (!rows.length) return '';
  return `<section class="block"><h2>${esc(title)}</h2><ul class="points">${rows.map((row) => `<li>${esc(row)}</li>`).join('')}</ul></section>`;
}

function systems(cards) {
  if (!cards.length) return '';
  return `<section class="block"><h2>System breakdown</h2><div class="sys-list">${cards.map((card) => `<article class="card sys">
    <h3>${esc(card.name)}</h3>
    <ol class="io">
      <li><span>Input</span> ${esc(card.input)}</li>
      <li><span>Rule</span> ${esc(card.rule)}</li>
      <li><span>Outcome</span> ${esc(card.outcome)}</li>
    </ol>
  </article>`).join('')}</div></section>`;
}

function action(url, label) {
  if (!url) return '';
  return `<a class="primary" href="${esc(url)}">${esc(label)}</a>`;
}

function head({ id, project, eyebrow, title, credit, hook, chipItems, url, cta, media, mark, labelledby }) {
  return `<section id="${id}" class="panel" role="tabpanel" data-project="${project}" aria-labelledby="${labelledby || `${id}-title`}">
    <div class="proj-top" data-first>
      <div class="proj-copy">
        <p class="eyebrow">${mark ? `<img class="mark" src="${href(mark)}" alt="" width="174" height="80">` : ''}${esc(eyebrow)}</p>
        <h1 class="page-title" id="${id}-title">${esc(title)}</h1>
        ${credit ? `<p class="page-credit">${esc(credit)}</p>` : ''}
        <p class="hook">${esc(hook)}</p>
        ${chips(chipItems)}
        ${action(url, cta)}
      </div>
      <div class="proj-hero">${media}</div>
    </div>`;
}

function eraDiagram(project) {
  const mechanic = (val(project.mechanics) || []).find((item) => item.name === 'Time Switch');
  const text = mechanic?.text || '';
  const note = 'Diagram. It is an illustration, not a level from the game. Logo: A Course In Time team.';
  return `<figure class="diagram">
    <figcaption>Diagram</figcaption>
    <div class="era-toggle" role="group" aria-label="Era">
      <button type="button" aria-pressed="true" data-era="past">Past</button>
      <button type="button" aria-pressed="false" data-era="present">Present</button>
    </div>
    <div class="stage" data-stage="past">
      <span class="room past-room"></span><span class="room present-room"></span>
      <span class="player"></span>
    </div>
    <p class="era-copy" data-past="${esc(text)}" data-present="${esc(text)}">${esc(text)}</p>
    <p class="diagram-note">${esc(note)}</p>
  </figure>`;
}

function moveList() {
  const rows = [
    ['4 normals', 'Shared'],
    ['Lightning special', 'Two projectiles'],
    ['Super', 'Meter-gated'],
    ['Back dash', 'Movement'],
    ['Block', 'Defence'],
    ['Perfect block', 'Timed'],
    ['Stamina', 'System'],
  ];
  return `<figure class="move-list">
    <figcaption>Diagram of the moveset. Not a gameplay screenshot.</figcaption>
    <ul>${rows.map(([name, kind]) => `<li><span>${esc(name)}</span><em>${esc(kind)}</em></li>`).join('')}</ul>
  </figure>`;
}

function moneyDiagram() {
  return `<figure class="money">
    <figcaption>Diagram of the money states. Not a screenshot.</figcaption>
    <ul>
      <li><i class="swatch paid"></i> Paid</li>
      <li><i class="swatch committed"></i> Committed</li>
      <li><i class="swatch estimated"></i> Estimated</li>
    </ul>
    <p>The three always add up to the projected cost.</p>
  </figure>`;
}

function skillPanel(site) {
  const rows = (site.skills?.rows || []).filter((row) => !row.hide);
  const names = rows.map((row) => `<li>${esc(row.skill)}</li>`).join('');
  const groups = [];
  for (const row of rows) {
    let group = groups.find((item) => item.name === row.group);
    if (!group) {
      group = { name: row.group, rows: [] };
      groups.push(group);
    }
    group.rows.push(row);
  }
    const detail = groups.map((group) => `<section><h3>${esc(group.name)}</h3><ul class="chip-row">${group.rows.map((row) => `<li>${esc(row.skill)}</li>`).join('')}</ul></section>`).join('');
  return `<section class="block"><h2>Tools</h2><ul class="chip-row">${names}</ul></section>
    <details class="still"><summary>Full skills list</summary>${detail}</details>`;
}

export function shell(site, projects) {
  const by = Object.fromEntries(projects.map((project) => [project.slug, project]));
  const acit = by['a-course-in-time'];
  const sword = by['sword-saint-broken-bridge'];
  const tabi = by.tabi;
  const email = val(site.contact.email);
  const github = val(site.contact.github);
  const itch = val(site.contact.itch);
  const positioning = 'Game development student, looking for Game Designer, Level Designer, Gameplay Designer and UX/Player Experience roles.';

  const about = `<section id="about" class="panel" role="tabpanel" aria-labelledby="about-title">
    <div data-first>
      <p class="eyebrow">Portfolio</p>
      <h1 class="page-title" id="about-title">About me</h1>
      <p class="hook">I design and build gameplay systems and the tools behind them, in Unity and C#.</p>
      <p class="lede">${esc(positioning)}</p>
      ${chips([
        'Team lead · 5-person Unity 6 game',
        'Creative Director · 5-person VR client project',
        'Unity · C# · FMOD',
        'Open to junior design, gameplay and tools roles',
      ])}
      <div class="tiles">
        <a class="work-tile" data-project="acit" href="#acit">
          <img src="${href('/img/acit-mark.webp')}" alt="A Course In Time logo" width="174" height="80">
          <span><em>Flagship</em><strong>A Course In Time</strong><span>Time-switch puzzle-platformer · playable</span></span>
        </a>
        <a class="work-tile" data-project="sword" href="#sword-saint">
          <span class="glyph" aria-hidden="true">SS</span>
          <span><em>Fighting game</em><strong>Sword Saint</strong><span>2 fighters · 7-move shared set · 1 stage</span></span>
        </a>
        <a class="work-tile" data-project="tabi" href="#tabi">
          <img src="${href('/img/tabi-mark.webp')}" alt="Tabi sign-in screen" width="248" height="120">
          <span><em>Tool</em><strong>Tabi</strong><span>Group trip planner · invite-only</span></span>
        </a>
      </div>
      ${action(ACIT, 'Play A Course In Time')}
    </div>
    ${skillPanel(site)}
    <section class="card cv-card"><h2>CV</h2><p>Coming soon: CV. Email <a href="mailto:${esc(email)}">${esc(email)}</a> for a copy.</p></section>
    <section class="card contact-card"><h2>Contact</h2><ul class="contact-lines">
      <li><a href="mailto:${esc(email)}">${esc(email)}</a></li>
      <li><a href="${esc(github)}">GitHub</a></li>
      <li><a href="${esc(itch)}">itch.io</a></li>
    </ul></section>
    <section class="block"><h2>In short</h2><p>${esc(val(site.lede))}</p><p>${esc(val(site.intro))}</p></section>
    ${still('about')}
  </section>`;

  const acitBody = head({
    id: 'acit',
    project: 'acit',
    eyebrow: 'Flagship project',
    mark: '/img/acit-mark.webp',
    title: acit.title,
    hook: 'Switch a hotel between Past and Present to open paths.',
    chipItems: [
      val(acit.overview.role),
      val(acit.overview.team),
      'Unity 6 · C# · FMOD',
      val(acit.overview.timeframe),
    ],
    url: ACIT,
    cta: 'Play in browser',
    media: eraDiagram(acit),
  }) + `
    ${bullets('What I designed', val(acit.contributions))}
    ${systems([
      {
        name: 'Time switch',
        input: 'Shift between Present and Past.',
        rule: 'Collision layers, object state and physics swap in step.',
        outcome: 'A crush check treats time closing around the player as a death rather than a glitch.',
      },
      {
        name: 'Puzzle generators',
        input: 'Scene-view grid painting.',
        rule: 'Pipe networks use a connectivity solver. Elemental puzzles count valid solutions.',
        outcome: 'Puzzles that pick their own elements.',
      },
      {
        name: 'Save',
        input: 'A reloaded world.',
        rule: 'An objective ledger records doors and puzzles.',
        outcome: 'The world remembers which doors are open and which puzzles are done.',
      },
    ])}
    <section class="block"><h2>Mechanics in the playable build</h2><p class="credit-note">A Course In Time is a team build in development, not a shipped storefront credit.</p>
      <ul class="spec-list">${(val(acit.mechanics) || []).map((item) => `<li><strong>${esc(item.name)}</strong> ${esc(item.text)}</li>`).join('')}</ul>
    </section>
    ${still('a-course-in-time')}
  </section>`;

  const swordBody = head({
    id: 'sword-saint',
    project: 'sword',
    eyebrow: 'Fighting game',
    title: sword.title,
    credit: 'Designed by Tyler Crump',
    hook: 'Two fighters, one 7-move set, and a storm-bridge stage in Ikemen GO.',
    chipItems: [
      val(sword.overview.role),
      val(sword.overview.team),
      (val(sword.overview.tools) || []).join(' · '),
    ],
    media: moveList(),
  }) + `
    ${bullets('What I designed', val(sword.contributions))}
    ${systems([
      {
        name: 'Shared moveset',
        input: 'The Sword Saint and Unknown, a mirror fighter on the same moveset.',
        rule: '4 normals, a two-projectile lightning special, a meter-gated super, a back dash, block and a timed perfect block.',
        outcome: 'A stamina system sits on that set.',
      },
      {
        name: 'Broken Bridge',
        input: 'One stage.',
        rule: 'Six layers, with animated lightning and rain.',
        outcome: 'A storm-bridge stage for the two fighters.',
      },
    ])}
    ${still('sword-saint-broken-bridge')}
  </section>`;

  const tabiTools = val(tabi.overview.tools) || [];
  const tabiCore = tabiTools.filter((tool) => !['Visual Studio Code', 'GoodNotes', 'Aseprite'].includes(tool));
  const tabiAlso = tabiTools.filter((tool) => ['Visual Studio Code', 'GoodNotes', 'Aseprite'].includes(tool));
  const tabiBody = head({
    id: 'tabi',
    project: 'tabi',
    eyebrow: 'Tool',
    title: tabi.title,
    hook: 'A group trip planner for any trip and any group, phone-first.',
    chipItems: [
      val(tabi.overview.role),
      val(tabi.overview.team),
      tabiCore.join(' · '),
      val(tabi.overview.timeframe),
    ],
    url: TABI,
    cta: 'Open Tabi',
    media: `<figure class="proj-media">
      <img src="${href('/img/tabi-signin.webp')}" alt="Tabi sign-in screen" width="455" height="220" loading="lazy">
      <figcaption>The public sign-in screen.</figcaption>
    </figure>`,
  }) + `
    ${bullets('What I built', val(tabi.contributions))}
    ${systems([{
      name: 'Money states',
      input: 'Each cost on the budget.',
      rule: 'A cost is marked paid, committed or estimated.',
      outcome: 'The three always add up to the projected cost.',
    }])}
    ${moneyDiagram()}
    <section class="block"><h2>Features</h2><p>${esc(val(tabi.tagline))}</p>
      <p>Also used: ${esc(tabiAlso.join(', '))}.</p>
      <ul class="spec-list">${(val(tabi.mechanics) || []).map((item) => `<li><strong>${esc(item.name)}</strong> ${esc(item.text)}</li>`).join('')}</ul>
    </section>
    <section class="block"><h2>A decision</h2><p><strong>Never show a guess as if it were certain.</strong> ${esc(val((val(tabi.decisions) || []).find((item) => item.decision === 'Never show a guess as if it were certain')?.result) || '')}</p></section>
    ${still('tabi')}
  </section>`;

  const moreProjects = ['waking-nightmare', 'sdcs-booking-app', 'lit-flux-mechanics-showcase', 'gdt2']
    .map((slug) => by[slug])
    .filter(Boolean);

  const playable = {
    'lit-flux-mechanics-showcase': true,
    gdt2: true,
  };

  const more = `<section id="more" class="panel" role="tabpanel" data-project="more" aria-labelledby="more-title">
    <div data-first>
      <p class="eyebrow">Also</p>
      <h1 class="page-title" id="more-title">More</h1>
      <p class="page-sub">Smaller work, with Waking Nightmare Experience first.</p>
    </div>
    <div class="work-list">${moreProjects.map((project) => card(project, playable[project.slug])).join('')}</div>
  </section>`;

  return about + acitBody + swordBody + tabiBody + more;
}

function publicLink(project) {
  const links = Array.isArray(project.links) ? project.links : [];
  const hit = links.find((link) => link?.item && !isPending(link.item) && link.item.value);
  return hit ? { label: hit.label, url: hit.item.value } : null;
}

function card(project, play) {
  const slug = project.slug;
  const link = publicLink(project);
  const playLink = play && link ? `<a class="play-pill" href="${esc(link.url)}">Play</a>` : '';
  const itchLink = !play && link && slug !== 'sdcs-booking-app' ? `<a class="text-link" href="${esc(link.url)}">${esc(/itch/i.test(link.label) ? 'itch.io page' : link.label)}</a>` : '';
  const source = slug === 'sdcs-booking-app' ? `<a class="text-link" href="${SDCS}">Source (GitHub)</a>` : '';
  const tools = confirmed(project.overview.tools);
  const tool = Array.isArray(tools) ? tools.slice(0, 3).join(' · ') : confirmed(project.overview.engine);
  const meta = [confirmed(project.overview.role), confirmed(project.overview.team), tool, confirmed(project.overview.timeframe)].filter(Boolean);
  const letter = project.title.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();
  const body = slug === 'sdcs-booking-app' ? sdcsBody(project) : plainBody(project);
  return `<article class="more-row">
    ${playLink}
    <details class="card work" id="${esc(slug)}">
      <summary>
        <span class="glyph" aria-hidden="true">${esc(letter)}</span>
        <span class="work-text">
          <span class="work-name">${esc(project.title)}</span>
          <span class="work-hook">${esc(hookFor(project))}</span>
          <span class="work-meta">${esc(meta.filter(Boolean).join(' · '))}</span>
        </span>
        <span class="details-hint">Details</span>
      </summary>
      <div class="card-detail">${itchLink}${source}${body}${still(slug)}</div>
    </details>
  </article>`;
}

function hookFor(project) {
  if (project.slug === 'waking-nightmare') return 'VR experience for Meta Quest, made for LiminalVR.';
  if (project.slug === 'sdcs-booking-app') return 'A React Native booking screen for a dog-care service.';
  if (project.slug === 'lit-flux-mechanics-showcase') return 'Unity browser prototype: time swap, time cannon, double jump, dash.';
  if (project.slug === 'gdt2') return 'Unity browser prototype.';
  return val(project.tagline) || '';
}

function plainBody(project) {
  const lines = (val(project.contributions) || []).slice(0, 3);
  const handover = (project.decisions || []).find((item) => /handover/i.test(item.decision || ''));
  return `${bullets('What I designed', lines)}
    ${handover ? `<section class="block"><h2>What happened</h2><p>${esc(handover.detail || '')}</p><p class="credit-note">Handover: an in-progress build.</p></section>` : ''}
    ${(val(project.mechanics) || []).length ? `<ul class="spec-list">${(val(project.mechanics) || []).map((item) => `<li><strong>${esc(item.name)}</strong> ${esc(item.text)}</li>`).join('')}</ul>` : ''}`;
}

function sdcsBody(project) {
  const code = `  const handleCalculate = () => {
    let cost = dogRate * dogHours + serviceRate * serviceQty;
    if (dogRate === 0 || dogHours === 0) {
      cost = 0;
    }
    setTotalCost(cost);
  };`;
  return `${bullets('What I built', val(project.contributions))}
    ${systems([{
      name: 'Cost',
      input: 'Dog hours and a service quantity.',
      rule: 'cost = dogRate * dogHours + serviceRate * serviceQty, and a missing dog or hours sets the cost to 0.',
      outcome: 'The screen shows the total cost.',
    }])}
    <figure class="code-slot">
      <figcaption>App.js, lines 38–44. <a href="${SDCS}">Source (GitHub)</a></figcaption>
      <pre tabindex="0"><code>${esc(code)}</code></pre>
    </figure>`;
}
