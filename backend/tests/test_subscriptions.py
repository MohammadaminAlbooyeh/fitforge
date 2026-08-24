def test_purchase_upgrades_to_pro(monkeypatch, client, auth_headers):
    from app.api.v1 import subscriptions
    from app.services.entitlement_client import Entitlements

    def fake_purchase(db, uid, product_id=None):
        pass

    def fake_get(db, uid):
        return Entitlements(user_id=uid, plan="pro", status="ACTIVE", store_product_id="com.fitforge.pro")

    monkeypatch.setattr(subscriptions.entitlement_client, "purchase", fake_purchase)
    monkeypatch.setattr(subscriptions.entitlement_client, "get_entitlements", fake_get)

    resp = client.post("/api/v1/subscriptions/purchase", headers=auth_headers, json={"productId": "pro"})
    assert resp.status_code == 200
    assert resp.json()["plan"] == "PRO"


def test_cancel_subscription(monkeypatch, client, auth_headers):
    from app.api.v1 import subscriptions
    from app.services.entitlement_client import Entitlements

    def fake_cancel(db, uid):
        pass

    def fake_get(db, uid):
        return Entitlements(user_id=uid, plan="free", status="CANCELLED")

    monkeypatch.setattr(subscriptions.entitlement_client, "cancel", fake_cancel)
    monkeypatch.setattr(subscriptions.entitlement_client, "get_entitlements", fake_get)

    resp = client.post("/api/v1/subscriptions/cancel", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["plan"] == "FREE"


def test_subscriptions_require_auth(client):
    resp = client.post("/api/v1/subscriptions/purchase", json={})
    assert resp.status_code == 401

    resp = client.post("/api/v1/subscriptions/cancel")
    assert resp.status_code == 401
