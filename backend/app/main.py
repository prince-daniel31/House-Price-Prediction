"""FastAPI application entrypoint.

Loads the trained model once at startup (via lifespan), configures CORS for the
React frontend, and wires up the prediction router.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.services.inference import ModelService
from app.api.routes.prediction import router as prediction_router
from app.utils.logging_config import configure_logging

configure_logging()
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load the model ONCE, not on every request.
    app.state.model_service = ModelService(model_path=settings.model_path)
    yield
    # Shutdown: nothing to clean up for a simple in-memory model.


app = FastAPI(
    title="House Price Prediction API",
    description="Serves a scikit-learn regression pipeline trained on Indian house listings.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction_router)
