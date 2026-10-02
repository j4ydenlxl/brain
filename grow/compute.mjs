#!/usr/bin/env node
// grow/compute.mjs: ITS OWN CLOUD COMPUTING (contract c12). His words (verbatim at the head of grow/NEO.md): "it should
// have its own cloud computer/stuff made by itself", "access to cloud computing and ability to do everything", "its should
// be all on cloud so even phones can use no hardware constraints its cloud ai", "$0 per token to run its ai datacenter in
// the cloud". The organism's compute is the runner minutes of its own repository. This file reads, with no model call and
// no person, what the month has left and plans the next beat of .github/workflows/heartbeat.yml (body/heartbeat.yml):
// how many minutes a runner grows, how many runners grow at once (shards, contract c8), and whether the beat hands over to
// the next one at once (relay).
//   PRIVATE (2,000 free runner minutes a month, shared by every workflow): the month's remaining minutes, less a reserve of
//   10 percent and less the plan job of every slot still to come, are spent EVENLY over the slots left in the month (one
//   slot per cron firing, every 3 hours); never more. A slot whose share is too small for one runner waits: one beat in
//   every k slots, sized k slots' share. Spent: no beat at all.
//   PUBLIC (no minute cap): beats relayed back to back, PUBLIC.shards runners (real computers) in one matrix when the tree
//   can use them: GitHub allows MAX_COMPUTERS jobs in one matrix and a free account runs CONCURRENT at once, queueing the
//   rest, so each runner's minutes are the longest beat divided by its waves (the beat's wall time stays near one beat).
//   NO API (no token, offline, 403, a rate limit): a safe small default, unless this month's ledger already says spent.
//   COMPUTERS (--computers N, the dispatch input `computers`, capped at MAX_COMPUTERS): exactly N runners in one matrix on
//   any repository. Each is a fresh computer that runs grow/machine.mjs step on its slice of the queue beside its swarm
//   shard. The cost in runner minutes (costMinutes) is on the plan line BEFORE the matrix starts; a private budget that
//   cannot pay it is a refusal (no beat) naming the number of computers it could pay.
// The spent minutes are read through the GitHub REST API with the token named GITHUB_TOKEN (GH_TOKEN as a fallback) in
// the environment, never printed, never written: every run of this repository created this month, each job rounded up to
// the whole minute as billing does (a Windows minute counts 2, a macOS minute 10, a self-hosted one 0). A completed run's
// minutes are cached in neo/COMPUTE.json (the month's ledger, written only with --write), so a beat asks only for new runs.
// Shards are planned only when this tree can run them: `node grow/swarm.mjs help` names --shard and --no-merge and
// `node grow/era.mjs --help` names --staged (feature-detected by running both); otherwise one runner runs the era as before.
// A public beat also runs a matrix when `node grow/machine.mjs help` names --shard and --out (machines): each runner then
// drives its own browser even when the swarm cannot shard.
// Bytes from the network are DATA: parsed as JSON, never evaluated, never followed. It never opens state/, judge/ or any
// neo/tasks/*/heldout.jsonl and writes nothing but neo/COMPUTE.json.
//   node grow/compute.mjs plan [--root <dir>] [--max-ms 60000] [--era <n>] [--repo <owner/name>] [--minutes <n>]
//                              [--budget 2000] [--now <iso>] [--computers <n>] [--write]   ONE JSON line, the plan (c12)
//   node grow/compute.mjs outputs '<plan line>'      the plan as key=value lines for $GITHUB_OUTPUT (a workflow helper)
//   node grow/compute.mjs lint [--file body/heartbeat.yml]   the workflow parsed by parseYaml: ONE JSON line
// Exit 0 on success (a plan made without the API is a success), 2 usage, 1 failure.
// Author: Opus 5.5 builder (COMPUTE) for the Fable 5.1 orchestrator, 2026-10-02.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = path.resolve(HERE, '..');
export const LEDGER = 'neo/COMPUTE.json';
export const WORKFLOW = '.github/workflows/heartbeat.yml';
export const API = 'https://api.github.com';
/** A private repository's free runner minutes a month (repository variable BRAIN_BUDGET_MINUTES or --budget overrides). */
export const BUDGET_MINUTES = 2000;
/** The reserve kept back from the month's budget, in percent: never spent by a beat. */
export const RESERVE_PCT = 10;
/** One slot per cron firing ("23 *\/3 * * *"): every 3 hours. */
export const SLOT_HOURS = 3;
export const SLOT_MS = SLOT_HOURS * 3600000;
const DAY_MS = 86400000;
/** The plan job of every slot, billed as a whole minute even when it only reads the plan. */
export const PLAN_JOB_MINUTES = 1;
/** What a runner job costs beyond its minutes of work: checkout, setup, artifacts, the minute rounding. */
export const JOB_OVERHEAD = 2;
/** The shortest beat worth a runner (an era needs room to measure and ship); the longest a job may run. */
export const MIN_BEAT = 4;
export const MAX_BEAT = 330;
/** No API: one runner, this many minutes, no relay. */
export const SAFE_BEAT = 4;
/** A public repository: the longest beats, relayed back to back, this many runners growing at once. */
export const PUBLIC = Object.freeze({ beatMinutes: 330, shards: 100, mergeMinutes: 60 });
/** The most jobs GitHub runs in one matrix; the jobs a free account runs at once (the rest wait in its queue). */
export const MAX_COMPUTERS = 256;
export const CONCURRENT = 20;
/** A private repository: at most this many runners at once (shards pay off only when one runner's cap binds). */
export const PRIVATE_MAX_SHARDS = 4;
/** The merge job's era in a private beat (it merges the stages and runs every other step once). */
export const MERGE_MINUTES = 10;
/** A runner minute's weight by its OS (billing multipliers). */
export const MULTIPLIER = Object.freeze({ linux: 1, windows: 2, macos: 10 });
/** API calls one plan may make, and how many at once. */
export const MAX_CALLS = 600;
export const PARALLEL = 8;
export const CALL_MS = 15000;
export const DEFAULT_MAX_MS = 60000;
/** Plans the ledger keeps. */
export const KEEP_PLANS = 48;
export const USAGE = [
  'usage: node grow/compute.mjs <verb> [flags]   (--root <dir>: another tree root)',
  '  plan [--max-ms ' + DEFAULT_MAX_MS + '] [--repo <owner/name>] [--minutes <n>] [--budget ' + BUDGET_MINUTES + '] [--now <iso>] [--computers <1..' + MAX_COMPUTERS + '>] [--write]',
  '      the next beat of the heartbeat: {"beatMinutes","shards","relay","why","month","budgetMinutes","spentMinutes","visibility","computers","costMinutes",..}',
  '  outputs \'<plan line>\'   the plan as key=value lines for $GITHUB_OUTPUT',
  '  lint [--file body/heartbeat.yml]   the workflow parsed: jobs, needs, matrix, the commands it runs',
].join('\n');

export class Fail extends Error { constructor(line, code = 1) { super(line); this.code = code; } }

// ---- small pure helpers
const isObj = (o) => Boolean(o) && typeof o === 'object' && !Array.isArray(o);
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const int = (v) => { const n = Number(v); return Number.isInteger(n) ? n : null; };
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const pad2 = (n) => String(n).padStart(2, '0');

/** The UTC month of a clock: its name and its bounds in ms. */
export function monthOf(now) {
  const d = new Date(now);
  const y = d.getUTCFullYear(), m = d.getUTCMonth();
  return { month: y + '-' + pad2(m + 1), start: Date.UTC(y, m, 1), end: Date.UTC(y, m + 1, 1) };
}

/** A clock from --now: an ISO string or ms; null when it is not one. */
export function clockOf(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = /^\d+$/.test(String(v)) ? Number(v) : Date.parse(String(v));
  return Number.isFinite(n) ? n : null;
}

/** The billing weight of a job by its runner labels: linux 1, windows 2, macos 10, self-hosted 0. */
export function weightOf(labels) {
  const ls = (Array.isArray(labels) ? labels : []).map((l) => String(l).toLowerCase());
  if (ls.includes('self-hosted')) return 0;
  if (ls.some((l) => l.startsWith('macos'))) return MULTIPLIER.macos;
  if (ls.some((l) => l.startsWith('windows'))) return MULTIPLIER.windows;
  return MULTIPLIER.linux;
}

/** One job's billed minutes: its run time rounded up to the whole minute, weighted; a running job counts up to `now`. */
export function jobMinutes(job, now) {
  if (!isObj(job)) return 0;
  const a = Date.parse(job.started_at);
  if (!Number.isFinite(a)) return 0;
  if (job.conclusion === 'skipped') return 0;
  let b = Date.parse(job.completed_at);
  if (!Number.isFinite(b)) b = num(now) ?? a;
  if (b <= a) return 0;
  return Math.ceil((b - a) / 60000) * weightOf(job.labels);
}

/** A run's billed minutes: the sum of its jobs. */
export const runMinutes = (jobs, now) => (Array.isArray(jobs) ? jobs : []).reduce((s, j) => s + jobMinutes(j, now), 0);

/** A run's wall minutes (an estimate when its jobs could not be read in time). */
export function wallMinutes(run, now) {
  const a = Date.parse(run && (run.run_started_at || run.created_at));
  let b = Date.parse(run && run.updated_at);
  if (!Number.isFinite(a)) return 0;
  if (!run || run.status !== 'completed' || !Number.isFinite(b)) b = now;
  return b > a ? Math.ceil((b - a) / 60000) : 0;
}

/** Is this run the heartbeat's own? */
export const isHeartbeat = (run) => isObj(run) && (String(run.path || '').startsWith(WORKFLOW) || run.name === 'heartbeat');

/** The cache key of a run: its id and attempt (a re-run adds jobs). */
export const runKey = (run) => String(run.id) + ':' + String(int(run.run_attempt) || 1);

/** The account's Actions minutes from GET /users/{u}/settings/billing/actions (null when the shape is not that). */
export function accountActions(j) {
  if (!isObj(j) || num(j.total_minutes_used) === null) return null;
  return { spent: Math.ceil(j.total_minutes_used), budget: num(j.included_minutes) && j.included_minutes > 0 ? j.included_minutes : null };
}

/** The account's Actions minutes of one month from GET /users/{u}/settings/billing/usage (null when none). */
export function accountUsage(j, month) {
  if (!isObj(j) || !Array.isArray(j.usageItems)) return null;
  let s = 0, seen = false;
  for (const it of j.usageItems) {
    if (!isObj(it) || String(it.product || '').toLowerCase() !== 'actions') continue;
    if (!/minute/i.test(String(it.unitType || ''))) continue;
    if (typeof it.date === 'string' && !it.date.startsWith(month)) continue;
    const q = num(it.quantity);
    if (q === null) continue;
    const sku = String(it.sku || '').toLowerCase();
    s += q * (sku.includes('macos') ? MULTIPLIER.macos : sku.includes('windows') ? MULTIPLIER.windows : MULTIPLIER.linux);
    seen = true;
  }
  return seen ? Math.ceil(s) : null;
}

// ---- the plan (pure)
/**
 * The runners of one beat with B runner minutes (the plan job not included): one runner of m minutes costs
 * m + JOB_OVERHEAD; n >= 2 shards of m minutes and a merge job of mm minutes cost n * (m + JOB_OVERHEAD) + mm + JOB_OVERHEAD.
 * Shards are taken only when they grow more minutes in total than one runner can (one runner's cap binds).
 * @returns {{ beatMinutes: number, shards: number, mergeMinutes: number }}
 */
export function chooseRunners(B, { sharded = false, maxShards = PRIVATE_MAX_SHARDS, mergeMinutes = MERGE_MINUTES, wallCap = MAX_BEAT } = {}) {
  const cap = Math.max(0, Math.min(MAX_BEAT, Math.floor(wallCap)));
  const m1 = Math.max(0, Math.min(cap, Math.floor(B - JOB_OVERHEAD)));
  let best = { beatMinutes: m1, shards: 1, mergeMinutes: 0, total: m1 };
  if (sharded) {
    const mm = Math.min(mergeMinutes, cap);
    for (let n = 2; n <= maxShards; n++) {
      const m = Math.min(cap - mm, Math.floor((B - mm - JOB_OVERHEAD - n * JOB_OVERHEAD) / n));
      if (m >= MIN_BEAT && n * m > best.total) best = { beatMinutes: m, shards: n, mergeMinutes: mm, total: n * m };
    }
  }
  return { beatMinutes: best.beatMinutes, shards: best.shards, mergeMinutes: best.mergeMinutes };
}

const none = (why) => ({ beatMinutes: 0, shards: 0, relay: false, mergeMinutes: 0, why });

/** The runner minutes of a beat of n runners of m minutes and a merge of mm (the plan job not included). */
export const costOf = (n, m, mm) => (n >= 2 ? n * (m + JOB_OVERHEAD) + mm + JOB_OVERHEAD : n === 1 ? m + JOB_OVERHEAD : 0);
/** How many computers of m minutes a budget of B runner minutes pays (n >= 2 carry a merge of mm; one runner none). */
export function payableOf(B, m, mm = MERGE_MINUTES) {
  const k = Math.floor((B - mm - JOB_OVERHEAD) / (m + JOB_OVERHEAD));
  if (k >= 2) return Math.min(MAX_COMPUTERS, k);
  return B >= m + JOB_OVERHEAD ? 1 : 0;
}
/** Each runner's minutes when n runners share a beat at CONCURRENT at once: the longest beat over the waves. */
export const waveMinutes = (n) => Math.max(MIN_BEAT, Math.floor(MAX_BEAT / Math.max(1, Math.ceil(n / CONCURRENT))));
/** The matrix limit and the queue, said once in every public or computers why. */
const MATRIX_WHY = 'GitHub allows ' + MAX_COMPUTERS + ' jobs in one matrix; a free account runs ' + CONCURRENT + ' at once and queues the rest';

/**
 * THE PLAN of the next beat (contract c12), pure.
 * @param {object} o
 * @param {number} o.now the clock (ms)
 * @param {string|null} o.visibility 'public' | 'private' | 'internal' | null (unknown: the API was not read)
 * @param {number|null} o.spentMinutes this month's spent runner minutes (every workflow; the account's when known)
 * @param {number} [o.otherMinutes] the part of them spent by other workflows (projected over the days left)
 * @param {number} [o.budgetMinutes]
 * @param {boolean} [o.sharded] the tree can run shards (swarm --shard, era --staged)
 * @param {number|null} [o.wantMinutes] the minutes a dispatch asked for (a private beat never exceeds its share)
 * @param {string|null} [o.apiError] why the API was not read
 * @param {object|null} [o.ledger] neo/COMPUTE.json (only its month and spent are used, and only without the API)
 * @param {boolean} [o.machines] the tree can drive a computer's browser (grow/machine.mjs step --shard --out)
 * @param {number|null} [o.wantComputers] the computers a dispatch asked for (exactly that many, capped at MAX_COMPUTERS)
 */
export function planCompute(o) {
  const now = num(o && o.now) ?? Date.now();
  const { month, start, end } = monthOf(now);
  const budget = num(o.budgetMinutes) && o.budgetMinutes > 0 ? Math.floor(o.budgetMinutes) : BUDGET_MINUTES;
  const want = int(o.wantMinutes) && o.wantMinutes > 0 ? o.wantMinutes : null;
  const sharded = o.sharded === true;
  const machines = o.machines === true;
  const askedC = int(o.wantComputers) && o.wantComputers > 0 ? o.wantComputers : null;
  const wantC = askedC ? Math.min(MAX_COMPUTERS, askedC) : null;
  const capped = askedC && askedC > MAX_COMPUTERS ? ' (' + askedC + ' asked, capped at ' + MAX_COMPUTERS + ')' : '';
  const reserve = Math.ceil(budget * RESERVE_PCT / 100);
  const slot = Math.floor((now - start) / SLOT_MS);
  const slotsLeft = Math.max(1, Math.ceil((end - now) / SLOT_MS));
  const base = { month, budgetMinutes: budget, spentMinutes: null, visibility: o.visibility || 'unknown', stride: 1, slot, slotsLeft, remainingMinutes: null };
  const out = (p) => ({ beatMinutes: p.beatMinutes, shards: p.shards, relay: p.relay, why: p.why, month, budgetMinutes: budget, spentMinutes: base.spentMinutes, visibility: base.visibility, mergeMinutes: p.mergeMinutes, stride: base.stride, slot, slotsLeft, remainingMinutes: base.remainingMinutes, computers: p.shards, costMinutes: costOf(p.shards, p.beatMinutes, p.mergeMinutes), wantComputers: wantC });
  if (o.visibility === 'public') {
    const shards = wantC || (sharded || machines ? PUBLIC.shards : 1);
    const m = want ? Math.max(MIN_BEAT, Math.min(MAX_BEAT, want)) : waveMinutes(shards);
    // the merge grows the beat's eras: a short merge after the staged era when the swarm shards, the whole beat when it cannot
    const mm = shards > 1 ? (sharded ? PUBLIC.mergeMinutes : PUBLIC.beatMinutes) : 0;
    const waves = Math.ceil(shards / CONCURRENT);
    const who = wantC ? 'the ' + shards + ' computers asked' + capped : shards === 1 ? '1 runner (this tree runs no shards and no machines)' : shards + ' runners, each a computer';
    return out({ beatMinutes: m, shards, relay: true, mergeMinutes: mm, why: 'public: no minute cap; ' + who + ', ' + m + ' minutes each' + (want ? ' (asked)' : '') + (shards > 1 ? ' in ' + waves + (waves === 1 ? ' wave' : ' waves') + ' (' + MATRIX_WHY + '), ' + costOf(shards, m, mm) + ' runner minutes, none billed' : '') + ', relayed back to back' });
  }
  let spent = num(o.spentMinutes);
  if (o.apiError || !o.visibility || spent === null) {
    const l = isObj(o.ledger) && o.ledger.month === month ? o.ledger : null;
    const ls = l ? num(l.spentMinutes) : null;
    const why = 'api: ' + (o.apiError || 'the spent minutes were not read');
    if (ls !== null && budget - reserve - ls <= 0) { base.spentMinutes = ls; base.remainingMinutes = budget - reserve - ls; return out(none(why + '; the ledger of ' + month + ' says ' + ls + ' of ' + budget + ' minutes spent: no beat')); }
    return out({ beatMinutes: SAFE_BEAT, shards: 1, relay: false, mergeMinutes: 0, why: why + '; a safe small default' + (wantC ? ' (the ' + wantC + ' computers asked wait for a plan that read the budget)' : '') });
  }
  spent = Math.max(0, Math.ceil(spent));
  base.spentMinutes = spent;
  const remaining = budget - reserve - spent;
  base.remainingMinutes = remaining;
  if (remaining <= 0) return out(none('spent: ' + spent + ' of ' + budget + ' minutes used this month; the ' + RESERVE_PCT + ' percent reserve is kept: no beat until ' + monthOf(end).month + (wantC ? '; ' + wantC + ' computers asked' + capped + ', the budget can pay 0 computers' : '')));
  const elapsedDays = Math.max(1, (now - start) / DAY_MS);
  const daysLeft = (end - now) / DAY_MS;
  const other = Math.max(0, num(o.otherMinutes) ?? 0);
  const projected = Math.ceil(other / elapsedDays * daysLeft);
  const available = remaining - slotsLeft * PLAN_JOB_MINUTES - projected;
  const minRun = MIN_BEAT + JOB_OVERHEAD;
  const tail = remaining + ' minutes left after the reserve, ' + slotsLeft + ' slots of ' + SLOT_HOURS + ' hours to ' + monthOf(end).month + (projected ? ', ' + projected + ' kept for the other workflows' : '');
  if (wantC) {
    // exactly the computers asked, paid from what the month has left (less the plan jobs to come), or refused
    const m = want ? Math.max(MIN_BEAT, Math.min(MAX_BEAT, want)) : MIN_BEAT;
    const mm = wantC >= 2 ? MERGE_MINUTES : 0;
    const cost = costOf(wantC, m, mm);
    const can = Math.max(0, available);
    if (cost > can) return out(none('refused: ' + wantC + ' computers' + capped + ' of ' + m + ' minutes cost ' + cost + ' runner minutes and the budget can pay ' + can + ' (' + tail + '): it can pay ' + payableOf(can, m) + ' computers'));
    const waves = Math.ceil(wantC / CONCURRENT);
    return out({ beatMinutes: m, shards: wantC, relay: false, mergeMinutes: mm, why: 'private: the ' + wantC + ' computers asked' + capped + ', ' + m + ' minutes each, cost ' + cost + ' of the ' + can + ' runner minutes the budget can pay (' + tail + ')' + (wantC > 1 ? '; ' + waves + (waves === 1 ? ' wave' : ' waves') + ' (' + MATRIX_WHY + ')' : '') });
  }
  if (available < minRun) return out(none('spent: ' + tail + ': the plan jobs take the rest, no beat'));
  const perSlot = available / slotsLeft;
  const stride = perSlot >= minRun ? 1 : Math.min(slotsLeft, Math.ceil(minRun / perSlot));
  base.stride = stride;
  if (stride > 1 && slot % stride !== 0) return out(none('pacing: ' + tail + ': one beat in every ' + stride + ' slots, not slot ' + slot));
  // the slots left hold at most ceil(slotsLeft / stride) beats: each gets an equal part of what is available
  const runBudget = available / Math.ceil(slotsLeft / stride);
  const wallCap = Math.floor((end - now) / 60000) - JOB_OVERHEAD;
  const r = chooseRunners(runBudget, { sharded, wallCap });
  if (r.beatMinutes < MIN_BEAT) return out(none('month end: ' + tail + ': under ' + MIN_BEAT + ' minutes before ' + monthOf(end).month + ' begins'));
  const m = want ? Math.max(2, Math.min(r.beatMinutes, want)) : r.beatMinutes;
  return out({ beatMinutes: m, shards: r.shards, relay: false, mergeMinutes: r.mergeMinutes, why: 'private: ' + tail + ', spent evenly: ' + Math.floor(runBudget) + ' runner minutes this beat' + (stride > 1 ? ' (one beat in every ' + stride + ' slots)' : '') + (r.shards > 1 ? ', ' + r.shards + ' runners at once' : '') });
}

// ---- the API (the only network this file touches; every byte it returns is data)
/** A message with the token cut out of it, on one line. */
export function scrub(s, token) {
  let t = String(s ?? '').split(/\r?\n/)[0];
  if (token) t = t.split(String(token)).join('<token>');
  return t.replace(/\b(gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g, '<token>').slice(0, 200);
}

/**
 * A GET client of the REST API: JSON or a failure line; it counts its calls and refuses past MAX_CALLS or the deadline.
 * @param {{ token: string, fetch?: Function, base?: string, deadline?: number, clock?: () => number }} o
 */
export function client({ token, fetch: f = globalThis.fetch, base = API, deadline = Infinity, clock = Date.now }) {
  const c = { calls: 0 };
  c.get = async (p) => {
    if (c.calls >= MAX_CALLS) return { ok: false, status: 0, why: 'the call cap of ' + MAX_CALLS + ' is spent' };
    if (clock() >= deadline) return { ok: false, status: 0, why: 'the deadline passed' };
    c.calls++;
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), Math.max(1, Math.min(CALL_MS, deadline - clock())));
    try {
      const r = await f(base.replace(/\/+$/, '') + p, { headers: { accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', 'user-agent': 'brain-organism-compute', authorization: 'Bearer ' + token }, signal: ctl.signal });
      const text = await r.text();
      let body = null;
      try { body = JSON.parse(text); } catch { body = null; }
      if (!r.ok) {
        const left = r.headers && typeof r.headers.get === 'function' ? r.headers.get('x-ratelimit-remaining') : null;
        const why = 'HTTP ' + r.status + (String(left) === '0' ? ' (rate limited)' : '') + (isObj(body) && body.message ? ': ' + body.message : '');
        return { ok: false, status: r.status, why: scrub(why, token) };
      }
      if (body === null) return { ok: false, status: r.status, why: 'the answer is not JSON' };
      return { ok: true, status: r.status, body };
    } catch (e) {
      return { ok: false, status: 0, why: scrub(e && e.name === 'AbortError' ? 'timed out' : (e && e.cause && e.cause.code) || (e && e.message) || e, token) };
    } finally { clearTimeout(t); }
  };
  return c;
}

/** Runs `work` over `items`, `k` at a time, in order of the results. */
async function pool(items, k, work) {
  const out = new Array(items.length);
  let i = 0;
  const one = async () => { while (i < items.length) { const n = i++; out[n] = await work(items[n], n); } };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(k, items.length)) }, one));
  return out;
}

/**
 * What the API says this month: the visibility, and for a private repository the minutes every run created this month
 * billed (a completed run's minutes from `cache` when they are there). Never throws: a failure is `error`.
 * @returns {Promise<{ visibility: string|null, spentMinutes: number|null, heartbeatMinutes: number|null, otherMinutes: number|null,
 *   budgetMinutes: number|null, runs: object, calls: number, partial: number, source: string, error: string|null }>}
 */
export async function readSpent({ repo, token, now, cache = {}, fetch: f, base = API, deadline = Infinity, clock = Date.now }) {
  const res = { visibility: null, spentMinutes: null, heartbeatMinutes: null, otherMinutes: null, budgetMinutes: null, runs: {}, calls: 0, partial: 0, source: 'none', error: null };
  if (!token) { res.error = 'no GITHUB_TOKEN in the environment'; return res; }
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(String(repo || ''))) { res.error = 'no repository (--repo <owner/name> or GITHUB_REPOSITORY)'; return res; }
  const c = client({ token, fetch: f, base, deadline, clock });
  const done = (o) => { res.calls = c.calls; return Object.assign(res, o); };
  const r = await c.get('/repos/' + repo);
  if (!r.ok || !isObj(r.body)) return done({ error: 'the repository: ' + (r.why || 'no answer') });
  const vis = typeof r.body.visibility === 'string' ? r.body.visibility : (r.body.private === true ? 'private' : r.body.private === false ? 'public' : null);
  if (!vis) return done({ error: 'the repository answer names no visibility' });
  res.visibility = vis;
  if (vis === 'public') return done({ source: 'repository' });
  const { month, start } = monthOf(now);
  const runs = [];
  for (let page = 1; page <= 10; page++) {
    const l = await c.get('/repos/' + repo + '/actions/runs?per_page=100&page=' + page + '&created=' + encodeURIComponent('>=' + month + '-01'));
    if (!l.ok || !isObj(l.body) || !Array.isArray(l.body.workflow_runs)) return done({ error: 'the runs of ' + month + ': ' + (l.why || 'no workflow_runs') });
    for (const w of l.body.workflow_runs) if (isObj(w) && int(w.id) !== null && Date.parse(w.created_at) >= start) runs.push(w);
    if (l.body.workflow_runs.length < 100) break;
  }
  const minutes = await pool(runs, PARALLEL, async (w) => {
    const key = runKey(w);
    if (w.status === 'completed' && num(cache[key]) !== null) return { key, m: cache[key], cached: true, done: true };
    const jobs = [];
    for (let page = 1; page <= 3; page++) {
      const j = await c.get('/repos/' + repo + '/actions/runs/' + w.id + '/jobs?filter=all&per_page=100&page=' + page);
      if (!j.ok || !isObj(j.body) || !Array.isArray(j.body.jobs)) return { key, m: wallMinutes(w, now), estimated: true };
      jobs.push(...j.body.jobs);
      if (j.body.jobs.length < 100) break;
    }
    return { key, m: runMinutes(jobs, now), done: w.status === 'completed' };
  });
  let spent = 0, beat = 0;
  runs.forEach((w, i) => {
    const x = minutes[i];
    spent += x.m;
    if (isHeartbeat(w)) beat += x.m;
    if (x.estimated) res.partial++;
    if (x.done && !x.estimated) res.runs[x.key] = x.m;
  });
  let source = 'runs';
  const owner = repo.split('/')[0];
  const a = await c.get('/users/' + owner + '/settings/billing/actions');
  const acct = a.ok ? accountActions(a.body) : null;
  let account = acct ? acct.spent : null;
  if (acct && acct.budget) res.budgetMinutes = acct.budget;
  if (account === null) {
    const [y, mo] = month.split('-');
    const u = await c.get('/users/' + owner + '/settings/billing/usage?year=' + y + '&month=' + Number(mo));
    account = u.ok ? accountUsage(u.body, month) : null;
  }
  if (account !== null && account > spent) { spent = account; source = 'account'; }
  return done({ spentMinutes: spent, heartbeatMinutes: beat, otherMinutes: Math.max(0, spent - beat), source });
}

// ---- the tree
/** owner/name of the repository: --repo, GITHUB_REPOSITORY, or the origin remote of the root. */
export function repoOf(root, { flag = null, env = process.env } = {}) {
  if (flag) return String(flag);
  if (env.GITHUB_REPOSITORY) return String(env.GITHUB_REPOSITORY);
  const r = spawnSync('git', ['-C', root, 'remote', 'get-url', 'origin'], { encoding: 'utf8', timeout: 10000, windowsHide: true });
  const m = /github\.com[:/]([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\s*$/.exec(String(r.stdout || ''));
  return m ? m[1] + '/' + m[2] : null;
}

/** The help text a verb prints ('' when the file is not on disk or prints nothing). */
function helpOf(root, script, args) {
  const f = path.join(root, script);
  if (!fs.existsSync(f)) return '';
  const r = spawnSync(process.execPath, [f, ...args], { cwd: root, encoding: 'utf8', timeout: 20000, windowsHide: true });
  return String(r.stdout || '') + String(r.stderr || '');
}

/**
 * Can this tree run shards? contract c8 (swarm grow --shard i/n --stage <dir> --no-merge) AND an era that merges stages
 * (era run --staged <dir>): a shard nobody merges through the era's pipeline would only burn minutes.
 */
export function shardedOf(root) {
  const swarm = helpOf(root, 'grow/swarm.mjs', ['help']);
  const era = helpOf(root, 'grow/era.mjs', ['--help']);
  const machine = helpOf(root, 'grow/machine.mjs', ['help']);
  return { sharded: /--shard\b/.test(swarm) && /--no-merge\b/.test(swarm) && /--staged\b/.test(era), swarm: /--shard\b/.test(swarm), staged: /--staged\b/.test(era), machines: /--shard\b/.test(machine) && /--out\b/.test(machine) };
}

/** The generation a beat's shards all grow (one past grown/index.json and grown/generations.json, as the era counts). */
export function generationOf(root) {
  let g = 0;
  const ix = readJson(path.join(root, 'grown', 'index.json'));
  if (ix && Number.isInteger(ix.generation)) g = ix.generation;
  const gs = readJson(path.join(root, 'grown', 'generations.json'));
  for (const e of (gs && Array.isArray(gs.generations) ? gs.generations : [])) if (e && Number.isInteger(e.generation) && e.generation > g) g = e.generation;
  return g + 1;
}

/** neo/COMPUTE.json, or null. */
export const readLedger = (root) => { const l = readJson(path.join(root, LEDGER)); return isObj(l) ? l : null; };

/**
 * The ledger after a plan: this month's numbers, the completed runs' minutes (reset at a new month), the last plans, and
 * the computers the plans started: this month's (reset at a new month) and the running total (never reset).
 */
export function nextLedger(prev, plan, read, at) {
  const same = isObj(prev) && prev.month === plan.month;
  const runs = Object.assign({}, same && isObj(prev.runs) ? prev.runs : {}, read && isObj(read.runs) ? read.runs : {});
  const plans = [...(same && Array.isArray(prev.plans) ? prev.plans : []), { at, beatMinutes: plan.beatMinutes, shards: plan.shards, relay: plan.relay, mergeMinutes: plan.mergeMinutes, computers: int(plan.computers) ?? 0, costMinutes: int(plan.costMinutes) ?? 0, why: plan.why }].slice(-KEEP_PLANS);
  const started = Math.max(0, int(plan.computers) ?? 0);
  const fresh = read && read.error === null && plan.spentMinutes !== null;
  return {
    month: plan.month,
    at: fresh ? at : (same ? prev.at || null : null),
    visibility: read && read.visibility ? read.visibility : (same ? prev.visibility || null : null),
    budgetMinutes: plan.budgetMinutes,
    reservePct: RESERVE_PCT,
    spentMinutes: fresh ? plan.spentMinutes : (same ? num(prev.spentMinutes) : null),
    heartbeatMinutes: fresh ? read.heartbeatMinutes : (same ? num(prev.heartbeatMinutes) : null),
    source: fresh ? read.source : (same ? prev.source || null : null),
    computersMonth: (same ? Math.max(0, int(prev.computersMonth) ?? 0) : 0) + started,
    computersTotal: (isObj(prev) ? Math.max(0, int(prev.computersTotal) ?? 0) : 0) + started,
    runs,
    plans,
  };
}

/** Writes the ledger under <root>/neo and nowhere else. */
export function writeLedger(root, ledger) {
  const f = path.join(root, LEDGER);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(ledger, null, 2) + '\n');
  return f;
}

/** One plan, end to end: the tree's capabilities, the API, the pure plan, the ledger when `write`. */
export async function plan({ root = DEFAULT_ROOT, env = process.env, repo = null, now = Date.now(), maxMs = DEFAULT_MAX_MS, wantMinutes = null, wantComputers = null, budget = null, write = false, fetch: f, clock = Date.now } = {}) {
  const ledger = readLedger(root);
  const { month } = monthOf(now);
  const cache = ledger && ledger.month === month && isObj(ledger.runs) ? ledger.runs : {};
  const cap = shardedOf(root);
  const read = await readSpent({ repo: repoOf(root, { flag: repo, env }), token: env.GITHUB_TOKEN || env.GH_TOKEN || '', now, cache, fetch: f, base: env.BRAIN_GITHUB_API || API, deadline: clock() + maxMs, clock });
  const budgetMinutes = num(budget) ?? (int(env.BRAIN_BUDGET_MINUTES) && Number(env.BRAIN_BUDGET_MINUTES) > 0 ? Number(env.BRAIN_BUDGET_MINUTES) : null) ?? read.budgetMinutes ?? BUDGET_MINUTES;
  const p = planCompute({ now, visibility: read.visibility, spentMinutes: read.spentMinutes, otherMinutes: read.otherMinutes, budgetMinutes, sharded: cap.sharded, machines: cap.machines, wantMinutes, wantComputers, apiError: read.error, ledger });
  const line = Object.assign(p, { heartbeatMinutes: read.heartbeatMinutes, source: read.source, calls: read.calls, partial: read.partial, sharded: cap.sharded, machines: cap.machines, gen: generationOf(root) });
  if (write) { const l = nextLedger(ledger, line, read, new Date(now).toISOString()); writeLedger(root, l); line.wrote = LEDGER; line.computersTotal = l.computersTotal; }
  return line;
}

// ---- the workflow side
/** The plan line as $GITHUB_OUTPUT lines; a line that is not a plan gives the safe small default. */
export function outputsOf(text) {
  let p = null;
  try { p = JSON.parse(String(text ?? '').trim().split(/\r?\n/).pop()); } catch { p = null; }
  const ok = isObj(p) && int(p.beatMinutes) !== null && p.beatMinutes >= 0 && int(p.shards) !== null && p.shards >= 0;
  const beat = ok ? Math.min(MAX_BEAT, p.beatMinutes) : SAFE_BEAT;
  const shards = ok ? Math.min(MAX_COMPUTERS, p.shards) : 1;
  const merge = ok && int(p.mergeMinutes) !== null && p.mergeMinutes > 0 ? Math.min(MAX_BEAT, p.mergeMinutes) : 0;
  const gen = ok && int(p.gen) !== null && p.gen > 0 ? p.gen : 0;
  const why = (ok ? String(p.why || '') : 'the plan line did not parse: a safe small default').replace(/[\r\n%]/g, ' ').slice(0, 300);
  return [
    'run=' + (beat > 0 && shards > 0),
    'beat_minutes=' + beat,
    'shards=' + shards,
    'matrix=' + JSON.stringify(shards >= 2 ? Array.from({ length: shards }, (_, i) => i) : [0]),
    'relay=' + (ok && p.relay === true),
    'merge_minutes=' + merge,
    'gen=' + gen,
    'computers=' + (beat > 0 ? shards : 0),
    'cost_minutes=' + (ok && int(p.costMinutes) !== null && p.costMinutes >= 0 ? p.costMinutes : costOf(beat > 0 ? shards : 0, beat, merge)),
    'swarm=' + !(ok && p.sharded === false),
    'why=' + why,
  ];
}

// ---- a small total YAML reader (the subset a workflow uses: block maps and lists, block scalars, flow lists and maps,
// quoted and plain scalars, comments). It never throws: what it cannot read is an error with its line number.
const stripComment = (s) => {
  let q = null;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (q) { if (ch === q) q = null; continue; }
    if (ch === '"' || ch === "'") { if (i === 0 || /[\s:[{,-]/.test(s[i - 1])) q = ch; continue; }
    if (ch === '#' && (i === 0 || /\s/.test(s[i - 1]))) return s.slice(0, i).trimEnd();
  }
  return s.trimEnd();
};
const KEY_RE = /^("(?:[^"\\]|\\.)*"|'(?:[^']|'')*'|[^\s"'#[\]{},:-][^:#]*?|-[^\s:#][^:#]*?)\s*:(?:\s+(.*))?$/;
function splitFlow(s) {
  const parts = []; let depth = 0, q = null, cur = '';
  for (const ch of s) {
    if (q) { cur += ch; if (ch === q) q = null; continue; }
    if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
    if (ch === '[' || ch === '{') depth++;
    if (ch === ']' || ch === '}') depth--;
    if (ch === ',' && depth === 0) { parts.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}
/** One scalar or flow node. */
export function scalarOf(t) {
  const s = String(t).trim();
  if (s.startsWith('"') && s.endsWith('"') && s.length >= 2) return s.slice(1, -1).replace(/\\(["\\/nt])/g, (_, c) => (c === 'n' ? '\n' : c === 't' ? '\t' : c));
  if (s.startsWith("'") && s.endsWith("'") && s.length >= 2) return s.slice(1, -1).replace(/''/g, "'");
  if (s.startsWith('[') && s.endsWith(']')) return splitFlow(s.slice(1, -1)).map(scalarOf);
  if (s.startsWith('{') && s.endsWith('}') && !s.startsWith('{{')) {
    const o = {};
    for (const p of splitFlow(s.slice(1, -1))) { const m = KEY_RE.exec(p); if (m) o[String(scalarOf(m[1]))] = m[2] === undefined ? null : scalarOf(m[2]); }
    return o;
  }
  if (s === '' || s === '~' || s === 'null') return null;
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (/^-?\d+$/.test(s)) return Number(s);
  return s;
}
/**
 * Parses YAML text into plain objects. Total: { ok, value, errors: [{ line, why }] }.
 * @param {string} text
 */
export function parseYaml(text) {
  const errors = [];
  try {
    const raw = String(text ?? '').replace(/\t/g, '  ').split(/\r?\n/);
    const lines = [];
    raw.forEach((r, n) => { const t = stripComment(r); if (t.trim()) lines.push({ n: n + 1, indent: t.length - t.trimStart().length, text: t.trim(), raw: r }); });
    let i = 0;
    const isItem = (l) => l.text === '-' || l.text.startsWith('- ');
    const block = (style, parentIndent) => {
      const start = lines[i - 1].n;
      const body = [];
      let k = start;
      while (k < raw.length) {
        const r = raw[k];
        const ind = r.length - r.trimStart().length;
        if (r.trim() && ind <= parentIndent) break;
        body.push(r); k++;
      }
      while (i < lines.length && lines[i].n <= k) i++;
      while (body.length && !body[body.length - 1].trim()) body.pop();
      const cut = Math.min(...body.filter((r) => r.trim()).map((r) => r.length - r.trimStart().length), Infinity);
      const ls = body.map((r) => (r.trim() ? r.slice(Number.isFinite(cut) ? cut : 0) : ''));
      return style.startsWith('>') ? ls.join(' ').replace(/\s+/g, ' ').trim() + (style.endsWith('-') ? '' : '\n') : ls.join('\n') + (style.endsWith('-') ? '' : '\n');
    };
    const value = (rest, indent) => {
      if (rest === undefined || rest === null || rest === '') {
        if (i < lines.length && lines[i].indent > indent) return node(lines[i].indent);
        if (i < lines.length && lines[i].indent === indent && isItem(lines[i])) return seq(indent);
        return null;
      }
      if (/^[|>][+-]?$/.test(rest)) return block(rest, indent);
      return scalarOf(rest);
    };
    const map = (indent) => {
      const o = {};
      while (i < lines.length && lines[i].indent >= indent) {
        const l = lines[i];
        if (l.indent > indent) { errors.push({ line: l.n, why: 'out of place: ' + l.text.slice(0, 60) }); i++; continue; }
        if (isItem(l)) break;
        const m = KEY_RE.exec(l.text);
        if (!m) { errors.push({ line: l.n, why: 'not a key: ' + l.text.slice(0, 60) }); i++; continue; }
        i++;
        const key = String(scalarOf(m[1]));
        if (Object.prototype.hasOwnProperty.call(o, key)) errors.push({ line: l.n, why: 'a duplicate key: ' + key });
        o[key] = value(m[2], indent);
      }
      return o;
    };
    const seq = (indent) => {
      const a = [];
      while (i < lines.length && lines[i].indent >= indent) {
        const l = lines[i];
        if (l.indent > indent) { errors.push({ line: l.n, why: 'out of place: ' + l.text.slice(0, 60) }); i++; continue; }
        if (!isItem(l)) break;
        const rest = l.text === '-' ? '' : l.text.slice(2);
        const off = l.text === '-' ? 0 : 2 + (rest.length - rest.trimStart().length);
        const r = rest.trim();
        if (!r) { i++; a.push(i < lines.length && lines[i].indent > indent ? node(lines[i].indent) : null); continue; }
        if (KEY_RE.test(r) && !/^["'[{]/.test(r)) { lines[i] = { n: l.n, indent: indent + off, text: r, raw: l.raw }; a.push(map(indent + off)); continue; }
        i++;
        a.push(/^[|>][+-]?$/.test(r) ? block(r, indent) : scalarOf(r));
      }
      return a;
    };
    const node = (indent) => (isItem(lines[i]) ? seq(indent) : map(indent));
    const top = lines.length ? node(lines[0].indent) : null;
    while (i < lines.length) { errors.push({ line: lines[i].n, why: 'out of place: ' + lines[i].text.slice(0, 60) }); i++; }
    return { ok: errors.length === 0, value: top, errors };
  } catch (e) {
    errors.push({ line: 0, why: 'the reader failed: ' + String((e && e.message) || e).slice(0, 120) });
    return { ok: false, value: null, errors };
  }
}

/** Every `run:` text of a job's steps, in order. */
export const commandsOf = (job) => (isObj(job) && Array.isArray(job.steps) ? job.steps : []).filter((s) => isObj(s) && typeof s.run === 'string').map((s) => s.run);
const needsOf = (job) => (isObj(job) ? (Array.isArray(job.needs) ? job.needs.map(String) : job.needs ? [String(job.needs)] : []) : []);

/**
 * What the heartbeat must hold (body/heartbeat.yml): each rule a name and a test over the parsed workflow. A rule dropped
 * from the file is a problem by name.
 */
export const RULES = Object.freeze([
  ['cron 23 */3 * * *', (w) => isObj(w.on) && Array.isArray(w.on.schedule) && w.on.schedule.some((s) => isObj(s) && s.cron === '23 */3 * * *')],
  ['dispatch inputs minutes, relay, beats', (w) => isObj(w.on) && isObj(w.on.workflow_dispatch) && isObj(w.on.workflow_dispatch.inputs) && ['minutes', 'relay', 'beats'].every((k) => k in w.on.workflow_dispatch.inputs)],
  ['the heartbeat concurrency group, never cancelled', (w) => isObj(w.concurrency) && /'heartbeat'|^heartbeat$/.test(String(w.concurrency.group)) && w.concurrency['cancel-in-progress'] === false],
  ['jobs plan, grow, merge', (w) => isObj(w.jobs) && ['plan', 'grow', 'merge'].every((k) => isObj(w.jobs[k]))],
  ['plan runs compute plan and its outputs', (w) => commandsOf(w.jobs && w.jobs.plan).some((c) => /node grow\/compute\.mjs plan\b/.test(c)) && commandsOf(w.jobs && w.jobs.plan).some((c) => /node grow\/compute\.mjs outputs "\$line" >> "\$GITHUB_OUTPUT"/.test(c))],
  ['plan reads neo/STOP', (w) => commandsOf(w.jobs && w.jobs.plan).some((c) => /if \[ -e neo\/STOP \]; then[\s\S]*stopped=true[\s\S]*exit 0/.test(c))],
  ['plan job outputs beat_minutes, shards, matrix, relay', (w) => isObj(w.jobs && w.jobs.plan && w.jobs.plan.outputs) && ['beat_minutes', 'shards', 'matrix', 'relay', 'run', 'stopped'].every((k) => k in w.jobs.plan.outputs)],
  ['grow needs plan', (w) => needsOf(w.jobs && w.jobs.grow).includes('plan')],
  ['grow is a matrix of the planned shards', (w) => { const g = w.jobs && w.jobs.grow; return isObj(g) && isObj(g.strategy) && isObj(g.strategy.matrix) && /fromJSON\(needs\.plan\.outputs\.matrix\)/.test(String(g.strategy.matrix.shard)); }],
  ['grow runs swarm grow --shard --stage --no-merge', (w) => commandsOf(w.jobs && w.jobs.grow).some((c) => /node grow\/swarm\.mjs grow\b/.test(c) && /--shard\b/.test(c) && /--stage\b/.test(c) && /--no-merge\b/.test(c) && /--gen\b/.test(c))],
  ['grow uploads its stage', (w) => (w.jobs && w.jobs.grow && Array.isArray(w.jobs.grow.steps) ? w.jobs.grow.steps : []).some((s) => isObj(s) && /actions\/upload-artifact/.test(String(s.uses)))],
  ['merge needs plan and grow', (w) => { const n = needsOf(w.jobs && w.jobs.merge); return n.includes('plan') && n.includes('grow'); }],
  ['merge downloads the stages', (w) => (w.jobs && w.jobs.merge && Array.isArray(w.jobs.merge.steps) ? w.jobs.merge.steps : []).some((s) => isObj(s) && /actions\/download-artifact/.test(String(s.uses)))],
  ['merge runs the staged era and the plain era', (w) => { const c = commandsOf(w.jobs && w.jobs.merge).join('\n'); return /node grow\/era\.mjs run\b[^\n]*--commit[^\n]*--staged\b/.test(c) && /node grow\/era\.mjs run --max-ms "\$ms" --commit/.test(c); }],
  ['merge fetches and hard resets before each era', (w) => commandsOf(w.jobs && w.jobs.merge).some((c) => /node grow\/era\.mjs run/.test(c) && /git fetch -q origin master/.test(c) && /git reset -q --hard origin\/master/.test(c) && (c.match(/\blevel\b/g) || []).length >= 3)],
  ['the author is the organism', (w) => commandsOf(w.jobs && w.jobs.merge).some((c) => /git config user\.name "brain organism"/.test(c))],
  ['merge relays the next beat', (w) => commandsOf(w.jobs && w.jobs.merge).some((c) => /gh workflow run heartbeat\.yml/.test(c))],
  ['the site data is rebuilt when neo/ or grown/ changed', (w) => commandsOf(w.jobs && w.jobs.merge).some((c) => /node web\/build\.mjs/.test(c) && /neo grown/.test(c))],
  ['a push to master that changed neo/ or grown/ rebuilds the site', (w) => isObj(w.on) && isObj(w.on.push) && Array.isArray(w.on.push.paths) && w.on.push.paths.includes('neo/**') && w.on.push.paths.includes('grown/**') && commandsOf(w.jobs && w.jobs.site).some((c) => /node web\/build\.mjs/.test(c))],
  // the computers: asked for, priced before the matrix, each one driving its browser, its screens landed before the era ships
  ['dispatch input computers', (w) => isObj(w.on) && isObj(w.on.workflow_dispatch) && isObj(w.on.workflow_dispatch.inputs) && isObj(w.on.workflow_dispatch.inputs.computers)],
  ['plan passes the computers asked', (w) => commandsOf(w.jobs && w.jobs.plan).some((c) => /node grow\/compute\.mjs plan\b[^\n]*\$comp\b/.test(c) && /comp="--computers \$WANT_COMPUTERS"/.test(c))],
  ['plan prints the plan line and its cost before the matrix', (w) => commandsOf(w.jobs && w.jobs.plan).some((c) => /echo "plan: \$line"/.test(c) && /echo "cost: \$\{cost[^\n]*runner minutes/.test(c))],
  ['plan job outputs computers, cost_minutes, swarm', (w) => isObj(w.jobs && w.jobs.plan && w.jobs.plan.outputs) && ['computers', 'cost_minutes', 'swarm'].every((k) => k in w.jobs.plan.outputs)],
  ['grow runs machine step --shard --out beside its shard', (w) => commandsOf(w.jobs && w.jobs.grow).some((c) => /node grow\/machine\.mjs step\b[^\n]*--shard "\$SHARD\/\$SHARDS"[^\n]*--out\b[^\n]*&[ \t]*$/m.test(c))],
  ['grow uploads its computer as its own artifact, outside the stage', (w) => (w.jobs && w.jobs.grow && Array.isArray(w.jobs.grow.steps) ? w.jobs.grow.steps : []).some((s) => isObj(s) && /actions\/upload-artifact/.test(String(s.uses)) && isObj(s.with) && /^machine-/.test(String(s.with.name)) && !/stage/.test(String(s.with.path)) && /machine/.test(String(s.with.path)))],
  ['merge downloads the computers and lands them', (w) => (w.jobs && w.jobs.merge && Array.isArray(w.jobs.merge.steps) ? w.jobs.merge.steps : []).some((s) => isObj(s) && /actions\/download-artifact/.test(String(s.uses)) && isObj(s.with) && /^machine-/.test(String(s.with.pattern)) && s.with['merge-multiple'] !== true) && commandsOf(w.jobs && w.jobs.merge).some((c) => /level\(\) \{(?:(?!\n\s*\}\n)[\s\S])*node grow\/machine\.mjs land --from/.test(c))],
  ['a one-runner beat runs machine step in the merge', (w) => commandsOf(w.jobs && w.jobs.merge).some((c) => /node grow\/machine\.mjs step --shard 0\/1 --out\b/.test(c))],
]);

/** The workflow text checked against RULES: { ok, problems, errors, jobs, needs, matrix }. */
export function lintWorkflow(text) {
  const y = parseYaml(text);
  const w = isObj(y.value) ? y.value : {};
  const problems = [];
  for (const [name, test] of RULES) { let ok = false; try { ok = test(w) === true; } catch { ok = false; } if (!ok) problems.push(name); }
  const jobs = isObj(w.jobs) ? Object.keys(w.jobs) : [];
  return { ok: y.ok && problems.length === 0, problems, errors: y.errors, jobs, needs: Object.fromEntries(jobs.map((j) => [j, needsOf(w.jobs[j])])), rules: RULES.length };
}

// ---- the CLI
const VALUE = new Set(['root', 'max-ms', 'era', 'repo', 'minutes', 'budget', 'now', 'file', 'computers']);
const BOOL = new Set(['write']);
export function parseArgs(argv) {
  const flags = {}, pos = [];
  for (let k = 0; k < argv.length; k++) {
    const a = argv[k];
    if (a === '-h' || a === '--help') { flags.help = true; continue; }
    if (!a.startsWith('--')) { pos.push(a); continue; }
    const eq = a.indexOf('=');
    const name = a.slice(2, eq < 0 ? undefined : eq);
    if (BOOL.has(name)) { flags[name] = true; continue; }
    if (!VALUE.has(name)) throw new Fail('unknown flag --' + name + ' (see --help)', 2);
    const v = eq < 0 ? argv[++k] : a.slice(eq + 1);
    if (v === undefined) throw new Fail('--' + name + ' needs a value', 2);
    flags[name] = v;
  }
  return { verb: pos[0], pos: pos.slice(1), flags };
}

/** Runs one verb; returns the lines to print. */
export async function main(argv, { env = process.env, fetch: f, clock = Date.now } = {}) {
  const { verb, pos, flags } = parseArgs(argv);
  if (flags.help || !verb || verb === 'help') return { usage: true };
  const root = path.resolve(flags.root || DEFAULT_ROOT);
  if (verb === 'plan') {
    if (pos.length) throw new Fail('unexpected argument ' + pos[0] + ' (see --help)', 2);
    const maxMs = flags['max-ms'] === undefined ? DEFAULT_MAX_MS : int(flags['max-ms']);
    if (maxMs === null || maxMs < 1000) throw new Fail('--max-ms is an integer from 1000, not ' + flags['max-ms'], 2);
    if (flags.era !== undefined && (int(flags.era) === null || int(flags.era) < 0)) throw new Fail('--era is an integer from 0, not ' + flags.era, 2);
    const want = flags.minutes === undefined || flags.minutes === '' ? null : int(flags.minutes);
    if (want === null && flags.minutes !== undefined && flags.minutes !== '') throw new Fail('--minutes is an integer, not ' + flags.minutes, 2);
    const budget = flags.budget === undefined ? null : int(flags.budget);
    if (flags.budget !== undefined && (budget === null || budget < 1)) throw new Fail('--budget is an integer from 1, not ' + flags.budget, 2);
    const computers = flags.computers === undefined || flags.computers === '' ? null : int(flags.computers);
    if (flags.computers !== undefined && flags.computers !== '' && (computers === null || computers < 1)) throw new Fail('--computers is an integer from 1 (at most ' + MAX_COMPUTERS + ' are planned), not ' + flags.computers, 2);
    const now = flags.now === undefined ? clock() : clockOf(flags.now);
    if (now === null) throw new Fail('--now is an ISO time or ms, not ' + flags.now, 2);
    const line = await plan({ root, env, repo: flags.repo || null, now, maxMs, wantMinutes: want, wantComputers: computers, budget, write: flags.write === true, fetch: f, clock });
    return { lines: [JSON.stringify(line)] };
  }
  if (verb === 'outputs') {
    if (pos.length !== 1) throw new Fail('outputs takes one argument: the plan line', 2);
    return { lines: outputsOf(pos[0]) };
  }
  if (verb === 'lint') {
    const file = path.resolve(root, flags.file || 'body/heartbeat.yml');
    let text;
    try { text = fs.readFileSync(file, 'utf8'); } catch { throw new Fail('no workflow at ' + file); }
    const r = lintWorkflow(text);
    return { lines: [JSON.stringify(r)], code: r.ok ? 0 : 1 };
  }
  throw new Fail('unknown verb ' + verb + ': plan, outputs or lint (--help)', 2);
}

const isMain = (() => { try { return fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || ''); } catch { return false; } })();
if (isMain) {
  main(process.argv.slice(2)).then((r) => {
    if (r.usage) { process.stdout.write(USAGE + '\n'); process.exit(0); }
    process.stdout.write(r.lines.join('\n') + '\n');
    process.exitCode = r.code || 0;
  }, (e) => {
    const code = e instanceof Fail ? e.code : 1;
    process.stderr.write('compute: ' + scrub((e && e.message) || e, process.env.GITHUB_TOKEN || process.env.GH_TOKEN) + '\n');
    if (code === 2) process.stderr.write(USAGE + '\n');
    process.exit(code);
  });
}
