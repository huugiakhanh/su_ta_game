import math

from flask import Blueprint, jsonify, request, session

from backend.repositories.user_repository import create, exists, find_by_credentials, find_by_username
from backend.repositories.record_repository import save_level_clear_time
from backend.repositories.record_repository import get_top_players

api_bp = Blueprint("api", __name__)

# level_id = 100 × chương + màn (TT-TIME-01). Chương 1 = Trưng Trắc (3 màn).
VALID_LEVEL_IDS = {101, 102, 103}
# Thời gian qua 1 màn hợp lệ: (0, 24 giờ].
MAX_CLEAR_TIME_SECONDS = 24 * 3600


def payload_error(message):
    return jsonify({"status": "error", "message": message})


@api_bp.post("/login")
@api_bp.post("/api/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()
    password = data.get("password", "")
    if not username or not password:
        return payload_error("Vui lòng nhập tài khoản và mật khẩu!")

    user = find_by_credentials(username, password)
    if not user:
        return payload_error("Sai tài khoản hoặc mật khẩu!")
    # Giữ đăng nhập bằng session (cookie ký bằng SECRET_KEY) — màn chơi và
    # save-time biết ai đang chơi mà không tin username client gửi lên.
    session.clear()
    session["username"] = username
    session.permanent = True
    return jsonify({"status": "success", **user})


@api_bp.get("/api/auth/me")
def me():
    username = session.get("username")
    user = find_by_username(username) if username else None
    if not user:
        session.pop("username", None)
        return jsonify({"status": "guest"})
    return jsonify({"status": "success", **user})


@api_bp.post("/api/auth/logout")
def logout():
    session.clear()
    return jsonify({"status": "success"})


@api_bp.post("/register")
@api_bp.post("/api/auth/register")
def register():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()
    password = data.get("password", "")
    name = str(data.get("name", "TÂN THỦ")).strip() or "TÂN THỦ"
    if not username or not password:
        return payload_error("Vui lòng nhập đầy đủ tài khoản và mật khẩu!")
    if exists(username):
        return payload_error("Tài khoản này đã tồn tại!")

    create(username, password, name)
    return jsonify({"status": "success", "message": "Đăng ký thành công! Hãy đăng nhập lại."})


@api_bp.post("/save-time")
@api_bp.post("/api/game/save-time")
def save_time():
    # Người chơi lấy từ session (TT-TIME-01), bỏ qua `username` trong payload.
    username = session.get("username")
    if not username:
        return jsonify({"status": "error", "message": "Hãy đăng nhập để lưu kỷ lục."}), 401

    data = request.get_json(silent=True) or {}
    level_id = data.get("level_id")
    clear_time = data.get("clear_time")
    score = data.get("score", 0)

    if type(level_id) is not int or level_id not in VALID_LEVEL_IDS:
        return payload_error("level_id không hợp lệ."), 400
    if (isinstance(clear_time, bool) or not isinstance(clear_time, (int, float))
            or not math.isfinite(clear_time) or not 0 < clear_time <= MAX_CLEAR_TIME_SECONDS):
        return payload_error("clear_time không hợp lệ."), 400
    if type(score) is not int or score < 0:
        return payload_error("score không hợp lệ."), 400

    try:
        save_level_clear_time(username, level_id, float(clear_time), score)
        return jsonify({"status": "success", "message": "Đã lưu thời gian và điểm số thành công!"})
    except Exception as e:
        return payload_error(f"Có lỗi xảy ra: {str(e)}"), 500


@api_bp.get("/leaderboard")
@api_bp.get("/api/game/leaderboard")
def leaderboard():
    try:
        data = get_top_players(10) # Trả về top 10 người cao điểm nhất toàn server
        return jsonify({"status": "success", "data": data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500