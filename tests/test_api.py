import pytest
import os
import sys
import asyncio
from fastapi.testclient import TestClient

# Ensure backend path is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app import app
from database import init_db
from utils.auth import create_access_token
from datetime import timedelta
from analytics.progress_service import ProgressService
from datetime import datetime, date

client = TestClient(app)

# Test state shared across sequential flows
state = {}


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    # Explicitly create all database tables for testing
    asyncio.run(init_db())
    yield


def test_01_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_02_registration():
    response = client.post("/api/auth/register", json={
        "full_name": "Alice Developer",
        "username": "alice",
        "email": "alice@example.com",
        "password": "securepassword123"
    })
    assert response.status_code == 201
    assert response.json()["success"] is True
    state["user_alice"] = response.json()["data"]


def test_03_duplicate_registration_prevention():
    response = client.post("/api/auth/register", json={
        "full_name": "Alice Duplicate",
        "username": "alice",
        "email": "alice_different@example.com",
        "password": "password123"
    })
    assert response.status_code == 409

    # Duplicate email check
    response2 = client.post("/api/auth/register", json={
        "full_name": "Alice Dup Email",
        "username": "alicedup",
        "email": "alice@example.com",
        "password": "password123"
    })
    assert response2.status_code == 409


def test_04_login():
    response = client.post("/api/auth/login", json={
        "username_or_email": "alice",
        "password": "securepassword123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    state["token_alice"] = data["access_token"]
    state["headers_alice"] = {"Authorization": f"Bearer {data['access_token']}"}


def test_05_invalid_login():
    response = client.post("/api/auth/login", json={
        "username_or_email": "alice",
        "password": "wrongpassword"
    })
    assert response.status_code == 401


def test_06_unauthorized_api_access():
    response = client.get("/api/profile")
    assert response.status_code == 401


def test_07_profile_update():
    response = client.put("/api/profile", json={
        "full_name": "Alice Wonderland",
        "bio": "Enthusiastic photographer and programmer.",
        "interests": "Photography, Guitar, Coding"
    }, headers=state["headers_alice"])
    assert response.status_code == 200
    assert response.json()["full_name"] == "Alice Wonderland"
    assert response.json()["bio"] == "Enthusiastic photographer and programmer."


def test_08_create_skill():
    response = client.post("/api/skills", json={
        "skill_name": "Photography",
        "category": "Arts",
        "current_level": "BEGINNER",
        "target_level": "INTERMEDIATE",
        "description": "Portrait and nature photography"
    }, headers=state["headers_alice"])
    assert response.status_code == 201
    data = response.json()
    assert data["skill_name"] == "Photography"
    state["skill_id"] = data["id"]


def test_09_update_skill():
    response = client.put(f"/api/skills/{state['skill_id']}", json={
        "current_level": "INTERMEDIATE",
        "target_level": "ADVANCED"
    }, headers=state["headers_alice"])
    assert response.status_code == 200
    assert response.json()["current_level"] == "INTERMEDIATE"


def test_10_create_goal():
    response = client.post("/api/goals", json={
        "skill_id": state["skill_id"],
        "title": "Practice Photography for 20 hours",
        "target_value": 20.0,
        "unit": "hours",
        "milestones": [
            {"title": "5 Hours Practice", "target_value": 5.0},
            {"title": "10 Hours Practice", "target_value": 10.0}
        ]
    }, headers=state["headers_alice"])
    assert response.status_code == 201
    data = response.json()
    assert data["target_value"] == 20.0
    assert len(data["milestones"]) == 2
    state["goal_id"] = data["id"]
    state["milestone_1_id"] = data["milestones"][0]["id"]


def test_11_update_goal():
    response = client.put(f"/api/goals/{state['goal_id']}", json={
        "title": "Master Photography - 20 hours"
    }, headers=state["headers_alice"])
    assert response.status_code == 200
    assert response.json()["title"] == "Master Photography - 20 hours"


def test_12_create_milestone():
    response = client.post(f"/api/goals/{state['goal_id']}/milestones", json={
        "title": "20 Hours Completion",
        "target_value": 20.0
    }, headers=state["headers_alice"])
    assert response.status_code == 201
    assert response.json()["target_value"] == 20.0


def test_13_log_practice():
    # 60 minutes = 1.0 hour
    response = client.post("/api/practice", json={
        "skill_id": state["skill_id"],
        "duration_minutes": 60,
        "activity": "Practiced natural light portrait framing",
        "notes": "Focused on aperture priority mode"
    }, headers=state["headers_alice"])
    assert response.status_code == 201
    data = response.json()
    assert data["duration_minutes"] == 60
    state["practice_id"] = data["id"]


def test_14_progress_calculation():
    # Log 300 minutes (5 hours) to reach 6 total hours
    client.post("/api/practice", json={
        "skill_id": state["skill_id"],
        "duration_minutes": 300,
        "activity": "Outdoor shoot session"
    }, headers=state["headers_alice"])

    # Check goal progress
    response = client.get(f"/api/goals/{state['goal_id']}", headers=state["headers_alice"])
    assert response.status_code == 200
    goal = response.json()
    assert goal["current_value"] >= 6.0
    # 6 hours / 20 hours = 30% progress
    assert goal["progress_percent"] >= 30.0
    # Check if 5 hours milestone was automatically achieved
    m5 = next((m for m in goal["milestones"] if m["target_value"] == 5.0), None)
    assert m5 is not None
    assert m5["achieved"] is True


def test_15_streak_calculation():
    # Unit test streak calculation algorithm
    dates = [
        datetime(2026, 9, 21),
        datetime(2026, 9, 22),
        datetime(2026, 9, 23),
        datetime(2026, 9, 24)
    ]
    cur, longest = ProgressService.calculate_streaks(dates)
    assert cur >= 1
    assert longest >= 4


def test_16_file_validation():
    # Attempting to upload unsupported executable file
    files = {"file": ("malicious.exe", b"binary content", "application/x-msdownload")}
    response = client.post("/api/files/upload", files=files, headers=state["headers_alice"])
    assert response.status_code == 400


def test_17_file_upload():
    # Upload supported image file
    files = {"file": ("certificate.png", b"\x89PNG\r\n\x1a\nfakeimagecontent", "image/png")}
    response = client.post("/api/files/upload", data={"category": "achievement"}, files=files, headers=state["headers_alice"])
    assert response.status_code == 201
    data = response.json()
    assert "file_url" in data
    state["file_id"] = data["id"]
    state["file_url"] = data["file_url"]


def test_18_create_post():
    response = client.post("/api/posts", json={
        "skill_id": state["skill_id"],
        "content": "Just finished a 5-hour portrait shoot! Photography milestone unlocked.",
        "category": "Photography",
        "media_url": state.get("file_url")
    }, headers=state["headers_alice"])
    assert response.status_code == 201
    data = response.json()
    assert data["content"].startswith("Just finished")
    state["post_id"] = data["id"]


def test_19_community_feed():
    response = client.get("/api/feed")
    assert response.status_code == 200
    posts = response.json()
    assert len(posts) >= 1
    found = any(p["id"] == state["post_id"] for p in posts)
    assert found is True


def test_20_second_user_registration_and_like():
    # Register Bob
    reg_res = client.post("/api/auth/register", json={
        "full_name": "Bob Musician",
        "username": "bob",
        "email": "bob@example.com",
        "password": "bobpassword123"
    })
    assert reg_res.status_code == 201

    login_res = client.post("/api/auth/login", json={
        "username_or_email": "bob",
        "password": "bobpassword123"
    })
    assert login_res.status_code == 200
    state["headers_bob"] = {"Authorization": f"Bearer {login_res.json()['access_token']}"}
    state["user_bob"] = login_res.json()["user"]

    # Bob likes Alice's post
    like_res = client.post(f"/api/posts/{state['post_id']}/like", headers=state["headers_bob"])
    assert like_res.status_code == 200
    assert like_res.json()["like_count"] == 1


def test_21_duplicate_like_prevention():
    # Bob tries to like again -> Should return 409 Conflict
    like_res = client.post(f"/api/posts/{state['post_id']}/like", headers=state["headers_bob"])
    assert like_res.status_code == 409


def test_22_unlike():
    # Bob unlikes
    unlike_res = client.delete(f"/api/posts/{state['post_id']}/like", headers=state["headers_bob"])
    assert unlike_res.status_code == 200
    assert unlike_res.json()["like_count"] == 0

    # Bob re-likes for downstream state
    client.post(f"/api/posts/{state['post_id']}/like", headers=state["headers_bob"])


def test_23_add_comment():
    res = client.post(f"/api/posts/{state['post_id']}/comments", json={
        "content": "Awesome milestone Alice! The composition looks great."
    }, headers=state["headers_bob"])
    assert res.status_code == 201
    assert res.json()["content"].startswith("Awesome milestone")
    state["comment_id"] = res.json()["id"]


def test_24_unauthorized_comment_deletion():
    # Alice attempts to delete Bob's comment -> 403 Forbidden
    res = client.delete(f"/api/comments/{state['comment_id']}", headers=state["headers_alice"])
    assert res.status_code == 403


def test_25_delete_own_comment():
    # Bob deletes his own comment -> 200 OK
    res = client.delete(f"/api/comments/{state['comment_id']}", headers=state["headers_bob"])
    assert res.status_code == 200


def test_26_unauthorized_post_modification():
    # Bob tries to edit or delete Alice's post -> 403 Forbidden
    res1 = client.put(f"/api/posts/{state['post_id']}", json={"content": "Hacked content"}, headers=state["headers_bob"])
    assert res1.status_code == 403

    res2 = client.delete(f"/api/posts/{state['post_id']}", headers=state["headers_bob"])
    assert res2.status_code == 403


def test_27_follow_and_unfollow():
    # Bob follows Alice
    res = client.post(f"/api/users/{state['user_alice']['id']}/follow", headers=state["headers_bob"])
    assert res.status_code == 200

    # Check Alice's followers
    followers = client.get(f"/api/users/{state['user_alice']['id']}/followers").json()
    assert any(f["username"] == "bob" for f in followers)

    # Bob unfollows
    unf = client.delete(f"/api/users/{state['user_alice']['id']}/follow", headers=state["headers_bob"])
    assert unf.status_code == 200


def test_28_user_data_isolation():
    # Bob should not see Alice's private skills or goals when querying his own
    bob_skills = client.get("/api/skills", headers=state["headers_bob"]).json()
    assert len(bob_skills) == 0

    bob_goals = client.get("/api/goals", headers=state["headers_bob"]).json()
    assert len(bob_goals) == 0


def test_29_analytics_endpoints():
    res = client.get("/api/analytics/dashboard", headers=state["headers_alice"])
    assert res.status_code == 200
    data = res.json()
    assert data["stats"]["active_skills"] >= 1
    assert data["stats"]["total_practice_hours"] > 0

    res_practice = client.get("/api/analytics/practice", headers=state["headers_alice"])
    assert res_practice.status_code == 200

    res_skills = client.get("/api/analytics/skills", headers=state["headers_alice"])
    assert res_skills.status_code == 200


def test_30_token_expiry_handling():
    # Generate an expired token
    expired_token = create_access_token({"sub": state["user_alice"]["id"]}, expires_delta=timedelta(seconds=-10))
    res = client.get("/api/profile", headers={"Authorization": f"Bearer {expired_token}"})
    assert res.status_code == 401


def test_31_logout():
    res = client.post("/api/auth/logout", headers=state["headers_alice"])
    assert res.status_code == 200


def test_32_error_handling_structure():
    # Access non-existent resource
    res = client.get("/api/skills/non-existent-id-12345", headers=state["headers_alice"])
    assert res.status_code == 404
    data = res.json()
    assert "success" in data
    assert data["success"] is False
    assert "message" in data
