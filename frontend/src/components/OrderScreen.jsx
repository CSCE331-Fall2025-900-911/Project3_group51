import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "./OrderScreen.css";

// Receives 'cart' as a prop from App.jsx
function OrderScreen({ cart }) { 
  
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showLanguage, setShowLanguage] = useState(false);
  const navigate = useNavigate(); 

  useEffect(() => {
    // Using dummy data as requested
    const dummyItems = Array.from({ length: 8 }).map((_, i) => ({
      drinkid: i + 1, 
      drinkname: `Item Name ${i + 1}`,
      category: `Category ${ (i % 3) + 1 }`,
      price: (7.79 + i).toFixed(2)
    }));
    
    setMenuItems(dummyItems);
    const uniqueCategories = [...new Set(dummyItems.map(item => item.category))];
    setCategories(uniqueCategories);
  }, []); // [] means this runs only once

  const handleItemClick = (item) => {
    // Navigate to customization screen, passing the item data
    navigate(`/order/${item.drinkid}`, { state: { item: item } });
  };

  // --- Calculate Subtotal ---
  // Use .reduce() to sum up all prices in the cart
  // Start the sum (accumulator) at 0
  const subtotal = cart.reduce((acc, item) => {
    // Convert the price string (e.g., "8.79") to a number and add it
    return acc + parseFloat(item.price); 
  }, 0);

  return (
    <div className="menu-page">
      {/* Header */}
      <header className="header">
        <button className="nav-btn">View Menu</button>
        <h1 className="menu-title">Menu</h1>
        <button 
          className="nav-btn" 
          onClick={() => setShowLanguage(!showLanguage)}
        >
          Language
        </button>
      </header>

      {/* Language Dropdown */}
      {showLanguage && (
        <div className="language-dropdown">
          <button>English</button>
          <button>Espanol</button>
          <button>Francis</button>
          <button>Italino</button>
        </div>
      )}

      {/* Main Content */}
      <div className="content">
        {/* Sidebar Categories */}
        <aside className="categories">
          <h2>Categories</h2>
          {categories.map((category, i) => (
            <button key={i} className="category-btn">
              {category}
            </button>
          ))}
        </aside>

        {/* Menu Grid */}
        <main className="menu-grid">
          {menuItems.map((item) => (
            <button 
              key={item.drinkid} 
              className="menu-item" 
              onClick={() => handleItemClick(item)} 
            >
              <div className="item-image">Item Image</div>
              <div className="item-name">{item.drinkname}</div>
              <div className="item-price">${item.price}</div>
            </button>
          ))}
        </main>
      </div>

      {/* Order Summary Footer */}
      <footer className="order-summary">
        <div className="current-order">
          <h3>Current Order:</h3>
        </div>
        <div className="order-items">
          {/* Map over the cart and display each item */}
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cart.map((item, index) => (
              <p key={index}>
                {item.name} - ${item.price}
              </p>
            ))
          )}
        </div>
        
        {/* Display the calculated subtotal, formatted to 2 decimal places */}
        <div className="subtotal">
          Subtotal: ${subtotal.toFixed(2)}
        </div>
        
        <button className="checkout-btn">Checkout</button>
      </footer>
    </div>
  );
}

export default OrderScreen;