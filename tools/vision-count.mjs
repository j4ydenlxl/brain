// tools/vision-count.mjs: THE VISION COUNTER (docs/VISION.md item 9; his 2026-09-26 20:20 EDT: "I wouldnt
// declare the project EVER over until the vision is 100 percent fulfilled").
//
// docs/VISION.md section 3 lists every order he gave as a numbered plan whose line ends with a status
// word: MET (a verdict file with barMet true), PARTIAL (a printed number under the bar), OPEN (no bar
// run yet) or FROZEN (his own later order stopped it). This tool READS the list and PRINTS the count;
// section 4 of the document retypes what this tool printed, and test/vision-count.test.mjs asserts the
// two agree, so the typed count can never drift from the list (the unprotected-document-numbers defect).
//
// Usage: node tools/vision-count.mjs [--json]      prints the counts; --json also writes
//        bench/verdicts/vision-count.json (isTheBar true, barMet true only when every order is MET).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const STATUS_WORDS = Object.freeze(['MET', 'PARTIAL', 'OPEN', 'FROZEN']);

/**
 * Parse section 3 of the vision document.
 * @param {string} md the document text
 * @returns {{items: Array<{n: number, status: string, statusText: string, head: string}>, counts: object, total: number, unstated: number[]}}
 */
export function countVision(md) {
  const lines = String(md).split('\n');
  let inList = false;
  const items = [];
  for (const line of lines) {
    if (/^## 3\./.test(line)) { inList = true; continue; }
    if (/^## 4\./.test(line)) break;
    if (!inList) continue;
    const m = line.match(/^(\d+)\. (.*)$/);
    if (!m) continue;
    const n = Number(m[1]);
    const sm = m[2].match(/Status: (.*)$/);
    const statusText = sm ? sm[1].trim() : '';
    const wm = statusText.match(/\b(MET|PARTIAL|OPEN|FROZEN)\b/);
    const status = wm ? wm[1] : 'UNSTATED';
    items.push({ n, status, statusText: statusText.slice(0, 160), head: m[2].slice(0, 80) });
  }
  const counts = Object.fromEntries(STATUS_WORDS.map(w => [w, 0]));
  counts.UNSTATED = 0;
  for (const it of items) counts[it.status]++;
  return { items, counts, total: items.length, unstated: items.filter(i => i.status === 'UNSTATED').map(i => i.n) };
}

/** The one line section 4 must carry, built from the counts (never typed). */
export function countLine(c) {
  return `${c.total} orders listed. MET: ${c.counts.MET}. PARTIAL: ${c.counts.PARTIAL}. OPEN: ${c.counts.OPEN}. FROZEN: ${c.counts.FROZEN}.` + (c.counts.UNSTATED ? ` UNSTATED: ${c.counts.UNSTATED} (${c.unstated.join(', ')}).` : '');
}

/** The count line section 4 currently types, or null. */
export function typedLine(md) {
  const m = String(md).match(/^## 4\.[\s\S]*?^(\d+ orders listed\. MET: \d+\. PARTIAL: \d+\. OPEN: \d+\. FROZEN: \d+\.(?: UNSTATED: \d+ \([^)]*\)\.)?)/m);
  return m ? m[1] : null;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = path.join(ROOT, 'docs', 'VISION.md');
  const md = fs.readFileSync(file, 'utf8');
  const c = countVision(md);
  const line = countLine(c);
  console.log('VISION ' + line);
  for (const it of c.items) console.log('  ' + String(it.n).padStart(2) + ' ' + it.status.padEnd(8) + ' ' + it.head);
  const typed = typedLine(md);
  console.log('section 4 types: ' + (typed || '(no count line)') + (typed === line ? '  (agrees)' : '  (DISAGREES: retype section 4 from the VISION line above)'));
  if (process.argv.includes('--json')) {
    const out = path.join(ROOT, 'bench', 'verdicts', 'vision-count.json');
    const verdict = {
      at: new Date().toISOString(), command: 'node tools/vision-count.mjs --json', node: process.version, isTheBar: true,
      barMet: c.total > 0 && c.counts.MET === c.total,
      total: c.total, counts: c.counts, unstated: c.unstated, line, typedAgrees: typed === line,
      // the document this count was made from, by its bytes: web/build.mjs says on dilation.dev whether the page's count
      // is of the document as it stands at build time (board 24b, item web-vision)
      source: 'docs/VISION.md', sourceBytes: Buffer.byteLength(md), sourceSha256: createHash('sha256').update(md).digest('hex'),
      split: { development: 'docs/VISION.md section 3 (his orders, read from MANUAL.md section A)', heldOut: 'none', why: 'a count of orders and their status words has no held-out data; the bar is every order MET', contaminated: false },
      statement: 'docs/VISION.md lists ' + c.total + ' of his orders as plans. ' + line + ' The project is over when every order is MET and not before (his 2026-09-26 20:20 EDT order); barMet is ' + (c.counts.MET === c.total) + '.',
    };
    fs.writeFileSync(out, JSON.stringify(verdict, null, 2) + '\n');
    console.log('wrote ' + path.relative(ROOT, out) + ' barMet ' + verdict.barMet);
  }
}
