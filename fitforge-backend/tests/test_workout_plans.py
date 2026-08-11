import pytest

from app.seed.exercises import seed_exercises


@pytest.fixture()
def seeded(db_session):
    seed_exercises(db_session)
    return db_session


@pytest.mark.parametrize(
    "days,expected_titles",
    [
        (1, ["Full Body"]),
        (2, ["Full Body A", "Full Body B"]),
        (3, ["Full Body A", "Full Body B", "Full Body C"]),
        (4, ["Upper A", "Lower A", "Upper B", "Lower B"]),
        (5, ["Upper A", "Lower A", "Upper B", "Lower B", "Upper C"]),
    ],
)
def test_generate_plan_matches_split_rules(seeded, client, auth_headers, days, expected_titles):
    resp = client.post(
        "/api/v1/workout-plans/generate", json={"days_per_week": days}, headers=auth_headers
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["days_per_week"] == days
    assert [d["title"] for d in body["plan_days"]] == expected_titles
    for day in body["plan_days"]:
        assert len(day["plan_day_exercises"]) > 0


def test_generate_plan_rejects_invalid_day_count(seeded, client, auth_headers):
    resp = client.post(
        "/api/v1/workout-plans/generate", json={"days_per_week": 6}, headers=auth_headers
    )
    assert resp.status_code == 422


def test_generate_plan_archives_previous_active_plan(seeded, client, auth_headers):
    first = client.post(
        "/api/v1/workout-plans/generate", json={"days_per_week": 3}, headers=auth_headers
    ).json()
    second = client.post(
        "/api/v1/workout-plans/generate", json={"days_per_week": 5}, headers=auth_headers
    ).json()
    assert first["id"] != second["id"]

    active = client.get("/api/v1/workout-plans/active", headers=auth_headers).json()
    assert active["id"] == second["id"]
    assert active["status"] == "active"


def test_get_active_plan_requires_auth(client):
    resp = client.get("/api/v1/workout-plans/active")
    assert resp.status_code == 401


def test_get_active_plan_not_found_when_none_generated(seeded, client, auth_headers):
    resp = client.get("/api/v1/workout-plans/active", headers=auth_headers)
    assert resp.status_code == 404


def test_generate_plan_respects_equipment_and_experience(seeded, client, auth_headers):
    client.patch(
        "/api/v1/users/me",
        headers=auth_headers,
        json={"experience_level": "advanced", "available_equipment": ["barbell", "dumbbell", "cable"]},
    )
    resp = client.post(
        "/api/v1/workout-plans/generate", json={"days_per_week": 5}, headers=auth_headers
    )
    assert resp.status_code == 201
    body = resp.json()
    equipment_used = {
        ex["exercise"]["equipment"]
        for day in body["plan_days"]
        for ex in day["plan_day_exercises"]
    }
    assert equipment_used <= {"barbell", "dumbbell", "cable", "bodyweight"}


def test_regenerated_plan_suggests_progressive_overload(seeded, client, auth_headers):
    plan = client.post(
        "/api/v1/workout-plans/generate", json={"days_per_week": 1}, headers=auth_headers
    ).json()
    pde = plan["plan_days"][0]["plan_day_exercises"][0]
    exercise_id = pde["exercise"]["id"]
    top_reps = int(pde["reps_range"].split("-")[1])

    # Hit the top of the prescribed rep range at 50kg -> next plan should
    # suggest a heavier target weight for the same exercise.
    client.post(
        "/api/v1/workout-logs/",
        headers=auth_headers,
        json={"sets": [{"exercise_id": exercise_id, "weight_kg": 50, "reps": top_reps, "set_number": 1}]},
    )

    regenerated = client.post(
        "/api/v1/workout-plans/generate", json={"days_per_week": 1}, headers=auth_headers
    ).json()
    new_pde = next(
        e
        for day in regenerated["plan_days"]
        for e in day["plan_day_exercises"]
        if e["exercise"]["id"] == exercise_id
    )
    assert new_pde["target_weight_kg"] > 50


def test_regenerated_plan_repeats_weight_when_rep_target_not_hit(seeded, client, auth_headers):
    plan = client.post(
        "/api/v1/workout-plans/generate", json={"days_per_week": 1}, headers=auth_headers
    ).json()
    pde = plan["plan_days"][0]["plan_day_exercises"][0]
    exercise_id = pde["exercise"]["id"]
    bottom_reps = int(pde["reps_range"].split("-")[0])

    client.post(
        "/api/v1/workout-logs/",
        headers=auth_headers,
        json={"sets": [{"exercise_id": exercise_id, "weight_kg": 50, "reps": bottom_reps, "set_number": 1}]},
    )

    regenerated = client.post(
        "/api/v1/workout-plans/generate", json={"days_per_week": 1}, headers=auth_headers
    ).json()
    new_pde = next(
        e
        for day in regenerated["plan_days"]
        for e in day["plan_day_exercises"]
        if e["exercise"]["id"] == exercise_id
    )
    assert new_pde["target_weight_kg"] == 50


def test_regenerated_plan_deprioritizes_frequently_skipped_exercise(seeded, client, auth_headers):
    client.patch(
        "/api/v1/users/me",
        headers=auth_headers,
        json={"available_equipment": ["barbell", "dumbbell", "machine", "cable"]},
    )
    plan = client.post(
        "/api/v1/workout-plans/generate", json={"days_per_week": 1}, headers=auth_headers
    ).json()
    pde_id = plan["plan_days"][0]["plan_day_exercises"][0]["id"]
    exercise_id = plan["plan_days"][0]["plan_day_exercises"][0]["exercise"]["id"]

    for _ in range(2):
        client.patch(
            f"/api/v1/workout-plans/plan-day-exercises/{pde_id}",
            headers=auth_headers,
            json={"skipped": True},
        )
        plan = client.post(
            "/api/v1/workout-plans/generate", json={"days_per_week": 1}, headers=auth_headers
        ).json()
        pde_id = plan["plan_days"][0]["plan_day_exercises"][0]["id"]

    final_ids = {
        e["exercise"]["id"] for day in plan["plan_days"] for e in day["plan_day_exercises"]
    }
    assert exercise_id not in final_ids
