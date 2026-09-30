// Era switch inspector. Progressive enhancement: without this script the
// figure is a complete static diagram with the route described in text.
(function () {
  'use strict';
  var FLOOR = 6, BODY = 5, TILE = 10;

  function setup(root) {
    var data = JSON.parse(root.getAttribute('data-era-map'));
    var map = data.map;
    var player = root.querySelector('[data-era-player]');
    var label = root.querySelector('[data-era-label]');
    var count = root.querySelector('[data-era-count]');
    var status = root.querySelector('[data-era-status]');
    var controls = root.querySelector('[data-era-controls]');
    var s;

    function cell(x, y) { return map[y] ? map[y].charAt(x) : '#'; }
    function solid(era, x, y) {
      var c = cell(x, y);
      return c === '#' || (c === 'p' && era === 'past') || (c === 'n' && era === 'present');
    }
    function name(era) { return era === 'past' ? 'Past' : 'Present'; }
    function other(era) { return era === 'past' ? 'present' : 'past'; }

    function render(message) {
      root.setAttribute('data-era', s.era);
      root.setAttribute('data-state', s.state);
      var drop = s.state === 'fell' ? 12 : 0;
      player.setAttribute('transform', 'translate(' + s.x * TILE + ' ' + (BODY * TILE + drop) + ')');
      label.textContent = name(s.era);
      if (s.switches) {
        count.hidden = false;
        count.textContent = s.switches + (s.switches === 1 ? ' switch' : ' switches');
      } else {
        count.hidden = true;
      }
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
    root.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var k = e.key;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') move(-1);
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') move(1);
      else if (k === 'q' || k === 'Q') flip();
      else if (k === 'r' || k === 'R') reset();
      else return;
      e.preventDefault();
    });
    reset();
  }

  function init() {
    var nodes = document.querySelectorAll('[data-era-map]');
    for (var i = 0; i < nodes.length; i++) {
      try { setup(nodes[i]); } catch (err) { /* the static diagram remains usable */ }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
