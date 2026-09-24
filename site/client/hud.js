// client/hud.js - the instruments. Numbers top left, region legend, the cell panel, and
// the 60 second activity strip along the bottom. Plain DOM and a 2D canvas: the GPU is
// busy with the brain.

const fmt = (v) => {
  if (v == null || Number.isNaN(v)) return '0';
  if (Math.abs(v) >= 1e9) return (v / 1e9).toFixed(2) + 'B';
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(2) + 'M';
  if (Math.abs(v) >= 1e4) return (v / 1e3).toFixed(1) + 'k';
  return String(Math.round(v));
};

export class HUD {
  constructor(root) {
    this.root = root;
    this.el = {};
    for (const k of ['name', 't', 'gen', 'cells', 'edges', 'runs', 'signals', 'proposals', 'fps', 'status', 'legend', 'legendtitle', 'flight', 'panel', 'panelBody', 'panelTitle', 'strip', 'mode']) {
      this.el[k] = root.querySelector('#' + k);
    }
    this.strip = this.el.strip;
    this.sctx = this.strip.getContext('2d');
    this.regions = [];
    this.regionOf = null;      // cell idx -> region index
    this.buckets = [];         // [regionIndex][60]
    this.bucketAt = Math.floor(Date.now() / 1000);
    this.cursor = 0;
    this.SPAN = 60;
    // Signals emitted per region: the throughput of each pipeline stage. These are the
    // brain's own counters. Every signal event the ledger records is attributed to the
    // cell that emitted it, and a cell belongs to exactly one region.
    this.sigAcc = null; this.sigRate = null; this.sigT = performance.now();
    this.el.panel.addEventListener('click', (e) => { if (e.target.dataset.close !== undefined) this.hideCell(); });
  }

  setGraph(g) {
    this.regions = g.regions.map(r => ({ name: r.name, color: r.color, cells: r.cells }));
    const index = new Map(this.regions.map((r, i) => [r.name, i]));
    this.regionOf = new Int16Array(g.n).fill(-1);
    for (const c of g.meta) this.regionOf[c.idx] = index.has(c.region) ? index.get(c.region) : -1;
    this.buckets = this.regions.map(() => new Float32Array(this.SPAN));
    this.sigAcc = new Float64Array(this.regions.length);
    this.sigRate = new Float64Array(this.regions.length);
    this.sigT = performance.now();
    this.el.name.textContent = g.name;
    this.el.legend.innerHTML = '';
    for (const r of this.regions) {
      const row = document.createElement('div');
      row.className = 'legend-row';
      row.innerHTML = '<span class="swatch" style="background:' + r.color + '"></span><span class="lname"></span><span class="lcount"></span>';
      row.querySelector('.lname').textContent = r.name;
      row.querySelector('.lcount').textContent = fmt(r.cells);
      this.el.legend.appendChild(row);
    }
  }

  // The pipeline view replaces the region legend with the stages in flow order and what
  // is actually moving through each of them. `rows` is [{ name, color, cells, perSec }].
  setStages(rows) {
    this.el.legendtitle.textContent = 'pipeline stages, signals out';
    this.el.legend.innerHTML = '';
    rows.forEach((r, i) => {
      const row = document.createElement('div');
      row.className = 'legend-row';
      row.innerHTML = '<span class="swatch" style="background:' + r.color + '"></span><span class="lstage"></span><span class="lname"></span><span class="lcount"></span>';
      row.querySelector('.lstage').textContent = (i + 1) + '.';
      row.querySelector('.lname').textContent = r.name;
      row.querySelector('.lcount').textContent = fmt(r.perSec) + '/s';
      this.el.legend.appendChild(row);
    });
  }
  // Back to the anatomy: regions and how many cells each one holds.
  setLegend() {
    this.el.legendtitle.textContent = 'regions';
    this.el.legend.innerHTML = '';
    for (const r of this.regions) {
      const row = document.createElement('div');
      row.className = 'legend-row';
      row.innerHTML = '<span class="swatch" style="background:' + r.color + '"></span><span class="lname"></span><span class="lcount"></span>';
      row.querySelector('.lname').textContent = r.name;
      row.querySelector('.lcount').textContent = fmt(r.cells);
      this.el.legend.appendChild(row);
    }
  }

  // How the brain's clock is being shown: one tick of the organism takes this many
  // milliseconds on screen, and a quantum crossing an edge of delay d takes 1 + d of
  // them, exactly as core schedules it.
  setFlight(tickMs, dilation) {
    if (!this.el.flight) return;
    this.el.flight.textContent = tickMs.toFixed(0) + ' ms/tick';
    this.el.flight.title = dilation >= 1
      ? 'shown ' + fmt(dilation) + ' times slower than the brain runs'
      : 'shown ' + (1 / dilation).toFixed(1) + ' times faster than the brain runs';
  }

  setMode(text) { this.el.mode.textContent = text; }
  setStatus(text, cls) { this.el.status.textContent = text; this.el.status.className = 'status ' + (cls || ''); }
  // fps === null means the browser is not asking for frames at all (the page is in a
  // hidden tab or a background pane, where requestAnimationFrame is throttled to a few
  // calls a second). Printing that number as if it were the renderer's speed would be a
  // lie, and a red one: it says nothing about how fast this draws.
  setFps(fps, frameMs) {
    if (fps == null) {
      this.el.fps.textContent = 'idle';
      this.el.fps.title = 'the page is hidden, so the browser is not asking for frames';
      this.el.fps.className = 'v';
      return;
    }
    this.el.fps.textContent = fps.toFixed(0) + ' fps';
    this.el.fps.title = frameMs.toFixed(2) + ' ms per frame';
    this.el.fps.className = 'v ' + (fps >= 55 ? 'good' : fps >= 30 ? 'warn' : 'bad');
  }

  onSummary(s) {
    this.el.t.textContent = fmt(s.t);
    this.el.gen.textContent = fmt(s.gen);
    this.el.cells.textContent = fmt(s.cells);
    this.el.edges.textContent = fmt(s.liveEdges) + ' / ' + fmt(s.edges);
    this.el.runs.textContent = fmt(s.runsPerSec) + '/s';
    this.el.signals.textContent = fmt(s.signalsPerSec) + '/s';
    this.el.proposals.textContent = fmt(s.proposalsPending);
    this.el.proposals.className = 'v ' + (s.proposalsPending > 0 ? 'warn' : '');
  }
  // Local numbers when there is no server (synthetic mode).
  onLocal({ t, cells, edges, runsPerSec, signalsPerSec }) {
    this.el.t.textContent = fmt(t);
    this.el.gen.textContent = '0';
    this.el.cells.textContent = fmt(cells);
    this.el.edges.textContent = fmt(edges) + ' / ' + fmt(edges);
    this.el.runs.textContent = fmt(runsPerSec) + '/s';
    this.el.signals.textContent = fmt(signalsPerSec) + '/s';
    this.el.proposals.textContent = '0';
  }

  // Fold a batch frame into the current one second bucket.
  onBatch(frame) {
    if (!this.regionOf) return;
    const nowSec = Math.floor(Date.now() / 1000);
    while (this.bucketAt < nowSec) {
      this.bucketAt++;
      this.cursor = (this.cursor + 1) % this.SPAN;
      for (const b of this.buckets) b[this.cursor] = 0;
    }
    for (let i = 0; i < frame.runs.length; i += 2) {
      const r = this.regionOf[frame.runs[i]];
      if (r >= 0) this.buckets[r][this.cursor] += frame.runs[i + 1];
    }
    // sigs are (emitting cell, port, count) triples, folded by identity on the server
    if (this.sigAcc) {
      for (let i = 0; i < frame.sigs.length; i += 3) {
        const r = this.regionOf[frame.sigs[i]];
        if (r >= 0) this.sigAcc[r] += frame.sigs[i + 2];
      }
    }
  }

  // Per region signals per second over a half second window, in the order asked for,
  // which for the pipeline view is the order the signals actually flow in.
  stageRates(order) {
    if (!this.sigAcc) return [];
    const n = performance.now(), dt = (n - this.sigT) / 1000;
    if (dt >= 0.5) {
      for (let i = 0; i < this.sigAcc.length; i++) { this.sigRate[i] = this.sigAcc[i] / dt; this.sigAcc[i] = 0; }
      this.sigT = n;
    }
    const byName = new Map(this.regions.map((r, i) => [r.name, i]));
    const names = order && order.length ? order : this.regions.map(r => r.name);
    return names.filter(nm => byName.has(nm)).map(nm => {
      const i = byName.get(nm);
      return { name: nm, color: this.regions[i].color, cells: this.regions[i].cells, perSec: this.sigRate[i] };
    });
  }

  drawStrip() {
    const c = this.strip, ctx = this.sctx;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.floor(c.clientWidth * dpr)), h = Math.max(1, Math.floor(c.clientHeight * dpr));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    ctx.clearRect(0, 0, w, h);
    if (!this.buckets.length) return;
    let max = 1;
    for (let i = 0; i < this.SPAN; i++) {
      let tot = 0;
      for (const b of this.buckets) tot += b[i];
      if (tot > max) max = tot;
    }
    const bw = w / this.SPAN;
    for (let s = 0; s < this.SPAN; s++) {
      const i = (this.cursor + 1 + s) % this.SPAN;
      let y = h;
      for (let r = 0; r < this.buckets.length; r++) {
        const v = this.buckets[r][i];
        if (v <= 0) continue;
        const bh = (v / max) * (h - 2);
        ctx.fillStyle = this.regions[r].color;
        ctx.globalAlpha = i === this.cursor ? 0.95 : 0.78;
        ctx.fillRect(s * bw, y - bh, Math.max(1, bw - dpr), bh);
        y -= bh;
      }
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,255,255,0.40)';
    ctx.font = (10 * dpr) + 'px ui-monospace, monospace';
    ctx.fillText('runs per region, last 60 s   peak ' + fmt(max) + '/s', 6 * dpr, 12 * dpr);
  }

  showCell(json) {
    const p = this.el.panel;
    p.classList.add('open');
    this.el.panelTitle.textContent = json.id || 'cell';
    const stats = json.stats || {};
    const box = document.createElement('div');
    const head = document.createElement('div');
    head.className = 'panel-head';
    head.innerHTML = '<div class="kind"></div><div class="where"></div><div class="period"></div>';
    head.querySelector('.kind').textContent = json.kind || '';
    head.querySelector('.where').textContent = (json.region || '') + ' / ' + (json.circuit || '');
    head.querySelector('.period').textContent = 'period ' + (json.periodLabel || (json.policy && json.policy.period) || '');
    box.appendChild(head);

    const table = document.createElement('div');
    table.className = 'stats';
    for (const [k, v] of Object.entries(stats)) {
      const row = document.createElement('div');
      row.className = 'row';
      const a = document.createElement('span'); a.className = 'k'; a.textContent = k;
      const b = document.createElement('span'); b.className = 'v2'; b.textContent = typeof v === 'number' ? fmt(v) : String(v);
      row.appendChild(a); row.appendChild(b);
      table.appendChild(row);
    }
    box.appendChild(table);

    // The real ports of the real cell. srcPort and dstPort on the edges below index
    // straight into these lists, so this is the wiring diagram of one component.
    const ports = json.ports || null;
    if (ports) {
      const pb = document.createElement('div');
      pb.className = 'edges';
      const side = (title, arr) => {
        const h = document.createElement('div'); h.className = 'sub'; h.textContent = title + ' (' + arr.length + ')';
        pb.appendChild(h);
        for (const pt of arr) {
          const row = document.createElement('div');
          row.className = 'row';
          const a = document.createElement('span'); a.className = 'k'; a.textContent = pt.i + '  ' + pt.name;
          const b = document.createElement('span'); b.className = 'v2'; b.textContent = (pt.kinds || []).join(', ');
          row.appendChild(a); row.appendChild(b);
          pb.appendChild(row);
        }
      };
      side('ports in', ports.in || []);
      side('ports out', ports.out || []);
      box.appendChild(pb);
    }

    // What this cell last said. The kind, port and tick come out of the ledger; the value
    // is recovered from wherever the signal actually is, and stays empty when it has been
    // consumed rather than being invented.
    const lo = json.lastOut;
    if (lo) {
      const b2 = document.createElement('div');
      b2.className = 'edges';
      const h = document.createElement('div'); h.className = 'sub'; h.textContent = 'last output signal';
      b2.appendChild(h);
      const rows = [
        ['kind', lo.kind || '?'],
        ['at tick', String(lo.t ?? '?') + (lo.port != null ? '  port ' + lo.port : '')],
        ['value', lo.value || (lo.hash ? 'consumed, content hash ' + lo.hash : 'unknown')],
      ];
      if (lo.from) rows.push(['where', lo.from]);
      for (const [k, v] of rows) {
        const row = document.createElement('div');
        row.className = 'row';
        const a = document.createElement('span'); a.className = 'k'; a.textContent = k;
        const bb = document.createElement('span'); bb.className = 'v2'; bb.textContent = v;
        row.appendChild(a); row.appendChild(bb);
        b2.appendChild(row);
      }
      box.appendChild(b2);
    }

    const eo = json.edgesOut || [], ei = json.edgesIn || [];
    const edges = document.createElement('div');
    edges.className = 'edges';
    const list = (title, arr, key) => {
      const h = document.createElement('div'); h.className = 'sub'; h.textContent = title + ' (' + arr.length + ')';
      edges.appendChild(h);
      for (const e of arr.slice(0, 40)) {
        const row = document.createElement('div');
        row.className = 'row';
        const a = document.createElement('span'); a.className = 'k'; a.textContent = String(e[key]);
        const b = document.createElement('span'); b.className = 'v2';
        b.textContent = 'w ' + Number(e.w).toFixed(3) + '  delay ' + (e.delay | 0) + '  used ' + fmt(e.usage);
        row.appendChild(a); row.appendChild(b);
        edges.appendChild(row);
      }
      if (arr.length > 40) { const more = document.createElement('div'); more.className = 'sub'; more.textContent = (arr.length - 40) + ' more'; edges.appendChild(more); }
    };
    list('edges in', ei, 'src');
    list('edges out', eo, 'dst');
    box.appendChild(edges);

    const pre = document.createElement('pre');
    pre.className = 'json';
    pre.textContent = JSON.stringify(json, null, 2);
    const det = document.createElement('details');
    const sum = document.createElement('summary'); sum.textContent = 'inspect json';
    det.appendChild(sum); det.appendChild(pre);
    box.appendChild(det);

    this.el.panelBody.innerHTML = '';
    this.el.panelBody.appendChild(box);
  }
  hideCell() { this.el.panel.classList.remove('open'); }
  get panelOpen() { return this.el.panel.classList.contains('open'); }
}
