def test_send_test_notification(monkeypatch, client, auth_headers):
    from app.api.v1 import notifications

    called = {}

    def fake_reminder(email, workout_name):
        called["email"] = email
        called["workout_name"] = workout_name

    monkeypatch.setattr(notifications, "send_workout_reminder", fake_reminder)

    resp = client.post(
        "/api/v1/notifications/test",
        headers=auth_headers,
        params={"workout_name": "Leg Day"},
    )
    assert resp.status_code == 202
    assert resp.json() == {"status": "queued"}
    assert called["workout_name"] == "Leg Day"
    assert called["email"] == "user@example.com"


def test_send_test_notification_requires_auth(client):
    resp = client.post("/api/v1/notifications/test", params={"workout_name": "Leg Day"})
    assert resp.status_code == 401
