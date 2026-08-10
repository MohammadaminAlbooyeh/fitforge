def _create_exercise(client):
    resp = client.post(
        "/api/v1/exercises",
        json={"name": "Bench Press", "muscle_group": "chest", "instructions": "Push."},
    )
    return resp.json()["id"]


def _create_workout(client, auth_headers, exercise_id):
    return client.post(
        "/api/v1/workouts/",
        headers=auth_headers,
        json={"name": "Push Day", "exercises": [{"exercise_id": exercise_id}]},
    ).json()


def test_create_and_list_sessions(client, auth_headers):
    exercise_id = _create_exercise(client)
    workout = _create_workout(client, auth_headers, exercise_id)

    resp = client.post(
        f"/api/v1/workouts/{workout['id']}/sessions",
        headers=auth_headers,
        json={"notes": "Felt strong", "sets": [{"exercise_id": exercise_id, "reps": 8, "weight_kg": 60}]},
    )
    assert resp.status_code == 201
    session = resp.json()
    assert session["workout_id"] == workout["id"]
    assert session["notes"] == "Felt strong"

    list_resp = client.get(f"/api/v1/workouts/{workout['id']}/sessions", headers=auth_headers)
    assert list_resp.status_code == 200
    sessions = list_resp.json()
    assert len(sessions) == 1
    assert sessions[0]["id"] == session["id"]


def test_list_sessions_empty(client, auth_headers):
    exercise_id = _create_exercise(client)
    workout = _create_workout(client, auth_headers, exercise_id)

    resp = client.get(f"/api/v1/workouts/{workout['id']}/sessions", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == []


def test_list_sessions_not_found_for_other_users_workout(client, auth_headers):
    exercise_id = _create_exercise(client)
    workout = _create_workout(client, auth_headers, exercise_id)

    other = client.post(
        "/api/v1/auth/register",
        json={"email": "other@example.com", "full_name": "Other", "password": "password123"},
    ).json()
    other_headers = {"Authorization": f"Bearer {other['access_token']}"}

    resp = client.get(f"/api/v1/workouts/{workout['id']}/sessions", headers=other_headers)
    assert resp.status_code == 404


def test_create_session_not_found_for_missing_workout(client, auth_headers):
    resp = client.post(
        "/api/v1/workouts/999999/sessions",
        headers=auth_headers,
        json={"sets": []},
    )
    assert resp.status_code == 404
