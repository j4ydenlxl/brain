/* engine.js — the teaching engine.
   Holds: the lesson registry, the question registry for the non-SAT tracks (SAT drills come
   from the /sat generators), the mastery ladder, the spaced-review scheduler, and the shared
   question renderer/grader. Everything persists in localStorage; nothing leaves the browser. */
(function (root) {
  'use strict';

  var S = root.SAT;                       // the SAT generator core: helpers + 88 generators
  var KEY = 'learn.v2';

  /* ============================== storage ============================== */
  var st = { v: 2, L: {}, open: {}, track: 'sat', last: null };
  try {
    var raw = localStorage.getItem(KEY);
    if (raw) { var p = JSON.parse(raw); if (p && p.v === 2) st = p; }
  } catch (e) {}
  var saveT = null;
  function save() {
    if (saveT) return;
    saveT = setTimeout(function () {
      saveT = null;
      try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {}
    }, 120);
  }
  function rec(id) {
    if (!st.L[id]) st.L[id] = { tier: 1, streak: 0, seen: 0, right: 0, top: 0, hist: [], mastered: 0, box: 0, due: 0, read: 0 };
    return st.L[id];
  }

  /* ============================== lesson registry ============================== */
  var LESSONS = {}, ORDER = [], TRACKS = {};
  function track(t) {                      // {id,name,blurb,units:[{id,name}]}
    TRACKS[t.id] = t; t.units = t.units || [];
    return t;
  }
  function lesson(o) {
    LESSONS[o.id] = o;
    ORDER.push(o.id);
    var T = TRACKS[o.track];
    if (T) {
      var u = null;
      for (var i = 0; i < T.units.length; i++) if (T.units[i].id === o.unit) u = T.units[i];
      if (!u) { u = { id: o.unit, name: o.unitName || o.unit, lessons: [] }; T.units.push(u); }
      if (o.unitName) u.name = o.unitName;
      u.lessons.push(o.id);
    }
    return o;
  }

  /* ============================== question registry (non-SAT tracks) ============================== */
  var GEN = {};                            // lessonId -> tier -> [fn]
  function gen(id, tiers, fn) {
    String(tiers).split('').forEach(function (t) {
      (GEN[id] = GEN[id] || {});
      (GEN[id][t] = GEN[id][t] || []).push(fn);
    });
  }
  function tiersFor(id) {
    var L = LESSONS[id];
    if (L && L.bank) return [1, 2, 3, 4, 5];
    var out = [];
    for (var t = 1; t <= 5; t++) if (GEN[id] && GEN[id][t] && GEN[id][t].length) out.push(t);
    return out;
  }
  function hasDrill(id) { return tiersFor(id).length > 0; }

  var SATDIFF = { 1: 'E', 2: 'E', 3: 'M', 4: 'H', 5: 'H' };
  var uid = 0;

  /* draw one question for a lesson at a tier; falls back to the nearest tier that exists */
  function draw(id, tier) {
    var L = LESSONS[id], q = null, i;
    if (L && L.bank) {
      var sk = L.bank.skill, d = SATDIFF[tier] || 'M';
      for (i = 0; i < 8 && !q; i++) {
        if (S.have(sk, d)) q = S.build(sk, d);
        if (!q) d = d === 'H' ? 'M' : (d === 'M' ? 'E' : 'M');
      }
      if (q) { q.tier = tier; q.lesson = id; }
      return q;
    }
    var avail = tiersFor(id);
    if (!avail.length) return null;
    var use = avail.indexOf(tier) >= 0 ? tier : avail.reduce(function (a, b) {
      return Math.abs(b - tier) < Math.abs(a - tier) ? b : a;
    });
    var fns = GEN[id][use];
    for (i = 0; i < 8 && !q; i++) { try { q = fns[Math.floor(Math.random() * fns.length)](use); } catch (e) { q = null; } }
    if (!q) return null;
    q.tier = use; q.lesson = id;
    q.id = 'q' + (++uid);
    if (q.spr) { q.type = 'spr'; q.show = q.show || S.sprShow(q.value); }
    else q.type = 'mcq';
    return q;
  }

  /* a batch with no repeated stems, for a set of lessons (used by review sessions) */
  function batch(ids, n, tierOf) {
    var out = [], seen = {}, guard = 0;
    while (out.length < n && guard++ < n * 25) {
      var id = ids[guard % ids.length];
      var q = draw(id, tierOf ? tierOf(id) : 4);
      if (!q) continue;
      var k = (q.stem || '') + '|' + (q.prompt || '');
      if (seen[k]) continue;
      seen[k] = 1; out.push(q);
    }
    return out;
  }

  /* ============================== the ladder ============================== */
  /* Climb on two in a row, fall one tier on a miss, and never fall below tier 1.
     Mastery needs both: four correct answered at the top tier, and 80% over the last ten. */
  var MASTER_TOP = 4, WINDOW = 10, WINDOW_OK = 0.8;

  function answer(id, correct) {
    var r = rec(id);
    r.seen++;
    r.hist.push(correct ? 1 : 0);
    if (r.hist.length > 20) r.hist = r.hist.slice(-20);
    if (correct) {
      r.right++;
      if (r.tier >= 5) r.top++;
      r.streak++;
      if (r.streak >= 2 && r.tier < 5) { r.tier++; r.streak = 0; }
    } else {
      r.streak = 0;
      if (r.tier > 1) r.tier--;
      if (r.mastered) { r.box = 0; r.due = Date.now() + DAY; }   // a miss on a mastered skill resets the spacing
    }
    var w = r.hist.slice(-WINDOW), acc = w.reduce(function (a, b) { return a + b; }, 0) / (w.length || 1);
    if (!r.mastered && r.top >= MASTER_TOP && w.length >= WINDOW && acc >= WINDOW_OK) {
      r.mastered = Date.now(); r.box = 0; r.due = Date.now() + DAY;
    }
    save();
    return r;
  }

  var DAY = 86400000;
  var BOXES = [1, 3, 7, 16, 35, 70];       // days
  function reviewed(id, allRight) {
    var r = rec(id);
    if (allRight) r.box = Math.min(BOXES.length - 1, r.box + 1);
    else r.box = 0;
    r.due = Date.now() + BOXES[r.box] * DAY;
    save();
    return r;
  }
  function due(id) {
    var r = st.L[id];
    return !!(r && r.mastered && r.due && r.due <= Date.now());
  }
  function dueList() {
    return ORDER.filter(due);
  }
  function progress(id) {
    var r = st.L[id];
    if (!r) return { pct: 0, state: 'new' };
    if (r.mastered) return { pct: 100, state: due(id) ? 'due' : 'done' };
    var byTier = (r.tier - 1) / 4 * 70;
    var byTop = Math.min(r.top, MASTER_TOP) / MASTER_TOP * 30;
    return { pct: Math.min(99, Math.round(byTier + byTop)), state: r.seen ? 'seen' : (r.read ? 'seen' : 'new') };
  }
  function trackStats(tid) {
    var T = TRACKS[tid], n = 0, done = 0, seen = 0;
    (T.units || []).forEach(function (u) {
      u.lessons.forEach(function (id) {
        n++;
        var r = st.L[id];
        if (r && r.mastered) done++;
        else if (r && (r.seen || r.read)) seen++;
      });
    });
    return { n: n, done: done, seen: seen };
  }

  /* ============================== rendering ============================== */
  function tex(el) {
    if (!root.renderMathInElement) return;
    try {
      root.renderMathInElement(el, {
        delimiters: [{ left: '$', right: '$', display: false }],
        throwOnError: false, ignoredTags: ['script', 'noscript', 'style', 'textarea', 'option']
      });
    } catch (e) {}
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function qHTML(q) {
    var h = '<div class="qtext">' + (q.stem || '') + '<p>' + q.prompt + '</p></div>';
    if (q.type === 'spr') {
      h += '<p class="muted" style="max-width:520px">Enter your answer. If it is a fraction that does not fit, give a decimal instead. ' +
        'If it is a decimal that does not fit, truncate or round at the fourth digit.</p>' +
        '<div class="sprbox"><input id="sprin" autocomplete="off" inputmode="text" spellcheck="false"></div>';
    } else {
      h += '<div class="opts2">' + q.choices.map(function (c, i) {
        return '<div class="opt" data-i="' + i + '"><span class="ltr">' + 'ABCD'[i] + '</span><span>' + c + '</span></div>';
      }).join('') + '</div>';
    }
    return h;
  }
  function grade(q, given) {
    if (q.type === 'spr') return S.sprOK(given, q.value);
    return given === q.correct;
  }
  function answerShown(q) {
    if (q.type === 'spr') return q.show || S.sprShow(q.value);
    return 'ABCD'[q.correct] + ') ' + q.choices[q.correct];
  }
  function stepsHTML(q) {
    var h = '<div class="steps"><ol>' + (q.expl || []).map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>';
    if (q.key) h += '<div class="take"><b>Takeaway:</b> ' + q.key + '</div>';
    return h + '</div>';
  }

  /* ============================== export ============================== */
  root.LEARN = {
    S: S, st: st, save: save, rec: rec,
    track: track, lesson: lesson, LESSONS: LESSONS, ORDER: ORDER, TRACKS: TRACKS,
    gen: gen, draw: draw, batch: batch, tiersFor: tiersFor, hasDrill: hasDrill,
    answer: answer, reviewed: reviewed, due: due, dueList: dueList,
    progress: progress, trackStats: trackStats,
    tex: tex, esc: esc, qHTML: qHTML, grade: grade, answerShown: answerShown, stepsHTML: stepsHTML,
    MASTER_TOP: MASTER_TOP, WINDOW: WINDOW, BOXES: BOXES
  };
})(window);
