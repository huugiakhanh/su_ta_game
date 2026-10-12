-- SUTA-QUIZ-LB (12/10/2026): kết quả các lượt trắc nghiệm ở trang /quiz, dùng cho
-- tab "Quiz" của bảng xếp hạng. Xếp hạng: tổng câu đúng giảm dần, hoà thì tổng
-- thời gian trả lời tăng dần (backend/repositories/quiz_repository.py).
-- Quiz không thưởng vàng/kim cương.
CREATE TABLE quiz_results (
    id              BIGSERIAL    PRIMARY KEY,
    user_id         BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_count  INTEGER      NOT NULL CHECK (question_count > 0),
    correct_count   INTEGER      NOT NULL CHECK (correct_count >= 0 AND correct_count <= question_count),
    time_seconds    NUMERIC(8,2) NOT NULL CHECK (time_seconds > 0),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX quiz_results_user_idx ON quiz_results (user_id);
