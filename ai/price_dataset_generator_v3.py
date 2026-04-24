import numpy as np
import pandas as pd

np.random.seed(42)
N = 1200

CATEGORIES = [
    "Electronics & Gadgets",
    "Transport & Mobility",
    "Sports & Fitness",
    "Hostel Essentials",
    "Clothing & Accessories",
    "Books & Study",
    "Kitchen & Food Items",
    "Personal Care",
    "Miscellaneous",
]

# Piecewise exponential depreciation profiles per category.
# first_year_depreciation: fraction lost in first 12 months (steepest drop)
# annual_depreciation:     fraction lost each subsequent year (compound)
# floor_rate:              minimum resale value as fraction of original
CATEGORY_PROFILES = {
    "Electronics & Gadgets": {
        "original_price_range": (3000, 80000),
        "first_year_depreciation": 0.30,
        "annual_depreciation": 0.14,
        "floor_rate": 0.12,
        "demand": 1.12,
        "volatility": 0.14,
        "base_price_rate": 0.62,
    },
    "Transport & Mobility": {
        "original_price_range": (2000, 30000),
        "first_year_depreciation": 0.20,
        "annual_depreciation": 0.10,
        "floor_rate": 0.25,
        "demand": 1.08,
        "volatility": 0.12,
        "base_price_rate": 0.60,
    },
    "Sports & Fitness": {
        "original_price_range": (500, 15000),
        "first_year_depreciation": 0.18,
        "annual_depreciation": 0.11,
        "floor_rate": 0.20,
        "demand": 1.04,
        "volatility": 0.13,
        "base_price_rate": 0.56,
    },
    "Hostel Essentials": {
        "original_price_range": (300, 8000),
        "first_year_depreciation": 0.22,
        "annual_depreciation": 0.13,
        "floor_rate": 0.18,
        "demand": 1.00,
        "volatility": 0.12,
        "base_price_rate": 0.52,
    },
    "Clothing & Accessories": {
        "original_price_range": (300, 8000),
        "first_year_depreciation": 0.35,
        "annual_depreciation": 0.20,
        "floor_rate": 0.08,
        "demand": 0.96,
        "volatility": 0.16,
        "base_price_rate": 0.46,
    },
    "Books & Study": {
        "original_price_range": (100, 3000),
        "first_year_depreciation": 0.45,
        "annual_depreciation": 0.12,
        "floor_rate": 0.08,
        "demand": 0.94,
        "volatility": 0.13,
        "base_price_rate": 0.44,
    },
    "Kitchen & Food Items": {
        "original_price_range": (300, 6000),
        "first_year_depreciation": 0.25,
        "annual_depreciation": 0.14,
        "floor_rate": 0.14,
        "demand": 0.96,
        "volatility": 0.15,
        "base_price_rate": 0.50,
    },
    "Personal Care": {
        "original_price_range": (200, 5000),
        "first_year_depreciation": 0.42,
        "annual_depreciation": 0.22,
        "floor_rate": 0.06,
        "demand": 0.88,
        "volatility": 0.18,
        "base_price_rate": 0.40,
    },
    "Miscellaneous": {
        "original_price_range": (200, 10000),
        "first_year_depreciation": 0.22,
        "annual_depreciation": 0.12,
        "floor_rate": 0.15,
        "demand": 0.98,
        "volatility": 0.16,
        "base_price_rate": 0.50,
    },
}

CONDITION_MULTIPLIERS = {5: 1.10, 4: 0.95, 3: 0.80, 2: 0.62, 1: 0.42}

SEMESTER_PHASES = ["EndSem", "StartSem", "MidSem", "Break"]
SEMESTER_MULTIPLIERS = {
    "EndSem": 1.10,
    "StartSem": 1.05,
    "MidSem": 1.00,
    "Break": 0.92,
}
SEMESTER_PROBS = [0.20, 0.15, 0.45, 0.20]


def compute_age_factor(age_months: float, profile: dict) -> float:
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

    return max(floor, remaining)


records = []

category_probs = [0.25, 0.12, 0.10, 0.12, 0.10, 0.12, 0.08, 0.06, 0.05]

for _ in range(N):
    category = np.random.choice(CATEGORIES, p=category_probs)
    profile = CATEGORY_PROFILES[category]
    lo, hi = profile["original_price_range"]

    # Log-normal distributed price within category range
    mid = (lo + hi) / 2
    original_price = np.random.lognormal(mean=np.log(mid), sigma=0.45)
    original_price = float(np.clip(original_price, lo, hi))
    original_price = round(original_price / 50) * 50

    # Age: exponential distribution — most items are newer, long tail of old
    age_months = int(np.random.exponential(scale=16))
    age_months = min(age_months, 120)

    # Condition: older items skew toward lower condition
    age_weight = min(age_months / 60.0, 1.0)
    base_cond_probs = np.array([0.40, 0.30, 0.18, 0.08, 0.04])
    old_cond_probs = np.array([0.04, 0.12, 0.32, 0.32, 0.20])
    cond_probs = (1 - age_weight) * base_cond_probs + age_weight * old_cond_probs
    cond_probs /= cond_probs.sum()
    item_condition = int(np.random.choice([5, 4, 3, 2, 1], p=cond_probs))

    auction_duration_hours = int(np.random.choice(
        [12, 24, 48, 72, 96, 120, 168],
        p=[0.04, 0.25, 0.30, 0.22, 0.10, 0.06, 0.03],
    ))

    seller_rating = round(float(np.random.beta(a=7, b=2) * 4 + 1), 1)
    semester_phase = str(np.random.choice(SEMESTER_PHASES, p=SEMESTER_PROBS))
    day_of_week = int(np.random.randint(0, 7))

    age_factor = compute_age_factor(age_months, profile)
    condition_factor = CONDITION_MULTIPLIERS[item_condition]
    norm_hours = (auction_duration_hours - 12) / (168 - 12)
    duration_factor = 0.92 + 0.20 * (norm_hours ** 0.55)
    semester_factor = SEMESTER_MULTIPLIERS[semester_phase]
    day_factor = 1.04 if day_of_week >= 5 else 1.00
    seller_factor = 0.94 + (seller_rating - 1) / 4 * 0.12

    starting_price = original_price * profile["base_price_rate"] * age_factor * condition_factor
    starting_price = max(starting_price, original_price * profile["floor_rate"])
    starting_price = round(starting_price / 10) * 10

    market_factor = (
        age_factor
        * condition_factor
        * profile["demand"]
        * semester_factor
        * day_factor
        * duration_factor
        * seller_factor
    )

    noise = float(np.random.normal(0, profile["volatility"]))
    final_price = original_price * market_factor * (1 + noise)
    final_price = max(final_price, starting_price * 1.01)
    final_price = min(final_price, original_price * 0.97)
    final_price = round(final_price / 10) * 10

    unique_bidders = max(1, int(
        duration_factor * profile["demand"] * semester_factor
        * np.random.poisson(lam=4) * np.random.uniform(0.6, 1.0)
    ))
    total_bids = unique_bidders + int(np.random.poisson(lam=3))

    records.append({
        "item_category": category,
        "original_price": original_price,
        "product_age_months": age_months,
        "item_condition": item_condition,
        "auction_duration_hours": auction_duration_hours,
        "seller_rating": seller_rating,
        "semester_phase": semester_phase,
        "day_of_week": day_of_week,
        "starting_price": starting_price,
        "total_bids": total_bids,
        "unique_bidders": unique_bidders,
        "final_price": final_price,
    })

df = pd.DataFrame(records)
df = df[df["final_price"] >= df["starting_price"]]
df = df[df["unique_bidders"] <= df["total_bids"]]
df.to_csv("auction_price_dataset_v3.csv", index=False)

print(f"Dataset generated: {df.shape}")
print("\nCategory distribution:")
print(df["item_category"].value_counts())
print("\nMean final/original ratio by category:")
ratio = df.groupby("item_category").apply(
    lambda x: (x["final_price"] / x["original_price"]).mean()
)
print(ratio.round(3))
print("\nAge stats (months):")
print(df["product_age_months"].describe())
