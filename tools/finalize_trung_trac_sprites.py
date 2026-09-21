"""Assemble processed Trưng Trắc frames into runtime-ready PNG assets.

The creative art is generated externally. This helper only performs deterministic
alpha-bound cropping and horizontal strip assembly while preserving each frame's
shared processor coordinates.
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PROCESSED = ROOT / "artifacts" / "sprite-forge-trung-trac" / "processed"
OBSTACLES = ROOT / "frontend" / "static" / "assets" / "images" / "obstacles"
ITEMS = ROOT / "frontend" / "static" / "assets" / "images" / "items"


STRIPS = {
    "han_tax_soldier": (OBSTACLES / "han_tax_soldier_strip4.png", 4, True),
    "tribute_cart": (OBSTACLES / "tribute_cart_strip4.png", 4, True),
    "watchtower_guard": (OBSTACLES / "watchtower_guard_strip4.png", 4, True),
    "jungle_tiger": (OBSTACLES / "jungle_tiger_strip6.png", 6, True),
    "han_cavalry": (OBSTACLES / "han_cavalry_strip6.png", 6, True),
    "patrol_boat": (OBSTACLES / "patrol_boat_strip4.png", 4, False),
    "official_palanquin": (OBSTACLES / "official_palanquin_strip4.png", 4, True),
    "coin_pouch": (ITEMS / "coin_pouch_strip2.png", 2, False),
    "fire_arrow": (ITEMS / "fire_arrow_strip2.png", 2, False),
    "throwing_dart": (ITEMS / "throwing_dart_strip2.png", 2, False),
}

SINGLES = {
    "spike_pit_hidden": OBSTACLES / "spike_pit_hidden.png",
    "spike_pit_open": OBSTACLES / "spike_pit_open.png",
    "watchtower": OBSTACLES / "watchtower.png",
    "tribute_cart_broken": OBSTACLES / "tribute_cart_broken.png",
}


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    bbox = image.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError("Encountered an empty processed frame")
    return bbox


def union_box(images: list[Image.Image], side_pad: int = 4, top_pad: int = 4) -> tuple[int, int, int, int]:
    boxes = [alpha_bbox(image) for image in images]
    left = max(0, min(box[0] for box in boxes) - side_pad)
    top = max(0, min(box[1] for box in boxes) - top_pad)
    right = min(images[0].width, max(box[2] for box in boxes) + side_pad)
    # Intentionally no bottom padding: grounded content must touch the frame edge.
    bottom = min(images[0].height, max(box[3] for box in boxes))
    return left, top, right, bottom


def load_processed_frames(name: str, expected: int) -> list[Image.Image]:
    folder = PROCESSED / name
    meta = json.loads((folder / "pipeline-meta.json").read_text(encoding="utf-8"))
    labels = meta["frame_labels"]
    if len(labels) != expected:
        raise ValueError(f"{name}: expected {expected} frames, found {len(labels)}")
    return [Image.open(folder / f"{label}.png").convert("RGBA") for label in labels]


def build_strip(name: str, output: Path, expected: int, ground_each_frame: bool) -> None:
    frames = load_processed_frames(name, expected)
    crop = union_box(frames)
    cropped = [frame.crop(crop) for frame in frames]
    cell_w, cell_h = cropped[0].size
    strip = Image.new("RGBA", (cell_w * expected, cell_h), (0, 0, 0, 0))
    for index, frame in enumerate(cropped):
        if ground_each_frame:
            bbox = alpha_bbox(frame)
            drop = cell_h - bbox[3]
            if drop:
                grounded = Image.new("RGBA", frame.size, (0, 0, 0, 0))
                grounded.alpha_composite(frame, (0, drop))
                frame = grounded
        strip.alpha_composite(frame, (index * cell_w, 0))
    output.parent.mkdir(parents=True, exist_ok=True)
    strip.save(output, optimize=True)


def build_single(name: str, output: Path) -> None:
    frame = load_processed_frames(name, 1)[0]
    left, top, right, bottom = alpha_bbox(frame)
    left = max(0, left - 4)
    top = max(0, top - 4)
    right = min(frame.width, right + 4)
    # No bottom padding, per the engine's bottom-anchor contract.
    output.parent.mkdir(parents=True, exist_ok=True)
    frame.crop((left, top, right, bottom)).save(output, optimize=True)


def main() -> None:
    for name, (output, count, grounded) in STRIPS.items():
        build_strip(name, output, count, grounded)
        print(output.relative_to(ROOT))
    for name, output in SINGLES.items():
        build_single(name, output)
        print(output.relative_to(ROOT))


if __name__ == "__main__":
    main()
