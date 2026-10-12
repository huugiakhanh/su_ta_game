-- SUTA-DB-01 (bổ sung 10/10/2026): avatar người chơi, chọn khi đăng ký và đổi
-- được sau. Giá trị khớp VALID_AVATARS ở backend/routes/api.py và AVATARS ở
-- frontend/static/js/home.js (ảnh AVATAR_MALE / AVATAR_FEMALE).
ALTER TABLE users
    ADD COLUMN avatar VARCHAR(20) NOT NULL DEFAULT 'male'
    CHECK (avatar IN ('male', 'female'));
