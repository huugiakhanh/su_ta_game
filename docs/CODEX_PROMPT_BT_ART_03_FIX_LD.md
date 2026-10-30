# CODEX PROMPT — BT_ART_03_FIX_LD: Lục Dận cầm kiếm đồng nhất một tay (32-bit)

28/10/2026 • Người giao: team Sử Ta (Claude soạn) • Skill `$generate2dsprite` • **Người dùng duyệt 28/10/2026** (kiếm ở tay ngoài)
> Đọc `SUTA_TT_ART_BRIEF_32.md` và `docs/CODEX_PROMPT_BT_ART_03.md` (mục Lục Dận) trước. Nếu prompt này mâu thuẫn với brief thì theo prompt này và ghi lại trong report.
> Đây là bản vá trong **Gate C1**. Chưa làm C2.

## 0. LỖI

`BOSS_LUC_DAN` (quay phải) đổi tay cầm kiếm giữa các ô:

| Animation | Ô | Tay cầm kiếm hiện tại |
|---|---|---|
| `idle` | 1–6 | tay **bên trong** (tay xa người xem), kiếm chống đất ở mép trước thân |
| `command` | 1, 6 | tay **bên trong** (giống idle) |
| `command` | 2–5 | tay **bên ngoài** (tay gần người xem): ô 2 cầm kiếm chéo trước ngực, ô 3–4 vung ra trước, ô 5 hạ kiếm chéo xuống |

Kiếm vì thế "nhảy" từ tay này sang tay kia ở chuyển ô 1→2, 5→6 và ở chỗ nối `idle` → `command`. Người chơi sẽ thấy rõ vì boss đứng yên trên đài và lặp `command` suốt giai đoạn 1.

## 1. YÊU CẦU

**Kiếm luôn ở tay bên ngoài** (tay gần người xem, cánh tay vẽ đè lên thân) trong mọi ô của `idle` và `command`. Chọn tay này vì động tác giơ kiếm ở `command` ô 3–4 đã đọc rõ bằng tay này.

**`idle` (vẽ lại cả 6 ô):**
- Tay ngoài chống kiếm thẳng đứng trước thân, mũi kiếm chạm baseline.
- Tay trong nắm hờ, đặt ở thắt lưng hoặc chắp sau lưng.
- Áo choàng vẫn lay như bản hiện tại.

**`command` (vẽ lại cả 6 ô):**
- Kiếm ở tay ngoài trong suốt 6 ô:
  - ô 1 = tư thế idle ô 1 mới;
  - ô 2 nhấc kiếm lên;
  - ô 3 là đỉnh động tác: giơ kiếm chỉ về trước (giữ `hit_frame` 3);
  - ô 4 giữ thế;
  - ô 5 hạ kiếm;
  - ô 6 = về tư thế idle ô 1 mới.
- Tay trong không cầm gì trong suốt 6 ô.

**Chung:**
- Kiếm giữ nguyên độ dài, độ rộng và màu (đốc vàng, lưỡi sáng) trong mọi ô, chỉ một thanh. Không ô nào có hai kiếm hoặc thiếu kiếm.
- Cỡ đầu, thân, giáp, mũ, áo choàng và bảng màu (`palette_32_bt_a2.png`, ≤32 màu) giữ đúng bản hiện tại. Đầu đo ngang mặt 10±1 px ảnh như report C1.
- Không đổi frames, fps, loop, `hit_frame`, ID, tên animation hay tên file:
  - `idle` 6@9 lặp;
  - `command` 6@12, không lặp, hit 3.
- `fall`, `mud_idle`, `hurt`, `flee` **không sửa**. Kiếm rơi mất khi đài sụp, chấp nhận như hiện tại.

## 2. ACCEPTANCE

1. Cỡ strip giữ nguyên: mỗi animation 1152×192. Alpha chỉ 0/255. Chân ở hàng 187. Pivot bottom-center. Quay phải.
2. Lật ảnh và chiếu liên tục `idle` ô 1 → `command` 1…6 → `idle` ô 1: kiếm không đổi tay ở bất kỳ chuyển ô nào. Xuất GIF `preview/gate_c1/boss_luc_dan_idle_command_loop.gif` để team xem.
3. Bảng probe đầu (ngang mặt) cho 12 ô mới, sai lệch ≤ 1 px ảnh so với bản cũ.
4. Bbox `command` ô 3 và độ vươn mũi kiếm so với pivot (px logic) ghi vào bảng "Số đo cho code".

## 3. BÁO CÁO & DỪNG

- Viết thêm mục `BT_ART_03_FIX_LD` vào `SPRITE_REPORT_BT_32.md`. Ghi đè đúng 2 file:
  - `boss_luc_dan_idle.png`;
  - `boss_luc_dan_command.png`.
- Manifest: chỉ cập nhật `qa_notes` của `BOSS_LUC_DAN`.
- Các file khác không đổi: so lại SHA-256.
- **Dừng, chờ team duyệt Gate C1.** Không làm C2.
