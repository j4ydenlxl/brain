// test/handoff.test.mjs: tools/handoff.mjs and web/handoff.mjs on a PLANTED tree.
//
// No schtasks call (the task query is a planted LIST output), no git call (planted), no PATH
// lookup (planted), no network, no model. Every tree is a temp directory deleted at the end; the
// real tree is never written.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  generate, writeHandoff, SECTIONS, compareToLedger, countsInDoc, checksOf, gateLine, scrub, secretHit, trialOf,
} from '../tools/handoff.mjs';
import { generateHandoff, blocks } from '../web/handoff.mjs';

const NOW = new Date('2026-09-25T21:00:00.000Z');
const SECRETS = /sk_|token|VERCEL_OIDC/i;

function taskList(name, { next, status = 'Ready', run }) {
  return [
    'Folder: \\', 'HostName:                             PLANT', 'TaskName:                             \\' + name,
    'Next Run Time:                        ' + next, 'Status:                               ' + status,
    'Logon Mode:                           Interactive only', 'Last Run Time:                        9/25/2026 4:00:00 AM',
    'Last Result:                          0', 'Task To Run:                          ' + run,
    'Schedule Type:                        Daily ', 'Start Time:                           4:00:00 AM', '',
  ].join('\r\n');
}

const plantedQuery = (registered = ['BrainLadder', 'BrainAutopilot']) => (name) => {
  if (!registered.includes(name)) return { status: 1, out: '', err: 'ERROR: The system cannot find the file specified.' };
  const next = name === 'BrainLadder' ? '9/26/2026 4:00:00 AM' : '9/26/2026 5:00:00 AM';
  return { status: 0, out: taskList(name, { next, run: 'cmd /c cd /d X && node planted --' + name }), err: '' };
};
const plantedGit = () => ({ isRepo: true, remotes: [], branch: 'master' });
const whichAll = () => 'C:\\planted\\exe';

const LEDGER = [
  { id: 'board-13:plateau', kind: 'board item', board: 13, key: 'plateau', owns: ['bench/plateau.mjs', 'notes/plateau.md'], files: ['bench/plateau.mjs'], verdictFile: 'bench/verdicts/plateau.json', trial: 'node bench/plateau.mjs --bar', minutes: 60, needsModel: false, why: 'never launched' },
  { id: 'board-13:clock', kind: 'board item', board: 13, key: 'clock', files: ['bench/clock.mjs'], verdictFile: 'bench/verdicts/clock.json', trial: null, minutes: 60, why: 'never launched' },
  { id: 'board-12:enwiki', kind: 'board item', board: 12, key: 'enwiki', files: [], verdictFile: 'bench/verdicts/enwiki.json', trial: null, minutes: 60, why: 'needs the dump' },
  { id: 'missed:compress.json', kind: 'missed', measured: 3.9835, bar: 5, unit: 'x', verdictFile: 'bench/verdicts/compress.json', trial: { command: 'node tools/budget.mjs --ram-mb 6000 --dir <copy> -- node bench/compress.mjs --daemon', minutes: 6, needsModel: false }, files: ['core/persist.mjs'] },
  { id: 'never:cloud-partial.json', kind: 'bar never completed', verdictFile: 'bench/verdicts/cloud-partial.json', trial: null, why: 'no bounded form' },
  { id: 'open:notes/x.md#1', kind: 'open', trial: null, why: 'notes/x.md:3: the sk_live_ABCDEF1234567890 key and VERCEL_OIDC_TOKEN=eyJhbGciOi and a token: abc123 must never reach the page' },
  { id: 'open:notes/x.md#2', kind: 'open', trial: null, why: 'an ordinary open line ' + String.fromCharCode(0x2014) + ' with a dash' },
];

const DECISIONS = [
  { kind: 'self.code.auto', at: '2026-09-25T20:00:00Z', candidate: true, key: 'gaps:missed:compress.json:knob-tune', source: 'gaps', evidence: 'improve', decision: 'kept', wall: null },
  { kind: 'self.code.auto', at: '2026-09-25T20:01:00Z', candidate: true, key: 'gaps:open:notes/x.md#1:none', source: 'gaps', evidence: 'improve', decision: 'refused', wall: 'ceiling', reason: 'refused with sk_test_leak in the reason' },
  { kind: 'self.code.auto', at: '2026-09-25T20:02:00Z', candidate: true, key: 'notes:x', source: 'notes', evidence: 'fix', decision: 'refused', wall: 'stale' },
  { kind: 'self.code.auto', at: '2026-09-25T20:03:00Z', event: 'ledger-refresh', source: 'gaps' },
];

const GATE = {
  at: '2026-09-25T19:00:00.000Z', verdict: 'GREEN', testsPassed: 3, testsTotal: 3, assertionsPassed: 30, assertionsFailed: 0,
  lines: { code: 100, codeFiles: 5, prose: 200, generated: 10, generatedFiles: 1 }, emDash: [], badImports: [],
  rows: { budget: { ok: true }, compress: { ok: true }, hisData: { ok: true }, loadBearing: { ok: true }, boundary: { ok: true } },
};

function plant() {
  const root = mkdtempSync(path.join(tmpdir(), 'handoff-test-'));
  const w = (rel, text) => { const f = path.join(root, ...rel.split('/')); mkdirSync(path.dirname(f), { recursive: true }); writeFileSync(f, text); };
  w('state/self/gaps.jsonl', LEDGER.map((l) => JSON.stringify(l)).join('\n') + '\n');
  w('bench/verdicts/autopilot/2026-09-25.jsonl', DECISIONS.map((l) => JSON.stringify(l)).join('\n') + '\n');
  w('bench/verdicts/autopilot/2026-09-25.log', 'one\ntwo\n');
  w('state/self/authored.jsonl', JSON.stringify({ at: '2026-09-25T20:00:00Z', author: 'organism (knob-tune)', files: ['core/persist.mjs'], gap: 'missed:compress.json', before: 3.9, after: 4.1, unit: 'x', noise: 0.05 }) + '\n');
  w('state/self/soak-20260925T200000000Z.json', JSON.stringify({ runId: '20260925T200000000Z', status: 'done', elapsedMs: 60000, cfg: { soakMinutes: 1 }, decisions: [1, 2], kept: [], modelCalls: [], board10: { counts: { candidates: 5, kept: 0 } } }));
  w('bench/verdicts/public/whole-chain.cmd.txt', '\uFEFFcmd.exe /c cd /d X && (node tools\\budget.mjs -- node bench\\public.mjs --set gsm8k --limit 0 --resume > bench\\verdicts\\public\\whole-gsm8k.log 2>&1)');
  w('bench/verdicts/public/chain-cut.txt', 'PAUSED 2026-09-24T16:05:40Z by hand\nmore\n');
  w('bench/verdicts/public/gsm8k-public_1.jsonl', [JSON.stringify({ type: 'header' }), JSON.stringify({ type: 'arm', id: 'g.1' }), JSON.stringify({ type: 'arm', id: 'g.1' }), JSON.stringify({ type: 'arm', id: 'g.2' })].join('\n') + '\n');
  w('bench/verdicts/gate.json', JSON.stringify(GATE));
  w('self/autopilot.mjs', "export const SOURCE_ORDER = Object.freeze(['gate', 'notes']);\nexport const GAPS_SOURCE = 'gaps';\nconst a = { evidence: 'fix' }, b = { evidence: 'improve' };\n");
  return { root, w };
}

const opts = (root, extra = {}) => ({ root, now: NOW, taskQuery: plantedQuery(), which: whichAll, git: plantedGit, appData: path.join(root, 'appdata'), ...extra });

test('a planted ledger and planted task query output yield every section, in order, with the ledger counts', () => {
  const { root } = plant();
  try {
    const r = generate(opts(root));
    const heads = r.md.split('\n').filter((l) => l.startsWith('## ')).map((l) => l.slice(3));
    assert.deepEqual(heads, [...SECTIONS], 'the sections, in order');
    for (const s of r.sections) assert.ok(s.lines > 0, 'section ' + s.title + ' is empty');
    // the tasks, from the planted query output
    assert.match(r.md, /### BrainLadder \(daily 04:00\)\n\n- registered: yes, status Ready, next run 9\/26\/2026 4:00:00 AM/);
    assert.match(r.md, /### BrainAutopilot \(daily 05:00\)\n\n- registered: yes, status Ready, next run 9\/26\/2026 5:00:00 AM/);
    assert.ok(r.md.includes('the task runs: `cmd /c cd /d X && node planted --BrainAutopilot`'));
    // the undone work: the file's counts are the ledger's, kind by kind
    const cmp = compareToLedger(r.md, LEDGER);
    assert.ok(cmp.match, 'counts differ: ' + cmp.diffs.join('; '));
    assert.deepEqual(countsInDoc(r.md).headings, { 'board item': 3, 'bar never completed': 1, missed: 1, open: 2 });
    assert.ok(r.md.includes('board items by board: Board 12 1 (enwiki); Board 13 2 (plateau, clock)'), 'board items grouped by board');
    assert.ok(r.md.includes('trial 6 min: `node tools/budget.mjs --ram-mb 6000 --dir <copy> -- node bench/compress.mjs --daemon`'), 'a trial with its minutes');
    assert.ok(r.md.includes('; trial 60 min: `node bench/plateau.mjs --bar`'), 'a board item trial given as a string');
    // the loop, measured from the planted decision files
    assert.ok(r.md.includes('source gaps, evidence improve: 2 attempts, 1 kept, 0 reverted, 1 refused'));
    assert.ok(r.md.includes('sources declared in self/autopilot.mjs: gate, notes, gaps'));
    assert.ok(r.md.includes('attempts 7 (2 gap rounds, 5 from the Board 10 sources)'));
    assert.ok(r.md.includes('its last decision: refused at the stale wall'), 'the newest decision file names its last decision');
    // the chain: the exact command (BOM stripped) and the journal counts
    assert.ok(r.md.includes('```\ncmd.exe /c cd /d X && (node tools\\budget.mjs'), 'the chain command, verbatim');
    assert.ok(r.md.includes('bench/verdicts/public/gsm8k-public_1.jsonl: 4 journal lines, 2 records'));
    // the file ends with the ISO time and the gate line
    const last = r.md.trimEnd().split('\n').pop();
    assert.ok(last.startsWith('Generated 2026-09-25T21:00:00.000Z under: GATE GREEN: test files 3/3, assertions 30 pass / 0 fail'), last);
    assert.ok(!r.md.includes(String.fromCharCode(0x2014)), 'an em dash reached the file');
    console.log('sections   ' + r.sections.map((s) => s.title.split(' ').slice(-1)[0] + ' ' + s.lines).join(', '));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('a missing command is listed by name; a board item bench still to be built is not missing', () => {
  const { root, w } = plant();
  try {
    // first pass: every file the commands need, found missing on the bare plant, is stubbed but one
    const first = generate(opts(root));
    const files = new Set(first.missing.flatMap((c) => c.missing).filter((m) => m.startsWith('file ')).map((m) => m.slice(5)));
    assert.ok(files.has('daemon/health.mjs'), 'the bare plant lacks daemon/health.mjs');
    assert.ok(!files.has('bench/plateau.mjs'), 'an owned bench of an undone board item is counted missing');
    for (const f of files) if (f !== 'daemon/health.mjs' && !/^[A-Za-z]:/.test(f)) w(f.replace(/\\/g, '/'), '// stub\n');
    const r = generate(opts(root));
    const names = [...new Set(r.missing.flatMap((c) => c.missing))];
    assert.deepEqual(names, ['file daemon/health.mjs'], 'exactly the one removed file is missing: ' + names.join(', '));
    assert.ok(r.md.includes('` needs file daemon/health.mjs'), 'the file names the missing command');
    assert.ok(r.md.includes('runs bench/plateau.mjs, to be built by its board item'), 'the to-be-built bench is named as such');
    // an unregistered task: the schtasks line that needs it is missing, by name
    const r2 = generate(opts(root, { taskQuery: plantedQuery(['BrainLadder']) }));
    assert.ok(r2.md.includes('registered: NO'), 'the unregistered task says so');
    assert.ok(r2.missing.some((c) => c.missing.includes('task BrainAutopilot')), 'a command on an unregistered task is missing by name');
    // an executable not on PATH
    const r3 = generate(opts(root, { which: (exe) => (exe === 'gh' ? null : 'x') }));
    assert.ok(r3.missing.some((c) => c.missing.includes('exe gh') && c.line.startsWith('gh auth login')), 'gh missing is named');
    console.log('missing    ' + names.join(', ') + '; unregistered task and absent gh named too');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('no secret pattern reaches the file or the page; a secret in the file refuses the page', () => {
  const { root, w } = plant();
  try {
    w('bench/verdicts/public/chain-cut.txt', 'PAUSED with token=abcdef and sk_live_zzz\n');
    const r = writeHandoff(opts(root));
    const text = readFileSync(r.file, 'utf8');
    assert.ok(!SECRETS.test(text), 'a secret pattern survived: ' + secretHit(text));
    assert.ok(r.redactions >= 5, 'the filter counted ' + r.redactions);
    assert.ok(text.includes('[withheld]'), 'the replacement is visible');
    // the page from the clean file
    const out = path.join(root, 'dist', 'handoff');
    const p = generateHandoff({ doc: r.file, outDir: out });
    const html = readFileSync(p.path, 'utf8');
    assert.ok(!SECRETS.test(html), 'a secret pattern reached the page');
    for (const s of SECTIONS) assert.ok(html.includes('>' + s + '</h2>'), 'section ' + s + ' is on the page');
    assert.equal(readFileSync(path.join(out, 'HANDOFF.md'), 'utf8'), text, 'the raw file is served beside the page');
    assert.equal(p.sections, SECTIONS.length);
    // a file with a secret refuses the page
    const bad = path.join(root, 'bad.md');
    writeFileSync(bad, '# X\n\nsk_live_123\n');
    assert.throws(() => generateHandoff({ doc: bad, outDir: path.join(root, 'dist2') }), /secret pattern/);
    // an absent file: a page that names the command, not a failed build
    const none = generateHandoff({ doc: path.join(root, 'absent.md'), outDir: path.join(root, 'dist3') });
    assert.equal(none.missing, true);
    assert.ok(readFileSync(none.path, 'utf8').includes('node tools/handoff.mjs'));
    console.log('secrets    ' + r.redactions + ' replaced, 0 in the file, 0 on the page (' + p.bytes + ' bytes)');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('the parts: command checks, the gate line, the ledger comparison, the renderer, scrub', () => {
  const c1 = checksOf('schtasks /delete /tn BrainAutopilot /f');
  assert.deepEqual(c1.map((c) => c.kind + ' ' + c.name), ['exe schtasks', 'task BrainAutopilot']);
  const c2 = checksOf('schtasks /create /tn BrainLadder /tr "cmd /c cd /d X && node bench\\ladder.mjs --log" /sc daily /st 04:00 /f');
  assert.ok(!c2.some((c) => c.kind === 'task'), 'a /create line does not require the task it creates');
  assert.ok(c2.some((c) => c.kind === 'file' && c.name === 'bench\\ladder.mjs'));
  const c3 = checksOf('cmd.exe /c cd /d X && (C:\\PROGRA~1\\nodejs\\node.exe tools\\budget.mjs -- x)');
  assert.deepEqual(c3.map((c) => c.kind + ' ' + c.name), ['exe cmd', 'file C:\\PROGRA~1\\nodejs\\node.exe', 'file tools\\budget.mjs']);
  assert.equal(gateLine(GATE), 'GATE GREEN: test files 3/3, assertions 30 pass / 0 fail, authored code lines 100 in 5 files, prose lines 200, generated organism lines 10 in 1 files, em-dash files 0, bad imports 0, budget GREEN, compress GREEN, his data GREEN, load-bearing GREEN, boundary GREEN');
  const md = '## WHAT IS UNDONE\n\n### missed (2)\n\n- `a` x\n- `b` y\n\n## NEXT\n';
  assert.ok(compareToLedger(md, [{ kind: 'missed' }, { kind: 'missed' }]).match);
  assert.ok(!compareToLedger(md.replace('- `b` y\n', ''), [{ kind: 'missed' }, { kind: 'missed' }]).match, 'a dropped bullet is caught');
  assert.ok(!compareToLedger(md, [{ kind: 'missed' }, { kind: 'missed' }, { kind: 'open' }]).match, 'an unlisted kind is caught');
  const bs = blocks('# T\n\npara one\nline two\n\n- a `x`\n- b\n\n```\nnode a.mjs\n\nnode b.mjs\n```\n');
  assert.deepEqual(bs.map((b) => b.kind), ['h1', 'p', 'ul', 'pre']);
  assert.deepEqual(bs[3].lines, ['node a.mjs', '', 'node b.mjs']);
  const tally = { n: 0 };
  assert.equal(scrub('a `b` ' + String.fromCharCode(0x2014) + ' sk_x tokens', tally), "a 'b' ,  [withheld]x [withheld]");
  assert.equal(tally.n, 2);
  assert.deepEqual(trialOf({ trial: 'node x.mjs', minutes: 60 }), { command: 'node x.mjs', minutes: 60, needsModel: false });
  assert.equal(trialOf({ trial: null }), null);
  console.log('parts      checks, gate line, ledger comparison, renderer and scrub held');
});

test('the real tree is not written by these tests', () => {
  // every test above wrote only under its own temp directory; the plant helper never takes the real root
  const real = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
  const plantRoot = plant().root;
  try { assert.ok(!plantRoot.startsWith(real), 'the plant is outside the real tree'); } finally { rmSync(plantRoot, { recursive: true, force: true }); }
  assert.ok(!existsSync(plantRoot), 'the plant was deleted');
  console.log('isolation  plants live under ' + tmpdir() + ' and are deleted');
});
