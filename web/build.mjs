// web/build.mjs: our own bundler. No dependencies, because the whole point of this
// directory is that the thing we hand to a deploy tool is small and is text we wrote.
//
// WHAT IT DOES. The sources in web/src are ES modules that only ever import from each
// other by relative path and only ever export declarations. That is a narrow enough
// dialect that bundling is a rewrite, not a compiler: drop the import lines, drop the
// `export ` keyword in front of the declarations, concatenate the files in dependency
// order, and wrap the result in one function scope. Names are kept unique by hand across
// the eight files, and the build FAILS if they are not (see collide() below), so the
// rewrite can never silently shadow one function with another.
//
// The minifier is whitespace and comments only. It walks the file character by character
// and knows what it is inside of: a single quoted string, a double quoted string, a
// template literal and its ${} holes, a line comment, a block comment, or a regular
// expression literal. It never edits anything inside a string, a template or a regex, so
// the GLSL that lives in template literals in scene.js and the digit grouping regex in
// hud.js come out the other side character for character.
//
// Run: node web/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
// The findings page is part of the site, so it is built when the site is built. It reads
// the verdict files at generation time and refuses to emit a number it did not read, which
// is why it can throw here: a build that would publish an untraceable number is a failure.
import { generate as generateFindings } from '../tools/findings.mjs';
// The portfolio page is docs/PORTFOLIO.md rendered whole at build time (his 2026-09-23 line:
// on dilation.dev, always copyable, always current). It throws if a block would be dropped.
import { generatePortfolio } from '../tools/portfolio-page.mjs';
// The ladder page is his P4 ruler rendered from bench/verdicts at build time (web/ladder.mjs).
// It throws when a digit on the page is not a traced field, so a build cannot publish one.
import { generateLadder } from './ladder.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, 'src');
const DIST = join(HERE, 'dist');

// dependency order: a file may only import from files above it
export const ORDER = ['rng.js', 'kinds.js', 'organism.js', 'engine.js', 'layout.js', 'scene.js', 'hud.js', 'main.js'];

const IMPORT = /^\s*import\s+[^;]*?from\s*['"][^'"]+['"]\s*;?\s*$/;
const BARE_IMPORT = /^\s*import\s*['"][^'"]+['"]\s*;?\s*$/;
const EXPORT_DECL = /^(\s*)export\s+(?=(?:default\s+)?(?:function|class|const|let|var|async))/;
const EXPORT_LIST = /^\s*export\s*\{[^}]*\}\s*;?\s*$/;

/** Strip the module syntax out of one source file. */
export function rewrite(src, name) {
  const out = [];
  for (const line of src.split('\n')) {
    if (IMPORT.test(line) || BARE_IMPORT.test(line) || EXPORT_LIST.test(line)) continue;
    out.push(line.replace(EXPORT_DECL, '$1'));
  }
  return '// ---- ' + name + '\n' + out.join('\n');
}

/**
 * Whitespace and comment minifier that knows where it is.
 * @param {string} s
 * @returns {string}
 */
export function minify(s) {
  let out = '';
  let i = 0;
  const n = s.length;
  // the last character emitted that is not whitespace, used to decide whether a / starts
  // a regular expression or is a division sign
  let prev = '';
  while (i < n) {
    const c = s[i], d = s[i + 1];
    // comments
    if (c === '/' && d === '/') { while (i < n && s[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { i += 2; while (i < n && !(s[i] === '*' && s[i + 1] === '/')) i++; i += 2; out += ' '; continue; }
    // strings
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n) { if (s[j] === '\\') { j += 2; continue; } if (s[j] === c) break; j++; }
      out += s.slice(i, j + 1); prev = c; i = j + 1; continue;
    }
    // A template literal is copied out verbatim, newlines and all. This bundler does not
    // support ${} holes and says so rather than guessing: every template in web/src is a
    // shader, and a shader has no holes. The check is not optional.
    if (c === '`') {
      let j = i + 1;
      while (j < n) { if (s[j] === '\\') { j += 2; continue; } if (s[j] === '`') break; j++; }
      const body = s.slice(i, j + 1);
      if (body.includes('${')) throw new Error('minify: a template literal with a ${} hole is not supported by this bundler');
      out += body; prev = '`'; i = j + 1; continue;
    }
    // a regular expression literal, never a division: decided by what came before it
    if (c === '/' && regexAllowed(prev)) {
      let j = i + 1, cls = false;
      while (j < n) {
        if (s[j] === '\\') { j += 2; continue; }
        if (s[j] === '[') cls = true;
        else if (s[j] === ']') cls = false;
        else if (s[j] === '/' && !cls) break;
        j++;
      }
      j++;
      while (j < n && /[a-z]/.test(s[j])) j++;
      out += s.slice(i, j); prev = '/'; i = j; continue;
    }
    // whitespace: a run containing a newline becomes one newline, everything else one space
    if (c === ' ' || c === '\t' || c === '\r' || c === '\n') {
      let j = i, nl = false;
      while (j < n && ' \t\r\n'.includes(s[j])) { if (s[j] === '\n') nl = true; j++; }
      if (out.length) out += nl ? '\n' : ' ';
      i = j; continue;
    }
    out += c; prev = c; i++;
  }
  // drop the space that a collapsed run left at the start or end of a line
  return out.split('\n').map(l => l.trim()).filter(l => l.length).join('\n') + '\n';
}

function regexAllowed(prev) {
  if (prev === '') return true;
  if (/[A-Za-z0-9_$)\]]/.test(prev)) return false;
  return true;
}

/**
 * Top level declaration names per file, so a collision is a build failure, not a bug.
 * Top level means column zero: an indented declaration is inside something and cannot
 * collide with anything in another file. A declaration list on one line (const a = 1,
 * b = 2) contributes every name it binds.
 */
export function topLevelNames(src) {
  const names = [];
  const re = /^(?:export\s+)?(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)(.*)$/gm;
  let m;
  while ((m = re.exec(src))) {
    names.push(m[1]);
    const more = /,\s*([A-Za-z_$][\w$]*)\s*=/g;
    let x;
    while ((x = more.exec(m[2]))) names.push(x[1]);
  }
  return names;
}

function collide(files) {
  const seen = new Map(), bad = [];
  for (const [name, src] of files) {
    for (const d of topLevelNames(src)) {
      if (seen.has(d)) bad.push(d + ' in ' + name + ' and ' + seen.get(d));
      else seen.set(d, name);
    }
  }
  return bad;
}

/**
 * Build the bundle.
 * @param {{minify?: boolean}} [opts]
 * @returns {{js: string, html: string, files: Array}}
 */
export function bundle(opts = {}) {
  const files = ORDER.map(f => [f, readFileSync(join(SRC, f), 'utf8')]);
  const bad = collide(files);
  if (bad.length) throw new Error('name collision across modules: ' + bad.join('; '));
  const body = files.map(([f, s]) => rewrite(s, f)).join('\n\n');
  const head = '// DILATION / BRAIN. Built by web/build.mjs from web/src. The organism is grown in\n'
    + '// this tab from a seed: there is no snapshot to download.\n';
  let js = head + '(function () {\n"use strict";\n' + body + '\n})();\n';
  if (opts.minify !== false) js = head + minify(js);
  const html = readFileSync(join(SRC, 'index.html'), 'utf8');
  return { js, html, files };
}

export function write(opts = {}) {
  const { js, html } = bundle(opts);
  mkdirSync(DIST, { recursive: true });
  writeFileSync(join(DIST, 'app.js'), js);
  writeFileSync(join(DIST, 'index.html'), html);
  const findings = generateFindings();
  const portfolio = generatePortfolio();
  const ladder = generateLadder();
  return {
    js: Buffer.byteLength(js), html: Buffer.byteLength(html),
    total: Buffer.byteLength(js) + Buffer.byteLength(html),
    jsPath: join(DIST, 'app.js'), htmlPath: join(DIST, 'index.html'),
    findings, portfolio, ladder,
  };
}

if (process.argv[1] && process.argv[1].endsWith('build.mjs')) {
  const r = write();
  const raw = ORDER.reduce((a, f) => a + Buffer.byteLength(readFileSync(join(SRC, f), 'utf8')), 0);
  for (const f of ORDER) console.log('src  ' + f.padEnd(14) + String(Buffer.byteLength(readFileSync(join(SRC, f), 'utf8'))).padStart(7) + ' bytes');
  console.log('src  ' + 'TOTAL'.padEnd(14) + String(raw).padStart(7) + ' bytes');
  console.log('dist index.html   ' + String(r.html).padStart(7) + ' bytes');
  console.log('dist app.js       ' + String(r.js).padStart(7) + ' bytes');
  console.log('dist TOTAL        ' + String(r.total).padStart(7) + ' bytes   target 163840, cap 225280');
  console.log('dist findings/index.html ' + String(r.findings.bytes).padStart(7) + ' bytes   '
    + r.findings.verdicts + ' verdicts, ' + r.findings.values + ' values, ' + r.findings.nulls + ' null or negative');
  console.log('dist portfolio/index.html ' + String(r.portfolio.bytes).padStart(6) + ' bytes   '
    + r.portfolio.paragraphs + ' paragraphs from docs/PORTFOLIO.md (' + r.portfolio.mdBytes + ' bytes, served as portfolio/PORTFOLIO.md); gate '
    + (r.portfolio.gateVerdict || 'none') + ' at ' + (r.portfolio.gateAt || 'none'));
  console.log('dist ladder/index.html ' + String(r.ladder.bytes).padStart(9) + ' bytes   ' + r.ladder.numbers + ' numbers traced in ' + r.ladder.spans
    + ' spans from ' + r.ladder.files + ' verdict files; ' + r.ladder.sets.map((x) => x.key + ' ' + x.status).join(', ')
    + '; native ' + r.ladder.native.status + ', years ' + r.ladder.years.status);
  const pages = ['index.html', 'findings/index.html', 'portfolio/index.html', 'ladder/index.html'];
  console.log('pages built: ' + pages.length + ' (' + pages.join(', ') + ')');
}
