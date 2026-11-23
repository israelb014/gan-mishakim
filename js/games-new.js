/* New games. Hodaya: memory, word search, sentence order, shop & shekels, patterns.
   Matan (voice-only, giant targets): colours, shapes, shadows, big & small, little memory. */
'use strict';

/* ---------- basic shapes (100x100 viewBox) ---------- */
const SHAPES = {
  circle: ['עיגול', (c) => `<circle cx="50" cy="50" r="42" fill="${c}"/>`],
  square: ['ריבוע', (c) => `<rect x="10" y="10" width="80" height="80" rx="6" fill="${c}"/>`],
  triangle: ['משולש', (c) => `<path d="M50 8 L94 88 H6 Z" fill="${c}" stroke="${c}" stroke-width="6" stroke-linejoin="round"/>`],
  star: ['כוכב', (c) => `<path d="M50 4 l12.5 27 29.5 3.4 -22 20 6.2 29 -26.2 -14.8 -26.2 14.8 6.2 -29 -22 -20 29.5 -3.4z" fill="${c}" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`],
  heart: ['לב', (c) => `<path d="M50 88 C10 60 4 38 16 24 C28 10 46 16 50 30 C54 16 72 10 84 24 C96 38 90 60 50 88Z" fill="${c}"/>`],
  rectangle: ['מלבן', (c) => `<rect x="4" y="24" width="92" height="52" rx="6" fill="${c}"/>`],
  oval: ['אליפסה', (c) => `<ellipse cx="50" cy="50" rx="46" ry="30" fill="${c}"/>`],
  diamond: ['מעוין', (c) => `<path d="M50 4 L90 50 L50 96 L10 50 Z" fill="${c}" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`],
};
const SHAPE_IDS = Object.keys(SHAPES);
const shapeSVG = (id, c) => `<svg class="art shape" viewBox="-4 -4 108 108"><g filter="url(#pl)">${SHAPES[id][1](c)}</g></svg>`;
const colorHex = (id) => COLORS.find((c) => c[0] === id)[3];
const fem = () => App.gender() === 'f';

/* ---------- memory board (shared by both memory games) ---------- */
function memoryQuestion({ pairs, cols, inst, big }) {
  const cards = shuffle(pairs.flatMap((p, k) => [{ k, html: p.a, say: p.sayA }, { k, html: p.b, say: p.sayB }]));
  const rows = Math.ceil(cards.length / cols);
  return {
    key: 'mem' + pairs.map((p) => p.id).join(), voice: [inst],
    html: `<div class="mem-title">${spk(inst)}</div>
      <div class="memory ${big ? 'big' : ''}" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr)">
      ${cards.map((c) => `<button class="mcard-m" data-k="${c.k}" ${c.say ? `data-voice="${c.say}"` : ''}><span class="back">${ART.icon('star')}</span><span class="face">${c.html}</span></button>`).join('')}</div>`,
    mount(body, api) {
      let open = [], found = 0, lock = false;
      body.addEventListener('click', (e) => {
        const c = e.target.closest('.mcard-m');
        if (!c || lock || api.done() || c.classList.contains('up')) return;
        c.classList.add('up'); Sfx.play('click');
        if (c.dataset.voice) Voice.say(c.dataset.voice);
        open.push(c);
        if (open.length < 2) return;
        const [a, b] = open; open = [];
        if (a.dataset.k === b.dataset.k) {
          a.classList.add('matched'); b.classList.add('matched'); found++;
          if (found === pairs.length) setTimeout(() => api.ok(b), 350);
          else api.good(b);
        } else {
          lock = true; api.bad(null, { silent: true });
          setTimeout(() => { a.classList.remove('up'); b.classList.remove('up'); lock = false; }, 950);
        }
      });
      body._solve = () => { // used by tools/check.py
        const ks = [...new Set($$('.mcard-m:not(.matched)', body).map((c) => c.dataset.k))];
        ks.forEach((k) => $$(`.mcard-m[data-k="${k}"]:not(.matched)`, body).forEach((c) => c.click()));
      };
    },
  };
}
const memStars = (pairs) => (m) => (m <= pairs * .75 ? 3 : m <= pairs * 1.6 ? 2 : 1);
const pictureCard = (k) => `<div class="mpic">${ART.draw(k)}</div>`;
const wordCard = (txt, cls = '') => `<div class="mword ${cls}">${txt}</div>`;

Object.assign(GAMES, {
  /* ---------------- memory (Hodaya) ---------------- */
  memory: {
    child: 'hodaya', title: 'זיכרון', titleId: 't_memory', per: 1, board: true,
    art: () => `<div class="mem-art"><i class="up">${ART.draw('cat')}</i><i></i><i class="up">${ART.draw('cat')}</i><i></i></div>`,
    pairsFor: (d) => (d < 2 ? 6 : d < 5 ? 8 : 10),
    stars(m, d) { return memStars(this.pairsFor(d))(m); },
    make(d) {
      const n = this.pairsFor(d);
      const mode = d < 2.5 ? 'pic' : d < 5 ? 'picword' : 'enhe';
      let pairs;
      if (mode === 'enhe') {
        pairs = shuffle(EN_WORDS.filter((w) => w[2] !== 'number').map((w) => w[0])).slice(0, n)
          .map((k) => ({ id: k, a: wordCard(EN[k].en, 'en'), b: wordCard(enHebrew(k)), sayA: 'en_' + k }));
      } else {
        pairs = shuffle(HE_WORDS.map((w) => w[0])).slice(0, n).map((k) => ({
          id: k, a: pictureCard(k), b: mode === 'pic' ? pictureCard(k) : wordCard(HE[k].he), sayA: 'word_' + k,
        }));
      }
      return memoryQuestion({ pairs, cols: n === 6 ? 4 : n === 8 ? 4 : 5, inst: 'inst_mem_f' });
    },
  },

  /* ---------------- Hebrew word search ---------------- */
  search: {
    child: 'hodaya', title: 'חיפוש מילים', titleId: 't_search', per: 1, board: true,
    art: () => `<div class="ws-art">${'כלבתחשמשד'.split('').map((l, i) => `<i class="${i < 3 ? 'hit' : ''}">${l}</i>`).join('')}</div>`,
    stars: (m) => (m <= 1 ? 3 : m <= 4 ? 2 : 1),
    make(d) {
      const size = d < 2 ? 5 : d < 4 ? 6 : 7, count = d < 2 ? 3 : d < 4 ? 4 : 5, dirs = d < 2 ? ['h'] : ['h', 'v'];
      const grid = Array.from({ length: size }, () => Array(size).fill(null));
      const words = [];
      for (const [k, w] of shuffle(HE_WORDS.filter(([, w]) => w.length >= 2 && w.length <= size))) {
        if (words.length >= count) break;
        if (words.some((x) => x.w === w)) continue;
        const L = [...w];
        for (let t = 0; t < 40; t++) {
          const dir = pick(dirs), r = rnd(0, dir === 'h' ? size - 1 : size - L.length), c = rnd(0, dir === 'h' ? size - L.length : size - 1);
          const cells = L.map((_, j) => (dir === 'h' ? [r, c + j] : [r + j, c]));
          if (cells.every(([y, x], j) => grid[y][x] === null || grid[y][x] === L[j])) {
            cells.forEach(([y, x], j) => { grid[y][x] = L[j]; });
            words.push({ k, w, cells }); break;
          }
        }
      }
      const fill = HEB22;
      for (const row of grid) for (let x = 0; x < size; x++) if (row[x] === null) row[x] = pick(fill);
      return {
        key: 'ws' + words.map((x) => x.k).join(), voice: ['inst_search'],
        html: `<div class="ws-wrap"><div class="ws-grid" style="--n:${size}">${grid.map((row, y) => row.map((l, x) => `<div class="ws-c" data-y="${y}" data-x="${x}">${l}</div>`).join('')).join('')}</div>
          <div class="ws-list">${spk('inst_search')}${words.map((x) => `<div class="ws-w card" data-k="${x.k}"><i>${ART.draw(x.k)}</i><span>${x.w}</span></div>`).join('')}</div></div>`,
        mount(body, api) {
          const gridEl = $('.ws-grid', body);
          let start = null, sel = [];
          const cellAt = (e) => { const el = document.elementFromPoint(e.clientX, e.clientY); return el && el.closest('.ws-c'); };
          const line = (a, b) => {
            const y0 = +a.dataset.y, x0 = +a.dataset.x, y1 = +b.dataset.y, x1 = +b.dataset.x;
            if (y0 !== y1 && x0 !== x1) return [a];
            const n = Math.max(Math.abs(y1 - y0), Math.abs(x1 - x0));
            return Array.from({ length: n + 1 }, (_, j) => $(`.ws-c[data-y="${y0 + Math.sign(y1 - y0) * j}"][data-x="${x0 + Math.sign(x1 - x0) * j}"]`, gridEl));
          };
          const paint = () => { $$('.ws-c.sel', gridEl).forEach((c) => c.classList.remove('sel')); sel.forEach((c) => c.classList.add('sel')); };
          const check = () => {
            const key = sel.map((c) => `${c.dataset.y},${c.dataset.x}`).join(';');
            const hit = words.find((x) => !x.found && [x.cells, [...x.cells].reverse()].some((cs) => cs.map(([y, xx]) => `${y},${xx}`).join(';') === key));
            if (hit) {
              hit.found = true; sel.forEach((c) => c.classList.add('found'));
              $(`.ws-w[data-k="${hit.k}"]`, body).classList.add('done');
              if (words.every((x) => x.found)) api.ok($(`.ws-w[data-k="${hit.k}"]`, body)); else api.good(sel[sel.length - 1], 'word_' + hit.k);
            } else if (sel.length > 1) { sel.forEach((c) => { c.classList.remove('bad'); void c.offsetWidth; c.classList.add('bad'); }); api.bad(null, { silent: true }); Sfx.play('wrong'); }
            sel = []; paint();
          };
          gridEl.addEventListener('pointerdown', (e) => {
            const c = cellAt(e); if (!c || api.done()) return;
            e.preventDefault(); gridEl.setPointerCapture(e.pointerId);
            if (start && start !== c && sel.length === 1) { sel = line(start, c); paint(); start = null; check(); return; } // tap-tap selection
            start = c; sel = [c]; paint(); Sfx.play('click');
          });
          gridEl.addEventListener('pointermove', (e) => { if (!start || !e.buttons) return; const c = cellAt(e); if (c) { sel = line(start, c); paint(); } });
          gridEl.addEventListener('pointerup', () => { if (start && sel.length > 1) { start = null; check(); } });
          body._solve = () => words.filter((x) => !x.found).forEach((x) => { // used by tools/check.py
            sel = x.cells.map(([y, xx]) => $(`.ws-c[data-y="${y}"][data-x="${xx}"]`, gridEl)); check();
          });
        },
      };
    },
  },

  /* ---------------- put the sentence in order ---------------- */
  sentence: {
    child: 'hodaya', title: 'סדר את המשפט', titleId: 't_sentence', per: 4,
    art: () => `<div class="sent-art"><i>הכלב</i><i class="b">רץ</i><i>מהר</i></div>`,
    make(d) {
      const len = d < 2 ? 3 : d < 4 ? 4 : d < 6 ? 5 : 6;
      const bank = SENTENCES.filter((s) => s.words.length === Math.min(len, 6));
      const s = pick(bank.length ? bank : SENTENCES);
      let order = shuffle(s.words.map((w, k) => k));
      if (order.every((v, k) => v === k)) order = order.reverse();
      return {
        key: 'sn' + s.id, voice: ['inst_sentence'], correctVoice: ['sent_' + s.id], longVoice: true,
        html: `<div class="ctitle">${spk('inst_sentence')}<span>סדרי את המילים למשפט</span></div>
          ${s.pic ? `<div class="sent-pic">${ART.draw(s.pic)}</div>` : ''}
          <div class="sent-slots">${s.words.map((_, k) => `<div class="slot-w" data-i="${k}"></div>`).join('')}</div>
          <div class="sent-pool">${order.map((k) => `<div class="chip card" data-k="${k}">${s.words[k]}</div>`).join('')}</div>`,
        mount(body, api) {
          const slots = $$('.slot-w', body), pool = $('.sent-pool', body);
          const place = (chip, slot) => {
            if (!slot) slot = slots.find((x) => !x.firstChild); if (!slot) return;
            if (slot.firstChild) pool.appendChild(slot.firstChild);
            slot.appendChild(chip); Sfx.play('click');
            if (slots.every((x) => x.firstChild)) {
              const ok = slots.every((x, k) => +x.firstChild.dataset.k === k);
              if (ok) api.ok($('.sent-slots', body));
              else {
                api.bad($('.sent-slots', body));
                setTimeout(() => slots.forEach((x, k) => { if (x.firstChild && +x.firstChild.dataset.k !== k) pool.appendChild(x.firstChild); }), 500);
              }
            }
          };
          let drag = null;
          body.addEventListener('pointerdown', (e) => {
            const chip = e.target.closest('.chip'); if (!chip || api.done()) return;
            e.preventDefault();
            const r = chip.getBoundingClientRect(), k = $('#stage').getBoundingClientRect().width / 1920;
            drag = { chip, x0: e.clientX, y0: e.clientY, moved: false, k, r };
            chip.setPointerCapture(e.pointerId);
          });
          body.addEventListener('pointermove', (e) => {
            if (!drag) return;
            const dx = (e.clientX - drag.x0) / drag.k, dy = (e.clientY - drag.y0) / drag.k;
            if (Math.hypot(dx, dy) > 8) drag.moved = true;
            if (drag.moved) { drag.chip.classList.add('dragging'); drag.chip.style.transform = `translate(${dx}px,${dy}px) scale(1.08)`; }
          });
          body.addEventListener('pointerup', (e) => {
            if (!drag) return;
            const { chip, moved } = drag; drag = null;
            chip.classList.remove('dragging'); chip.style.transform = '';
            if (!moved) { if (chip.parentElement.classList.contains('slot-w')) { pool.appendChild(chip); Sfx.play('click'); } else place(chip); return; }
            chip.style.visibility = 'hidden';
            const el = document.elementFromPoint(e.clientX, e.clientY); chip.style.visibility = '';
            const slot = el && el.closest('.slot-w');
            if (slot) place(chip, slot); else if (chip.parentElement.classList.contains('slot-w')) pool.appendChild(chip);
          });
          body._solve = () => s.words.forEach((_, k) => place($(`.chip[data-k="${k}"]`, body))); // used by tools/check.py
        },
      };
    },
  },

  /* ---------------- shop & shekels ---------------- */
  shop: {
    child: 'hodaya', title: 'חנות ושקלים', titleId: 't_shop', per: 5,
    art: () => `<div class="shop-art"><i style="width:120px;height:120px">${ART.money(5)}</i><i style="width:150px;height:84px">${ART.money(20)}</i></div>`,
    make(d, i) {
      const items = ['apple', 'banana', 'ball', 'book', 'icecream', 'cake', 'kite', 'drum', 'gift', 'pizza', 'hat', 'umbrella', 'pencil', 'bag', 'candy', 'shoe', 'cup', 'lamp'];
      const item = pick(items);
      const coins = d < 2 ? [1, 2, 5] : d < 4 ? [1, 2, 5, 10] : d < 4.5 ? [1, 2, 5, 10, 20, 50] : [0.5, 1, 2, 5, 10, 20, 50];
      const maxP = d < 2 ? 10 : d < 4 ? 20 : 60;
      let price = rnd(2, maxP);
      if (d >= 4.5 && RNG.r() < .4) price -= .5;
      const fmt = (v) => (v % 1 ? `${Math.floor(v) ? Math.floor(v) : ''}½`.replace(/^½$/, '½') : String(v));
      const change = d >= 5 && i % 2 === 1;
      if (change) {
        const pr = rnd(3, d < 7 ? 45 : 180), paidOpts = [10, 20, 50, 100, 200].filter((v) => v > pr);
        const paid = paidOpts[0], ans = paid - pr;
        const offs = [ans - 10, ans - 5, ans - 1, ans + 1, ans + 5, ans + 10].filter((v) => v > 0);
        const opts = optionSet(ans, 4, offs, offs);
        return {
          key: `ch${pr}_${paid}`, voice: ['inst_change'],
          html: `<div class="ctitle">${spk('inst_change')}<span>כמה עודף מקבלים?</span></div>
            <div class="shelf card"><div class="ware">${ART.draw(item)}</div><div class="tag">${pr} ₪</div></div>
            <div class="paid card"><span>נתתי</span><i class="${paid >= 20 ? 'note' : 'coin'}">${ART.money(paid)}</i></div>
            <div class="change-opts" dir="ltr">${opts.map((v) => `<div class="card opt" data-ok="${v === ans ? 1 : 0}">${v} ₪</div>`).join('')}</div>`,
        };
      }
      return {
        key: `p${item}${price}`, voice: ['inst_pay'],
        html: `<div class="ctitle">${spk('inst_pay')}<span>שלמי בדיוק את המחיר</span></div>
          <div class="shelf card"><div class="ware">${ART.draw(item)}</div><div class="tag" dir="ltr">${fmt(price)} ₪</div></div>
          <div class="tray card"><div class="tray-in"></div><div class="sum ${d >= 4 ? 'hide' : ''}" dir="ltr">0 ₪</div>
            <button class="pay-btn big-btn">${ART.icon('check')}<span>לשלם</span></button></div>
          <div class="wallet">${coins.map((v) => `<button class="money ${v >= 20 ? 'note' : 'coin'}" data-v="${v}">${ART.money(v)}</button>`).join('')}</div>`,
        mount(body, api) {
          const tray = $('.tray-in', body), sum = $('.sum', body);
          const total = () => $$('.money', tray).reduce((a, m) => a + +m.dataset.v, 0);
          const upd = () => { sum.textContent = `${fmt(total())} ₪`; };
          body.addEventListener('click', (e) => {
            if (api.done()) return;
            const m = e.target.closest('.money');
            if (m && m.parentElement.classList.contains('wallet')) {
              if ($$('.money', tray).length >= 14) return;
              const c = m.cloneNode(true); tray.appendChild(c); Sfx.play('click'); upd();
            } else if (m) { m.remove(); Sfx.play('click'); upd(); }
            else if (e.target.closest('.pay-btn')) {
              if (Math.abs(total() - price) < .01) api.ok($('.tray', body));
              else { api.bad($('.tray', body)); }
            }
          });
          body._solve = () => { // used by tools/check.py: pay greedily
            let left = price;
            for (const v of [...coins].sort((a, b) => b - a)) while (left >= v - 1e-9) { $(`.wallet .money[data-v="${v}"]`, body).click(); left -= v; }
            $('.pay-btn', body).click();
          };
        },
      };
    },
  },

  /* ---------------- continue the pattern ---------------- */
  pattern: {
    child: 'hodaya', title: 'המשך את הסדרה', titleId: 't_pattern', per: 8,
    art: () => `<div class="pat-art">${shapeSVG('circle', '#e5534b')}${shapeSVG('square', '#3d8be0')}${shapeSVG('circle', '#e5534b')}<b>?</b></div>`,
    make(d) {
      const tpls = d < 2 ? ['AB'] : d < 3.5 ? ['AB', 'ABB', 'AAB', 'ABC'] : ['ABC', 'ABB', 'AABB', 'ABCB', 'ABAC'];
      if (d >= 5 && RNG.r() < (d >= 7 ? .8 : .55)) {
        const steps = d < 6.5 ? [1, 2, 5, 10] : [2, 3, 4, 5, 10, -2, -3, 'x2'];
        const s = pick(steps), len = 5;
        const start = s === 'x2' ? rnd(1, 4) : typeof s === 'number' && s < 0 ? rnd(20, 40) : rnd(0, 20);
        const seq = [start]; for (let k = 1; k <= len; k++) seq.push(s === 'x2' ? seq[k - 1] * 2 : seq[k - 1] + s);
        const ans = seq.pop();
        const opts = optionSet(ans, 4, [ans + 1, ans - 1, ans + 2, ans - 2, ans + 10].filter((v) => v >= 0), [ans + 3, ans + 4, ans - 3]);
        return {
          key: 'n' + seq.join(), voice: ['inst_pattern'],
          html: `<div class="ctitle">${spk('inst_pattern')}<span>מה ממשיך את הסדרה?</span></div>
            <div class="pat-row nums card" dir="ltr">${seq.map((v) => `<i>${v}</i>`).join('')}<i class="q">?</i></div>
            <div class="pat-opts" dir="ltr">${opts.map((v) => `<div class="card opt" data-ok="${v === ans ? 1 : 0}">${v}</div>`).join('')}</div>`,
        };
      }
      const t = pick(tpls);
      const cols = shuffle(COLORS.slice(0, 8).map((c) => c[3])), shs = shuffle(SHAPE_IDS);
      const sym = {};
      [...new Set(t)].forEach((ch, k) => {
        sym[ch] = d < 2 ? ['circle', cols[k]] : d < 3.5 ? [shs[k], cols[0]] : [shs[k], cols[k]];
      });
      const total = t.length * 2 + (t.length <= 2 ? 2 : 1);
      const seq = Array.from({ length: total }, (_, k) => t[k % t.length]);
      const ans = seq.pop();
      const key = (ch) => sym[ch].join();
      const distract = [[sym[ans][0], cols[5]], [shs[6], sym[ans][1]], [shs[7], cols[6]]];
      const pool = [...new Set(t)].map((ch) => sym[ch]).concat(distract);
      const opts = optionSet(key(ans), 3 + (d >= 2 ? 1 : 0), pool.map((s) => s.join()).filter((s) => s !== key(ans)), []);
      const draw = (k) => { const [s, c] = k.split(','); return shapeSVG(s, c); };
      return {
        key: 'p' + seq.map(key).join('|'), voice: ['inst_pattern'],
        html: `<div class="ctitle">${spk('inst_pattern')}<span>מה ממשיך את הסדרה?</span></div>
          <div class="pat-row card" dir="ltr">${seq.map((ch) => `<i>${draw(key(ch))}</i>`).join('')}<i class="q">?</i></div>
          <div class="pat-opts" dir="ltr">${opts.map((k) => `<div class="card opt" data-ok="${k === key(ans) ? 1 : 0}">${draw(k)}</div>`).join('')}</div>`,
        onCorrect: (root) => { const q = $('.pat-row .q', root); q.classList.remove('q'); q.innerHTML = draw(key(ans)); },
      };
    },
  },

  /* ---------------- colours (Matan) ---------------- */
  colors: {
    child: 'matan', title: 'צבעים', titleId: 't_colors', per: 6,
    art: () => `<div class="col-art">${['#e5534b', '#ffd23c', '#3d8be0'].map((c) => `<i>${ART.draw('splat', c)}</i>`).join('')}</div>`,
    make(d) {
      const set = COLORS.slice(0, d < 1.5 ? 4 : d < 3 ? 7 : 10).map((c) => c[0]);
      const ans = pick(set);
      const opts = optionSet(ans, d < 1 ? 2 : d < 3 ? 3 : 4, [], set);
      return {
        key: 'c' + ans, voice: ['q_color_' + ans], correctVoice: ['color_' + ans],
        html: `<button class="say-bubble" data-say="q_color_${ans}">${ART.icon('speaker')}</button>
          <div class="giant n${opts.length}">${opts.map((c) => `<div class="card opt gt" data-ok="${c === ans ? 1 : 0}">${ART.draw('splat', colorHex(c))}</div>`).join('')}</div>`,
      };
    },
  },

  /* ---------------- shapes (Matan) ---------------- */
  shapes: {
    child: 'matan', title: 'צורות', titleId: 't_shapes', per: 6,
    art: () => `<div class="col-art">${shapeSVG('triangle', '#FF8A3D')}${shapeSVG('circle', '#1FB5A8')}${shapeSVG('star', '#FFC93C')}</div>`,
    make(d) {
      const set = SHAPE_IDS.slice(0, d < 1.5 ? 4 : d < 3 ? 6 : 8);
      const ans = pick(set);
      const opts = optionSet(ans, d < 1 ? 2 : d < 3 ? 3 : 4, ans === 'square' ? ['rectangle'] : ans === 'circle' ? ['oval'] : [], set);
      const cols = shuffle(['#e5534b', '#3d8be0', '#4fb05a', '#ffc93c', '#8E6CEF', '#ff8a3d']);
      return {
        key: 's' + ans, voice: ['q_shape_' + ans], correctVoice: ['shape_' + ans],
        html: `<button class="say-bubble" data-say="q_shape_${ans}">${ART.icon('speaker')}</button>
          <div class="giant n${opts.length}">${opts.map((s, k) => `<div class="card opt gt" data-ok="${s === ans ? 1 : 0}">${shapeSVG(s, d < 2 ? '#1FB5A8' : cols[k])}</div>`).join('')}</div>`,
      };
    },
  },

  /* ---------------- whose shadow? (Matan) ---------------- */
  shadow: {
    child: 'matan', title: 'צל של מי?', titleId: 't_shadow', per: 6,
    art: () => `<div class="col-art"><i>${ART.draw('elephant')}</i><i class="sil">${ART.draw('elephant')}</i></div>`,
    make(d) {
      const pool = HE_WORDS.filter((w) => ['animal', 'vehicle', 'thing', 'food'].includes(w[2])).map((w) => w[0]);
      const ans = pick(pool);
      const same = HE_WORDS.filter((w) => w[2] === HE[ans].cat).map((w) => w[0]);
      const opts = optionSet(ans, d < 1 ? 2 : d < 3 ? 3 : 4, d >= 3 ? same : [], pool);
      return {
        key: ans, voice: ['q_shadow'], correctVoice: ['word_' + ans],
        html: `<button class="say-bubble small" data-say="q_shadow">${ART.icon('speaker')}</button>
          <div class="shadow-card card"><div class="sil">${ART.draw(ans)}</div></div>
          <div class="giant low n${opts.length}">${opts.map((k) => `<div class="card opt gt" data-ok="${k === ans ? 1 : 0}">${ART.draw(k)}</div>`).join('')}</div>`,
        onCorrect: (root) => { $('.shadow-card .sil', root).classList.add('lit'); },
      };
    },
  },

  /* ---------------- big & small, more & less (Matan) ---------------- */
  bigsmall: {
    child: 'matan', title: 'גדול וקטן', titleId: 't_bigsmall', per: 6,
    art: () => `<div class="bs-art"><i style="width:150px;height:150px">${ART.draw('elephant')}</i><i style="width:70px;height:70px">${ART.draw('elephant')}</i></div>`,
    make(d) {
      const kinds = d < 1.5 ? ['big', 'small'] : ['big', 'small', 'more', 'less'];
      const kind = pick(kinds);
      const n = d < 2.5 ? 2 : 3;
      if (kind === 'big' || kind === 'small') {
        const obj = pick(['elephant', 'apple', 'ball', 'car', 'dog', 'star', 'fish', 'balloon', 'bear', 'tree']);
        const sizes = n === 2 ? [100, 52] : [100, 70, 44];
        const order = shuffle(sizes.map((s, k) => k));
        const ansIdx = kind === 'big' ? 0 : sizes.length - 1;
        return {
          key: kind + obj, voice: ['q_' + kind],
          html: `<button class="say-bubble" data-say="q_${kind}">${ART.icon('speaker')}</button>
            <div class="giant n${n}">${order.map((k) => `<div class="card opt gt" data-ok="${k === ansIdx ? 1 : 0}"><i style="width:${sizes[k]}%;height:${sizes[k]}%">${ART.draw(obj)}</i></div>`).join('')}</div>`,
        };
      }
      const obj = pick(['apple', 'star', 'fish', 'balloon', 'strawberry', 'duck']);
      let counts;
      if (d < 3) { const a = rnd(1, 3); counts = [a, a + rnd(3, 5)]; } else { const a = rnd(2, 5); counts = [a, a + rnd(1, 3)]; }
      if (n === 3) counts.push(rnd(counts[0] + 1, counts[1] - 1) || counts[0] + 1);
      counts = [...new Set(counts)].sort((a, b) => a - b);
      const target = kind === 'more' ? counts[counts.length - 1] : counts[0];
      return {
        key: kind + obj + counts.join(), voice: ['q_' + kind],
        html: `<button class="say-bubble" data-say="q_${kind}">${ART.icon('speaker')}</button>
          <div class="giant n${counts.length}">${shuffle(counts).map((c) => `<div class="card opt gt plate" data-ok="${c === target ? 1 : 0}">${`<i>${ART.draw(obj)}</i>`.repeat(c)}</div>`).join('')}</div>`,
      };
    },
  },

  /* ---------------- little memory (Matan) ---------------- */
  mmemory: {
    child: 'matan', title: 'זיכרון קטן', titleId: 't_mmemory', per: 1, board: true,
    art: () => `<div class="mem-art"><i class="up">${ART.draw('dog')}</i><i></i><i></i><i class="up">${ART.draw('dog')}</i></div>`,
    pairsFor: (d) => (d < 1.5 ? 2 : d < 3 ? 3 : 4),
    stars(m, d) { return memStars(this.pairsFor(d))(m + 0.5); },
    make(d) {
      const n = this.pairsFor(d);
      const pairs = shuffle(HE_WORDS.filter((w) => w[2] === 'animal' || w[2] === 'vehicle').map((w) => w[0])).slice(0, n)
        .map((k) => ({ id: k, a: pictureCard(k), b: pictureCard(k), sayA: 'word_' + k, sayB: 'word_' + k }));
      return memoryQuestion({ pairs, cols: n === 2 ? 4 : n === 3 ? 3 : 4, inst: 'inst_mem_m', big: true });
    },
  },
});
