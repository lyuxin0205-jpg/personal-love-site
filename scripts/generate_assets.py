from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import math
import random
import wave
import struct

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / "public" / "images"
AUD = ROOT / "public" / "audio"
IMG.mkdir(parents=True, exist_ok=True)
AUD.mkdir(parents=True, exist_ok=True)

random.seed(520)

def gradient(size, palette, name, people=False, sea=False, forest=False):
    w, h = size
    image = Image.new("RGB", size)
    pixels = image.load()
    for y in range(h):
        t = y / max(1, h - 1)
        for x in range(w):
            r = int(palette[0][0] * (1 - t) + palette[1][0] * t)
            g = int(palette[0][1] * (1 - t) + palette[1][1] * t)
            b = int(palette[0][2] * (1 - t) + palette[1][2] * t)
            sun = math.exp(-(((x / w - .72) ** 2) / .045 + ((y / h - .22) ** 2) / .05))
            leaf = math.exp(-(((x / w - .18) ** 2) / .025 + ((y / h - .32) ** 2) / .08))
            r = min(255, int(r + sun * 42 + leaf * 4))
            g = min(255, int(g + sun * 36 + leaf * 28))
            b = min(255, int(b + sun * 20 + leaf * 14))
            pixels[x, y] = (r, g, b)

    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")
    if forest:
        for _ in range(34):
            x = random.randint(-80, w)
            y0 = random.randint(-80, int(h*.36))
            width = random.randint(70, 180)
            height = random.randint(180, 420)
            color = random.choice([(52, 116, 78, 70), (84, 145, 75, 62), (38, 105, 98, 58)])
            draw.polygon(
                [
                    (x, y0 + height),
                    (x + width // 2, y0),
                    (x + width, y0 + height),
                    (x + width // 2, y0 + int(height * .72)),
                ],
                fill=color,
            )
        for _ in range(24):
            x = random.randint(0, w)
            draw.line((x, 0, x - random.randint(12, 42), h), fill=(58, 105, 77, 72), width=random.randint(3, 7))

    if sea:
        horizon = int(h * .48)
        draw.rectangle((0, 0, w, horizon), fill=(190, 229, 226, 96))
        for i in range(9):
            yy = int(h * (.14 + i * .028))
            draw.line((random.randint(-80, 80), yy, w + random.randint(-40, 120), yy + random.randint(-10, 12)), fill=(255, 254, 232, random.randint(20, 46)), width=random.randint(6, 16))
        draw.polygon(
            [
                (0, horizon - int(h * .035)),
                (int(w * .16), horizon - int(h * .07)),
                (int(w * .36), horizon - int(h * .025)),
                (int(w * .6), horizon - int(h * .055)),
                (w, horizon - int(h * .02)),
                (w, horizon + int(h * .02)),
                (0, horizon + int(h * .015)),
            ],
            fill=(84, 139, 132, 70),
        )
        draw.rectangle((0, horizon, w, h), fill=(67, 168, 194, 205))
        for i in range(30):
            yy = horizon + i * int(h * .012)
            draw.line((0, yy, w, yy + random.randint(-3, 3)), fill=(255, 255, 246, max(28, 112 - i)), width=3)
        draw.rectangle((0, int(h * .74), w, h), fill=(210, 186, 116, 210))
        draw.line((0, horizon, w, horizon + random.randint(-2, 2)), fill=(48, 126, 150, 210), width=5)
        for _ in range(2):
            px = random.randint(int(w * .34), int(w * .72))
            py = random.randint(int(h * .64), int(h * .72))
            draw.ellipse((px - 12, py - 42, px + 12, py - 18), fill=(37, 73, 67, 150))
            draw.line((px, py - 16, px - random.randint(10, 22), py + 50), fill=(37, 73, 67, 130), width=6)
            draw.line((px, py - 16, px + random.randint(8, 20), py + 48), fill=(37, 73, 67, 120), width=6)

    if people:
        base = int(h * .73)
        glow = (int(w*.32), int(h*.32), int(w*.70), int(h*.90))
        draw.ellipse(glow, fill=(255, 246, 189, 58))
        draw.ellipse((int(w*.40), base-145, int(w*.49), base-52), fill=(52, 73, 57, 215))
        draw.rounded_rectangle((int(w*.39), base-80, int(w*.505), base+128), radius=46, fill=(52, 73, 57, 222))
        draw.ellipse((int(w*.515), base-138, int(w*.60), base-55), fill=(48, 71, 61, 210))
        draw.rounded_rectangle((int(w*.50), base-74, int(w*.615), base+134), radius=48, fill=(48, 71, 61, 222))
        draw.line((int(w*.49), base+2, int(w*.525), base+16), fill=(245, 239, 208, 150), width=8)

    # Add quiet, photo-like imperfections so placeholders feel closer to scanned film.
    for _ in range(9):
        x0 = random.randint(-w // 8, w)
        y0 = random.randint(0, h)
        x1 = x0 + random.randint(w // 5, w // 2)
        y1 = y0 + random.randint(-h // 10, h // 10)
        draw.line((x0, y0, x1, y1), fill=(255, 250, 214, random.randint(18, 42)), width=random.randint(4, 12))

    if random.random() > 0.35:
        for _ in range(10):
            x = random.randint(-60, w + 60)
            y = random.randint(-40, int(h * .42))
            draw.line((x, y, x + random.randint(-90, 120), y + random.randint(160, 360)), fill=(38, 83, 68, random.randint(22, 46)), width=random.randint(2, 5))

    if sea:
        for _ in range(18):
            yy = random.randint(int(h * .5), int(h * .72))
            x0 = random.randint(0, w)
            draw.arc((x0 - 80, yy - 16, x0 + 180, yy + 24), 180, 356, fill=(245, 251, 239, random.randint(42, 92)), width=random.randint(2, 4))

    draw.rectangle((0, 0, w - 1, h - 1), outline=(247, 240, 218, 62), width=max(8, w // 110))

    image = Image.alpha_composite(image.convert("RGBA"), layer).convert("RGB")

    for _ in range(1400):
        x = random.randrange(w)
        y = random.randrange(h)
        value = random.randrange(-12, 13)
        r, g, b = image.getpixel((x, y))
        image.putpixel((x, y), (max(0, min(255, r + value)), max(0, min(255, g + value)), max(0, min(255, b + value))))

    vignette = Image.new("L", size, 0)
    vd = ImageDraw.Draw(vignette)
    vd.ellipse((-w*.18, -h*.12, w*1.18, h*1.12), fill=235)
    vignette = vignette.filter(ImageFilter.GaussianBlur(110))
    wash = Image.new("RGB", size, (246, 248, 232))
    image = Image.composite(image, wash, Image.eval(vignette, lambda p: int((255 - p) * .06)))
    image = image.filter(ImageFilter.GaussianBlur(.18))
    image = ImageEnhance.Brightness(image).enhance(1.0)
    image = ImageEnhance.Contrast(image).enhance(1.14)
    image = ImageEnhance.Color(image).enhance(1.12)
    pixels = image.load()
    if sea:
        for y in range(int(h * .48), h):
            tone = (76, 171, 190) if y < int(h * .74) else (205, 186, 124)
            alpha = .44 if y < int(h * .74) else .52
            for x in range(w):
                r, g, b = pixels[x, y]
                pixels[x, y] = (
                    int(r * (1 - alpha) + tone[0] * alpha),
                    int(g * (1 - alpha) + tone[1] * alpha),
                    int(b * (1 - alpha) + tone[2] * alpha),
                )
    if forest:
        shade = Image.new("RGB", size, (225, 237, 202))
        image = Image.blend(image, shade, .08)
        image = image.filter(ImageFilter.GaussianBlur(.22))
    final = ImageDraw.Draw(image, "RGBA")
    if forest:
        final.rectangle((0, int(h * .62), w, h), fill=(43, 91, 82, 44))
        final.polygon(
            [
                (0, h),
                (int(w * .36), int(h * .62)),
                (int(w * .56), int(h * .62)),
                (w, h),
            ],
            fill=(47, 88, 76, 52),
        )
        for _ in range(9):
            lx = random.randint(int(w * .08), int(w * .92))
            ly = random.randint(int(h * .1), int(h * .45))
            final.ellipse((lx - 18, ly - 18, lx + 18, ly + 18), fill=(248, 238, 178, random.randint(18, 42)))
            final.line((lx, ly, lx - random.randint(12, 30), h), fill=(42, 83, 70, random.randint(20, 42)), width=random.randint(1, 3))
        for _ in range(7):
            yy = random.randint(int(h * .68), int(h * .92))
            final.line((random.randint(-40, int(w * .2)), yy, random.randint(int(w * .62), w + 40), yy + random.randint(-10, 10)), fill=(244, 239, 204, random.randint(18, 36)), width=random.randint(2, 5))
    if people:
        base = int(h * .73)
        final.ellipse((int(w*.40), base-145, int(w*.49), base-52), fill=(39, 67, 59, 190))
        final.rounded_rectangle((int(w*.39), base-80, int(w*.505), base+128), radius=46, fill=(39, 67, 59, 198))
        final.ellipse((int(w*.515), base-138, int(w*.60), base-55), fill=(34, 61, 57, 184))
        final.rounded_rectangle((int(w*.50), base-74, int(w*.615), base+134), radius=48, fill=(34, 61, 57, 198))
        final.line((int(w*.49), base+2, int(w*.525), base+16), fill=(245, 239, 208, 150), width=max(5, w // 260))
    if sea:
        for _ in range(16):
            yy = random.randint(int(h * .52), int(h * .72))
            final.line((random.randint(0, int(w * .2)), yy, random.randint(int(w * .7), w), yy + random.randint(-6, 6)), fill=(247, 253, 239, random.randint(38, 78)), width=random.randint(1, 3))
    for _ in range(8):
        x = random.randint(-60, w + 60)
        final.line((x, 0, x + random.randint(-100, 140), h), fill=(31, 72, 62, random.randint(14, 28)), width=random.randint(1, 3))
    final.rectangle((0, 0, w - 1, h - 1), outline=(250, 245, 222, 100), width=max(7, w // 130))
    image.save(IMG / name, quality=92)

palettes = [
    ((226, 238, 188), (105, 190, 196)),
    ((238, 229, 174), (122, 194, 128)),
    ((206, 232, 205), (89, 179, 171)),
    ((230, 218, 160), (105, 188, 195)),
    ((216, 236, 184), (78, 157, 102)),
    ((235, 220, 178), (125, 197, 221)),
    ((210, 232, 198), (106, 180, 118)),
    ((238, 227, 184), (86, 180, 202)),
]

gradient((2200, 1500), palettes[0], "hero-couple.jpg", people=False, sea=True, forest=True)
gradient((1500, 1800), palettes[2], "gate.jpg", people=False, forest=True)

for i in range(1, 5):
    gradient((1100, 820), palettes[i], f"story-0{i}.jpg", people=False, sea=i in (2, 4), forest=i in (1, 3))

sizes = [(900,1200),(1200,900),(820,1250),(1000,1180),(1300,850),(900,1180),(940,1250),(1400,875)]
for i, size in enumerate(sizes, start=1):
    gradient(size, palettes[(i - 1) % len(palettes)], f"photo-0{i}.jpg", people=False, sea=i in (2, 4, 8), forest=i in (1, 3, 6, 7))

sample_rate = 44100
duration = 18
with wave.open(str(AUD / "soft-night.wav"), "w") as wav:
    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(sample_rate)
    for n in range(sample_rate * duration):
        t = n / sample_rate
        envelope = min(1, t / 2) * min(1, (duration - t) / 3)
        tone = (
            math.sin(2 * math.pi * 246.94 * t) * .18 +
            math.sin(2 * math.pi * 329.63 * t) * .1 +
            math.sin(2 * math.pi * 392 * t) * .07
        )
        shimmer = math.sin(2 * math.pi * 783.99 * t) * .014 * (0.5 + 0.5 * math.sin(2 * math.pi * .14 * t))
        value = int((tone + shimmer) * envelope * 10500)
        wav.writeframes(struct.pack("<h", value))

print("assets generated")
