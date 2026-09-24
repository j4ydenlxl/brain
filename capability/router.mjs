// capability/router.mjs: THE FRONT DOOR. One request, any kind, no build step.
//
// Modern assistants have to be told what to build. This brain is handed a request and
// works out for itself what kind of thing it is, which part of itself can answer it, and
// what it learned by answering. The router classifies (arithmetic, algebra, list,
// sequence, grid, decision), then routes to, in this order:
//
//   1. a stored skill, if one reproduces the request's own examples (memory before search)
//   2. the exact solvers, for arithmetic and for algebra
//   3. the task suites in tasks/, for sequences and for grids
//   4. induction, for anything stated as examples and not yet known
//   5. a decision policy, for a market-shaped request
//
// Every answer arrives with a TRACE: the real cells that contributed, by id and kind,
// with the ledger sequence of each run, so an answer can be walked backwards. That is a
// requirement of the manual and not a convenience: an answer nobody can trace is an
// answer nobody can check.
import { defineKind } from '../core/cell.mjs';
import { Brain } from '../core/brain.mjs';
import * as S from '../core/signal.mjs';
import { evalSym } from '../core/primitives.mjs';
import { parse } from '../lang/parse.mjs';
import { induceFromExamples, solveLinearExact, evalTerm, valueToString, typeOf, isList, num, list, printTerm, libraryOp } from './induce.mjs';
import { SkillRegistry, defaultRegistry, addSkillCell, registryOf } from './skills.mjs';
import { fitSequence } from '../tasks/sequence.mjs';
import { searchProgram, runProgramInBrain } from '../tasks/grid.mjs';
import '../cells/basic.mjs';

const first = (m) => (m.length ? m[m.length - 1].sig : null);

export const ROUTES = Object.freeze(['arithmetic', 'algebra', 'list', 'sequence', 'grid', 'decision']);

// ---------------------------------------------------------------- classification
// The shape of the request decides, not a word in it. A request that carries examples is
// an induction request whatever its subject; a request that carries an equals sign is
// algebra; terms are a sequence; demonstrations of grids are a grid.
export function classify(request) {
  if (!request || typeof request !== 'object') return { route: null, why: 'a request must be an object' };
  if (request.route && ROUTES.includes(request.route)) return { route: request.route, why: 'named by the request' };
  if (request.decision || request.market || request.features) return { route: 'decision', why: 'carries features to decide on' };
  if (request.demos) return { route: 'grid', why: 'carries input and output grids' };
  if (request.terms) return { route: 'sequence', why: 'carries the terms of a sequence' };
  if (request.eq || (request.sym && request.sym.op === '=')) return { route: 'algebra', why: 'carries an equation' };
  if (request.text && String(request.text).includes('=')) return { route: 'algebra', why: 'the text carries an equals sign' };
  if (request.examples && request.examples.length) {
    const e = request.examples[0];
    const anyList = isList(e.out) || Object.values(e.in).some(isList);
    return { route: anyList ? 'list' : 'arithmetic', why: anyList ? 'examples over lists' : 'examples over numbers' };
  }
  if (request.sym || request.text) return { route: 'arithmetic', why: 'a closed expression to evaluate' };
  return { route: null, why: 'no shape matched' };
}

// ---------------------------------------------------------------- the cell
// A Brain holding one 'solve' cell can already classify and answer the exact routes on
// its own, with no driver: this is the front door as a cell.
defineKind('solve', {
  doc: 'Classifies a request arriving as an event (or a sym expression) into arithmetic, algebra, list, sequence, grid or decision, emits the classification on route, and answers on answer whenever the route is one it can close by itself (a closed expression, a linear equation, or a stored skill that reproduces the request examples).',
  ports: {
    in: [{ name: 'request', kinds: ['event', 'sym'] }],
    out: [{ name: 'route', kinds: ['event'] }, { name: 'answer', kinds: ['event'] }],
  },
  defaults: { variable: 'x' },
  init: () => ({ seen: 0, answered: 0, byRoute: {} }),
  compute: (ins, cell, ctx) => {
    const sig = first(ins[0]);
    if (!sig) return [null, null];
    const request = sig.kind === 'sym' ? { sym: sig.data } : sig.data;
    const { route, why } = classify(request);
    cell.state.seen++;
    cell.state.byRoute[route || 'none'] = (cell.state.byRoute[route || 'none'] || 0) + 1;
    const routeOut = { kind: 'event', data: { route, why, cell: cell.id } };
    let answer = null;
    try {
      if (route === 'arithmetic' && !request.examples) {
        const tree = request.sym || parse(String(request.text));
        answer = { answer: S.ratToString(S.toRat(evalSym(tree, request.env || {}))), by: 'exact evaluation', cell: cell.id };
      } else if (route === 'algebra') {
        const tree = request.sym || parse(String(request.eq || request.text));
        const r = solveLinearExact(tree, request.variable || cell.params.variable);
        answer = { answer: r.value ?? null, verified: r.verified === true, by: 'exact solve and substitution', reason: r.reason ?? null, cell: cell.id };
      } else if (request.examples && request.ask) {
        const registry = registryOf(ctx);
        const skill = registry.match(request.examples);
        if (skill) {
          const env = {}; const keys = Object.keys(request.ask);
          for (let i = 0; i < skill.vars.length; i++) env[skill.vars[i]] = coerce(request.ask[skill.vars[i]] ?? request.ask[keys[i]]);
          answer = { answer: valueToString(registry.apply(skill, env)), by: 'stored skill ' + skill.name, cell: cell.id };
        }
      }
    } catch (err) { answer = { error: String(err && err.message || err), cell: cell.id }; }
    if (answer) cell.state.answered++;
    return [routeOut, answer ? { kind: 'event', data: { route, ...answer } } : null];
  },
  serialize: (s) => ({ ...s }),
  cost: 2,
});
function coerce(v) { return Array.isArray(v) ? list(v) : num(v); }

// ---------------------------------------------------------------- the solver
// The driver: a brain with the front door, the exact evaluators, the sequence fitter and
// whatever skill cells the registry has grown, plus the trace of what actually ran.
export class Solver {
  // The ledger runs at 'full' by default and not at 'runs': trace-back is a requirement of
  // the manual, and only the full level records the signal events that let a cell run be
  // walked back to the request that caused it.
  constructor({ registry = defaultRegistry, name = 'solver', ledger = 'full', maxSize = 7 } = {}) {
    this.registry = registry;
    this.maxSize = maxSize;
    this.brain = new Brain({ name, ledger, pruneEvery: 0, growth: { threshold: Number.MAX_SAFE_INTEGER } });
    this.brain.capability = { registry };
    this.brain.addCell({ id: 'router', kind: 'solve', region: 'cognitive', circuit: 'front', policy: { period: 'event' } });
    this.brain.addCell({ id: 'eval', kind: 'sym.eval', region: 'cognitive', circuit: 'exact', policy: { period: 'event' } });
    this.brain.addCell({ id: 'algebra', kind: 'sym.solve', region: 'cognitive', circuit: 'exact', policy: { period: 'event' } });
    this.brain.addCell({ id: 'fit', kind: 'seq.fit', region: 'cognitive', circuit: 'induction', policy: { period: 'event' } });
    this.stats = { requests: 0, byRoute: {}, skillHits: 0, searches: 0, gridTags: 0 };
  }

  // Run one cell by hand: inject, tick, take whatever it put in the outbox. The ledger
  // window around the run is what the trace is built from, so the trace names cells that
  // really ran and not cells the code expected to run.
  _fire(cellId, port, payload, { ticks = 2, outPort = 0 } = {}) {
    const idx = this.brain.cell(cellId).idx;
    const mark = this.brain.ledger.seq;
    this.brain.inject(cellId, port, payload);
    this.brain.tick(ticks);
    const outs = this.brain.takeOutbox().filter(s => s.src === idx);
    const byPort = {};
    for (const s of outs) byPort[s.port] = s;
    const runs = this.brain.ledger.recent(200, 'cell.run').filter(e => e.seq >= mark && e.cell === cellId);
    return { sig: byPort[outPort] ?? null, byPort, seq: runs.length ? runs[runs.length - 1].seq : -1 };
  }
  _note(trace, cellId, why, seq) {
    trace.push({ cell: cellId, kind: this.brain.byId.has(cellId) ? this.brain.cell(cellId).kind : 'external', why, seq });
  }

  solve(request) {
    const t0 = performance.now();
    const trace = [];
    this.stats.requests++;
    // The front door runs first, always: the classification is a cell's output, not a
    // branch in this driver.
    const routed = this._fire('router', 'request', { kind: 'event', data: request });
    const routeData = routed.sig ? routed.sig.data : classify(request);
    const route = routeData.route;
    this._note(trace, 'router', 'classified as ' + route + ' (' + routeData.why + ')', routed.seq);
    this.stats.byRoute[route || 'none'] = (this.stats.byRoute[route || 'none'] || 0) + 1;
    let out;
    switch (route) {
      case 'arithmetic': out = request.examples ? this._byExamples(request, trace) : this._arithmetic(request, trace); break;
      case 'algebra': out = this._algebra(request, trace); break;
      case 'list': out = this._byExamples(request, trace); break;
      case 'sequence': out = this._sequence(request, trace); break;
      case 'grid': out = this._grid(request, trace); break;
      case 'decision': out = this._decision(request, trace); break;
      default: out = { answer: null, error: 'no route for this request: ' + routeData.why };
    }
    return { route, ...out, trace, cells: trace.map(t => t.cell), ms: Number((performance.now() - t0).toFixed(3)) };
  }

  _arithmetic(request, trace) {
    const tree = request.sym || parse(String(request.text));
    const env = {};
    for (const [k, v] of Object.entries(request.env || {})) env[k] = S.ratToString(num(v));
    const r = this._fire('eval', 'expr', { kind: 'sym', data: tree });
    if (Object.keys(env).length) this.brain.inject('eval', 'env', { kind: 'event', data: env });
    this._note(trace, 'eval', 'evaluated the expression exactly', r.seq);
    if (!r.sig) return { answer: null, error: 'the evaluator produced nothing' };
    return { answer: S.ratToString(S.toRat(r.sig.data)), by: 'sym.eval', exact: true };
  }

  _algebra(request, trace) {
    const tree = request.sym || parse(String(request.eq || request.text));
    const name = request.variable || 'x';
    const r = this._fire('algebra', 'eq', { kind: 'sym', data: tree });
    this._note(trace, 'algebra', 'structural linear solve', r.seq);
    const exact = solveLinearExact(tree, name);
    const cellSaid = r.sig && r.sig.data && r.sig.data.value !== undefined ? r.sig.data.value : null;
    return {
      answer: exact.solved ? exact.value : null,
      variable: name, verified: exact.verified === true,
      left: exact.left ?? null, right: exact.right ?? null,
      agreesWithCell: cellSaid === null ? null : cellSaid === exact.value,
      by: 'two probes, a linearity check at a third point, and substitution back into the equation',
      reason: exact.reason ?? null,
    };
  }

  _sequence(request, trace) {
    const r = this._fire('fit', 'terms', { kind: 'event', data: { terms: request.terms.map(t => S.ratToString(num(t))) } });
    this._note(trace, 'fit', 'fitted a verified sym program to the terms', r.seq);
    const d = r.sig ? r.sig.data : null;
    return { answer: d ? d.next : null, model: d ? d.model : null, program: d ? d.program : null, tried: d ? d.tried : 0, by: 'seq.fit' };
  }

  _grid(request, trace) {
    const found = searchProgram(request.demos, { maxDepth: request.maxDepth || 3 });
    if (!found.program) return { answer: null, searched: found.searched, error: 'no grid program found at this depth' };
    const tag = 'r' + (this.stats.gridTags++);
    const input = request.ask || request.test || request.demos[0].input;
    const mark = this.brain.ledger.seq;
    const run = runProgramInBrain(this.brain, found.program, input, tag);
    for (const id of run.cells) {
      const runs = this.brain.ledger.recent(400, 'cell.run').filter(e => e.seq >= mark && e.cell === id);
      this._note(trace, id, 'grid step ' + this.brain.cell(id).kind, runs.length ? runs[runs.length - 1].seq : -1);
    }
    return { answer: run.grid, program: found.names, searched: found.searched, by: 'tasks/grid search executed through real cells' };
  }

  // Examples, the general case. Memory first: if a stored skill reproduces every example
  // there is no search at all, which is what makes the second request of a family cheap.
  _byExamples(request, trace) {
    const examples = request.examples.map(e => ({ in: mapEnv(e.in), out: coerce(e.out) }));
    let skill = this.registry.match(examples);
    let searched = 0, searchMs = 0, reused = true;
    if (skill) this.stats.skillHits++;
    if (!skill) {
      reused = false;
      this.stats.searches++;
      const library = [];
      for (const s of this.registry.list()) { const op = libraryOp(s); if (op) library.push(op); }
      const r = induceFromExamples(examples, { maxSize: request.maxSize || this.maxSize, library });
      searched = r.searched; searchMs = r.ms;
      if (!r.solved) return { answer: null, searched, error: 'no program of this size reproduces the examples', searchMs: Number(searchMs.toFixed(2)) };
      const vars = r.vars;
      skill = this.registry.store({
        name: request.name || ('induced.' + (this.registry.size + 1)),
        program: r.program, text: r.text, type: r.type, vars,
        inTypes: vars.map(v => typeOf(examples[0].in[v])), examples, cost: r.size,
        family: request.family || classify(request).route,
      });
    }
    // The answer comes out of a real skill cell, so the connectome holds what was learned.
    const cell = addSkillCell(this.brain, skill);
    if (!request.ask) return { answer: null, skill: skill.name, program: skill.text, reused, searched, searchMs: Number(searchMs.toFixed(2)), note: 'no ask given, the skill is stored' };
    const env = {};
    const keys = Object.keys(request.ask);
    for (let i = 0; i < skill.vars.length; i++) env[skill.vars[i]] = request.ask[skill.vars[i]] ?? request.ask[keys[i]];
    const fired = this._fire(cell.id, 'request', { kind: 'event', data: { args: env } });
    this._note(trace, cell.id, (reused ? 'reused the stored skill ' : 'applied the freshly induced skill ') + skill.name, fired.seq);
    const value = evalTerm(skill.program, mapEnv(env));
    return {
      answer: valueToString(value), skill: skill.name, program: skill.text, reused,
      searched, searchMs: Number(searchMs.toFixed(2)), cellAnswer: cellAnswerOf(fired),
      by: reused ? 'memory' : 'induction',
    };
  }

  // A decision request is answered by a policy skill (market.mjs induces one the same way
  // every other skill is induced). With no policy stored, the router says so plainly
  // rather than inventing a decision.
  _decision(request, trace) {
    const name = request.policy || 'market.policy';
    if (!this.registry.has(name)) return { answer: null, error: 'no decision policy named ' + name + ' has been induced yet' };
    const skill = this.registry.get(name);
    const cell = addSkillCell(this.brain, skill);
    const features = request.features || request.decision || {};
    const env = {};
    for (const v of skill.vars) env[v] = num(features[v] ?? 0);
    const fired = this._fire(cell.id, 'request', { kind: 'event', data: { args: env } });
    this._note(trace, cell.id, 'scored the features with the induced policy ' + name, fired.seq);
    const value = S.toRat(evalTerm(skill.program, env));
    const side = value.n > 0n ? 'buy' : value.n < 0n ? 'sell' : 'hold';
    return { answer: side, score: S.ratToString(value), policy: name, program: skill.text, by: 'induced policy through a skill cell', cellAnswer: cellAnswerOf(fired) };
  }

  report() {
    return {
      requests: this.stats.requests, byRoute: this.stats.byRoute,
      skillHits: this.stats.skillHits, searches: this.stats.searches,
      cells: this.brain.cells.length, edges: this.brain.connectome.size(),
      ledger: this.brain.ledger.seq, registry: this.registry.report(),
    };
  }
}
// The skill cell answers a num on the sym port and a list on the report port, so the
// cross-check reads whichever port carried the answer.
function cellAnswerOf(fired) {
  if (fired.byPort[0]) return S.ratToString(S.toRat(fired.byPort[0].data.value));
  if (fired.byPort[1] && fired.byPort[1].data.answer !== undefined) return fired.byPort[1].data.answer;
  return null;
}
function mapEnv(o) { const r = {}; for (const k of Object.keys(o)) r[k] = coerce(o[k]); return r; }

export function solveOne(request, opts = {}) { return new Solver(opts).solve(request); }
