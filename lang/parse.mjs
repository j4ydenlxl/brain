// lang/parse.mjs: text front-end for the sym language (core/signal.mjs S builders).
// parse(text) returns a sym tree exactly as the S builders would build it: same op
// names, same field names (args, name, value, params, fn, fbody, body), numbers as
// exact rationals via S.num of the decimal text.
//
// Grammar (loose to tight):
//   expr       := ifExpr | letExpr | recExpr | fnExpr | orExpr
//   ifExpr     := 'if' expr 'then' expr 'else' expr
//   letExpr    := 'let' ident '=' expr 'in' expr
//   recExpr    := 'rec' ident params '=' expr 'in' expr
//   fnExpr     := 'fn' params expr
//   params     := '(' (ident (',' ident)*)? ')'
//   orExpr     := andExpr ('or' andExpr)*
//   andExpr    := notExpr ('and' notExpr)*
//   notExpr    := 'not' notExpr | cmpExpr
//   cmpExpr    := addExpr (('=' | '!=' | '<' | '<=' | '>' | '>=') addExpr)?
//   addExpr    := mulExpr (('+' | '-') mulExpr)*
//   mulExpr    := unaryExpr (('*' | '/') unaryExpr)*
//   unaryExpr  := '-' unaryExpr | powExpr
//   powExpr    := callExpr ('^' unaryExpr)?          -- right-associative
//   callExpr   := primary ('(' (expr (',' expr)*)? ')')*
//   primary    := NUMBER | 'floor' '(' expr ')' | 'abs' '(' expr ')'
//               | 'mod' '(' expr ',' expr ')' | ident | '(' expr ')'
//
// Fractions like 3/4 are the division operator, not a literal: the number token
// never contains '/'. Line comments start with '#'.

import { S } from '../core/signal.mjs';

const KEYWORDS = new Set(['if', 'then', 'else', 'let', 'in', 'fn', 'rec', 'mod', 'floor', 'abs', 'and', 'or', 'not']);
const CMP_BUILDERS = { '=': S.eq, '!=': S.ne, '<': S.lt, '<=': S.le, '>': S.gt, '>=': S.ge };

function isDigit(c) { return c >= '0' && c <= '9'; }
function isIdentStart(c) { return c !== undefined && /[A-Za-z_]/.test(c); }
function isIdentPart(c) { return c !== undefined && /[A-Za-z0-9_]/.test(c); }

// ---------------------------------------------------------------- tokenizer
function tokenize(text) {
  const tokens = [];
  const n = text.length;
  let i = 0, line = 1, col = 1;
  function adv() { const c = text[i++]; if (c === '\n') { line++; col = 1; } else { col++; } return c; }
  while (i < n) {
    const c = text[i];
    if (c === ' ' || c === '\t' || c === '\r' || c === '\n') { adv(); continue; }
    if (c === '#') { while (i < n && text[i] !== '\n') adv(); continue; }
    const sl = line, sc = col;
    if (isDigit(c) || (c === '.' && isDigit(text[i + 1]))) {
      let s = '';
      while (i < n && isDigit(text[i])) s += adv();
      if (text[i] === '.') { s += adv(); while (i < n && isDigit(text[i])) s += adv(); }
      if (text[i] === 'e' || text[i] === 'E') {
        let j = i + 1;
        if (text[j] === '+' || text[j] === '-') j++;
        if (isDigit(text[j])) {
          s += adv();
          if (text[i] === '+' || text[i] === '-') s += adv();
          while (i < n && isDigit(text[i])) s += adv();
        }
      }
      tokens.push({ type: 'num', value: s, line: sl, col: sc });
      continue;
    }
    if (isIdentStart(c)) {
      let s = '';
      while (i < n && isIdentPart(text[i])) s += adv();
      tokens.push({ type: 'ident', value: s, line: sl, col: sc });
      continue;
    }
    if (c === '!' && text[i + 1] === '=') { adv(); adv(); tokens.push({ type: 'punct', value: '!=', line: sl, col: sc }); continue; }
    if (c === '<' && text[i + 1] === '=') { adv(); adv(); tokens.push({ type: 'punct', value: '<=', line: sl, col: sc }); continue; }
    if (c === '>' && text[i + 1] === '=') { adv(); adv(); tokens.push({ type: 'punct', value: '>=', line: sl, col: sc }); continue; }
    if ('()+-*/^=<>,'.includes(c)) { adv(); tokens.push({ type: 'punct', value: c, line: sl, col: sc }); continue; }
    throw new Error('parse error: unexpected character ' + JSON.stringify(c) + ' at line ' + sl + ', column ' + sc);
  }
  tokens.push({ type: 'eof', value: null, line, col });
  return tokens;
}

// ---------------------------------------------------------------- parser
export function parse(text) {
  const tokens = tokenize(text);
  let pos = 0;
  const peek = () => tokens[pos];
  const isPunct = (v) => { const t = peek(); return t.type === 'punct' && t.value === v; };
  const isIdent = (w) => { const t = peek(); return t.type === 'ident' && t.value === w; };
  const advance = () => tokens[pos++];
  function fail(expected, tok) {
    tok = tok || peek();
    const found = tok.type === 'eof' ? 'end of input' : JSON.stringify(tok.value);
    throw new Error('parse error: expected ' + expected + ' but found ' + found + ' at line ' + tok.line + ', column ' + tok.col);
  }
  function expectPunct(p) { if (!isPunct(p)) fail("'" + p + "'"); return advance(); }
  function expectWord(w) { if (!isIdent(w)) fail("'" + w + "'"); return advance(); }
  function expectName() {
    const t = peek();
    if (t.type !== 'ident' || KEYWORDS.has(t.value)) fail('an identifier');
    return advance().value;
  }

  function parseParams() {
    expectPunct('(');
    const params = [];
    if (!isPunct(')')) {
      params.push(expectName());
      while (isPunct(',')) { advance(); params.push(expectName()); }
    }
    expectPunct(')');
    return params;
  }

  function parseExpr() {
    if (isIdent('if')) return parseIf();
    if (isIdent('let')) return parseLet();
    if (isIdent('rec')) return parseRec();
    if (isIdent('fn')) return parseFn();
    return parseOr();
  }
  function parseIf() {
    expectWord('if'); const c = parseExpr();
    expectWord('then'); const a = parseExpr();
    expectWord('else'); const b = parseExpr();
    return S.if(c, a, b);
  }
  function parseLet() {
    expectWord('let'); const name = expectName();
    expectPunct('='); const value = parseExpr();
    expectWord('in'); const body = parseExpr();
    return S.let(name, value, body);
  }
  function parseRec() {
    expectWord('rec'); const name = expectName();
    const params = parseParams();
    expectPunct('='); const fbody = parseExpr();
    expectWord('in'); const body = parseExpr();
    return S.rec(name, params, fbody, body);
  }
  function parseFn() {
    expectWord('fn');
    const params = parseParams();
    const body = parseExpr();
    return S.fn(params, body);
  }

  function parseOr() {
    let left = parseAnd();
    while (isIdent('or')) { advance(); left = S.or(left, parseAnd()); }
    return left;
  }
  function parseAnd() {
    let left = parseNot();
    while (isIdent('and')) { advance(); left = S.and(left, parseNot()); }
    return left;
  }
  function parseNot() {
    if (isIdent('not')) { advance(); return S.not(parseNot()); }
    return parseCmp();
  }
  function parseCmp() {
    const left = parseAdd();
    const t = peek();
    if (t.type === 'punct' && CMP_BUILDERS[t.value]) {
      advance();
      const right = parseAdd();
      return CMP_BUILDERS[t.value](left, right);
    }
    return left;
  }
  function parseAdd() {
    let left = parseMul();
    for (;;) {
      if (isPunct('+')) { advance(); left = S.add(left, parseMul()); }
      else if (isPunct('-')) { advance(); left = S.sub(left, parseMul()); }
      else break;
    }
    return left;
  }
  function parseMul() {
    let left = parseUnary();
    for (;;) {
      if (isPunct('*')) { advance(); left = S.mul(left, parseUnary()); }
      else if (isPunct('/')) { advance(); left = S.div(left, parseUnary()); }
      else break;
    }
    return left;
  }
  function parseUnary() {
    if (isPunct('-')) { advance(); return S.neg(parseUnary()); }
    return parsePow();
  }
  function parsePow() {
    const base = parseCall();
    if (isPunct('^')) { advance(); const exp = parseUnary(); return S.pow(base, exp); }
    return base;
  }
  function parseCall() {
    let expr = parsePrimary();
    while (isPunct('(')) {
      advance();
      const args = [];
      if (!isPunct(')')) {
        args.push(parseExpr());
        while (isPunct(',')) { advance(); args.push(parseExpr()); }
      }
      expectPunct(')');
      expr = S.call(expr, ...args);
    }
    return expr;
  }
  function parsePrimary() {
    const t = peek();
    if (t.type === 'num') { advance(); return S.num(t.value); }
    if (t.type === 'punct' && t.value === '(') {
      advance();
      const e = parseExpr();
      expectPunct(')');
      return e;
    }
    if (t.type === 'ident') {
      if (t.value === 'floor' || t.value === 'abs') {
        advance();
        expectPunct('(');
        const a = parseExpr();
        expectPunct(')');
        return t.value === 'floor' ? S.floor(a) : S.abs(a);
      }
      if (t.value === 'mod') {
        advance();
        expectPunct('(');
        const a = parseExpr();
        expectPunct(',');
        const b = parseExpr();
        expectPunct(')');
        return S.mod(a, b);
      }
      if (KEYWORDS.has(t.value)) fail('an expression', t);
      advance();
      return S.v(t.value);
    }
    fail('an expression', t);
  }

  const result = parseExpr();
  if (peek().type !== 'eof') fail('end of input');
  return result;
}
