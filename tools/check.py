#!/usr/bin/env python3
"""Headless check: screenshot every screen/game, collect console errors, verify every MP3 loads+decodes,
play one full round. Usage: python tools/check.py  (serves the repo on :8765, writes shots/*.png)"""
import json, pathlib, subprocess, sys, time
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'shots'; OUT.mkdir(exist_ok=True)
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8765', '-d', str(ROOT)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
errors = []
try:
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        pg = b.new_page(viewport={'width': 1920, 'height': 1080})
        pg.on('console', lambda m: m.type in ('error', 'warning') and errors.append(f'{m.type}: {m.text}'))
        pg.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
        pg.on('requestfailed', lambda r: errors.append(f'requestfailed: {r.url}'))
        pg.on('response', lambda r: r.status >= 400 and errors.append(f'HTTP {r.status}: {r.url}'))
        pg.goto('http://localhost:8765/'); pg.wait_for_timeout(1200)
        shot = lambda n, ms=700: (pg.wait_for_timeout(ms), pg.screenshot(path=str(OUT / f'{n}.png')))
        js = pg.evaluate

        shot('01_profiles')
        pg.click('.profile.hodaya'); shot('02_map_hodaya')
        for g in ['math', 'word', 'zoo', 'clock']:
            js(f"Round.start('{g}')"); shot(f'g_{g}_medium')
        js("Store.child('hodaya').settings.difficulty='hard'; Round.start('zoo')"); shot('g_zoo_hard')
        js("Round.start('math')"); shot('g_math_hard')
        js("Round.start('clock')"); shot('g_clock_hard')
        js("Round.start('word')"); shot('g_word_hard')
        js("Store.child('hodaya').settings.difficulty='easy'; Round.start('zoo')"); shot('g_zoo_easy')
        js("Store.child('hodaya').settings.difficulty='medium'")
        # wrong + correct feedback states
        js("Round.start('math')"); pg.wait_for_timeout(500)
        pg.click('.opt[data-ok="0"] >> nth=0', force=True); shot('fb_wrong', 350)
        pg.click('.opt[data-ok="1"]', force=True); shot('fb_correct', 350)
        # full round: answer everything right
        js("Round.start('clock')")
        for i in range(10):
            pg.wait_for_selector('.gbody:not(.done) .opt[data-ok="1"]', timeout=8000)
            pg.click('.gbody:not(.done) .opt[data-ok="1"]', force=True)
            pg.wait_for_timeout(300)
        pg.wait_for_selector('.view.result', timeout=10000); shot('04_result', 4600)
        assert js("Store.game('hodaya','clock').best") == 3, 'round did not record 3 stars'
        assert js("Store.child('hodaya').stickers") >= 1, 'no sticker unlocked'
        js("App.map()"); shot('02b_map_hodaya_after')
        js("for(let i=0;i<7;i++) Store.child('hodaya').stickers=7; App.album()"); shot('05_album')
        # Matan
        js("App.selectChild('matan')"); shot('03_map_matan')
        js("Round.start('letter')"); shot('g_letter_medium')
        js("Store.child('matan').settings.difficulty='easy'; Round.start('letter')"); shot('g_letter_easy')
        for obj_i in range(5):
            js(f"Store.child('matan').settings.difficulty='{['medium','hard'][obj_i%2]}'; Round.start('count'); App.round.objStart=0;")
            js(f"(()=>{{const st=App.round; st.i={obj_i}; st.used.clear(); const q=GAMES.count.make(Store.child('matan').settings.difficulty,{obj_i},st); document.querySelector('.gbody').innerHTML=q.html; }})()")
            shot(f'g_count_{obj_i}')
        js("Store.child('matan').settings.difficulty='medium'")
        # parents
        js("App.parentGate()"); shot('06a_gate')
        js("App.closeOverlay(); App.parents()"); shot('06_parents')
        js("Store.child('matan').settings.limit=15; Store.child('matan').time.secs=999; App.selectChild('matan')"); shot('rest')
        js("Store.child('matan').settings.limit=0; App.profiles()")
        # fullscreen-return overlay (simulate leaving full-screen)
        js("App.selectChild('hodaya'); App.userExit=false; document.fullscreenElement ? document.exitFullscreen() : App.onFullscreenChange()"); shot('fs_return', 600)
        assert js("document.querySelector('#overlay [data-fs]') !== null"), 'fullscreen-return button missing'
        js("App.closeOverlay()")
        # audio: every clip must load and decode
        ids = list(json.loads((ROOT / 'content/strings.json').read_text(encoding='utf-8')).keys())
        bad = js("""async (ids) => { const ctx = new OfflineAudioContext(1, 44100, 44100); const bad = [];
            for (const id of ids) { try { const r = await fetch('audio/' + id + '.mp3'); if (!r.ok) throw r.status;
              const buf = await ctx.decodeAudioData(await r.arrayBuffer()); if (buf.duration < .2) throw 'short'; } catch (e) { bad.push(id + ':' + e); } }
            return bad; }""", ids)
        print(f'audio: {len(ids) - len(bad)}/{len(ids)} ok', bad or '')
        # every audio id referenced from code exists
        b.close()
finally:
    srv.terminate()
print('console/page errors:', len(errors))
for e in errors: print('  ', e)
print('screenshots in', OUT)
