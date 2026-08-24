def _register(client, email="alice@example.com", name="Alice"):
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "full_name": name, "password": "password123"},
    )
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "password123"},
    )
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def _register_two(client):
    _register(client, "alice@example.com", "Alice")
    _register(client, "bob@example.com", "Bob")
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "alice@example.com", "password": "password123"},
    )
    alice = {"Authorization": f"Bearer {resp.json()['access_token']}"}
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "bob@example.com", "password": "password123"},
    )
    bob = {"Authorization": f"Bearer {resp.json()['access_token']}"}
    return alice, bob


def test_search_users(client):
    alice, _ = _register_two(client)
    resp = client.get("/api/v1/social/search?q=ali", headers=alice)
    assert resp.status_code == 200
    names = [u["full_name"] for u in resp.json()]
    assert "Alice" in names


def test_follow_and_unfollow(client):
    alice, bob = _register_two(client)
    resp = client.post("/api/v1/social/follow", headers=alice, json={"user_id": 2})
    assert resp.status_code == 200

    resp = client.get("/api/v1/social/following", headers=alice)
    assert resp.status_code == 200
    following = resp.json()
    assert len(following) == 1
    assert following[0]["full_name"] == "Bob"

    resp = client.delete("/api/v1/social/follow/2", headers=alice)
    assert resp.status_code == 200

    resp = client.get("/api/v1/social/following", headers=alice)
    assert resp.json() == []


def test_followers_and_profile(client):
    alice, bob = _register_two(client)
    client.post("/api/v1/social/follow", headers=alice, json={"user_id": 2})

    resp = client.get("/api/v1/social/followers", headers=bob)
    assert resp.status_code == 200
    followers = resp.json()
    assert len(followers) == 1
    assert followers[0]["full_name"] == "Alice"

    resp = client.get("/api/v1/social/profile/1", headers=bob)
    assert resp.status_code == 200
    assert resp.json()["full_name"] == "Alice"


def test_social_requires_auth(client):
    resp = client.get("/api/v1/social/search?q=a")
    assert resp.status_code == 401

    resp = client.post("/api/v1/social/follow", json={"user_id": 1})
    assert resp.status_code == 401


def test_profile_not_found(client):
    alice, _ = _register_two(client)
    resp = client.get("/api/v1/social/profile/999", headers=alice)
    assert resp.status_code == 404


def test_create_and_join_challenge(client):
    alice, bob = _register_two(client)
    resp = client.post(
        "/api/v1/social/challenges",
        headers=alice,
        json={
            "title": "30 Day Push",
            "description": "Do it",
            "target_workouts": 5,
            "start_date": "2026-01-01",
            "end_date": "2026-02-01",
        },
    )
    assert resp.status_code == 201
    challenge_id = resp.json()["id"]

    resp = client.post(f"/api/v1/social/challenges/{challenge_id}/join", headers=bob)
    assert resp.status_code == 200

    resp = client.get("/api/v1/social/challenges", headers=alice)
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    assert len(resp.json()[0]["participants"]) == 2

    resp = client.get(f"/api/v1/social/challenges/{challenge_id}", headers=bob)
    assert resp.status_code == 200
    assert resp.json()["id"] == challenge_id


def test_join_challenge_not_found(client):
    alice, _ = _register_two(client)
    resp = client.post("/api/v1/social/challenges/999/join", headers=alice)
    assert resp.status_code == 404


def test_get_challenge_not_found(client):
    alice, _ = _register_two(client)
    resp = client.get("/api/v1/social/challenges/999", headers=alice)
    assert resp.status_code == 404


def test_leaderboard_and_feed(client):
    alice, bob = _register_two(client)
    client.post("/api/v1/social/follow", headers=alice, json={"user_id": 2})

    resp = client.get("/api/v1/social/leaderboard", headers=alice)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

    resp = client.get("/api/v1/social/feed", headers=alice)
    assert resp.status_code == 200
    assert resp.json() == []
