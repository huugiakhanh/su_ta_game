-- BT-REWARD (17/10/2026): thưởng qua màn + thành tựu chương 2 Bà Triệu theo đề xuất
-- docs/SUTA_BT_TASK_00.md mục 9 (người dùng duyệt 17/10). Không sửa 005 (đã chạy).
-- Khớp: ACHIEVEMENT_RULES + CHAPTER_BT_LEVELS (backend/services/game_service.py).
-- Mọi số DESIGN_BASELINE: chương sau thưởng cao hơn chương 1 ~20%.

-- Thưởng qua màn lần đầu: 120 / 180 / 240 vàng + 8 KC (chương 1: 100 / 150 / 200 + 5).
UPDATE levels SET first_clear_gold = 120, first_clear_gems = 0 WHERE id = 201;
UPDATE levels SET first_clear_gold = 180, first_clear_gems = 0 WHERE id = 202;
UPDATE levels SET first_clear_gold = 240, first_clear_gems = 8 WHERE id = 203;

-- TT_FLAWLESS / TT_SCHOLAR giữ chung mọi chương (BT-SKELETON Q3) — không tạo bản BT_ trùng nghĩa.
INSERT INTO achievements (code, name, description, icon, reward_gold, reward_gems, sort_order) VALUES
    ('BT_CLEAR_1', 'Vào núi Nưa',         'Hoàn thành màn 1 chương Bà Triệu.',                       '🌲', 60, 0, 7),
    ('BT_CLEAR_2', 'Tụ nghĩa Bồ Điền',    'Hoàn thành màn 2 chương Bà Triệu.',                       '🤝', 60, 0, 8),
    ('BT_CHAPTER', 'Khởi nghĩa Bà Triệu', 'Hoàn thành chương Bà Triệu.',                             '🐘', 0, 12, 9),
    ('BT_SPEED',   'Cưỡi gió đạp sóng',   'Tổng thời gian tốt nhất 3 màn Bà Triệu dưới 15 phút.',    '⚡', 0, 6, 10);
