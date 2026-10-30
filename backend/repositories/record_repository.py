from backend.db import db_cursor


# Xếp hạng trong phạm vi (cả game / 1 chương / 1 màn): tổng điểm tốt nhất mỗi
# màn giảm dần, hoà thì tổng thời gian tốt nhất tăng dần (SUTA-DB-01).
# `chapter`/`level` = NULL nghĩa là không lọc.
LEADERBOARD_QUERY = """
    WITH scoped AS (
        SELECT s.user_id, s.best_score, s.best_time
        FROM user_level_stats s
        JOIN levels l ON l.id = s.level_id
        WHERE (%(chapter)s IS NULL OR l.chapter_id = %(chapter)s)
          AND (%(level)s IS NULL OR s.level_id = %(level)s)
    ),
    ranked AS (
        SELECT u.id, u.display_name,
               COUNT(*)           AS levels_passed,
               SUM(s.best_score)  AS total_score,
               SUM(s.best_time)   AS total_time,
               ROW_NUMBER() OVER (ORDER BY SUM(s.best_score) DESC, SUM(s.best_time) ASC, u.id) AS rank
        FROM users u
        JOIN scoped s ON s.user_id = u.id
        GROUP BY u.id, u.display_name
    )
    SELECT r.id, r.rank, r.display_name, r.levels_passed, r.total_score, r.total_time,
           (SELECT COALESCE(string_agg(a.icon, '' ORDER BY a.sort_order), '')
            FROM user_achievements ua JOIN achievements a ON a.code = ua.achievement_code
            WHERE ua.user_id = r.id) AS badges
    FROM ranked r
    WHERE r.rank <= %(limit)s OR r.id = %(me)s
    ORDER BY r.rank
"""


def get_leaderboard(chapter_id=None, level_id=None, limit=10, user_id=None):
    """Trả về {data: top `limit`, me: hàng của `user_id` (hoặc None), levels_total}."""
    params = {"chapter": chapter_id, "level": level_id, "limit": limit, "me": user_id}
    with db_cursor() as (_, cursor):
        cursor.execute(LEADERBOARD_QUERY, params)
        rows = cursor.fetchall()
        cursor.execute(
            "SELECT COUNT(*) FROM levels WHERE (%(chapter)s IS NULL OR chapter_id = %(chapter)s) "
            "AND (%(level)s IS NULL OR id = %(level)s)",
            params,
        )
        levels_total = cursor.fetchone()[0]

    board, me = [], None
    for row in rows:
        entry = {
            "rank": row[1],
            "name": row[2],
            "levels_passed": row[3],
            "total_score": row[4] or 0,
            "total_time": float(row[5] or 0),
            "badges": row[6],
        }
        if row[1] <= limit:
            board.append(entry)
        if user_id is not None and row[0] == user_id:
            me = entry
    return {"data": board, "me": me, "levels_total": levels_total}


# Chương đã qua = đã qua màn CUỐI của chương (màn có level_no lớn nhất) — trang
# chủ dùng để mở khoá chương kế tiếp (HOME-UNLOCK). Trả về danh sách id chương tăng dần.
CLEARED_CHAPTERS_QUERY = """
    SELECT l.chapter_id
    FROM levels l
    JOIN (SELECT chapter_id, MAX(level_no) AS last_no FROM levels GROUP BY chapter_id) last
      ON last.chapter_id = l.chapter_id AND last.last_no = l.level_no
    JOIN user_level_stats s ON s.level_id = l.id AND s.user_id = %s
    ORDER BY l.chapter_id
"""


def cleared_chapters(user_id):
    with db_cursor() as (_, cursor):
        cursor.execute(CLEARED_CHAPTERS_QUERY, (user_id,))
        return [row[0] for row in cursor.fetchall()]
