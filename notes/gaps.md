# notes/gaps.md: every gap one ledger line, each with a bounded trial (board 14 builder)

## Files

`self/gaps.mjs` (the ledger; `--dry`, `--json`), `bench/gaps.mjs` (the bar), `test/gaps.test.mjs`,
`test/gaps-plant.mjs`, `bench/verdicts/gaps.json`, `state/self/gaps.jsonl` (at most 7
`gaps-<date>.jsonl` kept), `state/self/gaps-budget.json`.

## Design

A bar file is read by barMet, met, met.bar, bar.met, then its verdict word. knowledge, multiply
and velocity name `bar.met`; public-launch names none, because its bar is prose. The 10 undecidable
files: census-prune, census-scale-pruned, census-scale-static, census, compress-board10,
grid-evaluation, grid, imagine, ladder, public-launch.

Ladder rungs, read from fields only:

| rung | read | gap |
| --- | --- | --- |
| sets.gsm8k, humaneval, arc | bars beside published rows | yes |
| improvement | 0.2777 against 5 | yes |
| target | lastDelta -0.6 against low 5 | yes |
| bytesPerPoint | 59660.533 against 59660.8 | no |
| knowledge.enwiki | not measured | no |

A trial runs in a copy without organism/, state/, bench/fixtures/, web/dist/ or .git/. The
exceptions: the one seed a census reads; arc-agi-1 for grid; answer-questions.json for compress,
daemon and ladder-daily; code-tasks.json for ladder-daily; trader.db for venue.
organism/scale-52000 has trial null (never loaded whole). math, public-gsm8k and public-humaneval
have no dry form, so they are unproved.

## Open

- prune.json was missed (gateGreen false) and has trial null. bench/prune.mjs has one form, and
  its own run took 846.6 s. This gap alone holds the bar NOT MET.
- The compress ratio ranged 2.2034 to 2.8015 over five runs of one form; daemon ranged 1.3526
  to 1.3891.
- The schedule trial reads registration only. Registering the task is his call.

## Measured (board 17 builder (the organism's item))

The gap: `missed:gaps.json`, "no registered field holds a number beside this bar". The fill:
bench/gaps.mjs writes `bar.share` beside `bar.shareBar` (1) and decides barMet from that share
alone; self/gaps.mjs MEASURES registers the pair. The number is the share of the gap lines the
bar covers (every line of kinds missed, ladder, gate red, gate slow, and every line with a
model-free trial) whose trial printed its metric before the trials' wall clock passed 600 s
(a model trial only has to carry its command). Chosen over recall on a planted tree because
the header's bar is about trials that run; the planted trees in test/gaps.test.mjs already
hold recall exact.

Also added: `node self/gaps.mjs --row hisData|autonomy|handoff` grades one gate row alone
(bench/gate.mjs exported row functions), so those three red rows carry a trial;
`--trial-ram-mb N` caps each trial under a smaller host budget.

Bar run on the cloud host (4 CPUs, 16 GB; 4000 MB here, not his 6000; GH_TOKEN and
GITHUB_TOKEN unset so no trial reached api.github.com):
`node tools/budget.mjs --ram-mb 4000 --disk-mb 8000 --dir <tmp> -- node --max-old-space-size=4000 bench/gaps.mjs --wait-free-ram-mb 4000 --trial-ram-mb 3600 --tmp-root <tmp>`

- share 0.090909 against a bar of 1: 5 of 55 covered lines meet it; 49 carry a trial
  (trialShare 0.890909). Bar NOT MET. 36 model-free trials, 16 printed a metric, trial wall
  2501.64 s against 600 s. Peak 1645.566 MB, model calls 0.
- Control: the ledger read the old gaps.json as measured null, distance null; it reads the
  new one as measured 0.090909, bar 1, distance 0.909091.
- Noise: grid run twice, percent solved 40 then 40, wall 9.338 s then 9.28 s.
- Trial: `self/gaps.mjs --dry` prints trialShare 0.890909 (barLines 55).

## Open (board 17)

- The 600 s ran out on trials that sat to their bound: autopilot 480.01 s, compress 360.01 s,
  daemon 300.01 s, operators 480.01 s, test/operators.test.mjs 540.012 s. bench/daemon.mjs
  waits for 16 GB free by default and bench/compress.mjs waits for its MIN_FREE_GB; a 16 GB
  host never has that free. Next rung: those forms pass a host-sized wait (daemon has
  `--wait-free-gb`), then the run again.
- 2026-09-28: every gap of the four counted kinds carries a trial (the ledger by kind: missed 26, ladder 7,
  gate red 2, gate slow 8, none without one) after 15 FORMS entries were added (boundary, essay, grid-curve,
  grid-library, grid-local-evaluation, imagine, multiply, ns, plateau, published-rows, site-probe, soak,
  vision-count, self-queries, and the ladder form multiplying); test/gaps.test.mjs asserts each key resolves
  to an existing bench file. The gate-red badImports and row:budget gaps closed with the 0/0 gate scan.
- cloud and cloud-fit need bench/fixtures/wiki/store, absent here.
