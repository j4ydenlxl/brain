// test/grow-compute.test.mjs: grow/compute.mjs (contract c12, ITS OWN CLOUD COMPUTING) and body/heartbeat.yml.
// Offline: the API is a fake fetch or a local http server on 127.0.0.1; every root is a temp directory, removed after.
// Nothing here reads the tree's neo/ or grown/.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { execFile, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  planCompute, chooseRunners, monthOf, clockOf, weightOf, jobMinutes, runMinutes, wallMinutes, readSpent, accountActions, accountUsage,
  nextLedger, writeLedger, readLedger, plan, outputsOf, shardedOf, generationOf, repoOf, scrub, client, main, parseArgs,
  parseYaml, scalarOf, lintWorkflow, RULES, LEDGER, BUDGET_MINUTES, RESERVE_PCT, PLAN_JOB_MINUTES, JOB_OVERHEAD, MIN_BEAT, MAX_BEAT,
  SAFE_BEAT, PUBLIC, MERGE_MINUTES, PRIVATE_MAX_SHARDS, SLOT_MS, KEEP_PLANS, MAX_CALLS, MAX_COMPUTERS, CONCURRENT, costOf, payableOf,
  waveMinutes,
} from '../grow/compute.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = path.join(ROOT, 'grow', 'compute.mjs');
const T = (iso) => Date.parse(iso);
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'compute-test-'));
const rm = (d) => fs.rmSync(d, { recursive: true, force: true });
const C12 = ['beatMinutes', 'shards', 'relay', 'why', 'month', 'budgetMinutes', 'spentMinutes', 'visibility'];
const priv = (o) => planCompute({ visibility: 'private', otherMinutes: 0, ...o });

/** The cost of the rest of the month if every remaining slot follows this plan: the rule "never more". */
const monthCost = (p) => {
  const runs = Math.ceil(p.slotsLeft / p.stride);
  const per = p.shards >= 2 ? p.shards * (p.beatMinutes + JOB_OVERHEAD) + p.mergeMinutes + JOB_OVERHEAD : p.shards * (p.beatMinutes + JOB_OVERHEAD);
  return runs * per + p.slotsLeft * PLAN_JOB_MINUTES;
};

// ---------------------------------------------------------------- the pure plan
test('c12 keys: every plan line carries the eight contract keys', () => {
  for (const p of [priv({ now: T('2026-10-01T00:23:00Z'), spentMinutes: 0 }), planCompute({ now: T('2026-10-02T12:00:00Z'), visibility: 'public' }), planCompute({ now: T('2026-10-02T12:00:00Z'), visibility: null, apiError: 'HTTP 403' })]) {
    for (const k of C12) assert.ok(k in p, k);
    assert.equal(typeof p.relay, 'boolean');
    assert.ok(Number.isInteger(p.beatMinutes) && Number.isInteger(p.shards));
  }
});

test('month start, private: a beat of the even share, one runner, no relay', () => {
  const p = priv({ now: T('2026-10-01T00:23:00Z'), spentMinutes: 0 });
  assert.equal(p.month, '2026-10');
  assert.equal(p.visibility, 'private');
  assert.equal(p.relay, false);
  assert.equal(p.shards, 1);
  assert.equal(p.slotsLeft, 248);
  assert.equal(p.slot, 0);
  assert.equal(p.remainingMinutes, BUDGET_MINUTES - BUDGET_MINUTES * RESERVE_PCT / 100);
  assert.equal(p.beatMinutes, Math.floor((p.remainingMinutes - p.slotsLeft * PLAN_JOB_MINUTES) / p.slotsLeft - JOB_OVERHEAD));
  assert.ok(p.beatMinutes >= MIN_BEAT);
  assert.match(p.why, /^private: /);
  assert.ok(monthCost(p) <= p.remainingMinutes, 'the month at this pace stays inside the budget less the reserve');
});

test('never more: across clocks and spends, the rest of the month at the planned pace fits the budget less the reserve', () => {
  const clocks = ['2026-10-01T00:23:00Z', '2026-10-02T12:23:00Z', '2026-10-09T03:23:00Z', '2026-10-16T00:23:00Z', '2026-10-24T21:23:00Z', '2026-10-30T18:23:00Z', '2026-10-31T21:23:00Z', '2026-02-27T06:23:00Z'];
  let checked = 0;
  for (const c of clocks) for (const spent of [0, 100, 500, 900, 1300, 1500, 1650, 1750, 1790]) for (const other of [0, 60, 400]) for (const budget of [2000, 3000]) {
    const p = priv({ now: T(c), spentMinutes: spent, otherMinutes: other, budgetMinutes: budget });
    if (p.beatMinutes === 0) continue;
    checked++;
    const projected = Math.ceil(other / Math.max(1, (T(c) - monthOf(T(c)).start) / 86400000) * ((monthOf(T(c)).end - T(c)) / 86400000));
    assert.ok(monthCost(p) <= p.remainingMinutes - projected + 1e-9, c + ' spent ' + spent + ' other ' + other + ': ' + monthCost(p) + ' > ' + (p.remainingMinutes - projected));
  }
  assert.ok(checked > 100, 'the sweep planned beats: ' + checked);
});

test('nearly spent: the share is too small for a runner, so one slot in k beats with k slots of share', () => {
  const now = T('2026-10-16T00:23:00Z');
  const p = priv({ now, spentMinutes: 1500 });
  assert.ok(p.stride > 1, 'stride ' + p.stride);
  assert.equal(p.slot % p.stride, 0);
  assert.ok(p.beatMinutes >= MIN_BEAT);
  assert.match(p.why, /one beat in every \d+ slots/);
  const q = priv({ now: now + SLOT_MS, spentMinutes: 1500 });
  assert.equal(q.beatMinutes, 0);
  assert.equal(q.shards, 0);
  assert.match(q.why, /^pacing: /);
  assert.ok(monthCost(p) <= p.remainingMinutes);
});

test('spent: no beat, the reserve kept, both at the line and past it', () => {
  for (const spent of [1800, 1801, 2400]) {
    const p = priv({ now: T('2026-10-20T09:23:00Z'), spentMinutes: spent });
    assert.equal(p.beatMinutes, 0);
    assert.equal(p.shards, 0);
    assert.equal(p.relay, false);
    assert.match(p.why, /^spent: /);
    assert.match(p.why, /reserve is kept/);
  }
  const q = priv({ now: T('2026-10-01T00:23:00Z'), spentMinutes: 1799 - 248 });
  assert.equal(q.beatMinutes, 0, 'the plan jobs of the slots left take what is left');
  assert.match(q.why, /plan jobs take the rest/);
  const r = priv({ now: T('2026-10-20T09:23:00Z'), spentMinutes: 1799 });
  assert.equal(r.beatMinutes, 0);
});

test('public: 100 computers in one matrix when the tree runs them, each the longest beat over its waves, relayed back to back', () => {
  const p = planCompute({ now: T('2026-10-02T12:00:00Z'), visibility: 'public', sharded: true });
  assert.equal(PUBLIC.shards, 100);
  assert.equal(p.shards, PUBLIC.shards);
  assert.equal(p.computers, PUBLIC.shards);
  assert.equal(p.beatMinutes, Math.floor(MAX_BEAT / Math.ceil(PUBLIC.shards / CONCURRENT)), 'five waves of twenty share one beat');
  assert.equal(p.beatMinutes, waveMinutes(PUBLIC.shards));
  assert.equal(p.relay, true);
  assert.equal(p.mergeMinutes, PUBLIC.mergeMinutes);
  assert.equal(p.spentMinutes, null);
  assert.equal(p.costMinutes, PUBLIC.shards * (p.beatMinutes + JOB_OVERHEAD) + PUBLIC.mergeMinutes + JOB_OVERHEAD);
  assert.match(p.why, /GitHub allows 256 jobs in one matrix; a free account runs 20 at once and queues the rest/);
  assert.match(p.why, /none billed/);
  const q = planCompute({ now: T('2026-10-02T12:00:00Z'), visibility: 'public', sharded: false });
  assert.equal(q.shards, 1);
  assert.equal(q.beatMinutes, MAX_BEAT, 'one runner: the longest beat');
  assert.equal(q.relay, true);
  assert.equal(q.mergeMinutes, 0);
  const mach = planCompute({ now: T('2026-10-02T12:00:00Z'), visibility: 'public', sharded: false, machines: true });
  assert.equal(mach.shards, PUBLIC.shards, 'a tree whose swarm cannot shard still runs 100 computers when it can drive them');
  assert.equal(mach.mergeMinutes, PUBLIC.beatMinutes, 'and its merge grows the whole beat of eras');
  const w = planCompute({ now: T('2026-10-02T12:00:00Z'), visibility: 'public', sharded: true, wantMinutes: 20 });
  assert.equal(w.beatMinutes, 20);
  const big = planCompute({ now: T('2026-10-02T12:00:00Z'), visibility: 'public', wantMinutes: 9999 });
  assert.equal(big.beatMinutes, MAX_BEAT);
});

test('computers: a dispatch asks for exactly N on any repository, capped at 256, and the plan prices them', () => {
  const now = T('2026-10-02T12:00:00Z');
  const pub = planCompute({ now, visibility: 'public', wantComputers: 100 });
  assert.equal(pub.shards, 100);
  assert.equal(pub.computers, 100);
  assert.equal(pub.wantComputers, 100);
  assert.equal(pub.beatMinutes, waveMinutes(100));
  assert.match(pub.why, /the 100 computers asked/);
  assert.match(pub.why, /256 jobs in one matrix; a free account runs 20 at once and queues the rest/);
  const few = planCompute({ now, visibility: 'public', wantComputers: 7, sharded: true });
  assert.equal(few.shards, 7, 'exactly the number asked, not the default 100');
  assert.equal(few.beatMinutes, MAX_BEAT, 'one wave: the longest beat');
  const big = planCompute({ now, visibility: 'public', wantComputers: 1000 });
  assert.equal(big.shards, MAX_COMPUTERS);
  assert.equal(big.wantComputers, MAX_COMPUTERS);
  assert.match(big.why, /1000 asked, capped at 256/);
  const pv = priv({ now: T('2026-10-01T00:23:00Z'), spentMinutes: 0, wantComputers: 50 });
  assert.equal(pv.shards, 50);
  assert.equal(pv.computers, 50);
  assert.equal(pv.beatMinutes, MIN_BEAT);
  assert.equal(pv.mergeMinutes, MERGE_MINUTES);
  assert.equal(pv.costMinutes, 50 * (MIN_BEAT + JOB_OVERHEAD) + MERGE_MINUTES + JOB_OVERHEAD);
  assert.equal(pv.relay, false);
  assert.match(pv.why, /cost \d+ of the \d+ runner minutes the budget can pay/);
  const asked = priv({ now: T('2026-10-01T00:23:00Z'), spentMinutes: 0, wantComputers: 3, wantMinutes: 9 });
  assert.equal(asked.beatMinutes, 9, 'the minutes asked with them');
  const one = priv({ now: T('2026-10-01T00:23:00Z'), spentMinutes: 0, wantComputers: 1 });
  assert.equal(one.shards, 1);
  assert.equal(one.mergeMinutes, 0);
  assert.equal(one.costMinutes, MIN_BEAT + JOB_OVERHEAD);
  const down = planCompute({ now, visibility: null, apiError: 'HTTP 403', wantComputers: 100 });
  assert.equal(down.shards, 1, 'the budget unread: the safe default, never 100 unpriced runners');
  assert.match(down.why, /100 computers asked wait/);
});

test('computers: a private budget that cannot pay is refused, naming the number it can pay', () => {
  const now = T('2026-10-16T00:23:00Z');
  const p = priv({ now, spentMinutes: 1500, wantComputers: 100 });
  assert.equal(p.beatMinutes, 0);
  assert.equal(p.shards, 0);
  assert.equal(p.computers, 0);
  assert.equal(p.costMinutes, 0, 'a refusal spends nothing');
  const can = p.remainingMinutes - p.slotsLeft * PLAN_JOB_MINUTES;
  const k = payableOf(can, MIN_BEAT);
  assert.ok(k >= 2 && k < 100, 'payable ' + k);
  assert.ok(costOf(k, MIN_BEAT, MERGE_MINUTES) <= can && costOf(k + 1, MIN_BEAT, MERGE_MINUTES) > can, 'k is the most the budget pays');
  assert.match(p.why, new RegExp('^refused: 100 computers of ' + MIN_BEAT + ' minutes cost ' + costOf(100, MIN_BEAT, MERGE_MINUTES) + ' runner minutes and the budget can pay ' + can + ' '));
  assert.match(p.why, new RegExp('it can pay ' + k + ' computers$'));
  const ok = priv({ now, spentMinutes: 1500, wantComputers: k });
  assert.equal(ok.shards, k, 'the number named is paid');
  assert.ok(ok.costMinutes <= can);
  const spent = priv({ now, spentMinutes: 1900, wantComputers: 5 });
  assert.equal(spent.shards, 0);
  assert.match(spent.why, /5 computers asked, the budget can pay 0 computers/);
  assert.equal(payableOf(0, MIN_BEAT), 0);
  assert.equal(payableOf(MIN_BEAT + JOB_OVERHEAD, MIN_BEAT), 1);
  assert.equal(payableOf(1e9, MIN_BEAT), MAX_COMPUTERS, 'never more than one matrix holds');
});

test('the ledger counts the computers the plans started: this month, and a running total no month resets', () => {
  const p1 = planCompute({ now: T('2026-10-30T12:00:00Z'), visibility: 'public', wantComputers: 100 });
  const l1 = nextLedger(null, p1, { error: null, visibility: 'public', runs: {} }, 'a');
  assert.equal(l1.computersMonth, 100);
  assert.equal(l1.computersTotal, 100);
  assert.equal(l1.plans[0].computers, 100);
  assert.equal(l1.plans[0].costMinutes, p1.costMinutes);
  const l2 = nextLedger(l1, planCompute({ now: T('2026-10-31T12:00:00Z'), visibility: 'public', wantComputers: 30 }), null, 'b');
  assert.equal(l2.computersMonth, 130);
  assert.equal(l2.computersTotal, 130);
  const l3 = nextLedger(l2, planCompute({ now: T('2026-11-01T03:00:00Z'), visibility: 'public', wantComputers: 5 }), null, 'c');
  assert.equal(l3.computersMonth, 5, 'a new month counts again');
  assert.equal(l3.computersTotal, 135, 'the total is never reset');
  const l4 = nextLedger(l3, priv({ now: T('2026-11-20T09:23:00Z'), spentMinutes: 1900 }), null, 'd');
  assert.equal(l4.computersTotal, 135, 'no beat, no computer');
});

test('API down: a safe small default, unless this month\'s ledger already says spent', () => {
  const now = T('2026-10-12T15:23:00Z');
  for (const e of ['HTTP 403: Resource not accessible by integration', 'ECONNREFUSED', 'no GITHUB_TOKEN in the environment']) {
    const p = planCompute({ now, visibility: null, spentMinutes: null, apiError: e });
    assert.equal(p.beatMinutes, SAFE_BEAT);
    assert.equal(p.shards, 1);
    assert.equal(p.relay, false);
    assert.equal(p.visibility, 'unknown');
    assert.match(p.why, /^api: .*a safe small default$/);
  }
  const spentLedger = { month: '2026-10', spentMinutes: 1850 };
  const s = planCompute({ now, visibility: null, apiError: 'timed out', ledger: spentLedger });
  assert.equal(s.beatMinutes, 0);
  assert.match(s.why, /the ledger of 2026-10 says 1850/);
  const old = planCompute({ now, visibility: null, apiError: 'timed out', ledger: { month: '2026-09', spentMinutes: 1999 } });
  assert.equal(old.beatMinutes, SAFE_BEAT, 'a ledger of another month says nothing about this one');
  const fine = planCompute({ now, visibility: null, apiError: 'timed out', ledger: { month: '2026-10', spentMinutes: 100 } });
  assert.equal(fine.beatMinutes, SAFE_BEAT);
  const priv0 = planCompute({ now, visibility: 'private', spentMinutes: null, apiError: null });
  assert.equal(priv0.beatMinutes, SAFE_BEAT, 'a private repository whose minutes were not read is the safe default');
});

test('a clock at month end: the beat fits before the month turns, none when it cannot', () => {
  const p = priv({ now: T('2026-10-31T23:50:00Z'), spentMinutes: 500, sharded: true });
  assert.equal(p.slotsLeft, 1);
  assert.equal(p.beatMinutes, 10 - JOB_OVERHEAD);
  assert.equal(p.shards, 1);
  const q = priv({ now: T('2026-10-31T23:55:00Z'), spentMinutes: 500, sharded: true });
  assert.equal(q.beatMinutes, 0);
  assert.match(q.why, /^month end: /);
  const n = priv({ now: T('2026-11-01T00:23:00Z'), spentMinutes: 0 });
  assert.equal(n.month, '2026-11');
  assert.equal(n.slot, 0);
  const dec = monthOf(T('2026-12-31T23:59:59Z'));
  assert.equal(dec.month, '2026-12');
  assert.equal(dec.end, T('2027-01-01T00:00:00Z'));
});

test('a dispatch may ask for fewer minutes, never for more than the share', () => {
  const now = T('2026-10-05T06:23:00Z');
  const base = priv({ now, spentMinutes: 200 });
  assert.equal(priv({ now, spentMinutes: 200, wantMinutes: 3 }).beatMinutes, 3);
  assert.equal(priv({ now, spentMinutes: 200, wantMinutes: 500 }).beatMinutes, base.beatMinutes);
});

test('the other workflows\' pace is kept for them', () => {
  const now = T('2026-10-11T00:23:00Z');
  const a = priv({ now, spentMinutes: 400, otherMinutes: 0, budgetMinutes: 6000 });
  const b = priv({ now, spentMinutes: 400, otherMinutes: 380, budgetMinutes: 6000 });
  assert.ok(b.beatMinutes < a.beatMinutes, a.beatMinutes + ' then ' + b.beatMinutes);
  assert.match(b.why, /kept for the other workflows/);
});

test('chooseRunners: one runner until its cap binds, then shards inside the budget', () => {
  assert.deepEqual(chooseRunners(10), { beatMinutes: 8, shards: 1, mergeMinutes: 0 });
  assert.deepEqual(chooseRunners(10, { sharded: true }), { beatMinutes: 8, shards: 1, mergeMinutes: 0 });
  const one = chooseRunners(2000, { sharded: false });
  assert.deepEqual(one, { beatMinutes: MAX_BEAT, shards: 1, mergeMinutes: 0 });
  const many = chooseRunners(2000, { sharded: true });
  assert.ok(many.shards >= 2 && many.shards <= PRIVATE_MAX_SHARDS);
  assert.equal(many.mergeMinutes, MERGE_MINUTES);
  assert.ok(many.shards * (many.beatMinutes + JOB_OVERHEAD) + many.mergeMinutes + JOB_OVERHEAD <= 2000);
  assert.ok(many.beatMinutes <= MAX_BEAT);
  const mid = chooseRunners(600, { sharded: true });
  assert.ok(mid.shards * (mid.beatMinutes + JOB_OVERHEAD) + mid.mergeMinutes + JOB_OVERHEAD <= 600);
  assert.ok(mid.shards * mid.beatMinutes > MAX_BEAT);
  const wall = chooseRunners(2000, { sharded: true, wallCap: 30 });
  assert.ok(wall.beatMinutes + wall.mergeMinutes <= 30);
  assert.equal(chooseRunners(1).beatMinutes, 0);
});

// ---------------------------------------------------------------- billing arithmetic
test('a job bills whole minutes, weighted by its runner; skipped and self-hosted bill nothing', () => {
  const j = (s, e, labels = ['ubuntu-latest'], conclusion = 'success') => ({ started_at: s, completed_at: e, labels, conclusion });
  assert.equal(jobMinutes(j('2026-10-02T00:00:00Z', '2026-10-02T00:01:01Z')), 2);
  assert.equal(jobMinutes(j('2026-10-02T00:00:00Z', '2026-10-02T00:01:00Z')), 1);
  assert.equal(jobMinutes(j('2026-10-02T00:00:00Z', '2026-10-02T00:00:01Z')), 1);
  assert.equal(jobMinutes(j('2026-10-02T00:00:00Z', '2026-10-02T00:01:30Z', ['windows-latest'])), 4);
  assert.equal(jobMinutes(j('2026-10-02T00:00:00Z', '2026-10-02T00:00:30Z', ['macos-14'])), 10);
  assert.equal(jobMinutes(j('2026-10-02T00:00:00Z', '2026-10-02T00:09:00Z', ['self-hosted', 'linux'])), 0);
  assert.equal(jobMinutes(j('2026-10-02T00:00:00Z', '2026-10-02T00:09:00Z', ['ubuntu-latest'], 'skipped')), 0);
  assert.equal(jobMinutes({ started_at: '2026-10-02T00:00:00Z', completed_at: null, labels: [] }, T('2026-10-02T00:04:10Z')), 5);
  assert.equal(jobMinutes({ started_at: null }), 0);
  assert.equal(jobMinutes(null), 0);
  assert.equal(weightOf(['Windows-2022']), 2);
  assert.equal(runMinutes([j('2026-10-02T00:00:00Z', '2026-10-02T00:01:01Z'), j('2026-10-02T00:00:00Z', '2026-10-02T00:00:30Z')]), 3);
  assert.equal(wallMinutes({ status: 'completed', run_started_at: '2026-10-02T00:00:00Z', updated_at: '2026-10-02T00:02:01Z' }, 0), 3);
  assert.equal(wallMinutes({ status: 'in_progress', run_started_at: '2026-10-02T00:00:00Z', updated_at: '2026-10-02T00:00:05Z' }, T('2026-10-02T00:03:00Z')), 3);
});

test('the account endpoints: Actions minutes only, this month only, weighted', () => {
  assert.deepEqual(accountActions({ total_minutes_used: 512.4, included_minutes: 2000 }), { spent: 513, budget: 2000 });
  assert.equal(accountActions({ message: 'Not Found' }), null);
  const u = { usageItems: [
    { date: '2026-10-01T00:00:00Z', product: 'actions', sku: 'Actions Linux', quantity: 300, unitType: 'Minutes' },
    { date: '2026-10-02T00:00:00Z', product: 'Actions', sku: 'Actions Windows', quantity: 10, unitType: 'minutes' },
    { date: '2026-09-30T00:00:00Z', product: 'actions', sku: 'Actions Linux', quantity: 999, unitType: 'Minutes' },
    { date: '2026-10-02T00:00:00Z', product: 'actions', sku: 'Actions storage', quantity: 5, unitType: 'GigabyteHours' },
    { date: '2026-10-02T00:00:00Z', product: 'packages', sku: 'x', quantity: 7, unitType: 'Minutes' },
  ] };
  assert.equal(accountUsage(u, '2026-10'), 320);
  assert.equal(accountUsage({ usageItems: [] }, '2026-10'), null);
  assert.equal(accountUsage(null, '2026-10'), null);
});

// ---------------------------------------------------------------- the API, through a fake fetch
const NOW = T('2026-10-02T12:00:00Z');
const RUNS = [
  { id: 11, run_attempt: 1, path: '.github/workflows/heartbeat.yml', name: 'heartbeat', status: 'completed', created_at: '2026-10-01T03:23:00Z', run_started_at: '2026-10-01T03:23:05Z', updated_at: '2026-10-01T03:30:00Z' },
  { id: 12, run_attempt: 1, path: '.github/workflows/cloud.yml', name: 'brain cloud', status: 'completed', created_at: '2026-10-01T08:00:00Z', run_started_at: '2026-10-01T08:00:05Z', updated_at: '2026-10-01T08:02:00Z' },
  { id: 13, run_attempt: 2, path: '.github/workflows/heartbeat.yml', name: 'heartbeat', status: 'in_progress', created_at: '2026-10-02T11:50:00Z', run_started_at: '2026-10-02T11:55:00Z', updated_at: '2026-10-02T11:55:00Z' },
  { id: 9, run_attempt: 1, path: '.github/workflows/heartbeat.yml', name: 'heartbeat', status: 'completed', created_at: '2026-09-30T23:50:00Z', run_started_at: '2026-09-30T23:50:00Z', updated_at: '2026-10-01T00:20:00Z' },
];
const JOBS = {
  11: [{ started_at: '2026-10-01T03:23:10Z', completed_at: '2026-10-01T03:24:11Z', labels: ['ubuntu-latest'] }, { started_at: '2026-10-01T03:24:20Z', completed_at: '2026-10-01T03:24:50Z', labels: ['ubuntu-latest'] }],
  12: [{ started_at: '2026-10-01T08:00:10Z', completed_at: '2026-10-01T08:01:40Z', labels: ['windows-latest'] }],
  13: [{ started_at: '2026-10-02T11:55:00Z', completed_at: null, labels: ['ubuntu-latest'] }],
  9: [{ started_at: '2026-09-30T23:50:00Z', completed_at: '2026-10-01T00:20:00Z', labels: ['ubuntu-latest'] }],
};
/** A fake API: routes by path; `over` replaces a route's answer; it records every path asked. */
function fakeApi({ visibility = 'private', runs = RUNS, jobs = JOBS, over = {}, throws = null } = {}) {
  const asked = [];
  const reply = (status, body, headers = {}) => ({ ok: status >= 200 && status < 300, status, headers: { get: (k) => headers[k.toLowerCase()] ?? null }, text: async () => (typeof body === 'string' ? body : JSON.stringify(body)) });
  const f = async (url, opts) => {
    const u = new URL(url);
    const p = u.pathname;
    asked.push(p + u.search);
    f.headers.push(opts && opts.headers);
    if (throws) throw throws;
    for (const [k, v] of Object.entries(over)) if (p.endsWith(k) || (p + u.search).includes(k)) return typeof v === 'function' ? v(u) : reply(...v);
    if (/^\/repos\/[^/]+\/[^/]+$/.test(p)) return reply(200, { full_name: 'o/r', visibility, private: visibility !== 'public' });
    if (/\/actions\/runs$/.test(p)) {
      const page = Number(u.searchParams.get('page'));
      assert.equal(u.searchParams.get('created'), '>=2026-10-01');
      return reply(200, { total_count: runs.length, workflow_runs: page === 1 ? runs : [] });
    }
    const m = /\/actions\/runs\/(\d+)\/jobs$/.exec(p);
    if (m) return reply(200, { total_count: (jobs[m[1]] || []).length, jobs: jobs[m[1]] || [] });
    if (/settings\/billing/.test(p)) return reply(404, { message: 'Not Found' });
    return reply(404, { message: 'Not Found' });
  };
  f.asked = asked;
  f.headers = [];
  return f;
}

test('readSpent: every run created this month, each job rounded, the heartbeat\'s share named, completed runs cached', async () => {
  const f = fakeApi();
  const r = await readSpent({ repo: 'o/r', token: 'ghp_' + 'a'.repeat(36), now: NOW, fetch: f });
  assert.equal(r.error, null);
  assert.equal(r.visibility, 'private');
  assert.equal(r.spentMinutes, 3 + 4 + 5);
  assert.equal(r.heartbeatMinutes, 3 + 5);
  assert.equal(r.otherMinutes, 4);
  assert.equal(r.source, 'runs');
  assert.deepEqual(r.runs, { '11:1': 3, '12:1': 4 }, 'only completed runs are cached; the running one is read again next time');
  assert.ok(!f.asked.some((a) => a.includes('/runs/9/')), 'a run of last month is not counted');
  assert.equal(f.headers[0].authorization, 'Bearer ghp_' + 'a'.repeat(36));
  const g = fakeApi();
  const c = await readSpent({ repo: 'o/r', token: 't', now: NOW, fetch: g, cache: r.runs });
  assert.equal(c.spentMinutes, 12);
  assert.ok(!g.asked.some((a) => a.includes('/runs/11/jobs') || a.includes('/runs/12/jobs')), 'cached runs are not asked again');
  assert.ok(g.asked.some((a) => a.includes('/runs/13/jobs')));
  const stale = await readSpent({ repo: 'o/r', token: 't', now: NOW, fetch: fakeApi(), cache: { '13:2': 99, '11:1': 50 } });
  assert.equal(stale.spentMinutes, 50 + 4 + 5, 'an in-progress run is never taken from the cache');
});

test('readSpent: a public repository needs no run read; no token or no repository asks nothing', async () => {
  const f = fakeApi({ visibility: 'public' });
  const r = await readSpent({ repo: 'o/r', token: 't', now: NOW, fetch: f });
  assert.equal(r.visibility, 'public');
  assert.equal(r.spentMinutes, null);
  assert.equal(f.asked.length, 1);
  const g = fakeApi();
  assert.match((await readSpent({ repo: 'o/r', token: '', now: NOW, fetch: g })).error, /no GITHUB_TOKEN/);
  assert.match((await readSpent({ repo: null, token: 't', now: NOW, fetch: g })).error, /no repository/);
  assert.match((await readSpent({ repo: 'o/r/../x', token: 't', now: NOW, fetch: g })).error, /no repository/);
  assert.equal(g.asked.length, 0);
});

test('readSpent: 403, a rate limit, offline and a bad body are errors, never a throw, never the token', async () => {
  const token = 'ghp_' + 'Z'.repeat(36);
  const forbidden = await readSpent({ repo: 'o/r', token, now: NOW, fetch: fakeApi({ over: { '/repos/o/r': [403, { message: 'Resource not accessible by integration' }] } }) });
  assert.match(forbidden.error, /HTTP 403: Resource not accessible/);
  const limited = await readSpent({ repo: 'o/r', token, now: NOW, fetch: fakeApi({ over: { '/actions/runs?': [403, { message: 'API rate limit exceeded' }, { 'x-ratelimit-remaining': '0' }] } }) });
  assert.equal(limited.visibility, 'private');
  assert.match(limited.error, /rate limited/);
  assert.equal(limited.spentMinutes, null);
  const err = new Error('connect ECONNREFUSED with ' + token);
  const offline = await readSpent({ repo: 'o/r', token, now: NOW, fetch: fakeApi({ throws: err }) });
  assert.ok(offline.error && !offline.error.includes(token), offline.error);
  assert.match(offline.error, /<token>/);
  const notJson = await readSpent({ repo: 'o/r', token, now: NOW, fetch: fakeApi({ over: { '/repos/o/r': [200, '<html>'] } }) });
  assert.match(notJson.error, /not JSON/);
  const noVis = await readSpent({ repo: 'o/r', token, now: NOW, fetch: fakeApi({ over: { '/repos/o/r': [200, { full_name: 'o/r' }] } }) });
  assert.match(noVis.error, /no visibility/);
  const p = planCompute({ now: NOW, visibility: forbidden.visibility, spentMinutes: forbidden.spentMinutes, apiError: forbidden.error });
  assert.equal(p.beatMinutes, SAFE_BEAT);
});

test('readSpent: a jobs read that fails is estimated from the run\'s wall time and counted as partial', async () => {
  const r = await readSpent({ repo: 'o/r', token: 't', now: NOW, fetch: fakeApi({ over: { '/runs/12/jobs': [500, { message: 'boom' }] } }) });
  assert.equal(r.partial, 1);
  assert.equal(r.spentMinutes, 3 + 2 + 5);
  assert.ok(!('12:1' in r.runs), 'an estimate is never cached');
});

test('readSpent: runs are paged until a short page', async () => {
  const many = Array.from({ length: 100 }, (_, k) => ({ id: 1000 + k, run_attempt: 1, path: '.github/workflows/heartbeat.yml', status: 'completed', created_at: '2026-10-01T01:00:00Z', run_started_at: '2026-10-01T01:00:00Z', updated_at: '2026-10-01T01:01:00Z' }));
  const pages = { 1: many, 2: RUNS.slice(0, 1) };
  const f = fakeApi({ over: { '/actions/runs?': (u) => ({ ok: true, status: 200, headers: { get: () => null }, text: async () => JSON.stringify({ workflow_runs: pages[u.searchParams.get('page')] || [] }) }) } });
  const r = await readSpent({ repo: 'o/r', token: 't', now: NOW, fetch: f });
  assert.equal(r.error, null);
  assert.ok(f.asked.some((a) => a.includes('page=2')));
  assert.ok(!f.asked.some((a) => a.includes('/actions/runs?') && a.includes('page=3')));
  assert.equal(r.spentMinutes, 3, 'runs without jobs bill nothing; run 11 bills 3');
});

test('readSpent: the account figure wins when it is larger, and names the budget', async () => {
  const f = fakeApi({ over: { '/settings/billing/actions': [200, { total_minutes_used: 900, included_minutes: 3000 }] } });
  const r = await readSpent({ repo: 'o/r', token: 't', now: NOW, fetch: f });
  assert.equal(r.spentMinutes, 900);
  assert.equal(r.source, 'account');
  assert.equal(r.budgetMinutes, 3000);
  assert.equal(r.heartbeatMinutes, 8);
  assert.equal(r.otherMinutes, 892);
  const g = fakeApi({ over: { '/settings/billing/usage': [200, { usageItems: [{ date: '2026-10-01', product: 'actions', sku: 'Actions Linux', quantity: 640, unitType: 'Minutes' }] }] } });
  const s = await readSpent({ repo: 'o/r', token: 't', now: NOW, fetch: g });
  assert.equal(s.spentMinutes, 640);
  assert.ok(g.asked.some((a) => a.includes('year=2026&month=10')));
  const small = await readSpent({ repo: 'o/r', token: 't', now: NOW, fetch: fakeApi({ over: { '/settings/billing/actions': [200, { total_minutes_used: 2 }] } }) });
  assert.equal(small.spentMinutes, 12, 'a smaller account figure never lowers what the runs billed');
  assert.equal(small.source, 'runs');
});

test('client: a call cap and a deadline; the token travels only in the header', async () => {
  const f = fakeApi();
  let t = 0;
  const c = client({ token: 'tok', fetch: f, deadline: 100, clock: () => t });
  assert.equal((await c.get('/repos/o/r')).ok, true);
  t = 100;
  assert.match((await c.get('/repos/o/r')).why, /deadline/);
  assert.equal(f.asked.length, 1);
  const d = client({ token: 'tok', fetch: f });
  d.calls = MAX_CALLS;
  assert.match((await d.get('/repos/o/r')).why, /call cap/);
  assert.ok(f.asked.every((a) => !a.includes('tok')));
  assert.equal(scrub('bad ghp_' + 'x'.repeat(30) + ' here\nsecond line'), 'bad <token> here');
  assert.equal(scrub('the s3cret leaked', 's3cret'), 'the <token> leaked');
});

// ---------------------------------------------------------------- the tree, the ledger, the CLI
function fakeTree({ swarmHelp = null, eraHelp = null, gen = null } = {}) {
  const d = tmp();
  fs.mkdirSync(path.join(d, 'grow'), { recursive: true });
  if (swarmHelp !== null) fs.writeFileSync(path.join(d, 'grow', 'swarm.mjs'), 'console.log(' + JSON.stringify(swarmHelp) + ');\n');
  if (eraHelp !== null) fs.writeFileSync(path.join(d, 'grow', 'era.mjs'), 'console.log(' + JSON.stringify(eraHelp) + ');\n');
  if (gen) { fs.mkdirSync(path.join(d, 'grown'), { recursive: true }); fs.writeFileSync(path.join(d, 'grown', 'index.json'), JSON.stringify({ generation: gen[0] })); fs.writeFileSync(path.join(d, 'grown', 'generations.json'), JSON.stringify({ generations: gen.slice(1).map((g) => ({ generation: g })) })); }
  return d;
}
const SWARM_C8 = 'grow [--shard <i>/<n>] [--stage <dir>] [--no-merge]\n  merge --stage <dir>';
const ERA_STAGED = 'run [--max-ms 480000] [--commit] [--staged <dir>]';

test('shards are planned only when the tree can grow them (--shard, --no-merge) and merge them through an era (--staged)', () => {
  const both = fakeTree({ swarmHelp: SWARM_C8, eraHelp: ERA_STAGED });
  const noStaged = fakeTree({ swarmHelp: SWARM_C8, eraHelp: 'run [--max-ms 480000] [--commit]' });
  const noShard = fakeTree({ swarmHelp: 'grow [--max-ms 300000]', eraHelp: ERA_STAGED });
  const noMerge = fakeTree({ swarmHelp: 'grow [--shard <i>/<n>]', eraHelp: ERA_STAGED });
  const none = fakeTree();
  try {
    assert.equal(shardedOf(both).sharded, true);
    assert.equal(shardedOf(noStaged).sharded, false);
    assert.equal(shardedOf(noShard).sharded, false);
    assert.equal(shardedOf(noMerge).sharded, false);
    assert.equal(shardedOf(none).sharded, false);
    assert.equal(shardedOf(none).machines, false);
    const m = fakeTree();
    fs.writeFileSync(path.join(m, 'grow', 'machine.mjs'), 'console.log(' + JSON.stringify('step [--shard <i>/<n>] [--out <dir>]') + ');\n');
    const half = fakeTree();
    fs.writeFileSync(path.join(half, 'grow', 'machine.mjs'), 'console.log("step [--shard <i>/<n>]");\n');
    try { assert.equal(shardedOf(m).machines, true); assert.equal(shardedOf(half).machines, false); } finally { rm(m); rm(half); }
    const real = shardedOf(ROOT);
    assert.equal(real.machines, true, 'this tree\'s grow/machine.mjs names --shard and --out');
  } finally { for (const d of [both, noStaged, noShard, noMerge, none]) rm(d); }
});

test('the generation every shard grows: one past the larger of grown/index.json and grown/generations.json', () => {
  const a = fakeTree({ gen: [6, 3, 9] }), b = fakeTree();
  try { assert.equal(generationOf(a), 10); assert.equal(generationOf(b), 1); } finally { rm(a); rm(b); }
});

test('repoOf: the flag, then GITHUB_REPOSITORY, then the origin remote', () => {
  const d = tmp();
  try {
    assert.equal(repoOf(d, { flag: 'a/b', env: { GITHUB_REPOSITORY: 'c/d' } }), 'a/b');
    assert.equal(repoOf(d, { env: { GITHUB_REPOSITORY: 'c/d' } }), 'c/d');
    spawnSync('git', ['init', '-q', d]);
    spawnSync('git', ['-C', d, 'remote', 'add', 'origin', 'https://github.com/j4ydenlxl/brain.git']);
    assert.equal(repoOf(d, { env: {} }), 'j4ydenlxl/brain');
    spawnSync('git', ['-C', d, 'remote', 'set-url', 'origin', 'git@github.com:someone/thing']);
    assert.equal(repoOf(d, { env: {} }), 'someone/thing');
  } finally { rm(d); }
});

test('the ledger: this month\'s numbers and cache, reset at a new month, the last plans kept, the old reading kept when the API fails', () => {
  const p1 = priv({ now: T('2026-10-02T12:00:00Z'), spentMinutes: 500 });
  const read = { error: null, visibility: 'private', heartbeatMinutes: 400, source: 'runs', runs: { '1:1': 3 } };
  const l1 = nextLedger(null, p1, read, '2026-10-02T12:00:00.000Z');
  assert.equal(l1.month, '2026-10');
  assert.equal(l1.spentMinutes, 500);
  assert.equal(l1.reservePct, RESERVE_PCT);
  assert.deepEqual(l1.runs, { '1:1': 3 });
  assert.equal(l1.plans.length, 1);
  const p2 = planCompute({ now: T('2026-10-02T15:00:00Z'), visibility: null, apiError: 'HTTP 403' });
  const l2 = nextLedger(l1, p2, { error: 'HTTP 403', runs: {} }, '2026-10-02T15:00:00.000Z');
  assert.equal(l2.spentMinutes, 500, 'a failed read keeps the last good one');
  assert.equal(l2.at, '2026-10-02T12:00:00.000Z');
  assert.deepEqual(l2.runs, { '1:1': 3 });
  assert.equal(l2.plans.length, 2);
  const p3 = priv({ now: T('2026-11-01T00:23:00Z'), spentMinutes: 0 });
  const l3 = nextLedger(l2, p3, { error: null, runs: { '7:1': 1 }, heartbeatMinutes: 0, source: 'runs' }, '2026-11-01T00:23:00.000Z');
  assert.equal(l3.month, '2026-11');
  assert.deepEqual(l3.runs, { '7:1': 1 }, 'a new month starts a new cache');
  assert.equal(l3.plans.length, 1);
  let l = l3;
  for (let k = 0; k < KEEP_PLANS + 10; k++) l = nextLedger(l, p3, null, 'x');
  assert.equal(l.plans.length, KEEP_PLANS);
});

test('plan end to end: the API, the cache from the ledger, --write writes neo/COMPUTE.json and nothing else', async () => {
  const d = fakeTree({ gen: [4] });
  try {
    const env = { GITHUB_TOKEN: 'ghp_' + 'q'.repeat(36) };
    const before = fs.readdirSync(d, { recursive: true }).sort();
    const a = await plan({ root: d, env, repo: 'o/r', now: NOW, fetch: fakeApi() });
    assert.equal(a.spentMinutes, 12);
    assert.equal(a.gen, 5);
    assert.equal(a.sharded, false);
    assert.deepEqual(fs.readdirSync(d, { recursive: true }).sort(), before, 'no --write: nothing written');
    const b = await plan({ root: d, env, repo: 'o/r', now: NOW, fetch: fakeApi(), write: true });
    assert.equal(b.wrote, LEDGER);
    const after = fs.readdirSync(d, { recursive: true }).map((x) => x.split(path.sep).join('/')).sort();
    assert.deepEqual(after.filter((x) => !before.map((y) => y.split(path.sep).join('/')).includes(x)), ['neo', 'neo/COMPUTE.json']);
    const led = readLedger(d);
    assert.equal(led.spentMinutes, 12);
    assert.deepEqual(led.runs, { '11:1': 3, '12:1': 4 });
    assert.ok(!JSON.stringify(led).includes(env.GITHUB_TOKEN), 'the token is never written');
    const g = fakeApi();
    const c = await plan({ root: d, env, repo: 'o/r', now: NOW, fetch: g });
    assert.equal(c.spentMinutes, 12);
    assert.ok(!g.asked.some((x) => x.includes('/runs/11/jobs')), 'the ledger\'s cache spares the call');
    const e = await plan({ root: d, env: { ...env, BRAIN_BUDGET_MINUTES: '3000' }, repo: 'o/r', now: NOW, fetch: fakeApi() });
    assert.equal(e.budgetMinutes, 3000);
    const f = await plan({ root: d, env, repo: 'o/r', now: NOW, fetch: fakeApi(), budget: 2500 });
    assert.equal(f.budgetMinutes, 2500);
    writeLedger(d, { month: '2026-10', spentMinutes: 1900 });
    const down = await plan({ root: d, env, repo: 'o/r', now: NOW, fetch: fakeApi({ throws: new Error('offline') }) });
    assert.equal(down.beatMinutes, 0, 'the API is down and the ledger says spent');
  } finally { rm(d); }
});

test('outputs: the plan as step outputs, a matrix that is never empty, the safe default for a line that is not a plan', () => {
  const kv = (lines) => Object.fromEntries(lines.map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));
  const a = kv(outputsOf('noise\n{"beatMinutes":12,"shards":3,"relay":true,"mergeMinutes":10,"gen":8,"why":"a%b\\nc"}'));
  assert.deepEqual(a, { run: 'true', beat_minutes: '12', shards: '3', matrix: '[0,1,2]', relay: 'true', merge_minutes: '10', gen: '8', computers: '3', cost_minutes: String(costOf(3, 12, 10)), swarm: 'true', why: 'a b c' });
  const priced = kv(outputsOf('{"beatMinutes":4,"shards":2,"relay":false,"mergeMinutes":10,"costMinutes":24,"sharded":false,"why":"x"}'));
  assert.equal(priced.cost_minutes, '24', 'the plan\'s own cost is kept');
  assert.equal(priced.swarm, 'false', 'a tree whose swarm cannot shard: its computers drive their browsers only');
  const one = kv(outputsOf('{"beatMinutes":4,"shards":1,"relay":false,"mergeMinutes":0,"gen":2,"why":"x"}'));
  assert.equal(one.matrix, '[0]');
  assert.equal(one.run, 'true');
  const skip = kv(outputsOf('{"beatMinutes":0,"shards":0,"relay":false,"mergeMinutes":0,"why":"spent"}'));
  assert.equal(skip.run, 'false');
  assert.equal(skip.matrix, '[0]');
  for (const bad of ['', 'not json', '{"beatMinutes":"x"}', '{"beatMinutes":-1,"shards":1}', '[]']) {
    const o = kv(outputsOf(bad));
    assert.equal(o.run, 'true');
    assert.equal(o.beat_minutes, String(SAFE_BEAT));
    assert.equal(o.shards, '1');
    assert.equal(o.relay, 'false');
  }
  assert.equal(kv(outputsOf('{"beatMinutes":999,"shards":99,"relay":true}')).beat_minutes, String(MAX_BEAT));
  assert.equal(kv(outputsOf('{"beatMinutes":9,"shards":99,"relay":true}')).shards, '99');
  const top = kv(outputsOf('{"beatMinutes":9,"shards":300,"relay":true}'));
  assert.equal(top.shards, String(MAX_COMPUTERS), 'a matrix never asks for more than GitHub runs in one');
  assert.equal(JSON.parse(top.matrix).length, MAX_COMPUTERS);
  assert.equal(top.computers, String(MAX_COMPUTERS));
  assert.equal(kv(outputsOf('{"beatMinutes":0,"shards":0,"relay":false}')).computers, '0');
  for (const l of outputsOf('{"beatMinutes":4,"shards":1,"why":"line1\\nline2"}')) assert.ok(!l.includes('\n'));
});

test('CLI: usage, flags, and a plan with no token is the safe default, one JSON line, exit 0', async () => {
  assert.deepEqual(await main(['help']), { usage: true });
  assert.deepEqual(await main([]), { usage: true });
  await assert.rejects(main(['plan', '--bogus', '1']), (e) => e.code === 2);
  await assert.rejects(main(['fly']), (e) => e.code === 2);
  await assert.rejects(main(['plan', '--minutes', 'x']), (e) => e.code === 2);
  await assert.rejects(main(['plan', '--now', 'yesterday-ish']), (e) => e.code === 2);
  await assert.rejects(main(['plan', '--max-ms', '5']), (e) => e.code === 2);
  await assert.rejects(main(['plan', '--budget', '0']), (e) => e.code === 2);
  await assert.rejects(main(['plan', 'extra']), (e) => e.code === 2);
  for (const bad of ['0', '-3', 'x', '2.5']) await assert.rejects(main(['plan', '--computers', bad]), (e) => e.code === 2, '--computers ' + bad);
  await assert.rejects(main(['outputs']), (e) => e.code === 2);
  assert.equal(parseArgs(['plan', '--root=/x', '--write']).flags.root, '/x');
  assert.equal(parseArgs(['plan', '--write']).flags.write, true);
  const d = fakeTree();
  try {
    const r = await main(['plan', '--root', d, '--repo', 'o/r', '--now', '2026-10-02T12:00:00Z', '--era', '3'], { env: {} });
    assert.equal(r.lines.length, 1);
    const p = JSON.parse(r.lines[0]);
    assert.equal(p.beatMinutes, SAFE_BEAT);
    assert.match(p.why, /no GITHUB_TOKEN/);
  } finally { rm(d); }
});

test('CLI child process: a local API, the token in the environment only, never printed', async () => {
  const token = 'ghp_' + 'L'.repeat(36);
  const seen = [];
  const server = http.createServer((req, res) => {
    seen.push(req.headers.authorization);
    const u = new URL(req.url, 'http://x');
    const send = (code, body) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
    if (u.pathname === '/repos/o/r') return send(200, { visibility: 'private' });
    if (u.pathname === '/repos/o/r/actions/runs') return send(200, { workflow_runs: RUNS });
    const m = /\/actions\/runs\/(\d+)\/jobs$/.exec(u.pathname);
    if (m) return send(200, { jobs: JOBS[m[1]] || [] });
    return send(404, { message: 'Not Found' });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const d = fakeTree();
  try {
    const port = server.address().port;
    const env = { ...process.env, GITHUB_TOKEN: token, BRAIN_GITHUB_API: 'http://127.0.0.1:' + port };
    delete env.GH_TOKEN;
    const out = await new Promise((resolve) => execFile(process.execPath, [SCRIPT, 'plan', '--root', d, '--repo', 'o/r', '--now', '2026-10-02T12:00:00Z', '--write'], { env, timeout: 60000 }, (err, stdout, stderr) => resolve({ code: err ? err.code : 0, stdout, stderr })));
    assert.equal(out.code, 0, out.stderr);
    const lines = out.stdout.trim().split(/\r?\n/);
    const p = JSON.parse(lines[lines.length - 1]);
    assert.equal(p.visibility, 'private');
    assert.equal(p.spentMinutes, 12);
    assert.ok(p.beatMinutes >= MIN_BEAT);
    assert.ok(!out.stdout.includes(token) && !out.stderr.includes(token));
    assert.ok(seen.every((h) => h === 'Bearer ' + token));
    assert.ok(!fs.readFileSync(path.join(d, LEDGER), 'utf8').includes(token));
    const bad = await new Promise((resolve) => execFile(process.execPath, [SCRIPT, 'plan', '--nope'], { env, timeout: 30000 }, (err, stdout, stderr) => resolve({ code: err ? err.code : 0, stdout, stderr })));
    assert.equal(bad.code, 2);
    assert.match(bad.stderr, /usage:/);
  } finally { server.close(); rm(d); }
});

// ---------------------------------------------------------------- the YAML reader and the workflow's rules
const WF_FILE = path.join(ROOT, 'body', 'heartbeat.yml');
const WF_TEXT = fs.readFileSync(WF_FILE, 'utf8');
const WF = parseYaml(WF_TEXT).value;

test('parseYaml: maps, lists, block scalars, flow nodes, quotes, comments; total on anything', () => {
  const y = parseYaml([
    'a: 1 # a comment',
    'b: "x # not a comment"',
    "c: 'it''s'",
    'd: [x, "y, z", 3]',
    'e: { k: v, n: 2 }',
    'f:',
    '  - one',
    '  - k: v',
    '    m: true',
    '  -',
    '    deep: null',
    'g: |',
    '  line 1',
    '    line 2 # kept',
    '',
    '  line 3',
    'h: >-',
    '  folded',
    '  text',
    'i:',
    '- same indent item',
    'j: ${{ a == \'b\' }}',
    'k: a#b c#d # a comment',
  ].join('\n'));
  assert.equal(y.value.k, 'a#b c#d', 'a # inside a word is text, only a # after a space opens a comment');
  assert.equal(y.ok, true, JSON.stringify(y.errors));
  assert.deepEqual(y.value.a, 1);
  assert.equal(y.value.b, 'x # not a comment');
  assert.equal(y.value.c, "it's");
  assert.deepEqual(y.value.d, ['x', 'y, z', 3]);
  assert.deepEqual(y.value.e, { k: 'v', n: 2 });
  assert.deepEqual(y.value.f, ['one', { k: 'v', m: true }, { deep: null }]);
  assert.equal(y.value.g, 'line 1\n  line 2 # kept\n\nline 3\n');
  assert.equal(y.value.h, 'folded text');
  assert.deepEqual(y.value.i, ['same indent item']);
  assert.equal(y.value.j, "${{ a == 'b' }}");
  const bad = parseYaml('a: 1\n    b: 2\nc d e\na: 3');
  assert.equal(bad.ok, false);
  assert.deepEqual(bad.errors.map((e) => e.line).sort(), [2, 3, 4]);
  assert.match(bad.errors.find((e) => e.line === 4).why, /duplicate key/);
  for (const junk of [null, undefined, '', '\t- :\n  ]]]', '- - - -', ':::', '"unterminated', 'a:\n  - b\n c: d', 42]) {
    const r = parseYaml(junk);
    assert.equal(typeof r.ok, 'boolean');
    assert.ok(Array.isArray(r.errors));
  }
  assert.equal(scalarOf('"a\\"b"'), 'a"b');
  assert.equal(scalarOf('~'), null);
  assert.equal(scalarOf('-7'), -7);
});

test('body/heartbeat.yml: parsed whole, every rule holds', () => {
  const r = lintWorkflow(WF_TEXT);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.problems, []);
  assert.equal(r.ok, true);
  assert.deepEqual(r.jobs, ['plan', 'grow', 'merge', 'site']);
  assert.deepEqual(r.needs, { plan: [], grow: ['plan'], merge: ['plan', 'grow'], site: [] });
  assert.equal(r.rules, RULES.length);
  assert.equal(WF.on.schedule[0].cron, '23 */3 * * *');
  assert.equal(WF.jobs.plan.if, "github.event_name != 'push'");
  assert.equal(WF.jobs.site.if, "github.event_name == 'push'");
  assert.match(WF.concurrency.group, /'heartbeat'/);
  assert.equal(WF.permissions.contents, 'write');
  assert.ok(WF.jobs.grow['timeout-minutes'] >= MAX_BEAT && WF.jobs.merge['timeout-minutes'] >= MAX_BEAT);
  assert.match(WF.jobs.grow.if, /needs\.plan\.outputs\.run == 'true'/);
  assert.match(WF.jobs.merge.if, /!cancelled\(\)/);
  assert.ok(!/claude|anthropic|openai|ANTHROPIC_API_KEY/i.test(WF_TEXT.replace(/^#.*$/gm, '')), 'no model, no key in the workflow');
  assert.ok(!/\u2014/.test(WF_TEXT), 'no em-dash');
});

test('each rule of the heartbeat fails by name when the file drops it', () => {
  const cut = [
    ['cron 23 */3 * * *', ['"23 */3 * * *"', '"0 * * * *"']],
    ['dispatch inputs minutes, relay, beats', ['      beats:\n', '      count:\n']],
    ['the heartbeat concurrency group, never cancelled', ["|| 'heartbeat' }}\n  cancel-in-progress: false", "|| 'heartbeat' }}\n  cancel-in-progress: true"]],
    ['jobs plan, grow, merge', ['\n  merge:\n', '\n  merged:\n']],
    ['plan runs compute plan and its outputs', ['node grow/compute.mjs outputs "$line" >> "$GITHUB_OUTPUT"', 'node grow/compute.mjs outputs "$line"']],
    ['plan reads neo/STOP', ['[ -e neo/STOP ]', '[ -e neo/HALT ]']],
    ['plan job outputs beat_minutes, shards, matrix, relay', ['      matrix: ${{ steps.plan.outputs.matrix }}\n', '']],
    ['grow needs plan', ['    needs: plan\n', '    needs: site\n']],
    ['grow is a matrix of the planned shards', ['shard: ${{ fromJSON(needs.plan.outputs.matrix) }}', 'shard: [0, 1]']],
    ['grow runs swarm grow --shard --stage --no-merge', [' --no-merge --max-ms', ' --max-ms']],
    ['grow uploads its stage', ['        if: always()\n        uses: actions/upload-artifact@v4', '        if: always()\n        uses: actions/cache/save@v4']],
    ['merge needs plan and grow', ['needs: [plan, grow]', 'needs: [plan]']],
    ['merge downloads the stages', ['actions/download-artifact@v4', 'actions/cache/restore@v4']],
    ['merge runs the staged era and the plain era', ['--commit --staged', '--commit --stage']],
    ['merge fetches and hard resets before each era', ['git reset -q --hard origin/master; git clean', 'git clean']],
    ['the author is the organism', ['git config user.name "brain organism"', 'git config user.name "someone"']],
    ['merge relays the next beat', ['gh workflow run heartbeat.yml', 'gh workflow list heartbeat.yml']],
    ['the site data is rebuilt when neo/ or grown/ changed', ['HEAD -- neo grown', 'HEAD -- web']],
    ['a push to master that changed neo/ or grown/ rebuilds the site', ['"grown/**"]', '"web/**"]']],
    ['dispatch input computers', ['      computers:\n', '      machines:\n']],
    ['plan passes the computers asked', ['plan --write $want $comp', 'plan --write $want']],
    ['plan prints the plan line and its cost before the matrix', ['echo "cost: ', 'echo "price: ']],
    ['plan job outputs computers, cost_minutes, swarm', ['      swarm: ${{ steps.plan.outputs.swarm }}\n', '']],
    ['grow runs machine step --shard --out beside its shard', ['--max-ms "$mms" > "$RUNNER_TEMP/machine.log" 2>&1 &\n', '--max-ms "$mms" > "$RUNNER_TEMP/machine.log" 2>&1\n']],
    ['grow uploads its computer as its own artifact, outside the stage', ['name: machine-${{ github.run_id }}-${{ matrix.shard }}', 'name: stage-${{ github.run_id }}-m${{ matrix.shard }}']],
    ['merge downloads the computers and lands them', ['pattern: machine-${{ github.run_id }}-*', 'pattern: stage-${{ github.run_id }}-*']],
    ['a one-runner beat runs machine step in the merge', ['step --shard 0/1 --out', 'step --out']],
  ];
  assert.equal(cut.length, RULES.length, 'every rule has its cut');
  for (const [rule, [from, to]] of cut) {
    assert.ok(WF_TEXT.includes(from), 'the file holds ' + JSON.stringify(from));
    const r = lintWorkflow(WF_TEXT.split(from).join(to));
    assert.equal(r.ok, false, rule);
    assert.ok(r.problems.includes(rule), rule + ' -> ' + JSON.stringify(r.problems));
  }
  const broken = lintWorkflow(WF_TEXT.replace('jobs:\n', 'jobs:\n    stray: here\n  oops\n'));
  assert.equal(broken.ok, false);
  assert.ok(broken.errors.length > 0);
});

test('actionlint, only when it is already on this machine', (t) => {
  const v = spawnSync('actionlint', ['-version'], { encoding: 'utf8' });
  if (v.error || v.status !== 0) { t.skip('actionlint is not on this machine (not installed by rule)'); return; }
  const r = spawnSync('actionlint', [WF_FILE], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

// ---------------------------------------------------------------- the workflow's shell, run for real in temp trees
const BASH = (() => {
  for (const b of process.platform === 'win32' ? ['C:/Program Files/Git/bin/bash.exe', 'bash'] : ['bash']) {
    const r = spawnSync(b, ['-c', 'echo ok'], { encoding: 'utf8' });
    if (!r.error && r.status === 0 && r.stdout.trim() === 'ok') return b;
  }
  return null;
})();
const fwd = (p) => p.split(path.sep).join('/');
const stepOf = (job, re) => { const s = WF.jobs[job].steps.find((x) => typeof x.run === 'string' && re.test(x.run)); assert.ok(s, job + ' has a step ' + re); return s.run; };
const PATHV = (extra = []) => [...extra, path.dirname(process.execPath), process.env.PATH || process.env.Path || ''].join(path.delimiter);
function sh(script, { cwd, env = {}, extraPath = [] }) {
  const f = path.join(cwd, '..', 'step-' + Math.random().toString(36).slice(2) + '.sh');
  fs.writeFileSync(f, script);
  try {
    const e = { ...process.env, ...env, PATH: PATHV(extraPath) };
    delete e.GITHUB_TOKEN; delete e.GH_TOKEN; delete e.Path;
    Object.assign(e, env);
    return spawnSync(BASH, ['--noprofile', '--norc', '-eo', 'pipefail', fwd(f)], { cwd, env: e, encoding: 'utf8', timeout: 180000 });
  } finally { fs.rmSync(f, { force: true }); }
}
const git = (cwd, ...a) => spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-C', cwd, ...a], { encoding: 'utf8' });
const outs = (f) => Object.fromEntries(fs.readFileSync(f, 'utf8').trim().split(/\r?\n/).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));
/** A bare origin with master and a clone of it, holding `files`. */
function repoPair(files) {
  const top = tmp();
  const origin = path.join(top, 'origin.git'), work = path.join(top, 'work'), seed = path.join(top, 'seed');
  git(top, 'init', '-q', '--bare', '-b', 'master', fwd(origin));
  fs.mkdirSync(seed);
  git(seed, 'init', '-q', '-b', 'master');
  for (const [p, t] of Object.entries(files)) { fs.mkdirSync(path.dirname(path.join(seed, p)), { recursive: true }); fs.writeFileSync(path.join(seed, p), t); }
  git(seed, 'add', '-A'); git(seed, 'commit', '-q', '-m', 'seed'); git(seed, 'remote', 'add', 'origin', fwd(origin)); git(seed, 'push', '-q', 'origin', 'master');
  git(top, 'clone', '-q', fwd(origin), fwd(work));
  const rt = path.join(top, 'runner'); fs.mkdirSync(rt);
  return { top, origin, work, seed, rt };
}

test('every run block of the workflow is valid bash', (t) => {
  if (!BASH) { t.skip('no bash on this machine'); return; }
  let n = 0;
  for (const [name, job] of Object.entries(WF.jobs)) for (const s of job.steps) if (typeof s.run === 'string') {
    const r = spawnSync(BASH, ['-n'], { input: s.run, encoding: 'utf8' });
    assert.equal(r.status, 0, name + ': ' + s.name + ': ' + r.stderr);
    n++;
  }
  assert.ok(n >= 6, 'run blocks checked: ' + n);
});

test('workflow plan step: the plan into $GITHUB_OUTPUT, the ledger written, neo/STOP stops it, a missing compute is the safe default', (t) => {
  if (!BASH) { t.skip('no bash on this machine'); return; }
  const p = repoPair({ 'grow/compute.mjs': fs.readFileSync(SCRIPT, 'utf8'), 'README': 'x' });
  try {
    const run = stepOf('plan', /node grow\/compute\.mjs plan/);
    const go = (env) => { const o = path.join(p.rt, 'out-' + Math.random().toString(36).slice(2)); fs.writeFileSync(o, ''); const r = sh(run, { cwd: p.work, env: { GITHUB_OUTPUT: fwd(o), GITHUB_TOKEN: '', GITHUB_REPOSITORY: 'o/r', WANT_MINUTES: '', WANT_RELAY: '', ...env } }); assert.equal(r.status, 0, r.stdout + r.stderr); return { o: outs(o), r }; };
    const a = go({});
    assert.equal(a.o.stopped, 'false');
    assert.equal(a.o.run, 'true');
    assert.equal(a.o.beat_minutes, String(SAFE_BEAT));
    assert.equal(a.o.shards, '1');
    assert.equal(a.o.matrix, '[0]');
    assert.match(a.o.sha, /^[0-9a-f]{40}$/);
    assert.match(a.r.stdout, /plan: \{"beatMinutes"/);
    assert.equal(readLedger(p.work).plans.length, 1, 'plan --write kept the ledger');
    fs.writeFileSync(path.join(p.work, 'neo', 'STOP'), 'x');
    const s = go({});
    assert.equal(s.o.stopped, 'true');
    assert.equal(s.o.run, 'false');
    assert.match(s.r.stdout, /stopped by neo\/STOP/);
    fs.rmSync(path.join(p.work, 'neo', 'STOP'));
    fs.rmSync(path.join(p.work, 'grow', 'compute.mjs'));
    const m = go({});
    assert.equal(m.o.run, 'true');
    assert.equal(m.o.beat_minutes, '4');
    assert.equal(m.o.shards, '1');
  } finally { rm(p.top); }
});

test('workflow plan step against a public repository: the longest relayed beat; relay=false and minutes from a dispatch are kept', async (t) => {
  if (!BASH) { t.skip('no bash on this machine'); return; }
  const server = http.createServer((req, res) => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ visibility: 'public' })); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const p = repoPair({ 'grow/compute.mjs': fs.readFileSync(SCRIPT, 'utf8') });
  try {
    const run = stepOf('plan', /node grow\/compute\.mjs plan/);
    const go = async (env) => {
      const o = path.join(p.rt, 'out-' + Math.random().toString(36).slice(2)); fs.writeFileSync(o, '');
      const f = path.join(p.top, 'plan.sh'); fs.writeFileSync(f, run);
      const e = { ...process.env, PATH: PATHV(), GITHUB_OUTPUT: fwd(o), GITHUB_TOKEN: 'ghp_' + 'P'.repeat(36), GITHUB_REPOSITORY: 'o/r', BRAIN_GITHUB_API: 'http://127.0.0.1:' + server.address().port, WANT_MINUTES: '', WANT_RELAY: '', ...env };
      const r = await new Promise((resolve) => execFile(BASH, ['--noprofile', '--norc', '-eo', 'pipefail', fwd(f)], { cwd: p.work, env: e, timeout: 120000 }, (err, stdout, stderr) => resolve({ code: err ? err.code : 0, stdout, stderr })));
      assert.equal(r.code, 0, r.stderr);
      assert.ok(!r.stdout.includes('P'.repeat(36)));
      return outs(o);
    };
    const a = await go({});
    assert.equal(a.relay, 'true');
    assert.equal(a.beat_minutes, String(PUBLIC.beatMinutes));
    const b = await go({ WANT_RELAY: 'false', WANT_MINUTES: '20' });
    assert.equal(b.relay, 'false');
    assert.equal(b.beat_minutes, '20');
  } finally { server.close(); rm(p.top); }
});

test('workflow grow step: the contract c8 command line, the stage kept even when the shard fails', (t) => {
  if (!BASH) { t.skip('no bash on this machine'); return; }
  const d = tmp();
  try {
    const work = path.join(d, 'work'), rt = path.join(d, 'rt');
    fs.mkdirSync(path.join(work, 'grow'), { recursive: true }); fs.mkdirSync(rt);
    const fake = (code) => 'import fs from "node:fs"; const a = process.argv.slice(2); fs.writeFileSync(process.env.RUNNER_TEMP + "/args.json", JSON.stringify(a));'
      + ' const s = a[a.indexOf("--stage") + 1]; fs.writeFileSync(s + "/task-a.json", "{}"); console.log(JSON.stringify({ staged: 1 })); process.exit(' + code + ');';
    const run = stepOf('grow', /node grow\/swarm\.mjs grow/);
    fs.writeFileSync(path.join(work, 'grow', 'swarm.mjs'), fake(0));
    const r = sh(run, { cwd: work, env: { RUNNER_TEMP: fwd(rt), SHARD: '1', SHARDS: '3', BEAT_MINUTES: '5', GEN: '7' } });
    assert.equal(r.status, 0, r.stderr);
    const stage = fwd(rt) + '/stage';
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(rt, 'args.json'), 'utf8')), ['grow', '--gen', '7', '--shard', '1/3', '--stage', stage, '--no-merge', '--max-ms', '300000']);
    assert.match(r.stdout, /staged: 1 files/);
    fs.writeFileSync(path.join(work, 'grow', 'swarm.mjs'), fake(1));
    const f = sh(run, { cwd: work, env: { RUNNER_TEMP: fwd(rt), SHARD: '0', SHARDS: '3', BEAT_MINUTES: '999', GEN: '0' } });
    assert.equal(f.status, 0, 'a failed shard does not fail the job: ' + f.stderr);
    assert.match(f.stdout, /shard 0 of 3 failed/);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(rt, 'args.json'), 'utf8')), ['grow', '--shard', '0/3', '--stage', stage, '--no-merge', '--max-ms', String(MAX_BEAT * 60000)]);
  } finally { rm(d); }
});

const FAKE_ERA = [
  'import fs from "node:fs";',
  'const a = process.argv.slice(2);',
  'if (a[0] === "--help") { console.log("run [--max-ms 480000] [--commit] [--staged <dir>]"); process.exit(0); }',
  'fs.appendFileSync(process.env.RUNNER_TEMP + "/era.log", JSON.stringify({ a, ledger: fs.existsSync("neo/COMPUTE.json") }) + "\\n");',
  'console.log("era noise"); console.log(JSON.stringify({ eras: 1, stop: "idle" }));',
].join('\n');

test('workflow merge step: level with the remote, the staged era once, plain eras until idle, the ledger in neo/ before each', (t) => {
  if (!BASH) { t.skip('no bash on this machine'); return; }
  const p = repoPair({ 'grow/era.mjs': FAKE_ERA, 'neo/a.json': '{}' });
  try {
    const run = stepOf('merge', /node grow\/era\.mjs run --commit --staged/);
    fs.mkdirSync(path.join(p.rt, 'stage')); fs.writeFileSync(path.join(p.rt, 'stage', 'task-a.json'), '{}');
    fs.mkdirSync(path.join(p.rt, 'compute')); fs.writeFileSync(path.join(p.rt, 'compute', 'COMPUTE.json'), '{"month":"2026-10"}');
    fs.writeFileSync(path.join(p.work, 'neo', 'junk.json'), 'untracked');
    const o = path.join(p.rt, 'out'); fs.writeFileSync(o, '');
    const r = sh(run, { cwd: p.work, env: { RUNNER_TEMP: fwd(p.rt), GITHUB_OUTPUT: fwd(o), SHARDS: '3', BEAT_MINUTES: '30', MERGE_MINUTES: '2' } });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const log = fs.readFileSync(path.join(p.rt, 'era.log'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    assert.equal(log.length, 2, JSON.stringify(log));
    assert.deepEqual(log[0].a.slice(0, 5), ['run', '--commit', '--staged', fwd(p.rt) + '/stage', '--max-eras']);
    assert.equal(log[1].a.length, 4);
    assert.deepEqual([log[1].a[0], log[1].a[1], log[1].a[3]], ['run', '--max-ms', '--commit']);
    assert.ok(Number(log[1].a[2]) > 0 && Number(log[1].a[2]) <= 480000);
    assert.deepEqual(log[0].a.slice(4, 7), ['--max-eras', '1', '--max-ms']);
    assert.ok(Number(log[0].a[7]) >= 60000, 'the staged era has at least a minute');
    assert.ok(log.every((x) => x.ledger), 'neo/COMPUTE.json is in place before every era');
    assert.ok(!fs.existsSync(path.join(p.work, 'neo', 'junk.json')), 'the clean before an era removed what the remote does not hold');
    assert.match(r.stdout, /stages: 1 files from 3 shards/);
    assert.match(r.stdout, /idle: nothing left to grow/);
    assert.match(outs(o).start, /^[0-9a-f]{40}$/);
    assert.equal(spawnSync('git', ['-C', p.work, 'config', '--local', 'user.name'], { encoding: 'utf8' }).stdout.trim(), 'brain organism');
    fs.rmSync(path.join(p.rt, 'era.log'));
    const one = sh(run, { cwd: p.work, env: { RUNNER_TEMP: fwd(p.rt), GITHUB_OUTPUT: fwd(o), SHARDS: '1', BEAT_MINUTES: '2', MERGE_MINUTES: '0' } });
    assert.equal(one.status, 0, one.stderr);
    const log1 = fs.readFileSync(path.join(p.rt, 'era.log'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    assert.equal(log1.length, 1, 'one runner: no staged era, the plain loop as before');
    assert.ok(!log1[0].a.includes('--staged'));
  } finally { rm(p.top); }
});

test('workflow site step: rebuilt and pushed when neo/ changed in the beat, nothing when it did not', (t) => {
  if (!BASH) { t.skip('no bash on this machine'); return; }
  const build = 'import fs from "node:fs"; fs.mkdirSync("web/dist", { recursive: true }); fs.writeFileSync("web/dist/data.json", fs.readFileSync("neo/a.json", "utf8"));';
  const p = repoPair({ 'web/build.mjs': build, 'neo/a.json': '{"v":1}' });
  try {
    const run = stepOf('merge', /node web\/build\.mjs/);
    const start = git(p.work, 'rev-parse', 'HEAD').stdout.trim();
    const same = sh(run, { cwd: p.work, env: { RUNNER_TEMP: fwd(p.rt), START: start } });
    assert.equal(same.status, 0, same.stderr);
    assert.match(same.stdout, /unchanged in this beat/);
    fs.writeFileSync(path.join(p.seed, 'neo', 'a.json'), '{"v":2}');
    git(p.seed, 'commit', '-qam', 'era 1'); git(p.seed, 'push', '-q', 'origin', 'master');
    const changed = sh(run, { cwd: p.work, env: { RUNNER_TEMP: fwd(p.rt), START: start } });
    assert.equal(changed.status, 0, changed.stderr);
    assert.match(changed.stdout, /site: pushed/);
    const top = git(p.top, '--git-dir', fwd(p.origin), 'log', '-1', '--format=%an|%s').stdout.trim();
    assert.equal(top, 'brain organism|site: rebuilt from the era data');
    assert.equal(git(p.top, '--git-dir', fwd(p.origin), 'show', 'master:web/dist/data.json').stdout, '{"v":2}');
  } finally { rm(p.top); }
});

test('workflow relay step: the plan\'s relay, a bounded count of beats, or nothing', (t) => {
  if (!BASH) { t.skip('no bash on this machine'); return; }
  const d = tmp();
  try {
    const bin = path.join(d, 'bin'), work = path.join(d, 'work');
    fs.mkdirSync(bin); fs.mkdirSync(work);
    const log = path.join(d, 'gh.log');
    fs.writeFileSync(path.join(bin, 'gh'), '#!/bin/sh\necho "$*" >> "' + fwd(log) + '"\n');
    fs.chmodSync(path.join(bin, 'gh'), 0o755);
    const run = stepOf('merge', /gh workflow run heartbeat\.yml/);
    const go = (env) => { fs.rmSync(log, { force: true }); const r = sh(run, { cwd: work, env: { GITHUB_REPOSITORY: 'o/r', WANT_MINUTES: '', BEATS: '1', RELAY: 'false', ...env }, extraPath: [bin] }); assert.equal(r.status, 0, r.stderr); return fs.existsSync(log) ? fs.readFileSync(log, 'utf8').trim() : ''; };
    assert.equal(go({ RELAY: 'true' }), 'workflow run heartbeat.yml -R o/r --ref master');
    assert.equal(go({ BEATS: '3', WANT_MINUTES: '20' }), 'workflow run heartbeat.yml -R o/r --ref master -f minutes=20 -f beats=2');
    assert.equal(go({ BEATS: '40' }), 'workflow run heartbeat.yml -R o/r --ref master -f beats=11');
    assert.equal(go({}), '');
    assert.equal(go({ BEATS: 'x' }), '');
  } finally { rm(d); }
});

// ---------------------------------------------------------------- the computers in the workflow, run for real in temp trees
test('workflow plan step: the computers asked reach the plan, its cost is printed before the matrix, the matrix holds them', async (t) => {
  if (!BASH) { t.skip('no bash on this machine'); return; }
  const server = http.createServer((req, res) => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ visibility: 'public' })); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const p = repoPair({ 'grow/compute.mjs': fs.readFileSync(SCRIPT, 'utf8') });
  try {
    const run = stepOf('plan', /node grow\/compute\.mjs plan/);
    const go = async (env) => {
      const o = path.join(p.rt, 'out-' + Math.random().toString(36).slice(2)); fs.writeFileSync(o, '');
      const f = path.join(p.top, 'plan.sh'); fs.writeFileSync(f, run);
      const e = { ...process.env, PATH: PATHV(), GITHUB_OUTPUT: fwd(o), GITHUB_TOKEN: 'ghp_' + 'C'.repeat(36), GITHUB_REPOSITORY: 'o/r', BRAIN_GITHUB_API: 'http://127.0.0.1:' + server.address().port, WANT_MINUTES: '', WANT_RELAY: '', WANT_COMPUTERS: '', ...env };
      const r = await new Promise((resolve) => execFile(BASH, ['--noprofile', '--norc', '-eo', 'pipefail', fwd(f)], { cwd: p.work, env: e, timeout: 120000 }, (err, stdout, stderr) => resolve({ code: err ? err.code : 0, stdout, stderr })));
      assert.equal(r.code, 0, r.stderr);
      assert.ok(!r.stdout.includes('C'.repeat(36)), 'the token is never printed');
      return { o: outs(o), stdout: r.stdout };
    };
    const a = await go({ WANT_COMPUTERS: '100' });
    assert.equal(a.o.computers, '100');
    assert.equal(a.o.shards, '100');
    assert.equal(JSON.parse(a.o.matrix).length, 100);
    const cost = costOf(100, waveMinutes(100), PUBLIC.beatMinutes);
    assert.equal(a.o.cost_minutes, String(cost));
    assert.match(a.stdout, new RegExp('cost: ' + cost + ' runner minutes for 100 computers'));
    assert.ok(a.stdout.indexOf('plan: {') < a.stdout.indexOf('cost: '), 'the line, then its cost');
    const capped = await go({ WANT_COMPUTERS: '999' });
    assert.equal(capped.o.shards, String(MAX_COMPUTERS));
    for (const junk of ['0', 'x', '-5']) {
      const j = await go({ WANT_COMPUTERS: junk });
      assert.equal(j.o.computers, '1', 'not a count: the plan decides (' + junk + ')');
    }
    assert.equal(readLedger(p.work).computersTotal, 100 + MAX_COMPUTERS + 3, 'the ledger keeps the running total');
  } finally { server.close(); rm(p.top); }
});

test('workflow grow job: each computer starts its browser beside its shard, its line is collected, the swarm is skipped when it cannot shard', (t) => {
  if (!BASH) { t.skip('no bash on this machine'); return; }
  const d = tmp();
  try {
    const work = path.join(d, 'work'), rt = path.join(d, 'rt');
    fs.mkdirSync(path.join(work, 'grow'), { recursive: true }); fs.mkdirSync(rt);
    fs.writeFileSync(path.join(work, 'grow', 'machine.mjs'), 'import fs from "node:fs"; const a = process.argv.slice(2); fs.writeFileSync(process.env.RUNNER_TEMP + "/machine-args.json", JSON.stringify(a));'
      + ' const o = a[a.indexOf("--out") + 1]; fs.mkdirSync(o + "/machines", { recursive: true }); fs.writeFileSync(o + "/machines/aaaaaaaaaaaa.json", "{}"); console.log("noise"); console.log(JSON.stringify({ step: "machine", state: "drove", screens: 2 }));');
    fs.writeFileSync(path.join(work, 'grow', 'swarm.mjs'), 'import fs from "node:fs"; fs.writeFileSync(process.env.RUNNER_TEMP + "/swarm-ran", "1"); console.log("{}");');
    const env = { RUNNER_TEMP: fwd(rt), SHARD: '4', SHARDS: '100', BEAT_MINUTES: '66', GEN: '3', GITHUB_RUN_NUMBER: '812' };
    const start = sh(stepOf('grow', /node grow\/machine\.mjs step/), { cwd: work, env });
    assert.equal(start.status, 0, start.stderr);
    assert.match(start.stdout, /machine: computer 4 of 100 started, at most 1200000 ms/);
    const grow = sh(stepOf('grow', /node grow\/swarm\.mjs grow/), { cwd: work, env: { ...env, SWARM: 'false' } });
    assert.equal(grow.status, 0, grow.stderr);
    assert.match(grow.stdout, /drives its browser only/);
    assert.ok(!fs.existsSync(path.join(rt, 'swarm-ran')), 'a tree whose swarm cannot shard spends no minutes on it');
    const line = sh(stepOf('grow', /kill -0/), { cwd: work, env });
    assert.equal(line.status, 0, line.stderr);
    assert.match(line.stdout, /\{"step":"machine","state":"drove","screens":2\}/);
    assert.match(line.stdout, /machine: 1 files for the merge/);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(rt, 'machine-args.json'), 'utf8')), ['step', '--shard', '4/100', '--out', fwd(rt) + '/machine', '--era', '812', '--max-ms', '1200000']);
    const up = WF.jobs.grow.steps.find((s) => isObjLike(s.with) && /^machine-/.test(String(s.with.name)));
    assert.equal(up.with.path, '${{ runner.temp }}/machine', 'its own artifact, never inside the stage');
    const short = sh(stepOf('grow', /node grow\/machine\.mjs step/), { cwd: work, env: { ...env, BEAT_MINUTES: '1' } });
    assert.match(short.stdout, /at most 30000 ms/, 'never under 30 seconds');
    sh(stepOf('grow', /kill -0/), { cwd: work, env });
  } finally { rm(d); }
});
const isObjLike = (o) => Boolean(o) && typeof o === 'object';

const FAKE_MACHINE = [
  'import fs from "node:fs"; import path from "node:path";',
  'const a = process.argv.slice(2);',
  'fs.appendFileSync(process.env.RUNNER_TEMP + "/machine.log", JSON.stringify(a) + "\\n");',
  'if (a[0] === "step") { const o = a[a.indexOf("--out") + 1]; fs.mkdirSync(o + "/machines", { recursive: true }); fs.writeFileSync(o + "/machines/bbbbbbbbbbbb.json", "{}"); console.log(JSON.stringify({ step: "machine", state: "drove" })); }',
  'if (a[0] === "land") { const from = a[a.indexOf("--from") + 1]; let n = 0; const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (p.endsWith(".json")) { fs.mkdirSync("neo/machines", { recursive: true }); fs.copyFileSync(p, "neo/machines/" + e.name); n++; } } }; walk(from); console.log(JSON.stringify({ land: "machine", machines: n })); }',
].join('\n');

test('workflow merge step: a one-runner beat is its own computer, every computer lands before each era, and what no era shipped is pushed', (t) => {
  if (!BASH) { t.skip('no bash on this machine'); return; }
  const p = repoPair({ 'grow/era.mjs': FAKE_ERA, 'grow/machine.mjs': FAKE_MACHINE, 'neo/a.json': '{}' });
  try {
    const run = stepOf('merge', /node grow\/era\.mjs run --commit --staged/);
    const o = path.join(p.rt, 'out'); fs.writeFileSync(o, '');
    const r = sh(run, { cwd: p.work, env: { RUNNER_TEMP: fwd(p.rt), GITHUB_OUTPUT: fwd(o), SHARDS: '1', BEAT_MINUTES: '2', MERGE_MINUTES: '0', GITHUB_RUN_NUMBER: '9' } });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const calls = fs.readFileSync(path.join(p.rt, 'machine.log'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    assert.deepEqual(calls[0], ['step', '--shard', '0/1', '--out', fwd(p.rt) + '/machine/self', '--era', '9', '--max-ms', '30000']);
    const lands = calls.filter((c) => c[0] === 'land');
    assert.ok(lands.length >= 2, 'landed after the step and again after the level before the era: ' + lands.length);
    assert.ok(lands.every((c) => c[2] === fwd(p.rt) + '/machine'));
    assert.match(r.stdout, /machine: landed and pushed/);
    const top = git(p.top, '--git-dir', fwd(p.origin), 'log', '-1', '--format=%an|%s').stdout.trim();
    assert.equal(top, "brain organism|machine: the screens and records of this beat's computers");
    assert.equal(git(p.top, '--git-dir', fwd(p.origin), 'show', 'master:neo/machines/bbbbbbbbbbbb.json').stdout, '{}');
    const era = fs.readFileSync(path.join(p.rt, 'era.log'), 'utf8').trim().split('\n');
    assert.equal(era.length, 1, 'the era loop ran as before');
    fs.rmSync(path.join(p.rt, 'machine.log'));
    const again = sh(run, { cwd: p.work, env: { RUNNER_TEMP: fwd(p.rt), GITHUB_OUTPUT: fwd(o), SHARDS: '1', BEAT_MINUTES: '2', MERGE_MINUTES: '0', GITHUB_RUN_NUMBER: '9' } });
    assert.equal(again.status, 0, again.stderr);
    assert.match(again.stdout, /machine: every landed screen is shipped/, 'landed twice, committed once');
    fs.rmSync(path.join(p.rt, 'machine'), { recursive: true });
    fs.mkdirSync(path.join(p.rt, 'machine', 'machine-1-3', 'machines'), { recursive: true });
    fs.writeFileSync(path.join(p.rt, 'machine', 'machine-1-3', 'machines', 'cccccccccccc.json'), '{}');
    fs.rmSync(path.join(p.rt, 'machine.log'));
    fs.mkdirSync(path.join(p.rt, 'stage'), { recursive: true });
    const many = sh(run, { cwd: p.work, env: { RUNNER_TEMP: fwd(p.rt), GITHUB_OUTPUT: fwd(o), SHARDS: '3', BEAT_MINUTES: '30', MERGE_MINUTES: '2' } });
    assert.equal(many.status, 0, many.stderr);
    const mc = fs.readFileSync(path.join(p.rt, 'machine.log'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    assert.ok(mc.every((c) => c[0] === 'land'), 'a matrix beat runs no step in the merge: its computers ran it');
    assert.equal(git(p.top, '--git-dir', fwd(p.origin), 'show', 'master:neo/machines/cccccccccccc.json').stdout, '{}');
  } finally { rm(p.top); }
});
