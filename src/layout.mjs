import { esc, href, val } from './lib.mjs';

export function layout({ title, description, body, canonical = '/', asset = '' }) {
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; base-uri 'none'; form-action 'none'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#111519">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://crumpyofcl.github.io${canonical}">
<link rel="canonical" href="https://crumpyofcl.github.io${canonical}">
<link rel="icon" href="${href('/favicon.svg')}" type="image/svg+xml">
<link rel="stylesheet" href="${href(`/assets/styles.css?v=${asset}`)}">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${body}
<script src="${href(`/assets/app.js?v=${asset}`)}" defer></script>
</body>
</html>`;
}

export function contactFrom(site) {
  return { email: val(site.contact.email), github: val(site.contact.github), itch: val(site.contact.itch) };
}
