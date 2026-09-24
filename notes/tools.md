# notes/tools.md

Working notes for the tools under `tools/`: the observability trio (`trace.mjs`, `inspect.mjs`,
`diff.mjs`), the number index (`numbers.mjs`) and the document checker (`docs-numbers.mjs`).
One dated section per piece of work. Every number here was printed by a command in the session
that wrote the section, with the printed line pasted next to it.

## 2026-09-17, docs-numbers finished, and the ISEF documents stopped quoting a tally that ages

I picked up `tools/docs-numbers.mjs` where a previous session was cut off. The tool and its
fixture test were already on disk and the verdict `bench/verdicts/docs-numbers.json` (at
2026-09-17T19:14:56.965Z) recorded the two ISEF documents as clean, unprotected 0 each. They
were not clean. Running the tool as it stood printed this:

```
ISEF.md: protected=36 (weak 23) unprotected=3 allowed=1 skipped=130
  line 336: 472  |  passed, 472 assertions passed and 0 failed, on node v24.15.0. `bench/` now holds the bench
  line 369: 53,486  |  rather than described: `bench/verdicts/gate.json` counts 53,486 authored lines in 221
  line 369: 221  |  rather than described: `bench/verdicts/gate.json` counts 53,486 authored lines in 221
ISEF-REGISTRATION.md: protected=17 (weak 11) unprotected=1 allowed=0 skipped=38
  line 74: 472  |  last recorded gate run is GREEN: 30 of 30 test files, 472 assertions passed, 0 failed.
```

The cause is worth writing down because it is a class, not an incident. Every one of those
misses is a number the gate itself produces and the gate itself overwrites. The two documents
said the last gate run was GREEN with 472 assertions and 0 failures, and that the build was
53,486 authored lines in 221 files. By the time I read them the gate had run again. Reading the
current verdict printed:

```
gate.lines {"code":56334,"codeFiles":227,"generated":507145,"generatedFiles":129}
```

So the documents were not carrying invented numbers. They were carrying numbers that were true
once. That is the more dangerous failure, because it passes a reading and fails a check, and it
comes back every single time the gate runs. Protecting those values again by regenerating
`docs/NUMBERS.md` would have bought about one hour of correctness.

What I did instead: the two ISEF documents now cite the gate's verdict file for the tally and
for the line counts rather than reprinting either. Section 8 of `docs/ISEF.md` says the gate
writes the node version, the test files passed out of the test files run, the assertions passed
and failed and a GREEN or RED verdict to `bench/verdicts/gate.json` on every run, and says
plainly that the tally is not restated in the document because a reprinted tally is a claim
about the past dressed as a claim about the present. The scope-risk bullet in section 9 does the
same for the authored and generated line counts. `docs/ISEF-REGISTRATION.md` does the same in
its methodology bullet. One number in that file was also mislabelled: it called the universal
test's result assertions when node reports test cases, so it now says what the runner actually
prints. `node --test test/universal.test.mjs` printed:

```
ℹ pass 7
ℹ fail 0
```

The organism size in the scope bullet, 8,072 cells and 91,159 edges at 1,000 majors, stays. It
comes from `bench/verdicts/whole.json` and `bench/verdicts/speed.json`, it is protected today,
and the sentence now says out loud that it stands until that bench runs again.

After the edits the same command printed:

```
ISEF.md: protected=31 (weak 19) unprotected=0 allowed=1 skipped=130
ISEF-REGISTRATION.md: protected=14 (weak 8) unprotected=0 allowed=0 skipped=38
docs checked 2, documents with an unprotected number 0, unprotected total 0
```

Three things were missing from the work and are now built, each with its test in
`test/tools.test.mjs`.

First, nothing tested the real documents. The only existing test drove the checker against a
synthetic fixture tree it built itself, which proves the tool works and proves nothing at all
about the files this repository ships. A fixture cannot go stale; a shipped document is the only
thing that can. There is now a test that runs `checkDoc` against the live `docs/ISEF.md` and
`docs/ISEF-REGISTRATION.md` with the live `docs/NUMBERS.md` and the live `bench/verdicts`, and
asserts unprotected is 0 and protected is above 0 for each. Because `test/` is what
`bench/gate.mjs` runs, the ISEF documents are now gate-enforced. That test would have failed on
the state I inherited.

Second, nothing tested the stale case, which is the case that actually happens. There is now a
test that writes a fixture verdict carrying a value, checks the document quoting it is protected,
overwrites the verdict the way a second bench run would, and checks the same document value is
now reported unprotected with its exact token.

Third, the tool walked a hand-typed list of six document names. A typed list is correct the day
it is typed and silently stops covering the population the moment somebody adds a document: the
new file is never opened and the tool still prints a clean run, which is the worst thing a
checker can do. `defaultDocs()` now reads the markdown files off `docs/` and excludes only the
generated `NUMBERS.md`, by name so the exclusion is visible, and a test asserts the default set
equals what is on disk and that a document dropped into a fixture `docs/` is picked up without
anyone editing the tool.

Measured. `node --test test/tools.test.mjs` printed:

```
ℹ pass 14
ℹ fail 0
```

`node tools/numbers.mjs`, run last so the index carries the second gate run, printed:

```
... 2655 rows from 36 verdict files written to docs/NUMBERS.md
```

The verdict writer, run against that index, printed at the timestamp it produced itself:

```
{"protected":389,"unprotected":10,"documentsClean":3,"documentsTotal":6,"isefDocumentsClean":2}
at 2026-09-17T21:45:17.820Z allowlistEntries 13 verdictFilesRead 35 knownValuesFromVerdicts 7367
ISEF.md: protected=31 (weak 19) unprotected=0 allowed=1 skipped=130
ISEF-REGISTRATION.md: protected=14 (weak 8) unprotected=0 allowed=0 skipped=38
PORTFOLIO.md: protected=157 (weak 79) unprotected=6 allowed=0 skipped=5
WHOLE.md: protected=133 (weak 76) unprotected=1 allowed=0 skipped=6
ARCHITECTURE.md: protected=45 (weak 38) unprotected=3 allowed=0 skipped=57
GLOSSARY.md: protected=9 (weak 8) unprotected=0 allowed=0 skipped=31
```

The unprotected 10 is not mine and is not hidden. It belongs to `PORTFOLIO.md`, `WHOLE.md` and
`ARCHITECTURE.md`, which this builder reports and does not edit. Their misses are recorded value
by value with line numbers in `bench/verdicts/docs-numbers.json` so whoever owns those files can
work from the list rather than rediscover it. That count is also a moving target while other
builders are writing: an earlier run of the same writer, at 2026-09-17T21:34:40.728Z, printed
`{"protected":371,"unprotected":27,"documentsClean":3,"documentsTotal":6,"isefDocumentsClean":2}`
against an index built from 35 verdict files instead of 36. The ISEF count was 0 in both.

A regression test that has never failed is not a test, so I ran it against the defect it was
written for. Injecting the sentence the inherited document carried, that the last gate run
passed 472 assertions and 0 failed, into `docs/ISEF.md` and running the file printed:

```
ℹ pass 13
ℹ fail 1
  AssertionError [ERR_ASSERTION]: ISEF.md publishes a number that is in neither docs/NUMBERS.md nor any bench/verdicts file: [
```

Restoring the file from the copy taken before the injection printed `ℹ pass 14`, `ℹ fail 0` and
`cmp` reported the file restored byte for byte. The test catches the exact defect that was here.

The gate. Two full runs of `node bench/gate.mjs`, both RED, both on the same file, which is not
one of mine. The second run, at 2026-09-17T21:44:43.626Z, printed:

```
GATE RED: test files 32/33, assertions 541 pass / 0 fail, authored code lines 59713 in 233 files, prose lines 34828, generated organism lines 507145 in 129 files, em-dash files 0, bad imports 0
```

The one failing file is `test/speed.test.mjs`, and the failure is a timeout, not an assertion.
The gate records it as `{"file":"test/speed.test.mjs","pass":null,"fail":null,"total":null,"exit":null,"ms":600024}`,
which is the gate's own 600,000 ms spawnSync cap killing the process before it reported anything.
Nothing failed inside it, because nothing inside it finished. The first run, at
2026-09-17T21:34:03.013Z, printed `GATE RED: test files 29/30, assertions 491 pass / 0 fail` with
the same file at `ms 600012`. `test/speed.test.mjs` is untracked and belongs to the runtime and
cluster work, so I left it alone. My own file is green in both runs: the gate recorded
`{"file":"test/tools.test.mjs","pass":14,"fail":0,"total":14,"exit":0,"ms":1843}`.

One thing I am not going to leave out. After the final regeneration of the index, one run of
`node --test test/tools.test.mjs` printed `ℹ pass 0` and `ℹ fail 1`. Zero tests ran, which means
the failure was at module load and not in any assertion, and I did not capture the error before
it went away. The next four runs printed `ℹ pass 14` and `ℹ fail 0` every time, and the gate run
above recorded the same file passing 14 of 14. The most likely explanation is a shared import
being written by another builder at that instant. It is recorded here because a run where zero
tests executed is not a passing run and should not be summarised as one.

What I request from core. Three things, in order of how much they cost.

The gate does not run the checker. The header comment of `bench/gate.mjs` says the gate scans
prose for numbers that no command printed, and it does not: there is no call to
`tools/docs-numbers.mjs` anywhere in that file or in `package.json`. Right now the only thing
enforcing a document is my test, and it only covers the two ISEF files, because those are the
files in my list. Either the comment should stop claiming a check the gate does not perform, or
the gate should run the checker over the whole document set. I did not edit `bench/gate.mjs`; it
is not mine.

The other four documents need an owner. `PORTFOLIO.md`, `WHOLE.md` and `ARCHITECTURE.md` are
carrying 10 numbers between them that are in neither the index nor any verdict, and most of them
look like the same staleness class I just cleared out of the ISEF pages rather than invention.
Until somebody clears them, the tool exits 1 on a full run, which means a nonzero exit stops
being information.

Last, a naming decision. The checker calls a protected value that is a small integer weakly
protected and prints that count separately, because `bench/verdicts` carries enough small
integers that a match can be coincidence rather than citation. On the ISEF pages 19 of 31 and 8
of 14 protected values are weak. That ratio says the protection on a small integer is close to
meaningless, and a future builder should decide whether a weak match should count as protected
at all, or whether small integers in prose need a different rule entirely. I did not change it,
because changing it would turn other people's documents red on a definition, not on a defect.
