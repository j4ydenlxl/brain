// test/grow-generation.test.mjs: the generation driver (grow/generation.mjs) against a stub tree.
// Every test builds a temporary root: copies of grow/contract.mjs, grow/misses.mjs and act/converse.mjs (the real
// miss reader and its classes), a fake seed, stubs for judge/verify.mjs, judge/baseline.mjs, judge/select.mjs,
// grow/sandbox.mjs, grow/store.mjs, web/build.mjs and tools/fetch-pack.mjs that log each call to calls.log, dev and
// held-out files with SENTINEL prompts, and five trivial suites. The driver runs with --root <tmp>, so nothing here
// reaches the network, a token, the real store, the real grown/ or git (finish runs with --no-commit or stops first).
// Author: board 38 builder, item driver, 2026-09-30.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  backendOf, tokensOf, nextGeneration, rankLanes, armId, classOfSource, candidates, CLASS_SRC_RE, TOKEN_NAMES, CLOUD_ENV,
  parseArgs, commitMessage, SUITES, why1,
} from '../grow/generation.mjs';

const BRAIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DRIVER = path.join(BRAIN, 'grow', 'generation.mjs');
const DIRECTIVE = '[SYSTEM DIRECTIVE: CONCISE MODE ENFORCED]';
const DEV = {
  fragment: [{ q: 'DEVQ-frag-one', expect: { minWords: 6, notRefusal: true } }, { q: 'DEVQ-frag-two', expect: { contains: ['"'] } }],
  mash: [{ q: 'DEVQ-mash-one', expect: { minWords: 6 } }, { q: 'DEVQ-mash-two', expect: { notRefusal: true } }],
};
const HELDOUT = { fragment: ['HELDOUT-SENTINEL-frag-1', 'HELDOUT-SENTINEL-frag-2'], mash: ['HELDOUT-SENTINEL-mash-1'] };
const CONTROL = 'CONTROL-SENTINEL-1';
const SEED_ROWS = [
  { id: 1, at: '2026-09-30T20:00:00Z', prompt: 'h', reply: 'I do not carry that yet', status: 'open' },
  { id: 'seed-2', at: '2026-09-30T20:00:00Z', prompt: 'jgkafsjka', reply: 'nothing in memory matches', status: 'open' },
  { id: 3, at: '2026-09-30T20:00:00Z', prompt: 'tell me something nice today', reply: 'nothing in memory matches', status: 'open' },
  { id: 4, at: '2026-09-30T20:00:00Z', prompt: 'the capital of Peru', reply: 'nothing in memory matches', status: 'open' },
];

const PRELUDE = `import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const log = (name) => fs.appendFileSync(path.join(ROOT, 'calls.log'), JSON.stringify([name, ...process.argv.slice(2)]) + '\\n');
`;
const STUBS = {
  'judge/verify.mjs': `log('verify');
if (fs.existsSync(path.join(ROOT, 'drift.flag'))) { console.log('LOCK DRIFT judge/select.mjs'); process.exit(1); }
console.log('LOCK OK 10 files');`,
  'judge/baseline.mjs': `export const PACK = path.join(ROOT, 'no-pack-here');
export async function runOrganism(rows) { const a = (process.env.STUB_ANSWERS || '').split('|'); return { rows: rows.map((r) => ({ q: r.q, got: a.includes(r.q) ? 'stub organism: ' + r.q : 'nothing in memory matches ' + r.q, route: 'stub-route', via: a.includes(r.q) ? (process.env.STUB_VIA || 'ask') : 'ask' })), grown: 0 }; }
const self = fileURLToPath(import.meta.url).toLowerCase();
if (process.argv[1] && path.resolve(process.argv[1]).toLowerCase() === self) {
  log('baseline');
  if (process.env.STUB_BASELINE_FAIL === process.argv[2]) { console.error('baseline failed: stub'); process.exit(1); }
  console.log(JSON.stringify({ class: process.argv[2], n: 3, ok: 0, score: Number(process.env.STUB_BASELINE_SCORE || 0) }));
}`,
  'judge/select.mjs': `log('select');
const dir = path.resolve(ROOT, process.argv[2]);
const canned = JSON.parse(fs.readFileSync(path.join(ROOT, 'canned.json'), 'utf8'));
const survived = canned.survive.includes(path.basename(dir));
fs.writeFileSync(path.join(dir, 'verdict.json'), JSON.stringify({ survived }));
console.log(JSON.stringify({ survived }));`,
  'grow/sandbox.mjs': `log('sandbox');
const a = process.argv.slice(2), f = process.env.STUB_SANDBOX_FAIL;
if (f && (f === '*' || path.basename(a[1]) === f)) { console.error('sandbox refused: stub exit 3'); process.exit(3); }
if (a.includes('--app')) {
  const slug = path.basename(path.resolve(ROOT, a[1])), bad = process.env.STUB_APP_FAIL === slug;
  fs.writeFileSync(path.resolve(ROOT, a[a.indexOf('--out') + 1]), JSON.stringify({ candidate: a[1], kind: 'app', slug, backend: 'vercel', validate: { ok: true, errors: [] }, tests: { passed: bad ? 2 : 4, failed: bad ? 1 : 0, exitCode: bad ? 1 : 0 }, exitCode: 0, error: null }));
  console.log(JSON.stringify({ ok: true, kind: 'app' }));
  process.exit(0);
}
fs.writeFileSync(path.resolve(ROOT, a[a.indexOf('--out') + 1]), JSON.stringify({ rows: [] }));
console.log(JSON.stringify({ ok: true }));`,
  'grow/store.mjs': `const [verb, n, lane] = process.argv.slice(2);
log('store ' + verb);
const dir = path.resolve(ROOT, process.argv[process.argv.indexOf('--dir') + 1]);
if (verb === 'shard' && process.env.STUB_SHARD_FAIL) { console.error('unreachable: stub'); process.exit(1); }
if (verb === 'shard') { console.log(JSON.stringify({ sharded: lane })); process.exit(0); }
if (process.env.STUB_PROMOTE_FAIL) { console.error('promote failed: stub'); process.exit(1); }
const ids = fs.readdirSync(dir).filter((id) => { try { return JSON.parse(fs.readFileSync(path.join(dir, id, 'verdict.json'), 'utf8')).survived === true; } catch { return false; } });
const held = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'grown/index.json'), 'utf8')).cells.map((c) => c.id); } catch { return []; } })();
const promoted = ids.filter((id) => !held.includes(id));
console.log(JSON.stringify({ promoted, archived: ids.filter((id) => held.includes(id)).map((id) => ({ id, holds: id })), retired: [], cells: held.length + promoted.length, generation: Number(n) }));`,
  'web/build.mjs': `log('build');
if (process.env.STUB_BUILD_FAIL) { console.error('build failed: stub'); process.exit(1); }
console.log('built');`,
  'tools/fetch-pack.mjs': `log('fetch-pack');
if (process.env.STUB_PACK_FAIL) { console.error('pack fetch failed: stub'); process.exit(1); }
console.log('pack present');`,
};

const jsonl = (rows) => rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
const put = (root, rel, text) => { const f = path.join(root, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); return f; };

/** A fresh stub tree; parent names the last tournament's winner in grown/generations.json. */
function makeRoot({ parent = 'direct' } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'grow-generation-'));
  for (const rel of ['grow/contract.mjs', 'grow/misses.mjs', 'grow/probe.mjs', 'grow/probe-app.mjs', 'grow/app-slug.mjs', 'grow/build.mjs', 'act/converse.mjs', 'CLAUDE.md']) put(root, rel, fs.readFileSync(path.join(BRAIN, rel)));
  for (const [rel, body] of Object.entries(STUBS)) put(root, rel, PRELUDE + body + '\n');
  put(root, 'grow/seed-misses.jsonl', jsonl(SEED_ROWS));
  for (const [cls, rows] of Object.entries(DEV)) put(root, 'judge/dev/' + cls + '.jsonl', jsonl(rows));
  for (const [cls, qs] of Object.entries(HELDOUT)) put(root, 'judge/heldout/' + cls + '.jsonl', jsonl(qs.map((q) => ({ q, expect: { minWords: 1 } }))));
  put(root, 'judge/control.jsonl', jsonl([{ q: CONTROL }]));
  put(root, 'grown/index.json', JSON.stringify({ generation: 0, cells: [] }));
  if (parent) put(root, 'grown/generations.json', JSON.stringify({ generations: [{ generation: 0, parent, lanes: {}, misses: [] }] }));
  for (const s of SUITES) put(root, s, PRELUDE + "log('suite " + s + "');\nimport { test } from 'node:test';\ntest('stub suite', () => {" + (s.includes('judge') ? " if (process.env.STUB_SUITE_FAIL) throw new Error('stub failure');" : '') + ' });\n');
  put(root, 'canned.json', JSON.stringify({ survive: ['fragment-direct-g1'] }));
  return root;
}
/** The child environment: no token, no cloud variable, no test runner context; extra on top. */
function envOf(extra = {}) {
  const env = { ...process.env };
  for (const k of [...TOKEN_NAMES, ...CLOUD_ENV, 'NODE_TEST_CONTEXT', 'NODE_OPTIONS']) delete env[k];
  for (const k of Object.keys(env)) if (k.startsWith('STUB_')) delete env[k];
  return { ...env, ...extra };
}
function drive(root, args, extra = {}) {
  const r = spawnSync(process.execPath, [DRIVER, ...args, '--root', root], { cwd: root, env: envOf(extra), encoding: 'utf8', timeout: 180000, windowsHide: true });
  const line = String(r.stdout || '').trim().split(/\r?\n/).pop() || '';
  let json = null;
  try { json = JSON.parse(line); } catch { json = null; }
  return { code: r.status, json, stdout: r.stdout || '', stderr: r.stderr || '' };
}
const calls = (root) => { try { return fs.readFileSync(path.join(root, 'calls.log'), 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l)); } catch { return []; } };
/** Each call as one word and its object: the candidate dir, the class or the lane. */
const seq = (root) => calls(root).map((c) => (c[0] === 'sandbox' ? 'sandbox ' + c[2] : c[0] === 'select' || c[0] === 'baseline' ? c[0] + ' ' + c[1] : c[0].startsWith('store ') ? c[0] + ' ' + c[3] : c[0]));
const reset = (root) => fs.rmSync(path.join(root, 'calls.log'), { force: true });
const genMisses = (root) => fs.readFileSync(path.join(root, 'work/grow/gen-1/misses.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const D1 = 'work/grow/gen-1/direct/fragment-direct-g1', B1 = 'work/grow/gen-1/baked/mash-baked-g1';
/** prepare, the two stub candidates (fragment-direct-g1 survives by canned.json, mash-baked-g1 does not), an empty call log. */
function twoCandidates(root) {
  assert.equal(drive(root, ['prepare']).code, 0);
  candidate(root, 'direct', 'fragment-direct-g1', 'fragment');
  candidate(root, 'baked', 'mash-baked-g1', 'mash', '"');
  reset(root);
}
const count = (text, s) => text.split(s).length - 1;
const clean = (root) => fs.rmSync(root, { recursive: true, force: true });
function candidate(root, lane, id, cls, quote = "'") {
  put(root, 'work/grow/gen-1/' + lane + '/' + id + '/cell.mjs', 'export const meta = { id: ' + quote + id + quote + ', class: ' + quote + cls + quote + ', generation: 1, lane: ' + quote + lane + quote + ' };\n');
}

test('(a) status: every key, tokens are booleans by name, the lock line from judge/verify.mjs', () => {
  const root = makeRoot();
  try {
    const r = drive(root, ['status', '--gh', 'none']);
    assert.equal(r.code, 0, r.stderr);
    for (const k of ['generation', 'backend', 'why', 'tokens', 'gh', 'misses', 'lock', 'grown', 'pack', 'at']) assert.ok(k in r.json, 'missing ' + k);
    assert.deepEqual(Object.keys(r.json.tokens), [...TOKEN_NAMES]);
    for (const v of Object.values(r.json.tokens)) assert.equal(typeof v, 'boolean');
    assert.equal(r.json.lock, 'LOCK OK 10 files');
    assert.equal(r.json.backend, 'none');
    assert.equal(r.json.misses, 'seed');
    assert.equal(r.json.grown, 0);
    assert.equal(r.json.generation, 1);
    assert.equal(r.json.gh, false);
    assert.equal(r.json.pack, 'present');
    const withCi = drive(root, ['status', '--gh', 'none'], { CI: '1' });
    assert.equal(withCi.json.backend, 'here');
    // real-looking values: the line carries the NAMES as booleans, never a value
    const secrets = { VERCEL_TOKEN: 'vt-secret-value-0123456789', GITHUB_TOKEN: 'ghp_secretvalue0123456789' };
    put(root, 'grown/index.json', JSON.stringify({ generation: 1, cells: [{ id: 'a-cell' }, { id: 'b-cell' }] }));
    const t = drive(root, ['status', '--gh', 'none'], { ...secrets, STUB_PACK_FAIL: '1' });
    assert.equal(t.code, 0, t.stderr);
    assert.deepEqual(t.json.tokens, { VERCEL_TOKEN: true, VERCEL_OIDC_TOKEN: false, GITHUB_TOKEN: true, SUPABASE_SERVICE_KEY: false, SUPABASE_URL: false });
    for (const v of Object.values(t.json.tokens)) assert.ok(JSON.stringify(v).length <= 5);
    for (const s of Object.values(secrets)) assert.ok(!t.stdout.includes(s) && !t.stderr.includes(s));
    assert.equal(t.json.backend, 'vercel');
    assert.equal(t.json.grown, 2);
    assert.equal(t.json.generation, 2);
    assert.equal(t.json.pack, 'missing');
  } finally { clean(root); }
});

test('backendOf: vercel, here and none, the OIDC expiry read off the token without printing it', () => {
  assert.equal(backendOf({ VERCEL_TOKEN: 'x' }).backend, 'vercel');
  assert.equal(backendOf({ CLAUDE_CODE_REMOTE: '1' }).backend, 'here');
  assert.equal(backendOf({}).backend, 'none');
  const body = Buffer.from(JSON.stringify({ exp: 1000 })).toString('base64url');
  const tok = 'eyJhbGciOiJub25lIn0.' + body + '.sig';
  const b = backendOf({ VERCEL_OIDC_TOKEN: tok }, 2000 * 1000);
  assert.equal(b.backend, 'vercel');
  assert.match(b.why, /expired at 1970-01-01T00:16:40\.000Z/);
  assert.equal(b.expired, true);
  assert.equal(backendOf({ VERCEL_OIDC_TOKEN: tok }, 999 * 1000).expired, undefined);
  assert.ok(!b.why.includes(tok) && !b.why.includes('eyJ'));
  assert.deepEqual(tokensOf({ GITHUB_TOKEN: 'x' }), { VERCEL_TOKEN: false, VERCEL_OIDC_TOKEN: false, GITHUB_TOKEN: true, SUPABASE_SERVICE_KEY: false, SUPABASE_URL: false });
});

test('(b) prepare refuses on LOCK DRIFT and runs nothing after the lock', () => {
  const root = makeRoot();
  try {
    put(root, 'drift.flag', '1');
    const r = drive(root, ['prepare']);
    assert.equal(r.code, 1);
    assert.match(r.stderr, /^LOCK DRIFT judge\/select\.mjs/);
    assert.deepEqual(calls(root).map((c) => c[0]), ['verify']);
    assert.ok(!fs.existsSync(path.join(root, 'work/grow/gen-1/plan.json')));
  } finally { clean(root); }
});

test('(c) prepare: plan, briefs, the parent lane gets a second arm, no held-out prompt in any brief', () => {
  const root = makeRoot({ parent: 'direct' });
  try {
    const r = drive(root, ['prepare']);
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.generation, 1);
    assert.equal(r.json.classes, 2);
    assert.equal(r.json.briefs, 6);
    assert.deepEqual(r.json.misses, { read: 4, answered: 0, growing: 2, skipped: 2, source: 'seed', curriculum: 0, dreams: 0 });
    assert.deepEqual(r.json.baseline, { fragment: 0, mash: 0 });
    assert.equal(r.json.parent, 'direct');
    assert.ok(r.json.blocked.some((l) => l.startsWith('no held-out set: capital-of')));
    const plan = JSON.parse(fs.readFileSync(path.join(root, 'work/grow/gen-1/plan.json'), 'utf8'));
    assert.deepEqual(plan.classes.map((c) => c.class), ['fragment', 'mash']);
    assert.deepEqual(plan.classes[0].arms.map((a) => a.id), ['fragment-direct-g1', 'fragment-direct-g1-2', 'fragment-baked-g1']);
    assert.ok(fs.existsSync(path.join(root, 'work/grow/gen-1/direct/brief-fragment-2.md')));
    const secret = [...HELDOUT.fragment, ...HELDOUT.mash, CONTROL];
    for (const c of plan.classes) for (const a of c.arms) {
      const text = fs.readFileSync(path.join(root, a.brief), 'utf8');
      for (const row of DEV[c.class]) assert.ok(count(text, row.q) >= 1, a.brief + ' lacks ' + row.q);
      for (const s of secret) assert.equal(count(text, s), 0, a.brief + ' holds ' + s);
      assert.equal(count(text, 'state/grow/baseline'), 1);
      assert.equal(count(text, DIRECTIVE), 1);
      assert.ok(text.includes('`' + a.dir + '/`'));
      assert.ok(text.includes("id: '" + a.id + "'"));
      assert.ok(text.includes('scored 0 on 3 held-out rows'));
    }
    const baked = fs.readFileSync(path.join(root, 'work/grow/gen-1/baked/brief-mash.md'), 'utf8');
    assert.ok(baked.includes('node grow/generation.mjs ask "<q>"'));
    const gen = fs.readFileSync(path.join(root, 'work/grow/gen-1/misses.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    assert.deepEqual(gen.map((m) => m.status), ['growing', 'growing', 'open', 'open']);
    assert.equal(gen[0].generation, 1);
    assert.deepEqual(calls(root).filter((c) => c[0] === 'baseline').map((c) => c[1]), ['fragment', 'mash']);
  } finally { clean(root); }
});

test('positive control: the brief grep does see a held-out prompt once one is in the text', () => {
  const root = makeRoot();
  try {
    assert.equal(drive(root, ['prepare']).code, 0);
    const text = fs.readFileSync(path.join(root, 'work/grow/gen-1/direct/brief-fragment.md'), 'utf8');
    assert.equal(count(text + '\n' + HELDOUT.fragment[0], HELDOUT.fragment[0]), 1);
    assert.equal(count(text, 'DEVQ-frag-one'), 1); // the verbatim dev block holds it once
    assert.equal(count(text, 'HELDOUT-SENTINEL'), 0);
  } finally { clean(root); }
});

test('(d) prepare never writes the seed file: byte-identical after the run', () => {
  const root = makeRoot();
  try {
    const before = fs.readFileSync(path.join(root, 'grow/seed-misses.jsonl'));
    assert.equal(drive(root, ['prepare']).code, 0);
    assert.ok(before.equals(fs.readFileSync(path.join(root, 'grow/seed-misses.jsonl'))));
  } finally { clean(root); }
});

test('(e) finish --dry makes zero stub calls and lists what it would run', () => {
  const root = makeRoot();
  try {
    assert.equal(drive(root, ['prepare']).code, 0);
    candidate(root, 'direct', 'fragment-direct-g1', 'fragment');
    const n = calls(root).length;
    const r = drive(root, ['finish', '--gen', '1', '--dry'], { CI: '1' });
    assert.equal(r.code, 0, r.stderr);
    assert.equal(calls(root).length, n);
    assert.equal(r.json.dry, true);
    assert.equal(r.json.candidates.length, 1);
    assert.deepEqual(r.json.candidates[0], { dir: D1, lane: 'direct', id: 'fragment-direct-g1', class: 'fragment', classFrom: 'cell.mjs' });
    assert.equal(r.json.would[0], 'node judge/baseline.mjs fragment');
    assert.equal(r.json.would[2], 'node judge/select.mjs ' + D1);
    assert.ok(r.json.would.includes('node judge/select.mjs work/grow/gen-1/direct/fragment-direct-g1'));
    assert.ok(r.json.would.some((w) => w.startsWith('node grow/sandbox.mjs run work/grow/gen-1/direct/fragment-direct-g1 --heldout judge/heldout/fragment.jsonl') && w.endsWith('--backend here')));
    assert.ok(r.json.would.includes('git push'));
  } finally { clean(root); }
});

test('(f) finish with stubs: 2 candidates, 1 survivor, the exact order of every call, the marks', () => {
  const root = makeRoot();
  try {
    twoCandidates(root);
    const r = drive(root, ['finish', '--gen', '1', '--no-commit'], { CI: '1' });
    assert.equal(r.code, 0, r.stderr);
    const j = r.json;
    assert.equal(j.candidates, 2);
    assert.equal(j.survivors, 1);
    assert.equal(j.parent, 'direct');
    assert.deepEqual(j.lanes, { direct: { candidates: 1, survivors: 1 }, baked: { candidates: 1, survivors: 0 } });
    assert.equal(j.promoted, 1);
    assert.equal(j.built, true);
    assert.deepEqual(j.tests, { exitCode: 0, pass: 5, fail: 0 });
    assert.equal(j.committed, 'skipped (--no-commit)');
    assert.deepEqual(j.misses, { growing: 2, grown: 1, reopened: 1 });
    assert.equal(j.self, 'not wired');
    assert.equal(j.dream, 'none', 'no collect.json of this generation: the dream runs after finish');
    for (const k of ['generation', 'store', 'pushed', 'blocked', 'at']) assert.ok(k in j, 'missing ' + k);
    assert.deepEqual(j.baseline, { fragment: 0, mash: 0 });
    assert.deepEqual(j.store, { direct: { sharded: 'direct' }, baked: { sharded: 'baked' } });
    // the lock, the baselines again, sandbox then select per candidate, shard then promote per lane, one build
    const s = seq(root);
    assert.deepEqual(s.slice(0, 12), ['verify', 'baseline fragment', 'baseline mash', 'sandbox ' + D1, 'select ' + D1, 'sandbox ' + B1, 'select ' + B1,
      'store shard direct', 'store promote direct', 'store shard baked', 'store promote baked', 'build']);
    assert.deepEqual(s.slice(12).sort(), SUITES.map((x) => 'suite ' + x).sort());
    const sb = calls(root).filter((c) => c[0] === 'sandbox');
    assert.equal(sb.length, 2);
    for (const c of sb) { assert.ok(c.includes('--backend')); assert.ok(c.includes('judge/control.jsonl')); }
    assert.ok(sb.some((c) => c.includes('judge/heldout/mash.jsonl')));
    const gs = JSON.parse(fs.readFileSync(path.join(root, 'grown/generations.json'), 'utf8'));
    assert.equal(gs.generations.at(-1).generation, 1);
    assert.equal(gs.generations.at(-1).parent, 'direct');
    assert.deepEqual(gs.generations.at(-1).lanes, j.lanes);
    assert.deepEqual(gs.generations.at(-1).misses, [1, 'seed-2']);
    assert.equal(nextGeneration(root), 2);
    const gen = fs.readFileSync(path.join(root, 'work/grow/gen-1/misses.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    assert.equal(gen[0].status, 'grown');
    assert.equal(gen[0].cell, 'fragment-direct-g1');
    assert.equal(gen[1].status, 'open');
    assert.ok(fs.readFileSync(path.join(root, 'work/grow/gen-1/blocked.txt'), 'utf8').includes('no held-out set: capital-of'));
  } finally { clean(root); }
});

test('(g) a promote failure stops the build, the record and the commit', () => {
  const root = makeRoot();
  try {
    assert.equal(drive(root, ['prepare']).code, 0);
    candidate(root, 'direct', 'fragment-direct-g1', 'fragment');
    const gsBefore = fs.readFileSync(path.join(root, 'grown/generations.json'), 'utf8');
    const r = drive(root, ['finish', '--gen', '1', '--no-push'], { CI: '1', STUB_PROMOTE_FAIL: '1' });
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.promoted, false);
    assert.equal(r.json.built, 'skipped: the promote failed');
    assert.equal(r.json.tests, 'skipped: the promote failed');
    assert.equal(r.json.committed, 'blocked: the promote failed');
    assert.ok(r.json.blocked.some((l) => l.startsWith('promote: direct: exit 1: promote failed: stub')));
    assert.ok(!calls(root).some((c) => c[0] === 'build'));
    assert.equal(fs.readFileSync(path.join(root, 'grown/generations.json'), 'utf8'), gsBefore);
    const gen = fs.readFileSync(path.join(root, 'work/grow/gen-1/misses.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    assert.equal(gen[0].status, 'open');
  } finally { clean(root); }
});

test('a failing suite blocks the commit', () => {
  const root = makeRoot();
  try {
    assert.equal(drive(root, ['prepare']).code, 0);
    candidate(root, 'direct', 'fragment-direct-g1', 'fragment');
    const r = drive(root, ['finish', '--gen', '1', '--no-push'], { CI: '1', STUB_SUITE_FAIL: '1' });
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.tests.fail, 1);
    assert.equal(r.json.committed, 'blocked: the suites failed');
    assert.equal(r.json.misses.grown, 0);
  } finally { clean(root); }
});

test('(h) --no-store skips the shard and still promotes', () => {
  const root = makeRoot();
  try {
    assert.equal(drive(root, ['prepare']).code, 0);
    candidate(root, 'direct', 'fragment-direct-g1', 'fragment');
    reset(root);
    const r = drive(root, ['finish', '--gen', '1', '--no-store', '--no-commit', '--no-tests', '--no-build'], { CI: '1' });
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.store.direct, 'skipped (--no-store)');
    assert.equal(r.json.promoted, 1);
    assert.equal(r.json.built, 'skipped (--no-build)');
    assert.equal(r.json.tests, 'skipped (--no-tests)');
    assert.deepEqual(seq(root), ['verify', 'baseline fragment', 'sandbox ' + D1, 'select ' + D1, 'store promote direct']);
  } finally { clean(root); }
});

test('--no-tests alone: the build runs, no suite does, and the commit is not blocked by it', () => {
  const root = makeRoot();
  try {
    assert.equal(drive(root, ['prepare']).code, 0);
    candidate(root, 'direct', 'fragment-direct-g1', 'fragment');
    reset(root);
    const r = drive(root, ['finish', '--gen', '1', '--no-tests', '--no-commit'], { CI: '1' });
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.built, true);
    assert.equal(r.json.tests, 'skipped (--no-tests)');
    assert.equal(r.json.committed, 'skipped (--no-commit)');
    assert.equal(r.json.misses.grown, 1);
    assert.deepEqual(seq(root), ['verify', 'baseline fragment', 'sandbox ' + D1, 'select ' + D1, 'store shard direct', 'store promote direct', 'build']);
  } finally { clean(root); }
});

test('a shard failure is recorded and is not fatal: promote, build and the suites still run', () => {
  const root = makeRoot();
  try {
    twoCandidates(root);
    const r = drive(root, ['finish', '--gen', '1', '--no-commit'], { CI: '1', STUB_SHARD_FAIL: '1' });
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.store.direct, 'failed: exit 1: unreachable: stub');
    assert.equal(r.json.store.baked, 'failed: exit 1: unreachable: stub');
    assert.ok(r.json.blocked.includes('store: shard direct: exit 1: unreachable: stub'));
    assert.equal(r.json.promoted, 1);
    assert.equal(r.json.built, true);
    assert.equal(r.json.tests.fail, 0);
    assert.equal(r.json.misses.grown, 1);
    assert.deepEqual(seq(root).slice(7, 12), ['store shard direct', 'store promote direct', 'store shard baked', 'store promote baked', 'build']);
  } finally { clean(root); }
});

test('a build failure blocks the suites and the commit; the promoted tournament is recorded, the misses reopen', () => {
  const root = makeRoot();
  try {
    twoCandidates(root);
    const r = drive(root, ['finish', '--gen', '1', '--no-push'], { CI: '1', STUB_BUILD_FAIL: '1' });
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.built, false);
    assert.equal(r.json.tests, 'skipped: the build failed');
    assert.equal(r.json.committed, 'blocked: the build failed');
    assert.ok(r.json.blocked.includes('build: node web/build.mjs exited 1: build failed: stub'));
    assert.deepEqual(r.json.misses, { growing: 2, grown: 0, reopened: 2 });
    assert.ok(!seq(root).some((c) => c.startsWith('suite ')));
    assert.equal(nextGeneration(root), 2);
  } finally { clean(root); }
});

test('a sandbox exit that is not 0 is infrastructure: the other candidate is still judged, the tournament is void and runs again', () => {
  const root = makeRoot();
  try {
    twoCandidates(root);
    const gsBefore = fs.readFileSync(path.join(root, 'grown/generations.json'), 'utf8');
    const r = drive(root, ['finish', '--gen', '1', '--no-push'], { CI: '1', STUB_SANDBOX_FAIL: 'fragment-direct-g1' });
    assert.equal(r.code, 0, r.stderr);
    assert.ok(r.json.blocked.includes('sandbox: fragment-direct-g1: exit 3: sandbox refused: stub exit 3'));
    assert.ok(r.json.blocked.includes('void: 1 of 2 candidates did not run (a sandbox or select exit that is not 0 is infrastructure, not a loss): generation 1 is not recorded and runs again'));
    assert.equal(r.json.candidates, 2);
    assert.equal(r.json.survivors, 0);
    assert.equal(r.json.parent, null);
    assert.deepEqual(r.json.store, { all: 'skipped: 1 of 2 candidates did not run' });
    assert.equal(r.json.committed, 'blocked: 1 of 2 candidates did not run');
    // the other candidate still ran and was judged (its verdict is on disk), the unrun one has none
    assert.deepEqual(seq(root), ['verify', 'baseline fragment', 'baseline mash', 'sandbox ' + D1, 'sandbox ' + B1, 'select ' + B1]);
    assert.ok(!fs.existsSync(path.join(root, D1, 'verdict.json')));
    assert.ok(fs.existsSync(path.join(root, B1, 'verdict.json')));
    // nothing recorded: generations.json untouched, the next generation is still 1, every miss open again
    assert.equal(fs.readFileSync(path.join(root, 'grown/generations.json'), 'utf8'), gsBefore);
    assert.equal(nextGeneration(root), 1);
    assert.deepEqual(genMisses(root).map((m) => m.status), ['open', 'open', 'open', 'open']);
  } finally { clean(root); }
});

test('void: when no candidate is judged, nothing is stored, recorded or committed and the generation runs again', () => {
  const root = makeRoot();
  try {
    twoCandidates(root);
    const gsBefore = fs.readFileSync(path.join(root, 'grown/generations.json'), 'utf8');
    const r = drive(root, ['finish', '--gen', '1', '--no-push'], { CI: '1', STUB_SANDBOX_FAIL: '*' });
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.candidates, 2);
    assert.equal(r.json.parent, null);
    assert.deepEqual(r.json.store, { all: 'skipped: no candidate was judged' });
    assert.equal(r.json.committed, 'blocked: no candidate was judged');
    assert.ok(r.json.blocked.includes('void: 2 of 2 candidates did not run (a sandbox or select exit that is not 0 is infrastructure, not a loss): generation 1 is not recorded and runs again'));
    assert.deepEqual(r.json.misses, { growing: 2, grown: 0, reopened: 2 });
    assert.deepEqual(seq(root), ['verify', 'baseline fragment', 'baseline mash', 'sandbox ' + D1, 'sandbox ' + B1]);
    assert.equal(fs.readFileSync(path.join(root, 'grown/generations.json'), 'utf8'), gsBefore);
    assert.equal(nextGeneration(root), 1);
    assert.deepEqual(genMisses(root).map((m) => m.status), ['open', 'open', 'open', 'open']);
  } finally { clean(root); }
});

test('an expired OIDC token: finish runs no candidate, says so, never prints the token', () => {
  const root = makeRoot();
  try {
    twoCandidates(root);
    const tok = 'eyJhbGciOiJub25lIn0.' + Buffer.from(JSON.stringify({ exp: 1000 })).toString('base64url') + '.sig';
    const r = drive(root, ['finish', '--gen', '1', '--no-push'], { VERCEL_OIDC_TOKEN: tok });
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.committed, 'blocked: the sandbox token expired');
    assert.ok(r.json.blocked.some((l) => l.startsWith('sandbox: VERCEL_OIDC_TOKEN is set, but it expired at 1970-01-01T00:16:40.000Z')));
    assert.ok(!r.stdout.includes(tok) && !r.stdout.includes('eyJ'));
    assert.deepEqual(seq(root), ['verify']);
    assert.equal(nextGeneration(root), 1);
  } finally { clean(root); }
});

test('finish measures the baseline again: its score reaches the final line, a failed class is not judged', () => {
  const root = makeRoot();
  try {
    twoCandidates(root);
    const r = drive(root, ['finish', '--gen', '1', '--no-commit', '--no-tests', '--no-build'], { CI: '1', STUB_BASELINE_SCORE: '0.25', STUB_BASELINE_FAIL: 'mash' });
    assert.equal(r.code, 0, r.stderr);
    assert.deepEqual(r.json.baseline, { fragment: 0.25 });
    assert.ok(r.json.blocked.includes('baseline: mash: exit 1: baseline failed: stub: its candidates are not judged'));
    assert.deepEqual(seq(root).slice(0, 5), ['verify', 'baseline fragment', 'baseline mash', 'sandbox ' + D1, 'select ' + D1]);
    assert.ok(!seq(root).includes('sandbox ' + B1));
    assert.equal(r.json.survivors, 1);
  } finally { clean(root); }
});

test('prepare: a class without a dev set is skipped and never graded; a pack failure is recorded, not fatal', () => {
  const root = makeRoot();
  try {
    put(root, 'judge/heldout/capital-of.jsonl', jsonl([{ q: 'HELDOUT-SENTINEL-cap-1', expect: { minWords: 1 } }]));
    const r = drive(root, ['prepare'], { STUB_PACK_FAIL: '1' });
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.classes, 2);
    assert.ok(r.json.blocked.includes('no dev set: capital-of: a human session adds truth'));
    assert.ok(r.json.blocked.includes('pack: node tools/fetch-pack.mjs --quiet exited 1: pack fetch failed: stub'));
    assert.deepEqual(calls(root).filter((c) => c[0] === 'baseline').map((c) => c[1]), ['fragment', 'mash']);
    assert.ok(!fs.existsSync(path.join(root, 'work/grow/gen-1/direct/brief-capital-of.md')));
  } finally { clean(root); }
});

test('no backend: finish runs no candidate and records the reason', () => {
  const root = makeRoot();
  try {
    assert.equal(drive(root, ['prepare']).code, 0);
    candidate(root, 'direct', 'fragment-direct-g1', 'fragment');
    const r = drive(root, ['finish', '--gen', '1']);
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.survivors, 0);
    assert.equal(r.json.committed, 'blocked: no sandbox backend');
    assert.ok(!calls(root).some((c) => ['sandbox', 'select', 'store promote', 'build'].includes(c[0])));
    assert.equal(nextGeneration(root), 1);
  } finally { clean(root); }
});

test('(i) validate: ok on the echo fixture, a copy with fetch( fails', () => {
  const ok = spawnSync(process.execPath, [DRIVER, 'validate', path.join(BRAIN, 'grow/fixtures/echo-cell')], { env: envOf(), encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stderr);
  assert.deepEqual(JSON.parse(ok.stdout.trim()), { ok: true, errors: [], id: 'echo-fixture', class: 'fixture', generation: 1, lane: 'fixture', examples: 1 });
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'grow-generation-cell-'));
  try {
    for (const f of ['cell.mjs', 'test.mjs', 'examples.jsonl']) fs.copyFileSync(path.join(BRAIN, 'grow/fixtures/echo-cell', f), path.join(dir, f));
    fs.appendFileSync(path.join(dir, 'cell.mjs'), "\nexport const leak = () => fetch('https://example.invalid');\n");
    const bad = spawnSync(process.execPath, [DRIVER, 'validate', dir], { env: envOf(), encoding: 'utf8' });
    assert.equal(bad.status, 1);
    const j = JSON.parse(bad.stdout.trim());
    assert.equal(j.ok, false);
    assert.ok(j.errors.some((e) => e.includes('fetch')), j.errors.join('; '));
  } finally { clean(dir); }
});

const ECHO = ['cell.mjs', 'test.mjs', 'examples.jsonl'];
const validateIn = (dir, root) => drive(root, ['validate', dir]);
test('validate: every test.mjs and examples.jsonl check fails its own copy, the untouched copy passes', () => {
  const root = makeRoot();
  try {
    const mk = (name, edit) => {
      const dir = path.join(root, 'cands', name);
      fs.mkdirSync(dir, { recursive: true });
      for (const f of ECHO) fs.copyFileSync(path.join(BRAIN, 'grow/fixtures/echo-cell', f), path.join(dir, f));
      edit(dir);
      return validateIn(dir, root);
    };
    const same = mk('same', () => {});
    assert.equal(same.code, 0, same.stdout + same.stderr);
    assert.equal(same.json.ok, true);
    const cases = [
      ['foreign-import', (d) => fs.appendFileSync(path.join(d, 'test.mjs'), "\nimport { x } from '../other.mjs';\n"), ['test.mjs imports "../other.mjs": only ./x.mjs of its directory, node:test, node:assert, node:assert/strict, node:fs, node:path, node:url']],
      ['no-cell-import', (d) => fs.writeFileSync(path.join(d, 'test.mjs'), "import { test } from 'node:test';\ntest('x', () => {});\n"), ['test.mjs does not import ./cell.mjs']],
      ['no-test', (d) => fs.rmSync(path.join(d, 'test.mjs')), ['no test.mjs']],
      ['extra-row', (d) => fs.appendFileSync(path.join(d, 'examples.jsonl'), JSON.stringify({ q: 'SK-extra', expect: { minWords: 1 } }) + '\n'), ['only in examples.jsonl: ["SK-extra"]']],
      ['empty-file', (d) => fs.writeFileSync(path.join(d, 'examples.jsonl'), ''), ['only in examples: ["h"]']],
      ['no-examples', (d) => fs.rmSync(path.join(d, 'examples.jsonl')), ['examples.jsonl: missing', 'only in examples: ["h"]']],
      ['no-expect', (d) => fs.writeFileSync(path.join(d, 'examples.jsonl'), '{"q":"h"}\n'), ['examples.jsonl row 1 has no q and expect']],
    ];
    for (const [name, edit, errors] of cases) {
      const r = mk(name, edit);
      assert.equal(r.code, 1, name);
      assert.equal(r.json.ok, false, name);
      assert.deepEqual(r.json.errors, errors, name);
    }
  } finally { clean(root); }
});

/** A valid fragment cell in its candidate directory; rows are both examples and examples.jsonl. */
function fragCell(root, { id = 'fragment-direct-g1', rows = DEV.fragment, tests = 3 } = {}) {
  const rel = 'work/grow/gen-1/direct/' + id;
  put(root, rel + '/cell.mjs', "export const meta = { id: '" + id + "', class: 'fragment', generation: 1, lane: 'direct', grownFrom: ['h'], version: 1 };\n"
    + "export function can(q) { return q.startsWith('DEVQ-frag'); }\n"
    + "export function answer(q) { return can(q) ? 'The text \"' + q + '\" is not a word: say a whole word or ask a question.' : null; }\n"
    + 'export const examples = ' + JSON.stringify(rows) + ';\n');
  put(root, rel + '/test.mjs', "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { can } from './cell.mjs';\n"
    + Array.from({ length: tests }, (_, i) => "test('t" + i + "', () => assert.equal(can('hi'), false));\n").join(''));
  put(root, rel + '/examples.jsonl', jsonl(rows));
  return path.join(root, rel);
}
test('validate inside work/grow/gen-<n>/<lane>/<id>/: the id, lane, test count and every dev row', () => {
  const root = makeRoot();
  try {
    const good = validateIn(fragCell(root), root);
    assert.equal(good.code, 0, good.stdout + good.stderr);
    assert.deepEqual(good.json, { ok: true, errors: [], id: 'fragment-direct-g1', class: 'fragment', generation: 1, lane: 'direct', examples: 2 });
    const short = validateIn(fragCell(root, { rows: [DEV.fragment[0]] }), root);
    assert.deepEqual(short.json.errors, ['dev rows missing: ["DEVQ-frag-two"]']);
    const two = validateIn(fragCell(root, { tests: 2 }), root);
    assert.deepEqual(two.json.errors, ['test.mjs declares 2 tests, not 3']);
    const dir = path.join(root, 'work/grow/gen-1/direct/wrong-name');
    fs.mkdirSync(dir, { recursive: true });
    for (const f of ECHO) fs.copyFileSync(path.join(BRAIN, 'grow/fixtures/echo-cell', f), path.join(dir, f));
    const echo = validateIn(dir, root);
    assert.equal(echo.code, 1);
    assert.deepEqual(echo.json.errors, ['meta.id "echo-fixture" is not wrong-name', 'meta.lane "fixture" is not direct', 'test.mjs declares 2 tests, not 3']);
  } finally { clean(root); }
});

test('candidates: the class from cell.mjs, else brief.md, else plan.json; none is a blocked line, never a run', () => {
  const root = makeRoot();
  try {
    assert.equal(drive(root, ['prepare']).code, 0);
    put(root, 'work/grow/gen-1/direct/fragment-direct-g1/cell.mjs', 'export const meta = {};\n');
    put(root, 'work/grow/gen-1/direct/fragment-direct-g1/brief.md', fs.readFileSync(path.join(root, 'work/grow/gen-1/direct/brief-fragment.md')));
    put(root, 'work/grow/gen-1/baked/mash-baked-g1/cell.mjs', 'export const meta = {};\n');
    put(root, 'work/grow/gen-1/baked/stray-g1/cell.mjs', 'export const meta = {};\n');
    const plan = JSON.parse(fs.readFileSync(path.join(root, 'work/grow/gen-1/plan.json'), 'utf8'));
    const c = candidates(root, 1, ['direct', 'baked'], plan);
    assert.deepEqual(c.map((x) => [x.id, x.class, x.classFrom]), [['fragment-direct-g1', 'fragment', 'brief.md'], ['mash-baked-g1', 'mash', 'plan.json'], ['stray-g1', null, null]]);
    reset(root);
    const r = drive(root, ['finish', '--gen', '1', '--no-commit', '--no-tests', '--no-build', '--no-store', '--no-promote'], { CI: '1' });
    assert.equal(r.code, 0, r.stderr);
    assert.ok(r.json.blocked.includes('sandbox: work/grow/gen-1/baked/stray-g1: no class in cell.mjs, brief.md or plan.json'));
    assert.ok(!seq(root).some((s) => s.includes('stray-g1')));
    assert.equal(r.json.candidates, 3);
  } finally { clean(root); }
});

test('(j) the class regex reads both quote styles', () => {
  assert.equal(classOfSource("export const meta = { id: 'a-b-c', class: 'mash' };"), 'mash');
  assert.equal(classOfSource('export const meta = { id: "a-b-c", class:"fragment" };'), 'fragment');
  assert.equal(classOfSource('export const meta = { id: "a" };'), null);
  assert.ok(CLASS_SRC_RE.test("class : 'capital-of'"));
  const root = makeRoot();
  try {
    candidate(root, 'baked', 'mash-baked-g1', 'mash', '"');
    candidate(root, 'direct', 'fragment-direct-g1', 'fragment', "'");
    const c = candidates(root, 1, ['direct', 'baked']);
    assert.deepEqual(c.map((x) => [x.lane, x.id, x.class, x.classFrom]), [['direct', 'fragment-direct-g1', 'fragment', 'cell.mjs'], ['baked', 'mash-baked-g1', 'mash', 'cell.mjs']]);
  } finally { clean(root); }
});

test('ask runs the organism judge/baseline.mjs exports, one JSON line with its route', () => {
  const root = makeRoot();
  try {
    const r = drive(root, ['ask', 'What is the capital of France?'], { STUB_ANSWERS: 'What is the capital of France?' });
    assert.equal(r.code, 0, r.stderr);
    assert.deepEqual(r.json, { q: 'What is the capital of France?', text: 'stub organism: What is the capital of France?', route: 'stub-route', via: 'ask', knowledge: 'act/prompt.mjs KNOWLEDGE_DIR (default)' });
  } finally { clean(root); }
});

test('rankLanes, nextGeneration, armId, parseArgs and the commit message', () => {
  assert.deepEqual(rankLanes({ direct: { survivors: 1, candidates: 2 }, baked: { survivors: 1, candidates: 3 } }), ['baked', 'direct']);
  assert.deepEqual(rankLanes({ direct: { survivors: 0, candidates: 1 }, baked: { survivors: 0, candidates: 1 } }), ['baked', 'direct']);
  assert.deepEqual(rankLanes({ direct: { survivors: 2, candidates: 2 }, baked: { survivors: 0, candidates: 4 } }), ['direct', 'baked']);
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'grow-generation-n-'));
  try {
    assert.equal(nextGeneration(root), 1);
    put(root, 'grown/index.json', JSON.stringify({ generation: 2, cells: [] }));
    assert.equal(nextGeneration(root), 3);
    put(root, 'grown/generations.json', JSON.stringify({ generations: [{ generation: 4 }] }));
    assert.equal(nextGeneration(root), 5);
  } finally { clean(root); }
  assert.equal(armId('fragment', 'direct', 1), 'fragment-direct-g1');
  assert.equal(armId('fragment', 'direct', 1, 2), 'fragment-direct-g1-2');
  assert.throws(() => parseArgs(['finish', '--bogus']), /unknown flag --bogus/);
  assert.equal(commitMessage(1, 1, 2, 'direct'), 'gen 1: 1 of 2 survived, parent direct');
  assert.equal(commitMessage(2, 0, 0, null, 1), 'gen 2: 0 of 0 survived, parent null, 1 app built');
  assert.equal(commitMessage(3, 1, 2, 'baked', 2), 'gen 3: 1 of 2 survived, parent baked, 2 apps built');
});

test('why1: the one line that says why a child failed skips the Node banner, the caret and every stack frame', () => {
  const crash = [
    'node:internal/modules/run_main:123', '    triggerUncaughtException(err, true);', '    ^', '',
    'Error: Cannot find module \'/x/grow/sandbox.mjs\'', '    at Module._resolveFilename (node:internal/modules/cjs/loader:1225:15)',
    '    at ModuleJob.run (node:internal/modules/esm/module_job:222:25) {', "  code: 'ERR_MODULE_NOT_FOUND',", '}', '', 'Node.js v22.12.0', '',
  ].join('\n');
  assert.equal(why1({ stderr: crash, stdout: '' }), "Error: Cannot find module '/x/grow/sandbox.mjs'");
  assert.equal(why1({ stderr: 'sandbox refused: stub exit 3\n', stdout: 'ignored\n' }), 'sandbox refused: stub exit 3', 'stderr before stdout');
  assert.equal(why1({ stderr: '', stdout: 'first line\nlast line\n' }), 'last line', 'no error word: the last meaningful line');
  assert.equal(why1({ stderr: 'eyJabc.def token leaked\n', stdout: '' }), '<token> token leaked', 'redacted');
  assert.equal(why1({ stderr: '', stdout: '', error: { code: 'ETIMEDOUT' } }), 'ETIMEDOUT');
  assert.equal(why1({ stderr: '', stdout: '' }), 'no output');
});

test('prepare: a miss left growing by an earlier generation is planned again; a mark of this generation is not', () => {
  const root = makeRoot({ parent: 'direct' });
  try {
    put(root, 'grow/seed-misses.jsonl', jsonl([...SEED_ROWS,
      { id: 'seed-5', at: '2026-09-30T21:00:00Z', prompt: 'xq', reply: 'I do not carry that yet', status: 'growing', generation: 0 },
      { id: 'seed-6', at: '2026-09-30T21:00:00Z', prompt: 'qpwoeiru', reply: 'nothing in memory matches', status: 'growing', generation: 1 },
    ]));
    const r = drive(root, ['prepare']);
    assert.equal(r.code, 0, r.stderr);
    assert.deepEqual(r.json.misses, { read: 5, answered: 0, growing: 3, skipped: 2, source: 'seed', curriculum: 0, dreams: 0 }, 'the stuck miss is read, the mark of this generation is not');
    const gen = genMisses(root);
    const stuck = gen.find((m) => m.id === 'seed-5');
    assert.ok(stuck, 'the stuck miss is in the gen copy');
    assert.equal(stuck.status, 'growing');
    assert.equal(stuck.generation, 1, 'marked for this generation');
    assert.equal(gen.some((m) => m.id === 'seed-6'), false, 'a growing mark of this generation is another run of it, left alone');
  } finally { clean(root); }
});

test('finish: a survivor grown/ already holds is skipped by promote and still grown for its misses (a half-landed generation converges)', () => {
  const root = makeRoot();
  try {
    twoCandidates(root);
    put(root, 'grown/index.json', JSON.stringify({ generation: 1, cells: [{ id: 'fragment-direct-g1', class: 'fragment', generation: 1, lane: 'direct', file: 'cells/fragment-direct-g1.mjs', heldout: { score: 1, n: 1 }, promotedAt: 'x' }] }));
    const r = drive(root, ['finish', '--gen', '1', '--no-commit'], { CI: '1' });
    assert.equal(r.code, 0, r.stderr);
    const j = r.json;
    assert.equal(j.survivors, 1);
    assert.equal(j.promoted, 0, 'nothing promoted: grown/ held it already');
    assert.deepEqual(j.archived, [{ lane: 'direct', id: 'fragment-direct-g1', holds: 'fragment-direct-g1' }]);
    assert.deepEqual(j.misses, { growing: 2, grown: 1, reopened: 1 }, 'the held survivor is grown for its class');
    const gen = genMisses(root);
    assert.equal(gen[0].status, 'grown');
    assert.equal(gen[0].cell, 'fragment-direct-g1');
    assert.equal(gen[1].status, 'open');
    const gs = JSON.parse(fs.readFileSync(path.join(root, 'grown/generations.json'), 'utf8'));
    assert.equal(gs.generations.at(-1).generation, 1, 'the tournament is recorded');
    assert.ok(j.blocked.some((l) => /^no held-out set: capital-of/.test(l)), j.blocked.join(' | '));
    assert.ok(!j.blocked.some((l) => /promote|duplicate/.test(l)), 'no promote line: ' + j.blocked.join(' | '));
  } finally { clean(root); }
});

test('prepare: a miss the organism already answers is grown (with the cell that answers it), never planned; the others are planned', () => {
  const root = makeRoot({ parent: 'direct' });
  try {
    const r = drive(root, ['prepare'], { STUB_ANSWERS: 'h|the capital of Peru', STUB_VIA: 'grown:fragment-stub-cell' });
    assert.equal(r.code, 0, r.stderr);
    assert.deepEqual(r.json.misses, { read: 4, answered: 2, growing: 1, skipped: 1, source: 'seed', curriculum: 0, dreams: 0 });
    assert.equal(r.json.classes, 1, 'fragment is answered, only mash is planned');
    assert.deepEqual(r.json.baseline, { mash: 0 });
    const gen = genMisses(root);
    const h = gen.find((m) => m.id === 1);
    assert.equal(h.status, 'grown');
    assert.equal(h.cell, 'fragment-stub-cell');
    assert.equal(h.generation, 1);
    assert.equal(gen.find((m) => m.id === 4).status, 'grown', 'answered by a tier: grown with no cell');
    assert.equal(gen.find((m) => m.id === 'seed-2').status, 'growing');
    const plan = JSON.parse(fs.readFileSync(path.join(root, 'work/grow/gen-1/plan.json'), 'utf8'));
    assert.deepEqual(plan.classes.map((c) => c.class), ['mash']);
    assert.ok(Array.isArray(plan.blocked) && plan.blocked.some((l) => /^no held-out set: other/.test(l)), 'prepare records its blocked lines in the plan');
    // a finish attempt's own lines never carry into the next attempt: only prepare's do
    fs.writeFileSync(path.join(root, 'work/grow/gen-1/blocked.txt'), plan.blocked.concat(['promote: baked: exit 1: a line from an earlier finish attempt']).join('\n') + '\n');
    const f = drive(root, ['finish', '--gen', '1', '--no-commit'], { CI: '1' });
    assert.equal(f.code, 0, f.stderr);
    assert.ok(!f.json.blocked.some((l) => /earlier finish attempt/.test(l)), f.json.blocked.join(' | '));
    assert.ok(f.json.blocked.some((l) => /^no held-out set: other/.test(l)));
  } finally { clean(root); }
});

test('Day 2: curriculum and dream rows are open misses on top of the seed, keep their class, the dreamed task reaches the brief with its answer, finish reports the collected dream and ships grow/dreams.jsonl', () => {
  const root = makeRoot({ parent: 'direct' });
  try {
    // a curriculum row of class mash (its own class, not classify's) and a dream of class fragment with the solver's answer
    put(root, 'grow/curriculum.jsonl', jsonl([{ id: 'cur-mash-1', prompt: 'CURRICULUM-mash-one', class: 'mash', route: 'curriculum', status: 'open' }, { id: 'cur-x-1', prompt: 'CURRICULUM-x', class: 'no-set', route: 'curriculum', status: 'open' }]));
    put(root, 'grow/dreams.jsonl', jsonl([{ id: 'dream-1-fragment-1', at: '2026-10-01T03:00:00.000Z', prompt: 'DREAM-frag-one', reply: 'the dreamed answer "x" in six words here', route: 'dream', class: 'fragment', expect: { contains: ['"x"'], minWords: 6 }, status: 'open', generation: 1 }, { id: 'dream-1-fragment-2', prompt: 'DREAM-frag-grown', route: 'dream', class: 'fragment', status: 'grown' }]));
    const r = drive(root, ['prepare']);
    assert.equal(r.code, 0, r.stderr);
    assert.deepEqual(r.json.misses, { read: 7, answered: 0, growing: 4, skipped: 3, source: 'seed', curriculum: 2, dreams: 1 }, 'the grown dream is not read');
    const plan = JSON.parse(fs.readFileSync(path.join(root, 'work/grow/gen-1/plan.json'), 'utf8'));
    const frag = plan.classes.find((c) => c.class === 'fragment');
    const mash = plan.classes.find((c) => c.class === 'mash');
    assert.deepEqual(frag.misses, [1, 'dream-1-fragment-1']);
    assert.equal(frag.dreams, 1);
    assert.deepEqual(mash.misses, ['seed-2', 'cur-mash-1'], 'the curriculum row keeps its own class');
    assert.ok(plan.blocked.some((l) => /^no held-out set: no-set/.test(l)));
    const gen = genMisses(root);
    assert.equal(gen.find((m) => m.id === 'cur-mash-1').class, 'mash');
    assert.equal(gen.find((m) => m.id === 'dream-1-fragment-1').status, 'growing');
    const b = fs.readFileSync(path.join(root, 'work/grow/gen-1/direct/brief-fragment.md'), 'utf8');
    assert.ok(b.includes('## Dreamed tasks (route dream'), 'the brief has the dream section');
    assert.ok(b.includes('"q":"DREAM-frag-one"') && b.includes('the dreamed answer'), 'the dreamed task and the solver answer are in the brief');
    assert.ok(!b.includes('DREAM-frag-grown'), 'a grown dream is not in the brief');
    const bm = fs.readFileSync(path.join(root, 'work/grow/gen-1/direct/brief-mash.md'), 'utf8');
    assert.ok(!bm.includes('## Dreamed tasks'), 'no dream section without a dream of the class');
    assert.ok(bm.includes('CURRICULUM-mash-one'), 'the curriculum prompt is among the misses the cell grows for');
    // the files the driver never writes
    assert.ok(fs.readFileSync(path.join(root, 'grow/curriculum.jsonl'), 'utf8').includes('"status":"open"'));
    // finish: the dream of this generation as collect wrote it, and grow/dreams.jsonl in the commit paths
    put(root, 'work/grow/gen-1/dream/collect.json', JSON.stringify({ generation: 1, proposed: 8, kept: 5, byClass: { fragment: { proposed: 4, kept: 2 }, mash: { proposed: 4, kept: 3 } } }));
    candidate(root, 'direct', 'fragment-direct-g1', 'fragment');
    const f = drive(root, ['finish', '--gen', '1', '--no-commit', '--dry'], { CI: '1' });
    assert.equal(f.code, 0, f.stderr);
    const dry = drive(root, ['finish', '--gen', '1', '--dry'], { CI: '1' });
    assert.equal(dry.code, 0, dry.stderr);
    assert.ok(dry.json.would.some((w) => w === 'git add -- grown/ web/dist/ grow/dreams.jsonl'), dry.json.would.join(' | '));
    const g = drive(root, ['finish', '--gen', '1', '--no-commit'], { CI: '1' });
    assert.equal(g.code, 0, g.stderr);
    assert.deepEqual(g.json.dream, { proposed: 8, kept: 5, classes: 2 });
  } finally { clean(root); }
});

test('Day 2, the builder arm: a build miss gets a build brief and app.json (never a cell class); finish runs the app in the sandbox, judges, promotes and serves it, grows its misses as app:<slug>, ships without a cell candidate; a failing app is a loser; a served app grows its misses without an arm', () => {
  const root = makeRoot({ parent: 'direct' });
  try {
    const at = '2026-09-30T20:00:00Z';
    put(root, 'grow/seed-misses.jsonl', jsonl([...SEED_ROWS,
      { id: 'seed-5', at, prompt: 'make me a todo app', reply: 'nothing in memory matches', status: 'open' },
      { id: 'seed-6', at, prompt: 'build a todo app', reply: 'nothing in memory matches', status: 'open' },
      { id: 'seed-7', at, prompt: 'make me a weather app', reply: 'nothing in memory matches', status: 'open' }]));
    const r = drive(root, ['prepare']);
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.builds, 2, 'one build per slug: todo and weather');
    assert.equal(r.json.misses.growing, 5, 'two class misses (fragment, mash) and three build misses are growing');
    assert.ok(!r.json.blocked.some((l) => l.includes('build')), 'build is never a class without a held-out set: ' + r.json.blocked.join(' | '));
    const plan = JSON.parse(fs.readFileSync(path.join(root, 'work/grow/gen-1/plan.json'), 'utf8'));
    assert.ok(!plan.classes.some((c) => c.class === 'build'));
    const todo = plan.builds.find((b) => b.slug === 'todo');
    assert.deepEqual(todo.misses, ['seed-5', 'seed-6']);
    assert.equal(todo.dir, 'work/grow/gen-1/build/todo');
    assert.equal(todo.brief, 'work/grow/gen-1/build/brief-todo.md');
    const brief = fs.readFileSync(path.join(root, todo.brief), 'utf8');
    assert.ok(brief.startsWith(DIRECTIVE), 'the build brief starts with the CONCISE directive');
    for (const s of ['"make me a todo app"', '"build a todo app"', 'work/grow/gen-1/build/todo/', 'index.html', 'app.mjs', 'test.mjs', 'brief.md', 'node grow/build.mjs validate work/grow/gen-1/build/todo', 'at least 3', 'fetch()']) assert.ok(brief.includes(s), 'the brief has ' + s);
    const appJson = JSON.parse(fs.readFileSync(path.join(root, 'work/grow/gen-1/build/todo/app.json'), 'utf8'));
    assert.deepEqual(appJson, { slug: 'todo', name: 'todo', prompt: 'make me a todo app', generation: 1, misses: ['seed-5', 'seed-6'] });
    assert.equal(genMisses(root).find((m) => m.id === 'seed-5').status, 'growing');
    // the arm: the fixture app under todo/ (app.json stays the driver's); the weather arm wrote nothing
    for (const f of ['index.html', 'app.mjs', 'test.mjs']) put(root, 'work/grow/gen-1/build/todo/' + f, fs.readFileSync(path.join(BRAIN, 'grow/fixtures/app-ok', f)));
    put(root, 'work/grow/gen-1/build/todo/brief.md', 'A todo list.\n');
    const dry = drive(root, ['finish', '--gen', '1', '--dry'], { CI: '1' });
    assert.equal(dry.code, 0, dry.stderr);
    assert.equal(dry.json.apps.length, 2);
    assert.ok(dry.json.would.includes('node grow/sandbox.mjs run work/grow/gen-1/build/todo --app --out work/grow/gen-1/build/todo/result.json --backend here'), dry.json.would.join(' | '));
    assert.ok(dry.json.would.includes('node grow/build.mjs judge work/grow/gen-1/build/todo'));
    assert.ok(dry.json.would.includes('node grow/build.mjs promote 1 todo --dir work/grow/gen-1/build'));
    // no cell candidate at all: the app alone ships
    reset(root);
    const f = drive(root, ['finish', '--gen', '1', '--no-commit'], { CI: '1' });
    assert.equal(f.code, 0, f.stderr);
    assert.deepEqual(f.json.apps, { candidates: 2, built: 1, promoted: 1, slugs: ['todo'] });
    assert.equal(f.json.candidates, 0);
    assert.equal(f.json.parent, null);
    assert.equal(f.json.built, true, 'the site is built');
    assert.equal(f.json.committed, 'skipped (--no-commit)', 'not blocked: ' + f.json.blocked.join(' | '));
    assert.ok(f.json.blocked.some((l) => l.startsWith('build: app weather: the arm wrote no index.html')), f.json.blocked.join(' | '));
    assert.ok(!f.json.blocked.some((l) => l.startsWith('no candidate')), f.json.blocked.join(' | '));
    assert.ok(seq(root).includes('sandbox work/grow/gen-1/build/todo'), seq(root).join(' | '));
    assert.ok(fs.existsSync(path.join(root, 'web/dist/apps/todo/index.html')), 'served under web/dist/apps/todo/');
    assert.ok(!fs.existsSync(path.join(root, 'web/dist/apps/todo/test.mjs')), 'test.mjs is not served');
    const apps = JSON.parse(fs.readFileSync(path.join(root, 'grown/apps.json'), 'utf8'));
    assert.deepEqual(apps.apps.map((a) => [a.slug, a.generation, a.path]), [['todo', 1, '/apps/todo/']]);
    assert.ok(fs.existsSync(path.join(root, 'grown/apps.mjs')));
    const verdict = JSON.parse(fs.readFileSync(path.join(root, 'work/grow/gen-1/build/todo/verdict.json'), 'utf8'));
    assert.equal(verdict.survived, true);
    const gen = genMisses(root);
    for (const id of ['seed-5', 'seed-6']) { assert.equal(gen.find((m) => m.id === id).status, 'grown', id); assert.equal(gen.find((m) => m.id === id).cell, 'app:todo', id); }
    assert.equal(gen.find((m) => m.id === 'seed-7').status, 'open', 'the weather misses reopen');
    assert.equal(f.json.misses.grown, 2);
    assert.ok(!fs.existsSync(path.join(root, 'grown/generations.json')) || !JSON.parse(fs.readFileSync(path.join(root, 'grown/generations.json'), 'utf8')).generations.some((g) => g.generation === 1), 'an app alone is no tournament');
    // the next generation: the served app grows its misses without an arm
    const r2 = drive(root, ['prepare', '--gen', '2']);
    assert.equal(r2.code, 0, r2.stderr);
    assert.equal(r2.json.builds, 1, 'weather again, todo is served');
    assert.ok(!fs.existsSync(path.join(root, 'work/grow/gen-2/build/brief-todo.md')));
    const gen2 = fs.readFileSync(path.join(root, 'work/grow/gen-2/misses.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    assert.equal(gen2.find((m) => m.id === 'seed-5').status, 'grown');
    assert.equal(gen2.find((m) => m.id === 'seed-5').cell, 'app:todo');
  } finally { clean(root); }
  // a failing app is a loser: nothing served, its misses open again, the generation blocked by name
  const bad = makeRoot({ parent: 'direct' });
  try {
    put(bad, 'grow/seed-misses.jsonl', jsonl([{ id: 'seed-5', at: '2026-09-30T20:00:00Z', prompt: 'make me a todo app', reply: 'nothing in memory matches', status: 'open' }]));
    assert.equal(drive(bad, ['prepare']).code, 0);
    for (const f of ['index.html', 'app.mjs', 'test.mjs']) put(bad, 'work/grow/gen-1/build/todo/' + f, fs.readFileSync(path.join(BRAIN, 'grow/fixtures/app-ok', f)));
    const f = drive(bad, ['finish', '--gen', '1', '--no-commit'], { CI: '1', STUB_APP_FAIL: 'todo' });
    assert.equal(f.code, 0, f.stderr);
    assert.deepEqual(f.json.apps, { candidates: 1, built: 0, promoted: 0, slugs: [] });
    assert.equal(f.json.committed, 'blocked: no app survived');
    assert.ok(f.json.blocked.some((l) => l.startsWith('app todo did not survive: tests.failed is 1')), f.json.blocked.join(' | '));
    assert.ok(!fs.existsSync(path.join(bad, 'web/dist/apps/todo/index.html')));
    assert.equal(fs.readFileSync(path.join(bad, 'work/grow/gen-1/misses.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l)).find((m) => m.id === 'seed-5').status, 'open');
  } finally { clean(bad); }
});
