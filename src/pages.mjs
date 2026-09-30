import { esc, join, pad, img, externalLink } from './lib.mjs';
import { inspector } from './inspector.mjs';
import { block } from './blocks.mjs';

const fact = (project, label) => (project.facts.find(([k]) => k === label) || [])[1];
const caseUrl = (p) => `${p.slug}.html`;

function cover(p, { eager = false, caption = true } = {}) {
  const c = p.cover;
  // The same view-transition name on the homepage and the case study lets the cover morph between them.
  return `<figure class="cover cover--${c.tone} cover--${c.fit}">
    <div class="cover__frame" style="view-transition-name: cover-${p.slug}">${img({ ...c, eager })}</div>
    ${caption ? `<figcaption>${esc(c.caption)}</figcaption>` : ''}
  </figure>`;
}

function actions(p, { primary = true } = {}) {
  const read = primary ? `<a class="btn btn--solid" href="${caseUrl(p)}"><span>Read case study <span aria-hidden="true">→</span></span></a>` : '';
  const links = join(p.links, (l) => externalLink(l.url, l.label, 'btn btn--line', l.note));
  return `<div class="actions">${read}${links}</div>`;
}

// ---------- Home ----------

function workEntry(p, i) {
  const variant = p.group === 'product' ? 'product' : ['lead', 'mirror', 'compact'][i] || 'compact';
  const verb = p.group === 'product' || p.slug === 'sword-saint-broken-bridge' ? 'One thing I designed' : 'One thing I built';
  return `<article class="scene scene--${p.cover.tone}" id="work-${p.slug}" data-scene aria-labelledby="work-${p.slug}-title">
    <span class="scene__index" aria-hidden="true">${pad(i + 1)}</span>
    <div class="wrap work work--${variant}">
      <a class="work__media" href="${caseUrl(p)}" tabindex="-1" aria-hidden="true">${cover(p, { caption: false })}</a>
      <div class="work__body">
        <p class="work__index"><span>${pad(i + 1)}</span>${esc(p.kicker)}</p>
        <h3 class="work__title" id="work-${p.slug}-title"><a href="${caseUrl(p)}">${esc(p.title)}</a>${p.subtitle ? ` <span class="work__alt">${esc(p.subtitle)}</span>` : ''}</h3>
        <p class="work__pitch">${esc(p.pitch)}</p>
        <dl class="work__facts">
          <div><dt>My role</dt><dd>${esc(p.role)}</dd></div>
          <div class="work__highlight"><dt>${verb}</dt><dd>${esc(p.contribution)}</dd></div>
          <div><dt>Tools</dt><dd>${esc(fact(p, 'Tools'))}</dd></div>
          <div><dt>Status</dt><dd>${esc(fact(p, 'Status'))}</dd></div>
        </dl>
        ${actions(p)}
      </div>
    </div>
  </article>`;
}

export function home(site, projects) {
  const start = projects.find((p) => p.slug === site.start.slug);
  const games = projects.filter((p) => p.group === 'game');
  const other = projects.filter((p) => p.group !== 'game');
  const bySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));
  return `<section class="intro" id="top" aria-labelledby="intro-title">
  <div class="wrap intro__grid">
    <div class="intro__copy">
      <p class="kicker">${esc(site.name)} · ${esc(site.role)} · ${esc(site.location)}</p>
      <h1 id="intro-title">${esc(site.headline)}</h1>
      <p class="lede">${esc(site.lede)}</p>
      <div class="start">
        <p class="start__label">${esc(site.start.label)}</p>
        <p class="start__title"><a href="${caseUrl(start)}">${esc(start.title)}</a> <span>${esc(start.kicker)}</span></p>
        <p class="start__note">${esc(site.start.note)}</p>
        ${actions(start)}
      </div>
      <p class="intro__contact"><a href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a><a href="${esc(site.resume.file)}" download>Download résumé <span class="meta">${esc(site.resume.format)} · ${esc(site.resume.size)}</span></a></p>
    </div>
    <div class="intro__demo">
      ${inspector({ id: 'era', headingLevel: 2, title: 'Try the core rule of A Course In Time', link: `<a href="${caseUrl(start)}#decisions">How I built it →</a>` })}
    </div>
  </div>
</section>

<section class="section" id="work" aria-labelledby="work-title">
  <div class="wrap">
    <header class="section__head">
      <p class="kicker">Selected work</p>
      <h2 id="work-title">Three games, and one product outside games.</h2>
      <p>Each entry says what I personally did. Team credits and what's still missing are on the case-study pages.</p>
    </header>
  </div>
  ${games.map(workEntry).join('')}
</section>

${other.length ? `<section class="section section--alt" id="beyond-games" aria-labelledby="beyond-title">
  <div class="wrap">
    <header class="section__head">
      <p class="kicker">Outside games</p>
      <h2 id="beyond-title">The same habits in a product.</h2>
      <p>Honest states, clear feedback and small iterations, applied to a live web app.</p>
    </header>
  </div>
  ${other.map((p) => workEntry(p, games.length)).join('')}
</section>` : ''}

<section class="section" id="evidence" aria-labelledby="evidence-title">
  <div class="wrap">
    <header class="section__head">
      <p class="kicker">Capabilities</p>
      <h2 id="evidence-title">What I can do, and where it's shown.</h2>
    </header>
    <div class="table-scroll" tabindex="0" role="region" aria-labelledby="evidence-title">
    <table class="table evidence">
      <thead><tr><th scope="col">Capability</th><th scope="col">Tools</th><th scope="col">Evidence</th><th scope="col">Where</th></tr></thead>
      <tbody>${site.capabilities.map((c) => `<tr><th scope="row">${esc(c.name)}</th><td>${esc(c.detail)}</td><td>${esc(c.evidence)}</td><td><a href="${caseUrl(bySlug[c.slug])}">${esc(bySlug[c.slug].shortTitle || bySlug[c.slug].title)}</a></td></tr>`).join('')}</tbody>
    </table>
    </div>
  </div>
</section>

<section class="section section--alt" id="about" aria-labelledby="about-title">
  <div class="wrap about">
    <header class="section__head">
      <p class="kicker">About</p>
      <h2 id="about-title">Hi, I'm Tyler.</h2>
    </header>
    <div class="about__text">${site.about.paragraphs.map((t) => `<p>${esc(t)}</p>`).join('')}<p class="open-to">${esc(site.openTo)}</p></div>
    <dl class="defs about__facts">${site.about.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    <div class="about__other">
      <h3>Other coursework</h3>
      ${site.about.other.map((o) => `<p><strong>${esc(o.title)}</strong> <span class="meta">${esc(o.context)}</span><br>${esc(o.text)}</p>`).join('')}
    </div>
  </div>
</section>

<section class="section contact" id="contact" aria-labelledby="contact-title">
  <div class="wrap">
    <p class="kicker">Contact</p>
    <h2 id="contact-title">Hiring for a junior design, gameplay or tools role? Get in touch.</h2>
    <p class="contact__email"><a href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a></p>
    <ul class="contact__links">
      <li><a href="${esc(site.resume.file)}" download>Résumé <span class="meta">${esc(site.resume.format)} · ${esc(site.resume.size)}</span></a></li>
      <li>${externalLink(site.contact.github, 'GitHub')}</li>
      <li>${externalLink(site.contact.itch, 'itch.io')}</li>
    </ul>
  </div>
</section>`;
}

// ---------- Case study ----------

export function caseStudy(site, p, projects) {
  const i = projects.indexOf(p);
  const next = projects[(i + 1) % projects.length];
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const toc = p.sections.map((s) => `<li><a href="#${s.id}">${esc(s.kicker)}</a></li>`).join('');
  return `<article class="case" aria-labelledby="case-title">
  <header class="wrap case__head">
    <p class="crumb"><a href="index.html#work"><span aria-hidden="true">←</span> Selected work</a></p>
    <p class="kicker">${esc(p.kicker)}</p>
    <h1 id="case-title">${esc(p.title)}${p.subtitle ? ` <span class="case__alt">${esc(p.subtitle)}</span>` : ''}</h1>
    <p class="lede">${esc(p.pitch)}</p>
    ${p.links.length ? actions(p, { primary: false }) : '<p class="meta">No public build yet.</p>'}
  </header>
  <div class="wrap case__top">
    ${cover(p, { eager: true })}
    <dl class="facts">${p.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  </div>
  <section class="wrap quick" aria-labelledby="quick-title">
    <h2 class="quick__title" id="quick-title">In 30 seconds</h2>
    <dl class="quick__grid">${p.quick.map((q) => `<div><dt>${esc(q.label)}</dt><dd>${esc(q.text)}</dd></div>`).join('')}</dl>
  </section>
  <div class="wrap case__layout">
    <nav class="toc" aria-label="On this page"><p class="toc__title">On this page</p><ol>${toc}</ol></nav>
    <div class="case__body">${p.sections.map(block).join('')}</div>
  </div>
  <nav class="wrap pager" aria-label="More projects">
    <a class="pager__link" href="${caseUrl(prev)}"><span class="meta">Previous</span>${esc(prev.title)}</a>
    <a class="pager__link pager__link--next" href="${caseUrl(next)}"><span class="meta">Next</span>${esc(next.title)}</a>
  </nav>
</article>`;
}

// ---------- Utility pages ----------

export function moved({ title, target, text }) {
  return `<section class="wrap notice"><p class="kicker">Moved</p><h1>${esc(title)}</h1><p>${esc(text)}</p><p><a class="btn btn--solid" href="${esc(target)}"><span>Continue <span aria-hidden="true">→</span></span></a></p></section>`;
}

export function notFound() {
  return `<section class="wrap notice"><p class="kicker">404</p><h1>This room doesn't exist in this era.</h1><p>The page you were looking for isn't here.</p><p><a class="btn btn--solid" href="/"><span>Back to the portfolio <span aria-hidden="true">→</span></span></a></p></section>`;
}
