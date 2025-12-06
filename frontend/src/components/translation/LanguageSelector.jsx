import { useState, useEffect, useRef } from "react";
import "./LanguageSelector.css";

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);

  const LANG_OPTIONS = [
    { label: "English", code: "en" },
    { label: "Español", code: "es" },
    { label: "Français", code: "fr" },
    { label: "Italiano", code: "it" },
    { label: "Tiếng Việt", code: "vi" },
    { label: "한국어", code: "ko" },
    { label: "हिन्दी", code: "hi" }, // India (Hindi)
    { label: "Türkçe", code: "tr" }, // Turkey
  ];

  // Trigger Google Translate selection
  const changeLanguage = (code) => {
    const select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event("change"));
    }
    setOpen(false);
  };

  return (
    <div className="language-selector-container">
      {/* LEFT BUTTON */}
      <button
        className="language-selector-button"
        onClick={() => setOpen((prev) => !prev)}
      >
        🌐 Language
      </button>

      {/* RIGHT DROPDOWN */}
      {open && (
        <div className="language-dropdown">
          {LANG_OPTIONS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className="language-option"
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
