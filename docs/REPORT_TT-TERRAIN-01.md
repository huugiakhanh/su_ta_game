# REPORT TT-TERRAIN-01 — Địa hình cao/thấp dạng lưới ô vuông

Ngày: 30/09. Yêu cầu (chat, người dùng): đa dạng địa hình nền đất — hố + đoạn đất cao hơn để nhảy lên;
dựng địa hình bằng các ô vuông ghép lại. Chốt với người dùng: **chỉ bậc cao/thấp** (không bục lơ lửng),
áp dụng **màn 1 và màn 2**, layout do Claude đặt bản thử (`DESIGN_BASELINE`). Không có task card riêng.

## Thiết kế

- **Soạn địa hình bằng lưới chữ**, mỗi chunk 48 cột × 16 px (= 1 tile mặt đất): `'#'` đất, `'.'` trống;
  hàng cuối = `GROUND_Y` (248), mỗi hàng trên cao thêm 1 ô; `'.'` ở hàng cuối = **hố**. Độ cao cột = số
  `'#'` liền nhau từ đáy (ô lơ lửng bị bỏ + cảnh báo). Chunk không khai báo = phẳng.
- `geometry.js` giữ địa hình màn đang chơi (`setTerrain`), `groundYAt(x)` = đỉnh cột; `terrainLevelAt`,
  `terrainHoles` (sinh `state.holes` từ lưới — mọi cơ chế hố cũ giữ nguyên), `flatSpan`.
- Nhảy cao tối đa ≈ 83 px ≈ 5 ô; bậc chênh > `TERRAIN_MAX_STEP` (3 ô) thì cảnh báo. Layout hiện dùng bậc
  1–2 ô (16–32 px).

## File đã sửa

| File | Mục đích |
|---|---|
| `config.js` | Bỏ `TERRAIN_RAMPS` (rỗng, không dùng); thêm `TERRAIN_CELL` = 16, `TERRAIN_MAX_STEP` = 3 |
| `geometry.js` | Địa hình màn đang chơi + `buildTerrain`/`terrainLevelAt`/`terrainHoles`/`flatSpan`; `groundYAt` đọc lưới |
| `state.js` | Màn 1: 5/10 nhóm vật cản có `terrain` đi kèm (nhóm có địa hình lệch ±1 ô thay vì ±60 px); `randomizeObstacles()` dựng địa hình trước rồi mới dựng vật. Màn 2: `LEVEL2_TERRAIN` (chunk 1, 2, 5, 6, 8 có bậc; 2 hố cũ chuyển vào lưới, cùng vị trí). Lính đứng theo mặt đất, đoạn tuần tra kẹp trong đoạn phẳng; sách/bia câu hỏi/NPC theo mặt đất; `checkTerrainFootprints()` cảnh báo vật vắt qua bậc |
| `physics.js` | `playerGroundY` lấy bậc cao nhất dưới 2 chân (bỏ nhánh "chân phía trước" dành cho dốc); `resolveTerrainWalls()` — sườn bậc chặn ngang, không mất máu; roller (hổ, xe cống, kỵ binh) chạy theo bậc; đạn đập sườn bậc thì tan |
| `render.js` | `drawGround()` vẽ cột bậc (`drawRaisedColumn`): đỉnh `surface`, thân `fill` chồng tới đáy khung, sườn dùng tile `corner-*`/`wall-*` nếu có, chưa có thì dải bóng tạm; NPC/bia câu hỏi vẽ theo mặt đất |
| `docs/CODEX_PROMPT_TILESET_TT_TERRAIN.md` | Prompt giao Codex vẽ bộ tile ghép địa hình (xem mục bổ sung cuối) |
| `CLAUDE.md` | Cập nhật mô tả map/physics/màn 1–2 |

Màn 3 (đấu trường) và layout thử `?layout=p2`/`?layout=skills` giữ phẳng (`setTerrain(null)`).

## Kiểm thử (trình duyệt, `?debug=1`)

| # | Ca | Kết quả |
|---|---|---|
| 1 | Màn 2: 2 hố sinh từ lưới đúng vị trí cũ (x 2704 w 64; x 4768 w 96), cầu vẫn giữ | PASS |
| 2 | Đi vào sườn bậc 1 ô (chunk 1 màn 2): dừng ở mép (x 363.99), vẫn `grounded` (nhảy được), không mất máu | PASS |
| 3 | Nhảy lên bậc: tiếp đất ở chân = 232 | PASS |
| 4 | Đi ra khỏi mép phải bậc: rơi xuống 248 khi cả 2 chân rời bậc | PASS |
| 5 | Lính canh chunk 5 màn 2 đứng trên gò (chân 232), đoạn tuần tra trong gò | PASS |
| 6 | Màn 1: 200 lượt `createLevelState` ngẫu nhiên — 0 cảnh báo (không vật/bia vắt qua bậc, không bậc quá cao) | PASS |
| 7 | Xe cống lăn qua đồi 2 bậc: chân 248 → 232 → 216 → 232 → 248 | PASS |
| 8 | Túi tiền bay ngang ở độ cao 226 → tan khi chạm sườn bậc 2 ô (đỉnh 216) | PASS |
| 9 | Màn 3: vào trận, mô phỏng 4 s, người chơi/chiến xa đứng ở 248, không lỗi console | PASS |
| 10 | Console màn 1–2–3: không lỗi, không cảnh báo địa hình | PASS |

Chưa chơi thử hết màn bằng tay (độ khó, cảm giác bậc đất) — cần team chơi thử để chỉnh layout.

## Asset

- `TODO_MISSING`: bộ tile ghép địa hình `TILESET_TT_TERRAIN` — prompt
  [CODEX_PROMPT_TILESET_TT_TERRAIN.md](CODEX_PROMPT_TILESET_TT_TERRAIN.md). Tạm: tile Z1 `surface` + `fill` + dải bóng.
- Tile `fill` giờ được xếp chồng dọc (trước chỉ thấy 6 px) — nhìn tạm ổn ở Z1; team soát thêm các vùng
  khác, nếu lộ đường nối dọc thì ghi `NEED_REDRAW` vào prompt trên.

## Bổ sung 30/09 — dùng chung 1 tile mặt đất

Yêu cầu người dùng: dùng chung 1 tile ground cho đồng bộ. Chốt: **mọi vùng/màn dùng bộ tile Z1** và chỉ
**tile đầu tiên** mỗi vai trò (`surface`, `fill`, `left-edge`/`right-edge`, `pit-top`/`pit-deep`, sau này
`corner-*`/`wall-*`) — không biến thể theo cột. Decor vẫn rải theo cột.

- `config.js`: thêm `GROUND_TILE_REGION = 'Z1'`; bỏ trường `tiles` của `ZONES`/`LEVEL2_ZONES`/`LEVEL3_ZONES`.
- `render.js`: `groundRegion()`/`groundTile()` thay cho chọn region theo vùng + `pick()` theo hash
  (`drawGround`, `drawRaisedColumn`, mép hố, `drawHoles`).
- Kiểm tra: màn 2 chunk 4 (vùng rừng Z3, có hố 64 px) vẽ đất + lòng hố của Z1, không lỗi console — PASS.
- Prompt Codex tile sườn: chỉ còn cần Z1 (sau đó thay bằng bộ tile ghép địa hình — mục dưới).

## Bổ sung 30/09 — bộ tile ghép địa hình `TILESET_TT_TERRAIN`

Yêu cầu người dùng: một bộ tile kiểu ghép khối (ảnh tham khảo: tileset stock 16×16 — chỉ tham khảo cấu
trúc, có watermark/bản quyền, không đưa vào repo) để ghép địa hình dễ. Chốt: không cần bục lơ lửng → không
cần hàng đáy/góc dưới.

- Contract: sheet 64×48, 12 vai trò (`corner-left/right/single`, `surface`, `wall-left/right/single`, `fill`,
  `inner-left/right`, `pit-top/deep`) — [CODEX_PROMPT_TILESET_TT_TERRAIN.md](CODEX_PROMPT_TILESET_TT_TERRAIN.md)
  (thay prompt tile sườn cũ, đã xoá).
- `config.js`: `TERRAIN_TILESET_ID`, `TERRAIN_TILE_ROLES`. `assets.js`: `loadTerrainTiles()` — nạp nếu có
  trong `maps_tt.json`, không có thì không tính thiếu. `render.js`: `terrainTileRole()` (chọn vai trò theo
  đỉnh cột + 2 cột bên cạnh; hố = sâu vô tận), `drawGroundAutotile()`, lòng hố lấy từ sheet mới, nhãn F2
  (`drawTerrainDebug`); `drawRaisedColumn()` gọn lại chỉ còn cách vẽ tạm bằng tile Z1.

| # | Ca | Kết quả |
|---|---|---|
| 11 | `terrainTileRole` trên đồi 2 bậc chunk 2 màn 2: CL/S/CR ở đỉnh, IL/IR đúng hàng mặt cỏ bậc thấp, F còn lại | PASS |
| 12 | `terrainTileRole` quanh hố chunk 4: `S CR │ hố │ CL S` / `F WR │ hố │ WL F` | PASS |
| 13 | Nhánh `drawGroundAutotile` chạy với sheet GIẢ dựng tạm trong trình duyệt từ tile Z1 (không ghi file) + F2 hiện nhãn, không lỗi console; tải lại trang bỏ sheet giả | PASS |
| 14 | Chưa có `TILESET_TT_TERRAIN`: game vẽ như trước (tile Z1), không cảnh báo thiếu | PASS |

### Tích hợp bộ tile thật — 30/09

Codex giao `TILESET_TT_TERRAIN` (64×48, 12 vai trò, `region: ALL`); người dùng duyệt → `IN_GAME`. Lưu ý quy
trình: Codex **tự chép** PNG/JSON + mục manifest sang `frontend/` (CLAUDE.md giao việc chép cho Claude) —
Claude đã soát lại thay vì chép lần nữa.

| # | Ca | Kết quả |
|---|---|---|
| 15 | PNG/JSON bản chạy trùng byte bản nguồn; `maps_tt.json` bản chạy chỉ thêm 1 mục `TILESET_TT_TERRAIN` (64×48, `IN_GAME`), 2 manifest khớp nhau | PASS |
| 16 | Game nạp đủ 12 vai trò, không cảnh báo thiếu | PASS |
| 17 | Màn 2 chunk 2 (đồi 2 bậc): góc trái/phải, sườn, góc trong ghép liền (soát phóng ×3) | PASS |
| 18 | Màn 2 chunk 4 (hố 64 px): 2 mép hố thành vách đất (góc + sườn), lòng hố tile mới | PASS |
| 19 | Màn 2 chunk 7 (hố 96 px có cầu): cầu đè đúng lên hố; F2 nhãn S/CR/CL đúng | PASS |
| 20 | Màn 1, màn 3 tải không lỗi console | PASS |

Mép hố giờ là cột đất đặc tới đúng mép hố vật lý (trước là tile mép nửa ô) — khớp `pointHasGround`.

**Sửa sau chơi thử (người dùng 30/09):** tile lòng hố khác màu làm hố nhìn như một mảng đất tối, không ra
hố → `drawHoles()` để **trống** hố khi dùng `TILESET_TT_TERRAIN` (thấy nền trời/lớp giữa phía sau, 2 mép là
vách đất). `pit-top`/`pit-deep` trong bộ tile không còn dùng (giữ trong sheet). Kiểm tra màn 2 chunk 4: hố
hiện khoảng trống thấy trời, không lỗi — PASS.

Tiếp đó (người dùng yêu cầu): phủ **lớp tối mờ** lên hố trống, tối dần xuống đáy theo 4 bậc
(`HOLE_DEPTH_BANDS` alpha .15 → .75, không gradient mịn, `DESIGN_BASELINE`). Kiểm tra chunk 4 màn 2 (phóng
×3): miệng hố còn thấy nền, đáy tối, không lỗi console — PASS.

## TODO / lưu ý thiết kế

- Layout bậc đất là `DESIGN_BASELINE`, chờ chơi thử.
- Lính trên gò chỉ đi trong gò; lính dưới đất không leo gò. Hổ/xe/kỵ binh "nhảy" thẳng lên bậc (không
  animation leo).
- Lính thu thuế/lính gác đứng thấp hơn người chơi: đạn có thể đập sườn bậc (bậc thành chỗ nấp) — cố ý.
- Hố chỉ đặt ở mặt đất thường (level 0), không cạnh bậc cao (tile mép hố vẽ theo `GROUND_Y`).
