#!/usr/bin/env python3
"""Rewrite the precache list + version in sw.js from the files on disk. Run after changing any asset."""
import hashlib, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parent.parent
files = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'content/strings.json']
for d, pat in [('css', '*.css'), ('js', '*.js'), ('fonts', '*.woff2'), ('audio', '*.mp3')]:
    files += sorted(f'{d}/{p.name}' for p in (ROOT / d).glob(pat))
h = hashlib.sha1()
for f in files[1:]:
    h.update((ROOT / f).read_bytes())
sw = (ROOT / 'sw.js').read_text(encoding='utf-8')
sw = re.sub(r"const VERSION = '[^']*';", f"const VERSION = '{h.hexdigest()[:10]}';", sw)
sw = re.sub(r"const ASSETS = \[[^\]]*\];", 'const ASSETS = [\n' + ',\n'.join(f"  '{f}'" for f in files) + '\n];', sw, flags=re.S)
(ROOT / 'sw.js').write_text(sw, encoding='utf-8')
print(len(files), 'assets, version', h.hexdigest()[:10])
