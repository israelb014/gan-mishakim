# גן משחקים

Hebrew educational games for two kids, PC full-screen. Vanilla HTML/CSS/JS, no build step, works offline.

- **Play:** https://israelb014.github.io/gan-mishakim/
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
The mockups in `design/` are reference only; the app doesn't use them.
