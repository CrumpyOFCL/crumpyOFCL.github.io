// Progressive enhancement: all content and navigation work without scripts.
for (const button of document.querySelectorAll('[data-system-toggle]')) {
  const list = button.closest('section').querySelector('.system-list');
  button.addEventListener('click', () => {
    const active = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(active));
    button.textContent = active ? 'Overview' : 'System view';
    list.classList.toggle('is-system', active);
  });
}

const stage = document.querySelector('.project-stage');
if (stage) {
  stage.querySelector('.stage-choices').hidden = false;
  const camera = stage.querySelector('.stage-camera');
  const choices = [...stage.querySelectorAll('[data-stage-choice]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  const motionButton = stage.querySelector('.motion-toggle');
  let paused = reduced.matches;
  let pointerX = 0;
  let pointerY = 0;
  let frame = 0;
  let inView = true;
  const update = () => {
    frame = 0;
    if (paused || !inView) return;
    const progress = Math.min(1, Math.max(0, scrollY / innerHeight));
    camera.style.setProperty('--pitch', `${-9 + progress * 12 + pointerY * 4}deg`);
    camera.style.setProperty('--yaw', `${-17 + progress * 23 + pointerX * 7}deg`);
  };
  const schedule = () => { if (!frame && !paused && inView) frame = requestAnimationFrame(update); };
  const syncMotion = () => {
    motionButton.textContent = paused ? 'Enable motion' : 'Pause motion';
    motionButton.setAttribute('aria-pressed', String(paused));
    if (paused) {
      camera.style.setProperty('--pitch', '-5deg');
      camera.style.setProperty('--yaw', '-8deg');
    } else schedule();
  };
  motionButton.hidden = false;
  motionButton.addEventListener('click', () => { paused = !paused; syncMotion(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; syncMotion(); });
  stage.addEventListener('pointermove', event => {
    if (!fine.matches || paused) return;
    const rect = stage.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width - .5;
    pointerY = (event.clientY - rect.top) / rect.height - .5;
    schedule();
  });
  stage.addEventListener('pointerleave', () => { pointerX = pointerY = 0; schedule(); });
  addEventListener('scroll', schedule, { passive: true });
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; schedule(); }).observe(stage);
  for (const button of choices) button.addEventListener('click', () => {
    for (const other of choices) other.setAttribute('aria-pressed', String(other === button));
    for (const shot of stage.querySelectorAll('[data-stage-shot]')) shot.classList.toggle('is-active', shot.dataset.stageShot === button.dataset.stageChoice);
    stage.querySelector('[data-stage-kind]').textContent = button.dataset.stageKind;
    const link = stage.querySelector('[data-stage-link]');
    link.href = button.dataset.stageUrl;
    link.textContent = `${button.dataset.stageTitle} ↗`;
    stage.querySelector('[data-stage-note]').textContent = button.dataset.stageNote;
  });
  syncMotion();
}
