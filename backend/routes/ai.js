const express = require("express");
const router = express.Router();

const { getPriceSuggestion } = require("../controllers/ai");

// No auth required (read-only intelligence)
router.post("/price-suggestion", getPriceSuggestion);

module.exports = router;
