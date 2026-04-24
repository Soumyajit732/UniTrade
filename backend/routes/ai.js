const express = require("express");
const axios = require("axios");

const router = express.Router();

const PRICE_SERVICE_URL =
  process.env.AI_PRICE_SERVICE_URL || "http://127.0.0.1:8001/ai/predict-price";

router.post("/predict-price", async (req, res) => {
  try {
    const response = await axios.post(PRICE_SERVICE_URL, req.body, { timeout: 5000 });

    res.json(response.data);
  } catch (err) {
    console.error("AI service error:", err.message);
    res.status(503).json({
      message: "AI price service unavailable. Restart the backend or run `npm run ai` from the backend folder."
    });
  }
});

router.post("/generate-description", async (req, res) => {
  try {
    const { title, category } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        message: "Title and category are required"
      });
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "OpenAI API key is not configured"
      });
    }

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You write short, clear product descriptions for campus auctions."
          },
          {
            role: "user",
            content: `Title: ${title}\nCategory: ${category}\nTone: student-friendly, honest\nLength: 3-4 lines`
          }
        ],
        temperature: 0.7,
        max_tokens: 140
      },
      {
        timeout: 15000,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        }
      }
    );

    const description = response.data?.choices?.[0]?.message?.content?.trim();

    if (!description) {
      return res.status(502).json({
        message: "AI did not return a description"
      });
    }

    res.json({ description });
  } catch (err) {
    console.error("AI description error:", err.response?.data || err.message);
    res.status(500).json({
      message: "AI description service unavailable"
    });
  }
});

module.exports = router;
