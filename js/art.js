/* Hand-made paper-cut SVG art. Every drawing uses a 200x200 viewBox unless noted.
   Layers get the soft "paper" shadow filter (#pl) defined once in index.html. */
'use strict';

const ART = (() => {
  const L = (inner) => `<g filter="url(#pl)">${inner}</g>`; // one paper layer
  const wrap = (inner, vb = '0 0 200 200', cls = '') =>
    `<svg class="art ${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;

  const eye = (x, y, r = 7) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#2b2350"/><circle cx="${x + r * .35}" cy="${y - r * .35}" r="${r * .35}" fill="#fff"/>`;
  const cheek = (x, y, r = 8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f49ab0" opacity=".6"/>`;

  /* ---------------- Popo the mascot (viewBox 0 0 220 260) ---------------- */
  function popo(mood = 'happy') {
    const sleep = mood === 'sleep';
    const armR = mood === 'point'
      ? `<path d="M168 140 q30 -10 46 -24" stroke="#1FA89C" stroke-width="18" stroke-linecap="round" fill="none"/>`
      : sleep ? `<path d="M170 160 q14 18 4 34" stroke="#1FA89C" stroke-width="18" stroke-linecap="round" fill="none"/>`
      : `<path d="M168 150 q28 -16 34 -52" stroke="#1FA89C" stroke-width="18" stroke-linecap="round" fill="none"/>`;
    const armL = mood === 'glasses'
      ? `<path d="M52 158 q-18 14 -10 34" stroke="#1FA89C" stroke-width="18" stroke-linecap="round" fill="none"/>`
      : `<path d="M52 160 q-18 18 -8 36" stroke="#1FA89C" stroke-width="18" stroke-linecap="round" fill="none"/>`;
    const eyes = sleep
      ? `<path d="M80 132 q12 10 24 0 M122 132 q12 10 24 0" stroke="#2b2350" stroke-width="5" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="92" cy="128" rx="15" ry="17" fill="#fff"/><ellipse cx="136" cy="128" rx="15" ry="17" fill="#fff"/>
         <circle cx="95" cy="131" r="9" fill="#4a2c1d"/><circle cx="139" cy="131" r="9" fill="#4a2c1d"/>
         <circle cx="98" cy="127" r="3.5" fill="#fff"/><circle cx="142" cy="127" r="3.5" fill="#fff"/>`;
    const mouth = sleep
      ? `<ellipse cx="114" cy="166" rx="7" ry="5" fill="#2b2350" opacity=".75"/>`
      : `<path d="M94 156 q20 30 40 0 z" fill="#5b2333"/><path d="M104 168 q10 9 20 0 q-10 -6 -20 0z" fill="#f47c8f"/>`;
    const glasses = mood === 'glasses'
      ? `<g fill="none" stroke="#3b2b20" stroke-width="5"><circle cx="92" cy="129" r="20"/><circle cx="136" cy="129" r="20"/><path d="M112 128 h4"/></g>
         <g filter="url(#pl)"><rect x="150" y="150" width="58" height="72" rx="6" fill="#b98552" transform="rotate(12 179 186)"/>
         <rect x="158" y="160" width="44" height="56" rx="3" fill="#fffaf0" transform="rotate(12 179 186)"/>
         <path d="M166 176 h28 M164 188 h28 M162 200 h22" stroke="#c9b9a4" stroke-width="4" transform="rotate(12 179 186)"/></g>` : '';
    const zzz = sleep
      ? `<g fill="#8E6CEF" font-family="Fredoka" font-weight="700"><text x="168" y="70" font-size="30">z</text><text x="186" y="44" font-size="22">z</text><text x="200" y="24" font-size="16">z</text></g>` : '';
    return wrap(`
      <ellipse cx="112" cy="250" rx="62" ry="8" fill="#5a3e1b" opacity=".12"/>
      ${L(`<rect x="82" y="200" width="20" height="48" rx="10" fill="#1A9D92"/><rect x="122" y="200" width="20" height="48" rx="10" fill="#1A9D92"/>
           <ellipse cx="90" cy="246" rx="16" ry="8" fill="#1A9D92"/><ellipse cx="134" cy="246" rx="16" ry="8" fill="#1A9D92"/>`)}
      ${L(armL + armR)}
      ${L(`<path d="M112 52 q-4 -16 4 -26" stroke="#3E8E5A" stroke-width="5" fill="none" stroke-linecap="round"/>
           <path d="M114 38 q-30 -26 -50 -6 q22 18 50 6z" fill="#8FCF7A"/><path d="M116 34 q22 -30 50 -14 q-18 26 -50 14z" fill="#2E9C8A"/>`)}
      ${L(`<circle cx="112" cy="140" r="76" fill="#3CC2B4"/>`)}
      <ellipse cx="88" cy="104" rx="34" ry="22" fill="#fff" opacity=".18"/>
      ${eyes}<circle cx="74" cy="156" r="10" fill="#FF8FA8" opacity=".75"/><circle cx="154" cy="156" r="10" fill="#FF8FA8" opacity=".75"/>${mouth}${glasses}${zzz}
    `, '0 0 230 260', 'popo-svg');
  }

  /* ---------------- Avatars ---------------- */
  function avatar(who) {
    if (who === 'hodaya') return wrap(`
      <circle cx="100" cy="100" r="98" fill="#7E5BDB"/>
      ${L(`<path d="M30 132 q-6 -100 70 -104 q76 4 70 104 l-6 30 h-128z" fill="#8a5a36"/>`)}
      ${L(`<path d="M28 200 q8 -46 72 -46 q64 0 72 46z" fill="#B79AF5"/>`)}
      <rect x="86" y="136" width="28" height="24" rx="10" fill="#f1c1a0"/>
      ${L(`<ellipse cx="100" cy="102" rx="50" ry="54" fill="#f7cfae"/>`)}
      ${L(`<path d="M50 104 q-2 -62 54 -62 q48 4 48 58 q-34 -6 -52 -34 q-14 30 -50 38z" fill="#9c6a41"/>`)}
      <path d="M74 104 q9 -9 18 0 M108 104 q9 -9 18 0" stroke="#3b2418" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      ${cheek(70, 120, 9)}${cheek(130, 120, 9)}
      <path d="M84 126 q16 18 32 0z" fill="#7a2b36"/><path d="M90 130 q10 6 20 0" fill="#fff"/>
    `, '0 0 200 200', 'avatar');
    return wrap(`
      <circle cx="100" cy="100" r="98" fill="#F07A2E"/>
      ${L(`<path d="M28 200 q8 -46 72 -46 q64 0 72 46z" fill="#FFA45E"/>`)}
      <rect x="86" y="136" width="28" height="24" rx="10" fill="#f1c1a0"/>
      ${L(`<ellipse cx="48" cy="108" rx="10" ry="13" fill="#f2c39f"/><ellipse cx="152" cy="108" rx="10" ry="13" fill="#f2c39f"/>`)}
      ${L(`<ellipse cx="100" cy="104" rx="50" ry="54" fill="#f7cfae"/>`)}
      ${L(`<path d="M50 96 q-4 -30 18 -44 l2 -14 l14 10 l10 -16 l12 14 l14 -12 l6 16 l16 -4 l-4 16 q14 12 12 34 q-20 -22 -50 -22 q-30 0 -50 22z" fill="#8a5a36"/>`)}
      ${eye(80, 108, 7)}${eye(120, 108, 7)}
      ${cheek(70, 126, 8)}${cheek(130, 126, 8)}
      <path d="M84 128 q16 18 32 0z" fill="#7a2b36"/><path d="M90 131 q10 6 20 0" fill="#fff"/>
    `, '0 0 200 200', 'avatar');
  }

  /* ---------------- Animals & objects ---------------- */
  const D = {};

  D.dog = () => `
    ${L(`<path d="M44 96 q-26 -6 -28 -40 q14 26 34 26z" fill="#b8763f"/>`)}
    ${L(`<rect x="44" y="84" width="104" height="58" rx="28" fill="#cf8d4f"/>`)}
    ${L(`<rect x="52" y="124" width="18" height="50" rx="9" fill="#c07f43"/><rect x="78" y="128" width="18" height="46" rx="9" fill="#c07f43"/>
         <rect x="108" y="128" width="18" height="46" rx="9" fill="#c07f43"/><rect x="130" y="124" width="18" height="50" rx="9" fill="#c07f43"/>`)}
    <path d="M118 92 q10 34 30 30 v12 q-26 4 -36 -36z" fill="#f2b33d"/>
    ${L(`<circle cx="140" cy="66" r="34" fill="#d99a5c"/>`)}
    ${L(`<path d="M112 46 q-14 4 -12 36 q12 -2 20 -28z" fill="#9c5f2c"/><path d="M168 46 q14 4 12 36 q-12 -2 -20 -28z" fill="#9c5f2c"/>`)}
    <ellipse cx="142" cy="82" rx="18" ry="13" fill="#f0c99a"/>
    ${eye(128, 62, 5)}${eye(154, 62, 5)}
    <ellipse cx="142" cy="76" rx="7" ry="5" fill="#3b2418"/>
    <path d="M136 88 q6 10 12 0" fill="#f47c8f"/>`;

  D.cat = () => `
    ${L(`<path d="M52 120 q-40 -6 -30 -60" stroke="#a37857" stroke-width="12" fill="none" stroke-linecap="round"/>`)}
    ${L(`<rect x="46" y="100" width="98" height="50" rx="25" fill="#c49a74"/>`)}
    <path d="M70 104 l6 40 M92 102 l4 44 M114 102 l2 44" stroke="#a37857" stroke-width="7" stroke-linecap="round"/>
    ${L(`<rect x="54" y="134" width="16" height="40" rx="8" fill="#b88e69"/><rect x="76" y="136" width="16" height="38" rx="8" fill="#b88e69"/>
         <rect x="106" y="136" width="16" height="38" rx="8" fill="#b88e69"/><rect x="126" y="134" width="16" height="40" rx="8" fill="#b88e69"/>`)}
    ${L(`<path d="M112 52 l6 -28 l20 18 h16 l20 -18 l6 28 q8 40 -34 44 q-42 -4 -34 -44z" fill="#d1a882"/>`)}
    <path d="M120 32 l2 14 l10 -6z M172 32 l-2 14 l-10 -6z" fill="#f49ab0"/>
    <path d="M136 30 l4 14 M146 28 v14 M156 30 l-4 14" stroke="#a37857" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="146" cy="78" rx="16" ry="11" fill="#f5e6d3"/>
    ${eye(132, 62, 5)}${eye(160, 62, 5)}
    <path d="M142 72 h8 l-4 5z" fill="#d46a7e"/>
    <path d="M120 74 h-22 M120 80 l-20 6 M172 74 h22 M172 80 l20 6" stroke="#6b4a33" stroke-width="2"/>`;

  D.fish = () => `
    ${L(`<path d="M40 100 l-26 -32 v64z" fill="#5fb3c9"/>`)}
    ${L(`<path d="M86 56 q24 -26 50 -4 z" fill="#ff8a3d"/><path d="M92 144 q20 22 40 4z" fill="#ff8a3d"/>`)}
    ${L(`<ellipse cx="104" cy="100" rx="70" ry="48" fill="#7cc576"/>`)}
    <path d="M120 56 q46 10 50 44 q-4 34 -50 44 q16 -44 0 -88z" fill="#ffc93c"/>
    <g fill="#5fae8f"><circle cx="70" cy="86" r="10"/><circle cx="90" cy="76" r="10"/><circle cx="90" cy="98" r="10"/><circle cx="70" cy="110" r="10"/><circle cx="90" cy="120" r="10"/><circle cx="108" cy="86" r="10"/><circle cx="108" cy="110" r="10"/></g>
    ${L(`<path d="M104 100 q18 -4 26 12 q-18 8 -26 -12z" fill="#ff8a3d"/>`)}
    <circle cx="146" cy="90" r="10" fill="#fff"/>${eye(148, 90, 6)}
    <path d="M168 108 q-6 6 -12 2" stroke="#d4683a" stroke-width="3" fill="none" stroke-linecap="round"/>`;

  D.bird = () => `
    ${L(`<path d="M44 108 l-30 -10 l10 28z" fill="#3e8fcf"/>`)}
    ${L(`<ellipse cx="96" cy="112" rx="58" ry="46" fill="#5fb0ea"/>`)}
    <ellipse cx="110" cy="126" rx="34" ry="26" fill="#cfe9fb"/>
    ${L(`<path d="M74 100 q-8 40 40 34 q-10 -30 -40 -34z" fill="#3e8fcf"/>`)}
    ${L(`<circle cx="138" cy="76" r="32" fill="#5fb0ea"/>`)}
    ${L(`<path d="M166 74 l26 8 l-26 10z" fill="#ffb238"/>`)}
    ${eye(146, 70, 6)}${cheek(154, 88, 6)}
    ${L(`<path d="M86 154 v18 m-6 0 h12 M110 154 v18 m-6 0 h12" stroke="#e08a2c" stroke-width="5" stroke-linecap="round"/>`)}`;

  D.cow = () => `
    ${L(`<rect x="34" y="78" width="120" height="66" rx="30" fill="#fbf7f0"/>`)}
    <path d="M56 84 q16 10 4 30 q-18 0 -22 -16z M100 118 q20 -8 30 10 q-10 14 -30 8z" fill="#3b3330"/>
    ${L(`<rect x="44" y="128" width="18" height="46" rx="8" fill="#f2ece2"/><rect x="70" y="132" width="18" height="42" rx="8" fill="#f2ece2"/>
         <rect x="104" y="132" width="18" height="42" rx="8" fill="#f2ece2"/><rect x="128" y="128" width="18" height="46" rx="8" fill="#f2ece2"/>`)}
    <path d="M44 170 h18 M70 170 h18 M104 170 h18 M128 170 h18" stroke="#5a463c" stroke-width="7"/>
    ${L(`<path d="M24 92 q-14 20 -4 40" stroke="#e8e0d4" stroke-width="7" fill="none" stroke-linecap="round"/>`)}
    ${L(`<path d="M140 38 q-12 -6 -14 -22 M180 38 q12 -6 14 -22" stroke="#e8c58a" stroke-width="8" fill="none" stroke-linecap="round"/>`)}
    ${L(`<ellipse cx="160" cy="70" rx="34" ry="38" fill="#fbf7f0"/>`)}
    <ellipse cx="124" cy="50" rx="14" ry="8" fill="#3b3330"/><ellipse cx="196" cy="50" rx="14" ry="8" fill="#3b3330" transform="rotate(10 196 50)"/>
    ${L(`<ellipse cx="160" cy="94" rx="28" ry="18" fill="#f6b4c0"/>`)}
    <circle cx="150" cy="94" r="4" fill="#c46d7f"/><circle cx="170" cy="94" r="4" fill="#c46d7f"/>
    ${eye(146, 62, 5)}${eye(174, 62, 5)}`;

  D.horse = () => `
    ${L(`<path d="M42 92 q-26 10 -22 56 q10 -10 18 -30z" fill="#6b3f22"/>`)}
    ${L(`<rect x="40" y="82" width="110" height="56" rx="26" fill="#a8683a"/>`)}
    ${L(`<rect x="48" y="124" width="16" height="50" rx="7" fill="#975c31"/><rect x="72" y="128" width="16" height="46" rx="7" fill="#975c31"/>
         <rect x="106" y="128" width="16" height="46" rx="7" fill="#975c31"/><rect x="128" y="124" width="16" height="50" rx="7" fill="#975c31"/>`)}
    <path d="M48 170 h16 M72 170 h16 M106 170 h16 M128 170 h16" stroke="#3b2418" stroke-width="7"/>
    ${L(`<path d="M126 96 l14 -64 q30 -10 42 20 l8 36 q2 16 -14 16 q-12 0 -18 -12 l-6 -10 l-6 30z" fill="#b5743f"/>`)}
    ${L(`<path d="M132 34 q-10 30 -6 66 l10 -6 q-4 -30 6 -58z" fill="#6b3f22"/><path d="M146 26 l4 -16 l10 14z" fill="#a8683a"/>`)}
    <ellipse cx="184" cy="88" rx="10" ry="9" fill="#8c5530"/>
    ${eye(162, 54, 5)}<circle cx="186" cy="86" r="2.5" fill="#3b2418"/>`;

  D.duck = () => `
    ${L(`<ellipse cx="94" cy="124" rx="66" ry="44" fill="#ffd54a"/>`)}
    ${L(`<path d="M30 112 q-4 -24 18 -26 q-2 20 10 30z" fill="#ffc93c"/>`)}
    ${L(`<path d="M70 112 q20 34 60 14 q-24 -26 -60 -14z" fill="#f5b82e"/>`)}
    ${L(`<circle cx="138" cy="70" r="34" fill="#ffd54a"/>`)}
    ${L(`<path d="M164 72 q30 -2 32 10 q-10 12 -34 8z" fill="#ff8a3d"/>`)}
    ${eye(146, 62, 6)}${cheek(150, 84, 6)}
    ${L(`<path d="M80 166 v14 m-10 0 h20 M110 166 v14 m-10 0 h20" stroke="#ff8a3d" stroke-width="6" stroke-linecap="round"/>`)}`;

  D.monkey = () => `
    ${L(`<path d="M138 150 q46 0 40 -40 q-4 -20 -18 -16" stroke="#8a5a36" stroke-width="10" fill="none" stroke-linecap="round"/>`)}
    ${L(`<ellipse cx="100" cy="146" rx="42" ry="40" fill="#9c6a41"/>`)}
    <ellipse cx="100" cy="152" rx="26" ry="26" fill="#e9c39a"/>
    ${L(`<path d="M64 144 q-20 20 -6 40 M136 144 q20 20 6 40" stroke="#9c6a41" stroke-width="14" fill="none" stroke-linecap="round"/>`)}
    ${L(`<circle cx="46" cy="76" r="20" fill="#9c6a41"/><circle cx="154" cy="76" r="20" fill="#9c6a41"/>`)}
    <circle cx="46" cy="76" r="11" fill="#e9c39a"/><circle cx="154" cy="76" r="11" fill="#e9c39a"/>
    ${L(`<circle cx="100" cy="74" r="50" fill="#9c6a41"/>`)}
    <path d="M62 80 q0 -34 38 -26 q38 -8 38 26 q0 36 -38 36 q-38 0 -38 -36z" fill="#e9c39a"/>
    ${eye(84, 72, 6)}${eye(116, 72, 6)}
    <circle cx="94" cy="88" r="2.5" fill="#6b4a33"/><circle cx="106" cy="88" r="2.5" fill="#6b4a33"/>
    <path d="M84 96 q16 14 32 0" stroke="#6b3a2a" stroke-width="4" fill="none" stroke-linecap="round"/>`;

  D.elephant = () => `
    ${L(`<rect x="34" y="78" width="118" height="70" rx="34" fill="#9fb2c4"/>`)}
    ${L(`<rect x="42" y="128" width="22" height="46" rx="10" fill="#8ea2b5"/><rect x="72" y="132" width="22" height="42" rx="10" fill="#8ea2b5"/>
         <rect x="104" y="132" width="22" height="42" rx="10" fill="#8ea2b5"/><rect x="128" y="128" width="22" height="46" rx="10" fill="#8ea2b5"/>`)}
    ${L(`<path d="M30 96 q-14 10 -10 26" stroke="#8ea2b5" stroke-width="5" fill="none" stroke-linecap="round"/>`)}
    ${L(`<path d="M120 46 q-38 -10 -36 34 q2 30 34 26z" fill="#b8c7d5"/>`)}
    <path d="M114 56 q-22 -2 -22 22 q2 16 22 16z" fill="#f2c4cf"/>
    ${L(`<circle cx="150" cy="74" r="38" fill="#a9bccd"/>`)}
    ${L(`<path d="M176 86 q20 30 4 64 q-4 8 -12 2 q10 -26 -6 -50z" fill="#a9bccd"/>`)}
    ${eye(160, 64, 6)}${cheek(170, 86, 7)}
    <path d="M150 96 q8 10 -2 18" stroke="#fffaf0" stroke-width="6" fill="none" stroke-linecap="round"/>`;

  D.frog = () => `
    ${L(`<ellipse cx="100" cy="134" rx="68" ry="48" fill="#6cc164"/>`)}
    <ellipse cx="100" cy="146" rx="44" ry="30" fill="#c8eab0"/>
    ${L(`<ellipse cx="44" cy="170" rx="26" ry="12" fill="#58a851"/><ellipse cx="156" cy="170" rx="26" ry="12" fill="#58a851"/>`)}
    ${L(`<circle cx="66" cy="78" r="26" fill="#6cc164"/><circle cx="134" cy="78" r="26" fill="#6cc164"/>`)}
    <circle cx="66" cy="78" r="16" fill="#fff"/><circle cx="134" cy="78" r="16" fill="#fff"/>
    ${eye(68, 80, 8)}${eye(136, 80, 8)}
    <path d="M62 118 q38 30 76 0" stroke="#2f6b2c" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${cheek(52, 116, 9)}${cheek(148, 116, 9)}`;

  D.rabbit = () => `
    ${L(`<ellipse cx="78" cy="48" rx="14" ry="40" fill="#efe6dc" transform="rotate(-10 78 48)"/><ellipse cx="122" cy="48" rx="14" ry="40" fill="#efe6dc" transform="rotate(10 122 48)"/>`)}
    <ellipse cx="78" cy="50" rx="6" ry="28" fill="#f6b4c0" transform="rotate(-10 78 50)"/><ellipse cx="122" cy="50" rx="6" ry="28" fill="#f6b4c0" transform="rotate(10 122 50)"/>
    ${L(`<ellipse cx="100" cy="150" rx="50" ry="40" fill="#efe6dc"/>`)}
    ${L(`<circle cx="148" cy="160" r="14" fill="#fff"/>`)}
    ${L(`<ellipse cx="72" cy="182" rx="20" ry="10" fill="#e4d8ca"/><ellipse cx="128" cy="182" rx="20" ry="10" fill="#e4d8ca"/>`)}
    ${L(`<circle cx="100" cy="102" r="40" fill="#f6eee6"/>`)}
    ${eye(86, 98, 6)}${eye(114, 98, 6)}${cheek(76, 114, 7)}${cheek(124, 114, 7)}
    <path d="M95 110 h10 l-5 6z" fill="#e0788e"/><path d="M100 116 v6 m0 0 q-6 6 -12 2 m12 -2 q6 6 12 2" stroke="#8a6a5a" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;

  D.lion = () => `
    ${L(`<path d="M140 150 q46 4 38 -36" stroke="#d8963c" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="178" cy="110" r="10" fill="#9c5a24"/>`)}
    ${L(`<ellipse cx="100" cy="150" rx="46" ry="38" fill="#f0b552"/>`)}
    ${L(`<rect x="66" y="160" width="22" height="28" rx="10" fill="#e8a946"/><rect x="112" y="160" width="22" height="28" rx="10" fill="#e8a946"/>`)}
    ${L(`<path d="M100 10 l14 16 l20 -8 l4 20 l20 2 l-4 20 l18 10 l-12 16 l12 16 l-18 10 l4 20 l-20 2 l-4 20 l-20 -8 l-14 16 l-14 -16 l-20 8 l-4 -20 l-20 -2 l4 -20 l-18 -10 l12 -16 l-12 -16 l18 -10 l-4 -20 l20 -2 l4 -20 l20 8z" fill="#b8642a"/>`)}
    ${L(`<circle cx="100" cy="80" r="46" fill="#d98a36"/>`)}
    ${L(`<circle cx="100" cy="82" r="36" fill="#f6c25e"/>`)}
    <circle cx="70" cy="52" r="10" fill="#f6c25e"/><circle cx="130" cy="52" r="10" fill="#f6c25e"/><circle cx="70" cy="52" r="5" fill="#e9a3a0"/><circle cx="130" cy="52" r="5" fill="#e9a3a0"/>
    <path d="M80 78 q8 -8 16 0 M104 78 q8 -8 16 0" stroke="#3b2418" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="100" cy="98" rx="18" ry="12" fill="#fff3d9"/>
    <path d="M93 90 h14 l-7 7z" fill="#5a3320"/>
    <path d="M90 104 q10 8 20 0" stroke="#5a3320" stroke-width="3" fill="none" stroke-linecap="round"/>`;

  D.house = () => `
    ${L(`<rect x="42" y="90" width="116" height="90" rx="6" fill="#ffd9a0"/>`)}
    ${L(`<path d="M28 98 l72 -66 l72 66 q4 6 -4 8 h-136 q-8 -2 -4 -8z" fill="#e5534b"/>`)}
    ${L(`<rect x="128" y="40" width="18" height="36" fill="#a8683a"/>`)}
    ${L(`<rect x="86" y="120" width="30" height="60" rx="14" fill="#8a5a36"/>`)}
    <circle cx="108" cy="152" r="3" fill="#ffc93c"/>
    ${L(`<rect x="54" y="112" width="24" height="24" rx="4" fill="#9fd4f0"/><rect x="124" y="112" width="24" height="24" rx="4" fill="#9fd4f0"/>`)}
    <path d="M66 112 v24 M54 124 h24 M136 112 v24 M124 124 h24" stroke="#fff" stroke-width="3"/>`;

  D.tree = () => `
    ${L(`<path d="M88 190 l4 -70 h16 l4 70z" fill="#9c6a41"/>`)}
    ${L(`<circle cx="100" cy="74" r="50" fill="#69b85f"/><circle cx="58" cy="102" r="36" fill="#5aa852"/><circle cx="142" cy="102" r="36" fill="#5aa852"/>`)}
    <circle cx="100" cy="60" r="22" fill="#7fca73" opacity=".7"/>`;

  D.sun = () => `
    ${L(`<g fill="#ffb238">${Array.from({ length: 12 }, (_, i) => `<path d="M100 8 l10 26 h-20z" transform="rotate(${i * 30} 100 100)"/>`).join('')}</g>`)}
    ${L(`<circle cx="100" cy="100" r="54" fill="#ffd54a"/>`)}
    <path d="M80 94 q8 -8 16 0 M104 94 q8 -8 16 0" stroke="#7a4f2e" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${cheek(74, 112, 9)}${cheek(126, 112, 9)}
    <path d="M86 114 q14 14 28 0" stroke="#7a4f2e" stroke-width="5" fill="none" stroke-linecap="round"/>`;

  D.moon = () => `
    ${L(`<path d="M120 20 a80 80 0 1 0 54 128 a64 64 0 0 1 -54 -128z" fill="#ffe08a"/>`)}
    <circle cx="80" cy="80" r="10" fill="#f5c95a"/><circle cx="64" cy="128" r="14" fill="#f5c95a"/><circle cx="108" cy="150" r="8" fill="#f5c95a"/>
    ${L(`<path d="M160 40 l4 10 l10 2 l-8 6 l2 10 l-8 -6 l-8 6 l2 -10 l-8 -6 l10 -2z" fill="#ffc93c"/>`)}`;

  D.ball = () => `
    ${L(`<circle cx="100" cy="100" r="74" fill="#ffc93c"/>`)}
    <path d="M30 80 q70 30 140 0 v40 q-70 30 -140 0z" fill="#e5534b"/>
    <path d="M100 26 q-30 74 0 148 q-14 0 -20 -2 q-26 -72 2 -144z" fill="#4fa8e0"/>
    <circle cx="74" cy="64" r="12" fill="#fff" opacity=".55"/>`;

  D.apple = (c = '#e5534b') => `
    ${L(`<path d="M100 56 q-10 -26 4 -40" stroke="#7a4f2e" stroke-width="8" fill="none" stroke-linecap="round"/>`)}
    ${L(`<path d="M106 40 q24 -24 48 -8 q-20 24 -48 8z" fill="#69b85f"/>`)}
    ${L(`<path d="M100 60 q-30 -22 -58 0 q-30 30 -4 82 q22 42 46 26 q8 -4 16 -4 q8 0 16 4 q24 16 46 -26 q26 -52 -4 -82 q-28 -22 -58 0z" fill="${c}"/>`)}
    <ellipse cx="66" cy="86" rx="10" ry="18" fill="#fff" opacity=".35" transform="rotate(20 66 86)"/>`;

  D.banana = () => `
    ${L(`<path d="M150 30 q30 90 -40 140 q-50 24 -84 -6 q60 4 92 -46 q22 -36 14 -82z" fill="#ffd54a"/>`)}
    <path d="M140 52 q10 70 -54 104" stroke="#e8b830" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${L(`<path d="M134 32 l14 -14 l10 14z" fill="#7a5a2e"/>`)}
    <circle cx="28" cy="164" r="5" fill="#7a5a2e"/>`;

  D.flower = () => `
    ${L(`<path d="M100 110 q-6 50 0 80" stroke="#4f9e48" stroke-width="9" fill="none" stroke-linecap="round"/>
         <path d="M100 160 q-36 -26 -54 -6 q24 22 54 6z" fill="#69b85f"/><path d="M102 150 q30 -30 52 -12 q-22 24 -52 12z" fill="#69b85f"/>`)}
    ${L(`<g fill="#f49ab0">${Array.from({ length: 6 }, (_, i) => `<ellipse cx="100" cy="46" rx="22" ry="30" transform="rotate(${i * 60} 100 80)"/>`).join('')}</g>`)}
    ${L(`<circle cx="100" cy="80" r="22" fill="#ffc93c"/>`)}
    <circle cx="92" cy="74" r="6" fill="#fff" opacity=".5"/>`;

  D.book = () => `
    ${L(`<path d="M100 48 q-40 -20 -82 -4 v128 q42 -16 82 4z" fill="#8E6CEF"/><path d="M100 48 q40 -20 82 -4 v128 q-42 -16 -82 4z" fill="#7a58dc"/>`)}
    ${L(`<path d="M100 54 q-36 -16 -72 -4 v112 q36 -12 72 4z" fill="#fffaf0"/><path d="M100 54 q36 -16 72 -4 v112 q-36 -12 -72 4z" fill="#f6efe2"/>`)}
    <path d="M40 76 q24 -8 48 2 M40 96 q24 -8 48 2 M40 116 q24 -8 48 2 M112 78 q24 -10 48 -2 M112 98 q24 -10 48 -2 M112 118 q24 -10 48 -2" stroke="#c9b9a4" stroke-width="4" fill="none" stroke-linecap="round"/>`;

  D.cup = () => `
    ${L(`<path d="M146 76 q36 0 34 34 q-2 30 -40 30" stroke="#1FB5A8" stroke-width="14" fill="none"/>`)}
    ${L(`<path d="M38 54 h120 l-12 116 q-2 14 -16 14 h-64 q-14 0 -16 -14z" fill="#3CC2B4"/>`)}
    <ellipse cx="98" cy="56" rx="60" ry="10" fill="#1d8f85"/>
    <path d="M58 90 h80 M62 120 h72" stroke="#fff" stroke-width="7" opacity=".6" stroke-linecap="round"/>
    <path d="M78 36 q-8 -12 0 -22 M100 36 q-8 -12 0 -22 M122 36 q-8 -12 0 -22" stroke="#c9b9a4" stroke-width="4" fill="none" stroke-linecap="round"/>`;

  D.shoe = () => `
    ${L(`<path d="M20 150 q0 -20 20 -24 l40 -8 q14 -30 30 -60 q30 10 40 40 q30 10 34 30 q4 14 -6 22 h-148q-10 0 -10 0z" fill="#4fa8e0"/>`)}
    ${L(`<path d="M16 150 h172 q4 10 -4 18 h-160 q-10 -6 -8 -18z" fill="#fffaf0"/>`)}
    <path d="M96 76 l22 10 M90 90 l22 10 M84 104 l22 10" stroke="#fffaf0" stroke-width="6" stroke-linecap="round"/>
    <circle cx="140" cy="120" r="10" fill="#ffc93c"/>`;

  D.hat = () => `
    ${L(`<ellipse cx="100" cy="146" rx="88" ry="22" fill="#ff8a3d"/>`)}
    ${L(`<path d="M44 146 q-6 -96 56 -96 q62 0 56 96z" fill="#ffa45e"/>`)}
    <path d="M46 126 q54 14 108 0 l2 16 q-56 14 -112 0z" fill="#8E6CEF"/>
    ${L(`<circle cx="100" cy="46" r="12" fill="#ffc93c"/>`)}`;

  D.car = (c = '#e5534b') => `
    ${L(`<path d="M26 140 v-30 q0 -14 14 -16 l22 -2 l22 -36 q6 -8 18 -8 h40 q12 0 18 10 l20 34 q24 4 24 22 v26z" fill="${c}"/>`)}
    <path d="M70 92 l18 -30 h30 v30z M126 92 v-30 h10 q8 0 12 8 l12 22z" fill="#cfeaf9"/>
    ${L(`<circle cx="62" cy="146" r="22" fill="#3b3330"/><circle cx="148" cy="146" r="22" fill="#3b3330"/>`)}
    <circle cx="62" cy="146" r="9" fill="#d9d2c8"/><circle cx="148" cy="146" r="9" fill="#d9d2c8"/>
    <rect x="164" y="104" width="12" height="8" rx="3" fill="#ffd54a"/>`;

  D.bus = () => `
    ${L(`<rect x="16" y="44" width="170" height="104" rx="18" fill="#ffc93c"/>`)}
    <g fill="#cfeaf9"><rect x="28" y="58" width="30" height="32" rx="6"/><rect x="66" y="58" width="30" height="32" rx="6"/><rect x="104" y="58" width="30" height="32" rx="6"/><rect x="142" y="58" width="32" height="40" rx="6"/></g>
    <rect x="16" y="104" width="170" height="10" fill="#ff8a3d"/>
    ${L(`<circle cx="54" cy="150" r="20" fill="#3b3330"/><circle cx="148" cy="150" r="20" fill="#3b3330"/>`)}
    <circle cx="54" cy="150" r="8" fill="#d9d2c8"/><circle cx="148" cy="150" r="8" fill="#d9d2c8"/>
    <rect x="176" y="122" width="10" height="10" rx="3" fill="#fff6e6"/>`;

  D.chair = () => `
    ${L(`<rect x="52" y="20" width="96" height="92" rx="16" fill="#c9884f"/>`)}
    <rect x="66" y="34" width="68" height="62" rx="10" fill="#e0a76d"/>
    ${L(`<rect x="52" y="110" width="22" height="78" rx="6" fill="#a8683a"/><rect x="126" y="110" width="22" height="78" rx="6" fill="#a8683a"/>`)}
    ${L(`<rect x="38" y="104" width="124" height="24" rx="10" fill="#d99a5c"/>`)}`;

  D.clock = () => `
    ${L(`<circle cx="100" cy="104" r="80" fill="#ff8a3d"/>`)}
    <circle cx="100" cy="104" r="64" fill="#fff6e6"/>
    <g fill="#2b2350">${Array.from({ length: 12 }, (_, i) => `<circle cx="100" cy="48" r="${i % 3 ? 3 : 5}" transform="rotate(${i * 30} 100 104)"/>`).join('')}</g>
    <path d="M100 104 v-40 M100 104 l26 14" stroke="#2b2350" stroke-width="8" stroke-linecap="round"/>
    <circle cx="100" cy="104" r="7" fill="#ffc93c"/>`;

  D.cake = () => `
    ${L(`<rect x="34" y="94" width="132" height="80" rx="14" fill="#f6b4c0"/>`)}
    <path d="M34 112 q16 18 33 0 q16 18 33 0 q16 18 33 0 q16 18 33 0 v-18 h-132z" fill="#fffaf0"/>
    <rect x="34" y="144" width="132" height="10" fill="#8E6CEF" opacity=".7"/>
    ${L(`<rect x="94" y="52" width="12" height="42" rx="5" fill="#4fa8e0"/>`)}
    ${L(`<path d="M100 22 q14 18 0 28 q-14 -10 0 -28z" fill="#ffb238"/>`)}
    <circle cx="60" cy="128" r="5" fill="#e5534b"/><circle cx="100" cy="132" r="5" fill="#ffc93c"/><circle cx="140" cy="128" r="5" fill="#69b85f"/>`;

  D.cloud = () => `
    ${L(`<path d="M44 148 q-34 0 -34 -30 q0 -30 34 -30 q4 -40 46 -40 q32 0 44 26 q10 -6 22 -6 q34 0 34 36 q20 6 20 22 q0 22 -26 22z" fill="#fffdf8"/>`)}
    <path d="M60 148 q60 10 120 0" stroke="#e6ddcf" stroke-width="4" fill="none" stroke-linecap="round"/>`;

  D.balloon = (c = '#f49ab0') => `
    <path d="M100 150 q-10 20 4 46" stroke="#b9a58e" stroke-width="3" fill="none"/>
    ${L(`<ellipse cx="100" cy="82" rx="52" ry="62" fill="${c}"/><path d="M92 144 h16 l-8 10z" fill="${c}"/>`)}
    <ellipse cx="80" cy="60" rx="10" ry="18" fill="#fff" opacity=".4" transform="rotate(20 80 60)"/>`;

  D.star = (c = '#FFC93C') => `
    ${L(`<path d="M100 14 l24 52 l56 6 l-42 38 l12 56 l-50 -28 l-50 28 l12 -56 l-42 -38 l56 -6z" fill="${c}" stroke="${c}" stroke-width="10" stroke-linejoin="round"/>`)}
    <path d="M100 40 l10 26" stroke="#fff" stroke-width="7" opacity=".45" stroke-linecap="round"/>`;

  // ---- sticker-only extras ----
  D.train = () => `
    ${L(`<rect x="90" y="70" width="90" height="80" rx="10" fill="#3CC2B4"/><rect x="20" y="92" width="80" height="58" rx="10" fill="#1FA89C"/>`)}
    ${L(`<rect x="40" y="56" width="20" height="36" rx="4" fill="#3b3330"/><rect x="84" y="56" width="106" height="20" rx="8" fill="#e5534b"/>`)}
    <rect x="108" y="88" width="54" height="30" rx="6" fill="#cfeaf9"/>
    <rect x="14" y="140" width="176" height="10" rx="4" fill="#ffc93c"/>
    ${L(`<circle cx="46" cy="160" r="16" fill="#e5534b"/><circle cx="110" cy="160" r="16" fill="#e5534b"/><circle cx="156" cy="160" r="16" fill="#e5534b"/>`)}
    <circle cx="46" cy="160" r="6" fill="#fff6e6"/><circle cx="110" cy="160" r="6" fill="#fff6e6"/><circle cx="156" cy="160" r="6" fill="#fff6e6"/>
    <circle cx="36" cy="40" r="10" fill="#e6ddcf"/><circle cx="22" cy="24" r="7" fill="#e6ddcf"/>`;

  D.airplane = () => `
    ${L(`<path d="M86 96 l-34 -56 h18 l52 56z M86 110 l-34 56 h18 l52 -56z" fill="#4fa8e0"/>`)}
    ${L(`<path d="M18 92 q0 -12 14 -12 h120 q30 0 40 22 q-10 22 -40 22 h-120 q-14 0 -14 -12z" fill="#fffaf0"/>`)}
    ${L(`<path d="M24 82 l-8 -34 h16 l22 34z" fill="#e5534b"/>`)}
    <g fill="#4fa8e0"><circle cx="70" cy="100" r="7"/><circle cx="94" cy="100" r="7"/><circle cx="118" cy="100" r="7"/></g>
    <path d="M160 92 q16 0 24 10 h-24z" fill="#4fa8e0"/>`;

  D.boat = () => `
    ${L(`<path d="M100 20 v120" stroke="#8a5a36" stroke-width="6"/>`)}
    ${L(`<path d="M104 26 q50 40 60 100 h-60z" fill="#fffaf0"/><path d="M96 46 q-34 34 -40 80 h40z" fill="#ffc93c"/>`)}
    ${L(`<path d="M20 136 h160 l-24 38 h-112z" fill="#e5534b"/>`)}
    <path d="M10 184 q20 -10 40 0 q20 10 40 0 q20 -10 40 0 q20 10 40 0 q10 -5 20 0" stroke="#4fa8e0" stroke-width="6" fill="none" stroke-linecap="round"/>`;

  D.bicycle = () => `
    ${L(`<circle cx="50" cy="130" r="36" fill="none" stroke="#3b3330" stroke-width="10"/><circle cx="150" cy="130" r="36" fill="none" stroke="#3b3330" stroke-width="10"/>`)}
    ${L(`<path d="M50 130 l36 -54 h52 l12 54 M86 76 l24 54 l40 -54 M50 130 h60" stroke="#8E6CEF" stroke-width="9" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`)}
    ${L(`<path d="M74 64 h28" stroke="#3b3330" stroke-width="10" stroke-linecap="round"/><path d="M138 76 l-6 -22 h18" stroke="#3b3330" stroke-width="8" fill="none" stroke-linecap="round"/>`)}`;

  D.strawberry = () => `
    ${L(`<path d="M100 50 q-60 -6 -62 40 q4 54 62 90 q58 -36 62 -90 q-2 -46 -62 -40z" fill="#e5534b"/>`)}
    <g fill="#ffe08a">${[[76, 82], [100, 76], [124, 82], [86, 108], [114, 108], [100, 134], [70, 110], [130, 110]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3" ry="5"/>`).join('')}</g>
    ${L(`<path d="M100 56 l-30 -12 l20 -4 l-8 -18 l18 12 l0 -16 l10 16 l14 -14 l-4 20 l22 0 l-24 14z" fill="#69b85f"/>`)}`;

  D.grapes = () => `
    ${L(`<path d="M100 40 q4 -20 18 -26" stroke="#7a4f2e" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M104 34 q30 -20 54 0 q-26 18 -54 0z" fill="#69b85f"/>`)}
    ${L(`<g fill="#9b6fe0">${[[74, 60], [100, 56], [126, 60], [62, 88], [88, 86], [114, 86], [140, 88], [76, 114], [102, 114], [128, 114], [90, 140], [116, 140], [102, 164]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16"/>`).join('')}</g>`)}
    <g fill="#fff" opacity=".35">${[[70, 56], [96, 52], [122, 56], [84, 82], [110, 82], [98, 110]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4"/>`).join('')}</g>`;

  D.orange = () => `
    ${L(`<circle cx="100" cy="110" r="70" fill="#ff9a3d"/>`)}
    <g fill="#e07a24" opacity=".6"><circle cx="76" cy="100" r="3"/><circle cx="120" cy="130" r="3"/><circle cx="100" cy="150" r="3"/><circle cx="132" cy="94" r="3"/></g>
    ${L(`<path d="M100 44 q20 -30 50 -18 q-18 28 -50 18z" fill="#69b85f"/>`)}
    <ellipse cx="74" cy="84" rx="12" ry="20" fill="#fff" opacity=".3" transform="rotate(30 74 84)"/>`;

  D.cherries = () => `
    <path d="M70 120 q10 -60 50 -96 M136 128 q-10 -60 -16 -104" stroke="#4f9e48" stroke-width="6" fill="none" stroke-linecap="round"/>
    ${L(`<path d="M120 24 q30 -10 46 10 q-26 14 -46 -10z" fill="#69b85f"/>`)}
    ${L(`<circle cx="66" cy="140" r="34" fill="#d63f4a"/><circle cx="138" cy="146" r="34" fill="#e5534b"/>`)}
    <circle cx="54" cy="128" r="8" fill="#fff" opacity=".4"/><circle cx="126" cy="134" r="8" fill="#fff" opacity=".4"/>`;

  D.pear = () => `
    ${L(`<path d="M100 40 q-22 0 -24 34 q-2 18 -18 38 q-22 34 4 58 q38 24 76 0 q26 -24 4 -58 q-16 -20 -18 -38 q-2 -34 -24 -34z" fill="#b5d65a"/>`)}
    ${L(`<path d="M100 44 q-2 -16 8 -28" stroke="#7a4f2e" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M106 26 q24 -12 40 4 q-22 12 -40 -4z" fill="#69b85f"/>`)}
    <ellipse cx="80" cy="130" rx="10" ry="18" fill="#fff" opacity=".3"/>`;

  D.watermelon = () => `
    ${L(`<path d="M14 80 h172 a86 86 0 0 1 -172 0z" fill="#4f9e48"/>`)}
    <path d="M24 80 h152 a76 76 0 0 1 -152 0z" fill="#fffaf0"/>
    <path d="M32 80 h136 a68 68 0 0 1 -136 0z" fill="#f2545b"/>
    <g fill="#3b3330">${[[70, 104], [100, 120], [130, 104], [86, 132], [116, 132], [100, 96]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="6"/>`).join('')}</g>`;

  D.rocket = () => `
    ${L(`<path d="M70 130 l-26 30 l6 -46z M130 130 l26 30 l-6 -46z" fill="#e5534b"/>`)}
    ${L(`<path d="M100 14 q44 40 34 126 h-68 q-10 -86 34 -126z" fill="#e8eef5"/>`)}
    <path d="M100 14 q24 22 32 50 h-64 q8 -28 32 -50z" fill="#e5534b"/>
    <circle cx="100" cy="90" r="16" fill="#4fa8e0" stroke="#9fb2c4" stroke-width="6"/>
    ${L(`<path d="M80 140 q20 60 40 0z" fill="#ffb238"/>`)}
    <path d="M92 140 q8 30 16 0z" fill="#ffe08a"/>`;

  D.planet = () => `
    ${L(`<circle cx="100" cy="100" r="54" fill="#9b6fe0"/>`)}
    <path d="M52 86 q48 16 96 0 M56 120 q44 12 88 0" stroke="#b79af5" stroke-width="8" fill="none" stroke-linecap="round"/>
    ${L(`<ellipse cx="100" cy="104" rx="92" ry="22" fill="none" stroke="#ffc93c" stroke-width="10" transform="rotate(-14 100 104)"/>`)}
    <path d="M48 96 a54 54 0 0 1 104 0" fill="#9b6fe0" transform="rotate(-14 100 104)" opacity="0"/>`;

  D.ufo = () => `
    <path d="M70 140 l-20 50 h100 l-20 -50z" fill="#ffe08a" opacity=".55"/>
    ${L(`<ellipse cx="100" cy="86" rx="40" ry="38" fill="#bfe6f5"/>`)}
    ${L(`<ellipse cx="100" cy="118" rx="90" ry="28" fill="#9fb2c4"/>`)}
    <ellipse cx="100" cy="110" rx="90" ry="12" fill="#b8c7d5"/>
    <g fill="#ffc93c"><circle cx="40" cy="122" r="7"/><circle cx="76" cy="130" r="7"/><circle cx="124" cy="130" r="7"/><circle cx="160" cy="122" r="7"/></g>
    ${L(`<circle cx="100" cy="82" r="18" fill="#7cc576"/>`)}${eye(94, 80, 4)}${eye(108, 80, 4)}`;

  D.comet = () => `
    ${L(`<path d="M150 50 q-80 10 -134 90 q90 -40 144 -20z" fill="#ffd54a" opacity=".85"/>`)}
    <path d="M150 62 q-60 14 -104 56 q70 -26 108 -14z" fill="#fff3c4"/>
    ${L(`<circle cx="152" cy="84" r="30" fill="#ffb238"/>`)}
    <circle cx="144" cy="76" r="8" fill="#fff" opacity=".5"/>`;

  D.astronaut = () => `
    ${L(`<rect x="58" y="104" width="84" height="70" rx="26" fill="#f2f4f7"/>`)}
    ${L(`<rect x="30" y="112" width="30" height="20" rx="10" fill="#e8eef5" transform="rotate(-30 45 122)"/><rect x="140" y="112" width="30" height="20" rx="10" fill="#e8eef5" transform="rotate(30 155 122)"/>`)}
    <rect x="86" y="124" width="28" height="18" rx="4" fill="#4fa8e0"/><circle cx="92" cy="152" r="4" fill="#e5534b"/><circle cx="108" cy="152" r="4" fill="#ffc93c"/>
    ${L(`<circle cx="100" cy="70" r="46" fill="#f2f4f7"/>`)}
    <rect x="66" y="48" width="68" height="50" rx="24" fill="#3b4a6b"/>
    <path d="M76 60 q10 -6 18 -2" stroke="#9fb2c4" stroke-width="5" fill="none" stroke-linecap="round"/>`;

  /* ---------------- Icons (24x24 viewBox) ---------------- */
  const I = {
    house: `<path d="M3 11.2 12 3.5l9 7.7v.8h-2.2V20a1 1 0 0 1-1 1H14v-6h-4v6H6.2a1 1 0 0 1-1-1v-8H3z" fill="currentColor"/>`,
    star: `<path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="#FFC93C" stroke="#F2B21E" stroke-width="1" stroke-linejoin="round"/>`,
    fullscreen: `<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
    exitfull: `<path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
    lock: `<rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="15.5" r="1.6" fill="#FFF6E6"/>`,
    speaker: `<path d="M3.5 9h3.8L12.5 4.8v14.4L7.3 15H3.5z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M15.5 8.6a4.8 4.8 0 0 1 0 6.8M18.3 6a8.6 8.6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
    redo: `<path d="M19.5 9A8 8 0 0 0 5 7.5M4.5 15A8 8 0 0 0 19 16.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M20 3.5V9.5h-6M4 20.5v-6h6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
    next: `<path d="M12 5l-7 7 7 7zM20 5l-7 7 7 7z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`,
    check: `<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`,
    back: `<path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    del: `<path d="M9 5h11v14H9l-6-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9l5 6M17 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
    parent: `<circle cx="9" cy="8" r="3.4" fill="currentColor"/><circle cx="16.5" cy="9.5" r="2.6" fill="currentColor" opacity=".75"/><path d="M2.5 20c0-4 3-6.5 6.5-6.5s6.5 2.5 6.5 6.5z" fill="currentColor"/><path d="M14 20c0-3 1-5 2.5-5.6 2.6 0 5 2 5 5.6z" fill="currentColor" opacity=".75"/>`,
    album: `<rect x="4" y="3" width="15" height="18" rx="2.5" fill="#B79AF5"/><rect x="6.5" y="3" width="12.5" height="18" rx="2" fill="#8E6CEF"/><path d="M12.8 8.2l1.3 2.7 3 .4-2.2 2 .6 3-2.7-1.5-2.7 1.5.6-3-2.2-2 3-.4z" fill="#FFC93C"/><path d="M4 6h2M4 10h2M4 14h2M4 18h2" stroke="#6b4fc0" stroke-width="1.4" stroke-linecap="round"/>`,
  };
  const icon = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;

  const draw = (name, arg, cls = '') => wrap(D[name](arg), '0 0 200 200', cls);

  return { popo, avatar, draw, icon, D, wrap, L };
})();
