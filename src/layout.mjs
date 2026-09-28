import { esc, href, val } from './lib.mjs';

const icon = (paths) => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;

const TABS = [
  ['about', 'About me', icon('<circle cx="12" cy="8.5" r="3.2"/><path d="M5 19.5c.7-3.4 3.2-5.2 7-5.2s6.3 1.8 7 5.2"/>')],
  ['acit', 'ACIT', icon('<circle cx="12" cy="12" r="8"/><path d="M12 8v4.5l3 2"/>'), 'A Course In Time'],
  ['sword-saint', 'Sword Saint', icon('<path d="M14.2 3.8l6 6-9.2 9.2H6.2v-4.8z"/><path d="M4 20.2l3.2-3.2M11 13.2l2.2 2.2"/>')],
  ['tabi', 'Tabi', icon('<path d="M12 21s-6-5.4-6-10a6 6 0 0 1 12 0c0 4.6-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/>')],
  ['more', 'More', icon('<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>')],
];

export function layout({ title, description, body, canonical = '/', asset = '', email, github, itch }) {
  const mail = esc(email);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#f2efe8" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0d0d0c" media="(prefers-color-scheme: dark)">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<link rel="canonical" href="https://crumpyofcl.github.io${canonical}">
<meta property="og:url" content="https://crumpyofcl.github.io${canonical}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%2317150f'/%3E%3Ctext x='16' y='21' text-anchor='middle' font-family='Georgia,serif' font-size='13' fill='%23fffefb'%3ETC%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="${href(`/assets/styles.css?v=${asset}`)}">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="appbar">
  <div class="appbar-inner">
    <div class="appbar-titles">
      <h1 class="appbar-title">Tyler Crump</h1>
      <p class="appbar-sub">Game designer · gameplay and tools</p>
    </div>
    <button id="account-btn" class="appbar-account" type="button" aria-haspopup="dialog" aria-controls="contact-sheet" aria-expanded="false">TC<span class="visually-hidden">, open contact</span></button>
  </div>
</header>
<nav class="tabbar" aria-label="Sections">
  <div class="tabbar-inner" role="tablist">
    ${TABS.map(([id, label, svg, name], i) => `<a class="tab" role="tab" id="tab-${id}" href="#${id}" aria-controls="${id}" aria-label="${esc(name || label)}" aria-selected="${i === 0 ? 'true' : 'false'}" tabindex="${i === 0 ? '0' : '-1'}">${svg}<span aria-hidden="true">${esc(label)}</span></a>`).join('')}
  </div>
</nav>
<main id="main" tabindex="-1">
${body}
</main>
<div id="contact-sheet" class="modal-backdrop" hidden>
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="contact-title">
    <h2 id="contact-title">Contact</h2>
    <p class="page-sub">Email is the way to reach me. GitHub and itch.io are the public pages I can point to.</p>
    <p><a class="primary" href="mailto:${mail}">${mail}</a></p>
    <p class="contact-links"><a href="${esc(github)}" rel="noopener">GitHub<span class="visually-hidden"> (opens external site)</span></a> <a href="${esc(itch)}" rel="noopener">itch.io<span class="visually-hidden"> (opens external site)</span></a></p>
    <div class="modal-actions"><button type="button" class="primary" data-close>Close</button></div>
  </div>
</div>
<script src="${href(`/assets/app.js?v=${asset}`)}"></script>
</body>
</html>`;
}

export function contactFrom(site) {
  return {
    email: val(site.contact.email),
    github: val(site.contact.github),
    itch: val(site.contact.itch),
  };
}
