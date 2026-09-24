// act/spawn.mjs: A QUESTION GROWS THE CELLS THAT ANSWER IT. His P7 in the ask path: the
// question is read for its features (genome/spawn.mjs), the genes those features select are
// grown as live cells in region 'spawn' through the gate, the question is injected into them
// and the brain ticks until their read heads have emitted. Then the region is PRUNED to what
// carried the answer, and what carried it is KEPT, so the same kind of question next time
// runs on cells the brain already holds and grows nothing.
//
//   incumbent first  the circuits the brain already holds run first, with no proposal at all
//   explore          when no incumbent carries, the missing circuits are grown (ONE cell.add
//                    proposal) and every applicable circuit runs in the same ticks
//   carry            a circuit carries when it reproduced every demonstration it was given
//                    and emitted an answer; when two circuits answer and differ, nothing
//                    carries and the ask falls through, because the genome cannot say which
//                    one is right and a guess is not an answer
//   prune            what this ask grew and did not carry leaves (ONE cell.remove proposal);
//                    past CAPS.keptCells the region keeps nothing new at all
//
// When spawning cannot answer (a feature no gene serves, a held gate, no carrier) the ask
// goes on down the direct route exactly as before and this file changed nothing it keeps.
// The answer object has the same shape as the direct route's exact answer, with route
// 'spawn', the ticks the question took, and the record printed by bench/spawn.mjs.
import { performance } from 'node:perf_hooks';
import { CAPS, SPAWN_REGION, edgeLive, grow, holds, plan, regionCells, retract } from '../genome/spawn.mjs';
import { renderSolved } from './solve.mjs';
// act/prompt.mjs imports this file back for the hook in ask(). Every name below is read
// inside a function, never while the module graph is still loading, so the cycle is safe.
import { ASK_EVENT, NOT_ASKED, SURFACE, keywords, promptHash } from './prompt.mjs';

const LAST = new WeakMap();
/** The record of the last spawn attempt on this brain, answered or not. */
export function lastSpawn(brain) { return (brain && LAST.get(brain)) || null; }

/**
 * Whether this ask spawns. `spawn: true` asks for it, `spawn: false` and `prose: true` refuse
 * it (prose asks the model beside the exact answer, which is the direct route's job), and
 * otherwise a brain that already has a spawn region keeps spawning.
 * @param {object} brain @param {object} [opts]
 * @returns {boolean}
 */
export function spawnWanted(brain, opts = {}) {
  if (!brain || !brain.regions || typeof brain.addCell !== 'function' || !brain.gate) return false;
  if (opts.spawn === false || opts.prose === true) return false;
  if (opts.spawn === true) return true;
  return brain.regions.has(SPAWN_REGION);
}

/**
 * The hook act/prompt.mjs ask() calls first. An answer, or null to go on as before.
 * @param {object} brain @param {string} prompt @param {object} [opts]
 * @returns {object|null}
 */
export function askBySpawn(brain, prompt, opts = {}) {
  if (!spawnWanted(brain, opts)) return null;
  return spawnAsk(brain, prompt, opts).answer;
}

// Inject lane k before tick k, tick until every read head has had time to emit, then read
// the outbox. A signal from an exit cell belongs to lane (t - t0 - depth). A spawn cell that
// is not an exit of these circuits (the read head of a shorter program that shares this
// one's prefix) emitted for nobody, and its signal is dropped; everything else goes back.
function runCircuits(brain, circuits) {
  const t0 = brain.clock.t;
  const exits = new Map();
  let span = 1;
  circuits.forEach((c, i) => { exits.set(brain.byId.get(c.exit).idx, i); span = Math.max(span, c.lanes.length + c.depth + 1); });
  const errors = brain.stats.errors;
  for (let k = 0; k < span; k++) {
    for (const c of circuits) if (k < c.lanes.length) for (const inj of c.lanes[k].inject) brain.inject(inj.id, inj.port, { kind: inj.kind, data: inj.data });
    brain.tick(1);
  }
  const got = circuits.map((c) => new Array(c.lanes.length).fill(null));
  const back = [];
  for (const sig of brain.takeOutbox()) {
    const i = exits.get(sig.src);
    if (i === undefined) { const from = brain.cells[sig.src]; if (!(from && from.region === SPAWN_REGION)) back.push(sig); continue; }
    const lane = sig.t - t0 - circuits[i].depth;
    if (lane >= 0 && lane < got[i].length && got[i][lane] === null) got[i][lane] = sig;
  }
  if (back.length) brain.outbox.push(...back);
  return { got, ticks: span, errors: brain.stats.errors - errors };
}

// What each circuit answered, or why it did not, and the circuit that carries.
function judge(circuits, got) {
  const verdicts = circuits.map((c, i) => {
    for (let k = 0; k < c.lanes.length; k++) {
      const want = c.lanes[k].expect;
      if (want !== undefined && !(c.same && c.same(got[i][k], want))) return { gene: c.gene, ok: false, why: 'demonstration ' + (k + 1) + ' not reproduced' };
    }
    const sig = got[i][c.lanes.length - 1];
    const answer = sig ? c.read(sig) : null;
    return answer === null ? { gene: c.gene, ok: false, why: sig ? 'the read head emitted no answer' : 'nothing reached the read head' } : { gene: c.gene, ok: true, answer, data: sig.data };
  });
  const ok = verdicts.map((v, i) => [v, i]).filter(([v]) => v.ok);
  if (!ok.length) return { verdicts, carrier: -1, why: 'no circuit carried an answer' };
  if (new Set(ok.map(([v]) => v.answer)).size > 1) return { verdicts, carrier: -1, why: 'the circuits disagree: ' + ok.map(([v]) => v.gene + '=' + v.answer).join(', ') };
  return { verdicts, carrier: ok[0][1], why: null };
}

/**
 * Answer one question by growing, running and pruning cells in the live brain.
 * @param {object} brain
 * @param {string} prompt
 * @param {object} [opts] { keptCells, maxCells, by }
 * @returns {{answer: object|null, record: object}}
 */
export function spawnAsk(brain, prompt, opts = {}) {
  const t = performance.now();
  const text = String(prompt ?? '');
  const by = opts.by || 'spawn';
  const keptCap = Number.isInteger(opts.keptCells) && opts.keptCells >= 0 ? opts.keptCells : CAPS.keptCells;
  const record = {
    features: [], genes: [], unserved: [], cellsBefore: brain.cells.length, cellsSpawned: 0, cellsKept: 0, cellsPruned: 0,
    edgesSpawned: 0, edgesKept: 0, region: 0, reused: 0, incumbents: 0, carried: null, declined: null,
    ticks: 0, errors: 0, ms: 0, proposals: [], verdicts: [],
  };
  const grown = [];      // cell ids this ask grew
  const grownEdges = []; // edge indices this ask grew
  const finish = (answer) => {
    record.cellsKept = grown.filter((id) => brain.byId.has(id)).length;
    record.edgesKept = grownEdges.filter((e) => edgeLive(brain, e)).length;
    record.region = regionCells(brain);
    record.ms = performance.now() - t;
    LAST.set(brain, record);
    if (answer) {
      answer.ms = record.ms;
      answer.seq = brain.log({
        type: ASK_EVENT, by: SURFACE, route: 'spawn', promptHash: answer.promptHash, promptChars: answer.promptChars, from: 'exact',
        provenance: 'exact', method: answer.provenance.method, modelAgreed: null, memoryHits: 0, webPages: 0, redacted: false,
        provider: null, model: null, llmMs: 0, llmOk: false, ms: record.ms, ticks: record.ticks,
        cellsSpawned: record.cellsSpawned, cellsPruned: record.cellsPruned, carried: record.carried,
      });
    }
    brain.log({
      type: 'spawn.ask', by, promptHash: promptHash(text), features: record.features, genes: record.genes,
      cellsBefore: record.cellsBefore, cellsSpawned: record.cellsSpawned, cellsKept: record.cellsKept, cellsPruned: record.cellsPruned,
      edgesKept: record.edgesKept, reused: record.reused, carried: record.carried, declined: record.declined, ticks: record.ticks, ms: record.ms,
    });
    return { answer, record };
  };
  const prune = (ids, why, testsPassed) => {
    if (!ids.length) return;
    const r = retract(brain, ids, { by, why, evidence: { testsPassed, test: why } });
    record.proposals.push({ kind: 'cell.remove', id: r.proposal, status: r.status, reason: r.reason || null });
    record.cellsPruned += r.removed.length;
  };
  try {
    const p = plan(text);
    record.features = p.features;
    record.genes = p.circuits.map((c) => c.gene);
    record.unserved = p.unserved;
    if (!p.circuits.length) {
      record.declined = p.unserved.length ? 'no gene serves ' + p.unserved.join(', ') : 'no gene expressed for this question';
      return finish(null);
    }
    // incumbents: whole circuits the brain already holds
    const held = p.circuits.filter((c) => holds(brain, c));
    record.incumbents = held.length;
    let ran = held, run = held.length ? runCircuits(brain, held) : null;
    let j = run ? judge(held, run.got) : null;
    if (run) { record.ticks += run.ticks; record.errors += run.errors; }
    if (!j || j.carrier < 0) {
      // explore: grow what is missing and run every applicable circuit
      const g = grow(brain, p.circuits, { by, maxCells: opts.maxCells, why: 'spawn: ' + (record.features.join(', ') || 'no feature') + ' expressed ' + record.genes.join(', ') });
      if (g.status !== 'none') record.proposals.push({ kind: 'cell.add', id: g.proposal, status: g.status, reason: g.reason || null });
      if (!g.ok) { record.declined = g.reason; return finish(null); }
      grown.push(...g.cells); grownEdges.push(...g.edges);
      record.cellsSpawned = g.cells.length; record.edgesSpawned = g.edges.length;
      ran = p.circuits;
      run = runCircuits(brain, ran);
      record.ticks += run.ticks; record.errors += run.errors;
      j = judge(ran, run.got);
    }
    record.verdicts = j.verdicts.map((v) => ({ gene: v.gene, ok: v.ok, answer: v.answer ?? null, why: v.why || null }));
    const grownSet = new Set(grown);
    if (j.carrier < 0) {
      record.declined = j.why;
      prune(grown, 'spawn: ' + j.why + ', so nothing this question grew is kept', true);
      return finish(null);
    }
    const c = ran[j.carrier];
    const carrierIds = new Set(c.cells.map((x) => x.id));
    record.carried = c.gene;
    record.reused = c.cells.filter((x) => !grownSet.has(x.id)).length;
    // prune what did not carry; the check is real: these ids are disjoint from the carrier's
    const losers = grown.filter((id) => !carrierIds.has(id));
    prune(losers, 'spawn: grown for ' + record.genes.join(', ') + ' but ' + c.gene + ' carried the answer', losers.every((id) => !carrierIds.has(id)));
    if (regionCells(brain) > keptCap) {
      const rest = grown.filter((id) => brain.byId.has(id));
      prune(rest, 'spawn: the region holds ' + regionCells(brain) + ' cells, past the cap of ' + keptCap + ', so this question keeps nothing', true);
    }
    const v = j.verdicts[j.carrier];
    const solved = { answer: v.answer, method: c.method, steps: [...c.steps, (record.reused ? record.reused + ' cells reused, ' : '') + record.cellsSpawned + ' cells spawned for this question, ' + (record.cellsSpawned - record.cellsPruned) + ' kept'] };
    return finish(answerOf(brain, text, solved, record));
  } catch (err) {
    record.declined = 'error: ' + (err && err.message ? err.message : String(err));
    try { prune(grown.filter((id) => brain.byId.has(id)), 'spawn: the ask threw, so nothing it grew is kept', true); } catch { /* the error above is the one reported */ }
    return finish(null);
  }
}

// The same shape the direct route gives an exact answer, so a caller cannot tell the two
// apart except by `route`, which is the point: the answer is exact either way.
function answerOf(brain, text, solved, record) {
  const hash = promptHash(text);
  const answer = {
    ok: true,
    promptHash: hash,
    promptChars: text.length,
    from: 'exact',
    text: renderSolved(solved),
    memory: null,
    exact: { answer: solved.answer, method: solved.method, steps: solved.steps },
    cites: [],
    redacted: false,
    redactedShapes: [],
    provenance: {
      answer: 'exact', method: solved.method, modelAgreed: null, memoryHits: 0, webPages: 0,
      llm: { ...NOT_ASKED(solved.method), probed: null },
    },
    words: keywords(text),
    ms: 0,
    route: 'spawn',
    ticks: record.ticks,
    spawn: record,
  };
  return answer;
}
