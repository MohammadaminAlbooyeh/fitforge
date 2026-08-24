def test_get_me_returns_profile(client, auth_headers):
    resp = client.get("/api/v1/users/me", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["email"] == "user@example.com"
    assert body["full_name"] == "Test User"


def test_update_me(client, auth_headers):
    resp = client.patch(
        "/api/v1/users/me",
        headers=auth_headers,
        json={"full_name": "Updated Name", "goal": "gain_muscle"},
    )
    assert resp.status_code == 200
    assert resp.json()["full_name"] == "Updated Name"
    assert resp.json()["goal"] == "gain_muscle"


def test_update_me_requires_auth(client):
    resp = client.patch("/api/v1/users/me", json={"full_name": "X"})
    assert resp.status_code == 401


def test_get_me_requires_auth(client):
    resp = client.get("/api/v1/users/me")
    assert resp.status_code == 401


def test_update_me_rejects_invalid_days_per_week(client, auth_headers):
    resp = client.patch(
        "/api/v1/users/me",
        headers=auth_headers,
        json={"available_days_per_week": 10},
    )
    assert resp.status_code == 422
