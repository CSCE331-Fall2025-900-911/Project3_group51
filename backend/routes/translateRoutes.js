// backend/routes/translateRoutes.js
const express = require('express');
const router = express.Router();

const { Credentials, Translator } = require("@translated/lara");

// Load credentials
const keyId = process.env.LARA_ACCESS_KEY_ID;
const keySecret = process.env.LARA_ACCESS_KEY_SECRET;

// Validate environment variables
if (!keyId || !keySecret) {
  console.error("[ERROR] Lara API keys missing. Check .env file!");
}

const credentials = new Credentials(keyId, keySecret);

const lara = new Translator(credentials);

// POST /api/translate
router.post("/", async (req, res) => {
  try {
    const { text, targetLangCode} = req.body;
    // Validate input
    if (!text || !targetLangCode) {
        if (!targetLangCode) console.log("code missing");

        return res.status(400).json({
            error: "Both 'text' and 'targetLang' are required.",
        });
    }

   
  // Calling Lara Translation api
    const result = await lara.translate(text, "en-US", targetLangCode);

    // Return translated text
    return res.json({
      translatedText: result.translation,
    });

  } catch (err) {
    console.error("Translation error:", err);
    return res.status(500).json({
      error: "Lara translation failed.",
      details: err.message,
    });
  }
});

module.exports = router;
