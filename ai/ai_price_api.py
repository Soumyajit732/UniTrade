import warnings
warnings.filterwarnings(
    "ignore",
    message="X has feature names, but DecisionTreeRegressor was fitted without feature names",
)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, validator
import pandas as pd
import numpy as np
import joblib
from datetime import datetime
from pathlib import Path

app = FastAPI(title="Campus Auction AI Price Service")

BASE_DIR = Path(__file__).resolve().parent

def _load_model():
    v3_model = BASE_DIR / "price_model_v3.pkl"
    v3_features = BASE_DIR / "model_features_v3.pkl"
    v2_model = BASE_DIR / "price_model_v2.pkl"
    v2_features = BASE_DIR / "model_features_v2.pkl"

    if v3_model.exists() and v3_features.exists():
        print("[ai-price] Loading v3 model")
        return joblib.load(v3_model), joblib.load(v3_features), "v3"
    print("[ai-price] v3 model not found, falling back to v2")
    return joblib.load(v2_model), joblib.load(v2_features), "v2"

pipeline, model_features, MODEL_VERSION = _load_model()

ALLOWED_CATEGORIES = [
    "Books & Study",
    "Electronics & Gadgets",
    "Hostel Essentials",
    "Clothing & Accessories",
    "Kitchen & Food Items",
    "Sports & Fitness",
    "Transport & Mobility",
    "Personal Care",
    "Miscellaneous",
]

# Piecewise exponential depreciation model per category.
# first_year_depreciation: fraction of value lost in the first 12 months
# annual_depreciation:     compound fraction lost each year after year 1
# floor_rate:              hard floor — item never goes below this % of original
# demand:                  campus demand multiplier (affects final price)
# volatility:              price variance (wider range when high)
# base_price_rate:         starting price as fraction of depreciated value
CATEGORY_PROFILES = {
    "Electronics & Gadgets": {
        "first_year_depreciation": 0.30,
        "annual_depreciation": 0.14,
        "floor_rate": 0.12,
        "demand": 1.12,
        "volatility": 0.14,
        "base_price_rate": 0.62,
    },
    "Transport & Mobility": {
        "first_year_depreciation": 0.20,
        "annual_depreciation": 0.10,
        "floor_rate": 0.25,
        "demand": 1.08,
        "volatility": 0.12,
        "base_price_rate": 0.60,
    },
    "Sports & Fitness": {
        "first_year_depreciation": 0.18,
        "annual_depreciation": 0.11,
        "floor_rate": 0.20,
        "demand": 1.04,
        "volatility": 0.13,
        "base_price_rate": 0.56,
    },
    "Hostel Essentials": {
        "first_year_depreciation": 0.22,
        "annual_depreciation": 0.13,
        "floor_rate": 0.18,
        "demand": 1.00,
        "volatility": 0.12,
        "base_price_rate": 0.52,
    },
    "Clothing & Accessories": {
        "first_year_depreciation": 0.35,
        "annual_depreciation": 0.20,
        "floor_rate": 0.08,
        "demand": 0.96,
        "volatility": 0.16,
        "base_price_rate": 0.46,
    },
    "Books & Study": {
        "first_year_depreciation": 0.45,
        "annual_depreciation": 0.12,
        "floor_rate": 0.08,
        "demand": 0.94,
        "volatility": 0.13,
        "base_price_rate": 0.44,
    },
    "Kitchen & Food Items": {
        "first_year_depreciation": 0.25,
        "annual_depreciation": 0.14,
        "floor_rate": 0.14,
        "demand": 0.96,
        "volatility": 0.15,
        "base_price_rate": 0.50,
    },
    "Personal Care": {
        "first_year_depreciation": 0.42,
        "annual_depreciation": 0.22,
        "floor_rate": 0.06,
        "demand": 0.88,
        "volatility": 0.18,
        "base_price_rate": 0.40,
    },
    "Miscellaneous": {
        "first_year_depreciation": 0.22,
        "annual_depreciation": 0.12,
        "floor_rate": 0.15,
        "demand": 0.98,
        "volatility": 0.16,
        "base_price_rate": 0.50,
    },
}

CONDITION_MULTIPLIERS = {
    5: 1.10,
    4: 0.95,
    3: 0.80,
    2: 0.62,
    1: 0.42,
}

CONDITION_STARTING_PRICE_RATES = {
    5: 0.80,
    4: 0.70,
    3: 0.58,
    2: 0.44,
    1: 0.30,
}

# Campus academic calendar — affects demand and urgency to buy/sell.
SEMESTER_MULTIPLIERS = {
    "EndSem": 1.10,
    "StartSem": 1.05,
    "MidSem": 1.00,
    "Break": 0.92,
}


class PricePredictionRequest(BaseModel):
    item_category: str
    original_price: float = Field(..., gt=0, le=500000)
    product_age_value: int = Field(..., ge=0, le=120)
    product_age_unit: str
    item_condition: int = Field(..., ge=1, le=5)
    auction_duration_hours: int = Field(..., ge=12, le=168)

    @validator("item_category")
    def validate_category(cls, v):
        if v not in ALLOWED_CATEGORIES:
            raise ValueError("Invalid item category")
        return v

    @validator("product_age_unit")
    def validate_age_unit(cls, v):
        if v not in ["months", "years", "semesters"]:
            raise ValueError("Invalid age unit")
        return v


def normalize_age_to_months(value: int, unit: str) -> int:
    if unit == "years":
        return value * 12
    if unit == "semesters":
        return value * 6
    return value


def compute_age_factor(age_months: int, profile: dict) -> float:
    """
    Piecewise exponential depreciation:
      Year 0–1: linear drop from 1.0 to (1 - first_year_depreciation)
      Year 1+:  compound decay at annual_depreciation per year
    Clamped at floor_rate so items always have a minimum resale value.
    """
    age_years = age_months / 12.0
    fyd = profile["first_year_depreciation"]
    ad = profile["annual_depreciation"]
    floor = profile["floor_rate"]

    if age_years <= 0:
        remaining = 1.0
    elif age_years <= 1.0:
        remaining = 1.0 - fyd * age_years
    else:
        remaining = (1.0 - fyd) * ((1.0 - ad) ** (age_years - 1.0))

    return round(max(floor, remaining), 4)


def duration_multiplier(hours: int) -> float:
    normalized = (hours - 12) / (168 - 12)
    return round(0.92 + 0.20 * (normalized ** 0.55), 4)


def get_semester_phase() -> str:
    month = datetime.now().month
    if month in [4, 5, 10, 11]:
        return "EndSem"
    elif month in [6, 12]:
        return "Break"
    elif month in [7, 1]:
        return "StartSem"
    else:
        return "MidSem"


def clamp(value: float, lo: float, hi: float) -> float:
    return min(max(value, lo), hi)


def build_model_prediction(
    payload: PricePredictionRequest,
    age_months: int,
    starting_price: float,
    semester_phase: str,
) -> dict:
    df = pd.DataFrame([{
        "item_category": payload.item_category,
        "semester_phase": semester_phase,
        "original_price": payload.original_price,
        "product_age_months": age_months,
        "item_condition": payload.item_condition,
        "auction_duration_hours": payload.auction_duration_hours,
        "seller_rating": 4.0,  # neutral default — seller unknown at listing time
        "starting_price": starting_price,
    }])

    preprocessor = pipeline.named_steps["preprocessor"]
    rf_model = pipeline.named_steps["model"]

    X_transformed = preprocessor.transform(df)
    tree_preds = np.array([
        tree.predict(X_transformed)[0] for tree in rf_model.estimators_
    ])

    prediction = float(tree_preds.mean())
    std_dev = float(tree_preds.std())
    uncertainty = std_dev / prediction if prediction > 0 else 1.0

    return {"prediction": prediction, "uncertainty": uncertainty}


@app.get("/ai/health")
def health():
    return {"status": "ok", "model_version": MODEL_VERSION}


@app.post("/ai/predict-price")
def predict_price(payload: PricePredictionRequest):
    try:
        age_months = normalize_age_to_months(payload.product_age_value, payload.product_age_unit)
        profile = CATEGORY_PROFILES[payload.item_category]
        semester_phase = get_semester_phase()
        semester_factor = SEMESTER_MULTIPLIERS[semester_phase]

        age_factor = compute_age_factor(age_months, profile)
        condition_factor = CONDITION_MULTIPLIERS[payload.item_condition]
        duration_factor = duration_multiplier(payload.auction_duration_hours)

        # Rule-based estimate: original price depreciated by age, scaled by
        # condition, demand, semester urgency, and auction duration.
        rule_based_final = (
            payload.original_price
            * age_factor
            * condition_factor
            * profile["demand"]
            * semester_factor
            * duration_factor
        )

        starting_price = (
            payload.original_price
            * profile["base_price_rate"]
            * CONDITION_STARTING_PRICE_RATES[payload.item_condition]
            * age_factor
        )
        starting_price = max(
            starting_price,
            payload.original_price * profile["floor_rate"],
        )

        ml = build_model_prediction(payload, age_months, starting_price, semester_phase)

        # ML weight increases with model confidence (low tree variance = high weight).
        # Capped at 0.55 so rule-based always contributes at least 45%.
        model_weight = clamp(0.55 - ml["uncertainty"], 0.25, 0.55)
        rule_weight = 1.0 - model_weight
        predicted_final = ml["prediction"] * model_weight + rule_based_final * rule_weight

        # Starting price bounded between floor and 90% of predicted final.
        min_base = payload.original_price * profile["floor_rate"] * age_factor * condition_factor
        max_base = predicted_final * 0.90
        recommended_base = clamp(starting_price, min_base, max_base)

        range_spread = clamp(profile["volatility"] + ml["uncertainty"] * 0.30, 0.10, 0.30)

        confidence = clamp(
            94 - ml["uncertainty"] * 90 - profile["volatility"] * 30,
            50,
            94,
        )

        return {
            "predicted_final_price": round(predicted_final, 2),
            "recommended_base_price": round(recommended_base, 2),
            "expected_price_range": {
                "min": round(predicted_final * (1 - range_spread), 2),
                "max": round(predicted_final * (1 + range_spread), 2),
            },
            "confidence_score": round(confidence, 1),
            "effective_age_months": age_months,
            "metric_impact": {
                "category_resale_rate": age_factor,
                "category_demand_factor": profile["demand"],
                "age_factor": age_factor,
                "condition_factor": condition_factor,
                "duration_factor": duration_factor,
                "semester_phase": semester_phase,
                "semester_factor": semester_factor,
                "model_weight": round(model_weight, 3),
                "rule_weight": round(rule_weight, 3),
            },
        }

    except Exception as e:
        print("AI PRICE ERROR:", e)
        raise HTTPException(status_code=500, detail="AI price prediction failed")
