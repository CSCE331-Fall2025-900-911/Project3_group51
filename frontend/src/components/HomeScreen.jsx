import React from 'react';

function HomeScreen() {
  return (
    <div className="home-container">
      
      {/* 1. Top (Home, Language) */}
      <nav>
        <button>Home</button>
        <button>Language</button>
      </nav>

      {/* 2. Mid */}
      <main>
        <div className="weather-box">Weather</div>
        <div className="weather-image">Image based on weather</div>
      </main>

      {/* 3. Bottom (Start, Login) */}
      <footer>
        <button className="start-button">Tap to Start Order</button>
        <button className="login-button">Employee Login</button>
      </footer>

    </div>
  );
}

export default HomeScreen;