// mash-direct-g5: a keyboard mash or row walk of 6 or more letters gets a reply that quotes it and asks for a word.
export const meta = { id: 'mash-direct-g5', class: 'mash', generation: 5, lane: 'direct', grownFrom: [], version: 1 };

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

// Words of 6+ letters that carry a mash shape by their own letters and are still words or names: never a mash.
const KNOWN = new Set((
  'abbeyquaye afzelii agdash ahlquist akalla akasaka alaska alfalfa alicja alqosh arcfox armstrong ' +
  'baxxter betzdorf blomquist bojnice boqvist boudewijn boxgrove bozdar breaststroke brecqhou ' +
  'bundesverdienstkreuz champvent chicxulub chivhe coldstream colquitt corkscrew covfefe creutzfeldt ' +
  'cruijff cwmbran dakhla dallas daugavpils dijkstra downstream ecgfrith ernstthal erzgebirgskreis ' +
  'fawwaz fawzia firouzja flasks forcalquier gadjah galahad gallaga gallas gasalla gevherhan ' +
  'goldschmidt gqeberha guadalquivir hadash hadassah haddad hajjaj halakha hamzah hamzat hasakah ' +
  'hassall hellqvist hertzsprung holtzbrinck hovhannes hrazdan hultsfred hurstbridge husqvarna ' +
  'innsbruck istiqlal izquierda izquierdo jadallah jadavpur jadgal jalajala jalsha jhalak jiszda ' +
  'jnanpith jowzjan jyotirao jyutping kafala kalash kalasha kalfas kalkaska kallada kallas karamzin ' +
  'karlskrona khadka khalaf khalsa khudojnazarov khuzdar kladas knightsbridge koffka kricfalusi ladakh ' +
  'lakselvbukt landskrona lefkada lindqvist lindstrom lippspringe looksmaxxing lucjan lufkin lundqvist ' +
  'luqman macfadyen macfarlane maqdis marijnissen marktbreit mejzlikova meritxell midtjylland mkrtchyan ' +
  'mojgan mtskheta mulqueen mxyzptlk naqshbandi nemzeti newquay nimzovich nordstrom nuiqsut nyquist ' +
  'nyqvist offspring ozzfest panjnad pijnacker podorojniy postscript pwllheli qawwali qeqqata ' +
  'qikiqtaaluk rafkin rajneesh rifkin rijndael rijnders romijn sahgal sajjad salads salhad samajwadi ' +
  'samizdat saqqez savvina scottsbluff screwjob shaggs shahada shahjalal shahla shawwal sirajganj ' +
  'skaggs slottsskogsvallen soccsksargen sportswriter srpska stormzy suzdal taqlid taufkirchen ' +
  'telewizja tsawwassen umpqua uppvidinge uruqhart varazdat vazquez velazquez vijfheerenlanden ' +
  'vjekoslav volzhsky wijnberg xzibit yellowjacket yevhen yousafzai yusufzai zdravko zijlstra zvezda ' +
  'zwijndrecht tsktsk tsktsks kampfgruppe srpski innerhtml herbstlich marktplatz llanfairpwllgwyngyll ' +
  'zmrzlina crwths powwow salsas haggadah haggadahs halals halakah haskalah kashas fallals shallal ' +
  'lgbtqi lgbtqia strcpy strncpy strcmp strncmp strncat strstr strchr sqlmap powertype powertypes ' +
  'qyteti qytetit '
).split(/\s+/).filter(Boolean));
const ENDINGS = [['ies', 'y'], ['ing', ''], ['ers', ''], ['es', ''], ['ed', ''], ['er', ''], ['ly', ''], ['s', '']];
function known(s) {
  if (KNOWN.has(s)) return true;
  return ENDINGS.some(([e, add]) => s.length - e.length >= 4 && s.endsWith(e) && KNOWN.has(s.slice(0, -e.length) + add));
}

// Letter pairs no common English word of 6+ letters holds.
const STRANGE = new Set((
  'bq bx cf cg cj cv cx dx fk fq fv fx fz hx jf jg jn jq jw jx jy jz kq lq lx mq mx mz pq pv px qb qc ' +
  'qd qe qf qg qh qj qk ql qm qn qp qr qs qt qv qw qx qy qz sx tq tx vb vf vh vj vm vp vq vv vw vx wj ' +
  'wq ww wx wz xd xg xj xk xr xx xz yq zd zf zj zq zx '
).split(/\s+/).filter(Boolean));

const VOWELS = 'aeiouy';
const ROWS = [['top', 'qwert' + 'yuiop'], ['home', 'asdf' + 'ghjkl'], ['bottom', 'zxcv' + 'bnm']];
const LOW = ROWS.slice(1);
const DIGRAPHS = /th|sh|ch|ph|gh|wh|ck|ng/g;

function consonantRun(s) {
  const t = s.replace(DIGRAPHS, '#');
  let run = 0;
  for (const c of t) { run = VOWELS.includes(c) ? 0 : run + 1; if (run >= 5) return true; }
  return false;
}
function oneRow(s) {
  for (const [name, keys] of LOW) if ([...s].every((c) => keys.includes(c))) return name;
  return null;
}
function rowWalk(s) {
  for (const [name, keys] of ROWS) {
    const back = [...keys].reverse().join('');
    for (let i = 0; i + 5 <= s.length; i++) {
      const k = s.slice(i, i + 5);
      if (keys.includes(k) || back.includes(k)) return name;
    }
  }
  return null;
}
function strangePairs(s) {
  const out = [];
  for (let i = 0; i + 2 <= s.length; i++) { const p = s.slice(i, i + 2); if (STRANGE.has(p) && !out.includes(p)) out.push(p); }
  return out;
}

function read(q) {
  if (typeof q !== 'string') return null;
  const raw = q.trim();
  if (!/^[a-z]{6,}$/i.test(raw)) return null;
  const s = raw.toLowerCase();
  if (known(s)) return null;
  const run = consonantRun(s);
  const row = oneRow(s);
  const walk = rowWalk(s);
  const pairs = strangePairs(s);
  if (!run && !row && !walk && pairs.length === 0) return null;
  return { raw, s, run, row, walk, pairs };
}

export function can(q) {
  return read(q) !== null;
}

const ROW_KEYS = { top: 'q w e r t y u i o p', home: 'a s d f g h j k l', bottom: 'z x c v b n m' };

export function answer(q) {
  const r = read(q);
  if (!r) return null;
  const why = [];
  if (r.row) why.push('every letter sits on the ' + r.row + ' row of the keyboard (' + ROW_KEYS[r.row] + ')');
  else if (r.walk) why.push('it runs along neighbouring keys of the ' + r.walk + ' row of the keyboard in order');
  if (r.run) why.push('it has a run of five or more letters without a single vowel');
  if (r.pairs.length) {
    const ps = r.pairs.slice(0, 2).map((p) => '"' + p + '"');
    why.push('it holds ' + (ps.length > 1 ? 'pairs like ' + ps.join(' and ') : 'the pair ' + ps[0]) + ' that no English word contains');
  }
  const reason = why.length > 1 ? why.slice(0, -1).join(', ') + ', and ' + why[why.length - 1] : why[0];
  return 'You typed "' + r.raw + '". That looks like a keyboard mash rather than a word: ' + reason +
    '. Did you mean to type a real word or ask a question? Type it again and I will answer it.';
}
