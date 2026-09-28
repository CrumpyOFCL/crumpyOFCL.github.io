# Concepts

Five ways to organise the portfolio were scored, then one was built. Scores are 1–5. Complexity is scored as ease (5 = straightforward to build and maintain). Total is out of 45.

Criteria, in order: originality, usability, visual impact, portfolio value, fit for the junior design brief, ease, accessibility, mobile, credibility.

| Concept | Orig. | Use | Visual | Value | Fit | Ease | A11y | Mobile | Credibility | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Level Select | 5 | 4 | 5 | 5 | 5 | 3 | 4 | 4 | 5 | **40** |
| Era Lens | 4 | 4 | 4 | 5 | 5 | 4 | 4 | 4 | 5 | **39** |
| Evidence ledger | 4 | 4 | 3 | 4 | 5 | 4 | 5 | 5 | 4 | **38** |
| Design constellation | 3 | 2 | 4 | 3 | 3 | 2 | 2 | 2 | 3 | **24** |
| Explorable hotel | 5 | 2 | 5 | 3 | 3 | 1 | 2 | 1 | 3 | **25** |
| Designer's workbench | 4 | 2 | 4 | 3 | 3 | 2 | 2 | 2 | 3 | **25** |

Throwaway sketches (not linked from the site):

- [prototypes/era-lens.html](../prototypes/era-lens.html) — [screenshot](../prototypes/era-lens.png)
- [prototypes/evidence-ledger.html](../prototypes/evidence-ledger.html) — [screenshot](../prototypes/evidence-ledger.png)
- [prototypes/design-constellation.html](../prototypes/design-constellation.html) — [screenshot](../prototypes/design-constellation.png)
- [prototypes/hotel-map.html](../prototypes/hotel-map.html) — [screenshot](../prototypes/hotel-map.png)
- [prototypes/workbench.html](../prototypes/workbench.html) — [screenshot](../prototypes/workbench.png)

## Level Select — chosen

Chosen by the Owner on 29 Sep 2026, 00:34 AEST. Tyler asked for something more creative and game-like than a theme switch, and for a first impression a headhunter can enjoy in the first few seconds.

The portfolio is a game's level select. A pixel title card ("TYLER CRUMP", the subtitle "Game / Level / Gameplay Designer", blinking PRESS START) leaves by itself after 2.5 seconds, or on any key, click or tap. It never blocks. "Skip to CV / Recruiter view" is on screen from the first frame and opens a plain list plus the save file. The hub is an original overworld: A Course In Time is the large castle, three supporting projects are worlds, and the experiments are small bonus stages. A small avatar walks that path. Choosing a node opens a character-select card whose bars are confirmed facts, not scores. Empty facts are locked slots. The skills list is a quest log (unlocked, in progress, locked). The CV is a save file. Contact is a Continue? screen. Case studies keep the process, level design, playtesting, decisions, iterations and collaboration notes in a normal reading layout, with a checkpoint nav and a way back to the map.

`prefers-reduced-motion` skips the title, the wipe, the blink and the idle bob, and shows the map immediately. There is no autoplay audio. A plain list view reaches every node. The pixel art is CSS and a small original SVG, not assets from another game.

## Era Lens — rejected by the Owner

Previously built on this branch and scored 39. Rejected by the Owner on 29 Sep 2026, 00:34 AEST: the Past / Present / Future look was not creative or game-like enough, and it did not earn the first few seconds with a headhunter. The era switch is no longer the navigation. A small footer mark can still show "1743 / Today / 2311" and does not recolour the page.

The old site already had a Past 1743 / Present / Future 2311 switch that recoloured one page. That idea is the same rule as A Course In Time: the layout holds still, the state of the world changes. Making that control the way you read the portfolio is specific to Tyler's work, and a recruiter still lands on a normal page. It lost on the first impression Tyler asked for.

While it was the chosen concept, the home switch only re-themed, and a case study used it as a reading lens: Present (what it is), Past (how it was made), Future (what's next), and All. That reading order is gone. Case studies now show every section in one scroll. The evidence record is still on the home page, restyled as a quest log, because a reviewer needs a map of what is proved.

Credibility stayed high because the new interaction does not invent artefacts either. A filled bar is a confirmed fact. A locked slot is an empty fact. A sparse graph, a hotel of empty rooms, or a desk of placeholder props would advertise the gaps in a less honest way.

## Why the others lost

**Evidence ledger (38)** is the right honesty model and is on the home page. As the only organising idea it is a table. It does not give the flagship a way to be read in layers, and it has less to do with the game.

**Design constellation (24)** needs edges that exist. Playtesting, documentation, level maps and a shipped credit are absent. The sketch is mostly dashed nodes. It is also a poor keyboard and small-screen pattern.

**Explorable hotel (25)** is the most original picture and the worst recruitment page. Finding "what he is looking for" would mean walking a floor plan. That fails the thirty-second test, and a room metaphor is hard to make accessible.

**Designer's workbench (25)** has the same problem with less of Tyler's actual game in it. Dragging cards is extra work for a reviewer, and there are not enough real artefacts to drag.

## What was refined after the choice

- The title card is skippable from the first frame, and it leaves on its own. Reduced motion never shows it.
- Character-select bars are filled or locked. They are not percentages.
- Solo is labelled as team size, not as a collaboration score.
- Stated design-record rows stay "Described". They are not marked unlocked.
- A Course In Time's era-count disagreement (itch.io says two eras, the previous site says three) is a pending note, not a picked number.
- The era-rule diagram on that case study stays labelled as an illustration, not a level.
