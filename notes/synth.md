# notes/synth.md

Board 11, item code (P6). Owns `reason/synth.mjs`, `bench/synth.mjs`, `test/synth.test.mjs`,
`bench/verdicts/synth.json`, `bench/verdicts/synth/` (journals) and this note.

`synthesize({prompt, model, k, timeoutMs, repair})` turns the docstring's examples (doctest, Example,
returns) into assertions, samples up to k completions, runs each in act/run.mjs's sandbox under a
clock, keeps the first that passes all (else the most), and repairs once with the failing call and
error. It never sees the record's `tests` string.

Bar run: `node tools/budget.mjs ... -- node --max-old-space-size=6000 bench/synth.mjs`, exit 0,
wall 8064.33 s, peak ram 89.6MB. Development records: HumanEval 0 to 39 by index and the 40 task
internal suite. Records 40 to 160 are held out.

| qwen3:1.7b, pass@1 on hidden tests | HumanEval 0-39 | internal 40 |
| --- | --- | --- |
| organism k=5+repair | 36/40, 90.00% [76.95%, 96.04%] | 23/40 |
| organism k=5 | 34/40 | 19/40 |
| organism k=1 | 29/40 | 12/40 |
| model alone | 26/40, 65.00% [49.51%, 77.87%] | 12/40 |
| null | 0/40 | 0/40 |

HumanEval: gap 25.00% vs interval overlap 0.92%, MET, but the intervals are not disjoint. Exact
McNemar p 0.006348 (11 records only the organism, 1 only the model). Cost: mean 31.52 s and 2.23
calls per record against 11.08 s and 1.00. qwen3:30b-a3b stopped at 15 of 40 by its 25 minute clock:
k=1 14/15, alone 13/15. Latencies are wall clock on a shared Ollama queue.

Open: the returns reader took "where fib(0) is 0" as fib(0) === 0 on bigint.fib.2, rejecting 10
draws that passed hidden; drop a returns assertion whose type disagrees with the doctests. Held-out
extraction (115 of 121 records) was printed but never tuned on.
