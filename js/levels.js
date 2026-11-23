/* Endless levels: seeded, difficulty rising with the level number and adapting to the child;
   worlds every 20 levels, a champion level every 10, the daily challenge, stickers and the level-path screen. */
'use strict';

/* ---------- 120 stickers in six themed album pages (ids are drawing names; gold_* = special) ---------- */
const STICKER_PAGES = [
  { name: 'חיות', items: ['dog', 'cat', 'fish', 'horse', 'cow', 'bird', 'duck', 'monkey', 'elephant', 'frog', 'rabbit', 'lion', 'bear', 'snake', 'sheep', 'chicken', 'zebra', 'turtle', 'butterfly', 'bee'] },
  { name: 'אוכל', items: ['apple', 'banana', 'cake', 'strawberry', 'grapes', 'orange', 'pear', 'watermelon', 'bread', 'egg', 'milk', 'cheese', 'carrot', 'tomato', 'cucumber', 'corn', 'icecream', 'pizza', 'cherries', 'candy'] },
  { name: 'תחבורה וחלל', items: ['car', 'bus', 'train', 'airplane', 'boat', 'bicycle', 'rocket', 'truck', 'helicopter', 'ship', 'tractor', 'firetruck', 'planet', 'ufo', 'comet', 'astronaut', 'moon', 'star', 'sun', 'cloud'] },
  { name: 'בבית', items: ['house', 'ball', 'book', 'cup', 'shoe', 'hat', 'chair', 'clock', 'balloon', 'key', 'door', 'bed', 'table', 'lamp', 'umbrella', 'pencil', 'bag', 'glasses', 'gift', 'drum'] },
  { name: 'טבע ומשפחה', items: ['tree', 'flower', 'leaf', 'mountain', 'sea', 'rainbow', 'kite', 'mouse', 'pig', 'owl', 'snail', 'crab', 'lemon', 'mom', 'dad', 'baby', 'grandma', 'grandpa', 'brother', 'sister'] },
  { name: 'מדבקות זהב', gold: true, items: ['lion', 'rocket', 'rainbow', 'icecream', 'cake', 'gift', 'star', 'butterfly', 'astronaut', 'owl', 'turtle', 'elephant', 'firetruck', 'helicopter', 'strawberry', 'planet', 'sun', 'kite', 'drum', 'bee'].map((k) => 'gold_' + k) },
];
const STICKERS = STICKER_PAGES.flatMap((p) => p.items);
/* Normal stickers are given round-robin across the first five pages, so every page fills up a little at a time. */
const STICKER_ORDER = Array.from({ length: 20 }, (_, i) => [0, 1, 2, 3, 4].map((p) => STICKER_PAGES[p].items[i])).flat();
const GOLD_ORDER = STICKER_PAGES[5].items;
function stickerArt(id) {
  if (id.startsWith('gold_')) return `<div class="gold-stk"><i class="halo"></i>${ART.draw(id.slice(5))}</div>`;
  return ART.draw(id);
}

const Levels = {
  START: { auto: 0, easy: 0, medium: 2.5, hard: 5 },
  STEP: 0.3, // difficulty added per level
  PER_WORLD: 20,

  world(level) { const w = Math.floor((level - 1) / this.PER_WORLD); return { i: w % 6, variant: Math.floor(w / 6) }; },
  isChamp: (level) => level % 10 === 0,

  /** Difficulty of a level: fixed once the level has been played, so replays are identical. */
  diff(child, gid, level) {
    const gs = Store.game(child, gid);
    if (gs.d[level] != null) return gs.d[level];
    const s = Store.child(child).settings.difficulty;
    return Math.max(0, Math.round(((this.START[s] ?? 0) + (level - 1) * this.STEP + gs.adj) * 100) / 100);
  },

  plan(child, gid, level) {
    const g = GAMES[gid], gs = Store.game(child, gid);
    const champ = this.isChamp(level);
    const d = this.diff(child, gid, level);
    gs.d[level] = d; Store.save();
    const per = g.per || 8;
    const n = per + (champ && per > 1 ? 2 : 0);
    return { kind: 'level', gid, level, champ, seed: hashStr(`${child}:${gid}:${level}`), items: Array.from({ length: n }, () => ({ gid, d: champ ? d + .5 : d })) };
  },

  nextSticker(c, gold) {
    const order = gold ? GOLD_ORDER : STICKER_ORDER;
    const id = order.find((s) => !c.stickers.includes(s));
    if (!id) return null;
    c.stickers.push(id); c.newSticker = true;
    return id;
  },

  finishLevel(child, gid, level, stars) {
    const c = Store.child(child), gs = Store.game(child, gid), champ = this.isChamp(level);
    const prev = gs.stars[level] || 0, first = !prev;
    gs.stars[level] = Math.max(prev, stars);
    gs.best = Math.max(gs.best, stars); gs.rounds++; if (stars >= 2) gs.won++;
    if (level >= gs.level) gs.level = level + 1;
    // adaptive difficulty: two 3-star levels in a row -> harder, two 1-star levels in a row -> easier
    const step = c.settings.difficulty === 'auto' ? 1.5 : 1;
    gs.hist = [...(gs.hist || []), stars].slice(-2);
    if (gs.hist.length === 2 && gs.hist.every((s) => s === 3)) { gs.adj += step; gs.hist = []; }
    else if (gs.hist.length === 2 && gs.hist.every((s) => s === 1)) { gs.adj = Math.max(-8, gs.adj - step); gs.hist = []; }
    const earned = Math.max(0, stars - prev) * (champ ? 2 : 1) + (champ && first ? 5 : 0);
    c.stars += earned;
    const sticker = first && stars >= 2 ? this.nextSticker(c, false) : null;
    const special = champ && first ? this.nextSticker(c, true) : null;
    Store.save();
    return { earned, sticker, special, first };
  },

  /* ---------- daily challenge: 5 mixed questions from all the child's games ---------- */
  dailyDone(child) { const dl = Store.child(child).daily; return dl.date === todayStr() && dl.done; },
  dailyPlan(child) {
    const games = KIDS[child].games.filter((g) => !GAMES[g].board);
    const seed = hashStr(`${child}:daily:${todayStr()}`);
    RNG.seed(seed); const order = shuffle(games); RNG.free();
    const items = Array.from({ length: 5 }, (_, i) => {
      const gid = order[i % order.length], gs = Store.game(child, gid);
      return { gid, d: this.diff(child, gid, Math.max(1, gs.level)) };
    });
    return { kind: 'daily', items, seed };
  },
  finishDaily(child, stars) {
    const c = Store.child(child), already = this.dailyDone(child);
    c.daily = { date: todayStr(), done: true, stars: Math.max(stars, already ? c.daily.stars : 0) };
    let earned = 0, special = null;
    if (!already) { earned = stars * 2; c.stars += earned; special = this.nextSticker(c, true); }
    Store.save();
    return { earned, special, sticker: null, first: !already };
  },

  /* ---------- the level path: a winding paper road with 10 stations per page ---------- */
  POS: [[1530, 410], [1260, 375], [990, 415], [720, 385], [460, 470], [440, 690], [710, 745], [980, 695], [1250, 745], [1490, 850]],
  roadPath(pts) {
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
    }
    return d;
  },
  path(gid, page) {
    const child = App.child, gs = Store.game(child, gid), g = GAMES[gid];
    const maxPage = Math.floor((gs.level - 1) / 10);
    page = clamp(page ?? maxPage, 0, maxPage);
    const first = page * 10 + 1, w = this.world(first), col = (ART.WORLD_COLORS || [])[w.i] || { accent: '#1FB5A8', road: '#E7D3B0', light: '#FFF6E6' };
    const pts = this.POS;
    const lead = [[1730, 440], ...pts]; // the road enters from the right edge
    const road = this.roadPath(page < maxPage || gs.level > first + 9 ? [...lead, [1720, 990]] : lead);
    const stations = pts.map(([x, y], k) => {
      const L = first + k, champ = this.isChamp(L), s = gs.stars[L] || 0;
      const state = L < gs.level ? 'done' : L === gs.level ? 'current' : 'locked';
      return `<button class="station ${state} ${champ ? 'champ' : ''}" data-level="${L}" style="left:${x}px;top:${y}px" ${state === 'locked' ? 'disabled' : ''}>
        ${champ ? `<i class="crown">${ART.icon('star')}</i>` : ''}<span class="num">${state === 'locked' && !champ ? ART.icon('lock') : L}</span>
        ${state === 'done' ? `<span class="sstars">${starsHTML(s)}</span>` : ''}
        ${state === 'current' ? `<span class="here">${ART.popo('happy')}</span>` : ''}</button>`;
    }).join('');
    const v = h(`<div class="view lpath" style="--wa:${col.accent};--wr:${col.road}">
      <div class="lp-head card"><div class="lp-art">${g.art()}</div><div><div class="lp-title">${g.title}</div>
        <div class="lp-world">${ART.WORLD_NAMES ? ART.WORLD_NAMES[w.i] : ''} · שלבים ${first}–${first + 9}</div></div>${spk(g.titleId)}</div>
      <svg class="road" viewBox="0 0 1920 1080"><g filter="url(#pbig)"><path d="${road}" stroke="var(--wr)" stroke-width="96" fill="none" stroke-linecap="round"/></g>
        <path d="${road}" stroke="#fff" stroke-opacity=".7" stroke-width="7" stroke-dasharray="26 24" fill="none" stroke-linecap="round"/></svg>
      ${stations}
      ${page < maxPage ? `<button class="pg-arrow left" data-page="${page + 1}" aria-label="הבא">${ART.icon('back')}</button>` : ''}
      ${page > 0 ? `<button class="pg-arrow right" data-page="${page - 1}" aria-label="הקודם">${ART.icon('back')}</button>` : ''}
    </div>`);
    v.addEventListener('click', (e) => {
      const sp = e.target.closest('[data-say]');
      if (sp) { Voice.say(sp.dataset.say, { btn: sp }); return; }
      const st = e.target.closest('.station:not([disabled])');
      if (st) { Sfx.play('click'); Round.start(gid, +st.dataset.level); return; }
      const pg = e.target.closest('[data-page]');
      if (pg) { Sfx.play('click'); this.path(gid, +pg.dataset.page); }
    });
    App.mount(v, 'path', { world: w });
    App.pathGame = gid;
    Voice.say(g.titleId);
  },
};
