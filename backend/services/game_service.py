"""Nghiệp vụ qua màn (SUTA-DB-01): ghi kỷ lục, thành tích tốt nhất, thưởng qua
màn lần đầu và thành tựu — tất cả trong 1 transaction."""

from backend.db import db_cursor


CHAPTER_TT_LEVELS = (101, 102, 103)
# DESIGN_BASELINE (task card D9): tổng thời gian tốt nhất 3 màn Trưng Trắc.
SPEED_LIMIT_SECONDS = 15 * 60


def _cleared(level_id):
    return lambda ctx: level_id in ctx["best_times"]


def _speed(ctx):
    times = [ctx["best_times"].get(level) for level in CHAPTER_TT_LEVELS]
    return None not in times and sum(times) < SPEED_LIMIT_SECONDS


def _flawless(ctx):
    return ctx["stats"].get("hits_taken") == 0


def _scholar(ctx):
    total = ctx["stats"].get("quiz_total")
    return isinstance(total, int) and total > 0 and ctx["stats"].get("quiz_correct") == total


# code (khớp bảng achievements) -> điều kiện. ctx: best_times {level_id: giây},
# stats (của lượt vừa qua, có thể rỗng).
ACHIEVEMENT_RULES = {
    "TT_CLEAR_1": _cleared(101),
    "TT_CLEAR_2": _cleared(102),
    "TT_CHAPTER": _cleared(103),
    "TT_SPEED": _speed,
    "TT_FLAWLESS": _flawless,
    "TT_SCHOLAR": _scholar,
}


def _grant(cursor, user_id, reason, ref, gold, gems):
    """Cộng vàng/KC đúng 1 lần cho (reason, ref). Trả về True nếu vừa cộng."""
    if not gold and not gems:
        return False
    cursor.execute(
        "INSERT INTO currency_transactions (user_id, gold_delta, gems_delta, reason, ref) "
        "VALUES (%s, %s, %s, %s, %s) ON CONFLICT (user_id, reason, ref) DO NOTHING RETURNING id",
        (user_id, gold, gems, reason, str(ref)),
    )
    if not cursor.fetchone():
        return False
    cursor.execute("UPDATE users SET gold = gold + %s, gems = gems + %s WHERE id = %s", (gold, gems, user_id))
    return True


def complete_level(user_id, level_id, seconds, score, stats=None):
    """Ghi 1 lượt qua màn. Trả về {first_clear, gold_gained, gems_gained,
    new_achievements: [{code, name, icon}]}."""
    from psycopg2.extras import Json

    stats = stats or {}
    result = {"first_clear": False, "gold_gained": 0, "gems_gained": 0, "new_achievements": []}
    with db_cursor(commit=True) as (_, cursor):
        # Khoá dòng user: 2 request qua màn cùng lúc của 1 người chạy tuần tự.
        cursor.execute("SELECT id FROM users WHERE id = %s FOR UPDATE", (user_id,))
        if not cursor.fetchone():
            raise LookupError("Không tìm thấy người chơi.")

        cursor.execute(
            "INSERT INTO level_records (user_id, level_id, clear_time_seconds, score, stats) "
            "VALUES (%s, %s, %s, %s, %s)",
            (user_id, level_id, seconds, score, Json(stats) if stats else None),
        )
        cursor.execute("SELECT 1 FROM user_level_stats WHERE user_id = %s AND level_id = %s", (user_id, level_id))
        result["first_clear"] = cursor.fetchone() is None
        cursor.execute(
            "INSERT INTO user_level_stats (user_id, level_id, best_time, best_score) VALUES (%s, %s, %s, %s) "
            "ON CONFLICT (user_id, level_id) DO UPDATE SET "
            "best_time = LEAST(user_level_stats.best_time, EXCLUDED.best_time), "
            "best_score = GREATEST(user_level_stats.best_score, EXCLUDED.best_score), "
            "clear_count = user_level_stats.clear_count + 1",
            (user_id, level_id, seconds, score),
        )

        if result["first_clear"]:
            cursor.execute("SELECT first_clear_gold, first_clear_gems FROM levels WHERE id = %s", (level_id,))
            gold, gems = cursor.fetchone()
            if _grant(cursor, user_id, "LEVEL_FIRST_CLEAR", level_id, gold, gems):
                result["gold_gained"] += gold
                result["gems_gained"] += gems

        cursor.execute("SELECT level_id, best_time FROM user_level_stats WHERE user_id = %s", (user_id,))
        ctx = {"best_times": {row[0]: float(row[1]) for row in cursor.fetchall()}, "stats": stats}
        cursor.execute(
            "SELECT a.code, a.name, a.icon, a.reward_gold, a.reward_gems FROM achievements a "
            "WHERE NOT EXISTS (SELECT 1 FROM user_achievements u "
            "WHERE u.user_id = %s AND u.achievement_code = a.code) ORDER BY a.sort_order",
            (user_id,),
        )
        for code, name, icon, gold, gems in cursor.fetchall():
            rule = ACHIEVEMENT_RULES.get(code)
            if not rule or not rule(ctx):
                continue
            cursor.execute(
                "INSERT INTO user_achievements (user_id, achievement_code) VALUES (%s, %s)",
                (user_id, code),
            )
            if _grant(cursor, user_id, "ACHIEVEMENT", code, gold, gems):
                result["gold_gained"] += gold
                result["gems_gained"] += gems
            result["new_achievements"].append({"code": code, "name": name, "icon": icon})
    return result
