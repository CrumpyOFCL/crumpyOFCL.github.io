import { esc } from './lib.mjs';
// CSS geometry holds real project imagery. All destinations remain ordinary links.
export function projectStage(projects) {
  const featured = [projects[0], projects[4], projects[3]];
  return `<div class="project-stage" aria-label="Interactive project showcase">
    <div class="stage-topline"><span>THE INTERACTIVE LAB / 01—03</span><button class="motion-toggle" type="button" aria-pressed="false" hidden>Pause motion</button></div>
    <div class="stage-viewport">
      <div class="stage-camera" aria-hidden="true">
        <div class="stage-floor"></div><div class="stage-orbit"></div>
        <div class="stage-fin fin-one"></div><div class="stage-fin fin-two"></div><div class="stage-fin fin-three"></div>
        <div class="stage-plinth"><div class="plinth-top"></div><div class="plinth-front"><span>TC / INTERACTIVE WORK</span></div></div>
        <div class="stage-screen"><div class="screen-rim"><span>PROJECT VIEW</span><i></i></div>
          ${featured.map((p,i)=>`<img class="stage-shot ${i===0?'is-active':''} shot-${p.slug}" data-stage-shot="${i}" src="${esc(p.image)}" alt="" width="800" height="450">`).join('')}
        </div>
        <div class="stage-tag tag-front">DESIGN → BUILD → PLAY</div><div class="stage-tag tag-back">TYLER<br>CRUMP<span>CREATIVE SYSTEMS / 2026</span></div>
      </div>
      <div class="stage-cross cross-one" aria-hidden="true">+</div><div class="stage-cross cross-two" aria-hidden="true">+</div>
    </div>
    <div class="stage-caption" aria-live="polite"><span class="eyebrow" data-stage-kind>${esc(featured[0].kind)}</span><a data-stage-link href="${featured[0].slug}.html">${esc(featured[0].title)} <span aria-hidden="true">↗</span></a><p data-stage-note>Project logo · explore the case study</p></div>
    <div class="stage-choices" hidden aria-label="Choose a project">
      ${featured.map((p,i)=>`<button type="button" data-stage-choice="${i}" data-stage-title="${esc(p.title)}" data-stage-kind="${esc(p.kind)}" data-stage-url="${p.slug}.html" data-stage-note="${i===0?'Project logo · explore the case study':i===1?'Original in-game preview':'Public sign-in interface'}" aria-pressed="${i===0}"><span>0${i+1}</span>${i===0?'A Course In Time':i===1?'Sword Saint':'Tabi'}</button>`).join('')}
    </div>
  </div>`;
}
