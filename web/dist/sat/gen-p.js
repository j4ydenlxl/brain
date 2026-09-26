/* gen-p.js — Advanced Math (P.A–P.C). Archetypes clustered from the live SAT question bank. */
(function (S) {
  'use strict';
  var ri = S.ri, pick = S.pick, coin = S.coin, com = S.com, fr = S.fr, mc = S.mc, mcNum = S.mcNum,
      quad = S.quad, lin = S.lin, pt = S.pt, gcd = S.gcd, isInt = S.isInt;

  function sup(b, e) { return e === 1 ? b : b + '^{' + e + '}'; }

  /* ============================ P.A. Equivalent expressions ============================ */

  // product of powers
  S.reg('P.A.', 'E', function () {
    var v = S.pickn(['m', 'q', 'z', 'w', 'k'], 3);
    var a1 = ri(2, 6), a2 = ri(1, 5), b1 = ri(2, 6), b2 = ri(2, 6), c1 = -ri(1, 3), c2 = ri(2, 5);
    var A = a1 + a2, B = b1 + b2, C = c1 + c2;
    if (C === 0) throw 0;                        // a zero exponent would print as z^{0}
    var right = '$' + sup(v[0], A) + sup(v[1], B) + sup(v[2], C) + '$';
    var o = mc(right, ['$' + sup(v[0], a1 * a2 || A + 1) + sup(v[1], b1 * b2) + sup(v[2], c1 * c2) + '$',
                       '$' + sup(v[0], A) + sup(v[1], B) + sup(v[2], c1 - c2) + '$',
                       '$' + sup(v[0], a1) + sup(v[1], B) + sup(v[2], C) + '$']);
    return {
      stem: '',
      prompt: 'Which expression is equivalent to $\\left(' + sup(v[0], a1) + sup(v[1], b1) + sup(v[2], c1) + '\\right)\\left(' + sup(v[0], a2) + sup(v[1], b2) + sup(v[2], c2) + '\\right)$, where $' + v[0] + '$, $' + v[1] + '$, and $' + v[2] + '$ are positive?',
      choices: o.choices, correct: o.correct,
      expl: ['Multiplying powers with the same base adds the exponents: $x^a \\cdot x^b = x^{a+b}$.',
             'For $' + v[0] + '$: $' + a1 + ' + ' + a2 + ' = ' + A + '$. For $' + v[1] + '$: $' + b1 + ' + ' + b2 + ' = ' + B + '$.',
             'For $' + v[2] + '$: $(' + c1 + ') + ' + c2 + ' = ' + C + '$.',
             'So the product is $' + sup(v[0], A) + sup(v[1], B) + sup(v[2], C) + '$.'],
      key: 'Same base multiplied: add exponents. Negative exponents still add.'
    };
  });

  // rational expression with a common binomial factor
  S.reg('P.A.', 'M', function () {
    var a = ri(3, 9), b = ri(2, 9), r = ri(3, 11), k = ri(2, 4);
    var right = '$\\frac{' + a + 'x - ' + b + '}{' + k + '}$';
    var o = mc(right, ['$\\frac{x - ' + r + '}{' + k + '}$', '$' + (a) + 'x - ' + b + '$',
                       '$\\frac{' + a + 'x^2 - ' + b + '}{' + k + '}$']);
    return {
      stem: '',
      prompt: 'Which expression is equivalent to $\\frac{' + a + 'x(x - ' + r + ') - ' + b + '(x - ' + r + ')}{' + (k) + 'x - ' + (k * r) + '}$, where $x > ' + r + '$?',
      choices: o.choices, correct: o.correct,
      expl: ['The numerator has the common factor $(x - ' + r + ')$: it equals $(x - ' + r + ')(' + a + 'x - ' + b + ')$.',
             'Factor the denominator: $' + k + 'x - ' + (k * r) + ' = ' + k + '(x - ' + r + ')$.',
             'Because $x > ' + r + '$, the factor $(x - ' + r + ')$ is not zero, so it cancels.',
             'What remains is $\\frac{' + a + 'x - ' + b + '}{' + k + '}$.'],
      key: 'Factor both parts before cancelling; the domain note tells you cancelling is legal.'
    };
  });

  // factoring a quadratic: which of I and II are factors
  S.reg('P.A.', 'H', function () {
    var a = ri(2, 5), p = ri(2, 9), q = ri(2, 11);
    // (a x - p)(x + q) = a x^2 + (a q - p) x - p q
    var B = a * q - p, C = -p * q;
    var f1 = 'x + ' + q, f2 = a + 'x - ' + p;
    var wrong1 = 'x - ' + q;
    var o = mc('II only', ['I only', 'I and II', 'Neither I nor II']);
    return {
      stem: '<p>Consider the expression $' + quad(a, B, C) + '$ and the two expressions below.</p>' +
            '<p style="margin-left:18px">I. $' + wrong1 + '$<br>II. $' + f2 + '$</p>',
      prompt: 'Which of the expressions is(are) a factor of $' + quad(a, B, C) + '$?',
      choices: o.choices, correct: o.correct,
      expl: ['Factor the quadratic. It equals $(' + f2 + ')(' + f1 + ')$ — check by expanding: $' + a + 'x \\cdot x = ' + a + 'x^2$, the middle term is $' + a + '(' + q + ')x - ' + p + 'x = ' + B + 'x$, and the constant is $-' + p + ' \\cdot ' + q + ' = ' + C + '$.',
             'So $' + f2 + '$ (expression II) is a factor.',
             'Expression I is $' + wrong1 + '$, but the actual factor is $' + f1 + '$, with the opposite sign, so I is not a factor.',
             'A fast check: substituting $x = ' + q + '$ into the quadratic gives $' + (a * q * q + B * q + C) + '$, which is not $0$, confirming $' + wrong1 + '$ is not a factor.'],
      key: 'A binomial $x - r$ is a factor exactly when substituting $x = r$ gives $0$.'
    };
  });

  /* ============================ P.B. Nonlinear equations and systems ============================ */

  // linear + parabola sharing an intercept
  S.reg('P.B.', 'E', function () {
    var m = ri(2, 9), b = ri(2, 12), xo = ri(2, 9);
    var o = mc('$' + pt(0, b) + '$', ['$' + pt(0, 0) + '$', '$' + pt(xo, m * xo + b) + '$', '$' + pt(b, 0) + '$']);
    return {
      stem: '<p style="text-align:center">$y = ' + lin(m, b, 'x') + '$<br>$y = ' + quad(m, 0, b) + '$</p>',
      prompt: 'Which ordered pair $(x, y)$ is a solution to the given system of equations?',
      choices: o.choices, correct: o.correct,
      expl: ['Set the two right sides equal: $' + m + 'x + ' + b + ' = ' + m + 'x^2 + ' + b + '$.',
             'Subtract $' + b + '$ from both sides and then $' + m + 'x$: $0 = ' + m + 'x^2 - ' + m + 'x = ' + m + 'x(x - 1)$.',
             'So $x = 0$ or $x = 1$. At $x = 0$ both equations give $y = ' + b + '$.',
             'Therefore $' + pt(0, b) + '$ is a solution.'],
      key: 'Set the expressions equal, move everything to one side, factor.'
    };
  });

  // rearrange a formula
  S.reg('P.B.', 'M', function () {
    var k = ri(2, 30) * 5, v = pick(['v', 'a', 'g']), w = pick(['w', 'h', 'm']), x = pick(['x', 'z', 'n']);
    var right = '$' + w + ' = -' + k + v + x + '$';
    var o = mc(right, ['$' + w + ' = -\\frac{' + k + v + '}{' + x + '}$', '$' + w + ' = -\\frac{' + x + '}{' + k + v + '}$', '$' + w + ' = \\frac{' + k + v + '}{' + x + '}$']);
    return {
      stem: '<p style="text-align:center">$' + v + ' = -\\frac{' + w + '}{' + k + x + '}$</p><p>The given equation relates the distinct positive numbers $' + v + '$, $' + w + '$, and $' + x + '$.</p>',
      prompt: 'Which equation correctly expresses $' + w + '$ in terms of $' + v + '$ and $' + x + '$?',
      choices: o.choices, correct: o.correct,
      expl: ['The unknown $' + w + '$ sits in the numerator of a fraction, so clear the fraction first.',
             'Multiply both sides by $' + k + x + '$: $' + k + x + v + ' = -' + w + '$.',
             'Multiply both sides by $-1$: $' + w + ' = -' + k + v + x + '$.'],
      key: 'Clear the denominator by multiplying, then fix the sign last.'
    };
  });

  // positive solution of a quadratic
  S.reg('P.B.', 'M', function () {
    var r = ri(2, 12), s = ri(2, 12);
    var B = -(r - s), C = -r * s;
    return {
      spr: true, value: r,
      stem: '<p style="text-align:center">$' + quad(1, B, C) + ' = 0$</p>',
      prompt: 'What is the positive solution to the given equation?',
      expl: ['Look for two numbers whose product is $' + C + '$ and whose sum is $' + B + '$.',
             'Those numbers are $' + (-r) + '$ and $' + s + '$, so the equation factors as $(x - ' + r + ')(x + ' + s + ') = 0$.',
             'Setting each factor to zero gives $x = ' + r + '$ or $x = ' + (-s) + '$.',
             'The positive solution is $x = ' + r + '$.'],
      key: 'Factor by finding the pair that multiplies to $c$ and adds to $b$.'
    };
  });

  // sum of solutions with a constant
  S.reg('P.B.', 'H', function () {
    var d = ri(3, 9), a = ri(2, 12), sum = ri(20, 80);
    var k = sum;   // roots are k, a, -a  -> sum = k
    return {
      spr: true, value: k,
      stem: '<p style="text-align:center">$\\frac{1}{' + d + '}(x - k)(' + (a * a) + ' - x^2) = 0$</p>',
      prompt: 'In the given equation, $k$ is a positive constant. The sum of the solutions to the equation is $' + sum + '$. What is the value of $k$?',
      expl: ['A product equals zero when one of its factors is zero, and the $\\frac{1}{' + d + '}$ out front never is.',
             'From $x - k = 0$ the first solution is $x = k$.',
             'From $' + (a * a) + ' - x^2 = 0$ we get $x^2 = ' + (a * a) + '$, so $x = ' + a + '$ and $x = -' + a + '$.',
             'Those last two cancel in the sum: $k + ' + a + ' + (-' + a + ') = k$.',
             'So the sum of the solutions is just $k$, giving $k = ' + sum + '$.'],
      key: 'A difference of squares contributes a pair of opposite roots that sum to zero.'
    };
  });

  // no real solutions -> discriminant bound
  S.reg('P.B.', 'H', function () {
    var c = ri(20, 80), a = 1;
    // x^2 + q x + c = 0 has no real solutions when q^2 < 4c  -> largest integer q
    var lim = Math.sqrt(4 * c), q = Math.ceil(lim) - 1;
    if (q * q >= 4 * c) q -= 1;
    return {
      spr: true, value: q,
      stem: '<p style="text-align:center">$x^2 + qx + ' + c + ' = 0$</p>',
      prompt: 'In the given equation, $q$ is an integer constant. The equation has no real solutions. What is the largest possible value of $q$?',
      expl: ['A quadratic $ax^2 + bx + c = 0$ has no real solutions exactly when its discriminant $b^2 - 4ac$ is negative.',
             'Here $a = 1$, $b = q$, $c = ' + c + '$, so the condition is $q^2 - 4(' + c + ') < 0$, that is $q^2 < ' + (4 * c) + '$.',
             'Taking square roots, $|q| < \\sqrt{' + (4 * c) + '} \\approx ' + S.round(lim, 3) + '$.',
             'The largest integer strictly below $' + S.round(lim, 3) + '$ is $' + q + '$.'],
      key: 'No real solutions means discriminant $< 0$; then watch the word "integer".'
    };
  });

  /* ============================ P.C. Nonlinear functions ============================ */

  // evaluate a cubic
  S.reg('P.C.', 'E', function () {
    var c = ri(2, 20), x = ri(2, 4), p = pick([2, 3]);
    var val = Math.pow(x, p) + c;
    var o = mcNum(val, [x * p + c, Math.pow(x, p), c + x, val + 1]);
    return {
      stem: '<p>The function $f$ is defined by $f(x) = x^' + p + ' + ' + c + '$.</p>',
      prompt: 'What is the value of $f(' + x + ')$?',
      choices: o.choices, correct: o.correct,
      expl: ['Substitute $x = ' + x + '$ into the rule: $f(' + x + ') = ' + x + '^' + p + ' + ' + c + '$.',
             'Evaluate the power first: $' + x + '^' + p + ' = ' + Math.pow(x, p) + '$.',
             'Then add: $' + Math.pow(x, p) + ' + ' + c + ' = ' + com(val) + '$.'],
      key: 'Exponent before addition; the exponent applies only to $x$.'
    };
  });

  // minimum value of a shifted parabola
  S.reg('P.C.', 'M', function () {
    var c = ri(20, 90);
    var o = mcNum(-c, [-(c * c), c, c * c]);
    return {
      stem: '<p style="text-align:center">$p(x) + ' + c + ' = x^2$</p><p>The given equation relates the value of $x$ and its corresponding value of $p(x)$ for the function $p$.</p>',
      prompt: 'What is the minimum value of the function $p$?',
      choices: o.choices, correct: o.correct,
      expl: ['Solve the relation for $p(x)$: $p(x) = x^2 - ' + c + '$.',
             'The graph is a parabola opening upward, so its lowest point is at the vertex.',
             'The vertex of $x^2 - ' + c + '$ is at $x = 0$, where $p(0) = 0 - ' + c + ' = -' + c + '$.',
             'So the minimum value is $-' + c + '$. (The value $x = 0$ is where it happens; the question asks for the value of the function there.)'],
      key: 'Isolate $f(x)$ first; $x^2$ bottoms out at $0$, so the constant is the minimum.'
    };
  });

  // exponential model
  S.reg('P.C.', 'M', function () {
    var a = ri(2, 40) * 50, r = pick([2, 3, 1.5, 0.5, 0.8]), t = ri(2, 4);
    var per = pick(['year', 'hour', 'decade']);
    var val = a * Math.pow(r, t);
    if (!isInt(val)) throw 0;
    var o = mcNum(val, [a * r * t, a + r * t, a * Math.pow(r, t - 1)]);
    return {
      stem: '<p>The function $f(x) = ' + com(a) + '(' + r + ')^{x}$ models a population $x$ ' + per + 's after it was first measured.</p>',
      prompt: 'What does the model give for the population $' + t + '$ ' + per + 's after it was first measured?',
      choices: o.choices, correct: o.correct,
      expl: ['Substitute $x = ' + t + '$: $f(' + t + ') = ' + com(a) + '(' + r + ')^{' + t + '}$.',
             'Evaluate the power: $' + r + '^{' + t + '} = ' + S.round(Math.pow(r, t), 5) + '$.',
             'Multiply: $' + com(a) + ' \\times ' + S.round(Math.pow(r, t), 5) + ' = ' + com(val) + '$.',
             'Note the base multiplies the whole previous value each ' + per + ', which is why this is exponential and not linear.'],
      key: 'In $a \\cdot b^x$, $a$ is the starting value and $b$ is the per-period multiplier.'
    };
  });

  // vertex: value of x at the minimum
  S.reg('P.C.', 'M', function () {
    var h = ri(-9, 9), k = ri(-30, 30), a = ri(1, 4);
    var B = -2 * a * h, C = a * h * h + k;
    var o = mcNum(h, [-h, k, B, -B]);
    return {
      stem: '<p>The function $f$ is defined by $f(x) = ' + quad(a, B, C) + '$.</p>',
      prompt: 'For what value of $x$ does $f$ reach its minimum?',
      choices: o.choices, correct: o.correct,
      expl: ['The parabola opens upward because the leading coefficient $' + a + '$ is positive, so the minimum is at the vertex.',
             'The vertex is at $x = -\\frac{b}{2a} = -\\frac{' + B + '}{2(' + a + ')} = ' + h + '$.',
             'Written in vertex form the function is $f(x) = ' + a + '(x ' + (h < 0 ? '+ ' + Math.abs(h) : '- ' + h) + ')^2 ' + (k < 0 ? '- ' + Math.abs(k) : '+ ' + k) + '$, which shows the same thing.'],
      key: '$x = -b/2a$ locates the vertex; the sign of $a$ says min or max.'
    };
  });

  // shifted cubic: product of the zeros after a vertical shift question
  S.reg('P.C.', 'H', function () {
    var r = S.pickn([1, 2, 3, 4, 5, 6], 3), shift = ri(2, 9);
    var val = r[0] * r[1] * r[2] * shift;
    return {
      spr: true, value: val,
      stem: '<p style="text-align:center">$f(x) = (x - ' + r[0] + ')(x - ' + r[1] + ')(x - ' + r[2] + ')$</p>' +
            '<p>In the $xy$-plane, the graph of $y = f(x)$ is shifted up $' + shift + '$ units to produce the graph of $y = g(x)$.</p>',
      prompt: 'What is the value of $g(0) - f(0) + ' + com(Math.abs(r[0] * r[1] * r[2])) + ' \\cdot ' + (shift - 1) + '$?',
      expl: ['Shifting a graph up $' + shift + '$ units adds $' + shift + '$ to every output: $g(x) = f(x) + ' + shift + '$.',
             'So $g(0) - f(0) = ' + shift + '$, no matter what $f(0)$ is.',
             'Next, $f(0) = (0 - ' + r[0] + ')(0 - ' + r[1] + ')(0 - ' + r[2] + ') = ' + (-r[0] * -r[1] * -r[2]) + '$, so $|f(0)| = ' + (r[0] * r[1] * r[2]) + '$.',
             'The expression is therefore $' + shift + ' + ' + (r[0] * r[1] * r[2]) + ' \\cdot ' + (shift - 1) + ' = ' + shift + ' + ' + (r[0] * r[1] * r[2] * (shift - 1)) + ' = ' + com(val) + '$.'],
      key: 'A vertical shift changes outputs by a constant; it never touches the inputs.'
    };
  });

  // interpretation of a value on an exponential model
  S.reg('P.C.', 'H', function () {
    var a = ri(3, 9) * 1000, b = pick([0.82, 0.9, 1.12, 1.25]), t = ri(3, 8);
    var right = b < 1
      ? 'The value decreases by $' + S.round((1 - b) * 100, 1) + '\\%$ each year.'
      : 'The value increases by $' + S.round((b - 1) * 100, 1) + '\\%$ each year.';
    var o = mc(right, ['The value ' + (b < 1 ? 'decreases' : 'increases') + ' by $' + com(a) + '$ each year.',
                       'The value is $' + b + '$ times its original value after $' + t + '$ years.',
                       'The value ' + (b < 1 ? 'decreases' : 'increases') + ' by $' + S.round(b * 100, 1) + '\\%$ each year.']);
    return {
      stem: '<p>The function $v(t) = ' + com(a) + '(' + b + ')^{t}$ models the value, in dollars, of an asset $t$ years after it was purchased.</p>',
      prompt: 'Which is the best interpretation of $' + b + '$ in this context?',
      choices: o.choices, correct: o.correct,
      expl: ['In $a \\cdot b^t$ the base $b$ is the factor the value is multiplied by each year.',
             'Here each year the value becomes $' + b + '$ times what it was, which is $' + S.round(b * 100, 1) + '\\%$ of the previous value.',
             'Being $' + S.round(b * 100, 1) + '\\%$ of the previous value means ' + (b < 1 ? 'a decrease' : 'an increase') + ' of $|' + S.round(b * 100, 1) + ' - 100| = ' + S.round(Math.abs(b * 100 - 100), 1) + '\\%$ each year.',
             'The common trap is reading $' + b + '$ as the percent change itself rather than the multiplier.'],
      key: 'The base is the multiplier; subtract from $1$ to get the percent change.'
    };
  });

})(window.SAT);
