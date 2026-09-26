/* lessons-sat3.js — SAT Math, Problem-Solving and Data Analysis (Q.A–Q.G). */
(function (L) {
  'use strict';
  function yt(q) { return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q); }

  /* ================================================================== Q.A ================== */
  L.lesson({
    id: 'sat.Q.A', track: 'sat', unit: 'Q', unitName: 'Problem-Solving and Data Analysis',
    title: 'Ratios, rates, proportions and units',
    bank: { skill: 'Q.A.' },
    why: 'Everything that is "per" something: speed, density, price, scale, and converting one unit into another. 93 live items and almost no algebra.',
    recall: [
      { q: 'What makes a relationship <i>proportional</i> rather than just linear?', a: 'The ratio $\\frac{y}{x}$ is the same for every pair, so $y = kx$ with no constant term. Its graph passes through the origin.' },
      { q: 'How do you cancel units in a conversion?', a: 'Write each conversion as a fraction equal to $1$, arranged so the unit you want to lose sits opposite the unit you have. Multiply, and cross out matching units.' },
      { q: 'A map uses $1$ inch $= 8$ miles. A road is $3.5$ inches. How long is it?', a: '$3.5 \\times 8 = 28$ miles. The scale is a rate; multiply when going from drawing to reality, divide going back.' }
    ],
    teach: [
      {
        h: 'A rate is a fraction with units attached',
        p: [
          '"$60$ miles per hour" is the fraction $\\frac{60\\text{ mi}}{1\\text{ hr}}$. Every rate question is that fraction multiplied by something, and the units tell you whether to multiply or divide — you never have to guess.',
          'Set up so the unwanted unit cancels. To find hours from miles: $\\text{miles} \\times \\frac{1\\text{ hr}}{60\\text{ mi}}$; the miles cancel and hours survive. If your answer comes out in $\\text{mi}^2/\\text{hr}$ you flipped something.',
          'Rate questions that change the time unit — "posters per minute, asked in posters per hour" — are one multiplication by $60$, but in which direction? More minutes fit in an hour, so the per-hour number is larger. Sanity-check the size of the answer.'
        ],
        ex: [{
          q: 'An object travels at a constant speed of $45$ centimetres per second. How many seconds does it take to travel $9$ metres?',
          s: [
            'Put both in the same unit: $9$ metres $= 900$ centimetres.',
            'Time $= \\dfrac{\\text{distance}}{\\text{rate}} = \\dfrac{900\\text{ cm}}{45\\text{ cm/s}} = 20$ seconds.'
          ],
          n: 'The unit conversion came first. Mixing metres with centimetres is the single biggest source of error in this skill.'
        }]
      },
      {
        h: 'Proportions: set up, cross-multiply, check the pairing',
        p: [
          'A proportion equates two ratios: $\\frac{a}{b} = \\frac{c}{d}$. Cross-multiplying gives $ad = bc$. The only real skill is making sure corresponding quantities sit in corresponding positions.',
          'Write the units next to each number when you set it up: $\\frac{3\\text{ cups}}{8\\text{ servings}} = \\frac{x\\text{ cups}}{20\\text{ servings}}$. If the units line up across the equals sign, the proportion is right.',
          'Scale drawings, similar figures, recipes, maps and "at this rate" questions are all this one pattern.'
        ]
      },
      {
        h: 'Unit conversion in several steps',
        p: [
          'Chain the fractions. Furlongs to feet: $\\text{furlongs} \\times \\frac{220\\text{ yd}}{1\\text{ furlong}} \\times \\frac{3\\text{ ft}}{1\\text{ yd}}$. Every unit except feet cancels.',
          'When a conversion is given in the problem, use the given one — the SAT supplies any unusual factor and expects you to use it exactly as stated.',
          'Squared and cubed units convert by the squared or cubed factor: $1\\text{ ft} = 12\\text{ in}$, but $1\\text{ ft}^2 = 144\\text{ in}^2$ and $1\\text{ ft}^3 = 1728\\text{ in}^3$. This appears in area and volume questions and catches almost everyone once.'
        ],
        boxes: [{
          k: 'trap', t: 'Squared units',
          b: 'Doubling every side of a square multiplies its area by $4$, not $2$. In general, scaling lengths by $k$ scales areas by $k^2$ and volumes by $k^3$.'
        }]
      },
      {
        h: 'Density and "per square mile" style rates',
        p: [
          'Population density is population divided by area. Given any two of the three, you have the third — the question simply chooses which one to hide.',
          'Watch the direction: "the density is $150$ people per square mile and the population is $4{,}500$" asks for area, which is $4500 \\div 150 = 30$ square miles.'
        ]
      },
      {
        h: 'Equivalent ratios with an unknown',
        p: [
          'A ratio $a : b$ scaled by any nonzero factor is the same ratio. "The ratio $3$ to $8$ is equivalent to the ratio $x$ to $56$" means $x = 3 \\times 7 = 21$, because $8 \\times 7 = 56$.',
          'Three-part ratios work the same way: $2:3:5$ means the parts are $2k$, $3k$ and $5k$, and their total is $10k$. If you know the total, you know $k$, and then every part.'
        ]
      }
    ],
    styles: [
      { n: 'Unit conversion', l: '"How many yards are equivalent to $N$ inches?"', m: 'Chain conversion fractions so everything cancels but the target unit.' },
      { n: 'Time from a rate', l: 'Constant speed, asking for the time to cover a distance.', m: 'Distance over rate, after matching units.' },
      { n: 'Change the time unit', l: '"Produces $N$ per minute; at what rate per hour?"', m: 'Multiply by $60$; sanity-check that the per-hour figure is bigger.' },
      { n: 'Density', l: 'Population per area, given two of three quantities.', m: 'Density $\\times$ area $=$ population; rearrange as needed.' },
      { n: 'Equivalent ratio', l: '"$a$ to $b$ is equivalent to $x$ to $c$."', m: 'Find the scale factor between the known pair, apply it to the other.' },
      { n: 'Scale drawing', l: 'Inches on a drawing representing miles or feet, sometimes enlarged twice.', m: 'Set up a proportion with units written in; apply each scaling in turn.' },
      { n: 'Cost per unit', l: 'Spent a total at a price per pound; how many pounds?', m: 'Total divided by unit price.' },
      { n: 'Two given equations', l: '"If $a=3b$ and $b=4c$, what is $\\frac{a}{c}$?"', m: 'Substitute to connect the ends; the middle variable cancels.' },
      { n: 'Sampling scaled up', l: 'A sample proportion applied to a whole population.', m: 'Proportion times population size.' }
    ],
    traps: [
      'Mixing units mid-problem: centimetres with metres, minutes with hours.',
      'Inverting a rate — dividing when the units call for multiplying.',
      'Converting squared or cubed units with the linear factor.',
      'Using a memorised conversion when the problem supplies a different one.',
      'Answering with the intermediate quantity rather than the one requested.'
    ],
    videos: [
      { t: 'Unit conversions with dimensional analysis', u: yt('dimensional analysis unit conversion organic chemistry tutor') },
      { t: 'Ratios and proportions', u: yt('khan academy ratios rates proportional relationships') },
      { t: 'Scale drawings and similar figures', u: yt('scale factor scale drawings area volume ratio') }
    ]
  });

  /* ================================================================== Q.B ================== */
  L.lesson({
    id: 'sat.Q.B', track: 'sat', unit: 'Q',
    title: 'Percentages',
    bank: { skill: 'Q.B.' },
    why: 'Of, increase, decrease, successive changes, and "what percent of what". 84 live items, and the hard third of them are genuinely hard.',
    recall: [
      { q: 'Translate to algebra: "$18$ is what percent of $40$?"', a: '$18 = \\frac{p}{100}(40)$, so $p = 45$. "Is" is equals, "of" is times, "what percent" is $\\frac{p}{100}$.' },
      { q: 'What multiplier increases a quantity by $35\\%$? Decreases by $35\\%$?', a: '$1.35$ and $0.65$. Increase adds to $1$; decrease subtracts from $1$.' },
      { q: 'A price rises $20\\%$ then falls $20\\%$. Is it back where it started?', a: 'No — $1.2 \\times 0.8 = 0.96$, so it is $4\\%$ below the original. Percent changes multiply; they do not add.' }
    ],
    teach: [
      {
        h: 'Three words, three operations',
        p: 'Percent problems become algebra by direct translation: <b>is</b> means $=$, <b>of</b> means $\\times$, <b>what</b> means the variable, and <b>percent</b> means divide by $100$. "$x$ is $30\\%$ of $y$" is $x = 0.3y$, and nothing more is needed.',
        ex: [{
          q: 'The number $a$ is $25\\%$ greater than the number $b$. The number $b$ is $40\\%$ less than $120$. What is the value of $a$?',
          s: [
            'Work from the known end. $b$ is $40\\%$ less than $120$: $b = 0.6 \\times 120 = 72$.',
            '$a$ is $25\\%$ greater than $b$: $a = 1.25 \\times 72 = 90$.'
          ],
          n: 'Chained percent sentences are solved from the sentence that mentions an actual number, not from the first sentence.'
        }]
      },
      {
        h: 'Multipliers beat formulas',
        p: [
          'Every percent change is a multiplication. Up $8\\%$ is $\\times 1.08$; down $8\\%$ is $\\times 0.92$; up $150\\%$ is $\\times 2.5$ (the original plus one and a half times it).',
          'Successive changes multiply: up $10\\%$ then up $10\\%$ is $\\times 1.1 \\times 1.1 = \\times 1.21$, a $21\\%$ increase — not $20\\%$.',
          'To reverse a change, divide by the multiplier. If a price after a $30\\%$ discount is $\\$70$, the original was $70 \\div 0.7 = \\$100$. Subtracting $30\\%$ of $70$ is the classic wrong move.'
        ],
        boxes: [{
          k: 'trap', t: 'Percent of what',
          b: 'A percent is always a percent <i>of</i> some base, and the base changes between sentences. "$20\\%$ more than $b$" uses $b$ as the base; "$20\\%$ of the total" uses the total. Write down which number is the base before computing.'
        }]
      },
      {
        h: 'Reading a multiplier backwards',
        p: [
          'The expression $0.72x$ represents decreasing $x$ by $28\\%$, because $1 - 0.72 = 0.28$. The expression $1.4x$ is a $40\\%$ increase.',
          'This exact item — "the expression $0.65x$ represents a decrease of what percent?" — recurs, and the wrong answer $65$ is always offered.'
        ]
      },
      {
        h: 'Percent change versus percentage points',
        p: [
          'Going from $40\\%$ to $50\\%$ is a rise of $10$ percentage <i>points</i>, but a $25\\%$ increase in the rate (because $10/40 = 0.25$). The SAT distinguishes these and builds distractors from the confusion.',
          'Percent change is always $\\dfrac{\\text{new} - \\text{old}}{\\text{old}} \\times 100$. The denominator is the <i>original</i> value — that is what makes an increase and the matching decrease different percentages.'
        ]
      },
      {
        h: 'Percent inside tables and data',
        p: [
          'A two-way table question may ask what percent of a row, a column, or the grand total a cell represents. Identify the denominator from the wording: "of the students who chose X" means the X column or row total, not the overall total.',
          'When a table gives percentages and one count, the count fixes the scale for the whole table: if $12\\%$ corresponds to $36$ items, $1\\%$ is $3$ items and the total is $300$.'
        ]
      }
    ],
    styles: [
      { n: 'Straight computation', l: '"What is $N\\%$ of $M$?"', m: 'Multiply by the decimal.' },
      { n: 'Reverse percent', l: '"$N$ is $P\\%$ of what number?"', m: 'Divide by the decimal.' },
      { n: 'Chained sentences', l: '"$a$ is $p\\%$ greater than $b$; $b$ is $q\\%$ less than $c$."', m: 'Start from the sentence containing a number; apply multipliers in order.' },
      { n: 'How many times', l: '"The number $a$ is how many times $b$?"', m: 'Divide $a$ by $b$ after expressing both in terms of one variable.' },
      { n: 'Multiplier interpretation', l: '"$0.85x$ represents a decrease of what percent?"', m: 'Subtract the multiplier from $1$.' },
      { n: 'Increase then decrease', l: 'Two successive changes, asking for the net effect.', m: 'Multiply the multipliers; never add the percents.' },
      { n: 'Percent from a count', l: '"Of $N$ items, $k$ are large. What percent are large?"', m: '$k/N$ as a percent.' },
      { n: 'Percent within a table', l: 'Two-way table, asking for a percent of a row, column, or total.', m: 'Read the wording for the denominator.' },
      { n: 'Percent with a remaining amount', l: 'Gave away $p\\%$; how many are left?', m: 'Multiply by $1-p$, or compute the part given and subtract.' }
    ],
    traps: [
      'Adding successive percent changes instead of multiplying the multipliers.',
      'Reversing a discount by adding the same percent back.',
      'Reading $0.85x$ as an $85\\%$ decrease.',
      'Confusing percentage points with percent change.',
      'Using the wrong base — the new value instead of the original.'
    ],
    videos: [
      { t: 'Percent word problems, all types', u: yt('organic chemistry tutor percent word problems') },
      { t: 'Percent increase and decrease', u: yt('percent increase decrease successive percent change') },
      { t: 'SAT percent traps', u: yt('SAT math percent problems tricks') }
    ]
  });

  /* ================================================================== Q.C ================== */
  L.lesson({
    id: 'sat.Q.C', track: 'sat', unit: 'Q',
    title: 'One-variable data: centre and spread',
    bank: { skill: 'Q.C.' },
    why: 'Mean, median, range, standard deviation and the shapes that carry them — dot plots, histograms, box plots and frequency tables. 84 live items.',
    recall: [
      { q: 'Define mean, median and mode in one line each.', a: 'Mean: sum divided by count. Median: the middle value once ordered (average the two middles for an even count). Mode: the most frequent value.' },
      { q: 'Which is pulled by an outlier, mean or median?', a: 'The mean. The median only cares about position, so it is resistant to extreme values.' },
      { q: 'What does a larger standard deviation say about a data set?', a: 'The values sit further from the mean on average — more spread. It says nothing about the centre.' }
    ],
    teach: [
      {
        h: 'Centre: mean and median, and when they part ways',
        p: [
          'The mean uses every value, so a single very large value drags it upward. The median uses only the middle position, so it barely moves.',
          'In a right-skewed distribution (a long tail of large values) the mean sits above the median. Left-skewed is the mirror. Symmetric distributions have them essentially equal. This one sentence answers a whole family of items about "which is greater".',
          'From a frequency table, the mean is $\\dfrac{\\sum(\\text{value} \\times \\text{frequency})}{\\sum \\text{frequency}}$ — you must weight by frequency, not average the distinct values.'
        ],
        ex: [{
          q: 'A frequency table shows the value $18$ appearing $6$ times, $19$ five times, $20$ four times and $30$ once. What is the median?',
          s: [
            'Total count: $6+5+4+1 = 16$, so the median is the average of the $8$th and $9$th values in order.',
            'Positions $1$–$6$ are $18$; positions $7$–$11$ are $19$.',
            'Both the $8$th and $9$th are $19$, so the median is $19$.'
          ],
          n: 'Counting positions through the cumulative frequencies is the whole method. The value $30$ never matters for the median.'
        }]
      },
      {
        h: 'Spread: range, IQR and standard deviation',
        p: [
          'Range is maximum minus minimum — one subtraction, ruined by one outlier.',
          'The interquartile range is the middle $50\\%$: $Q_3 - Q_1$. A box plot draws it as the box, with the median as the line inside and the whiskers reaching the extremes.',
          'Standard deviation measures typical distance from the mean. You will never compute one on the SAT; you will compare two data sets and say which has the larger one. The set whose values cluster tightly around its mean has the smaller standard deviation — regardless of where that mean is.'
        ],
        boxes: [{
          k: 'nuance', t: 'Same spread, different centre',
          b: 'Adding $10$ to every value shifts the mean and median by $10$ and leaves range, IQR and standard deviation unchanged. Multiplying every value by $3$ multiplies the centre <i>and</i> the spread by $3$.'
        }]
      },
      {
        h: 'Reading the four displays',
        p: [
          '<b>Dot plot</b>: each dot is one data point. Count dots to get frequencies; the median is the middle dot by position.',
          '<b>Histogram</b>: bars over intervals. You cannot recover individual values — only the interval a value falls in — so questions ask for the maximum possible or minimum possible value of a statistic.',
          '<b>Box plot</b>: five numbers only (min, $Q_1$, median, $Q_3$, max). It tells you nothing about how many points there are, so "which set has more values" is unanswerable from box plots alone.',
          '<b>Frequency table</b>: value and count. Weight by frequency for the mean; count cumulatively for the median.'
        ]
      },
      {
        h: 'Questions that change the data',
        p: [
          'A common item removes or adds a value and asks what happens to the mean or median. Compute the new sum and count rather than guessing.',
          'Another gives the mean and asks for a missing value: multiply the mean by the count to recover the total, subtract the known values, and what remains is the missing one.'
        ],
        ex: [{
          q: 'The mean of five numbers is $14$. Four of them are $9$, $11$, $16$ and $20$. What is the fifth?',
          s: [
            'Total $= 14 \\times 5 = 70$.',
            'Sum of the four known: $9+11+16+20 = 56$.',
            'Fifth value $= 70 - 56 = 14$.'
          ]
        }]
      },
      {
        h: 'Comparing two data sets',
        p: [
          'Standard SAT phrasing: "which statement about the means and standard deviations is true?" Answer it in two independent parts — first decide about the centres, then about the spreads. Treating them as one judgement is how people pick the wrong choice.',
          'Two sets can share a mean with wildly different spreads, or share a spread with different means.'
        ]
      }
    ],
    styles: [
      { n: 'Median of a listed set', l: 'Nine or so numbers listed, asking for the median.', m: 'Order them first — the list is rarely sorted.' },
      { n: 'Mean from a frequency table', l: 'Values with counts.', m: 'Weight each value by its frequency, divide by the total count.' },
      { n: 'Median from a frequency table', l: 'Same table, median requested.', m: 'Cumulative counts to find the middle position.' },
      { n: 'Missing value from a mean', l: '"The mean is $m$; four values are given."', m: 'Total from the mean, subtract the knowns.' },
      { n: 'Effect of adding or removing a value', l: '"If the largest value is removed, the mean\\dots"', m: 'Recompute the sum and count; compare.' },
      { n: 'Compare two sets', l: 'Two dot plots or box plots side by side.', m: 'Judge centre and spread separately.' },
      { n: 'Maximum or minimum possible', l: 'A histogram with interval bars.', m: 'Use the extreme end of each interval consistently.' },
      { n: 'Which frequency table matches', l: 'A listed data set with four candidate tables.', m: 'Tally the list once and compare counts.' },
      { n: 'Outlier effect', l: 'Adding a far-out value and asking which statistic changes most.', m: 'Mean and range move, median and IQR barely do.' }
    ],
    traps: [
      'Finding the median without sorting.',
      'Averaging the distinct values in a frequency table instead of weighting by count.',
      'Assuming a box plot tells you the number of data points.',
      'Believing a larger mean implies a larger standard deviation.',
      'Forgetting to average the two middle values when the count is even.'
    ],
    videos: [
      { t: 'Mean, median, mode and range', u: yt('mean median mode range statistics explained') },
      { t: 'Standard deviation, conceptually', u: yt('standard deviation comparing data sets conceptual SAT') },
      { t: 'Box plots, histograms and dot plots', u: yt('box plot histogram dot plot reading data displays') }
    ]
  });

  /* ================================================================== Q.D ================== */
  L.lesson({
    id: 'sat.Q.D', track: 'sat', unit: 'Q',
    title: 'Two-variable data: models and scatterplots',
    bank: { skill: 'Q.D.' },
    why: 'Points on a plane with a curve drawn through them: lines of best fit, predictions, residuals and choosing linear versus exponential. 71 live items.',
    recall: [
      { q: 'What does a line of best fit do?', a: 'It summarises the trend in a scatterplot so you can predict a $y$ for a given $x$ and read a rate of change from its slope.' },
      { q: 'What is a residual?', a: 'Actual value minus predicted value. Positive means the point sits above the line; negative means below.' },
      { q: 'Linear or exponential — how do you tell from a table?', a: 'Constant difference between consecutive outputs means linear. Constant ratio means exponential.' }
    ],
    teach: [
      {
        h: 'Reading a line of best fit',
        p: [
          'Two questions cover most items: "predict $y$ when $x = k$" and "what does the slope mean". Predicting means reading the <i>line</i>, not the nearest data point — a distinction the answer choices always exploit.',
          'The slope is the predicted change in $y$ for a one-unit increase in $x$, with units attached. The intercept is the predicted $y$ when $x=0$, which is often outside the data and therefore meaningless in context.',
          'When the question gives the equation of the line, just substitute. When it gives only the picture, read two clean points off the line and compute rise over run.'
        ],
        ex: [{
          q: 'A line of best fit is $y = 3.2x + 11$, where $x$ is years since 2010 and $y$ is thousands of subscribers. What does $3.2$ represent?',
          s: [
            'The slope is the change in $y$ per one-unit change in $x$.',
            'One unit of $x$ is one year; one unit of $y$ is one thousand subscribers.',
            'So the model predicts an increase of about $3{,}200$ subscribers per year.'
          ],
          n: 'Attach the units before you read the choices. An answer of "$3.2$ subscribers" fails on units alone.'
        }]
      },
      {
        h: 'Residuals: how far off the model is',
        p: [
          'Residual $=$ actual $-$ predicted. A question giving a data point and the model wants exactly that subtraction.',
          'A good linear model has residuals scattered randomly above and below zero. A curved pattern in the residuals means a line was the wrong model — this is how the SAT asks whether a linear fit is appropriate without using the word "residual plot".'
        ]
      },
      {
        h: 'Which type of function models the data',
        p: [
          'A recurring style shows a scatterplot or describes a pattern and asks which model fits: linear, quadratic, exponential growth, or exponential decay.',
          'Linear: equal steps up or down, a straight trend. Quadratic: rises then falls (or falls then rises) with a turning point. Exponential growth: rises ever more steeply, never turns. Exponential decay: falls steeply then flattens toward a horizontal asymptote without crossing it.',
          'A constant <i>rate</i> in words ("descends at a constant rate of $500$ feet per minute") is always linear. A constant <i>percent</i> ("loses $8\\%$ of its value each year") is always exponential.'
        ],
        boxes: [{
          k: 'rule', t: 'Words to model, instantly',
          b: 'Per unit, per minute, per item, a fixed amount &rarr; linear. Percent per period, doubles, halves, times a factor &rarr; exponential. Area, product of two changing lengths, projectile height &rarr; quadratic.'
        }]
      },
      {
        h: 'Interpolation, extrapolation and honest prediction',
        p: [
          'Predicting inside the range of the data is interpolation and is reasonable. Predicting far outside it is extrapolation, and the SAT will sometimes offer a choice that says the model may not hold — that choice is right when the requested $x$ is far beyond the data.',
          'A model describes association, never cause. Even a perfect fit cannot establish that $x$ causes $y$ from observational data.'
        ]
      },
      {
        h: 'Line graphs and other displays',
        p: [
          'Some items use a line graph over time rather than a scatterplot. Read the axes first, including whether the vertical axis starts at zero — a truncated axis exaggerates change visually but not numerically.',
          'When asked for the greatest increase between consecutive points, compare the differences, not the heights.'
        ]
      }
    ],
    styles: [
      { n: 'Predict from the line', l: 'Scatterplot with a line of best fit, asking for the predicted $y$ at a given $x$.', m: 'Use the line, not the nearest dot.' },
      { n: 'Interpret the slope', l: 'A model in context, asking what a coefficient means.', m: 'Change in output per one unit of input, with units.' },
      { n: 'Interpret the intercept', l: 'Asking what the constant means.', m: 'The predicted output at input zero — say whether that is meaningful.' },
      { n: 'Residual', l: 'A data point plus the model.', m: 'Actual minus predicted; sign tells above or below.' },
      { n: 'Which function type', l: 'Described pattern or scatterplot shape.', m: 'Fixed amount per period is linear; fixed percent is exponential; a turning point is quadratic.' },
      { n: 'Compare data point to prediction', l: '"By how much does the actual value exceed the predicted?"', m: 'Read both, subtract.' },
      { n: 'Best fit equation from a description', l: 'A described scatterplot with an exponential or linear trend.', m: 'Identify the starting value and the per-step behaviour.' },
      { n: 'Line graph reading', l: 'Percent by year, or quantity by day.', m: 'Compare consecutive differences; check the axis scale.' }
    ],
    traps: [
      'Using a data point where the question asked for the model\'s prediction.',
      'Giving a slope interpretation with the wrong units, or the intercept\'s meaning for the slope.',
      'Calling a fixed percent change linear.',
      'Reading a truncated vertical axis as though it starts at zero.',
      'Inferring causation from a strong association.'
    ],
    videos: [
      { t: 'Scatterplots and line of best fit', u: yt('scatterplot line of best fit interpret slope intercept') },
      { t: 'Linear vs exponential models', u: yt('linear vs exponential growth which model fits data') },
      { t: 'Residuals explained', u: yt('residuals residual plot statistics explained') }
    ]
  });

  /* ================================================================== Q.E ================== */
  L.lesson({
    id: 'sat.Q.E', track: 'sat', unit: 'Q',
    title: 'Probability and conditional probability',
    bank: { skill: 'Q.E.' },
    why: 'Counting favourable outcomes over total outcomes, almost always out of a two-way table. 49 live items and very learnable.',
    recall: [
      { q: 'Basic probability formula?', a: '$P = \\dfrac{\\text{favourable outcomes}}{\\text{total outcomes}}$, when outcomes are equally likely.' },
      { q: 'What does "given that" do to the denominator?', a: 'It restricts the population. The denominator becomes only the group named after "given that", not the grand total.' },
      { q: 'If $P(A) = 0.3$, what is $P(\\text{not } A)$?', a: '$0.7$. Complements sum to $1$.' }
    ],
    teach: [
      {
        h: 'Everything is a fraction of a table',
        p: [
          'The SAT presents a two-way table — rows one category, columns another, with row totals, column totals and a grand total. Every probability question is choosing the right cell for the numerator and the right total for the denominator.',
          'Unconditional: "if one participant is selected at random, what is the probability they are in Group A and over 40?" Numerator is that single cell; denominator is the grand total.',
          'Conditional: "given that the participant is in Group A" restricts you to the Group A row. Numerator is the cell where that row meets the other condition; denominator is the row total.'
        ],
        boxes: [{
          k: 'rule', t: 'Find the denominator first',
          b: 'Read the sentence for a restricting phrase — "given that", "of those who", "among the students who". Whatever it names is your denominator. Then find the numerator inside it.'
        }],
        ex: [{
          q: 'Of $40$ marbles, $8$ are red, $10$ blue and $22$ green. One is drawn at random. What is the probability it is not blue?',
          s: [
            'Not blue means red or green: $8 + 22 = 30$.',
            '$P = \\dfrac{30}{40} = \\dfrac{3}{4}$.',
            'Equivalently $1 - \\frac{10}{40} = \\frac{3}{4}$ using the complement.'
          ]
        }]
      },
      {
        h: 'Conditional probability in words',
        p: [
          'Two sentences that look identical mean different things. "What fraction of the hybrids cost more than $\\$25{,}000$?" restricts to hybrids. "What fraction of the cars costing more than $\\$25{,}000$ are hybrids?" restricts to the expensive cars. Same cell on top, different totals underneath.',
          'When the question offers an answer as a fraction, check that your denominator matches one of the table\'s totals; if it does not, you have probably mixed a row with a column.'
        ]
      },
      {
        h: 'Filling in a table with an unknown',
        p: [
          'Tables sometimes hide a cell behind a variable and give the grand total. Every row and column must sum correctly, so one subtraction chain recovers the missing value before you can answer.',
          'Do the bookkeeping fully before computing the probability. Half-filled tables cause more errors here than the probability itself.'
        ]
      },
      {
        h: 'Dice, cards and simple experiments',
        p: [
          'For a fair $n$-sided die the outcomes are equally likely, so probability is just a count over $n$. "At least one" problems are usually easiest through the complement: $P(\\text{at least one}) = 1 - P(\\text{none})$.',
          'The SAT rarely multiplies independent probabilities, but when it does, independence must be stated or obvious (replacement, separate spins).'
        ]
      },
      {
        h: 'Expressing the answer the way they want it',
        p: 'Answers come as fractions, decimals or percents, and the choices are consistent within a question. Reduce fractions fully, and if the question asks for a probability "to the nearest hundredth", carry the division out rather than estimating.'
      }
    ],
    styles: [
      { n: 'Single cell over grand total', l: 'Two-way table, one category and one group.', m: 'Cell divided by grand total.' },
      { n: 'Conditional on a row or column', l: '"Given that the participant is in Group A\\dots"', m: 'Restrict the denominator to that row or column total.' },
      { n: 'Reverse conditional', l: 'Same cell, the other restriction.', m: 'Swap the denominator; watch which category the question names first.' },
      { n: 'Complement', l: '"What is the probability of not selecting\\dots"', m: 'One minus the simple probability, or add the other categories.' },
      { n: 'Missing cell', l: 'A table with a letter in one cell and given totals.', m: 'Fill the table by subtraction first.' },
      { n: 'Simple experiment', l: 'A fair die or a bag of marbles.', m: 'Count favourable over total.' },
      { n: 'Probability from a data list', l: 'A short data set, selecting a value at random.', m: 'Count matching values, divide by the count of values.' },
      { n: 'Percent phrasing', l: 'The same question asked as "what percent".', m: 'Compute the fraction, then multiply by $100$.' }
    ],
    traps: [
      'Using the grand total when the sentence restricted to a row.',
      'Mixing the row total with the column total.',
      'Computing the reverse conditional — a very common distractor.',
      'Answering the complement of what was asked.',
      'Leaving a fraction unreduced when the choices are in lowest terms.'
    ],
    videos: [
      { t: 'Two-way tables and probability', u: yt('two way table probability conditional probability') },
      { t: 'Conditional probability explained', u: yt('conditional probability given that explained') },
      { t: 'SAT probability questions', u: yt('SAT math probability two way tables practice') }
    ]
  });

  /* ================================================================== Q.F ================== */
  L.lesson({
    id: 'sat.Q.F', track: 'sat', unit: 'Q',
    title: 'Sample statistics and margin of error',
    bank: { skill: 'Q.F.' },
    why: 'What a sample can and cannot tell you about a population, and what a margin of error actually means. Only 28 live items, but they are quick points once the vocabulary is exact.',
    recall: [
      { q: 'Why does a sample have to be random?', a: 'Only a random sample from the population of interest supports generalising to that population. Any other selection method can be biased in unknown ways.' },
      { q: 'What does "a mean of $18.4$ with a margin of error of $1.2$" describe?', a: 'A plausible interval for the <i>population</i> mean: $17.2$ to $19.6$.' },
      { q: 'Does a larger sample give a larger or smaller margin of error?', a: 'Smaller. More data pins the estimate down more tightly.' }
    ],
    teach: [
      {
        h: 'The population, the sample, and the leap between them',
        p: [
          'A statistic is computed from the sample; a parameter is the true value for the whole population. Inference is the claim that the statistic is close to the parameter, and it is only justified when the sample was selected at random from that exact population.',
          'The population you may generalise to is the one that was sampled — not a larger or different one. If the sample came from one school, conclusions apply to that school, not the district.'
        ],
        boxes: [{
          k: 'trap', t: 'The wrong population',
          b: 'Answer choices routinely extend the conclusion to "all adults" when the sample was drawn from "all adults who own televisions". The correct choice keeps the population exactly as described in the sampling sentence.'
        }]
      },
      {
        h: 'What a margin of error means, precisely',
        p: [
          'An estimate of $52\\%$ with a margin of error of $4.2\\%$ says: it is plausible that the true population percentage lies between $47.8\\%$ and $56.2\\%$.',
          'It does <b>not</b> say every individual falls in that range, and it does not say the true value is definitely inside. It is a statement about the estimate\'s precision, nothing else.',
          'Comparing two samples: the one with the smaller margin of error gives the more precise estimate — usually because it was larger.'
        ],
        ex: [{
          q: 'A random sample of a school\'s students estimates the mean study time as $6.8$ hours per week with a margin of error of $0.6$ hours. Which conclusion is best supported?',
          s: [
            'Form the interval: $6.8 \\pm 0.6$, so $6.2$ to $7.4$ hours.',
            'The claim must be about the <i>population mean</i> of that school, stated as plausible rather than certain.',
            'Best: "it is plausible that the mean study time for all students at the school is between $6.2$ and $7.4$ hours per week."'
          ],
          n: 'A choice saying "every student studies between $6.2$ and $7.4$ hours" is about individuals and is wrong. A choice about a different school is wrong on population.'
        }]
      },
      {
        h: 'What makes the margin shrink',
        p: [
          'Increasing the sample size shrinks the margin of error. Lowering the confidence level also shrinks it, but the SAT almost always varies sample size.',
          'Sampling more carefully does not shrink the margin — bias and precision are separate problems. A biased sample of $10{,}000$ has a small margin of error around the wrong number.'
        ]
      },
      {
        h: 'Scaling a sample up to a population',
        p: [
          'If $45$ of $300$ sampled customers want a service, the sample proportion is $0.15$; applied to $20{,}000$ customers that predicts $3{,}000$. This is the most computational item in the skill.',
          'Keep the proportion exact rather than rounding early, and be careful that the population figure given is the one you should scale to.'
        ]
      }
    ],
    styles: [
      { n: 'Best conclusion from a sample', l: 'A described random sample with a statistic, four conclusion choices.', m: 'Keep the population exactly as sampled and the claim plausible, not certain.' },
      { n: 'Interpret the margin of error', l: 'An estimate plus a margin.', m: 'Build the interval; the claim is about the population parameter.' },
      { n: 'Compare two margins', l: 'A small table of two samples with different margins.', m: 'Smaller margin means a more precise estimate; usually the larger sample.' },
      { n: 'How to reduce the margin', l: '"Which change would most likely reduce the margin of error?"', m: 'Increase the sample size.' },
      { n: 'Scale to the population', l: 'A sample proportion applied to a known population size.', m: 'Proportion times population.' },
      { n: 'Which sampling method is valid', l: 'Several described selection procedures.', m: 'Random selection from the population of interest.' }
    ],
    traps: [
      'Turning a statement about the population mean into one about every individual.',
      'Generalising past the sampled population.',
      'Saying the true value is certainly inside the interval.',
      'Believing a bigger sample fixes a biased selection method.',
      'Rounding the sample proportion before scaling it up.'
    ],
    videos: [
      { t: 'Margin of error and confidence intervals', u: yt('margin of error confidence interval explained SAT') },
      { t: 'Sampling and generalisation', u: yt('random sampling generalizing to population statistics') },
      { t: 'SAT statistics inference questions', u: yt('SAT math statistics inference margin of error practice') }
    ]
  });

  /* ================================================================== Q.G ================== */
  L.lesson({
    id: 'sat.Q.G', track: 'sat', unit: 'Q',
    title: 'Evaluating statistical claims: studies and experiments',
    bank: { skill: 'Q.G.' },
    why: 'The smallest skill in the bank — 12 live items — and the cheapest points on the test, because the whole thing reduces to two questions about how the data was collected.',
    recall: [
      { q: 'What two features must a study have before a cause-and-effect conclusion is allowed?', a: 'Random <i>assignment</i> to treatment groups, and that is what makes it an experiment. Random selection alone only supports generalisation, not causation.' },
      { q: 'What does random selection buy you?', a: 'The right to generalise the result to the population that was sampled.' },
      { q: 'A study finds ice cream sales and drownings rise together. What is wrong with "ice cream causes drowning"?', a: 'Association is not causation; a lurking variable (hot weather) drives both. Observational data cannot rule that out.' }
    ],
    teach: [
      {
        h: 'Two different randomisations, two different rights',
        p: [
          '<b>Random selection</b> — who ends up in the study — determines whether you may generalise to a wider population.',
          '<b>Random assignment</b> — who receives which treatment — determines whether you may claim causation.',
          'Both present: you may generalise <i>and</i> claim cause. Only selection: generalise, but describe an association. Only assignment: cause within the studied group, but do not extend beyond it. Neither: describe the group studied, nothing more.'
        ],
        boxes: [{
          k: 'rule', t: 'The four-cell grid, memorised',
          b: 'Selected at random + assigned at random &rarr; cause, for the population. Selected only &rarr; association, for the population. Assigned only &rarr; cause, for these participants only. Neither &rarr; this group, this association, nothing more.'
        }],
        ex: [{
          q: 'A scientist randomly selected $60$ trees of the same age from a habitat and randomly assigned them to two watering schedules. Growth differed. What is the strongest justified conclusion?',
          s: [
            'Random assignment is present, so a causal claim about the watering schedule is allowed.',
            'Random selection from the habitat is present, so the conclusion extends to trees of that age in that habitat.',
            'Strongest justified: the watering schedule caused the difference in growth for trees of this age in this habitat — not for all trees everywhere.'
          ],
          n: 'The right answer is always the strongest claim the design supports, and never stronger. Both halves — cause and population — must be checked.'
        }]
      },
      {
        h: 'Observational study versus experiment',
        p: [
          'In an observational study the researcher only watches and records; group membership is already determined. In an experiment the researcher imposes the treatment.',
          'Surveys, polls and record reviews are observational. Anything where the researcher decides who gets what is an experiment.'
        ]
      },
      {
        h: 'Reading the answer choices like a lawyer',
        p: [
          'The distractors are calibrated by overreach. One will claim cause where only association is supported; one will extend to a broader population than was sampled; one will be true but weaker than what the design supports; one will be exactly right.',
          'Work through them by testing two things in order: does this choice claim cause, and is that earned? Does this choice name a population, and was that population sampled?'
        ]
      }
    ],
    styles: [
      { n: 'Strongest justified conclusion', l: 'A described study, four conclusions of varying strength.', m: 'Check random assignment for cause, random selection for population.' },
      { n: 'Can a causal claim be made', l: '"Is it appropriate to conclude that X caused Y?"', m: 'Only with random assignment to groups.' },
      { n: 'To whom does it generalise', l: 'A sample from a specific subgroup.', m: 'Exactly the sampled population, no wider.' },
      { n: 'Identify the design flaw', l: 'Volunteers, convenience samples, self-reporting.', m: 'Name the bias and restrict the conclusion accordingly.' },
      { n: 'Observational or experimental', l: 'A description of how data was gathered.', m: 'Did the researcher impose the treatment?' }
    ],
    traps: [
      'Treating random selection as licence for a causal claim.',
      'Extending a conclusion to a population that was never sampled.',
      'Choosing a true but weaker statement when a stronger one is supported.',
      'Calling a survey an experiment because it was large.'
    ],
    videos: [
      { t: 'Observational studies vs experiments', u: yt('observational study vs experiment random assignment selection') },
      { t: 'Correlation is not causation', u: yt('correlation causation lurking variable statistics') },
      { t: 'SAT statistical claims questions', u: yt('SAT math evaluating statistical claims practice') }
    ]
  });

})(window.LEARN);
