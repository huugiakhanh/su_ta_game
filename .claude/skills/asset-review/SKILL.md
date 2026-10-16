---
name: asset-review
description: >-
  Soát asset Codex vừa nộp cho Sử Ta (sprite, chân dung, icon, nền, tile, prop) — đo cỡ ảnh theo manifest ×density, số frame, alpha, pivot/baseline, hướng mặt, chỗ nối lặp của nền, xem bằng ?viewer=1 ở cỡ chơi thật; kết luận PASS / NORMALIZE / NEED_REDRAW; sau khi người dùng duyệt thì chép sang bản chạy và khai báo trong config.js. Dùng khi Codex báo xong một đợt asset hoặc khi asset hiển thị sai trong game.
argument-hint: "[asset ID hoặc thư mục đợt, vd. assets/sprites-32bit/samples]"
---

# /asset-review — soát asset Codex

Đối tượng: `$ARGUMENTS`. **Chỉ đọc ảnh** — Claude không vẽ, không chỉnh, không ghi đè PNG/GIF. Lỗi thì đề xuất cho Codex.

## 1. Đọc

- Report của Codex (`SPRITE_REPORT_TT_32.md`, `MAP_REPORT_TT_32.md`, hoặc report của đợt), prompt `docs/CODEX_PROMPT_*.md` của đợt, mục manifest liên quan.
- Câu hỏi Codex gửi team → chuyển cho người dùng, không tự trả lời phần nhận diện/lịch sử.

## 2. Đo bằng script (chỉ đọc)

Dùng Python + Pillow, chạy từ scratchpad, không ghi vào thư mục asset:

- Cỡ ảnh = (`frame_w` × `frames`) × `density` theo chiều ngang, `frame_h` × `density` chiều dọc (map: `w`/`h` × `density`).
- Alpha chỉ 0/255, không viền màu key; số màu trong giới hạn bảng màu.
- Baseline: hàng chân ở `frame_h − 2` (logic) mọi frame; pivot bottom-center; ảnh gốc quay **phải**.
- Tỉ lệ thân ổn định giữa các frame và giữa các animation; vũ khí giữ độ dài.
- Animation không lặp: thời lượng `frames/fps` và `(hit_frame−1)/frames` khớp bản cũ (nếu là asset có sẵn).
- Nền/tile: ghép 2 bản cạnh nhau, đo chênh lệch cột qua chỗ nối (không tin "cột đầu = cột cuối"), tìm lỗ trong suốt bị bao kín / cụm pixel rời, hàng đáy đục.
- Manifest: đường dẫn/tên file khớp; asset có sẵn chỉ được đổi `status`/`qa_notes` (và số frame/fps nếu prompt cho phép); ID, tên animation giữ nguyên.

## 3. Xem bằng mắt

- Chép tạm sang bản chạy **chỉ khi người dùng đồng ý thử**, hoặc xem ảnh trực tiếp; trong game dùng `/gameplay/levels/trung-trac?viewer=1` (×1/×3/×4, lưới, baseline, pivot, `hit_frame`) và skill `/verify-ui`.
- Xem ở **cỡ chơi thật** cạnh sprite/nền hiện có: nhân vật/địch nổi rõ, phe đọc được bằng silhouette + màu, không vi phạm danh sách cấm của brief.

## 4. Kết luận

Bảng cho người dùng (và ghi vào report của task):

| Asset ID | Animation | Kết quả | Ghi chú |
|---|---|---|---|
| … | … | `PASS` / `NORMALIZE` (sửa nhẹ: cỡ, pivot, alpha, tên file) / `NEED_REDRAW` (vẽ lại) | số đo cụ thể |

## 5. Sau khi người dùng duyệt

- Chép PNG + manifest (`manifest_tt.json` / `maps_tt.json` / `tileset_tt_*.json`) sang `frontend/static/assets/images/<chương>/{sprites,maps}-32bit/`, **giữ cấu trúc thư mục**; đổi `status` (vd. → `IN_GAME`) ở bản nguồn rồi chép lại bản chạy.
- Khai báo trong `config.js` của chương: thêm ID vào `LEVEL_SPRITES[màn]` (sprite canvas) hoặc `PORTRAITS` (chân dung DOM) hoặc `MAP_PROPS_IN_GAME` (prop map); ánh xạ trạng thái → animation + **hitbox tự khai báo** (`HAZARD_SPRITES`/`ENEMY_SPRITES`/`PROJECTILE_SPRITES`/`OBSTACLE_TYPES`). Asset dùng chung mọi chương (nhân vật nam/nữ, icon HUD) vào `images/shared/sprites-32bit/` + `manifest_shared.json`; ánh xạ nhân vật ở `PLAYER_ANIMATIONS`, icon chung ở `SHARED_DOM_SPRITES` (`engine/config.js`).
- Lệch vị trí → sửa neo/offset trong code, không co giãn ảnh, không hệ số bù tỉ lệ.
- Asset dùng chung toàn web (avatar, icon tiền tệ) → thư mục chung `images/avatar/`, `images/icon/`…, không vào manifest chương.
