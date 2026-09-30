// Case-study section renderers, one per `type` in content/projects/*.json.
import { esc, join, pad, img } from './lib.mjs';
import { inspector } from './inspector.mjs';

const para = (text) => (text ? `<p>${esc(text)}</p>` : '');
const gap = (text) => (text ? `<p class="gap"><span class="gap__tag">Not yet documented</span> ${esc(text)}</p>` : '');

function head(s) {
  return `<header class="block__head"><p class="kicker">${esc(s.kicker)}</p><h2 id="${s.id}-title">${esc(s.title)}</h2></header>`;
}

const renderers = {
  loop(s) {
    const steps = s.steps.map((step, i) => `<li><span class="loop__n">${pad(i + 1)}</span>${esc(step)}</li>`).join('');
    const abilities = join(s.abilities, ([name, text]) => `<div><dt>${esc(name)}</dt><dd>${esc(text)}</dd></div>`);
    return `${para(s.intro)}
      <div class="loop"><p class="loop__label">Core loop</p><ol class="loop__steps">${steps}</ol><p class="loop__back" aria-hidden="true">↺ repeat with new tools</p></div>
      ${abilities ? `<h3 class="sub">Abilities</h3><dl class="defs defs--grid">${abilities}</dl>` : ''}
      ${s.source ? `<p class="source">${esc(s.source)}</p>` : ''}`;
  },

  inspector(s) {
    return `${para(s.intro)}${inspector({ id: 'era', headingLevel: 3, title: 'Era switch inspector', link: '' })}`;
  },

  decisions(s) {
    const rows = [
      ['goal', 'Goal'], ['constraint', 'Constraint'], ['alternatives', 'Tried first'], ['decision', 'Decision'],
      ['implementation', 'How it works'], ['effect', 'For the player'],
    ];
    return `<ol class="decisions">${s.items.map((d, i) => `<li class="decision">
      <h3><span class="decision__n">${pad(i + 1)}</span>${esc(d.title)}</h3>
      <dl class="chain">${join(rows, ([key, label]) => d[key] ? `<div class="chain__row chain__row--${key}"><dt>${esc(key === 'effect' ? d.effectLabel || s.effectLabel || label : label)}</dt><dd>${esc(d[key])}</dd></div>` : '')}</dl>
    </li>`).join('')}</ol>`;
  },

  list(s) {
    return `${para(s.intro)}<ul class="ticks">${s.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  },

  production(s) {
    return `<dl class="defs">${s.items.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>${gap(s.gap)}`;
  },

  notes(s) {
    return `${para(s.intro)}<dl class="defs">${s.items.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>${gap(s.gap)}`;
  },

  credits(s) {
    return `<table class="table credits"><caption class="sr-only">Team credits</caption><thead><tr><th scope="col">Name</th><th scope="col">Role</th></tr></thead><tbody>${s.rows.map(([name, role, me]) => `<tr${me ? ' class="is-me"' : ''}><th scope="row">${esc(name)}${me ? ' <span class="me-tag">me</span>' : ''}</th><td>${esc(role)}</td></tr>`).join('')}</tbody></table>${s.note ? `<p class="source">${esc(s.note)}</p>` : ''}`;
  },

  table(s) {
    return `${para(s.intro)}<div class="table-scroll" tabindex="0" role="region" aria-labelledby="${s.id}-title"><table class="table"><thead><tr>${s.head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${s.rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>${s.note ? `<p class="source">${esc(s.note)}</p>` : ''}`;
  },

  figure(s) {
    return `${para(s.intro)}<figure class="plate${s.wide ? ' plate--wide' : ''}${s.pixel ? ' plate--pixel' : ''}">${img({ src: s.src, alt: s.alt, width: s.width, height: s.height, pixel: s.pixel })}<figcaption>${esc(s.caption)} <a href="${esc(s.src)}">Full size</a></figcaption></figure>`;
  },

  flow(s) {
    return `${para(s.intro)}<div class="flow">${s.lanes.map((lane) => `<div class="flow__lane"><p class="flow__label">${esc(lane.label)}</p><ol class="flow__nodes">${lane.nodes.map((n) => `<li>${esc(n)}</li>`).join('')}</ol></div>`).join('')}</div>${s.note ? `<p class="source">${esc(s.note)}</p>` : ''}`;
  },

  money(s) {
    const parts = [['paid', 'Paid', 'Money already spent', 38], ['committed', 'Committed', 'Booked, not fully paid', 34], ['estimated', 'Estimated', 'A guess, until it is booked', 28]];
    return `${para(s.intro)}<figure class="money"><div class="money__bar" aria-hidden="true">${parts.map(([k, , , w]) => `<span class="money__seg money__seg--${k}" style="flex-basis:${w}%"></span>`).join('')}</div>
      <ul class="money__legend">${parts.map(([k, label, text]) => `<li><span class="key key--${k}"></span><strong>${label}</strong> ${text}</li>`).join('')}<li class="money__total"><strong>= Projected total</strong> always the sum of the three</li></ul>
      <figcaption class="source">${esc(s.note)}</figcaption></figure>`;
  },

  timeline(s) {
    return `${para(s.intro)}<ol class="timeline">${s.items.map(([label, text]) => `<li><span class="timeline__label">${esc(label)}</span><p>${esc(text)}</p></li>`).join('')}</ol>${gap(s.gap)}`;
  },
};

export function block(s) {
  const render = renderers[s.type];
  if (!render) throw new Error(`Unknown section type "${s.type}" in section "${s.id}"`);
  return `<section class="block block--${s.type}" id="${s.id}" aria-labelledby="${s.id}-title">${head(s)}<div class="block__body">${render(s)}</div></section>`;
}

export const sectionTypes = Object.keys(renderers);
