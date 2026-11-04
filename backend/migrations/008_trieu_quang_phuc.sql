-- TQP-SKELETON (04/11/2026): chương 4 Triệu Việt Vương — danh mục chương, 3 màn +
-- thưởng qua màn lần đầu, 3 phần thưởng màn 2, 4 thành tựu. Số theo
-- docs/SUTA_TQP_TASK_00.md §3.4 + mục 9 (người dùng duyệt 04/11/2026), DESIGN_BASELINE
-- (chương sau thưởng cao hơn chương trước ~20%).
-- Khớp: VALID_LEVEL_IDS / VALID_CHAPTER_IDS (backend/routes/api.py), ACHIEVEMENT_RULES
-- + CHAPTER_TQP_LEVELS (backend/services/game_service.py), TRIEU_QUANG_PHUC.id = 4 +
-- REWARD_NAMES (frontend/static/js/levels/trieu-quang-phuc/).
-- Không đổi bảng: cleared_level 0–3 vẫn đủ (mỗi chương 3 màn).

INSERT INTO chapters (id, slug, title, sort_order) VALUES
    (4, 'trieu-quang-phuc', 'Triệu Việt Vương', 4);

-- Thưởng qua màn lần đầu: 173 / 259 / 346 vàng + 12 KC (chương 3: 144 / 216 / 288 + 10).
INSERT INTO levels (id, chapter_id, level_no, title, first_clear_gold, first_clear_gems) VALUES
    (401, 4, 1, 'Tuổi trẻ rèn luyện', 173, 0),
    (402, 4, 2, 'Hiền tài Dạ Trạch', 259, 0),
    (403, 4, 3, 'Đại phá Dương Sàn', 346, 12);

INSERT INTO rewards (id, chapter_id, name) VALUES
    ('BUFF_TQP_VITALITY', 4, 'Thể lực cường tráng'),
    ('SK_TQP_RALLY', 4, 'Hiệu triệu Vạn Xuân'),
    ('SK_TQP_DRAGON_CLAW', 4, 'Móng Rồng');

-- TT_FLAWLESS / TT_SCHOLAR giữ chung mọi chương — không tạo bản TQP_ trùng nghĩa.
INSERT INTO achievements (code, name, description, icon, reward_gold, reward_gems, sort_order) VALUES
    ('TQP_CLEAR_1', 'Rèn chí Chu Diên',    'Hoàn thành màn 1 chương Triệu Việt Vương.',                      '🥋', 86, 0, 15),
    ('TQP_CLEAR_2', 'Dạ Trạch Vương',      'Hoàn thành màn 2 chương Triệu Việt Vương.',                      '🌾', 86, 0, 16),
    ('TQP_CHAPTER', 'Triệu Việt Vương',    'Hoàn thành chương Triệu Việt Vương.',                            '🐉', 0, 17, 17),
    ('TQP_SPEED',   'Xuất quỷ nhập thần',  'Tổng thời gian tốt nhất 3 màn Triệu Việt Vương dưới 15 phút.',   '🛶', 0, 8, 18);
