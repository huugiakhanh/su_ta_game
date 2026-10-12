from backend.db import db_cursor


def list_achievements(user_id=None):
    """Danh mục thành tựu + trạng thái của `user_id` (None = khách, chưa mở gì).
    Thành tựu `hidden` chỉ hiện khi đã mở."""
    with db_cursor() as (_, cursor):
        cursor.execute(
            "SELECT a.code, a.name, a.description, a.icon, a.reward_gold, a.reward_gems, "
            "a.hidden, ua.unlocked_at "
            "FROM achievements a LEFT JOIN user_achievements ua "
            "ON ua.achievement_code = a.code AND ua.user_id = %s "
            "ORDER BY a.sort_order",
            (user_id,),
        )
        rows = cursor.fetchall()
    return [
        {
            "code": code,
            "name": name,
            "description": description,
            "icon": icon,
            "reward_gold": gold,
            "reward_gems": gems,
            "unlocked": unlocked_at is not None,
            "unlocked_at": unlocked_at.isoformat() if unlocked_at else None,
        }
        for code, name, description, icon, gold, gems, hidden, unlocked_at in rows
        if not hidden or unlocked_at
    ]
