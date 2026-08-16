from app.core import deps_entitlement
from app.services.entitlement_client import Entitlements


def _pro(monkeypatch):
    fake = Entitlements(user_id=1, plan="pro", status="ACTIVE")
    monkeypatch.setattr(deps_entitlement, "get_entitlements", lambda db, user_id: fake)


def test_analytics_summary_empty(monkeypatch, client, auth_headers):
    _pro(monkeypatch)
    resp = client.get("/api/v1/analytics/summary", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["total_workouts"] == 0
    assert body["total_sessions"] == 0
    assert body["total_sets"] == 0
    assert body["most_recent_workout"] is None


def test_analytics_summary_counts_workouts_and_sessions(monkeypatch, client, auth_headers):
    _pro(monkeypatch)

    exercise_id = client.post(
        "/api/v1/exercises",
        json={"name": "Row", "muscle_group": "back"},
    ).json()["id"]
    workout = client.post(
        "/api/v1/workouts/",
        headers=auth_headers,
        json={"name": "Pull Day", "exercises": [{"exercise_id": exercise_id}]},
    ).json()
    client.post(
        f"/api/v1/workouts/{workout['id']}/sessions",
        headers=auth_headers,
        json={"sets": [{"exercise_id": exercise_id, "reps": 10}, {"exercise_id": exercise_id, "reps": 8}]},
    )

    resp = client.get("/api/v1/analytics/summary", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["total_workouts"] == 1
    assert body["total_sessions"] == 1
    assert body["total_sets"] == 2
    assert body["most_recent_workout"] is not None
