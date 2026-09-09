from flask import Blueprint, jsonify, request

from backend.repositories.user_repository import create, exists, find_by_credentials


api_bp = Blueprint("api", __name__)


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
    return jsonify({"status": "success", **user})


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
