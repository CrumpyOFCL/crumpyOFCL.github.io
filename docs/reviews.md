# Reviews

Reviewed against the built site on `portfolio-v2`. Lighthouse scores below were re-recorded on 28 Sep 2026 after IkemanGoAss moved to supporting. They are from that build, not estimates.

## 30-second recruiter test — pass

At 1440px the first screen is the name, the role, the lede, and an "At a glance" card: what he is looking for, the flagship and its engine, the strongest skill, four tools, itch.io, GitHub, and the email. The flagship case study is a button, not a hunt.

At 375px the same facts sit in that order: name, lede, glance card, then the call to action. A bottom bar jumps to Work, Evidence, Method and Contact. A Menu control holds the rest, because the desktop link row does not fit. Era buttons stay on screen and still say 1743 / Today / 2311.

What would fail this test is a first screen of empty slots or a metaphor you have to learn. The default era is Present. Pending journal entries and documents are further down, and the document rows are collapsed.

## 5-minute designer test — pass on orientation, not on depth

A Course In Time opens on Present: genre, role, team, platforms, the mechanics named on the itch.io page, the era-rule diagram labelled as an illustration, and a "What I did" list sourced as claims from the previous site. The header says how many slots on the page are still empty.

Past is one control away. The decision archive is there. The evidence chain on each decision only fills the links that have text. The process list ticks a single stage, the playable build, and says it is not a shipped credit. Playtesting shows the debug console he has described, then an empty Observation → Insight → Design change → Result template.

A designer can tell, inside five minutes, what is published and what is not. They cannot yet judge a level, a greybox, or a playtest finding, because those files do not exist here. Filling them with fiction would fail the test in a worse way. The iteration was to label the gaps and stop calling the itch.io build a release.

## UX

The organising control is the same on every page, and it does one job per page: recolour the home page, or choose which sections a case study shows. All is there when someone wants one scroll. Filters are checkboxes plus four selects, with a visible count, an empty state, and a reset. Choosing a skill in the matrix filters Work and can be removed. Nothing depends on a drag.

The weak UX is the length of a case study in All, and the number of dashed slots in Past. That is an honest reflection of the evidence, and it is why Present is the default.

## Game design

The flagship is framed as systems and level design, which matches what Tyler has actually said he did: team lead, audio, coding, level design, on a team of five, Unity 6. The diagram shows the rule he describes (the building changes, what you move stays) and refuses to pretend it is a shipped level. Iteration tabs and the before/after slider are the right artefact shape, currently holding pending images rather than fake ones.

Waking Nightmare is a client handover of an in-progress build. The travel app is a UX case study, not a game, and it is labelled that way. Two itch.io prototypes sit in Experiments with the role still pending.

IkemanGoAss stays a supporting piece. On 29 Sep 2026, 00:27 AEST, hand animation, solo, and the tools Notepad++ and Fighter Factory Studio moved to owner-to-confirm. They are not stated as fact, and they are not on the skills matrix. The page uses the neutral line: an Ikemen GO fighting game prototype with two playable characters, The Sword Saint and Unknown, sharing one moveset, and a stormy bridge stage, Broken Bridge. Verified detail on the page: 7 moves (4 normals, 1 two-projectile special, 1 meter-gated super, 1 back dash), block and perfect block, a stamina system, scripted AI, and a 6-layer stage with a storm soundtrack. Media frames are still empty. The private repository is not linked. Aseprite stays on the general tools list.

## Visual and communication

Three palettes, one layout. Type is Bricolage for headings (self-hosted) and the system sans for text, so a font host is not on the critical path. Dashed boxes are the only "illustration" of missing work. Status labels are words (Evidenced, Described, Pending), not colour alone.

The future palette is dark. Text and background pairs were checked against WCAG AA, and the era change does not animate through a low-contrast in-between. A colour transition was removed after axe sampled those in-between frames and failed them.

## Engineering

`node src/build.mjs` reads `content/` and writes static HTML. No runtime dependencies. Validation fails the build on a bad slug, a missing flagship, or a fact that is neither confirmed nor pending. Internal notes are not rendered. Links are relative, so the branch can be hosted somewhere that is not the domain root. Canonical URLs still point at `crumpyofcl.github.io`.

Astro was considered and not used. The site is a few pages, the edit model is JSON, and a dependency tree would not make the evidence any more honest.

## QA

Playwright covers the era switch and its persistence, the case-study lens including All, table-of-contents lens changes, hash deep links, filters (discipline, selects, skill, reset, empty), the Ikemen GO case study (confirmed work versus empty slots), iteration tabs (arrows, Home, End), the compare slider, the era diagram, disclosures, a keyboard path from the skip link to a case study and back to contact, and reduced motion. axe-core (WCAG 2.0/2.1/2.2 A and AA) runs on all 8 pages in Past, Present and Future, plus the All lens on the flagship. 35 tests, all passing.

## Accessibility

Landmarks, a skip link, visible focus, labels on the filters, 44px targets on the era switch, the mobile bar, the table of contents and the skill buttons. The matrix scrolls horizontally and is a keyboard region. Case-study sections that are not in the current lens are `hidden`, so they leave the tab order. Without JavaScript every section is in the page. `prefers-reduced-motion` sets transitions and smooth scrolling off. `forced-colors` keeps the pressed state and the dashed slots visible.

## Performance

Lighthouse 12, gzip on (the same compression GitHub Pages and Render apply). Python's static server does not gzip; those earlier desktop scores were lower and were discarded.

| Page | Form | Performance | Accessibility | Best practices | SEO |
| --- | --- | ---: | ---: | ---: | ---: |
| Home | Mobile | 100 | 100 | 100 | 100 |
| Home | Desktop | 97 | 100 | 100 | 100 |
| A Course In Time | Mobile | 100 | 100 | 100 | 100 |
| A Course In Time | Desktop | 95 | 100 | 100 | 100 |
| Japan Trip Planner | Mobile | 100 | 100 | 100 | 100 |
| Japan Trip Planner | Desktop | 96 | 100 | 100 | 100 |

Desktop performance sits in the mid-90s because the stylesheet is render-blocking and the home page is about 1,000 DOM nodes (the matrix, the ledger and the cards). Cumulative layout shift is 0. There is no third-party script. Raw numbers are in [lighthouse-scores.json](lighthouse-scores.json).

## Red team — what would make a pro reviewer walk away

- Treating Described rows as if the artefact were attached. The ledger intro defines the three states. A reviewer who only reads the flagship "What I did" list still sees the source line: claims from the previous site, design doc not published.
- Opening Past first and deciding the portfolio is empty. Present is the default, and the empty-slot count is in the header. The risk is still real if someone shares a Past link. The hash does open that lens, which is what a shared heading should do.
- A shipped-credit requirement. This site will not satisfy it. Saying otherwise would be the actual failure.
- The SDCS booking app. The public source file's on-screen credit names other people. Tyler says the work was solo. Those names are not on this site. A reviewer who opens the repo will see the credit line and the portfolio will look careless until that is reconciled.
- Unreal, Blender, Godot, Jira, under-10 design, playtest reports, level maps. The first two are marked evidence coming. The rest are gaps. A reviewer hiring for those will not find them, and should not.

## Fixes made after the first test pass

- Era colour no longer animates. Mid-transition greys failed contrast in the future palette.
- Table-of-contents test expectation matched the real rule: All stays All; a heading link switches lens only when a single era is selected.
- Diagram checks run in Present, which is where the diagram lives.
- The keyboard path targets the flagship link by name, because Contact uses the same button style.
