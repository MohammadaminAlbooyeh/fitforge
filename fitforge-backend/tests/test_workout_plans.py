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
