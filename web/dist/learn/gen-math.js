/* gen-math.js — the symbolic toolkit the Algebra 2 / Precalculus / Calculus generators are built on.
   Exact rational arithmetic, polynomials as coefficient arrays, exact trig, derivatives and
   antiderivatives of the standard forms, plus LaTeX printers and distractor machinery.
   Everything is deterministic given its inputs; randomness lives in the generators. */
(function (root) {
  'use strict';
  var S = root.SAT;

  /* ===================================================================== numbers */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function nz(a, b) { var v = ri(a, b); return v === 0 ? nz(a, b) : v; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function pickn(a, n) { var c = a.slice(), o = []; while (o.length < n && c.length) o.push(c.splice(Math.floor(Math.random() * c.length), 1)[0]); return o; }
  function coin() { return Math.random() < 0.5; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function isInt(v) { return Math.abs(v - Math.round(v)) < 1e-9; }
  function round(v, d) { var m = Math.pow(10, d == null ? 4 : d); return Math.round(v * m) / m; }

  /* ===================================================================== rationals
     A rational is {n, d} with d > 0 and gcd reduced. */
  function R(n, d) {
    d = d == null ? 1 : d;
    if (d === 0) return { n: NaN, d: 1 };
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(n, d);
    return { n: n / g, d: d / g };
  }
  R.add = function (a, b) { return R(a.n * b.d + b.n * a.d, a.d * b.d); };
  R.sub = function (a, b) { return R(a.n * b.d - b.n * a.d, a.d * b.d); };
  R.mul = function (a, b) { return R(a.n * b.n, a.d * b.d); };
  R.div = function (a, b) { return R(a.n * b.d, a.d * b.n); };
  R.neg = function (a) { return R(-a.n, a.d); };
  R.val = function (a) { return a.n / a.d; };
  R.eq = function (a, b) { return a.n === b.n && a.d === b.d; };
  R.tex = function (a, opts) {
    if (a.d === 1) return String(a.n);
    var s = (a.n < 0 ? '-' : '') + '\\frac{' + Math.abs(a.n) + '}{' + a.d + '}';
    return (opts && opts.paren && a.n < 0) ? '\\left(' + s + '\\right)' : s;
  };
  /* a decimal-or-fraction printable answer, for SPR-style items */
  function frTex(n, d) { return R.tex(R(n, d)); }

  /* ===================================================================== polynomials
     A polynomial is a DESCENDING coefficient array: [2,-3,1] means 2x^2 - 3x + 1.
     Coefficients are plain numbers (integers in nearly every generated item). */
  var P = {};
  P.deg = function (p) { var i = 0; while (i < p.length - 1 && p[i] === 0) i++; return p.length - 1 - i; };
  P.trim = function (p) { var q = p.slice(); while (q.length > 1 && q[0] === 0) q.shift(); return q; };
  P.lead = function (p) { return P.trim(p)[0]; };
  P.eval = function (p, x) { var v = 0; for (var i = 0; i < p.length; i++) v = v * x + p[i]; return v; };
  P.add = function (a, b) {
    var n = Math.max(a.length, b.length), o = [];
    for (var i = 0; i < n; i++) o.push((a[a.length - n + i] || 0) + (b[b.length - n + i] || 0));
    return P.trim(o);
  };
  P.scale = function (p, k) { return p.map(function (c) { return c * k; }); };
  P.sub = function (a, b) { return P.add(a, P.scale(b, -1)); };
  P.mul = function (a, b) {
    var o = new Array(a.length + b.length - 1).join('0').split('').map(Number);
    o = []; for (var i = 0; i < a.length + b.length - 1; i++) o.push(0);
    for (var i2 = 0; i2 < a.length; i2++) for (var j = 0; j < b.length; j++) o[i2 + j] += a[i2] * b[j];
    return P.trim(o);
  };
  P.pow = function (p, k) { var o = [1]; for (var i = 0; i < k; i++) o = P.mul(o, p); return o; };
  P.fromRoots = function (roots, lead) {              /* monic-by-default expansion */
    var o = [1];
    roots.forEach(function (r) { o = P.mul(o, [1, -r]); });
    return P.scale(o, lead == null ? 1 : lead);
  };
  P.deriv = function (p) {
    var n = P.deg(p), q = P.trim(p), o = [];
    for (var i = 0; i < q.length - 1; i++) o.push(q[i] * (n - i));
    return o.length ? o : [0];
  };
  /* antiderivative; returns {p:coeffs, note} with the +C left to the caller */
  P.integ = function (p) {
    var q = P.trim(p), n = q.length, o = [];
    for (var i = 0; i < n; i++) o.push(R(q[i], n - i));      /* rational coefficients */
    o.push(R(0));
    return o;
  };
  /* synthetic division by (x - r): returns {q: quotient coeffs, rem: remainder} */
  P.synth = function (p, r) {
    var q = P.trim(p), out = [q[0]];
    for (var i = 1; i < q.length; i++) out.push(q[i] + out[i - 1] * r);
    var rem = out.pop();
    return { q: out, rem: rem };
  };
  /* long division of a by b: {q, r} */
  P.div = function (a, b) {
    a = P.trim(a).slice(); b = P.trim(b);
    var q = [], da = P.deg(a), db = P.deg(b);
    if (da < db) return { q: [0], r: a };
    for (var k = 0; k <= da - db; k++) {
      var c = a[k] / b[0];
      q.push(c);
      for (var j = 0; j < b.length; j++) a[k + j] -= c * b[j];
    }
    return { q: P.trim(q), r: P.trim(a.slice(da - db + 1)) };
  };
  /* rational-root search over small integers; returns every integer root with multiplicity 1 listing */
  P.introots = function (p, lim) {
    lim = lim || 12; var out = [];
    for (var r = -lim; r <= lim; r++) if (Math.abs(P.eval(p, r)) < 1e-9) out.push(r);
    return out;
  };

  /* ---- LaTeX for a polynomial ---- */
  function cTex(c, first, varPart) {
    /* coefficient in front of a variable power; handles 1, -1, signs and spacing */
    var sign = c < 0 ? '-' : '+';
    var a = Math.abs(c);
    var body;
    if (!varPart) body = fmtNum(a);
    else if (a === 1) body = varPart;
    else body = fmtNum(a) + varPart;
    if (first) return (c < 0 ? '-' : '') + body;
    return ' ' + sign + ' ' + body;
  }
  function fmtNum(v) {
    if (isInt(v)) return String(Math.round(v));
    for (var d = 2; d <= 64; d++) {                 /* recover a small fraction before giving a decimal */
      var n = Math.round(v * d);
      if (Math.abs(n / d - v) < 1e-9) return R.tex(R(n, d));
    }
    return String(round(v, 6));
  }
  function powVar(v, k) { return k === 0 ? '' : (k === 1 ? v : v + '^{' + k + '}'); }
  P.tex = function (p, v) {
    v = v || 'x';
    var q = P.trim(p), n = q.length - 1, s = '', first = true;
    for (var i = 0; i < q.length; i++) {
      var c = q[i], k = n - i;
      if (c === 0) continue;
      s += cTex(c, first, powVar(v, k));
      first = false;
    }
    return s || '0';
  };
  /* factored form from integer roots: (x-2)(x+3)^2 style */
  P.texFactored = function (roots, lead, v) {
    v = v || 'x';
    var counts = {}, order = [];
    roots.forEach(function (r) { if (!(r in counts)) { counts[r] = 0; order.push(r); } counts[r]++; });
    var s = (lead == null || lead === 1) ? '' : (lead === -1 ? '-' : fmtNum(lead));
    order.forEach(function (r) {
      r = +r;
      var inner = r === 0 ? v : (v + (r < 0 ? ' + ' : ' - ') + Math.abs(r));
      var f = r === 0 ? v : '(' + inner + ')';
      s += f + (counts[r] > 1 ? '^{' + counts[r] + '}' : '');
    });
    return s || '1';
  };

  /* ===================================================================== exact trig
     Angles stored as twelfths of a turn where possible: k * pi/6, and k * pi/4. */
  var EXACT = {           /* degrees -> {sin, cos, tan} in LaTeX, and numeric values */
    0:   { s: '0', c: '1', t: '0' },
    30:  { s: '\\frac{1}{2}', c: '\\frac{\\sqrt{3}}{2}', t: '\\frac{\\sqrt{3}}{3}' },
    45:  { s: '\\frac{\\sqrt{2}}{2}', c: '\\frac{\\sqrt{2}}{2}', t: '1' },
    60:  { s: '\\frac{\\sqrt{3}}{2}', c: '\\frac{1}{2}', t: '\\sqrt{3}' },
    90:  { s: '1', c: '0', t: '\\text{undefined}' },
    120: { s: '\\frac{\\sqrt{3}}{2}', c: '-\\frac{1}{2}', t: '-\\sqrt{3}' },
    135: { s: '\\frac{\\sqrt{2}}{2}', c: '-\\frac{\\sqrt{2}}{2}', t: '-1' },
    150: { s: '\\frac{1}{2}', c: '-\\frac{\\sqrt{3}}{2}', t: '-\\frac{\\sqrt{3}}{3}' },
    180: { s: '0', c: '-1', t: '0' },
    210: { s: '-\\frac{1}{2}', c: '-\\frac{\\sqrt{3}}{2}', t: '\\frac{\\sqrt{3}}{3}' },
    225: { s: '-\\frac{\\sqrt{2}}{2}', c: '-\\frac{\\sqrt{2}}{2}', t: '1' },
    240: { s: '-\\frac{\\sqrt{3}}{2}', c: '-\\frac{1}{2}', t: '\\sqrt{3}' },
    270: { s: '-1', c: '0', t: '\\text{undefined}' },
    300: { s: '-\\frac{\\sqrt{3}}{2}', c: '\\frac{1}{2}', t: '-\\sqrt{3}' },
    315: { s: '-\\frac{\\sqrt{2}}{2}', c: '\\frac{\\sqrt{2}}{2}', t: '-1' },
    330: { s: '-\\frac{1}{2}', c: '\\frac{\\sqrt{3}}{2}', t: '-\\frac{\\sqrt{3}}{3}' }
  };
  var DEGS = Object.keys(EXACT).map(Number);
  function exact(deg, fn) { var e = EXACT[((deg % 360) + 360) % 360]; return e ? e[fn] : null; }
  /* radian LaTeX for a degree measure that is a nice multiple */
  function radTex(deg) {
    deg = ((deg % 360) + 360) % 360;
    if (deg === 0) return '0';
    var n = deg, d = 180, g = gcd(n, d); n /= g; d /= g;
    if (d === 1) return n === 1 ? '\\pi' : n + '\\pi';
    return '\\frac{' + (n === 1 ? '' : n) + '\\pi}{' + d + '}';
  }
  function radVal(deg) { return deg * Math.PI / 180; }
  function quadrantOf(deg) { deg = ((deg % 360) + 360) % 360; return deg < 90 ? 1 : deg < 180 ? 2 : deg < 270 ? 3 : 4; }
  function refAngle(deg) {
    deg = ((deg % 360) + 360) % 360;
    return deg <= 90 ? deg : deg <= 180 ? 180 - deg : deg <= 270 ? deg - 180 : 360 - deg;
  }
  /* Pythagorean triples for right-triangle and ratio items */
  var TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [12, 35, 37], [28, 45, 53]];

  /* ===================================================================== calculus forms
     A "form" is a function type with its own derivative and antiderivative, printed in TeX.
     Each returns {f, df, F} where F may be null when no elementary antiderivative is wanted. */
  function formPower(a, n) {                     /* a*x^n */
    var f = (a === 1 ? '' : (a === -1 ? '-' : fmtNum(a))) + powVar('x', n);
    if (n === 0) f = fmtNum(a);
    var dc = a * n;
    var df = n === 0 ? '0' : (dc === 1 ? '' : (dc === -1 ? '-' : fmtNum(dc))) + powVar('x', n - 1);
    if (n - 1 === 0) df = fmtNum(dc);
    var F = n === -1 ? fmtNum(a) + '\\ln|x|' : (function () {
      var c = R(a, n + 1);
      var cs = c.d === 1 ? (c.n === 1 ? '' : (c.n === -1 ? '-' : String(c.n))) : R.tex(c);
      return cs + powVar('x', n + 1);
    })();
    return { f: f, df: df, F: F };
  }
  var TRIGD = {                                   /* d/dx of the six, and their antiderivatives */
    '\\sin x': { d: '\\cos x', F: '-\\cos x' },
    '\\cos x': { d: '-\\sin x', F: '\\sin x' },
    '\\tan x': { d: '\\sec^2 x', F: '-\\ln|\\cos x|' },
    '\\cot x': { d: '-\\csc^2 x', F: '\\ln|\\sin x|' },
    '\\sec x': { d: '\\sec x\\tan x', F: '\\ln|\\sec x + \\tan x|' },
    '\\csc x': { d: '-\\csc x\\cot x', F: '-\\ln|\\csc x + \\cot x|' }
  };
  var INVD = {
    '\\arcsin x': '\\dfrac{1}{\\sqrt{1-x^2}}',
    '\\arccos x': '-\\dfrac{1}{\\sqrt{1-x^2}}',
    '\\arctan x': '\\dfrac{1}{1+x^2}'
  };

  /* ===================================================================== choice assembly */
  /* Wrap LaTeX strings as math and build a 4-choice item. `correct` and each wrong are raw TeX. */
  function mcTex(correct, wrong) {
    var c = '$' + correct + '$';
    var w = (wrong || []).filter(function (x) { return x != null && x !== correct; })
      .map(function (x) { return '$' + x + '$'; });
    return S.mc(c, w);
  }
  /* numeric choices rendered through fmtNum by default */
  function mcVal(correct, wrong, fmt) {
    return S.mcNum(correct, wrong || [], fmt || fmtNum);
  }
  /* plain-text (non-math) choices */
  function mcText(correct, wrong) { return S.mc(correct, wrong || []); }

  /* a small spread of numeric distractors around a value */
  function around(v, opts) {
    opts = opts || {};
    var o = [v + 1, v - 1, v + 2, v - 2, -v, 2 * v, v / 2];
    if (opts.extra) o = opts.extra.concat(o);
    return o.filter(function (x) { return isFinite(x) && x !== v; });
  }

  /* interval notation from endpoints */
  function interval(a, b, ao, bo) {
    var l = (ao ? '(' : '[') + (a === -Infinity ? '-\\infty' : fmtNum(a));
    var r = (b === Infinity ? '\\infty' : fmtNum(b)) + (bo ? ')' : ']');
    if (a === -Infinity) l = '(-\\infty';
    if (b === Infinity) r = '\\infty)';
    return l + ',\\ ' + r;
  }
  function union() { return Array.prototype.slice.call(arguments).join(' \\cup '); }

  /* ===================================================================== export */
  root.MX = {
    gcd: gcd, ri: ri, nz: nz, pick: pick, pickn: pickn, coin: coin, shuffle: shuffle,
    isInt: isInt, round: round, fmtNum: fmtNum, powVar: powVar,
    R: R, frTex: frTex, P: P,
    EXACT: EXACT, DEGS: DEGS, exact: exact, radTex: radTex, radVal: radVal,
    quadrantOf: quadrantOf, refAngle: refAngle, TRIPLES: TRIPLES,
    formPower: formPower, TRIGD: TRIGD, INVD: INVD,
    mcTex: mcTex, mcVal: mcVal, mcText: mcText, around: around,
    interval: interval, union: union
  };
})(window);
