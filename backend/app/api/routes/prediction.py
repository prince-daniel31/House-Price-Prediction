"""GET /health and POST /predict endpoints."""
from fastapi import APIRouter, HTTPException, Request

from app.schemas.prediction import HealthResponse, PredictionRequest, PredictionResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@router.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionRequest, request: Request) -> PredictionResponse:
    model_service = request.app.state.model_service
    try:
        price = model_service.predict(payload)
    except Exception as exc:  # pragma: no cover - defensive guard
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc
    return PredictionResponse(predicted_price=price)
