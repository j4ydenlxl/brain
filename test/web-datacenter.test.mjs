// test/web-datacenter.test.mjs: the datacenter wall (web/datacenter.mjs). Offline, temp roots, no network, no clock: every
// build passes its own builtAt. Covers the output shape and the caps, the held-out file never opened (a spy on every fs read
// and a root where reading it throws), a script-breaking value carried as inert data, deterministic bytes, roots with records
// missing or broken, no URL in the page, the page script passing node --check, the CLI, and the replay's counters following
// the era rows exactly.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { generateDatacenter, readRecords, datacenterModel, refusedPath, clientPure, safeJson, PAGE_CAP, DATA_CAP, CAPS } from '../web/datacenter.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GEN = path.join(HERE, '..', 'web', 'datacenter.mjs');
const BUILT = '2026-10-02T13:00:00.000Z';
const HELD = 'HELDOUT-SECRET-ROW-7731';
const HELD_ANSWER = 'HELDOUT-SECRET-ANSWER-0419';
const XSS = '</script><img src=x onerror=alert(1)>';
const EM = String.fromCharCode(0x2014);
const FAKE_TOKEN = 'gh' + 'p_' + 'Q'.repeat(36);

const tmp = (tag) => fs.mkdtempSync(path.join(os.tmpdir(), 'dc-' + tag + '-'));
const put = (root, rel, v) => { const f = path.join(root, ...rel.split('/')); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, typeof v === 'string' ? v : JSON.stringify(v)); };
const read = (dir, f) => fs.readFileSync(path.join(dir, f), 'utf8');

/** A small organism: two tasks over three eras, one absorbed source, one tape pack of `keys` keys, one colony of `cells` cells. */
function makeRoot({ keys = 6, cells = 12, heldoutDir = false } = {}) {
  const root = tmp('root');
  put(root, 'neo/ERA.json', { era: 3, eras: [
    { era: 1, at: '2026-10-01T00:00:00.000Z', ms: 60000, absorbed: { bytes: 1000, tasks: 2, rows: 10 }, opened: ['alpha-task', 'beta-task'],
      grown: [{ task: 'alpha-task', generated: 500, kept: 40, promoted: true, heldout: { ok: 10, n: 20, score: 0.5 }, baseline: { ok: 0, n: 20, score: 0 } }], cells: 40, mastered: 0, blocked: [] },
    { era: 2, at: '2026-10-01T01:00:00.000Z', ms: 60000, absorbed: { bytes: 0, tasks: 0, rows: 0 }, opened: [],
      grown: [{ task: 'alpha-task', generated: 700, kept: 60, promoted: true, heldout: { ok: 20, n: 20, score: 1 }, baseline: { ok: 0, n: 20, score: 0 } },
        { task: 'beta-task', generated: 300, kept: 0, promoted: false, heldout: { ok: 0, n: 20, score: 0 }, baseline: { ok: 0, n: 20, score: 0 } }], cells: 100, mastered: 1, blocked: [] },
    { era: 3, at: '2026-10-01T02:00:00.000Z', ms: 30000, absorbed: { bytes: 0, tasks: 0, rows: 0 }, opened: [], grown: [], cells: 100, mastered: 1, blocked: [] },
  ] });
  put(root, 'neo/LEDGER.json', { generated: 1500, tasks: [
    { task: 'alpha-task', generation: 1, dev: 5, heldout: 20, by: 'absorb:src-one', at: '2026-10-01T00:00:10.000Z' },
    { task: 'beta-task', generation: 1, dev: 5, heldout: 20, by: 'absorb:src-one', at: '2026-10-01T00:00:10.000Z' },
  ] });
  for (const t of ['alpha-task', 'beta-task']) {
    put(root, 'neo/tasks/' + t + '/task.json', { task: t, skill: 'answer', domain: 'test', rule: t === 'alpha-task' ? 'rule ' + XSS + ' and ' + EM + ' dash' : 'plain rule' });
    put(root, 'neo/tasks/' + t + '/dev.jsonl', [{ q: 'question ' + XSS, expect: { contains: ['x'] }, answer: 'answer ' + FAKE_TOKEN }, { q: 'second', answer: 'two' }].map((r) => JSON.stringify(r)).join('\n') + '\n');
    if (heldoutDir) fs.mkdirSync(path.join(root, 'neo', 'tasks', t, 'heldout.jsonl'), { recursive: true });
    else put(root, 'neo/tasks/' + t + '/heldout.jsonl', JSON.stringify({ q: HELD, answer: HELD_ANSWER }) + '\n');
  }
  put(root, 'neo/ABSORB.json', { bytes: 12345, rows: 10, pulled: [{ id: 'src-one', at: '2026-10-01T00:00:30.000Z', url: 'https://data.example.test/one.csv', bytes: 12345, rows: 10, tasks: 2 }] });
  put(root, 'neo/sources.json', { sources: [{ id: 'src-one', kind: 'csv', domain: 'test ' + XSS, license: 'CC0', url: 'https://data.example.test/one.csv' }] });
  const times = ['2026-10-01T02:10:00.000Z', '2026-10-01T02:20:00.000Z'];
  const rows = [];
  for (let k = 0; k < keys; k++) for (const t of times) rows.push([k === 0 ? 'KEY-' + XSS : 'KEY-' + k, t, k + 0.5, k === 0 ? XSS : 'v' + k]);
  put(root, 'neo/know/tape-test-ticker.json', { id: 'tape-test-ticker', from: 'https://api.example.test/ticker', sha: 'x', columns: ['key', 'time', 'last price', 'note'], rows, at: times[1],
    tape: { id: 'test-ticker', key: 'key', time: 'time', fields: ['last price', 'note'], snapshots: 2, keys } });
  put(root, 'neo/know/INDEX.json', { packs: [{ id: 'tape-test-ticker', columns: ['key', 'time', 'last price', 'note'], rows: rows.length, sha: 'x' }] });
  put(root, 'neo/tapes.json', { tapes: [{ id: 'test-ticker' }], state: { tapes: { 'test-ticker': { pulls: 3, listed: keys } } } });
  const lines = [];
  for (let i = 0; i < cells; i++) lines.push(JSON.stringify({ id: 'c' + i, guard: [['has', i === 0 ? XSS : 'capital']], pyramid: ['render.str', ['memory.lookup', ['sense.text']]], mem: { table: { ['k' + i]: i === 0 ? XSS : 'v' } } }) + ',');
  put(root, 'grown/cells/neo-alpha.mjs', '// kernel\nexport const K = 1;\n// </KERNEL>\nconst COLONY = [\n' + lines.join('\n') + '\n];\nexport default COLONY;\n');
  put(root, 'grown/index.json', { generation: 1, cells: [{ id: 'neo-alpha', class: 'neo', task: 'alpha-task', lane: 'neo', tier: 'neo', file: 'cells/neo-alpha.mjs', cells, promotedAt: '2026-10-01T01:01:00.000Z' }] });
  put(root, 'bench/verdicts/organism.json', { at: '2026-10-01T03:00:00.000Z', kernel: { primitives: 12 } });
  return root;
}
const build = (root, extra = {}) => { const out = tmp('out'); const r = generateDatacenter({ root, outDir: out, builtAt: BUILT, env: {}, ...extra }); return { out, r, html: read(out, 'index.html'), json: read(out, 'data.json') }; };

test('output shape: index.html and data.json under their caps, the result names every kind', () => {
  const { r, html, json } = build(makeRoot());
  for (const k of ['bytes', 'dataBytes', 'screens', 'shown', 'eras', 'sources', 'missing']) assert.ok(k in r, k);
  assert.ok(r.bytes > 0 && r.bytes < PAGE_CAP, 'page ' + r.bytes);
  assert.ok(r.dataBytes > 0 && r.dataBytes < DATA_CAP, 'data ' + r.dataBytes);
  assert.equal(r.bytes, Buffer.byteLength(html));
  assert.equal(r.dataBytes, Buffer.byteLength(json));
  const d = JSON.parse(json);
  assert.equal(r.screens, 2 + 1 + 1 + 6 + 12);
  assert.equal(d.screens, r.screens);
  assert.equal(r.eras, 3);
  assert.deepEqual(r.missing, []);
  assert.equal(r.shown.keys, '6 of 6');
  assert.equal(r.shown.cells, '12 of 12');
  assert.match(html, /<title>Datacenter wall<\/title>/);
  assert.match(html, /built at 2026-10-02T13:00:00\.000Z from era 3/);
  assert.match(html, /\$0<\/b><span>a token: no step calls a model/);
  assert.match(html, /Every kind is shown in full\./);
  assert.throws(() => generateDatacenter({ root: makeRoot(), outDir: tmp('o'), env: {} }), /builtAt/);
});

test('caps apply in the stated order and the page prints "showing N of M" for every capped kind', () => {
  const { r, html, json } = build(makeRoot({ keys: 2600, cells: 3000 }));
  const d = JSON.parse(json);
  assert.equal(r.screens, CAPS.screens);
  assert.equal(d.keys.length, CAPS.keys);
  assert.equal(r.shown.keys, CAPS.keys + ' of 2600');
  const cellsShown = CAPS.screens - 2 - 1 - 1 - CAPS.keys;
  assert.equal(r.shown.cells, cellsShown + ' of 3000');
  assert.ok(html.includes('showing 2,400 of 2,600 watched keys'), 'keys cap printed');
  assert.ok(html.includes('showing ' + cellsShown.toLocaleString('en-US') + ' of 3,000 kept cells'), 'cells cap printed');
  assert.ok(!/showing \S+ of \S+ tasks/.test(html), 'an uncapped kind is not called capped');
  assert.deepEqual(d.caps.keys, [CAPS.keys, 2600]);
  assert.ok(r.bytes < PAGE_CAP && r.dataBytes < DATA_CAP);
});

test('the held-out file is never opened and its rows reach no output (a spy on every fs read)', () => {
  const root = makeRoot();
  const touched = [];
  const names = ['readFileSync', 'openSync', 'statSync', 'lstatSync', 'readdirSync', 'existsSync', 'createReadStream', 'accessSync', 'realpathSync'];
  const orig = Object.fromEntries(names.map((n) => [n, fs[n]]));
  for (const n of names) fs[n] = function (p, ...rest) { touched.push(String(p)); return orig[n].call(this, p, ...rest); };
  let res;
  try { res = build(root); } finally { for (const n of names) fs[n] = orig[n]; }
  const held = touched.filter((p) => /heldout/i.test(p));
  assert.deepEqual(held, [], 'no fs call names a held-out path');
  assert.ok(touched.some((p) => p.includes('dev.jsonl')), 'the spy saw the reads (control)');
  for (const s of [HELD, HELD_ANSWER]) { assert.ok(!res.html.includes(s)); assert.ok(!res.json.includes(s)); }
  for (const rel of ['neo/tasks/alpha-task/heldout.jsonl', 'judge/heldout/x.jsonl', 'judge/control.jsonl', 'state/live.json', '../outside.json', 'C:/x.json']) assert.ok(refusedPath(rel), rel);
  assert.equal(refusedPath('neo/tasks/alpha-task/dev.jsonl'), null);
});

test('a root where reading the held-out file throws still builds', () => {
  const root = makeRoot({ heldoutDir: true });
  assert.throws(() => fs.readFileSync(path.join(root, 'neo', 'tasks', 'alpha-task', 'heldout.jsonl')), 'reading it throws (control)');
  const { r } = build(root);
  assert.equal(r.screens, 22);
  assert.deepEqual(r.missing, []);
});

test('a script-breaking value in a pack, a task, a source and a cell stays inert data', () => {
  const { html, json } = build(makeRoot());
  assert.equal(html.split('</script>').length - 1, 1, 'one script close, the page own');
  assert.equal(html.split('<script>').length - 1, 1);
  for (const s of [html, json]) { assert.ok(!s.includes('<img'), 'no img tag'); assert.ok(!s.includes(XSS)); }
  assert.ok(!json.includes('<') && !json.includes('>'), 'data.json carries no raw angle bracket');
  const d = JSON.parse(json);
  assert.ok(d.keys.some((k) => k[1] === 'KEY-' + XSS), 'the key round-trips as data');
  assert.ok(d.keys.some((k) => k[2].some((row) => row.includes(XSS))), 'the value round-trips as data');
  assert.ok(d.tasks.some((t) => t.r.includes(XSS)), 'the rule round-trips as data');
  assert.ok(d.cells.some((c) => c[2].includes(XSS)), 'the cell guard round-trips as data');
  assert.ok(!/innerHTML|outerHTML|insertAdjacentHTML|document\.write|\beval\(|new Function/.test(html), 'no HTML sink, no eval');
  assert.ok(!html.includes(EM) && !json.includes(EM), 'no em dash');
  assert.ok(d.tasks.some((t) => t.r.endsWith(' and, dash')), 'the em dash became a comma');
  assert.ok(!json.includes(FAKE_TOKEN) && json.includes('[redacted]'), 'a token shape is redacted');
  assert.equal(safeJson('a</script>b'), '"a\\u003c/script\\u003eb"');
});

test('the same root and builtAt give the same bytes', () => {
  const root = makeRoot();
  const a = build(root), b = build(root);
  assert.equal(a.html, b.html);
  assert.equal(a.json, b.json);
  const c = build(root, { builtAt: '2026-10-02T14:00:00.000Z' });
  assert.notEqual(a.html, c.html, 'builtAt is printed');
});

test('roots with no tape packs, no ERA.json or broken JSON still build and name what is missing', () => {
  const empty = tmp('empty');
  const e = build(empty);
  assert.equal(e.r.screens, 0);
  assert.equal(e.r.eras, 0);
  assert.ok(e.r.missing.some((m) => m.startsWith('neo/ERA.json is not there yet')), 'names ERA.json');
  assert.ok(e.r.missing.some((m) => m.startsWith('neo/know/INDEX.json is not there yet') && /no watched-key screen/.test(m)), 'names the packs');
  assert.match(e.html, /dilation\.dev \/ datacenter/);
  assert.match(e.html, /before any era/);

  const noTapes = makeRoot();
  fs.rmSync(path.join(noTapes, 'neo', 'know'), { recursive: true });
  fs.rmSync(path.join(noTapes, 'neo', 'tapes.json'));
  const n = build(noTapes);
  assert.equal(n.r.shown.keys, '0 of 0');
  assert.ok(n.r.missing.some((m) => m.startsWith('neo/know/INDEX.json')));
  assert.ok(n.r.missing.some((m) => m.startsWith('neo/tapes.json')));
  assert.equal(n.r.screens, 2 + 1 + 12);

  const broken = makeRoot();
  put(broken, 'neo/ERA.json', '{"eras": [ {"era": 1,');
  put(broken, 'grown/index.json', 'not json');
  const b = build(broken);
  assert.ok(b.r.missing.some((m) => m.startsWith('neo/ERA.json is not valid JSON')), 'names the broken ERA.json');
  assert.ok(b.r.missing.some((m) => m.startsWith('grown/index.json is not valid JSON')));
  assert.equal(b.r.eras, 0);
  assert.equal(JSON.parse(b.json).cells.length, 0);
  assert.equal(b.r.screens, 2 + 1 + 1 + 6, 'tasks still come from the ledger and neo/tasks');
});

test('no http:// or https:// in the page, though the records hold URLs', () => {
  const { html, json } = build(makeRoot());
  assert.ok(!/https?:\/\//i.test(html));
  assert.ok(json.includes('data.example.test'), 'the URL is carried as text (control)');
  assert.ok(!/<a\s/i.test(html), 'no link element');
});

test('node --check passes on the page script', () => {
  const { html } = build(makeRoot());
  const a = html.indexOf('<script>'), b = html.indexOf('</script>');
  assert.ok(a > 0 && b > a);
  const f = path.join(tmp('chk'), 'page.js');
  fs.writeFileSync(f, html.slice(a + 8, b));
  const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
});

test('the CLI prints one JSON line and exits 0', () => {
  const root = makeRoot(), out = tmp('cli');
  const r = spawnSync(process.execPath, [GEN, '--root', root, '--out', out, '--built-at', BUILT], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const lines = r.stdout.trim().split('\n');
  assert.equal(lines.length, 1);
  const o = JSON.parse(lines[0]);
  assert.equal(o.screens, 22);
  assert.ok(fs.existsSync(path.join(out, 'index.html')) && fs.existsSync(path.join(out, 'data.json')));
  assert.equal(read(out, 'index.html'), build(root).html, 'the CLI writes the same bytes');
});

test('the replay follows the era rows exactly: appear, work, master, counters, warp', () => {
  const d = JSON.parse(build(makeRoot()).json);
  const P = clientPure();
  const [e1, e2, e3] = d.eras;
  const alpha = d.tasks.find((t) => t.n === 'alpha-task'), beta = d.tasks.find((t) => t.n === 'beta-task');
  assert.equal(alpha.o, e1[1], 'opened at the start of the era that opened it');
  assert.equal(alpha.me, 2, 'mastered in the era that promoted it at full held-out score');
  assert.equal(alpha.mt, e2[1] + e2[2]);
  assert.equal(beta.me, null, 'never at full held-out score');
  assert.deepEqual(alpha.h, [20, 20]);
  assert.deepEqual(alpha.b, [0, 20]);
  // during era 1, before it finishes: tasks opened 2, nothing finished yet
  let c = P.counters(d.eras, e1[1] + 1000);
  assert.deepEqual([c.era, c.running, c.tasks, c.cells, c.mastered, c.generated], [1, true, 2, null, null, null]);
  c = P.counters(d.eras, e1[1] + e1[2]);
  assert.deepEqual([c.era, c.cells, c.mastered, c.generated], [1, 40, 0, 500]);
  c = P.counters(d.eras, e2[1] + e2[2] + 1);
  assert.deepEqual([c.era, c.running, c.cells, c.mastered, c.generated], [2, false, 100, 1, 1500]);
  c = P.counters(d.eras, d.span);
  assert.deepEqual([c.era, c.cells, c.mastered, c.generated], [3, 100, 1, 1500]);
  assert.equal(d.totals.generated, 1500);
  assert.equal(d.totals.ledgerGenerated, 1500);
  assert.equal(e3[0], 3);
  // the warp is computed, never typed
  assert.equal(P.warp(d.span, 30000), d.span / 30000);
  assert.equal(P.warp(0, 30000), 0);
  // commands
  const list = P.screens(d);
  assert.equal(list.length, d.screens);
  assert.equal(P.select(list, 'all').n, list.length);
  assert.equal(P.select(list, 'tasks').n, 2);
  assert.equal(P.select(list, 'tapes').n, 1 + 6);
  assert.equal(P.select(list, 'cells').n, 12);
  assert.equal(P.select(list, 'sources').n, 1 + 1);
  assert.equal(P.select(list, 'KEY-3').n, 1);
  assert.equal(P.select(list, 'api.example.test').n, 1 + 6, 'a host matches its pack and keys');
  const mastered = new Uint8Array(list.length);
  mastered[list.findIndex((s) => s.k === 2 && s.name === 'alpha-task')] = 1;
  assert.equal(P.select(list, 'mastered', mastered).n, 1);
  // a selection is gathered first, its own block
  const sel = P.select(list, 'KEY-3');
  const lay = P.layout(list, 8, sel, 2, 1);
  const hit = list.findIndex((s) => s.name === 'KEY-3');
  assert.equal(lay.labels[0].g, 0);
  assert.equal(lay.y[hit], 1);
  for (let i = 0; i < list.length; i++) if (i !== hit) assert.ok(lay.y[i] > lay.y[hit]);
  assert.equal(lay.rows, P.wallRows([1, 2, 1, 2, 5, 12], 8, 2, 1));
});

test('records grown past every budget still fit data.json under its cap, each trimmed kind printed, the replay from the first embedded era', () => {
  const root = tmp('big');
  const N_TASK = 900, N_ERA = 2400, N_SRC = 600, N_PACK = 500, N_COL = 1200;
  const name = (i) => 'grown-task-number-' + String(i).padStart(4, '0') + '-with-a-long-descriptive-name';
  const t0 = Date.parse('2026-01-01T00:00:00.000Z');
  const eras = [];
  let generated = 0;
  for (let e = 0; e < N_ERA; e++) {
    const grown = [0, 1, 2].map((j) => ({ task: name((e + j * 7) % N_TASK), generated: 1000 + e, kept: 10, promoted: j === 0, heldout: { ok: 20, n: 20 }, baseline: { ok: 0, n: 20 } }));
    generated += grown.reduce((a, g) => a + g.generated, 0);
    eras.push({ era: e + 1, at: new Date(t0 + e * 3600000).toISOString(), ms: 600000, absorbed: { bytes: 5000, rows: 50 }, opened: e < N_TASK ? [name(e)] : [], grown, cells: 10 * e, mastered: e, blocked: [] });
  }
  put(root, 'neo/ERA.json', { era: N_ERA, eras });
  put(root, 'neo/LEDGER.json', { generated, tasks: Array.from({ length: N_TASK }, (_, i) => ({ task: name(i), dev: 5, heldout: 20, by: 'absorb:source-' + (i % N_SRC), at: eras[i].at })) });
  for (let i = 0; i < N_TASK; i++) put(root, 'neo/tasks/' + name(i) + '/task.json', { task: name(i), domain: 'test', rule: 'a rule long enough to weigh on the budget '.repeat(5) });
  const url = (s) => 'https://h' + (s % 45) + '.example.test/source-' + s + '.csv';
  const pulled = [];
  for (let s = 0; s < N_SRC; s++) for (let k = 0; k < 40; k++) pulled.push({ id: 'source-' + s, at: new Date(t0 + (s * 40 + k) * 200000).toISOString(), url: url(s), bytes: 1000 + k, rows: 10 });
  put(root, 'neo/ABSORB.json', { bytes: 1, rows: 1, pulled });
  put(root, 'neo/sources.json', { sources: Array.from({ length: N_SRC }, (_, s) => ({ id: 'source-' + s, kind: 'csv', domain: 'test', license: 'CC0', url: url(s) })) });
  const packs = [];
  for (let p = 0; p < N_PACK; p++) { const id = 'pack-' + p; packs.push({ id }); put(root, 'neo/know/' + id + '.json', { id, from: 'https://p' + (p % 30) + '.example.test/' + id, columns: ['a', 'b', 'c'], rows: [[1, 'two', 3], [4, 'five', 6]], at: eras[p].at }); }
  put(root, 'neo/know/INDEX.json', { packs });
  for (let i = 0; i < 3; i++) {
    const lines = Array.from({ length: 2000 }, (_, c) => JSON.stringify({ id: 'c' + c, guard: [['has', 'word']], pyramid: ['render.str', ['memory.lookup', ['sense.text']]], mem: { table: { ['k' + c]: 'v' } } }) + ',');
    put(root, 'grown/cells/colony-' + i + '.mjs', '// kernel\nconst COLONY = [\n' + lines.join('\n') + '\n];\nexport default COLONY;\n');
  }
  put(root, 'grown/index.json', { cells: Array.from({ length: N_COL }, (_, i) => ({ id: 'colony-' + i, lane: 'neo', task: name(i % N_TASK), file: 'cells/colony-' + i + '.mjs', cells: 5, promotedAt: eras[i].at })) });
  const { r, html, json } = build(root);
  assert.ok(r.dataBytes < DATA_CAP, 'data ' + r.dataBytes);
  assert.ok(r.bytes < PAGE_CAP, 'page ' + r.bytes);
  const d = JSON.parse(json);
  const P = clientPure();
  const word = { eras: 'era rows', tasks: 'tasks', sources: 'absorbed sources', packs: 'knowledge packs', colonies: 'colonies', hosts: 'source hosts' };
  for (const [k, w] of Object.entries(word)) {
    const [n, m] = d.caps[k];
    assert.ok(n > 0 && n < m, k + ' ' + n + ' of ' + m);
    assert.ok(html.includes('showing ' + P.fmt(n) + ' of ' + P.fmt(m) + ' ' + w), k + ' printed');
  }
  assert.equal(d.caps.eras[1], N_ERA);
  assert.equal(d.start, eras[N_ERA - d.eras.length].at, 'the replay starts at the first embedded era');
  assert.equal(d.eras[0][1], 0);
  const c = P.counters(d.eras, d.span);
  assert.deepEqual([c.era, c.tasks, c.generated], [N_ERA, N_TASK, generated], 'the live counters still count every era');
  for (const e of d.eras) { for (const t of e[7]) assert.ok(t < d.tasks.length); for (const g of e[8]) assert.ok(g[0] < d.tasks.length); }
  for (const cell of d.cells) assert.ok(cell[0] < d.colonies.length);
  assert.ok(d.cells.length > 0);
  for (const w of d.flow) for (const [h] of w) assert.ok(h < d.hosts.length);
  for (const s of d.sources) assert.ok(s.pt.length <= CAPS.pullTimes);
  const bytes = (v) => Buffer.byteLength(JSON.stringify(v));
  for (const [k, cap] of [['eras', CAPS.eraBytes], ['tasks', CAPS.taskBytes], ['sources', CAPS.sourceBytes], ['packs', CAPS.packBytes], ['colonies', CAPS.colonyBytes], ['keys', CAPS.keyBytes]]) assert.ok(bytes(d[k]) <= cap + 2, k + ' ' + bytes(d[k]) + ' within its budget');
  assert.ok(d.tasks.length < CAPS.tasks, 'the task budget binds before the task count');
  assert.equal(d.screens, d.tasks.length + d.sources.length + d.packs.length + d.keys.length + d.cells.length);
});

test('the real reader never throws on a tree of junk', () => {
  const root = tmp('junk');
  put(root, 'neo/ERA.json', { eras: [null, 3, { era: 'x' }, { era: 1, at: 'not a time' }] });
  put(root, 'neo/LEDGER.json', { tasks: [null, { task: '../escape' }, { task: 'ok-task', dev: -1 }] });
  put(root, 'grown/index.json', { cells: [{ lane: 'neo', file: '../../etc/passwd' }, { lane: 'neo', file: 'cells/missing.mjs', task: 'ok-task' }] });
  put(root, 'neo/know/INDEX.json', { packs: [{ id: '../x' }, { id: 'tape-gone' }] });
  const rec = readRecords(root);
  assert.deepEqual(rec.tasks.map((t) => t.task), ['ok-task']);
  const d = datacenterModel(rec, { builtAt: BUILT });
  assert.equal(d.eras.length, 0);
  assert.equal(d.tasks.length, 1);
  assert.equal(d.tasks[0].dev, null, 'a negative count is not a number the page shows');
  const { r } = build(root);
  assert.equal(r.screens, 1);
});
