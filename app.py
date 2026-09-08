from pathlib import Path
# NOTE FIX CODE: Chuyển thư viện sqlite3 sang psycopg2
import psycopg2

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent

# NOTE FIX CODE: Đổi từ việc dùng file .db sang cấu hình kết nối PostgreSQL
DB_CONFIG = {
    'host': 'localhost',      # Nếu database nằm trên cùng máy thì để localhost
    'database': 'suta_user',  # Tên database bạn đã tạo trong PostgreSQL
    'user': 'postgres',       # Username mặc định của PostgreSQL
    'password': 'postgres',        # Mật khẩu PostgreSQL của bạn
    'port': 5432              # Cổng mặc định của PostgreSQL
}

app = Flask(__name__)
CORS(app)

# NOTE FIX CODE: Sửa hàm kết nối để dùng cấu hình DB_CONFIG
def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # NOTE FIX CODE: Cập nhật kiểu dữ liệu sang chuẩn PostgreSQL và thêm PRIMARY KEY
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            username VARCHAR(50) PRIMARY KEY,
            password VARCHAR(100) NOT NULL,
            name VARCHAR(100),
            level INT DEFAULT 1,
            gold INT DEFAULT 0,
            gems INT DEFAULT 0
        )
        """
    )

    cursor.execute(
        "SELECT * FROM users WHERE username = %s",
        ("admin",),
    )

    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO users (username, password, name, level, gold, gems) VALUES (%s, %s, %s, %s, %s, %s)",
            ("admin", "admin", "local admin", 0, -1, -1),
        )

    conn.commit()
    cursor.close()
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
    
    # NOTE FIX CODE: Đổi dấu `?` thành `%s`
    cursor.execute(
        """
        SELECT name, level, gold, gems
        FROM users
        WHERE username = %s AND password = %s
        """,
        (username, password),
    )
    user = cursor.fetchone()
    cursor.close()
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

    # NOTE FIX CODE: Đổi dấu `?` thành `%s`
    cursor.execute(
        "SELECT 1 FROM users WHERE username = %s",
        (username,),
    )

    if cursor.fetchone():
        cursor.close()
        conn.close()
        return jsonify(
            {
                "status": "error",
                "message": "Tài khoản này đã tồn tại!",
            }
        )

    # NOTE FIX CODE: Đổi dấu `?` thành `%s`
    cursor.execute(
        "INSERT INTO users (username, password, name, level, gold, gems) VALUES (%s, %s, %s, %s, %s, %s)",
        (username, password, name, 1, 1000, 50),
    )
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify(
        {
            "status": "success",
            "message": "Đăng ký thành công! Hãy đăng nhập lại.",
        }
    )


if __name__ == '__main__':
    # Đảm bảo database đã được tạo trên Postgres trước khi chạy file này
    init_db()
    
    app.run(host='0.0.0.0', port=5000, debug=True)