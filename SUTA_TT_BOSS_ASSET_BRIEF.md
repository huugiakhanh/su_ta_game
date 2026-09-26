# SỬ TA — CHƯƠNG TRƯNG TRẮC
# BRIEF ASSET BỔ SUNG CHO MÀN 3 (Codex, $generate2dsprite)

Version 1.0 • 26/09/2026
Tuân thủ toàn bộ Art Bible và frame contract trong `SUTA_TT_SPRITE_BRIEF.md` (mục 2–3) và `SUTA_TT_MAP_BRIEF.md` (mục 3). Không sửa code, không chép vào `frontend/`.

Màn 3 (task TT-BOSS-01) đã dùng được asset có sẵn. Hai asset dưới đây để hoàn thiện; code có fallback nên **không phải chờ**.

---

## 1. PROP_TT_VICTORY_FLAG — Cờ chiến thắng trên cổng Luy Lâu • P0

- **Canvas:** 24×32, pivot **bottom-left** (điểm gốc cán cờ). Strip 4 ô, lặp, gợi ý 6 fps.
- **Nội dung:** cán gỗ hoặc tre ngắn; lá cờ vải bay về bên phải, phấp phới qua 4 ô.
  - Màu: nền đỏ `#C8322A` (cùng màu thắt lưng Trưng Trắc), viền và họa tiết vòng tròn Đông Sơn màu đồng `#E3B25C`.
  - Có thể thêm hình chim Lạc giản lược.
- **Cấm:** chữ (Hán, Nôm, Latin), sao vàng, cờ hiện đại, bất cứ thứ gì gợi quốc kỳ ngày nay.
- **Điểm gắn:** đo vị trí đỉnh cột cờ trống trên `PROP_LUYLAU_GATE_OPEN` (192×176) và ghi vào `maps_tt.json` của cổng mở dưới dạng `"flag_attach": {"x": …, "y": …}` (toạ độ trong canvas cổng, là nơi đặt pivot của cờ). Đây là trường **mới**, chỉ thêm, không sửa trường cũ.
- **Mockup:** `mockup_boss_flag.png` 480×270 (+ bản ×3): cổng mở trên nền Z5 có cờ cắm đúng điểm gắn, kèm Trưng Trắc đứng trước cổng.
- **Output:** `assets/maps/trung-trac/props/PROP_TT_VICTORY_FLAG/prop_tt_victory_flag.png` + mục trong `maps_tt.json` (`status: NORMALIZED`).

## 2. BOSS_TO_DINH_FOOT — thêm animation `hurt` • P1

- Canvas 48×48, **2 ô**, 8 fps, không lặp.
- Nội dung: Tô Định (mũ quan đen cao, áo bào đỏ sẫm, râu dài, cầm kiếm) giật lùi, co người, **vẫn cầm kiếm**.
- Tỉ lệ thân phải bằng `idle`: dùng strip `idle` làm reference, xếp cạnh nhau trên cùng baseline để tự kiểm.
- Cập nhật `assets/sprites/manifest_tt.json`: **chỉ thêm** animation `hurt`, không đổi các animation khác.

---

## 3. QA VÀ BÁO CÁO

- **QA:** theo mục 7 của hai brief gốc.
- **Báo cáo:** thêm mục "Boss assets — <ngày>" vào `MAP_REPORT_TT.md` (cho cờ) và `SPRITE_REPORT_TT.md` (cho `hurt`).
- Làm xong thì **dừng chờ duyệt**.
