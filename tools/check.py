#!/usr/bin/env python3
"""Headless check of the whole game. Serves the repo on :8765, writes screenshots to shots/.
  - screenshots of every screen, every game at several difficulties, level paths in every world
  - plays complete levels of every game (answering correctly), the daily challenge, a champion level
  - seeded levels replay identically; adaptive difficulty moves up and down
  - drawing: brush, fill, stamp, save -> gallery, reopen, delete; coloring pages lock/unlock
  - wardrobe purchase, album pages, v1 -> v2 progress migration
  - every spoken line used at runtime exists, every MP3 decodes; Popo never covers buttons/cards; no console errors
Usage: python tools/check.py"""
import json, pathlib, subprocess, sys, time
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'shots'; OUT.mkdir(exist_ok=True)
for old in OUT.glob('*.png'): old.unlink()
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8765', '-d', str(ROOT)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
errors, overlaps, fails = [], [], []
STRINGS = json.loads((ROOT / 'content/strings.json').read_text(encoding='utf-8'))

def check(cond, msg):
    if not cond: fails.append(msg); print('FAIL', msg)

OVERLAP_JS = '''() => {
  const p = document.querySelector('#popo'); if (!p || p.classList.contains('away')) return [];
  let L = 1e9, T = 1e9, R = -1e9, B = -1e9;
  p.querySelectorAll('.body svg circle, .body svg rect, .body svg path, .body svg ellipse').forEach(e => {
    const r = e.getBoundingClientRect(); if (!r.width) return;
    L = Math.min(L, r.left); T = Math.min(T, r.top); R = Math.max(R, r.right); B = Math.max(B, r.bottom); });
  const hits = [];
  document.querySelectorAll('#screen .opt, #screen button, #screen .card, #screen .tap, #screen .mb, #screen .station, #screen .mcard-m, #screen .ws-c, #screen .chip, #screen .money, #overlay button, #overlay .card').forEach(e => {
    const r = e.getBoundingClientRect(); if (!r.width) return;
    const ox = Math.min(R, r.right) - Math.max(L, r.left), oy = Math.min(B, r.bottom) - Math.max(T, r.top);
    if (ox > 2 && oy > 2) hits.push((e.className.baseVal ?? e.className) + ' ' + Math.round(ox) + 'x' + Math.round(oy)); });
  return hits; }'''

SOLVE_JS = '''() => { const b = document.querySelector('.gbody'); if (!b || b.classList.contains('done')) return 'busy';
  if (b._solve) { b._solve(); return 'solve'; }
  const o = b.querySelector('.opt[data-ok="1"]'); if (o) { o.click(); return 'opt'; } return 'none'; }'''

try:
    with sync_playwright() as p:
        br = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        ctx = br.new_context(viewport={'width': 1920, 'height': 1080})
        pg = ctx.new_page()
        pg.on('console', lambda m: m.type in ('error', 'warning') and errors.append(f'{m.type}: {m.text}'))
        pg.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
        pg.on('requestfailed', lambda r: 'ERR_ABORTED' not in (r.failure or '') and errors.append(f'requestfailed: {r.url} {r.failure}'))
        pg.on('response', lambda r: r.status >= 400 and errors.append(f'HTTP {r.status}: {r.url}'))
        js = pg.evaluate

        # ---- v1 -> v2 migration: old saves had sticker counts and single rounds ----
        pg.goto('http://localhost:8765/tools/'); pg.wait_for_timeout(200)  # same origin, without the game's own saving
        js("""localStorage.clear(); localStorage.setItem('gan-mishakim-v1', JSON.stringify({profiles:{hodaya:{stars:21,stickers:5,newSticker:false,
              games:{math:{best:3,rounds:4,won:3}},settings:{difficulty:'medium',limit:0,sound:true}}}}))""")
        pg.goto('http://localhost:8765/'); pg.wait_for_timeout(1000)
        mig = js("({st: Store.child('hodaya').stickers, lvl: Store.game('hodaya','math').level, s3: Store.game('hodaya','math').stars[3], diff: Store.child('hodaya').settings.difficulty, stars: Store.child('hodaya').stars})")
        check(mig['st'] == ['lion', 'rocket', 'apple', 'car', 'elephant'] and mig['lvl'] == 4 and mig['s3'] == 3 and mig['diff'] == 'auto' and mig['stars'] == 21, f'migration {mig}')
        pg.goto('http://localhost:8765/tools/'); js("localStorage.clear()"); pg.goto('http://localhost:8765/'); pg.wait_for_timeout(1200)
        # record every spoken clip
        js("window.__said = new Set(); const _s = Voice.say; Voice.say = function (ids, o) { [].concat(ids).filter(Boolean).forEach((i) => __said.add(i)); return _s.call(this, ids, o); }")

        def shot(n, ms=700):
            pg.wait_for_timeout(ms); pg.screenshot(path=str(OUT / f'{n}.png'))
            hits = js(OVERLAP_JS)
            if hits: overlaps.append(f'{n}: {hits}')

        def play_out(timeout=60):
            t0 = time.time()
            while time.time() - t0 < timeout:
                if js("App.screen") == 'result': return True
                js(SOLVE_JS); pg.wait_for_timeout(250)
            return False

        shot('01_profiles')
        pg.click('.profile.hodaya'); shot('02_map_hodaya_p1')
        js("App.map(1)"); shot('02_map_hodaya_p2')
        js("App.selectChild('matan')"); shot('03_map_matan_p1')
        js("App.map(1)"); shot('03_map_matan_p2'); js("App.map(2)"); shot('03_map_matan_p3')

        # ---- every game at several difficulties ----
        for kid in ['hodaya', 'matan']:
            js(f"App.selectChild('{kid}')")
            for g in js(f"KIDS.{kid}.games"):
                for d in [0, 3, 6, 9]:
                    n = js(f"GAMES['{g}'].per")
                    js(f"Round.run({{kind:'level',gid:'{g}',level:{1 + d * 3},champ:false,seed:{d * 31 + 7},items:Array.from({{length:{n}}},()=>({{gid:'{g}',d:{d}}}))}})")
                    shot(f'g_{kid}_{g}_d{d}', 600)
                    # a couple more questions of the same level (interactive kinds appear later in a level)
                    for q in range(min(n, 3) - 1):
                        js(SOLVE_JS); pg.wait_for_timeout(1900)
                        shot(f'g_{kid}_{g}_d{d}_q{q + 2}', 300)

        # ---- seeded: same level, same questions ----
        same = js("""(() => { const a = Levels.plan('hodaya','math',7), b = Levels.plan('hodaya','math',7);
          const gen = (pl) => { RNG.seed(pl.seed); const q = GAMES.math.make(pl.items[0].d, 0, {}); RNG.free(); return q.html; };
          return gen(a) === gen(b) && a.seed === b.seed; })()""")
        check(same, 'seeded level not identical')

        # ---- play full levels of every game ----
        for kid in ['hodaya', 'matan']:
            js(f"App.selectChild('{kid}')")
            for g in js(f"KIDS.{kid}.games"):
                js(f"Levels.path('{g}')"); pg.wait_for_timeout(300)
                pg.click('.station.current', force=True)
                ok = play_out()
                check(ok, f'{kid}/{g}: level 1 did not finish')
                lv = js(f"Store.game('{kid}','{g}').level"); st = js(f"Store.game('{kid}','{g}').stars[1]")
                check(lv == 2 and st == 3, f'{kid}/{g}: level {lv} stars {st}')
        shot('04_result', 3800)
        check(len(js("Store.child('hodaya').stickers")) >= 9, 'stickers not awarded')

        # ---- adaptive difficulty ----
        adj = js("""(() => { const gs = Store.game('hodaya','pattern'); const a0 = gs.adj;
          Levels.finishLevel('hodaya','pattern',2,3); Levels.finishLevel('hodaya','pattern',3,3); const up = gs.adj;
          Levels.finishLevel('hodaya','pattern',4,1); Levels.finishLevel('hodaya','pattern',5,1); return [a0, up, gs.adj]; })()""")
        check(adj[1] > adj[0] and adj[2] < adj[1], f'adaptive {adj}')

        # ---- champion level 10 + level path pages/worlds ----
        js("App.selectChild('hodaya'); const gs = Store.game('hodaya','math'); for (let l = 1; l < 10; l++) gs.stars[l] = 1 + l % 3; gs.level = 10; Store.save()")
        js("Levels.path('math')"); shot('05_path_math_champ', 900)
        pg.click('.station.champ.current', force=True); pg.wait_for_timeout(600); shot('05_game_champion', 500)
        check(play_out(), 'champion level did not finish')
        shot('05_result_champion', 4200)
        check(any(s.startswith('gold_') for s in js("Store.child('hodaya').stickers")), 'no gold sticker for champion level')
        for w in range(7):
            js(f"const gs = Store.game('hodaya','zoo'); gs.level = {w * 20 + 5}; Levels.path('zoo')"); shot(f'06_path_world{w}', 600)
        js("Store.game('hodaya','zoo').level = 2; Store.save()")

        # ---- daily challenge ----
        js("App.map()"); pg.wait_for_timeout(300); pg.click('.mb.daily', force=True); pg.wait_for_timeout(2200)
        check(js("App.round && App.round.plan.kind") == 'daily', 'daily did not start'); shot('07_daily', 300)
        check(play_out(), 'daily did not finish'); shot('07_daily_result', 3000)
        check(js("Levels.dailyDone('hodaya')"), 'daily not recorded')

        # ---- album, wardrobe ----
        for k in range(6): js(f"App.album({k})"); shot(f'08_album_{k}', 500)
        js("Store.child('hodaya').stars += 100; Store.save(); App.wardrobe('hat')"); shot('09_wardrobe_hat', 500)
        before = js("Store.wallet('hodaya')")
        pg.click('.wr-item >> nth=0', force=True); pg.wait_for_timeout(400)
        check(js("Store.wallet('hodaya')") < before and js("Store.child('hodaya').outfit.hat") is not None, 'wardrobe purchase failed')
        for k in ['glasses', 'cape', 'color']:
            js(f"App.wardrobe('{k}')"); pg.click('.wr-item >> nth=0', force=True); shot(f'09_wardrobe_{k}', 500)
        js("App.map()"); shot('09_map_dressed_popo', 500)

        # ---- drawing ----
        js("Draw.home()"); shot('10_draw_home')
        js("Draw.pages()"); shot('10_draw_pages')
        check(js("document.querySelectorAll('.cp.locked').length") > 0, 'no locked coloring pages')
        js("Draw.editor({page: COLORING[0].id})"); pg.wait_for_timeout(800)
        box = pg.locator('.canvas-wrap canvas.paint').bounding_box()
        pg.click('.tool[data-tool="fill"]'); pg.click('.sw >> nth=3')
        pg.mouse.click(box['x'] + box['width'] * .5, box['y'] + box['height'] * .1)  # sky region
        pg.click('.tool[data-tool="crayon"]'); pg.click('.sw >> nth=7')
        pg.mouse.move(box['x'] + 100, box['y'] + 600); pg.mouse.down()
        for i in range(30): pg.mouse.move(box['x'] + 100 + i * 15, box['y'] + 600 - i * 6)
        pg.mouse.up()
        pg.click('.tool[data-tool="stamp"]'); pg.wait_for_timeout(300); shot('10_draw_stamps', 300)
        pg.click('#overlay .stamp >> nth=0', force=True); pg.mouse.click(box['x'] + 900, box['y'] + 500); pg.wait_for_timeout(400)
        painted = js("""(() => { const c = document.querySelector('canvas.paint').getContext('2d'); const d = c.getImageData(0,0,1200,840).data;
          let n = 0; for (let i = 0; i < d.length; i += 4 * 97) if (d[i] < 250 || d[i+1] < 250 || d[i+2] < 250) n++; return n; })()""")
        check(painted > 500, f'canvas not painted ({painted})')
        shot('10_draw_coloring', 300)
        pg.click('.save-btn'); pg.wait_for_timeout(800)
        js("Draw.editor({})"); pg.wait_for_timeout(500)
        for tool, sw in [('marker', 0), ('spray', 9), ('crayon', 4)]:
            pg.click(f'.tool[data-tool="{tool}"]'); pg.click(f'.sw >> nth={sw}')
            y = 200 + sw * 30
            pg.mouse.move(box['x'] + 150, box['y'] + y); pg.mouse.down()
            for i in range(40): pg.mouse.move(box['x'] + 150 + i * 22, box['y'] + y + (i % 10) * 8)
            pg.mouse.up()
        pg.click('.tool[data-tool="fill"]'); pg.click('.sw >> nth=2'); pg.mouse.click(box['x'] + 1100, box['y'] + 780)
        shot('10_draw_free', 300)
        pg.click('.tool[data-tool="undo"]'); pg.wait_for_timeout(200)
        pg.click('.save-btn'); pg.wait_for_timeout(800)
        js("Draw.gallery()"); pg.wait_for_timeout(800); shot('10_draw_gallery', 300)
        check(js("document.querySelectorAll('.gal').length") == 2, 'gallery should have 2 drawings')
        pg.click('.gal >> nth=0', force=True); pg.wait_for_timeout(1000)
        check(js("App.screen") == 'draw-ed', 'gallery drawing did not open')
        js("Draw.gallery()"); pg.wait_for_timeout(600)
        pg.click('.gal-del >> nth=0', force=True); pg.wait_for_timeout(300); shot('10_draw_delete_confirm', 200)
        pg.click('#overlay [data-c="yes"]'); pg.wait_for_timeout(800)
        check(js("document.querySelectorAll('.gal').length") == 1, 'delete did not remove a drawing')
        js("App.selectChild('matan'); Draw.editor({})"); shot('10_draw_matan_simple', 500)

        # ---- parents, rest, full-screen ----
        js("App.parentGate()"); shot('11_gate')
        js("App.closeOverlay(); App.parents()"); shot('11_parents')
        check('1.1.0' in js("document.querySelector('.version').textContent"), 'version not shown')
        js("Store.child('matan').settings.limit=15; Store.child('matan').time.secs=999; App.selectChild('matan')"); shot('12_rest')
        js("Store.child('matan').settings.limit=0; App.selectChild('hodaya'); App.userExit=false; document.fullscreenElement ? document.exitFullscreen() : App.onFullscreenChange()"); shot('13_fs_return', 500)
        check(js("document.querySelector('#overlay [data-fs]') !== null"), 'fullscreen-return button missing')
        js("App.closeOverlay()")

        # ---- audio: every clip said at runtime exists; every clip decodes ----
        said = js("[...__said]")
        missing = [i for i in said if i not in STRINGS]
        check(not missing, f'spoken ids without audio: {missing}')
        print(f'spoken during test: {len(said)} distinct clips')
        bad = js("""async (ids) => { const ctx = new OfflineAudioContext(1, 44100, 44100); const bad = [];
            for (const id of ids) { try { const r = await fetch('audio/' + id + '.mp3'); if (!r.ok) throw r.status;
              const buf = await ctx.decodeAudioData(await r.arrayBuffer()); if (buf.duration < .2) throw 'short'; } catch (e) { bad.push(id + ':' + e); } }
            return bad; }""", list(STRINGS))
        print(f'audio: {len(STRINGS) - len(bad)}/{len(STRINGS)} ok', bad or '')
        check(not bad, 'audio decode failures')
        br.close()
finally:
    srv.terminate()
print('popo overlaps:', len(overlaps))
for o in overlaps: print('  ', o)
print('console/page errors:', len(errors))
for e in errors[:40]: print('  ', e)
print('failed checks:', len(fails))
for f in fails: print('  ', f)
print('screenshots in', OUT, len(list(OUT.glob('*.png'))))
sys.exit(1 if fails or errors else 0)
