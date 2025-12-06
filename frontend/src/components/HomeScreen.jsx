import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

import useLanguage, { LANG_MAP } from "../hooks/useLanguage.js";
import useTranslate from "../hooks/useTranslate";
import { translateText } from "../utils/translate";
import { HOME_LABELS } from "./HomeScreen.labels.js";
import MagnifyControls from "./MagnifyControls.jsx";

import "./HomeScreen.css";

function HomeScreen() {
  const navigate = useNavigate();

  const imageBase = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api$/, "");

  // UI state
  const [showLanguage, setShowLanguage] = useState(false);
  const [weather, setWeather] = useState(null);
  const [translatedDesc, setTranslatedDesc] = useState("");

  // Login Secret Tap State (NEW)
  const [tapCount, setTapCount] = useState(0); 
  const timerRef = useRef(null); 

  // Global language state
  const { selectedLang, setSelectedLang } = useLanguage();

  // Page-level translated labels
  const labels = useTranslate(HOME_LABELS, selectedLang);

  const LANG_OPTIONS = [
    "English",
    "Español",
    "Français",
    "Italiano",
    "Tiếng Việt",
    "한국어",
  ];

  // Fetch weather
  useEffect(() => {
    const fetchWeather = async () => {
      const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!API_KEY) return;

      try {
        const lat = "30.6280";
        const lon = "-96.3344";

        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`
        );

        const data = await res.json();
        setWeather(data);
      } catch (err) {
        console.error("Weather API error:", err);
      }
    };

    // fetchWeather();
  }, []);

  // Translate weather description on language change
  useEffect(() => {
    async function translateWeather() {
      if (!weather?.weather) return;

      const englishDesc = weather.weather[0].description;

      if (selectedLang === "English") {
        setTranslatedDesc(englishDesc);
        return;
      }

      const targetCode = LANG_MAP[selectedLang];
      const resp = await translateText(englishDesc, targetCode);

      setTranslatedDesc(resp?.translatedText || englishDesc);
    }

    translateWeather();
  }, [weather, selectedLang]);

  //Secret Login Logic
  const handleSecretTap = useCallback((evt) => {
    evt.stopPropagation(); 
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    setTapCount(prevCount => {
      const newCount = prevCount + 1;
      
      if (newCount >= 5) {
        navigate("/login");
        return 0; 
      }
      
      timerRef.current = setTimeout(() => {
        setTapCount(0);
      }, 1500); 

      return newCount;
    });
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="home-container">
      <div 
          className="login-tap-zone" 
          onClick={handleSecretTap} 
          title="Hidden Employee Login Access (Tap 5 times)"
      />
      {/* Header */}
      <header className="home-header">
        <MagnifyControls />

        <h1 className="home-title">{labels.home}</h1>

        <button className="nav-btn" onClick={() => setShowLanguage(!showLanguage)}>
          <img 
            src={`${imageBase}/images/Icons/Language.png`} 
            alt="Language Icon" 
            className="nav-icon" 
          />
          {labels.language}
        </button>
      </header>

      {/* Language Dropdown */}
      {showLanguage && (
        <div className="language-dropdown">
          {["English", "Español", "Français", "Italiano", "Tiếng Việt", "한국어"].map(
            (lang) => (
              <button
                key={lang}
                className={lang === selectedLang ? "selected" : ""} 
                onClick={() => {
                  setSelectedLang(lang);
                  setShowLanguage(false);
                }}
              >
                {lang}
              </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="home-main">
        <div className="weather-box">
          {weather ? (
            <>
              <p>{weather.name}</p>
              <p className="weather-temp">{Math.round(weather.main.temp)}°F</p>
              <p>{translatedDesc}</p>
            </>
          ) : (
            <p>{labels.weatherLoading}</p>
          )}
        </div>

        <div className="weather-image">
          {weather && weather.main?.temp > 60 ? (
            <p>{labels.warmWeather}</p>
          ) : (
            <p>{labels.coldWeather}</p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <button
          className="start-button"
          onClick={() => {
            if (typeof window !== "undefined") {
              sessionStorage.removeItem("customerInfo");
              sessionStorage.removeItem("identityPrompted");
            }
            navigate("/order", { state: { fromHome: true } });
          }}
        >
          {labels.start}
        </button>
      </footer>
    </div>
  );
}

export default HomeScreen;
