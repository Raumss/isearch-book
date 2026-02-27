#!/usr/bin/env python3
"""
Generate simple placeholder icons for the iSearch Book Safari extension.
Uses only the Python standard library (no Pillow required).

Run from the extension/ directory:
    python3 scripts/generate-icons.py
"""

import math
import os
import struct
import zlib

# ── Icon colour palette ──────────────────────────────────────────
GREEN = (49, 154, 84, 255)       # #319A54  – Douban "buy" green
DARK_GREEN = (39, 130, 70, 255)  # spine / accent
WHITE_PAGE = (255, 255, 255, 230)
TRANSPARENT = (0, 0, 0, 0)


def _book_icon_pixel(x, y, w, h):
    """Return (r, g, b, a) for one pixel of a book-on-circle icon."""
    cx, cy = w / 2, h / 2
    radius = w * 0.44
    dist = math.hypot(x - cx, y - cy)

    # Outside the circle → transparent
    if dist > radius + 1:
        return TRANSPARENT

    # Anti-aliased edge
    if dist > radius:
        alpha = int(255 * max(0.0, 1.0 - (dist - radius)))
        return (GREEN[0], GREEN[1], GREEN[2], alpha)

    # Book body bounds (centred in the circle)
    bk_l, bk_r = w * 0.30, w * 0.70
    bk_t, bk_b = w * 0.24, w * 0.76
    spine = w * 0.50
    spine_half = max(1, w * 0.014)

    if bk_l <= x <= bk_r and bk_t <= y <= bk_b:
        if abs(x - spine) < spine_half:
            return DARK_GREEN          # spine line
        return WHITE_PAGE              # page area

    return GREEN                       # circle background


def create_png(size, pixel_func, filepath):
    """Write a 32-bit RGBA PNG using only struct + zlib."""
    raw = bytearray()
    for y in range(size):
        raw.append(0)                  # PNG row filter: None
        for x in range(size):
            raw.extend(pixel_func(x, y, size, size))

    def chunk(ctype, data):
        body = ctype + data
        crc = zlib.crc32(body) & 0xFFFFFFFF
        return struct.pack('>I', len(data)) + body + struct.pack('>I', crc)

    ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)

    png  = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', ihdr)
    png += chunk(b'IDAT', zlib.compress(bytes(raw), 9))
    png += chunk(b'IEND', b'')

    os.makedirs(os.path.dirname(filepath) or '.', exist_ok=True)
    with open(filepath, 'wb') as f:
        f.write(png)


def main():
    sizes = [48, 96, 128, 256]
    script_dir = os.path.dirname(os.path.abspath(__file__))
    ext_dir = os.path.dirname(script_dir)          # extension/

    for s in sizes:
        path = os.path.join(ext_dir, 'images', f'icon-{s}.png')
        create_png(s, _book_icon_pixel, path)
        print(f'  ✓ {path}  ({s}×{s})')

    print('\nDone — icons written to extension/images/')


if __name__ == '__main__':
    main()
