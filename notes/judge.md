# notes/judge.md: the locked judge, the held-out sets and the selector (board 37, item judge, 2026-09-30)

His words: "The judge is LOCKED: the select step and the held-out sets are outside what the organism may edit, so it
cannot grade itself up." and "A cell survives only if it answers its class's HELD-OUT examples better than the
organism did before it."

## What was built

- `judge/dev/<class>.jsonl` and `judge/heldout/<class>.jsonl` for fragment, mash, capital-of, essay-ocean-salt,
  written before any code; `judge/control.jsonl`, the 12 prompts the board named.
- `judge/judge.mjs`: `expectOk`, `expectFailures`, `expectErrors`, `score`. A null fails every expect; an expect with
  no clause, an unknown clause or a malformed clause fails closed.
- `judge/select.mjs`: verdict.json in the CONTRACT.md shape. Lock first; the baseline is re-graded from its rows'
  answers with the locked held-out set; `why` lists every failed clause. Stricter than the contract (each only
  removes paths to true): at least one test must pass; every control row must be probed to `can false`; no held-out
  prompt among the cell's examples; no held-out prompt of 4+ characters quoted whole ('', "" or backticks) in any
  file of the candidate directory other than result.json, verdict.json and examples.jsonl; `validate.ok` true AND
  `validate.errors` an empty list; `exitCode` 0 and `error` null, both recorded (an absent one fails); every held-out
  row with a recorded `can(q)` (a row counts only when `can` is true); the baseline's `organismPrint` equal to the
  organism now.
- `organismPrint(root)` (in select.mjs, so it is locked): sha256 over every file under `grown/` (with generation and
  cell count) and over the relative-import closure of `act/prompt.mjs` and `seeds/basic.mjs` (81 files today).
  `judge/baseline.mjs` records it (taken before and after the run; a change in between fails the run) and select
  refuses a baseline whose print differs: after a promotion the old baseline is refused, so the loop re-measures.
- `judge/verify.mjs`: sha256 of every file LOCK.json names (CRLF read as LF), plus drift on a missing LOCK.json or a
  held-out set LOCK.json does not name. `--root` for tests.
- `judge/baseline.mjs`: ask() on a fresh seeds/basic.mjs brain, provider null, k 5, knowledge pack-200 when present,
  then grown/index.mjs `grownAnswer` on a refusal.
- `judge/lock.mjs`: run by this board's session. `judge/README.md` carries the rule the routine reads: held out
  means held out from the grower; the routine, its arms and its cells may not read, copy, quote or search
  `judge/heldout/`; only the runner (to send `q`) and select (to grade) read it.

## The skeptic's defects, fixed

| defect | fix | proof |
|---|---|---|
| README let arms read the held-out sets | rule rewritten (read forbidden) + the quote tripwire | test (h) |
| baseline not tied to the current organism | `organismPrint` recorded by baseline, checked by select | test (f), real run below |
| validate.errors ignored, missing can graded on got, absent exitCode/error passed | fail closed on each | test (g) |

Mutants (`state/board37/judge/mutants.mjs`, a scratch mirror, each reverts one fix, deleted after):
```
{"mutant":"stale-baseline","edits":"3/3","pass":0,"fail":1,"red":true}
{"mutant":"quote-tripwire","edits":"2/2","pass":0,"fail":1,"red":true}
{"mutant":"validate-errors","edits":"3/3","pass":0,"fail":1,"red":true}
{"mutant":"heldout-can","edits":"2/2","pass":0,"fail":1,"red":true}
{"mutant":"exit-error","edits":"3/3","pass":0,"fail":1,"red":true}
{"mutant":"none","pass":3,"fail":0}
```

## How to run

```
node judge/baseline.mjs fragment          # also mash, capital-of, essay-ocean-salt; again after every promotion
node judge/select.mjs <candidateDir>      # [--baseline <file>] [--out <verdict.json>] [--root <dir>]
node judge/verify.mjs
node --test test/judge.test.mjs
node judge/lock.mjs --by "<who>"          # a human session only
```

## How the capital-of truth was read

bin/brain.mjs does not read `--knowledge-dir` (promptOpts has no such key), so the orchestrator's CLI command reads
act/prompt.mjs KNOWLEDGE_DIR, the full store. The builder's first probe (123 countries) ran from a scratch script
that was deleted, so its counts are not reproducible and are withdrawn here. The rerunnable probe over the 22
capitals the sets use (8 dev, 14 held-out), asking "What is the capital of X?" through ask() with provider null:
```
node --input-type=module -e "
import fs from 'node:fs'; import { runOrganism, PACK } from './judge/baseline.mjs';
const rows=['dev','heldout'].flatMap(k=>fs.readFileSync('judge/'+k+'/capital-of.jsonl','utf8').split(/\r?\n/).filter(Boolean).map(l=>JSON.parse(l))).map(r=>({x:r.q.replace(/^the capital of |^capital of | capital\$/gi,''),cap:r.expect.contains[0]}));
const q=rows.map(r=>({q:'What is the capital of '+r.x+'?'}));
const hit=async(k)=>{const o=await runOrganism(q,{knowledge:k});return o.rows.filter((a,i)=>typeof a.got==='string'&&a.got.toLowerCase().includes(rows[i].cap.toLowerCase())).length};
console.log(JSON.stringify({rows:rows.length,fullStore:await hit(undefined),pack200:await hit(PACK)}));"
{"rows":22,"fullStore":22,"pack200":10}
```
So the truth is the organism's full-store memory; 12 of the 22 are not in the shipped pack-200.

## What the real runs printed (2026-09-30, after the fixes)

```
node judge/lock.mjs --by "Fable 5.1 session under his Day 1 order, 2026-09-30, re-locked by the board 37 judge fixer after the skeptic"
{"lock":"judge/LOCK.json","files":10,"judgeSha":"dcbbc022f762c97f57fd774afe50a5179320310ee86da49bb46bbd6f38a8b01f","by":"Fable 5.1 session under his Day 1 order, 2026-09-30, re-locked by the board 37 judge fixer after the skeptic"}
{"class":"fragment","n":12,"ok":0,"score":0,"knowledge":"bench/fixtures/wiki/pack-200","grown":0,"generation":0,"codeFiles":81,"out":"state/grow/baseline/fragment.json"}
{"class":"mash","n":12,"ok":0,"score":0,"knowledge":"bench/fixtures/wiki/pack-200","grown":0,"generation":0,"codeFiles":81,"out":"state/grow/baseline/mash.json"}
{"class":"capital-of","n":14,"ok":0,"score":0,"knowledge":"bench/fixtures/wiki/pack-200","grown":0,"generation":0,"codeFiles":81,"out":"state/grow/baseline/capital-of.json"}
{"class":"essay-ocean-salt","n":12,"ok":0,"score":0,"knowledge":"bench/fixtures/wiki/pack-200","grown":0,"generation":0,"codeFiles":81,"out":"state/grow/baseline/essay-ocean-salt.json"}
node judge/verify.mjs
LOCK OK 10 files
real select, scratch fragment echo candidate, real baseline:            "survived":true,"heldout":1,"baseline":0,"why":0
the same with a baseline fingerprint from another organism:          {"survived":false,"why":["the baseline was measured before grown/ changed (generation -1, 0 cells; now generation 0, 0 cells): run node judge/baseline.mjs fragment"]}
node --test test/judge.test.mjs: # tests 21, # pass 21, # fail 0
```

Counts (`wc -l`): dev 8 capital-of, 7 essay-ocean-salt, 8 fragment, 8 mash; held-out 14, 12, 12, 12; control 12;
held-out q in dev: `overlap 0`.

## What remains

- The quote tripwire catches a copied held-out prompt, not an answer table written without one (a capital table
  keyed by country). The full guard is the read itself: the routine and the runner (not this item) must keep
  `judge/heldout/` out of every arm's brief and workspace.
- The baseline goes stale on any edit in the 81-file import closure of act/prompt.mjs, not only on a promotion:
  the loop (not this item) must run `node judge/baseline.mjs <class>` before every select. Data files ask() reads
  at run time (the knowledge pack) are named by path in the baseline, not hashed.
- `solve 3x+2=11` is in the control as the board named it, but ask() on the seed brain refuses it today; it still
  guards the row (no cell may claim it).
- The fragment and mash expects need the echo in straight double quotes (`contains ['"h"']`): the bare letter would
  pass nearly any text (rule 6). A cell using curly quotes fails.
- The baseline is measured on his PC against pack-200, which is gitignored: a cloud checkout without it measures the
  organism without its knowledge tier. For the four Day 1 classes the result is the same.
- One earlier probe of `node bin/brain.mjs ask dilation "solve 3x+2=11"` added a ledger event under state/dilation,
  outside this item's state/grow.
- A new class enters only through a human session: its held-out file makes verify print LOCK DRIFT until re-locked.
