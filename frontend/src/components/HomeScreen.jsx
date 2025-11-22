// src/screens/HomeScreen.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useLanguage from "../hooks/useLanguage";
import { LANG_MAP } from "../hooks/useLanguage";
import { translateText } from "../utils/translate";
import "./HomeScreen.css";

function HomeScreen() {
  const navigate = useNavigate();
  const [showLanguage, setShowLanguage] = useState(false);
  const [weather, setWeather] = useState(null);
  const [translatedDesc, setTranslatedDesc] = useState("");

  const { labels, updateLanguage, selectedLang } = useLanguage();

  const LANG_OPTIONS = [
    "English",
    "Español",
    "Français",
    "Italiano",
    "Tiếng Việt",
    "한국어",
  ];

  // Fetch weather condition
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

    fetchWeather();
  }, []);

  // Translate weather description when language changes
  useEffect(() => {
    async function translateWeather() {
      if (!weather || !weather.weather) return;

      const englishDesc = weather.weather[0].description;

      // English → no translation needed
      if (selectedLang === "English") {
        setTranslatedDesc(englishDesc);
        return;
      }

      // Get Lara code (fr-FR, vi-VN, etc)
      const targetLangCode = LANG_MAP[selectedLang];
      if (!targetLangCode) {
        setTranslatedDesc(englishDesc);
        return;
      }

      const resp = await translateText(englishDesc, targetLangCode);
      setTranslatedDesc(resp?.translatedText || englishDesc);
    }

    translateWeather();
  }, [weather, selectedLang]);

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="nav-placeholder"></div>

        <h1 className="home-title">{labels.home}</h1>

        <button
          className="nav-btn lang-btn"
          onClick={() => setShowLanguage(!showLanguage)}
        >
          {labels.language}
        </button>
      </header>

      {/* Language Dropdown */}
      {showLanguage && (
        <div className="language-dropdown">
          {LANG_OPTIONS.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                updateLanguage(lang);
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

              {/* Translated weather description */}
              <p>{translatedDesc}</p>
            </>
          ) : (
            <p>{labels.weatherLoading}</p>
          )}
        </div>

        <div className="weather-image">
          {weather && weather.main && weather.main.temp > 60 ? (
            <p>{labels.warmWeather}</p>
          ) : (
            <p>{labels.coldWeather}</p>
          )}
        </div>
      </main>

      {/* Footer buttons */}
      <footer className="home-footer">
        <button className="start-button" onClick={() => navigate("/order")}>
          {labels.start}
        </button>

        <button className="login-button" onClick={() => navigate("/login")}>
          {labels.login}
        </button>
      </footer>
    </div>
  );
}

export default HomeScreen;
