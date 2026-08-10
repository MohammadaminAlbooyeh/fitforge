import pytest

from app.seed.exercises import seed_exercises


@pytest.fixture()
def seeded(db_session):
    seed_exercises(db_session)
    return db_session


def _generate_plan(client, auth_headers, days=3):
    return client.post(
        "/api/v1/workout-plans/generate", json={"days_per_week": days}, headers=auth_headers
    ).json()


def test_create_and_list_workout_log(seeded, client, auth_headers):
    plan = _generate_plan(client, auth_headers)
    plan_day = plan["plan_days"][0]
    exercise_id = plan_day["plan_day_exercises"][0]["exercise"]["id"]

    resp = client.post(
        "/api/v1/workout-logs/",
        headers=auth_headers,
        json={
            "plan_day_id": plan_day["id"],
            "status": "completed",
            "sets": [
                {"exercise_id": exercise_id, "weight_kg": 40, "reps": 10, "set_number": 1},
                {"exercise_id": exercise_id, "weight_kg": 42.5, "reps": 8, "set_number": 2},
            ],
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["plan_day_id"] == plan_day["id"]
    assert len(body["log_sets"]) == 2

    list_resp = client.get("/api/v1/workout-logs/", headers=auth_headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1


def test_create_log_without_plan_day(seeded, client, auth_headers):
    plan = _generate_plan(client, auth_headers, days=1)
    exercise_id = plan["plan_days"][0]["plan_day_exercises"][0]["exercise"]["id"]

    resp = client.post(
        "/api/v1/workout-logs/",
        headers=auth_headers,
        json={"sets": [{"exercise_id": exercise_id, "reps": 12, "set_number": 1}]},
    )
    assert resp.status_code == 201
    assert resp.json()["plan_day_id"] is None


def test_create_log_rejects_other_users_plan_day(seeded, client, auth_headers):
    plan = _generate_plan(client, auth_headers)
    plan_day_id = plan["plan_days"][0]["id"]

    other = client.post(
        "/api/v1/auth/register",
        json={"email": "other@example.com", "full_name": "Other", "password": "password123"},
    ).json()
    other_headers = {"Authorization": f"Bearer {other['access_token']}"}

    resp = client.post(
        "/api/v1/workout-logs/",
        headers=other_headers,
        json={"plan_day_id": plan_day_id, "sets": []},
    )
    assert resp.status_code == 404


def test_workout_logs_require_auth(client):
    resp = client.get("/api/v1/workout-logs/")
    assert resp.status_code == 401
