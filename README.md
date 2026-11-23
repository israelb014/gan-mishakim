# גן משחקים

Hebrew educational games for two kids, PC full-screen. Vanilla HTML/CSS/JS, no build step, works offline.

- **Play:** https://israelb014.github.io/gan-mishakim/
- **[הורדה למחשב](https://github.com/israelb014/gan-mishakim/releases/latest/download/gan-mishakim-setup.exe)** — Windows program (works offline, always full-screen; exit via "יציאה" in the parents corner).
- **[הורדה ללינוקס](https://github.com/israelb014/gan-mishakim/releases/latest/download/gan-mishakim_amd64.deb)** — `.deb` for Linux Mint 22 / Ubuntu 24.04 (x64): `sudo apt install ./gan-mishakim_amd64.deb`, then open "גן משחקים" from the menu.
- **Kiosk (Windows):** double-click `start-kiosk.bat` (Edge, full-screen kiosk). Exit with Alt+F4.
- **Parents corner:** press and hold the lock icon (top-left) for 3 seconds, then solve the sum.

## Development
```
python -m http.server 8000            # then open http://localhost:8000
python tools/make_strings.py          # rebuild content/strings.json (all spoken text)
pip install edge-tts && python tools/gen_audio.py   # generate missing audio/<id>.mp3
python tools/update_sw.py             # refresh the offline cache list in sw.js after changing files
pip install playwright && python tools/check.py     # screenshots of every screen + error/audio checks
```
### Desktop program (`desktop/`)
Electron wrapper around the same web files: `desktop/scripts/copy-web.js` copies the game from the repo root into the app at build time, so every change to the games ships to both the website and the program.
```
cd desktop && npm ci
npm start        # run locally
npm run dist        # build desktop/dist/gan-mishakim-setup.exe (on Windows)
npm run dist:linux  # build desktop/dist/gan-mishakim_amd64.deb (on Linux)
python tools/make_icon.py   # regenerate desktop/build/icon.ico + icons/16..512 PNGs from Popo's SVG
```
Release: push a tag like `v1.0.2`; GitHub Actions builds the Windows installer and the Linux .deb and attaches both to the release.

The mockups in `design/` are reference only; the app doesn't use them.
