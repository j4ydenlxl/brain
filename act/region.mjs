// act/region.mjs: THE MODEL AS A CELL, NOT A FUNCTION CALL. A question is injected at one
// cell of a sealed region, travels cell to cell over conduits, and the language model is one
// station on that path. Nothing here calls complete() directly: the model is asked by a
// signal arriving on a conduit and it answers on a conduit, like every other cell.
//
// THE ROUTE, five cells and seven conduits, every conduit delay 1:
//
//   ask.in --out--> ask.solve --exact--> ask.verify
//                      |  pass
//                      v
//                   ask.recall --ask--> ask.llm --out--> ask.verify
//                      |  memory          |  error
//                      +--------------------------------> ask.verify
//
//   ask.in      the door. One event { text } in, the same event out, stamped with the clock
//               reading the question started at and the first hop of its trail.
//   ask.solve   act/solve.mjs. When the organism can COMPUTE the whole prompt the answer
//               leaves on `exact` and the model is never reached: no socket is opened, and
//               that is the same rule ask() has had since board 6. Otherwise the question
//               leaves on `pass`.
//   ask.recall  the organism read through ctx.brain: the episodic tier, the working ring and
//               the pages the world senses already ingested. It emits the model's request on
//               `ask` and, on `memory`, the answer the organism gives with no model at all.
//               Both leave at once, so the fallback is already at the verifier before the
//               model has said anything.
//   ask.llm     act/llm.mjs llm.complete, unmodified. compute() never awaits: the completion
//               lands on a queue in the cell's own state and the NEXT run of the cell drains
//               it onto the `out` port.
//   ask.verify  the one cell that decides. An exact event wins outright. Otherwise the model
//               event decides: taken when it is ok and its provider is not the offline
//               fixture, and otherwise the memory event waiting beside it is the answer.
//
// WHY ask.llm IS PROMOTED FOR THE LENGTH OF A QUESTION. An event cell runs when mail arrives.
// The llm cell's completion does not arrive as mail, it arrives on its own state queue from a
// promise, so an event cell would ask the model and then never wake up to hand over the
// answer. askThroughRegion moves that one cell to period 1 while a question is in flight and
// puts it back on 'event' afterwards, so between questions the whole region costs nothing.
//
// THE DEADLINE. askThroughRegion ticks until ask.verify has an answer or opts.timeoutMs
// passes, yielding to the event loop between ticks (the completion resolves between ticks,
// never inside one). A completion that lands after the deadline is NOT an answer: the call
// has already returned what the organism holds, with provenance memory and timedOut true.
//
// THE SEAL. The region is sealed exactly as the language region is (mind/index.mjs
// sealRegion), so co-activation growth may not wire the mind or the reflex arc into it. A
// question reaches this region because a human injected it, and for no other reason.
import { defineKind, hasKind } from '../core/cell.mjs';
import { RNG } from '../core/rng.mjs';
import { sealRegion } from '../mind/index.mjs';
import { registerLLMKind, LLM_KIND, OLLAMA_BASE, probeOllama } from './llm.mjs';
import { solve, renderSolved, modelAgrees } from './solve.mjs';
import {
  AGREEMENT, NOT_ASKED, memoryAnswer, promptHash, recall, scrubSecrets, systemFor,
} from './prompt.mjs';

export const ASK_REGION = 'ask';
export const ASK_CIRCUIT = 'ask.route';
export const GATE_KIND = 'ask.gate';
export const SOLVE_KIND = 'act.solve';
export const RECALL_KIND = 'act.recall';
export const VERIFY_KIND = 'act.verify';
/** The five cells of the route, in the order a question crosses them. */
export const ASK_CELLS = Object.freeze(['ask.in', 'ask.solve', 'ask.recall', 'ask.llm', 'ask.verify']);
/** The seven conduits, each { src, srcPort, dst, dstPort }, all delay 1. */
export const ASK_CONDUITS = Object.freeze([
  { src: 'ask.in', srcPort: 'out', dst: 'ask.solve', dstPort: 'in' },
  { src: 'ask.solve', srcPort: 'exact', dst: 'ask.verify', dstPort: 'exact' },
  { src: 'ask.solve', srcPort: 'pass', dst: 'ask.recall', dstPort: 'in' },
  { src: 'ask.recall', srcPort: 'ask', dst: 'ask.llm', dstPort: 'in' },
  { src: 'ask.recall', srcPort: 'memory', dst: 'ask.verify', dstPort: 'memory' },
  { src: 'ask.llm', srcPort: 'out', dst: 'ask.verify', dstPort: 'model' },
  { src: 'ask.llm', srcPort: 'error', dst: 'ask.verify', dstPort: 'model' },
]);
export const CONDUIT_DELAY = 1;
/** How many questions the verifier keeps waiting on, and how many hashes it remembers. */
export const VERIFY_KEEP = 16;

// ---------------------------------------------------------------- the kinds
// One queue per cell, so a cell handed two questions in one tick answers both, one per run,
// instead of dropping the second. Same discipline as act/llm.mjs, small enough to repeat.
function pushAll(st, ins, make) {
  for (const it of ins[0] || []) {
    const d = (it.sig && it.sig.data) || {};
    const item = make(d, it.sig);
    if (item !== null && item !== undefined) st.queue.push(item);
  }
  while (st.queue.length > VERIFY_KEEP) st.queue.shift();
}
const ev = (data) => ({ kind: 'event', data });
const hopsOf = (d) => (Array.isArray(d.hops) ? d.hops : []);

/**
 * Register the four kinds this region defines. Idempotent, so a second organism in the same
 * process installs the region without redefining anything.
 * @returns {string[]} the kind names
 */
export function registerAskKinds() {
  registerLLMKind();
  if (!hasKind(GATE_KIND)) {
    defineKind(GATE_KIND, {
      doc: 'The door of the ask region: an event { text } in on port prompt, the same question out on port out, stamped with the time it started and the first hop of its trail.',
      ports: { in: [{ name: 'prompt', kinds: ['event'] }], out: [{ name: 'out', kinds: ['event'] }] },
      init: () => ({ queue: [], seen: 0 }),
      compute: (ins, cell) => {
        const st = cell.state;
        pushAll(st, ins, (d) => {
          st.seen++;
          const text = String(d.text ?? '');
          return {
            text, hash: d.hash || promptHash(text), started: Number.isFinite(d.started) ? d.started : Date.now(),
            provider: d.provider ?? null, model: d.model ?? null, k: d.k ?? null,
            hops: [...hopsOf(d), 'ask.in'],
          };
        });
        if (!st.queue.length) return [null];
        return [ev(st.queue.shift())];
      },
      serialize: (s) => ({ ...s, queue: [] }),
      cost: 1,
    });
  }
  if (!hasKind(SOLVE_KIND)) {
    defineKind(SOLVE_KIND, {
      doc: 'act/solve.mjs as a cell. A prompt the organism can compute to the last digit leaves on port exact and the model is never reached; anything else leaves on port pass.',
      ports: {
        in: [{ name: 'in', kinds: ['event'] }],
        out: [{ name: 'exact', kinds: ['event'] }, { name: 'pass', kinds: ['event'] }],
      },
      init: () => ({ queue: [], solved: 0, passed: 0 }),
      compute: (ins, cell) => {
        const st = cell.state;
        pushAll(st, ins, (d) => ({ ...d, hops: [...hopsOf(d), 'ask.solve'] }));
        if (!st.queue.length) return [null, null];
        const d = st.queue.shift();
        const s = solve(d.text);
        if (s) { st.solved++; return [ev({ ...d, answer: s.answer, method: s.method, steps: s.steps }), null]; }
        st.passed++;
        return [null, ev(d)];
      },
      serialize: (s) => ({ ...s, queue: [] }),
      cost: 2,
    });
  }
  if (!hasKind(RECALL_KIND)) {
    defineKind(RECALL_KIND, {
      doc: 'The organism read for one question through ctx.brain: the episodic tier, the working ring and the pages the world senses ingested. Emits the model request on port ask and the no-model answer on port memory, both in the same run.',
      ports: {
        in: [{ name: 'in', kinds: ['event'] }],
        out: [{ name: 'ask', kinds: ['event'] }, { name: 'memory', kinds: ['event'] }],
      },
      init: () => ({ queue: [], recalls: 0 }),
      compute: (ins, cell, ctx) => {
        const st = cell.state;
        pushAll(st, ins, (d) => ({ ...d, hops: [...hopsOf(d), 'ask.recall'] }));
        if (!st.queue.length) return [null, null];
        const d = st.queue.shift();
        const brain = ctx && ctx.brain ? ctx.brain : null;
        const r = recall(brain, d.text, d.k ? { k: d.k } : {});
        st.recalls++;
        // The model's request and the fallback leave together. The fallback is therefore
        // already at the verifier when the model is asked, which is what lets the verifier
        // answer from memory the moment the model says it has nothing.
        const askOut = {
          text: d.text, system: systemFor(r), origin: 'self',
          provider: d.provider ?? cell.params.provider ?? null,
          model: d.model ?? cell.params.model ?? null,
        };
        const memOut = {
          text: memoryAnswer(r), prompt: d.text, hash: d.hash, started: d.started,
          hits: r.hits, words: r.words, memoryHits: r.memoryHits, webPages: r.webPages,
          hops: d.hops,
        };
        return [ev(askOut), ev(memOut)];
      },
      serialize: (s) => ({ ...s, queue: [] }),
      cost: 3,
    });
  }
  if (!hasKind(VERIFY_KIND)) {
    defineKind(VERIFY_KIND, {
      doc: 'The one cell that decides which arrival is the answer: an exact event wins outright, otherwise a usable model event wins, otherwise the memory event waiting beside it. Emits the answer object on port answer and keeps the last one in its own state.',
      ports: {
        in: [
          { name: 'exact', kinds: ['event'] },
          { name: 'model', kinds: ['event'] },
          { name: 'memory', kinds: ['event'] },
        ],
        out: [{ name: 'answer', kinds: ['event'] }],
      },
      init: () => ({
        waiting: [], exactSeen: [], out: [], last: null, answered: {},
        answers: 0, exact: 0, model: 0, memory: 0, agreed: 0, disagreed: 0, orphans: 0,
      }),
      compute: (ins, cell, ctx) => {
        const st = cell.state;
        // The memory events are read FIRST, so a model event that arrived on the same tick
        // already finds its fallback waiting. Both conduits carry delay 1 out of ask.recall
        // and ask.llm, and the llm needs at least one more tick than the recall, so this
        // ordering is belt and braces rather than the thing the route depends on.
        for (const it of ins[2] || []) {
          const d = (it.sig && it.sig.data) || {};
          st.waiting.push({ hash: d.hash || promptHash(d.prompt || ''), ev: d });
          while (st.waiting.length > VERIFY_KEEP) st.waiting.shift();
        }
        for (const it of ins[0] || []) {
          const d = (it.sig && it.sig.data) || {};
          const hash = d.hash || promptHash(d.text || '');
          st.exactSeen.push(hash);
          while (st.exactSeen.length > VERIFY_KEEP) st.exactSeen.shift();
          const i = st.waiting.findIndex((w) => w.hash === hash);
          const mem = i >= 0 ? st.waiting.splice(i, 1)[0].ev : null;
          st.out.push(renderExact(d, mem, ctx));
          // kept so a model event arriving beside this one can be compared to the value the
          // organism computed, which is the only thing that comparison is ever used for
          st.answered = st.answered || {};
          st.answered[hash] = String(d.answer);
          st.exact++;
        }
        for (const it of ins[1] || []) {
          const d = (it.sig && it.sig.data) || {};
          const a = takeModel(st, d, ctx);
          if (a) st.out.push(a);
        }
        if (!st.out.length) return [null];
        const answer = st.out.shift();
        st.last = answer;
        st.answers++;
        return [ev(answer)];
      },
      // A waiting question and an undelivered answer are both text from one moment of one
      // conversation. The ledger already carries what was asked and how it went, so a
      // snapshot keeps the counters and drops the words.
      serialize: (s) => ({
        waiting: [], exactSeen: [], out: [], last: null, answered: {},
        answers: s.answers, exact: s.exact, model: s.model, memory: s.memory,
        agreed: s.agreed, disagreed: s.disagreed, orphans: s.orphans,
      }),
      cost: 2,
    });
  }
  return [GATE_KIND, SOLVE_KIND, RECALL_KIND, VERIFY_KIND, LLM_KIND];
}
// Registering at import time, not at install time: seeds/whole.mjs restores a snapshot whose
// cells carry these kinds, and core/cell.mjs must already know them before the first cell is
// deserialized, which happens before any install could run.
registerAskKinds();

// ---------------------------------------------------------------- rendering an answer
// The shape ask() has returned since board 6, field for field, so a caller cannot tell the
// two routes apart by what it reads off the object. The two fields that are new are `route`
// and, on this route only, `hops`; `ticks` is stamped by the driver.
function answerShape({ hash, chars, from, text, memory, exact, cites, words, redacted, redactedShapes, provenance, llm, hops, started }) {
  return {
    ok: true, promptHash: hash, promptChars: chars, from, text, memory, exact, cites,
    redacted, redactedShapes,
    provenance: {
      answer: provenance.answer, method: provenance.method, modelAgreed: provenance.modelAgreed,
      memoryHits: provenance.memoryHits, webPages: provenance.webPages,
      llm: { provider: llm.provider, model: llm.model, ms: llm.ms, tokens: llm.tokens, ok: llm.ok, reason: llm.reason, fellBack: llm.fellBack, probed: null },
    },
    words, ms: Date.now() - (Number.isFinite(started) ? started : Date.now()),
    route: 'region', hops,
  };
}

const citesOf = (hits) => (hits || []).map((h) => ({ source: h.source, id: h.id, origin: h.origin, text: oneLine(h.text, 120) }));
// The same 120 character single line ask() prints a citation on, repeated here rather than
// exported from act/prompt.mjs, where it is a private helper of the surface.
function oneLine(s, max) {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 3) + '...' : t;
}

// An exact answer needs the citations too: a reader of a computed answer should still see
// what the organism held. ask.recall is on the model path only, so when nothing was waiting
// the recall is read here, through the same ctx.brain every cell reads the organism with.
function renderExact(d, mem, ctx) {
  const brain = ctx && ctx.brain ? ctx.brain : null;
  const r = mem ? null : recall(brain, d.text, d.k ? { k: d.k } : {});
  const fromMemory = mem ? mem.text : memoryAnswer(r);
  const hits = mem ? mem.hits : r.hits;
  const words = mem ? mem.words : r.words;
  const memoryHits = mem ? mem.memoryHits : r.memoryHits;
  const webPages = mem ? mem.webPages : r.webPages;
  return answerShape({
    hash: d.hash, chars: String(d.text ?? '').length, from: 'exact',
    text: renderSolved({ answer: d.answer, method: d.method, steps: d.steps }),
    memory: fromMemory, exact: { answer: d.answer, method: d.method, steps: d.steps },
    cites: citesOf(hits), words, redacted: 0, redactedShapes: [],
    provenance: { answer: 'exact', method: d.method, modelAgreed: null, memoryHits, webPages },
    llm: NOT_ASKED(d.method), hops: [...hopsOf(d), 'ask.verify'], started: d.started,
  });
}

// The model arrived. Three outcomes, and only one of them is an answer.
function takeModel(st, d, ctx) {
  const hash = d.error ? null : promptHash(String(d.prompt ?? ''));
  // An error event carries no prompt (act/llm.mjs error port is { error, reason, provider }),
  // so it cannot be keyed. It takes the oldest question still waiting, which is the one it
  // can only be about while questions cross this region one at a time.
  const i = hash === null ? (st.waiting.length ? 0 : -1) : st.waiting.findIndex((w) => w.hash === hash);
  if (hash !== null && st.exactSeen.includes(hash)) {
    // A model asked beside an answer the organism computed is a second opinion nobody needs.
    // The disagreement is COUNTED and the exact answer stands, which is act/prompt.mjs's rule.
    if (i >= 0) st.waiting.splice(i, 1);
    if (!d.error && d.ok === true && d.provider !== 'null' && d.provider != null) {
      const agreed = modelAgrees(scrubSecrets(String(d.text ?? '')).text, (st.answered && st.answered[hash]) ?? '');
      AGREEMENT.asked++;
      if (agreed) { AGREEMENT.agreed++; st.agreed++; } else { AGREEMENT.disagreed++; st.disagreed++; }
    }
    return null;
  }
  if (i < 0) { st.orphans++; return null; }
  const mem = st.waiting.splice(i, 1)[0].ev;
  const scrubbed = scrubSecrets(d.error ? '' : String(d.text ?? ''));
  // The same three part test act/prompt.mjs applies: the offline provider reverses a
  // sentence, which is a fixture and not an answer, so it falls to memory and says so.
  const useLlm = !d.error && d.ok === true && d.provider !== 'null' && d.provider != null && scrubbed.text.trim().length > 0;
  const llm = d.error
    ? { provider: d.provider ?? null, model: null, ms: 0, tokens: 0, ok: false, reason: d.reason || 'the llm cell emitted on its error port', fellBack: null }
    : { provider: d.provider ?? null, model: d.model ?? null, ms: d.ms ?? 0, tokens: d.tokens ?? 0, ok: d.ok === true, reason: d.reason ?? null, fellBack: d.fellBack ?? null };
  if (useLlm) st.model++; else st.memory++;
  const hops = useLlm ? [...hopsOf(mem), 'ask.llm', 'ask.verify'] : [...hopsOf(mem), 'ask.verify'];
  return answerShape({
    hash: mem.hash, chars: String(mem.prompt ?? '').length, from: useLlm ? 'llm' : 'memory',
    text: useLlm ? scrubbed.text : mem.text, memory: mem.text, exact: null,
    cites: citesOf(mem.hits), words: mem.words,
    redacted: scrubbed.redacted, redactedShapes: scrubbed.shapes,
    provenance: { answer: useLlm ? 'model' : 'memory', method: null, modelAgreed: null, memoryHits: mem.memoryHits, webPages: mem.webPages },
    llm, hops, started: mem.started,
  });
}

// ---------------------------------------------------------------- install
/**
 * Add the ask region to a brain, once. A second call adds nothing and says so.
 * @param {object} brain
 * @param {object} [opts] { provider, model, timeoutMs }
 *   provider  the llm cell's own provider when a question does not name one. null means the
 *             deterministic offline provider, so an organism nobody configured opens no socket.
 * @returns {{installed, region, circuit, cells, conduits, added: {cells, edges}}}
 */
export function installAskRegion(brain, { provider = null, model = null, timeoutMs = 60_000 } = {}) {
  registerAskKinds();
  if (brain.regions.has(ASK_REGION)) {
    return { installed: false, region: ASK_REGION, circuit: ASK_CIRCUIT, cells: [...ASK_CELLS], conduits: ASK_CONDUITS.length, added: { cells: 0, edges: 0 } };
  }
  const cellsBefore = brain.cells.length, edgesBefore = brain.connectome.size();
  brain.addCircuit(ASK_REGION, ASK_CIRCUIT, { period: 1, doc: 'one question crossing the organism: door, exact solver, recall, model, verifier' });
  // period 'event' on every cell: between questions this region is not scheduled at all.
  const policy = { period: 'event', priority: 2, budget: 1, backend: 'cpu', learn: null };
  const at = (id, kind, params = {}) => brain.addCell({ id, kind, region: ASK_REGION, circuit: ASK_CIRCUIT, params, policy: { ...policy } });
  at('ask.in', GATE_KIND);
  at('ask.solve', SOLVE_KIND);
  at('ask.recall', RECALL_KIND, { provider: provider ?? null, model: model ?? null });
  at('ask.llm', LLM_KIND, { provider: provider ?? 'null', model: model ?? null, timeoutMs, queueMax: 32, keep: 8 });
  at('ask.verify', VERIFY_KIND);
  for (const c of ASK_CONDUITS) brain.connect(c.src, c.srcPort, c.dst, c.dstPort, { w: 1, delay: CONDUIT_DELAY, conf: 1, by: 'ask.region' });
  // Sealed exactly as the language region is: co-activation growth may not wire the mind or
  // the reflex arc into this route, so a question arrives here because a human injected it.
  sealRegion(brain, ASK_CELLS);
  return {
    installed: true, region: ASK_REGION, circuit: ASK_CIRCUIT, cells: [...ASK_CELLS], conduits: ASK_CONDUITS.length,
    added: { cells: brain.cells.length - cellsBefore, edges: brain.connectome.size() - edgesBefore },
  };
}

// ---------------------------------------------------------------- the driver
const yieldOnce = () => new Promise((resolve) => setImmediate(resolve));

// The llm cell is an event cell that has to wake itself: its completion lands on its own
// state queue and not in a mailbox. It runs on period 1 for the length of one question and
// goes back to 'event' afterwards, so it costs nothing between questions.
function promote(brain, id) {
  const cell = brain.cell(id);
  const was = cell.policy.period;
  if (was === 1) return () => {};
  brain.clock.unregister(cell);
  cell.policy.period = 1;
  brain.clock.register(cell);
  return () => {
    brain.clock.unregister(cell);
    cell.policy.period = was;
    brain.clock.register(cell);
  };
}

/**
 * One question, through the region. Installs the region when it is absent.
 * @param {object} brain
 * @param {string} prompt
 * @param {object} [opts] { provider, model, base, probeMs, timeoutMs, k, install }
 *   prose      NOT carried by this route. act/prompt.mjs asks the model for a second opinion
 *              on an exact prompt when it is set; here an exact prompt is exact.
 *   timeoutMs  the DEADLINE on the whole question, default 60000. On the deadline the call
 *              returns what the organism holds, with provenance memory and timedOut true, and
 *              a completion that lands afterwards is not an answer.
 * @returns {Promise<object>} the answer, with route 'region', ticks and hops
 */
export async function askThroughRegion(brain, prompt, opts = {}) {
  const started = Date.now();
  const text = String(prompt ?? '');
  const hash = promptHash(text);
  if (!brain.regions.has(ASK_REGION)) installAskRegion(brain, opts);
  const verify = brain.cell('ask.verify');
  // The provider is resolved the way act/prompt.mjs askModel resolves it, HERE and not in a
  // cell, because a cell's compute() is synchronous and the ollama probe is a request. A
  // caller that names a provider (the bench names 'null' or 'ollama') is never probed.
  let provider = opts.provider === undefined || opts.provider === null ? null : String(opts.provider);
  let probed = null;
  if (provider === null) {
    // solve() is read here, before the question is injected, for ONE decision only: whether
    // this question needs a provider at all. act/prompt.mjs skips askModel entirely on a
    // prompt it can compute, so a probe here would be a socket the direct route never opens
    // on the same question, and "an exact answer reaches no network" would be true of one
    // route and not the other. The answer is still the cell's: ask.solve runs the same solver
    // on the same text and decides what leaves on which port.
    // `prose` (ask the model for a second opinion even when solve answered) is act/prompt.mjs's
    // option and this route does not carry it: ask.solve emits on one port, and a driver that
    // returned on the exact answer would put the llm cell back on 'event' before the second
    // opinion could be drained. So an exact prompt here is exact, whatever prose says.
    if (solve(text)) provider = 'null';
    else {
      probed = await probeOllama(opts.base || OLLAMA_BASE, Number.isFinite(opts.probeMs) ? opts.probeMs : 500);
      provider = probed ? 'ollama' : 'null';
    }
  }
  const llm = brain.cell('ask.llm');
  if (opts.base) llm.params.base = opts.base;
  if (Number.isFinite(opts.probeMs)) llm.params.probeMs = opts.probeMs;
  // Two different clocks, and they are not the same number. params.timeoutMs is how long ONE
  // request to the provider may take; opts.timeoutMs is the DEADLINE on the whole question.
  // The request timeout only ever rises to the largest budget a caller has asked for, so a
  // short deadline (a test, a caller in a hurry) cannot quietly shorten the model's request.
  if (Number.isFinite(opts.timeoutMs)) llm.params.timeoutMs = Math.max(Number(llm.params.timeoutMs) || 0, opts.timeoutMs);
  const before = verify.state.answers;
  const restore = promote(brain, 'ask.llm');
  const t0 = brain.clock.t;
  let answer = null, timedOut = false;
  try {
    brain.inject('ask.in', 'prompt', { kind: 'event', data: { text, hash, started, provider, model: opts.model ?? null, k: opts.k ?? null } });
    const deadline = started + (Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : 60_000);
    while (Date.now() < deadline) {
      brain.tick(1);
      if (verify.state.answers > before && verify.state.last && verify.state.last.promptHash === hash) { answer = verify.state.last; break; }
      // The completion resolves BETWEEN ticks, never inside one: compute() never awaits, so
      // without this yield the promise act/llm.mjs started could never settle.
      await yieldOnce();
    }
  } finally { restore(); }
  const ticks = brain.clock.t - t0;
  if (!answer) {
    timedOut = true;
    // Nothing crossed the verifier in time. What the organism holds is still an answer, and
    // it is read the same way ask.recall reads it, so the deadline costs the model and
    // nothing else.
    const waiting = (verify.state.waiting || []).find((w) => w.hash === hash);
    const r = waiting ? null : recall(brain, text, opts.k ? { k: opts.k } : {});
    answer = answerShape({
      hash, chars: text.length, from: 'memory',
      text: waiting ? waiting.ev.text : memoryAnswer(r),
      memory: waiting ? waiting.ev.text : memoryAnswer(r), exact: null,
      cites: citesOf(waiting ? waiting.ev.hits : r.hits), words: waiting ? waiting.ev.words : r.words,
      redacted: 0, redactedShapes: [],
      provenance: {
        answer: 'memory', method: null, modelAgreed: null,
        memoryHits: waiting ? waiting.ev.memoryHits : r.memoryHits, webPages: waiting ? waiting.ev.webPages : r.webPages,
      },
      llm: { provider: null, model: null, ms: 0, tokens: 0, ok: false, reason: 'the deadline of ' + (Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : 60_000) + ' ms passed before an answer crossed ask.verify', fellBack: null },
      hops: ['ask.in', 'ask.solve', 'ask.recall', 'ask.verify'], started,
    });
  }
  if (answer.provenance.answer !== 'exact') answer.provenance.llm.probed = probed;
  answer.ticks = ticks;
  answer.timedOut = timedOut;
  answer.ms = Date.now() - started;
  return answer;
}

// ---------------------------------------------------------------- the suite the self loop scores
const SUITE_SOURCES = Object.freeze(['algebra', 'sequence', 'grid']);

/**
 * The exact items of the three answer suites, asked THROUGH THE REGION with no model at all,
 * and graded by the answer bench's own ruler. This is what self/ scores wiring by: a
 * conduit change that breaks the route shows up as an accuracy that falls, and no trial ever
 * opens a socket.
 * @param {object} [opts] { brain, seed, n }
 * @returns {Promise<{n, correct, accuracy, ms, bySource}>}
 */
export async function askSuite({ brain = null, seed = 'ask', n = 30 } = {}) {
  const t0 = Date.now();
  // Imported here and not at the top: bench/ is the measuring plane and must not be loaded
  // into every organism that installs this region.
  const [{ gradeAnswer }, tasks, { G }] = await Promise.all([import('../bench/answer.mjs'), import('../tasks/index.mjs'), import('../cells/grid.mjs')]);
  const items = askSuiteItems({ seed, n, tasks: { ...tasks, G } });
  let b = brain;
  if (!b) {
    const { Brain } = await import('../core/brain.mjs');
    const { attachMemory } = await import('../memory/index.mjs');
    b = new Brain({ name: 'ask-suite', ledger: 'off', pruneEvery: 0 });
    attachMemory(b, { name: 'ask-suite' });
  }
  if (!b.regions.has(ASK_REGION)) installAskRegion(b);
  const bySource = {};
  let correct = 0;
  for (const it of items) {
    const a = await askThroughRegion(b, it.q, { provider: 'null', timeoutMs: 10_000 });
    const g = gradeAnswer(a.text, it);
    const s = bySource[it.source] || (bySource[it.source] = { n: 0, correct: 0 });
    s.n++;
    if (g.ok) { s.correct++; correct++; }
  }
  return { n: items.length, correct, accuracy: items.length ? correct / items.length : 0, ms: Date.now() - t0, bySource };
}

/**
 * The n items, drawn round robin from the three generators so a short draw is not all
 * algebra. Deterministic in `seed`: the same seed draws the same questions.
 */
export function askSuiteItems({ seed = 'ask', n = 30, tasks = null } = {}) {
  if (!tasks) throw new Error('askSuiteItems: pass the tasks module (it is imported asynchronously)');
  const rng = new RNG('ask.suite:' + seed);
  const pools = {
    algebra: tasks.generateAlgebra({ seed: 'algebra/' + seed }),
    sequence: tasks.generateSequences({ seed: 'sequence/' + seed }),
    grid: tasks.generateGrids({ seed: 'grid/' + seed }),
  };
  const out = [];
  const used = { algebra: new Set(), sequence: new Set(), grid: new Set() };
  for (let i = 0; out.length < n; i++) {
    const source = SUITE_SOURCES[i % SUITE_SOURCES.length];
    const pool = pools[source];
    if (!pool || !pool.length || used[source].size >= pool.length) {
      if (SUITE_SOURCES.every((s) => !pools[s].length || used[s].size >= pools[s].length)) break;
      continue;
    }
    let k = rng.int(pool.length), guard = 0;
    while (used[source].has(k) && guard++ < pool.length) k = (k + 1) % pool.length;
    used[source].add(k);
    out.push(itemOf(source, pool[k], tasks));
  }
  return out;
}

function itemOf(source, p, tasks) {
  if (source === 'algebra') {
    if (p.kind === 'decimal.compare') {
      return {
        id: p.id, source, grade: 'number', a: String(p.expected),
        q: 'Compare two numbers. Answer -1 if the first is smaller, 0 if they are equal, 1 if the first is larger. First ' + p.a + ', second ' + p.b + '. Answer with -1, 0 or 1 only.',
      };
    }
    const head = p.kind === 'linear.solve'
      ? 'Solve for x, exactly. Answer with the value only, as an integer or a fraction: '
      : 'Compute this exactly. Answer with the value only, as an integer, a decimal or a fraction: ';
    return { id: p.id, source, grade: 'number', a: String(p.expected), q: head + p.prompt };
  }
  if (source === 'sequence') {
    return {
      id: p.id, source, grade: 'number', a: String(p.expected),
      q: 'Here are the first terms of an exact sequence: ' + p.terms.join(', ') + '. What is the next term? Answer with the value only.',
    };
  }
  const toLine = (g) => tasks.G.toString(g).replace(/\n/g, '|');
  const demos = p.demos.map((d) => toLine(d.input) + ' -> ' + toLine(d.output)).join('\n');
  return {
    id: p.id, source, grade: 'exact', a: toLine(p.test.output),
    q: 'Each line below is an input grid and its output grid, rows separated by | and every cell a single digit. '
      + 'One transformation makes every output from its input.\n' + demos
      + '\nApply that same transformation to this input: ' + toLine(p.test.input)
      + '\nAnswer with the output grid only, rows separated by |.',
  };
}
