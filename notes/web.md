# notes/web.md: the site (web/ + test/web.test.mjs)

The claim web/ makes is parity: the organism is not shipped to the tab as a snapshot, it is
grown there by a port of `seeds/organism.mjs`, and `test/web.test.mjs` builds both sides at
the same parameters and compares cell count, edge count and a sha256 over every (src, dst,
delay) triple in edge order. Parity is therefore a coupling: a change to the node seed that
nobody carries across to `web/src/organism.js` is a RED gate, which is exactly what it is
for.

## 2026-09-17 (Thu Sep 17 17:30:30 EDT 2026): the gate went RED on parity, and the cause
was today's roster growth in the node seed

`bench/verdicts/gate.json` records the RED at `2026-09-17T19:37:12.070Z` with three failed
assertions in `test/web.test.mjs`. Run here, the three came back verbatim as:

    parity: the same seed builds the same organism in the browser port
      AssertionError: edge count at majors 40 / 3355 !== 3395
    parity: cell identity, kind, region and circuit agree cell for cell
      AssertionError: cell 10 kind / + 'encode.hv' - 'grid.rotate'
    parity: ports and delays agree edge for edge
      AssertionError: Expected values to be strictly equal / 3355 !== 3395

All three are one cause. `ls -l --time-style=full-iso` puts `seeds/organism.mjs` at
`2026-09-17 15:11:25.878718200 -0400`, twenty six minutes before the RED, and
`web/src/organism.js` at `2026-09-16 22:19:31.571061000 -0400`, the day before. The node
seed grew its perception roster by the six grid kinds `grid.rotate`, `grid.flip`,
`grid.transpose`, `grid.crop`, `grid.translate`, `grid.tile` (its own comment says this was
so that the grid suite is reachable from a region roster at all) and its cognitive roster by
`seq.fit`. The browser port still carried the two old rosters. A roster is cycled in order
across the majors of a region, so a roster short by six entries puts a different kind in
every major past the tenth cell, which is the `cell 10 kind` failure, and a different kind
set is a different acceptor index, which is the 3355 against 3395 edge failure.

The fix is the port, not the test. `web/src/organism.js` now carries the same two rosters in
the same order, and `web/src/kinds.js` gained the seven rows the new roster entries need:
`grid.crop`, `grid.flip`, `grid.rotate`, `grid.tile`, `grid.translate`, `grid.transpose`,
all `in:event` and `out:event`, and `seq.fit`, `terms:event` and `next:event`. The port
specs were taken from the node registry by reading `getKind(name).ports`, and the test
compares them character for character against that registry on every run, so they cannot be
guesses. The browser update for the grid kinds is a new `inert` entry that runs and emits
nothing: the node grid cells guard on a payload that is a grid, nothing in the tab ever
injects one, so a cell that runs and says nothing is what the node cell does here rather
than a stub. `seq.fit` reduces to the existing `predict` update.

One assertion moved, and only one. `test/web.test.mjs` held `assert.equal(checked, 47)` as a
floor against a kind quietly leaving the browser table; the table is seven kinds larger now,
so the line reads 54, which is the number the test itself printed (`ports checked  54 kinds,
all matching the node registry`). It follows the builder who edited `seeds/organism.mjs` at
15:11 today. Nothing that compares the two sides was weakened.

Measured after the fix, from `bench/verdicts/web-red.json` (written at
`2026-09-17T21:20:20.939Z` by the script that ran the builds):

    ports checked 54
    majors 7    cells 56/56    edges 309/309    hash e63b585c51d8d19d/e63b585c51d8d19d  cell10 hv.bind/hv.bind
    majors 40   cells 320/320  edges 3395/3395  hash 7332de144a050280/7332de144a050280  cell10 grid.rotate/grid.rotate
    majors 60   cells 480/480  edges 5165/5165  hash 4bcc09451c39b1e6/4bcc09451c39b1e6  cell10 grid.rotate/grid.rotate
    majors 120  cells 960/960  edges 10681/10681  hash 90e78e53d9c84168/90e78e53d9c84168  cell10 grid.rotate/grid.rotate
    web.test pass 11 fail 0
    bundle  index.html 3347 bytes, app.js 63425 bytes, total 66772 bytes (target 163840, cap 225280)

The bundle is rebuilt by the test itself (`write()` in `web/build.mjs`), so `web/dist/app.js`
and `web/dist/index.html` are the current organism, 66772 bytes of site against a 225280 byte
cap. `node tools/numbers.mjs` was re-run and reported `2457 rows from 31 verdict files
written to docs/NUMBERS.md`, which now indexes `web-red.json`.

The gate. Run twice from the brain directory with `node bench/gate.mjs`. Both runs report
`test/web.test.mjs pass=11 fail=0`, and both are RED on one other file:

    GATE RED: test files 32/33, assertions 541 pass / 0 fail, authored code lines 59713 in 233 files, prose lines 34828, generated organism lines 507145 in 129 files, em-dash files 0, bad imports 0

The RED is `FAIL test/speed.test.mjs pass=null fail=null 600024ms`: the file is killed by the
gate's own six hundred second per file timeout, so node never prints its summary and the
gate parses pass and fail as null. Isolating one of its four failing tests with
`node --test --test-name-pattern "a weight of one per cell" test/speed.test.mjs` gives the
assertion in 202.5176 ms:

    test at test\speed.test.mjs:71:1
    AssertionError: 4 shards: weighting made the weight imbalance worse, 1.024 to 1.055

That is `test/speed.test.mjs` line 103, over `runtime/partition.mjs`, and the other three
failing names are the cluster equivalence tests in the same file. None of it is web/. Both
gate runs happened after the web fix, so I cannot show from a run of my own what
`test/speed.test.mjs` did at 15:37; what I can show is that it is the only failing file in
both of my runs, that its mtime is `2026-09-17 07:45:36.026724000 -0400`, hours before
anything I did, and that nothing it imports is a file I edited. It is not mine to touch and
I have not touched it. One warning for whoever picks it up: `bench/gate.mjs` overwrites
`bench/verdicts/gate.json` on every run, so the 15:37 record of the RED that started this is
gone, replaced by mine.

What I request from core. The coupling that broke today is real and worth keeping, but it is
discovered only by a full gate run. A one line check that hashes the roster tables of
`seeds/organism.mjs` and compares that hash to the one `web/src/organism.js` declares would
name the drift in the seed edit itself rather than twenty six minutes later in an unrelated
builder's gate. Second: every kind a region roster names must exist in two tables, the node
registry and the browser table, and nothing today told the seed editor that. A single
exported list of roster kinds that both sides import would make the browser table a
derivation instead of a copy that has to be remembered.

## the findings page (2026-09-17)

`dilation.dev` now carries the research findings at `/findings/`, generated by
`tools/findings.mjs` from the template `web/src/findings.html` into
`web/dist/findings/index.html`. `web/build.mjs` calls it inside `write()`, so the page is
rebuilt by `node web/build.mjs` and by every test that builds the bundle; there is no second
command to forget.

What it reads, at generation time and never from a cache: every `bench/verdicts/*.json`, the
index `docs/NUMBERS.md`, the opening paragraphs of `docs/PORTFOLIO.md`, every `notes/*.md`,
and the soak's own `state/soak/meta.json` with the sizes of its files. It does not open
`state/soak/control.json`: that file holds a token, and nothing here reads a credential
value.

The page is one card per verdict: the command that writes that verdict, its measures, its
date and the paragraph where a builder wrote it up. A section titled retractions and nulls
holds, on the same page and above the soak rather than at the bottom of it, every verdict
that carries a RED or FAIL string, a refuted or failed count above zero, a negative value on
a key that means a gain, or prose in its own voice saying it was refuted, retracted, or did
not clear its bar.

The claim the page makes about itself is enforced, not asserted in prose. Every value is
emitted through an element that records where it was read (`data-src` a verdict field or a
soak field or a count this run printed, `data-path` a measure name, `data-quoted` a file the
text must be verbatim in, `data-cmd` a file that must exist, `data-name` a verdict file that
must exist). `trace()` then re-parses the finished page and throws unless every one of those
resolves, and it throws if a single digit is left anywhere else, which is why the static
prose in the template carries no digits at all. Running the generator against an untraceable
page is how it fails: the build fails with it.

Measured in this run. `node web/build.mjs` printed:

    dist index.html      4084 bytes
    dist app.js         63425 bytes
    dist TOTAL          67509 bytes   target 163840, cap 225280
    dist findings/index.html  104368 bytes   40 verdicts, 392 values, 11 null or negative

`node --test test/findings.test.mjs` printed 8 tests, 8 pass, 0 fail, and these lines:

    generator  verdicts 40  measured 29  nulls 11  values 392  bytes 104368
    cards      40 cards for 40 readable verdict files
    traced     430 values from verdict fields, 5 from the soak state, 7 printed by the run
    prose      0 untraced digits outside a sourced element
    quotes     31 verbatim quotations, 29 commands naming a file on disk, 5 quoted from a command field
    control    3 perturbations rejected: a bent number, a false quotation, a loose digit
    link       dist/index.html to findings/, and back
    discipline 5 files checked, 0 em dashes

The verdict count moves while you work: it was 39 an hour ago and 40 when this note was
written, because other builders are landing benches as the page is built. That is the design,
not drift. Nothing is cached.

The control line is the one that matters. A tracer that passes everything proves nothing, so
the test bends one integer on the written page by one, adds a sentence nobody wrote to a
quotation, and drops a bare digit into a heading, and requires the same parse to reject all
three. It does. The other seven tests re-read the verdicts themselves rather than trusting
what the generator returned.

`node --test test/web.test.mjs` after the change: 11 tests, 11 pass, 0 fail, `bundle
index.html 4084 bytes, app.js 63425 bytes, total 67509 bytes` and `discipline 11 files
checked, 0 em dashes, 0 node imports in web/src`. The site itself grew by the findings link
only; the findings page is a separate file under `dist/` and is not counted against the
225280 byte bundle cap, and `tools/deploy.mjs` walks `web/dist` recursively, so it ships.

The link. `web/src/index.html` gained one anchor, `<a id="findings" href="findings/">`, a
glass pill above the majors control at every width, placed before `#boot` in the DOM so the
growing overlay covers it. Back the other way the findings page links to `../`.

What the page reads off the soak as I write this: ticks 341,488, cells 1679, edges 143,171,
live edges 102,589, checkpoint 241,254,522 bytes saved at 2026-09-18T02:37:26.975Z, 0
snapshots kept, 1 ledger file. Those move every time the page is built, which is the point
of reading them at generation time.

Two honest limits. First, the printing command is derived, not declared: 5 of the 40 verdicts
carry a `command` field of their own, so for the rest the generator finds the source file in
the tree that contains the verdict's own file name and prints `node <that file>`, falling
back to the test file the verdict names, and saying the command is not recorded rather than
inventing one. 29 cards name a file that exists on disk, 5 quote a command field, and the
remainder say nothing. A `command` field written by each bench would make this exact instead
of derived, and that is a one line change in each bench, not in this generator. Second,
`docs/NUMBERS.md` is read but never taken from: a stale index must not be able to set what
the page says, so the comparison is on bench and measure only, and the page reports the
overlap it found, 346 of the shown measures indexed out of 2655 rows.

## the findings page, finished: the intro and the note picker (2026-09-17)

Picked this up where the previous builder left it. The generator, the template, the HUD
link, the build call and the eight tests were already there and already green, so this is
not a rewrite of that section above: it stands, and what follows is the two defects I found
by reading the page rather than the code, plus the numbers this run printed.

The intro was quoting the wrong paragraphs. The contract asks for what the brain is, taken
from the opening paragraphs of `docs/PORTFOLIO.md`, and taking "the first paragraphs"
literally put that document's own provenance note at the top of a public page: "Written
2026-09-17 in the form he asked for (his Tesseract write-up is the sample, kept in
manual/tesseract-portfolio-sample.md)". That names internal files and an unexplained "he",
and it says nothing about the brain. `intro()` now starts at the first paragraph that states
the subject, and the subject is read off the H1 rather than hardcoded, so a reordering of
that document cannot silently put the preamble back. If no paragraph states the subject it
throws instead of falling back. The page now opens on "BRAIN is a computational organism,
not a model." The test names the paragraph it replaced and fails if the intro ever quotes it
again, and it also fails if that document stops opening with a provenance note, because at
that point the rule needs rechecking rather than silently still passing.

The note picker was scoring the wrong thing. It took the paragraph mentioning the verdict
file that carried the most digits, on the reasoning that the paragraph reading the
measurement carries more numbers than the one listing which files were touched. An ISO
timestamp has 17 digits, so the provenance line won: 6 of 40 cards showed "Verdict
bench/verdicts/act-llm.json, written at 2026-09-17T21:28:08.424Z by the script that ran each
of these", and 12 cards had no note at all because the write-up paragraph named the bench
and not the verdict file.

The objective sets the answer, so I changed the objective rather than the threshold. A note
is now the prose paragraph, naming the verdict file or the verdict itself, that quotes the
most of that verdict's own distinctive values. Distinctive means the small integers are not
counted: nearly every verdict holds a 0 and a 1, and matching on those would have made
"quotes the measurement" true of any paragraph at all, which is a check true of anything.
Command lines, table rows and bullets are not candidates, tested after the backticks are
stripped because a command inside backticks slipped past the first version of that filter.
A paragraph quoting none of the verdict's values is not about that measurement, so the card
carries no note rather than an unrelated sentence. The truncation is number-aware: the cut
reaches past the first value the paragraph was chosen for and never lands mid word, so a
card cannot show the half of a sentence that has no measurement in it.

Measured over all 40 verdicts before changing anything, with the candidate rules run side by
side rather than one after the other. Scoring by raw digit count with the wider candidate
set scored higher on 35 of 40, but read worse: it picked command lines and one shared gate
summary for 7 different cards, which is what a max-digits objective buys. The rule that
landed gives 30 cards a note that quotes their own verdict and 10 cards no note, against 28
cards with a note under the old rule of which 6 were the clock.

What the commands printed in this run.

    node web/build.mjs
    dist index.html      4084 bytes
    dist app.js         63425 bytes
    dist TOTAL          67509 bytes   target 163840, cap 225280
    dist findings/index.html  106474 bytes   40 verdicts, 392 values, 11 null or negative

    node --test test/findings.test.mjs      tests 10, pass 10, fail 0
    generator  verdicts 40  measured 29  nulls 11  values 392  bytes 106474
    cards      40 cards for 40 readable verdict files
    traced     430 values from verdict fields, 5 from the soak state, 7 printed by the run
    prose      0 untraced digits outside a sourced element
    quotes     32 verbatim quotations, 29 commands naming a file on disk, 5 quoted from a command field
    control    3 perturbations rejected: a bent number, a false quotation, a loose digit
    notes      30 cards quote their own verdict, 10 carry none rather than an unrelated paragraph
    intro      2 paragraphs of docs/PORTFOLIO.md, opening on what BRAIN is
    link       dist/index.html to findings/, and back
    discipline 5 files checked, 0 em dashes

    node --test test/web.test.mjs           tests 11, pass 11, fail 0
    bundle  index.html 4084 bytes, app.js 63425 bytes, total 67509 bytes (target 163840, cap 225280)
    discipline  11 files checked, 0 em dashes, 0 node imports in web/src

Two tests are new, and both grade against what they replaced rather than against themselves.
The note test fails if any card quotes a note carrying none of its verdict's values, and
counts the provenance lines separately so the old failure mode has a named zero. The intro
test holds the replaced paragraph as its control.

The page byte count moves between builds and that is the design. This run read the soak at
ticks 348,488, 1,679 cells, 143,425 edges, 102,589 live edges, a 233,948,008 byte checkpoint
saved at 2026-09-18T02:49:28.186Z, 0 snapshots kept and 1 ledger file, and it read 40
verdict files. Both move while the page is being built, so two builds a minute apart print
different sizes. Nothing is cached, and the generator opens `state/soak/meta.json` and file
sizes only; it never opens the control file, which holds a token.

One thing I watched happen and did not fix, because it is not a defect. Mid session a
builder wrote `bench/verdicts/planes-smoke-verify.json`, the page built a card for it, and
the file was gone a minute later, leaving a built page naming a verdict that no longer
existed. The next build dropped the card. The page is a snapshot of a moving tree and the
director builds before deploying, so this self corrects; it is worth knowing that a page
left sitting for an hour can name a file that has since gone.

Still open. The printing command is still derived rather than declared for 35 of 40
verdicts, exactly as the section above says: a `command` field written by each bench is a
one line change per bench and would make this exact. And 10 cards carry no note, not because
the generator cannot find one but because no note paragraph quotes those verdicts' numbers,
which is a gap in the notes rather than in the page.

## the ladder page and the live daemon view (board 11, item "site", 2026-09-24)

What landed. `/ladder` is rendered at build time by `web/ladder.mjs` from `bench/verdicts/ladder.json`
and the public verdicts (the files matching `public-gsm8k*`, `public-humaneval*`, `public-arc*`, `grid-evaluation*`, plus
`native.json` / `native-partial.json` and `years.json` / `years-partial.json`). For each set the page shows:
- the organism, model-alone and null rows with their intervals, drawn on a ruler;
- the published rows each verdict keeps, with their sources and read times, with the local-model bar and the
  frontier bar marked by the ladder board's own rule;
- the ladder board's comparisons and answer classes (model in s, native in us, direct in ns), shown only when the
  board read the same primary file the page chose, and otherwise the stale file is named.

The rest of the page:
- The native card reads fields by name and shows the field path beside each value.
- The years card draws `runs[]` and `control` from `bench/years.mjs`: organism-years, wall ms, per-second rate (the field `years.generationsPerSecond`, with the declaration quoted), and each run's arithmetic and projection sentences.
- The P15 rows and the daily ruler come from `ladder.json`.
- The look is the organism page's: dark, serif italic headings, glass pills, a slight glow, no fog.
- Every value is a span carrying `data-src="bench/verdicts/<file>:<field>"`. Hovering shows the file and field; tapping pins them in a panel.

Missing and partial:
- A set with no verdict renders "not measured", with no digit anywhere in its card.
- A verdict counts as partial if its name ends -partial, isTheBar is false, complete is false, or n is below of.
- A partial verdict shows the pill and its sample size, both traced to its own `n` and `of`.

The organism page:
- It gains a ladder pill above portfolio and findings.
- Its state panel polls `health` on its own origin: every 5 s while a daemon answers ok, every 30 s otherwise, and never from a hidden tab.
- It shows the daemon's tick, ticks/s, uptime, restarts, budget kills, rss, checkpoint, instances alive and native share. When nothing answers it shows "daemon not running" with the reason.
- `web/serve.mjs` is the same-origin proxy that makes the running case real on this machine: it serves `web/dist` and answers GET `/health` only, from the daemon's endpoint.

The bar command, run through the budget wrapper after a free-RAM check (38.3 GB free):

    node tools/budget.mjs --ram-mb 6000 --interval-ms 1000 --no-record -- node --max-old-space-size=6000 web/ladder-bar.mjs

    dist ladder/index.html    148662 bytes   722 numbers traced in 570 spans from 9 verdict files; gsm8k partial, humaneval partial, arc whole; native not measured, years partial
    pages built: 4 (index.html, findings/index.html, portfolio/index.html, ladder/index.html)
    [walk] web/dist/ladder/index.html: 148662 bytes, 722 numbers traced in 570 spans (709 in 483 field values, 1 in 48 field-path labels, 12 in 39 file names) from 9 verdict files; 0 untraced, 0 em dashes; "not measured" 23 times, partial pills 10
    [test] fixture (humaneval missing, gsm8k partial): 68819 bytes, 324 numbers traced in 229 spans (315 in 214 field values, 0 in 0 field-path labels, 9 in 15 file names) from 3 verdict files
    [test] test/web-ladder.test.mjs: exit 0, tests 4, pass 4, fail 0, 68.704 ms
    [test] test/web-daemon.test.mjs: exit 0, tests 4, pass 4, fail 0, 102.3015 ms
    [bar] MET: build exit 0, pages built: 4 (index.html, findings/index.html, portfolio/index.html, ladder/index.html); ladder page 148662 bytes, 722 numbers traced, 0 untraced, 0 em dashes; web-ladder tests 4/4, web-daemon tests 4/4
    [verdict] bench/verdicts/web-ladder.json written (isTheBar true, barMet true); runner peak rss 57.3 MB, wall 0.8 s
    BUDGET done exit 0: wall 0.92 s, peak ram 137.2MB, cpu 0.17 s, 1 samples

How the numbers are counted:
- The walk is `web/ladder-walk.mjs`, written to share no code with the generator: its own tokenizer, entity decoder, field resolver and formats. It counts every run of digits in the page text.
- 722 is all of them.
- 709 sit in field values.
- 1 sits in a field-path label: the label is the path itself, and the walk checks that the path exists.
- 12 sit in file names such as `public-gsm8k-partial.json`: the walk checks that the file exists.
- Not one digit sits outside a traced span.

The test's controls prove the walker is not a rubber stamp. It rejects each of these:
- a bent number;
- a loose "42";
- a span whose path does not exist;
- a file span naming no file;
- markup inside a span.

Two rulers:
- Development: every build, render and test run before 08:32:55Z. The page, the walker and both tests changed between those runs, and none of their counts is quoted here.
- Development also: one `--dev` run of the bar runner, which printed MET. Its `web-ladder-partial.json` was removed before the bar run, so only the bar file stands.
- The fixture renders in the test are fixtures. They prove the missing and partial paths, and their counts describe copies in a temp directory, not the site.
- The one record: `bench/verdicts/web-ladder.json`, written once. The runner refuses to start when it exists.

Checked by eye in the preview:
- At 1280 wide the page has no page-level horizontal scroll: the wide published table scrolls inside its own box. That box was widened after the first look, where source URLs had wrapped one character per line.
- At 375 wide the document is exactly 375 wide, and a tap pins the trace panel (for example `public-gsm8k-partial.json`, field `of`, 1319).
- The organism page at the static preview server printed "daemon not running" with "nothing answers /health here (HTTP 404)".

Still open:
- No daemon is deployed next to dilation.dev, so the live view there will always read "daemon not running". That is true, and it is also the only thing it can say until a daemon and a same-origin `/health` sit behind the site.
- `daemon/health.mjs` sends no CORS header, so a page on another origin cannot read it directly; `web/serve.mjs` is the local answer.
- `native.json` did not exist at the bar run. Only `native-before-partial.json` (the native builder's baseline, `--before`) was on disk; the card names it and does not read it as the result.
- `years-partial.json` (a 3 s development run of `bench/years.mjs`) is shown as partial. Its per-second rate comes from 3 s runs, not the 300 s bar.
- The page is a snapshot of verdicts other builders are still writing: the next build will print different counts, and that is the design.
- The per-set native and direct shares on this page come from the ladder board's answer classes in `ladder.json`:
  - GSM8K and HumanEval: native 0 of 6 and direct 0 of 6, so their times read "not measured";
  - ARC: native 400 of 400, all 400 inferred rather than recorded by provenance, with `latency` 2463523.05 in unit us; direct 0 of 400.
  No set has a direct hit yet, so no nanosecond figure is on the page.
