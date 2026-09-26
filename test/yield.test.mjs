// test/yield.test.mjs: the kept-per-hour line (queue item 7, the CLOUD part): tools/yield.mjs,
// web/yield.mjs and bench/yield-site.mjs on a planted verdict set in a temp directory.
// Author: board 20 builder (board 21, item yield), 2026-09-26.
// No model, no network, no write to the real tree: every file this writes is under os.tmpdir().
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readYield, yieldLines, NO_VERDICT } from '../tools/yield.mjs';
import { yieldBlock, insertBlock, injectYield, BEGIN, END, ANCHOR } from '../web/yield.mjs';
import { checkBlock, tamper, extractBlock } from '../bench/yield-site.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'yield-test-'));
process.on('exit', () => fs.rmSync(TMP, { recursive: true, force: true }));

const HISTORY_R1 = { replacedAt: '2026-01-02T03:00:00.000Z', replacedBy: 'R2', previous: {
  at: '2026-01-01T02:00:00.000Z', command: 'node bin/brain.mjs self-code --auto --soak 60 --author on --json',
  soak: { runId: 'R1', startedAt: '2026-01-01T01:00:00.000Z', elapsedMs: 3600000, cfg: { authorOn: true } },
  totals: { attempts: 10, kept: 2 }, modelCalls: { made: 1, answered: 1, meanSeconds: 30 },
  magnitude: 'MAGNITUDE organism: 2 kept in 1 wall hours = 2 kept/hour' } };

/** A planted verdict set: one dry autopilot pass, one replaced soak (kept 2), the newest soak (kept 0), a ledger. */
function plant(name, extraHistory = []) {
  const dir = path.join(TMP, name);
  fs.mkdirSync(path.join(dir, 'autopilot'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'autopilot.json'), JSON.stringify({ at: '2026-01-01T00:00:00.000Z',
    realTree: { command: 'node bin/brain.mjs self-code --auto --dry --json', dry: true, ms: 2000, counts: { candidates: 5, kept: 0, modelCalls: 0 } } }));
  fs.writeFileSync(path.join(dir, 'soak.json'), JSON.stringify({ at: '2026-01-02T03:00:00.000Z',
    command: 'node bin/brain.mjs self-code --auto --soak 120 --author on --json',
    soak: { runId: 'R2', startedAt: '2026-01-02T01:00:00.000Z', elapsedMs: 7200000, cfg: { authorOn: true } },
    totals: { attempts: 20, kept: 0 }, modelCalls: { made: 3, answered: 2, meanSeconds: 50.5 },
    magnitude: 'MAGNITUDE organism: 0 kept in 2 wall hours = 0 kept/hour' }));
  fs.writeFileSync(path.join(dir, 'soak-history.jsonl'), [...extraHistory, HISTORY_R1].map((x) => JSON.stringify(x)).join('\n') + '\n');
  const rec = (runId, at, decision, model) => JSON.stringify({ kind: 'self.code.auto', runId, at, candidate: true, key: 'k', decision, model });
  fs.writeFileSync(path.join(dir, 'autopilot', '2026-01-01.jsonl'), [
    rec('R0', '2026-01-01T00:30:00.000Z', 'refused', null),
    rec('R1', '2026-01-01T01:10:00.000Z', 'kept', null),
    rec('R1', '2026-01-01T01:20:00.000Z', 'kept', null),
    rec('R1', '2026-01-01T01:30:00.000Z', 'refused', { calls: 1, ms: [30000], ok: 1 }),
  ].join('\n') + '\n');
  return dir;
}

const PAGE = '<!doctype html><html><body>\n<h1>findings</h1>\n' + ANCHOR + '\n<p>cards</p>\n</body></html>\n';

test('the line equals the fixture: one line per verdict, per ledger run, and the summary', () => {
  const dir = plant('lines');
  const lines = yieldLines(readYield({ dir }));
  assert.deepEqual(lines, [
    'yield autopilot.json at 2026-01-01T00:00:00.000Z: real-tree pass, dry: kept 0 of 5 candidates, model calls 0, mean none, wall 2000 ms = 0.0006 h, kept per hour 0',
    'yield soak-history.jsonl:1 at 2026-01-01T02:00:00.000Z: soak, author on, run R1: kept 2 of 10 candidates, model calls 1 (1 answered), mean 30 s, wall 3600000 ms = 1 h, kept per hour 2',
    'yield soak.json at 2026-01-02T03:00:00.000Z: soak, author on, run R2: kept 0 of 20 candidates, model calls 3 (2 answered), mean 50.5 s, wall 7200000 ms = 2 h, kept per hour 0',
    'yield ledger autopilot/2026-01-01.jsonl run R0 2026-01-01T00:30:00.000Z to 2026-01-01T00:30:00.000Z: 1 records: kept 0 of 1 candidates, model calls 0, mean none, no wall recorded, kept per hour not recorded (no wall)',
    'yield ledger autopilot/2026-01-01.jsonl run R1 2026-01-01T01:10:00.000Z to 2026-01-01T01:30:00.000Z: 3 records: kept 2 of 3 candidates, model calls 1, mean 30 s, wall 3600000 ms = 1 h (wall of soak-history.jsonl:1), kept per hour 2',
    'yield NEWEST soak.json at 2026-01-02T03:00:00.000Z (soak, author on): kept 0 in 2 wall hours = 0 kept per hour',
    'yield WINDOW the span the verdicts cover, 2026-01-01T00:00:00.000Z to 2026-01-02T03:00:00.000Z = 1.125 days (under 7): 2 kept in 2 soak runs over 3 loop wall hours = 0.6667 kept per loop hour; 2 kept in 3 runs on record (1 ledger runs without a soak verdict) over 27 hours = 0.0741 kept per hour of the window; 1 dry passes listed, not summed',
  ]);
  // the CLI prints the same lines
  const r = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'yield.mjs'), '--dir', dir], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.deepEqual(r.stdout.trim().split('\n'), lines);
});

test('a 0 kept prints 0 on the terminal and on the page, and every number on the page traces to the fixture', () => {
  const dir = plant('zero');
  const y = readYield({ dir });
  assert.equal(y.summary.newest.kept, 0);
  assert.equal(y.summary.newest.keptPerHour, 0);
  assert.match(yieldLines(y).find((l) => l.startsWith('yield NEWEST')), /= 0 kept per hour$/);
  const html = insertBlock(PAGE, yieldBlock(y));
  const big = /<div class="big"><span[^>]*data-yield-derived="perHour"[^>]*>([^<]*)<\/span>/.exec(html);
  assert.ok(big, 'the newest kept per hour is not on the page');
  assert.equal(big[1], '0');
  const c = checkBlock(html, dir);
  assert.deepEqual(c.problems, []);
  assert.equal(c.newestNamed, true);
  assert.equal(c.newestPrinted, '0');
  assert.ok(c.numbers >= 30, 'the block carries ' + c.numbers + ' numbers');
  // the control: one number changed must be caught
  const t = tamper(html);
  assert.notEqual(t, html);
  assert.ok(checkBlock(t, dir).problems.length >= 1, 'a changed number passed the comparison');
  // a digit outside a tagged span is caught
  const loose = html.replace('A zero is printed as zero.', 'A zero is printed as 0.');
  assert.match(checkBlock(loose, dir).problems.join('\n'), /digits outside a tagged span/);
  assert.ok(!html.includes(String.fromCharCode(0x2014)), 'an em dash on the page');
});

test('the verdicts cover over 7 days: the window is the last 7 days before the newest verdict', () => {
  const old = { previous: { at: '2025-12-20T00:00:00.000Z', command: 'node bin/brain.mjs self-code --auto --soak 60 --author on --json',
    soak: { runId: 'R-old', startedAt: '2025-12-19T23:00:00.000Z', elapsedMs: 3600000, cfg: { authorOn: true } },
    totals: { attempts: 9, kept: 5 }, modelCalls: { made: 0, answered: 0, meanSeconds: null } } };
  const dir = plant('seven', [old]);
  const y = readYield({ dir });
  assert.equal(y.summary.sevenDays, true);
  assert.equal(y.summary.windowStart, '2025-12-26T03:00:00.000Z');
  assert.equal(y.summary.keptSum, 2, 'the run before the window is not summed');
  const w = yieldLines(y).find((l) => l.startsWith('yield WINDOW'));
  assert.ok(w.startsWith('yield WINDOW the last 7 days, 2025-12-26T03:00:00.000Z to 2026-01-02T03:00:00.000Z (the verdicts cover 13.1667 days): 2 kept in 2 soak runs'), w);
  assert.deepEqual(checkBlock(insertBlock(PAGE, yieldBlock(y)), dir).problems, []);
});

test('a missing verdict directory prints "no autopilot verdict on this host" and the bar is a -partial', () => {
  const missing = path.join(TMP, 'missing');
  const out = path.join(TMP, 'out');
  const y = readYield({ dir: missing });
  assert.equal(y.message, NO_VERDICT);
  assert.deepEqual(yieldLines(y), [NO_VERDICT]);
  const cli = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'yield.mjs'), '--dir', missing], { encoding: 'utf8' });
  assert.equal(cli.stdout, NO_VERDICT + '\n');
  const block = yieldBlock(y);
  assert.ok(block.includes(NO_VERDICT));
  const realBefore = ['yield-site.json', 'yield-site-partial.json'].map((f) => { try { return fs.statSync(path.join(ROOT, 'bench', 'verdicts', f)).mtimeMs; } catch { return null; } });
  const r = spawnSync(process.execPath, [path.join(ROOT, 'bench', 'yield-site.mjs'), '--verdicts', missing, '--out-dir', out], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^no autopilot verdict on this host$/m);
  const v = JSON.parse(fs.readFileSync(path.join(out, 'yield-site-partial.json'), 'utf8'));
  assert.equal(v.isTheBar, false);
  assert.equal(v.barMet, false);
  assert.equal(typeof v.at, 'string');
  assert.equal(v.split.contaminated, false);
  assert.ok(!fs.existsSync(path.join(out, 'yield-site.json')), 'a bar file was written without a verdict');
  const realAfter = ['yield-site.json', 'yield-site-partial.json'].map((f) => { try { return fs.statSync(path.join(ROOT, 'bench', 'verdicts', f)).mtimeMs; } catch { return null; } });
  assert.deepEqual(realAfter, realBefore, 'the test wrote the real tree');
});

test('the block goes in before the anchor once, replaces itself, refuses a page without the anchor, and skips when off', () => {
  const dir = plant('inject');
  const block = yieldBlock(readYield({ dir }));
  const once = insertBlock(PAGE, block);
  assert.equal(once.split(BEGIN).length, 2);
  assert.ok(once.indexOf(END) < once.indexOf(ANCHOR));
  assert.equal(insertBlock(once, block), once, 'a second injection is not idempotent');
  assert.equal(extractBlock(once), block);
  assert.throws(() => insertBlock('<html><body></body></html>', block), /has no/);
  const page = path.join(TMP, 'page.html');
  fs.writeFileSync(page, PAGE);
  assert.equal(injectYield({ page, dir, env: { BRAIN_YIELD_BLOCK: 'off' } }).skipped, true);
  assert.equal(fs.readFileSync(page, 'utf8'), PAGE, 'the off switch wrote the page');
  const r = injectYield({ page, dir, env: {} });
  assert.equal(r.skipped, false);
  assert.equal(r.newest, 'soak.json');
  assert.equal(r.newestKeptPerHour, 0);
  assert.equal(fs.readFileSync(page, 'utf8'), once);
});
