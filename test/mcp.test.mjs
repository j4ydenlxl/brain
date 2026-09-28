// test/mcp.test.mjs: tools/mcp.mjs, the brain as a stdio MCP server (board 32, item mcp-server).
// Author: board 32 builder.
//
// Every test runs the server as a CHILD PROCESS over piped stdio, the way a Claude session launches it,
// with its own small line client (not bench/mcp.mjs's, so the bar's client is not the only reader of the
// wire). Covered: a request, a notification, a malformed line, an unknown method, the -32600 shapes, tool
// errors (bad verdict name, missing verdict file, unknown tool, ask without a prompt, provider env without
// the names), the four tools' answers checked against the files they read, the knowledge tier both with the
// store absent (a directory with no ingest) and, when bench/fixtures/wiki/store is on this host, present,
// the --state brain from BRAIN_STATE_DIR, stdout purity, the stderr log line per call, exit 0 on stdin end,
// and the verdict shape after running the bar once (to a temp file, so a test run never rewrites the
// committed verdict). Model off everywhere: every ask passes provider "none" or is refused before a model.
// The fix pass added: the bar's own checks shown false on the texts that fooled the first version (a knowledge
// header that only echoes "Paris", a recall line that names Paris above a different answer line), every number
// of the bar's statement found in what the bar printed, and the mutant table held to the source it mutates.
// BRAIN_MCP_TEST_SERVER points every server test at another copy of the server: bench/mcp.mjs --mutants sets
// it to each mutant (unset, the tests run tools/mcp.mjs).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FALLTHROUGH_HEAD } from '../act/prompt.mjs';
import { countVision, countLine } from '../tools/vision-count.mjs';
import { seedBasic } from '../seeds/basic.mjs';
import { answerLineOf, capitalIsParis, parseKnowledge, knowledgeTopIsParis, headerOnly, MUTANTS, transplantRules, mutate, parseTap, probeHeader } from '../bench/mcp.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERVER = process.env.BRAIN_MCP_TEST_SERVER ? path.resolve(process.env.BRAIN_MCP_TEST_SERVER) : path.join(ROOT, 'tools', 'mcp.mjs');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-test-'));
const STORE_META = path.join(ROOT, 'bench', 'fixtures', 'wiki', 'store', 'meta.json');
const T = { timeout: 10000 };
// a failed assertion leaves its server alive with stdin open, and a live pipe keeps this file's process from
// ever exiting: every child still running when the tests end is killed here
const CHILDREN = new Set();
after(() => { for (const c of CHILDREN) { try { c.kill(); } catch { /* gone */ } } fs.rmSync(TMP, { recursive: true, force: true }); });

/** The server as a child, with every stdout line kept in order. */
function start(args = [], envExtra = {}) {
  const env = { ...process.env, ...envExtra };
  for (const [k, v] of Object.entries(envExtra)) if (v === undefined) delete env[k];
  const child = spawn(process.execPath, [SERVER, ...args], { cwd: ROOT, env, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
  CHILDREN.add(child);
  child.on('exit', () => CHILDREN.delete(child));
  const s = { child, out: [], err: '', waiters: [] };
  let buf = '';
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i); buf = buf.slice(i + 1);
      s.out.push(line);
      for (const w of s.waiters.slice()) if (s.out.length >= w.n) { s.waiters.splice(s.waiters.indexOf(w), 1); w.resolve(); }
    }
  });
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (d) => { s.err += d; });
  s.exit = new Promise((resolve) => child.on('exit', (code) => resolve(code)));
  s.write = (x) => child.stdin.write((typeof x === 'string' ? x : JSON.stringify(x)) + '\n');
  s.lines = (n) => (s.out.length >= n ? Promise.resolve() : new Promise((resolve) => s.waiters.push({ n, resolve })));
  /** The parsed n-th stdout line (1 based), waiting for it. */
  s.nth = async (n) => { await s.lines(n); return JSON.parse(s.out[n - 1]); };
  s.end = async () => { child.stdin.end(); return s.exit; };
  return s;
}
let nextId = 1;
const req = (method, params) => ({ jsonrpc: '2.0', id: nextId++, method, ...(params === undefined ? {} : { params }) });
const call = (name, args) => req('tools/call', { name, arguments: args });
const text = (m) => m.result.content[0].text;
const allJsonRpc = (s) => s.out.every((l) => { try { const m = JSON.parse(l); return m.jsonrpc === '2.0' && !l.includes('\n'); } catch { return false; } });

test('a request: initialize echoes a known protocol version, answers LATEST for an unknown one, names the server and its package version', T, async () => {
  const s = start();
  const a = req('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 't', version: '1' } });
  const b = req('initialize', { protocolVersion: '1999-01-01', capabilities: {}, clientInfo: { name: 't', version: '1' } });
  s.write(a); s.write(b);
  const ra = await s.nth(1), rb = await s.nth(2);
  assert.equal(ra.id, a.id); assert.equal(rb.id, b.id);
  assert.equal(ra.result.protocolVersion, '2024-11-05');
  assert.equal(rb.result.protocolVersion, '2025-06-18');
  assert.deepEqual(ra.result.capabilities, { tools: { listChanged: false } });
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.deepEqual(ra.result.serverInfo, { name: 'brain', version: pkg.version });
  assert.equal(await s.end(), 0);
  assert.ok(allJsonRpc(s));
});

test('a notification gets no answer: after notifications/initialized and an unknown notification, the first line back is the ping answer', T, async () => {
  const s = start();
  s.write({ jsonrpc: '2.0', method: 'notifications/initialized' });
  s.write({ jsonrpc: '2.0', method: 'notifications/whatever', params: { x: 1 } });
  const p = req('ping'); s.write(p);
  const r = await s.nth(1);
  assert.equal(r.id, p.id);
  assert.deepEqual(r.result, {});
  assert.equal(await s.end(), 0);
  assert.equal(s.out.length, 1, 'exactly one line: the ping answer');
});

test('a malformed line answers -32700 with id null, and the server keeps serving', T, async () => {
  const s = start();
  s.write('{"jsonrpc": "2.0", "id": 7, "method": oops');
  s.write('');
  const p = req('ping'); s.write(p);
  const e = await s.nth(1), r = await s.nth(2);
  assert.equal(e.id, null);
  assert.equal(e.error.code, -32700);
  assert.equal(r.id, p.id);
  assert.deepEqual(r.result, {});
  assert.equal(await s.end(), 0);
  assert.equal(s.out.length, 2, 'the blank line is skipped, not answered');
});

test('an unknown method answers -32601; a batch, an object id, a missing method, a wrong jsonrpc and a JSON null answer -32600', T, async () => {
  const s = start();
  const u = req('resources/list'); s.write(u);
  s.write([req('ping')]);
  s.write({ jsonrpc: '2.0', id: { a: 1 }, method: 'ping' });
  s.write({ jsonrpc: '2.0', id: 'x1' });
  s.write({ jsonrpc: '1.0', id: 'x2', method: 'ping' });
  s.write({ jsonrpc: '2.0', id: 'x3', result: {} }); // a response: this server sends no requests, so it is ignored
  s.write('null');
  const p = req('ping'); s.write(p);
  const r = [];
  for (let i = 1; i <= 7; i++) r.push(await s.nth(i));
  assert.equal(r[0].id, u.id); assert.equal(r[0].error.code, -32601);
  assert.equal(r[1].id, null); assert.equal(r[1].error.code, -32600);
  assert.equal(r[2].id, null); assert.equal(r[2].error.code, -32600);
  assert.equal(r[3].id, 'x1'); assert.equal(r[3].error.code, -32600);
  assert.equal(r[4].id, 'x2'); assert.equal(r[4].error.code, -32600);
  assert.equal(r[5].id, null); assert.equal(r[5].error.code, -32600);
  assert.equal(r[6].id, p.id); assert.deepEqual(r[6].result, {});
  assert.equal(await s.end(), 0);
  assert.equal(s.out.length, 7, 'the stray response got no answer');
});

test('tool errors: a bad verdict name and a missing verdict file are isError true; an unknown tool is -32602; ask without a prompt is isError; provider env without the names is refused before any model', T, async () => {
  const s = start([], { BRAIN_LLM_BASE: undefined, BRAIN_LLM_KEY: undefined });
  const msgs = [call('verdict', { name: '../ladder' }), call('verdict', { name: 'no-such-verdict-zz9' }), call('nope', {}), call('ask', {}), call('ask', { prompt: 'hey', provider: 'env' }), call('verdict', { name: 'ladder', extra: 1 }), req('tools/call', { name: 'status', arguments: [1] })];
  for (const m of msgs) s.write(m);
  const r = [];
  for (let i = 1; i <= msgs.length; i++) r.push(await s.nth(i));
  assert.equal(r[0].result.isError, true); assert.match(text(r[0]), /must match/);
  assert.equal(r[1].result.isError, true); assert.match(text(r[1]), /does not exist/);
  assert.equal(r[2].error.code, -32602);
  assert.equal(r[3].result.isError, true); assert.match(text(r[3]), /needs a prompt/);
  assert.equal(r[4].result.isError, true); assert.match(text(r[4]), /BRAIN_LLM_BASE and BRAIN_LLM_KEY/);
  assert.equal(r[5].result.isError, true); assert.match(text(r[5]), /unknown argument extra/);
  assert.equal(r[6].error.code, -32602);
  assert.equal(await s.end(), 0);
  assert.match(s.err, /^mcp tool=verdict ms=\d+\.\d+ isError=true$/m, 'every tool call leaves one stderr line with its ms');
  assert.ok(allJsonRpc(s));
});

test('tools/list names the four tools, each with a description and an object inputSchema', T, async () => {
  const s = start();
  const m = req('tools/list'); s.write(m);
  const r = await s.nth(1);
  assert.deepEqual(r.result.tools.map((t) => t.name).sort(), ['ask', 'knowledge', 'status', 'verdict']);
  for (const t of r.result.tools) { assert.equal(typeof t.description, 'string'); assert.equal(t.inputSchema.type, 'object'); }
  assert.deepEqual(r.result.tools.find((t) => t.name === 'ask').inputSchema.required, ['prompt']);
  assert.equal(await s.end(), 0);
});

test('ask: "hey" is answered natively with a JSON footer line; a prompt nothing carries is the memory miss (the control)', T, async () => {
  const s = start();
  s.write(call('ask', { prompt: 'hey' }));
  s.write(call('ask', { prompt: 'qwzx vrbl plomf' }));
  s.write(call('ask', { prompt: 'what is 17 times 23' }));
  const hey = text(await s.nth(1)), miss = text(await s.nth(2)), sum = text(await s.nth(3));
  const foot = (t) => JSON.parse(t.split('\n').pop());
  const [answer] = hey.split('\n\n');
  assert.ok(answer.length > 0);
  const fh = foot(hey);
  assert.equal(fh.provenance.answer, 'native');
  assert.equal(fh.native.kind, 'greeting');
  assert.equal(typeof fh.ns, 'number');
  assert.equal(typeof fh.serverUs, 'number');
  assert.equal(fh.llm.provider, null);
  assert.equal(fh.memoryMiss, false);
  assert.deepEqual(fh.brain, { name: 'dilation', source: 'seed' });
  for (const k of ['route', 'provenance', 'native', 'exact', 'llm', 'ns', 'serverUs', 'knowledge']) assert.ok(k in fh, 'footer field ' + k);
  assert.ok(!hey.startsWith(FALLTHROUGH_HEAD));
  const fm = foot(miss);
  assert.ok(miss.startsWith(FALLTHROUGH_HEAD), 'the control is the fall through text');
  assert.equal(fm.memoryMiss, true);
  assert.equal(fm.native, null);
  assert.equal(fm.llm.provider, 'null', 'provider none passes the null provider');
  const fs2 = foot(sum);
  assert.equal(fs2.exact.answer, '391');
  assert.equal(fs2.provenance.answer, 'exact');
  assert.equal(await s.end(), 0);
  assert.ok(allJsonRpc(s));
});

test('verdict and status return what the files say (read here independently)', T, async () => {
  const s = start();
  s.write(call('verdict', { name: 'public-gsm8k' }));
  s.write(call('status', {}));
  const v = await s.nth(1), st = await s.nth(2);
  const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'bench', 'verdicts', 'public-gsm8k.json'), 'utf8'));
  assert.equal(v.result.isError, false);
  const vt = text(v);
  assert.ok(vt.includes('statement: ' + j.statement));
  assert.ok(vt.includes('at ' + j.at));
  assert.ok(vt.includes('isTheBar ' + JSON.stringify(j.isTheBar)));
  assert.ok(vt.includes('barMet ' + (j.barMet === undefined ? '(absent)' : JSON.stringify(j.barMet))));
  const md = fs.readFileSync(path.join(ROOT, 'docs', 'VISION.md'), 'utf8');
  const lad = JSON.parse(fs.readFileSync(path.join(ROOT, 'bench', 'verdicts', 'ladder.json'), 'utf8'));
  const [l1, l2] = text(st).split('\n');
  assert.equal(st.result.isError, false);
  assert.equal(l1, 'VISION ' + countLine(countVision(md)));
  assert.ok(l2.startsWith('ladder: ' + lad.line + ' (at ' + lad.at));
  assert.equal(await s.end(), 0);
});

test('knowledge with the store absent says so and is not an error', T, async () => {
  const none = path.join(TMP, 'no-store');
  fs.mkdirSync(none, { recursive: true });
  const s = start(['--knowledge-dir', none]);
  s.write(call('knowledge', { query: 'Paris' }));
  s.write(call('knowledge', { query: 'Paris', k: 0 }));
  const r = await s.nth(1), bad = await s.nth(2);
  assert.equal(r.result.isError, false);
  assert.match(text(r), /knowledge store is absent on this host/);
  assert.match(text(r), /no readable meta\.json/, 'the reason knowledgeReady() gave');
  assert.equal(bad.result.isError, true);
  assert.equal(await s.end(), 0);
});

test('knowledge with the store present returns Paris as the top answer (skipped when the store is not on this host)', { timeout: 20000, skip: fs.existsSync(STORE_META) ? false : 'bench/fixtures/wiki/store has no finished ingest on this host' }, async () => {
  const s = start();
  s.write(call('knowledge', { query: 'Paris', k: 2 }));
  const t = text(await s.nth(1));
  const lines = t.split('\n');
  assert.match(lines[0], /^knowledge tier: 2 answers and 2 facts for "Paris"/);
  assert.match(lines[2], /^- paris {2}\(score [\d.]+, article "Paris"/);
  assert.equal(lines.filter((l) => l.startsWith('- ')).length, 4, 'k answers and k facts');
  assert.equal(await s.end(), 0);
});

test('--state loads the named brain from BRAIN_STATE_DIR (the CLI path); a name not there falls back to the seed and says so', T, async () => {
  const stateDir = path.join(TMP, 'state');
  const b = seedBasic({ name: 'mcptest', ledger: 'off' });
  b.snapshot(path.join(stateDir, 'mcptest'));
  const s = start(['--state'], { BRAIN_STATE_DIR: stateDir });
  s.write(call('ask', { prompt: 'hey', brain: 'mcptest' }));
  s.write(call('ask', { prompt: 'hey', brain: 'absent-one' }));
  s.write(call('ask', { prompt: 'hey', brain: '../x' }));
  const f1 = JSON.parse(text(await s.nth(1)).split('\n').pop()), f2 = JSON.parse(text(await s.nth(2)).split('\n').pop()), r3 = await s.nth(3);
  assert.equal(f1.brain.source, 'state');
  assert.equal(f1.provenance.answer, 'native');
  assert.equal(f2.brain.source, 'seed');
  assert.match(f2.brain.why, /no brain "absent-one" in the state root/);
  assert.equal(r3.result.isError, true);
  assert.equal(await s.end(), 0);
  // the CLI flushes the ledger after an ask; so does the server
  assert.ok(fs.existsSync(path.join(stateDir, 'mcptest', 'ledger', 'ledger.jsonl')));
});

test('the bar once: node bench/mcp.mjs --out <tmp> writes a verdict of the stated shape', { timeout: 45000 }, async () => {
  const out = path.join(TMP, 'mcp-verdict.json');
  const child = spawn(process.execPath, [path.join(ROOT, 'bench', 'mcp.mjs'), '--out', out], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  CHILDREN.add(child);
  let so = '';
  child.stdout.on('data', (d) => { so += d; });
  const code = await new Promise((resolve) => child.on('exit', resolve));
  const v = JSON.parse(fs.readFileSync(out, 'utf8'));
  assert.equal(code, v.barMet ? 0 : 1);
  assert.match(so, /^BAR (?:NOT )?MET: /m);
  assert.ok(!Number.isNaN(Date.parse(v.at)));
  assert.match(v.command, /^node bench\/mcp\.mjs/);
  assert.equal(v.node, process.version);
  assert.equal(v.isTheBar, true);
  assert.equal(typeof v.barMet, 'boolean');
  assert.deepEqual(v.tools, ['ask', 'knowledge', 'status', 'verdict']);
  assert.ok(Array.isArray(v.calls) && v.calls.length >= 10);
  for (const c of v.calls) { assert.equal(typeof c.tool, 'string'); assert.equal(typeof c.ms, 'number'); assert.equal(typeof c.ok, 'boolean'); assert.equal(typeof c.firstLine, 'string'); }
  assert.equal(typeof v.malformedSurvived, 'boolean');
  assert.equal(v.exitCode, 0);
  assert.equal(v.split.heldOut, 'none');
  assert.equal(v.split.contaminated, false);
  assert.equal(typeof v.control, 'string');
  assert.ok(v.statement.length > 200);
  assert.ok(!JSON.stringify(v).includes(String.fromCharCode(0x2014)), 'no em-dash');
  // barMet is the conjunction the file states, recomputed here from its own fields; every check is present
  const c = v.checks;
  assert.deepEqual(Object.keys(c).sort(), ['capitalControlOk', 'capitalOk', 'handshakeOk', 'heyOk', 'knowledgeControlOk', 'knowledgeOk', 'listOk', 'logsOk', 'missControlOk', 'notificationSilent', 'statusOk', 'stdoutClean', 'unknownOk', 'verdictControlOk', 'verdictOk']);
  const present = v.knowledgeStore.startsWith('present');
  const capital = present ? c.capitalOk === true && c.capitalControlOk === true : c.capitalOk === null && c.capitalControlOk === null;
  assert.equal(v.barMet, c.handshakeOk && c.listOk && c.heyOk && c.verdictOk && v.malformedSurvived && v.exitCode === 0 && c.stdoutClean && c.notificationSilent && c.missControlOk && c.verdictControlOk
    && c.logsOk && c.knowledgeOk && c.statusOk && c.unknownOk && c.knowledgeControlOk && capital);
  assert.equal(v.stderrToolLogs, v.toolCalls);
  // never a number the command did not print: every number in the statement is on a line the bar printed
  const nums = v.statement.match(/\d+(?:\.\d+)*/g) || [];
  assert.ok(nums.length >= 10, 'the statement carries its numbers');
  for (const n of nums) assert.ok(so.includes(n), 'the statement number ' + n + ' was printed');
});

test('the bar\'s checks read the evidence, not an echo: a knowledge header naming "Paris" with 0 answers and a recall line naming Paris both fail', () => {
  const header = 'knowledge tier: 0 answers and 0 facts for "Paris" (what), 0 candidates, 1.000 ms\nanswers, best first:\n- (none)\nfacts recalled, best first:\n- (none)';
  assert.ok(/\bParis\b/.test(header), 'the old check passed this text');
  assert.equal(knowledgeTopIsParis(header), false);
  const real = 'knowledge tier: 2 answers and 1 facts for "Paris" (what), 5384 candidates, 34.493 ms\nanswers, best first:\n- paris  (score 28.8848, article "Paris", categories) Categories: Paris.\n- capital city  (score 13.6629, article "Paris", first) Paris is the capital.\nfacts recalled, best first:\n- [article "Paris", section, sim 1] Paris has much to offer.';
  assert.equal(knowledgeTopIsParis(real), true);
  assert.deepEqual(parseKnowledge(real).answerLines[0], { np: 'paris', title: 'Paris' });
  assert.equal(knowledgeTopIsParis(headerOnly(real)), false, 'the header alone, counts zeroed');
  assert.match(headerOnly(real), /^knowledge tier: 0 answers and 0 facts for "Paris"/);
  assert.equal(knowledgeTopIsParis(real.replace('- paris  (score', '- london  (score')), false, 'a different top answer');
  assert.equal(knowledgeTopIsParis(real.replace('2 answers', '3 answers')), false, 'a header count the lines do not carry');
  const foot = JSON.stringify({ route: 'knowledge', provenance: { answer: 'memory', tier: 'knowledge' } });
  const rome = 'from memory (knowledge tier, article "Italy"), best first:\n- [knowledge "Italy" lead sim 0.6] Rome, not Paris, is the capital.\nanswer [knowledge "Italy"]: rome\n\n' + foot;
  assert.ok(/\bparis\b/i.test(rome), 'the old capital check passed this text');
  assert.equal(capitalIsParis(rome), false);
  assert.deepEqual(answerLineOf(rome), { title: 'Italy', answer: 'rome' });
  const paris = rome.replace('answer [knowledge "Italy"]: rome', 'answer [knowledge "Capital of France"]: paris');
  assert.equal(capitalIsParis(paris), true);
  assert.equal(capitalIsParis(paris.replace('"route":"knowledge"', '"route":"direct"')), false, 'another route');
  assert.equal(capitalIsParis(paris.replace('"tier":"knowledge"', '"tier":null')), false, 'another tier');
  assert.equal(capitalIsParis('answer [knowledge "x"]: paris'), false, 'no footer: the only line is read as the footer, never as the answer');
});

test('the mutant table holds to tools/mcp.mjs: every rule matches exactly once, every mutant calls the probe, and every copy is valid JavaScript', { timeout: 30000 }, () => {
  const src = fs.readFileSync(path.join(ROOT, 'tools', 'mcp.mjs'), 'utf8');
  const count = (s, sub) => s.split(sub).length - 1;
  for (const r of transplantRules()) assert.equal(count(src, r.from), 1, 'transplant rule ' + r.from);
  assert.ok(MUTANTS.length >= 10);
  assert.equal(new Set(MUTANTS.map((m) => m.id)).size, MUTANTS.length);
  for (const m of MUTANTS) { assert.equal(count(src, m.from), 1, m.id + ' from'); assert.ok(m.to.includes('__MUTP()'), m.id + ' probe'); }
  const probe = path.join(TMP, 'probe.txt');
  const base = mutate(src, probe, null);
  assert.ok(base.startsWith('#!'), 'the shebang stays the first line');
  assert.ok(base.includes(probeHeader(probe)));
  assert.equal(count(base.replace(probeHeader(probe), ''), '__MUTP'), 0, 'outside the probe header the control copy never names the probe');
  for (const r of transplantRules()) assert.equal(count(base, r.from), 0, 'the copy no longer reads relative to itself: ' + r.from);
  for (const m of [null, ...MUTANTS]) {
    const file = path.join(TMP, 'mut-' + (m ? m.id : 'base') + '.mjs');
    fs.writeFileSync(file, mutate(src, probe, m));
    const r = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8', windowsHide: true });
    assert.equal(r.status, 0, (m ? m.id : 'baseline') + ' parses: ' + r.stderr);
  }
  assert.throws(() => mutate(src, probe, { id: 'zz', from: 'no such text anywhere', to: '__MUTP()' }), /matched 0 times/);
});

test('parseTap reads the top level results and the summary', () => {
  const t = parseTap('TAP version 13\n# Subtest: a\nok 1 - a\n  ---\n  duration_ms: 1\n  ...\nnot ok 2 - b c\nok 3 - d # SKIP no store\n# tests 3\n# pass 1\n# fail 1\n# skipped 1\n');
  assert.deepEqual(t.tests, [{ name: 'a', ok: true, skip: false }, { name: 'b c', ok: false, skip: false }, { name: 'd', ok: true, skip: true }]);
  assert.equal(t.total, 3); assert.equal(t.pass, 1); assert.equal(t.fail, 1); assert.equal(t.skipped, 1); assert.equal(t.tests.length, 3);
});
