#!/usr/bin/env node
// tools/fetch-pack.mjs: fetch the knowledge pack (bench/fixtures/wiki/pack-200, 191 MB, never in git) from the
// public Blob store into the tree, by tools/pack-manifest.json (bytes + sha256 per file). A file already present
// with the right bytes and hash is left alone; anything else is downloaded to <file>.part, hashed, then renamed.
// This is the Vercel buildCommand (vercel.json), so a git push deploys the site with the pack; it is also the
// cloud session's way to get the pack (the routine's SHIP step). Exit 0 only when every file verifies.
//
//   node tools/fetch-pack.mjs [--dir <dir>] [--manifest <file>] [--only a.bin,b.bin] [--check] [--quiet]
//
// --check verifies without downloading (exit 2 when a file is missing or wrong). No token: the store is public.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

export function parseArgs(argv) {
  const o = { dir: null, manifest: path.join(HERE, 'pack-manifest.json'), only: null, check: false, quiet: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dir') o.dir = argv[++i];
    else if (a === '--manifest') o.manifest = argv[++i];
    else if (a === '--only') o.only = String(argv[++i] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--check') o.check = true;
    else if (a === '--quiet') o.quiet = true;
    else throw new Error('unknown argument ' + a);
  }
  return o;
}

export function readManifest(file) {
  const m = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (m.version !== 1 || typeof m.base !== 'string' || !m.files || typeof m.files !== 'object') throw new Error('bad manifest ' + file);
  for (const [name, f] of Object.entries(m.files)) {
    if (!/^[A-Za-z0-9._-]+$/.test(name)) throw new Error('bad file name in manifest: ' + name);
    if (!Number.isInteger(f.bytes) || f.bytes < 0 || !/^[0-9a-f]{64}$/.test(String(f.sha256))) throw new Error('bad entry ' + name);
  }
  return m;
}

export async function sha256File(file) {
  const h = createHash('sha256');
  await pipeline(fs.createReadStream(file), async function* (src) { for await (const c of src) h.update(c); });
  return h.digest('hex');
}

/** present | wrong-size | wrong-hash | missing */
export async function stateOf(file, want) {
  let st;
  try { st = fs.statSync(file); } catch { return 'missing'; }
  if (!st.isFile()) return 'missing';
  if (st.size !== want.bytes) return 'wrong-size';
  return (await sha256File(file)) === want.sha256 ? 'present' : 'wrong-hash';
}

async function download(url, dest, want, fetchImpl) {
  const part = dest + '.part';
  const res = await fetchImpl(url);
  if (!res.ok || !res.body) throw new Error('HTTP ' + res.status + ' for ' + url);
  const h = createHash('sha256');
  let bytes = 0;
  await pipeline(Readable.fromWeb(res.body), async function* (src) { for await (const c of src) { h.update(c); bytes += c.length; yield c; } }, fs.createWriteStream(part));
  const sha = h.digest('hex');
  if (bytes !== want.bytes || sha !== want.sha256) {
    try { fs.unlinkSync(part); } catch {}
    throw new Error('verify failed for ' + path.basename(dest) + ': bytes ' + bytes + ' sha256 ' + sha.slice(0, 12));
  }
  fs.renameSync(part, dest);
  return bytes;
}

/**
 * Bring dir up to the manifest. Returns { present, fetched, failed, bytesFetched, ms, rows }.
 * @param {object} opts { dir, manifest, only, check, quiet, fetch }
 */
export async function fetchPack(opts = {}) {
  const t0 = Date.now();
  const m = typeof opts.manifest === 'object' && opts.manifest ? opts.manifest : readManifest(opts.manifest ?? path.join(HERE, 'pack-manifest.json'));
  const dir = opts.dir ? path.resolve(opts.dir) : path.join(ROOT, m.dir);
  const fetchImpl = opts.fetch ?? globalThis.fetch;
  const names = Object.keys(m.files).filter((n) => !opts.only || opts.only.includes(n));
  fs.mkdirSync(dir, { recursive: true });
  const rows = [];
  let present = 0, fetched = 0, failed = 0, bytesFetched = 0;
  for (const name of names) {
    const want = m.files[name];
    const dest = path.join(dir, name);
    const before = await stateOf(dest, want);
    const row = { name, before, after: before, bytes: want.bytes, ms: 0, error: null };
    if (before === 'present') present++;
    else if (opts.check) failed++;
    else {
      const t = Date.now();
      try {
        bytesFetched += await download(m.base + name, dest, want, fetchImpl);
        row.after = 'present';
        fetched++;
      } catch (e) {
        row.after = 'failed';
        row.error = String(e && e.message || e);
        failed++;
      }
      row.ms = Date.now() - t;
    }
    rows.push(row);
    if (!opts.quiet) console.log(name.padEnd(14) + ' ' + String(want.bytes).padStart(10) + ' ' + before + (row.after !== before ? ' -> ' + row.after : '') + (row.ms ? ' ' + row.ms + 'ms' : '') + (row.error ? ' ' + row.error : ''));
  }
  return { dir, present, fetched, failed, bytesFetched, ms: Date.now() - t0, rows };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const o = parseArgs(process.argv.slice(2));
  const r = await fetchPack(o);
  console.log('pack ' + r.dir + ': ' + r.present + ' present, ' + r.fetched + ' fetched (' + r.bytesFetched + ' bytes), ' + r.failed + (o.check ? ' missing or wrong' : ' failed') + ', ' + r.ms + 'ms');
  process.exitCode = r.failed ? 2 : 0;
}
