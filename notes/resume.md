# notes/resume.md: the resume item (Board 15)

Author: board 15 builder. Every number below was printed by the command named beside it.

## Files
- self/resume.mjs (new): plan, queue check, journal repair, bounded launch through tools/budget.mjs, decision line kind "resumed" in state/self/resume.jsonl, fresh chain-cut.txt
- self/autopilot.mjs: source `resume`, flag `--resume-minutes` (default 45, 0 turns it off)
- bench/public.mjs: `--wall-minutes M`, the cut falls between records
- test/resume.test.mjs, bench/resume.mjs, bench/verdicts/resume.json

## Bar (`node tools/budget.mjs ... -- node bench/resume.mjs`, bench/verdicts/resume-bar.log)
- CONTROL: journal 1111 -> 1111 lines in 120 s with no resume
- EARLIER: 1.45 tasks/min at task 13, 2 at the cut; 10-record band 1.24 .. 3.62
- FIRST (20 min): lines 1111 -> 1234, 41 records, 2.0343 records/min (bench RATE 2.04), 292 model calls, parseable yes
- SECOND (2 min): lines 1234 -> 1249, 5 records, keys already present 0, parseable yes
- duplicated keys 0 -> 0; bench/public.mjs alive 0; BAR MET (isTheBar true, barMet true)
- Peak RSS: bench 90.043 MB, whole tree 406.7 MB

## Defect found by the bar, fixed after it
Both bar resumes recorded cutAt as "2026-09-26T04". A lazy regex stopped at the first colon of the ISO stamp. The whole stamps are in the chain log's CUT lines: 04:16:36.917Z and 04:19:34.380Z. Fixed in parseBenchTail(), with a test on the real CUT line. A 1-minute resume after the fix (`node self/resume.mjs --minutes 1`) printed cut 2026-09-26T04:21:55.762Z and lines 1249 -> 1258, with 21 model calls. resume.json is written once and keeps the short stamp.

## Tests
`node --test test/resume.test.mjs`: 10 pass. `test/public*.test.mjs`: 27 pass. `test/autopilot.test.mjs`: 34 pass.
