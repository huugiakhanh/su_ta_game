"""Finalize the redrawn NPC_TRUNG_NHI attack for the 48x48 runtime."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ACTOR = ROOT / "assets/sprites/npc/NPC_TRUNG_NHI"
RUNTIME = ROOT / "frontend/static/assets/images/trung-trac/sprites-8bit/npc/NPC_TRUNG_NHI"
SOURCE = ACTOR / "redraw-2026-09-27/attack/final"
RAW_SOURCE = ACTOR / "redraw-2026-09-27/attack/raw-sheet.png"
ALPHA_THRESHOLD = 96
FRAME_COUNT = 6


def approved_palette() -> list[tuple[int, int, int]]:
    colors: set[tuple[int, int, int]] = set()
    for path in sorted(RUNTIME.glob("*.png")):
        image = Image.open(path).convert("RGBA")
        colors.update((r, g, b) for r, g, b, a in image.get_flattened_data() if a)
    if not colors:
        raise ValueError("NPC_TRUNG_NHI has no approved runtime palette")
    return sorted(colors)


def nearest(color: tuple[int, int, int], palette: list[tuple[int, int, int]]) -> tuple[int, int, int]:
    r, g, b = color
    return min(palette, key=lambda p: (r - p[0]) ** 2 + (g - p[1]) ** 2 + (b - p[2]) ** 2)


def normalize_frame(path: Path, palette: list[tuple[int, int, int]]) -> Image.Image:
    source = Image.open(path).convert("RGBA")
    if source.size != (48, 48):
        raise ValueError(f"{path}: expected 48x48, found {source.size}")
    cache: dict[tuple[int, int, int], tuple[int, int, int]] = {}
    pixels: list[tuple[int, int, int, int]] = []
    for r, g, b, a in source.get_flattened_data():
        if a < ALPHA_THRESHOLD:
            pixels.append((0, 0, 0, 0))
            continue
        rgb = (r, g, b)
        mapped = cache.setdefault(rgb, nearest(rgb, palette))
        pixels.append((*mapped, 255))
    output = Image.new("RGBA", source.size, (0, 0, 0, 0))
    output.putdata(pixels)
    return output


def alpha_bbox(frame: Image.Image) -> list[int]:
    bbox = frame.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError("Encountered an empty attack frame")
    return list(bbox)


def main() -> None:
    palette = approved_palette()
    frames = [normalize_frame(SOURCE / f"attack_01-{index}.png", palette) for index in range(1, FRAME_COUNT + 1)]

    strip = Image.new("RGBA", (48 * FRAME_COUNT, 48), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        strip.alpha_composite(frame, (48 * index, 0))
    strip.save(ACTOR / "npc_trung_nhi_attack_01.png", optimize=True)
    strip.save(RUNTIME / "npc_trung_nhi_attack_01.png", optimize=True)

    frames_dir = ACTOR / "frames"
    for index, frame in enumerate(frames, 1):
        frame.save(frames_dir / f"attack_01_{index:02d}.png", optimize=True)

    frames[0].save(
        ACTOR / "preview/attack_01.gif",
        save_all=True,
        append_images=frames[1:],
        duration=71,
        loop=0,
        disposal=2,
        transparency=0,
    )

    shutil.copy2(RAW_SOURCE, ACTOR / "raw/npc_trung_nhi_attack_01_raw.png")
    shutil.copy2(SOURCE / "raw-sheet-clean.png", ACTOR / "raw/npc_trung_nhi_attack_01_raw_clean.png")
    shutil.copy2(SOURCE / "pipeline-meta.json", ACTOR / "meta/attack_01_pipeline-meta.json")

    bboxes = [alpha_bbox(frame) for frame in frames]
    edge_touch = [
        index
        for index, (left, top, right, bottom) in enumerate(bboxes, 1)
        if left == 0 or top == 0 or right == 48 or bottom == 48
    ]
    colors = {
        (r, g, b)
        for frame in frames
        for r, g, b, a in frame.get_flattened_data()
        if a
    }
    metadata = {
        "asset_id": "NPC_TRUNG_NHI",
        "animation": "attack_01",
        "frame_size": [48, 48],
        "frame_count": FRAME_COUNT,
        "fps": 14,
        "hit_frame": 3,
        "alpha": "binary",
        "alpha_threshold": ALPHA_THRESHOLD,
        "opaque_color_count": len(colors),
        "palette_pool_size": len(palette),
        "anchor": "feet",
        "bboxes": bboxes,
        "edge_touch_frames": edge_touch,
        "redrawn": "2026-09-27",
    }
    (ACTOR / "meta/attack_01_normalization.json").write_text(
        json.dumps(metadata, indent=2) + "\n", encoding="utf-8"
    )
    print("finalized NPC_TRUNG_NHI attack_01")


if __name__ == "__main__":
    main()
