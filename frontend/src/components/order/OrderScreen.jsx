import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "./OrderScreen.css";
import { getMenu } from "../../api/menu.js";
import { identifyCustomer, createCustomer } from "../../api/customers.js";
import MagnifyControls from "../MagnifyControls.jsx";

import useLanguage from "../../hooks/useLanguage.js";

function OrderScreen({ cart, setCart, customer, setCustomer }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Language — only for dropdown, no translation used
  const { selectedLang, setSelectedLang } = useLanguage();

  // Local state
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showIdentityPrompt, setShowIdentityPrompt] = useState(false);

  const [contactInfo, setContactInfo] = useState({
    name: "",
    phone: "",
    email: ""
  });

  const [contactMode, setContactMode] = useState("phone");
  const [identityError, setIdentityError] = useState(null);
  const [offerCreate, setOfferCreate] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [stockWarning, setStockWarning] = useState(null);
  const [allowAnon, setAllowAnon] = useState(false);

  const [identityPrompted, setIdentityPrompted] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("identityPrompted") === "true";
  });

  const resetFromHomeRef = React.useRef(false);
  const fromHome = location.state?.fromHome || false;

  const cashierOrder = location.state?.returnTo === "/cashier";
  const cancelDestination = cashierOrder ? "/cashier" : "/";

  const imageBase = (import.meta.env.VITE_API_URL || "http://localhost:3000/api")
    .replace(/\/api$/, "");

  useEffect(() => {
    sessionStorage.setItem("orderOrigin", cashierOrder ? "cashier" : "customer");
  }, [cashierOrder]);

  // Identity prompt
  useEffect(() => {
    if (fromHome && !customer && !allowAnon && !identityPrompted) {
      setShowIdentityPrompt(true);
    }
  }, [fromHome, customer, allowAnon, identityPrompted]);

  // Reset customer if returning from Home
  useEffect(() => {
    if (fromHome && !resetFromHomeRef.current) {
      resetFromHomeRef.current = true;
      setCustomer?.(null);
      setAllowAnon(false);
      setIdentityPrompted(false);
      sessionStorage.removeItem("customerInfo");
      sessionStorage.removeItem("identityPrompted");
    }
  }, [fromHome, setCustomer]);

  // Fetch menu
  useEffect(() => {
    getMenu()
      .then((data) => {
        setMenuItems(data);
        setCategories([...new Set(data.map((d) => d.category))]);
      })
      .catch(() => {
        setError("Could not load menu.");
      });
  }, []);

  // Count cart qty
  const cartQtyByDrink = useMemo(() => {
    return cart.reduce((acc, item) => {
      const id = item.id ?? item.drinkid;
      const qty = item.quantity ?? 1;
      acc[id] = (acc[id] || 0) + qty;
      return acc;
    }, {});
  }, [cart]);

  // Click drink
  const handleItemClick = (item) => {
    const used = cartQtyByDrink[item.drinkid] || 0;
    const available = (item.stockqty ?? 0) - used;

    if (available <= 0) {
      setStockWarning(`${item.drinkname} is out of stock.`);
      return;
    }

    if (fromHome && !customer && !allowAnon) {
      setShowIdentityPrompt(true);
      return;
    }

    navigate(`/order/${item.drinkid}`, {
      state: { item, returnTo: "/order", origin: "customer" }
    });
  };

  // Category select
  const handleCategoryClick = (cat) => setSelectedCategory(cat);

  // Change quantity
  const handleQuantityChange = (index, delta) => {
    setCart((prev = []) => {
      if (!prev[index]) return prev;

      const next = [...prev];
      const item = next[index];
      const qty = item.quantity ?? 1;
      const updatedQty = Math.max(0, qty + delta);

      // enforce stock
      if (delta > 0) {
        const drinkId = item.id ?? item.drinkid;
        const stockQty =
          menuItems.find((m) => m.drinkid === drinkId)?.stockqty ?? 0;

        const otherQty = next.reduce((acc, it, idx) => {
          if (idx !== index && (it.id ?? it.drinkid) === drinkId)
            acc += it.quantity ?? 1;
          return acc;
        }, 0);

        if (updatedQty + otherQty > stockQty) {
          setStockWarning("No more stock available.");
          return prev;
        }
      }

      setStockWarning(null);

      if (updatedQty === 0) {
        next.splice(index, 1);
      } else {
        next[index] = { ...item, quantity: updatedQty };
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
        completeReturnTo: cashierOrder ? "/cashier" : "/"
      }
    });
  };

  // ------------------------------
  // Identity: Login
  // ------------------------------
  const handleIdentify = async () => {
    setIdentityError(null);

    const inputValue =
      contactMode === "phone" ? contactInfo.phone : contactInfo.email;

    if (!inputValue) {
      setIdentityError("Please enter your contact info.");
      return;
    }

    try {
      const result = await identifyCustomer({
        phone: contactMode === "phone" ? inputValue : null,
        email: contactMode === "email" ? inputValue : null
      });

      setCustomer?.({
        id: result.id,
        phone: result.phone,
        email: result.email,
        points: result.points ?? 0
      });

      setShowIdentityPrompt(false);
      setIdentityPrompted(true);
      sessionStorage.setItem("identityPrompted", "true");
    } catch (err) {
      if (err.status === 404) {
        setIdentityError("Account not found.");
        setOfferCreate(true);
      } else {
        setIdentityError("Unable to verify. Try again.");
      }
    }
  };

  // ------------------------------
  // Identity: Create New Account
  // ------------------------------
  const handleCreateCustomer = async () => {
    const { name, phone, email } = contactInfo;

    if (!name || !phone || !email) {
      setIdentityError("All fields are required.");
      return;
    }

    try {
      const result = await createCustomer({ name, phone, email });

      setCustomer?.({
        id: result.id,
        name,
        phone,
        email,
        points: result.points ?? 0
      });

      setShowIdentityPrompt(false);
      setIdentityPrompted(true);
      sessionStorage.setItem("identityPrompted", "true");
    } catch {
      setIdentityError("Unable to create account.");
    }
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + parseFloat(item.price) * (item.quantity ?? 1),
    0
  );

  return (
    <div className="menu-page">
      {/* Header */}
      <header className="header">
        <MagnifyControls />
        <h1 className="menu-title">Menu</h1>

        <button className="nav-btn" onClick={() => setShowLanguage(!showLanguage)}>
          <img src={`${imageBase}/images/Icons/Language.png`} className="nav-icon" />
          Language
        </button>
      </header>

      {/* Language dropdown */}
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

      {stockWarning && <div className="stock-warning">{stockWarning}</div>}

      {/* Main Content */}
      <div className="content">
        <aside className="categories">
          <h2>Categories</h2>

          <button
            className={`category-btn ${!selectedCategory ? "selected" : ""}`}
            onClick={() => handleCategoryClick(null)}
          >
            All
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? "selected" : ""}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          ))}
        </aside>

        <main className="menu-grid">
          {menuItems
            .filter((i) => !selectedCategory || i.category === selectedCategory)
            .map((item) => {
              const used = cartQtyByDrink[item.drinkid] || 0;
              const available = (item.stockqty ?? 0) - used;
              const out = available <= 0;

              const categoryClass = item.category.toLowerCase().replace(/[^a-z0-9]/g, "-");

              return (
                <button
                  key={item.drinkid}
                  className={`menu-item category-${categoryClass} ${out ? "sold-out" : ""}`}
                  onClick={() => !out && handleItemClick(item)}
                  disabled={out}
                >
                  <div className="item-image">
                    <img src={`${imageBase}/images/${item.image}`} alt="" />
                    {out && <div className="sold-out-overlay">Sold Out</div>}
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
          Cancel Order
        </button>

        <div className="current-order">
          <h3>Current Order</h3>
          {customer && <small>Points: {customer.points ?? 0}</small>}
        </div>

        <div className="order-items">
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cart.map((item, index) => {
              const qty = item.quantity ?? 1;
              const total = (qty * parseFloat(item.price)).toFixed(2);

              return (
                <div key={index} className="order-row-item">
                  <span>
                    {item.name} × {qty}
                  </span>
                  <span>${total}</span>
                  <div className="item-controls">
                    <button onClick={() => handleQuantityChange(index, -1)}>-</button>
                    <button onClick={() => handleQuantityChange(index, 1)}>+</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="subtotal">Subtotal: ${subtotal.toFixed(2)}</div>

        <button className="checkout-btn" onClick={handleCheckout}>
          <img src={`${imageBase}/images/Icons/Cart.png`} className="checkout-icon" />
          Checkout
        </button>
      </footer>

      {/* Cancel modal */}
      {showCancelConfirm && (
        <div className="modal-backdrop">
          <div className="modal">
            <p>Are you sure you want to cancel your order?</p>

            <div className="modal-actions">
              <button
                className="nav-btn"
                onClick={() => {
                  setCart([]);
                  navigate(cancelDestination);
                }}
              >
                Yes
              </button>

              <button className="nav-btn" onClick={() => setShowCancelConfirm(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Identity modal */}
      {showIdentityPrompt && (
        <div className="modal-backdrop">
          <div className="modal">
            <p>Please enter your details to earn/use points.</p>

            {showCreateForm && (
              <input
                type="text"
                placeholder="Full Name (required)"
                value={contactInfo.name}
                onChange={(e) =>
                  setContactInfo({ ...contactInfo, name: e.target.value })
                }
              />
            )}

            {!showCreateForm && (
              <>
                <label>
                  <input
                    type="radio"
                    checked={contactMode === "phone"}
                    onChange={() => setContactMode("phone")}
                  />
                  Phone
                </label>
                <input
                  type="text"
                  placeholder="Phone"
                  disabled={contactMode !== "phone"}
                  value={contactInfo.phone}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, phone: e.target.value })
                  }
                />

                <label>
                  <input
                    type="radio"
                    checked={contactMode === "email"}
                    onChange={() => setContactMode("email")}
                  />
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  disabled={contactMode !== "email"}
                  value={contactInfo.email}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, email: e.target.value })
                  }
                />
              </>
            )}

            {showCreateForm && (
              <>
                <input
                  type="text"
                  placeholder="Phone"
                  value={contactInfo.phone}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, phone: e.target.value })
                  }
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={contactInfo.email}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, email: e.target.value })
                  }
                />
              </>
            )}

            {identityError && <p style={{ color: "red" }}>{identityError}</p>}

            <div className="modal-actions">
              {!showCreateForm ? (
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
                    }}
                  >
                    New Account
                  </button>
                </>
              ) : (
                <>
                  <button className="nav-btn" onClick={handleCreateCustomer}>
                    Create Account
                  </button>

                  <button
                    className="nav-btn"
                    onClick={() => {
                      setShowCreateForm(false);
                      setIdentityError(null);
                    }}
                  >
                    Back
                  </button>
                </>
              )}

              <button
                className="nav-btn"
                onClick={() => {
                  setAllowAnon(true);
                  setShowIdentityPrompt(false);
                  setIdentityPrompted(true);
                  sessionStorage.setItem("identityPrompted", "true");
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
