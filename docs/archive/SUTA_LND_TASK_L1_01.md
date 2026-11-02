# SỬ TA — CHƯƠNG 3: LÝ NAM ĐẾ
# TASK CARD: LND-L1 — MÀN 1 "TỪ QUAN CHIÊU BINH" (BỐ CỤC THẬT + ASSET LND_ART_01)

TASK_ID: LND-L1 • Version 1.0 • 02/11/2026 • **ĐÃ DUYỆT 02/11/2026** (Q1–Q5 theo đề xuất) • **XONG 02/11/2026** (chơi tay OK, asset → `IN_GAME`; report [REPORT_LND-L1.md](REPORT_LND-L1.md))
Task card tổng: [SUTA_LND_TASK_00.md](../SUTA_LND_TASK_00.md) (§3.1, §5.1–5.2) • Asset: `LND_ART_01` (prompt Codex đã xoá khi xong; kết quả soát Gate A1/A2 tóm tắt trong report)
Mẫu: màn 1 Bà Triệu (`js/levels/ba-trieu/level1.js` — nhóm xáo theo vùng, mini-boss cố định, Bà Triệu dẫn màn, nghỉ chân) • Cơ chế: LND-ENGINE (sông, đạn nhắm, lưới, vật phẩm trong xe)
Rule: `ly-nam-de-gameplay.md`, `engine.md`, `assets-32bit.md`

---

## 0. MỤC TIÊU

Thay bố cục khung (6 chunk, asset mượn chương 2) bằng màn 1 thật: **12 chunk**, **8 loại chướng ngại** của Excel, **mini-boss xe cống
phẩm trâu kéo + 2 lính hộ tống**, 5 Quyển Sách Tinh Hoa, 4 câu hỏi chặn đường, **Lý Bí dẫn màn**. Nhập asset `LND_ART_01` (đã PASS) vào
bản chạy, chơi thử, chỉnh số, rồi đổi status → `IN_GAME`.

**Không làm:** nội dung màn 2–3 (chỉ đổi lính tạm sang lính Lương, xem §5), kỹ năng, boss, nhạc riêng.

## 1. ASSET

- Chép từ vùng Codex sang bản chạy, **giữ cấu trúc thư mục**, chỉ file manifest tham chiếu (không chép `raw/`, `meta/`, `preview/`,
  `frames/`, `concept/`):
  - `assets/sprites-32bit/ly-nam-de/` → `frontend/static/assets/images/ly-nam-de/sprites-32bit/` + `manifest_lnd.json` (15 ID, 35 strip)
  - `assets/maps-32bit/ly-nam-de/` → `frontend/static/assets/images/ly-nam-de/maps-32bit/` + `maps_lnd.json` (6 ảnh)
- `config.js`: `SPRITE_ROOT`/`MAP_ROOT` trỏ `images/ly-nam-de/`; `BORROWED_MAPS` mượn chương 1 (trời, tile, làng, **đồng lúa**, bia câu
  hỏi) + chương 2 (`ITEM_BT_TINH_HOA`, `PROP_BT_CAMP_GATE`/`_OPEN`, nền rừng/đầm/doanh trại cho màn 2–3 khung).
- Hitbox tự khai báo (pixel logic, từ số đo report Codex — `DESIGN_BASELINE`):

| Thực thể | Asset | Khai báo |
|---|---|---|
| Lính tuần tiễu | `EN_LUONG_PATROL` | 22×34, kích 49 px ngoài mép (mũi kích ô 4 = +60 từ pivot, trùng lính Ngô) |
| Quan thu thuế | `EN_LUONG_TAXMAN` + `PJ_LEAD_COINS` | thrower, tay ném ô 5 (+15,5; cao 29) |
| Thuyền chiến | `EN_LUONG_WAR_BOAT` + `PJ_FIRE_ARROW` | thrower nổi trong khe sông `aim`, pivot = mặt đất +14, điểm phóng (+33; cao 27,5) |
| Cung thủ tháp canh | `EN_LUONG_ARCHER` + `PJ_CROSSBOW_BOLT`, tháp `PROP_LUONG_WATCHTOWER` | thrower `aim` đứng cao 92; điểm phóng (+10,75; cao 23); tháp vẽ qua `CHAPTER.hooks.draw` (chân tháp ở hàng 447 → bù offset 2 px) |
| Bẫy lưới trúc | `TR_BAMBOO_NET` | snare 40×12 (fall 38,5–40 / landed 42,75) |
| Chó săn | `EN_LUONG_HOUND` | rusher 26×18, cắn thấp (2,5–5,75 trên chân) |
| Xe cống phẩm nhỏ | `OB_TRIBUTE_CART` (chép chương 1) | roller phá được, chở 1 sách (`carrier`) |
| Đá lở | `OB_BOULDER` | roller hp 2 (như chương 2) |
| Mini-boss xe trâu | `EN_LUONG_TRIBUTE_WAGON` | patrol `boss: true`, thân ~100×44 (bbox ảnh 119,5×53,5 gồm sừng trâu), chở 1 sách |
| Lý Bí | `NPC_LY_BI` + `PORTRAIT_LY_BI` | guide đầu màn (như Bà Triệu) |
| Mỏm đá | `PROP_LND_ROCK_LEDGE` | bục một chiều 64 px trên khe sông, mặt trên hàng 0 |
| Mặt nước | `PROP_LND_RIVER_WATER` | `CHAPTER.tiles.water` |

- **Sửa nhỏ engine** (`render/terrain.js` `drawWater`): vẽ dải tối như hố thường (`HOLE_DEPTH_BANDS`) **trước** ảnh nước — 6 hàng trong
  suốt trên cùng của ảnh nước hiện lộ vạch trời xanh trong khe. Chỉ ảnh hưởng khe `'~'` (chỉ chương 3 dùng).

## 2. BỐ CỤC (DESIGN_BASELINE)

| Chunk | Vùng (lớp giữa) | Ghi chú |
|---|---|---|
| 1–2 | đồi trung du (`BG_LND_MID_MIDLAND_HILLS`) | Lý Bí chờ ở chunk 1; chunk 1 chỉ nhóm "dễ"; đá lở ưu tiên ở đây |
| 3–4 | làng (`BG_TT_MID_VILLAGE` mượn) | |
| 5–7 | bờ sông Hồng (`BG_LND_MID_RED_RIVER`) | 2 thuyền chiến + khe sông + mỏm đá |
| 8–11 | trạm kiểm soát (`BG_LND_MID_LUONG_CHECKPOINT`) | cung thủ tháp canh; **mini-boss chunk 11** |
| 12 | đồng bằng Giao Châu (`BG_TT_MID_FIELDS` mượn) | cổng doanh trại nghĩa quân `PROP_BT_CAMP_GATE` = đích, `worldX(12, 618)` |

- Đồi xa `BG_LND_FAR_MIDLANDS` (đáy y 230) cả màn. Dài 12 × 768 = **9216 px** = `stage_length` của `maps_lnd.json`.
- 4 bia câu hỏi chunk 3, 5, 8, 10 (rút 4 câu không trùng từ 36 câu `LEVEL1_QUESTION_POOL`); không đặt bia trong khe sông.
- Cổng mở khi đủ 5 sách + hạ mini-boss.

## 3. CHƯỚNG NGẠI — ĐÚNG 12 KỂ CẢ MINI-BOSS

10 nhóm xáo mỗi lượt vào chunk 1–10 trong **vùng được phép** (lệch ±60 px; nhóm có địa hình lệch bội số 16 px) + 1 bẫy lưới cố định +
mini-boss cố định:

| # | Nhóm | Cơ chế | Vùng | Số DESIGN_BASELINE |
|---|---|---|---|---|
| 1–2 | Lính tuần tiễu (×2) | `guard` | 2–10 | hp 2, như lính Ngô |
| 3 | Quan thu thuế | `thrower` + `leadCoins` | 2–10 (không 5–7) | hp 2, ném mỗi 2,8 s, tầm 220, đạn ngang |
| 4–5 | Thuyền chiến (×2) | `thrower` nổi + `fireArrow` `aim` | sông 5–7 | lưới địa hình: khe 112 px có thuyền, đất 64, khe 176 px có mỏm đá 64 giữa; bắn mỗi 2,2 s |
| 6 | Cung thủ tháp canh | `thrower` đứng cao 92 + `crossbowBolt` `aim` | trạm 8–10 | bắn mỗi 2,0 s, tầm 260; không với tới (không hp) |
| 7 | Bẫy lưới trúc | `snare` (công tắc ẩn) | nhóm **dễ**: 1–4, 8–10 | treo 90, báo hiệu 0,35 s, −1 máu + trói 1 s |
| 8 | Chó săn | `rusher` | 2–10 | hp 1, 150 px/s |
| 9 | Xe cống phẩm nhỏ | `roller` phá được, **chở 1 sách** | 2–4, 8–10 | hp 2, −110 px/s; lăn mất thì sách rơi tại chỗ xe biến mất |
| 10 | Đá lở | `roller` hp 2 | đồi 2 (+3–4 nếu thiếu chỗ) | −100 px/s, như chương 2 |
| 11 | Bẫy lưới cố định | `snare` | chunk 9, trạm kiểm soát | như #7 |
| 12 | **Mini-boss xe trâu** | `patrol`, `boss: true`, **chở 1 sách** | **cố định chunk 11** | hp 6, đi tuần 200 px @35, **không dừng, không ném** (va chạm −1 máu); 2 `EN_LUONG_PATROL` hộ tống đứng hai bên |

- Sách: **3 cố định** (chunk 2, 6, 9 — trên cao vừa nhảy) + 1 trong xe nhỏ + 1 trong xe trâu = 5.
- Kiểm bố cục: `checkTerrainFootprints`, `checkPlatformReach`; không đặt nhóm khác vào khe sông.
- Nghỉ chân hồi 1 máu (sự kiện 1 lần) ở chunk 8 đầu trạm kiểm soát, như chương 2.

## 4. NỘI DUNG CHỮ

- Thông báo đầu màn: nguyên văn LND-00 §5.1 (đã có trong code).
- Lý Bí dẫn màn — **nguyên văn LND-00 §5.2** (đã duyệt 31/10), chép vào `dialogue-data.js` `STORY_LY_BI_INTRO`, chân dung `PORTRAIT_LY_BI`.
- Câu thông báo trúng đòn/hạ (thuyền, cung thủ, lưới, chó, xe, đá, quan thu thuế, mini-boss): câu ngắn kiểu chương 2, không nội dung lịch sử.

## 5. FILE

| Loại | File |
|---|---|
| Tạo (chép asset) | `frontend/static/assets/images/ly-nam-de/{sprites,maps}-32bit/**` |
| Sửa | `js/levels/ly-nam-de/{config,level1,chapter,dialogue-data}.js`; `level2.js`, `level3.js` chỉ đổi lính tạm `EN_NGO_SOLDIER` → `EN_LUONG_PATROL`, hố chông → lưới trúc (manifest chương 2 không còn nạp) |
| Tạo | `js/levels/ly-nam-de/render-extras.js` (vẽ tháp canh sau cung thủ, qua `hooks.draw`) |
| Sửa engine | `js/engine/render/terrain.js` — `drawWater` (dải tối dưới ảnh nước) |
| Sửa | `templates/components/home/{timeline,chapter}.html` — mở thẻ Lý Bí `data-unlock-after="2"` (LND-00 §1) |
| Sửa (sau chơi thử) | status `NORMALIZED` → `IN_GAME` trong `manifest_lnd.json` / `maps_lnd.json` (bản nguồn rồi chép lại) |
| Sửa tài liệu | `.claude/rules/{ly-nam-de-gameplay,assets-32bit}.md`, `CLAUDE.md` (trạng thái chương 3), `docs/REPORT_LND-L1.md` (mới); xoá `CODEX_PROMPT_LND_ART_01.md` khi xong |
| Chỉ đọc | `js/levels/ba-trieu/level1.js` (mẫu, không import), `js/engine/*` |

Giữ layout thử `?layout=engine` (chuyển sang asset thật).

## 6. TEST

| # | Test |
|---|---|
| L1 | Màn dài 9216 px, 5 vùng đúng chunk, hết cảnh báo "stage khác"; console sạch (trừ 401 khách); không ảnh nào vẽ hộp tạm |
| L2 | Đúng 12 chướng ngại kể cả mini-boss; 10 lượt tải lại: chunk 1 chỉ nhóm dễ, thuyền luôn ở 5–7, cung thủ luôn ở 8–10 |
| L3 | Từng loại: kích −1 máu ô 4; tiền chì rời tay ô 5, chém tan; thuyền bắn chéo lên theo người chơi, mặt nước che thân dưới; rơi sông → về chỗ đứng cuối; cung thủ đứng đúng sàn tháp, bắn chéo xuống; lưới trói 1 s; chó cắn thấp; xe nhỏ vỡ rơi sách / lăn mất rơi sách; đá lở |
| L4 | Mini-boss chunk 11: đi tuần, 6 đòn hạ, xe vỡ rơi sách; 2 lính hộ tống; thiếu sách hoặc chưa hạ → cổng đóng; đủ → cổng mở, qua đích → "Sang Màn 2" |
| L5 | Lý Bí chờ ở chunk 1, 2 câu thoại đúng nguyên văn, chân dung hiện, mờ dần sau khi nói |
| L6 | 4 câu không trùng; nhặt đủ 5 sách |
| L7 | Khe sông: không còn vạch trời; hố thường chương 1–2 vẽ như cũ |
| L8 | Màn 2–3 khung vẫn chạy (lính Lương thay lính Ngô); thẻ trang chủ Lý Bí mở khi đã qua chương 2 |
| L9 | Chơi tay hết màn ít nhất 1 lần, ghi thời gian; chỉnh số nếu quá dễ/khó |
| L10 | `pytest tests` PASS; `/verify-ui` desktop + điện thoại ngang; hồi quy (sửa engine `drawWater`): màn 1 Trưng Trắc, màn 1 Bà Triệu, `?layout=engine` chương 2 có hố thường |

## 7. CÂU HỎI CẦN CHỐT

| # | Câu hỏi | Đề xuất |
|---|---|---|
| Q1 | Thứ tự vùng §2 (đồi 1–2 → làng 3–4 → sông 5–7 → trạm 8–11 → đồng bằng 12)? | **Duyệt** |
| Q2 | 5 sách = 3 cố định + 1 trong xe nhỏ + 1 trong xe trâu mini-boss? | **Duyệt** — đúng thiết kế "phá xe rơi sách" |
| Q3 | Mini-boss xe trâu đi tuần không dừng, gây sát thương khi va, 6 đòn, 2 lính hộ tống (không ném gì)? | **Duyệt** — xe không có animation ném |
| Q4 | Nghỉ chân hồi 1 máu ở chunk 8 như chương 2? | **Có** |
| Q5 | Mở thẻ Lý Bí trên trang chủ ngay ở task này (khoá tới khi qua chương 2)? | **Có** — đã có asset thật |

## 8. GATE
1. Engine chỉ sửa `drawWater`; không sửa file chương 1–2; số mới ghi `DESIGN_BASELINE`.
2. Test L1–L10 có số đo; FAIL hoặc sửa ngoài phạm vi → `BLOCKED`.
3. Report `/task-report`; chỉ commit khi người dùng yêu cầu. Sau đó: `LND_ART_02` (prompt Codex màn 2) + LND-L2.
