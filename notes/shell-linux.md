# shell-linux: the timeout kill takes the whole tree down on Linux

board 17 builder (the organism's item). Board 17, item shell-linux, 2026-09-26, cloud host (Linux 6.18.44, Node v24.9.0, 4 CPUs).

## The gap

test/act-shell.test.mjs test 9 ("a 10 second sleep is killed by a 1 second timeout, and its child dies with it") failed on this Linux host and passed on the Windows PC. Measured before the change: 18 of 19 passing, and the failing line printed "the grandchild stopped writing: the tree went down with the parent (13 then 22 bytes)".

Why: on posix act/shell.mjs spawns the child detached, so the child leads its own process group and session, and the old kill was `process.kill(-child.pid, 'SIGKILL')`. The test's grandchild is ALSO spawned with detached true, so it calls setsid and sits in a group and a session of its own. A process group kill alone never reaches it. On Windows, taskkill /T walks the parent links and took it down.

## The build (act/shell.mjs)

- `descendants(rootPid, procRoot)` reads every /proc/<pid>/stat in process (no ps, no pkill, no shell), builds the ppid map and closes every ppid chain rooted at the child, deepest first. A process whose parent already died lost its ppid link but keeps its session and group, so anything whose sid or pgid equals the child's pid seeds the walk too (a pid still in use as a session or group id is never handed to a new process). Never lists the root, this process or pid 1.
- `killPosixTree(rootPid, procRoot)`: FREEZE then KILL. SIGSTOP the child, walk, SIGSTOP every new descendant, walk again until a walk finds nothing new (a stopped process cannot fork, so the set closes; at most 32 rounds), then SIGKILL every descendant deepest first, the child, and the child's group.
- No readable /proc: the old group kill, and `res.reason` gains "; no readable /proc on this platform: the process group kill alone, which misses a detached grandchild". `res.killedBy` is 'tree' (walk) or 'group' (fallback); `res.tree` carries by, proc, found, killed, rounds.
- The Windows branch of killTree is byte for byte what it was; killTree only gained an optional second argument. `opts.procRoot` of runArgv exists for the tests (a motor signal cannot set it).

## Measured proof

- After: `node --test test/act-shell.test.mjs` 23 of 23 passing (19 old, 4 added), twice, in 9421.895 ms and 9443.545 ms (was about 2.7 s: the added cases wait on real processes).
- Test 9's scenario replayed by test/shell-linux-verdict.mjs, 3 alternating pairs: walk on, the grandchild read 9 then 9, 9 then 9, 8 then 8 bytes (grew 0); walk off (the control, the old group kill), 13 then 22, 13 then 22, 12 then 21 (grew 9 every time). Noise: growth spread 0 to 0 with the walk, 9 to 9 without.
- Added cases: a great-grandchild two detached levels down (19 then 19 bytes, and the grandchild 19 then 19); a child with 0 descendants still reports "killed by the 1000ms timeout" with found 0; the control case (group kill only: 13 then 22, reason says so); descendants over a planted /proc.

## Budgets and disclosure

Launched through `node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts` with `--max-old-space-size=4000` (the proposal's 6000 is his 64 GB PC; 4000 here). Peak ram 351.9 MB, wall 33.14 s. bench/verdicts/shell-linux.json was written twice: the first run (same numbers, barMet true) said "alive before and still after" of the walk arm, which misreads its own field; the script's sentence was corrected and the run repeated once.

## Limits and next rung

A grandchild that called setsid AND whose parent exited before the kill has no ppid, sid or pgid link left to the child; /proc cannot attribute it. Next rung: a cgroup per run (kill the cgroup), or a child subreaper (prctl PR_SET_CHILD_SUBREAPER, which Node cannot call without native code). macOS has no /proc and takes the fallback.
