# web-vision (board 24b): the vision counter and the live bar on dilation.dev

His orders: 2026-09-26 11:55 EDT "Listen vcs must yell"; 2026-09-23 "Put portfolio in dilation.dev ... up to date";
2026-09-26 20:20 EDT "I wouldnt declare the project EVER over until the vision is 100 percent fulfilled"; 21:03 EDT
"after tonight 'Yes. we are close. No lies'". docs/VISION.md orders 9 and 14.

## What was built

- web/build.mjs (portfolio and ladder section): after tools/portfolio-page.mjs writes the portfolio page, two blocks
  replace the template markers `<!-- vision-count -->` and `<!-- live -->`:
  - "The vision, counted": the line of bench/verdicts/vision-count.json, each status word with its count, the
    verdict's at and command, the rule sentence (over when MET equals the total and not before), and whether
    docs/VISION.md counts the same line when the page is built (stale named in words; same sha256 said in words).
  - "Live": from bench/verdicts/site-ask.json, the url asked, the tab nanoseconds per ask (min to max over the rows
    with no request), the server microseconds, the round trip, the run's at, the checks, and a GitHub run id only
    when the file carries one (fields githubRunId, runId, github.runId, github.run_id, run.id).
  - After web/ladder.mjs writes the ladder page, its header gains one line: the gate (gate.json) and the counter
    line, every value a traced span, checked with the ladder's traceCheck before it is written.
  - A missing, unparseable or wrong-shaped file prints "not measured" in its block, never a digit.
  - `node web/build.mjs --verdict` measures the pages it just wrote (read back from disk) and writes
    bench/verdicts/web-vision.json: 18 named checks, a control (the same builders over a directory that does not
    exist), split heldOut none.
- tools/vision-count.mjs --json: the verdict now carries source, sourceBytes and sourceSha256 of docs/VISION.md, so
  the page can say the count was made from the document as it stands.
- test/portfolio-page.test.mjs: 6 added cases; test/ladder-page.test.mjs: 5 added cases.

## Measured

Read before building: the tree's own prior attempt (an uncommitted web/build.mjs section, web/src/portfolio.html and
web/src/ladder.html markers and styles, no tests yet), tools/vision-count.mjs, tools/portfolio-page.mjs,
web/ladder.mjs (traceCheck, generateLadder), web/ladder-walk.mjs (the second walker), the two test files,
bench/verdicts/vision-count.json and site-ask.json (keys and statement), .github/workflows/site-ask.yml (the file
carries no run id today). No web page was needed: the published way here is the tree's own traced-span contract.

Found on arrival: bench/verdicts/vision-count.json was stale (its line was not the line docs/VISION.md counted),
and the build printed it with the stale note, as designed. Re-ran `node tools/vision-count.mjs --json`.

Printed by `node web/build.mjs --verdict` (2026-09-27):
- `dist portfolio vision block: 37 orders listed. MET: 16. PARTIAL: 18. OPEN: 2. FROZEN: 1. at 2026-09-27T13:24:04.834Z (docs/VISION.md counts the same line)`
- `dist portfolio live block: https://dilation.dev/ask asked at 2026-09-27T01:06:59.317Z, barMet true`
- `wrote bench/verdicts/web-vision.json (5732 bytes) barMet true`, all 18 checks ok, control 0 digits.

Tests: `node --test test/portfolio-page.test.mjs test/ladder-page.test.mjs` printed pass 20, fail 0.

Mutants (in memory through a load hook, never on disk; each applied in both test processes): 8 of 8 turned the two
files red (fail counts 4, 3, 2, 4, 1, 2, 1, 2): line changed on the page, a digit in "not measured", stale detection
off, the ladder vision half dropped, the run id ignored, em dashes let through, the verdict's byte-for-byte check
forced true, a missing file read as present.

Checked in the browser pane: both blocks render; at 375 px the portfolio page has no horizontal scroll
(scrollWidth 375 of 375); the ladder header line sits under the brand and pills.
