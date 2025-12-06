import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "./OrderScreen.css";
import { getMenu } from "../api/menu.js";
import { identifyCustomer, createCustomer } from "../api/customers.js";
import MagnifyControls from "./MagnifyControls.jsx";

// Language + translation hooks
import useLanguage from "../hooks/useLanguage";
import useTranslate from "../hooks/useTranslate";
import { ORDER_LABELS } from "./OrderScreen.labels.js";

function OrderScreen({ cart, setCart, customer, setCustomer }) {
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
  const [showIdentityPrompt, setShowIdentityPrompt] = useState(false);
  const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "" });
  const [error, setError] = useState(null); // menu load errors
  const [identityError, setIdentityError] = useState(null);
  const [allowAnon, setAllowAnon] = useState(false);
  const [identityPrompted, setIdentityPrompted] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("identityPrompted") === "true";
  });
  const [offerCreate, setOfferCreate] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [contactMode, setContactMode] = useState("phone"); // 'phone' | 'email'
  const resetFromHomeRef = React.useRef(false);
  const fromHome = location.state?.fromHome || false;

  // Is this order coming from cashier?
  const cashierOrder = location.state?.returnTo === "/cashier";
  const cancelDestination = cashierOrder ? "/cashier" : "/";
  const imageBase = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api$/, "");
  useEffect(() => {
    sessionStorage.setItem("orderOrigin", cashierOrder ? "cashier" : "customer");
  }, [cashierOrder]);

  // Trigger identity prompt only once per order, and only when entering from Home
  useEffect(() => {
    if (fromHome && !customer && !allowAnon && !identityPrompted) {
      setShowIdentityPrompt(true);
    }
  }, [fromHome, customer, allowAnon, identityPrompted]);

  // If entering from Home, clear any previous customer once
  useEffect(() => {
    if (fromHome && !resetFromHomeRef.current) {
      resetFromHomeRef.current = true;
      setCustomer?.(null);
      setAllowAnon(false);
      setIdentityPrompted(false);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("customerInfo");
        sessionStorage.removeItem("identityPrompted");
      }
    }
  }, [fromHome, setCustomer]);

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
    if (fromHome && !customer && !allowAnon) {
      setShowIdentityPrompt(true);
      return;
    }
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
    if (fromHome && !customer && !allowAnon) {
      setShowIdentityPrompt(true);
      return;
    }
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

  const handleIdentify = async () => {
    if (contactMode === "phone" && !contactInfo.phone) {
      setIdentityError("Please enter a phone number.");
      return;
    }
    if (contactMode === "email" && !contactInfo.email) {
      setIdentityError("Please enter an email address.");
      return;
    }
    try {
      const result = await identifyCustomer({
        phone: contactMode === "phone" ? contactInfo.phone || null : null,
        email: contactMode === "email" ? contactInfo.email || null : null,
      });
      setCustomer?.({
        id: result.id,
        phone: result.phone,
        email: result.email,
        points: result.points ?? 0,
      });
      setShowIdentityPrompt(false);
      setIdentityError(null);
      setIdentityPrompted(true);
      setOfferCreate(false);
      setShowCreateForm(false);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("identityPrompted", "true");
      }
    } catch (e) {
      console.error("Failed to identify customer", e);
      if (e.status === 404) {
        setOfferCreate(true);
        setShowCreateForm(false);
        setIdentityError("No account found. Try again or create a new account.");
      } else {
        setIdentityError("Could not verify customer. Please try again.");
      }
    }
  };

  const handleCreateCustomer = async () => {
    if (!contactInfo.name || !contactInfo.phone || !contactInfo.email) {
      setIdentityError("Full name, phone, and email are required.");
      return;
    }
    try {
      const result = await createCustomer({
        name: contactInfo.name || null,
        phone: contactInfo.phone || null,
        email: contactInfo.email || null,
      });
      setCustomer?.({
        id: result.id,
        name: result.name,
        phone: result.phone,
        email: result.email,
        points: result.points ?? 0,
      });
      setShowIdentityPrompt(false);
      setOfferCreate(false);
      setShowCreateForm(false);
      setIdentityError(null);
      setIdentityPrompted(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("identityPrompted", "true");
      }
    } catch (e) {
      console.error("Failed to create customer", e);
      setIdentityError("Could not create customer. Please try again.");
    }
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
          {customer && (
            <small>Points: {customer.points ?? 0}</small>
          )}
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

      {/* Identity Modal */}
      {showIdentityPrompt && (
        <div className="modal-backdrop">
          <div className="modal">
            <p>Please enter your details to earn/use points.</p>
            {showCreateForm && (
              <input
                type="text"
                placeholder="Full Name (required)"
                value={contactInfo.name}
                onChange={(e) => {
                  setContactInfo({ ...contactInfo, name: e.target.value });
                  setOfferCreate(false);
                  setIdentityError(null);
                }}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />
            )}

            {!showCreateForm && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <input
                    type="radio"
                    name="contact-mode"
                    checked={contactMode === "phone"}
                    onChange={() => {
                      setContactMode("phone");
                      setIdentityError(null);
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={contactInfo.phone}
                    onChange={(e) => {
                      setContactInfo({ ...contactInfo, phone: e.target.value });
                      setOfferCreate(false);
                      setIdentityError(null);
                    }}
                    style={{ width: "100%", padding: "10px" }}
                    disabled={contactMode !== "phone"}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <input
                    type="radio"
                    name="contact-mode"
                    checked={contactMode === "email"}
                    onChange={() => {
                      setContactMode("email");
                      setIdentityError(null);
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={contactInfo.email}
                    onChange={(e) => {
                      setContactInfo({ ...contactInfo, email: e.target.value });
                      setOfferCreate(false);
                      setIdentityError(null);
                    }}
                    style={{ width: "100%", padding: "10px" }}
                    disabled={contactMode !== "email"}
                  />
                </div>
              </>
            )}

            {showCreateForm && (
              <>
                <input
                  type="text"
                  placeholder="Phone"
                  value={contactInfo.phone}
                  onChange={(e) => {
                    setContactInfo({ ...contactInfo, phone: e.target.value });
                    setOfferCreate(false);
                    setIdentityError(null);
                  }}
                  style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={contactInfo.email}
                  onChange={(e) => {
                    setContactInfo({ ...contactInfo, email: e.target.value });
                    setOfferCreate(false);
                    setIdentityError(null);
                  }}
                  style={{ width: "100%", padding: "10px" }}
                />
              </>
            )}
            {identityError && <p style={{ color: "red", marginTop: "8px" }}>{identityError}</p>}
            <div className="modal-actions">
              {!showCreateForm && (
                <>
                  <button className="nav-btn" onClick={handleIdentify}>
                    Continue
                  </button>
                  <button
                    className="nav-btn"
                    onClick={() => {
                      setShowCreateForm(true);
                      setOfferCreate(false);
                      setIdentityError(null);
                      setContactMode("phone"); // default to phone for signup
                    }}
                  >
                    {offerCreate ? "Create Account" : "New Account"}
                  </button>
                </>
              )}
              {showCreateForm && (
                <>
                  <button className="nav-btn" onClick={handleCreateCustomer}>
                    Create Account
                  </button>
                  <button
                    className="nav-btn"
                    onClick={() => {
                      setShowCreateForm(false);
                      setIdentityError(null);
                      setOfferCreate(false);
                    }}
                  >
                    Back to Login
                  </button>
                </>
              )}
              <button
                className="nav-btn"
                onClick={() => {
                  setAllowAnon(true);
                  setShowIdentityPrompt(false);
                  setIdentityError(null);
                  setOfferCreate(false);
                  setShowCreateForm(false);
                  setIdentityPrompted(true);
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem("identityPrompted", "true");
                  }
                }}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderScreen;
