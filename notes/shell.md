# shell: the timeout kill on Windows records the kill it made

board 23 builder, item shell-windows, 2026-09-26, his Windows 11 PC (Node v24.15.0, 32 CPUs). MODEL OFF. The Linux twin is notes/shell-linux.md (board 17); its /proc walk is untouched.

## The gap

The orchestrator's gate on this host printed pass=21 fail=1 for test/act-shell.test.mjs. Rerun by hand before any change, the failing case and its diagnostic, verbatim:

```
✖ a timeout on a child with 0 descendants still kills it and reports the timeout (1215.0195ms)
  AssertionError [ERR_ASSERTION]: a killed child has no exit code

  1 !== null
```

Why: on win32 killTree runs `taskkill /PID <pid> /T /F`. taskkill ends every process of the tree with TerminateProcess(h, 1) from OUTSIDE libuv, so node never learns it was a kill: the close event carries exit code 1 and signal null, the same record a program that chose exit(1) leaves. The tree did go down; the run was written down as the wrong thing.

## The fix (act/shell.mjs, win32 branch only)

- killTree (win32): a module WeakSet FORCED holds every child this module ended with taskkill (status 0, or its own SUCCESS line names the child's pid). taskkill's lines are read by `taskkillReport(rootPid, spawnSyncResult)`: every line names the pid it ended (stdout) or could not end (stderr) as its FIRST number, in every language taskkill speaks, so no message text is matched. The report fills `res.tree` on win32 too: by 'taskkill', found, killed, rounds 1, rootKilled, status, and a note when taskkill exits non zero ('taskkill-partial' when the child died but a descendant was refused; 'taskkill-failed' falls back to libuv's own child.kill, which records the signal itself).
- settle: a forced child is recorded as `code null, signal 'SIGKILL'`, exactly what node writes for its own child.kill (libuv's kill is also TerminateProcess(h, 1)), and `forcedStatus` keeps the raw 1. A run nobody killed is untouched: a program that chooses exit 1 keeps code 1 (tested).
- The posix branch, the /proc walk and killPosixTree are byte for byte what board 17 left.

## Measured

Read before writing (bounded research):
- act/shell.mjs header and killTree, the tree's own prior attempt (taskkill /T /F with a child.kill fallback), and test 9's comment (a grandchild spawned detached false dies with its parent's job; only a DETACHED one needs /T).
- libuv src/win/process.c (v1.x, fetched): uv__kill ends SIGKILL/SIGTERM with `TerminateProcess(process_handle, 1)`; uv_process_kill sets `process->exit_signal` only after its own kill succeeds; every child is put in a global job with JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE unless UV_PROCESS_DETACHED is set. That is why a detached grandchild survives a plain kill of its parent: it is in no job the parent's death closes.
- One web search on taskkill /T /F and TerminateProcess (result summaries of the Microsoft Learn taskkill and TerminateProcess pages, not the full pages): /T ends the process and every child it started; TerminateProcess takes the exit code the killed process reports, and it is asynchronous.

Scratch probes on this host (scratchpad/board23/shell-windows, deleted after):
- taskkill /T /F on a parent with a detached grandchild: node recorded code 1, signal null; grandchild alive after: false.
- child.kill('SIGKILL') on the same shape: code null, signal SIGKILL; grandchild alive after: true.
- taskkill /T /F with `/FI "PID ne <root>"` (to end only the descendants): "INFO: No tasks running with the specified criteria.", grandchild alive after: true. The filter removes the root from the selection and /T then has nothing to walk, so this route is closed.
- taskkill printed its SUCCESS lines descendants first and the child last; a lone node child still has one descendant here (a console host), so `found` counts it.

The bar, `node bench/shell-windows.mjs` under `node tools/budget.mjs --ram-mb 4000 --disk-mb 400 --dir bench/verdicts`, wrote bench/verdicts/shell-windows.json:
- bar run 1: exit 0, tests 28, pass 27, fail 0, cancelled 0, skipped 1, todo 0, wall 11785.479 ms
- bar run 2: exit 0, tests 28, pass 27, fail 0, cancelled 0, skipped 1, todo 0, wall 11787.518 ms
- tree kill case, both runs: grandchild alive during true, alive after false, bytes 15 then 15, code null, signal SIGKILL, forcedStatus 1
- control (plain kill), both runs: grandchild alive after true, bytes 3 then 8
- mutant run (forced-exit record off, served in memory by a load hook): exit 1, pass 24, fail 3 (the original failing case, the added tree kill case, the added closeShell case)
- isTheBar true, barMet true. Budget: wall 35.59 s, peak ram 391.5MB, peak dir 46.5MB.

A second mutant was run by hand (`/T` removed from the taskkill argv, same in-memory hook): fail 3, the added tree kill case printed "alive after true, bytes 34 then 38", and test 9 and the great-grandchild case failed with it. So both halves of the win32 path, the tree and the record, are graded by a case that fails without them.

The skipped case is the posix control (group kill only), which has no win32 meaning.

## Added cases (test/act-shell.test.mjs, 5)

- a program that chooses exit 1 keeps its code 1 (all platforms): the forced record never masks a real exit.
- win32: the timeout kill ends a detached grandchild whose pid was alive DURING the run (read from its own pid file while the run is in flight) and is not alive after; code null, SIGKILL, forcedStatus 1, reason with no failure note. A survivor is ended in a finally, after it is measured.
- win32 control: a plain child.kill leaves the same detached grandchild alive and writing; node records that kill as code null and SIGKILL, the record the fix matches.
- a closeShell kill leaves no exit code on the answer (all platforms).
- taskkillReport on every row kind: all ended (the lines this host printed), a descendant refused, the root not found, taskkill missing, a German line.

## Limits

- Test 9 and the great-grandchild case register their survivor kill with t.after AFTER newTmpDir's rmSync; when the tree kill regresses, the rm throws EPERM on the dir the survivor holds open and the later hook does not run, so the survivors leak (measured under the /T mutant: 3 node processes, ended by hand). The added win32 cases end their own survivors in a finally. The two older cases are not edited here (a test is added, never rewritten).
- taskkill walks parent links at one instant and ends the child last; a child that spawns a new detached process between taskkill's walk and its own death is not reached. A job object per run (CREATE_SUSPENDED, AssignProcessToJobObject, KILL_ON_JOB_CLOSE, no breakaway) closes that window but needs native code Node does not expose.
- `forcedStatus` is present only on a forced win32 run; the posix result shape is unchanged.
