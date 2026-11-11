-- NQ-ENGINE (11/11/2026, docs/SUTA_NQ_TASK_ENGINE_01.md E5): số cọc đã cắm ở màn 2
-- chương Ngô Quyền (0–6), màn 3 đọc để tính số mảng giáp lâu thuyền bị phá.
-- Chương khác luôn 0. Khớp MAX_STAKES + parse_progress (backend/routes/api.py),
-- progress_repository.py, trường `stakes` của engine/progress.js.

ALTER TABLE chapter_progress ADD COLUMN stakes SMALLINT NOT NULL DEFAULT 0
    CHECK (stakes BETWEEN 0 AND 6);
