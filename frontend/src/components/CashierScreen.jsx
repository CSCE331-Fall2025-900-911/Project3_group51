import React, { useState, useEffect } from "react";
import "./CashierScreen.css";
import { getMenu } from "../api/menu";
import { useNavigate } from "react-router-dom";

export default function CashierScreen() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  // Load menu data
  useEffect(() => {
    getMenu()
      .then((data) => {
        setMenuItems(data);
        const unique = [...new Set(data.map((i) => i.category))];
        setCategories(unique);
        setActiveCategory(unique[0]); // ✅ Always have one active
      })
      .catch((err) => console.error("Error fetching menu:", err));
  }, []);

  const filteredItems = menuItems.filter((i) => i.category === activeCategory);

  return (
    <div className="cashier-root">
      {/* Header */}
      <div className="hdr">
        <button className="btn" onClick={handleLoginClick}>
          Login
        </button>
        <div className="hdr-title">Order</div>
        <div className="hdr-name">Cashier</div>
      </div>

      <div className="main">
        {/* LEFT SIDE — CATEGORIES + ITEMS */}
        <div className="left-side">
          {/* Categories */}
          <div className="categories-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`cat ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Scrollable Item Grid */}
          <div className="grid">
            {filteredItems.map((item) => (
              <button key={item.drinkid} className="cell">
                <div className="item-name">{item.drinkname}</div>
                <div className="item-price">
                  ${Number(item.price).toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE — ORDER PANEL */}
        <div className="side">
          <div className="order-box" />
          <div className="total-bar">$0.00</div>
          <button className="checkout">Checkout</button>
        </div>
      </div>
    </div>
  );
}
