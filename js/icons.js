/* Zenith Academy - SVG icon library (all drawn in code, no images).
   Use:  <span data-icon="atom"></span>   (optional data-size="48")
   Icons use currentColor for lines and the CSS variable --icon-accent for the colourful part. */
(function () {
  'use strict';
  window.ZA = window.ZA || {};

  var A = 'var(--icon-accent, #FFC93C)';
  var I = {
    atom:
      '<ellipse cx="24" cy="24" rx="20" ry="8"/><ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(120 24 24)"/><circle cx="24" cy="24" r="3.6" fill="' + A + '" stroke="none"/>',
    beaker:
      '<path d="M18 5h12M20 5v15L8 40a3 3 0 0 0 2.7 4.3h26.6A3 3 0 0 0 40 40L28 20V5"/><path d="M12.5 33h23l4 8a1.6 1.6 0 0 1-1.5 2.3H10a1.6 1.6 0 0 1-1.5-2.3z" fill="' + A + '" stroke="none"/><circle cx="21" cy="29" r="1.6" fill="currentColor" stroke="none"/><circle cx="27" cy="25" r="1.2" fill="currentColor" stroke="none"/>',
    calculator:
      '<rect x="9" y="4" width="30" height="40" rx="5"/><rect x="14" y="9" width="20" height="8" rx="2" fill="' + A + '" stroke="none"/><circle cx="16.5" cy="24" r="1.8" fill="currentColor" stroke="none"/><circle cx="24" cy="24" r="1.8" fill="currentColor" stroke="none"/><circle cx="31.5" cy="24" r="1.8" fill="currentColor" stroke="none"/><circle cx="16.5" cy="31" r="1.8" fill="currentColor" stroke="none"/><circle cx="24" cy="31" r="1.8" fill="currentColor" stroke="none"/><circle cx="31.5" cy="31" r="1.8" fill="currentColor" stroke="none"/><circle cx="16.5" cy="38" r="1.8" fill="currentColor" stroke="none"/><circle cx="24" cy="38" r="1.8" fill="currentColor" stroke="none"/><circle cx="31.5" cy="38" r="1.8" fill="currentColor" stroke="none"/>',
    books:
      '<rect x="5" y="10" width="10" height="33" rx="2"/><rect x="17" y="5" width="10" height="38" rx="2" fill="' + A + '" stroke="none"/><rect x="17" y="5" width="10" height="38" rx="2"/><rect x="29.5" y="11" width="10" height="32" rx="2" transform="rotate(14 34 27)"/><path d="M5 43h38"/>',
    chart:
      '<path d="M6 42h36"/><rect x="9" y="26" width="7" height="16" rx="1.5"/><rect x="20.5" y="17" width="7" height="25" rx="1.5" fill="' + A + '" stroke="none"/><rect x="20.5" y="17" width="7" height="25" rx="1.5"/><rect x="32" y="8" width="7" height="34" rx="1.5"/>',
    palette:
      '<path d="M24 5C13 5 5 13 5 23c0 10 8 20 18 20 3.4 0 4.5-2 4.5-3.8 0-2.4-1.8-3-1.8-5.2 0-2.6 2.2-4.4 5-4.4h5.3c4.2 0 6-3 6-6.6C42 12 34 5 24 5z"/><circle cx="14" cy="24" r="2.5" fill="' + A + '" stroke="none"/><circle cx="19" cy="14.5" r="2.5" fill="currentColor" stroke="none"/><circle cx="30" cy="13.5" r="2.5" fill="' + A + '" stroke="none"/>',
    heartpulse:
      '<path d="M24 41S6 30 6 17.5C6 11.5 10.5 7.5 15.5 7.5c3.4 0 6.4 1.8 8.5 5 2.1-3.2 5.1-5 8.5-5 5 0 9.5 4 9.5 10C42 30 24 41 24 41z"/><path d="M9 24h8l3-6 5 12 3-6h10" stroke="' + A + '"/>',
    gear:
      '<circle cx="24" cy="24" r="8"/><circle cx="24" cy="24" r="3" fill="' + A + '" stroke="none"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2" stroke-width="4"/>',
    cap:
      '<path d="M24 8 4 18l20 10 20-10z" fill="' + A + '"/><path d="M12 23.5V33c0 3 5.4 6 12 6s12-3 12-6v-9.5"/><path d="M44 18v12"/>',
    plane:
      '<path d="M44 4 4 21l14 6 6 15z" fill="#fff" stroke="currentColor"/><path d="M44 4 18 27l1 12 5.6-7.4" /><path d="M18 27 44 4" />',
    check: '<path d="M10 25l9 9 19-21" stroke-width="5"/>',
    arrow: '<path d="M8 24h30M28 12l12 12-12 12"/>',
    phone:
      '<path d="M12 6h6l3 9-4 3a24 24 0 0 0 13 13l3-4 9 3v6a4 4 0 0 1-4 4C21 40 8 27 8 10a4 4 0 0 1 4-4z"/>',
    whatsapp:
      '<path d="M24 4a19.5 19.5 0 0 0-16.7 29.6L4.5 43.5l10.2-2.7A19.5 19.5 0 1 0 24 4z" fill="currentColor" stroke="none"/><path d="M17.5 14.5c-1.3 1.1-2 3.1.2 6.7 2.2 3.600 5.100 6.200 8.800 7.300 2.100.6 3.700-.4 4.300-2l-3-2.100-2 1.600c-2.300-1.100-4.200-3.100-5.100-5.300l1.600-2-2.100-3.600z" fill="var(--wa-glyph, #fff)" stroke="none"/>',
    mail: '<rect x="5" y="9" width="38" height="30" rx="4"/><path d="m6 12 18 14 18-14"/>',
    pin: '<path d="M24 44S9 30 9 19a15 15 0 0 1 30 0c0 11-15 25-15 25z"/><circle cx="24" cy="19" r="5" fill="' + A + '" stroke="none"/>',
    clock: '<circle cx="24" cy="24" r="19"/><path d="M24 12v13l8 5"/>',
    star: '<path d="m24 5 5.500 12 13 1.500-9.700 8.800 2.700 12.800L24 33l-11.500 7.100 2.700-12.800L5.500 18.500 18.500 17z" fill="' + A + '"/>',
    sparkle: '<path d="M24 5c1 9 5 13 14 14-9 1-13 5-14 14-1-9-5-13-14-14 9-1 13-5 14-14zM38 32c.4 3.500 2 5 5 5.500-3 .5-4.600 2-5 5.500-.4-3.500-2-5-5-5.500 3-.5 4.600-2 5-5.500z" fill="' + A + '"/>',
    users:
      '<circle cx="17" cy="16" r="6.500"/><path d="M4 40c0-7.500 5.500-12 13-12s13 4.500 13 12"/><circle cx="34" cy="14" r="5" fill="' + A + '" stroke="none"/><path d="M33 26.500c6 0 11 3.500 11 10" />',
    trophy:
      '<path d="M14 6h20v12a10 10 0 0 1-20 0z" fill="' + A + '"/><path d="M14 10H6c0 8 3 12 9 13M34 10h8c0 8-3 12-9 13M24 28v8M15 42h18M18 36h12"/>',
    bulb:
      '<path d="M24 4a14 14 0 0 0-8 25.500V34h16v-4.500A14 14 0 0 0 24 4z" fill="' + A + '"/><path d="M18 39h12M20 44h8"/>',
    shield:
      '<path d="M24 4 8 10v13c0 10 7 18 16 21 9-3 16-11 16-21V10z"/><path d="m16 24 6 6 11-12" stroke="' + A + '" stroke-width="4"/>',
    clipboard:
      '<rect x="9" y="8" width="30" height="36" rx="4"/><rect x="17" y="4" width="14" height="8" rx="3" fill="' + A + '"/><path d="M16 24h16M16 31h10"/>',
    pencil:
      '<path d="m8 40 3-10L33 8l7 7-22 22z"/><path d="m29 12 7 7M8 40l10-3" /><path d="m11 30 7 7" stroke="' + A + '"/>',
    laptop:
      '<rect x="9" y="9" width="30" height="21" rx="3"/><path d="M4 38h40l-3 4H7z" fill="' + A + '"/><path d="m21 17-4 3.500 4 3.500M27 17l4 3.500-4 3.500"/>',
    globe:
      '<circle cx="24" cy="24" r="19"/><path d="M5 24h38M24 5c-8 9-8 29 0 38M24 5c8 9 8 29 0 38"/>',
    menu: '<path d="M8 14h32M8 24h32M8 34h32" stroke-width="4"/>',
    close: '<path d="M12 12l24 24M36 12 12 36" stroke-width="4"/>',
    plus: '<path d="M24 10v28M10 24h28" stroke-width="4"/>',
    book:
      '<path d="M6 10c6-2 12-2 18 3v28c-6-5-12-5-18-3zM42 10c-6-2-12-2-18 3v28c6-5 12-5 18-3z"/><path d="M24 13v28" stroke="' + A + '"/>',
    logo:
      '<rect width="48" height="48" rx="13" fill="#0B1F4B" stroke="none"/><path d="M8 36 20 16l6 9 4-5 10 16z" fill="#fff" stroke="none"/><circle cx="34" cy="12" r="4.200" fill="#FFC93C" stroke="none"/>'
  };

  function svg(name, size, extra) {
    var body = I[name];
    if (!body) return '';
    // CSS variables are safest inside style="" (some browsers ignore var() in attributes)
    body = body.replace(/(fill|stroke)="(var\([^"]*\))"/g, 'style="$1:$2"');
    var s = size ? ' width="' + size + '" height="' + size + '"' : '';
    return '<svg class="ico ico-' + name + (extra ? ' ' + extra : '') + '" viewBox="0 0 48 48"' + s +
      ' fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  function render(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(function (el) {
      if (el.getAttribute('data-icon-done')) return;
      el.innerHTML = svg(el.getAttribute('data-icon'), el.getAttribute('data-size'));
      el.setAttribute('data-icon-done', '1');
    });
  }

  ZA.icon = svg;
  ZA.renderIcons = render;
  render();
})();
