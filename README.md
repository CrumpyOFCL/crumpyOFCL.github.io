# Tyler Crump — portfolio

Static portfolio for gameplay and tools design. Words live in `content/`. A zero-dependency Node script turns them into HTML at the repository root, which is what GitHub Pages serves.

The live site is `main` ([crumpyofcl.github.io](https://crumpyofcl.github.io/)). This work is on `portfolio-v2` and is not merged.

## Why this stack

Astro 5 would compile the same handful of pages and add a dependency tree Tyler would have to keep installing. The generator in `src/` is one `node src/build.mjs` with no packages. It refuses to build if a fact is malformed, and every unknown renders as a dashed **Evidence pending** slot instead of invented copy. Generated HTML is committed so Pages can serve the branch with no build command and no settings change.

Node 18+ is enough (`package.json` engines). Node 22 is what this branch was built with.

## Commands

```bash
node src/build.mjs          # write index.html, projects/*/index.html, assets/, sitemap.xml
npm test                    # content checks, Playwright + axe, Lighthouse
npm run serve               # http://127.0.0.1:4321
```

`OUT_DIR=_out node src/build.mjs` writes a copy somewhere other than the root. The root output is the site.

Browser tests use Playwright, `@axe-core/playwright` and Lighthouse, listed as devDependencies. They are not part of the published site.

## Editing

See [CONTENT.md](CONTENT.md). Do not invent projects, tools, dates, quotes or playtest results. If it is not confirmed, leave the pending object in place.

## Design notes

- [docs/concepts.md](docs/concepts.md) — concepts scored, Level Select chosen (Era Lens rejected by the Owner)
- [docs/reviews.md](docs/reviews.md) — reviews and test scores
- [docs/requirements-checklist.md](docs/requirements-checklist.md) — against the three junior briefs
- [prototypes/](prototypes/) — throwaway concept sketches, not linked from the site

## Preview

Do not point GitHub Pages at this branch. That would replace the live site. A preview has to be a host that is not `crumpyofcl.github.io`.

Internal links are relative (`assets/styles.css`, `projects/…/index.html`) so a static file host can serve the branch from a subpath. Canonical URLs still point at the production domain.
