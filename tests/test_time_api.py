"""TT-TIME-01: session đăng nhập + save-time. Không cần PostgreSQL — hàm
repository được thay bằng bản giả (monkeypatch) nên không ghi vào DB thật."""

import pytest

from backend import create_app
from backend.routes import api


USER = {"name": "Người Thử", "level": 1, "gold": 0, "gems": 0}


@pytest.fixture()
def client(monkeypatch):
    saved = []
    monkeypatch.setattr(api, "find_by_credentials",
                        lambda username, password: USER if (username, password) == ("thu", "matkhau") else None)
    monkeypatch.setattr(api, "find_by_username", lambda username: USER if username == "thu" else None)
    monkeypatch.setattr(api, "save_level_clear_time",
                        lambda username, level_id, clear_time, score=0: saved.append((username, level_id, clear_time, score)))
    app = create_app()
    app.config.update(TESTING=True, SECRET_KEY="test-secret")
    test_client = app.test_client()
    test_client.saved = saved
    return test_client


def login(client):
    response = client.post("/api/auth/login", json={"username": "thu", "password": "matkhau"})
    assert response.json["status"] == "success"


def test_me_follows_login_and_logout(client):
    assert client.get("/api/auth/me").json["status"] == "guest"
    login(client)
    me = client.get("/api/auth/me").json
    assert me["status"] == "success" and me["name"] == USER["name"]
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
    assert client.saved == [("thu", 102, 83.25, 1500)]


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
])
def test_save_time_rejects_bad_payload(client, payload):
    login(client)
    response = client.post("/api/game/save-time", json=payload)
    assert response.status_code == 400
    assert client.saved == []
