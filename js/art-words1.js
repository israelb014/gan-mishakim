/* More paper-cut drawings (200x200 viewBox). */
'use strict';
(() => {
  const { D, L } = ART;
  const eye = (x, y, r = 7) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#2b2350"/><circle cx="${x + r * .35}" cy="${y - r * .35}" r="${r * .35}" fill="#fff"/>`;
  const cheek = (x, y, r = 8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f49ab0" opacity=".6"/>`;
  const f = (n) => Math.round(n * 10) / 10;

  // Archimedean spiral path (snail shell)
  const spiral = (cx, cy, turns, a, b) => {
    const pts = [];
    const max = turns * Math.PI * 2;
    for (let t = 0; t <= max; t += 0.2) pts.push(`${f(cx + (a + b * t) * Math.cos(t))} ${f(cy + (a + b * t) * Math.sin(t))}`);
    return `M${pts.join(' L')}`;
  };

  // pointy star-ish shape (tomato calyx)
  const calyx = (cx, cy, n, ro, ri, sy) => {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / n;
      const r = i % 2 ? ri : ro;
      pts.push(`${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a) * sy)}`);
    }
    return `M${pts.join(' L')}Z`;
  };

  // diagonal waffle lines clipped to the ice-cream cone triangle
  const coneHatch = () => {
    const inside = (x, y) => y >= 108 && y <= 182 && x >= 64 + 0.4 * (y - 106) + 3 && x <= 136 - 0.4 * (y - 106) - 3;
    const segs = [];
    for (const s of [1, -1]) {
      for (let c = -120; c <= 120; c += 16) {
        let a = null, b = null;
        for (let x = 50; x <= 150; x += 0.5) {
          const y = 106 + s * (x - 100) + c;
          if (inside(x, y)) { if (!a) a = [x, y]; b = [x, y]; }
        }
        if (a && b && Math.hypot(b[0] - a[0], b[1] - a[1]) > 6) segs.push(`M${f(a[0])} ${f(a[1])} L${f(b[0])} ${f(b[1])}`);
      }
    }
    return segs.join(' ');
  };

  // corn kernels inside the cob outline
  const kernels = () => {
    let out = '';
    for (let row = 0, y = 32; y <= 150; y += 11, row++) {
      const hw = 30 * Math.sqrt(Math.max(0, 1 - ((y - 92) / 74) ** 2));
      for (let x = 100 - 44 + (row % 2) * 5.5; x <= 144; x += 11) {
        if (Math.abs(x - 100) + 5 < hw) out += `<ellipse cx="${f(x)}" cy="${y}" rx="4.6" ry="4.4"/>`;
      }
    }
    return out;
  };

  // pinwheel candy wedges
  const pinwheel = (cx, cy, r, n) => {
    let out = '';
    for (let i = 0; i < n; i++) {
      const a1 = (i * 2 * Math.PI) / n, a2 = ((i + 1) * 2 * Math.PI) / n;
      out += `<path d="M${cx} ${cy} L${f(cx + r * Math.cos(a1))} ${f(cy + r * Math.sin(a1))} A${r} ${r} 0 0 1 ${f(cx + r * Math.cos(a2))} ${f(cy + r * Math.sin(a2))}Z" fill="${i % 2 ? '#fffaf0' : '#e5534b'}"/>`;
    }
    return out;
  };

  Object.assign(D, {
    /* ---------------- Animals ---------------- */
    bear: () => `
      ${L(`<circle cx="56" cy="48" r="22" fill="#a8703f"/><circle cx="144" cy="48" r="22" fill="#a8703f"/>`)}
      <circle cx="56" cy="48" r="11" fill="#e8bf94"/><circle cx="144" cy="48" r="11" fill="#e8bf94"/>
      ${L(`<ellipse cx="100" cy="152" rx="54" ry="38" fill="#a8703f"/>`)}
      <ellipse cx="100" cy="158" rx="30" ry="24" fill="#e8bf94"/>
      ${L(`<ellipse cx="58" cy="178" rx="20" ry="12" fill="#93602f"/><ellipse cx="142" cy="178" rx="20" ry="12" fill="#93602f"/>`)}
      ${L(`<circle cx="100" cy="86" r="52" fill="#b97c45"/>`)}
      <ellipse cx="100" cy="108" rx="26" ry="19" fill="#f0d3ad"/>
      ${eye(80, 80, 6.5)}${eye(120, 80, 6.5)}
      <ellipse cx="100" cy="99" rx="10" ry="7" fill="#3b2418"/>
      <path d="M100 106 v6 m0 0 q-7 8 -14 2 m14 -2 q7 8 14 2" stroke="#3b2418" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${cheek(68, 102, 8)}${cheek(132, 102, 8)}`,

    snake: () => `
      ${L(`<path d="M30 162 q25 -40 55 -10 q30 30 55 -6 q16 -22 4 -48" stroke="#6DBB5F" stroke-width="28" fill="none" stroke-linecap="round"/>`)}
      <path d="M30 162 q25 -40 55 -10 q30 30 55 -6 q16 -22 4 -48" stroke="#ffd54a" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="1 20"/>
      <path d="M170 92 l16 2 l6 -6 m-6 6 l5 7" stroke="#e5534b" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${L(`<ellipse cx="146" cy="80" rx="30" ry="25" fill="#7cc66e"/>`)}
      ${eye(136, 74, 6)}${eye(158, 74, 6)}
      <path d="M140 90 q8 7 16 0" stroke="#2f6b2c" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      ${cheek(128, 88, 6)}${cheek(166, 88, 6)}`,

    sheep: () => `
      ${L(`<rect x="56" y="132" width="15" height="46" rx="7" fill="#4a3f3a"/><rect x="80" y="136" width="15" height="42" rx="7" fill="#4a3f3a"/>
           <rect x="108" y="136" width="15" height="42" rx="7" fill="#4a3f3a"/><rect x="130" y="132" width="15" height="46" rx="7" fill="#4a3f3a"/>`)}
      ${L(`<g fill="#fbf4e6">${[[52, 104, 24], [72, 82, 26], [102, 76, 28], [130, 86, 26], [146, 112, 24], [128, 136, 24], [98, 140, 26], [66, 132, 24], [96, 108, 40]]
        .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>`)}
      <circle cx="80" cy="96" r="10" fill="#fff" opacity=".8"/>
      ${L(`<ellipse cx="128" cy="86" rx="15" ry="7" fill="#4a3f3a" transform="rotate(-25 128 86)"/><ellipse cx="184" cy="86" rx="15" ry="7" fill="#4a3f3a" transform="rotate(25 184 86)"/>`)}
      ${L(`<ellipse cx="156" cy="98" rx="25" ry="30" fill="#4a3f3a"/>`)}
      ${L(`<g fill="#fffaf0"><circle cx="144" cy="72" r="11"/><circle cx="157" cy="66" r="12"/><circle cx="170" cy="73" r="11"/></g>`)}
      <circle cx="146" cy="94" r="7" fill="#fff"/><circle cx="166" cy="94" r="7" fill="#fff"/>
      ${eye(147, 95, 4.5)}${eye(167, 95, 4.5)}
      <path d="M150 112 q6 6 12 0" stroke="#f0c6c0" stroke-width="3" fill="none" stroke-linecap="round"/>`,

    chicken: () => `
      ${L(`<path d="M54 104 q-34 -20 -28 -62 q14 18 28 26 q-2 -30 16 -42 q4 30 14 52z" fill="#c9622a"/>`)}
      ${L(`<ellipse cx="100" cy="124" rx="60" ry="48" fill="#f0a85a"/>`)}
      ${L(`<path d="M70 114 q18 44 64 20 q-20 -34 -64 -20z" fill="#d98a3a"/>`)}
      ${L(`<circle cx="128" cy="42" r="10" fill="#e5534b"/><circle cx="142" cy="38" r="11" fill="#e5534b"/><circle cx="156" cy="44" r="10" fill="#e5534b"/>`)}
      ${L(`<circle cx="142" cy="72" r="29" fill="#f5b468"/>`)}
      ${L(`<path d="M166 66 l22 8 l-22 8z" fill="#ffc93c"/>`)}
      <ellipse cx="164" cy="92" rx="6" ry="10" fill="#e5534b"/>
      ${eye(148, 64, 5.5)}${cheek(150, 82, 6)}
      ${L(`<path d="M88 170 v14 m-9 0 h18 M114 170 v14 m-9 0 h18" stroke="#ff8a3d" stroke-width="6" stroke-linecap="round"/>`)}`,

    zebra: () => `
      ${L(`<path d="M42 96 q-18 14 -20 44" stroke="#eeebf3" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="22" cy="146" rx="6" ry="11" fill="#2b2350"/>`)}
      ${L(`<rect x="48" y="124" width="16" height="50" rx="7" fill="#e4e0ec"/><rect x="72" y="128" width="16" height="46" rx="7" fill="#e4e0ec"/>
           <rect x="106" y="128" width="16" height="46" rx="7" fill="#e4e0ec"/><rect x="128" y="124" width="16" height="50" rx="7" fill="#e4e0ec"/>`)}
      <path d="M48 146 h16 M72 148 h16 M106 148 h16 M128 146 h16 M48 158 h16 M72 160 h16 M106 160 h16 M128 158 h16" stroke="#2b2350" stroke-width="5"/>
      <path d="M48 170 h16 M72 170 h16 M106 170 h16 M128 170 h16" stroke="#2b2350" stroke-width="7"/>
      ${L(`<rect x="40" y="82" width="110" height="56" rx="26" fill="#eeebf3"/>`)}
      <path d="M62 88 q8 22 0 44 M84 84 q9 26 0 52 M106 84 q9 26 0 52 M128 88 q8 22 0 44" stroke="#2b2350" stroke-width="8" fill="none"/>
      ${L(`<path d="M132 34 l-10 6 l6 6 l-10 6 l6 6 l-10 6 l6 6 l-8 8 l6 6 l-6 10 l12 -2 q-4 -30 6 -58z" fill="#2b2350"/>`)}
      ${L(`<path d="M126 96 l14 -64 q30 -10 42 20 l8 36 q2 16 -14 16 q-12 0 -18 -12 l-6 -10 l-6 30z" fill="#eeebf3"/><path d="M146 26 l4 -16 l10 14z" fill="#eeebf3"/>`)}
      <path d="M131 72 l17 3 M128 86 l18 2 M135 56 l16 4 M152 40 l6 12 M166 38 l2 12" stroke="#2b2350" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="182" cy="90" rx="12" ry="11" fill="#3b3330"/>
      ${eye(164, 58, 5)}<circle cx="186" cy="88" r="2.5" fill="#fff"/>`,

    turtle: () => `
      ${L(`<path d="M28 140 l-14 8 l18 4z" fill="#8fcf7a"/>`)}
      ${L(`<ellipse cx="52" cy="156" rx="17" ry="13" fill="#8fcf7a"/><ellipse cx="132" cy="156" rx="17" ry="13" fill="#8fcf7a"/>`)}
      ${L(`<path d="M140 132 q6 -24 18 -28" stroke="#8fcf7a" stroke-width="22" fill="none" stroke-linecap="round"/><circle cx="164" cy="100" r="24" fill="#8fcf7a"/>`)}
      ${eye(158, 94, 5.5)}${eye(176, 94, 5.5)}
      <path d="M160 110 q8 7 16 0" stroke="#2f6b2c" stroke-width="3.5" fill="none" stroke-linecap="round"/>${cheek(154, 108, 5)}${cheek(182, 106, 5)}
      ${L(`<path d="M28 142 q4 -90 64 -90 q60 0 64 90z" fill="#4f9e48"/>`)}
      <g fill="#6DBB5F"><path d="M92 74 l18 10 v20 l-18 10 l-18 -10 v-20z"/><path d="M60 92 q10 -14 6 0 l6 10 v18 l-16 8 l-16 -6 q2 -18 20 -30z"/>
        <path d="M124 92 q-10 -14 -6 0 l-6 10 v18 l16 8 l16 -6 q-2 -18 -20 -30z"/><path d="M78 122 h28 l8 16 h-44z"/></g>
      ${L(`<rect x="22" y="134" width="140" height="14" rx="7" fill="#3e8a3a"/>`)}`,

    butterfly: () => `
      ${L(`<path d="M96 100 C70 36 18 22 24 62 C28 92 70 106 96 100z" fill="#8E6CEF"/><path d="M104 100 C130 36 182 22 176 62 C172 92 130 106 104 100z" fill="#8E6CEF"/>`)}
      ${L(`<path d="M96 106 C60 100 28 130 48 158 C66 176 92 142 96 106z" fill="#f49ab0"/><path d="M104 106 C140 100 172 130 152 158 C134 176 108 142 104 106z" fill="#f49ab0"/>`)}
      <g fill="#ffc93c"><circle cx="54" cy="64" r="12"/><circle cx="146" cy="64" r="12"/><circle cx="64" cy="140" r="8"/><circle cx="136" cy="140" r="8"/></g>
      <g fill="#fff" opacity=".7"><circle cx="78" cy="82" r="6"/><circle cx="122" cy="82" r="6"/></g>
      <path d="M95 54 q-8 -22 -24 -28 M105 54 q8 -22 24 -28" stroke="#3b2f6b" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="71" cy="26" r="5" fill="#3b2f6b"/><circle cx="129" cy="26" r="5" fill="#3b2f6b"/>
      ${L(`<rect x="91" y="66" width="18" height="96" rx="9" fill="#3b2f6b"/><circle cx="100" cy="60" r="14" fill="#3b2f6b"/>`)}
      <circle cx="94" cy="58" r="3.5" fill="#fff"/><circle cx="106" cy="58" r="3.5" fill="#fff"/>
      <path d="M95 66 q5 4 10 0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`,

    bee: () => `
      ${L(`<ellipse cx="102" cy="58" rx="20" ry="32" fill="#e8f5fc" stroke="#9fd4f0" stroke-width="3" transform="rotate(-22 102 58)"/>
           <ellipse cx="134" cy="62" rx="18" ry="28" fill="#e8f5fc" stroke="#9fd4f0" stroke-width="3" transform="rotate(24 134 62)"/>`)}
      ${L(`<path d="M166 112 l22 6 l-22 10z" fill="#2b2350"/>`)}
      ${L(`<ellipse cx="100" cy="120" rx="70" ry="50" fill="#ffc93c"/>`)}
      <path d="M92 71 h18 v98 h-18z M128 74 l16 6 v80 l-16 6z" fill="#2b2350"/>
      <path d="M60 78 q-8 -22 -22 -26 M76 74 q0 -24 10 -32" stroke="#2b2350" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="38" cy="52" r="5" fill="#2b2350"/><circle cx="86" cy="42" r="5" fill="#2b2350"/>
      ${eye(56, 110, 6.5)}${eye(80, 110, 6.5)}
      <path d="M58 128 q10 10 20 0" stroke="#7a4f2e" stroke-width="3.5" fill="none" stroke-linecap="round"/>${cheek(46, 126, 7)}${cheek(88, 126, 6)}`,

    mouse: () => `
      ${L(`<path d="M42 150 q-34 4 -30 -28 q6 -22 24 -10" stroke="#f49ab0" stroke-width="6" fill="none" stroke-linecap="round"/>`)}
      ${L(`<ellipse cx="92" cy="136" rx="56" ry="40" fill="#a8a4b8"/>`)}
      <ellipse cx="96" cy="148" rx="34" ry="22" fill="#c8c4d6"/>
      ${L(`<ellipse cx="70" cy="176" rx="15" ry="7" fill="#f49ab0"/><ellipse cx="116" cy="176" rx="15" ry="7" fill="#f49ab0"/>`)}
      ${L(`<circle cx="118" cy="56" r="26" fill="#a8a4b8"/><circle cx="170" cy="60" r="24" fill="#a8a4b8"/>`)}
      <circle cx="118" cy="56" r="16" fill="#f6b4c0"/><circle cx="170" cy="60" r="14" fill="#f6b4c0"/>
      ${L(`<circle cx="142" cy="96" r="34" fill="#b3afc2"/><ellipse cx="166" cy="106" rx="20" ry="14" fill="#b3afc2"/>`)}
      <circle cx="184" cy="105" r="7" fill="#e0788e"/>
      ${eye(134, 90, 6)}${eye(158, 88, 6)}${cheek(136, 110, 7)}
      <path d="M168 114 l22 -2 M168 119 l20 7 M164 112 l-2 0" stroke="#6b6070" stroke-width="2" stroke-linecap="round"/>
      <path d="M156 116 q6 6 12 0" stroke="#5a4a5e" stroke-width="3" fill="none" stroke-linecap="round"/>`,

    pig: () => `
      ${L(`<path d="M38 108 q-20 -2 -16 -18 q6 -10 12 0 q4 10 -8 10" stroke="#e57f99" stroke-width="5" fill="none" stroke-linecap="round"/>`)}
      ${L(`<rect x="54" y="130" width="18" height="44" rx="8" fill="#f08aa4"/><rect x="78" y="134" width="18" height="40" rx="8" fill="#f08aa4"/>
           <rect x="108" y="134" width="18" height="40" rx="8" fill="#f08aa4"/><rect x="130" y="130" width="18" height="44" rx="8" fill="#f08aa4"/>`)}
      <path d="M54 170 h18 M78 170 h18 M108 170 h18 M130 170 h18" stroke="#b85a72" stroke-width="6"/>
      ${L(`<ellipse cx="96" cy="116" rx="62" ry="42" fill="#f6a5b8"/>`)}
      ${L(`<path d="M120 60 l0 -30 l26 20z M180 60 l0 -30 l-26 20z" fill="#f08aa4" stroke="#f08aa4" stroke-width="6" stroke-linejoin="round"/>`)}
      ${L(`<circle cx="150" cy="84" r="38" fill="#f8b4c4"/>`)}
      ${L(`<ellipse cx="150" cy="100" rx="20" ry="14" fill="#f08aa4"/>`)}
      <ellipse cx="143" cy="100" rx="4" ry="5" fill="#b85a72"/><ellipse cx="157" cy="100" rx="4" ry="5" fill="#b85a72"/>
      ${eye(136, 76, 5.5)}${eye(164, 76, 5.5)}${cheek(124, 96, 7)}${cheek(176, 96, 7)}`,

    owl: () => `
      ${L(`<path d="M44 70 l6 -40 l30 22 h40 l30 -22 l6 40 q12 30 4 64 q-12 44 -60 44 q-48 0 -60 -44 q-8 -34 4 -64z" fill="#9c6a41"/>`)}
      <ellipse cx="100" cy="138" rx="34" ry="32" fill="#e9c39a"/>
      <path d="M84 126 l6 6 l6 -6 M104 126 l6 6 l6 -6 M94 144 l6 6 l6 -6 M80 148 l5 5 l5 -5 M110 148 l5 5 l5 -5" stroke="#c99b6b" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${L(`<path d="M46 96 q-16 40 8 72 q16 -30 -8 -72z M154 96 q16 40 -8 72 q-16 -30 8 -72z" fill="#7a4f2e"/>`)}
      <circle cx="76" cy="82" r="25" fill="#fffaf0"/><circle cx="124" cy="82" r="25" fill="#fffaf0"/>
      ${eye(78, 84, 12)}${eye(122, 84, 12)}
      ${L(`<path d="M91 100 l9 17 l9 -17z" fill="#ff8a3d" stroke="#ff8a3d" stroke-width="3" stroke-linejoin="round"/>`)}
      ${L(`<rect x="18" y="168" width="164" height="14" rx="7" fill="#7a4f2e"/>`)}
      ${L(`<path d="M76 164 v10 M84 164 v10 M92 164 v10 M108 164 v10 M116 164 v10 M124 164 v10" stroke="#ff8a3d" stroke-width="6" stroke-linecap="round"/>`)}`,

    snail: () => `
      <path d="M168 94 l-8 -30 M180 94 l10 -28" stroke="#f0b870" stroke-width="6" stroke-linecap="round"/>
      ${L(`<path d="M20 172 q2 -18 26 -20 h100 q0 -50 20 -62 q18 -6 20 14 q4 30 -2 68z" fill="#f6c98a"/>`)}
      ${L(`<circle cx="160" cy="62" r="9" fill="#f6c98a"/><circle cx="191" cy="64" r="9" fill="#f6c98a"/>`)}
      ${eye(160, 62, 5)}${eye(191, 64, 5)}
      <path d="M164 124 q8 8 16 0" stroke="#9c6a41" stroke-width="3.5" fill="none" stroke-linecap="round"/>${cheek(178, 134, 5)}
      ${L(`<circle cx="92" cy="106" r="52" fill="#FF8A3D"/>`)}
      <path d="${spiral(94, 108, 2.6, 3, 2.9)}" stroke="#c9622a" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="66" cy="78" rx="10" ry="16" fill="#fff" opacity=".3" transform="rotate(35 66 78)"/>`,

    crab: () => `
      ${L(`<path d="M58 130 l-32 4 l-8 18 M60 142 l-28 14 l-4 18 M70 152 l-20 20 l2 14 M142 130 l32 4 l8 18 M140 142 l28 14 l4 18 M130 152 l20 20 l-2 14" stroke="#d6453d" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`)}
      ${L(`<path d="M66 110 q-30 -6 -36 -34 M134 110 q30 -6 36 -34" stroke="#e5534b" stroke-width="11" fill="none" stroke-linecap="round"/>`)}
      ${L(`<path d="M24 88 q-20 -16 -10 -42 q10 -18 32 -12 l-10 18 l22 4 q0 26 -34 32z" fill="#e5534b"/><path d="M176 88 q20 -16 10 -42 q-10 -18 -32 -12 l10 18 l-22 4 q0 26 34 32z" fill="#e5534b"/>`)}
      <path d="M84 100 v-24 M116 100 v-24" stroke="#e5534b" stroke-width="7" stroke-linecap="round"/>
      ${L(`<ellipse cx="100" cy="130" rx="58" ry="40" fill="#ef6a5b"/>`)}
      ${L(`<circle cx="84" cy="70" r="12" fill="#fffaf0"/><circle cx="116" cy="70" r="12" fill="#fffaf0"/>`)}
      ${eye(85, 71, 7)}${eye(117, 71, 7)}
      <path d="M84 136 q16 14 32 0" stroke="#7a2b36" stroke-width="4" fill="none" stroke-linecap="round"/>
      ${cheek(66, 132, 8)}${cheek(134, 132, 8)}
      <circle cx="72" cy="112" r="5" fill="#fff" opacity=".35"/><circle cx="128" cy="112" r="4" fill="#fff" opacity=".35"/>`,

    /* ---------------- Food ---------------- */
    bread: () => `
      ${L(`<path d="M16 150 q-4 -76 68 -80 q72 4 68 80 q0 20 -18 20 h-100 q-18 0 -18 -20z" fill="#d9924a"/>`)}
      <g fill="#f5cf8e"><ellipse cx="52" cy="104" rx="6" ry="20" transform="rotate(30 52 104)"/><ellipse cx="84" cy="96" rx="6" ry="21" transform="rotate(30 84 96)"/><ellipse cx="116" cy="104" rx="6" ry="20" transform="rotate(30 116 104)"/></g>
      ${L(`<path d="M114 106 q-4 -36 34 -36 q38 0 34 36 q-2 10 -10 14 v56 h-48 v-56 q-8 -4 -10 -14z" fill="#c98242"/>`)}
      <path d="M124 106 q-2 -26 24 -26 q26 0 24 26 q-2 8 -8 10 v52 h-32 v-52 q-6 -2 -8 -10z" fill="#fbe3b4"/>
      <g fill="#e9c88e"><circle cx="138" cy="112" r="2.5"/><circle cx="156" cy="128" r="2.5"/><circle cx="142" cy="148" r="2.5"/><circle cx="158" cy="98" r="2.5"/></g>`,

    egg: () => `
      ${L(`<path d="M100 18 q-50 0 -54 80 q0 46 54 46 q54 0 54 -46 q-4 -80 -54 -80z" fill="#f7e2c0"/>`)}
      <ellipse cx="78" cy="62" rx="10" ry="20" fill="#fff" opacity=".6" transform="rotate(18 78 62)"/>
      ${L(`<path d="M50 116 h100 q0 42 -38 48 v8 h22 q8 0 8 8 v6 h-84 v-6 q0 -8 8 -8 h22 v-8 q-38 -6 -38 -48z" fill="#4fa8e0"/>`)}
      <g fill="#fff" opacity=".85"><circle cx="72" cy="130" r="5"/><circle cx="100" cy="138" r="5"/><circle cx="128" cy="130" r="5"/></g>`,

    milk: () => `
      ${L(`<path d="M146 72 l26 -12 v112 l-26 14z" fill="#cfdeea"/><path d="M146 72 l-12 -32 l24 -10 l14 30z" fill="#3d8fc4"/>`)}
      ${L(`<rect x="76" y="72" width="70" height="114" fill="#fffaf0"/><path d="M76 72 l12 -32 h46 l12 32z" fill="#4fa8e0"/>`)}
      ${L(`<rect x="86" y="26" width="50" height="10" rx="3" fill="#3d8fc4"/>`)}
      <path d="M76 132 q18 -10 35 0 q18 10 35 0 v40 h-70z" fill="#4fa8e0"/>
      <path d="M111 88 q-14 18 0 26 q14 -8 0 -26z" fill="#4fa8e0"/>
      ${L(`<path d="M20 110 h48 l-5 72 q0 6 -6 6 h-26 q-6 0 -6 -6z" fill="#d9eef9"/>`)}
      <path d="M24 126 q20 -6 40 0 l-3.6 52 q0 4 -4 4 h-24 q-4 0 -4 -4z" fill="#fffaf0"/>
      <path d="M30 136 v34" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"/>`,

    cheese: () => `
      ${L(`<path d="M16 120 L184 84 V150 Q184 156 178 157 L22 172 Q16 172 16 166 Z" fill="#ffc93c"/>`)}
      ${L(`<path d="M16 120 L146 52 Q152 49 157 53 L184 84 Z" fill="#ffe27a" stroke="#ffe27a" stroke-width="4" stroke-linejoin="round"/>`)}
      <g fill="#eaa92a"><ellipse cx="54" cy="142" rx="11" ry="9"/><ellipse cx="104" cy="124" rx="9" ry="7"/><ellipse cx="148" cy="130" rx="13" ry="10"/><ellipse cx="98" cy="154" rx="6" ry="5"/><ellipse cx="168" cy="108" rx="5" ry="4"/></g>
      <g fill="#f5c84a"><ellipse cx="120" cy="76" rx="8" ry="4"/><ellipse cx="88" cy="94" rx="6" ry="3"/><ellipse cx="148" cy="70" rx="5" ry="3"/></g>`,

    carrot: () => `
      ${L(`<path d="M140 56 q8 -38 28 -44 q-4 30 -20 50z M148 66 q28 -22 46 -10 q-22 20 -46 10z M134 56 q-18 -32 -8 -46 q14 22 12 48z" fill="#69b85f"/>`)}
      ${L(`<path d="M138 52 q28 6 26 32 l-110 96 q-14 10 -22 -2 l72 -112 q12 -18 34 -14z" fill="#ff8a3d"/>`)}
      <path d="M82 122 l14 8 M110 94 l14 8 M62 152 l10 6 M128 74 l10 6" stroke="#e06a22" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M126 64 q-10 6 -18 18" stroke="#fff" stroke-width="5" opacity=".35" fill="none" stroke-linecap="round"/>`,

    tomato: () => `
      ${L(`<path d="M100 54 q-40 -12 -64 14 q-26 30 -10 74 q20 42 74 42 q54 0 74 -42 q16 -44 -10 -74 q-24 -26 -64 -14z" fill="#e5534b"/>`)}
      <ellipse cx="62" cy="96" rx="11" ry="20" fill="#fff" opacity=".35" transform="rotate(25 62 96)"/>
      ${L(`<path d="${calyx(100, 58, 5, 30, 9, 0.6)}" fill="#4f9e48" stroke="#4f9e48" stroke-width="4" stroke-linejoin="round"/>`)}
      ${L(`<path d="M100 58 q-2 -18 8 -28" stroke="#3e8a3a" stroke-width="7" fill="none" stroke-linecap="round"/>`)}`,

    cucumber: () => `
      ${L(`<rect x="14" y="74" width="168" height="50" rx="25" fill="#4f9e48" transform="rotate(-30 98 99)"/>`)}
      <g transform="rotate(-30 98 99)">
        <path d="M40 88 h110 M44 110 h100" stroke="#6DBB5F" stroke-width="5" stroke-linecap="round"/>
        <g fill="#3a7f36"><circle cx="60" cy="98" r="2.5"/><circle cx="90" cy="96" r="2.5"/><circle cx="120" cy="100" r="2.5"/><circle cx="150" cy="98" r="2.5"/><circle cx="76" cy="116" r="2.5"/><circle cx="106" cy="80" r="2.5"/></g>
        <rect x="178" y="94" width="10" height="10" rx="3" fill="#7a5a2e"/>
      </g>
      ${L(`<circle cx="148" cy="148" r="32" fill="#3e8a3a"/>`)}
      <circle cx="148" cy="148" r="26" fill="#cfeab0"/>
      <circle cx="148" cy="148" r="15" fill="#b5dc94"/>
      <g fill="#fffaf0">${[0, 60, 120, 180, 240, 300].map((a) => `<ellipse cx="148" cy="139" rx="2.5" ry="4" transform="rotate(${a} 148 148)"/>`).join('')}</g>`,

    corn: () => `
      ${L(`<path d="M100 18 q32 0 32 72 q0 70 -32 92 q-32 -22 -32 -92 q0 -72 32 -72z" fill="#f5be2e"/>`)}
      <g fill="#ffe27a">${kernels()}</g>
      ${L(`<path d="M100 186 q-58 -8 -66 -100 q32 34 52 74z" fill="#69b85f"/>`)}
      ${L(`<path d="M100 186 q58 -8 66 -96 q-32 32 -50 70z" fill="#4f9e48"/>`)}
      <path d="M92 178 q-30 -20 -42 -64 M108 178 q30 -20 44 -60" stroke="#8fcf7a" stroke-width="3" fill="none" stroke-linecap="round"/>`,

    icecream: () => `
      ${L(`<path d="M64 106 L136 106 L104 186 Q100 192 96 186 Z" fill="#e0a76d"/>`)}
      <path d="${coneHatch()}" stroke="#c4884c" stroke-width="3.5" stroke-linecap="round"/>
      ${L(`<path d="M56 106 q-6 -54 44 -56 q50 2 44 56 q-7 9 -14 0 q-7 13 -15 2 q-8 13 -16 0 q-8 13 -15 0 q-8 11 -14 -2 q-7 9 -14 0z" fill="#f49ab0"/>`)}
      ${L(`<path d="M68 66 q-2 -42 32 -42 q34 0 32 42 q-6 7 -12 0 q-8 11 -19 1 q-10 10 -19 -1 q-6 7 -14 0z" fill="#9fe0cf"/>`)}
      ${L(`<path d="M100 20 q4 -10 14 -12" stroke="#4f9e48" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="100" cy="26" r="10" fill="#e5534b"/>`)}
      <circle cx="96" cy="23" r="3" fill="#fff" opacity=".6"/>
      <g stroke-width="4" stroke-linecap="round"><path d="M72 80 l6 -3" stroke="#ffc93c"/><path d="M118 88 l5 4" stroke="#4fa8e0"/><path d="M96 94 l-2 5" stroke="#fff"/><path d="M130 76 l4 -3" stroke="#8E6CEF"/></g>`,

    pizza: () => `
      ${L(`<path d="M30 54 q70 -30 140 0 l-62 126 q-8 10 -16 0z" fill="#ffd54a"/>`)}
      <path d="M44 72 q-2 14 6 22 M150 70 q2 16 -6 26 M80 140 q-2 10 4 16" stroke="#f5b82e" stroke-width="6" fill="none" stroke-linecap="round"/>
      ${L(`<path d="M22 58 q78 -38 156 0 l-7 16 q-71 -32 -142 0z" fill="#d9924a"/>`)}
      ${L(`<g fill="#e5534b"><circle cx="78" cy="88" r="13"/><circle cx="124" cy="92" r="13"/><circle cx="100" cy="126" r="12"/><circle cx="100" cy="160" r="7"/></g>`)}
      <g fill="#c9413a" opacity=".6"><circle cx="74" cy="86" r="2.5"/><circle cx="82" cy="92" r="2"/><circle cx="120" cy="90" r="2.5"/><circle cx="128" cy="96" r="2"/><circle cx="98" cy="124" r="2.5"/></g>
      <g fill="#69b85f"><path d="M58 98 q6 -6 12 0 q-6 4 -12 0z"/><path d="M136 116 q6 -6 12 0 q-6 4 -12 0z"/><path d="M88 108 q6 -6 12 0 q-6 4 -12 0z"/></g>`,

    lemon: () => `
      ${L(`<path d="M142 54 q18 -32 46 -28 q-12 28 -46 28z" fill="#69b85f"/>`)}
      ${L(`<path d="M20 112 q2 -8 12 -10 q22 -50 70 -50 q48 0 70 46 q10 4 10 13 q-2 8 -12 9 q-20 46 -68 46 q-50 0 -70 -42 q-12 -3 -12 -12z" fill="#ffdd3c"/>`)}
      <ellipse cx="70" cy="86" rx="22" ry="9" fill="#fff" opacity=".4" transform="rotate(-25 70 86)"/>
      <g fill="#f0c020" opacity=".7"><circle cx="110" cy="96" r="2.5"/><circle cx="136" cy="118" r="2.5"/><circle cx="92" cy="132" r="2.5"/><circle cx="62" cy="118" r="2.5"/><circle cx="124" cy="146" r="2.5"/></g>`,

    candy: () => `
      ${L(`<path d="M64 100 l-48 -34 q-8 34 0 68z M136 100 l48 -34 q8 34 0 68z" fill="#b79af5" stroke="#b79af5" stroke-width="6" stroke-linejoin="round"/>`)}
      <path d="M22 80 l26 16 M20 120 l28 -14 M178 80 l-26 16 M180 120 l-28 -14" stroke="#8E6CEF" stroke-width="4" stroke-linecap="round"/>
      ${L(`<circle cx="100" cy="100" r="46" fill="#e5534b"/>`)}
      ${pinwheel(100, 100, 42, 8)}
      <circle cx="100" cy="100" r="9" fill="#e5534b"/>
      <ellipse cx="80" cy="76" rx="12" ry="7" fill="#fff" opacity=".45" transform="rotate(-35 80 76)"/>`,

    /* ---------------- Home objects ---------------- */
    key: () => `
      ${L(`<g transform="rotate(-28 100 100)">
        <path d="M14 100 a36 36 0 1 0 72 0 a36 36 0 1 0 -72 0z M36 100 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0z" fill="#ffc93c" fill-rule="evenodd"/>
        <rect x="80" y="91" width="106" height="18" rx="6" fill="#ffc93c"/>
        <path d="M146 106 h14 v22 q0 4 -4 4 h-6 q-4 0 -4 -4z M166 106 h16 v30 q0 4 -4 4 h-8 q-4 0 -4 -4z" fill="#ffc93c"/>
      </g>`)}
      <g transform="rotate(-28 100 100)">
        <path d="M24 88 a28 28 0 0 1 22 -20" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>
        <path d="M94 96 h80" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".5"/>
        <circle cx="50" cy="100" r="16" fill="none" stroke="#e8a92a" stroke-width="4"/>
      </g>`,

    door: () => `
      ${L(`<rect x="38" y="12" width="124" height="178" rx="10" fill="#8a5a36"/>`)}
      ${L(`<rect x="50" y="24" width="100" height="166" rx="4" fill="#c9884f"/>`)}
      <path d="M64 92 v-36 a36 36 0 0 1 72 0 v36z" fill="#9fd4f0"/>
      <path d="M100 30 v62 M64 64 h72" stroke="#c9884f" stroke-width="5"/>
      <rect x="64" y="108" width="72" height="66" rx="6" fill="#b5743f"/>
      <rect x="72" y="116" width="56" height="50" rx="4" fill="#c9884f"/>
      ${L(`<circle cx="136" cy="104" r="9" fill="#ffc93c"/>`)}
      <circle cx="133" cy="101" r="3" fill="#fff" opacity=".6"/>`,

    bed: () => `
      ${L(`<rect x="26" y="150" width="12" height="32" rx="4" fill="#7a4f2e"/><rect x="162" y="150" width="12" height="32" rx="4" fill="#7a4f2e"/>`)}
      ${L(`<rect x="16" y="52" width="28" height="122" rx="12" fill="#9c6a41"/><rect x="160" y="94" width="24" height="80" rx="10" fill="#9c6a41"/>`)}
      ${L(`<rect x="26" y="134" width="148" height="22" rx="6" fill="#b5743f"/>`)}
      ${L(`<rect x="38" y="114" width="126" height="24" rx="8" fill="#fffaf0"/>`)}
      ${L(`<ellipse cx="66" cy="104" rx="26" ry="14" fill="#efe9fb"/>`)}
      ${L(`<path d="M86 102 h76 q4 0 4 4 v38 h-80 q-10 0 -10 -10 v-22 q0 -10 10 -10z" fill="#4fa8e0"/>`)}
      <path d="M86 102 h14 v42 h-14 q-10 0 -10 -10 v-22 q0 -10 10 -10z" fill="#9fd4f0"/>
      <g fill="#ffc93c"><circle cx="118" cy="116" r="4"/><circle cx="142" cy="116" r="4"/><circle cx="130" cy="132" r="4"/><circle cx="154" cy="132" r="4"/><circle cx="110" cy="134" r="3"/></g>
      <circle cx="30" cy="66" r="5" fill="#ffc93c"/>`,

    table: () => `
      ${L(`<rect x="44" y="92" width="12" height="70" rx="4" fill="#8a5a36"/><rect x="144" y="92" width="12" height="70" rx="4" fill="#8a5a36"/>`)}
      ${L(`<rect x="20" y="96" width="16" height="88" rx="5" fill="#a8683a"/><rect x="164" y="96" width="16" height="88" rx="5" fill="#a8683a"/>`)}
      ${L(`<path d="M36 64 h128 l26 24 h-180z" fill="#e0a76d" stroke="#e0a76d" stroke-width="4" stroke-linejoin="round"/>`)}
      ${L(`<rect x="8" y="86" width="184" height="16" rx="5" fill="#c9884f"/>`)}
      <path d="M50 74 h60 M120 74 h20" stroke="#efc08e" stroke-width="3.5" stroke-linecap="round"/>`,

    lamp: () => `
      ${L(`<ellipse cx="100" cy="178" rx="46" ry="11" fill="#8E6CEF"/><rect x="93" y="96" width="14" height="82" rx="5" fill="#9c6a41"/>`)}
      <path d="M124 104 v28" stroke="#9c6a41" stroke-width="2.5"/>
      ${L(`<circle cx="124" cy="134" r="4" fill="#ffc93c"/>`)}
      ${L(`<path d="M64 26 h72 l28 78 h-128z" fill="#ffc93c" stroke="#ffc93c" stroke-width="6" stroke-linejoin="round"/>`)}
      <path d="M36 98 h128 v6 h-128z" fill="#ff8a3d"/>
      <path d="M78 36 l-12 54" stroke="#fff" stroke-width="6" opacity=".45" stroke-linecap="round"/>`,

    spoon: () => `
      ${L(`<g transform="rotate(32 100 100)">
        <path d="M94 88 q-2 42 -7 90 q0 12 13 12 q13 0 13 -12 q-5 -48 -7 -90z" fill="#a9bccd"/>
        <ellipse cx="100" cy="52" rx="30" ry="40" fill="#b8c7d5"/>
      </g>`)}
      <g transform="rotate(32 100 100)">
        <ellipse cx="100" cy="56" rx="21" ry="30" fill="#dfe7ef"/>
        <ellipse cx="92" cy="44" rx="6" ry="12" fill="#fff" opacity=".8"/>
        <path d="M100 120 v56" stroke="#fff" stroke-width="4" opacity=".5" stroke-linecap="round"/>
      </g>`,

    fork: () => `
      ${L(`<path transform="rotate(-32 100 100)" d="M75 20 q0 -6 4 -6 q4 0 4 6 v40 h6 v-40 q0 -6 4 -6 q4 0 4 6 v40 h6 v-40 q0 -6 4 -6 q4 0 4 6 v40 h6 v-40 q0 -6 4 -6 q4 0 4 6 v52 q0 22 -18 28 v80 q0 8 -7 8 q-7 0 -7 -8 v-80 q-18 -6 -18 -28z" fill="#b8c7d5"/>`)}
      <path transform="rotate(-32 100 100)" d="M100 112 v62" stroke="#fff" stroke-width="4" opacity=".5" stroke-linecap="round"/>`,
  });
})();
