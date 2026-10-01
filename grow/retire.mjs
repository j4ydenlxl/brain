#!/usr/bin/env node
// grow/retire.mjs: a prompt the locked judge NAMES as held-out is never shown to an arm again.
//
// Generation 3 (2026-10-01T13:13Z, the heartbeat alone): 0 of 36 survived. 19 died on the judge's leak rule, and the
// organism could not see it coming: one of its own dreams ("dream-2-code-4") happened to be a held-out prompt of the
// class, so every cell that carried the dream as an example was "grown on held-out rows", and the class text of the
// brief quoted prompts that are held-out rows too. Nothing in grow/ may open judge/heldout/, so nothing in grow/ could
// know. But the judge SAYS which prompt it was, in the verdict's own `why` line. This module reads those lines (never
// the held-out set), and retires what they name: a miss, a dream or a curriculum row with that prompt is no longer
// planned, a brief no longer quotes it, and the NEO engine no longer spawns from it.
//
// The ledger, grow/retired.jsonl, is append only and holds NO prompt text: a row is the sha256 of the prompt's key
// (judge/judge.mjs qKey, a little wider: keyOf below), the ids of the rows it retired, and where the judge said it.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { qKey } from '../judge/judge.mjs';

export const RETIRED = 'grow/retired.jsonl';
export const SOURCES = Object.freeze(['grow/dreams.jsonl', 'grow/curriculum.jsonl', 'grow/seed-misses.jsonl']);
/** The two reasons of judge/select.mjs that name held-out prompts (its `list`: "a", "b"). */
export const NAMING = Object.freeze([/^the cell's files quote held-out prompts: (.+)$/, /^the cell was grown on held-out rows: (.+)$/]);
export const PLACEHOLDER = '(an example withheld)';
const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** The judge's own key (trimmed, lower case), then a little wider: inner spaces collapsed, closing punctuation dropped,
 *  so the same prompt with a question mark is retired with it (wider than the judge is the safe side for a held-out row). */
export const keyOf = (prompt) => qKey(String(prompt ?? '')).replace(/\s+/g, ' ').replace(/[\s?!.]+$/, '');
export const shaOf = (prompt) => crypto.createHash('sha256').update(keyOf(prompt)).digest('hex');

/** The prompts a verdict's `why` lines name as held-out. */
export function namedPrompts(why) {
  const out = [];
  for (const line of Array.isArray(why) ? why : []) {
    for (const re of NAMING) {
      const m = re.exec(String(line));
      if (!m) continue;
      const body = m[1].trim();
      if (!(body.startsWith('"') && body.endsWith('"'))) continue;
      for (const p of body.slice(1, -1).split('", "')) if (p.trim() && !out.includes(p)) out.push(p);
    }
  }
  return out;
}

const readLines = (file) => { try { return fs.readFileSync(file, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean); } catch { return []; } };
const parse = (l) => { try { return JSON.parse(l); } catch { return null; } };

/** The ledger: { shas: Set, ids: Set, rows }. A missing file is an empty ledger. */
export function readRetired(root = DEFAULT_ROOT) {
  const rows = readLines(path.join(root, RETIRED)).map(parse).filter((r) => r && typeof r.sha === 'string');
  return { shas: new Set(rows.map((r) => r.sha)), ids: new Set(rows.flatMap((r) => (Array.isArray(r.ids) ? r.ids : []))), rows };
}

export const isRetired = (retired, prompt) => !!retired && retired.shas.has(shaOf(prompt));

/** Rows (a miss, a dream, a dev row: `prompt` or `q`) without the retired ones. */
export const keepLive = (retired, rows) => rows.filter((r) => !(r && isRetired(retired, r.prompt ?? r.q)));

/** A text with every quoted span ('', "" or ``, as the judge reads a quote) that is a retired prompt replaced. */
export function scrub(text, retired) {
  if (!retired || !retired.shas.size) return String(text);
  let out = String(text);
  for (const c of ['"', '`', "'"]) {
    const re = new RegExp(c + '([^' + c + '\\n]{4,300})' + c, 'g');
    out = out.replace(re, (all, inner) => (retired.shas.has(shaOf(inner)) ? c + PLACEHOLDER + c : all));
  }
  return out;
}

/** Appends the prompts not yet retired; returns the rows added. Never writes a prompt's text. */
export function retire(root, prompts, { generation = null, where = 'the judge', at = new Date().toISOString() } = {}) {
  const have = readRetired(root);
  const added = [];
  const sources = SOURCES.map((rel) => ({ rel, rows: readLines(path.join(root, rel)).map(parse).filter(Boolean) }));
  for (const p of prompts) {
    const sha = shaOf(p);
    if (have.shas.has(sha) || added.some((r) => r.sha === sha)) continue;
    const ids = [], from = [];
    for (const s of sources) for (const r of s.rows) if (shaOf(r.prompt ?? r.q) === sha && r.id !== null && r.id !== undefined) { ids.push(r.id); if (!from.includes(s.rel)) from.push(s.rel); }
    added.push({ sha, ids, from, where, generation, at });
  }
  if (added.length) {
    const file = path.join(root, RETIRED);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.appendFileSync(file, added.map((r) => JSON.stringify(r) + '\n').join(''));
  }
  return added;
}

/** Every verdict.json of a generation's candidates: work/grow/gen-<n>/<lane>/<id>/verdict.json. */
export function verdictsOf(root, n) {
  const dir = path.join(root, 'work', 'grow', 'gen-' + n);
  const out = [];
  let lanes = [];
  try { lanes = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name); } catch { return out; }
  for (const lane of lanes) {
    let ids = [];
    try { ids = fs.readdirSync(path.join(dir, lane), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name); } catch { continue; }
    for (const id of ids) {
      const v = parse((() => { try { return fs.readFileSync(path.join(dir, lane, id, 'verdict.json'), 'utf8'); } catch { return ''; } })());
      if (v) out.push({ lane, id, verdict: v });
    }
  }
  return out;
}

/** collect: what the judge named in generation n is retired. */
export function collect(root, n, { at } = {}) {
  const vs = verdictsOf(root, n);
  const named = [];
  for (const { verdict } of vs) for (const p of namedPrompts(verdict.why)) if (!named.includes(p)) named.push(p);
  const added = retire(root, named, { generation: n, where: 'verdicts of generation ' + n, at });
  return { generation: n, verdicts: vs.length, named: named.length, retired: added.length, ids: added.flatMap((r) => r.ids), total: readRetired(root).rows.length };
}

/** --commit: the ledger alone, as jayden with the cortex trailer, then the push (a cloud checkout dies with its session:
 *  an unpushed retirement is forgotten, and the next generation grows the same dead cells). */
export async function ship(root, n, added, noPush = false) {
  if (!added) return { committed: 'nothing to commit', pushed: 'skipped: nothing committed' };
  const { TRAILER, pushHead, redact } = await import('./generation.mjs');
  const git = (args) => spawnSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 120000 });
  const line = (r) => redact(String((r.stderr || r.stdout || '')).split(/\r?\n/).map((l) => l.trim()).filter(Boolean).pop() || (r.error ? String(r.error.code || r.error.message) : 'exit ' + r.status));
  const add = git(['add', '--', RETIRED]);
  if (add.status !== 0) return { committed: false, pushed: 'skipped: nothing committed', blocked: 'commit: git add exited ' + add.status + ': ' + line(add) };
  if (git(['diff', '--cached', '--quiet', '--', RETIRED]).status === 0) return { committed: 'nothing to commit', pushed: 'skipped: nothing committed' };
  const email = String(git(['config', 'user.email']).stdout || '').trim() || 'j4ydenlxl@users.noreply.github.com';
  const cm = git(['-c', 'user.name=jayden', '-c', 'user.email=' + email, 'commit', '-m', 'gen ' + n + ': retired ' + added + ' prompt' + (added === 1 ? '' : 's') + ' the judge named as held-out', '-m', TRAILER, '--', RETIRED]);
  if (cm.status !== 0) return { committed: false, pushed: 'skipped: nothing committed', blocked: 'commit: git commit exited ' + cm.status + ': ' + line(cm) };
  if (noPush) return { committed: true, pushed: 'skipped (--no-push)' };
  const ps = pushHead(root);
  return ps.ok ? { committed: true, pushed: true } : { committed: true, pushed: false, blocked: 'push: ' + ps.why + ' (the commit stays)' };
}

const USAGE = [
  'usage: node grow/retire.mjs <verb> [--root <dir>]',
  '  collect --gen <n> [--commit [--no-push]]   retire every prompt the verdicts of generation n name as held-out;',
  '                               --commit: commit grow/retired.jsonl as jayden and push it',
  '  add --prompt "<q>" --where "<who named it, when>" [--gen <n>]',
  '  status                       the ledger: rows, ids',
].join('\n');

export async function main(argv, io = {}) {
  const out = io.out || ((s) => process.stdout.write(s + '\n'));
  const flags = {};
  const rest = [];
  const BOOL = new Set(['commit', 'no-push']);
  for (let i = 0; i < argv.length; i++) { const a = argv[i]; if (a.startsWith('--')) flags[a.slice(2)] = !BOOL.has(a.slice(2)) && argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[++i] : true; else rest.push(a); }
  const root = flags.root ? path.resolve(String(flags.root)) : DEFAULT_ROOT;
  const verb = rest[0];
  if (verb === 'collect') {
    const n = Number(flags.gen);
    if (!Number.isInteger(n) || n < 1) { out(USAGE); return 2; }
    const got = collect(root, n);
    if (flags.commit) Object.assign(got, await ship(root, n, got.retired, Boolean(flags['no-push'])));
    out(JSON.stringify(got));
    return 0;
  }
  if (verb === 'add') {
    if (typeof flags.prompt !== 'string' || typeof flags.where !== 'string') { out(USAGE); return 2; }
    const added = retire(root, [flags.prompt], { generation: Number.isInteger(Number(flags.gen)) ? Number(flags.gen) : null, where: flags.where });
    out(JSON.stringify({ retired: added.length, ids: added.flatMap((r) => r.ids), total: readRetired(root).rows.length }));
    return 0;
  }
  if (verb === 'status') {
    const r = readRetired(root);
    out(JSON.stringify({ rows: r.rows.length, ids: [...r.ids] }));
    return 0;
  }
  out(USAGE);
  return 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = await main(process.argv.slice(2));
