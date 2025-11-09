import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeScreen.css'; // Import the CSS file

function HomeScreen() {
  const navigate = useNavigate();
  const [showLanguage, setShowLanguage] = useState(false);
  const [weather, setWeather] = useState(null);

useEffect(() => {
  const fetchWeather = async () => {
    const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

    if (!API_KEY) {
      console.error("Missing OpenWeather API key (frontend/.env.local). Must start with VITE_");
      return;
    }

    const lat = '30.6280';
    const lon = '-96.3344';

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setWeather(data);
    } catch (err) {
      console.error("Failed to fetch weather data:", err);
    }
  };

  //fetchWeather();
}, []);

  const handleStartOrder = () => {
    navigate('/order'); 
  };
  
  const handleEmployeeLogin = () => {
    navigate('/login')
  };

  return (
    <div className="home-container">
      
      {/* This header is now modeled after OrderScreen.jsx */}
      <header className="home-header">
        
        {/* Empty div for spacing, balances the "Language" button */}
        <div className="nav-placeholder"></div>
        
        {/* The title label "Home" in the center */}
        <h1 className="home-title">Home</h1>
        
        {/* Language button on the right */}
        <button className="nav-btn lang-btn" onClick={() => setShowLanguage(!showLanguage)}>
          Language
        </button>
      </header>

      {/* Conditionally render the language dropdown based on state */}
      {showLanguage && (
        <div className="language-dropdown">
          <button>English</button>
          <button>Espanol</button>
          <button>Francis</button>
          <button>Italino</button>
        </div>
      )}

      {/* Main content and footer remain the same */}
      <main className="home-main">
        {/* Weather box */}
        <div className="weather-box">
          {weather ? (
            <>
              <p>{weather.name}</p>
              <p className="weather-temp">{Math.round(weather.main.temp)}°F</p>
              <p>{weather.weather[0].description}</p>
            </>
          ) : (
            <p>Loading Weather...</p>
          )}
        </div>
            
        <div className="weather-image">
          {weather && weather.main && weather.main.temp > 60 ? (
            <p>Image based on warm weather (e.g., Iced Tea)</p>
          ) : (
            <p>Image based on cold weather (e.g., Hot Coffee)</p>
          )}
        </div>
      </main>

      <footer className="home-footer">
        {/* ... (start button code) ... */}
        <button className="start-button" onClick={handleStartOrder}>
          Tap to Start Order
        </button>
        <button className="login-button" onClick={handleEmployeeLogin}>
          Employee Login
        </button>
      </footer>

    </div>
  );
}

export default HomeScreen;