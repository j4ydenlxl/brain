// grow/tar.mjs: a minimal ustar writer (and reader) for the sandbox runner, node built-ins only.
// POSIX ustar: one 512-byte header per entry (octal fields, a checksum over the header with the checksum
// field read as eight spaces, magic "ustar\0" version "00"), the body padded to 512 bytes, two zero blocks
// at the end. targz() gzips it with node:zlib for POST /v2/sandboxes/sessions/<sid>/fs/write.
// Author: board 37 sandbox builder, 2026-09-30.
import { gzipSync, gunzipSync } from 'node:zlib';

const BLOCK = 512;

function octal(value, width) {
  // width bytes: (width - 1) octal digits, zero padded, then a NUL
  const s = Math.floor(value).toString(8);
  if (s.length > width - 1) throw new Error('value ' + value + ' does not fit a ' + width + ' byte octal field');
  return s.padStart(width - 1, '0') + '\0';
}

function put(buf, offset, width, text) {
  const b = Buffer.from(text, 'utf8');
  if (b.length > width) throw new Error('"' + text + '" is over ' + width + ' bytes');
  b.copy(buf, offset);
}

/** Split a path into ustar prefix (155) and name (100) at a slash, or throw. */
export function splitName(name) {
  if (Buffer.byteLength(name) <= 100) return { prefix: '', name };
  for (let i = name.length - 1; i > 0; i--) {
    if (name[i] !== '/') continue;
    const prefix = name.slice(0, i), rest = name.slice(i + 1);
    if (Buffer.byteLength(prefix) <= 155 && Buffer.byteLength(rest) <= 100 && rest.length) return { prefix, name: rest };
  }
  throw new Error('the path "' + name + '" does not fit ustar name and prefix');
}

/** One 512-byte ustar header. */
export function header({ name, size = 0, mode = 0o644, mtime = 0, type = '0' }) {
  const h = Buffer.alloc(BLOCK, 0);
  const parts = splitName(name);
  put(h, 0, 100, parts.name);
  put(h, 100, 8, octal(mode, 8));
  put(h, 108, 8, octal(0, 8));
  put(h, 116, 8, octal(0, 8));
  put(h, 124, 12, octal(size, 12));
  put(h, 136, 12, octal(mtime, 12));
  put(h, 148, 8, '        ');
  put(h, 156, 1, type);
  put(h, 257, 6, 'ustar\0');
  put(h, 263, 2, '00');
  put(h, 265, 32, 'root');
  put(h, 297, 32, 'root');
  put(h, 345, 155, parts.prefix);
  let sum = 0;
  for (let i = 0; i < BLOCK; i++) sum += h[i];
  put(h, 148, 8, sum.toString(8).padStart(6, '0') + '\0 ');
  return h;
}

/**
 * Build an uncompressed tar archive.
 * @param {{name: string, data?: Buffer|string, mode?: number, type?: 'file'|'dir'}[]} entries
 * @returns {Buffer}
 */
export function tar(entries, { mtime = Math.floor(Date.now() / 1000) } = {}) {
  const out = [];
  const seen = new Set();
  for (const e of entries) {
    const isDir = e.type === 'dir';
    let name = String(e.name).replace(/\\/g, '/').replace(/^\.\//, '');
    if (!name || name.startsWith('/') || name.split('/').includes('..')) throw new Error('refusing the entry name "' + e.name + '"');
    if (isDir && !name.endsWith('/')) name += '/';
    if (seen.has(name)) throw new Error('duplicate entry "' + name + '"');
    seen.add(name);
    const body = isDir ? Buffer.alloc(0) : Buffer.isBuffer(e.data) ? e.data : Buffer.from(String(e.data ?? ''), 'utf8');
    out.push(header({ name, size: body.length, mode: e.mode ?? (isDir ? 0o755 : 0o644), mtime, type: isDir ? '5' : '0' }));
    if (body.length) {
      out.push(body);
      const pad = (BLOCK - (body.length % BLOCK)) % BLOCK;
      if (pad) out.push(Buffer.alloc(pad, 0));
    }
  }
  out.push(Buffer.alloc(BLOCK * 2, 0));
  return Buffer.concat(out);
}

/** tar() then gzip. */
export function targz(entries, opts) {
  return gzipSync(tar(entries, opts), { level: 9 });
}

/** Every directory entry a list of file paths needs, parents first (so any extractor makes them). */
export function withDirs(files) {
  const dirs = new Set();
  for (const f of files) {
    const parts = String(f.name).split('/');
    for (let i = 1; i < parts.length; i++) dirs.add(parts.slice(0, i).join('/'));
  }
  return [...[...dirs].sort().map((d) => ({ name: d, type: 'dir' })), ...files];
}

/** Read an uncompressed ustar archive back into [{ name, type, size, data }], checking every checksum. */
export function untar(buf) {
  const out = [];
  let off = 0;
  while (off + BLOCK <= buf.length) {
    const h = buf.subarray(off, off + BLOCK);
    if (h.every((b) => b === 0)) break;
    const field = (o, w) => h.subarray(o, o + w).toString('utf8').replace(/\0[\s\S]*$/, '');
    const want = parseInt(field(148, 8).trim(), 8);
    let sum = 0;
    for (let i = 0; i < BLOCK; i++) sum += i >= 148 && i < 156 ? 32 : h[i];
    if (sum !== want) throw new Error('bad checksum at offset ' + off + ': header sums to ' + sum + ', field says ' + want);
    if (field(257, 6) !== 'ustar') throw new Error('no ustar magic at offset ' + off);
    const prefix = field(345, 155), base = field(0, 100);
    const name = prefix ? prefix + '/' + base : base;
    const size = parseInt(field(124, 12).trim() || '0', 8);
    const type = field(156, 1) || '0';
    const data = Buffer.from(buf.subarray(off + BLOCK, off + BLOCK + size));
    out.push({ name, type: type === '5' ? 'dir' : 'file', size, data });
    off += BLOCK + Math.ceil(size / BLOCK) * BLOCK;
  }
  return out;
}

/** gunzip then untar. */
export function untargz(buf) {
  return untar(gunzipSync(buf));
}
