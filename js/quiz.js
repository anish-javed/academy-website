/* Zenith Academy - "Find your path" quiz.
   5 questions -> scores for 4 streams -> recommended program + subjects + careers. */
(function () {
  'use strict';
  var box = document.getElementById('quiz');
  if (!box) return;

  // med = Pre-Medical, eng = Pre-Engineering, com = Commerce, art = Arts
  var QUESTIONS = [
    {
      q: 'Which of these sounds like the most fun?',
      opts: [
        { t: 'Building or fixing things and working out how machines work', i: 'gear', s: { eng: 3 } },
        { t: 'Learning how the human body works and helping people feel better', i: 'heartpulse', s: { med: 3 } },
        { t: 'Running a small shop or managing money cleverly', i: 'chart', s: { com: 3 } },
        { t: 'Writing, drawing, debating or telling stories', i: 'palette', s: { art: 3 } }
      ]
    },
    {
      q: 'Which school subject do you enjoy the most?',
      opts: [
        { t: 'Maths and Physics', i: 'calculator', s: { eng: 3, com: 1 } },
        { t: 'Biology and Chemistry', i: 'beaker', s: { med: 3, eng: 1 } },
        { t: 'Economics, Accounts or Business', i: 'chart', s: { com: 3 } },
        { t: 'Languages, History or Social Studies', i: 'books', s: { art: 3 } }
      ]
    },
    {
      q: 'When you face a problem, what do you do first?',
      opts: [
        { t: 'Break it into steps and work it out with numbers', i: 'calculator', s: { eng: 2, com: 1 } },
        { t: 'Observe carefully and ask "why is this happening?"', i: 'atom', s: { med: 2, eng: 1 } },
        { t: 'Look for the smartest plan or best deal', i: 'bulb', s: { com: 2 } },
        { t: 'Think about the people involved and a creative solution', i: 'users', s: { art: 2, med: 1 } }
      ]
    },
    {
      q: 'Which future role would make you proud?',
      opts: [
        { t: 'Engineer, software developer or architect', i: 'laptop', s: { eng: 3 } },
        { t: 'Doctor, pharmacist or lab scientist', i: 'heartpulse', s: { med: 3 } },
        { t: 'Accountant, banker or business owner', i: 'trophy', s: { com: 3 } },
        { t: 'Teacher, lawyer, journalist or designer', i: 'pencil', s: { art: 3 } }
      ]
    },
    {
      q: 'What does your free weekend look like?',
      opts: [
        { t: 'Tinkering with phones, computers or gadgets', i: 'laptop', s: { eng: 2 } },
        { t: 'Watching science or health videos, helping family', i: 'atom', s: { med: 2 } },
        { t: 'Selling things, saving money, planning a budget', i: 'chart', s: { com: 2 } },
        { t: 'Reading, sketching, writing or joining a cause', i: 'book', s: { art: 2 } }
      ]
    }
  ];

  var RESULTS = {
    med: {
      slug: 'pre-medical', name: 'FSc Pre-Medical', icon: 'heartpulse',
      why: 'You are curious about life and care about people. Pre-Medical builds the science base for MBBS, BDS, pharmacy and more.',
      subjects: ['Biology', 'Chemistry', 'Physics', 'English', 'Urdu', 'Islamiyat', 'Pakistan Studies'],
      careers: ['Doctor (MBBS)', 'Dentist (BDS)', 'Pharmacist (Pharm-D)', 'Lab scientist', 'Physiotherapist', 'Nurse or public-health officer']
    },
    eng: {
      slug: 'pre-engineering', name: 'FSc Pre-Engineering', icon: 'gear',
      why: 'You like numbers, logic and how things work. Pre-Engineering is the path to engineering and technology degrees.',
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Urdu', 'Islamiyat', 'Pakistan Studies'],
      careers: ['Civil, electrical or mechanical engineer', 'Software developer', 'Architect', 'Data scientist', 'Pilot or aviation engineer', 'Research scientist']
    },
    com: {
      slug: 'commerce', name: 'I.Com (Commerce)', icon: 'chart',
      why: 'You think about money, planning and deals. Commerce opens the door to business, accounting and finance.',
      subjects: ['Principles of Accounting', 'Economics', 'Business Mathematics', 'Principles of Commerce', 'Business Statistics', 'English', 'Urdu'],
      careers: ['Chartered accountant (CA/ACCA)', 'Banker', 'Entrepreneur', 'Marketing manager', 'Tax or finance officer', 'Business analyst']
    },
    art: {
      slug: 'arts', name: 'FA (Arts)', icon: 'palette',
      why: 'You are creative, expressive and care about people and ideas. FA lets you choose subjects you love.',
      subjects: ['English', 'Urdu', 'Islamiyat', 'Pakistan Studies', 'Psychology', 'Civics', 'Economics', 'Fine Arts (your choice of electives)'],
      careers: ['Lawyer (LLB)', 'Teacher or professor', 'Journalist or writer', 'Psychologist', 'Graphic or fashion designer', 'Civil services (CSS)']
    }
  };
  var ORDER = ['med', 'eng', 'com', 'art'];

  var step = 0;          // 0 = intro, 1..5 = questions, 6 = result
  var answers = [];      // index of picked option per question

  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function swap(node) {
    box.innerHTML = '';
    box.appendChild(node);
    if (ZA.renderIcons) ZA.renderIcons(box);
    if (window.ZA && !ZA.reduce && box.getBoundingClientRect().bottom > window.innerHeight) {
      box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function intro() {
    step = 0; answers = [];
    var n = el(
      '<div class="quiz-intro quiz-step">' +
      '<span class="big-ico" data-icon="sparkle" data-size="64"></span>' +
      '<h3 class="quiz-q">Which program is right for you?</h3>' +
      '<p class="lead" style="color:var(--muted)">There are no wrong answers. Pick what sounds most like you.</p>' +
      '<button class="btn btn-primary" type="button" id="quizStart">Start the quiz <span data-icon="arrow"></span></button>' +
      '</div>');
    swap(n);
    n.querySelector('#quizStart').addEventListener('click', function () { show(1); });
  }

  function show(n) {
    step = n;
    var q = QUESTIONS[n - 1];
    var node = el(
      '<div class="quiz-step">' +
      '<div class="quiz-top"><span>Question ' + n + ' of ' + QUESTIONS.length + '</span><span>' + Math.round(((n - 1) / QUESTIONS.length) * 100) + '% done</span></div>' +
      '<div class="quiz-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + QUESTIONS.length + '" aria-valuenow="' + (n - 1) + '"><i style="width:' + ((n - 1) / QUESTIONS.length) * 100 + '%"></i></div>' +
      '<h3 class="quiz-q" tabindex="-1">' + esc(q.q) + '</h3>' +
      '<div class="quiz-opts">' +
      q.opts.map(function (o, i) {
        return '<button type="button" class="opt' + (answers[n - 1] === i ? ' picked' : '') + '" data-i="' + i + '">' +
          '<span class="em" data-icon="' + o.i + '"></span><span>' + esc(o.t) + '</span></button>';
      }).join('') +
      '</div>' +
      '<div class="quiz-nav"><button type="button" class="link-btn" id="quizBack">' + (n === 1 ? '&larr; Back to start' : '&larr; Previous question') + '</button><span class="hint">Tap an answer to continue</span></div>' +
      '</div>');
    swap(node);
    // grow the progress bar after render so it animates
    var bar = node.querySelector('.quiz-bar i');
    requestAnimationFrame(function () { requestAnimationFrame(function () { bar.style.width = (n / QUESTIONS.length) * 100 + '%'; }); });

    node.querySelectorAll('.opt').forEach(function (b) {
      b.addEventListener('click', function () {
        answers[n - 1] = Number(b.getAttribute('data-i'));
        node.querySelectorAll('.opt').forEach(function (x) { x.classList.remove('picked'); });
        b.classList.add('picked');
        setTimeout(function () { n < QUESTIONS.length ? show(n + 1) : result(); }, ZA.reduce ? 0 : 260);
      });
    });
    node.querySelector('#quizBack').addEventListener('click', function () { n === 1 ? intro() : show(n - 1); });
  }

  function result() {
    step = 6;
    var score = { med: 0, eng: 0, com: 0, art: 0 };
    answers.forEach(function (a, qi) {
      var s = QUESTIONS[qi].opts[a].s;
      for (var k in s) score[k] += s[k];
      // tiny tie-breaker: the "future role" answer counts a little extra
      if (qi === 3) for (var k2 in s) score[k2] += 0.1;
    });
    var ranked = ORDER.slice().sort(function (a, b) { return score[b] - score[a]; });
    var top = RESULTS[ranked[0]], second = RESULTS[ranked[1]];

    var node = el(
      '<div class="quiz-step result">' +
      '<div class="result-head"><span class="big-ico" data-icon="' + top.icon + '" data-size="46"></span>' +
      '<div><small>Your best match</small><h3>' + esc(top.name) + '</h3></div></div>' +
      '<p>' + esc(top.why) + '</p>' +
      '<h4>Subjects you will study</h4>' +
      '<ul class="chips">' + top.subjects.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
      '<h4>Careers it can lead to</h4>' +
      '<ul class="chips warm">' + top.careers.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
      '<div class="second">Also a good fit: <strong>' + esc(second.name) + '</strong>. ' +
      '<button type="button" class="link-btn" id="quizSecond">Show this one instead</button></div>' +
      '<p class="hint" style="margin-top:12px">Studying in 9th or 10th? Choose Matric Science or Arts now. You can pick this stream in 11th.</p>' +
      '<div class="result-actions">' +
      '<a class="btn btn-primary" id="quizApply" href="admission.html?program=' + top.slug + '">Apply for this <span data-icon="arrow"></span></a>' +
      '<a class="btn btn-outline" href="programs.html#' + (top.slug === 'commerce' ? 'icom' : top.slug === 'arts' ? 'fa' : top.slug) + '">See timings</a>' +
      '<button type="button" class="link-btn" id="quizRetake">Retake the quiz</button>' +
      '</div></div>');
    swap(node);
    node.querySelector('#quizRetake').addEventListener('click', intro);
    node.querySelector('#quizSecond').addEventListener('click', function () { showResult(second, top); });
    if (ZA.animate && window.gsap) {
      gsap.from(node.querySelectorAll('.chips li'), { opacity: 0, y: 10, scale: 0.9, duration: 0.35, stagger: 0.04, ease: 'back.out(2)' });
    }
  }

  // show a chosen result (used by "Show this one instead")
  function showResult(r, other) {
    var node = el(
      '<div class="quiz-step result">' +
      '<div class="result-head"><span class="big-ico" data-icon="' + r.icon + '" data-size="46"></span>' +
      '<div><small>Another good fit</small><h3>' + esc(r.name) + '</h3></div></div>' +
      '<p>' + esc(r.why) + '</p>' +
      '<h4>Subjects you will study</h4>' +
      '<ul class="chips">' + r.subjects.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
      '<h4>Careers it can lead to</h4>' +
      '<ul class="chips warm">' + r.careers.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
      '<div class="result-actions">' +
      '<a class="btn btn-primary" href="admission.html?program=' + r.slug + '">Apply for this <span data-icon="arrow"></span></a>' +
      '<button type="button" class="link-btn" id="quizBackResult">&larr; Back to my best match</button>' +
      '<button type="button" class="link-btn" id="quizRetake">Retake the quiz</button>' +
      '</div></div>');
    swap(node);
    node.querySelector('#quizRetake').addEventListener('click', intro);
    node.querySelector('#quizBackResult').addEventListener('click', result);
  }

  intro();
})();
