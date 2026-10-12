---
name: codex-prompt
description: >-
  Soạn prompt giao việc vẽ asset cho Codex (agent-sprite-forge) của Sử Ta — file docs/CODEX_PROMPT_<ĐỢT>.md theo brief SUTA_TT_ART_BRIEF_32.md: danh sách asset ID, cỡ ô logic ×4, animation frames/fps/loop/hit_frame, thư mục + manifest, thiết kế, acceptance (Gate), báo cáo và điểm dừng. Dùng khi cần sprite/nhân vật/quân địch/vật cản/nền/icon/chân dung mới hoặc cần Codex vẽ lại asset lỗi.
argument-hint: "[tên đợt, vd. NPC_BA_TRIEU]"
---

# /codex-prompt — giao việc cho Codex

Đợt: `$ARGUMENTS`. Claude **chỉ soạn prompt**, không vẽ, không sửa ảnh.

## Trước khi viết

1. Đọc [SUTA_TT_ART_BRIEF_32.md](../../../SUTA_TT_ART_BRIEF_32.md) — luật kỹ thuật chung (mật độ ×4, strip, pivot bottom-center, quay phải, baseline `frame_h − 2`, alpha, bảng màu, QA, mẫu báo cáo). Prompt **không chép lại** luật đó, chỉ dẫn chiếu và nêu phần khác.
2. Xem prompt mẫu đang có trong `docs/CODEX_PROMPT_*.md` (vd. `CODEX_PROMPT_SAMPLE_BT_DBL.md`) để giữ cùng cấu trúc.
3. Asset có sẵn cần vẽ lại/thêm animation → lấy mục của nó trong `manifest_tt.json` / `maps_tt.json` bản game: **giữ nguyên ID, tên animation**; animation không lặp đổi số frame/fps thì phải giữ thời lượng `frames/fps` và tỉ lệ `(hit_frame−1)/frames`.
4. Thông tin nhân vật lịch sử (trang phục, vũ khí, thời kỳ): lấy từ **team/nguồn team đưa**; chỗ không chắc ghi rõ "độ chắc chắn thấp" và hỏi team trước khi giao — không tự bịa chi tiết lịch sử.

## Cấu trúc prompt

```
# CODEX PROMPT — <ĐỢT> (32-bit)
Ngày giao • Người giao • Skill ($generate2dsprite / $generate2dmap)
> Đọc SUTA_TT_ART_BRIEF_32.md trước; prompt này mâu thuẫn brief → theo prompt, ghi vào report.

## 0. MỤC TIÊU        — vì sao cần, dùng ở màn/chương nào; đợt mẫu hay đủ bộ
## 1. DANH SÁCH ASSET  — bảng: # | Asset ID | Loại | Ô logic → ảnh (×4) | Animation (frames @fps, lặp?, hit_frame) | Ghi chú
## 2. THƯ MỤC, MANIFEST, BẢNG MÀU — đường dẫn trong vùng làm việc, mục manifest cần thêm/sửa, bảng màu dùng
## 3+. THIẾT KẾ TỪNG ASSET — nhận diện (silhouette, màu, vũ khí), tư liệu (nguồn team), "Không vẽ"
## N. ACCEPTANCE (Gate) — tiêu chí đo được (cỡ, số frame, pivot, nhịp, mockup cỡ chơi thật)
## N+1. BÁO CÁO & DỪNG — ghi vào report vùng làm việc theo mẫu brief mục 6; dừng ở Gate chờ duyệt
```

## Quy ước

- **Asset ID**: CHỮ_HOA theo tiền tố có sẵn — `PLAYER_`, `NPC_`, `EN_`, `BOSS_`, `PORTRAIT_`, `PJ_` (đạn), `FX_`, `ICON_`, `ITEM_`, `OBS_`, `PROP_`, `TR_` (bẫy), `BG_`, `TILESET_`. Không tạo ID gần giống ID đã có.
- Cỡ ô logic theo loại đã dùng (vd. người 48×48 → ảnh 192×192; chân dung 64×64 → 256×256; icon 32×32 → 128×128). Hitbox **không** giao cho Codex — Claude tự khai báo trong `config.js`.
- Vùng làm việc Codex (ngoài git): `assets/sprites-32bit/`, `assets/maps-32bit/<chương>/`. Codex **không** đụng `frontend/`.
- Đợt lớn hoặc nhận diện nhân vật mới → chia Gate (đợt mẫu idle/run + concept trước, đủ bộ animation sau).
- Không làm việc trong thư mục Codex đang làm cùng lúc.

## Sau khi viết

- Lưu `docs/CODEX_PROMPT_<ĐỢT>.md`, báo người dùng đường dẫn + tóm tắt danh sách asset để người dùng giao cho Codex.
- Khi Codex nộp → skill `/asset-review`. Prompt **xoá khi việc xong** (asset đã duyệt, không còn chờ Gate).
