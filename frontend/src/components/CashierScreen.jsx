import React, { useState } from "react";
import "./CashierScreen.css";

const API = import.meta.env.VITE_API_URL;

export default function CashierScreen() {
  const [selectedCat, setSelectedCat] = useState(null);

  return (
    <div className="cashier-root">
      {/* Header */}
      <div className="hdr">
        <a className="btn" href={`${API}/auth/logout`}>
          Logout ➔
        </a>
        <div className="hdr-title">Order</div>
        <div className="hdr-name">Cashier</div>
      </div>

      {/* Main area */}
      <div className="main">
        {/* Left grid with categories + menu items */}
        <div className="grid">
          {/* Categories */}
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={`cat-${i}`}
              className={`cat ${selectedCat === i ? "active" : ""}`}
              onClick={() => setSelectedCat(i)}
            >
              Category {i + 1}
            </button>
          ))}

          {/* Menu item placeholders */}
          {Array.from({ length: 20 }).map((_, i) => (
            <button key={`cell-${i}`} className="cell">
              -
            </button>
          ))}
        </div>

        {/* Right order panel */}
        <div className="side">
          <div className="order-box" />
          <div className="total-bar">$0.00</div>
          <button className="checkout">Checkout</button>
        </div>
      </div>
    </div>
  );
}
