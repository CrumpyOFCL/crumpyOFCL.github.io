// Tyler Crump portfolio — title screen, level select, and case-study controls.
// No framework. The page stays readable without this file.
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const title = $('#title-screen');
  let titleDone = !title;

  function showList() {
    const panel = $('#work');
    const toggle = $('[data-list-toggle]');
    if (panel) panel.classList.add('is-open');
    if (toggle) toggle.setAttribute('aria-pressed', 'true');
  }

  function dismissTitle({ recruiter = false, instant = false } = {}) {
    if (titleDone) {
      if (recruiter) { showList(); const save = $('#save'); if (save) save.scrollIntoView(); }
      return;
    }
    titleDone = true;
    document.body.classList.add('is-hub');
    const finish = () => { if (title) title.hidden = true; };
    if (!title || instant || reduce) finish();
    else {
      title.classList.add('is-wipe');
      title.addEventListener('animationend', finish, { once: true });
      setTimeout(finish, 450);
    }
    if (recruiter) {
      showList();
      const save = $('#save');
      if (save) save.scrollIntoView();
    }
  }

  function openWork() {
    showList();
    const panel = $('#work');
    const heading = $('#work-title');
    if (panel) panel.scrollIntoView();
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }

  if (title) {
    const hash = location.hash;
    if (hash) dismissTitle({ instant: true, recruiter: hash === '#save' || hash === '#resume' });
    else setTimeout(() => dismissTitle({ instant: reduce }), 3000);
    if (hash === '#work' || hash === '#skills' || hash === '#evidence') showList();

    document.addEventListener('keydown', (e) => {
      if (titleDone) return;
      if (e.target.closest && e.target.closest('[data-recruiter]')) return;
      dismissTitle({ instant: true });
    });
    title.addEventListener('pointerdown', (e) => {
      if (e.target.closest && e.target.closest('a, button')) return;
      dismissTitle({ instant: true });
    });
    document.addEventListener('click', (e) => {
      const rec = e.target.closest && e.target.closest('[data-recruiter]');
      if (!rec) return;
      dismissTitle({ recruiter: true, instant: true });
    });
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href="#work"]');
    if (!a) return;
    openWork();
  });
  window.addEventListener('hashchange', () => {
    const hash = location.hash;
    if (hash === '#work') openWork();
    else if (hash === '#skills' || hash === '#evidence') showList();
  });

  const toggle = $('[data-list-toggle]');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-pressed') !== 'true';
      toggle.setAttribute('aria-pressed', String(open));
      $('#work').classList.toggle('is-open', open);
      if (open) { $('#work').scrollIntoView(); $('#work-title').setAttribute('tabindex', '-1'); $('#work-title').focus({ preventScroll: true }); }
    });
  }

  const nodes = $$('[data-node]');
  const avatar = $('[data-avatar]');
  const stage = $('[data-stage]');
  let avatarX = null;
  function drawRoad() {
    const svg = $('[data-road]');
    if (!svg || !stage || !nodes.length) return;
    const map = stage.getBoundingClientRect();
    if (!map.width) return;
    const pts = nodes.map((n) => {
      const art = n.querySelector('.landmark') || n;
      const r = art.getBoundingClientRect();
      return [r.left - map.left + r.width / 2, r.bottom - map.top];
    });
    svg.setAttribute('viewBox', `0 0 ${map.width} ${map.height}`);
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
    const ink = $('.road-ink', svg);
    const fill = $('.road-fill', svg);
    if (ink) ink.setAttribute('d', d);
    if (fill) fill.setAttribute('d', d);
    const dots = $('.road-dots', svg);
    if (!dots) return;
    dots.replaceChildren();
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      const len = Math.hypot(x2 - x1, y2 - y1);
      const steps = Math.max(1, Math.floor(len / 16));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', (x1 + (x2 - x1) * t - 2).toFixed(1));
        rect.setAttribute('y', (y1 + (y2 - y1) * t - 2).toFixed(1));
        rect.setAttribute('width', '4');
        rect.setAttribute('height', '4');
        rect.setAttribute('fill', '#F4E7C8');
        dots.appendChild(rect);
      }
    }
  }
  function place(node, animate) {
    if (!avatar || !stage || !node) return;
    const map = stage.getBoundingClientRect();
    const art = node.querySelector('.landmark') || node;
    const r = art.getBoundingClientRect();
    const x = r.left - map.left + r.width / 2 - 28;
    const y = r.bottom - map.top - avatar.offsetHeight;
    if (animate && avatarX != null && !reduce) {
      avatar.classList.toggle('is-left', x < avatarX - 1);
      avatar.classList.add('is-walk');
      clearTimeout(avatar._t);
      avatar._t = setTimeout(() => avatar.classList.remove('is-walk'), 280);
    }
    avatarX = x;
    avatar.style.left = x + 'px';
    avatar.style.top = y + 'px';
    nodes.forEach(n => n.classList.toggle('is-selected', n === node));
  }
  function openCard(slug, opener) {
    const card = document.getElementById('card-' + slug);
    if (!card || typeof card.showModal !== 'function') return;
    $$('dialog.select-card[open]').forEach(d => d.close());
    card.showModal();
    card.dataset.opener = opener ? opener.id || '' : '';
  }
  nodes.forEach((node, i) => {
    node.addEventListener('focus', () => place(node, true));
    node.addEventListener('click', () => { place(node, true); openCard(node.dataset.node, node); });
    node.addEventListener('keydown', (e) => {
      const step = { arrowright: 1, arrowdown: 1, d: 1, s: 1, arrowleft: -1, arrowup: -1, a: -1, w: -1 }[e.key.toLowerCase()];
      if (!step) return;
      e.preventDefault();
      const next = nodes[(i + step + nodes.length) % nodes.length];
      next.focus();
    });
  });
  if (nodes[0]) place(nodes[0], false);
  drawRoad();
  window.addEventListener('resize', () => {
    const current = nodes.find(n => n === document.activeElement) || nodes[0];
    place(current, false);
    drawRoad();
  });
  $$('[data-open-card]').forEach(b => b.addEventListener('click', () => {
    const node = document.getElementById('node-' + b.dataset.openCard);
    if (node) place(node);
    openCard(b.dataset.openCard, b);
  }));
  $$('[data-close-card]').forEach(b => b.addEventListener('click', () => {
    const card = b.closest('dialog');
    if (card) card.close();
  }));
  $$('dialog.select-card').forEach(card => {
    card.addEventListener('click', (e) => { if (e.target === card) card.close(); });
    card.addEventListener('close', () => {
      const opener = card.dataset.opener && document.getElementById(card.dataset.opener);
      if (opener) opener.focus();
    });
  });

  const still = $('#still');
  if (still && location.hash) {
    const target = document.getElementById(location.hash.slice(1));
    const details = $('details', still);
    if (target && details && still.contains(target)) details.open = true;
  }

  const egg = $('[data-egg]');
  if (egg) egg.addEventListener('click', () => {
    const note = $('#egg-note');
    const open = egg.getAttribute('aria-expanded') !== 'true';
    egg.setAttribute('aria-expanded', String(open));
    if (note) note.hidden = !open;
  });

  $$('.diagram__controls').forEach(group => {
    group.addEventListener('keydown', (e) => {
      const btns = $$('button', group);
      const i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      let next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % btns.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + btns.length) % btns.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = btns.length - 1;
      if (next === null) return;
      e.preventDefault();
      btns[next].focus();
      btns[next].click();
    });
  });

  const form = $('[data-filters]');
  if (form) {
    const cards = $$('.card'), status = $('[data-filter-status]'), count = $('[data-filter-count]');
    const empty = $('[data-empty]'), skillChip = $('[data-skill-chip]');
    let skill = null;
    const syncSkill = () => $$('[data-skill]').forEach(b => b.setAttribute('aria-pressed', String(!!skill && b.dataset.skill === skill.name)));
    const apply = () => {
      const disc = $$('input[name="discipline"]:checked', form).map(i => i.value);
      const sel = Object.fromEntries($$('select[data-filter]', form).map(s => [s.dataset.filter, s.value]));
      let shown = 0;
      cards.forEach(c => {
        const d = (c.dataset.disciplines || '').split('|');
        const ok = (!disc.length || disc.some(x => d.includes(x)))
          && Object.entries(sel).every(([k, v]) => !v || c.dataset[k] === v)
          && (!skill || skill.projects.includes(c.dataset.project));
        c.hidden = !ok; if (ok) shown++;
      });
      $$('.tier').forEach(t => { t.hidden = !$$('.card', t).some(c => !c.hidden); });
      const active = disc.length + Object.values(sel).filter(Boolean).length + (skill ? 1 : 0);
      status.textContent = active ? `Showing ${shown} of ${cards.length} projects.` : `Showing all ${cards.length} projects.`;
      count.textContent = active ? `(${active} active)` : '';
      empty.hidden = shown !== 0;
      skillChip.hidden = !skill; skillChip.textContent = '';
      if (skill) {
        const t = document.createElement('span'); t.textContent = `Skill: ${skill.name}`;
        const b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn--small'; b.textContent = 'Remove skill filter';
        b.addEventListener('click', () => { skill = null; syncSkill(); apply(); });
        skillChip.append(t, b);
      }
    };
    form.addEventListener('change', apply);
    form.addEventListener('reset', () => { skill = null; syncSkill(); setTimeout(apply, 0); });
    $('[data-clear]').addEventListener('click', () => form.reset());
    $$('[data-skill]').forEach(b => {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        skill = (skill && skill.name === b.dataset.skill) ? null : { name: b.dataset.skill, projects: b.dataset.skillProjects.split(' ') };
        syncSkill(); apply(); showList();
        if (skill) { $('details.filters').open = true; status.setAttribute('tabindex', '-1'); status.focus({ preventScroll: true }); }
      });
    });
    if (matchMedia('(max-width: 700px)').matches) $('details.filters').open = false;
    apply();
  }

  $$('[data-iter]').forEach(w => {
    const tabs = $$('[role="tab"]', w);
    const select = (i, focus) => {
      tabs.forEach((t, j) => { const on = i === j; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; document.getElementById(t.getAttribute('aria-controls')).hidden = !on; });
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', (e) => {
        const k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (k !== undefined) { e.preventDefault(); select((k + tabs.length) % tabs.length, true); }
      });
    });
  });
  $$('[data-compare]').forEach(c => {
    const r = $('input[type="range"]', c);
    const upd = () => { c.style.setProperty('--pos', r.value + '%'); r.setAttribute('aria-valuetext', `${r.value}% ${r.dataset.a}, ${100 - r.value}% ${r.dataset.b}`); };
    r.addEventListener('input', upd); upd();
  });

  $$('[data-diagram]').forEach(d => {
    const grid = $('.dg', d), desc = $('[data-dg-desc]', d);
    const text = {
      past: 'Past: a wall blocks the way. The crate has just been pushed into place.',
      present: 'Present: the wall has gone and a platform has appeared. The crate is exactly where it was left in the Past.',
    };
    $$('[data-dg]', d).forEach(b => b.addEventListener('click', () => {
      grid.dataset.dgState = b.dataset.dg;
      $$('[data-dg]', d).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      desc.textContent = text[b.dataset.dg];
    }));
  });

  $$('.toc a').forEach(a => a.addEventListener('click', () => {
    $$('.toc a').forEach(x => x.removeAttribute('aria-current'));
    a.setAttribute('aria-current', 'true');
  }));
})();
