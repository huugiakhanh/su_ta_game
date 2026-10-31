-- LND-SKELETON (31/10/2026): chương 3 Lý Nam Đế — danh mục chương, 3 màn + thưởng
-- qua màn lần đầu, 3 phần thưởng màn 2, 4 thành tựu. Số theo docs/SUTA_LND_TASK_00.md
-- §3.4 + mục 9 (người dùng duyệt 31/10/2026), DESIGN_BASELINE (chương sau thưởng cao
-- hơn chương trước ~20%).
-- Khớp: VALID_LEVEL_IDS / VALID_CHAPTER_IDS (backend/routes/api.py), ACHIEVEMENT_RULES
-- + CHAPTER_LND_LEVELS (backend/services/game_service.py), LY_NAM_DE.id = 3 +
-- REWARD_NAMES (frontend/static/js/levels/ly-nam-de/).
-- Không đổi bảng: cleared_level 0–3 vẫn đủ (mỗi chương 3 màn).

INSERT INTO chapters (id, slug, title, sort_order) VALUES
    (3, 'ly-nam-de', 'Lý Nam Đế', 3);

-- Thưởng qua màn lần đầu: 144 / 216 / 288 vàng + 10 KC (chương 2: 120 / 180 / 240 + 8).
INSERT INTO levels (id, chapter_id, level_no, title, first_clear_gold, first_clear_gems) VALUES
    (301, 3, 1, 'Từ quan chiêu binh', 144, 0),
    (302, 3, 2, 'Chiêu mộ hiền tài', 216, 0),
    (303, 3, 3, 'Công phá thành Long Biên', 288, 10);

INSERT INTO rewards (id, chapter_id, name) VALUES
    ('SK_LND_TO_LICH_SHIELD', 3, 'Khiên Tô Lịch'),
    ('BUFF_LND_SUPPLY', 3, 'Lương thảo dồi dào'),
    ('SK_LND_TIDE', 3, 'Triều Cường');

-- TT_FLAWLESS / TT_SCHOLAR giữ chung mọi chương — không tạo bản LND_ trùng nghĩa.
INSERT INTO achievements (code, name, description, icon, reward_gold, reward_gems, sort_order) VALUES
    ('LND_CLEAR_1', 'Từ quan chiêu binh',  'Hoàn thành màn 1 chương Lý Nam Đế.',                      '📜', 72, 0, 11),
    ('LND_CLEAR_2', 'Hội tụ hiền tài',     'Hoàn thành màn 2 chương Lý Nam Đế.',                      '🤝', 72, 0, 12),
    ('LND_CHAPTER', 'Vạn Xuân',            'Hoàn thành chương Lý Nam Đế.',                            '🏯', 0, 14, 13),
    ('LND_SPEED',   'Đoản binh thần tốc',  'Tổng thời gian tốt nhất 3 màn Lý Nam Đế dưới 15 phút.',   '⚡', 0, 7, 14);
