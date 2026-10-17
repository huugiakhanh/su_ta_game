-- BT-SKELETON (16/10/2026): chương 2 Bà Triệu — danh mục chương, 3 màn, 3 phần
-- thưởng màn 2. Khớp: VALID_LEVEL_IDS / VALID_CHAPTER_IDS (backend/routes/api.py),
-- BA_TRIEU.id = 2 + REWARD_NAMES (frontend/static/js/levels/ba-trieu/).
-- Không đổi bảng: cleared_level 0–3 vẫn đủ (mỗi chương 3 màn).
-- Thành tựu BT_* chưa thêm — chờ team.

INSERT INTO chapters (id, slug, title, sort_order) VALUES
    (2, 'ba-trieu', 'Bà Triệu', 2);

-- Thưởng qua màn lần đầu: DESIGN_BASELINE = bằng chương 1, chờ team chốt.
INSERT INTO levels (id, chapter_id, level_no, title, first_clear_gold, first_clear_gems) VALUES
    (201, 2, 1, 'Rừng núi Nưa', 100, 0),
    (202, 2, 2, 'Chiêu mộ hiền tài', 150, 0),
    (203, 2, 3, 'Chiến lũy Bồ Điền', 200, 5);

-- Id theo docs/SUTA_BT_TASK_00.md §3.4; đổi tên sau bằng migration mới.
INSERT INTO rewards (id, chapter_id, name) VALUES
    ('BUFF_BT_CRIT', 2, 'Chí mạng'),
    ('SK_BT_RATTAN_SHIELD', 2, 'Khiên mây tre'),
    ('SK_BT_WHITE_ELEPHANT', 2, 'Gọi Bạch Tượng');
