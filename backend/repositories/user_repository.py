from werkzeug.security import check_password_hash, generate_password_hash

from backend.db import db_cursor, placeholder


# Vàng/KC khởi đầu của tài khoản mới (DESIGN_BASELINE). Thưởng sau này đi qua
# currency_transactions (SUTA-DB-01).
STARTING_GOLD = 0
STARTING_GEMS = 0

# `levels_cleared` = số màn đã qua ít nhất 1 lần (thay cột `level` cũ không dùng).
USER_FIELDS = """
    u.id, u.display_name, u.gold, u.gems,
    (SELECT COUNT(*) FROM user_level_stats s WHERE s.user_id = u.id),
    u.avatar, u.gender
"""


def _user(row):
    if not row:
        return None
    return {
        "id": row[0],
        "name": row[1],
        "gold": row[2],
        "gems": row[3],
        "levels_cleared": row[4],
        "avatar": row[5],
        "gender": row[6],
    }


def find_by_credentials(username, password):
    mark = placeholder()
    with db_cursor(commit=True) as (_, cursor):
        cursor.execute(f"SELECT id, password_hash FROM users WHERE username = {mark}", (username,))
        row = cursor.fetchone()
        if not row or not check_password_hash(row[1], password):
            return None
        cursor.execute(f"UPDATE users SET last_login_at = NOW() WHERE id = {mark}", (row[0],))
        cursor.execute(f"SELECT {USER_FIELDS} FROM users u WHERE u.id = {mark}", (row[0],))
        return _user(cursor.fetchone())


def exists(username):
    mark = placeholder()
    with db_cursor() as (_, cursor):
        cursor.execute(f"SELECT 1 FROM users WHERE username = {mark}", (username,))
        return cursor.fetchone() is not None


def create(username, password, name, avatar="male", gender=None):
    mark = placeholder()
    with db_cursor(commit=True) as (_, cursor):
        cursor.execute(
            f"INSERT INTO users (username, password_hash, display_name, gold, gems, avatar, gender) "
            f"VALUES ({mark}, {mark}, {mark}, {mark}, {mark}, {mark}, {mark})",
            (username, generate_password_hash(password), name, STARTING_GOLD, STARTING_GEMS, avatar, gender),
        )


def set_avatar(user_id, avatar):
    mark = placeholder()
    with db_cursor(commit=True) as (_, cursor):
        cursor.execute(f"UPDATE users SET avatar = {mark} WHERE id = {mark}", (avatar, user_id))


def set_gender(user_id, gender):
    mark = placeholder()
    with db_cursor(commit=True) as (_, cursor):
        cursor.execute(f"UPDATE users SET gender = {mark} WHERE id = {mark}", (gender, user_id))


def find_by_id(user_id):
    mark = placeholder()
    with db_cursor() as (_, cursor):
        cursor.execute(f"SELECT {USER_FIELDS} FROM users u WHERE u.id = {mark}", (user_id,))
        return _user(cursor.fetchone())
