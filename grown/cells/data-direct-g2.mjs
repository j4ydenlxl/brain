// data-direct-g2: one statistic or transform over a small list given in the prompt.
export const meta = { id: 'data-direct-g2', class: 'data', generation: 2, lane: 'direct', grownFrom: ["the mean of 4, 8, 15, 16, 23, 42","median of 3, 9, 1, 7","sort these numbers descending: 5, 2, 9, 1","convert to json: name=Ann, age=30","what is the average of 10, 20, 30","the mode of 1, 2, 2, 3","the range of 4, 9, 1","count the words in: the cat sat on the mat","sum of 1.5, 2.5, 3"], version: 1 };

export const examples = [
  {"q":"the mean of 4, 8, 15, 16, 23, 42","expect":{"contains":["18"],"notRefusal":true,"maxWords":60}},
  {"q":"median of 3, 9, 1, 7","expect":{"contains":["5"],"notRefusal":true,"maxWords":60}},
  {"q":"sort these numbers descending: 5, 2, 9, 1","expect":{"contains":["9, 5, 2, 1"],"notRefusal":true,"maxWords":60}},
  {"q":"convert to json: name=Ann, age=30","expect":{"contains":["\"name\"","Ann","\"age\"","30"],"notRefusal":true,"maxWords":60}},
  {"q":"what is the average of 10, 20, 30","expect":{"contains":["20"],"notRefusal":true,"maxWords":60}},
  {"q":"the mode of 1, 2, 2, 3","expect":{"contains":["2"],"notRefusal":true,"maxWords":60,"notContains":["mode is 1","mode is 3"]}},
  {"q":"the range of 4, 9, 1","expect":{"contains":["8"],"notRefusal":true,"maxWords":60}},
  {"q":"count the words in: the cat sat on the mat","expect":{"contains":["6"],"notRefusal":true,"maxWords":60}},
  {"q":"sum of 1.5, 2.5, 3","expect":{"contains":["7"],"notRefusal":true,"maxWords":60}}
];

const NUM = '[-−]?(?:\\d+(?:\\.\\d+)?|\\.\\d+)';
const SEP = '(?:\\s*(?:,|;|\\||/|&|\\band\\b|\\bor\\b)\\s*(?:\\band\\b\\s*)?|\\s+)';
const RUN = new RegExp('(?<![\\w.])' + NUM + '(?:' + SEP + NUM + ')+(?![\\w.])', 'g');

const OPS = [
  ['stdev', /\b(?:standard deviation|std\.? ?dev|stdev|stddev|sd)\b/],
  ['variance', /\bvariance\b/],
  ['median', /\bmedian\b/],
  ['mode', /\b(?:mode|most (?:common|frequent)|appears most)\b/],
  ['mean', /\b(?:mean|average|avg|arithmetic mean)\b/],
  ['range', /\brange\b/],
  ['sortdesc', /\b(?:sort|order|arrange|rank|list)\b[^.?!]*\b(?:desc(?:ending)?|largest (?:to|first)|biggest (?:to|first)|highest (?:to|first)|greatest (?:to|first)|reverse order|decreasing)\b|\b(?:desc(?:ending)?|decreasing) order\b/],
  ['sortasc', /\b(?:sort|order|arrange|rank)\b|\b(?:asc(?:ending)?|increasing) order\b/],
  ['sum', /\b(?:sum|total|add up|adding up|add together|added together)\b/],
  ['product', /\bproduct\b/],
  ['max', /\b(?:max(?:imum)?|largest|biggest|highest|greatest)\b/],
  ['min', /\b(?:min(?:imum)?|smallest|lowest|least)\b/],
  ['count', /\b(?:how many (?:numbers|values|items|elements|entries)|count (?:of|the) (?:numbers|values|items|elements)|count of)\b/],
  ['reverse', /\breverse\b/],
  ['unique', /\b(?:unique|distinct|dedupe|deduplicate|remove duplicates)\b/],
];

function low(q) { return String(q == null ? '' : q).toLowerCase().replace(/−/g, '-').trim(); }

function decimals(s) { const m = /\.(\d+)/.exec(s); return m ? m[1].length : 0; }

function trimNum(x, d) {
  if (!isFinite(x)) return String(x);
  let s = x.toFixed(d);
  if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
  if (s === '-0') s = '0';
  return s;
}

// exact value up to the inputs' precision (at least 4 places), with a one decimal rounding beside it when longer
function fmt(x, inDec) {
  const exact = trimNum(x, Math.max(4, inDec || 0));
  const dec = decimals(exact);
  if (dec <= 1) return exact;
  if (dec <= (inDec || 0)) return exact;
  const one = trimNum(Math.round(x * 10) / 10, 1);
  return exact + ' (about ' + one + ')';
}
function plain(x, inDec) { return trimNum(x, Math.max(4, inDec || 0)); }

function numbersOf(text) {
  const runs = text.match(RUN);
  if (!runs) return null;
  let best = runs[0];
  for (const r of runs) if (r.length > best.length) best = r;
  const toks = best.match(new RegExp(NUM, 'g')) || [];
  if (toks.length < 2) return null;
  return toks.map(t => t.replace(/−/, '-'));
}

function hasArith(t) {
  return /\d\s*[+*\/^×÷=<>%]\s*[-\d(]/.test(t.replace(/(\d)\s*\/\s*(\d)/g, (m, a, b) => a + ', ' + b)) ||
    /\b(?:times|plus|minus|divided|multiplied|squared|cubed|percent|solve|equation|derivative|integral|x\s*=)\b/.test(t);
}

function arithLead(t) {
  return /^(?:(?:please|hey|ok|okay|so|and|now|then|quick|quickly|just)\s+)*(?:(?:can|could|would|will)\s+you\s+(?:please\s+)?)?(?:(?:tell|show)\s+me\s+)?(?:what|whats|what's|how\s+much|how\s+many)\s+(?:is|are|was|were|does|do|will|would)?\s*the\s+(?:sum|total|product)\s+(?:of|to|for)\s/.test(t);
}

// ---- words and json shapes
function quotedOrAfter(q) {
  const s = String(q);
  const qm = /["“']([^"”']+)["”']/.exec(s);
  const ci = s.indexOf(':');
  if (ci >= 0 && s.slice(ci + 1).trim()) return s.slice(ci + 1).trim();
  if (qm) return qm[1];
  const m = /\b(?:in|of)\s+(?:the\s+)?(?:text|sentence|phrase|string)?\s*(.+)$/i.exec(s);
  return m ? m[1].trim() : null;
}

function wordShape(t) {
  if (!/\b(?:count|how many|number of|word count|tally)\b/.test(t)) return null;
  if (/\bwords?\b/.test(t)) return 'words';
  if (/\b(?:characters|chars|letters)\b/.test(t)) return 'chars';
  if (/\bvowels\b/.test(t)) return 'vowels';
  return null;
}

function wordAnswer(q, kind) {
  const text = quotedOrAfter(q);
  if (!text) return null;
  const words = text.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w));
  if (kind === 'words') {
    if (!words.length) return null;
    return 'There are ' + words.length + ' word' + (words.length === 1 ? '' : 's') + ' in "' + clip(text) + '".';
  }
  if (kind === 'chars') {
    const letters = (text.match(/\p{L}/gu) || []).length;
    const all = [...text].length;
    const nospace = [...text.replace(/\s+/g, '')].length;
    if (/\bletters\b/.test(low(q))) return 'There are ' + letters + ' letters in "' + clip(text) + '".';
    return 'There are ' + all + ' characters in "' + clip(text) + '" (' + nospace + ' without spaces).';
  }
  const v = (text.match(/[aeiou]/gi) || []).length;
  return 'There are ' + v + ' vowels in "' + clip(text) + '".';
}
function clip(s) { const w = s.split(/\s+/); return w.length > 30 ? w.slice(0, 30).join(' ') + '...' : s; }

function jsonBody(q) {
  const s = String(q);
  const ci = s.indexOf(':');
  let body = ci >= 0 ? s.slice(ci + 1) : (/\bjson\b\s*(.*)$/i.exec(s) || [])[1];
  if (!body) return null;
  body = body.trim().replace(/^[{(\[]|[})\]]$/g, '').trim();
  const parts = body.split(/\s*(?:,|;|&|\n)\s*/).filter(Boolean);
  if (!parts.length) return null;
  const obj = {};
  for (const p of parts) {
    const m = /^["']?([^=:"']+?)["']?\s*(?:=|:|->|=>)\s*(.*)$/.exec(p.trim());
    if (!m) return null;
    const k = m[1].trim();
    if (!k) return null;
    obj[k] = valueOf(m[2].trim());
  }
  return obj;
}
function valueOf(v) {
  const u = v.replace(/^["']|["']$/g, '');
  if (u !== v) return u;
  if (/^-?(?:\d+(?:\.\d+)?|\.\d+)(?:e[-+]?\d+)?$/i.test(v) && !/^-?0\d/.test(v)) return Number(v);
  if (/^(?:true|false)$/i.test(v)) return v.toLowerCase() === 'true';
  if (/^null$/i.test(v)) return null;
  return v;
}
function jsonShape(t) { return /\bjson\b/.test(t) && /\b(?:convert|turn|format|make|render|write|express|output|give|as|to|into|in)\b/.test(t); }

// ---- the list shape
function listOp(t) {
  for (const [name, re] of OPS) if (re.test(t)) return name;
  return null;
}

function parse(q) {
  const t = low(q);
  if (!t || t.length > 2000) return null;
  if (jsonShape(t)) { const o = jsonBody(q); return o && Object.keys(o).length ? { kind: 'json', obj: o } : null; }
  const w = wordShape(t);
  if (w && /:|["“']/.test(String(q))) return { kind: 'words', w };
  const op = listOp(t);
  if (!op) return null;
  const nums = numbersOf(t);
  if (!nums) {
    if ((op === 'sortasc' || op === 'sortdesc' || op === 'reverse' || op === 'unique') && t.indexOf(':') >= 0) {
      const items = String(q).slice(String(q).indexOf(':') + 1).split(/\s*(?:,|;)\s*(?:and\s+)?|\s+and\s+/).map(s => s.trim().replace(/[.?!]$/, '')).filter(Boolean);
      if (items.length >= 2 && items.every(s => s.split(/\s+/).length <= 4)) return { kind: 'items', op, items };
    }
    return null;
  }
  if (hasArith(t)) return null;
  // the organism's exact reader already answers "what is the sum of 2, 4, 6" and "the sum of 2 and 3": leave those to it
  if ((op === 'sum' || op === 'product') && (arithLead(t) || (/\d\s+and\s+-?\.?\d/.test(t) && !/\d\s*,/.test(t)))) return null;
  return { kind: 'list', op, nums };
}

export function can(q) {
  try { return parse(q) !== null; } catch { return false; }
}

function listAnswer(op, toks) {
  const xs = toks.map(Number);
  const inDec = Math.max(...toks.map(decimals));
  const n = xs.length;
  const sum = xs.reduce((a, b) => a + b, 0);
  const sorted = xs.slice().sort((a, b) => a - b);
  const show = arr => arr.map(x => plain(x, inDec)).join(', ');
  const mean = sum / n;
  switch (op) {
    case 'mean': return 'The mean is ' + fmt(mean, inDec) + ': the sum ' + plain(sum, inDec) + ' divided by ' + n + ' values.';
    case 'median': {
      if (n % 2) return 'The median is ' + fmt(sorted[(n - 1) / 2], inDec) + ', the middle value once sorted.';
      const a = sorted[n / 2 - 1], b = sorted[n / 2];
      return 'The median is ' + fmt((a + b) / 2, inDec) + ', the average of the two middle values ' + plain(a, inDec) + ' and ' + plain(b, inDec) + '.';
    }
    case 'mode': {
      const c = new Map();
      for (const x of xs) c.set(x, (c.get(x) || 0) + 1);
      const top = Math.max(...c.values());
      if (top === 1) return 'There is no mode: each of the ' + n + ' values appears once.';
      const modes = [...c.keys()].filter(k => c.get(k) === top).sort((a, b) => a - b);
      if (modes.length === 1) return 'The mode is ' + plain(modes[0], inDec) + ', appearing ' + top + ' times.';
      return 'The modes are ' + modes.map(x => plain(x, inDec)).join(' and ') + ', each appearing ' + top + ' times.';
    }
    case 'range': return 'The range is ' + plain(sorted[n - 1] - sorted[0], inDec) + ': the largest ' + plain(sorted[n - 1], inDec) + ' minus the smallest ' + plain(sorted[0], inDec) + '.';
    case 'sum': return 'The sum is ' + plain(sum, inDec) + '.';
    case 'product': return 'The product is ' + plain(xs.reduce((a, b) => a * b, 1), inDec * n) + '.';
    case 'max': return 'The largest is ' + plain(sorted[n - 1], inDec) + '.';
    case 'min': return 'The smallest is ' + plain(sorted[0], inDec) + '.';
    case 'count': return 'There are ' + n + ' numbers.';
    case 'sortasc': return 'Ascending: ' + show(sorted) + '.';
    case 'sortdesc': return 'Descending: ' + show(sorted.slice().reverse()) + '.';
    case 'reverse': return 'Reversed: ' + show(xs.slice().reverse()) + '.';
    case 'unique': return 'Distinct values: ' + show([...new Set(xs)]) + '.';
    case 'variance':
    case 'stdev': {
      const ss = xs.reduce((a, x) => a + (x - mean) * (x - mean), 0);
      const pv = ss / n, sv = n > 1 ? ss / (n - 1) : 0;
      if (op === 'variance') return 'The population variance is ' + fmt(pv, inDec) + '; the sample variance is ' + fmt(sv, inDec) + '.';
      return 'The population standard deviation is ' + fmt(Math.sqrt(pv), inDec) + '; the sample standard deviation is ' + fmt(Math.sqrt(sv), inDec) + '.';
    }
  }
  return null;
}

function itemsAnswer(op, items) {
  const cmp = (a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' });
  if (op === 'sortasc') return 'Sorted: ' + items.slice().sort(cmp).join(', ') + '.';
  if (op === 'sortdesc') return 'Sorted descending: ' + items.slice().sort(cmp).reverse().join(', ') + '.';
  if (op === 'reverse') return 'Reversed: ' + items.slice().reverse().join(', ') + '.';
  if (op === 'unique') return 'Distinct: ' + [...new Set(items)].join(', ') + '.';
  return null;
}

export function answer(q) {
  try {
    const p = parse(q);
    if (!p) return null;
    let out = null;
    if (p.kind === 'json') out = JSON.stringify(p.obj);
    else if (p.kind === 'words') out = wordAnswer(q, p.w);
    else if (p.kind === 'items') out = itemsAnswer(p.op, p.items);
    else out = listAnswer(p.op, p.nums);
    if (!out) return null;
    if (out.split(/\s+/).filter(Boolean).length > 60) return null;
    return out;
  } catch { return null; }
}
