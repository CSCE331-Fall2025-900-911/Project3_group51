import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./HomeScreen.css";

function HomeScreen() {
  const navigate = useNavigate();

  const [weather, setWeather] = useState(null);

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

    fetchWeather();
  }, []);

  return (
    <div className="home-container">

      {/* Header */}
      <header className="home-header">
        <div className="nav-placeholder"></div>
        <h1 className="home-title">Home</h1>

        {/* REMOVE: old language dropdown button */}
        {/* Your global LanguageSelector now handles language changes */}
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

        <button className="login-button" onClick={() => navigate("/login")}>
          Login
        </button>
      </footer>
    </div>
  );
}

export default HomeScreen;
