const Auction = require("../models/Auction");

// Conservative category-based defaults
const CATEGORY_BASE_PRICE = {
  Electronics: 300,
  Books: 150,
  Furniture: 500,
  Accessories: 200,
  Sports: 250,
  Other: 200
};

/* ================= PRICE SUGGESTION ================= */
exports.getPriceSuggestion = async (req, res) => {
  try {
    const { category, condition } = req.body;

    if (!category || !condition) {
      return res.status(400).json({
        message: "Category and condition are required"
      });
    }

    // 1️⃣ Fetch similar completed auctions
    const pastAuctions = await Auction.find({
      category,
      condition,
      status: "CLOSED",
      final_price: { $ne: null }
    }).select("final_price createdAt");

    // 🔹 FALLBACK: Not enough data
    if (pastAuctions.length < 3) {
      const fallbackPrice =
        CATEGORY_BASE_PRICE[category] || CATEGORY_BASE_PRICE.Other;

      return res.status(200).json({
        suggested_base_price: fallbackPrice,
        expected_price_range: null,
        confidence: "LOW",
        note: "Suggested using conservative category-based heuristic due to limited data",
        based_on_auctions: pastAuctions.length
      });
    }

    // 2️⃣ Apply recency weighting
    const weightedPrices = [];

    pastAuctions.forEach(a => {
      const daysOld =
        (Date.now() - new Date(a.createdAt)) / (1000 * 60 * 60 * 24);

      const weight = daysOld <= 30 ? 1.5 : 1;
      const repeat = Math.round(weight * 2); // 3 vs 2

      for (let i = 0; i < repeat; i++) {
        weightedPrices.push(a.final_price);
      }
    });

    weightedPrices.sort((a, b) => a - b);

    // 3️⃣ Weighted median
    const mid = Math.floor(weightedPrices.length / 2);
    const median =
      weightedPrices.length % 2 !== 0
        ? weightedPrices[mid]
        : (weightedPrices[mid - 1] + weightedPrices[mid]) / 2;

    // 4️⃣ Suggested pricing
    const suggestedBasePrice = Math.round(median * 0.65);
    const minPrice = Math.round(median * 0.85);
    const maxPrice = Math.round(median * 1.15);

    // 5️⃣ Confidence score
    let confidence = "MEDIUM";
    if (pastAuctions.length >= 15) confidence = "HIGH";
    if (pastAuctions.length < 6) confidence = "LOW";

    res.status(200).json({
      suggested_base_price: suggestedBasePrice,
      expected_price_range: {
        min: minPrice,
        max: maxPrice
      },
      confidence,
      based_on_auctions: pastAuctions.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to generate price suggestion"
    });
  }
};
