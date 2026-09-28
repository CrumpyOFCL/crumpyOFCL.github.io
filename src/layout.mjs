import { esc, href } from './lib.mjs';

const ERAS = [
  { id: 'past', label: 'Past', year: '1743' },
  { id: 'present', label: 'Present', year: 'Today' },
  { id: 'future', label: 'Future', year: '2311' },
];

export function eraSwitch({ id = 'era', lens = false } = {}) {
  const lensText = { past: 'how it was made', present: 'what it is', future: "what's next" };
  return `<div class="era${lens ? ' era--lens' : ''}" role="group" aria-labelledby="${id}-label">
  <span class="era__label" id="${id}-label">${lens ? 'Read this project in' : 'Read this page in'}</span>
  <div class="era__buttons">${ERAS.map(e => `<button type="button" class="era__btn" data-set-era="${e.id}" aria-pressed="${e.id === 'present'}">${e.label}<span class="era__hint">${lens ? lensText[e.id] : e.year}</span></button>`).join('')}${lens ? `<button type="button" class="era__btn era__btn--all" data-set-era="all" aria-pressed="false">All<span class="era__hint">every section</span></button>` : ''}</div>
</div>`;
}

export function layout({ title, description, body, page = 'home', canonical = '/', nav = [] }) {
  return `<!doctype html>
<html lang="en" data-era="present">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#E9EAEC">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<link rel="canonical" href="https://crumpyofcl.github.io${canonical}">
<meta property="og:url" content="https://crumpyofcl.github.io${canonical}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%231F5C8C'/%3E%3Cpath d='M4 4h8v2H9v6H7V6H4z' fill='%23fff'/%3E%3C/svg%3E">
<link rel="preload" href="${href('/assets/fonts/bricolage-latin-wght.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${href('/assets/styles.css')}">
<script>try{var path=location.pathname;var isCase=/\\/projects\\/[^/]+\\/(index\\.html)?$/.test(path);var e=localStorage.getItem('era');if(!isCase&&e&&/^(past|present|future)$/.test(e))document.documentElement.dataset.era=e;}catch(_){}document.documentElement.classList.add('js');</script>
</head>
<body class="page--${page}">
<a class="skip" href="#main">Skip to content</a>
<header class="masthead">
  <div class="masthead__inner">
    <a class="brand" href="${href('/index.html')}"><span class="brand__name">Tyler Crump</span><span class="brand__role">Game designer · gameplay and tools</span></a>
    <nav class="primary" aria-label="Primary"><ul>${nav.map(n => `<li><a href="${esc(href(n.href))}">${esc(n.label)}</a></li>`).join('')}</ul></nav>
    ${page === 'home' ? eraSwitch({ id: 'era-top' }) : ''}
    <details class="nav-drawer">
      <summary>Menu</summary>
      <nav aria-label="Menu">${nav.map(n => `<a href="${esc(href(n.href))}">${esc(n.label)}</a>`).join('')}</nav>
    </details>
  </div>
</header>
<main id="main" tabindex="-1">
${body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <p>Built by hand as a static site — the source and the design notes behind it are on <a href="https://github.com/CrumpyOFCL/crumpyOFCL.github.io">GitHub</a>. Dashed boxes mark evidence I haven't published yet; nothing on this site is filler.</p>
  </div>
</footer>
${page === 'home' ? `<nav class="mobilebar" aria-label="Sections"><ul>
  <li><a href="#work">Work</a></li><li><a href="#evidence">Evidence</a></li><li><a href="#method">Method</a></li><li><a href="#contact">Contact</a></li></ul></nav>` : ''}
<script src="${href('/assets/app.js')}" defer></script>
</body>
</html>`;
}
