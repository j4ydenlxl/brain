#!/usr/bin/env node
// bin/brain.mjs: THE INSTRUMENT. His manual: "largely CLI based", and "the system should make
// it possible to pause computation, inspect state, replay events, compare versions, analyze
// connectivity, and reproduce experiments". That sentence is this file's specification.
//
// Every command takes --json for machine output and --no-color for a plain terminal. Every
// command that can talk to a running brain does, through state/<name>/control.json; with no
// live brain it operates on the snapshot instead, using the same code path.
//
// Zero dependencies. Node 24 ESM.
import { mkdtempSync, rmSync, existsSync, statSync } from 'node:fs';
import { tmpdir, totalmem } from 'node:os';
import { spawn } from 'node:child_process';
import { getHeapStatistics } from 'node:v8';
import path from 'node:path';

import {
  layout, ensureDirs, brainExists, listBrains, resolveSnapshotFile,
  loadBrain, loadBrainFromFile, writeMeta, saveBrain, readLedgerFile, BRAIN_ROOT, stateRoot,
} from '../cli/state.mjs';
import {
  colorOn, styler, stringify, jsonSafe, table, kv, hr, num, ms, truncate,
  oneLine, report, renderCell, renderSignals, renderTrace, renderLedger, renderDiff,
} from '../cli/format.mjs';

// The three heavy modules load on first use and are cached. cli/ops.mjs pulls in core/cell,
// core/primitives, core/clock, core/connectome, core/signal, core/rng and core/simd;
// cli/control.mjs pulls in node:http and node:crypto. `help`, `--version` and any argument
// error need none of that. Measured with spawnSync, 15 interleaved rounds, best of each arm:
// `help` 35.2ms lazy against 59.2ms eager, with a bare `node -e 0` at 28.3ms on this machine,
// so the CLI's own load cost went from 31ms to 7ms. The test asserts the property itself, by
// observing what the process loads rather than by timing it. cli/state.mjs and cli/format.mjs
// stay eager: state.mjs imports only node:fs and node:path and reaches core through dynamic
// imports of its own, and format.mjs imports nothing at all.
let _ops = null, _control = null, _runmod = null;
const opsMod = async () => (_ops ??= await import('../cli/ops.mjs'));
const controlMod = async () => (_control ??= await import('../cli/control.mjs'));
const runMod = async () => (_runmod ??= await import('../cli/run.mjs'));

const BOOLEAN_FLAGS = new Set([
  'json', 'realtime', 'fast', 'no-color', 'help', 'version', 'force', 'quiet', 'viz',
  'verbose', 'keep-outbox', 'all', 'follow', 'plain', 'spin', 'approve', 'quick',
  'auto', 'dry', 'no-author',
]);
const SAVES_AFTER = new Set(['inject', 'tick', 'step', 'approve', 'reject', 'propose']);

// ---------------------------------------------------------------- argument parsing
export function parseArgv(argv) {
  const opts = {}, pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--') { pos.push(...argv.slice(i + 1)); break; }
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq > 0) { opts[a.slice(2, eq)] = a.slice(eq + 1); continue; }
      const key = a.slice(2);
      const next = argv[i + 1];
      if (BOOLEAN_FLAGS.has(key) || next === undefined || (next.startsWith('--'))) opts[key] = true;
      else { opts[key] = next; i++; }
      continue;
    }
    if (a === '-h') { opts.help = true; continue; }
    if (a === '-j') { opts.json = true; continue; }
    if (a === '-n') { opts.n = argv[++i]; continue; }
    pos.push(a);
  }
  return { opts, pos };
}

// ---------------------------------------------------------------- output
let ST = styler(false);
function out(s) { process.stdout.write(s + '\n'); }
function emit(ctx, cmd, payload, text) {
  if (ctx.json) out(stringify({ ok: true, cmd, ...payload }));
  else out(typeof text === 'function' ? text() : text);
}
function need(ctx, i, label) {
  const v = ctx.pos[i];
  if (v === undefined) throw new Error('missing <' + label + '>. Try: brain help');
  return v;
}
function intOpt(v, dflt) { const n = Number(v); return Number.isFinite(n) ? n : dflt; }

// The learning subsystem is owned by another agent. It was specified to me as
// learning/registry.mjs exporting attach(brain, config); it shipped with the registry in
// registry.mjs and attach() in engine.mjs, both re-exported from index.mjs. Try the barrel
// first, then each named file, and say plainly what is missing if none of them has attach.
const LEARNING_SPECS = ['../learning/index.mjs', '../learning/engine.mjs', '../learning/registry.mjs'];

// attach() silently ignores a rule name it does not recognise, so `--rules hebian` would run
// nothing and report success. Names are checked against the registry first.
function checkRuleNames(mod, config) {
  const wanted = Array.isArray(config.rules) ? config.rules : [];
  if (!wanted.length || typeof mod.ruleNames !== 'function') return config;
  const known = mod.ruleNames();
  const unknown = wanted.filter((r) => !known.includes(r));
  if (unknown.length) throw new Error('unknown learning rule' + (unknown.length > 1 ? 's' : '') + ' ' + unknown.join(', ') + ' (have: ' + known.join(', ') + ')');
  return config;
}
async function loadLearning() {
  const tried = [];
  for (const spec of LEARNING_SPECS) {
    try {
      const mod = await import(spec);
      if (typeof mod.attach === 'function') return mod;
      tried.push(spec + ' (loaded, no attach export)');
    } catch (e) { tried.push(spec + ' (' + (e.code || e.name) + ')'); }
  }
  throw new Error('the learning subsystem is not available yet: no attach(brain, config) found. Tried ' + tried.join(', ') + '. That subsystem belongs to another agent; every other command works without it.');
}

// --learn            default config
// --learn a,b        run rules a and b brain wide
// --learn '{...}'    a literal config object
export function parseLearnConfig(v) {
  const config = parseLearnRules(v);
  // stdout belongs to the payload. The engine's own lines go to stderr, where they stay
  // visible to a human and out of the way of `--json | jq`.
  if (config.print === undefined) config.print = (line) => process.stderr.write(String(line) + '\n');
  return config;
}
function parseLearnRules(v) {
  if (v === true || v === undefined || v === '') return {};
  const raw = String(v).trim();
  if (raw.startsWith('{')) return JSON.parse(raw);
  return { rules: raw.split(',').map((x) => x.trim()).filter(Boolean) };
}

async function lazy(spec, what) {
  try { return await import(spec); } catch (e) {
    throw new Error(what + ' is not available yet: could not load ' + spec + ' (' + (e.code || e.name) + ': ' + String(e.message).split('\n')[0] + '). That file belongs to another subsystem; every other command works without it.');
  }
}

// Run an op against a live brain when one exists, otherwise against the snapshot.
async function runOp(name, opName, args, { mutates = false } = {}) {
  const L = layout(name);
  const { connect } = await controlMod();
  const client = await connect(L.dir);
  if (client) {
    const payload = await client.rpc(opName, args);
    return { ...payload, live: true, control: { url: client.info.url, pid: client.info.pid, port: client.info.port, started: client.info.started } };
  }
  if (!brainExists(name)) throw new Error('no brain "' + name + '" under ' + stateRoot() + ' (run: brain init ' + name + ')');
  const brain = await loadBrain(name, { ledger: mutates ? 'full' : 'off' });
  const env = { name, layout: L, runner: null, live: false };
  const { ops } = await opsMod();
  const payload = await ops[opName](brain, args, env);
  if (mutates && SAVES_AFTER.has(opName)) saveBrain(brain, name);
  else brain.ledger.flush();
  return { ...payload, live: false, control: null };
}

// If a brain is live, make it write its snapshot so that file based commands read the truth.
async function refreshSnapshot(name) {
  const { connect } = await controlMod();
  const client = await connect(layout(name).dir);
  if (!client) return false;
  await client.rpc('snapshot', {});
  return true;
}

// ---------------------------------------------------------------- commands
const COMMANDS = {};
const describe = (name, usage, doc, fn) => { COMMANDS[name] = { name, usage, doc, fn }; };

describe('init', 'init <name> [--seed basic] [--force]', 'Create state/<name>/ and write the first snapshot.', async (ctx) => {
  const name = need(ctx, 0, 'name');
  const seed = ctx.opts.seed === true || !ctx.opts.seed ? 'basic' : String(ctx.opts.seed);
  const L = ensureDirs(name);
  if (existsSync(L.snapshot) && !ctx.opts.force) throw new Error('brain "' + name + '" already exists at ' + L.dir + ' (use --force to overwrite)');
  if (seed !== 'basic') throw new Error('unknown seed "' + seed + '" (have: basic)');
  const { seedBasic } = await import('../seeds/basic.mjs');
  const brain = seedBasic({ name, dir: L.dir, ledger: 'full' });
  const file = brain.snapshot(L.dir);
  brain.ledger.flush();
  writeMeta(name, { name, seed, created: new Date().toISOString(), node: process.version, cells: brain.cells.length, edges: brain.connectome.size() });
  const payload = { name, seed, dir: L.dir, snapshot: file, bytes: statSync(file).size, summary: jsonSafe(brain.summary()) };
  emit(ctx, 'init', payload, () => [
    ST.bold('initialized ') + ST.magenta(name) + ST.grey('  seed=' + seed),
    '  ' + ST.grey('dir      ') + L.dir,
    '  ' + ST.grey('snapshot ') + file + ST.grey('  ' + payload.bytes + ' bytes'),
    '  ' + ST.grey('ledger   ') + L.ledger,
    '  ' + oneLine(payload.summary, ST),
    ST.grey('next: brain tick ' + name + ' 10   |   brain status ' + name + '   |   brain run ' + name + ' --realtime'),
  ].join('\n'));
});

describe('status', 'status <name>', 'Full report: regions, scheduler, gate, connectome, ledger, labels.', async (ctx) => {
  const name = need(ctx, 0, 'name');
  const p = await runOp(name, 'status', {});
  emit(ctx, 'status', p, () => report(p, ST));
});

describe('tick', 'tick <name> [N]', 'Advance the clock by N ticks (default 1) and print what came out.', async (ctx) => {
  const name = need(ctx, 0, 'name');
  const n = intOpt(ctx.pos[1] ?? ctx.opts.ticks ?? ctx.opts.n, 1);
  const p = await runOp(name, 'tick', { n }, { mutates: true });
  emit(ctx, 'tick', p, () => [
    ST.bold('tick ') + n + ST.grey('  t ' + p.from + ' -> ' + p.t) + '  ' + ST.grey('runs=') + num(p.runs) + ' ' + ST.grey('signals=') + num(p.signals) + ' ' + ST.grey('delivered=') + num(p.delivered) + '  ' + ST.grey(ms(p.wallMs) + (p.ticksPerSec ? ', ' + num(p.ticksPerSec) + ' ticks/s' : '')),
    ST.grey('ledger seq ' + p.ledgerFrom + ' -> ' + p.ledgerTo + (p.live ? '  [live]' : '')),
    renderSignals(p.outbox, ST, 'outbox'),
  ].join('\n'));
});

describe('inject', 'inject <name> <cell> <port> <kind> <json> [--delay N] [--w X]', 'Deliver an external signal to a cell port. kind is one of hv sdr num sym vec event.', async (ctx) => {
  const name = need(ctx, 0, 'name');
  const args = { cell: need(ctx, 1, 'cell'), port: need(ctx, 2, 'port'), kind: need(ctx, 3, 'kind'), json: need(ctx, 4, 'json'), delay: intOpt(ctx.opts.delay, 0), w: intOpt(ctx.opts.w, 1) };
  const p = await runOp(name, 'inject', args, { mutates: true });
  emit(ctx, 'inject', p, () => ST.bold('injected ') + ST.cyan(p.injected.kind) + ' -> ' + ST.magenta(args.cell) + '.' + args.port
    + '\n  ' + ST.grey('value  ') + p.injected.text
    + '\n  ' + ST.grey('arrives') + ' t=' + p.arrivesAt + (p.live ? ST.green('  [live]') : ST.grey('  [snapshot]')));
});

describe('inspect', 'inspect <name> [cell|circuit|region|edge] <id>', 'Everything a component exposes: ports, state, stats, edges.', async (ctx) => {
  const name = need(ctx, 0, 'name');
  const kinds = ['cell', 'circuit', 'region', 'edge'];
  let what = ctx.pos[1], id = ctx.pos[2];
  if (!kinds.includes(what)) { id = what; what = 'cell'; }
  if (id === undefined) throw new Error('missing <id>. Try: brain inspect ' + name + ' cell p.encode');
  const p = await runOp(name, 'inspect', { what, id });
  emit(ctx, 'inspect', p, () => {
    if (p.what === 'cell') return renderCell(p, ST);
    if (p.what === 'circuit') return [
      ST.bold('circuit ') + ST.magenta(p.id) + ST.grey('  period ' + p.periodLabel + (p.doc ? '  ' + p.doc : '')),
      hr(72, ST),
      table([{ key: 'cell' }, { key: 'kind' }, { key: 'period' }, { key: 'runs', align: 'right' }, { key: 'fired', align: 'right' }, { key: 'skips', align: 'right' }], p.cells, ST),
      ST.grey('working memory: ' + p.working.length + ' entries'),
    ].join('\n');
    if (p.what === 'region') return [
      ST.bold('region ') + ST.magenta(p.id) + ST.grey('  budget ' + p.budget + (p.doc ? '  ' + p.doc : '')),
      hr(72, ST),
      ST.grey('circuits ') + p.circuits.join(', '),
      ST.grey('edges inside ') + p.edgesInside + ST.grey('   crossing out ') + p.edgesCrossing,
      table([{ key: 'cell' }, { key: 'kind' }, { key: 'circuit' }, { key: 'period' }, { key: 'runs', align: 'right' }, { key: 'fired', align: 'right' }], p.cells, ST),
    ].join('\n');
    return ST.bold('edge #' + p.e) + '  ' + ST.magenta(p.src) + ST.grey('.' + p.srcPort) + ' -> ' + ST.magenta(p.dst) + ST.grey('.' + p.dstPort) + '\n' + kv({ w: p.w, delay: p.delay, usage: p.usage, lastT: p.lastT, conf: p.conf, state: p.state }, ST);
  });
});

describe('trace', 'trace <name> <seq|last> [--depth d]', 'Walk provenance upstream: which cells, edges and memories produced this event.', async (ctx) => {
  const name = need(ctx, 0, 'name');
  const seq = ctx.pos[1] ?? 'last';
  const p = await runOp(name, 'trace', { seq, depth: intOpt(ctx.opts.depth, 8) });
  emit(ctx, 'trace', p, () => renderTrace(p, ST) + '\n' + ST.grey('cells on this path: ') + p.cells.join(' <- '));
});

describe('ledger', 'ledger <name> [--type T] [--n N] [--cell C]', 'The append only event log: the last N events, and the counts by type.', async (ctx) => {
  const name = need(ctx, 0, 'name');
  const p = await runOp(name, 'ledger', { type: ctx.opts.type === true ? null : ctx.opts.type, n: intOpt(ctx.opts.n, 30), cell: ctx.opts.cell });
  emit(ctx, 'ledger', p, () => [
    ST.bold('ledger ') + ST.grey(p.shown + ' of ' + p.total + (p.type ? ' type=' + p.type : '')),
    renderLedger(p.rows, ST),
    '',
    ST.bold('counts'), kv(p.counts, ST),
  ].join('\n'));
});

describe('proposals', 'proposals <name>', 'Pending gate proposals. Computation is not authority: these wait for a human.', async (ctx) => {
  const name = need(ctx, 0, 'name');
  const p = await runOp(name, 'proposals', {});
  emit(ctx, 'proposals', p, () => [
    ST.bold('gate ') + ST.grey('proposed=' + p.stats.proposed + ' approved=' + p.stats.approved + ' rejected=' + p.stats.rejected + ' held=' + p.stats.held),
    ST.grey('human required for: ' + p.humanRequired.join(', ')),
    hr(72, ST),
    p.pending.length
      ? table([{ key: 'id', align: 'right' }, { key: 'kind' }, { key: 'by' }, { key: 't', align: 'right' }, { key: 'why' }, { key: 'what' }],
        p.pending.map((x) => ({ ...x, why: truncate(x.why, 30), what: truncate(JSON.stringify(x.what), 40) })), ST)
      : ST.grey('(nothing pending)'),
  ].join('\n'));
});

describe('propose', 'propose <name> <kind> <json> [--why W]', 'Open a proposal at the gate, the way a subsystem would.', async (ctx) => {
  const name = need(ctx, 0, 'name');
  const kind = need(ctx, 1, 'kind');
  const what = JSON.parse(need(ctx, 2, 'json'));
  const p = await runOp(name, 'propose', { kind, what, why: ctx.opts.why === true ? undefined : ctx.opts.why, evidence: ctx.opts.evidence ? JSON.parse(ctx.opts.evidence) : {} }, { mutates: true });
  emit(ctx, 'propose', p, () => ST.bold('proposal #' + p.proposal.id) + ' ' + p.proposal.kind + ' ' + statusColor(p.proposal.status) + ST.grey('  by ' + p.proposal.by));
});

for (const verb of ['approve', 'reject']) {
  describe(verb, verb + ' <name> <id>', (verb === 'approve' ? 'Approve' : 'Reject') + ' a pending proposal and log the decision.', async (ctx) => {
    const name = need(ctx, 0, 'name');
    const id = intOpt(need(ctx, 1, 'id'), NaN);
    const p = await runOp(name, verb, { id }, { mutates: true });
    emit(ctx, verb, p, () => ST.bold('proposal #' + p.proposal.id) + ' ' + p.proposal.kind + ' ' + statusColor(p.proposal.status)
      + (p.applied ? ST.green('  applied') : p.note ? ST.grey('  ' + p.note) : ''));
  });
}
function statusColor(s) { return s === 'approved' ? ST.green(s) : s === 'rejected' ? ST.red(s) : ST.yellow(s); }

describe('kinds', 'kinds', 'Every registered cell kind with its ports.', async (ctx) => {
  await import('../cells/basic.mjs');
  const { ops } = await opsMod();
  const p = ops.kinds();
  emit(ctx, 'kinds', p, () => ST.bold(p.kinds.length + ' cell kinds') + '\n' + table([{ key: 'kind' }, { key: 'in' }, { key: 'out' }, { key: 'cost', align: 'right' }, { key: 'doc' }],
    p.kinds.map((k) => ({ ...k, doc: truncate(k.doc, 56) })), ST));
});

describe('primitives', 'primitives', 'The orthogonal primitive vocabulary cells are composed from.', async (ctx) => {
  const { ops } = await opsMod();
  const p = ops.primitives();
  emit(ctx, 'primitives', p, () => ST.bold(p.primitives.length + ' orthogonal primitives') + '\n' + table([{ key: 'primitive' }, { key: 'in' }, { key: 'out' }, { key: 'cost', align: 'right' }], p.primitives, ST));
});

describe('rules', 'rules', 'Every registered learning rule, its scope and its defaults.', async (ctx) => {
  const mod = await loadLearning();
  const rules = (typeof mod.listRules === 'function' ? mod.listRules() : []).map((r) => ({
    rule: r.name, scope: r.scope, doc: r.doc, defaults: r.defaults,
  }));
  emit(ctx, 'rules', { rules }, () => ST.bold(rules.length + ' learning rules') + '\n' + table(
    [{ key: 'rule' }, { key: 'scope' }, { key: 'doc', value: (r) => truncate(r.doc || '', 44) }, { key: 'defaults', value: (r) => truncate(JSON.stringify(r.defaults ?? {}), 40) }], rules, ST));
});

describe('learn', 'learn <name> [--rules a,b] [--ticks N] [--budget N]',
  'Attach the learning rules, run N ticks, and report what moved.', async (ctx) => {
    const name = need(ctx, 0, 'name');
    const mod = await loadLearning();
    const ticks = intOpt(ctx.opts.ticks ?? ctx.pos[1], 1000);
    const config = checkRuleNames(mod, parseLearnConfig(ctx.opts.rules));
    if (ctx.opts.budget !== undefined) config.budget = intOpt(ctx.opts.budget, config.budget);
    const brain = await loadBrain(name, { ledger: 'full' });
    const before = { w: Float32Array.from(brain.connectome.w.subarray(0, brain.connectome.size())), edges: brain.connectome.size(), t: brain.clock.t };
    const engine = mod.attach(brain, config);
    const t0 = performance.now();
    brain.tick(ticks);
    const wallMs = Number((performance.now() - t0).toFixed(1));
    const learned = typeof engine.report === 'function' ? jsonSafe(engine.report()) : null;
    if (typeof engine.detach === 'function') engine.detach();
    saveBrain(brain, name);
    // How far the weights actually moved, which is the only evidence a rule did anything.
    let moved = 0, sumAbs = 0, maxAbs = 0;
    for (let e = 0; e < before.edges; e++) {
      const d = brain.connectome.w[e] - before.w[e];
      if (d !== 0) { moved++; sumAbs += Math.abs(d); if (Math.abs(d) > maxAbs) maxAbs = Math.abs(d); }
    }
    const weights = { edgesBefore: before.edges, edgesAfter: brain.connectome.size(), moved, meanAbsDelta: moved ? Number((sumAbs / moved).toFixed(6)) : 0, maxAbsDelta: Number(maxAbs.toFixed(6)) };
    const pay = { name, ticks, wallMs, t: { from: before.t, to: brain.clock.t }, learning: learned, weights, summary: jsonSafe(brain.summary()) };
    emit(ctx, 'learn', pay, () => [
      ST.bold('learn ') + ST.magenta(name) + ST.grey('  ' + num(ticks) + ' ticks in ' + ms(wallMs) + '  t ' + before.t + ' -> ' + brain.clock.t),
      learned ? kv({ rules: learned.rules.join(',') || '(cell policies only)', applied: learned.applied, appliedPerTick: learned.appliedPerTick, skipped: learned.skipped, overBudget: learned.overBudget, usPerTick: learned.usPerTick }, ST) : '',
      ST.bold('weights'),
      kv(weights, ST),
      '  ' + oneLine(pay.summary, ST),
    ].filter(Boolean).join('\n'));
  });

describe('snapshot', 'snapshot <name> [--label L]', 'Write the snapshot now, and optionally keep a labelled copy.', async (ctx) => {
  const name = need(ctx, 0, 'name');
  const label = ctx.opts.label === true ? null : ctx.opts.label;
  const p = await runOp(name, 'snapshot', { label }, { mutates: true });
  const bytes = existsSync(p.file) ? statSync(p.file).size : 0;
  emit(ctx, 'snapshot', { ...p, bytes }, () => ST.bold('snapshot ') + ST.grey('t=' + p.t + ' cells=' + p.cells + ' edges=' + p.edges + ' ' + num(bytes) + ' bytes')
    + '\n  ' + p.file + (p.labelled ? '\n  ' + ST.green('labelled ') + p.labelled : ''));
});

describe('replay', 'replay <name> <label> [--ticks N] | replay <dir> [--ticks N]', 'Restore a labelled snapshot, re-run it, and diff the result against the live brain. Given a state DIRECTORY instead of a name, replays it deterministically against its own ledger and reports the first divergence.', async (ctx) => {
  const name = need(ctx, 0, 'name');
  // `brain replay <dir> --ticks N`: a state directory holding snapshot.json and ledger.jsonl
  // is replayed by lab/replay.mjs, which re-runs the ticks and compares the ledger, the
  // cell.run order and the outputs bit for bit. A brain NAME is never an existing directory
  // with a snapshot in it, so the two forms cannot collide and the older one is untouched.
  if (existsSync(path.join(name, 'snapshot.json'))) {
    const { replay, renderReplay } = await lazy('../lab/replay.mjs', 'the lab replay instrument');
    const r = replay(name, { ticks: ctx.opts.ticks === undefined ? undefined : intOpt(ctx.opts.ticks, 0) });
    emit(ctx, 'replay', r, () => renderReplay(r));
    if (!r.ok) process.exitCode = 1;
    return;
  }
  const label = need(ctx, 1, 'label');
  const n = intOpt(ctx.opts.ticks, 0);
  const L = layout(name);
  const file = resolveSnapshotFile(name, label);
  await refreshSnapshot(name);
  const tmp = mkdtempSync(path.join(tmpdir(), 'brain-replay-'));
  try {
    const { describeSignal, diffSnapshots } = await opsMod();
    const brain = await loadBrainFromFile(file, tmp, { ledger: 'off' });
    const from = jsonSafe(brain.summary());
    const t0 = performance.now();
    if (n > 0) brain.tick(n);
    const wallMs = Number((performance.now() - t0).toFixed(2));
    const replayed = jsonSafe(brain.summary());
    const outbox = brain.takeOutbox().map((s) => describeSignal(brain, s));
    brain.snapshot(tmp);
    const liveBrain = await loadBrain(name, { ledger: 'off' });
    const live = jsonSafe(liveBrain.summary());
    const diff = await diffSnapshots(path.join(tmp, 'snapshot.json'), L.snapshot, label + (n ? '+' + n : ''), 'live');
    const p = { label, ticks: n, wallMs, from, replayed, live, outbox, diff };
    emit(ctx, 'replay', p, () => [
      ST.bold('replay ') + ST.magenta(label) + ST.grey('  ' + n + ' ticks in ' + ms(wallMs)),
      '  ' + ST.grey('from     ') + oneLine(from, ST),
      '  ' + ST.grey('replayed ') + oneLine(replayed, ST),
      '  ' + ST.grey('live     ') + oneLine(live, ST),
      '',
      renderDiff(diff, ST),
      outbox.length ? '\n' + renderSignals(outbox, ST, 'replay outbox') : '',
    ].join('\n'));
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

describe('diff', 'diff <name> <labelA> <labelB>', 'Compare two snapshots: cell stats, edges added and removed, weight deltas. "live" means the current snapshot.', async (ctx) => {
  const name = need(ctx, 0, 'name');
  const a = need(ctx, 1, 'labelA'), b = need(ctx, 2, 'labelB');
  if (a === 'live' || b === 'live') await refreshSnapshot(name);
  const { diffSnapshots } = await opsMod();
  const d = await diffSnapshots(resolveSnapshotFile(name, a), resolveSnapshotFile(name, b), a, b);
  emit(ctx, 'diff', d, () => renderDiff(d, ST));
});

// The research instrument. His manual: "Researchers should be able to create isolated
// experimental regions, introduce alternative mechanisms, compare their behavior against
// existing systems, and integrate successful approaches into the larger architecture."
// lab/ is loaded lazily like the other heavy subsystems, so `brain help` never pays for it.
describe('lab', 'lab <list|run|verdict|compare|cost|integrate> [name|all] [--json]', 'Run an isolated experiment against the bar it stated before the run, read a verdict back, price the task list, or propose a confirmed mechanism through the gate.', async (ctx) => {
  const sub = ctx.pos[0] || 'list';
  const cli = await lazy('../lab/cli.mjs', 'the lab research instrument');
  if (sub === 'list') {
    const r = await cli.cmdList({});
    emit(ctx, 'lab.list', { experiments: r.rows, verdictsDir: r.verdictsDir }, () => r.text);
    return;
  }
  if (sub === 'run') {
    const records = await cli.cmdRun(ctx.pos[1] || 'all', {});
    const { renderVerdict } = await lazy('../lab/experiment.mjs', 'the lab experiment harness');
    emit(ctx, 'lab.run', { verdicts: records.map((r) => ({ name: r.name, verdict: r.verdict, metric: r.metric, effect: r.effect.mean, share: r.permutation.share, seeds: r.k, file: r.file })) },
      () => records.map(renderVerdict).join('\n\n'));
    return;
  }
  const argv = [sub, ...ctx.pos.slice(1)];
  for (const [k, v] of Object.entries(ctx.opts)) { if (k === 'json' || k === 'no-color') continue; argv.push('--' + k, String(v)); }
  const code = await cli.main(argv);
  if (code) process.exitCode = code;
});

describe('list', 'list', 'Every brain under the state root.', async (ctx) => {
  const brains = listBrains();
  emit(ctx, 'list', { root: stateRoot(), brains }, () => ST.grey(stateRoot()) + '\n' + (brains.length
    ? table([{ key: 'name' }, { key: 'bytes', align: 'right' }, { key: 'saved' }, { key: 'live' }], brains, ST)
    : ST.grey('(no brains yet: brain init mybrain)')));
});

for (const verb of ['pause', 'resume']) {
  describe(verb, verb + ' <name>', (verb === 'pause' ? 'Pause' : 'Resume') + ' a running brain through the control plane.', async (ctx) => {
    const name = need(ctx, 0, 'name');
    const p = await runOp(name, verb, {});
    emit(ctx, verb, p, () => ST.bold(verb + 'd ') + ST.magenta(name) + ST.grey('  t=' + p.t + ' done=' + p.done));
  });
}

describe('step', 'step <name> [N]', 'Pause a running brain and advance exactly N ticks. With no live brain this ticks the snapshot.', async (ctx) => {
  const name = need(ctx, 0, 'name');
  const n = intOpt(ctx.pos[1] ?? ctx.opts.n, 1);
  const p = await runOp(name, 'step', { n }, { mutates: true });
  emit(ctx, 'step', p, () => ST.bold('step ' + n) + ST.grey('  t ' + p.from + ' -> ' + p.t + '  runs=' + p.runs + (p.live ? '  [live, paused]' : '  [snapshot]')) + '\n' + renderSignals(p.outbox, ST, 'outbox'));
});

describe('stop', 'stop <name>', 'Ask a running brain to snapshot and exit.', async (ctx) => {
  const name = need(ctx, 0, 'name');
  const p = await runOp(name, 'stop', {});
  emit(ctx, 'stop', p, () => ST.bold('stopping ') + ST.magenta(name) + ST.grey('  t=' + p.t + ' done=' + p.done));
});

describe('run', 'run <name> [--realtime|--fast] [--ticks N] [--autosave N] [--port P] [--viz]',
  'Keep the brain alive. Realtime is one tick per millisecond of wall time with drift correction; fast runs flat out. Autosaves, and snapshots on SIGINT.', cmdRun);

describe('live', 'live [name] [--ticks N] [--majors M] [--units U] [--seed S] [--checkpoint N] [--realtime|--fast] [--self-every N] [--gen-every N] [--heap MB] [--port P] [--viz] [--world policy.json] [--ledger L] [--quiet]',
  'THE WHOLE BRAIN as one persistent process: builds or resumes state/<name>/ (default whole), ticks on every timescale, checkpoints every N ticks, runs self-improvement and organism generations on slow periods, and exposes the control plane so every other command and the viz attach to it. --ticks N runs N ticks, checkpoints and exits.', async (ctx) => {
  // A live organism outgrows node's default heap (4288 MB here): the soak died at t=5000 of
  // 'Reached heap limit' with a 2641524189 byte checkpoint due (2026-09-17). --heap N asks for
  // N MB of old space; the default is half of physical memory; --heap 0 keeps node's default.
  // The limit can only be set at process start, so the command re-runs itself once with it.
  const heapNow = Math.round(getHeapStatistics().heap_size_limit / 1048576);
  const heapWant = ctx.opts.heap === undefined || ctx.opts.heap === true ? Math.floor(totalmem() / 1048576 / 2) : intOpt(ctx.opts.heap, 0);
  if (heapWant > heapNow + 512 && !process.env.BRAIN_HEAP_CHILD) {
    const args = ['--max-old-space-size=' + heapWant, ...process.execArgv, ...process.argv.slice(1)];
    if (!(ctx.opts.quiet || ctx.json)) out(ST.grey('[live] heap limit ' + heapNow + ' MB -> ' + heapWant + ' MB (--heap N to set, --heap 0 to keep the default)'));
    const child = spawn(process.execPath, args, { stdio: 'inherit', env: { ...process.env, BRAIN_HEAP_CHILD: String(heapWant) } });
    const code = await new Promise((resolve) => { child.on('exit', (c, sig) => resolve(c === null ? 1 : c)); child.on('error', () => resolve(1)); });
    process.exitCode = code;
    return;
  }
  const mod = await lazy('../daemon/run.mjs', 'the whole-brain daemon');
  const quiet = Boolean(ctx.opts.quiet || ctx.json);
  const optInt = (k) => (ctx.opts[k] === undefined || ctx.opts[k] === true ? undefined : intOpt(ctx.opts[k], undefined));
  const p = await mod.live({
    name: ctx.pos[0] || 'whole',
    ticks: ctx.opts.ticks !== undefined ? intOpt(ctx.opts.ticks, Infinity) : Infinity,
    majors: optInt('majors'), substrateUnits: optInt('units'), checkpointEvery: optInt('checkpoint'),
    selfEvery: optInt('self-every'), genEvery: optInt('gen-every'), port: optInt('port'), vizPort: optInt('viz-port'),
    seed: ctx.opts.seed === true || !ctx.opts.seed ? undefined : String(ctx.opts.seed),
    mode: ctx.opts.realtime ? 'realtime' : 'fast', precision: ctx.opts.spin ? 'spin' : 'timer',
    viz: Boolean(ctx.opts.viz), world: ctx.opts.world === true || !ctx.opts.world ? null : String(ctx.opts.world),
    ledger: ctx.opts.ledger === true ? 'full' : (ctx.opts.ledger || 'full'),
    out: quiet ? null : out,
  });
  emit(ctx, 'live', p, () => mod.printLive(p));
});

// ---------------------------------------------------------------- the prompt surface
// `ask` and `do` are the two verbs a human has. The difference between them is the whole
// design of act/prompt.mjs: ask answers and reaches nothing, do proposes and applies only
// what the human approved on this command line. Both load lazily, like `live`, so the cost
// of act/, world/ and mind/ is paid by the commands that use them and by nothing else.
function promptOpts(ctx) {
  const str = (k) => (ctx.opts[k] === true || ctx.opts[k] === undefined ? undefined : String(ctx.opts[k]));
  return {
    provider: str('provider'), model: str('model'), base: str('base'),
    spawn: ctx.opts.spawn === true ? true : undefined,
    k: intOpt(ctx.opts.k, 5),
    maxTokens: ctx.opts['max-tokens'] === undefined ? undefined : intOpt(ctx.opts['max-tokens'], undefined),
  };
}
// The ledger's in memory ring is empty in a fresh CLI process, so the pages act/web.mjs
// already ingested are read off disk and handed to the recall. Without this the surface
// would report "0 web pages" on a brain that has read hundreds.
function ingestEvents(name) {
  try { return readLedgerFile(name, { max: 20000 }).filter((e) => e && e.type === 'act.web.ingest'); } catch { return []; }
}

describe('ask', 'ask <name> <prompt...> [--provider null|ollama|env] [--model M] [--k N] [--spawn]',
  'Ask the organism. It answers from what it holds: its memory, the pages its world senses read, and the llm cell. It reaches nothing and proposes nothing. One ledger event per ask, carrying a hash of the prompt and never the prompt.', async (ctx) => {
    const name = need(ctx, 0, 'name');
    const prompt = ctx.pos.slice(1).join(' ').trim();
    if (!prompt) throw new Error('missing <prompt>. Try: brain ask ' + name + ' what do you hold about the gate');
    const mod = await lazy('../act/prompt.mjs', 'the prompt surface');
    const brain = await loadBrain(name, { ledger: 'full' });
    const a = await mod.ask(brain, prompt, { ...promptOpts(ctx), events: ingestEvents(name) });
    // --spawn (his P7, 2026-09-26 10:51: "it needs to adapat and generate cells"): a question grows the
    // cells that answer it (act/spawn.mjs, through the gate), prunes what did not carry and keeps what
    // did. What it kept is saved, so the next `brain status <name>` counts the cells this question grew
    // and the same kind of question next time runs on them and grows nothing.
    if (a.route === 'spawn') saveBrain(brain, name); else brain.ledger.flush();
    emit(ctx, 'ask', { name, ...a }, () => [
      ST.bold('ask ') + ST.magenta(name) + ST.grey('  ' + a.promptHash + '  ' + a.promptChars + ' chars'),
      hr(72, ST),
      a.text,
      hr(72, ST),
      ST.grey('answered from ') + (a.from === 'llm' ? ST.cyan('llm') : ST.green('memory'))
        + ST.grey('  memory hits ') + num(a.provenance.memoryHits)
        + ST.grey('  web pages ') + num(a.provenance.webPages)
        + ST.grey('  llm ') + a.provenance.llm.provider + '/' + (a.provenance.llm.model || '-') + ' ' + ms(a.provenance.llm.ms)
        + (a.redacted ? ST.yellow('  redacted ' + a.redacted) : ''),
      // Guarded: the route is being added to ask() by another builder and the provenance is
      // only stamped on the paths that have one, so neither is assumed to be there.
      ...(a.route || (a.provenance && a.provenance.answer)
        ? [ST.grey('route ') + ST.cyan(a.route || 'unnamed') + ST.grey('  provenance ') + ST.green(a.provenance && a.provenance.answer ? a.provenance.answer : 'unstamped')]
        : []),
      a.cites.length ? ST.grey('cites: ') + a.cites.map((c) => c.source + '#' + c.id).join(', ') : ST.grey('cites: (none)'),
    ].join('\n'));
  });

describe('do', 'do <name> <prompt...> [--approve] [--provider null|ollama|env] [--model M] [--cwd D] [--world policy.json]',
  'Plan from the prompt. A url the prompt names becomes an http.get proposal, an argv in a fenced block or after "run:" becomes a proc.spawn proposal, and both go through the gate. Without --approve nothing is applied and every proposal is held for a human. The model may suggest; a suggestion becomes a proposal only with --approve. Text fetched from the web never becomes a proposal at all. With no --world the gate is armed from the shipped world/policy.json, which allows no host, no exec and no root: proposals are opened and held for you, and nothing can be applied until you pass a policy that names what you allow.', async (ctx) => {
    const name = need(ctx, 0, 'name');
    const prompt = ctx.pos.slice(1).join(' ').trim();
    if (!prompt) throw new Error('missing <prompt>. Try: brain do ' + name + ' read https://example.com');
    const mod = await lazy('../act/prompt.mjs', 'the prompt surface');
    const pol = await lazy('../world/policy.mjs', 'the world policy');
    const brain = await loadBrain(name, { ledger: 'full' });
    // A seeded brain's gate has never been armed for world.act (seeds/basic.mjs builds a
    // mind, not a reach), so before this every proposal `do` opened came back refused with
    // "this gate was never armed for world.act" and the prompt surface did nothing at all
    // unless the human happened to pass --world. The default is now the SHIPPED
    // world/policy.json, whose http hosts, proc exec and fs roots are all empty: it denies
    // every act, so arming with it cannot widen anything. It only means a proposal exists to
    // be held, listed by `brain proposals` and decided by a human. Without --approve the
    // surface also holds every proposal at the gate, exactly as before.
    const worldArg = ctx.opts.world === true || !ctx.opts.world ? null : String(ctx.opts.world);
    const world = worldArg ?? pol.POLICY_FILE;
    const p = await mod.doPrompt(brain, prompt, {
      ...promptOpts(ctx),
      approve: ctx.opts.approve === true,
      cwd: ctx.opts.cwd === true || !ctx.opts.cwd ? undefined : String(ctx.opts.cwd),
      world,
      events: ingestEvents(name),
    });
    p.world = { file: world, defaulted: worldArg === null };
    // A held proposal lives in the gate's pending map, and the gate is part of the snapshot.
    // Flushing the ledger alone would leave `brain approve <id>` with nothing to approve, so
    // any run that opened a proposal is saved, not only one that applied something.
    if (p.proposals.length || p.applied.some((a) => a.applied)) saveBrain(brain, name); else brain.ledger.flush();
    emit(ctx, 'do', { name, ...p }, () => [
      ST.bold('do ') + ST.magenta(name) + ST.grey('  ' + p.promptHash) + '  '
        + (p.approve ? ST.green('--approve') : ST.yellow('no --approve: nothing is applied')),
      p.proposals.length
        ? table([{ key: 'id', align: 'right' }, { key: 'op' }, { key: 'origin' }, { key: 'status' }, { key: 'what' }, { key: 'reason' }],
          p.proposals.map((x) => ({ ...x, what: truncate(x.url || (x.argv || []).join(' '), 40), reason: truncate(x.reason || '', 34) })), ST)
        : ST.grey('(the prompt named no url and no argv)'),
      p.suggestions.length
        ? ST.grey('the model also suggested ' + p.suggestions.length + ' action'
          + (p.suggestions.length === 1 ? '' : 's') + (p.approve ? ' (proposed: --approve was given)' : ' (NOT proposed: no --approve)'))
        : '',
      p.applied.length
        ? ST.bold('applied') + '\n' + table([{ key: 'op' }, { key: 'origin' }, { key: 'applied' }, { key: 'what' }, { key: 'reason' }],
          p.applied.map((x) => ({ ...x, what: truncate(x.url || (x.argv || []).join(' '), 40), reason: truncate(x.reason || '', 34) })), ST)
        : '',
      ST.grey('pending ') + num(p.pending) + ST.grey('  memory hits ') + num(p.recall.memoryHits)
        + ST.grey('  web pages ') + num(p.recall.webPages) + ST.grey('  llm ') + p.llm.provider + ' ' + ms(p.llm.ms)
        + ST.grey('  gate ') + (p.gateArmed ? ST.green('armed') : ST.red('not armed for world.act')),
      p.gateArmed
        ? ST.grey('world policy: ') + (p.world.defaulted
          ? 'the shipped world/policy.json' + ST.grey(' (no --world was given; it allows no host, no exec and no root, so every proposal is held for you and none can be applied)')
          : p.world.file)
        : '',
      ST.grey('next: brain proposals ' + name + '   |   brain approve ' + name + ' <id>'),
    ].filter(Boolean).join('\n'));
  });

describe('self-code', 'self-code <name> [--approve <id>] [--reject <id>] [--max N] [--timeout MS]  |  self-code [name] --auto [--dry] [--gate-cmd CMD] [--candidates FILE] [--root DIR] [--gate-timeout MS]',
  'Self improvement of the organism\'s own source. With no id it runs the analysis over bench/verdicts (a survived mutant, a red gate test file), puts each candidate to the gate, and lists what is pending with the evidence that carried it: the gate policy runs the patch on a copy of the tree and the named test must FAIL before it and PASS after it. Nothing is ever written to a source file without --approve, and an application logs the file hash before and after. A model suggestion is refused until the human approves it here. --auto is the path with no human (self/autopilot.mjs): each candidate whose evidence holds is written, its pre-patch bytes and both hashes are snapshotted under state/self-code/<id>/, the whole gate runs, and a red gate reverts it byte for byte; one ledger line per decision goes to bench/verdicts/autopilot/<date>.jsonl. It never touches MANUAL.md, docs/, self/, the gate or a test. --dry prints what it would do and writes nothing.', async (ctx) => {
    if (ctx.opts.auto) {
      const auto = await lazy('../self/autopilot.mjs', 'the self-code autopilot');
      const r = auto.runFromCli(ctx.opts);
      emit(ctx, 'self-code', { auto: true, ...r }, () => auto.renderRun(r, ST));
      if (r.exitCode) process.exitCode = r.exitCode;
      return;
    }
    const name = need(ctx, 0, 'name');
    const mod = await lazy('../self/code.mjs', 'the self.code surface');
    const brain = await loadBrain(name, { ledger: 'full' });
    // 'approve' is a boolean flag in this CLI, so the id is read from --approve=<id> or from
    // the word after it, and the same for --reject.
    const idOf = (key) => {
      const v = ctx.opts[key];
      if (v === undefined) return null;
      const raw = v === true ? ctx.pos[1] : v;
      const n = Number(raw);
      if (!Number.isInteger(n) || n <= 0) throw new Error('missing <id>. Try: brain self-code ' + name + ' --' + key + ' 3');
      return n;
    };
    const timeoutMs = intOpt(ctx.opts.timeout, undefined);
    const approveId = idOf('approve'), rejectId = idOf('reject');

    if (approveId !== null || rejectId !== null) {
      const id = approveId ?? rejectId;
      const held = brain.gate.pending.get(id);
      if (!held) throw new Error('no pending proposal ' + id + '. Try: brain self-code ' + name);
      if (held.kind !== mod.CODE_KIND) throw new Error('proposal ' + id + ' is a ' + held.kind + ', not a ' + mod.CODE_KIND + '. Try: brain ' + (approveId ? 'approve' : 'reject') + ' ' + name + ' ' + id);
      const decided = brain.gate.decide(id, approveId !== null, 'human', brain.ctx);
      const landed = approveId !== null ? mod.applyApproved(brain, decided, { by: 'human' }) : { ok: false, applied: false, reason: 'rejected by the human' };
      saveBrain(brain, name);
      emit(ctx, 'self-code', { name, id, decision: decided.status, ...landed }, () => [
        ST.bold('self-code ') + ST.magenta(name) + '  #' + id + '  ' + statusColor(decided.status),
        landed.ok
          ? ST.green('applied ') + landed.file + ST.grey('  ' + landed.hunks + ' hunk' + (landed.hunks === 1 ? '' : 's') + '  ' + num(landed.bytesBefore) + ' -> ' + num(landed.bytesAfter) + ' bytes')
            + '\n' + ST.grey('  hash ') + landed.hashBefore.slice(0, 12) + ST.grey(' -> ') + landed.hashAfter.slice(0, 12) + ST.grey('  ledger seq ' + landed.seq)
          : ST.yellow('not applied') + ST.grey(': ' + (landed.reason || '')),
      ].join('\n'));
      return;
    }

    // The policy carries its own timeout, so --timeout re-registers the kind rather than
    // travelling with each candidate.
    if (timeoutMs !== undefined) mod.installCodeKind({ timeoutMs });
    const a = mod.analyze({ max: intOpt(ctx.opts.max, 5), timeoutMs });
    const out = mod.submitAll(brain, a.candidates);
    const pending = mod.listPending(brain);
    saveBrain(brain, name); // a held proposal lives in the gate, and the gate is part of the snapshot
    emit(ctx, 'self-code', { name, sources: a.sources, ...out, pendingList: pending }, () => [
      ST.bold('self-code ') + ST.magenta(name) + ST.grey('  candidates ') + num(out.found)
        + ST.grey('  refused ') + num(out.refused) + ST.grey('  pending ') + num(pending.length) + ST.grey('  already pending ') + num(out.skipped),
      ST.grey('  mutants.json: ' + a.sources.mutants.mutants + ' mutants, ' + a.sources.mutants.survived + ' survived   gate.json: '
        + a.sources.gate.tests + ' test files, ' + a.sources.gate.red + ' red (' + (a.sources.gate.verdict || 'no verdict') + ')'),
      hr(72, ST),
      out.results.length
        ? table([{ key: 'id', align: 'right' }, { key: 'status' }, { key: 'key' }, { key: 'reason' }],
          out.results.map((r) => ({ id: r.id ?? '-', status: r.status, key: truncate(r.key, 30), reason: truncate(r.reason || '', 60) })), ST)
        : ST.grey('(the benches carry no candidate today)'),
      pending.length
        ? ST.bold('pending, waiting for you') + '\n' + table([
          { key: 'id', align: 'right' }, { key: 'file' }, { key: 'test' }, { key: 'origin' },
          { key: 'beforeFail', label: 'fail before', align: 'right' }, { key: 'afterPass', label: 'pass after', align: 'right' }, { key: 'why' },
        ], pending.map((p) => ({ ...p, why: truncate(p.why, 46) })), ST)
        : ST.grey('nothing is pending: no evidence, no approval'),
      ST.grey('next: brain self-code ' + name + ' --approve <id>   |   brain self-code ' + name + ' --reject <id>'),
    ].join('\n'));
  });

describe('viz', 'viz <name> [--port P]', 'Serve the visualization for this brain.', async (ctx) => {
  const name = need(ctx, 0, 'name');
  const mod = await lazy('../viz/server.mjs', 'the visualization server');
  const brain = await loadBrain(name, { ledger: 'off' });
  const v = await mod.startViz(brain, { port: intOpt(ctx.opts.port, 0) });
  // url and port are live getters over server.address(); with the default port 0 the kernel
  // has not assigned one until the listen callback fires, which is what ready resolves on.
  if (v.ready && typeof v.ready.then === 'function') await v.ready;
  emit(ctx, 'viz', { name, url: v.url, source: 'snapshot' }, () => ST.bold('viz ') + ST.cyan(v.url) + ST.grey('  (serving the snapshot of ' + name + '; Ctrl+C to stop)'));
  await new Promise((resolve) => {
    const done = () => { try { v.close(); } catch { /* already closed */ } resolve(); };
    process.on('SIGINT', done); process.on('SIGTERM', done);
  });
});

describe('evolve', 'evolve <name> [--task race] [--seconds 60] [--population N] [--generations N] [--seed S]',
  'Run the generations engine against this brain: population, species, archive, champion.', async (ctx) => {
    const name = need(ctx, 0, 'name');
    const mod = await lazy('../generations/engine.mjs', 'the generations engine');
    const brain = await loadBrain(name, { ledger: 'full' });
    // The engine's own option names, not mine: popSize, generations and untilMs. --seconds is
    // a wall clock bound, so it needs a generation cap high enough for the clock to be the limit.
    const seconds = intOpt(ctx.opts.seconds, 60);
    const gens = ctx.opts.generations !== undefined ? intOpt(ctx.opts.generations, 1) : 1_000_000;
    const options = {
      brain,
      task: ctx.opts.task === true ? 'race' : (ctx.opts.task || 'race'),
      seed: ctx.opts.seed === true || ctx.opts.seed === undefined ? 'evolve' : String(ctx.opts.seed),
      generations: gens,
      untilMs: ctx.opts.generations !== undefined && ctx.opts.seconds === undefined ? null : seconds * 1000,
      untilFitness: ctx.opts.fitness !== undefined ? Number(ctx.opts.fitness) : null,
    };
    if (ctx.opts.population !== undefined) options.popSize = intOpt(ctx.opts.population, undefined);
    if (ctx.opts.episodes !== undefined) options.episodes = intOpt(ctx.opts.episodes, undefined);
    if (ctx.opts.workers !== undefined) options.workers = intOpt(ctx.opts.workers, undefined);
    const t0 = performance.now();
    const result = await mod.evolve(options);
    const wallMs = Number((performance.now() - t0).toFixed(1));
    saveBrain(brain, name);
    // result.engine is the live Engine object; only its summary and history are reportable.
    const history = Array.isArray(result.history) ? result.history : [];
    const pay = {
      name, task: options.task, seed: options.seed, wallMs,
      generations: history.length,
      summary: jsonSafe(result.summary ?? null),
      last: history.length ? jsonSafe(history[history.length - 1]) : null,
      brain: jsonSafe(brain.summary()),
    };
    emit(ctx, 'evolve', pay, () => [
      ST.bold('evolve ') + ST.magenta(name) + ST.grey('  task=' + options.task + '  seed=' + options.seed + '  ' + num(pay.generations) + ' generations in ' + ms(wallMs)),
      pay.summary && typeof pay.summary === 'object' ? kv(pay.summary, ST) : ST.grey('  (the engine returned no summary)'),
      '  ' + oneLine(pay.brain, ST),
    ].join('\n'));
  });

describe('reproduce', 'reproduce <name> [--children N] [--ticks T] [--seeds K] [--seed S] [--approve]',
  'Make N children from this organism\'s genome, evaluate each on the hostable suites, save every child as its own state directory, and propose the best one through the gate. The parent and every child are read on the same K build seeds (--seeds, default 5), and the bar is a paired mean gain above the parent\'s own seed spread with a majority of the K pairs won. Without --approve the proposal is held: the children exist on disk and the parent\'s line of descent does not move. With --approve the lineage goes into the parent\'s meta and a ledger event records it.', async (ctx) => {
    const name = need(ctx, 0, 'name');
    const mod = await lazy('../generations/reproduce.mjs', 'the reproduction path');
    const r = await mod.reproduce({
      name,
      children: intOpt(ctx.opts.children, 4),
      ticks: intOpt(ctx.opts.ticks, 120),
      seeds: intOpt(ctx.opts.seeds, mod.DEFAULT_SEEDS),
      seed: ctx.opts.seed === true || ctx.opts.seed === undefined ? 'reproduce' : String(ctx.opts.seed),
      approve: ctx.opts.approve === true,
      // Progress goes to stderr: stdout belongs to the payload, the same rule --learn follows.
      print: ctx.json ? null : (line) => process.stderr.write(String(line) + '\n'),
    });
    emit(ctx, 'reproduce', { name, ...r }, () => [
      ST.bold('reproduce ') + ST.magenta(name) + ST.grey('  ' + r.children + ' children  ' + r.ticks + ' ticks  seed=' + r.seed + '  ' + ms(r.wallMs)),
      ST.grey('parent ') + r.parent.id + ST.grey(' (' + r.parent.source + ')  fitness ') + r.parent.fitnessPre + ST.grey(' -> ') + r.parent.fitnessPost
        + ST.grey('  drift ' + r.parent.drift + '  bar ') + r.parent.fitness + ST.grey('  suites ' + (r.parent.suites.join(', ') || 'none')),
      hr(72, ST),
      table([
        { key: 'k', align: 'right' }, { key: 'id' }, { key: 'fitness', align: 'right' },
        { key: 'cells', align: 'right' }, { key: 'edges', align: 'right' },
        { key: 'front' }, { key: 'regressions', label: 'regr', align: 'right' }, { key: 'state' },
      ], r.rows.map((x) => ({ ...x, front: x.onFront ? (x.best ? 'best' : 'yes') : '', regressions: x.regressions.length, state: x.name })), ST),
      ST.grey('front ') + r.frontSize + ST.grey(' of ' + r.rows.length),
      ST.bold('gate ') + (r.proposal ? '#' + r.proposal.id + ' ' + r.proposal.kind + ' ' + statusColor(r.proposal.status) : ST.yellow('no proposal')),
      ...r.reasons.map((w) => ST.grey('  because ') + w),
      r.approved ? ST.green('approved') + ST.grey('  lineage ' + r.lineage.parent + ' -> ' + r.lineage.child + ' at generation ' + r.lineage.generation)
        : ST.grey('next: brain proposals ' + name + '   |   brain approve ' + name + ' <id>   |   brain status ' + (r.best ? r.best.name : name)),
    ].join('\n'));
  });

describe('bench', 'bench [--ticks N] [--width W] [--depth D]', 'Measure this machine: tick loop, substrate under load, growth cost, observability cost, persistence.', async (ctx) => {
  const { runBench } = await import('../cli/bench.mjs');
  const p = await runBench({
    ticks: intOpt(ctx.opts.ticks, 5000),
    width: intOpt(ctx.opts.width, 8),
    depth: intOpt(ctx.opts.depth, 12),
    seedTicks: intOpt(ctx.opts['seed-ticks'], 20_000),
  });
  emit(ctx, 'bench', p, () => [
    ST.bold('BRAIN bench') + ST.grey('  ' + p.node + '  ' + p.platform + '  ' + p.cpus + ' cpus  ' + p.memGB + ' GB'),
    ST.grey('  ' + p.cpu),
    hr(72, ST),
    table([
      { key: 'arm' }, { key: 'ticks', align: 'right' }, { key: 'wallMs', label: 'ms', align: 'right' },
      { key: 'ticksPerSec', label: 'ticks/s', align: 'right' }, { key: 'cellRuns', label: 'runs', align: 'right' },
      { key: 'runsPerSec', label: 'runs/s', align: 'right' }, { key: 'deliveriesPerSec', label: 'deliv/s', align: 'right' },
    ], p.arms.filter((a) => a.ticksPerSec !== undefined), ST),
    '',
    ...p.arms.map((a) => ST.bold(a.arm.padEnd(13)) + ST.grey(a.detail)
      + (a.slowdown ? '\n' + ' '.repeat(13) + ST.yellow('co-activation costs ' + a.slowdown + 'x: ' + num(a.baselineTicksPerSec) + ' -> ' + num(a.ticksPerSec) + ' ticks/s') : '')
      + (a.snapshotMs !== undefined ? '\n' + ' '.repeat(13) + 'snapshot ' + ms(a.snapshotMs) + ', restore ' + ms(a.restoreMs) + ', ' + num(a.bytes) + ' bytes (' + num(a.bytesPerCell) + '/cell), identical=' + a.identical : '')
      + (a.eventsPerTick !== undefined ? '\n' + ' '.repeat(13) + a.eventsPerTick + ' ledger events per tick' : '')),
  ].join('\n'));
});

describe('ladder', 'ladder [--date YYYY-MM-DD] [--tier N] [--quick] [--model M]',
  'Today\'s score, dated: four columns (answer, code, capability, health) on the seed ladder/<date>, their composite, and the day over day line against yesterday. --quick opens no socket and writes nothing.', async (ctx) => {
    const mod = await import('../bench/ladder.mjs');
    const v = await mod.run({
      date: ctx.opts.date === true ? undefined : ctx.opts.date,
      tier: ctx.opts.tier === true || ctx.opts.tier === undefined ? null : Number(ctx.opts.tier),
      quick: !!ctx.opts.quick,
      model: ctx.opts.model === true ? undefined : ctx.opts.model,
      quiet: true,
    });
    // The same lines the bench prints, through emit, so the CLI and the bench cannot drift.
    emit(ctx, 'ladder', {
      date: v.date, tier: v.tier, seed: v.seed, quick: v.quick, columns: v.columns,
      composite: v.composite, dayOverDay: v.dayOverDay, line: v.line, wrote: v.wrote, ms: v.ms,
    }, () => v.lines.join('\n'));
  });

describe('help', 'help [command]', 'This text.', async (ctx) => {
  const which = ctx.pos[0];
  if (which && COMMANDS[which]) {
    const c = COMMANDS[which];
    emit(ctx, 'help', { command: which, usage: c.usage, doc: c.doc }, () => ST.bold(c.usage) + '\n  ' + c.doc);
    return;
  }
  const rows = Object.values(COMMANDS).map((c) => ({ usage: c.usage, doc: truncate(c.doc, 64) }));
  // Only the machine readable form lists the control plane ops, so the plain `help` a human
  // types never loads cli/control.mjs at all.
  const controlOps = ctx.json ? (await controlMod()).CONTROL_OPS : null;
  emit(ctx, 'help', { commands: Object.values(COMMANDS).map((c) => ({ name: c.name, usage: c.usage, doc: c.doc })), stateRoot: stateRoot(), controlOps }, () => [
    ST.bold('BRAIN') + ST.grey('  a persistent computational organism. Cells, circuits, regions, a dynamic connectome, generations.'),
    ST.grey('  usage: node bin/brain.mjs <command> [args] [--json] [--no-color]'),
    ST.grey('  state: ' + stateRoot() + '   (override with BRAIN_STATE_DIR)'),
    hr(78, ST),
    table([{ key: 'usage' }, { key: 'doc' }], rows, ST),
    '',
    ST.grey('Commands reach a running brain through state/<name>/control.json when one exists,'),
    ST.grey('and fall back to the snapshot when it does not. Every command supports --json.'),
  ].join('\n'));
});

// ---------------------------------------------------------------- run: the persistent process
async function cmdRun(ctx) {
  const name = need(ctx, 0, 'name');
  const L = layout(name);
  if (!brainExists(name)) throw new Error('no brain "' + name + '" at ' + L.dir + ' (run: brain init ' + name + ')');
  const { connect, startControl } = await controlMod();
  const { makeRunner } = await runMod();
  const { ops } = await opsMod();
  const already = await connect(L.dir);
  if (already) throw new Error('brain "' + name + '" is already running at ' + already.info.url + ' (pid ' + already.info.pid + '). Use: brain stop ' + name);

  const mode = ctx.opts.realtime ? 'realtime' : 'fast';
  const ticks = ctx.opts.ticks !== undefined ? intOpt(ctx.opts.ticks, Infinity) : Infinity;
  const autosave = intOpt(ctx.opts.autosave, 1000);
  const brain = await loadBrain(name, { ledger: ctx.opts.ledger === true ? 'full' : (ctx.opts.ledger || 'full') });

  let learning = null;
  if (ctx.opts.learn) {
    const mod = await loadLearning();
    const config = checkRuleNames(mod, parseLearnConfig(ctx.opts.learn));
    learning = mod.attach(brain, config);
  }

  const quiet = Boolean(ctx.opts.quiet || ctx.json);
  const precision = ctx.opts.spin || ctx.opts.precision === 'spin' ? 'spin' : 'timer';
  const runner = makeRunner(brain, {
    mode, ticks, autosave, precision,
    save: (b) => saveBrain(b, name),
    onProgress: quiet ? null : (s) => {
      out(ST.grey('[run] ') + 't=' + num(brain.clock.t) + ' done=' + num(s.done)
        + ' ' + num(s.ticksPerSec ?? 0) + '/s'
        + (mode === 'realtime' ? ST.grey(' drift last=' + s.drift.lastTicks + ' max=' + s.drift.maxTicks + ' mean=' + s.drift.meanTicks + ' ticks') : '')
        + ST.grey(' runs=' + num(brain.stats.runs) + ' saves=' + s.saves + (runner.state.paused ? ' PAUSED' : '')));
    },
  });

  let controlInfo = null;
  const env = { name, layout: L, runner, live: true };
  const control = await startControl({
    dir: L.dir, name, port: intOpt(ctx.opts.port, 0),
    handler: async (op, args) => {
      const fn = ops[op];
      if (!fn) throw new Error('unknown op ' + op);
      const payload = await fn(brain, args, env);
      return { ...payload, live: true, control: controlInfo };
    },
  });
  controlInfo = { url: control.url, pid: control.pid, port: control.port, started: control.started };

  let viz = null;
  if (ctx.opts.viz) {
    try {
      const mod = await import('../viz/server.mjs');
      viz = await mod.startViz(brain, { port: intOpt(ctx.opts['viz-port'], 0) });
      if (viz.ready && typeof viz.ready.then === 'function') await viz.ready;
    } catch (e) { if (!quiet) out(ST.yellow('viz not started: ') + String(e.message).split('\n')[0]); }
  }

  if (!quiet) {
    out(ST.bold('BRAIN ') + ST.magenta(name) + ST.grey('  mode=' + mode + (mode === 'realtime' ? '/' + precision : '') + '  ticks=' + (Number.isFinite(ticks) ? num(ticks) : 'unbounded') + '  autosave=' + (autosave || 'off')));
    out('  ' + ST.grey('control ') + ST.cyan(control.url) + ST.grey('  pid ' + control.pid));
    if (viz) out('  ' + ST.grey('viz     ') + ST.cyan(viz.url));
    out('  ' + oneLine(jsonSafe(brain.summary()), ST));
    out(ST.grey('  stop with Ctrl+C, or: brain stop ' + name));
  }

  let interrupts = 0;
  const onSignal = (sig) => {
    interrupts++;
    if (interrupts > 1) { process.exit(130); }
    if (!quiet) out(ST.yellow('\n' + sig + ': snapshotting and stopping'));
    runner.stop(sig.toLowerCase());
  };
  process.on('SIGINT', onSignal);
  process.on('SIGTERM', onSignal);
  if (process.platform === 'win32') process.on('SIGBREAK', onSignal);

  const finalState = await runner.run();
  saveBrain(brain, name);
  await control.close();
  if (viz) { try { await viz.close(); } catch { /* already closed */ } }
  process.removeListener('SIGINT', onSignal);
  process.removeListener('SIGTERM', onSignal);

  const learned = learning && typeof learning.report === 'function' ? jsonSafe(learning.report()) : null;
  if (learning && typeof learning.detach === 'function') { try { learning.detach(); } catch { /* already detached */ } }

  const p = { name, mode, stoppedBy: finalState.reason, runner: finalState, learning: learned, summary: jsonSafe(brain.summary()), snapshot: L.snapshot };
  emit(ctx, 'run', p, () => [
    hr(72, ST),
    ST.bold('stopped ') + ST.grey('(' + finalState.reason + ')  ') + num(finalState.done) + ' ticks in ' + ms(finalState.wallMs) + ST.grey('  ' + num(finalState.ticksPerSec ?? 0) + ' ticks/s, ' + finalState.saves + ' autosaves'),
    mode === 'realtime' ? ST.grey('drift: max ' + finalState.drift.maxTicks + ' ticks, mean ' + finalState.drift.meanTicks + ' ticks over ' + num(finalState.drift.samples) + ' samples') : '',
    learned ? ST.grey('learning: ' + learned.rules.join(',') + '  ' + num(learned.applied) + ' applications, ' + num(learned.appliedPerTick) + '/tick, ' + num(learned.usPerTick) + ' us/tick') : '',
    '  ' + oneLine(p.summary, ST),
    ST.grey('  snapshot ' + L.snapshot),
  ].filter(Boolean).join('\n'));
}

// ---------------------------------------------------------------- main
async function main() {
  const argv = process.argv.slice(2);
  const { opts, pos } = parseArgv(argv);
  ST = styler(colorOn(opts));
  const json = Boolean(opts.json);
  const cmdName = pos.shift();
  const ctx = { opts, pos, json, argv };

  if (opts.version) { out(JSON.parse(await (await import('node:fs/promises')).readFile(path.join(BRAIN_ROOT, 'package.json'), 'utf8')).version); return; }
  if (!cmdName || opts.help && !cmdName) { await COMMANDS.help.fn(ctx); return; }
  const cmd = COMMANDS[cmdName];
  if (!cmd) {
    const near = Object.keys(COMMANDS).filter((k) => k.startsWith(cmdName[0])).join(', ');
    throw Object.assign(new Error('unknown command "' + cmdName + '"' + (near ? ' (did you mean: ' + near + ')' : '') + '. Try: brain help'), { cmd: cmdName });
  }
  if (opts.help) { await COMMANDS.help.fn({ ...ctx, pos: [cmdName] }); return; }
  await cmd.fn(ctx);
}

main().catch((err) => {
  const cmd = process.argv[2] || 'brain';
  const message = String(err && err.message || err);
  if (process.argv.includes('--json') || process.argv.includes('-j')) out(stringify({ ok: false, cmd, error: message }));
  else process.stderr.write(ST.red('error: ') + message + '\n');
  if (process.env.BRAIN_DEBUG) process.stderr.write(String(err && err.stack) + '\n');
  process.exitCode = 1;
});
