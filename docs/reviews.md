# Reviews

The current site is one app shell in the form of Tabi: an app bar (Tyler Crump / Game designer · gameplay and tools), five equal bottom tabs (About me, A Course In Time, Sword Saint, Tabi, More), and a TC button that opens a contact sheet. About is `/` and `#about`. The level-select map, title screen and recruiter skip are gone. The notes below that describe that map are the stage-1 review of the previous form.

Lighthouse 12 on the shell, gzip on, 28 Sep 2026. Home, `#acit` and `#tabi` are the same document.

| Page | Form | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- | --- |
| Home | Mobile | 100 | 100 | 100 | 100 |
| Home | Desktop | 98 | 100 | 100 | 100 |
| A Course In Time | Mobile | 100 | 100 | 100 | 100 |
| A Course In Time | Desktop | 98 | 100 | 100 | 100 |
| Tabi | Mobile | 100 | 100 | 100 | 100 |
| Tabi | Desktop | 98 | 100 | 100 | 100 |

Raw bytes of the home route (index.html, styles.css, app.js) are 68,246. No font file is requested. The 150,000 budget holds.

Reviewed against the built site on `portfolio-v2` after the stage-1 design pass. Lighthouse scores below were re-recorded on 28 Sep 2026 against that build, with gzip on. They are from that run, not estimates.

## 30-second recruiter test — pass, with a skip

The first frame is a pixel night sky and a grand-hotel silhouette. The windows light one by one, the avatar walks to the door, and the door lighting starts an iris wipe into the map. The wordmark is TYLER CRUMP, the subtitle is "Game designer · gameplay and tools", and PRESS START blinks. It leaves after 3 seconds, or instantly on any key, click or tap. "Recruiter view: projects and contact" is fixed at the top right from that first frame. There is no CV file yet, so the save file says so and gives the email. It opens the plain list and the save file: confirmed role, what he is looking for, the flagship, four tools, itch.io, GitHub, and the email.

The hub under the title is a level-select map. A Course In Time is the large castle. The other projects are smaller nodes on the same path. List view is one button away if the map is not how someone wants to read.

At 375px the path is a vertical overworld: landmarks alternate left and right on an S-curve road. Targets are at least 44px. A bottom bar jumps to Map, List, Recruiter and Contact. The recruiter button on the hub itself is hidden at that width; it stays on the title screen.

## 5-minute designer test — pass on orientation, not on depth

A Course In Time opens as one scroll: genre, role, team, platforms, the mechanics named on the itch.io page, the era-rule diagram labelled as an illustration, and a "What I did" list sourced as claims from the previous site. The header says how many slots on the page are still empty. Checkpoints sit beside the sections. Back to map returns to the hub.

The decision archive is on the same page. The evidence chain on each decision only fills the links that have text. The process list ticks a single stage, the playable build, and says it is not a shipped credit. Playtesting shows the debug console he has described, then an empty Observation → Insight → Design change → Result template.

A designer can tell, inside five minutes, what is published and what is not. They cannot yet judge a level, a greybox, or a playtest finding, because those files do not exist here. Filling them with fiction would fail the test in a worse way. The iteration was to label the gaps and stop calling the itch.io build a release.

## UX

The organising picture is a level select. The title does not block. The map, the list, and Skip to CV are three ways to the same projects. Filters are checkboxes plus four selects, with a visible count, an empty state, and a reset. Choosing a quest filters the list and can be removed. Nothing depends on a drag.

The weak UX is the length of a case study, and the number of empty slots. Confirmed sections come first. Empty slots sit in one closed "Still to add" disclosure, with a public "Coming soon" or "LOCKED" label. Internal requests stay in the JSON.

## Game design

The flagship is framed as systems and level design, which matches what Tyler has actually said he did: team lead, audio, coding, level design, on a team of five, Unity 6. The diagram shows the rule he describes (the building changes, what you move stays) and refuses to pretend it is a shipped level. Iteration tabs and the before/after slider are the right artefact shape, currently holding pending images rather than fake ones.

Waking Nightmare is a client handover of an in-progress build. Tabi is a multipurpose group trip planner, not a game, and it is labelled that way. A Japan trip is named only as the first real use. Two itch.io prototypes sit in Experiments with the role still pending.

Sword Saint: Broken Bridge is a supporting piece, framed by an owner decision on 29 Sep 2026, 00:29 AEST, and renamed by Tyler after that: designed by Tyler Crump, a solo design project built in Ikemen GO, the open-source fighting game engine. The page credits character and moveset design for The Sword Saint and Unknown (a mirror fighter on the same moveset), combat systems design (4 normals, a two-projectile lightning special, a meter-gated super, a back dash, block, a timed perfect block, and a stamina system), and stage design for Broken Bridge, a 6-layer storm bridge stage with animated lightning and rain. Tools on the project are Ikemen GO, Fighter Factory Studio (sprites and animation), and Notepad++ (editing character and stage files). Tags are fighting game, character design, combat design, stage design, and Ikemen GO. Media frames are still empty. The private repository is not linked. Aseprite stays on the general tools list and is not attached to this project.

## Visual and communication

One parchment palette, the same ink, cream and amber as the pixel-art end of the previous site. The title is a banded night sky over an original hotel silhouette. Type is the system sans, so no font file is on the hub. Pixel art is original: the wordmark, the avatar, the landmark sprites, and the tile map. It is not artwork from another game. The hotel is a nod to A Course In Time, not a copied sprite.

Locked slots use the words LOCKED and Coming soon. Status labels are words (Unlocked, In progress, Locked, Evidenced, Described, Pending), not colour alone. Character cards have no score bars. They show Role, Team, Stage and Timeframe.

## Engineering

`node src/build.mjs` reads `content/` and writes static HTML. No runtime dependencies. Validation fails the build on a bad slug, a missing flagship, or a fact that is neither confirmed nor pending. Internal notes are not rendered. Links are relative, so the branch can be hosted somewhere that is not the domain root. Canonical URLs still point at `crumpyofcl.github.io`.

Astro was considered and not used. The site is a few pages, the edit model is JSON, and a dependency tree would not make the evidence any more honest.

## QA

Playwright covers the title card (3s auto-advance, key, click, recruiter skip), walking the map with arrows and WASD, character cards including locked slots, list view, a click on the masthead List link, filters, the Ikemen GO case study, iteration tabs, the compare slider, the era-rule diagram, disclosures, a keyboard path from the skip link to a case study and back to contact, reduced motion, and the footer era mark not recolouring the page. axe-core (WCAG 2.0/2.1/2.2 A and AA) runs on all 8 pages, on the title card, on an open character card, and on the reduced-motion home page. 27 tests, all passing.

## Accessibility

Landmarks, a skip link, the recruiter skip, visible focus (cream ring on the dark masthead), labels on the filters, 44px targets on the map nodes, the buttons, the chips, the mobile bar, the checkpoint list and the quest buttons. List view is a plain list of the same levels. The masthead List link opens it. Case-study sections are all in the page; empty ones are inside a closed disclosure. Without JavaScript the title stays off and the list is visible. `prefers-reduced-motion` shows a static composed title (windows lit, avatar at the door, no blink), then cuts to the map. It turns off the wipe, the walk and smooth scrolling. `forced-colors` keeps the pressed state visible. There is no autoplay audio.

## Performance

The table below is the level-select run, kept as a record. Lighthouse 12, gzip on (the same compression GitHub Pages and Render apply). Python's static server does not gzip; those earlier desktop scores were lower and were discarded.

| Page | Form | Performance | Accessibility | Best practices | SEO |
| --- | --- | ---: | ---: | ---: | ---: |
| Home | Mobile | 100 | 100 | 100 | 100 |
| Home | Desktop | 97 | 100 | 100 | 100 |
| A Course In Time | Mobile | 100 | 100 | 100 | 100 |
| A Course In Time | Desktop | 97 | 100 | 100 | 100 |
| Tabi | Mobile | 100 | 100 | 100 | 100 |
| Tabi | Desktop | 99 | 100 | 100 | 100 |

Desktop performance sits in the mid-90s because the stylesheet is render-blocking. Cumulative layout shift is 0. There is no third-party script and no autoplay audio. Raw bytes of every file the hub requests (HTML, CSS, JS, map, landmarks, avatar, lake shimmer) are 148,117, under the 150,000 budget. The font file is not requested. Raw numbers are in [lighthouse-scores.json](lighthouse-scores.json). Recorded again after the stage-1 rebuild.

## Red team — what would make a pro reviewer walk away

- Treating Described rows as if the artefact were attached. The ledger intro defines the three states. A reviewer who only reads the flagship "What I did" list still sees the source line: claims from the previous site, design doc not published.
- Reading a locked slot as a rating, or a described quest as unlocked. The card says a filled bar is not a rating. Described rows stay described. The empty-slot count is in the case-study header.
- A shipped-credit requirement. This site will not satisfy it. Saying otherwise would be the actual failure.
- The SDCS booking app. The public source file's on-screen credit names other people. Tyler says the work was solo. Those names are not on this site. A reviewer who opens the repo will see the credit line and the portfolio will look careless until that is reconciled.
- Unreal, Blender, Godot, Jira, under-10 design, playtest reports, level maps. The first two are marked evidence coming. The rest are gaps. A reviewer hiring for those will not find them, and should not.

## Fixes made after the first test pass

- Era colour no longer animates. Mid-transition greys failed contrast in the future palette.
- Table-of-contents test expectation matched the real rule: All stays All; a heading link switches lens only when a single era is selected.
- Diagram checks run in Present, which is where the diagram lives.
- The keyboard path targets the flagship link by name, because Contact uses the same button style.
