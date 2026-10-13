-- TT-HERO-01 (12/10/2026): giới tính người chơi -> nhân vật nam/nữ trong màn chơi
-- (PLAYER_SPRITES ở frontend/static/js/levels/trung-trac/config.js). Tách khỏi
-- `avatar`. Tài khoản cũ để NULL — màn chơi hỏi lần đầu rồi lưu qua
-- POST /api/auth/gender. Giá trị khớp VALID_GENDERS ở backend/routes/api.py.
ALTER TABLE users
    ADD COLUMN gender VARCHAR(10) NULL
    CHECK (gender IN ('male', 'female'));
