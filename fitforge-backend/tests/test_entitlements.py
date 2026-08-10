def test_get_my_entitlements_returns_503_when_subscription_service_unavailable(client, auth_headers):
    resp = client.get("/api/v1/entitlements/me", headers=auth_headers)
    assert resp.status_code == 503


def test_get_my_entitlements_requires_auth(client):
    resp = client.get("/api/v1/entitlements/me")
    assert resp.status_code == 401


def test_pro_analytics_blocked_for_free_user(monkeypatch, client, auth_headers):
    from app.core import deps_entitlement
    from app.services.entitlement_client import Entitlements

    fake = Entitlements(user_id=1, plan="free", status="ACTIVE")
    monkeypatch.setattr(deps_entitlement, "get_entitlements", lambda user_id: fake)

    resp = client.get("/api/v1/analytics/summary", headers=auth_headers)
    assert resp.status_code == 402


def test_pro_analytics_returns_503_when_subscription_service_unavailable(client, auth_headers):
    resp = client.get("/api/v1/analytics/summary", headers=auth_headers)
    assert resp.status_code == 503


def test_pro_analytics_allowed_for_pro_user(monkeypatch, client, auth_headers):
    from app.core import deps_entitlement
    from app.services.entitlement_client import Entitlements

    fake = Entitlements(user_id=1, plan="pro", status="ACTIVE")
    monkeypatch.setattr(deps_entitlement, "get_entitlements", lambda user_id: fake)

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

    def fake_purchase(uid, product_id=None):
        called["purchase"] = (uid, product_id)

    def fake_cancel(uid):
        called["cancel"] = uid

    def fake_get(uid):
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
