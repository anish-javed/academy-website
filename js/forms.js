/* Zenith Academy - Admission form (4 steps) and Enquiry form.
   - friendly validation messages
   - admission answers are saved in the browser (localStorage) until the form is sent
   - honeypot field catches spam robots
   - data is sent to Google Sheets through the Apps Script web app (SHEET_URL in js/config.js)
   - paper plane flies away, then a thank-you message appears */
(function () {
  'use strict';

  var PHONE_TEXT = '0300 0000000';
  var reduce = function () { return !!(window.ZA && ZA.reduce); };

  /* =====================================================================
     Small helpers
     ===================================================================== */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function wrapperOf(name) { return $('[data-field="' + name + '"]'); }
  function controlsOf(form, name) { return $$('[name="' + name + '"]', form); }

  function getValue(form, name) {
    var c = controlsOf(form, name);
    if (!c.length) return '';
    if (c[0].type === 'radio') {
      var on = c.filter(function (r) { return r.checked; })[0];
      return on ? on.value : '';
    }
    if (c[0].type === 'checkbox') return c[0].checked ? 'Yes' : '';
    return String(c[0].value).trim();
  }

  function setValue(form, name, value) {
    var c = controlsOf(form, name);
    if (!c.length) return;
    if (c[0].type === 'radio') c.forEach(function (r) { r.checked = (r.value === value); });
    else if (c[0].type === 'checkbox') c[0].checked = (value === 'Yes' || value === true);
    else c[0].value = value;
  }

  function showError(name, msg) {
    var w = wrapperOf(name);
    if (!w) return;
    var err = $('.err', w);
    w.classList.toggle('has-error', !!msg);
    if (err) err.textContent = msg || '';
    $$('input, select, textarea', w).forEach(function (c) {
      if (msg) c.setAttribute('aria-invalid', 'true'); else c.removeAttribute('aria-invalid');
    });
  }

  function focusField(form, name) {
    var c = controlsOf(form, name)[0];
    if (c) c.focus();
    var w = wrapperOf(name);
    if (w && !reduce()) {
      w.classList.remove('shake');
      void w.offsetWidth;
      w.classList.add('shake');
      setTimeout(function () { w.classList.remove('shake'); }, 450);
    }
  }

  /* ---------- Phone: accepts 03XX-XXXXXXX, 03XXXXXXXXX, +923XXXXXXXXX ---------- */
  function formatPhone(raw) {
    var d = String(raw).replace(/[\s\-().]/g, '');
    if (d.indexOf('+92') === 0) d = '0' + d.slice(3);
    else if (d.indexOf('0092') === 0) d = '0' + d.slice(4);
    else if (/^92\d{10}$/.test(d)) d = '0' + d.slice(2);
    if (/^03\d{9}$/.test(d)) return d.slice(0, 4) + '-' + d.slice(4);
    return String(raw).trim();
  }

  /* =====================================================================
     Validators (each returns '' when OK, or a friendly message)
     ===================================================================== */
  var NAME_RE = /^[\p{L}][\p{L}\p{M}\s.'’-]*$/u;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function nameCheck(v, who) {
    if (!v) return 'Please tell us ' + who + '.';
    if (v.length < 3) return 'That name looks a bit short. Please write the full name.';
    if (!NAME_RE.test(v)) return 'Please use letters only (no numbers or symbols).';
    return '';
  }
  function phoneCheck(v) {
    if (!v) return 'Please enter a phone number we can call, like 0300-1234567.';
    if (!/^03\d{2}-\d{7}$/.test(formatPhone(v))) return 'That does not look like a Pakistani mobile number. Please use the format 03XX-XXXXXXX, for example 0300-1234567.';
    return '';
  }
  function emailCheck(v) {
    if (v && !EMAIL_RE.test(v)) return 'That email does not look right. It should look like name@example.com. Or you can leave it empty.';
    return '';
  }

  var VALIDATORS = {
    // ---- admission ----
    studentName: function (v) { return nameCheck(v, "the student's name"); },
    guardianName: function (v) { return nameCheck(v, "your father's or guardian's name"); },
    dob: function (v) {
      if (!v) return 'Please choose the date of birth.';
      var d = new Date(v + 'T00:00:00');
      if (isNaN(d.getTime())) return 'Please choose a real date.';
      var now = new Date();
      if (d > now) return 'That date is in the future. Please check it.';
      var age = now.getFullYear() - d.getFullYear();
      var m = now.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
      if (age < 11 || age > 25) return 'Please check the date. Our students are usually between 11 and 25 years old.';
      return '';
    },
    classApplying: function (v) { return v ? '' : 'Please choose the class you are applying for.'; },
    program: function (v) { return v ? '' : 'Please choose a program. Pick your class first if the list is empty.'; },
    previousSchool: function (v) {
      if (!v) return 'Please write the name of the previous school.';
      if (v.length < 2) return 'That school name looks too short.';
      return '';
    },
    lastPercentage: function (v, form) {
      var c = controlsOf(form, 'lastPercentage')[0];
      if (c && c.validity && c.validity.badInput) return 'Please type numbers only, for example 78.5.';
      if (v === '') return 'Please enter the percentage from the last exam.';
      var n = Number(v);
      if (isNaN(n) || n < 0 || n > 100) return 'The percentage must be between 0 and 100.';
      return '';
    },
    shift: function (v) { return v ? '' : 'Please pick morning or evening.'; },
    phone: phoneCheck,
    email: emailCheck,
    area: function (v) { return v ? '' : 'Please choose your area of Lahore.'; },
    heardAbout: function (v) { return v ? '' : 'Please tell us how you heard about us.'; },
    consent: function (v) { return v ? '' : 'Please tick the box so that we are allowed to contact you.'; },

    // ---- enquiry ----
    name: function (v) { return nameCheck(v, 'your name'); },
    iam: function (v) { return v ? '' : 'Please tell us if you are a student or a parent.'; },
    topic: function (v) { return v ? '' : 'Please choose a topic.'; },
    message: function (v) {
      if (!v) return 'Please write your question or message.';
      if (v.length < 10) return 'Please write a little more (at least 10 letters) so we can help you.';
      return '';
    }
  };

  function validate(form, name, show) {
    var msg = VALIDATORS[name](getValue(form, name), form);
    if (show !== false) showError(name, msg);
    return !msg;
  }

  function validateMany(form, names) {
    var first = null;
    names.forEach(function (n) { if (!validate(form, n, true) && !first) first = n; });
    return first;
  }

  /* wire up friendly live checks for a list of fields */
  function wireLiveValidation(form, names) {
    form.addEventListener('focusout', function (e) {
      var n = e.target && e.target.name;
      if (names.indexOf(n) === -1) return;
      if (n === 'phone' && e.target.value.trim()) e.target.value = formatPhone(e.target.value);
      // do not nag about empty boxes just because someone tabbed through them
      if (getValue(form, n) !== '' || wrapperOf(n).classList.contains('has-error')) validate(form, n, true);
    });
    var recheck = function (e) {
      var n = e.target && e.target.name;
      if (names.indexOf(n) === -1) return;
      var w = wrapperOf(n);
      if (w && w.classList.contains('has-error')) validate(form, n, true);
    };
    form.addEventListener('input', recheck);
    form.addEventListener('change', recheck);
  }

  /* =====================================================================
     Sending to Google Sheets
     ===================================================================== */
  function isConnected() {
    return typeof SHEET_URL === 'string' &&
      /^https:\/\/script\.google\.com\/(a\/[^/]+\/)?macros\/s\/[^/]+\/exec/.test(SHEET_URL.trim());
  }

  function fail(code, message) { var e = new Error(message || code); e.code = code; return e; }

  function sendToSheet(formType, data) {
    if (!isConnected()) return Promise.reject(fail('NOT_CONNECTED'));
    var fd = new FormData();
    fd.append('formType', formType);
    Object.keys(data).forEach(function (k) { fd.append(k, data[k]); });

    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 25000);
    return fetch(SHEET_URL.trim(), { method: 'POST', body: fd, signal: ctrl ? ctrl.signal : undefined })
      .then(function (res) {
        clearTimeout(timer);
        if (!res.ok) throw fail('HTTP', 'HTTP ' + res.status);
        return res.json();
      })
      .then(function (json) {
        if (!json || json.result !== 'success') throw fail('SERVER', json && json.message);
        return json;
      })
      .catch(function (err) {
        clearTimeout(timer);
        if (err && err.code) throw err;
        throw fail('NETWORK', err && err.message);
      });
  }

  function showAlert(err) {
    var a = $('#formAlert');
    if (!a) return;
    a.textContent = '';
    var strong = document.createElement('span');
    var small = document.createElement('small');
    if (err && err.code === 'NOT_CONNECTED') {
      strong.textContent = 'The form is not connected yet.';
      small.textContent = 'The website owner still needs to finish the Google Sheet setup. For now, please call us on ' + PHONE_TEXT + '.';
    } else {
      strong.textContent = 'Sorry, we could not send your form.';
      small.textContent = 'Please check your internet and try again. Your answers are still here. You can also call us on ' + PHONE_TEXT + '.';
      if (window.console) console.warn('Form send failed:', err);
    }
    a.appendChild(strong);
    a.appendChild(small);
    a.hidden = false;
    a.scrollIntoView({ block: 'center', behavior: reduce() ? 'auto' : 'smooth' });
  }
  function hideAlert() { var a = $('#formAlert'); if (a) a.hidden = true; }

  function setBusy(btn, busy) {
    if (!btn) return;
    if (busy) {
      btn.setAttribute('data-label', btn.innerHTML);
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Sending...';
    } else {
      btn.disabled = false;
      if (btn.hasAttribute('data-label')) btn.innerHTML = btn.getAttribute('data-label');
      if (window.ZA && ZA.renderIcons) { btn.querySelectorAll('[data-icon]').forEach(function (n) { n.removeAttribute('data-icon-done'); }); ZA.renderIcons(btn); }
    }
  }

  /* shared: honeypot check -> send -> success or friendly error */
  function submitFlow(cfg) {
    hideAlert();
    setBusy(cfg.button, true);
    var hp = cfg.form.querySelector('[name="company_website"]');
    if (hp && hp.value) {
      // a robot filled the hidden field: pretend everything worked, send nothing
      setTimeout(function () { setBusy(cfg.button, false); cfg.onSuccess(); }, 700);
      return;
    }
    sendToSheet(cfg.type, cfg.data).then(function () {
      setBusy(cfg.button, false);
      cfg.onSuccess();
    }).catch(function (err) {
      setBusy(cfg.button, false);
      showAlert(err);
    });
  }

  /* =====================================================================
     Paper plane flies away, then thank-you message
     ===================================================================== */
  function celebrate(title, text) {
    var card = $('#formCard'), body = $('#formBody'), stage = $('#planeStage'),
        plane = $('#plane'), panel = $('#successPanel');
    $('#successTitle').textContent = title;
    $('#successText').textContent = text;
    body.hidden = true;
    if (card.getBoundingClientRect().top < 0) card.scrollIntoView({ block: 'start', behavior: reduce() ? 'auto' : 'smooth' });

    var showThanks = function () {
      stage.hidden = true;
      panel.hidden = false;
      panel.focus({ preventScroll: true });
      if (window.gsap && !reduce()) {
        gsap.from('.success-badge', { scale: 0, rotation: -40, duration: 0.6, ease: 'back.out(2.2)' });
        gsap.from('#successPanel h2, #successPanel p, #successPanel .actions', { opacity: 0, y: 14, duration: 0.5, stagger: 0.12, delay: 0.2, ease: 'power2.out', clearProps: 'all' });
      }
    };

    if (!window.gsap || reduce()) { showThanks(); return; }

    stage.hidden = false;
    var w = stage.clientWidth, h = stage.clientHeight;
    gsap.set(plane, { x: 0, y: 0, rotation: -8, opacity: 0, scale: 0.5, transformOrigin: '50% 50%' });
    var tl = gsap.timeline({ onComplete: showThanks });
    if (ZA.isMobile && ZA.isMobile()) tl.timeScale(1.3);
    tl.fromTo('#trailPath', { opacity: 0 }, { opacity: 0.5, duration: 0.9 }, 0.2)
      .to(plane, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, 0)
      .to(plane, {
        keyframes: [
          { x: w * 0.28, y: -h * 0.28, rotation: -20, duration: 0.55 },
          { x: w * 0.58, y: -h * 0.04, rotation: -2, duration: 0.5 },
          { x: w * 1.15, y: -h * 0.9, rotation: -34, opacity: 0, duration: 0.6 }
        ],
        ease: 'power1.inOut'
      }, 0.45);
  }

  /* =====================================================================
     ENQUIRY FORM
     ===================================================================== */
  function initEnquiry() {
    var form = $('#enquiryForm');
    if (!form) return;
    var FIELDS = ['name', 'iam', 'phone', 'email', 'topic', 'message'];
    var msg = $('#message'), counter = $('#message-count');

    // prefill from the Programs page ("Ask about fees")
    var qs = new URLSearchParams(location.search);
    var topic = qs.get('topic'), program = qs.get('program');
    if (topic && $$('#topic option').some(function (o) { return o.value === topic || o.textContent === topic; })) setValue(form, 'topic', topic);
    if (program && !msg.value) {
      var p = program.slice(0, 60);
      msg.value = (topic === 'Fees' ? 'Hello, I would like to know about the fees for ' : 'Hello, I have a question about ') + p + '.';
    }
    var count = function () { counter.textContent = msg.value.length + ' / ' + (msg.maxLength || 600); };
    msg.addEventListener('input', count);
    count();

    wireLiveValidation(form, FIELDS);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = validateMany(form, FIELDS);
      if (bad) { focusField(form, bad); return; }
      var data = {
        name: getValue(form, 'name'),
        iam: getValue(form, 'iam'),
        phone: formatPhone(getValue(form, 'phone')),
        email: getValue(form, 'email'),
        topic: getValue(form, 'topic'),
        message: getValue(form, 'message')
      };
      submitFlow({
        form: form, type: 'enquiry', data: data, button: $('#submitBtn'),
        onSuccess: function () {
          var first = data.name.split(/\s+/)[0];
          celebrate('Thank you, ' + first + '!',
            'We have received your message about ' + data.topic.toLowerCase() + '. Our team will contact you on ' + data.phone + ' soon.');
        }
      });
    });

    var again = $('#sendAnother');
    if (again) again.addEventListener('click', function () {
      form.reset();
      FIELDS.forEach(function (n) { showError(n, ''); });
      count();
      $('#successPanel').hidden = true;
      $('#formBody').hidden = false;
      $('#name').focus();
    });
  }

  /* =====================================================================
     ADMISSION FORM
     ===================================================================== */
  function initAdmission() {
    var form = $('#admissionForm');
    if (!form) return;

    var STORE_KEY = 'zenith-admission-v1';
    var FIELDS = ['studentName', 'guardianName', 'dob', 'classApplying', 'program', 'previousSchool',
                  'lastPercentage', 'shift', 'phone', 'email', 'area', 'heardAbout', 'consent'];
    var STEP_FIELDS = {
      1: ['studentName', 'guardianName', 'dob'],
      2: ['classApplying', 'program', 'previousSchool', 'lastPercentage', 'shift'],
      3: ['phone', 'email', 'area', 'heardAbout'],
      4: ['consent']
    };
    var TOTAL = 4;
    var panels = $$('fieldset.step', form);
    var backBtn = $('#backBtn'), nextBtn = $('#nextBtn'), submitBtn = $('#submitBtn');
    var fill = $('#progressFill'), bar = $('.progress-bar'), stepLis = $$('#stepsList li');
    var programSel = $('#program'), programHint = $('#program-hint');
    var DEFAULT_HINT = programHint.textContent;
    var step = 1, finished = false, saveTimer = null;
    var wanted = null;   // program slug from the quiz / Programs page, e.g. "pre-medical"

    /* ---------- program list depends on the class ---------- */
    var MATRIC = ['Science', 'Arts'];
    var INTER = ['FSc Pre-Engineering', 'FSc Pre-Medical', 'FA (Arts)', 'I.Com (Commerce)'];
    var SLUG_NAMES = { 'science': 'Science', 'arts': 'Arts', 'pre-engineering': 'Pre-Engineering', 'pre-medical': 'Pre-Medical', 'commerce': 'Commerce' };

    function isMatric(c) { return c === '9th' || c === '10th'; }
    function programsFor(c) { return isMatric(c) ? MATRIC : (c ? INTER : []); }

    function fromSlug(slug, c) {
      var m = isMatric(c);
      switch (slug) {
        case 'science': return m ? 'Science' : '';
        case 'pre-engineering': return m ? 'Science' : 'FSc Pre-Engineering';
        case 'pre-medical': return m ? 'Science' : 'FSc Pre-Medical';
        case 'arts': return m ? 'Arts' : 'FA (Arts)';
        case 'commerce': return m ? '' : 'I.Com (Commerce)';
      }
      return '';
    }

    function rebuildPrograms(applyWanted) {
      var c = getValue(form, 'classApplying');
      var current = programSel.value;
      var list = programsFor(c);
      programSel.innerHTML = '';
      var first = document.createElement('option');
      first.value = '';
      first.textContent = c ? 'Choose a program' : 'Choose your class first';
      programSel.appendChild(first);
      list.forEach(function (p) { var o = document.createElement('option'); o.value = p; o.textContent = p; programSel.appendChild(o); });
      programSel.disabled = !c;
      if (list.indexOf(current) !== -1) programSel.value = current;

      programHint.textContent = DEFAULT_HINT;
      if (wanted && (applyWanted || !programSel.value)) {
        var nice = SLUG_NAMES[wanted] || wanted;
        if (!c) {
          programHint.textContent = 'You picked ' + nice + '. Choose your class and we will select it for you.';
        } else {
          var p = fromSlug(wanted, c);
          if (p) { programSel.value = p; programHint.textContent = 'We selected ' + p + ' from your choice. You can change it.'; }
          else programHint.textContent = (wanted === 'commerce')
            ? 'Commerce starts in 11th class. For 9th and 10th please choose Science or Arts.'
            : 'Please choose one of the programs for this class.';
        }
      }
    }

    /* ---------- saving progress in the browser ---------- */
    function snapshot() {
      var o = { step: step, data: {} };
      FIELDS.forEach(function (n) { o.data[n] = getValue(form, n); });
      return o;
    }
    function save() {
      if (finished) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        if (finished) return;
        try { localStorage.setItem(STORE_KEY, JSON.stringify(snapshot())); } catch (e) { /* private mode: ignore */ }
      }, 250);
    }
    function clearSaved() {
      finished = true;
      clearTimeout(saveTimer);
      try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
    }
    function load() {
      try { return JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { return null; }
    }
    form.addEventListener('input', save);
    form.addEventListener('change', save);

    /* ---------- steps ---------- */
    function go(n, focus) {
      step = Math.max(1, Math.min(TOTAL, n));
      panels.forEach(function (p) { p.hidden = Number(p.getAttribute('data-step')) !== step; });
      fill.style.width = (step / TOTAL * 100) + '%';
      bar.setAttribute('aria-valuenow', step);
      stepLis.forEach(function (li, i) {
        li.classList.toggle('current', i + 1 === step);
        li.classList.toggle('done', i + 1 < step);
        li.querySelector('b').textContent = (i + 1 < step) ? '✓' : String(i + 1);
      });
      backBtn.hidden = step === 1;
      nextBtn.hidden = step === TOTAL;
      submitBtn.hidden = step !== TOTAL;
      if (step === TOTAL) buildReview();
      hideAlert();
      if (focus) {
        var title = $('fieldset.step:not([hidden]) .step-title', form);
        if (title) title.focus({ preventScroll: true });
        var card = $('#formCard');
        if (card.getBoundingClientRect().top < 60) card.scrollIntoView({ block: 'start', behavior: reduce() ? 'auto' : 'smooth' });
      }
      save();
    }

    function next() {
      var bad = validateMany(form, STEP_FIELDS[step]);
      if (bad) { focusField(form, bad); return; }
      go(step + 1, true);
    }

    nextBtn.addEventListener('click', next);
    backBtn.addEventListener('click', function () { go(step - 1, true); });

    // Enter key moves forward instead of sending too early
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'checkbox') {
        e.preventDefault();
        if (step < TOTAL) next();
      }
    });

    /* ---------- review ---------- */
    function nice(v, fallback) { return v ? v : (fallback || '-'); }
    function dobText(v) {
      if (!v) return '-';
      var d = new Date(v + 'T00:00:00');
      return isNaN(d.getTime()) ? v : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    function buildReview() {
      var box = $('#review');
      box.textContent = '';
      var g = function (n) { return getValue(form, n); };
      var groups = [
        { title: 'Student', step: 1, rows: [['Name', g('studentName')], ['Father / guardian', g('guardianName')], ['Date of birth', dobText(g('dob'))]] },
        { title: 'Education', step: 2, rows: [['Class', g('classApplying')], ['Program', g('program')], ['Previous school', g('previousSchool')], ['Last exam', g('lastPercentage') ? g('lastPercentage') + '%' : '-'], ['Shift', g('shift')]] },
        { title: 'Contact', step: 3, rows: [['Phone', formatPhone(g('phone'))], ['Email', nice(g('email'), 'Not given')], ['Area', g('area')], ['Heard about us', g('heardAbout')]] }
      ];
      groups.forEach(function (grp) {
        var sec = document.createElement('section');
        sec.className = 'review-group';
        var head = document.createElement('header');
        var h = document.createElement('h3'); h.textContent = grp.title;
        var edit = document.createElement('button');
        edit.type = 'button'; edit.className = 'link-btn'; edit.textContent = 'Edit';
        edit.setAttribute('aria-label', 'Edit ' + grp.title.toLowerCase() + ' details');
        edit.addEventListener('click', function () { go(grp.step, true); });
        head.appendChild(h); head.appendChild(edit);
        var dl = document.createElement('dl');
        grp.rows.forEach(function (r) {
          var dt = document.createElement('dt'); dt.textContent = r[0];
          var dd = document.createElement('dd'); dd.textContent = nice(r[1]);
          dl.appendChild(dt); dl.appendChild(dd);
        });
        sec.appendChild(head); sec.appendChild(dl);
        box.appendChild(sec);
      });
    }

    /* ---------- live behaviour ---------- */
    wireLiveValidation(form, FIELDS);
    controlsOf(form, 'classApplying').forEach(function (r) {
      r.addEventListener('change', function () { rebuildPrograms(false); showError('program', ''); });
    });

    /* ---------- start up: restore saved answers, then URL choices ---------- */
    var saved = load();
    var restored = false;
    if (saved && saved.data) {
      FIELDS.forEach(function (n) { if (n !== 'program' && saved.data[n]) setValue(form, n, saved.data[n]); });
      rebuildPrograms(false);
      if (saved.data.program && programsFor(saved.data.classApplying).indexOf(saved.data.program) !== -1) programSel.value = saved.data.program;
      restored = FIELDS.some(function (n) { return n !== 'consent' && saved.data[n]; });
    } else {
      rebuildPrograms(false);
    }

    var qs = new URLSearchParams(location.search);
    var qProgram = qs.get('program'), qClass = qs.get('class');
    if (qClass && ['9th', '10th', '11th', '12th'].indexOf(qClass) !== -1) setValue(form, 'classApplying', qClass);
    if (qProgram && SLUG_NAMES[qProgram]) {
      wanted = qProgram;
      rebuildPrograms(true);
      var wn = $('#wantedNote');
      if (wn) {
        wn.firstElementChild.textContent = 'Great choice! You picked ' + SLUG_NAMES[qProgram] + '. We will select it for you once you choose your class.';
        wn.hidden = false;
      }
    } else rebuildPrograms(false);

    var startStep = (restored && saved && saved.step) ? Number(saved.step) : 1;
    if (qProgram && SLUG_NAMES[qProgram]) startStep = 2;   // coming from the quiz: jump to the Education step only if step 1 is done
    if (startStep >= 2 && validateMany(form, STEP_FIELDS[1]) !== null) { startStep = 1; STEP_FIELDS[1].forEach(function (n) { showError(n, ''); }); }
    go(startStep, false);

    if (restored) {
      var note = $('#restoredNote');
      note.hidden = false;
      $('#startOver').addEventListener('click', function () {
        try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
        form.reset();
        wanted = null;
        FIELDS.forEach(function (n) { showError(n, ''); });
        rebuildPrograms(false);
        note.hidden = true;
        go(1, true);
      });
    }

    /* ---------- send ---------- */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (step < TOTAL) { next(); return; }
      // check every step once more before sending
      for (var s = 1; s <= TOTAL; s++) {
        var bad = validateMany(form, STEP_FIELDS[s]);
        if (bad) { go(s, true); focusField(form, bad); return; }
      }
      var data = {};
      FIELDS.forEach(function (n) { data[n] = getValue(form, n); });
      data.phone = formatPhone(data.phone);
      data.consent = 'Yes';

      submitFlow({
        form: form, type: 'admission', data: data, button: submitBtn,
        onSuccess: function () {
          clearSaved();
          var first = data.studentName.split(/\s+/)[0];
          celebrate('Thank you, ' + first + '!',
            'We have received the admission form for ' + data.classApplying + ' class (' + data.program + '). Our team will call you on ' + data.phone + ' within 1 to 2 working days.');
          form.reset();
        }
      });
    });
  }

  initEnquiry();
  initAdmission();
})();
