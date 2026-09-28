import { esc, val, isPending, pending, field, href } from './lib.mjs';

const TIER_TITLES = { flagship: 'Flagship', supporting: 'Supporting work', experiment: 'Experiments and prototypes' };
const DISCIPLINES = ['Game Design', 'Level Design', 'Gameplay', 'UX', 'Prototyping', 'Playtesting', 'Documentation', 'Programming', 'Tools', 'Team', 'Personal', 'Fighting game', 'Character design', 'Combat design', 'Stage design', 'Ikemen GO'];
const STATUS_TEXT = { evidenced: 'Evidenced', stated: 'Described', pending: 'Pending' };

function link(url, text, cls = '') {
  const ext = /^https?:/.test(url);
  const dest = ext || url.startsWith('mailto:') || url.startsWith('#') ? url : href(url);
  return `<a class="${cls}" href="${esc(dest)}"${ext ? ' rel="noopener"' : ''}>${text}${ext ? '<span class="visually-hidden"> (opens external site)</span>' : ''}</a>`;
}

function projectHref(slug) {
  return href(`/projects/${slug}/index.html`);
}

function card(p) {
  const o = p.overview || {};
  const f = p.filters || {};
  const play = (p.links || []).find(l => !isPending(l.item) && /itch\.io/.test(val(l.item)));
  const year = f.year || 'pending';
  return `<li class="card card--${p.tier}" data-project="${p.slug}" data-disciplines="${esc((f.disciplines || []).join('|'))}" data-engine="${esc(f.engine || 'pending')}" data-type="${esc(f.type || 'pending')}" data-stage="${esc(f.stage || 'pending')}" data-year="${esc(year)}">
  <article aria-labelledby="card-${p.slug}">
    <h4 class="card__title" id="card-${p.slug}"><a href="${projectHref(p.slug)}">${esc(p.title)}</a></h4>
    <p class="card__meta">${[o.type, o.engine, o.stage].filter(x => x && !isPending(x)).map(x => esc(val(x))).join(' · ')}</p>
    <p class="card__tagline">${field(p.tagline)}</p>
    <dl class="card__facts">
      <div><dt>Role</dt><dd>${field(o.role, esc, { inline: true, label: 'Pending' })}</dd></div>
      <div><dt>Team</dt><dd>${field(o.team, esc, { inline: true, label: 'Pending' })}</dd></div>
    </dl>
    <ul class="tags" aria-label="Disciplines">${(f.disciplines || []).map(d => `<li>${esc(d)}</li>`).join('')}</ul>
    <p class="card__links"><a href="${projectHref(p.slug)}">Case study<span class="visually-hidden">: ${esc(p.title)}</span></a>${play ? link(val(play.item), 'Play / itch.io page<span class="visually-hidden">: ' + esc(p.title) + '</span>') : ''}</p>
  </article>
</li>`;
}

function select(name, label, values) {
  return `<div class="filter-select"><label for="f-${name}">${label}</label><select id="f-${name}" data-filter="${name}"><option value="">Any</option>${values.map(v => `<option value="${esc(v)}">${esc(v === 'pending' ? 'Not yet confirmed' : v)}</option>`).join('')}</select></div>`;
}

export function home(site, projects) {
  const vis = projects.filter(p => p.visible);
  const flagship = vis.find(p => p.tier === 'flagship');
  const flagPlay = flagship && (flagship.links || []).find(l => !isPending(l.item) && /itch\.io/.test(val(l.item)));
  const c = site.contact;
  const uniq = (k) => [...new Set(vis.map(p => (p.filters || {})[k] || 'pending'))].sort();
  const usedDisc = DISCIPLINES.filter(d => vis.some(p => (p.filters.disciplines || []).includes(d)));
  const unusedDisc = DISCIPLINES.filter(d => !usedDisc.includes(d));

  const approach = val(site.approach);

  const hero = `<section class="hero wrap" aria-labelledby="hero-title">
  <div class="hero__text">
    <h1 id="hero-title"><span class="hero__name">Tyler Crump</span> <span class="hero__role">${esc(val(site.role))}</span></h1>
    <p class="lede">${esc(val(site.lede))}</p>
    <p class="hero__intro">${esc(val(site.intro))}</p>
    <ol class="approach-strip" aria-label="How I work">${approach.map((s, i) => `<li><span class="approach-strip__n" aria-hidden="true">${i + 1}</span>${esc(s.step)}</li>`).join('')}</ol>
    <p class="hero__cta">
      ${flagship ? `<a class="btn btn--primary" href="${projectHref(flagship.slug)}">Read the flagship case study</a>` : ''}
      ${flagPlay ? link(val(flagPlay.item), `Play ${esc(flagship.title)}`, 'btn') : ''}
      <a class="btn" href="mailto:${esc(val(c.email))}">Email me</a>
    </p>
  </div>
  <aside class="glance" aria-labelledby="glance-title">
    <h2 id="glance-title" class="glance__title">At a glance</h2>
    <dl>
      <div><dt>Looking for</dt><dd>${esc(val(site.openTo))}</dd></div>
      <div><dt>Flagship</dt><dd>${flagship ? `<a href="${projectHref(flagship.slug)}">${esc(flagship.title)}</a> — ${esc(val(flagship.overview.genre))}, ${esc(val(flagship.overview.engine))}` : ''}</dd></div>
      <div><dt>Strongest at</dt><dd>${esc(val(site.strongestSkill))}</dd></div>
      <div><dt>Tools</dt><dd>Unity 6, C#, FMOD Studio, Git</dd></div>
      <div><dt>Work</dt><dd>${link(val(c.itch), 'itch.io')} · ${link(val(c.github), 'GitHub')}</dd></div>
      <div><dt>Contact</dt><dd><a href="mailto:${esc(val(c.email))}">${esc(val(c.email))}</a></dd></div>
    </dl>
  </aside>
</section>`;

  const tiers = ['flagship', 'supporting', 'experiment'].map(t => {
    const list = vis.filter(p => p.tier === t).sort((a, b) => a.order - b.order);
    if (!list.length) return '';
    return `<div class="tier tier--${t}" data-tier="${t}"><h3 class="tier__title">${TIER_TITLES[t]}</h3><ul class="cards" role="list">${list.map(card).join('')}</ul></div>`;
  }).join('');

  const work = `<section id="work" class="section wrap" aria-labelledby="work-title">
  <h2 id="work-title" class="section__title">Work</h2>
  <p class="section__intro">Ordered by what shows the most about how I design. Filter by the kind of work you're hiring for.</p>
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

  const rows = site.benchmark.rows;
  const counts = rows.reduce((m, r) => (m[r.level] = (m[r.level] || 0) + 1, m), {});
  const evidence = `<section id="evidence" class="section wrap" aria-labelledby="evidence-title">
  <h2 id="evidence-title" class="section__title">Evidence ledger</h2>
  <p class="section__intro">What each design skill is backed by. <strong>Evidenced</strong> means you can open it; <strong>Described</strong> means I've written about it but haven't published the artefact yet; <strong>Pending</strong> means the work is still to come here. ${counts.evidenced || 0} evidenced · ${counts.stated || 0} described · ${counts.pending || 0} pending.</p>
  <table class="ledger">
    <caption class="visually-hidden">Design skills and the evidence behind each</caption>
    <thead><tr><th scope="col">Skill</th><th scope="col">Status</th><th scope="col">Where</th><th scope="col">Notes</th></tr></thead>
    <tbody>${rows.map(r => {
      const p = r.where && vis.find(x => x.slug === r.where);
      return `<tr class="ledger__row ledger__row--${r.level}"><th scope="row">${esc(r.skill)}</th><td data-label="Status"><span class="status status--${r.level}">${STATUS_TEXT[r.level]}</span></td><td data-label="Where">${p ? `<a href="${projectHref(p.slug)}">${esc(p.title)}</a>` : '<span class="muted">—</span>'}</td><td data-label="Notes">${esc(r.note)}</td></tr>`;
    }).join('')}</tbody>
  </table>
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

  const skillRows = site.skills.rows.filter(r => !r.hide).map(r => ({ ...r, projects: (r.projects || []).filter(s => vis.some(p => p.slug === s)) }));
  const cols = vis.slice().sort((a, b) => a.order - b.order);
  const skills = `<section id="skills" class="section wrap" aria-labelledby="skills-title">
  <h2 id="skills-title" class="section__title">Skills and tools</h2>
  <p class="section__intro">Where each skill was used. Choose a skill to filter Work to those projects. A filled square is published work. A hollow square is something I have said I did, without a file on this site yet. <em>Tyler-attested, evidence pending</em> means that file is still to come. <em>Evidence coming</em> means I use the tool and have not published a project for it.</p>
  <div class="matrix-wrap" tabindex="0" role="region" aria-labelledby="skills-title">
  <table class="matrix">
    <caption class="visually-hidden">Skills by project. A filled square means published work on that project. A hollow square means Tyler-attested, and the file is not published yet.</caption>
    <thead><tr><th scope="col">Skill</th>${cols.map(p => `<th scope="col"><span class="matrix__col">${esc(p.title)}</span></th>`).join('')}</tr></thead>
    <tbody>${skillRows.map(r => {
      const FLAG_TEXT = { coming: 'evidence coming', general: 'general', attested: 'Tyler-attested', 'attested-pending': 'Tyler-attested, evidence pending' };
      const skill = r.projects.length
        ? `<button type="button" class="linklike matrix__skill" data-skill="${esc(r.skill)}" data-skill-projects="${r.projects.join(' ')}">${esc(r.skill)}</button>`
        : `<span class="matrix__skill">${esc(r.skill)}</span>`;
      const flag = FLAG_TEXT[r.evidence] ? ` <span class="flag flag--${esc(r.evidence)}">${FLAG_TEXT[r.evidence]}</span>` : '';
      const cells = cols.map(p => {
        if (!r.projects.includes(p.slug)) return `<td class="no"><span class="visually-hidden">Not used</span></td>`;
        if (r.evidence === 'attested' || r.evidence === 'attested-pending') {
          const hidden = r.evidence === 'attested-pending' ? 'Tyler-attested, evidence pending' : 'Tyler-attested';
          return `<td class="yes yes--attested"><span aria-hidden="true">□</span><span class="visually-hidden">${hidden}</span></td>`;
        }
        return `<td class="yes"><span aria-hidden="true">■</span><span class="visually-hidden">Used</span></td>`;
      }).join('');
      return `<tr><th scope="row"><span class="matrix__group">${esc(r.group)}</span>${skill}${flag}</th>${cells}</tr>`;
    }).join('')}</tbody>
  </table>
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

  const about = `<section id="about" class="section wrap about" aria-labelledby="about-title">
  <div>
    <h2 id="about-title" class="section__title">About</h2>
    <p>${esc(val(site.about.body))}</p>
    ${field(site.about.education, v => `<p>${esc(v)}</p>`)}
    ${field(site.about.personal, v => `<p>${esc(v)}</p>`)}
  </div>
  <div id="resume">
    <h2 class="section__title">Résumé</h2>
    ${field(site.resume, v => `<p>${esc(v)}</p><p><a class="btn" href="${href('/cv.pdf')}" download>Download CV (PDF)</a></p>`)}
  </div>
</section>`;

  const contact = `<section id="contact" class="section wrap" aria-labelledby="contact-title">
  <h2 id="contact-title" class="section__title">Contact</h2>
  <p class="contact__lead">Open to ${esc(val(site.openTo).replace(/^./, m => m.toLowerCase()).replace(/\.$/, ''))} — and happy to talk about anything on this site.</p>
  <ul class="contact" role="list">
    <li><a class="btn btn--primary" href="mailto:${esc(val(c.email))}">Email ${esc(val(c.email))}</a></li>
    <li>${link(val(c.github), 'GitHub', 'btn')}</li>
    <li>${link(val(c.itch), 'itch.io', 'btn')}</li>
    ${isPending(c.steam) ? '' : `<li>${link(val(c.steam), 'Steam', 'btn')}</li>`}
    ${isPending(c.linkedin) ? '' : `<li>${link(val(c.linkedin), 'LinkedIn', 'btn')}</li>`}
  </ul>
</section>`;

  return hero + work + evidence + method + skills + docs + journal + about + contact;
}
