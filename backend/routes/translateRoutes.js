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

// Convert language to lara language code
const LANG_MAP = {
  english: "en-US",
  español: "es-ES",
  francis: "fr-FR",
  italino: "it-IT",
  "tiếng việt": "vi-VN",
};

// POST /api/translate
router.post("/", async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    // Validate input
    if (!text || !targetLang) {
        return res.status(400).json({
            error: "Both 'text' and 'targetLang' are required.",
        });
    }

    const formatLang = targetLang.trim().toLowerCase();
    if (!LANG_MAP[formatLang]) {
        return res.status(400).json({
            error: `Unsupported target language: '${targetLang}'`,
            supported: Object.keys(LANG_MAP),
        });
    }
    
    const mappedLang = LANG_MAP[formatLang];
    // Calling Lara Translation api
    console.log("Translate", text, "en-uS to", mappedLang);
    const result = await lara.translate(text, "en-US", mappedLang);


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
