from contextlib import contextmanager
from pathlib import Path

from flask import current_app


MIGRATIONS_DIR = Path(__file__).resolve().parent / "migrations"
# Khoá advisory để 2 tiến trình (vd. reloader của Flask debug) không chạy
# migration cùng lúc. Số tuỳ ý, chỉ cần cố định.
MIGRATION_LOCK_ID = 7_310_001

SCHEMA_MIGRATIONS = """
CREATE TABLE IF NOT EXISTS schema_migrations (
    version     VARCHAR(100) PRIMARY KEY,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
    """Một kết nối + cursor. `commit=True`: commit khi khối chạy xong không lỗi;
    có exception thì đóng kết nối không commit (PostgreSQL tự rollback)."""
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        yield connection, cursor
        if commit:
            connection.commit()
    finally:
        cursor.close()
        connection.close()


def migration_files():
    """File migration `NNN_ten.sql`, theo thứ tự tên."""
    return sorted(MIGRATIONS_DIR.glob("[0-9][0-9][0-9]_*.sql"))


def run_migrations():
    """Chạy các file migration chưa áp dụng (SUTA-DB-01). Mỗi file 1 transaction:
    lỗi -> rollback file đó và dừng. Trả về danh sách version vừa chạy."""
    applied_now = []
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT pg_advisory_lock(%s)", (MIGRATION_LOCK_ID,))
            cursor.execute(SCHEMA_MIGRATIONS)
            connection.commit()
            cursor.execute("SELECT version FROM schema_migrations")
            done = {row[0] for row in cursor.fetchall()}
            for path in migration_files():
                if path.stem in done:
                    continue
                try:
                    cursor.execute(path.read_text(encoding="utf-8"))
                    cursor.execute("INSERT INTO schema_migrations (version) VALUES (%s)", (path.stem,))
                    connection.commit()
                except Exception:
                    connection.rollback()
                    raise
                applied_now.append(path.stem)
            cursor.execute("SELECT pg_advisory_unlock(%s)", (MIGRATION_LOCK_ID,))
            connection.commit()
    finally:
        connection.close()
    return applied_now

