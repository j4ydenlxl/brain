// tools/budget.mjs: A PROCESS BUDGET WRAPPER. Nothing launched on this machine may take it down again.
//
// Born 2026-09-23 (MANUAL.md header, the BUDGETS rule): a census of organism/scale-52000 reached
// 62 GB private on a 64 GB machine and a soak daemon wrote a 1 TB ledger.jsonl, both with no cap.
// This file runs one command under up to three caps and kills its WHOLE process tree at the first
// cap crossed:
//
//   node tools/budget.mjs --ram-mb N --disk-mb N --cpu-s N --dir <watched dir> -- <command> [args]
//
// Options (all optional; a cap left out is not enforced, a disk cap needs --dir):
//   --ram-mb N         kill when the tree's summed working set passes N MB
//   --ram-metric M     ws (default: working set, VmRSS on Linux), private (private bytes, RssAnon)
//                      or max (the larger of the two)
//   --disk-mb N        kill when the bytes under --dir pass N MB (a stat walk, readdir cached by
//                      directory mtime, so a quiet tree costs one stat per file per sample)
//   --cpu-s N          kill when the tree's summed CPU seconds pass N
//   --dir PATH         the watched directory
//   --interval-ms N    sample period, default 2000
//   --status-s N       one status line every N seconds, default 60
//   --record PATH      run record, default state/budget/last.json
//   --wait-free-ram-mb N   before spawning, wait until os.freemem() reaches N MB (the BUDGETS rule
//                      says wait under 16 GB free); --wait-max-s bounds the wait (default 1800)
//   --shell            run the command through the shell (npm.cmd and friends on Windows)
//   --keep-orphans     when the command exits on its own, leave descendants it left behind
//                      running (the default kills them: a budget that lets a child escape by
//                      outliving its parent is not a budget)
//   --no-reaper        do not start the detached reaper (see "the reaper" below)
//   --no-record        write no run record
//
// What it does: the child is spawned with stdio inherited and its exit code passed through. Every
// interval the wrapper samples every process (Windows: ONE long lived PowerShell running
// Get-CimInstance Win32_Process, about 150 ms a query on this machine, no wmic; Linux and the
// container: /proc/<pid>/stat for the parent links and /proc/<pid>/status VmRSS for the tree),
// finds the child's tree by parent links and creation times (a pid reused by a stranger is not
// the tree), sums working set and CPU seconds, walks the watched dir, and prints one status line
// per --status-s. At a cap it prints "BUDGET KILLED <which> <value> over <cap>", terminates every
// process of the tree, re-samples until none of them is alive, and exits 137. Either way it
// writes a run record (peak RSS, peak dir bytes, CPU seconds, wall, outcome, and for a kill the
// pid tree and the kill timings) to --record.
//
// The time to kill is reported as an upper bound: the tree was under the cap at the start of the
// last under-cap sample, so the cap was crossed after that moment, and the tree is dead at the end
// of the verifying sample that found none of it alive. deadMs minus lastUnderMs can only
// overstate the real time from crossing to dead.
//
// Known limits, stated so nobody quotes past them: a descendant that is born AND whose parent dies
// inside one sample gap is linked on Windows only through a parent pid the wrapper never saw, so
// it is not attributed (Linux catches it by process group, the child is spawned as a group
// leader); CPU a process spends after its last sample and before it exits is not counted. A
// wrapper killed outright gets no chance to run: on Windows libuv's kill-on-close job takes its
// direct child down with it, but a detached or non-node grandchild survived that (measured), so a
// detached reaper holding the wrapper's last report of the tree kills what is left.
//
// The Linux reaper (board 17 builder (the organism's item), gap budget-linux, 2026-09-26): on
// Linux the reaper walks /proc BEFORE it kills anything, from the child and from every reported
// member still alive under its own identity, along every ppid chain, deepest first, the child
// last (act/shell.mjs killPosixTree, the shell-linux item's walker, imported by name and lazily,
// in the reaper only: the wrapper itself never loads it). So a descendant the wrapper never
// reported (born after its last sample, detached into a group and a session of its own) dies too
// while its chain to the child holds. No ps, no pkill: /proc is the source. Without a readable
// /proc, or when the walker cannot load, the reaper falls back to the report-based reap (the
// process group kill and the reported pids) and its printed line says so. Windows is unchanged.
//
// Library form: budget(cmd, args, caps) resolves to the run record; caps takes ramMb, diskMb,
// cpuS, dir, intervalMs, statusMs, ramMetric, record (a path, or false for none), stdio, env,
// cwd, shell, keepOrphans, signal (an AbortSignal), waitFreeRamMb, waitMaxS, log (a line
// sink, default stderr), onSpawn(child) and onSample(row).
import { spawn } from 'node:child_process';
import { readdirSync, statSync, lstatSync, readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { performance } from 'node:perf_hooks';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const DEFAULT_RECORD = path.join(ROOT, 'state', 'budget', 'last.json');
export const KILL_EXIT_CODE = 137;
export const ABORT_EXIT_CODE = 130;
export const REFUSED_EXIT_CODE = 2;
export const DEFAULT_INTERVAL_MS = 2000;
export const DEFAULT_STATUS_MS = 60000;
// consecutive failed samples tolerated; one more and the tree is killed (a budget that has
// stopped measuring fails closed, it does not keep running blind)
export const SAMPLER_FAILURES_TOLERATED = 2;
const MB = 1048576;
const IS_WIN = process.platform === 'win32';

const fmtMb = (b) => (b / MB).toFixed(1);
const r3 = (x) => (x === null || x === undefined ? null : Number(Number(x).toFixed(3)));
const big = (s) => { try { return BigInt(s); } catch { return 0n; } };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function sleeper(ms) {
  let timer = null;
  const promise = new Promise((resolve) => { timer = setTimeout(resolve, ms); });
  return { promise, cancel: () => clearTimeout(timer) };
}

// ======================================================================= process samplers
// Windows: one PowerShell for the whole run. It warms the CIM provider before READY (the first
// query is the slow one), then answers each id written to its stdin with one line
// "S <id> pid,ppid,ws,private,cpu100ns,createdFileTime;..." and exits when stdin closes, so it
// can never outlive the wrapper's pipe.
const PS_SAMPLER = [
  "$ErrorActionPreference = 'Stop'",
  "$props = 'ProcessId','ParentProcessId','WorkingSetSize','PrivatePageCount','KernelModeTime','UserModeTime','CreationDate'",
  '$null = Get-CimInstance -ClassName Win32_Process -Property $props',
  "[Console]::Out.WriteLine('READY ' + $PID)",
  '[Console]::Out.Flush()',
  'while ($null -ne ($line = [Console]::In.ReadLine())) {',
  '  try {',
  '    $rows = Get-CimInstance -ClassName Win32_Process -Property $props',
  '    $sb = New-Object System.Text.StringBuilder',
  '    foreach ($p in $rows) {',
  '      $c = 0; if ($p.CreationDate) { $c = $p.CreationDate.ToFileTimeUtc() }',
  '      $t = [UInt64]$p.KernelModeTime + [UInt64]$p.UserModeTime',
  "      [void]$sb.Append($p.ProcessId).Append(',').Append($p.ParentProcessId).Append(',').Append($p.WorkingSetSize).Append(',').Append($p.PrivatePageCount).Append(',').Append($t).Append(',').Append($c).Append(';')",
  '    }',
  "    [Console]::Out.WriteLine('S ' + $line + ' ' + $sb.ToString())",
  '  } catch {',
  "    [Console]::Out.WriteLine('E ' + $line + ' ' + ($_.Exception.Message -replace '[\\r\\n]+', ' '))",
  '  }',
  '  [Console]::Out.Flush()',
  '}',
].join('\n');

export function parseWinSample(data) {
  const procs = new Map();
  for (const row of data.split(';')) {
    if (!row) continue;
    const f = row.split(',');
    if (f.length < 6) continue;
    const pid = Number(f[0]);
    if (!Number.isFinite(pid)) continue;
    procs.set(pid, {
      pid, ppid: Number(f[1]) || 0, pgrp: 0, state: 'R',
      ws: Number(f[2]) || 0, priv: Number(f[3]) || 0,
      cpuS: (Number(f[4]) || 0) / 1e7,
      created: f[5] || '0',
    });
  }
  return procs;
}

class WinSampler {
  constructor() { this.pending = new Map(); this.seq = 0; this.pid = 0; this.proc = null; this.closed = false; this.stderr = ''; }
  start(timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      const enc = Buffer.from(PS_SAMPLER, 'utf16le').toString('base64');
      const proc = spawn('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', enc],
        { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
      this.proc = proc;
      proc.stdin.on('error', () => { /* the sampler died; its exit handler rejects what is pending */ });
      proc.stderr.on('data', (d) => { if (this.stderr.length < 4000) this.stderr += d; });
      const timer = setTimeout(() => { reject(new Error('sampler did not start in ' + timeoutMs + ' ms')); this.stop(); }, timeoutMs);
      const rl = readline.createInterface({ input: proc.stdout });
      rl.on('line', (line) => {
        if (line.startsWith('READY ')) { this.pid = Number(line.slice(6)); clearTimeout(timer); resolve(this); return; }
        const kind = line[0];
        const sp = line.indexOf(' ', 2);
        const id = sp < 0 ? line.slice(2) : line.slice(2, sp);
        const rest = sp < 0 ? '' : line.slice(sp + 1);
        const p = this.pending.get(id);
        if (!p) return;
        this.pending.delete(id);
        if (kind === 'S') p.resolve(parseWinSample(rest)); else p.reject(new Error('sampler: ' + rest));
      });
      proc.on('error', (e) => { this.closed = true; clearTimeout(timer); reject(e); });
      proc.on('exit', (code) => {
        this.closed = true;
        clearTimeout(timer);
        const err = new Error('sampler exited ' + code + (this.stderr ? ': ' + this.stderr.trim().slice(0, 300) : ''));
        for (const p of this.pending.values()) p.reject(err);
        this.pending.clear();
        reject(err); // no effect once READY resolved
      });
    });
  }
  sample(timeoutMs = 15000) {
    if (this.closed || !this.proc) return Promise.reject(new Error('sampler closed'));
    const id = String(++this.seq);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error('sample timed out after ' + timeoutMs + ' ms')); }, timeoutMs);
      this.pending.set(id, { resolve: (v) => { clearTimeout(timer); resolve(v); }, reject: (e) => { clearTimeout(timer); reject(e); } });
      this.proc.stdin.write(id + '\n');
    });
  }
  detail() { /* the CIM row already carries working set and private bytes */ }
  stop() {
    if (!this.proc || this.closed) return Promise.resolve();
    return new Promise((resolve) => {
      const t = setTimeout(() => { try { this.proc.kill(); } catch { /* already gone */ } }, 3000);
      this.proc.once('exit', () => { clearTimeout(t); resolve(); });
      try { this.proc.stdin.end(); } catch { /* already closed */ }
    });
  }
}

// Linux (and the P13 container): /proc read in process, no helper process at all.
// /proc/<pid>/stat fields after the command name: state ppid pgrp session tty tpgid flags minflt
// cminflt majflt cmajflt utime stime cutime cstime priority nice threads itreal starttime vsize rss.
export function parseProcStat(text) {
  const open = text.indexOf('(');
  const close = text.lastIndexOf(')');
  const pid = Number(text.slice(0, open).trim());
  const f = text.slice(close + 2).trim().split(/\s+/);
  return {
    pid, state: f[0], ppid: Number(f[1]), pgrp: Number(f[2]),
    utime: Number(f[11]), stime: Number(f[12]), starttime: f[19], rssPages: Number(f[21]),
  };
}
export function parseProcStatus(text) {
  const kb = (k) => { const m = new RegExp('^' + k + ':\\s+(\\d+)\\s+kB', 'm').exec(text); return m ? Number(m[1]) * 1024 : null; };
  return { vmRss: kb('VmRSS'), rssAnon: kb('RssAnon') };
}

class ProcSampler {
  // USER_HZ is 100 on every mainstream Linux build (getconf CLK_TCK); a page is 4096 bytes on
  // x86_64 and arm64 defaults. Both only shape the fallback: VmRSS comes from status in bytes.
  constructor(procRoot = '/proc') { this.root = procRoot; this.pid = 0; this.clk = 100; this.page = 4096; }
  async start() { readdirSync(this.root); return this; }
  async sample() {
    const procs = new Map();
    for (const n of readdirSync(this.root)) {
      const c = n.charCodeAt(0);
      if (c < 48 || c > 57) continue;
      let s;
      try { s = parseProcStat(readFileSync(path.join(this.root, n, 'stat'), 'utf8')); } catch { continue; }
      procs.set(s.pid, {
        pid: s.pid, ppid: s.ppid, pgrp: s.pgrp, state: s.state,
        ws: s.rssPages * this.page, priv: 0,
        cpuS: (s.utime + s.stime) / this.clk, created: s.starttime,
      });
    }
    return procs;
  }
  detail(pids, procs) {
    for (const pid of pids) {
      const p = procs.get(pid);
      if (!p) continue;
      try {
        const st = parseProcStatus(readFileSync(path.join(this.root, String(pid), 'status'), 'utf8'));
        if (st.vmRss !== null) p.ws = st.vmRss;
        if (st.rssAnon !== null) p.priv = st.rssAnon;
      } catch { /* exited between the two reads */ }
    }
  }
  stop() { return Promise.resolve(); }
}

export function makeSampler() {
  if (IS_WIN) return new WinSampler();
  if (process.platform === 'linux') return new ProcSampler();
  throw new Error('tools/budget.mjs samples processes on win32 and linux only, not ' + process.platform);
}

// One snapshot of every process on the machine (a test or a bench listing a pid tree after a
// kill). Starts and stops its own sampler.
export async function listProcesses() {
  const s = makeSampler();
  await s.start();
  try { return await s.sample(); } finally { await s.stop(); }
}

// Which of these identities {pid, created} are alive in this snapshot.
export function aliveOf(identities, procs) {
  return identities.filter((id) => {
    const p = procs.get(id.pid);
    return p && p.created === id.created && p.state !== 'Z' && p.state !== 'X';
  });
}

export function killPids(pids, pgrp = 0) {
  if (!IS_WIN && pgrp > 1) { try { process.kill(-pgrp, 'SIGKILL'); } catch { /* group already gone */ } }
  let sent = 0;
  for (const pid of new Set(pids)) {
    if (!(pid > 0) || pid === process.pid) continue;
    try { process.kill(pid, 'SIGKILL'); sent++; } catch { /* already gone */ }
  }
  return sent;
}

// ======================================================================= the process tree
// Membership is by identity (pid plus creation time), never by pid alone: Windows reuses pids,
// and a child whose parent died keeps that dead parent's pid as its ppid. A process belongs to
// the tree when its parent identity does and it was created no earlier than that parent (a
// stranger holding a reused pid is younger than the tree member that held it first, so its own
// children are refused by the reuse check below).
export class ProcessTree {
  constructor(rootPid) {
    this.rootPid = rootPid;
    this.rootCreated = null;
    this.rootPgrp = 0;
    this.members = new Map(); // "pid:created" -> { pid, ppid, created, cpuS, unseen }
    this.deadCpuS = 0;        // CPU of members pruned after they died
  }
  // A tree rebuilt from identities someone else observed (the reaper, from the wrapper's last
  // report): [[pid, created], ...] plus the process group, so a root that already died is still
  // matched by its creation time and its orphans are still found.
  seed(ids, pgrp = 0) {
    for (const [pid, created] of ids) {
      if (pid === this.rootPid) this.rootCreated = String(created);
      this.members.set(pid + ':' + created, { pid, ppid: 0, created: String(created), cpuS: 0, unseen: 0 });
    }
    if (pgrp) this.rootPgrp = pgrp;
    return this;
  }
  update(procs) {
    const root = procs.get(this.rootPid);
    if (this.rootCreated === null) {
      if (!root) return [];
      this.rootCreated = root.created;
      this.rootPgrp = !IS_WIN && root.pgrp === this.rootPid ? root.pgrp : 0;
    }
    const alive = (p) => p && p.state !== 'Z' && p.state !== 'X';
    const byParent = new Map();
    for (const p of procs.values()) {
      let a = byParent.get(p.ppid);
      if (!a) byParent.set(p.ppid, (a = []));
      a.push(p);
    }
    const live = new Map();
    const queue = [];
    const take = (p) => { if (!alive(p) || live.has(p.pid)) return; live.set(p.pid, p); queue.push(p); };
    const ids = [{ pid: this.rootPid, created: this.rootCreated }, ...this.members.values()];
    for (const id of ids) { const p = procs.get(id.pid); if (p && p.created === id.created) take(p); }
    if (this.rootPgrp) {
      const born = big(this.rootCreated);
      for (const p of procs.values()) if (p.pgrp === this.rootPgrp && big(p.created) >= born) take(p);
    }
    const childrenOf = (id) => {
      const kids = byParent.get(id.pid);
      if (!kids) return;
      const holder = procs.get(id.pid);
      const reusedAt = holder && holder.created !== id.created ? big(holder.created) : null;
      const born = big(id.created);
      for (const c of kids) {
        const cb = big(c.created);
        if (cb < born) continue;
        if (reusedAt !== null && cb >= reusedAt) continue;
        take(c);
      }
    };
    for (const id of ids) childrenOf(id);
    while (queue.length) childrenOf(queue.shift());
    for (const m of this.members.values()) m.unseen++;
    for (const p of live.values()) {
      const k = p.pid + ':' + p.created;
      const m = this.members.get(k);
      if (m) { m.cpuS = Math.max(m.cpuS, p.cpuS); m.unseen = 0; m.ppid = p.ppid; } else this.members.set(k, { pid: p.pid, ppid: p.ppid, created: p.created, cpuS: p.cpuS, unseen: 0 });
    }
    // a member unseen for three samples is dead and its orphans, if any, are members by now
    for (const [k, m] of this.members) if (m.unseen >= 3) { this.deadCpuS += m.cpuS; this.members.delete(k); }
    return [...live.values()];
  }
  cpuTotal() { let s = this.deadCpuS; for (const m of this.members.values()) s += m.cpuS; return s; }
}

// ======================================================================= the watched dir
// A stat walk. A directory's entry list is re-read only when its mtime moved (adding, removing
// or renaming an entry moves it); every file is stat'ed every walk, because appending to a file
// does NOT move its directory's mtime. Every fullEvery-th walk re-reads every directory anyway,
// so an entry added inside one timestamp tick of a previous read is never missed for long.
export class DirMeter {
  constructor(root, { fullEvery = 15 } = {}) {
    this.root = path.resolve(root);
    this.cache = new Map();
    this.fullEvery = fullEvery;
    this.walks = 0;
  }
  measure() {
    const full = this.fullEvery > 0 && this.walks % this.fullEvery === 0;
    this.walks++;
    let bytes = 0, files = 0, dirs = 0, readdirs = 0;
    const seen = new Set();
    const stack = [this.root];
    while (stack.length) {
      const d = stack.pop();
      let st;
      try { st = statSync(d); } catch { this.cache.delete(d); continue; }
      if (!st.isDirectory()) { if (d === this.root) { bytes += st.size; files++; } continue; }
      dirs++;
      seen.add(d);
      let c = this.cache.get(d);
      if (full || !c || c.mtimeMs !== st.mtimeMs) {
        let ents;
        try { ents = readdirSync(d, { withFileTypes: true }); } catch { this.cache.delete(d); continue; }
        readdirs++;
        c = { mtimeMs: st.mtimeMs, subdirs: [], files: [] };
        for (const e of ents) {
          const p = path.join(d, e.name);
          if (e.isDirectory()) c.subdirs.push(p); else c.files.push(p); // symlinks sized, never followed
        }
        this.cache.set(d, c);
      }
      let missing = false;
      for (const f of c.files) {
        try { bytes += lstatSync(f).size; files++; } catch { missing = true; }
      }
      if (missing) this.cache.delete(d);
      for (const s of c.subdirs) stack.push(s);
    }
    if (this.cache.size > seen.size) for (const k of this.cache.keys()) if (!seen.has(k)) this.cache.delete(k);
    return { bytes, files, dirs, readdirs, full };
  }
}

// ======================================================================= the wrapper
function normalize(caps) {
  const num = (v) => (v === undefined || v === null || v === '' ? null : Number(v));
  const o = {
    ramMb: num(caps.ramMb), diskMb: num(caps.diskMb), cpuS: num(caps.cpuS),
    dir: caps.dir ? path.resolve(String(caps.dir)) : null,
    intervalMs: num(caps.intervalMs) ?? DEFAULT_INTERVAL_MS,
    statusMs: num(caps.statusMs) ?? DEFAULT_STATUS_MS,
    ramMetric: caps.ramMetric || 'ws',
    record: caps.record === false ? null : path.resolve(String(caps.record || DEFAULT_RECORD)),
    stdio: caps.stdio || 'inherit', env: caps.env, cwd: caps.cwd,
    shell: !!caps.shell, keepOrphans: !!caps.keepOrphans, signal: caps.signal || null,
    reaper: caps.reaper !== false,
    waitFreeRamMb: num(caps.waitFreeRamMb), waitMaxS: num(caps.waitMaxS) ?? 1800,
    log: caps.log || ((line) => process.stderr.write(line + '\n')),
    onSpawn: caps.onSpawn || null, onSample: caps.onSample || null,
  };
  for (const [k, flag] of [['ramMb', '--ram-mb'], ['diskMb', '--disk-mb'], ['cpuS', '--cpu-s']]) {
    if (o[k] !== null && !(o[k] > 0)) throw new Error(flag + ' must be a positive number, got ' + caps[k]);
  }
  if (o.diskMb !== null && !o.dir) throw new Error('a disk cap needs a watched directory (--dir)');
  if (!(o.intervalMs >= 100)) throw new Error('--interval-ms must be at least 100');
  if (!(o.statusMs >= 100)) throw new Error('--status-s must be at least 0.1');
  if (!['ws', 'private', 'max'].includes(o.ramMetric)) throw new Error('--ram-metric must be ws, private or max');
  return o;
}

const quoteArg = (a) => (/^[\w@%+=:,./\\-]+$/.test(a) ? a : '"' + String(a).replace(/"/g, '\\"') + '"');

function writeRecord(file, rec) {
  if (!file) return;
  mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + '.' + process.pid + '.tmp';
  writeFileSync(tmp, JSON.stringify(rec, null, 2) + '\n');
  renameSync(tmp, file);
}

function capText(which, value, cap) {
  if (which === 'cpu') return value.toFixed(2) + 's over ' + cap + 's';
  if (which === 'ram' || which === 'disk') return fmtMb(value) + 'MB over ' + cap + 'MB';
  return value + ' over ' + cap;
}

export function budget(cmd, args = [], caps = {}) { return runBudget(cmd, args, caps); }

async function runBudget(cmd, args, caps) {
  const o = normalize(caps);
  const log = o.log;
  const rec = {
    at: new Date().toISOString(),
    command: [cmd, ...args],
    cwd: o.cwd ? path.resolve(o.cwd) : process.cwd(),
    platform: process.platform,
    node: process.version,
    caps: { ramMb: o.ramMb, ramMetric: o.ramMetric, diskMb: o.diskMb, cpuS: o.cpuS, dir: o.dir, intervalMs: o.intervalMs, statusMs: o.statusMs },
    outcome: null, exitCode: null, signal: null, error: null, pid: null, startedAtEpochMs: null,
    killed: null, leftovers: [], overCapAtExit: [],
    peakRssBytes: 0, peakRssMb: 0, peakWsBytes: 0, peakPrivateBytes: 0,
    baselineDirBytes: null, peakDirBytes: null, peakDirMb: null, lastDirBytes: null,
    cpuSeconds: 0, wallMs: 0, wallS: 0,
    samples: 0, samplerErrors: 0, sampleMsMean: null, sampleMsMax: 0, samplerPid: null, samplerPeakWsMb: null,
    reaperPid: null, reaperPeakWsMb: null,
    walks: 0, walkMsMax: 0, walkEveryMax: 1, walkEntriesMax: 0,
    maxProcs: 0, pidsSeen: 0, freeRamMbAtStart: Math.round(os.freemem() / MB), hostMaxRssMb: null,
    record: o.record,
  };
  const finish = () => {
    rec.peakRssMb = r3(rec.peakRssBytes / MB);
    if (rec.peakDirBytes !== null) rec.peakDirMb = r3(rec.peakDirBytes / MB);
    rec.cpuSeconds = r3(rec.cpuSeconds);
    rec.wallS = r3(rec.wallMs / 1000);
    rec.hostMaxRssMb = r3(process.resourceUsage().maxRSS / 1024);
    writeRecord(o.record, rec);
    return rec;
  };

  // the BUDGETS rule: wait for free RAM before starting, never start into a starved machine
  if (o.waitFreeRamMb !== null) {
    const until = Date.now() + o.waitMaxS * 1000;
    let lastSaid = 0;
    while (os.freemem() / MB < o.waitFreeRamMb) {
      if (Date.now() >= until) {
        rec.outcome = 'refused'; rec.exitCode = REFUSED_EXIT_CODE;
        rec.error = 'free RAM ' + Math.round(os.freemem() / MB) + ' MB stayed under ' + o.waitFreeRamMb + ' MB for ' + o.waitMaxS + ' s';
        log('BUDGET REFUSED ' + rec.error);
        return finish();
      }
      if (Date.now() - lastSaid >= 30000) { log('BUDGET waiting: free RAM ' + Math.round(os.freemem() / MB) + ' MB under ' + o.waitFreeRamMb + ' MB'); lastSaid = Date.now(); }
      await sleep(Math.min(5000, Math.max(100, until - Date.now())));
    }
    rec.freeRamMbAtStart = Math.round(os.freemem() / MB);
  }

  const meter = o.dir ? new DirMeter(o.dir) : null;
  const walk = () => {
    const w0 = performance.now();
    const m = meter.measure();
    const ms = performance.now() - w0;
    rec.walks++;
    rec.walkMsMax = Math.max(rec.walkMsMax, r3(ms));
    rec.walkEntriesMax = Math.max(rec.walkEntriesMax, m.files + m.dirs);
    rec.lastDirBytes = m.bytes;
    rec.peakDirBytes = Math.max(rec.peakDirBytes ?? 0, m.bytes);
    return { bytes: m.bytes, ms };
  };
  if (meter) {
    const b = walk();
    rec.baselineDirBytes = b.bytes;
    if (o.diskMb !== null && b.bytes > o.diskMb * MB) {
      rec.outcome = 'refused'; rec.exitCode = REFUSED_EXIT_CODE;
      rec.error = 'the watched dir already holds ' + fmtMb(b.bytes) + ' MB, over the ' + o.diskMb + ' MB cap';
      log('BUDGET REFUSED disk ' + capText('disk', b.bytes, o.diskMb) + ' before start');
      return finish();
    }
  }

  const sampler = makeSampler();
  try { await sampler.start(); } catch (e) {
    rec.outcome = 'error'; rec.exitCode = REFUSED_EXIT_CODE; rec.error = 'sampler did not start: ' + e.message;
    log('BUDGET REFUSED ' + rec.error);
    await sampler.stop();
    return finish();
  }
  rec.samplerPid = sampler.pid || null;

  const t0 = performance.now();
  const rel = () => performance.now() - t0;
  rec.startedAtEpochMs = Date.now();
  let child;
  const spawnOpts = { stdio: o.stdio, env: o.env, cwd: o.cwd, windowsHide: true, detached: !IS_WIN };
  try {
    child = o.shell
      ? spawn([cmd, ...args].map(quoteArg).join(' '), { ...spawnOpts, shell: true })
      : spawn(cmd === 'node' ? process.execPath : cmd, args, spawnOpts);
  } catch (e) {
    rec.outcome = 'error'; rec.exitCode = 127; rec.error = e.message;
    await sampler.stop();
    return finish();
  }
  let exitInfo = null;
  const exited = new Promise((resolve) => {
    child.once('exit', (code, signal) => resolve({ code, signal, at: rel() }));
    child.once('error', (error) => resolve({ code: null, signal: null, error, at: rel() }));
  }).then((x) => { exitInfo = exitInfo || x; return exitInfo; });
  rec.pid = child.pid ?? null;
  if (o.onSpawn) { try { o.onSpawn(child); } catch { /* observer errors do not change the run */ } }
  const reaper = o.reaper && child.pid ? startReaper(child.pid) : null;
  rec.reaperPid = reaper ? reaper.pid ?? null : null;

  const tree = new ProcessTree(child.pid);
  const lastUnder = { ram: 0, disk: 0, cpu: 0 };
  let decision = null;
  let lastLive = [];
  let failures = 0;
  let sampleMsSum = 0;
  let nextDue = 0;
  let nextStatus = o.statusMs;
  let walkEvery = 1, walkSkip = 0;
  const now = { ram: 0, dir: rec.baselineDirBytes, cpu: 0, procs: 0 };
  const allPids = new Set();
  const abortP = o.signal
    ? new Promise((resolve) => { if (o.signal.aborted) resolve('abort'); else o.signal.addEventListener('abort', () => resolve('abort'), { once: true }); })
    : null;
  const exitP = exited.then(() => 'exit');

  const statusLine = () => {
    const part = (label, v, peak, cap, fmt, unit) => label + ' ' + fmt(v) + unit + ' (peak ' + fmt(peak) + unit + ', cap ' + (cap === null ? 'none' : cap + unit) + ')';
    const bits = [part('ram', now.ram, rec.peakRssBytes, o.ramMb, fmtMb, 'MB')];
    if (meter) bits.push(part('dir', now.dir ?? 0, rec.peakDirBytes ?? 0, o.diskMb, fmtMb, 'MB'));
    bits.push('cpu ' + now.cpu.toFixed(2) + 's (cap ' + (o.cpuS === null ? 'none' : o.cpuS + 's') + ')');
    bits.push('procs ' + now.procs);
    return 'BUDGET status ' + (rel() / 1000).toFixed(0) + ' s: ' + bits.join(', ');
  };

  if (child.pid !== undefined) {
    while (!exitInfo) {
      const timer = sleeper(Math.max(0, nextDue - rel()));
      const w = await Promise.race([exitP, timer.promise.then(() => 'tick'), ...(abortP ? [abortP] : [])]);
      timer.cancel();
      if (w === 'exit') break;
      if (w === 'abort') { decision = { which: 'abort', value: 1, cap: 0, overAt: rel() }; break; }
      nextDue = Math.max(nextDue + o.intervalMs, rel());
      const tStart = rel();
      let dirBytes = null;
      if (meter) {
        if (walkSkip <= 0) {
          const wk = walk();
          dirBytes = wk.bytes;
          // a walk costing more than a quarter of the period is spread over several periods
          walkEvery = Math.max(1, Math.min(15, Math.ceil(wk.ms / (o.intervalMs / 4))));
          rec.walkEveryMax = Math.max(rec.walkEveryMax, walkEvery);
          walkSkip = walkEvery - 1;
          now.dir = dirBytes;
        } else walkSkip--;
      }
      let procs;
      const s0 = performance.now();
      try { procs = await sampler.sample(); failures = 0; } catch (e) {
        failures++; rec.samplerErrors++;
        rec.error = 'sampler: ' + e.message;
        if (failures > SAMPLER_FAILURES_TOLERATED) { decision = { which: 'sampler', value: failures, cap: SAMPLER_FAILURES_TOLERATED, overAt: tStart }; break; }
        continue;
      }
      const sms = performance.now() - s0;
      rec.samples++; sampleMsSum += sms; rec.sampleMsMax = Math.max(rec.sampleMsMax, r3(sms));
      const live = tree.update(procs);
      sampler.detail(live.map((p) => p.pid), procs);
      let ws = 0, priv = 0;
      for (const p of live) { ws += p.ws; priv += p.priv; allPids.add(p.pid + ':' + p.created); }
      const ram = o.ramMetric === 'ws' ? ws : o.ramMetric === 'private' ? priv : Math.max(ws, priv);
      const cpu = tree.cpuTotal();
      if (sampler.pid) { const sp = procs.get(sampler.pid); if (sp) rec.samplerPeakWsMb = Math.max(rec.samplerPeakWsMb ?? 0, r3(sp.ws / MB)); }
      if (reaper && reaper.pid) { const rp = procs.get(reaper.pid); if (rp) rec.reaperPeakWsMb = Math.max(rec.reaperPeakWsMb ?? 0, r3(rp.ws / MB)); }
      now.ram = ram; now.cpu = cpu; now.procs = live.length;
      rec.peakRssBytes = Math.max(rec.peakRssBytes, ram);
      rec.peakWsBytes = Math.max(rec.peakWsBytes, ws);
      rec.peakPrivateBytes = Math.max(rec.peakPrivateBytes, priv);
      rec.cpuSeconds = Math.max(rec.cpuSeconds, cpu);
      rec.maxProcs = Math.max(rec.maxProcs, live.length);
      lastLive = live;
      tellReaper(reaper, live, tree.rootPgrp);
      const checks = [
        ['ram', ram, o.ramMb === null ? null : o.ramMb * MB, o.ramMb],
        ['disk', dirBytes, o.diskMb === null ? null : o.diskMb * MB, o.diskMb],
        ['cpu', cpu, o.cpuS, o.cpuS],
      ];
      for (const [which, value, capUnits, capShown] of checks) {
        if (capUnits === null || value === null) continue;
        if (value > capUnits) { if (!decision) decision = { which, value, cap: capShown, overAt: tStart }; } else lastUnder[which] = tStart;
      }
      if (o.onSample) { try { o.onSample({ atMs: r3(tStart), ramBytes: ram, wsBytes: ws, privateBytes: priv, dirBytes, cpuS: cpu, procs: live.length, sampleMs: r3(sms) }); } catch { /* observer only */ } }
      if (decision) break;
      if (rel() >= nextStatus) {
        log(statusLine());
        while (nextStatus <= rel()) nextStatus += o.statusMs;
      }
    }
  }

  if (decision) {
    // ------------------------------------------------------------ the kill
    const k = {
      which: decision.which, value: decision.which === 'cpu' ? r3(decision.value) : decision.value,
      valueMb: decision.which === 'ram' || decision.which === 'disk' ? r3(decision.value / MB) : null,
      cap: decision.cap,
      lastUnderMs: r3(lastUnder[decision.which] ?? 0), overAtMs: r3(decision.overAt),
      killIssuedMs: null, rootExitMs: null, deadMs: null, deadAtEpochMs: null, rounds: 0,
      timeToKillBoundMs: null, detectToDeadMs: null, tree: [], survivors: [],
    };
    if (decision.which !== 'abort') log('BUDGET KILLED ' + decision.which + ' ' + capText(decision.which, decision.value, decision.cap));
    else log('BUDGET aborted: killing the tree');
    const ids = new Map();
    const note = (ps) => { for (const p of ps) { const key = p.pid + ':' + p.created; if (!ids.has(key)) { ids.set(key, true); k.tree.push({ pid: p.pid, ppid: p.ppid, created: p.created }); } } };
    note(lastLive);
    k.killIssuedMs = r3(rel());
    const first = lastLive.map((p) => p.pid);
    if (!exitInfo && child.pid) first.push(child.pid);
    killPids(first, tree.rootPgrp);
    const exitWait = sleeper(5000);
    await Promise.race([exited, exitWait.promise]);
    exitWait.cancel();
    k.rootExitMs = exitInfo ? r3(exitInfo.at) : null;
    for (let round = 0; round < 8 && k.deadMs === null; round++) {
      let procs;
      try { procs = await sampler.sample(); } catch { await sleep(250); continue; }
      k.rounds++;
      const live = tree.update(procs);
      note(live);
      tellReaper(reaper, live, tree.rootPgrp);
      if (!live.length) { k.deadMs = r3(rel()); k.deadAtEpochMs = Date.now(); break; }
      killPids(live.map((p) => p.pid), tree.rootPgrp);
      await sleep(200);
    }
    if (k.deadMs === null) {
      try { const procs = await sampler.sample(); k.survivors = aliveOf(k.tree, procs); } catch { k.survivors = k.tree.slice(); }
    } else {
      // an abort crossed no cap, so there is no crossing to bound; only the stop latency is kept
      k.timeToKillBoundMs = decision.which === 'abort' ? null : r3(k.deadMs - k.lastUnderMs);
      k.detectToDeadMs = r3(k.deadMs - k.overAtMs);
    }
    rec.killed = k;
    rec.outcome = decision.which === 'abort' ? 'aborted' : 'killed';
    rec.exitCode = decision.which === 'abort' ? ABORT_EXIT_CODE : KILL_EXIT_CODE;
    if (decision.which !== 'abort') {
      log('BUDGET kill: ' + k.tree.length + ' processes, ' + (k.deadMs === null
        ? k.survivors.length + ' STILL ALIVE after ' + k.rounds + ' rounds'
        : 'all dead ' + (k.detectToDeadMs / 1000).toFixed(2) + ' s after the over-cap sample, at most ' + (k.timeToKillBoundMs / 1000).toFixed(2) + ' s after the cap was crossed'));
    }
    if (!exitInfo) { const w = sleeper(3000); await Promise.race([exited, w.promise]); w.cancel(); }
    if (exitInfo && exitInfo.signal) rec.signal = exitInfo.signal;
  } else {
    // ------------------------------------------------------------ the child exited on its own
    const x = exitInfo || (await exited);
    if (x.error) { rec.outcome = 'error'; rec.exitCode = 127; rec.error = x.error.message; log('BUDGET error: ' + x.error.message); }
    else {
      rec.outcome = 'exit';
      rec.signal = x.signal || null;
      rec.exitCode = x.code !== null ? x.code : 128 + (os.constants.signals[x.signal] || 0);
    }
    if (tree.rootCreated !== null) {
      try {
        const procs = await sampler.sample();
        const left = tree.update(procs);
        rec.cpuSeconds = Math.max(rec.cpuSeconds, tree.cpuTotal());
        for (const p of left) allPids.add(p.pid + ':' + p.created);
        rec.leftovers = left.map((p) => ({ pid: p.pid, ppid: p.ppid, created: p.created, killed: !o.keepOrphans }));
        if (left.length && !o.keepOrphans) {
          killPids(left.map((p) => p.pid), tree.rootPgrp);
          log('BUDGET the command left ' + left.length + ' processes behind; killed them (--keep-orphans keeps them)');
        }
      } catch (e) { rec.error = 'final sample: ' + e.message; }
    }
    if (meter) {
      const b = walk();
      if (o.diskMb !== null && b.bytes > o.diskMb * MB) rec.overCapAtExit.push('disk');
    }
    if (o.ramMb !== null && rec.peakRssBytes > o.ramMb * MB) rec.overCapAtExit.push('ram');
    if (o.cpuS !== null && rec.cpuSeconds > o.cpuS) rec.overCapAtExit.push('cpu');
    if (rec.overCapAtExit.length) log('BUDGET OVER ' + rec.overCapAtExit.join(',') + ' at exit: the command finished before a sample could kill it');
  }
  rec.wallMs = r3(rel());
  rec.pidsSeen = allPids.size;
  rec.sampleMsMean = rec.samples ? r3(sampleMsSum / rec.samples) : null;
  releaseReaper(reaper);
  await sampler.stop();
  finish();
  log('BUDGET done ' + (rec.outcome === 'exit' ? '' : rec.outcome + ', ') + 'exit ' + rec.exitCode + ': wall ' + rec.wallS.toFixed(2) + ' s, peak ram ' + fmtMb(rec.peakRssBytes) + 'MB'
    + (meter ? ', peak dir ' + fmtMb(rec.peakDirBytes) + 'MB' : '') + ', cpu ' + rec.cpuSeconds.toFixed(2) + ' s, ' + rec.samples + ' samples'
    + (o.record ? ', record ' + path.relative(process.cwd(), o.record).replace(/\\/g, '/') : ''));
  return rec;
}

// ======================================================================= the reaper
// Measured 2026-09-23 (notes/budget.md): a wrapper killed outright takes its direct child with it
// on Windows (libuv's kill-on-close job) but a detached grandchild survives, and on Linux nothing
// takes anything down. So every run starts a small DETACHED reaper (it must outlive the wrapper)
// fed over a stdin pipe: the wrapper writes the tree's identities after every sample and "DONE"
// when it ends cleanly. The pipe closing with no DONE means the wrapper died: the reaper kills the
// last tree it was told about, then lists every process to find descendants born after that
// report, kills those too, and exits. It never outlives the wrapper by more than that.
const SELF_FILE = fileURLToPath(import.meta.url);

function startReaper(rootPid) {
  try {
    const r = spawn(process.execPath, ['--max-old-space-size=64', SELF_FILE, '--reaper', String(rootPid)],
      { stdio: ['pipe', 'ignore', 'ignore'], detached: true, windowsHide: true });
    r.stdin.on('error', () => { /* the reaper is gone; the run itself is unaffected */ });
    r.on('error', () => { /* could not start: the run goes on without one */ });
    r.unref();
    return r;
  } catch { return null; }
}
function tellReaper(r, live, pgrp) {
  if (!r || !r.stdin.writable) return;
  r.stdin.write('T ' + JSON.stringify({ ids: live.map((p) => [p.pid, p.created]), pgrp: pgrp || 0 }) + '\n');
}
function releaseReaper(r) {
  if (!r || !r.stdin.writable) return;
  r.stdin.end('DONE\n');
}

export async function reap(rootPid, last) {
  const ids = last.ids || [];
  killPids(ids.length ? ids.map(([pid]) => pid) : [rootPid], last.pgrp || 0);
  let killed = 0;
  for (let round = 0; round < 3; round++) {
    await sleep(300);
    let procs;
    try { procs = await listProcesses(); } catch { break; }
    const live = new ProcessTree(rootPid).seed(ids, last.pgrp || 0).update(procs);
    if (!live.length) break;
    killed += killPids(live.map((p) => p.pid), last.pgrp || 0);
  }
  return killed;
}

// ------------------------------------------------ the Linux reaper: the /proc walk
// board 17 builder (the organism's item), gap budget-linux, 2026-09-26. reap() above kills the
// reported pids and the child's group, then re-lists by parent links. On Linux that misses a
// descendant the wrapper never reported once its parent is killed: a DETACHED one sits in a group
// and a session of its own, and a killed parent's children are re-parented at once, so no link
// leads to it any more. reapTree walks /proc FIRST, while every chain to the child still holds:
// act/shell.mjs killPosixTree freezes a root with SIGSTOP, walks /proc until the walk closes
// (a stopped process cannot fork), SIGKILLs every descendant deepest first, then the root and
// its group. The roots are the child and every reported member still alive under its reported
// identity (a pid whose start time moved is a stranger and is never walked). A re-listing of the
// reported tree by identity sweeps up the rest. Without a readable /proc, or when the walker
// does not load, it is reap() above, and the line says so.
export const PROC_ROOT = '/proc';
const WALKER_URL = new URL('../act/shell.mjs', import.meta.url).href;
const WALKER_NAME = 'act/shell.mjs killPosixTree';

function procStatOf(pid, procRoot) {
  try { return parseProcStat(readFileSync(path.join(procRoot, String(pid), 'stat'), 'utf8')); } catch { return null; }
}

/**
 * Take a dead wrapper's tree down on Linux. last is the wrapper's last report {ids: [[pid,
 * created], ...], pgrp}; opts.procRoot is where /proc is (a test points it at a missing dir to
 * turn the walk off), opts.walker replaces the lazily imported act/shell.mjs.
 * @returns {Promise<{by:string, proc:boolean, walker:string|null, roots:number, found:number,
 *   killed:number, swept:number, left:number|null, ms:number, note:string|null, line:string}>}
 */
export async function reapTree(rootPid, last = {}, opts = {}) {
  const t0 = performance.now();
  const procRoot = opts.procRoot || PROC_ROOT;
  const ids = Array.isArray(last.ids) ? last.ids : [];
  const pgrp = last.pgrp || 0;
  const rep = { by: 'group', proc: false, walker: null, roots: 0, found: 0, killed: 0, swept: 0, left: null, ms: 0, note: null, line: '' };
  try { readdirSync(procRoot); rep.proc = true; } catch { rep.note = 'no readable ' + procRoot + ' on this platform'; }
  let walker = opts.walker || null;
  if (rep.proc && !walker) {
    try { walker = await import(WALKER_URL); } catch (e) { rep.note = 'the walker act/shell.mjs did not load (' + e.message + ')'; }
  }
  if (walker && typeof walker.killPosixTree !== 'function') { rep.note = 'act/shell.mjs exports no killPosixTree'; walker = null; }
  if (!rep.proc || !walker) {
    rep.killed = await reap(rootPid, last);
    rep.ms = r3(performance.now() - t0);
    rep.line = 'BUDGET reaper: ' + rep.note + ': the process group kill and the reported pids alone (a detached descendant the wrapper never reported escapes it), '
      + rep.killed + ' killed in the re-listing, ' + rep.ms.toFixed(0) + ' ms';
    return rep;
  }
  rep.by = 'walk';
  rep.walker = WALKER_NAME;
  const reported = new Map(ids.map(([pid, created]) => [Number(pid), String(created)]));
  const aliveAs = (pid) => {
    const s = procStatOf(pid, procRoot);
    if (!s || s.state === 'Z' || s.state === 'X') return false;
    return !reported.has(pid) || s.starttime === reported.get(pid);
  };
  const roots = [rootPid, ...[...reported.keys()].filter((pid) => pid !== rootPid)];
  for (const pid of roots) {
    if (!(pid > 1) || pid === process.pid || !aliveAs(pid)) continue; // checked at its turn: an earlier walk may have killed it
    const t = walker.killPosixTree(pid, procRoot);
    rep.roots++;
    rep.found += t.found || 0;
    rep.killed += t.killed || 0;
  }
  if (pgrp > 1) { try { process.kill(-pgrp, 'SIGKILL'); } catch { /* the group went down with its members */ } }
  // the sweep: the reported tree re-listed by identity (and the child's group), as reap() does
  const sampler = new ProcSampler(procRoot);
  for (let round = 0; round < 3; round++) {
    await sleep(round === 0 ? 50 : 300);
    let procs;
    try { procs = await sampler.sample(); } catch { break; }
    const live = new ProcessTree(rootPid).seed(ids, pgrp).update(procs);
    rep.left = live.length;
    if (!live.length) break;
    rep.swept += killPids(live.map((p) => p.pid), pgrp);
  }
  rep.ms = r3(performance.now() - t0);
  rep.line = 'BUDGET reaper: the /proc walk (' + WALKER_NAME + ') from ' + rep.roots + ' root' + (rep.roots === 1 ? '' : 's') + ' found '
    + rep.found + ' descendant' + (rep.found === 1 ? '' : 's') + ' and killed ' + rep.killed + ' deepest first, the child last; the sweep killed '
    + rep.swept + ' more, ' + (rep.left === null ? 'unlisted' : rep.left + ' left') + ', ' + rep.ms.toFixed(0) + ' ms';
  return rep;
}

function reaperMain(rootPid) {
  let last = { ids: [], pgrp: 0 };
  let done = false;
  let buf = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i);
      buf = buf.slice(i + 1);
      if (line === 'DONE') done = true;
      else if (line.startsWith('T ')) { try { last = JSON.parse(line.slice(2)); } catch { /* a torn line: keep the previous report */ } }
    }
  });
  // Linux: the /proc walk first (reapTree); its line goes to this detached process's stderr,
  // which a wrapped run ignores and a reaper run by hand prints. Windows: reap(), as it was.
  const onEnd = !IS_WIN
    ? () => { if (!done) reapTree(rootPid, last).then((r) => { try { process.stderr.write(r.line + '\n'); } catch { /* no stderr */ } }).catch(() => {}); }
    : () => { if (!done) reap(rootPid, last).catch(() => {}); };
  process.stdin.once('end', onEnd);
  process.stdin.once('error', onEnd);
}

// ======================================================================= CLI
const USAGE = 'usage: node tools/budget.mjs [--ram-mb N] [--ram-metric ws|private|max] [--disk-mb N --dir PATH] [--cpu-s N]\n'
  + '       [--interval-ms 2000] [--status-s 60] [--record state/budget/last.json | --no-record]\n'
  + '       [--wait-free-ram-mb N] [--wait-max-s 1800] [--shell] [--keep-orphans] -- <command> [args]';

export function parseCli(argv) {
  const dd = argv.indexOf('--');
  const head = dd < 0 ? argv : argv.slice(0, dd);
  if (head.includes('--help') || head.includes('-h')) return { help: true };
  if (dd < 0 || dd === argv.length - 1) throw new Error('no command: put it after --');
  const valued = { 'ram-mb': 'ramMb', 'disk-mb': 'diskMb', 'cpu-s': 'cpuS', dir: 'dir', 'interval-ms': 'intervalMs', 'status-s': 'statusS', record: 'record', 'ram-metric': 'ramMetric', 'wait-free-ram-mb': 'waitFreeRamMb', 'wait-max-s': 'waitMaxS' };
  const flags = { shell: 'shell', 'keep-orphans': 'keepOrphans', 'no-record': 'noRecord', 'no-reaper': 'noReaper' };
  const caps = {};
  for (let i = 0; i < head.length; i++) {
    const a = head[i];
    if (!a.startsWith('--')) throw new Error('unexpected argument ' + a);
    let k = a.slice(2), v = null;
    const eq = k.indexOf('=');
    if (eq >= 0) { v = k.slice(eq + 1); k = k.slice(0, eq); }
    if (valued[k]) { if (v === null) { v = head[++i]; if (v === undefined) throw new Error(a + ' needs a value'); } caps[valued[k]] = v; }
    else if (flags[k]) caps[flags[k]] = true;
    else throw new Error('unknown option ' + a);
  }
  if (caps.statusS !== undefined) { caps.statusMs = Number(caps.statusS) * 1000; delete caps.statusS; }
  if (caps.noRecord) { caps.record = false; delete caps.noRecord; }
  if (caps.noReaper) { caps.reaper = false; delete caps.noReaper; }
  const [cmd, ...args] = argv.slice(dd + 1);
  return { cmd, args, caps };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain && process.argv[2] === '--reaper') reaperMain(Number(process.argv[3]));
else if (isMain) {
  let parsed;
  try { parsed = parseCli(process.argv.slice(2)); } catch (e) {
    process.stderr.write('BUDGET error: ' + e.message + '\n' + USAGE + '\n');
    process.exitCode = REFUSED_EXIT_CODE;
  }
  if (parsed && parsed.help) process.stdout.write(USAGE + '\n');
  else if (parsed) {
    const ac = new AbortController();
    const onSig = () => ac.abort();
    process.on('SIGINT', onSig);
    process.on('SIGTERM', onSig);
    budget(parsed.cmd, parsed.args, { ...parsed.caps, signal: ac.signal }).then((rec) => {
      process.exitCode = rec.exitCode;
      process.off('SIGINT', onSig);
      process.off('SIGTERM', onSig);
    }, (e) => {
      process.stderr.write('BUDGET error: ' + e.message + '\n');
      process.exitCode = REFUSED_EXIT_CODE;
      process.off('SIGINT', onSig);
      process.off('SIGTERM', onSig);
    });
  }
}
