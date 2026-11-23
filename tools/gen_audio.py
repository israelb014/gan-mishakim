#!/usr/bin/env python3
"""Generate voice MP3s for every string in content/strings.json using edge-tts.

  pip install edge-tts
  python tools/gen_audio.py            # only missing files
  python tools/gen_audio.py --force    # regenerate everything

Hebrew -> he-IL-HilaNeural, English -> en-US-AnaNeural.
An entry may carry "say" (e.g. with niqqud) which is spoken instead of "text".
"""
import asyncio, json, pathlib, sys
import edge_tts

ROOT = pathlib.Path(__file__).resolve().parent.parent
VOICES = {"he": "he-IL-HilaNeural", "en": "en-US-AnaNeural"}
RATE = {"he": "-8%", "en": "-15%"}

async def one(sem, key, entry, out, force):
    path = out / f"{key}.mp3"
    if path.exists() and path.stat().st_size > 0 and not force:
        return False
    lang = entry.get("lang", "he")
    text = entry.get("say") or entry["text"]
    async with sem:
        for attempt in range(4):
            try:
                await edge_tts.Communicate(text, VOICES[lang], rate=RATE[lang]).save(str(path))
                return True
            except Exception as e:  # network hiccups
                if attempt == 3:
                    raise
                await asyncio.sleep(2 + attempt * 2)

async def main():
    force = "--force" in sys.argv
    strings = json.loads((ROOT / "content" / "strings.json").read_text(encoding="utf-8"))
    out = ROOT / "audio"
    out.mkdir(exist_ok=True)
    sem = asyncio.Semaphore(6)
    made = await asyncio.gather(*(one(sem, k, v, out, force) for k, v in strings.items()))
    print(f"{sum(made)} generated, {len(made) - sum(made)} already present, {len(made)} total")

asyncio.run(main())
