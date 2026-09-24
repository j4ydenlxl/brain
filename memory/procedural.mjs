// memory/procedural.mjs. PROCEDURAL MEMORY, knowing how.
// A skill is a serialized sub circuit: a list of cell specs and a list of edges between
// them, all plain JSON. Nothing in a skill is a live object, so a skill can be written to
// disk, sent to another process, or instantiated many times into the same brain under
// different prefixes. captureSkill() turns a running subgraph into one of these, and
// instantiateSkill() turns one back into cells and edges inside a Brain.
import { ACTIVE } from '../core/connectome.mjs';

/**
 * Assert that a value survives a JSON round trip, which is what a skill has to do.
 * @param {any} v
 * @param {string} where a label used in the error message
 * @returns {any} a detached copy
 */
export function jsonSafe(v, where) {
  walkJson(v, where, new Set());
  return JSON.parse(JSON.stringify(v));
}

// JSON.stringify drops functions and undefined instead of complaining, and turns a typed
// array into an object of numbered keys. A skill that went through either of those would
// come back quietly wrong, so the check walks the value rather than trusting the encoder.
function walkJson(v, path, seen) {
  const bad = (why) => { throw new Error('procedural: ' + path + ' is not JSON safe: ' + why); };
  if (v === null) return;
  const t = typeof v;
  if (t === 'string' || t === 'boolean') return;
  if (t === 'number') { if (!Number.isFinite(v)) bad('the number ' + v + ' encodes as null'); return; }
  if (t === 'function') bad('a function');
  if (t === 'symbol') bad('a symbol');
  if (t === 'bigint') bad('a bigint');
  if (t === 'undefined') bad('undefined');
  if (seen.has(v)) bad('a cycle');
  seen.add(v);
  if (Array.isArray(v)) {
    for (let i = 0; i < v.length; i++) walkJson(v[i], path + '[' + i + ']', seen);
    seen.delete(v);
    return;
  }
  if (ArrayBuffer.isView(v) || v instanceof ArrayBuffer) bad('a typed array, which encodes as numbered keys');
  const proto = Object.getPrototypeOf(v);
  if (proto !== Object.prototype && proto !== null) bad('an instance of ' + (v.constructor?.name ?? 'an unknown class'));
  for (const k of Object.keys(v)) walkJson(v[k], path + '.' + k, seen);
  seen.delete(v);
}

/**
 * Normalize a skill description and check that it is internally consistent.
 * @param {string} name
 * @param {object} spec { doc, cells, edges, meta }
 * @returns {object} the normalized skill
 */
export function makeSkill(name, spec) {
  if (!name) throw new Error('procedural: a skill needs a name');
  const cells = (spec.cells || []).map((c, i) => {
    if (!c.id) throw new Error('procedural: skill ' + name + ' cell ' + i + ' needs an id');
    if (!c.kind) throw new Error('procedural: skill ' + name + ' cell ' + c.id + ' needs a kind');
    return {
      id: String(c.id), kind: String(c.kind),
      region: c.region ?? null, circuit: c.circuit ?? null,
      params: jsonSafe(c.params ?? {}, 'skill ' + name + ' cell ' + c.id + ' params'),
      policy: jsonSafe(c.policy ?? {}, 'skill ' + name + ' cell ' + c.id + ' policy'),
    };
  });
  const ids = new Set(cells.map(c => c.id));
  if (ids.size !== cells.length) throw new Error('procedural: skill ' + name + ' has duplicate cell ids');
  const edges = (spec.edges || []).map((e, i) => {
    if (!ids.has(e.src)) throw new Error('procedural: skill ' + name + ' edge ' + i + ' has an unknown src ' + e.src);
    if (!ids.has(e.dst)) throw new Error('procedural: skill ' + name + ' edge ' + i + ' has an unknown dst ' + e.dst);
    return {
      src: e.src, dst: e.dst,
      srcPort: e.srcPort ?? 0, dstPort: e.dstPort ?? 0,
      w: e.w ?? 1, delay: e.delay ?? 0, conf: e.conf ?? 0.5,
    };
  });
  return {
    name, doc: spec.doc ?? '', cells, edges,
    meta: { created: spec.meta?.created ?? 0, uses: spec.meta?.uses ?? 0, score: spec.meta?.score ?? 0, runs: spec.meta?.runs ?? 0, ...jsonSafe(spec.meta ?? {}, 'skill ' + name + ' meta') },
  };
}

/**
 * The store of skills. Plain JSON in, plain JSON out.
 */
export class SkillStore {
  constructor() {
    this.skills = new Map();
    this.stats = { defined: 0, instantiated: 0, removed: 0, recorded: 0 };
  }

  /** @returns {number} skills held */
  size() { return this.skills.size; }
  /** @param {string} name @returns {boolean} */
  has(name) { return this.skills.has(name); }
  /** @returns {string[]} every skill name, sorted */
  list() { return [...this.skills.keys()].sort(); }

  /**
   * Define or replace a skill.
   * @param {string} name
   * @param {object} spec { doc, cells, edges, meta }
   * @returns {object} the stored skill
   */
  define(name, spec) {
    const skill = makeSkill(name, spec);
    this.skills.set(name, skill);
    this.stats.defined++;
    return skill;
  }

  /** @param {string} name @returns {object|null} */
  get(name) { return this.skills.get(name) ?? null; }

  /** @param {string} name @returns {boolean} whether something was removed */
  remove(name) { const had = this.skills.delete(name); if (had) this.stats.removed++; return had; }

  /**
   * Record how a use of the skill went. Keeps a running mean of the score.
   * @param {string} name
   * @param {object} [outcome] { score }
   * @returns {object|null} the skill meta, or null when the name is unknown
   */
  record(name, outcome = {}) {
    const s = this.skills.get(name);
    if (!s) return null;
    const score = Number.isFinite(outcome.score) ? outcome.score : 0;
    s.meta.runs = (s.meta.runs || 0) + 1;
    s.meta.score = s.meta.score + (score - s.meta.score) / s.meta.runs;
    this.stats.recorded++;
    return s.meta;
  }

  /**
   * Skills ordered by mean score, best first. Unused skills come last.
   * @param {number} [k]
   * @returns {Array<{name: string, score: number, runs: number, uses: number}>}
   */
  ranked(k = Infinity) {
    return [...this.skills.values()]
      .map(s => ({ name: s.name, score: s.meta.score, runs: s.meta.runs || 0, uses: s.meta.uses || 0 }))
      .sort((a, b) => (b.runs > 0) - (a.runs > 0) || b.score - a.score)
      .slice(0, k);
  }

  /**
   * Instantiate a stored skill into a brain.
   * @param {string} name
   * @param {import('../core/brain.mjs').Brain} brain
   * @param {object} [opts] see instantiateSkill
   * @returns {{ids: Map<string,string>, cells: string[], edges: number[]}}
   */
  instantiate(name, brain, opts = {}) {
    const skill = this.skills.get(name);
    if (!skill) throw new Error('procedural: no skill named ' + name);
    const r = instantiateSkill(skill, brain, opts);
    this.stats.instantiated++;
    return r;
  }

  /** @returns {object} JSON safe form */
  serialize() { return { version: 1, skills: [...this.skills.values()], stats: { ...this.stats } }; }

  /**
   * Rebuild from serialize().
   * @param {object} j
   * @returns {SkillStore}
   */
  static from(j) {
    const s = new SkillStore();
    for (const sk of j.skills || []) s.skills.set(sk.name, makeSkill(sk.name, sk));
    s.stats = { ...s.stats, ...(j.stats || {}) };
    return s;
  }
}

/**
 * Turn a live subgraph of a Brain into a skill description. Only edges whose src and dst
 * are both inside the selection are captured, and only active ones.
 * @param {import('../core/brain.mjs').Brain} brain
 * @param {string[]} cellIds ids of the cells to capture
 * @param {object} [opts] { name, doc, strip }
 * @returns {object} a skill, not yet stored
 */
export function captureSkill(brain, cellIds, opts = {}) {
  const name = opts.name ?? 'skill';
  const strip = opts.strip ?? '';
  const local = (id) => (strip && id.startsWith(strip) ? id.slice(strip.length) : id);
  const idxToLocal = new Map();
  const cells = [];
  for (const id of cellIds) {
    const c = brain.cell(id);
    idxToLocal.set(c.idx, local(c.id));
    cells.push({
      id: local(c.id), kind: c.kind, region: c.region, circuit: c.circuit,
      params: jsonSafe(c.params, 'cell ' + c.id + ' params'),
      policy: jsonSafe(c.policy, 'cell ' + c.id + ' policy'),
    });
  }
  const edges = [];
  for (const id of cellIds) {
    const c = brain.cell(id);
    for (const e of brain.connectome.outOf(c.idx)) {
      if (!(brain.connectome.flags[e] & ACTIVE)) continue;
      const dstIdx = brain.connectome.dst[e];
      if (!idxToLocal.has(dstIdx)) continue;
      edges.push({
        src: idxToLocal.get(c.idx), dst: idxToLocal.get(dstIdx),
        srcPort: brain.connectome.srcPort[e], dstPort: brain.connectome.dstPort[e],
        w: brain.connectome.w[e], delay: brain.connectome.delay[e], conf: brain.connectome.conf[e],
      });
    }
  }
  return makeSkill(name, { doc: opts.doc ?? '', cells, edges, meta: { created: brain.clock.t } });
}

/**
 * Instantiate a skill into a Brain. Every cell id gets the prefix, so the same skill can
 * be instantiated many times side by side.
 * @param {object} skill a skill from SkillStore or captureSkill
 * @param {import('../core/brain.mjs').Brain} brain
 * @param {object} [opts] { prefix, region, circuit, policy }
 * @returns {{ids: Map<string,string>, cells: string[], edges: number[]}}
 */
export function instantiateSkill(skill, brain, opts = {}) {
  const prefix = opts.prefix ?? '';
  const ids = new Map();
  const made = [];
  for (const c of skill.cells) {
    const id = prefix + c.id;
    brain.addCell({
      id, kind: c.kind,
      region: opts.region ?? c.region ?? 'default',
      circuit: opts.circuit ?? c.circuit ?? 'default',
      params: { ...c.params },
      policy: { ...c.policy, ...(opts.policy || {}) },
    });
    ids.set(c.id, id);
    made.push(id);
  }
  const edges = [];
  for (const e of skill.edges) {
    edges.push(brain.connect(ids.get(e.src), e.srcPort, ids.get(e.dst), e.dstPort, { w: e.w, delay: e.delay, conf: e.conf, by: 'skill:' + skill.name }));
  }
  skill.meta.uses = (skill.meta.uses || 0) + 1;
  return { ids, cells: made, edges };
}
