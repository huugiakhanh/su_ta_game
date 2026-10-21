# REPORT BT-L1 — Màn 1 "Rừng núi Nưa" (bố cục thật)

Task card: [SUTA_BT_TASK_L1_01.md](SUTA_BT_TASK_L1_01.md) • 17/10/2026 • **PASS** (L7 người dùng chơi tay 19/10/2026)

## Quyết định người dùng
Duyệt Q1–Q4 theo đề xuất (17/10): 5 câu thoại mở đầu của Bà Triệu; có nghỉ chân, bỏ dòng cốt truyện giữa màn; xáo trong vùng được phép; mini-boss 6 đòn.

## File
| File | Mục đích |
|---|---|
| `js/levels/ba-trieu/level1.js` | Viết lại: 10 nhóm chướng ngại có vùng được phép + `placeGroups()` (nhóm hẹp vùng xếp trước, chunk 1 chỉ nhóm dễ), gò đất theo nhóm đá lăn, hố chông cố định + mini-boss chunk 11, 5 sách, 4 câu hỏi, nghỉ chân (`level1Events`); giữ `?layout=engine` |
| `js/levels/ba-trieu/config.js` | 12 chunk + 6 vùng cảnh, đích `worldX(12, 618)`, `GUIDE_LOCAL_X`, `MINIBOSS`, `FIXED_PIT`, `REST`, `LEVEL1_ITEMS`, vị trí bia, câu thông báo thợ săn/kỵ binh/mini-boss, sprite màn 1 |
| `js/levels/ba-trieu/chapter.js` | `guide` Bà Triệu, `events`, `stateFields` (`restUsed`) |
| `js/levels/ba-trieu/dialogue-data.js` | `STORY_BA_TRIEU_INTRO` — nguyên văn task card §3 |
| `docs/SUTA_BT_TASK_L1_01.md`, `.claude/rules/ba-trieu-gameplay.md`, `CLAUDE.md` | Ghi duyệt + trạng thái |

Sau chơi thử: status 22 asset BT_ART_01 (12 sprite + 10 map) `NORMALIZED` → `IN_GAME` ở bản nguồn `assets/{sprites,maps}-32bit/ba-trieu/` rồi chép sang bản chạy `images/ba-trieu/`.

Không sửa engine, không sửa chương Trưng Trắc.

## Kết quả test
| # | Test | Kết quả |
|---|---|---|
| L1 | Độ dài, vùng, cảnh báo | PASS — `worldWidth` 9216, `finishX` 9066, không còn cảnh báo "stage khác"; console không lỗi |
| L2 | 12 chướng ngại + vùng | PASS — 200 lượt xáo: luôn 12; chunk 1 luôn hố chông; chướng khí luôn chunk 4–5; voi luôn 6–8 (theo `triggerX`); mini-boss luôn chunk 11; sau khi dời gò đất (local 416–544) và bỏ chunk 10 khỏi đá thứ 2: **0 cảnh báo bố cục** (trước đó bia chunk 8/10 vắt qua gò đất) |
| L3 | Từng loại | PASS — tên nỏ sinh ở độ cao 20 px, bay trái, trúng −1 máu; rìu −2 (BT-ART-01); đá, voi, chướng khí, chông (BT-ENGINE B, layout thử); kỵ binh có trong bot chạy hết màn |
| L4 | Mini-boss + cổng | PASS — ném hòm bạc ở độ cao 31 px; đủ 5 sách nhưng mini-boss sống → bị giữ ở x 9056 < đích 9066; hạ đúng **6 đòn**; sau đó qua đích → panel "Hoàn thành Màn 1" |
| L5 | Bà Triệu dẫn màn | PASS — đứng chunk 1 (x 190), hội thoại 5 câu đúng nguyên văn có chân dung; xong thì `met`, mờ dần |
| L6 | Câu hỏi + sách | PASS — bot chạy hết màn (mô phỏng `update(1/60)`, bất tử): 4 câu hỏi, 5/5 sách, nghỉ chân kích hoạt, hạ mini-boss, thắng (3643 khung ≈ 61 s mô phỏng) |
| L7 | Chơi tay | PASS — người dùng chơi thử 19/10/2026: "mọi thứ đều ok"; giữ nguyên mọi số `DESIGN_BASELINE` (rìu −2/1,8 s, đá 100 px/s, chướng khí 1,6/0,6/1,2 s, mini-boss 6 đòn/2,5 s) |
| L8 | `pytest` + giao diện | PASS — 94 passed, 1 skipped; ảnh chụp: hội thoại Bà Triệu, cảnh doanh trại (quan thu thuế ~1,3× người chơi). Chưa đo điện thoại ngang |

## TODO
- Chưa đo điện thoại ngang (L8).
- Tiếp theo: prompt Codex `BT_ART_02` (màn 2) + BT-L2.
