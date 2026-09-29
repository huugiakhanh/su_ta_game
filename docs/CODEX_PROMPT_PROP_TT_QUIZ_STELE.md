# Prompt giao Codex — bia đá đánh dấu câu hỏi `PROP_TT_QUIZ_STELE`

Trạng thái: Codex giao 29/09 (`NORMALIZED`), **đã tích hợp** (PNG + mục manifest chép sang
`frontend/static/assets/images/maps-8bit/`, vẽ ở `render.js` `drawQuizSteles()`). Team đã duyệt 29/09 →
`status: IN_GAME` ở cả 2 bản `maps_tt.json`.
Ghi chú gốc: Dùng cho mốc câu hỏi chặn đường (TT-QUIZ-01): màn 1 chunk 3, 5, 8,
10 (vùng Z1, Z2, Z3, Z4); màn 2 chunk 2, 5, 8 (Z1, Z3, Z4). Hiện câu hỏi tự hiện khi chạm mốc, người chơi
không thấy trước.
Sau khi team duyệt: Claude chép PNG + mục `maps_tt.json` sang `frontend/static/assets/images/maps-8bit/`,
thêm vào `MAP_PROPS_IN_GAME` và vẽ bia tại `quiz.x` (đổi `active` → `done` khi đã trả lời). Bia **không có
hitbox**.

---

## PROMPT (dán nguyên văn cho Codex)

Làm theo `SUTA_TT_MAP_BRIEF.md` (art bible mục 3, output mục 6, QA mục 7, report mục 8). Chỉ làm việc trong
`assets/maps/trung-trac/`, không sửa code, không sửa asset khác.

**Nhiệm vụ:** vẽ 1 prop **bia đá đánh dấu câu hỏi lịch sử** cho game "Sử Ta" — platformer 2D 8-bit, bối
cảnh khởi nghĩa Hai Bà Trưng (năm 40 SCN). Người chơi đi tới bia thì game dừng và hỏi 1 câu lịch sử. Bia
phải **nhận ra được từ xa** là "chỗ có câu hỏi", nhưng vẫn là đồ vật của làng Lạc Việt.

**Contract (Source of Truth, không đổi):**

| Trường | Giá trị |
|---|---|
| ID | `PROP_TT_QUIZ_STELE` |
| category | `prop` |
| priority | `P1` |
| Khung mỗi ô | **32×48**, pivot **bottom-center** `(16, 48)`, đáy bia chạm hàng cuối (đặt trên `GROUND_Y`) |
| Trạng thái `active` | strip ngang **4 ô** (128×48), loop, **6 fps** — chưa trả lời |
| Trạng thái `done` | **1 ô** (32×48) — đã trả lời |
| File | `props/PROP_TT_QUIZ_STELE/prop_tt_quiz_stele_active.png`, `props/PROP_TT_QUIZ_STELE/prop_tt_quiz_stele_done.png` |
| Nền | trong suốt thật (true alpha) |
| zone | `Z1`, `Z2`, `Z3`, `Z4` (làng, đồng lúa, rừng, bến sông — trời ngày) |

**Nội dung hình:**
- **Tảng đá dựng thô** (bia đá cổ, mặt trước hơi phẳng, đỉnh bo tròn hoặc hơi lệch), cao khoảng **36–40 px**
  (người chơi cao 42 px), rộng khoảng 20–24 px, chân có vài hòn đá nhỏ và túm cỏ. Đá xám-nâu ấm, bóng 1–2
  tông, sáng từ trên-trái.
- Mặt bia **khắc hoa văn trống đồng Đông Sơn**: mặt trời nhiều tia ở giữa, vòng tròn đồng tâm hoặc chim Lạc
  cách điệu.
- **`active`** (4 ô, loop): đường khắc **phát sáng vàng đồng ấm** (`#E0B04A` → `#F4D27A`), sáng lên rồi dịu
  xuống trong 4 ô (thở nhẹ, không chớp gắt). Có thể thêm 1–2 đốm sáng nhỏ bay lên quanh đỉnh bia. Thân đá
  **không đổi** giữa các ô (chỉ phần sáng thay đổi) để bia không rung.
- **`done`** (1 ô): cùng tảng đá, cùng vị trí từng pixel, đường khắc **tắt sáng** (chỉ còn rãnh khắc tối),
  có thể thêm rêu nhẹ — nhìn là biết "đã xong".
- Chừa lề ≥ 1 px hai bên và phía trên; ánh sáng/đốm sáng không chạm mép ô.

**Cấm (theo mục 3.3 + riêng asset này):**
- **Không chữ** dưới mọi dạng (chữ Hán, chữ Nôm, chữ Việt, chữ cái Latin), không dấu hỏi "?", không ký hiệu
  hiện đại. Bia đá có khắc chữ là của thời kỳ sau — ở đây chỉ khắc hoa văn.
- Không rùa đội bia, không mái che, không kiểu bia đình chùa về sau; không gạch, không kim loại.
- Không dùng đỏ `#C8322A` / `#8E1F24` / `#B8363A` làm mảng lớn; không magenta/hồng sen.

**Kỹ thuật (mục 3.1):** pixel art 1×, khối màu phẳng, không anti-alias, không gradient/glow mềm (ánh sáng
làm bằng các bậc màu rời); outline 1 px `#1A1414` như vật cản (người chơi tương tác với bia); downscale
nearest-neighbor. Bia phải nổi rõ trên cả 4 nền `BG_TT_MID_VILLAGE`, `BG_TT_MID_FIELDS`,
`BG_TT_MID_FOREST`, `BG_TT_MID_RIVER` — kiểm tra bằng mockup.

**Output:**
1. 2 file PNG theo bảng contract + `raw/` (ảnh generate gốc) + file prompt đã dùng.
2. Mockup `mockups/mockup_quiz_stele.png` (+ bản ×3): bia `active` và `done` đặt trên mặt đất (`GROUND_Y` =
   248) trước 4 lớp giữa nêu trên, cạnh `PLAYER_TRUNG_TRAC` idle để so tỉ lệ.
3. Thêm 1 mục vào `assets/maps/trung-trac/maps_tt.json` (không sửa mục khác):
   ```json
   {
     "id": "PROP_TT_QUIZ_STELE",
     "category": "prop",
     "file": "props/PROP_TT_QUIZ_STELE/prop_tt_quiz_stele_active.png",
     "state_files": {
       "active": "props/PROP_TT_QUIZ_STELE/prop_tt_quiz_stele_active.png",
       "done": "props/PROP_TT_QUIZ_STELE/prop_tt_quiz_stele_done.png"
     },
     "w": 128, "h": 48, "frame_w": 32, "frame_h": 48,
     "transparent": true,
     "zone": ["Z1", "Z2", "Z3", "Z4"],
     "anchor": "bottom-center",
     "pivot": {"x": 16, "y": 48},
     "frames": 4,
     "frame_states": ["active", "done"],
     "fps": 6,
     "loop": true,
     "priority": "P1",
     "status": "NORMALIZED",
     "prompt": "props/PROP_TT_QUIZ_STELE/prop_tt_quiz_stele.prompt.txt",
     "raw": ["raw/prop_tt_quiz_stele_active_raw.png", "raw/prop_tt_quiz_stele_done_raw.png"],
     "qa_notes": ""
   }
   ```
   (`frames`/`fps`/`loop` là của trạng thái `active`; `done` là 1 ô tĩnh.)
4. Cập nhật `assets/maps/trung-trac/MAP_REPORT_TT.md` (mục 8): bảng QA, xung đột với skill,
   `NEED_REDRAW`/`TODO_MISSING`, câu hỏi cho team.

**QA tự kiểm trước khi báo NORMALIZED:** đúng kích thước 128×48 và 32×48; alpha thật, không viền
magenta/trắng; thân đá trùng khít từng pixel giữa 4 ô `active` và ô `done` (chỉ phần sáng khác); đáy bia
cùng hàng ở mọi ô; không chữ/ký hiệu; bia đọc rõ trên cả 4 nền ở ×1 và ×3.

Status tối đa `NORMALIZED`. Dừng lại chờ người duyệt, không làm asset khác.
