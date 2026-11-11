"""Inline the flikk logo (split into animatable parts) into index.html.

Reads the official path data from the brand kit (CIBI/brand-kit-v2/01-logos)
and replaces the blocks between <!--LOGO:name--> ... <!--/LOGO:name-->
(or a bare <!--LOGO:name--> marker) in index.html. Safe to re-run.

    python3 website/tools/inject_logo.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KIT = ROOT.parent / "CIBI" / "brand-kit-v2" / "01-logos"
HTML = ROOT / "index.html"


def subpaths(name):
    s = (KIT / name).read_text()
    d = re.search(r' d="([^"]*)"', s).group(1)
    return [x.strip() + " Z" for x in d.split("Z") if x.strip()]


g = subpaths("flikk-games-primary-cobalt.svg")
st = subpaths("flikk-studio-primary-cobalt.svg")

SPARK, EYE_L, EYE_R = g[0], g[4], g[5]
LETTERS = [g[1], g[3], g[7], g[6], g[2]]  # f, l, i(stem), k, k
GAMES = [g[8] + " " + g[14], g[9] + " " + g[15], g[12], g[10] + " " + g[13], g[11]]
STUDIO = [st[11], st[10], st[12], st[9] + " " + st[15], st[14] + " " + st[8], st[13] + " " + st[16]]


def spark_group(cls):
    return (
        f'<g class="{cls}"><g class="spark-bob">'
        f'<path class="spark-body" d="{SPARK}"/>'
        f'<g class="spark-eyes"><path d="{EYE_L}"/><path d="{EYE_R}"/></g>'
        f"</g></g>"
    )


def letters(cls):
    return "".join(
        f'<path class="{cls}" style="--i:{i}" d="{d}"/>' for i, d in enumerate(LETTERS)
    )


def sub(name, parts):
    inner = "".join(f'<path style="--i:{i}" d="{d}"/>' for i, d in enumerate(parts))
    return f'<g class="lg-sub sub-{name}">{inner}</g>'


blocks = {
    "SPARK_SYMBOL": (
        '<symbol id="spark" viewBox="775 38 214 200">'
        f'<path class="sym-body" d="{SPARK}"/>'
        f'<path class="sym-eye" d="{EYE_L}"/><path class="sym-eye" d="{EYE_R}"/>'
        "</symbol>"
    ),
    "LOGO:hero": (
        '<svg class="hero-logo" viewBox="180 20 1610 790" role="img" aria-label="flikk games / flikk studio">'
        f'<g class="lg-letters">{letters("lt")}</g>'
        f'{spark_group("lg-spark")}'
        f'{sub("games", GAMES)}{sub("studio", STUDIO)}'
        "</svg>"
    ),
    "LOGO:footer": (
        '<svg class="foot-logo" viewBox="180 20 1610 620">'
        f'{letters("fl")}{spark_group("fl-spark")}'
        "</svg>"
    ),
}

html = HTML.read_text()
for key, content in blocks.items():
    pat = re.compile(rf"<!--{re.escape(key)}-->(.*?<!--/{re.escape(key)}-->)?", re.S)
    html, n = pat.subn(lambda m: f"<!--{key}-->{content}<!--/{key}-->", html)
    assert n == 1, f"marker {key} found {n} times"
HTML.write_text(html)
print("injected", ", ".join(blocks))
