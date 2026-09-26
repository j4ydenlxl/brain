# gate-slow: test files the gate timed over 15000 ms (board 17)

## test/budget.test.mjs (gap gate-slow:test/budget.test.mjs)

Author: board 17 builder (the organism's item). Verdict: bench/verdicts/gate-slow-budget.json (at 2026-09-26T21:26:35.768Z, isTheBar true, barMet true), written by `PATH=$HOME/node24/bin:$PATH node test/gate-slow-budget-bar.mjs`.

- Ledger: 30574 ms in the gate on his PC, bar 15000 ms. This host's gate.json row (2026-09-26T20:53:54.217Z, v24.9.0): 15226 ms, 9 of 10 pass (the reaper control expected the Windows survivor list).
- Bar runs (trial command in the tree, `--ram-mb 4000` and `--max-old-space-size=4000` here instead of the proposal's 6000 on this 16 GB host, plus `--record <tmp>/budget-record.json` to keep the record out of state/): 3353 ms and 3435 ms wall, 10 of 10 pass. Control (the same command on the file at 8a55dc4): 15229 ms and 15216 ms, 9 of 10 pass. Noise 82 ms (bar arm), 13 ms (control arm); gap 11829 ms.
- What the slow tests waited on: the wrapper's default 2000 ms sample period; caps needing about 2 s of planted allocation (RAM 300 MB, disk 50 MB, CPU 1 s); fixed sleeps of 3500 ms per reaper arm (two arms in series) and 2500 ms before the abort.
- Changes (test/budget.test.mjs only): every wrapper samples every 100 ms (`--interval-ms` / `intervalMs`, flags tools/budget.mjs already had; tools/budget.mjs unchanged); caps RAM 200 MB, disk 10 MB, CPU 0.5 s, each still crossed by the planted child's own work; the fixed sleeps became the event they stood for (a sample or status line listing the grandchild, a listing where the tree is gone, bounded by the old wait); the two reaper arms run side by side and are judged in one listing; the exit-code runs start at once. Every assertion kept; the killed-line regexes now escape the cap's dot.
- Linux fix: the reaper control now expects `['child', 'grandchild']` on Linux (nothing takes the wrapper's direct child down there) and `['grandchild']` on Windows (kill-on-close job), exact on both.
- Under four CPU burners the file passed 10 of 10 in 4150 ms (runner duration_ms).
- Next rung: the gate on his Windows PC re-measures the row (the unseen host).

## test/autopilot.test.mjs (gap gate-slow:test/autopilot.test.mjs)

Author: board 17 builder (the organism's item). Verdict: bench/verdicts/gate-slow-autopilot.json (at 2026-09-26T21:47:25.226Z, isTheBar true, barMet true), written by `PATH=$HOME/node24/bin:$PATH node test/gate-slow-autopilot-bar.mjs`.

- Ledger: 36209 ms in the gate on his PC, bar 15000 ms. Budget caps 4000 MB here (the proposal says 6000, his 64 GB PC); `--record <tmp>/budget-record.json` keeps the record out of state/.
- Bar runs (trial command in the tree): 11717 ms and 10340 ms wall, 34 of 34 pass. Control with every speed change off (HEAD f50959c plus the host fixture alone): 52330 ms and 45780 ms, 34 of 34. Noise 1377 ms (bar), 6550 ms (control); gap 38026 ms. HEAD exactly: stopped at the 150000 ms cap, its first soak test failed at 120003 ms.
- What it waited on, first timing on this host: six tests awaiting the planted soak hit their 120 s timeout because self/improve.mjs runs each trial under tools/budget.mjs with a wait for WAIT_FREE_RAM_MB = 16384 MB free (never true on 16 GB); the slow test 6594.9 ms (four runs of a 1500 ms planted test); the real gate test 2483.3 ms (five bench/gate.mjs runs); the soak walls (9048.7, 6004.3, 3029.7 ms); about 110 ms per `node --test` spawn.
- Changes (test/autopilot.test.mjs only; self/autopilot.mjs unchanged): free RAM reads at least that wait while the planted soak runs (a host fixture, a no-op above 16 GB free); the planted soak, the real-gate runs and the two slow-test runs start before the first test (the last three on worker threads) and a yield before each test lets the soak reap its trials; the tests that wait sit in one concurrent suite at the end, the CLI tests spawn without blocking; soak walls 0.1, 0.05 and 0.01 plus 0.05 minutes, each still fitting the rounds it asserts, every wall assertion reading its wall; fixture gates run with `--test-isolation=none`. No test deleted, no assertion lowered.
- test/gate.test.mjs: 7 of 7 pass.
- Next rung: self/improve.mjs should size its free-RAM wait to the host (16384 MB never frees on a 16 GB machine, so the organism's own soak trials wait 1800 s there); then the gate on his PC re-measures the row.
