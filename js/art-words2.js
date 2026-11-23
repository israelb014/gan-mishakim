/* More paper-cut drawings (200x200 viewBox). */
'use strict';
(() => {
  const { D, L } = ART;
  const eye = (x, y, r = 7) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#2b2350"/><circle cx="${x + r * .35}" cy="${y - r * .35}" r="${r * .35}" fill="#fff"/>`;
  const cheek = (x, y, r = 8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f49ab0" opacity=".6"/>`;

  const SKIN = '#f7cfae';
  const wheel = (x, y, r = 18) =>
    `${L(`<circle cx="${x}" cy="${y}" r="${r}" fill="#3b3330"/>`)}<circle cx="${x}" cy="${y}" r="${r * .42}" fill="#d9d2c8"/>`;
  const smile = (y = 116, w = 14) =>
    `<path d="M${100 - w} ${y} q${w} ${w * 1.15} ${w * 2} 0z" fill="#7a2b36"/><path d="M${100 - w * .6} ${y + 2.5} q${w * .6} ${w * .4} ${w * 1.2} 0" fill="#fff"/>`;
  const face = (y = 96, r = 6) => `${eye(84, y, r)}${eye(116, y, r)}${cheek(73, y + 17, 8)}${cheek(127, y + 17, 8)}${smile(y + 18)}`;
  const shoulders = (c, extra = '') => `${L(`<path d="M30 192 q6 -48 70 -48 q64 0 70 48z" fill="${c}"/>`)}${extra}
    <rect x="88" y="126" width="24" height="24" rx="10" fill="#f1c1a0"/>`;
  const head = (rx = 42, ry = 46, cy = 92) => L(`<ellipse cx="100" cy="${cy}" rx="${rx}" ry="${ry}" fill="${SKIN}"/>`);
  const ears = (y = 98, dx = 42) => L(`<ellipse cx="${100 - dx}" cy="${y}" rx="9" ry="12" fill="#f2c39f"/><ellipse cx="${100 + dx}" cy="${y}" rx="9" ry="12" fill="#f2c39f"/>`);

  // smooth closed blob through points (quadratic through midpoints)
  const blob = (pts) => {
    const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const m0 = mid(pts[n - 1], pts[0]);
    let d = `M${m0[0].toFixed(1)} ${m0[1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const m = mid(pts[i], pts[(i + 1) % n]);
      d += ` Q${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
    }
    return d + 'z';
  };
  const SPLAT_R = [72, 46, 64, 42, 78, 48, 60, 40, 74, 46, 66, 44, 76, 42, 62, 46];
  const splatPath = blob(SPLAT_R.map((r, i) => {
    const a = (i / SPLAT_R.length) * Math.PI * 2 - Math.PI / 2;
    return [100 + Math.cos(a) * r, 102 + Math.sin(a) * r];
  }));

  const BALLS = ['#e5534b', '#FF8A3D', '#FFC93C', '#6DBB5F', '#1FB5A8', '#4fa8e0', '#8E6CEF', '#f49ab0', '#e5534b', '#FF8A3D'];
  const ball = (x, y, r, c) => `${L(`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`)}
    <circle cx="${x - r * .38}" cy="${y - r * .4}" r="${r * .26}" fill="#fff" opacity=".45"/>
    ${eye(x - r * .3, y - r * .02, r * .15)}${eye(x + r * .3, y - r * .02, r * .15)}
    <path d="M${x - r * .25} ${y + r * .3} q${r * .25} ${r * .25} ${r * .5} 0" stroke="#2b2350" stroke-width="${Math.max(1.5, r * .09)}" fill="none" stroke-linecap="round"/>`;

  Object.assign(D, {
    /* ---------------- things ---------------- */
    umbrella: () => `
      ${L(`<path d="M100 100 v62 q0 20 -18 20 q-16 0 -16 -16" stroke="#8a5a36" stroke-width="9" fill="none" stroke-linecap="round"/>`)}
      ${L(`<path d="M22 108 Q22 30 100 30 Q178 30 178 108 q-19.5 -14 -39 0 q-19.5 -14 -39 0 q-19.5 -14 -39 0 q-19.5 -14 -39 0z" fill="#e5534b"/>`)}
      <path d="M100 30 Q66 48 61 108 q19.5 -14 39 0z M100 30 Q134 48 139 108 q19.5 -14 39 0 Q178 30 100 30z" fill="#ffc93c"/>
      <path d="M58 54 q14 -14 30 -18" stroke="#fff" stroke-width="6" opacity=".4" fill="none" stroke-linecap="round"/>
      ${L(`<circle cx="100" cy="26" r="7" fill="#8a5a36"/>`)}`,

    pencil: () => `<g transform="rotate(-38 100 100)">
      ${L(`<path d="M44 82 h100 l40 18 l-40 18 h-100z" fill="#ffc93c"/>`)}
      <path d="M144 82 l40 18 l-40 18z" fill="#f2c79a"/>
      <path d="M170 94 l14 6 l-14 6z" fill="#2b2350"/>
      <rect x="44" y="94" width="100" height="12" fill="#f5b82e"/>
      ${L(`<rect x="16" y="82" width="22" height="36" rx="9" fill="#f49ab0"/>`)}
      ${L(`<rect x="32" y="80" width="16" height="40" rx="2" fill="#b8c7d5"/>`)}
      <path d="M37 80 v40 M43 80 v40" stroke="#8ea2b5" stroke-width="2"/></g>`,

    bag: () => `
      ${L(`<path d="M76 46 q0 -26 24 -26 q24 0 24 26" stroke="#c0453e" stroke-width="10" fill="none" stroke-linecap="round"/>`)}
      ${L(`<rect x="40" y="40" width="120" height="142" rx="30" fill="#e5534b"/>`)}
      <path d="M40 92 q0 -52 60 -52 q60 0 60 52 q-60 16 -120 0z" fill="#c9433c"/>
      ${L(`<rect x="58" y="112" width="84" height="56" rx="16" fill="#4fa8e0"/>`)}
      <path d="M70 128 h60" stroke="#2f86c6" stroke-width="4" stroke-linecap="round"/>
      <rect x="92" y="80" width="16" height="26" rx="5" fill="#ffc93c"/>
      <path d="M100 144 l4 8 l9 1 l-7 6 l2 9 l-8 -5 l-8 5 l2 -9 l-7 -6 l9 -1z" fill="#ffc93c"/>`,

    glasses: () => `
      ${L(`<path d="M30 92 l-14 -26 M170 92 l14 -26" stroke="#5b3f9e" stroke-width="8" stroke-linecap="round"/>`)}
      <circle cx="62" cy="106" r="32" fill="#cfeaf9" opacity=".8"/><circle cx="138" cy="106" r="32" fill="#cfeaf9" opacity=".8"/>
      ${L(`<g fill="none" stroke="#8E6CEF" stroke-width="10"><circle cx="62" cy="106" r="34"/><circle cx="138" cy="106" r="34"/><path d="M94 100 q6 -10 12 0"/></g>`)}
      <path d="M44 96 q8 -14 22 -16 M120 96 q8 -14 22 -16" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>`,

    shirt: () => `
      ${L(`<path d="M72 30 q28 22 56 0 l48 24 l-18 38 l-22 -10 v96 q0 6 -6 6 h-60 q-6 0 -6 -6 v-96 l-22 10 l-18 -38z" fill="#4fa8e0"/>`)}
      <path d="M72 30 q28 22 56 0 l-6 -2 q-22 16 -44 0z" fill="#2f86c6"/>
      <path d="M78 30 q22 22 44 0" stroke="#2f86c6" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M24 92 l22 10 M176 92 l-22 10" stroke="#ffc93c" stroke-width="7" stroke-linecap="round"/>
      ${L(`<path d="M100 92 l8 16 l18 2 l-13 12 l4 18 l-17 -9 l-17 9 l4 -18 l-13 -12 l18 -2z" fill="#ffc93c"/>`)}`,

    sock: () => `
      ${L(`<path d="M66 40 h62 v78 l30 28 q18 18 2 34 q-16 16 -34 0 l-50 -46 q-10 -10 -10 -24z" fill="#8E6CEF"/>`)}
      <path d="M66 70 h62 v14 h-62z M66 98 h62 v14 h-62z" fill="#b79af5"/>
      <path d="M140 160 l18 -14 q18 18 2 34 q-16 16 -34 0z" fill="#ffc93c" opacity=".95"/>
      <path d="M66 112 h28 q0 24 -14 34 l-4 -4 q-10 -10 -10 -24z" fill="#ffc93c" opacity=".95"/>
      ${L(`<rect x="60" y="24" width="74" height="24" rx="8" fill="#f49ab0"/>`)}
      <path d="M72 30 v12 M84 30 v12 M96 30 v12 M108 30 v12 M120 30 v12" stroke="#e07a96" stroke-width="3" stroke-linecap="round"/>`,

    phone: () => `
      ${L(`<rect x="54" y="18" width="92" height="166" rx="18" fill="#2b2350"/>`)}
      <rect x="62" y="34" width="76" height="132" rx="6" fill="#cfeaf9"/>
      <rect x="86" y="24" width="28" height="5" rx="2.5" fill="#4a3f75"/>
      <rect x="86" y="172" width="28" height="5" rx="2.5" fill="#6b5fa0"/>
      <g>${[['#e5534b', 70, 44], ['#ffc93c', 92, 44], ['#6DBB5F', 114, 44],
             ['#8E6CEF', 70, 66], ['#FF8A3D', 92, 66], ['#4fa8e0', 114, 66],
             ['#f49ab0', 70, 88], ['#1FB5A8', 92, 88], ['#e5534b', 114, 88]]
        .map(([c, x, y]) => `<rect x="${x}" y="${y}" width="16" height="16" rx="5" fill="${c}"/>`).join('')}</g>
      <rect x="66" y="140" width="68" height="20" rx="8" fill="#fff" opacity=".8"/>
      <circle cx="78" cy="150" r="5" fill="#6DBB5F"/><circle cx="100" cy="150" r="5" fill="#4fa8e0"/><circle cx="122" cy="150" r="5" fill="#e5534b"/>`,

    gift: () => `
      ${L(`<path d="M100 66 q-40 -40 -50 -16 q-6 18 50 16z M100 66 q40 -40 50 -16 q6 18 -50 16z" fill="#ffc93c"/>`)}
      ${L(`<rect x="38" y="90" width="124" height="90" rx="8" fill="#e5534b"/>`)}
      ${L(`<rect x="28" y="66" width="144" height="32" rx="8" fill="#f06a5e"/>`)}
      <rect x="88" y="66" width="24" height="114" fill="#ffc93c"/>
      <rect x="38" y="98" width="124" height="6" fill="#c0453e" opacity=".4"/>
      ${L(`<circle cx="100" cy="64" r="11" fill="#f5b82e"/>`)}
      <circle cx="60" cy="130" r="6" fill="#fff" opacity=".5"/><circle cx="138" cy="150" r="6" fill="#fff" opacity=".5"/><circle cx="64" cy="160" r="4" fill="#fff" opacity=".5"/>`,

    drum: () => `
      ${L(`<path d="M118 70 l50 -50 M82 70 l-50 -50" stroke="#c9884f" stroke-width="7" stroke-linecap="round"/><circle cx="170" cy="18" r="9" fill="#f6efe2"/><circle cx="30" cy="18" r="9" fill="#f6efe2"/>`)}
      ${L(`<path d="M30 80 v74 q0 26 70 26 q70 0 70 -26 v-74z" fill="#e5534b"/>`)}
      <path d="M30 154 q0 26 70 26 q70 0 70 -26 v-12 q0 26 -70 26 q-70 0 -70 -26z" fill="#ffc93c"/>
      <path d="M40 96 l20 62 l20 -64 l20 70 l20 -70 l20 64 l20 -62" stroke="#fffaf0" stroke-width="4" fill="none" stroke-linejoin="round"/>
      ${L(`<ellipse cx="100" cy="80" rx="72" ry="24" fill="#ffc93c"/>`)}
      <ellipse cx="100" cy="79" rx="62" ry="18" fill="#fffaf0"/>`,

    kite: () => `
      <path d="M118 142 q-10 20 -36 14 q-24 -6 -36 14 q-8 14 -24 18" stroke="#8a6a5a" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${L(`<path d="M76 150 l-10 -10 l2 14z M88 156 l10 -8 l-2 14z" fill="#e5534b"/><path d="M46 170 l-12 -6 l6 12z M56 166 l8 -10 l2 14z" fill="#ffc93c"/>`)}
      ${L(`<path d="M120 18 l52 58 l-54 68 l-52 -74z" fill="#4fa8e0"/>`)}
      <path d="M120 18 l52 58 l-53 -4z" fill="#e5534b"/><path d="M66 70 l53 2 l-1 72z" fill="#ffc93c"/>
      <path d="M120 18 l-2 126 M66 70 l106 6" stroke="#2b2350" stroke-width="3" opacity=".35"/>
      ${eye(104, 82, 5)}${eye(134, 84, 5)}<path d="M110 98 q8 8 16 0" stroke="#2b2350" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,

    /* ---------------- nature ---------------- */
    leaf: () => `
      ${L(`<path d="M44 158 q-26 -32 -12 -76 q22 -58 140 -60 q2 112 -60 138 q-40 16 -68 -2z" fill="#6DBB5F"/>`)}
      ${L(`<path d="M46 156 q50 -60 112 -118 M48 156 l-22 26" stroke="#4f9e48" stroke-width="6" fill="none" stroke-linecap="round"/>`)}
      <path d="M76 124 q-10 -26 -6 -50 M98 102 q-4 -26 4 -48 M122 78 q2 -20 10 -32 M76 124 q30 4 50 -4 M98 102 q30 4 50 -6 M122 78 q20 2 36 -6" stroke="#4f9e48" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="66" cy="84" rx="8" ry="16" fill="#fff" opacity=".25" transform="rotate(30 66 84)"/>`,

    mountain: () => `
      ${L(`<path d="M150 46 q-16 0 -16 14 h40 q0 -14 -14 -14 q-4 -6 -10 0z" fill="#fffdf8"/>`)}
      ${L(`<path d="M66 176 l62 -124 l62 124z" fill="#a593e6"/>`)}
      <path d="M128 52 L113 82 l8 -6 l7 8 l7 -8 l8 6z" fill="#fffdf8"/>
      ${L(`<path d="M12 176 l68 -134 l72 134z" fill="#8E6CEF"/>`)}
      <path d="M80 42 L60 82 l10 -8 l9 10 l10 -10 l11 8z" fill="#fffdf8"/>
      <path d="M80 42 l-8 134 h-60z" fill="#7a58dc" opacity=".5"/>
      ${L(`<path d="M8 180 q40 -26 92 -14 q50 -14 92 14z" fill="#6DBB5F"/>`)}`,

    sea: () => {
      const wave = (y, c, ph = 0, amp = 12) => {
        let d = `M14 ${y}`;
        for (let x = 14 - ph; x < 186; x += 34) d += ` q8.5 ${-amp} 17 0 q8.5 ${amp * .6} 17 0`;
        return `<path d="${d} V176 q0 8 -8 8 H22 q-8 0 -8 -8z" fill="${c}"/>`;
      };
      return `
      ${L(`<g fill="#ffb238">${Array.from({ length: 10 }, (_, i) => `<path d="M146 20 l6 12 h-12z" transform="rotate(${i * 36} 146 54)"/>`).join('')}</g>`)}
      ${L(`<circle cx="146" cy="54" r="22" fill="#ffd54a"/>`)}
      <path d="M138 52 q4 -4 8 0 M150 52 q4 -4 8 0 M140 60 q8 8 16 0" stroke="#7a4f2e" stroke-width="3" fill="none" stroke-linecap="round" transform="translate(-2 0)"/>
      <path d="M36 58 q8 -8 16 0 q8 -8 16 0 M64 40 q6 -6 12 0 q6 -6 12 0" stroke="#2b2350" stroke-width="4" fill="none" stroke-linecap="round"/>
      ${L(wave(98, '#9fd8f2', 0))}
      ${L(wave(124, '#4fa8e0', 17))}
      ${L(wave(152, '#2f86c6', 6))}
      <path d="M30 120 q8 -8 16 -2 M98 118 q8 -8 16 -2 M150 146 q8 -8 16 -2 M60 148 q8 -8 16 -2" stroke="#fff" stroke-width="4" opacity=".7" fill="none" stroke-linecap="round"/>`;
    },

    rainbow: () => {
      const cols = ['#e5534b', '#FF8A3D', '#FFC93C', '#6DBB5F', '#4fa8e0', '#8E6CEF'];
      const arcs = cols.map((c, i) => { const r = 82 - i * 12; return `<path d="M${100 - r} 150 A${r} ${r} 0 0 1 ${100 + r} 150" stroke="${c}" stroke-width="12.5" fill="none"/>`; }).join('');
      const cloud = (x) => `<circle cx="${x - 18}" cy="156" r="16"/><circle cx="${x}" cy="146" r="22"/><circle cx="${x + 20}" cy="156" r="16"/><rect x="${x - 34}" y="152" width="70" height="22" rx="11"/>`;
      return `${L(arcs)}${L(`<g fill="#fffdf8">${cloud(30)}${cloud(170)}</g>`)}`;
    },

    fire: () => `
      ${L(`<rect x="30" y="152" width="140" height="22" rx="11" fill="#9c6a41" transform="rotate(14 100 163)"/><rect x="30" y="152" width="140" height="22" rx="11" fill="#8a5a36" transform="rotate(-14 100 163)"/>`)}
      <circle cx="35" cy="147" r="7" fill="#d8a878"/><circle cx="165" cy="147" r="7" fill="#d8a878"/>
      ${L(`<path d="M100 18 q34 38 46 70 q14 40 -12 66 h-68 q-26 -26 -12 -66 q8 -22 22 -32 q0 22 12 28 q-8 -40 12 -66z" fill="#e5534b"/>`)}
      <path d="M102 58 q22 30 28 52 q8 30 -14 44 h-34 q-20 -14 -12 -42 q4 -14 14 -22 q2 16 10 20 q-4 -30 8 -52z" fill="#ff8a3d"/>
      <path d="M100 100 q14 18 16 30 q2 18 -16 24 q-18 -6 -16 -24 q2 -12 16 -30z" fill="#ffd54a"/>`,

    /* ---------------- body ---------------- */
    hand: () => `
      ${L(`<g fill="${SKIN}">
        <rect x="56" y="92" width="94" height="86" rx="36"/>
        <rect x="56" y="44" width="25" height="84" rx="12.5"/>
        <rect x="82" y="26" width="25" height="96" rx="12.5"/>
        <rect x="108" y="32" width="25" height="90" rx="12.5"/>
        <rect x="132" y="54" width="22" height="76" rx="11"/>
        <rect x="52" y="92" width="26" height="72" rx="13" transform="rotate(-40 65 164)"/>
      </g>`)}
      <g fill="#fff" opacity=".55"><ellipse cx="68.5" cy="55" rx="7" ry="6"/><ellipse cx="94.5" cy="37" rx="7" ry="6"/><ellipse cx="120.5" cy="43" rx="7" ry="6"/><ellipse cx="143" cy="65" rx="6" ry="5"/><ellipse cx="25" cy="115" rx="6" ry="5" transform="rotate(-40 25 115)"/></g>
      <path d="M84 146 q20 10 42 -8" stroke="#e3a987" stroke-width="4" fill="none" stroke-linecap="round"/>
      ${L(`<rect x="62" y="166" width="80" height="22" rx="8" fill="#1FB5A8"/>`)}`,

    foot: () => `
      ${L(`<g fill="${SKIN}">
        <path d="M58 104 q0 -42 46 -42 q44 0 44 40 q0 30 -10 54 q-10 30 -36 30 q-30 0 -38 -32 q-6 -26 -6 -50z"/>
        <circle cx="72" cy="54" r="19"/><circle cx="103" cy="42" r="14"/><circle cx="128" cy="46" r="12.5"/><circle cx="147" cy="60" r="11"/><circle cx="159" cy="80" r="9.5"/>
      </g>`)}
      <g fill="#fff" opacity=".6"><ellipse cx="70" cy="49" rx="8" ry="7"/><ellipse cx="103" cy="38" rx="6" ry="5"/><ellipse cx="128" cy="42" rx="5" ry="4.5"/><ellipse cx="147" cy="57" rx="4.5" ry="4"/><ellipse cx="159" cy="77" rx="4" ry="3.5"/></g>
      <path d="M78 120 q8 -16 24 -18" stroke="#e3a987" stroke-width="4" fill="none" stroke-linecap="round"/>
      ${cheek(104, 158, 10)}`,

    eye: () => `
      ${L(`<path d="M52 44 q48 -26 96 0" stroke="#7a4f2e" stroke-width="10" fill="none" stroke-linecap="round"/>`)}
      <path d="M44 88 l-14 -14 M66 74 l-8 -18 M100 68 v-20 M134 74 l8 -18 M156 88 l14 -14" stroke="#2b2350" stroke-width="6" stroke-linecap="round"/>
      ${L(`<path d="M18 112 q82 -84 164 0 q-82 84 -164 0z" fill="#fff" stroke="#2b2350" stroke-width="6" stroke-linejoin="round"/>`)}
      <circle cx="100" cy="112" r="34" fill="#4fa8e0"/><circle cx="100" cy="112" r="24" fill="#2f86c6" opacity=".5"/>
      <circle cx="100" cy="112" r="16" fill="#2b2350"/>
      <circle cx="112" cy="100" r="9" fill="#fff"/><circle cx="90" cy="124" r="4" fill="#fff" opacity=".8"/>
      ${cheek(42, 150, 10)}${cheek(158, 150, 10)}`,

    ear: () => `
      ${L(`<path d="M70 64 q8 -46 56 -44 q48 4 48 60 q0 36 -28 56 q-16 12 -18 34 q-4 26 -32 22 q-26 -6 -24 -36 q2 -16 -6 -38 q-8 -28 4 -54z" fill="${SKIN}"/>`)}
      <path d="M88 70 q6 -32 40 -30 q32 4 30 40 q-2 24 -22 38" stroke="#e3a987" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M102 100 q16 -12 24 4 q4 14 -10 22" stroke="#e3a987" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M108 160 q-6 10 -16 8" stroke="#e3a987" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>
      ${cheek(96, 168, 7)}
      <path d="M36 80 q-10 20 0 40 M22 70 q-16 30 0 60" stroke="#8E6CEF" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>`,

    nose: () => `
      ${L(`<g fill="${SKIN}">
        <path d="M88 32 q12 -10 24 0 q8 50 20 84 l-64 0 q12 -34 20 -84z"/>
        <circle cx="100" cy="122" r="34"/><circle cx="62" cy="136" r="24"/><circle cx="138" cy="136" r="24"/>
      </g>`)}
      <path d="M50 124 q8 -6 18 -2 M150 124 q-8 -6 -18 -2" stroke="#e3a987" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="80" cy="150" rx="11" ry="7" fill="#9c5a4a" transform="rotate(-14 80 150)"/><ellipse cx="120" cy="150" rx="11" ry="7" fill="#9c5a4a" transform="rotate(14 120 150)"/>
      <ellipse cx="94" cy="108" rx="10" ry="14" fill="#fff" opacity=".55" transform="rotate(-20 94 108)"/>
      ${cheek(56, 132, 9)}${cheek(144, 132, 9)}`,

    mouth: () => `
      ${L(`<path d="M18 86 q34 -34 64 -22 q10 4 18 10 q8 -6 18 -10 q30 -12 64 22 q-12 82 -82 82 q-70 0 -82 -82z" fill="#e5534b"/>`)}
      <path d="M32 94 q68 16 136 0 q-16 56 -68 56 q-52 0 -68 -56z" fill="#5b2333"/>
      <path d="M38 96 q62 14 124 0 l-4 14 q-58 12 -116 0z" fill="#fff"/>
      <path d="M72 140 q4 -22 28 -20 q24 -2 28 20 q-28 14 -56 0z" fill="#f47c8f"/>
      <ellipse cx="62" cy="72" rx="12" ry="5" fill="#fff" opacity=".35" transform="rotate(-14 62 72)"/>
      <path d="M70 162 q30 8 60 0" stroke="#fff" stroke-width="6" opacity=".25" fill="none" stroke-linecap="round"/>`,

    tooth: () => `
      ${L(`<path d="M58 34 q22 -12 42 2 q20 -14 42 -2 q30 18 18 62 q-6 26 -12 56 q-4 24 -16 24 q-12 0 -14 -26 q-2 -20 -18 -20 q-16 0 -18 20 q-2 26 -14 26 q-12 0 -16 -24 q-6 -30 -12 -56 q-12 -44 18 -62z" fill="#fffdf8" stroke="#cfdbe6" stroke-width="5" stroke-linejoin="round"/>`)}
      <path d="M62 52 q8 -10 20 -10" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>
      ${eye(80, 88, 7)}${eye(120, 88, 7)}${cheek(68, 106, 8)}${cheek(132, 106, 8)}
      <path d="M88 106 q12 14 24 0z" fill="#7a2b36"/>
      ${L(`<path d="M168 24 l5 12 l12 5 l-12 5 l-5 12 l-5 -12 l-12 -5 l12 -5z" fill="#ffc93c"/><path d="M30 130 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3z" fill="#4fa8e0"/>`)}`,

    hair: () => `
      ${L(`<path d="M146 64 q38 -10 36 38 q-2 40 -20 70 q-6 10 -10 -2 q12 -40 2 -64 q-6 -18 -18 -24z" fill="#9c6a41"/>`)}
      ${L(`<ellipse cx="100" cy="102" rx="46" ry="52" fill="${SKIN}" opacity=".9"/>`)}
      ${L(`<path d="M48 120 q-14 -94 52 -94 q66 0 52 94 q-6 -36 -18 -50 q-32 2 -58 -22 q-6 30 -28 72z" fill="#9c6a41"/>`)}
      <path d="M72 50 q-12 14 -16 40 M100 34 q-10 10 -14 22 M124 42 q14 12 18 30" stroke="#7a4f2e" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M80 40 q14 -8 30 -6" stroke="#fff" stroke-width="5" opacity=".3" fill="none" stroke-linecap="round"/>
      ${L(`<ellipse cx="150" cy="66" rx="10" ry="14" fill="#f49ab0" transform="rotate(-30 150 66)"/>`)}`,

    /* ---------------- family ---------------- */
    mom: () => `
      ${L(`<path d="M54 98 q-10 -68 46 -68 q56 0 46 68 l10 68 q-22 10 -44 0 h-24 q-22 10 -44 0z" fill="#7a4a2a"/>`)}
      ${shoulders('#1FB5A8', `<path d="M84 150 q16 16 32 0" stroke="#ffc93c" stroke-width="5" fill="none" stroke-dasharray="1 7" stroke-linecap="round"/>`)}
      ${L(`<path d="M60 84 q-16 50 -10 92 q16 8 28 -4 q-8 -40 -4 -82z M140 84 q16 50 10 92 q-16 8 -28 -4 q8 -40 4 -82z" fill="#8a5a36"/>`)}
      ${head()}
      ${L(`<path d="M56 98 q-6 -62 46 -62 q46 2 42 60 q-26 -6 -40 -34 q-14 28 -48 36z" fill="#8a5a36"/>`)}
      ${eye(84, 98, 6)}${eye(116, 98, 6)}
      <path d="M76 92 l-4 -4 M124 92 l4 -4" stroke="#2b2350" stroke-width="2.5" stroke-linecap="round"/>
      ${cheek(73, 114, 8)}${cheek(127, 114, 8)}
      <path d="M86 116 q14 16 28 0z" fill="#c2405a"/><path d="M91 118.5 q9 5 18 0" fill="#fff"/>
      <circle cx="58" cy="114" r="4.5" fill="#ffc93c"/><circle cx="142" cy="114" r="4.5" fill="#ffc93c"/>`,

    dad: () => `
      ${shoulders('#4fa8e0', `<path d="M86 146 l14 18 l14 -18 l10 4 l-24 22 l-24 -22z" fill="#fff"/>`)}
      ${ears(98)}
      ${head()}
      ${L(`<path d="M58 96 q2 54 42 54 q40 0 42 -54 q-6 20 -16 24 q-14 -8 -26 -4 q-12 -4 -26 4 q-10 -4 -16 -24z" fill="#5a3a26"/>`)}
      <path d="M88 126 q12 10 24 0z" fill="#c2566a"/>
      ${L(`<path d="M58 88 q-6 -52 42 -52 q48 0 42 52 q-4 -16 -12 -22 q-30 8 -62 -4 q-8 10 -10 26z" fill="#5a3a26"/>`)}
      <path d="M76 86 q8 -5 16 0 M108 86 q8 -5 16 0" stroke="#5a3a26" stroke-width="4" fill="none" stroke-linecap="round"/>
      ${eye(84, 98, 6)}${eye(116, 98, 6)}`,

    baby: () => `
      ${L(`<path d="M44 192 q6 -42 56 -42 q50 0 56 42z" fill="#ffc93c"/>`)}
      <path d="M84 152 q16 12 32 0" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>
      ${L(`<ellipse cx="50" cy="104" rx="10" ry="12" fill="#f2c39f"/><ellipse cx="150" cy="104" rx="10" ry="12" fill="#f2c39f"/>`)}
      ${L(`<ellipse cx="100" cy="100" rx="52" ry="50" fill="${SKIN}"/>`)}
      <path d="M100 52 q-14 -16 2 -26 q14 -4 12 10 q-2 8 -8 6" stroke="#b5814f" stroke-width="6" fill="none" stroke-linecap="round"/>
      ${eye(80, 98, 8)}${eye(120, 98, 8)}
      ${cheek(66, 120, 11)}${cheek(134, 120, 11)}
      ${L(`<ellipse cx="100" cy="126" rx="20" ry="11" fill="#8fd0ef"/>`)}
      <circle cx="100" cy="138" r="9" fill="none" stroke="#f49ab0" stroke-width="5"/>
      <circle cx="100" cy="125" r="5" fill="#4fa8e0"/>`,

    grandma: () => `
      ${L(`<circle cx="100" cy="34" r="20" fill="#c9c9d4"/>`)}
      ${shoulders('#8E6CEF', `<path d="M74 146 l26 26 l26 -26" stroke="#b79af5" stroke-width="8" fill="none"/><g fill="#fffaf0"><circle cx="80" cy="152" r="4"/><circle cx="90" cy="160" r="4"/><circle cx="100" cy="163" r="4"/><circle cx="110" cy="160" r="4"/><circle cx="120" cy="152" r="4"/></g>`)}
      ${ears(100)}
      ${head()}
      ${L(`<path d="M56 100 q-8 -64 44 -64 q52 0 44 64 q-6 -26 -20 -36 q-24 10 -48 0 q-14 10 -20 36z" fill="#d6d6df"/>`)}
      <path d="M82 50 q18 -6 36 0" stroke="#b0b0bf" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${eye(84, 98, 5.5)}${eye(116, 98, 5.5)}
      <g fill="none" stroke="#c0453e" stroke-width="4"><circle cx="84" cy="98" r="13"/><circle cx="116" cy="98" r="13"/><path d="M97 97 h6 M71 96 l-12 -4 M129 96 l12 -4"/></g>
      ${cheek(72, 118, 8)}${cheek(128, 118, 8)}
      ${smile(118, 13)}
      <path d="M66 122 q2 6 6 8 M134 122 q-2 6 -6 8" stroke="#e3a987" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,

    grandpa: () => `
      ${shoulders('#6DBB5F', `<path d="M78 146 l22 30 l22 -30" fill="#4f9e48"/><path d="M84 146 l16 18 l16 -18" fill="#fff"/>`)}
      ${ears(100)}
      ${head()}
      <ellipse cx="88" cy="58" rx="16" ry="8" fill="#fff" opacity=".45" transform="rotate(-18 88 58)"/>
      ${L(`<path d="M58 112 q-8 -32 6 -50 q4 22 10 38z M142 112 q8 -32 -6 -50 q-4 22 -10 38z" fill="#d6d6df"/>`)}
      <path d="M74 84 q10 -8 20 -2 M106 82 q10 -6 20 2" stroke="#b8b8c6" stroke-width="6" fill="none" stroke-linecap="round"/>
      ${eye(84, 98, 6)}${eye(116, 98, 6)}
      ${cheek(72, 116, 8)}${cheek(128, 116, 8)}
      <path d="M90 124 q10 10 20 0z" fill="#7a2b36"/>
      ${L(`<path d="M74 122 q8 -14 26 -8 q18 -6 26 8 q-10 6 -26 0 q-16 6 -26 0z" fill="#e2e2ea"/>`)}
      <ellipse cx="100" cy="108" rx="7" ry="5" fill="#eebc98"/>`,

    brother: () => `
      ${shoulders('#FF8A3D', `<path d="M40 176 h120" stroke="#ffc93c" stroke-width="10"/>`)}
      ${ears(100)}
      ${head()}
      ${L(`<path d="M58 88 q-4 -26 16 -38 l2 -12 l12 8 l8 -14 l10 12 l12 -10 l5 14 l14 -4 l-4 14 q12 10 10 30 q-18 -20 -42 -20 q-26 0 -43 20z" fill="#8a5a36"/>`)}
      ${face(98, 6)}
      <g fill="#d9926a" opacity=".7"><circle cx="70" cy="108" r="1.8"/><circle cx="76" cy="111" r="1.8"/><circle cx="130" cy="108" r="1.8"/><circle cx="124" cy="111" r="1.8"/></g>`,

    sister: () => `
      ${L(`<path d="M58 68 q-30 -6 -36 26 q-4 26 10 44 q4 -28 26 -40z M142 68 q30 -6 36 26 q4 26 -10 44 q-4 -28 -26 -40z" fill="#b5814f"/>`)}
      ${shoulders('#f49ab0', `<circle cx="100" cy="172" r="7" fill="#fff" opacity=".7"/>`)}
      ${head()}
      ${L(`<path d="M56 100 q-8 -64 44 -64 q52 0 44 64 q-4 -18 -12 -26 q-14 12 -32 -4 q-20 18 -36 4 q-6 10 -8 26z" fill="#b5814f"/>`)}
      ${L(`<path d="M58 64 l-14 -12 v22z M58 64 l12 -14 l2 22z" fill="#8E6CEF"/><path d="M142 64 l14 -12 v22z M142 64 l-12 -14 l-2 22z" fill="#8E6CEF"/>`)}
      <circle cx="58" cy="64" r="5" fill="#b79af5"/><circle cx="142" cy="64" r="5" fill="#b79af5"/>
      ${face(98, 6.5)}`,

    /* ---------------- vehicles ---------------- */
    truck: () => `
      ${L(`<rect x="12" y="46" width="116" height="92" rx="10" fill="#FF8A3D"/>`)}
      <path d="M28 66 h84 M28 92 h84 M28 118 h84" stroke="#fff" stroke-width="6" opacity=".35" stroke-linecap="round"/>
      ${L(`<path d="M132 70 h28 q12 0 18 12 l12 26 v32 h-58z" fill="#4fa8e0"/>`)}
      <path d="M142 80 h16 q7 0 10 7 l9 21 h-35z" fill="#cfeaf9"/>
      <rect x="12" y="136" width="178" height="12" rx="5" fill="#3b3330"/>
      <rect x="180" y="118" width="10" height="9" rx="3" fill="#ffd54a"/>
      ${wheel(42, 150, 19)}${wheel(92, 150, 19)}${wheel(160, 150, 19)}`,

    helicopter: () => `
      ${L(`<path d="M74 98 l-56 -18 v16 l56 22z" fill="#e5534b"/>`)}
      ${L(`<circle cx="22" cy="82" r="14" fill="none" stroke="#3b3330" stroke-width="3"/><path d="M22 66 v32 M6 82 h32" stroke="#3b3330" stroke-width="5" stroke-linecap="round"/>`)}
      ${L(`<path d="M78 160 h88 q10 0 14 -10 M98 136 l-6 24 M150 136 l6 24" stroke="#3b3330" stroke-width="6" fill="none" stroke-linecap="round"/>`)}
      ${L(`<ellipse cx="116" cy="106" rx="58" ry="40" fill="#e5534b"/>`)}
      <path d="M124 70 q46 2 48 40 h-48z" fill="#cfeaf9"/>
      <path d="M134 80 q20 2 28 16" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>
      <rect x="84" y="92" width="26" height="24" rx="8" fill="#cfeaf9"/>
      <path d="M66 124 q50 22 104 0" stroke="#ffc93c" stroke-width="7" fill="none" stroke-linecap="round"/>
      ${L(`<rect x="110" y="52" width="12" height="18" rx="3" fill="#3b3330"/><rect x="36" y="44" width="160" height="10" rx="5" fill="#3b3330" transform="rotate(-3 116 49)"/>`)}`,

    ship: () => `
      <g fill="#e6ddcf"><circle cx="70" cy="28" r="9"/><circle cx="84" cy="22" r="11"/><circle cx="110" cy="26" r="8"/><circle cx="122" cy="18" r="10"/></g>
      ${L(`<rect x="66" y="34" width="22" height="40" rx="3" fill="#e5534b"/><rect x="104" y="34" width="22" height="40" rx="3" fill="#e5534b"/>`)}
      <rect x="66" y="34" width="22" height="9" fill="#2b2350"/><rect x="104" y="34" width="22" height="9" fill="#2b2350"/>
      ${L(`<rect x="56" y="66" width="88" height="20" rx="4" fill="#fffaf0"/><rect x="38" y="82" width="124" height="24" rx="4" fill="#fffaf0"/>`)}
      <g fill="#4fa8e0">${[50, 70, 90, 110, 130, 150].map((x) => `<rect x="${x - 6}" y="88" width="12" height="10" rx="3"/>`).join('')}${[70, 90, 110, 130].map((x) => `<rect x="${x - 5}" y="71" width="10" height="9" rx="3"/>`).join('')}</g>
      ${L(`<path d="M10 104 h180 l-24 56 h-132z" fill="#2f4d7a"/>`)}
      <path d="M22 132 h156 l-12 28 h-132z" fill="#e5534b"/>
      <g fill="#fffaf0">${[44, 72, 100, 128, 156].map((x) => `<circle cx="${x}" cy="118" r="5.5"/>`).join('')}</g>
      <path d="M8 176 q12 -10 24 0 q12 10 24 0 q12 -10 24 0 q12 10 24 0 q12 -10 24 0 q12 10 24 0 q12 -10 24 0 q8 7 16 4" stroke="#4fa8e0" stroke-width="7" fill="none" stroke-linecap="round"/>`,

    tractor: () => `
      ${L(`<path d="M150 96 v-40" stroke="#5a5560" stroke-width="9" stroke-linecap="round"/>`)}
      <circle cx="158" cy="40" r="8" fill="#e6ddcf"/><circle cx="170" cy="28" r="6" fill="#e6ddcf"/>
      ${L(`<path d="M36 40 h52 l8 56 h-60z" fill="#e5534b"/>`)}
      <path d="M46 52 h36 l5 38 h-41z" fill="#cfeaf9"/>
      ${L(`<path d="M28 96 h146 q10 0 10 10 v30 q0 8 -8 8 h-148z" fill="#6DBB5F"/>`)}
      <path d="M110 108 h60 M110 120 h60" stroke="#4f9e48" stroke-width="5" stroke-linecap="round"/>
      ${L(`<path d="M14 132 a46 46 0 0 1 92 0z" fill="#4f9e48"/>`)}
      ${L(`<circle cx="60" cy="142" r="40" fill="#3b3330"/>`)}
      <circle cx="60" cy="142" r="40" fill="none" stroke="#5a5560" stroke-width="8" stroke-dasharray="8 8"/>
      <circle cx="60" cy="142" r="20" fill="#ffc93c"/><circle cx="60" cy="142" r="7" fill="#e5a92e"/>
      ${L(`<circle cx="156" cy="158" r="24" fill="#3b3330"/>`)}
      <circle cx="156" cy="158" r="11" fill="#ffc93c"/>
      <rect x="176" y="104" width="10" height="10" rx="3" fill="#ffd54a"/>`,

    firetruck: () => `
      ${L(`<rect x="12" y="66" width="128" height="80" rx="8" fill="#e5534b"/>`)}
      ${L(`<path d="M140 80 h22 q12 0 18 12 l10 22 v32 h-50z" fill="#e5534b"/>`)}
      <path d="M148 90 h14 q6 0 9 6 l8 18 h-31z" fill="#cfeaf9"/>
      <rect x="12" y="114" width="178" height="10" fill="#fffaf0"/>
      <rect x="22" y="78" width="40" height="28" rx="4" fill="#c9433c"/><rect x="70" y="78" width="40" height="28" rx="4" fill="#c9433c"/>
      <circle cx="88" cy="92" r="9" fill="#ffc93c"/><circle cx="88" cy="92" r="4" fill="#c9433c"/>
      ${L(`<g stroke="#b8c7d5" stroke-width="6" stroke-linecap="round"><path d="M16 46 l122 -6 M18 62 l122 -6"/><path d="M30 46 v16 M50 45 v16 M70 44 v16 M90 43 v16 M110 42 v16 M130 41 v16"/></g>`)}
      ${L(`<path d="M154 80 v-10 q0 -12 10 -12 q10 0 10 12 v10z" fill="#4fa8e0"/>`)}
      <rect x="180" y="124" width="10" height="9" rx="3" fill="#ffd54a"/>
      <rect x="12" y="144" width="178" height="8" rx="3" fill="#3b3330"/>
      ${wheel(42, 152, 19)}${wheel(96, 152, 19)}${wheel(160, 152, 19)}`,

    /* ---------------- colours & numbers ---------------- */
    splat: (c = '#e5534b') => {
      const w = String(c).toLowerCase();
      const white = w === '#fff' || w === '#ffffff' || w === 'white';
      const st = white ? 'stroke="#cdbfa8" stroke-width="4"' : 'stroke="#2b2350" stroke-opacity=".12" stroke-width="3"';
      const dark = w === '#000' || w === '#000000' || w === 'black' || w === '#2b2350' || w === '#222' || w === '#333';
      return `
      ${L(`<g fill="${c}" ${st}>
        <path d="${splatPath}" stroke-linejoin="round"/>
        <circle cx="168" cy="44" r="10"/><circle cx="30" cy="62" r="7"/><circle cx="26" cy="152" r="11"/><circle cx="172" cy="160" r="8"/><circle cx="150" cy="186" r="5"/><circle cx="56" cy="22" r="5"/>
      </g>`)}
      <ellipse cx="78" cy="78" rx="18" ry="11" fill="#fff" opacity="${white ? .9 : dark ? .22 : .35}" transform="rotate(-30 78 78)"/>
      <circle cx="104" cy="66" r="5" fill="#fff" opacity="${white ? .9 : dark ? .22 : .35}"/>`;
    },

    count: (n = 3) => {
      n = Math.max(1, Math.min(10, Math.round(+n) || 1));
      let pos, r;
      if (n <= 6) {
        r = n === 1 ? 46 : n === 2 ? 36 : n === 3 ? 25 : n === 4 ? 28 : 23;
        pos = {
          1: [[100, 100]],
          2: [[60, 100], [140, 100]],
          3: [[48, 100], [100, 100], [152, 100]],
          4: [[64, 64], [136, 64], [64, 136], [136, 136]],
          5: [[54, 54], [146, 54], [100, 100], [54, 146], [146, 146]],
          6: [[54, 62], [100, 62], [146, 62], [54, 138], [100, 138], [146, 138]],
        }[n];
      } else {
        r = 17;
        const row = (k, y) => Array.from({ length: k }, (_, i) => [30 + i * 35, y]);
        pos = [...row(5, 78), ...row(n - 5, 122)];
      }
      return pos.map(([x, y], i) => ball(x, y, r, BALLS[i])).join('');
    },
  });
})();
