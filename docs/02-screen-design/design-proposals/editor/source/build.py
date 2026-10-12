"""Build ../<ID>.html (= editor/<ID>.html) from skeleton.html + themes/<ID>.css.
Theme CSS header (required, first lines):
/* name: <コンセプト名> */
/* fonts: https://fonts.googleapis.com/css2?family=...&display=swap */
Usage: python3 build.py [ID ...]   (no args = all themes)"""
import os, re, sys, glob
here = os.path.dirname(os.path.abspath(__file__))
sk = open(os.path.join(here, 'skeleton.html'), encoding='utf-8').read()
ids = sys.argv[1:] or [os.path.basename(p)[:-4] for p in sorted(glob.glob(os.path.join(here, 'themes', '*.css')))]
for i in ids:
    css = open(os.path.join(here, 'themes', i + '.css'), encoding='utf-8').read()
    name = (re.search(r'/\*\s*name:\s*(.*?)\s*\*/', css) or [None, ''])[1]
    fonts = (re.search(r'/\*\s*fonts:\s*(\S+)\s*\*/', css) or [None, ''])[1]
    link = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
            f'<link rel="stylesheet" href="{fonts}">') if fonts else ''
    out = (sk.replace('{{THEME_ID}}', i).replace('{{THEME_NAME}}', name)
             .replace('<!--FONTS-->', link).replace('/*THEME_CSS*/', css))
    open(os.path.join(here, '..', i + '.html'), 'w', encoding='utf-8').write(out)
    print('built', i, name)
