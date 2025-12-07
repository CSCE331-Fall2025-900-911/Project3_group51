import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MagnifyControls from "./MagnifyControls.jsx";
import LanguageSelector from "./translation/LanguageSelector.jsx";
import "./HomeScreen.css";

// Base API for images
const imageBase = (import.meta.env.VITE_API_URL || "http://localhost:3000/api")
  .replace(/\/api$/, "");

// Labels fallback (if your translation hook not used here)
const labels = {
  start: "Start",
  weatherLoading: "Loading weather...",
};

// --- Weather Logic Helper ---
function getDrinkSuggestion(weather) {
  if (!weather || !weather.main) return null;

  const temp = weather.main.temp;
  const condition = weather.weather?.[0]?.main?.toLowerCase() || "";
  const description = weather.weather?.[0]?.description?.toLowerCase() || "";

  if (condition.includes("rain") || condition.includes("snow") || description.includes("rain")) {
    return {
      title: "Cozy Oreo Ice Blended",
      description: "It's wet outside. Treat yourself to something rich and creamy!",
      key: "oreo-ice-blended-w-pearls"
    };
  }

  if (temp > 80 && condition.includes("clear")) {
    return {
      title: "Mango Passion Fruit Green Tea",
      description: "Hot day? Cool off with this tropical refresher.",
      key: "mango-passion-fruit-green-tea"
    };
  }

  if (temp <= 45) {
    return {
      title: "Hot Hokkaido Pearl Milk Tea",
      description: "Warm up with our rich caramel-flavored milk tea.",
      key: "hokkaido-pearl-milk-tea"
    };
  }

  if (temp > 45 && temp <= 70) {
    return {
      title: "Classic Milk Green Tea",
      description: "The weather is perfect for a classic favorite!",
      key: "classic-milk-green-tea"
    };
  }

  return {
    title: "Wintermelon Lemonade",
    description: "Warm day? Enjoy this refreshing citrus drink.",
    key: "wintermelon-lemonade"
  };
}

function HomeScreen() {
  const navigate = useNavigate();

  const [weather, setWeather] = useState(null);
  const [drinkSuggestion, setDrinkSuggestion] = useState(null);
  const [weatherError, setWeatherError] = useState(false);

  // Secret Login Tap
  const tapRef = useRef(0);
  const timerRef = useRef(null);

  const handleSecretTap = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    tapRef.current += 1;

    if (tapRef.current >= 5) {
      navigate("/login");
      tapRef.current = 0;
      return;
    }

    timerRef.current = setTimeout(() => (tapRef.current = 0), 1500);
  }, [navigate]);

  useEffect(() => {
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, []);

  // Fetch Weather
  useEffect(() => {
    const fetchWeather = async () => {
      const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!API_KEY) {
        setWeatherError(true);
        return;
      }

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=30.6280&lon=-96.3344&appid=${API_KEY}&units=imperial`
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

  return (
    <div className="home-container">
      {/* Invisible secret login zone */}
      <div
        className="login-tap-zone"
        onClick={handleSecretTap}
        title="Tap 5 times to access login"
      />

      {/* HEADER */}
      <header className="home-header">
        <div className="header-left">
          <MagnifyControls />
        </div>

        <h1 className="home-title">Home</h1>

        <div className="header-right">
          <LanguageSelector />
        </div>
      </header>

      {/* MAIN */}
      <main className="home-main">
        <div className="weather-box">
          {weather ? (
            <>
              <p>{weather.name}</p>
              <p className="weather-temp">{Math.round(weather.main.temp)}°F</p>
              <p>{weather.weather[0].description}</p>
            </>
          ) : weatherError ? (
            <p>We couldn’t load the weather.</p>
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
            <p>Try one of our classic iced or hot drinks!</p>
          ) : (
            <p>{labels.weatherLoading}</p>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="home-footer">
        <button
          className="start-button"
          onClick={() => {
            sessionStorage.removeItem("customerInfo");
            sessionStorage.removeItem("identityPrompted");
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
