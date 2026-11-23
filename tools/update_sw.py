#!/usr/bin/env python3
"""Rewrite the precache list and the version in sw.js.

  tools/update_sw.py            # version = hash of the files (local testing)
  tools/update_sw.py <version>  # e.g. the commit hash; the Pages workflow does this on every push to main

The deploy workflow always runs it, so the committed sw.js only needs to be refreshed by hand when testing locally."""
import hashlib, pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
files = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg']
for d, pat in [('content', '*.json'), ('css', '*.css'), ('js', '*.js'), ('fonts', '*.woff2'), ('audio', '*.mp3')]:
    files += sorted(f'{d}/{p.name}' for p in (ROOT / d).glob(pat))
if len(sys.argv) > 1:
    version = re.sub(r'[^\w.-]', '', sys.argv[1])[:12]
else:
    h = hashlib.sha1()
    for f in files[1:]:
        h.update((ROOT / f).read_bytes())
    version = h.hexdigest()[:10]
sw = (ROOT / 'sw.js').read_text(encoding='utf-8')
sw = re.sub(r"const VERSION = '[^']*';", f"const VERSION = '{version}';", sw)
sw = re.sub(r"const ASSETS = \[[^\]]*\];", 'const ASSETS = [\n' + ',\n'.join(f"  '{f}'" for f in files) + '\n];', sw, flags=re.S)
(ROOT / 'sw.js').write_text(sw, encoding='utf-8')
print(len(files), 'assets, version', version)
