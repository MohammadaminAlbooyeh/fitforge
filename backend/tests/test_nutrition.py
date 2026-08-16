def _log(client, auth_headers, **overrides):
    payload = {
        "log_date": "2026-08-10",
        "meal": "lunch",
        "food_item": "Chicken salad",
        "calories": 450,
        "protein_g": 35,
        "carbs_g": 20,
        "fat_g": 20,
    }
    payload.update(overrides)
    return client.post("/api/v1/nutrition/", headers=auth_headers, json=payload)


def test_create_nutrition_entry(client, auth_headers):
    resp = _log(client, auth_headers)
    assert resp.status_code == 201
    assert resp.json()["food_item"] == "Chicken salad"


def test_daily_summary(client, auth_headers):
    _log(client, auth_headers)
    _log(client, auth_headers, food_item="Protein shake", calories=250, protein_g=30)
    resp = client.get(
        "/api/v1/nutrition/day?day=2026-08-10", headers=auth_headers
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["total_calories"] == 700
    assert body["total_protein_g"] == 65


def test_get_goal_not_set(client, auth_headers):
    resp = client.get("/api/v1/nutrition/goal", headers=auth_headers)
    assert resp.status_code == 404


def test_set_and_get_goal(client, auth_headers):
    resp = client.put(
        "/api/v1/nutrition/goal",
        headers=auth_headers,
        json={"daily_calories": 2200, "protein_g": 160, "carbs_g": 220, "fat_g": 70},
    )
    assert resp.status_code == 200
    assert resp.json()["daily_calories"] == 2200

    resp = client.get("/api/v1/nutrition/goal", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["protein_g"] == 160


def test_set_goal_upserts(client, auth_headers):
    client.put("/api/v1/nutrition/goal", headers=auth_headers, json={"daily_calories": 2000})
    resp = client.put("/api/v1/nutrition/goal", headers=auth_headers, json={"daily_calories": 2500})
    assert resp.status_code == 200
    assert resp.json()["daily_calories"] == 2500


def test_daily_summary_includes_goal_and_remaining(client, auth_headers):
    client.put(
        "/api/v1/nutrition/goal",
        headers=auth_headers,
        json={"daily_calories": 2000, "protein_g": 150},
    )
    _log(client, auth_headers, calories=500, protein_g=40)

    resp = client.get("/api/v1/nutrition/day?day=2026-08-10", headers=auth_headers)
    body = resp.json()
    assert body["goal_calories"] == 2000
    assert body["remaining_calories"] == 1500
    assert body["goal_protein_g"] == 150
    assert body["remaining_protein_g"] == 110
    assert body["goal_carbs_g"] is None


def test_entries_for_day(client, auth_headers):
    _log(client, auth_headers, meal="lunch")
    _log(client, auth_headers, food_item="Protein shake", meal="snack")
    _log(client, auth_headers, log_date="2026-08-11", food_item="Other day")

    resp = client.get("/api/v1/nutrition/day/entries?day=2026-08-10", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()
    assert len(items) == 2
    assert {item["food_item"] for item in items} == {"Chicken salad", "Protein shake"}


def test_update_entry(client, auth_headers):
    entry = _log(client, auth_headers, food_item="Salad").json()
    resp = client.patch(
        f"/api/v1/nutrition/{entry['id']}",
        headers=auth_headers,
        json={"calories": 300},
    )
    assert resp.status_code == 200
    assert resp.json()["calories"] == 300


def test_delete_entry(client, auth_headers):
    entry = _log(client, auth_headers).json()
    resp = client.delete(f"/api/v1/nutrition/{entry['id']}", headers=auth_headers)
    assert resp.status_code == 204