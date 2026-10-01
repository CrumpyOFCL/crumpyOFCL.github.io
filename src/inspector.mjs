// The era-switch inspector: a one-corridor model of A Course In Time's core rule.
// Each era is its own plane in a small 3D diorama: the active era slides forward
// into the playable layer, the other drops back behind it as an outline.
// The server renders a complete static diagram; app.js adds the controls.
// Map key: '#' solid in both eras, 'p' Past only, 'n' Present only, '.' empty.
export const ERA_MAP = [
  '################',
  '#..........p...#',
  '#..........p...#',
  '#..........p...#',
  '#..........p.n.#',
  '#..........p.n.#',
  '#####pppp#######',
];
export const ERA_START = 2;
export const ERA_EXIT = 14;
const T = 10; // SVG units per tile
const W = ERA_MAP[0].length * T;
const H = ERA_MAP.length * T;

function tiles(char, cls) {
  let out = '';
  ERA_MAP.forEach((row, y) => [...row].forEach((c, x) => {
    if (c !== char) return;
    out += `<rect class="${cls}" style="--x:${x}" x="${x * T + 0.5}" y="${y * T + 0.5}" width="${T - 1}" height="${T - 1}" rx="1"/>`;
  }));
  return out;
}

const layer = (name, body, extra = 'aria-hidden="true"') =>
  `<svg class="era__layer era__layer--${name}" viewBox="0 0 ${W} ${H}" ${extra}>${body}</svg>`;

export function inspector({ id = 'era', headingLevel = 2, title = 'Try the rule', link = '' }) {
  const h = `h${headingLevel}`;
  const map = JSON.stringify({ map: ERA_MAP, start: ERA_START, exit: ERA_EXIT });
  const actors = `<desc id="${id}-desc">Diagram of a hotel corridor in the Present. A collapsed floor section exists only in the Past. A wall and a pile of rubble each exist in only one era. The player starts on the left and the exit door is on the right.</desc>
      ${tiles('#', 't-both')}
      <g class="era__exit" transform="translate(${ERA_EXIT * T} ${4 * T})"><rect x="1.5" y="0.5" width="7" height="${2 * T - 1}" rx="3.5"/><circle cx="6.5" cy="${T + 1}" r="0.8"/></g>
      <g class="era__player" data-era-player transform="translate(${ERA_START * T} ${5 * T})"><circle class="era__head-dot" cx="5" cy="-2.2" r="2.4"/><path class="era__body" d="M5 0.3 L5 6.2 M5 6.2 L2.6 9.6 M5 6.2 L7.4 9.6 M1.8 2.6 L8.2 2.6"/><path class="era__hat" d="M2 -3.6 L5 -9.5 L8 -3.6 Z"/></g>`;
  return `<figure class="era" id="${id}" data-era="present" data-era-map='${map}' aria-labelledby="${id}-title">
  <figcaption class="era__head">
    <${h} class="era__title" id="${id}-title">${title}</${h}>
    <p class="era__state"><span class="era__label" data-era-label>Present</span><span class="era__count" data-era-count hidden>0 switches</span></p>
  </figcaption>
  <div class="era__world" data-era-world>
    <div class="era__rig" data-era-rig>
      <div class="era__plate" aria-hidden="true"></div>
      ${layer('past', tiles('p', 't-past'))}
      ${layer('present', tiles('n', 't-present'))}
      ${layer('both', actors, `role="img" aria-labelledby="${id}-desc"`)}
    </div>
  </div>
  <ul class="era__legend" aria-label="Legend">
    <li><span class="key key--both"></span>Solid in both eras</li>
    <li><span class="key key--past"></span>Past only</li>
    <li><span class="key key--present"></span>Present only</li>
    <li><span class="key key--ghost"></span>Set back: the other era</li>
  </ul>
  <div class="era__controls" data-era-controls hidden>
    <button type="button" data-era-move="-1" aria-label="Move left"><span aria-hidden="true">←</span></button>
    <button type="button" data-era-move="1" aria-label="Move right"><span aria-hidden="true">→</span></button>
    <button type="button" class="era__switch" data-era-switch>Switch era <kbd>Q</kbd></button>
    <button type="button" class="era__reset" data-era-reset>Reset</button>
  </div>
  <p class="era__status" data-era-status role="status">Route: walk right in the Present, switch to the Past to cross the collapsed floor, switch back to pass the wall, then switch again to get round the rubble.</p>
  <p class="era__note">A simplified model of the rule, not a level from the game.${link ? ` ${link}` : ''}</p>
</figure>`;
}
