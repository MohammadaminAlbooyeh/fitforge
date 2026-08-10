def test_create_and_list_exercises(client):
    resp = client.post(
        "/api/v1/exercises",
        json={"name": "Deadlift", "muscle_group": "back", "instructions": "Hinge."},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["name"] == "Deadlift"
    assert body["muscle_group"] == "back"

    list_resp = client.get("/api/v1/exercises/")
    assert list_resp.status_code == 200
    names = [e["name"] for e in list_resp.json()]
    assert "Deadlift" in names


def test_list_exercises_filters_by_muscle_group(client):
    client.post(
        "/api/v1/exercises",
        json={"name": "Curl", "muscle_group": "arms"},
    )
    client.post(
        "/api/v1/exercises",
        json={"name": "Squat", "muscle_group": "legs"},
    )

    resp = client.get("/api/v1/exercises/", params={"muscle_group": "legs"})
    assert resp.status_code == 200
    names = [e["name"] for e in resp.json()]
    assert names == ["Squat"]
