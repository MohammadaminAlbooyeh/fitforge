def test_get_my_entitlements_defaults_to_free(client, auth_headers):
    resp = client.get("/api/v1/entitlements/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["plan"] == "FREE"


def test_daily_plan_requires_auth(client):
    resp = client.get("/api/v1/plans/daily")
    assert resp.status_code == 401


def test_daily_plan_returns_todays_plan(client, auth_headers):
    resp = client.get("/api/v1/plans/daily", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert 1 <= data["day"] <= 7
    assert data["weekday"]
    assert data["title"]
    assert isinstance(data["exercises"], list)
    assert len(data["exercises"]) > 0
    first = data["exercises"][0]
    assert first["name"]
    assert first["muscle_group"]
    assert first["sets"] >= 1
    assert first["reps"]


def test_daily_plan_offset_shifts_day(client, auth_headers):
    a = client.get("/api/v1/plans/daily", headers=auth_headers).json()
    b = client.get("/api/v1/plans/daily?offset=1", headers=auth_headers).json()
    assert a["day"] != b["day"]
    assert (a["day"] % 7) + 1 == b["day"]


def test_week_returns_seven_days(client, auth_headers):
    resp = client.get("/api/v1/plans/week", headers=auth_headers)
    assert resp.status_code == 200
    days = resp.json()
    assert len(days) == 7
    assert {d["day"] for d in days} == set(range(1, 8))


def test_pro_analytics_blocked_for_free_user(monkeypatch, client, auth_headers):
    from app.core import deps_entitlement
    from app.services.entitlement_client import Entitlements

    fake = Entitlements(user_id=1, plan="free", status="ACTIVE")
    monkeypatch.setattr(deps_entitlement, "get_entitlements", lambda db, user_id: fake)

    resp = client.get("/api/v1/analytics/summary", headers=auth_headers)
    assert resp.status_code == 402


def test_pro_analytics_blocked_by_default_free_plan(client, auth_headers):
    resp = client.get("/api/v1/analytics/summary", headers=auth_headers)
    assert resp.status_code == 402


def test_pro_analytics_allowed_for_pro_user(monkeypatch, client, auth_headers):
    from app.core import deps_entitlement
    from app.services.entitlement_client import Entitlements

    fake = Entitlements(user_id=1, plan="pro", status="ACTIVE")
    monkeypatch.setattr(deps_entitlement, "get_entitlements", lambda db, user_id: fake)

    resp = client.get("/api/v1/analytics/summary", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "total_workouts" in data
    assert "total_sessions" in data
    assert "total_sets" in data


def test_purchase_upgrades_to_pro(monkeypatch, client, auth_headers):
    from app.api.v1 import subscriptions
    from app.services.entitlement_client import Entitlements

    user_id = client.get("/api/v1/users/me", headers=auth_headers).json()["id"]

    called = {}

    def fake_purchase(db, uid, product_id=None):
        called["purchase"] = (uid, product_id)

    def fake_cancel(db, uid):
        called["cancel"] = uid

    def fake_get(db, uid):
        return Entitlements(user_id=uid, plan="pro", status="ACTIVE")

    monkeypatch.setattr(subscriptions.entitlement_client, "purchase", fake_purchase)
    monkeypatch.setattr(subscriptions.entitlement_client, "cancel", fake_cancel)
    monkeypatch.setattr(subscriptions.entitlement_client, "get_entitlements", fake_get)

    resp = client.post(
        "/api/v1/subscriptions/purchase",
        json={"productId": "fitforge_pro"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["plan"] == "PRO"
    assert called["purchase"] == (user_id, "fitforge_pro")

    resp2 = client.post("/api/v1/subscriptions/cancel", headers=auth_headers)
    assert resp2.status_code == 200
    assert called["cancel"] == user_id
