// Progressive enhancement only. Without this script every page is complete:
// the inspector is a static diagram, scenes sit in their final state and
// nothing is hidden. With reduced motion, only the inspector's controls load.
(function () {
  'use strict';
  var root = document.documentElement;
  var motion = root.classList.contains('motion');
  var clamp = function (n, a, b) { return Math.max(a, Math.min(b, n)); };

  /* ---------------- Era switch inspector ---------------- */
  var FLOOR = 6, BODY = 5, TILE = 10;

  function inspector(el) {
    var data = JSON.parse(el.getAttribute('data-era-map'));
    var map = data.map;
    var player = el.querySelector('[data-era-player]');
    var label = el.querySelector('[data-era-label]');
    var count = el.querySelector('[data-era-count]');
    var status = el.querySelector('[data-era-status]');
    var controls = el.querySelector('[data-era-controls]');
    var s;

    function cell(x, y) { return map[y] ? map[y].charAt(x) : '#'; }
    function solid(era, x, y) {
      var c = cell(x, y);
      return c === '#' || (c === 'p' && era === 'past') || (c === 'n' && era === 'present');
    }
    function name(era) { return era === 'past' ? 'Past' : 'Present'; }
    function other(era) { return era === 'past' ? 'present' : 'past'; }

    function render(message) {
      el.setAttribute('data-era', s.era);
      el.setAttribute('data-state', s.state);
      var drop = s.state === 'fell' ? 12 : 0;
      player.setAttribute('transform', 'translate(' + s.x * TILE + ' ' + (BODY * TILE + drop) + ')');
      label.textContent = name(s.era);
      count.hidden = !s.switches;
      count.textContent = s.switches + (s.switches === 1 ? ' switch' : ' switches');
      if (message) status.textContent = message;
    }

    function reset() {
      s = { era: 'present', x: data.start, switches: 0, state: 'play' };
      render('Present. Use ← and → to walk and Q to switch eras. Try to reach the door on the right.');
    }

    function describe() {
      var under = cell(s.x, FLOOR), here = cell(s.x, BODY);
      if (here === (s.era === 'past' ? 'n' : 'p')) return name(s.era) + '. The ' + name(other(s.era)) + ' has something solid exactly where you are standing.';
      if (under === 'p' && s.era === 'past') return 'Past. This floor only exists in the Past.';
      return name(s.era) + '.';
    }

    function move(dx) {
      if (s.state !== 'play') { render('Press Reset to try again.'); return; }
      var nx = s.x + dx, c = cell(nx, BODY);
      if (solid(s.era, nx, BODY)) {
        if (c === 'p') render('A wall blocks the corridor in the Past. In the Present it has fallen.');
        else if (c === 'n') render('Rubble blocks the way in the Present. In the Past it hasn’t fallen yet.');
        else render('That’s the end of the corridor.');
        return;
      }
      if (!solid(s.era, nx, FLOOR)) {
        render('The floor ahead has collapsed in the Present. In the Past it is still standing.');
        return;
      }
      s.x = nx;
      if (s.x === data.exit) {
        s.state = 'won';
        render('Through the door. That route exists in neither era alone: it took ' + s.switches + ' era switches.');
        return;
      }
      render(describe());
    }

    function flip() {
      if (s.state !== 'play') { render('Press Reset to try again.'); return; }
      s.era = other(s.era);
      s.switches += 1;
      if (solid(s.era, s.x, BODY)) {
        s.state = 'crushed';
        render('Crushed. In the ' + name(s.era) + ', something solid stands exactly where you were. The crush check treats this as a death, not a glitch. Press Reset.');
      } else if (!solid(s.era, s.x, FLOOR)) {
        s.state = 'fell';
        render('You fell. The floor you were on only exists in the Past. Press Reset.');
      } else {
        render('Switched to the ' + name(s.era) + '. ' + describe().replace(/^\w+\.\s?/, ''));
      }
    }

    controls.hidden = false;
    controls.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-era-move')) move(Number(b.getAttribute('data-era-move')));
      else if (b.hasAttribute('data-era-switch')) flip();
      else if (b.hasAttribute('data-era-reset')) reset();
    });
    // Keys only act while focus is inside the inspector, so page scrolling is never hijacked.
    el.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var k = e.key;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') move(-1);
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') move(1);
      else if (k === 'q' || k === 'Q') flip();
      else if (k === 'r' || k === 'R') reset();
      else return;
      e.preventDefault();
    });

    // Tilt the diorama towards a mouse pointer so the era planes read as layers.
    var world = el.querySelector('[data-era-world]');
    var rig = el.querySelector('[data-era-rig]');
    if (motion && world && rig && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      world.addEventListener('pointermove', function (e) {
        var r = world.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        rig.style.setProperty('--ry', (-12 + x * 16).toFixed(2) + 'deg');
        rig.style.setProperty('--rx', (16 - y * 12).toFixed(2) + 'deg');
      });
      world.addEventListener('pointerleave', function () { rig.style.removeProperty('--ry'); rig.style.removeProperty('--rx'); });
    }
    reset();
  }

  /* ---------------- Scroll scenes: --p goes 0 → 1 as a scene arrives ---------------- */
  function scenes() {
    var list = [].slice.call(document.querySelectorAll('[data-scene]'));
    if (!motion || !list.length) return;
    var queued = false;
    function update() {
      queued = false;
      var vh = window.innerHeight;
      for (var i = 0; i < list.length; i++) {
        var r = list[i].getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) continue;
        var p = clamp((vh - r.top) / (vh * 0.75), 0, 1);
        list[i].style.setProperty('--p', p.toFixed(3));
        if (p > 0.7) list[i].classList.add('is-lit');
      }
    }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }
    root.classList.add('scenes-on');
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    update();
  }

  /* ---------------- Reveal on enter, and the case-study contents highlight ---------------- */
  function observers() {
    if (!('IntersectionObserver' in window)) { root.classList.remove('motion'); return; }
    if (motion) {
      var reveal = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); reveal.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -12% 0px' });
      [].forEach.call(document.querySelectorAll('[data-reveal]'), function (n) { reveal.observe(n); });
    }
    var links = {};
    [].forEach.call(document.querySelectorAll('.toc a[href^="#"]'), function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var ids = Object.keys(links);
    if (!ids.length) return;
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        ids.forEach(function (id) { links[id].removeAttribute('aria-current'); });
        links[e.target.id].setAttribute('aria-current', 'location');
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    ids.forEach(function (id) { var n = document.getElementById(id); if (n) spy.observe(n); });
  }

  function init() {
    [].forEach.call(document.querySelectorAll('[data-era-map]'), function (n) {
      try { inspector(n); } catch (err) { /* the static diagram remains usable */ }
    });
    scenes();
    observers();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
