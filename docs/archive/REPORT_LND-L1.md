# REPORT LND-L1 — Màn 1 "Từ quan chiêu binh" (bố cục thật + asset LND_ART_01)

Task card: [SUTA_LND_TASK_L1_01.md](SUTA_LND_TASK_L1_01.md) • 02/11/2026 • **PASS** — L1–L8, L10 bằng mô phỏng; L9 người dùng chơi tay (sửa khe hở mặt nước, rồi duyệt) → asset `IN_GAME`.
Yêu cầu người dùng: lập kế hoạch + làm LND-L1 (duyệt Q1–Q5 theo đề xuất 02/11/2026).

## Quyết định người dùng chốt (02/11/2026)
- Q1 vùng: đồi trung du 1–2 → làng 3–4 → sông Hồng 5–7 → trạm kiểm soát 8–11 → đồng bằng 12.
- Q2 sách: 3 cố định + 1 trong xe cống phẩm nhỏ + 1 trong xe trâu mini-boss.
- Q3 mini-boss xe trâu: đi tuần không dừng, không ném, va chạm −1 máu, 6 đòn, 2 lính hộ tống.
- Q4 nghỉ chân hồi 1 máu chunk 8. Q5 mở thẻ Lý Bí trang chủ (khoá tới khi qua chương 2).

## File
| File | Việc |
|---|---|
| `static/assets/images/ly-nam-de/{sprites,maps}-32bit/**` (mới) | Chép 35 strip + `manifest_lnd.json`, 6 ảnh + `maps_lnd.json` từ vùng Codex (chỉ file manifest tham chiếu); 3,1 MB |
| `js/levels/ly-nam-de/config.js` | Trỏ asset chương; `BORROWED_MAPS` chương 1 + 2; `TILES.water`; 5 vùng màn 1, cổng, `MINIBOSS`, `FIXED_NET`, `REST`, `LEVEL1_ITEMS`, `NET`, `RIVER`, `TOWER`, bia câu hỏi; hitbox lính/chó/quan thu thuế/thuyền/cung thủ/tháp/xe/xe trâu từ số đo Codex; `NPC_SPRITES.lyBi`, `PORTRAITS` |
| `js/levels/ly-nam-de/level1.js` | 10 nhóm xáo theo vùng + lưới cố định + mini-boss; sự kiện nghỉ chân; layout thử dùng asset thật |
| `js/levels/ly-nam-de/{chapter,dialogue-data}.js` | `guide` Lý Bí (`STORY_LY_BI_INTRO` nguyên văn LND-00 §5.2), cổng, `events`, `stateFields` |
| `js/levels/ly-nam-de/level2.js` | Hố chông (sprite chương 2, không còn nạp) → lưới trúc |
| `js/engine/render/{terrain,index}.js` | `drawWaterBanks()`: vách bờ tối sau khe sông, vẽ **trước** vật nổi |
| `templates/components/home/{timeline,chapter}.html` | Thẻ Lý Bí `data-unlock-after="2"` |
| `.claude/rules/{ly-nam-de-gameplay,assets-32bit,engine}.md`, `CLAUDE.md` | Trạng thái chương 3, asset, `drawWaterBanks` |

Không sửa file nào của chương 1–2.

**Khác task card:**
1. Tháp canh vẽ bằng hazard kind `prop` có sẵn (đặt trước cung thủ trong danh sách) thay cho file `render-extras.js` + `hooks.draw` — `beforeEnemies` vẽ **sau** hazard nên tháp sẽ đè lên cung thủ; `prop` không cần file mới.
2. Engine sửa 2 file (`terrain.js` + 1 dòng gọi trong `index.js`) thay vì chỉ `drawWater`: bản đầu phủ vách tối ngay trong `drawWater` (sau thuyền) đã che mất thân thuyền giữa mặt đất và mặt nước — phải vẽ vách trước lớp vật nổi.
3. Quan thu thuế local 440 (thay 520): bản đầu đứng đè bia câu hỏi local 560 ở chunk 8/10.
4. `ENGINE_TEST.ledge` cao 40 → 10 (mỏm đá có ảnh, mặt trên sát mặt nước như mockup Codex).

## Kết quả test
| # | Test | Kết quả |
|---|---|---|
| L1 | Độ dài + vùng + console | PASS — 9216 px, nền đồi/làng/sông/trạm/đồng lúa + đồi xa `BG_LND_FAR_MIDLANDS` nạp đúng; console chỉ 401 khách, hết cảnh báo "stage khác", không cảnh báo sprite chưa nạp |
| L2 | 12 chướng ngại, vùng | PASS — 10 lần sinh: luôn 12; chunk 1 luôn lưới trúc; thuyền luôn ở 5–7; cung thủ luôn ở 8–10; không bia/sách nào trong khe sông; luôn 5 sách |
| L3 | Từng loại | PASS — thuyền bắn hoả tiễn nhắm người chơi (−176°), trúng −1 máu, thân thuyền hiện trên vách tối, mặt nước che phần dưới; đứng trên mỏm đá (chân 238 = mặt bục); rơi sông −1 máu, hiện lại trên mỏm đá; cung thủ đứng đúng sàn tháp (chân hàng 156, sàn hàng 157), quay về người chơi, tên bay 150°; quan thu thuế ném tiền chì ở ô hit; lưới: báo hiệu → rơi → nằm đất, −1 máu + trói; chó săn cắn sau 29 frame, −1 máu; xe nhỏ 2 đòn vỡ, sách hiện tại tâm xe, xác nằm lại; đá lở trúng −1 máu |
| L4 | Mini-boss | PASS — đi tuần (63 px/2 s), máu 6→0 sau 6 đòn, xác nằm lại, sách hiện (x 8154, cao 40), thanh máu boss; 2 lính hộ tống; đủ 5 sách → qua đích → nút "Sang Màn 2" |
| L5 | Lý Bí dẫn màn | PASS — 2 câu đúng nguyên văn, chân dung `PORTRAIT_LY_BI`, hội thoại mở sau cảnh đi vào |
| L6 | Câu hỏi + sách | PASS — 4 câu không trùng ở chunk 3, 5, 8, 10; nhặt đủ 5/5 |
| L7 | Khe sông | PASS — hết vạch trời; hố thường chương 2 (`?layout=engine`, x 1088) vẽ như cũ, hồi sinh x 844 |
| L8 | Màn 2–3, trang chủ | PASS — màn 2 (lưới trúc + 2 lính Lương), màn 3 (đợt lính Lương) chạy 600–900 frame không lỗi; thẻ chọn tướng: chưa qua chương 2 "🔒 Qua chương Bà Triệu", có cờ `suta.cleared.2` → "▶ Bắt đầu chơi"; dòng thời gian mở thẻ, bỏ khoá |
| L9 | Chơi tay hết màn | PASS — người dùng chơi tay 02/11: báo khe hở giữa nền giữa và mặt nước (đã sửa, mục dưới), sau đó duyệt "Đẹp rồi" |
| L10 | pytest + giao diện + hồi quy | PASS — 108 passed, 1 skipped (`test_app.py` thiếu DB test); điện thoại ngang 812×375: khung 523×221, không cuộn ngang; hồi quy mô phỏng không lỗi JS: Trưng Trắc màn 1, Bà Triệu `?layout=engine`, Lý Nam Đế `?layout=engine` |

## Sửa sau chơi tay (02/11/2026)
- Người dùng chơi tay: giữa đáy lớp nền giữa và mặt nước hở một dải tối (6 hàng trống trên cùng của `PROP_LND_RIVER_WATER`). Sửa bằng code, không đụng ảnh: `TILES.waterLift: 6` (ảnh nước vẽ cao lên 6 px, mặt nước sát mép đất), `TILES.waterDeep: '#56341f'` (= màu hàng đáy ảnh nước, phủ 4 px đáy khung còn trống), thuyền `floatY` 14 → 10 (mớn nước trùng mặt nước mới). Engine: `drawWater` đọc `tiles.waterLift`, `drawWaterBanks` đọc `tiles.waterDeep` (không khai báo = như cũ — chương 1–2 không đổi).

## Vấn đề asset
- Không có lỗi mới. Asset `LND_ART_01` vẫn `NORMALIZED` (đổi `IN_GAME` sau L9).
- Lưới trúc nằm đất (`landed`) khá khó thấy dưới chân người chơi ở cỡ chơi thật — xem lại khi chơi tay.

## Câu hỏi cho team / TODO
- Câu hỏi Codex còn mở (không chặn): trang phục quan thu thuế; hình thuyền/tháp canh; nhịp lặp nền 384/320 logic; tông trung du/phù sa.
- Số DESIGN_BASELINE cần chỉnh sau chơi tay: tốc độ/khoảng bắn thuyền, cung thủ; độ rộng khe sông 112/176; máu xe trâu.

## Asset LND_ART_01 — kết quả soát (prompt Codex đã xoá)
- Gate A1 (01/11): PASS; NORMALIZE vụn pixel `EN_LUONG_PATROL.attack_01` ô 5–6. Team chốt màu phe Lương **A xám tro**; giữ 3 màu vàng trong `palette_32_lnd.png`.
- Gate A2 (01/11): PASS; NORMALIZE `EN_LUONG_PATROL.attack_01` ô 5–6 lơ lửng 15 px ảnh (lộ ra sau khi xoá vụn) + `EN_LUONG_WAR_BOAT.throw` thân giật ngang 8 px ở ô chẵn. Sửa xong 02/11, soát lại PASS (dịch thuần, các ô khác không đổi pixel).
- Status `IN_GAME` 02/11 (15 sprite, 6 map) ở bản nguồn + bản chạy.

## Bước tiếp
`LND_ART_02` (prompt Codex màn 2) + LND-L2.
