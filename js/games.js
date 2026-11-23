/* The six games + the shared 10-question round engine. */
'use strict';

const HEB22 = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];
const LETTER_KEYS = ['alef', 'bet', 'gimel', 'dalet', 'he', 'vav', 'zayin', 'het', 'tet', 'yod', 'kaf', 'lamed', 'mem', 'nun', 'samekh', 'ayin', 'pe', 'tsadi', 'qof', 'resh', 'shin', 'tav'];
const FINAL = { 'כ': 'ך', 'מ': 'ם', 'נ': 'ן', 'פ': 'ף', 'צ': 'ץ' };
const BLOCK_COLORS = ['#1FB5A8', '#FF8A3D', '#8E6CEF', '#F07EA0', '#4FA8E0', '#6DBB5F', '#F5A623'];

const WORDS = [['dog', 'כלב'], ['cat', 'חתול'], ['fish', 'דג'], ['house', 'בית'], ['tree', 'עץ'], ['sun', 'שמש'], ['moon', 'ירח'], ['ball', 'כדור'],
  ['apple', 'תפוח'], ['banana', 'בננה'], ['flower', 'פרח'], ['book', 'ספר'], ['cup', 'כוס'], ['shoe', 'נעל'], ['hat', 'כובע'], ['car', 'מכונית'],
  ['bus', 'אוטובוס'], ['horse', 'סוס'], ['cow', 'פרה'], ['bird', 'ציפור'], ['cloud', 'ענן'], ['chair', 'כיסא'], ['clock', 'שעון'], ['cake', 'עוגה']];
const ANIMALS = ['lion', 'cat', 'dog', 'fish', 'bird', 'cow', 'horse', 'duck', 'monkey', 'elephant', 'frog', 'rabbit'];

/** Pick `n` distinct values: answer + distractors (preferred first, then from pool). */
function optionSet(answer, n, preferred, pool) {
  const out = [answer];
  for (const v of shuffle(preferred).concat(shuffle(pool))) {
    if (out.length >= n) break;
    if (!out.includes(v)) out.push(v);
  }
  return shuffle(out);
}

const GAMES = {
  /* ---------------- 1. math bubbles ---------------- */
  math: {
    child: 'hodaya', title: 'חשבון בבועות', titleId: 't_math', inst: 'inst_math',
    art: () => `<div class="bubbles-art">${[[78, 30, 82, 58, 3], [20, 30, 44, 34, 5], [80, 0, 44, 32, 9], [150, 30, 44, 30, 8], [30, 92, 48, 32, 2], [140, 86, 50, 34, 2], [0, 70, 24, 0, ''], [176, 4, 26, 0, '']]
      .map(([x, y, s, f, t]) => `<span style="left:${x}px;top:${y}px;width:${s}px;height:${s}px;font-size:${f}px">${t}</span>`).join('')}</div>`,
    make(diff) {
      let a, b, op;
      const kind = diff === 'easy' ? '+' : diff === 'medium' ? pick(['+', '−']) : pick(['+', '−', '×', '×']);
      if (diff === 'easy') { a = rnd(1, 9); b = rnd(1, 10 - a); }
      else if (diff === 'medium') { if (kind === '+') { a = rnd(2, 18); b = rnd(1, 20 - a); } else { a = rnd(3, 20); b = rnd(1, a - 1); } }
      else if (kind === '+') { a = rnd(10, 89); b = rnd(2, 100 - a); }
      else if (kind === '−') { a = rnd(20, 100); b = rnd(2, a - 1); }
      else { a = rnd(1, 10); b = rnd(1, 10); }
      op = kind;
      const ans = op === '+' ? a + b : op === '−' ? a - b : a * b;
      const offs = [-3, -2, -1, 1, 2, 3].map((d) => ans + d).filter((v) => v >= 0);
      const opts = optionSet(ans, 4, offs, offs);
      const tints = shuffle(['#E3DAF3', '#F4DDD2', '#DCEFE6', '#F6E1EA', '#DDE8F4']);
      const pos = [[40, 30], [250, 280], [480, 10], [660, 270]];
      return {
        key: a + op + b,
        voice: ['inst_math'],
        html: `
          <div class="qcard"><div class="card"><span class="eq">${a} ${op} ${b} = <b class="qa">?</b></span></div>
            <button class="speak" data-say="inst_math">${ART.icon('speaker')}</button></div>
          <div class="bubble-field">${opts.map((v, i) => `<div class="bub-wrap" style="left:${pos[i][0]}px;top:${pos[i][1]}px">
            <div class="bub opt" data-ok="${v === ans ? 1 : 0}" style="background:radial-gradient(circle at 40% 35%, #fff 0 8%, ${tints[i]} 55%, ${tints[i]})">${v}</div></div>`).join('')}</div>
          <i class="deco-bub" style="left:270px;top:390px;width:84px;height:84px"></i><i class="deco-bub" style="left:210px;top:500px;width:46px;height:46px;animation-delay:-2s"></i>
          <i class="deco-bub" style="left:1420px;top:500px;width:40px;height:40px;animation-delay:-1s"></i><i class="deco-bub" style="left:1240px;top:880px;width:60px;height:60px;animation-delay:-3s"></i>`,
        onCorrect: (root) => { $('.qa', root).textContent = ans; },
      };
    },
  },

  /* ---------------- 2. missing letter ---------------- */
  word: {
    child: 'hodaya', title: 'המילה החסרה', titleId: 't_word', inst: 'inst_word',
    art: () => `<div style="display:flex;align-items:center;gap:18px"><div style="width:140px;height:140px">${ART.draw('dog')}</div>
      <div class="word-art"><div><b>כ</b><b class="gap">_</b><b>ב</b></div></div></div>`,
    make(diff) {
      const [key, word] = pick(WORDS);
      const letters = [...word];
      const idx = diff === 'easy' ? 0 : rnd(0, letters.length - 1);
      const ans = letters[idx], isLast = idx === letters.length - 1;
      const toPos = (l) => (isLast && FINAL[l] ? FINAL[l] : l);
      const groups = [['ב', 'כ'], ['ד', 'ר'], ['ה', 'ח'], ['ו', 'ז'], ['ס', 'ם'], ['ט', 'מ'], ['ן', 'ו', 'ז'], ['ץ', 'צ'], ['ך', 'ר', 'ד']];
      const mates = diff === 'hard' ? groups.filter((g) => g.includes(ans)).flat().filter((l) => l !== ans) : [];
      const pool = HEB22.map(toPos).filter((l) => l !== ans && !letters.includes(l));
      const opts = optionSet(ans, diff === 'easy' ? 3 : 4, mates, pool);
      return {
        key,
        voice: ['inst_word', 'word_' + key],
        html: `
          <div class="pic">${ART.draw(key)}</div>
          <button class="speak pic-speak" data-say="word_${key}">${ART.icon('speaker')}</button>
          <div class="tiles">${letters.map((l, i) => i === idx ? `<div class="tile card gap"></div>` : `<div class="tile card">${l}</div>`).join('')}</div>
          <div class="letter-opts">${opts.map((l) => `<div class="card opt" data-ok="${l === ans ? 1 : 0}">${l}</div>`).join('')}</div>`,
        onCorrect: (root) => { const g = $('.tile.gap', root); g.textContent = ans; g.classList.add('filled'); },
        correctVoice: ['word_' + key],
      };
    },
  },

  /* ---------------- 3. English zoo ---------------- */
  zoo: {
    child: 'hodaya', title: 'אנגלית בגן החיות', titleId: 't_zoo', inst: 'inst_zoo',
    art: () => `<div class="zoo-art">
        <div class="a" style="right:10px;top:-6px">${ART.draw('dog')}</div><span class="tag" style="right:118px;top:20px">Dog</span>
        <div class="a" style="right:30px;top:76px">${ART.draw('cat')}</div><span class="tag" style="right:140px;top:112px">Cat</span></div>`,
    make(diff) {
      const ans = pick(ANIMALS);
      const opts = optionSet(ans, diff === 'easy' ? 3 : 4, [], ANIMALS);
      const hidden = diff === 'hard';
      return {
        key: ans,
        voice: ['inst_zoo', 'en_' + ans],
        html: `
          <div class="zbar card">
            <div class="heb"><button class="speak" data-say="inst_zoo">${ART.icon('speaker')}</button><span>איזו חיה זו?</span></div>
            <div class="eng ${hidden ? 'hidden-word' : ''}"><span class="w">${ans.toUpperCase()}</span><button class="speak" data-say="en_${ans}">${ART.icon('speaker')}</button></div>
          </div>
          <div class="zcards ${opts.length === 4 ? 'four' : ''}">${opts.map((a) => `<div class="card opt" data-ok="${a === ans ? 1 : 0}">${ART.draw(a)}</div>`).join('')}</div>`,
        correctVoice: ['en_' + ans],
        onCorrect: (root) => { $('.eng', root).classList.remove('hidden-word'); },
      };
    },
  },

  /* ---------------- 4. what time is it ---------------- */
  clock: {
    child: 'hodaya', title: 'מה השעה?', titleId: 't_clock', inst: 'inst_clock',
    art: () => `<div style="width:170px;height:170px">${ART.draw('clock')}</div>`,
    make(diff) {
      const mins = diff === 'easy' ? [0] : diff === 'medium' ? [0, 30] : [0, 15, 30, 45];
      const hr = rnd(1, 12), mn = pick(mins);
      const fmt = (H, M) => `${H}:${String(M).padStart(2, '0')}`;
      const wrap12 = (x) => ((x - 1 + 12) % 12) + 1;
      const ans = fmt(hr, mn);
      const pref = [fmt(wrap12(hr + 1), mn), fmt(wrap12(hr - 1), mn)];
      if (mn && mins.includes((hr % 12) * 5)) pref.push(fmt(wrap12(mn / 5), (hr % 12) * 5)); // hands swapped
      if (mins.length > 1) pref.push(fmt(hr, pick(mins.filter((m) => m !== mn))));
      const pool = Array.from({ length: 12 }, (_, i) => fmt(i + 1, pick(mins)));
      const opts = optionSet(ans, 3, pref, pool);
      const ha = ((hr % 12) + mn / 60) * 30, ma = mn * 6;
      const nums = Array.from({ length: 12 }, (_, i) => { const a = (i + 1) * Math.PI / 6; return `<text x="${300 + Math.sin(a) * 200}" y="${300 - Math.cos(a) * 200 + 17}">${i + 1}</text>`; }).join('');
      const ticks = Array.from({ length: 60 }, (_, i) => `<path d="M300 ${i % 5 ? 64 : 60}v${i % 5 ? 10 : 18}" transform="rotate(${i * 6} 300 300)" stroke-width="${i % 5 ? 3 : 6}"/>`).join('');
      return {
        key: ans,
        voice: ['inst_clock'],
        html: `
          <div class="ctitle"><button class="speak" data-say="inst_clock">${ART.icon('speaker')}</button><span>מה השעה בשעון?</span></div>
          <div class="clockface"><svg viewBox="0 0 600 600" class="art">
            <g filter="url(#pbig)"><circle cx="300" cy="300" r="290" fill="#EE8A4E"/></g>
            <circle cx="300" cy="300" r="290" fill="none" stroke="#F6A26A" stroke-width="10" opacity=".6"/>
            <g filter="url(#pl)"><circle cx="300" cy="300" r="250" fill="#FBF0DE"/></g>
            <g stroke="#B9A58E" stroke-linecap="round">${ticks}</g>
            <g font-family="Fredoka" font-weight="600" font-size="52" fill="#4a3426" text-anchor="middle">${nums}</g>
            <g filter="url(#pl)">
              <path class="hand" d="M289 300 L292 170 Q300 150 308 170 L311 300 Z" fill="#5a3a2a" transform="rotate(${ha} 300 300)"/>
              <path class="hand" d="M293 300 L295 98 Q300 80 305 98 L307 300 Z" fill="#3b2a20" transform="rotate(${ma} 300 300)"/>
              <circle cx="300" cy="300" r="20" fill="#E9D6BC" stroke="#3b2a20" stroke-width="6"/></g>
          </svg></div>
          <div class="times">${opts.map((t) => `<div class="card opt" data-ok="${t === ans ? 1 : 0}">${t}</div>`).join('')}</div>`,
      };
    },
  },

  /* ---------------- 5. find the letter (Matan) ---------------- */
  letter: {
    child: 'matan', title: 'מצא את האות', titleId: 't_letter', inst: null,
    art: () => `<div class="letters-art"><span style="background:#1FB5A8">א</span><span style="background:#FF8A3D;transform:translateY(-16px) rotate(-4deg)">ב</span><span style="background:#8E6CEF">ג</span></div>`,
    make(diff) {
      const set = diff === 'easy' ? HEB22.slice(0, 10) : HEB22;
      const ans = pick(set);
      const groups = [['ב', 'כ', 'פ'], ['ד', 'ר'], ['ה', 'ח', 'ת'], ['ו', 'ז', 'י'], ['ט', 'מ', 'ס'], ['ג', 'נ'], ['ע', 'צ', 'ש']];
      const mates = diff === 'hard' ? groups.filter((g) => g.includes(ans)).flat().filter((l) => l !== ans) : [];
      const opts = optionSet(ans, diff === 'easy' ? 3 : 4, mates, set);
      const key = LETTER_KEYS[HEB22.indexOf(ans)];
      const cols = shuffle(BLOCK_COLORS);
      return {
        key: ans,
        voice: ['q_letter_' + key],
        html: `
          <button class="say-bubble" data-say="q_letter_${key}">${ART.icon('speaker')}</button>
          <div class="blocks">${opts.map((l, i) => `<div class="block opt" data-ok="${l === ans ? 1 : 0}" style="background:${cols[i]}"><span>${l}</span></div>`).join('')}</div>`,
        correctVoice: ['letter_' + key],
      };
    },
  },

  /* ---------------- 6. let's count (Matan) ---------------- */
  count: {
    child: 'matan', title: 'בוא נספור', titleId: 't_count', inst: null,
    art: () => {
      const ap = [[0, 0, '#e5534b'], [62, 0, '#f3e3cf'], [0, 62, '#f3e3cf'], [62, 62, '#e5534b'], [0, 124, '#f3e3cf'], [62, 124, '#ff8a3d']];
      const bl = [['#7cc9b6', 20, 30], ['#f49ab0', 70, 0], ['#f5c95a', 60, 50], ['#f49ab0', 10, 80], ['#8fb8e0', 100, 60]];
      return `<div style="position:relative;width:340px;height:240px">${ap.map(([x, y, c]) => `<div style="position:absolute;right:${x + 200}px;top:${y + 30}px;width:64px;height:64px">${ART.draw('apple', c)}</div>`).join('')}
        ${bl.map(([c, x, y]) => `<div style="position:absolute;right:${x}px;top:${y}px;width:96px;height:120px">${ART.draw('balloon', c)}</div>`).join('')}</div>`;
    },
    objs: ['apple', 'balloon', 'fish', 'car', 'star'],
    make(diff, i, round) {
      round.objStart = round.objStart ?? rnd(0, 4);
      const obj = this.objs[(round.objStart + i) % 5];
      const max = diff === 'easy' ? 5 : 10;
      const n = rnd(1, max);
      const near = [n - 2, n - 1, n + 1, n + 2].filter((v) => v >= 1 && v <= max);
      const opts = optionSet(n, 3, near, Array.from({ length: max }, (_, k) => k + 1));
      return {
        key: obj + n,
        voice: ['q_count_' + obj],
        html: `
          <div class="scene card">${countScene(obj, n, diff === 'hard')}</div>
          <button class="speak say-mini" data-say="q_count_${obj}">${ART.icon('speaker')}</button>
          <div class="numcards">${opts.map((v) => `<div class="card numcard opt" data-ok="${v === n ? 1 : 0}"><div class="d">${v}</div>
            <div class="dots" style="grid-template-columns:repeat(${Math.min(v, 5)},30px)">${'<i></i>'.repeat(v)}</div></div>`).join('')}</div>`,
        correctVoice: ['num_' + n],
      };
    },
  },
};

/** SVG scene for the counting game. Objects sit in jittered grid cells; hard mode = two separate groups. */
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

/* ---------------- round engine ---------------- */
const Round = (() => {
  let praiseN = 0;
  function praise() {
    const list = ['praise_0', 'praise_1', 'praise_2', App.gender() === 'f' ? 'champ_f' : 'champ_m'];
    return list[praiseN++ % list.length];
  }
  function start(gid) {
    const g = GAMES[gid], child = App.child, diff = Store.child(child).settings.difficulty;
    const st = { gid, i: 0, mistakes: 0, used: new Set(), q: null, busy: false };
    App.round = st;
    const view = h(`<div class="view game g-${gid}"><div class="gbody"></div>${ringSVG(0, '<span>1<small>/10</small></span>', 11, 'prog')}</div>`);
    App.mount(view, 'game');
    const body = $('.gbody', view), prog = $('.prog', view);

    function ask() {
      let q, tries = 0;
      do { q = g.make(diff, st.i, st); } while (st.used.has(q.key) && ++tries < 40);
      st.used.add(q.key); st.q = q; st.busy = false;
      body.classList.remove('done');
      body.innerHTML = q.html;
      $('.lbl', prog).innerHTML = `<span>${st.i + 1}<small>/10</small></span>`;
      setRing(prog, st.i / 10);
      Voice.say(q.voice, { btn: $('.say-bubble', body) || undefined });
    }

    body.addEventListener('click', async (e) => {
      const sp = e.target.closest('[data-say]');
      if (sp) { e.stopPropagation(); Sfx.play('click'); Voice.say(sp.dataset.say, { btn: sp }); return; }
      const opt = e.target.closest('.opt');
      if (!opt || st.busy || App.round !== st) return;
      if (opt.dataset.ok === '1') {
        st.busy = true; body.classList.add('done');
        opt.classList.add('right'); opt.appendChild(h(`<span class="badge">${ART.icon('check')}</span>`));
        confetti(opt); Sfx.play('correct'); App.popoHop();
        st.q.onCorrect && st.q.onCorrect(body);
        setRing(prog, (st.i + 1) / 10);
        const ids = [...(st.q.correctVoice || []), praise()];
        await Promise.all([wait(1300), Promise.race([new Promise((r) => Voice.say(ids, { done: r })), wait(4500)])]);
        await wait(200);
        if (App.round !== st) return;
        st.i++;
        if (st.i >= 10) finish(); else ask();
      } else {
        st.mistakes++;
        opt.classList.remove('wrong'); void opt.offsetWidth; opt.classList.add('wrong');
        Sfx.play('wrong');
        App.popoSay(App.gender() === 'f' ? 'try_f' : 'try_m', App.gender() === 'f' ? 'כמעט! נסי שוב' : 'כמעט! נסה שוב');
      }
    });

    function finish() {
      const stars = st.mistakes <= 1 ? 3 : st.mistakes <= 4 ? 2 : 1;
      const c = Store.child(child), gs = Store.game(child, gid);
      gs.best = Math.max(gs.best, stars); gs.rounds++; if (stars >= 2) gs.won++;
      c.stars += stars;
      let sticker = -1;
      if (stars >= 2 && c.stickers < STICKERS.length) { sticker = c.stickers; c.stickers++; c.newSticker = true; }
      Store.save();
      App.round = null;
      App.showResult(gid, stars, sticker);
    }
    ask();
  }
  return { start, replay() { const st = App.round; if (st && st.q) Voice.say(st.q.voice); } };
})();

const STICKERS = ['lion', 'rocket', 'apple', 'car', 'elephant', 'planet', 'banana', 'bus', 'monkey', 'moon', 'strawberry', 'train',
  'frog', 'ufo', 'grapes', 'airplane', 'rabbit', 'comet', 'orange', 'boat', 'duck', 'astronaut', 'cherries', 'bicycle'];
