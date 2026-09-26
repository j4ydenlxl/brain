/* lessons-sat2.js — SAT Math, Advanced Math domain (P.A–P.C). */
(function (L) {
  'use strict';
  function yt(q) { return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q); }

  /* ================================================================== P.A ================== */
  L.lesson({
    id: 'sat.P.A', track: 'sat', unit: 'P', unitName: 'Advanced Math',
    title: 'Equivalent expressions',
    bank: { skill: 'P.A.' },
    prereq: ['a2.poly.ops', 'a2.rad', 'a2.rat.expr'],
    why: 'Rewriting without changing value: exponents, radicals, factoring, and combining fractions. 116 live items, and the machinery under half of Advanced Math.',
    recall: [
      { q: 'State the five exponent rules you use most.', a: '$x^a x^b = x^{a+b}$, $\\dfrac{x^a}{x^b} = x^{a-b}$, $(x^a)^b = x^{ab}$, $x^{-a} = \\dfrac{1}{x^a}$, $x^0 = 1$ (for $x \\ne 0$).' },
      { q: 'Write $\\sqrt[3]{x^5}$ with a rational exponent, and $x^{7/2}$ as a radical.', a: '$x^{5/3}$; $\\sqrt{x^7}$ — the denominator is the root, the numerator is the power.' },
      { q: 'Factor $x^2 - 49$ and $x^2 + 10x + 25$.', a: '$(x-7)(x+7)$, a difference of squares; $(x+5)^2$, a perfect square trinomial.' }
    ],
    teach: [
      {
        h: 'Exponents: add, subtract, multiply — never all three at once',
        p: [
          'Multiplying like bases <b>adds</b> exponents. Dividing <b>subtracts</b>. A power of a power <b>multiplies</b>. Those are three different operations and the whole skill is choosing the right one.',
          'A negative exponent is not a negative number: $x^{-3}$ is $\\frac{1}{x^3}$, which is positive when $x$ is positive. Moving a factor across the fraction bar flips the sign of its exponent, which is often the fastest simplification available.',
          'Coefficients and variables travel separately: $(3x^4)(5x^2) = 15x^6$ — multiply the $3$ and $5$, add the $4$ and $2$. $(2x^3)^4 = 2^4 x^{12} = 16x^{12}$ — the outside power hits the coefficient too, which is the most missed detail in this skill.'
        ],
        ex: [{
          q: 'Which expression is equivalent to $(q^3m^2z^{-2})(q^4m^6z^5)$, where $q$, $m$ and $z$ are positive?',
          s: [
            'Same base, multiplied: add exponents, one base at a time.',
            '$q$: $3+4 = 7$. $m$: $2+6 = 8$. $z$: $-2+5 = 3$.',
            'So the product is $q^7m^8z^3$.'
          ],
          n: 'Negative exponents still add. $-2 + 5 = 3$, not $7$ and not $-7$.'
        }, {
          q: 'Which expression is equivalent to $\\dfrac{12x^7y^3}{18x^2y^8}$?',
          s: [
            'Coefficients: $\\frac{12}{18} = \\frac{2}{3}$.',
            '$x$: $7-2 = 5$, so $x^5$ on top. $y$: $3-8 = -5$, so $y^5$ on the bottom.',
            'Result: $\\dfrac{2x^5}{3y^5}$.'
          ]
        }]
      },
      {
        h: 'Radicals are exponents in disguise',
        p: [
          '$\\sqrt[n]{x^m} = x^{m/n}$. Converting to a rational exponent turns every radical question into an exponent question, which you already know how to do. Convert, combine, convert back if the choices are radicals.',
          'Simplifying a square root means pulling out perfect squares: $\\sqrt{72} = \\sqrt{36 \\cdot 2} = 6\\sqrt{2}$. Look for the largest perfect square factor, not the first one you see.',
          'Rationalising a denominator multiplies by a form of $1$: $\\frac{3}{\\sqrt{5}} \\cdot \\frac{\\sqrt{5}}{\\sqrt{5}} = \\frac{3\\sqrt{5}}{5}$. With a binomial denominator, multiply by the conjugate: $\\frac{1}{2+\\sqrt{3}} \\cdot \\frac{2-\\sqrt{3}}{2-\\sqrt{3}} = 2-\\sqrt{3}$.'
        ],
        boxes: [{
          k: 'nuance', t: 'Why "where $x > 0$" appears',
          b: 'The SAT adds "where $x$ is positive" so that $\\sqrt{x^2}=x$ is safe. Without that condition $\\sqrt{x^2} = |x|$. When the condition is stated you may simplify freely; when it is absent, be suspicious of even roots.'
        }]
      },
      {
        h: 'Multiplying and factoring polynomials',
        p: [
          'Multiplying is distribution done completely: every term of the first by every term of the second. For two binomials that is four products; for a binomial times a trinomial, six.',
          'Factoring is the same process run backwards, and three patterns cover nearly everything the SAT asks: common factor first, difference of squares $a^2-b^2=(a-b)(a+b)$, and the trinomial $x^2+bx+c = (x+p)(x+q)$ where $pq=c$ and $p+q=b$.',
          'When the leading coefficient is not $1$, the product-sum numbers change: for $ax^2+bx+c$ you need two numbers multiplying to $ac$ and summing to $b$, then split the middle term and factor by grouping.'
        ],
        ex: [{
          q: 'The expression $6x^2 + 19x + 15$ is equivalent to $(ax+5)(2x+3)$, where $a$ is a constant. What is the value of $a$?',
          s: [
            'Expand the given form: $(ax+5)(2x+3) = 2ax^2 + 3ax + 10x + 15$.',
            'Match the $x^2$ coefficient: $2a = 6$, so $a = 3$.',
            'Check the middle coefficient with $a=3$: $3a + 10 = 9 + 10 = 19$. ✓ It matches, so $a = 3$ is right.'
          ],
          n: 'Match one coefficient to get the constant, then verify with a second. A value that fits the $x^2$ term but fails the middle term means you misread which factor holds which number.'
        }]
      },
      {
        h: 'Rational expressions',
        p: [
          'To simplify, factor everything first, then cancel identical factors — never individual terms. $\\frac{x^2-9}{x+3} = \\frac{(x-3)(x+3)}{x+3} = x-3$; you may not cancel the $x$ in $\\frac{x+3}{x}$.',
          'To add or subtract, use a common denominator, exactly as with numbers. To divide, multiply by the reciprocal.',
          'The SAT often asks for a rewritten form "$q + \\frac{r}{x+a}$" — that is polynomial long division, and the remainder sits over the divisor.'
        ]
      },
      {
        h: 'Find the constant',
        p: [
          'A large style: "the expression is equivalent to $\\dots$, where $a$ is a constant — what is $a$?" Two routes work. Expand and match coefficients, or substitute a convenient number for $x$ on both sides and solve.',
          'Substitution is faster when expansion is messy. Pick a value that does not make any denominator zero, such as $x = 1$ or $x = 2$, and remember that a single value can occasionally satisfy a wrong choice, so test a second value if two choices survive.'
        ]
      }
    ],
    styles: [
      { n: 'Which expression is equivalent', l: 'One expression, four rewritten candidates. The dominant style — a third of the skill.', m: 'Simplify the given expression completely, then match.' },
      { n: 'Product of powers', l: 'Two monomials multiplied, several bases, some negative exponents.', m: 'Add exponents base by base; multiply coefficients.' },
      { n: 'Quotient of powers', l: 'A fraction of monomials.', m: 'Subtract exponents; reduce the coefficient fraction.' },
      { n: 'Power of a product', l: '$(cx^n)^k$', m: 'The outside exponent hits the coefficient as well as the variable.' },
      { n: 'Radical to rational exponent', l: '$\\sqrt[n]{x^m}$ with choices in exponent form, or the reverse.', m: 'Denominator is the root, numerator is the power.' },
      { n: 'Expand and match constants', l: '"Equivalent to $(ax+b)(cx+d)$, what is $a$?"', m: 'Expand and match every coefficient, or substitute a value.' },
      { n: 'Factor identification', l: '"Which of the following is a factor of $\\dots$?"', m: 'Factor fully, or test a root: $x-k$ is a factor exactly when substituting $k$ gives $0$.' },
      { n: 'Combine rational expressions', l: 'Sum or difference of two fractions with polynomial denominators.', m: 'Factor, common denominator, combine, cancel.' },
      { n: 'Rewrite with a remainder', l: '"Can be rewritten as $q + \\frac{r}{x+a}$."', m: 'Long division; the remainder goes over the divisor.' },
      { n: 'Function composition of two rules', l: '"$f$ and $g$ are defined by \\dots. Which expression equals $f(g(x))$?"', m: 'Substitute the whole $g$ rule into every $x$ of $f$.' }
    ],
    traps: [
      'Applying an outside exponent to the variable but not the coefficient: $(2x^3)^2$ is $4x^6$, not $2x^6$.',
      'Adding exponents when dividing, or multiplying them when multiplying.',
      'Cancelling terms instead of factors in a fraction.',
      'Treating $x^{-2}$ as a negative quantity rather than a reciprocal.',
      'Matching two coefficients in a "find the constant" item and never checking the third.'
    ],
    videos: [
      { t: 'Exponent rules, all of them', u: yt('organic chemistry tutor exponent rules simplifying expressions') },
      { t: 'Rational exponents and radicals', u: yt('rational exponents and radicals converting simplifying') },
      { t: 'Factoring: every method', u: yt('factoring polynomials all methods gcf difference of squares trinomials') }
    ]
  });

  /* ================================================================== P.B ================== */
  L.lesson({
    id: 'sat.P.B', track: 'sat', unit: 'P',
    title: 'Nonlinear equations and nonlinear systems',
    bank: { skill: 'P.B.' },
    prereq: ['a2.quad.formula', 'a2.rad.eq'],
    why: 'Quadratics, radicals, rationals, and a line meeting a curve. 165 live items — the second-largest skill, and where the hard half of the section lives.',
    recall: [
      { q: 'Write the quadratic formula and say what the discriminant is.', a: '$x = \\dfrac{-b \\pm \\sqrt{b^2-4ac}}{2a}$. The discriminant is $b^2-4ac$: positive gives two real solutions, zero gives one, negative gives none.' },
      { q: 'What is the sum of the solutions of $ax^2+bx+c=0$? The product?', a: 'Sum $= -\\dfrac{b}{a}$, product $= \\dfrac{c}{a}$. These save a full solve when the question asks only for the sum.' },
      { q: 'Why can squaring both sides of an equation create a wrong answer?', a: 'Squaring is not reversible: $-3$ and $3$ both square to $9$. Any solution produced after squaring must be checked in the original equation.' }
    ],
    teach: [
      {
        h: 'Four ways to kill a quadratic, in order of speed',
        p: [
          '<b>1. Factor.</b> Fastest when the numbers are friendly. Set each factor to zero.',
          '<b>2. Square root both sides.</b> Only when there is no linear term: $(x-3)^2 = 16 \\Rightarrow x-3 = \\pm 4$. Never forget the $\\pm$ — it is worth a whole question.',
          '<b>3. Quadratic formula.</b> Always works. Use it the moment factoring does not appear within a few seconds.',
          '<b>4. Complete the square.</b> Slower for solving, but it is the method behind vertex form, so it earns its keep in the nonlinear-functions skill.'
        ],
        ex: [{
          q: 'What is the positive solution to $x^2 - 6x - 27 = 0$?',
          s: [
            'Look for two numbers multiplying to $-27$ and summing to $-6$: $-9$ and $3$.',
            '$(x-9)(x+3) = 0$, so $x = 9$ or $x = -3$.',
            'The positive solution is $9$.'
          ],
          n: 'The question asked for one of the two. Solving completely and then selecting is safer than trying to guess which root is wanted.'
        }]
      },
      {
        h: 'Questions about the solutions, not the solutions',
        p: [
          'The SAT frequently asks for the <b>sum</b> of the solutions, the <b>number of distinct real solutions</b>, or the <b>value of a constant</b> that makes the number of solutions come out a certain way. None of those require finding the roots.',
          'Sum: $-\\frac{b}{a}$. Product: $\\frac{c}{a}$. Number of real solutions: the sign of $b^2-4ac$.',
          '"Exactly one solution" means the discriminant is zero — a repeated root, or graphically a parabola touching the $x$-axis once. That is the single most common parameter question in the skill.'
        ],
        boxes: [{
          k: 'rule', t: 'Discriminant, three lines',
          b: '$b^2-4ac > 0$: two distinct real solutions. $= 0$: exactly one. $< 0$: no real solutions (two complex ones). Set it to zero and solve for the parameter when the question says "exactly one".'
        }],
        ex: [{
          q: 'In $2x^2 + 12x + k = 0$, $k$ is a constant. The equation has exactly one solution. What is the value of $k$?',
          s: [
            'Exactly one solution means $b^2 - 4ac = 0$.',
            'Here $a=2$, $b=12$, $c=k$: $144 - 8k = 0$.',
            '$k = 18$.'
          ],
          n: 'Check by completing the square: $2(x^2+6x) + 18 = 2(x+3)^2$, which is zero only at $x=-3$. One solution. ✓'
        }]
      },
      {
        h: 'Solving for a variable in terms of others',
        p: [
          'A whole family reads: "the given equation relates the positive numbers $a$, $b$ and $c$ — which equation gives $c$ in terms of $a$ and $b$?" This is literal-equation algebra with the same moves as any other solve.',
          'Work in reverse build order, treat the other letters as numbers, and when the target is inside a square root, isolate the radical and then square. When the target is in a denominator, multiply it up first.'
        ],
        ex: [{
          q: 'If $T = 2\\pi\\sqrt{\\dfrac{L}{g}}$, which equation gives $L$ in terms of $T$ and $g$?',
          s: [
            'Divide both sides by $2\\pi$: $\\dfrac{T}{2\\pi} = \\sqrt{\\dfrac{L}{g}}$.',
            'Square both sides: $\\dfrac{T^2}{4\\pi^2} = \\dfrac{L}{g}$.',
            'Multiply by $g$: $L = \\dfrac{gT^2}{4\\pi^2}$.'
          ],
          n: 'Squaring a fraction squares the numerator <i>and</i> the denominator, including the $2\\pi$.'
        }]
      },
      {
        h: 'Radical and rational equations, and the extraneous trap',
        p: [
          'Radical equation: isolate the radical, square, solve, then <b>check every candidate in the original equation</b>. Squaring can manufacture solutions that do not satisfy the original.',
          'Rational equation: multiply by the common denominator, solve, then discard any value that makes an original denominator zero.',
          'The SAT knows this and builds answer choices out of the discarded root. Checking is not optional here — it is part of the method.'
        ]
      },
      {
        h: 'Nonlinear systems: a line meets a curve',
        p: [
          'Substitute the linear equation into the nonlinear one. You get a single quadratic; solve it, then back-substitute for the other coordinate.',
          'Graphically, the number of solutions is the number of intersections: a line can miss a parabola, touch it once (tangent), or cross it twice.',
          'When the question asks for the value of a constant that makes the system have exactly one solution, substitute, collect into $ax^2+bx+c=0$, and set the discriminant to zero — the same tool as before.'
        ],
        ex: [{
          q: 'The solution to the system $y = x^2 - 4x + 7$ and $y = 2x - 2$ is $(x,y)$ with $x > 0$. What is $y$?',
          s: [
            'Set them equal: $x^2 - 4x + 7 = 2x - 2$.',
            'Collect: $x^2 - 6x + 9 = 0$, which factors as $(x-3)^2 = 0$, so $x = 3$ — the line is tangent.',
            'Back-substitute into the easier equation: $y = 2(3) - 2 = 4$.'
          ],
          n: 'Always back-substitute into the <i>linear</i> equation; the arithmetic is shorter and the risk of error lower.'
        }]
      }
    ],
    styles: [
      { n: 'Positive solution', l: '"What is the positive solution to the given equation?"', m: 'Solve fully, then select the positive root.' },
      { n: 'Sum of the solutions', l: '"What is the sum of the solutions?"', m: '$-b/a$ without solving.' },
      { n: 'Number of distinct real solutions', l: '"How many distinct real solutions does the equation have?"', m: 'Sign of $b^2-4ac$; watch for equations that must first be rearranged.' },
      { n: 'Solve for a variable', l: '"Which equation correctly expresses $c$ in terms of $a$ and $b$?"', m: 'Literal algebra; isolate, square or multiply up as needed.' },
      { n: 'Parameter for exactly one solution', l: '"$k$ is a constant; the equation has exactly one solution."', m: 'Discriminant $=0$, solve for $k$.' },
      { n: 'Solution in a stated form', l: '"One solution can be written as $\\frac{a+\\sqrt{b}}{c}$; what is $b$?"', m: 'Run the quadratic formula and read off the requested piece.' },
      { n: 'Radical equation', l: 'A square root containing the variable.', m: 'Isolate, square, solve, check for extraneous roots.' },
      { n: 'Rational equation', l: 'Variable in a denominator.', m: 'Clear denominators, solve, discard values that zero a denominator.' },
      { n: 'Nonlinear system, solve', l: 'A parabola (or other curve) and a line; find a coordinate.', m: 'Substitute, solve the quadratic, back-substitute.' },
      { n: 'Nonlinear system, ordered pair', l: '"Which ordered pair is a solution?"', m: 'Test choices in both equations — often faster than solving.' },
      { n: 'Quadratic in disguise', l: 'An equation in $x^4$, or with $\\sqrt{x}$, or $x^{1/2}$.', m: 'Substitute $u$ for the repeated piece, solve, then undo the substitution.' }
    ],
    traps: [
      'Dropping the $\\pm$ after taking a square root.',
      'Reporting both roots when the question asked for the positive one, or vice versa.',
      'Skipping the extraneous check after squaring or after clearing denominators.',
      'Using $b^2-4ac$ before rearranging the equation so one side is zero.',
      'Back-substituting into the quadratic instead of the line and making a needless error.'
    ],
    videos: [
      { t: 'Quadratic formula and the discriminant', u: yt('quadratic formula discriminant number of solutions organic chemistry tutor') },
      { t: 'Radical equations and extraneous solutions', u: yt('solving radical equations extraneous solutions') },
      { t: 'Systems with a line and a parabola', u: yt('nonlinear system of equations line and parabola substitution') }
    ]
  });

  /* ================================================================== P.C ================== */
  L.lesson({
    id: 'sat.P.C', track: 'sat', unit: 'P',
    title: 'Nonlinear functions',
    bank: { skill: 'P.C.' },
    prereq: ['a2.quad.forms', 'a2.exp.fn', 'a2.fn.transform'],
    why: 'Parabolas, exponentials and their graphs — the biggest skill in the whole bank at 259 live items, and the one that decides a high score.',
    recall: [
      { q: 'Name the three forms of a quadratic and what each one hands you for free.', a: 'Standard $ax^2+bx+c$: the $y$-intercept $c$. Factored $a(x-r)(x-s)$: the zeros $r$ and $s$. Vertex $a(x-h)^2+k$: the vertex $(h,k)$ and therefore the min or max.' },
      { q: 'Where is the vertex of $y=ax^2+bx+c$?', a: 'At $x = -\\dfrac{b}{2a}$; substitute back for the $y$-value. It is also the midpoint of the two zeros.' },
      { q: 'In $f(x)=ab^x$, what do $a$ and $b$ mean?', a: '$a$ is the value at $x=0$ (the starting amount); $b$ is the multiplier per unit of $x$. $b>1$ grows, $0<b<1$ decays.' }
    ],
    teach: [
      {
        h: 'The three quadratic forms are three different questions answered',
        p: [
          'A parabola never changes; only the costume does. Which form you want depends on what is being asked, and converting between them is the core skill.',
          '<b>Standard</b> $y = ax^2+bx+c$ gives the $y$-intercept instantly ($c$) and the axis of symmetry via $x = -\\frac{b}{2a}$.',
          '<b>Factored</b> $y = a(x-r)(x-s)$ gives the $x$-intercepts instantly. Expand to get standard.',
          '<b>Vertex</b> $y = a(x-h)^2+k$ gives the vertex and the minimum or maximum instantly. Complete the square to get here from standard.',
          'The sign of $a$ decides direction: positive opens up and has a minimum, negative opens down and has a maximum. The size of $|a|$ decides width.'
        ],
        boxes: [{
          k: 'rule', t: 'Which form displays what',
          b: 'A question that says "displays the $x$-intercepts as constants or coefficients" wants <b>factored</b> form. "Displays the minimum" wants <b>vertex</b> form. "Displays the $y$-intercept" wants <b>standard</b> form. That single sentence answers an entire family of items.'
        }],
        ex: [{
          q: 'The function $f$ is defined by $f(x) = x^2 - 10x + 21$. For what value of $x$ does $f$ reach its minimum?',
          s: [
            'The axis of symmetry is $x = -\\dfrac{b}{2a} = -\\dfrac{-10}{2} = 5$.',
            'Because $a = 1 > 0$ the parabola opens up, so $x=5$ is where the minimum occurs.',
            '(The minimum value itself is $f(5) = 25-50+21 = -4$ — note the difference between "where" and "what".)'
          ],
          n: 'Alternative: the zeros are $3$ and $7$, and the vertex sits at their midpoint, $5$. Two routes, same answer.'
        }, {
          q: 'Rewrite $y = x^2 - 6x + 2$ in vertex form.',
          s: [
            'Take half the $x$-coefficient and square it: half of $-6$ is $-3$, squared is $9$.',
            'Add and subtract it: $y = (x^2-6x+9) - 9 + 2$.',
            'Factor the perfect square: $y = (x-3)^2 - 7$. Vertex $(3,-7)$.'
          ],
          n: 'When $a \\ne 1$, factor $a$ out of the first two terms before halving — and remember what you added got multiplied by $a$.'
        }]
      },
      {
        h: 'Reading a described or drawn parabola',
        p: [
          'The SAT describes graphs in words for accessibility: "the parabola opens upward, the vertex is at $(2,-2)$, and it passes through $(0,2)$". Those three facts are enough to write the function.',
          'Put the vertex into vertex form, then use the extra point to find $a$: from vertex $(2,-2)$ and point $(0,2)$, $2 = a(0-2)^2 - 2 \\Rightarrow 4a = 4 \\Rightarrow a = 1$.',
          'If the description gives two $x$-intercepts and one other point, use factored form instead and solve for $a$ the same way.'
        ]
      },
      {
        h: 'Exponential functions: multiply, do not add',
        p: [
          'Linear change adds a fixed amount per step; exponential change multiplies by a fixed factor per step. Deciding which model fits is its own question type, and the test for exponential is a constant <i>ratio</i> between consecutive outputs.',
          'In $f(x) = ab^x$: $a$ is the value at $x=0$, $b$ is the per-step multiplier. Growth of $7\\%$ per year is $b = 1.07$; decay of $7\\%$ is $b = 0.93$.',
          'When the rate is per some other period, the exponent carries it: $f(t) = a(1.07)^{t/12}$ grows $7\\%$ per $12$ units of $t$. Reading that exponent correctly is a common hard item.',
          'Half-life and doubling time are the same structure: $f(t) = a\\left(\\frac{1}{2}\\right)^{t/h}$ halves every $h$ units; $f(t) = a \\cdot 2^{t/d}$ doubles every $d$ units.'
        ],
        boxes: [{
          k: 'nuance', t: 'Percent versus multiplier',
          b: 'The expression $0.85x$ represents a decrease of $15\\%$, not $85\\%$. The multiplier is what is left; subtract it from $1$ to get the percent change. This exact question appears in both Advanced Math and Percentages.'
        }],
        ex: [{
          q: 'A population of bacteria doubles every $30$ minutes. If there are $500$ bacteria at time zero, how long until there are $8{,}000$?',
          s: [
            'Model: $P(t) = 500 \\cdot 2^{t/30}$ with $t$ in minutes.',
            'Set $8000 = 500 \\cdot 2^{t/30}$, so $2^{t/30} = 16$.',
            '$16 = 2^4$, so $\\frac{t}{30} = 4$ and $t = 120$ minutes.'
          ],
          n: 'Matching powers of the same base beats logarithms whenever the numbers are clean — and on the SAT they usually are.'
        }]
      },
      {
        h: 'Transformations, applied to any function',
        p: [
          'Outside the function acts on the output and behaves as written: $f(x)+k$ moves up $k$, $-f(x)$ reflects over the $x$-axis, $2f(x)$ stretches vertically.',
          'Inside acts on the input and behaves backwards: $f(x-h)$ moves <b>right</b> $h$, $f(-x)$ reflects over the $y$-axis, $f(2x)$ compresses horizontally by a factor of $2$.',
          'The SAT asks this about graphs you never see: "the graph of $y=f(x-3)+2$" — track the vertex or a named point through both moves rather than trying to picture the whole curve.'
        ]
      },
      {
        h: 'Zeros, intercepts and what they mean in context',
        p: [
          'A zero of $f$ is an $x$-intercept of its graph and a solution of $f(x)=0$ — three names for one thing. Questions swap the names freely and expect you to follow.',
          'In a modelling context the zero is "when the quantity runs out" and the $y$-intercept is "the amount at the start". The question is usually testing whether you can read the model, not compute.',
          'For a product of factors, the zeros are where any factor is zero. For $f(x) = (x+4)(x-1)^2$, the zeros are $-4$ and $1$ — and the repeated factor means the graph touches rather than crosses at $x=1$.'
        ]
      }
    ],
    styles: [
      { n: 'Evaluate a nonlinear rule', l: '"$f(x) = \\dots$. What is $f(k)$?" — the most common single item here.', m: 'Substitute with parentheses; watch signs inside squares.' },
      { n: 'Solve $f(x)=c$', l: '"What is the value of $x$ when $f(x)=c$?"', m: 'Set the rule equal and solve — usually a quadratic.' },
      { n: 'Minimum or maximum location', l: '"For what value of $x$ does $f$ reach its minimum?"', m: '$x=-b/2a$, or the midpoint of the zeros.' },
      { n: 'Minimum or maximum value', l: '"What is the minimum value of the function?"', m: 'Find the vertex $x$, then substitute back. "Where" and "what" are different answers.' },
      { n: 'Which form displays what', l: '"Which equivalent form displays the $x$-intercepts as constants?"', m: 'Factored shows zeros, vertex shows the extremum, standard shows the $y$-intercept.' },
      { n: 'Described parabola', l: 'Opening direction, vertex, and a point, in words.', m: 'Vertex form, then solve for $a$ with the extra point.' },
      { n: 'Described curve, exponential', l: '"The curve rises sharply from quadrant 3 to quadrant 1 approaching a horizontal asymptote."', m: 'Identify the asymptote (the vertical shift) and the direction, then match.' },
      { n: 'Growth or decay model', l: 'Bacteria, value of an asset, medicine in the blood.', m: '$ab^x$; read $a$ at time zero, and $b$ from the percent or the doubling/halving period.' },
      { n: 'Time to reach a value', l: '"How long until the population reaches $N$?"', m: 'Match powers of a common base, or divide and recognise the power.' },
      { n: 'Transformation of a graph', l: '"$g(x)=f(x+2)-5$; which graph is $g$?"', m: 'Inside moves horizontally against the sign; outside moves vertically with it.' },
      { n: 'Constants from intercepts', l: '"$f(x)=a(x-h)^2+k$ with a $y$-intercept at $\\dots$ and the product of the zeros $\\dots$"', m: 'Translate each stated fact into an equation in the unknown constants, then solve the small system.' },
      { n: 'Table of a nonlinear function', l: 'Three rows, constant ratio rather than constant difference.', m: 'Ratio between consecutive outputs gives $b$; back out $a$ from any row.' }
    ],
    traps: [
      'Giving the $x$ of the vertex when the question asked for the minimum value, or the reverse.',
      'Reading $0.88$ as an $88\\%$ decrease instead of a $12\\%$ decrease.',
      'Moving a graph the wrong way for an inside shift: $f(x-3)$ goes right, not left.',
      'Forgetting that $a$ multiplies what you added when completing the square with $a \\ne 1$.',
      'Treating a repeated zero as two separate $x$-intercepts on a graph.',
      'Using a per-year growth factor when the exponent is written in months.'
    ],
    videos: [
      { t: 'Vertex form, completing the square', u: yt('completing the square vertex form parabola organic chemistry tutor') },
      { t: 'Exponential growth and decay functions', u: yt('exponential growth and decay functions word problems') },
      { t: 'Function transformations, every rule', u: yt('function transformations shifts reflections stretches precalculus') }
    ]
  });

})(window.LEARN);
