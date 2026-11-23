/* The games and the shared level engine.
   A game's make(d, i, st) builds question i at difficulty d (0 = easiest, rises without limit).
   Generation uses the seeded RNG, so a level plays the same every time.
   A question is either "tap the right .opt" (data-ok="1") or interactive: q.mount(body, api) and the game
   calls api.ok(el) / api.bad(el) / api.good(el) itself. */
'use strict';

const HEB22 = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];
const LETTER_KEYS = ['alef', 'bet', 'gimel', 'dalet', 'he', 'vav', 'zayin', 'het', 'tet', 'yod', 'kaf', 'lamed', 'mem', 'nun', 'samekh', 'ayin', 'pe', 'tsadi', 'qof', 'resh', 'shin', 'tav'];
const FINAL = { 'כ': 'ך', 'מ': 'ם', 'נ': 'ן', 'פ': 'ף', 'צ': 'ץ' };
const BLOCK_COLORS = ['#1FB5A8', '#FF8A3D', '#8E6CEF', '#F07EA0', '#4FA8E0', '#6DBB5F', '#F5A623'];

/** Pick `n` distinct values: answer + distractors (preferred first, then from pool). */
function optionSet(answer, n, preferred, pool) {
  const out = [answer];
  for (const v of shuffle(preferred).concat(shuffle(pool))) {
    if (out.length >= n) break;
    if (!out.includes(v)) out.push(v);
  }
  return shuffle(out);
}
/** Choose from a list where the last (newest, hardest) entry gets extra weight. */
function pickNewest(list) { return RNG.r() < .45 ? list[list.length - 1] : pick(list); }
const spk = (id, cls = '') => `<button class="speak ${cls}" data-say="${id}">${ART.icon('speaker')}</button>`;

const STORY_OBJ_ART = { apples: 'apple', balloons: 'balloon', fish: 'fish', stars: 'star', flowers: 'flower', cars: 'car', birds: 'bird', bananas: 'banana' };

const GAMES = {
  /* ---------------- math bubbles ---------------- */
  math: {
    child: 'hodaya', title: 'חשבון בבועות', titleId: 't_math', per: 8,
    art: () => `<div class="bubbles-art">${[[78, 30, 82, 58, 3], [20, 30, 44, 34, 5], [80, 0, 44, 32, 9], [150, 30, 44, 30, 8], [30, 92, 48, 32, 2], [140, 86, 50, 34, 2], [0, 70, 24, 0, ''], [176, 4, 26, 0, '']]
      .map(([x, y, s, f, t]) => `<span style="left:${x}px;top:${y}px;width:${s}px;height:${s}px;font-size:${f}px">${t}</span>`).join('')}</div>`,
    make(d, i) {
      const types = ['add'];
      if (d >= 1.5) types.push('sub');
      if (d >= 2) types.push('missing');
      if (d >= 2.5) types.push('cmp');
      if (d >= 3.5) types.push('story');
      if (d >= 5.5) types.push('mul');
      if (d >= 7.5) types.push('div');
      const type = i === 0 ? 'add' : pickNewest(types);
      const max = d < 1.5 ? 10 : d < 3 ? 20 : d < 5 ? 50 : 100;
      const addPair = () => { const a = rnd(1, max - 1); return [a, rnd(1, max - a)]; };
      const subPair = () => { const a = rnd(2, max); return [a, rnd(1, a - 1)]; };
      const mulMax = d < 7 ? 5 : 10;
      const tints = shuffle(['#E3DAF3', '#F4DDD2', '#DCEFE6', '#F6E1EA', '#DDE8F4']);
      const pos = [[40, 30], [250, 280], [480, 10], [660, 270]];
      const bubbles = (opts, ans) => `<div class="bubble-field">${opts.map((v, k) => `<div class="bub-wrap" style="left:${pos[k][0]}px;top:${pos[k][1]}px">
            <div class="bub opt" data-ok="${v === ans ? 1 : 0}" style="background:radial-gradient(circle at 40% 35%, #fff 0 8%, ${tints[k]} 55%, ${tints[k]})">${v}</div></div>`).join('')}</div>`;
      const deco = `<i class="deco-bub" style="left:270px;top:390px;width:84px;height:84px"></i><i class="deco-bub" style="left:210px;top:500px;width:46px;height:46px;animation-delay:-2s"></i>
          <i class="deco-bub" style="left:1420px;top:500px;width:40px;height:40px;animation-delay:-1s"></i>`;
      const numOpts = (ans) => { const offs = [-10, -3, -2, -1, 1, 2, 3, 10].map((x) => ans + x).filter((v) => v >= 0); return optionSet(ans, 4, offs.slice(1, 7), offs); };

      if (type === 'cmp') {
        const a = rnd(0, max); let b = rnd(0, max); if (RNG.r() < .2) b = a;
        const ans = a > b ? '>' : a < b ? '<' : '=';
        return {
          key: `c${a}_${b}`, voice: ['inst_cmp'],
          html: `<div class="qcard"><div class="card"><span class="eq" dir="ltr">${a} <b class="qa">?</b> ${b}</span></div>${spk('inst_cmp')}</div>
            <div class="cmp-opts" dir="ltr">${['<', '=', '>'].map((s) => `<div class="card opt sym" data-ok="${s === ans ? 1 : 0}">${s}</div>`).join('')}</div>`,
          onCorrect: (root) => { $('.qa', root).textContent = ans; },
        };
      }
      if (type === 'story') {
        const bank = STORIES.filter((s) => (d < 5 ? Math.max(s.a, s.a + (s.op === '+' ? s.b : 0)) <= 6 : true));
        const s = pick(bank), ans = s.op === '+' ? s.a + s.b : s.a - s.b;
        const art = STORY_OBJ_ART[s.obj];
        const row = (k, cls = '') => `<div class="sgroup ${cls}">${Array.from({ length: k }, () => `<i>${ART.draw(art)}</i>`).join('')}</div>`;
        return {
          key: 's' + s.id, voice: ['story_' + s.id], longVoice: true,
          html: `<div class="story card"><div class="stext">${s.text}</div>${spk('story_' + s.id)}
              <div class="spics" dir="ltr">${s.op === '+' ? `${row(s.a)}<b>+</b>${row(s.b)}` : `${row(s.a - s.b)}${row(s.b, 'gone')}`}</div></div>
            <div class="story-opts" dir="ltr">${numOpts(ans).map((v) => `<div class="card opt" data-ok="${v === ans ? 1 : 0}">${v}</div>`).join('')}</div>`,
        };
      }
      let a, b, op, res;
      if (type === 'mul') { a = rnd(1, mulMax); b = rnd(1, mulMax); op = '×'; res = a * b; }
      else if (type === 'div') { b = rnd(2, 10); res = rnd(1, 10); a = b * res; op = '÷'; }
      else if (type === 'sub' || (type === 'missing' && RNG.r() < .5)) { [a, b] = subPair(); op = '−'; res = a - b; }
      else { [a, b] = addPair(); op = '+'; res = a + b; }
      const hide = type === 'missing' ? pick(['a', 'b']) : 'res';
      const ans = hide === 'a' ? a : hide === 'b' ? b : res;
      const cell = (k, v) => (k === hide ? '<b class="qa">?</b>' : v);
      const inst = type === 'missing' ? 'inst_missing' : 'inst_math';
      return {
        key: `${a}${op}${b}${hide}`, voice: [inst],
        html: `<div class="qcard"><div class="card"><span class="eq" dir="ltr">${cell('a', a)} ${op} ${cell('b', b)} = ${cell('res', res)}</span></div>
            ${spk(inst)}</div>${bubbles(numOpts(ans), ans)}${deco}`,
        onCorrect: (root) => { $('.qa', root).textContent = ans; },
      };
    },
  },

  /* ---------------- missing letter → whole-word spelling ---------------- */
  word: {
    child: 'hodaya', title: 'המילה החסרה', titleId: 't_word', per: 8,
    art: () => `<div style="display:flex;align-items:center;gap:18px"><div style="width:140px;height:140px">${ART.draw('dog')}</div>
      <div class="word-art"><div><b>כ</b><b class="gap">_</b><b>ב</b></div></div></div>`,
    make(d, i) {
      const maxLen = d < 1.5 ? 3 : d < 3 ? 4 : 9;
      const [key, word] = pick(HE_WORDS.filter(([, w]) => w.length <= maxLen && w.length >= 2));
      const letters = [...word];
      if (d >= 8 || (d >= 6 && i % 2 === 1) || (d >= 4 && i % 3 === 2)) return spellQuestion(key, letters, d);
      const idx = d < 1.5 ? 0 : rnd(0, letters.length - 1);
      const ans = letters[idx], isLast = idx === letters.length - 1;
      const toPos = (l) => (isLast && FINAL[l] ? FINAL[l] : l);
      const groups = [['ב', 'כ'], ['ד', 'ר'], ['ה', 'ח'], ['ו', 'ז'], ['ס', 'ם'], ['ט', 'מ'], ['ן', 'ו', 'ז'], ['ץ', 'צ'], ['ך', 'ר', 'ד']];
      const mates = d >= 3.5 ? groups.filter((g) => g.includes(ans)).flat().filter((l) => l !== ans) : [];
      const lpool = HEB22.map(toPos).filter((l) => l !== ans && !letters.includes(l));
      const opts = optionSet(ans, d < 1.5 ? 3 : 4, mates, lpool);
      return {
        key, voice: ['inst_word', 'word_' + key],
        html: `<div class="pic">${ART.draw(key)}</div>${spk('word_' + key, 'pic-speak')}
          <div class="tiles">${letters.map((l, k) => k === idx ? `<div class="tile card gap"></div>` : `<div class="tile card">${l}</div>`).join('')}</div>
          <div class="letter-opts">${opts.map((l) => `<div class="card opt" data-ok="${l === ans ? 1 : 0}">${l}</div>`).join('')}</div>`,
        onCorrect: (root) => { const g = $('.tile.gap', root); g.textContent = ans; g.classList.add('filled'); },
        correctVoice: ['word_' + key],
      };
    },
  },

  /* ---------------- English ---------------- */
  zoo: {
    child: 'hodaya', title: 'אנגלית בגן החיות', titleId: 't_zoo', per: 8,
    art: () => `<div class="zoo-art">
        <div class="a" style="right:10px;top:-6px">${ART.draw('dog')}</div><span class="tag" style="right:118px;top:20px">Dog</span>
        <div class="a" style="right:30px;top:76px">${ART.draw('cat')}</div><span class="tag" style="right:140px;top:112px">Cat</span></div>`,
    make(d, i) {
      const cats = EN_CATS.slice(0, d < 1 ? 1 : d < 2 ? 2 : d < 3 ? 3 : d < 4.5 ? 4 : d < 6 ? 5 : 6);
      const cat = pickNewest(cats);
      const inCat = EN_WORDS.filter((w) => w[2] === cat).map((w) => w[0]);
      const ans = pick(inCat);
      const opts = optionSet(ans, d < 1 ? 3 : 4, inCat, EN_WORDS.map((w) => w[0]));
      const mode = d >= 4 && i % 3 === 2 ? 'reverse' : d >= 2.5 && i % 3 === 1 ? 'listen' : 'pick';
      if (mode === 'reverse') {
        return {
          key: 'r' + ans, voice: ['inst_en_word'], correctVoice: ['en_' + ans],
          html: `<div class="ctitle">${spk('inst_en_word')}<span>איך אומרים באנגלית?</span></div>
            <div class="en-pic card">${enArt(ans)}</div>
            <div class="en-words">${opts.map((k) => `<div class="card opt" data-ok="${k === ans ? 1 : 0}" dir="ltr">${EN[k].en}</div>`).join('')}</div>`,
        };
      }
      return {
        key: ans, voice: ['inst_zoo', 'en_' + ans], correctVoice: ['en_' + ans],
        html: `<div class="zbar card">
            <div class="heb">${spk('inst_zoo')}<span>מה זה באנגלית?</span></div>
            <div class="eng ${mode === 'listen' ? 'hidden-word' : ''}"><span class="w">${EN[ans].en.toUpperCase()}</span>${spk('en_' + ans)}</div></div>
          <div class="zcards ${opts.length === 4 ? 'four' : ''}">${opts.map((k) => `<div class="card opt" data-ok="${k === ans ? 1 : 0}">${enArt(k)}</div>`).join('')}</div>`,
        onCorrect: (root) => { $('.eng', root).classList.remove('hidden-word'); },
      };
    },
  },

  /* ---------------- what time is it / set the clock ---------------- */
  clock: {
    child: 'hodaya', title: 'מה השעה?', titleId: 't_clock', per: 8,
    art: () => `<div style="width:170px;height:170px">${ART.draw('clock')}</div>`,
    make(d, i) {
      const step = d < 1.5 ? 60 : d < 3 ? 30 : d < 5 ? 15 : 5;
      const hr = rnd(1, 12), mn = step === 60 ? 0 : rnd(0, 60 / step - 1) * step;
      const fmt = (H, M) => `${H}:${String(M).padStart(2, '0')}`;
      const ans = fmt(hr, mn);
      if (d >= 2 && (i % 3 === 2 || (d >= 5 && i % 2 === 1))) return setClockQuestion(hr, mn, step, ans);
      const wrap12 = (x) => ((x - 1 + 12) % 12) + 1;
      const pref = [fmt(wrap12(hr + 1), mn), fmt(wrap12(hr - 1), mn)];
      if (mn && ((hr % 12) * 5) % step === 0) pref.push(fmt(wrap12(mn / 5), (hr % 12) * 5)); // hands swapped
      if (step < 60) pref.push(fmt(hr, (mn + 30) % 60), fmt(hr, (mn + step) % 60));
      const opts = optionSet(ans, 3, pref, Array.from({ length: 12 }, (_, k) => fmt(k + 1, mn)));
      return {
        key: ans, voice: ['inst_clock'],
        html: `<div class="ctitle">${spk('inst_clock')}<span>מה השעה בשעון?</span></div>
          <div class="clockface">${clockSVG((hr % 12 + mn / 60) * 30, mn * 6)}</div>
          <div class="times">${opts.map((t) => `<div class="card opt" data-ok="${t === ans ? 1 : 0}">${t}</div>`).join('')}</div>`,
      };
    },
  },

  /* ---------------- find the letter (Matan) ---------------- */
  letter: {
    child: 'matan', title: 'מצא את האות', titleId: 't_letter', per: 6,
    art: () => `<div class="letters-art"><span style="background:#1FB5A8">א</span><span style="background:#FF8A3D;transform:translateY(-16px) rotate(-4deg)">ב</span><span style="background:#8E6CEF">ג</span></div>`,
    make(d) {
      const set = HEB22.slice(0, d < 1.5 ? 6 : d < 3 ? 12 : 22);
      const ans = pick(set);
      const groups = [['ב', 'כ', 'פ'], ['ד', 'ר'], ['ה', 'ח', 'ת'], ['ו', 'ז', 'י'], ['ט', 'מ', 'ס'], ['ג', 'נ'], ['ע', 'צ', 'ש']];
      const mates = d >= 5 ? groups.filter((g) => g.includes(ans)).flat().filter((l) => l !== ans) : [];
      const opts = optionSet(ans, d < 1.5 ? 3 : 4, mates, set);
      const key = LETTER_KEYS[HEB22.indexOf(ans)];
      const cols = shuffle(BLOCK_COLORS);
      return {
        key: ans, voice: ['q_letter_' + key], correctVoice: ['letter_' + key],
        html: `<button class="say-bubble" data-say="q_letter_${key}">${ART.icon('speaker')}</button>
          <div class="blocks">${opts.map((l, k) => `<div class="block opt" data-ok="${l === ans ? 1 : 0}" style="background:${cols[k]}"><span>${l}</span></div>`).join('')}</div>`,
      };
    },
  },

  /* ---------------- let's count (Matan) ---------------- */
  count: {
    child: 'matan', title: 'בוא נספור', titleId: 't_count', per: 6,
    art: () => {
      const ap = [[0, 0, '#e5534b'], [62, 0, '#f3e3cf'], [0, 62, '#f3e3cf'], [62, 62, '#e5534b'], [0, 124, '#f3e3cf'], [62, 124, '#ff8a3d']];
      const bl = [['#7cc9b6', 20, 30], ['#f49ab0', 70, 0], ['#f5c95a', 60, 50], ['#f49ab0', 10, 80], ['#8fb8e0', 100, 60]];
      return `<div style="position:relative;width:340px;height:240px">${ap.map(([x, y, c]) => `<div style="position:absolute;right:${x + 200}px;top:${y + 30}px;width:64px;height:64px">${ART.draw('apple', c)}</div>`).join('')}
        ${bl.map(([c, x, y]) => `<div style="position:absolute;right:${x}px;top:${y}px;width:96px;height:120px">${ART.draw('balloon', c)}</div>`).join('')}</div>`;
    },
    objs: ['apple', 'balloon', 'fish', 'car', 'star'],
    make(d, i, st) {
      st.objStart = st.objStart ?? rnd(0, 4);
      const obj = this.objs[(st.objStart + i) % 5];
      const max = d < 1.5 ? 5 : d < 3 ? 7 : 10;
      const n = rnd(1, max);
      const near = [n - 2, n - 1, n + 1, n + 2].filter((v) => v >= 1 && v <= max);
      const opts = optionSet(n, d < 3 ? 3 : 4, near, Array.from({ length: max }, (_, k) => k + 1));
      return {
        key: obj + n, voice: ['q_count_' + obj], correctVoice: ['num_' + n],
        html: `<div class="scene card">${countScene(obj, n, d >= 4 && RNG.r() < .5)}</div>${spk('q_count_' + obj, 'say-mini')}
          <div class="numcards ${opts.length === 4 ? 'four' : ''}">${opts.map((v) => `<div class="card numcard opt" data-ok="${v === n ? 1 : 0}"><div class="d">${v}</div>
            <div class="dots" style="grid-template-columns:repeat(${Math.min(v, 5)},30px)">${'<i></i>'.repeat(v)}</div></div>`).join('')}</div>`,
      };
    },
  },
};

/* ---------- spelling: tap the letters in order ---------- */
function spellQuestion(key, letters, d) {
  const extra = d >= 7 ? shuffle(HEB22.filter((l) => !letters.includes(l))).slice(0, 2) : [];
  const tiles = shuffle(letters.concat(extra));
  return {
    key: 'sp' + key, voice: ['inst_spell', 'word_' + key], correctVoice: ['word_' + key],
    html: `<div class="pic">${ART.draw(key)}</div>${spk('word_' + key, 'pic-speak')}
      <div class="tiles">${letters.map(() => `<div class="tile card gap"></div>`).join('')}</div>
      <div class="letter-opts spell">${tiles.map((l) => `<div class="card sp" data-l="${l}">${l}</div>`).join('')}</div>`,
    mount(body, api) {
      let pos = 0;
      body.addEventListener('click', (e) => {
        const t = e.target.closest('.sp'); if (!t || t.classList.contains('used') || api.done()) return;
        if (t.dataset.l === letters[pos]) {
          const slot = $$('.tile.gap', body)[0]; slot.textContent = t.dataset.l; slot.classList.remove('gap'); slot.classList.add('filled');
          t.classList.add('used'); pos++;
          if (pos === letters.length) api.ok(t); else Sfx.play('click');
        } else api.bad(t);
      });
      body._solve = () => letters.forEach((l) => $$('.sp:not(.used)', body).find((t) => t.dataset.l === l).click()); // used by tools/check.py
    },
  };
}

/* ---------- clock face + "set the clock" ---------- */
function clockSVG(ha, ma, interactive = false) {
  const nums = Array.from({ length: 12 }, (_, i) => { const a = (i + 1) * Math.PI / 6; return `<text x="${300 + Math.sin(a) * 200}" y="${300 - Math.cos(a) * 200 + 17}">${i + 1}</text>`; }).join('');
  const ticks = Array.from({ length: 60 }, (_, i) => `<path d="M300 ${i % 5 ? 64 : 60}v${i % 5 ? 10 : 18}" transform="rotate(${i * 6} 300 300)" stroke-width="${i % 5 ? 3 : 6}"/>`).join('');
  const grip = (y2, r, c) => (interactive ? `<path d="M300 300 L300 ${y2}" stroke="#000" stroke-opacity="0" stroke-width="80"/><circle cx="300" cy="${y2 + 10}" r="${r}" fill="${c}"/>` : '');
  return `<svg viewBox="0 0 600 600" class="art">
    <g filter="url(#pbig)"><circle cx="300" cy="300" r="290" fill="#EE8A4E"/></g>
    <circle cx="300" cy="300" r="290" fill="none" stroke="#F6A26A" stroke-width="10" opacity=".6"/>
    <g filter="url(#pl)"><circle cx="300" cy="300" r="250" fill="#FBF0DE"/></g>
    <g stroke="#B9A58E" stroke-linecap="round">${ticks}</g>
    <g font-family="Fredoka" font-weight="600" font-size="52" fill="#4a3426" text-anchor="middle">${nums}</g>
    <g filter="url(#pl)">
      <g class="hand hh" transform="rotate(${ha} 300 300)"><path d="M289 300 L292 170 Q300 150 308 170 L311 300 Z" fill="#5a3a2a"/>${grip(168, 18, '#FF8A3D')}</g>
      <g class="hand mh" transform="rotate(${ma} 300 300)"><path d="M293 300 L295 98 Q300 80 305 98 L307 300 Z" fill="#3b2a20"/>${grip(94, 18, '#1FB5A8')}</g>
      <circle cx="300" cy="300" r="20" fill="#E9D6BC" stroke="#3b2a20" stroke-width="6"/></g>
  </svg>`;
}
function setClockQuestion(hr, mn, step, label) {
  const startH = ((hr + 5) % 12) * 30, startM = ((mn / 5 + 5) % 12) * 30;
  const mStep = step === 60 ? 30 : step * 6;
  return {
    key: 'set' + label, voice: ['inst_setclock'],
    html: `<div class="ctitle">${spk('inst_setclock')}<span>כווני את השעון לשעה</span><b class="set-time" dir="ltr">${label}</b></div>
      <div class="clockface setclock">${clockSVG(startH, startM, true)}</div>
      <div class="set-help"><div class="hint"><i class="dot o"></i><span>מחוג קצר — שעות</span></div><div class="hint"><i class="dot t"></i><span>מחוג ארוך — דקות</span></div>
        <button class="card big-check">${ART.icon('check')}<span>בדיקה</span></button></div>`,
    mount(body, api) {
      const svg = $('.setclock svg', body);
      const ang = { hh: startH, mh: startM };
      const set = (cls) => $('.' + cls, svg).setAttribute('transform', `rotate(${ang[cls]} 300 300)`);
      let drag = null;
      const angleAt = (e) => { const r = svg.getBoundingClientRect(); const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2); return (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360; };
      svg.addEventListener('pointerdown', (e) => {
        const g = e.target.closest('.hand'); if (!g || api.done()) return;
        drag = g.classList.contains('hh') ? 'hh' : 'mh'; svg.setPointerCapture(e.pointerId); e.preventDefault();
      });
      svg.addEventListener('pointermove', (e) => {
        if (!drag) return; const a = angleAt(e), s = drag === 'mh' ? mStep : 15;
        ang[drag] = (Math.round(a / s) * s) % 360; set(drag);
      });
      const end = () => { if (drag) Sfx.play('click'); drag = null; };
      svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
      $('.big-check', body).addEventListener('click', (e) => {
        if (api.done()) return;
        const mOk = ang.mh === (mn * 6) % 360;
        // the hour hand counts if it points at the hour or anywhere between it and the next hour
        const dh = (ang.hh - (hr % 12) * 30 + 360) % 360;
        const hOk = mn === 0 ? (dh <= 15 || dh >= 345) : dh <= 30;
        if (mOk && hOk) {
          ang.hh = ((hr % 12) * 30 + mn / 2) % 360; set('hh'); // settle into the exact position
          api.ok(e.currentTarget);
        } else api.bad(e.currentTarget);
      });
      body._solve = () => { ang.mh = (mn * 6) % 360; ang.hh = (hr % 12) * 30; set('mh'); set('hh'); $('.big-check', body).click(); }; // tools/check.py
    },
  };
}

/** SVG scene for the counting game. Objects sit in jittered grid cells; two groups at higher levels. */
function countScene(obj, n, twoGroups) {
  const W = 1060, H = 540;
  const regions = [];
  if (twoGroups && n >= 2) {
    const a = rnd(Math.max(1, n - 6), Math.min(6, n - 1));
    regions.push({ x: 40, y: 40, w: 380, h: 450, cols: 3, rows: 2, k: a }, { x: 640, y: 40, w: 380, h: 450, cols: 3, rows: 2, k: n - a });
  } else regions.push({ x: 80, y: 40, w: 900, h: 450, cols: 5, rows: 2, k: n });
  const size = twoGroups ? 118 : 140;
  const items = [];
  for (const R of regions) {
    const cw = R.w / R.cols, ch = R.h / R.rows;
    const cells = shuffle(Array.from({ length: R.cols * R.rows }, (_, i) => i)).slice(0, R.k);
    for (const c of cells) {
      const cx = R.x + (c % R.cols) * cw + cw / 2 + rnd(-14, 14), cy = R.y + Math.floor(c / R.cols) * ch + ch / 2 + rnd(-16, 16);
      items.push({ cx, cy, R });
    }
  }
  const put = (name, x, y, s, arg) => `<svg x="${x - s / 2}" y="${y - s / 2}" width="${s}" height="${s}" viewBox="0 0 200 200" overflow="visible">${ART.D[name](arg)}</svg>`;
  let bg = '', fg = '';
  const balloonCols = ['#f49ab0', '#7cc9b6', '#f5c95a', '#8fb8e0', '#b79af5', '#ff9a5c'];
  const carCols = ['#e5534b', '#4fa8e0', '#ffc93c', '#7cc576', '#8E6CEF', '#ff8a3d'];
  if (obj === 'apple') {
    bg = `<rect width="${W}" height="${H}" fill="#E9F4F7"/><rect y="470" width="${W}" height="70" fill="#BFE0A6"/>`;
    for (const R of regions) {
      const cx = R.x + R.w / 2;
      bg += `<g filter="url(#pl)"><path d="M${cx - 30} 540 l10 -120 h40 l10 120z" fill="#9c6a41"/></g>
        <g filter="url(#pbig)"><ellipse cx="${cx}" cy="${R.y + R.h / 2 - 10}" rx="${R.w / 2 + 20}" ry="${R.h / 2 + 10}" fill="#6DBB5F"/></g>
        <ellipse cx="${cx - R.w / 6}" cy="${R.y + R.h / 3}" rx="${R.w / 4}" ry="${R.h / 5}" fill="#82C873" opacity=".6"/>`;
    }
    fg = items.map((it) => put('apple', it.cx, it.cy, size * .8)).join('');
  } else if (obj === 'balloon') {
    bg = `<rect width="${W}" height="${H}" fill="#E3F1FA"/>${put('cloud', 180, 90, 160)}${put('cloud', 900, 70, 130)}`;
    const bs = size * 1.35;
    fg = items.map((it) => { const ax = it.R.x + it.R.w / 2;
      return `<path d="M${it.cx} ${it.cy + bs * .25} Q${(it.cx + ax) / 2} ${it.cy + 140} ${ax} ${H + 10}" stroke="#a8957c" stroke-width="2.5" fill="none"/>`; }).join('') +
      items.map((it, i) => `<svg x="${it.cx - bs / 2}" y="${it.cy - bs / 2}" width="${bs}" height="${bs}" viewBox="0 0 200 200" overflow="visible"><g filter="url(#pl)"><ellipse cx="100" cy="82" rx="52" ry="62" fill="${balloonCols[i % 6]}"/><path d="M92 144 h16 l-8 10z" fill="${balloonCols[i % 6]}"/></g><ellipse cx="80" cy="60" rx="10" ry="18" fill="#fff" opacity=".4" transform="rotate(20 80 60)"/></svg>`).join('');
  } else if (obj === 'fish') {
    bg = `<defs><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE6F2"/><stop offset="1" stop-color="#7DC4DD"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#sea)"/><path d="M0 500 q80 -30 160 0 t160 0 t160 0 t160 0 t160 0 t160 0 t160 0 v40 h-${W + 60}z" fill="#E8D7A8"/>
      <g filter="url(#pl)" fill="#5FAE6A"><path d="M60 520 q-20 -60 0 -120 q20 60 0 120z"/><path d="M1000 520 q-26 -70 4 -150 q16 80 -4 150z"/><path d="M520 520 q-14 -40 4 -80 q10 40 -4 80z"/></g>`;
    fg = items.map((it) => put('fish', it.cx, it.cy, size * .9)).join('');
  } else if (obj === 'car') {
    bg = `<rect width="${W}" height="${H}" fill="#CFE8B8"/>` + [152, 377].map((y) => `<g filter="url(#pl)"><rect x="0" y="${y - 70}" width="${W}" height="150" fill="#9A9AA6"/></g><path d="M0 ${y + 5} H${W}" stroke="#fff" stroke-width="7" stroke-dasharray="40 30"/>`).join('');
    fg = items.map((it, i) => put('car', it.cx, it.cy, size * .9, carCols[i % 6])).join('');
  } else {
    bg = `<rect width="${W}" height="${H}" fill="#3B4A7A"/>${Array.from({ length: 40 }, () => `<circle cx="${rnd(0, W)}" cy="${rnd(0, H)}" r="${rnd(1, 3)}" fill="#fff" opacity=".5"/>`).join('')}
      <g filter="url(#pl)"><path d="M990 30 a50 50 0 1 0 40 80 a40 40 0 0 1 -40 -80z" fill="#FFE08A"/></g>`;
    fg = items.map((it) => put('star', it.cx, it.cy, size * .85)).join('');
  }
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${bg}${fg}</svg>`;
}

/* ---------------- the engine: plays a level or the daily challenge ----------------
   plan = { kind: 'level'|'daily', gid, level, champ, items: [{ gid, d }], seed } */
const Round = (() => {
  let praiseN = 0;
  function praise() {
    const list = ['praise_0', 'praise_1', 'praise_2', App.gender() === 'f' ? 'champ_f' : 'champ_m'];
    return list[praiseN++ % list.length];
  }
  const tryLine = () => (App.gender() === 'f' ? ['try_f', 'כמעט! נסי שוב'] : ['try_m', 'כמעט! נסה שוב']);

  function run(plan) {
    const child = App.child, n = plan.items.length;
    const st = { plan, i: 0, mistakes: 0, used: new Set(), q: null, busy: false };
    App.round = st;
    const tag = plan.kind === 'level'
      ? `<div class="lvl-tag ${plan.champ ? 'gold' : ''}">${plan.champ ? ART.icon('star') : ''}<span>שלב ${plan.level}</span></div>`
      : `<div class="lvl-tag gold">${ART.icon('star')}<span>אתגר יומי</span></div>`;
    const view = h(`<div class="view game"><div class="gbody"></div>${n > 1 ? ringSVG(0, `<span>1<small>/${n}</small></span>`, 11, 'prog') : ''}${tag}</div>`);
    App.mount(view, 'game');
    let body = $('.gbody', view);
    const prog = $('.prog', view);

    const api = {
      done: () => st.busy || App.round !== st,
      good(el, voice) { if (el) confetti(el, 12); Sfx.play('correct'); App.popoHop(); if (voice) Voice.say(voice); },
      bad(el, opts = {}) {
        if (App.round !== st || st.busy) return;
        st.mistakes++;
        if (el) { el.classList.remove('wrong'); void el.offsetWidth; el.classList.add('wrong'); }
        if (!opts.silent) { Sfx.play('wrong'); const [id, t] = tryLine(); App.popoSay(id, t); }
      },
      ok: (el) => correct(el),
      get mistakes() { return st.mistakes; },
    };

    function ask() {
      const it = plan.items[st.i], g = GAMES[it.gid];
      view.className = `view game g-${it.gid}${plan.champ ? ' champ' : ''}`;
      $('#popo').dataset.screen = 'game-' + it.gid;
      let q, tries = 0;
      do {
        RNG.seed(plan.seed + st.i * 7919 + tries * 104729);
        try { q = g.make(it.d, st.i, st); } finally { RNG.free(); }
      } while (st.used.has(q.key) && ++tries < 40);
      st.used.add(q.key); st.q = q; st.busy = false;
      // a fresh container per question, so listeners added by one question never see the next one
      const nb = document.createElement('div'); nb.className = 'gbody';
      body.replaceWith(nb); body = nb;
      body.innerHTML = q.html;
      if (prog) { $('.lbl', prog).innerHTML = `<span>${st.i + 1}<small>/${n}</small></span>`; setRing(prog, st.i / n); }
      if (q.mount) q.mount(body, api);
      Voice.say(q.voice, { btn: $('.say-bubble', body) || undefined });
    }

    async function correct(opt) {
      if (st.busy || App.round !== st) return;
      st.busy = true; body.classList.add('done');
      if (opt) {
        opt.classList.add('right');
        if (opt.classList.contains('opt')) opt.appendChild(h(`<span class="badge">${ART.icon('check')}</span>`));
        confetti(opt);
      }
      Sfx.play('correct'); App.popoHop();
      st.q.onCorrect && st.q.onCorrect(body);
      if (prog) setRing(prog, (st.i + 1) / n);
      const ids = [...(st.q.correctVoice || []), praise()];
      await Promise.all([wait(1300), Promise.race([new Promise((r) => Voice.say(ids, { done: r })), wait(st.q.longVoice ? 9000 : 4500)])]);
      await wait(200);
      if (App.round !== st) return;
      st.i++;
      if (st.i >= n) finish(); else ask();
    }

    view.addEventListener('click', (e) => {
      if (!body.contains(e.target)) return;
      const sp = e.target.closest('[data-say]');
      if (sp) { e.stopPropagation(); Sfx.play('click'); Voice.say(sp.dataset.say, { btn: sp }); return; }
      const opt = e.target.closest('.opt');
      if (!opt || st.busy || App.round !== st) return;
      if (opt.dataset.ok === '1') correct(opt); else api.bad(opt);
    });

    function finish() {
      const g = GAMES[plan.items[0].gid];
      const stars = plan.kind === 'level' && g.stars ? g.stars(st.mistakes, plan.items[0].d)
        : st.mistakes <= Math.floor(n * .15) ? 3 : st.mistakes <= Math.ceil(n * .45) ? 2 : 1;
      App.round = null;
      const reward = plan.kind === 'daily' ? Levels.finishDaily(child, stars) : Levels.finishLevel(child, plan.gid, plan.level, stars);
      App.showResult({ ...plan, stars, ...reward });
    }
    ask();
  }

  return {
    run,
    start(gid, level) { run(Levels.plan(App.child, gid, level)); },
    replay() { const st = App.round; if (st && st.q) Voice.say(st.q.voice); },
  };
})();
