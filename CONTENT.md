# How content works

All public copy is JSON under `content/`. The site does not contain a second copy of the words. After editing, run `node src/build.mjs` and commit the JSON and the generated HTML.

`_internal` objects and any key starting with `_` are never rendered. Do not put anything there that you would not want in a public repository: the JSON is committed.

## A fact is either confirmed or pending

Confirmed:

```json
{ "status": "confirmed", "value": "Team of 5", "source": "Where this came from" }
```

Pending (this is what visitors see as a dashed box):

```json
{ "status": "pending", "request": "What Tyler still needs to supply" }
```

`source` is for you. The page does not print it. Write requests as instructions to yourself, not as fake results. Never use lorem, sample statistics, or a playtest quote you do not have permission to publish.

Plain strings are treated as already confirmed. Prefer the object form for anything a reviewer might question.

The build fails if `status` is missing a `value` (confirmed) or a `request` (pending), if a slug is not lowercase-with-dashes, or if there is not exactly one visible flagship.

## Add a project

1. Create `content/projects/your-slug.json`.
2. Set `visible`, `tier` (`flagship`, `supporting` or `experiment`), `order`, `title`, `tagline`, `overview`, `filters`, and at least an empty `decisions` array.
3. `overview` must include `role`, `team` and `timeframe`. If you do not know them yet, use a pending object. Do not guess a date.
4. `filters` stays in the JSON for the record. The shell does not render a separate filter page:

```json
"filters": {
  "engine": "Unity",
  "year": "2026",
  "type": "University",
  "stage": "In development",
  "disciplines": ["Game Design", "Level Design"]
}
```

Use `null` for `year` when it is unknown. Disciplines the site understands: Game Design, Level Design, Gameplay, UX, Prototyping, Playtesting, Documentation, Programming, Tools, Team, Personal. A discipline with no project is listed as having no published evidence.

5. Only one visible project may be `flagship`.
6. Rebuild.

`order` sorts projects inside a tier and across the skills matrix.

## Case-study fields

Use the existing projects as the pattern. Common blocks:

| Field | Lens | What it is |
| --- | --- | --- |
| `overview`, `mechanics`, `structure`, `eraNote`, `contributions`, `collaboration`, `clientWork`, `videos`, `access` | Present | What it is, who did what |
| `problem`, `designGoal`, `process`, `decisions`, `levelDesign`, `experience`, `playtesting`, `iterations` | Past | How it was made |
| `results`, `reflection`, `next` | Future | What's next, plus an automatic count of empty slots |

`process` is a list of `{ "stage", "item" }`. A confirmed item gets a tick. A pending item stays an empty step. Do not mark a stage done without something you can point at.

`decisions` is a list. Each entry needs `decision` and `detail` (plain strings you are willing to say) plus `why`, `options`, `evidence`, `tradeoff`, `result` as confirmed or pending fields. The evidence chain on the page lights up only the links that are actually filled.

`iterations` is V1, V2, V3, Final (or your own labels). Each has `label`, `image`, `what`, `why`, `evidence`. Images are pending until you have a file.

`playtesting.sessions` is an array. Leave it empty to show the Observation → Insight → Design change → Result template. To publish a session, push an object whose fields are confirmed or pending:

```json
{
  "question": { "status": "confirmed", "value": "…", "source": "…" },
  "method": { "status": "pending", "request": "…" },
  "observation": { "status": "pending", "request": "…" },
  "insight": { "status": "pending", "request": "…" },
  "change": { "status": "pending", "request": "…" },
  "result": { "status": "pending", "request": "…" }
}
```

Do not write a finding you did not record.

`reflection` and journal entries on the home page (`content/site.json` → `journal`) can be a pending object, or a confirmed value shaped as `{ "tried", "failed", "learned", "changed" }` with each of those confirmed or pending.

## Images

Put files in `public/img/`. The build copies `public/` to the site root.

```json
"cover": {
  "status": "confirmed",
  "value": { "src": "/img/example.png", "alt": "What a recruiter needs to hear, not 'screenshot'." },
  "source": "Where the image came from, and that you have the right to show it"
}
```

Say what is in the picture. If you do not have the file, leave `status: "pending"`.

Tabi: the case-study title, map node and character card say **Tabi**. Do not write "Japan Trip Planner" or the repository name in visible copy. The only link is `https://japantrip-oeja.onrender.com`. Do not link a source repository, the Vercel host, or any other host. A Japan trip may be mentioned only as the first real use. Do not add screenshots that show trip data, other people's names, or invite codes. The cover stays pending until there is a sanitised image. Credit on the page is designer and developer, solo. The map node reads "travel / multipurpose" and uses the suitcase mark, not a Japan-specific icon.

## Skills matrix and evidence ledger

`content/site.json`:

- `skills.rows` — `evidence` is `project` (used on the listed slugs, filled square), `attested` (Tyler-attested on the listed project, hollow square, flag **Tyler-attested**), `attested-pending` (he said he did it and the file is not published, hollow square, flag **Tyler-attested, evidence pending**), `general` (you use it, no project shown) or `coming` (you use it, evidence still to come, rendered as **evidence coming**). Unreal Engine and Blender stay `coming` until there is a project. Do not invent an Unreal project. Do not point Aseprite at the Ikemen GO project until Tyler confirms he used it there.
- `benchmark.rows` — `level` is `evidenced` (a reviewer can open the artefact), `stated` (your description, artefact not public) or `pending`.

`hide: true` on a skill row keeps it in the file and off the page.

## What not to claim

- A shipped title. Itch.io builds and a client handover are not storefront credits. A Course In Time is in development. Waking Nightmare Experience is a client handover of an in-progress build.
- Godot, Jira, or design work for under-10 players. Those are gaps until you have something real.
- Team-mate names, unless they have agreed. The SDCS booking app's source file shows a credit line that names other people; you have said the work was solo. Those names are not on this site. Edit that line in the coursework repo, or decide how you want it explained, before it is copied here.
- Steam, unless you have a real Steam URL. The old site's Steam link pointed at itch.io, so Steam is omitted.

## Home page blocks

`approach`, `documents`, `journal`, `about`, `resume` and `contact` are in `content/site.json`. A résumé is a pending slot until `public/cv.pdf` exists and `resume` is confirmed. Remove phone number and street address from the PDF first.

## Pending inputs

Facts Tyler has not supplied. The site shows a dashed slot for each. Do not fill these with a guess.

### Sword Saint: Broken Bridge

File: `content/projects/sword-saint-broken-bridge.json`. The visible title is **Sword Saint: Broken Bridge**. The map plaque uses the short label **Sword Saint**. Supporting tier. Subtitle: "Designed by Tyler Crump".

Owner decision, 29 Sep 2026, 00:29 AEST, with tools added 00:30 AEST. Tyler renamed it on the portfolio after that. It is a solo design project built in Ikemen GO, the open-source fighting game engine. Credit Tyler with character and moveset design (The Sword Saint and Unknown, a mirror fighter on the same moveset), combat systems design (4 normals, a two-projectile lightning special, a meter-gated super, a back dash, block, a timed perfect block, and a stamina system), and stage design (Broken Bridge, a 6-layer storm bridge stage with animated lightning and rain). Tools: Ikemen GO, Fighter Factory Studio (sprites and animation), Notepad++ (editing character and stage files). Do not write hand-animated, hand-drawn, every frame, or AI.

Tags: fighting game, character design, combat design, stage design, Ikemen GO. Do not tag this project with animation, and do not point an animation skill at it. Do not describe how the art was produced. Do not link the private repository.

Still to supply:

- Date or timeframe
- Media, when Tyler supplies it: a sprite sheet, a GIF for The Sword Saint, a GIF for Unknown, a screenshot of Broken Bridge, and a gameplay clip. Leave the frames empty until then
