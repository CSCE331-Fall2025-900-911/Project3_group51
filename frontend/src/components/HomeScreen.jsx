import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MagnifyControls from "./MagnifyControls.jsx";
import LanguageSelector from "./translation/LanguageSelector.jsx";
import "./HomeScreen.css";

function HomeScreen() {
  const navigate = useNavigate();

  const [weather, setWeather] = useState(null);

  const [tapCount, setTapCount] = useState(0);
  const timerRef = useRef(null);

  const handleSecretTap = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setTapCount((prev) => {
      const next = prev + 1;

      if (next >= 5) {
        navigate("/login");
        return 0;
      }

      timerRef.current = setTimeout(() => setTapCount(0), 1500);
      return next;
    });
  }, [navigate]);

  useEffect(() => {
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!API_KEY) return;

      try {
        const res = await fetch(
          "https://api.openweathermap.org/data/2.5/weather?lat=30.6280&lon=-96.3344&appid=" +
            API_KEY +
            "&units=imperial"
        );
        setWeather(await res.json());
      } catch (err) {
        console.error("Weather API error:", err);
      }
    };

    fetchWeather();
  }, []);

  return (
    <div className="home-container">
      <div
        className="login-tap-zone"
        onClick={handleSecretTap}
        title="Hidden Employee Login Access (Tap 5 times)"
      />

      {/* FINAL FIXED HEADER */}
      <header className="home-header">
        <div className="header-left">
          <MagnifyControls />
        </div>

        <h1 className="home-title">Home</h1>

        <div className="header-right">
          <LanguageSelector />
        </div>
      </header>

      <main className="home-main">
        <div className="weather-box">
          {weather ? (
            <>
              <p>{weather.name}</p>
              <p className="weather-temp">{Math.round(weather.main.temp)}°F</p>
              <p>{weather.weather[0].description}</p>
            </>
          ) : (
            <p>Loading weather...</p>
          )}
        </div>

        <div className="weather-image">
          {weather?.main?.temp > 60 ? (
            <p>It’s warm today.</p>
          ) : (
            <p>It’s cold today.</p>
          )}
        </div>
      </main>

      <footer className="home-footer">
        <button className="start-button" onClick={() => navigate("/order")}>
          Start
        </button>
      </footer>
    </div>
  );
}

export default HomeScreen;
