def test_get_gamification_summary(client, auth_headers):
    resp = client.get("/api/v1/gamification/summary", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "xp" in body
    assert "achievements" in body


def test_gamification_requires_auth(client):
    resp = client.get("/api/v1/gamification/summary")
    assert resp.status_code == 401
