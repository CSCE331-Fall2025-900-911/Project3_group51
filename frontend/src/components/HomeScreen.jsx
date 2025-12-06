import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MagnifyControls from "./MagnifyControls.jsx";

import "./HomeScreen.css";

function HomeScreen() {
  const navigate = useNavigate();

  /* ----------------------------------------------
     WEATHER STATE
  ---------------------------------------------- */
  const [weather, setWeather] = useState(null);

  /* ----------------------------------------------
     SECRET LOGIN TAP (Tap 5 times)
  ---------------------------------------------- */
  const [tapCount, setTapCount] = useState(0);
  const timerRef = useRef(null);

  const handleSecretTap = useCallback(() => {
    // clear old timer
    if (timerRef.current) clearTimeout(timerRef.current);

    setTapCount((prev) => {
      const newCount = prev + 1;

      if (newCount >= 5) {
        navigate("/login");
        return 0; // reset after login
      }

      // reset tap count after 1.5 seconds
      timerRef.current = setTimeout(() => setTapCount(0), 1500);

      return newCount;
    });
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  /* ----------------------------------------------
     FETCH WEATHER
  ---------------------------------------------- */
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

  /* ----------------------------------------------
     RENDER UI
  ---------------------------------------------- */
  return (
    <div className="home-container">

      {/* Invisible tap zone for employee login */}
      <div
        className="login-tap-zone"
        onClick={handleSecretTap}
        title="Hidden Employee Login Access (Tap 5 times)"
      />

      {/* Header */}
      <header className="home-header">
        <MagnifyControls />
        <h1 className="home-title">Home</h1>
        <div className="nav-placeholder" />
      </header>

      {/* Main Content */}
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
          {weather && weather.main?.temp > 60 ? (
            <p>It’s warm today.</p>
          ) : (
            <p>It’s cold today.</p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <button className="start-button" onClick={() => navigate("/order")}>
          Start
        </button>
      </footer>
    </div>
  );
}

export default HomeScreen;
