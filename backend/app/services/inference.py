"""Loads the trained scikit-learn Pipeline and runs predictions.

The model was trained on log1p(price) (see notebook section 2.4), so we invert
with expm1 here to return a price in plain rupees.
"""
import logging

import joblib
import numpy as np

from app.schemas.prediction import PredictionRequest
from app.services.preprocessing import request_to_dataframe

logger = logging.getLogger(__name__)


class ModelService:
    """Wraps the pickled pipeline. Instantiated ONCE at app startup (see main.py lifespan)."""

    def __init__(self, model_path: str):
        logger.info("Loading model from %s", model_path)
        self.model = joblib.load(model_path)
        logger.info("Model loaded successfully.")

    def predict(self, payload: PredictionRequest) -> float:
        row = request_to_dataframe(payload)
        pred_log_price = self.model.predict(row)[0]
        predicted_price = float(np.expm1(pred_log_price))
        return predicted_price
