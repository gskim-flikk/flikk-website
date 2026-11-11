"""Build the 1200x630 Open Graph image (assets/og-image.png).

Generates tools/og/og.html from the official brand-kit paths, then renders it
with headless Chrome. The page must be served over http so web fonts load:

    python3 -m http.server 4173 --directory website   # in another shell
    python3 website/tools/og/build_og.py
"""
import re
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
KIT = ROOT.parent / "CIBI" / "brand-kit-v2" / "01-logos"
OUT = ROOT / "assets" / "og-image.png"
URL = "http://localhost:4173/tools/og/og.html"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


def subpaths(name):
    d = re.search(r' d="([^"]*)"', (KIT / name).read_text()).group(1)
    return [x.strip() + " Z" for x in d.split("Z") if x.strip()]


g = subpaths("flikk-games-primary-cobalt.svg")
SPARK, EYE_L, EYE_R = g[0], g[4], g[5]
LETTERS = [g[1], g[3], g[7], g[6], g[2]]


def spark(cls, body, eye, style=""):
    return (
        f'<svg class="{cls}" style="{style}" viewBox="775 38 214 200">'
        f'<path fill="{body}" d="{SPARK}"/>'
        f'<path fill="{eye}" d="{EYE_L}"/><path fill="{eye}" d="{EYE_R}"/></svg>'
    )


wordmark = (
    '<svg class="wordmark" viewBox="195 38 1575 590">'
    + "".join(f'<path fill="#F7F2E8" d="{d}"/>' for d in LETTERS)
    + f'<path fill="#F7F2E8" d="{SPARK}"/>'
    + f'<path fill="#2455E8" d="{EYE_L}"/><path fill="#2455E8" d="{EYE_R}"/>'
    + "</svg>"
)

html = f"""<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<style>
@font-face {{ font-family: Pretendard; src: url(../../assets/fonts/Pretendard-Bold.woff2); font-weight: 700; }}
@font-face {{ font-family: Nunito; src: url(../../assets/fonts/Nunito-Variable.woff2); font-weight: 200 1000; }}
html, body {{ margin: 0; }}
.card {{ position: relative; width: 1200px; height: 630px; overflow: hidden; background: #2455E8; color: #F7F2E8; font-family: Pretendard, sans-serif; }}
.copy {{ position: absolute; left: 84px; top: 92px; z-index: 3; }}
.wordmark {{ display: block; width: 470px; height: auto; }}
h1 {{ margin: 40px 0 0; font-size: 54px; line-height: 1.22; letter-spacing: -0.02em; font-weight: 700; }}
.chips {{ display: flex; gap: 12px; margin-top: 30px; }}
.chips span {{ padding: 10px 22px 12px; border-radius: 999px; background: #FFE58A; color: #2455E8; font: 800 26px/1 Nunito, sans-serif; }}
.chips span + span {{ background: #F7F2E8; }}
.url {{ position: absolute; left: 84px; bottom: 46px; z-index: 3; font: 800 24px/1 Nunito, sans-serif; opacity: .75; }}
.hill {{ position: absolute; bottom: -40px; border-radius: 50% 50% 0 0 / 100% 100% 0 0; }}
.h1 {{ right: -120px; width: 560px; height: 380px; background: #4C77F0; }}
.h2 {{ right: 160px; width: 480px; height: 250px; background: #9DB4F6; }}
.h3 {{ right: -60px; width: 420px; height: 190px; background: #1B44C8; }}
.sun {{ position: absolute; right: 250px; top: 120px; width: 150px; height: 150px; border-radius: 50%; background: #FFE58A; box-shadow: 0 0 0 26px rgba(255,229,138,.18); }}
.buddy {{ position: absolute; right: 150px; top: 196px; width: 190px; height: auto; transform: rotate(8deg); z-index: 2; }}
.rays {{ position: absolute; right: 112px; top: 168px; width: 60px; height: 60px; z-index: 2; }}
.rays i {{ position: absolute; left: 26px; bottom: 0; width: 9px; height: 26px; border-radius: 6px; background: #FFE58A; transform-origin: 50% 170%; }}
.rays i:nth-child(1) {{ transform: rotate(-38deg); }} .rays i:nth-child(3) {{ transform: rotate(38deg); }}
.s {{ position: absolute; height: auto; }}
</style></head><body><div class="card">
  <div class="sun"></div>
  <div class="hill h1"></div><div class="hill h2"></div><div class="hill h3"></div>
  {spark("buddy", "#F7F2E8", "#2455E8")}
  <div class="rays"><i></i><i></i><i></i></div>
  {spark("s", "#FFE58A", "#2455E8", "width:64px; right:470px; top:60px; transform:rotate(-14deg)")}
  {spark("s", "#9DB4F6", "#2455E8", "width:40px; right:60px; top:70px; transform:rotate(12deg)")}
  {spark("s", "#FFE58A", "#2455E8", "width:34px; right:560px; top:300px; transform:rotate(20deg)")}
  <div class="copy">
    {wordmark}
    <h1>작은 반짝임,<br>커다란 즐거움.</h1>
    <div class="chips"><span>flikk games</span><span>flikk studio</span></div>
  </div>
  <div class="url">flikk.cc</div>
</div></body></html>
"""
(HERE / "og.html").write_text(html)

subprocess.run(
    [CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
     "--force-device-scale-factor=1", "--window-size=1200,630",
     "--virtual-time-budget=4000", f"--screenshot={OUT}", URL],
    check=True, capture_output=True,
)
print("wrote", OUT)
