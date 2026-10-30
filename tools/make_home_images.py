"""Tạo ảnh nhẹ cho web (trang chủ HOME-LAZY-01, Thư viện lịch sử). ẢNH GỐC GIỮ NGUYÊN — chỉ sinh thêm bản WebP.

- Avatar nhân vật: assets/images/characters/avatar/<tên>.png (1024×707, ~1,2 MB)
  -> avatar/thumb/<tên>.webp rộng 440px. Dùng ở thẻ dòng thời gian trang chủ (≤ 320px),
  thẻ trang /history (250px), ảnh tròn đầu trang nhân vật (170px).
- Ảnh minh hoạ thư viện: assets/images/characters/library/<tên>.png (1024×1536, ~3,4 MB)
  -> library/web/<tên>.webp giữ nguyên chiều rộng 1024px (hiển thị ≤ 900px), chỉ đổi định dạng.
- Logo: assets/images/logo2.png (1536×1024, 2,9 MB) -> logo2.webp rộng 700px
  (logo hiển thị tối đa 350px).
- Favicon: assets/images/favicon.png (1254×1254, ~1,5 MB) -> favicon-64.png 64×64
  (tab trình duyệt cần 16–32px, 64px cho màn hình mật độ cao). Giữ PNG cho mọi trình duyệt.

Chạy lại sau khi thêm/đổi ảnh gốc (cần Pillow):
    python tools/make_home_images.py
"""
from pathlib import Path

from PIL import Image

IMAGES = Path(__file__).resolve().parent.parent / "frontend" / "static" / "assets" / "images"
AVATAR_DIR = IMAGES / "characters" / "avatar"
LIBRARY_DIR = IMAGES / "characters" / "library"
THUMB_WIDTH = 440
LIBRARY_WIDTH = 1024
LOGO_WIDTH = 700
FAVICON_SIZE = 64
QUALITY = 82


def save_resized(source, target, width):
    with Image.open(source) as image:
        width = min(width, image.width)  # không phóng to
        height = round(image.height * width / image.width)
        resized = image.resize((width, height), Image.LANCZOS) if width != image.width else image.copy()
        target.parent.mkdir(parents=True, exist_ok=True)
        resized.save(target, "WEBP", quality=QUALITY, method=6)
    print(f"{source.name}: {source.stat().st_size // 1024} KB -> {target.name}: {target.stat().st_size // 1024} KB")


def save_favicon(source, target, size):
    with Image.open(source) as image:
        image.resize((size, size), Image.LANCZOS).save(target, "PNG", optimize=True)
    print(f"{source.name}: {source.stat().st_size // 1024} KB -> {target.name}: {target.stat().st_size} B")


def main():
    for source in sorted(AVATAR_DIR.glob("*.png")):
        save_resized(source, AVATAR_DIR / "thumb" / f"{source.stem}.webp", THUMB_WIDTH)
    for source in sorted(LIBRARY_DIR.glob("*.png")):
        save_resized(source, LIBRARY_DIR / "web" / f"{source.stem}.webp", LIBRARY_WIDTH)
    save_resized(IMAGES / "logo2.png", IMAGES / "logo2.webp", LOGO_WIDTH)
    save_favicon(IMAGES / "favicon.png", IMAGES / "favicon-64.png", FAVICON_SIZE)


if __name__ == "__main__":
    main()
