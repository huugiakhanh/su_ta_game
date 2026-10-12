"""Tiến trình chương theo tài khoản (SUTA-DB-01). Dữ liệu dạng object `progress`
của progress.js: levelNComplete <=> cleared_level >= N."""

from backend.db import db_cursor


LEVELS_PER_CHAPTER = 3


def _to_dict(row, rewards):
    score, books, cleared_level, times = row
    data = {"score": score, "books": books, "rewards": rewards, "times": times or {}}
    for level in range(1, LEVELS_PER_CHAPTER + 1):
        data[f"level{level}Complete"] = cleared_level >= level
    return data


def cleared_level_of(data):
    """Số màn liên tiếp từ màn 1 đã hoàn thành."""
    cleared = 0
    while cleared < LEVELS_PER_CHAPTER and data.get(f"level{cleared + 1}Complete"):
        cleared += 1
    return cleared


def known_reward_ids(chapter_id):
    with db_cursor() as (_, cursor):
        cursor.execute("SELECT id FROM rewards WHERE chapter_id = %s", (chapter_id,))
        return {row[0] for row in cursor.fetchall()}


def get_progress(user_id, chapter_id):
    """Object tiến trình, hoặc None nếu chưa có."""
    with db_cursor() as (_, cursor):
        cursor.execute(
            "SELECT score, books, cleared_level, times FROM chapter_progress "
            "WHERE user_id = %s AND chapter_id = %s",
            (user_id, chapter_id),
        )
        row = cursor.fetchone()
        if not row:
            return None
        cursor.execute(
            "SELECT reward_id FROM chapter_progress_rewards "
            "WHERE user_id = %s AND chapter_id = %s ORDER BY obtained_at, reward_id",
            (user_id, chapter_id),
        )
        return _to_dict(row, [r[0] for r in cursor.fetchall()])


def save_progress(user_id, chapter_id, data):
    """Ghi đè toàn bộ tiến trình (`data` đã kiểm tra ở route)."""
    from psycopg2.extras import Json

    with db_cursor(commit=True) as (_, cursor):
        cursor.execute(
            "INSERT INTO chapter_progress (user_id, chapter_id, score, books, cleared_level, times) "
            "VALUES (%s, %s, %s, %s, %s, %s) "
            "ON CONFLICT (user_id, chapter_id) DO UPDATE SET score = EXCLUDED.score, "
            "books = EXCLUDED.books, cleared_level = EXCLUDED.cleared_level, "
            "times = EXCLUDED.times, updated_at = NOW()",
            (user_id, chapter_id, data["score"], data["books"], cleared_level_of(data), Json(data["times"])),
        )
        # Giữ obtained_at của phần thưởng vẫn còn; bỏ cái không còn trong data.
        cursor.execute(
            "DELETE FROM chapter_progress_rewards WHERE user_id = %s AND chapter_id = %s "
            "AND NOT (reward_id = ANY(%s))",
            (user_id, chapter_id, list(data["rewards"])),
        )
        for reward_id in data["rewards"]:
            cursor.execute(
                "INSERT INTO chapter_progress_rewards (user_id, chapter_id, reward_id) "
                "VALUES (%s, %s, %s) ON CONFLICT DO NOTHING",
                (user_id, chapter_id, reward_id),
            )


def clear_progress(user_id, chapter_id):
    with db_cursor(commit=True) as (_, cursor):
        cursor.execute(
            "DELETE FROM chapter_progress WHERE user_id = %s AND chapter_id = %s",
            (user_id, chapter_id),
        )
