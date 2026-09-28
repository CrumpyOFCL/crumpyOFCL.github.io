// Hash routes, the contact sheet, and the era-rule diagram.
const ROUTES = ['about', 'acit', 'sword-saint', 'tabi', 'more'];
const MORE = ['waking-nightmare', 'sdcs-booking-app', 'lit-flux-mechanics-showcase', 'gdt2'];
const TITLES = {
  about: 'About me',
  acit: 'A Course In Time',
  'sword-saint': 'Sword Saint: Broken Bridge',
  tabi: 'Tabi',
  more: 'More',
};

const tabs = [...document.querySelectorAll('.tabbar .tab')];
const sheet = document.getElementById('contact-sheet');
const openBtn = document.getElementById('account-btn');
const chrome = [document.querySelector('.appbar'), document.querySelector('main'), document.querySelector('.tabbar')];
let lastFocus = null;

function parseHash() {
  const id = (location.hash || '').replace(/^#/, '');
  if (!id || id === 'about') return { route: 'about', more: null };
  if (ROUTES.includes(id)) return { route: id, more: null };
  if (MORE.includes(id)) return { route: 'more', more: id };
  return { route: 'about', more: null };
}

function apply() {
  const { route, more } = parseHash();
  for (const tab of tabs) {
    const on = tab.getAttribute('href') === `#${route}`;
    tab.setAttribute('aria-selected', on ? 'true' : 'false');
    tab.setAttribute('tabindex', on ? '0' : '-1');
    if (on) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
  for (const card of document.querySelectorAll('#more details.work')) {
    if (more) card.open = card.id === more;
  }
  const name = TITLES[route] || 'Tyler Crump';
  document.title = `${name} — Tyler Crump`;
  if (more) {
    const card = document.getElementById(more);
    if (card) card.scrollIntoView({ block: 'start' });
  }
}

window.addEventListener('hashchange', apply);
apply();

for (const [i, tab] of tabs.entries()) {
  tab.addEventListener('keydown', (e) => {
    let n = null;
    if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = tabs.length - 1;
    else return;
    e.preventDefault();
    tabs[n].focus();
    if (tabs[n].getAttribute('href') !== location.hash) location.hash = tabs[n].getAttribute('href');
  });
}

for (const card of document.querySelectorAll('#more details.work')) {
  card.addEventListener('toggle', () => {
    if (card.open) history.replaceState(null, '', `#${card.id}`);
    else if (location.hash === `#${card.id}`) history.replaceState(null, '', '#more');
    apply();
  });
}

function sheetFocusables() {
  return [...sheet.querySelectorAll('a, button')].filter(el => !el.hasAttribute('disabled'));
}

function openSheet() {
  lastFocus = document.activeElement;
  sheet.hidden = false;
  openBtn.setAttribute('aria-expanded', 'true');
  for (const el of chrome) el.setAttribute('inert', '');
  const first = sheetFocusables()[0];
  if (first) first.focus();
}

function closeSheet() {
  if (sheet.hidden) return;
  sheet.hidden = true;
  openBtn.setAttribute('aria-expanded', 'false');
  for (const el of chrome) el.removeAttribute('inert');
  if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
}

openBtn.addEventListener('click', openSheet);
sheet.addEventListener('click', (e) => { if (e.target === sheet) closeSheet(); });
sheet.querySelector('[data-close]').addEventListener('click', closeSheet);
document.addEventListener('keydown', (e) => {
  if (sheet.hidden) return;
  if (e.key === 'Escape') { e.preventDefault(); closeSheet(); return; }
  if (e.key !== 'Tab') return;
  const items = sheetFocusables();
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

const DG = {
  past: 'Past: a wall blocks the way. The crate has just been pushed into place.',
  present: 'Present: the wall is gone. The crate is still where it was pushed.',
};
document.querySelectorAll('[data-dg]').forEach(btn => {
  btn.addEventListener('click', () => {
    const state = btn.getAttribute('data-dg');
    const fig = btn.closest('.diagram');
    fig.querySelector('[data-dg-state]').setAttribute('data-dg-state', state);
    fig.querySelector('[data-dg-desc]').textContent = DG[state];
    fig.querySelectorAll('[data-dg]').forEach(b => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
  });
});
