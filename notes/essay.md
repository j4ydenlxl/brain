# essay (board 26, item essay-bar)

His words, order 38 (2026-09-27, docs/VISION.md): "Also it cant code or write complex essays right? Like basiaclly i
want to make it better than you out of countless self itterations". The order's status said no essay bar existed and
that one would be designed with a NAMED judge before any number was quoted. This is that bar.

Files: bench/essay.mjs (the judge, the arms, the run), bench/essay-prompts.json (the 40 prompts), test/essay.test.mjs,
bench/verdicts/essay.json (the bar), bench/verdicts/essay-<provider>-partial.json (any narrower run).

## Plainly: what this judge measures

A rubric judge measures FORM, not truth and not argument. rubric-v1 checks that a thesis is stated, that there are
paragraphs, that the given facts appear word for word, that no sentence repeats, that the length is in a band, that the
close restates the thesis and that neighbouring sentences share words. It cannot tell a true essay from a false one, a
good argument from a bad one, or whether a fact is used to support the stance or merely sits in the text. A model
judge (a pairwise preference between two essays, or a rubric read by a model with the reasons written out) would add
the missing half: whether each paragraph actually argues the stance, whether the facts are used correctly, whether the
reasoning follows and whether the prose reads well. It brings its own costs: it is not deterministic, it has its own
biases (length, position, its own style), and it needs its own control (the same model judging the template and the
echo) before any number from it is quoted.

## The judge, rubric-v1 (deterministic, no model, no socket)

Every rule is a fraction in [0, 1] times its weight; the weights sum to 100. bench/essay.mjs RUBRIC prints them and
every run prints them again.

| weight | rule | fraction |
|---:|---|---|
| 20 | thesis: a sentence of the FIRST paragraph holds at least 60% of the stance's content words | all or nothing |
| 10 | paragraphs: at least 4, split on blank lines | paragraphs / 4, capped at 1 |
| 25 | facts: each given fact's normalised text appears in the normalised essay, on word boundaries | used / given |
| 10 | noRepeat: no normalised sentence appears twice; needs at least 2 sentences | all or nothing |
| 10 | length: 300 to 1200 words | words / 300 below, 1200 / words above |
| 15 | closing: the LAST paragraph, a different one from the first, restates the stance by the thesis rule | all or nothing |
| 10 | coherence proxy: adjacent sentence content word overlap (below) | share / 0.6, capped at 1; under 2 sentences earns 0 |

Normalisation: NFKD, accents dropped, lower case, every run of non letters and non digits one space. Content words:
tokens of 3 or more characters not in a fixed stop list (function words plus the genre words essay, argue, position,
conclusion, fact and the ordinals), stemmed crudely (ies to y, a final s dropped, never ss).

The coherence proxy, named: ADJACENT SENTENCE CONTENT WORD OVERLAP, the share of neighbouring sentence pairs (across the
whole essay, in order) that share at least one content word. It is the lexical, deterministic stand in for the latent
semantic analysis similarity between neighbouring sentences that automated essay scoring uses for coherence (the
Wikipedia article below names LSA among the techniques). It rewards staying on the same things; it cannot see whether
the sentence order makes sense.

Rules that would be true of nothing are guarded: noRepeat and coherence need at least 2 sentences, closing needs at
least 2 paragraphs, and every rule of an empty or whitespace text is 0 (tested).

## The arms and the bar

- organism: act/prompt.mjs ask() with --provider (null by default: no socket, no model), knowledge tier off (as
  test/ask-fallthrough.test.mjs does, so a host with or without the wiki store reads the same), one fresh brain per
  seed with nothing in memory. The judge scores whatever text ask() returns; the memory miss share is printed as the
  ABSTENTION share, and the tier that wrote each text is printed as answeredBy. With --provider ollama or env the arm
  goes through that model cell, and a cell that is not reached is ABSENT, never a zero. Nothing probes Ollama unless
  --provider ollama is named.
- template, THE CONTROL: a fixed skeleton. Opening "This essay is about <topic>. It argues that <stance>.", two body
  paragraphs listing the facts as "<Ordinal>, <fact>. This fact supports the argument.", close "In conclusion,
  <stance>." It meets thesis, paragraphs, facts and closing on all 40 prompts (tested) and cannot meet noRepeat (the
  boilerplate repeats) or length (the skeleton is under 300 words) on any of them (tested).
- null: the prompt echoed. It shows how much of any score is the prompt copied.

The bar: on the 20 held out prompts, over 3 seeds of prompt order, the organism's mean is above the template's by MORE
than the seed band (the larger of the two arms' per seed spreads). barFrom() is the pure function; equal to the band
is not met (tested).

The split: bench/essay.mjs splitIds() shuffles the sorted ids with core/rng.mjs on "essay-split/essay-split-2026-09-27";
the first 20 are development, the rest held out. The test recomputes it and compares it to the file. The judge's
thresholds, the template and the planted test essay (essay.vaccines) were checked on development prompts only.
contaminated false, with the note that one author wrote both halves in one sitting.

## Measured

Read before building (the tree): bench/code.mjs (three interleaved arms with a rotating first arm, a null floor, the
split object, the bar file written only by a run of the bar's shape, unknown flags run nothing), act/code.mjs
solveCode (ask, run, hand back the failing case), bench/public.mjs SET_META (a set names its source and licence) and
askArm/buildBrain (one empty brain per run; provider named explicitly), act/prompt.mjs ask() and memoryMissText (with
provider null the miss is three lines, the second "nothing in memory matches <words>."; with provider left undefined
askModel PROBES Ollama, so this bench always passes a provider), test/ask-fallthrough.test.mjs (the NULL options),
docs/VISION.md order 38.

Read before building (published, three pages, bounded):
- a web search for automated essay scoring features and Perelman's critique: e-rater scores rubric features such as
  rhetorical structure, vocabulary and syntax; Perelman showed (2012) that long pretentious essays out scored well
  written ones and (2014, the BABEL generator) that nonsense essays score well; engines "cannot check facts".
- https://files.eric.ed.gov/fulltext/EJ843852.pdf (e-rater V.2): fetched, but the PDF did not render on this machine
  (no poppler), so nothing from it is used here.
- https://escholarship.org/uc/item/263565cq (the BABEL paper page): fetched, no text came back.
- https://en.wikipedia.org/wiki/Automated_essay_scoring: systems score surface features (word count, subordinate
  clauses) and, in modern systems, organisation, development, cohesion, coherence and thesis clarity, related to human
  scores by a fitted model; latent semantic analysis is named; the criticisms are over reliance on surface features,
  insensitivity to content and creativity, and gibberish essays given high scores.

Printed by `node tools/budget.mjs --ram-mb 4000 --disk-mb 100 --dir bench/verdicts -- node --max-old-space-size=4000 bench/essay.mjs`
(verdict at 2026-09-27T18:31:41.938Z):

```
organism  heldOut      40.02   13.47   42.97  40.02/40.02/40.02  |  thesis 18, paragraphs 2.5, facts 0, noRepeat 10, length 2.01, closing 0, coherence 7.5
template  heldOut      75.79   73.53    77.9  75.79/75.79/75.79  |  thesis 20, paragraphs 10, facts 25, noRepeat 0, length 3.58, closing 15, coherence 2.21
null      heldOut      70.79   69.23   71.23  70.79/70.79/70.79  |  thesis 20, paragraphs 2.5, facts 25, noRepeat 10, length 3.37, closing 0, coherence 9.92
organism abstention share: held out 90.00%, development 95.00%
organism answered by (tier of ask()): held out {"memory":54,"program":6}, development {"memory":19,"program":1}
held out means over 3 seeds: organism 40.02, template 75.79 (control), null 70.79; seed band 0; gap -35.77
ESSAY isTheBar true barMet false: organism 40.02, template 75.79, null 70.79, band 0, gap -35.77, 284ms, verdict written to bench/verdicts/essay.json
BUDGET done exit 0: wall 0.56 s, peak ram 93.8MB, peak dir 50.9MB, cpu 0.28 s, 1 samples, record state/budget/last.json
```

Printed by `node --test test/essay.test.mjs`:

```
planted essay: 100, words 319, paragraphs 5, coherence share 0.7222
planted template: 74.72, unmet noRepeat, length, coherence, points {"thesis":20,"paragraphs":10,"facts":25,"noRepeat":0,"length":3.33,"closing":15,"coherence":1.39}
prompt echoed: 70.73, unmet paragraphs, length, closing
memory miss: 42.97, unmet paragraphs, facts, length, closing, coherence; thesis points 20 (the keyword line holds the stance words)
ℹ tests 14
ℹ pass 14
ℹ fail 0
```

Mutants of the judge, run on a scratch copy against the same test file (the control copy first):

```
control: ℹ pass 14 ℹ fail 0
M1-noRepeat-guard: ℹ pass 12 ℹ fail 2
M2-fact-boundary: ℹ pass 13 ℹ fail 1
M3-closing-distinct: ℹ pass 12 ℹ fail 2
M4-stance-cover: ℹ pass 11 ℹ fail 3
M5-coherence-pairs: ℹ pass 12 ℹ fail 2
```

## What the numbers say

- The bar is not met, as expected with the model off: the organism holds nothing about these topics and abstains.
- The rubric is gameable exactly as the published critique says. The template scores 75.79 while writing nothing, and
  the prompt echoed scores 70.79. Any organism number below about 76 on this judge is a number a skeleton gets for free.
- The organism's 40.02 is mostly form credit for a refusal: its memory miss line ("nothing in memory matches write,
  essay, vaccination, argue, position, greatest, achievement, public, health, ...") holds the stance's content words,
  so it earns the 20 thesis points, and its three lines earn noRepeat. A measured instance of form, not meaning.
- The seed band is 0 because with the model off every arm is deterministic; with a model cell on the rung, prompt
  order can move the organism and the band will be whatever the three seeds print.
- A finding outside this item: on 3 of the 40 prompts (essay.photosynthesis, essay.silk-road, essay.germs) ask() answered
  from its induced program tier ("answered by an induced program (mul(div(q2,q1),q0), level cue, ...)" then "1"): an
  arithmetic program fired on an essay prompt because the prompt carries numbers. That tier reads the organism's own
  learned programs, so this count can differ on another host. act/prompt.mjs is not this item's file; it is reported,
  not fixed.

## Open

- The organism arm through a model cell: `node tools/budget.mjs --ram-mb 4000 --disk-mb 100 --dir bench/verdicts -- node --max-old-space-size=4000 bench/essay.mjs --provider ollama --model <m>`
  on the local rung once the GSM8K queue is free (a run of the bar's shape writes essay.json).
- A model judge beside rubric-v1, with its own control (the same judge scoring the template and the echo).
- The program tier firing on essay prompts (3 of 40 here) belongs to act/prompt.mjs's owner.
