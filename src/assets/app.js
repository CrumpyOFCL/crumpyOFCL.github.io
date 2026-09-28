// Hash routes, the contact sheet, and focus when the page changes.
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
const dialog = document.getElementById('contact-dialog');
const openBtn = document.getElementById('account-btn');
const skip = document.querySelector('.skip');
const chrome = [skip, document.querySelector('.appbar'), document.querySelector('main'), document.querySelector('.tabbar')];
let lastFocus = null;
let current = 'about';
let via = 'load';

function hashId() {
  return (location.hash || '').replace(/^#/, '');
}

function parseHash() {
  const id = hashId();
  if (!id || id === 'about') return { known: true, route: 'about', more: null };
  if (ROUTES.includes(id)) return { known: true, route: id, more: null };
  if (MORE.includes(id)) return { known: true, route: 'more', more: id };
  return { known: false, route: current, more: null };
}

function focusPanel(route) {
  const heading = document.querySelector(`#${route} h1`);
  if (!heading) return;
  heading.setAttribute('tabindex', '-1');
  heading.focus({ preventScroll: true });
}

function show(route, more) {
  current = route;
  for (const panel of document.querySelectorAll('.panel')) {
    panel.classList.toggle('is-on', panel.id === route);
  }
  for (const tab of tabs) {
    const on = tab.getAttribute('href') === `#${route}`;
    if (on) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
  for (const card of document.querySelectorAll('#more details.work')) {
    if (more) card.open = card.id === more;
  }
  document.title = `${TITLES[route] || 'Tyler Crump'} - Tyler Crump`;
  if (more) {
    const card = document.getElementById(more);
    if (card) card.scrollIntoView({ block: 'start' });
  }
}

function apply() {
  const parsed = parseHash();
  if (!parsed.known) {
    history.replaceState(null, '', `#${current}`);
    return;
  }
  show(parsed.route, parsed.more);
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link) return;
  const href = link.getAttribute('href') || '';
  if (!href.startsWith('#') || link.classList.contains('skip')) return;
  if (link.classList.contains('tab')) {
    via = 'tab';
    return;
  }
  event.preventDefault();
  via = 'link';
  if (location.hash === href) {
    apply();
    focusPanel(current);
    return;
  }
  location.hash = href;
}, true);

window.addEventListener('hashchange', () => {
  const kind = via;
  via = 'history';
  apply();
  if (kind === 'tab' || kind === 'history') window.scrollTo(0, 0);
  if (kind === 'link') focusPanel(current);
});

window.addEventListener('popstate', () => {
  via = 'history';
  apply();
  window.scrollTo(0, 0);
});

apply();

skip.addEventListener('click', (event) => {
  event.preventDefault();
  focusPanel(current);
});

for (const card of document.querySelectorAll('#more details.work')) {
  card.addEventListener('toggle', () => {
    if (card.open) history.replaceState(null, '', `#${card.id}`);
    else if (location.hash === `#${card.id}`) history.replaceState(null, '', '#more');
    apply();
    if (card.open) card.scrollIntoView({ block: 'start' });
  });
}

function sheetFocusables() {
  return [...dialog.querySelectorAll('a, button')].filter((el) => !el.hasAttribute('disabled'));
}

function openSheet() {
  lastFocus = document.activeElement;
  sheet.hidden = false;
  document.documentElement.classList.add('is-locked');
  openBtn.setAttribute('aria-expanded', 'true');
  for (const el of chrome) el.setAttribute('inert', '');
  const first = sheetFocusables()[0];
  if (first) first.focus();
}

function closeSheet() {
  if (sheet.hidden) return;
  sheet.hidden = true;
  document.documentElement.classList.remove('is-locked');
  openBtn.setAttribute('aria-expanded', 'false');
  for (const el of chrome) el.removeAttribute('inert');
  const lost = !lastFocus || lastFocus === document.body || lastFocus === document.documentElement;
  const back = lost ? openBtn : lastFocus;
  if (back && typeof back.focus === 'function') back.focus();
}

openBtn.addEventListener('click', openSheet);
sheet.addEventListener('click', (event) => { if (event.target === sheet) closeSheet(); });
sheet.querySelector('[data-close]').addEventListener('click', closeSheet);
document.addEventListener('keydown', (event) => {
  if (sheet.hidden) return;
  if (event.key === 'Escape') { event.preventDefault(); closeSheet(); return; }
  if (event.key !== 'Tab') return;
  const items = sheetFocusables();
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
