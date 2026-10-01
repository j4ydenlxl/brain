// test/grow-cortex.test.mjs: the CORTEX-POINTER RULE (grow/cortex.mjs) against stub roots. Every test builds a temporary
// root holding only what the rule reads: grown/cortex.json (the ledger), grown/generations.json (the recorded
// tournaments), work/grow/gen-<n>/plan.json shaped like prepare's (two lanes, the parent with two arms per class, ids from
// grow/generation.mjs armId) and the verdict.json files the locked judge would write. The CLI runs as a child with
// --root <tmp>, the verbs also in process through main(); nothing here reaches the real grown/ or work/. Roots are removed
// in process.on('exit'), so a failing test leaves nothing behind.
// Author: Day 3 board, cortex-pointer builder, 2026-10-01.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { main, Fail, aliasOf, neverWhy, wellFormed, readLedger, recordedOf, DEFAULT_POINTER, MIN_PAIRS, KNOWN, LEDGER, SENSE_BY, USAGE } from '../grow/cortex.mjs';
import { armId } from '../grow/generation.mjs';

const BRAIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = path.join(BRAIN, 'grow', 'cortex.mjs');
const NEW = 'claude-nova-1', NEW2 = 'claude-nova-2';
const CLASSES = ['math', 'data', 'code', 'tools'];
const roots = [];
process.on('exit', () => { for (const r of roots) fs.rmSync(r, { recursive: true, force: true }); });
const mkroot = () => { const r = fs.mkdtempSync(path.join(os.tmpdir(), 'brain-cortex-')); roots.push(r); return r; };
const put = (root, rel, text) => { const f = path.join(root, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); return f; };
const putJson = (root, rel, o) => put(root, rel, JSON.stringify(o, null, 2) + '\n');
const ledgerText = (root) => { try { return fs.readFileSync(path.join(root, LEDGER), 'utf8'); } catch { return null; } };
const ledger = (root) => JSON.parse(ledgerText(root));
const childEnv = () => { const e = { ...process.env }; delete e.NODE_TEST_CONTEXT; delete e.NODE_OPTIONS; return e; };
/** The CLI as a child: exit code, stdout lines, stderr lines, and the one JSON line when there is exactly one. */
function cli(root, ...args) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args, ...(root ? ['--root', root] : [])], { encoding: 'utf8', env: childEnv(), windowsHide: true, timeout: 60000 });
  const out = String(r.stdout || '').split(/\r?\n/).filter(Boolean), err = String(r.stderr || '').split(/\r?\n/).filter(Boolean);
  return { code: r.status, out, err, json: out.length === 1 && out[0].startsWith('{') ? JSON.parse(out[0]) : null };
}
const run = (root, ...args) => main([...args, '--root', root]);
const refuses = (p, code, re) => assert.rejects(p, (e) => e instanceof Fail && e.code === code && re.test(e.message));
/** grown/generations.json recording these generation numbers. */
const record = (root, gens) => putJson(root, 'grown/generations.json', { generations: gens.map((g) => ({ generation: g, at: '2026-10-01T00:00:00.000Z', lanes: { direct: { candidates: 8, survivors: 4 }, baked: { candidates: 4, survivors: 2 } }, parent: 'direct', misses: [] })) });
/** work/grow/gen-<n>/plan.json the way prepare writes it: every lane one arm per class, the parent lane two (the second id ends -2). */
function writePlan(root, n, { classes = CLASSES, lanes = ['direct', 'baked'], parent = 'direct' } = {}) {
  const cls = classes.map((c) => {
    const arms = [];
    for (const lane of lanes) for (let i = 1; i <= (lane === parent ? 2 : 1); i++) {
      const id = armId(c, lane, n, i);
      arms.push({ lane, dir: 'work/grow/gen-' + n + '/' + lane + '/' + id, id, brief: 'work/grow/gen-' + n + '/' + lane + '/brief-' + c + (i > 1 ? '-' + i : '') + '.md' });
    }
    return { class: c, misses: ['seed-' + c], prompts: ['a ' + c + ' prompt'], dreams: 0, dev: 'judge/dev/' + c + '.jsonl', devRows: 3, baseline: { score: 0.5, n: 10 }, arms };
  });
  putJson(root, 'work/grow/gen-' + n + '/plan.json', { generation: n, at: '2026-10-01T00:00:00.000Z', lanes, parent, missSource: 'seed', classes: cls, builds: [], blocked: [] });
  return cls;
}
const verdict = (root, n, lane, id, survived, score) => putJson(root, 'work/grow/gen-' + n + '/' + lane + '/' + id + '/verdict.json', { candidate: id, id, class: 'stub', survived, why: survived ? [] : ['held-out score under the baseline'], lockOk: true, heldout: { n: 10, ok: Math.round(score * 10), score } });
/** A trial of NEW at generation n: plan.json, the challenger, plan, then one row [incSurvived, incScore, chSurvived, chScore] per pair (null: no verdicts). */
async function trial(root, n, rows, { classes = CLASSES, recorded = true, register = true } = {}) {
  writePlan(root, n, { classes });
  if (register) await run(root, 'challenge', NEW, '--by', 'test session, under the test order');
  const cj = await run(root, 'plan', '--gen', String(n));
  cj.pairs.forEach((p, i) => {
    const r = rows[i];
    if (!r) return;
    if (r[0] !== null) verdict(root, n, p.lane, p.incumbent, r[0], r[1]);
    if (r[2] !== null) verdict(root, n, p.lane, p.challenger, r[2], r[3]);
  });
  if (recorded) record(root, Array.from({ length: n }, (_, i) => i + 1));
  return cj;
}
const four = (row) => [row, row, row, row];

test('aliasOf: the family word after claude- when it is opus, sonnet, fable or haiku; else null', () => {
  assert.equal(aliasOf('claude-opus-5-5'), 'opus');
  assert.equal(aliasOf('claude-fable-5-1'), 'fable');
  assert.equal(aliasOf('claude-sonnet-5-5'), 'sonnet');
  assert.equal(aliasOf('claude-haiku-4-5-20251001'), 'haiku');
  assert.equal(aliasOf('claude-opus-6'), 'opus');
  assert.equal(aliasOf(NEW), null);
  assert.equal(aliasOf('claude-opus.6'), null);
  assert.equal(aliasOf('gpt-5'), null);
  assert.equal(aliasOf('Claude-Opus-6'), null);
  assert.equal(aliasOf(undefined), null);
});

test('the rule: well-formed ids, NEVER (Opus 5, any Haiku) and the KNOWN list', () => {
  for (const ok of ['claude-opus-5-5', 'claude-x', 'claude-opus-6-20270101', 'claude-' + 'a'.repeat(63)]) assert.ok(wellFormed(ok), ok);
  for (const bad of ['claude-', 'claude-Opus-6', 'claude--x', 'claude-' + 'a'.repeat(64), 'gpt-5', 'claude-opus 6', 'claude-opus/6', '']) assert.ok(!wellFormed(bad), bad);
  for (const never of ['claude-opus-5', 'claude-opus-5-20260101', 'claude-haiku-4-5-20251001', 'claude-haiku-9', 'claude-x-HAIKU']) assert.ok(neverWhy(never), never);
  for (const fine of ['claude-opus-5-5', 'claude-opus-5-1', 'claude-opus-50', 'claude-opus-5-2026010', 'claude-fable-5-1', NEW]) assert.equal(neverWhy(fine), null, fine);
  assert.deepEqual([...KNOWN], ['claude-opus-5-5', 'claude-fable-5-1', 'claude-sonnet-5-5', 'claude-haiku-4-5-20251001']);
  assert.equal(DEFAULT_POINTER, 'claude-opus-5-5');
  assert.equal(MIN_PAIRS, 4);
});

test('status with no ledger: the default pointer, no challenger, nothing tried, no file written (CLI)', () => {
  const root = mkroot();
  const r = cli(root, 'status');
  assert.equal(r.code, 0, r.err.join('\n'));
  assert.equal(r.out.length, 1);
  assert.equal(r.json.pointer, 'claude-opus-5-5');
  assert.equal(r.json.alias, 'opus');
  assert.equal(r.json.since, null);
  assert.equal(r.json.challenger, null);
  assert.deepEqual(r.json.tried, []);
  assert.match(r.json.at, /^\d{4}-\d\d-\d\dT/);
  assert.equal(ledgerText(root), null);
});

test('challenge registers a challenger (a KNOWN model is allowed here), the ledger is pretty JSON, status shows it (CLI)', () => {
  const root = mkroot();
  const r = cli(root, 'challenge', 'claude-sonnet-5-5', '--by', 'jayden, under his Day 3 order');
  assert.equal(r.code, 0, r.err.join('\n'));
  assert.equal(r.json.registered, 'claude-sonnet-5-5');
  assert.equal(r.json.alias, 'sonnet');
  assert.equal(r.json.pointer, 'claude-opus-5-5');
  const text = ledgerText(root);
  assert.ok(text.endsWith('}\n') && text.includes('\n  "pointer": "claude-opus-5-5"'), 'pretty JSON with a trailing newline');
  const l = JSON.parse(text);
  assert.deepEqual(Object.keys(l), ['pointer', 'since', 'challenger', 'history']);
  assert.equal(l.challenger.model, 'claude-sonnet-5-5');
  assert.equal(l.challenger.by, 'jayden, under his Day 3 order');
  assert.equal(l.since, null);
  const s = cli(root, 'status');
  assert.equal(s.json.challenger.model, 'claude-sonnet-5-5');
  assert.equal(s.json.challenger.by, 'jayden, under his Day 3 order');
});

test('challenge refusals: each one stderr line, a non-zero exit, nothing on stdout, the ledger untouched (CLI)', () => {
  const root = mkroot();
  // a held trial of claude-nova-3 at generation 2, recorded generations 1 and 2: it waits
  putJson(root, LEDGER, { pointer: 'claude-opus-5-5', since: null, challenger: null, history: [{ generation: 2, incumbent: 'claude-opus-5-5', challenger: 'claude-nova-3', pairs: 4, incumbentScore: 2, challengerScore: 1, incumbentSurvivors: 2, challengerSurvivors: 1, verdict: 'held', at: '2026-10-01T00:00:00.000Z' }] });
  record(root, [1, 2]);
  const cases = [
    [['challenge', NEW], 2, /needs --by/],
    [['challenge', '--by', 'jayden'], 2, /needs a model id/],
    [['challenge', NEW, '--by', ' '], 2, /needs --by/],
    [['challenge', NEW, '--by', 'x'.repeat(301)], 2, /over 300/],
    [['challenge', NEW, '--by', 'jayden sk-' + 'A'.repeat(24)], 2, /secret-shaped/],
    [['challenge', 'gpt-5', '--by', 'jayden'], 1, /not a model id/],
    [['challenge', 'Claude-Opus-6', '--by', 'jayden'], 1, /not a model id/],
    [['challenge', 'claude-opus-5', '--by', 'jayden'], 1, /never a challenger: Opus 5/],
    [['challenge', 'claude-opus-5-20260101', '--by', 'jayden'], 1, /never a challenger: Opus 5/],
    [['challenge', 'claude-haiku-4-5-20251001', '--by', 'jayden'], 1, /never a challenger: Haiku/],
    [['challenge', 'claude-opus-5-5', '--by', 'jayden'], 1, /is the pointer already/],
    [['challenge', 'claude-nova-3', '--by', 'jayden'], 1, /was held at generation 2 \(it lost\); it waits/],
  ];
  const before = ledgerText(root);
  for (const [args, code, re] of cases) {
    const r = cli(root, ...args);
    assert.equal(r.code, code, args.join(' ') + ': ' + r.err.join(' | '));
    assert.equal(r.err.length, 1, args.join(' '));
    assert.match(r.err[0], re, args.join(' '));
    assert.equal(r.out.length, 0, args.join(' '));
    assert.equal(ledgerText(root), before, args.join(' ') + ' left the ledger as it was');
  }
  assert.ok(!cli(root, 'challenge', 'jayden sk-' + 'A'.repeat(24), '--by', 'j').err[0].includes('AAAAAAAAAAAAAAAAAAAAAAAA'), 'a secret-shaped id is never echoed');
  // a pending challenger refuses a second one
  assert.equal(cli(root, 'challenge', NEW, '--by', 'jayden').code, 0);
  const pend = cli(root, 'challenge', NEW2, '--by', 'jayden');
  assert.equal(pend.code, 1);
  assert.equal(pend.err.length, 1);
  assert.match(pend.err[0], /a challenger is pending \(claude-nova-1, by jayden\)/);
  assert.equal(ledger(root).challenger.model, NEW);
});

test('challenge after a hold: the model waits while that generation is among the last 3 recorded', async () => {
  const root = mkroot();
  putJson(root, LEDGER, { pointer: 'claude-opus-5-5', since: null, challenger: null, history: [{ generation: 2, incumbent: 'claude-opus-5-5', challenger: NEW, verdict: 'held' }] });
  for (const gens of [[1, 2], [1, 2, 3], [1, 2, 3, 4]]) {
    record(root, gens);
    await refuses(run(root, 'challenge', NEW, '--by', 'jayden'), 1, /held at generation 2/);
  }
  record(root, [1, 2, 3, 4, 5]);
  const r = await run(root, 'challenge', NEW, '--by', 'jayden');
  assert.equal(r.registered, NEW);
  assert.deepEqual(recordedOf(root), [1, 2, 3, 4, 5]);
});

test('challenge: a model that moved once and was displaced since may challenge again; its last verdict is not held', async () => {
  const root = mkroot();
  putJson(root, LEDGER, { pointer: NEW2, since: 3, challenger: null, history: [{ generation: 2, incumbent: 'claude-opus-5-5', challenger: NEW, verdict: 'moved' }, { generation: 3, incumbent: NEW, challenger: NEW2, verdict: 'moved' }] });
  record(root, [1, 2, 3]);
  assert.equal((await run(root, 'challenge', NEW, '--by', 'jayden')).registered, NEW);
});

test('sense registers the first model the rule had not seen, refusing KNOWN, NEVER, tried and malformed ids (CLI)', () => {
  const root = mkroot();
  putJson(root, LEDGER, { pointer: 'claude-opus-5-5', since: null, challenger: null, history: [{ generation: 1, incumbent: 'claude-opus-5-5', challenger: 'claude-nova-0', verdict: 'held' }] });
  const models = ['claude-fable-5-1', 'claude-sonnet-5-5', 'claude-opus-5', 'claude-haiku-9', 'claude-nova-0', 'not-a-model', NEW, NEW2].join(',');
  const r = cli(root, 'sense', '--self', 'claude-opus-5-5', '--models', models);
  assert.equal(r.code, 0, r.err.join('\n'));
  assert.equal(r.json.registered, NEW);
  assert.equal(r.json.self, 'claude-opus-5-5');
  assert.equal(r.json.selfIsPointer, true);
  assert.equal(r.json.pointer, 'claude-opus-5-5');
  assert.equal(r.json.challenger.model, NEW);
  assert.equal(r.json.challenger.by, SENSE_BY);
  const why = Object.fromEntries(r.json.refused.map((x) => [x.model, x.why]));
  assert.deepEqual(Object.keys(why), ['claude-opus-5-5', 'claude-fable-5-1', 'claude-sonnet-5-5', 'claude-opus-5', 'claude-haiku-9', 'claude-nova-0', 'not-a-model', NEW2]);
  assert.equal(why['claude-opus-5-5'], 'the pointer');
  assert.match(why['claude-fable-5-1'], /^known/);
  assert.match(why['claude-sonnet-5-5'], /^known/);
  assert.match(why['claude-opus-5'], /never a challenger: Opus 5/);
  assert.match(why['claude-haiku-9'], /never a challenger: Haiku/);
  assert.match(why['claude-nova-0'], /^tried/);
  assert.match(why['not-a-model'], /^not a model id/);
  assert.equal(why[NEW2], 'a challenger is pending (' + NEW + ')');
  const l = ledger(root);
  assert.equal(l.challenger.model, NEW);
  assert.equal(l.challenger.by, 'sense: a model the rule had not seen');
  assert.equal(l.history.length, 1);
});

test('sense with nothing new: no side effect (no ledger created, an existing one untouched)', async () => {
  const root = mkroot();
  const r = await run(root, 'sense', '--self', 'claude-opus-5-5', '--models', 'claude-fable-5-1,claude-haiku-4-5-20251001,claude-opus-5');
  assert.equal(r.registered, null);
  assert.equal(r.challenger, null);
  assert.equal(r.refused.length, 4);
  assert.equal(ledgerText(root), null);
  putJson(root, LEDGER, { pointer: 'claude-opus-5-5', since: null, challenger: null, history: [{ generation: 1, incumbent: 'claude-opus-5-5', challenger: NEW, verdict: 'held' }] });
  const before = ledgerText(root);
  const t = await run(root, 'sense', '--models', NEW + ',claude-sonnet-5-5');
  assert.equal(t.registered, null);
  assert.equal(t.self, null);
  assert.equal(t.selfIsPointer, false);
  assert.equal(ledgerText(root), before);
});

test('sense with a challenger pending registers nothing; the session own new model registers when none is', async () => {
  const root = mkroot();
  await run(root, 'challenge', 'claude-fable-5-1', '--by', 'jayden');
  const before = ledgerText(root);
  const r = await run(root, 'sense', '--self', NEW, '--models', 'claude-fable-5-1');
  assert.equal(r.registered, null);
  assert.deepEqual(r.refused, [{ model: NEW, why: 'a challenger is pending (claude-fable-5-1)' }, { model: 'claude-fable-5-1', why: 'the pending challenger' }]);
  assert.equal(ledgerText(root), before);
  const fresh = mkroot();
  const s = await run(fresh, 'sense', '--self', NEW);
  assert.equal(s.registered, NEW);
  assert.equal(s.selfIsPointer, false);
  assert.deepEqual(s.refused, []);
});

test('sense needs --self or --models; a secret-shaped id is never printed', async () => {
  const root = mkroot();
  await refuses(run(root, 'sense'), 2, /sense needs --self/);
  const r = cli(root, 'sense');
  assert.equal(r.code, 2);
  assert.equal(r.err.length, 1);
  const s = await run(root, 'sense', '--self', 'ghp_' + 'a'.repeat(36));
  assert.equal(s.self, '<secret-shaped, not shown>');
  assert.equal(s.refused[0].model, '<secret-shaped, not shown>');
  assert.equal(ledgerText(root), null);
});

test('plan without a challenger: every arm of prepare\'s plan runs under the pointer, no pair (CLI)', () => {
  const root = mkroot();
  const cls = writePlan(root, 3);
  const r = cli(root, 'plan', '--gen', '3');
  assert.equal(r.code, 0, r.err.join('\n'));
  assert.equal(r.json.generation, 3);
  assert.equal(r.json.pointer, 'claude-opus-5-5');
  assert.equal(r.json.challenger, null);
  assert.deepEqual(r.json.pairs, []);
  const ids = cls.flatMap((c) => c.arms.map((a) => a.id));
  assert.equal(ids.length, 12);
  assert.deepEqual(Object.keys(r.json.arms).sort(), [...ids].sort());
  for (const id of ids) assert.deepEqual(r.json.arms[id], { model: 'claude-opus-5-5', alias: 'opus', role: 'arm' });
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'work/grow/gen-3/cortex.json'), 'utf8')), r.json);
});

test('plan with a challenger: the parent lane\'s second arm of each class runs under it, its first is the incumbent (CLI)', () => {
  const root = mkroot();
  writePlan(root, 4);
  assert.equal(cli(root, 'challenge', NEW, '--by', 'jayden').code, 0);
  const r = cli(root, 'plan', '--gen', '4');
  assert.equal(r.code, 0, r.err.join('\n'));
  assert.equal(r.json.challenger, NEW);
  assert.equal(r.json.pairs.length, 4);
  for (const c of CLASSES) {
    const first = armId(c, 'direct', 4, 1), second = armId(c, 'direct', 4, 2), other = armId(c, 'baked', 4, 1);
    assert.ok(second.endsWith('-2'));
    assert.deepEqual(r.json.pairs.find((p) => p.class === c), { class: c, lane: 'direct', incumbent: first, challenger: second });
    assert.deepEqual(r.json.arms[first], { model: 'claude-opus-5-5', alias: 'opus', role: 'incumbent' });
    assert.deepEqual(r.json.arms[second], { model: NEW, alias: null, role: 'challenger' });
    assert.deepEqual(r.json.arms[other], { model: 'claude-opus-5-5', alias: 'opus', role: 'arm' });
  }
  assert.equal(Object.keys(r.json.arms).length, 12, 'no extra arm: the trial is the second arm prepare already planned');
  // a plan with no parent lane (the first generation) gives no pair even with a challenger pending
  writePlan(root, 5, { parent: null });
  const p = cli(root, 'plan', '--gen', '5');
  assert.equal(p.code, 0);
  assert.deepEqual(p.json.pairs, []);
  assert.ok(Object.values(p.json.arms).every((a) => a.role === 'arm' && a.model === 'claude-opus-5-5'));
});

test('plan refuses without plan.json or with another generation\'s; plan and judge need --gen (CLI)', () => {
  const root = mkroot();
  const r = cli(root, 'plan', '--gen', '7');
  assert.notEqual(r.code, 0);
  assert.equal(r.err.length, 1);
  assert.match(r.err[0], /no plan\.json at work\/grow\/gen-7\/plan\.json/);
  assert.equal(fs.existsSync(path.join(root, 'work/grow/gen-7/cortex.json')), false);
  writePlan(root, 6);
  fs.renameSync(path.join(root, 'work/grow/gen-6'), path.join(root, 'work/grow/gen-8'));
  const w = cli(root, 'plan', '--gen', '8');
  assert.equal(w.code, 1);
  assert.match(w.err[0], /is generation 6, not 8/);
  for (const verb of ['plan', 'judge']) {
    const g = cli(root, verb);
    assert.equal(g.code, 2, verb);
    assert.match(g.err[0], /needs --gen/);
    assert.equal(cli(root, verb, '--gen', '0').code, 2);
  }
});

test('judge moved: a higher held-out sum over 4 pairs, survivors not fewer; the pointer moves, since n, one history entry (CLI)', async () => {
  const root = mkroot();
  await trial(root, 3, four([true, 0.5, true, 0.6]));
  const r = cli(root, 'judge', '--gen', '3');
  assert.equal(r.code, 0, r.err.join('\n'));
  assert.equal(r.out.length, 1);
  const j = r.json;
  assert.equal(j.verdict, 'moved');
  assert.equal(j.pointer, NEW);
  assert.equal(j.challenger, NEW);
  assert.equal(j.pairs, 4);
  assert.equal(j.incumbentScore, 2);
  assert.equal(j.challengerScore, 2.4);
  assert.equal(j.incumbentSurvivors, 4);
  assert.equal(j.challengerSurvivors, 4);
  assert.match(j.reason, /the pointer moves to claude-nova-1/);
  assert.deepEqual(Object.keys(j), ['verdict', 'pointer', 'challenger', 'pairs', 'incumbentScore', 'challengerScore', 'incumbentSurvivors', 'challengerSurvivors', 'reason', 'at']);
  const text = ledgerText(root);
  assert.ok(text.endsWith('}\n'));
  const l = JSON.parse(text);
  assert.equal(l.pointer, NEW);
  assert.equal(l.since, 3);
  assert.equal(l.challenger, null);
  assert.equal(l.history.length, 1);
  assert.deepEqual(l.history[0], { generation: 3, incumbent: 'claude-opus-5-5', challenger: NEW, pairs: 4, incumbentScore: 2, challengerScore: 2.4, incumbentSurvivors: 4, challengerSurvivors: 4, verdict: 'moved', at: j.at });
  const s = await run(root, 'status');
  assert.equal(s.pointer, NEW);
  assert.equal(s.alias, null);
  assert.equal(s.since, 3);
  assert.deepEqual(s.tried, ['claude-opus-5-5', NEW]);
  // the next plan runs every arm under the new pointer
  writePlan(root, 4);
  const p = await run(root, 'plan', '--gen', '4');
  assert.ok(Object.values(p.arms).every((a) => a.model === NEW && a.role === 'arm'));
});

test('judge held on a tie, on a lower score, and on a higher score with fewer survivors; the pointer stays', async () => {
  const cases = [
    ['tie', four([true, 0.5, true, 0.5]), /a tie holds/, 2, 2, 4, 4],
    ['lower', four([true, 0.5, true, 0.4]), /a lower score holds/, 2, 1.6, 4, 4],
    ['fewer', [[true, 0.5, false, 0.9], [true, 0.5, true, 0.6], [true, 0.5, true, 0.6], [true, 0.5, true, 0.6]], /fewer survivors hold/, 2, 2.7, 4, 3],
  ];
  for (const [name, rows, re, is, cs, iv, cv] of cases) {
    const root = mkroot();
    await trial(root, 3, rows);
    const j = await run(root, 'judge', '--gen', '3');
    assert.equal(j.verdict, 'held', name);
    assert.equal(j.pointer, 'claude-opus-5-5', name);
    assert.match(j.reason, re, name);
    assert.deepEqual([j.incumbentScore, j.challengerScore, j.incumbentSurvivors, j.challengerSurvivors, j.pairs], [is, cs, iv, cv, 4], name);
    const l = ledger(root);
    assert.equal(l.pointer, 'claude-opus-5-5', name);
    assert.equal(l.since, null, name);
    assert.equal(l.challenger, null, name);
    assert.equal(l.history.length, 1, name);
    assert.equal(l.history[0].verdict, 'held', name);
    assert.equal(l.history[0].challengerSurvivors, cv, name);
  }
});

test('judge pending under MIN_PAIRS: three classes, or four with one verdict missing or unparsable; the challenger stays', async () => {
  const three = mkroot();
  await trial(three, 3, four([true, 0.5, true, 0.9]), { classes: ['math', 'data', 'code'] });
  let before = ledgerText(three);
  let j = await run(three, 'judge', '--gen', '3');
  assert.equal(j.verdict, 'pending');
  assert.equal(j.pairs, 3);
  assert.match(j.reason, /3 of 3 pairs have both verdicts, under 4/);
  assert.equal(j.challenger, NEW);
  assert.equal(ledgerText(three), before);
  const missing = mkroot();
  await trial(missing, 3, [[true, 0.5, true, 0.9], [true, 0.5, null, 0], [true, 0.5, true, 0.9], [true, 0.5, true, 0.9]]);
  j = await run(missing, 'judge', '--gen', '3');
  assert.equal(j.verdict, 'pending');
  assert.equal(j.pairs, 3);
  assert.match(j.reason, /3 of 4 pairs/);
  const broken = mkroot();
  const cj = await trial(broken, 3, four([true, 0.5, true, 0.9]));
  put(broken, 'work/grow/gen-3/' + cj.pairs[0].lane + '/' + cj.pairs[0].incumbent + '/verdict.json', '{ not json');
  before = ledgerText(broken);
  j = await run(broken, 'judge', '--gen', '3');
  assert.equal(j.verdict, 'pending');
  assert.equal(j.pairs, 3);
  assert.equal(ledgerText(broken), before);
  assert.equal(ledger(broken).challenger.model, NEW);
});

test('judge pending when the generation is not recorded in grown/generations.json', async () => {
  const root = mkroot();
  await trial(root, 3, four([true, 0.5, true, 0.9]), { recorded: false });
  record(root, [1, 2]);
  const before = ledgerText(root);
  const j = await run(root, 'judge', '--gen', '3');
  assert.equal(j.verdict, 'pending');
  assert.equal(j.pairs, 4);
  assert.match(j.reason, /generation 3 is not recorded in grown\/generations\.json/);
  assert.equal(ledgerText(root), before);
});

test('a pending trial carries to the next generation, which moves the pointer', async () => {
  const root = mkroot();
  await trial(root, 3, four([true, 0.5, true, 0.9]), { classes: ['math', 'data'] });
  assert.equal((await run(root, 'judge', '--gen', '3')).verdict, 'pending');
  await trial(root, 4, four([false, 0.2, false, 0.3]), { register: false });
  const j = await run(root, 'judge', '--gen', '4');
  assert.equal(j.verdict, 'moved');
  assert.equal(j.challengerSurvivors, 0);
  const l = ledger(root);
  assert.equal(l.pointer, NEW);
  assert.equal(l.since, 4);
  assert.deepEqual(l.history.map((h) => [h.generation, h.verdict]), [[4, 'moved']]);
});

test('judge none: no challenger; no cortex.json; one naming another challenger; one with no pair or only unsafe pairs (CLI)', async () => {
  const empty = mkroot();
  record(empty, [1, 2, 3]);
  const r = cli(empty, 'judge', '--gen', '3');
  assert.equal(r.code, 0, r.err.join('\n'));
  assert.equal(r.json.verdict, 'none');
  assert.equal(r.json.pointer, 'claude-opus-5-5');
  assert.equal(ledgerText(empty), null, 'none writes nothing');
  const noPlan = mkroot();
  record(noPlan, [1, 2, 3]);
  await run(noPlan, 'challenge', NEW, '--by', 'jayden');
  let j = await run(noPlan, 'judge', '--gen', '3');
  assert.equal(j.verdict, 'none');
  assert.equal(j.challenger, NEW);
  assert.equal(ledger(noPlan).challenger.model, NEW, 'the challenger stays for a generation that plans it');
  const other = mkroot();
  const cj = await trial(other, 3, four([true, 0.5, true, 0.9]));
  putJson(other, 'work/grow/gen-3/cortex.json', { ...cj, challenger: NEW2 });
  j = await run(other, 'judge', '--gen', '3');
  assert.equal(j.verdict, 'none');
  assert.match(j.reason, /does not name claude-nova-1/);
  putJson(other, 'work/grow/gen-3/cortex.json', { ...cj, pointer: 'claude-fable-5-1' });
  j = await run(other, 'judge', '--gen', '3');
  assert.equal(j.verdict, 'none');
  assert.match(j.reason, /planned under claude-fable-5-1, not the pointer claude-opus-5-5/);
  putJson(other, 'work/grow/gen-3/cortex.json', { ...cj, pairs: cj.pairs.map((p) => ({ ...p, lane: '..' })) });
  assert.equal((await run(other, 'judge', '--gen', '3')).verdict, 'none');
  putJson(other, 'work/grow/gen-3/cortex.json', { ...cj, pairs: cj.pairs.map((p) => ({ ...p, challenger: p.incumbent })) });
  assert.equal((await run(other, 'judge', '--gen', '3')).verdict, 'none');
  putJson(other, 'work/grow/gen-3/cortex.json', { ...cj, pairs: [...cj.pairs, { class: 'x', lane: '..', incumbent: 'a', challenger: 'a-2' }, cj.pairs[0]] });
  j = await run(other, 'judge', '--gen', '3');
  assert.equal(j.verdict, 'moved');
  assert.equal(j.pairs, 4, 'an unsafe pair and a repeated pair are never counted');
});

test('judging the same generation twice is idempotent: the second call finds no challenger (CLI)', async () => {
  for (const rows of [four([true, 0.5, true, 0.9]), four([true, 0.5, true, 0.5])]) {
    const root = mkroot();
    await trial(root, 3, rows);
    const first = cli(root, 'judge', '--gen', '3');
    assert.ok(['moved', 'held'].includes(first.json.verdict));
    const after = ledgerText(root);
    const second = cli(root, 'judge', '--gen', '3');
    assert.equal(second.code, 0);
    assert.equal(second.json.verdict, 'none');
    assert.equal(second.json.pointer, first.json.pointer);
    assert.equal(ledgerText(root), after);
    assert.equal(ledger(root).history.length, 1);
  }
  // a later re-registration of the same model is never judged on that generation's old pairs again
  const root = mkroot();
  await trial(root, 3, four([true, 0.5, true, 0.4]));
  assert.equal((await run(root, 'judge', '--gen', '3')).verdict, 'held');
  record(root, [1, 2, 3, 4, 5, 6]);
  await run(root, 'challenge', NEW, '--by', 'jayden, a second try');
  const cj = JSON.parse(fs.readFileSync(path.join(root, 'work/grow/gen-3/cortex.json'), 'utf8'));
  assert.equal(cj.challenger, NEW);
  const j = await run(root, 'judge', '--gen', '3');
  assert.equal(j.verdict, 'none');
  assert.match(j.reason, /already judged/);
});

test('a ledger the rule cannot accept stops every verb with one stderr line; extra fields survive a write', async () => {
  const root = mkroot();
  putJson(root, LEDGER, { pointer: 'claude-opus-5', since: null, challenger: null, history: [] });
  const r = cli(root, 'status');
  assert.equal(r.code, 1);
  assert.equal(r.err.length, 1);
  assert.match(r.err[0], /the pointer "claude-opus-5" is not a model the rule accepts/);
  put(root, LEDGER, 'not json');
  assert.equal(cli(root, 'status').code, 1);
  putJson(root, LEDGER, { pointer: 'claude-opus-5-5', since: null, challenger: { model: 'claude-haiku-9' }, history: [] });
  await refuses(run(root, 'judge', '--gen', '1'), 1, /the challenger is not a model the rule accepts/);
  putJson(root, LEDGER, { pointer: 'claude-opus-5-5', since: null, challenger: null, history: [], note: 'by hand' });
  await run(root, 'challenge', NEW, '--by', 'jayden');
  assert.equal(ledger(root).note, 'by hand');
  assert.equal(readLedger(root).challenger.model, NEW);
});

test('--help prints the usage; an unknown verb or flag exits 2 (CLI)', () => {
  const h = cli(null, '--help');
  assert.equal(h.code, 0);
  assert.equal(h.out.join('\n'), USAGE);
  const root = mkroot();
  const v = cli(root, 'move');
  assert.equal(v.code, 2);
  assert.match(v.err[0], /unknown verb move/);
  const f = cli(root, 'status', '--force');
  assert.equal(f.code, 2);
  assert.match(f.err[0], /unknown flag --force/);
});
