// bench/mcp.mjs: THE BAR for tools/mcp.mjs, the brain as an MCP tool (board 32, item mcp-server; docs/VISION.md
// order 44 clause (1); his 2026-09-27 "I want the Brain to be a very important tool, even for you for further
// ambitious projects"). Author: board 32 builder.
//
// THE BAR (node bench/mcp.mjs [--out FILE], default bench/verdicts/mcp.json). It spawns `node tools/mcp.mjs`
// with piped stdio and drives it as an MCP client would: initialize, notifications/initialized, tools/list,
// tools/call ask {prompt: "hey"}, ask "What is the capital of France?" and "What is the capital of Italy?"
// (both skipped with the reason when bench/fixtures/wiki/store holds no finished ingest), knowledge {query:
// "Paris"} and {query: "qwzx vrbl plomf"}, verdict {name: "public-gsm8k"} and {name: "../ladder"}, status, a
// tool name the server does not have, one malformed line followed by a ping, then stdin end. Every call is
// timed on the client side (hrtime around the write and the answer). Model off throughout: every ask passes
// provider "none" (provider null, no socket).
//
// EVERY CHECK READS THE EVIDENCE, NOT AN ECHO (the fix pass: the first knowledge check matched the subject the
// header echoes and passed on 0 answers). The capital check reads the ask's own answer line ("answer
// [knowledge <article>]: paris"), never a recall line, and requires the knowledge route and tier. The knowledge
// check parses the answer lines under "answers, best first:" and requires the header's count to equal them and
// the top one to be "paris" from the article "Paris". The verdict and status checks compare the tool's text
// with the files read here independently (bench/verdicts/public-gsm8k.json, docs/VISION.md through
// tools/vision-count.mjs, bench/verdicts/ladder.json), so no number of another item is typed into this file.
//
// THE CONTROLS (a check that has only seen passing rows is not a check), each run beside the check it guards:
// ask "qwzx vrbl plomf" must be the memory miss (FALLTHROUGH_HEAD), so "hey answered natively" can fail; ask
// "What is the capital of Italy?" must reach the same knowledge route with an answer line that is not paris,
// so the capital check can fail on a live knowledge answer; knowledge "qwzx vrbl plomf" must fail the Paris
// check, and so must its header, which echoes its own subject; verdict "../ladder" must be isError true. Every
// stdout line must parse as JSON-RPC 2.0 (the transport's one rule), the one notification must get no answer,
// and every tool call must leave its one stderr log line.
//
// barMet = handshake ok AND tools/list has the four AND ask hey answered AND verdict ok AND malformedSurvived
// AND exitCode 0 (the item text), and (stricter) stdout clean, the notification silent, the stderr log lines,
// knowledge, status, the capital (when the store is on this host) and every control behaving. Every number the
// verdict's statement carries is printed on a line above it.
//
// THE MUTANT PASS (node bench/mcp.mjs --mutants [--scratch DIR] [--timeout MS] [--keep], writes
// bench/verdicts/mcp-mutants.json): the tree's rules from bench/mutants.mjs, at the size of one file. tools/mcp.mjs
// is transplanted into a scratch directory (its relative imports and its ROOT pointed back at the tree) with a
// probe header; test/mcp.test.mjs runs against the copy through BRAIN_MCP_TEST_SERVER. The unmutated copy runs
// first as the BASELINE (every test must pass and the probe must stay silent). Each mutant then applies ONE
// defect whose replacement calls __MUTP(), the probe. A mutant is KILLED only when a test that passed at
// baseline fails AND the probe proves the mutated code ran; no probe line is NOT EXECUTED, whatever the tests
// said; a wall clock timeout counts as a kill only when the baseline finished inside half that clock.
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { FALLTHROUGH_HEAD } from '../act/prompt.mjs';
import { countVision, countLine } from '../tools/vision-count.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const FOUR = Object.freeze(['ask', 'knowledge', 'status', 'verdict']);
export const STORE_META = path.join(ROOT, 'bench', 'fixtures', 'wiki', 'store', 'meta.json');
export const SERVER = path.join(ROOT, 'tools', 'mcp.mjs');
export const SUITE = path.join(ROOT, 'test', 'mcp.test.mjs');
const CALL_MS = 30000;

/** A line client over a child's stdio. Every stdout line is kept; a line that is not JSON-RPC 2.0 is counted. */
export class Client {
  constructor(child) {
    this.child = child;
    this.nextId = 1;
    this.pending = new Map();
    this.unsolicited = [];
    this.nonJson = [];
    this.lines = 0;
    this.stderr = '';
    this.waiters = [];
    let buf = '';
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (d) => {
      buf += d;
      let i;
      while ((i = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, i); buf = buf.slice(i + 1); this.onLine(line); }
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (d) => { this.stderr += d; });
    this.exited = new Promise((resolve) => child.on('exit', (code, signal) => resolve({ code, signal })));
  }
  onLine(line) {
    this.lines++;
    let m;
    try { m = JSON.parse(line); } catch { this.nonJson.push(line.slice(0, 200)); return; }
    if (!m || typeof m !== 'object' || m.jsonrpc !== '2.0') { this.nonJson.push(line.slice(0, 200)); return; }
    if (m.id !== null && m.id !== undefined && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); p(m); return; }
    this.unsolicited.push(m);
    for (const w of this.waiters.slice()) if (w.pred(m)) { this.waiters.splice(this.waiters.indexOf(w), 1); w.resolve(m); }
  }
  send(obj) { this.child.stdin.write(JSON.stringify(obj) + '\n'); }
  raw(line) { this.child.stdin.write(line + '\n'); }
  /** One request; resolves {msg, ms} or {msg: null, ms, timeout: true}. */
  request(method, params, timeoutMs = CALL_MS) {
    const id = this.nextId++;
    const t0 = process.hrtime.bigint();
    return new Promise((resolve) => {
      const timer = setTimeout(() => { this.pending.delete(id); resolve({ msg: null, ms: Number(process.hrtime.bigint() - t0) / 1e6, timeout: true }); }, timeoutMs);
      this.pending.set(id, (msg) => { clearTimeout(timer); resolve({ msg, ms: Number(process.hrtime.bigint() - t0) / 1e6 }); });
      this.send({ jsonrpc: '2.0', id, method, ...(params === undefined ? {} : { params }) });
    });
  }
  notify(method, params) { this.send({ jsonrpc: '2.0', method, ...(params === undefined ? {} : { params }) }); }
  /** Wait for an unsolicited message the predicate accepts (already arrived or arriving). */
  waitFor(pred, timeoutMs = 10000) {
    const have = this.unsolicited.find(pred);
    if (have) return Promise.resolve(have);
    return new Promise((resolve) => {
      const w = { pred, resolve: (m) => { clearTimeout(timer); resolve(m); } };
      const timer = setTimeout(() => { this.waiters.splice(this.waiters.indexOf(w), 1); resolve(null); }, timeoutMs);
      this.waiters.push(w);
    });
  }
  /** End stdin and wait for the exit; {code, signal, ms} or a kill after timeoutMs. */
  async end(timeoutMs = 20000) {
    const t0 = process.hrtime.bigint();
    this.child.stdin.end();
    const timer = setTimeout(() => { try { this.child.kill(); } catch { /* gone */ } }, timeoutMs);
    const r = await this.exited;
    clearTimeout(timer);
    return { ...r, ms: Number(process.hrtime.bigint() - t0) / 1e6 };
  }
}

/** Spawn the server from the tree root. */
export function spawnServer(args = [], env = process.env) {
  return spawn(process.execPath, ['--max-old-space-size=1024', SERVER, ...args], { cwd: ROOT, env, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
}

const textOf = (msg) => (msg && msg.result && Array.isArray(msg.result.content) && msg.result.content[0] ? String(msg.result.content[0].text) : '');
const first = (s) => String(s).split('\n')[0].slice(0, 200);
const r3 = (x) => Math.round(x * 1000) / 1000;
/** The server's own rendering of a verdict field (tools/mcp.mjs fmt), for comparing its text with the file. */
const fmt = (v) => (v === undefined ? '(absent)' : typeof v === 'string' ? v : JSON.stringify(v));
const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };

/** The footer: the last line of an ask's text, one JSON object. */
export function footerOf(text) { const lines = String(text).split('\n'); try { return JSON.parse(lines[lines.length - 1]); } catch { return null; } }
/** An ask's text without its footer line. */
export function bodyOf(text) { return String(text).split('\n').slice(0, -1).join('\n'); }
/** The knowledge tier's answer line of an ask, {title, answer}, read from the body; a recall line never counts. */
export function answerLineOf(text) {
  const m = /^answer \[knowledge "([^"\n]*)"\]: (.+)$/m.exec(bodyOf(text));
  return m ? { title: m[1], answer: m[2].trim() } : null;
}
/** The capital check: the answer line says paris and the footer says the knowledge route and tier reached it. */
export function capitalIsParis(text) {
  const a = answerLineOf(text), f = footerOf(text);
  return Boolean(a && /^paris$/i.test(a.answer) && f && f.route === 'knowledge' && f.provenance && f.provenance.tier === 'knowledge');
}
/**
 * The knowledge tool's text parsed: the header's counts and the lines under its two section heads.
 * @returns {{answers: number, facts: number, subject: string, kind: string, candidates: number, answerLines: Array<{np: string, title: string}>, factLines: number} | null}
 */
export function parseKnowledge(text) {
  const lines = String(text).split('\n');
  const h = /^knowledge tier: (\d+) answers and (\d+) facts for "(.*)" \((\w+)\), (\d+) candidates, ([\d.]+) ms$/.exec(lines[0] || '');
  if (!h) return null;
  const ai = lines.indexOf('answers, best first:'), fi = lines.indexOf('facts recalled, best first:');
  if (ai < 0 || fi < ai) return null;
  const answerLines = [];
  for (const l of lines.slice(ai + 1, fi)) { const m = /^- (.+?) {2}\(score [^,]+, article "(.*?)", [^)]*\) /.exec(l); if (m) answerLines.push({ np: m[1], title: m[2] }); }
  const factLines = lines.slice(fi + 1).filter((l) => l.startsWith('- [article "')).length;
  return { answers: Number(h[1]), facts: Number(h[2]), subject: h[3], kind: h[4], candidates: Number(h[5]), answerLines, factLines };
}
/** The knowledge check: at least one answer line, the header's counts equal to the lines, the top answer "paris" from the article "Paris". The subject the header echoes counts for nothing. */
export function knowledgeTopIsParis(text) {
  const k = parseKnowledge(text);
  return Boolean(k && k.answers >= 1 && k.answerLines.length === k.answers && k.factLines === k.facts && /^paris$/i.test(k.answerLines[0].np) && k.answerLines[0].title === 'Paris');
}
/** The header line alone, its counts set to 0 and both sections empty: the tool's text for a search that found nothing, which still echoes the subject. */
export function headerOnly(text) { return String(text).split('\n')[0].replace(/^knowledge tier: \d+ answers and \d+ facts/, 'knowledge tier: 0 answers and 0 facts') + '\nanswers, best first:\n- (none)\nfacts recalled, best first:\n- (none)'; }

export async function runBar() {
  const started = Date.now();
  const client = new Client(spawnServer());
  const calls = [];
  const rec = (tool, r, ok, extra = {}, detail = null) => {
    const row = { tool, ms: r3(r.ms), ok: Boolean(ok), firstLine: r.msg ? (r.msg.error ? 'error ' + r.msg.error.code + ': ' + r.msg.error.message : first(textOf(r.msg) || JSON.stringify(r.msg.result))) : (r.timeout ? 'TIMEOUT' : ''), ...extra };
    if (detail) row.detail = detail;
    calls.push(row);
    console.log((row.ok ? 'ok   ' : 'FAIL ') + tool.padEnd(30) + String(row.ms).padStart(10) + ' ms  ' + row.firstLine.slice(0, 110));
    if (detail) console.log('     ' + detail);
    return row;
  };
  const tool = (name, args) => client.request('tools/call', { name, arguments: args });
  const isResult = (r) => Boolean(r.msg && r.msg.result && r.msg.result.isError === false);

  // the handshake
  const init = await client.request('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'bench-mcp', version: '1' } });
  const ir = init.msg && init.msg.result;
  const handshakeOk = Boolean(ir && ir.protocolVersion === '2025-06-18' && ir.capabilities && ir.capabilities.tools && ir.serverInfo && ir.serverInfo.name === 'brain' && typeof ir.serverInfo.version === 'string');
  rec('initialize', init, handshakeOk, {}, 'protocolVersion ' + (ir ? ir.protocolVersion : null) + ', serverInfo ' + (ir && ir.serverInfo ? ir.serverInfo.name + ' ' + ir.serverInfo.version : null) + ', capabilities.tools ' + Boolean(ir && ir.capabilities && ir.capabilities.tools));
  client.notify('notifications/initialized');
  const list = await client.request('tools/list');
  const tools = list.msg && list.msg.result && Array.isArray(list.msg.result.tools) ? list.msg.result.tools : [];
  const names = tools.map((t) => t.name).sort();
  const listOk = JSON.stringify(names) === JSON.stringify(FOUR) && tools.every((t) => typeof t.description === 'string' && t.inputSchema && t.inputSchema.type === 'object');
  rec('tools/list', list, listOk, { names }, 'tools ' + names.join(', ') + '; each with a description and an object inputSchema ' + listOk);

  // ask hey: answered natively, not a memory miss text
  const hey = await tool('ask', { prompt: 'hey' });
  const heyText = textOf(hey.msg), heyFoot = footerOf(heyText);
  const heyOk = Boolean(isResult(hey) && heyFoot && heyFoot.native && heyFoot.provenance && heyFoot.provenance.answer === 'native'
    && !heyText.startsWith(FALLTHROUGH_HEAD) && !heyText.startsWith('nothing in memory matches') && heyFoot.memoryMiss === false && heyFoot.llm && heyFoot.llm.provider === null);
  const heyRow = rec('ask hey', hey, heyOk, { route: heyFoot && heyFoot.route, provenance: heyFoot && heyFoot.provenance && heyFoot.provenance.answer, ns: heyFoot && heyFoot.ns, serverUs: heyFoot && heyFoot.serverUs },
    'footer: route ' + (heyFoot && heyFoot.route) + ', provenance ' + (heyFoot && heyFoot.provenance && heyFoot.provenance.answer) + ', native kind ' + (heyFoot && heyFoot.native && heyFoot.native.kind) + ', ns ' + (heyFoot && heyFoot.ns) + ', serverUs ' + (heyFoot && heyFoot.serverUs) + ', llm.provider ' + (heyFoot && heyFoot.llm && heyFoot.llm.provider) + ', memoryMiss ' + (heyFoot && heyFoot.memoryMiss));

  // the control for it: a prompt nothing carries is the memory miss
  const miss = await tool('ask', { prompt: 'qwzx vrbl plomf' });
  const missText = textOf(miss.msg), missFoot = footerOf(missText);
  const missControlOk = Boolean(isResult(miss) && missText.startsWith(FALLTHROUGH_HEAD) && missFoot && missFoot.native === null && missFoot.memoryMiss === true);
  rec('ask miss (control)', miss, missControlOk, { provenance: missFoot && missFoot.provenance && missFoot.provenance.answer, memoryMiss: missFoot && missFoot.memoryMiss },
    'starts with FALLTHROUGH_HEAD ' + missText.startsWith(FALLTHROUGH_HEAD) + ', footer memoryMiss ' + (missFoot && missFoot.memoryMiss) + ', native ' + (missFoot && JSON.stringify(missFoot.native)));

  // the capital of France from the knowledge tier, and its control, when the store is on this host
  const storePresent = fs.existsSync(STORE_META);
  let capital, capitalControl, capitalOk = null, capitalControlOk = null;
  if (storePresent) {
    const r = await tool('ask', { prompt: 'What is the capital of France?' });
    const t = textOf(r.msg), f = footerOf(t), a = answerLineOf(t);
    capitalOk = isResult(r) && capitalIsParis(t);
    capital = rec('ask capital of France', r, capitalOk, { route: f && f.route, tier: f && f.provenance && f.provenance.tier, provenance: f && f.provenance && f.provenance.answer, answer: a && a.answer, article: a && a.title, serverUs: f && f.serverUs },
      'answer line: ' + (a ? a.answer + ' (article "' + a.title + '")' : 'none') + '; footer route ' + (f && f.route) + ', tier ' + (f && f.provenance && f.provenance.tier) + ', provenance ' + (f && f.provenance && f.provenance.answer));
    const c = await tool('ask', { prompt: 'What is the capital of Italy?' });
    const ct = textOf(c.msg), cf = footerOf(ct), ca = answerLineOf(ct);
    capitalControlOk = Boolean(isResult(c) && ca && cf && cf.route === 'knowledge' && !capitalIsParis(ct));
    capitalControl = rec('ask capital of Italy (control)', c, capitalControlOk, { route: cf && cf.route, answer: ca && ca.answer, article: ca && ca.title },
      'answer line: ' + (ca ? ca.answer + ' (article "' + ca.title + '")' : 'none') + '; footer route ' + (cf && cf.route) + '; the paris check reads it as ' + capitalIsParis(ct));
  } else {
    const why = 'bench/fixtures/wiki/store holds no meta.json on this host (no finished ingest)';
    capital = { tool: 'ask capital of France', ms: 0, ok: true, skipped: true, why, firstLine: '' };
    capitalControl = { tool: 'ask capital of Italy (control)', ms: 0, ok: true, skipped: true, why, firstLine: '' };
    calls.push(capital, capitalControl);
    console.log('skip ask capital of France and its control: ' + why);
  }

  // knowledge Paris: the top answer, parsed; and the control, whose header echoes its own subject
  const kn = await tool('knowledge', { query: 'Paris', k: 3 });
  const knText = textOf(kn.msg), kp = parseKnowledge(knText);
  const knowledgeOk = isResult(kn) && (storePresent ? knowledgeTopIsParis(knText) : knText.startsWith('the knowledge store is absent on this host'));
  const knRow = rec('knowledge Paris', kn, knowledgeOk, { storePresent, answers: kp ? kp.answers : null, top: kp && kp.answerLines[0] ? kp.answerLines[0] : null },
    kp ? 'top answer: ' + (kp.answerLines[0] ? kp.answerLines[0].np + ' (article "' + kp.answerLines[0].title + '")' : 'none') + '; answer lines ' + kp.answerLines.length + ' of the header\'s ' + kp.answers + ', fact lines ' + kp.factLines + ' of ' + kp.facts : (storePresent ? 'not parsed: ' : 'store absent: ') + first(knText));
  const kc = await tool('knowledge', { query: 'qwzx vrbl plomf', k: 3 });
  const kcText = textOf(kc.msg), kcp = parseKnowledge(kcText);
  const knowledgeControlOk = isResult(kc) && !knowledgeTopIsParis(kcText) && (storePresent ? Boolean(kp) && !knowledgeTopIsParis(headerOnly(knText)) : true);
  const kcRow = rec('knowledge qwzx (control)', kc, knowledgeControlOk, { answers: kcp ? kcp.answers : null },
    'the Paris check reads it as ' + knowledgeTopIsParis(kcText) + ' (answer lines ' + (kcp ? kcp.answerLines.length : null) + '); on the Paris header alone, which echoes "Paris", it reads ' + knowledgeTopIsParis(headerOnly(knText)));

  // verdict: the GSM8K rung's statement, compared with the file read here
  const v = await tool('verdict', { name: 'public-gsm8k' });
  const vText = textOf(v.msg);
  const vFile = readJson(path.join(ROOT, 'bench', 'verdicts', 'public-gsm8k.json'));
  const vStatement = vFile && typeof vFile.statement === 'string' && vFile.statement.length > 0 ? vFile.statement : null;
  const verdictOk = Boolean(isResult(v) && vStatement && vText.split('\n')[0] === 'verdict public-gsm8k: barMet ' + fmt(vFile.barMet) + ', isTheBar ' + fmt(vFile.isTheBar) + ', at ' + fmt(vFile.at)
    && vText.includes('\ncommand: ' + fmt(vFile.command) + '\n') && vText.endsWith('\nstatement: ' + vStatement));
  const vRow = rec('verdict public-gsm8k', v, verdictOk, { statementChars: vStatement ? vStatement.length : null },
    'the text carries bench/verdicts/public-gsm8k.json read here: its first line, command and statement (' + (vStatement ? vStatement.length : 0) + ' chars) ' + verdictOk);
  const vBad = await tool('verdict', { name: '../ladder' });
  const verdictControlOk = Boolean(vBad.msg && vBad.msg.result && vBad.msg.result.isError === true);
  rec('verdict ../ladder (control)', vBad, verdictControlOk);

  // status: the vision line and the ladder line, compared with the files read here
  const st = await tool('status', {});
  const stText = textOf(st.msg);
  let visionLine = null, ladderLine = null;
  try { visionLine = 'VISION ' + countLine(countVision(fs.readFileSync(path.join(ROOT, 'docs', 'VISION.md'), 'utf8'))); } catch { visionLine = null; }
  const lad = readJson(path.join(ROOT, 'bench', 'verdicts', 'ladder.json'));
  if (lad && typeof lad.line === 'string') ladderLine = 'ladder: ' + fmt(lad.line) + ' (at ' + fmt(lad.at) + ', barMet ' + fmt(lad.barMet) + ')';
  const [s1, s2] = stText.split('\n');
  const statusOk = Boolean(isResult(st) && visionLine && ladderLine && s1 === visionLine && s2 === ladderLine);
  rec('status', st, statusOk, {}, 'line 1 equals tools/vision-count.mjs on docs/VISION.md ' + (Boolean(visionLine) && s1 === visionLine) + '; line 2 equals bench/verdicts/ladder.json line, at and barMet ' + (Boolean(ladderLine) && s2 === ladderLine));

  const unk = await tool('no-such-tool', {});
  const unknownOk = Boolean(unk.msg && ((unk.msg.error && unk.msg.error.code === -32602) || (unk.msg.result && unk.msg.result.isError === true)));
  rec('unknown tool', unk, unknownOk);

  // one malformed line, then a ping
  const t0 = process.hrtime.bigint();
  client.raw('{"jsonrpc": "2.0", "id": 99, "method": this is not json');
  const parseErr = await client.waitFor((m) => m.id === null && m.error && m.error.code === -32700, 10000);
  const malformed = { msg: parseErr, ms: Number(process.hrtime.bigint() - t0) / 1e6, timeout: !parseErr };
  rec('malformed line', malformed, Boolean(parseErr));
  const ping = await client.request('ping');
  const pingOk = Boolean(ping.msg && ping.msg.result && typeof ping.msg.result === 'object' && Object.keys(ping.msg.result).length === 0);
  rec('ping after malformed', ping, pingOk);
  const malformedSurvived = Boolean(parseErr) && pingOk;

  const ended = await client.end();
  const exitCode = ended.code;
  console.log('stdin end: exit code ' + exitCode + ' in ' + r3(ended.ms) + ' ms');
  const stdoutClean = client.nonJson.length === 0;
  const notificationAnswers = client.unsolicited.filter((m) => !(m.id === null && m.error && m.error.code === -32700)).length;
  const notificationSilent = notificationAnswers === 0;
  const toolLogs = (client.stderr.match(/^mcp tool=\S+ ms=\d+(?:\.\d+)? isError=(?:true|false)$/gm) || []).length;
  // a tools/call on one of the four with object arguments is a tool call the server logs; the unknown tool is not
  const toolCalls = calls.filter((c) => !c.skipped && /^(ask|knowledge|verdict|status)\b/.test(c.tool)).length;
  const logsOk = toolLogs === toolCalls && toolCalls > 0;
  console.log('stdout: ' + client.lines + ' lines, ' + client.nonJson.length + ' not JSON-RPC 2.0; answers to the notification: ' + notificationAnswers + '; stderr tool log lines: ' + toolLogs + ' of ' + toolCalls + ' tool calls');
  const controlsOk = missControlOk && verdictControlOk && knowledgeControlOk && capitalControlOk !== false;
  const checks = { handshakeOk, listOk, heyOk, verdictOk, statusOk, unknownOk, knowledgeOk, capitalOk, missControlOk, capitalControlOk, knowledgeControlOk, verdictControlOk, stdoutClean, notificationSilent, logsOk };
  const barMet = handshakeOk && listOk && heyOk && verdictOk && malformedSurvived && exitCode === 0
    && stdoutClean && notificationSilent && logsOk && knowledgeOk && statusOk && unknownOk && capitalOk !== false && controlsOk;
  return {
    barMet, checks, malformedSurvived, exitCode, controlsOk, storePresent, capital, capitalControl, heyRow, knRow, kcRow, vRow, knowledge: kp, knowledgeControl: kcp,
    names, calls, toolLogs, toolCalls, notificationAnswers, stdoutLines: client.lines, nonJson: client.nonJson,
    protocolVersion: ir ? ir.protocolVersion : null, serverInfo: ir ? ir.serverInfo : null, wallMs: Date.now() - started,
  };
}

/** The verdict's one paragraph, built only from values the run printed above it. */
export function statementOf(r) {
  const c = r.checks, cap = r.capital || {}, capC = r.capitalControl || {}, kp = r.knowledge, top = kp && kp.answerLines[0];
  const passed = r.calls.filter((x) => x.ok && !x.skipped).length, ran = r.calls.filter((x) => !x.skipped).length;
  return 'A Claude session (or any MCP client) can now call the brain as a tool: tools/mcp.mjs is a zero dependency stdio MCP server, and this bar drove it as a client with no model anywhere (every ask passed provider none). '
    + 'The handshake ' + (c.handshakeOk ? 'negotiated protocol ' + r.protocolVersion + ' with server "' + r.serverInfo.name + '" ' + r.serverInfo.version : 'FAILED') + '; tools/list named ' + r.names.join(', ') + '. '
    + '"hey" was ' + (c.heyOk ? 'answered natively by the conversation region in ' + r.heyRow.ms + ' ms round trip (the footer says ' + r.heyRow.ns + ' ns in the region)' : 'NOT answered natively') + ', and the control prompt "qwzx vrbl plomf" ' + (c.missControlOk ? 'came back as the memory miss, so that check can fail' : 'did NOT come back as the memory miss') + '. '
    + (cap.skipped ? 'The capital of France and its control were skipped: ' + cap.why + '. '
      : '"What is the capital of France?" ' + (c.capitalOk ? 'answered ' + cap.answer + ' on its own answer line (article "' + cap.article + '"), by route ' + cap.route + ' from tier ' + cap.tier + ', in ' + cap.ms + ' ms' : 'did NOT answer paris on its answer line by the knowledge route')
        + ', and the control "What is the capital of Italy?" ' + (c.capitalControlOk ? 'answered ' + capC.answer + ' by the same route, so the paris check can fail on a live knowledge answer. ' : 'did NOT behave as a control. '))
    + (r.storePresent
      ? 'knowledge "Paris" ' + (c.knowledgeOk ? 'put ' + top.np + ' from the article "' + top.title + '" first of ' + kp.answers + ' answers' : 'did NOT put paris from the article "Paris" first') + '; its control "qwzx vrbl plomf" ' + (c.knowledgeControlOk ? 'fails that check, and so does the Paris header alone, which echoes the subject' : 'did NOT fail that check') + '. '
      : 'knowledge ' + (c.knowledgeOk ? 'said plainly that the store is absent on this host' : 'did NOT say the store is absent') + '. ')
    + 'The verdict tool ' + (c.verdictOk ? 'returned bench/verdicts/public-gsm8k.json as the file reads, its statement verbatim (' + r.vRow.statementChars + ' chars)' : 'did NOT return bench/verdicts/public-gsm8k.json as the file reads') + ' and ' + (c.verdictControlOk ? 'refused the name "../ladder"' : 'did NOT refuse "../ladder"') + '; status ' + (c.statusOk ? 'printed the vision count and the ladder line exactly as the files give them' : 'FAILED') + '; an unknown tool ' + (c.unknownOk ? 'was refused' : 'was NOT refused') + '. '
    + 'A malformed line ' + (r.malformedSurvived ? 'got -32700 and the next ping was answered' : 'broke the server') + '; stdout carried ' + r.stdoutLines + ' lines, ' + r.nonJson.length + ' of them not JSON-RPC; the notification got ' + r.notificationAnswers + ' answers; ' + r.toolLogs + ' of ' + r.toolCalls + ' tool calls left their stderr log line; closing stdin exited with code ' + r.exitCode + '. '
    + passed + ' of ' + ran + ' calls behaved. barMet is ' + r.barMet + '.';
}

// ------------------------------------------------------------------------------------------------ the mutant pass
/** The transplant: tools/mcp.mjs moved into a scratch directory still reads the tree. Each `from` must occur exactly once. */
export function transplantRules() {
  const url = (...p) => JSON.stringify(pathToFileURL(path.join(ROOT, ...p)).href);
  return [
    { from: "const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');", to: 'const ROOT = ' + JSON.stringify(ROOT) + ';' },
    { from: "import('../act/prompt.mjs')", to: 'import(' + url('act', 'prompt.mjs') + ')' },
    { from: "import('../cli/state.mjs')", to: 'import(' + url('cli', 'state.mjs') + ')' },
    { from: "import('../seeds/basic.mjs')", to: 'import(' + url('seeds', 'basic.mjs') + ')' },
    { from: "import('./vision-count.mjs')", to: 'import(' + url('tools', 'vision-count.mjs') + ')' },
  ];
}
/** One defect each; every replacement calls the probe __MUTP() on the path it breaks. */
export const MUTANTS = Object.freeze([
  { id: 'm01', what: 'a notification is answered', from: 'if (!hasId) { stats.notifications++; return; }', to: "if (!hasId) { __MUTP(); stats.notifications++; return send({ jsonrpc: '2.0', id: null, result: {} }); }" },
  { id: 'm02', what: 'a line that is not JSON answers -32600, not -32700', from: 'catch { return error(null, CODES.parse,', to: 'catch { __MUTP(); return error(null, CODES.invalidRequest,' },
  { id: 'm03', what: 'the startup line goes to stdout', from: "process.stderr.write('mcp brain ' + VERSION", to: "__MUTP(); stdoutWrite('mcp brain ' + VERSION" },
  { id: 'm04', what: 'stdin end exits 1', from: "stdoutWrite('', () => process.exit(0))", to: "stdoutWrite('', () => { __MUTP(); process.exit(1); })" },
  { id: 'm05', what: 'the per call stderr log line is dropped', from: "log('mcp tool=' + name + ' ms=' + ms.toFixed(3) + ' isError=' + Boolean(r.isError));", to: '__MUTP();' },
  { id: 'm06', what: 'an unknown tool is not refused with -32602', from: '|| !BY_NAME.has(name)) return error(', to: '|| (__MUTP(), false)) return error(' },
  { id: 'm07', what: 'a message that is not an object is not refused', from: 'if (!isObj(m)) return error(', to: 'if ((__MUTP(), false)) return error(' },
  { id: 'm08', what: 'arguments that are not an object are not refused', from: 'if (!isObj(args)) return error(', to: 'if ((__MUTP(), false)) return error(' },
  { id: 'm09', what: 'the footer never flags a memory miss', from: "memoryMiss: text.startsWith(M.FALLTHROUGH_HEAD) || text.startsWith('nothing in memory matches'),", to: 'memoryMiss: (__MUTP(), false),' },
  { id: 'm10', what: 'the knowledge tool drops its answers', from: 'const answers = (res.answers || []).slice(0, k);', to: 'const answers = (__MUTP(), []).slice(0, k);' },
  { id: 'm11', what: 'the verdict tool prints the command as the statement', from: "'statement: ' + fmt(j.statement)", to: "'statement: ' + (__MUTP(), fmt(j.command))" },
  { id: 'm12', what: 'the status ladder line prints the wrong field', from: "'ladder: ' + fmt(j.line)", to: "'ladder: ' + (__MUTP(), fmt(j.command))" },
  { id: 'm13', what: '--state is ignored', from: 'const useState = Boolean(o.state);', to: 'const useState = (__MUTP(), false);' },
  { id: 'm14', what: 'initialize always answers LATEST', from: 'PROTOCOL_VERSIONS.includes(m.params.protocolVersion) ? m.params.protocolVersion : LATEST', to: '(__MUTP(), false) ? m.params.protocolVersion : LATEST' },
  { id: 'm15', what: 'a blank line is answered', from: 'if (!s.trim()) return;', to: "if (!s.trim()) { __MUTP(); return error(null, CODES.parse, 'Parse error: blank'); }" },
  { id: 'm16', what: 'the verdict name is not checked', from: '|| !VERDICT_RE.test(name)) return fail(', to: '|| (__MUTP(), false)) return fail(' },
]);
const count = (s, sub) => s.split(sub).length - 1;
/** The probe header, placed after the shebang: the first __MUTP() call in a process appends its pid to probeFile. */
export function probeHeader(probeFile) {
  return "import { appendFileSync as __mutAppend } from 'node:fs';\nlet __mutHit = false;\n"
    + 'function __MUTP() { if (__mutHit) return; __mutHit = true; try { __mutAppend(' + JSON.stringify(probeFile) + ", process.pid + '\\n'); } catch { /* the probe dir is gone */ } }\n";
}
/** The source of one copy: the transplant, the probe header and at most one mutant. Throws when a rule does not match exactly once. */
export function mutate(src, probeFile, mutant = null) {
  let out = src;
  for (const r of transplantRules()) {
    if (count(out, r.from) !== 1) throw new Error('transplant rule matched ' + count(out, r.from) + ' times: ' + r.from);
    out = out.replace(r.from, () => r.to);
  }
  if (mutant) {
    if (count(out, mutant.from) !== 1) throw new Error(mutant.id + ' matched ' + count(out, mutant.from) + ' times: ' + mutant.from);
    if (!mutant.to.includes('__MUTP()')) throw new Error(mutant.id + ' replacement has no probe call');
    out = out.replace(mutant.from, () => mutant.to);
  }
  const nl = out.indexOf('\n');
  return out.startsWith('#!') ? out.slice(0, nl + 1) + probeHeader(probeFile) + out.slice(nl + 1) : probeHeader(probeFile) + out;
}
/** The top level results of node --test --test-reporter=tap: tests [{name, ok, skip}] and the summary counts (total, pass, fail, cancelled, skipped, todo). */
export function parseTap(out) {
  const tests = [];
  const sum = {};
  for (const line of String(out).split(/\r?\n/)) {
    const m = /^(not ok|ok) \d+ - (.*?)(?: # (SKIP|TODO)\b.*)?$/.exec(line);
    if (m) { tests.push({ name: m[2], ok: m[1] === 'ok', skip: m[3] === 'SKIP' }); continue; }
    const s = /^# (tests|suites|pass|fail|cancelled|skipped|todo) (\d+)$/.exec(line);
    if (s) sum[s[1] === 'tests' ? 'total' : s[1]] = Number(s[2]);
  }
  return { ...sum, tests };
}
function killTree(child) {
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
  else { try { child.kill('SIGKILL'); } catch { /* gone */ } }
}
/** test/mcp.test.mjs against one server file, under a wall clock. */
function runSuite(serverFile, timeoutMs) {
  const t0 = process.hrtime.bigint();
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['--test', '--test-reporter=tap', SUITE], { cwd: ROOT, env: { ...process.env, BRAIN_MCP_TEST_SERVER: serverFile }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    let so = '', timedOut = false;
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (d) => { so += d; });
    child.stderr.on('data', () => { /* drained */ });
    const timer = setTimeout(() => { timedOut = true; killTree(child); }, timeoutMs);
    child.on('exit', (code) => { clearTimeout(timer); resolve({ code, timedOut, ms: r3(Number(process.hrtime.bigint() - t0) / 1e6), tap: parseTap(so) }); });
  });
}
const probeLines = (f) => { try { return fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).length; } catch { return 0; } };

export async function runMutants({ scratch = null, timeoutMs = 120000, keep = false, only = null } = {}) {
  const base = scratch ? path.resolve(scratch) : os.tmpdir();
  fs.mkdirSync(base, { recursive: true });
  const dir = fs.mkdtempSync(path.join(base, 'mcp-mutants-'));
  const src = fs.readFileSync(SERVER, 'utf8');
  try {
    // the baseline: the unmutated transplant, the probe never called
    const baseFile = path.join(dir, 'baseline', 'mcp.mjs'), baseProbe = path.join(dir, 'baseline', 'probe.txt');
    fs.mkdirSync(path.dirname(baseFile), { recursive: true });
    fs.writeFileSync(baseFile, mutate(src, baseProbe, null));
    const b = await runSuite(baseFile, timeoutMs);
    const passedAtBase = new Set(b.tap.tests.filter((t) => t.ok && !t.skip).map((t) => t.name));
    const baseProbeLines = probeLines(baseProbe);
    const baselineOk = b.code === 0 && !b.timedOut && b.tap.tests.length > 0 && b.tap.fail === 0 && passedAtBase.size === b.tap.tests.filter((t) => !t.skip).length && baseProbeLines === 0;
    console.log('baseline (the unmutated transplant): ' + passedAtBase.size + ' of ' + b.tap.tests.length + ' tests pass, ' + (b.tap.skipped ?? 0) + ' skipped, exit ' + b.code + ', ' + b.ms + ' ms, probe lines ' + baseProbeLines);
    const clockLegal = b.ms <= timeoutMs / 2;
    const rows = [];
    for (const m of MUTANTS) {
      if (only && !only.includes(m.id)) continue;
      const file = path.join(dir, m.id, 'mcp.mjs'), probe = path.join(dir, m.id, 'probe.txt');
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, mutate(src, probe, m));
      const r = await runSuite(file, timeoutMs);
      const lines = probeLines(probe);
      const failedNow = new Set(r.tap.tests.filter((t) => !t.ok).map((t) => t.name));
      const seen = new Set(r.tap.tests.map((t) => t.name));
      // a test that passed at baseline and failed, or never reported because the run was cut, is a kill signal
      const killedBy = [...passedAtBase].filter((n) => failedNow.has(n) || (r.timedOut && !seen.has(n)));
      const executed = lines > 0;
      const killed = executed && (r.timedOut ? clockLegal : killedBy.length > 0);
      const status = !executed ? 'not executed' : killed ? 'killed' : 'survived';
      const row = { id: m.id, what: m.what, status, executed, probeLines: lines, testsFailed: failedNow.size, testsReported: r.tap.tests.length, killedBy, timedOut: r.timedOut, ms: r.ms, exit: r.code };
      rows.push(row);
      console.log(m.id + ' ' + status.padEnd(13) + ' probe lines ' + lines + ', ' + failedNow.size + ' of ' + r.tap.tests.length + ' tests failed' + (r.timedOut ? ', WALL CLOCK' : '') + ', ' + r.ms + ' ms  (' + m.what + ')' + (killedBy[0] ? '  first: ' + killedBy[0].slice(0, 60) : ''));
    }
    const tally = { total: rows.length, executed: rows.filter((x) => x.executed).length, killed: rows.filter((x) => x.status === 'killed').length, survived: rows.filter((x) => x.status === 'survived').length, notExecuted: rows.filter((x) => x.status === 'not executed').length };
    const barMet = baselineOk && tally.total > 0 && tally.killed === tally.total;
    console.log('MUTANTS: ' + tally.killed + ' of ' + tally.total + ' killed, ' + tally.executed + ' executed, ' + tally.survived + ' survived, ' + tally.notExecuted + ' not executed; baseline ' + passedAtBase.size + ' of ' + b.tap.tests.length + ' pass in ' + b.ms + ' ms with the probe silent ' + (baseProbeLines === 0));
    return { barMet, baselineOk, baseline: { tests: b.tap.tests.length, pass: passedAtBase.size, skipped: b.tap.skipped ?? 0, fail: b.tap.fail ?? null, exit: b.code, ms: b.ms, probeLines: baseProbeLines, clockLegal }, rows, tally, timeoutMs, scratchKept: keep ? dir : null };
  } finally {
    if (!keep) fs.rmSync(dir, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const opt = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : null; };
  const oi = argv.indexOf('--out');
  if (argv.includes('--mutants')) {
    const out = opt('--out') ? path.resolve(opt('--out')) : path.join(ROOT, 'bench', 'verdicts', 'mcp-mutants.json');
    const timeoutMs = Number(opt('--timeout') || 120000);
    const only = opt('--only') ? opt('--only').split(',') : null;
    const r = await runMutants({ scratch: opt('--scratch'), timeoutMs, keep: argv.includes('--keep'), only });
    const t = r.tally, b = r.baseline;
    const statement = 'The mutant pass asks whether test/mcp.test.mjs can notice tools/mcp.mjs breaking. The server was copied into a scratch directory with its imports pointed back at the tree and a probe added; the unmutated copy ran the suite first as the control: '
      + b.pass + ' of ' + b.tests + ' tests passed in ' + b.ms + ' ms and the probe wrote ' + b.probeLines + ' lines. Then ' + t.total + ' copies each carried one deliberate defect (a notification answered, the wrong parse error code, noise on stdout, a nonzero exit, a lost log line, an unknown tool or bad input let through, a footer, knowledge, verdict or status field falsified, --state ignored, the protocol version ignored, a blank line answered, the verdict name unchecked), and each defect\'s own code wrote a probe line when it ran. '
      + t.killed + ' of ' + t.total + ' were killed (a test that passed on the control failed), ' + t.survived + ' survived and ' + t.notExecuted + ' never executed, so ' + (r.barMet ? 'every defect this table names is one the suite catches.' : 'the suite does NOT catch every defect this table names.')
      + ' The provider env refusal is not mutated: removing it would let a call reach a model endpoint, and this pass runs model off.';
    const verdict = {
      at: new Date().toISOString(),
      command: 'node bench/mcp.mjs --mutants' + (opt('--scratch') ? ' --scratch <scratch>' : '') + (opt('--timeout') ? ' --timeout ' + timeoutMs : '') + (only ? ' --only ' + only.join(',') : '') + (oi >= 0 ? ' --out ' + argv[oi + 1] : ''),
      node: process.version,
      isTheBar: true,
      barMet: r.barMet,
      of: 'the mutant pass of item mcp-server (board 32); the protocol bar is bench/verdicts/mcp.json',
      split: { development: 'the mutant table was written from tools/mcp.mjs and the fix pass findings before this run; nothing is fit or tuned', heldOut: 'none', why: 'a mutant pass has no held-out data: each defect is either noticed by a test that passed on the unmutated control or it is not', contaminated: false },
      control: 'the unmutated transplant of tools/mcp.mjs (same imports, same probe header, no defect) ran the same suite first; a mutant counts as killed only when a test that passed there fails, and only when its probe proves the defect ran',
      model: 'off: the suite passes provider "none" or is refused before any model; no mutant touches the provider path',
      suite: 'test/mcp.test.mjs',
      baseline: r.baseline,
      timeoutMs: r.timeoutMs,
      tally: r.tally,
      mutants: r.rows,
      statement,
    };
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(verdict, null, 2) + '\n');
    console.log('wrote ' + path.relative(ROOT, out).split(path.sep).join('/') + ' barMet ' + r.barMet);
    process.exitCode = r.barMet ? 0 : 1;
  } else {
    const out = oi >= 0 && argv[oi + 1] ? path.resolve(argv[oi + 1]) : path.join(ROOT, 'bench', 'verdicts', 'mcp.json');
    const r = await runBar();
    const passed = r.calls.filter((c) => c.ok && !c.skipped).length, ran = r.calls.filter((c) => !c.skipped).length;
    console.log((r.barMet ? 'BAR MET' : 'BAR NOT MET') + ': ' + passed + '/' + ran + ' calls ok; ' + Object.entries(r.checks).map(([k, v]) => k + ' ' + v).join(', ') + '; malformedSurvived ' + r.malformedSurvived + '; exitCode ' + r.exitCode);
    const statement = statementOf(r);
    const verdict = {
      at: new Date().toISOString(),
      command: 'node bench/mcp.mjs' + (oi >= 0 ? ' --out ' + argv[oi + 1] : ''),
      node: process.version,
      isTheBar: true,
      barMet: r.barMet,
      split: { development: 'the item text (board 32, mcp-server) and the fix pass findings fixed every call and its expected answer before the run; no data is fit or tuned', heldOut: 'none', why: 'a protocol conformance bar over fixed calls has no held-out data: each call either behaves as the MCP 2025-06-18 stdio transport and the item text require or it does not', contaminated: false },
      control: 'four negative controls run beside the checks they guard: ask "qwzx vrbl plomf" must be the memory miss (FALLTHROUGH_HEAD); ask "What is the capital of Italy?" must reach the knowledge route with an answer line the paris check rejects; knowledge "qwzx vrbl plomf", and the Paris header alone (which echoes its subject), must fail the Paris check; verdict "../ladder" must be isError true. The malformed line and the unknown tool are the protocol\'s own negative cases. The mutant pass (bench/verdicts/mcp-mutants.json) is the control on the test suite',
      tools: r.names,
      protocolVersion: r.protocolVersion,
      serverInfo: r.serverInfo,
      model: 'off: every ask passed provider "none" (provider null, no socket, no model call)',
      knowledgeStore: r.storePresent ? 'present (bench/fixtures/wiki/store)' : 'absent',
      calls: r.calls,
      checks: r.checks,
      malformedSurvived: r.malformedSurvived,
      exitCode: r.exitCode,
      stdoutLines: r.stdoutLines,
      stdoutNonJson: r.nonJson,
      notificationAnswers: r.notificationAnswers,
      stderrToolLogs: r.toolLogs,
      toolCalls: r.toolCalls,
      wallMs: r.wallMs,
      barRule: 'handshake ok AND tools/list has the four AND ask hey answered natively AND verdict ok AND malformedSurvived AND exitCode 0 (the item text), and (stricter) stdout clean AND the notification silent AND one stderr log line per tool call AND knowledge AND status AND the unknown tool refused AND the capital (when the store is on this host) AND every control behaving',
      statement,
    };
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(verdict, null, 2) + '\n');
    console.log('wrote ' + path.relative(ROOT, out).split(path.sep).join('/') + ' barMet ' + r.barMet);
    process.exitCode = r.barMet ? 0 : 1;
  }
}
