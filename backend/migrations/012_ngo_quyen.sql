-- NQ-SKELETON (11/11/2026): chương 7 Ngô Quyền — danh mục chương, 3 màn + thưởng
-- qua màn lần đầu, 3 phần thưởng màn 2, 4 thành tựu. Số theo docs/SUTA_NQ_TASK_00.md
-- §3.4 + mục 8 (người dùng duyệt 11/11/2026), DESIGN_BASELINE (chương sau thưởng
-- cao hơn chương trước ~20%).
-- Khớp: VALID_LEVEL_IDS / VALID_CHAPTER_IDS (backend/routes/api.py),
-- ACHIEVEMENT_RULES + CHAPTER_NQ_LEVELS (backend/services/game_service.py),
-- NGO_QUYEN.id = 7 + REWARD_NAMES (frontend/static/js/levels/ngo-quyen/).

INSERT INTO chapters (id, slug, title, sort_order) VALUES
    (7, 'ngo-quyen', 'Ngô Quyền', 7);

-- Thưởng qua màn lần đầu: 300 / 448 / 598 vàng + 19 KC (chương 6: 250 / 373 / 498 + 16).
INSERT INTO levels (id, chapter_id, level_no, title, first_clear_gold, first_clear_gems) VALUES
    (701, 7, 1, 'Hành quân ra Bắc', 300, 0),
    (702, 7, 2, 'Trận địa cọc ngầm', 448, 0),
    (703, 7, 3, 'Đại thắng Bạch Đằng', 598, 19);

INSERT INTO rewards (id, chapter_id, name) VALUES
    ('BUFF_NQ_SWIFT', 7, 'Thần Tốc Hành Quân'),
    ('SK_NQ_IRON_STAKE', 7, 'Cọc Sắt Bạch Đằng'),
    ('SK_NQ_DECOY_BOAT', 7, 'Thuyền Nhẹ Khiêu Chiến');

-- TT_FLAWLESS / TT_SCHOLAR giữ chung mọi chương — không tạo bản NQ_ trùng nghĩa.
INSERT INTO achievements (code, name, description, icon, reward_gold, reward_gems, sort_order) VALUES
    ('NQ_CLEAR_1', 'Hành quân ra Bắc',    'Hoàn thành màn 1 chương Ngô Quyền.',                     '🛶', 149, 0, 27),
    ('NQ_CLEAR_2', 'Trận địa cọc ngầm',   'Hoàn thành màn 2 chương Ngô Quyền.',                     '🔨', 149, 0, 28),
    ('NQ_CHAPTER', 'Bạch Đằng 938',       'Hoàn thành chương Ngô Quyền.',                           '👑', 0, 24, 29),
    ('NQ_SPEED',   'Nước triều thần tốc', 'Tổng thời gian tốt nhất 3 màn Ngô Quyền dưới 15 phút.',  '🌊', 0, 12, 30);
