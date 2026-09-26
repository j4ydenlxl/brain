// bench/nextboard.mjs: THE BAR of self/nextboard.mjs. Author: board 15 builder. MODEL OFF.
//
// The organism writes its own next board from its own ledger, and the loop consumes it:
//   1. PLAN     node self/nextboard.mjs --dry --json names the target file (board N).
//   2. CONTROL  a planted root holding only state/self/gaps.jsonl, the real ledger WITHOUT the lines
//               of that proposed file: node bin/brain.mjs self-code --auto --dry --json --root <it>
//               --sources boards lists how many board-N items (0 expected).
//   3. WRITE    node self/nextboard.mjs on the real tree: the board is written and the ledger
//               refreshed through self/gaps.mjs; every printed line is kept.
//   4. LOOP     node bin/brain.mjs self-code --auto --dry --json on the real tree, twice: the
//               board-N items under source boards, and the boards source line.
//   5. ARM      the planted root again, now with the refreshed ledger: the same command as 2.
//   6. CHECKS   the proposed file read back through self/boards.mjs parseProposedBoard and barOf:
//               every item's GAP id is a real ledger line (not a proposed one), every script its
//               trial command names exists, every item's verdict file is the one its gap names.
//   7. NOISE    a second --dry --json run: the same gap ids, the same order.
//   8. HELD OUT the dated ledgers state/self/gaps-<date>.jsonl (never read while the ranking was
//               written) through buildBoard: items, round trip, trial scripts present.
// Bar met: at least 5 items from real gaps, every trial script exists, the loop lists every item.
// Fewer than 5 eligible gaps is printed as measured and is a landing.
//
//   node tools/budget.mjs --ram-mb 6000 --disk-mb 200 --dir <scratch> -- node --max-old-space-size=6000 bench/nextboard.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync, statSync, renameSync, statfsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const VERDICT_REL = 'bench/verdicts/nextboard.json';
const PARTIAL_REL = 'bench/verdicts/nextboard-partial.json';
const MIN_ITEMS = 5;
const DEV_LEDGER_DATE = '2026-09-26';
const t0 = Date.now();
const say = (s) => process.stdout.write(s + '\n');
const printed = [];
const keep = (s) => { printed.push(s); say(s); };
let peakRss = 0;
const rss = () => { const m = process.memoryUsage().rss / 1048576; if (m > peakRss) peakRss = m; return m; };

const argv = process.argv.slice(2);
const val = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const tmpBase = path.resolve(val('--tmp', os.tmpdir()));

function run(args, { cwd = ROOT, timeoutMs = 300_000 } = {}) {
  const s = Date.now();
  const r = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', timeout: timeoutMs, windowsHide: true, maxBuffer: 256 * 1024 * 1024 });
  return { status: r.status, stdout: String(r.stdout || ''), stderr: String(r.stderr || ''), ms: Date.now() - s, error: r.error ? r.error.code || String(r.error) : null };
}
const NL = String.fromCharCode(10);
const lastJson = (out) => {
  const s = out.trim();
  try { return JSON.parse(s); } catch { /* not one document */ }
  const i = s.indexOf(NL + '{');
  if (i >= 0) { try { return JSON.parse(s.slice(i + 1)); } catch { /* fall through */ } }
  const ls = s.split(NL);
  for (let k = ls.length - 1; k >= 0; k--) { try { return JSON.parse(ls[k].trim()); } catch { /* not this line */ } }
  return null;
};
const readLedger = (file) => { try { return readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l.trim()).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); } catch { return []; } };

function listed(json, board) {
  if (!json || !Array.isArray(json.decisions)) return { ids: [], decisions: {}, line: null };
  const ds = json.decisions.filter((d) => d.source === 'boards' && typeof d.gap === 'string' && d.gap.startsWith('board-' + board + ':'));
  const decisions = {};
  for (const d of ds) decisions[d.decision] = (decisions[d.decision] || 0) + 1;
  return { ids: ds.map((d) => d.gap), decisions, line: json.sources && json.sources.boards ? JSON.stringify(json.sources.boards) : null, all: json.decisions.filter((d) => d.source === 'boards').length };
}

function plantedLoop(dir, ledgerLines, board) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(path.join(dir, 'state', 'self'), { recursive: true });
  writeFileSync(path.join(dir, 'state', 'self', 'gaps.jsonl'), ledgerLines.map((l) => JSON.stringify(l)).join('\n') + '\n');
  const r = run(['--max-old-space-size=6000', 'bin/brain.mjs', 'self-code', '--auto', '--dry', '--json', '--root', dir, '--sources', 'boards']);
  const j = lastJson(r.stdout);
  return { ...listed(j, board), status: r.status, ms: r.ms, ledgerLines: ledgerLines.length };
}

const out = { at: null, command: 'node --max-old-space-size=6000 bench/nextboard.mjs', node: process.version, isTheBar: true, barMet: false, author: 'board 15 builder', modelCalls: 0 };
const nb = await import(pathToFileURL(path.join(ROOT, 'self', 'nextboard.mjs')).href);
const boards = await import(pathToFileURL(path.join(ROOT, 'self', 'boards.mjs')).href);
const plantDir = path.join(tmpBase, 'brain-nextboard-' + process.pid);

try {
  say('BENCH nextboard ' + new Date().toISOString() + ' free RAM ' + Math.round(os.freemem() / 1048576) + ' MB, tmp ' + tmpBase);

  // the held-out ledgers are the dated files on disk BEFORE this run writes (the write renames the current ledger to a dated file)
  const heldFiles = readdirSync(path.join(ROOT, 'state', 'self')).filter((n) => /^gaps-\d{4}-\d{2}-\d{2}\.jsonl$/.test(n)).sort();
  // gaps-2026-09-26.jsonl is the ledger that stood while the ranking was written (development); every other dated file was never read
  const dated = heldFiles.filter((n) => n !== 'gaps-' + DEV_LEDGER_DATE + '.jsonl');
  // 1. PLAN
  const plan = run(['--max-old-space-size=6000', 'self/nextboard.mjs', '--dry', '--json']);
  const pj = lastJson(plan.stdout);
  if (!pj) throw new Error('self/nextboard.mjs --dry --json printed no JSON (exit ' + plan.status + '): ' + plan.stderr.trim().split(/\r?\n/).pop());
  const board = pj.board, rel = pj.rel;
  keep('1. PLAN ' + rel + ' (board ' + board + ', ' + pj.mode + '), ' + pj.items.length + ' items would be written, ' + plan.ms + ' ms');

  // 2. CONTROL: the real ledger without this file's lines
  const before = readLedger(path.join(ROOT, 'state', 'self', 'gaps.jsonl'));
  const ctlLines = before.filter((l) => !(l.kind === 'board item' && String(l.source || '').replaceAll('\\', '/') === rel));
  const ctl = plantedLoop(plantDir, ctlLines, board);
  keep('2. CONTROL planted root, ledger ' + ctl.ledgerLines + ' lines without ' + rel + ': board-' + board + ' items listed ' + ctl.ids.length + ' (boards candidates ' + ctl.all + ', exit ' + ctl.status + ', ' + ctl.ms + ' ms)');

  // 3. WRITE on the real tree
  const w = run(['--max-old-space-size=6000', 'self/nextboard.mjs']);
  const wLines = w.stdout.trim().split(/\r?\n/);
  for (const l of wLines) if (/^(NEXTBOARD|WROTE|REFUSED|WOULD WRITE|  ITEM|REFRESH|LEDGER|SELECT|excluded)/.test(l)) keep('3. ' + l);
  if (w.status !== 0) keep('3. self/nextboard.mjs exit ' + w.status + ': ' + w.stderr.trim().split(/\r?\n/).pop());

  // 4. LOOP on the real tree, twice
  const loops = [];
  for (let i = 0; i < 2; i++) {
    const r = run(['--max-old-space-size=6000', 'bin/brain.mjs', 'self-code', '--auto', '--dry', '--json']);
    const l = listed(lastJson(r.stdout), board);
    loops.push({ ...l, status: r.status, ms: r.ms });
    keep('4. LOOP run ' + (i + 1) + ': brain self-code --auto --dry --json exit ' + r.status + ', ' + r.ms + ' ms: board-' + board + ' items under source boards ' + l.ids.length + ' ' + JSON.stringify(l.decisions) + ' of ' + l.all + ' boards candidates');
  }
  keep('4. SOURCE LINE "boards": ' + loops[0].line);
  keep('4. LISTED: ' + loops[0].ids.join(', '));

  // 5. ARM: the planted root with the refreshed ledger
  const after = readLedger(path.join(ROOT, 'state', 'self', 'gaps.jsonl'));
  const arm = plantedLoop(plantDir, after, board);
  keep('5. ARM planted root, the refreshed ledger ' + arm.ledgerLines + ' lines: board-' + board + ' items listed ' + arm.ids.length + ' (boards candidates ' + arm.all + ', exit ' + arm.status + ')');

  // 6. CHECKS through the boards grammar
  const text = readFileSync(path.join(ROOT, ...rel.split('/')), 'utf8');
  const parsed = boards.parseProposedBoard(text, { file: rel });
  const realIds = new Set(after.filter((l) => !(l.kind === 'board item' && String(l.source || '').replaceAll('\\', '/').startsWith('docs/boards/proposed/'))).map((l) => l.id));
  const beforeIds = new Set(before.map((l) => l.id));
  const rows = parsed.items.map((it) => {
    const gap = (/^GAP:\s*(\S+)/m.exec(it.task) || [])[1] || null;
    const bar = boards.barOf(it.task, it.owns);
    const trialLine = (/the trial that measures it again \([^)]*\) is (node .*?)\.?$/m.exec(it.task) || [])[1] || null;
    const verdictOk = !!bar.verdictFile;
    const scripts = nb.scriptsOf(trialLine || bar.trial || '');
    const missing = scripts.filter((s) => !existsSync(path.join(ROOT, ...s.split('/'))));
    const g = before.find((l) => l.id === gap) || after.find((l) => l.id === gap) || null;
    return { key: it.key, gap, real: !!gap && (realIds.has(gap) || beforeIds.has(gap)), trial: trialLine, parsedTrial: bar.trial, scripts, missing, verdict: bar.verdictFile, gapVerdict: g ? g.verdictFile : null, listed: loops.every((l) => l.ids.includes('board-' + board + ':' + it.key)), verdictOk: verdictOk && !!g && bar.verdictFile === g.verdictFile };
  });
  for (const r of rows) keep('6. ITEM ' + r.key + ' | gap ' + r.gap + ' (' + (r.real ? 'a real ledger line' : 'NOT in the ledger') + ') | trial ' + (r.trial || 'none') + ' | scripts ' + (r.scripts.join(' ') || 'none') + (r.missing.length ? ' MISSING ' + r.missing.join(' ') : ' all exist') + ' | verdict ' + r.verdict + (r.verdict === r.gapVerdict ? '' : ' (the gap names ' + r.gapVerdict + ')') + ' | listed ' + r.listed);
  const emDashes = (text.match(new RegExp('\\u2014', 'g')) || []).length;
  keep('6. PARSE ' + rel + ': ok ' + parsed.ok + ', board ' + parsed.board + ', items ' + parsed.items.length + ', errors ' + parsed.errors.length + ', em-dashes ' + emDashes + ', bytes ' + Buffer.byteLength(text));

  // 7. NOISE: the ranking again, dry
  const again = lastJson(run(['--max-old-space-size=6000', 'self/nextboard.mjs', '--dry', '--json']).stdout);
  const ids1 = pj.items.map((x) => x.gap), ids2 = again ? again.items.map((x) => x.gap) : [];
  const writtenIds = rows.map((r) => r.gap);
  const sameOrder = JSON.stringify(ids1) === JSON.stringify(ids2) && JSON.stringify(ids1) === JSON.stringify(writtenIds);
  keep('7. NOISE the ranking over 3 reads (plan, write, a second dry run): the same gap ids in the same order: ' + (sameOrder ? 'yes' : 'NO: ' + JSON.stringify({ plan: ids1, written: writtenIds, again: ids2 })) + '; loop listings identical: ' + (JSON.stringify(loops[0].ids) === JSON.stringify(loops[1].ids) ? 'yes' : 'NO'));

  // 8. HELD OUT: the dated ledgers
  const held = [];
  for (const n of dated) {
    const lines = readLedger(path.join(ROOT, 'state', 'self', n));
    const b = await nb.buildBoard({ root: ROOT, gaps: { lines, found: true, bad: 0, mtime: null, ledgerLines: lines.length, promotedAdded: 0, rel: 'state/self/' + n } });
    const miss = b.items.flatMap((it) => it.trialScripts.filter((s) => !existsSync(path.join(ROOT, ...s.split('/')))));
    held.push({ file: 'state/self/' + n, lines: lines.length, eligible: b.ranked.length, items: b.items.length, roundTrip: b.roundTrip.ok, missingScripts: miss.length, kinds: [...new Set(b.items.map((x) => x.kind))] });
    keep('8. HELD OUT state/self/' + n + ': ' + lines.length + ' lines, eligible ' + b.ranked.length + ', items ' + b.items.length + ' (' + [...new Set(b.items.map((x) => x.kind))].join(', ') + '), round trip ' + (b.roundTrip.ok ? 'ok' : 'FAILED') + ', trial scripts missing ' + miss.length);
  }
  rss();

  // the bar
  const items = rows.length;
  const fromReal = rows.filter((r) => r.real).length;
  const scriptsOk = rows.every((r) => r.missing.length === 0);
  const trials = rows.filter((r) => r.trial).length;
  const listedAll = rows.every((r) => r.listed) && items > 0;
  const verdictsOk = rows.every((r) => r.verdictOk);
  const barMet = items >= MIN_ITEMS && fromReal === items && scriptsOk && listedAll && verdictsOk && parsed.ok && emDashes === 0 && ctl.ids.length === 0;
  Object.assign(out, {
    at: new Date().toISOString(), barMet, seconds: Math.round((Date.now() - t0) / 10) / 100, peakRssMbSelf: Math.round(rss() * 10) / 10,
    split: {
      development: 'test/nextboard.test.mjs planted ledgers, and the real ledger state/self/gaps.jsonl as it stood on 2026-09-26 (read while the ranking was written); the bar reads the real ledger as it stands at the run',
      heldOut: 'the dated ledgers ' + dated.map((n) => 'state/self/' + n).join(', ') + ' (never read while the ranking was written), through buildBoard: ' + held.map((h) => h.items + ' items, round trip ' + h.roundTrip + ', missing scripts ' + h.missingScripts).join('; '),
    },
    board: { rel, number: board, mode: pj.mode, items, fromRealGaps: fromReal, withTrial: trials, trialScriptsExist: scriptsOk, verdictsMatchGaps: verdictsOk, parseOk: parsed.ok, emDashes, bytes: Buffer.byteLength(text), kinds: [...new Set(pj.items.map((x) => x.kind))] },
    items: rows,
    loop: { command: 'node bin/brain.mjs self-code --auto --dry --json', runs: loops.map((l) => ({ listed: l.ids.length, decisions: l.decisions, boardsCandidates: l.all, ms: l.ms, exit: l.status })), sourceLine: loops[0].line, listedAll },
    control: { what: 'a planted root holding only the real ledger minus the lines of ' + rel + ', same command with --root and --sources boards', listed: ctl.ids.length, boardsCandidates: ctl.all },
    arm: { what: 'the same planted root with the refreshed ledger', listed: arm.ids.length, boardsCandidates: arm.all },
    noise: { sameOrderAcross3Reads: sameOrder, loopListingsIdentical: JSON.stringify(loops[0].ids) === JSON.stringify(loops[1].ids) },
    heldOut: held,
    printed: wLines.filter((l) => /^(WROTE|  ITEM|REFRESH|LEDGER)/.test(l)),
  });
  out.statement = 'self/nextboard.mjs read the real ledger and wrote ' + rel + ' (board ' + board + ', ' + pj.mode + ') with ' + items + ' items, ' + fromReal + ' of them real ledger gaps and ' + trials + ' with a trial command whose scripts ' + (scriptsOk ? 'all exist' : 'do NOT all exist') + '. The file reads back through self/boards.mjs parseProposedBoard (ok ' + parsed.ok + ', ' + emDashes + ' em-dashes). '
    + 'brain self-code --auto --dry --json listed ' + loops.map((l) => l.ids.length).join(' and ') + ' board-' + board + ' items under source boards in two runs; the control (a planted root with the ledger minus those lines) listed ' + ctl.ids.length + ' and the same planted root with the refreshed ledger listed ' + arm.ids.length + '. '
    + 'The ranking chose the same gap ids in the same order on 3 reads: ' + sameOrder + '. Held out: ' + held.length + ' dated ledger(s) produced ' + held.map((h) => h.items).join(', ') + ' items with round trip ' + held.map((h) => h.roundTrip).join(', ') + '. Bar ' + (barMet ? 'MET' : 'NOT MET') + ' (at least ' + MIN_ITEMS + ' items from real gaps, every trial script present, every item listed by the loop, and a control listing 0).';
} catch (e) {
  out.at = new Date().toISOString();
  out.isTheBar = false;
  out.error = String((e && e.stack) || e).split('\n').slice(0, 3).join(' | ');
  out.statement = 'the bench stopped before the bar was measured: ' + out.error;
  keep('ERROR ' + out.error);
} finally {
  try { rmSync(plantDir, { recursive: true, force: true }); } catch { /* reported below */ }
  let freeMb = null; try { const f = statfsSync(tmpBase); freeMb = Math.round(Number(f.bavail) * Number(f.bsize) / 1048576); } catch { freeMb = null; }
  say('cleanup: ' + plantDir + ' exists after delete: ' + existsSync(plantDir) + '; ' + freeMb + ' MB left on the temp drive');
}

const file = path.join(ROOT, ...(out.isTheBar ? VERDICT_REL : PARTIAL_REL).split('/'));
const tmp = file + '.' + process.pid + '.tmp';
writeFileSync(tmp, JSON.stringify(out, null, 2) + '\n');
renameSync(tmp, file);
say('wrote ' + (out.isTheBar ? VERDICT_REL : PARTIAL_REL) + ': isTheBar ' + out.isTheBar + ', barMet ' + out.barMet + ', ' + out.seconds + ' s, peak RSS (this process) ' + out.peakRssMbSelf + ' MB, model calls 0');
say('NEXTBOARD BAR ' + (out.barMet ? 'MET' : 'NOT MET'));
