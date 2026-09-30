# Content inventory and open questions

Sources used, in order of trust:
1. The supplied résumé (`public/Tyler-Crump-Resume.docx`)
2. The public itch.io pages at crumpyofcl.itch.io (checked 30 September 2026)
3. Tyler's own earlier project records (now `content/projects/*.json`)

Nothing on the site goes beyond these. Where they disagree, the choice made is listed below.

## Please confirm (accuracy)

- **A Course In Time date.** The itch.io credits say *COMP3150, Session 1 2026*; the résumé says *COMP3150 2025*. The site follows itch.io. Update whichever is wrong, ideally the résumé too.
- **Waking Nightmare = PhobiaVR.** The Waking Nightmare itch.io cover carries the PhobiaVR logo, so the two are shown as one project (`waking-nightmare.html`; `phobiavr.html` redirects). The résumé calls it COMP3150 2025; itch.io says it was made for PACE. The site says "2025 · Macquarie University" and avoids the unit code.
- **A Course In Time contributions** combine the résumé (moving platforms, dash/jump/audio, skill tree save/load, HUD, Time Beam, WebGL audio, URP particles, playtesting, production report) with your earlier records (era system and crush check, puzzle generators, objective-ledger save, debug console). Payton Saunders is credited as lead programmer, so check that every line reads as yours.
- **Browser build.** The A Course In Time description on itch.io mentions WebGL, but the page only offers a Windows ZIP (`InTimePC.zip`). The site says "Download for Windows". If a browser build is added, change the link label in `content/projects/a-course-in-time.json`.
- **LinkedIn.** The résumé shows `linkedin.com/in/tyler-crump-`, which may be cut off. It's left off the site until confirmed.
- **Tabi's demo.** The case study now links "Try the demo trip" and describes the demo (Tabi PR #61) as a fifth design decision. Confirm you're happy presenting it as your work.
- **Tabi bug (not fixed here).** If no JPY→AUD rate has been fetched, the trip home card adds yen and dollars together and labels the sum A$ (a local test showed "A$759,956 … over budget"). The budget screen already handles this by keeping currencies apart. Production has a cached rate, so the demo currently shows correct totals.
- **LIT_Flux Mechanics Showcase** has the same mechanics as A Course In Time (time swap, time cannon, dash, double jump). If it was the team's prototype, it would make good iteration evidence on the A Course In Time page. Not linked until confirmed.

## Missing evidence, in order of impact

1. **A Course In Time gameplay capture.** A 10–20 second clip or 3–4 screenshots of an era switch, ideally including a crush. The case study currently shows only the logo and the diagram.
2. **Playtest findings.** One or two findings from the 36-respondent sessions and the change each led to. This is the most convincing design evidence you could add.
3. **Sword Saint.** A short fight clip, a timeframe, perfect-block timing and stamina rules, and a build or source link if you can share one.
4. **Waking Nightmare.** Headset capture (a Quest recording is fine) and a screenshot of the EventManager in the inspector or code.
5. **Tabi.** A before/after from one redesign. (Screens are now captured from the public demo trip, which holds only made-up data.)
6. **Résumé as PDF.** The DOCX is published as supplied. It couldn't be converted here.

## Inventory

| Project | Role (verified) | Best visual asset | Build / links | On the site |
| --- | --- | --- | --- | --- |
| A Course In Time | Producer / team leader, lead playtester; programming, level design, audio | Title logo (team art). No gameplay capture | Windows ZIP on itch.io | Featured #1 + era-switch inspector |
| Sword Saint: Broken Bridge | Solo designer | In-engine capture, stage, sprite sheet | None public | Featured #2 |
| Waking Nightmare (PhobiaVR) | Creative director, programmer, client contact | PhobiaVR logo | Quest APK on itch.io | Featured #3 |
| Tabi | Solo designer and developer | Four screens from the public demo trip | Live, invite-only, public demo | "Outside games" |
| Desert Scene (OpenGL) | Built the scene and report | None | None | One line under About |
| GDT2, LIT_Flux, SDCS Booking | — | None | itch.io / GitHub | Not shown (removed in PR #3) |

No assignment brief was supplied, so no assignment requirements are mapped. If this portfolio is for a unit, add the requirements here and map each one to a page or section.
