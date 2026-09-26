# handoff

Board 15 item handoff. Model off.

## What it is

`node tools/handoff.mjs` writes docs/HANDOFF.md from what the machine measures when it runs, never from memory or from a prior copy of the file. Everything in it is read at generation time: the two scheduled tasks through `schtasks /Query /V` (read only, never /Create), the gap ledger state/self/gaps.jsonl, the newest autopilot decision files under state/self-code, gate.json, the public chain's whole-chain.cmd.txt and journal, the STOP file and the pid lock, the git remote and branch, and whether the Vercel CLI login file exists (existence only, never its contents).

The site renders the file at /handoff (web/dist/handoff/index.html, plus the raw file as handoff/HANDOFF.md) at every `node web/build.mjs`, through web/handoff.mjs. The organism page carries one link to it.

## Sections

WHAT RUNS BY ITSELF, HOW TO CHECK, HOW TO STOP AND RESTART, WHAT IS UNDONE, HOW THE UNDONE WORK GETS DONE WITHOUT CLAUDE, HOW TO RESUME THE PUBLIC CHAIN, HOW TO DEPLOY THE SITE, HOW TO PUSH THE REPOSITORY, then COMMANDS CHECKED. The file ends with the ISO time it was generated and the gate line rebuilt from bench/verdicts/gate.json in the format bench/gate.mjs prints.

The task commands are not typed here: they come from the argv builders tools/schedule-autopilot.mjs and tools/schedule-ladder.mjs export, and the doc says whether the registered task's "Task To Run" matches the tool's own line.

WHAT IS UNDONE groups the ledger by kind in the ledger's order ("### kind (n)" headings, one bullet per gap), board items by board, with each gap's trial command and minutes when it has one. The bar parses those headings and bullets back out of the written file and compares them to the ledger row for row.

## How commands are checked

Every command line in the file goes through one checker. A script path (.mjs .cjs .js .exe .cmd) must exist under the root; a bare executable (node, git, gh, npx, schtasks, where) must resolve through where.exe; `schtasks /TN name` without /Create must be a registered task. A file that an undone board item owns and has not landed yet is listed as pending, not missing, and says which item owns it. The CLI exits 1 when anything is missing and names each one.

## Secrets

Text carried from the ledger and the logs passes a filter (SECRET_PATTERNS in tools/handoff.mjs) and each hit is replaced by [withheld]; the file prints how many. writeHandoff refuses to write when a pattern survives, and web/handoff.mjs refuses to build the page when a pattern or an em dash is in the file. No credential is read, stored or printed: the Vercel login and gh auth are named as his steps.

## The bar

`node tools/handoff.mjs --bar` regenerates the file (again if the ledger moved while it ran, up to 3 times), compares the undone counts to the ledger, runs `node web/build.mjs` and takes its handoff line, checks the page is fresh, runs `node --test test/handoff.test.mjs`, and writes bench/verdicts/handoff.json with isTheBar true. Met only when missing is 0, the build exits 0 with a fresh page, the tests pass, the counts match and no secret pattern is in the file.

The tests plant a tree under a temp directory with a planted ledger, planted schtasks output, planted which and git, and delete it; they never call schtasks, Ollama or the network.

## Open

- `node web/build.mjs` exits 1 before the handoff step: tools/findings.mjs trace() treats any data-src owner named soak as the soak state directory (sources.soak), so the verdict bench/verdicts/soak.json committed at dd6a6bc renders spans like soak:at and soak:totals.attempts that resolve to nothing. The page is only proven by `node web/handoff.mjs` until findings resolves a verdict named soak through the verdicts map.
- Both scheduled tasks run with Logon Mode Interactive only, so neither runs while he is logged off.
- BrainLadder's last result is 0x800710E0 (the operator or administrator refused the request); the doc prints it but nothing here diagnoses it.
- self/brief.mjs, self/resume.mjs and self/nextboard.mjs had not landed when the file was generated (their lines in the loop section say "not landed yet"), and self/boards.mjs had landed with 0 board item lines in the ledger, so WHAT IS UNDONE lists no board items until self/gaps.mjs rewrites the ledger with that source.
