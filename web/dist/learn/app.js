/* app.js — routing, the lesson page, the drill runner and the review session.
   The design brief: a study room, not an arcade. Progress is stated plainly, motion is small,
   and nothing congratulates you for showing up. */
(function () {
  'use strict';
  var L = window.LEARN, S = window.SAT;
  var $ = function (id) { return document.getElementById(id); };
  var main = $('main'), side = $('side'), toc = $('toc');

  /* ================================ theme ================================ */
  (function () {
    var t = null;
    try { t = localStorage.getItem('learn.theme'); } catch (e) {}
    if (t) document.documentElement.setAttribute('data-theme', t);
    $('themebtn').onclick = function () {
      var cur = document.documentElement.getAttribute('data-theme');
      var sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      var next = cur ? (cur === 'dark' ? 'light' : 'dark') : (sysDark ? 'light' : 'dark');
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('learn.theme', next); } catch (e) {}
    };
  })();

  /* ================================ routing ================================ */
  function go(h) { if (location.hash === h) route(); else location.hash = h; }
  window.addEventListener('hashchange', route);

  function route() {
    var h = location.hash.replace(/^#\/?/, '');
    side.classList.remove('open');
    window.scrollTo(0, 0);
    toc.classList.remove('show'); toc.innerHTML = '';
    if (!h) { var t = L.st.track || 'sat'; go('/t/' + t); return; }
    var p = h.split('/');
    if (p[0] === 't') { L.st.track = p[1]; L.save(); paintTracks(); paintTree(p[1]); dash(p[1]); }
    else if (p[0] === 'l') {
      var id = decodeURIComponent(p.slice(1).join('/'));
      var Le = L.LESSONS[id];
      if (!Le) { go('/t/' + (L.st.track || 'sat')); return; }
      L.st.track = Le.track; L.save();
      paintTracks(); paintTree(Le.track, id); lessonPage(Le);
    } else if (p[0] === 'review') { paintTracks(); paintTree(L.st.track); reviewPage(); }
    else go('/t/' + (L.st.track || 'sat'));
  }

  /* ================================ chrome ================================ */
  function paintTracks() {
    var cur = L.st.track;
    $('tracks').innerHTML = Object.keys(L.TRACKS).map(function (k) {
      return '<button class="trk' + (k === cur ? ' on' : '') + '" data-t="' + k + '">' +
        (L.TRACKS[k].short || L.TRACKS[k].name) + '</button>';
    }).join('');
    var d = L.dueList().length;
    var b = $('duebtn');
    b.innerHTML = 'Review' + (d ? ' <span class="cnt">' + d + '</span>' : '');
    b.classList.toggle('hot', !!d);
  }
  $('tracks').onclick = function (e) { var b = e.target.closest('[data-t]'); if (b) go('/t/' + b.getAttribute('data-t')); };
  $('brand').onclick = function () { go('/t/' + (L.st.track || 'sat')); };
  $('duebtn').onclick = function () { go('/review'); };
  $('menubtn').onclick = function () { side.classList.toggle('open'); };

  function paintTree(tid, activeId) {
    var T = L.TRACKS[tid];
    if (!T) return;
    $('sidehead').textContent = T.name;
    $('tree').innerHTML = T.units.map(function (u) {
      var closed = L.st.open[u.id] === 0 && !(activeId && u.lessons.indexOf(activeId) >= 0);
      var done = u.lessons.filter(function (id) { var r = L.st.L[id]; return r && r.mastered; }).length;
      return '<div class="unit' + (closed ? ' closed' : '') + '" data-u="' + u.id + '">' +
        '<h4><span class="caret">&#9660;</span>' + u.name +
        '<span class="ucount">' + done + '/' + u.lessons.length + '</span></h4><div class="ul">' +
        u.lessons.map(function (id) {
          var Le = L.LESSONS[id], pr = L.progress(id);
          return '<div class="li' + (id === activeId ? ' on' : '') + '" data-l="' + id + '">' +
            '<span class="dot ' + pr.state + '"></span><span>' + Le.title + '</span></div>';
        }).join('') + '</div></div>';
    }).join('');
    var on = $('tree').querySelector('.li.on');
    if (on && on.scrollIntoView) { try { on.scrollIntoView({ block: 'nearest' }); } catch (e) {} }
  }
  $('tree').onclick = function (e) {
    var li = e.target.closest('[data-l]');
    if (li) { go('/l/' + encodeURIComponent(li.getAttribute('data-l'))); return; }
    var uh = e.target.closest('.unit > h4');
    if (uh) {
      var u = uh.parentNode, id = u.getAttribute('data-u');
      u.classList.toggle('closed');
      L.st.open[id] = u.classList.contains('closed') ? 0 : 1; L.save();
    }
  };

  /* ================================ dashboard ================================ */
  function dash(tid) {
    var T = L.TRACKS[tid], s = L.trackStats(tid), d = L.dueList().filter(function (id) { return L.LESSONS[id].track === tid; });
    var next = null;
    T.units.forEach(function (u) {
      u.lessons.forEach(function (id) {
        if (next) return;
        var r = L.st.L[id];
        if (!r || !r.mastered) next = id;
      });
    });
    var h = '<div class="crumb">' + T.name + '</div><h1>' + T.head + '</h1>' +
      '<p class="lead">' + T.blurb + '</p>' +
      '<div class="stat">' +
      '<div><b>' + s.done + '<span style="color:var(--mut);font-weight:600"> / ' + s.n + '</span></b><span>Mastered</span></div>' +
      '<div><b>' + s.seen + '</b><span>In progress</span></div>' +
      '<div><b>' + d.length + '</b><span>Due for review</span></div>' +
      '</div>';
    h += '<div class="row">';
    if (d.length) h += '<button class="pill" id="goreview">Review ' + d.length + ' due</button>';
    if (next) h += '<button class="pill' + (d.length ? ' ghost' : '') + '" id="gonext">' +
      (L.st.L[next] && L.st.L[next].seen ? 'Continue &middot; ' : 'Start &middot; ') + L.LESSONS[next].title + '</button>';
    h += '</div>';

    h += '<h2><span>How this works</span></h2><div class="prose"><p>' + T.how + '</p></div>';

    h += '<h2><span>The whole curriculum</span></h2>';
    T.units.forEach(function (u, ui) {
      var done = u.lessons.filter(function (id) { var r = L.st.L[id]; return r && r.mastered; }).length;
      h += '<h3>' + (ui + 1) + '. ' + u.name + ' <span class="muted">&nbsp;' + done + ' of ' + u.lessons.length + ' mastered</span></h3><div class="grid">' +
        u.lessons.map(function (id) {
          var Le = L.LESSONS[id], pr = L.progress(id);
          return '<div class="tile" data-l="' + id + '"><h4>' + Le.title + '</h4>' +
            '<p>' + clip(Le.why, 104) + '</p>' +
            '<div class="bar"><i class="' + (pr.pct >= 100 ? 'full' : '') + '" style="width:' + pr.pct + '%"></i></div></div>';
        }).join('') + '</div>';
    });
    main.innerHTML = h;
    L.tex(main);
    if ($('goreview')) $('goreview').onclick = function () { go('/review'); };
    if ($('gonext')) $('gonext').onclick = function () { go('/l/' + encodeURIComponent(next)); };
    main.onclick = function (e) {
      var t = e.target.closest('[data-l]');
      if (t) go('/l/' + encodeURIComponent(t.getAttribute('data-l')));
    };
  }
  function clip(s, n) {
    s = String(s || '').replace(/<[^>]+>/g, '').replace(/\$([^$]*)\$/g, '$1');
    return s.length > n ? s.slice(0, n).replace(/[\s,;.]+\S*$/, '') + '…' : s;
  }

  /* ================================ lesson page ================================ */
  function lessonPage(Le) {
    var r = L.rec(Le.id), pr = L.progress(Le.id);
    r.read = 1; L.save();
    var T = L.TRACKS[Le.track];
    var unitName = (function () { for (var i = 0; i < T.units.length; i++) if (T.units[i].id === Le.unit) return T.units[i].name; return Le.unit; })();
    var secs = [], sn = 0;
    function head(title, cls) {                 /* register a section, return its <h2> */
      var id = 'sec' + secs.length;
      secs.push({ id: id, t: title });
      var n = cls === 'teach' ? ++sn : 0;
      var num = n ? '<span class="num">' + (n < 10 ? '0' + n : n) + '</span>' : '';
      return '<h2 id="' + id + '">' + num + '<span>' + title + '</span></h2>';
    }

    /* ---- header ---- */
    var nEx = (Le.teach || []).reduce(function (a, s) { return a + ((s.ex || []).length); }, 0);
    var mins = Math.max(4, Math.round(JSON.stringify(Le).split(/\s+/).length / 230));
    var h = '<div class="crumb"><a href="#/t/' + Le.track + '">' + T.name + '</a> &nbsp;&#8250;&nbsp; ' + unitName + '</div>' +
      '<h1>' + Le.title + '</h1>' +
      '<p class="lead">' + Le.why + '</p>' +
      '<div class="meta">' +
      '<span>' + mins + ' min read</span><span class="kdot"></span>' +
      (nEx ? '<span>' + nEx + ' worked example' + (nEx > 1 ? 's' : '') + '</span><span class="kdot"></span>' : '') +
      ((Le.styles || []).length ? '<span>' + Le.styles.length + ' question styles</span><span class="kdot"></span>' : '') +
      '<span>' + (L.hasDrill(Le.id) ? 'drills to tier 5' : 'drills in progress') + '</span></div>';

    /* ---- mastery strip: stated, not celebrated ---- */
    h += '<div class="mastery">' +
      '<div><div class="mlab">Where you are</div>' +
      '<div class="mval">' + (r.mastered ? 'Mastered' : 'Tier ' + r.tier + ' of 5') + '</div>' +
      '<div class="steps5">' + [1, 2, 3, 4, 5].map(function (t) {
        return '<i class="' + (r.mastered ? 'top' : (t <= r.tier ? 'on' : '')) + '"></i>';
      }).join('') + '</div></div>' +
      '<div style="min-width:140px"><div class="mlab">Toward mastery</div>' +
      '<div class="mval">' + (r.mastered ? (L.due(Le.id) ? 'review due' : 'holding') : pr.pct + '%') + '</div>' +
      '<div class="bar"><i class="' + (pr.pct >= 100 ? 'full' : '') + '" style="width:' + pr.pct + '%"></i></div></div>' +
      '<div><div class="mlab">Your record here</div>' +
      '<div class="mval">' + (r.seen ? r.right + ' of ' + r.seen + ' correct' : 'not started') + '</div>' +
      '<div class="muted" style="margin-top:6px">' + (r.seen ? Math.round(r.right / r.seen * 100) + '% lifetime' : 'no questions yet') + '</div></div>' +
      (L.hasDrill(Le.id) ? '<button class="pill" id="startdrill" style="margin-left:auto">' +
        (r.seen ? 'Keep drilling' : 'Start drilling') + '</button>' : '') +
      '</div>';

    if (Le.prereq && Le.prereq.length) {
      h += '<div class="box recall"><b class="tag">This stands on</b>' + Le.prereq.map(function (p) {
        var t = L.LESSONS[p];
        return t ? '<a href="#/l/' + encodeURIComponent(p) + '">' + t.title + '</a>' : p;
      }).join(' &nbsp;&middot;&nbsp; ') + '</div>';
    }

    /* ---- recall ---- */
    if (Le.recall && Le.recall.length) {
      h += head('First, recall') +
        '<p class="muted" style="margin:-4px 0 10px">Answer each one in your head before you reveal it. Pulling a fact out of memory is what fixes it there; reading it again does very little.</p>';
      h += '<div class="card">' + Le.recall.map(function (x, i) {
        return '<div style="padding:10px 0;border-bottom:' + (i === Le.recall.length - 1 ? 'none' : '1px solid var(--line)') + '">' +
          '<div class="prose" style="margin:0"><b>' + (i + 1) + '.</b> ' + x.q + '</div>' +
          '<button class="hintbtn" data-rev="r' + i + '">Show answer</button>' +
          '<div class="prose hide" id="r' + i + '" style="margin:6px 0 0;color:var(--ink-2)">' + x.a + '</div></div>';
      }).join('') + '</div>';
    }

    /* ---- teach ---- */
    (Le.teach || []).forEach(function (sec) {
      var ps = sec.p == null ? [] : (typeof sec.p === 'string' ? [sec.p] : sec.p);
      h += head(sec.h, 'teach') + '<div class="prose">' + ps.map(function (x) { return '<p>' + x + '</p>'; }).join('') + '</div>';
      (sec.boxes || []).forEach(function (b) {
        h += '<div class="box ' + (b.k || '') + '"><b class="tag">' + (b.t || 'Note') + '</b>' + b.b + '</div>';
      });
      (sec.ex || []).forEach(function (e) {
        h += '<div class="ex"><div class="exq"><span class="exlab">Worked example</span>' + e.q + '</div><ol>' +
          e.s.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>' +
          (e.n ? '<div class="note">' + e.n + '</div>' : '') + '</div>';
      });
    });

    /* ---- question styles ---- */
    if (Le.styles && Le.styles.length) {
      h += head('Every style this is asked in') +
        '<p class="muted" style="margin:-4px 0 10px">' + (Le.stylesNote || 'These are the shapes the question comes in. Recognising the shape is most of the work; the algebra after it is usually short.') + '</p>' +
        '<table class="styles"><tr><th>Style</th><th>What it looks like</th><th>The move</th></tr>' +
        Le.styles.map(function (s) {
          return '<tr><td class="nm">' + s.n + '</td><td>' + s.l + '</td><td>' + s.m + '</td></tr>';
        }).join('') + '</table>';
    }

    /* ---- traps ---- */
    if (Le.traps && Le.traps.length) {
      h += head('Where points get lost') + '<div class="prose"><ul>' +
        Le.traps.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div>';
    }

    /* ---- videos ---- */
    if (Le.videos && Le.videos.length) {
      h += head('Watch') + '<div class="vids">' + Le.videos.map(function (v) {
        return '<a class="vid" href="' + v.u + '" target="_blank" rel="noopener"><span class="yt">&#9654;</span>' + v.t + '</a>';
      }).join('') + '</div>';
    }

    /* ---- drill mount ---- */
    h += head('Drill it in');
    if (L.hasDrill(Le.id)) {
      h += '<p class="muted" style="margin:-4px 0 12px">Questions climb a tier after two right in a row and drop one on a miss. Mastery is four right at the top tier with eight of your last ten correct. It then returns on a widening schedule: 1, 3, 7, 16, 35, 70 days.</p>' +
        '<div id="drill"><button class="pill" id="startdrill2">' + (r.seen ? 'Keep drilling' : 'Start drilling') + '</button></div>';
    } else {
      h += '<p class="muted">Drills for this lesson are still being written. The teaching above is complete.</p><div id="drill"></div>';
    }

    /* ---- next ---- */
    var nxt = nextLesson(Le);
    if (nxt) h += '<div class="row" style="margin-top:36px;padding-top:20px;border-top:1px solid var(--line)">' +
      '<button class="pill ghost" id="gonext2">Next &middot; ' + L.LESSONS[nxt].title + '</button></div>';

    main.innerHTML = h;
    L.tex(main);
    buildTOC(secs);

    main.onclick = function (e) {
      var rb = e.target.closest('[data-rev]');
      if (rb) { var d = $(rb.getAttribute('data-rev')); d.classList.toggle('hide'); rb.textContent = d.classList.contains('hide') ? 'Show answer' : 'Hide'; }
    };
    if ($('gonext2')) $('gonext2').onclick = function () { go('/l/' + encodeURIComponent(nxt)); };
    if ($('startdrill')) $('startdrill').onclick = startDrill;
    if ($('startdrill2')) $('startdrill2').onclick = startDrill;

    function startDrill() {
      var box = $('drill');
      box.scrollIntoView({ behavior: 'smooth', block: 'start' });
      runDrill(box, Le.id);
    }
  }

  /* ---- contents rail + scrollspy ---- */
  var spy = null;
  function buildTOC(secs) {
    if (spy) { spy.disconnect(); spy = null; }
    if (!secs || secs.length < 3) return;
    toc.innerHTML = '<div class="tochead">On this page</div>' +
      secs.map(function (s) { return '<a href="#' + s.id + '" data-s="' + s.id + '">' + s.t + '</a>'; }).join('');
    toc.classList.add('show');
    var links = {};
    Array.prototype.forEach.call(toc.querySelectorAll('[data-s]'), function (a) { links[a.getAttribute('data-s')] = a; });
    if (!window.IntersectionObserver) return;
    spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Array.prototype.forEach.call(toc.querySelectorAll('[data-s]'), function (a) { a.classList.remove('on'); });
        if (links[en.target.id]) links[en.target.id].classList.add('on');
      });
    }, { rootMargin: '-70px 0px -72% 0px' });
    secs.forEach(function (s) { var el = $(s.id); if (el) spy.observe(el); });
  }

  /* ---- reading progress hairline ---- */
  window.addEventListener('scroll', function () {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    $('prog').style.width = (max > 120 ? Math.min(100, (h.scrollTop / max) * 100) : 0) + '%';
  }, { passive: true });

  function nextLesson(Le) {
    var T = L.TRACKS[Le.track], flat = [];
    T.units.forEach(function (u) { flat = flat.concat(u.lessons); });
    var i = flat.indexOf(Le.id);
    return i >= 0 && i + 1 < flat.length ? flat[i + 1] : null;
  }

  /* ================================ drill runner ================================ */
  var D = null;

  function runDrill(host, id) {
    D = { mode: 'drill', id: id, host: host, seen: 0, right: 0, q: null, given: null, answered: false };
    nextQ();
  }

  function nextQ() {
    if (D.mode === 'review') return reviewNext();
    var r = L.rec(D.id);
    var q = L.draw(D.id, r.tier);
    if (!q) { D.host.innerHTML = '<p class="muted">No question could be built for this tier.</p>'; return; }
    D.q = q; D.given = null; D.answered = false;
    paintQ();
  }

  function paintQ() {
    var r = D.mode === 'drill' ? L.rec(D.id) : null;
    var q = D.q;
    var bar = '<div class="qbar">' +
      (r ? '<span class="tier">Tier ' + q.tier + '<span class="pips">' + [1, 2, 3, 4, 5].map(function (t) {
        return '<span class="pip' + (t <= r.tier ? ' on' : '') + '"></span>';
      }).join('') + '</span></span>'
        : '<span class="tier">Review &middot; ' + (D.idx + 1) + ' of ' + D.queue.length + '</span>') +
      '<span>' + D.right + ' of ' + D.seen + ' this session</span>' +
      (r && r.mastered ? '<span style="color:var(--ok)">mastered</span>' : '') +
      (q.sd ? '<span style="margin-left:auto;text-align:right">' + q.sd +
        (q.diff ? ' &middot; ' + { E: 'Easy', M: 'Medium', H: 'Hard' }[q.diff] : '') + '</span>' : '') +
      '</div>';
    var foot = '<div class="qfoot" id="drillfoot"><button class="pill" id="checkbtn">Check answer</button>' +
      (q.expl && q.expl.length ? '<button class="pill ghost" id="hintbtn">Nudge me</button>' : '') +
      '<button class="pill ghost" id="skipbtn">Skip</button>' +
      '<span class="kbd">' + (q.type === 'mcq' ? '<kbd>A</kbd>–<kbd>D</kbd> to pick &middot; ' : '') + '<kbd>Enter</kbd> to check</span></div>';
    D.host.innerHTML = '<div class="qcard">' + bar + '<div class="qbody">' + L.qHTML(q) + '<div id="hintslot"></div></div>' + foot + '</div>';
    L.tex(D.host);

    var opts = D.host.querySelectorAll('.opt');
    Array.prototype.forEach.call(opts, function (o) {
      o.onclick = function () {
        if (D.answered) return;
        Array.prototype.forEach.call(opts, function (x) { x.classList.remove('sel'); });
        o.classList.add('sel');
        D.given = +o.getAttribute('data-i');
      };
    });
    if ($('sprin')) $('sprin').focus();
    $('checkbtn').onclick = check;
    $('skipbtn').onclick = function () { D.host.innerHTML = ''; nextQ(); };
    if ($('hintbtn')) $('hintbtn').onclick = function () {
      $('hintslot').innerHTML = '<div class="box"><b class="tag">First step only</b>' + D.q.expl[0] + '</div>';
      L.tex($('hintslot'));
      this.disabled = true;
    };
  }

  function check() {
    if (D.answered) return;
    var q = D.q;
    var given = q.type === 'spr' ? ($('sprin') ? $('sprin').value : '') : D.given;
    if (q.type === 'spr' ? !String(given).trim() : given == null) return;
    var ok = L.grade(q, given);
    D.answered = true; D.seen++; if (ok) D.right++;

    if (D.mode === 'drill') L.answer(D.id, ok);
    else D.results.push(ok);

    if (q.type === 'mcq') {
      var opts = D.host.querySelectorAll('.opt');
      Array.prototype.forEach.call(opts, function (o) {
        var i = +o.getAttribute('data-i');
        o.classList.remove('sel');
        if (i === q.correct) o.classList.add('right');
        else if (i === given) o.classList.add('wrong');
      });
    } else if ($('sprin')) {
      $('sprin').style.borderColor = ok ? 'var(--ok)' : 'var(--bad)';
      $('sprin').readOnly = true;
    }

    var v = '<div class="verdict ' + (ok ? 'ok">Correct' : 'no">Not right') + '</div>' +
      (ok ? '' : '<div class="prose" style="margin:0 0 8px;font-size:15.4px">The answer is <b>' + L.answerShown(q) + '</b>.</div>') +
      L.stepsHTML(q);

    var foot = $('drillfoot');
    foot.insertAdjacentHTML('beforebegin', '<div class="fb" id="fb">' + v + '</div>');
    L.tex($('fb'));

    var r = D.mode === 'drill' ? L.rec(D.id) : null;
    var msg = '';
    if (r) {
      if (r.mastered && r.mastered > Date.now() - 4000) msg = '<span class="movemsg" style="color:var(--ok)">Mastered. It returns tomorrow, then at widening gaps.</span>';
      else if (ok && r.tier === q.tier + 1) msg = '<span class="movemsg">Two in a row. Moving up to tier ' + r.tier + '.</span>';
      else if (!ok && r.tier < q.tier) msg = '<span class="movemsg">Back to tier ' + r.tier + ' to rebuild it.</span>';
      else if (ok && r.tier < 5) msg = '<span class="movemsg">One more at this tier moves you up.</span>';
    }
    foot.innerHTML = '<button class="pill" id="nextq">Next question</button>' +
      (D.mode === 'drill' ? '<button class="pill ghost" id="stopq">Stop for now</button>' : '') + msg;
    $('nextq').onclick = function () { D.host.innerHTML = ''; nextQ(); };
    if ($('stopq')) $('stopq').onclick = function () {
      var id = D.id; D = null;
      paintTracks();
      var Le = L.LESSONS[id];
      lessonPage(Le); paintTree(Le.track, id);
      var el = $('drill'); if (el) el.scrollIntoView({ block: 'center' });
    };
    if (D.mode === 'drill') { paintTracks(); paintTree(L.LESSONS[D.id].track, D.id); }
  }

  /* ================================ review session ================================ */
  function reviewPage() {
    var d = L.dueList();
    if (!d.length) {
      main.innerHTML = '<div class="crumb">Spaced review</div><h1>Nothing is due</h1>' +
        '<p class="lead">A mastered skill comes back after 1 day, then 3, 7, 16, 35 and 70. Clear all three questions and the gap widens; miss one and it resets to tomorrow. ' +
        'Nothing has come around yet — master another lesson, or drill one you already own to keep it sharp.</p>' +
        '<div class="row"><button class="pill" id="backhome">Back to the map</button></div>';
      $('backhome').onclick = function () { go('/t/' + (L.st.track || 'sat')); };
      return;
    }
    main.innerHTML = '<div class="crumb">Spaced review</div><h1>' + d.length + ' skill' + (d.length > 1 ? 's' : '') + ' due</h1>' +
      '<p class="lead">Three questions each, drawn at the top of the range. This is the session that stops what you learned from quietly draining away.</p>' +
      '<div class="chips">' + d.map(function (id) { return '<span class="chip">' + L.LESSONS[id].title + '</span>'; }).join('') + '</div>' +
      '<div id="drill"><button class="pill" id="startrev">Start review</button></div>';
    L.tex(main);
    $('startrev').onclick = function () {
      var queue = [];
      d.forEach(function (id) {
        for (var k = 0; k < 3; k++) { var q = L.draw(id, k === 0 ? 4 : 5); if (q) queue.push(q); }
      });
      D = { mode: 'review', host: $('drill'), queue: queue, idx: -1, seen: 0, right: 0, results: [], byLesson: {} };
      reviewNext();
    };
  }
  function reviewNext() {
    if (D.idx >= 0) {
      var prev = D.queue[D.idx];
      (D.byLesson[prev.lesson] = D.byLesson[prev.lesson] || []).push(D.results[D.results.length - 1]);
    }
    D.idx++;
    if (D.idx >= D.queue.length) return reviewDone();
    D.q = D.queue[D.idx]; D.given = null; D.answered = false;
    paintQ();
  }
  function reviewDone() {
    var rows = Object.keys(D.byLesson).map(function (id) {
      var res = D.byLesson[id], all = res.every(function (x) { return x; });
      L.reviewed(id, all);
      var r = L.rec(id);
      return '<tr><td class="nm">' + L.LESSONS[id].title + '</td><td>' + res.filter(Boolean).length + ' of ' + res.length +
        '</td><td>' + (all ? 'next in ' + L.BOXES[r.box] + ' days' : 'back tomorrow') + '</td></tr>';
    }).join('');
    D = null;
    paintTracks();
    main.innerHTML = '<div class="crumb">Spaced review</div><h1>Review done</h1>' +
      '<table class="styles"><tr><th>Skill</th><th>Score</th><th>Next</th></tr>' + rows + '</table>' +
      '<div class="row"><button class="pill" id="backhome">Back to the map</button></div>';
    $('backhome').onclick = function () { go('/t/' + (L.st.track || 'sat')); };
  }

  /* ================================ calculator ================================ */
  var desmos = null;
  $('calcbtn').onclick = function () {
    var w = $('calcwrap'), showing = w.classList.contains('hide');
    w.classList.toggle('hide');
    if (showing && !desmos && window.Desmos) {
      desmos = window.Desmos.GraphingCalculator($('calcbody'), { keypad: true, expressions: true, settingsMenu: true, border: false });
    }
    if (showing && desmos) setTimeout(function () { desmos.resize(); }, 30);
  };
  $('calcx').onclick = function () { $('calcwrap').classList.add('hide'); };
  (function () {
    var drag = null, w = $('calcwrap');
    $('calchead').addEventListener('mousedown', function (e) {
      if (e.target.tagName === 'BUTTON') return;
      var r = w.getBoundingClientRect();
      drag = { k: 'm', x: e.clientX, y: e.clientY, l: r.left, t: r.top };
      w.style.bottom = 'auto'; w.style.left = r.left + 'px'; w.style.top = r.top + 'px';
      e.preventDefault();
    });
    $('calcrsz').addEventListener('mousedown', function (e) {
      drag = { k: 's', x: e.clientX, y: e.clientY, w: w.offsetWidth, h: w.offsetHeight };
      e.preventDefault();
    });
    document.addEventListener('mousemove', function (e) {
      if (!drag) return;
      if (drag.k === 'm') {
        w.style.left = Math.max(0, Math.min(window.innerWidth - 140, drag.l + e.clientX - drag.x)) + 'px';
        w.style.top = Math.max(52, Math.min(window.innerHeight - 60, drag.t + e.clientY - drag.y)) + 'px';
      } else {
        w.style.width = Math.max(300, drag.w + e.clientX - drag.x) + 'px';
        w.style.height = Math.max(260, drag.h + e.clientY - drag.y) + 'px';
        if (desmos) desmos.resize();
      }
    });
    document.addEventListener('mouseup', function () { if (drag && drag.k === 's' && desmos) desmos.resize(); drag = null; });
  })();

  /* ================================ keyboard ================================ */
  document.addEventListener('keydown', function (e) {
    if (!D) return;
    if (e.target.closest && e.target.closest('#calcwrap')) return;
    if (e.target.isContentEditable) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') {
      if (e.key === 'Enter') { var b = $('checkbtn') || $('nextq'); if (b) b.click(); e.preventDefault(); }
      return;
    }
    if (!D.answered && D.q && D.q.type === 'mcq' && /^[a-dA-D]$/.test(e.key)) {
      var i = 'abcd'.indexOf(e.key.toLowerCase());
      var o = D.host.querySelector('.opt[data-i="' + i + '"]');
      if (o) o.click();
      e.preventDefault(); return;
    }
    if (e.key === 'Enter') { var n = $('checkbtn') || $('nextq'); if (n) n.click(); e.preventDefault(); }
  });

  /* ================================ go ================================ */
  route();
})();
