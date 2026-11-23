/* Screens, navigation, top bar, parents corner, time limits, full-screen. */
'use strict';

const APP_VERSION = '1.1.0';

const KIDS = {
  hodaya: { name: 'הודיה', gender: 'f', games: ['word', 'math', 'clock', 'zoo', 'memory', 'search', 'sentence', 'shop', 'pattern'], perPage: 6 },
  matan: { name: 'מתן', gender: 'm', games: ['count', 'letter', 'colors', 'shapes', 'shadow', 'bigsmall', 'mmemory'], perPage: 3 },
};

/* Desktop (Electron) build exposes window.ganDesktop from its preload script. */
const DESKTOP = !!(window.ganDesktop && window.ganDesktop.isDesktop);

const App = {
  child: null, screen: null, round: null, prevScreen: null, mapPage: {}, albumPage: 0, pathGame: null,
  gender() { return this.child ? KIDS[this.child].gender : 'm'; },

  /* ---------- stage scaling ---------- */
  fit() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080), st = $('#stage');
    st.style.transform = `scale(${s})`;
    st.style.left = `${(innerWidth - 1920 * s) / 2}px`;
    st.style.top = `${(innerHeight - 1080 * s) / 2}px`;
  },

  /** Background: the cream default, or a level world (theme cycles every 6 worlds with a new hue). */
  setWorld(w) {
    const key = w ? `${w.i}:${w.variant}` : '';
    const bg = $('#bg');
    if (bg.dataset.world === key) return;
    bg.dataset.world = key;
    bg.innerHTML = w && ART.world ? ART.world(w.i) : BG_SVG;
    bg.style.filter = w && w.variant ? `hue-rotate(${(w.variant * 47) % 360}deg) saturate(1.05)` : '';
  },

  mount(view, name, opts = {}) {
    Voice.stop();
    if (this.screen === 'draw-ed' && name !== 'draw-ed') Draw.leave();
    if (name !== 'game') this.round = null;
    this.screen = name;
    this.setWorld(opts.world || (name === 'game' && this.round && this.round.plan.kind === 'level' ? Levels.world(this.round.plan.level) : null));
    const scr = $('#screen'); scr.innerHTML = ''; scr.appendChild(view);
    $('#popo').classList.toggle('away', ['rest', 'path', 'draw-ed', 'draw-list', 'wardrobe'].includes(name));
    $('#popo').dataset.screen = name;
    this.setPopo(name === 'parents' ? 'glasses' : ['game', 'album', 'draw'].includes(name) ? 'point' : 'happy');
    this.topbar(name);
  },

  setPopo(mood, force) {
    const p = $('#popo .body'), key = mood + JSON.stringify(ART.outfit || {});
    if (force || p.dataset.mood !== key) { p.innerHTML = ART.popo(mood); p.dataset.mood = key; }
  },
  popoHop() { const p = $('#popo'); p.classList.remove('hop'); void p.offsetWidth; p.classList.add('hop'); },
  popoSay(id, text) {
    const b = $('#popo .bubble'); b.textContent = text; b.classList.add('show');
    clearTimeout(this._bt); this._bt = setTimeout(() => b.classList.remove('show'), 2400);
    this.popoHop(); Voice.say(id);
  },

  /* ---------- top bar ---------- */
  topbar(name) {
    const tb = $('#topbar'); tb.classList.remove('hidden');
    const minimal = name === 'profiles' || name === 'rest' || (name === 'parents' && !this.child);
    const c = this.child && Store.child(this.child);
    const fsIcon = document.fullscreenElement ? 'exitfull' : 'fullscreen';
    let center = '';
    if (name === 'parents') center = `<div class="pill who">${ART.icon('parent')}<span>הורים</span></div>`;
    else if (!minimal) center = `<button class="pill who" data-act="switch">${ART.avatar(this.child)}<span>${KIDS[this.child].name}</span></button>`;
    const back = name === 'game' && this.round && this.round.plan.kind === 'level' ? 'path'
      : ['draw-ed', 'draw-list'].includes(name) ? 'drawhome' : null;
    tb.innerHTML = `
      <div class="tb-right">${minimal && name !== 'parents' ? '' : `<button class="pill home" data-act="home">${ART.icon('house')}<span>בית</span></button>`}
        ${back ? `<button class="pill back" data-act="${back}" aria-label="חזרה">${ART.icon('back')}</button>` : ''}</div>
      <div class="tb-center">${center}</div>
      <div class="tb-left">
        <button class="tb-btn lock-btn" data-act="lock" aria-label="הורים">${ART.icon('lock')}<svg class="hold" viewBox="0 0 84 84"><circle cx="42" cy="42" r="38"/></svg></button>
        ${DESKTOP ? '' : `<button class="tb-btn" data-act="fs" aria-label="מסך מלא">${ART.icon(fsIcon)}</button>`}
        ${c && !minimal && name !== 'parents' ? `<div class="stars-count">${ART.icon('star')}<span>${Store.wallet(this.child)}</span></div>` : ''}
      </div>`;
    this.bindLock($('.lock-btn', tb));
  },

  bindLock(btn) {
    let t = null;
    const cancel = () => { clearTimeout(t); btn.classList.remove('holding'); };
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault(); btn.classList.add('holding');
      t = setTimeout(() => { cancel(); Sfx.play('click'); this.parentGate(); }, 3000);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, cancel));
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  },

  /* ---------- screens ---------- */
  profiles() {
    this.child = null; $('#stage').className = ''; ART.outfit = null;
    const card = (id) => `<button class="profile ${id} tap" data-kid="${id}"><div class="av">${ART.avatar(id)}</div><div class="nm">${KIDS[id].name}</div></button>`;
    const v = h(`<div class="view"><h1 class="title">מי משחק היום?</h1><div class="profiles">${card('hodaya')}${card('matan')}</div></div>`);
    v.addEventListener('click', (e) => {
      const b = e.target.closest('[data-kid]'); if (!b) return;
      Sfx.unlock(); Sfx.play('click'); this.enterFullscreen();
      this.selectChild(b.dataset.kid);
    });
    this.mount(v, 'profiles');
    Voice.say('who_plays');
  },

  selectChild(id) {
    this.child = id;
    $('#stage').className = 'theme-' + id;
    ART.outfit = Store.child(id).outfit;
    Sfx.enabled = Store.child(id).settings.sound;
    if (this.timeUp()) return this.rest();
    this.map();
  },

  map(page) {
    const id = this.child, kid = KIDS[id];
    if (this.timeUp()) return this.rest();
    const per = kid.perPage, pages = Math.ceil(kid.games.length / per);
    page = clamp(page ?? this.mapPage[id] ?? 0, 0, pages - 1); this.mapPage[id] = page;
    const games = kid.games.slice(page * per, page * per + per);
    const c = Store.child(id), dailyDone = Levels.dailyDone(id);
    const card = (g) => {
      const gs = Store.game(id, g), lv = gs.level;
      const done = lv - 1, inWorld = done % 10;
      return id === 'hodaya'
        ? `<div class="card gcard tap" data-game="${g}"><div class="gart">${GAMES[g].art()}</div>
            ${ringSVG(inWorld / 10, `<div class="lvl-n"><small>שלב</small>${lv}</div>`, 10)}
            <div class="gname">${GAMES[g].title}</div></div>`
        : `<div class="card mcard tap" data-game="${g}"><div class="gart">${GAMES[g].art()}</div>
            <div class="gname">${GAMES[g].title}</div>
            <div class="mrow">${ringSVG(inWorld / 10, `<div class="lvl-n">${lv}</div>`, 10)}${spk(GAMES[g].titleId)}</div></div>`;
    };
    const v = h(`<div class="view map ${id}"><h1 class="title">שלום ${kid.name}!</h1>
      <div class="card draw-card tap" data-go="draw" role="button"><div class="dc-art">${ART.icon('palette')}</div><div class="dc-name">הציור שלי</div>
        ${id === 'matan' ? spk('t_draw') : ''}</div>
      <div class="gpage ${id === 'hodaya' ? 'grid6' : 'grid3'}">${games.map(card).join('')}</div>
      ${page > 0 ? `<button class="pg-arrow right" data-page="${page - 1}" aria-label="הקודם">${ART.icon('back')}</button>` : ''}
      ${page < pages - 1 ? `<button class="pg-arrow left" data-page="${page + 1}" aria-label="הבא">${ART.icon('back')}</button>` : ''}
      <div class="dots">${Array.from({ length: pages }, (_, k) => `<i class="${k === page ? 'on' : ''}"></i>`).join('')}</div>
      <div class="map-bottom">
        <button class="mb daily ${dailyDone ? 'done' : ''}" data-go="daily">${ART.icon(dailyDone ? 'check' : 'gift')}<span>אתגר יומי</span></button>
        <button class="mb album" data-go="album">${ART.icon('album')}<span>האלבום שלי</span>${c.newSticker ? '<i class="new-dot"></i>' : ''}</button>
        <button class="mb wardrobe" data-go="wardrobe">${ART.icon('hanger')}<span>הארון של פופו</span></button>
      </div></div>`);
    v.addEventListener('click', (e) => {
      const sp = e.target.closest('[data-say]');
      if (sp) { e.stopPropagation(); Voice.say(sp.dataset.say, { btn: sp }); return; }
      const g = e.target.closest('[data-game]');
      if (g) { Sfx.play('click'); Levels.path(g.dataset.game); return; }
      const pg = e.target.closest('[data-page]');
      if (pg) { Sfx.play('click'); this.map(+pg.dataset.page); return; }
      const go = e.target.closest('[data-go]'); if (!go) return;
      Sfx.play('click');
      if (go.dataset.go === 'draw') Draw.home();
      else if (go.dataset.go === 'album') this.album();
      else if (go.dataset.go === 'wardrobe') this.wardrobe();
      else if (go.dataset.go === 'daily') {
        if (Levels.dailyDone(id)) { Voice.say('daily_done'); go.classList.remove('wrong'); void go.offsetWidth; go.classList.add('wrong'); return; }
        Voice.say('t_daily');
        setTimeout(() => this.screen === 'map' && Round.run(Levels.dailyPlan(id)), 1800);
      }
    });
    this.mount(v, 'map');
    Voice.say('hello_' + id);
  },

  showResult(r) {
    const { stars } = r;
    const C = 2 * Math.PI * 200, arc = C * .75;
    const lvl = r.kind === 'level';
    const v = h(`<div class="view result ${r.champ ? 'champ' : ''}">
      <h1 class="title">${r.champ ? 'אלוף השלב!' : r.kind === 'daily' ? 'האתגר הושלם!' : 'כל הכבוד!'}</h1>
      <button class="mini-album">${ART.icon('album')}</button>
      ${r.earned ? `<div class="earned">${ART.icon('star')}<span>+${r.earned}</span></div>` : ''}
      <div class="res-ring"><svg viewBox="-20 -20 480 480"><circle class="trk" cx="220" cy="220" r="200" stroke-dasharray="${arc} ${C}"/>
        <circle class="val" cx="220" cy="220" r="200" stroke-dasharray="${arc} ${C}" stroke-dashoffset="${arc}"/></svg>
        <div class="res-stars">${[0, 1, 2].map((i) => `<div class="s ${i === 1 ? 'mid' : ''}">${ART.draw('star')}</div>`).join('')}</div>
        <div class="res-popo">${ART.popo('happy')}</div></div>
      <div class="res-btns">${lvl ? `<button class="card tap again">${ART.icon('redo')}<span>עוד פעם</span></button>
        <button class="card tap next">${ART.icon('next')}<span>לשלב הבא</span></button>` : `<button class="card tap tomap">${ART.icon('house')}<span>למפה</span></button>`}</div></div>`);
    this.mount(v, 'result', { world: lvl ? Levels.world(r.level) : null });
    const val = $('.res-ring .val', v);
    requestAnimationFrame(() => requestAnimationFrame(() => { val.style.strokeDashoffset = arc * (1 - stars / 3); }));
    const ss = $$('.res-stars .s', v);
    [0, 2, 1].forEach((idx, k) => setTimeout(() => {
      const on = (idx === 0 && stars >= 1) || (idx === 2 && stars >= 2) || (idx === 1 && stars >= 3);
      ss[idx].classList.add(on ? 'on' : 'dim'); if (on) { Sfx.play('star'); confetti(ss[idx], 14); }
    }, 500 + k * 420));
    const f = this.gender() === 'f';
    const ids = [r.champ ? (f ? 'champ_f' : 'champ_m') : 'praise_0'];
    const fly = [];
    if (r.sticker) { ids.push(f ? 'new_sticker_f' : 'new_sticker'); fly.push(r.sticker); }
    if (r.special) { ids.push(f ? 'gold_sticker_f' : 'gold_sticker'); fly.push(r.special); }
    fly.forEach((sid, k) => setTimeout(() => {
      if (this.screen !== 'result') return;
      const s = h(`<div class="fly-sticker ${k ? 'second' : ''}" style="filter:url(#sticker)">${stickerArt(sid)}</div>`);
      $('#screen .view').appendChild(s); Sfx.play('sticker');
      $('.mini-album', v).classList.add('got');
      setTimeout(() => s.remove(), 2100);
    }, 1900 + k * 1500));
    setTimeout(() => this.screen === 'result' && Voice.say(ids), 600);
    v.addEventListener('click', (e) => {
      if (e.target.closest('.again')) { Sfx.play('click'); Round.start(r.gid, r.level); }
      else if (e.target.closest('.next')) { Sfx.play('click'); Levels.path(r.gid); }
      else if (e.target.closest('.tomap')) { Sfx.play('click'); this.map(); }
      else if (e.target.closest('.mini-album')) { Sfx.play('click'); this.album(); }
    });
    this.popoHop();
  },

  album(page) {
    const c = Store.child(this.child), isNew = c.newSticker;
    const lastNew = isNew ? c.stickers[c.stickers.length - 1] : null;
    if (page == null) page = lastNew ? STICKER_PAGES.findIndex((p) => p.items.includes(lastNew)) : this.albumPage || 0;
    this.albumPage = page;
    c.newSticker = false; Store.save();
    const P = STICKER_PAGES[page];
    const rots = [-6, 4, -3, 7, -5, 3];
    const slots = P.items.map((s, i) => c.stickers.includes(s)
      ? `<div class="slot ${s === lastNew ? 'new' : ''}"><div class="stk" style="--rot:${rots[i % 6]}deg">${stickerArt(s)}</div></div>`
      : `<div class="slot"><div class="ghost">${ART.draw(s.replace(/^gold_/, ''))}</div></div>`).join('');
    const total = c.stickers.length;
    const v = h(`<div class="view"><div class="book ${P.gold ? 'gold' : ''}"><div class="spiral">${'<i></i>'.repeat(16)}</div>
      <h2>${P.name}</h2><div class="album-count">${ART.icon('album')}<span>${total}/${STICKERS.length}</span></div>
      <div class="slots s20">${slots}</div>
      <div class="album-tabs">${STICKER_PAGES.map((p, k) => `<button class="${k === page ? 'on' : ''} ${p.gold ? 'gold' : ''}" data-page="${k}">${p.items.filter((s) => c.stickers.includes(s)).length}</button>`).join('')}</div></div>
      ${page > 0 ? `<button class="pg-arrow right" data-page="${page - 1}">${ART.icon('back')}</button>` : ''}
      ${page < STICKER_PAGES.length - 1 ? `<button class="pg-arrow left" data-page="${page + 1}">${ART.icon('back')}</button>` : ''}</div>`);
    v.addEventListener('click', (e) => { const b = e.target.closest('[data-page]'); if (b) { Sfx.play('click'); this.album(+b.dataset.page); } });
    this.mount(v, 'album');
    Voice.say('t_album');
  },

  /* ---------- Popo's wardrobe: buy items with stars, dress Popo ---------- */
  wardrobe(kind = 'hat') {
    const c = Store.child(this.child), items = (ART.WARDROBE || []).filter((w) => w.kind === kind);
    const KINDS = [['hat', 'כובעים'], ['glasses', 'משקפיים'], ['cape', 'גלימות'], ['color', 'צבעים']];
    const v = h(`<div class="view wardrobe-view">
      <div class="wr-popo card"><div class="wr-figure">${ART.popo('happy')}</div><div class="wallet-pill">${ART.icon('star')}<span>${Store.wallet(this.child)}</span></div></div>
      <div class="wr-shop"><div class="wr-tabs">${KINDS.map(([k, l]) => `<button class="${k === kind ? 'on' : ''}" data-kind="${k}">${l}</button>`).join('')}</div>
        <div class="wr-grid">${items.map((w) => {
          const own = c.owned.includes(w.id), worn = c.outfit[w.kind] === w.id;
          return `<button class="card wr-item ${own ? 'own' : ''} ${worn ? 'worn' : ''}" data-item="${w.id}">${ART.wearIcon(w.id)}<span class="nm">${w.name}</span>
            ${own ? (worn ? `<span class="tag on">${ART.icon('check')}</span>` : '') : `<span class="price">${ART.icon('star')}${w.price}</span>`}</button>`;
        }).join('')}</div></div></div>`);
    v.addEventListener('click', (e) => {
      const k = e.target.closest('[data-kind]');
      if (k) { Sfx.play('click'); return this.wardrobe(k.dataset.kind); }
      const it = e.target.closest('[data-item]'); if (!it) return;
      const w = ART.WARDROBE.find((x) => x.id === it.dataset.item);
      if (!c.owned.includes(w.id)) {
        if (Store.wallet(this.child) < w.price) { Sfx.play('wrong'); it.classList.remove('wrong'); void it.offsetWidth; it.classList.add('wrong'); Voice.say('need_stars'); return; }
        c.spent += w.price; c.owned.push(w.id); c.outfit[w.kind] = w.id;
        Sfx.play('sticker'); confetti(it, 20); Voice.say('bought');
      } else {
        c.outfit[w.kind] = c.outfit[w.kind] === w.id ? null : w.id; Sfx.play('click');
      }
      Store.save(); ART.outfit = c.outfit; this.setPopo('happy', true);
      this.wardrobe(kind);
    });
    this.mount(v, 'wardrobe');
    if (!this._wrSaid) { Voice.say('t_wardrobe'); }
    this._wrSaid = true; setTimeout(() => { this._wrSaid = false; }, 4000);
  },

  rest() {
    $('#stage').className = '';
    const v = h(`<div class="view rest"><div class="moon">${ART.draw('moon')}</div><div class="rest-popo">${ART.popo('sleep')}</div><h2>זמן לנוח! נתראה מחר</h2></div>`);
    this.mount(v, 'rest');
    Voice.say('rest');
  },

  /* ---------- parents ---------- */
  parentGate() {
    const a = rnd(11, 89), b = rnd(11, 89);
    let typed = '';
    const ov = $('#overlay');
    ov.innerHTML = `<div class="card gate"><h3>אזור הורים — כמה זה?</h3>
      <div class="eq"><span>${a} + ${b} =</span><span class="ans">&nbsp;</span></div>
      <div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button data-k="${n}">${n}</button>`).join('')}
        <button data-k="del">${ART.icon('del')}</button><button data-k="0">0</button><button data-k="ok" class="ok">${ART.icon('check')}</button></div>
      <div style="margin-top:28px"><button class="pbtn" data-k="close">ביטול</button></div></div>`;
    ov.classList.add('show');
    const ans = $('.ans', ov);
    ov.onclick = (e) => {
      const k = e.target.closest('[data-k]'); if (!k) { if (e.target === ov) this.closeOverlay(); return; }
      const key = k.dataset.k; Sfx.play('click');
      if (key === 'close') return this.closeOverlay();
      if (key === 'del') typed = typed.slice(0, -1);
      else if (key === 'ok') {
        if (+typed === a + b) { this.closeOverlay(); this.parents(); return; }
        typed = ''; ans.classList.remove('bad'); void ans.offsetWidth; ans.classList.add('bad'); Sfx.play('wrong');
      } else if (typed.length < 3) typed += key;
      ans.innerHTML = typed || '&nbsp;';
    };
  },
  closeOverlay() { const ov = $('#overlay'); ov.classList.remove('show'); ov.innerHTML = ''; ov.onclick = null; },

  parents() {
    if (this.screen !== 'parents') this.prevScreen = this.screen;
    const DIFF = [['auto', 'אוטומטי'], ['easy', 'קל'], ['medium', 'בינוני'], ['hard', 'קשה']];
    const LIM = [[0, 'ללא'], [15, '15'], [30, '30'], [45, '45']];
    const col = (id) => {
      const c = Store.child(id), s = c.settings, mins = Math.floor(c.time.secs / 60);
      const locked = s.limit > 0 && c.time.secs >= s.limit * 60 && !c.time.unlocked;
      return `<div class="card pcol" data-kid="${id}">
        <div class="ph">${ART.avatar(id)}<span>${KIDS[id].name}</span><small>היום: ${mins} דקות · ${ART.icon('star')}${c.stars}</small></div>
        <div class="prow"><label>רמת התחלה</label><div class="seg" data-set="difficulty">${DIFF.map(([v, l]) => `<button data-v="${v}" class="${s.difficulty === v ? 'on' : ''}">${l}</button>`).join('')}</div></div>
        <div class="prow"><label>דקות ביום</label><div class="seg" data-set="limit">${LIM.map(([v, l]) => `<button data-v="${v}" class="${s.limit === v ? 'on' : ''}">${l}</button>`).join('')}</div></div>
        <div class="prow"><label>צלילים</label><div><button class="toggle ${s.sound ? 'on' : ''}" data-set="sound" aria-label="צלילים"></button></div></div>
        <div class="prow"><label>שלבים</label><div class="plevels">${KIDS[id].games.map((g) => {
          const gs = Store.game(id, g);
          return `<div class="plv"><b>${gs.level - 1}</b><span>${GAMES[g].title}</span></div>`;
        }).join('')}</div></div>
        <div class="prow"><label>איפוס</label><div><button class="pbtn" data-act="reset">איפוס התקדמות</button>
          ${locked ? `<button class="pbtn ok" data-act="unlock">שחרור זמן להיום</button>` : ''}</div></div>
      </div>`;
    };
    const ver = DESKTOP && window.ganDesktop.version && window.ganDesktop.version !== APP_VERSION
      ? `גרסה ${APP_VERSION} · תוכנה ${window.ganDesktop.version}` : `גרסה ${APP_VERSION}`;
    const v = h(`<div class="view"><h1 class="title parents-title">אזור הורים</h1>
      ${DESKTOP ? `<button class="pbtn quit-btn" data-quit>יציאה</button>` : ''}
      <div class="pcols">${col('hodaya')}${col('matan')}</div>
      <div class="version" dir="rtl">${ver}${DESKTOP && window.ganDesktop.source ? ` · ${window.ganDesktop.source() === 'online' ? 'מחובר' : 'לא מקוון'}` : ''}</div></div>`);
    v.addEventListener('click', (e) => {
      if (e.target.closest('[data-quit]')) {
        Sfx.play('click');
        return this.confirm('לצאת מגן משחקים?', () => { Store.save(); window.ganDesktop.quit(); }, 'כן, לצאת');
      }
      const kidEl = e.target.closest('[data-kid]'); if (!kidEl) return;
      const id = kidEl.dataset.kid, c = Store.child(id);
      const segBtn = e.target.closest('.seg button'), tog = e.target.closest('.toggle'), act = e.target.closest('[data-act]');
      if (segBtn) {
        const key = segBtn.parentElement.dataset.set, val = segBtn.dataset.v;
        c.settings[key] = key === 'limit' ? +val : val;
        if (key === 'limit') c.time.unlocked = false;
        if (key === 'difficulty') for (const gs of Object.values(c.games)) { gs.adj = 0; gs.hist = []; }
      } else if (tog) c.settings.sound = !c.settings.sound;
      else if (act && act.dataset.act === 'unlock') { c.time.unlocked = true; }
      else if (act && act.dataset.act === 'reset') {
        return this.confirm(`לאפס את כל ההתקדמות של ${KIDS[id].name}? (שלבים, כוכבים, מדבקות ובגדים)`, () => { Store.reset(id); if (this.child === id) ART.outfit = Store.child(id).outfit; this.parents(); });
      } else return;
      Sfx.play('click'); Store.save();
      if (this.child) Sfx.enabled = Store.child(this.child).settings.sound;
      this.parents();
    });
    this.mount(v, 'parents');
  },

  confirm(text, yes, yesLabel = 'כן, לאפס') {
    const ov = $('#overlay');
    ov.innerHTML = `<div class="card modal"><h3>${text}</h3><div class="row">
      <button class="big-btn" data-c="yes">${yesLabel}</button><button class="big-btn soft" data-c="no">ביטול</button></div></div>`;
    ov.classList.add('show');
    ov.onclick = (e) => { const b = e.target.closest('[data-c]'); if (!b && e.target !== ov) return; this.closeOverlay(); if (b && b.dataset.c === 'yes') yes(); };
  },

  /* ---------- home / navigation ---------- */
  home() {
    if (this.screen === 'parents') {
      if (this.child && !this.timeUp()) return this.map();
      return this.child ? this.rest() : this.profiles();
    }
    if (this.child) this.map(); else this.profiles();
  },

  /* ---------- time limit ---------- */
  timeUp(id = this.child) {
    if (!id) return false;
    const c = Store.child(id);
    return c.settings.limit > 0 && c.time.secs >= c.settings.limit * 60 && !c.time.unlocked;
  },
  tick() {
    if (this.screen === 'rest' && this.child && !this.timeUp()) return this.map(); // new day (midnight) or unlocked
    if (!this.child || document.hidden || ['rest', 'parents', 'profiles'].includes(this.screen)) return;
    const c = Store.child(this.child);
    c.time.secs++;
    if (c.time.secs % 15 === 0) Store.save();
    if (this.timeUp()) { Store.save(); this.round = null; this.rest(); }
  },

  /* ---------- full-screen ---------- */
  enterFullscreen() {
    if (DESKTOP) return; // the desktop window is always full-screen
    const el = document.documentElement;
    if (document.fullscreenElement || !el.requestFullscreen) return;
    this.userExit = false;
    el.requestFullscreen({ navigationUI: 'hide' }).catch(() => { /* not allowed (e.g. iframe) */ });
  },
  onFullscreenChange() {
    if (DESKTOP) return;
    const ov = $('#overlay');
    if (document.fullscreenElement) {
      if (ov.dataset.kind === 'fs') { this.closeOverlay(); delete ov.dataset.kind; }
    } else if (!this.userExit && this.screen !== 'parents') {
      ov.dataset.kind = 'fs';
      ov.innerHTML = `<button class="big-btn" data-fs>${ART.icon('fullscreen')}<span>חזרה למסך מלא</span></button>`;
      ov.classList.add('show');
      ov.onclick = (e) => { if (e.target.closest('[data-fs]')) { delete ov.dataset.kind; this.closeOverlay(); this.enterFullscreen(); } };
    }
    if (this.screen) this.topbar(this.screen);
  },

  init() {
    this.fit();
    addEventListener('resize', () => this.fit());
    document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
    this.setWorld(null);
    $('#topbar').addEventListener('click', (e) => {
      const a = e.target.closest('[data-act]'); if (!a) return;
      const act = a.dataset.act;
      if (act === 'home') { Sfx.play('click'); this.home(); }
      else if (act === 'path') { Sfx.play('click'); Levels.path(this.round ? this.round.plan.gid : this.pathGame); }
      else if (act === 'drawhome') { Sfx.play('click'); Draw.home(); }
      else if (act === 'switch') { Sfx.play('click'); this.profiles(); }
      else if (act === 'fs') {
        Sfx.play('click');
        if (document.fullscreenElement) { this.userExit = true; document.exitFullscreen().catch(() => {}); }
        else this.enterFullscreen();
      }
    });
    $('#popo').addEventListener('click', () => {
      this.popoHop();
      const s = this.screen;
      if (s === 'game') Round.replay();
      else if (s === 'profiles') Voice.say('who_plays');
      else if (s === 'map') Voice.say('hello_' + this.child);
      else if (s === 'album') Voice.say('t_album');
      else if (s === 'draw') Voice.say('t_draw');
      else if (s === 'result') Voice.say('praise_0');
    });
    setInterval(() => this.tick(), 1000);
    document.addEventListener('visibilitychange', () => { if (document.hidden) Store.save(); });
    addEventListener('pagehide', () => Store.save());
    this.profiles();
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  },
};

/* Background: soft radial glow, paper clouds, layered hills. */
const BG_SVG = (() => {
  const cloud = (x, y, s, o = 1) => `<g transform="translate(${x} ${y}) scale(${s})" filter="url(#pbig)" opacity="${o}">
    <path d="M10 100 q-10 -34 26 -40 q6 -40 54 -38 q30 -20 62 6 q40 -12 56 24 q34 2 34 30 q0 18 -18 18 h-200 q-14 0 -14 0z" fill="#FFFDF8"/>
    <path d="M24 106 h210" stroke="#EADFCB" stroke-width="3" opacity=".7"/></g>`;
  return `<svg viewBox="0 0 1920 1080" preserveAspectRatio="none">
    <rect width="1920" height="1080" fill="url(#glow)"/>
    ${cloud(-30, 150, 1.6)}${cloud(300, 105, .75, .95)}${cloud(1630, 165, 1.35)}${cloud(1460, 300, .85, .95)}${cloud(190, 660, .7, .9)}
    <g filter="url(#pbig)"><path d="M0 720 q160 -40 330 10 q190 70 300 150 q-150 60 -630 60z" fill="#F1E3C6"/></g>
    <g filter="url(#pbig)"><path d="M1920 660 q-170 -30 -330 60 q-180 100 -330 170 q330 60 660 40z" fill="#F0E1C3"/></g>
    <g filter="url(#pbig)"><path d="M0 880 q300 -40 640 -10 q340 30 640 -20 q320 -40 640 10 v220 h-1920z" fill="#F7ECD8"/></g>
    <path d="M0 960 q480 -50 960 0 t960 -10 v130 h-1920z" fill="#FAF1E2" opacity=".8"/>
  </svg>`;
})();

App.init();
