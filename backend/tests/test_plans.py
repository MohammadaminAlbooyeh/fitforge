def test_get_daily_plan_requires_auth(client):
    resp = client.get("/api/v1/plans/daily")
    assert resp.status_code == 401


def test_get_week_requires_auth(client):
    resp = client.get("/api/v1/plans/week")
    assert resp.status_code == 401


def test_get_daily_plan_returns_exercises(client, auth_headers):
    resp = client.get("/api/v1/plans/daily?offset=0", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["day"] in range(1, 8)
    assert len(body["exercises"]) > 0


def test_get_week_returns_seven_days(client, auth_headers):
    resp = client.get("/api/v1/plans/week", headers=auth_headers)
    assert resp.status_code == 200
    week = resp.json()
    assert len(week) == 7
    assert all("exercises" in day for day in week)


def test_get_daily_plan_rejects_invalid_offset(client, auth_headers):
    resp = client.get("/api/v1/plans/daily?offset=7", headers=auth_headers)
    assert resp.status_code == 422
