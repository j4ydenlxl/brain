/* gen-s.js — Geometry and Trigonometry (S.A–S.D). Archetypes clustered from the live bank. */
(function (S) {
  'use strict';
  var ri = S.ri, pick = S.pick, coin = S.coin, com = S.com, fr = S.fr, mc = S.mc, mcNum = S.mcNum,
      gcd = S.gcd, isInt = S.isInt, svg = S.svg;

  var TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [12, 35, 37], [11, 60, 61]];
  var LTR = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'X', 'Y', 'Z'];
  function tri3() { return S.pickn(LTR, 3); }
  function tri6() { var s = S.pickn(LTR, 6); return [s.slice(0, 3), s.slice(3)]; }   // two triangles, no shared labels
  function deg(v) { return v + '^\\circ'; }

  function rightTriSVG(a, b, A, B, C, labA, labB, labC) {
    var w = 300, h = 220, x0 = 50, y0 = 175, sc = Math.min(180 / Math.max(a, b), 120 / Math.min(a, b) * 1.2);
    var px = x0 + a * sc * 0.9, py = y0 - b * sc * 0.9;
    var g = '<polygon points="' + x0 + ',' + y0 + ' ' + px + ',' + y0 + ' ' + x0 + ',' + py + '" fill="#f3f5ff" stroke="#1e1e1e" stroke-width="1.8"/>' +
      '<rect x="' + x0 + '" y="' + (y0 - 12) + '" width="12" height="12" fill="none" stroke="#1e1e1e" stroke-width="1.2"/>' +
      '<text x="' + (x0 - 12) + '" y="' + (y0 + 5) + '" font-weight="bold">' + C + '</text>' +
      '<text x="' + (px + 6) + '" y="' + (y0 + 5) + '" font-weight="bold">' + A + '</text>' +
      '<text x="' + (x0 - 12) + '" y="' + (py + 4) + '" font-weight="bold">' + B + '</text>';
    if (labA) g += '<text x="' + ((x0 + px) / 2) + '" y="' + (y0 + 18) + '" text-anchor="middle">' + labA + '</text>';
    if (labB) g += '<text x="' + (x0 - 16) + '" y="' + ((y0 + py) / 2) + '" text-anchor="end">' + labB + '</text>';
    if (labC) g += '<text x="' + ((px + x0) / 2 + 18) + '" y="' + ((y0 + py) / 2 - 6) + '">' + labC + '</text>';
    return svg(w, h, g);
  }

  /* ============================ S.A. Area and volume ============================ */

  // square plus rectangle
  S.reg('S.A.', 'E', function () {
    var s = ri(4, 14), ar = ri(3, 12) * 4;
    var tot = s * s + ar;
    var o = mcNum(tot, [s * s, ar, s * 4 + ar, s * s - ar]);
    return {
      stem: '<p>The length of a side of square X is $' + s + '$ centimeters. The area of rectangle Y is $' + com(ar) + '$ square centimeters.</p>',
      prompt: 'What is the total area, in square centimeters, of square X and rectangle Y?',
      choices: o.choices, correct: o.correct,
      expl: ['The area of a square is the side length squared: $' + s + '^2 = ' + (s * s) + '$ square centimeters.',
             'Rectangle Y already has its area given: $' + com(ar) + '$ square centimeters.',
             'Add them: $' + (s * s) + ' + ' + com(ar) + ' = ' + com(tot) + '$.'],
      key: 'Read what is given: one shape gives a side, the other already gives an area.'
    };
  });

  // circumference -> diameter
  S.reg('S.A.', 'M', function () {
    var d = ri(9, 60);
    return {
      spr: true, value: d,
      stem: '<p>A circle has a circumference of $' + d + '\\pi$ centimeters.</p>',
      prompt: 'What is the diameter, in centimeters, of the circle?',
      expl: ['The circumference of a circle is $C = \\pi d$, where $d$ is the diameter.',
             'Here $' + d + '\\pi = \\pi d$.',
             'Divide both sides by $\\pi$: $d = ' + d + '$ centimeters.',
             'Leaving $\\pi$ symbolic avoids any rounding: it cancels exactly.'],
      key: '$C = \\pi d$. When $\\pi$ appears on both sides, divide it out.'
    };
  });

  // prism volume -> height
  S.reg('S.A.', 'E', function () {
    var l = ri(6, 24), w = ri(4, 14), h = ri(5, 20), V = l * w * h;
    return {
      spr: true, value: h,
      stem: '<p>Each base of a right rectangular prism has a length of $' + l + '$ inches and a width of $' + w + '$ inches. The prism has a volume of $' + com(V) + '$ cubic inches.</p>',
      prompt: 'What is the height, in inches, of the prism?',
      expl: ['The volume of a right rectangular prism is $V = lwh$.',
             'The base area is $' + l + ' \\times ' + w + ' = ' + com(l * w) + '$ square inches.',
             'So $' + com(l * w) + 'h = ' + com(V) + '$, giving $h = ' + com(V) + ' \\div ' + com(l * w) + ' = ' + h + '$ inches.'],
      key: 'Volume = base area x height. Divide by the base area to get the height.'
    };
  });

  // cylinder volume
  S.reg('S.A.', 'M', function () {
    var r = ri(2, 9), h = ri(3, 15);
    var V = r * r * h;
    return {
      spr: true, value: h,
      stem: '<p>A right circular cylinder has a radius of $' + r + '$ centimeters and a volume of $' + com(V) + '\\pi$ cubic centimeters.</p>',
      prompt: 'What is the height, in centimeters, of the cylinder?',
      expl: ['The volume of a cylinder is $V = \\pi r^2 h$.',
             'Substitute: $' + com(V) + '\\pi = \\pi(' + r + ')^2 h = ' + (r * r) + '\\pi h$.',
             'Divide both sides by $' + (r * r) + '\\pi$: $h = ' + com(V) + ' \\div ' + (r * r) + ' = ' + h + '$ centimeters.'],
      key: 'Keep $\\pi$ symbolic so it cancels; only the numbers do work.'
    };
  });

  // similar-figure scaling
  S.reg('S.A.', 'H', function () {
    var k = ri(12, 200);
    return {
      spr: true, value: k * k,
      stem: '<p>Square A has side lengths that are $' + k + '$ times the side lengths of square B. The area of square A is $k$ times the area of square B.</p>',
      prompt: 'What is the value of $k$?',
      expl: ['Let square B have side $s$, so square A has side $' + k + 's$.',
             'Area of B is $s^2$; area of A is $(' + k + 's)^2 = ' + com(k * k) + 's^2$.',
             'So the area of A is $' + com(k * k) + '$ times the area of B, giving $k = ' + com(k * k) + '$.',
             'In general lengths scale by $n$, areas by $n^2$, and volumes by $n^3$.'],
      key: 'Lengths x n means areas x n squared.'
    };
  });

  /* ============================ S.B. Lines, angles, and triangles ============================ */

  // third angle of a triangle
  S.reg('S.B.', 'EM', function () {
    var two = ri(30, 150), third = 180 - two;
    var o = mcNum(third, [two, 360 - two, Math.round(two / 2), 180 + two], deg);
    return {
      stem: '',
      prompt: 'The sum of the measures of two angles in a triangle is $' + two + '^\\circ$. What is the measure of the third angle?',
      choices: o.choices, correct: o.correct,
      expl: ['The three angle measures of any triangle add to $180^\\circ$.',
             'Two of them add to $' + two + '^\\circ$, so the third is $180^\\circ - ' + two + '^\\circ = ' + third + '^\\circ$.'],
      key: 'Angles of a triangle sum to $180^\\circ$, always.'
    };
  });

  // congruent triangles
  S.reg('S.B.', 'E', function () {
    var tu = tri6(), t = tu[0], u = tu[1];
    var ang = ri(25, 120);
    var o = mcNum(ang, [180 - ang, 360 - ang, Math.round(ang / 2)], deg);
    return {
      stem: '<p>Triangles $' + t.join('') + '$ and $' + u.join('') + '$ are congruent, where $' + t[0] + '$, $' + t[1] + '$, and $' + t[2] + '$ correspond to $' + u[0] + '$, $' + u[1] + '$, and $' + u[2] + '$, respectively. The measure of angle $' + t[0] + '$ is $' + ang + '^\\circ$.</p>',
      prompt: 'What is the measure of angle $' + u[0] + '$?',
      choices: o.choices, correct: o.correct,
      expl: ['Congruent triangles have all corresponding parts equal.',
             'Angle $' + t[0] + '$ corresponds to angle $' + u[0] + '$, so they have the same measure.',
             'Therefore angle $' + u[0] + '$ measures $' + ang + '^\\circ$.'],
      key: 'Congruent means corresponding parts are equal; read the correspondence carefully.'
    };
  });

  // parallel lines cut by a transversal
  S.reg('S.B.', 'M', function () {
    var a = ri(30, 140), sup = 180 - a;
    var rel = pick(['vertical', 'corresponding', 'alternate interior', 'same-side interior']);
    var ans = rel === 'same-side interior' ? sup : a;
    var o = mcNum(ans, [180 - ans, 360 - ans, Math.round(ans / 2)], deg);
    return {
      stem: '<p>In a figure, two parallel lines are cut by a transversal. One of the eight angles formed measures $' + a + '^\\circ$.</p>',
      prompt: 'What is the measure of the angle that is ' + rel + ' to the $' + a + '^\\circ$ angle?',
      choices: o.choices, correct: o.correct,
      expl: [rel === 'same-side interior'
        ? 'Same-side interior angles (also called co-interior) formed by parallel lines are supplementary: they add to $180^\\circ$.'
        : ucFirst(rel) + ' angles formed by parallel lines cut by a transversal are congruent: they have equal measure.',
             rel === 'same-side interior'
        ? 'So the angle measures $180^\\circ - ' + a + '^\\circ = ' + sup + '^\\circ$.'
        : 'So the angle also measures $' + a + '^\\circ$.',
             'Only same-side interior (and any linear pair) are supplementary here; vertical, corresponding, and alternate pairs are equal.'],
      key: 'With parallel lines: same-side interior are supplementary, the rest are equal.'
    };
  });
  function ucFirst(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // similar triangles: find the missing side
  S.reg('S.B.', 'MH', function () {
    var tu = tri6(), t = tu[0], u = tu[1], k = ri(2, 6), a = ri(3, 12), b = ri(4, 15);
    var ans = b * k;
    var o = mcNum(ans, [b + k, b / k, a * k]);
    return {
      stem: '<p>Triangle $' + t.join('') + '$ is similar to triangle $' + u.join('') + '$, where $' + t[0] + '$, $' + t[1] + '$, and $' + t[2] + '$ correspond to $' + u[0] + '$, $' + u[1] + '$, and $' + u[2] + '$, respectively. The length of $' + t[0] + t[1] + '$ is $' + a + '$ and the length of $' + u[0] + u[1] + '$ is $' + (a * k) + '$. The length of $' + t[1] + t[2] + '$ is $' + b + '$.</p>',
      prompt: 'What is the length of $' + u[1] + u[2] + '$?',
      choices: o.choices, correct: o.correct,
      expl: ['Similar triangles have corresponding sides in a constant ratio.',
             'From the pair given: the ratio is $' + (a * k) + ' \\div ' + a + ' = ' + k + '$.',
             'Every side of the second triangle is $' + k + '$ times the matching side of the first, so $' + u[1] + u[2] + ' = ' + k + ' \\times ' + b + ' = ' + ans + '$.'],
      key: 'Find the scale factor from the one complete pair, then apply it.'
    };
  });

  /* ============================ S.C. Right triangles and trigonometry ============================ */

  // complementary sine and cosine
  S.reg('S.C.', 'EM', function () {
    var t = TRIPLES[ri(0, TRIPLES.length - 1)], a = t[0], b = t[1], c = t[2];
    var T = tri3();
    var o = mc('$' + fr(a, c) + '$', ['$' + fr(b, c) + '$', '$' + fr(a, b) + '$', '$' + fr(c, a) + '$']);
    return {
      stem: '<p>In right triangle $' + T.join('') + '$, angle $' + T[2] + '$ is a right angle, $\\sin(' + T[0] + ') = ' + fr(a, c) + '$.</p>',
      prompt: 'What is the value of $\\cos(' + T[1] + ')$?',
      choices: o.choices, correct: o.correct,
      expl: ['In a right triangle the two acute angles are complementary: $' + T[0] + ' + ' + T[1] + ' = 90^\\circ$.',
             'For complementary angles, the sine of one equals the cosine of the other: $\\sin(\\theta) = \\cos(90^\\circ - \\theta)$.',
             'So $\\cos(' + T[1] + ') = \\sin(' + T[0] + ') = ' + fr(a, c) + '$.',
             'Concretely, $\\sin(' + T[0] + ')$ is the opposite over hypotenuse for $' + T[0] + '$, and that same side is adjacent to $' + T[1] + '$.'],
      key: 'Sine of an angle = cosine of its complement.'
    };
  });

  // tangent ratio and a known leg -> perimeter
  S.reg('S.C.', 'H', function () {
    var t = TRIPLES[ri(0, TRIPLES.length - 1)], a = t[0], b = t[1], c = t[2];
    var k = ri(2, 4), T = tri3();
    var leg = b * k, other = a * k, hyp = c * k, per = leg + other + hyp;
    var o = mcNum(per, [leg + other, hyp + leg, per + hyp]);
    return {
      stem: rightTriSVG(a, b, T[0], T[1], T[2], '', '$' + com(leg) + '$', '') +
        '<p>In triangle $' + T.join('') + '$, angle $' + T[2] + '$ is a right angle and the length of $' + T[1] + T[2] + '$ is $' + com(leg) + '$ units. Also $\\tan(' + T[0] + ') = ' + fr(a, b) + '$.</p>',
      prompt: 'What is the perimeter, in units, of triangle $' + T.join('') + '$?',
      choices: o.choices, correct: o.correct,
      expl: ['$\\tan(' + T[0] + ')$ is the side opposite $' + T[0] + '$ over the side adjacent to it, which here is $\\frac{' + T[1] + T[2] + '_{\\text{opp}}}{' + T[0] + T[2] + '}$, and it equals $' + fr(a, b) + '$.',
             'The given leg corresponds to the $' + b + '$ in that ratio, and $' + com(leg) + ' \\div ' + b + ' = ' + k + '$, so every length is $' + k + '$ times the basic $' + a + '$-$' + b + '$-$' + c + '$ triple.',
             'The other leg is $' + a + ' \\times ' + k + ' = ' + com(other) + '$ and the hypotenuse is $' + c + ' \\times ' + k + ' = ' + com(hyp) + '$ (since $' + a + '^2 + ' + b + '^2 = ' + c + '^2$).',
             'Perimeter: $' + com(leg) + ' + ' + com(other) + ' + ' + com(hyp) + ' = ' + com(per) + '$.'],
      key: 'A trig ratio names a Pythagorean triple; scale it, then add all three sides.'
    };
  });

  // Pythagorean theorem, missing leg
  S.reg('S.C.', 'M', function () {
    var t = TRIPLES[ri(0, TRIPLES.length - 1)], k = ri(1, 5);
    var a = t[0] * k, b = t[1] * k, c = t[2] * k, T = tri3();
    var o = mcNum(a, [b, c, c - b, a + b]);
    return {
      stem: rightTriSVG(t[0], t[1], T[0], T[1], T[2], '', '$' + com(b) + '$', '$' + com(c) + '$') +
        '<p>In right triangle $' + T.join('') + '$, the right angle is at $' + T[2] + '$, the hypotenuse has length $' + com(c) + '$, and one leg has length $' + com(b) + '$.</p>',
      prompt: 'What is the length of the other leg?',
      choices: o.choices, correct: o.correct,
      expl: ['The Pythagorean theorem says leg$^2$ + leg$^2$ = hypotenuse$^2$.',
             'So the missing leg satisfies $x^2 = ' + com(c) + '^2 - ' + com(b) + '^2 = ' + com(c * c) + ' - ' + com(b * b) + ' = ' + com(c * c - b * b) + '$.',
             'Taking the positive square root: $x = ' + com(a) + '$.',
             'This is the $' + t[0] + '$-$' + t[1] + '$-$' + t[2] + '$ triple scaled by $' + k + '$, which is the fast way to spot it.'],
      key: 'Subtract inside the square, never outside: $c^2 - b^2$, then root.'
    };
  });

  // special right triangle
  S.reg('S.C.', 'H', function () {
    var leg = ri(2, 12), kind = coin();
    var ans = kind ? leg + '\\sqrt{2}' : leg + '\\sqrt{3}';
    var o = mc('$' + ans + '$', ['$' + leg * 2 + '$', '$' + (kind ? leg + '\\sqrt{3}' : leg + '\\sqrt{2}') + '$', '$\\frac{' + leg + '}{' + (kind ? '\\sqrt{2}' : '\\sqrt{3}') + '}$']);
    return {
      stem: '<p>' + (kind
        ? 'A right triangle has two angles measuring $45^\\circ$ and legs of length $' + leg + '$.'
        : 'A right triangle has angles measuring $30^\\circ$, $60^\\circ$, and $90^\\circ$. The side opposite the $30^\\circ$ angle has length $' + leg + '$.') + '</p>',
      prompt: kind ? 'What is the length of the hypotenuse?' : 'What is the length of the side opposite the $60^\\circ$ angle?',
      choices: o.choices, correct: o.correct,
      expl: [kind
        ? 'A $45^\\circ$-$45^\\circ$-$90^\\circ$ triangle has sides in the ratio $1 : 1 : \\sqrt{2}$.'
        : 'A $30^\\circ$-$60^\\circ$-$90^\\circ$ triangle has sides in the ratio $1 : \\sqrt{3} : 2$, shortest opposite the $30^\\circ$ angle.',
             kind
        ? 'With legs of $' + leg + '$, the hypotenuse is $' + leg + '\\sqrt{2}$.'
        : 'With the short side $' + leg + '$, the side opposite $60^\\circ$ is $' + leg + '\\sqrt{3}$ and the hypotenuse is $' + (leg * 2) + '$.',
             'These two ratios are on the reference sheet, so they never need deriving during the test.'],
      key: 'Memorize $1:1:\\sqrt2$ and $1:\\sqrt3:2$; match the shortest side first.'
    };
  });

  /* ============================ S.D. Circles ============================ */

  // equation of a circle from center and radius
  S.reg('S.D.', 'M', function () {
    var h = ri(-9, 9), k = ri(-9, 9), r = ri(2, 12);
    function sq(v, t) { return '(' + t + ' ' + (v < 0 ? '+ ' + Math.abs(v) : '- ' + v) + ')^2'; }
    var right = '$' + sq(h, 'x') + ' + ' + sq(k, 'y') + ' = ' + com(r * r) + '$';
    var o = mc(right, ['$' + sq(-h, 'x') + ' + ' + sq(-k, 'y') + ' = ' + com(r * r) + '$',
                       '$' + sq(h, 'x') + ' + ' + sq(k, 'y') + ' = ' + r + '$',
                       '$' + sq(-h, 'x') + ' + ' + sq(-k, 'y') + ' = ' + r + '$']);
    return {
      stem: '<p>A circle in the $xy$-plane has its center at $(' + h + ',\\ ' + k + ')$ and a radius of $' + r + '$.</p>',
      prompt: 'Which equation represents this circle?',
      choices: o.choices, correct: o.correct,
      expl: ['The standard form of a circle with center $(h, k)$ and radius $r$ is $(x - h)^2 + (y - k)^2 = r^2$.',
             'Here $h = ' + h + '$ and $k = ' + k + '$, so the binomials are $' + sq(h, 'x') + '$ and $' + sq(k, 'y') + '$ — note the signs are the opposite of the coordinates.',
             'The right side is the radius SQUARED: $' + r + '^2 = ' + com(r * r) + '$, not $' + r + '$.'],
      key: 'Signs flip inside the parentheses; the right side is $r^2$.'
    };
  });

  // general form -> a + b + c
  S.reg('S.D.', 'H', function () {
    var h = ri(-9, 9), k = ri(-9, 9), r = ri(3, 12);
    var a = -2 * h, b = -2 * k, c = h * h + k * k - r * r;
    var which = pick(['a', 'b', 'c']);
    var val = which === 'a' ? a : which === 'b' ? b : c;
    return {
      spr: true, value: val,
      stem: '<p>A circle in the $xy$-plane has its center at $(' + h + ',\\ ' + k + ')$ and has a radius of $' + r + '$. An equation of this circle is $x^2 + y^2 + ax + by + c = 0$, where $a$, $b$, and $c$ are constants.</p>',
      prompt: 'What is the value of $' + which + '$?',
      expl: ['Start from standard form: $(x ' + (h < 0 ? '+ ' + Math.abs(h) : '- ' + h) + ')^2 + (y ' + (k < 0 ? '+ ' + Math.abs(k) : '- ' + k) + ')^2 = ' + com(r * r) + '$.',
             'Expand: $x^2 ' + (a < 0 ? '- ' + Math.abs(a) : '+ ' + a) + 'x + ' + com(h * h) + ' + y^2 ' + (b < 0 ? '- ' + Math.abs(b) : '+ ' + b) + 'y + ' + com(k * k) + ' = ' + com(r * r) + '$.',
             'Move everything to the left: $x^2 + y^2 ' + (a < 0 ? '- ' + Math.abs(a) : '+ ' + a) + 'x ' + (b < 0 ? '- ' + Math.abs(b) : '+ ' + b) + 'y + (' + com(h * h) + ' + ' + com(k * k) + ' - ' + com(r * r) + ') = 0$.',
             'Matching coefficients: $a = ' + a + '$, $b = ' + b + '$, and $c = ' + com(c) + '$. The requested value is $' + which + ' = ' + com(val) + '$.'],
      key: 'Expand standard form and match: $a = -2h$, $b = -2k$, $c = h^2 + k^2 - r^2$.'
    };
  });

  // radius by completing the square
  S.reg('S.D.', 'M', function () {
    var h = ri(-7, 7), k = ri(-7, 7), r = ri(2, 10);
    var a = -2 * h, b = -2 * k, c = h * h + k * k - r * r;
    var o = mcNum(r, [r * r, Math.abs(c), Math.abs(h) + Math.abs(k)]);
    function sgnTerm(v, t) { return (v < 0 ? '- ' + Math.abs(v) : '+ ' + v) + t; }
    return {
      stem: '<p style="text-align:center">$x^2 + y^2 ' + sgnTerm(a, 'x') + ' ' + sgnTerm(b, 'y') + ' ' + (c < 0 ? '- ' + com(Math.abs(c)) : '+ ' + com(c)) + ' = 0$</p>',
      prompt: 'The given equation defines a circle in the $xy$-plane. What is the radius of the circle?',
      choices: o.choices, correct: o.correct,
      expl: ['Group the $x$ terms and the $y$ terms and complete the square on each.',
             'For $x$: half of $' + a + '$ is $' + (a / 2) + '$, and $(' + (a / 2) + ')^2 = ' + com(h * h) + '$. For $y$: half of $' + b + '$ is $' + (b / 2) + '$, and $(' + (b / 2) + ')^2 = ' + com(k * k) + '$.',
             'Move the constant to the right and add those two numbers to both sides: $(x ' + (h < 0 ? '+ ' + Math.abs(h) : '- ' + h) + ')^2 + (y ' + (k < 0 ? '+ ' + Math.abs(k) : '- ' + k) + ')^2 = ' + com(-c) + ' + ' + com(h * h) + ' + ' + com(k * k) + ' = ' + com(r * r) + '$.',
             'The right side is $r^2 = ' + com(r * r) + '$, so $r = ' + r + '$.'],
      key: 'Complete the square in both variables; the radius is the square root of the right side.'
    };
  });

  // unit circle value with a large angle
  S.reg('S.D.', 'EM', function () {
    var base = pick([[1, 6, '\\frac{\\sqrt{3}}{2}', '\\frac{1}{2}'], [1, 3, '\\frac{1}{2}', '\\frac{\\sqrt{3}}{2}'], [1, 4, '\\frac{\\sqrt{2}}{2}', '\\frac{\\sqrt{2}}{2}']]);
    var den = base[1], laps = ri(20, 60) * 2, num = laps * den + 1;
    var fn = coin() ? 'cos' : 'sin';
    var right = fn === 'cos' ? base[2] : base[3];
    var o = mc('$' + right + '$', ['$' + (fn === 'cos' ? base[3] : base[2]) + '$', '$1$', '$\\sqrt{3}$', '$\\frac{1}{2}$'].filter(function (s) { return s !== '$' + right + '$'; }));
    return {
      stem: '',
      prompt: 'What is the value of $\\' + fn + '\\left(\\frac{' + num + '\\pi}{' + den + '}\\right)$?',
      choices: o.choices, correct: o.correct,
      expl: ['Sine and cosine repeat every $2\\pi$, so subtract full turns until the angle lands in $[0, 2\\pi)$.',
             'One full turn is $2\\pi = \\frac{' + (2 * den) + '\\pi}{' + den + '}$, so removing turns means subtracting $' + (2 * den) + '$ from the numerator each time.',
             'Here $' + num + ' = ' + (laps * den) + ' + 1$, and $' + (laps * den) + ' \\div ' + (2 * den) + ' = ' + (laps / 2) + '$ is a whole number, so $' + (laps / 2) + '$ full turns come off and leave $\\frac{\\pi}{' + den + '}$.',
             'So the value equals $\\' + fn + '\\left(\\frac{\\pi}{' + den + '}\\right) = ' + right + '$.'],
      key: 'Reduce the angle modulo $2\\pi$ first; the reference angle does the rest.'
    };
  });

  // arc length / sector
  S.reg('S.D.', 'H', function () {
    var r = ri(3, 18), deg = pick([30, 45, 60, 90, 120, 135, 150, 180]);
    var arcNum = deg * r * 2, arcDen = 360;
    var g = gcd(arcNum, arcDen);
    var o = mc('$' + fr(arcNum, arcDen) + '\\pi$', ['$' + fr(deg * r * r, 360) + '\\pi$', '$' + fr(arcNum * 2, arcDen) + '\\pi$', '$' + fr(deg, 360) + '\\pi$']);
    return {
      stem: '<p>A circle has a radius of $' + r + '$. A central angle of the circle measures $' + deg + '^\\circ$.</p>',
      prompt: 'What is the length of the arc that the central angle intercepts?',
      choices: o.choices, correct: o.correct,
      expl: ['The whole circumference is $2\\pi r = ' + (2 * r) + '\\pi$.',
             'A central angle of $' + deg + '^\\circ$ covers $\\frac{' + deg + '}{360}$ of the full circle.',
             'So the arc length is $\\frac{' + deg + '}{360} \\times ' + (2 * r) + '\\pi = ' + fr(arcNum, arcDen) + '\\pi$.',
             'Sector AREA would use $\\pi r^2$ instead, which is the usual mix-up.'],
      key: 'Arc length is the angle fraction of the circumference; area uses $\\pi r^2$.'
    };
  });

})(window.SAT);
