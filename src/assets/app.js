// Tyler Crump portfolio — all interaction in one small file (no framework).
// Every behaviour here degrades to a readable page without JavaScript.
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const isCase = document.body.classList.contains('page--case');
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} } };

  /* Era switch. Home: re-themes the page (same layout, different era).
     Case study: also a reading lens — Past = how it was made, Present = what it is, Future = what's next. */
  const ERA_NAMES = { past: 'Past — how it was made', present: 'Present — what it is', future: "Future — what's next", all: 'every era' };
  const THEME = { past: '#E4D8BC', present: '#E9EAEC', future: '#14181A' };
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  function setEra(era, { announce = true, persist = true } = {}) {
    const theme = era === 'all' ? (root.dataset.era || 'present') : era;
    root.dataset.era = theme;
    if (themeMeta && THEME[theme]) themeMeta.setAttribute('content', THEME[theme]);
    $$('[data-set-era]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.setEra === era)));
    if (persist && era !== 'all') store.set('era', era);
    if (isCase) {
      document.body.classList.add('is-lensed');
      $$('.cs-section').forEach(s => { s.hidden = era !== 'all' && s.dataset.lens !== era; });
      const st = $('[data-lens-status]');
      if (st && announce) st.textContent = `Showing ${ERA_NAMES[era]} sections.`;
    }
  }
  $$('.era__buttons, .diagram__controls').forEach(group => {
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
  $$('[data-set-era]').forEach(b => b.addEventListener('click', () => setEra(b.dataset.setEra)));
  if (isCase) {
    const target = location.hash && document.getElementById(location.hash.slice(1));
    const sec = target && target.closest('.cs-section');
    setEra(sec ? sec.dataset.lens : 'present', { announce: false, persist: false });
    if (sec) sec.scrollIntoView({ block: 'start' });
    $$('[data-toc-lens]').forEach(a => a.addEventListener('click', (e) => {
      const lens = a.dataset.tocLens;
      const pressed = $('[data-set-era][aria-pressed="true"]');
      if (!pressed || (pressed.dataset.setEra !== 'all' && pressed.dataset.setEra !== lens)) setEra(lens);
      const s = document.getElementById(a.getAttribute('href').slice(1));
      if (s) {
        e.preventDefault();
        $$('[data-toc-lens]').forEach(x => x.removeAttribute('aria-current'));
        a.setAttribute('aria-current', 'true');
        s.setAttribute('tabindex', '-1');
        s.scrollIntoView({ block: 'start' });
        s.focus({ preventScroll: true });
        history.replaceState(null, '', a.getAttribute('href'));
      }
    }));
  } else {
    const saved = store.get('era');
    setEra(saved && /^(past|present|future)$/.test(saved) ? saved : 'present', { announce: false, persist: false });
  }

  /* Work filters: disciplines = any-of; selects = exact; skill = project set from the matrix. */
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
        const d = c.dataset.disciplines.split('|');
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
        syncSkill(); apply();
        if (skill) { $('details.filters').open = true; $('#work').scrollIntoView({ block: 'start' }); status.setAttribute('tabindex', '-1'); status.focus({ preventScroll: true }); }
      });
    });
    if (matchMedia('(max-width: 700px)').matches) $('details.filters').open = false;
    apply();
  }

  /* Iteration viewer: WAI-ARIA tabs + before/after range. */
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

  /* Era rule diagram (A Course In Time). */
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
})();
