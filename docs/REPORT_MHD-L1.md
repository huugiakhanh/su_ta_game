# REPORT MHD-L1 — Màn 1 "Gánh cống Hoan Châu"

Task card: [SUTA_MHD_TASK_L1_01.md](SUTA_MHD_TASK_L1_01.md) • 08/11/2026 • **PASS** (người dùng chơi tay ổn 08/11; asset → `IN_GAME`). `test_app.py` chưa chạy trên DB test, chưa thử mở khoá trang chủ bằng tài khoản thật, chưa kiểm điện thoại ngang — xem dưới.
Yêu cầu người dùng: làm màn 1 thật của chương 5 theo task card đã duyệt, chép asset `MHD_ART_01` vào game.

## Quyết định (người dùng chốt 08/11, theo đề xuất)
- Q1: duyệt nguyên văn câu mô tả màn 1 (MHD-00 §5.1) và 2 câu Mai Thúc Loan dẫn màn (§5.2).
- Q2: kỵ binh né được bằng nhảy hoặc lướt; hộp theo thân ngựa; báo trước 1 s.
- Q3: xe cống đứng yên, bánh không quay.
- Q4: mở thẻ chương 5 trên trang chủ (khoá tới khi qua chương 4).
- Q5: 3 vùng; 5 xe = 5 dân phu; sách 2 cố định + 2 trong xe + 1 từ quan thu thuế.

Trước đó, khi soát asset (07–08/11), người dùng chốt Gate A1: phe Đường phương án A, duyệt trang phục Mai Thúc Loan, duyệt da ngăm + 8 màu mới, giữ tông Hoan Châu khô vàng nâu. Claude chốt 3 câu Gate A2 theo yêu cầu người dùng (mục 12 của prompt Codex).

## File đã sửa / tạo
| File | Việc |
|---|---|
| `frontend/static/assets/images/mai-hac-de/{sprites,maps}-32bit/` (mới) | Chép 19 ID sprite (46 strip) + `manifest_mhd.json`; 3 nền + 4 prop + `maps_mhd.json` |
| `images/shared/sprites-32bit/manifest_shared.json` + 4 PNG | Thêm `burden_idle` 6@9, `burden_run` 8@12 (`frame_w` 80) cho `PLAYER_MALE`/`PLAYER_FEMALE`, chép nguyên mục từ `manifest_tt.json` nguồn |
| `js/levels/mai-hac-de/config.js` | Trỏ asset riêng chương; vùng, cổng, đoạn gánh, mini-boss, nhóm chướng ngại, hitbox, câu thông báo |
| `js/levels/mai-hac-de/level1.js` | Bố cục thật 12 chunk, xếp nhóm xáo, đập sọt (`burdenAttackAtCart`), kỵ binh báo trước, nghỉ chân |
| `js/levels/mai-hac-de/render-extras.js` (mới) | Cửa hang vẽ trước hazard, bụi vẽ sau người chơi |
| `js/levels/mai-hac-de/chapter.js` | Móc thật / móc layout thử theo `state.layoutTest`; `guide`, `gate`, `burden`, `events`, câu mô tả màn 1 |
| `js/levels/mai-hac-de/dialogue-data.js` | `STORY_MHD_INTRO` (nguyên văn §5.2) |
| `js/levels/mai-hac-de/audio-data.js` | Tiếng vó ngựa `cavalryCharge` (chép định nghĩa chương 2, không import) |
| `js/levels/mai-hac-de/level2.js` | Bỏ hố chông chương 4 (không còn trong manifest chương 5) |
| `js/engine/level-flow.js` | Cảnh chạy vào màn dùng `burdenRun`/`burdenIdle` khi đang gánh |
| `js/engine/player.js` | Đang gánh mà nhảy hoặc trúng đòn: giữ `burdenIdle` (strip `jump`, `hurt` cầm kiếm) — sửa sau chơi tay 08/11 |
| `templates/components/home/{timeline,chapter}.html` | Thẻ chương 5 `data-unlock-after="4"` |
| `.claude/rules/{mai-hac-de-gameplay,assets-32bit,engine}.md`, `docs/SUTA_MHD_TASK_00.md`, `docs/CODEX_PROMPT_MHD_ART_01.md` (ghi quyết định Gate, rồi xoá khi xong) | Tài liệu |

Không sửa file nào trong `js/levels/{trung-trac,ba-trieu,ly-nam-de,trieu-quang-phuc}/`.

Khác task card:
- **Không thêm `holdFrame` vào engine** (§1.1). Xe đứng yên bằng `durations: { idle: Infinity }` có sẵn: fps = 0 nên luôn vẽ ô 1 của `roll`.
- **Sửa engine ngoài §1.1**: `level-flow.js` `updateIntro` dùng dáng gánh khi chạy vào màn. Không sửa thì nhân vật chạy vào với dáng cầm kiếm rồi mới đổi sang gánh. 3 dòng, chương khác không đổi (`p.burden` false).
- Hộp roi lính áp giải `attackBoxY` 14, `attackBoxH` 9 (card ghi 12/8): tính lại từ đầu roi cao 15,4 trên chân = 18,6 từ đỉnh hitbox.
- Tháp lao dùng `deck` 91 như chương 3 (card ghi 92).
- Thông báo cứu người gộp vào câu phá xe ("Đã phá xe cống phẩm, dân phu chạy thoát!"): engine hiện `breakMessage` sau móc `onHazardBroken`, nên câu riêng sẽ bị đè.

Câu `TEXT` mới, không phải nội dung lịch sử: 2 câu hướng dẫn đoạn gánh, `cavalryWarn`, câu trúng/hạ của lính áp giải, cung thủ, lính ném lao, đá lăn, hổ, kỵ binh, xe, hòm, quan thu thuế.

## Hitbox (pixel logic, DESIGN_BASELINE)
| Thực thể | Khai báo |
|---|---|
| Lính áp giải | 22×34; roi `attackReach` 36, hộp y 14–23; `speed` 34, `aggroRange` 150, nghỉ 1,4 s |
| Cung thủ | 20×34, điểm phóng +11; 25,5; hp 2 |
| Lính ném lao | 20×34 đứng cao 91, điểm phóng +13,75; 18,75; không với tới |
| Kỵ binh | 64×36, −300 px/s, hp 2 |
| Đá lăn | 18×18, −140 px/s, hp 1 |
| Hổ | 48×24, vồ cao 70, xa 200, hp 3 |
| Xe cống | 48×38 `blocking`, hp 2, `frees` 1 |
| Quan thu thuế | 30×44, hp 6, điểm buông hòm +20,75; 33,25 |
| Hòm rỗng | 18×16 `blocking`, hp 1, sống 8 s, tối đa 3 |

## Kết quả test
Mô phỏng `update(1/60)` trên trình duyệt, tài khoản khách. Khung trình duyệt bị ẩn nên chạy bằng script, ảnh chụp bằng `draw()`.

| # | Test | Kết quả |
|---|---|---|
| L1 | Màn, vùng, console | PASS — 12 chunk, 3 vùng đúng ranh 4/9; console chỉ có dòng info nạp màn, 0 cảnh báo "stage khác", 0 hộp tạm; 18 sprite + 5 nền nạp đủ |
| L2 | Xáo 10 lượt | PASS — 10/10 lượt: 12 hazard, 8 lính, 5 sách, đúng 5 xe; đá lăn + hổ chỉ ở 5–9, kỵ binh chỉ ở 3/4/10, không gì xáo vào chunk 1–2; 4 câu không trùng |
| L3 | Đoạn gánh | PASS — strip gánh thật cả nam lẫn nữ (cả lúc chạy vào màn); tốc độ 100,8 = ×0,6; ô Lướt `skill--locked`; Đánh xa xe chỉ nhắc `burdenHint`; đứng cách tâm xe 49 px bấm Đánh: hết gánh, xe vỡ, `rescued` 1, 1 người chạy; 2 câu hướng dẫn hiện đúng thứ tự |
| L4 | Từng loại | PASS — kỵ binh: báo trước khi vượt `warnX`, 60 frame (1 s) sau mới phi, xuất hiện từ ngoài màn hình (cách mép phải 269 px), −300 px/s; nhảy qua: 0 máu mất; lướt qua: 0 máu mất; đứng yên: −1 máu. Đá lăn: chưa lăn ở 470 px, lăn ở 436 px, −140 px/s, chém vỡ. Hổ: warn → leap → recover → leap…, cao 70, `warn` không chém được. Cung thủ: tên rời tay cao 25,4, bay ngang về người chơi. Lính ném lao: đứng cao 91, lao rời tay cao 108,2, bay chéo xuống. Roi: đánh trúng ở khoảng cách 20 và 34 px |
| L5 | Cứu dân phu | PASS — phá đủ 5 xe → `rescued` 5; thắng màn → `suta.mhd.progress` có `"rescued":5, "books":5` |
| L6 | Mini-boss | PASS — 6 lượt ném/15 s, tối đa 3 hòm nằm cùng lúc (18×16, sống 8 s), chém vỡ hòm; hạ quan đúng 6 đòn, rơi sách; thiếu sách → "Bạn còn thiếu 2 Quyển Sách Tinh Hoa.", không thắng; đủ 5 sách + đã hạ quan → thắng, panel "Sang Màn 2" |
| L7 | Mai Thúc Loan | PASS — đứng chờ chunk 1, tên + câu đúng nguyên văn §5.2, chân dung `PORTRAIT_MAI_THUC_LOAN` hiện; mờ dần sau khi nói |
| L8 | Câu hỏi, sách, nghỉ chân | PASS — 4 câu không trùng; 5 sách; nghỉ chân "hồi 1 máu" 1 lần |
| L9 | Màn 2–3, layout thử, trang chủ | PASS — `mai-hac-de/2?debug=1`, `/3?debug=1` chạy bằng `EN_TANG_ESCORT`, 0 lỗi; `?layout=engine` chạy bằng asset thật (bot phá xe, `rescued` 1); `?viewer=1` nạp được. 2 partial trang chủ có `data-unlock-after="4"` + route chương 5. **Chưa thử mở khoá bằng tài khoản đã qua chương 4** |
| L10 | Chơi tay | PASS — người dùng chơi 08/11: lỗi nhảy khi gánh hiện kiếm đã sửa, lượt sau báo "chơi ổn". Không có thời gian hoàn thành, số DESIGN_BASELINE giữ nguyên |
| L11 | `pytest`, giao diện, hồi quy | `pytest tests`: 137 passed, 1 skipped (`test_app.py` thiếu `SUTA_TEST_DATABASE_URL`). Hồi quy PASS: 22 trang (màn 1–3 của 5 chương, `?layout=engine` chương 2–5), mỗi trang 600–1500 frame có đi, nhảy, đánh: 0 exception, 0 tài nguyên lỗi. 3 lượt bot hết máu (`ly-nam-de?layout=engine`, `ly-nam-de/2`, `trieu-quang-phuc/2`): bot rơi sông, giống lần hồi quy MHD-ENGINE, không liên quan thay đổi này. `/verify-ui` trên điện thoại ngang: **chưa chạy** (khung trình duyệt ẩn) |

Ảnh chụp kiểm ở cỡ chơi thật: đường cống phẩm + Mai Thúc Loan, nhân vật nữ gánh sọt, hổ `warn` trong cửa hang, lính ném lao trên tháp với lao đang bay, quan thu thuế + 2 hòm + kỵ binh ở trạm gác, cung thủ sau bụi, panel thắng trước cổng trạm gác.

Các số chỉ là `DESIGN_BASELINE`, chưa cân chỉnh độ khó. Không dữ liệu người chơi nào được ghi vào DB.

## Vấn đề asset
- **Chơi tay 08/11 (người dùng):** đang gánh nhảy lên thì hiện dáng cầm kiếm (strip `jump`). Đã sửa bằng code: trên không và lúc trúng đòn giữ `burdenIdle`; kiểm lại: đang gánh nhảy/trúng đòn chỉ ra `burdenIdle`, hết gánh nhảy vẫn ra `jump`. Nếu muốn có dáng nhảy riêng khi gánh thì cần Codex vẽ thêm `burden_jump` (chưa giao).
- Hòm rỗng thường rơi đúng chỗ người chơi đứng lúc quan ném, rồi đẩy người chơi lùi. Đây là cách engine E3 đã duyệt; nếu chơi tay thấy khó chịu thì chỉnh `fireInterval` hoặc điểm rơi.
- Status: 10 mục `manifest_mhd.json` + 7 mục `maps_mhd.json` `NORMALIZED` → `IN_GAME` (bản nguồn rồi chép lại bản chạy, 08/11). Mục chép từ chương khác và `PLAYER_MALE`/`PLAYER_FEMALE` vốn đã `IN_GAME`.
- Prompt `docs/CODEX_PROMPT_MHD_ART_01.md` đã xoá; kết quả soát tóm tắt ở mục dưới. Report của Codex vẫn ở `assets/sprites-32bit/mai-hac-de/SPRITE_REPORT_MHD_32.md`, `assets/maps-32bit/mai-hac-de/MAP_REPORT_MHD_32.md` (ngoài git).

## Kết quả soát asset `MHD_ART_01` (07–08/11)
- **Gate A1** (người dùng duyệt): phe Đường phương án A vàng đất, `EN_TANG_ESCORT` là mẫu màu; trang phục Mai Thúc Loan màn 1 (áo vải thô không tay, quần lửng xà cạp, chân trần, dây lưng đỏ, đòn gánh); da ngăm hiện tại + 8 màu mới thay 8 màu ít dùng trong `palette_32_mhd.png` (vẫn 101 màu, bảng chương khác không đổi); giữ tông Hoan Châu khô vàng nâu. Vòng sửa R1: sprite gánh nam/nữ cùng bộ đòn + sọt, cùng rộng 142 px; roi ô 7–9 thu dần, cuộn ô 9 tách khỏi áo.
- **Gate A2** (Claude chốt theo yêu cầu người dùng): cung thủ sau bụi lộ 50–59 % diện tích; hòm rỗng giữ rộng 17 px logic (hitbox 18); cửa hang, nền trạm gác đạt. Kỵ binh vẽ lại vì chân quá dài (bụng cách đất 23–25 → 8,5–11 px logic, cao 149–160 px ảnh như mẫu Ngô) — nguyên nhân là yêu cầu hộp 25×42 sai trong prompt. 2 nền đèo + trạm gác vẽ lại cục bộ vì đá/cây bị cắt thẳng đứng ở cột ảnh 893, 2173. `EN_TIGER` `warn`, `pounce` còn màu `#9B1810` (0,4 % pixel) cùng màu 5 strip cũ: chấp nhận.

## Sau khi đóng việc: vẽ lại Mai Thúc Loan (08/11)
Người dùng yêu cầu `NPC_MAI_THUC_LOAN` + `PORTRAIT_MAI_THUC_LOAN` theo hình tượng ảnh thư viện `characters/avatar/mai_hac_de.png` (đợt `MHD_FIX_MTL_01`, thay trang phục lao động đã duyệt ở Gate A1). Bản mới: khăn trán đỏ, râu quai nón, áo choàng đen viền đỏ, mề đay + khoá đồng, kiếm chúc xuống; cao 33,75–34 px logic, baseline 187, cùng ID, file, số frame. Người dùng duyệt; đã chép vào game, status `IN_GAME`; prompt đã xoá. Thoại §5.2 vẫn có câu "người dân phu Hoan Châu" — chưa đổi, team quyết.

## Câu hỏi cho team / TODO
- Nguồn về Thúc Bảo trước MHD-L2; duyệt MHD-00 §4, §5.3–5.4.
- Chạy `test_app.py` khi có `SUTA_TEST_DATABASE_URL`.

## Bước tiếp
Prompt Codex `MHD_ART_02` + MHD-L2 (cần nguồn Thúc Bảo trước).
