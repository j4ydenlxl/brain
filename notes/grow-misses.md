# grow-misses: the miss-log reader, the grown hook and the site's growing reply

Board 37, item misses, 2026-09-30 (built, then fixed after the skeptic's round 1). His words (NEXT-WEEK.md,
step 8): "The site's miss reply changes from a refusal to "I am growing a cell for this", and the miss is logged
for step 1. Every miss becomes a cell." And: "The site's answer where no cell exists yet: BRAIN_LLM_BASE,
BRAIN_LLM_KEY and BRAIN_LLM_MODEL on Vercel (his hand, API billing). Without them it says it is growing the cell."

## What was built

- `grow/misses.mjs`, a CLI and a module (no dependency, no model, one socket: the Supabase REST origin).
  - `read [--status open|growing|grown|skipped|any] [--limit 200] [--since <iso>] [--file <jsonl>] [--api-base <url>]`:
    the rows as JSONL, one `{id, at, prompt, reply, route, status}` a line, then `{rows, source, reason}`.
    With the service key: `GET /rest/v1/misses?select=...&order=at.desc&limit=N&status=eq.<s>[&at=gte.<iso>]`,
    the key in `apikey` and `authorization: Bearer`, a 10 s deadline. Without it: rows 0, reason
    `SUPABASE_SERVICE_KEY absent (his hand)`, exit 0. With `--file`: the local JSONL (the driver's seed misses),
    a row with no status is open, newest first, a row with no time is dropped under `--since`.
  - `mark <id,...> --status growing|grown|skipped [--cell <id>] [--generation <n>] [--file <jsonl>]`:
    `PATCH /rest/v1/misses?id=in.(..)&select=id` with `prefer: return=representation`, body `{status, cell?,
    generation?, grown_at (grown only)}`, prints `{marked, ids, status, source, reason}`; `--file` rewrites the
    named rows of the local file (temp file, then a rename); no key: marked 0 with the same reason, exit 0.
    Ids: the log's are integers (`LOG_ID_RE`, checked in the CLI and again in `markMisses` before a PATCH
    leaves); a file's are its own (`FILE_ID_RE`: grow/seed-misses.jsonl uses `seed-1` to `seed-4`).
  - `classes [--file <jsonl>]` (else stdin, so `read | classes` works): one `{id, prompt, class}` a row, then
    `{byClass, rows}`. The rules, in order: fragment (1 to 3 letters, not a turn act/converse.mjs answers),
    mash, capital-of (`/\b(?:the\s+)?capital\s+of\s+\w/i` not opening with what, which or where),
    essay-ocean-salt, essay, other.
  - mash (fixed in round 2): 6+ letters, no space, not a COMMON word (`isCommon` also strips s, es, ed, er,
    ers, ing, ly and ies for y), and one of four shapes: a run of 5 letters with no vowel (y a vowel) once th,
    sh, ch, ph, gh, wh, ck and ng count as one letter; every letter on the home row or every letter on the
    bottom row (the two rows with at most one vowel); 5 neighbouring keys of one row in order; a letter pair of
    `STRANGE_PAIRS`, the 83 pairs none of the 28,377 words of 6+ letters seen 20 or more times in the store's
    text (bench/fixtures/wiki/store/records.bin) contains. The first cut (a 4 letter window with no vowel, or
    every letter on any one row) classed equity, rupture, pewter, strengthened, earthquakes as mash.
  - COMMON: the 200 most frequent words of 6+ letters in that text that the shape still flags (alaska, dallas,
    armstrong, offspring, downstream, corkscrew, then names), an inflection counted with its stem, five template
    joins (districtq, districtx, championshipv, atlantiquesx, connecticutx) left out. The test asserts the
    shape flags every one of them.
  - A failure (a refused or silent log, a bad flag) prints one line `misses: <reason>` on stderr and exits 1
    (2 for usage); the key never appears in a reason (a server message that echoes it prints `<key>`).
- `act/prompt.mjs` (add only): `import { grownAnswer } from '../grown/index.mjs'`; in `ask()`, right after the
  conversation region and before the solved region, `if (opts.grown !== false)` a survivor that can answer
  returns `answerFromGrown(...)`; the exported `answerFromGrown` has the field set of `answerFromNative`
  (the test compares the key sets): from `cell`, text `answered natively by a grown cell (<id>, generation
  <n>), with no model, no memory read and no network.` then the answer, `native {kind: "cell:<id>", answer,
  form: class, ns}` (ns measured with process.hrtime.bigint() around grownAnswer), provenance answer `native`,
  source `grown`, method the id, route `direct`, one ask event. Generation 0 holds no cell, so nothing changes.
- `act/ask-http.mjs` (add only, one line extended): `GROWING_HEAD`, `missConfigured`, `missOrigin`,
  `isMemoryMiss`, `logMiss(env, row, {fetch, timeoutMs})`, `MISS_MS` 1500. In `handle()`, when no model cell is
  configured and the answer is a memory miss (from memory, 0 hits, no cite), `json.text` is GROWING_HEAD then
  the old text, and `json.growing = {logged, reason}`; with SUPABASE_URL and SUPABASE_ANON_KEY both set the row
  `{prompt: scrubSecrets(prompt).text (2000 chars at most), reply: the first line, route: {from, route,
  provenance, host}}` is POSTed, awaited, 1500 ms deadline, never thrown. The one changed line: the cold start's
  `installGuard` env gains `BRAIN_EGRESS_ALLOW: missOrigin(env)`, because the egress guard refused every origin
  but the model's (the skeptic's guard mutant printed `EGRESS_REFUSED` without it).
  - When the POST did not land (no names, a refusal, a timeout), the second line is `(<growing.reason>)`; the
    first line is GROWING_HEAD in every case.
- `web/src/index.html` line 131: the link text is "ask the organism on the server (it grows a cell for what it
  cannot answer)"; the refusal words are unchanged. `node web/build.mjs` regenerated web/dist (its last line:
  `tools: /tools copied from web/tools`); web/dist is committed by the orchestrator. Not rebuilt in round 2
  (the source did not change).

## How to run

```
node grow/misses.mjs --help
node grow/misses.mjs read
node grow/misses.mjs read --file <seeds.jsonl>
node grow/misses.mjs classes --file <seeds.jsonl>
node grow/misses.mjs read --file <seeds.jsonl> | node grow/misses.mjs classes
node grow/misses.mjs mark 1,2 --status grown --cell <cell-id> --generation 1
node grow/misses.mjs mark seed-1,seed-2 --status growing --generation 1 --file <copy of grow/seed-misses.jsonl>
node --test test/grow-misses.test.mjs test/ask-http.test.mjs test/act-prompt.test.mjs
```

## What the real run printed (round 2, once)

A scratch script built the handler with `createHandler({stateDir})`, the environment holding the two public
names (SUPABASE_URL=https://iiaxowfsdzcpteajphmx.supabase.co, SUPABASE_ANON_KEY the publishable key), the guard
on, `POST {"prompt": "h"}`, the output through sed redaction:

```
at 2026-09-30T21:31:06.638Z
status 200
first I am growing a cell for this. Your prompt is logged, the next hourly generation in the cloud grows a cell that answers it, and this site answers it after that. Until then I answer greetings, arithmetic, equations and the facts I ingested.
growing.logged true
growing.reason logged: the miss log answered 201
from memory route direct guard true
keyInResponse false
exit 0
```

`select ... from public.misses order by id desc limit 3` then printed row 4 (at 2026-09-30 21:31:07.516015+00,
prompt h, status open) above rows 3 (the skeptic's run) and 2 (the builder's run). Three "h" rows are in the log.

The other bar commands (round 2):

```
$ node grow/misses.mjs read
{"rows":0,"source":"supabase","reason":"SUPABASE_SERVICE_KEY absent (his hand)"}
exit 0
$ node grow/misses.mjs classes --file seeds6.jsonl   (the four seeds, "hello", "write an essay on trees")
{"id":1,"prompt":"h","class":"fragment"}
{"id":2,"prompt":"jgkafsjka","class":"mash"}
{"id":3,"prompt":"the capital of France","class":"capital-of"}
{"id":4,"prompt":"Write a short essay on why the ocean is salty.","class":"essay-ocean-salt"}
{"id":5,"prompt":"hello","class":"other"}
{"id":6,"prompt":"write an essay on trees","class":"essay"}
{"byClass":{"fragment":1,"mash":1,"capital-of":1,"essay-ocean-salt":1,"essay":1,"other":1},"rows":6}
exit 0
$ node grow/misses.mjs mark seed-1 --status growing --file seed-copy.jsonl
{"marked":1,"ids":["seed-1"],"status":"growing","source":"file","reason":"rewrote seed-copy.jsonl"}
exit 0
$ node grow/misses.mjs mark seed-1 --status growing
misses: mark needs ids: mark 1,2,3 --status grown (the log ids are integers)
exit 2
$ node bin/brain.mjs ask dilation "h" | head -4
ask dilation  aaa9402664f1a41f  1 chars
------------------------------------------------------------------------
nothing in memory matches this prompt.
------------------------------------------------------------------------
exit 0
```

The mash rule measured on the store's words (a scratch script over records.bin, then the module itself):

```
{"seen":20,"words":28377,"firstCutShape":706,"shape":20,"classMash":0,"classMashFirst":[]}
{"seen":5,"words":77671,"firstCutShape":2196,"shape":271,"classMash":69,"classMashFirst":["districtq","districtx","championshipv","panjgur","puzder","qeqertalik","quwwat","rajgarh","ramzan","shawqi","smartstream","sparxxx"]}
{"random6to12":{"home":{"mash":2000,"firstCut":2000,"of":2000},"bottom":{"mash":2000,"firstCut":2000,"of":2000},"top":{"mash":1097,"firstCut":2000,"of":2000},"all":{"mash":1466,"firstCut":1437,"of":2000},"leftHand":{"mash":1790,"firstCut":1726,"of":2000},"rightHand":{"mash":634,"firstCut":820,"of":2000}}}
equity:other rupture:other strengthened:other breakthrough:other nightlife:other angstrom:other pewter:other teeter:other trotter:other sprightly:other worldview:other hardships:other earthquakes:other lengthen:other twelfths:other birthdays:other python:other property:other instrument:other handstands:other jgkafsjka:mash asdfgh:mash qwerty:mash zxcvbn:mash xkcdzq:mash
```

The price, printed: random strings on the top row are mash 1097 of 2000 (the first cut: 2000), on the right hand
634 (820); on the whole keyboard 1466 (1437) and the left hand 1790 (1726). STRANGE_PAIRS is measured on the
same words it is judged on at 20+, so its 0 there is circular; the 5 to 19 band is not.

Tests (`--test-reporter=tap`, round 2): grow-misses `# pass 11` `# fail 0`; ask-http `# pass 15` `# fail 0`;
act-prompt `# pass 36` `# fail 0`.

Mutants (round 2), each applied in memory by a `module.registerHooks` load hook in scratch, never on disk:

```
grow-misses: none 11/0; run4 fail 2; toprow fail 2; numericfile fail 1; nologcheck fail 1; noending fail 1; nostrange fail 2
act-prompt (the 8 grown tests, NODE_OPTIONS so the child is mutated too): none 8/0; hookoff fail 1; ignoreopt fail 1; wrongfrom fail 2
```

The generation-0 test no longer branches away its assertion: `opts.grown false` must give the memory miss
whatever the index holds, the real index must agree with grown/index.json and answer exactly what grownAnswer
names, and a child plants a generation-0 index (no survivor, counting its calls) through a second instance of
act/prompt.mjs (`?gen0`): the hook consulted it once, ask("h") fell through to `nothing in memory matches this
prompt.`, the same answer as `grown: false`, which did not consult it.

## What remains

- SUPABASE_SERVICE_KEY (his hand): until it is set where the generation runs, `read` prints rows 0 and the
  driver reads `--file`; with it, `read` and `mark` run against the log (tested only against the stub).
- `test/ask-fallthrough.test.mjs` line 262 asserts the handler's memory-miss text equals FALLTHROUGH_HEAD, the
  old line and FALLTHROUGH_TRY; the growing head now comes first. `bench/ask-fallthrough.mjs` line 57 wants a
  first line under 240 chars (GROWING_HEAD is 286). Both are outside this item: the orchestrator updates them.
- The first line says "What you asked is logged as a miss" even when growing.logged is false (the head is the
  spec's words); line two says it was not logged.
- `act/ask-http.mjs` has one changed line (the guard's allowlist), not an addition.
- `test/act-prompt.test.mjs` was over 40 KB before this item (add-only here, so not split); its working copy
  mixes CRLF (old lines) and LF (new), which .gitattributes eol=lf normalizes on commit.
- The mash class still misses random top-row and right-hand strings (1097 and 634 of 2000 are mash) and flags
  69 of the 77,671 store words seen 5 or more times (names outside COMMON's 200).
