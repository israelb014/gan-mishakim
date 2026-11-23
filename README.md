# גן משחקים

Hebrew educational games for two kids, PC full-screen. Vanilla HTML/CSS/JS, no build step, works offline.

- **Play:** https://israelb014.github.io/gan-mishakim/
- **[הורדה למחשב](https://github.com/israelb014/gan-mishakim/releases/latest/download/gan-mishakim-setup.exe)** — Windows program (works offline, always full-screen; exit via "יציאה" in the parents corner). It updates itself silently in the background.
- **[הורדה ללינוקס](https://github.com/israelb014/gan-mishakim/releases/latest/download/gan-mishakim_amd64.deb)** — `.deb` for Linux Mint 22 / Ubuntu 24.04 (x64). For automatic updates through the Update Manager, add the APT repository instead (below).
- **Kiosk (Windows):** double-click `start-kiosk.bat` (Edge, full-screen kiosk). Exit with Alt+F4.
- **Parents corner:** press and hold the lock icon (top-left) for 3 seconds, then solve the sum.

### Linux Mint: install from the APT repository (updates arrive in the Update Manager)
```
sudo install -d -m 0755 /etc/apt/keyrings
wget -qO- https://israelb014.github.io/gan-mishakim/apt/gan-mishakim.gpg | sudo tee /etc/apt/keyrings/gan-mishakim.gpg > /dev/null
echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/gan-mishakim.gpg] https://israelb014.github.io/gan-mishakim/apt stable main" | sudo tee /etc/apt/sources.list.d/gan-mishakim.list
sudo apt update
sudo apt install gan-mishakim
```

## What's inside
- **Hodaya (8):** math bubbles, missing letter → spelling, English (animals, colours, numbers, food, body, family), clock (read & set the hands), memory, word search, sentence order, shop & shekels, patterns.
- **Matan (5, voice only):** find the letter, counting, colours, shapes, whose shadow, big & small, little memory.
- **Endless levels:** every game has a winding level path. Levels are generated from a seed (a level replays identically), get harder with the level number and adapt: two 3-star levels in a row → harder, two 1-star → easier. The parents' difficulty setting is the starting point (default "אוטומטי"). A new world every 20 levels (יער, ים, חלל, מדבר, שלג, ממתקים, then again in new colours); every 10th level is a golden "שלב אלוף".
- **Daily challenge** (5 mixed questions, gold sticker), **120 stickers** in six album pages, **Popo's wardrobe** bought with stars.
- **הציור שלי:** free drawing (marker, crayon, spray, eraser, fill, sticker stamps, undo), 30 coloring pages that unlock with stars, and a gallery per child (IndexedDB on the web; on the desktop also a PNG copy in Pictures/גן משחקים).

## Development
```
python -m http.server 8000            # then open http://localhost:8000
python tools/make_strings.py          # rebuild content/strings.json (all spoken text) + js/content.js
pip install edge-tts && python tools/gen_audio.py   # generate missing audio/<id>.mp3
python tools/update_sw.py             # optional, for local testing: the deploy stamps sw.js with the commit hash on every push
pip install playwright && python tools/check.py     # plays every game, screenshots, error/audio checks
```
### Desktop program (`desktop/`)
Electron wrapper. When online it loads the live site, so game updates arrive without reinstalling; offline it uses the site's service-worker cache, or the copy bundled at build time (`desktop/scripts/copy-web.js`). Progress and drawings are kept by the app itself (preload bridge), so they're the same in every mode; progress saved by v1.0.x is migrated on first start.
```
cd desktop && npm ci
npm start           # run locally (GAN_SITE=http://localhost:8000/ to test against a local server, GAN_OFFLINE=1 for the bundled copy)
npm run dist        # build desktop/dist/gan-mishakim-setup.exe (on Windows)
npm run dist:linux  # build desktop/dist/gan-mishakim_amd64.deb (on Linux)
python tools/make_icon.py   # regenerate desktop/build/icon.ico + icons/16..512 PNGs from Popo's SVG
```
**Release:** push a tag like `v1.1.1`. GitHub Actions builds the Windows installer (+ `latest.yml` for the self-updater) and the Linux .deb, attaches them to the release, then rebuilds GitHub Pages, which publishes the website together with the signed APT repository (`tools/build_apt.sh`, key in the `APT_GPG_PRIVATE_KEY` secret, public key in `packaging/apt/`).

The mockups in `design/` are reference only; the app doesn't use them.
