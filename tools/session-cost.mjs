// tools/session-cost.mjs: what this Claude Code session has spent, from its own transcript.
//
// A cloud session has no cost card to read, and docs/CLOUD-SESSION.md forbids an estimated `usd`.
// This reads the session's transcript JSONL (and its subagents' transcripts) under
// ~/.claude/projects/<project>/, sums the usage block of every distinct API message (a message id is
// counted once however many transcript lines repeat it), and prices the tokens with the published
// per-million-token rates below. The rates are data with their source; a model not in the table is
// priced at the Opus 5.5 row and flagged as an upper bound.
//
//   node tools/session-cost.mjs [--session <id>] [--json]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// USD per million tokens. Opus 5.5: the claude-api skill, Current Models table ("$4 / $20 per MTok,
// cache reads $0.20"). Cache writes: the prompt caching rule, 1.25x input for the 5-minute cache and
// 2x input for the 1-hour cache.
export const PRICES = Object.freeze({
  'claude-opus-5-5': { input: 4, output: 20, cacheRead: 0.2, cacheWrite5m: 5, cacheWrite1h: 8, source: 'claude-api skill: Opus 5.5 $4 / $20 per MTok, cache reads $0.20; cache writes 1.25x (5m) and 2x (1h) of input' },
});

export function usageOf(files) {
  const seen = new Set();
  const by = {};
  for (const f of files) {
    let lines; try { lines = fs.readFileSync(f, 'utf8').split('\n'); } catch { continue; }
    for (const l of lines) {
      if (!l) continue;
      let e; try { e = JSON.parse(l); } catch { continue; }
      const m = e && e.message;
      if (!m || !m.usage || !m.id || seen.has(m.id)) continue;
      seen.add(m.id);
      const u = m.usage, k = m.model || 'unknown';
      const r = by[k] || (by[k] = { messages: 0, input: 0, output: 0, cacheRead: 0, cacheWrite5m: 0, cacheWrite1h: 0 });
      r.messages++;
      r.input += u.input_tokens || 0;
      r.output += u.output_tokens || 0;
      r.cacheRead += u.cache_read_input_tokens || 0;
      const cc = u.cache_creation || {};
      const w1h = cc.ephemeral_1h_input_tokens || 0, w5m = cc.ephemeral_5m_input_tokens || 0;
      const rest = (u.cache_creation_input_tokens || 0) - w1h - w5m;
      r.cacheWrite1h += w1h; r.cacheWrite5m += w5m + Math.max(0, rest);
    }
  }
  return by;
}

export function price(by) {
  let usd = 0, tokens = 0, upperBound = false;
  const rows = [];
  for (const [model, r] of Object.entries(by)) {
    const p = PRICES[model] || (upperBound = true, PRICES['claude-opus-5-5']);
    const cost = (r.input * p.input + r.output * p.output + r.cacheRead * p.cacheRead + r.cacheWrite5m * p.cacheWrite5m + r.cacheWrite1h * p.cacheWrite1h) / 1e6;
    const t = r.input + r.output + r.cacheRead + r.cacheWrite5m + r.cacheWrite1h;
    usd += cost; tokens += t;
    rows.push({ model, priced: PRICES[model] ? model : 'claude-opus-5-5 (upper bound)', ...r, tokens: t, usd: Math.round(cost * 100) / 100 });
  }
  return { usd: Math.round(usd * 100) / 100, tokens, upperBound, rows };
}

function main() {
  const argv = process.argv.slice(2);
  const i = argv.indexOf('--session');
  const dir = path.join(os.homedir(), '.claude', 'projects', process.cwd().replace(/[\\/:]/g, '-'));
  let id = i >= 0 ? argv[i + 1] : null;
  if (!id) {
    const newest = fs.readdirSync(dir).filter((f) => f.endsWith('.jsonl')).map((f) => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs })).sort((a, b) => b.t - a.t)[0];
    if (!newest) { console.log('no transcript under ' + dir); process.exit(2); }
    id = newest.f.replace(/\.jsonl$/, '');
  }
  const files = [path.join(dir, id + '.jsonl')];
  const sub = path.join(dir, id);
  if (fs.existsSync(sub)) for (const f of fs.readdirSync(sub, { recursive: true })) if (String(f).endsWith('.jsonl')) files.push(path.join(sub, String(f)));
  const r = price(usageOf(files));
  const at = new Date().toISOString();
  if (argv.includes('--json')) { console.log(JSON.stringify({ at, session: id, files: files.length, ...r })); return; }
  for (const x of r.rows) console.log(`${x.model}: ${x.messages} messages, input ${x.input}, output ${x.output}, cache read ${x.cacheRead}, cache write 5m ${x.cacheWrite5m}, 1h ${x.cacheWrite1h}: $${x.usd.toFixed(2)} priced as ${x.priced}`);
  console.log(`SESSION ${id} at ${at}: $${r.usd.toFixed(2)} for ${r.tokens} tokens over ${files.length} transcript files${r.upperBound ? ' (a model without a price row is priced at Opus 5.5: an upper bound)' : ''}`);
}

if (process.argv[1] && process.argv[1].endsWith('session-cost.mjs')) main();
