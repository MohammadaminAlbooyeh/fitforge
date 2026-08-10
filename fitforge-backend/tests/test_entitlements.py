def test_get_my_entitlements_defaults_to_free_when_subscription_service_unavailable(client, auth_headers):
    me = client.get("/api/v1/users/me", headers=auth_headers)
    user_id = me.json()["id"]

    resp = client.get("/api/v1/entitlements/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["userId"] == user_id
    assert data["plan"] == "FREE"
    assert data["status"] == "ACTIVE"


def test_get_my_entitlements_requires_auth(client):
    resp = client.get("/api/v1/entitlements/me")
    assert resp.status_code == 401
