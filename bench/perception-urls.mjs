// bench/perception-urls.mjs: the allow list bench/perception.mjs runs under, held as CODE and written
// from here to bench/fixtures/perception-urls.json.
//
// Why a writer exists (board 23 item his-data, 2026-09-26): the gate's HIS DATA row asks that every
// byte under bench/fixtures be public data with its licence, or data the tree writes itself, so that
// the bytes of the owner's own hand-typed data are 0. The allow list is configuration the perception
// bench needs, not data anyone downloaded, so it lives here as code and the fixture is its output:
// `node bench/perception-urls.mjs` writes the file and prints its size, `--check` exits 1 when the
// file on disk differs from what this module renders (test/perception-urls.test.mjs asserts the same).
// The only bytes quoted from outside the repo are the six short fragments below (three page-title
// `expect` fragments and three `fact` fragments), each found in its fetched page by the 2026-09-18
// run of bench/perception.mjs (bench/verdicts/perception.json); bench/fixtures/SOURCES.md names them.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
/** Where the fixture is written: the path bench/perception.mjs reads (its FIXTURE_FILE). */
export const FIXTURE_FILE = path.join(HERE, 'fixtures', 'perception-urls.json');

/** The allow list. Three public pages that permit reading, one expected title fragment each. */
export const ALLOW = Object.freeze({
  what: 'The allow list bench/perception.mjs runs under. Three public pages that permit reading, one expected substring each. act/web.mjs ships with an EMPTY allow list, so this file is the only thing that lets that bench reach the open internet, and it reaches nothing else. Written by node bench/perception-urls.mjs; edit that file, never this one.',
  userAgent: 'brain-perception/0.1 (+https://dilation.dev) node-fetch',
  hosts: ['example.com', 'en.wikipedia.org', 'nodejs.org'],
  webPolicy: { maxBytes: 262144, timeoutMs: 8000, maxRedirects: 3, maxIngestChars: 4096 },
  control: 'what is the mass of jupiter',
  urls: [
    {
      url: 'https://example.com/',
      host: 'example.com',
      question: 'what does the example domain page say',
      expect: 'Example Domain',
      fact: 'This domain is for use in documentation examples',
      why: 'IANA reserved this name for documentation and serves one static paragraph; there is no robots rule against reading it and no session behind it',
    },
    {
      url: 'https://en.wikipedia.org/wiki/Connectome',
      host: 'en.wikipedia.org',
      question: 'what is a connectome',
      expect: 'Connectome - Wikipedia',
      fact: 'comprehensive map of neural connections',
      why: 'CC BY-SA text, robots.txt allows /wiki/ for ordinary agents, and the connectome is the subject of the organism itself',
    },
    {
      url: 'https://nodejs.org/en/about',
      host: 'nodejs.org',
      question: 'what is node js',
      expect: 'About Node.js',
      fact: 'JavaScript runtime',
      why: "the project's own public about page, MIT documentation, and the runtime this organism is made of",
    },
  ],
  expectIsNotTheUrl: 'Every expect above is a fragment of the page TITLE and appears in none of the urls, so an answer that only echoed the url back could not pass the check.',
});

/** The six fragments quoted from the pages (what bench/fixtures/SOURCES.md must name). */
export function quotedFragments() { return ALLOW.urls.flatMap((u) => [u.expect, u.fact]); }

/** The exact bytes the fixture holds. */
export function render() { return JSON.stringify(ALLOW, null, 2) + '\n'; }

/**
 * Write the fixture. Returns { file, bytes, changed } where changed says whether the bytes on disk differed.
 * @param {string} [file]
 */
export function writeFixture(file = FIXTURE_FILE) {
  const text = render();
  let before = null;
  try { before = fs.readFileSync(file, 'utf8'); } catch { /* absent */ }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  return { file, bytes: Buffer.byteLength(text), changed: before !== text };
}

/** true when the file on disk holds exactly what render() produces. */
export function fixtureMatches(file = FIXTURE_FILE) {
  try { return fs.readFileSync(file, 'utf8') === render(); } catch { return false; }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const rel = path.relative(path.resolve(HERE, '..'), FIXTURE_FILE).replaceAll('\\', '/');
  if (process.argv.includes('--check')) {
    const ok = fixtureMatches();
    console.log(rel + (ok ? ' matches bench/perception-urls.mjs' : ' DIFFERS from bench/perception-urls.mjs: run node bench/perception-urls.mjs'));
    process.exit(ok ? 0 : 1);
  }
  const r = writeFixture();
  console.log('wrote ' + rel + ' ' + r.bytes + ' bytes (' + (r.changed ? 'rewritten' : 'unchanged') + ')');
}
