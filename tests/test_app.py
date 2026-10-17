import os

import pytest

from app import app


TEST_DATABASE_URL = os.getenv("SUTA_TEST_DATABASE_URL")
if not TEST_DATABASE_URL:
    pytest.skip("Cần SUTA_TEST_DATABASE_URL để chạy test PostgreSQL", allow_module_level=True)

from backend.db import db_cursor, run_migrations  # noqa: E402

# Bảng dữ liệu người chơi — xoá sạch trước mỗi test (danh mục seed giữ nguyên).
PLAYER_TABLES = "users, chapter_progress, chapter_progress_rewards, level_records, " \
                "user_level_stats, user_achievements, currency_transactions, quiz_results"


@pytest.fixture()
def client():
    app.config.update(
        TESTING=True,
        DATABASE_URL=TEST_DATABASE_URL,
    )
    with app.app_context():
        run_migrations()
        with db_cursor(commit=True) as (_, cursor):
            cursor.execute(f"TRUNCATE {PLAYER_TABLES} RESTART IDENTITY CASCADE")
    return app.test_client()


def register_and_login(client, username="thu", password="matkhau"):
    response = client.post("/api/auth/register", json={"username": username, "password": password, "name": "Người Thử", "gender": "male"})
    assert response.json["status"] == "success"
    response = client.post("/api/auth/login", json={"username": username, "password": password})
    assert response.json["status"] == "success"
    return response.json


def query(sql, params=()):
    with app.app_context(), db_cursor() as (_, cursor):
        cursor.execute(sql, params)
        return cursor.fetchall()


def save_time(client, level_id, clear_time, score=0, stats=None):
    payload = {"level_id": level_id, "clear_time": clear_time, "score": score}
    if stats is not None:
        payload["stats"] = stats
    response = client.post("/api/game/save-time", json=payload)
    assert response.status_code == 200, response.json
    return response.json


def test_pages_render(client):
    assert client.get("/").status_code == 200
    assert client.get("/history").status_code == 200
    assert client.get("/gameplay/level/Trung_Trac/trung-trac.html").status_code == 200
    assert client.get("/gameplay/levels/trung-trac/2").status_code == 200
    assert client.get("/gameplay/levels/trung-trac/3").status_code == 200
    assert client.get("/gameplay/levels/ba-trieu/3").status_code == 200


def test_migrations_are_idempotent(client):
    # T1: fixture đã chạy 1 lần; lần nữa không còn gì để chạy.
    with app.app_context():
        assert run_migrations() == []
    assert query("SELECT version FROM schema_migrations ORDER BY version") == [
        ("001_baseline",), ("002_user_avatar",), ("003_quiz_results",), ("004_user_gender",)]


def test_password_is_hashed_and_login_works(client):
    # T2
    user = register_and_login(client)
    assert user["name"] == "Người Thử" and "id" not in user
    stored = query("SELECT password_hash FROM users WHERE username = 'thu'")[0][0]
    assert "matkhau" not in stored
    assert client.post("/login", json={"username": "thu", "password": "sai"}).json["status"] == "error"


def test_duplicate_register_rejected(client):
    register_and_login(client)
    response = client.post("/api/auth/register", json={"username": "thu", "password": "khac"})
    assert response.json["status"] == "error"


def test_first_clear_reward_only_once(client):
    # T4: qua 101 hai lần -> thưởng màn (100 vàng) + TT_CLEAR_1 (50 vàng) đúng 1 lần.
    register_and_login(client)
    first = save_time(client, 101, 90.5, 1200, {"hits_taken": 2})
    assert first["first_clear"] is True
    assert first["gold_gained"] == 150
    assert [a["code"] for a in first["new_achievements"]] == ["TT_CLEAR_1"]

    second = save_time(client, 101, 80.25, 900, {"hits_taken": 1})
    assert second == {**second, "first_clear": False, "gold_gained": 0, "gems_gained": 0, "new_achievements": []}

    assert query("SELECT gold, gems FROM users") == [(150, 0)]
    best_time, best_score, clears = query("SELECT best_time, best_score, clear_count FROM user_level_stats")[0]
    assert (float(best_time), best_score, clears) == (80.25, 1200, 2)
    assert query("SELECT COUNT(*) FROM level_records") == [(2,)]
    me = client.get("/api/auth/me").json
    assert (me["gold"], me["levels_cleared"]) == (150, 1)


def test_achievements_from_stats_and_chapter(client):
    # T5
    register_and_login(client)
    result = save_time(client, 101, 100, 0, {"hits_taken": 0, "quiz_correct": 4, "quiz_total": 4})
    assert {a["code"] for a in result["new_achievements"]} == {"TT_CLEAR_1", "TT_FLAWLESS", "TT_SCHOLAR"}
    save_time(client, 102, 200)
    result = save_time(client, 103, 300)
    # Tổng 600 s < 15 phút -> Thần tốc; hết chương.
    assert {a["code"] for a in result["new_achievements"]} == {"TT_CHAPTER", "TT_SPEED"}
    # Lặp lại điều kiện không mở/cộng lần nữa.
    again = save_time(client, 101, 50, 0, {"hits_taken": 0})
    assert again["new_achievements"] == []
    gold, gems = query("SELECT gold, gems FROM users")[0]
    ledger_gold, ledger_gems = query("SELECT SUM(gold_delta), SUM(gems_delta) FROM currency_transactions")[0]
    assert (gold, gems) == (ledger_gold, ledger_gems) == (100 + 150 + 200 + 50 + 50, 5 + 10 + 5 + 5 + 5)


def test_leaderboard_uses_best_per_level(client):
    register_and_login(client, "a")
    save_time(client, 101, 100, 500)
    save_time(client, 101, 90, 300)
    client.post("/api/auth/logout")
    register_and_login(client, "b")
    save_time(client, 101, 120, 800)
    result = client.get("/api/game/leaderboard").json
    board = result["data"]
    assert [(row["rank"], row["total_score"], row["total_time"]) for row in board] == [(1, 800, 120.0), (2, 500, 90.0)]
    # Toàn game: 3 màn Trưng Trắc + 3 màn Bà Triệu (migration 005).
    assert result["me"]["rank"] == 1 and result["levels_total"] == 6


def test_leaderboard_scopes_and_me_outside_top(client):
    # T7: 12 người qua màn 101; người thứ 12 vẫn thấy hạng của mình ngoài top 10.
    for index in range(12):
        register_and_login(client, f"p{index:02d}")
        save_time(client, 101, 100, 1000 - index)
        client.post("/api/auth/logout")
    client.post("/api/auth/login", json={"username": "p11", "password": "matkhau"})
    save_time(client, 102, 50, 5)
    result = client.get("/api/game/leaderboard?scope=level-101").json
    assert len(result["data"]) == 10 and result["levels_total"] == 1
    assert result["me"]["rank"] == 12
    level2 = client.get("/api/game/leaderboard?scope=level-102").json
    assert [row["rank"] for row in level2["data"]] == [1] and level2["me"]["total_score"] == 5
    chapter = client.get("/api/game/leaderboard?scope=chapter-1").json
    assert chapter["me"]["levels_passed"] == 2 and chapter["levels_total"] == 3
    assert chapter["me"]["badges"] == "⚔️🤝"


def test_quiz_leaderboard_total_correct_then_time(client):
    # SUTA-QUIZ-LB: tổng câu đúng giảm dần, hoà thì tổng thời gian tăng dần.
    def quiz(count, correct, seconds):
        response = client.post("/api/quiz/result",
                               json={"question_count": count, "correct_count": correct, "time_seconds": seconds})
        assert response.status_code == 200

    register_and_login(client, "a")
    quiz(10, 6, 50)
    quiz(5, 4, 20)
    client.post("/api/auth/logout")
    register_and_login(client, "b")
    quiz(20, 10, 60)
    client.post("/api/auth/logout")
    register_and_login(client, "c")
    quiz(10, 9, 30)
    result = client.get("/api/game/leaderboard?scope=quiz").json
    assert result["kind"] == "quiz"
    assert [(row["rank"], row["total_correct"], row["total_time"], row["runs"]) for row in result["data"]] == [
        (1, 10, 60.0, 1), (2, 10, 70.0, 2), (3, 9, 30.0, 1)]
    assert result["me"]["rank"] == 3 and result["me"]["total_questions"] == 10


def test_ba_trieu_rewards_and_achievements(client):
    # BT-REWARD (migration 006): qua 3 màn chương 2 -> 120/180/240 vàng + 8 KC, 4 thành tựu BT_*.
    assert query("SELECT id, first_clear_gold, first_clear_gems FROM levels WHERE chapter_id = 2 ORDER BY id") == [
        (201, 120, 0), (202, 180, 0), (203, 240, 8)]
    register_and_login(client)
    first = save_time(client, 201, 200, 500, {"hits_taken": 3})
    assert first["gold_gained"] == 120 + 60
    assert [a["code"] for a in first["new_achievements"]] == ["BT_CLEAR_1"]
    assert [a["code"] for a in save_time(client, 202, 300)["new_achievements"]] == ["BT_CLEAR_2"]
    last = save_time(client, 203, 350)
    # Tổng 850 s < 15 phút -> thần tốc chương 2; không mở thành tựu chương 1.
    assert {a["code"] for a in last["new_achievements"]} == {"BT_CHAPTER", "BT_SPEED"}
    gold, gems = query("SELECT gold, gems FROM users")[0]
    assert (gold, gems) == (120 + 180 + 240 + 60 + 60, 8 + 12 + 6)


def test_achievements_list(client):
    guest = client.get("/api/game/achievements").json["data"]
    # 6 thành tựu chương 1 + 4 chương 2 (migration 006).
    assert len(guest) == 10 and not any(a["unlocked"] for a in guest)
    register_and_login(client)
    save_time(client, 101, 100, 0, {"hits_taken": 0})
    unlocked = {a["code"] for a in client.get("/api/game/achievements").json["data"] if a["unlocked"]}
    assert unlocked == {"TT_CLEAR_1", "TT_FLAWLESS"}


def test_progress_roundtrip(client):
    # T6
    register_and_login(client)
    assert client.get("/api/game/progress/1").json["progress"] is None
    data = {"score": 3000, "books": 5, "level1Complete": True, "level2Complete": True, "level3Complete": False,
            "rewards": ["SK_TRUNG_NHI_SHADOW", "BUFF_Y_CHI_KIEN_CUONG"], "times": {"1": 80.5, "2": 120}}
    assert client.put("/api/game/progress/1", json=data).status_code == 200
    got = client.get("/api/game/progress/1").json["progress"]
    assert {**got, "rewards": sorted(got["rewards"])} == {**data, "rewards": sorted(data["rewards"])}
    assert query("SELECT cleared_level FROM chapter_progress") == [(2,)]

    # Màn 1 thắng lại -> tiến trình MỚI, bỏ phần thưởng cũ.
    fresh = {**data, "level2Complete": False, "rewards": [], "times": {"1": 70}}
    client.put("/api/game/progress/1", json=fresh)
    assert client.get("/api/game/progress/1").json["progress"] == fresh
    assert query("SELECT COUNT(*) FROM chapter_progress_rewards") == [(0,)]

    assert client.delete("/api/game/progress/1").status_code == 200
    assert client.get("/api/game/progress/1").json["progress"] is None


def test_avatar_register_and_change(client):
    client.post("/api/auth/register", json={"username": "nu", "password": "matkhau", "name": "Nữ", "avatar": "female", "gender": "female"})
    assert client.post("/api/auth/login", json={"username": "nu", "password": "matkhau"}).json["avatar"] == "female"
    assert client.post("/api/auth/avatar", json={"avatar": "male"}).status_code == 200
    assert client.get("/api/auth/me").json["avatar"] == "male"
    register_and_login(client, "macdinh")
    assert client.get("/api/auth/me").json["avatar"] == "male"


def test_gender_register_and_change(client):
    # TT-HERO-01: giới tính lưu riêng; tài khoản cũ (NULL) đặt qua /api/auth/gender.
    register_and_login(client)
    assert client.get("/api/auth/me").json["gender"] == "male"
    assert client.post("/api/auth/gender", json={"gender": "female"}).status_code == 200
    assert client.get("/api/auth/me").json["gender"] == "female"
    query_commit = "UPDATE users SET gender = NULL WHERE username = 'thu'"
    with app.app_context(), db_cursor(commit=True) as (_, cursor):
        cursor.execute(query_commit)
    assert client.get("/api/auth/me").json["gender"] is None
    page = client.get("/gameplay/levels/trung-trac").get_data(as_text=True)
    assert 'data-gender=""' in page and 'data-logged-in="1"' in page
