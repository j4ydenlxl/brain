// seeds/basic.mjs: a seed brain: perception -> association -> cognitive -> motor,
// with exact-number and algebra cells in the cognitive region and a slow consolidation
// cell in memory. Small on purpose; the generations engine grows from here.
import { Brain } from '../core/brain.mjs';
import '../cells/basic.mjs';
import { SEC, MIN } from '../core/clock.mjs';

export function seedBasic(opts = {}) {
  const b = new Brain({ name: 'basic', ...opts });
  b.addRegion('perception', { doc: 'sensory input, encoding' });
  b.addRegion('association', { doc: 'pattern integration' });
  b.addRegion('cognitive', { doc: 'abstract reasoning, exact computation, planning' });
  b.addRegion('motor', { doc: 'action, interaction' });
  b.addRegion('memory', { doc: 'associative and consolidated memory' });

  // perception: text events become hypervectors
  b.addCell({ id: 'p.encode', kind: 'encode.hv', region: 'perception', circuit: 'text', policy: { period: 'event' } });
  b.addCell({ id: 'p.log', kind: 'sink.log', region: 'perception', circuit: 'text', policy: { period: 'event' } });
  // association: bundle over time, predict the next representation, compare to the prediction
  b.addCell({ id: 'a.bundle', kind: 'hv.bundle', region: 'association', circuit: 'integrate', policy: { period: 'event', learn: 'hebbian' } });
  b.addCell({ id: 'a.predict', kind: 'predict.next', region: 'association', circuit: 'integrate', policy: { period: 'event' } });
  b.addCell({ id: 'a.cleanup', kind: 'hv.cleanup', region: 'association', circuit: 'concepts', policy: { period: 'event' } });
  // memory: associative store keyed by hv, plus a slow consolidation tick
  b.addCell({ id: 'm.assoc', kind: 'memory.assoc', region: 'memory', circuit: 'episodic', policy: { period: 'event' } });
  b.addCell({ id: 'm.consolidate', kind: 'sink.log', region: 'memory', circuit: 'consolidate', policy: { period: MIN } });
  // cognitive: exact arithmetic, exact comparison, algebra
  b.addCell({ id: 'c.a', kind: 'source.const', region: 'cognitive', circuit: 'exact', params: { kind: 'num', data: null }, policy: { period: 'event' } });
  b.addCell({ id: 'c.cmp', kind: 'num.compare', region: 'cognitive', circuit: 'exact', policy: { period: 'event' } });
  b.addCell({ id: 'c.add', kind: 'num.arith', region: 'cognitive', circuit: 'exact', params: { op: '+' }, policy: { period: 'event' } });
  b.addCell({ id: 'c.solve', kind: 'sym.solve', region: 'cognitive', circuit: 'algebra', policy: { period: 'event' } });
  b.addCell({ id: 'c.verify', kind: 'sym.verify', region: 'cognitive', circuit: 'algebra', policy: { period: 'event' } });
  b.addCell({ id: 'c.route', kind: 'route.key', region: 'cognitive', circuit: 'decide', params: { keyField: 'name', table: { greet: 0, ask: 1, stop: 2 }, dflt: 3 }, policy: { period: 'event' } });
  // motor: a state machine and an action log
  b.addCell({ id: 'mo.fsm', kind: 'state.machine', region: 'motor', circuit: 'act', params: { initial: 'idle', transitions: { idle: { greet: 'listening', ask: 'answering' }, listening: { ask: 'answering', stop: 'idle' }, answering: { stop: 'idle', greet: 'listening' } } }, policy: { period: 'event' } });
  b.addCell({ id: 'mo.log', kind: 'sink.log', region: 'motor', circuit: 'act', policy: { period: 'event' } });
  // a heartbeat at 1 s and a counter to show periodic time next to event time
  b.addCell({ id: 'h.tick', kind: 'source.counter', region: 'cognitive', circuit: 'clock', policy: { period: SEC } });
  b.addCell({ id: 'h.log', kind: 'sink.log', region: 'cognitive', circuit: 'clock', policy: { period: 'event' } });

  b.connect('p.encode', 'hv', 'p.log', 'in');
  b.connect('p.encode', 'hv', 'a.bundle', 'in', { delay: 1 });
  b.connect('p.encode', 'hv', 'm.assoc', 'key');
  b.connect('p.encode', 'hv', 'm.assoc', 'query', { delay: 2 });
  b.connect('a.bundle', 'out', 'a.predict', 'observe', { delay: 1 });
  b.connect('a.bundle', 'out', 'a.cleanup', 'hv', { delay: 1 });
  b.connect('a.cleanup', 'match', 'c.route', 'in', { delay: 1 });
  b.connect('c.route', 'a', 'mo.fsm', 'in'); b.connect('c.route', 'b', 'mo.fsm', 'in'); b.connect('c.route', 'c', 'mo.fsm', 'in');
  b.connect('mo.fsm', 'out', 'mo.log', 'in');
  b.connect('c.solve', 'out', 'mo.log', 'in');
  b.connect('h.tick', 'out', 'h.log', 'in');
  return b;
}
