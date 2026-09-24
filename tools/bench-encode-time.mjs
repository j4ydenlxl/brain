// tools/bench-encode-time.mjs: ms per run of the encode.time kind, the number notes/whole.md
// request 7 asks for. Runs the kind's compute directly on a real cell, with distinct
// timestamps so no run repeats an input.
//   node tools/bench-encode-time.mjs [runs]
import { createCell, getKind } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';
import '../cells/perception.mjs';

const runs = Number(process.argv[2] || 200);
const cell = createCell({ id: 'pe.time', kind: 'encode.time' });
const kind = getKind('encode.time');
const ctx = { t: 0 };
const mk = (ms) => [[{ sig: S.signal('num', S.int(ms)), w: 1, e: -1, from: -1 }]];

for (let i = 0; i < 20; i++) kind.compute(mk(1_700_000_000_000 + i * 37), cell, ctx); // warm
const t0 = Number(process.hrtime.bigint());
let checksum = 0;
for (let i = 0; i < runs; i++) {
  const out = kind.compute(mk(1_700_000_000_000 + i * 1237), cell, ctx);
  checksum += out[0].data[i % S.D];
}
const ms = (Number(process.hrtime.bigint()) - t0) / 1e6;
console.log('encode.time: ' + runs + ' runs in ' + ms.toFixed(2) + ' ms, ' + (ms / runs).toFixed(4) + ' ms per run (checksum ' + checksum + ')');
