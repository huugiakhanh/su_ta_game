"""Tạo ảnh thu nhỏ cho trang chủ (HOME-LAZY-01). ẢNH GỐC GIỮ NGUYÊN — chỉ sinh thêm bản nhỏ.

- Thẻ dòng thời gian: assets/images/characters/avatar/<tên>.png (1024×707, ~1,2 MB)
  -> avatar/thumb/<tên>.webp rộng 440px (thẻ hiển thị 220×110, đủ nét màn hình ×2).
- Logo: assets/images/logo2.png (1536×1024, 2,9 MB) -> logo2.webp rộng 700px
  (logo hiển thị tối đa 350px).

Chạy lại sau khi thêm/đổi ảnh gốc (cần Pillow):
    python tools/make_home_images.py
"""
from pathlib import Path

from PIL import Image

IMAGES = Path(__file__).resolve().parent.parent / "frontend" / "static" / "assets" / "images"
AVATAR_DIR = IMAGES / "characters" / "avatar"
THUMB_WIDTH = 440
LOGO_WIDTH = 700
QUALITY = 82


def save_resized(source, target, width):
    with Image.open(source) as image:
        height = round(image.height * width / image.width)
        resized = image.resize((width, height), Image.LANCZOS)
        target.parent.mkdir(parents=True, exist_ok=True)
        resized.save(target, "WEBP", quality=QUALITY, method=6)
    print(f"{source.name}: {source.stat().st_size // 1024} KB -> {target.name}: {target.stat().st_size // 1024} KB")


def main():
    for source in sorted(AVATAR_DIR.glob("*.png")):
        save_resized(source, AVATAR_DIR / "thumb" / f"{source.stem}.webp", THUMB_WIDTH)
    save_resized(IMAGES / "logo2.png", IMAGES / "logo2.webp", LOGO_WIDTH)


if __name__ == "__main__":
    main()
