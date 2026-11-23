/* Core helpers: storage, sound effects, voice, DOM utilities. */
'use strict';

/* ---------- utilities ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function h(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };

/** Progress ring markup. frac 0..1, size in px of viewBox (100). */
function ringSVG(frac, label = '', stroke = 10, extra = '') {
  const r = 50 - stroke / 2 - 1, c = 2 * Math.PI * r;
  return `<div class="ring ${extra}"><svg viewBox="0 0 100 100"><circle class="trk" cx="50" cy="50" r="${r}" stroke-width="${stroke}"/>
    <circle class="val" cx="50" cy="50" r="${r}" stroke-width="${stroke}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - frac)).toFixed(1)}"/></svg>
    <div class="lbl">${label}</div></div>`;
}
function setRing(el, frac) {
  const v = el.querySelector('.val'); const c = parseFloat(v.getAttribute('stroke-dasharray'));
  v.setAttribute('stroke-dashoffset', (c * (1 - frac)).toFixed(1));
}
function starsHTML(n, max = 3) {
  return `<div class="stars">${Array.from({ length: max }, (_, i) => `<span class="${i < n ? '' : 'off'}">${ART.icon('star')}</span>`).join('')}</div>`;
}

/* ---------- storage (localStorage, always try/catch) ---------- */
const Store = (() => {
  const KEY = 'gan-mishakim-v1';
  const blankChild = () => ({
    stars: 0, stickers: 0, newSticker: false, games: {},
    settings: { difficulty: 'medium', limit: 0, sound: true },
    time: { date: todayStr(), secs: 0, unlocked: false },
  });
  let data = { profiles: { hodaya: blankChild(), matan: blankChild() } };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && d.profiles) for (const k of ['hodaya', 'matan']) {
        const b = blankChild(), p = d.profiles[k] || {};
        data.profiles[k] = { ...b, ...p, settings: { ...b.settings, ...(p.settings || {}) }, time: { ...b.time, ...(p.time || {}) }, games: p.games || {} };
      }
    }
  } catch (e) { /* storage unavailable: play without saving */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* ignore */ } }
  function child(id) {
    const c = data.profiles[id];
    if (c.time.date !== todayStr()) { c.time = { date: todayStr(), secs: 0, unlocked: false }; save(); }
    return c;
  }
  function game(id, g) { const c = child(id); return c.games[g] || (c.games[g] = { best: 0, rounds: 0, won: 0 }); }
  function reset(id) { data.profiles[id] = { ...blankChild(), settings: data.profiles[id].settings }; save(); }
  return { save, child, game, reset, get data() { return data; } };
})();

/* ---------- sound effects: synthesized with Web Audio ---------- */
const Sfx = (() => {
  let ctx = null, enabled = true;
  function ac() {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, t0, dur, { type = 'sine', vol = .18, slide = 0 } = {}) {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .05);
  }
  function noise(t0, dur, vol = .08, freq = 1800) {
    const c = ac(); if (!c) return;
    const len = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + t0;
    f.type = 'bandpass'; f.frequency.setValueAtTime(freq, t); f.frequency.exponentialRampToValueAtTime(freq * 3, t + dur);
    g.gain.value = vol; s.buffer = b; s.connect(f).connect(g).connect(c.destination); s.start(t);
  }
  const fx = {
    click() { tone(880, 0, .07, { type: 'triangle', vol: .12 }); },
    correct() { tone(660, 0, .16, { type: 'triangle' }); tone(880, .1, .18, { type: 'triangle' }); tone(1320, .2, .3, { type: 'sine', vol: .12 }); },
    wrong() { tone(330, 0, .22, { type: 'sine', vol: .14, slide: .75 }); tone(260, .14, .26, { type: 'sine', vol: .1, slide: .8 }); },
    star() { [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, i * .07, .25, { type: 'sine', vol: .11 })); },
    sticker() { noise(0, .3, .07, 600); tone(520, .25, .12, { type: 'triangle' }); tone(1040, .33, .22, { type: 'sine', vol: .12 }); },
  };
  return {
    play(name) { if (enabled && fx[name]) try { fx[name](); } catch (e) { /* ignore */ } },
    unlock() { ac(); },
    set enabled(v) { enabled = v; },
    get enabled() { return enabled; },
  };
})();

/* ---------- voice: pre-generated MP3 files in audio/<id>.mp3 ---------- */
const Voice = (() => {
  const el = new Audio(); el.preload = 'auto';
  let queue = [], token = 0, onDone = null, playingBtn = null;
  function markBtn(btn) { if (playingBtn) playingBtn.classList.remove('playing'); playingBtn = btn || null; if (playingBtn) playingBtn.classList.add('playing'); }
  function next(t) {
    if (t !== token) return;
    if (!queue.length) { markBtn(null); const d = onDone; onDone = null; d && d(); return; }
    const id = queue.shift();
    el.src = `audio/${id}.mp3`;
    const p = el.play(); if (p && p.catch) p.catch(() => setTimeout(() => next(t), 50));
  }
  el.addEventListener('ended', () => setTimeout(() => next(token), 120));
  el.addEventListener('error', () => next(token));
  return {
    /** Play one or more clip ids in sequence, interrupting anything playing. */
    say(ids, { btn, done } = {}) {
      token++; queue = [].concat(ids).filter(Boolean); onDone = done || null; markBtn(btn);
      try { el.pause(); } catch (e) { /* ignore */ }
      next(token);
    },
    stop() { token++; queue = []; onDone = null; markBtn(null); try { el.pause(); } catch (e) { /* ignore */ } },
  };
})();

/* ---------- paper confetti ---------- */
function confetti(target, n = 28) {
  const fx = $('#fx'), stage = $('#stage');
  const sr = stage.getBoundingClientRect(), r = target.getBoundingClientRect(), k = sr.width / 1920;
  const x = (r.left + r.width / 2 - sr.left) / k, y = (r.top + r.height / 2 - sr.top) / k;
  const cols = ['#1FB5A8', '#FFC93C', '#8E6CEF', '#FF8A3D', '#F49AB0', '#6FB6E8'];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, d = 160 + Math.random() * 240;
    const p = document.createElement('i'); p.className = 'cf';
    p.style.cssText = `left:${x}px;top:${y}px;background:${cols[i % cols.length]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d + 120}px;--r:${rnd(-540, 540)}deg;animation-delay:${Math.random() * .08}s`;
    fx.appendChild(p); setTimeout(() => p.remove(), 1200);
  }
}
