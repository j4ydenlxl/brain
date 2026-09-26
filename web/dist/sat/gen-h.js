/* gen-h.js — Algebra (H.A–H.E). Archetypes clustered from the live SAT question bank. */
(function (S) {
  'use strict';
  var ri = S.ri, pick = S.pick, nz = S.nz, coin = S.coin, com = S.com, fr = S.fr, mc = S.mc, mcNum = S.mcNum,
      lin = S.lin, money = S.money, pt = S.pt, gcd = S.gcd, pickn = S.pickn;

  var NAMES = ['Amara', 'Leo', 'Priya', 'Hana', 'Mateo', 'Nadia', 'Omar', 'Jae', 'Ivy', 'Tomas', 'Sana', 'Diego', 'Nia', 'Rafi'];
  var VARS = ['x', 'p', 'k', 'n', 't', 'w', 'y'];

  /* ============================ H.A. Linear equations in one variable ============================ */

  // "What value of p satisfies 2p + 275 = 325?"
  S.reg('H.A.', 'EM', function (d) {
    var v = pick(VARS), a = d === 'E' ? ri(2, 9) : ri(3, 14), x = d === 'E' ? ri(2, 30) : ri(-20, 40);
    var b = d === 'E' ? ri(20, 300) : ri(-60, 120), c = a * x + b;
    var eq = lin(a, b, v) + ' = ' + com(c);
    var o = mcNum(x, [c - b, b - c, Math.round(c / a), x + a, c - a]);
    return {
      stem: '<p style="text-align:center">$' + eq + '$</p>',
      prompt: 'What value of $' + v + '$ satisfies the given equation?',
      choices: o.choices, correct: o.correct,
      expl: [
        'Undo the constant: subtract $' + com(b) + '$ from both sides, giving $' + a + v + ' = ' + com(c) + ' - ' + com(b) + ' = ' + com(c - b) + '$.',
        'Undo the coefficient: divide both sides by $' + a + '$, giving $' + v + ' = ' + com(c - b) + ' \\div ' + a + ' = ' + com(x) + '$.'
      ],
      key: 'Isolate the variable one operation at a time.'
    };
  });

  // one-time fee plus per-month fee reaching a total
  S.reg('H.A.', 'E', function () {
    var who = pick(['A gym', 'A climbing wall', 'A music streaming service', 'A coworking space']);
    var f = ri(20, 60), m = ri(9, 29), k = ri(4, 14), tot = f + m * k;
    var o = mcNum(k, [k + 1, k - 1, Math.round(tot / m), Math.round(tot / f)]);
    return {
      stem: '<p>' + who + ' charges its members a one-time ' + '$' + money(f) + '$ enrollment fee and a membership fee of $' + money(m) + '$ per month.</p>',
      prompt: 'If there are no charges other than the enrollment fee and the membership fee, after how many months will a member have been charged a total of $' + money(tot) + '$?',
      choices: o.choices, correct: o.correct,
      expl: [
        'Let $x$ be the number of months. The total charged is the one-time fee plus the monthly fee times the months: $' + m + 'x + ' + f + ' = ' + com(tot) + '$.',
        'Subtract the enrollment fee: $' + m + 'x = ' + com(tot) + ' - ' + f + ' = ' + com(tot - f) + '$.',
        'Divide by the monthly fee: $x = ' + com(tot - f) + ' \\div ' + m + ' = ' + k + '$.'
      ],
      key: 'A one-time charge is a constant; a repeated charge is a coefficient.'
    };
  });

  // infinitely many solutions: 2x + 16 = a(x + 8)
  S.reg('H.A.', 'M', function () {
    var a = ri(2, 9), r = ri(3, 12), c = a * r;
    return {
      spr: true, value: a,
      stem: '<p style="text-align:center">$' + a + 'x + ' + c + ' = a(x + ' + r + ')$</p>',
      prompt: 'In the given equation, $a$ is a constant. If the equation has infinitely many solutions, what is the value of $a$?',
      expl: [
        'An equation has infinitely many solutions only when the two sides are the same expression.',
        'Expand the right side: $a(x + ' + r + ') = ax + ' + r + 'a$.',
        'Match the $x$ terms: $' + a + 'x = ax$, so $a = ' + a + '$. (Checking the constants: $' + r + ' \\cdot ' + a + ' = ' + c + '$, which matches.)'
      ],
      key: 'Infinitely many solutions means identical sides: match every coefficient.'
    };
  });

  // harder: fraction form with two constants
  S.reg('H.A.', 'H', function () {
    var m = ri(2, 9), den = pick([4, 5, 7, 8]), a = m * den;      // (a x + b)/den  -> m x + b/den
    var r = ri(3, 12), b = den * ri(2, 9);
    var sden = pick([11, 13, 17, 19]);
    // (ax+b)/den - s/sden = m(x - r)  ->  m x + b/den - s/sden = m x - m r
    // so b/den - s/sden = -m r  ->  s = sden*(b/den + m r)
    var s = sden * (b / den + m * r);
    if (!S.isInt(s) || s <= 0) throw 0;
    return {
      spr: true, value: s,
      stem: '<p style="text-align:center">$\\frac{' + a + 'x + ' + b + '}{' + den + '} - \\frac{s}{' + sden + '} = r(x - ' + r + ')$</p>',
      prompt: 'In the given equation, $s$ and $r$ are constants and $s > 0$. If the equation has infinitely many solutions, what is the value of $s$?',
      expl: [
        'Split the left fraction: $\\frac{' + a + 'x}{' + den + '} + \\frac{' + b + '}{' + den + '} - \\frac{s}{' + sden + '} = ' + m + 'x + ' + (b / den) + ' - \\frac{s}{' + sden + '}$.',
        'Expand the right side: $r(x - ' + r + ') = rx - ' + r + 'r$.',
        'Infinitely many solutions means the sides match term by term. The $x$ terms give $r = ' + m + '$.',
        'The constant terms then give $' + (b / den) + ' - \\frac{s}{' + sden + '} = -' + (m * r) + '$, so $\\frac{s}{' + sden + '} = ' + (b / den) + ' + ' + (m * r) + ' = ' + (b / den + m * r) + '$.',
        'Multiply by $' + sden + '$: $s = ' + sden + ' \\cdot ' + (b / den + m * r) + ' = ' + com(s) + '$.'
      ],
      key: 'Simplify both sides to $mx+c$ form first, then match coefficients.'
    };
  });

  // how many solutions
  S.reg('H.A.', 'M', function () {
    var a = ri(2, 9), b = ri(2, 15), k = ri(2, 6), mode = pick(['none', 'inf', 'one']);
    var left = lin(a * k, b * k, 'x'), right, ans, why;
    if (mode === 'inf') { right = k + '(' + lin(a, b, 'x') + ')'; ans = 'Infinitely many'; why = 'Expanding the right side gives exactly the left side, so every value of $x$ works.'; }
    else if (mode === 'none') { right = k + '(' + lin(a, b + 1, 'x') + ')'; ans = 'Zero'; why = 'Expanding gives $' + (a * k) + 'x + ' + (k * b + k) + '$, which has the same $x$ term but a different constant, so the two sides can never be equal.'; }
    else { right = k + '(' + lin(a + 1, b, 'x') + ')'; ans = 'Exactly one'; why = 'Expanding gives $' + (a * k + k) + 'x + ' + (k * b) + '$. The $x$ coefficients differ, so the equation is solved by exactly one value of $x$.'; }
    var o = mc(ans, ['Zero', 'Exactly one', 'Exactly two', 'Infinitely many'].filter(function (c) { return c !== ans; }));
    return {
      stem: '<p style="text-align:center">$' + left + ' = ' + right + '$</p>',
      prompt: 'How many solutions does the given equation have?',
      choices: o.choices, correct: o.correct,
      expl: ['Expand the right side and compare it with the left.', why,
        'Same $x$ coefficient and same constant means infinitely many; same $x$ coefficient and different constant means none; different $x$ coefficients means exactly one.'],
      key: 'Compare the two sides after expanding: the $x$ coefficients decide the case.'
    };
  });

  /* ============================ H.B. Linear functions ============================ */

  // f(x) = kx, for what value of x does f(x) = N
  S.reg('H.B.', 'E', function () {
    var k = ri(3, 12), x = ri(4, 15), N = k * x;
    var o = mcNum(x, [k, N, N + k, N - k]);
    return {
      stem: '<p>The function $f$ is defined by $f(x) = ' + k + 'x$.</p>',
      prompt: 'For what value of $x$ does $f(x) = ' + com(N) + '$?',
      choices: o.choices, correct: o.correct,
      expl: ['Set the rule equal to the output: $' + k + 'x = ' + com(N) + '$.',
             'Divide both sides by $' + k + '$: $x = ' + com(N) + ' \\div ' + k + ' = ' + x + '$.'],
      key: '"For what value of $x$ does $f(x)=N$" means solve the equation, not evaluate it.'
    };
  });

  // interpretation of the constant term in a context
  S.reg('H.B.', 'EM', function () {
    var who = pick(NAMES), b = ri(20, 60), m = (ri(8, 45) / 100);
    var unit = pick([['liquid in a container', 'centimeters (cm)', 'days'], ['snow on a roof', 'centimeters (cm)', 'hours'], ['water in a tank', 'liters', 'minutes']]);
    var right = 'The estimated ' + unit[0].split(' ')[0] + ' height, in ' + unit[1] + ', at the start';
    var o = mc(
      'The estimated height, in ' + unit[1] + ', of the ' + unit[0].split(' ')[0] + ' at the start',
      ['The estimated height, in ' + unit[1] + ', of the ' + unit[0].split(' ')[0] + ' at the end',
       'The estimated decrease, in ' + unit[1] + ', of the height each ' + unit[2].replace(/s$/, ''),
       'The estimated number of ' + unit[2] + ' it takes the height to reach $0$']);
    return {
      stem: '<p>As part of a science project, ' + who + ' measured the height of the ' + unit[0] + ' over time. The function $f(x) = ' + b + ' - ' + m + 'x$ gives the estimated height, in ' + unit[1] + ', $x$ ' + unit[2] + ' after the start of the project.</p>',
      prompt: 'Which is the best interpretation of $' + b + '$ in this context?',
      choices: o.choices, correct: o.correct,
      expl: ['In $f(x) = mx + b$ the constant $b$ is the output when $x = 0$.',
             'Here $f(0) = ' + b + ' - ' + m + '(0) = ' + b + '$, and $x = 0$ is the start of the project.',
             'So $' + b + '$ is the estimated height at the start. The $-' + m + '$ is the change per ' + unit[2].replace(/s$/, '') + ', which is a different quantity.'],
      key: 'The constant is the starting value; the coefficient is the rate of change.'
    };
  });

  // linear relationship from a rate and a point
  S.reg('H.B.', 'M', function () {
    var m = ri(2, 12), x0 = ri(1, 6), y0 = ri(8, 40), b = y0 - m * x0;
    var o = mc('$y = ' + lin(m, b, 'x') + '$',
      ['$y = ' + lin(x0, y0, 'x') + '$', '$y = ' + lin(x0, m, 'x') + '$', '$y = ' + lin(m, y0, 'x') + '$', '$y = ' + lin(m + 1, b + m, 'x') + '$']);
    return {
      stem: '<p>The relationship between two variables, $x$ and $y$, is linear. For every increase in the value of $x$ by $1$, the value of $y$ increases by $' + m + '$. When the value of $x$ is $' + x0 + '$, the value of $y$ is $' + com(y0) + '$.</p>',
      prompt: 'Which equation represents this relationship?',
      choices: o.choices, correct: o.correct,
      expl: ['"Increases by $' + m + '$ for every increase of $1$ in $x$" is the slope, so $y = ' + m + 'x + b$.',
             'Substitute the given point $' + pt(x0, y0) + '$: $' + com(y0) + ' = ' + m + '(' + x0 + ') + b = ' + (m * x0) + ' + b$.',
             'So $b = ' + com(y0) + ' - ' + (m * x0) + ' = ' + com(b) + '$, giving $y = ' + lin(m, b, 'x') + '$.'],
      key: 'Rate of change is the slope; one known point fixes the intercept.'
    };
  });

  // f(x) = mx + b with f(k) known, find b
  S.reg('H.B.', 'M', function () {
    var m = ri(2, 9), k = ri(3, 12), b = ri(-20, 20), out = m * k + b;
    var o = mcNum(b, [out, out - m, m * k, k - m]);
    return {
      stem: '<p style="text-align:center">$f(x) = ' + m + 'x + b$</p>',
      prompt: 'For the linear function $f$, $b$ is a constant and $f(' + k + ') = ' + com(out) + '$. What is the value of $b$?',
      choices: o.choices, correct: o.correct,
      expl: ['Substitute $x = ' + k + '$: $f(' + k + ') = ' + m + '(' + k + ') + b = ' + (m * k) + ' + b$.',
             'Set that equal to the given output: $' + (m * k) + ' + b = ' + com(out) + '$.',
             'So $b = ' + com(out) + ' - ' + (m * k) + ' = ' + com(b) + '$.'],
      key: 'Substitute the input, then solve for the unknown constant.'
    };
  });

  // flat charge for the first block of hours plus an hourly fee
  S.reg('H.B.', 'H', function () {
    var base = ri(15, 30) * 10, first = 2, hrs = ri(4, 7), rate = ri(4, 9) * 10;
    var total = base + rate * (hrs - first);
    var b = base - rate * first;
    var o = mc('$f(x) = ' + lin(rate, b, 'x') + '$',
      ['$f(x) = ' + lin(rate, base, 'x') + '$', '$f(x) = ' + lin(base, rate, 'x') + '$', '$f(x) = ' + lin(rate, base + rate, 'x') + '$']);
    return {
      stem: '<p>A repair specialist charges $' + money(base) + '$ for the first two hours of repair plus an hourly fee for each additional hour. The total cost for $' + hrs + '$ hours of repair is $' + money(total) + '$.</p>',
      prompt: 'Which function $f$ gives the total cost, in dollars, for $x$ hours of repair, where $x \\ge 2$?',
      choices: o.choices, correct: o.correct,
      expl: ['The $' + hrs + '$-hour job has $' + (hrs - first) + '$ additional hours beyond the first two, and those cost $' + money(total) + ' - ' + money(base) + ' = ' + money(total - base) + '$.',
             'So the hourly fee is $' + money(total - base) + ' \\div ' + (hrs - first) + ' = ' + money(rate) + '$ per additional hour.',
             'For $x$ hours the additional hours number $x - 2$, so $f(x) = ' + base + ' + ' + rate + '(x - 2) = ' + rate + 'x ' + (b < 0 ? '- ' + Math.abs(b) : '+ ' + b) + '$.'],
      key: 'Convert "base plus extra" into slope-intercept form by expanding.'
    };
  });

  /* ============================ H.C. Linear equations in two variables ============================ */

  // parallel line through (0, b)
  S.reg('H.C.', 'E', function () {
    var m = ri(2, 9), c = ri(2, 12), b = ri(2, 12);
    var o = mc('$y = ' + lin(m, b, 'x') + '$', ['$y = ' + lin(b, 0, 'x') + '$', '$y = ' + lin(m, 0, 'x') + '$', '$y = ' + lin(b, m, 'x') + '$']);
    return {
      stem: '',
      prompt: 'What is the equation of the line that passes through the point $' + pt(0, b) + '$ and is parallel to the graph of $y = ' + lin(m, c, 'x') + '$ in the $xy$-plane?',
      choices: o.choices, correct: o.correct,
      expl: ['Parallel lines have equal slopes, so the new line has slope $' + m + '$.',
             'The point $' + pt(0, b) + '$ is on the $y$-axis, so it is the $y$-intercept: $b = ' + b + '$.',
             'The equation is $y = ' + lin(m, b, 'x') + '$.'],
      key: 'Parallel means same slope; a point with $x=0$ hands you the intercept.'
    };
  });

  // x + y = total context
  S.reg('H.C.', 'E', function () {
    var tot = ri(12, 60) * 10, x = ri(4, Math.floor(tot / 10) - 3) * 10, y = tot - x;
    var a = pick(['maple', 'birch', 'spruce']), bq = pick(['oak', 'willow', 'pine']);
    var o = mcNum(y, [x, tot, tot + x, Math.abs(x - y)]);
    return {
      stem: '<p style="text-align:center">$x + y = ' + com(tot) + '$</p><p>The given equation relates the total number of ' + a + ' trees, $x$, and the total number of ' + bq + ' trees, $y$, planted in a preserve.</p>',
      prompt: 'If $' + com(x) + '$ ' + a + ' trees were planted, how many ' + bq + ' trees were planted?',
      choices: o.choices, correct: o.correct,
      expl: ['Substitute $x = ' + com(x) + '$ into the equation: $' + com(x) + ' + y = ' + com(tot) + '$.',
             'Subtract: $y = ' + com(tot) + ' - ' + com(x) + ' = ' + com(y) + '$.'],
      key: 'A two-variable equation becomes one-variable the moment one value is given.'
    };
  });

  // perpendicular slope from Ay + Bx = C
  S.reg('H.C.', 'MH', function (d) {
    var A = ri(2, 9), B = ri(2, 18), C = ri(2, 20), L = pick(['k', 'p', 'r', '\\ell']), M = pick(['j', 'n', 'm', 'q']);
    var slope = -B / A, perp = A / B;
    var g = gcd(A, B);
    if (d === 'H') {
      return {
        spr: true, value: perp,
        stem: '<p>Line $' + L + '$ is defined by $' + A + 'y + ' + B + 'x = ' + C + '$. Line $' + M + '$ is perpendicular to line $' + L + '$ in the $xy$-plane.</p>',
        prompt: 'What is the slope of line $' + M + '$?',
        expl: ['Put line $' + L + '$ in slope-intercept form: $' + A + 'y = -' + B + 'x + ' + C + '$, so $y = -\\frac{' + B + '}{' + A + '}x + \\frac{' + C + '}{' + A + '}$.',
               'The slope of line $' + L + '$ is $' + fr(-B, A) + '$.',
               'Perpendicular slopes are opposite reciprocals, so line $' + M + '$ has slope $' + fr(A, B) + '$' + (g > 1 ? ' (which reduces from $\\frac{' + A + '}{' + B + '}$)' : '') + '.'],
        key: 'Perpendicular slope = negative reciprocal. Solve for $y$ first.'
      };
    }
    var o = mc('$' + fr(A, B) + '$', ['$' + fr(-A, B) + '$', '$' + fr(-B, A) + '$', '$' + fr(B, A) + '$']);
    return {
      stem: '<p>Line $' + L + '$ is defined by $' + A + 'y + ' + B + 'x = ' + C + '$. Line $' + M + '$ is perpendicular to line $' + L + '$ in the $xy$-plane.</p>',
      prompt: 'What is the slope of line $' + M + '$?',
      choices: o.choices, correct: o.correct,
      expl: ['Solve for $y$: $' + A + 'y = -' + B + 'x + ' + C + '$, so $y = ' + fr(-B, A) + 'x + \\frac{' + C + '}{' + A + '}$.',
             'Line $' + L + '$ has slope $' + fr(-B, A) + '$.',
             'The perpendicular slope is the opposite reciprocal: $' + fr(A, B) + '$.'],
      key: 'Flip the fraction and flip the sign.'
    };
  });

  // slope from two points given in a table
  S.reg('H.C.', 'MH', function () {
    var x1 = ri(-20, -2), x2 = ri(3, 20), m = ri(2, 9) * (coin() ? 1 : -1), b = ri(-30, 30);
    var y1 = m * x1 + b, y2 = m * x2 + b;
    var o = mcNum(m, [-m, y2 - y1, Math.round((y2 - y1) / (x2 - x1)) + 1, b]);
    return {
      stem: '<table class="data"><tr><th>$x$</th><th>$y$</th></tr><tr><td>$' + com(x1) + '$</td><td>$' + com(y1) + '$</td></tr><tr><td>$' + com(x2) + '$</td><td>$' + com(y2) + '$</td></tr></table>' +
            '<p>The table shows two values of $x$ and their corresponding values of $y$ for a linear equation.</p>',
      prompt: 'What is the slope of the graph of this equation in the $xy$-plane?',
      choices: o.choices, correct: o.correct,
      expl: ['Slope is the change in $y$ over the change in $x$: $m = \\frac{y_2 - y_1}{x_2 - x_1}$.',
             'Substitute: $m = \\frac{' + com(y2) + ' - (' + com(y1) + ')}{' + com(x2) + ' - (' + com(x1) + ')} = \\frac{' + com(y2 - y1) + '}{' + com(x2 - x1) + '}$.',
             'That simplifies to $m = ' + com(m) + '$.'],
      key: 'Two points are all a line needs; subtract in the same order top and bottom.'
    };
  });

  /* ============================ H.D. Systems of two linear equations ============================ */

  // trivial first equation, asked for x + y
  S.reg('H.D.', 'E', function () {
    var a = ri(2, 9), x = ri(2, 9), c = a * x, m = ri(2, 9), k = ri(-12, 12);
    var y = m * x + k;
    var o = mcNum(x + y, [x - y, y - x, -(x + y), x * y]);
    return {
      stem: '<p style="text-align:center">$' + a + 'x = ' + com(c) + '$<br>$-' + m + 'x + y = ' + com(k) + '$</p>',
      prompt: 'The solution to the given system of equations is $(x, y)$. What is the value of $x + y$?',
      choices: o.choices, correct: o.correct,
      expl: ['The first equation involves only $x$: $x = ' + com(c) + ' \\div ' + a + ' = ' + x + '$.',
             'Substitute into the second: $-' + m + '(' + x + ') + y = ' + com(k) + '$, so $y = ' + com(k) + ' + ' + (m * x) + ' = ' + com(y) + '$.',
             'Therefore $x + y = ' + x + ' + (' + com(y) + ') = ' + com(x + y) + '$.'],
      key: 'Solve the equation that has one variable first, then substitute.'
    };
  });

  // substitution, answer is the ordered pair
  S.reg('H.D.', 'M', function () {
    var m = ri(2, 8), b = ri(5, 25), x = ri(-9, -1), a2 = ri(2, 9);
    var y = m * x + b, c2 = -a2 * x - y;
    var o = mc('$' + pt(x, y) + '$', ['$' + pt(y, x) + '$', '$' + pt(-x, -y) + '$', '$' + pt(x + 1, y + m) + '$']);
    return {
      stem: '<p style="text-align:center">$y = ' + lin(m, b, 'x') + '$<br>$-' + a2 + 'x - y = ' + com(c2) + '$</p>',
      prompt: 'What is the solution $(x, y)$ to the given system of equations?',
      choices: o.choices, correct: o.correct,
      expl: ['The first equation already gives $y$, so substitute it into the second: $-' + a2 + 'x - (' + lin(m, b, 'x') + ') = ' + com(c2) + '$.',
             'Combine like terms: $' + (-a2 - m) + 'x - ' + b + ' = ' + com(c2) + '$, so $' + (-a2 - m) + 'x = ' + com(c2 + b) + '$ and $x = ' + x + '$.',
             'Back-substitute: $y = ' + m + '(' + x + ') + ' + b + ' = ' + com(y) + '$. The solution is $' + pt(x, y) + '$.'],
      key: 'When one equation is already solved for a variable, substitute.'
    };
  });

  // infinitely many solutions with a constant
  S.reg('H.D.', 'M', function () {
    var n = ri(2, 5), dd = ri(3, 7), y0 = ri(2, 12), x1 = ri(2, 9), x2 = x1 + ri(2, 8);
    // y - y0 = (n/dd)(x + x1) ; y - v = (n/dd)(x + x2)  -> v = y0 + (n/dd)(x1 - x2) ... need integer
    var diff = (n / dd) * (x2 - x1);
    if (!S.isInt(diff)) throw 0;
    var v = y0 + diff;
    var o = mcNum(v, [y0, y0 - diff, diff, v + n]);
    return {
      stem: '<p style="text-align:center">$y - ' + y0 + ' = ' + fr(n, dd) + '(x + ' + x1 + ')$<br>$y - v = ' + fr(n, dd) + '(x + ' + x2 + ')$</p>',
      prompt: 'In the given system of equations, $v$ is a constant. The system has infinitely many solutions. What is the value of $v$?',
      choices: o.choices, correct: o.correct,
      expl: ['Infinitely many solutions means the two equations describe the same line. Both already have slope $' + fr(n, dd) + '$, so their $y$-intercepts must match.',
             'First line: $y = ' + fr(n, dd) + 'x + ' + fr(n * x1, dd) + ' + ' + y0 + '$, so its intercept is $' + S.round(y0 + n * x1 / dd, 4) + '$.',
             'Second line: $y = ' + fr(n, dd) + 'x + ' + fr(n * x2, dd) + ' + v$, so its intercept is $v + ' + S.round(n * x2 / dd, 4) + '$.',
             'Set them equal: $v = ' + y0 + ' + ' + S.round(n * x1 / dd, 4) + ' - ' + S.round(n * x2 / dd, 4) + ' = ' + com(v) + '$.'],
      key: 'Same line means same slope and same intercept.'
    };
  });

  // no solution -> find the constant
  S.reg('H.D.', 'H', function () {
    var a = ri(2, 9), b = ri(2, 9), c = ri(2, 15), k = ri(2, 5);
    // a x + b y = c  and  (k a) x + p y = (some other constant): no solution when p = k*b
    var p = k * b, c2 = k * c + ri(1, 9);
    return {
      spr: true, value: p,
      stem: '<p style="text-align:center">$' + a + 'x + ' + b + 'y = ' + c + '$<br>$' + (k * a) + 'x + py = ' + c2 + '$</p>',
      prompt: 'In the given system of equations, $p$ is a constant. If the system has no solution, what is the value of $p$?',
      expl: ['A system of two linear equations has no solution when the lines are parallel but not identical: the coefficients are proportional, the constants are not.',
             'The $x$ coefficients go from $' + a + '$ to $' + (k * a) + '$, a factor of $' + k + '$.',
             'For parallel lines the $y$ coefficients must scale the same way: $p = ' + k + ' \\cdot ' + b + ' = ' + p + '$.',
             'Check it is not the same line: $' + k + ' \\cdot ' + c + ' = ' + (k * c) + '$, which is not $' + c2 + '$, so the lines are parallel and distinct.'],
      key: 'No solution = proportional coefficients, non-proportional constants.'
    };
  });

  // which equation could be the second equation (no solution)
  S.reg('H.D.', 'H', function () {
    var a = ri(2, 6), b = ri(3, 12), c = ri(5, 40);
    // given: a x = b y - c ; i.e. a x - b y = -c. Parallel: (a/k) x - (b/k) y = anything else
    var k = pick([3, 4, 5]);
    if (a % 1 || b % k) throw 0;
    var right = '$x = ' + (b / a === Math.round(b / a) ? (b / a) + 'y' : '\\frac{' + b + '}{' + a + '}y') + '$';
    var good = '$\\frac{1}{' + a + '}x = ' + (b / a === Math.round(b / a) ? (b / a) : '\\frac{' + b + '}{' + a + '}') + 'y$';
    var o = mc(good, ['$x = ' + b + 'y - ' + c + '$', '$\\frac{1}{' + a + '}x = ' + b + 'y - ' + c + '$', '$x = ' + Math.round(b / a) + 'y - ' + c + '$']);
    return {
      stem: '<p style="text-align:center">$' + a + 'x = ' + b + 'y - ' + c + '$</p><p>One of the two equations in a system of linear equations is given. The system has no solution.</p>',
      prompt: 'Which equation could be the second equation in this system?',
      choices: o.choices, correct: o.correct,
      expl: ['Write the given equation in standard form: $' + a + 'x - ' + b + 'y = -' + c + '$, so its slope is $\\frac{' + a + '}{' + b + '}$.',
             'No solution means the second line has the same slope but a different intercept.',
             'The correct choice has the $x$ and $y$ coefficients in the same ratio $' + a + ' : ' + b + '$ but a constant term of $0$ instead of $-' + c + '$, so the lines are parallel and never meet.',
             'Any choice that keeps the constant $-' + c + '$ with the same ratio would be the same line (infinitely many solutions), and any choice with a different ratio would cross it once.'],
      key: 'Parallel-but-different is the whole test for "no solution".'
    };
  });

  /* ============================ H.E. Linear inequalities ============================ */

  // which system of inequalities has this point as a solution
  S.reg('H.E.', 'E', function () {
    var x = ri(1, 12) * (coin() ? 1 : -1), y = ri(1, 12) * (coin() ? 1 : -1);
    var right = '$x \\' + (x > 0 ? 'gt' : 'lt') + ' 0$ and $y \\' + (y > 0 ? 'gt' : 'lt') + ' 0$';
    var o = mc(right, ['$x \\gt 0$ and $y \\gt 0$', '$x \\gt 0$ and $y \\lt 0$', '$x \\lt 0$ and $y \\gt 0$', '$x \\lt 0$ and $y \\lt 0$'].filter(function (s) { return s !== right; }));
    return {
      stem: '',
      prompt: 'The point $' + pt(x, y) + '$ in the $xy$-plane is a solution to which of the following systems of inequalities?',
      choices: o.choices, correct: o.correct,
      expl: ['Read the signs of the coordinates: $x = ' + x + '$ is ' + (x > 0 ? 'positive' : 'negative') + ' and $y = ' + y + '$ is ' + (y > 0 ? 'positive' : 'negative') + '.',
             'So the point satisfies $x \\' + (x > 0 ? 'gt' : 'lt') + ' 0$ and $y \\' + (y > 0 ? 'gt' : 'lt') + ' 0$, which is quadrant ' + (x > 0 ? (y > 0 ? 'I' : 'IV') : (y > 0 ? 'II' : 'III')) + '.'],
      key: 'Substitute the point; the signs alone settle it.'
    };
  });

  // budget inequality in context
  S.reg('H.E.', 'E', function () {
    var who = pick(NAMES), budget = ri(12, 60), p1 = (ri(120, 340) / 100), p2 = (ri(150, 420) / 100);
    var i1 = pick([['containers', 'c'], ['notebooks', 'n'], ['cables', 'b']]), i2 = pick([['rolls of tape', 't'], ['pens', 'p'], ['chargers', 'h']]);
    var right = '$' + p1 + i1[1] + ' + ' + p2 + i2[1] + ' \\le ' + budget + '$';
    var o = mc(right, ['$' + p1 + i1[1] + ' + ' + p2 + i2[1] + ' \\ge ' + budget + '$',
                       '$' + p2 + i1[1] + ' + ' + p1 + i2[1] + ' \\le ' + budget + '$',
                       '$' + p2 + i1[1] + ' + ' + p1 + i2[1] + ' \\ge ' + budget + '$']);
    return {
      stem: '<p>' + who + ' goes to a store to buy ' + i1[0] + ' and ' + i2[0] + '. ' + who + ' has $' + money(budget) + '$. Each ' + i1[0].replace(/s$/, '') + ' costs $' + money(p1) + '$ and each ' + i2[0].replace(/^rolls/, 'roll') + ' costs $' + money(p2) + '$.</p>',
      prompt: 'Which inequality represents the relationship between the number of ' + i1[0] + ', $' + i1[1] + '$, and the number of ' + i2[0] + ', $' + i2[1] + '$, that can be bought?',
      choices: o.choices, correct: o.correct,
      expl: ['Each ' + i1[0].replace(/s$/, '') + ' costs $' + money(p1) + '$, so $' + i1[1] + '$ of them cost $' + p1 + i1[1] + '$; likewise $' + i2[0] + ' cost $' + p2 + i2[1] + '$.',
             'The total spent is $' + p1 + i1[1] + ' + ' + p2 + i2[1] + '$.',
             'Having $' + money(budget) + '$ means the total cannot exceed it, so the relationship is $\\le ' + budget + '$.'],
      key: 'Match each price to its own variable, then let "has" mean at most.'
    };
  });

  // greatest possible value under a constraint
  S.reg('H.E.', 'M', function () {
    var cost = ri(8, 25), fixed = ri(40, 300), budget = fixed + cost * ri(8, 40);
    var most = Math.floor((budget - fixed) / cost);
    var o = mcNum(most, [most + 1, most - 1, Math.floor(budget / cost)]);
    return {
      stem: '<p>An organizer has a budget of $' + money(budget) + '$ for an event. The venue costs $' + money(fixed) + '$ and each attendee costs an additional $' + money(cost) + '$.</p>',
      prompt: 'What is the greatest number of attendees possible without exceeding the budget?',
      choices: o.choices, correct: o.correct,
      expl: ['Let $a$ be the number of attendees. The total cost is $' + cost + 'a + ' + fixed + '$, and it must satisfy $' + cost + 'a + ' + fixed + ' \\le ' + com(budget) + '$.',
             'Subtract the venue cost: $' + cost + 'a \\le ' + com(budget - fixed) + '$.',
             'Divide: $a \\le ' + S.round((budget - fixed) / cost, 4) + '$. Attendees must be a whole number, so the greatest possible is $' + most + '$.'],
      key: 'Set up the inequality, then round down to a whole person.'
    };
  });

  // region not containing any solutions
  S.reg('H.E.', 'H', function () {
    var a = ri(2, 9), b = ri(2, 9), c = a * b;
    var o = mc('The region where $x \\lt 0$ and $y \\gt 0$',
      ['The $x$-axis', 'The region where $x \\gt 0$ and $y \\gt 0$', 'The region where $x \\lt 0$ and $y \\lt 0$']);
    return {
      stem: '',
      prompt: 'In the $xy$-plane, which of the following does NOT contain any points that are part of the solution set to $' + a + 'x - ' + b + 'y > ' + c + '$?',
      choices: o.choices, correct: o.correct,
      expl: ['Rewrite the inequality as $y \\lt \\frac{' + a + '}{' + b + '}x - ' + S.round(c / b, 4) + '$: the solution set lies below a line with positive slope and a negative $y$-intercept.',
             'If $x \\lt 0$ then $\\frac{' + a + '}{' + b + '}x$ is negative, so the whole right side is negative, which forces $y$ to be negative too.',
             'So no point with $x \\lt 0$ and $y \\gt 0$ can satisfy it. Every other listed region does contain solutions (take $x$ large and positive, for example).'],
      key: 'Solve for $y$, then reason about the signs region by region.'
    };
  });

})(window.SAT);
