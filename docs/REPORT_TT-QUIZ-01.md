# REPORT TT-QUIZ-01 — Bộ câu hỏi chương Trưng Trắc (màn 1–2) + màn 2 dài 9 chunk

Ngày: 29/09/2026 · Người làm: Claude · Trạng thái: **DONE** (còn chơi thử tay — xem mục 5)

## 1. Nguồn dữ liệu & quyết định team

- Nguồn: `DATA các nhân vật.xlsx`, sheet **"1 Trưng trắc"** (50 câu, cột STT / Câu hỏi / Đáp án A–D /
  Đáp án đúng / Giải thích ngắn gọn). Chép nguyên văn bằng script vào
  `frontend/static/js/levels/trung-trac/questions-data.js` (không gõ tay).
- Team duyệt (29/09):
  - Màn 1: **4 câu ngẫu nhiên** mỗi lượt, bộ thời kỳ trước/trong khởi nghĩa.
  - Trả lời sai: **−1 máu, hiện đáp án + giải thích, đi tiếp** (đúng +500).
  - Màn 2: **1 câu ngẫu nhiên/NPC, chặn đường** trước khi gặp NPC.
  - Màn 2: **9 chunk**.

### Phân loại câu (theo STT)

| Nhóm | STT |
|---|---|
| Màn 1 (22 câu) | 2, 3, 6, 7, 10, 11, 12, 18, 23, 24, 26, 29, 30, 31, 32, 35, 36, 43, 44, 45, 46, 50 |
| Trước Thi Sách | 4, 5, 27, 39 |
| Trước Lê Chân | 14 |
| Trước Trưng Nhị | 1, 8, 9 |
| Không dùng — sau chương (Mã Viện, Lãng Bạc, năm 43, hậu thế) | 15, 16, 17, 19, 20, 21, 22, 25, 28, 33, 34, 37, 38, 40, 42, 48, 49 |
| Không dùng — sau chiến thắng | 13, 47 |
| Không dùng — chờ team | 41 |

## 2. Vấn đề nội dung cần team xem (không tự sửa)

1. **Câu 41** (ngày kỷ niệm): 4 đáp án lưu dạng số ngày Excel (46089 / 46315 / 46143 / 46267 = 8/3, 20/10,
   1/5, 2/9). Câu hỏi gắn ngày 8/3 (Quốc tế Phụ nữ) với "ngày lễ kỷ niệm Khởi nghĩa Hai Bà Trưng" — đáng ngờ.
   Đang **loại**; team sửa file (đáp án dạng chữ + xác nhận nội dung) thì thêm lại.
2. **Câu 11**: giải thích ghi Tô Định trốn "về Nam Hải"; phần mô tả boss trong cùng sheet ghi "chạy trốn về
   Bắc". Giữ nguyên văn cả hai.
3. Lê Chân chỉ có **1 câu** liên quan (14) nên câu hỏi trước Lê Chân luôn giống nhau.

## 3. File đã sửa / tạo

| File | Mục đích |
|---|---|
| `questions-data.js` (mới) | `QUESTIONS` (30 câu đang dùng), `LEVEL1_QUESTION_POOL`, `NPC_QUESTION_POOLS` |
| `dialogue.js` | `openQuiz(question, { title })`: 4 đáp án xáo, kết quả kèm đáp án đúng + giải thích |
| `dialogue-data.js` | bỏ `LEVEL1_QUESTION` (câu "năm 40" hard-code — thay bằng câu 6 trong bộ) |
| `config.js` | `QUIZ` (điểm, số câu màn 1, mốc câu hỏi); màn 2 `LEVEL2_CHUNKS` = 9, `LEVEL2_ZONES` |
| `state.js` | `makeQuiz()`, `level1Quizzes()`, `state.quizzes`; `level2Content()` bố cục 9 chunk |
| `physics.js` | `updateQuizzes()` dùng chung màn 1–2; bỏ câu hỏi chunk 8 khỏi `updateLevel1Events()`; cốt truyện Thi Sách hiện khi vào chunk kế sau Thi Sách |
| `CLAUDE.md` | cập nhật mô tả module, câu hỏi, màn 2 |

(Tất cả file JS ở `frontend/static/js/levels/trung-trac/`.)

## 4. Bố cục màn 2 mới (DESIGN_BASELINE, thay bảng trong REPORT_TT-L2-HARD)

| Chunk | Vùng | Nội dung |
|---|---|---|
| 1 | Z1 làng | `fenceLow` 150 · hố chông 300 · lính canh 560 |
| 2 | Z1 làng | lính thu thuế 300 · xe cống 738 · **câu hỏi về Thi Sách** 600 |
| 3 | Z2 đồng lúa | `reedCurtain` 200 · **Thi Sách** 560 + 2 lính vây |
| 4 | Z3 rừng | cốt truyện Thi Sách hy sinh · hổ 732 · `fenceHigh` 200 · hố hở 400 (64px) · `slideBar` 560 |
| 5 | Z3 rừng | hố chông 150 · lính canh 300 · `bambooSlope` 450 · **câu hỏi về Lê Chân** 600 |
| 6 | Z4 bến sông | `logDrift` 120 · `stoneBlock` 380 · **Lê Chân** 560 + 2 lính vây |
| 7 | Z4 bến sông | hố 160 (96px) + `bridge` · `fallenBranch` 330 · tháp canh 520 + lính gác 574 + kỵ binh 780 |
| 8 | Z4 bến sông | lính thu thuế 180 · lính canh 330 · **câu hỏi về Trưng Nhị** 600 |
| 9 | Z4 bến sông | `fallenBranch` 200 · **Trưng Nhị** 560 + 2 lính vây · về đích 672 |

Màn 1: câu hỏi ở chunk 3 (312), 5 (312), 8 (312), 10 (560).

## 5. Kết quả test (trình duyệt, `?debug=1`)

| # | Test | Kết quả |
|---|---|---|
| 1 | Màn 1: 4 mốc câu hỏi đúng chunk 3/5/8/10, mỗi câu 4 đáp án, tiêu đề "Câu hỏi lịch sử" | PASS |
| 2 | Chọn bằng phím số; đúng +500 / sai −1 máu; nhãn kết quả hiện đáp án đúng khi sai | PASS |
| 3 | Giải thích hiện đúng nguyên văn dữ liệu | PASS |
| 4 | 200 lượt tạo màn 1: không lượt nào trùng câu, không câu ngoài bộ màn 1, đủ cả 22 câu xuất hiện | PASS |
| 5 | Màn 2: 9 chunk, về đích 6816, không cảnh báo khoảng cách NPC / cầu, không lỗi console | PASS |
| 6 | Màn 2: câu hỏi "Câu hỏi về <NPC>" hiện trước mỗi NPC, câu thuộc đúng bộ của NPC | PASS |
| 7 | Giải cứu + gặp 3 NPC → cốt truyện Thi Sách khi sang chunk 4 → về đích, "Sang Màn 3" | PASS |
| 8 | Chunk 4: nhảy hố + lướt thanh trượt không mất máu; đi vào hố thì rơi, −1 máu, hồi sinh an toàn | PASS |
| 9 | Chunk 7: đi qua cầu không rơi | PASS |
| 10 | Màn 3 không có câu hỏi, chạy bình thường | PASS |
| 11 | **Chơi thử tay cả màn 1 và 2** (không bất tử, không dịch chuyển) | **CHƯA LÀM** |

Test chạy bằng script bước vòng lặp mô phỏng; một số test cho người chơi bất tử để tách riêng cơ chế.

## 6. Vấn đề asset

Không có asset mới trong đợt đầu. **Bổ sung 29/09:** bia đá đánh dấu mốc `PROP_TT_QUIZ_STELE` (Codex,
prompt `docs/CODEX_PROMPT_PROP_TT_QUIZ_STELE.md`) đã tích hợp — `config.js` (`MAP_PROPS_IN_GAME`,
`QUIZ_STELE_ID`), `assets.js` (nạp `state_files`), `render.js` (`drawQuizSteles()`). Test: nạp đủ 2 ảnh
(128×48, 32×48), bia `active` đổi ô theo thời gian và lặp đúng chu kỳ (ô 2 = ô 4 là nhịp "thở" trong
asset), sau khi hỏi chuyển sang `done` đứng yên — PASS; hiện đúng ở màn 1 (Z1) và màn 2 (Z3), không lỗi
console. Team duyệt 29/09 → `status: IN_GAME` ở cả 2 bản `maps_tt.json`.

## 7. TODO

- Team xử lý câu 41 (mục 2.1).
- Chơi thử tay (test 11) — độ dài màn 2 tăng từ 6 lên 9 chunk, kèm 3 câu hỏi + 3 hội thoại + cốt truyện.
