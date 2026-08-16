import hashlib
import hmac
import json

from app.config import get_settings


def _sign(secret: str, body: bytes) -> str:
    return "sha256=" + hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


def test_revenuecat_webhook_upgrades_user_to_pro(monkeypatch, client, auth_headers):
    get_settings.cache_clear()
    monkeypatch.setenv("REVENUECAT_WEBHOOK_SECRET", "test-secret")
    get_settings.cache_clear()

    user_id = client.get("/api/v1/users/me", headers=auth_headers).json()["id"]
    body = json.dumps(
        {
            "type": "INITIAL_PURCHASE",
            "appUserId": str(user_id),
            "productId": "fitforge_pro",
            "expirationAtMs": 1893456000000,
        }
    ).encode()

    resp = client.post(
        "/api/v1/webhooks/revenuecat",
        content=body,
        headers={
            "Content-Type": "application/json",
            "X-RevenueCat-Signature": _sign("test-secret", body),
        },
    )
    assert resp.status_code == 200

    entitlements = client.get("/api/v1/entitlements/me", headers=auth_headers).json()
    assert entitlements["plan"] == "PRO"
    assert entitlements["status"] == "ACTIVE"

    get_settings.cache_clear()


def test_revenuecat_webhook_rejects_invalid_signature(monkeypatch, client, auth_headers):
    get_settings.cache_clear()
    monkeypatch.setenv("REVENUECAT_WEBHOOK_SECRET", "test-secret")
    get_settings.cache_clear()

    body = json.dumps({"type": "INITIAL_PURCHASE", "appUserId": "1"}).encode()

    resp = client.post(
        "/api/v1/webhooks/revenuecat",
        content=body,
        headers={
            "Content-Type": "application/json",
            "X-RevenueCat-Signature": "sha256=deadbeef",
        },
    )
    assert resp.status_code == 401

    get_settings.cache_clear()
