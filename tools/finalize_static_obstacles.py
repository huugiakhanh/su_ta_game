"""Publish the regenerated historical static-obstacle set to runtime assets.

Creative pixels come from built-in image generation and are processed by the
generate2dsprite pipeline. This helper only crops transparent padding and maps
the accepted atlas cells to the filenames already consumed by the game.
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PROCESSED = ROOT / "artifacts" / "static-obstacles-v2" / "processed"
RUNTIME = ROOT / "frontend" / "static" / "assets" / "images" / "obstacles"
REFERENCES = ROOT / "artifacts" / "static-obstacles-v2" / "references"
MAP_REFERENCE = ROOT / "artifacts" / "map-trung-trac-v2" / "references" / "stage-background.png"

ASSETS = {
    "fallen_branch.png": ("compact", "compact-1"),
    "stone_block.png": ("compact", "compact-2"),
    "log.png": ("compact", "compact-3"),
    "spikes.png": ("compact", "compact-4"),
    "fence_low.png": ("structures", "structure-1"),
    "fence_high.png": ("structures", "structure-2"),
    "reed_curtain.png": ("structures", "structure-3"),
    "slide_bar.png": ("structures", "structure-4"),
    "bamboo_slope.png": ("terrain", "terrain-1"),
    "bridge.png": ("terrain", "terrain-2"),
}

PREVIEW_HEIGHTS = {
    "fallen_branch.png": 64,
    "stone_block.png": 64,
    "log.png": 60,
    "spikes.png": 64,
    "fence_low.png": 52,
    "fence_high.png": 96,
    "reed_curtain.png": 90,
    "slide_bar.png": 88,
    "bamboo_slope.png": 104,
    "bridge.png": 78,
}


def crop_grounded(frame: Image.Image, side_pad: int = 4, top_pad: int = 4) -> Image.Image:
    rgba = frame.convert("RGBA")
    bbox = rgba.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError("Encountered an empty processed obstacle frame")
    left, top, right, bottom = bbox
    left = max(0, left - side_pad)
    top = max(0, top - top_pad)
    right = min(rgba.width, right + side_pad)
    # No bottom padding: every runtime obstacle is bottom-anchored to the map.
    return rgba.crop((left, top, right, bottom))


def validate_pipeline(folder: Path, label: str) -> None:
    meta = json.loads((folder / "pipeline-meta.json").read_text(encoding="utf-8"))
    if label not in meta["frame_labels"]:
        raise ValueError(f"{folder.name}: missing processed frame {label}")
    if meta["output_edge_touch_frames"] or meta["paste_clamped_frames"]:
        raise ValueError(f"{folder.name}: processed output failed edge/clamp QC")


def build_map_preview() -> None:
    """Place every published sprite against the actual runtime background."""
    band = Image.open(MAP_REFERENCE).convert("RGBA")
    preview = Image.new("RGBA", (band.width * 2, band.height * 2), (0, 0, 0, 0))
    for row in range(2):
        preview.alpha_composite(band, (0, row * band.height))
        preview.alpha_composite(band, (band.width, row * band.height))
    ground_y = 324
    names = list(ASSETS)
    for index, filename in enumerate(names):
        row, column = divmod(index, 5)
        sprite = Image.open(RUNTIME / filename).convert("RGBA")
        height = PREVIEW_HEIGHTS[filename]
        width = round(sprite.width * height / sprite.height)
        sprite = sprite.resize((width, height), Image.Resampling.NEAREST)
        center_x = 175 + column * 350
        x = round(center_x - width / 2)
        y = row * band.height + ground_y - height + 7
        preview.alpha_composite(sprite, (x, y))
    REFERENCES.mkdir(parents=True, exist_ok=True)
    preview.convert("RGB").save(REFERENCES / "obstacle-set-map-preview.png", optimize=True)


def main() -> None:
    RUNTIME.mkdir(parents=True, exist_ok=True)
    for filename, (group, label) in ASSETS.items():
        folder = PROCESSED / group
        validate_pipeline(folder, label)
        output = RUNTIME / filename
        cropped = crop_grounded(Image.open(folder / f"{label}.png"))
        cropped.save(output, optimize=True)
        print(f"{output.relative_to(ROOT)} {cropped.width}x{cropped.height}")
    build_map_preview()
    print((REFERENCES / "obstacle-set-map-preview.png").relative_to(ROOT))


if __name__ == "__main__":
    main()
