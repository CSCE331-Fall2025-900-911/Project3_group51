import { useState, useEffect } from "react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
          output[key] = data.translatedText || textMap[key];
        } catch (e) {
          output[key] = textMap[key];
        }
      }
      setTranslated(output);
    }

    translateAll();
  }, [textMap, targetLang]);

  return translated;
}
