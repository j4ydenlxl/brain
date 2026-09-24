# notes/budget.md

Owner of `tools/budget.mjs`, `bench/budget.mjs`, `test/budget.test.mjs`, `bench/verdicts/budget.json`
and this note (Board 10, item budget). The rule it serves is the BUDGETS line in the MANUAL.md
header (2026-09-23): a census of organism/scale-52000 took 62 GB private on a 64 GB machine and a
soak daemon wrote a 1 TB ledger.jsonl, both with no cap. Every number below was printed by
`node bench/budget.mjs`, `node --test test/budget.test.mjs`, or the one-off command named with it.

## What was built

`tools/budget.mjs`, a process budget wrapper:

    node tools/budget.mjs --ram-mb N --disk-mb N --cpu-s N --dir <watched dir> -- <command> [args]

- Spawns the command with stdio inherited and passes its exit code through (a signal death is
  128 plus the signal number, a missing command 127, a usage error 2).
- Every 2 s (`--interval-ms`) it samples EVERY process once. Windows: one long lived PowerShell
  running `Get-CimInstance Win32_Process` (no wmic), about 150 ms a query here; it exits when its
  stdin pipe closes. Linux and the P13 container: `/proc/<pid>/stat` for parent links, process
  group and CPU ticks, `/proc/<pid>/status` VmRSS and RssAnon for the tree.
- The tree is found by identity, pid plus creation time, never by pid alone: a child whose parent
  died keeps that dead pid as its ppid on Windows, and a stranger that reuses a pid is younger
  than the member that held it, so its children are refused.
- Sums working set (`--ram-metric ws`, the default; `private` or `max` also exist), CPU seconds
  per identity, and bytes under `--dir` (a stat walk; readdir only when a directory mtime moved,
  every file stat'ed every walk because an append does not move its directory's mtime; checked
  first: statSync sees the live size of a file another process holds open and appends to).
- One status line per `--status-s` (default 60). At a cap: `BUDGET KILLED <which> <value> over
  <cap>`, every pid of the tree terminated, re-sampled until none is alive, exit 137.
- Writes `state/budget/last.json` (`--record`): peak RSS, peak private, peak dir bytes, CPU
  seconds, wall, outcome, sample costs, and for a kill the pid tree and the kill timings.
- `--wait-free-ram-mb N` waits for free RAM before spawning (the rule says 16 GB).
- Library form: `budget(cmd, args, caps)` resolves to the record; `signal` (AbortSignal),
  `onSpawn`, `onSample` and `log` let `bin/serve.mjs` and benches drive it.

## The bar (bench/verdicts/budget.json, isTheBar true, barMet true)

`node bench/budget.mjs`, three planted children through the real CLI, each under BOTH caps
(RAM 300 MB, disk 50 MB), sampled every 2000 ms; last run printed:

| case | cap | peak | outcome | time to kill after crossing |
|---|---|---|---|---|
| ram | 300 MB | 387.5 MB | killed, exit 137 | 0.43 s (child clock) to at most 2.31 s (wrapper bound) |
| disk | 50 MB | 63.0 MB | killed, exit 137 | 0.67 s to at most 2.28 s |
| pass | 300 / 50 MB | 90.2 / 5.0 MB | exit 0 | not killed |

The interval: the low end is the child's own clock (its own RSS or bytes written passing the
cap), the high end is dead-at-end-of-verifying-sample minus start-of-last-under-cap-sample, which
can only overstate. The bar is the high end under 5 s. After the runs the bench lists every
process itself: 0 of 4 killed pids alive among 356 listed.

## The control that failed first, and what it found

The first orphan test killed only the root of a planted tree and expected the grandchild to
survive, so the listing would be shown able to see an orphan. It did NOT survive: on Windows
libuv puts every non-detached child of a node process in a kill-on-close job object, so a node
grandchild dies with its parent whether or not anyone kills the tree. An orphan check on such a
tree proves nothing. The planted grandchildren are now spawned detached (as a python child or
any non-node descendant would behave); the bench's control line printed "a root-only kill of a
planted tree left 1 of 1 grandchild alive", and only then does "alive 0" after the wrapper's kill
mean something.

The same job object decides what happens when the WRAPPER is killed outright. A one-off script
(`scratchpad wrapper-killed.mjs`, not kept) printed: "wrapper dead, child dead, detached grandchild
ALIVE". So every run now starts a detached reaper fed over a stdin pipe (the tree's identities
after each sample, DONE at a clean end); if the pipe closes without DONE it kills the last tree
plus any descendants a fresh listing finds. The test with its control printed: "wrapper killed
outright: no reaper left ["grandchild"], reaper left []". `--no-reaper` turns it off.

## Cost

Last bench run: wrapper max RSS 45.0 MB, sampler peak working set 94.4 MB, reaper peak working set
41.5 MB, sample mean 151.6 ms every 2 s. Tests: 10 of 10 in 28.0 s (kill on RAM, disk and CPU, exit
code pass-through, orphans with a control, the reaper with a control, library abort, tree
identity, the dir walk, the parsers).

## Limits, so nobody quotes past them

- The Linux /proc path is exercised only by parser tests on fixture lines: this machine has no
  WSL and no docker. First run in the P13 container is the next rung.
- The default metric is working set, as specified. Windows trims working sets under memory
  pressure, which is exactly the MANUAL.md incident (85 GB committed, as the BUDGETS rule records
  it; not measured here); for a commit-heavy job use
  `--ram-metric max`, which caps on the larger of working set and private bytes.
- A descendant born, and whose parent died, inside one 2 s gap is not attributed on Windows
  (Linux catches it by process group). CPU spent after a process's last sample is not counted.
- Time to kill scales with the interval: the bound is about one interval plus two samples.
- A walk costing over a quarter of the interval is spread over several intervals
  (`walkEveryMax` in the record), which slows the disk cap on huge trees.

## Next rungs

Wrap the census and the soak with it (`--ram-mb` at half of RAM, `--disk-mb` on the state dir),
use the library from `bin/serve.mjs` in the cloud item, add a gate row that reads
`state/budget/last.json`, and run the tests inside the Linux container.
