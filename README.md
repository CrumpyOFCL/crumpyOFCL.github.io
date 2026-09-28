# Tyler Crump — portfolio

A static, project-first portfolio for GitHub Pages. Five case studies cover gameplay, VR, graphics, product development and combat design.

## Build and preview

Requires Node 18+ and Python 3 for the preview server.

```sh
npm ci
npm run build
npm run serve
```

Open http://localhost:4321. The site needs no server application, database, environment variables or login. Direct links use static `.html` files. Core content works without JavaScript.

## Content and templates

- `content/portfolio.json`: the five published case studies, contribution scopes, evidence gaps and links.
- `src/pages.mjs`: shared page, navigation, homepage and case-study templates.
- `src/assets/styles.css`: responsive styles and reduced-motion handling.
- `src/assets/app.js`: optional system-view interaction.
- `public/`: source images, favicon and supplied technical résumé.
- `src/build.mjs`: deterministic static build, metadata, sitemap, 404 and link validation.

The older `content/projects/` records remain as historical material. Only `content/portfolio.json` drives the current site.

## Publishing

The Pages workflow builds with `OUT_DIR=_site` and uploads that directory. The same build also writes the root HTML/assets for branch-based Pages setups. Commit both source and built output. No client-side routing fallback is required.

## Verification

```sh
npx playwright install --with-deps chromium
npm test
```

Content checks cover local links, case-study structure, precise playtest wording and project removals. Browser checks cover direct case-study navigation, the system-view control, seven viewport widths, and accessibility across all six pages. Lighthouse audits the homepage on mobile and desktop.

## Evidence and editorial gaps

See `CONTENT-NEEDED.md`. Placeholders deliberately identify missing material. No substitute game screenshots or invented metrics are used. The supplied technical résumé is downloadable unchanged as DOCX.
