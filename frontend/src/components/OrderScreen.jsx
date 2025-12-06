import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "./OrderScreen.css";
import { getMenu } from "../api/menu.js";
import MagnifyControls from "./MagnifyControls.jsx";

// Language + translation hooks
import useLanguage from "../hooks/useLanguage";
import useTranslate from "../hooks/useTranslate";
import { ORDER_LABELS } from "./OrderScreen.labels.js";

function OrderScreen({ cart, setCart }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Global language state
  const { selectedLang, setSelectedLang } = useLanguage();
  const labels = useTranslate(ORDER_LABELS, selectedLang);

  // Local state
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [error, setError] = useState(null);

  // Is this order coming from cashier?
  const cashierOrder = location.state?.returnTo === "/cashier";
  const cancelDestination = cashierOrder ? "/cashier" : "/";
  const imageBase = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api$/, "");
  useEffect(() => {
    sessionStorage.setItem("orderOrigin", cashierOrder ? "cashier" : "customer");
  }, [cashierOrder]);

  // Fetch menu items
  useEffect(() => {
    getMenu()
      .then((data) => {
        setMenuItems(data);
        setCategories([...new Set(data.map((d) => d.category))]);
      })
      .catch((err) => {
        console.error("Failed to fetch menu:", err);
        setError("Could not load menu. Please try again later.");
      });
  }, []);

  // Memoized translation sources
  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c, c])),
    [categories]
  );

  const drinkNameMap = useMemo(
    () => Object.fromEntries(menuItems.map((i) => [i.drinkid, i.drinkname])),
    [menuItems]
  );

  // Translate dynamic text
  const translatedCategories = useTranslate(categoryMap, selectedLang);
  const translatedDrinkNames = useTranslate(drinkNameMap, selectedLang);

  // Handle selecting drink
  const handleItemClick = (item) => {
    navigate(`/order/${item.drinkid}`, {
      state: { item, returnTo: "/order", origin: "customer" },
    });
  };

  // Handle category filter
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleQuantityChange = (index, delta) => {
    if (!setCart) return;
    setCart((prev = []) => {
      if (!prev[index]) return prev;
      const next = [...prev];
      const current = next[index];
      const currentQty = current.quantity ?? 1; 
      const updatedQty = Math.max(0, currentQty + delta);
      
      if (updatedQty === 0) {
        next.splice(index, 1);
      } else {
        next[index] = { ...current, quantity: updatedQty };
      }
      return next;
    });
  };

  // Checkout
  const handleCheckout = () => {
    navigate("/checkout", {
      state: {
        returnTo: cashierOrder ? "/cashier" : "/order",
        completeReturnTo: cashierOrder ? "/cashier" : "/",
      },
    });
  };

  // Cancel order
  const confirmCancelOrder = () => {
    setShowCancelConfirm(false);
    setCart?.([]);
    navigate(cancelDestination);
  };

  // Subtotal
  const subtotal = cart.reduce((acc, item) => {
    const qty = item.quantity ?? 1;
    return acc + parseFloat(item.price) * qty;
  }, 0);

  if (error) {
    return (
      <div className="menu-page">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="menu-page">
      {/* Header */}
      <header className="header">
        <MagnifyControls />
        <h1 className="menu-title">{labels.menu}</h1>

        <button className="nav-btn" onClick={() => setShowLanguage(!showLanguage)}>
          <img 
            src={`${imageBase}/images/Icons/Language.png`} 
            alt="Language Icon" 
            className="nav-icon" 
          />
          {labels.language}
        </button>
      </header>

      {/* Language Dropdown */}
      {showLanguage && (
        <div className="language-dropdown">
          {["English", "Español", "Français", "Italiano", "Tiếng Việt", "한국어"].map(
            (lang) => (
              <button
                key={lang}
                className={lang === selectedLang ? "selected" : ""} 
                onClick={() => {
                  setSelectedLang(lang);
                  setShowLanguage(false);
                }}
              >
                {lang}
              </button>
            )
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="content">
        {/* Categories */}
        <aside className="categories">
          <h2>{labels.categories}</h2>

          <button
            className={`category-btn ${!selectedCategory ? "selected" : ""}`}
            onClick={() => handleCategoryClick(null)}
          >
            {labels.all}
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? "selected" : ""}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {translatedCategories[cat]}
            </button>
          ))}
        </aside>

        {/* Menu Grid */}
        <main className="menu-grid">
          {menuItems
            .filter((i) => !selectedCategory || i.category === selectedCategory)
            .map((item) => {
              const categoryClass = item.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');
              
              return (
                <button
                  key={item.drinkid}
                  className={`menu-item category-${categoryClass}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="item-image">
                    {item.image ? (
                      <img
                        src={`${imageBase}/images/${item.image}`}
                        alt={item.drinkname}
                      />
                    ) : (
                      <span>Item Image</span>
                    )}
                  </div>
                  <div className="item-name">{item.drinkname}</div>
                  <div className="item-price">${item.price}</div>
                </button>
              );
            })}
        </main>
      </div>

      {/* Footer */}
      <footer className="order-summary">
        <button className="nav-btn" onClick={() => setShowCancelConfirm(true)}>
          {labels.cancelOrder}
        </button>

        <div className="current-order">
          <h3>{labels.currentOrder}</h3>
        </div>

        <div className="order-items">
          {cart.length === 0 ? (
            <p>{labels.emptyCart}</p>
          ) : (
            cart.map((item, idx) => {
              const qty = item.quantity ?? 1;
              const total = (parseFloat(item.price) * qty).toFixed(2);
              const translatedName = translatedDrinkNames[item.name] || item.name;

              return (
                  <div key={idx} className="order-row-item">
                    <span className="item-name-qty">
                        {translatedName} x {qty}
                    </span>
                    
                    <span className="item-price-total">
                        ${total}
                    </span>
                    
                    <div className="item-controls">
                        <button 
                            className="control-btn" 
                            onClick={() => handleQuantityChange(idx, -1)}
                        >
                            -
                        </button>
                        <button 
                            className="control-btn" 
                            onClick={() => handleQuantityChange(idx, 1)}
                        >
                            +
                        </button>
                    </div>
                </div>
              );
            })
          )}
        </div>

        <div className="subtotal">
          {labels.subtotal}: ${subtotal.toFixed(2)}
        </div>

        <button className="checkout-btn" onClick={handleCheckout}>
          <img 
            src={`${imageBase}/images/Icons/Cart.png`} 
            alt="Cart Icon" 
            className="checkout-icon" 
          />
          {labels.checkout}
        </button>
      </footer>

      {/* Cancel Modal */}
      {showCancelConfirm && (
        <div className="modal-backdrop">
          <div className="modal">
            <p>{labels.confirmCancelTitle}</p>

            <div className="modal-actions">
              <button className="nav-btn" onClick={confirmCancelOrder}>
                {labels.confirmCancelYes}
              </button>
              <button className="nav-btn" onClick={() => setShowCancelConfirm(false)}>
                {labels.confirmCancelNo}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderScreen;
