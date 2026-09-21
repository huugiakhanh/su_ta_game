"""Normalize generated Trưng Trắc map plates and build runtime/QA outputs.

The visible art comes from built-in image generation. This script only performs
deterministic resizing, horizontal seam repair, alpha compositing, and QA output.
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageChops, ImageEnhance, ImageSequence


ROOT = Path(__file__).resolve().parents[1]
RUN = ROOT / "artifacts" / "map-trung-trac-v2"
RAW = RUN / "raw"
PROCESSED = RUN / "processed"
RUNTIME = ROOT / "frontend" / "static" / "assets" / "images" / "backdrops" / "chapter1"
IMAGES = ROOT / "frontend" / "static" / "assets" / "images"

VIEW_W = 896
VIEW_H = 360
GROUND_Y = 290
PLATE_SIZE = (1792, 720)
GROUND_SIZE = (1792, VIEW_H - GROUND_Y)


def resize_cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    target_w, target_h = size
    scale = max(target_w / image.width, target_h / image.height)
    resized = image.resize(
        (math.ceil(image.width * scale), math.ceil(image.height * scale)),
        Image.Resampling.LANCZOS,
    )
    left = (resized.width - target_w) // 2
    top = (resized.height - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def make_horizontally_tileable(image: Image.Image, feather: int) -> Image.Image:
    """Move the original edge seam to center and cover it with continuous pixels."""
    image = image.convert("RGBA")
    width, height = image.size
    center = width // 2
    feather = max(8, min(feather, width // 8))
    rolled = ImageChops.offset(image, center, 0)
    alternate = ImageChops.offset(rolled, feather * 2, 0)
    mask = Image.new("L", image.size, 0)
    pixels = mask.load()
    for x in range(center - feather, center + feather + 1):
        distance = abs(x - center) / feather
        weight = int(round((0.5 + 0.5 * math.cos(math.pi * distance)) * 255))
        for y in range(height):
            pixels[x, y] = weight
    return Image.composite(alternate, rolled, mask)


def match_wrap_edges(image: Image.Image, feather: int) -> Image.Image:
    """Feather both outer edges toward the same pixels for a zero-delta wrap."""
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    feather = max(2, min(feather, rgba.width // 8))
    for offset in range(feather):
        left_x = offset
        right_x = rgba.width - 1 - offset
        keep = offset / (feather - 1)
        for y in range(rgba.height):
            left = pixels[left_x, y]
            right = pixels[right_x, y]
            average = tuple(round((a + b) / 2) for a, b in zip(left, right))
            pixels[left_x, y] = tuple(round(a * (1 - keep) + b * keep) for a, b in zip(average, left))
            pixels[right_x, y] = tuple(round(a * (1 - keep) + b * keep) for a, b in zip(average, right))
    return rgba


def alpha_crop(image: Image.Image) -> Image.Image:
    bbox = image.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError("Generated ground strip has no visible pixels")
    return image.crop(bbox)


def fade_alpha_bottom(image: Image.Image, start_y: int, end_y: int) -> Image.Image:
    """Fade a scenery plate before the gameplay lane to avoid a hard cut line."""
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    fade = Image.new("L", rgba.size, 255)
    pixels = fade.load()
    for y in range(rgba.height):
        if y <= start_y:
            value = 255
        elif y >= end_y:
            value = 0
        else:
            t = (y - start_y) / (end_y - start_y)
            value = round((0.5 + 0.5 * math.cos(math.pi * t)) * 255)
        for x in range(rgba.width):
            pixels[x, y] = value
    rgba.putalpha(ImageChops.multiply(alpha, fade))
    return rgba


def render_tiled(layer: Image.Image, canvas: Image.Image, y: int, height: int) -> None:
    scale = height / layer.height
    width = max(1, round(layer.width * scale))
    tile = layer.resize((width, height), Image.Resampling.LANCZOS)
    for x in range(0, canvas.width, width):
        canvas.alpha_composite(tile, (x, y))


def remove_magenta(image: Image.Image, threshold: int = 95) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            red, green, blue, alpha = pixels[x, y]
            distance = math.sqrt((red - 255) ** 2 + green**2 + (blue - 255) ** 2)
            if distance < threshold:
                pixels[x, y] = (0, 0, 0, 0)
    return rgba


def first_strip_frame(path: Path, frame_count: int) -> Image.Image:
    strip = Image.open(path).convert("RGBA")
    return strip.crop((0, 0, strip.width // frame_count, strip.height))


def place_bottom_center(canvas: Image.Image, image: Image.Image, x: int, bottom: int, height: int) -> None:
    scale = height / image.height
    width = max(1, round(image.width * scale))
    sprite = image.resize((width, height), Image.Resampling.NEAREST)
    canvas.alpha_composite(sprite, (round(x - width / 2), bottom - height))


def seam_metrics(image: Image.Image) -> dict[str, float]:
    rgba = image.convert("RGBA")
    left = rgba.crop((0, 0, 1, rgba.height))
    right = rgba.crop((rgba.width - 1, 0, rgba.width, rgba.height))
    diff = ImageChops.difference(left, right)
    values = list(diff.getdata())
    mean = sum(sum(pixel) for pixel in values) / (len(values) * 4)
    maximum = max(max(pixel) for pixel in values)
    return {"mean_edge_delta": round(mean, 4), "max_edge_delta": float(maximum)}


def main() -> None:
    PROCESSED.mkdir(parents=True, exist_ok=True)
    RUNTIME.mkdir(parents=True, exist_ok=True)

    sky = resize_cover(Image.open(RAW / "sky.png").convert("RGBA"), PLATE_SIZE)
    sky = make_horizontally_tileable(sky, feather=112)
    sky = match_wrap_edges(sky, feather=56).convert("RGB")

    midground = resize_cover(Image.open(RAW / "midground.png").convert("RGBA"), PLATE_SIZE)
    midground = ImageEnhance.Color(midground).enhance(0.86)
    midground = ImageEnhance.Contrast(midground).enhance(0.92)
    midground = fade_alpha_bottom(midground, start_y=310, end_y=470)
    midground = make_horizontally_tileable(midground, feather=112)
    midground = match_wrap_edges(midground, feather=56)

    ground_raw = alpha_crop(Image.open(RAW / "ground.png").convert("RGBA"))
    ground = ground_raw.resize(GROUND_SIZE, Image.Resampling.LANCZOS)
    ground = make_horizontally_tileable(ground, feather=72)
    ground = match_wrap_edges(ground, feather=36)

    outputs = {
        "sky.png": sky,
        "foreground.png": midground,
        "ground.png": ground,
    }
    for name, image in outputs.items():
        image.save(PROCESSED / name, optimize=True)
        image.save(RUNTIME / name, optimize=True)

    preview = Image.new("RGBA", (VIEW_W, VIEW_H), (0, 0, 0, 0))
    render_tiled(sky.convert("RGBA"), preview, 0, VIEW_H)
    render_tiled(midground, preview, 0, VIEW_H)
    render_tiled(ground, preview, GROUND_Y, VIEW_H - GROUND_Y)
    preview.convert("RGB").save(RUN / "references" / "stage-background.png", optimize=True)

    stage_reference = resize_cover(
        Image.open(RAW / "stage-reference.png").convert("RGB"), (VIEW_W, VIEW_H)
    )
    stage_reference.save(RUN / "references" / "stage-reference.png", optimize=True)

    qa_preview = preview.copy()
    player_gif = Image.open(IMAGES / "characters" / "trung-trac" / "stance.gif")
    player = remove_magenta(next(ImageSequence.Iterator(player_gif)).convert("RGBA"))
    fallen = Image.open(IMAGES / "obstacles" / "fallen_branch.png").convert("RGBA")
    cart = first_strip_frame(IMAGES / "obstacles" / "tribute_cart_strip4.png", 4)
    soldier = first_strip_frame(IMAGES / "obstacles" / "han_tax_soldier_strip4.png", 4)
    place_bottom_center(qa_preview, player, 110, GROUND_Y, 86)
    place_bottom_center(qa_preview, fallen, 290, GROUND_Y + 7, 39)
    place_bottom_center(qa_preview, cart, 500, GROUND_Y + 7, 92)
    place_bottom_center(qa_preview, soldier, 750, GROUND_Y + 7, 86)
    qa_preview.convert("RGB").save(RUN / "references" / "stage-preview.png", optimize=True)

    for name, image in outputs.items():
        print(name, image.size, seam_metrics(image))
    print("preview", preview.size)


if __name__ == "__main__":
    main()
