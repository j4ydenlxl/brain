// web/spawn-census.mjs: THE CENSUS ON THE SITE, READ FROM ITS VERDICT, NEVER TYPED. Author: board 20
// builder (queue item 5, the CLOUD part). web/build.mjs calls injectCensus() on the landing page:
// the census block (cells, edges, kinds, kept per hour, the placebo, the verdict's at and its file
// name) is read from bench/verdicts/spawn-census.json (bench/spawn.mjs --census N writes it) and
// placed in the page as one JSON script element; web/src/hud.js censusRows() prints it in the
// status block under the cell count. When the bar file is absent the partial is read and marked
// partial; when neither exists the block says "not measured", with no number.
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CENSUS_FILES = Object.freeze(['bench/verdicts/spawn-census.json', 'bench/verdicts/spawn-census-partial.json']);
export const CENSUS_FIELDS = Object.freeze(['cells', 'edges', 'kinds', 'kept', 'keptPerHour', 'placeboKept', 'placeboKeptPerHour', 'rounds', 'barMet', 'isTheBar', 'at']);
export const CENSUS_ELEMENT_ID = 'census-data';

/** The block from one verdict object: its fields copied, never computed, plus the file it came from. */
export function censusBlock(v, file) {
  if (!v || typeof v !== 'object') return null;
  const out = { file };
  for (const k of CENSUS_FIELDS) out[k] = v[k] === undefined ? null : v[k];
  return out;
}

/** The block from the tree: the bar file, else the partial, else null. */
export function readCensusBlock(root = ROOT) {
  for (const rel of CENSUS_FILES) {
    const f = path.join(root, rel);
    if (!existsSync(f)) continue;
    try { return censusBlock(JSON.parse(readFileSync(f, 'utf8')), rel); } catch { return null; }
  }
  return null;
}

/** The page with the block as one JSON element before </body> (the JSON is escaped for a script element). */
export function injectCensus(html, block) {
  const json = JSON.stringify(block ?? null).replace(/</g, '\\u003c');
  const tag = '<script type="application/json" id="' + CENSUS_ELEMENT_ID + '">' + json + '</script>\n';
  const i = html.lastIndexOf('</body>');
  return i < 0 ? html + tag : html.slice(0, i) + tag + html.slice(i);
}
