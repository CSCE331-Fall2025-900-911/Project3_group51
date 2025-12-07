import { useState } from "react";
import useLanguage from "../../hooks/useLanguage";
import "./LanguageSelector.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const imageBase = API.replace(/\/api$/, "");

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const { selectedLang, setSelectedLang } = useLanguage();

  const LANG_OPTIONS = [
    { label: "English", code: "en" },
    { label: "Español", code: "es" },
    { label: "Français", code: "fr" },
    { label: "Italiano", code: "it" },
    { label: "Tiếng Việt", code: "vi" },
    { label: "한국어", code: "ko" },
    { label: "हिन्दी", code: "hi" },
    { label: "Türkçe", code: "tr" },
  ];

  const changeLanguage = (lang) => {
    setTimeout(() => {
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        select.value = lang.code;
        select.dispatchEvent(new Event("change"));
      }
    }, 0);
    setSelectedLang(lang.label);
    setOpen(false);
  };

  return (
    <div className="language-selector-container">
      <button
        className="language-selector-button"
        onClick={() => setOpen((prev) => !prev)}
      >
        <img 
          src={`${imageBase}/images/Icons/Language.png`} 
          className="lang-icon" 
          alt="Language" 
        />
        Language
      </button>

      {open && (
        <div className="language-dropdown notranslate">
          {LANG_OPTIONS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang)}
              className={`language-option ${selectedLang === lang.label ? "selected" : ""}`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}