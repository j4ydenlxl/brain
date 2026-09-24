# notes/cells.md: expanded cell library (perception, dynamics, reasoning, stats)

No core change was needed. core/signal.mjs, core/cell.mjs, core/primitives.mjs and
cells/basic.mjs were read only, never edited. `node --test test/cells.test.mjs` from
the brain directory: 22 pass, 0 fail (see the report for the full command output).

## Design decisions worth recording

- **encode.number / encode.time** use hyperdimensional thermometer codes (bundle of
  item vectors for levels 0..L, or a circular window of levels for a periodic phase)
  rather than a learned embedding. This is the standard VSA technique for continuous
  and cyclic variables (nearby values share most bundled terms, so hv similarity
  degrades smoothly) and needs no training.
- **encode.time** treats its num input as milliseconds and factors it into four
  periodic phases (ms-in-s, s-in-min, min-in-h, h-in-day), each bound to its own role
  vector and bundled. Measured: two timestamps exactly 24h apart come out
  bit-identical (sim = 1, printed by the test), since 24h is an exact multiple of
  every one of those four cycle lengths; 12h apart only the hour phase flips, so
  similarity is lower but not zero.
- **encode.vec** keys its random projection matrix purely off `params.seed` (not
  `cell.id`), unlike vec.mlp in basic.mjs which mixes in the id. The assignment asked
  for this kind to be deterministic; keying off the id would make two cells with the
  same seed project differently, which seemed like the wrong default for something
  meant to be reproduced or shared.
- **reservoir.echo** scales its recurrent matrix by drawing entries from
  N(0, (spectralRadius/sqrt(nres))^2) rather than running a power-iteration
  eigenvalue estimate. This is the standard circular-law initialization (an n x n iid
  matrix's eigenvalues concentrate in a disk of that radius as n grows) and avoids
  adding an eigenvalue solver. Measured on a one-step-ahead sine prediction
  (nres=40, 2000 steps): rmse fell from 0.2184 (first 50 predictions) to 0.0068
  (last 50), printed by the test.
- **sym.diff** returns the unsimplified derivative tree (it does not call
  sym.simplify internally); evalSym is exact regardless of how many redundant
  zero/one terms are in the tree, so the test checks the numeric result rather than
  the tree shape. d/dx(3x^2 + 2x) at x=5 evaluates to exactly 32.
- **sym.simplify** folds any subtree with no variables via primitives.evalSym, plus a
  small set of identities (x+0, x*1, x*0, x-0, x/1) for subtrees that still contain a
  variable. It is not a full CAS (no like-term collection across a sum, no expansion);
  the assignment asked for constant folding specifically.
- **stat.correlate** treats a "sample" as an (x, y) pair delivered on the same run,
  not two independently-timed streams reconciled later. Simpler, and matches how
  every other paired-port cell in basic.mjs (num.arith, num.compare) already work.
- **rate.meter** recomputes and emits on every run, even with no new event, so a
  periodic caller sees the rate decay as old events age out of the window without
  needing to keep injecting events. Confirmed in the test: 10 events across a 1000ms
  window read back as rate 10, and reading again 1100ms later (no new events) reads
  back as 0.

## Kind names registered (cells/index.mjs imports all five modules)

perception.mjs: encode.number, encode.time, encode.vec, encode.image, decode.hv,
tokenize.text
dynamics.mjs: liquid.cfc, reservoir.echo, oscillator, timer, integrate.leaky
reasoning.mjs: hopfield.assoc, knn.retrieve, logic.gate, sym.simplify, sym.diff,
verify.numeric
stats.mjs: stat.running, stat.histogram, stat.correlate, anomaly.zscore, rate.meter

None collide with cells/basic.mjs (checked by running `node --test test/core.test.mjs
test/cells.test.mjs` together: 37 pass, 0 fail, both files' kinds coexist).
