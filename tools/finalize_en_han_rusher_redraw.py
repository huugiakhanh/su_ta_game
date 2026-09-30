"""Finalize the redrawn EN_HAN_RUSHER attack/death sheets for runtime use.

Creative pixels come from ImageGen and the generate2dsprite processor. This
helper only applies the actor's approved palette, binary alpha, and the fixed
48x48 horizontal-strip runtime contract.
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ACTOR = ROOT / "assets/sprites/enemy/EN_HAN_RUSHER"
RUNTIME = ROOT / "frontend/static/assets/images/sprites-8bit/enemy/EN_HAN_RUSHER"
REDRAW = ACTOR / "redraw-2026-09-26"
ALPHA_THRESHOLD = 96

ACTIONS = {
    "attack_01": {"frames": 4, "fps": 14, "anchor": "feet", "duration": 71},
    "death": {"frames": 4, "fps": 10, "anchor": "bottom", "duration": 100},
}


def approved_palette() -> list[tuple[int, int, int]]:
    colors: set[tuple[int, int, int]] = set()
    for path in sorted(RUNTIME.glob("*.png")):
        image = Image.open(path).convert("RGBA")
        colors.update((r, g, b) for r, g, b, a in image.get_flattened_data() if a)
    if not colors:
        raise ValueError("EN_HAN_RUSHER has no approved runtime palette")
    return sorted(colors)


def nearest(color: tuple[int, int, int], palette: list[tuple[int, int, int]]) -> tuple[int, int, int]:
    r, g, b = color
    return min(palette, key=lambda p: (r - p[0]) ** 2 + (g - p[1]) ** 2 + (b - p[2]) ** 2)


def normalize_frame(path: Path, palette: list[tuple[int, int, int]]) -> Image.Image:
    source = Image.open(path).convert("RGBA")
    if source.size != (48, 48):
        raise ValueError(f"{path}: expected 48x48, found {source.size}")
    cache: dict[tuple[int, int, int], tuple[int, int, int]] = {}
    output = Image.new("RGBA", source.size, (0, 0, 0, 0))
    pixels: list[tuple[int, int, int, int]] = []
    for r, g, b, a in source.get_flattened_data():
        if a < ALPHA_THRESHOLD:
            pixels.append((0, 0, 0, 0))
            continue
        rgb = (r, g, b)
        mapped = cache.setdefault(rgb, nearest(rgb, palette))
        pixels.append((*mapped, 255))
    output.putdata(pixels)
    return output


def alpha_bbox(frame: Image.Image) -> list[int]:
    bbox = frame.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError("Encountered an empty normalized frame")
    return list(bbox)


def finalize_action(action: str, config: dict[str, object], palette: list[tuple[int, int, int]]) -> None:
    count = int(config["frames"])
    source_dir = REDRAW / action.replace("attack_01", "attack") / "final"
    frames = [normalize_frame(source_dir / f"{action}-{index}.png", palette) for index in range(1, count + 1)]

    strip = Image.new("RGBA", (48 * count, 48), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        strip.alpha_composite(frame, (48 * index, 0))

    strip_name = f"en_han_rusher_{action}.png"
    strip.save(ACTOR / strip_name, optimize=True)
    strip.save(RUNTIME / strip_name, optimize=True)

    frames_dir = ACTOR / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    for index, frame in enumerate(frames, 1):
        frame.save(frames_dir / f"{action}_{index:02d}.png", optimize=True)

    preview_dir = ACTOR / "preview"
    preview_dir.mkdir(parents=True, exist_ok=True)
    frames[0].save(
        preview_dir / f"{action}.gif",
        save_all=True,
        append_images=frames[1:],
        duration=int(config["duration"]),
        loop=0,
        disposal=2,
        transparency=0,
    )

    raw_dir = ACTOR / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(REDRAW / action.replace("attack_01", "attack") / "raw-sheet.png", raw_dir / f"en_han_rusher_{action}_raw.png")
    shutil.copy2(source_dir / "raw-sheet-clean.png", raw_dir / f"en_han_rusher_{action}_raw_clean.png")

    meta_dir = ACTOR / "meta"
    meta_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source_dir / "pipeline-meta.json", meta_dir / f"{action}_pipeline-meta.json")

    bboxes = [alpha_bbox(frame) for frame in frames]
    edge_touch = [
        index
        for index, (left, top, right, bottom) in enumerate(bboxes, 1)
        if left == 0 or top == 0 or right == 48 or bottom == 48
    ]
    opaque_colors = {
        (r, g, b)
        for frame in frames
        for r, g, b, a in frame.get_flattened_data()
        if a
    }
    normalization = {
        "asset_id": "EN_HAN_RUSHER",
        "animation": action,
        "frame_size": [48, 48],
        "frame_count": count,
        "fps": int(config["fps"]),
        "alpha": "binary",
        "alpha_threshold": ALPHA_THRESHOLD,
        "opaque_color_count": len(opaque_colors),
        "palette_pool_size": len(palette),
        "anchor": config["anchor"],
        "bboxes": bboxes,
        "edge_touch_frames": edge_touch,
        "redrawn": "2026-09-26",
    }
    (meta_dir / f"{action}_normalization.json").write_text(
        json.dumps(normalization, indent=2) + "\n", encoding="utf-8"
    )


def main() -> None:
    palette = approved_palette()
    for action, config in ACTIONS.items():
        finalize_action(action, config, palette)
        print(f"finalized EN_HAN_RUSHER {action}")


if __name__ == "__main__":
    main()
