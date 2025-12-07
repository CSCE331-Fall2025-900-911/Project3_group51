import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

import useLanguage, { LANG_MAP } from "../hooks/useLanguage.js";
import useTranslate from "../hooks/useTranslate";
import { translateText } from "../utils/translate";
import { HOME_LABELS } from "./HomeScreen.labels.js";
import MagnifyControls from "./MagnifyControls.jsx";

import "./HomeScreen.css";

// --- Weather Logic Helper ---
function getDrinkSuggestion(weather) {
  if (!weather || !weather.main) return null;

  const temp = weather.main.temp;
  const condition = weather.weather?.[0]?.main?.toLowerCase() || "";
  const description = weather.weather?.[0]?.description?.toLowerCase() || "";

  // 1. Rain or Snow -> Cozy (High Priority)
  if (condition.includes("rain") || condition.includes("snow") || description.includes("rain")) {
    return {
      title: "Cozy Oreo Ice Blended",
      description: "It's wet outside. Stay dry and treat yourself to something rich and creamy!",
      key: "oreo-ice-blended-w-pearls"
    };
  }

  // 2. Hot Weather (Temp > 80) and Clear -> Refreshing & Fruity
  if (temp > 80 && condition.includes("clear")) {
    return {
      title: "Mango Passion Fruit Green Tea",
      description: "It's a hot, sunny day! Cool off with this tropical refresher.",
      key: "mango-passion-fruit-green-tea"
    };
  }

  // 3. Cold (Temp <= 45) -> Hot Drinks
  if (temp <= 45) {
    return {
      title: "Hot Hokkaido Pearl Milk Tea",
      description: "Brrr, it's cold! Warm up with our rich, caramel-flavored milk tea.",
      key: "hokkaido-pearl-milk-tea"
    };
  }

  // 4. Mild / Cool (45 < Temp <= 70) -> Lean Warm / Classic
  if (temp > 45 && temp <= 70) {
    return {
      title: "Classic Milk Green Tea",
      description: "The weather is just right. Enjoy a classic favorite!",
      key: "classic-milk-green-tea"
    };
  }

  // 5. Warm (Temp > 70) -> Iced / Refreshing (Fallback for warm days)
  return {
    title: "Wintermelon Lemonade",
    description: "Nice and warm today. This zesty drink is perfect for the weather.",
    key: "wintermelon-lemonade"
  };
}

function HomeScreen() {
  const navigate = useNavigate();

  const imageBase = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api\/?$/, "");

  // UI state
  const [showLanguage, setShowLanguage] = useState(false);
  const [weather, setWeather] = useState(null);
  const [translatedDesc, setTranslatedDesc] = useState("");

  // NEW: State for recommendations
  const [drinkSuggestion, setDrinkSuggestion] = useState(null);
  const [weatherError, setWeatherError] = useState(false);

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
      if (!API_KEY) {
        console.warn("No Weather API Key found.");
        setWeatherError(true);
        return;
      }

      try {
        const lat = "30.6280";
        const lon = "-96.3344";

        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`
        );

        if (!res.ok) throw new Error("Weather fetch failed");

        const data = await res.json();
        setWeather(data);
        setDrinkSuggestion(getDrinkSuggestion(data));
        setWeatherError(false);
      } catch (err) {
        console.error("Weather API error:", err);
        setWeatherError(true);
      }
    };

    fetchWeather();
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
          ) : weatherError ? (
            <p>We couldn’t load the weather. Try one of our classic iced or hot coffees!</p>
          ) : (
            <p>{labels.weatherLoading}</p>
          )}
        </div>

        <div className="weather-image">
          {drinkSuggestion ? (
            <div>
              <img
                src={`${imageBase}/images/${drinkSuggestion.key}.webp`}
                alt={drinkSuggestion.title}
                className="weather-drink-image"
              />

              <h2>{drinkSuggestion.title}</h2>
              <p>{drinkSuggestion.description}</p>
            </div>
          ) : weatherError ? (
            <p>We couldn’t load the weather. Try one of our classic iced or hot coffees!</p>
          ) : (
            <p>{labels.weatherLoading}</p>
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
