import { useState, useEffect } from "react";
import { translateText } from "../utils/translate";
import { LANG_MAP } from "./useLanguage";

export default function useTranslate(labels, selectedLang) {
  const [translated, setTranslated] = useState(labels);

  useEffect(() => {
    async function doTranslate() {
      if (!labels) return;

      const langCode = LANG_MAP[selectedLang];

      // English → no translation required
      if (!langCode || langCode === "en-US") {
        setTranslated(labels);
        return;
      }

      const newLabels = {};

      for (const key of Object.keys(labels)) {
        const original = labels[key];
        const resp = await translateText(original, langCode);
        newLabels[key] = resp?.translatedText || original;
      }

      setTranslated(newLabels);
    }

    doTranslate();
  }, [labels, selectedLang]);

  return translated;
}
