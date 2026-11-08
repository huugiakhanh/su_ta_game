# REPORT MHD-L3 — Màn 3 "Công phá Tống Bình"

Task card: [SUTA_MHD_TASK_L3_01.md](SUTA_MHD_TASK_L3_01.md) • 08/11/2026 • **PASS** (người dùng chơi tay ổn 08/11; asset → `IN_GAME`). `test_app.py` chưa chạy trên DB test.
Yêu cầu người dùng: "Duyệt, làm màn 3".

## Quyết định (người dùng chốt 08/11)
Q1–Q8 theo đề xuất trong task card:
- Câu thông báo trận `BOSS_TEXT` và số liệu `DESIGN_BASELINE` duyệt.
- Xe luôn khựng 1,8 s khi đâm tường, kể cả khi đã có Viện Binh.
- Mỗi lượt cần 2 nhát vào cần; phải đứng trên bục mới tính.
- Boss GĐ 1–2 có thân, chém trúng tóe lửa.
- Mai Thúc Loan đứng giữa sân lúc kéo cờ, không thoại riêng.
- Thư viện (Thúc Bảo), thoại §5.2 để nguyên cho team.

## Thay đổi so với task card (phát sinh khi làm)
| Mục | Task card | Làm thực tế | Lý do |
|---|---|---|---|
| Nền cổng | Đổi lớp giữa `LEVEL3_ZONES` | `zone.mid` vẫn khai báo để engine nạp ảnh, nhưng `render-extras.js` lấy ảnh ra và **tự vẽ theo toạ độ thế giới** | Engine vẽ lớp giữa ở parallax 0,5: khung nhìn 480 px thì cổng nằm ngoài màn (x màn hình 496), boss phi tới chỗ không có cổng, cờ không khớp lỗ cắm. Cách này không phải sửa engine |
| Tầm ném hũ dầu | Giữ số engine thử (160) | `CARRY.oilJar` range 120, bay 0,6 s | Đứng cách vệ sĩ 100–120 px thì hũ bay qua đầu, chỉ chạm đất cách quá 36 px nên không cháy. Với 120: cách 84–156 px là được |
| Xe húc | "Chạm thân −1 máu" | Chỉ **nửa trước** xe gây sát thương (từ −10 tới mũi húc, cao 54) | Thân dài 120 cao 58: tính ra đứng yên nhảy không qua nổi (cần 0,6 s, chỉ ở trên cao 0,39 s) |
| Số đo `*` | Đo lúc code | Lưỡi đao `attack_01` tới +40, cao 0–14; `attack_02` tới +42, cao 12–30. Điểm bắn +48, cao 50. Vệ sĩ tầm 12; trinh sát tầm 10 | Đo trên ảnh ô hit |

## File đã sửa
| File | Việc |
|---|---|
| `js/levels/mai-hac-de/boss.js` (mới) | Trận 3 giai đoạn, cutscene, `ENEMY_KINDS`, ô boss HUD, móc hũ dầu + bình máu |
| `js/levels/mai-hac-de/skills.js` (mới) | `MHD_SKILLS`: Ý chí dân nghèo, Vỏ Bọc Vạn An, Viện Binh |
| `js/levels/mai-hac-de/level3.js` | Thay khung bằng dựng quân thật, `?layout=skills` |
| `js/levels/mai-hac-de/config.js` | `BOSS`, `CART`, `GUARDS`, `JAR`, `SCOUTS`, `SKILLS`, `BOSS_TEXT`, art vệ sĩ/trinh sát/boss/xe, `LEVEL_SPRITES[3]`, `PORTRAITS`; bỏ `WAVES` |
| `js/levels/mai-hac-de/{chapter,render-extras,audio-data,dialogue-data}.js` | Nối móc, vạch báo + FX + cờ + nền cổng, tiếng trận (chép định nghĩa chương 4), cutscene + panel (chép bằng script từ MHD-00 §5.3–5.4) |
| `templates/gameplay/levels/mai-hac-de.html` | 3 block kỹ năng |
| `assets/images/mai-hac-de/sprites-32bit/` + bản nguồn | Chép `FX_BT_ARMOR_SPARK` cùng ID (mục manifest + ảnh, 2 bản khớp byte) |
| `.claude/rules/mai-hac-de-gameplay.md`, `docs/SUTA_MHD_TASK_00.md` | Tài liệu |

Không sửa engine trong task này (diff engine hiện có là của MHD-L1), không sửa file chương 1–4.

## Kết quả test
Mô phỏng `update(1/60)` trên trang thật, trừ khi ghi khác.

| # | Test | Kết quả |
|---|---|---|
| T1 | Dựng + nền | PASS — ảnh chụp GĐ 1–3: cổng đúng chỗ, chân boss/xe/lính trên đất, không hộp tạm. Console sạch ở lần nạp sạch (xem "Ghi chú") |
| T2 | Loạt tên | PASS — vạch báo 0,80 s; 3 tên từ x 543 y 197 hướng vy .09 / .17 / .24 về điểm khoá; ngoài 340 px không bắn |
| T3 | Khiên | PASS — chém còn khiên: máu 3 → 3, `blocked`, 1 tóe lửa. Hũ trúng trực tiếp và hũ văng lửa đều cháy khiên; cháy 39 frame (0,65 s); sau đó **3 nhát** hạ |
| T4 | Rơi đồ | PASS — có khiên: rơi hũ; đã 2 hũ trên sân: không; hết khiên: không. Bình máu 4000 lần gọi: 24,2 %; boss không rơi |
| T5 | Xe | PASS — báo trước 0,80 s; húc −1 máu; khựng tường 1,82 s; Viện Binh `rescued` 0/1 → 2,98 s, 2/3 → 3,98 s, 4/5 → 4,98 s (đọc sau 1 frame), hồi 14 s |
| T6 | Cần điều khiển | PASS — đứng đất chém 0 nhát; đứng bục 2 nhát 1 lượt, cả 2 hướng xe; hết giờ hất xuống máu 5 → 5; lượt 3 xe `break`, xác nằm lại, hết bục |
| T7 | GĐ 3 | PASS — ngoài `winded` máu không đổi; không buff **12 nhát**, có buff **10 nhát**, máu về đúng 0; lưỡi đao trúng −1 máu; `winded` 84 frame (1,4 s) |
| T8 | Kỹ năng | PASS — K: chặn đòn máu 5 → 5, vỡ, miễn 0,5 s, hồi 12 s từ lúc bật. L: toán chạy về phía xe, dừng chặn ở mũi xe. Ô HUD + 2 nút VỎ/VIỆN đúng |
| T9 | Cutscene | PASS — đủ bước disarm → cốt truyện 1 → phi ngựa → tối/sáng → cờ → cốt truyện 2 → panel. Chữ chép bằng script từ MHD-00 §5.3–5.4. `level3Complete` ghi vào tiến trình |
| T10 | Không phần thưởng | PASS — bot bấm phím thật, không buff/kỹ năng, `rescued` 0: thắng sau **51 s** (GĐ 2 ở 11,9 s, GĐ 3 ở 25,9 s). Bot được giữ máu đầy (trúng 12 đòn) nên chưa nói được độ khó |
| T11 | Hồi quy | PASS — bot 17 trang (5 chương × 3 màn, `?layout=skills`, `?layout=engine`), 1200 frame mỗi trang: 0 exception, 0 cảnh báo. `pytest tests`: 137 passed, 1 skipped. Điện thoại ngang 740×360: nút VỎ/VIỆN 50×50 px, không tràn ngang; 812×375: không tràn |
| T12 | Chơi tay | PASS — người dùng phát hiện vết cắt nền (đã sửa, C3-R1), chơi lại báo "Đã ổn" 08/11; không có thời gian hoàn thành, số `DESIGN_BASELINE` giữ nguyên |

Các số là `DESIGN_BASELINE`.

## Ghi chú
- Trong phiên soát có 1 lỗi console "broken image" ở `drawGroundAutotile` (engine, tile đất chương 1), xuất hiện lúc đổi viewport và tải lại trang dồn dập. Nạp lại sạch: ảnh đủ, 0 lỗi, `draw()` không lỗi. Chưa tái hiện được, chưa sửa.
- Chưa thử trên điện thoại thật; 740×360 là giả lập.

## Vấn đề asset
- `BG_MHD_MID_TONG_BINH_GATE` — **đã sửa (C3-R1, duyệt và chép vào game 08/11)** — ban đầu NEED_REDRAW vùng x 170–300 logic: vết cắt thẳng đứng tại x 225, dài 19,5 px, cao 20,5–40 trên đất (người dùng phát hiện khi chơi thử 08/11; Gate C2 bỏ sót; ảnh chụp T1 của tôi cũng không nêu). Đã soạn vòng sửa C3-R1 ở mục 15 của `CODEX_PROMPT_MHD_ART_03.md`. Quét cả ảnh: đây là vết cắt lớn duy nhất ở vùng tường.

Status: 11 mục `manifest_mhd.json` (7 của `MHD_ART_03`, 3 icon + `FX_MHD_VAN_AN_SHELL` của `MHD_ART_02`) + nền cổng trong `maps_mhd.json` → `IN_GAME` (bản nguồn rồi chép lại, 2 bản khớp byte, chỉ đổi `status`). Prompt `MHD_ART_02`, `MHD_ART_03` đã xoá.

Tóm tắt soát `MHD_ART_03` (các số đo đầy đủ ở `assets/*/mai-hac-de/*_REPORT_MHD_32.md`):
- Gate C1 duyệt nguyên trạng ngoại hình boss, xe, vệ sĩ, trinh sát, dân quân.
- Gate C2 bắt lỗi xe `fire`, `charge` vẽ khác thân `idle` và boss `winded` chỉ gập 2 ô → vòng C2-R1 sửa, PASS.
- Vòng C3-R1 sửa vết cắt nền ở x 225 (Gate C2 bỏ sót), PASS.

## Câu hỏi cho team / TODO
- NPC thứ 2 màn 2 đổi lại thành Thúc Bảo, khớp thư viện (người dùng chốt 08/11). Thoại §5.2 "người dân phu Hoan Châu" — team quyết.

## Bước tiếp
Nhạc chương 5 đã có (08/11). Chương 5 hoàn tất, chờ commit.
