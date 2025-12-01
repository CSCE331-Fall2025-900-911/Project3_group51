import { useState, useEffect } from "react";
import { LANG_MAP } from "./useLanguage"; 
import { translateText } from "../utils/translate"; 

export default function useTranslate(textMap, targetLang) {
  const [translated, setTranslated] = useState(textMap);

  useEffect(() => {
    if (!targetLang || targetLang === "English") {
      setTranslated(textMap);
      return;
    }

    const langCode = LANG_MAP[targetLang];

    async function translateAll() {
      const newTranslations = {};

      const promises = Object.keys(textMap).map(async (key) => {
        const originalText = textMap[key];
        try {
          const result = await translateText(originalText, langCode);
          newTranslations[key] = result.translatedText;
        } catch (err) {
          console.error(err);
          newTranslations[key] = originalText;
        }
      });

      await Promise.all(promises);
      setTranslated(newTranslations);
    }

    translateAll();
  }, [textMap, targetLang]);

  return translated;
}