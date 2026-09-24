// capability/skills.mjs: THE SKILL REGISTRY. What the brain worked out once, it keeps.
//
// A skill is a program the brain induced, with the examples that forced it, what it cost
// to find, and how often it has been used since. Retrieval is MEMORY BEFORE SEARCH: a new
// request is matched against the stored skills first by running their programs on the
// request's own examples, and only a request that no stored program reproduces is allowed
// to start a search. That is why the second time a family of task appears it is answered
// with no search at all, and the registry prints the hit rate that proves it.
//
// A skill is also a cell. The kind 'skill' takes a request on a sym or event port and
// emits the answer as a sym literal (with an event report beside it, which is where a
// list answer goes, since a list has no spelling in the scalar language).
import { defineKind } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';
import { evalTerm, valueEq, valueToString, typeOf, isList, printTerm, num } from './induce.mjs';

const first = (m) => (m.length ? m[m.length - 1].sig : null);

// ---------------------------------------------------------------- program (de)serialization
// A program is a sym tree whose number leaves hold BigInt rationals, so it needs the
// signal module's own num encoding to survive JSON.
export function programToJSON(t) {
  if (!t || typeof t !== 'object') return t;
  const o = { op: t.op };
  if (t.op === 'num') { o.value = S.numToJSON(t.value); return o; }
  if (t.op === 'var') { o.name = t.name; return o; }
  if (t.fn) o.fn = programToJSON(t.fn);
  if (t.args) o.args = t.args.map(programToJSON);
  if (t.params) o.params = t.params;
  if (t.name) o.name = t.name;
  if (t.value && typeof t.value === 'object' && t.value.op) o.value = programToJSON(t.value);
  if (t.body) o.body = programToJSON(t.body);
  if (t.fbody) o.fbody = programToJSON(t.fbody);
  return o;
}
export function programFromJSON(j) {
  if (!j || typeof j !== 'object') return j;
  const o = { op: j.op };
  if (j.op === 'num') { o.value = S.numFromJSON(j.value); return o; }
  if (j.op === 'var') { o.name = j.name; return o; }
  if (j.fn) o.fn = programFromJSON(j.fn);
  if (j.args) o.args = j.args.map(programFromJSON);
  if (j.params) o.params = j.params;
  if (j.name) o.name = j.name;
  if (j.value) o.value = programFromJSON(j.value);
  if (j.body) o.body = programFromJSON(j.body);
  if (j.fbody) o.fbody = programFromJSON(j.fbody);
  return o;
}

// ---------------------------------------------------------------- the registry
export class SkillRegistry {
  constructor({ name = 'skills' } = {}) {
    this.name = name;
    this.skills = new Map();
    this.stats = { lookups: 0, hits: 0, misses: 0, stores: 0, applications: 0, searchesAvoided: 0 };
  }
  get size() { return this.skills.size; }
  list() { return [...this.skills.values()]; }
  has(name) { return this.skills.has(name); }
  get(name) { const s = this.skills.get(name); if (!s) throw new Error('skills: no skill named ' + name); return s; }

  store({ name, program, text = null, type = 'num', vars = ['x'], inTypes = ['num'], examples = [], cost = 1, family = 'unknown' }) {
    const skill = {
      name, program, text: text || printTerm(program), type, vars, inTypes,
      examples, cost, family, uses: 0, storedAt: this.stats.stores,
    };
    this.skills.set(name, skill);
    this.stats.stores++;
    return skill;
  }
  delete(name) { return this.skills.delete(name); }

  // Apply a skill to an environment of its own variables. This is the only path that
  // counts a use, so the usage counts are of real applications and not of lookups.
  apply(nameOrSkill, env) {
    const skill = typeof nameOrSkill === 'string' ? this.get(nameOrSkill) : nameOrSkill;
    const v = evalTerm(skill.program, env);
    skill.uses++;
    this.stats.applications++;
    return v;
  }

  // MEMORY BEFORE SEARCH. Returns the first stored skill that reproduces every example
  // exactly, or null. A hit means no search is run at all for this request.
  match(examples, { typeHint = null } = {}) {
    this.stats.lookups++;
    const want = typeHint || (examples.length ? typeOf(examples[0].out) : null);
    for (const skill of this.skills.values()) {
      if (want && skill.type !== want) continue;
      if (skill.vars.length !== Object.keys(examples[0].in).length) continue;
      let ok = true;
      for (const e of examples) {
        const env = renameEnv(e.in, skill.vars);
        if (!env) { ok = false; break; }
        let got;
        try { got = evalTerm(skill.program, env); } catch { ok = false; break; }
        if (!valueEq(got, e.out)) { ok = false; break; }
      }
      if (ok) { this.stats.hits++; this.stats.searchesAvoided++; return skill; }
    }
    this.stats.misses++;
    return null;
  }
  hitRate() { return this.stats.lookups ? this.stats.hits / this.stats.lookups : 0; }
  report() {
    return {
      registry: this.name, skills: this.size,
      lookups: this.stats.lookups, hits: this.stats.hits, misses: this.stats.misses,
      hitRate: Number(this.hitRate().toFixed(4)), searchesAvoided: this.stats.searchesAvoided,
      applications: this.stats.applications,
      byFamily: this.list().reduce((a, s) => { a[s.family] = (a[s.family] || 0) + 1; return a; }, {}),
      top: this.list().slice().sort((a, b) => b.uses - a.uses).slice(0, 5).map(s => ({ name: s.name, uses: s.uses, cost: s.cost, text: s.text })),
    };
  }
  toJSON() {
    return {
      name: this.name, stats: this.stats,
      skills: this.list().map(s => ({
        name: s.name, program: programToJSON(s.program), text: s.text, type: s.type, vars: s.vars,
        inTypes: s.inTypes, cost: s.cost, family: s.family, uses: s.uses,
        examples: s.examples.map(e => ({ in: envToJSON(e.in), out: valueToJSON(e.out) })),
      })),
    };
  }
  static from(j) {
    const r = new SkillRegistry({ name: j.name });
    r.stats = { ...r.stats, ...j.stats };
    for (const s of j.skills) {
      r.skills.set(s.name, {
        ...s, program: programFromJSON(s.program),
        examples: (s.examples || []).map(e => ({ in: envFromJSON(e.in), out: valueFromJSON(e.out) })),
      });
    }
    return r;
  }
}
// An example's variable names need not be the skill's: a skill of one variable is applied
// to a one-variable request whatever the request calls it.
function renameEnv(inObj, vars) {
  const keys = Object.keys(inObj);
  if (keys.length !== vars.length) return null;
  const env = {};
  for (let i = 0; i < vars.length; i++) env[vars[i]] = inObj[keys[i]];
  return env;
}
function valueToJSON(v) { return isList(v) ? { list: v.map(x => S.numToJSON(x)) } : S.numToJSON(v); }
function valueFromJSON(j) { return j && j.list ? j.list.map(S.numFromJSON) : S.numFromJSON(j); }
function envToJSON(o) { const r = {}; for (const k of Object.keys(o)) r[k] = valueToJSON(o[k]); return r; }
function envFromJSON(o) { const r = {}; for (const k of Object.keys(o)) r[k] = valueFromJSON(o[k]); return r; }

// The registry every cell falls back to when no brain carries one of its own.
export const defaultRegistry = new SkillRegistry({ name: 'default' });
export function registryOf(ctx) { return (ctx && ctx.brain && ctx.brain.capability && ctx.brain.capability.registry) || defaultRegistry; }

// ---------------------------------------------------------------- the cell
defineKind('skill', {
  doc: 'A stored induced program as a cell. A request on the request port (a sym expression, or an event of variable -> value) is answered on the answer port as a sym literal, with the same answer and a trace note on the report port. A list answer travels on report only, since a list has no spelling in the scalar language.',
  ports: {
    in: [{ name: 'request', kinds: ['sym', 'event'] }],
    out: [{ name: 'answer', kinds: ['sym'] }, { name: 'report', kinds: ['event'] }],
  },
  defaults: { skill: null, program: null },
  init: (p, cell) => {
    let program = p.program ? programFromJSON(p.program) : null;
    let meta = null;
    if (!program && p.skill && defaultRegistry.has(p.skill)) { meta = defaultRegistry.get(p.skill); program = meta.program; }
    return {
      program: program ? programToJSON(program) : null,
      vars: meta ? meta.vars : (p.vars || ['x']),
      uses: 0, misses: 0, lastAnswer: null, name: p.skill || cell.id,
    };
  },
  compute: (ins, cell, ctx) => {
    const sig = first(ins[0]);
    if (!sig) return [null, null];
    const registry = registryOf(ctx);
    let skill = null;
    if (cell.params.skill && registry.has(cell.params.skill)) skill = registry.get(cell.params.skill);
    const program = skill ? skill.program : (cell.state.program ? programFromJSON(cell.state.program) : null);
    const vars = skill ? skill.vars : cell.state.vars;
    if (!program) { cell.state.misses++; return [null, { kind: 'event', data: { skill: cell.state.name, error: 'no program' } }]; }
    let env;
    if (sig.kind === 'sym') env = { [vars[0]]: evalTerm(sig.data, {}) };
    else env = requestEnv(sig.data, vars);
    let value;
    try { value = evalTerm(program, env); }
    catch (err) { cell.state.misses++; return [null, { kind: 'event', data: { skill: cell.state.name, error: String(err && err.message || err) } }]; }
    cell.state.uses++;
    if (skill) { skill.uses++; registry.stats.applications++; }
    cell.state.lastAnswer = valueToString(value);
    const report = { kind: 'event', data: { skill: cell.state.name, answer: cell.state.lastAnswer, type: typeOf(value), cell: cell.id, uses: cell.state.uses } };
    if (isList(value)) return [null, report];
    return [{ kind: 'sym', data: { op: 'num', value } }, report];
  },
  serialize: (s) => ({ ...s }),
  cost: 1,
});

function requestEnv(data, vars) {
  const src = data && data.args ? data.args : data;
  const env = {};
  const keys = Object.keys(src || {});
  for (let i = 0; i < vars.length; i++) {
    const v = src && src[vars[i]] !== undefined ? src[vars[i]] : src[keys[i]];
    env[vars[i]] = Array.isArray(v) ? v.map(num) : num(v);
  }
  return env;
}

// Add a skill to a brain as a real cell, so the registry and the connectome hold the
// same thing and a trace can name it.
export function addSkillCell(brain, skill, { region = 'cognitive', circuit = 'skills', id = null, period = 'event' } = {}) {
  const cellId = id || 'skill.' + skill.name;
  if (brain.byId.has(cellId)) return brain.cell(cellId);
  return brain.addCell({
    id: cellId, kind: 'skill', region, circuit, policy: { period },
    params: { skill: skill.name, program: programToJSON(skill.program), vars: skill.vars },
  });
}
