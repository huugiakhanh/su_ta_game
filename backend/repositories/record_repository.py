# File: backend/repositories/record_repository.py

from backend.db import db_cursor, placeholder

def save_level_clear_time(username, level_id, clear_time_seconds):
    mark = placeholder()
    with db_cursor(commit=True) as (_, cursor):
        cursor.execute(
            f"INSERT INTO level_records (username, level_id, clear_time_seconds) "
            f"VALUES ({mark}, {mark}, {mark})",
            (username, level_id, clear_time_seconds),
        )