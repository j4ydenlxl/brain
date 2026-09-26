/* lessons-sat4.js — SAT Math, Geometry and Trigonometry (S.A–S.D). */
(function (L) {
  'use strict';
  function yt(q) { return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q); }

  /* ================================================================== S.A ================== */
  L.lesson({
    id: 'sat.S.A', track: 'sat', unit: 'S', unitName: 'Geometry and Trigonometry',
    title: 'Area and volume',
    bank: { skill: 'S.A.' },
    why: 'Every formula you need is on the reference sheet; the difficulty is in choosing the right one, working backwards from a volume, and scaling. 63 live items.',
    prereq: ['sat.H.B'],
    recall: [
      { q: 'Area of a triangle, circle, trapezoid?', a: '$\\frac12 bh$; $\\pi r^2$; $\\frac{1}{2}(b_1+b_2)h$. All three sit on the reference sheet at the front of the module.' },
      { q: 'Volume of a cylinder, cone, sphere?', a: '$\\pi r^2 h$; $\\frac13 \\pi r^2 h$; $\\frac43 \\pi r^3$. The cone is a third of the cylinder with the same base and height.' },
      { q: 'If a cube\'s side triples, what happens to surface area and volume?', a: 'Surface area $\\times 9$, volume $\\times 27$. Lengths scale by $k$, areas by $k^2$, volumes by $k^3$.' }
    ],
    teach: [
      {
        h: 'Use the reference sheet, but know what each letter means',
        p: [
          'You are given every formula. What you are not given is which quantity in the problem is $r$, which is $h$, and whether the number quoted is a diameter or a radius.',
          'The single most common error in this skill is using the diameter where the formula wants the radius. Write $r = d/2$ on the page the moment a diameter is mentioned.',
          'Read the units on the answer. An area answer in cubic units, or a volume in square units, means you used the wrong formula.'
        ],
        boxes: [{
          k: 'trap', t: 'Diameter for radius',
          b: 'In $\\pi r^2$ a doubled radius quadruples the result, so using a diameter of $10$ instead of a radius of $5$ gives four times the correct area. The wrong value is always among the choices.'
        }]
      },
      {
        h: 'Working backwards from a volume',
        p: [
          'The harder items give the volume and ask for a dimension. Substitute into the formula and solve — this is usually one division and one square root or cube root.',
          'For a cylinder of volume $V$ with known height: $r = \\sqrt{\\dfrac{V}{\\pi h}}$. For a sphere: $r = \\sqrt[3]{\\dfrac{3V}{4\\pi}}$.',
          'Keep $\\pi$ symbolic until the end. Many answers are expressed in terms of $\\pi$, and rounding early costs you the exact match.'
        ],
        ex: [{
          q: 'A right circular cylinder has a volume of $144\\pi$ cubic inches and a height of $9$ inches. What is its radius, in inches?',
          s: [
            '$V = \\pi r^2 h$, so $144\\pi = \\pi r^2 (9)$.',
            'Divide both sides by $\\pi$: $144 = 9r^2$.',
            '$r^2 = 16$, so $r = 4$ inches (a length, so take the positive root).'
          ],
          n: 'Dividing by $\\pi$ first keeps the arithmetic clean and avoids decimals entirely.'
        }]
      },
      {
        h: 'Composite and comparison solids',
        p: [
          'Some items describe two solids with a shared dimension: "a cone and a cylinder have the same radius and height; the volume of the cone is what fraction of the cylinder\'s?" The answer follows from the formulas without any numbers — a third.',
          'Others give a solid whose dimensions are each multiplied by a factor and ask for the new volume. Scale each linear dimension inside the formula: doubling only the radius multiplies a cylinder\'s volume by $4$; doubling only the height multiplies it by $2$; doubling both by $8$.'
        ]
      },
      {
        h: 'Surface area and nets',
        p: [
          'Surface area is the sum of the faces. For a rectangular prism, $2(lw + lh + wh)$. For a cylinder with both ends, $2\\pi r^2 + 2\\pi r h$ — the curved part unrolls into a rectangle of width $2\\pi r$.',
          'Questions sometimes remove a face ("an open-top box") — subtract that face rather than reaching for the standard formula.'
        ]
      },
      {
        h: 'Density, mass and capacity questions',
        p: [
          'A recurring style gives a volume and a density ("the material weighs $2.4$ grams per cubic centimetre") and asks for a mass. Compute the volume, then multiply.',
          'Watch the unit conversion here specifically: a volume given in cubic metres with a density per cubic centimetre needs a factor of $10^6$, not $100$.'
        ]
      }
    ],
    styles: [
      { n: 'Direct volume', l: 'Dimensions given, volume requested.', m: 'Pick the formula, check radius versus diameter.' },
      { n: 'Reverse for a dimension', l: 'Volume given, a length requested.', m: 'Substitute and solve; divide out $\\pi$ early.' },
      { n: 'Ratio of two solids', l: 'Same radius and height, comparing cone to cylinder or similar.', m: 'Compare the formulas; the numbers cancel.' },
      { n: 'Scaling', l: 'Each dimension multiplied by a factor.', m: 'Areas by $k^2$, volumes by $k^3$.' },
      { n: 'Composite figure area', l: 'A rectangle with a semicircle, or a shaded region.', m: 'Add or subtract whole-shape areas.' },
      { n: 'Surface area', l: 'A prism or cylinder, sometimes with a missing face.', m: 'Sum the faces you actually have.' },
      { n: 'Volume to mass', l: 'A solid plus a density.', m: 'Volume times density, after matching units.' },
      { n: 'Increase in a dimension', l: '"If the height increases by $N$, the volume increases by how much?"', m: 'Compute both volumes, or factor the difference.' }
    ],
    traps: [
      'Substituting a diameter into a formula that asks for a radius.',
      'Rounding $\\pi$ when the choices are expressed in terms of $\\pi$.',
      'Scaling volume by the linear factor rather than its cube.',
      'Forgetting the $\\frac13$ on a cone or pyramid.',
      'Mixing cubic-unit conversions using the linear factor.'
    ],
    videos: [
      { t: 'Volume formulas and the reference sheet', u: yt('SAT math reference sheet volume formulas explained') },
      { t: 'Composite area and shaded regions', u: yt('area of composite figures shaded region geometry') },
      { t: 'Scaling area and volume', u: yt('similar solids area volume scale factor ratio') }
    ]
  });

  /* ================================================================== S.B ================== */
  L.lesson({
    id: 'sat.S.B', track: 'sat', unit: 'S',
    title: 'Lines, angles and triangles',
    bank: { skill: 'S.B.' },
    why: 'Parallel-line angles, triangle sums, similarity and congruence. 75 live items — the biggest geometry skill, and almost entirely rule-application.',
    prereq: ['sat.H.A'],
    recall: [
      { q: 'What do the interior angles of a triangle sum to? A quadrilateral?', a: '$180^\\circ$ and $360^\\circ$. Any $n$-gon sums to $(n-2)180^\\circ$.' },
      { q: 'Two parallel lines cut by a transversal: which angle pairs are equal?', a: 'Corresponding, alternate interior and alternate exterior angles are equal. Same-side (co-interior) angles are supplementary — they add to $180^\\circ$.' },
      { q: 'What does similarity give you that congruence does not?', a: 'Similar figures have equal angles and proportional sides (a scale factor). Congruent figures are similar with scale factor $1$.' }
    ],
    teach: [
      {
        h: 'Angle facts, in the order you use them',
        p: [
          'Angles on a straight line sum to $180^\\circ$. Angles around a point sum to $360^\\circ$. Vertical (opposite) angles are equal.',
          'With parallel lines, mark every angle you can from one known angle before doing any algebra — usually every angle in the figure is either $x$ or $180 - x$.',
          'The exterior angle of a triangle equals the sum of the two remote interior angles. This shortcut turns many two-step problems into one.'
        ],
        boxes: [{
          k: 'rule', t: 'Isosceles means two of everything',
          b: 'Equal sides face equal angles, and the converse holds too. If a triangle has two angles of $70^\\circ$, the sides opposite them are equal and the third angle is $40^\\circ$.'
        }]
      },
      {
        h: 'Similar triangles: set up the proportion carefully',
        p: [
          'Two triangles are similar if two pairs of angles match (AA). Parallel lines inside a triangle, and shared angles in nested triangles, create this constantly.',
          'Once similar, corresponding sides are proportional. The whole skill is pairing corresponding sides correctly — match them by the angles they sit opposite, not by position in the picture.',
          'Write the similarity statement in order, $\\triangle ABC \\sim \\triangle DEF$, and read the correspondence off it: $AB$ pairs with $DE$, $BC$ with $EF$.'
        ],
        ex: [{
          q: 'In $\\triangle ABC$, point $D$ lies on $AB$ and point $E$ on $AC$ with $DE$ parallel to $BC$. If $AD = 6$, $DB = 4$ and $DE = 9$, what is the length of $BC$?',
          s: [
            '$DE \\parallel BC$ gives equal corresponding angles, so $\\triangle ADE \\sim \\triangle ABC$.',
            'The scale factor uses the <i>whole</i> side $AB = AD + DB = 10$ against $AD = 6$: the factor from small to large is $\\frac{10}{6} = \\frac53$.',
            '$BC = 9 \\times \\frac53 = 15$.'
          ],
          n: 'The classic error is using $DB = 4$ against $AD = 6$. The similar triangle contains the full side $AB$, not the piece below $D$.'
        }]
      },
      {
        h: 'Congruence conditions',
        p: [
          'SSS, SAS, ASA and AAS prove congruence. SSA does not (the ambiguous case), and AAA gives only similarity.',
          'On the SAT this appears as "which additional piece of information is sufficient to prove the triangles congruent?" Check the condition name, not the picture.'
        ]
      },
      {
        h: 'Triangle inequality and side-angle ordering',
        p: [
          'Any two sides must sum to more than the third. Given two sides $a$ and $b$, the third lies strictly between $|a-b|$ and $a+b$.',
          'The longest side faces the largest angle. Ordering questions ("which side is longest?") are answered by ordering the angles first.'
        ]
      },
      {
        h: 'Reading a figure — and when not to',
        p: [
          'Figures are drawn to scale unless the problem says otherwise. That makes estimation a legitimate check, but never a proof: an answer that looks right must still follow from a stated rule.',
          'When a problem says "figure not drawn to scale", ignore appearances completely and work only from the given measurements.',
          'Many items give no figure at all. Draw one — a rough sketch with the given values labelled solves most of them by itself.'
        ]
      }
    ],
    styles: [
      { n: 'Parallel lines and a transversal', l: 'One angle given, another requested.', m: 'Equal or supplementary; mark the whole figure.' },
      { n: 'Triangle angle sum', l: 'Two angles given or expressions in $x$.', m: 'Set the sum to $180$ and solve.' },
      { n: 'Exterior angle', l: 'An angle outside the triangle.', m: 'Equals the sum of the two remote interior angles.' },
      { n: 'Similar triangles, find a side', l: 'Nested or parallel-cut triangles.', m: 'Pair corresponding sides; use the whole side, not a piece.' },
      { n: 'Scale factor and perimeter or area', l: 'Two similar figures.', m: 'Perimeter scales by $k$, area by $k^2$.' },
      { n: 'Congruence criterion', l: '"Which additional fact proves congruence?"', m: 'Test against SSS, SAS, ASA, AAS; reject SSA.' },
      { n: 'Isosceles or equilateral', l: 'Equal sides or equal angles marked.', m: 'Equal sides face equal angles.' },
      { n: 'Triangle inequality', l: '"Which could be the length of the third side?"', m: 'Between the difference and the sum.' },
      { n: 'Polygon angle sum', l: 'A pentagon or hexagon with an unknown angle.', m: '$(n-2)180$, then subtract the knowns.' }
    ],
    traps: [
      'Pairing a partial side with a full side in a similarity proportion.',
      'Assuming lines are parallel because they look it, with no marking.',
      'Accepting SSA as a congruence condition.',
      'Scaling area by $k$ instead of $k^2$.',
      'Trusting a figure explicitly labelled "not drawn to scale".'
    ],
    videos: [
      { t: 'Parallel lines and angle relationships', u: yt('parallel lines transversal angles corresponding alternate') },
      { t: 'Similar triangles and proportions', u: yt('similar triangles proportions find missing side') },
      { t: 'Triangle congruence criteria', u: yt('triangle congruence SSS SAS ASA AAS why SSA fails') }
    ]
  });

  /* ================================================================== S.C ================== */
  L.lesson({
    id: 'sat.S.C', track: 'sat', unit: 'S',
    title: 'Right triangles and trigonometry',
    bank: { skill: 'S.C.' },
    why: 'Pythagoras, the special triangles, SOH-CAH-TOA and the complementary-angle identity. 59 live items, and the identity item appears on almost every test.',
    prereq: ['sat.S.B'],
    recall: [
      { q: 'State the Pythagorean theorem and when it applies.', a: '$a^2 + b^2 = c^2$, where $c$ is the hypotenuse — only in a right triangle, and $c$ is always the longest side.' },
      { q: 'SOH-CAH-TOA?', a: '$\\sin = \\frac{\\text{opposite}}{\\text{hypotenuse}}$, $\\cos = \\frac{\\text{adjacent}}{\\text{hypotenuse}}$, $\\tan = \\frac{\\text{opposite}}{\\text{adjacent}}$.' },
      { q: 'What are the side ratios in a $30$-$60$-$90$ and a $45$-$45$-$90$ triangle?', a: '$1 : \\sqrt3 : 2$ (shortest opposite the $30^\\circ$) and $1 : 1 : \\sqrt2$. Both are on the reference sheet.' }
    ],
    teach: [
      {
        h: 'Pythagoras and the triples worth memorising',
        p: [
          'Recognising $3$-$4$-$5$, $5$-$12$-$13$, $8$-$15$-$17$ and $7$-$24$-$25$ — and their multiples like $6$-$8$-$10$ — saves time on perhaps a third of the items in this skill.',
          'Identify the hypotenuse before substituting. If the problem gives a leg and the hypotenuse, you subtract: $a^2 = c^2 - b^2$. Adding in that situation is the standard mistake.'
        ]
      },
      {
        h: 'The two special triangles',
        p: [
          '$45$-$45$-$90$: legs equal, hypotenuse is leg $\\times \\sqrt2$. $30$-$60$-$90$: short leg $x$, long leg $x\\sqrt3$, hypotenuse $2x$, with the short leg opposite the $30^\\circ$ angle.',
          'The trap is placing $\\sqrt3$ on the wrong side. Anchor yourself with the short leg opposite the small angle, then build outward.',
          'Equilateral triangles split into two $30$-$60$-$90$s, which is how altitude and area questions on equilateral triangles are solved.'
        ]
      },
      {
        h: 'Trig ratios in a right triangle',
        p: [
          'Label the triangle relative to the angle you care about: the side across from it is opposite, the leg touching it is adjacent, and the hypotenuse is always across from the right angle.',
          'Given a ratio, you can reconstruct the third side with Pythagoras and then read off any other ratio. "If $\\sin A = \\frac{3}{5}$, what is $\\tan A$?" — the legs are $3$ and $4$, so $\\tan A = \\frac34$.',
          'The SAT does not require a calculator in degree mode for most of these; it wants the exact ratio as a fraction.'
        ],
        ex: [{
          q: 'In a right triangle, $\\cos \\theta = \\frac{7}{25}$ and $\\theta$ is acute. What is $\\sin \\theta$?',
          s: [
            'Cosine is adjacent over hypotenuse, so adjacent $= 7$ and hypotenuse $= 25$.',
            'Pythagoras: opposite $= \\sqrt{25^2 - 7^2} = \\sqrt{625-49} = \\sqrt{576} = 24$.',
            '$\\sin\\theta = \\dfrac{\\text{opposite}}{\\text{hypotenuse}} = \\dfrac{24}{25}$.'
          ],
          n: '$7$-$24$-$25$ is a Pythagorean triple worth recognising; spotting it removes the square root entirely.'
        }]
      },
      {
        h: 'The complementary-angle identity',
        p: [
          'In a right triangle the two acute angles sum to $90^\\circ$, and each one\'s opposite side is the other\'s adjacent side. That forces $\\sin x = \\cos(90^\\circ - x)$ and $\\cos x = \\sin(90^\\circ - x)$.',
          'The SAT asks this as: "if $\\sin(a) = \\cos(b)$ and $a$ and $b$ are acute, what is $a + b$?" The answer is $90$. Or it gives $\\sin(3x) = \\cos(x + 10)$ and wants $x$ — set $3x + (x+10) = 90$ and solve.',
          'This one identity is worth knowing cold; it is nearly guaranteed to appear, and it takes ten seconds when you recognise it.'
        ],
        boxes: [{
          k: 'rule', t: 'Sine of one is cosine of the other',
          b: 'Whenever a question shows a sine equal to a cosine with acute arguments, the arguments sum to $90^\\circ$. Write that equation immediately.'
        }]
      },
      {
        h: 'Word problems: ladders, shadows, elevation',
        p: [
          'Draw the triangle. The ground is horizontal, the object is vertical, and the angle of elevation is measured from the horizontal up to the line of sight.',
          'Angle of elevation from A to B equals the angle of depression from B to A — they are alternate interior angles between two horizontals.',
          'Once drawn, decide which two sides are involved and pick the ratio that uses exactly those two.'
        ]
      }
    ],
    styles: [
      { n: 'Missing side', l: 'Two sides of a right triangle.', m: 'Pythagoras; check which is the hypotenuse.' },
      { n: 'Special triangle', l: 'A $45^\\circ$ or $30^\\circ$ marked, one side given.', m: 'Apply the ratio; the short leg faces the small angle.' },
      { n: 'Find another ratio', l: '"$\\sin A = \\frac{a}{b}$; what is $\\tan A$?"', m: 'Reconstruct the third side, then read the new ratio.' },
      { n: 'Complementary identity', l: '$\\sin(\\text{expr}) = \\cos(\\text{expr})$.', m: 'Arguments sum to $90$.' },
      { n: 'Similar right triangles', l: 'An altitude drawn to the hypotenuse.', m: 'All three triangles are similar; pair sides by angle.' },
      { n: 'Angle of elevation or depression', l: 'A word problem with a height and a distance.', m: 'Sketch, label, choose the ratio with the two sides involved.' },
      { n: 'Trig value from a scaled triangle', l: 'A triangle with sides $k$ times another.', m: 'Ratios are unchanged by scaling.' },
      { n: 'Distance on the plane', l: 'Two coordinate points.', m: 'The distance formula is Pythagoras on the legs $\\Delta x$ and $\\Delta y$.' }
    ],
    traps: [
      'Adding when the hypotenuse is already known and a leg is missing.',
      'Putting $\\sqrt3$ opposite the $30^\\circ$ angle.',
      'Mixing up opposite and adjacent when the triangle is drawn rotated.',
      'Forgetting that scaling a triangle leaves every trig ratio unchanged.',
      'Solving $\\sin x = \\cos y$ by setting $x = y$.'
    ],
    videos: [
      { t: 'Right triangle trigonometry basics', u: yt('right triangle trigonometry SOH CAH TOA explained') },
      { t: 'Special right triangles', u: yt('30 60 90 45 45 90 special right triangles') },
      { t: 'Complementary angles sine cosine', u: yt('sin x = cos 90 - x complementary angle identity SAT') }
    ]
  });

  /* ================================================================== S.D ================== */
  L.lesson({
    id: 'sat.S.D', track: 'sat', unit: 'S',
    title: 'Circles',
    bank: { skill: 'S.D.' },
    why: 'Equations of circles, arcs, sectors, central and inscribed angles, and radians. 60 live items and a reliable source of hard questions.',
    prereq: ['sat.P.A'],
    recall: [
      { q: 'Equation of a circle with centre $(h,k)$ and radius $r$?', a: '$(x-h)^2 + (y-k)^2 = r^2$. The signs inside flip: a centre of $(3,-2)$ gives $(x-3)^2+(y+2)^2$.' },
      { q: 'Circumference and area?', a: '$C = 2\\pi r$ and $A = \\pi r^2$.' },
      { q: 'How many radians in a full circle?', a: '$2\\pi$. So $\\pi$ radians $= 180^\\circ$, and converting means multiplying by $\\frac{\\pi}{180}$ or $\\frac{180}{\\pi}$.' }
    ],
    teach: [
      {
        h: 'The circle equation, forwards and backwards',
        p: [
          'From $(x-h)^2 + (y-k)^2 = r^2$ you read the centre $(h,k)$ and radius $r$ directly. Note that the right side is $r^2$, so a written $25$ means a radius of $5$.',
          'The hard version gives the expanded form, $x^2 + y^2 + 6x - 4y - 12 = 0$, and asks for the centre or radius. Complete the square on the $x$ terms and on the $y$ terms separately.',
          'Completing the square here: take half the coefficient, square it, add it to both sides. $x^2+6x$ becomes $(x+3)^2$ after adding $9$; $y^2-4y$ becomes $(y-2)^2$ after adding $4$.'
        ],
        ex: [{
          q: 'The equation $x^2 + y^2 + 6x - 4y = 12$ defines a circle. What is its radius?',
          s: [
            'Group: $(x^2 + 6x) + (y^2 - 4y) = 12$.',
            'Complete each square: half of $6$ is $3$, $3^2 = 9$; half of $-4$ is $-2$, $(-2)^2 = 4$. Add $9$ and $4$ to <i>both</i> sides.',
            '$(x+3)^2 + (y-2)^2 = 12 + 9 + 4 = 25$.',
            'So $r^2 = 25$ and the radius is $5$ (centre $(-3, 2)$).'
          ],
          n: 'Whatever you add to complete a square on the left must be added on the right. Forgetting that is the only real difficulty in this item type.'
        }]
      },
      {
        h: 'Arcs and sectors: everything is a fraction of the whole',
        p: [
          'A central angle of $\\theta$ degrees cuts off a fraction $\\frac{\\theta}{360}$ of the circle. Arc length is that fraction of the circumference; sector area is that fraction of the area.',
          'In radians the fractions become formulas: arc length $= r\\theta$ and sector area $= \\frac12 r^2\\theta$, with $\\theta$ in radians. These are faster once you trust them.',
          'Given an arc length and a radius, the central angle in radians is $\\theta = \\frac{s}{r}$ — a definition worth internalising, because a radian is literally the angle whose arc equals the radius.'
        ],
        boxes: [{
          k: 'nuance', t: 'Which fraction is being asked',
          b: 'Arc length is a distance (units), sector area is an area (square units), and the central angle is neither. Check the units of the answer choices to confirm which one the question wants.'
        }]
      },
      {
        h: 'Central versus inscribed angles',
        p: [
          'A central angle has its vertex at the centre and equals its intercepted arc. An inscribed angle has its vertex on the circle and is <b>half</b> its intercepted arc.',
          'So an inscribed angle and a central angle on the same arc are in a $1:2$ ratio. An angle inscribed in a semicircle is $90^\\circ$, because the arc is $180^\\circ$.',
          'A tangent line meets the radius at the point of tangency at exactly $90^\\circ$ — this turns most tangent problems into right-triangle problems.'
        ]
      },
      {
        h: 'Radians, properly understood',
        p: [
          'Radians measure angle by arc length in radii, so they are unit-free and make the formulas above clean. Degrees to radians: multiply by $\\frac{\\pi}{180}$. Radians to degrees: multiply by $\\frac{180}{\\pi}$.',
          'Common values worth recognising instantly: $\\frac{\\pi}{6}=30^\\circ$, $\\frac{\\pi}{4}=45^\\circ$, $\\frac{\\pi}{3}=60^\\circ$, $\\frac{\\pi}{2}=90^\\circ$, $\\pi = 180^\\circ$.'
        ]
      },
      {
        h: 'Circles meeting lines and other circles',
        p: [
          'A line through the centre is a diameter; the perpendicular from the centre to a chord bisects it, creating a right triangle with the radius as hypotenuse. That construction solves most chord-length questions.',
          'To test whether a point is inside, on, or outside a circle, compare its distance from the centre to $r$ — or substitute into the left side of the circle equation and compare with $r^2$.'
        ]
      }
    ],
    styles: [
      { n: 'Read centre and radius', l: 'A circle in standard form.', m: 'Flip the signs inside; take the square root of the right side.' },
      { n: 'Complete the square', l: 'Expanded form, asking for centre or radius.', m: 'Group $x$ and $y$ terms, complete both squares, balance the right side.' },
      { n: 'Write the equation', l: 'Centre and a point on the circle, or endpoints of a diameter.', m: 'Distance formula for $r$; midpoint for the centre.' },
      { n: 'Arc length', l: 'Central angle plus radius.', m: 'Fraction of circumference, or $r\\theta$ in radians.' },
      { n: 'Sector area', l: 'Central angle plus radius.', m: 'Fraction of area, or $\\frac12 r^2\\theta$.' },
      { n: 'Central angle from an arc', l: 'Arc length and radius given.', m: '$\\theta = s/r$ radians; convert if degrees are wanted.' },
      { n: 'Inscribed angle', l: 'A vertex on the circle intercepting an arc.', m: 'Half the arc; double it to get the central angle.' },
      { n: 'Degrees to radians', l: 'A plain conversion.', m: 'Multiply by $\\pi/180$.' },
      { n: 'Tangent and radius', l: 'A tangent line with a distance given.', m: 'Right angle at the point of tangency; use Pythagoras.' },
      { n: 'Chord length', l: 'A chord with the distance from the centre given.', m: 'Perpendicular from the centre bisects the chord.' }
    ],
    traps: [
      'Reporting $r^2$ as the radius.',
      'Getting the centre\'s signs backwards from the equation.',
      'Adding the completing-the-square constants to only one side.',
      'Using an inscribed angle as though it were central.',
      'Mixing degrees into $r\\theta$ or $\\frac12 r^2\\theta$ without converting.'
    ],
    videos: [
      { t: 'Equation of a circle and completing the square', u: yt('equation of a circle completing the square center radius') },
      { t: 'Arc length and sector area', u: yt('arc length sector area radians degrees') },
      { t: 'Inscribed and central angles', u: yt('inscribed angle theorem central angle circle') }
    ]
  });

})(window.LEARN);
