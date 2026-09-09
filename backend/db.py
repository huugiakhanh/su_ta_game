from contextlib import contextmanager

from flask import current_app


USERS_SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    level INTEGER DEFAULT 1,
    gold INTEGER DEFAULT 0,
    gems INTEGER DEFAULT 0
)
"""


def get_db_connection():
    database_url = current_app.config["DATABASE_URL"]
    if not database_url:
        raise RuntimeError(
            "Thiếu SUTA_DATABASE_URL. Hãy cấu hình chuỗi kết nối PostgreSQL."
        )

    import psycopg2

    return psycopg2.connect(database_url)


def placeholder():
    return "%s"


@contextmanager
def db_cursor(commit=False):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        yield connection, cursor
        if commit:
            connection.commit()
    finally:
        cursor.close()
        connection.close()


def init_db():
    with db_cursor(commit=True) as (_, cursor):
        cursor.execute(USERS_SCHEMA)
        mark = placeholder()
        cursor.execute(f"SELECT 1 FROM users WHERE username = {mark}", ("admin",))
        if not cursor.fetchone():
            cursor.execute(
                f"INSERT INTO users (username, password, name, level, gold, gems) "
                f"VALUES ({mark}, {mark}, {mark}, {mark}, {mark}, {mark})",
                ("admin", "admin", "QUẢN TRỊ VIÊN", 1, 1000, 50),
            )
