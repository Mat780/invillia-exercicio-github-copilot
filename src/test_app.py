import pytest
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert "Chess Club" in data
    assert "Programming Class" in data

def test_signup_for_activity_success():
    response = client.post("/activities/Chess Club/signup", params={"email": "testuser@mergington.edu"})
    assert response.status_code == 200
    assert "Signed up testuser@mergington.edu for Chess Club" in response.json()["message"]

    # Cleanup
    client.delete("/activities/Chess Club/signup", params={"email": "testuser@mergington.edu"})

def test_signup_for_activity_already_signed_up():
    email = "michael@mergington.edu"
    response = client.post("/activities/Chess Club/signup", params={"email": email})
    assert response.status_code == 400
    assert response.json()["detail"] == "Student already signed up"

def test_signup_for_activity_not_found():
    response = client.post("/activities/Nonexistent/signup", params={"email": "test@mergington.edu"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"

def test_cancel_signup_success():
    # First, sign up
    email = "canceltest@mergington.edu"
    client.post("/activities/Chess Club/signup", params={"email": email})
    # Now, cancel
    response = client.delete("/activities/Chess Club/signup", params={"email": email})
    assert response.status_code == 200
    assert f"Signup for {email} in Chess Club cancelled successfully" in response.json()["message"]

def test_cancel_signup_not_found():
    response = client.delete("/activities/Nonexistent/signup", params={"email": "test@mergington.edu"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"

def test_cancel_signup_student_not_signed_up():
    response = client.delete("/activities/Chess Club/signup", params={"email": "notinscribed@mergington.edu"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Student not signed up for this activity"
