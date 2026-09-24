# notes/operators.md: the operators item (Board 14)

His words, relayed: "Self improving to the magnitude of yourself is the top priority it should be better or as good as u at self improving and can be able to spread this in billions of years compressed simulated magnitude".

This note is the builder's record. It covers what was built, what was measured and by which command, and what is still open. Every number below was printed by a command named beside it.

## Files

Written by this item:
- self/knobs.mjs, self/operators.mjs and self/improve.mjs (all new)
- test/operators.test.mjs and test/operators-plant.mjs (new)
- bench/operators.mjs (new), plus the verdicts it writes:
  - bench/verdicts/operators.json
  - bench/verdicts/operators-partial.json, from an earlier smoke run (`--checks 3,4,5 --no-model`, isTheBar false)
- state/self/operators/:
  - 2026-09-24.jsonl, one JSON line per baseline, trial, confirm and decision; 43 lines at the end of the bar run
  - baselines.jsonl, 5 lines
- this note

Read, never written: self/gaps.mjs and state/self/gaps.jsonl (the gaps item's), bench/gate.mjs, and the real tree's organism/, state/ and bench/fixtures/. Those three are copied into trial copies only.

## Design

**Knobs (self/knobs.mjs).** A knob is one of three things:
- a line `// knob [lo, hi] step`;
- a bare `// knob`, which gets the band 0.7x to 1.5x of the literal and a step of 10 percent;
- any numeric field of an exported `DEFAULTS`, `OPTIONS`, `CONFIG` or `LIMITS` object.

A value outside its band is never written. The test reads five forms and rejects what is not a knob.

**Operators (self/operators.mjs).** Each operator is an async generator: it yields a candidate, gets back the judged result, and returns `{best, reason}`.
- **knob-tune:** at most 6 trials. The first trial's sign sets the direction.
- **strategy-swap:** reads a `STRATEGIES` object and tries every other name once.
- **recombine:** grid gaps only.
- **author:** asks qwen3:30b-a3b through Ollama for one unified diff under 60 changed lines. Anything outside the gap's files list or past the ceiling is refused.
  - Budget: 12 calls a run by default, a 120 s wall per call, and every call's seconds are recorded.
  - A model named claude-anything is refused before any socket opens.

**IMPROVE (self/improve.mjs).** Every round works on a copy.
1. **Copy.** The copy is nested: `<tmp>/brain-operators-XXXX/brain`, with a `.brain-operators-top` marker in the top, and deleteCopy removes exactly that marked top. It leaves out organism/, state/, bench/fixtures/, web/dist/ and .git/.
2. **Baseline.** The unpatched trial runs twice, unless today's baseline for the same command and the same file bytes is in baselines.jsonl.
3. **Noise band.** The spread of the two runs, or 5 percent of the distance to the bar when they agree.
4. **Keep rule.** A candidate is kept only if all three hold:
   - its less favourable run (the search run or a confirmation run) moved toward the bar by more than the noise band;
   - the tests that import a patched file pass on the copy;
   - `node bench/gate.mjs --quiet` is GREEN on the copy.
5. **Record.** The record line is written while the copy is still alive. The copy is deleted afterwards, and the free MB left is printed.

**The gate kit.** It is added to the copy before the touched tests and the gate:
- every bench/fixtures file up to 10 MB;
- bench/fixtures/wiki/store whole (512 MB cap);
- organism seeds up to 30 MB each (the two scale-52000 seeds stay out);
- web/dist up to 5 MB;
- `../trader/data/trader.db` beside the copy, inside its own marked top only (300 MB cap).

If a trial dies on ENOENT, that one path is copied in and the trial runs again, up to 3 times.

**The ledger's trial form.** self/gaps.mjs writes trials as data:
- `argv` with `{tmp}` and `{copy}` placeholders;
- a parser name keyed into its `PARSERS`;
- `seed`, `fixtures` and `trader` flags.

improve() runs that shape as written:
- **argv:** node plus the ledger's argv, with `{tmp}` replaced by `<copy>/tmp` and `{copy}` by the copy. The display `command` is never run.
- **Parsers:** a `file` parser reads a JSON file in the copy. A `stdout` parser reads the child's stdout, kept apart from the budget's log lines. The `row` parser (tests) reads the wall ms of a passing run, and a failing run measures nothing.
- **Includes:** a seed or fixtures come into the copy, and a trader trial gets the sibling database before its baseline.
- **Clean start:** each run begins with the parser's file and `{tmp}` removed.

## The bar

Command: `node tools/budget.mjs --ram-mb 6000 --disk-mb 4096 --dir <scratch>/ops-run -- node --max-old-space-size=6000 bench/operators.mjs --tmp <scratch>/ops-run`

Printed at the end, verbatim:

```
planted 6 of 6: 1 PASS, 2 PASS, 3 PASS, 4 PASS, 5 PASS, 6 PASS
model calls to qwen3:30b-a3b: 2 (55.92 s, 115.11 s)
copies: 10 made, 10 deleted, 0 left under ...\scratchpad\ops-run; 1040859 MB free after
real tree: planted/ absent before and after, the real gaps' files byte identical
peak RSS seen by this bench 1862 MB (its own process, trials, touched tests, gates); 1812.09 s
OPERATORS BAR NOT MET: planted 6/6, real not completed; verdict bench/verdicts/operators.json
BUDGET done exit 2: wall 1812.39 s, peak ram 2205.9MB, peak dir 763.1MB, cpu 2122.94 s, 907 samples, record state/budget/last.json
```

### Planted: 6 of 6

The plant is a lean copy of the tree with the planted files written in. The real bench/gate.mjs decides every keep. Each claim is shown with its control, which is the unpatched trial run twice, and its noise band.

| check | result | control (unpatched runs) | noise |
|---|---|---|---|
| 1 knob-tune | KEPT GAIN 10 to 14: 64 to 96, toward 32; gate on the copy GREEN in 442.19 s | 64, 64 (today's baseline, reused) | 1.55 |
| 2 strategy-swap | KEPT fast: 50 to 97, toward 47 (mid measured 80); gate GREEN in 463.2 s | 50, 50 | 2.25 |
| 3 band refusal | "refused: the value 22 is outside the band [4, 20] of EDGE"; EDGE 18 read 68 (-2), inside the noise | 70, 70 | 0.5 |
| 4 files list | 4a: "the answer touches planted/strategy.mjs, outside the gap's files list (planted/tune.mjs)"; 4b: "no usable diff: the diff targets self/improve.mjs, none of which the author was given" | 64, 64 | 1.55 |
| 5 noise | DRIFT 1.1 read 50.7, 0.7 toward the bar, inside the noise band 1 | 50.5, 49.5 | 1 |
| 6 real qwen3:30b-a3b, one call | answered in 55.92 s (prompt 1050 chars); KEPT GAIN 10 to 14: 64 to 96; gate GREEN in 472.36 s | 64, 64 | 1.55 |

### Real: the ledger, not completed

- The bench read state/self/gaps.jsonl, which had 138 gap lines. The stand-in was not needed.
- The eligibility rule is a model-free trial of at most 5 minutes and at least one knob. It printed `eligible 1 of 138; picked gate-slow:test/multiply.test.mjs`.
- The bar asks for two gaps, and the ledger holds one.

**knob-tune on gate-slow:test/multiply.test.mjs** (measured 29111 ms, bar 15000 ms). The trial was the ledger's argv, `node --max-old-space-size=6000 --test test/multiply.test.mjs`, on the copy, read by `self/gaps.mjs PARSERS.test`.
- Control: the unpatched trial read 30860 and 29850, so the noise band is 1010.
- Six trials, one step each, all inside the noise band:

  | knob | step | read (ms) | toward the bar (ms) |
  |---|---|---|---|
  | DEFAULTS.wallS | 240 to 264 | 29790 | 565 |
  | DEFAULTS.majors | 12 to 13 | 29830 | 525 |
  | DEFAULTS.units | 256 to 282 | 29800 | 555 |
  | DEFAULTS.checkpointEvery | 250 to 275 | 29860 | 495 |
  | DEFAULTS.chunk | 10 to 11 | 29880 | 475 |
  | DEFAULTS.ledgerBudgetMb | 16 to 18 | 29850 | 505 |

- Decision: "REFUSED: no knob step moved the metric toward the bar by more than the noise band in 6 trial(s) (before 30355, after n/a, noise 1010)".

**author once on the same gap.** The call was aborted and there was no answer:
- printed: "refused author: the model cell did not answer: ollama request failed: This operation was aborted";
- the call ran 115.11 s with a prompt of 52999 characters.

No real patch was kept, and the real tree got no change. The bench printed that the real gap's files (daemon/health.mjs, daemon/multiply.mjs, daemon/run.mjs, generations/velocity.mjs) were byte identical before and after the rounds.

## Kept patches, in full

All three were kept on planted copies. None is on the real tree.

Check 1, author **organism (knob-tune)**:
```
--- a/planted/tune.mjs
+++ b/planted/tune.mjs
@@ -1,4 +1,4 @@
 // planted/tune.mjs: a planted module whose metric is a function of one knob.
-export const GAIN = 10; // knob [4, 20] 2
+export const GAIN = 14; // knob [4, 20] 2
 export function score(g = GAIN) { return 100 - (g - 16) ** 2; }
 
```

Check 2, author **organism (strategy-swap)**:
```
--- a/planted/strategy.mjs
+++ b/planted/strategy.mjs
@@ -5,5 +5,5 @@
   mid: () => 80,
 };
-export const STRATEGY = 'slow';
+export const STRATEGY = 'fast';
 export function score() { return STRATEGIES[STRATEGY](); }
 
```

Check 6, author **organism (author, qwen3:30b-a3b)**, the model's own diff:
```
--- a/planted/tune.mjs
+++ b/planted/tune.mjs
@@ -1,2 +1,2 @@
-export const GAIN = 10; // knob [4, 20] 2
+export const GAIN = 14; // knob [4, 20] 2
```

## The gate on a copy, measured three times

| copy | gate | printed by |
|---|---|---|
| lean copy (no fixtures, seeds, dist or siblings) | RED, test files 66/83, assertions 1027 pass / 61 fail | a scratch probe, gate-on-copy.log |
| kit v1 (fixtures, seeds, dist; a flat copy) | RED, test files 84/87 (cli, daemon, venue-suite red), 411.31 s | a scratch probe, gate-kit.log |
| kit v2 (a nested copy with trader.db beside it, and the whole wiki store) | GREEN, test files 89/89, assertions 1130 pass / 0 fail, in 442.19 s, 463.2 s and 472.36 s | the bar, checks 1, 2 and 6 |

Why kit v2 was needed:
- **venue-suite** read `../trader/data/trader.db` through a relative path. A flat copy has no sibling, so the suite fell back to a synthetic tape.
- **daemon** ingested 0 because bench/fixtures/wiki/store was missing.

That is why the copy is nested, and why a sibling goes only inside the copy's own marked top.

## Findings

1. **Knobs are rare in the real tree, and that is what caps the real set.** Of 138 ledger lines, one gap has a model-free trial of 5 minutes or less and a knob (40 knobs, all in daemon/multiply.mjs `DEFAULTS`).
   - The rest have 0 knobs on their files: venue's five files, capability/grid-library.mjs, bin/brain.mjs, seeds/whole.mjs, and the hvheap and capability files.
   - Other gaps fail on other rules:
     - compress has 31 knobs, but its trial takes 6 min, over 5;
     - math and the ladder's model rows need the model;
     - the dead-share gaps name an organism seed directory, not a file.
   - The item never writes the real tree, so the knob annotations have to come from each item's own builder, or from a kept author diff that adds them.
2. **The multiply trials sit on the second baseline run.**
   - All six trials read between 29790 and 29880, and the second unpatched run read 29850. The first unpatched run read 30860.
   - So each trial's "toward" of 475 to 565 ms was measured against a mean that includes the first run. It is not an effect of the knob.
   - The noise band 1010 refused all six. That is the rule working on real data.
3. **The author does not answer on a real gap inside the wall.**
   - The planted prompt was 1050 characters and answered in 55.92 s. The real prompt, holding the four files of the multiply gap, was 52999 characters and was aborted at 115.11 s.
   - askModel passes Ollama a timeout of the 120 s wall minus 5 s, with numCtx 16384.
4. **A partial verdict becomes a ledger line.** The smoke run's operators-partial.json, written while no operators.json existed, appeared in the ledger as `never:operators-partial.json`. bench/verdicts/operators.json now exists, and the gaps item's rule drops a partial whose bar has landed.

## Tests

`node --test test/operators.test.mjs` printed tests 11, pass 11, fail 0, duration_ms 24074.9884. There is no Ollama call; every author is a fixture answer.

The tests cover:
- the knob grammar in five forms;
- a band refusal;
- the noise rule;
- baseline reuse;
- a byte-identical tree;
- the record written before the copy is deleted;
- strategy-swap and a RED gate;
- the mocked author's walls;
- the nested copy and the kit;
- the ledger trial form (argv with `{tmp}`, a named file parser, the row parser, and stdout kept apart), end to end on the plant.

## Open

- **The real set needs a second eligible gap.** Any of these would make one:
  - a knob on a short gap's file;
  - a compress trial form of 5 minutes or less;
  - a dead-share trial whose files list names a file.
- **The author on real gaps needs a prompt that fits.** Options: send only the knob-bearing file or the hunk around it, or raise the wall and numCtx. Either change has to be measured against the 55.92 s planted call.
- **Checks 1, 3, 4, 5 and 6 reused today's baselines** (64 and 64, 70 and 70, 50.5 and 49.5), which an earlier run today recorded for the same command and file bytes, as the reuse rule says. Check 2 and the real multiply knob-tune ran their own two unpatched runs, and the real author round reused the multiply baseline.
- **Launcher record:** tools/budget.mjs wrote its own record to state/budget/last.json. That is the prescribed launcher's file, not this item's.
