import random
import pandas as pd
import numpy as np

random.seed(42)
np.random.seed(42)

ROWS = 300

categories = [
    "Books & Study",
    "Electronics & Gadgets",
    "Hostel Essentials",
    "Clothing & Accessories",
    "Kitchen & Food Items",
    "Sports & Fitness",
    "Transport & Mobility",
    "Personal Care",
    "Miscellaneous"
]

semester_phases = ["MidSem", "EndSem", "Fest"]

data = []

for i in range(ROWS):
    category = random.choice(categories)

    # Product age (in months)
    product_age_months = random.choice(
        list(range(1, 12)) +        # months
        list(range(12, 36, 6)) +    # semesters
        list(range(36, 61, 12))     # years
    )

    item_condition = random.randint(1, 5)

    # Base original price by category
    base_price_map = {
        "Electronics & Gadgets": random.randint(15000, 90000),
        "Transport & Mobility": random.randint(3000, 25000),
        "Sports & Fitness": random.randint(2000, 15000),
        "Hostel Essentials": random.randint(1000, 8000),
        "Clothing & Accessories": random.randint(800, 10000),
        "Kitchen & Food Items": random.randint(500, 7000),
        "Books & Study": random.randint(500, 3000),
        "Personal Care": random.randint(500, 6000),
        "Miscellaneous": random.randint(1000, 10000)
    }

    original_price = base_price_map[category]

    # Depreciation based on age & category
    depreciation_rate = {
        "Electronics & Gadgets": 0.015,
        "Transport & Mobility": 0.012,
        "Personal Care": 0.014,
        "Books & Study": 0.008,
        "Clothing & Accessories": 0.009,
        "Kitchen & Food Items": 0.01,
        "Sports & Fitness": 0.007,
        "Hostel Essentials": 0.005,
        "Miscellaneous": 0.01
    }

    age_factor = max(
        0.4,
        1 - (product_age_months * depreciation_rate[category])
    )

    adjusted_price = int(original_price * age_factor)

    # Starting price = 25–50% of adjusted price
    starting_price = int(adjusted_price * random.uniform(0.25, 0.5))

    auction_duration_hours = random.choice([24, 48, 72])
    day_of_week = random.randint(0, 6)
    semester_phase = random.choice(semester_phases)

    base_bidders = random.randint(3, 10)
    if category in ["Electronics & Gadgets", "Transport & Mobility"]:
        base_bidders += random.randint(5, 12)
    if semester_phase == "EndSem":
        base_bidders += random.randint(3, 6)

    unique_bidders = min(base_bidders, 25)
    total_bids = unique_bidders + random.randint(2, 15)

    seller_rating = round(random.uniform(3.5, 5.0), 1)
    listing_hour = random.randint(10, 23)

    # Final price multiplier
    multiplier = 1.1
    multiplier += (item_condition - 3) * 0.07
    multiplier += unique_bidders / 22
    multiplier += 0.15 if day_of_week in [5, 6] else 0
    multiplier += 0.2 if semester_phase == "EndSem" else 0

    final_price = int(starting_price * multiplier)

    data.append([
        i + 1000,
        category,
        product_age_months,
        item_condition,
        original_price,
        starting_price,
        auction_duration_hours,
        day_of_week,
        semester_phase,
        total_bids,
        unique_bidders,
        seller_rating,
        listing_hour,
        final_price
    ])

columns = [
    "auction_id",
    "item_category",
    "product_age_months",
    "item_condition",
    "original_price",
    "starting_price",
    "auction_duration_hours",
    "day_of_week",
    "semester_phase",
    "total_bids",
    "unique_bidders",
    "seller_rating",
    "listing_hour",
    "final_price"
]

df = pd.DataFrame(data, columns=columns)

# Validation
df = df[df["final_price"] >= df["starting_price"]]
df = df[df["unique_bidders"] <= df["total_bids"]]

df.to_csv("auction_price_dataset.csv", index=False)

print("✅ Dataset generated:", df.shape)
print(df.head())
