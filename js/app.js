/* Screens, navigation, top bar, parents corner, time limits, full-screen. */
'use strict';

const KIDS = {
  hodaya: { name: 'הודיה', gender: 'f', games: ['word', 'math', 'clock', 'zoo'] },
  matan: { name: 'מתן', gender: 'm', games: ['count', 'letter'] },
};

/* Desktop (Electron) build exposes window.ganDesktop from its preload script. */
const DESKTOP = !!(window.ganDesktop && window.ganDesktop.isDesktop);

const App = {
  child: null, screen: null, round: null, prevScreen: null,
  gender() { return this.child ? KIDS[this.child].gender : 'm'; },

  /* ---------- stage scaling ---------- */
  fit() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080), st = $('#stage');
    st.style.transform = `scale(${s})`;
    st.style.left = `${(innerWidth - 1920 * s) / 2}px`;
    st.style.top = `${(innerHeight - 1080 * s) / 2}px`;
  },

  mount(view, name) {
    Voice.stop();
    if (name !== 'game') this.round = null;
    this.screen = name;
    const scr = $('#screen'); scr.innerHTML = ''; scr.appendChild(view);
    $('#popo').classList.toggle('away', name === 'rest');
    $('#popo').dataset.screen = name;
    this.setPopo(name === 'parents' ? 'glasses' : name === 'game' || name === 'album' ? 'point' : 'happy');
    this.topbar(name);
  },

  setPopo(mood) {
    const p = $('#popo .body');
    if (p.dataset.mood !== mood) { p.innerHTML = ART.popo(mood); p.dataset.mood = mood; }
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
    tb.innerHTML = `
      <div class="tb-right">${minimal && name !== 'parents' ? '' : `<button class="pill home" data-act="home">${ART.icon('house')}<span>בית</span></button>`}</div>
      <div class="tb-center">${center}</div>
      <div class="tb-left">
        <button class="tb-btn lock-btn" data-act="lock" aria-label="הורים">${ART.icon('lock')}<svg class="hold" viewBox="0 0 84 84"><circle cx="42" cy="42" r="38"/></svg></button>
        ${DESKTOP ? '' : `<button class="tb-btn" data-act="fs" aria-label="מסך מלא">${ART.icon(fsIcon)}</button>`}
        ${c && !minimal && name !== 'parents' ? `<div class="stars-count">${ART.icon('star')}<span>${c.stars}</span></div>` : ''}
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
    this.child = null; $('#stage').className = '';
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
    Sfx.enabled = Store.child(id).settings.sound;
    if (this.timeUp()) return this.rest();
    this.map();
  },

  map() {
    const id = this.child, kid = KIDS[id];
    if (this.timeUp()) return this.rest();
    let cards;
    if (id === 'hodaya') {
      cards = `<div class="grid4">${kid.games.map((g) => {
        const s = Store.game(id, g);
        return `<div class="card gcard tap" data-game="${g}"><div class="gart">${GAMES[g].art()}</div>
          ${ringSVG(Math.min(1, s.won / 10), `<div class="mini">${starsHTML(s.best)}</div>`, 10)}
          <div class="gname">${GAMES[g].title}</div>${starsHTML(s.best)}</div>`;
      }).join('')}</div>`;
    } else {
      cards = `<div class="grid2">${kid.games.map((g) => {
        const s = Store.game(id, g);
        return `<div class="card mcard tap" data-game="${g}"><div class="gart">${GAMES[g].art()}</div>
          <div class="gname">${GAMES[g].title}</div>
          <div class="mrow">${ringSVG(Math.min(1, s.won / 10), starsHTML(s.best).replace('class="stars"', 'class="stars" style="transform:scale(.55)"'), 10)}
            <button class="speak" data-say="${GAMES[g].titleId}">${ART.icon('speaker')}</button></div></div>`;
      }).join('')}</div>`;
    }
    const v = h(`<div class="view"><h1 class="title">שלום ${kid.name}!</h1>${cards}
      <button class="album-btn">${ART.icon('album')}<span>האלבום שלי</span></button></div>`);
    v.addEventListener('click', (e) => {
      const sp = e.target.closest('[data-say]');
      if (sp) { e.stopPropagation(); Voice.say(sp.dataset.say, { btn: sp }); return; }
      const g = e.target.closest('[data-game]');
      if (g) { Sfx.play('click'); Round.start(g.dataset.game); return; }
      if (e.target.closest('.album-btn')) { Sfx.play('click'); this.album(); }
    });
    this.mount(v, 'map');
    Voice.say('hello_' + id);
  },

  showResult(gid, stars, sticker) {
    const C = 2 * Math.PI * 200, arc = C * .75;
    const v = h(`<div class="view result">
      <h1 class="title">כל הכבוד!</h1>
      <button class="mini-album">${ART.icon('album')}</button>
      <div class="res-ring"><svg viewBox="-20 -20 480 480"><circle class="trk" cx="220" cy="220" r="200" stroke-dasharray="${arc} ${C}"/>
        <circle class="val" cx="220" cy="220" r="200" stroke-dasharray="${arc} ${C}" stroke-dashoffset="${arc}"/></svg>
        <div class="res-stars">${[0, 1, 2].map((i) => `<div class="s ${i === 1 ? 'mid' : ''}">${ART.draw('star')}</div>`).join('')}</div>
        <div class="res-popo">${ART.popo('happy')}</div></div>
      <div class="res-btns"><button class="card tap again">${ART.icon('redo')}<span>עוד פעם</span></button>
        <button class="card tap next">${ART.icon('next')}<span>למשחק הבא</span></button></div></div>`);
    this.mount(v, 'result');
    this.topbar('result');
    const val = $('.res-ring .val', v);
    requestAnimationFrame(() => requestAnimationFrame(() => { val.style.strokeDashoffset = arc * (1 - stars / 3); }));
    const ss = $$('.res-stars .s', v);
    [0, 2, 1].forEach((idx, k) => setTimeout(() => {
      // order left, right, middle (middle = biggest last)
      const on = (idx === 0 && stars >= 1) || (idx === 2 && stars >= 2) || (idx === 1 && stars >= 3);
      ss[idx].classList.add(on ? 'on' : 'dim'); if (on) { Sfx.play('star'); confetti(ss[idx], 14); }
    }, 500 + k * 420));
    const ids = ['praise_0'];
    if (sticker >= 0) {
      ids.push(this.gender() === 'f' ? 'new_sticker_f' : 'new_sticker');
      setTimeout(() => {
        if (this.screen !== 'result') return;
        const s = h(`<div class="fly-sticker" style="filter:url(#sticker)">${ART.draw(STICKERS[sticker])}</div>`);
        $('#screen .view').appendChild(s); Sfx.play('sticker');
        $('.mini-album', v).classList.add('got');
        setTimeout(() => s.remove(), 2100);
      }, 1900);
    }
    setTimeout(() => this.screen === 'result' && Voice.say(ids), 600);
    v.addEventListener('click', (e) => {
      if (e.target.closest('.again')) { Sfx.play('click'); Round.start(gid); }
      else if (e.target.closest('.next')) { const gs = KIDS[this.child].games; Sfx.play('click'); Round.start(gs[(gs.indexOf(gid) + 1) % gs.length]); }
      else if (e.target.closest('.mini-album')) { Sfx.play('click'); this.album(); }
    });
    this.popoHop();
  },

  album() {
    const c = Store.child(this.child), isNew = c.newSticker;
    c.newSticker = false; Store.save();
    const rots = [-6, 4, -3, 7, -5, 3];
    const slots = STICKERS.map((s, i) => i < c.stickers
      ? `<div class="slot ${isNew && i === c.stickers - 1 ? 'new' : ''}"><div class="stk" style="--rot:${rots[i % 6]}deg">${ART.draw(s)}</div></div>`
      : `<div class="slot"><div class="ghost">${ART.draw(s)}</div></div>`).join('');
    const v = h(`<div class="view"><div class="book"><div class="spiral">${'<i></i>'.repeat(16)}</div>
      <h2>האלבום שלי</h2><div class="album-count">${ART.icon('album')}<span>${c.stickers}/${STICKERS.length}</span></div>
      <div class="slots">${slots}</div></div></div>`);
    this.mount(v, 'album');
    Voice.say('t_album');
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
    const DIFF = [['easy', 'קל'], ['medium', 'בינוני'], ['hard', 'קשה']];
    const LIM = [[0, 'ללא הגבלה'], [15, '15'], [30, '30'], [45, '45']];
    const col = (id) => {
      const c = Store.child(id), s = c.settings, mins = Math.floor(c.time.secs / 60);
      const locked = s.limit > 0 && c.time.secs >= s.limit * 60 && !c.time.unlocked;
      return `<div class="card pcol" data-kid="${id}">
        <div class="ph">${ART.avatar(id)}<span>${KIDS[id].name}</span><small>היום: ${mins} דקות</small></div>
        <div class="prow"><label>רמת קושי</label><div class="seg" data-set="difficulty">${DIFF.map(([v, l]) => `<button data-v="${v}" class="${s.difficulty === v ? 'on' : ''}">${l}</button>`).join('')}</div></div>
        <div class="prow"><label>זמן משחק ביום</label><div class="seg" data-set="limit">${LIM.map(([v, l]) => `<button data-v="${v}" class="${s.limit === v ? 'on' : ''}">${l}</button>`).join('')}</div></div>
        <div class="prow"><label>צלילים</label><div><button class="toggle ${s.sound ? 'on' : ''}" data-set="sound" aria-label="צלילים"></button></div></div>
        <div class="prow"><label>התקדמות</label><div class="prings">${KIDS[id].games.map((g) => {
          const gs = Store.game(id, g);
          return `<div class="pring">${ringSVG(Math.min(1, gs.won / 10), `${gs.best}${ART.icon('star').replace('class="ico ', 'style="width:20px;height:20px" class="ico ')}`, 12)}<span>${GAMES[g].title}</span></div>`;
        }).join('')}</div></div>
        <div class="prow"><label>איפוס התקדמות</label><div><button class="pbtn" data-act="reset">איפוס</button>
          ${locked ? `<button class="pbtn ok" data-act="unlock">שחרור זמן להיום</button>` : ''}</div></div>
      </div>`;
    };
    const v = h(`<div class="view"><h1 class="title parents-title">אזור הורים</h1>
      ${DESKTOP ? `<button class="pbtn quit-btn" data-quit>יציאה</button>` : ''}
      <div class="pcols">${col('hodaya')}${col('matan')}</div></div>`);
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
      } else if (tog) c.settings.sound = !c.settings.sound;
      else if (act && act.dataset.act === 'unlock') { c.time.unlocked = true; }
      else if (act && act.dataset.act === 'reset') {
        return this.confirm(`לאפס את כל ההתקדמות של ${KIDS[id].name}? (כוכבים, מדבקות ושיאים)`, () => { Store.reset(id); this.parents(); });
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
    $('#bg').innerHTML = BG_SVG;
    $('#topbar').addEventListener('click', (e) => {
      const a = e.target.closest('[data-act]'); if (!a) return;
      const act = a.dataset.act;
      if (act === 'home') { Sfx.play('click'); this.home(); }
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
