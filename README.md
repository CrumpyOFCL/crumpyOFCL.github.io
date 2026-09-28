# Tyler Crump

Portfolio site for gameplay and tools work. The pages are static HTML. The words live in `content/`. A Node script, with no runtime dependencies, writes the site into the repository root.

## Build

```bash
node src/build.mjs
```

Node 18 or newer. The script writes `index.html`, `assets/`, `favicon.svg` and the images the pages use.

```bash
npm run serve
```

Serves the built site at http://127.0.0.1:4321.

## Test

```bash
npm test
```

That builds the site, checks the content, scans the repository for blocked words, runs the browser tests, and runs Lighthouse.
