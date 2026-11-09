-- PH-SKELETON (09/11/2026): chương 6 Phùng Hưng — danh mục chương, 3 màn + thưởng
-- qua màn lần đầu, 3 phần thưởng màn 2, 4 thành tựu. Số theo docs/SUTA_PH_TASK_00.md
-- §3.4 + mục 8 (người dùng duyệt 09/11/2026), DESIGN_BASELINE (chương sau thưởng
-- cao hơn chương trước ~20%).
-- Khớp: VALID_LEVEL_IDS / VALID_CHAPTER_IDS (backend/routes/api.py),
-- ACHIEVEMENT_RULES + CHAPTER_PH_LEVELS (backend/services/game_service.py),
-- PHUNG_HUNG.id = 6 + REWARD_NAMES (frontend/static/js/levels/phung-hung/).

INSERT INTO chapters (id, slug, title, sort_order) VALUES
    (6, 'phung-hung', 'Phùng Hưng', 6);

-- Thưởng qua màn lần đầu: 250 / 373 / 498 vàng + 16 KC (chương 5: 208 / 311 / 415 + 14).
INSERT INTO levels (id, chapter_id, level_no, title, first_clear_gold, first_clear_gems) VALUES
    (601, 6, 1, 'Trai tráng Đường Lâm', 250, 0),
    (602, 6, 2, 'Tụ nghĩa chiêu hiền', 373, 0),
    (603, 6, 3, 'Vây phủ Tống Bình', 498, 16);

INSERT INTO rewards (id, chapter_id, name) VALUES
    ('BUFF_PH_POWER', 6, 'Sức Địch Ngàn Người'),
    ('SK_PH_SUPPLY_CUT', 6, 'Khóa Lương'),
    ('SK_PH_FIRE_DRUM', 6, 'Hỏa Trận Trống Đồng');

-- TT_FLAWLESS / TT_SCHOLAR giữ chung mọi chương — không tạo bản PH_ trùng nghĩa.
INSERT INTO achievements (code, name, description, icon, reward_gold, reward_gems, sort_order) VALUES
    ('PH_CLEAR_1', 'Trai tráng Đường Lâm', 'Hoàn thành màn 1 chương Phùng Hưng.',                     '🐅', 124, 0, 23),
    ('PH_CLEAR_2', 'Tụ nghĩa chiêu hiền',  'Hoàn thành màn 2 chương Phùng Hưng.',                     '🤝', 124, 0, 24),
    ('PH_CHAPTER', 'Bố Cái Đại Vương',     'Hoàn thành chương Phùng Hưng.',                           '👑', 0, 20, 25),
    ('PH_SPEED',   'Thần tốc vây thành',   'Tổng thời gian tốt nhất 3 màn Phùng Hưng dưới 15 phút.',  '🥁', 0, 10, 26);
