// web/src/hud.js: the readouts. Every number on screen was printed by something that ran.
//
// Three surfaces:
//   the STATE block, top left: what was built and what it is costing right now, including
//     the measured build milliseconds and ticks per second;
//   the CONDUIT table, top right: one row per ordered pair of regions, with the edge count
//     of the bundle, the packets per second crossing it, the LATENCY of one hop in ticks
//     and the COST of one hop in measured wall microseconds. Those last two are different
//     quantities and the table keeps them in different columns;
//   the DAEMON rows, under the state block: the served organism's health, read from GET /health
//     (daemon/health.mjs through web/serve.mjs) every few seconds, or "daemon not running";
//   the CELL panel, bottom left: what you clicked. Kind, what that kind does in plain
//     English, its ports, its capability score with the formula that produced it, its
//     region and circuit, its schedule, how many times it has run and its last output.

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};
const f = (v, d) => (Number.isFinite(v) ? v.toFixed(d === undefined ? 1 : d) : '0');
const grp = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export class Hud {
  constructor(root) {
    this.root = root;
    this.state = el('div', 'panel state');
    this.conduits = el('div', 'panel conduits');
    this.cell = el('div', 'panel cell');
    this.cell.style.display = 'none';
    this.help = el('div', 'panel help');
    root.appendChild(this.state);
    root.appendChild(this.conduits);
    root.appendChild(this.cell);
    root.appendChild(this.help);
    this.help.innerHTML = '<b>drag</b> orbit &middot; <b>wheel</b> zoom &middot; <b>click a node</b> inspect &middot;'
      + ' <b>v</b> pipeline view &middot; <b>space</b> pause &middot; <b>s</b> stop the spin';
    this.last = 0;
  }

  /** The block that never changes while an organism is alive. */
  setBuild(org, layoutMs) {
    const g = org.genome;
    this.build = {
      majors: g.majors, cells: org.cells.length, edges: org.connectome.n,
      buildMs: org.buildMs, layoutMs, seed: g.seed,
      duplicates: g.duplicates, claimed: g.claimedPorts,
      regions: g.regions,
    };
  }

  update(engine, scene, force) {
    const t = performance.now();
    if (!force && t - this.last < 120) return;
    this.last = t;
    const b = this.build, s = engine.stats;
    this.state.innerHTML =
      '<div class="ttl">DILATION <span class="dim">/</span> BRAIN</div>'
      + row('majors', grp(b.majors) + ' <span class="dim">circuits</span>')
      + row('cells', grp(b.cells))
      + row('edges', grp(b.edges))
      + row('built in', f(b.buildMs) + ' ms <span class="dim">layout ' + f(b.layoutMs) + ' ms</span>')
      + row('seed', b.seed)
      + '<div class="rule"></div>'
      + row('tick', grp(engine.t))
      + row('ticks / s', f(s.tps))
      + row('cells lit', grp(engine.ranCount) + ' <span class="dim">this tick</span>')
      + row('per cell run', f(s.usPerRun, 2) + ' &micro;s')
      + row('per tick', f(s.usPerTick, 1) + ' &micro;s')
      + row('signals sent', grp(s.signals))
      + row('signals landed', grp(s.delivered))
      + '<div class="rule"></div>'
      + row('view', scene.targetMorph > 0.5 ? 'pipeline' : 'anatomy')
      + (this.daemon || daemonRows(null, 'not asked yet'));

    const rows = engine.conduits.rows.slice(0, 11);
    let h = '<div class="ttl">CONDUITS <span class="dim">' + engine.conduits.rows.length + ' bundles</span></div>'
      + '<table><tr><th>from</th><th>to</th><th class="n">edges</th><th class="n">pkt/s</th>'
      + '<th class="n">hop</th><th class="n">&micro;s/pkt</th></tr>';
    for (const r of rows) {
      h += '<tr><td>' + r.from + '</td><td>' + r.to + '</td><td class="n">' + grp(r.edges)
        + '</td><td class="n">' + f(r.pps, 0) + '</td><td class="n">' + f(r.hopTicks, 1)
        + '</td><td class="n">' + f(r.usPerHop, 2) + '</td></tr>';
    }
    h += '</table><div class="note">two separate numbers: <b>hop</b> is latency in the organism clock, one tick of travel'
      + ' plus the bundle mean delay, and <b>&micro;s/pkt</b> is cost, the measured wall microseconds this engine spends'
      + ' carrying one packet one hop. Waiting in flight is free, so the delay does not enter the cost.</div>';
    this.conduits.innerHTML = h;
  }

  /** The daemon's health as the last poll read it (null when nothing answered). */
  setDaemon(health, why) { this.daemon = daemonRows(health, why); }

  /** Show one cell. Everything here is read off the cell itself. */
  select(cell, engine) {
    if (!cell) { this.cell.style.display = 'none'; return; }
    this.cell.style.display = '';
    const ports = (list) => list.length === 0 ? '<span class="dim">none</span>'
      : list.map(p => '<span class="port">' + p.name + '<span class="dim">:' + p.kinds.join(',') + '</span></span>').join(' ');
    const period = cell.policy.period === 'event' ? 'on arrival'
      : cell.policy.period === 1 ? 'every tick'
        : cell.policy.period >= 3600000 ? (cell.policy.period / 3600000) + ' h'
          : cell.policy.period >= 60000 ? (cell.policy.period / 60000) + ' min'
            : cell.policy.period >= 1000 ? (cell.policy.period / 1000) + ' s' : cell.policy.period + ' ms';
    this.cell.innerHTML =
      '<div class="ttl">' + cell.id + ' <span class="dim">cell ' + cell.idx + '</span></div>'
      + '<div class="kind">' + cell.kind + '</div>'
      + '<div class="doc">' + cell.doc + '</div>'
      + row('region', cell.region)
      + row('circuit', cell.circuit + ' <span class="dim">major ' + cell.major + '</span>')
      + row('in ports', ports(cell.ports.in))
      + row('out ports', ports(cell.ports.out))
      + row('capability', f(cell.cap, 3) + ' <span class="dim">0.55&middot;depth/9 + 0.25&middot;ports/6 + 0.20&middot;kinds/6, depth ' + cell.depth + '</span>')
      + row('schedule', period + ' <span class="dim">priority ' + cell.policy.priority + (cell.policy.learn ? ', ' + cell.policy.learn : '') + '</span>')
      + row('runs', grp(cell.runs) + ' <span class="dim">of ' + grp(engine.t) + ' ticks</span>')
      + row('emitted', grp(cell.fired))
      + row('last ran', cell.lastT < 0 ? '<span class="dim">never</span>' : 'tick ' + grp(cell.lastT))
      + row('last output', cell.fired ? f(cell.out, 4) : '<span class="dim">nothing yet</span>')
      + '<div class="note">press escape to close</div>';
  }
}

function row(k, v) { return '<div class="row"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }

// ---------------------------------------------------------------- the daemon's health
// Everything shown here is a field of the JSON daemon/health.mjs readHealth() returns, read live;
// a field it did not send reads "not reported", never 0.
const hesc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hnum = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? (d === undefined ? grp(v) : v.toFixed(d)) : '<span class="dim">not reported</span>');
function hdur(s) {
  if (typeof s !== 'number' || !Number.isFinite(s)) return '<span class="dim">not reported</span>';
  if (s < 120) return s.toFixed(1) + ' s';
  if (s < 7200) return (s / 60).toFixed(1) + ' min';
  return (s / 3600).toFixed(1) + ' h';
}

/** The rows for the state panel: the health numbers when the daemon runs, else "daemon not running". */
export function daemonRows(h, why) {
  let out = '<div class="rule"></div>';
  if (!h || typeof h !== 'object' || h.ok !== true) {
    out += row('daemon', '<span class="off">daemon not running</span>');
    let note = why ? hesc(why) : '';
    if (h && typeof h === 'object') {
      note = 'health answered, ok false' + (typeof h.restarts === 'number' ? ', restarts ' + h.restarts : '')
        + (typeof h.error === 'string' ? ': ' + hesc(h.error) : '');
    }
    return out + (note ? '<div class="note">' + note + '</div>' : '');
  }
  const cp = h.checkpoint && typeof h.checkpoint === 'object' ? h.checkpoint : null;
  const ns = h.nativeShare && typeof h.nativeShare === 'object' && typeof h.nativeShare.share === 'number' ? h.nativeShare : null;
  out += row('daemon', '<span class="on">running</span>' + (h.instance ? ' <span class="dim">' + hesc(h.instance) + '</span>' : ''))
    + row('daemon tick', hnum(h.tick))
    + row('daemon ticks / s', hnum(h.ticksPerSec, 1))
    + row('uptime', hdur(h.uptimeS))
    + row('restarts', hnum(h.restarts) + ' <span class="dim">budget kills ' + hnum(h.budgetKills) + '</span>')
    + row('daemon rss', hnum(h.rssMb, 1) + ' MB')
    + row('checkpoint', cp ? 'tick ' + hnum(cp.tick) + ' <span class="dim">' + hdur(cp.ageS) + ' old</span>' : '<span class="dim">none yet</span>')
    + row('instances alive', hnum(h.instancesAlive))
    + row('native share', ns ? hnum(ns.share * 100, 2) + ' %' : '<span class="dim">' + hesc(h.nativeReason || 'not reported') + '</span>');
  return out + '<div class="note">from GET /health at ' + hesc(h.at || 'an unreported time') + '</div>';
}

/**
 * Ask the health endpoint once. Resolves { health, why } and never throws: health is the parsed
 * JSON when something answered with an object, else null with the reason.
 */
export function readDaemon(url, timeoutMs, fetchImpl) {
  const get = fetchImpl || (typeof fetch === 'function' ? fetch : null);
  if (!get) return Promise.resolve({ health: null, why: 'this browser has no fetch' });
  const ctl = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = ctl ? setTimeout(function () { ctl.abort(); }, timeoutMs || 2500) : 0;
  return get(url, { cache: 'no-store', signal: ctl ? ctl.signal : undefined })
    .then(function (r) {
      return r.text().then(function (text) {
        let j = null;
        try { j = JSON.parse(text); } catch (e) { j = null; }
        if (!j || typeof j !== 'object' || typeof j.ok !== 'boolean') return { health: null, why: 'nothing answers /health here (HTTP ' + r.status + ')' };
        return { health: j, why: null };
      });
    })
    .catch(function (e) { return { health: null, why: 'no health endpoint answered (' + (e && e.name === 'AbortError' ? 'timed out' : 'unreachable') + ')' }; })
    .then(function (x) { if (timer) clearTimeout(timer); return x; });
}
