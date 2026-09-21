"""Crop the generated finish gate and build an in-map QA preview.

The artwork itself comes from image generation. This script only performs
deterministic alpha cropping, baseline alignment, resizing, and compositing.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
RUN = ROOT / "artifacts" / "map-trung-trac-v2"
PROCESSED = RUN / "processed" / "finish-gate"
REFERENCES = RUN / "references"
RUNTIME = ROOT / "frontend" / "static" / "assets" / "images" / "backdrops" / "chapter1"

DISPLAY_HEIGHT = 250
GROUND_Y = 290
SINK = 14
PREVIEW_X = 650


def crop_with_safe_margin(image: Image.Image, margin: int = 6) -> Image.Image:
    rgba = image.convert("RGBA")
    bbox = rgba.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError("Finish gate contains no visible pixels")
    left, top, right, bottom = bbox
    # Preserve a small transparent margin around the sides and roof. The foot
    # pixels stay on the last row so the runtime bottom-center anchor is exact.
    left = max(0, left - margin)
    top = max(0, top - margin)
    right = min(rgba.width, right + margin)
    return rgba.crop((left, top, right, bottom))


def composite_preview(gate: Image.Image) -> Image.Image:
    background = Image.open(REFERENCES / "stage-background.png").convert("RGBA")
    scale = DISPLAY_HEIGHT / gate.height
    width = round(gate.width * scale)
    resized = gate.resize((width, DISPLAY_HEIGHT), Image.Resampling.LANCZOS)
    left = PREVIEW_X - width // 2
    top = GROUND_Y + SINK - DISPLAY_HEIGHT
    background.alpha_composite(resized, (left, top))
    return background


def main() -> None:
    source = PROCESSED / "finish-gate-1.png"
    if not source.exists():
        source = PROCESSED / "single-1.png"
    gate = crop_with_safe_margin(Image.open(source))
    runtime_path = RUNTIME / "finish-gate.png"
    gate.save(runtime_path, optimize=True)

    preview = composite_preview(gate)
    preview_path = REFERENCES / "finish-gate-preview.png"
    preview.save(preview_path, optimize=True)

    bbox = gate.getchannel("A").getbbox()
    print(f"runtime={runtime_path}")
    print(f"size={gate.size} alpha_bbox={bbox}")
    print(f"preview={preview_path}")


if __name__ == "__main__":
    main()
