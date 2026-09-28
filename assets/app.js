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
