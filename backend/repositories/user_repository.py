from backend.db import db_cursor, placeholder


def find_by_credentials(username, password):
    mark = placeholder()
    with db_cursor() as (_, cursor):
        cursor.execute(
            f"SELECT name, level, gold, gems FROM users "
            f"WHERE username = {mark} AND password = {mark}",
            (username, password),
        )
        row = cursor.fetchone()

    if not row:
        return None
    return {
        "name": row[0],
        "level": row[1],
        "gold": row[2],
        "gems": row[3],
    }


def exists(username):
    mark = placeholder()
    with db_cursor() as (_, cursor):
        cursor.execute(f"SELECT 1 FROM users WHERE username = {mark}", (username,))
        return cursor.fetchone() is not None


def create(username, password, name):
    mark = placeholder()
    with db_cursor(commit=True) as (_, cursor):
        cursor.execute(
            f"INSERT INTO users (username, password, name, level, gold, gems) "
            f"VALUES ({mark}, {mark}, {mark}, {mark}, {mark}, {mark})",
            (username, password, name, 1, 1000, 50),
        )
