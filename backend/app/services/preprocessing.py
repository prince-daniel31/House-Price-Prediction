"""Turn a validated PredictionRequest into the one-row DataFrame the model expects.

The exported model is a full scikit-learn Pipeline (imputation + scaling + one-hot
encoding all bundled in), so we only need to hand it a DataFrame with exactly the
column names used at training time -- no manual encoding required here.
"""
import json
from pathlib import Path

import pandas as pd

from app.schemas.prediction import PredictionRequest

MODELS_DIR = Path(__file__).resolve().parents[2] / "models"
_LOCATIONS_PATH = MODELS_DIR / "locations.json"

try:
    with open(_LOCATIONS_PATH, encoding="utf-8") as f:
        KNOWN_LOCATIONS: set[str] = set(json.load(f))
except FileNotFoundError:
    # Falls back gracefully; every location will map to "other" until the file is copied in.
    KNOWN_LOCATIONS = set()

# Must match `numeric_features + categorical_features` from the training notebook.
NUMERIC_FEATURES = ["carpet_area_sqft", "floor_num", "bathroom", "balcony"]
CATEGORICAL_FEATURES = ["location_grouped", "Furnishing", "Transaction", "Ownership", "facing"]


def request_to_dataframe(payload: PredictionRequest) -> pd.DataFrame:
    """Build a single-row DataFrame with exactly the columns the model was trained on."""
    location_grouped = payload.location if payload.location in KNOWN_LOCATIONS else "other"

    row = {
        "carpet_area_sqft": payload.carpet_area_sqft,
        "floor_num": payload.floor_num,
        "bathroom": payload.bathroom,
        "balcony": payload.balcony,
        "location_grouped": location_grouped,
        "Furnishing": payload.furnishing,
        "Transaction": payload.transaction,
        "Ownership": payload.ownership,
        "facing": payload.facing,
    }
    return pd.DataFrame([row], columns=NUMERIC_FEATURES + CATEGORICAL_FEATURES)
