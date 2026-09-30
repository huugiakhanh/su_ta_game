# SỬ TA — CHƯƠNG TRƯNG TRẮC
# TASK CARD: MÀN 3 "TRẬN LUY LÂU" — KỸ NĂNG VÀ BOSS TÔ ĐỊNH

TASK_ID: TT-BOSS-01 • Version 1.0 • 26/09/2026
Thư mục code: `frontend/static/js/levels/trung-trac/`

Tài liệu (READ-ONLY):
- `CLAUDE.md`
- `SUTA_TT_SPRITE_BRIEF.md`, `SUTA_TT_MAP_BRIEF.md`
- `docs/REPORT_TT-NPC-01.md`
- `SUTA_TT_BOSS_ASSET_BRIEF.md` (asset bổ sung, Codex vẽ song song)

---

## 0. MỤC TIÊU

Biến màn 3 từ trang giữ chỗ thành màn chơi được: **đấu trường cố định trước cổng Luy Lâu**, boss Tô Định 3 giai đoạn, và cơ chế thật cho 3 phần thưởng nhận ở màn 2.

**Quyết định team (26/09):**
- Giai đoạn 1: phá khiên chiến xa bằng **cả hai cách**: dụ xe đâm cột đá, hoặc chém trả hũ dầu về phía xe.
- Màn 3 là **đấu trường cố định**, không có đoạn đi cảnh.
- **Thua thì chơi lại từ đầu trận boss**, giữ tiến trình và phần thưởng của màn 1–2.

**Ngoài phạm vi:**
- Sửa màn 1, màn 2 (kể cả câu hỏi chunk 8 và dòng cốt truyện chunk 10 của màn 1).
- Lưu tiến trình lên backend, âm thanh, giao diện riêng cho điện thoại.

---

## 1. QUY TẮC

1. Tuân thủ `CLAUDE.md`, đặc biệt mục "Thêm màn trong chương Trưng Trắc": dùng chung bộ module `trung-trac/` và `trung-trac.html`, thêm `LEVELS[3]`, `level3Content()`, sự kiện màn 3 trong `physics.js`, route `/3` truyền `level_id=3`.
2. **Nội dung ở mục 5 là Source of Truth**, chép nguyên văn (có thể thêm vào `dialogue-data.js` hoặc file dữ liệu riêng).
3. Chỉ dùng asset đã có trong `manifest_tt.json` / `maps_tt.json`. Asset trong `SUTA_TT_BOSS_ASSET_BRIEF.md` chưa có thì dùng **fallback ghi ở từng mục**, không chờ, không crash.
4. Mọi con số là DESIGN_BASELINE, đặt trong `config.js` (gợi ý nhóm `ARENA`, `BOSS_TD`, `WAVES`, `SKILLS`, `RUSHER`).
5. Dùng lại code có sẵn khi được:
   - boss Tô Định (hitbox 90×80, nháy mờ khi trúng);
   - cơ chế ném của `thrower`/`patrol`;
   - `updateGuard()`, `playerImmune()`, `attackHits`, `hitTime()`;
   - `openStory()` của `dialogue.js`.
6. Làm 3 phase, mỗi phase: test → report → **dừng chờ người chơi thử duyệt**.

---

## 2. BƯỚC 0 — KẾ HOẠCH (CHỈ ĐỌC)

1. Đọc code boss hiện có, `makeEnemy()`, `updateGuard()`, cơ chế ném/đạn, `playerImmune()`, `startAttack()`/`attackHits`, va chạm vật cản tĩnh, camera, `LEVELS`, `progress.js`, `placeholder.js`, `dialogue.js`.
2. Đối chiếu manifest (tên animation, số ô, `hit_frame`, `loop`) với task card:
   - `BOSS_TO_DINH_CHARIOT`: `idle`, `charge`, `stun`, `throw`, `shield_break`, `idle_cracked`
   - `BOSS_TO_DINH_FOOT`: `idle`, `disarmed`, `flee`
   - `EN_HAN_RUSHER`: `run`, `attack_01`, `death`
   - `PJ_OIL_JAR`, `FX_OIL_FIRE`, `PJ_ARROW_RAIN`
   - `PLAYER_TRUNG_TRAC.victory`
   - `NPC_TRUNG_NHI`: `run`, `idle`, `attack_01`
   - `PROP_STONE_PILLAR` (2 trạng thái trong `maps_tt.json`)

   Ghi mọi chỗ khác với task card.
3. **Quyết định cần team chốt:**
   - **Cột đá chặn đường nhưng không gây sát thương khi va ngang?** Theo luật hiện tại, vật cản thường va ngang là mất máu, nên người chơi sẽ bị trừ máu mỗi lần chạm cột trong lúc né xe. Đề xuất: thêm cờ riêng cho cột đá (ví dụ `blocking`) để chặn/đẩy người chơi ra, không trừ máu, chỉ áp dụng cho cột đá, không đổi luật chung.
   - Quân địch có bị cột đá chặn không. Đề xuất: đi xuyên như hiện tại nếu code chưa xét va chạm vật cản cho địch.
4. Đề xuất cách đặt camera khi `VIEW_W` (480–640) nhỏ hơn đấu trường 768 px.
5. Viết `docs/BOSS_PLAN_TT.md`: OWNED FILES theo phase, sơ đồ máy trạng thái boss, luồng màn 3, quyết định cần chốt, rủi ro.
6. **DỪNG. Chờ duyệt.**

---

## 3. TRIỂN KHAI

### PHASE A — Khung màn 3, phần thưởng, quân cảm tử

**3.1 Đấu trường** (`LEVELS[3]`, `level3Content()`)

| Thành phần | Giá trị (DESIGN_BASELINE) |
|---|---|
| Độ rộng world | 768 px (1 chunk), tường vô hình ở x = 0 và x = 768 |
| Cảnh | vùng Z5: `BG_TT_SKY_STORM`, `BG_TT_MID_CITADEL`, tile Z5 |
| Cổng | `PROP_LUYLAU_GATE`, tâm x = 672, đáy ở `GROUND_Y`, không hitbox, đóng suốt trận |
| Cột đá | `PROP_STONE_PILLAR`, tâm x = 250 và x = 450, hitbox 24×48, đứng lên được; va ngang theo quyết định ở Bước 0 |
| Người chơi | xuất hiện ở x = 60 |
| Camera | theo người chơi, kẹp trong [0, 768 − `VIEW_W`] |
| Không có | sách, hố, hazard của màn 1, NPC |

- Route `/3` render `trung-trac.html` với `level_id=3`, thay trang giữ chỗ. Giữ file `placeholder.js` và template giữ chỗ, chỉ ngừng dùng.
- `requireLevel(3)` giữ nguyên điều kiện.
- Thua: panel thua → "Đánh lại" → chơi lại màn 3 từ đầu, máu đầy, điểm về số mang sang từ màn 2.

**3.2 Phần thưởng**
Chỉ hoạt động khi tiến trình có phần thưởng tương ứng; `?debug=1` có đủ cả 3.

*BUFF_Y_CHI_KIEN_CUONG* (bị động)
- Khi máu còn 1 và **3 s không bị trúng đòn**: hồi 1 máu.
- Hồi chiêu 20 s, tính từ lần hồi trước.

*SK_LE_CHAN_ARROW_RAIN* (phím **K**)
- Hồi chiêu 12 s.
- Vùng mưa rộng 160 px, bắt đầu cách 24 px phía trước người chơi.
- 10 mũi `PJ_ARROW_RAIN` rơi từ mép trên màn hình trong 0,8 s, rải đều có xê dịch nhỏ.
- Mỗi mũi chạm mục tiêu **có máu**: gây sát thương bằng 1 đòn chém rồi biến mất. Chạm đất: biến mất.
- Mỗi lần dùng: mỗi lính nhận tối đa 2 mũi; Tô Định (giai đoạn 3) tối đa 1 mũi.
- **Không** tác dụng lên khiên chiến xa (giai đoạn 1), không chặn hũ dầu hay đạn địch, không ảnh hưởng người chơi.

*SK_TRUNG_NHI_SHADOW* (phím **L**)
- Kéo dài 8 s, hồi chiêu 20 s tính từ lúc hết hiệu lực.
- Vẽ `NPC_TRUNG_NHI` alpha 0,5, ánh xanh chàm, đi sau người chơi 20 px, trễ khoảng 0,15 s theo vệt di chuyển.
- Dùng `run` khi di chuyển (cả khi trên không), `idle` khi đứng yên.
- Khi người chơi chém, bóng phát `attack_01` cùng lúc. Tại `hit_frame` 3 của bóng, xét một hitbox bằng hitbox giáo của người chơi (lật theo hướng); mỗi mục tiêu trúng nhận thêm 1 đòn, tối đa 1 lần mỗi cú.
- **Không** phản hũ dầu (chỉ đòn của người chơi phản được), không có hurtbox, không va chạm.

*HUD và điều khiển*
- Ô kỹ năng dùng chân dung `PORTRAIT_LE_CHAN` / `PORTRAIT_TRUNG_NHI` (CSS `pixelated`), lớp phủ đếm ngược hồi chiêu, nhãn phím K/L.
- Ô buff dùng `PORTRAIT_THI_SACH` nhỏ, có vòng hồi chiêu.
- Chỉ hiện phần thưởng người chơi đã có.
- Thêm 2 nút cảm ứng `data-control` cạnh nút đánh.
- Nếu 3 ô này quá chật ở chiều rộng 480, đề xuất cách bố trí trong report; không làm lại HUD.

**3.3 Quân cảm tử** `EN_HAN_RUSHER`
Animation có sẵn: `run` (lặp), `attack_01` (hit 2), `death`. Không có `idle`/`hurt`.
- 1 máu, hitbox 22×40.
- Chạy về phía người chơi 90 px/s; cách ≤ 12 px thì phát `attack_01`, gây sát thương ở ô 2; nghỉ 1,0 s rồi chạy tiếp.
- Chạm tường đấu trường thì quay đầu. Dash né được.

**3.4 Layout thử** `?layout=skills` (chỉ màn 3, chỉ để test)
Đấu trường không có boss; sinh lần lượt 2 lính canh, 3 quân cảm tử, và 1 "bao cát" đứng yên 99 máu để đo sát thương.

**Test A:**
- Vào màn 3 được từ màn 2 và bằng `?debug=1`.
- Hiển thị đủ cảnh Z5, cổng, 2 cột đá; đứng lên được cột.
- Camera kẹp đúng ở chiều rộng 480 và 640 px.
- Thua → "Đánh lại" → máu đầy, điểm đúng.
- K/L/buff chỉ hoạt động khi có phần thưởng.
- Mưa tên hạ được quân cảm tử và lính canh trong vùng; bao cát mất tối đa 2 đòn mỗi lần.
- Có bóng Trưng Nhị: lính canh 2 máu chết sau 1 cú chém (không có bóng: 2 cú).
- Buff: xuống 1 máu, né 3 s → hồi 1 máu; hồi chiêu 20 s.
- HUD hồi chiêu đúng giây.
- Hồi quy: chơi màn 1 → 2 → 3 một lượt, không lỗi console.

### PHASE B — Giai đoạn 1 và 2

**3.5 Giai đoạn 1 — Chiến xa bọc khiên** (`BOSS_TO_DINH_CHARIOT`, hitbox 90×80)

Khiên có **3 nấc**. Đòn chém trực tiếp của người chơi và của bóng Trưng Nhị **không** làm mất nấc: xe vẫn nháy mờ, và hiện thông báo gợi ý ở mục 5.2 (tối đa 1 lần mỗi 5 s).

Xe bắt đầu ở x = 600, quay về phía người chơi. Vòng hành vi lặp lại:

| Bước | Hành vi (DESIGN_BASELINE) |
|---|---|
| Ném | 2 lần, cách nhau 1,6 s. Mỗi lần phát `throw`, sinh `PJ_OIL_JAR` tại `hit_frame` 4. Hũ bay **vòng cung**, rơi đúng vị trí ngang của người chơi tại thời điểm ném, sau 0,9 s |
| Báo trước | đứng yên 0,8 s, phát `idle` (hoặc `idle_cracked`), rung ngang 1 px (vẽ bằng code) |
| Lao | phát `charge`, chạy 220 px/s về phía người chơi, tới khi chạm cột đá hoặc tường |
| Đâm cột đá | dừng ở mép cột, mất 1 nấc khiên. Cột nguyên → nứt; cột đang nứt → mờ dần 0,3 s rồi biến mất (bỏ va chạm). Xe phát `stun` 2,5 s |
| Đâm tường | không mất khiên, đứng 0,5 s rồi quay đầu |

**Va chạm với xe:**
- Chạm thân xe: mất 1 máu. Dash xuyên được (`playerImmune()`).
- Xe cao 80 px nên **không nhảy qua được**. Cách né: dash, hoặc đứng sau/trên cột đá.
- Khi xe dừng ở mép cột, người chơi đứng trên hoặc sau cột **không** được tính là va chạm (xử lý phần chồng hitbox 1 px nếu có).

**Hũ dầu:**
- Chạm đất hoặc chạm người chơi: phát `FX_OIL_FIRE` tại chỗ. Vùng lửa rộng 32 px, tồn tại 0,6 s, gây 1 sát thương (mỗi đám lửa trúng người chơi tối đa 1 lần).
- Đòn chém của người chơi trúng hũ đang bay: hũ **bị phản ngược**, bay thẳng về phía xe 260 px/s.
  - Trúng xe: mất 1 nấc khiên, phát `FX_OIL_FIRE` ở thân xe, không gây `stun`.
  - Không trúng: bay ra khỏi đấu trường.

**Chuyển trạng thái:**
- Còn 1 nấc khiên: dùng `idle_cracked` thay `idle` (không có thì dùng `idle`).
- Hết khiên: phát `shield_break` một lần. Xe hỏng nằm lại ở ô cuối như vật trang trí, không va chạm. Hiện thông báo mục 5.2 → sang giai đoạn 2.
- HUD: thanh khiên 3 nấc.

**3.6 Giai đoạn 2 — Thân binh**
- Tô Định (`BOSS_TO_DINH_FOOT` `idle`) đứng sau xe hỏng tại x = 640, **không có hitbox** (không đánh được).
- 3 đợt quân xuất hiện từ cổng (x = 700). Đợt sau bắt đầu khi đợt trước chết hết + 1,5 s:

| Đợt | Quân |
|---|---|
| 1 | 2 lính canh `EN_HAN_GUARD` |
| 2 | 3 quân cảm tử, ra cách nhau 0,6 s |
| 3 | 2 lính canh + 2 quân cảm tử |

- Lính canh trong đấu trường **truy đuổi khắp đấu trường**: đặt đoạn tuần tra [40, 728] và dùng lại `updateGuard()` với tham số, không viết AI mới.
- HUD hiện "Đợt N/3".
- Hết đợt 3: thông báo mục 5.2 → sang giai đoạn 3.

**Test B:**
- Phá hết khiên chỉ bằng cột đá: đứng sau hoặc trên cột → xe đâm, `stun`, cột nứt rồi vỡ.
- Phá hết khiên chỉ bằng hũ dầu: chém trúng hũ → phản → trúng xe → mất nấc.
- Kết hợp cả hai cách. Chém trực tiếp không làm mất khiên.
- Cả 2 cột đã vỡ vẫn phá được khiên bằng hũ dầu (trận không bị kẹt).
- Mỗi đám lửa gây đúng 1 sát thương; dash xuyên được xe.
- 3 đợt quân đúng thành phần; lính canh đuổi khắp đấu trường; kỹ năng dọn được quân.
- Thua ở giai đoạn 2 → chơi lại từ đầu giai đoạn 1.
- Không lỗi console.

### PHASE C — Giai đoạn 3, kết chương, mưa tên trên thành

**3.7 Giai đoạn 3 — Đánh văng kiếm**
- Tô Định đi bộ (`BOSS_TO_DINH_FOOT`), hitbox 22×40, 3 máu. Không tấn công, run rẩy tại chỗ (`idle`).
- Trúng đòn: nháy mờ (hoặc phát `hurt` nếu Codex đã bổ sung), bị đẩy lùi 16 px về phía cổng, không vượt quá x = 740.
- Cứ 4 s có 1 quân cảm tử ra từ cổng, tối đa 2 con cùng lúc.
- Hết máu: dừng mọi quân địch và đạn, phát `disarmed` một lần → cutscene.

**3.8 Cutscene và kết chương** (người chơi mất quyền điều khiển)
1. Màn hình tối dần trong 0,4 s. Panel cốt truyện dùng `PORTRAIT_TO_DINH`, hiện câu 1–2 ở mục 5.3.
2. Sáng lại: Tô Định **đã cải trang** phát `flee`, chạy sang trái ra khỏi màn hình.
3. Trưng Trắc tự đi tới trước cổng. Cổng đổi sang `PROP_LUYLAU_GATE_OPEN`; nhân vật phát `victory` một lần.
4. Cờ trên cổng: `PROP_TT_VICTORY_FLAG` (lặp) đặt tại điểm `flag_attach` của cổng (xem `SUTA_TT_BOSS_ASSET_BRIEF.md`). Chưa có asset thì bỏ bước này, ghi `TODO_MISSING`.
5. Panel cốt truyện dùng `PORTRAIT_TRUNG_TRAC`, hiện câu 3–4 ở mục 5.3.
6. Panel "Hoàn thành chương Trưng Trắc" + điểm (mục 5.4). Lưu `level3Complete: true`. Có hai nút:
   - "Chơi lại chương": xoá tiến trình, về màn 1;
   - "Về trang chủ".

**3.9 Mưa tên trên thành**
Áp lực nền trong cả 3 giai đoạn. Bật/tắt bằng hằng `ARENA.wallArrows`.
- Mỗi 3,5 s: 2 mũi `PJ_ARROW_RAIN` nhắm vào vị trí ngẫu nhiên trong phạm vi ±120 px quanh người chơi.
- Trước khi tên rơi 0,6 s: hiện vạch báo trên mặt đất (vẽ bằng code).
- Trúng người chơi: mất 1 máu. Dash né được. Không trúng quân ta hay quân địch.
- Tạm ngưng trong cutscene và 2 s đầu mỗi giai đoạn.

**Test C:**
- Giai đoạn 3: 3 đòn → `disarmed` → cutscene đủ 6 bước, không điều khiển được trong cutscene.
- Có bóng Trưng Nhị: 2 cú chém là xong. Mưa tên của Lê Chân gây tối đa 1 đòn lên Tô Định mỗi lần.
- Text hiển thị khớp mục 5 từng chữ.
- Tiến trình lưu `level3Complete`. "Chơi lại chương" xoá tiến trình.
- Mưa tên trên thành có vạch báo, dash né được, tắt được bằng hằng số.
- Hồi quy: chơi màn 1 → 2 → 3 → hết chương 2 lượt (một lượt có dùng kỹ năng, một lượt không), không lỗi console.

---

## 4. GATE MỖI PHASE

1. Liệt kê file đã sửa + mục đích.
2. Chạy test của phase, ghi PASS/FAIL. Test bằng mô phỏng thì ghi rõ "mô phỏng — cần người chơi thử thật".
3. Không sửa ngoài OWNED FILES đã duyệt; text khớp mục 5.
4. Có FAIL → `BLOCKED` + lý do.
5. PASS → **dừng chờ người chơi thử duyệt**.
6. Sau Phase C:
   - Đổi `status` = `IN_GAME` cho các asset mới dùng.
   - Cập nhật `CLAUDE.md`: màn 3, boss 3 giai đoạn, buff/kỹ năng, quân cảm tử, đấu trường, kết chương, điều khiển K/L. Bỏ mô tả "trang giữ chỗ màn 3" và gỡ các asset đã dùng khỏi danh sách "chưa dùng".

---

## 5. NỘI DUNG MÀN 3 (SOURCE OF TRUTH — CHÉP NGUYÊN VĂN)

### 5.1 Giới thiệu
- Tiêu đề: "Màn 3: Trận Luy Lâu"
- Thông báo đầu màn: "Tô Định núp sau chiến xa bọc khiên. Hãy dụ xe đâm vào cột đá, hoặc chém trả hũ dầu!"

### 5.2 Thông báo trong trận
- Chém trực tiếp vào xe khi còn khiên: "Khiên quá dày! Hãy dùng cột đá hoặc hũ dầu."
- Khiên vỡ: "Khiên chiến xa đã vỡ! Thân binh của Thái thú xông ra."
- Vào giai đoạn 3: "Tô Định không còn chỗ nấp!"

### 5.3 Cutscene kết chương
1. "Bị đánh văng kiếm, Tô Định hoảng sợ bỏ chạy."
2. "Sử cũ chép rằng hắn cắt tóc, cạo râu, trà trộn vào đám đông trốn về Nam Hải."
3. "Nghĩa quân làm chủ thành Luy Lâu. Theo sử cũ, nghĩa quân đã lấy được 65 thành."
4. "Trưng Trắc được tôn làm vua, đóng đô ở Mê Linh."

### 5.4 Panel kết chương
- Tiêu đề: "Hoàn thành chương Trưng Trắc"
- Dòng phụ: "Bạn đã cùng Hai Bà Trưng giành lại non sông và đạt N điểm."

---

## 6. BÁO CÁO `docs/REPORT_TT-BOSS-01.md`

```
## Phase <A|B|C> — <ngày>
### File đã sửa (file | mục đích)
### Hằng số mới (tên | giá trị | DESIGN_BASELINE)
### Kết quả test (test | PASS/FAIL | mô phỏng/thật | ghi chú)
### Cảm nhận độ khó (thời gian hạ boss, số máu mất trung bình mỗi giai đoạn)
### Vấn đề asset
### Câu hỏi cho team
```
