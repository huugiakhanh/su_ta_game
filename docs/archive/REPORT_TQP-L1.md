# REPORT TQP-L1 — Màn 1 "Tuổi trẻ rèn luyện" (bố cục thật + asset TQP_ART_01)

Task card: [SUTA_TQP_TASK_L1_01.md](SUTA_TQP_TASK_L1_01.md) • 04/11/2026 • **PASS** — người dùng chơi tay 2 lần (lần 1 có 2 phản hồi đã sửa, lần 2 "đã ổn"); asset `TQP_ART_01` → `IN_GAME`
Yêu cầu người dùng: "Lập TQP-L1" → "Duyệt, làm luôn" (Q1–Q5 theo đề xuất).

## Quyết định người dùng chốt (04/11/2026)
- Q1: duyệt nguyên văn TQP-00 §5.1 (thông báo đầu màn 1) + §5.2 (2 câu Triệu Quang Phục dẫn màn).
- Q2: chặn cuối khu rèn luyện bằng NPC — Triệu Quang Phục đứng cuối chunk 2, bù nhìn là "quân vây".
- Q3: bỏ bài "lướt qua khe thấp" (không có asset).
- Q4: mở thẻ chương 4 trên trang chủ (`data-unlock-after="3"`).
- Q5: thứ tự vùng + 5 sách = 4 cố định + 1 từ đội trưởng.

## Kết quả soát asset TQP_ART_01 (prompt Codex đã xoá — bản giao ban đầu ở commit d53bd07; các vòng phản hồi mục 9–14 tóm tắt dưới đây; report của Codex ở `assets/{sprites,maps}-32bit/trieu-quang-phuc/`)
| Gate | Kết quả |
|---|---|
| A1 | `plunge` nam/nữ (2 lần sửa: chém xuống, rồi ô 2 dựng kiếm lên), `NPC_TQP` (theo avatar thư viện), `EN_LUONG_SPEARMAN` (chuẩn hoá giáo 240 ± 8), `BG_TQP_MID_SWAMP` (vẽ lại thành tranh liền), `PROP_TQP_MUD` — PASS |
| A2 | 9 ID vẽ mới + 7 ID chép chương 2–3 + 3 nền + 4 prop — PASS sau 1 lần sửa (`FX_SWAMP_GAS` đổi màu vàng đục/xám tím cho tách khỏi nền rêu; `OB_TQP_STRAW_SPEARMAN` xoá vạch 1 px ở ô 5 `break`) |
| Ngoại lệ màu | `EN_LUONG_WAR_BOAT` idle/throw 40 màu, `TR_BAMBOO_SPIKE_PIT/hidden` 1 màu ngoài bảng — giữ byte (đã `IN_GAME` ở chương 2–3) |
| Bảng màu | sprite chương 4 = 101 màu (+3 màu rêu, người dùng duyệt 04/11) |

## File
| File | Việc |
|---|---|
| `frontend/static/assets/images/trieu-quang-phuc/{sprites,maps}-32bit/**` | Chép từ vùng Codex: 47 strip + `manifest_tqp.json`, 9 ảnh map + `maps_tqp.json` (không chép raw/meta/preview/frames/prompt) |
| `images/shared/sprites-32bit/player/PLAYER_{MALE,FEMALE}/player_*_plunge.png` + `manifest_shared.json` | Thêm strip + mục animation `plunge` (4@16, `frame_w` 80) — chép nguyên mục từ manifest nguồn; animation khác không đổi |
| `js/levels/trieu-quang-phuc/config.js` | Viết lại theo asset thật: root/manifest chương 4, `BORROWED_MAPS` chương 1–3, `TILES.mud`, zone 5 vùng, `FINISH_GATE`, `TRAINING`, `MINIBOSS`, `SLOTS`, `CROC_RIVER`, `BOAT_RIVER`, `MUD_ROWS`, `SMOKE`, `TREE`, `SNAKE_AMBUSH`, hitbox mới (lính giáo dài, đội trưởng, rắn, bù nhìn, cá sấu, khói), `TEXT.yardLocked` |
| `js/levels/trieu-quang-phuc/level1.js` | Viết lại: khu rèn luyện, xếp 11 nhóm vào 2 ô/chunk (`placeGroups`), chông cố định chunk 9, mini-boss + hộ tống, layout thử dùng asset thật, `level1Events` (câu hướng dẫn, rắn phục, nghỉ chân) |
| `js/levels/trieu-quang-phuc/render-extras.js` (mới) | Bụi cỏ che rắn (`hooks.draw.afterPlayer`) |
| `js/levels/trieu-quang-phuc/{chapter,dialogue-data,level2}.js` | Cổng, NPC dẫn, thông báo đầu màn, `stateFields`, hook vẽ; `STORY_TQP_INTRO` (nguyên văn §5.2), `STORY_TQP_YARD`; màn 2 khung đổi bẫy lưới → bẫy chông (manifest chương 3 không còn nạp) |
| `js/engine/{enemies,player,hazards,combat,entities,level-flow,chapter}.js` | Xem "Khác task card" |
| `templates/components/home/{timeline,chapter}.html` | Thẻ Triệu Quang Phục `data-unlock-after="3"`, câu "Qua chương Lý Nam Đế" |
| `.claude/rules/{trieu-quang-phuc-gameplay,engine,assets-32bit}.md`, `docs/SUTA_TQP_TASK_00.md` | Cập nhật trạng thái |

Không sửa file nào của chương 1–3.

**Khác task card** (sửa engine nhỏ, mặc định tắt — chương khác không đổi hành vi):
- §1.1 `animLift` cho cá sấu **không cần**: đặt `CROC_RIVER.floatY` 18 thì mắt/bọt `warn` nằm ở y 244–247, ngay trên mặt nước 248.
- `enemies.js`: enemy `boss` có art mang `behavior` vẫn chạy hành vi lính canh (trước đây boss enemy đứng yên, chương tự lo) — cần cho đội trưởng giáo dài. Chưa chương nào có boss enemy với `behavior`.
- `combat.js`: enemy có `id` chết thì hiện vật phẩm `carrier` = id (như hazard) — đội trưởng rơi sách. Enemy chương khác không có `id`.
- `player.js` + `enemies.js` + `hazards.js`: gạt đòn (`plungeOnly`) đặt `blockTimer` 0,2 s → phát animation `blocked` nếu sprite có (lính giáo dài, đội trưởng có strip `blocked`).
- `entities.js makeNpc` + `level-flow.js`: tuỳ chọn `story` (NPC nói cốt truyện ngắn thay hội thoại câu hỏi) và `hint` (câu nhắc riêng khi còn quân vây) — phương án Q2 dùng cơ chế "quân vây" có sẵn thay vì `requires: { hazards }` ghi trong task card.
- Rắn phục dùng cờ `noBar` có sẵn của engine để giấu thanh máu; thuyền đặt `signalTime` .67 (không khai báo thì `signal` kết thúc ngay ở 0 s).

Câu `TEXT`/thông báo mới (kỹ thuật, không phải nội dung lịch sử): `yardLocked`, 3 câu `TRAINING.tips`, `plungeHint` viết lại chung cho bù nhìn + lính ("Đòn chém ngang bị gạt — …"), câu trúng/hạ của đội trưởng, rắn, bù nhìn, cá sấu, thuyền, `STORY_TQP_YARD` "Đã luyện xong, lên đường!".

## Kết quả test
Kiểm bằng mô phỏng `update(1/60)` + `setKey()` (ô trình duyệt ở nền) trên server dev cổng 5057, có số đo:

| # | Test | Kết quả |
|---|---|---|
| L1 | Màn + asset | PASS — 9216 px, 5 vùng đúng chunk; 47 strip + 9 ảnh map + 2 strip `plunge` đều 200; console chỉ có 401 của khách; không còn hộp tạm (trừ NPC `testNpc` của layout thử) |
| L2 | Xáo nhóm | PASS — 10 lượt dựng: mỗi lượt 20 thực thể (4 bù nhìn + 11 nhóm + chông cố định + đội trưởng + 2 hộ tống); khe nước luôn ở chunk 5–7, sình luôn ở 8–10; bia câu hỏi chunk 3/5/8/10 không lần nào rơi vào khe/sình. Phát hiện + sửa: sách chunk 8/10 có lúc nằm trên dải sình (nhảy trong sình chỉ cao 38) → dời về local 60 |
| L3 | Khu rèn luyện | PASS — 3 bù nhìn vỡ khi chém; bù nhìn giáo: chém ngang hp giữ 1 + câu nhắc, bổ từ trên → vỡ; còn bù nhìn → bị giữ ở x 1396 (TQP 1408) + "Hãy chém vỡ hết bù nhìn tập võ trước đã!"; vỡ hết → "Đã luyện xong, lên đường!" rồi mờ dần |
| L4 | Từng loại | PASS — rắn nằm im khi cách 260, lao ra khi cách 185, mổ −1 máu, thanh máu chỉ hiện khi lao; bụi cỏ phủ x 5213–5258 trùng thân rắn 5214–5257; cung thủ đứng đúng mặt cành, bắn trúng; cá sấu `warn` mắt ở y 244–247, chồm 40 → thân y 203–225; thuyền đứng gần 4 s → `signal` + "Thuyền tuần thổi tù và gọi quân!" + 2 lính; sình, khói, chông theo cơ chế TQP-ENGINE (đã kiểm ở đó) |
| L5 | Đòn bổ | PASS — chuỗi animation `jump` → `plunge` → `idle`, strip thật 4 ô `frame_w` 80 (nam); bổ chéo về trước sau chơi tay lần 1 (xem dưới) |
| L6 | Mini-boss + cổng | PASS — đội trưởng đi tuần, đâm trúng người chơi 1 lần, chém ngang bị gạt (`blocked`, hp 12 giữ nguyên), 6 đòn bổ: hp 10/8/6/4/2/0 → chết, sách hiện tại x 8000; 1/5 sách → giữ ở cổng + "Bạn còn thiếu 4 Quyển Sách Tinh Hoa."; đủ 5 → thắng, nút "Sang Màn 2" |
| L7 | NPC dẫn | PASS — 2 câu đúng nguyên văn §5.2, chân dung `PORTRAIT_TQP`, thông báo đầu màn đúng §5.1 |
| L8 | Câu hỏi + nghỉ chân | PASS — 4 câu không trùng; "Nghỉ chân: hồi 1 máu." 1 lần |
| L9 | Màn 2–3 + trang chủ | PASS — màn 2, 3 khung chạy 25 s không lỗi; `?layout=engine` chạy bằng asset thật (máu 7); thẻ dòng thời gian + chọn tướng mở khi `suta.cleared.3` = 1, khoá khi chưa có |
| L10 | Chơi tay | PASS — người dùng chơi tay 04/11: lần 1 sửa cọc tre + đòn bổ (mục dưới), lần 2 "tôi chơi đã ổn" |
| L11 | pytest + hồi quy | PASS — `pytest tests`: 120 passed, 1 skipped (`test_app.py` thiếu DB test). Mô phỏng 25 s (đi + nhảy + đánh + bổ) không lỗi JS ở: Trưng Trắc màn 1, 2; Bà Triệu `?layout=engine`, màn 2; Lý Nam Đế màn 1, `?layout=engine`, màn 2 (NPC giải cứu), `3?layout=skills`; Triệu Việt Vương màn 1, `?layout=engine`, màn 2, 3. **Chưa** đo `/verify-ui` đủ 5 cỡ màn hình |

## Chỉnh sau chơi tay lần 1 (người dùng, 04/11/2026)
| Phản hồi | Sửa | Số đo sau sửa |
|---|---|---|
| Cọc tre đi ngang xuyên qua được, phải bắt buộc nhảy | Cọc tre (bãi tập + cọc trước lính giáo dài) đổi từ bục một chiều sang vật cản `blocking` (`OBSTACLE_TYPES.bambooPost`, cơ chế cột đá có sẵn của engine) | Đi ngang bị chặn ở đúng mép cọc (x 870), không mất máu; thả từ trên xuống thì đứng được trên mặt cọc (y 200) |
| Bổ rơi thẳng xuống quá nhanh — muốn lao về trước một đoạn | Engine: `PLUNGE.forward` (mặc định 0 = như cũ). `forward` > 0 thì bổ theo đường chéo đều: rơi đúng `speed`, lao ngang `forward` theo hướng mặt lúc bấm. Chương 4: `plunge: { speed: 280, forward: 260 }` (DESIGN_BASELINE) | Từ đỉnh cú nhảy (cao 79): trước sửa gần thẳng đứng (≈ 0,15 s); sau sửa lao +74 px ngang trong 0,27 s, hai hướng như nhau. Từ cọc tre nhảy về bù nhìn giáo bấm Đánh ở đỉnh tới +0,3 s → trúng 4/5 thời điểm bấm; đội trưởng: nhảy từ cách 70 px, bấm ở đỉnh → 6/6 đòn trúng, chết |

Để ý thêm: sau khi bổ trúng đội trưởng, người chơi nảy lên rồi rơi sát thân đội trưởng → trong mô phỏng (không lùi ra) bị va 5/6 lần. Khi chơi tay xem có cần nảy lùi ra sau hay tăng `grace`.

## Vấn đề asset / để ý khi chơi tay
- Mặt nước khe sông mượn `PROP_LND_RIVER_WATER` của chương 3 (nước phù sa nâu đỏ sông Hồng) — ở bãi lau/đầm có thể muốn nước xanh rêu riêng → cân nhắc thêm vào `TQP_ART_02`.
- Rắn cùng tông màu đất (đúng brief "khó thấy trong cỏ") — chơi tay xem có quá khó thấy không.
- Status `manifest_tqp.json` (10 ID vẽ mới) / `maps_tqp.json` (9 asset) `NORMALIZED` → `IN_GAME` sau chơi tay (bản nguồn rồi chép lại). Prompt `CODEX_PROMPT_TQP_ART_01.md` đã xoá; kết quả soát tóm tắt ở mục "Kết quả soát asset" phía trên.

## TODO
- `/verify-ui` đủ 5 cỡ màn hình.
- Trong lúc kiểm, đã xoá khoá `suta.cleared.3` khỏi localStorage của ô trình duyệt dev (không chắc trước đó có hay không — chỉ ảnh hưởng khách trên trình duyệt này) và đặt tạm tiến trình `suta.*.progress` trong sessionStorage của tab.

## Bước tiếp
`TQP_ART_02` (prompt Codex màn 2) + TQP-L2 — cần team duyệt thoại TQP-00 §4.
