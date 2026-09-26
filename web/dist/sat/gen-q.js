/* gen-q.js — Problem-Solving and Data Analysis (Q.A–Q.G). Archetypes clustered from the live bank. */
(function (S) {
  'use strict';
  var ri = S.ri, pick = S.pick, pickn = S.pickn, coin = S.coin, com = S.com, fr = S.fr, mc = S.mc,
      mcNum = S.mcNum, money = S.money, gcd = S.gcd, isInt = S.isInt, shuffle = S.shuffle;

  var NAMES = ['Amara', 'Leo', 'Priya', 'Hana', 'Mateo', 'Nadia', 'Omar', 'Jae', 'Ivy', 'Tomas', 'Sana', 'Diego'];

  /* ============================ Q.A. Ratios, rates, proportional relationships, units ============ */

  // per minute -> per hour
  S.reg('Q.A.', 'E', function () {
    var rate = ri(12, 90), thing = pick(['posters', 'labels', 'envelopes', 'tiles']);
    return {
      spr: true, value: rate * 60,
      stem: '<p>A machine produces ' + thing + ' at a constant rate of $' + rate + '$ ' + thing + ' per minute.</p>',
      prompt: 'At this rate, how many ' + thing + ' does the machine produce per hour?',
      expl: ['There are $60$ minutes in an hour, so multiply the per-minute rate by $60$.',
             '$' + rate + ' \\times 60 = ' + com(rate * 60) + '$.',
             'Units check: $\\frac{' + thing + '}{\\text{minute}} \\times \\frac{60\\ \\text{minutes}}{\\text{hour}} = \\frac{' + thing + '}{\\text{hour}}$.'],
      key: 'Multiply by the conversion factor arranged so the unwanted unit cancels.'
    };
  });

  // chained unit conversion, conversion facts supplied
  S.reg('Q.A.', 'M', function () {
    var q = ri(20, 99), a = 8, b = 4;   // 8 fl oz = 1 cup, 4 cups = 1 quart
    return {
      spr: true, value: q * a * b,
      stem: '',
      prompt: 'How many fluid ounces are equivalent to $' + q + '$ quarts? ($' + a + '$ fluid ounces $= 1$ cup and $' + b + '$ cups $= 1$ quart)',
      expl: ['Convert quarts to cups first: $' + q + ' \\text{ quarts} \\times ' + b + ' \\frac{\\text{cups}}{\\text{quart}} = ' + com(q * b) + '$ cups.',
             'Now convert cups to fluid ounces: $' + com(q * b) + ' \\times ' + a + ' = ' + com(q * a * b) + '$ fluid ounces.',
             'Chained as one calculation: $' + q + ' \\times ' + b + ' \\times ' + a + ' = ' + com(q * a * b) + '$.'],
      key: 'Chain the factors so each unwanted unit cancels in turn.'
    };
  });

  // proportional relationship
  S.reg('Q.A.', 'EM', function () {
    var k = ri(3, 15), n1 = ri(4, 14), n2 = ri(20, 60);
    var y1 = k * n1;
    var o = mcNum(k * n2, [n2 * n1, k + n2, Math.round(y1 * n2 / 100)]);
    var item = pick([['items', 'hours'], ['bricks', 'hours'], ['forms', 'days']]);
    return {
      stem: '<p>A device produces $' + com(y1) + '$ ' + item[0] + ' in $' + n1 + '$ ' + item[1] + ', at a constant rate.</p>',
      prompt: 'At this rate, how many ' + item[0] + ' will the device produce in $' + n2 + '$ ' + item[1] + '?',
      choices: o.choices, correct: o.correct,
      expl: ['Find the unit rate: $' + com(y1) + ' \\div ' + n1 + ' = ' + k + '$ ' + item[0] + ' per ' + item[1].replace(/s$/, '') + '.',
             'Multiply by the new amount of time: $' + k + ' \\times ' + n2 + ' = ' + com(k * n2) + '$.',
             'Equivalently, solve the proportion $\\frac{' + com(y1) + '}{' + n1 + '} = \\frac{x}{' + n2 + '}$.'],
      key: 'Get the unit rate once; every later question is one multiplication.'
    };
  });

  // scale model expression
  S.reg('Q.A.', 'H', function () {
    var n = ri(5, 19), d = pick([2, 3, 4]);
    var right = '$\\frac{' + d + 'x}{' + n + '}$';
    var o = mc(right, ['$\\frac{' + n + 'x}{' + d + '}$', '$\\frac{' + n + '}{' + d + 'x}$', '$\\frac{' + d + '(12)x}{' + n + '}$']);
    return {
      stem: '<p>In a scale model of a building, a length of $1$ inch on the model represents a length of $\\frac{' + n + '}{' + d + '}$ feet in the actual building.</p>',
      prompt: 'If a length in the actual building measures $x$ feet, which expression gives the corresponding length, in inches, on the model?',
      choices: o.choices, correct: o.correct,
      expl: ['Each model inch stands for $\\frac{' + n + '}{' + d + '}$ actual feet, so the number of model inches is the actual feet divided by $\\frac{' + n + '}{' + d + '}$.',
             'Dividing by a fraction means multiplying by its reciprocal: $x \\div \\frac{' + n + '}{' + d + '} = x \\cdot \\frac{' + d + '}{' + n + '} = \\frac{' + d + 'x}{' + n + '}$.',
             'Sanity check the direction: one model inch is more than one actual foot here, so the model number should be SMALLER than $x$, and $\\frac{' + d + 'x}{' + n + '}$ is, since $' + d + ' < ' + n + '$.',
             'No factor of $12$ belongs in this one: the scale was already given as inches to feet.'],
      key: 'Divide by the scale, and sanity-check whether the answer should shrink or grow.'
    };
  });

  /* ============================ Q.B. Percentages ============================ */

  // p% of N
  S.reg('Q.B.', 'E', function () {
    var who = pick(NAMES), p = pick([5, 10, 15, 20, 25, 40]), N = ri(12, 90) * 10;
    var val = N * p / 100;
    if (!isInt(val)) throw 0;
    var thing = pick(['cherry tomatoes', 'seedlings', 'peaches', 'bulbs']);
    return {
      spr: true, value: val,
      stem: '<p>' + who + ' harvested $' + com(N) + '$ ' + thing + ' this year and gave $' + p + '\\%$ of them to a neighbor.</p>',
      prompt: 'How many of the harvested ' + thing + ' did ' + who + ' give to the neighbor?',
      expl: ['"$' + p + '\\%$ of" means multiply by $\\frac{' + p + '}{100} = ' + (p / 100) + '$.',
             '$' + com(N) + ' \\times ' + (p / 100) + ' = ' + com(val) + '$.'],
      key: 'Percent of a number: convert to a decimal and multiply.'
    };
  });

  // part known, percent known, find the whole
  S.reg('Q.B.', 'M', function () {
    var p = pick([20, 25, 40, 50, 80]), total = ri(6, 30) * 10, part = total * p / 100;
    if (!isInt(part)) throw 0;
    return {
      spr: true, value: total,
      stem: '<p>In a sample, $' + p + '\\%$ of the items are faulty. There are $' + com(part) + '$ faulty items in the sample.</p>',
      prompt: 'How many total items are in the sample?',
      expl: ['Let $t$ be the total. Then $' + (p / 100) + 't = ' + com(part) + '$.',
             'Divide both sides by $' + (p / 100) + '$: $t = ' + com(part) + ' \\div ' + (p / 100) + ' = ' + com(total) + '$.',
             'Check: $' + p + '\\%$ of $' + com(total) + '$ is $' + com(part) + '$.'],
      key: 'Part = percent x whole. Knowing two of the three fixes the third.'
    };
  });

  // decreasing by what percent
  S.reg('Q.B.', 'H', function () {
    var f = pick([0.35, 0.42, 0.65, 0.88, 0.16]);
    var dec = Math.round((1 - f) * 1000) / 10;
    var right = '$' + dec + '\\%$';
    var o = mc(right, ['$' + (f * 100) + '\\%$', '$' + S.round(f * 10, 2) + '\\%$', '$' + S.round(dec / 10, 2) + '\\%$']);
    return {
      stem: '',
      prompt: 'The expression $' + f + 'x$ represents the result of decreasing a positive quantity $x$ by what percent?',
      choices: o.choices, correct: o.correct,
      expl: ['After the decrease the quantity is $' + f + 'x$, which is $' + (f * 100) + '\\%$ of the original $x$.',
             'The part removed is $x - ' + f + 'x = ' + S.round(1 - f, 4) + 'x$.',
             'As a percent of the original, that is $' + S.round((1 - f) * 100, 2) + '\\%$.',
             'The trap is answering $' + (f * 100) + '\\%$, which is what remains, not what was removed.'],
      key: 'A multiplier of $b$ means a change of $|1 - b|$, as a percent of the original.'
    };
  });

  /* ============================ Q.C. One-variable data ============================ */

  // median of a listed data set
  S.reg('Q.C.', 'EM', function () {
    var n = pick([7, 8, 9]), a = [];
    for (var i = 0; i < n; i++) a.push(ri(2, 20));
    var sorted = a.slice().sort(function (x, y) { return x - y; });
    var med = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    var mean = a.reduce(function (s, v) { return s + v; }, 0) / n;
    var o = mcNum(med, [sorted[0], sorted[n - 1], S.round(mean, 2), sorted[n - 1] - sorted[0]], function (v) { return String(S.round(v, 3)); });
    return {
      stem: '<p style="text-align:center">$' + a.join('$, $') + '$</p>',
      prompt: 'What is the median of the data set shown?',
      choices: o.choices, correct: o.correct,
      expl: ['Put the values in order: $' + sorted.join(',\\ ') + '$.',
             n % 2
               ? 'There are $' + n + '$ values, an odd count, so the median is the middle one, the $' + ((n + 1) / 2) + '$th: $' + med + '$.'
               : 'There are $' + n + '$ values, an even count, so the median is the average of the two middle ones: $\\frac{' + sorted[n / 2 - 1] + ' + ' + sorted[n / 2] + '}{2} = ' + med + '$.',
             'The mean here is $' + S.round(mean, 3) + '$, which is a different statistic; the question asked for the median.'],
      key: 'Sort first. Median is position-based, not value-based.'
    };
  });

  // mean of a frequency table
  S.reg('Q.C.', 'M', function () {
    var vals = pickn([2, 3, 4, 5, 6, 7, 8, 9, 10], 4).sort(function (a, b) { return a - b; });
    var fq = vals.map(function () { return ri(1, 9); });
    var N = fq.reduce(function (a, b) { return a + b; }, 0);
    var tot = vals.reduce(function (s, v, i) { return s + v * fq[i]; }, 0);
    var mean = tot / N;
    var rows = vals.map(function (v, i) { return '<tr><td>$' + v + '$</td><td>$' + fq[i] + '$</td></tr>'; }).join('');
    return {
      spr: true, value: S.round(mean, 4),
      stem: '<table class="data"><tr><th>Score</th><th>Frequency</th></tr>' + rows + '</table>' +
            '<p>The table shows the frequency distribution of the scores of the $' + N + '$ players in a game.</p>',
      prompt: 'What is the mean score of these players?',
      expl: ['Multiply each score by how many times it occurs, then add: $' + vals.map(function (v, i) { return v + '(' + fq[i] + ')'; }).join(' + ') + ' = ' + com(tot) + '$.',
             'The number of players is the sum of the frequencies: $' + fq.join(' + ') + ' = ' + N + '$.',
             'The mean is the total divided by the count: $' + com(tot) + ' \\div ' + N + ' = ' + S.round(mean, 4) + '$.'],
      key: 'A frequency table mean is a weighted sum over the total frequency.'
    };
  });

  // the missing value that produces a target mean
  S.reg('Q.C.', 'H', function () {
    var k = 9, base = [], m0 = ri(35, 48);
    for (var i = 0; i < k; i++) base.push(m0 + ri(-5, 5));
    var s0 = base.reduce(function (a, b) { return a + b; }, 0);
    var mean0 = s0 / k;
    if (!isInt(mean0)) { var adj = Math.round(mean0) * k - s0; base[0] += adj; s0 += adj; mean0 = s0 / k; }
    var newMean = mean0 + 1;
    var tenth = newMean * (k + 1) - s0;
    if (!isInt(tenth) || tenth < 0 || tenth > 99) throw 0;
    return {
      spr: true, value: tenth,
      stem: '<p>Data set A consists of $10$ positive integers. The list shows $9$ of them.</p>' +
            '<p style="text-align:center">$' + base.join('$, $') + '$</p>' +
            '<p>The mean of these $9$ integers is $' + mean0 + '$.</p>',
      prompt: 'If the mean of all $10$ integers in data set A is $' + newMean + '$, what is the value of the tenth integer?',
      expl: ['The mean of the $9$ listed integers is $' + mean0 + '$, so their sum is $9 \\times ' + mean0 + ' = ' + com(s0) + '$.',
             'For all $10$ integers to have mean $' + newMean + '$, their sum must be $10 \\times ' + newMean + ' = ' + com(newMean * 10) + '$.',
             'The tenth integer is the difference: $' + com(newMean * 10) + ' - ' + com(s0) + ' = ' + tenth + '$.'],
      key: 'Turn every mean into a sum; sums add, means do not.'
    };
  });

  /* ============================ Q.D. Two-variable data ============================ */

  // what type of function models this
  S.reg('Q.D.', 'EMH', function (d) {
    var kind;
    if (d === 'E') kind = coin()
      ? { txt: 'An airplane descends from an altitude of $' + com(ri(70, 99) * 100) + '$ feet at a constant rate of $' + (ri(2, 8) * 50) + '$ feet per minute.', ans: 'Decreasing linear', why: 'A constant amount lost per minute is a constant rate of change, and the quantity is going down.' }
      : { txt: 'A tank is filled at a constant rate of $' + ri(3, 12) + '$ liters per minute.', ans: 'Increasing linear', why: 'A constant amount added per minute is a constant rate of change, and the quantity is going up.' };
    else if (d === 'M') kind = { txt: 'Each year, the value of an investment increases by $' + S.round(ri(30, 400) / 100, 2) + '\\%$ of its value the previous year.', ans: 'Increasing exponential', why: 'A percent of the previous value is a constant multiplier, not a constant amount, and the multiplier is greater than $1$.' };
    else kind = coin()
      ? { txt: 'For $x > 0$, the function $f$ is defined so that $f(x)$ equals $' + ri(105, 260) + '\\%$ of $x$.', ans: 'Increasing linear', why: 'A fixed percent OF $x$ itself is $f(x) = kx$ with $k > 1$: that is a line through the origin, not a growth-per-period model.' }
      : { txt: 'Each hour, a sample loses $' + ri(3, 40) + '\\%$ of the mass it had the previous hour.', ans: 'Decreasing exponential', why: 'Losing a percent of the previous value repeatedly is a constant multiplier below $1$, applied again each hour.' };
    var o = mc(kind.ans, ['Decreasing exponential', 'Decreasing linear', 'Increasing exponential', 'Increasing linear'].filter(function (s) { return s !== kind.ans; }));
    return {
      stem: '<p>' + kind.txt + '</p>',
      prompt: 'Which type of function best models this relationship?',
      choices: o.choices, correct: o.correct,
      expl: ['Ask two questions: is the change a constant amount or a constant percent, and is the quantity rising or falling?',
             kind.why,
             'So the model is ' + kind.ans.toLowerCase() + '.',
             'Constant amount per period means linear; constant percent of the previous value means exponential. A percent of $x$ itself is still linear.'],
      key: 'Constant amount = linear. Constant percent of the previous value = exponential.'
    };
  });

  // slope of a line of best fit from two points on it
  S.reg('Q.D.', 'M', function () {
    var x1 = ri(1, 4), x2 = x1 + ri(4, 9), m = pick([2, 3, 4, 5, -2, -3]), b = ri(2, 20);
    var y1 = m * x1 + b, y2 = m * x2 + b;
    var pts = [];
    for (var i = 0; i < 7; i++) { var x = ri(x1, x2); pts.push([x, m * x + b + ri(-2, 2)]); }
    var o = mcNum(m, [-m, y2 - y1, S.round((y2 - y1) / (x2 - x1) + 1, 2)]);
    return {
      stem: '<p>The scatterplot shows the relationship between $x$ and $y$, with a line of best fit drawn. The line passes through $(' + x1 + ',\\ ' + y1 + ')$ and $(' + x2 + ',\\ ' + y2 + ')$.</p>' +
        S.axes({ xmin: 0, xmax: x2 + 2, ymin: Math.min(0, y1, y2) - 4, ymax: Math.max(y1, y2) + 5, stepx: 2, stepy: 5, labelx: Math.max(2, Math.round((x2 + 2) / 5)), plot: [{ type: 'dots', pts: pts }, { type: 'line', f: function (x) { return m * x + b; } }] }),
      prompt: 'Which is closest to the slope of the line of best fit shown?',
      choices: o.choices, correct: o.correct,
      expl: ['Slope is rise over run between two points that the line itself passes through.',
             'Using $(' + x1 + ',\\ ' + y1 + ')$ and $(' + x2 + ',\\ ' + y2 + ')$: $m = \\frac{' + y2 + ' - ' + y1 + '}{' + x2 + ' - ' + x1 + '} = \\frac{' + (y2 - y1) + '}{' + (x2 - x1) + '} = ' + m + '$.',
             'Use points on the line, not individual scattered data points, which sit above and below it.'],
      key: 'Read two points off the drawn line, not off the cloud of dots.'
    };
  });

  /* ============================ Q.E. Probability ============================ */

  // simple probability
  S.reg('Q.E.', 'E', function () {
    var tot = ri(30, 90), part = ri(5, Math.floor(tot / 2));
    var g = gcd(part, tot);
    var o = mc('$' + fr(part, tot) + '$', ['$' + fr(tot - part, tot) + '$', '$' + fr(1, tot) + '$', '$' + fr(part, tot - part) + '$']);
    var grp = pick([['band', 'members', 'saxophone'], ['choir', 'singers', 'piano'], ['team', 'players', 'goalkeeping']]);
    return {
      stem: '<p>A ' + grp[0] + ' with $' + tot + '$ ' + grp[1] + ' has $' + part + '$ ' + grp[1] + ' who play ' + grp[2] + '.</p>',
      prompt: 'If one ' + grp[0] + ' member is selected at random, what is the probability of selecting a member who plays ' + grp[2] + '?',
      choices: o.choices, correct: o.correct,
      expl: ['Probability is the number of favourable outcomes over the total number of outcomes.',
             'Favourable: $' + part + '$. Total: $' + tot + '$. So the probability is $\\frac{' + part + '}{' + tot + '}$' + (g > 1 ? ', which reduces to $' + fr(part, tot) + '$' : '') + '.'],
      key: 'Count the favourable outcomes, then divide by the whole group.'
    };
  });

  // neither-nor
  S.reg('Q.E.', 'M', function () {
    var a = ri(3, 12), b = ri(3, 12), c = ri(10, 40), d = ri(10, 40);
    var tot = a + b + c + d, keep = a + b;
    var o = mc('$' + fr(keep, tot) + '$', ['$' + fr(c + d, tot) + '$', '$' + fr(a, tot) + '$', '$' + fr(keep, c + d) + '$']);
    return {
      stem: '<p>In a bag there are $' + a + '$ red, $' + b + '$ white, $' + c + '$ blue, and $' + d + '$ yellow cubes.</p>',
      prompt: 'If one of these cubes is selected at random, what is the probability of selecting a cube that is neither blue nor yellow?',
      choices: o.choices, correct: o.correct,
      expl: ['"Neither blue nor yellow" leaves the red and white cubes: $' + a + ' + ' + b + ' = ' + keep + '$.',
             'The total number of cubes is $' + a + ' + ' + b + ' + ' + c + ' + ' + d + ' = ' + tot + '$.',
             'So the probability is $\\frac{' + keep + '}{' + tot + '} = ' + fr(keep, tot) + '$.'],
      key: 'Translate "neither ... nor" into the complement, then count it directly.'
    };
  });

  // conditional probability from a two-way table
  S.reg('Q.E.', 'MH', function () {
    var r = [[ri(4, 20), ri(4, 20)], [ri(4, 20), ri(4, 20)]];
    var rowA = r[0][0] + r[0][1], rowB = r[1][0] + r[1][1];
    var colX = r[0][0] + r[1][0], colY = r[0][1] + r[1][1], tot = rowA + rowB;
    var o = mc('$' + fr(r[0][0], colX) + '$', ['$' + fr(r[0][0], rowA) + '$', '$' + fr(r[0][0], tot) + '$', '$' + fr(colX, tot) + '$']);
    return {
      stem: '<table class="data"><tr><th></th><th>Type X</th><th>Type Y</th><th>Total</th></tr>' +
        '<tr><th>Group A</th><td>$' + r[0][0] + '$</td><td>$' + r[0][1] + '$</td><td>$' + rowA + '$</td></tr>' +
        '<tr><th>Group B</th><td>$' + r[1][0] + '$</td><td>$' + r[1][1] + '$</td><td>$' + rowB + '$</td></tr>' +
        '<tr><th>Total</th><td>$' + colX + '$</td><td>$' + colY + '$</td><td>$' + tot + '$</td></tr></table>' +
        '<p>The table summarizes $' + tot + '$ participants by group and type.</p>',
      prompt: 'One participant is selected at random. What is the probability of selecting a participant from group A, given that the participant is of type X?',
      choices: o.choices, correct: o.correct,
      expl: ['"Given that the participant is of type X" restricts the whole sample space to the type X column.',
             'That column holds $' + colX + '$ participants in total.',
             'Of those, $' + r[0][0] + '$ are in group A.',
             'So the conditional probability is $\\frac{' + r[0][0] + '}{' + colX + '} = ' + fr(r[0][0], colX) + '$, not $\\frac{' + r[0][0] + '}{' + tot + '}$.'],
      key: 'The word "given" replaces the denominator with that row or column total.'
    };
  });

  /* ============================ Q.F. Inference and margin of error ============================ */

  // scale a sample proportion to the population
  S.reg('Q.F.', 'E', function () {
    var who = pick(NAMES), n = pick([20, 25, 40, 50]), N = n * ri(8, 25), k = ri(4, n - 4);
    var est = k / n * N;
    if (!isInt(est)) throw 0;
    var o = mcNum(est, [N - est, k, N, Math.round(est / 2)]);
    return {
      stem: '<p>' + who + ' selected $' + n + '$ employees at random from all $' + com(N) + '$ employees at a company and found that $' + k + '$ of the employees in this sample are enrolled in a training course.</p>',
      prompt: 'Based on these findings, which is the best estimate of the total number of employees at the company who are enrolled in a training course?',
      choices: o.choices, correct: o.correct,
      expl: ['The sample proportion is $\\frac{' + k + '}{' + n + '} = ' + S.round(k / n, 4) + '$.',
             'A random sample is assumed to be representative, so apply that proportion to the whole company.',
             '$' + S.round(k / n, 4) + ' \\times ' + com(N) + ' = ' + com(est) + '$.'],
      key: 'Sample proportion times population size, when the sample is random.'
    };
  });

  // margin of error from an interval
  S.reg('Q.F.', 'M', function () {
    var mean = S.round(ri(1000, 2000) / 100, 2), moe = S.round(ri(30, 120) / 100, 2);
    var lo = S.round(mean - moe, 2), hi = S.round(mean + moe, 2);
    var o = mcNum(moe, [S.round(moe * 2, 2), mean, lo], function (v) { return String(v); });
    return {
      stem: '<p>Researchers measured a sample of a species of fish and found the mean length in the sample was $' + mean + '$ millimeters. Using the sample mean and its margin of error, they estimated that the mean length of all fish of that species is between $' + lo + '$ and $' + hi + '$ millimeters.</p>',
      prompt: 'What is the margin of error, in millimeters, for this estimate?',
      choices: o.choices, correct: o.correct,
      expl: ['The interval is built as sample mean plus or minus the margin of error, so the mean sits at its center.',
             'Margin of error is the distance from the center to either end: $' + hi + ' - ' + mean + ' = ' + moe + '$.',
             'Equivalently it is half the width: $\\frac{' + hi + ' - ' + lo + '}{2} = ' + moe + '$.',
             'The full width, $' + S.round(hi - lo, 2) + '$, is twice the margin of error, which is the usual trap.'],
      key: 'Margin of error is half the interval width, not the whole width.'
    };
  });

  // plausible conclusion
  S.reg('Q.F.', 'H', function () {
    var n = com(ri(700, 1500)), p = ri(60, 92), moe = S.round(ri(20, 40) / 10, 1);
    var right = 'It is plausible that between $' + S.round(p - moe, 1) + '\\%$ and $' + S.round(p + moe, 1) + '\\%$ of all people in the city support the proposal.';
    var o = mc(right, [
      'Exactly $' + p + '\\%$ of all people in the city support the proposal.',
      'It is plausible that between $' + S.round(p - moe * 2, 1) + '\\%$ and $' + S.round(p + moe * 2, 1) + '\\%$ of the people surveyed support the proposal.',
      'At least $' + S.round(p + moe, 1) + '\\%$ of all people in the city support the proposal.']);
    return {
      stem: '<p>A researcher surveyed a random sample of $' + n + '$ people from a city and estimated that $' + p + '\\%$ of people in the city support a proposal. The margin of error for this estimate is $' + moe + '\\%$.</p>',
      prompt: 'Based on this estimate and margin of error, which is the most appropriate conclusion?',
      choices: o.choices, correct: o.correct,
      expl: ['An estimate with a margin of error describes a plausible range for the population value, not an exact value.',
             'The range is $' + p + '\\% \\pm ' + moe + '\\%$, that is from $' + S.round(p - moe, 1) + '\\%$ to $' + S.round(p + moe, 1) + '\\%$.',
             'The conclusion applies to the population the sample was drawn from, namely all people in the city, because the sample was random.',
             'Choices that claim an exact value, or that apply the interval only to the people surveyed, misread what a margin of error is for.'],
      key: 'Estimate ± margin of error = a plausible range for the whole population.'
    };
  });

  /* ============================ Q.G. Evaluating statistical claims ============================ */

  S.reg('Q.G.', 'MH', function () {
    var rand = coin(), assign = coin();
    var pop = pick(['students at one high school', 'members of one gym', 'employees at one company']);
    var design = (rand ? 'A random sample of ' : 'Volunteers from among ') + pop +
      (assign ? ' were randomly assigned to one of two programs.' : ' chose which of two programs to follow.');
    var right = !rand
      ? 'No conclusion can be drawn about ' + pop + ' in general, because the participants were not selected at random.'
      : (assign
        ? 'A cause-and-effect relationship can be concluded for ' + pop + '.'
        : 'An association can be concluded for ' + pop + ', but not a cause-and-effect relationship.');
    var o = mc(right, [
      'A cause-and-effect relationship can be concluded for all adults.',
      'An association can be concluded for all adults, but not a cause-and-effect relationship.',
      'No conclusion can be drawn, because the sample size was too small.',
      'A cause-and-effect relationship can be concluded for ' + pop + '.',
      'An association can be concluded for ' + pop + ', but not a cause-and-effect relationship.'].filter(function (s) { return s !== right; }));
    return {
      stem: '<p>' + design + ' At the end of the study the researchers compared the two groups.</p>',
      prompt: 'Based on the design of this study, which is the most appropriate conclusion?',
      choices: o.choices, correct: o.correct,
      expl: ['Two separate features of a study decide what may be concluded.',
             'Random SELECTION decides who the result generalizes to. Here participants were ' + (rand ? 'selected at random from ' + pop + ', so the result generalizes to that group and no wider.' : 'not selected at random, so the result does not generalize beyond the people who took part.'),
             'Random ASSIGNMENT decides whether cause and effect may be claimed. Here participants were ' + (assign ? 'randomly assigned to the treatments, so a causal claim is supported.' : 'not randomly assigned, so only an association may be claimed.'),
             'Putting those together gives the correct conclusion. No study generalizes to "all adults" when the sample came from one narrow group.'],
      key: 'Random selection buys generalization. Random assignment buys causation.'
    };
  });

})(window.SAT);
