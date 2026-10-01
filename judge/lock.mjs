// judge/lock.mjs: WRITES judge/LOCK.json over the judge, the control, every held-out set and grow/contract.mjs.
//   node judge/lock.mjs --by "<who and under what order>" [--root <dir>]
// Run by a HUMAN SESSION only, once per change a human made to the judge. The routine never runs it: it may
// not edit judge/ or grow/contract.mjs and it re-locks nothing (judge/README.md). judge/verify.mjs checks it.
// Author: board 37 builder, item judge, 2026-09-30.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_ROOT, LOCK_FILE, lockedFiles, shaFile, shaText } from './verify.mjs';

export const RULE = 'The routine may not edit judge/ or grow/contract.mjs, and it re-locks nothing: only a human session runs judge/lock.mjs. '
  + 'judge/select.mjs refuses every candidate while judge/verify.mjs prints LOCK DRIFT.';
const USAGE = 'usage: node judge/lock.mjs --by "<who and under what order>" [--root <dir>]   (a human session only)';

/** Write LOCK.json under root. @returns {{ file: string, n: number, judgeSha: string }} */
export function writeLock(root, by, at = new Date().toISOString()) {
  const files = {};
  for (const rel of lockedFiles(root)) {
    const sha = shaFile(root, rel);
    if (sha === null) throw new Error('cannot lock ' + rel + ': the file is missing');
    files[rel] = sha;
  }
  const text = JSON.stringify({ lockedAt: at, by, rule: RULE, files }, null, 2) + '\n';
  fs.writeFileSync(path.join(root, LOCK_FILE), text);
  return { file: LOCK_FILE, n: Object.keys(files).length, judgeSha: shaText(text) };
}

function main(argv) {
  if (argv.includes('--help') || argv.includes('-h')) { console.log(USAGE); return 0; }
  const get = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const by = get('--by');
  if (!by || !by.trim()) { console.log('no --by: a lock names who wrote it. ' + USAGE); return 2; }
  const root = get('--root') ? path.resolve(get('--root')) : DEFAULT_ROOT;
  try {
    const r = writeLock(root, by.trim());
    console.log(JSON.stringify({ lock: r.file, files: r.n, judgeSha: r.judgeSha, by: by.trim() }));
    return 0;
  } catch (e) {
    console.log(String((e && e.message) || e));
    return 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
