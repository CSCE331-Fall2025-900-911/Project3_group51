import React from "react";
import "./OrderScreen.css";

function OrderScreen() {
  return (
    <div className="menu-page">
      {/* Header */}
      <header className="header">
        <button className="nav-btn">View Menu</button>
        <h1 className="menu-title">Menu</h1>
        <button className="nav-btn">Translate</button>
      </header>

      {/* Main Content */}
      <div className="content">
        {/* Sidebar Categories */}
        <aside className="categories">
          <h2>Categories</h2>
          {Array.from({ length: 6 }).map((_, i) => (
            <button key={i} className="category-btn">
              Category {i + 1}
            </button>
          ))}
        </aside>

        {/* Menu Grid */}
        <main className="menu-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <button key={i} className="menu-item">
              <div className="item-image">Item Image</div>
              <div className="item-name">Item Name</div>
              <div className="item-price">Price</div>
            </button>
          ))}
        </main>
      </div>

      {/* Order Summary */}
      <footer className="order-summary">
        <div className="current-order">
          <h3>Current Order:</h3>
        </div>
        <div className="order-items">
          <p>Item 1 - Price</p>
          <p>Item 2 - Price</p>
          <p>Item 3 - Price</p>
          <p>Item 4 - Price</p>
        </div>
        <div className="subtotal">Subtotal</div>
        <button className="checkout-btn">Checkout</button>
      </footer>
    </div>
  );
}

export default OrderScreen