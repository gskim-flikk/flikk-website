"""Subset the brand fonts to woff2 for the web (assets/fonts/*.woff2).

Sources live in tools/fonts/src. Pretendard keeps Latin, punctuation, the
2,350 common Hangul syllables (KS X 1001) and every character used in the
site, so new Korean copy keeps rendering. Nunito keeps Latin and punctuation.
Re-run after adding copy with rare Hangul syllables:

    pip install fonttools brotli
    python3 website/tools/fonts/build_fonts.py
"""
from pathlib import Path

from fontTools import subset

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
SRC = HERE / "src"
OUT = ROOT / "assets" / "fonts"

LATIN = set(range(0x20, 0x7F)) | set(range(0xA0, 0x100))
PUNCT = set(range(0x2010, 0x2070)) | {0x20A9, 0x2122, 0x2190, 0x2192, 0x2191, 0x2193, 0x2605, 0x2606, 0x00B7, 0x3001, 0x3002, 0x300C, 0x300D}
KSX = set()
for hi in range(0xB0, 0xC9):
    for lo in range(0xA1, 0xFF):
        try:
            KSX.add(ord(bytes([hi, lo]).decode("euc-kr")))
        except UnicodeDecodeError:
            pass
JAMO = set(range(0x3131, 0x318F))

used = set()
for name in ["index.html", "main.js", "styles.css"]:
    used |= {ord(c) for c in (ROOT / name).read_text()}
used = {c for c in used if c >= 0x20}


def build(src, dst, unicodes):
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["*"]
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    font = subset.load_font(str(SRC / src), opts)
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=sorted(unicodes))
    sub.subset(font)
    subset.save_font(font, str(OUT / dst), opts)
    print(f"{dst}: {(OUT / dst).stat().st_size / 1024:.0f} KB")


ko = LATIN | PUNCT | KSX | JAMO | used
build("Pretendard-Regular.otf", "Pretendard-Regular.woff2", ko)
build("Pretendard-Bold.otf", "Pretendard-Bold.woff2", ko)
build("Nunito-Variable.ttf", "Nunito-Variable.woff2", LATIN | PUNCT | {c for c in used if c < 0x1100})
