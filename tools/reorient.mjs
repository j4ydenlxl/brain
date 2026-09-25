#!/usr/bin/env node
// brain/tools/reorient.mjs: SessionStart / PostCompact hook for the BRAIN project.
//
//   node brain/tools/reorient.mjs SessionStart
//   node brain/tools/reorient.mjs PostCompact
//
// WHY THIS EXISTS: the context compacts at 300k tokens and the summary dilutes the
// work. The owner's rule is that his instructions live VERBATIM in brain/MANUAL.md
// next to the objectives and progress, and that the fresh context reads them.
// A hook that prints too much is truncated to a 2 KB preview (measured on the
// previous project), so this prints in order of what must survive:
//   1. a short banner          (survives any preview)
//   2. §B objectives + progress (capped)
//   3. live state from disk     (capped)
// and ORDERS a full read of the manual. Every path exits 0.
import { readFileSync, existsSync, writeFileSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BRAIN = path.resolve(HERE, '..'); // brain/ itself: works both nested in the parent checkout and as its own clone
const MANUAL = path.join(BRAIN, 'MANUAL.md');
const STAMP = path.join(HERE, '.reorient-stamp');
const event = process.argv[2] === 'PostCompact' ? 'PostCompact' : 'SessionStart';

let source = 'startup';
try { source = JSON.parse(readFileSync(0, 'utf8') || '{}').source || source; } catch {}

const sh = (cmd) => {
  try { return execSync(cmd, { cwd: BRAIN, encoding: 'utf8', timeout: 10000, stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return ''; }
};
const emit = (text) => {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: text } }));
  process.exit(0);
};

// PostCompact and SessionStart(compact) can both fire for one compaction. Print once.
let recently = false;
try { recently = Date.now() - statSync(STAMP).mtimeMs < 90_000; } catch {}
try { writeFileSync(STAMP, String(Date.now())); } catch {}
if (recently) emit('BRAIN: the manual was printed moments ago by the other hook. Read brain/MANUAL.md in full before acting.');

const out = [];
out.push('# ⛔ BRAIN: READ brain/MANUAL.md IN FULL BEFORE ANY ACTION. HIS WORDS, NOT YOURS.');
out.push('- New project (2026-09-16). NOT the trader, NOT the browser, NOT Wick. Old data must not leak in.');
out.push('- HE authors the WHAT; I own the HOW. Never reinterpret, never shrink, never a falsification engine.');
out.push('- Cells → circuits → regions → connectome. Generations (time × amount × scale × cells). Self-improving. Own LLM. Tokens → quanta.');
out.push('- Research phase: NO subagents. Build: Opus 5.5 (claude-opus-5-5) builds and fixes, NEVER Opus 5; Sonnet 5 at most for low-level work (his 21:51); Fable 5.1 hardest only. No fleets, no Haiku.');
out.push('- P9 context economy (his 2026-09-23 order, 133M cache reads): batch tool calls, extract with node, never cat a file over 20 KB into context, history lives in brain/docs/LOG.md.');
out.push('- Never one-shot. Checkpoint. Never stop. Never quote a number a command did not print. No em-dashes in prose.');
out.push('- Update §B of MANUAL.md at every checkpoint, after re-reading §A. Fewest tokens.');
out.push('');

if (!existsSync(MANUAL)) {
  out.push('🚨 brain/MANUAL.md IS MISSING. Do not proceed on a remembered version. Say so and ask.');
  emit(out.join('\n'));
}

const manual = readFileSync(MANUAL, 'utf8');
const bIdx = manual.indexOf('## §B.');
const sectionB = bIdx >= 0 ? manual.slice(bIdx) : '';
const logIdx = sectionB.indexOf('### Progress log');
const objectives = (logIdx >= 0 ? sectionB.slice(0, logIdx) : sectionB).trim();
const progress = (logIdx >= 0 ? sectionB.slice(logIdx) : '').trim();

const cap = (s, n, fromEnd) => {
  if (s.length <= n) return s;
  return fromEnd ? '…(older lines cut)\n' + s.slice(-n) : s.slice(0, n) + '\n…(cut)';
};
const stIdx = sectionB.indexOf('### STATE');
const state = stIdx >= 0 ? sectionB.slice(stIdx).trim() : '';
out.push(`## STATE of brain/MANUAL.md as of ${new Date().toISOString()} (${event}, source=${source}); HIS ORDERS first, then KILLED ideas, then the orchestrator's ASSUMPTIONS each with its test`);
out.push(cap(state, 9000, false));
out.push('');
out.push('## §B objectives (head)');
out.push(cap(stIdx >= 0 ? objectives.slice(0, stIdx) : objectives, 1500, false));
out.push('');
const LOG = path.join(BRAIN, 'docs', 'LOG.md');
let tail = progress;
try { const ll = readFileSync(LOG, 'utf8').split(String.fromCharCode(10)).filter(l => l.startsWith('- ')); tail = '### Last 3 lines of docs/LOG.md (' + ll.length + ' lines in all)' + String.fromCharCode(10) + ll.slice(-3).join(String.fromCharCode(10)); } catch {}
out.push(cap(tail, 1400, true));
out.push('');

out.push('## Live state read from disk (trust over any summary)');
const branch = sh('git rev-parse --abbrev-ref HEAD');
const dirty = sh('git status --short').split('\n').filter(Boolean).length;
const head = sh('git log --oneline -1');
out.push(`- branch ${branch || '?'}, HEAD ${head || '?'}, ${dirty} uncommitted path(s) in brain's own repository`);
const procs = sh(`powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name='node.exe'\\" | Where-Object { $_.CommandLine -match 'brain' -and $_.CommandLine -notmatch 'reorient' } | ForEach-Object { $_.ProcessId.ToString() + ' ' + $_.CommandLine }"`);
if (procs) {
  out.push('- live brain processes (do not kill, do not relaunch a duplicate):');
  for (const line of procs.split('\n').slice(0, 8)) out.push('    ' + line.trim().slice(0, 160));
} else {
  out.push('- no brain/ node processes running');
}
out.push('');
out.push("FIRST ACTION: read brain/MANUAL.md in full (about 80 KB: §A his words verbatim with every orchestrator gloss labelled ORCHESTRATOR'S READING; §B objectives + STATE). STATE separates HIS ORDERS (clock order) from the ideas he KILLED and from the orchestrator's ASSUMPTIONS, each with the test that decides it: test them, never inherit them. Then continue from STATE. Do not read docs/LOG.md in full.");

emit(out.join('\n'));
