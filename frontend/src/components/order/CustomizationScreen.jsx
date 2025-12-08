import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import "./CustomizationScreen.css";

const SIZE_OPTIONS = ["Medium", "Large"];
const TEMP_OPTIONS = ["Cold", "Hot"];

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

const LARGE_SIZE_EXTRA = 0.50;

function CustomizationScreen({ addToCart }) {
  const { drinkid } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state || {};
  const { item } = locationState;
  const orderOrigin = locationState.origin || "customer";
  const returnTo =
    locationState.returnTo || (orderOrigin === "cashier" ? "/cashier" : "/order");

  useEffect(() => {
    sessionStorage.setItem("orderOrigin", orderOrigin);
  }, [orderOrigin]);

  const [size, setSize] = useState("Medium");
  const [temperature, setTemperature] = useState("Cold");
  const [iceLevel, setIceLevel] = useState("Regular Ice");
  const [sugarLevel, setSugarLevel] = useState("100% Sugar");
  const [toppings, setToppings] = useState([]);
  const [comments, setComments] = useState("");

  const calculateTotalPrice = () => {
    let price = parseFloat(item.price);
    
    if (size === "Large") {
      price += LARGE_SIZE_EXTRA;
    }

    toppings.forEach((name) => {
      const found = TOPPING_OPTIONS.find((t) => t.name === name);
      if (found) price += parseFloat(found.price);
    });

    return price.toFixed(2);
  };

  useEffect(() => {
    if (temperature === "Hot") {
      setIceLevel("No Ice");
    } else if (iceLevel === "No Ice" && temperature === "Cold") {
      setIceLevel("Regular Ice");
    }
  }, [temperature]);

  const handleToppingClick = (name) => {
    setToppings((prev) => {
      if (prev.includes(name)) return prev.filter((t) => t !== name);
      return [...prev, name];
    });
  };

  const handleConfirm = () => {
    const finalPrice = calculateTotalPrice();

    const uniqueSuffix = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const customizedItem = {
      id: item.drinkid,
      name: `${item.drinkname} (${size}, ${temperature})`,
      price: finalPrice,
      size: size,
      temperature: temperature,
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
        <div className="custom-column">
          
          <section className="custom-section">
            <h2>Size & Temperature</h2>
            <div className="custom-grid grid-2-col">
              {SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  className={`option-btn ${size === opt ? "selected" : ""}`}
                  onClick={() => setSize(opt)}
                >
                  {opt}
                  {opt === "Large" && <span style={{display:"block", fontSize:"0.8em", color:"#666"}}>(+${LARGE_SIZE_EXTRA.toFixed(2)})</span>}
                </button>
              ))}
              
              {TEMP_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  className={`option-btn ${temperature === opt ? "selected" : ""}`}
                  onClick={() => setTemperature(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>

          <section className="custom-section">
            <h2>Ice Level</h2>
            <div className="custom-grid grid-2-col">
              {ICE_OPTIONS.map((name) => (
                <button
                  key={name}
                  className={`option-btn ${iceLevel === name ? "selected" : ""}`}
                  onClick={() => setIceLevel(name)}
                  disabled={temperature === "Hot"}
                >
                  {name}
                </button>
              ))}
            </div>
          </section>

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
        </div>

        <div className="custom-column">
          
          <section className="custom-section">
            {/* 텍스트 수정: Max 2 문구 제거 */}
            <h2>Choose Toppings</h2>
            <div className="custom-grid grid-2-col">
              {TOPPING_OPTIONS.map((t) => (
                <button
                  key={t.name}
                  className={`option-btn topping ${
                    toppings.includes(t.name) ? "selected" : ""
                  }`}
                  onClick={() => handleToppingClick(t.name)}
                  // disabled 속성 제거 (무제한 선택 가능)
                >
                  <span>{t.name}</span>
                  <span className="topping-price">({t.price})</span>
                </button>
              ))}
            </div>
          </section>

          <section className="custom-section">
            <h2>Other Customization</h2>
            <textarea
              className="custom-textarea"
              rows="3"
              maxLength={255}
              placeholder="Any special requests?"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            ></textarea>
          </section>

          <button className="confirm-btn" onClick={handleConfirm}>
            Confirm - ${calculateTotalPrice()}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomizationScreen;