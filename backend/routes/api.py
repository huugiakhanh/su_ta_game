import math

from flask import Blueprint, jsonify, request, session

from backend.repositories.user_repository import create, exists, find_by_credentials, find_by_id, set_avatar, set_gender
from backend.repositories.achievement_repository import list_achievements
from backend.repositories.record_repository import cleared_chapters, get_leaderboard
from backend.repositories.quiz_repository import get_quiz_leaderboard, save_quiz_result
from backend.repositories.progress_repository import (
    LEVELS_PER_CHAPTER, clear_progress, get_progress, known_reward_ids, save_progress,
)
from backend.services.game_service import complete_level

api_bp = Blueprint("api", __name__)

# level_id = 100 × chương + màn (TT-TIME-01). Chương 1 = Trưng Trắc, 2 = Bà Triệu
# (3 màn mỗi chương; seed ở migration 001 / 005).
VALID_LEVEL_IDS = {101, 102, 103, 201, 202, 203}
# Thời gian qua 1 màn hợp lệ: (0, 24 giờ].
MAX_CLEAR_TIME_SECONDS = 24 * 3600
# `stats` tuỳ chọn của 1 lượt qua màn (SUTA-DB-01) — số nguyên ≥ 0, dùng xét thành tựu.
STATS_KEYS = {"hits_taken", "quiz_correct", "quiz_total"}
# Chương có trong bảng `chapters` (1 = Trưng Trắc, 2 = Bà Triệu).
VALID_CHAPTER_IDS = {1, 2}
LEADERBOARD_LIMIT = 10
# Avatar người chơi (cột users.avatar, migration 002). Mặc định "male".
VALID_AVATARS = {"male", "female"}
# Giới tính -> nhân vật nam/nữ trong màn chơi (users.gender, migration 004 — TT-HERO-01).
VALID_GENDERS = {"male", "female"}
MAX_BOOKS = 99
# Số câu tối đa 1 lượt trắc nghiệm ở /quiz (ngân hàng câu hiện có 50 câu) — SUTA-QUIZ-LB.
MAX_QUIZ_QUESTIONS = 200


def payload_error(message):
    return jsonify({"status": "error", "message": message})


def public_user(user):
    """Bỏ id nội bộ khỏi dữ liệu trả về trình duyệt."""
    return {key: value for key, value in user.items() if key != "id"}


def is_int(value, low=0, high=None):
    return type(value) is int and value >= low and (high is None or value <= high)


def is_clear_time(value):
    return (not isinstance(value, bool) and isinstance(value, (int, float))
            and math.isfinite(value) and 0 < value <= MAX_CLEAR_TIME_SECONDS)


def parse_progress(data, reward_ids):
    """Object tiến trình của progress.js đã chuẩn hoá, hoặc None nếu sai dạng."""
    if not isinstance(data, dict):
        return None
    score, books = data.get("score", 0), data.get("books", 0)
    rewards, times = data.get("rewards", []), data.get("times", {})
    if not is_int(score) or not is_int(books, high=MAX_BOOKS):
        return None
    if (not isinstance(rewards, list) or len(set(rewards)) != len(rewards)
            or not all(isinstance(r, str) and r in reward_ids for r in rewards)):
        return None
    level_keys = {str(level) for level in range(1, LEVELS_PER_CHAPTER + 1)}
    if (not isinstance(times, dict) or not set(times) <= level_keys
            or not all(is_clear_time(value) for value in times.values())):
        return None
    flags = {}
    for level in range(1, LEVELS_PER_CHAPTER + 1):
        flag = data.get(f"level{level}Complete", False)
        if not isinstance(flag, bool):
            return None
        flags[f"level{level}Complete"] = flag
    return {"score": score, "books": books, "rewards": rewards, "times": times, **flags}


def is_avatar(value):
    return isinstance(value, str) and value in VALID_AVATARS


def is_gender(value):
    return isinstance(value, str) and value in VALID_GENDERS


def parse_stats(stats):
    """None nếu `stats` sai dạng; {} nếu không gửi."""
    if stats is None:
        return {}
    if not isinstance(stats, dict) or not set(stats) <= STATS_KEYS:
        return None
    if any(type(value) is not int or value < 0 for value in stats.values()):
        return None
    return stats


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
    session["user_id"] = user["id"]
    session.permanent = True
    return jsonify({"status": "success", **public_user(user)})


@api_bp.get("/api/auth/me")
def me():
    user_id = session.get("user_id")
    user = find_by_id(user_id) if user_id else None
    if not user:
        session.pop("user_id", None)
        return jsonify({"status": "guest"})
    return jsonify({"status": "success", **public_user(user)})


@api_bp.post("/api/auth/avatar")
def change_avatar():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"status": "guest"}), 401
    avatar = (request.get_json(silent=True) or {}).get("avatar")
    if not is_avatar(avatar):
        return payload_error("Avatar không hợp lệ!"), 400
    set_avatar(user_id, avatar)
    return jsonify({"status": "success", "avatar": avatar})


@api_bp.post("/api/auth/gender")
def change_gender():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"status": "guest"}), 401
    gender = (request.get_json(silent=True) or {}).get("gender")
    if not is_gender(gender):
        return payload_error("Giới tính không hợp lệ!"), 400
    set_gender(user_id, gender)
    return jsonify({"status": "success", "gender": gender})


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
    avatar = data.get("avatar", "male")
    gender = data.get("gender")
    if not username or not password:
        return payload_error("Vui lòng nhập đầy đủ tài khoản và mật khẩu!")
    if not is_avatar(avatar):
        return payload_error("Avatar không hợp lệ!")
    if not is_gender(gender):
        return payload_error("Vui lòng chọn giới tính!")
    if exists(username):
        return payload_error("Tài khoản này đã tồn tại!")

    create(username, password, name, avatar, gender)
    return jsonify({"status": "success", "message": "Đăng ký thành công! Hãy đăng nhập lại."})


@api_bp.post("/save-time")
@api_bp.post("/api/game/save-time")
def save_time():
    # Người chơi lấy từ session (TT-TIME-01), bỏ qua `username` trong payload.
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"status": "error", "message": "Hãy đăng nhập để lưu kỷ lục."}), 401

    data = request.get_json(silent=True) or {}
    level_id = data.get("level_id")
    clear_time = data.get("clear_time")
    score = data.get("score", 0)
    stats = parse_stats(data.get("stats"))

    if type(level_id) is not int or level_id not in VALID_LEVEL_IDS:
        return payload_error("level_id không hợp lệ."), 400
    if not is_clear_time(clear_time):
        return payload_error("clear_time không hợp lệ."), 400
    if not is_int(score):
        return payload_error("score không hợp lệ."), 400
    if stats is None:
        return payload_error("stats không hợp lệ."), 400

    try:
        result = complete_level(user_id, level_id, round(float(clear_time), 2), score, stats)
        return jsonify({"status": "success", "message": "Đã lưu thời gian và điểm số thành công!", **result})
    except Exception as e:
        return payload_error(f"Có lỗi xảy ra: {str(e)}"), 500


def parse_scope(scope):
    """`all` | `chapter-<id>` | `level-<id>` -> (chapter_id, level_id); sai -> None.
    `quiz` xử lý riêng trong leaderboard()."""
    if scope == "all":
        return None, None
    kind, _, value = scope.partition("-")
    if not value.isdigit():
        return None
    if kind == "chapter" and int(value) in VALID_CHAPTER_IDS:
        return int(value), None
    if kind == "level" and int(value) in VALID_LEVEL_IDS:
        return None, int(value)
    return None


@api_bp.get("/leaderboard")
@api_bp.get("/api/game/leaderboard")
def leaderboard():
    # scope: all (mặc định) | chapter-1 | level-101… (SUTA-DB-01) | quiz (SUTA-QUIZ-LB).
    # `me` = hàng của người đang đăng nhập (kể cả ngoài top). Trang chủ chỉ hiện
    # tab all / chapter-N / quiz; level-N vẫn nhận cho tương thích.
    if request.args.get("scope") == "quiz":
        try:
            board = get_quiz_leaderboard(limit=LEADERBOARD_LIMIT, user_id=session.get("user_id"))
            return jsonify({"status": "success", "kind": "quiz", **board})
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500
    scope = parse_scope(request.args.get("scope", "all"))
    if scope is None:
        return payload_error("scope không hợp lệ."), 400
    try:
        board = get_leaderboard(*scope, limit=LEADERBOARD_LIMIT, user_id=session.get("user_id"))
        return jsonify({"status": "success", "kind": "game", **board})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@api_bp.post("/api/quiz/result")
def quiz_result():
    # Kết quả 1 lượt trắc nghiệm ở /quiz (SUTA-QUIZ-LB). Người chơi lấy từ session;
    # khách -> 401 (trang quiz nhắc đăng nhập). Không thưởng vàng/KC.
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"status": "guest", "message": "Hãy đăng nhập để lưu kết quả."}), 401

    data = request.get_json(silent=True) or {}
    question_count = data.get("question_count")
    correct_count = data.get("correct_count")
    time_seconds = data.get("time_seconds")
    if not is_int(question_count, low=1, high=MAX_QUIZ_QUESTIONS):
        return payload_error("question_count không hợp lệ."), 400
    if not is_int(correct_count, high=question_count):
        return payload_error("correct_count không hợp lệ."), 400
    if not is_clear_time(time_seconds):
        return payload_error("time_seconds không hợp lệ."), 400

    try:
        save_quiz_result(user_id, question_count, correct_count, max(round(float(time_seconds), 2), 0.01))
        return jsonify({"status": "success"})
    except Exception as e:
        return payload_error(f"Có lỗi xảy ra: {str(e)}"), 500


@api_bp.get("/api/game/achievements")
def achievements():
    # Khách vẫn xem được danh mục (chưa mở cái nào).
    try:
        return jsonify({"status": "success", "data": list_achievements(session.get("user_id"))})
    except Exception as e:
        return payload_error(f"Có lỗi xảy ra: {str(e)}"), 500


@api_bp.get("/api/game/cleared-chapters")
def cleared_chapters_route():
    # Chương đã qua màn cuối -> trang chủ mở khoá chương kế tiếp. Khách -> 401
    # (trình duyệt dùng cờ localStorage `suta.cleared.<id>` do engine end-game.js đặt).
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"status": "guest"}), 401
    try:
        return jsonify({"status": "success", "chapters": cleared_chapters(user_id)})
    except Exception as e:
        return payload_error(f"Có lỗi xảy ra: {str(e)}"), 500


# ---- Tiến trình chương (SUTA-DB-01). Khách -> 401, trình duyệt dùng sessionStorage. ----

@api_bp.route("/api/game/progress/<int:chapter_id>", methods=["GET", "PUT", "DELETE"])
def progress(chapter_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"status": "guest"}), 401
    if chapter_id not in VALID_CHAPTER_IDS:
        return payload_error("Chương không tồn tại."), 404

    try:
        if request.method == "GET":
            # `owner`: progress.js biết bản lưu trong tab thuộc tài khoản nào.
            return jsonify({"status": "success", "owner": user_id,
                            "progress": get_progress(user_id, chapter_id)})
        if request.method == "DELETE":
            clear_progress(user_id, chapter_id)
            return jsonify({"status": "success"})

        data = parse_progress(request.get_json(silent=True), known_reward_ids(chapter_id))
        if data is None:
            return payload_error("Tiến trình không hợp lệ."), 400
        save_progress(user_id, chapter_id, data)
        return jsonify({"status": "success"})
    except Exception as e:
        return payload_error(f"Có lỗi xảy ra: {str(e)}"), 500
