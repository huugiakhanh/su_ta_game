from pathlib import Path
import sqlite3

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS


BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "game.db"

app = Flask(__name__)
CORS(app)


def get_db_connection():
    return sqlite3.connect(DATABASE_PATH)


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            username TEXT,
            password TEXT,
            name TEXT,
            level INTEGER,
            gold INTEGER,
            gems INTEGER
        )
        """
    )

    cursor.execute(
        "SELECT * FROM users WHERE username = ?",
        ("trungtrac",),
    )

    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)",
            ("trungtrac", "123456", "TRƯNG TRẮC", 12, 12500, 350),
        )

    conn.commit()
    conn.close()


# ------------------------------------------------------------------
# CÁC ROUTE HIỂN THỊ GIAO DIỆN
# ------------------------------------------------------------------


@app.route("/")
def home():
    """Mở trang chính tại http://127.0.0.1:5000."""
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/style.css")
def main_css():
    """Trả về file CSS chính."""
    return send_from_directory(BASE_DIR, "style.css")


@app.route("/gameplay/<path:filename>")
def gameplay_files(filename):
    """Phục vụ chapter-modal.html và chapter-modal.css."""
    return send_from_directory(BASE_DIR / "gameplay", filename)


@app.route("/ảnh/<path:filename>")
def image_files(filename):
    """Phục vụ hình nền và các hình ảnh trong thư mục ảnh."""
    return send_from_directory(BASE_DIR / "ảnh", filename)


# ------------------------------------------------------------------
# API ĐĂNG NHẬP VÀ ĐĂNG KÝ
# ------------------------------------------------------------------


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify(
            {
                "status": "error",
                "message": "Vui lòng nhập tài khoản và mật khẩu!",
            }
        )

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT name, level, gold, gems
        FROM users
        WHERE username = ? AND password = ?
        """,
        (username, password),
    )
    user = cursor.fetchone()
    conn.close()

    if user:
        return jsonify(
            {
                "status": "success",
                "name": user[0],
                "level": user[1],
                "gold": user[2],
                "gems": user[3],
            }
        )

    return jsonify(
        {
            "status": "error",
            "message": "Sai tài khoản hoặc mật khẩu!",
        }
    )


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")
    name = data.get("name", "TÂN THỦ").strip() or "TÂN THỦ"

    if not username or not password:
        return jsonify(
            {
                "status": "error",
                "message": "Vui lòng nhập đầy đủ tài khoản và mật khẩu!",
            }
        )

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT 1 FROM users WHERE username = ?",
        (username,),
    )

    if cursor.fetchone():
        conn.close()
        return jsonify(
            {
                "status": "error",
                "message": "Tài khoản này đã tồn tại!",
            }
        )

    cursor.execute(
        "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)",
        (username, password, name, 1, 1000, 50),
    )
    conn.commit()
    conn.close()

    return jsonify(
        {
            "status": "success",
            "message": "Đăng ký thành công! Hãy đăng nhập lại.",
        }
    )


if __name__ == "__main__":
    init_db()
    app.run(host="127.0.0.1", port=5000, debug=True)
