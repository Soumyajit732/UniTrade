import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
import joblib

# =====================
# Load data
# =====================
df = pd.read_csv("auction_price_dataset.csv")

# ---------------------
# Select v2 features
# ---------------------
FEATURES = [
    "item_category",
    "original_price",
    "product_age_months",
    "item_condition",
    "auction_duration_hours",
    "starting_price"
]

TARGET = "final_price"

X = df[FEATURES]
y = df[TARGET]

# ---------------------
# One-hot encode category
# ---------------------
X = pd.get_dummies(X, columns=["item_category"])

# Save feature order
model_features = X.columns.tolist()

# ---------------------
# Train / test split
# ---------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ---------------------
# Model (more regularized)
# ---------------------
model = RandomForestRegressor(
    n_estimators=300,
    max_depth=10,
    min_samples_leaf=5,
    random_state=42
)

model.fit(X_train, y_train)

# ---------------------
# Evaluate
# ---------------------
preds = model.predict(X_test)
mae = mean_absolute_error(y_test, preds)

print(f"✅ v2 Model MAE: {mae:.2f}")

# ---------------------
# Save artifacts
# ---------------------
joblib.dump(model, "price_model_v2.pkl")
joblib.dump(model_features, "model_features_v2.pkl")

print("💾 v2 model saved successfully")
