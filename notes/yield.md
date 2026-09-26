# yield: the kept-per-hour line on the site (queue item 7, the CLOUD part)

Author: board 20 builder (board 21, item yield), 2026-09-26. Model off: nothing here opens a model socket.

His words (docs/CLOUD-SESSION.md, item 7): "the kept-per-hour line and the organism-years line on the site, read from the verdict, so the loop's yield is visible without a terminal." This item is the kept-per-hour line and its site bar. The organism-years line is web/ladder.mjs (board 20 spread owns it). The LOCAL bar (`node bench/autopilot.mjs` on Ollama) is not run here.

## What was built

- `tools/yield.mjs` reads autopilot.json, autopilot-*.json, soak.json, soak-history.jsonl and the ledger bench/verdicts/autopilot/*.jsonl, and prints one line per verdict, one per ledger run, then NEWEST and WINDOW. Kept per hour is kept over the wall the verdict records (soak.elapsedMs, realTree.ms); nothing calls Date.now(). A ledger run borrows the wall of the soak verdict with its runId, or prints "no wall recorded". No verdict: "no autopilot verdict on this host".
- `web/yield.mjs` puts the block on the findings page before "what was measured", every digit in a tagged span, the file and its at beside each number. Registered in `web/build.mjs` (import, one call after generateFindings, one print line). `BRAIN_YIELD_BLOCK=off` skips it (the control).
- `bench/yield-site.mjs` builds the site seven times in a temp copy, compares sha256 and every number, writes `bench/verdicts/yield-site.json`.
- `test/yield.test.mjs`: fixture lines exact, 0 prints 0, the 7 day window, the missing directory and its -partial, the injection.

## Measured (printed by the commands)

`node tools/yield.mjs`: NEWEST soak.json at 2026-09-26T14:57:59.842Z: kept 0 in 4.1471 wall hours = 0 kept per hour. WINDOW 2.5234 days (under 7): 1 kept in 3 soak runs over 6.9197 loop wall hours = 0.1445 kept per loop hour; 1 kept in 12 runs on record over 60.562 hours = 0.0165 kept per hour of the window.

Bar: BAR MET. Live clock noise off against off: 3 files (findings, ladder, portfolio), 0 with the build stamps masked. Frozen clock: 0 and 0 noise, 37 of 37 other files byte-identical, findings minus the block byte-identical, 163 numbers, 0 problems, tamper caught.

## Open

The real web/dist is not rebuilt here: the next `node web/build.mjs` puts the block on the page. test/findings.test.mjs regenerates the findings page without the block; a build after the gate restores it.
