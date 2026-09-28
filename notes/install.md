# install: the packed install path (board 32, item install-path)

His order (docs/VISION.md order 44, 2026-09-27): "I want the Brain to be a very important tool, even for you for further ambitious projects, and for developesr all across". Clause (3) is this item: a packed tarball that carries every file ask() imports and nothing from state/, bench/fixtures/ or bench/verdicts/, and bin/brain.mjs --version.

## How to pack and install

From the brain/ directory (Node 24, npm ships with it):

    npm pack                                  writes brain-<version>.tgz here
    mkdir ../somewhere && cd ../somewhere
    npm install <path to>/brain-0.1.0.tgz --no-audit --no-fund
    node node_modules/brain/bin/brain.mjs --version
    node node_modules/brain/bin/brain.mjs init dilation
    node node_modules/brain/bin/brain.mjs ask dilation hey --provider null

The installed copy keeps its brains under node_modules/brain/state unless BRAIN_STATE_DIR names another directory. `npx brain <command>` works the same once installed (the bin is `brain`).

The bar: `node bench/install.mjs` (under the budget wrapper on this machine: `node tools/budget.mjs --ram-mb 4000 --disk-mb 600 --dir <scratch> --no-record -- node --max-old-space-size=4000 bench/install.mjs --scratch <scratch>`). It writes bench/verdicts/install.json. `--trace` prints the tracer alone; `--no-control` skips the tree arm; `--out F` writes the verdict elsewhere (the test uses it).

## What the tarball carries (bench/verdicts/install.json, at 2026-09-28T00:44:44.033Z)

- 236 files, 1717617 bytes packed, 5676259 bytes unpacked; excludedPresent 0; missingImports 0.
- The tracer reached 199 modules and 7 data files from bin/brain.mjs and act/prompt.mjs (package.json, world/policy.json, research/published.json, viz/index.html, web/src/findings.html, bench/conceive-prompts.json, bench/essay-prompts.json).
- package.json `files`: the code directories whole (bin, act, capability, cells, cli, core, daemon, generations, genome, io, lab, lang, learning, memory, mind, reason, runtime, seeds, self, simulate, tasks, world), because 20 dynamic imports in them are expressions no tracer can follow (listed in the verdict as blindDynamicImports: process.argv[1], pathToFileURL(f), workerData URLs, an organism index); viz/*.mjs, viz/index.html and viz/client/ (not viz/screenshots: npm does not support negated patterns in `files`, so the directory is named by parts); and single files for bench/, tools/, test/, research/ and web/src/, exactly the ones the tracer reached. A new import from a reached module into a file not listed shows up as missingImports and the bar goes red.
- Left out on purpose and listed as dataExcluded (26 paths): the knowledge store under bench/fixtures/wiki/store (388459374 bytes on this machine, measured by the bar's stat walk), the kept word-problem programs bench/verdicts/induce-programs.json (139749 bytes), the other bench/verdicts and bench/fixtures reads of the bench modules, docs/BOARDS.json and the runtime files under state/. act/prompt.mjs reads both stores only if they exist (programStore returns null on an absent file; the knowledge tier is skipped with no meta.json), so the installed copy runs without them.
- dataAbsent (2): act/policy.json (act/shell.mjs and act/web.mjs name it; no file exists in the tree either) and test/.drift-runs (written by a test plant at run time).
- 125 data joins have a base the tracer cannot resolve statically (a brain's own directory, a verdicts dir passed in): they are runtime files such as snapshot.json and ledger.jsonl and are counted as dataUnknownBase, never guessed into a path.

## What answers bare (installed copy, provider null, no knowledge store)

Measured by the bar, never predicted: "hey" (route direct, provenance native), "hi" (direct, native), "2+2" (direct, exact), "What is 12 times 12?" (direct, exact). Not answered: "What is the capital of France?" printed the memory miss "I do not carry that yet: ...". The control, the same five prompts through the tree bin with the same fresh brain and provider null, answered 5 of 5: the capital question took route knowledge from the store the tarball does not carry. So a developer who installs the tarball gets greetings, arithmetic and the exact path in microseconds; a factual question needs either the knowledge store (built by tools/ingest-wiki.mjs) or a model cell (--provider ollama, or --provider env with the variable NAMES BRAIN_LLM_BASE, BRAIN_LLM_KEY, BRAIN_LLM_MODEL).

## Decisions

- No `license` field was added: package.json had none, and the tree's LICENSE file is proprietary ("All rights reserved"). npm ships LICENSE by name in every tarball whatever `files` says.
- `private: true` is kept: npm pack and npm install of the tarball work (measured above); npm publish refuses, which is deliberate until he decides to publish.
- `engines` {"node": ">=24"} was already present and stays; `description` is now one sentence with his words quoted from docs/VISION.md section 1 ("self growing and self improving self compressing self iterating", 8 words); `repository` names the GitHub repo; zero dependencies.
- bin/brain.mjs is unchanged: `--version` (main(), reads package.json through BRAIN_ROOT) and `--help` (the same help command, byte-identical output) already existed. test/install.test.mjs now asserts both, which no test did before.
- npm is run as `node <npm-cli.js>` found beside process.execPath, so no .cmd shim and no shell on Windows; `--ignore-scripts` and `--offline` on the install, so the registry is never reached.

## Measured

- Read before building: package.json, bin/brain.mjs (argv parsing, help, main, ask, init), cli/state.mjs (BRAIN_ROOT, stateRoot, loadBrain), act/prompt.mjs (imports, KNOWLEDGE_DIR, PROGRAM_STORE, programStore), act/llm.mjs (provider null opens no socket), .gitignore, .vercelignore, LICENSE, docs/VISION.md sections 1 and order 44, tools/budget.mjs usage. No prior install attempt existed in the tree (grep for npm pack and npm install found none).
- Published way read: the npm package.json documentation, `files` section (docs.npmjs.com, cli v11): package.json, README, LICENSE and bin files are always included; .git and node_modules always ignored; a root .npmignore does not override `files`, a subdirectory one does; negated patterns are not supported (why viz/ is listed by parts).
- Mutants: seven hand mutants of bench/install.mjs (import rule off, export rule off, .env check dropped, miss texts ignored, excluded data counted as reached, quoted-literal rule off, unresolved imports dropped), each KILLED by test/install.test.mjs (the first run of the export mutant was a no-op and was re-written before counting).
- Bar wall: 6.39 s under the budget wrapper, peak RAM 165.0 MB, scratch 7430370 bytes, deleted after the run.
- Fix pass (verify plane): the statement quoted the knowledge store size (388459374 bytes) and the kept programs size (139749 bytes), and no stdout line printed either (the per-row control log left the byte counts out). Read why: the two sizes were computed into verdict.control and only the statement used them. Fixed at the source: the bar now prints one control summary line, "control (tree): answered 5 of 5, knowledge store 388459374 bytes, kept programs 139749 bytes, rests on unshipped data \"What is the capital of France?\"", before the statement is written. Tests added: a unit test for the number check (catches a missing number, a prefix of a printed number and a prefix of a printed version; passes a printed one), an assertion on the no-control bar run that every number in its statement appears in its stdout, and a new bar run with the control arm asserting the summary line and the same check. Mutant: the summary log disabled, the control test FAILED ("the control summary line is printed"); restored byte-identical. Read after the fix: the new verdict statement against the new stdout, every number present.
