/* lessons-pc1.js — Precalculus, Unit 1: Functions, the language everything else is written in. */
(function (L) {
  'use strict';
  function yt(q) { return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q); }

  L.track({
    id: 'pc', name: 'Precalculus', short: 'Precalc',
    head: 'Precalculus, the whole thing',
    blurb: 'Ten units, taught the way a good teacher would teach them if they had unlimited time with you: the idea first, then why it is true, then every shape the question comes in, then questions that never run out and get harder as you get better.',
    how: 'Each lesson opens with recall questions on the algebra it stands on, because a precalculus topic almost never fails for precalculus reasons — it fails because a factoring step or a sign rule underneath it is shaky. Then the teaching, built in numbered steps with worked examples where every line says why. Then a table naming every style the topic is asked in, so you recognise a question instead of meeting it fresh. Then the drill: questions generated on the spot, climbing a tier when you get two right in a row and dropping one when you miss, until you can answer at the top tier cold. Mastery locks it, and spaced review brings it back at 1, 3, 7, 16, 35 and 70 days — the schedule that beats forgetting.'
  });

  var U = 'Functions: the language';

  /* ==================================================================== pc.fn.def */
  L.lesson({
    id: 'pc.fn.def', track: 'pc', unit: 'F1', unitName: U,
    title: 'Functions, notation and evaluation',
    why: 'Everything in this course is a function being poked at. Before anything else you need to be fluent at reading $f(\\text{something})$ as an instruction, not as multiplication.',
    recall: [
      { q: 'Evaluate $3x^2 - 5x + 2$ at $x = -2$.', a: '$3(4) - 5(-2) + 2 = 12 + 10 + 2 = 24$. The squaring happens before the sign is lost: $(-2)^2 = 4$, not $-4$.' },
      { q: 'Expand $(x + h)^2$.', a: '$x^2 + 2xh + h^2$. The middle term is the one people drop, and it is the entire point of the difference quotient later.' },
      { q: 'What is the difference between $-3^2$ and $(-3)^2$?', a: '$-9$ and $9$. Without brackets the exponent binds tighter than the minus sign.' }
    ],
    teach: [
      {
        h: 'What a function actually is',
        p: [
          'A function is a rule that assigns to <b>each</b> input exactly <b>one</b> output. The word "each" forbids leaving an input unassigned; the word "one" forbids two outputs for the same input. Everything called a "test" later — the vertical line test, one-to-one, invertibility — is just this sentence being checked.',
          'The set of legal inputs is the <b>domain</b>; the set of outputs you actually get is the <b>range</b>. A function is not fully specified until you say what its domain is, though by convention we take the largest set of real numbers that makes the formula defined.',
          'Notation: $f(x)$ means "the output of $f$ when the input is $x$". It is not $f$ times $x$. The letter inside is a placeholder and carries no meaning of its own: $f(t) = t^2$ and $f(\\square) = \\square^2$ are the same function.'
        ],
        boxes: [{
          k: 'rule', t: 'The substitution principle',
          b: 'Whatever sits inside the parentheses replaces <i>every</i> occurrence of the variable in the formula, with brackets around it. If $f(x) = x^2 - 3x$, then $f(a+1) = (a+1)^2 - 3(a+1)$. Write the brackets first and expand second; almost every error in this topic comes from expanding in your head.'
        }]
      },
      {
        h: 'Evaluating, carefully',
        p: [
          'Substituting a number is mechanical, but two things go wrong often enough to be worth naming. First, negatives: $f(-3)$ with $f(x) = -x^2$ gives $-(-3)^2 = -9$, because the exponent applies to $-3$ inside its own brackets and the leading minus is separate. Second, substituting an <i>expression</i>: you must bracket it.',
          'Reading a value off a graph is the same act. $f(2) = 5$ is the statement "the point $(2,5)$ is on the graph". Conversely, solving $f(x) = 5$ asks which $x$-values sit at height $5$ — and unlike evaluation, that can have several answers, or none.'
        ],
        ex: [{
          q: 'For $f(x) = 2x^2 - x + 4$, find $f(-3)$ and then $f(a+2)$.',
          s: [
            '$f(-3) = 2(-3)^2 - (-3) + 4 = 2(9) + 3 + 4 = 25$.',
            'For $f(a+2)$, substitute with brackets everywhere: $2(a+2)^2 - (a+2) + 4$.',
            'Expand the square first: $(a+2)^2 = a^2 + 4a + 4$, so $2(a^2+4a+4) = 2a^2 + 8a + 8$.',
            'Now the rest: $2a^2 + 8a + 8 - a - 2 + 4 = 2a^2 + 7a + 10$.'
          ],
          n: 'Notice $f(a+2) \\ne f(a) + f(2)$. A function is a machine, not a distributive operation, and that is the single most common false assumption in the whole course.'
        }]
      },
      {
        h: 'Functions given piecewise, by table, by graph, by words',
        p: [
          'A <b>piecewise</b> definition gives a different formula on different parts of the domain. To evaluate, first decide which condition the input satisfies, then use only that formula. The conditions never overlap in a legitimate definition.',
          'A <b>table</b> defines a function on finitely many inputs. A <b>graph</b> defines one on a whole interval, read off by height. A <b>verbal</b> description ("the cost is \\$4 plus \\$0.30 per mile") is an instruction you translate into a formula: $C(m) = 4 + 0.30m$.',
          'These four representations are the same object seen four ways, and the SAT-style and AP-style questions move between them constantly. Getting comfortable translating in every direction is worth more than any single technique.'
        ],
        ex: [{
          q: 'Let $f(x) = \\begin{cases} x^2 - 1 & x < 2 \\\\ 3x + 4 & x \\ge 2 \\end{cases}$. Find $f(0)$, $f(2)$ and $f(5)$.',
          s: [
            '$0 < 2$, so use the first rule: $f(0) = 0^2 - 1 = -1$.',
            '$2 \\ge 2$, so the second rule owns $x = 2$: $f(2) = 3(2) + 4 = 10$.',
            '$5 \\ge 2$, second rule again: $f(5) = 19$.'
          ],
          n: 'The boundary point belongs to whichever piece has the $\\le$ or $\\ge$. Reading $x = 2$ into the first rule is the classic error and gives $3$ instead of $10$.'
        }]
      },
      {
        h: 'The difference quotient, met early on purpose',
        p: [
          'The expression $\\dfrac{f(x+h) - f(x)}{h}$ is the slope of the line through the points $(x, f(x))$ and $(x+h, f(x+h))$. It is the average rate of change over a gap of width $h$, and it becomes the derivative when $h$ shrinks to zero. You will meet it three more times in this course and every week of calculus.',
          'Building it is pure substitution plus algebra: compute $f(x+h)$ with brackets, subtract $f(x)$, and the constant terms cancel. Every surviving term contains an $h$, which is exactly why the $h$ in the denominator can be cancelled.',
          'If nothing cancels, you made an algebra error. The $h$ in the denominator <i>always</i> divides out for polynomials.'
        ],
        ex: [{
          q: 'Simplify the difference quotient for $f(x) = 3x^2 + x$.',
          s: [
            '$f(x+h) = 3(x+h)^2 + (x+h) = 3(x^2 + 2xh + h^2) + x + h = 3x^2 + 6xh + 3h^2 + x + h$.',
            'Subtract $f(x) = 3x^2 + x$: the $3x^2$ and the $x$ both cancel, leaving $6xh + 3h^2 + h$.',
            'Every term has an $h$: factor it out, $h(6x + 3h + 1)$.',
            'Divide by $h$: $6x + 3h + 1$.'
          ],
          n: 'As $h \\to 0$ this becomes $6x + 1$, which is the derivative of $3x^2 + x$. You have just done calculus a year early, with nothing but algebra.'
        }]
      },
      {
        h: 'Function equality, and what it is not',
        p: [
          'Two functions are the same when they have the same domain and agree at every point of it. $f(x) = \\frac{x^2-1}{x-1}$ and $g(x) = x+1$ are <b>not</b> the same function, because $f$ is undefined at $x = 1$ and $g$ is not. That single missing point is a hole, and it is the reason "cancel and move on" is sometimes wrong.',
          'Useful non-facts, each of which is false in general: $f(a+b) \\ne f(a) + f(b)$; $f(ab) \\ne f(a)f(b)$; $f(x)^{-1} \\ne f^{-1}(x)$ (the first is a reciprocal, the second is an inverse function). Say each of those out loud once — they cost people points for years.'
        ],
        boxes: [{
          k: 'trap', t: 'The two meanings of a superscript',
          b: '$f^{-1}(x)$ means the inverse function. $[f(x)]^{-1}$ means $\\frac{1}{f(x)}$. But $f^2(x)$ in most precalculus books means $[f(x)]^2$, and in a few it means $f(f(x))$. For trig, $\\sin^2 x$ always means $(\\sin x)^2$ while $\\sin^{-1} x$ always means arcsine. That inconsistency is historical, not logical; just know it.'
        }]
      }
    ],
    styles: [
      { n: 'Evaluate at a number', l: '"If $f(x) = \\dots$, find $f(-4)$."', m: 'Substitute with brackets; handle the negative before the exponent.' },
      { n: 'Evaluate at an expression', l: '$f(a+3)$, $f(2x)$, $f(-x)$.', m: 'Bracket, substitute everywhere, then expand.' },
      { n: 'Solve $f(x) = k$', l: 'Given the output, find the input.', m: 'Set the formula equal to $k$; expect zero, one or several answers.' },
      { n: 'Piecewise evaluation', l: 'Two or three rules with conditions.', m: 'Test the conditions first; the boundary belongs to the one with $\\le$ or $\\ge$.' },
      { n: 'Combination of values', l: '$2f(3) - f(-1)$, or $f(3) + g(3)$.', m: 'Evaluate each separately, then combine.' },
      { n: 'Difference quotient', l: '$\\frac{f(x+h)-f(x)}{h}$, simplified.', m: 'Expand, cancel the terms without $h$, factor $h$, divide.' },
      { n: 'From a table', l: 'A table of $x$ and $f(x)$ with a value requested.', m: 'Read straight off; for $f(f(2))$, work inside out.' },
      { n: 'From a graph', l: '"For what values of $x$ is $f(x) = 3$?"', m: 'Horizontal line at $3$; read every crossing.' },
      { n: 'Is it a function?', l: 'A graph, a table or a set of pairs.', m: 'Any input with two outputs kills it. Vertical line test on a graph.' },
      { n: 'Build a function from words', l: 'A cost, a distance, an area described in a sentence.', m: 'Name the variable, write the fixed part plus the per-unit part.' },
      { n: 'Net change', l: '$f(b) - f(a)$ in context.', m: 'Evaluate twice and subtract; keep the units.' }
    ],
    traps: [
      'Reading $f(x)$ as $f$ times $x$ and "distributing" it.',
      'Assuming $f(a+b) = f(a) + f(b)$ — almost never true.',
      'Losing the sign: writing $-3^2 = 9$, or $f(-x)$ without bracketing the $-x$.',
      'Forgetting the middle term of $(x+h)^2$.',
      'Using the wrong piece of a piecewise function at the boundary.',
      'Cancelling a factor in a rational formula and silently changing the domain.'
    ],
    videos: [
      { t: 'Function notation and evaluation', u: yt('function notation evaluating functions precalculus') },
      { t: 'Piecewise functions explained', u: yt('piecewise functions evaluate graph precalculus') },
      { t: 'The difference quotient', u: yt('difference quotient simplify precalculus organic chemistry tutor') }
    ]
  });

  /* ==================================================================== pc.fn.domain */
  L.lesson({
    id: 'pc.fn.domain', track: 'pc', unit: 'F1',
    title: 'Domain and range',
    why: 'Three rules generate almost every domain question in the course: no dividing by zero, no even root of a negative, no logarithm of a non-positive. Range is harder, and it is where most people are actually weak.',
    prereq: ['pc.fn.def'],
    recall: [
      { q: 'Solve $x^2 - 9 = 0$.', a: '$x = \\pm 3$. Both roots matter for excluding values from a domain.' },
      { q: 'Solve the inequality $2x - 6 \\ge 0$.', a: '$x \\ge 3$. Dividing by a positive leaves the direction alone.' },
      { q: 'What happens to an inequality when you multiply both sides by $-1$?', a: 'The direction flips. $-2x > 6$ becomes $x < -3$.' }
    ],
    teach: [
      {
        h: 'The three forbidden operations',
        p: [
          '<b>Division by zero.</b> Set every denominator equal to zero and exclude those inputs. This includes denominators hiding inside other expressions, and negative exponents, since $x^{-2} = \\frac{1}{x^2}$.',
          '<b>Even roots of negatives.</b> For $\\sqrt{\\;\\cdot\\;}$, $\\sqrt[4]{\\;\\cdot\\;}$ and so on, set the inside $\\ge 0$ and solve the inequality. Odd roots — cube roots especially — accept everything, which is a common false exclusion.',
          '<b>Logarithms of non-positives.</b> For $\\log(\\cdot)$ or $\\ln(\\cdot)$, set the inside $> 0$, strictly. Zero is not allowed either.',
          'When several of these appear at once, solve each condition separately and take the <b>intersection</b> — every condition must hold at the same time.'
        ],
        boxes: [{
          k: 'rule', t: 'The order that saves time',
          b: 'Look at the structure before you compute. Denominator? Set it to zero. Even root? Set the inside $\\ge 0$. Log? Set the inside $> 0$. Nothing else restricts a polynomial, so a polynomial always has domain all real numbers — including odd-degree ones and ones with huge coefficients.'
        }]
      },
      {
        h: 'Writing the answer: interval and set notation',
        p: [
          'Interval notation uses a square bracket for an endpoint you keep and a round bracket for one you exclude. Infinity always takes a round bracket, because it is not a number you can reach.',
          'Excluding an interior point splits the domain: the domain of $\\frac{1}{x-4}$ is $(-\\infty, 4) \\cup (4, \\infty)$. The $\\cup$ is "union" — the answer is both pieces together.',
          'Set-builder notation says the same thing in words: $\\{x \\mid x \\ne 4\\}$. Both are accepted; interval notation is faster to read and is what the AP course uses.'
        ],
        ex: [{
          q: 'Find the domain of $f(x) = \\dfrac{\\sqrt{x+5}}{x-2}$.',
          s: [
            'Two conditions. The square root needs $x + 5 \\ge 0$, so $x \\ge -5$.',
            'The denominator needs $x - 2 \\ne 0$, so $x \\ne 2$.',
            'Intersect: start from $[-5, \\infty)$ and punch out $2$.',
            'Domain: $[-5,\\ 2) \\cup (2,\\ \\infty)$.'
          ],
          n: 'The $-5$ keeps a square bracket because $\\sqrt{0}$ is perfectly legal. Only strict conditions get round brackets.'
        }]
      },
      {
        h: 'When the inside of a root is quadratic',
        p: [
          'For $\\sqrt{x^2 - 4}$ you need $x^2 - 4 \\ge 0$, which is not solved by taking a square root of both sides. Factor it: $(x-2)(x+2) \\ge 0$, then use a sign chart with the critical points $-2$ and $2$.',
          'A sign chart is three questions: what sign is each factor left of, between, and right of the critical points. The product is positive where the factors agree in sign. Here the answer is $(-\\infty, -2] \\cup [2, \\infty)$.',
          'This technique — critical points, then test a value in each region — is the same one used for rational inequalities later. Learn it once here properly.'
        ]
      },
      {
        h: 'Range: think about what the formula can reach',
        p: [
          'Range is not mechanical, so you reason structurally. A square is never negative: $x^2 \\ge 0$, so $x^2 + 3$ has range $[3, \\infty)$. A square root output is never negative: $\\sqrt{x-1}$ has range $[0, \\infty)$, and $-\\sqrt{x-1}$ has range $(-\\infty, 0]$.',
          'For a quadratic, the range runs from the vertex value outward, in the direction the parabola opens: $f(x) = a(x-h)^2 + k$ has range $[k, \\infty)$ when $a > 0$ and $(-\\infty, k]$ when $a < 0$.',
          'For a rational function, the horizontal asymptote is usually the value the output cannot take. $f(x) = \\frac{1}{x}$ has range $(-\\infty,0) \\cup (0,\\infty)$ — the output can be anything except zero.',
          'For anything built by transformation, take the parent range and apply the same vertical moves: a vertical stretch multiplies it, a vertical shift adds to it, and a reflection across the $x$-axis flips it.'
        ],
        boxes: [{
          k: 'nuance', t: 'Domain restrictions change the range',
          b: 'A stated domain overrides the natural one and usually shrinks the range. $f(x) = x^2$ on $[-1, 3]$ has range $[0, 9]$, not $[1,9]$ — the minimum comes from $x = 0$ inside the interval, not from either endpoint. On a closed interval, always check the endpoints <i>and</i> any interior turning point.'
        }]
      },
      {
        h: 'Domain in context, which is the one people forget',
        p: [
          'When a function models something real, the domain is limited by the situation. A side length is positive; a number of items is a non-negative integer; time since an event is $t \\ge 0$; a box cut from a $12$ by $16$ sheet with corner $x$ needs $0 < x < 6$, because the smaller side runs out first.',
          'AP-style questions ask this directly: "give the domain in the context of the problem". The algebraic domain is rarely the right answer.'
        ]
      }
    ],
    styles: [
      { n: 'Rational, one exclusion', l: '$\\frac{p(x)}{x-a}$.', m: 'Exclude $a$; write as a union of two intervals.' },
      { n: 'Rational, quadratic denominator', l: '$\\frac{p(x)}{x^2+bx+c}$.', m: 'Factor, exclude both roots — three intervals.' },
      { n: 'Square root of a linear', l: '$\\sqrt{ax+b}$.', m: 'Inside $\\ge 0$; flip the inequality if $a<0$.' },
      { n: 'Square root of a quadratic', l: '$\\sqrt{x^2-c}$.', m: 'Factor and use a sign chart.' },
      { n: 'Root over a denominator', l: '$\\frac{\\sqrt{x-a}}{x-b}$.', m: 'Both conditions, then intersect.' },
      { n: 'Logarithm', l: '$\\log(ax+b)$ or $\\ln(x^2-4)$.', m: 'Inside strictly positive.' },
      { n: 'Odd root or cube root', l: '$\\sqrt[3]{x-5}$.', m: 'No restriction — a deliberate trap.' },
      { n: 'Range of a quadratic', l: 'Vertex form or standard form.', m: 'Find the vertex; range runs from $k$ in the opening direction.' },
      { n: 'Range of a transformed parent', l: '$-2\\sqrt{x+1}+5$.', m: 'Parent range, then stretch, reflect, shift.' },
      { n: 'Range on a restricted domain', l: '"$f(x)=x^2$ for $-1 \\le x \\le 3$."', m: 'Check endpoints and interior turning points.' },
      { n: 'Domain in context', l: 'A box, a fence, a population.', m: 'Physical limits, not algebraic ones.' },
      { n: 'Domain from a graph', l: 'A graph with endpoints, open or closed dots.', m: 'Read the $x$-extent; open dot means excluded.' }
    ],
    traps: [
      'Excluding negatives from a cube root.',
      'Allowing zero inside a logarithm.',
      'Taking the union when the conditions must hold simultaneously.',
      'Forgetting that a factor cancelled from a rational function still leaves a hole.',
      'Giving the algebraic domain when the question asked for the contextual one.',
      'Reporting the range of a quadratic as all reals.'
    ],
    videos: [
      { t: 'Domain of a function, every case', u: yt('finding domain of function rational radical logarithm') },
      { t: 'Interval notation', u: yt('interval notation explained union') },
      { t: 'Finding the range', u: yt('how to find range of a function precalculus') }
    ]
  });

  /* ==================================================================== pc.fn.graphs */
  L.lesson({
    id: 'pc.fn.graphs', track: 'pc', unit: 'F1',
    title: 'Reading a graph completely',
    why: 'Intercepts, where it rises and falls, maxima and minima, and what it does at the far ends. Every one of these becomes a calculus question later, phrased in exactly the same words.',
    prereq: ['pc.fn.def'],
    recall: [
      { q: 'How do you find the $y$-intercept of $y = f(x)$?', a: 'Set $x = 0$: it is $f(0)$. A function has at most one, by definition.' },
      { q: 'How do you find $x$-intercepts?', a: 'Set $f(x) = 0$ and solve. These are the zeros, the roots, and the $x$-intercepts — three names for one thing.' },
      { q: 'What does "increasing on $(a,b)$" mean precisely?', a: 'For any two inputs in that interval, the larger input gives the larger output. On a graph: reading left to right, it goes up.' }
    ],
    teach: [
      {
        h: 'Intercepts: the two easy anchors',
        p: [
          'The $y$-intercept is $f(0)$, a single number, and it exists whenever $0$ is in the domain. In a model it is the starting value.',
          'The $x$-intercepts are the solutions of $f(x) = 0$. There may be none, one, or many. In factored form they are read off instantly: $f(x) = (x-3)(x+1)^2$ has zeros at $3$ and $-1$.',
          'Say the words correctly, because questions use all of them: a <b>zero</b> of $f$, a <b>root</b> of the equation $f(x)=0$, an <b>$x$-intercept</b> of the graph, and a <b>solution</b> — all the same $x$-value. A <b>factor</b> is the $(x-3)$ itself.'
        ]
      },
      {
        h: 'Increasing, decreasing, and the intervals they live on',
        p: [
          'Intervals of increase and decrease are always stated in terms of $x$, never $y$. Answering "it increases from $2$ to $7$" when $2$ and $7$ are heights is a standard lost point.',
          'At a turning point the function is neither increasing nor decreasing, so those points are excluded: an interval of increase is written with round brackets.',
          'A function can be increasing on two separate intervals with a dip between them. Report both, joined by $\\cup$.'
        ],
        boxes: [{
          k: 'trap', t: 'Say it in x',
          b: 'Increasing and decreasing describe the <i>input</i> intervals. Maxima and minima are the <i>output</i> values, located at input positions. "The maximum is $5$ at $x = 2$" is the fully correct phrasing, and questions often ask for one half specifically.'
        }]
      },
      {
        h: 'Maxima and minima, local and global',
        p: [
          'A <b>local</b> (relative) maximum is a point higher than everything immediately around it. A <b>global</b> (absolute) maximum is the highest point on the whole domain. A local max need not be global, and a global max need not be local if it occurs at an endpoint.',
          'On a closed interval a continuous function always attains both a global max and a global min — a fact you will meet again by name as the Extreme Value Theorem.',
          'For a quadratic there is exactly one turning point, at the vertex. For a polynomial of degree $n$ there are at most $n-1$.'
        ]
      },
      {
        h: 'End behaviour',
        p: [
          'End behaviour describes what happens as $x \\to \\infty$ and as $x \\to -\\infty$. For a polynomial it is decided entirely by the leading term: degree and sign of the leading coefficient, nothing else.',
          'Even degree: both ends go the same way — up if the leading coefficient is positive, down if negative. Odd degree: the ends disagree — up on the right and down on the left if positive, the reverse if negative.',
          'Written formally: $\\lim_{x\\to\\infty} f(x) = \\infty$, $\\lim_{x\\to-\\infty} f(x) = -\\infty$ for something like $f(x) = x^3$. This is limit notation used a year before limits, and the AP Precalculus course expects it.'
        ],
        ex: [{
          q: 'Describe the end behaviour of $f(x) = -2x^4 + 7x^3 - x + 9$, and give the $y$-intercept.',
          s: [
            'The leading term is $-2x^4$: even degree, negative coefficient.',
            'Even degree means both ends agree; negative coefficient means both go down.',
            'So $f(x) \\to -\\infty$ as $x \\to \\infty$, and $f(x) \\to -\\infty$ as $x \\to -\\infty$.',
            '$y$-intercept: $f(0) = 9$.'
          ],
          n: 'The $7x^3$ term matters near the origin and not at all far out. Far from zero the highest power overwhelms everything below it, by as much as you like if you go far enough.'
        }]
      },
      {
        h: 'Zeros, sign, and where a graph sits',
        p: [
          'Between consecutive zeros a continuous function keeps one sign. So the zeros carve the $x$-axis into intervals, and testing one point per interval tells you whether the graph is above or below the axis throughout it.',
          'That is a sign chart again, and it answers "for what $x$ is $f(x) > 0$" without graphing anything.',
          'If a zero has even multiplicity the graph touches the axis and turns back without crossing, so the sign does <i>not</i> change there. Odd multiplicity crosses. This is the one exception that makes sign charts subtle, and it is covered properly in the polynomial unit.'
        ]
      },
      {
        h: 'Reading the four representations against each other',
        p: [
          'Given a graph, you can state domain, range, intercepts, intervals of increase and decrease, extrema and end behaviour. Given a table, you can estimate all of them. Given a formula, you can compute them exactly.',
          'AP-style questions go the other way too: "which graph could represent a function with these properties?" Work property by property and eliminate. One violated property kills a choice, and you rarely need to check them all.'
        ]
      }
    ],
    styles: [
      { n: 'Find the intercepts', l: 'A formula, factored or not.', m: '$f(0)$ for $y$; solve $f(x)=0$ for $x$.' },
      { n: 'Intervals of increase', l: 'A graph or a described shape.', m: 'State in $x$, with round brackets at the turning points.' },
      { n: 'Local vs global extremum', l: '"Which is the absolute maximum?"', m: 'Compare all local values and the endpoints.' },
      { n: 'End behaviour of a polynomial', l: 'A formula of degree 3 to 5.', m: 'Leading term only: parity of the degree, sign of the coefficient.' },
      { n: 'End behaviour in limit notation', l: '"$\\lim_{x\\to-\\infty} f(x) = ?$"', m: 'Same reasoning, written as a limit.' },
      { n: 'Where is $f(x) > 0$', l: 'A factored polynomial.', m: 'Sign chart from the zeros; watch even multiplicities.' },
      { n: 'Match a graph to a description', l: 'Four candidate graphs.', m: 'Eliminate on one violated property at a time.' },
      { n: 'Read a value from a graph', l: '"Estimate $f(3)$", "solve $f(x)=1$."', m: 'Vertical read for the first, horizontal line for the second.' },
      { n: 'Count the turning points', l: 'A degree-$n$ polynomial.', m: 'At most $n-1$; the parity of $n$ constrains it further.' },
      { n: 'Zeros from a graph, equation from zeros', l: 'A graph crossing at given points.', m: 'Build factors, then use another point to fix the leading coefficient.' }
    ],
    traps: [
      'Giving intervals of increase in $y$-values.',
      'Including the turning point in an interval of increase.',
      'Using the constant term to judge end behaviour instead of the leading term.',
      'Assuming every local maximum is the global maximum.',
      'Forgetting that an even-multiplicity zero does not change the sign.'
    ],
    videos: [
      { t: 'Reading graphs: domain, range, increasing, decreasing', u: yt('increasing decreasing intervals local maximum minimum graph precalculus') },
      { t: 'End behaviour of polynomials', u: yt('end behavior polynomial leading coefficient test') },
      { t: 'Limit notation for end behaviour', u: yt('end behavior limit notation AP precalculus') }
    ]
  });

  /* ==================================================================== pc.fn.rates */
  L.lesson({
    id: 'pc.fn.rates', track: 'pc', unit: 'F1',
    title: 'Average rate of change and concavity',
    why: 'The AP Precalculus course is built on this idea: how fast a function changes, and whether that rate is itself growing. It is the bridge to the derivative, and it is the most heavily tested concept in the whole first unit.',
    prereq: ['pc.fn.def'],
    recall: [
      { q: 'What is the slope through $(1,4)$ and $(5,16)$?', a: '$\\frac{16-4}{5-1} = \\frac{12}{4} = 3$. Change in output over change in input.' },
      { q: 'What kind of function has a constant rate of change?', a: 'A linear one. That constant is the slope, and it is the defining property of linearity.' },
      { q: 'What kind of function has a constant <i>ratio</i> between successive outputs?', a: 'An exponential one, over equal input steps.' }
    ],
    teach: [
      {
        h: 'The definition, and what it measures',
        p: [
          'The average rate of change of $f$ on $[a,b]$ is $\\dfrac{f(b)-f(a)}{b-a}$. It is exactly the slope of the <b>secant line</b> joining the two points on the graph.',
          'It answers "on average, how much did the output change per unit of input across this interval?" It says nothing about what happened inside the interval — a function can go up, come back down, and still have a positive average rate of change.',
          'In context, always attach units: dollars per year, metres per second, degrees per minute. AP questions award the interpretation sentence, not just the number.'
        ],
        ex: [{
          q: 'Find the average rate of change of $f(x) = x^2 - 4x$ on $[1, 5]$, and say what it means.',
          s: [
            '$f(1) = 1 - 4 = -3$ and $f(5) = 25 - 20 = 5$.',
            'Average rate of change $= \\dfrac{5 - (-3)}{5 - 1} = \\dfrac{8}{4} = 2$.',
            'Meaning: across that interval the output rose by $2$ units for each unit increase in $x$, on average.'
          ],
          n: 'Inside the interval the function actually decreased first (the vertex is at $x=2$) and then rose. The average hides that completely, which is exactly its limitation.'
        }]
      },
      {
        h: 'Rates for the three basic families',
        p: [
          '<b>Linear.</b> The average rate of change is the same over every interval — that is what linear means. Equal input steps give equal output differences.',
          '<b>Quadratic.</b> The rate of change itself changes linearly. Equal input steps give differences that themselves have a constant <i>second</i> difference. That second difference equals $2a$ times the step squared, which is how you recover a quadratic from data.',
          '<b>Exponential.</b> Equal input steps give a constant <i>ratio</i>, not a constant difference. The rate of change is proportional to the current value, which is the defining property of exponential behaviour and the reason it eventually beats every polynomial.'
        ],
        boxes: [{
          k: 'rule', t: 'Differences identify the family',
          b: 'Take a table with equally spaced inputs. Constant first differences means linear. Constant second differences means quadratic. Constant third differences means cubic. Constant <i>ratio</i> means exponential. This one check answers a large family of AP Precalculus questions in seconds.'
        }]
      },
      {
        h: 'Concavity, stated without calculus',
        p: [
          'A function is <b>concave up</b> on an interval when its rate of change is increasing there, and <b>concave down</b> when the rate of change is decreasing. That is the definition, and it is about the rate, not about whether the function itself is rising.',
          'All four combinations exist and the AP course tests them deliberately: increasing and concave up (rising, faster and faster); increasing and concave down (rising, but levelling off); decreasing and concave up (falling, but slowing); decreasing and concave down (falling, faster and faster).',
          'Visually, concave up holds water and lies above its tangent lines; concave down sheds water. The secant line on a concave-up interval lies <i>above</i> the curve between its endpoints, which is why the average rate overestimates the middle behaviour there.',
          'A point where concavity switches is a <b>point of inflection</b>. For a cubic there is exactly one.'
        ],
        ex: [{
          q: 'A table gives $f(0)=2$, $f(1)=5$, $f(2)=11$, $f(3)=20$. Is $f$ concave up or concave down on $[0,3]$?',
          s: [
            'Successive differences: $5-2 = 3$, then $11-5 = 6$, then $20-11 = 9$.',
            'The rate of change over each unit step is $3$, then $6$, then $9$ — increasing.',
            'An increasing rate of change means concave up.'
          ],
          n: 'The second differences are $3$ and $3$: constant, so this data is exactly quadratic. Concave up and quadratic fit together because the leading coefficient is positive.'
        }]
      },
      {
        h: 'The secant becomes the tangent',
        p: [
          'Fix $a$ and let $b$ slide toward it. The secant line through the two points swings until it rests on the curve at a single point: the <b>tangent line</b>. Its slope is the <b>instantaneous</b> rate of change at $a$.',
          'Written with $b = a + h$, the average rate is $\\frac{f(a+h)-f(a)}{h}$ — the difference quotient again. The derivative is what that expression approaches as $h \\to 0$.',
          'You can already estimate an instantaneous rate: compute the average rate over a very small interval around the point. That is what a calculator does when it reports a numerical derivative.'
        ]
      },
      {
        h: 'Reading rates from a graph and a table',
        p: [
          'From a graph: pick the two points, read their coordinates, compute rise over run. From a table: same, but you must use the row values exactly as given.',
          'Questions that ask "over which interval is the average rate of change greatest?" are asking which pair of points has the steepest connecting line. Compute all of them; the steepest-looking segment is not always the steepest when the intervals have different widths.',
          'A related style gives the average rate and asks for a missing function value. Set up the formula and solve for the unknown — one equation, one unknown.'
        ]
      }
    ],
    styles: [
      { n: 'ARoC from a formula', l: 'A polynomial on $[a,b]$.', m: 'Evaluate twice, subtract, divide by the width.' },
      { n: 'ARoC from a table', l: 'Two rows named.', m: 'Same formula with table values.' },
      { n: 'ARoC from a graph', l: 'Two marked points.', m: 'Rise over run between them.' },
      { n: 'Interpret the rate', l: '"What does $-3.2$ mean here?"', m: 'A sentence with units and direction.' },
      { n: 'Greatest average rate', l: 'Several intervals offered.', m: 'Compute each; widths differ, so appearance misleads.' },
      { n: 'Solve for a missing value', l: 'ARoC given, $f(b)$ unknown.', m: 'Set the formula equal and solve.' },
      { n: 'Identify the family from differences', l: 'A table with equal input steps.', m: 'First differences, second differences, or ratios.' },
      { n: 'Concavity from a table', l: 'Four or five rows.', m: 'Are the successive differences growing or shrinking?' },
      { n: 'Concavity plus direction', l: '"Increasing and concave down" as a choice.', m: 'Two independent judgements: rising or falling, and rate growing or shrinking.' },
      { n: 'Secant versus tangent', l: 'Which is bigger, average or instantaneous?', m: 'On a concave-up interval the secant slope exceeds the tangent slope at the left endpoint.' },
      { n: 'Estimate an instantaneous rate', l: 'A small interval around a point.', m: 'Average rate over a narrow interval.' }
    ],
    traps: [
      'Dividing by $b$ instead of by $b - a$.',
      'Reversing the subtraction in only one of the two places.',
      'Calling a rising function concave up automatically.',
      'Reading second differences off unequally spaced inputs.',
      'Giving a number where the question wanted an interpretation with units.'
    ],
    videos: [
      { t: 'Average rate of change', u: yt('average rate of change precalculus secant line') },
      { t: 'Concavity and rates of change', u: yt('concave up concave down rate of change AP precalculus') },
      { t: 'Finite differences identify the function', u: yt('first second differences linear quadratic exponential table') }
    ]
  });

  /* ==================================================================== pc.fn.transform */
  L.lesson({
    id: 'pc.fn.transform', track: 'pc', unit: 'F1',
    title: 'Transformations of graphs',
    why: 'Learn the eight parent graphs and the six moves, and you can sketch hundreds of functions without plotting a single point. It also explains amplitude, period and phase shift before you ever meet a sine wave.',
    prereq: ['pc.fn.def'],
    recall: [
      { q: 'Sketch $y = x^2$, $y = \\sqrt{x}$, $y = |x|$ and $y = \\frac{1}{x}$ from memory.', a: 'Parabola opening up from the origin; half-parabola on its side starting at the origin going right; a V with vertex at the origin; two hyperbola branches in quadrants I and III with both axes as asymptotes.' },
      { q: 'What does replacing $x$ with $x - 3$ do?', a: 'Shifts the graph right by $3$. Inside changes move the graph the opposite way to the sign.' },
      { q: 'What does multiplying the whole function by $-1$ do?', a: 'Reflects it across the $x$-axis. Replacing $x$ by $-x$ reflects across the $y$-axis instead.' }
    ],
    teach: [
      {
        h: 'The parent library',
        p: [
          'Eight shapes carry almost everything: $y = x$ (line), $y = x^2$ (parabola), $y = x^3$ (odd cubic through the origin), $y = |x|$ (V), $y = \\sqrt{x}$ (half parabola), $y = \\sqrt[3]{x}$ (through the origin, defined everywhere), $y = \\frac{1}{x}$ (hyperbola with two asymptotes), and $y = b^x$ (exponential with a horizontal asymptote).',
          'For each, know its domain, its range, its symmetry, and its end behaviour cold. Everything else in this lesson is one of these eight being moved, stretched or flipped.'
        ]
      },
      {
        h: 'Outside changes do the obvious thing; inside changes do the opposite',
        p: [
          'Write the general form $g(x) = a\\,f\\big(b(x - h)\\big) + k$. Every transformation is one of those four letters.',
          '<b>Outside</b> the function — $a$ and $k$ — act on the output, so they move the graph vertically and do exactly what they look like. $+k$ moves up by $k$. Multiplying by $a$ stretches vertically by a factor of $|a|$, and a negative $a$ also flips it across the $x$-axis.',
          '<b>Inside</b> the function — $b$ and $h$ — act on the input, so they move the graph horizontally and do the <i>reverse</i> of what they look like. $x - h$ moves right by $h$ (not left). Multiplying the input by $b$ compresses horizontally by a factor of $b$, that is, stretches by $\\frac{1}{b}$. A negative $b$ also reflects across the $y$-axis.',
          'The reason is simple once seen: to get the same output as before, the input now has to be bigger by $h$, so every feature slides right.'
        ],
        boxes: [{
          k: 'rule', t: 'The point-mapping test',
          b: 'Under $g(x) = a f(b(x-h)) + k$, a point $(p, q)$ on $f$ moves to $\\left(\\dfrac{p}{b} + h,\\ aq + k\\right)$. Divide the $x$, multiply the $y$. Testing one known point this way settles any disagreement about direction in about ten seconds.'
        }]
      },
      {
        h: 'Order matters, and here is the order',
        p: [
          'Horizontal moves: factor out $b$ first, then the shift is $h$. $f(2x - 6) = f(2(x-3))$ is a compression by $2$ <i>and</i> a shift right $3$ — not a shift right $6$. Failing to factor is the single biggest transformation error.',
          'Vertically, apply the stretch before the shift: $a$ multiplies the parent output and then $k$ is added. Writing $-2f(x) + 5$ means stretch by $2$, reflect, then move up $5$.',
          'Horizontal and vertical transformations never interfere with each other, so you can do all the $x$-side work and all the $y$-side work independently.'
        ],
        ex: [{
          q: 'Describe the transformations taking $f(x) = \\sqrt{x}$ to $g(x) = -3\\sqrt{2x + 8} - 1$, and give the new starting point.',
          s: [
            'Factor the inside: $2x + 8 = 2(x + 4)$, so $g(x) = -3\\sqrt{2(x+4)} - 1$.',
            'Inside: horizontal compression by a factor of $2$, then a shift <i>left</i> $4$ (because $x+4$ means $x - (-4)$).',
            'Outside: vertical stretch by $3$, reflection across the $x$-axis (the minus), then a shift down $1$.',
            'The parent starts at $(0,0)$. Apply the map: $x$-coordinate $\\frac{0}{2} + (-4) = -4$; $y$-coordinate $-3(0) - 1 = -1$. New start: $(-4, -1)$.'
          ],
          n: 'Reading the inside as "shift left 8" is the trap, and it gives $(-8,-1)$ — an answer choice every single time.'
        }]
      },
      {
        h: 'What each transformation preserves',
        p: [
          'Vertical shifts change the range, not the domain. Horizontal shifts change the domain, not the range. Vertical stretches change the range; horizontal stretches change the domain.',
          'Reflection across the $x$-axis negates the range; across the $y$-axis it negates the domain. Neither changes the shape.',
          'Zeros move with horizontal transformations and survive vertical stretches, but a vertical shift destroys them — that is precisely why shifting a parabola up can leave it with no real zeros.'
        ]
      },
      {
        h: 'Going backwards: writing the equation from a description or a graph',
        p: [
          'Given "the graph of $y = |x|$ shifted right $2$, stretched vertically by $4$ and reflected in the $x$-axis", assemble the form directly: $y = -4|x - 2|$.',
          'Given a graph, find the parent by its shape, locate the moved anchor point (the vertex, the corner, the endpoint of the root), and read $h$ and $k$ from it. Then use one more point to solve for $a$.',
          'This is exactly the procedure you will reuse for sinusoidal modelling: midline and amplitude are $k$ and $a$; period and phase shift are $b$ and $h$.'
        ]
      },
      {
        h: 'Absolute value wrapped around a function',
        p: [
          '$y = |f(x)|$ takes everything below the $x$-axis and flips it up. The graph never goes below the axis, and it develops corners where the zeros were.',
          '$y = f(|x|)$ is different: it keeps the right half of the graph and mirrors it onto the left, discarding the original left half. The result is always even.',
          'These two are routinely confused; the first is an outside change (acts on output), the second is inside (acts on input), and the general rule settles it.'
        ]
      }
    ],
    styles: [
      { n: 'Name the transformation', l: '$g(x) = f(x+3)-2$.', m: 'Inside reverses, outside is literal.' },
      { n: 'Write the equation', l: 'A described chain of moves on a parent.', m: 'Assemble $a f(b(x-h)) + k$ in order.' },
      { n: 'Factor before reading the shift', l: '$f(3x - 12)$.', m: 'Factor to $f(3(x-4))$: compress by 3, shift right 4.' },
      { n: 'Map a point', l: '"$(2,5)$ is on $f$; where is it on $g$?"', m: 'Divide the $x$ by $b$ then add $h$; multiply the $y$ by $a$ then add $k$.' },
      { n: 'New domain or range', l: 'Transformed parent with known parent domain.', m: 'Horizontal moves hit the domain, vertical hit the range.' },
      { n: 'Match graph to equation', l: 'Four equations, one picture.', m: 'Check the anchor point first, then orientation, then steepness.' },
      { n: 'Vertex or anchor location', l: '"Where is the vertex of $y=a(x-h)^2+k$?"', m: 'Read $(h,k)$ with the sign flip inside.' },
      { n: 'Reflection identification', l: 'A negative inside or outside.', m: 'Outside minus: across the $x$-axis. Inside minus: across the $y$-axis.' },
      { n: 'Absolute value wrapper', l: '$|f(x)|$ versus $f(|x|)$.', m: 'Flip up what was below, versus mirror the right half leftward.' },
      { n: 'Stretch factor from two graphs', l: 'Parent and image both shown.', m: 'Ratio of corresponding $y$-values at the same $x$.' }
    ],
    traps: [
      'Reading $f(x+4)$ as a shift right.',
      'Not factoring $b$ out before reading the horizontal shift.',
      'Applying the vertical shift before the vertical stretch.',
      'Treating a horizontal stretch factor as $b$ rather than $\\frac{1}{b}$.',
      'Confusing $|f(x)|$ with $f(|x|)$.',
      'Forgetting that a vertical shift can remove all the zeros.'
    ],
    videos: [
      { t: 'Transformations of functions, all of them', u: yt('transformations of functions shifts stretches reflections precalculus') },
      { t: 'Parent functions library', u: yt('parent functions and their graphs precalculus') },
      { t: 'Horizontal stretches and the factoring trap', u: yt('horizontal stretch compression factor inside function transformation') }
    ]
  });

  /* ==================================================================== pc.fn.symmetry */
  L.lesson({
    id: 'pc.fn.symmetry', track: 'pc', unit: 'F1',
    title: 'Symmetry, even and odd, and piecewise functions',
    why: 'Even and odd are tested directly, and they quietly halve the work in trigonometry, series and integration later. Piecewise functions are where continuity questions are born.',
    prereq: ['pc.fn.transform'],
    recall: [
      { q: 'Compute $f(-x)$ for $f(x) = 3x^4 - x^2 + 7$.', a: '$3x^4 - x^2 + 7$ — unchanged, because every exponent is even. So the function is even.' },
      { q: 'Compute $f(-x)$ for $f(x) = x^3 - 4x$.', a: '$-x^3 + 4x = -(x^3 - 4x) = -f(x)$, so the function is odd.' },
      { q: 'Is $f(x) = x^2 + x$ even, odd, or neither?', a: 'Neither. $f(-x) = x^2 - x$, which equals neither $f(x)$ nor $-f(x)$.' }
    ],
    teach: [
      {
        h: 'The two definitions, and the only correct test',
        p: [
          '$f$ is <b>even</b> when $f(-x) = f(x)$ for every $x$ in the domain. Its graph is symmetric about the $y$-axis.',
          '$f$ is <b>odd</b> when $f(-x) = -f(x)$ for every $x$. Its graph has $180^\\circ$ rotational symmetry about the origin.',
          'Most functions are neither. "Neither" is a real and common answer, not a fallback.',
          'The test is always: compute $f(-x)$, simplify fully, and compare with $f(x)$ and with $-f(x)$. Guessing from the picture in your head is unreliable once the function is not a bare power.'
        ],
        boxes: [{
          k: 'nuance', t: 'Where the names come from',
          b: 'A polynomial with only even powers is even; only odd powers, odd. A constant term counts as $x^0$, an even power, so it never breaks evenness but always breaks oddness. That is why $x^3 + 1$ is neither: the $+1$ ruins it.'
        }]
      },
      {
        h: 'Consequences worth knowing',
        p: [
          'An odd function that is defined at $0$ must have $f(0) = 0$, because $f(0) = -f(0)$ forces it. That single fact answers a whole class of questions instantly.',
          'Even times even is even; odd times odd is even; even times odd is odd — exactly like the parity of integers under addition of exponents.',
          'Cosine is even and sine is odd, which is why $\\cos(-\\theta) = \\cos\\theta$ and $\\sin(-\\theta) = -\\sin\\theta$. You are learning a trigonometric identity right now without meeting trigonometry.',
          'The sum of two even functions is even; the sum of two odd functions is odd; a sum of one of each is generally neither.'
        ],
        ex: [{
          q: 'Determine whether $f(x) = \\dfrac{x^3}{x^2 + 1}$ is even, odd or neither.',
          s: [
            'Compute $f(-x) = \\dfrac{(-x)^3}{(-x)^2 + 1} = \\dfrac{-x^3}{x^2 + 1}$.',
            'That equals $-\\dfrac{x^3}{x^2+1} = -f(x)$.',
            'So $f$ is odd.'
          ],
          n: 'Odd on top divided by even on the bottom gives odd, which matches the rule. Checking the rule against the computation is a good habit; the computation is the proof.'
        }]
      },
      {
        h: 'Symmetry of graphs that are not functions',
        p: [
          'A relation can also be symmetric about the $x$-axis — replace $y$ with $-y$ and get the same equation. $x = y^2$ has this symmetry, and it is precisely why it fails the vertical line test.',
          'So a function can never have $x$-axis symmetry unless it is the zero function. Questions about "symmetry of the graph" include this case; questions about "even or odd function" do not.'
        ]
      },
      {
        h: 'Piecewise functions: evaluate, graph, and join',
        p: [
          'To evaluate, choose the piece whose condition the input satisfies. To graph, draw each piece only over its own interval, with a filled dot where the endpoint is included and an open dot where it is not.',
          'At a boundary, the function is <b>continuous</b> when the two pieces reach the same value there. If a piece is defined with an unknown constant, setting the two expressions equal at the boundary and solving is the standard question.',
          'The absolute value function is secretly piecewise: $|x| = x$ for $x \\ge 0$ and $-x$ for $x < 0$. Rewriting it this way is how absolute value equations and inequalities are solved honestly rather than by rule.'
        ],
        ex: [{
          q: 'For $f(x) = \\begin{cases} 2x + c & x \\le 3 \\\\ x^2 - 4 & x > 3 \\end{cases}$, find $c$ so that $f$ is continuous.',
          s: [
            'At $x = 3$ the top piece gives $2(3) + c = 6 + c$.',
            'As $x$ approaches $3$ from the right, the bottom piece approaches $3^2 - 4 = 5$.',
            'Continuity requires the two to agree: $6 + c = 5$, so $c = -1$.'
          ],
          n: 'The second piece never actually reaches $x=3$, but continuity is about the value it approaches. That distinction is the whole idea of a limit, arriving early.'
        }]
      },
      {
        h: 'Step functions and other piecewise citizens',
        p: [
          'The greatest integer (floor) function $\\lfloor x \\rfloor$ gives the largest integer not exceeding $x$: $\\lfloor 2.7 \\rfloor = 2$, and $\\lfloor -2.7 \\rfloor = -3$ — not $-2$. Its graph is a staircase, constant between integers and jumping at each one.',
          'Real-world piecewise models are common: postage rates, tax brackets, parking charges, shipping tiers. These are the contexts AP questions use, and each bracket boundary is the interesting point.'
        ]
      }
    ],
    styles: [
      { n: 'Even, odd or neither from a formula', l: 'A polynomial or rational function.', m: 'Compute $f(-x)$ and compare with both $f(x)$ and $-f(x)$.' },
      { n: 'Even or odd from a graph', l: 'A picture.', m: '$y$-axis mirror means even; origin rotation means odd.' },
      { n: 'Even or odd from a table', l: 'Values at $\\pm x$.', m: 'Equal means even; opposite means odd.' },
      { n: 'Use $f(0)=0$', l: 'An odd function with a constant.', m: 'An odd function through the origin forces the constant to zero.' },
      { n: 'Parity of a product', l: '"$f$ even, $g$ odd, what is $fg$?"', m: 'Exponent parity rules: even $\\times$ odd is odd.' },
      { n: 'Evaluate a piecewise function', l: 'Two or three rules.', m: 'Check the conditions first; the boundary belongs to the closed side.' },
      { n: 'Piecewise continuity', l: 'An unknown constant at the seam.', m: 'Set the two expressions equal at the boundary and solve.' },
      { n: 'Graph a piecewise function', l: 'Rules with intervals.', m: 'Draw each on its own interval, open versus filled dots.' },
      { n: 'Rewrite absolute value piecewise', l: '$|2x-6|$.', m: 'Split at the zero of the inside; negate below it.' },
      { n: 'Floor and step functions', l: '$\\lfloor x \\rfloor$ at a negative decimal.', m: 'Round down, which means more negative.' }
    ],
    traps: [
      'Concluding "even" because the graph looks roughly symmetric.',
      'Forgetting that a constant term breaks oddness.',
      'Using the wrong piece at a boundary point.',
      'Evaluating $\\lfloor -2.3 \\rfloor$ as $-2$.',
      'Matching the pieces by value only on one side when both sides must agree.'
    ],
    videos: [
      { t: 'Even and odd functions', u: yt('even and odd functions algebraically precalculus') },
      { t: 'Piecewise functions: graph and continuity', u: yt('piecewise function continuity find constant precalculus') },
      { t: 'Greatest integer and step functions', u: yt('greatest integer function step function graph') }
    ]
  });

  /* ==================================================================== pc.fn.comp */
  L.lesson({
    id: 'pc.fn.comp', track: 'pc', unit: 'F1',
    title: 'Composition and decomposition',
    why: 'Composition is how complicated functions are actually built, and recognising the layers is exactly the skill the chain rule will demand of you next year.',
    prereq: ['pc.fn.def', 'pc.fn.domain'],
    recall: [
      { q: 'If $f(x) = x^2$ and $g(x) = x + 3$, what is $f(g(1))$?', a: '$g(1) = 4$, then $f(4) = 16$. Work inside out.' },
      { q: 'Is $f(g(x))$ the same as $g(f(x))$?', a: 'Almost never. With the functions above, $f(g(x)) = (x+3)^2$ while $g(f(x)) = x^2 + 3$.' },
      { q: 'What does the notation $(f \\circ g)(x)$ mean?', a: '$f(g(x))$ — apply $g$ first, then $f$. The one written second acts first.' }
    ],
    teach: [
      {
        h: 'Inside out, always',
        p: [
          '$(f \\circ g)(x) = f(g(x))$ means: feed $x$ to $g$, take what comes out, feed that to $f$. The function closest to $x$ acts first, which is why the notation reads backwards relative to the order of operations.',
          'To compose numerically, evaluate the inner function first, then substitute that single number. To compose symbolically, substitute the entire formula for $g$ into every occurrence of the variable in $f$, with brackets.',
          'Composition is not commutative and it is not multiplication. $f \\circ g$ and $fg$ are entirely different objects.'
        ],
        ex: [{
          q: 'With $f(x) = 2x - 1$ and $g(x) = x^2 + 3$, find $(f\\circ g)(x)$ and $(g \\circ f)(x)$.',
          s: [
            '$(f\\circ g)(x) = f(x^2+3) = 2(x^2+3) - 1 = 2x^2 + 6 - 1 = 2x^2 + 5$.',
            '$(g\\circ f)(x) = g(2x-1) = (2x-1)^2 + 3 = 4x^2 - 4x + 1 + 3 = 4x^2 - 4x + 4$.',
            'They are different, which is the normal state of affairs.'
          ],
          n: 'Both required bracketing the substituted expression. Dropping the brackets in the second turns $(2x-1)^2$ into $2x^2-1$, which is the standard wrong answer.'
        }]
      },
      {
        h: 'The domain of a composition, which is the subtle part',
        p: [
          'For $f(g(x))$ to make sense, two things must hold: $x$ must be in the domain of $g$, and $g(x)$ must be in the domain of $f$. Both conditions, simultaneously.',
          'The trap is that the simplified formula often hides the first condition. If $g(x) = \\sqrt{x}$ and $f(x) = x^2$, then $f(g(x)) = x$, which looks defined everywhere — but $x$ must still be $\\ge 0$, because you cannot start by taking the square root of a negative.',
          'So: find the domain of the inner function first, then remove any inputs whose output the outer function rejects. Never read the domain off the simplified result.'
        ],
        boxes: [{
          k: 'trap', t: 'Simplification hides restrictions',
          b: 'Every domain restriction of the inner function survives composition, even when the algebra cancels it out of sight. Write down the inner domain before you simplify anything.'
        }]
      },
      {
        h: 'Decomposition: seeing the layers',
        p: [
          'Given $h(x) = \\sqrt{3x + 5}$, write it as $f(g(x))$ with $g(x) = 3x+5$ (the inside) and $f(x) = \\sqrt{x}$ (the outside). The rule of thumb: the inner function is whatever sits inside the parentheses, under the root, or in the exponent.',
          'Decomposition is not unique — you could also take $g(x) = 3x$ and $f(x) = \\sqrt{x+5}$ — but the natural split is the one that makes the outer function a single recognisable parent.',
          'This is precisely the skill the chain rule requires: differentiate the outside, keep the inside, multiply by the derivative of the inside. Getting fluent at spotting layers now makes that rule almost free later.'
        ],
        ex: [{
          q: 'Write $h(x) = \\dfrac{1}{(x^2 - 4)^3}$ as a composition of two functions.',
          s: [
            'The innermost expression is $x^2 - 4$. Take $g(x) = x^2 - 4$.',
            'What happens to it: it is cubed and then reciprocated. So $f(u) = \\dfrac{1}{u^3} = u^{-3}$.',
            'Check: $f(g(x)) = (x^2-4)^{-3} = \\dfrac{1}{(x^2-4)^3}$. ✓'
          ],
          n: 'Writing the outer function in the variable $u$ rather than $x$ keeps the layers from blurring together while you work.'
        }]
      },
      {
        h: 'Three or more layers, and composition with itself',
        p: [
          '$(f \\circ g \\circ h)(x) = f(g(h(x)))$: innermost first, then outward. Do one layer at a time and write each intermediate result down.',
          '$(f \\circ f)(x)$ means applying the same function twice. For $f(x) = 2x + 1$: $f(f(x)) = 2(2x+1) + 1 = 4x + 3$. There is nothing special about it beyond substituting the function into itself.',
          'Questions sometimes ask for $f(f(f(2)))$ numerically; just iterate, keeping each result.'
        ]
      },
      {
        h: 'Composition in context and as a chain of units',
        p: [
          'Composition models chained processes: if $r(t)$ gives a radius in centimetres after $t$ seconds and $A(r)$ gives area from radius, then $A(r(t))$ gives area as a function of time. The units confirm the order — you cannot feed seconds into a function expecting centimetres.',
          'The AP course states these as "the cost of producing $n$ items" fed into "the revenue from producing at that cost". Reading the sentence for what feeds what is the whole question.'
        ]
      }
    ],
    styles: [
      { n: 'Numeric composition', l: '$(f\\circ g)(3)$.', m: 'Inner value first, then feed it outward.' },
      { n: 'Symbolic composition', l: '$(f\\circ g)(x)$ simplified.', m: 'Substitute the whole formula with brackets, then expand.' },
      { n: 'Both orders', l: 'Compare $f\\circ g$ and $g\\circ f$.', m: 'Compute both; they differ unless the functions are inverses.' },
      { n: 'From a table or graph', l: '$f(g(2))$ read off two tables.', m: 'Inner table first, then look up that output in the outer table.' },
      { n: 'Domain of a composition', l: 'A root inside a rational, or similar.', m: 'Inner domain first, then exclude whatever the outer rejects.' },
      { n: 'Decompose', l: '"Find $f$ and $g$ with $h = f\\circ g$."', m: 'Inner is what sits inside; outer is the parent acting on it.' },
      { n: 'Self-composition', l: '$(f\\circ f)(x)$.', m: 'Substitute the function into itself.' },
      { n: 'Solve a composed equation', l: '$f(g(x)) = k$.', m: 'Compose first, then solve the resulting equation.' },
      { n: 'Three layers', l: '$f(g(h(x)))$.', m: 'One layer at a time, innermost first.' },
      { n: 'Context chain', l: 'Radius from time, area from radius.', m: 'Match output units to input units to fix the order.' }
    ],
    traps: [
      'Composing in the wrong order — $f\\circ g$ applies $g$ first.',
      'Dropping brackets when substituting an expression.',
      'Reading the domain off the simplified composition.',
      'Treating $(f\\circ g)(x)$ as $f(x)\\cdot g(x)$.',
      'Stopping after one layer in a three-layer composition.'
    ],
    videos: [
      { t: 'Composite functions', u: yt('composite functions f of g of x precalculus') },
      { t: 'Domain of a composite function', u: yt('domain of composite function precalculus') },
      { t: 'Decomposing functions for the chain rule', u: yt('decompose composite function inner outer chain rule') }
    ]
  });

  /* ==================================================================== pc.fn.inverse */
  L.lesson({
    id: 'pc.fn.inverse', track: 'pc', unit: 'F1',
    title: 'Inverse functions',
    why: 'Logarithms are the inverse of exponentials and arcsine is the inverse of sine. Neither makes sense until inverses do, and the domain-restriction idea here is the reason arcsine has the range it has.',
    prereq: ['pc.fn.comp'],
    recall: [
      { q: 'Solve $y = 3x - 7$ for $x$.', a: '$x = \\frac{y+7}{3}$. Undo in reverse order: the $-7$ first, then the $\\times 3$.' },
      { q: 'What does the horizontal line test tell you?', a: 'Whether a function is one-to-one. If some horizontal line meets the graph twice, two inputs share an output and no inverse function exists.' },
      { q: 'What is $f(f^{-1}(x))$?', a: '$x$, on the appropriate domain. Applying a function and then undoing it returns you to where you started.' }
    ],
    teach: [
      {
        h: 'What an inverse is',
        p: [
          '$f^{-1}$ is the function that undoes $f$: it takes an output of $f$ and returns the input that produced it. Formally, $f^{-1}(f(x)) = x$ and $f(f^{-1}(y)) = y$.',
          'For this to be a function, $f$ must be <b>one-to-one</b>: different inputs must give different outputs. Otherwise the undoing is ambiguous and there is no single answer to return.',
          'The domain and range swap: the domain of $f^{-1}$ is the range of $f$, and its range is the domain of $f$. That swap is the source of most inverse questions worth asking.'
        ],
        boxes: [{
          k: 'rule', t: 'Reflection in $y = x$',
          b: 'The graph of $f^{-1}$ is the graph of $f$ reflected across the line $y = x$. Every point $(a,b)$ on $f$ becomes $(b,a)$ on $f^{-1}$. If you ever forget a fact about inverses, this picture regenerates it.'
        }]
      },
      {
        h: 'Finding the inverse algebraically',
        p: [
          'The procedure is three steps: write $y = f(x)$; swap $x$ and $y$; solve for $y$. Then rename it $f^{-1}(x)$.',
          'Solving for $y$ is where the work is. Undo the operations in reverse order, exactly as you would unwrap a parcel: whatever was done last is undone first.',
          'Check your answer by composing: if $f(f^{-1}(x))$ simplifies to $x$, you are right. This check takes ten seconds and catches nearly every algebra slip.'
        ],
        ex: [{
          q: 'Find the inverse of $f(x) = \\dfrac{2x + 1}{x - 3}$ and give its domain.',
          s: [
            'Write $y = \\dfrac{2x+1}{x-3}$ and swap: $x = \\dfrac{2y+1}{y-3}$.',
            'Clear the denominator: $x(y - 3) = 2y + 1$, so $xy - 3x = 2y + 1$.',
            'Gather the $y$ terms on one side: $xy - 2y = 3x + 1$, so $y(x - 2) = 3x + 1$.',
            '$f^{-1}(x) = \\dfrac{3x+1}{x-2}$.',
            'Domain: $x \\ne 2$. And that is exactly the range of the original $f$, whose horizontal asymptote was $y = 2$.'
          ],
          n: 'Gathering the $y$ terms and factoring is the step that makes rational inverses work. The asymptote swap at the end is a free consistency check.'
        }]
      },
      {
        h: 'When there is no inverse, restrict the domain',
        p: [
          '$f(x) = x^2$ is not one-to-one on all reals, so it has no inverse there. Restrict it to $x \\ge 0$ and it becomes one-to-one, with inverse $\\sqrt{x}$. Restrict instead to $x \\le 0$ and the inverse is $-\\sqrt{x}$.',
          'The restriction is a choice, and the convention picks the branch containing the simplest behaviour. This is exactly why $\\arcsin$ has range $[-\\frac{\\pi}{2}, \\frac{\\pi}{2}]$ and $\\arccos$ has range $[0,\\pi]$: someone chose a one-to-one piece of an endlessly repeating function.',
          'When a question restricts the domain, the inverse formula must carry a matching sign choice. Answering $\\pm\\sqrt{x}$ is never right for a function.'
        ]
      },
      {
        h: 'Reading inverse values without a formula',
        p: [
          'From a table: $f^{-1}(7)$ asks "which input gave $7$?" — scan the output column and read the input beside it.',
          'From a graph: to find $f^{-1}(3)$, find height $3$ on the curve and read across to its $x$-coordinate.',
          'From an equation you cannot solve: $f^{-1}(5)$ means solving $f(x) = 5$. Doing that numerically is legitimate and is what a calculator does.'
        ]
      },
      {
        h: 'Facts that follow, and the classic confusions',
        p: [
          'If $f$ is increasing everywhere, it is one-to-one and therefore invertible, and $f^{-1}$ is increasing too. The same holds for decreasing.',
          'If $(a,b)$ is on $f$ then $(b,a)$ is on $f^{-1}$; the point $(a,a)$ on the line $y=x$ is fixed by inversion.',
          '$f^{-1}(x)$ is <b>not</b> $\\frac{1}{f(x)}$. The notation collides with reciprocal notation and always will; the context tells you which is meant, and in the phrase "inverse function" it is always the undoing one.',
          'A function composed with its inverse is the identity <i>only on the appropriate domain</i>: $\\sqrt{x^2} = |x|$, not $x$, because squaring destroyed the sign before the root could undo it.'
        ]
      }
    ],
    styles: [
      { n: 'Inverse of a linear function', l: '$f(x)=ax+b$.', m: 'Swap and solve; the inverse slope is $\\frac{1}{a}$.' },
      { n: 'Inverse of a rational function', l: '$\\frac{ax+b}{cx+d}$.', m: 'Cross-multiply, gather $y$ terms, factor.' },
      { n: 'Inverse with a radical or cube', l: '$\\sqrt[3]{x-2}+1$.', m: 'Undo in reverse order.' },
      { n: 'Inverse with a restricted domain', l: '$f(x)=x^2$, $x\\le 0$.', m: 'Pick the branch that matches, sign and all.' },
      { n: 'Is it invertible?', l: 'A graph or a formula.', m: 'Horizontal line test, or check strict monotonicity.' },
      { n: 'Verify two functions are inverses', l: '"Show $f(g(x))=x$."', m: 'Compose both ways; both must give $x$.' },
      { n: 'Inverse value from a table', l: '$f^{-1}(7)$.', m: 'Find $7$ in the output column, read the input.' },
      { n: 'Inverse value from a graph', l: '$f^{-1}(3)$.', m: 'Read across at height 3, then down.' },
      { n: 'Domain and range swap', l: '"What is the domain of $f^{-1}$?"', m: 'It is the range of $f$.' },
      { n: 'Point on the inverse', l: '"$(2,9)$ is on $f$."', m: 'Then $(9,2)$ is on $f^{-1}$.' },
      { n: 'Composition simplification trap', l: '$\\sqrt{x^2}$ or $(\\sqrt{x})^2$.', m: 'The first is $|x|$; the second is $x$ but only for $x\\ge0$.' }
    ],
    traps: [
      'Reading $f^{-1}(x)$ as $\\frac{1}{f(x)}$.',
      'Giving $\\pm$ in an inverse, which makes it not a function.',
      'Forgetting to swap domain and range.',
      'Claiming every function has an inverse.',
      'Writing $\\sqrt{x^2} = x$ without the absolute value.',
      'Solving for $y$ without first gathering all the $y$ terms on one side.'
    ],
    videos: [
      { t: 'Inverse functions, find and verify', u: yt('inverse functions find the inverse verify precalculus') },
      { t: 'One-to-one and the horizontal line test', u: yt('one to one function horizontal line test inverse exists') },
      { t: 'Restricting the domain to invert', u: yt('restrict domain to find inverse quadratic precalculus') }
    ]
  });

})(window.LEARN);
