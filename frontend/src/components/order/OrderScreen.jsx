import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "./OrderScreen.css";
import { getMenu } from "../../api/menu.js";
import { identifyCustomer, createCustomer } from "../../api/customers.js";
import MagnifyControls from "../MagnifyControls.jsx";

import useLanguage from "../../hooks/useLanguage.js";
import { useAccessibility } from "../../context/AccessibilityContext";

const LANG_TO_CODE = {
  "English": "en",
  "Español": "es",
  "Français": "fr",
  "Italiano": "it",
  "Tiếng Việt": "vi",
  "한국어": "ko",
  "हिन्दी": "hi",
  "Türkçe": "tr"
};

function OrderScreen({ cart, setCart, customer, setCustomer }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { selectedLang, setSelectedLang } = useLanguage();
  const { resetMagnify } = useAccessibility();

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showIdentityPrompt, setShowIdentityPrompt] = useState(false);

  // State for item detail popup
  const [detailItem, setDetailItem] = useState(null);

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

  const resetFromHomeRef = useRef(false);
  const fromHome = location.state?.fromHome || false;

  const cashierOrder = location.state?.returnTo === "/cashier";
  const cancelDestination = cashierOrder ? "/cashier" : "/";

  const imageBase = (import.meta.env.VITE_API_URL || "http://localhost:3000/api")
    .replace(/\/api$/, "");

  useEffect(() => {
    sessionStorage.setItem("orderOrigin", cashierOrder ? "cashier" : "customer");
  }, [cashierOrder]);

  useEffect(() => {
    if (fromHome && !customer && !allowAnon && !identityPrompted) {
      setShowIdentityPrompt(true);
    }
  }, [fromHome, customer, allowAnon, identityPrompted]);

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

  useEffect(() => {
    getMenu()
      .then((data) => {
        setMenuItems(data);
        setCategories([...new Set(data.map((d) => d.category))]);
      })
      .catch(() => {
        console.error("Could not load menu.");
      });
  }, []);

  const cartQtyByDrink = useMemo(() => {
    return cart.reduce((acc, item) => {
      const id = item.id ?? item.drinkid;
      const qty = item.quantity ?? 1;
      acc[id] = (acc[id] || 0) + qty;
      return acc;
    }, {});
  }, [cart]);

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

  const handleCategoryClick = (cat) => setSelectedCategory(cat);

  const handleQuantityChange = (index, delta) => {
    setCart((prev = []) => {
      if (!prev[index]) return prev;

      const next = [...prev];
      const item = next[index];
      const qty = item.quantity ?? 1;
      const updatedQty = Math.max(0, qty + delta);

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

  const handleLanguageChange = (langLabel) => {
    setSelectedLang(langLabel);
    setShowLanguage(false);
    setTimeout(() => {
      const code = LANG_TO_CODE[langLabel];
      if (code) {
        const select = document.querySelector(".goog-te-combo");
        if (select) {
          select.value = code;
          select.dispatchEvent(new Event("change"));
        }
      }
    }, 0);
  };

  const handleIdentify = async () => {
    setIdentityError(null);
    const inputValue = contactMode === "phone" ? contactInfo.phone : contactInfo.email;

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
      <header className="header">
        <MagnifyControls />
        <h1 className="menu-title">Menu</h1>

        <button className="order-lang-btn" onClick={() => setShowLanguage(!showLanguage)}>
          <img src={`${imageBase}/images/Icons/Language.png`} className="nav-icon" alt="Translate Image" />
          Language
        </button>
      </header>

      {showLanguage && (
        <div className="language-dropdown notranslate">
          {Object.keys(LANG_TO_CODE).map((lang) => (
            <button
              key={lang}
              className={lang === selectedLang ? "selected" : ""}
              onClick={() => handleLanguageChange(lang)}
            >
              {lang}
            </button>
          ))}
        </div>
      )}

      {stockWarning && <div className="stock-warning">{stockWarning}</div>}

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

      <footer className="order-summary">
        <button className="order-cancel-btn" onClick={() => setShowCancelConfirm(true)}>
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
                    <span 
                      onClick={() => setDetailItem(item)}
                      style={{ cursor: "pointer", textDecoration: "underline", fontWeight: "bold" }}
                    >
                      {item.name}
                    </span>
                    <span className="notranslate"> × {qty}</span>
                  </span>
                  <span className="notranslate">${total}</span>
                  
                  <div className="item-controls">
                    <button className="control-btn" onClick={() => handleQuantityChange(index, -1)}>-</button>
                    <button className="control-btn" onClick={() => handleQuantityChange(index, 1)}>+</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="subtotal">
          Subtotal: <span className="notranslate">${subtotal.toFixed(2)}</span>
        </div>

        <button className="checkout-btn" onClick={handleCheckout}>
          <img src={`${imageBase}/images/Icons/Cart.png`} className="checkout-icon" alt="Cart" />
          Checkout
        </button>
      </footer>

      {showCancelConfirm && (
        <div className="modal-backdrop">
          <div className="modal">
            <p>Are you sure you want to cancel your order?</p>
            <div className="modal-actions">
              <button
                className="order-modal-btn"
                onClick={() => {
                  setSelectedLang("English");
                  const select = document.querySelector(".goog-te-combo");
                  if (select) {
                    select.value = "en";
                    select.dispatchEvent(new Event("change"));
                  }
                  
                  resetMagnify();

                  setCart([]);
                  navigate(cancelDestination);
                }}
              >
                Yes
              </button>
              <button className="order-modal-btn" onClick={() => setShowCancelConfirm(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {detailItem && (
        <div className="modal-backdrop" onClick={() => setDetailItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Item Details</h3>
            <p style={{ fontWeight: "bold", fontSize: "1.2em", marginBottom: "10px" }}>
              {detailItem.name}
            </p>
            
            <div style={{ textAlign: "left", width: "100%", padding: "0 20px", fontSize: "1.1rem" }}>
              <p><strong>Ice:</strong> {detailItem.ice || "-"}</p>
              <p><strong>Sugar:</strong> {detailItem.sugar || "-"}</p>
              
              <p style={{ marginTop: "10px" }}><strong>Toppings:</strong></p>
              {detailItem.toppings && detailItem.toppings.length > 0 ? (
                <ul style={{ paddingLeft: "20px", marginTop: "5px" }}>
                  {detailItem.toppings.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ paddingLeft: "10px", color: "#888" }}>None</p>
              )}

              {detailItem.comments && (
                <div style={{ marginTop: "10px", color: "red" }}>
                  <strong>Note:</strong> {detailItem.comments}
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ marginTop: "20px" }}>
              <button className="order-modal-btn" onClick={() => setDetailItem(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showIdentityPrompt && (
        <div className="modal-backdrop">
          <div className="modal">
            <p>Please enter your details to earn/use points.</p>
            {showCreateForm && (
              <input
                type="text"
                placeholder="Full Name (required)"
                value={contactInfo.name}
                onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
              />
            )}
            {!showCreateForm && (
              <>
                <label>
                  <input type="radio" checked={contactMode === "phone"} onChange={() => setContactMode("phone")} />
                  Phone
                </label>
                <input
                  type="text"
                  placeholder="Phone"
                  disabled={contactMode !== "phone"}
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                />
                <label>
                  <input type="radio" checked={contactMode === "email"} onChange={() => setContactMode("email")} />
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  disabled={contactMode !== "email"}
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                />
              </>
            )}
            {showCreateForm && (
              <>
                <input
                  type="text"
                  placeholder="Phone"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                />
              </>
            )}
            {identityError && <p style={{ color: "red" }}>{identityError}</p>}
            <div className="modal-actions">
              {!showCreateForm ? (
                <>
                  <button className="order-modal-btn" onClick={handleIdentify}>Continue</button>
                  <button
                    className="order-modal-btn"
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
                  <button className="order-modal-btn" onClick={handleCreateCustomer}>Create Account</button>
                  <button
                    className="order-modal-btn"
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
                className="order-modal-btn"
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