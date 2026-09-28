# Concepts

Five ways to organise the portfolio were scored, then one was built. Scores are 1–5. Complexity is scored as ease (5 = straightforward to build and maintain). Total is out of 45.

Criteria, in order: originality, usability, visual impact, portfolio value, fit for the junior design brief, ease, accessibility, mobile, credibility.

| Concept | Orig. | Use | Visual | Value | Fit | Ease | A11y | Mobile | Credibility | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
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

## Era Lens — chosen

The old site already had a Past 1743 / Present / Future 2311 switch that recoloured one page. That idea is the same rule as A Course In Time: the layout holds still, the state of the world changes. Making that control the way you read the portfolio is specific to Tyler's work, and a recruiter still lands on a normal page.

On the home page the switch only re-themes. On a case study it is a reading lens:

- **Present** — what it is. Overview, mechanics, what Tyler did, who did what. This is the default.
- **Past** — how it was made. Goal, process, decisions, level design, player experience, playtesting, iterations.
- **Future** — what's next, including a count of evidence slots still empty.
- **All** — every section, for someone who wants one scroll.

Empty slots sit mostly in Past and Future, so the default view is not a wall of dashed boxes. The home page also keeps an evidence ledger and a skills matrix (the second concept), because a reviewer needs a map of what is proved. The ledger did not need to be the navigation.

Credibility scored 5 because the interaction does not require invented artefacts. A sparse graph, a hotel of empty rooms, or a desk of placeholder props would advertise the gaps.

## Why the others lost

**Evidence ledger (38)** is the right honesty model and is on the home page. As the only organising idea it is a table. It does not give the flagship a way to be read in layers, and it has less to do with the game.

**Design constellation (24)** needs edges that exist. Playtesting, documentation, level maps and a shipped credit are absent. The sketch is mostly dashed nodes. It is also a poor keyboard and small-screen pattern.

**Explorable hotel (25)** is the most original picture and the worst recruitment page. Finding "what he is looking for" would mean walking a floor plan. That fails the thirty-second test, and a room metaphor is hard to make accessible.

**Designer's workbench (25)** has the same problem with less of Tyler's actual game in it. Dragging cards is extra work for a reviewer, and there are not enough real artefacts to drag.

## What was refined after the choice

The lens was already the structure of the staging build. Refinements on this branch:

- Home era buttons show 1743 / Today / 2311, including on a phone, so the theme is identifiable without a paragraph.
- Case studies open in Present even if the home page was last left in another era, so a shared link does not dump a recruiter into the gap list. The home page still remembers its era.
- A line under each case-study title states how many slots are empty.
- A Course In Time's era-count disagreement (itch.io says two eras, the previous site says three) is a pending note, not a picked number.
- The era-rule diagram stays labelled as an illustration, not a level.
