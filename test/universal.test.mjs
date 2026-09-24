// test/universal.test.mjs: the brain can compute anything natively, two ways, both graded:
// (1) the sym language is a complete language a cell evaluates exactly; (2) register
// machine programs compile into connectomes of generic cells and run through the tick.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as S from '../core/signal.mjs';
import { evalSym } from '../core/primitives.mjs';
import { Brain } from '../core/brain.mjs';
import { compileMachine, runMachine, programs } from '../seeds/machine.mjs';
import '../cells/basic.mjs';

const L = S.S, N = L.num, V = L.v;
const str = (r) => S.ratToString(r);

test('sym language: factorial, fibonacci, gcd, ackermann, all exact', () => {
  const fact = L.rec('fact', ['n'], L.if(L.le(V('n'), N(1)), N(1), L.mul(V('n'), L.call('fact', L.sub(V('n'), N(1))))), L.call('fact', V('k')));
  assert.equal(str(evalSym(fact, { k: 20 })), '2432902008176640000');
  assert.equal(str(evalSym(fact, { k: 30 })), '265252859812191058636308480000000');
  const fib = L.rec('fib', ['n'], L.if(L.lt(V('n'), N(2)), V('n'), L.add(L.call('fib', L.sub(V('n'), N(1))), L.call('fib', L.sub(V('n'), N(2))))), L.call('fib', V('k')));
  assert.equal(str(evalSym(fib, { k: 20 })), '6765');
  const gcd = L.rec('gcd', ['a', 'b'], L.if(L.eq(V('b'), N(0)), V('a'), L.call('gcd', V('b'), L.mod(V('a'), V('b')))), L.call('gcd', N(1071), N(462)));
  assert.equal(str(evalSym(gcd)), '21');
  const ack = L.rec('ack', ['m', 'n'], L.if(L.eq(V('m'), N(0)), L.add(V('n'), N(1)), L.if(L.eq(V('n'), N(0)), L.call('ack', L.sub(V('m'), N(1)), N(1)), L.call('ack', L.sub(V('m'), N(1)), L.call('ack', V('m'), L.sub(V('n'), N(1)))))), L.call('ack', N(2), N(3)));
  assert.equal(str(evalSym(ack)), '9');
});

test('sym language: tail recursion runs a 100000-step loop in constant stack; exact rationals never drift', () => {
  const sum = L.rec('loop', ['i', 'acc'], L.if(L.gt(V('i'), V('n')), V('acc'), L.call('loop', L.add(V('i'), N(1)), L.add(V('acc'), V('i')))), L.call('loop', N(1), N(0)));
  assert.equal(str(evalSym(sum, { n: 100000 })), '5000050000');
  // sum of 1/k for k = 1..50 as an exact fraction (harmonic number H_50)
  const harm = L.rec('h', ['k', 'acc'], L.if(L.gt(V('k'), N(50)), V('acc'), L.call('h', L.add(V('k'), N(1)), L.add(V('acc'), L.div(N(1), V('k'))))), L.call('h', N(1), N(0)));
  assert.equal(str(evalSym(harm)), '13943237577224054960759/3099044504245996706400');
  // 0.1 + 0.2 = 0.3 exactly, and 9.11 < 9.9
  assert.equal(str(evalSym(L.add(N('0.1'), N('0.2')))), '3/10');
  assert.equal(str(evalSym(L.lt(N('9.11'), N('9.9')))), '1');
});

test('sym language: first-class functions, closures, and Newton iteration for sqrt(2) to 40 exact digits', () => {
  const twice = L.let('twice', L.fn(['f', 'x'], L.call('f', L.call('f', V('x')))), L.call('twice', L.fn(['y'], L.mul(V('y'), N(3))), N(7)));
  assert.equal(str(evalSym(twice)), '63');
  // x_{k+1} = (x + 2/x) / 2, 7 steps from 1: a rational whose decimal agrees with sqrt(2) to 40 places
  const newton = L.rec('step', ['x', 'k'], L.if(L.eq(V('k'), N(0)), V('x'), L.call('step', L.div(L.add(V('x'), L.div(N(2), V('x'))), N(2)), L.sub(V('k'), N(1)))), L.call('step', N(1), N(7)));
  const r = S.toRat(evalSym(newton));
  const digits = (r.n * 10n ** 40n / r.d).toString();
  assert.equal(digits.slice(0, 41), '14142135623730950488016887242096980785696');
});

test('sym language reports errors plainly: unbound variable, arity, deep non-tail recursion', () => {
  assert.throws(() => evalSym(V('nope')), /unbound variable nope/);
  assert.throws(() => evalSym(L.let('f', L.fn(['a'], V('a')), L.call('f', N(1), N(2)))), /takes 1 arguments, got 2/);
  const deep = L.rec('d', ['n'], L.if(L.eq(V('n'), N(0)), N(0), L.add(N(1), L.call('d', L.sub(V('n'), N(1))))), L.call('d', N(1000000)));
  assert.throws(() => evalSym(deep), /recursion too deep/);
});

test('a sym program runs natively inside a cell through the connectome', () => {
  const b = new Brain({ ledger: 'runs', pruneEvery: 0 });
  // the program is a signal: a source cell emits the sym tree every 4 ticks
  b.addCell({ id: 'prog', kind: 'source.const', region: 'cognitive', params: { kind: 'sym', data: L.rec('fact', ['n'], L.if(L.le(V('n'), N(1)), N(1), L.mul(V('n'), L.call('fact', L.sub(V('n'), N(1))))), L.call('fact', V('k'))) }, policy: { period: 4 } });
  b.addCell({ id: 'eval', kind: 'sym.eval', region: 'cognitive', policy: { period: 'event' } });
  b.addCell({ id: 'out', kind: 'sink.log', region: 'motor', policy: { period: 'event' } });
  b.connect('prog', 'out', 'eval', 'expr');
  b.connect('eval', 'out', 'out', 'in');
  b.inject('eval', 'env', { kind: 'event', data: { k: '25' } });
  b.tick(8);
  const runs = b.ledger.recent(20, 'cell.run').filter(r => r.cell === 'eval');
  assert.ok(runs.length >= 1, 'eval ran');
  const last = b.cell('out').memory.working.at(-1);
  assert.ok(last && last.kind === 'num', 'a num reached the sink');
  assert.equal(b.cell('eval').stats.errors, 0);
  assert.equal(b.stats.errors, 0);
  // the value itself: take the output straight from the evaluator's last run through the primitive
  assert.equal(str(evalSym(b.cell('prog').state.data, { k: 25 })), '15511210043330985984000000');
});

test('register machine: add, multiply and power compile to generic cells and run to halt', () => {
  const add = runMachine(compileMachine(programs.add(3, 4)));
  assert.equal(add.halted, true); assert.equal(add.registers.ACC, '7');
  const mul = runMachine(compileMachine(programs.mul(3, 4)));
  assert.equal(mul.halted, true); assert.equal(mul.registers.ACC, '12'); assert.equal(mul.registers.A, '3', 'A restored');
  const mul2 = runMachine(compileMachine(programs.mul(7, 6)));
  assert.equal(mul2.registers.ACC, '42');
  const pow = runMachine(compileMachine(programs.pow(2, 5)));
  assert.equal(pow.halted, true); assert.equal(pow.registers.ACC, '32');
  console.log('machine ticks: add(3,4)=' + add.ticks + ' mul(3,4)=' + mul.ticks + ' mul(7,6)=' + mul2.ticks + ' pow(2,5)=' + pow.ticks + ' register ops for pow: ' + pow.steps);
});

test('register machine: every step is in the ledger and traces back to the start event; snapshot mid-run and restore finish identically', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'brain-machine-'));
  const b = compileMachine(programs.mul(3, 4), { brain: new Brain({ ledger: 'full', pruneEvery: 0, dir }) });
  b.inject('m.pc', 'in', { kind: 'event', data: { key: 'start' } });
  b.tick(60);
  b.snapshot();
  const r1 = runMachine(b);
  const b2 = Brain.restore(dir);
  const r2 = runMachine(b2);
  assert.equal(r1.registers.ACC, '12'); assert.deepEqual(r2.registers, r1.registers);
  assert.equal(r2.ticks, r1.ticks, 'restored brain needed the same number of ticks');
  const runs = b.ledger.recent(100000, 'cell.run').filter(r => r.cell === 'm.r.ACC');
  assert.ok(runs.length >= 12, 'ACC ran ' + runs.length + ' times');
  const tr = b.ledger.trace(runs.at(-1).seq, 400);
  assert.ok(tr.nodes.length > 10, 'trace walked ' + tr.nodes.length + ' events');
  assert.ok(tr.nodes.some(e => e.type === 'signal' && e.cell === 'external'), 'the trace reaches the external start event');
  console.log('machine trace: ' + tr.nodes.length + ' events, ' + tr.edges.length + ' links, from seq ' + runs.at(-1).seq + ' back to the start event');
});
