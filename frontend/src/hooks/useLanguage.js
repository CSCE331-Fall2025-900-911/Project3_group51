// src/hooks/useLanguage.js
import { useState, useEffect } from "react";
import { translateText } from "../utils/translate";

// Default English labels
const DEFAULT_LABELS = {
  home: "Home",
  language: "Language",
  start: "Tap to Start Order",
  login: "Employee Login",
  weatherLoading: "Loading Weather...",
  warmWeather: "Image based on warm weather (e.g., Iced Tea)",
  coldWeather: "Image based on cold weather (e.g., Hot Coffee)",
};

// Map UI language → Lara API code
export const LANG_MAP = {
  English: "en-US",
  Español: "es-ES",
  Français: "fr-FR",
  Italiano: "it-IT",
  "Tiếng Việt": "vi-VN",
  한국어: "ko-KR",
};

export default function useLanguage() {
  const [selectedLang, setSelectedLang] = useState("English");
  const [labels, setLabels] = useState(DEFAULT_LABELS);

  // Translate all UI labels whenever language changes
  useEffect(() => {
    updateLabels(selectedLang);
  }, [selectedLang]);

  const updateLabels = async (lang) => {
    const targetCode = LANG_MAP[lang];

    if (!targetCode || targetCode === "en-US") {
      setLabels({ ...DEFAULT_LABELS, _lang: "English" });
      return;
    }

    const translated = {};

    for (const key of Object.keys(DEFAULT_LABELS)) {
      const text = DEFAULT_LABELS[key];
      const resp = await translateText(text, targetCode);
      translated[key] = resp?.translatedText || text;
    }

    translated._lang = lang; // store language reference
    setLabels(translated);
  };

  const updateLanguage = (lang) => {
    setSelectedLang(lang);
  };

  return { selectedLang, labels, updateLanguage };
}
