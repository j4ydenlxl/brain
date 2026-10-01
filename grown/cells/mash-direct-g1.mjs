// mash-direct-g1: a cell for the failure class "mash" (grow/CONTRACT.md), generation 1, lane direct.
// The site got "jgkafsjka" and refused. This cell answers a keyboard mash: one token of 6 or more letters
// and nothing else (no space, no digit, no punctuation), that is not a real word, and that either has every
// letter on one keyboard row or holds a 4 letter window with no vowel (a e i o u y) that fingers on the keys
// made: its four keys sit on one row, or it holds three neighbouring keys of one row. A cross-row cluster such
// as "mtsk", "ngkh", "tshw", "phth" or "ntln" is how real names and words are spelled, so it is not enough.
// It never claims a real word: a baked word list, an interjection list, a laughter check, a Roman numeral
// check, an acronym check and a syllable check (English, plus the spellings of names from other languages)
// guard it. Pure and synchronous; everything it carries is data in this file.
// Author: arm direct:mash (board 38), 2026-09-30; fixed after the skeptic's re-run the same day.

export const meta = { id: 'mash-direct-g1', class: 'mash', generation: 1, lane: 'direct', grownFrom: ['jgkafsjka'], version: 1 };

export const examples = [
  { q: 'jgkafsjka', expect: { notRefusal: true, minWords: 6, contains: ['"jgkafsjka"'] } },
  { q: 'asdfgh', expect: { notRefusal: true, minWords: 6, contains: ['"asdfgh"'] } },
  { q: 'sdfjkl', expect: { notRefusal: true, minWords: 6, contains: ['"sdfjkl"'] } },
  { q: 'fjdksla', expect: { notRefusal: true, minWords: 6, contains: ['"fjdksla"'] } },
  { q: 'zxcvbn', expect: { notRefusal: true, minWords: 6, contains: ['"zxcvbn"'] } },
  { q: 'lkjhgf', expect: { notRefusal: true, minWords: 6, contains: ['"lkjhgf"'] } },
  { q: 'ghjfkd', expect: { notRefusal: true, minWords: 6, contains: ['"ghjfkd"'] } },
  { q: 'asdfjkl', expect: { notRefusal: true, minWords: 6, contains: ['"asdfjkl"'] } },
];

// The three letter rows of a QWERTY keyboard.
export const ROWS = Object.freeze({ top: 'qwertyuiop', home: 'asdfghjkl', bottom: 'zxcvbnm' });
const ROW_NAME = Object.freeze({
  top: 'top row of the keyboard (q w e r t y u i o p)',
  home: 'home row of the keyboard (a s d f g h j k l)',
  bottom: 'bottom row of the keyboard (z x c v b n m)',
});
const ROW_OF = (() => {
  const m = {};
  for (const [name, keys] of Object.entries(ROWS)) for (const k of keys) m[k] = name;
  return m;
})();

// Real words (and a few names, acronyms and code words) that the shape rules alone would call a mash.
// Lowercase, letters only. The cell must never claim one of these.
export const KNOWN_WORDS = new Set((
  // consonant clusters with no vowel over four letters
  'rhythm rhythms rhythmic strength strengths crypts glyphs nymphs lynx lynxes twelfth twelfths borscht ' +
  'tsktsk tsktsks angst angsts sixth sixths eighth eighths length lengths month months depth depths ' +
  'fifth fifths tenth tenths ninth ninths warmth warmths earthquake earthquakes birthday birthdays ' +
  'lightning instrument instruments landscape landscapes matchbox latchkey catchphrase catchphrases ' +
  'angstrom angstroms schmaltz schmaltzy chutzpah pretzel pretzels waltzes blitzkrieg knightsbridge ' +
  'nietzsche tchaikovsky dijkstra tumblr chatgpt rijksmuseum banffshire tskhinvali songkhla schwarzkopf ' +
  'kampfgruppe zaporizhzhia panjshir ecgfrith pyeongchang bydgoszcz olsztyn lundqvist solskjaer merckx ' +
  'andrzej andhra srpska srpski schneier pakhtunkhwa khrushchev delitzsch mkrtchyan zwijndrecht ' +
  'openbsd netbsd freebsd innerhtml kspread asthma asthmas asthmatic asthmatics isthmus isthmuses ' +
  'yangtze isthmian rocknroll herbst herbstlich marktplatz burckhardt zerbst brundtland cwmbran albrechtsberger nachtmusik ' +
  'bundesverfassungsgericht bundesgerichtshof hochsauerlandkreis vogtlandkreis huitzilopochtli krzysztof szczecin brzezinski zbigniew przemysl llanfairpwllgwyngyll pwllheli ' +
  'zmrzlina rhythmically synths nymph glyph crypt myths mythic psych psychs sylphs lymph lymphs ' +
  'strychnine thyrsus syzygy gypsy gypsys crwths cwtches phlegm phlegms ' +
  // every letter on the top row
  'typewriter typewriters pretty prettier prettiest report reporter reports property territory ' +
  'equity priority poetry writer retire rupture potter pottery puppet puppetry pewter quieter trooper ' +
  'trouper repertoire proprietor perpetuity outwit outwitter router rooter terror yuppie yuppies tiptoe ' +
  'tiptop etiquette pirouette require requite repute petite toupee twitter tweeter terrier retort ' +
  'rioter powwow teeter tipper topper tripper whopper pepper peppery propeller proper poorer outer ' +
  'uproot turtle potpourri pottier tutor tutoree trotter trotters quotient ' +
  // every letter on the home row
  'alaska alaskas salads salsas flasks haggadah haggadahs galahad galahads halals khalsa halakah ' +
  'halakha haskalah kashas fallals shallal ' +
  // every letter on the bottom row (no vowels) and acronyms and code words
  'lgbtq lgbtqi lgbtqia strcpy strncpy strlen strcmp strncmp strcat strncat strtok strstr strchr ' +
  'stdlib stdint stdout stderr systemctl sysctl journalctl kubectl cmdlet cmdlets sqlmap nmcli ' +
  // the name of the keyboard layout is a dictionary word, not a mash
  'qwerty qwertys qwertz azerty ' +
  // a compound and code words with a run of five neighbouring keys or a one-row cluster
  'powertype powertypes squashfs xmlhttprequest ' +
  // top row words spelled with q before a vowel other than u (Albanian "the city")
  'qyteti qytetit'
).split(/\s+/).filter(Boolean));

// Sounds people type on purpose, compared after collapsing every run of one letter to that letter
// ("hmmmmm" to "hm", "shhhhh" to "sh", "aaaaaah" to "ah", "zzzzzz" to "z").
export const INTERJECTIONS = new Set((
  'a e i o u y h m z hm mh mhm sh br gr pst pft pf psh tsk tut ah aha ha hah ugh ug argh arg ag ' +
  'uh um eh meh bleh blah nah na yay ya wo wow oh ow aw ew oy ok omg wtf lol lmao lmfao rofl smh tbh ' +
  'idk brb ty tysm yes ye yeah no nop nope yep yup hey hi yo sup bye phew whew hmph ek ack'
).split(/\s+/).filter(Boolean));

// Acronyms that run into a word as one token (a broadcaster, a league, a format).
export const ACRONYMS = Object.freeze((
  'bbc cbbc nbc cbc cbs cnn cbn abc mbc nhk hbo mtv bmw jfk fbi nsa nba nfl nhl mlb bbq dvd pdf html css xml http www ssh ftp sql php ' +
  'wwe wwf dhl ups kfc hsbc ncaa espn'
).split(' '));

const VOWELS = 'aeiouy';
const AEIOU = 'aeiou';
const CONSONANTS = 'bcdfghjklmnpqrstvwxz';

// English syllable edges: what may start a syllable (ONSET) and what may end one (CODA).
const ONSET = new Set((
  'b c d f g h j k l m n p q r s t v w x y z ' +
  'bl br ch chl chr cl cr dr dw fl fr gh gl gn gr kh kl kn kr kw ph phl phr pl pn pr ps pt rh ' +
  'sc sch schl schm schn schr schw scl scr sh shl shm shn shr sk skr sl sm sn sp sph spl spr sq squ ' +
  'st str sv sw th thr thw tr ts tw vl wh wr zh zw qu dj mn khr gw pf dv ' +
  // starts of names spelled from Tibetan, Norse and Russian (Lhasa, fjord, Solskjaer, Shklovsky)
  'lh fj kj skj shk shkl'
).split(/\s+/).filter(Boolean));
const CODA_BASE = (
  'b c d f g h j k l m n p q r s t v w x y z bb cc dd ff gg ll mm nn pp rr ss tt zz ' +
  'ng nk nt nd nc nch nth nx nz ntz mp mb mn mpt mph lb lc ld lf lk lm ln lp lt lv lch lsh lth lfth lx ' +
  'rb rc rd rf rg rk rl rm rn rp rt rv rz rth rch rsh rst rld rgh rsch ' +
  'st sk sp sm sc sh sch ct ft pt xt ght gh th ch tch tsch ck nck rck ph thm dth fth pth wn wl wd wk wth bt gm gn tz ts ds ks ps ' +
  'kh hn hl hm hr dt ltz rtz rph lph nsch dnt ldnt snt ghtnt stnt nst lst dst mpst ' +
  'ngth lfth xth rth fth ghth rmth mth wth nct xt ngst rpt lpt ndth ndt wnst cht ' +
  // German and Dutch word ends met in compounds (Jagd|flieger, hoofd|klasse)
  'gd fd'
).split(/\s+/).filter(Boolean);
// Inside a word the next syllable starts on an onset English uses inside words ("gh", "ps", "pt" and the
// like start only a whole word); a syllable may end on any coda, plural s included ("thanks|giving").
const WORD_START_ONLY = new Set('gh pn ps pt mn gn dj kh khr sv vl zw dv pf gw lh fj shk shkl'.split(' '));
const ONSET_INSIDE = new Set([...ONSET].filter((o) => !WORD_START_ONLY.has(o)));
const CODA = (() => {
  const out = new Set();
  for (const b of ['', ...CODA_BASE]) for (const s of ['', 's']) if (b + s) out.add(b + s);
  return out;
})();
// Three vowels in a row that English spells (beauty, various, gorgeous, pirouette, adieu, queue).
// Also the vowel runs of names spelled from Vietnamese, Japanese and Dutch (Tuoi, Yoriie, Aoi, Hoei).
const VOWEL3 = new Set('eau iou eou oue ieu eue uee uie oui aie uea ooe eei eoa you uoi iie aoi oei oie eeu ooi uei'.split(' '));
// A cluster of h digraphs is how Persian, Armenian, Georgian and Gaelic names are spelled in Latin letters
// (Bakhsh, Naghsh, Shkhara, Ishkhanyan, Dubhghlas): legal at a start, an end, or inside.
const TRANSLIT = /^(?:[bcdgjkpstz]h){2,3}[lr]?$/;

/** Runs of 3 or more of one letter become one letter ("asdfffff" to "asdf", "thanksss" to "thanks"). */
function squeeze(s) {
  return s.replace(/([a-z])\1{2,}/g, '$1');
}

/** Every run of one letter becomes one letter ("hmm" to "hm"). */
function collapse(s) {
  return s.replace(/([a-z])\1+/g, '$1');
}

/** The row every letter sits on, or null when the letters span rows. */
function oneRow(s) {
  let row = null;
  for (const ch of s) {
    const r = ROW_OF[ch];
    if (!r) return null;
    if (row === null) row = r;
    else if (row !== r) return null;
  }
  return row;
}

/** Three neighbouring keys along one row, either direction ("sdf", "lkj", "cvb"). */
const RUN3 = (() => {
  const out = new Set();
  for (const keys of Object.values(ROWS)) {
    const back = keys.split('').reverse().join('');
    for (const line of [keys, back]) for (let i = 0; i + 3 <= line.length; i++) out.add(line.slice(i, i + 3));
  }
  return out;
})();

/**
 * A 4 letter window with no vowel that fingers on the keys made: its four keys sit on one keyboard row
 * ("sdfj", "xcvb"), or it holds three neighbouring keys of one row ("sdfq" in "asdfqwer").
 * Returns "row", "run" or null ("row" when any window sits on one row).
 */
function rowGap(s) {
  let found = null;
  for (let i = 0; i + 4 <= s.length; i++) {
    const w = s.slice(i, i + 4);
    if (/[aeiouy]/.test(w)) continue;
    if (oneRow(w)) return 'row';
    if (RUN3.has(w.slice(0, 3)) || RUN3.has(w.slice(1))) found = 'run';
  }
  return found;
}

/** A run of five neighbouring keys along one row, either direction ("werty", "poiuy", "sdfgh"). */
function keyRun5(s) {
  for (const keys of Object.values(ROWS)) {
    const back = keys.split('').reverse().join('');
    for (const line of [keys, back]) for (let i = 0; i + 5 <= line.length; i++) if (s.includes(line.slice(i, i + 5))) return true;
  }
  return false;
}

/** Laughter and babble: two letters, one vowel and one consonant, the vowel at least a third ("hahaha", "lalala"). */
function babble(s) {
  const distinct = [...new Set(s)];
  if (distinct.length !== 2) return false;
  const v = distinct.filter((c) => VOWELS.includes(c));
  if (v.length !== 1) return false;
  const nv = s.split('').filter((c) => c === v[0]).length;
  return nv * 3 >= s.length;
}

/** A Roman numeral ("mmxxvi"). */
function roman(s) {
  return /^m{0,4}(?:cm|cd|d?c{0,3})(?:xc|xl|l?x{0,3})(?:ix|iv|v?i{0,3})$/.test(s);
}

/** A surname start inside a run of names ("megan|mccarty", "sean|mcclean"): mc, then an onset or nothing. */
function mcStart(t) {
  return t.startsWith('mc') && (t.length === 2 || ONSET.has(t.slice(2)));
}

/**
 * Whether the letters split into English syllables: every consonant cluster is a legal start, a legal end,
 * or a legal end followed by a legal start, and every vowel run is one English spells.
 * "y" is a consonant between two of a e i o u (or first, before one), else a vowel; "u" after "q" is part of the consonant.
 */
function pronounceable(s) {
  const kind = [];
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (AEIOU.includes(ch)) kind.push(ch === 'u' && i > 0 && s[i - 1] === 'q' ? 'C' : 'V');
    else if (ch === 'y') {
      const before = i === 0 || AEIOU.includes(s[i - 1]);
      const after = i + 1 < s.length && AEIOU.includes(s[i + 1]);
      kind.push(before && after ? 'C' : 'V');
    } else kind.push('C');
  }
  if (!kind.includes('V')) return false;
  if (/q(?!u)/.test(s)) return false;
  const runs = [];
  for (let i = 0; i < s.length;) {
    let j = i;
    while (j < s.length && kind[j] === kind[i]) j++;
    runs.push({ k: kind[i], t: s.slice(i, j) });
    i = j;
  }
  for (let r = 0; r < runs.length; r++) {
    const { k, t } = runs[r];
    if (k === 'V') {
      if (t.length === 2 && t === 'yy') return false;
      if (t.length === 3 && !VOWEL3.has(t)) return false;
      if (t.length >= 4) return false;
      continue;
    }
    const first = r === 0;
    const last = r === runs.length - 1;
    if (TRANSLIT.test(t)) continue;
    if (first && !ONSET.has(t)) return false;
    if (last && !CODA.has(t)) return false;
    if (!first && !last) {
      let ok = false;
      for (let i = 0; i <= t.length && !ok; i++) {
        const head = t.slice(0, i);
        const tail = t.slice(i);
        ok = (head === '' || CODA.has(head)) && (tail === '' || ONSET_INSIDE.has(tail) || mcStart(tail));
      }
      if (!ok) return false;
    }
  }
  return true;
}

/**
 * Read q. Returns { text, row, gap, win } when q is a keyboard mash, else null.
 * text is q trimmed, exactly as typed; row is the one keyboard row it sits on (or null);
 * gap is true when a 4 letter window holds no vowel; win (when row is null) says what that window is:
 * "row" (its four keys sit on one row) or "run" (it holds three neighbouring keys of one row).
 */
function read(q) {
  if (typeof q !== 'string') return null;
  const text = q.trim();
  if (!text || text.length > 120) return null;
  // letters only: a space, a digit or any punctuation (a URL, a path, code) is outside the class
  if (!/^[A-Za-z]+$/.test(text)) return null;
  const letters = text.toLowerCase();
  if (letters.length < 6) return null;
  const sq = squeeze(letters);
  // Dutch "ij" is one vowel (Dijkstra, Rijksmuseum): read it as "iy" for the vowel and syllable rules
  const said = sq.replace(/ij/g, 'iy');
  if (KNOWN_WORDS.has(letters) || KNOWN_WORDS.has(sq)) return null;
  if (INTERJECTIONS.has(collapse(letters))) return null;
  if (babble(letters) || roman(letters)) return null;
  const row = oneRow(sq);
  const gap = /[^aeiouy]{4}/.test(said);
  const win = row ? null : rowGap(said);
  if (!row && !win) return null;
  // Shape alone is not enough: the letters must also fail to split into English syllables (or run along
  // five neighbouring keys), so a pronounceable name such as "dallas" or "typewriter" is never claimed.
  const spoken = pronounceable(said) || (said.startsWith('mc') && pronounceable(said.slice(2)));
  if (spoken && !keyRun5(sq)) return null;
  // An acronym run into a word ("bbcnews", "cnnmoney", "jfklibrary", "wilkinsoncnn") is a name, not a mash.
  for (const a of ACRONYMS) {
    if (said.length - a.length < 3) continue;
    if (said.startsWith(a) && pronounceable(said.slice(a.length))) return null;
    if (said.endsWith(a) && pronounceable(said.slice(0, -a.length))) return null;
  }
  return { text, row, gap, win };
}

export function can(q) {
  return read(q) !== null;
}

export function answer(q) {
  const m = read(q);
  if (!m) return null;
  const quoted = '"' + m.text + '"';
  if (m.row && m.gap) {
    return 'You typed ' + quoted + '. That looks like a keyboard mash: every letter sits on the ' + ROW_NAME[m.row] +
      ', and there is a run of four letters without a single vowel. If you meant to ask something, type it as a question and I will answer it.';
  }
  if (m.row) {
    return 'You typed ' + quoted + '. That looks like a keyboard mash: every letter sits on the ' + ROW_NAME[m.row] +
      ', as if fingers ran along the keys, so it does not read as a word. What would you like to ask? Type a real question and I will answer it.';
  }
  const where = m.win === 'row' ? 'all on one row of the keyboard' : 'with three neighbouring keys of one keyboard row in it';
  return 'You typed ' + quoted + '. That looks like a keyboard mash: it has a run of four letters without a single vowel, ' +
    where + ', so it does not read as a word. What would you like to ask? Type a real question and I will answer it.';
}
