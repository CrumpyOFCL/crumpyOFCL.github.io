import { esc, href } from './lib.mjs';

export function layout({ title, description, body, page = 'home', canonical = '/', nav = [] }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#E4D8BC">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<link rel="canonical" href="https://crumpyofcl.github.io${canonical}">
<meta property="og:url" content="https://crumpyofcl.github.io${canonical}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%237A4A10'/%3E%3Cpath d='M4 4h8v2H9v6H7V6H4z' fill='%23FFF8EA'/%3E%3C/svg%3E">
<link rel="preload" href="${href('/assets/fonts/bricolage-latin-wght.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${href('/assets/styles.css')}">
<script>document.documentElement.classList.add('js');</script>
</head>
<body class="page--${page}">
<a class="skip" href="#main">Skip to content</a>
${page === 'home' ? `<a class="recruiter-skip" data-recruiter href="#save">Skip to CV / Recruiter view</a>` : ''}
<header class="masthead">
  <div class="masthead__inner">
    <a class="brand" href="${href('/index.html')}"><span class="brand__name">Tyler Crump</span><span class="brand__role">Game designer · gameplay and tools</span></a>
    <nav class="primary" aria-label="Primary"><ul>${nav.map(n => `<li><a href="${esc(href(n.href))}">${esc(n.label)}</a></li>`).join('')}</ul></nav>
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
    <p>Built by hand as a static site — the source and the design notes behind it are on <a href="https://github.com/CrumpyOFCL/crumpyOFCL.github.io">GitHub</a>. Locked slots and dashed boxes mark evidence I haven't published yet; nothing on this site is filler.</p>
    ${page === 'home' ? `<p class="egg-row"><button type="button" class="egg" data-egg aria-expanded="false" aria-controls="egg-note"><span class="visually-hidden">Older page mark</span><span class="egg__px" aria-hidden="true"></span></button> <span id="egg-note" class="egg__note" hidden>1743 / Today / 2311. An older way of reading this page. It does not change the colours.</span></p>` : ''}
  </div>
</footer>
${page === 'home' ? `<nav class="mobilebar" aria-label="Sections"><ul>
  <li><a href="#map">Map</a></li><li><a href="#work">List</a></li><li><a href="#skills">Quests</a></li><li><a href="#contact">Continue?</a></li></ul></nav>` : ''}
<script src="${href('/assets/app.js')}" defer></script>
</body>
</html>`;
}
