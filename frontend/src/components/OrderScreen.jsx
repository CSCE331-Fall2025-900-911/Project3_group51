import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "./OrderScreen.css";
import { getMenu } from "../api/menu.js"; // 1. Import your new API function

function OrderScreen({ cart }) { 
  
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showLanguage, setShowLanguage] = useState(false);
  const [error, setError] = useState(null); // State for error handling
  const navigate = useNavigate(); 
  const [selectedCategory, setSelectedCategory] = useState(null);

  // This useEffect now fetches real data
  useEffect(() => {
    // Call the API function
    getMenu()
      .then(data => {
        setMenuItems(data); // Store the fetched menu items in state
        // Automatically get unique categories from the data
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories);
      })
      .catch(err => {
        console.error("Failed to fetch menu:", err);
        setError("Could not load menu. Please try again later.");
      });
  }, []); // [] means this runs only once

  const handleItemClick = (item) => {
    navigate(`/order/${item.drinkid}`, { state: { item: item } });
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleCheckout = () => {
    navigate('/checkout'); // Navigate to the new route
  };

  // Calculate Subtotal
  const subtotal = cart.reduce((acc, item) => {
    return acc + parseFloat(item.price); 
  }, 0);

  // Show error message if API fails
  if (error) {
    return <div className="menu-page"><p>{error}</p></div>
  }

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
        {/* Sidebar Categories (now dynamic) */}
        <aside className="categories">
          <h2>Categories</h2>
          {/* "All" button to clear the filter */}
          <button 
            className={`category-btn ${!selectedCategory ? 'selected' : ''}`}
            onClick={() => handleCategoryClick(null)}
          >
            All
          </button>
          
          {/* Dynamic category buttons */}
          {categories.map((category, i) => (
            <button 
              key={i} 
              className={`category-btn ${selectedCategory === category ? 'selected' : ''}`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </aside>

        {/* Menu Grid (now shows real data) */}
        <main className="menu-grid">
          {menuItems
            // Filter the list before mapping
            .filter(item => {
              // If no category is selected (null), show all items
              if (!selectedCategory) {
                return true; 
              }
              // Otherwise, only show items that match the selected category
              return item.category === selectedCategory;
            })
            // Map over the *filtered* list
            .map((item) => (
              <button 
                key={item.drinkid} 
                className="menu-item" 
                onClick={() => handleItemClick(item)} 
              >
                <div className="item-image">Item Image</div>
                <div className="item-name">{item.drinkname}</div>
                <div className="item-price">${item.price}</div>
              </button>
            ))
          }
        </main>
      </div>

      {/* Order Summary Footer */}
      <footer className="order-summary">
        <div className="current-order">
          <h3>Current Order:</h3>
        </div>
        <div className="order-items">
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
        
        <div className="subtotal">
          Subtotal: ${subtotal.toFixed(2)}
        </div>
        
        <button className="checkout-btn" onClick={handleCheckout}>
          Checkout
        </button>
      </footer>
    </div>
  );
}

export default OrderScreen;