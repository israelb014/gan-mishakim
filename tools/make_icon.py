#!/usr/bin/env python3
"""Render Popo (from js/art.js, same art as the game) into desktop/build/icon.ico (16..256 px) + icon.png."""
import io, pathlib
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'desktop' / 'build'; OUT.mkdir(parents=True, exist_ok=True)
SIZES = [16, 24, 32, 48, 64, 128, 256]
DEFS = '''<svg width="0" height="0" style="position:absolute"><defs>
<filter id="pl" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="2.6" flood-color="#5a3e1b" flood-opacity=".22"/></filter>
</defs></svg>'''
art = (ROOT / 'js' / 'art.js').read_text(encoding='utf-8')
html = f'''<!doctype html><html><body style="margin:0;background:transparent">{DEFS}
<div id="b" style="width:256px;height:256px;display:grid;place-items:center"><div id="p" style="width:226px;height:256px;transform:scaleX(-1)"></div></div>
<script>{art}</script><script>document.getElementById('p').innerHTML = ART.popo('happy');</script></body></html>'''

frames = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for s in SIZES:
        pg = b.new_page(viewport={'width': 256, 'height': 256}, device_scale_factor=s / 256)
        pg.set_content(html)
        png = pg.locator('#b').screenshot(omit_background=True)
        im = Image.open(io.BytesIO(png)).convert('RGBA').resize((s, s), Image.LANCZOS)
        frames.append(im)
    b.close()
big = frames[-1]
big.save(OUT / 'icon.png')
big.save(OUT / 'icon.ico', format='ICO', sizes=[(s, s) for s in SIZES], append_images=frames[:-1])
print('wrote', OUT / 'icon.ico', [f.size for f in frames])
