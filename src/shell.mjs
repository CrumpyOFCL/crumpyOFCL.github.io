import { esc, href, val, isPending } from './lib.mjs';

const item = (field) => isPending(field) ? null : val(field);
const linkOf = (project) => (project.links || []).find((link) => link.item && !isPending(link.item) && link.item.value);
const external = (url, label, cls = 'text-action') => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} <span aria-hidden="true">↗</span><span class="sr-only"> (opens in new tab)</span></a>`;

function fact(label, value) { return `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`; }
function number(n, label, text) { return `<div class="number"><span>${n}</span><strong>${label}</strong><p>${text}</p></div>`; }

export function shell(site, projects) {
  const by = Object.fromEntries(projects.map((p) => [p.slug, p]));
  const acit = by['a-course-in-time'];
  const sword = by['sword-saint-broken-bridge'];
  const tabi = by.tabi;
  const acitLink = linkOf(acit)?.item.value;
  const tabiLink = linkOf(tabi)?.item.value;
  const email = item(site.contact.email);
  const github = item(site.contact.github);
  const itch = item(site.contact.itch);
  const more = ['waking-nightmare', 'lit-flux-mechanics-showcase', 'gdt2', 'sdcs-booking-app'].map((slug) => by[slug]).filter(Boolean);

  return `<header class="site-header">
    <div class="header-inner wrap">
      <a class="brand" href="#top" aria-label="Tyler Crump, back to top"><span class="brand-mark">TC<span class="brand-dot">.</span></span><span class="brand-name">TYLER CRUMP<small>GAME DESIGN · SYSTEMS · UX</small></span></a>
      <button class="menu-toggle" type="button" aria-controls="site-nav" aria-expanded="false">Menu <span aria-hidden="true">☰</span></button>
      <nav class="site-nav" id="site-nav" aria-label="Main navigation">
        <a href="#work">Selected work</a><a href="#approach">Approach</a><a href="#other-work">More projects</a><a href="#about">About</a><a class="nav-contact" href="mailto:${esc(email)}">Get in touch <span aria-hidden="true">↗</span></a>
      </nav>
    </div>
  </header>
  <main id="main">
    <section class="hero" id="top" aria-labelledby="hero-title">
      <div class="hero-grid wrap">
        <div class="hero-copy">
          <p class="kicker"><span class="signal"></span> PORTFOLIO / TYLER CRUMP</p>
          <h1 id="hero-title">I design the rules <em>players discover.</em></h1>
          <p class="hero-lede">Game designer and developer focused on gameplay systems, levels and the tools that make iteration possible. I work in Unity and C# and bring the same player-centred thinking to product design.</p>
          <div class="hero-actions"><a class="button button-bright" href="#work">Explore selected work <span aria-hidden="true">↘</span></a>${external(acitLink, 'Play A Course In Time', 'button button-outline')}</div>
          <div class="hero-proof"><span>UNITY 6 / C# / FMOD</span><span>TEAM LEAD · 5-PERSON GAME</span><span>OPEN TO JUNIOR ROLES</span></div>
        </div>
        <div class="hero-art" aria-label="Graphic showing the Past and Present hotel states in A Course In Time" role="img">
          <div class="art-glow"></div><div class="art-ring ring-one"></div><div class="art-ring ring-two"></div>
          <div class="art-slice slice-past"><span>01 / PAST</span><div class="art-building"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
          <div class="art-slice slice-present"><span>02 / PRESENT</span><div class="art-building"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
          <div class="art-center"><span>TIME<br>SWITCH</span><b>↔</b></div>
          <div class="art-caption">A COURSE IN TIME <span>↗</span></div>
        </div>
      </div>
      <div class="hero-foot wrap"><span>SCROLL TO EXPLORE</span><span>01 / SELECTED WORK</span></div>
    </section>

    <section class="section work-section wrap" id="work" aria-labelledby="work-title">
      <div class="section-heading"><div><p class="eyebrow">01 / THE WORK</p><h2 id="work-title">Built to be <em>played.</em></h2></div><p>Three different design problems, one consistent goal: make complex systems feel clear to the person using them.</p></div>
      <article class="feature feature-acit" id="acit" aria-labelledby="acit-title">
        <div class="feature-image acit-image"><div class="image-grid"></div><div class="image-label">FEATURED GAME / UNITY 6</div><img src="${href('/img/acit-logo.png')}" alt="A Course In Time game logo" width="600" height="240"><div class="image-bottom"><span>PAST ← → PRESENT</span><span>01 / 03</span></div></div>
        <div class="feature-copy"><p class="eyebrow">CASE STUDY 01 · PUZZLE PLATFORMER</p><h3 id="acit-title">A Course<br>In Time<span class="accent">.</span></h3><p class="feature-lede">${esc(item(acit.tagline))}</p>
          <dl class="facts">${fact('MY ROLE', 'Producer / team lead · level design, audio & programming')}${fact('TEAM', '5 people · university project')}${fact('TOOLS', 'Unity 6 · C# · FMOD')}${fact('STATUS', 'Playable build · in development')}</dl>
          <div class="feature-actions"><a class="button button-accent" href="#acit-case">Read case study <span aria-hidden="true">↓</span></a>${external(acitLink, 'Play the build')}</div>
        </div>
      </article>
      <div class="case-study" id="acit-case">
        <div class="case-intro"><p class="eyebrow">THE DESIGN CHALLENGE</p><h4>One hotel. Two eras.<br><em>A world that remembers.</em></h4><p>Switching time changes platforms, hazards and routes. The design depends on those changes remaining predictable while the player carries progress across eras.</p></div>
        <div class="decision-grid">
          <div class="decision"><span>01 / WORLD RULES</span><h5>Time switch</h5><p>I built the era system to swap collision layers, object state and physics together. A crush check turns a closing space into a clear failure state.</p></div>
          <div class="decision"><span>02 / AUTHORING</span><h5>Puzzle generators</h5><p>Scene-view grid painting speeds up level authoring. Pipe networks use a connectivity solver; elemental puzzles count valid solutions before selecting elements.</p></div>
          <div class="decision"><span>03 / CONTINUITY</span><h5>Save and test</h5><p>An objective ledger restores completed puzzles and opened doors. A debug console gives playtesters scene jumps, abilities and objective control without the editor.</p></div>
        </div><p class="case-note">Team project. The contributions above describe my documented systems and tools; the playable build is still in development.</p>
      </div>

      <div class="secondary-grid">
        <article class="project-card sword-card" id="sword-saint" aria-labelledby="sword-title"><div class="card-art sword-art"><div class="fighter fighter-left"><span></span></div><div class="versus">VS</div><div class="fighter fighter-right"><span></span></div><div class="storm-line"></div><p>COMBAT / CHARACTER / STAGE</p></div><div class="card-copy"><p class="eyebrow">02 / FIGHTING GAME · SOLO DESIGN</p><h3 id="sword-title">Sword Saint:<br>Broken Bridge</h3><p>${esc(item(sword.tagline))}</p><div class="stat-row"><span><strong>02</strong> fighters</span><span><strong>07</strong> shared moves</span><span><strong>06</strong> stage layers</span></div><details><summary>Design breakdown <span aria-hidden="true">+</span></summary><div class="details-body"><p>Four normals, a two-projectile lightning special, a meter-gated super and a back dash. Blocking includes a timed perfect block, with stamina as another combat system.</p><p>Broken Bridge is a six-layer storm stage with animated rain and lightning. No public playable build or gameplay media is listed yet.</p></div></details></div></article>
        <article class="project-card tabi-card" id="tabi" aria-labelledby="tabi-title"><div class="card-art tabi-art"><div class="tabi-panel"><img src="${href('/img/tabi-mark.webp')}" alt="" width="248" height="120"><div class="tabi-line"></div><span>THE PLAN, THE PEOPLE,<br>THE MONEY.</span></div><p>PRODUCT DESIGN / DEVELOPMENT</p></div><div class="card-copy"><p class="eyebrow">03 / PRODUCT & UX · SOLO PROJECT</p><h3 id="tabi-title">Tabi<span class="accent">.</span></h3><p>A group trip planner for any trip and any group. It gives the plan, budget and people one clear place to live, designed first for a phone.</p><div class="stat-row"><span><strong>03</strong> money states</span><span><strong>01</strong> shared plan</span></div><details><summary>Design breakdown <span aria-hidden="true">+</span></summary><div class="details-body"><p><strong>Decision:</strong> keep paid, committed and estimated costs distinct, so a guess never reads like money already spent. The three states add up to the projected total.</p><p>The home view changes from a countdown before the trip to Today's plan during it. Each trip has its own invite-only group with viewer and editor roles. A Japan trip was the first real use, not the product's limit.</p><p>The live app is invite-only; the public link opens its sign-in screen.</p></div></details><div class="card-actions">${external(tabiLink, 'View Tabi')}</div></div></article>
      </div>
    </section>

    <section class="approach-section" id="approach" aria-labelledby="approach-title"><div class="wrap approach-grid"><div><p class="eyebrow">02 / HOW I WORK</p><h2 id="approach-title">Good ideas need <em>good tools.</em></h2><p>I enjoy designing what players see and building what makes the design practical to test, change and expand.</p></div><div class="approach-list">${number('01', 'Prototype the rule', 'Put a mechanic into a playable state early, then test whether its behaviour is legible.')}${number('02', 'Make iteration cheap', 'Create editor tools and repeatable systems so a designer can explore more than one solution.')}${number('03', 'Keep the player in view', 'Use clear feedback, honest states and useful playtest controls to expose what needs work.')}</div></div></section>

    <section class="section archive-section wrap" id="other-work" aria-labelledby="archive-title"><div class="section-heading"><div><p class="eyebrow">03 / MORE PROJECTS</p><h2 id="archive-title">The wider <em>practice.</em></h2></div><p>Game prototypes, client work and product development all shape how I solve design problems.</p></div><div class="archive-list">${more.map((p, i) => archiveRow(p, i)).join('')}</div></section>

    <section class="about-section" id="about" aria-labelledby="about-title"><div class="wrap about-grid"><div><p class="eyebrow">04 / ABOUT</p><h2 id="about-title">Design is better<br>when it <em>works.</em></h2></div><div><p class="about-lede">I’m Tyler, a game development student who designs gameplay systems, levels and player experiences, then builds the tools to make them real.</p><p>My work ranges from a five-person Unity puzzle platformer to a VR client project, fighting game design and a live travel planning product. I’m interested in junior game design, level design, gameplay and tools roles.</p><div class="skill-groups"><div><span>GAME</span><p>Systems · Levels · Combat · Playtesting</p></div><div><span>BUILD</span><p>Unity · C# · FMOD · Ikemen GO</p></div><div><span>BEYOND</span><p>UX · JavaScript · Express · SQLite</p></div></div></div></div></section>
    <section class="contact-section wrap" id="contact"><p class="eyebrow">LET'S TALK</p><h2>Have a role or project<br>in mind? <em>Get in touch.</em></h2><a class="contact-email" href="mailto:${esc(email)}">${esc(email)} <span aria-hidden="true">↗</span></a><div class="socials">${external(github, 'GitHub')}${external(itch, 'itch.io')}</div></section>
  </main><footer class="footer"><div class="wrap"><span>© ${new Date().getUTCFullYear()} TYLER CRUMP</span><span>GAME DESIGN · SYSTEMS · UX</span><a href="#top">BACK TO TOP ↑</a></div></footer>`;
}

function archiveRow(project, index) {
  const slug = project.slug;
  const labels = {
    'waking-nightmare': 'VR CLIENT PROJECT',
    'lit-flux-mechanics-showcase': 'PLAYABLE PROTOTYPE',
    gdt2: 'PLAYABLE PROTOTYPE',
    'sdcs-booking-app': 'MOBILE PRODUCT',
  };
  const link = linkOf(project);
  const desc = item(project.tagline) || '';
  const url = link?.item.value;
  return `<article class="archive-row"><span class="archive-index">${String(index + 4).padStart(2, '0')}</span><div><p class="eyebrow">${labels[slug] || 'PROJECT'}</p><h3>${esc(project.title)}</h3><p>${esc(desc)}</p>${slug === 'waking-nightmare' ? '<p class="archive-note">Creative direction, programming and client liaison for a five-person team. Delivered as an in-progress build.</p>' : ''}</div><span class="archive-tool">${esc(item(project.overview.engine) || '')}</span>${url ? external(url, link.label, 'archive-link') : ''}</article>`;
}
