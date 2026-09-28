// act/code-native.mjs: CODE WITHOUT A MODEL. Board 34 builder, item code-native (his 2026-09-28 order: "superior
// coding skills ... doing everything natively eliminating the need of vibe coding"; docs/VISION.md orders 38 and 42).
//
// On 2026-09-28 the census (bench/verdicts/conceive.json) printed that the organism refused every code, code-reading,
// sql, command and format prompt when the model was off: every line of code it wrote was the model's. This file is the
// organism writing those answers itself, from readers it owns, with no model, no socket and no network.
//
// codeNative(text) returns { text, answer, provenance: 'native', route: 'code-native', method, steps, kind, ns } or
// null. Four readers, tried in this order, none of them a model:
//
//   (a) THE SPEC READER (kind code). The prompt is parsed into a language (JavaScript or Python), a function name, a
//       signature when one is written, the examples it states, and the operation asked. The operation is matched to
//       CATALOGUE: canonical operations written here in JavaScript and Python, each with its own examples. A match is
//       taken only when the prompt is READ COMPLETELY: after the operation's phrase, its qualifiers (ignoring case,
//       keeping order, of any depth ...) and the stated examples are removed, every word left must be a function word
//       (FILLER). A word the reader does not understand ("positive" before "numbers" in a sum, "leading" before
//       "whitespace") is a refusal, never a guess. When the prompt states examples, the emitted function is RUN
//       against them in act/run.mjs before it is answered, and a candidate that fails one is never answered. A Python
//       answer is the catalogue's Python twin; the examples run on its JavaScript twin (no Python runs here).
//   (b) EXAMPLE SYNTHESIS. When the prompt states two or more examples and says nothing else, compositions of the
//       PRIMITIVES up to depth 3 are enumerated bottom up, pruned by observational equivalence (two programs that give
//       the same outputs on the examples and on fixed probe inputs are one program; Udupa et al. 2013, the EUSolver
//       line). The primitives are this file's own code, evaluated in process; the survivor is RUN in act/run.mjs
//       against the examples before it is answered. Two different behaviours that both fit the examples at the
//       smallest depth is an ambiguity, and an ambiguity is a refusal. Wall clock 500 ms.
//   (c) THE SQL, COMMAND AND FORMAT READERS. A spec reader for the shapes a person asks: SELECT columns FROM a table
//       with one WHERE condition, COUNT, ORDER BY, LIMIT, UPDATE and DELETE; the common shell, git and npm verbs;
//       JSON objects, dates, thousands separators, markdown lists and tables, case conversion, number words.
//   (d) CODE READING. "What does this JavaScript print / evaluate to / return": the snippet is RUN in act/run.mjs's
//       sandbox and its value read back. Python and every other language are refused.
//
// A refusal is a gap; a wrong answer is a defect. Everything here refuses what it cannot read to the last word.
import { runCases, sameValue } from './run.mjs';

export const ROUTE = 'code-native';
export const LIMITS = Object.freeze({ text: 4000, code: 2000, examples: 12, synthMs: 500, runMs: 1000, readMs: 500, synthEvals: 400000 });

const IDENT_RE = /^[A-Za-z_$][\w$]*$/;
const RESERVED = new Set(('break case catch class const continue debugger default delete do else enum export extends false finally for function if '
  + 'import in instanceof new null return super switch this throw true try typeof var void while with yield let static await async '
  + 'def lambda pass raise not and or is elif except from global nonlocal assert print none').split(' '));

// ================================================================ literals
// A small literal parser for what a prompt states: numbers, strings in either quote, booleans, null (and Python's
// True, False, None), arrays and flat objects. Nothing the prompt writes is ever executed to read a value.
function skipWs(s, i) { while (i < s.length && /\s/.test(s[i])) i++; return i; }
export function parseValue(s, i0 = 0) {
  const src = String(s ?? '');
  let i = skipWs(src, i0);
  const c = src[i];
  if (c === '"' || c === "'" || c === '‘' || c === '“') {
    const close = c === '‘' ? '’' : c === '“' ? '”' : c;
    let out = '';
    i++;
    while (i < src.length && src[i] !== close) {
      if (src[i] === '\\' && i + 1 < src.length) {
        const e = src[i + 1];
        out += e === 'n' ? '\n' : e === 't' ? '\t' : e === 'r' ? '\r' : e;
        i += 2;
        continue;
      }
      out += src[i++];
    }
    if (src[i] !== close) return { ok: false };
    return { ok: true, value: out, end: i + 1 };
  }
  if (c === '[') {
    const arr = [];
    i = skipWs(src, i + 1);
    if (src[i] === ']') return { ok: true, value: arr, end: i + 1 };
    for (;;) {
      const v = parseValue(src, i);
      if (!v.ok) return { ok: false };
      arr.push(v.value);
      i = skipWs(src, v.end);
      if (src[i] === ',') { i = skipWs(src, i + 1); if (src[i] === ']') return { ok: true, value: arr, end: i + 1 }; continue; }
      if (src[i] === ']') return { ok: true, value: arr, end: i + 1 };
      return { ok: false };
    }
  }
  if (c === '{') {
    const obj = {};
    i = skipWs(src, i + 1);
    if (src[i] === '}') return { ok: true, value: obj, end: i + 1 };
    for (;;) {
      let key;
      const q = src[i];
      if (q === '"' || q === "'") { const k = parseValue(src, i); if (!k.ok) return { ok: false }; key = k.value; i = k.end; }
      else { const m = /^[A-Za-z_$][\w$]*/.exec(src.slice(i)); if (!m) return { ok: false }; key = m[0]; i += m[0].length; }
      i = skipWs(src, i);
      if (src[i] !== ':') return { ok: false };
      const v = parseValue(src, i + 1);
      if (!v.ok) return { ok: false };
      obj[key] = v.value;
      i = skipWs(src, v.end);
      if (src[i] === ',') { i = skipWs(src, i + 1); continue; }
      if (src[i] === '}') return { ok: true, value: obj, end: i + 1 };
      return { ok: false };
    }
  }
  const num = /^-?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?/.exec(src.slice(i));
  if (num) {
    const after = src[i + num[0].length];
    if (after !== undefined && /[A-Za-z_$]/.test(after)) return { ok: false };
    return { ok: true, value: Number(num[0]), end: i + num[0].length };
  }
  const word = /^(true|false|null|True|False|None)(?![\w$])/.exec(src.slice(i));
  if (word) {
    const w = word[1];
    return { ok: true, value: w === 'true' || w === 'True' ? true : w === 'false' || w === 'False' ? false : null, end: i + w.length };
  }
  return { ok: false };
}

/** The literal list inside the parentheses that open at `open`; { ok, args, end } with end just past ')'. */
function parseCallArgs(s, open) {
  const args = [];
  let i = skipWs(s, open + 1);
  if (s[i] === ')') return { ok: true, args, end: i + 1 };
  for (;;) {
    const v = parseValue(s, i);
    if (!v.ok) return { ok: false };
    args.push(v.value);
    i = skipWs(s, v.end);
    if (s[i] === ',') { i = skipWs(s, i + 1); continue; }
    if (s[i] === ')') return { ok: true, args, end: i + 1 };
    return { ok: false };
  }
}

/** A JavaScript source literal for a JSON value (strings in single quotes, as a person writes them). */
export function jsLiteral(v) {
  if (v === null) return 'null';
  if (typeof v === 'string') return "'" + v.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return '[' + v.map(jsLiteral).join(', ') + ']';
  if (typeof v === 'object') return '{ ' + Object.keys(v).map((k) => (IDENT_RE.test(k) ? k : jsLiteral(k)) + ': ' + jsLiteral(v[k])).join(', ') + ' }';
  return 'undefined';
}

// ================================================================ the words a complete read may leave
// FILLER: function words and the words every code request carries. A semantic word (not, only, positive, first, each,
// sorted, even, distinct ...) is NOT here, so a prompt that uses one the reader did not consume is refused.
export const FILLER = new Set((
  'a an the this that these those it its itself which who whose what and of in on to for from with by as at into onto is are be been being was were '
  + 'has have having do does write writes written create creates implement implements make makes code define defines build builds give gives '
  + 'giving me i we you need want please can could would should will must shall let function functions method methods program routine helper '
  + 'procedure snippet script javascript js node nodejs ecmascript python def given take takes taking accept accepts accepting receive receives '
  + 'receiving input inputs argument arguments arg args parameter parameters param params return returns returning returned output outputs '
  + 'produce produces producing compute computes computing calculate calculates calculating find finds get gets yield yields back value values '
  + 'result results answer named called name new copy number numbers integer integers int ints numeric string strings str text array arrays list '
  + 'lists element elements item items entry entries character characters char chars letter letters nonempty so such where like then also just '
  + 'simply tells tell check checks checking determine determines test tests decide decides report reports verify verifies convert converts '
  + 'converting converted conversion turn turns transform transforms one single here following using use uses via provided passed supplied all '
  + 'together them they their any some version complete completes finish'
).split(/\s+/));
/** Extra function words for a predicate (an operation whose answer is true or false). */
export const PRED_FILLER = new Set('true false boolean bool whether if when otherwise or'.split(' '));
const PRED_EVIDENCE = /\b(?:true|false|whether|boolean|bool|checks?|checking|determines?|tells?|tests?|verif(?:y|ies)|decides?)\b/;
const STRW = /\b(?:string|strings|str|text|texts|words?|sentences?|characters?|chars?|letters?)\b/;
const ARRW = /\b(?:array|arrays|list|lists|elements?|items?|matrix|matrices|tuples?)\b/;

// ================================================================ the catalogue
// Each entry: id, arity, in (a type per parameter: 'str', 'num', 'arr', 'any'), out, params (default names), re (the
// operation's phrase: at least one match is required), quals ([flag, re] pairs: optional phrases the reader consumes
// and the emitter honours), roles (per parameter, an optional cue regex whose group captures the parameter's name in
// the prompt), needs (a regex the prompt must also match), dom (a scalar number operation: "positive integer" reads),
// js (body lines from the role names and flags), py (the same in Python), ex (the entry's own examples; the test file
// runs every one of them through act/run.mjs).
const ART = '(?:(?:a|an|the|its|param) )?';
const SLOT = '(?:param|it|the (?:string|text|word|sentence|array|list|number|integer|input)|an? (?:string|array|list|number|integer))';
const R = (src) => new RegExp(src.replace(/ART/g, ART).replace(/SLOT/g, SLOT));
const CASE_Q = R('\\b(?:in either case|of either case|in any case|(?:both )?upper(?: ?case)? (?:or|and) lower ?case|(?:both )?lower(?: ?case)? (?:or|and) upper ?case|case[ -]?insensitive(?:ly)?|ignoring (?:letter )?case|regardless of (?:letter )?case|uppercase or lowercase|lowercase or uppercase)\\b');
const IGNORE_Q = /\b(?:ignoring|ignore|ignores|disregarding|regardless of|not counting|skipping|without regard to) ((?:(?:letter )?case|capitali[sz]ation|spaces|whitespace|white space|punctuation|non ?alphanumeric characters)(?:(?: and|,| or|, and) (?:(?:letter )?case|capitali[sz]ation|spaces|whitespace|white space|punctuation|non ?alphanumeric characters))*)\b|\bcase[ -]?insensitive(?:ly)?\b/;
const I = (id, s) => s; // readability marker for identifiers inside templates
void I;

function E(id, o) { return Object.freeze({ id, arity: o.in.length, quals: [], roles: [], ...o }); }
const S = 'str', N = 'num', A = 'arr', ANY = 'any';

export const CATALOGUE = Object.freeze([
  // ---------------------------------------------------------------- strings
  E('reverse-string', { in: [S], out: S, params: ['s'],
    re: R('\\b(?:(?:returns? )?(?:it|param|the string) )?(?:reversed|reverses|reversing|reverse(?: of)?|backwards|in reverse(?: order)?)\\b'),
    js: ([s]) => [`return Array.from(${s}).reverse().join('');`], py: ([s]) => [`return ${s}[::-1]`],
    ex: [[['abc'], 'cba'], [[''], ''], [['ab c'], 'c ba']] }),
  E('reverse-array', { in: [A], out: A, params: ['arr'],
    re: R('\\b(?:(?:returns? )?(?:it|param|the array|the list) )?(?:reversed|reverses|reversing|reverse(?: of)?|backwards|in reverse(?: order)?)\\b'),
    js: ([a]) => [`return ${a}.slice().reverse();`], py: ([a]) => [`return ${a}[::-1]`],
    ex: [[[[1, 2, 3]], [3, 2, 1]], [[[]], []]] }),
  E('palindrome', { in: [S], out: 'bool', params: ['s'],
    re: R('\\b(?:is )?(?:an? )?palindromes?\\b|\\breads? the same (?:forwards? and backwards?|backwards? and forwards?|in both directions|both ways|from (?:either|both) (?:end|ends|side|sides|direction|directions))\\b|\\b(?:is )?the same (?:forwards? and backwards?|backwards? and forwards?|when reversed|reversed)\\b|\\b(?:equals?|is equal to) its(?:elf)? reversed?\\b'),
    quals: [['ignore', IGNORE_Q]],
    js: ([s], q) => [`let _t = String(${s});`, ...(q.icase ? ['_t = _t.toLowerCase();'] : []), ...(q.nonalnum ? ["_t = _t.replace(/[^A-Za-z0-9]/g, '');"] : []),
      ...(q.punct ? ["_t = _t.replace(/[^A-Za-z0-9\\s]/g, '');"] : []), ...(q.spaces ? ["_t = _t.replace(/\\s+/g, '');"] : []), "return _t === Array.from(_t).reverse().join('');"],
    py: ([s], q) => [`_t = ${s}`, ...(q.icase ? ['_t = _t.lower()'] : []), ...(q.nonalnum ? ["_t = ''.join(_c for _c in _t if _c.isascii() and _c.isalnum())"] : []),
      ...(q.punct ? ["_t = ''.join(_c for _c in _t if (_c.isascii() and _c.isalnum()) or _c.isspace())"] : []), ...(q.spaces ? ["_t = ''.join(_t.split())"] : []), 'return _t == _t[::-1]'],
    ex: [[['level'], true], [['hello'], false], [[''], true]] }),
  E('count-vowels', { in: [S], out: N, params: ['s'],
    re: R('\\b(?:how many|the number of|number of|count(?:s|ing)?(?: of)?(?: the)?(?: number of)?|total (?:number|count) of) vowels?(?: a e i o u)?(?: (?:there )?(?:are|appear|occur)?(?: in ' + 'SLOT' + ')?)?\\b'),
    quals: [['case', CASE_Q]],
    js: ([s]) => ['let _c = 0;', `for (const _ch of String(${s}).toLowerCase()) if ('aeiou'.includes(_ch)) _c++;`, 'return _c;'],
    py: ([s]) => [`return sum(1 for _ch in ${s}.lower() if _ch in 'aeiou')`],
    ex: [[['banana'], 3], [['SKY'], 0], [['AEiou'], 5]] }),
  E('count-consonants', { in: [S], out: N, params: ['s'],
    re: R('\\b(?:how many|the number of|number of|count(?:s|ing)?(?: of)?(?: the)?(?: number of)?) consonants?(?: (?:there )?(?:are|appear|occur)?(?: in ' + 'SLOT' + ')?)?\\b'),
    quals: [['case', CASE_Q]],
    js: ([s]) => ['let _c = 0;', `for (const _ch of String(${s}).toLowerCase()) if (_ch >= 'a' && _ch <= 'z' && !'aeiou'.includes(_ch)) _c++;`, 'return _c;'],
    py: ([s]) => [`return sum(1 for _ch in ${s}.lower() if 'a' <= _ch <= 'z' and _ch not in 'aeiou')`],
    ex: [[['banana'], 3], [['AEI'], 0], [['xyz!'], 3]] }),
  E('remove-vowels', { in: [S], out: S, params: ['s'],
    re: R('\\b(?:(?:with )?(?:all |every )?(?:the )?vowels? (?:removed|stripped|deleted|taken out|dropped)|(?:removes?|removing|strips?|stripping|deletes?|deleting|drops?|dropping|without)(?: all| every)?(?: the)? vowels?(?: removed)?(?: from ' + 'SLOT' + ')?)\\b'),
    quals: [['case', CASE_Q]],
    js: ([s]) => [`return String(${s}).replace(/[aeiou]/gi, '');`], py: ([s]) => [`return ''.join(_ch for _ch in ${s} if _ch.lower() not in 'aeiou')`],
    ex: [[['banana'], 'bnn'], [['AEIOUxyz'], 'xyz'], [[''], '']] }),
  E('capitalize-first', { in: [S], out: S, params: ['s'],
    re: R('\\b(?:(?:param |it )?with )?(?:its |the )?first (?:letter|character|char)(?: of ' + 'SLOT' + ')? (?:in upper ?case|in uppercase|in capitals?|upper ?cased|uppercased|capitali[sz]ed|made upper ?case|converted to upper ?case|as a capital(?: letter)?)\\b|\\b(?:capitali[sz]es?|capitali[sz]ing|upper ?cases?|uppercases|uppercasing) (?:the |its )?first (?:letter|character|char)(?: of ' + 'SLOT' + ')?\\b'),
    quals: [['lowerRest', /\b(?:and )?(?:the )?rest (?:of (?:the )?(?:string|letters|it) )?(?:in lower ?case|lower ?cased|lowercased|made lower ?case)\b/], ['keepRest', /\b(?:and )?(?:the )?rest (?:of (?:the )?(?:string|letters|it) )?(?:unchanged|as is|left alone|untouched)\b/]],
    js: ([s], q) => [`return ${s}.length ? ${s}.charAt(0).toUpperCase() + ${s}.slice(1)${q.lowerRest ? '.toLowerCase()' : ''} : ${s};`],
    py: ([s], q) => [`return ${s}[:1].upper() + ${s}[1:]${q.lowerRest ? '.lower()' : ''}`],
    ex: [[['hello'], 'Hello'], [[''], ''], [['a'], 'A'], [['hELLO'], 'HELLO']] }),
  E('title-case', { in: [S], out: S, params: ['s'],
    re: R('\\b(?:capitali[sz]es?|capitali[sz]ing|upper ?cases?|uppercases|uppercasing) (?:the )?first (?:letter|character|char) of (?:each|every|all(?: the)?) words?(?: in ' + 'SLOT' + ')?\\b|\\b(?:the )?first (?:letter|character) of (?:each|every) word (?:capitali[sz]ed|in upper ?case|upper ?cased|uppercased)\\b|\\b(?:capitali[sz]es?|capitali[sz]ing) (?:each|every|all(?: the)?) words?(?: in ' + 'SLOT' + ')?\\b|\\b(?:each|every) words? capitali[sz]ed\\b'),
    js: ([s]) => [`return String(${s}).replace(/(^|\\s)(\\S)/g, (_m, _a, _b) => _a + _b.toUpperCase());`],
    py: ([s]) => [`return ''.join(_c.upper() if _i == 0 or ${s}[_i - 1].isspace() else _c for _i, _c in enumerate(${s}))`],
    ex: [[['hello world'], 'Hello World'], [['a'], 'A'], [[''], ''], [['one  two'], 'One  Two']] }),
  E('upper-case', { in: [S], out: S, params: ['s'],
    re: R('\\b(?:(?:in|to|into) )?(?:all )?(?:upper ?case|uppercase|capital letters|all caps)(?: letters)?\\b|\\b(?:upper ?cased|uppercased)\\b'),
    js: ([s]) => [`return String(${s}).toUpperCase();`], py: ([s]) => [`return ${s}.upper()`],
    ex: [[['abc'], 'ABC'], [['Hi 2'], 'HI 2']] }),
  E('lower-case', { in: [S], out: S, params: ['s'],
    re: R('\\b(?:(?:in|to|into) )?(?:all )?(?:lower ?case|lowercase|small letters)(?: letters)?\\b|\\b(?:lower ?cased|lowercased)\\b'),
    js: ([s]) => [`return String(${s}).toLowerCase();`], py: ([s]) => [`return ${s}.lower()`],
    ex: [[['ABC'], 'abc'], [['Hi 2'], 'hi 2']] }),
  E('count-words', { in: [S], out: N, params: ['s'],
    re: R('\\b(?:how many words|(?:the )?number of words|count(?:s)? (?:of )?(?:the )?(?:number of )?words|(?:the )?word count)(?: (?:there )?(?:are )?in ' + 'SLOT' + ')?\\b'),
    quals: [['sep', /\b(?:where |in which )?(?:the )?words are (?:separated|delimited|split) by (?:a |one |single |one or more |any )?(?:spaces?|whitespace|blanks?)(?: characters?)?\b/],
      ['empty', /\b(?:an |the )?empty string (?:has|contains|returns?|gives?) (?:none|no words|zero(?: words)?|0(?: words)?)\b|\b(?:returns? )?(?:0|zero) for (?:an |the )?empty string\b/]],
    js: ([s]) => [`const _t = String(${s}).trim();`, "return _t === '' ? 0 : _t.split(/\\s+/).length;"], py: ([s]) => [`return len(${s}.split())`],
    ex: [[['a b c'], 3], [['hello'], 1], [[''], 0], [['  two  words '], 2]] }),
  E('count-char', { in: [S, S], out: N, params: ['s', 'ch'],
    roles: [/\b(?:string|text|word|sentence) ([A-Za-z_$][\w$]*)/, /\b(?:character|char|letter) ([A-Za-z_$][\w$]*)/],
    re: R('\\b(?:counts? )?(?:how many times|the number of times|number of times|(?:the )?number of occurrences of|count(?:s)? (?:of )?(?:the )?(?:occurrences of )?|occurrences of)(?: the)? (?:character|char|letter)(?: param)?(?: (?:occurs|appears|shows up|is found|is present))?(?: in(?: the)?(?: string| text| word)?(?: param)?)?\\b'),
    js: ([s, c]) => ['let _c = 0;', `for (const _ch of String(${s})) if (_ch === ${c}) _c++;`, 'return _c;'],
    py: ([s, c]) => [`return sum(1 for _ch in ${s} if _ch == ${c})`],
    ex: [[['banana', 'a'], 3], [['hello', 'z'], 0]] }),
  E('anagram', { in: [S, S], out: 'bool', params: ['a', 'b'],
    re: R('\\b(?:(?:the )?two (?:strings|words) )?(?:are |is )?(?:an )?anagrams?(?: of (?:each other|one another|param))?\\b'),
    quals: [['ignore', IGNORE_Q]],
    js: ([a, b], q) => [`const _n = (_x) => Array.from(String(_x)${q.icase ? '.toLowerCase()' : ''}${q.spaces || q.nonalnum ? ".replace(/[^A-Za-z0-9]/g, '')" : ''}).sort().join('');`, `return _n(${a}) === _n(${b});`],
    py: ([a, b], q) => [`_n = lambda _x: sorted(_c for _c in _x${q.icase ? '.lower()' : ''}${q.spaces || q.nonalnum ? ' if _c.isascii() and _c.isalnum()' : ''})`, `return _n(${a}) == _n(${b})`],
    ex: [[['listen', 'silent'], true], [['abc', 'abd'], false], [['aab', 'abb'], false]] }),
  E('longest-word', { in: [S], out: S, params: ['s'],
    re: R('\\b(?:the )?longest word(?: in(?: the| an?)?(?: string| sentence| text)?(?: param)?)?\\b'),
    quals: [['tie', /\b(?:and )?(?:returns? )?the first (?:one )?(?:if there is a tie|on a tie|in case of a tie)\b|\bif (?:there is a tie|several words tie)(?: return)? the first(?: one)?\b/]],
    js: ([s]) => ["let _best = '';", `for (const _w of String(${s}).split(/\\s+/)) if (_w.length > _best.length) _best = _w;`, 'return _best;'],
    py: ([s]) => ["_best = ''", `for _w in ${s}.split():`, '    if len(_w) > len(_best):', '        _best = _w', 'return _best'],
    ex: [[['the quick brown fox'], 'quick'], [[''], '']] }),
  E('reverse-words', { in: [S], out: S, params: ['s'],
    re: R('\\b(?:(?:reverses?|reversing|reversed) (?:the )?order of (?:the )?words|(?:with )?(?:the |its )?words (?:in reversed? order|reversed in order)|(?:the )?word order reversed)(?: in (?:param|it|the (?:string|sentence)))?\\b'),
    js: ([s]) => [`const _t = String(${s}).trim();`, "return _t === '' ? '' : _t.split(/\\s+/).reverse().join(' ');"], py: ([s]) => [`return ' '.join(reversed(${s}.split()))`],
    ex: [[['hello big world'], 'world big hello'], [[''], '']] }),
  E('char-frequency', { in: [S], out: 'obj', params: ['s'],
    re: R('\\b(?:(?:the )?(?:frequency|count|number of occurrences|occurrences|counts) of (?:each|every) (?:character|char|letter)|(?:character|char|letter) (?:frequenc(?:y|ies)|counts?)|how many times each (?:character|char|letter) (?:appears|occurs))(?: in (?:param|it|the string))?(?: as an? (?:object|map|dictionary|dict))?\\b'),
    js: ([s]) => ['const _o = {};', `for (const _ch of String(${s})) _o[_ch] = (_o[_ch] || 0) + 1;`, 'return _o;'],
    py: ([s]) => ['_o = {}', `for _ch in ${s}:`, '    _o[_ch] = _o.get(_ch, 0) + 1', 'return _o'],
    ex: [[['aab'], { a: 2, b: 1 }], [[''], {}]] }),
  E('pangram', { in: [S], out: 'bool', params: ['s'],
    re: R('\\b(?:is )?(?:an? )?pangram\\b|\\b(?:contains|uses|has) (?:every|each|all(?: the)?) letters? of the (?:english )?alphabet(?: at least once)?\\b'),
    quals: [['case', CASE_Q]],
    js: ([s]) => [`const _t = String(${s}).toLowerCase();`, "for (const _c of 'abcdefghijklmnopqrstuvwxyz') if (!_t.includes(_c)) return false;", 'return true;'],
    py: ([s]) => [`_t = ${s}.lower()`, "return all(_c in _t for _c in 'abcdefghijklmnopqrstuvwxyz')"],
    ex: [[['The quick brown fox jumps over the lazy dog'], true], [['abc'], false]] }),
  E('repeat-string', { in: [S, N], out: S, params: ['s', 'n'],
    roles: [/\b(?:string|text|word) ([A-Za-z_$][\w$]*)/, /\b([A-Za-z_$][\w$]*) times\b/],
    re: R('\\b(?:repeated|repeats?|repeating) (?:param |it )?(?:param|n) times\\b|\\bconcatenated with itself (?:param|n) times\\b'),
    js: ([s, n]) => [`return String(${s}).repeat(${n});`], py: ([s, n]) => [`return ${s} * ${n}`],
    ex: [[['ab', 3], 'ababab'], [['x', 0], '']] }),
  E('string-length', { in: [S], out: N, params: ['s'],
    re: R('\\b(?:the )?length of (?:the )?(?:string|text|word)?(?: param)?\\b|\\b(?:how many|the number of|number of) characters(?: (?:there )?(?:are )?in(?: param| the string| it))?\\b'),
    js: ([s]) => [`return String(${s}).length;`], py: ([s]) => [`return len(${s})`],
    ex: [[['hello'], 5], [[''], 0]] }),
  E('remove-spaces', { in: [S], out: S, params: ['s'],
    re: R('\\b(?:removes?|removing|deletes?|deleting|without)(?: all| every)?(?: the)? (?:spaces|whitespace|white space|blanks)(?: characters)?(?: from ' + 'SLOT' + ')?\\b|\\b(?:with )?(?:all |every )?(?:the )?(?:spaces|whitespace) removed\\b'),
    js: ([s]) => [`return String(${s}).replace(/\\s+/g, '');`], py: ([s]) => [`return ''.join(${s}.split())`],
    ex: [[['a b  c'], 'abc'], [[''], '']] }),
  E('trim', { in: [S], out: S, params: ['s'],
    re: R('\\b(?:trims?|trimming|strips?|stripping|removes?|removing)(?: the)? (?:leading and trailing|surrounding) (?:whitespace|spaces|white space)(?: from ' + 'SLOT' + ')?\\b|\\b(?:with )?(?:the )?(?:leading and trailing|surrounding) (?:whitespace|spaces) removed\\b'),
    js: ([s]) => [`return String(${s}).trim();`], py: ([s]) => [`return ${s}.strip()`],
    ex: [[['  a b '], 'a b'], [[''], '']] }),
  E('all-digits', { in: [S], out: 'bool', params: ['s'],
    re: R('\\b(?:every|each) (?:character|char)(?: (?:of|in) (?:param|it|the string))? is an? (?:decimal )?digit\\b|\\b(?:contains|consists of|has|is made up of|is composed of) only (?:decimal )?digits\\b|\\ball (?:the )?(?:characters|chars)(?: (?:of|in) (?:param|it|the string))? are (?:decimal )?digits\\b'),
    quals: [['nonEmpty', /\b(?:param |it |the string )?is not empty(?: and)?\b|\band (?:param |it |the string )?is not empty\b|\bnonempty and\b/]],
    js: ([s]) => [`return /^[0-9]+$/.test(String(${s}));`], py: ([s]) => [`return len(${s}) > 0 and all('0' <= _c <= '9' for _c in ${s})`],
    ex: [[['123'], true], [['12a'], false], [[''], false]] }),
  E('first-char', { in: [S], out: S, params: ['s'],
    re: R('\\b(?:the )?first (?:character|char|letter)(?: (?:of|in) ' + 'SLOT' + ')?\\b'),
    js: ([s]) => [`return String(${s}).slice(0, 1);`], py: ([s]) => [`return ${s}[:1]`], ex: [[['hello'], 'h'], [[''], '']] }),
  E('last-char', { in: [S], out: S, params: ['s'],
    re: R('\\b(?:the )?last (?:character|char|letter)(?: (?:of|in) ' + 'SLOT' + ')?\\b'),
    js: ([s]) => [`return String(${s}).slice(-1);`], py: ([s]) => [`return ${s}[-1:]`], ex: [[['hello'], 'o'], [[''], '']] }),
  E('unique-chars', { in: [S], out: S, params: ['s'],
    re: R('\\b(?:(?:with )?(?:all )?(?:the )?duplicate (?:characters|letters|chars) (?:removed|dropped)|(?:removes?|removing|drops?|deletes?) (?:all )?(?:the )?duplicate (?:characters|letters|chars)(?: from ' + 'SLOT' + ')?)\\b'),
    quals: [['order', /\b(?:while |and )?(?:keeping|preserving|maintaining|retaining) (?:the )?(?:original )?order(?: of (?:the )?first (?:appearance|occurrence)s?)?\b|\bin (?:the )?(?:same|original) order\b/]],
    js: ([s]) => [`return Array.from(new Set(Array.from(String(${s})))).join('');`], py: ([s]) => [`return ''.join(dict.fromkeys(${s}))`],
    ex: [[['banana'], 'ban'], [[''], '']] }),
  E('hamming', { in: [S, S], out: N, params: ['a', 'b'],
    re: R('\\b(?:the )?hamming distance(?: between (?:param and param|the two strings|two strings))?\\b'),
    js: ([a, b]) => ['let _d = 0;', `for (let _i = 0; _i < ${a}.length; _i++) if (${a}[_i] !== ${b}[_i]) _d++;`, 'return _d;'],
    py: ([a, b]) => [`return sum(1 for _i in range(len(${a})) if ${a}[_i] != ${b}[_i])`],
    ex: [[['karolin', 'kathrin'], 3], [['abc', 'abc'], 0]] }),
  E('is-vowel', { in: [S], out: 'bool', params: ['ch'],
    re: R('\\b(?:is )?an? vowel\\b'),
    js: ([c]) => [`return typeof ${c} === 'string' && ${c}.length === 1 && 'aeiouAEIOU'.includes(${c});`], py: ([c]) => [`return len(${c}) == 1 and ${c} in 'aeiouAEIOU'`],
    ex: [[['a'], true], [['b'], false], [['E'], true]] }),
  E('word-frequency', { in: [S], out: 'obj', params: ['s'],
    re: R('\\b(?:(?:the )?(?:frequency|count|number of occurrences|occurrences|counts) of (?:each|every) word|word (?:frequenc(?:y|ies)|counts)|how many times each word (?:appears|occurs))(?: in (?:param|it|the string|the text))?(?: as an? (?:object|map|dictionary|dict))?\\b'),
    js: ([s]) => ['const _o = {};', `for (const _w of String(${s}).split(/\\s+/)) if (_w) _o[_w] = (_o[_w] || 0) + 1;`, 'return _o;'],
    py: ([s]) => ['_o = {}', `for _w in ${s}.split():`, '    _o[_w] = _o.get(_w, 0) + 1', 'return _o'],
    ex: [[['a b a'], { a: 2, b: 1 }], [[''], {}]] }),

  // ---------------------------------------------------------------- numbers
  E('factorial', { in: [N], out: N, params: ['n'], dom: true,
    re: R('\\bfactorial(?: of(?: param)?)?\\b'),
    js: ([n]) => ['let _r = 1;', `for (let _i = 2; _i <= ${n}; _i++) _r *= _i;`, 'return _r;'],
    py: ([n]) => ['_r = 1', `for _i in range(2, ${n} + 1):`, '    _r *= _i', 'return _r'],
    ex: [[[0], 1], [[5], 120], [[10], 3628800]] }),
  E('fibonacci', { in: [N], out: N, params: ['n'], dom: true,
    re: R('\\b(?:(?:the )?(?:nth|n th|kth|param th|param) )?fibonacci(?: number| value| term)?(?: (?:at|for) (?:index|position) param| of param)?\\b'),
    quals: [['base', /\b(?:where |with |such that )?(?:the sequence )?(?:starts|starting|begins|beginning) (?:with|at|from) 0(?: and 1)?\b|\b(?:0|zero)[ -]indexed\b|\bindexed from (?:0|zero)\b/]],
    js: ([n]) => ['let _a = 0, _b = 1;', `for (let _i = 0; _i < ${n}; _i++) { const _t = _a + _b; _a = _b; _b = _t; }`, 'return _a;'],
    py: ([n]) => ['_a, _b = 0, 1', `for _ in range(${n}):`, '    _a, _b = _b, _a + _b', 'return _a'],
    ex: [[[0], 0], [[1], 1], [[10], 55], [[20], 6765]] }),
  E('fibonacci-list', { in: [N], out: A, params: ['n'], dom: true,
    re: R('\\b(?:an? (?:array|list) of )?(?:the )?first (?:param|n) fibonacci numbers\\b|\\bfibonacci (?:sequence|numbers|series) (?:of length|with) (?:param|n)(?: (?:terms|numbers|elements))?\\b'),
    js: ([n]) => ['const _r = [];', 'let _a = 0, _b = 1;', `for (let _i = 0; _i < ${n}; _i++) { _r.push(_a); const _t = _a + _b; _a = _b; _b = _t; }`, 'return _r;'],
    py: ([n]) => ['_r = []', '_a, _b = 0, 1', `for _ in range(${n}):`, '    _r.append(_a)', '    _a, _b = _b, _a + _b', 'return _r'],
    ex: [[[5], [0, 1, 1, 2, 3]], [[0], []]] }),
  E('is-prime', { in: [N], out: 'bool', params: ['n'], dom: true,
    re: R('\\b(?:is )?(?:an? )?prime(?: number)?\\b'),
    js: ([n]) => [`if (!Number.isInteger(${n}) || ${n} < 2) return false;`, `for (let _d = 2; _d * _d <= ${n}; _d++) if (${n} % _d === 0) return false;`, 'return true;'],
    py: ([n]) => [`if not isinstance(${n}, int) or ${n} < 2:`, '    return False', '_d = 2', `while _d * _d <= ${n}:`, `    if ${n} % _d == 0:`, '        return False', '    _d += 1', 'return True'],
    ex: [[[2], true], [[1], false], [[15], false], [[97], true], [[0], false]] }),
  E('nth-prime', { in: [N], out: N, params: ['n'], dom: true,
    re: R('\\b(?:the )?(?:nth|n th|kth|param th|param) prime(?: number)?\\b'),
    quals: [['base', /\b(?:where |so |with |such that )?(?:the first prime is 2|counting from (?:1|one)|(?:1|one)[ -]indexed|starting (?:from|at) (?:1|one))\b/]],
    js: ([n]) => ['let _c = 0, _k = 1;', `while (_c < ${n}) {`, '  _k++;', '  let _p = true;', '  for (let _d = 2; _d * _d <= _k; _d++) if (_k % _d === 0) { _p = false; break; }', '  if (_p) _c++;', '}', 'return _k;'],
    py: ([n]) => ['_c, _k = 0, 1', `while _c < ${n}:`, '    _k += 1', '    if all(_k % _d for _d in range(2, int(_k ** 0.5) + 1)):', '        _c += 1', 'return _k'],
    ex: [[[1], 2], [[5], 11], [[10], 29]] }),
  E('primes-up-to', { in: [N], out: A, params: ['n'], dom: true,
    re: R('\\b(?:an? (?:array|list) of )?(?:all )?(?:the )?primes?(?: numbers)? (?:up to(?: and including)?|less than or equal to|not (?:greater|larger) than|no (?:greater|larger) than|<=|through) (?:param|n)(?: inclusive)?\\b'),
    js: ([n]) => ['const _r = [];', `for (let _k = 2; _k <= ${n}; _k++) {`, '  let _p = true;', '  for (let _d = 2; _d * _d <= _k; _d++) if (_k % _d === 0) { _p = false; break; }', '  if (_p) _r.push(_k);', '}', 'return _r;'],
    py: ([n]) => [`return [_k for _k in range(2, ${n} + 1) if all(_k % _d for _d in range(2, int(_k ** 0.5) + 1))]`],
    ex: [[[10], [2, 3, 5, 7]], [[1], []], [[2], [2]]] }),
  E('gcd', { in: [N, N], out: N, params: ['a', 'b'], dom: true,
    re: R('\\b(?:the )?(?:greatest common (?:divisor|factor)|highest common factor|gcd|hcf)\\b'),
    js: ([a, b]) => [`let _a = Math.abs(${a}), _b = Math.abs(${b});`, 'while (_b) { const _t = _a % _b; _a = _b; _b = _t; }', 'return _a;'],
    py: ([a, b]) => [`_a, _b = abs(${a}), abs(${b})`, 'while _b:', '    _a, _b = _b, _a % _b', 'return _a'],
    ex: [[[12, 18], 6], [[7, 13], 1], [[100, 75], 25]] }),
  E('lcm', { in: [N, N], out: N, params: ['a', 'b'], dom: true,
    re: R('\\b(?:the )?(?:least|lowest|smallest) common multiple\\b|\\blcm\\b'),
    js: ([a, b]) => [`if (${a} === 0 || ${b} === 0) return 0;`, `let _a = Math.abs(${a}), _b = Math.abs(${b});`, 'while (_b) { const _t = _a % _b; _a = _b; _b = _t; }', `return Math.abs(${a} / _a * ${b});`],
    py: ([a, b]) => [`if ${a} == 0 or ${b} == 0:`, '    return 0', `_a, _b = abs(${a}), abs(${b})`, 'while _b:', '    _a, _b = _b, _a % _b', `return abs(${a} // _a * ${b})`],
    ex: [[[4, 6], 12], [[7, 3], 21], [[5, 5], 5]] }),
  E('digit-sum', { in: [N], out: N, params: ['n'], dom: true,
    re: R('\\b(?:the )?sum of (?:the |its |all (?:the |its )?)?(?:decimal )?digits(?: (?:of|in) (?:param|it|the number))?\\b|\\b(?:adds?|adding) (?:up )?(?:the |its |all (?:the |its )?)?(?:decimal )?digits(?: of (?:param|it|the number))?\\b|\\b(?:the )?digit sum\\b'),
    js: ([n]) => ['let _s = 0;', `for (const _c of String(Math.abs(${n}))) _s += Number(_c);`, 'return _s;'],
    py: ([n]) => [`return sum(int(_c) for _c in str(abs(${n})))`],
    ex: [[[123], 6], [[0], 0], [[9999], 36]] }),
  E('count-digits', { in: [N], out: N, params: ['n'], dom: true,
    re: R('\\b(?:how many|the number of|number of|count(?:s)? (?:of )?(?:the )?) ?(?:decimal )?digits(?: (?:there )?(?:are )?(?:in|of) (?:param|it|the number))?\\b'),
    js: ([n]) => [`return String(Math.abs(${n})).length;`], py: ([n]) => [`return len(str(abs(${n})))`],
    ex: [[[12345], 5], [[0], 1], [[-7], 1]] }),
  E('reverse-number', { in: [N], out: N, params: ['n'], dom: true,
    re: R('\\b(?:with )?(?:its |the )?digits (?:reversed|in reversed? order)\\b|\\b(?:reverses?|reversing) (?:the |its )?digits(?: of (?:param|it|the number|an integer))?\\b'),
    js: ([n]) => [`const _r = Number(String(Math.abs(${n})).split('').reverse().join(''));`, `return ${n} < 0 ? -_r : _r;`],
    py: ([n]) => [`_r = int(str(abs(${n}))[::-1])`, `return -_r if ${n} < 0 else _r`],
    ex: [[[123], 321], [[-45], -54], [[120], 21]] }),
  E('is-even', { in: [N], out: 'bool', params: ['n'], dom: true,
    re: R('\\b(?:is )?(?:an )?even(?: number| integer)?\\b'),
    js: ([n]) => [`return ${n} % 2 === 0;`], py: ([n]) => [`return ${n} % 2 == 0`], ex: [[[4], true], [[7], false], [[0], true], [[-2], true]] }),
  E('is-odd', { in: [N], out: 'bool', params: ['n'], dom: true,
    re: R('\\b(?:is )?(?:an )?odd(?: number| integer)?\\b'),
    js: ([n]) => [`return Math.abs(${n} % 2) === 1;`], py: ([n]) => [`return ${n} % 2 == 1`], ex: [[[3], true], [[4], false], [[-3], true]] }),
  E('celsius-to-fahrenheit', { in: [N], out: N, params: ['c'],
    re: R('\\b(?:(?:a |the )?temperature )?(?:(?:from|in) )?(?:degrees )?celsius (?:in)?to (?:degrees )?fahrenheit\\b|\\bcelsius (?:temperature )?(?:as|in) (?:degrees )?fahrenheit\\b'),
    js: ([c]) => [`return ${c} * 9 / 5 + 32;`], py: ([c]) => [`return ${c} * 9 / 5 + 32`], ex: [[[0], 32], [[100], 212], [[-40], -40], [[25], 77]] }),
  E('fahrenheit-to-celsius', { in: [N], out: N, params: ['f'],
    re: R('\\b(?:(?:a |the )?temperature )?(?:(?:from|in) )?(?:degrees )?fahrenheit (?:in)?to (?:degrees )?celsius\\b|\\bfahrenheit (?:temperature )?(?:as|in) (?:degrees )?celsius\\b'),
    js: ([f]) => [`return (${f} - 32) * 5 / 9;`], py: ([f]) => [`return (${f} - 32) * 5 / 9`], ex: [[[32], 0], [[212], 100], [[-40], -40]] }),
  E('leap-year', { in: [N], out: 'bool', params: ['year'],
    re: R('\\b(?:is )?(?:a )?leap year(?: (?:in|under|according to) the gregorian calendar)?\\b'),
    js: ([y]) => [`return (${y} % 4 === 0 && ${y} % 100 !== 0) || ${y} % 400 === 0;`], py: ([y]) => [`return (${y} % 4 == 0 and ${y} % 100 != 0) or ${y} % 400 == 0`],
    ex: [[[2000], true], [[1900], false], [[2024], true], [[2023], false]] }),
  E('power', { in: [N, N], out: N, params: ['base', 'exp'],
    roles: [/\bbase ([A-Za-z_$][\w$]*)/, /\b(?:exponent|power) ([A-Za-z_$][\w$]*)/],
    re: R('\\b(?:param )?raised to the power(?: of)?(?: param)?\\b|\\bparam to the power of param\\b|\\bexponentiation\\b'),
    js: ([b, e]) => [`return ${b} ** ${e};`], py: ([b, e]) => [`return ${b} ** ${e}`], ex: [[[2, 10], 1024], [[5, 0], 1], [[3, 3], 27]] }),
  E('sum-to-n', { in: [N], out: N, params: ['n'], dom: true,
    re: R('\\b(?:the )?sum of (?:all )?(?:the )?(?:integers|numbers|whole numbers|natural numbers|positive integers) from 1 (?:to|through|up to) (?:param|n)(?: inclusive)?\\b|\\b(?:the )?sum of the first (?:param|n) (?:positive integers|natural numbers|integers|numbers|positive whole numbers)\\b'),
    js: ([n]) => [`return ${n} * (${n} + 1) / 2;`], py: ([n]) => [`return ${n} * (${n} + 1) // 2`], ex: [[[10], 55], [[1], 1], [[0], 0]] }),
  E('perfect-square', { in: [N], out: 'bool', params: ['n'], dom: true,
    re: R('\\b(?:is )?(?:a )?perfect square\\b'),
    js: ([n]) => [`if (!Number.isInteger(${n}) || ${n} < 0) return false;`, `const _r = Math.round(Math.sqrt(${n}));`, `return _r * _r === ${n};`],
    py: ([n]) => [`if not isinstance(${n}, int) or ${n} < 0:`, '    return False', `_r = int(round(${n} ** 0.5))`, `return _r * _r == ${n}`],
    ex: [[[16], true], [[15], false], [[0], true]] }),
  E('to-binary', { in: [N], out: S, params: ['n'], dom: true,
    re: R('\\b(?:the )?binary (?:representation|string|form|equivalent)(?: of (?:param|it|the number))?\\b|\\b(?:in)?to (?:a )?binary(?: string)?\\b|\\b(?:as|in) (?:a )?binary(?: string)?\\b'),
    js: ([n]) => [`return ${n}.toString(2);`], py: ([n]) => [`return format(${n}, 'b')`], ex: [[[5], '101'], [[0], '0'], [[8], '1000']] }),
  E('from-binary', { in: [S], out: N, params: ['s'],
    re: R('\\b(?:a |the )?binary (?:string|number|numeral)(?: param)? (?:in)?to (?:a |an |its )?(?:decimal|integer|number)(?: (?:number|value|integer))?\\b|\\b(?:the )?(?:decimal|integer|numeric) value of (?:a |the )?binary string(?: param)?\\b'),
    js: ([s]) => [`return Number.parseInt(${s}, 2);`], py: ([s]) => [`return int(${s}, 2)`], ex: [[['101'], 5], [['0'], 0], [['1111'], 15]] }),
  E('to-roman', { in: [N], out: S, params: ['n'], dom: true,
    re: R('\\b(?:in)?to (?:an? |its )?roman numerals?(?: (?:string|representation|form))?\\b|\\b(?:the )?roman numerals?(?: (?:string|representation|form))? (?:for|of) (?:param|it|the (?:number|integer)|an? (?:number|integer))\\b|\\b(?:as|in) (?:an? )?roman numerals?(?: string)?\\b'),
    js: () => ['const _v = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];', "const _s = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];"],
    jsTail: ([n]) => [`let _n = ${n}, _r = '';`, 'for (let _i = 0; _i < _v.length; _i++) while (_n >= _v[_i]) { _r += _s[_i]; _n -= _v[_i]; }', 'return _r;'],
    py: ([n]) => ['_v = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]', "_s = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']", `_n, _r = ${n}, ''`, 'for _i in range(len(_v)):', '    while _n >= _v[_i]:', '        _r += _s[_i]', '        _n -= _v[_i]', 'return _r'],
    ex: [[[4], 'IV'], [[9], 'IX'], [[1994], 'MCMXCIV'], [[3], 'III']] }),
  E('from-roman', { in: [S], out: N, params: ['s'],
    re: R('\\b(?:a |the )?roman numerals?(?: string)?(?: param)? (?:in)?to (?:an? |its )?(?:integer|number|decimal|arabic)(?: (?:number|value|numeral))?\\b|\\b(?:the )?(?:integer|numeric|decimal) value of (?:a |the )?roman numerals?(?: string)?(?: param)?\\b'),
    js: ([s]) => ['const _m = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };', 'let _t = 0;', `for (let _i = 0; _i < ${s}.length; _i++) {`, `  const _c = _m[${s}[_i]], _nx = _m[${s}[_i + 1]] || 0;`, '  _t += _c < _nx ? -_c : _c;', '}', 'return _t;'],
    py: ([s]) => ["_m = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}", '_t = 0', `for _i in range(len(${s})):`, `    _c = _m[${s}[_i]]`, `    _nx = _m[${s}[_i + 1]] if _i + 1 < len(${s}) else 0`, '    _t += -_c if _c < _nx else _c', 'return _t'],
    ex: [[['IV'], 4], [['MCMXCIV'], 1994], [['III'], 3]] }),
  E('power-of-two', { in: [N], out: 'bool', params: ['n'],
    re: R('\\b(?:is )?(?:an? )?(?:exact |integer )?power of (?:two|2)\\b'),
    js: ([n]) => [`if (!Number.isInteger(${n}) || ${n} < 1) return false;`, `let _n = ${n};`, 'while (_n % 2 === 0) _n /= 2;', 'return _n === 1;'],
    py: ([n]) => [`if not isinstance(${n}, int) or ${n} < 1:`, '    return False', `return (${n} & (${n} - 1)) == 0`],
    ex: [[[1], true], [[16], true], [[18], false], [[0], false]] }),
  E('clamp', { in: [N, N, N], out: N, params: ['x', 'lo', 'hi'],
    roles: [/\bclamps? ([A-Za-z_$][\w$]*)/, /\bbetween ([A-Za-z_$][\w$]*) and/, /\bbetween [A-Za-z_$][\w$]* and ([A-Za-z_$][\w$]*)/],
    re: R('\\bclamps? (?:param |a number |the number |a value |the value )?(?:between|to the range|within|into the range) (?:param and param|a minimum and a maximum|a lower and an upper bound)(?: inclusive)?\\b'),
    js: ([x, lo, hi]) => [`return Math.min(Math.max(${x}, ${lo}), ${hi});`], py: ([x, lo, hi]) => [`return min(max(${x}, ${lo}), ${hi})`],
    ex: [[[5, 0, 10], 5], [[-3, 0, 10], 0], [[42, 0, 10], 10]] }),
  E('absolute', { in: [N], out: N, params: ['n'],
    re: R('\\b(?:the )?absolute value(?: of (?:param|it|the number|a number))?\\b'),
    js: ([n]) => [`return Math.abs(${n});`], py: ([n]) => [`return abs(${n})`], ex: [[[-5], 5], [[3], 3]] }),
  E('max-of-two', { in: [N, N], out: N, params: ['a', 'b'],
    re: R('\\b(?:the )?(?:larger|largest|bigger|biggest|greater|greatest|maximum|max|higher|highest) of (?:the )?(?:two|2) (?:numbers|integers|values|inputs|arguments)\\b|\\b(?:the )?(?:larger|bigger|greater|higher) of (?:param and param|them|the two)\\b'),
    js: ([a, b]) => [`return Math.max(${a}, ${b});`], py: ([a, b]) => [`return max(${a}, ${b})`], ex: [[[3, 9], 9], [[-1, -5], -1]] }),
  E('min-of-two', { in: [N, N], out: N, params: ['a', 'b'],
    re: R('\\b(?:the )?(?:smaller|smallest|lesser|minimum|min|lower|lowest) of (?:the )?(?:two|2) (?:numbers|integers|values|inputs|arguments)\\b|\\b(?:the )?(?:smaller|lesser|lower) of (?:param and param|them|the two)\\b'),
    js: ([a, b]) => [`return Math.min(${a}, ${b});`], py: ([a, b]) => [`return min(${a}, ${b})`], ex: [[[3, 9], 3], [[-1, -5], -5]] }),
  E('add-two', { in: [N, N], out: N, params: ['a', 'b'],
    re: R('\\b(?:the )?sum of (?:the )?(?:two|2) (?:numbers|integers|values|inputs|arguments)\\b|\\b(?:the )?sum of param and param\\b|\\badds? (?:the )?(?:two|2) (?:numbers|integers|values)(?: together)?\\b|\\badds? param (?:and|to) param\\b|\\bparam plus param\\b'),
    js: ([a, b]) => [`return ${a} + ${b};`], py: ([a, b]) => [`return ${a} + ${b}`], ex: [[[2, 3], 5], [[-1, 1], 0]] }),
  E('square', { in: [N], out: N, params: ['n'],
    re: R('\\b(?:the )?square of (?:param|it|the number|a number|an integer)\\b|\\bparam squared\\b'),
    js: ([n]) => [`return ${n} * ${n};`], py: ([n]) => [`return ${n} * ${n}`], ex: [[[4], 16], [[-3], 9]] }),
  E('cube', { in: [N], out: N, params: ['n'],
    re: R('\\b(?:the )?cube of (?:param|it|the number|a number|an integer)\\b|\\bparam cubed\\b'),
    js: ([n]) => [`return ${n} * ${n} * ${n};`], py: ([n]) => [`return ${n} * ${n} * ${n}`], ex: [[[2], 8], [[-3], -27]] }),
  E('is-divisible', { in: [N, N], out: 'bool', params: ['a', 'b'],
    roles: [/\b([A-Za-z_$][\w$]*) is (?:evenly |exactly )?divisible\b/, /\bdivisible by ([A-Za-z_$][\w$]*)/],
    re: R('\\b(?:param )?(?:is )?(?:evenly |exactly )?divisible by (?:param)\\b'),
    js: ([a, b]) => [`return ${a} % ${b} === 0;`], py: ([a, b]) => [`return ${a} % ${b} == 0`], ex: [[[10, 5], true], [[10, 3], false]] }),
  E('digits-array', { in: [N], out: A, params: ['n'], dom: true,
    re: R('\\b(?:an? (?:array|list) of )(?:the |its )?digits(?: of (?:param|it|the number))?\\b'),
    js: ([n]) => [`return String(Math.abs(${n})).split('').map(Number);`], py: ([n]) => [`return [int(_c) for _c in str(abs(${n}))]`], ex: [[[123], [1, 2, 3]], [[0], [0]]] }),

  // ---------------------------------------------------------------- arrays
  E('average', { in: [A], out: N, params: ['arr'],
    re: R('\\b(?:the )?(?:arithmetic )?(?:mean|average)(?: value)?(?: of)?\\b'),
    js: ([a]) => ['let _s = 0;', `for (const _v of ${a}) _s += _v;`, `return _s / ${a}.length;`], py: ([a]) => [`return sum(${a}) / len(${a})`],
    ex: [[[[1, 2, 3, 4]], 2.5], [[[10]], 10]] }),
  E('median', { in: [A], out: N, params: ['arr'],
    re: R('\\b(?:the )?median(?: value)?(?: of)?\\b'),
    js: ([a]) => [`const _s = ${a}.slice().sort((_x, _y) => _x - _y);`, 'const _m = Math.floor(_s.length / 2);', 'return _s.length % 2 ? _s[_m] : (_s[_m - 1] + _s[_m]) / 2;'],
    py: ([a]) => [`_s = sorted(${a})`, '_m = len(_s) // 2', 'return _s[_m] if len(_s) % 2 else (_s[_m - 1] + _s[_m]) / 2'],
    ex: [[[[3, 1, 2]], 2], [[[4, 1, 3, 2]], 2.5]] }),
  E('sum', { in: [A], out: N, params: ['arr'],
    re: R('\\b(?:the )?(?:sum|total)(?: of)?(?: all)?(?: the)?(?: (?:numbers|elements|values|items|entries))?\\b|\\b(?:adds?|adding|sums?|summing) (?:up )?(?:all )?(?:the )?(?:numbers|elements|values|items)(?: together)?\\b'),
    js: ([a]) => ['let _s = 0;', `for (const _v of ${a}) _s += _v;`, 'return _s;'], py: ([a]) => [`return sum(${a})`],
    ex: [[[[1, 2, 3]], 6], [[[]], 0], [[[-1, 1, 5]], 5]] }),
  E('product', { in: [A], out: N, params: ['arr'],
    re: R('\\b(?:the )?product(?: of)?(?: all)?(?: the)?(?: (?:numbers|elements|values|items))?\\b|\\b(?:multipl(?:y|ies)|multiplying) (?:all )?(?:the )?(?:numbers|elements|values|items)(?: (?:in|of) (?:an? |the )?(?:array|list)(?: param)?)?(?: together)?\\b'),
    js: ([a]) => ['let _p = 1;', `for (const _v of ${a}) _p *= _v;`, 'return _p;'], py: ([a]) => ['_p = 1', `for _v in ${a}:`, '    _p *= _v', 'return _p'],
    ex: [[[[2, 3, 4]], 24], [[[5]], 5], [[[]], 1]] }),
  E('max', { in: [A], out: N, params: ['arr'],
    re: R('\\b(?:the )?(?:largest|biggest|greatest|highest|maximum|max)(?: (?:number|value|element|item|integer|entry))?(?: (?:in|of|from))?\\b'),
    js: ([a]) => [`let _m = ${a}[0];`, `for (const _v of ${a}) if (_v > _m) _m = _v;`, 'return _m;'], py: ([a]) => [`return max(${a})`],
    ex: [[[[3, 9, 2]], 9], [[[-5, -2, -9]], -2]] }),
  E('min', { in: [A], out: N, params: ['arr'],
    re: R('\\b(?:the )?(?:smallest|lowest|minimum|min)(?: (?:number|value|element|item|integer|entry))?(?: (?:in|of|from))?\\b'),
    js: ([a]) => [`let _m = ${a}[0];`, `for (const _v of ${a}) if (_v < _m) _m = _v;`, 'return _m;'], py: ([a]) => [`return min(${a})`],
    ex: [[[[3, 9, 2]], 2], [[[-5, -2, -9]], -9]] }),
  E('unique', { in: [A], out: A, params: ['arr'],
    re: R('\\b(?:(?:with )?(?:all )?(?:the )?duplicates? (?:removed|eliminated|dropped|filtered out|taken out)|(?:removes?|removing|eliminates?|drops?|filters? out|deletes?) (?:all )?(?:the )?duplicates?(?: (?:values|elements|items|entries))?(?: from (?:param|it|the (?:array|list)|an? (?:array|list)))?|(?:without|with no) duplicates?|de ?duplicat(?:es?|ed|ing)|(?:only )?(?:the )?(?:unique|distinct) (?:elements|values|items|entries|numbers)(?: (?:of|in|from) (?:param|it|the (?:array|list)|an? (?:array|list)))?)\\b'),
    quals: [['order', /\b(?:while |and )?(?:keeping|preserving|maintaining|retaining) (?:the )?(?:original )?(?:order|ordering)(?: of (?:the )?first (?:appearance|occurrence)s?)?\b|\b(?:in|keeping) (?:the )?order (?:of|in which they) (?:first )?(?:appear|appearance|occur|occurrence)s?\b|\bkeeping (?:the )?first (?:occurrence|appearance)(?: of each)?\b|\bin (?:the )?(?:same|original) order\b/]],
    js: ([a]) => [`return Array.from(new Set(${a}));`], py: ([a]) => [`return list(dict.fromkeys(${a}))`],
    ex: [[[[1, 2, 1, 3, 2]], [1, 2, 3]], [[[]], []]] }),
  E('flatten', { in: [A], out: A, params: ['arr'],
    re: R('\\b(?:flattens?|flattening|flattened)(?: (?:param|it|the (?:array|list)|an? (?:array|list)))?\\b|\\b(?:into |as )?(?:a |one )?(?:single )?flat (?:array|list)\\b'),
    quals: [['deep', /\b(?:of |at |to )?(?:any|arbitrary) (?:depth|level of nesting|nesting depth|levels? of nesting)\b|\b(?:deeply|fully|completely|recursively|arbitrarily)(?: nested)?\b|\ball (?:the )?(?:levels|way(?: down)?)\b/],
      ['shallow', /\b(?:by )?(?:only )?one level(?: deep)?\b|\ba single level\b|\bshallow(?:ly)?\b/],
      ['nested', /\b(?:an? )?nested (?:array|list)s?\b/]],
    js: ([a], q) => (q.shallow ? [`return [].concat(...${a});`] : ['const _o = [];', 'const _go = (_x) => { for (const _v of _x) if (Array.isArray(_v)) _go(_v); else _o.push(_v); };', `_go(${a});`, 'return _o;']),
    py: ([a], q) => (q.shallow ? [`return [_y for _x in ${a} for _y in (_x if isinstance(_x, list) else [_x])]`] : ['_o = []', 'def _go(_x):', '    for _v in _x:', '        if isinstance(_v, list):', '            _go(_v)', '        else:', '            _o.append(_v)', `_go(${a})`, 'return _o']),
    ex: [[[[1, [2, [3, [4]]], 5]], [1, 2, 3, 4, 5]], [[[]], []]] }),
  E('chunk', { in: [A, N], out: A, params: ['arr', 'size'],
    roles: [/\b(?:array|list) ([A-Za-z_$][\w$]*)/, /\b(?:size|length|of) ([A-Za-z_$][\w$]*)/],
    re: R('\\b(?:splits?|splitting|breaks?|breaking|divides?|dividing|partitions?|partitioning|chunks?|chunking|cuts?)(?: up)?(?: (?:param|it|the (?:array|list)|an? (?:array|list)))?(?: up)? into (?:consecutive |smaller |separate )?(?:groups|chunks|pieces|subarrays|sub arrays|sublists|batches|slices|parts)(?: (?:of|with) (?:(?:the )?(?:given|specified) )?(?:size|length)?(?: (?:param|n|k))?)?(?: (?:each|elements|items))?\\b|\\bchunks? of (?:size|length) (?:param|n|k)\\b'),
    quals: [['last', /\b(?:where |and |with )?(?:the )?(?:last|final) (?:group|chunk|piece|subarray|batch|slice|part|one) (?:may|can|might|could|is allowed to) (?:be|have) (?:shorter|smaller|fewer(?: elements| items)?)(?: than (?:the others|param|n|k))?\b/]],
    js: ([a, n]) => [`if (!(${n} > 0)) return [];`, 'const _o = [];', `for (let _i = 0; _i < ${a}.length; _i += ${n}) _o.push(${a}.slice(_i, _i + ${n}));`, 'return _o;'],
    py: ([a, n]) => [`if not ${n} > 0:`, '    return []', `return [${a}[_i:_i + ${n}] for _i in range(0, len(${a}), ${n})]`],
    ex: [[[[1, 2, 3, 4, 5], 2], [[1, 2], [3, 4], [5]]], [[[], 3], []], [[[1, 2, 3], 3], [[1, 2, 3]]]] }),
  E('zip', { in: [A, A], out: A, params: ['a', 'b'],
    re: R('\\bzips?(?: together)?(?: (?:param and param|the two (?:arrays|lists)|two (?:arrays|lists)))?\\b|\\b(?:pairs?|pairing) up (?:the )?(?:corresponding )?(?:elements|items|values)(?: of (?:two|the two|param and param)(?: equal length)? (?:arrays|lists))?(?: (?:by index|index by index|position by position))?(?: into (?:an? )?(?:array|list) of (?:two element )?(?:arrays|lists|pairs|tuples))?\\b'),
    js: ([a, b]) => [`const _n = Math.min(${a}.length, ${b}.length);`, 'const _o = [];', `for (let _i = 0; _i < _n; _i++) _o.push([${a}[_i], ${b}[_i]]);`, 'return _o;'],
    py: ([a, b]) => [`return [[_x, _y] for _x, _y in zip(${a}, ${b})]`],
    ex: [[[[1, 2], ['a', 'b']], [[1, 'a'], [2, 'b']]], [[[], []], []]] }),
  E('sort-by-key', { in: [A, S], out: A, params: ['arr', 'key'],
    roles: [/\b(?:array|list) ([A-Za-z_$][\w$]*)/, /\b(?:key|property|field) ([A-Za-z_$][\w$]*)/],
    re: R('\\bsort(?:s|ed|ing)? (?:an? |the )?(?:array|list) of objects by (?:a |the )?(?:given )?(?:key|property|field)(?: (?:param|name))?\\b|\\b(?:sorted|ordered) by (?:the )?(?:given )?(?:key|property|field)(?: param)?\\b'),
    quals: [['desc', /\b(?:in )?(?:descending|decreasing|reverse) order\b|\bfrom (?:largest|highest|biggest) to (?:smallest|lowest)\b/], ['asc', /\b(?:in )?(?:ascending|increasing) order\b|\bfrom (?:smallest|lowest) to (?:largest|highest|biggest)\b/]],
    js: ([a, k], q) => [`return ${a}.slice().sort((_x, _y) => ${q.desc ? `(_x[${k}] < _y[${k}]) - (_x[${k}] > _y[${k}])` : `(_x[${k}] > _y[${k}]) - (_x[${k}] < _y[${k}])`});`],
    py: ([a, k], q) => [`return sorted(${a}, key=lambda _x: _x[${k}]${q.desc ? ', reverse=True' : ''})`],
    ex: [[[[{ n: 2 }, { n: 1 }], 'n'], [{ n: 1 }, { n: 2 }]]] }),
  E('binary-search', { in: [A, N], out: N, params: ['arr', 'target'],
    roles: [/\b(?:array|list) ([A-Za-z_$][\w$]*)/, /\b(?:target|value|element|item|number|key) ([A-Za-z_$][\w$]*)/],
    re: R('\\bbinary search(?:es)?(?: for (?:param|the target|a target|a value))?(?: in (?:param|the sorted (?:array|list)|a sorted (?:array|list)))?\\b|\\b(?:the )?(?:index|position) of (?:(?:the |a )?(?:target|value|element|param) )?in (?:the |a |an )?(?:ascending )?sorted (?:array|list)(?: param)?\\b|\\bsearch(?:es)? (?:the |a )?sorted (?:array|list)(?: param)? for (?:param|the target|a target|a value)\\b'),
    quals: [['missing', /\b(?:or |and )?(?:returns? )?-1 (?:if|when) (?:param |it |the (?:target|value|element) )?(?:is )?(?:not (?:present|found|in (?:the )?(?:array|list)(?: param)?)|absent|missing)\b|\b(?:or |and )?(?:returns? )?-1 otherwise\b/]],
    js: ([a, t]) => [`let _lo = 0, _hi = ${a}.length - 1;`, 'while (_lo <= _hi) {', '  const _m = (_lo + _hi) >> 1;', `  if (${a}[_m] === ${t}) return _m;`, `  if (${a}[_m] < ${t}) _lo = _m + 1; else _hi = _m - 1;`, '}', 'return -1;'],
    py: ([a, t]) => [`_lo, _hi = 0, len(${a}) - 1`, 'while _lo <= _hi:', '    _m = (_lo + _hi) // 2', `    if ${a}[_m] == ${t}:`, '        return _m', `    if ${a}[_m] < ${t}:`, '        _lo = _m + 1', '    else:', '        _hi = _m - 1', 'return -1'],
    ex: [[[[1, 3, 5, 7, 9], 7], 3], [[[1, 3, 5], 4], -1], [[[], 1], -1]] }),
  E('two-sum', { in: [A, N], out: A, params: ['nums', 'target'],
    roles: [/\b(?:array|list|numbers in) ([A-Za-z_$][\w$]*)/, /\b(?:target|up to|sum to|add to) ([A-Za-z_$][\w$]*)/],
    re: R('\\b(?:the )?(?:indices|indexes|positions)(?: i j)? of (?:the )?two (?:numbers|elements|values|entries)(?: in param)? (?:that |which |whose values )?(?:add up to|sum to|add to)(?: param)?\\b|\\btwo ?sum\\b'),
    quals: [['order', /\b(?:with|where|such that) i < j\b|\bi < j\b|\b(?:in )?(?:ascending|increasing) order\b/]],
    js: ([a, t]) => ['const _seen = new Map();', `for (let _j = 0; _j < ${a}.length; _j++) {`, `  const _need = ${t} - ${a}[_j];`, '  if (_seen.has(_need)) return [_seen.get(_need), _j];', `  if (!_seen.has(${a}[_j])) _seen.set(${a}[_j], _j);`, '}', 'return [];'],
    py: ([a, t]) => ['_seen = {}', `for _j, _v in enumerate(${a}):`, `    _need = ${t} - _v`, '    if _need in _seen:', '        return [_seen[_need], _j]', '    if _v not in _seen:', '        _seen[_v] = _j', 'return []'],
    ex: [[[[2, 7, 11, 15], 9], [0, 1]], [[[3, 2, 4], 6], [1, 2]], [[[3, 3], 6], [0, 1]]] }),
  E('count-occurrences', { in: [A, ANY], out: N, params: ['arr', 'x'],
    roles: [/\b(?:array|list) ([A-Za-z_$][\w$]*)/, /\b(?:value|element|item|number|target) ([A-Za-z_$][\w$]*)/],
    re: R('\\b(?:counts? )?(?:how many times|the number of times|number of times|(?:the )?number of occurrences of|count(?:s)? (?:of )?(?:the )?occurrences of|occurrences of) (?:(?:the |a )?(?:value|element|item|number|target) )?(?:param )?(?:(?:occurs|appears|shows up|is found|is present) )?(?:in (?:the |an? )?(?:array|list)(?: param)?)?\\b'),
    js: ([a, x]) => ['let _c = 0;', `for (const _v of ${a}) if (_v === ${x}) _c++;`, 'return _c;'], py: ([a, x]) => [`return sum(1 for _v in ${a} if _v == ${x})`],
    ex: [[[[1, 2, 1, 1], 1], 3], [[[], 5], 0]] }),
  E('sort', { in: [A], out: A, params: ['arr'],
    re: R('\\bsort(?:s|ed|ing)?(?: (?:param|it|the (?:array|list|numbers)|an? (?:array|list)(?: of (?:numbers|integers|strings))?))?(?: (?:in )?(?:ascending|increasing|numerical|numeric) order| from (?:smallest|lowest) to (?:largest|highest|biggest)| numerically)?\\b|\\b(?:in|into) (?:ascending|increasing) order\\b'),
    quals: [['desc', /\b(?:in )?(?:descending|decreasing|reverse) order\b|\bfrom (?:largest|highest|biggest) to (?:smallest|lowest)\b|\b(?:largest|highest|biggest) first\b/], ['alpha', /\b(?:alphabetically|in alphabetical order|lexicographically|in lexicographic(?:al)? order)\b/]],
    js: ([a], q) => [q.alpha ? `return ${a}.slice().sort()${q.desc ? '.reverse()' : ''};` : `return ${a}.slice().sort((_x, _y) => ${q.desc ? '_y - _x' : '_x - _y'});`],
    py: ([a], q) => [`return sorted(${a}${q.desc ? ', reverse=True' : ''})`],
    ex: [[[[3, 1, 2]], [1, 2, 3]], [[[10, 9, 100]], [9, 10, 100]], [[[]], []]] }),
  E('is-sorted', { in: [A], out: 'bool', params: ['arr'],
    re: R('\\b(?:is |are )?(?:already )?sorted(?: in (?:ascending|increasing|non ?decreasing) order)?\\b|\\bin (?:ascending|increasing|non ?decreasing) order\\b'),
    js: ([a]) => [`for (let _i = 1; _i < ${a}.length; _i++) if (${a}[_i - 1] > ${a}[_i]) return false;`, 'return true;'],
    py: ([a]) => [`return all(${a}[_i - 1] <= ${a}[_i] for _i in range(1, len(${a})))`],
    ex: [[[[1, 2, 2, 3]], true], [[[3, 1]], false], [[[]], true]] }),
  E('second-largest', { in: [A], out: N, params: ['arr'], needs: /\b(?:distinct|unique|different)\b/,
    re: R('\\b(?:the )?second (?:largest|biggest|greatest|highest)(?: (?:distinct|unique|different))?(?: (?:number|value|element|integer))?(?: (?:in|of))?\\b'),
    js: ([a]) => [`const _u = Array.from(new Set(${a})).sort((_x, _y) => _y - _x);`, 'return _u.length > 1 ? _u[1] : null;'],
    py: ([a]) => [`_u = sorted(set(${a}), reverse=True)`, 'return _u[1] if len(_u) > 1 else None'],
    ex: [[[[3, 1, 4, 4, 2]], 3], [[[10, 20]], 10], [[[5]], null]] }),
  E('second-smallest', { in: [A], out: N, params: ['arr'], needs: /\b(?:distinct|unique|different)\b/,
    re: R('\\b(?:the )?second (?:smallest|lowest|least)(?: (?:distinct|unique|different))?(?: (?:number|value|element|integer))?(?: (?:in|of))?\\b'),
    js: ([a]) => [`const _u = Array.from(new Set(${a})).sort((_x, _y) => _x - _y);`, 'return _u.length > 1 ? _u[1] : null;'],
    py: ([a]) => [`_u = sorted(set(${a}))`, 'return _u[1] if len(_u) > 1 else None'],
    ex: [[[[3, 1, 4, 1, 2]], 2], [[[10, 20]], 20], [[[5]], null]] }),
  E('keep-even', { in: [A], out: A, params: ['arr'],
    re: R('\\b(?:only )?(?:the )?even (?:numbers|elements|values|integers|ones|entries)(?: (?:from|in|of) (?:param|it|the (?:array|list)|an? (?:array|list)))?\\b|\\b(?:removes?|filters? out|drops?|without|excluding|excludes?) (?:all )?(?:the )?odd (?:numbers|elements|values|integers|ones)\\b'),
    js: ([a]) => [`return ${a}.filter((_v) => _v % 2 === 0);`], py: ([a]) => [`return [_v for _v in ${a} if _v % 2 == 0]`],
    ex: [[[[1, 2, 3, 4]], [2, 4]], [[[]], []]] }),
  E('keep-odd', { in: [A], out: A, params: ['arr'],
    re: R('\\b(?:only )?(?:the )?odd (?:numbers|elements|values|integers|ones|entries)(?: (?:from|in|of) (?:param|it|the (?:array|list)|an? (?:array|list)))?\\b|\\b(?:removes?|filters? out|drops?|without|excluding|excludes?) (?:all )?(?:the )?even (?:numbers|elements|values|integers|ones)\\b'),
    js: ([a]) => [`return ${a}.filter((_v) => Math.abs(_v % 2) === 1);`], py: ([a]) => [`return [_v for _v in ${a} if _v % 2 == 1]`],
    ex: [[[[1, 2, 3, 4]], [1, 3]], [[[-3]], [-3]]] }),
  E('sum-even', { in: [A], out: N, params: ['arr'],
    re: R('\\b(?:the )?sum of (?:all )?(?:the )?even (?:numbers|elements|values|integers)(?: (?:in|of) (?:param|it|the (?:array|list)|an? (?:array|list)))?\\b|\\badds? (?:up )?(?:all )?(?:the )?even (?:numbers|elements|values)\\b'),
    js: ([a]) => ['let _s = 0;', `for (const _v of ${a}) if (_v % 2 === 0) _s += _v;`, 'return _s;'], py: ([a]) => [`return sum(_v for _v in ${a} if _v % 2 == 0)`],
    ex: [[[[1, 2, 3, 4]], 6], [[[]], 0]] }),
  E('sum-odd', { in: [A], out: N, params: ['arr'],
    re: R('\\b(?:the )?sum of (?:all )?(?:the )?odd (?:numbers|elements|values|integers)(?: (?:in|of) (?:param|it|the (?:array|list)|an? (?:array|list)))?\\b|\\badds? (?:up )?(?:all )?(?:the )?odd (?:numbers|elements|values)\\b'),
    js: ([a]) => ['let _s = 0;', `for (const _v of ${a}) if (Math.abs(_v % 2) === 1) _s += _v;`, 'return _s;'], py: ([a]) => [`return sum(_v for _v in ${a} if _v % 2 == 1)`],
    ex: [[[[1, 2, 3, 4]], 4], [[[]], 0]] }),
  E('sum-of-squares', { in: [A], out: N, params: ['arr'],
    re: R('\\b(?:the )?sum of (?:the )?squares(?: of (?:the |all )?(?:numbers|elements|values))?(?: (?:in|of) (?:param|it|the (?:array|list)|an? (?:array|list)))?\\b'),
    js: ([a]) => ['let _s = 0;', `for (const _v of ${a}) _s += _v * _v;`, 'return _s;'], py: ([a]) => [`return sum(_v * _v for _v in ${a})`],
    ex: [[[[1, 2, 3]], 14], [[[]], 0]] }),
  E('intersection', { in: [A, A], out: A, params: ['a', 'b'],
    re: R('\\b(?:the )?intersection(?: of)?(?: (?:param and param|the two (?:arrays|lists)|two (?:arrays|lists)))?\\b|\\bcommon (?:elements|values|items)(?: (?:of|between|in) (?:param and param|the two (?:arrays|lists)|two (?:arrays|lists)|both(?: arrays| lists)?))?\\b'),
    js: ([a, b]) => [`const _b = new Set(${b});`, `return Array.from(new Set(${a}.filter((_v) => _b.has(_v))));`],
    py: ([a, b]) => [`_b = set(${b})`, `return list(dict.fromkeys(_v for _v in ${a} if _v in _b))`],
    ex: [[[[1, 2, 2, 3], [2, 3, 4]], [2, 3]], [[[1], []], []]] }),
  E('union', { in: [A, A], out: A, params: ['a', 'b'],
    re: R('\\b(?:the )?union(?: of)?(?: (?:param and param|the two (?:arrays|lists)|two (?:arrays|lists)))?\\b'),
    js: ([a, b]) => [`return Array.from(new Set([...${a}, ...${b}]));`], py: ([a, b]) => [`return list(dict.fromkeys(${a} + ${b}))`],
    ex: [[[[1, 2], [2, 3]], [1, 2, 3]], [[[], []], []]] }),
  E('rotate-right', { in: [A, N], out: A, params: ['arr', 'k'],
    roles: [/\b(?:array|list) ([A-Za-z_$][\w$]*)/, /\bby ([A-Za-z_$][\w$]*)/],
    re: R('\\brotat(?:es?|ing)(?: (?:param|it|the (?:array|list)|an? (?:array|list)))? (?:to the )?right by (?:param|k|n)(?: (?:positions|places|steps))?\\b|\\brotat(?:es?|ing)(?: (?:param|it|the (?:array|list)|an? (?:array|list)))? by (?:param|k|n)(?: (?:positions|places|steps))? to the right\\b'),
    js: ([a, k]) => [`const _n = ${a}.length;`, 'if (!_n) return [];', `const _k = ((${k} % _n) + _n) % _n;`, `return ${a}.slice(_n - _k).concat(${a}.slice(0, _n - _k));`],
    py: ([a, k]) => [`_n = len(${a})`, 'if not _n:', '    return []', `_k = ${k} % _n`, `return ${a}[_n - _k:] + ${a}[:_n - _k]`],
    ex: [[[[1, 2, 3, 4, 5], 2], [4, 5, 1, 2, 3]], [[[], 3], []]] }),
  E('rotate-left', { in: [A, N], out: A, params: ['arr', 'k'],
    roles: [/\b(?:array|list) ([A-Za-z_$][\w$]*)/, /\bby ([A-Za-z_$][\w$]*)/],
    re: R('\\brotat(?:es?|ing)(?: (?:param|it|the (?:array|list)|an? (?:array|list)))? (?:to the )?left by (?:param|k|n)(?: (?:positions|places|steps))?\\b|\\brotat(?:es?|ing)(?: (?:param|it|the (?:array|list)|an? (?:array|list)))? by (?:param|k|n)(?: (?:positions|places|steps))? to the left\\b'),
    js: ([a, k]) => [`const _n = ${a}.length;`, 'if (!_n) return [];', `const _k = ((${k} % _n) + _n) % _n;`, `return ${a}.slice(_k).concat(${a}.slice(0, _k));`],
    py: ([a, k]) => [`_n = len(${a})`, 'if not _n:', '    return []', `_k = ${k} % _n`, `return ${a}[_k:] + ${a}[:_k]`],
    ex: [[[[1, 2, 3, 4, 5], 2], [3, 4, 5, 1, 2]], [[[], 3], []]] }),
  E('last-element', { in: [A], out: ANY, params: ['arr'],
    re: R('\\b(?:the )?last (?:element|item|value|entry)(?: (?:of|in) (?:param|it|the (?:array|list)|an? (?:array|list)))?\\b'),
    js: ([a]) => [`return ${a}[${a}.length - 1];`], py: ([a]) => [`return ${a}[-1]`], ex: [[[[1, 2, 3]], 3]] }),
  E('first-element', { in: [A], out: ANY, params: ['arr'],
    re: R('\\b(?:the )?first (?:element|item|value|entry)(?: (?:of|in) (?:param|it|the (?:array|list)|an? (?:array|list)))?\\b'),
    js: ([a]) => [`return ${a}[0];`], py: ([a]) => [`return ${a}[0]`], ex: [[[[1, 2, 3]], 1]] }),
  E('index-of-max', { in: [A], out: N, params: ['arr'],
    re: R('\\b(?:the )?(?:index|position) of (?:the )?(?:largest|maximum|max|biggest|greatest|highest)(?: (?:element|value|number|item))?(?: (?:in|of) (?:param|it|the (?:array|list)|an? (?:array|list)))?\\b'),
    quals: [['first', /\b(?:the first one|(?:the )?first occurrence)(?: (?:if|on|in case of) (?:a )?tie)?\b/]],
    js: ([a]) => [`if (!${a}.length) return -1;`, 'let _b = 0;', `for (let _i = 1; _i < ${a}.length; _i++) if (${a}[_i] > ${a}[_b]) _b = _i;`, 'return _b;'],
    py: ([a]) => [`if not ${a}:`, '    return -1', `return ${a}.index(max(${a}))`], ex: [[[[1, 5, 3, 5]], 1], [[[]], -1]] }),
  E('index-of-min', { in: [A], out: N, params: ['arr'],
    re: R('\\b(?:the )?(?:index|position) of (?:the )?(?:smallest|minimum|min|lowest)(?: (?:element|value|number|item))?(?: (?:in|of) (?:param|it|the (?:array|list)|an? (?:array|list)))?\\b'),
    quals: [['first', /\b(?:the first one|(?:the )?first occurrence)(?: (?:if|on|in case of) (?:a )?tie)?\b/]],
    js: ([a]) => [`if (!${a}.length) return -1;`, 'let _b = 0;', `for (let _i = 1; _i < ${a}.length; _i++) if (${a}[_i] < ${a}[_b]) _b = _i;`, 'return _b;'],
    py: ([a]) => [`if not ${a}:`, '    return -1', `return ${a}.index(min(${a}))`], ex: [[[[4, 1, 3, 1]], 1], [[[]], -1]] }),
  E('running-sum', { in: [A], out: A, params: ['arr'],
    re: R('\\b(?:the )?(?:running (?:sums?|totals?)|cumulative (?:sums?|totals?)|prefix sums?)(?: of (?:param|it|the (?:array|list)|an? (?:array|list)))?\\b'),
    js: ([a]) => ['const _o = [];', 'let _s = 0;', `for (const _v of ${a}) { _s += _v; _o.push(_s); }`, 'return _o;'],
    py: ([a]) => ['_o, _s = [], 0', `for _v in ${a}:`, '    _s += _v', '    _o.append(_s)', 'return _o'], ex: [[[[1, 2, 3]], [1, 3, 6]], [[[]], []]] }),
  E('power-set', { in: [A], out: A, params: ['arr'],
    re: R('\\b(?:the )?power ?set(?: of (?:param|it|the (?:array|list)|an? (?:array|list)))?\\b|\\ball (?:the )?(?:possible )?subsets(?: of (?:param|it|the (?:array|list)|an? (?:array|list)))?\\b'),
    js: ([a]) => ['let _o = [[]];', `for (const _v of ${a}) _o = _o.concat(_o.map((_s) => _s.concat([_v])));`, 'return _o;'],
    py: ([a]) => ['_o = [[]]', `for _v in ${a}:`, '    _o = _o + [_s + [_v] for _s in _o]', 'return _o'], ex: [[[[1, 2]], [[], [1], [2], [1, 2]]], [[[]], [[]]]] }),
  E('merge-sorted', { in: [A, A], out: A, params: ['a', 'b'],
    re: R('\\bmerg(?:es?|ing) (?:the )?two sorted (?:arrays|lists)(?: param and param)?(?: into (?:one|a single|a new|a) (?:sorted )?(?:array|list))?\\b'),
    js: ([a, b]) => ['const _o = [];', 'let _i = 0, _j = 0;', `while (_i < ${a}.length && _j < ${b}.length) _o.push(${a}[_i] <= ${b}[_j] ? ${a}[_i++] : ${b}[_j++]);`, `return _o.concat(${a}.slice(_i), ${b}.slice(_j));`],
    py: ([a, b]) => ['_o, _i, _j = [], 0, 0', `while _i < len(${a}) and _j < len(${b}):`, `    if ${a}[_i] <= ${b}[_j]:`, `        _o.append(${a}[_i])`, '        _i += 1', '    else:', `        _o.append(${b}[_j])`, '        _j += 1', `return _o + ${a}[_i:] + ${b}[_j:]`],
    ex: [[[[1, 3, 5], [2, 4]], [1, 2, 3, 4, 5]], [[[], [1]], [1]]] }),
  E('max-subarray', { in: [A], out: N, params: ['arr'],
    re: R('\\b(?:the )?(?:maximum|largest|max|greatest) (?:possible )?sum of (?:a |any )?(?:nonempty )?contiguous (?:subarray|sub array|subsequence)\\b|\\b(?:the )?maximum subarray sum\\b'),
    js: ([a]) => [`let _best = ${a}[0], _cur = ${a}[0];`, `for (let _i = 1; _i < ${a}.length; _i++) { _cur = Math.max(${a}[_i], _cur + ${a}[_i]); _best = Math.max(_best, _cur); }`, 'return _best;'],
    py: ([a]) => [`_best = _cur = ${a}[0]`, `for _v in ${a}[1:]:`, '    _cur = max(_v, _cur + _v)', '    _best = max(_best, _cur)', 'return _best'],
    ex: [[[[-2, 1, -3, 4, -1, 2, 1, -5, 4]], 6], [[[-3, -1]], -1]] }),
  E('transpose', { in: [A], out: A, params: ['m'],
    re: R('\\btranspos(?:es?|ed|ing)(?: (?:param|it|the matrix|a matrix))?\\b|\\b(?:the )?transpose of (?:param|it|the matrix|a matrix)\\b'),
    js: ([m]) => [`if (!${m}.length) return [];`, `return ${m}[0].map((_c, _j) => ${m}.map((_r) => _r[_j]));`], py: ([m]) => [`return [list(_r) for _r in zip(*${m})]`],
    ex: [[[[[1, 2], [3, 4]]], [[1, 3], [2, 4]]], [[[[1, 2, 3]]], [[1], [2], [3]]]] }),
]);

/** The number of operations the spec reader knows (fizzbuzz, a reader of its own, counts as one). */
export const OPERATIONS = CATALOGUE.length + 1;

// ================================================================ reading a code request
const LANG_JS = /\b(?:javascript|js|node(?:\.?js)?|ecmascript)\b/i;
const LANG_PY = /\bpython(?:3)?\b/i;
const LANG_OTHER = /\b(?:typescript|java(?!script)|c\+\+|c#|csharp|rust|golang|ruby|php|swift|kotlin|scala|haskell|perl|lua|dart|bash|powershell|sql)\b|\bin c\b|\bc (?:function|program)\b|\bgo (?:function|program)\b/i;
const CODE_VERB = /\b(?:write|create|implement|make|code|define|build|give me|need|want|provide|produce|construct|develop|generate)\b/i;
const FUNC_WORD = /\b(?:functions?|methods?)\b/i;
const SIG_RE = /(?<![\w$.])([A-Za-z_$][\w$]*)\s*\(\s*((?:[A-Za-z_$][\w$]*\s*(?:,\s*[A-Za-z_$][\w$]*\s*)*)?)\)/g;

function paramsList(s) { return String(s).split(',').map((x) => x.trim()).filter(Boolean); }

/**
 * The shape of a code request, or null: { lang, langStated, name, params, desc, examples, stub, badExample }.
 * desc is the text a complete read must account for, with the name, signature and examples removed.
 */
export function readRequest(text) {
  const t = String(text ?? '');
  if (!t.trim() || t.length > LIMITS.text) return null;
  const lines = t.split(/\r?\n/);
  // --- the stub shape: comment lines, then a signature that opens a body
  let li = lines.length - 1;
  while (li >= 0 && !lines[li].trim()) li--;
  const last = li >= 0 ? lines[li] : '';
  const jsStub = /^\s*(?:export\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*\{\s*$/.exec(last);
  const pyStub = /^\s*def\s+([A-Za-z_][\w]*)\s*\(([^)]*)\)\s*(?:->\s*[\w\[\], .]+)?\s*:\s*$/.exec(last);
  if (jsStub || pyStub) {
    const head = lines.slice(0, li);
    const doc = [];
    for (const l of head) {
      if (!l.trim()) continue;
      const m = /^\s*(?:\/\/+|#+|\/\*+|\*+\/?|\*)\s?(.*?)\s*(?:\*\/)?\s*$/.exec(l);
      if (!m) return null; // code above the signature: not a stub this reader reads
      doc.push(m[1]);
    }
    if (!doc.length) return null;
    const name = (jsStub || pyStub)[1];
    const params = paramsList((jsStub || pyStub)[2]).map((p) => p.replace(/\s*[:=].*$/, ''));
    if (!params.every((p) => IDENT_RE.test(p))) return null;
    const body = doc.join('\n').replace(/@param\s+\{[^}]*\}\s*/g, '').replace(/@returns?\s+\{[^}]*\}\s*/g, '').replace(/[{}]/g, ' ');
    const ex = examplesIn(body, name);
    return { lang: jsStub ? 'javascript' : 'python', langStated: true, name, params, sigGiven: true, desc: ex.rest, examples: ex.examples, badExample: ex.bad, stub: true };
  }
  // --- prose
  if (!CODE_VERB.test(t)) return null;
  SIG_RE.lastIndex = 0;
  let sig = null;
  for (const m of t.matchAll(SIG_RE)) {
    if (RESERVED.has(m[1].toLowerCase())) continue;
    sig = { name: m[1], params: paramsList(m[2]), index: m.index, len: m[0].length };
    break;
  }
  const named = /\b(?:named|called)\s+[`'"]?([A-Za-z_$][\w$]*)/.exec(t);
  if (!FUNC_WORD.test(t) && !sig) return null;
  let name = null;
  if (named && !RESERVED.has(named[1].toLowerCase())) name = named[1];
  if (sig && name && sig.name !== name) {
    // "named sumArray(arr)" is one; a signature of another name is an example call or a second function
    const again = [...t.matchAll(SIG_RE)].find((m) => m[1] === name);
    sig = again ? { name, params: paramsList(again[2]), index: again.index, len: again[0].length } : null;
  }
  if (!name && sig) name = sig.name;
  const langs = [LANG_JS.test(t) ? 'javascript' : null, LANG_PY.test(t) ? 'python' : null].filter(Boolean);
  if (LANG_OTHER.test(t) || langs.length > 1) return { refuse: 'language' };
  const lang = langs[0] || 'javascript';
  let body = t;
  if (sig) body = body.slice(0, sig.index) + ' ' + body.slice(sig.index + sig.len);
  const ex = name ? examplesIn(body, name) : { rest: body, examples: [], bad: false };
  const rest = ex.rest;
  return { lang, langStated: langs.length === 1, name, params: sig ? sig.params : null, sigGiven: !!sig, desc: rest, examples: ex.examples, badExample: ex.bad, stub: false };
}

const REL_RE = /^\s*(?:,\s*)?(?:(?:it|this|that|the function|the call)\s+)?(?:returns?|should\s+return|must\s+return|will\s+return|would\s+return|gives?(?:\s+back)?|equals|is|evaluates\s+to|outputs?|produces?|===|==|=|->|=>|→|⇒)\s*/i;

/** The examples a text states for `name`: name(args) followed by a relation and a value. */
export function examplesIn(text, name) {
  const s = String(text ?? '');
  const esc = name.replace(/\$/g, '\\$');
  const re = new RegExp('(?<![\\w$.])' + esc + '\\s*\\(', 'g');
  const spans = [];
  const examples = [];
  let bad = false;
  for (const m of s.matchAll(re)) {
    const open = m.index + m[0].length - 1;
    const c = parseCallArgs(s, open);
    if (!c.ok) {
      // a signature (identifiers) is not an example; anything else unparseable is an example the reader cannot read
      const close = s.indexOf(')', open);
      const inner = close > open ? s.slice(open + 1, close) : '';
      if (!/^\s*(?:[A-Za-z_$][\w$]*\s*(?:,\s*[A-Za-z_$][\w$]*\s*)*)?$/.test(inner)) bad = true;
      continue;
    }
    const rel = REL_RE.exec(s.slice(c.end));
    if (!rel) { bad = true; continue; }
    const v = parseValue(s, c.end + rel[0].length);
    if (!v.ok) { bad = true; continue; }
    examples.push({ args: c.args, want: v.value });
    spans.push([m.index, v.end]);
  }
  // doctest: >>> name(args) then the value on the next line
  const dt = new RegExp('>>>\\s*' + esc + '\\s*\\(', 'g');
  void dt;
  let rest = s;
  for (const [a, b] of spans.sort((x, y) => y[0] - x[0])) rest = rest.slice(0, a) + ' ' + rest.slice(b);
  if (examples.length > LIMITS.examples) bad = true;
  return { examples, rest, bad };
}

// ================================================================ the complete read
function normalise(s) {
  return String(s ?? '').normalize('NFKC').toLowerCase()
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/\bnon[- ]?empty\b/g, 'nonempty').replace(/\bnon[- ]?negative\b/g, 'nonnegative').replace(/\bnon[- ]?zero\b/g, 'nonzero')
    .replace(/(?<=[a-z])-(?=[a-z])/g, ' ')
    .replace(/\/\/+|#+/g, ' ')
    .replace(/[,;:!?()`[\]{}"]/g, ' ')
    .replace(/\.(?!\d)/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

const COUNT_LEFT = /\b(?:the )?numbers? of\b|\bhow many\b|\b(?:the )?count of\b|\b(?:the )?amount of\b|\b(?:the )?length of\b|\b(?:the )?size of\b/;
const DOM_Q = /\b(?:an? |the )?(?:positive|nonnegative|natural|whole|nonzero)(?: whole)? (?:integers?|numbers?)\b/;
const ARITY2_Q = /\b(?:the )?(?:two|2) (?:(?:positive|nonnegative|natural|whole|nonzero) )?(?:integers|numbers|values|strings|words|arrays|lists|inputs|arguments|parameters|sorted arrays|sorted lists)\b/;

function consume(d, re) {
  let n = 0;
  const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  const rest = d.replace(g, (m) => { n += m.length; return ' '; });
  return { rest, n };
}

function parseIgnore(m) {
  const out = {};
  const w = String(m || '');
  if (/case|capitali[sz]ation|insensitive/.test(w)) out.icase = true;
  if (/non ?alphanumeric/.test(w)) out.nonalnum = true;
  if (/punctuation/.test(w)) out.punct = true;
  if (/spaces|whitespace|white space/.test(w)) out.spaces = true;
  if (out.punct && out.spaces) { out.nonalnum = true; delete out.punct; delete out.spaces; }
  return out;
}

// A parameter's conventional name is type evidence: `s` is a string and `nums` an array, so "def rev(s): return s
// reversed" is the string reverse and never the array one. A name that is neither says nothing.
const STR_NAMES = /^(?:s|s1|s2|str|str1|str2|string|text|word|sentence|phrase|txt)$/i;
const ARR_NAMES = /^(?:arr|arr1|arr2|array|nums|numbers|list|lst|xs|ys|items|values|vals|elements|ints|matrix)$/i;
function namesFit(entry, params) {
  const want = { str: 0, arr: 0 };
  for (const p of params) { if (STR_NAMES.test(p)) want.str++; else if (ARR_NAMES.test(p)) want.arr++; }
  const has = { str: entry.in.filter((t) => t === S || t === ANY).length, arr: entry.in.filter((t) => t === A || t === ANY).length };
  return want.str <= has.str && want.arr <= has.arr;
}

/**
 * Read one catalogue entry against a description completely, or null. Two readings of the description are tried: one
 * with every parameter name replaced by the word "param" (so a phrase can hold a slot), one with the names kept and
 * allowed as function words (so "leap year" in isLeapYear(year) still reads).
 */
function readEntry(entry, desc, req, fullLower) {
  if (entry.needs && !entry.needs.test(fullLower)) return null;
  if (entry.out === 'bool' && !PRED_EVIDENCE.test(fullLower)) return null;
  const touchesStr = entry.in.includes(S) || entry.out === S || entry.out === 'obj' && entry.in.includes(S);
  const touchesArr = entry.in.includes(A) || entry.out === A;
  const hasStr = STRW.test(desc.base), hasArr = ARRW.test(desc.base);
  if (hasArr && !touchesArr && !entry.in.includes(ANY)) return null;
  if (hasStr && !touchesStr && !hasArr) return null;
  if (hasStr && !touchesStr && hasArr && !touchesArr) return null;
  if (req.params && req.params.length !== entry.arity) return null;
  if (req.params && !namesFit(entry, req.params)) return null;
  for (const e of req.examples) if (e.args.length !== entry.arity) return null;
  let best = null;
  for (const mode of ['param', 'names']) {
    let d = mode === 'param' ? desc.param : desc.base;
    const main = consume(d, entry.re);
    if (!main.n) continue;
    d = main.rest;
    let consumed = main.n;
    const flags = {};
    const qualsRead = [];
    for (const [flag, re] of entry.quals) {
      const q = consume(d, re);
      if (!q.n) continue;
      if (flag === 'ignore') {
        const ms = desc.param.match(new RegExp(re.source, 'g')) || desc.base.match(new RegExp(re.source, 'g')) || [];
        Object.assign(flags, ...ms.map(parseIgnore));
      } else flags[flag] = true;
      qualsRead.push(flag);
      d = q.rest;
      consumed += q.n;
    }
    if (flags.deep && flags.shallow) return null;
    if (flags.asc && flags.desc) return null;
    if (entry.arity === 2) { const q = consume(d, ARITY2_Q); d = q.rest; }
    if (entry.dom) { const q = consume(d, DOM_Q); d = q.rest; }
    // a quantity asked of what the operation returns ("the number of unique elements") is a word the operation did not read
    if (COUNT_LEFT.test(d)) continue;
    const toks = d.match(/[a-z_$][a-z0-9_$]*|\d+(?:\.\d+)?|[<>=+*/%]/g) || [];
    const lowerParams = new Set((req.params || []).map((p) => p.toLowerCase()));
    const nameTok = req.name ? req.name.toLowerCase() : null;
    const left = toks.filter((w) => !(FILLER.has(w) || w === nameTok || (entry.out === 'bool' && PRED_FILLER.has(w)) || (mode === 'param' && w === 'param') || (mode === 'names' && lowerParams.has(w))));
    if (left.length) { if (!best || best.left.length > left.length) best = { fail: true, left }; continue; }
    return { entry, consumed, flags, quals: qualsRead, mode };
  }
  return null;
}

/** The role each declared parameter plays, from the cues in the prompt; declared order fills what no cue names. */
function assignRoles(entry, declared, text) {
  const roles = new Array(entry.arity).fill(null);
  const used = new Set();
  entry.roles.forEach((cue, i) => {
    if (!cue) return;
    for (const m of String(text).matchAll(new RegExp(cue.source, 'gi'))) {
      const id = m[1];
      const hit = declared.find((p) => p === id || p.toLowerCase() === String(id).toLowerCase());
      if (hit && !used.has(hit)) { roles[i] = hit; used.add(hit); break; }
    }
  });
  const rest = declared.filter((p) => !used.has(p));
  for (let i = 0; i < roles.length; i++) if (!roles[i]) roles[i] = rest.shift();
  return roles;
}

function emit(lang, name, declared, bodyLines) {
  if (lang === 'python') return 'def ' + name + '(' + declared.join(', ') + '):\n' + bodyLines.map((l) => '    ' + l).join('\n');
  return 'function ' + name + '(' + declared.join(', ') + ') {\n' + bodyLines.map((l) => '  ' + l).join('\n') + '\n}';
}

function bodyOf(entry, lang, roles, flags) {
  if (lang === 'python') return entry.py(roles, flags);
  return entry.jsTail ? [...entry.js(roles, flags), ...entry.jsTail(roles, flags)] : entry.js(roles, flags);
}

/** One catalogue entry's function text (the test file runs every entry's own examples through its JavaScript). */
export function emitEntry(entry, lang = 'javascript', name = null, declared = null, flags = {}) {
  const params = declared || entry.params;
  return emit(lang, name || defaultName(lang, entry.id), params, bodyOf(entry, lang, params, flags));
}

function camel(id) { return id.replace(/-([a-z])/g, (_m, c) => c.toUpperCase()); }
function snake(id) { return id.replace(/-/g, '_'); }
const defaultName = (lang, id) => (lang === 'python' ? snake(id) : camel(id));

// ================================================================ fizzbuzz, a reader of its own
function gcdN(a, b) { while (b) [a, b] = [b, a % b]; return a; }
function lcmN(a, b) { return a / gcdN(a, b) * b; }

function readFizz(req, fullText) {
  const src = req.desc;
  const ruleRe = /(['"‘“])([A-Za-z]+)(['"’”])\s*(?:if|when)\s+(?:(?:[A-Za-z_$][\w$]*|it|the number)\s+)?(?:is\s+)?(?:evenly\s+)?(?:divisible\s+by|a\s+multiple\s+of)\s+(?:both\s+)?(\d+)(?:\s+and\s+(?:by\s+)?(\d+))?/gi;
  const rules = [];
  let rest = src;
  for (const m of src.matchAll(ruleRe)) {
    const d = m[5] ? lcmN(Number(m[4]), Number(m[5])) : Number(m[4]);
    if (!(d > 0)) return null;
    rules.push({ word: m[2], d });
    rest = rest.replace(m[0], ' ');
  }
  if (rules.length < 2) return null;
  const other = /\b(?:and\s+)?otherwise\s+(?:returns?\s+)?(?:([A-Za-z_$][\w$]*)|the number|it)\s+(as\s+a\s+string|converted\s+to\s+a\s+string|itself)?/i.exec(rest);
  if (!other) return null;
  const asString = !!other[2] && !/itself/i.test(other[2]);
  rest = rest.replace(other[0], ' ');
  const params = req.params || ['n'];
  if (params.length !== 1) return null;
  if (other[1] && other[1] !== params[0] && !/^(?:the|it)$/i.test(other[1])) return null;
  // complete read of what is left
  const d = normalise(rest).replace(new RegExp('\\b' + params[0].toLowerCase() + '\\b', 'g'), ' ');
  const toks = d.match(/[a-z_$][a-z0-9_$]*|\d+(?:\.\d+)?|[<>=+*/%]/g) || [];
  const left = toks.filter((w) => !FILLER.has(w) && !['if', 'when', 'otherwise', 'or', 'and'].includes(w));
  if (left.length) return null;
  if (ARRW.test(normalise(fullText))) return null;
  // the rules must never contradict: the first rule checked (largest divisor) divides by every other matching one
  const order = rules.slice().sort((x, y) => y.d - x.d);
  const L = order.reduce((acc, r) => lcmN(acc, r.d), 1);
  if (L > 100000) return null;
  for (let n = 1; n <= L; n++) {
    const hit = order.filter((r) => n % r.d === 0);
    if (hit.length > 1 && !hit.every((r) => hit[0].d % r.d === 0)) return null;
  }
  return { order, asString, param: params[0] };
}

function emitFizz(lang, name, f) {
  const p = f.param;
  if (lang === 'python') {
    const lines = [];
    for (const r of f.order) lines.push(`if ${p} % ${r.d} == 0:`, `    return '${r.word}'`);
    lines.push(f.asString ? `return str(${p})` : `return ${p}`);
    return emit('python', name, [p], lines);
  }
  const lines = f.order.map((r) => `if (${p} % ${r.d} === 0) return '${r.word}';`);
  lines.push(f.asString ? `return String(${p});` : `return ${p};`);
  return emit('javascript', name, [p], lines);
}

// ================================================================ example synthesis
const T = { N: 'num', S: 'str', AN: 'arrN', AS: 'arrS', B: 'bool' };
function isInt(x) { return Number.isInteger(x); }
const P = (name, from, to, fn, js, py) => ({ name, from, to, fn, js, py });
/** The primitives the synthesis composes: in process functions (this file's own code) with their JS and Python text. */
export const PRIMITIVES = Object.freeze([
  P('reverse', T.S, T.S, (x) => Array.from(x).reverse().join(''), "Array.from(X).reverse().join('')", 'X[::-1]'),
  P('upper', T.S, T.S, (x) => x.toUpperCase(), 'X.toUpperCase()', 'X.upper()'),
  P('lower', T.S, T.S, (x) => x.toLowerCase(), 'X.toLowerCase()', 'X.lower()'),
  P('trim', T.S, T.S, (x) => x.trim(), 'X.trim()', 'X.strip()'),
  P('capitalize', T.S, T.S, (x) => x.charAt(0).toUpperCase() + x.slice(1), '(X.charAt(0).toUpperCase() + X.slice(1))', '(X[:1].upper() + X[1:])'),
  P('firstChar', T.S, T.S, (x) => x.slice(0, 1), 'X.slice(0, 1)', 'X[:1]'),
  P('lastChar', T.S, T.S, (x) => x.slice(-1), 'X.slice(-1)', 'X[-1:]'),
  P('dropFirst', T.S, T.S, (x) => x.slice(1), 'X.slice(1)', 'X[1:]'),
  P('dropLast', T.S, T.S, (x) => x.slice(0, -1), 'X.slice(0, -1)', 'X[:-1]'),
  P('removeSpaces', T.S, T.S, (x) => x.replace(/\s+/g, ''), "X.replace(/\\s+/g, '')", "''.join(X.split())"),
  P('removeVowels', T.S, T.S, (x) => x.replace(/[aeiou]/gi, ''), "X.replace(/[aeiou]/gi, '')", "''.join(_c for _c in X if _c.lower() not in 'aeiou')"),
  P('sortChars', T.S, T.S, (x) => Array.from(x).sort().join(''), "Array.from(X).sort().join('')", "''.join(sorted(X))"),
  P('doubleStr', T.S, T.S, (x) => x + x, '(X + X)', '(X + X)'),
  P('length', T.S, T.N, (x) => x.length, 'X.length', 'len(X)'),
  P('countVowels', T.S, T.N, (x) => (x.match(/[aeiou]/gi) || []).length, '(X.match(/[aeiou]/gi) || []).length', "sum(1 for _c in X.lower() if _c in 'aeiou')"),
  P('countWords', T.S, T.N, (x) => (x.trim() ? x.trim().split(/\s+/).length : 0), "(X.trim() ? X.trim().split(/\\s+/).length : 0)", 'len(X.split())'),
  P('chars', T.S, T.AS, (x) => Array.from(x), 'Array.from(X)', 'list(X)'),
  P('words', T.S, T.AS, (x) => x.split(/\s+/).filter(Boolean), 'X.split(/\\s+/).filter(Boolean)', 'X.split()'),
  P('isPalindrome', T.S, T.B, (x) => x === Array.from(x).reverse().join(''), "(X === Array.from(X).reverse().join(''))", '(X == X[::-1])'),
  P('isEmptyStr', T.S, T.B, (x) => x.length === 0, '(X.length === 0)', '(len(X) == 0)'),
  P('joinEmpty', T.AS, T.S, (x) => x.join(''), "X.join('')", "''.join(X)"),
  P('joinSpace', T.AS, T.S, (x) => x.join(' '), "X.join(' ')", "' '.join(X)"),
  P('joinComma', T.AS, T.S, (x) => x.join(','), "X.join(',')", "','.join(X)"),
  P('reverseS', T.AS, T.AS, (x) => x.slice().reverse(), 'X.slice().reverse()', 'X[::-1]'),
  P('sortS', T.AS, T.AS, (x) => x.slice().sort(), 'X.slice().sort()', 'sorted(X)'),
  P('uniqueS', T.AS, T.AS, (x) => Array.from(new Set(x)), 'Array.from(new Set(X))', 'list(dict.fromkeys(X))'),
  P('mapUpper', T.AS, T.AS, (x) => x.map((v) => v.toUpperCase()), 'X.map((_v) => _v.toUpperCase())', '[_v.upper() for _v in X]'),
  P('mapLower', T.AS, T.AS, (x) => x.map((v) => v.toLowerCase()), 'X.map((_v) => _v.toLowerCase())', '[_v.lower() for _v in X]'),
  P('mapReverse', T.AS, T.AS, (x) => x.map((v) => Array.from(v).reverse().join('')), "X.map((_v) => Array.from(_v).reverse().join(''))", '[_v[::-1] for _v in X]'),
  P('mapCapitalize', T.AS, T.AS, (x) => x.map((v) => v.charAt(0).toUpperCase() + v.slice(1)), 'X.map((_v) => _v.charAt(0).toUpperCase() + _v.slice(1))', '[_v[:1].upper() + _v[1:] for _v in X]'),
  P('mapLength', T.AS, T.AN, (x) => x.map((v) => v.length), 'X.map((_v) => _v.length)', '[len(_v) for _v in X]'),
  P('lengthS', T.AS, T.N, (x) => x.length, 'X.length', 'len(X)'),
  P('firstS', T.AS, T.S, (x) => { if (!x.length) throw new Error('empty'); return x[0]; }, 'X[0]', 'X[0]'),
  P('lastS', T.AS, T.S, (x) => { if (!x.length) throw new Error('empty'); return x[x.length - 1]; }, 'X[X.length - 1]', 'X[-1]'),
  P('sum', T.AN, T.N, (x) => x.reduce((a, b) => a + b, 0), 'X.reduce((_a, _b) => _a + _b, 0)', 'sum(X)'),
  P('product', T.AN, T.N, (x) => x.reduce((a, b) => a * b, 1), 'X.reduce((_a, _b) => _a * _b, 1)', 'math_prod(X)'),
  P('max', T.AN, T.N, (x) => { if (!x.length) throw new Error('empty'); return Math.max(...x); }, 'Math.max(...X)', 'max(X)'),
  P('min', T.AN, T.N, (x) => { if (!x.length) throw new Error('empty'); return Math.min(...x); }, 'Math.min(...X)', 'min(X)'),
  P('lengthN', T.AN, T.N, (x) => x.length, 'X.length', 'len(X)'),
  P('firstN', T.AN, T.N, (x) => { if (!x.length) throw new Error('empty'); return x[0]; }, 'X[0]', 'X[0]'),
  P('lastN', T.AN, T.N, (x) => { if (!x.length) throw new Error('empty'); return x[x.length - 1]; }, 'X[X.length - 1]', 'X[-1]'),
  P('reverseN', T.AN, T.AN, (x) => x.slice().reverse(), 'X.slice().reverse()', 'X[::-1]'),
  P('sortAsc', T.AN, T.AN, (x) => x.slice().sort((a, b) => a - b), 'X.slice().sort((_a, _b) => _a - _b)', 'sorted(X)'),
  P('sortDesc', T.AN, T.AN, (x) => x.slice().sort((a, b) => b - a), 'X.slice().sort((_a, _b) => _b - _a)', 'sorted(X, reverse=True)'),
  P('uniqueN', T.AN, T.AN, (x) => Array.from(new Set(x)), 'Array.from(new Set(X))', 'list(dict.fromkeys(X))'),
  P('mapDouble', T.AN, T.AN, (x) => x.map((v) => v * 2), 'X.map((_v) => _v * 2)', '[_v * 2 for _v in X]'),
  P('mapSquare', T.AN, T.AN, (x) => x.map((v) => v * v), 'X.map((_v) => _v * _v)', '[_v * _v for _v in X]'),
  P('mapInc', T.AN, T.AN, (x) => x.map((v) => v + 1), 'X.map((_v) => _v + 1)', '[_v + 1 for _v in X]'),
  P('mapDec', T.AN, T.AN, (x) => x.map((v) => v - 1), 'X.map((_v) => _v - 1)', '[_v - 1 for _v in X]'),
  P('mapNegate', T.AN, T.AN, (x) => x.map((v) => -v), 'X.map((_v) => -_v)', '[-_v for _v in X]'),
  P('mapAbs', T.AN, T.AN, (x) => x.map((v) => Math.abs(v)), 'X.map((_v) => Math.abs(_v))', '[abs(_v) for _v in X]'),
  P('filterEven', T.AN, T.AN, (x) => x.filter((v) => v % 2 === 0), 'X.filter((_v) => _v % 2 === 0)', '[_v for _v in X if _v % 2 == 0]'),
  P('filterOdd', T.AN, T.AN, (x) => x.filter((v) => Math.abs(v % 2) === 1), 'X.filter((_v) => Math.abs(_v % 2) === 1)', '[_v for _v in X if _v % 2 == 1]'),
  P('filterPositive', T.AN, T.AN, (x) => x.filter((v) => v > 0), 'X.filter((_v) => _v > 0)', '[_v for _v in X if _v > 0]'),
  P('tailN', T.AN, T.AN, (x) => x.slice(1), 'X.slice(1)', 'X[1:]'),
  P('initN', T.AN, T.AN, (x) => x.slice(0, -1), 'X.slice(0, -1)', 'X[:-1]'),
  P('runningSum', T.AN, T.AN, (x) => { let s = 0; return x.map((v) => (s += v)); }, '((_s) => X.map((_v) => (_s += _v)))(0)', '[sum(X[:_i + 1]) for _i in range(len(X))]'),
  P('isSortedN', T.AN, T.B, (x) => x.every((v, i) => i === 0 || x[i - 1] <= v), 'X.every((_v, _i) => _i === 0 || X[_i - 1] <= _v)', 'all(X[_i - 1] <= X[_i] for _i in range(1, len(X)))'),
  P('double', T.N, T.N, (x) => x * 2, '(X * 2)', '(X * 2)'),
  P('triple', T.N, T.N, (x) => x * 3, '(X * 3)', '(X * 3)'),
  P('square', T.N, T.N, (x) => x * x, '(X * X)', '(X * X)'),
  P('cube', T.N, T.N, (x) => x * x * x, '(X * X * X)', '(X * X * X)'),
  P('inc', T.N, T.N, (x) => x + 1, '(X + 1)', '(X + 1)'),
  P('dec', T.N, T.N, (x) => x - 1, '(X - 1)', '(X - 1)'),
  P('negate', T.N, T.N, (x) => -x, '(-X)', '(-X)'),
  P('abs', T.N, T.N, (x) => Math.abs(x), 'Math.abs(X)', 'abs(X)'),
  P('digitSum', T.N, T.N, (x) => { if (!isInt(x)) throw new Error('int'); return Array.from(String(Math.abs(x))).reduce((a, c) => a + Number(c), 0); }, "Array.from(String(Math.abs(X))).reduce((_a, _c) => _a + Number(_c), 0)", 'sum(int(_c) for _c in str(abs(X)))'),
  P('toString', T.N, T.S, (x) => String(x), 'String(X)', 'str(X)'),
  P('toBinary', T.N, T.S, (x) => { if (!isInt(x) || x < 0) throw new Error('int'); return x.toString(2); }, 'X.toString(2)', "format(X, 'b')"),
  P('isEven', T.N, T.B, (x) => x % 2 === 0, '(X % 2 === 0)', '(X % 2 == 0)'),
  P('isOdd', T.N, T.B, (x) => Math.abs(x % 2) === 1, '(Math.abs(X % 2) === 1)', '(X % 2 == 1)'),
  P('isPositive', T.N, T.B, (x) => x > 0, '(X > 0)', '(X > 0)'),
  P('range0', T.N, T.AN, (x) => { if (!isInt(x) || x < 0 || x > 1000) throw new Error('range'); return Array.from({ length: x }, (_, i) => i); }, 'Array.from({ length: X }, (_e, _i) => _i)', 'list(range(X))'),
  P('range1', T.N, T.AN, (x) => { if (!isInt(x) || x < 0 || x > 1000) throw new Error('range'); return Array.from({ length: x }, (_, i) => i + 1); }, 'Array.from({ length: X }, (_e, _i) => _i + 1)', 'list(range(1, X + 1))'),
  P('digits', T.N, T.AN, (x) => { if (!isInt(x)) throw new Error('int'); return Array.from(String(Math.abs(x))).map(Number); }, 'Array.from(String(Math.abs(X))).map(Number)', '[int(_c) for _c in str(abs(X))]'),
]);

const PROBES = {
  str: ['', 'a', 'ab', 'Hello World', 'racecar', 'abc def', 'AbC', 'x y z', 'aeiou', '  pad  '],
  num: [0, 1, 2, 3, 5, 7, 10, 12, -4, 25],
  arrN: [[], [1], [3, 1, 2], [2, 2, 5, -1], [10, 20, 30, 40], [7, -3]],
  arrS: [[], ['a'], ['b', 'a', 'c'], ['x', 'y', 'x'], ['hello', 'world']],
};

function typeOfValue(v) {
  if (typeof v === 'string') return 'str';
  if (typeof v === 'number' && Number.isFinite(v)) return 'num';
  if (typeof v === 'boolean') return 'bool';
  if (Array.isArray(v)) {
    if (v.every((x) => typeof x === 'number' && Number.isFinite(x))) return v.length ? 'arrN' : 'arr0';
    if (v.every((x) => typeof x === 'string')) return v.length ? 'arrS' : 'arr0';
  }
  return null;
}

const key = (v) => JSON.stringify(v);

/**
 * Bottom-up enumeration of primitive compositions up to depth 3 that reproduce every example, pruned by observational
 * equivalence on the examples plus fixed probes. Returns { program: [names], js, py, depth, evals } or a refusal reason.
 */
export function synthesize(examples, opts = {}) {
  const t0 = Date.now();
  const wall = Number.isFinite(opts.ms) ? opts.ms : LIMITS.synthMs;
  if (examples.length < 2) return { refuse: 'fewer than two examples' };
  if (!examples.every((e) => e.args.length === 1)) return { refuse: 'synthesis reads one argument' };
  let inT = null;
  for (const e of examples) {
    const t = typeOfValue(e.args[0]);
    if (!t) return { refuse: 'an argument type the primitives do not take' };
    if (t === 'arr0') continue;
    if (inT && inT !== t) return { refuse: 'arguments of two types' };
    inT = t;
  }
  if (!inT) return { refuse: 'only empty arrays' };
  const inputs = [...examples.map((e) => e.args[0]), ...PROBES[inT]];
  const nEx = examples.length;
  const wants = examples.map((e) => key(e.want));
  let frontier = [{ prog: [], type: inT, vals: inputs }];
  const seen = new Set([inT + key(inputs)]);
  let evals = 0;
  let found = null;
  for (let depth = 1; depth <= 3; depth++) {
    const next = [];
    const hits = [];
    for (const node of frontier) {
      for (const p of PRIMITIVES) {
        if (p.from !== node.type) continue;
        if (Date.now() - t0 > wall || evals > LIMITS.synthEvals) return { refuse: 'the synthesis clock ran out', evals };
        const vals = [];
        let ok = true;
        for (let i = 0; i < node.vals.length; i++) {
          const x = node.vals[i];
          if (x === undefined) { vals.push(undefined); continue; }
          evals++;
          try {
            const y = p.fn(x);
            if (typeof y === 'number' && !Number.isFinite(y)) { if (i < nEx) { ok = false; break; } vals.push(undefined); continue; }
            vals.push(y);
          } catch {
            if (i < nEx) { ok = false; break; }
            vals.push(undefined);
          }
        }
        if (!ok) continue;
        const k = p.to + key(vals.map((v) => (v === undefined ? '@err' : v)));
        if (seen.has(k)) continue;
        seen.add(k);
        const child = { prog: [...node.prog, p], type: p.to, vals };
        next.push(child);
        let fits = true;
        for (let i = 0; i < nEx; i++) if (key(vals[i]) !== wants[i]) { fits = false; break; }
        if (fits) hits.push(child);
      }
    }
    if (found) {
      // two examples say little: one more depth is searched, and a different behaviour there that also fits is an ambiguity
      if (hits.length) return { refuse: 'ambiguous: with two examples, a different behaviour of depth ' + depth + ' also fits (' + hits[0].prog.map((p) => p.name).join(' then ') + ')', evals };
      return { ...found, evals };
    }
    if (hits.length) {
      if (hits.length > 1) return { refuse: 'ambiguous: ' + hits.length + ' different behaviours fit the examples at depth ' + depth, candidates: hits.map((h) => h.prog.map((p) => p.name).join(' then ')), evals };
      const h = hits[0];
      let js = 'X', py = 'X';
      for (const p of h.prog) { js = p.js.replace(/X/g, () => js); py = p.py.replace(/X/g, () => py); }
      if (py.includes('math_prod(')) py = null;
      found = { program: h.prog.map((p) => p.name), js, py, depth, evals };
      if (nEx >= 3 || depth === 3) return found;
    }
    frontier = next;
  }
  if (found) return found;
  return { refuse: 'no composition of depth 3 or less fits the examples', evals };
}

// ================================================================ running before answering
async function passesExamples(code, name, examples) {
  if (!examples.length) return { ran: false, passed: 0 };
  const r = await runCases(code, examples.map((e) => ({ args: e.args, expected: e.want })), { entry: name, limitMs: LIMITS.runMs });
  return { ran: true, passed: r.passed, failed: r.failed, ok: r.failed === 0 && r.passed === examples.length, error: r.error };
}

// ================================================================ the code reader
async function readCodeRequest(text, opts) {
  const req = readRequest(text);
  if (!req) return null;
  if (req.refuse) return { refuse: 'a language other than JavaScript or Python' };
  const steps = [];
  if (req.badExample) return { refuse: 'an example the reader cannot read' };
  const name = req.name;
  if (name && (RESERVED.has(name.toLowerCase()) || !IDENT_RE.test(name))) return { refuse: 'the function name is a reserved word' };
  if (req.params && req.params.some((p) => !IDENT_RE.test(p) || RESERVED.has(p.toLowerCase()) || p.startsWith('_'))) return { refuse: 'a parameter name the emitter cannot use' };
  steps.push('language ' + req.lang + (req.langStated ? ' (stated)' : ' (none named: JavaScript)'));
  if (name) steps.push('function name ' + name + (req.sigGiven ? ', signature (' + req.params.join(', ') + ')' : ''));
  if (req.examples.length) steps.push(req.examples.length + ' stated example' + (req.examples.length === 1 ? '' : 's'));
  const fullLower = normalise(text);
  const base = normalise(req.desc);
  let param = req.desc;
  for (const p of req.params || []) param = param.replace(new RegExp('(?<![\\w$])' + p.replace(/\$/g, '\\$') + '(?![\\w$])', 'g'), ' param ');
  const desc = { base, param: normalise(param) };
  // fizzbuzz first: its rules are a grammar of their own
  if (/fizz|buzz/i.test(text) || /divisible by \d+.*divisible by \d+/i.test(text)) {
    const f = readFizz(req, text);
    if (f) {
      const fname = name || 'fizzBuzz';
      const code = emitFizz(req.lang, fname, f);
      const twin = req.lang === 'python' ? emitFizz('javascript', fname, f) : code;
      const run = await passesExamples(twin, fname, req.examples);
      if (run.ran && !run.ok) return { refuse: 'the fizzbuzz reading failed a stated example' };
      steps.push('operation fizzbuzz: ' + f.order.map((r) => r.word + ' when divisible by ' + r.d).join(', ') + ', otherwise ' + (f.asString ? 'the number as a string' : 'the number'));
      if (run.ran) steps.push('ran ' + run.passed + ' of ' + req.examples.length + ' stated examples in act/run.mjs: all passed' + (req.lang === 'python' ? ' (on the JavaScript twin)' : ''));
      return { kind: 'code', lang: req.lang, code, method: 'spec-reader:fizzbuzz', steps };
    }
  }
  const catalogue = opts.catalogue || CATALOGUE;
  const reads = [];
  for (const entry of catalogue) {
    const r = readEntry(entry, desc, req, fullLower);
    if (r) reads.push(r);
  }
  reads.sort((a, b) => b.consumed - a.consumed);
  const tried = [];
  for (let i = 0; i < reads.length; i++) {
    const r = reads[i];
    if (i + 1 < reads.length && reads[i + 1].consumed === r.consumed && reads[i + 1].entry.id !== r.entry.id && i === 0) {
      return { refuse: 'two operations read the prompt equally well (' + r.entry.id + ', ' + reads[i + 1].entry.id + ')' };
    }
    const e = r.entry;
    const fname = name || defaultName(req.lang, e.id);
    const declared = req.params || e.params;
    const roles = assignRoles(e, declared, req.desc);
    const code = emit(req.lang, fname, declared, bodyOf(e, req.lang, roles, r.flags));
    const twin = req.lang === 'python' ? emit('javascript', fname, declared, bodyOf(e, 'javascript', roles, r.flags)) : code;
    const run = await passesExamples(twin, fname, req.examples);
    tried.push(e.id);
    if (run.ran && !run.ok) { steps.push('operation ' + e.id + ' failed ' + run.failed + ' stated example(s) in act/run.mjs: not answered'); continue; }
    steps.push('operation ' + e.id + (r.quals.length ? ' with ' + r.quals.join(', ') : '') + ' (every word of the description read)');
    if (e.arity > 1) steps.push('parameters in role order: ' + roles.join(', '));
    if (run.ran) steps.push('ran ' + run.passed + ' of ' + req.examples.length + ' stated examples in act/run.mjs: all passed' + (req.lang === 'python' ? ' (on the JavaScript twin)' : ''));
    return { kind: 'code', lang: req.lang, code, method: 'spec-reader:' + e.id, steps };
  }
  if (tried.length) return { refuse: 'every operation that read the prompt failed a stated example (' + tried.join(', ') + ')' };
  // example synthesis: only when the examples ARE the whole specification (nothing else is left unread)
  if (opts.synth !== false && req.examples.length >= 2 && name) {
    const toks = desc.param.match(/[a-z_$][a-z0-9_$]*|\d+(?:\.\d+)?|[<>=+*/%]/g) || [];
    const left = toks.filter((w) => !FILLER.has(w) && w !== 'param' && w !== name.toLowerCase() && !['so', 'that', 'where', 'and'].includes(w));
    if (left.length) return { refuse: 'words the reader cannot read: ' + left.slice(0, 6).join(' ') };
    const s = synthesize(req.examples);
    if (s.refuse) return { refuse: 'synthesis: ' + s.refuse };
    const p = (req.params && req.params[0]) || 'x';
    const js = emit('javascript', name, [p], ['return ' + s.js.replace(/X/g, p) + ';']);
    const run = await passesExamples(js, name, req.examples);
    if (!run.ok) return { refuse: 'the synthesized program failed a stated example in act/run.mjs' };
    let code = js;
    if (req.lang === 'python') {
      if (!s.py) return { refuse: 'a primitive with no Python text' };
      code = emit('python', name, [p], ['return ' + s.py.replace(/X/g, p)]);
    }
    steps.push('example synthesis: ' + s.program.join(' then ') + ' (depth ' + s.depth + ', ' + s.evals + ' evaluations, the only behaviour of its depth that fits)');
    steps.push('ran ' + run.passed + ' of ' + req.examples.length + ' stated examples in act/run.mjs: all passed');
    return { kind: 'code', lang: req.lang, code, method: 'example-synthesis:' + s.program.join('>'), steps };
  }
  return { refuse: 'no operation reads the prompt completely' };
}

// ================================================================ code reading: run it
const READ_LANG = '(javascript|js|node(?:\\.js)?|python|typescript|java|c\\+\\+|c#|ruby|go|rust|php|bash|sql)';
const READ_SHAPES = [
  { kind: 'print', re: new RegExp('^\\s*what (?:will|does|would) (?:this|the following|the) ' + READ_LANG + '(?: code| snippet| program| line| statement)? (?:print|output|log|display|write)(?: to the console)?\\s*[?:]\\s*([\\s\\S]+)$', 'i'), lang: 1, code: 2 },
  { kind: 'var', re: new RegExp('^\\s*what is the value of ([A-Za-z_$][\\w$]*) after (?:this|the following) ' + READ_LANG + '(?: code| snippet)? (?:runs|executes|is run)\\s*[?:]\\s*([\\s\\S]+)$', 'i'), lang: 2, code: 3, v: 1 },
  { kind: 'expr', re: new RegExp('^\\s*what (?:does|will|would) (?:this|the following) ' + READ_LANG + ' expression (?:evaluate to|return|equal|give|produce)\\s*[?:]\\s*([\\s\\S]+)$', 'i'), lang: 1, code: 2 },
  { kind: 'expr', re: new RegExp('^\\s*what (?:does|will|would) the ' + READ_LANG + ' expression ([\\s\\S]+?) (?:evaluate to|return|equal|give|produce)\\s*\\??\\s*$', 'i'), lang: 1, code: 2 },
  { kind: 'call', re: new RegExp('^\\s*what (?:does|will|would) (?:this|the following) ' + READ_LANG + ' function return (?:for|with|given|on|when (?:called|given) with) (?:the )?(?:inputs?|arguments?|values?)?\\s*([^:?]+?)\\s*[?:]\\s*([\\s\\S]+)$', 'i'), lang: 1, args: 2, code: 3 },
  { kind: 'expr', re: new RegExp('^\\s*what (?:does|will|would) ([\\s\\S]+?) (?:return|evaluate to|equal|give|produce|print) in ' + READ_LANG + '\\s*\\??\\s*$', 'i'), lang: 2, code: 1 },
];

const FMT_SRC = [
  'function __prim(v) {',
  '  if (typeof v === "string") return { ok: true, s: v };',
  '  if (typeof v === "number") return { ok: true, s: Object.is(v, -0) ? "-0" : String(v) };',
  '  if (typeof v === "boolean" || v === undefined || v === null) return { ok: true, s: String(v) };',
  '  if (typeof v === "bigint") return { ok: true, s: String(v) + "n" };',
  '  return { ok: false };',
  '}',
  'function __inner(v) {',
  '  if (typeof v === "string") return v.indexOf("\'") >= 0 ? null : "\'" + v + "\'";',
  '  var p = __prim(v); return p.ok ? p.s : null;',
  '}',
  'function __log(v) {',
  '  var p = __prim(v); if (p.ok) return p.s;',
  '  if (Array.isArray(v) && v.length <= 6) {',
  '    if (!v.length) return "[]";',
  '    var parts = []; for (var i = 0; i < v.length; i++) { var q = __inner(v[i]); if (q === null) throw new Error("unrendered"); parts.push(q); }',
  '    var s = "[ " + parts.join(", ") + " ]"; if (s.length > 60) throw new Error("unrendered"); return s;',
  '  }',
  '  throw new Error("unrendered");',
  '}',
  'function __val(v) {',
  '  var p = __prim(v); if (p.ok) return { t: typeof v, s: p.s };',
  '  if (Array.isArray(v) && v.length <= 20 && v.every(function (x) { return typeof x === "number" || typeof x === "boolean"; })) return { t: "array", s: "[" + v.map(function (x) { return __prim(x).s; }).join(", ") + "]" };',
  '  throw new Error("unrendered");',
  '}',
].join('\n');

async function readCodeReading(text) {
  const t = String(text ?? '').trim();
  let shape = null, m = null;
  for (const s of READ_SHAPES) { m = s.re.exec(t); if (m) { shape = s; break; } }
  if (!shape) return null;
  const lang = m[shape.lang].toLowerCase();
  if (!/^(?:javascript|js|node(?:\.js)?)$/.test(lang)) return { refuse: 'code reading runs JavaScript only (' + lang + ' asked)' };
  let code = m[shape.code].trim().replace(/^```[a-z]*\s*|```\s*$/gi, '').trim();
  if (!code || code.length > LIMITS.code) return { refuse: 'no code, or too much' };
  if (/\bMath\.random\b|\bDate\b|\bperformance\b|\bprocess\b|\brequire\b|\bimport\b|\bsetTimeout\b|\bsetInterval\b|\bPromise\b|\basync\b|\bawait\b/.test(code)) return { refuse: 'code whose value is not a function of its text' };
  let src;
  if (shape.kind === 'print') {
    if (!/\bconsole\.log\s*\(/.test(code)) return { refuse: 'nothing prints' };
    src = FMT_SRC + '\nfunction __read() {\n  var __out = [];\n  var console = { log: function () { var a = []; for (var i = 0; i < arguments.length; i++) { if (i === 0 && typeof arguments[0] === "string" && arguments[0].indexOf("%") >= 0) throw new Error("format"); a.push(__log(arguments[i])); } __out.push(a.join(" ")); } };\n'
      + code + '\n;\n  return { t: "print", s: __out.join("\\n") };\n}';
  } else if (shape.kind === 'var') {
    const v = m[shape.v];
    src = FMT_SRC + '\nfunction __read() {\n' + code + '\n;\n  return __val(' + v + ');\n}';
  } else if (shape.kind === 'expr') {
    code = code.replace(/[;.?]+\s*$/, '');
    if (/;/.test(code)) return { refuse: 'an expression with statements in it' };
    src = FMT_SRC + '\nfunction __read() {\n  return __val((' + code + '\n));\n}';
  } else {
    const a = String(m[shape.args]).trim().replace(/\s+and\s+/g, ', ');
    const c = parseCallArgs('(' + a + ')', 0);
    if (!c.ok) return { refuse: 'arguments the reader cannot read' };
    const fn = /\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/.exec(code) || /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:function\b|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)/.exec(code);
    if (!fn) return { refuse: 'no function in the code' };
    src = FMT_SRC + '\nfunction __read() {\n' + code + '\n;\n  return __val(' + fn[1] + '(' + c.args.map(jsLiteral).join(', ') + '));\n}';
  }
  const r = await runCases(src, [{ args: [], expected: null }], { entry: '__read', limitMs: LIMITS.readMs });
  const row = r.cases[0];
  if (!row || row.error || !row.got || typeof row.got !== 'object' || typeof row.got.s !== 'string') return { refuse: 'the snippet did not run to a value the reader renders' + (row && row.error ? ' (' + String(row.error).slice(0, 80) + ')' : '') };
  if (shape.kind === 'print' && !row.got.s) return { refuse: 'nothing was printed' };
  return { kind: 'code-reading', lang: 'javascript', value: row.got.s, method: 'code-reading:' + shape.kind, steps: ['language javascript (stated)', 'shape ' + shape.kind, 'ran the snippet in act/run.mjs (' + row.ms + ' ms): ' + (shape.kind === 'print' ? 'printed' : 'value') + ' ' + JSON.stringify(row.got.s).slice(0, 80)] };
}

// ================================================================ SQL
const SQL_FILLER = new Set(('write writes a an the sql query statement that which to from in into of table tables named called me give please i need can you for row rows record records '
  + 'it how many is are with this and entries entry data all every each column columns field fields sqlite postgres postgresql mysql standard would should will must an by using').split(' '));
const CMP = [
  [/^(?:greater than or equal to|at least|no less than|>=)$/, '>='], [/^(?:less than or equal to|at most|no more than|<=)$/, '<='],
  [/^(?:greater than|more than|larger than|bigger than|higher than|over|above|>)$/, '>'], [/^(?:less than|fewer than|smaller than|lower than|under|below|<)$/, '<'],
  [/^(?:not equal to|is not|!=|<>)$/, '<>'], [/^(?:equal to|equals|=|)$/, '='],
];
const CMP_WORDS = 'greater than or equal to|less than or equal to|greater than|more than|larger than|bigger than|higher than|over|above|less than|fewer than|smaller than|lower than|under|below|at least|at most|no more than|no less than|not equal to|equal to|equals|is not|>=|<=|!=|<>|=|>|<';

function readSql(text) {
  const t = String(text ?? '');
  if (!/\bsql\b/i.test(t) && !(/\bquery\b/i.test(t) && /\btable\b/i.test(t))) return null;
  if (t.length > 600) return { refuse: 'too long for the SQL reader' };
  const lits = [];
  let s = t.replace(/'([^']*)'|"([^"]*)"|‘([^’]*)’/g, (_m, a, b, c) => { lits.push(a ?? b ?? c); return ' qlit' + (lits.length - 1) + ' '; });
  s = s.toLowerCase().replace(/[,;:!?()]/g, ' ').replace(/\.(?!\d)/g, ' ').replace(/\s+/g, ' ').trim();
  const steps = [];
  const take = (re) => { const m = re.exec(s); if (m) s = s.slice(0, m.index) + ' ' + s.slice(m.index + m[0].length); return m; };
  const ident = /^[a-z_][a-z0-9_]*$/;
  // the table
  const tm = take(/\b(?:a |the )?table (?:named|called) ([a-z_][a-z0-9_]*)\b/) || take(/\bfrom (?:a |the )?table ([a-z_][a-z0-9_]*)\b/) || take(/\b(?:the |a )?([a-z_][a-z0-9_]*) table\b/);
  if (!tm || !ident.test(tm[1]) || SQL_FILLER.has(tm[1])) return { refuse: 'no table named' };
  const table = tm[1];
  if (/\btable\b/.test(s)) return { refuse: 'two tables' };
  steps.push('table ' + table);
  // the operation
  let op = 'select';
  let set = null;
  if (take(/\b(?:deletes?|deleting|removes?|removing)\b/)) op = 'delete';
  else {
    const up = take(new RegExp('\\b(?:updates?|updating|sets?|setting|changes?|changing)(?: the)? ([a-z_][a-z0-9_]*)(?: column| field)? to (-?\\d+(?:\\.\\d+)?|qlit\\d+)\\b'));
    if (up) { op = 'update'; set = { col: up[1], v: up[2] }; }
    else if (take(/\b(?:counts?|counting)(?: (?:how many|the number of))?(?: (?:rows|records|entries))?\b|\b(?:how many|the number of) (?:rows|records|entries)\b/)) op = 'count';
  }
  if (op === 'select' || op === 'count') take(/\b(?:selects?|selecting|returns?|returning|finds?|finding|gets?|getting|lists?|listing|shows?|showing|fetch(?:es)?|fetching|retrieves?|retrieving|gives?|displays?)\b/);
  steps.push('operation ' + op);
  // a ranked limit first: "the 3 most expensive products" names both the limit and the rows
  let order = null, limit = null, dir = null;
  const lim = take(/\bthe (\d+) (?:most expensive|highest|largest|biggest|most recent|newest|latest)\b|\btop (\d+)\b/);
  if (lim) { limit = Number(lim[1] || lim[2]); dir = 'DESC'; }
  const lim2 = !lim && take(/\bthe (\d+) (?:cheapest|lowest|smallest|oldest|least expensive|earliest)\b/);
  if (lim2) { limit = Number(lim2[1]); dir = 'ASC'; }
  const firstN = !lim && !lim2 && take(/\b(?:the )?first (\d+)\b|\blimit(?:ed)? to (\d+)\b/);
  if (firstN) limit = Number(firstN[1] || firstN[2]);
  // the columns
  let cols = null;
  if (op === 'select') {
    if (take(/\b(?:every|all(?: of)?(?: the)?|each) (?:columns?|fields?|rows?|records?|data|entries|information)\b|\beverything\b/)) cols = ['*'];
    if (!cols) {
      const named = take(/\bthe ((?:[a-z_][a-z0-9_]*)(?: (?:and )?[a-z_][a-z0-9_]*)*?) (?:columns?|fields?)\b/);
      if (named) cols = named[1].split(/ and | /).filter((w) => w && w !== 'and');
    }
    if (!cols) {
      const tn = new RegExp('\\b(?:all |every )?(?:the )?(?:\\d+ )?(?:most expensive |cheapest |highest |lowest |newest |oldest |top )?' + table + '\\b');
      if (tn.test(s)) { take(tn); cols = ['*']; }
    }
    if (!cols) {
      const pl = take(/\bthe ([a-z_][a-z0-9_]*?)(?:es|s) (?=from|of|in)\b/);
      if (pl) {
        let c = pl[0].replace(/^the /, '').trim();
        c = /(?:ss|us)es$/.test(c) ? c.slice(0, -2) : c.endsWith('s') ? c.slice(0, -1) : c;
        cols = [c];
      }
    }
    if (!cols || !cols.every((c) => c === '*' || ident.test(c))) return { refuse: 'no columns read' };
    steps.push('columns ' + cols.join(', '));
  }
  // the one condition
  let where = null;
  const wm = take(new RegExp('\\b(?:where|with|whose|that have|having|have|which have)(?: an?| the)? ([a-z_][a-z0-9_]*) (?:(?:is|are|of) )?(' + CMP_WORDS + ')? ?(-?\\d+(?:\\.\\d+)?|qlit\\d+)\\b'));
  if (wm) {
    const cmpWord = (wm[2] || '').trim();
    const op2 = CMP.find(([re]) => re.test(cmpWord));
    if (!op2 || !ident.test(wm[1])) return { refuse: 'a condition the reader cannot read' };
    where = { col: wm[1], cmp: op2[1], v: wm[3] };
    steps.push('where ' + where.col + ' ' + where.cmp + ' ' + (where.v.startsWith('qlit') ? JSON.stringify(lits[Number(where.v.slice(4))]) : where.v));
  }
  // order and limit
  const alpha = take(/\b(?:sorted |ordered |sort |order )?(?:alphabetically|in alphabetical order)\b/);
  const by = take(/\b(?:(?:sorted|ordered|ranked|sort|order) )?by ([a-z_][a-z0-9_]*)\b/);
  const dm = take(/\b(?:in )?(?:descending|decreasing|reverse) order\b|\bdesc(?:ending)?\b|\b(?:newest|latest|most recent|highest|largest|biggest|most expensive) first\b/);
  const am = take(/\b(?:in )?(?:ascending|increasing) order\b|\basc(?:ending)?\b|\b(?:oldest|earliest|lowest|smallest|cheapest) first\b/);
  if (dm && am) return { refuse: 'two directions' };
  if (dm) { if (dir === 'ASC') return { refuse: 'two directions' }; dir = 'DESC'; }
  if (am) { if (dir === 'DESC') return { refuse: 'two directions' }; dir = 'ASC'; }
  if (by) order = by[1];
  else if (alpha) { if (cols && cols.length === 1 && cols[0] !== '*') order = cols[0]; else return { refuse: 'alphabetically, by which column' }; }
  if ((alpha || dir) && !order) return { refuse: 'an order with no column' };
  if (limit !== null && dir && !order) return { refuse: 'a ranked limit with no column' };
  if (alpha && !dir) dir = 'ASC';
  if (order) steps.push('order by ' + order + ' ' + (dir || 'ASC'));
  if (limit !== null) steps.push('limit ' + limit);
  // everything left must be a function word
  const singular = table.endsWith('s') ? table.slice(0, -1) : null;
  const left = (s.match(/[a-z_][a-z0-9_]*|\d+|[<>=]/g) || []).filter((w) => !SQL_FILLER.has(w) && w !== singular);
  if (left.length) return { refuse: 'words the SQL reader cannot read: ' + left.slice(0, 6).join(' ') };
  const val = (v) => (v.startsWith('qlit') ? "'" + String(lits[Number(v.slice(4))]).replace(/'/g, "''") + "'" : v);
  const W = where ? ' WHERE ' + where.col + ' ' + where.cmp + ' ' + val(where.v) : '';
  let sql;
  if (op === 'delete') { if (!where) return { refuse: 'a DELETE with no condition' }; sql = 'DELETE FROM ' + table + W + ';'; }
  else if (op === 'update') { if (!where) return { refuse: 'an UPDATE with no condition' }; sql = 'UPDATE ' + table + ' SET ' + set.col + ' = ' + val(set.v) + W + ';'; }
  else if (op === 'count') { if (order || limit !== null) return { refuse: 'a count with an order' }; sql = 'SELECT COUNT(*) FROM ' + table + W + ';'; }
  else sql = 'SELECT ' + cols.join(', ') + ' FROM ' + table + W + (order ? ' ORDER BY ' + order + ' ' + (dir || 'ASC') : '') + (limit !== null ? ' LIMIT ' + limit : '') + ';';
  return { kind: 'sql', value: sql, method: 'sql-reader:' + op, steps };
}

// ================================================================ commands
const CMD_FILLER = new Set(('what which is the a an command commands shows show display displays print prints see view current shell terminal unix linux bash zsh macos mac os on in to do i how can you would should use run type '
  + 'that does my me we cli console line prompt with for please tell show give it is are will get using of window windows powershell').split(' '));
const NAME = '([A-Za-z0-9_.][A-Za-z0-9_./-]*)';
const CMDS = [
  { id: 'git-status', re: /\bgit\b[\s\S]*?\b(?:the )?(?:status|(?:which|what) files (?:have )?(?:changed|been modified)(?: but (?:are|have) not (?:yet )?(?:been )?(?:committed|staged))?|changed files|uncommitted changes|modified files)\b/, cmd: () => 'git status', words: ['git'] },
  { id: 'git-log', re: /\bgit\b[\s\S]*?\b(?:shows?|lists?|displays?|see|views?) (?:the )?(?:commit history|history of (?:the )?commits|past commits|log)\b/, cmd: () => 'git log', words: ['git'] },
  { id: 'git-new-branch-switch', re: new RegExp('\\bgit\\b[\\s\\S]*?\\bcreates? (?:a )?(?:new )?branch (?:named |called )?' + NAME + ' and (?:switch(?:es)?|checks? out|moves?) (?:to|onto) (?:it|that branch)\\b'), cmd: (m) => 'git checkout -b ' + m[1], words: ['git'] },
  { id: 'git-init', re: /\b(?:initiali[sz]es?|creates?|starts?) (?:a )?(?:new )?git repo(?:sitory)?(?: (?:here|in the current directory))?\b/, cmd: () => 'git init' },
  { id: 'git-add-all', re: /\bgit\b[\s\S]*?\b(?:stages?|adds?) (?:all )?(?:the )?(?:changes|changed files|files)(?: for (?:the next )?commit)?\b/, cmd: () => 'git add .', words: ['git'] },
  { id: 'npm-install-dev', re: new RegExp('\\binstalls? (?:the )?(?:npm )?(?:package )?(?:named |called )?' + NAME + '(?: package)? as a dev(?:elopment)? dependency\\b'), cmd: (m) => 'npm install --save-dev ' + m[1], needs: /\bnpm\b|\bnode\b/ },
  { id: 'npm-install', re: new RegExp('\\binstall (?:the )?(?:npm )?package (?:named |called )?' + NAME + '\\b|\\binstall (?:the )?' + NAME + ' (?:npm )?package\\b'), cmd: (m) => 'npm install ' + (m[1] || m[2]), needs: /\bnpm\b/ },
  { id: 'pip-install', re: new RegExp('\\binstall (?:the )?(?:python |pip )?package (?:named |called )?' + NAME + '\\b|\\binstall (?:the )?' + NAME + ' (?:python |pip )?package\\b'), cmd: (m) => 'pip install ' + (m[1] || m[2]), needs: /\bpip\b|\bpython\b/ },
  { id: 'ls-hidden-long', re: /\blists? (?:all )?(?:the )?files(?: in (?:the )?(?:current|this|working) (?:directory|folder))?(?: in (?:the )?long format)?,? including hidden (?:ones|files)(?: in (?:the )?long format)?\b/, cmd: () => 'ls -la' },
  { id: 'ls', re: /\b(?:lists?|shows?|displays?|see) (?:all )?(?:the )?(?:files|contents|files and (?:folders|directories))(?: (?:in|of) (?:the )?(?:current|this|working) (?:directory|folder))?\b/, cmd: () => 'ls' },
  { id: 'pwd', re: /\b(?:shows?|prints?|displays?|tells?|gets?|finds?|outputs?) (?:me )?(?:the |my )?(?:current )?(?:working )?directory(?: i am in| (?:you are|i'm) in)?\b|\bwhere am i\b/, cmd: () => 'pwd' },
  { id: 'mkdir-p', re: new RegExp('\\b(?:makes?|creates?) (?:a )?(?:new )?(?:nested )?(?:directory|folder) (?:path )?(?:named |called )?' + NAME + ' (?:and|including|with) (?:any |all )?(?:missing )?parent(?:s| directories| folders)\\b'), cmd: (m) => 'mkdir -p ' + m[1] },
  { id: 'mkdir', re: new RegExp('\\b(?:makes?|creates?) (?:a )?(?:new )?(?:directory|folder) (?:named |called )?' + NAME + '\\b'), cmd: (m) => 'mkdir ' + m[1] },
  { id: 'rmdir', re: new RegExp('\\b(?:removes?|deletes?) (?:an? )?empty (?:directory|folder) (?:named |called )?' + NAME + '\\b'), cmd: (m) => 'rmdir ' + m[1] },
  { id: 'rm-r', re: new RegExp('\\b(?:removes?|deletes?) (?:a |the )?(?:directory|folder) (?:named |called )?' + NAME + ' and (?:all |everything )?(?:of )?(?:its|the) (?:contents|files)(?: inside(?: it)?)?\\b'), cmd: (m) => 'rm -r ' + m[1] },
  { id: 'rm', re: new RegExp('\\b(?:removes?|deletes?) (?:a |the )?file (?:named |called )?' + NAME + '\\b'), cmd: (m) => 'rm ' + m[1] },
  { id: 'cp', re: new RegExp('\\bcop(?:y|ies) (?:the |a )?(?:file )?(?:named |called )?' + NAME + ' (?:to|into|as) (?:a (?:new )?file (?:named |called )?)?' + NAME + '\\b'), cmd: (m) => 'cp ' + m[1] + ' ' + m[2] },
  { id: 'mv', re: new RegExp('\\b(?:moves?|renames?) (?:the |a )?(?:file )?(?:named |called )?' + NAME + ' (?:to|into|as) ' + NAME + '\\b'), cmd: (m) => 'mv ' + m[1] + ' ' + m[2] },
  { id: 'cat', re: new RegExp('\\b(?:prints?|shows?|displays?|outputs?|reads?|views?|see) (?:out )?(?:the )?(?:contents?|content|text) of (?:a |the )?(?:file )?(?:named |called )?' + NAME + '\\b'), cmd: (m) => 'cat ' + m[1] },
  { id: 'grep', re: new RegExp('\\bsearch(?:es)? for (?:the )?(?:word|text|string|pattern) ([A-Za-z0-9_-]+) (?:in|inside|within) (?:the |a )?(?:file )?(?:named |called )?' + NAME + '\\b'), cmd: (m) => 'grep ' + m[1] + ' ' + m[2] },
  { id: 'find', re: /\bfinds? (?:all )?(?:the )?files? (?:named|called) ([A-Za-z0-9_.*-]+)(?: in (?:the )?(?:current (?:directory|folder)|this (?:directory|folder)) and (?:its )?subdirectories)?\b/, cmd: (m) => 'find . -name "' + m[1] + '"' },
  { id: 'chmod-x', re: new RegExp('\\bmakes? (?:the )?(?:script|file)? ?(?:named |called )?' + NAME + ' executable\\b'), cmd: (m) => 'chmod +x ' + m[1] },
  { id: 'touch', re: new RegExp('\\bcreates? (?:an )?empty file (?:named |called )?' + NAME + '\\b'), cmd: (m) => 'touch ' + m[1] },
  { id: 'wc-l', re: new RegExp('\\bcounts? (?:the )?(?:number of )?lines (?:in|of) (?:the |a )?(?:file )?(?:named |called )?' + NAME + '\\b'), cmd: (m) => 'wc -l ' + m[1] },
  { id: 'head', re: new RegExp('\\b(?:shows?|prints?|displays?) (?:the )?first (\\d+) lines of (?:the |a )?(?:file )?(?:named |called )?' + NAME + '\\b'), cmd: (m) => 'head -n ' + m[1] + ' ' + m[2] },
  { id: 'tail', re: new RegExp('\\b(?:shows?|prints?|displays?) (?:the )?last (\\d+) lines of (?:the |a )?(?:file )?(?:named |called )?' + NAME + '\\b'), cmd: (m) => 'tail -n ' + m[1] + ' ' + m[2] },
  { id: 'whoami', re: /\b(?:shows?|prints?|displays?|tells?) (?:me )?(?:the )?current (?:user(?:name)?|logged in user)\b/, cmd: () => 'whoami' },
];

function readCommand(text) {
  const t = String(text ?? '').trim();
  if (!/\b(?:commands?|shell|terminal|bash|zsh|cli|console)\b/i.test(t) && !/\b(?:git|npm|pip)\b/i.test(t) && !/^how (?:do|can|would|should) (?:i|you|we)\b/i.test(t)) return null;
  if (t.length > 400) return { refuse: 'too long for the command reader' };
  const low = t.replace(/[?!.]+\s*$/, '').replace(/\s+/g, ' ');
  const hits = [];
  for (const c of CMDS) {
    if (c.needs && !c.needs.test(low.toLowerCase())) continue;
    const re = new RegExp(c.re.source, 'i');
    const m = re.exec(low);
    if (!m) continue;
    let rest = (low.slice(0, m.index) + ' ' + low.slice(m.index + m[0].length)).toLowerCase();
    rest = rest.replace(/[,.;:'"`]/g, ' ');
    const left = (rest.match(/[a-z0-9_-]+/g) || []).filter((w) => !CMD_FILLER.has(w) && !(c.words || []).includes(w) && !['git', 'npm', 'pip'].includes(w));
    if (left.length) continue;
    hits.push({ c, m, n: m[0].length });
  }
  if (!hits.length) return { refuse: 'no command reads the question completely' };
  hits.sort((a, b) => b.n - a.n);
  if (hits.length > 1 && hits[1].n === hits[0].n && hits[1].c.cmd(hits[1].m) !== hits[0].c.cmd(hits[0].m)) return { refuse: 'two commands read it equally well' };
  const h = hits[0];
  return { kind: 'command', value: h.c.cmd(h.m), method: 'command-reader:' + h.c.id, steps: ['intent ' + h.c.id + ' (every word of the question read)'] };
}

// ================================================================ formats
const SMALL = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
/** English number words to an integer (up to the billions), or null for a word it does not know. */
export function wordsToNumber(s) {
  const ws = String(s).toLowerCase().replace(/-/g, ' ').replace(/,/g, ' ').split(/\s+/).filter((w) => w && w !== 'and');
  if (!ws.length) return null;
  let total = 0, cur = 0, any = false;
  for (const w of ws) {
    const small = SMALL.indexOf(w), ten = TENS.indexOf(w);
    if (small >= 0) { cur += small; any = true; }
    else if (ten >= 2) { cur += ten * 10; any = true; }
    else if (w === 'hundred') { if (!any) cur = 1; cur *= 100; any = true; }
    else if (w === 'thousand' || w === 'million' || w === 'billion') { const k = w === 'thousand' ? 1e3 : w === 'million' ? 1e6 : 1e9; total += (cur || 1) * k; cur = 0; any = true; }
    else return null;
  }
  return any ? total + cur : null;
}
/** An integer in English words, hyphenated tens ("forty-two"). */
export function numberToWords(n) {
  if (!Number.isInteger(n) || Math.abs(n) >= 1e12) return null;
  if (n < 0) return 'minus ' + numberToWords(-n);
  if (n < 20) return SMALL[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + SMALL[n % 10] : '');
  if (n < 1000) return SMALL[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + numberToWords(n % 100) : '');
  for (const [k, w] of [[1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']]) if (n >= k) return numberToWords(Math.floor(n / k)) + ' ' + w + (n % k ? ' ' + numberToWords(n % k) : '');
  return null;
}
function groupThousands(numText) {
  const m = /^(-?)(\d+)(\.\d+)?$/.exec(numText);
  if (!m) return null;
  return m[1] + m[2].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (m[3] || '');
}
const MINOR = new Set('a an the and but or nor for so yet at by in of on to up as'.split(' '));
function titleCase(s) {
  const ws = s.split(/(\s+)/);
  const idx = ws.map((w, i) => (/\S/.test(w) ? i : -1)).filter((i) => i >= 0);
  return ws.map((w, i) => {
    if (!/\S/.test(w)) return w;
    const lw = w.toLowerCase();
    if (MINOR.has(lw) && i !== idx[0] && i !== idx[idx.length - 1]) return lw;
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join('');
}
function splitItems(s) {
  const parts = String(s).split(/\s*,\s*(?:and\s+|or\s+)?|\s+and\s+/).map((x) => x.trim()).filter(Boolean);
  return parts.every((p) => /^[\w'-]+(?: [\w'-]+){0,3}$/.test(p)) ? parts : null;
}
const QUOTED = /^['"‘“](.*)['"’”]$/;
function jsonValue(raw) {
  const r = raw.trim();
  const q = QUOTED.exec(r);
  if (q) return { ok: true, v: q[1] };
  if (/^-?\d+(?:\.\d+)?$/.test(r)) return { ok: true, v: Number(r) };
  if (/^(?:true|false)$/i.test(r)) return { ok: true, v: /^true$/i.test(r) };
  if (/^null$/i.test(r)) return { ok: true, v: null };
  if (/^[A-Za-z][\w-]*(?: [A-Z][\w-]*)*$/.test(r)) return { ok: true, v: r };
  return { ok: false };
}

function readFormat(text) {
  const t = String(text ?? '').trim().replace(/\s+/g, ' ');
  if (t.length > 400) return null;
  let m;
  // a date, ISO in, a pattern of DD MM YYYY out
  if ((m = /^(?:please )?(?:write|format|convert|express|rewrite|put|give(?: me)?|show) (?:the date )?(\d{4})-(\d{2})-(\d{2}) (?:in the format|in format|using the format|as|to|into|in) ((?:DD|MM|YYYY|YY|D|M)(?:[/.-](?:DD|MM|YYYY|YY|D|M)){2})(?: format)?\.?$/i.exec(t))) {
    const [, y, mo, d] = m;
    const fmt = m[4].toUpperCase();
    const dim = [31, (Number(y) % 4 === 0 && Number(y) % 100 !== 0) || Number(y) % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (!(Number(mo) >= 1 && Number(mo) <= 12 && Number(d) >= 1 && Number(d) <= dim[Number(mo) - 1])) return { refuse: 'a date that does not exist' };
    const toks = fmt.split(/[/.-]/);
    if (new Set(toks.map((x) => x[0])).size !== 3) return { refuse: 'a date pattern that repeats a field' };
    const out = fmt.replace(/YYYY|YY|DD|MM|D|M/g, (k) => ({ YYYY: y, YY: y.slice(2), DD: d, MM: mo, D: String(Number(d)), M: String(Number(mo)) }[k]));
    return { kind: 'format', value: out, method: 'format-reader:date', steps: ['date ' + y + '-' + mo + '-' + d, 'pattern ' + fmt] };
  }
  // thousands separators
  if ((m = /^(?:please )?(?:format|write|display|show|print) (?:the number )?(-?\d+(?:\.\d+)?) with (?:commas as (?:the )?thousands? separators?|comma thousands? separators?|thousands? separators?|commas)\.?$/i.exec(t))) {
    const g = groupThousands(m[1]);
    return g ? { kind: 'format', value: g, method: 'format-reader:thousands', steps: ['number ' + m[1], 'commas every three digits'] } : null;
  }
  // number words to digits, digits to words
  if ((m = /^(?:please )?write (?:the number )?([a-z][a-z ,-]*?) (?:in|as|using) (?:digits|numerals|figures)\.?$/i.exec(t))) {
    const n = wordsToNumber(m[1]);
    return n === null ? { refuse: 'number words the reader does not know' } : { kind: 'format', value: String(n), method: 'format-reader:words-to-digits', steps: ['words ' + JSON.stringify(m[1]) + ' read as ' + n] };
  }
  if ((m = /^(?:please )?(?:write|spell out) (?:the number )?(-?\d+) (?:in|as|using) words\.?$/i.exec(t))) {
    const w = numberToWords(Number(m[1]));
    return w ? { kind: 'format', value: w, method: 'format-reader:digits-to-words', steps: ['number ' + m[1]] } : null;
  }
  // markdown lists
  if ((m = /^(?:please )?(?:write|format|put|turn|make|give(?: me)?|show) (?:the (?:list|items|words) )?(.+?) (?:as|into) an? (?:markdown )?(bulleted|bullet|unordered|numbered|ordered)(?: markdown)? list\.?$/i.exec(t))) {
    const items = splitItems(m[1]);
    if (!items || items.length < 2) return { refuse: 'items the reader cannot separate' };
    const numbered = /numbered|ordered/i.test(m[2]) && !/unordered/i.test(m[2]);
    const out = items.map((x, i) => (numbered ? i + 1 + '. ' : '- ') + x).join('\n');
    return { kind: 'format', value: out, method: 'format-reader:' + (numbered ? 'numbered-list' : 'bulleted-list'), steps: [items.length + ' items'] };
  }
  // case conversion of a quoted string
  if ((m = /^(?:please )?(?:convert|change|turn|put|transform) (?:this|the (?:text|string|phrase|sentence|title))?\s*(?:(['"‘“][^'"’”]+['"’”]) )?(?:in)?to (title|upper|lower|snake|camel|kebab)(?: ?case)?(?:[:.]?\s*(['"‘“][^'"’”]+['"’”]))?\.?$/i.exec(t))) {
    const q = m[1] || m[3];
    if (!q || (m[1] && m[3])) return { refuse: 'no single quoted text' };
    const s = QUOTED.exec(q)[1];
    const k = m[2].toLowerCase();
    const words = s.trim().split(/[\s_-]+/).filter(Boolean);
    const out = k === 'title' ? titleCase(s) : k === 'upper' ? s.toUpperCase() : k === 'lower' ? s.toLowerCase()
      : k === 'snake' ? words.map((w) => w.toLowerCase()).join('_') : k === 'kebab' ? words.map((w) => w.toLowerCase()).join('-')
        : words.map((w, i) => (i ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase())).join('');
    return { kind: 'format', value: out, method: 'format-reader:' + k + '-case', steps: ['text ' + JSON.stringify(s), k + ' case'] };
  }
  // a JSON object
  if (/\bjson object\b/i.test(t)) {
    const person = /^(?:please )?(?:give me|write|create|make|produce|return) an? json object with (?:the )?keys (\w+) and (\w+) for an? (?:person|user|man|woman|child|student|employee) named ([A-Z][\w-]*) who is (\d+)(?: years old)?\.?$/i.exec(t);
    if (person) {
      const keys = [person[1], person[2]];
      if (new Set(keys.map((k) => k.toLowerCase())).size !== 2 || !keys.every((k) => /^(?:name|age)$/i.test(k))) return { refuse: 'keys the person shape does not fill' };
      const obj = {};
      for (const k of keys) obj[k] = /^name$/i.test(k) ? person[3] : Number(person[4]);
      return { kind: 'format', value: JSON.stringify(obj, null, 2), method: 'format-reader:json', steps: ['keys ' + keys.join(', ')], lang: 'json' };
    }
    const pairs = /^(?:please )?(?:give me|write|create|make|produce|return) an? json object (?:where|with|in which) (.+?)\.?$/i.exec(t);
    if (pairs) {
      const obj = {};
      for (const part of pairs[1].split(/\s*,\s*(?:and\s+)?|\s+and\s+/)) {
        const kv = /^(?:the )?(?:key )?([A-Za-z_]\w*) (?:is|=|:|set to|equal to|equals|of) (.+)$/i.exec(part.trim());
        if (!kv) return { refuse: 'a key and value the reader cannot read' };
        const v = jsonValue(kv[2]);
        if (!v.ok || Object.prototype.hasOwnProperty.call(obj, kv[1])) return { refuse: 'a value the reader cannot read' };
        obj[kv[1]] = v.v;
      }
      if (!Object.keys(obj).length) return null;
      return { kind: 'format', value: JSON.stringify(obj, null, 2), method: 'format-reader:json', steps: ['keys ' + Object.keys(obj).join(', ')], lang: 'json' };
    }
    return { refuse: 'a JSON shape the reader does not read' };
  }
  // a markdown table
  if (/\bmarkdown table\b/i.test(t)) {
    let cols = null, row = null;
    let tm = /^(?:please )?(?:write|make|create|produce|give me) a markdown table with (?:two|2) columns,? (\w+) and (\w+),? and one row for ([\w-]+) with an? (\w+) of (-?[\w-]+(?:\.\d+)?)\.?$/i.exec(t);
    if (tm) {
      if (tm[4].toLowerCase() !== tm[2].toLowerCase()) return { refuse: 'a row value for a column the table does not have' };
      cols = [tm[1], tm[2]]; row = [tm[3], tm[5]];
    } else if ((tm = /^(?:please )?(?:write|make|create|produce|give me) a markdown table whose header is (\w+) \| (\w+) with a single row:? ([\w-]+),? (-?[\w-]+(?:\.\d+)?)\.?$/i.exec(t))) {
      cols = [tm[1], tm[2]]; row = [tm[3], tm[4]];
    }
    if (!cols) return { refuse: 'a table shape the reader does not read' };
    const out = '| ' + cols.join(' | ') + ' |\n| ' + cols.map(() => '---').join(' | ') + ' |\n| ' + row.join(' | ') + ' |';
    return { kind: 'format', value: out, method: 'format-reader:markdown-table', steps: ['columns ' + cols.join(', '), 'one row'] };
  }
  return null;
}

// ================================================================ the entry point
/** Which reader a prompt belongs to, or null (cheap: regexes only, nothing runs). */
export function codeNativeShape(text) {
  const t = String(text ?? '');
  if (!t.trim() || t.length > LIMITS.text) return null;
  for (const s of READ_SHAPES) if (s.re.test(t.trim())) return 'code-reading';
  if (readRequest(t)) return 'code';
  if (/\bsql\b/i.test(t) || (/\bquery\b/i.test(t) && /\btable\b/i.test(t))) return 'sql';
  if (/\b(?:commands?|shell|terminal|bash|zsh|cli|console)\b/i.test(t) || /\b(?:git|npm|pip)\b/i.test(t) || /^\s*how (?:do|can|would|should) (?:i|you|we)\b/i.test(t)) return 'command';
  if (/\b(?:json object|markdown table|markdown list|bulleted list|numbered list|thousands? separators?|title case|upper ?case|lower ?case|snake ?case|camel ?case|kebab ?case|in digits|in words|DD\/MM|MM\/DD|YYYY)\b/i.test(t)) return 'format';
  return null;
}

function fence(lang) { return lang === 'python' ? 'python' : lang === 'sql' ? 'sql' : lang === 'command' ? 'sh' : lang === 'json' ? 'json' : 'javascript'; }

/**
 * Answer a code, code-reading, SQL, command or format prompt natively, or return null.
 * @param {string} text the prompt
 * @param {object} [opts] catalogue (replaces CATALOGUE, for a test's planted entry), synth (false turns synthesis off),
 *   explain (true: a refusal returns { refused: reason } instead of null)
 * @returns {Promise<object|null>}
 */
export async function codeNative(text, opts = {}) {
  const t0 = process.hrtime.bigint();
  const t = String(text ?? '');
  const refuse = (why) => (opts.explain ? { refused: why, ns: Number(process.hrtime.bigint() - t0) } : null);
  if (!t.trim() || t.length > LIMITS.text) return refuse('empty or too long');
  let r = null;
  try {
    r = await readCodeReading(t);
    if (!r) r = await readCodeRequest(t, opts);
    if (!r) r = readSql(t);
    if (!r) r = readCommand(t);
    if (!r) r = readFormat(t);
  } catch (e) {
    return refuse('a reader threw: ' + String((e && e.message) || e).slice(0, 120));
  }
  if (!r) return refuse('no reader claims the prompt');
  if (r.refuse) return refuse(r.refuse);
  const ns = Number(process.hrtime.bigint() - t0);
  const kind = r.kind;
  const answer = kind === 'code' ? r.code : r.value;
  const who = kind === 'code' ? (r.method.startsWith('example') ? 'example synthesis' : 'the spec reader') : kind === 'code-reading' ? 'running the snippet' : kind === 'sql' ? 'the SQL reader' : kind === 'command' ? 'the command reader' : 'the format reader';
  const head = 'answered natively by ' + who + ' (' + ns + ' ns), with no model and no network.';
  let body;
  if (kind === 'code') body = '```' + fence(r.lang) + '\n' + answer + '\n```';
  else if (kind === 'sql') body = '```sql\n' + answer + '\n```';
  else if (kind === 'command') body = '```sh\n' + answer + '\n```';
  else if (kind === 'format' && r.lang === 'json') body = '```json\n' + answer + '\n```';
  else body = answer;
  return { text: head + '\n' + body, answer, provenance: 'native', route: ROUTE, method: r.method, steps: r.steps, kind, lang: r.lang || null, ns };
}

/** Checks an answer's code against cases in the sandbox (the bench and the tests use it). */
export async function runAnswer(code, entry, tests) {
  const r = await runCases(code, tests.map((x) => ({ args: x.args, expected: x.want })), { entry, limitMs: LIMITS.runMs });
  return { ok: r.failed === 0 && r.passed === tests.length, passed: r.passed, failed: r.failed, error: r.error, cases: r.cases };
}

export { sameValue };
