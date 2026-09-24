// cells/control.mjs: CONTROL PRIMITIVES. Two generic cells that, with state.machine
// from basic.mjs, make the connectome a universal computer: a counter register (count,
// remember, test) and an event filter (route by predicate). seeds/machine.mjs compiles any
// Minsky register machine program into cells and edges from these three kinds alone.
import { defineKind } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';

const first = (mail) => mail.length ? mail[mail.length - 1].sig : null;

defineKind('num.register', {
  doc: 'Exact counter register with Minsky semantics: inc adds one (test nonzero); dec on zero leaves it and answers zero, otherwise subtracts one and answers nonzero; set (num); read (event) emits out (num).',
  ports: { in: [{ name: 'inc', kinds: ['event'] }, { name: 'dec', kinds: ['event'] }, { name: 'set', kinds: ['num'] }, { name: 'read', kinds: ['event'] }], out: [{ name: 'out', kinds: ['num'] }, { name: 'test', kinds: ['event'] }] },
  defaults: { initial: 0 },
  init: (p) => ({ n: BigInt(p.initial), ops: 0 }),
  compute: (ins, cell) => {
    const st = cell.state; let key = null, read = false;
    for (let i = 0; i < ins[0].length; i++) { st.n += 1n; st.ops++; key = 'nonzero'; }
    for (let i = 0; i < ins[1].length; i++) { st.ops++; if (st.n === 0n) key = 'zero'; else { st.n -= 1n; key = 'nonzero'; } }
    const s = first(ins[2]); if (s) { const r = S.toRat(s.data); if (r.d !== 1n) throw new Error('num.register: set needs an integer'); st.n = r.n; st.ops++; key = st.n === 0n ? 'zero' : 'nonzero'; }
    if (ins[3].length) read = true;
    const out = s || read ? { kind: 'num', data: S.rat(st.n) } : null;
    const test = key ? { kind: 'event', data: { key, value: st.n.toString(), register: cell.id } } : null;
    return [out, test];
  },
  serialize: (s) => ({ n: s.n.toString(), ops: s.ops }),
  deserialize: (j) => ({ n: BigInt(j.n), ops: j.ops }),
  cost: 1,
});

defineKind('event.filter', {
  doc: 'Passes an event when data[field] equals value (or is in values); optionally rewrites it to { key: emit }.',
  ports: { in: [{ name: 'in', kinds: ['event'] }], out: [{ name: 'out', kinds: ['event'] }] },
  defaults: { field: 'key', value: undefined, values: null, emit: null },
  compute: (ins, cell) => {
    const p = cell.params; let out = null;
    for (const it of ins[0]) {
      const v = it.sig.data[p.field];
      const ok = p.values ? p.values.includes(v) : v === p.value;
      if (ok) out = { kind: 'event', data: p.emit ? { key: p.emit, from: it.sig.data } : it.sig.data };
    }
    return [out];
  },
  cost: 1,
});
