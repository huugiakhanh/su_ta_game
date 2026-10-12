from backend.db import db_cursor


# BXH trắc nghiệm (SUTA-QUIZ-LB): tổng câu đúng qua mọi lượt giảm dần, hoà thì
# tổng thời gian trả lời tăng dần.
QUIZ_LEADERBOARD_QUERY = """
    WITH ranked AS (
        SELECT u.id, u.display_name,
               COUNT(*)              AS runs,
               SUM(q.correct_count)  AS total_correct,
               SUM(q.question_count) AS total_questions,
               SUM(q.time_seconds)   AS total_time,
               ROW_NUMBER() OVER (ORDER BY SUM(q.correct_count) DESC, SUM(q.time_seconds) ASC, u.id) AS rank
        FROM users u
        JOIN quiz_results q ON q.user_id = u.id
        GROUP BY u.id, u.display_name
    )
    SELECT id, rank, display_name, runs, total_correct, total_questions, total_time
    FROM ranked
    WHERE rank <= %(limit)s OR id = %(me)s
    ORDER BY rank
"""


def save_quiz_result(user_id, question_count, correct_count, time_seconds):
    with db_cursor(commit=True) as (_, cursor):
        cursor.execute(
            "INSERT INTO quiz_results (user_id, question_count, correct_count, time_seconds) "
            "VALUES (%s, %s, %s, %s)",
            (user_id, question_count, correct_count, time_seconds),
        )


def get_quiz_leaderboard(limit=10, user_id=None):
    """Trả về {data: top `limit`, me: hàng của `user_id` (hoặc None)}."""
    with db_cursor() as (_, cursor):
        cursor.execute(QUIZ_LEADERBOARD_QUERY, {"limit": limit, "me": user_id})
        rows = cursor.fetchall()

    board, me = [], None
    for row in rows:
        entry = {
            "rank": row[1],
            "name": row[2],
            "runs": row[3],
            "total_correct": row[4] or 0,
            "total_questions": row[5] or 0,
            "total_time": float(row[6] or 0),
        }
        if row[1] <= limit:
            board.append(entry)
        if user_id is not None and row[0] == user_id:
            me = entry
    return {"data": board, "me": me}
