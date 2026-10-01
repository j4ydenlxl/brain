// act/reach.mjs: REACH, the hold over the internet on the answering side (grow/NEO.md, "Order 7: always burning",
// subsection REACH). His words, 2026-10-01: "It literally should have an octopus hold over the internet and pull up
// anything". When the organism misses on dilation.dev, act/ask-http.mjs asks this file to pull the answer up from the
// open internet; the reply says where it came from, and the miss is still logged so a cell grows for it.
//
// reach(prompt, { fetch, timeoutMs = 4000, now }) -> { text, source: { title, url }, from: 'reach', ms } or null.
// null is nothing found, a timeout or a refusal: never a guess, never a throw. No model is called anywhere ("All native
// btw, its ai data center in ur pocket, none of that ollama crap"). reachWhy() is the same call with the reason.
//
// THE SOURCES, in order:
//   a definition question ("define X", "what does X mean", "meaning of X", "X definition"): the Free Dictionary API
//     first, https://api.dictionaryapi.dev/api/v2/entries/en/<word>, under DICT_SHARE (half) of the deadline, then
//     Wikipedia with the word in what is left (a dictionary that hangs does not sink the lookup);
//   every other lookup: the English Wikipedia search API, https://en.wikipedia.org/w/rest.php/v1/search/page?q=..&limit=3,
//     then the page summary, https://en.wikipedia.org/api/rest_v1/page/summary/<key>, of the first result that is about
//     the query (RELEVANT below) and is not a disambiguation page.
// THE WALL: ALLOWED_HOSTS is those two hosts and nothing else, https on the default port with no credentials in the
// URL, checked on the parsed URL before fetch is called; redirects are never followed (redirect: 'manual'): a 3xx, a
// response marked redirected, or a response URL on another host is no hit. ONE deadline (timeoutMs) bounds the whole
// reach and is raced, so a fetch that ignores its abort signal still ends it. A body over MAX_BODY_BYTES is no hit,
// and a streamed body is cancelled at that cap, never read whole.
// THE TEXT: the extract's first whole sentences, at most MAX_TEXT (600) characters, plain text on one line, then the
// line `Source: <title>, <url>` last. Page bytes are DATA: parsed as JSON and nothing else, never evaluated, imported
// or followed as an instruction; HTML tags, entities, control characters and invisible format characters (zero width,
// bidi, the U+E0000 tag characters) are stripped and credential shapes scrubbed with act/prompt.mjs scrubSecrets, in
// the title too. The Wikipedia url is built here from the result's key, never copied from a page; a result whose key
// or title is over 255 characters or whose key carries a credential shape is passed over; a dictionary answer names
// the API url it came from.
// NOT REACHED FOR (reachable() says why, and no socket opens): a prompt under 3 letters or over MAX_PROMPT characters,
// one carrying a credential shape (it never leaves the host), code, markup or a url, a turn act/converse.mjs answers,
// a build request (grow/app-slug.mjs buildRequest), arithmetic (in digits or in number words: "seven times eight"),
// a request to compose or compute ("write a poem",
// "solve", "translate": a lookup is not a composition), a keyboard mash (grow/misses.mjs mashShape and isCommon, the
// organism's own rule), and a prompt left with no word once question and stop words are dropped.
// RELEVANT: a search result is taken only when every query word is on it (title, redirect title, description or
// excerpt), or its title is made of query words and holds more than half of them, or two thirds of the query words are
// on it and one is in its title; otherwise the next result, and after SEARCH_LIMIT results, null.
//
// The judged organism (judge/baseline.mjs runOrganism through act/prompt.mjs ask) never imports this file: reach
// lives in the HTTP handler only, so a baseline never depends on the network.
//
// CLI (one JSON line; exit 0 on a hit and on a miss, 2 on usage):
//   node act/reach.mjs ask "<prompt>" [--timeout-ms 4000]   { prompt, hit, text, source, ms, why, calls }
//   node act/reach.mjs check "<prompt>"                      { prompt, ok, why, query, define } (no socket)
// Author: Opus 5.5 builder (REACH) for the Fable 5.1 orchestrator, 2026-10-01.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scrubSecrets } from './prompt.mjs';
import { converse } from './converse.mjs';
import { buildRequest } from '../grow/app-slug.mjs';
import { mashShape, isCommon } from '../grow/misses.mjs';

export const ALLOWED_HOSTS = Object.freeze(['en.wikipedia.org', 'api.dictionaryapi.dev']);
/** The origins the egress guard of act/ask-http.mjs gains when reach is on. */
export const REACH_ORIGINS = Object.freeze(ALLOWED_HOSTS.map((h) => 'https://' + h));
/** The environment switch, read by NAME: reach is on unless it is exactly "0". */
export const REACH_NAME = 'BRAIN_REACH';
export const TIMEOUT_MS = 4000;
export const MAX_TEXT = 600;
export const MAX_PROMPT = 200;
export const MAX_QUERY_WORDS = 8;
export const MAX_BODY_BYTES = 2_000_000;
export const SEARCH_LIMIT = 3;
/** Wikipedia's own limit on a page title; a longer key or title in a search result is not a Wikipedia page. */
export const MAX_TITLE = 255;
/** The share of the deadline a definition question gives the dictionary before Wikipedia is asked. */
export const DICT_SHARE = 0.5;
/** setTimeout's largest delay: a longer one fires at once, so a timeoutMs over it is this. */
const MAX_TIMER_MS = 2_147_483_647;
export const USER_AGENT = 'DilationBrain/1.0 (https://dilation.dev; act/reach.mjs)';
export const WIKI_SEARCH = 'https://en.wikipedia.org/w/rest.php/v1/search/page';
export const WIKI_SUMMARY = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
export const WIKI_PAGE = 'https://en.wikipedia.org/wiki/';
export const DICT_ENTRIES = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
export const DICT_TITLE = 'Free Dictionary API (Wiktionary data)';

/** True unless the environment holds BRAIN_REACH exactly "0". */
export const reachEnabled = (env = process.env) => String((env && env[REACH_NAME]) ?? '') !== '0';

// ---------------------------------------------------------------- the words of a prompt
/** Question words, stop words and request fillers: dropped from a query (a search wants the subject). */
export const DROP = new Set(('who whom whose what whats when where which why how is are was were am be been being do does did done '
  + 'can could would should will shall may might must have has had get got a an the of in on at to for by with from and or as '
  + 'into onto than then if so not no yes it its that this these those there here i me my mine you your yours we us our they '
  + 'them their he him his she her tell about please explain describe know give show find search look up information info '
  + 'facts fact some something anything wikipedia called named define definition meaning mean means word term ok okay hey '
  + 'hi hello thanks thank really actually exactly just also very much many kind sort type').split(' '));

/** The words of a text: lower case letters and digits, apostrophes and hyphens inside a word, a possessive 's dropped. */
export function wordsOf(s) {
  return String(s ?? '').toLowerCase().replace(/[‘’ʼ]/g, "'").replace(/'s\b/g, '')
    .replace(/[^\p{L}\p{N}'\- ]+/gu, ' ').split(/\s+/).map((w) => w.replace(/^['-]+|['-]+$/g, '')).filter(Boolean);
}
/** The query words of a prompt: its words less DROP, at most MAX_QUERY_WORDS, in order, each once. */
export function queryWords(s) {
  const out = [];
  for (const w of wordsOf(s)) if (!DROP.has(w) && !out.includes(w)) out.push(w);
  return out.slice(0, MAX_QUERY_WORDS);
}

const DEFINE_RES = Object.freeze([
  /^(?:please\s+)?define\s+(?:the\s+(?:word|term)\s+)?(.+)$/,
  /^(?:what\s+is\s+|what's\s+|whats\s+|give\s+me\s+)?(?:the\s+|a\s+)?(?:definition|meaning)\s+of\s+(?:the\s+(?:word|term)\s+)?(.+)$/,
  /^what\s+(?:does|do|did)\s+(?:the\s+(?:word|term)\s+)?(.+?)\s+mean$/,
  /^(.+?)\s+(?:definition|meaning)$/,
]);
const TERM_RE = /^\p{L}[\p{L}'-]*(?: \p{L}[\p{L}'-]*){0,2}$/u;
/** The term of a definition question ("define X", "what does X mean"), 1 to 3 words, or null. */
export function definitionTerm(prompt) {
  const t = String(prompt ?? '').trim().toLowerCase().replace(/[‘’]/g, "'").replace(/["“”]/g, '')
    .replace(/[?.!]+$/, '').replace(/\s+/g, ' ').trim();
  for (const re of DEFINE_RES) {
    const m = re.exec(t);
    if (!m) continue;
    const term = m[1].replace(/^['-]+|['-]+$/g, '').trim();
    return TERM_RE.test(term) && !DROP.has(term) ? term : null;
  }
  return null;
}

const ARITH_WORDS = new Set(('plus minus times multiplied divided by over x squared cubed sqrt square root roots cube of percent '
  + 'mod modulo power to the and sum product difference quotient half double twice triple equals equal is are what whats '
  + 'calculate compute evaluate add subtract multiply divide from with into a an how much many remainder factorial log ln '
  + 'sin cos tan exp raised pi e than less more greater prime even odd divisible').split(' '));
/** Numbers spelled as words ("seven times eight"). */
export const NUMBER_WORDS = new Set(('zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen '
  + 'sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million billion').split(' '));
/** The words that make spelled numbers a sum to work out, not a name ("one direction", "seven samurai"). */
const OP_WORDS = new Set(('plus minus times multiplied divided over squared cubed sqrt root percent mod modulo power sum product '
  + 'difference quotient remainder factorial raised add subtract multiply divide').split(' '));
/**
 * Arithmetic: a digit, and an operator between numbers or nothing but numbers and arithmetic words; or numbers spelled
 * as words with an operator word and nothing but arithmetic words ("what is seven times eight").
 */
export function isArithmetic(prompt) {
  const t = String(prompt ?? '').toLowerCase();
  const ws = t.replace(/[^a-z0-9.\s]/g, ' ').split(/\s+/).filter(Boolean);
  if (!/\d/.test(t)) {
    return ws.some((w) => NUMBER_WORDS.has(w)) && ws.some((w) => OP_WORDS.has(w)) && ws.every((w) => NUMBER_WORDS.has(w) || ARITH_WORDS.has(w));
  }
  if (/\d\s*(?:\*\*|[-+*/^%×÷])\s*[\d(.]/.test(t)) return true;
  return ws.every((w) => /^\d+(?:\.\d+)?$/.test(w) || NUMBER_WORDS.has(w) || ARITH_WORDS.has(w));
}

/** A request to compose or compute: it OPENS with the verb (after "please", "can you", "i need", ...). */
export const COMPOSE_RE = new RegExp('^(?:(?:please|pls|hey|ok|okay|now)[\\s,]+)?'
  + '(?:(?:can|could|would|will) you\\s+(?:please\\s+)?|i (?:want|need) you to\\s+|i need\\s+|i want\\s+|help me\\s+|let\'?s\\s+|go ahead and\\s+)?'
  + '(?:(?:write|compose|draft|generate|create|implement|develop|translate|summari[sz]e|rewrite|paraphrase|rephrase|solve|'
  + 'calculate|compute|evaluate|simplify|prove|debug|refactor|optimi[sz]e|imagine|pretend|act as|role ?play|brainstorm|proofread)\\b'
  // a verb that is also a noun ("count dracula", "design patterns") composes only with an object after it
  + '|(?:make|build|code|program|design|count|sort|plan|play|draw|sing|factor|format|correct|edit|outline|reverse|convert|fix)'
  + '\\s+(?:me|us|a|an|the|this|that|these|those|my|our|it|them|some|all|every|each|\\d))', 'i');
/** A piece of writing asked for anywhere in the prompt ("give me a haiku about rain"). */
export const CREATIVE_RE = /\b(?:poem|haiku|limerick|sonnet|essay|story|joke|riddle|lyrics|song|rap|slogan|tagline|toast|speech|caption)s?\b/i;
export const CREATIVE_VERB_RE = /\b(?:write|compose|draft|tell|give|make|create|generate|come up with)\b/i;
/** Code, markup or a url: never a lookup, and never sent. */
export const CODE_RE = /https?:\/\/|\bwww\.|[{};<>`=|\\$]|=>|\(\)/i;

const no = (why) => ({ ok: false, why, query: null, define: null, words: [] });
/**
 * Whether reach may look the prompt up, and why not; no socket, no clock.
 * @param {string} prompt
 * @returns {{ ok: boolean, why: string, query: string|null, define: string|null, words: string[] }}
 */
export function reachable(prompt) {
  if (typeof prompt !== 'string') return no('the prompt is not text');
  const p = prompt.trim();
  if ((p.match(/\p{L}/gu) || []).length < 3) return no('under 3 letters');
  if (p.length > MAX_PROMPT) return no('over ' + MAX_PROMPT + ' characters: a lookup is short');
  if (scrubSecrets(p).redacted > 0) return no('it carries a credential shape, which never leaves the host');
  if (CODE_RE.test(p)) return no('code, markup or a url');
  if (converse(p)) return no('a conversation turn act/converse.mjs answers');
  if (buildRequest(p)) return no('a build request (grow/app-slug.mjs)');
  if (isArithmetic(p)) return no('arithmetic (the exact tier answers it)');
  if (COMPOSE_RE.test(p) || (CREATIVE_RE.test(p) && CREATIVE_VERB_RE.test(p))) return no('a request to compose or compute, not a lookup');
  const define = definitionTerm(p);
  const words = queryWords(define || p);
  if (!words.length) return no('no word to look up once question and stop words are dropped');
  if (words.every((w) => mashShape(w) && !isCommon(w))) return no('a keyboard mash (grow/misses.mjs mashShape)');
  return { ok: true, why: define ? 'a definition question' : 'a lookup', query: words.join(' '), define, words };
}

// ---------------------------------------------------------------- page bytes are data: plain text only
const ENTITIES = Object.freeze({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '-', mdash: ', ', hellip: '...' });
function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]{1,6}|#\d{1,7}|[a-z]{2,8});/gi, (m, e) => {
    if (e[0] !== '#') return Object.prototype.hasOwnProperty.call(ENTITIES, e.toLowerCase()) ? ENTITIES[e.toLowerCase()] : ' ';
    const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
    return Number.isInteger(n) && n > 0 && n <= 0x10ffff && !(n >= 0xd800 && n <= 0xdfff) ? String.fromCodePoint(n) : ' ';
  });
}
const TAG_RE = /<[^>]*>/g;
/** Control characters and line or paragraph separators: a space. */
const CONTROL_RE = /[\p{Cc}\p{Zl}\p{Zp}]/gu;
/**
 * Invisible format characters (zero width, bidi marks and overrides, the soft hyphen, and the tag characters of
 * U+E0000 to U+E007F that can spell a hidden instruction) and lone surrogates: removed.
 */
const FORMAT_RE = /[\p{Cf}\p{Cs}]/gu;
/**
 * Plain text out of page bytes: tags stripped (before and after entities are decoded, then any angle bracket left),
 * control, zero width, bidi and tag characters removed, credential shapes scrubbed, space collapsed, one line.
 * @param {*} s
 * @returns {string}
 */
export function clean(s) {
  let t = typeof s === 'string' ? s : '';
  t = decodeEntities(t.replace(TAG_RE, ' ')).replace(TAG_RE, ' ').replace(/[<>]/g, ' ');
  t = t.replace(CONTROL_RE, ' ').replace(FORMAT_RE, '');
  t = scrubSecrets(t).text;
  return t.replace(/\s+/g, ' ').trim();
}

/** The first whole sentences of a plain text, at most max characters; a first sentence longer than that is cut at a word. */
export function firstSentences(s, max = MAX_TEXT) {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const parts = t.split(/(?<=[.!?]["')\]]?)\s+(?=[\p{Lu}\p{N}"'(])/u);
  let out = '';
  for (const p of parts) {
    const next = out ? out + ' ' + p : p;
    if (next.length > max) break;
    out = next;
  }
  if (out) return out;
  const cut = t.slice(0, max - 3);
  const at = cut.lastIndexOf(' ');
  return (at > 0 ? cut.slice(0, at) : cut).replace(/[\s,;:]+$/, '') + '...';
}

/** The last line of a reached text. */
export const sourceLine = (title, url) => 'Source: ' + title + ', ' + url;

// ---------------------------------------------------------------- the wall
/** True only for https on the default port, a host of ALLOWED_HOSTS, and no user or password in the URL. */
export function allowedUrl(u) {
  let x;
  try { x = u instanceof URL ? u : new URL(String(u)); } catch { return false; }
  return x.protocol === 'https:' && ALLOWED_HOSTS.includes(x.hostname) && x.port === '' && !x.username && !x.password;
}
const hostOf = (u) => { try { return new URL(String(u)).host || String(u).slice(0, 80); } catch { return String(u).slice(0, 80); } };

/**
 * GET one JSON document from an allowed host. Never throws: { ok: true, json } or { ok: false, why }.
 * The host is checked BEFORE fetch is called; a redirect is never followed; the body is parsed as JSON only.
 * @param {string} url
 * @param {{ fetch?: Function, signal?: AbortSignal, calls?: string[] }} [ctx]
 */
export async function fetchJson(url, ctx = {}) {
  if (!allowedUrl(url)) return { ok: false, why: 'refused: ' + hostOf(url) + ' is not on the reach allowlist (' + ALLOWED_HOSTS.join(', ') + ')' };
  const f = typeof ctx.fetch === 'function' ? ctx.fetch : globalThis.fetch;
  if (Array.isArray(ctx.calls)) ctx.calls.push(url);
  let res;
  try {
    res = await f(url, { method: 'GET', redirect: 'manual', signal: ctx.signal, headers: { accept: 'application/json', 'user-agent': USER_AGENT, 'api-user-agent': USER_AGENT } });
  } catch (e) {
    return { ok: false, why: 'the fetch failed (' + String((e && e.code) || (e && e.cause && e.cause.code) || (e && e.name) || 'error') + ')' };
  }
  if (!res || typeof res.status !== 'number') return { ok: false, why: 'no response' };
  if ((res.status >= 300 && res.status < 400) || res.type === 'opaqueredirect') return { ok: false, why: 'a redirect (' + res.status + '), not followed' };
  if (res.redirected) return { ok: false, why: 'the response was redirected, not followed' };
  if (res.url && !allowedUrl(res.url)) return { ok: false, why: 'the response came from ' + hostOf(res.url) + ', not an allowed host' };
  if (res.status !== 200) return { ok: false, why: 'answered ' + res.status };
  const len = Number(res.headers && typeof res.headers.get === 'function' ? res.headers.get('content-length') : NaN);
  if (Number.isFinite(len) && len > MAX_BODY_BYTES) return { ok: false, why: 'the body is over ' + MAX_BODY_BYTES + ' bytes' };
  let text;
  try { text = await readCapped(res, MAX_BODY_BYTES); } catch (e) { return { ok: false, why: 'the body could not be read (' + String((e && e.name) || 'error') + ')' }; }
  if (typeof text !== 'string') return { ok: false, why: 'the body is over ' + MAX_BODY_BYTES + ' bytes' };
  try { return { ok: true, json: JSON.parse(text) }; } catch { return { ok: false, why: 'the body is not JSON' }; }
}

/**
 * The body as text, or null past max bytes. A stream is read chunk by chunk and cancelled at the cap, so a body
 * with no content-length (or a false one) is never held whole in memory.
 */
async function readCapped(res, max) {
  const b = res.body;
  if (b && typeof b.getReader === 'function') {
    const reader = b.getReader();
    const chunks = [];
    let n = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      const bytes = value instanceof Uint8Array ? value : new TextEncoder().encode(String(value ?? ''));
      n += bytes.byteLength;
      if (n > max) { reader.cancel().catch(() => {}); return null; }
      chunks.push(bytes);
    }
    const all = new Uint8Array(n);
    let at = 0;
    for (const c of chunks) { all.set(c, at); at += c.byteLength; }
    return new TextDecoder('utf-8').decode(all);
  }
  const t = typeof res.text === 'function' ? await res.text() : null;
  return typeof t === 'string' && Buffer.byteLength(t) <= max ? t : null;
}

// ---------------------------------------------------------------- relevance: never a guess
/** Two words are one when equal, or when one opens the other and they differ by at most 3 letters ("end", "ended"). */
const same = (a, b) => a === b || (Math.min(a.length, b.length) >= 3 && Math.abs(a.length - b.length) <= 3 && (a.startsWith(b) || b.startsWith(a)));
const holds = (list, w) => list.some((x) => same(x, w));
/**
 * Is a search result about the query? (RELEVANT in the header.)
 * @param {string[]} q the query words
 * @param {{ title?: string, matched_title?: string, description?: string, excerpt?: string }} page
 */
export function relevant(q, page) {
  if (!Array.isArray(q) || !q.length || !page || typeof page.title !== 'string') return false;
  const title = wordsOf(clean(page.title).replace(/\([^)]*\)/g, ' ')).filter((w) => !DROP.has(w));
  const named = [...title, ...wordsOf(clean(page.matched_title))];
  const hay = [...named, ...wordsOf(clean(page.description)), ...wordsOf(clean(page.excerpt))];
  const onPage = q.filter((w) => holds(hay, w)).length;
  const inTitle = q.filter((w) => holds(named, w)).length;
  if (onPage === q.length) return true;
  if (title.length && title.every((t) => holds(q, t)) && inTitle * 2 > q.length) return true;
  return onPage * 3 >= q.length * 2 && inTitle >= 1;
}

// ---------------------------------------------------------------- the two sources
async function wikipedia(words, ctx) {
  const s = await fetchJson(WIKI_SEARCH + '?q=' + encodeURIComponent(words.join(' ')) + '&limit=' + SEARCH_LIMIT, ctx);
  if (!s.ok) return { hit: null, why: 'wikipedia search: ' + s.why };
  const pages = s.json && Array.isArray(s.json.pages) ? s.json.pages.slice(0, SEARCH_LIMIT) : [];
  if (!pages.length) return { hit: null, why: 'wikipedia search: no page' };
  const notes = [];
  for (const p of pages) {
    if (!p || typeof p.key !== 'string' || !p.key || typeof p.title !== 'string') { notes.push('a result with no key'); continue; }
    // the key becomes the Source url and the title its name: a Wikipedia title is at most 255 characters, and a key
    // with a credential shape would carry it into the reply (the url is built here, never scrubbed into a broken link)
    if (p.key.length > MAX_TITLE || p.title.length > MAX_TITLE) { notes.push('a result whose title is over ' + MAX_TITLE + ' characters'); continue; }
    if (scrubSecrets(p.key).redacted > 0) { notes.push('a result whose key carries a credential shape'); continue; }
    if (!relevant(words, p)) { notes.push('"' + clean(p.title).slice(0, 60) + '" is not about the query'); continue; }
    const r = await fetchJson(WIKI_SUMMARY + encodeURIComponent(p.key), ctx);
    if (!r.ok) { notes.push('summary: ' + r.why); continue; }
    const j = r.json;
    if (!j || typeof j !== 'object') { notes.push('summary: not an object'); continue; }
    if (j.type === 'disambiguation') { notes.push('"' + clean(p.title).slice(0, 60) + '" is a disambiguation page'); continue; }
    const body = firstSentences(clean(j.extract));
    if (!body) { notes.push('summary: no extract'); continue; }
    const title = clean(p.title) || clean(p.key.replace(/_/g, ' '));
    const url = WIKI_PAGE + encodeURIComponent(p.key.replace(/ /g, '_'));
    return { hit: { text: body + '\n' + sourceLine(title, url), source: { title, url } }, why: 'wikipedia: ' + title };
  }
  return { hit: null, why: 'wikipedia: ' + notes.join('; ') };
}

async function dictionary(term, ctx) {
  const url = DICT_ENTRIES + encodeURIComponent(term);
  const r = await fetchJson(url, ctx);
  if (!r.ok) return { hit: null, why: 'dictionary: ' + r.why };
  const e = Array.isArray(r.json) ? r.json.find((x) => x && typeof x.word === 'string' && x.word.trim().toLowerCase() === term) : null;
  if (!e || !Array.isArray(e.meanings)) return { hit: null, why: 'dictionary: no entry for "' + term + '"' };
  const word = clean(e.word);
  const parts = [];
  for (const m of e.meanings.slice(0, 3)) {
    const d = m && Array.isArray(m.definitions) ? m.definitions.find((x) => x && typeof x.definition === 'string' && x.definition.trim()) : null;
    if (!d) continue;
    let def = clean(d.definition);
    if (!def) continue;
    if (!/[.!?]$/.test(def)) def += '.';
    const pos = clean(m.partOfSpeech);
    parts.push(word + (pos ? ' (' + pos + ')' : '') + ': ' + def);
  }
  let body = '';
  for (const p of parts) { const next = body ? body + ' ' + p : p; if (next.length > MAX_TEXT) break; body = next; }
  if (!body && parts.length) body = firstSentences(parts[0]);
  if (!body) return { hit: null, why: 'dictionary: the entry has no definition' };
  return { hit: { text: body + '\n' + sourceLine(DICT_TITLE, url), source: { title: DICT_TITLE, url } }, why: 'dictionary: ' + word };
}

/**
 * run(ctx) under its own deadline of ms, inside the reach's: its signal aborts at ms or when the reach's does. A late
 * run is { hit: null, why: late }, so a slow source leaves the rest of the deadline to the next one.
 */
async function within(ms, ctx, late, run) {
  const ac = new AbortController();
  const stop = () => ac.abort();
  if (ctx.signal) { if (ctx.signal.aborted) ac.abort(); else ctx.signal.addEventListener('abort', stop, { once: true }); }
  let timer = null;
  const deadline = new Promise((resolve) => { timer = setTimeout(() => { ac.abort(); resolve({ hit: null, why: late }); }, ms); });
  try {
    return await Promise.race([run({ ...ctx, signal: ac.signal }), deadline]);
  } finally {
    clearTimeout(timer);
    if (ctx.signal) ctx.signal.removeEventListener('abort', stop);
  }
}

async function lookup(gate, ctx) {
  const whys = [];
  if (gate.define) {
    // the dictionary has DICT_SHARE of the deadline: a dictionary that does not answer leaves Wikipedia the rest
    const share = Math.max(1, Math.floor(ctx.timeoutMs * DICT_SHARE));
    const d = await within(share, ctx, 'dictionary: no answer in ' + share + ' ms', (c) => dictionary(gate.define, c));
    if (d.hit) return d;
    whys.push(d.why);
  }
  const w = await wikipedia(gate.words, ctx);
  if (w.hit) return w;
  whys.push(w.why);
  return { hit: null, why: whys.join(' | ') };
}

// ---------------------------------------------------------------- reach
/**
 * reach with its reason: { hit, why, calls, ms }. hit is what reach() returns. Never throws.
 * @param {string} prompt
 * @param {{ fetch?: Function, timeoutMs?: number, now?: () => number }} [o]
 */
export async function reachWhy(prompt, options = {}) {
  // hostile options never throw: null is no options, and a clock that throws reads as no clock (ms 0)
  const o = options && typeof options === 'object' ? options : {};
  const now = typeof o.now === 'function' ? o.now : () => performance.now();
  const read = () => { try { return Number(now()); } catch { return NaN; } };
  const t0 = read();
  const ms = () => { const d = Math.round(read() - t0); return Number.isFinite(d) && d > 0 ? d : 0; };
  const calls = [];
  let gate;
  try { gate = reachable(prompt); } catch { gate = no('the prompt could not be read'); }
  if (!gate.ok) return { hit: null, why: 'not reached: ' + gate.why, calls, ms: ms() };
  const timeoutMs = Number.isFinite(o.timeoutMs) && o.timeoutMs > 0 ? Math.min(o.timeoutMs, MAX_TIMER_MS) : TIMEOUT_MS;
  const ac = new AbortController();
  const ctx = { fetch: typeof o.fetch === 'function' ? o.fetch : globalThis.fetch, signal: ac.signal, calls, timeoutMs };
  let timer = null;
  const deadline = new Promise((resolve) => {
    timer = setTimeout(() => { ac.abort(); resolve({ hit: null, why: 'no answer in ' + timeoutMs + ' ms' }); }, timeoutMs);
  });
  let out;
  try {
    out = await Promise.race([lookup(gate, ctx).catch((e) => ({ hit: null, why: 'the lookup failed (' + String((e && e.name) || 'error') + ')' })), deadline]);
  } catch (e) {
    out = { hit: null, why: 'the lookup failed (' + String((e && e.name) || 'error') + ')' };
  } finally {
    clearTimeout(timer);
    ac.abort();
  }
  const took = ms();
  if (!out || !out.hit) return { hit: null, why: (out && out.why) || 'nothing found', calls, ms: took };
  return { hit: { text: out.hit.text, source: { title: out.hit.source.title, url: out.hit.source.url }, from: 'reach', ms: took }, why: out.why, calls, ms: took };
}

/**
 * Pull the answer to a prompt up from the open internet (the header says from where and how).
 * @param {string} prompt
 * @param {{ fetch?: Function, timeoutMs?: number, now?: () => number }} [o]
 * @returns {Promise<{ text: string, source: { title: string, url: string }, from: 'reach', ms: number } | null>}
 */
export async function reach(prompt, o = {}) {
  try { return (await reachWhy(prompt, o)).hit; } catch { return null; }
}

// ---------------------------------------------------------------- CLI
const USAGE = 'usage: node act/reach.mjs ask "<prompt>" [--timeout-ms 4000] | check "<prompt>"';
async function main(argv) {
  const args = [];
  let timeoutMs = TIMEOUT_MS;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--timeout-ms') { timeoutMs = Number(argv[++i]); continue; }
    if (argv[i] === '--root') { i++; continue; } // no file is read or written: accepted for the verbs' common shape
    args.push(argv[i]);
  }
  const [verb, ...rest] = args;
  const prompt = rest.join(' ');
  if (!['ask', 'check'].includes(verb) || !prompt.trim() || !(Number.isFinite(timeoutMs) && timeoutMs > 0)) {
    process.stderr.write(USAGE + '\n');
    return 2;
  }
  if (verb === 'check') {
    const g = reachable(prompt);
    process.stdout.write(JSON.stringify({ prompt, ok: g.ok, why: g.why, query: g.query, define: g.define }) + '\n');
    return 0;
  }
  const r = await reachWhy(prompt, { timeoutMs });
  process.stdout.write(JSON.stringify({ prompt, hit: Boolean(r.hit), text: r.hit ? r.hit.text : null, source: r.hit ? r.hit.source : null, ms: r.ms, why: r.why, calls: r.calls.length }) + '\n');
  return 0;
}
const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (e) => { process.stderr.write('reach: ' + String((e && e.message) || e).split('\n')[0] + '\n'); process.exitCode = 1; });
