/* Zenith Academy - Programs page: open/close cards, filter tabs, percentage calculator. */
(function () {
  'use strict';

  /* ---------- Open / close program cards ---------- */
  var progs = Array.prototype.slice.call(document.querySelectorAll('.prog'));

  function setOpen(card, open) {
    card.classList.toggle('open', open);
    var b = card.querySelector('.prog-btn');
    if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
    // the heights of the page change, so tell ScrollTrigger to re-measure
    if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 450);
  }

  progs.forEach(function (card) {
    var btn = card.querySelector('.prog-btn');
    btn.addEventListener('click', function () {
      var willOpen = !card.classList.contains('open');
      setOpen(card, willOpen);
      if (willOpen) history.replaceState(null, '', '#' + card.id);
    });
  });

  function openFromHash() {
    var id = decodeURIComponent((location.hash || '').slice(1));
    if (!id) return;
    var card = document.getElementById(id);
    if (!card || !card.classList.contains('prog')) return;
    // make sure the right filter tab is not hiding it
    var group = card.closest('.prog-group');
    if (group && group.hidden) applyFilter('all');
    setOpen(card, true);
    setTimeout(function () {
      card.scrollIntoView({ behavior: window.ZA && ZA.reduce ? 'auto' : 'smooth', block: 'start' });
    }, 120);
  }

  /* ---------- Filter tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('.prog-group'));
  function applyFilter(f) {
    tabs.forEach(function (t) { t.setAttribute('aria-pressed', t.getAttribute('data-filter') === f ? 'true' : 'false'); });
    groups.forEach(function (g) { g.hidden = !(f === 'all' || g.getAttribute('data-group') === f); });
    if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 50);
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { applyFilter(t.getAttribute('data-filter')); }); });

  window.addEventListener('hashchange', openFromHash);
  window.addEventListener('load', openFromHash);

  /* ---------- Percentage calculator ---------- */
  var got = document.getElementById('calcGot');
  var total = document.getElementById('calcTotal');
  var err = document.getElementById('calcErr');
  var pctEl = document.getElementById('calcPct');
  var msgEl = document.getElementById('calcMsg');
  var fg = document.getElementById('gaugeFg');
  var form = document.getElementById('calcForm');
  if (!got || !total) return;

  form.addEventListener('submit', function (e) { e.preventDefault(); });

  var shown = 0, raf = null;
  function countTo(target) {
    if (raf) cancelAnimationFrame(raf);
    if (window.ZA && ZA.reduce) { shown = target; pctEl.textContent = target.toFixed(1); return; }
    var from = shown, t0 = null, dur = 700;
    function tick(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur);
      shown = from + (target - from) * (1 - Math.pow(1 - k, 3));
      pctEl.textContent = shown.toFixed(1);
      if (k < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
  }

  function messageFor(p) {
    if (p >= 90) return 'Outstanding work! You are already close to your zenith. Keep shining.';
    if (p >= 80) return 'Excellent! Keep this energy going, great things are coming your way.';
    if (p >= 70) return 'Very good! A little more practice and you will shine even brighter.';
    if (p >= 60) return 'Good job! Steady effort every day will take you higher.';
    if (p >= 50) return 'Nice effort! Every step forward counts, and we are here to help you grow.';
    if (p >= 33) return 'You are on your way. With a good plan and some support you can climb much higher.';
    return 'Every great journey starts somewhere. Do not lose heart. With practice and support, you can do it!';
  }

  function colourFor(p) {
    if (p >= 80) return '#1a9d62';
    if (p >= 60) return '#ffb703';
    if (p >= 40) return '#ff9f43';
    return '#ff6b57';
  }

  function reset(message) {
    fg.style.strokeDashoffset = 1.05;
    countTo(0);
    pctEl.textContent = '--';
    msgEl.textContent = message || 'Enter your marks to see your percentage.';
  }

  function update() {
    var a = got.value.trim(), b = total.value.trim();
    err.style.display = 'none';
    if (a === '' && b === '') return reset();
    if (a === '' || b === '') { reset('Almost there. Please fill in both boxes.'); return; }
    var x = parseFloat(a), y = parseFloat(b);
    var problem = '';
    if (isNaN(x) || isNaN(y)) problem = 'Please type numbers only.';
    else if (y <= 0) problem = 'Total marks must be more than zero.';
    else if (x < 0) problem = 'Marks obtained cannot be less than zero.';
    else if (x > y) problem = 'Marks obtained cannot be more than the total marks. Please check the numbers.';
    if (problem) {
      err.textContent = problem;
      err.style.display = 'block';
      reset('Let us fix the numbers first.');
      return;
    }
    var p = (x / y) * 100;
    fg.style.stroke = colourFor(p);
    fg.style.strokeDashoffset = 1 - p / 100;
    countTo(p);
    msgEl.textContent = messageFor(p);
  }
  got.addEventListener('input', update);
  total.addEventListener('input', update);
})();
