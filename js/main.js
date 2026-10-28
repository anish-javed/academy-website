/* Zenith Academy - shared behaviour: menu, scroll animations (GSAP + ScrollTrigger),
   hand-drawn underlines, floating icons, journey line, WhatsApp button.

   Rules we follow:
   - NOTHING is ever pinned. The page always scrolls normally.
   - Phones get lighter animations.
   - If the visitor asked for "reduce motion" (or GSAP did not load) nothing is animated
     and everything is simply shown. */
(function () {
  'use strict';
  window.ZA = window.ZA || {};

  var html = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqMobile = window.matchMedia('(max-width: 720px)');
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var animate = hasGsap && !reduce;

  ZA.reduce = reduce;
  ZA.animate = animate;
  ZA.isMobile = function () { return mqMobile.matches; };
  html.classList.add(animate ? 'motion' : 'no-motion');

  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Menu ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      toggle.innerHTML = ZA.icon(open ? 'close' : 'menu');
    };
    toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  /* ---------- Header shadow ---------- */
  var header = document.querySelector('.site-header');
  var lastY = window.scrollY;
  var wa = document.querySelector('.wa-fab');
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 8);
    // WhatsApp button: on phones it tucks away while reading downwards so it never covers text.
    if (wa && mqMobile.matches) {
      var nearTop = y < 200;
      var nearBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 120;
      if (y > lastY + 6 && !nearTop && !nearBottom) wa.classList.add('tucked');
      else if (y < lastY - 6 || nearTop || nearBottom) wa.classList.remove('tucked');
    } else if (wa) {
      wa.classList.remove('tucked');
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hide the WhatsApp button on phones while the visitor is typing in a form.
  if (wa) {
    document.addEventListener('focusin', function (e) {
      if (mqMobile.matches && e.target.matches('input, select, textarea')) wa.classList.add('tucked');
    });
    document.addEventListener('focusout', function () { wa.classList.remove('tucked'); });
  }

  /* ---------- Hand-drawn underlines ---------- */
  var SCRIBBLES = [
    'M4 9 C 34 3, 62 12, 98 6 S 156 4, 196 9',
    'M3 8 C 44 13, 74 3, 112 7 S 172 12, 197 5',
    'M5 7 C 28 11, 66 4, 104 9 S 160 5, 195 8'
  ];
  var underlines = [];
  document.querySelectorAll('[data-uline]').forEach(function (el, i) {
    el.classList.add('uline');
    var c = el.getAttribute('data-uline');
    if (c === 'coral' || c === 'navy') el.classList.add(c);
    var ns = 'http://www.w3.org/2000/svg';
    var s = document.createElementNS(ns, 'svg');
    s.setAttribute('class', 'uline-svg');
    s.setAttribute('viewBox', '0 0 200 14');
    s.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS(ns, 'path');
    p.setAttribute('d', SCRIBBLES[i % SCRIBBLES.length]);
    p.setAttribute('pathLength', '1');
    s.appendChild(p);
    el.appendChild(s);
    underlines.push({ el: el, path: p });
  });

  if (animate) {
    underlines.forEach(function (u) {
      gsap.set(u.path, { strokeDashoffset: 1.05 });
      ScrollTrigger.create({
        trigger: u.el, start: 'top 90%', once: true,
        onEnter: function () {
          gsap.to(u.path, { strokeDashoffset: 0, duration: mqMobile.matches ? 0.6 : 1.1, delay: 0.25, ease: 'power2.inOut' });
        }
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  if (animate) {
    var mobile = mqMobile.matches;
    var dist = mobile ? 18 : 40;
    var els = gsap.utils.toArray('[data-reveal]');
    els.forEach(function (el) {
      var kind = el.getAttribute('data-reveal');
      var from = { opacity: 0 };
      if (kind === 'left') from.x = mobile ? 0 : -dist;
      else if (kind === 'right') from.x = mobile ? 0 : dist;
      else if (kind === 'zoom') from.scale = mobile ? 1 : 0.9;
      else from.y = dist;
      if ((kind === 'left' || kind === 'right') && mobile) from.y = dist;
      gsap.set(el, from);
    });
    ScrollTrigger.batch(els, {
      start: 'top 90%',
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, {
          opacity: 1, x: 0, y: 0, scale: 1,
          duration: mobile ? 0.5 : 0.85, stagger: mobile ? 0.07 : 0.12, ease: 'power3.out', overwrite: true,
          clearProps: 'transform'
        });
      }
    });
  }

  /* ---------- Floating subject icons ---------- */
  var fis = document.querySelectorAll('.fi');
  if (animate && fis.length) {
    fis.forEach(function (el, i) {
      var host = el.closest('.hero, .page-hero, section') || el.parentElement;
      if (mqMobile.matches) {
        // light version: just a gentle one-time pop-in
        gsap.from(el, { opacity: 0, scale: 0.6, duration: 0.6, delay: 0.1 * i, ease: 'back.out(2)' });
        return;
      }
      var bob = gsap.to(el, {
        y: (i % 2 ? -16 : 16), rotation: (i % 2 ? 7 : -7), duration: 2.4 + i * 0.35,
        ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true
      });
      // only bob while the hero is on screen (saves battery); this never touches scrolling
      ScrollTrigger.create({
        trigger: host, start: 'top bottom', end: 'bottom top',
        onToggle: function (self) { self.isActive ? bob.play() : bob.pause(); }
      });
      gsap.to(el, {
        yPercent: (i % 2 ? -60 : 60), ease: 'none',
        scrollTrigger: { trigger: host, start: 'top top', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ---------- Journey line ---------- */
  var track = document.getElementById('journeyTrack');
  if (track) {
    var svg = track.querySelector('.journey-svg');
    var bg = svg.querySelector('.jp-bg');
    var fg = svg.querySelector('.jp');
    var trav = svg.querySelector('.jt');
    var stops = Array.prototype.slice.call(track.querySelectorAll('.stop'));
    var dots = stops.map(function (s) { return s.querySelector('.dot'); });
    var jTrigger = null;

    var centre = function (el) {
      var x = 0, y = 0, e = el;
      while (e && e !== track) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
      return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2 };
    };

    var buildJourney = function () {
      if (jTrigger) { jTrigger.kill(); jTrigger = null; }
      var w = track.offsetWidth, h = track.offsetHeight;
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      var pts = dots.map(centre);
      var amp = mqMobile.matches ? 16 : 80;
      var d = 'M' + pts[0].x + ' ' + pts[0].y;
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i], dy = b.y - a.y, s = (i % 2 ? 1 : -1) * amp;
        d += ' C ' + (a.x + s) + ' ' + (a.y + dy * 0.4) + ', ' + (b.x - s) + ' ' + (a.y + dy * 0.6) + ', ' + b.x + ' ' + b.y;
      }
      bg.setAttribute('d', d);
      fg.setAttribute('d', d);
      var len = fg.getTotalLength();

      if (!animate) {
        fg.style.strokeDasharray = 'none';
        trav.style.display = 'none';
        stops.forEach(function (s) { s.classList.add('on'); });
        return;
      }
      fg.style.strokeDasharray = len;
      fg.style.strokeDashoffset = len;
      trav.setAttribute('r', 11);
      var start = fg.getPointAtLength(0);
      trav.setAttribute('cx', start.x);
      trav.setAttribute('cy', start.y);
      stops.forEach(function (s) { s.classList.remove('on'); });

      // The line is drawn as the visitor scrolls (scrub). Nothing is pinned.
      jTrigger = ScrollTrigger.create({
        trigger: track, start: 'top 70%', end: 'bottom 65%', scrub: true,
        onUpdate: function (self) {
          var drawn = self.progress * len;
          fg.style.strokeDashoffset = len - drawn;
          var pt = fg.getPointAtLength(drawn);
          trav.setAttribute('cx', pt.x);
          trav.setAttribute('cy', pt.y);
          trav.style.opacity = self.progress <= 0.001 ? 0 : 1;
          stops.forEach(function (s, i) { s.classList.toggle('on', pts[i].y <= pt.y + 6 && self.progress > 0.001); });
        }
      });
    };

    buildJourney();
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { buildJourney(); if (hasGsap) ScrollTrigger.refresh(); }, 200);
    });
    window.addEventListener('load', function () { buildJourney(); if (hasGsap) ScrollTrigger.refresh(); });
  }

  /* ---------- Final refresh once everything has loaded ---------- */
  if (hasGsap) window.addEventListener('load', function () { ScrollTrigger.refresh(); });

  /* ---------- Small helper other scripts can use ---------- */
  ZA.$ = function (sel, root) { return (root || document).querySelector(sel); };
  ZA.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
})();
