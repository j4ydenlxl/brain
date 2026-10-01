# grow-sandbox: the cloud sandbox runner (board 37, item sandbox, 2026-09-30)

His line (NEXT-WEEK.md step 3): "Every candidate runs in the cloud ... Never on his PC."

## What was built

- `grow/sandbox.mjs`: the runner CLI. It reads the token by NAME (`VERCEL_TOKEN`, else `VERCEL_OIDC_TOKEN`;
  an expired OIDC token exits 3 with its exp claim as an ISO stamp and the pull command, the token itself never
  printed), the team and project ids (`VERCEL_TEAM_ID` / `VERCEL_PROJECT_ID`, else `.vercel/project.json`, else
  the CONTRACT.md defaults), packs one gzipped ustar tarball under `run/` (`cand/` = cell.mjs, test.mjs,
  examples.jsonl and every `./*.mjs` sibling; `grow/contract.mjs`; `grow/probe.mjs`; `heldout.jsonl` and
  `control.jsonl` STRIPPED to `{q}`; `nonce.txt`, 16 random bytes as hex, new each run), then over REST: create
  (node24, `persistent: false`, 1 vCPU, 2048 MB, `networkPolicy: deny-all`), `fs/write` (content-type
  application/gzip, `x-cwd` = the sandbox cwd), `cmd` (`node grow/probe.mjs cand --heldout heldout.jsonl
  --control control.jsonl --nonce-file nonce.txt`, wait and logs, ND-JSON parsed), and `stop` in a `finally`
  block (cpuMs = `activeCpuDurationMs` of the stop answer). It writes result.json in the CONTRACT.md shape
  (exactly those 16 keys; the nonce stays out) and prints it as one line.
  The token is sent to `api.vercel.com` only: any other `--api-base` gets no authorization header.
  Exit codes: 0 result written, 2 usage or input, 3 token, 4 refused, 5 the sandbox API failed (the session is
  still stopped).
- THE TRUST RULE (the skeptic's defect, fixed): the probe's line is believed only when it carries this run's
  nonce AND the probe process exited 0 AND the run reported no error (`distrust()` in grow/sandbox.mjs). Any
  other end (a non-zero or null exit, a kill, a timeout, a stream error, no line with the nonce) gives
  `validate: { ok: false, errors: [<reason>] }`, `tests` all null, `examples: []`, every held-out and control row
  unrun (`can: null`, `got: null`), `id` = the directory name, `class` and `node` null, and the reason in
  `error`: nothing the probe reported is kept. Before, a probe that printed a line and then exited non-zero kept
  that line's validate, tests and rows. A stop failure after a clean probe keeps the rows and fills `error`.
- `--backend here`: refused with exit 4 and the line `candidates never run on his PC (NEXT-WEEK.md step 3);
  --backend here needs --fixture`, unless `--fixture` is given AND the directory is under `grow/fixtures/`
  (else exit 4, `--fixture runs only a directory under grow/fixtures/`), or `CLAUDE_CODE_REMOTE`,
  `GITHUB_ACTIONS`, `VERCEL` or `CI` is set. It unpacks the SAME tarball bytes into a temp dir and runs the
  probe with an env holding no token; the same trust rule applies.
- `grow/probe.mjs` (runs inside the sandbox, node built-ins only, `./contract.mjs` beside it): reads the
  `--nonce-file` and DELETES it before any candidate code runs, echoes it as `nonce` in its line; validates the
  cell's SOURCE first (`validateCell(source, null)`, authoritative) and test.mjs (`validateTest`), then imports the
  cell and runs `validateCell(source, mod)` in a worker thread (import budget 5000 ms plus 2000 ms per example);
  the worker's verdict may only add errors (ok is the source verdict AND the module verdict AND no error). Every
  message the worker posts carries a per-worker secret consumed from workerData before the cell's code runs,
  through a postMessage bound before that code runs: a message without it is dropped, `validate` and `imported`
  are taken once, a `row` only for the row that is running (board 37's verify2 forged a validate message and a
  control row from a cell that reached parentPort through the Function constructor; tests (m), (n), (o)). Runs
  `node --permission --allow-fs-read=<cand> --test --test-isolation=none --test-reporter=tap test.mjs` (30 s, env
  without tokens: test.mjs may read its own directory and nothing else, may not write a file, spawn a process,
  start a worker or load an addon) and reads `# pass N` / `# fail N` from the child's stdout only when each
  appears EXACTLY ONCE (null when absent or doubled, never a zero: a test file that prints its own summary makes
  two; a reporter FILE is not possible, the permission model disables fsync and node's WriteStream exits 1 on
  close); then every examples and held-out row gets `can(q)` and `answer(q)`, every control row `can(q)` only,
  each row timed with `performance.now()` against 2000 ms; a throw gives can false or got null, a row past the
  budget is cut by terminating the worker and the next row runs in a fresh one. Worker stdout is swallowed, so
  the probe prints ONE JSON line (plus `nonce`, `node`, `probeCpuMs`, `rowErrors` for the runner).
- `grow/tar.mjs`: ustar writer (512-byte headers, octal fields, checksum, magic `ustar\0` `00`, prefix split
  for paths over 100 bytes, padded bodies, two zero blocks), `targz` via node:zlib, `withDirs`, and a reader.
- `grow/fixtures/echo-cell/`: `echo-fixture`, class and lane `fixture`, generation 1, grownFrom `["h"]`;
  `can(q)` is `q === "h"`; `answer(q)` returns `You typed <q>. Say a whole word or ask a question.`, so for `h` it
  is `You typed h. Say a whole word or ask a question.` and every got string shows its own row's q crossed into
  the sandbox and back (the skeptic's note: the old answer ignored q).
- `test/grow-sandbox.test.mjs`: 16 tests, no token, no network but a stub on 127.0.0.1 that emulates create,
  fs/write (unpacked with the test's OWN ustar reader), cmd (runs the probe locally, answers ND-JSON; modes
  `exit3`, `forge-after`, `forge-only`, `nojson`, `cmd500`) and stop (`activeCpuDurationMs: 4321`); plus the
  system `tar -tzf` / `-xzf` on a tar.mjs archive when tar is on PATH. New: (h) a good line then exit 3 keeps
  nothing (its control: the same line parses with validate ok and got strings); (i) forged lines without the nonce,
  before or after the real one, never become the result (control: without the filter the forged line IS taken);
  (j) a cell that slips past validateCell and writes a forged line plus a glue prefix to fd 1 from its worker gets
  validate.ok false, never its forgery (control: the forgery is the last JSON line on stdout); (k) test.mjs under
  the permission model: its write and spawn throw ERR_ACCESS_DENIED, its read of its own dir works, no file
  appears; (l) the nonce file is gone before the cell imports (control: the same cell sees it when it is left).

## How to run

```
node --test --test-reporter=tap test/grow-sandbox.test.mjs
node grow/sandbox.mjs --help
# the real run (about one second of sandbox CPU); rows as below
mkdir -p state/board37/sandbox
printf '%s\n' '{"q":"h","expect":{"notRefusal":true,"minWords":6}}' '{"q":"hh","expect":{"notRefusal":true,"minWords":6}}' > state/board37/sandbox/heldout.jsonl
printf '%s\n' '{"q":"hi"}' '{"q":"hello"}' '{"q":"what is 17 times 23"}' > state/board37/sandbox/control.jsonl
node --env-file=.env.local grow/sandbox.mjs run grow/fixtures/echo-cell --heldout state/board37/sandbox/heldout.jsonl --control state/board37/sandbox/control.jsonl --out C:/Users/ybmic/Downloads/claudeskillsvideo-to-website/brain/state/board37/sandbox/echo-result.json
```
`.env.local` comes from `npx -y vercel@latest env pull .env.local --yes` (a 12 hour OIDC token). Add
`--verbose` for a step trace on stderr (statuses and timings, never a token). Always pass `--out` for a
directory under `grow/fixtures/`, or result.json lands next to the fixture (the CONTRACT.md default).

## What the real run printed

Fixer run (2026-09-30, startedAt 2026-09-30T21:16:40.666Z, `--verbose`, exit 0; the trust rule, the nonce and
the permission-model test child all in place): `create 200 in 555 ms`, `fs/write 200 in 365 ms`,
`cmd 200 in 618 ms`, `stop 200 in 1271 ms`; session `sbx_LDBNXUWVAwCiW1BedyCLuI6HNsrJ`, node `v24.14.1`,
cpuMs `1418`, wallMs `2812`, backend `vercel`, validate `{"ok":true,"errors":[]}`, tests exitCode 0 passed 2
failed 0 (the test child ran under `--permission --test-isolation=none` inside the sandbox), heldout
`[{"q":"h","can":true,"got":"You typed h. Say a whole word or ask a question.","ms":0.003},{"q":"hh","can":false,"got":"You typed hh. Say a whole word or ask a question.","ms":0.003}]`,
control `hi`, `hello`, `what is 17 times 23` all `can: false`, exitCode 0, error null.

Earlier runs: builder `sbx_bNR98FCcwrV2Gcf8gDpzSSYU4wMe` (cpuMs 1292, wallMs 3713); skeptic
`sbx_BRO0WWUQRe4XCpg8PikGrOIww1GV` (cpuMs 1378, wallMs 3718); both before this fix.

Tests: `node --test --test-reporter=tap test/grow-sandbox.test.mjs` printed `# tests 16`, `# pass 16`, `# fail 0`.
Mutants of this fix, each run against the suite and restored byte-equal: distrust ignores a non-zero exit
(`# pass 15 # fail 1`, red (h)); lastJson ignores the nonce (`# pass 14 # fail 2`, red (i) (j)); the nonce file
deleted after candidate code (`# pass 14 # fail 2`, red (b) (l)); the test child without the permission model
(`# pass 15 # fail 1`, red (k)). The builder's five earlier mutants (no {q} strip, no stop on a failed cmd, no
expiry check, an open here gate, the token sent to any host) each turned one or two tests red.

## What remains

- validateCell (grow/contract.mjs, not this item's file) checks the source by pattern: a cell can reach
  `process` with `[].constructor.constructor('return pro' + 'cess')()` and pass (tests (j) and (l) do it). What
  such a cell can do to the runner is bounded: it can break its own line (the result is then validate.ok
  false, never its forgery); it cannot post itself valid, post a row or rewrite the probe's messages (the
  per-worker secret, test (m)); but it runs in a worker inside the probe's process, so in principle it could read
  the probe's memory for the nonce or the secret. Full isolation is the cell in its own `node --permission` child,
  one per row batch (a probe change; not done here).
- A test file's count is a self-report: a file that passes trivially (`test('x', () => {})`) is legal, so a forged
  count buys a cheater nothing the contract does not already allow; the one-summary rule and the `process` ban
  stop the cheap forgeries (test (n)), and the selection pressure is the held-out score, the control and the
  examples, all read by the probe's worker under the secret and graded by the locked judge.
- The probe's `rowErrors` (why a row threw or timed out) do not reach result.json, whose shape is fixed by
  CONTRACT.md; an arm sees only `got: null` or `can: false`. Adding a field is a CONTRACT.md change (orchestrator).
- The OIDC token lives 12 hours; a routine with his PC off needs `VERCEL_TOKEN` in its environment (his hand).
- No in-sandbox `tar -tzf` was run (it costs a second command); the proof inside is the probe reading the files
  (and deleting nonce.txt) from the extracted tarball, and on this machine the system tar lists and extracts
  tar.mjs archives byte-equal (test a2).
- The permission-model denials (test k) were measured on this machine (Windows, node v24.15.0); inside the
  sandbox (Linux, v24.14.1) the real run shows the confined test child runs and passes, not a denial.
- `--backend here` cpuMs counts the probe process only, not its `node --test` child.
- One lane of candidates at once (many sandboxes) and the sandbox concurrency limit are untested.
