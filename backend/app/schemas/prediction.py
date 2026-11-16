"""Request/response models for the /predict endpoint.

These field names and types must match what the notebook used to train the model
(see notebooks/house_price_model.ipynb, section 2.4).
"""
from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    location: str = Field(..., description="Locality name, e.g. 'thane'. Unknown values map to 'other'.")
    carpet_area_sqft: float = Field(..., gt=0, description="Carpet (or super) area in square feet.")
    floor_num: int = Field(..., description="Floor number. Use 0 for Ground, -1 for Basement.")
    bathroom: int = Field(..., ge=0, description="Number of bathrooms.")
    balcony: int = Field(0, ge=0, description="Number of balconies.")
    furnishing: str = Field(..., description="'Furnished' | 'Semi-Furnished' | 'Unfurnished'")
    transaction: str = Field(..., description="'New Property' | 'Resale' | 'Rent/Lease' | 'Other'")
    ownership: str = Field(..., description="e.g. 'Freehold', 'Leasehold', 'Co-operative Society'")
    facing: str = Field(..., description="e.g. 'East', 'North - West'")

    model_config = {
        "json_schema_extra": {
            "example": {
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
        }
    }


class PredictionResponse(BaseModel):
    predicted_price: float


class HealthResponse(BaseModel):
    status: str = "ok"
