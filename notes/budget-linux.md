# budget-linux: the reaper walks /proc on Linux

Author: board 17 builder (the organism's item), 2026-09-26. Verdict: `bench/verdicts/budget-linux.json` (isTheBar true, barMet true, at 2026-09-26T21:43:19.707Z, Node v24.9.0, this 4 CPU Linux host).

## What the gate row was

`bench/verdicts/gate.json` on this host (2026-09-26T20:53:54.217Z) read `test/budget.test.mjs` at 9 of 10 in 15226 ms. The failing assertion was the CONTROL of the reaper test (`expected ['grandchild']`, actual `['child', 'grandchild']`): the file at HEAD expected Windows' survivors, where libuv's kill-on-close job takes the direct child down. On Linux nothing takes anything down. The reaper arm itself printed `reaper left []`. The gate-slow budget item of this board had already made the expected survivors exact per platform in the working tree.

## What was built

- `tools/budget.mjs` `reapTree` (Linux only). It walks /proc before it kills anything, starting from the child and from every reported member still alive under its reported start time. Every ppid chain is followed, deepest first, with the child last. The walker is `act/shell.mjs` `killPosixTree` (the shell-linux item's), imported by name and lazily, inside the reaper only, so the wrapper never loads it. There is no ps or pkill. A re-listing by identity sweeps up anything left. With no readable /proc, or with a walker that does not load, it falls back to the old `reap()` (the group kill plus the reported pids), and its line says so. The Windows reaper runs `reap()` exactly as before.
- `test/budget.test.mjs`: one case added. A detached great-grandchild two levels below the child is born after the wrapper's only sample and dies with a wrapper killed outright. Two controls use the same shape and leave `["great-grandchild","grandchild"]` alive: the same CLI with no `act/shell.mjs` beside it, and `reapTree` with no readable /proc. The case is skipped on win32.

## Measured (node test/budget-linux-bar.mjs)

Direct runs: 11/11 in 4554 ms and 4546 ms. Wrapped runs (tools/budget.mjs --ram-mb 4000 --disk-mb 2048, TMPDIR at the watched dir, as the gate runs it): 11/11 in 4676 ms and 4624 ms. Noise was 8 ms direct and 52 ms wrapped. The row is 15000 ms. With the walk off: 10/11. With HEAD f50959c: 9/10 in 15229 ms. 4000 MB here, not the proposal's 6000: 16 GB host shared by builders.

## Open

The Windows side is unmeasured here. A detached descendant born after the last report stays out of reach once its whole chain to the child has died before the reap. The reaper's line goes to its own stderr, which a wrapped run ignores.
