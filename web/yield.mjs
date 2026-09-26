// web/yield.mjs: THE KEPT-PER-HOUR BLOCK ON THE FINDINGS PAGE (queue item 7, the CLOUD part).
// Author: board 20 builder (board 21, item yield), 2026-09-26.
//
// His words (docs/CLOUD-SESSION.md, item 7): "the kept-per-hour line ... on the site, read from the
// verdict, so the loop's yield is visible without a terminal." web/build.mjs calls injectYield()
// right after tools/findings.mjs wrote web/dist/findings/index.html: this reads the loop's verdicts
// through tools/yield.mjs at build time and puts one block, between the markers BEGIN and END,
// before the page's "what was measured" heading. Nothing else on the page and no other page is
// touched (bench/yield-site.mjs builds the site with the block off and on and compares the sha256
// of every other file).
//
// Every digit in the block sits in a tagged span, so bench/yield-site.mjs can read it back:
//   data-yield-src="<file>[:<line>]#<path>"      a field of a verdict file, printed as it is
//   data-yield-derived="<formula>" data-yield-of="<refs>"   hours or kept per hour from those fields
//   data-yield-derived="summary.<key>"          a number of the summary (the bench recomputes it)
//   data-yield-file / data-yield-run / data-yield-const    a file name, a ledger runId, the 7 of the window
// The verdict file name and its "at" sit beside every number. When the newest kept is 0 the block
// prints 0, as large as any other value would be.
//
// BRAIN_YIELD_BLOCK=off in the environment skips the block: that is the control build.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readYield, WINDOW_DAYS, VERDICTS_DIR } from '../tools/yield.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const PAGE = path.join(HERE, 'dist', 'findings', 'index.html');
export const BEGIN = '<!-- yield:begin -->';
export const END = '<!-- yield:end -->';
export const ANCHOR = '<h2>what was measured</h2>';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const NR = '<span class="dim">not recorded</span>';

/** The reference of a verdict row: file, or file:line for a soak-history.jsonl line. */
export const refOf = (r) => r.file + (r.line ? ':' + r.line : '');

function field(r, key) {
  const p = r.src && r.src[key];
  const v = r[key];
  if (!p || v == null) return NR;
  return '<span class="v" data-yield-src="' + esc(refOf(r) + '#' + p) + '">' + esc(String(v)) + '</span>';
}
const derived = (formula, of, v) => (v == null ? NR
  : '<span class="v" data-yield-derived="' + esc(formula) + '"' + (of && of.length ? ' data-yield-of="' + esc(of.join(' ')) + '"' : '') + '>' + esc(String(v)) + '</span>');
const sum = (key, v) => derived('summary.' + key, null, v);
const fileSpan = (r) => '<span class="f" data-yield-file="' + esc(r.file) + '"' + (r.line ? ' data-yield-line="' + r.line + '"' : '') + '>'
  + esc(r.file) + (r.line ? ' line ' + r.line : '') + '</span>';
const runSpan = (id) => '<span class="f" data-yield-run="' + esc(id) + '">' + esc(id) + '</span>';
const ledgerFile = (f) => '<span class="f" data-yield-file="' + esc(f) + '">' + esc(f) + '</span>';
const seven = () => '<span class="v" data-yield-const="WINDOW_DAYS">' + WINDOW_DAYS + '</span>';

function hoursOf(r) { return r.wallMs == null ? NR : derived('hours', [refOf(r) + '#' + r.src.wallMs], r.wallHours); }
function rateOf(r) {
  if (r.keptPerHour == null) return NR;
  return derived('perHour', [refOf(r) + '#' + r.src.kept, refOf(r) + '#' + r.src.wallMs], r.keptPerHour);
}

function verdictRow(r) {
  const what = esc(r.mode) + (r.runId ? ', run ' + field(r, 'runId') : '')
    + (r.superseded ? ' <span class="dim">(regraded later: ' + fileSpan(r.supersededBy.includes(':') ? { file: r.supersededBy.split(':')[0], line: Number(r.supersededBy.split(':')[1]) } : { file: r.supersededBy }) + ')</span>' : '')
    + (r.command ? '<div class="cmdl">' + field(r, 'command') + '</div>' : '');
  const model = field(r, 'modelCalls') + (r.answered != null ? ' <span class="dim">(' + field(r, 'answered') + ' answered)</span>' : '');
  const mean = r.meanSeconds == null ? '<span class="dim">none</span>'
    : (r.src.meanSeconds ? field(r, 'meanSeconds') : derived('meanModelMs', [refOf(r) + '#realTree.bySource'], r.meanSeconds));
  return '<tr' + (r.superseded ? ' class="sup"' : '') + '><td>' + fileSpan(r) + '</td><td class="at">' + field(r, 'at') + '</td><td>' + what + '</td>'
    + '<td class="n">' + field(r, 'kept') + '</td><td class="n">' + field(r, 'candidates') + '</td><td class="n">' + model + '</td>'
    + '<td class="n">' + mean + '</td><td class="n">' + hoursOf(r) + '</td><td class="n k">' + rateOf(r) + '</td></tr>';
}

function ledgerRow(g) {
  const of = ['run:' + g.runId];
  const wall = g.verdict
    ? derived('ledgerPerHour', ['run:' + g.runId, g.verdict + '#' + (g.verdict.includes(':') ? 'previous.' : '') + 'soak.elapsedMs'], g.keptPerHour)
      + '<div class="dim">wall of ' + fileSpan(g.verdict.includes(':') ? { file: g.verdict.split(':')[0], line: Number(g.verdict.split(':')[1]) } : { file: g.verdict }) + '</div>'
    : '<span class="dim">no wall recorded</span>';
  return '<tr><td>' + runSpan(g.runId) + '<div class="dim">' + g.files.map(ledgerFile).join(', ') + '</div></td>'
    + '<td class="at">' + derived('ledgerFirstAt', of, g.startedAt) + '<div>' + derived('ledgerLastAt', of, g.at) + '</div></td>'
    + '<td class="n">' + derived('ledgerRecords', of, g.records) + '</td><td class="n">' + derived('ledgerKept', of, g.kept) + '</td>'
    + '<td class="n">' + derived('ledgerCandidates', of, g.candidates) + '</td><td class="n">' + derived('ledgerModelCalls', of, g.modelCalls) + '</td>'
    + '<td class="n">' + (g.meanSeconds == null ? '<span class="dim">none</span>' : derived('ledgerMeanSeconds', of, g.meanSeconds)) + '</td>'
    + '<td class="n k">' + wall + '</td></tr>';
}

const STYLE = '<style>\n'
  + '.yield .big { font-size: 30px; line-height: 1.1; color: var(--ink); text-shadow: 0 0 18px rgba(127,176,255,0.28); }\n'
  + '.yield .newest { max-width: none; }\n'
  + '.yield .scroll { overflow-x: auto; margin-top: 12px; border: 1px solid var(--line); border-radius: 10px; background: var(--glass); }\n'
  + '.yield table { border-collapse: collapse; width: 100%; font-size: 11px; }\n'
  + '.yield th, .yield td { text-align: left; padding: 5px 10px; border-bottom: 1px solid var(--line); vertical-align: top; }\n'
  + '.yield th { color: var(--dim); font-weight: 400; white-space: nowrap; }\n'
  + '.yield td.n, .yield th.n { text-align: right; white-space: nowrap; }\n'
  + '.yield td.at { white-space: nowrap; color: var(--dim); }\n'
  + '.yield td.k .v { color: var(--accent); }\n'
  + '.yield tr.sup td { opacity: 0.6; }\n'
  + '.yield .cmdl { color: var(--dim); overflow-wrap: anywhere; max-width: 46ch; }\n'
  + '.yield .f { color: var(--ink); }\n'
  + '</style>\n';

/** The block's HTML for a readYield() result. */
export function yieldBlock(y) {
  const head = BEGIN + '\n<section class="yield" id="yield">\n' + STYLE + '<h2>the loop\'s yield</h2>\n'
    + '<p class="lede">What the self-improving loop kept, per hour, read at build time from its own verdicts under bench/verdicts. '
    + 'Kept per hour is kept divided by the wall the verdict itself records, never by a clock. A zero is printed as zero.</p>\n';
  if (y.message) return head + '<div class="soak newest"><div class="big">' + esc(y.message) + '</div></div>\n</section>\n' + END;
  const s = y.summary, n = s.newest;
  const nr = y.rows.find((r) => r.id === n.id);
  const mag = nr.kind === 'soak' && nr.magnitudeKeptPerHour != null
    ? ' <span class="dim">(the verdict\'s own MAGNITUDE line reads ' + derived('magnitude', [refOf(nr) + '#' + (nr.line ? 'previous.' : '') + 'magnitude'], nr.magnitudeKeptPerHour) + ' kept per hour)</span>' : '';
  const newest = '<div class="soak newest"><div class="dim">newest verdict: ' + fileSpan(nr) + ' at ' + field(nr, 'at') + ', ' + esc(nr.mode)
    + (nr.runId ? ', run ' + field(nr, 'runId') : '') + '</div>'
    + '<div class="big">' + rateOf(nr) + ' <span class="dim" style="font-size:13px">kept per hour</span></div>'
    + '<div>kept ' + field(nr, 'kept') + ' of ' + field(nr, 'candidates') + ' candidates in ' + hoursOf(nr) + ' wall hours'
    + (nr.src.wallMs ? ' <span class="dim">(' + field(nr, 'wallMs') + ' ms)</span>' : '') + mag + '</div></div>\n';
  const win = s.sevenDays
    ? 'Over the last ' + seven() + ' days, ' + sum('windowStart', s.windowStart) + ' to ' + sum('spanEnd', s.spanEnd) + ' (the verdicts cover ' + sum('spanDays', s.spanDays) + ' days)'
    : 'The verdicts cover under ' + seven() + ' days, so the window is the span they cover: ' + sum('spanStart', s.spanStart) + ' to ' + sum('spanEnd', s.spanEnd)
      + ', ' + sum('spanDays', s.spanDays) + ' days';
  const window = '<p>' + win + '. ' + sum('keptSum', s.keptSum) + ' kept in ' + sum('soakRuns', s.soakRuns) + ' soak runs over '
    + sum('wallHoursSum', s.wallHoursSum) + ' loop wall hours = <b>' + sum('keptPerLoopHour', s.keptPerLoopHour) + '</b> kept per loop hour; '
    + sum('allKept', s.allKept) + ' kept in ' + sum('allRuns', s.allRuns) + ' runs on record (' + sum('ledgerOnlyRuns', s.ledgerOnlyRuns)
    + ' ledger runs without a soak verdict) over ' + sum('windowHours', s.windowHours) + ' hours = <b>' + sum('keptPerWindowHour', s.keptPerWindowHour)
    + '</b> kept per hour of the window. A soak regraded later counts once, at its newest grading. ' + sum('dryRows', s.dryRows)
    + ' dry passes of the autopilot bench are listed and not summed: a dry run writes nothing.</p>\n';
  const vt = '<div class="scroll"><table><tr><th>verdict</th><th>at</th><th>what ran</th><th class="n">kept</th><th class="n">candidates</th>'
    + '<th class="n">model calls</th><th class="n">mean s</th><th class="n">wall h</th><th class="n">kept per hour</th></tr>\n'
    + y.rows.slice().reverse().map(verdictRow).join('\n') + '\n</table></div>\n';
  const lt = y.ledger.length ? '<p class="dim">The ledger, bench/verdicts/autopilot, one row per run: a run borrows the wall of the soak verdict with its runId, and prints no rate without one.</p>\n'
    + '<div class="scroll"><table><tr><th>run</th><th>first and last record</th><th class="n">records</th><th class="n">kept</th><th class="n">candidates</th>'
    + '<th class="n">model calls</th><th class="n">mean s</th><th class="n">kept per hour</th></tr>\n'
    + y.ledger.slice().reverse().map(ledgerRow).join('\n') + '\n</table></div>\n' : '';
  return head + newest + window + vt + lt + '</section>\n' + END;
}

/** Put the block into a findings page (replacing a block already there). Throws without the anchor. */
export function insertBlock(page, block) {
  const b = page.indexOf(BEGIN), e = page.indexOf(END);
  if (b >= 0 && e > b) return page.slice(0, b) + block + page.slice(e + END.length);
  const i = page.indexOf(ANCHOR);
  if (i < 0) throw new Error('yield: the findings page has no "' + ANCHOR + '" to put the block before');
  return page.slice(0, i) + block + '\n\n' + page.slice(i);
}

/** Called by web/build.mjs after the findings page is written. */
export function injectYield(opts = {}) {
  const env = opts.env || process.env;
  if (env.BRAIN_YIELD_BLOCK === 'off') return { skipped: true, reason: 'BRAIN_YIELD_BLOCK=off' };
  const page = opts.page || PAGE;
  if (!existsSync(page)) throw new Error('yield: ' + page + ' was not built');
  const y = readYield({ dir: opts.dir || VERDICTS_DIR });
  const html = insertBlock(readFileSync(page, 'utf8'), yieldBlock(y));
  if (html.includes(String.fromCharCode(0x2014))) throw new Error('yield: an em dash reached the page');
  writeFileSync(page, html);
  const s = y.summary;
  return {
    skipped: false, page, bytes: Buffer.byteLength(html), rows: y.rows.length, ledgerRuns: y.ledger.length, message: y.message,
    newest: s && s.newest ? s.newest.id : null, newestAt: s && s.newest ? s.newest.at : null, newestKeptPerHour: s && s.newest ? s.newest.keptPerHour : null,
    keptPerLoopHour: s ? s.keptPerLoopHour : null,
  };
}
