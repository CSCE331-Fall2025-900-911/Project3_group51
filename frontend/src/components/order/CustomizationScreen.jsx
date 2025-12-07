import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import "./CustomizationScreen.css";

const ICE_OPTIONS = ["Regular Ice", "Light Ice", "No Ice", "Extra Ice"];

const SUGAR_OPTIONS = [
  "100% Sugar",
  "80% Sugar",
  "50% Sugar",
  "30% Sugar",
  "No Sugar",
  "120% Sugar",
];

const TOPPING_OPTIONS = [
  { name: "Pearl (Boba)", price: "+0.75" },
  { name: "Coffee Jelly", price: "+0.75" },
  { name: "Pudding", price: "+0.75" },
  { name: "Lychee Jelly", price: "+0.75" },
  { name: "Honey Jelly", price: "+0.75" },
  { name: "Crystal Boba", price: "+0.75" },
  { name: "Mango Popping Boba", price: "+1.00" },
  { name: "Strawberry Popping Boba", price: "+1.00" },
  { name: "Ice Cream", price: "+1.00" },
  { name: "Creama", price: "+1.25" },
];

function CustomizationScreen({ addToCart }) {
  const { drinkid } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Drink item passed from OrderScreen
  const locationState = location.state || {};
  const { item } = locationState;
  const orderOrigin = locationState.origin || "customer";
  const returnTo =
    locationState.returnTo || (orderOrigin === "cashier" ? "/cashier" : "/order");

  useEffect(() => {
    sessionStorage.setItem("orderOrigin", orderOrigin);
  }, [orderOrigin]);

  // Local UI state
  const [iceLevel, setIceLevel] = useState("Regular Ice");
  const [sugarLevel, setSugarLevel] = useState("100% Sugar");
  const [toppings, setToppings] = useState([]);
  const [comments, setComments] = useState("");

  // Select/deselect toppings (max 2)
  const handleToppingClick = (name) => {
    setToppings((prev) => {
      if (prev.includes(name)) return prev.filter((t) => t !== name);
      return prev.length < 2 ? [...prev, name] : prev;
    });
  };

  // Add customized drink to cart
  const handleConfirm = () => {
    let basePrice = parseFloat(item.price);
    let toppingsPrice = 0;

    toppings.forEach((name) => {
      const found = TOPPING_OPTIONS.find((t) => t.name === name);
      if (found) toppingsPrice += parseFloat(found.price);
    });

    const finalPrice = basePrice + toppingsPrice;

    const uniqueSuffix = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const customizedItem = {
      id: item.drinkid,
      name: `${item.drinkname} (Custom)`,
      price: finalPrice.toFixed(2),
      ice: iceLevel,
      sugar: sugarLevel,
      toppings,
      comments: comments.slice(0, 255),
      quantity: 1,
      isCustom: true,
      cartItemId: `${item.drinkid}-${uniqueSuffix}`,
      origin: orderOrigin,
    };

    addToCart(customizedItem);
    navigate(returnTo);
  };

  return (
    <div className="custom-page">
      <div className="custom-content">
        {/* LEFT COLUMN */}
        <div className="custom-column">
          
          {/* ICE */}
          <section className="custom-section">
            <h2>Ice Level</h2>
            <div className="custom-grid grid-2-col">
              {ICE_OPTIONS.map((name) => (
                <button
                  key={name}
                  className={`option-btn ${iceLevel === name ? "selected" : ""}`}
                  onClick={() => setIceLevel(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </section>

          {/* SUGAR */}
          <section className="custom-section">
            <h2>Sugar Level</h2>
            <div className="custom-grid grid-2-col">
              {SUGAR_OPTIONS.map((name) => (
                <button
                  key={name}
                  className={`option-btn ${sugarLevel === name ? "selected" : ""}`}
                  onClick={() => setSugarLevel(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </section>

          {/* OTHER CUSTOMIZATION */}
          <section className="custom-section">
            <h2>Other Customization</h2>
            <textarea
              className="custom-textarea"
              rows="5"
              maxLength={255}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            ></textarea>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="custom-column">
          
          {/* TOPPINGS */}
          <section className="custom-section">
            <h2>Choose Toppings (Max 2)</h2>
            <div className="custom-grid grid-2-col">
              {TOPPING_OPTIONS.map((t) => (
                <button
                  key={t.name}
                  className={`option-btn topping ${
                    toppings.includes(t.name) ? "selected" : ""
                  }`}
                  onClick={() => handleToppingClick(t.name)}
                  disabled={toppings.length >= 2 && !toppings.includes(t.name)}
                >
                  <span>{t.name}</span>
                  <span className="topping-price">({t.price})</span>
                </button>
              ))}
            </div>
          </section>

          {/* CONFIRM BUTTON */}
          <button className="confirm-btn" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomizationScreen;
