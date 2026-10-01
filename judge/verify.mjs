// judge/verify.mjs: THE LOCK CHECK. Recomputes the sha256 of every file judge/LOCK.json names and compares.
//   node judge/verify.mjs [--root <dir>]      prints "LOCK OK <n> files" (exit 0) or "LOCK DRIFT <file>" (exit 1)
// A file is hashed as text with CRLF read as LF, so a Windows and a Linux checkout of the same bytes agree.
// Drift is: LOCK.json missing or unreadable, a named file missing or changed, or a held-out set on disk
// that LOCK.json does not name (a new class's truth enters only through a human session's re-lock).
// The routine may not edit judge/ or grow/contract.mjs, and it re-locks nothing (judge/README.md).
// Author: board 37 builder, item judge, 2026-09-30.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = path.resolve(HERE, '..');
export const LOCK_FILE = 'judge/LOCK.json';
const USAGE = 'usage: node judge/verify.mjs [--root <dir>]   prints LOCK OK <n> files, or LOCK DRIFT <file> and exits 1';

/** sha256 hex of a text file, CRLF read as LF. */
export function shaText(buf) {
  return crypto.createHash('sha256').update(String(buf).replace(/\r\n/g, '\n')).digest('hex');
}
/** sha256 hex of a file under root, or null when it cannot be read. */
export function shaFile(root, rel) {
  try { return shaText(fs.readFileSync(path.join(root, rel), 'utf8')); } catch { return null; }
}
/** Every held-out set under root, as root-relative posix paths, sorted. */
export function heldoutFiles(root) {
  const dir = path.join(root, 'judge', 'heldout');
  let names = [];
  try { names = fs.readdirSync(dir).filter((n) => n.endsWith('.jsonl')).sort(); } catch { names = []; }
  return names.map((n) => 'judge/heldout/' + n);
}
/** The files the lock covers (judge/lock.mjs writes exactly these). */
export function lockedFiles(root) {
  return ['judge/judge.mjs', 'judge/select.mjs', 'judge/verify.mjs', 'judge/baseline.mjs', 'judge/control.jsonl', ...heldoutFiles(root), 'grow/contract.mjs'];
}

/**
 * Check the lock under root.
 * @returns {{ ok: boolean, n: number, drift: string|null, reason: string|null, judgeSha: string|null }}
 */
export function verifyLock(root = DEFAULT_ROOT) {
  let text = null, lock = null;
  try { text = fs.readFileSync(path.join(root, LOCK_FILE), 'utf8'); lock = JSON.parse(text); } catch { lock = null; }
  const files = lock && lock.files && typeof lock.files === 'object' && !Array.isArray(lock.files) ? lock.files : null;
  if (!files || !Object.keys(files).length) return { ok: false, n: 0, drift: LOCK_FILE, reason: 'LOCK.json is missing, unreadable or names no file', judgeSha: null };
  const judgeSha = shaText(text);
  const named = Object.keys(files).sort();
  for (const rel of named) {
    const got = shaFile(root, rel);
    if (got === null) return { ok: false, n: named.length, drift: rel, reason: 'the file is missing', judgeSha };
    if (got !== files[rel]) return { ok: false, n: named.length, drift: rel, reason: 'the sha256 changed', judgeSha };
  }
  for (const rel of lockedFiles(root)) {
    if (!(rel in files)) return { ok: false, n: named.length, drift: rel, reason: 'the file is not in LOCK.json', judgeSha };
  }
  return { ok: true, n: named.length, drift: null, reason: null, judgeSha };
}

function main(argv) {
  if (argv.includes('--help') || argv.includes('-h')) { console.log(USAGE); return 0; }
  const i = argv.indexOf('--root');
  if (i >= 0 && !argv[i + 1]) { console.log('--root needs a directory. ' + USAGE); return 2; }
  const root = i >= 0 ? path.resolve(argv[i + 1]) : DEFAULT_ROOT;
  const v = verifyLock(root);
  if (v.ok) { console.log('LOCK OK ' + v.n + ' files'); return 0; }
  console.log('LOCK DRIFT ' + v.drift);
  return 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
