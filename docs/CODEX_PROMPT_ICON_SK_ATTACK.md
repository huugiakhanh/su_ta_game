# Prompt giao Codex — icon nút Đánh `ICON_SK_ATTACK`

Trạng thái: Codex giao 29/09 (`NORMALIZED`); đã chép PNG + chèn đúng mục manifest (không
chép đè cả manifest — bản chạy có `qa_notes` mới hơn ở `NPC_TRUNG_NHI`, `EN_HAN_RUSHER`) sang
`frontend/static/assets/images/trung-trac/sprites-8bit/`; nút ĐÁNH đang dùng (`ATTACK_ICON`, `ui.js`).
Team đã duyệt 29/09 → `status: IN_GAME` ở cả 2 manifest.

---

## PROMPT (dán nguyên văn cho Codex)

Dùng skill agent-sprite-forge / `$generate2dsprite`. Tuân theo `SUTA_TT_SPRITE_BRIEF.md`
(art bible mục 2, QA mục 7, report mục 8). Chỉ làm việc trong `assets/sprites/`,
không sửa code, không sửa asset khác.

**Nhiệm vụ:** vẽ 1 icon cho nút **Đánh (tấn công cận chiến)** của Trưng Trắc — game
"Sử Ta", platformer 2D 8-bit, bối cảnh khởi nghĩa Hai Bà Trưng (năm 40). Cùng bộ với
`ICON_SK_DASH` (xem `assets/sprites/icon/ICON_SK_DASH/icon_sk_dash_idle.png` để khớp
phong cách, độ dày outline, mật độ chi tiết).

**Contract (Source of Truth, không đổi):**

| Trường | Giá trị |
|---|---|
| ID | `ICON_SK_ATTACK` |
| category | `icon` |
| priority | `P1` |
| Canvas | **32×32**, 1 frame tĩnh |
| Animation | `idle` — frames 1, fps 1, loop false, hit_frame null |
| File | `assets/sprites/icon/ICON_SK_ATTACK/icon_sk_attack_idle.png` |
| pivot / facing | `bottom-center` / `right` (đường chém hướng sang PHẢI) |
| Nền | trong suốt thật (true alpha) |

**Nội dung hình:**
- Biểu tượng **nhát chém kiếm**: thanh kiếm/đoản kiếm của Trưng Trắc (lưỡi sáng, chuôi
  nâu-đỏ như `PLAYER_TRUNG_TRAC.attack_01`) đặt chéo từ dưới-trái lên trên-phải, kèm
  **1 vệt chém hình cung** trắng ngà `#FFF4D5` + vàng `#E8B94A` phía trước lưỡi.
  Đối chiếu vũ khí thật trong strip `player/PLAYER_TRUNG_TRAC/*attack_01*` — không vẽ
  vũ khí khác loại (không rìu, không giáo).
- Không vẽ khiên, không vẽ nhân vật đầy đủ — chỉ vũ khí + vệt chém, khối lớn.
- **Hiển thị trong nút TRÒN đường kính ~72 px** (phóng ~×2.25, nearest-neighbor,
  nút mờ 55% trên nền cảnh game, viền vàng `#C9A15A`, nền nút nâu `#64411D`) → toàn bộ
  nội dung quan trọng phải nằm trong **hình tròn nội tiếp** (tâm 16,16, bán kính ~14 px);
  4 góc bị cắt, không đặt gì ở đó.
- Tương phản cao trên cả nền tối lẫn nền trời sáng: lưỡi kiếm sáng có outline tối.
- Không chữ, không số, không nhãn phím.

**Kỹ thuật (theo brief mục 2.1):** 8-bit, khối màu phẳng, bóng 1–2 tông, outline 1px
`#1A1414`, không anti-alias, không gradient/glow mềm; downscale nearest-neighbor;
cấm magenta/hồng sen trong hình; palette trong mục 2.2 (lệch nhỏ phải ghi chú).

**Output:**
1. `icon_sk_attack_idle.png` (32×32) + `frames/idle_01.png` + `preview/` + `raw/` + `meta/`
   theo cấu trúc brief mục 6.1.
2. Thêm mục vào `assets/sprites/manifest_tt.json` (không sửa mục khác):
   ```json
   {
     "id": "ICON_SK_ATTACK",
     "category": "icon",
     "priority": "P1",
     "frame_w": 32,
     "frame_h": 32,
     "pivot": "bottom-center",
     "facing": "right",
     "status": "NORMALIZED",
     "animations": [
       { "name": "idle", "file": "icon/ICON_SK_ATTACK/icon_sk_attack_idle.png",
         "frames": 1, "fps": 1, "loop": false, "hit_frame": null }
     ],
     "qa_notes": ""
   }
   ```
3. Cập nhật `assets/sprites/SPRITE_REPORT_TT.md` (mục 8): bảng QA, xung đột với skill,
   `NEED_REDRAW`/`TODO_MISSING`, câu hỏi cho người duyệt. Kèm ảnh xem thử icon phóng ×1,
   ×2 và **×2.25 cắt trong hình tròn 72 px** trên nền `#64411D` mờ 55% đè lên 1 ảnh
   chụp cảnh game (trời sáng) — để kiểm tra độ đọc trong nút thật.

Status tối đa `NORMALIZED`. Dừng lại chờ người duyệt, không làm asset khác.
