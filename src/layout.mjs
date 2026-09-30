import { esc, SITE_URL } from './lib.mjs';

// The page shell: metadata, header, footer. `path` is the page's file name ('' for home).
export function page({ site, title, description, path = '', body, asset, current = '' }) {
  const fullTitle = path ? `${title} · ${site.name}` : `${site.name} · ${title}`;
  const url = `${SITE_URL}/${path}`;
  const home = path ? 'index.html' : '';
  const nav = [['Work', `${home}#work`, 'work'], ['About', `${home}#about`, 'about'], ['Contact', `${home}#contact`, 'contact']];
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#f3efe6" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#121318" media="(prefers-color-scheme: dark)">
<meta name="color-scheme" content="light dark">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE_URL}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(site.name)}, ${esc(site.role)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preload" href="fonts/archivo.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/styles.css?v=${asset}">
<script src="assets/app.js?v=${asset}" defer></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="masthead">
  <div class="masthead__inner">
    <a class="brand" href="${home || '#top'}"><span class="brand__mark" aria-hidden="true"></span><span class="brand__name">${esc(site.name)}</span><span class="brand__role">${esc(site.role)}</span></a>
    <nav class="nav" aria-label="Main">
      <ul>
        ${nav.map(([label, href, key]) => `<li><a href="${href}"${current === key ? ' aria-current="page"' : ''}>${label}</a></li>`).join('')}
        <li><a class="nav__resume" href="${esc(site.resume.file)}" download>${esc(site.resume.label)} <span class="nav__meta">${esc(site.resume.format)}</span></a></li>
      </ul>
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="footer">
  <div class="wrap footer__inner">
    <p><strong>${esc(site.name)}</strong> · ${esc(site.role)} · ${esc(site.location)}</p>
    <p><a href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a> · <a href="${esc(site.contact.github)}">GitHub</a> · <a href="${esc(site.contact.itch)}">itch.io</a></p>
    <p class="footer__note">Project art and logos belong to their teams, as credited on each page.</p>
  </div>
</footer>
</body>
</html>
`;
}
