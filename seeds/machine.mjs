// seeds/machine.mjs: PROGRAMS AS CONNECTOMES. Compiles a Minsky register machine into
// generic cells and edges. Minsky (1961) proved two counters with INC and DEC-or-branch
// are enough for any computation, so a brain that runs these programs natively is a
// universal computer by construction, and every step of every program is in the ledger.
//
// program = { registers: { A: 3, B: 4, ACC: 0 }, start: '1', code: {
//   '1': ['dec', 'B', '2', 'halt'],   // dec B; nonzero -> 2, zero -> halt
//   '2': ['inc', 'ACC', '1'],         // inc ACC; -> 1
// } }
//
// Cells: one state.machine (the program counter), one num.register per register, one
// event.filter per instruction. The filter for label L fires when the counter enters L
// and pokes the register; the register answers with a zero/nonzero test event, which is
// the only event the counter receives, so it is always about the instruction just run.
import { Brain } from '../core/brain.mjs';
import * as S from '../core/signal.mjs';
import '../cells/basic.mjs';
import '../cells/control.mjs';

export function compileMachine(program, { brain = null, prefix = 'm', region = 'cognitive', circuit = 'machine' } = {}) {
  const b = brain || new Brain({ name: 'machine', ledger: 'runs', pruneEvery: 0 });
  const id = (s) => prefix + '.' + s;
  const labels = Object.keys(program.code);
  const transitions = { idle: { start: program.start } };
  for (const L of labels) {
    const ins = program.code[L];
    if (ins[0] === 'inc') transitions[L] = { zero: ins[2], nonzero: ins[2] };
    else if (ins[0] === 'dec') transitions[L] = { nonzero: ins[2], zero: ins[3] };
    else throw new Error('unknown instruction ' + ins[0]);
    if (!program.code[ins[2]] && ins[2] !== 'halt') throw new Error('jump to unknown label ' + ins[2]);
    if (ins[0] === 'dec' && !program.code[ins[3]] && ins[3] !== 'halt') throw new Error('jump to unknown label ' + ins[3]);
  }
  b.addCell({ id: id('pc'), kind: 'state.machine', region, circuit, params: { initial: 'idle', transitions }, policy: { period: 'event' } });
  for (const [r, v] of Object.entries(program.registers)) {
    b.addCell({ id: id('r.' + r), kind: 'num.register', region, circuit, params: { initial: v }, policy: { period: 'event' } });
    b.connect(id('r.' + r), 'test', id('pc'), 'in');
  }
  for (const L of labels) {
    const [op, r] = program.code[L];
    b.addCell({ id: id('i.' + L), kind: 'event.filter', region, circuit, params: { field: 'to', value: L, emit: 'exec' }, policy: { period: 'event' } });
    b.connect(id('pc'), 'out', id('i.' + L), 'in');
    b.connect(id('i.' + L), 'out', id('r.' + r), op);
  }
  b.addCell({ id: id('halted'), kind: 'event.filter', region, circuit, params: { field: 'to', value: 'halt' }, policy: { period: 'event' } });
  b.connect(id('pc'), 'out', id('halted'), 'in');
  return b;
}

// Run a compiled machine until the counter reaches halt or maxTicks. Returns registers.
export function runMachine(b, { prefix = 'm', maxTicks = 100000 } = {}) {
  const pc = b.cell(prefix + '.pc');
  if (pc.state.state === 'idle') b.inject(prefix + '.pc', 'in', { kind: 'event', data: { key: 'start' } });
  let ticks = 0;
  while (pc.state.state !== 'halt' && ticks < maxTicks) { b.tick(1); ticks++; }
  return { halted: pc.state.state === 'halt', ticks, registers: readRegisters(b, prefix), steps: countSteps(b, prefix) };
}
export function readRegisters(b, prefix = 'm') {
  const out = {};
  for (const c of b.cells) if (c.kind === 'num.register' && c.id.startsWith(prefix + '.r.')) out[c.id.slice(prefix.length + 3)] = c.state.n.toString();
  return out;
}
function countSteps(b, prefix) { let n = 0; for (const c of b.cells) if (c.kind === 'num.register' && c.id.startsWith(prefix + '.r.')) n += c.state.ops; return n; }

// Library of programs written for this machine.
export const programs = {
  // ACC = A + B (destroys B)
  add: (a, b) => ({ registers: { A: a, B: b, ACC: a }, start: '1', code: { '1': ['dec', 'B', '2', 'halt'], '2': ['inc', 'ACC', '1'] } }),
  // ACC = A * B (restores A through T each outer loop)
  mul: (a, b) => ({ registers: { A: a, B: b, ACC: 0, T: 0 }, start: '1', code: {
    '1': ['dec', 'B', '2', 'halt'],
    '2': ['dec', 'A', '3', '5'],
    '3': ['inc', 'ACC', '4'],
    '4': ['inc', 'T', '2'],
    '5': ['dec', 'T', '6', '1'],
    '6': ['inc', 'A', '5'],
  } }),
  // ACC = A ^ B by repeated multiplication: needs nested copies, so written with registers ACC, A, B, T, U
  pow: (a, b) => ({ registers: { A: a, B: b, ACC: 1, T: 0, U: 0 }, start: '1', code: {
    '1': ['dec', 'B', '2', 'halt'],      // for each exponent step
    '2': ['dec', 'ACC', '3', '7'],       // move ACC into U (U = ACC, ACC = 0)
    '3': ['inc', 'U', '2'],
    '7': ['dec', 'U', '8', '1'],         // for each unit of old ACC: ACC += A (restoring A via T)
    '8': ['dec', 'A', '9', '11'],
    '9': ['inc', 'ACC', '10'],
    '10': ['inc', 'T', '8'],
    '11': ['dec', 'T', '12', '7'],
    '12': ['inc', 'A', '11'],
  } }),
};
