def test_register_success(client):
    resp = client.post(
        "/api/v1/auth/register",
        json={"email": "new@example.com", "full_name": "New User", "password": "password123"},
    )
    assert resp.status_code == 201
    assert "access_token" in resp.json()


def test_register_duplicate_email(client, auth_headers):
    resp = client.post(
        "/api/v1/auth/register",
        json={"email": "user@example.com", "full_name": "Duplicate", "password": "password123"},
    )
    assert resp.status_code == 409


def test_login_success(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "login@example.com", "full_name": "Login", "password": "password123"},
    )
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "password123"},
    )
    assert resp.status_code == 200
    assert resp.json()["token_type"] == "bearer"


def test_login_wrong_password(client):
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "wrong"},
    )
    assert resp.status_code == 401


def test_get_me_unauthorized(client):
    resp = client.get("/api/v1/users/me")
    assert resp.status_code == 401


def test_get_me_authorized(client, auth_headers):
    resp = client.get("/api/v1/users/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "user@example.com"