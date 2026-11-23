/* Copies the shared web game (repo root) into desktop/web before packaging,
   so the website and the desktop program always run the same code. */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.resolve(__dirname, '..', 'web');
const ITEMS = ['index.html', 'icon.svg', 'manifest.webmanifest', 'css', 'js', 'fonts', 'audio', 'content'];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
let n = 0;
for (const item of ITEMS) {
  const src = path.join(ROOT, item);
  if (!fs.existsSync(src)) throw new Error(`missing web file: ${item}`);
  fs.cpSync(src, path.join(OUT, item), { recursive: true });
  n += fs.statSync(src).isDirectory() ? fs.readdirSync(src).length : 1;
}
console.log(`copied ${n} web files -> ${path.relative(process.cwd(), OUT) || OUT}`);
