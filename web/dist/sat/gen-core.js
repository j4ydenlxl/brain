/* gen-core.js — shared generator machinery.
   The skill list, the skill descriptions and the per-skill difficulty weights below are the
   real ones: they were read off the College Board SAT Suite Question Bank (test=2, domains
   H/P/Q/S, 1,925 live math items) on 2026-09-19, and the archetypes each generator imitates
   were clustered from those items. No College Board item text is reproduced here; every
   question this file and its siblings build is generated fresh from the archetype. */
(function (root) {
  'use strict';

  /* ---------- random ---------- */
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function rf(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function pickn(a, n) { var c = a.slice(), o = []; while (o.length < n && c.length) o.push(c.splice(Math.floor(Math.random() * c.length), 1)[0]); return o; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function nz(a, b) { var v = ri(a, b); return v === 0 ? nz(a, b) : v; }         // nonzero int
  function coin() { return Math.random() < 0.5; }

  /* ---------- number helpers ---------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function com(n) {                                                              // 12345 -> 12,345
    var s = String(n), neg = s[0] === '-'; if (neg) s = s.slice(1);
    var p = s.split('.'), i = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '-' : '') + i + (p[1] ? '.' + p[1] : '');
  }
  function round(v, d) { var m = Math.pow(10, d == null ? 4 : d); return Math.round(v * m) / m; }
  function isInt(v) { return Math.abs(v - Math.round(v)) < 1e-9; }

  /* ---------- LaTeX helpers ---------- */
  function fr(n, d) {                                                            // reduced fraction as TeX
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(n, d); n /= g; d /= g;
    if (d === 1) return String(n);
    return (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}';
  }
  function frVal(n, d) { return n / d; }
  function sgn(v) { return v < 0 ? '-' : '+'; }
  function term(c, v) {                                                          // coefficient times variable
    if (c === 0) return '';
    if (c === 1) return v;
    if (c === -1) return '-' + v;
    return c + v;
  }
  function poly(parts) {                                                         // [[coef,'x^2'],[coef,'x'],[c,'']]
    var s = '';
    for (var i = 0; i < parts.length; i++) {
      var c = parts[i][0], v = parts[i][1];
      if (c === 0) continue;
      var t = v ? term(Math.abs(c) === 1 && v ? (c < 0 ? -1 : 1) : Math.abs(c), v) : String(Math.abs(c));
      if (v && Math.abs(c) !== 1) t = Math.abs(c) + v;
      if (v && Math.abs(c) === 1) t = v;
      if (!s) s = (c < 0 ? '-' : '') + t;
      else s += (c < 0 ? ' - ' : ' + ') + t;
    }
    return s || '0';
  }
  function lin(a, b, v) { return poly([[a, v || 'x'], [b, '']]); }               // ax+b
  function quad(a, b, c, v) { v = v || 'x'; return poly([[a, v + '^2'], [b, v], [c, '']]); }
  function money(n) { return '\\$' + com(n); }
  function pt(x, y) { return '(' + com(x) + ',\\ ' + com(y) + ')'; }

  /* ---------- multiple choice assembly ---------- */
  function mc(correct, wrong) {
    var uniq = [], seen = {};
    function add(v) { var k = String(v).replace(/\s+/g, ''); if (!seen[k]) { seen[k] = 1; uniq.push(v); } }
    add(correct);
    for (var i = 0; i < wrong.length && uniq.length < 4; i++) if (wrong[i] != null) add(wrong[i]);
    var n = 0;
    while (uniq.length < 4) add(correct + ' ' + (++n));                          // never expected; keeps 4 options
    var order = shuffle(uniq.slice(0, 4));
    return { choices: order, correct: order.indexOf(correct) };
  }
  /* numeric MC: correct value plus numeric distractors, rendered through fmt */
  function mcNum(correct, wrong, fmt) {
    fmt = fmt || function (v) { return com(v); };
    var seen = {}, list = [];
    seen[correct] = 1; list.push(correct);
    for (var i = 0; i < wrong.length; i++) {
      var w = wrong[i];
      if (w == null || !isFinite(w) || seen[w]) continue;
      seen[w] = 1; list.push(w);
      if (list.length === 4) break;
    }
    var d = 1;
    while (list.length < 4) { var c = correct + d * (coin() ? 1 : -1); d++; if (!seen[c]) { seen[c] = 1; list.push(c); } }
    var order = shuffle(list.slice(0, 4));
    return { choices: order.map(function (v) { return '$' + fmt(v) + '$'; }), correct: order.indexOf(correct) };
  }

  /* ---------- student-produced response acceptance ---------- */
  function parseSPR(s) {
    if (s == null) return null;
    s = String(s).trim().replace(/,/g, '').replace(/\s+/g, '');
    if (!s) return null;
    if (/^-?\d+\/-?\d+$/.test(s)) { var p = s.split('/'); var d = +p[1]; if (!d) return null; return +p[0] / d; }
    if (/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return +s;
    return null;
  }
  /* SAT rule: exact value, or a decimal truncated or rounded at the fourth decimal place. */
  function sprOK(input, target) {
    var v = parseSPR(input);
    if (v == null) return false;
    if (v === target) return true;
    var tol = 1.0001e-4 * Math.max(1, Math.abs(target) / 1e4);
    if (Math.abs(v - target) <= tol) return true;
    var t4 = Math.floor(Math.abs(target) * 1e4) / 1e4 * (target < 0 ? -1 : 1);   // truncated form
    return Math.abs(v - t4) <= 1e-9;
  }
  function sprShow(target) {                                                     // canonical printable answer
    if (isInt(target)) return String(Math.round(target));
    var r = round(target, 4);
    for (var d = 2; d <= 99; d++) {
      var n = Math.round(target * d);
      if (Math.abs(n / d - target) < 1e-9 && gcd(n, d) === 1) return n + '/' + d + '  (or ' + r + ')';
    }
    return String(r);
  }

  /* ---------- SVG figures ---------- */
  function svg(w, h, inner, extra) {
    return '<div class="figwrap"><svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" ' +
      'xmlns="http://www.w3.org/2000/svg" font-family="Georgia,serif" font-size="13" ' +
      (extra || '') + '>' + inner + '</svg></div>';
  }
  function axes(o) {
    // o: {w,h,xmin,xmax,ymin,ymax,step,plot:[{type,...}]}
    var w = o.w || 340, h = o.h || 300, pad = 30;
    var xmin = o.xmin, xmax = o.xmax, ymin = o.ymin, ymax = o.ymax;
    var X = function (x) { return pad + (x - xmin) / (xmax - xmin) * (w - 2 * pad); };
    var Y = function (y) { return h - pad - (y - ymin) / (ymax - ymin) * (h - 2 * pad); };
    var g = '', i;
    var sx = o.stepx || 1, sy = o.stepy || 1;
    for (i = Math.ceil(xmin / sx) * sx; i <= xmax; i += sx)
      g += '<line x1="' + X(i) + '" y1="' + pad + '" x2="' + X(i) + '" y2="' + (h - pad) + '" stroke="#e3e3e3"/>';
    for (i = Math.ceil(ymin / sy) * sy; i <= ymax; i += sy)
      g += '<line x1="' + pad + '" y1="' + Y(i) + '" x2="' + (w - pad) + '" y2="' + Y(i) + '" stroke="#e3e3e3"/>';
    g += '<line x1="' + pad + '" y1="' + Y(0) + '" x2="' + (w - pad) + '" y2="' + Y(0) + '" stroke="#1e1e1e" stroke-width="1.4"/>';
    g += '<line x1="' + X(0) + '" y1="' + pad + '" x2="' + X(0) + '" y2="' + (h - pad) + '" stroke="#1e1e1e" stroke-width="1.4"/>';
    var lx = o.labelx == null ? sx * (o.labelEvery || 1) : o.labelx;
    for (i = Math.ceil(xmin / lx) * lx; i <= xmax; i += lx) if (Math.abs(i) > 1e-9)
      g += '<text x="' + X(i) + '" y="' + (Y(0) + 15) + '" text-anchor="middle" fill="#444">' + com(round(i, 4)) + '</text>';
    for (i = Math.ceil(ymin / lx) * lx; i <= ymax; i += lx) if (Math.abs(i) > 1e-9)
      g += '<text x="' + (X(0) - 6) + '" y="' + (Y(i) + 4) + '" text-anchor="end" fill="#444">' + com(round(i, 4)) + '</text>';
    g += '<text x="' + (w - pad + 8) + '" y="' + (Y(0) + 4) + '" font-style="italic">x</text>';
    g += '<text x="' + (X(0) - 4) + '" y="' + (pad - 10) + '" font-style="italic" text-anchor="middle">y</text>';
    (o.plot || []).forEach(function (p) {
      if (p.type === 'line') {
        var pts = [];
        for (var t = 0; t <= 60; t++) {
          var x = xmin + (xmax - xmin) * t / 60, y = p.f(x);
          if (y >= ymin - 5 && y <= ymax + 5) pts.push(X(x) + ',' + Y(Math.max(ymin, Math.min(ymax, y))));
        }
        g += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + (p.color || '#324dc7') + '" stroke-width="2.2"/>';
      } else if (p.type === 'dots') {
        p.pts.forEach(function (q) { g += '<circle cx="' + X(q[0]) + '" cy="' + Y(q[1]) + '" r="3.4" fill="' + (p.color || '#1e1e1e') + '"/>'; });
      } else if (p.type === 'open') {
        p.pts.forEach(function (q) { g += '<circle cx="' + X(q[0]) + '" cy="' + Y(q[1]) + '" r="4" fill="#fff" stroke="#1e1e1e" stroke-width="1.6"/>'; });
      }
    });
    return svg(w, h, g);
  }

  /* ---------- the real skill table (read from the live question bank) ---------- */
  var SKILLS = {
    'H.A.': { dom: 'Algebra', sd: 'Linear equations in one variable', n: { E: 64, M: 28, H: 20 } },
    'H.B.': { dom: 'Algebra', sd: 'Linear functions', n: { E: 82, M: 56, H: 32 } },
    'H.C.': { dom: 'Algebra', sd: 'Linear equations in two variables', n: { E: 56, M: 41, H: 33 } },
    'H.D.': { dom: 'Algebra', sd: 'Systems of two linear equations in two variables', n: { E: 38, M: 46, H: 42 } },
    'H.E.': { dom: 'Algebra', sd: 'Linear inequalities in one or two variables', n: { E: 29, M: 29, H: 20 } },
    'P.A.': { dom: 'Advanced Math', sd: 'Equivalent expressions', n: { E: 43, M: 39, H: 34 } },
    'P.B.': { dom: 'Advanced Math', sd: 'Nonlinear equations in one variable and systems of equations in two variables', n: { E: 43, M: 60, H: 62 } },
    'P.C.': { dom: 'Advanced Math', sd: 'Nonlinear functions', n: { E: 65, M: 92, H: 102 } },
    'Q.A.': { dom: 'Problem-Solving and Data Analysis', sd: 'Ratios, rates, proportional relationships, and units', n: { E: 42, M: 32, H: 19 } },
    'Q.B.': { dom: 'Problem-Solving and Data Analysis', sd: 'Percentages', n: { E: 28, M: 22, H: 34 } },
    'Q.C.': { dom: 'Problem-Solving and Data Analysis', sd: 'One-variable data: Distributions and measures of center and spread', n: { E: 37, M: 21, H: 26 } },
    'Q.D.': { dom: 'Problem-Solving and Data Analysis', sd: 'Two-variable data: Models and scatterplots', n: { E: 34, M: 26, H: 11 } },
    'Q.E.': { dom: 'Problem-Solving and Data Analysis', sd: 'Probability and conditional probability', n: { E: 24, M: 14, H: 11 } },
    'Q.F.': { dom: 'Problem-Solving and Data Analysis', sd: 'Inference from sample statistics and margin of error', n: { E: 10, M: 13, H: 5 } },
    'Q.G.': { dom: 'Problem-Solving and Data Analysis', sd: 'Evaluating statistical claims: Observational studies and experiments', n: { E: 2, M: 3, H: 7 } },
    'S.A.': { dom: 'Geometry and Trigonometry', sd: 'Area and volume', n: { E: 36, M: 38, H: 36 } },
    'S.B.': { dom: 'Geometry and Trigonometry', sd: 'Lines, angles, and triangles', n: { E: 40, M: 29, H: 33 } },
    'S.C.': { dom: 'Geometry and Trigonometry', sd: 'Right triangles and trigonometry', n: { E: 8, M: 19, H: 42 } },
    'S.D.': { dom: 'Geometry and Trigonometry', sd: 'Circles', n: { E: 4, M: 22, H: 41 } }
  };
  var DOMAINS = ['Algebra', 'Advanced Math', 'Problem-Solving and Data Analysis', 'Geometry and Trigonometry'];

  /* ---------- registry ---------- */
  var REG = {};                                                                  // skill -> diff -> [fn]
  function reg(skill, diffs, fn) {
    String(diffs).split('').forEach(function (d) {
      (REG[skill] = REG[skill] || {});
      (REG[skill][d] = REG[skill][d] || []).push(fn);
    });
  }
  function have(skill, diff) { return !!(REG[skill] && REG[skill][diff] && REG[skill][diff].length); }

  /* pick a (skill,diff) pair in proportion to the live bank, restricted to what we can build */
  function weighted(filter) {
    var pool = [];
    Object.keys(SKILLS).forEach(function (sk) {
      if (filter && filter.skills && filter.skills.length && filter.skills.indexOf(sk) < 0) return;
      if (filter && filter.domains && filter.domains.length && filter.domains.indexOf(SKILLS[sk].dom) < 0) return;
      ['E', 'M', 'H'].forEach(function (d) {
        if (filter && filter.diffs && filter.diffs.length && filter.diffs.indexOf(d) < 0) return;
        if (!have(sk, d)) return;
        pool.push({ sk: sk, d: d, w: SKILLS[sk].n[d] });
      });
    });
    if (!pool.length) return null;
    var tot = pool.reduce(function (a, b) { return a + b.w; }, 0), r = Math.random() * tot;
    for (var i = 0; i < pool.length; i++) { r -= pool[i].w; if (r <= 0) return pool[i]; }
    return pool[pool.length - 1];
  }

  var uid = 0;
  function build(sk, d) {
    var fns = REG[sk][d], q = null, tries = 0;
    while (!q && tries++ < 6) { try { q = pick(fns)(d); } catch (e) { q = null; } }
    if (!q) return null;
    q.skill = sk; q.diff = d; q.sd = SKILLS[sk].sd; q.dom = SKILLS[sk].dom;
    q.id = 'q' + (++uid);
    if (q.spr) { q.type = 'spr'; q.show = q.show || sprShow(q.value); }
    else q.type = 'mcq';
    return q;
  }

  /* one question honouring a filter */
  function one(filter) {
    for (var t = 0; t < 40; t++) {
      var w = weighted(filter);
      if (!w) return null;
      var q = build(w.sk, w.d);
      if (q) return q;
    }
    return null;
  }

  /* n questions: proportional to the live bank, no immediate repeats of the same stem */
  function many(n, filter) {
    var out = [], seen = {}, guard = 0;
    while (out.length < n && guard++ < n * 30) {
      var q = one(filter);
      if (!q) break;
      var key = (q.stem || '') + '|' + (q.prompt || '');
      if (seen[key]) continue;
      seen[key] = 1;
      out.push(q);
    }
    return out;
  }

  root.SAT = {
    ri: ri, rf: rf, pick: pick, pickn: pickn, shuffle: shuffle, nz: nz, coin: coin,
    gcd: gcd, com: com, round: round, isInt: isInt,
    fr: fr, frVal: frVal, sgn: sgn, term: term, poly: poly, lin: lin, quad: quad, money: money, pt: pt,
    mc: mc, mcNum: mcNum,
    parseSPR: parseSPR, sprOK: sprOK, sprShow: sprShow,
    svg: svg, axes: axes,
    SKILLS: SKILLS, DOMAINS: DOMAINS,
    reg: reg, one: one, many: many, build: build, have: have,
    count: function () { var c = 0; Object.keys(REG).forEach(function (s) { Object.keys(REG[s]).forEach(function (d) { c += REG[s][d].length; }); }); return c; }
  };
})(window);
