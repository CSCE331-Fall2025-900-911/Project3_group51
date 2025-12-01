// src/hooks/useLanguage.js
import React, { createContext, useContext, useState } from "react";

export const LANG_MAP = {
  English: "en-US",
  Español: "es-ES",
  Français: "fr-FR",
  Italiano: "it-IT",
  "Tiếng Việt": "vi-VN",
  한국어: "ko-KR",
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [selectedLang, setSelectedLang] = useState("English");

  return React.createElement(
    LanguageContext.Provider,
    { value: { selectedLang, setSelectedLang } },
    children
  );
};

export default function useLanguage() {
  return useContext(LanguageContext);
}
