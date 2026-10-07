from backend.db import db_cursor, placeholder

def save_level_clear_time(username, level_id, clear_time_seconds, score=0): # Thêm tham số score
    mark = placeholder()
    with db_cursor(commit=True) as (_, cursor):
        cursor.execute(
            f"INSERT INTO level_records (username, level_id, clear_time_seconds, score) "
            f"VALUES ({mark}, {mark}, {mark}, {mark})",
            (username, level_id, clear_time_seconds, score), # Truyền thêm score vào đây
        )