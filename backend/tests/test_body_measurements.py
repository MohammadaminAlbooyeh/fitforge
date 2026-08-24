def test_list_measurements_empty(client, auth_headers):
    resp = client.get("/api/v1/body-measurements/", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == []


def test_create_and_get_measurement(client, auth_headers):
    resp = client.post(
        "/api/v1/body-measurements/",
        headers=auth_headers,
        json={
            "date": "2026-08-10",
            "weight_kg": 75.5,
            "body_fat_pct": 18.0,
            "chest_cm": 100,
            "waist_cm": 85,
            "arms_cm": 38,
            "thighs_cm": 58,
        },
    )
    assert resp.status_code == 201
    mid = resp.json()["id"]

    resp = client.get(f"/api/v1/body-measurements/{mid}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["weight_kg"] == 75.5


def test_update_measurement(client, auth_headers):
    created = client.post(
        "/api/v1/body-measurements/",
        headers=auth_headers,
        json={"date": "2026-08-10", "weight_kg": 80},
    ).json()
    mid = created["id"]

    resp = client.patch(
        f"/api/v1/body-measurements/{mid}",
        headers=auth_headers,
        json={"weight_kg": 79.5},
    )
    assert resp.status_code == 200
    assert resp.json()["weight_kg"] == 79.5


def test_delete_measurement(client, auth_headers):
    created = client.post(
        "/api/v1/body-measurements/",
        headers=auth_headers,
        json={"date": "2026-08-10", "weight_kg": 80},
    ).json()
    mid = created["id"]

    resp = client.delete(f"/api/v1/body-measurements/{mid}", headers=auth_headers)
    assert resp.status_code == 204

    resp = client.get(f"/api/v1/body-measurements/{mid}", headers=auth_headers)
    assert resp.status_code == 404


def test_measurements_require_auth(client):
    resp = client.get("/api/v1/body-measurements/")
    assert resp.status_code == 401

    resp = client.post("/api/v1/body-measurements/", json={"date": "2026-08-10"})
    assert resp.status_code == 401


def test_latest_and_trend(client, auth_headers):
    resp = client.get("/api/v1/body-measurements/latest", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() is None

    client.post(
        "/api/v1/body-measurements/",
        headers=auth_headers,
        json={"date": "2026-08-10", "weight_kg": 80},
    )

    resp = client.get("/api/v1/body-measurements/latest", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["weight_kg"] == 80

    resp = client.get("/api/v1/body-measurements/trend?days=90", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_cannot_access_other_users_measurement(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "owner@example.com", "full_name": "Owner", "password": "password123"},
    )
    owner_token = client.post(
        "/api/v1/auth/login", json={"email": "owner@example.com", "password": "password123"}
    ).json()["access_token"]
    owner = {"Authorization": f"Bearer {owner_token}"}

    client.post(
        "/api/v1/auth/register",
        json={"email": "other@example.com", "full_name": "Other", "password": "password123"},
    )
    other_token = client.post(
        "/api/v1/auth/login", json={"email": "other@example.com", "password": "password123"}
    ).json()["access_token"]
    other = {"Authorization": f"Bearer {other_token}"}

    created = client.post(
        "/api/v1/body-measurements/",
        headers=owner,
        json={"date": "2026-08-10", "weight_kg": 80},
    ).json()

    resp = client.get(f"/api/v1/body-measurements/{created['id']}", headers=other)
    assert resp.status_code == 404
