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