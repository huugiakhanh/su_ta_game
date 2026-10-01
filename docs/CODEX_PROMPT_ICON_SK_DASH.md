# Prompt giao Codex — icon kỹ năng Lướt `ICON_SK_DASH`

Trạng thái: Codex giao 27/09 (`NORMALIZED`); đã chép strip + mục manifest sang
`frontend/static/assets/images/trung-trac/sprites-8bit/`, ô HUD đang dùng. Team đã duyệt 27/09 →
`status: IN_GAME` ở cả 2 manifest.

---

## PROMPT (dán nguyên văn cho Codex)

Dùng skill agent-sprite-forge / `$generate2dsprite`. Tuân theo `SUTA_TT_SPRITE_BRIEF.md`
(art bible mục 2, QA mục 7, report mục 8). Chỉ làm việc trong `assets/sprites/`,
không sửa code, không sửa asset khác.

**Nhiệm vụ:** vẽ 1 icon HUD cho kỹ năng **Lướt (dash)** của Trưng Trắc — game "Sử Ta",
platformer 2D 8-bit, bối cảnh khởi nghĩa Hai Bà Trưng (năm 40).

**Contract (Source of Truth, không đổi):**

| Trường | Giá trị |
|---|---|
| ID | `ICON_SK_DASH` |
| category | `icon` |
| priority | `P1` |
| Canvas | **32×32**, 1 frame tĩnh |
| Animation | `idle` — frames 1, fps 1, loop false, hit_frame null |
| File | `assets/sprites/icon/ICON_SK_DASH/icon_sk_dash_idle.png` |
| pivot / facing | `bottom-center` / `right` (hướng lao sang PHẢI) |
| Nền | trong suốt thật (true alpha) |

**Nội dung hình:**
- Biểu tượng cú lướt nhanh sang phải: bóng/dáng Trưng Trắc cúi người lao tới
  (khăn đỏ, áo nâu-đỏ như `PLAYER_TRUNG_TRAC`) HOẶC một mũi giày/vạt áo kèm
  **3–4 vệt gió ngang** phía sau. Chọn cách đọc rõ nhất ở cỡ nhỏ.
- Vệt gió màu xanh nhạt `#6FC3E8` (màu dash trong game) + trắng ngà `#FFF4D5`, có
  thể thêm 1 tông xanh đậm hơn làm bóng.
- Phải đọc được ở cỡ hiển thị **~30×30 px** trong ô HUD viền vàng `#C9A15A`, nền
  ô nâu sẫm `#1D100A` → dùng khối lớn, tương phản cao với nền tối, không chi tiết li ti.
- Chừa lề ≥ 1px quanh hình; góc **dưới-phải** 12×10 px bị che bởi nhãn phím "S" →
  không đặt chi tiết quan trọng ở đó.
- Không chữ, không số trong icon (số giây hồi chiêu do game vẽ đè lên).

**Kỹ thuật (theo brief mục 2.1):** 8-bit, khối màu phẳng, bóng 1–2 tông, outline 1px
`#1A1414`, không anti-alias, không gradient/glow mềm; downscale nearest-neighbor;
cấm magenta/hồng sen trong hình; palette trong mục 2.2 (lệch nhỏ phải ghi chú).

**Output:**
1. `icon_sk_dash_idle.png` (32×32) + `frames/idle_01.png` + `preview/` + `raw/` + `meta/`
   theo cấu trúc brief mục 6.1.
2. Thêm mục vào `assets/sprites/manifest_tt.json` (không sửa mục khác):
   ```json
   {
     "id": "ICON_SK_DASH",
     "category": "icon",
     "priority": "P1",
     "frame_w": 32,
     "frame_h": 32,
     "pivot": "bottom-center",
     "facing": "right",
     "status": "NORMALIZED",
     "animations": [
       { "name": "idle", "file": "icon/ICON_SK_DASH/icon_sk_dash_idle.png",
         "frames": 1, "fps": 1, "loop": false, "hit_frame": null }
     ],
     "qa_notes": ""
   }
   ```
3. Cập nhật `assets/sprites/SPRITE_REPORT_TT.md` (mục 8): bảng QA, xung đột với skill,
   `NEED_REDRAW`/`TODO_MISSING`, câu hỏi cho người duyệt. Kèm 1 ảnh xem thử icon
   phóng ×4 và ×1 trên nền `#1D100A`.

Status tối đa `NORMALIZED`. Dừng lại chờ người duyệt, không làm asset khác.
