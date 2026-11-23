/* Extra paper-cut art: world backgrounds, Popo's wardrobe and Israeli money.
   Loads after art.js and extends the global ART object. Uses the #pl / #pbig
   paper-shadow filters defined once in index.html. */
'use strict';

(() => {
  const L = ART.L;   // small paper layer (soft shadow)
  const B = (inner, o = 1) => `<g filter="url(#pbig)"${o < 1 ? ` opacity="${o}"` : ''}>${inner}</g>`; // big soft layer
  const wrap = ART.wrap;

  // deterministic PRNG so backgrounds never change between loads
  const rng = (seed) => () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  // is (x,y) inside the calm central UI zone (with a margin)?
  const inCentre = (x, y, m = 0) => x > 250 - m && x < 1670 + m && y > 160 - m && y < 900 + m;
  // is (x,y) in Popo's corner?
  const inPopo = (x, y) => x > 1580 && y > 760;

  const star5 = (cx, cy, R, r = R * .45, rot = -90) => {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = (rot + i * 36) * Math.PI / 180, rr = i % 2 ? r : R;
      d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
    }
    return d + 'Z';
  };
  const sparkle = (x, y, s, c) => `<path d="M${x} ${y - s} Q${x + s * .18} ${y - s * .18} ${x + s} ${y} Q${x + s * .18} ${y + s * .18} ${x} ${y + s} Q${x - s * .18} ${y + s * .18} ${x - s} ${y} Q${x - s * .18} ${y - s * .18} ${x} ${y - s}Z" fill="${c}"/>`;
  // a sine-ish wave band from y down to the bottom
  const waveBand = (y, amp, len, fill, phase = 0, foam = '') => {
    let d = `M${-phase} ${y} q${len / 2} ${-amp} ${len} 0`;
    for (let x = len - phase; x < 1920 + len; x += len) d += ` t${len} 0`;
    const top = d;
    d += ` V1080 H${-phase}Z`;
    return `<path d="${d}" fill="${fill}"/>${foam ? `<path d="${top}" fill="none" stroke="${foam}" stroke-width="5" stroke-linecap="round" opacity=".7"/>` : ''}`;
  };

  /* ================= shared scenery pieces ================= */
  const cloud = (x, y, s, o = 1, fill = '#FFFDF8', line = '#EADFCB') => `<g transform="translate(${x} ${y}) scale(${s})" filter="url(#pbig)" opacity="${o}">
    <path d="M10 100 q-10 -34 26 -40 q6 -40 54 -38 q30 -20 62 6 q40 -12 56 24 q34 2 34 30 q0 18 -18 18 h-200 q-14 0 -14 0z" fill="${fill}"/>
    <path d="M24 106 h210" stroke="${line}" stroke-width="3" opacity=".7"/></g>`;

  const tree = (x, y, s, c = ['#86C96F', '#62B05A', '#B2E096'], trunk = '#B07A4A') => `<g transform="translate(${x} ${y}) scale(${s})">
    ${L(`<path d="M-14 0 l5 -130 h18 l5 130z" fill="${trunk}"/><path d="M0 -70 l-26 -26 M2 -92 l20 -22" stroke="${trunk}" stroke-width="9" stroke-linecap="round"/>`)}
    ${L(`<circle cx="0" cy="-170" r="72" fill="${c[1]}"/><circle cx="-50" cy="-126" r="50" fill="${c[1]}"/><circle cx="50" cy="-124" r="52" fill="${c[1]}"/><circle cx="0" cy="-110" r="44" fill="${c[1]}"/>`)}
    ${L(`<circle cx="-12" cy="-182" r="50" fill="${c[0]}"/><circle cx="34" cy="-146" r="34" fill="${c[0]}"/><circle cx="-46" cy="-136" r="28" fill="${c[0]}"/>`)}
    <circle cx="-30" cy="-204" r="16" fill="${c[2]}" opacity=".8"/><circle cx="20" cy="-196" r="9" fill="${c[2]}" opacity=".7"/></g>`;

  const pine = (x, y, s, c = ['#5FA96B', '#4B9460'], snow = false) => {
    const tier = (yb, h, hw, col) => {
      let t = `<path d="M${-hw} ${yb} L0 ${yb - h} L${hw} ${yb} Q0 ${yb + 16} ${-hw} ${yb}Z" fill="${col}"/>`;
      if (snow) {
        const a = hw * .52, yy = yb - h * .48;
        t += `<path d="M${-a} ${yy} L0 ${yb - h - 2} L${a} ${yy} q${-a / 3} 16 ${-2 * a / 3} 0 q${-a / 3} 16 ${-2 * a / 3} 0 q${-a / 3} 16 ${-2 * a / 3} 0z" fill="#FFFFFF"/>`;
      }
      return L(t);
    };
    return `<g transform="translate(${x} ${y}) scale(${s})">
      ${L(`<rect x="-11" y="-44" width="22" height="46" rx="5" fill="#8C5E3C"/>`)}
      ${tier(-36, 110, 78, c[1])}${tier(-96, 100, 62, c[0])}${tier(-150, 94, 46, c[1])}</g>`;
  };

  const mushroom = (x, y, s, cap = '#E5534B') => `<g transform="translate(${x} ${y}) scale(${s})">
    ${L(`<path d="M-14 0 q-4 -30 4 -46 h20 q8 16 4 46z" fill="#FFF3DE"/>`)}
    ${L(`<path d="M-50 -40 q4 -46 50 -48 q46 2 50 48 q-50 12 -100 0z" fill="${cap}"/>`)}
    <circle cx="-22" cy="-62" r="8" fill="#FFF8EC"/><circle cx="10" cy="-74" r="6" fill="#FFF8EC"/><circle cx="28" cy="-52" r="7" fill="#FFF8EC"/><circle cx="-2" cy="-50" r="4" fill="#FFF8EC"/></g>`;

  const flower = (x, y, s, c = '#FF8FA8', mid = '#FFC93C') => `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 0 v-34" stroke="#5DAE57" stroke-width="5" stroke-linecap="round"/><path d="M0 -14 q12 -12 20 -6 q-8 10 -20 6z" fill="#7CC36A"/>
    ${L(`${[0, 72, 144, 216, 288].map(a => `<circle cx="0" cy="-48" r="9" fill="${c}" transform="rotate(${a} 0 -38)"/>`).join('')}`)}
    <circle cx="0" cy="-38" r="7" fill="${mid}"/></g>`;

  const bush = (x, y, s, c = '#7CC36A', c2 = '#A4D98A') => `<g transform="translate(${x} ${y}) scale(${s})">
    ${L(`<path d="M-80 0 q-10 -50 30 -56 q10 -40 50 -34 q30 -26 60 6 q40 0 34 52 z" fill="${c}"/>`)}
    <circle cx="-30" cy="-50" r="10" fill="${c2}" opacity=".8"/><circle cx="24" cy="-66" r="8" fill="${c2}" opacity=".8"/></g>`;

  const bird = (x, y, s, c = '#8A7A6A') => `<path d="M${x - 14 * s} ${y} q${7 * s} ${-8 * s} ${14 * s} 0 q${7 * s} ${-8 * s} ${14 * s} 0" fill="none" stroke="${c}" stroke-width="${3.2 * s}" stroke-linecap="round" stroke-linejoin="round"/>`;

  const snowflake = (x, y, r, c = '#FFFFFF', o = 1, w = 3) => {
    let d = '';
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3, ca = Math.cos(a), sa = Math.sin(a);
      const ex = x + r * ca, ey = y + r * sa, mx = x + r * .58 * ca, my = y + r * .58 * sa;
      const b = r * .3;
      d += `M${x} ${y}L${ex.toFixed(1)} ${ey.toFixed(1)}`;
      d += `M${mx.toFixed(1)} ${my.toFixed(1)}L${(mx + b * Math.cos(a + .8)).toFixed(1)} ${(my + b * Math.sin(a + .8)).toFixed(1)}`;
      d += `M${mx.toFixed(1)} ${my.toFixed(1)}L${(mx + b * Math.cos(a - .8)).toFixed(1)} ${(my + b * Math.sin(a - .8)).toFixed(1)}`;
    }
    return `<path d="${d}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" fill="none" opacity="${o}"/>`;
  };

  /* ================= the six worlds ================= */
  const W = [];

  // 0 — forest
  W[0] = () => `
    <defs><radialGradient id="w0-sky" cx="50%" cy="44%" r="68%">
      <stop offset="0" stop-color="#FCFEF4"/><stop offset=".55" stop-color="#F3F9E6"/><stop offset="1" stop-color="#E2F0CF"/>
    </radialGradient></defs>
    <rect width="1920" height="1080" fill="url(#w0-sky)"/>
    <circle cx="1700" cy="120" r="70" fill="#FFF2C2" opacity=".9"/><circle cx="1700" cy="120" r="104" fill="#FFF2C2" opacity=".35"/>
    ${cloud(-40, 120, 1.5)}${cloud(330, 70, .7, .9)}${cloud(1380, 90, .8, .9)}
    ${bird(470, 210, 1)}${bird(520, 186, .8)}${bird(1300, 170, .9)}
    ${B(`<path d="M0 560 q170 -60 360 20 q120 60 160 150 q-200 50 -520 40z" fill="#DCEDC6"/>`)}
    ${B(`<path d="M1920 520 q-200 -40 -360 70 q-110 80 -140 160 q280 30 500 0z" fill="#DCEDC6"/>`)}
    ${[[40, 600, .5], [120, 580, .62], [220, 610, .5], [1720, 570, .55], [1820, 545, .65], [1640, 620, .45]].map(([x, y, s]) =>
      `<g opacity=".55">${pine(x, y, s, ['#BFDDA6', '#B2D597'])}</g>`).join('')}
    ${B(`<path d="M0 720 q160 -40 330 10 q190 70 300 150 q-150 60 -630 60z" fill="#CFE6B4"/>`)}
    ${B(`<path d="M1920 650 q-170 -30 -330 60 q-180 100 -330 170 q330 60 660 40z" fill="#CDE4B0"/>`)}
    ${tree(1745, 740, .95)}${tree(1870, 700, .78, ['#9BD27E', '#75BD61', '#C3E8A8'])}
    ${tree(90, 880, 1.25)}${tree(215, 850, .8, ['#9BD27E', '#75BD61', '#C3E8A8'])}
    ${B(`<path d="M0 880 q300 -40 640 -10 q340 30 640 -20 q320 -40 640 10 v220 h-1920z" fill="#DDEEC9"/>`)}
    ${B(`<path d="M0 960 q480 -50 960 0 t960 -10 v130 h-1920z" fill="#C9E4AE"/>`)}
    ${bush(330, 925, .9)}${bush(1480, 905, .7, '#8ACB72')}
    ${mushroom(70, 1010, 1)}${mushroom(150, 1040, .6, '#FF8A3D')}${mushroom(1410, 1000, .55)}
    ${flower(420, 1010, .9)}${flower(560, 1040, .7, '#B79AF5')}${flower(780, 1000, .6, '#FFF8EC')}${flower(1120, 1030, .8, '#FFC93C', '#FF8A3D')}${flower(1290, 1010, .65)}
    ${flower(240, 1050, .7, '#FFC93C', '#FF8A3D')}`;

  // 1 — sea
  W[1] = () => {
    const shell = (x, y, s, c = '#F7B6A8') => `<g transform="translate(${x} ${y}) scale(${s})">${L(`<path d="M0 0 q-34 -4 -30 -34 q4 -24 30 -28 q26 4 30 28 q4 30 -30 34z" fill="${c}"/>`)}
      <path d="M0 -2 l-18 -44 M0 -2 l-6 -54 M0 -2 l6 -54 M0 -2 l18 -44" stroke="#fff" stroke-width="3" opacity=".7"/>${L(`<rect x="-10" y="-6" width="20" height="10" rx="4" fill="${c}"/>`)}</g>`;
    const starfish = (x, y, s, rot = 0) => `<g transform="translate(${x} ${y}) scale(${s}) rotate(${rot})">${L(`<path d="${star5(0, 0, 34, 15)}" fill="#FF9E6B" stroke="#FF9E6B" stroke-width="8" stroke-linejoin="round"/>`)}
      <circle cx="0" cy="-14" r="2.5" fill="#fff"/><circle cx="12" cy="-4" r="2.5" fill="#fff"/><circle cx="-12" cy="-4" r="2.5" fill="#fff"/><circle cx="7" cy="10" r="2.5" fill="#fff"/><circle cx="-7" cy="10" r="2.5" fill="#fff"/></g>`;
    const fish = (x, y, s, c, flip = false) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">${L(`<path d="M-30 0 q24 -26 52 0 q-28 26 -52 0z M18 0 l20 -14 v28z" fill="${c}"/>`)}<circle cx="-16" cy="-3" r="3.5" fill="#2b2350"/></g>`;
    const weed = (x, y, s, c = '#5FB87A') => `<g transform="translate(${x} ${y}) scale(${s})" opacity=".85"><path d="M0 0 q-20 -40 0 -80 q20 -40 0 -90 M18 0 q14 -40 -4 -70 q-14 -30 6 -60" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round"/></g>`;
    return `
    <defs><linearGradient id="w1-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#D6EFFA"/><stop offset=".5" stop-color="#F3FBFD"/><stop offset="1" stop-color="#FBFEFE"/>
    </linearGradient></defs>
    <rect width="1920" height="1080" fill="url(#w1-sky)"/>
    <g transform="translate(200 150)">${Array.from({ length: 12 }, (_, i) => `<path d="M0 -92 l9 -26 l9 26z" fill="#FFE08A" opacity=".55" transform="rotate(${i * 30})"/>`).join('')}
      ${L(`<circle r="70" fill="#FFD95E"/>`)}<circle r="52" fill="#FFE68E"/></g>
    ${cloud(1450, 90, 1.1)}${cloud(1700, 200, .8, .9)}${cloud(560, 80, .6, .85)}
    ${bird(420, 250, 1, '#7F98A8')}${bird(470, 226, .8, '#7F98A8')}${bird(1320, 210, .9, '#7F98A8')}
    ${B(`<path d="M0 560 H1920 V1080 H0Z" fill="#DDF1F6"/>`)}
    <g transform="translate(150 562)">${L(`<path d="M-50 0 h100 l-16 18 h-68z" fill="#E08A5A"/><path d="M0 -6 v-84" stroke="#9A6A48" stroke-width="4"/><path d="M4 -86 q36 40 32 76 h-32z" fill="#FFFDF8"/><path d="M-4 -78 q-24 34 -28 68 h28z" fill="#FFB0A0"/>`)}</g>
    ${B(waveBand(640, 14, 240, '#D2ECF4', 60, '#F4FBFD'))}
    ${B(waveBand(740, 16, 260, '#C6E6F0', 140, '#EEF9FC'))}
    ${B(waveBand(840, 18, 300, '#B8DFEC', 20, '#E6F6FA'))}
    ${fish(90, 740, 1, '#FFB25C')}${fish(170, 800, .7, '#FF8FA8')}${fish(1800, 700, .9, '#FFC93C', true)}${fish(1720, 680, .6, '#8E6CEF', true)}
    ${weed(40, 920, 1)}${weed(200, 930, .8, '#4FA88A')}${weed(1860, 880, .7)}
    ${B(`<path d="M0 925 q260 -40 560 -10 q420 40 820 -10 q300 -30 540 0 V1080 H0Z" fill="#F7E6C2"/>`)}
    <path d="M0 925 q260 -40 560 -10 q420 40 820 -10 q300 -30 540 0" fill="none" stroke="#FFFFFF" stroke-width="6" opacity=".8" stroke-linecap="round"/>
    ${B(`<path d="M0 1000 q480 -40 960 0 t960 -6 V1080 H0Z" fill="#F3DCAE"/>`)}
    <g transform="translate(150 1020) rotate(-10)"><path d="M0 0 V-205" stroke="#9A6A48" stroke-width="7" stroke-linecap="round"/>
      ${L(`<path d="M-110 -150 Q-100 -218 0 -222 Q100 -218 110 -150 q-27.5 -14 -55 0 q-27.5 -14 -55 0 q-27.5 -14 -55 0 q-27.5 -14 -55 0z" fill="#FF7A6B"/>`)}
      <path d="M0 -222 Q-50 -206 -55 -150 q27.5 -14 55 0 Q4 -200 0 -222z M0 -222 Q90 -214 110 -150 q-27.5 -14 -55 0 Q50 -206 0 -222z" fill="#FFF3E6"/>
      <circle cx="0" cy="-224" r="6" fill="#9A6A48"/></g>
    ${shell(340, 1000, .9)}${shell(820, 1050, .7, '#FFD6A0')}${starfish(560, 1010, .9, 12)}${starfish(1180, 1040, .7, -20)}${shell(1400, 1020, .6, '#F4C2D8')}
    <g fill="#E8CC98"><circle cx="460" cy="1040" r="4"/><circle cx="700" cy="1025" r="3"/><circle cx="980" cy="1050" r="4"/><circle cx="1300" cy="1060" r="3"/><circle cx="1050" cy="1010" r="3"/></g>`;
  };

  // 2 — space
  W[2] = () => {
    const r = rng(42);
    let stars = '';
    for (let i = 0; i < 260; i++) {
      const x = r() * 1920, y = r() * 1080, s = .8 + r() * 2.4;
      if (y > 930 || inPopo(x, y)) continue;
      const centre = inCentre(x, y, -40);
      if (centre && r() < .55) continue;
      stars += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(centre ? s * .7 : s).toFixed(1)}" fill="#FFF6DC" opacity="${(centre ? .3 + r() * .25 : .5 + r() * .5).toFixed(2)}"/>`;
    }
    const sp = [[90, 420, 16], [330, 110, 12], [1540, 80, 14], [1860, 380, 12], [200, 760, 13], [1610, 560, 10], [980, 70, 11], [720, 120, 8], [1250, 110, 9]]
      .map(([x, y, s]) => sparkle(x, y, s, '#FFE7A0')).join('');
    const crater = (x, y, rx, c = '#A9A3D6') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx * .36}" fill="${c}"/><path d="M${x - rx} ${y} a${rx} ${rx * .36} 0 0 1 ${2 * rx} 0" fill="none" stroke="#8A83C2" stroke-width="3" opacity=".6"/>`;
    return `
    <defs><filter id="w2-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="50"/></filter><radialGradient id="w2-sky" cx="50%" cy="46%" r="70%">
      <stop offset="0" stop-color="#3C4180"/><stop offset=".5" stop-color="#30336C"/><stop offset="1" stop-color="#1C1A48"/>
    </radialGradient></defs>
    <rect width="1920" height="1080" fill="url(#w2-sky)"/>
    <g filter="url(#w2-blur)"><ellipse cx="160" cy="300" rx="380" ry="260" fill="#6A4FB0" opacity=".3"/><ellipse cx="1820" cy="760" rx="360" ry="300" fill="#3E7FB8" opacity=".25"/>
    <ellipse cx="1700" cy="140" rx="300" ry="160" fill="#B04F9A" opacity=".22"/></g>
    ${stars}${sp}
    <g transform="translate(170 170)">
      <ellipse rx="170" ry="40" fill="none" stroke="#F7C98B" stroke-width="16" transform="rotate(-16)"/>
      ${L(`<circle r="100" fill="#F49A6B"/>`)}
      <path d="M-96 -24 q96 24 192 0 M-90 28 q90 20 180 0" stroke="#E07F55" stroke-width="16" fill="none" opacity=".7"/>
      <circle cx="-34" cy="-40" r="22" fill="#FFF" opacity=".16"/>
      <path d="M-169 4 A170 40 0 0 0 169 -4" fill="none" stroke="#FFD9A0" stroke-width="16" stroke-linecap="round" transform="rotate(-16)"/>
    </g>
    <g transform="translate(1770 150)">${L(`<circle r="62" fill="#B79AF5"/>`)}<circle cx="-18" cy="-14" r="14" fill="#9F82E6"/><circle cx="20" cy="18" r="10" fill="#9F82E6"/><circle cx="16" cy="-24" r="6" fill="#9F82E6"/><circle cx="-24" cy="-26" r="12" fill="#FFF" opacity=".18"/></g>
    <g transform="translate(110 610)">${L(`<circle r="44" fill="#F3EEDC"/>`)}<circle cx="-12" cy="-10" r="9" fill="#DCD5BD"/><circle cx="14" cy="12" r="7" fill="#DCD5BD"/><circle cx="12" cy="-16" r="4" fill="#DCD5BD"/></g>
    <g transform="translate(1810 520) rotate(28)">
      <path d="M-15 48 q15 64 30 0z" fill="#FFB238"/><path d="M-8 48 q8 36 16 0z" fill="#FFE27A"/>
      <rect x="-17" y="38" width="34" height="12" rx="4" fill="#B9B3D8"/>
      ${L(`<path d="M-27 4 l-24 40 l26 -6z M27 4 l24 40 l-26 -6z" fill="#E5534B"/>`)}
      ${L(`<path d="M0 -70 q34 30 30 110 h-60 q-4 -80 30 -110z" fill="#F7F3EA"/>`)}
      <path d="M0 -70 q20 18 26 46 h-52 q6 -28 26 -46z" fill="#E5534B"/>
      <circle cx="0" cy="6" r="14" fill="#5AA9F0" stroke="#C9C2B4" stroke-width="5"/><circle cx="-4" cy="2" r="4" fill="#fff" opacity=".7"/></g>
    <g opacity=".85"><path d="M760 70 L980 40" stroke="#FFF6DC" stroke-width="3" stroke-linecap="round" opacity=".5"/><circle cx="984" cy="40" r="5" fill="#FFF6DC"/></g>
    ${B(`<path d="M0 930 q240 -50 520 -10 q300 40 640 0 q380 -40 760 0 V1080 H0Z" fill="#7F78BE"/>`)}
    ${B(`<path d="M0 990 q480 -40 960 0 t960 -6 V1080 H0Z" fill="#938CCF"/>`)}
    ${crater(160, 1020, 50)}${crater(420, 960, 34, '#6E67AE')}${crater(720, 1040, 40)}${crater(1060, 1010, 28)}${crater(1340, 1046, 36)}${crater(900, 958, 22, '#6E67AE')}
    <g transform="translate(260 935)">${L(`<path d="M0 0 v-90" stroke="#E8E2F8" stroke-width="5"/><path d="M2 -90 h56 l-10 14 l10 14 h-56z" fill="#FF8FA8"/>`)}</g>`;
  };

  // 3 — desert
  W[3] = () => {
    const cactus = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">
      ${L(`<path d="M0 0 V-250 M0 -110 h-36 q-22 0 -22 -22 v-56 M0 -150 h32 q20 0 20 -20 v-46" fill="none" stroke="#6FB36A" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>`)}
      <path d="M-8 -10 V-248 M10 -10 V-244 M-58 -140 v-46 M52 -178 v-36" stroke="#8ACB72" stroke-width="5" stroke-linecap="round"/>
      ${L(`<circle cx="-6" cy="-276" r="10" fill="#FF8FA8"/><circle cx="8" cy="-272" r="9" fill="#FF6B8A"/>`)}</g>`;
    const barrel = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${L(`<ellipse cx="0" cy="-34" rx="34" ry="38" fill="#7CBF6E"/>`)}
      <path d="M0 -70 v70 M-18 -64 q-10 30 0 62 M18 -64 q10 30 0 62" stroke="#5FA35A" stroke-width="4" fill="none"/>${L(`<circle cx="0" cy="-74" r="9" fill="#FFC93C"/>`)}</g>`;
    const camel = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}" stroke="${c}" stroke-linecap="round">
      <ellipse cx="60" cy="-52" rx="38" ry="17" stroke="none"/><ellipse cx="60" cy="-66" rx="20" ry="18" stroke="none"/>
      <path d="M30 -54 q-8 -14 -16 -30" fill="none" stroke-width="11"/><ellipse cx="8" cy="-86" rx="13" ry="7" stroke="none"/>
      <path d="M36 -44 v42 M48 -44 v42 M76 -44 v42 M88 -44 v42" stroke-width="6" fill="none"/><path d="M97 -54 q8 6 6 18" stroke-width="3" fill="none"/></g>`;
    const rock = (x, y, s, c = '#D9A46E') => `<g transform="translate(${x} ${y}) scale(${s})">${L(`<path d="M-40 0 q2 -30 22 -34 q20 -16 40 4 q20 6 18 30z" fill="${c}"/>`)}</g>`;
    return `
    <defs><radialGradient id="w3-sky" cx="50%" cy="46%" r="68%">
      <stop offset="0" stop-color="#FFFAEE"/><stop offset=".55" stop-color="#FFF2DC"/><stop offset="1" stop-color="#FCE2BC"/>
    </radialGradient></defs>
    <rect width="1920" height="1080" fill="url(#w3-sky)"/>
    <g transform="translate(1775 150)">
      <circle r="150" fill="#FFE1A0" opacity=".3"/><circle r="118" fill="#FFD57E" opacity=".35"/>
      ${L(`<circle r="88" fill="#FFC24A"/>`)}<circle r="68" fill="#FFD36A"/><circle cx="-30" cy="-30" r="22" fill="#FFF" opacity=".2"/></g>
    ${cloud(60, 110, .9, .85, '#FFFBF2')}${cloud(520, 70, .55, .7, '#FFFBF2')}
    ${bird(380, 230, 1, '#B08A62')}${bird(430, 205, .8, '#B08A62')}
    ${B(`<path d="M0 600 q200 -70 420 0 q150 50 220 130 q-260 40 -640 30z" fill="#F7E0B6"/>`)}
    ${B(`<path d="M1920 600 q-240 -50 -420 50 q-120 70 -160 120 q300 30 580 10z" fill="#F7E0B6"/>`)}
    ${camel(80, 610, 1.1, '#E2B47C')}
    ${B(`<path d="M0 740 q180 -40 340 10 q200 60 300 140 q-160 60 -640 60z" fill="#F2D3A0"/>`)}
    ${B(`<path d="M1920 690 q-170 -30 -330 50 q-180 90 -330 160 q330 60 660 40z" fill="#F1D19C"/>`)}
    ${cactus(1790, 760, .62)}${barrel(1880, 740, .6)}
    ${B(`<path d="M0 890 q300 -40 640 -10 q340 30 640 -20 q320 -40 640 10 V1080 H0Z" fill="#F6DFB2"/>`)}
    ${cactus(130, 965, 1)}${barrel(270, 975, .8)}
    ${B(`<path d="M0 970 q480 -50 960 0 t960 -10 V1080 H0Z" fill="#EFCB91"/>`)}
    ${rock(420, 1010, 1)}${rock(980, 1040, .7, '#E3B07A')}${rock(1350, 1010, .8)}
    ${barrel(640, 1040, .55)}
    <path d="M520 1050 q60 -16 120 0 M1120 1030 q50 -14 100 0 M800 1000 q40 -10 80 0" stroke="#E2B47C" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  };

  // 4 — snow
  W[4] = () => {
    const r = rng(7);
    let flakes = '';
    for (let i = 0; i < 70; i++) {
      const x = r() * 1920, y = r() * 960;
      if (inPopo(x, y)) continue;
      if (inCentre(x, y, -30)) { if (r() < .5) flakes += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(2 + r() * 3).toFixed(1)}" fill="#FFFFFF" opacity=".7"/>`; continue; }
      flakes += r() < .4 ? snowflake(x, y, 10 + r() * 12, '#FFFFFF', .95, 3) : `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(3 + r() * 4).toFixed(1)}" fill="#FFFFFF"/>`;
    }
    const snowman = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">
      ${L(`<circle cx="0" cy="-50" r="52" fill="#FFFFFF" stroke="#D6E3EE" stroke-width="3"/>`)}${L(`<circle cx="0" cy="-130" r="40" fill="#FFFFFF" stroke="#D6E3EE" stroke-width="3"/>`)}${L(`<circle cx="0" cy="-196" r="32" fill="#FFFFFF" stroke="#D6E3EE" stroke-width="3"/>`)}
      <path d="M-34 -138 l-50 -30 M34 -138 l46 -34 M-70 -160 l-10 -16 M75 -164 l12 -14" stroke="#8C5E3C" stroke-width="6" stroke-linecap="round"/>
      ${L(`<path d="M-34 -168 q34 14 68 0 l2 14 q-36 14 -72 0z M14 -160 l16 40 l-18 4z" fill="#E5534B"/>`)}
      ${L(`<rect x="-30" y="-238" width="60" height="10" rx="4" fill="#3b3550"/><rect x="-20" y="-272" width="40" height="38" rx="6" fill="#3b3550"/>`)}<rect x="-20" y="-244" width="40" height="7" fill="#E5534B"/>
      <circle cx="-11" cy="-202" r="4.5" fill="#2b2350"/><circle cx="11" cy="-202" r="4.5" fill="#2b2350"/><path d="M0 -194 l26 6 l-26 4z" fill="#FF8A3D"/>
      <circle cx="0" cy="-140" r="4" fill="#2b2350"/><circle cx="0" cy="-118" r="4" fill="#2b2350"/><circle cx="0" cy="-60" r="4" fill="#2b2350"/></g>`;
    return `
    <defs><radialGradient id="w4-sky" cx="50%" cy="44%" r="68%">
      <stop offset="0" stop-color="#F7FBFE"/><stop offset=".55" stop-color="#EAF3FA"/><stop offset="1" stop-color="#D3E5F3"/>
    </radialGradient></defs>
    <rect width="1920" height="1080" fill="url(#w4-sky)"/>
    ${cloud(-40, 120, 1.5, 1, '#FFFFFF', '#D8E4EE')}${cloud(320, 70, .7, .9, '#FFFFFF', '#D8E4EE')}${cloud(1620, 140, 1.3, 1, '#FFFFFF', '#D8E4EE')}${cloud(1420, 70, .6, .85, '#FFFFFF', '#D8E4EE')}
    ${B(`<path d="M0 560 q170 -80 360 10 q120 60 170 150 q-220 50 -530 40z" fill="#E1ECF5"/>`)}
    ${B(`<path d="M1920 520 q-200 -60 -380 70 q-100 70 -130 150 q280 30 510 0z" fill="#E1ECF5"/>`)}
    ${[[40, 610, .5], [130, 585, .62], [230, 620, .48], [1700, 580, .55], [1810, 550, .65], [1610, 640, .45]].map(([x, y, s]) =>
      `<g opacity=".5">${pine(x, y, s, ['#A9C7D6', '#9CBCCB'], true)}</g>`).join('')}
    ${B(`<path d="M0 720 q160 -40 330 10 q190 70 300 150 q-150 60 -630 60z" fill="#F2F7FB"/>`)}
    ${B(`<path d="M1920 650 q-170 -30 -330 60 q-180 100 -330 170 q330 60 660 40z" fill="#F0F6FA"/>`)}
    ${pine(1740, 740, .95, ['#5FA98A', '#4B9474'], true)}${pine(1860, 705, .75, ['#6DB596', '#57A07F'], true)}
    ${pine(80, 890, 1.3, ['#5FA98A', '#4B9474'], true)}${pine(215, 870, .85, ['#6DB596', '#57A07F'], true)}
    ${B(`<path d="M0 880 q300 -40 640 -10 q340 30 640 -20 q320 -40 640 10 V1080 H0Z" fill="#F8FBFD"/>`)}
    ${B(`<path d="M0 960 q480 -50 960 0 t960 -10 V1080 H0Z" fill="#FFFFFF"/>`)}
    <path d="M0 960 q480 -50 960 0 t960 -10" fill="none" stroke="#DCE8F2" stroke-width="4" opacity=".8"/>
    ${snowman(360, 1045, .6)}
    ${flakes}
    <g fill="#DCE8F2"><ellipse cx="700" cy="1030" rx="40" ry="6"/><ellipse cx="1060" cy="1050" rx="56" ry="7"/><ellipse cx="1350" cy="1020" rx="34" ry="5"/></g>
    ${snowflake(120, 300, 22, '#FFFFFF')}${snowflake(1800, 420, 20, '#FFFFFF')}${snowflake(560, 210, 14, '#FFFFFF')}${snowflake(1350, 230, 16, '#FFFFFF')}`;
  };

  // 5 — candy land
  W[5] = () => {
    const spiral = (R, turns = 3) => {
      let d = '';
      const n = turns * 40;
      for (let i = 0; i <= n; i++) {
        const t = i / n, a = t * turns * Math.PI * 2, rr = R * t;
        d += `${i ? 'L' : 'M'}${(rr * Math.cos(a)).toFixed(1)} ${(rr * Math.sin(a)).toFixed(1)}`;
      }
      return d;
    };
    const lolly = (x, y, s, c1, c2, h = 220) => `<g transform="translate(${x} ${y}) scale(${s})">
      ${L(`<rect x="-7" y="${-h}" width="14" height="${h}" rx="6" fill="#FFF8EC"/>`)}
      ${L(`<circle cx="0" cy="${-h}" r="72" fill="${c1}"/>`)}
      <path d="${spiral(66, 3)}" transform="translate(0 ${-h})" fill="none" stroke="${c2}" stroke-width="15" stroke-linecap="round"/>
      <circle cx="-26" cy="${-h - 30}" r="12" fill="#fff" opacity=".45"/></g>`;
    const cane = (x, y, s, flip = false) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
      ${L(`<path d="M0 0 V-150 q0 -40 -36 -40 q-36 0 -36 34" fill="none" stroke="#FFFFFF" stroke-width="26" stroke-linecap="round"/>`)}
      <path d="M0 0 V-150 q0 -40 -36 -40 q-36 0 -36 34" fill="none" stroke="#F0607E" stroke-width="26" stroke-dasharray="16 16"/></g>`;
    const cupcake = (x, y, s, fr = '#FFB3CC', liner = '#8FD9BD') => `<g transform="translate(${x} ${y}) scale(${s})">
      ${L(`<path d="M-70 -80 h140 l-18 80 h-104z" fill="${liner}"/>`)}
      <path d="M-46 -78 l8 76 M-16 -78 l3 76 M16 -78 l-3 76 M46 -78 l-8 76" stroke="#fff" stroke-width="7" opacity=".6"/>
      ${L(`<path d="M-80 -78 q-10 -36 30 -40 q-4 -40 40 -44 q14 -36 50 -10 q40 0 36 46 q40 4 26 48 q-90 14 -182 0z" fill="${fr}"/>`)}
      <g stroke-width="6" stroke-linecap="round"><path d="M-40 -110 l8 -6" stroke="#FFC93C"/><path d="M0 -136 l10 4" stroke="#5AA9F0"/><path d="M30 -100 l6 8" stroke="#8E6CEF"/><path d="M-10 -96 l-8 6" stroke="#69B85F"/><path d="M44 -130 l-8 -4" stroke="#FF8A3D"/></g>
      ${L(`<circle cx="6" cy="-168" r="16" fill="#E5344F"/>`)}<path d="M8 -182 q6 -20 20 -24" stroke="#5DAE57" stroke-width="4" fill="none"/></g>`;
    const gum = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">${L(`<path d="M-30 0 q0 -50 30 -50 q30 0 30 50z" fill="${c}"/>`)}<circle cx="-10" cy="-34" r="5" fill="#fff" opacity=".5"/><g fill="#fff" opacity=".6"><circle cx="8" cy="-20" r="2"/><circle cx="-14" cy="-12" r="2"/><circle cx="14" cy="-38" r="2"/></g></g>`;
    const drip = (y, fill, phase = 0) => { // icing hill top with drips
      let d = `M0 ${y}`;
      for (let x = 0; x < 2100; x += 160) d += ` q40 -24 80 0 q16 36 30 0 q20 -10 50 0`;
      return `<path d="${d} V1080 H0Z" fill="${fill}" transform="translate(${-phase} 0)"/>`;
    };
    const r = rng(11);
    let sprinkles = '';
    const sc = ['#FFC93C', '#5AA9F0', '#8E6CEF', '#69B85F', '#FF8A3D', '#F0607E'];
    for (let i = 0; i < 70; i++) {
      const x = r() * 1920, y = 975 + r() * 100;
      if (inPopo(x, y)) continue;
      sprinkles += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="14" height="5" rx="2.5" fill="${sc[i % 6]}" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
    }
    return `
    <defs><radialGradient id="w5-sky" cx="50%" cy="44%" r="68%">
      <stop offset="0" stop-color="#FFFAFB"/><stop offset=".55" stop-color="#FFF1F5"/><stop offset="1" stop-color="#FCDDEA"/>
    </radialGradient></defs>
    <rect width="1920" height="1080" fill="url(#w5-sky)"/>
    ${cloud(-40, 120, 1.5, 1, '#FFFFFF', '#F6CFDE')}${cloud(330, 70, .7, .9, '#FFF0F6', '#F6CFDE')}${cloud(1630, 150, 1.3, 1, '#FFFFFF', '#F6CFDE')}${cloud(1420, 70, .65, .9, '#F3FFFA', '#CDEBDF')}
    ${sparkle(560, 200, 12, '#FFC2D8')}${sparkle(1350, 230, 14, '#BFEBDA')}${sparkle(140, 380, 10, '#FFD98A')}${sparkle(1820, 420, 12, '#FFC2D8')}
    ${B(`<path d="M0 580 q180 -70 380 10 q120 60 170 140 q-220 50 -550 40z" fill="#FBDCE8"/>`)}
    ${B(`<path d="M1920 540 q-200 -50 -380 70 q-100 70 -130 140 q280 30 510 0z" fill="#D9F2E7"/>`)}
    ${B(`<path d="M0 720 q160 -40 330 10 q190 70 300 150 q-150 60 -630 60z" fill="#F9CEDE"/>`)}
    ${B(`<path d="M1920 650 q-170 -30 -330 60 q-180 100 -330 170 q330 60 660 40z" fill="#C9EDDD"/>`)}
    ${lolly(1760, 740, .9, '#FFD3E2', '#F0607E', 200)}${lolly(1880, 700, .62, '#D7F3E8', '#4FC7A0', 190)}
    ${lolly(100, 880, 1.15, '#FFF0C2', '#FF8A3D', 230)}
    ${cane(240, 900, .9)}
    ${B(drip(900, '#FDE6EE'))}
    ${B(drip(975, '#D3F1E4', 60))}
    ${sprinkles}
    ${cupcake(120, 1060, .95)}${cupcake(360, 1060, .65, '#C9B6F7', '#FFC2D8')}
    ${gum(560, 1050, .9, '#FF8FA8')}${gum(640, 1060, .7, '#FFC93C')}${gum(1240, 1050, .8, '#8E6CEF')}${gum(1320, 1060, .6, '#69B85F')}${gum(980, 1060, .7, '#5AA9F0')}`;
  };

  ART.world = (i) => `<svg viewBox="0 0 1920 1080" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${W[((i % 6) + 6) % 6]()}</svg>`;
  ART.WORLD_NAMES = ['יער', 'ים', 'חלל', 'מדבר', 'שלג', 'ממתקים'];
  ART.WORLD_COLORS = [
    { accent: '#4FA65A', road: '#E3C48F', light: '#E6F3D6' },
    { accent: '#2E9FD0', road: '#F1D9A6', light: '#DDF2F8' },
    { accent: '#8E6CEF', road: '#7A72C9', light: '#E8E4FF' },
    { accent: '#E8873A', road: '#D69A5B', light: '#FDEBD3' },
    { accent: '#4A9BD6', road: '#A9D4EE', light: '#E4F1FA' },
    { accent: '#F0607E', road: '#8FD9BD', light: '#FFE3EC' },
  ];

  /* ================= Popo's wardrobe (230x260 Popo space) ================= */
  ART.WARDROBE = [
    { id: 'hat-party', kind: 'hat', name: 'כובע מסיבה', price: 10 },
    { id: 'hat-bunny', kind: 'hat', name: 'אוזני ארנב', price: 20 },
    { id: 'hat-cap', kind: 'hat', name: 'כובע בייסבול', price: 25 },
    { id: 'hat-winter', kind: 'hat', name: 'כובע חורף', price: 30 },
    { id: 'hat-chef', kind: 'hat', name: 'כובע שף', price: 35 },
    { id: 'hat-pirate', kind: 'hat', name: 'כובע פיראט', price: 45 },
    { id: 'hat-wizard', kind: 'hat', name: 'כובע קוסם', price: 60 },
    { id: 'hat-crown', kind: 'hat', name: 'כתר', price: 80 },
    { id: 'gl-round', kind: 'glasses', name: 'משקפיים עגולים', price: 10 },
    { id: 'gl-sun', kind: 'glasses', name: 'משקפי שמש', price: 15 },
    { id: 'gl-heart', kind: 'glasses', name: 'משקפי לב', price: 25 },
    { id: 'gl-star', kind: 'glasses', name: 'משקפי כוכב', price: 35 },
    { id: 'gl-mask', kind: 'glasses', name: 'מסכת גיבור', price: 50 },
    { id: 'cape-green', kind: 'cape', name: 'גלימה ירוקה', price: 30 },
    { id: 'cape-red', kind: 'cape', name: 'גלימה אדומה', price: 35 },
    { id: 'cape-blue', kind: 'cape', name: 'גלימה כחולה', price: 35 },
    { id: 'cape-purple', kind: 'cape', name: 'גלימה סגולה עם כוכבים', price: 55 },
    { id: 'cape-gold', kind: 'cape', name: 'גלימת זהב', price: 80 },
    { id: 'col-pink', kind: 'color', name: 'ורוד', price: 20 },
    { id: 'col-orange', kind: 'color', name: 'כתום', price: 20 },
    { id: 'col-yellow', kind: 'color', name: 'צהוב', price: 25 },
    { id: 'col-blue', kind: 'color', name: 'כחול', price: 25 },
    { id: 'col-purple', kind: 'color', name: 'סגול', price: 30 },
    { id: 'col-lime', kind: 'color', name: 'ירוק-ליים', price: 40 },
  ];

  ART.POPO_COLORS = {
    teal: { body: '#3CC2B4', arm: '#1FA89C', leg: '#1A9D92' },
    'col-pink': { body: '#F98DB8', arm: '#E46A9C', leg: '#DC6293' },
    'col-purple': { body: '#A585F0', arm: '#8463DC', leg: '#7C5AD4' },
    'col-orange': { body: '#FFA552', arm: '#EE8432', leg: '#E67B2A' },
    'col-blue': { body: '#5DAEF2', arm: '#3D8FDB', leg: '#3586D0' },
    'col-yellow': { body: '#FFD24A', arm: '#EFB52A', leg: '#E9AC20' },
    'col-lime': { body: '#A8D84C', arm: '#86BC2E', leg: '#7DB328' },
  };

  /* ---- hats (drawn on top; head top is at (112,64)) ---- */
  const HAT = {
    'hat-party': () => `<g transform="rotate(-10 112 76)">
      ${L(`<path d="M80 78 L112 12 L144 78 Q112 88 80 78Z" fill="#FF6B8A"/>`)}
      <path d="M96 46 l10 6 M118 30 l6 8 M102 66 l10 2 M124 58 l8 4" stroke="#FFE27A" stroke-width="6" stroke-linecap="round"/>
      <circle cx="112" cy="40" r="4" fill="#fff"/><circle cx="128" cy="68" r="4" fill="#fff"/><circle cx="92" cy="62" r="3.5" fill="#fff"/>
      <path d="M80 78 l8 -8 l8 8 l8 -8 l8 8 l8 -8 l8 8 l8 -8 l8 8 Q112 90 80 78Z" fill="#FFF8EC"/>
      ${L(`<circle cx="112" cy="12" r="10" fill="#FFC93C"/>`)}</g>`,
    'hat-crown': () => `
      ${L(`<path d="M70 84 L68 40 L90 60 L112 30 L134 60 L156 40 L154 84 Q112 74 70 84Z" fill="#FFC93C"/>`)}
      <path d="M70 84 L69 70 Q112 58 155 70 L154 84 Q112 74 70 84Z" fill="#F2AE1E"/>
      <path d="M78 52 L90 64 L112 38" stroke="#FFE68E" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${L(`<circle cx="68" cy="38" r="6" fill="#FFE27A"/><circle cx="112" cy="28" r="7" fill="#FFE27A"/><circle cx="156" cy="38" r="6" fill="#FFE27A"/>`)}
      <circle cx="112" cy="70" r="7" fill="#E5534B"/><circle cx="88" cy="73" r="5" fill="#4FA8E0"/><circle cx="136" cy="73" r="5" fill="#69B85F"/>
      <circle cx="110" cy="68" r="2" fill="#fff" opacity=".8"/>`,
    'hat-wizard': () => `
      ${L(`<ellipse cx="112" cy="76" rx="60" ry="13" fill="#5B3FB0"/>`)}
      ${L(`<path d="M80 74 L104 22 Q114 2 140 8 Q122 14 118 26 L144 74 Q112 82 80 74Z" fill="#7E5BDB"/>`)}
      <path d="M82 70 Q112 78 142 70 L139 62 Q112 70 85 62Z" fill="#FFC93C"/>
      <path d="${star5(110, 42, 8)}" fill="#FFE27A"/><path d="${star5(126, 56, 5)}" fill="#FFE27A"/><path d="${star5(96, 56, 4)}" fill="#FFE27A"/>
      ${L(`<circle cx="140" cy="8" r="5" fill="#FFE27A"/>`)}`,
    'hat-winter': () => `
      ${L(`<path d="M52 88 Q54 30 112 28 Q170 30 172 88Z" fill="#E5534B"/>`)}
      <path d="M80 40 q-10 20 -10 46 M112 30 v56 M144 40 q10 20 10 46" stroke="#C93F38" stroke-width="5" fill="none" opacity=".7"/>
      ${L(`<path d="M46 84 Q112 62 178 84 L181 104 Q112 82 43 104Z" fill="#FFF8EC"/>`)}
      <path d="M58 86 v14 M74 80 v14 M90 77 v14 M106 75 v14 M122 75 v14 M138 77 v14 M154 80 v14 M168 86 v14" stroke="#EADBC6" stroke-width="4" stroke-linecap="round"/>
      ${L(`<circle cx="112" cy="24" r="17" fill="#FFF8EC"/>`)}<circle cx="106" cy="18" r="5" fill="#fff"/>`,
    'hat-cap': () => `
      ${L(`<path d="M146 80 Q194 72 210 88 Q186 98 146 92Z" fill="#2E86C9"/>`)}
      ${L(`<path d="M60 86 Q62 32 112 30 Q162 32 164 86 Q112 74 60 86Z" fill="#4FA8E0"/>`)}
      <path d="M112 30 Q100 50 98 82 M112 30 Q130 50 136 80" stroke="#3B93CF" stroke-width="3" fill="none"/>
      <path d="${star5(114, 60, 11)}" fill="#FFE27A"/>
      ${L(`<circle cx="112" cy="30" r="5" fill="#2E86C9"/>`)}`,
    'hat-chef': () => `
      ${L(`<path d="M78 66 Q60 58 62 40 Q66 20 88 26 Q96 6 116 10 Q136 6 142 26 Q164 22 164 42 Q164 58 146 66Z" fill="#FFFFFF"/>`)}
      <path d="M92 34 q4 14 2 30 M116 22 v40 M138 34 q-4 14 -2 30" stroke="#E6DDCF" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${L(`<path d="M74 86 Q112 74 150 86 L148 62 Q112 54 76 62Z" fill="#FFFDF8"/>`)}
      <path d="M76 70 Q112 62 148 70" stroke="#E6DDCF" stroke-width="3" fill="none"/>`,
    'hat-pirate': () => `
      ${L(`<path d="M44 86 Q48 50 76 44 Q90 26 112 26 Q134 26 148 44 Q176 50 180 86 Q160 72 112 76 Q64 72 44 86Z" fill="#2E2B3A"/>`)}
      <path d="M44 86 Q64 72 112 76 Q160 72 180 86" stroke="#FFC93C" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M100 66 l24 -18 M100 48 l24 18" stroke="#FFF8EC" stroke-width="5" stroke-linecap="round"/>
      <circle cx="112" cy="52" r="10" fill="#FFF8EC"/><rect x="106" y="58" width="12" height="7" rx="2" fill="#FFF8EC"/>
      <circle cx="108" cy="51" r="2.6" fill="#2E2B3A"/><circle cx="116" cy="51" r="2.6" fill="#2E2B3A"/>`,
    'hat-bunny': () => `
      ${L(`<ellipse cx="86" cy="38" rx="15" ry="32" fill="#FFF8EC" transform="rotate(-14 86 38)"/><ellipse cx="140" cy="38" rx="15" ry="32" fill="#FFF8EC" transform="rotate(16 140 38)"/>`)}
      <ellipse cx="86" cy="40" rx="7" ry="22" fill="#FFB3C6" transform="rotate(-14 86 40)"/><ellipse cx="140" cy="40" rx="7" ry="22" fill="#FFB3C6" transform="rotate(16 140 40)"/>
      ${L(`<path d="M44 104 A78 78 0 0 1 180 104" fill="none" stroke="#FF8FB0" stroke-width="9" stroke-linecap="round"/>`)}`,
  };

  /* ---- glasses (eyes at (92,128) and (136,128)) ---- */
  const temples = (c, w = 5) => `<path d="M72 124 L40 118 M152 124 L184 118" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  const heart = (cx, cy, s) => `M${cx} ${cy + 16 * s} C${cx - 28 * s} ${cy} ${cx - 24 * s} ${cy - 22 * s} ${cx - 11 * s} ${cy - 22 * s} C${cx - 4 * s} ${cy - 22 * s} ${cx} ${cy - 17 * s} ${cx} ${cy - 13 * s} C${cx} ${cy - 17 * s} ${cx + 4 * s} ${cy - 22 * s} ${cx + 11 * s} ${cy - 22 * s} C${cx + 24 * s} ${cy - 22 * s} ${cx + 28 * s} ${cy} ${cx} ${cy + 16 * s}Z`;
  const GL = {
    'gl-sun': () => `${temples('#2b2350')}
      ${L(`<rect x="71" y="113" width="42" height="32" rx="13" fill="#2b2350"/><rect x="115" y="113" width="42" height="32" rx="13" fill="#2b2350"/><path d="M110 120 q4 -4 8 0" stroke="#2b2350" stroke-width="5" fill="none"/>`)}
      <path d="M78 128 l12 -10 M84 136 l18 -16 M122 128 l12 -10 M128 136 l18 -16" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".45"/>`,
    'gl-round': () => `${temples('#3b2b20')}
      ${L(`<g fill="none" stroke="#3b2b20" stroke-width="5"><circle cx="92" cy="129" r="20"/><circle cx="136" cy="129" r="20"/><path d="M111 126 q5 -4 6 0"/></g>`)}
      <path d="M80 120 q4 -6 10 -7 M124 120 q4 -6 10 -7" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`,
    'gl-heart': () => `${temples('#E8457A', 4)}
      ${L(`<path d="${heart(92, 130, 1.25)}" fill="#FF6B8A" fill-opacity=".45" stroke="#E8457A" stroke-width="5" stroke-linejoin="round"/>
           <path d="${heart(136, 130, 1.25)}" fill="#FF6B8A" fill-opacity=".45" stroke="#E8457A" stroke-width="5" stroke-linejoin="round"/>
           <path d="M110 120 q4 -4 8 0" stroke="#E8457A" stroke-width="4" fill="none"/>`)}`,
    'gl-star': () => `${temples('#F2B21E', 4)}
      ${L(`<path d="${star5(92, 130, 27, 14)}" fill="#FFE27A" fill-opacity=".4" stroke="#F2B21E" stroke-width="5" stroke-linejoin="round"/>
           <path d="${star5(136, 130, 27, 14)}" fill="#FFE27A" fill-opacity=".4" stroke="#F2B21E" stroke-width="5" stroke-linejoin="round"/>`)}
      <circle cx="114" cy="122" r="3.5" fill="#F2B21E"/>`,
    'gl-mask': () => `
      <path d="M58 118 q-16 -2 -26 10 M58 124 q-14 6 -20 20" stroke="#C93F38" stroke-width="7" fill="none" stroke-linecap="round"/>
      ${L(`<path fill-rule="evenodd" fill="#E5534B" d="M56 122 Q58 104 92 106 Q112 110 132 106 Q166 104 168 122 Q168 148 140 150 Q122 150 116 140 Q112 134 108 140 Q102 150 84 150 Q56 148 56 122Z
           M78 128 a14 13 0 1 0 28 0 a14 13 0 1 0 -28 0Z M122 128 a14 13 0 1 0 28 0 a14 13 0 1 0 -28 0Z"/>`)}
      <path d="M64 116 q10 -6 22 -4" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>`,
  };

  /* ---- capes (drawn behind Popo's body) ---- */
  const CAPE_C = {
    'cape-red': ['#E5534B', '#C23E37', '#FF8A7E'],
    'cape-blue': ['#4FA8E0', '#2E86C9', '#9AD2F5'],
    'cape-purple': ['#7E5BDB', '#5B3FB0', '#B79AF5'],
    'cape-green': ['#5DB85F', '#3E9A4A', '#9FDB8E'],
    'cape-gold': ['#FFC93C', '#E0A21E', '#FFE68E'],
  };
  const cape = (id) => {
    const [c, d, hi] = CAPE_C[id];
    let extra = '';
    if (id === 'cape-purple') extra = [[30, 160, 7], [26, 214, 6], [196, 170, 7], [200, 222, 6], [56, 236, 5], [170, 238, 5], [112, 244, 4]]
      .map(([x, y, r]) => `<path d="${star5(x, y, r)}" fill="#FFE27A"/>`).join('');
    if (id === 'cape-gold') extra = `<path d="M30 150 q-6 40 -8 74 M198 150 q6 40 8 74" stroke="#FFF3C4" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>
      ${sparkle(34, 200, 7, '#FFF7DA')}${sparkle(192, 196, 7, '#FFF7DA')}`;
    return `${L(`<path d="M46 98 Q28 104 30 132 Q24 190 14 236 Q30 246 50 238 Q66 250 84 242 Q98 252 112 244 Q126 252 140 242 Q158 250 174 238 Q194 246 210 236 Q200 190 194 132 Q196 104 178 98 Q112 82 46 98Z" fill="${c}"/>`)}
      <path d="M36 150 Q30 196 22 232 M188 150 Q194 196 202 232 M60 200 Q56 222 50 238 M164 200 Q168 222 174 238" stroke="${d}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>
      <path d="M46 98 Q36 102 34 116 Q44 110 58 106Z M178 98 Q188 102 190 116 Q180 110 166 106Z" fill="${hi}"/>
      ${extra}`;
  };

  const capeIcon = (id) => {
    const [c, d, hi] = CAPE_C[id];
    const st = id === 'cape-purple' ? [[64, 150, 7], [160, 160, 7], [100, 200, 6], [150, 214, 5], [56, 214, 5], [124, 130, 5]].map(([x, y, r]) => `<path d="${star5(x, y, r)}" fill="#FFE27A"/>`).join('')
      : id === 'cape-gold' ? `${sparkle(70, 160, 9, '#FFF7DA')}${sparkle(150, 190, 8, '#FFF7DA')}` : '';
    return `${L(`<path d="M66 96 Q112 122 158 96 L184 106 Q196 170 210 236 Q194 246 174 238 Q158 250 140 242 Q126 252 112 244 Q98 252 84 242 Q66 250 50 238 Q30 246 14 236 Q28 170 40 106Z" fill="${c}"/>`)}
      <path d="M66 96 Q112 122 158 96 L162 104 Q112 132 62 104Z" fill="${hi}"/>
      <path d="M60 140 Q50 196 36 232 M164 140 Q174 196 188 232 M100 150 Q98 200 96 240 M126 150 Q128 200 130 240" stroke="${d}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".5"/>
      ${st}<path d="M80 106 Q112 120 144 106" stroke="#FFC93C" stroke-width="3" fill="none"/>${L(`<circle cx="80" cy="106" r="7" fill="#FFC93C"/><circle cx="144" cy="106" r="7" fill="#FFC93C"/>`)}`;
  };

  const pick = (o, k) => (o && o[k]) || null;
  ART.wearBack = (o) => {
    const c = pick(o, 'cape');
    return c && CAPE_C[c] ? cape(c) : '';
  };
  ART.wearFront = (o) => {
    const g = pick(o, 'glasses'), h = pick(o, 'hat');
    return (g && GL[g] ? GL[g]() : '') + (h && HAT[h] ? HAT[h]() : '');
  };

  /* ---- shop thumbnails ---- */
  const miniPopo = (col) => {
    const p = ART.POPO_COLORS[col] || ART.POPO_COLORS.teal;
    return `${L(`<rect x="82" y="200" width="20" height="46" rx="10" fill="${p.leg}"/><rect x="122" y="200" width="20" height="46" rx="10" fill="${p.leg}"/>`)}
      ${L(`<path d="M52 160 q-18 18 -8 36 M168 150 q28 -16 34 -52" stroke="${p.arm}" stroke-width="18" stroke-linecap="round" fill="none"/>`)}
      ${L(`<path d="M112 52 q-4 -16 4 -26" stroke="#3E8E5A" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M114 38 q-30 -26 -50 -6 q22 18 50 6z" fill="#8FCF7A"/><path d="M116 34 q22 -30 50 -14 q-18 26 -50 14z" fill="#2E9C8A"/>`)}
      ${L(`<circle cx="112" cy="140" r="76" fill="${p.body}"/>`)}
      <ellipse cx="88" cy="104" rx="34" ry="22" fill="#fff" opacity=".2"/>
      <ellipse cx="92" cy="128" rx="13" ry="15" fill="#fff"/><ellipse cx="136" cy="128" rx="13" ry="15" fill="#fff"/>
      <circle cx="95" cy="131" r="8" fill="#4a2c1d"/><circle cx="139" cy="131" r="8" fill="#4a2c1d"/>
      <path d="M96 158 q16 22 32 0z" fill="#5b2333"/>`;
  };
  const ICON_BOX = { hat: '34 -2 162 108', 'hat-cap': '34 -2 182 108', glasses: '28 94 166 64', cape: '6 84 212 172' };
  ART.wearIcon = (id) => {
    const item = ART.WARDROBE.find(w => w.id === id);
    if (!item) return wrap('');
    if (item.kind === 'color') {
      const p = ART.POPO_COLORS[id];
      return wrap(`<path d="M100 12 q48 -6 74 30 q28 40 10 90 q-16 50 -72 58 q-60 6 -86 -40 q-26 -48 2 -96 q24 -40 72 -42z" fill="${p.body}" opacity=".22"/>
        <svg x="22" y="18" width="156" height="170" viewBox="0 0 230 260">${miniPopo(id)}</svg>`);
    }
    const box = ICON_BOX[id] || ICON_BOX[item.kind];
    const inner = item.kind === 'hat' ? HAT[id]() : item.kind === 'glasses' ? GL[id]() : capeIcon(id);
    return wrap(`<svg x="8" y="8" width="184" height="184" viewBox="${box}" overflow="visible">${inner}</svg>`);
  };

  /* ================= Israeli money ================= */
  const COIN = {
    0.1: { r: 58, metal: 'bronze', val: '10', unit: 'אג׳' },
    0.5: { r: 66, metal: 'bronze', val: '½', unit: '₪' },
    1: { r: 72, metal: 'silver', val: '1', unit: '₪' },
    2: { r: 80, metal: 'silver', val: '2', unit: '₪' },
    5: { r: 88, metal: 'silver', val: '5', unit: '₪', sides: 12 },
    10: { r: 96, metal: 'bi', val: '10', unit: '₪' },
  };
  const METAL = {
    bronze: { rim: '#C98B2B', face: '#F4C55A', ring: '#E1A63C', text: '#87561A', shine: '#FFF0B8' },
    silver: { rim: '#98A2AE', face: '#E3E8EE', ring: '#C4CCD6', text: '#4B5563', shine: '#FFFFFF' },
  };
  const poly = (n, R, cx = 100, cy = 100) => Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return `${(cx + R * Math.cos(a)).toFixed(1)},${(cy + R * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

  const coin = (v) => {
    const c = COIN[v];
    const R = c.r;
    const outer = c.metal === 'bi' ? METAL.silver : METAL[c.metal];
    const inner = c.metal === 'bi' ? METAL.bronze : METAL[c.metal];
    const shape = (r, fill, extra = '') => c.sides
      ? `<polygon points="${poly(c.sides, r / Math.cos(Math.PI / c.sides) * .985)}" fill="${fill}" stroke="${fill}" stroke-width="${r * .08}" stroke-linejoin="round" ${extra}/>`
      : `<circle cx="100" cy="100" r="${r}" fill="${fill}" ${extra}/>`;
    const faceR = c.metal === 'bi' ? R * .66 : R - 7;
    const vs = c.val.length > 1 ? R * .78 : R * .98;  // value font size
    const valY = 100 + vs * .2;
    const unitS = R * .3;
    return wrap(`
      ${L(shape(R, outer.rim))}
      ${shape(R - 5, outer.face)}
      ${c.metal === 'bi' ? `<circle cx="100" cy="100" r="${R * .86}" fill="none" stroke="${outer.ring}" stroke-width="2.5" stroke-dasharray="1 7" stroke-linecap="round"/>
        <circle cx="100" cy="100" r="${faceR + 3}" fill="${inner.rim}"/><circle cx="100" cy="100" r="${faceR}" fill="${inner.face}"/>` : ''}
      <circle cx="100" cy="100" r="${faceR * .88}" fill="none" stroke="${inner.ring}" stroke-width="2.5" stroke-dasharray="1 6" stroke-linecap="round"/>
      <path d="M${100 - faceR * .78} ${100 - faceR * .2} A${faceR * .8} ${faceR * .8} 0 0 1 ${100 + faceR * .2} ${100 - faceR * .78}" fill="none" stroke="${inner.shine}" stroke-width="${R * .07}" stroke-linecap="round" opacity=".55"/>
      <text x="100" y="${valY - (c.unit ? unitS * .45 : 0)}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="${(c.metal === 'bi' ? vs * .82 : vs).toFixed(1)}" fill="${inner.text}">${c.val}</text>
      <text x="100" y="${valY + unitS * 1.05}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="${(c.metal === 'bi' ? unitS * .9 : unitS).toFixed(1)}" fill="${inner.text}" opacity=".85">${c.unit}</text>
      ${c.metal === 'bi' ? `<path d="M${100 - R * .9} ${100 - R * .3} A${R * .95} ${R * .95} 0 0 1 ${100 - R * .3} ${100 - R * .9}" fill="none" stroke="#fff" stroke-width="${R * .06}" stroke-linecap="round" opacity=".6"/>` : ''}
    `, '0 0 200 200', 'money-coin');
  };

  const NOTE = {
    20: { main: '#F49AA2', dark: '#B83A4A', light: '#FCD6DA', word: 'עשרים' },
    50: { main: '#8ACF94', dark: '#2C7A47', light: '#D6F0DA', word: 'חמישים' },
    100: { main: '#F8B068', dark: '#B5601A', light: '#FDE3C6', word: 'מאה' },
    200: { main: '#7DB2EE', dark: '#2756A4', light: '#D6E6F9', word: 'מאתיים' },
  };
  const emblem = (v, n) => {
    const d = n.dark, l = n.light;
    if (v === 20) return `${[0, 60, 120, 180, 240, 300].map(a => `<ellipse cx="0" cy="-20" rx="12" ry="18" fill="${l}" transform="rotate(${a})"/>`).join('')}<circle r="12" fill="#FFE27A"/><circle r="12" fill="none" stroke="${d}" stroke-width="2" opacity=".4"/>`;
    if (v === 50) return `<path d="M0 34 V-4" stroke="${d}" stroke-width="5" stroke-linecap="round"/><circle cx="0" cy="-14" r="24" fill="${l}"/><circle cx="-14" cy="0" r="14" fill="${l}"/><circle cx="14" cy="0" r="14" fill="${l}"/><circle cx="-8" cy="-20" r="7" fill="#fff" opacity=".5"/>`;
    if (v === 100) return `${Array.from({ length: 12 }, (_, i) => `<path d="M-4 -26 L0 -38 L4 -26z" fill="${l}" transform="rotate(${i * 30})"/>`).join('')}<circle r="22" fill="#FFE27A"/><circle r="22" fill="none" stroke="${d}" stroke-width="2" opacity=".35"/>`;
    return `<path d="M-30 6 q0 -36 30 -36 q30 0 30 36 q0 30 -30 30 q-30 0 -30 -30z" fill="${l}"/><path d="M-8 -30 l-4 -10 l8 4 l4 -8 l4 8 l8 -4 l-4 10z" fill="${l}"/><g fill="${d}" opacity=".35"><circle cx="-10" cy="4" r="4"/><circle cx="6" cy="0" r="4"/><circle cx="0" cy="16" r="4"/><circle cx="14" cy="14" r="4"/></g>`;
  };
  const note = (v) => {
    const n = NOTE[v];
    let waves = '';
    for (let i = 0; i < 4; i++) waves += `<path d="M20 ${60 + i * 26} q30 -14 60 0 t60 0 t60 0 t60 0 t60 0 t60 0" fill="none" stroke="${n.light}" stroke-width="2.5" opacity=".55"/>`;
    const big = String(v);
    const fs = big.length > 2 ? 66 : 86, numW = big.length * fs * .56;
    return wrap(`
      ${L(`<rect x="6" y="12" width="348" height="176" rx="16" fill="${n.main}"/>`)}
      ${waves}
      <rect x="18" y="24" width="324" height="152" rx="10" fill="none" stroke="${n.light}" stroke-width="3" stroke-dasharray="2 6" stroke-linecap="round"/>
      <circle cx="92" cy="100" r="58" fill="${n.light}" opacity=".45"/>
      <circle cx="92" cy="100" r="58" fill="none" stroke="${n.dark}" stroke-width="2" opacity=".25"/>
      <g transform="translate(92 100)">${emblem(v, n)}</g>
      <text x="${fs > 80 ? 248 : 244}" y="${fs > 80 ? 128 : 124}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="${fs}" fill="#FFFDF8" stroke="${n.dark}" stroke-width="4" paint-order="stroke">${big}</text>
      <text x="${(fs > 80 ? 248 : 244) + numW / 2 + 6}" y="${fs > 80 ? 126 : 122}" text-anchor="start" direction="ltr" font-family="Fredoka" font-weight="700" font-size="${fs * .42}" fill="${n.dark}">₪</text>
      <text x="252" y="160" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="21" fill="${n.dark}">${n.word} שקלים</text>
      <text x="322" y="48" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="18" fill="${n.dark}" opacity=".7">${big}</text>
      <text x="40" y="170" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="18" fill="${n.dark}" opacity=".7">${big}</text>
      <rect x="168" y="24" width="10" height="152" fill="${n.dark}" opacity=".18"/>
    `, '0 0 360 200', 'money-note');
  };

  ART.MONEY_VALUES = [0.1, 0.5, 1, 2, 5, 10, 20, 50, 100, 200];
  ART.money = (v) => (COIN[v] ? coin(v) : NOTE[v] ? note(v) : wrap(''));
})();
