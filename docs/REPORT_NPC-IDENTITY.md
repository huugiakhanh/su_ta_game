# REPORT NPC-IDENTITY — đồng nhất nhận diện NPC Trưng Nhị, Thi Sách

Ngày: 06/10/2026 • Người làm: Claude (soát, tích hợp), Codex (vẽ) • Trạng thái: **XONG phần asset**; test 8 (chơi thử hội thoại màn 2) chưa chạy

## 1. Vấn đề

Trong cùng một NPC có hai dáng người khác nhau. `NPC_TRUNG_NHI.idle`/`run` và `NPC_THI_SACH.idle` là dáng chibi, khớp chân dung
`PORTRAIT_*` và tỉ lệ `PLAYER_TRUNG_TRAC`. Còn `NPC_TRUNG_NHI.talk`, `NPC_TRUNG_NHI.attack_01` và `NPC_THI_SACH.talk` là dáng người
cao mảnh, mặt khác. Trong đó Trưng Nhị `attack_01` còn mang dải đỏ (màu nhận diện của Trưng Trắc), Thi Sách `talk` thì búi tóc buộc
đỏ, không đai trán và lông chim. Hậu quả: NPC màn 2 "biến hình" khi mở hội thoại, Bóng Trưng Nhị màn 3 đổi dáng mỗi cú chém.
Kết luận: lỗi asset (`NEED_REDRAW`), code và manifest đúng.

## 2. Quy trình

| Đợt | Asset | Kết quả soát |
|---|---|---|
| 1 | `NPC_TRUNG_NHI.talk` | ĐẠT (đã sửa lỗi 3 tay trong đợt) → chép vào game |
| 1 | `NPC_THI_SACH.talk` | ĐẠT; ô 2–6 mất chòm râu ở cằm so với `idle` — người dùng chấp nhận, không vá → chép vào game |
| 1 | `NPC_TRUNG_NHI.attack_01` | NEED_REDRAW: ô 4 ghép mảng đầu rìu từ bản cũ (khối chữ nhật, vệt chém cắt dọc), ô 5 lưỡi rìu bị cắt phẳng ở ranh ô nguồn |
| 2 | `NPC_TRUNG_NHI.attack_01` | ĐẠT → chép vào game. Điểm nhỏ người dùng chấp nhận: ô 4–5 cán rìu gần như không thấy (lưỡi sát tay) |

Prompt giao Codex `docs/CODEX_PROMPT_NPC_IDENTITY.md` — đã xoá sau khi xong (theo quy ước). Chi tiết số đo của Codex:
`assets/sprites-32bit/SPRITE_REPORT_TT_32.md` mục "NPC-IDENTITY" và "NPC-IDENTITY đợt 2" (ngoài git).

## 3. File đã sửa

| File | Mục đích |
|---|---|
| `frontend/static/assets/images/trung-trac/sprites-32bit/npc/NPC_TRUNG_NHI/npc_trung_nhi_talk.png` | thay bằng bản vẽ lại (Codex) |
| `frontend/static/assets/images/trung-trac/sprites-32bit/npc/NPC_TRUNG_NHI/npc_trung_nhi_attack_01.png` | thay bằng bản vẽ lại đợt 2 (Codex) |
| `frontend/static/assets/images/trung-trac/sprites-32bit/npc/NPC_THI_SACH/npc_thi_sach_talk.png` | thay bằng bản vẽ lại (Codex) |
| `docs/REPORT_NPC-IDENTITY.md` | report này |

Không sửa code, không sửa `manifest_tt.json` của game (số frame/fps/`hit_frame`/`frame_w`/`status` không đổi). Ảnh chép nguyên từ
`assets/sprites-32bit/` (md5 trùng), Claude không chỉnh pixel.

## 4. Kiểm tra

| # | Test | Kết quả |
|---|---|---|
| 1 | Cỡ strip (talk 1152×192 / attack 4608×192), số ô, alpha chỉ 0/255, không chạm mép ô | PASS |
| 2 | Baseline chân hàng 187 (attack ô 6: 186 — lệch ¼ px logic, chấp nhận) | PASS |
| 3 | Nhận diện: ô các animation đặt cạnh `idle` + chân dung — cùng tỉ lệ chibi, khăn/đai trán, lông chim, trang phục, vũ khí; không đỏ ở Trưng Nhị | PASS |
| 4 | Ô 1 `talk` trùng pixel ô 1 `idle` (chuyển hội thoại không giật dáng) | PASS (theo Codex; soát mắt khớp) |
| 5 | Tầm `attack_01`: mép vệt chém ô 4 x=484 (cũ 484), đầu rìu ô 5 x=355 (cũ ≈358), pivot 256 | PASS |
| 6 | `?viewer=1`: `NPC_TRUNG_NHI.talk`, `NPC_THI_SACH.talk` nạp đúng cỡ, baseline đúng, không lỗi console | PASS |
| 7 | Màn 3 `?debug=1&layout=skills`: phím L gọi Bóng Trưng Nhị, chém J — bóng hiện, chạy animation; console không cảnh báo sai cỡ/thiếu sprite | PASS (chỉ quan sát ở cỡ chơi thật; không chụp được đúng ô chạm) |
| 8 | Màn 2: chuyển `idle` ↔ `talk` khi mở hội thoại với NPC | **CHƯA CHẠY** — cần chơi qua các chunk có lính vây; chưa chơi thử tay |

## 5. TODO

- Chơi thử màn 2 tới Thi Sách / Trưng Nhị để xác nhận test 8.
- `NPC_LE_CHAN`: Codex kiểm nhanh `idle`/`talk` không thấy lỗi nhận diện; Claude chưa soát.
