# Tyler Crump — portfolio

A static portfolio for GitHub Pages at https://crumpyofcl.github.io. Projects live in JSON files; a small Node script turns them into plain HTML pages. There is no framework, server, database or login.

## Build and preview

Requires Node 18+ (and Python 3 for the preview server).

```sh
npm ci
npm run build     # writes the site into the repository root
npm run serve     # http://localhost:4321
```

Commit the source **and** the built files (`index.html`, `*.html`, `assets/`, `img/`, `fonts/`). CI fails if they are out of sync. The Pages workflow also builds a fresh copy into `_site` on every push to `main`.

## How the site is organised

| Path | What it is |
| --- | --- |
| `content/site.json` | Name, headline, intro, "Start here" project, about text, capabilities table, contact links, résumé file |
| `content/projects/*.json` | One file per case study. Every file here is published unless it has `"featured": false` |
| `content/unpublished/` | Older project records kept for reference (GDT2, LIT_Flux, SDCS). Not built |
| `public/` | Images, fonts, favicon, social preview and the résumé. Copied as-is into the site |
| `src/build.mjs` | Checks content, writes pages, redirects, sitemap and 404, then checks every internal link |
| `src/pages.mjs` · `src/blocks.mjs` · `src/layout.mjs` | Homepage, case-study page, section renderers, shared page shell |
| `src/inspector.mjs` · `src/assets/app.js` | The era-switch inspector (static diagram plus optional controls) |
| `src/assets/styles.css` | All styles. Colours are tokens at the top, with a dark variant |

## Common updates

**Add or edit a project.** Copy an existing file in `content/projects/`, change `slug` (becomes `<slug>.html`), `order` (position on the homepage) and the text. Required fields: `title`, `kicker`, `pitch`, `description`, `role`, `contribution`, `facts` (must include `Tools` and `Status`), three `quick` entries and a `cover`. Set `"group": "product"` for non-game work so it appears under "Outside games". Run `npm run build`: it stops with a clear message if something is missing.

**Case-study sections.** `sections` is a list. Each has a `type`, a unique `id`, a `kicker` and a `title`. Available types:

- Text: `list` (bullets), `notes` / `production` (label + text rows), `timeline`
- `decisions`: each item can have `goal`, `constraint`, `alternatives`, `decision`, `implementation` and `effect`. Leave out any you can't support.
- `figure` (one image with caption), `table` (`head` + `rows`), `credits` (team table; mark yourself with `true`)
- `loop` (core loop + abilities), `flow` (labelled lanes of steps), `money` (Tabi's money-state illustration), `inspector` (the era-switch model)
- `screens`: a row of phone screenshots (`items` with `src`, `alt`, `width`, `height`, `caption`)

Add `"gap": "…"` to `notes`, `production` or `timeline` to state plainly what isn't documented yet.

**Add images or video.** Put files in `public/img/` (WebP or PNG; pixel art stays lossless), then reference them as `img/<name>` with `alt`, `width` and `height`. Set `"pixel": true` for pixel art so it scales crisply. For gameplay clips, prefer a short MP4/WebM with a poster image. `figure` sections currently take images only.

**Replace the résumé.** Put the new file in `public/`, update `resume.file`, `format` and `size` in `content/site.json`, and rebuild. A PDF is friendlier to recruiters than DOCX.

**Change the headline or name.** Edit `content/site.json`, then run `npm run og` to redraw the social preview image (`public/og.png`).

**Remove a project.** Move its file to `content/unpublished/` or set `"featured": false`. If people may have its old link, add the old slug to another project's `aliases` so it redirects.

## Motion

Motion is an enhancement layer; every page is complete without it.

- **Era diorama** (homepage): each era is its own 3D plane. The active era slides forward, the other drops back. It tilts towards a mouse pointer.
- **Scenes** (homepage): each project is a full-width scene in its cover's palette (`cover.tone`: `era`, `night`, `plum`, `paper`). As a scene scrolls in, `app.js` sets `--p` from 0 to 1; CSS uses it to flatten the tilted cover, open the circular reveal and drift the big index number. Scrolling itself is never taken over.
- **Case studies**: blocks marked `data-reveal` fade up once, decision chains step in, the contents list follows the reader, and a progress line runs under the header.
- **Between pages**: the cover morphs from the homepage into its case study (cross-document view transitions, where supported).

`prefers-reduced-motion` turns all of it off (the inspector's controls stay). The `motion` class on `<html>` is set before first paint only when motion is allowed.

## Tests

```sh
npx playwright install --with-deps chromium   # once
npm test
```

- `test:content`: structure, local links, alt text, reserved image sizes, redirects and accuracy rules (for example, A Course In Time must not claim a browser build).
- `test:banned`: a word scan across all tracked files.
- `test:browser`: recruiter journey, direct links and refresh, redirects, inspector by keyboard and touch, the crush rule, the no-JavaScript fallback, reduced motion, seven widths from 320 to 1920px, and axe (WCAG 2.1 A/AA) on every page in light and dark themes.
- `test:lighthouse`: home and A Course In Time on mobile and desktop. Performance must score at least 90; the other categories at least 95.

To use an already-installed Chromium, set `PW_CHROMIUM=/path/to/chrome`.

## Credits

Fonts: Archivo (Omnibus-Type) and JetBrains Mono (JetBrains), both SIL Open Font License, self-hosted. Project art belongs to the teams credited on each case study. A Course In Time's logo and the PhobiaVR logo come from the projects' itch.io pages.
