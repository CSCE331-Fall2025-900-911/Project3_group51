import { useState, useEffect } from "react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Cache translation
const translationCache = {};

export default function useTranslate(textMap, targetLang) {
  const [translated, setTranslated] = useState(textMap);

  useEffect(() => {
    if (!targetLang || targetLang === "English") {
      setTranslated(textMap);
      return;
    }

    async function translateAll() {
      let output = {};
      for (const key in textMap) {
        const originalText = textMap[key];
        const cacheKey = `${targetLang}:${originalText}`;

        // Check cache
        if (translationCache[cacheKey]) {
          output[key] = translationCache[cacheKey];
          continue;
        }

        // If cache miss, call backend
        try {
          const res = await fetch(`${BACKEND_URL}/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: textMap[key],
              targetLangCode: targetLang,
            }),
          });

          const data = await res.json();
          const translatedText = data.translatedText || originalText;

          translationCache[cacheKey] = translatedText;
          output[key] = translatedText;

        } catch (e) {
          output[key] = originalText;
        }
      }
      setTranslated(output);
    }

    translateAll();
  }, [textMap, targetLang]);

  return translated;
}
