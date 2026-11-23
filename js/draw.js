/* "הציור שלי": free drawing, coloring pages, and each child's gallery.
   Two canvases: paint (bottom, white) and lines (coloring-page outline on top). Fill on a coloring page is bounded
   by the outline; in free drawing it fills the area of similar colour. */
'use strict';

/* ---------- gallery storage: IndexedDB on the web, files in the app folder on the desktop ---------- */
const Gallery = (() => {
  const bridge = window.ganDesktop && window.ganDesktop.gallery;
  let dbp = null;
  const db = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open('gan-gallery', 1);
    r.onupgradeneeded = () => { const s = r.result.createObjectStore('drawings', { keyPath: 'id' }); s.createIndex('child', 'child'); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }));
  const tx = async (mode, fn) => { const d = await db(); return new Promise((res, rej) => { const t = d.transaction('drawings', mode); const out = fn(t.objectStore('drawings')); t.oncomplete = () => res(out && out.result); t.onerror = () => rej(t.error); }); };
  return {
    async list(child) {
      if (bridge) return bridge.list(child);
      const all = await tx('readonly', (s) => s.index('child').getAll(child));
      return (all || []).map(({ paint, image, ...meta }) => meta).sort((a, b) => b.updated - a.updated);
    },
    async get(id) { return bridge ? bridge.get(id) : tx('readonly', (s) => s.get(id)); },
    async put(rec) { if (bridge) return bridge.put(rec); await tx('readwrite', (s) => s.put(rec)); },
    async del(id) { if (bridge) return bridge.del(id); await tx('readwrite', (s) => s.delete(id)); },
  };
})();

const PALETTE = [['red', '#e5534b'], ['orange', '#ff8a3d'], ['yellow', '#ffd23c'], ['lightgreen', '#9ad96b'], ['green', '#3fa34d'], ['turquoise', '#1FB5A8'],
  ['lightblue', '#8fd0f5'], ['blue', '#3d8be0'], ['darkblue', '#2b3f9e'], ['purple', '#8E6CEF'], ['pink', '#f58fb5'], ['brown', '#9c6a41'],
  ['skin', '#f7cfae'], ['gray', '#9a9aa6'], ['black', '#2b2b33'], ['white', '#ffffff']];
const PALETTE_SIMPLE = PALETTE.filter(([k]) => !['lightgreen', 'turquoise', 'darkblue', 'skin', 'gray', 'lightblue'].includes(k));
const PL_DEFS = '<defs><filter id="pl" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="2.6" flood-color="#5a3e1b" flood-opacity=".22"/></filter></defs>';
const svgImage = (inner, vb, w, hgt) => new Promise((res) => {
  const img = new Image();
  img.onload = () => res(img); img.onerror = () => res(null);
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${hgt}">${PL_DEFS}${inner}</svg>`);
});
const loadImg = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });

const Draw = {
  W: 1200, H: 840,
  simple() { return App.child === 'matan'; },
  pageUnlock(i) { return i < 6 ? 0 : (i - 5) * 8; },

  /* ---------- home: free / pages / gallery ---------- */
  home() {
    const v = h(`<div class="view draw-home"><h1 class="title">הציור שלי</h1><div class="dh-cards">
      <button class="card dh tap" data-go="free"><div class="dh-art">${ART.draw('pencil')}</div><span>ציור חופשי</span></button>
      <button class="card dh tap" data-go="pages"><div class="dh-art">${ART.draw('rainbow')}</div><span>דפי צביעה</span></button>
      <button class="card dh tap" data-go="gallery"><div class="dh-art">${ART.draw('book')}</div><span>הגלריה שלי</span></button></div></div>`);
    v.addEventListener('click', (e) => {
      const b = e.target.closest('[data-go]'); if (!b) return;
      Sfx.play('click');
      if (b.dataset.go === 'free') { Voice.say('d_free'); this.editor({}); }
      else if (b.dataset.go === 'pages') this.pages();
      else this.gallery();
    });
    App.mount(v, 'draw');
    Voice.say('t_draw');
  },

  pages() {
    const stars = Store.child(App.child).stars;
    const list = typeof COLORING !== 'undefined' ? COLORING : [];
    const v = h(`<div class="view draw-pages"><h1 class="title small">דפי צביעה</h1><div class="cp-grid">${list.map((p, i) => {
      const need = this.pageUnlock(i), locked = stars < need;
      return `<button class="card cp ${locked ? 'locked' : ''}" data-i="${i}"><div class="cp-thumb"><svg viewBox="0 0 1000 700">${p.svg}</svg></div>
        ${locked ? `<div class="cp-lock">${ART.icon('lock')}<span>${ART.icon('star')}${need}</span></div>` : ''}</button>`;
    }).join('')}</div></div>`);
    v.addEventListener('click', (e) => {
      const b = e.target.closest('.cp'); if (!b) return;
      if (b.classList.contains('locked')) { Sfx.play('wrong'); Voice.say('need_stars'); return; }
      Sfx.play('click'); this.editor({ page: list[+b.dataset.i].id });
    });
    App.mount(v, 'draw-list');
    Voice.say('d_pages');
  },

  async gallery() {
    const items = await Gallery.list(App.child).catch(() => []);
    const v = h(`<div class="view draw-gallery"><h1 class="title small">הגלריה שלי</h1>
      ${items.length ? '' : `<div class="empty card">${ART.draw('pencil')}<span>עוד אין ציורים — בואו נצייר!</span></div>`}
      <div class="gal-grid">${items.map((it) => `<div class="card gal" data-id="${it.id}"><img src="${it.thumb}" alt="">
        <button class="gal-del" data-del="${it.id}" aria-label="מחיקה">${ART.icon('del')}</button></div>`).join('')}</div></div>`);
    v.addEventListener('click', (e) => {
      const del = e.target.closest('[data-del]');
      if (del) {
        Sfx.play('click');
        return App.confirm('למחוק את הציור?', async () => { await Gallery.del(del.dataset.del); this.gallery(); }, 'כן, למחוק');
      }
      const g = e.target.closest('.gal'); if (!g) return;
      Sfx.play('click');
      Gallery.get(g.dataset.id).then((rec) => rec && this.editor({ rec }));
    });
    App.mount(v, 'draw-list');
    Voice.say('t_gallery');
  },

  /* ---------- editor ---------- */
  async editor({ page = null, rec = null }) {
    const simple = this.simple();
    const pal = simple ? PALETTE_SIMPLE : PALETTE;
    const st = this.st = { id: rec ? rec.id : `${App.child}-${Date.now()}`, page: rec ? rec.page : page, color: pal[0][1], size: 1, tool: 'marker',
      undo: [], dirty: false, stamp: null, created: rec ? rec.created || rec.updated : Date.now() };
    const tools = simple ? ['marker', 'crayon', 'fill', 'eraser', 'stamp', 'undo', 'new']
      : ['marker', 'crayon', 'spray', 'eraser', 'fill', 'stamp', 'undo', 'new'];
    const TI = { marker: 'pencil', crayon: 'crayon', spray: 'spray', eraser: 'eraser', fill: 'bucket', stamp: 'stamp', undo: 'undo', new: 'newpage' };
    const v = h(`<div class="view draw-ed ${simple ? 'simple' : ''}">
      <div class="tools">${tools.map((t) => `<button class="tool ${t === 'marker' ? 'on' : ''}" data-tool="${t}" aria-label="${t}">${ART.icon(TI[t])}</button>`).join('')}</div>
      <div class="canvas-wrap card"><canvas class="paint" width="${this.W}" height="${this.H}"></canvas><canvas class="lines" width="${this.W}" height="${this.H}"></canvas></div>
      <div class="side">
        <div class="pal">${pal.map(([k, c], i) => `<button class="sw ${i === 0 ? 'on' : ''}" data-c="${c}" data-name="${k}" style="--c:${c}"></button>`).join('')}</div>
        <div class="sizes">${[0, 1, 2].map((s) => `<button class="sz ${s === 1 ? 'on' : ''}" data-size="${s}"><i style="width:${[14, 28, 46][s]}px;height:${[14, 28, 46][s]}px"></i></button>`).join('')}</div>
        <button class="save-btn big-btn">${ART.icon('check')}<span>שמירה</span></button>
      </div></div>`);
    App.mount(v, 'draw-ed');
    const paint = $('.paint', v), lines = $('.lines', v), wrap = $('.canvas-wrap', v);
    const ctx = paint.getContext('2d', { willReadFrequently: true }), lctx = lines.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, this.W, this.H);
    const pg = st.page && typeof COLORING !== 'undefined' ? COLORING.find((p) => p.id === st.page) : null;
    if (pg) { const img = await svgImage(pg.svg, '0 0 1000 700', this.W, this.H); if (img) lctx.drawImage(img, 0, 0, this.W, this.H); }
    if (rec && rec.paint) { const img = await loadImg(rec.paint); if (img) ctx.drawImage(img, 0, 0, this.W, this.H); }
    const lineData = lctx.getImageData(0, 0, this.W, this.H).data;
    const sizes = [8, 22, 44];

    const pushUndo = () => { st.undo.push(ctx.getImageData(0, 0, this.W, this.H)); if (st.undo.length > 15) st.undo.shift(); st.dirty = true; };
    const pos = (e) => { const r = paint.getBoundingClientRect(); return [(e.clientX - r.left) * this.W / r.width, (e.clientY - r.top) * this.H / r.height]; };
    const dab = (x, y) => {
      const s = sizes[st.size], tool = st.tool;
      if (tool === 'marker' || tool === 'eraser') {
        ctx.fillStyle = tool === 'eraser' ? '#fff' : st.color; ctx.beginPath(); ctx.arc(x, y, s / 2, 0, Math.PI * 2); ctx.fill();
      } else if (tool === 'crayon') {
        ctx.fillStyle = st.color;
        for (let k = 0; k < s * 1.6; k++) {
          const a = Math.random() * Math.PI * 2, r = Math.random() * s / 2;
          ctx.globalAlpha = .35 + Math.random() * .4; ctx.fillRect(x + Math.cos(a) * r, y + Math.sin(a) * r, 1.8, 1.8);
        }
        ctx.globalAlpha = 1;
      } else if (tool === 'spray') {
        ctx.fillStyle = st.color;
        for (let k = 0; k < s * 1.2; k++) {
          const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * s * 1.3;
          ctx.fillRect(x + Math.cos(a) * r, y + Math.sin(a) * r, 1.5, 1.5);
        }
      }
    };
    const stroke = (x0, y0, x1, y1) => {
      if (st.tool === 'marker' || st.tool === 'eraser') {
        ctx.strokeStyle = st.tool === 'eraser' ? '#fff' : st.color; ctx.lineWidth = sizes[st.size]; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); return;
      }
      const dist = Math.hypot(x1 - x0, y1 - y0), step = st.tool === 'spray' ? 6 : 3;
      for (let t = 0; t <= dist; t += step) dab(x0 + (x1 - x0) * t / (dist || 1), y0 + (y1 - y0) * t / (dist || 1));
    };
    const fill = (x, y) => {
      x = Math.floor(x); y = Math.floor(y);
      const W = this.W, H = this.H, img = ctx.getImageData(0, 0, W, H), d = img.data;
      const i0 = (y * W + x) * 4;
      if (lineData[i0 + 3] > 110) return;
      const [r0, g0, b0] = [d[i0], d[i0 + 1], d[i0 + 2]];
      const n = parseInt(st.color.slice(1), 16), R = n >> 16, G = (n >> 8) & 255, B = n & 255;
      const tol = 60;
      const inside = (i) => lineData[i + 3] <= 110 && (pg || Math.abs(d[i] - r0) + Math.abs(d[i + 1] - g0) + Math.abs(d[i + 2] - b0) <= tol);
      const seen = new Uint8Array(W * H), stack = [x, y];
      while (stack.length) {
        const sy = stack.pop(), sx0 = stack.pop();
        let sx = sx0;
        while (sx >= 0 && !seen[sy * W + sx] && inside((sy * W + sx) * 4)) sx--;
        sx++;
        let up = false, down = false;
        while (sx < W && !seen[sy * W + sx] && inside((sy * W + sx) * 4)) {
          const p = sy * W + sx, i = p * 4; seen[p] = 1; d[i] = R; d[i + 1] = G; d[i + 2] = B; d[i + 3] = 255;
          if (sy > 0) { const q = p - W; if (!seen[q] && inside(q * 4)) { if (!up) { stack.push(sx, sy - 1); up = true; } } else up = false; }
          if (sy < H - 1) { const q = p + W; if (!seen[q] && inside(q * 4)) { if (!down) { stack.push(sx, sy + 1); down = true; } } else down = false; }
          sx++;
        }
      }
      // grow one pixel under the outline so no white seam stays at anti-aliased edges
      ctx.putImageData(img, 0, 0);
    };
    const placeStamp = async (x, y) => {
      if (!st.stamp) return;
      const img = await svgImage(ART.D[st.stamp.replace(/^gold_/, '')](), '0 0 200 200', 180, 180);
      if (img) { pushUndo(); ctx.drawImage(img, x - 90, y - 90, 180, 180); }
    };

    let last = null;
    wrap.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const [x, y] = pos(e);
      if (st.tool === 'fill') { pushUndo(); fill(x, y); Sfx.play('click'); return; }
      if (st.tool === 'stamp') { placeStamp(x, y); Sfx.play('sticker'); return; }
      pushUndo(); wrap.setPointerCapture(e.pointerId); last = [x, y]; dab(x, y);
    });
    wrap.addEventListener('pointermove', (e) => {
      if (!last) return;
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of evs.length ? evs : [e]) { const p = pos(ev); stroke(last[0], last[1], p[0], p[1]); last = p; }
    });
    const end = () => { last = null; };
    wrap.addEventListener('pointerup', end); wrap.addEventListener('pointercancel', end);

    const save = async (announce) => {
      const out = document.createElement('canvas'); out.width = this.W; out.height = this.H;
      const o = out.getContext('2d'); o.drawImage(paint, 0, 0); o.drawImage(lines, 0, 0);
      const th = document.createElement('canvas'); th.width = 360; th.height = 252; th.getContext('2d').drawImage(out, 0, 0, 360, 252);
      const recNew = { id: st.id, child: App.child, page: st.page, paint: paint.toDataURL('image/png'), image: out.toDataURL('image/png'),
        thumb: th.toDataURL('image/jpeg', .8), created: st.created, updated: Date.now() };
      try { await Gallery.put(recNew); } catch (e) { /* storage full or unavailable */ }
      if (DESKTOP && window.ganDesktop.savePicture) {
        const d = new Date(st.created), name = `${KIDS[App.child].name} ${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}.png`;
        try { window.ganDesktop.savePicture(name, recNew.image); } catch (e) { /* ignore */ }
      }
      st.dirty = false;
      if (announce) { Sfx.play('star'); confetti($('.save-btn', v), 18); Voice.say('d_saved'); }
    };
    st.save = save;

    v.addEventListener('click', (e) => {
      const sw = e.target.closest('.sw'), sz = e.target.closest('.sz'), tl = e.target.closest('.tool');
      if (sw) {
        $$('.sw', v).forEach((b) => b.classList.remove('on')); sw.classList.add('on'); st.color = sw.dataset.c;
        if (st.tool === 'eraser' || st.tool === 'stamp') this.selectTool(v, 'marker');
        Sfx.play('click'); if (simple) Voice.say('color_' + sw.dataset.name);
      } else if (sz) {
        $$('.sz', v).forEach((b) => b.classList.remove('on')); sz.classList.add('on'); st.size = +sz.dataset.size;
        Sfx.play('click'); if (simple) Voice.say(['d_small', 'd_medium', 'd_big'][st.size]);
      } else if (tl) {
        const t = tl.dataset.tool; Sfx.play('click');
        if (simple || t === 'stamp') Voice.say('d_' + t);
        if (t === 'undo') { const u = st.undo.pop(); if (u) ctx.putImageData(u, 0, 0); return; }
        if (t === 'new') {
          return App.confirm('להתחיל דף חדש?', async () => {
            if (st.dirty) await save(false);
            this.editor({ page: st.page });
          }, 'כן, דף חדש');
        }
        if (t === 'stamp') return this.stampPicker(v);
        this.selectTool(v, t);
      } else if (e.target.closest('.save-btn')) save(true);
    });
  },

  selectTool(v, t) {
    this.st.tool = t;
    $$('.tool', v).forEach((b) => b.classList.toggle('on', b.dataset.tool === t));
  },

  stampPicker(v) {
    const owned = Store.child(App.child).stickers;
    const ov = $('#overlay');
    ov.innerHTML = `<div class="card modal stamps"><h3>מדבקות</h3><div class="stamp-grid">${owned.length ? owned.map((s) => `<button class="stamp" data-s="${s}">${stickerArt(s)}</button>`).join('')
      : `<p>עוד אין מדבקות — משחקים ואוספים!</p>`}</div><button class="big-btn soft" data-c="no">סגירה</button></div>`;
    ov.classList.add('show');
    ov.onclick = (e) => {
      const b = e.target.closest('.stamp');
      if (b) { this.st.stamp = b.dataset.s; this.selectTool(v, 'stamp'); App.closeOverlay(); Sfx.play('click'); return; }
      if (e.target.closest('[data-c]') || e.target === ov) App.closeOverlay();
    };
  },

  /** Called when leaving the editor: keep the drawing. */
  leave() { if (this.st && this.st.dirty && this.st.save) this.st.save(false); this.st = null; },
};
