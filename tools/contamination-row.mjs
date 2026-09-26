#!/usr/bin/env node
// tools/contamination-row.mjs: the CONTAMINATION row before and after, written as a bar verdict.
// board 19 builder (queue item 10, B2).
//
// bench/gate.mjs --contamination prints the row and writes nothing. This tool applies the gate's
// OWN functions (contaminationRecords, contaminationRow and refereeOf, imported from bench/gate.mjs,
// never copied) twice:
//   before  over bench/verdicts as committed at a git revision (default HEAD), extracted read-only
//           with `git archive <rev> bench/verdicts` into a temp directory that is deleted after;
//   after   over bench/verdicts in the working tree, exactly what node bench/gate.mjs --contamination
//           reads.
// It prints both lines and writes bench/verdicts/contamination.json (isTheBar true; barMet true only
// when the after row has no cause, so a bar verdict without a split object keeps it false). The
// file carries its own split object. The count the bar names is the bar files with no split plus
// those whose split is not an object.
//
//   node tools/contamination-row.mjs [--rev HEAD] [--nowrite]
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { contaminationRecords, contaminationRow, refereeOf, ROOT } from '../bench/gate.mjs';

const VERDICTS = path.join(ROOT, 'bench', 'verdicts');
const OUT = path.join(VERDICTS, 'contamination.json');

/** The split this verdict was measured on: pure. */
export function splitFor(opts = {}) {
  return {
    development: { what: 'the gate row (bench/gate.mjs contaminationRow) and the verdict writers were changed against the bar verdicts the row named at ' + (opts.rev || 'HEAD') },
    heldOut: { what: 'none: the row reads every verdict file under bench/verdicts, the same files the writers were changed for', n: 0 },
    contaminated: 'no held-out set: a census of every verdict file grades the files it was written to fix',
  };
}

/** The row over bench/verdicts at a git revision, or null with the reason when git cannot give it. */
export function rowAtRevision(rev = 'HEAD', { root = ROOT } = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), 'contamination-row-'));
  try {
    const tar = spawnSync('git', ['archive', '--format=tar', rev, 'bench/verdicts'], { cwd: root, maxBuffer: 1 << 30 });
    if (tar.status !== 0) return { row: null, why: 'git archive ' + rev + ' exited ' + tar.status + ': ' + String(tar.stderr || '').trim().split('\n')[0] };
    const x = spawnSync('tar', ['-x', '-C', dir], { input: tar.stdout, maxBuffer: 1 << 30 });
    if (x.status !== 0) return { row: null, why: 'tar exited ' + x.status };
    return { row: contaminationRow(contaminationRecords(path.join(dir, 'bench', 'verdicts'))), why: null };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const brief = (r) => r && { ok: r.ok, counts: r.counts, withoutSplitObject: r.counts.noSplit + r.counts.splitNotObject, noSplit: r.noSplit, splitNotObject: r.splitNotObject, labelled: r.labelled, unlabelled: r.unlabelled, unread: r.unread, line: r.line };

async function main(argv) {
  const at = (i) => argv[argv.indexOf(i) + 1];
  const rev = argv.includes('--rev') ? at('--rev') : 'HEAD';
  const write = !argv.includes('--nowrite');
  const command = 'node tools/contamination-row.mjs' + (argv.length ? ' ' + argv.join(' ') : '');
  const before = rowAtRevision(rev);
  const after = contaminationRow(contaminationRecords(VERDICTS), { referee: refereeOf(ROOT) });
  console.log('BEFORE (' + rev + '): ' + (before.row ? before.row.line : 'not read: ' + before.why));
  console.log('AFTER (working tree): ' + after.line);
  const nb = before.row ? before.row.counts.noSplit + before.row.counts.splitNotObject : null;
  const na = after.counts.noSplit + after.counts.splitNotObject;
  const remainder = after.noSplit.concat(after.splitNotObject.map((r) => r.file));
  console.log('bar files without a split object: ' + (nb === null ? 'n/a' : nb) + ' before, ' + na + ' after' + (remainder.length ? ' (' + remainder.join(', ') + ')' : ''));
  const barMet = after.ok === true;
  const statement = 'The CONTAMINATION row of bench/gate.mjs, applied by its own functions, counted '
    + (before.row ? before.row.counts.bar + ' bar files at ' + rev + ' with ' + nb + ' carrying no split object (' + before.row.counts.noSplit + ' with no split, ' + before.row.counts.splitNotObject + ' whose split is not an object)' : 'nothing at ' + rev + ' (' + before.why + ')')
    + ', and ' + after.counts.bar + ' bar files in the working tree with ' + na + ' carrying no split object (' + after.counts.noSplit + ' with no split, ' + after.counts.splitNotObject + ' whose split is not an object)'
    + (remainder.length ? ': ' + remainder.join(', ') : '') + '. '
    + 'A split given as a reason string in contaminated is counted by the row as a split object and not as contaminated, since the row counts contaminated only when it is true. '
    + (barMet ? 'The row has no cause left, so the bar is met.' : 'The row still has ' + after.causes.length + ' cause(s), so the bar is not met.');
  const verdict = {
    at: new Date().toISOString(), command, node: process.version, isTheBar: true, barMet,
    statement,
    split: splitFor({ rev }),
    bar: { rule: 'node bench/gate.mjs --contamination has no cause: every bar verdict carries a split object and a contaminated one says so', withoutSplitObjectBefore: nb, withoutSplitObjectAfter: na },
    before: before.row ? { rev, ...brief(before.row) } : { rev, why: before.why },
    after: { referee: after.referee, ...brief(after) },
    remainder,
    model: null,
  };
  if (write) {
    writeFileSync(OUT, JSON.stringify(verdict, null, 1) + '\n');
    console.log('wrote ' + path.relative(ROOT, OUT).split(path.sep).join('/') + ' (isTheBar true, barMet ' + barMet + ')');
  }
  return verdict;
}

const isMain = Boolean(process.argv[1]) && existsSync(process.argv[1]) && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) await main(process.argv.slice(2));
export { main };
void fileURLToPath;
