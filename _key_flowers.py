from collections import deque
from pathlib import Path
from PIL import Image

SRC = Path(r"C:\Users\Shoaib\.cursor\projects\f-AdnanSites-flowers-newflowersite\assets")
OUT = Path(r"F:\AdnanSites\flowers\newflowersite\frontend\public\flowers")
OUT.mkdir(parents=True, exist_ok=True)
NAMES = ["rose", "tulip", "sunflower", "daisy", "lily", "lotus", "lavender", "greens"]


def remove_key(src, dest):
    im = Image.open(src).convert("RGB")
    im.thumbnail((720, 980), Image.Resampling.LANCZOS)
    w, h = im.size
    pix = im.load()
    corners = [pix[2, 2], pix[w - 3, 2], pix[2, h - 3], pix[w - 3, h - 3]]
    kr = sum(p[0] for p in corners) // 4
    kg = sum(p[1] for p in corners) // 4
    kb = sum(p[2] for p in corners) // 4
    hard = 48 * 48
    soft = 86 * 86

    def dist2(x, y):
        r, g, b = pix[x, y]
        return (r - kr) * (r - kr) + (g - kg) * (g - kg) + (b - kb) * (b - kb)

    bg = bytearray(w * h)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if dist2(x, y) < hard:
                bg[y * w + x] = 1
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            i = y * w + x
            if not bg[i] and dist2(x, y) < hard:
                bg[i] = 1
                q.append((x, y))
    while q:
        x, y = q.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if nx < 0 or ny < 0 or nx >= w or ny >= h:
                continue
            i = ny * w + nx
            if bg[i]:
                continue
            if dist2(nx, ny) < hard:
                bg[i] = 1
                q.append((nx, ny))
    out = Image.new("RGBA", (w, h))
    op = out.load()
    for y in range(h):
        row = y * w
        for x in range(w):
            r, g, b = pix[x, y]
            mark = bg[row + x]
            edge = False
            if not mark:
                if (x and bg[row + x - 1]) or (x + 1 < w and bg[row + x + 1]) or (y and bg[row - w + x]) or (y + 1 < h and bg[row + w + x]):
                    edge = dist2(x, y) < soft
            if mark:
                a = 0
            elif edge:
                d = dist2(x, y) ** 0.5
                a = int(max(0, min(255, (d - 48) / 38 * 255)))
            else:
                a = 255
            if 0 < a < 255:
                spill = min(r, b) - g
                if spill > 8:
                    r = max(0, r - int(spill * 0.75))
                    b = max(0, b - int(spill * 0.75))
            op[x, y] = (r, g, b, a)
    bbox = out.getbbox()
    if bbox:
        pad = 8
        bbox = (
            max(0, bbox[0] - pad),
            max(0, bbox[1] - pad),
            min(w, bbox[2] + pad),
            min(h, bbox[3] + pad),
        )
        out = out.crop(bbox)
    out.save(dest, "PNG", optimize=True)
    print(dest.name, out.size)


for name in NAMES:
    remove_key(SRC / f"{name}.jpg", OUT / f"{name}.png")
