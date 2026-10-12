"""TT-TIME-01: session đăng nhập + save-time. Không cần PostgreSQL — hàm
repository được thay bằng bản giả (monkeypatch) nên không ghi vào DB thật."""

import pytest

from backend import create_app
from backend.routes import api


USER = {"id": 7, "name": "Người Thử", "gold": 0, "gems": 0, "levels_cleared": 0, "avatar": "male"}


@pytest.fixture()
def client(monkeypatch):
    saved = []
    monkeypatch.setattr(api, "find_by_credentials",
                        lambda username, password: USER if (username, password) == ("thu", "matkhau") else None)
    monkeypatch.setattr(api, "find_by_id", lambda user_id: USER if user_id == USER["id"] else None)

    def fake_complete_level(user_id, level_id, clear_time, score, stats):
        saved.append((user_id, level_id, clear_time, score, stats))
        return {"first_clear": True, "gold_gained": 100, "gems_gained": 0, "new_achievements": []}

    monkeypatch.setattr(api, "complete_level", fake_complete_level)
    progress_saved = []
    monkeypatch.setattr(api, "known_reward_ids", lambda chapter_id: {"SK_LE_CHAN_ARROW_RAIN"})
    monkeypatch.setattr(api, "save_progress",
                        lambda user_id, chapter_id, data: progress_saved.append((user_id, chapter_id, data)))
    app = create_app()
    app.config.update(TESTING=True, SECRET_KEY="test-secret")
    test_client = app.test_client()
    test_client.saved = saved
    test_client.progress_saved = progress_saved
    return test_client


def login(client):
    response = client.post("/api/auth/login", json={"username": "thu", "password": "matkhau"})
    assert response.json["status"] == "success"


def test_me_follows_login_and_logout(client):
    assert client.get("/api/auth/me").json["status"] == "guest"
    login(client)
    me = client.get("/api/auth/me").json
    assert me["status"] == "success" and me["name"] == USER["name"]
    assert "id" not in me
    assert client.post("/api/auth/logout").json["status"] == "success"
    assert client.get("/api/auth/me").json["status"] == "guest"


def test_wrong_password_does_not_log_in(client):
    response = client.post("/api/auth/login", json={"username": "thu", "password": "sai"})
    assert response.json["status"] == "error"
    assert client.get("/api/auth/me").json["status"] == "guest"


def test_save_time_requires_session(client):
    response = client.post("/api/game/save-time", json={"username": "thu", "level_id": 101, "clear_time": 60})
    assert response.status_code == 401
    assert client.saved == []


def test_save_time_uses_session_user_not_payload(client):
    login(client)
    response = client.post("/api/game/save-time",
                           json={"username": "nguoi-khac", "level_id": 102, "clear_time": 83.25, "score": 1500})
    assert response.status_code == 200
    assert response.json["gold_gained"] == 100
    assert client.saved == [(USER["id"], 102, 83.25, 1500, {})]


def test_save_time_passes_stats(client):
    login(client)
    stats = {"hits_taken": 0, "quiz_correct": 4, "quiz_total": 4}
    response = client.post("/api/game/save-time", json={"level_id": 101, "clear_time": 60, "stats": stats})
    assert response.status_code == 200
    assert client.saved == [(USER["id"], 101, 60.0, 0, stats)]


@pytest.mark.parametrize("payload", [
    {"level_id": 1, "clear_time": 60},            # id cũ, không thuộc 101–103
    {"level_id": "101", "clear_time": 60},        # sai kiểu
    {"level_id": 101, "clear_time": 0},
    {"level_id": 101, "clear_time": -5},
    {"level_id": 101, "clear_time": 24 * 3600 + 1},
    {"level_id": 101, "clear_time": True},
    {"level_id": 101, "clear_time": 60, "score": -1},
    {"level_id": 101, "clear_time": 60, "score": 1.5},
    {"level_id": 101},
    {"level_id": 101, "clear_time": 60, "stats": []},
    {"level_id": 101, "clear_time": 60, "stats": {"hits_taken": -1}},
    {"level_id": 101, "clear_time": 60, "stats": {"hits_taken": 1.5}},
    {"level_id": 101, "clear_time": 60, "stats": {"unknown": 1}},
])
def test_save_time_rejects_bad_payload(client, payload):
    login(client)
    response = client.post("/api/game/save-time", json=payload)
    assert response.status_code == 400
    assert client.saved == []


# ---- Tiến trình chương (SUTA-DB-01) ----

GOOD_PROGRESS = {"score": 2500, "books": 5, "level1Complete": True, "level2Complete": False,
                 "level3Complete": False, "rewards": ["SK_LE_CHAN_ARROW_RAIN"], "times": {"1": 83.2}}


@pytest.mark.parametrize("method", ["get", "put", "delete"])
def test_progress_requires_session(client, method):
    response = getattr(client, method)("/api/game/progress/1", json=GOOD_PROGRESS)
    assert response.status_code == 401


def test_progress_unknown_chapter(client):
    login(client)
    assert client.get("/api/game/progress/9").status_code == 404


def test_progress_put_normalizes(client):
    login(client)
    response = client.put("/api/game/progress/1", json={**GOOD_PROGRESS, "extra": 1})
    assert response.status_code == 200
    assert client.progress_saved == [(USER["id"], 1, GOOD_PROGRESS)]


@pytest.mark.parametrize("patch", [
    {"score": -1},
    {"score": 1.5},
    {"books": 100},
    {"level2Complete": 1},
    {"rewards": ["KHONG_CO"]},
    {"rewards": ["SK_LE_CHAN_ARROW_RAIN", "SK_LE_CHAN_ARROW_RAIN"]},
    {"rewards": "SK_LE_CHAN_ARROW_RAIN"},
    {"times": {"4": 10}},
    {"times": {"1": 0}},
    {"times": []},
])
def test_progress_put_rejects_bad_payload(client, patch):
    login(client)
    response = client.put("/api/game/progress/1", json={**GOOD_PROGRESS, **patch})
    assert response.status_code == 400
    assert client.progress_saved == []


# ---- BXH + thành tựu (SUTA-DB-01) ----

@pytest.mark.parametrize("scope, expected", [
    ("all", (None, None)),
    ("chapter-1", (1, None)),
    ("level-103", (None, 103)),
])
def test_leaderboard_scope(client, monkeypatch, scope, expected):
    calls = []
    monkeypatch.setattr(api, "get_leaderboard", lambda chapter_id, level_id, limit, user_id: calls.append(
        (chapter_id, level_id, user_id)) or {"data": [], "me": None, "levels_total": 3})
    login(client)
    response = client.get(f"/api/game/leaderboard?scope={scope}")
    assert response.status_code == 200
    assert calls == [(*expected, USER["id"])]


@pytest.mark.parametrize("scope", ["chapter-2", "level-104", "level-", "level-abc", "foo", "chapter-1x"])
def test_leaderboard_bad_scope(client, scope):
    assert client.get(f"/api/game/leaderboard?scope={scope}").status_code == 400


# ---- Avatar (SUTA-DB-01, migration 002) ----

def test_change_avatar(client, monkeypatch):
    changed = []
    monkeypatch.setattr(api, "set_avatar", lambda user_id, avatar: changed.append((user_id, avatar)))
    assert client.post("/api/auth/avatar", json={"avatar": "female"}).status_code == 401
    login(client)
    for bad in ["robot", "", None, ["female"], {"a": 1}]:
        assert client.post("/api/auth/avatar", json={"avatar": bad}).status_code == 400
    response = client.post("/api/auth/avatar", json={"avatar": "female"})
    assert response.json == {"status": "success", "avatar": "female"}
    assert changed == [(USER["id"], "female")]


@pytest.mark.parametrize("avatar, ok", [(None, True), ("female", True), ("robot", False), (["male"], False)])
def test_register_avatar(client, monkeypatch, avatar, ok):
    created = []
    monkeypatch.setattr(api, "exists", lambda username: False)
    monkeypatch.setattr(api, "create", lambda *args: created.append(args))
    payload = {"username": "moi", "password": "x", "name": "Mới"}
    if avatar is not None:
        payload["avatar"] = avatar
    result = client.post("/api/auth/register", json=payload).json
    assert (result["status"] == "success") is ok
    assert created == ([("moi", "x", "Mới", avatar or "male")] if ok else [])
