/* lessons-sat.js — the SAT Math track: declaration + the Algebra domain (H.A–H.E).
   Every "style" row below was clustered from the 1,925 live College Board math items read on
   2026-09-19: the styles are the real shapes the bank asks in. No item text is reproduced. */
(function (L) {
  'use strict';
  function yt(q) { return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q); }

  L.track({
    id: 'sat', name: 'SAT Math',
    head: 'SAT Math, taught skill by skill',
    blurb: 'The 19 skills the digital SAT actually tests, in the College Board\'s own taxonomy, weighted the way the live question bank is weighted. Each lesson teaches the idea, names every style the question comes in, then drills you up a five-tier ladder until it sticks.',
    how: 'Read the lesson, answer the recall questions from memory (not by looking), work the examples with a pencil, then drill. The drill climbs a tier after two right in a row and drops one after a miss, so it always sits just above what you can already do. Mastery takes four correct at the top tier with 80% accuracy over your last ten. Then the skill goes on a spacing schedule — 1, 3, 7, 16, 35, 70 days — and the Review button brings it back exactly when you are about to forget it.'
  });

  /* ================================================================== H.A ================== */
  L.lesson({
    id: 'sat.H.A', track: 'sat', unit: 'H', unitName: 'Algebra',
    title: 'Linear equations in one variable',
    bank: { skill: 'H.A.' },
    prereq: ['a2.lin.eq'],
    why: 'One unknown, one equation. It is the most common Algebra question in the bank (112 live items) and the skeleton inside dozens of word problems.',
    recall: [
      { q: 'What does it mean for a number to be a <i>solution</i> of an equation?', a: 'Substituting it makes the left side and the right side the same number. Solving is the search for every such number.' },
      { q: 'Undo each: $+7$, $\\times 4$, $\\div 3$, $-\\frac{1}{2}$.', a: '$-7$, $\\div 4$, $\\times 3$, $+\\frac{1}{2}$. Every operation has exactly one inverse, and you apply it to <i>both</i> sides.' },
      { q: 'Expand $-3(2x-5)$.', a: '$-6x+15$. The minus distributes over both terms — the second sign flips.' }
    ],
    teach: [
      {
        h: 'Solving is undoing, in reverse order',
        p: [
          'An equation is a claim that two expressions are the same number. You are allowed to do anything to that claim as long as you do it to both sides: add, subtract, multiply or divide by a nonzero number. Each move strips one layer off the variable.',
          'Build order is PEMDAS; strip order is the reverse. If the expression is "multiply by $a$, then add $b$", you undo by "subtract $b$, then divide by $a$". Students who divide first can still get there, but they create fractions they did not need.'
        ],
        ex: [{
          q: 'Solve $7x + 24 = 3x - 16$.',
          s: [
            'Get the variable on one side. Subtract $3x$ from both sides: $4x + 24 = -16$.',
            'Undo the constant: subtract $24$: $4x = -40$.',
            'Undo the coefficient: divide by $4$: $x = -10$.',
            'Check: $7(-10)+24 = -46$ and $3(-10)-16 = -46$. Equal, so $-10$ is the solution.'
          ],
          n: 'Move the <i>smaller</i> variable term to avoid a negative coefficient. It is one less sign to get wrong.'
        }]
      },
      {
        h: 'Fractions, decimals and parentheses',
        p: [
          'If the equation has fractions, multiply every term by the least common denominator first. One multiplication kills all of them, and you are back to integers.',
          'If it has decimals, multiplying by $10$, $100$ or $1000$ does the same job. If it has parentheses, distribute before you collect — unless the parentheses are already a factor you can divide out, which is faster.'
        ],
        ex: [{
          q: 'Solve $\\frac{x}{3} + \\frac{x-2}{4} = 5$.',
          s: [
            'The LCD of $3$ and $4$ is $12$. Multiply <i>every</i> term by $12$: $4x + 3(x-2) = 60$.',
            'Distribute: $4x + 3x - 6 = 60$.',
            'Collect: $7x = 66$, so $x = \\frac{66}{7}$.'
          ],
          n: 'Multiplying "every term" includes the $5$ on the right. Forgetting the lone constant is the single most common slip here.'
        }, {
          q: 'Solve $5(x+3) = 45$.',
          s: [
            'Divide both sides by $5$ first: $x + 3 = 9$.',
            'Subtract $3$: $x = 6$.'
          ],
          n: 'Dividing by the outside factor beat distributing here. Look for it before you expand.'
        }]
      },
      {
        h: 'The parameter twist: no solution, or infinitely many',
        p: [
          'The SAT loves an equation with a letter constant in it — $p$, $k$, $a$ — and then asks for the value of that constant that makes the equation have <b>no solution</b> or <b>infinitely many solutions</b>. This is not a harder version of solving; it is a different question, and it has a mechanical answer.',
          'Put the equation in the form $ax + b = cx + d$ and collect: $(a-c)x = d-b$.',
          'If $a \\ne c$ you can divide, so there is <b>exactly one</b> solution. If $a = c$ the $x$ term vanishes and you are left with $0 = d-b$: true for every $x$ when $b = d$ (<b>infinitely many</b>), false for every $x$ when $b \\ne d$ (<b>no solution</b>).'
        ],
        boxes: [{
          k: 'rule', t: 'The one line to memorise',
          b: 'Same slope, same constant &rarr; infinitely many. Same slope, different constant &rarr; none. Different slope &rarr; exactly one. "Slope" here just means the coefficient of $x$ after you expand.'
        }],
        ex: [{
          q: 'In $4x + 13 = 2(kx + 7) - 1$, $k$ is a constant. For what value of $k$ does the equation have no solution?',
          s: [
            'Expand the right side: $2kx + 14 - 1 = 2kx + 13$.',
            'The equation is $4x + 13 = 2kx + 13$. The constants already match, so matching the coefficients would give infinitely many.',
            'No solution needs the coefficients equal and the constants different — but here the constants are equal, so instead read it the other way: with $2k = 4$ the two sides are identical (infinitely many), and any other $k$ gives exactly one solution.',
            'So <i>no</i> value of $k$ produces "no solution" in this equation. When a question does ask for it, force the coefficients equal and check that the constants disagree: e.g. $4x+13 = 2kx + 9$ has no solution when $k=2$.'
          ],
          n: 'Always finish by checking the constants. "Set the coefficients equal" alone answers the infinitely-many question, not the no-solution question.'
        }]
      },
      {
        h: '"Which equation has the same solution?"',
        p: [
          'Four equations are shown and you must find the one whose solution matches. You do not need to solve all four. Solve the given one, then substitute your value into the choices — or spot the choice that is the given equation multiplied through by a constant, which always preserves the solution set.',
          'Multiplying both sides by a nonzero constant preserves solutions. Adding the same expression to both sides preserves solutions. Squaring does <i>not</i>, and multiplying by something containing the variable can invent solutions.'
        ]
      },
      {
        h: 'Turning words into one equation',
        p: [
          'Most word problems in this skill are one of three sentences: a one-time amount plus a repeated amount reaching a total ($mx + f = T$); a total split into parts ($x + (T-x) = T$); or a comparison ("$7$ less than three times a number").',
          'Name the unknown in writing before you build the equation. "Let $x$ be the number of months" costs four seconds and prevents answering the wrong question — the classic loss where you solve correctly for $x$ but the question asked for $2x+1$.'
        ],
        boxes: [{
          k: 'trap', t: 'Answer the question asked',
          b: 'Distractors are built from the honest mistakes: the value of $x$ when the question wanted $x+3$, the total when it wanted the rate, the answer before the last step. Circle what the final sentence asks for before you start.'
        }]
      }
    ],
    styles: [
      { n: 'Bare solve', l: 'An equation is displayed, then "What value of $p$ satisfies the given equation?"', m: 'Undo in reverse order. Roughly a quarter of this skill.' },
      { n: 'Value of an expression', l: '"If $3x-9=6$, what is the value of $x-3$?"', m: 'Solve, then evaluate — or notice the expression is a scaled version of the equation and skip solving.' },
      { n: 'Same-solution choice', l: '"Which equation has the same solution as the given equation?"', m: 'Solve the given one and test the choices, or find the choice that is a constant multiple.' },
      { n: 'Parameter, infinitely many', l: '"$k$ is a constant. If the equation has infinitely many solutions, what is the value of $k$?"', m: 'Expand both sides, set coefficients equal, confirm constants also match.' },
      { n: 'Parameter, no solution', l: 'Same setup, "The equation has no solution."', m: 'Set coefficients equal and confirm the constants disagree.' },
      { n: 'How many solutions', l: '"How many solutions does the given equation have?"', m: 'Collect to $(a-c)x = d-b$ and read off the three cases.' },
      { n: 'Between which pair', l: '"The value of $x$ is between which of the following pairs of values?"', m: 'Solve to a decimal and bracket it; do not estimate before solving.' },
      { n: 'Fee plus rate', l: 'A one-time fee and a per-month or per-item fee reaching a stated total.', m: 'Constant is the one-time fee; coefficient is the repeated fee.' },
      { n: 'Fractional or decimal coefficients', l: 'Fractions on both sides, or money in decimals.', m: 'Multiply through by the LCD (or a power of ten) first.' }
    ],
    traps: [
      'Distributing a negative over only the first term: $-3(x-4)$ is $-3x+12$, not $-3x-12$.',
      'Multiplying by the LCD but skipping the lone constant on the other side.',
      'Solving for $x$ when the question asked for $2x$, $x+1$, or the total.',
      'Dividing by the coefficient before moving the constant, which turns clean integers into fractions.',
      'On "no solution" questions, setting the coefficients equal and stopping — that is the infinitely-many condition until you also check the constants.'
    ],
    videos: [
      { t: 'Solving linear equations — full walkthrough', u: yt('organic chemistry tutor solving linear equations one variable') },
      { t: 'Equations with no solution / infinitely many', u: yt('equations with no solution infinitely many solutions explained') },
      { t: 'Khan Academy — linear equations word problems', u: yt('khan academy linear equations word problems SAT') }
    ]
  });

  /* ================================================================== H.B ================== */
  L.lesson({
    id: 'sat.H.B', track: 'sat', unit: 'H',
    title: 'Linear functions',
    bank: { skill: 'H.B.' },
    prereq: ['a2.fn.basics'],
    why: 'Function notation plus a constant rate of change. The largest Algebra skill in the bank (170 live items) and the language every modelling question is written in.',
    recall: [
      { q: 'What does $f(3)=7$ say, in words and as a point?', a: 'The input $3$ produces the output $7$; the point $(3,7)$ is on the graph of $f$.' },
      { q: 'In $f(x)=mx+b$, what does each letter do?', a: '$m$ is the rate of change — output per one unit of input. $b$ is the output when the input is $0$, the $y$-intercept.' },
      { q: 'Slope from two points?', a: '$m=\\dfrac{y_2-y_1}{x_2-x_1}$: change in output over change in input. Keep the order the same top and bottom.' }
    ],
    teach: [
      {
        h: 'Function notation is a machine, not a multiplication',
        p: [
          '$f(x)$ means "the output of $f$ at input $x$". It is never $f$ times $x$. Everything the SAT does with linear functions is reading that machine in one of two directions: given the input find the output ($f(4)=?$), or given the output find the input ($f(x)=20$, solve for $x$).',
          'Evaluating is substitution: replace every $x$ with the number, in parentheses. The parentheses matter when the input is negative or when it is squared later on.'
        ],
        ex: [{
          q: 'The function $f$ is defined by $f(x) = -4x + 19$. What is the value of $f(-3)$?',
          s: [
            'Substitute with parentheses: $f(-3) = -4(-3) + 19$.',
            '$-4 \\times -3 = 12$, so $f(-3) = 12 + 19 = 31$.'
          ],
          n: 'Writing $-4 \\cdot -3$ rather than $-4-3$ is the whole difference between $31$ and $16$. Parentheses are free.'
        }, {
          q: 'For the same $f$, for what value of $x$ does $f(x) = 3$?',
          s: [
            'Set the rule equal to the output: $-4x + 19 = 3$.',
            'Subtract $19$: $-4x = -16$. Divide by $-4$: $x = 4$.'
          ],
          n: 'Same function, opposite direction. Read the question for which direction it wants before you compute.'
        }]
      },
      {
        h: 'Building the function from what you are given',
        p: [
          'Three givens cover almost every question: slope and a point; two points; or a table. In every case you are assembling $f(x)=mx+b$.',
          'From slope $m$ and point $(x_1,y_1)$: use $y - y_1 = m(x - x_1)$ and rearrange, or substitute the point into $y=mx+b$ and solve for $b$.',
          'From two points: compute $m$ first, then use either point for $b$. From a table: the slope is any output gap divided by the matching input gap — but only if the input gaps are equal, so check.'
        ],
        ex: [{
          q: 'For the linear function $f$, $f(2)=9$ and $f(6)=1$. Which equation defines $f$?',
          s: [
            'Slope: $m = \\dfrac{1-9}{6-2} = \\dfrac{-8}{4} = -2$.',
            'Use a point: $9 = -2(2) + b \\Rightarrow 9 = -4 + b \\Rightarrow b = 13$.',
            'So $f(x) = -2x + 13$. Check the other point: $-2(6)+13 = 1$. ✓'
          ],
          n: 'Always verify with the point you did not use. It costs five seconds and catches a sign error.'
        }]
      },
      {
        h: 'Reading the rate in context',
        p: [
          'In modelling questions the slope carries units: dollars per month, degrees per kelvin, feet per second. The question usually asks for the best <i>interpretation</i> of $m$ or $b$, and the right answer is the one whose units match.',
          'A positive slope means the output increases as the input increases; negative means it decreases. The $y$-intercept is the value "at the start", when the input variable is zero — which is sometimes physically meaningless, and the SAT will say so.'
        ],
        boxes: [{
          k: 'nuance', t: 'Per what?',
          b: 'If $C(m) = 35m + 120$ gives cost in dollars after $m$ months, then $35$ is "dollars per month" and $120$ is "dollars charged before any month passes". An interpretation choice that swaps those two units is wrong no matter how sensible it sounds.'
        }]
      },
      {
        h: 'Tables, graphs and the "which equation defines $f$" family',
        p: [
          'A table of three input/output pairs is a linear function if the outputs change by a constant amount for equal input steps. Find that constant change, divide by the input step, and you have $m$; then back out $b$ with any row.',
          'From a graph, read two lattice points the line clearly passes through — not points you have to estimate. Count rise over run between them.',
          'When the four choices are all equations, plug the easiest given input into each choice rather than deriving from scratch. Two substitutions usually eliminate three choices.'
        ]
      },
      {
        h: 'Two linear functions at once',
        p: [
          'A harder style gives $f$ and $g$ and asks about $f(x)=g(x)$, or defines $g(x)=f(x+3)$ or $g(x)=f(x)-5$ and asks how the graph moves.',
          'Inside the parentheses shifts horizontally and against the sign: $f(x+3)$ moves the graph <b>left</b> $3$. Outside shifts vertically with the sign: $f(x)-5$ moves it <b>down</b> $5$. This single rule is worth memorising cold; it reappears in Advanced Math constantly.'
        ]
      }
    ],
    styles: [
      { n: 'Evaluate', l: '"The function $f$ is defined by $f(x)=\\dots$. What is the value of $f(k)$?"', m: 'Substitute with parentheses. The most common single style in this skill.' },
      { n: 'Solve for the input', l: '"For what value of $x$ does $f(x)=c$?"', m: 'Set the rule equal to $c$ and solve.' },
      { n: 'Slope and a point', l: '"The graph has slope $m$ and passes through $(a,b)$. Which equation defines $f$?"', m: 'Point-slope, then rearrange, or substitute to find $b$.' },
      { n: 'Two ordered pairs', l: '"$f(a)=p$ and $f(b)=q$. Which equation defines $f$?"', m: 'Slope from the pairs, then solve for the intercept.' },
      { n: 'Table of values', l: 'Three rows of $x$ and $f(x)$, sometimes with a letter in one cell.', m: 'Constant difference over constant input step; use a full row to finish.' },
      { n: 'Graph given', l: 'A described line through named lattice points.', m: 'Rise over run between two clean points.' },
      { n: 'Unknown constant inside', l: '"$f(x)=ax+7$ and $f(3)=1$. What is $a$?"', m: 'Substitute the known pair and solve for the letter.' },
      { n: 'Interpretation in context', l: 'A model with units, asking what a number represents.', m: 'Match units: slope is output-units per input-unit; intercept is output at input zero.' },
      { n: 'Shifted or scaled function', l: '"$g(x)=f(x)+4$" or "$g(x)=f(x-2)$".', m: 'Outside moves vertically with the sign, inside moves horizontally against it.' }
    ],
    traps: [
      'Reading $f(x)$ as multiplication.',
      'Mixing up the two directions: computing $f(5)$ when the question said $f(x)=5$.',
      'Computing slope as run over rise, or subtracting the coordinates in different orders top and bottom.',
      'Assuming a table is linear without checking that the input steps are equal.',
      'Choosing an interpretation whose units do not match the quantity asked about.'
    ],
    videos: [
      { t: 'Function notation and evaluating functions', u: yt('organic chemistry tutor function notation evaluating functions') },
      { t: 'Writing linear equations from two points', u: yt('write equation of a line from two points slope intercept') },
      { t: 'Interpreting slope and intercept in context', u: yt('interpreting slope and y intercept in context SAT') }
    ]
  });

  /* ================================================================== H.C ================== */
  L.lesson({
    id: 'sat.H.C', track: 'sat', unit: 'H',
    title: 'Linear equations in two variables',
    bank: { skill: 'H.C.' },
    prereq: ['a2.fn.basics'],
    why: 'Lines in the $xy$-plane: slope, intercepts, parallel and perpendicular, and the three forms a line can wear. 130 live items.',
    recall: [
      { q: 'Give the three forms of a line and what each one shows at a glance.', a: 'Slope-intercept $y=mx+b$ (slope and $y$-intercept). Point-slope $y-y_1=m(x-x_1)$ (slope and a point). Standard $Ax+By=C$ (both intercepts quickly: set the other variable to $0$).' },
      { q: 'Slope of a line parallel to one with slope $-\\frac{3}{5}$? Perpendicular?', a: 'Parallel: $-\\frac{3}{5}$, identical. Perpendicular: $\\frac{5}{3}$ — flip and negate.' },
      { q: 'From $4x + 3y = 12$, what is the slope?', a: 'Solve for $y$: $y = -\\frac{4}{3}x + 4$, so the slope is $-\\frac{4}{3}$. In general $Ax+By=C$ has slope $-\\frac{A}{B}$.' }
    ],
    teach: [
      {
        h: 'The same line, three costumes',
        p: [
          'A line is a set of points; the equation is just a costume it wears. Fluency here means changing costume without hesitating, because the question is usually phrased in one form and the answer choices are written in another.',
          'From standard form, the fastest route to the slope is $-\\frac{A}{B}$ — but derive it once by solving $Ax+By=C$ for $y$ so you never have to trust a half-remembered sign.',
          'The $x$-intercept is where $y=0$; the $y$-intercept is where $x=0$. In standard form both are one division away, which is why the SAT uses that form for intercept questions.'
        ],
        ex: [{
          q: 'The $y$-intercept of the graph of $6x + ky = 30$ in the $xy$-plane is $(0,5)$. What is the value of $k$?',
          s: [
            'The $y$-intercept has $x=0$, so substitute: $6(0) + k(5) = 30$.',
            '$5k = 30$, so $k = 6$.'
          ],
          n: 'Substituting the point beats rearranging into slope-intercept form. Use the point you are given.'
        }]
      },
      {
        h: 'Parallel and perpendicular, exactly',
        p: [
          'Parallel lines have equal slopes and different intercepts. If the intercepts are also equal it is the same line, not a parallel one — that distinction is the whole content of some system-of-equations questions.',
          'Perpendicular slopes multiply to $-1$: $m_2 = -\\frac{1}{m_1}$. Flip the fraction and change the sign. Two special cases: a horizontal line ($m=0$) is perpendicular to a vertical line (slope undefined), and neither obeys the product rule.',
          'The single most repeated question in this skill gives a line in standard form and asks for the slope of a perpendicular line — so it wants $-\\frac{A}{B}$ flipped and negated, which is $\\frac{B}{A}$.'
        ],
        boxes: [{
          k: 'rule', t: 'Shortcut worth owning',
          b: 'For $Ax + By = C$: slope $= -\\frac{A}{B}$, parallel slope $= -\\frac{A}{B}$, perpendicular slope $= \\frac{B}{A}$.'
        }],
        ex: [{
          q: 'Line $k$ is defined by $5y + 2x = 9$. Line $j$ is perpendicular to line $k$. What is the slope of line $j$?',
          s: [
            'Rewrite: $5y = -2x + 9$, so $y = -\\frac{2}{5}x + \\frac{9}{5}$ and line $k$ has slope $-\\frac{2}{5}$.',
            'Perpendicular: flip and negate. $m_j = \\frac{5}{2}$.'
          ],
          n: 'Check the sign by eye: one slope is negative, so the other must be positive.'
        }]
      },
      {
        h: 'Building a line from what is given',
        p: [
          'Two points: slope first, then any point for the intercept. One point and a parallel or perpendicular line: take the slope from that line, then use the point.',
          'A table of $x$ and $y$: same as a linear function — equal input steps, constant output change.',
          'A described graph: find two clean lattice points. When the SAT describes a graph in words it always names points the line passes through exactly.'
        ]
      },
      {
        h: 'Which table fits the equation',
        p: [
          'A whole family of items shows an equation and four tables, asking which table\'s pairs all satisfy it. Do not test all twelve pairs. Test one row of each table — usually the easiest $x$ — and eliminate. Then test a second row of whatever survives.',
          'Prefer rows with $x=0$ or $y=0$: they collapse one term entirely.'
        ]
      },
      {
        h: 'Horizontal, vertical, and the degenerate cases',
        p: [
          'A horizontal line is $y = c$: slope $0$, no $x$-intercept unless $c=0$. A vertical line is $x = c$: undefined slope, not a function.',
          'If a question asks for "the slope" and the line turns out vertical, the answer is "undefined", not zero. The SAT does test this once in a while, usually inside a parallel/perpendicular pair.'
        ]
      }
    ],
    styles: [
      { n: 'Perpendicular slope', l: '"Line $k$ is defined by $\\dots$. Line $j$ is perpendicular. What is the slope of $j$?"', m: '$-A/B$ then flip and negate, i.e. $B/A$. The single most frequent item in this skill.' },
      { n: 'Parallel slope', l: 'Same shape, "parallel" instead.', m: 'Copy the slope unchanged.' },
      { n: 'Slope of a given equation', l: '"What is the slope of the graph of $Ax+By=C$?"', m: 'Solve for $y$ or use $-A/B$.' },
      { n: 'Which table', l: 'An equation plus four candidate tables.', m: 'Test one easy row per table, then a second row on survivors.' },
      { n: 'Two points to an equation', l: '"Line $m$ passes through $(a,b)$ and $(c,d)$. Which equation defines it?"', m: 'Slope, then intercept, then match the choices\' form.' },
      { n: 'Point plus slope', l: '"Slope $m$, through $(a,b)$."', m: 'Point-slope, then rearrange if the choices are in standard form.' },
      { n: 'Intercept with a constant', l: '"The $y$-intercept of $Ax+ky=C$ is $(0,p)$. What is $k$?"', m: 'Substitute the intercept point directly.' },
      { n: 'Described graph', l: '"The line slants gradually down from left to right and passes through $\\dots$"', m: 'Two named lattice points, rise over run; the words "gradually" or "sharply" hint at magnitude, not value.' },
      { n: 'Parallel through a new point', l: 'Line parallel to a given line, passing through a stated point, asking for another point on it.', m: 'Slope from the given line, then travel from the stated point by the slope\'s rise and run.' }
    ],
    traps: [
      'Flipping the slope but forgetting the sign, or negating without flipping.',
      'Using $-A/B$ when the equation is in the form $By = -Ax + C$ already — rearrange first, or the sign flips twice.',
      'Treating "parallel" as "the same line"; parallel lines never intersect, so they have different intercepts.',
      'Reading a described graph too fast and using a point the line only passes near.',
      'Answering with the slope when the question wanted the equation, or vice versa.'
    ],
    videos: [
      { t: 'Slope-intercept, point-slope, standard form', u: yt('forms of linear equations slope intercept point slope standard') },
      { t: 'Parallel and perpendicular lines', u: yt('parallel and perpendicular lines slope problems') },
      { t: 'Graphing lines from equations', u: yt('khan academy graphing linear equations two variables') }
    ]
  });

  /* ================================================================== H.D ================== */
  L.lesson({
    id: 'sat.H.D', track: 'sat', unit: 'H',
    title: 'Systems of two linear equations',
    bank: { skill: 'H.D.' },
    prereq: ['a2.sys.lin'],
    why: 'Two lines at once: where they meet, when they never meet, and when they are secretly the same line. 126 live items, and the bank leans hard on the "no solution" version.',
    recall: [
      { q: 'What does a solution to a system mean graphically?', a: 'A point that lies on both lines — the intersection. A system of two linear equations has one solution, none, or infinitely many.' },
      { q: 'When is elimination faster than substitution?', a: 'When a variable already has matching or opposite coefficients, or when both equations are in standard form. Substitution wins when one equation is already solved for a variable.' },
      { q: 'Two lines have the same slope and different intercepts. How many solutions?', a: 'None. They are parallel and never meet.' }
    ],
    teach: [
      {
        h: 'Two methods, and when each one wins',
        p: [
          '<b>Substitution</b>: solve one equation for one variable, put that expression into the other. Best when a coefficient is $1$ or the equation is already $y = \\dots$.',
          '<b>Elimination</b>: scale one or both equations so a variable cancels when you add. Best when both are in standard form. The SAT writes most of its systems in standard form, so elimination is usually the faster tool.',
          'Whichever you use, you get one variable, then back-substitute for the other. Read the question: it often wants $x+y$, or $2x$, not the pair.'
        ],
        ex: [{
          q: 'The solution to the system $3x + 2y = 19$ and $x - 2y = 1$ is $(x,y)$. What is the value of $x$?',
          s: [
            'The $y$ terms are already opposites. Add the equations: $4x = 20$.',
            '$x = 5$.',
            '(If the question wanted $y$: substitute back, $5 - 2y = 1 \\Rightarrow y = 2$.)'
          ],
          n: 'Adding was one line of work because the coefficients were already $+2$ and $-2$. Scan for that before doing anything else.'
        }]
      },
      {
        h: 'The three outcomes, read off the coefficients',
        p: [
          'Write both equations as $a_1x + b_1y = c_1$ and $a_2x + b_2y = c_2$. Compare the ratios $\\frac{a_2}{a_1}$, $\\frac{b_2}{b_1}$, $\\frac{c_2}{c_1}$.',
          'All three equal: the equations are multiples of each other — the same line — <b>infinitely many</b> solutions.',
          'The first two equal but the third different: same slope, different intercept — parallel — <b>no solution</b>.',
          'The first two different: the lines cross — <b>exactly one</b> solution.'
        ],
        boxes: [{
          k: 'rule', t: 'The fast test',
          b: 'No solution: $\\frac{a_1}{a_2} = \\frac{b_1}{b_2} \\ne \\frac{c_1}{c_2}$. Infinitely many: all three ratios equal. One solution: the $x$ and $y$ ratios differ.'
        }],
        ex: [{
          q: 'In the system $2x + 5y = 8$ and $kx + 15y = 7$, $k$ is a constant. If the system has no solution, what is the value of $k$?',
          s: [
            'The $y$ coefficients scale by $15 \\div 5 = 3$.',
            'For parallel lines the $x$ coefficients must scale by the same $3$: $k = 3 \\times 2 = 6$.',
            'Check the constants disagree: $3 \\times 8 = 24 \\ne 7$, so the lines really are parallel and not identical. $k = 6$.'
          ],
          n: 'The constant check is what separates "no solution" from "infinitely many". Do it every time.'
        }]
      },
      {
        h: 'When the question gives you the intersection',
        p: [
          'A common style states that the graphs intersect at a named point and asks for a missing constant. Substitute the point into whichever equation contains the unknown and solve. No system-solving required.',
          'A cousin asks: "for each real number $r$, which point lies on both graphs?" — the answer is the single intersection point expressed with $r$, and testing one choice in both equations settles it.'
        ]
      },
      {
        h: 'Write the second equation',
        p: [
          'One equation is given and the system is said to have no solution (or infinitely many); you must pick the second equation. For no solution, look for the same left side scaled by some factor, with the constant <i>not</i> scaled by that factor. For infinitely many, everything scales by the same factor.',
          'Rearranged choices are the trap: a choice may be the given equation multiplied by $-2$ and then written with the terms swapped. Put every choice into the same standard form before comparing.'
        ]
      },
      {
        h: 'Word-problem systems',
        p: [
          'Two unknowns, two facts. Almost always one equation counts items ($x + y = n$) and the other totals a value ($px + qy = T$) — tickets, coins, mixtures, two prices.',
          'Label the unknowns with units in writing. Then read the last sentence again: it frequently asks for one of them, or their difference, not both.'
        ]
      }
    ],
    styles: [
      { n: 'Solve for one coordinate', l: '"The solution is $(x,y)$. What is the value of $x$?"', m: 'Eliminate the other variable. The most common item in this skill by a wide margin.' },
      { n: 'Solve for the pair', l: '"What is the solution $(x,y)$?"', m: 'Same work, both coordinates; check both equations.' },
      { n: 'Parameter for no solution', l: '"$k$ is a constant. If the system has no solution, what is $k$?"', m: 'Match the coefficient ratios, then confirm the constants do not match.' },
      { n: 'Parameter for infinitely many', l: 'Same setup with "infinitely many solutions".', m: 'All three ratios equal.' },
      { n: 'Choose the second equation', l: 'One equation given; pick the partner that forces no solution / infinitely many.', m: 'Compare in standard form; look for a clean scaling.' },
      { n: 'Intersection given', l: '"The graphs intersect at $(a,b)$. What is the value of $c$?"', m: 'Substitute the point into the equation containing the unknown.' },
      { n: 'Both graphs described', l: 'Two lines described in words with their points.', m: 'Read both slopes and intercepts, then answer whether they meet, and where.' },
      { n: 'Which system has no solution', l: 'Four systems; choose the one with no solution.', m: 'Compare slopes in each; the equal-slope pair with different constants wins.' },
      { n: 'Two-unknown word problem', l: 'Counts and totals, mixtures, two ticket prices.', m: 'One count equation, one value equation; check what the question asks for.' }
    ],
    traps: [
      'Finding $x$ and stopping when the question asked for $y$, $x+y$, or $3y$.',
      'Setting only the $x$-coefficients equal for a "no solution" question and ignoring the constants.',
      'Adding equations without first making a variable cancel.',
      'Comparing choices in different forms; always normalise to $Ax+By=C$ first.',
      'Sign slips when multiplying an entire equation by a negative — every term changes, including the constant.'
    ],
    videos: [
      { t: 'Systems by elimination and substitution', u: yt('solving systems of equations elimination substitution organic chemistry tutor') },
      { t: 'No solution and infinitely many solutions systems', u: yt('system of equations no solution infinitely many solutions constant k') },
      { t: 'SAT systems word problems', u: yt('SAT systems of equations word problems') }
    ]
  });

  /* ================================================================== H.E ================== */
  L.lesson({
    id: 'sat.H.E', track: 'sat', unit: 'H',
    title: 'Linear inequalities in one or two variables',
    bank: { skill: 'H.E.' },
    prereq: ['a2.lin.ineq'],
    why: 'Ranges instead of points: constraints, budgets, "at most" and "at least", and shaded half-planes. 78 live items.',
    recall: [
      { q: 'What happens to $<$ when you multiply or divide both sides by a negative?', a: 'It flips to $>$. Adding or subtracting never flips it; multiplying or dividing by a positive never flips it.' },
      { q: 'Translate: at most, at least, more than, fewer than, no more than.', a: '$\\le$, $\\ge$, $>$, $<$, $\\le$. "At most" and "no more than" are ceilings; "at least" and "no less than" are floors.' },
      { q: 'What does a dashed boundary line mean on a graph?', a: 'The boundary itself is not included — the inequality is strict ($<$ or $>$). A solid line means $\\le$ or $\\ge$.' }
    ],
    teach: [
      {
        h: 'Solving is the same, with one rule added',
        p: [
          'Every move you make on an equation is legal on an inequality, with a single exception: multiplying or dividing both sides by a negative number reverses the direction of the sign.',
          'That is the only new rule in one-variable inequalities. Everything else — distributing, collecting, clearing fractions — is identical to solving an equation.',
          'The answer is a range, so state it as one: $x \\le 7$, or $-3 < x \\le 5$ for a compound inequality. Questions often want a specific consequence of the range: "the greatest possible value of $x$", "the least integer $n$".'
        ],
        boxes: [{
          k: 'trap', t: 'The greatest value of an integer',
          b: 'If $x \\le 7.4$ and $x$ must be an integer, the greatest value is $7$, not $7.4$. If $x < 7$ and $x$ is an integer, the greatest is $6$. Read for the word "integer" and for strictness.'
        }],
        ex: [{
          q: 'A number $n$ is at most $12$ less than $5$ times the value of $x$. If $x = 4$, what is the greatest possible value of $n$?',
          s: [
            '"At most" is $\\le$. "$12$ less than $5$ times $x$" is $5x - 12$.',
            'So $n \\le 5x - 12$. With $x = 4$: $n \\le 20 - 12 = 8$.',
            'The greatest possible value is $8$.'
          ],
          n: '"$12$ less than $5x$" is $5x - 12$, never $12 - 5x$. The phrase names the subtrahend first and the minuend second.'
        }]
      },
      {
        h: 'Compound inequalities and ranges',
        p: [
          'When a quantity lives between two bounds — a speed that varied between $180$ and $220$ miles per hour — the model is $180 \\le s \\le 220$. Operate on all three parts at once.',
          'If the question builds a new quantity from a bounded one, apply the bounds to the new quantity: if $180 \\le s \\le 220$ and $d = 3s$, then $540 \\le d \\le 660$. If the multiplier is negative, both bounds swap ends.'
        ]
      },
      {
        h: 'Two variables: constraints and half-planes',
        p: [
          'An inequality in $x$ and $y$ describes a half-plane: the boundary line $Ax+By=C$ plus everything on one side of it. Solid boundary for $\\le$ or $\\ge$, dashed for $<$ or $>$.',
          'To decide which side, test a point that is not on the line — $(0,0)$ whenever the line misses the origin. If it satisfies the inequality, shade that side.',
          'A system of inequalities is the overlap of the half-planes. A point is a solution only when it satisfies <i>every</i> inequality, so testing choices means checking all of them, not the first one that works.'
        ],
        ex: [{
          q: 'A store has $\\$80$ to spend. Containers cost $\\$6$ each and rolls of tape cost $\\$4$ each. Which inequality represents buying $c$ containers and $t$ rolls of tape?',
          s: [
            'Cost of containers: $6c$. Cost of tape: $4t$.',
            'The total cannot exceed the money available: $6c + 4t \\le 80$.',
            'If the problem says "spends less than", it becomes $<$; if it says "at least", the inequality points the other way.'
          ],
          n: 'Budget problems are $\\le$. Requirement problems ("must raise at least $\\$500$") are $\\ge$. The verb decides the sign.'
        }]
      },
      {
        h: 'Which table satisfies the inequality',
        p: [
          'The most frequent item in this skill shows an inequality and four tables and asks which one contains only solutions. Test one pair from each table; a single failing pair kills the table.',
          'Use the pair with the smallest numbers first — usually a zero — because arithmetic errors cost more here than time does.'
        ]
      }
    ],
    styles: [
      { n: 'Which table of solutions', l: 'An inequality with four candidate tables of $(x,y)$ pairs.', m: 'One pair per table; any failure eliminates it. The most common item here.' },
      { n: 'Greatest or least possible value', l: '"At most / at least" phrasing with a substituted value.', m: 'Translate to an inequality, substitute, read the extreme end — and respect "integer".' },
      { n: 'Budget or capacity constraint', l: 'Money, weight or space limits with two item types.', m: 'Cost times count for each, summed, against the limit with the right sign.' },
      { n: 'Between two bounds', l: '"Varied between $a$ and $b$", "minimum $\\dots$ maximum $\\dots$".', m: 'Compound inequality; transform all three parts together.' },
      { n: 'Graphed half-plane', l: 'A described boundary, solid or dashed, with shading above or below.', m: 'Get the boundary equation, then test a point to pick the side.' },
      { n: 'Point in a system', l: '"The point $(a,b)$ is a solution to which of the following systems?"', m: 'Substitute into every inequality of a choice; all must hold.' },
      { n: 'Which inequality models the situation', l: 'A scenario with four inequality choices.', m: 'Build it yourself first, then match; do not read the choices first.' }
    ],
    traps: [
      'Forgetting to flip the sign after dividing by a negative.',
      'Translating "$12$ less than $5x$" as $12 - 5x$.',
      'Giving a non-integer answer when the context forces integers (people, tickets, months).',
      'Shading the wrong side because the test point was on the boundary line.',
      'Checking only one inequality of a system when the point must satisfy all of them.'
    ],
    videos: [
      { t: 'Solving linear inequalities', u: yt('organic chemistry tutor solving linear inequalities') },
      { t: 'Graphing systems of linear inequalities', u: yt('graphing systems of linear inequalities shading') },
      { t: 'SAT inequality word problems', u: yt('SAT linear inequality word problems at most at least') }
    ]
  });

})(window.LEARN);
