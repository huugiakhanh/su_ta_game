-- MHD-DECISIONS (07/11/2026): đổi tên màn 1 chương Mai Hắc Đế từ "Gánh vải Hoan Châu"
-- sang "Gánh cống Hoan Châu" — chuyện cống vải chưa có bằng chứng tin cậy
-- (docs/RESEARCH_MHD_QUESTIONS.md mục 2, người dùng chốt 07/11/2026).
-- Khớp: chapter.js + pages.py (frontend/static/js/levels/mai-hac-de/, backend/routes/).

UPDATE levels SET title = 'Gánh cống Hoan Châu' WHERE id = 501;
UPDATE achievements SET name = 'Gánh cống Hoan Châu' WHERE code = 'MHD_CLEAR_1';
