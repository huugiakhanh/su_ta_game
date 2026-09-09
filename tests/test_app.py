import os

import pytest

from app import app


TEST_DATABASE_URL = os.getenv("SUTA_TEST_DATABASE_URL")
if not TEST_DATABASE_URL:
    pytest.skip("Cần SUTA_TEST_DATABASE_URL để chạy test PostgreSQL", allow_module_level=True)


@pytest.fixture()
def client():
    app.config.update(
        TESTING=True,
        DATABASE_URL=TEST_DATABASE_URL,
    )
    with app.app_context():
        from backend.db import init_db

        init_db()
    return app.test_client()


def test_pages_render(client):
    assert client.get("/").status_code == 200
    assert client.get("/history").status_code == 200
    assert client.get("/gameplay/level/Trung_Trac/trung-trac.html").status_code == 200


def test_auth_compatibility_routes(client):
    response = client.post("/login", json={"username": "admin", "password": "admin"})
    assert response.status_code == 200
    assert response.json["status"] == "success"

    response = client.post("/api/auth/login", json={"username": "admin", "password": "admin"})
    assert response.status_code == 200
    assert response.json["status"] == "success"
