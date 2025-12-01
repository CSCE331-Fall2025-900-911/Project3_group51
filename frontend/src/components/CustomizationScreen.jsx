import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import "./CustomizationScreen.css";

// Language + translation
import useLanguage from "../hooks/useLanguage";
import useTranslate from "../hooks/useTranslate";
import { CUSTOM_LABELS } from "./CustomizationScreen.labels";

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

  // Language system
  const { selectedLang } = useLanguage();
  const labels = useTranslate(CUSTOM_LABELS, selectedLang);

  // Drink item from navigation
  const locationState = location.state || {};
  const { item } = locationState;
  const orderOrigin = locationState.origin || "customer";
  const returnTo =
    locationState.returnTo || (orderOrigin === "cashier" ? "/cashier" : "/order");

  useEffect(() => {
    sessionStorage.setItem("orderOrigin", orderOrigin);
  }, [orderOrigin]);

  // ------------------------------
  // Local UI State
  // ------------------------------
  const [iceLevel, setIceLevel] = useState("Regular Ice");
  const [sugarLevel, setSugarLevel] = useState("100% Sugar");
  const [toppings, setToppings] = useState([]);

  // ------------------------------
  // Memoized maps (stable, no re-renders)
  // ------------------------------
  const iceMap = useMemo(
    () => Object.fromEntries(ICE_OPTIONS.map((o) => [o, o])),
    []
  );
  const sugarMap = useMemo(
    () => Object.fromEntries(SUGAR_OPTIONS.map((o) => [o, o])),
    []
  );
  const toppingMap = useMemo(
    () => Object.fromEntries(TOPPING_OPTIONS.map((t) => [t.name, t.name])),
    []
  );

  // ------------------------------
  // Safe translations (no loops)
  // ------------------------------
  const translatedIce = useTranslate(iceMap, selectedLang);
  const translatedSugar = useTranslate(sugarMap, selectedLang);
  const translatedToppings = useTranslate(toppingMap, selectedLang);

  // ------------------------------
  // Topping selector
  // ------------------------------
  const handleToppingClick = (name) => {
    setToppings((prev) => {
      if (prev.includes(name)) return prev.filter((t) => t !== name);
      return prev.length < 2 ? [...prev, name] : prev;
    });
  };

  // ------------------------------
  // Confirm button
  // ------------------------------
  const handleConfirm = () => {
    let basePrice = parseFloat(item.price);
    let toppingsPrice = 0;

    toppings.forEach((name) => {
      const found = TOPPING_OPTIONS.find((t) => t.name === name);
      toppingsPrice += found ? parseFloat(found.price) : 0;
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
      quantity: 1,
      isCustom: true,
      cartItemId: `${item.drinkid}-${uniqueSuffix}`,
      origin: orderOrigin,
    };

    addToCart(customizedItem);
    navigate(returnTo);
  };

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <div className="custom-page">
      <h1 className="custom-title">
        {labels.customization} ({item.drinkname})
      </h1>

      <div className="custom-content">
        {/* LEFT COLUMN */}
        <div className="custom-column">
          {/* ICE */}
          <section className="custom-section">
            <h2>{labels.iceLevel}</h2>
            <div className="custom-grid grid-2-col">
              {ICE_OPTIONS.map((name) => (
                <button
                  key={name}
                  className={`option-btn ${iceLevel === name ? "selected" : ""}`}
                  onClick={() => setIceLevel(name)}
                >
                  {translatedIce[name]}
                </button>
              ))}
            </div>
          </section>

          {/* SUGAR */}
          <section className="custom-section">
            <h2>{labels.sugarLevel}</h2>
            <div className="custom-grid grid-2-col">
              {SUGAR_OPTIONS.map((name) => (
                <button
                  key={name}
                  className={`option-btn ${
                    sugarLevel === name ? "selected" : ""
                  }`}
                  onClick={() => setSugarLevel(name)}
                >
                  {translatedSugar[name]}
                </button>
              ))}
            </div>
          </section>

          {/* OTHER */}
          <section className="custom-section">
            <h2>{labels.otherCustom}</h2>
            <textarea className="custom-textarea" rows="5"></textarea>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="custom-column">
          {/* TOPPINGS */}
          <section className="custom-section">
            <h2>{labels.chooseToppings}</h2>
            <div className="custom-grid grid-2-col">
              {TOPPING_OPTIONS.map((item) => (
                <button
                  key={item.name}
                  className={`option-btn topping ${
                    toppings.includes(item.name) ? "selected" : ""
                  }`}
                  onClick={() => handleToppingClick(item.name)}
                  disabled={
                    toppings.length >= 2 && !toppings.includes(item.name)
                  }
                >
                  <span>{translatedToppings[item.name]}</span>
                  <span className="topping-price">({item.price})</span>
                </button>
              ))}
            </div>
          </section>

          <button className="confirm-btn" onClick={handleConfirm}>
            {labels.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomizationScreen;
