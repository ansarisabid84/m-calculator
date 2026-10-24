#!/usr/bin/env python3
"""
make_preview.py — Capture Google Play Store assets from the Vite dev server.

Output:
    screenshots/
        feature_graphic/feature_graphic.png   (1024 × 500)
        phone/                                 (1080 × 1920 — 9:16)
        tablet_7inch/                          (1080 × 1920 — 9:16)
        tablet_10inch/                         (1080 × 1920 — 9:16, both sides ≥ 1080)

Requirements:
    pip install playwright && playwright install chromium

Usage (from project root):
    python resources/make_preview.py
"""

import subprocess
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

# ── config ────────────────────────────────────────────────────────────────────

ROOT    = Path(__file__).parent.parent.resolve()
DEV_URL = "http://localhost:5173"

# Tabs to capture per device (slug, aria-label on the nav button)
TABS = [
    ("01_calc",       "Calc"),
    ("02_scientific", "Science"),
    ("03_convert",    "Convert"),
    ("04_health",     "Health"),
    ("05_tools",      "Tools"),
]

# Each device config produces its output dimensions via viewport × dpr.
# All three screenshot sizes come out to 1080 × 1920 px (9:16 portrait).
DEVICES = [
    {
        "dir":      "phone",
        "label":    "Phone (1080 × 1920)",
        "viewport": {"width": 540,  "height": 960},
        "dpr":      2,     # 540×2=1080, 960×2=1920
    },
    {
        "dir":      "tablet_7inch",
        "label":    "7-inch tablet (1080 × 1920)",
        "viewport": {"width": 720,  "height": 1280},
        "dpr":      1.5,   # 720×1.5=1080, 1280×1.5=1920
    },
    {
        "dir":      "tablet_10inch",
        "label":    "10-inch tablet (1080 × 1920)",
        "viewport": {"width": 1080, "height": 1920},
        "dpr":      1,     # full-size; both sides ≥ 1080 px ✓
    },
]

# ── feature-graphic HTML (1024 × 500) ─────────────────────────────────────────
# Rendered once by Playwright; no dev server needed for this asset.

FEATURE_GRAPHIC_HTML = """\
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500&family=IBM+Plex+Mono&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 1024px; height: 500px;
  background: linear-gradient(135deg, #0d0e12 0%, #121317 55%, #15171c 100%);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 80px; overflow: hidden; position: relative;
}
.glow {
  position: absolute; width: 640px; height: 640px;
  background: radial-gradient(circle, rgba(244,169,50,0.13) 0%, transparent 65%);
  top: -120px; right: 120px; pointer-events: none;
}
.text { display: flex; flex-direction: column; gap: 20px; }
.eyebrow {
  font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase;
  color: #f4a932; font-family: 'IBM Plex Mono', monospace;
}
h1 {
  font-size: 86px; font-weight: 700; color: #f3f2ee; line-height: 1;
  letter-spacing: -0.03em; font-family: 'Space Grotesk', system-ui, sans-serif;
}
h1 .dot { color: #f4a932; }
.sub {
  font-size: 17px; color: #a4a8b3; line-height: 1.55;
  font-family: 'Inter', system-ui, sans-serif;
}
/* Decorative keypad — 4 cols × 4 rows + wide = key */
.keys {
  display: grid; grid-template-columns: repeat(4, 72px); gap: 10px;
  transform: perspective(700px) rotateY(-12deg) rotateX(6deg);
  flex-shrink: 0;
}
.k {
  height: 72px; border-radius: 16px; background: #21242c;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 500; color: #f3f2ee;
  font-family: 'Inter', system-ui, sans-serif;
  box-shadow: 0 1px 0 rgba(0,0,0,0.5),
              inset 0 1px 0 rgba(255,255,255,0.04),
              0 6px 18px rgba(0,0,0,0.55);
}
.k.fn     { color: #a4a8b3; background: #1b1d24; }
.k.danger { color: #f06a5a; background: #1b1d24; }
.k.op     { color: #5cc2ad; background: #1a2724; }
.k.eq     {
  grid-column: span 2; font-size: 26px;
  color: #1a1205; background: #f4a932;
  box-shadow: 0 0 30px rgba(244,169,50,0.35), 0 1px 0 rgba(0,0,0,0.2);
}
</style>
</head>
<body>
<div class="glow"></div>
<div class="text">
  <div class="eyebrow">Precision Calculator</div>
  <h1>Calc<span class="dot">.</span></h1>
  <div class="sub">Scientific · Convert · Health<br>Everything you need to compute.</div>
</div>
<div class="keys">
  <div class="k danger">AC</div><div class="k fn">⌫</div><div class="k fn">%</div><div class="k op">÷</div>
  <div class="k">7</div><div class="k">8</div><div class="k">9</div><div class="k op">×</div>
  <div class="k">4</div><div class="k">5</div><div class="k">6</div><div class="k op">−</div>
  <div class="k">1</div><div class="k">2</div><div class="k">3</div><div class="k op">+</div>
  <div class="k">0</div><div class="k fn">.</div><div class="k eq">=</div>
</div>
</body>
</html>"""

# ── helpers ───────────────────────────────────────────────────────────────────

def _wait_for_server(url: str, timeout: int = 30) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            urllib.request.urlopen(url, timeout=1)
            return
        except Exception:
            time.sleep(0.3)
    raise RuntimeError(f"Dev server did not start at {url} within {timeout}s")


def _start_dev_server() -> subprocess.Popen:
    proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    print("Waiting for Vite dev server …", flush=True)
    _wait_for_server(DEV_URL)
    print(f"Server ready at {DEV_URL}\n")
    return proc


def _capture_tabs(browser, device: dict, out_root: Path) -> int:
    out_dir = out_root / device["dir"]
    out_dir.mkdir(parents=True, exist_ok=True)

    ctx = browser.new_context(
        viewport=device["viewport"],
        device_scale_factor=device["dpr"],
        color_scheme="dark",
    )
    page = ctx.new_page()
    page.goto(DEV_URL)
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(800)

    for slug, tab_label in TABS:
        page.locator(f"nav.tabbar button[aria-label='{tab_label}']").click()
        page.wait_for_timeout(500)
        path = out_dir / f"{slug}.png"
        page.screenshot(path=str(path), full_page=False)
        print(f"    {path.relative_to(ROOT)}")

    ctx.close()
    return len(TABS)


def _capture_feature_graphic(browser, out_root: Path) -> None:
    out_dir = out_root / "feature_graphic"
    out_dir.mkdir(parents=True, exist_ok=True)

    ctx = browser.new_context(
        viewport={"width": 1024, "height": 500},
        device_scale_factor=1,
    )
    page = ctx.new_page()
    page.set_content(FEATURE_GRAPHIC_HTML)
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(600)   # let web fonts render

    path = out_dir / "feature_graphic.png"
    page.screenshot(path=str(path), full_page=False)
    print(f"    {path.relative_to(ROOT)}")
    ctx.close()


# ── main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    out_root = ROOT / "screenshots"
    out_root.mkdir(exist_ok=True)

    server = _start_dev_server()
    total = 0

    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()

            # Feature graphic (no dev server required, but browser is already up)
            print("Feature graphic (1024 × 500):")
            _capture_feature_graphic(browser, out_root)
            total += 1

            # App screenshots for each device class
            for device in DEVICES:
                print(f"\n{device['label']}:")
                total += _capture_tabs(browser, device, out_root)

            browser.close()
    finally:
        server.terminate()
        server.wait()
        print("\nDev server stopped.")

    print(f"\n{total} assets saved to screenshots/")
    print(
        "\nGoogle Play Console upload paths:\n"
        "  Main store listing → Graphics\n"
        "    Feature graphic       ← screenshots/feature_graphic/\n"
        "  Main store listing → Screenshots\n"
        "    Phone                 ← screenshots/phone/\n"
        "    7-inch tablet         ← screenshots/tablet_7inch/\n"
        "    10-inch tablet        ← screenshots/tablet_10inch/"
    )


if __name__ == "__main__":
    main()
