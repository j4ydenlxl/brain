/* gen-pc1.js — question generators for Precalculus Unit 1 (functions).
   Every lesson gets five tiers; every tier has one or more families that build a fresh
   question each time they are called. Nothing is drawn from a fixed bank. */
(function (L, M) {
  'use strict';
  var P = M.P, ri = M.ri, nz = M.nz, pick = M.pick, coin = M.coin, fmt = M.fmtNum;
  var iv = M.interval, un = M.union, mcTex = M.mcTex, mcVal = M.mcVal, mcText = M.mcText;
  var INF = Infinity;

  function sg(n) { return (n < 0 ? ' - ' : ' + ') + Math.abs(n); }
  /* an anchor point whose coordinates stay distinct under swapping and negating */
  function vertexPair() {
    var h = nz(-6, 6), k = nz(-8, 8);
    while (k === h || k === -h) k = nz(-8, 8);
    return [h, k];
  }
  function ct(k, v) { return (k === 1 ? '' : (k === -1 ? '-' : String(k))) + v; }   /* coefficient times a variable part */
  function shift(p, k) {                       /* p(x + k) as a coefficient array */
    var n = p.length - 1, out = [0];
    for (var i = 0; i < p.length; i++) out = P.add(out, P.scale(P.pow([1, k], n - i), p[i]));
    return P.trim(out);
  }
  function tbl(xs, ys, yl) {
    return '<table class="dtab"><tr><th>x</th>' + xs.map(function (v) { return '<td>' + v + '</td>'; }).join('') +
      '</tr><tr><th>' + (yl || 'f(x)') + '</th>' + ys.map(function (v) { return '<td>' + v + '</td>'; }).join('') + '</tr></table>';
  }
  /* every family returns through here: `_mc` is a {choices, correct} pair from the MX assemblers */
  function q(o) {
    if (o._mc) { o.choices = o._mc.choices; o.correct = o._mc.correct; delete o._mc; }
    return o;
  }

  /* ================================================================= pc.fn.def */

  L.gen('pc.fn.def', '1', function () {
    var p = [nz(-4, 5), nz(-8, 8), ri(-9, 9)], x = nz(-4, 5);
    return q({
      prompt: 'If $f(x) = ' + P.tex(p) + '$, what is $f(' + x + ')$?',
      spr: true, value: P.eval(p, x),
      expl: [
        'Substitute with brackets: $f(' + x + ') = ' + p[0] + '(' + x + ')^2' + sg(p[1]) + '(' + x + ')' + sg(p[2]) + '$.',
        'Square first: $(' + x + ')^2 = ' + (x * x) + '$, so the first term is $' + (p[0] * x * x) + '$.',
        'Middle term: $' + p[1] + '(' + x + ') = ' + (p[1] * x) + '$.',
        'Add everything: $' + (p[0] * x * x) + sg(p[1] * x) + sg(p[2]) + ' = ' + P.eval(p, x) + '$.'
      ],
      key: 'Brackets around the input, then the exponent, then the rest. The sign of a negative input survives the squaring.'
    });
  });

  L.gen('pc.fn.def', '1', function () {
    var a = nz(-3, 4), b = ri(-6, 6), x = nz(-6, 7), c = ri(-9, 9);
    var p = [a, b, c];
    return q({
      prompt: 'The function $g$ is defined by $g(t) = ' + P.tex(p).replace(/x/g, 't') + '$. Find $g(' + x + ')$.',
      spr: true, value: P.eval(p, x),
      expl: [
        'The letter inside is only a placeholder — the rule is the same whether it is called $x$ or $t$.',
        'Substitute $t = ' + x + '$: $' + a + '(' + x + ')^2' + sg(b) + '(' + x + ')' + sg(c) + '$.',
        'That is $' + (a * x * x) + sg(b * x) + sg(c) + ' = ' + P.eval(p, x) + '$.'
      ],
      key: 'A change of variable name changes nothing at all about the function.'
    });
  });

  L.gen('pc.fn.def', '2', function () {
    var p = [nz(-3, 3), ri(-5, 5), nz(-6, 6), ri(-8, 8)], x = nz(-3, 3);
    return q({
      prompt: 'If $f(x) = ' + P.tex(p) + '$, find $f(' + x + ')$.',
      spr: true, value: P.eval(p, x),
      expl: [
        'Powers of $' + x + '$: $(' + x + ')^2 = ' + (x * x) + '$ and $(' + x + ')^3 = ' + (x * x * x) + '$.',
        'Term by term: $' + (p[0] * x * x * x) + '$, $' + (p[1] * x * x) + '$, $' + (p[2] * x) + '$, $' + p[3] + '$.',
        'Sum: $' + P.eval(p, x) + '$.'
      ],
      key: 'An odd power keeps the sign of a negative input; an even power destroys it.'
    });
  });

  L.gen('pc.fn.def', '2', function () {
    var p = [nz(-3, 4), ri(-7, 7), ri(-9, 9)], m = nz(-4, 4), n = nz(-4, 4), k = ri(2, 3);
    if (m === n) n = m + 1;
    var v = k * P.eval(p, m) - P.eval(p, n);
    return q({
      prompt: 'Let $f(x) = ' + P.tex(p) + '$. What is $' + k + 'f(' + m + ') - f(' + n + ')$?',
      spr: true, value: v,
      expl: [
        '$f(' + m + ') = ' + P.eval(p, m) + '$.',
        '$f(' + n + ') = ' + P.eval(p, n) + '$.',
        'Now combine: $' + k + '(' + P.eval(p, m) + ') - (' + P.eval(p, n) + ') = ' + v + '$.'
      ],
      key: 'Evaluate each piece completely before combining. The bracket around the second value protects its sign.'
    });
  });

  L.gen('pc.fn.def', '3', function () {
    var a = nz(-6, 7), b = ri(-12, 12), r = nz(-6, 7), k = a * r + b;
    return q({
      prompt: 'If $f(x) = ' + P.tex([a, b]) + '$ and $f(x) = ' + k + '$, what is the value of $x$?',
      spr: true, value: r,
      expl: [
        'Set the rule equal to the output: $' + P.tex([a, b]) + ' = ' + k + '$.',
        'Subtract $' + b + '$ from both sides: $' + a + 'x = ' + (k - b) + '$.',
        'Divide by $' + a + '$: $x = ' + r + '$.'
      ],
      key: 'Evaluating goes input to output; solving $f(x)=k$ goes the other way and is an equation, not a substitution.'
    });
  });

  L.gen('pc.fn.def', '3', function () {
    var bnd = ri(-2, 4), a = nz(-4, 4), b = ri(-6, 6), c = nz(-3, 4), d = ri(-7, 7);
    var below = coin();
    var x = below ? bnd - ri(1, 4) : bnd + ri(0, 4);   /* the boundary belongs to the >= piece */
    var v = x < bnd ? (a * x + b) : P.eval([c, 0, d], x);
    return q({
      stem: '$f(x) = \\begin{cases} ' + P.tex([a, b]) + ' & x < ' + bnd + ' \\\\ ' + P.tex([c, 0, d]) + ' & x \\ge ' + bnd + ' \\end{cases}$',
      prompt: 'What is $f(' + x + ')$?',
      spr: true, value: v,
      expl: [
        'Decide which condition $x = ' + x + '$ satisfies: ' + (x < bnd ? '$' + x + ' < ' + bnd + '$, so the first rule.' : '$' + x + ' \\ge ' + bnd + '$, so the second rule.'),
        'Use only that rule: ' + (x < bnd
          ? '$' + a + '(' + x + ')' + sg(b) + ' = ' + v + '$.'
          : '$' + c + '(' + x + ')^2' + sg(d) + ' = ' + v + '$.'),
        'Answer: $' + v + '$.'
      ],
      key: 'Check the condition before you touch the formula. The boundary point belongs to whichever piece carries the $\\le$ or $\\ge$.'
    });
  });

  L.gen('pc.fn.def', '4', function () {
    var p = [nz(-3, 4), ri(-6, 6), ri(-8, 8)], k = nz(-5, 5);
    var res = shift(p, k);
    var wrong1 = P.add(p, [0, 0, p[0] * k * k]);                  /* forgot the middle term */
    var wrong2 = shift(p, -k);                                     /* shifted the wrong way */
    var wrong3 = P.add(p, [0, 0, P.eval(p, k)]);
    return q({
      prompt: 'If $f(x) = ' + P.tex(p) + '$, which expression equals $f(x' + sg(k) + ')$?',
      choices: null, correct: null,
      _mc: mcTex(P.tex(res), [P.tex(wrong1), P.tex(wrong2), P.tex(wrong3), P.tex(P.add(p, [0, 2 * p[0] * k, 0])), P.tex(p)]),
      expl: [
        'Substitute the whole expression with brackets: $' + p[0] + '(x' + sg(k) + ')^2' + sg(p[1]) + '(x' + sg(k) + ')' + sg(p[2]) + '$.',
        'Expand the square: $(x' + sg(k) + ')^2 = x^2' + sg(2 * k) + 'x' + sg(k * k) + '$.',
        'Distribute and collect like terms.',
        'Result: $' + P.tex(res) + '$.'
      ],
      key: 'The middle term of the square is the one people drop. Expand, then collect — never both at once.'
    });
  });

  L.gen('pc.fn.def', '4', function () {
    var a = nz(-3, 4), b = nz(-6, 6), c = nz(-9, 9), p = [a, b, c];
    var neg = [a, -b, c];
    return q({
      prompt: 'For $f(x) = ' + P.tex(p) + '$, which expression equals $f(-x)$?',
      _mc: mcTex(P.tex(neg), [P.tex(P.scale(p, -1)), P.tex([-a, -b, c]), P.tex(p)]),
      expl: [
        'Replace every $x$ by $(-x)$, with brackets: $' + a + '(-x)^2' + sg(b) + '(-x)' + sg(c) + '$.',
        '$(-x)^2 = x^2$: the even power loses the minus sign.',
        '$' + b + '(-x) = ' + (-b === 0 ? '0' : (-b > 0 ? '+' : '') + (-b) + 'x') + '$: the odd power keeps it.',
        'So $f(-x) = ' + P.tex(neg) + '$.'
      ],
      key: 'Even powers eat the minus, odd powers carry it. That single fact decides every even/odd question later.'
    });
  });

  L.gen('pc.fn.def', '5', function () {
    var a = nz(-4, 5), b = ri(-7, 7), c = ri(-9, 9);
    /* the simplified quotient is 2ax + ah + b, built as a string */
    var hpart = (a < 0 ? ' - ' : ' + ') + (Math.abs(a) === 1 ? '' : Math.abs(a)) + 'h';
    var res = ct(2 * a, 'x') + hpart + (b === 0 ? '' : sg(b));
    var w1 = ct(2 * a, 'x') + (b === 0 ? '' : sg(b));                 /* dropped the h */
    var w2 = ct(a, 'x^{2}') + (b === 0 ? '' : sg(b));                 /* never divided by h */
    var w3 = ct(a, 'x') + hpart + (b === 0 ? '' : sg(b));             /* forgot to double the a */
    return q({
      prompt: 'For $f(x) = ' + P.tex([a, b, c]) + '$, simplify the difference quotient $\\dfrac{f(x+h) - f(x)}{h}$, where $h \\ne 0$.',
      _mc: mcTex(res, [w1, w2, w3]),
      expl: [
        '$f(x+h) = ' + a + '(x+h)^2' + sg(b) + '(x+h)' + sg(c) + ' = ' + a + 'x^2 + ' + (2 * a) + 'xh + ' + a + 'h^2' + sg(b) + 'x' + sg(b) + 'h' + sg(c) + '$.',
        'Subtract $f(x) = ' + P.tex([a, b, c]) + '$. The $x^2$, $x$ and constant terms all cancel.',
        'What is left is $' + (2 * a) + 'xh + ' + a + 'h^2' + sg(b) + 'h$ — every term has an $h$.',
        'Factor and divide: $\\dfrac{h(' + res + ')}{h} = ' + res + '$.'
      ],
      key: 'If the $h$ does not cancel, the algebra is wrong. As $h \\to 0$ this becomes the derivative, $' + (2 * a) + 'x' + (b === 0 ? '' : sg(b)) + '$.'
    });
  });

  L.gen('pc.fn.def', '5', function () {
    var r1 = nz(-6, 6), r2 = nz(-6, 6), a = pick([1, 1, 2]);
    if (r1 === r2) r2 = r1 + 2;
    var p = P.scale(P.fromRoots([r1, r2]), a);
    var k = p[2];
    return q({
      prompt: 'If $f(x) = ' + P.tex(p) + '$, what is the sum of all values of $x$ for which $f(x) = ' + k + '$?',
      spr: true, value: r1 + r2,
      expl: [
        'Set $' + P.tex(p) + ' = ' + k + '$ and move everything to one side: $' + P.tex([p[0], p[1], 0]) + ' = 0$.',
        'Factor out $x$: $x(' + P.tex([p[0], p[1]]) + ') = 0$.',
        'So $x = 0$ or $x = ' + fmt(-p[1] / p[0]) + '$.',
        'Their sum is $' + (r1 + r2) + '$.'
      ],
      key: 'Solving $f(x)=k$ can have several answers. Never divide by $x$ — that silently deletes the root $x=0$.'
    });
  });

  /* ================================================================= pc.fn.domain */

  L.gen('pc.fn.domain', '1', function () {
    var r = nz(-7, 7), a = nz(-5, 6), b = ri(-8, 8);
    return q({
      prompt: 'What is the domain of $f(x) = \\dfrac{' + P.tex([a, b]) + '}{x' + sg(-r) + '}$?',
      _mc: mcTex(un(iv(-INF, r, 1, 1), iv(r, INF, 1, 1)),
        [iv(-INF, INF, 1, 1), un(iv(-INF, -r, 1, 1), iv(-r, INF, 1, 1)), iv(r, INF, 1, 1)]),
      expl: [
        'The only restriction is the denominator, which may not be zero.',
        'Set $x' + sg(-r) + ' = 0$, so $x = ' + r + '$.',
        'Everything else is legal, so remove that one point from the real line.',
        'Domain: $' + un(iv(-INF, r, 1, 1), iv(r, INF, 1, 1)) + '$.'
      ],
      key: 'Excluding an interior point splits the domain into two intervals joined by $\\cup$.'
    });
  });

  L.gen('pc.fn.domain', '1', function () {
    var a = ri(1, 5), b = nz(-9, 9);
    var lo = -b / a;
    return q({
      prompt: 'What is the domain of $f(x) = \\sqrt{' + P.tex([a, b]) + '}$?',
      _mc: mcTex(iv(lo, INF, 0, 0), [iv(lo, INF, 1, 0), iv(-INF, lo, 0, 0), iv(-lo, INF, 0, 0)]),
      expl: [
        'A square root needs its inside to be at least zero: $' + P.tex([a, b]) + ' \\ge 0$.',
        'Subtract $' + b + '$: $' + a + 'x \\ge ' + (-b) + '$.',
        'Divide by the positive number $' + a + '$, so the inequality direction is unchanged: $x \\ge ' + fmt(lo) + '$.',
        'Domain: $' + iv(lo, INF, 0, 0) + '$.'
      ],
      key: '$\\sqrt{0}$ is perfectly legal, so the endpoint is included — a square bracket, not a round one.'
    });
  });

  L.gen('pc.fn.domain', '2', function () {
    var a = -ri(1, 4), b = nz(-9, 9);
    var hi = -b / a;
    return q({
      prompt: 'What is the domain of $f(x) = \\sqrt{' + P.tex([a, b]) + '}$?',
      _mc: mcTex(iv(-INF, hi, 0, 0), [iv(hi, INF, 0, 0), iv(-INF, hi, 0, 1), iv(-INF, -hi, 0, 0)]),
      expl: [
        'Require $' + P.tex([a, b]) + ' \\ge 0$.',
        'Subtract $' + b + '$: $' + a + 'x \\ge ' + (-b) + '$.',
        'Divide by $' + a + '$, which is negative, so the inequality <b>flips</b>: $x \\le ' + fmt(hi) + '$.',
        'Domain: $' + iv(-INF, hi, 0, 0) + '$.'
      ],
      key: 'A negative leading coefficient inside the root reverses the inequality. That flip is the entire question.'
    });
  });

  L.gen('pc.fn.domain', '2', function () {
    var r = nz(-6, 6), k = ri(1, 9);
    return q({
      prompt: 'What is the domain of $f(x) = \\sqrt[3]{x' + sg(-r) + '} + ' + k + '$?',
      _mc: mcTex(iv(-INF, INF, 1, 1), [iv(r, INF, 0, 0), un(iv(-INF, r, 1, 1), iv(r, INF, 1, 1)), iv(-r, INF, 0, 0)]),
      expl: [
        'The root here is a <b>cube</b> root, an odd root.',
        'Odd roots accept negative numbers: $\\sqrt[3]{-8} = -2$ is a perfectly good real number.',
        'There is no denominator and no logarithm, so nothing is excluded.',
        'Domain: all real numbers, $' + iv(-INF, INF, 1, 1) + '$.'
      ],
      key: 'Only <i>even</i> roots restrict the domain. Excluding negatives from a cube root is the classic false restriction.'
    });
  });

  L.gen('pc.fn.domain', '3', function () {
    var r1 = nz(-6, 6), r2 = nz(-6, 6);
    if (r1 === r2) r2 = r1 + 3;
    var lo = Math.min(r1, r2), hi = Math.max(r1, r2);
    var den = P.fromRoots([r1, r2]);
    return q({
      prompt: 'What is the domain of $f(x) = \\dfrac{x + ' + ri(1, 9) + '}{' + P.tex(den) + '}$?',
      _mc: mcTex(un(iv(-INF, lo, 1, 1), iv(lo, hi, 1, 1), iv(hi, INF, 1, 1)),
        [un(iv(-INF, lo, 1, 1), iv(hi, INF, 1, 1)), iv(lo, hi, 1, 1), un(iv(-INF, -lo, 1, 1), iv(-lo, -hi, 1, 1), iv(-hi, INF, 1, 1))]),
      expl: [
        'Only the denominator restricts anything. Factor it: $' + P.tex(den) + ' = ' + P.texFactored([r1, r2], 1) + '$.',
        'It is zero at $x = ' + r1 + '$ and $x = ' + r2 + '$.',
        'Remove both points from the real line — that leaves three intervals.',
        'Domain: $' + un(iv(-INF, lo, 1, 1), iv(lo, hi, 1, 1), iv(hi, INF, 1, 1)) + '$.'
      ],
      key: 'Two excluded points make three intervals. Factoring the denominator is the whole job.'
    });
  });

  L.gen('pc.fn.domain', '3', function () {
    var r = nz(-7, 7), a = ri(1, 4);
    return q({
      prompt: 'What is the domain of $f(x) = \\ln(' + P.tex([a, -a * r]) + ')$?',
      _mc: mcTex(iv(r, INF, 1, 0), [iv(r, INF, 0, 0), iv(-INF, r, 0, 1), un(iv(-INF, r, 1, 1), iv(r, INF, 1, 1))]),
      expl: [
        'A logarithm needs its argument <b>strictly</b> positive: $' + P.tex([a, -a * r]) + ' > 0$.',
        'Factor: $' + a + '(x' + sg(-r) + ') > 0$, so $x' + sg(-r) + ' > 0$.',
        'Therefore $x > ' + r + '$.',
        'Domain: $' + iv(r, INF, 1, 0) + '$.'
      ],
      key: 'Strictly greater than zero: $\\ln 0$ is undefined too, so the endpoint gets a round bracket.'
    });
  });

  L.gen('pc.fn.domain', '4', function () {
    var a = nz(-8, 8), b = a + ri(2, 6);          /* b > a, so the exclusion sits inside the root domain */
    return q({
      prompt: 'What is the domain of $f(x) = \\dfrac{\\sqrt{x' + sg(-a) + '}}{x' + sg(-b) + '}$?',
      _mc: mcTex(un(iv(a, b, 0, 1), iv(b, INF, 1, 0)),
        [iv(a, INF, 0, 0), un(iv(-INF, b, 1, 1), iv(b, INF, 1, 1)), un(iv(a, b, 1, 1), iv(b, INF, 1, 0))]),
      expl: [
        'Two separate conditions. The root: $x' + sg(-a) + ' \\ge 0$, so $x \\ge ' + a + '$.',
        'The denominator: $x' + sg(-b) + ' \\ne 0$, so $x \\ne ' + b + '$.',
        'Both must hold at once, so intersect: start from $' + iv(a, INF, 0, 0) + '$ and punch out $' + b + '$.',
        'Domain: $' + un(iv(a, b, 0, 1), iv(b, INF, 1, 0)) + '$.'
      ],
      key: 'Several conditions means intersection, not union. Take the strictest surviving requirement at every point.'
    });
  });

  L.gen('pc.fn.domain', '4', function () {
    var c = pick([1, 4, 9, 16, 25]), r = Math.sqrt(c);
    return q({
      prompt: 'What is the domain of $f(x) = \\sqrt{x^{2} - ' + c + '}$?',
      _mc: mcTex(un(iv(-INF, -r, 1, 0), iv(r, INF, 0, 1)),
        [iv(-r, r, 0, 0), iv(r, INF, 0, 1), un(iv(-INF, -r, 1, 1), iv(r, INF, 1, 1))]),
      expl: [
        'Require $x^2 - ' + c + ' \\ge 0$. Do <b>not</b> take a square root of both sides — factor instead.',
        '$(x - ' + r + ')(x + ' + r + ') \\ge 0$, with critical points $-' + r + '$ and $' + r + '$.',
        'Sign chart: left of $-' + r + '$ both factors are negative, so the product is positive. Between them the signs disagree, so it is negative. Right of $' + r + '$ both are positive.',
        'Domain: $' + un(iv(-INF, -r, 1, 0), iv(r, INF, 0, 1)) + '$.'
      ],
      key: 'A quadratic inside a root needs a sign chart. The answer is the outside pair of intervals whenever the parabola opens up.'
    });
  });

  L.gen('pc.fn.domain', '5', function () {
    var a = nz(-4, 4), h = nz(-6, 6), k = nz(-8, 8);
    if (h === k) k = k + 1;
    var up = a > 0;
    return q({
      prompt: 'What is the range of $f(x) = ' + (a === 1 ? '' : (a === -1 ? '-' : a)) + '(x' + sg(-h) + ')^{2}' + (k === 0 ? '' : sg(k)) + '$?',
      _mc: mcTex(up ? iv(k, INF, 0, 0) : iv(-INF, k, 0, 0),
        [up ? iv(-INF, k, 0, 0) : iv(k, INF, 0, 0), iv(h, INF, 0, 0), iv(-INF, INF, 1, 1)]),
      expl: [
        'A square is never negative: $(x' + sg(-h) + ')^2 \\ge 0$, with equality exactly at $x = ' + h + '$.',
        'Multiplying by $' + a + '$ makes the term ' + (up ? 'stay at or above zero' : 'stay at or below zero') + '.',
        'Adding $' + k + '$ shifts everything, so the output ' + (up ? 'starts at $' + k + '$ and goes up' : 'tops out at $' + k + '$ and goes down') + '.',
        'Range: $' + (up ? iv(k, INF, 0, 0) : iv(-INF, k, 0, 0)) + '$.'
      ],
      key: 'The vertex value is the boundary of the range, and the sign of $a$ decides which way the range runs from it.'
    });
  });

  L.gen('pc.fn.domain', '5', function () {
    var lo = ri(-4, -1), hi = ri(1, 5);        /* straddles zero, so the minimum is interior */
    var vals = [lo * lo, hi * hi];
    var min = 0;
    var max = Math.max.apply(null, vals);
    return q({
      prompt: 'If $f(x) = x^{2}$ with domain $' + iv(lo, hi, 0, 0) + '$, what is the range of $f$?',
      _mc: mcTex(iv(min, max, 0, 0),
        [iv(Math.min(lo * lo, hi * hi), max, 0, 0), iv(lo, hi, 0, 0), iv(0, INF, 0, 1)]),
      expl: [
        'Check the endpoints: $f(' + lo + ') = ' + (lo * lo) + '$ and $f(' + hi + ') = ' + (hi * hi) + '$.',
        'But $x = 0$ lies inside the interval, and it gives the smallest possible output, $0$ — smaller than either endpoint.',
        'The largest output is $' + max + '$ and the smallest is $' + min + '$.',
        'Range: $' + iv(min, max, 0, 0) + '$.'
      ],
      key: 'On a restricted domain, check the endpoints <i>and</i> any turning point inside. The minimum is often interior.'
    });
  });

  /* ================================================================= pc.fn.graphs */

  L.gen('pc.fn.graphs', '1', function () {
    var p = [nz(-4, 5), ri(-7, 7), nz(-9, 9)];
    return q({
      prompt: 'What is the $y$-intercept of the graph of $y = ' + P.tex(p) + '$?',
      spr: true, value: p[2],
      expl: [
        'The $y$-intercept happens where $x = 0$.',
        'Substitute: $y = ' + p[0] + '(0)^2' + sg(p[1]) + '(0)' + sg(p[2]) + '$.',
        'Both variable terms vanish, leaving $y = ' + p[2] + '$.'
      ],
      key: 'For a polynomial written in standard form the $y$-intercept is just the constant term.'
    });
  });

  L.gen('pc.fn.graphs', '1', function () {
    var r1 = nz(-7, 7), r2 = nz(-7, 7), a = pick([1, 2, -1, 3]);
    if (r1 === r2) r2 = r1 + 2;
    while (a === r1 || a === r2) a = a + 4;
    return q({
      prompt: 'At which values of $x$ does the graph of $f(x) = ' + P.texFactored([r1, r2], a) + '$ cross the $x$-axis?',
      _mc: mcText('$x = ' + r1 + '$ and $x = ' + r2 + '$',
        ['$x = ' + (-r1) + '$ and $x = ' + (-r2) + '$', '$x = ' + a + '$ only', '$x = ' + r1 + '$ only']),
      expl: [
        'An $x$-intercept is a solution of $f(x) = 0$.',
        'A product is zero exactly when one of its factors is zero.',
        'Set each factor to zero: $x' + sg(-r1) + ' = 0$ gives $x = ' + r1 + '$, and $x' + sg(-r2) + ' = 0$ gives $x = ' + r2 + '$.',
        'The leading factor $' + a + '$ is never zero, so it contributes no intercept.'
      ],
      key: 'Read the roots off factored form by flipping the sign inside each bracket. A constant factor never creates a zero.'
    });
  });

  L.gen('pc.fn.graphs', '2', function () {
    var a = nz(-4, 4), hk = vertexPair(), h = hk[0], k = hk[1];
    var b = -2 * a * h, c = a * h * h + k;
    return q({
      prompt: 'What are the coordinates of the vertex of $f(x) = ' + P.tex([a, b, c]) + '$?',
      _mc: mcText('$(' + fmt(h) + ',\\ ' + fmt(k) + ')$',
        ['$(' + fmt(-h) + ',\\ ' + fmt(k) + ')$', '$(' + fmt(k) + ',\\ ' + fmt(h) + ')$', '$(' + fmt(h) + ',\\ ' + fmt(-k) + ')$']),
      expl: [
        'The vertex sits on the axis of symmetry, at $x = -\\dfrac{b}{2a} = -\\dfrac{' + b + '}{2(' + a + ')} = ' + fmt(h) + '$.',
        'Now get the height by substituting: $f(' + fmt(h) + ') = ' + fmt(k) + '$.',
        'Vertex: $(' + fmt(h) + ',\\ ' + fmt(k) + ')$.'
      ],
      key: 'The formula gives only the $x$-coordinate. You must substitute back for the $y$-coordinate.'
    });
  });

  L.gen('pc.fn.graphs', '2', function () {
    var a = nz(-4, 4), b = nz(-10, 10) * 2, c = ri(-9, 9);
    var h = -b / (2 * a), up = a > 0;
    var inc = up ? iv(h, INF, 1, 1) : iv(-INF, h, 1, 1);
    var dec = up ? iv(-INF, h, 1, 1) : iv(h, INF, 1, 1);
    return q({
      prompt: 'On what interval is $f(x) = ' + P.tex([a, b, c]) + '$ increasing?',
      _mc: mcTex(inc, [dec, iv(-INF, INF, 1, 1), iv(-h, INF, 1, 1), iv(P.eval([a, b, c], h), INF, 1, 1)]),
      expl: [
        'The turning point is at $x = -\\dfrac{b}{2a} = ' + fmt(h) + '$.',
        'The parabola opens ' + (up ? 'upward, because $a = ' + a + ' > 0$' : 'downward, because $a = ' + a + ' < 0$') + '.',
        (up ? 'So it falls to the left of the vertex and rises to the right.' : 'So it rises to the left of the vertex and falls to the right.'),
        'Increasing on $' + inc + '$, with a round bracket because the vertex itself is neither rising nor falling.'
      ],
      key: 'Intervals of increase are stated in $x$, and the turning point is excluded.'
    });
  });

  L.gen('pc.fn.graphs', '3', function () {
    var deg = pick([3, 4, 5]), a = nz(-4, 4);
    var p = [a]; for (var i = 0; i < deg; i++) p.push(ri(-6, 6));
    var even = deg % 2 === 0, pos = a > 0;
    var right = pos ? '\\infty' : '-\\infty';
    var left = even ? right : (pos ? '-\\infty' : '\\infty');
    var say = function (l, r) { return 'as $x \\to -\\infty,\\ f(x) \\to ' + l + '$; as $x \\to \\infty,\\ f(x) \\to ' + r + '$'; };
    var all = [say('-\\infty', '\\infty'), say('\\infty', '-\\infty'), say('\\infty', '\\infty'), say('-\\infty', '-\\infty')];
    var ans = say(left, right);
    return q({
      prompt: 'Describe the end behaviour of $f(x) = ' + P.tex(p) + '$.',
      _mc: mcText(ans, all.filter(function (s) { return s !== ans; })),
      expl: [
        'End behaviour is decided entirely by the leading term, $' + P.tex([a].concat(new Array(deg).fill(0))) + '$.',
        'The degree is $' + deg + '$, which is ' + (even ? 'even, so both ends go the same way.' : 'odd, so the two ends go opposite ways.'),
        'The leading coefficient is $' + a + '$, which is ' + (pos ? 'positive, so the right end rises.' : 'negative, so the right end falls.'),
        'Therefore ' + say(left, right) + '.'
      ],
      key: 'Degree parity decides whether the ends agree; the sign of the leading coefficient decides which way the right end goes.'
    });
  });

  L.gen('pc.fn.graphs', '3', function () {
    var deg = pick([3, 4, 5, 6]);
    return q({
      prompt: 'A polynomial function has degree $' + deg + '$. What is the greatest number of turning points its graph can have?',
      spr: true, value: deg - 1,
      expl: [
        'Each turning point is a place where the direction of the graph reverses.',
        'A polynomial of degree $n$ can reverse at most $n - 1$ times.',
        'With $n = ' + deg + '$, that is $' + (deg - 1) + '$.'
      ],
      key: 'At most $n-1$ turning points, and at most $n$ real zeros. Both bounds come from the degree.'
    });
  });

  L.gen('pc.fn.graphs', '4', function () {
    var r1 = nz(-5, 5), r2 = nz(-5, 5);
    if (r1 === r2) r2 = r1 + 3;
    var lo = Math.min(r1, r2), hi = Math.max(r1, r2);
    var a = pick([1, 2, 3]);
    return q({
      prompt: 'For what values of $x$ is $f(x) = ' + P.texFactored([r1, r2], a) + '$ negative?',
      _mc: mcTex(iv(lo, hi, 1, 1), [un(iv(-INF, lo, 1, 1), iv(hi, INF, 1, 1)), iv(lo, hi, 0, 0), iv(-INF, lo, 1, 1)]),
      expl: [
        'The zeros are $x = ' + lo + '$ and $x = ' + hi + '$, and they cut the line into three regions.',
        'Left of $' + lo + '$: both factors are negative, so the product is positive.',
        'Between them: one factor is positive and the other negative, so the product is negative.',
        'Right of $' + hi + '$: both factors are positive, so the product is positive again.',
        'Negative on $' + iv(lo, hi, 1, 1) + '$, with round brackets because the zeros themselves give $0$, not a negative.'
      ],
      key: 'A sign chart answers an inequality without any graphing. Test one point per region and read the signs off the factors.'
    });
  });

  L.gen('pc.fn.graphs', '4', function () {
    var r1 = nz(-5, 5), r2 = nz(-5, 5);
    if (r1 === r2) r2 = r1 + 2;
    var mult = pick([2, 2, 3]);
    var tex = '(x' + sg(-r1) + ')^{' + mult + '}(x' + sg(-r2) + ')';
    var crosses = mult % 2 === 1;
    return q({
      prompt: 'The graph of $f(x) = ' + tex + '$ meets the $x$-axis at $x = ' + r1 + '$. What does it do there?',
      _mc: mcText(crosses ? 'It crosses the axis, flattening out as it does.' : 'It touches the axis and turns back without crossing.',
        [crosses ? 'It touches the axis and turns back without crossing.' : 'It crosses the axis, flattening out as it does.',
          'It has a vertical asymptote there.', 'It has a hole there.']),
      expl: [
        'The factor $(x' + sg(-r1) + ')$ appears with multiplicity $' + mult + '$.',
        'Odd multiplicity means the factor changes sign as $x$ passes the root, so the graph crosses.',
        'Even multiplicity means the factor keeps its sign, so the graph touches and turns back.',
        'Here the multiplicity is $' + mult + '$, which is ' + (crosses ? 'odd, so it crosses.' : 'even, so it bounces.')
      ],
      key: 'Multiplicity controls behaviour at a zero: odd crosses, even bounces, and multiplicity $3$ or more flattens on the way through.'
    });
  });

  L.gen('pc.fn.graphs', '5', function () {
    var r1 = nz(-4, 4), r2 = nz(-4, 4), r3 = nz(-4, 4);
    var rs = [r1, r2, r3].filter(function (v, i, arr) { return arr.indexOf(v) === i; });
    while (rs.length < 3) { var n = nz(-5, 5); if (rs.indexOf(n) < 0) rs.push(n); }
    var px = nz(-6, 6);
    while (rs.indexOf(px) >= 0) px = nz(-6, 6);
    var y = ri(2, 30) * (coin() ? 1 : -1);
    var base = P.eval(P.fromRoots(rs), px);
    var a = y / base;
    return q({
      prompt: 'A cubic function has zeros at $x = ' + rs[0] + '$, $x = ' + rs[1] + '$ and $x = ' + rs[2] +
        '$, and its graph passes through $(' + px + ',\\ ' + y + ')$. What is its leading coefficient?',
      spr: true, value: a,
      expl: [
        'Zeros give factors, so $f(x) = a' + P.texFactored(rs, 1).replace(/^1/, '') + '$ for some constant $a$.',
        'Use the extra point: $f(' + px + ') = a \\cdot ' + base + ' = ' + y + '$.',
        'Solve: $a = \\dfrac{' + y + '}{' + base + '} = ' + fmt(a) + '$.'
      ],
      key: 'Zeros fix the shape; one extra point fixes the vertical scale. That pair of steps builds any polynomial from its graph.'
    });
  });

  L.gen('pc.fn.graphs', '5', function () {
    var deg = pick([3, 5]), a = nz(-3, 3);
    var pos = a > 0;
    return q({
      prompt: 'A polynomial of odd degree $' + deg + '$ has leading coefficient $' + a + '$. Which statement must be true?',
      _mc: mcText('It has at least one real zero.',
        ['It has exactly $' + deg + '$ real zeros.', 'Its graph has no turning points.',
          'Both ends of its graph go in the same direction.']),
      expl: [
        'The two ends go in opposite directions, because the degree is odd.',
        'So the function takes both very large positive and very large negative values.',
        'A polynomial is continuous, so somewhere between those it must pass through zero.',
        'It may have $1$, $3$ or $' + deg + '$ real zeros — but never none.'
      ],
      key: 'Every odd-degree polynomial has at least one real zero. This is the Intermediate Value Theorem, met a year early.'
    });
  });

  /* ================================================================= pc.fn.rates */

  L.gen('pc.fn.rates', '1', function () {
    var p = [nz(-3, 4), ri(-6, 6), ri(-9, 9)], a = ri(-4, 2), b = a + ri(2, 5);
    var v = (P.eval(p, b) - P.eval(p, a)) / (b - a);
    return q({
      prompt: 'What is the average rate of change of $f(x) = ' + P.tex(p) + '$ over the interval $[' + a + ',\\ ' + b + ']$?',
      spr: true, value: v,
      expl: [
        '$f(' + a + ') = ' + P.eval(p, a) + '$ and $f(' + b + ') = ' + P.eval(p, b) + '$.',
        'Average rate of change $= \\dfrac{f(' + b + ') - f(' + a + ')}{' + b + ' - (' + a + ')} = \\dfrac{' + (P.eval(p, b) - P.eval(p, a)) + '}{' + (b - a) + '}$.',
        'That is $' + fmt(v) + '$.'
      ],
      key: 'Divide by $b - a$, the width of the interval — never by $b$ alone.'
    });
  });

  L.gen('pc.fn.rates', '1', function () {
    var x0 = ri(0, 3), step = ri(1, 3);
    var a = nz(-5, 6), b = ri(-9, 9);
    var xs = [x0, x0 + step, x0 + 2 * step, x0 + 3 * step];
    var ys = xs.map(function (x) { return a * x + b; });
    var i = ri(0, 1), j = i + ri(1, 2);
    return q({
      stem: tbl(xs, ys),
      prompt: 'Using the table, what is the average rate of change of $f$ from $x = ' + xs[i] + '$ to $x = ' + xs[j] + '$?',
      spr: true, value: (ys[j] - ys[i]) / (xs[j] - xs[i]),
      expl: [
        'Read the two outputs: $f(' + xs[i] + ') = ' + ys[i] + '$ and $f(' + xs[j] + ') = ' + ys[j] + '$.',
        'Rate $= \\dfrac{' + ys[j] + ' - (' + ys[i] + ')}{' + xs[j] + ' - ' + xs[i] + '} = \\dfrac{' + (ys[j] - ys[i]) + '}{' + (xs[j] - xs[i]) + '} = ' + fmt((ys[j] - ys[i]) / (xs[j] - xs[i])) + '$.',
        'This table is linear, so every interval would have given the same answer.'
      ],
      key: 'A constant average rate of change over every interval is exactly what makes a function linear.'
    });
  });

  L.gen('pc.fn.rates', '2', function () {
    var p = [nz(-2, 3), ri(-4, 4), ri(-6, 6), ri(-9, 9)], a = ri(-3, 1), b = a + ri(2, 4);
    var v = (P.eval(p, b) - P.eval(p, a)) / (b - a);
    return q({
      prompt: 'Find the average rate of change of $f(x) = ' + P.tex(p) + '$ on $[' + a + ',\\ ' + b + ']$.',
      spr: true, value: v,
      expl: [
        '$f(' + a + ') = ' + P.eval(p, a) + '$.',
        '$f(' + b + ') = ' + P.eval(p, b) + '$.',
        '$\\dfrac{' + P.eval(p, b) + ' - (' + P.eval(p, a) + ')}{' + b + ' - (' + a + ')} = \\dfrac{' + (P.eval(p, b) - P.eval(p, a)) + '}{' + (b - a) + '} = ' + fmt(v) + '$.'
      ],
      key: 'The formula does not care about the degree. Two evaluations and one division, always.'
    });
  });

  L.gen('pc.fn.rates', '2', function () {
    var kind = pick(['lin', 'quad', 'exp']);
    var xs = [0, 1, 2, 3], ys;
    if (kind === 'lin') { var m = nz(-6, 7), c0 = ri(-5, 9); ys = xs.map(function (x) { return m * x + c0; }); }
    else if (kind === 'quad') { var a2 = nz(-3, 4), b2 = ri(-5, 5), c2 = ri(-6, 6); ys = xs.map(function (x) { return a2 * x * x + b2 * x + c2; }); }
    else { var r = pick([2, 3, 4]), s = pick([1, 2, 3, 5]); ys = xs.map(function (x) { return s * Math.pow(r, x); }); }
    var label = { lin: 'linear', quad: 'quadratic', exp: 'exponential' }[kind];
    return q({
      stem: tbl(xs, ys),
      prompt: 'Which kind of function best models the data in this table?',
      _mc: mcText(label, ['linear', 'quadratic', 'exponential', 'logarithmic'].filter(function (s2) { return s2 !== label; })),
      expl: [
        'The inputs are equally spaced, so differences and ratios are meaningful.',
        'First differences: $' + [ys[1] - ys[0], ys[2] - ys[1], ys[3] - ys[2]].join(',\\ ') + '$.',
        kind === 'lin' ? 'They are constant, so the model is linear.'
          : (kind === 'quad'
            ? 'They are not constant. Second differences: $' + [(ys[2] - ys[1]) - (ys[1] - ys[0]), (ys[3] - ys[2]) - (ys[2] - ys[1])].join(',\\ ') + '$ — constant, so quadratic.'
            : 'They are not constant. Ratios: $' + [fmt(ys[1] / ys[0]), fmt(ys[2] / ys[1]), fmt(ys[3] / ys[2])].join(',\\ ') + '$ — constant, so exponential.'),
        'Answer: ' + label + '.'
      ],
      key: 'Constant first difference is linear, constant second difference is quadratic, constant ratio is exponential.'
    });
  });

  L.gen('pc.fn.rates', '3', function () {
    var a = ri(-3, 2), b = a + ri(2, 5), fa = ri(-20, 20), rate = nz(-9, 9);
    var fb = fa + rate * (b - a);
    return q({
      prompt: 'A function $f$ has $f(' + a + ') = ' + fa + '$, and its average rate of change on $[' + a + ',\\ ' + b + ']$ is $' + rate + '$. What is $f(' + b + ')$?',
      spr: true, value: fb,
      expl: [
        'Write the definition: $\\dfrac{f(' + b + ') - (' + fa + ')}{' + b + ' - (' + a + ')} = ' + rate + '$.',
        'The width of the interval is $' + (b - a) + '$, so $f(' + b + ') - (' + fa + ') = ' + rate + ' \\cdot ' + (b - a) + ' = ' + (rate * (b - a)) + '$.',
        '$f(' + b + ') = ' + fa + ' + ' + (rate * (b - a)) + ' = ' + fb + '$.'
      ],
      key: 'Rate times width equals total change. Rearranging the definition solves for whichever piece is missing.'
    });
  });

  L.gen('pc.fn.rates', '3', function () {
    var up = coin(), xs = [1, 2, 3, 4];
    var d0 = ri(2, 6), step = ri(1, 4);
    var ds = up ? [d0, d0 + step, d0 + 2 * step] : [d0 + 2 * step, d0 + step, d0];
    var y0 = ri(-8, 8), ys = [y0];
    ds.forEach(function (d) { ys.push(ys[ys.length - 1] + d); });
    return q({
      stem: tbl(xs, ys),
      prompt: 'Over the interval shown, the graph of $f$ is best described as',
      _mc: mcText(up ? 'increasing and concave up' : 'increasing and concave down',
        [up ? 'increasing and concave down' : 'increasing and concave up',
          'decreasing and concave up', 'decreasing and concave down']),
      expl: [
        'The outputs are rising throughout, so $f$ is increasing.',
        'Successive changes: $' + ds.join(',\\ ') + '$.',
        up ? 'Those changes are getting larger, so the rate of change is increasing — concave up.'
          : 'Those changes are getting smaller, so the rate of change is decreasing — concave down.',
        'So the function is increasing and ' + (up ? 'concave up.' : 'concave down.')
      ],
      key: 'Direction and concavity are two independent judgements: is it rising, and is the rate itself growing?'
    });
  });

  L.gen('pc.fn.rates', '4', function () {
    var down = coin(), xs = [0, 2, 4, 6];
    var d0 = ri(3, 8), step = ri(1, 4);
    var ds = down ? [-(d0 + 2 * step), -(d0 + step), -d0] : [-d0, -(d0 + step), -(d0 + 2 * step)];
    var y0 = ri(30, 90), ys = [y0];
    ds.forEach(function (d) { ys.push(ys[ys.length - 1] + d); });
    var ans = down ? 'decreasing and concave up' : 'decreasing and concave down';
    return q({
      stem: tbl(xs, ys),
      prompt: 'Which statement best describes $f$ over the interval shown?',
      _mc: mcText(ans, ['decreasing and concave up', 'decreasing and concave down',
        'increasing and concave up', 'increasing and concave down'].filter(function (s) { return s !== ans; })),
      expl: [
        'The outputs fall throughout, so $f$ is decreasing.',
        'Changes per step: $' + ds.join(',\\ ') + '$.',
        down ? 'The drops are getting smaller, so the rate of change is rising toward zero — that is concave up.'
          : 'The drops are getting larger, so the rate of change is falling further below zero — that is concave down.',
        'So: ' + ans + '.'
      ],
      key: 'Concave up means the rate is increasing, even when the rate is negative throughout. Falling more slowly is still an increasing rate.'
    });
  });

  L.gen('pc.fn.rates', '4', function () {
    var p = [nz(1, 3), ri(-6, 6), ri(-8, 8)];
    var pairs = [], seen = {};
    while (pairs.length < 4) {
      var a = ri(-5, 2), pr = [a, a + ri(1, 4)], k2 = pr.join(',');
      if (seen[k2]) continue;
      seen[k2] = 1; pairs.push(pr);
    }
    var rates = pairs.map(function (pr) { return (P.eval(p, pr[1]) - P.eval(p, pr[0])) / (pr[1] - pr[0]); });
    var best = 0; for (var j = 1; j < 4; j++) if (rates[j] > rates[best]) best = j;
    var lab = pairs.map(function (pr) { return '$[' + pr[0] + ',\\ ' + pr[1] + ']$'; });
    var m = mcText(lab[best], lab.filter(function (s, k) { return k !== best; }));
    return q({
      prompt: 'For $f(x) = ' + P.tex(p) + '$, on which interval is the average rate of change greatest?',
      _mc: m,
      expl: [
        'Compute the rate on each interval; the widths differ, so you cannot judge by appearance.',
        pairs.map(function (pr, k) { return lab[k] + ': $' + fmt(rates[k]) + '$'; }).join('; ') + '.',
        'The largest is on ' + lab[best] + '.'
      ],
      key: 'Different interval widths make "which looks steeper" unreliable. Compute every one.'
    });
  });

  L.gen('pc.fn.rates', '5', function () {
    var a = nz(1, 4), b = ri(-8, 8), c = ri(-9, 9), x0 = ri(-4, 4);
    var h = pick([0.1, 0.01, 0.001]);
    var v = M.round((P.eval([a, b, c], x0 + h) - P.eval([a, b, c], x0)) / h, 4);
    return q({
      prompt: 'For $f(x) = ' + P.tex([a, b, c]) + '$, estimate the instantaneous rate of change at $x = ' + x0 +
        '$ by using the interval $[' + x0 + ',\\ ' + fmt(x0 + h) + ']$. Give your answer to the nearest hundredth.',
      spr: true, value: v,
      expl: [
        '$f(' + x0 + ') = ' + P.eval([a, b, c], x0) + '$ and $f(' + fmt(x0 + h) + ') = ' + M.round(P.eval([a, b, c], x0 + h), 6) + '$.',
        'Average rate over this narrow interval: $\\dfrac{' + M.round(P.eval([a, b, c], x0 + h) - P.eval([a, b, c], x0), 6) + '}{' + h + '} = ' + v + '$.',
        'The exact instantaneous rate is $' + (2 * a) + 'x' + (b === 0 ? '' : sg(b)) + '$ at $x = ' + x0 + '$, which is $' + (2 * a * x0 + b) + '$ — and the estimate is close to it.'
      ],
      key: 'Shrink the interval and the secant slope approaches the tangent slope. That limiting value is the derivative.'
    });
  });

  L.gen('pc.fn.rates', '5', function () {
    var up = coin();
    return q({
      prompt: 'On an interval where $f$ is concave ' + (up ? 'up' : 'down') +
        ', how does the average rate of change over the interval compare with the instantaneous rate of change at the left endpoint?',
      _mc: mcText(up ? 'The average rate is greater.' : 'The average rate is smaller.',
        [up ? 'The average rate is smaller.' : 'The average rate is greater.',
          'They are always equal.', 'There is not enough information to decide.']),
      expl: [
        'Concave ' + (up ? 'up' : 'down') + ' means the rate of change is ' + (up ? 'increasing' : 'decreasing') + ' across the interval.',
        'The instantaneous rate at the left endpoint is therefore the ' + (up ? 'smallest' : 'largest') + ' rate anywhere on the interval.',
        'The average is a blend of all the rates across the interval, so it must be ' + (up ? 'larger' : 'smaller') + ' than that endpoint value.',
        'Geometrically: on a concave-' + (up ? 'up' : 'down') + ' arc the secant line is ' + (up ? 'steeper' : 'less steep') + ' than the tangent at the left end.'
      ],
      key: 'Concavity is a statement about how the rate changes, which is exactly what lets you compare a secant with a tangent.'
    });
  });

  /* ================================================================= pc.fn.transform */

  L.gen('pc.fn.transform', '1', function () {
    var h = nz(-6, 6), k = nz(-6, 6);
    var hs = (h > 0 ? 'right ' + h : 'left ' + Math.abs(h));
    var ks = (k > 0 ? 'up ' + k : 'down ' + Math.abs(k));
    return q({
      prompt: 'The graph of $g(x) = f(x' + sg(-h) + ')' + sg(k) + '$ is the graph of $f$ shifted how?',
      _mc: mcText(hs + ' and ' + ks,
        [(h > 0 ? 'left ' + h : 'right ' + Math.abs(h)) + ' and ' + ks,
          hs + ' and ' + (k > 0 ? 'down ' + k : 'up ' + Math.abs(k)),
          (h > 0 ? 'left ' + h : 'right ' + Math.abs(h)) + ' and ' + (k > 0 ? 'down ' + k : 'up ' + Math.abs(k))]),
      expl: [
        'The $' + sg(k).trim() + '$ sits outside the function, acting on the output, so it moves the graph ' + ks + ' — exactly as it looks.',
        'The $x' + sg(-h) + '$ sits inside, acting on the input, so it moves the graph the <b>opposite</b> way to the sign: ' + hs + '.',
        'Why: to get the same output as before, the input now has to be ' + (h > 0 ? 'larger' : 'smaller') + ' by $' + Math.abs(h) + '$.',
        'So the graph is shifted ' + hs + ' and ' + ks + '.'
      ],
      key: 'Outside is literal, inside is reversed. Say it every time until it stops needing saying.'
    });
  });

  L.gen('pc.fn.transform', '1', function () {
    var inside = coin();
    return q({
      prompt: 'The graph of $g(x) = ' + (inside ? 'f(-x)' : '-f(x)') + '$ is the graph of $f$ reflected across which line?',
      _mc: mcText(inside ? 'the $y$-axis' : 'the $x$-axis',
        [inside ? 'the $x$-axis' : 'the $y$-axis', 'the line $y = x$', 'the origin']),
      expl: [
        inside ? 'The minus sign is <b>inside</b>, so it acts on the input.'
          : 'The minus sign is <b>outside</b>, so it acts on the output.',
        inside ? 'Negating the input swaps left and right, which is a reflection across the $y$-axis.'
          : 'Negating the output swaps up and down, which is a reflection across the $x$-axis.',
        'A point $(a,b)$ becomes $' + (inside ? '(-a,\\ b)' : '(a,\\ -b)') + '$.'
      ],
      key: 'Inside minus flips horizontally, outside minus flips vertically. Reflection across $y = x$ is the inverse, a different operation entirely.'
    });
  });

  L.gen('pc.fn.transform', '2', function () {
    var parent = pick([['x^{2}', 'y = x^{2}'], ['|x|', 'y = |x|'], ['\\sqrt{x}', 'y = \\sqrt{x}'], ['x^{3}', 'y = x^{3}']]);
    var a = pick([2, 3, 4, -2, -3]), h = nz(-5, 5), k = nz(-6, 6);
    var inner = parent[0].replace('x', '(x' + sg(-h) + ')');
    var body = (a === 1 ? '' : (a === -1 ? '-' : String(a))) + inner;
    var correct = body + sg(k);
    var w1 = (a === 1 ? '' : String(a)) + parent[0].replace('x', '(x' + sg(h) + ')') + sg(k);
    var w2 = (a === 1 ? '' : String(a)) + inner + sg(-k);
    var w3 = (a === 1 ? '' : String(-a)) + inner + sg(k);
    return q({
      prompt: 'The graph of $' + parent[1] + '$ is ' + (a < 0 ? 'reflected across the $x$-axis, ' : '') +
        'stretched vertically by a factor of $' + Math.abs(a) + '$, shifted ' +
        (h > 0 ? 'right $' + h + '$' : 'left $' + Math.abs(h) + '$') + ', and shifted ' +
        (k > 0 ? 'up $' + k + '$' : 'down $' + Math.abs(k) + '$') + '. What is the resulting equation?',
      _mc: mcTex(correct, [w1, w2, w3]),
      expl: [
        'Start from the parent $' + parent[0] + '$ and build the form $a\\,f(x - h) + k$.',
        'A shift ' + (h > 0 ? 'right' : 'left') + ' $' + Math.abs(h) + '$ means replacing $x$ with $(x' + sg(-h) + ')$ — reversed sign inside.',
        'The vertical stretch' + (a < 0 ? ' and reflection multiply' : ' multiplies') + ' the whole thing by $' + a + '$.',
        'The vertical shift adds $' + k + '$ last: $y = ' + correct + '$.'
      ],
      key: 'Build the equation in the order $a$, then inside shift, then $+k$. The inside sign is always the reverse of the direction.'
    });
  });

  L.gen('pc.fn.transform', '2', function () {
    var a = pick([2, 3, 4, 5]), vert = coin();
    return q({
      prompt: 'How does the graph of $g(x) = ' + (vert ? a + 'f(x)' : 'f(' + a + 'x)') + '$ compare with the graph of $f$?',
      _mc: mcText(vert ? 'stretched vertically by a factor of $' + a + '$' : 'compressed horizontally by a factor of $' + a + '$',
        [vert ? 'compressed horizontally by a factor of $' + a + '$' : 'stretched vertically by a factor of $' + a + '$',
          'stretched horizontally by a factor of $' + a + '$',
          'shifted up $' + a + '$ units']),
      expl: [
        vert ? 'The $' + a + '$ multiplies the output, so every height is multiplied by $' + a + '$.'
          : 'The $' + a + '$ multiplies the input, so it acts horizontally — and inside changes reverse.',
        vert ? 'Heights grow, so the graph is stretched vertically by $' + a + '$.'
          : 'The input reaches a given value $' + a + '$ times sooner, so every horizontal distance is divided by $' + a + '$.',
        vert ? 'A point $(p, q)$ moves to $(p,\\ ' + a + 'q)$.'
          : 'A point $(p, q)$ moves to $\\left(\\dfrac{p}{' + a + '},\\ q\\right)$ — a horizontal compression.'
      ],
      key: 'Multiplying the input by $b$ compresses by $b$ (that is, stretches by $\\frac{1}{b}$). The reciprocal is the trap.'
    });
  });

  L.gen('pc.fn.transform', '3', function () {
    var a = nz(-4, 4), hk = vertexPair(), h = hk[0], k = hk[1];
    var parent = pick(['x^{2}', '|x|']);
    return q({
      prompt: 'What are the coordinates of the ' + (parent === 'x^{2}' ? 'vertex' : 'corner') + ' of $y = ' +
        (a === 1 ? '' : (a === -1 ? '-' : a)) + parent.replace('x', '(x' + sg(-h) + ')') + (k === 0 ? '' : sg(k)) + '$?',
      _mc: mcText('$(' + h + ',\\ ' + k + ')$',
        ['$(' + (-h) + ',\\ ' + k + ')$', '$(' + k + ',\\ ' + h + ')$', '$(' + (-h) + ',\\ ' + (-k) + ')$']),
      expl: [
        'The parent has its ' + (parent === 'x^{2}' ? 'vertex' : 'corner') + ' at the origin.',
        'The inside $(x' + sg(-h) + ')$ shifts it ' + (h > 0 ? 'right' : 'left') + ' $' + Math.abs(h) + '$, to $x = ' + h + '$.',
        'The outside $' + (k >= 0 ? '+' : '') + k + '$ shifts it ' + (k >= 0 ? 'up' : 'down') + ' $' + Math.abs(k) + '$.',
        'The vertical stretch by $' + a + '$ changes the steepness but not the location of that point.',
        'Answer: $(' + h + ',\\ ' + k + ')$.'
      ],
      key: 'In $a\\,f(x-h)+k$ the anchor sits at $(h,k)$, with the sign inside already flipped for you.'
    });
  });

  L.gen('pc.fn.transform', '3', function () {
    var a = pick([2, 3, -2, -3, -1]), k = nz(-7, 7);
    return q({
      prompt: 'The function $f(x) = \\sqrt{x}$ has range $[0,\\ \\infty)$. What is the range of $g(x) = ' +
        (a === 1 ? '' : (a === -1 ? '-' : a)) + '\\sqrt{x + ' + ri(1, 9) + '}' + sg(k) + '$?',
      _mc: mcTex(a > 0 ? iv(k, INF, 0, 1) : iv(-INF, k, 1, 0),
        [a > 0 ? iv(-INF, k, 1, 0) : iv(k, INF, 0, 1), iv(0, INF, 0, 1), iv(-INF, INF, 1, 1)]),
      expl: [
        'The parent output runs over $[0,\\ \\infty)$.',
        'Multiplying by $' + a + '$ ' + (a > 0 ? 'stretches it but keeps it non-negative' : 'flips it, so it becomes $(-\\infty,\\ 0]$') + '.',
        'Adding $' + k + '$ shifts every output by $' + k + '$.',
        'Range: $' + (a > 0 ? iv(k, INF, 0, 1) : iv(-INF, k, 1, 0)) + '$. The horizontal shift inside the root does not affect the range at all.'
      ],
      key: 'Vertical transformations move the range; horizontal ones move the domain. Apply them to the parent range in order.'
    });
  });

  L.gen('pc.fn.transform', '4', function () {
    var b = pick([2, 3, 4]), c = b * nz(-5, 5);
    var h = -c / b;
    return q({
      prompt: 'Describe the horizontal transformation taking $f(x)$ to $g(x) = f(' + P.tex([b, c]) + ')$.',
      _mc: mcText('compression by a factor of $' + b + '$, then a shift ' + (h > 0 ? 'right' : 'left') + ' $' + Math.abs(h) + '$',
        ['a shift ' + (c > 0 ? 'left' : 'right') + ' $' + Math.abs(c) + '$, then compression by a factor of $' + b + '$',
          'compression by a factor of $' + b + '$, then a shift ' + (h > 0 ? 'left' : 'right') + ' $' + Math.abs(h) + '$',
          'stretch by a factor of $' + b + '$, then a shift ' + (h > 0 ? 'right' : 'left') + ' $' + Math.abs(h) + '$']),
      expl: [
        'You cannot read the shift until the coefficient is factored out.',
        '$' + P.tex([b, c]) + ' = ' + b + '(x' + sg(c / b) + ')$.',
        'So $g(x) = f\\big(' + b + '(x' + sg(-h) + ')\\big)$: a horizontal compression by $' + b + '$ and a shift ' + (h > 0 ? 'right' : 'left') + ' $' + Math.abs(h) + '$.',
        'Reading the shift as $' + Math.abs(c) + '$ straight off the unfactored form is the standard error.'
      ],
      key: 'Factor $b$ out of the input before reading any horizontal shift. The shift is $c/b$, not $c$.'
    });
  });

  L.gen('pc.fn.transform', '4', function () {
    var which = coin();
    return q({
      prompt: 'How does the graph of $y = ' + (which ? '|f(x)|' : 'f(|x|)') + '$ differ from the graph of $y = f(x)$?',
      _mc: mcText(which
        ? 'Any part below the $x$-axis is reflected up above it; the rest is unchanged.'
        : 'The part to the right of the $y$-axis is kept and mirrored onto the left; the original left half is discarded.',
        [which
          ? 'The part to the right of the $y$-axis is kept and mirrored onto the left; the original left half is discarded.'
          : 'Any part below the $x$-axis is reflected up above it; the rest is unchanged.',
          'The whole graph is reflected across the line $y = x$.',
          'The graph is shifted up until it lies entirely above the $x$-axis.']),
      expl: [
        which ? 'The absolute value is <b>outside</b>, so it acts on the output.'
          : 'The absolute value is <b>inside</b>, so it acts on the input.',
        which ? 'Any negative output becomes its positive twin, so points below the axis flip upward. Points already above are untouched.'
          : 'Since $|{-a}| = |a|$, the outputs at $-a$ and $a$ are now identical: the right half is copied to the left.',
        which ? 'The result never dips below the $x$-axis, and it gains a corner at every zero.'
          : 'The result is always an even function, symmetric about the $y$-axis.'
      ],
      key: 'Outside absolute value folds the graph up; inside absolute value mirrors the right half leftward.'
    });
  });

  L.gen('pc.fn.transform', '5', function () {
    var p = nz(-6, 6), qy = nz(-8, 8), a = pick([2, 3, -2, -1, 4]), b = pick([2, 3]), h = nz(-5, 5), k = nz(-6, 6);
    var nx = p / b + h, ny = a * qy + k;
    return q({
      prompt: 'The point $(' + p + ',\\ ' + qy + ')$ lies on the graph of $f$. Let $g(x) = ' +
        (a === 1 ? '' : (a === -1 ? '-' : a)) + 'f\\big(' + b + '(x' + sg(-h) + ')\\big)' + sg(k) +
        '$. Which point must lie on the graph of $g$?',
      _mc: mcText('$(' + fmt(nx) + ',\\ ' + fmt(ny) + ')$',
        ['$(' + fmt(p * b + h) + ',\\ ' + fmt(ny) + ')$',
          '$(' + fmt(nx) + ',\\ ' + fmt(a * qy - k) + ')$',
          '$(' + fmt(p / b - h) + ',\\ ' + fmt(ny) + ')$',
          '$(' + fmt(nx) + ',\\ ' + fmt(qy + k) + ')$']),   /* spare: forgot the vertical stretch */
      expl: [
        'Use the point map: under $a f(b(x-h)) + k$, a point $(p, q)$ moves to $\\left(\\dfrac{p}{b} + h,\\ aq + k\\right)$.',
        'New $x$: $\\dfrac{' + p + '}{' + b + '}' + sg(h) + ' = ' + fmt(nx) + '$.',
        'New $y$: $' + a + '(' + qy + ')' + sg(k) + ' = ' + fmt(ny) + '$.',
        'So $(' + fmt(nx) + ',\\ ' + fmt(ny) + ')$ lies on $g$.'
      ],
      key: 'Divide the $x$ and then add the shift; multiply the $y$ and then add the shift. Testing a point settles any direction dispute.'
    });
  });

  L.gen('pc.fn.transform', '5', function () {
    var dlo = ri(-8, 0), dhi = dlo + ri(3, 8), b = pick([2, 3]), h = nz(-4, 4);
    var nlo = dlo / b + h, nhi = dhi / b + h;
    return q({
      prompt: 'The domain of $f$ is $' + iv(dlo, dhi, 0, 0) + '$. What is the domain of $g(x) = f\\big(' + b + '(x' + sg(-h) + ')\\big)$?',
      _mc: mcTex(iv(nlo, nhi, 0, 0),
        [iv(dlo * b + h, dhi * b + h, 0, 0), iv(dlo / b - h, dhi / b - h, 0, 0), iv(dlo, dhi, 0, 0)]),
      expl: [
        'The inner expression must land in the domain of $f$: $' + dlo + ' \\le ' + b + '(x' + sg(-h) + ') \\le ' + dhi + '$.',
        'Divide all three parts by $' + b + '$: $' + fmt(dlo / b) + ' \\le x' + sg(-h) + ' \\le ' + fmt(dhi / b) + '$.',
        'Add $' + h + '$ throughout: $' + fmt(nlo) + ' \\le x \\le ' + fmt(nhi) + '$.',
        'Domain: $' + iv(nlo, nhi, 0, 0) + '$.'
      ],
      key: 'To transform a domain, solve the compound inequality for $x$. That is the same reciprocal-then-shift map as for a point.'
    });
  });

  /* ================================================================= pc.fn.symmetry */

  L.gen('pc.fn.symmetry', '1', function () {
    var e1 = pick([2, 4]), e2 = pick([3, 5]), c = nz(-9, 9), d = nz(-6, 6);
    var good = 'f(x) = x^{' + e1 + '}' + sg(c);
    var bad1 = 'f(x) = x^{' + e2 + '}' + sg(c);
    var bad2 = 'f(x) = x^{' + e1 + '}' + sg(d) + 'x';
    var bad3 = 'f(x) = x^{' + e2 + '}' + sg(d) + 'x';
    return q({
      prompt: 'Which of these functions is even?',
      _mc: mcTex(good, [bad1, bad2, bad3]),
      expl: [
        'Even means $f(-x) = f(x)$, which happens exactly when every power of $x$ present is even.',
        'A constant counts as $x^{0}$, an even power, so it never breaks evenness.',
        '$' + good + '$ has only the even power $x^{' + e1 + '}$ and a constant, so it is even.',
        'The others each contain an odd power, and an odd power destroys the $y$-axis symmetry.'
      ],
      key: 'Only even powers means even. A single odd power ruins it, while a constant is harmless here and fatal to oddness.'
    });
  });

  L.gen('pc.fn.symmetry', '1', function () {
    var kind = pick(['even', 'odd', 'neither']);
    var p;
    if (kind === 'even') p = [nz(-4, 4), 0, nz(-6, 6), 0, ri(-9, 9)];
    else if (kind === 'odd') p = [nz(-4, 4), 0, nz(-6, 6), 0];
    else p = [nz(-4, 4), 0, nz(-6, 6), nz(-9, 9)];
    return q({
      prompt: 'Is $f(x) = ' + P.tex(p) + '$ even, odd, or neither?',
      _mc: mcText(kind, ['even', 'odd', 'neither'].filter(function (s) { return s !== kind; }).concat(['both even and odd'])),
      expl: [
        'Look at the exponents present: ' + (kind === 'even'
          ? 'every power is even (counting the constant as $x^0$), so $f(-x) = f(x)$.'
          : (kind === 'odd'
            ? 'every power is odd, so each term flips sign and $f(-x) = -f(x)$.'
            : 'there is a mix of even and odd powers.')),
        kind === 'neither'
          ? 'Some terms flip sign under $x \\to -x$ and others do not, so the result matches neither $f(x)$ nor $-f(x)$.'
          : 'Computing $f(-x)$ confirms it directly.',
        'Answer: ' + kind + '.'
      ],
      key: 'All-even powers means even; all-odd powers means odd; a mix means neither. A constant term is an even power and always kills oddness.'
    });
  });

  L.gen('pc.fn.symmetry', '1', function () {
    return q({
      prompt: 'If $f$ is an odd function and $f$ is defined at $x = 0$, what must $f(0)$ equal?',
      spr: true, value: 0,
      expl: [
        'Odd means $f(-x) = -f(x)$ for every $x$ in the domain.',
        'Put $x = 0$: $f(0) = -f(0)$.',
        'Adding $f(0)$ to both sides gives $2f(0) = 0$.',
        'So $f(0) = 0$: an odd function defined at zero must pass through the origin.'
      ],
      key: 'This single fact settles a whole family of questions — and it is why $x^3 + 1$ cannot be odd.'
    });
  });

  L.gen('pc.fn.symmetry', '2', function () {
    var top = pick([1, 2, 3, 4]), c = pick([1, 4, 9, 16]);
    var odd = top % 2 === 1;
    var kind = odd ? 'odd' : 'even';
    var tTex = (top === 1 ? 'x' : 'x^{' + top + '}');
    var bTex = 'x^{2} + ' + c;
    return q({
      prompt: 'Is $f(x) = \\dfrac{' + tTex + '}{' + bTex + '}$ even, odd, or neither?',
      _mc: mcText(kind, ['even', 'odd', 'neither'].filter(function (s) { return s !== kind; }).concat(['both even and odd'])),
      expl: [
        'Compute $f(-x) = \\dfrac{(-x)^{' + top + '}}{(-x)^{2} + ' + c + '}$.',
        'The denominator has only an even power, so it is unchanged: $(-x)^2 + ' + c + ' = ' + bTex + '$.',
        odd ? 'The numerator has an odd power, so $(-x)^{' + top + '} = -' + tTex + '$ and the whole fraction changes sign.'
          : 'The numerator has an even power too, so $(-x)^{' + top + '} = ' + tTex + '$ and nothing changes.',
        'Therefore $f(-x) = ' + (odd ? '-f(x)' : 'f(x)') + '$: the function is ' + kind + '.'
      ],
      key: 'Odd over even is odd; even over even is even. Parity composes exactly like the parity of the exponents.'
    });
  });

  L.gen('pc.fn.symmetry', '2', function () {
    var fp = pick(['even', 'odd']), gp = pick(['even', 'odd']);
    var res = (fp === gp) ? 'even' : 'odd';
    return q({
      prompt: 'If $f$ is ' + fp + ' and $g$ is ' + gp + ', what can be said about the product $h(x) = f(x)\\,g(x)$?',
      _mc: mcText('The product is ' + res + '.',
        ['The product is ' + (res === 'even' ? 'odd' : 'even') + '.',
          'The product is neither even nor odd.',
          'It depends on the specific functions chosen.']),
      expl: [
        '$h(-x) = f(-x)\\,g(-x)$.',
        '$f(-x) = ' + (fp === 'even' ? 'f(x)' : '-f(x)') + '$ and $g(-x) = ' + (gp === 'even' ? 'g(x)' : '-g(x)') + '$.',
        'Multiply: $h(-x) = ' + (fp === gp && fp === 'odd' ? '(-1)(-1)' : (fp === gp ? '' : '(-1)')) + 'f(x)g(x) = ' + (res === 'even' ? 'h(x)' : '-h(x)') + '$.',
        'So the product is ' + res + '.'
      ],
      key: 'Two minus signs cancel: odd times odd is even, exactly like adding odd exponents.'
    });
  });

  L.gen('pc.fn.symmetry', '3', function () {
    var b1 = ri(-3, 1), b2 = b1 + ri(2, 4);
    var a = nz(-4, 4), c = ri(-6, 6), d = nz(-3, 3), e = ri(-8, 8), g = ri(-9, 9);
    var region = ri(0, 2);
    var x = region === 0 ? b1 - ri(1, 4) : (region === 1 ? ri(b1, b2 - 1) : b2 + ri(0, 4));
    var v = x < b1 ? (a * x + c) : (x < b2 ? d * x * x + e : g);
    return q({
      stem: '$f(x) = \\begin{cases} ' + P.tex([a, c]) + ' & x < ' + b1 +
        ' \\\\ ' + P.tex([d, 0, e]) + ' & ' + b1 + ' \\le x < ' + b2 +
        ' \\\\ ' + g + ' & x \\ge ' + b2 + ' \\end{cases}$',
      prompt: 'Find $f(' + x + ')$.',
      spr: true, value: v,
      expl: [
        'Locate $x = ' + x + '$ among the conditions: ' +
        (x < b1 ? 'it is less than $' + b1 + '$, so the first rule applies.'
          : (x < b2 ? 'it satisfies $' + b1 + ' \\le x < ' + b2 + '$, so the middle rule applies.'
            : 'it is at least $' + b2 + '$, so the last rule applies.')),
        'Apply only that rule: $f(' + x + ') = ' + v + '$.',
        'The other two formulas are irrelevant at this input.'
      ],
      key: 'Find the right piece first, then evaluate. The conditions never overlap, so exactly one applies.'
    });
  });

  L.gen('pc.fn.symmetry', '3', function () {
    var x = (ri(-60, 60) + pick([0.2, 0.4, 0.5, 0.7, 0.9])) * (coin() ? 1 : -1);
    x = M.round(x, 1);
    return q({
      prompt: 'What is $\\lfloor ' + x + ' \\rfloor$, the greatest integer less than or equal to $' + x + '$?',
      spr: true, value: Math.floor(x),
      expl: [
        'The floor function returns the largest integer that does not exceed the input.',
        x < 0 ? 'For a negative number this means going <b>down</b>, away from zero, not toward it.'
          : 'For a positive number this is simply dropping the decimal part.',
        '$\\lfloor ' + x + ' \\rfloor = ' + Math.floor(x) + '$.'
      ],
      key: 'Floor always rounds down on the number line. $\\lfloor -2.3 \\rfloor = -3$, not $-2$.'
    });
  });

  L.gen('pc.fn.symmetry', '4', function () {
    var b = ri(-3, 4), a = nz(-5, 5), d = nz(-3, 4), e = ri(-8, 8);
    var right = d * b * b + e;                    /* value the second piece approaches */
    var c = right - a * b;                        /* so that a*b + c = right */
    return q({
      stem: '$f(x) = \\begin{cases} ' + P.tex([a, 0]).replace(/ \+ 0$/, '') + ' + c & x \\le ' + b +
        ' \\\\ ' + P.tex([d, 0, e]) + ' & x > ' + b + ' \\end{cases}$',
      prompt: 'For what value of $c$ is $f$ continuous at $x = ' + b + '$?',
      spr: true, value: c,
      expl: [
        'At $x = ' + b + '$ the first piece gives $' + a + '(' + b + ') + c = ' + (a * b) + ' + c$.',
        'As $x$ approaches $' + b + '$ from the right, the second piece approaches $' + d + '(' + b + ')^2' + sg(e) + ' = ' + right + '$.',
        'Continuity means the two must agree: $' + (a * b) + ' + c = ' + right + '$.',
        'So $c = ' + right + ' - (' + (a * b) + ') = ' + c + '$.'
      ],
      key: 'Set the two expressions equal at the boundary. The second piece never reaches that input, but continuity is about the value it approaches.'
    });
  });

  L.gen('pc.fn.symmetry', '4', function () {
    var a = pick([2, 3, 4, 5]), b = a * nz(-4, 4), r = -b / a;
    var x = r + ri(1, 5) * (coin() ? 1 : -1);
    var v = Math.abs(a * x + b);
    return q({
      prompt: 'Rewriting $f(x) = |' + P.tex([a, b]) + '|$ without absolute value bars gives two pieces. What is $f(' + x + ')$?',
      spr: true, value: v,
      expl: [
        'The inside changes sign at $' + P.tex([a, b]) + ' = 0$, that is at $x = ' + fmt(r) + '$.',
        'For $x \\ge ' + fmt(r) + '$ the inside is non-negative, so $f(x) = ' + P.tex([a, b]) + '$. Below that, $f(x) = ' + P.tex([-a, -b]) + '$.',
        '$x = ' + x + '$ is ' + (x >= r ? 'at or above' : 'below') + ' $' + fmt(r) + '$, so use ' + (x >= r ? 'the first' : 'the second') + ' piece.',
        '$f(' + x + ') = ' + v + '$.'
      ],
      key: 'Absolute value is a piecewise function in disguise. Split at the zero of the inside and negate below it.'
    });
  });

  L.gen('pc.fn.symmetry', '5', function () {
    var a = nz(-4, 4), b = nz(-6, 6), c = nz(-7, 7);
    var p = [a, 0, b, 0];                       /* odd part */
    var x = ri(2, 7), fv = P.eval(p, x);
    return q({
      prompt: 'The function $f$ is odd and $f(' + x + ') = ' + fv + '$. What is $f(' + (-x) + ')$?',
      spr: true, value: -fv,
      expl: [
        'Odd means $f(-x) = -f(x)$ for every input.',
        'So $f(' + (-x) + ') = -f(' + x + ')$.',
        '$= -(' + fv + ') = ' + (-fv) + '$.'
      ],
      key: 'Odd symmetry gives you the whole left half of the graph for free, with the sign flipped.'
    });
  });

  L.gen('pc.fn.symmetry', '5', function () {
    var which = pick(['x-axis', 'y-axis', 'origin']);
    var prompts = {
      'x-axis': { eq: 'x = y^{2} + ' + ri(1, 6), ans: 'the $x$-axis only' },
      'y-axis': { eq: 'y = x^{2} + ' + ri(1, 6), ans: 'the $y$-axis only' },
      'origin': { eq: 'y = x^{3} ' + (coin() ? '+ ' : '- ') + ri(1, 6) + 'x', ans: 'the origin only' }
    };
    var o = prompts[which];
    return q({
      prompt: 'The graph of $' + o.eq + '$ is symmetric with respect to',
      _mc: mcText(o.ans, ['the $x$-axis only', 'the $y$-axis only', 'the origin only', 'both axes and the origin']
        .filter(function (s) { return s !== o.ans; })),
      expl: [
        'Test each symmetry by substitution.',
        which === 'x-axis'
          ? 'Replacing $y$ with $-y$ leaves the equation unchanged, because $(-y)^2 = y^2$: this is $x$-axis symmetry.'
          : (which === 'y-axis'
            ? 'Replacing $x$ with $-x$ leaves it unchanged, because $(-x)^2 = x^2$: this is $y$-axis symmetry.'
            : 'Replacing both $x$ with $-x$ and $y$ with $-y$ leaves it unchanged, because every power of $x$ is odd: this is origin symmetry.'),
        which === 'x-axis'
          ? 'Note that this graph is not a function of $x$ — it fails the vertical line test, which is exactly what $x$-axis symmetry does.'
          : 'The other two substitutions change the equation, so no other symmetry holds.'
      ],
      key: 'Three substitutions, three symmetries. Only a relation — never a non-zero function — can be symmetric about the $x$-axis.'
    });
  });

  /* ================================================================= pc.fn.comp */

  L.gen('pc.fn.comp', '1', function () {
    var f = [nz(-4, 4), ri(-7, 7)], g = [nz(-3, 4), ri(-6, 6)], x = nz(-5, 5);
    var inner = P.eval(g, x), v = P.eval(f, inner);
    return q({
      prompt: 'If $f(x) = ' + P.tex(f) + '$ and $g(x) = ' + P.tex(g) + '$, what is $f(g(' + x + '))$?',
      spr: true, value: v,
      expl: [
        'Work from the inside out. First $g(' + x + ') = ' + g[0] + '(' + x + ')' + sg(g[1]) + ' = ' + inner + '$.',
        'Now feed that number to $f$: $f(' + inner + ') = ' + f[0] + '(' + inner + ')' + sg(f[1]) + ' = ' + v + '$.',
        'Answer: $' + v + '$.'
      ],
      key: 'The function closest to the input acts first. $f(g(x))$ means $g$ goes first, despite reading left to right.'
    });
  });

  L.gen('pc.fn.comp', '1', function () {
    var xs = [1, 2, 3, 4, 5];
    var fs = M.shuffle([2, 4, 1, 5, 3]), gs = M.shuffle([3, 5, 2, 1, 4]);
    var x = pick(xs), inner = gs[xs.indexOf(x)], v = fs[xs.indexOf(inner)];
    return q({
      stem: '<table class="dtab"><tr><th>x</th>' + xs.map(function (v2) { return '<td>' + v2 + '</td>'; }).join('') + '</tr>' +
        '<tr><th>f(x)</th>' + fs.map(function (v2) { return '<td>' + v2 + '</td>'; }).join('') + '</tr>' +
        '<tr><th>g(x)</th>' + gs.map(function (v2) { return '<td>' + v2 + '</td>'; }).join('') + '</tr></table>',
      prompt: 'Using the table, what is $f(g(' + x + '))$?',
      spr: true, value: v,
      expl: [
        'Read the inner value from the $g$ row: $g(' + x + ') = ' + inner + '$.',
        'Now look up that number in the $f$ row: $f(' + inner + ') = ' + v + '$.',
        'So $f(g(' + x + ')) = ' + v + '$.'
      ],
      key: 'With a table, composition is two lookups in the right order. Using the $f$ row first is the standard slip.'
    });
  });

  L.gen('pc.fn.comp', '2', function () {
    var f = [nz(-3, 4), ri(-6, 6), ri(-8, 8)], g = [nz(-3, 3), nz(-5, 5)];
    /* f(g(x)) */
    var g2 = P.mul(g, g);
    var res = P.add(P.add(P.scale(g2, f[0]), P.scale(g, f[1])), [f[2]]);
    var wrongNoMid = P.add([f[0] * g[0] * g[0], 0, f[0] * g[1] * g[1]], P.add(P.scale(g, f[1]), [f[2]]));
    var other = P.add(P.scale(f, g[0]), [g[1]]);     /* g(f(x)) */
    return q({
      prompt: 'If $f(x) = ' + P.tex(f) + '$ and $g(x) = ' + P.tex(g) + '$, find $(f \\circ g)(x)$.',
      _mc: mcTex(P.tex(res), [P.tex(other), P.tex(wrongNoMid), P.tex(P.add(f, g)), P.tex([res[0], -res[1], res[2]])]),
      expl: [
        '$(f \\circ g)(x)$ means $f(g(x))$: substitute $g(x) = ' + P.tex(g) + '$ into every $x$ of $f$, with brackets.',
        '$f(g(x)) = ' + f[0] + '(' + P.tex(g) + ')^2' + sg(f[1]) + '(' + P.tex(g) + ')' + sg(f[2]) + '$.',
        'Expand the square: $(' + P.tex(g) + ')^2 = ' + P.tex(g2) + '$.',
        'Distribute and collect: $' + P.tex(res) + '$.'
      ],
      key: 'Brackets first, expansion second. Squaring a binomial always produces three terms.'
    });
  });

  L.gen('pc.fn.comp', '2', function () {
    var f = [nz(-4, 4), nz(-7, 7)], g = [nz(-3, 4), nz(-6, 6)];
    var fg = P.add(P.scale(g, f[0]), [f[1]]);
    var gf = P.add(P.scale(f, g[0]), [g[1]]);
    if (P.tex(fg) === P.tex(gf)) { g[1] = g[1] + 1; fg = P.add(P.scale(g, f[0]), [f[1]]); gf = P.add(P.scale(f, g[0]), [g[1]]); }
    return q({
      prompt: 'With $f(x) = ' + P.tex(f) + '$ and $g(x) = ' + P.tex(g) + '$, find $(g \\circ f)(x)$.',
      _mc: mcTex(P.tex(gf), [P.tex(fg), P.tex(P.mul(f, g)), P.tex(P.add(f, g)), P.tex([gf[0], -gf[1]])]),
      expl: [
        '$(g \\circ f)(x) = g(f(x))$: the function written second, $f$, acts first.',
        'Substitute: $g(' + P.tex(f) + ') = ' + g[0] + '(' + P.tex(f) + ')' + sg(g[1]) + '$.',
        'Distribute: $' + P.tex(gf) + '$.',
        'Compare with $(f \\circ g)(x) = ' + P.tex(fg) + '$ — different, as usual.'
      ],
      key: 'Composition is not commutative. Getting the order right is half of every composition question.'
    });
  });

  L.gen('pc.fn.comp', '3', function () {
    var a = nz(-6, 6), b = nz(-6, 6);
    if (a === b) b = a + 2;
    return q({
      prompt: 'If $f(x) = \\sqrt{x}$ and $g(x) = x' + sg(-a) + '$, what is the domain of $(f \\circ g)(x)$?',
      _mc: mcTex(iv(a, INF, 0, 1), [iv(-a, INF, 0, 1), iv(-INF, a, 1, 0), iv(-INF, INF, 1, 1)]),
      expl: [
        '$(f \\circ g)(x) = \\sqrt{x' + sg(-a) + '}$.',
        '$g$ itself is defined everywhere, so the only restriction comes from the outer function.',
        '$f$ rejects negative inputs, so we need $g(x) \\ge 0$: $x' + sg(-a) + ' \\ge 0$, hence $x \\ge ' + a + '$.',
        'Domain: $' + iv(a, INF, 0, 1) + '$.'
      ],
      key: 'Two conditions always: $x$ legal for the inner function, and the inner output legal for the outer one.'
    });
  });

  L.gen('pc.fn.comp', '3', function () {
    var n = pick([2, 3]), k = nz(-7, 7), a = pick([1, 2, 3]);
    var inner = P.tex([a, k]);
    var h = n === 2 ? '\\sqrt{' + inner + '}' : '(' + inner + ')^{3}';
    var outer = n === 2 ? '\\sqrt{x}' : 'x^{3}';
    return q({
      prompt: 'If $h(x) = ' + h + '$ and $h = f \\circ g$, which pair of functions works?',
      _mc: mcText('$f(x) = ' + outer + '$, $g(x) = ' + inner + '$',
        ['$f(x) = ' + inner + '$, $g(x) = ' + outer + '$',
          '$f(x) = ' + outer + '$, $g(x) = x$',
          '$f(x) = x$, $g(x) = ' + h + '$']),
      expl: [
        '$f \\circ g$ means $f(g(x))$, so $g$ is the <b>inner</b> function — whatever sits inside.',
        'Here the expression inside is $' + inner + '$, so $g(x) = ' + inner + '$.',
        'What happens to it afterwards is the outer function: $f(x) = ' + outer + '$.',
        'Check: $f(g(x)) = ' + h + '$. ✓'
      ],
      key: 'Inner is what sits inside the root, the bracket or the exponent. Spotting the layers now makes the chain rule nearly free later.'
    });
  });

  L.gen('pc.fn.comp', '4', function () {
    var f = [nz(-3, 3), ri(-6, 6)], g = [nz(-3, 3), ri(-6, 6)], root = nz(-4, 4);
    var fg0 = P.add(P.scale(g, f[0]), [f[1]]);          /* f(g(x)) = A x + B */
    var k = P.eval(fg0, root);
    return q({
      prompt: 'If $f(x) = ' + P.tex(f) + '$ and $g(x) = ' + P.tex(g) + '$, solve $f(g(x)) = ' + k + '$.',
      spr: true, value: root,
      expl: [
        'First build the composition: $f(g(x)) = ' + f[0] + '(' + P.tex(g) + ')' + sg(f[1]) + ' = ' + P.tex(fg0) + '$.',
        'Now solve $' + P.tex(fg0) + ' = ' + k + '$.',
        'Subtract $' + fg0[1] + '$: $' + fg0[0] + 'x = ' + (k - fg0[1]) + '$.',
        'Divide: $x = ' + root + '$.'
      ],
      key: 'Compose first, then solve. Trying to solve layer by layer works too, but composing keeps the bookkeeping honest.'
    });
  });

  L.gen('pc.fn.comp', '4', function () {
    var f = [nz(-3, 4), ri(-7, 7)], x = nz(-4, 4);
    var once = P.eval(f, x), twice = P.eval(f, once);
    return q({
      prompt: 'Let $f(x) = ' + P.tex(f) + '$. What is $f(f(' + x + '))$?',
      spr: true, value: twice,
      expl: [
        'Inner first: $f(' + x + ') = ' + f[0] + '(' + x + ')' + sg(f[1]) + ' = ' + once + '$.',
        'Now apply $f$ to that result: $f(' + once + ') = ' + f[0] + '(' + once + ')' + sg(f[1]) + ' = ' + twice + '$.',
        'Answer: $' + twice + '$.'
      ],
      key: 'Self-composition is just substitution twice. There is nothing special about using the same function.'
    });
  });

  L.gen('pc.fn.comp', '5', function () {
    var f = [nz(-3, 3), ri(-5, 5)], g = [nz(-3, 3), ri(-5, 5)], h = [nz(-3, 3), ri(-5, 5)], x = nz(-4, 4);
    var v1 = P.eval(h, x), v2 = P.eval(g, v1), v3 = P.eval(f, v2);
    return q({
      prompt: 'Let $f(x) = ' + P.tex(f) + '$, $g(x) = ' + P.tex(g) + '$ and $h(x) = ' + P.tex(h) +
        '$. What is $(f \\circ g \\circ h)(' + x + ')$?',
      spr: true, value: v3,
      expl: [
        'Innermost first: $h(' + x + ') = ' + v1 + '$.',
        'Then $g$: $g(' + v1 + ') = ' + v2 + '$.',
        'Then $f$: $f(' + v2 + ') = ' + v3 + '$.',
        'Answer: $' + v3 + '$.'
      ],
      key: 'Three layers, three steps, written down one at a time. Trying to hold them in your head is how layers get skipped.'
    });
  });

  L.gen('pc.fn.comp', '5', function () {
    var a = nz(2, 6), b = nz(-8, 8);
    return q({
      prompt: 'If $f(x) = \\sqrt{x}$ and $g(x) = x^{2}$, which statement about $(f \\circ g)(x)$ is correct?',
      _mc: mcText('$(f \\circ g)(x) = |x|$, defined for all real $x$.',
        ['$(f \\circ g)(x) = x$, defined for all real $x$.',
          '$(f \\circ g)(x) = x$, defined only for $x \\ge 0$.',
          '$(f \\circ g)(x) = x^{2}$, defined for all real $x$.']),
      expl: [
        '$(f \\circ g)(x) = f(x^2) = \\sqrt{x^2}$.',
        'Squaring destroys the sign, and the square root returns only the non-negative value.',
        'So $\\sqrt{x^2} = |x|$, not $x$. Test it: at $x = -3$ you get $\\sqrt{9} = 3$, not $-3$.',
        'Every real number is legal as an input, so the domain is all real numbers.'
      ],
      key: 'A function and its "undoing" only cancel on the right domain. $\\sqrt{x^2} = |x|$ is the standard counterexample.'
    });
  });

  /* ================================================================= pc.fn.inverse */

  L.gen('pc.fn.inverse', '1', function () {
    var a = nz(-6, 6), b = nz(-9, 9);
    var inv = '\\dfrac{x' + sg(-b) + '}{' + a + '}';
    return q({
      prompt: 'If $f(x) = ' + P.tex([a, b]) + '$, what is $f^{-1}(x)$?',
      _mc: mcTex(inv, ['\\dfrac{x' + sg(b) + '}{' + a + '}', '\\dfrac{1}{' + P.tex([a, b]) + '}', P.tex([a, -b])]),
      expl: [
        'Write $y = ' + P.tex([a, b]) + '$, then swap the letters: $x = ' + a + 'y' + sg(b) + '$.',
        'Solve for $y$. Subtract $' + b + '$: $x' + sg(-b) + ' = ' + a + 'y$.',
        'Divide by $' + a + '$: $y = ' + inv + '$.',
        'So $f^{-1}(x) = ' + inv + '$.'
      ],
      key: 'Swap, then solve. And note $f^{-1}$ is not $\\frac{1}{f}$ — one of the wrong choices is exactly that.'
    });
  });

  L.gen('pc.fn.inverse', '1', function () {
    var p = nz(-8, 8), qq = nz(-8, 8);
    if (qq === p || qq === -p) qq = p + 3;
    return q({
      prompt: 'The point $(' + p + ',\\ ' + qq + ')$ lies on the graph of $f$. Which point must lie on the graph of $f^{-1}$?',
      _mc: mcText('$(' + qq + ',\\ ' + p + ')$',
        ['$(' + p + ',\\ ' + qq + ')$', '$(' + (-p) + ',\\ ' + (-qq) + ')$', '$(' + (-qq) + ',\\ ' + (-p) + ')$']),
      expl: [
        'The inverse undoes the function: if $f$ sends $' + p + '$ to $' + qq + '$, then $f^{-1}$ sends $' + qq + '$ back to $' + p + '$.',
        'In coordinates, $(a,b)$ on $f$ becomes $(b,a)$ on $f^{-1}$.',
        'That is exactly the reflection across the line $y = x$.',
        'Answer: $(' + qq + ',\\ ' + p + ')$.'
      ],
      key: 'Inversion swaps the coordinates of every point, which is why it swaps domain and range too.'
    });
  });

  L.gen('pc.fn.inverse', '2', function () {
    var a = nz(-6, 6), b = ri(-9, 9), y = ri(-20, 20);
    var v = (y - b) / a;
    return q({
      prompt: 'If $f(x) = ' + P.tex([a, b]) + '$, what is $f^{-1}(' + y + ')$?',
      spr: true, value: v,
      expl: [
        '$f^{-1}(' + y + ')$ asks: which input does $f$ send to $' + y + '$?',
        'Solve $' + P.tex([a, b]) + ' = ' + y + '$.',
        'Subtract $' + b + '$: $' + a + 'x = ' + (y - b) + '$. Divide: $x = ' + fmt(v) + '$.',
        'So $f^{-1}(' + y + ') = ' + fmt(v) + '$.'
      ],
      key: 'You never need the inverse formula to evaluate the inverse at one point — just solve $f(x) = k$.'
    });
  });

  L.gen('pc.fn.inverse', '2', function () {
    var xs = [1, 2, 3, 4, 5], ys = M.shuffle([3, 7, 11, 15, 19]);
    var i = ri(0, 4), target = ys[i];
    return q({
      stem: tbl(xs, ys),
      prompt: 'The table defines a one-to-one function $f$. What is $f^{-1}(' + target + ')$?',
      spr: true, value: xs[i],
      expl: [
        'Scan the $f(x)$ row for the output $' + target + '$.',
        'It appears under the input $x = ' + xs[i] + '$.',
        'So $f^{-1}(' + target + ') = ' + xs[i] + '$.'
      ],
      key: 'Reading an inverse from a table means searching the output row and returning the input above it.'
    });
  });

  L.gen('pc.fn.inverse', '3', function () {
    var a = nz(1, 5), b = nz(-7, 7), d = nz(-7, 7);
    while (b === a * d) b = nz(-7, 7);          /* otherwise the fraction collapses to a constant */
    /* f(x) = (a x + b) / (x + d); inverse = (-d x + b) / (x - a) */
    var num = P.tex([a, b]), den = 'x' + sg(d);
    var invNum = P.tex([-d, b]), invDen = 'x' + sg(-a);
    return q({
      prompt: 'Find $f^{-1}(x)$ for $f(x) = \\dfrac{' + num + '}{' + den + '}$.',
      _mc: mcTex('\\dfrac{' + invNum + '}{' + invDen + '}',
        ['\\dfrac{' + den + '}{' + num + '}',
          '\\dfrac{' + P.tex([d, b]) + '}{' + invDen + '}',
          '\\dfrac{' + invNum + '}{x' + sg(a) + '}']),
      expl: [
        'Swap: $x = \\dfrac{' + a + 'y' + sg(b) + '}{y' + sg(d) + '}$.',
        'Clear the denominator: $x(y' + sg(d) + ') = ' + a + 'y' + sg(b) + '$, so $xy' + sg(d) + 'x = ' + a + 'y' + sg(b) + '$.',
        'Gather every $y$ term on one side: $xy - ' + a + 'y = ' + (-d) + 'x' + sg(b) + '$.',
        'Factor: $y(x' + sg(-a) + ') = ' + invNum + '$, so $f^{-1}(x) = \\dfrac{' + invNum + '}{' + invDen + '}$.'
      ],
      key: 'Gathering the $y$ terms and factoring is the step that makes rational inverses work. Everything else is bookkeeping.'
    });
  });

  L.gen('pc.fn.inverse', '3', function () {
    var a = nz(-5, 5), b = nz(-8, 8);
    return q({
      prompt: 'Find the inverse of $f(x) = ' + a + 'x^{3}' + sg(b) + '$.',
      _mc: mcTex('\\sqrt[3]{\\dfrac{x' + sg(-b) + '}{' + a + '}}',
        ['\\dfrac{\\sqrt[3]{x}' + sg(-b) + '}{' + a + '}',
          '\\sqrt[3]{\\dfrac{x' + sg(b) + '}{' + a + '}}',
          '\\dfrac{1}{' + a + 'x^{3}' + sg(b) + '}']),
      expl: [
        'Swap: $x = ' + a + 'y^{3}' + sg(b) + '$.',
        'Undo in reverse order. The $' + (b >= 0 ? '+' : '-') + Math.abs(b) + '$ went on last, so subtract it first: $x' + sg(-b) + ' = ' + a + 'y^{3}$.',
        'Divide by $' + a + '$: $y^{3} = \\dfrac{x' + sg(-b) + '}{' + a + '}$.',
        'Take the cube root: $f^{-1}(x) = \\sqrt[3]{\\dfrac{x' + sg(-b) + '}{' + a + '}}$. No $\\pm$ is needed, because cube roots are single-valued.'
      ],
      key: 'Unwrap the operations in reverse order, like undoing a parcel. Odd roots need no sign choice.'
    });
  });

  L.gen('pc.fn.inverse', '4', function () {
    var h = nz(-5, 5), k = nz(-8, 8), left = coin();
    var branch = left ? '-' : '';
    var inv = (left ? '-' : '') + '\\sqrt{x' + sg(-k) + '}' + sg(h);
    return q({
      prompt: 'Let $f(x) = (x' + sg(-h) + ')^{2}' + sg(k) + '$ with domain $x ' + (left ? '\\le ' : '\\ge ') + h + '$. What is $f^{-1}(x)$?',
      _mc: mcTex(inv, [(left ? '' : '-') + '\\sqrt{x' + sg(-k) + '}' + sg(h),
        '\\pm\\sqrt{x' + sg(-k) + '}' + sg(h),
        (left ? '-' : '') + '\\sqrt{x' + sg(k) + '}' + sg(h)]),
      expl: [
        'On the full real line this parabola is not one-to-one, which is why the domain has been restricted.',
        'Swap: $x = (y' + sg(-h) + ')^{2}' + sg(k) + '$, so $(y' + sg(-h) + ')^{2} = x' + sg(-k) + '$.',
        'Taking a square root normally gives $\\pm$, but the restriction $x ' + (left ? '\\le' : '\\ge') + ' ' + h +
        '$ means the output of $f^{-1}$ must be ' + (left ? 'at most' : 'at least') + ' $' + h + '$, so keep the ' + (left ? 'negative' : 'positive') + ' branch.',
        '$f^{-1}(x) = ' + inv + '$.'
      ],
      key: 'A restricted domain picks one branch. Writing $\\pm$ would produce a relation, not a function.'
    });
  });

  L.gen('pc.fn.inverse', '4', function () {
    var lo = nz(-6, 2), hi = lo + ri(3, 8);
    if (lo === -hi) hi = hi + 1;            /* a symmetric domain would make two distractors agree */
    var rlo = Math.max(hi, -lo) + ri(2, 9), rhi = rlo + ri(2, 9);
    return q({
      prompt: 'A one-to-one function $f$ has domain $' + iv(lo, hi, 0, 0) + '$ and range $' + iv(rlo, rhi, 0, 0) + '$. What is the domain of $f^{-1}$?',
      _mc: mcTex(iv(rlo, rhi, 0, 0),
        [iv(lo, hi, 0, 0), iv(-hi, -lo, 0, 0), iv(-INF, INF, 1, 1)]),
      expl: [
        'The inverse reverses the direction of the machine: it takes outputs of $f$ and returns inputs of $f$.',
        'So the legal inputs of $f^{-1}$ are exactly the outputs of $f$.',
        'That is the range of $f$: $' + iv(rlo, rhi, 0, 0) + '$.',
        'And correspondingly, the range of $f^{-1}$ is the domain of $f$.'
      ],
      key: 'Domain and range swap under inversion. Always. That swap answers more questions than the formula does.'
    });
  });

  L.gen('pc.fn.inverse', '5', function () {
    var a = nz(2, 5), b = ri(-7, 7);
    var wrongInv = '\\dfrac{1}{' + P.tex([a, b]) + '}';
    var g = '\\dfrac{x' + sg(-b) + '}{' + a + '}';
    var isInv = coin();
    var cand = isInv ? g : wrongInv;
    return q({
      prompt: 'Let $f(x) = ' + P.tex([a, b]) + '$ and $g(x) = ' + cand + '$. Is $g$ the inverse of $f$?',
      _mc: mcText(isInv ? 'Yes — $f(g(x)) = x$ and $g(f(x)) = x$.' : 'No — $g$ is the reciprocal of $f$, not its inverse.',
        [isInv ? 'No — $g$ is the reciprocal of $f$, not its inverse.' : 'Yes — $f(g(x)) = x$ and $g(f(x)) = x$.',
          'Only in one order, not both.', 'Only for $x \\ge 0$.']),
      expl: [
        'The test is composition: $g$ is the inverse of $f$ exactly when $f(g(x)) = x$ and $g(f(x)) = x$.',
        isInv
          ? 'Compute $f(g(x)) = ' + a + '\\left(' + g + '\\right)' + sg(b) + ' = x' + sg(-b) + sg(b) + ' = x$. ✓'
          : 'Compute $f(g(x)) = ' + a + '\\left(' + wrongInv + '\\right)' + sg(b) + '$, which does not simplify to $x$.',
        isInv ? 'The other order gives $x$ as well, so they are inverses.'
          : 'The notation $f^{-1}$ looks like a reciprocal but never means one. $[f(x)]^{-1} = \\frac{1}{f(x)}$ is a different function entirely.'
      ],
      key: 'Verify an inverse by composing both ways. And never read $f^{-1}$ as $\\frac{1}{f}$.'
    });
  });

  L.gen('pc.fn.inverse', '5', function () {
    var inc = coin();
    return q({
      prompt: 'Which condition guarantees that a function $f$ has an inverse function?',
      _mc: mcText('$f$ is one-to-one: every horizontal line meets its graph at most once.',
        ['$f$ is continuous on its domain.',
          '$f$ passes the vertical line test.',
          '$f$ has a domain of all real numbers.']),
      expl: [
        'For the undoing to be a function, each output must come from exactly one input.',
        'That is precisely the one-to-one condition, tested graphically by horizontal lines.',
        'The vertical line test only says $f$ is a function in the first place — it says nothing about invertibility.',
        'Continuity and a full domain are both irrelevant: $f(x) = \\frac{1}{x}$ is neither continuous nor defined everywhere, yet it is its own inverse.'
      ],
      key: 'Vertical line test: is it a function. Horizontal line test: does it have an inverse function. Two different questions.'
    });
  });

})(window.LEARN, window.MX);
