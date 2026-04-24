import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error

# ======================
# Load Dataset
# ======================
df = pd.read_csv("auction_price_dataset.csv")

# ======================
# Sanity Checks
# ======================
assert (df["final_price"] >= df["starting_price"]).all()
assert (df["unique_bidders"] <= df["total_bids"]).all()

# ======================
# Feature Engineering
# ======================
df["price_ratio"] = df["starting_price"] / df["original_price"]
df["bidder_ratio"] = df["unique_bidders"] / df["total_bids"]
df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)

# ======================
# Prepare X & y
# ======================
X = df.drop("final_price", axis=1)
y = df["final_price"]

X = pd.get_dummies(X, drop_first=True)

# ======================
# Train-Test Split
# ======================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ======================
# Train Model
# ======================
model = RandomForestRegressor(
    n_estimators=200,
    max_depth=12,
    random_state=42
)

model.fit(X_train, y_train)

# ======================
# Evaluation
# ======================
preds = model.predict(X_test)
mae = mean_absolute_error(y_test, preds)

print("✅ Model trained successfully")
print("📉 Mean Absolute Error (MAE):", round(mae, 2))

# ======================
# Save Model & Columns
# ======================
joblib.dump(model, "price_model_v1.pkl")
joblib.dump(X.columns, "model_features.pkl")

print("💾 Model saved as price_model_v1.pkl")
print("💾 Feature columns saved as model_features.pkl")
