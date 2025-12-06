import { useState, useEffect, useRef } from "react";
import "./LanguageSelector.css";

const LANG_OPTIONS = [
  { label: "English", code: "en" },
  { label: "Español", code: "es" },
  { label: "Français", code: "fr" },
  { label: "Italiano", code: "it" },
  { label: "Tiếng Việt", code: "vi" },
  { label: "한국어", code: "ko" },
  { label: "हिन्दी", code: "hi" },
  { label: "Türkiye", code: "tr" },
];

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("Language");
  const dropdownRef = useRef(null);

  // Auto-apply saved language
  useEffect(() => {
    const saved = localStorage.getItem("preferred_lang");
    if (!saved) return;

    const lang = LANG_OPTIONS.find((l) => l.code === saved);
    if (lang) setSelectedLabel(lang.label);

    const interval = setInterval(() => {
      const combo = document.querySelector(".goog-te-combo");
      if (combo) {
        combo.value = saved;
        combo.dispatchEvent(new Event("change"));
        clearInterval(interval);
      }
    }, 300);
  }, []);

  // Close when clicked outside
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function applyLanguage(code, label) {
    localStorage.setItem("preferred_lang", code);
    setSelectedLabel(label);

    const combo = document.querySelector(".goog-te-combo");
    if (combo) {
      combo.value = code;
      combo.dispatchEvent(new Event("change"));
    }

    setOpen(false);
  }

  return (
    <div className="lang-dropdown right-align" ref={dropdownRef}>
      <button className="lang-dropdown-btn" onClick={() => setOpen(!open)}>
        {selectedLabel}
        <span className={`arrow ${open ? "open" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="lang-dropdown-menu">
          {LANG_OPTIONS.map(({ label, code }) => (
            <div
              key={code}
              className="lang-dropdown-item"
              onClick={() => applyLanguage(code, label)}
            >
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
