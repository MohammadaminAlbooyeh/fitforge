def _create_exercise(client):
    resp = client.post(
        "/api/v1/exercises",
        json={"name": "Squat", "muscle_group": "legs", "instructions": "Stand tall."},
    )
    return resp.json()["id"]


def test_list_workouts_empty(client, auth_headers):
    resp = client.get("/api/v1/workouts/", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == []


def test_create_workout_with_exercises(client, auth_headers):
    exercise_id = _create_exercise(client)
    resp = client.post(
        "/api/v1/workouts/",
        headers=auth_headers,
        json={
            "name": "Leg Day",
            "exercises": [{"exercise_id": exercise_id, "sets": 4, "reps": 10}],
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["name"] == "Leg Day"
    assert len(body["exercises"]) == 1


def test_get_workout(client, auth_headers):
    exercise_id = _create_exercise(client)
    created = client.post(
        "/api/v1/workouts/",
        headers=auth_headers,
        json={"name": "Push Day", "exercises": [{"exercise_id": exercise_id}]},
    ).json()
    resp = client.get(f"/api/v1/workouts/{created['id']}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["name"] == "Push Day"


def test_workout_isolation(client, auth_headers):
    user_a = client.post(
        "/api/v1/auth/register",
        json={"email": "a@example.com", "full_name": "A", "password": "password123"},
    ).json()
    workout = client.post(
        "/api/v1/workouts/",
        headers={"Authorization": f"Bearer {user_a['access_token']}"},
        json={"name": "Private"},
    ).json()
    resp = client.get(f"/api/v1/workouts/{workout['id']}", headers=auth_headers)
    assert resp.status_code == 404


def test_delete_workout(client, auth_headers):
    workout = client.post(
        "/api/v1/workouts/", headers=auth_headers, json={"name": "Temp"}
    ).json()
    resp = client.delete(f"/api/v1/workouts/{workout['id']}", headers=auth_headers)
    assert resp.status_code == 204