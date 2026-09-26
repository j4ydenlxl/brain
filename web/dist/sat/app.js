/* app.js — Bluebook-style shell: modes, timer, tools, navigation, scoring, explanations. */
(function () {
  'use strict';
  var S = window.SAT;
  var $ = function (id) { return document.getElementById(id); };
  var body = document.body;

  /* ---------------------------------- state ---------------------------------- */
  var st = {
    mode: 'fire',           // 'fire' | 'test'
    qs: [], i: 0,
    ans: [], marked: [], crossed: [], shown: [],
    limit: 0, left: 0, tick: null, hidden: false,
    modules: 1, modIdx: 0, perMod: 0,
    filter: { domains: [], diffs: [] },
    abc: false, split: false
  };

  function save(k, v) { try { localStorage.setItem('sat.' + k, JSON.stringify(v)); } catch (e) {} }
  function load(k, d) { try { var v = localStorage.getItem('sat.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }

  /* ---------------------------------- math rendering ---------------------------------- */
  function tex(el) {
    if (!window.renderMathInElement) return;
    try {
      window.renderMathInElement(el, {
        delimiters: [{ left: '$', right: '$', display: false }],
        throwOnError: false, ignoredTags: ['script', 'noscript', 'style', 'textarea', 'option']
      });
    } catch (e) {}
  }

  /* ---------------------------------- home ---------------------------------- */
  var DOMS = S.DOMAINS;
  var DIFFS = [['E', 'Easy'], ['M', 'Medium'], ['H', 'Hard']];

  function home() {
    var f = load('filter', { domains: [], diffs: [] });
    st.filter = f;
    var chips = function (list, sel, kind) {
      return list.map(function (d) {
        var v = kind === 'dom' ? d : d[0], lab = kind === 'dom' ? d : d[1];
        return '<button class="opt' + (sel.indexOf(v) >= 0 ? ' on' : '') + '" data-' + kind + '="' + v + '">' + lab + '</button>';
      }).join('');
    };
    $('home').innerHTML =
      '<div class="wrap">' +
      '<h1>SAT Math Practice</h1>' +
      '<p class="sub">Bluebook-style interface with the real Desmos graphing calculator. Questions are generated fresh every time from the 19 official math skills, weighted to match the live College Board question bank, and every one comes with a worked explanation.</p>' +

      '<div class="card">' +
      '<h3>Question filter</h3>' +
      '<p>Applies to both modes. Leave everything off to draw from all skills in the bank\'s own proportions.</p>' +
      '<div class="opts" id="domchips">' + chips(DOMS, f.domains, 'dom') + '</div>' +
      '<div class="opts" id="diffchips">' + chips(DIFFS, f.diffs, 'diff') + '</div>' +
      '</div>' +

      '<div class="card">' +
      '<h3>Random fire</h3>' +
      '<p>One question at a time, no clock. Answer, check it, read the explanation, next. Endless.</p>' +
      '<button class="pill" id="startfire">Start random fire</button>' +
      '</div>' +

      '<div class="card">' +
      '<h3>Full test</h3>' +
      '<p>Timed, navigable, with a review page and a score report at the end. The real math section is 44 questions in 70 minutes, split into two 22-question modules.</p>' +
      '<div class="fieldrow">' +
      '<label class="field">Questions<input type="number" id="qcount" min="5" max="98" value="' + load('qcount', 44) + '"></label>' +
      '<label class="field">Minutes<input type="number" id="qmins" min="1" max="240" value="' + load('qmins', 70) + '"></label>' +
      '<label class="field">Structure<select id="qmods">' +
      '<option value="2">Two modules (like the real test)</option>' +
      '<option value="1">One continuous module</option>' +
      '</select></label>' +
      '<button class="pill" id="starttest">Start test</button>' +
      '</div>' +
      '<p class="muted">Both fields are free: 10 questions in 15 minutes works as well as the full 44 in 70.</p>' +
      '</div>' +

      '<p class="muted">Built on the skill list, difficulty mix and question archetypes of the College Board SAT Suite Question Bank (1,925 live math items, read 2026-09-19). No College Board item text is reproduced: every question here is generated. Desmos is the real Desmos graphing calculator, embedded through the Desmos API.</p>' +
      '</div>';

    $('qmods').value = load('qmods', '2');

    $('domchips').onclick = function (e) {
      var b = e.target.closest('[data-dom]'); if (!b) return;
      var v = b.getAttribute('data-dom'), k = st.filter.domains.indexOf(v);
      if (k >= 0) st.filter.domains.splice(k, 1); else st.filter.domains.push(v);
      b.classList.toggle('on'); save('filter', st.filter);
    };
    $('diffchips').onclick = function (e) {
      var b = e.target.closest('[data-diff]'); if (!b) return;
      var v = b.getAttribute('data-diff'), k = st.filter.diffs.indexOf(v);
      if (k >= 0) st.filter.diffs.splice(k, 1); else st.filter.diffs.push(v);
      b.classList.toggle('on'); save('filter', st.filter);
    };
    $('startfire').onclick = startFire;
    $('starttest').onclick = startTest;
  }

  /* ---------------------------------- start modes ---------------------------------- */
  function startFire() {
    st.mode = 'fire'; st.qs = []; st.i = 0; st.ans = []; st.marked = []; st.crossed = []; st.shown = [];
    st.limit = 0; st.modules = 1; st.modIdx = 0;
    pushFire();
    enterShell('Practice: Math');
  }
  function pushFire() {
    var q = S.one(st.filter);
    if (!q) { alert('No questions match that filter. Turn some options back on.'); return false; }
    st.qs.push(q); st.ans.push(null); st.marked.push(false); st.crossed.push([]); st.shown.push(false);
    return true;
  }

  function startTest() {
    var n = Math.max(1, Math.min(98, parseInt($('qcount').value, 10) || 44));
    var mins = Math.max(1, Math.min(240, parseInt($('qmins').value, 10) || 70));
    var mods = parseInt($('qmods').value, 10) === 1 ? 1 : 2;
    save('qcount', n); save('qmins', mins); save('qmods', String(mods));
    var qs = S.many(n, st.filter);
    if (!qs.length) { alert('No questions match that filter. Turn some options back on.'); return; }
    st.mode = 'test'; st.qs = qs; st.i = 0;
    st.ans = qs.map(function () { return null; });
    st.marked = qs.map(function () { return false; });
    st.crossed = qs.map(function () { return []; });
    st.shown = qs.map(function () { return false; });
    st.modules = mods; st.modIdx = 0;
    st.perMod = mods === 2 ? Math.ceil(qs.length / 2) : qs.length;
    st.limit = Math.round(mins * 60 / mods);
    startClock();
    enterShell(label());
  }
  function label() {
    return st.mode === 'fire' ? 'Practice: Math'
      : 'Section 2: Math' + (st.modules === 2 ? ', Module ' + (st.modIdx + 1) : '');
  }

  function enterShell(lab) {
    $('home').classList.add('hide'); $('review').classList.add('hide'); $('results').classList.add('hide');
    $('shell').classList.remove('hide');
    $('sectlabel').textContent = lab; $('navtitle').textContent = lab;
    $('who').textContent = st.mode === 'fire' ? 'Random fire' : 'Full test';
    render();
  }

  /* ---------------------------------- module bounds ---------------------------------- */
  function lo() { return st.mode === 'test' && st.modules === 2 ? st.modIdx * st.perMod : 0; }
  function hi() { return st.mode === 'test' && st.modules === 2 ? Math.min(st.qs.length, (st.modIdx + 1) * st.perMod) : st.qs.length; }

  /* ---------------------------------- clock ---------------------------------- */
  function startClock() {
    stopClock();
    st.left = st.limit;
    if (!st.limit) return;
    paintClock();
    st.tick = setInterval(function () {
      st.left--;
      if (st.left <= 0) { st.left = 0; paintClock(); stopClock(); endModule(true); return; }
      paintClock();
    }, 1000);
  }
  function stopClock() { if (st.tick) { clearInterval(st.tick); st.tick = null; } }
  function paintClock() {
    var c = $('clock');
    if (!st.limit) { c.textContent = '--:--'; return; }
    var m = Math.floor(st.left / 60), s = st.left % 60;
    c.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    c.classList.toggle('warn', st.left <= 300);
    c.style.visibility = st.hidden ? 'hidden' : 'visible';
  }
  $('clockbtn').onclick = function () {
    st.hidden = !st.hidden; this.textContent = st.hidden ? 'Show' : 'Hide'; paintClock();
  };

  /* ---------------------------------- render a question ---------------------------------- */
  function render() {
    var q = st.qs[st.i];
    if (!q) return;
    var L = $('leftpane'), R = $('rightpane');
    var hasStem = !!(q.stem && q.stem.trim());

    var bar = '<div class="qbar">' +
      '<span class="qnum">' + (st.i - lo() + 1) + '</span>' +
      '<button class="markbtn' + (st.marked[st.i] ? ' on' : '') + '" id="markbtn">' +
      '<svg viewBox="0 0 24 24" fill="' + (st.marked[st.i] ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.8"><path d="M6 3h12v18l-6-5-6 5z"/></svg>' +
      '<span>Mark for Review</span></button>' +
      '<button class="abcbtn' + (st.abc ? ' on' : '') + '" id="abcbtn">ABC</button>' +
      '</div>';

    var qhtml = '<div class="prompt">' + (q.prompt || '') + '</div>' + answerHTML(q);

    if (st.split && hasStem) {
      L.innerHTML = '<div class="stem">' + q.stem + '</div>';
      R.innerHTML = bar + qhtml;
      body.classList.remove('single');
    } else {
      L.innerHTML = '';
      R.innerHTML = bar + (hasStem ? '<div class="stem">' + q.stem + '</div>' : '') + qhtml;
      body.classList.add('single');
    }
    body.classList.toggle('abc', st.abc);

    tex(L); tex(R);
    wireQuestion(q);
    paintFooter();
    if (st.shown[st.i]) reveal(true);
  }

  function answerHTML(q) {
    if (q.type === 'spr') {
      var v = st.ans[st.i];
      return '<p class="sprhelp">Enter your answer. If the answer is a fraction that does not fit, give a decimal instead. ' +
        'If it is a decimal that does not fit, truncate or round at the fourth digit.</p>' +
        '<div class="sprbox"><input id="sprin" type="text" autocomplete="off" spellcheck="false" value="' + (v == null ? '' : String(v).replace(/"/g, '&quot;')) + '">' +
        '<div class="sprprev" id="sprprev"></div></div>';
    }
    var letters = ['A', 'B', 'C', 'D'];
    return '<div class="choices" id="choices">' + q.choices.map(function (c, k) {
      var out = st.crossed[st.i].indexOf(k) >= 0;
      return '<div class="crow">' +
        '<button class="choice' + (st.ans[st.i] === k ? ' sel' : '') + (out ? ' out' : '') + '" data-k="' + k + '">' +
        '<span class="letter">' + letters[k] + '</span><span class="ctext">' + c + '</span></button>' +
        '<button class="xbtn' + (out ? ' undo' : '') + '" data-x="' + k + '">' + (out ? 'Undo' : letters[k]) + '</button>' +
        '</div>';
    }).join('') + '</div>' +
      (st.mode === 'fire' ? '<div class="fbrow"><button class="pill ghost" id="checkbtn">Check answer</button></div>' : '');
  }

  function wireQuestion(q) {
    $('markbtn').onclick = function () { st.marked[st.i] = !st.marked[st.i]; render(); };
    $('abcbtn').onclick = function () { st.abc = !st.abc; render(); };
    if (q.type === 'spr') {
      var inp = $('sprin');
      inp.oninput = function () {
        st.ans[st.i] = inp.value;
        var v = S.parseSPR(inp.value);
        $('sprprev').textContent = inp.value.trim() ? (v == null ? 'Not a number the grid can take' : 'Answer preview: ' + v) : '';
        paintFooter();
      };
      inp.oninput();
      if (st.mode === 'fire' && !st.shown[st.i]) {
        var d = document.createElement('div');
        d.className = 'fbrow'; d.innerHTML = '<button class="pill ghost" id="checkbtn">Check answer</button>';
        $('rightpane').appendChild(d);
      }
    } else {
      $('choices').onclick = function (e) {
        var x = e.target.closest('[data-x]');
        if (x) {
          var k = +x.getAttribute('data-x'), a = st.crossed[st.i], j = a.indexOf(k);
          if (j >= 0) a.splice(j, 1); else { a.push(k); if (st.ans[st.i] === k) st.ans[st.i] = null; }
          render(); return;
        }
        var c = e.target.closest('[data-k]');
        if (!c || st.shown[st.i]) return;
        st.ans[st.i] = +c.getAttribute('data-k');
        render();
      };
    }
    var cb = $('checkbtn');
    if (cb) cb.onclick = function () { st.shown[st.i] = true; render(); };
  }

  /* ---------------------------------- reveal answer + explanation ---------------------------------- */
  function correctOf(q, a) {
    if (q.type === 'spr') return a != null && S.sprOK(a, q.value);
    return a === q.correct;
  }
  function reveal(scroll) {
    var q = st.qs[st.i], a = st.ans[st.i], ok = correctOf(q, a);
    var R = $('rightpane');
    if (q.type === 'mcq') {
      var nodes = R.querySelectorAll('.choice');
      for (var k = 0; k < nodes.length; k++) {
        if (k === q.correct) nodes[k].classList.add('correct');
        else if (a === k) nodes[k].classList.add('wrong');
      }
    }
    var v = document.createElement('div');
    v.className = 'verdict';
    v.innerHTML = a == null || a === ''
      ? '<span class="bad">No answer</span> — correct answer: <b>' + answerText(q) + '</b>'
      : (ok ? '<span class="ok">Correct</span>' : '<span class="bad">Incorrect</span> — correct answer: <b>' + answerText(q) + '</b>');
    R.appendChild(v);
    R.appendChild(explNode(q));
    var f = document.createElement('div');
    f.className = 'fbrow';
    f.innerHTML = '<button class="pill" id="nextfire">Next question</button>';
    R.appendChild(f);
    $('nextfire').onclick = nextFire;
    tex(v); tex(R.lastChild.previousSibling);
    if (scroll !== true) R.scrollTop = R.scrollHeight;
  }
  function answerText(q) {
    if (q.type === 'spr') return q.show;
    return ['A', 'B', 'C', 'D'][q.correct] + ') ' + stripTex(q.choices[q.correct]);
  }
  function stripTex(s) { return String(s).replace(/<[^>]+>/g, '').replace(/\$/g, ''); }

  function explNode(q) {
    var d = document.createElement('div');
    d.className = 'expl';
    d.innerHTML = '<h4>' + q.sd + ' &middot; ' + ({ E: 'Easy', M: 'Medium', H: 'Hard' })[q.diff] + '</h4>' +
      '<ol>' + (q.expl || []).map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' +
      (q.key ? '<div class="keyline"><b>Takeaway:</b> ' + q.key + '</div>' : '');
    tex(d);
    return d;
  }

  function nextFire() {
    if (st.i === st.qs.length - 1) { if (!pushFire()) return; }
    st.i++;
    render();
    $('rightpane').scrollTop = 0;
  }

  /* ---------------------------------- footer + navigator ---------------------------------- */
  function paintFooter() {
    var a = lo(), b = hi();
    $('navbtn').innerHTML = 'Question ' + (st.i - a + 1) + ' of ' + (b - a) + ' &#8963;';
    $('backbtn').disabled = st.i <= a;
    $('nextbtn').textContent = (st.mode === 'test' && st.i === b - 1) ? 'Review' : 'Next';
    $('nextbtn').classList.toggle('hide', st.mode === 'fire' && !st.shown[st.i]);
  }
  $('backbtn').onclick = function () { if (st.i > lo()) { st.i--; render(); $('rightpane').scrollTop = 0; } };
  $('nextbtn').onclick = function () {
    if (st.mode === 'fire') { nextFire(); return; }
    if (st.i === hi() - 1) { showReview(); return; }
    st.i++; render(); $('rightpane').scrollTop = 0;
  };
  $('navbtn').onclick = function () { $('navpop').classList.toggle('hide'); paintNav(); };
  $('nav-close').onclick = function () { $('navpop').classList.add('hide'); };
  $('gotoreview').onclick = function () { $('navpop').classList.add('hide'); showReview(); };

  function paintNav() {
    var a = lo(), b = hi(), h = '';
    for (var k = a; k < b; k++) {
      var answered = st.ans[k] != null && st.ans[k] !== '';
      h += '<button class="ncell' + (answered ? ' ans' : '') + (k === st.i ? ' cur' : '') + '" data-g="' + k + '">' +
        (k - a + 1) + (st.marked[k] ? '<span class="fl">&#9873;</span>' : '') + '</button>';
    }
    $('navgrid').innerHTML = h;
    $('navgrid').onclick = function (e) {
      var c = e.target.closest('[data-g]'); if (!c) return;
      st.i = +c.getAttribute('data-g'); $('navpop').classList.add('hide'); render(); $('rightpane').scrollTop = 0;
    };
    $('gotoreview').classList.toggle('hide', st.mode === 'fire');
  }

  /* ---------------------------------- review page ---------------------------------- */
  function showReview() {
    var a = lo(), b = hi(), h = '';
    for (var k = a; k < b; k++) {
      var answered = st.ans[k] != null && st.ans[k] !== '';
      h += '<button class="ncell' + (answered ? ' ans' : '') + '" data-g="' + k + '">' +
        (k - a + 1) + (st.marked[k] ? '<span class="fl">&#9873;</span>' : '') + '</button>';
    }
    var unans = 0;
    for (var j = a; j < b; j++) if (st.ans[j] == null || st.ans[j] === '') unans++;
    $('review').innerHTML = '<div class="wrap" style="text-align:center">' +
      '<h1>Check Your Work</h1>' +
      '<p class="sub">On test day you cannot move back to a module once you leave it. ' +
      (unans ? '<b>' + unans + '</b> question' + (unans === 1 ? ' is' : 's are') + ' still unanswered.' : 'Every question has an answer.') + '</p>' +
      '<div class="card" style="text-align:left">' +
      '<div class="navlegend"><span><i class="lgbox"></i> Unanswered</span><span><i class="lgbox ans"></i> Answered</span><span style="color:var(--red)">&#9873; For Review</span></div>' +
      '<div class="navgrid" id="rgrid">' + h + '</div></div>' +
      '<div class="fbrow" style="justify-content:center">' +
      '<button class="pill ghost" id="backtoq">Back to question ' + (st.i - a + 1) + '</button>' +
      '<button class="pill" id="submitmod">' + (st.modules === 2 && st.modIdx === 0 ? 'Finish Module 1' : 'Submit and score') + '</button>' +
      '</div></div>';
    $('review').classList.remove('hide'); $('shell').classList.add('hide');
    $('rgrid').onclick = function (e) {
      var c = e.target.closest('[data-g]'); if (!c) return;
      st.i = +c.getAttribute('data-g');
      $('review').classList.add('hide'); $('shell').classList.remove('hide'); render();
    };
    $('backtoq').onclick = function () { $('review').classList.add('hide'); $('shell').classList.remove('hide'); render(); };
    $('submitmod').onclick = function () { endModule(false); };
  }

  function endModule(auto) {
    stopClock();
    if (st.modules === 2 && st.modIdx === 0) {
      st.modIdx = 1; st.i = lo();
      $('review').classList.add('hide');
      $('results').classList.remove('hide');
      $('results').innerHTML = '<div class="wrap" style="text-align:center">' +
        '<h1>Module 1 complete</h1>' +
        '<p class="sub">' + (auto ? 'Time ran out on module 1. ' : '') +
        'Module 2 has ' + (st.qs.length - st.perMod) + ' questions and its own clock. On test day the second module adapts to how the first went; here it is drawn the same way.</p>' +
        '<button class="pill" id="startmod2">Begin Module 2</button></div>';
      $('startmod2').onclick = function () {
        $('results').classList.add('hide');
        startClock(); enterShell(label());
      };
      return;
    }
    showResults(auto);
  }

  /* ---------------------------------- results ---------------------------------- */
  function showResults(auto) {
    stopClock();
    var right = 0, byDom = {}, rows = '';
    st.qs.forEach(function (q, k) {
      var ok = correctOf(q, st.ans[k]);
      if (ok) right++;
      var d = byDom[q.dom] = byDom[q.dom] || { n: 0, r: 0 };
      d.n++; if (ok) d.r++;
      var given = st.ans[k] == null || st.ans[k] === '' ? '<i>blank</i>'
        : (q.type === 'spr' ? String(st.ans[k]) : ['A', 'B', 'C', 'D'][st.ans[k]]);
      rows += '<tr>' +
        '<td>' + (k + 1) + '</td>' +
        '<td><span class="tag ' + q.diff + '">' + q.diff + '</span></td>' +
        '<td>' + q.sd + '</td>' +
        '<td>' + given + '</td>' +
        '<td>' + (q.type === 'spr' ? q.show : ['A', 'B', 'C', 'D'][q.correct]) + '</td>' +
        '<td class="' + (ok ? 'ok' : 'bad') + '">' + (ok ? 'correct' : 'wrong') + '</td>' +
        '<td><button class="opt" data-e="' + k + '">Explain</button></td>' +
        '</tr>';
    });
    var pct = Math.round(right / st.qs.length * 100);
    var domHTML = Object.keys(byDom).map(function (d) {
      return '<div><b>' + byDom[d].r + ' / ' + byDom[d].n + '</b><div class="bl">' + d + '</div></div>';
    }).join('');
    $('results').innerHTML = '<div class="wrap">' +
      '<h1>Score report</h1>' +
      '<p class="sub">' + (auto ? 'The clock ran out. ' : '') + 'Raw score only: this tool does not convert to the 200&ndash;800 scale, because that conversion is specific to each real form.</p>' +
      '<div class="card"><div class="scoreline"><div><div class="bignum">' + right + ' / ' + st.qs.length + '</div><div class="bl">' + pct + '% correct</div></div>' + domHTML + '</div></div>' +
      '<h2>Every question</h2>' +
      '<table class="rtab"><tr><th>#</th><th>Diff</th><th>Skill</th><th>You</th><th>Key</th><th></th><th></th></tr>' + rows + '</table>' +
      '<div id="expslot"></div>' +
      '<div class="fbrow"><button class="pill" id="againbtn">New test</button><button class="pill ghost" id="homebtn">Back to menu</button></div>' +
      '</div>';
    $('results').classList.remove('hide'); $('shell').classList.add('hide'); $('review').classList.add('hide');
    $('results').addEventListener('click', function (e) {
      var b = e.target.closest('[data-e]'); if (!b) return;
      var k = +b.getAttribute('data-e'), q = st.qs[k];
      var slot = $('expslot');
      slot.innerHTML = '<h2>Question ' + (k + 1) + '</h2>' +
        '<div class="card">' + (q.stem || '') + '<div class="prompt">' + q.prompt + '</div>' +
        (q.type === 'mcq' ? '<div class="muted">Correct: ' + ['A', 'B', 'C', 'D'][q.correct] + ') ' + q.choices[q.correct] + '</div>' : '<div class="muted">Correct: ' + q.show + '</div>') +
        '</div>';
      slot.appendChild(explNode(q));
      tex(slot);
      slot.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('againbtn').onclick = function () { $('results').classList.add('hide'); $('home').classList.remove('hide'); home(); };
    $('homebtn').onclick = function () { $('results').classList.add('hide'); $('home').classList.remove('hide'); home(); };
  }

  /* ---------------------------------- tools: calculator ---------------------------------- */
  var desmos = null;
  $('t-calc').onclick = function () {
    var p = $('calc'), showing = p.classList.contains('hide');
    p.classList.toggle('hide');
    this.classList.toggle('on', showing);
    if (showing && !desmos && window.Desmos) {
      desmos = Desmos.GraphingCalculator($('calcbody'), {
        keypad: true, expressions: true, settingsMenu: true, zoomButtons: true,
        border: false, lockViewport: false, invertedColors: false
      });
    }
    if (showing && desmos) setTimeout(function () { desmos.resize(); }, 30);
  };
  $('calc-close').onclick = function () { $('calc').classList.add('hide'); $('t-calc').classList.remove('on'); };
  $('calc-dock').onclick = function () {
    var p = $('calc'), w = Math.floor(window.innerWidth / 2) - 16;
    if (p.dataset.docked === '1') {
      p.style.left = '24px'; p.style.top = '110px'; p.style.width = '460px'; p.style.height = '520px';
      p.dataset.docked = '0';
    } else {
      p.style.left = '8px'; p.style.top = '96px'; p.style.width = w + 'px';
      p.style.height = (window.innerHeight - 180) + 'px';
      p.dataset.docked = '1';
    }
    if (desmos) setTimeout(function () { desmos.resize(); }, 30);
  };

  /* ---------------------------------- tools: reference ---------------------------------- */
  var REF = [
    ['Circle', 'A = \\pi r^2 \\\\ C = 2\\pi r'],
    ['Rectangle', 'A = \\ell w'],
    ['Triangle', 'A = \\tfrac{1}{2} b h'],
    ['Right triangle', 'a^2 + b^2 = c^2'],
    ['30-60-90', 'x,\\ x\\sqrt{3},\\ 2x'],
    ['45-45-90', 's,\\ s,\\ s\\sqrt{2}'],
    ['Rect. prism', 'V = \\ell w h'],
    ['Cylinder', 'V = \\pi r^2 h'],
    ['Sphere', 'V = \\tfrac{4}{3}\\pi r^3'],
    ['Cone', 'V = \\tfrac{1}{3}\\pi r^2 h'],
    ['Pyramid', 'V = \\tfrac{1}{3} \\ell w h']
  ];
  $('t-ref').onclick = function () {
    var p = $('ref'), showing = p.classList.contains('hide');
    p.classList.toggle('hide'); this.classList.toggle('on', showing);
    if (showing && !p.dataset.built) {
      $('refbody').innerHTML = '<div class="rgrid">' + REF.map(function (r) {
        return '<div class="rcell"><b>' + r[0] + '</b><div class="f">$' + r[1] + '$</div></div>';
      }).join('') + '</div>' +
        '<div class="note">The number of degrees of arc in a circle is $360$.<br>' +
        'The number of radians of arc in a circle is $2\\pi$.<br>' +
        'The sum of the measures in degrees of the angles of a triangle is $180$.</div>';
      tex($('refbody'));
      p.dataset.built = '1';
    }
  };
  $('ref-close').onclick = function () { $('ref').classList.add('hide'); $('t-ref').classList.remove('on'); };

  /* ---------------------------------- tools: split + exit ---------------------------------- */
  $('t-split').onclick = function () { st.split = !st.split; this.classList.toggle('on', st.split); render(); };
  $('t-quit').onclick = function () {
    if (st.mode === 'test' && !confirm('Leave the test? Answers so far are scored.')) return;
    stopClock();
    if (st.mode === 'test') showResults(false);
    else { $('shell').classList.add('hide'); $('home').classList.remove('hide'); home(); }
  };
  $('dirbtn').onclick = function () {
    var R = $('rightpane'), ex = R.querySelector('details.dir');
    if (ex) { ex.remove(); return; }
    var d = document.createElement('details');
    d.className = 'dir'; d.open = true;
    d.innerHTML = '<summary>Directions</summary><div>The questions in this section address a number of important math skills. ' +
      'Use of the calculator is permitted for all questions. Unless otherwise indicated, all variables and expressions represent real numbers, ' +
      'figures provided are drawn to scale, and the domain of a given function is the set of all real numbers for which the function is defined.</div>';
    R.insertBefore(d, R.firstChild);
  };

  /* ---------------------------------- dragging and resizing ---------------------------------- */
  (function () {
    var drag = null;
    document.addEventListener('mousedown', function (e) {
      var h = e.target.closest('[data-drag]');
      if (h) {
        var p = $(h.getAttribute('data-drag'));
        drag = { p: p, kind: 'move', x: e.clientX, y: e.clientY, l: p.offsetLeft, t: p.offsetTop };
        e.preventDefault(); return;
      }
      var r = e.target.closest('[data-rsz]');
      if (r) {
        var q = $(r.getAttribute('data-rsz'));
        drag = { p: q, kind: 'size', x: e.clientX, y: e.clientY, w: q.offsetWidth, hgt: q.offsetHeight };
        e.preventDefault(); return;
      }
      if (e.target.closest('#split')) {
        drag = { kind: 'split', x: e.clientX, w: $('leftpane').offsetWidth };
        e.preventDefault();
      }
    });
    document.addEventListener('mousemove', function (e) {
      if (!drag) return;
      if (drag.kind === 'move') {
        drag.p.style.left = Math.max(0, Math.min(window.innerWidth - 120, drag.l + e.clientX - drag.x)) + 'px';
        drag.p.style.top = Math.max(0, Math.min(window.innerHeight - 60, drag.t + e.clientY - drag.y)) + 'px';
      } else if (drag.kind === 'size') {
        drag.p.style.width = Math.max(280, drag.w + e.clientX - drag.x) + 'px';
        drag.p.style.height = Math.max(220, drag.hgt + e.clientY - drag.y) + 'px';
        if (drag.p.id === 'calc' && desmos) desmos.resize();
      } else {
        var tot = $('panes').offsetWidth;
        var w = Math.max(200, Math.min(tot - 260, drag.w + e.clientX - drag.x));
        $('leftpane').style.flex = '0 0 ' + w + 'px';
      }
    });
    document.addEventListener('mouseup', function () {
      if (drag && drag.kind === 'size' && drag.p.id === 'calc' && desmos) desmos.resize();
      drag = null;
    });
  })();

  /* ---------------------------------- keyboard ---------------------------------- */
  document.addEventListener('keydown', function (e) {
    if ($('shell').classList.contains('hide')) return;
    if (e.target.closest && e.target.closest('.pop')) return;   /* a key pressed inside the calculator belongs to the calculator */
    if (e.target.isContentEditable) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') {
      if (e.key === 'Enter') { var nb = $('checkbtn') || $('nextbtn'); if (nb) nb.click(); }
      return;
    }
    var q = st.qs[st.i];
    if (q && q.type === 'mcq' && /^[a-dA-D]$/.test(e.key) && !st.shown[st.i]) {
      st.ans[st.i] = 'abcd'.indexOf(e.key.toLowerCase()); render(); e.preventDefault(); return;
    }
    if (e.key === 'ArrowRight') { $('nextbtn').click(); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { $('backbtn').click(); e.preventDefault(); }
    if (e.key === 'Enter') { var b = $('checkbtn') || $('nextfire') || $('nextbtn'); if (b) b.click(); e.preventDefault(); }
  });

  window.addEventListener('resize', function () { if (desmos) desmos.resize(); });

  /* ---------------------------------- go ---------------------------------- */
  home();
})();
