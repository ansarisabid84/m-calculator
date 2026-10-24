#!/usr/bin/env python3
"""Generates app icons for Calc. Run: python3 resources/make_icons.py"""
from PIL import Image, ImageDraw, ImageFilter
import math, os

OUT = os.path.join(os.path.dirname(__file__), '..', 'public')
os.makedirs(OUT, exist_ok=True)

# Design tokens — matches tokens.css
AMBER  = (244, 169,  50)
TEAL   = ( 92, 194, 173)
BG_TOP = ( 20,  18,  32)   # dark purple-graphite
BG_BOT = ( 10,  11,  17)   # near-black graphite


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(len(a)))


def diagonal_gradient(size):
    """Deep diagonal gradient: purple-graphite top-left → near-black bottom-right."""
    img = Image.new('RGB', (size, size))
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * (size - 1))
            img.putpixel((x, y), lerp(BG_TOP, BG_BOT, t))
    return img


def radial_glow_layer(size, cx, cy, radius, color, alpha_peak=80):
    """Soft circular glow composited as RGBA."""
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    for y in range(size):
        for x in range(size):
            d = math.hypot(x - cx, y - cy)
            t = max(0.0, 1.0 - d / radius)
            a = int(alpha_peak * t * t)
            if a > 0:
                layer.putpixel((x, y), color + (a,))
    return layer


def make_bar_glow(size, bar_box, color, blur_r):
    """Draw a pill-shaped bar, blur it, return as RGBA glow layer."""
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    x0, y0, x1, y1 = bar_box
    h = y1 - y0
    d.rounded_rectangle([x0, y0, x1, y1], radius=h // 2, fill=color + (220,))
    return layer.filter(ImageFilter.GaussianBlur(blur_r))


def make_icon(size, maskable=False):
    pad = int(size * 0.14) if maskable else 0
    s = size - pad * 2          # drawable area side length
    radius = int(s * 0.228)     # squircle corner radius

    # ── 1. background gradient ──────────────────────────────────────────────
    base = diagonal_gradient(s).convert('RGBA')

    # ── 2. subtle centre ambient glow (very faint amber warmth) ─────────────
    cx = cy = s // 2
    amb = radial_glow_layer(s, cx, cy, int(s * 0.55), (180, 110, 20), alpha_peak=55)
    base = Image.alpha_composite(base, amb)

    # ── 3. bar geometry ──────────────────────────────────────────────────────
    bar_w  = int(s * 0.56)
    bar_h  = int(s * 0.108)
    gap    = int(s * 0.072)
    total  = 2 * bar_h + gap
    top_y  = cy - total // 2

    amber_box = [cx - bar_w // 2, top_y,             cx + bar_w // 2, top_y + bar_h]
    teal_box  = [cx - bar_w // 2, top_y + bar_h + gap, cx + bar_w // 2, top_y + bar_h + gap + bar_h]

    # ── 4. glow halos (blurred, drawn below the bars) ───────────────────────
    blur_r = max(1, int(s * 0.045))
    for box, col in [(amber_box, AMBER), (teal_box, TEAL)]:
        expanded = [box[0] - blur_r, box[1] - blur_r, box[2] + blur_r, box[3] + blur_r]
        glow = make_bar_glow(s, expanded, col, blur_r * 1.6)
        base = Image.alpha_composite(base, glow)

    # ── 5. solid bars ────────────────────────────────────────────────────────
    d = ImageDraw.Draw(base)
    for box, col in [(amber_box, AMBER), (teal_box, TEAL)]:
        d.rounded_rectangle(box, radius=bar_h // 2, fill=col)

    # ── 6. top-edge shine (subtle inner highlight) ───────────────────────────
    shine = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shine)
    sd.rounded_rectangle(
        [int(s * 0.08), int(s * 0.08), int(s * 0.92), int(s * 0.30)],
        radius=radius,
        fill=(255, 255, 255, 12),
    )
    base = Image.alpha_composite(base, shine)

    # ── 7. clip to squircle mask ─────────────────────────────────────────────
    icon = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    mask = Image.new('L', (s, s), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, s - 1, s - 1], radius=radius, fill=255)
    icon.paste(base, (pad, pad), mask)
    return icon


# ── generate all sizes ───────────────────────────────────────────────────────
for sz in (192, 512):
    make_icon(sz).save(os.path.join(OUT, f'icon-{sz}.png'))
make_icon(512, maskable=True).save(os.path.join(OUT, 'icon-512-maskable.png'))
make_icon(1024).save(os.path.join(OUT, 'icon-1024.png'))
make_icon(64).save(os.path.join(OUT, 'favicon.png'))
print('icons written to', os.path.normpath(OUT))
