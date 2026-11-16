"""Tests for the House Price Prediction API.

Run with: pytest
Requires models/house_price.pkl (and models/locations.json) to already exist --
i.e. the notebook must have been run and exported the model first.
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_predict_happy_path(client):
    payload = {
        "location": "thane",
        "carpet_area_sqft": 850,
        "floor_num": 3,
        "bathroom": 2,
        "balcony": 1,
        "furnishing": "Semi-Furnished",
        "transaction": "Resale",
        "ownership": "Freehold",
        "facing": "East",
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert "predicted_price" in body
    assert isinstance(body["predicted_price"], float)
    assert body["predicted_price"] > 0


def test_predict_invalid_input(client):
    # Missing required fields and a negative area -> 422 Unprocessable Entity
    payload = {
        "location": "thane",
        "carpet_area_sqft": -100,  # invalid: must be > 0
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422
