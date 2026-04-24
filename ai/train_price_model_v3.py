import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
import joblib

df = pd.read_csv("auction_price_dataset_v3.csv")

CATEGORICAL_FEATURES = ["item_category", "semester_phase"]
NUMERICAL_FEATURES = [
    "original_price",
    "product_age_months",
    "item_condition",
    "auction_duration_hours",
    "seller_rating",
    "starting_price",
]
FEATURES = CATEGORICAL_FEATURES + NUMERICAL_FEATURES
TARGET = "final_price"

X = df[FEATURES]
y = df[TARGET]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

preprocessor = ColumnTransformer(
    transformers=[
        (
            "cat",
            OneHotEncoder(handle_unknown="ignore", sparse_output=False),
            CATEGORICAL_FEATURES,
        ),
        ("num", "passthrough", NUMERICAL_FEATURES),
    ]
)

# RandomForest keeps individual tree predictions, enabling uncertainty estimation
# via tree variance — a key feature of the hybrid rule+ML blending in the API.
model = RandomForestRegressor(
    n_estimators=200,
    max_depth=10,
    min_samples_leaf=5,
    max_features=0.6,
    random_state=42,
    n_jobs=1,
)

pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("model", model),
])

pipeline.fit(X_train, y_train)

y_pred = pipeline.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
mape = mean_absolute_percentage_error(y_test, y_pred) * 100
print(f"Test MAE:  {mae:.2f}")
print(f"Test MAPE: {mape:.2f}%")

cv_scores = cross_val_score(pipeline, X, y, cv=3, scoring="neg_mean_absolute_error", n_jobs=1)
print(f"CV MAE:    {-cv_scores.mean():.2f} ± {cv_scores.std():.2f}")

feature_info = {
    "categorical_features": CATEGORICAL_FEATURES,
    "numerical_features": NUMERICAL_FEATURES,
    "all_features": FEATURES,
    "target": TARGET,
    "model_type": "RandomForest-Pipeline-v3",
}

joblib.dump(pipeline, "price_model_v3.pkl")
joblib.dump(feature_info, "model_features_v3.pkl")

print("Saved: price_model_v3.pkl, model_features_v3.pkl")
