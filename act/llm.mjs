// act/llm.mjs: THE TONGUE. One function, complete(), and one cell kind, 'llm.complete', so
// a language model is a part of the organism's anatomy on the same connectome as every
// other cell, and not a tool call bolted on the side.
//
// Three providers, ordered by how much of the outside world they touch:
//
//   'null'    deterministic and offline: no socket is opened at all. The completion is the
//             prompt's last sentence reversed, so the same input gives the same output
//             forever and a test may assert on the text itself. EVERY TEST IN THIS
//             REPOSITORY USES THIS PROVIDER. It is the one a caller gets when nothing else
//             is reachable, and the result says so in .fellBack and .reason rather than
//             pretending a model answered.
//
//   'ollama'  a local server, http://127.0.0.1:11434 by default, on /api/generate with
//             streaming off. It is used only when a /api/tags probe answers inside
//             probeMs (500 ms by default). The probe's answer is cached per base for the
//             life of the process, so a dead server costs one timeout and not one per
//             call. The model comes from opts.model or from the environment variable
//             BRAIN_LLM_MODEL; with neither, the call falls back to 'null' and says so.
//
//   'env'     a remote provider whose base url and key live in environment variables that
//             THE USER NAMES: opts.envBase and opts.envKey are variable NAMES, never
//             values. The value is read from process.env at request time, placed in one
//             header, and never returned, never logged, never put in an error message.
//             Selected only when opts.provider is 'env', never by default.
//
// THE SECRET RULE, and how it is enforced rather than promised: every string that leaves
// this module (the completion text, a reason, a ledger event) goes through scrub(), which
// replaces the key's value with '[redacted]'. That covers the three ways a key escapes in
// practice: the caller logs the result, an error message quotes the request, or the remote
// server echoes the header back into its own answer. The last one is not hypothetical, and
// it is the one a promise never catches, so it is tested.
//
// compute() stays synchronous, like every cell kind in this codebase. The asynchronous
// completion is kicked off once, its result lands on a plain queue in cell.state, and each
// run drains one item. Nothing here can throw into a tick: a refusal is a value on the
// error port.
import { defineKind, getKind, hasKind } from '../core/cell.mjs';

export const LLM_KIND = 'llm.complete';
export const OLLAMA_BASE = 'http://127.0.0.1:11434';
export const MODEL_ENV = 'BRAIN_LLM_MODEL';
export const PROVIDERS = Object.freeze(['null', 'ollama', 'env']);
export const REDACTED = '[redacted]';

// ---------------------------------------------------------------- scrub
// Replace a secret's value wherever it appears in a string. A short or absent secret is
// left alone: replacing '' would rewrite every character boundary, and a one or two
// character value is not a credential, it is a typo.
export function scrub(s, secret) {
  if (s == null) return s;
  const str = String(s);
  if (!secret || String(secret).length < 4) return str;
  return str.split(String(secret)).join(REDACTED);
}

// ---------------------------------------------------------------- the null provider
// Deterministic, offline, and the reference every test measures against. The last sentence
// of system + prompt, reversed by code point. maxTokens caps the result in characters,
// which is not what a token is anywhere else; it is a cap, not a tokenizer, and it is here
// so that a caller who sets one gets a shorter string from every provider.
export function nullComplete({ prompt = '', system = null, maxTokens = null } = {}) {
  const src = (system ? String(system) + ' ' : '') + String(prompt ?? '');
  const parts = src.split(/(?<=[.!?])\s+/).map((p) => p.trim()).filter(Boolean);
  const last = parts.length ? parts[parts.length - 1] : '';
  let text = [...last].reverse().join('');
  if (Number.isInteger(maxTokens) && maxTokens > 0) text = text.slice(0, maxTokens);
  return text;
}
const countTokens = (text) => String(text ?? '').split(/\s+/).filter(Boolean).length;

function nullResult(opts, started, extra = {}) {
  const text = nullComplete(opts);
  return {
    text, model: 'null', provider: 'null', ms: Date.now() - started, tokens: countTokens(text),
    ok: true, reason: null, fellBack: null, ...extra,
  };
}

// ---------------------------------------------------------------- the probe, cached
// One /api/tags probe per base for the life of the process. The cache holds the promise,
// not the answer, so two calls racing at start up share one probe instead of firing two.
const PROBES = new Map();
export function resetProbeCache() { PROBES.clear(); }
export function probedBases() { return [...PROBES.keys()]; }

export function probeOllama(base = OLLAMA_BASE, probeMs = 500) {
  const key = String(base);
  const hit = PROBES.get(key);
  if (hit) return hit;
  const p = (async () => {
    try {
      const res = await fetchWithTimeout(key.replace(/\/+$/, '') + '/api/tags', { method: 'GET' }, probeMs);
      if (!res.ok) return false;
      await res.text();
      return true;
    } catch {
      return false;
    }
  })();
  PROBES.set(key, p);
  return p;
}

function fetchWithTimeout(url, init, ms) {
  let ac = null, timer = null;
  try { ac = new AbortController(); } catch { ac = null; }
  if (ac) timer = setTimeout(() => { try { ac.abort(); } catch { /* already settled */ } }, ms);
  const done = fetch(url, ac ? { ...init, signal: ac.signal } : init);
  return done.finally(() => { if (timer) clearTimeout(timer); });
}

// ---------------------------------------------------------------- complete()
/**
 * One completion, from whichever provider the options and the machine allow.
 * Never throws: a failure is { ok: false, reason } with the text from the null provider,
 * so a caller that only reads .text still gets a string.
 *
 * @param {object} opts
 *   prompt, system, maxTokens, seed    the request
 *   provider   'null' | 'ollama' | 'env'; absent means 'null' (nothing is reached for
 *              unless the caller asks, which is why a test can never surprise a network)
 *   model      the model name; for 'ollama', process.env.BRAIN_LLM_MODEL is the fallback
 *   base       override the ollama base url (a test fixture on 127.0.0.1)
 *   timeoutMs  request timeout, default 30000
 *   probeMs    /api/tags probe timeout, default 500
 *   envBase    the NAME of the environment variable holding the remote base url
 *   envKey     the NAME of the environment variable holding the key
 *   envHeader  the header the key is sent in, default 'authorization'
 *   envScheme  what precedes the key in that header, default 'Bearer '
 *   envPath    the path appended to the base, default '/chat/completions'
 * @returns {Promise<{text, model, provider, ms, tokens, ok, reason, fellBack}>}
 */
export async function complete(opts = {}) {
  const started = Date.now();
  const provider = opts.provider == null ? 'null' : String(opts.provider);
  if (!PROVIDERS.includes(provider)) {
    return nullResult(opts, started, { ok: false, reason: 'unknown provider ' + provider + ': one of ' + PROVIDERS.join(', '), fellBack: provider });
  }
  if (provider === 'null') return nullResult(opts, started);
  if (provider === 'env') return envComplete(opts, started);
  return ollamaComplete(opts, started);
}

// ---------------------------------------------------------------- ollama
async function ollamaComplete(opts, started) {
  const base = String(opts.base || OLLAMA_BASE).replace(/\/+$/, '');
  const model = opts.model || process.env[MODEL_ENV] || null;
  if (!model) {
    return nullResult(opts, started, { ok: false, fellBack: 'ollama', reason: 'no model: pass opts.model or set ' + MODEL_ENV });
  }
  const probeMs = Number.isFinite(opts.probeMs) ? opts.probeMs : 500;
  const up = await probeOllama(base, probeMs);
  if (!up) {
    return nullResult(opts, started, { ok: false, fellBack: 'ollama', reason: 'no ollama at ' + base + ': /api/tags did not answer within ' + probeMs + ' ms' });
  }
  const body = {
    model, prompt: String(opts.prompt ?? ''), stream: false,
    keep_alive: opts.keepAlive || '30m',
    options: {},
  };
  if (opts.system) body.system = String(opts.system);
  // think is passed through untouched. It is NOT defaulted to false: a reasoning model does
  // not stop reasoning when told to, it stops SEPARATING the reasoning, and the chain of
  // thought lands in the answer (notes/act.md).
  if (opts.think !== undefined) body.think = opts.think;
  if (Number.isFinite(opts.numCtx)) body.options.num_ctx = opts.numCtx;
  if (Number.isInteger(opts.maxTokens) && opts.maxTokens > 0) body.options.num_predict = opts.maxTokens;
  if (Number.isInteger(opts.seed)) body.options.seed = opts.seed;
  const timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : 30_000;
  try {
    const res = await fetchWithTimeout(base + '/api/generate', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
    }, timeoutMs);
    const raw = await res.text();
    if (!res.ok) {
      return nullResult(opts, started, { ok: false, fellBack: 'ollama', reason: 'ollama answered ' + res.status });
    }
    let j;
    try { j = JSON.parse(raw); } catch { return nullResult(opts, started, { ok: false, fellBack: 'ollama', reason: 'ollama answered ' + raw.length + ' bytes that are not json' }); }
    const text = String(j.response ?? '');
    return {
      text, model: j.model || model, provider: 'ollama', ms: Date.now() - started,
      tokens: Number.isFinite(j.eval_count) ? j.eval_count : countTokens(text),
      ok: true, reason: null, fellBack: null,
      thinking: typeof j.thinking === 'string' && j.thinking ? j.thinking : null,
      promptTokens: Number.isFinite(j.prompt_eval_count) ? j.prompt_eval_count : null,
    };
  } catch (err) {
    return nullResult(opts, started, { ok: false, fellBack: 'ollama', reason: 'ollama request failed: ' + String(err && err.message || err) });
  }
}

// ---------------------------------------------------------------- env
// The only provider that touches a credential, and it never sees one as an argument: it is
// handed the NAME of an environment variable and reads the value at request time.
async function envComplete(opts, started) {
  const baseName = opts.envBase ? String(opts.envBase) : null;
  const keyName = opts.envKey ? String(opts.envKey) : null;
  if (!baseName) return nullResult(opts, started, { ok: false, fellBack: 'env', reason: 'env provider needs opts.envBase: the NAME of the variable holding the base url' });
  const base = process.env[baseName];
  if (!base) return nullResult(opts, started, { ok: false, fellBack: 'env', reason: 'environment variable ' + baseName + ' is not set' });
  const key = keyName ? process.env[keyName] : null;
  if (keyName && !key) return nullResult(opts, started, { ok: false, fellBack: 'env', reason: 'environment variable ' + keyName + ' is not set' });
  // Everything below may touch the key, so every exit from here is scrubbed.
  const safe = (s) => scrub(s, key);
  const url = String(base).replace(/\/+$/, '') + (opts.envPath || '/chat/completions');
  const model = opts.model || process.env[MODEL_ENV] || 'default';
  const headers = { 'content-type': 'application/json' };
  if (key) headers[String(opts.envHeader || 'authorization')] = (opts.envScheme === undefined ? 'Bearer ' : String(opts.envScheme)) + key;
  const messages = [];
  if (opts.system) messages.push({ role: 'system', content: String(opts.system) });
  messages.push({ role: 'user', content: String(opts.prompt ?? '') });
  const body = { model, messages, stream: false };
  if (Number.isInteger(opts.maxTokens) && opts.maxTokens > 0) body.max_tokens = opts.maxTokens;
  if (Number.isInteger(opts.seed)) body.seed = opts.seed;
  const timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : 30_000;
  try {
    const res = await fetchWithTimeout(url, { method: 'POST', headers, body: JSON.stringify(body) }, timeoutMs);
    const raw = await res.text();
    if (!res.ok) return nullResult(opts, started, { ok: false, fellBack: 'env', reason: safe('provider at ' + baseName + ' answered ' + res.status) });
    let j;
    try { j = JSON.parse(raw); } catch { return nullResult(opts, started, { ok: false, fellBack: 'env', reason: 'provider at ' + baseName + ' answered ' + raw.length + ' bytes that are not json' }); }
    const choice = Array.isArray(j.choices) && j.choices.length ? j.choices[0] : null;
    // The server's own words are scrubbed too: a provider that echoes the authorization
    // header into its answer would otherwise hand the key straight back to the caller.
    const text = safe(String((choice && choice.message && choice.message.content) ?? (choice && choice.text) ?? j.response ?? ''));
    const usage = j.usage || {};
    return {
      text, model: safe(String(j.model || model)), provider: 'env', ms: Date.now() - started,
      tokens: Number.isFinite(usage.completion_tokens) ? usage.completion_tokens : countTokens(text),
      ok: true, reason: null, fellBack: null,
      promptTokens: Number.isFinite(usage.prompt_tokens) ? usage.prompt_tokens : null,
    };
  } catch (err) {
    return nullResult(opts, started, { ok: false, fellBack: 'env', reason: safe('request to ' + baseName + ' failed: ' + String(err && err.message || err)) });
  }
}

// ---------------------------------------------------------------- the cell kind
// A queue that forgets its oldest item rather than growing without bound, and a drain that
// hands one item to the ports per run. Same discipline as world/actuators.mjs, written here
// rather than imported so that registering this kind does not register eight others.
function push(st, item, max) {
  st.queue.push(item);
  while (st.queue.length > max) { st.queue.shift(); st.dropped++; }
}
function logEvent(ctx, ev) {
  if (ctx && ctx.brain && typeof ctx.brain.log === 'function') return ctx.brain.log(ev);
  if (ctx && ctx.ledger) return ctx.ledger.append(ev);
  return -1;
}

/**
 * Register the 'llm.complete' cell kind with core. Idempotent: a second call returns the
 * kind already defined rather than throwing, so any number of modules may ask for it.
 *
 * in  'in'    an event carrying { text } or { prompt }, and optionally system, provider,
 *             model, maxTokens, seed, origin
 * out 'out'   an event { origin: 'llm', text, prompt, provider, model, ms, tokens, of,
 *             tainted } where `of` is the provenance of the input text and `tainted` is
 *             true when that input came from the web. A completion inherits the taint of
 *             what it was computed from: this is the surface's provenance rule, and it is
 *             the reason a model's answer about a fetched page can never be mistaken for
 *             an instruction from the user.
 * out 'error' an event { error: true, reason, provider } for a request that did not land.
 */
export function registerLLMKind() {
  if (hasKind(LLM_KIND)) return getKind(LLM_KIND);
  return defineKind(LLM_KIND, {
    doc: 'Turns an input event carrying text into a completion event through act/llm.mjs. The provider is chosen per cell or per signal; the default is the deterministic offline one, so a cell that nobody configured never opens a socket.',
    ports: {
      in: [{ name: 'in', kinds: ['event'] }],
      out: [{ name: 'out', kinds: ['event'] }, { name: 'error', kinds: ['event'] }],
    },
    defaults: {
      provider: 'null', model: null, base: null, system: null, maxTokens: null, seed: null,
      timeoutMs: null, probeMs: null, envBase: null, envKey: null, envHeader: null, envPath: null,
      queueMax: 32, keep: 16,
    },
    init: () => ({ queue: [], inflight: 0, asked: 0, answered: 0, failed: 0, dropped: 0 }),
    compute: (ins, cell, ctx) => {
      const p = cell.params, st = cell.state;
      for (const it of ins[0]) {
        const sig = it.sig, d = (sig && sig.data) || {};
        const prompt = d.text ?? d.prompt ?? '';
        if (!String(prompt)) {
          push(st, { error: true, reason: 'no text on the input event', provider: d.provider || p.provider }, p.queueMax);
          continue;
        }
        const opts = {
          prompt: String(prompt),
          system: d.system ?? p.system,
          maxTokens: d.maxTokens ?? p.maxTokens,
          seed: d.seed ?? p.seed,
          provider: d.provider ?? p.provider,
          model: d.model ?? p.model,
          base: d.base ?? p.base,
          timeoutMs: p.timeoutMs ?? undefined,
          probeMs: p.probeMs ?? undefined,
          envBase: p.envBase ?? undefined,
          envKey: p.envKey ?? undefined,
          envHeader: p.envHeader ?? undefined,
          envPath: p.envPath ?? undefined,
        };
        const of = d.origin ?? null;
        const tainted = of === 'web' || d.tainted === true;
        st.asked++; st.inflight++;
        // Never awaited by compute: the answer lands on the queue and the next run drains it.
        complete(opts).then((r) => {
          st.inflight--;
          if (r.ok) st.answered++; else st.failed++;
          // The ledger records what was asked of whom and how it went. It records no
          // prompt, no completion and no header, so there is nothing in it to redact.
          logEvent(ctx, {
            type: r.ok ? 'llm.complete' : 'llm.failed', cell: cell.id,
            provider: r.provider, model: r.model, ms: r.ms, tokens: r.tokens,
            promptChars: String(prompt).length, ok: r.ok, reason: r.reason, fellBack: r.fellBack,
            of, tainted,
          });
          push(st, {
            out: {
              kind: 'event',
              data: {
                origin: 'llm', text: r.text, prompt: String(prompt), provider: r.provider,
                model: r.model, ms: r.ms, tokens: r.tokens, ok: r.ok, reason: r.reason,
                fellBack: r.fellBack, of, tainted,
              },
            },
          }, p.queueMax);
        }).catch((err) => {
          st.inflight--; st.failed++;
          push(st, { error: true, reason: String(err && err.message || err), provider: opts.provider }, p.queueMax);
        });
        cell.memory.working.push({ t: sig.t, chars: String(prompt).length, of });
        if (cell.memory.working.length > p.keep) cell.memory.working.shift();
      }
      if (!st.queue.length) return [null, null];
      const item = st.queue.shift();
      if (item.error) return [null, { kind: 'event', data: { error: true, reason: item.reason || null, provider: item.provider || null } }];
      return [item.out, null];
    },
    // A completion waiting in the queue is text from outside this process. The ask and the
    // outcome are already in the ledger, which is where that history belongs.
    serialize: (s) => ({ ...s, queue: [], queuedAtSnapshot: s.queue.length }),
    cost: 2,
  });
}
