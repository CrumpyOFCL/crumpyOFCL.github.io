#!/usr/bin/env python3
"""Original pixel art for the level-select hub. No third-party sprites."""
from PIL import Image, ImageDraw

OUT = "/workspace/src/assets/art"

# Shared sprite palette (≤16).
P = {
    ".": None,
    "K": (0x1C, 0x14, 0x0C),  # outline / ink
    "C": (0xF4, 0xE7, 0xC8),  # cream
    "P": (0xC4, 0xA3, 0x6A),  # path
    "E": (0x8F, 0x75, 0x45),  # path edge
    "R": (0x8C, 0x3B, 0x22),  # roof
    "O": (0xC4, 0x55, 0x2A),  # orange
    "A": (0x7A, 0x4A, 0x10),  # amber dark
    "Y": (0xF2, 0xB2, 0x33),  # gold
    "G": (0x5E, 0x73, 0x44),  # grass
    "T": (0x2F, 0x4A, 0x26),  # tree
    "W": (0x2F, 0x5D, 0x7A),  # water
    "H": (0xD8, 0x45, 0x2B),  # hoodie
    "S": (0xE8, 0xB4, 0x8A),  # skin
    "B": (0x2F, 0x4A, 0x6B),  # trousers
    "L": (0x3F, 0x78, 0x96),  # water light
}

def new(w, h):
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))

def blit(im, rows, ox, oy):
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            col = P.get(ch)
            if not col:
                continue
            im.putpixel((ox + x, oy + y), col + (255,))

def fill(im, x, y, w, h, col):
    d = ImageDraw.Draw(im)
    d.rectangle([x, y, x + w - 1, y + h - 1], fill=col + (255,))

def pix(im, x, y, col):
    if 0 <= x < im.size[0] and 0 <= y < im.size[1]:
        im.putpixel((x, y), col + (255,))

# --- Avatar 16×16, 6 frames: idle, idle-blink, 4 walks. Facing right. ---
# Rows are 16 chars. Cap Y, skin S, hoodie H, trousers B, outline K.

IDLE = [
    "......YYYY......",
    ".....YYYYYY.....",
    "....KYSSSSYK....",
    "....KSKKKSKY....",
    "....KYSSSSYK....",
    ".....KHHHHK.....",
    "....KHHHHHHK....",
    "...KHHHHHHHHK...",
    "....KHHHHHHK....",
    ".....KHHHK......",
    ".....KBBBBK.....",
    "....KBBBBBBK....",
    "....KBK..KBK....",
    "....KBK..KBK....",
    "....KK....KK....",
    "....KK....KK....",
]
BLINK = [
    "......YYYY......",
    ".....YYYYYY.....",
    "....KYSSSSYK....",
    "....KSKKKSKY....",
    "....KYKKKKYK....",
    ".....KHHHHK.....",
    "....KHHHHHHK....",
    "...KHHHHHHHHK...",
    "....KHHHHHHK....",
    ".....KHHHK......",
    ".....KBBBBK.....",
    "....KBBBBBBK....",
    "....KBK..KBK....",
    "....KBK..KBK....",
    "....KK....KK....",
    "....KK....KK....",
]
WALK = [
    [
        "......YYYY......",
        ".....YYYYYY.....",
        "....KYSSSSYK....",
        "....KSKKKSKY....",
        "....KYSSSSYK....",
        ".....KHHHHK.....",
        "....KHHHHHHK....",
        "...KHHHHHHHHK...",
        "....KHHHHHHK....",
        ".....KHHHK......",
        ".....KBBBBK.....",
        "....KBBBBBBK....",
        "...KBK....KBK...",
        "..KBK......KBK..",
        "..KK........KK..",
        "..KK........KK..",
    ],
    [
        "......YYYY......",
        ".....YYYYYY.....",
        "....KYSSSSYK....",
        "....KSKKKSKY....",
        "....KYSSSSYK....",
        ".....KHHHHK.....",
        "....KHHHHHHK....",
        "...KHHHHHHHHK...",
        "....KHHHHHHK....",
        ".....KHHHK......",
        ".....KBBBBK.....",
        "....KBBBBBBK....",
        "....KBK..KBK....",
        "....KBK..KBK....",
        "....KK....KK....",
        "....KK....KK....",
    ],
    [
        "......YYYY......",
        ".....YYYYYY.....",
        "....KYSSSSYK....",
        "....KSKKKSKY....",
        "....KYSSSSYK....",
        ".....KHHHHK.....",
        "....KHHHHHHK....",
        "...KHHHHHHHHK...",
        "....KHHHHHHK....",
        ".....KHHHK......",
        ".....KBBBBK.....",
        "....KBBBBBBK....",
        "...KBK....KBK...",
        "....KK....KK....",
        "....KK....KK....",
        ".....K....K.....",
    ],
    [
        "......YYYY......",
        ".....YYYYYY.....",
        "....KYSSSSYK....",
        "....KSKKKSKY....",
        "....KYSSSSYK....",
        ".....KHHHHK.....",
        "....KHHHHHHK....",
        "...KHHHHHHHHK...",
        "....KHHHHHHK....",
        ".....KHHHK......",
        ".....KBBBBK.....",
        "....KBBBBBBK....",
        "....KBBBBBBK....",
        "....KBK..KBK....",
        "....KK....KK....",
        "....KK....KK....",
    ],
]

av = new(96, 16)
for i, frame in enumerate([IDLE, BLINK, *WALK]):
    blit(av, frame, i * 16, 0)
av.save(f"{OUT}/avatar.png", optimize=True)

# --- Landmarks. Sheet 232×48. ---
sheet = new(232, 48)

def rect(im, x, y, w, h, ch):
    col = P[ch]
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            pix(im, xx, yy, col)

def outline_rect(im, x, y, w, h, ch, edge="K"):
    rect(im, x, y, w, h, ch)
    col = P[edge]
    for xx in range(x, x + w):
        pix(im, xx, y, col)
        pix(im, xx, y + h - 1, col)
    for yy in range(y, y + h):
        pix(im, x, yy, col)
        pix(im, x + w - 1, yy, col)

# ACIT hotel 48×48 with a clock.
def hotel(im, ox, oy):
    # ground shadow
    rect(im, ox + 4, oy + 44, 40, 3, "K")
    # wings
    outline_rect(im, ox + 2, oy + 22, 10, 22, "C")
    outline_rect(im, ox + 36, oy + 22, 10, 22, "C")
    # main block
    outline_rect(im, ox + 10, oy + 16, 28, 28, "C")
    # roof
    for i, w in enumerate(range(8, 28, 2)):
        rect(im, ox + 24 - w // 2, oy + 6 + i, w, 1, "R")
    rect(im, ox + 8, oy + 18, 32, 3, "R")
    # clock
    outline_rect(im, ox + 20, oy + 10, 8, 8, "Y")
    pix(im, ox + 23, oy + 13, P["K"])
    pix(im, ox + 24, oy + 13, P["K"])
    pix(im, ox + 24, oy + 14, P["K"])
    # windows, two rows
    for wx in (14, 20, 28, 34):
        outline_rect(im, ox + wx, oy + 24, 4, 5, "W")
        outline_rect(im, ox + wx, oy + 32, 4, 5, "W")
    # door
    outline_rect(im, ox + 22, oy + 34, 6, 10, "A")
    pix(im, ox + 26, oy + 39, P["Y"])
    # side windows
    outline_rect(im, ox + 4, oy + 28, 4, 5, "W")
    outline_rect(im, ox + 40, oy + 28, 4, 5, "W")

hotel(sheet, 0, 0)

# WN: dark house, one lit window, moon.
def wn(im, ox, oy):
    # moon
    outline_rect(im, ox + 24, oy + 2, 6, 6, "C")
    rect(im, ox + 26, oy + 3, 3, 4, "K")
    # house
    rect(im, ox + 4, oy + 16, 22, 14, "K")
    for i in range(10):
        rect(im, ox + 6 + i, oy + 8 + (9 - i) // 2, 1, 2, "K")
    rect(im, ox + 5, oy + 14, 20, 3, "K")
    # lit window
    outline_rect(im, ox + 8, oy + 20, 6, 5, "Y")
    # dark window
    outline_rect(im, ox + 16, oy + 20, 5, 5, "W")
    # door
    rect(im, ox + 12, oy + 26, 4, 4, "A")

wn(sheet, 48, 8)

# Tabi suitcase. Not a place icon.
def suitcase(im, ox, oy):
    # handle
    rect(im, ox + 12, oy + 8, 8, 2, "K")
    rect(im, ox + 12, oy + 6, 2, 4, "K")
    rect(im, ox + 18, oy + 6, 2, 4, "K")
    outline_rect(im, ox + 6, oy + 10, 20, 16, "P")
    rect(im, ox + 7, oy + 16, 18, 3, "H")
    rect(im, ox + 14, oy + 12, 2, 12, "A")
    # wheels
    rect(im, ox + 8, oy + 26, 3, 2, "K")
    rect(im, ox + 20, oy + 26, 3, 2, "K")

suitcase(sheet, 80, 8)

# Ikemen: small arena, two posts, ropes. Not a copied game sprite.
def arena(im, ox, oy):
    rect(im, ox + 4, oy + 22, 24, 6, "E")
    rect(im, ox + 6, oy + 20, 20, 3, "P")
    rect(im, ox + 4, oy + 8, 2, 16, "K")
    rect(im, ox + 26, oy + 8, 2, 16, "K")
    rect(im, ox + 6, oy + 10, 20, 1, "H")
    rect(im, ox + 6, oy + 13, 20, 1, "C")
    rect(im, ox + 6, oy + 16, 20, 1, "H")
    # two tiny fighters
    rect(im, ox + 10, oy + 14, 2, 5, "Y")
    rect(im, ox + 18, oy + 14, 2, 5, "B")

arena(sheet, 112, 8)

# SDCS booking kiosk.
def kiosk(im, ox, oy):
    outline_rect(im, ox + 8, oy + 6, 16, 18, "C")
    outline_rect(im, ox + 10, oy + 8, 12, 8, "W")
    rect(im, ox + 12, oy + 10, 8, 1, "Y")
    rect(im, ox + 12, oy + 12, 5, 1, "C")
    rect(im, ox + 14, oy + 18, 4, 2, "A")
    rect(im, ox + 12, oy + 24, 8, 3, "K")
    rect(im, ox + 10, oy + 27, 12, 2, "K")

kiosk(sheet, 144, 8)

# LIT_Flux lamp with sparks.
def lamp(im, ox, oy):
    rect(im, ox + 15, oy + 14, 2, 14, "K")
    rect(im, ox + 10, oy + 26, 12, 2, "K")
    outline_rect(im, ox + 10, oy + 6, 12, 8, "Y")
    pix(im, ox + 8, oy + 4, P["Y"])
    pix(im, ox + 23, oy + 5, P["Y"])
    pix(im, ox + 6, oy + 10, P["C"])
    pix(im, ox + 25, oy + 12, P["Y"])
    pix(im, ox + 22, oy + 2, P["C"])

lamp(sheet, 176, 8)

# GDT2 question block, 24×24.
def qblock(im, ox, oy):
    outline_rect(im, ox + 2, oy + 2, 20, 20, "Y")
    rect(im, ox + 4, oy + 4, 16, 2, "C")
    # ?
    q = [
        "####",
        "#..#",
        "..#.",
        ".#..",
        ".#..",
        "....",
        ".#..",
    ]
    for y, row in enumerate(q):
        for x, ch in enumerate(row):
            if ch == "#":
                pix(im, ox + 8 + x, oy + 6 + y, P["K"])

qblock(sheet, 208, 12)
sheet.save(f"{OUT}/landmarks.png", optimize=True)

# --- Map 320×180. Grass, lake, trees, serpentine road. ---
GRASS = (0x5E, 0x73, 0x44)
GRASS_L = (0x6F, 0x8A, 0x4E)
GRASS_D = (0x4E, 0x62, 0x38)
ROAD = (0xC4, 0xA3, 0x6A)
ROAD_E = (0x8F, 0x75, 0x45)
WATER = (0x2F, 0x5D, 0x7A)
WATER_L = (0x3F, 0x78, 0x96)
TREE = (0x2F, 0x4A, 0x26)
TREE_L = (0x3F, 0x61, 0x30)
TRUNK = (0x6B, 0x4A, 0x2A)
INK = (0x1C, 0x14, 0x0C)

mp = Image.new("RGB", (320, 180), GRASS)
px = mp.load()
for y in range(180):
    for x in range(320):
        if (x // 2 + y // 2) % 4 == 0:
            px[x, y] = GRASS_L
        elif (x + y) % 7 == 0:
            px[x, y] = GRASS_D

# Lake, top-left, clear of the castle spur.
for y in range(8, 48):
    for x in range(8, 78):
        dx = (x - 40) / 34
        dy = (y - 28) / 18
        if dx * dx + dy * dy <= 1:
            px[x, y] = WATER_L if (x // 4 + y // 3) % 2 == 0 else WATER

def tree(im, x, y):
    p = im.load()
    for yy in range(y, y + 10):
        for xx in range(x, x + 12):
            dx = (xx - x - 5.5) / 6
            dy = (yy - y - 4) / 5
            if dx * dx + dy * dy <= 1 and 0 <= xx < 320 and 0 <= yy < 180:
                p[xx, yy] = INK if dx * dx + dy * dy > 0.78 else (TREE_L if (xx + yy) % 3 == 0 else TREE)
    for yy in range(y + 9, y + 14):
        for xx in range(x + 5, x + 8):
            if 0 <= xx < 320 and 0 <= yy < 180:
                p[xx, yy] = TRUNK

for tx, ty in [(96, 8), (210, 6), (292, 18), (96, 86), (292, 78), (18, 118), (300, 118), (108, 150)]:
    tree(mp, tx, ty)

# Road centres matching the node layout (fractions of 320×180).
pts = [
    (int(0.50 * 320), int(0.30 * 180)),  # under castle
    (int(0.20 * 320), int(0.42 * 180)),  # WN
    (int(0.80 * 320), int(0.42 * 180)),  # Tabi
    (int(0.50 * 320), int(0.60 * 180)),  # Ikemen
    (int(0.80 * 320), int(0.84 * 180)),  # SDCS
    (int(0.50 * 320), int(0.84 * 180)),  # LIT
    (int(0.20 * 320), int(0.84 * 180)),  # GDT
]
draw = ImageDraw.Draw(mp)
draw.line(pts, fill=ROAD_E, width=18)
draw.line(pts, fill=ROAD, width=14)
# 1px inner edge already approximated by the wider stroke.
mp.save(f"{OUT}/map.png", optimize=True)

# Lake shimmer frames, 32×16 × 2, used as a CSS sprite over the lake.
sh = new(64, 16)
for frame in range(2):
    for y in range(16):
        for x in range(32):
            if (x // 4 + y // 2 + frame) % 2 == 0:
                sh.putpixel((frame * 32 + x, y), WATER_L + (180,))
            elif (x + y) % 5 == 0:
                sh.putpixel((frame * 32 + x, y), (0xF4, 0xE7, 0xC8, 90))
sh.save(f"{OUT}/shimmer.png", optimize=True)

import os
for name in ("avatar.png", "landmarks.png", "map.png", "shimmer.png"):
    print(f"{name:16} {os.path.getsize(f'{OUT}/{name}'):6} B")
