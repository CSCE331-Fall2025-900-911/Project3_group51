import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './CustomizationScreen.css';

import useLanguage from "../hooks/useLanguage";
import useTranslate from "../hooks/useTranslate";
import { CUSTOM_LABELS } from "./CustomizationScreen.labels";

function CustomizationScreen({ addToCart }) {
  const { drinkid } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { selectedLang } = useLanguage();
  const labels = useTranslate(CUSTOM_LABELS, selectedLang);

  const locationState = location.state || {};
  const { item } = locationState;
  const orderOrigin = locationState.origin || "customer";
  const returnTo = locationState.returnTo || (orderOrigin === "cashier" ? "/cashier" : "/order");

  useEffect(() => {
    sessionStorage.setItem("orderOrigin", orderOrigin);
  }, [orderOrigin]);

  // Local UI state
  const [iceLevel, setIceLevel] = useState('Regular Ice');
  const [sugarLevel, setSugarLevel] = useState('100% Sugar');
  const [toppings, setToppings] = useState([]);

  // Options
  const iceOptions = ['Regular Ice', 'Light Ice', 'No Ice', 'Extra Ice'];
  const sugarOptions = ['100% Sugar', '80% Sugar', '50% Sugar', '30% Sugar', 'No Sugar', '120% Sugar'];
  const toppingOptions = [
    { name: 'Pearl (Boba)', price: '+0.75' },
    { name: 'Coffee Jelly', price: '+0.75' },
    { name: 'Pudding', price: '+0.75' },
    { name: 'Lychee Jelly', price: '+0.75' },
    { name: 'Honey Jelly', price: '+0.75' },
    { name: 'Crystal Boba', price: '+0.75' },
    { name: 'Mango Popping Boba', price: '+1.00' },
    { name: 'Strawberry Popping Boba', price: '+1.00' },
    { name: 'Ice Cream', price: '+1.00' },
    { name: 'Creama', price: '+1.25' },
  ];

  // Memoized translation maps
  const iceMap = useMemo(
    () => Object.fromEntries(iceOptions.map(o => [o, o])),
    [iceOptions]
  );
  const sugarMap = useMemo(
    () => Object.fromEntries(sugarOptions.map(o => [o, o])),
    [sugarOptions]
  );
  const toppingMap = useMemo(
    () => Object.fromEntries(toppingOptions.map(t => [t.name, t.name])),
    [toppingOptions]
  );

  const translatedIce = useTranslate(iceMap, selectedLang);
  const translatedSugar = useTranslate(sugarMap, selectedLang);
  const translatedToppings = useTranslate(toppingMap, selectedLang);

  // Topping selection
  const handleToppingClick = (toppingName) => {
    setToppings(prev => {
      if (prev.includes(toppingName)) {
        return prev.filter(t => t !== toppingName);
      }
      return prev.length < 2 ? [...prev, toppingName] : prev;
    });
  };

  // Confirm button logic
  const handleConfirm = () => {
    let basePrice = parseFloat(item.price);
    let toppingsPrice = 0;

    toppings.forEach(name => {
      const found = toppingOptions.find(t => t.name === name);
      toppingsPrice += found ? parseFloat(found.price) : 0;
    });

    const finalPrice = basePrice + toppingsPrice;

    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

  return (
    <div className="custom-page">
      <h1 className="custom-title">
        {labels.customization} ({item.drinkname})
      </h1>

      <div className="custom-content">

        {/* Left column */}
        <div className="custom-column">

          {/* Ice */}
          <section className="custom-section">
            <h2>{labels.iceLevel}</h2>
            <div className="custom-grid grid-2-col">
              {iceOptions.map(name => (
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

          {/* Sugar */}
          <section className="custom-section">
            <h2>{labels.sugarLevel}</h2>
            <div className="custom-grid grid-2-col">
              {sugarOptions.map(name => (
                <button
                  key={name}
                  className={`option-btn ${sugarLevel === name ? "selected" : ""}`}
                  onClick={() => setSugarLevel(name)}
                >
                  {translatedSugar[name]}
                </button>
              ))}
            </div>
          </section>

          {/* Other */}
          <section className="custom-section">
            <h2>{labels.otherCustom}</h2>
            <textarea className="custom-textarea" rows="5"></textarea>
          </section>

        </div>

        {/* Right column */}
        <div className="custom-column">

          {/* Toppings */}
          <section className="custom-section">
            <h2>{labels.chooseToppings}</h2>
            <div className="custom-grid grid-2-col">
              {toppingOptions.map(item => (
                <button
                  key={item.name}
                  className={`option-btn topping ${toppings.includes(item.name) ? "selected" : ""}`}
                  onClick={() => handleToppingClick(item.name)}
                  disabled={toppings.length >= 2 && !toppings.includes(item.name)}
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
