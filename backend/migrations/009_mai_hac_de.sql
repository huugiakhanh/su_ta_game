-- MHD-SKELETON (07/11/2026): chương 5 Mai Hắc Đế — danh mục chương, 3 màn + thưởng
-- qua màn lần đầu, 3 phần thưởng màn 2, 4 thành tựu, cột số dân phu cứu được. Số theo
-- docs/SUTA_MHD_TASK_00.md §3.4 + mục 9 (người dùng duyệt 07/11/2026), DESIGN_BASELINE
-- (chương sau thưởng cao hơn chương trước ~20%).
-- Khớp: VALID_LEVEL_IDS / VALID_CHAPTER_IDS / MAX_RESCUED (backend/routes/api.py),
-- ACHIEVEMENT_RULES + CHAPTER_MHD_LEVELS (backend/services/game_service.py),
-- MAI_HAC_DE.id = 5 + REWARD_NAMES (frontend/static/js/levels/mai-hac-de/).

INSERT INTO chapters (id, slug, title, sort_order) VALUES
    (5, 'mai-hac-de', 'Mai Hắc Đế', 5);

-- Thưởng qua màn lần đầu: 208 / 311 / 415 vàng + 14 KC (chương 4: 173 / 259 / 346 + 12).
INSERT INTO levels (id, chapter_id, level_no, title, first_clear_gold, first_clear_gems) VALUES
    (501, 5, 1, 'Gánh vải Hoan Châu', 208, 0),
    (502, 5, 2, 'Dựng cờ Vạn An', 311, 0),
    (503, 5, 3, 'Công phá Tống Bình', 415, 14);

INSERT INTO rewards (id, chapter_id, name) VALUES
    ('BUFF_MHD_POWER', 5, 'Ý chí dân nghèo'),
    ('SK_MHD_VAN_AN_SHELL', 5, 'Vỏ Bọc Vạn An'),
    ('SK_MHD_REINFORCE', 5, 'Viện Binh');

-- TT_FLAWLESS / TT_SCHOLAR giữ chung mọi chương — không tạo bản MHD_ trùng nghĩa.
INSERT INTO achievements (code, name, description, icon, reward_gold, reward_gems, sort_order) VALUES
    ('MHD_CLEAR_1', 'Gánh vải Hoan Châu', 'Hoàn thành màn 1 chương Mai Hắc Đế.',                      '🧺', 103, 0, 19),
    ('MHD_CLEAR_2', 'Dựng cờ Vạn An',     'Hoàn thành màn 2 chương Mai Hắc Đế.',                      '🏴', 103, 0, 20),
    ('MHD_CHAPTER', 'Hắc Đế',             'Hoàn thành chương Mai Hắc Đế.',                            '👑', 0, 20, 21),
    ('MHD_SPEED',   'Thần tốc ra Bắc',    'Tổng thời gian tốt nhất 3 màn Mai Hắc Đế dưới 15 phút.',   '🐎', 0, 10, 22);

-- Số dân phu cứu được ở màn 1 (0–5), dùng ở màn 3. Chương khác luôn 0.
ALTER TABLE chapter_progress ADD COLUMN rescued SMALLINT NOT NULL DEFAULT 0
    CHECK (rescued BETWEEN 0 AND 5);
