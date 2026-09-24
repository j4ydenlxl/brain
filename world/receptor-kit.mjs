// world/receptor-kit.mjs: WHAT THE FIVE RECEPTORS SHARE. His words for the item (P12, 2026-09-23):
// "It also should be able to feel five senses."
//
// A receptor is three functions with one contract, the same for every sense:
//   probe()   says whether this machine has the hardware, and HOW that was found out;
//   sample()  reads one sample: { bytes, latencyMs, encoding, hardware, source };
//   encode()  turns a sample into a perception signal: an 8192 lane bipolar hypervector
//             whose provenance is "sense:<name>".
// This file holds the parts they share: the PowerShell runner that reaches the Windows
// hardware APIs (no npm dependency can do it for us, and no native addon is allowed), one
// host probe for every device class so the machine is asked once and not five times, the
// hypervector codes, and the small decoders a receptor needs to read its own bytes (PNG,
// WAV, CSV) with nothing but node:zlib.
//
// Nothing here acts. Every PowerShell script in the receptors READS (a screen, a cursor, a
// device list, a microphone buffer); none of them writes to the screen, moves the cursor,
// presses a key or opens a socket, and test/senses.test.mjs scans the receptor sources for
// the Windows calls that would.
import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync, inflateSync } from 'node:zlib';
import * as S from '../core/signal.mjs';
import { RNG, hashBytes } from '../core/rng.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const FIXTURES = path.join(ROOT, 'bench', 'fixtures', 'senses');
export const LANES = S.D;
export const fixture = (name) => path.join(FIXTURES, name);
export const rel = (p) => path.relative(ROOT, p).replaceAll('\\', '/');
export const round = (x, d = 3) => (Number.isFinite(x) ? Math.round(x * 10 ** d) / 10 ** d : null);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// ---------------------------------------------------------------- PowerShell
// Windows PowerShell 5.1 ships with every Windows 11, and it can load .NET (System.Drawing,
// System.Windows.Forms) and P/Invoke into user32, winmm and Media Foundation. That is the
// whole reason this is the route to the hardware. The script travels on stdin to
// `-Command -` wrapped in one scriptblock, so nothing in it is ever re-parsed by a shell, no
// command line limit applies, and nothing a caller passes is spliced into a script except
// numbers and paths this module made itself.
export const POWERSHELL = 'powershell.exe';

/**
 * Run one PowerShell script and collect its stdout. Never throws: a missing executable, a
 * timeout or a non-zero exit comes back as { ok: false, reason }.
 * @returns {Promise<{ok: boolean, ms: number, out: string, err: string, reason?: string, code?: any}>}
 */
export function powershell(script, { exe = POWERSHELL, timeoutMs = 20000, maxBuffer = 256 * 1024 * 1024 } = {}) {
  const t0 = performance.now();
  if (exe === POWERSHELL && process.platform !== 'win32') return Promise.resolve({ ok: false, ms: 0, out: '', err: '', reason: 'not Windows (platform ' + process.platform + '), so no PowerShell route to the hardware' });
  // The whole script is one base64 literal decoded and invoked inside PowerShell: stdin is
  // read line by line by -Command -, and a here-string or a multi-line block split across
  // those lines would be parsed piecewise. One line of base64 cannot be split.
  const b64 = Buffer.from(script, 'utf8').toString('base64');
  const line = "& ([scriptblock]::Create([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('" + b64 + "'))))\n";
  return new Promise((resolve) => {
    let child = null, settled = false;
    const done = (v) => { if (!settled) { settled = true; resolve(v); } };
    try {
      child = execFile(exe, ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', '-'],
        { windowsHide: true, timeout: timeoutMs, maxBuffer, encoding: 'utf8' },
        (err, out, errOut) => {
          const ms = performance.now() - t0;
          if (err) done({ ok: false, ms, out: String(out || ''), err: String(errOut || ''), code: err.code ?? null, reason: (err.code === 'ENOENT' ? 'powershell not runnable (' + exe + ': ENOENT)' : err.killed ? 'powershell timed out after ' + timeoutMs + ' ms' : 'powershell failed: ' + String(err.message).split('\n')[0]) });
          else done({ ok: true, ms, out: String(out), err: String(errOut || '') });
        });
    } catch (e) {
      done({ ok: false, ms: performance.now() - t0, out: '', err: '', reason: 'powershell not runnable: ' + String(e && e.message || e) });
      return;
    }
    if (child && child.stdin) {
      child.stdin.on('error', () => { /* a child that never started has no stdin to write; the callback reports why */ });
      child.stdin.end(line);
    }
  });
}

/** Parse the one JSON object a receptor script prints last. */
export function lastJson(out) {
  const s = String(out || '').trim();
  const i = s.lastIndexOf('\n{');
  const text = i >= 0 ? s.slice(i + 1) : s;
  return JSON.parse(text);
}

// The C# every probe needs, compiled once per PowerShell process by Add-Type. Media
// Foundation is reached through its C API (MFCreateAttributes, MFEnumDeviceSources); the
// IMFAttributes vtable is declared up to SetGUID, the only method called, and every earlier
// slot is a placeholder that is never invoked, because a COM call goes by slot number.
const PROBE_CS = String.raw`
using System; using System.Runtime.InteropServices;
namespace BrainSenses {
  [ComImport, Guid("2cd2d921-c447-44a7-a13c-4adabfc247e3"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  public interface IMFAttributes {
    void GetItem(); void GetItemType(); void CompareItem(); void Compare(); void GetUINT32(); void GetUINT64(); void GetDouble(); void GetGUID(); void GetStringLength(); void GetString(); void GetAllocatedString(); void GetBlobSize(); void GetBlob(); void GetAllocatedBlob(); void GetUnknown(); void SetItem(); void DeleteItem(); void DeleteAllItems(); void SetUINT32(); void SetUINT64(); void SetDouble();
    [PreserveSig] int SetGUID([In, MarshalAs(UnmanagedType.LPStruct)] Guid guidKey, [In, MarshalAs(UnmanagedType.LPStruct)] Guid guidValue);
  }
  public static class Probe {
    [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
    [DllImport("mfplat.dll")] static extern int MFStartup(int version, int flags);
    [DllImport("mfplat.dll")] static extern int MFCreateAttributes(out IMFAttributes attrs, int initialSize);
    [DllImport("mf.dll")] static extern int MFEnumDeviceSources(IMFAttributes attrs, out IntPtr activates, out int count);
    [DllImport("winmm.dll")] public static extern int waveInGetNumDevs();
    [StructLayout(LayoutKind.Sequential)] struct LASTINPUTINFO { public uint cbSize; public uint dwTime; }
    [DllImport("user32.dll")] static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);
    public static long IdleMs() { LASTINPUTINFO l = new LASTINPUTINFO(); l.cbSize = (uint)Marshal.SizeOf(l); if (!GetLastInputInfo(ref l)) return -1; return (long)((uint)Environment.TickCount - l.dwTime); }
    public static int MfCount(string sourceType) {
      int hr = MFStartup(0x20070, 0); if (hr != 0) return -10;
      IMFAttributes a; hr = MFCreateAttributes(out a, 1); if (hr != 0) return -11;
      hr = a.SetGUID(new Guid("c60ac5fe-252a-478f-a0ef-bc8fa5f7cad3"), new Guid(sourceType)); if (hr != 0) return -12;
      IntPtr arr; int n; hr = MFEnumDeviceSources(a, out arr, out n); if (hr != 0) return -13;
      for (int i = 0; i < n; i++) { IntPtr p = Marshal.ReadIntPtr(arr, i * IntPtr.Size); if (p != IntPtr.Zero) Marshal.Release(p); }
      if (arr != IntPtr.Zero) Marshal.FreeCoTaskMem(arr);
      return n;
    }
  }
}`;
export const MF_VIDCAP = '8ac3587a-4ae7-42d8-99e0-0a6013eef90f';
export const MF_AUDCAP = '14dd9a1c-7cff-41be-b1b9-ba1ac6ecb571';
// A chemical sensor would have to show up as a device; these are the names one would carry.
export const CHEMICAL_NAMES = String.raw`(?i)\b(gas|voc|tvoc|olfact\w*|e-?nose|odou?r|smell|taste|gustat\w*|chemical|co2|air quality)\b`;

// One host probe answers every receptor: screens (DPI aware, so a 150 percent scaled 4K
// panel reads as 3840x2160 and not 2560x1440), the mouse, the Media Foundation capture
// sources for video and audio, the WinMM wave-in devices, the milliseconds since the last
// input event, and one scan of every Plug and Play device for the classes a receptor cares
// about. Every section has its own try, so one broken API cannot hide the others.
const PROBE_PS = String.raw`
$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue'
$sw = [Diagnostics.Stopwatch]::StartNew()
$r = [ordered]@{ errors = @() }
try { Add-Type -TypeDefinition @'
${PROBE_CS}
'@; [void][BrainSenses.Probe]::SetProcessDPIAware(); $r.compiled = $true } catch { $r.compiled = $false; $r.errors += ('add-type: ' + $_.Exception.Message) }
try {
  Add-Type -AssemblyName System.Windows.Forms
  $r.screens = @([System.Windows.Forms.Screen]::AllScreens | ForEach-Object { [ordered]@{ w = $_.Bounds.Width; h = $_.Bounds.Height; primary = $_.Primary; bpp = $_.BitsPerPixel } })
  $r.mouse = [System.Windows.Forms.SystemInformation]::MousePresent
  $r.mouseButtons = [System.Windows.Forms.SystemInformation]::MouseButtons
} catch { $r.screens = @(); $r.mouse = $false; $r.errors += ('forms: ' + $_.Exception.Message) }
if ($r.compiled) {
  try { $r.mfVideo = [BrainSenses.Probe]::MfCount('${MF_VIDCAP}') } catch { $r.mfVideo = -100; $r.errors += ('mf video: ' + $_.Exception.Message) }
  try { $r.mfAudio = [BrainSenses.Probe]::MfCount('${MF_AUDCAP}') } catch { $r.mfAudio = -100; $r.errors += ('mf audio: ' + $_.Exception.Message) }
  try { $r.waveIn = [BrainSenses.Probe]::waveInGetNumDevs() } catch { $r.waveIn = -100; $r.errors += ('winmm: ' + $_.Exception.Message) }
  try { $r.idleMs = [BrainSenses.Probe]::IdleMs() } catch { $r.idleMs = -1; $r.errors += ('idle: ' + $_.Exception.Message) }
}
try {
  $pnp = @(Get-CimInstance Win32_PnPEntity)
  $r.pnp = $pnp.Count
  $r.cameras = @($pnp | Where-Object { $_.PNPClass -in @('Camera', 'Image') } | ForEach-Object { [string]$_.Name })
  $r.keyboards = @($pnp | Where-Object { $_.PNPClass -eq 'Keyboard' } | ForEach-Object { [string]$_.Name })
  $r.mice = @($pnp | Where-Object { $_.PNPClass -eq 'Mouse' } | ForEach-Object { [string]$_.Name })
  $r.micEndpoints = @($pnp | Where-Object { $_.PNPClass -eq 'AudioEndpoint' -and $_.Name -match '(?i)microphone|mic\b|line in|headset' } | ForEach-Object { [string]$_.Name })
  $r.sensors = @($pnp | Where-Object { $_.PNPClass -eq 'Sensor' } | ForEach-Object { [string]$_.Name })
  $r.chemical = @($pnp | Where-Object { [string]$_.Name -match '${CHEMICAL_NAMES}' } | ForEach-Object { [string]$_.Name })
  $r.classes = @($pnp | Group-Object PNPClass | Where-Object { $_.Name } | ForEach-Object { [string]$_.Name } | Sort-Object)
} catch { $r.pnp = -1; $r.errors += ('pnp: ' + $_.Exception.Message) }
$r.psMs = [math]::Round($sw.Elapsed.TotalMilliseconds, 3)
[Console]::Out.Write(($r | ConvertTo-Json -Compress -Depth 4))
`;

const HOST = new Map();
/**
 * Ask the machine once what it has. Memoized per PowerShell executable for the life of the
 * process (fresh: true asks again), so five receptors cost one PowerShell start between them.
 * @returns {Promise<object>} { ok, ms, exe, screens, mouse, mfVideo, mfAudio, waveIn, idleMs, pnp, ... } or { ok: false, reason }
 */
export function probeHost({ exe = POWERSHELL, fresh = false } = {}) {
  if (!fresh && HOST.has(exe)) return HOST.get(exe);
  const p = powershell(PROBE_PS, { exe, timeoutMs: 45000 }).then((r) => {
    if (!r.ok) return { ok: false, ms: r.ms, exe, reason: r.reason };
    try {
      const j = lastJson(r.out);
      const arr = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);
      for (const k of ['screens', 'cameras', 'keyboards', 'mice', 'micEndpoints', 'sensors', 'chemical', 'classes', 'errors']) j[k] = arr(j[k]);
      return { ok: true, ms: r.ms, exe, ...j };
    } catch (e) {
      return { ok: false, ms: r.ms, exe, reason: 'probe printed no JSON: ' + String(e.message).slice(0, 120) + (r.err ? ' (stderr: ' + r.err.slice(0, 200) + ')' : '') };
    }
  });
  HOST.set(exe, p);
  return p;
}
export function forgetHost() { HOST.clear(); }

// ---------------------------------------------------------------- hypervector codes
// Every key vector is core/signal.mjs hvFromSeed(label), copied off the SIMD heap into a
// plain Int8Array and marked bipolar, so a receptor holds no heap slot and nothing it keeps
// can be reused under it. The same label always gives the same lanes, which is what lets
// cells/perception.mjs decode.hv (which calls hvFromSeed(name) itself) name a modality.
const KEYS = new Map();
const KEYS_MAX = 8192;
export function key(label) {
  let v = KEYS.get(label);
  if (v === undefined) {
    if (KEYS.size >= KEYS_MAX) KEYS.clear();
    const h = S.hvFromSeed(label);
    v = S.markBipolar(S.hvCopy(h));
    S.release(h);
    KEYS.set(label, v);
  }
  return v;
}

// A level code: L vectors where neighbours share most lanes and the two ends share half
// (similarity 0). Level k is level 0 with the first k * D / (2 (L - 1)) lanes of one seeded
// permutation flipped, so two readings that differ by one level differ by 1 / (L - 1) in
// similarity and nothing else. This is the standard thermometer code for hypervectors.
const BOOKS = new Map();
export function levels(label, L = 16) {
  const id = label + ':' + L;
  let book = BOOKS.get(id);
  if (book) return book;
  const D = LANES, rng = new RNG('senses:levels:' + label);
  const order = new Uint16Array(D);
  for (let i = 0; i < D; i++) order[i] = i;
  for (let i = D - 1; i > 0; i--) { const j = rng.int(i + 1); const t = order[i]; order[i] = order[j]; order[j] = t; }
  const per = Math.floor(D / 2 / Math.max(1, L - 1));
  const cur = Int8Array.from(key(label + ':level0'));
  book = [S.markBipolar(Int8Array.from(cur))];
  for (let k = 1; k < L; k++) {
    for (let j = (k - 1) * per; j < k * per; j++) cur[order[j]] = -cur[order[j]];
    book.push(S.markBipolar(Int8Array.from(cur)));
  }
  BOOKS.set(id, book);
  return book;
}
/** The level index of x on [lo, hi] in L levels; NaN lands on level 0, infinities on the nearest end. */
export function levelOf(x, lo, hi, L) {
  if (Number.isNaN(x)) return 0;
  const f = (clamp(x, lo, hi) - lo) / (hi - lo || 1);
  return clamp(Math.round(f * (L - 1)), 0, L - 1);
}

/** A lane accumulator: add role-bound terms, then take the sign. Ties go to a fixed seeded vector. */
export class Acc {
  constructor() { this.a = new Int32Array(LANES); this.n = 0; }
  add(v) { const a = this.a; for (let i = 0; i < a.length; i++) a[i] += v[i]; this.n++; return this; }
  /** add role (x) filler: the filler bound to its role, so the same filler in two roles is two terms */
  bind(role, filler) { const a = this.a; for (let i = 0; i < a.length; i++) a[i] += role[i] * filler[i]; this.n++; return this; }
  /** add role (x) majority(x, y, z): three channels read as one filler, bound to one role */
  bind3(role, x, y, z) { const a = this.a; for (let i = 0; i < a.length; i++) a[i] += role[i] * (x[i] + y[i] + z[i] > 0 ? 1 : -1); this.n++; return this; }
  sign() {
    const a = this.a, tie = key('senses:tie'), out = new Int8Array(a.length);
    for (let i = 0; i < a.length; i++) out[i] = a[i] > 0 ? 1 : a[i] < 0 ? -1 : tie[i];
    return S.markBipolar(out);
  }
}

// The perception signal a receptor emits: majority(K, C, K (x) rho(C)), where K is the
// modality key hvFromSeed('sense:<name>'), C is the content code and rho is a one lane roll.
// Each of K and C keeps similarity 0.5 with the result, so the modality can be read back by
// any cell that knows the key (decode.hv does) and the content still compares with content.
// The third term is K bound to the ROLLED content because K (x) C itself would bias every
// lane toward -1 (majority(k, c, kc) is -1 wherever k and c disagree), and every percept
// would then look 0.25 similar to every other one for no reason at all.
export function percept(sense, content) {
  const K = key('sense:' + sense), D = LANES, out = new Int8Array(D);
  for (let i = 0; i < D; i++) out[i] = K[i] + content[i] + K[i] * content[(i + D - 1) % D] > 0 ? 1 : -1;
  return S.markBipolar(out);
}
export function hvHash(v) { return (hashBytes(new Uint8Array(v.buffer, v.byteOffset, v.byteLength)) >>> 0).toString(16).padStart(8, '0'); }
export const isBipolarHv = (v) => v instanceof Int8Array && v.length === LANES && v.every((x) => x === 1 || x === -1);
export const simOf = (a, b) => S.sim(a, b);

/** The object every encode() returns: the percept, its provenance, and what went into it. */
export function perceptSignal(sense, content, fields = {}) {
  const hv = percept(sense, content);
  return { kind: 'hv', data: hv, content, sense, provenance: 'sense:' + sense, lanes: hv.length, hash: hvHash(hv), code: fields.code || '', features: fields.features || {} };
}

// ---------------------------------------------------------------- PNG
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };
/**
 * Decode a non-interlaced PNG (every colour type, bit depths 1 to 16) to 8 bit RGB.
 * System.Drawing writes 8 bit RGBA, which is the path that has to be fast (a 4K screen is
 * 33 MB of scanlines); the rest exist so any image file can be a fallback.
 * @returns {{width: number, height: number, rgb: Uint8Array, colorType: number, depth: number}}
 */
export function decodePng(buf) {
  if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf);
  if (buf.length < 8 || !buf.subarray(0, 8).equals(PNG_SIG)) throw new Error('decodePng: not a PNG (bad signature)');
  let off = 8, w = 0, h = 0, depth = 0, ct = 0, interlace = 0, palette = null;
  const idat = [];
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off), type = buf.toString('latin1', off + 4, off + 8), data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); depth = data[8]; ct = data[9]; interlace = data[12]; }
    else if (type === 'PLTE') palette = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (!w || !h) throw new Error('decodePng: no IHDR');
  if (interlace) throw new Error('decodePng: Adam7 interlaced PNG is not supported');
  const ch = CHANNELS[ct];
  if (!ch) throw new Error('decodePng: colour type ' + ct + ' is not a PNG colour type');
  const bitsPx = ch * depth, bpp = Math.max(1, bitsPx >> 3), stride = Math.ceil(w * bitsPx / 8);
  const raw = inflateSync(Buffer.concat(idat));
  if (raw.length < h * (stride + 1)) throw new Error('decodePng: scanlines are short (' + raw.length + ' of ' + h * (stride + 1) + ' bytes)');
  const px = new Uint8Array(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = y * (stride + 1) + 1, dst = y * stride, up = dst - stride;
    for (let i = 0; i < stride; i++) {
      const x = raw[src + i], a = i >= bpp ? px[dst + i - bpp] : 0, b = y > 0 ? px[up + i] : 0, c = y > 0 && i >= bpp ? px[up + i - bpp] : 0;
      let v;
      if (f === 0) v = x;
      else if (f === 1) v = x + a;
      else if (f === 2) v = x + b;
      else if (f === 3) v = x + ((a + b) >> 1);
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); }
      else throw new Error('decodePng: filter ' + f + ' on row ' + y);
      px[dst + i] = v & 255;
    }
  }
  const rgb = new Uint8Array(w * h * 3);
  if (depth === 8 && (ct === 2 || ct === 6)) {
    for (let y = 0, o = 0; y < h; y++) { let s = y * stride; for (let x = 0; x < w; x++, s += ch, o += 3) { rgb[o] = px[s]; rgb[o + 1] = px[s + 1]; rgb[o + 2] = px[s + 2]; } }
    return { width: w, height: h, rgb, colorType: ct, depth };
  }
  const max = (1 << depth) - 1;
  const sampleAt = (row, idx) => {
    if (depth === 16) return px[row + idx * 2];
    if (depth === 8) return px[row + idx];
    const bit = idx * depth, byte = px[row + (bit >> 3)], shift = 8 - depth - (bit & 7);
    return (byte >> shift) & max;
  };
  const scale = (v) => (depth >= 8 ? v : Math.round(v * 255 / max));
  for (let y = 0, o = 0; y < h; y++) {
    const row = y * stride;
    for (let x = 0; x < w; x++, o += 3) {
      if (ct === 3) { const k = sampleAt(row, x) * 3; rgb[o] = palette ? palette[k] : 0; rgb[o + 1] = palette ? palette[k + 1] : 0; rgb[o + 2] = palette ? palette[k + 2] : 0; continue; }
      if (ct === 0 || ct === 4) { const g = scale(sampleAt(row, x * ch)); rgb[o] = g; rgb[o + 1] = g; rgb[o + 2] = g; }
      else { rgb[o] = scale(sampleAt(row, x * ch)); rgb[o + 1] = scale(sampleAt(row, x * ch + 1)); rgb[o + 2] = scale(sampleAt(row, x * ch + 2)); }
    }
  }
  return { width: w, height: h, rgb, colorType: ct, depth };
}

let CRC = null;
function crc32(buf) {
  if (!CRC) { CRC = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; CRC[n] = c >>> 0; } }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0); out.write(type, 4, 'latin1'); data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}
/** Encode 8 bit RGB as a PNG (filter 0 on every row). Used to write the sight fixture. */
export function encodePng(width, height, rgb) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc(height * (width * 3 + 1));
  for (let y = 0; y < height; y++) { raw[y * (width * 3 + 1)] = 0; Buffer.from(rgb.buffer, rgb.byteOffset + y * width * 3, width * 3).copy(raw, y * (width * 3 + 1) + 1); }
  return Buffer.concat([PNG_SIG, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

/** Mean RGB of each cell of a gw x gh grid laid over the image (every pixel counted once). */
export function gridMeans(img, gw, gh) {
  const { width: w, height: h, rgb } = img, sums = new Float64Array(gw * gh * 3), counts = new Float64Array(gw * gh);
  const gxOf = new Int32Array(w);
  for (let x = 0; x < w; x++) gxOf[x] = Math.min(gw - 1, Math.floor(x * gw / w));
  for (let y = 0; y < h; y++) {
    const base = Math.min(gh - 1, Math.floor(y * gh / h)) * gw;
    for (let x = 0, o = y * w * 3; x < w; x++, o += 3) {
      const g = base + gxOf[x];
      sums[g * 3] += rgb[o]; sums[g * 3 + 1] += rgb[o + 1]; sums[g * 3 + 2] += rgb[o + 2]; counts[g]++;
    }
  }
  for (let g = 0; g < gw * gh; g++) { const n = counts[g] || 1; sums[g * 3] /= n; sums[g * 3 + 1] /= n; sums[g * 3 + 2] /= n; }
  return sums;
}

// ---------------------------------------------------------------- WAV
/**
 * Decode a RIFF WAVE file (PCM 8, 16, 24 or 32 bit, IEEE float 32, or the extensible header
 * around either) to mono float samples in [-1, 1], channels averaged.
 * @returns {{rate: number, channels: number, bits: number, format: number, samples: Float32Array}}
 */
export function decodeWav(buf) {
  if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf);
  if (buf.length < 12 || buf.toString('latin1', 0, 4) !== 'RIFF' || buf.toString('latin1', 8, 12) !== 'WAVE') throw new Error('decodeWav: not a RIFF WAVE file');
  let off = 12, fmt = null, data = null;
  while (off + 8 <= buf.length) {
    const id = buf.toString('latin1', off, off + 4), len = buf.readUInt32LE(off + 4), body = buf.subarray(off + 8, Math.min(buf.length, off + 8 + len));
    if (id === 'fmt ') fmt = body; else if (id === 'data') data = body;
    off += 8 + len + (len & 1);
  }
  if (!fmt || !data) throw new Error('decodeWav: missing ' + (!fmt ? 'fmt ' : 'data') + ' chunk');
  let format = fmt.readUInt16LE(0);
  const channels = fmt.readUInt16LE(2), rate = fmt.readUInt32LE(4), bits = fmt.readUInt16LE(14);
  if (format === 0xfffe && fmt.length >= 26) format = fmt.readUInt16LE(24);
  const bytes = bits >> 3, frames = Math.floor(data.length / (bytes * channels)), out = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let acc = 0;
    for (let c = 0; c < channels; c++) {
      const o = (f * channels + c) * bytes;
      let v;
      if (format === 3 && bits === 32) v = data.readFloatLE(o);
      else if (format === 1 && bits === 8) v = (data[o] - 128) / 128;
      else if (format === 1 && bits === 16) v = data.readInt16LE(o) / 32768;
      else if (format === 1 && bits === 24) v = data.readIntLE(o, 3) / 8388608;
      else if (format === 1 && bits === 32) v = data.readInt32LE(o) / 2147483648;
      else throw new Error('decodeWav: format ' + format + ' at ' + bits + ' bits is not supported');
      acc += v;
    }
    out[f] = acc / channels;
  }
  return { rate, channels, bits, format, samples: out };
}
/** Encode mono float samples as 16 bit PCM WAVE. Used to write the hearing fixture. */
export function encodeWav(rate, samples) {
  const n = samples.length, buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0, 'latin1'); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8, 'latin1');
  buf.write('fmt ', 12, 'latin1'); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36, 'latin1'); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(clamp(samples[i], -1, 32767 / 32768) * 32768), 44 + i * 2);
  return buf;
}

// ---------------------------------------------------------------- spectrum
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2, tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
      }
    }
  }
}
/**
 * Power spectrum of a mono signal in log-spaced bands: Hann windowed frames of n samples at
 * half overlap, power averaged over frames, then summed into bands from lo to hi Hz.
 * @returns {{bandsDb: Array<number|null>, edges: number[], rmsDbfs: number|null, peakHz: number|null, centroidHz: number|null, frames: number, silent: boolean}}
 */
export function spectrum(samples, rate, { n = 1024, bands = 32, lo = 40, hi = null } = {}) {
  const top = Math.min(hi || rate / 2, rate / 2), edges = [];
  for (let b = 0; b <= bands; b++) edges.push(lo * (top / lo) ** (b / bands));
  const power = new Float64Array(n / 2 + 1), win = new Float64Array(n);
  for (let i = 0; i < n; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (n - 1));
  let frames = 0, sq = 0;
  for (let i = 0; i < samples.length; i++) sq += samples[i] * samples[i];
  const re = new Float64Array(n), im = new Float64Array(n);
  for (let start = 0; ; start += n >> 1) {
    for (let i = 0; i < n; i++) { re[i] = (samples[start + i] || 0) * win[i]; im[i] = 0; }
    fft(re, im);
    for (let k = 0; k <= n / 2; k++) power[k] += re[k] * re[k] + im[k] * im[k];
    frames++;
    if (start + n >= samples.length) break;
  }
  const band = new Float64Array(bands);
  let peakK = -1, peakP = 0, num = 0, den = 0;
  for (let k = 1; k <= n / 2; k++) {
    const hz = k * rate / n, p = power[k] / frames;
    if (p > peakP) { peakP = p; peakK = k; }
    num += hz * p; den += p;
    if (hz < lo || hz >= top) continue;
    let b = 0;
    while (b < bands - 1 && hz >= edges[b + 1]) b++;
    band[b] += p;
  }
  const rms = Math.sqrt(sq / Math.max(1, samples.length));
  const silent = !(den > 0);
  return {
    bandsDb: Array.from(band, (p) => (p > 0 ? 10 * Math.log10(p) : null)),
    edges: edges.map((e) => round(e, 1)),
    rmsDbfs: rms > 0 ? round(20 * Math.log10(rms), 2) : null,
    peakHz: silent ? null : round(peakK * rate / n, 1),
    centroidHz: silent ? null : round(num / den, 1),
    frames, silent,
  };
}

// ---------------------------------------------------------------- CSV
/** RFC 4180 style: comma separated, double quotes around a field that holds a comma or a quote. */
export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  const s = String(text).replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (q) {
      if (ch === '"') { if (s[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field !== '' || row.length) { row.push(field); if (row.length > 1 || row[0] !== '') rows.push(row); }
  return rows;
}
export const csvField = (v) => (/[",\n\r]/.test(String(v)) ? '"' + String(v).replaceAll('"', '""') + '"' : String(v));

const TABLES = new Map();
/**
 * Load a descriptor table (header row, then one compound per row). Memoized by path.
 * @returns {{name: string, path: string, header: string[], rows: object[], lines: string[], bytes: number, ms: number}}
 */
export function loadTable(file) {
  const hit = TABLES.get(file);
  if (hit) return hit;
  const t0 = performance.now();
  const text = readFileSync(file, 'utf8');
  const all = parseCsv(text);
  const header = all[0].map((h) => h.trim());
  const rows = all.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
  const lines = all.slice(1).map((r) => r.map(csvField).join(','));
  const t = { name: path.basename(file), path: rel(file), header, rows, lines, bytes: Buffer.byteLength(text), ms: performance.now() - t0 };
  TABLES.set(file, t);
  return t;
}
export const splitList = (s) => String(s || '').split(';').map((x) => x.trim().toLowerCase()).filter(Boolean);

// ---------------------------------------------------------------- the chemical senses
// Smell and taste have no hardware on a Windows desktop, and the probe says so from evidence,
// not assumption: one Plug and Play scan of every device for a chemical sensor's name and
// for the Sensor class. What feeds them instead is a descriptor table, and a sample is one
// row (or several, a mixture) of it: the bytes are the CSV lines, header included, so
// encode() needs nothing but the sample.

/** Where a fixture came from: its line in bench/fixtures/senses/SOURCES.md, or null. */
export function sourceOf(fileName) {
  try {
    const text = readFileSync(path.join(FIXTURES, 'SOURCES.md'), 'utf8');
    const tick = '\x60';
    return text.split(/\r?\n/).find((l) => l.startsWith('- ') && l.includes(tick + fileName + tick)) || null;
  } catch { return null; }
}

/** The probe of a chemical sense: hardware only if a device that could be one exists. */
export async function chemicalProbe(sense, table, opts = {}) {
  const host = await probeHost({ exe: opts.powershell, fresh: !!opts.fresh });
  const t = { name: table.name, path: table.path, rows: table.rows.length, bytes: table.bytes };
  if (!host.ok) return { sense, present: false, ms: round(host.ms), table: t, how: 'Plug and Play scan not run (' + host.reason + '); no chemical sensor is assumed; ' + sense + ' is read from the table ' + table.name };
  const found = host.chemical || [], sensors = host.sensors || [];
  return {
    sense, present: found.length > 0, ms: round(host.ms), table: t, found, sensors: sensors.length,
    how: 'Plug and Play scan of ' + host.pnp + ' devices: ' + (found.length ? found.length + ' named like a chemical sensor (' + found.join(', ') + ')' : 'none named gas, VOC, olfactory, e-nose, odour, taste or CO2') + ', Sensor class devices = ' + sensors.length + '; ' + sense + ' is read from the table ' + table.name,
  };
}

/**
 * One sample of a table sense. opts.mixture (names) or opts.compound (a name) or opts.index
 * (a row, wrapping) picks the rows; the default is row 0.
 */
export function tableSample(sense, table, opts = {}) {
  const t0 = performance.now();
  let idx;
  if (Array.isArray(opts.mixture) && opts.mixture.length) idx = opts.mixture.map((n) => table.rows.findIndex((r) => r.name === String(n).toLowerCase()));
  else if (opts.compound != null) idx = [table.rows.findIndex((r) => r.name === String(opts.compound).toLowerCase())];
  else { const n = table.rows.length; idx = [(((Number(opts.index) || 0) % n) + n) % n]; }
  const missing = idx.findIndex((i) => i < 0);
  if (missing >= 0) throw new Error(sense + ': no compound ' + JSON.stringify((opts.mixture || [opts.compound])[missing]) + ' in ' + table.name);
  const text = [table.header.join(','), ...idx.map((i) => table.lines[i])].join('\n') + '\n';
  return {
    sense, source: 'table:' + table.name, hardware: false, bytes: Buffer.from(text), latencyMs: round(performance.now() - t0),
    encoding: 'csv rows (' + table.header.join(',') + ')', compounds: idx.map((i) => table.rows[i].name), rows: idx,
  };
}

/** The rows a table sample carries, parsed back from its own bytes. */
export function sampleRows(s) {
  const all = parseCsv(Buffer.from(s.bytes).toString('utf8'));
  const header = all[0].map((h) => h.trim());
  return all.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
}
