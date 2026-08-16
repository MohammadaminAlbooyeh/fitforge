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


def test_first_set_and_progressive_overload_flagged_as_pr(seeded, client, auth_headers):
    plan = _generate_plan(client, auth_headers, days=1)
    exercise_id = plan["plan_days"][0]["plan_day_exercises"][0]["exercise"]["id"]

    first = client.post(
        "/api/v1/workout-logs/",
        headers=auth_headers,
        json={"sets": [{"exercise_id": exercise_id, "weight_kg": 40, "reps": 10, "set_number": 1}]},
    ).json()
    assert first["log_sets"][0]["is_personal_record"] is True

    second = client.post(
        "/api/v1/workout-logs/",
        headers=auth_headers,
        json={
            "sets": [
                {"exercise_id": exercise_id, "weight_kg": 35, "reps": 10, "set_number": 1},
                {"exercise_id": exercise_id, "weight_kg": 45, "reps": 8, "set_number": 2},
            ]
        },
    ).json()
    assert second["log_sets"][0]["is_personal_record"] is False
    assert second["log_sets"][1]["is_personal_record"] is True


def test_pr_tracked_independently_per_exercise(seeded, client, auth_headers):
    plan = _generate_plan(client, auth_headers, days=1)
    exercises = plan["plan_days"][0]["plan_day_exercises"]
    assert len(exercises) >= 2
    ex_a, ex_b = exercises[0]["exercise"]["id"], exercises[1]["exercise"]["id"]

    resp = client.post(
        "/api/v1/workout-logs/",
        headers=auth_headers,
        json={
            "sets": [
                {"exercise_id": ex_a, "weight_kg": 50, "reps": 10, "set_number": 1},
                {"exercise_id": ex_b, "weight_kg": 20, "reps": 10, "set_number": 1},
            ]
        },
    ).json()
    assert all(s["is_personal_record"] for s in resp["log_sets"])


def test_skip_plan_day_exercise(seeded, client, auth_headers):
    plan = _generate_plan(client, auth_headers, days=1)
    pde_id = plan["plan_days"][0]["plan_day_exercises"][0]["id"]

    resp = client.patch(
        f"/api/v1/workout-plans/plan-day-exercises/{pde_id}",
        headers=auth_headers,
        json={"skipped": True},
    )
    assert resp.status_code == 200
    assert resp.json()["skipped"] is True

    active = client.get("/api/v1/workout-plans/active", headers=auth_headers).json()
    assert active["plan_days"][0]["plan_day_exercises"][0]["skipped"] is True


def test_replace_plan_day_exercise(seeded, client, auth_headers):
    plan = _generate_plan(client, auth_headers, days=1)
    exercises = plan["plan_days"][0]["plan_day_exercises"]
    pde_id = exercises[0]["id"]
    original_id = exercises[0]["exercise"]["id"]
    replacement_id = next(e["exercise"]["id"] for e in exercises if e["exercise"]["id"] != original_id)

    resp = client.patch(
        f"/api/v1/workout-plans/plan-day-exercises/{pde_id}",
        headers=auth_headers,
        json={"exercise_id": replacement_id},
    )
    assert resp.status_code == 200
    assert resp.json()["exercise"]["id"] == replacement_id


def test_replace_plan_day_exercise_rejects_unknown_exercise(seeded, client, auth_headers):
    plan = _generate_plan(client, auth_headers, days=1)
    pde_id = plan["plan_days"][0]["plan_day_exercises"][0]["id"]

    resp = client.patch(
        f"/api/v1/workout-plans/plan-day-exercises/{pde_id}",
        headers=auth_headers,
        json={"exercise_id": 999999},
    )
    assert resp.status_code == 404


def test_personal_records_endpoint_returns_only_flagged_sets_newest_first(seeded, client, auth_headers):
    plan = _generate_plan(client, auth_headers, days=1)
    exercise_id = plan["plan_days"][0]["plan_day_exercises"][0]["exercise"]["id"]

    client.post(
        "/api/v1/workout-logs/",
        headers=auth_headers,
        json={
            "completed_at": "2026-08-01",
            "sets": [{"exercise_id": exercise_id, "weight_kg": 40, "reps": 10, "set_number": 1}],
        },
    )
    client.post(
        "/api/v1/workout-logs/",
        headers=auth_headers,
        json={
            "completed_at": "2026-08-05",
            "sets": [
                {"exercise_id": exercise_id, "weight_kg": 30, "reps": 10, "set_number": 1},
                {"exercise_id": exercise_id, "weight_kg": 45, "reps": 8, "set_number": 2},
            ],
        },
    )

    resp = client.get("/api/v1/workout-logs/personal-records", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert len(body) == 2
    assert body[0]["completed_at"] == "2026-08-05"
    assert body[0]["weight_kg"] == 45
    assert body[0]["exercise"]["id"] == exercise_id
    assert body[1]["completed_at"] == "2026-08-01"
    assert body[1]["weight_kg"] == 40


def test_personal_records_scoped_to_user(seeded, client, auth_headers):
    plan = _generate_plan(client, auth_headers, days=1)
    exercise_id = plan["plan_days"][0]["plan_day_exercises"][0]["exercise"]["id"]
    client.post(
        "/api/v1/workout-logs/",
        headers=auth_headers,
        json={"sets": [{"exercise_id": exercise_id, "weight_kg": 40, "reps": 10, "set_number": 1}]},
    )

    other = client.post(
        "/api/v1/auth/register",
        json={"email": "other3@example.com", "full_name": "Other", "password": "password123"},
    ).json()
    other_headers = {"Authorization": f"Bearer {other['access_token']}"}

    resp = client.get("/api/v1/workout-logs/personal-records", headers=other_headers)
    assert resp.status_code == 200
    assert resp.json() == []


def test_personal_records_require_auth(client):
    resp = client.get("/api/v1/workout-logs/personal-records")
    assert resp.status_code == 401


def test_next_set_suggestion_no_history(seeded, client, auth_headers):
    plan = _generate_plan(client, auth_headers, days=1)
    exercise_id = plan["plan_days"][0]["plan_day_exercises"][0]["exercise"]["id"]

    resp = client.get(
        f"/api/v1/workout-logs/next-set-suggestion/{exercise_id}", headers=auth_headers
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["exercise_id"] == exercise_id
    assert body["target_weight_kg"] is None
    assert "no previous sets" in body["reasoning"].lower()


def test_next_set_suggestion_bumps_weight_after_topping_out(seeded, client, auth_headers):
    plan = _generate_plan(client, auth_headers, days=1)
    pde = plan["plan_days"][0]["plan_day_exercises"][0]
    exercise_id = pde["exercise"]["id"]
    top_reps = int(pde["reps_range"].split("-")[1])

    client.post(
        "/api/v1/workout-logs/",
        headers=auth_headers,
        json={"sets": [{"exercise_id": exercise_id, "weight_kg": 50, "reps": top_reps, "set_number": 1}]},
    )

    resp = client.get(
        f"/api/v1/workout-logs/next-set-suggestion/{exercise_id}", headers=auth_headers
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["target_weight_kg"] > 50


def test_next_set_suggestion_unknown_exercise(client, auth_headers):
    resp = client.get("/api/v1/workout-logs/next-set-suggestion/999999", headers=auth_headers)
    assert resp.status_code == 404


def test_workout_log_client_id_is_idempotent(seeded, client, auth_headers):
    plan = _generate_plan(client, auth_headers, days=1)
    exercise_id = plan["plan_days"][0]["plan_day_exercises"][0]["exercise"]["id"]
    payload = {
        "client_id": "offline-uuid-1",
        "sets": [{"exercise_id": exercise_id, "weight_kg": 40, "reps": 10, "set_number": 1}],
    }

    first = client.post("/api/v1/workout-logs/", headers=auth_headers, json=payload)
    second = client.post("/api/v1/workout-logs/", headers=auth_headers, json=payload)
    assert first.status_code == 201
    assert second.status_code == 201
    assert first.json()["id"] == second.json()["id"]

    list_resp = client.get("/api/v1/workout-logs/", headers=auth_headers)
    assert len(list_resp.json()) == 1


def test_update_plan_day_exercise_rejects_other_users(seeded, client, auth_headers):
    plan = _generate_plan(client, auth_headers, days=1)
    pde_id = plan["plan_days"][0]["plan_day_exercises"][0]["id"]

    other = client.post(
        "/api/v1/auth/register",
        json={"email": "other2@example.com", "full_name": "Other", "password": "password123"},
    ).json()
    other_headers = {"Authorization": f"Bearer {other['access_token']}"}

    resp = client.patch(
        f"/api/v1/workout-plans/plan-day-exercises/{pde_id}",
        headers=other_headers,
        json={"skipped": True},
    )
    assert resp.status_code == 404
