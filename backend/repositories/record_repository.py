from backend.db import db_cursor, placeholder

def save_level_clear_time(username, level_id, clear_time_seconds, score=0): # Thêm tham số score
    mark = placeholder()
    with db_cursor(commit=True) as (_, cursor):
        cursor.execute(
            f"INSERT INTO level_records (username, level_id, clear_time_seconds, score) "
            f"VALUES ({mark}, {mark}, {mark}, {mark})",
            (username, level_id, clear_time_seconds, score), # Truyền thêm score vào đây
        )


def get_top_players(limit=10):
    # Dùng CTE (WITH) để lấy thành tích tốt nhất của mỗi màn cho từng user
    query = """
        WITH BestScores AS (
            SELECT username, level_id, MAX(score) as best_score, MIN(clear_time_seconds) as best_time
            FROM level_records
            GROUP BY username, level_id
        )
        SELECT 
            u.name, 
            COUNT(bs.level_id) as levels_passed, 
            SUM(bs.best_score) as total_score, 
            SUM(bs.best_time) as total_time
        FROM users u
        JOIN BestScores bs ON u.username = bs.username
        GROUP BY u.username, u.name
        ORDER BY total_score DESC, total_time ASC
        LIMIT %s
    """
    with db_cursor() as (_, cursor):
        cursor.execute(query, (limit,))
        rows = cursor.fetchall()
        
    leaderboard = []
    for i, row in enumerate(rows):
        leaderboard.append({
            "rank": i + 1,
            "name": row[0],
            "levels_passed": row[1],
            "total_score": row[2] if row[2] else 0,
            "total_time": row[3] if row[3] else 0
        })
    return leaderboard