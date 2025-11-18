import React, { useState, useEffect } from "react";
import "./CashierScreen.css";
import { getMenu } from "../api/menu"; // From main
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function CashierScreen({ cart = [], setCart }) {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const navigate = useNavigate();
  const parseCurrency = (value) => {
    const num = parseFloat(value);
    return Number.isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("orderOrigin", "cashier");
    }
  }, []);

  useEffect(() => {
    getMenu()
      .then((data) => {
        setMenuItems(data);
        const unique = [...new Set(data.map((i) => i.category))];
        setCategories(unique);
        if (unique.length > 0) setActiveCategory(unique[0]);
      })
      .catch((err) => console.error("Error fetching menu:", err));
  }, []);

  const filteredItems =
    activeCategory === ""
      ? menuItems
      : menuItems.filter((i) => i.category === activeCategory);

  const handleCustomize = (item) => {
    navigate(`/order/${item.drinkid}`, {
      state: { item, returnTo: "/cashier", origin: "cashier" },
    });
  };

  const handleRemoveItem = (index) => {
    if (!setCart) return;
    setCart((prev = []) => prev.filter((_, i) => i !== index));
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

  const subtotal = cart.reduce(
    (sum, item) => sum + parseCurrency(item.price) * (item.quantity ?? 1),
    0
  );

  const handleCheckout = () => {
    if (!cart.length) return;
    navigate("/checkout", { state: { returnTo: "/cashier" } });
  };

  return (
    <div className="cashier-root">
      <div className="hdr">
        <a className="btn" href={`${API}/auth/logout`}>
          Logout ➔
        </a>
        <div className="hdr-title">Order</div>
        <div className="hdr-name">Cashier</div>
      </div>

      <div className="main">
        <div className="left-side">
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

          <div className="grid">
            {filteredItems.map((item) => (
              <button
                key={item.drinkid}
                className="cell"
                onClick={() => handleCustomize(item)}
              >
                <div className="item-name">{item.drinkname}</div>
                <div className="item-price">
                  ${Number(item.price).toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="side">
          <div className="order-box">
            {cart.length === 0 ? (
              <div className="empty-state">Select items to begin an order.</div>
            ) : (
              <ul className="order-items-list">
                {cart.map((item, index) => {
                  const qty = item.quantity ?? 1;
                  const unit = parseCurrency(item.price);
                  const lineTotal = unit * qty;
                  return (
                    <li
                      key={item.cartItemId || `${item.id}-${index}`}
                      className="order-row"
                    >
                      <div className="order-info">
                        <span className="order-name">{item.name}</span>
                        <span className="order-price">
                          ${lineTotal.toFixed(2)}
                        </span>
                        <span className="order-unit">
                          ${unit.toFixed(2)} ea
                        </span>
                      </div>
                      <div className="order-actions">
                        <div className="quantity-controls">
                          <button
                            className="control-btn"
                            onClick={() => handleQuantityChange(index, -1)}
                          >
                            -
                          </button>
                          <span className="qty">{qty}</span>
                          <button
                            className="control-btn"
                            onClick={() => handleQuantityChange(index, 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="delete-btn"
                          onClick={() => handleRemoveItem(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="total-bar">
            <div>Subtotal</div>
            <div>${subtotal.toFixed(2)}</div>
          </div>

          <div className="side-actions">
            <button
              className="checkout"
              onClick={handleCheckout}
              disabled={!cart.length}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}