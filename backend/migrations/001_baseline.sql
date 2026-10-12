-- SUTA-DB-01: schema baseline. Dữ liệu cũ chỉ là dữ liệu thử (D5) -> drop bảng
-- cũ (users plaintext, level_records theo username) rồi tạo lại.
DROP TABLE IF EXISTS level_records, users CASCADE;

-- ---- Danh mục (seed bên dưới — Source of Truth cho id) ----

CREATE TABLE chapters (
    id          SMALLINT PRIMARY KEY,
    slug        VARCHAR(50)  NOT NULL UNIQUE,
    title       VARCHAR(100) NOT NULL,
    sort_order  SMALLINT     NOT NULL
);

-- id = 100 × chương + màn (khớp submitLevelRecord ở progress.js).
CREATE TABLE levels (
    id                INTEGER PRIMARY KEY,
    chapter_id        SMALLINT     NOT NULL REFERENCES chapters(id),
    level_no          SMALLINT     NOT NULL,
    title             VARCHAR(100) NOT NULL,
    first_clear_gold  INTEGER      NOT NULL DEFAULT 0 CHECK (first_clear_gold >= 0),
    first_clear_gems  INTEGER      NOT NULL DEFAULT 0 CHECK (first_clear_gems >= 0),
    UNIQUE (chapter_id, level_no),
    CHECK (id = chapter_id * 100 + level_no)
);

-- Phần thưởng NPC trong chương (id khớp REWARD_NAMES ở progress.js).
CREATE TABLE rewards (
    id          VARCHAR(50)  PRIMARY KEY,
    chapter_id  SMALLINT     NOT NULL REFERENCES chapters(id),
    name        VARCHAR(100) NOT NULL
);

CREATE TABLE achievements (
    code         VARCHAR(50)  PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    description  VARCHAR(255) NOT NULL,
    icon         VARCHAR(20)  NOT NULL DEFAULT '🏆',
    reward_gold  INTEGER      NOT NULL DEFAULT 0 CHECK (reward_gold >= 0),
    reward_gems  INTEGER      NOT NULL DEFAULT 0 CHECK (reward_gems >= 0),
    sort_order   SMALLINT     NOT NULL,
    hidden       BOOLEAN      NOT NULL DEFAULT FALSE
);

-- ---- Người chơi ----

CREATE TABLE users (
    id             BIGSERIAL    PRIMARY KEY,
    username       VARCHAR(50)  NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    display_name   VARCHAR(100) NOT NULL,
    gold           INTEGER      NOT NULL DEFAULT 0 CHECK (gold >= 0),
    gems           INTEGER      NOT NULL DEFAULT 0 CHECK (gems >= 0),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    last_login_at  TIMESTAMPTZ
);

-- Ánh xạ 1-1 object `progress` của progress.js: levelNComplete <=> cleared_level >= N.
CREATE TABLE chapter_progress (
    user_id        BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chapter_id     SMALLINT    NOT NULL REFERENCES chapters(id),
    score          INTEGER     NOT NULL DEFAULT 0 CHECK (score >= 0),
    books          SMALLINT    NOT NULL DEFAULT 0 CHECK (books >= 0),
    cleared_level  SMALLINT    NOT NULL DEFAULT 0 CHECK (cleared_level BETWEEN 0 AND 3),
    times          JSONB       NOT NULL DEFAULT '{}'::jsonb,
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, chapter_id)
);

CREATE TABLE chapter_progress_rewards (
    user_id      BIGINT      NOT NULL,
    chapter_id   SMALLINT    NOT NULL,
    reward_id    VARCHAR(50) NOT NULL REFERENCES rewards(id),
    obtained_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, chapter_id, reward_id),
    FOREIGN KEY (user_id, chapter_id) REFERENCES chapter_progress(user_id, chapter_id) ON DELETE CASCADE
);

-- Mọi lượt qua màn (lịch sử). Thời gian/điểm/stats do trình duyệt đo — chưa chống gian lận.
CREATE TABLE level_records (
    id                  BIGSERIAL    PRIMARY KEY,
    user_id             BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level_id            INTEGER      NOT NULL REFERENCES levels(id),
    clear_time_seconds  NUMERIC(8,2) NOT NULL CHECK (clear_time_seconds > 0),
    score               INTEGER      NOT NULL DEFAULT 0 CHECK (score >= 0),
    stats               JSONB,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX level_records_level_time_idx ON level_records (level_id, clear_time_seconds);
CREATE INDEX level_records_user_level_idx ON level_records (user_id, level_id);

-- Thành tích tốt nhất mỗi người/màn — cập nhật cùng transaction với level_records.
CREATE TABLE user_level_stats (
    user_id           BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level_id          INTEGER      NOT NULL REFERENCES levels(id),
    best_time         NUMERIC(8,2) NOT NULL,
    best_score        INTEGER      NOT NULL,
    clear_count       INTEGER      NOT NULL DEFAULT 1,
    first_cleared_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, level_id)
);
CREATE INDEX user_level_stats_level_idx ON user_level_stats (level_id, best_score DESC, best_time);

CREATE TABLE user_achievements (
    user_id           BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_code  VARCHAR(50) NOT NULL REFERENCES achievements(code),
    unlocked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_code)
);

-- Sổ cái vàng/KC. users.gold/gems là số dư cache, chỉ đổi cùng transaction với
-- 1 dòng ở đây. UNIQUE (user_id, reason, ref) -> 1 phần thưởng không cộng 2 lần.
CREATE TABLE currency_transactions (
    id          BIGSERIAL   PRIMARY KEY,
    user_id     BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gold_delta  INTEGER     NOT NULL DEFAULT 0,
    gems_delta  INTEGER     NOT NULL DEFAULT 0,
    reason      VARCHAR(30) NOT NULL CHECK (reason IN ('LEVEL_FIRST_CLEAR', 'ACHIEVEMENT', 'ADMIN')),
    ref         VARCHAR(50) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, reason, ref)
);

-- ---- Seed ----

INSERT INTO chapters (id, slug, title, sort_order) VALUES
    (1, 'trung-trac', 'Trưng Trắc', 1);

-- Thưởng qua màn lần đầu: DESIGN_BASELINE (task card D8).
INSERT INTO levels (id, chapter_id, level_no, title, first_clear_gold, first_clear_gems) VALUES
    (101, 1, 1, 'Vượt ải', 100, 0),
    (102, 1, 2, 'Chiêu mộ hiền tài', 150, 0),
    (103, 1, 3, 'Trận Luy Lâu', 200, 5);

INSERT INTO rewards (id, chapter_id, name) VALUES
    ('BUFF_Y_CHI_KIEN_CUONG', 1, 'Ý chí kiên cường'),
    ('SK_LE_CHAN_ARROW_RAIN', 1, 'Mưa tên'),
    ('SK_TRUNG_NHI_SHADOW', 1, 'Bóng Trưng Nhị');

-- Thành tựu mẫu: DESIGN_BASELINE, chờ team duyệt (task card D9). Điều kiện ở
-- backend/services/game_service.py (ACHIEVEMENT_RULES).
INSERT INTO achievements (code, name, description, icon, reward_gold, reward_gems, sort_order) VALUES
    ('TT_CLEAR_1',  'Vượt ải',               'Hoàn thành màn 1 chương Trưng Trắc.',                 '⚔️', 50, 0, 1),
    ('TT_CLEAR_2',  'Chiêu hiền',            'Hoàn thành màn 2 chương Trưng Trắc.',                 '🤝', 50, 0, 2),
    ('TT_CHAPTER',  'Khởi nghĩa Hai Bà Trưng', 'Hoàn thành chương Trưng Trắc.',                     '🏯', 0, 10, 3),
    ('TT_SPEED',    'Thần tốc',              'Tổng thời gian tốt nhất 3 màn Trưng Trắc dưới 15 phút.', '⚡', 0, 5, 4),
    ('TT_FLAWLESS', 'Bất khả xâm phạm',      'Qua một màn mà không trúng đòn nào.',                 '🛡️', 0, 5, 5),
    ('TT_SCHOLAR',  'Thông kim bác cổ',      'Qua một màn và trả lời đúng mọi câu hỏi lịch sử.',    '📜', 0, 5, 6);
