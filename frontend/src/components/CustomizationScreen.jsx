import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './CustomizationScreen.css'; // CSS file we will create next

function CustomizationScreen({addToCart}) {
  const { drinkid } = useParams(); 
  const navigate = useNavigate();
  
  const location = useLocation();
  const { item } = location.state; // item = { drinkid: 1, drinkname: "...", price: "..." }

  const [iceLevel, setIceLevel] = useState('Regular Ice');
  const [sugarLevel, setSugarLevel] = useState('100% Sugar');
  const [toppings, setToppings] = useState([]);
  
  // Topping selection logic (allows max 2)
  const handleToppingClick = (toppingName) => {
    setToppings(prevToppings => {
      const isSelected = prevToppings.includes(toppingName);
      if (isSelected) {
        // Return a new array without the topping
        return prevToppings.filter(t => t !== toppingName);
      } else {
        // Return a new array with the topping added
        if (prevToppings.length < 2) {
          return [...prevToppings, toppingName];
        }
      }
      // If max (2) is reached and it's not selected, return the same state
      return prevToppings; 
    });
  };

  const handleConfirm = () => {
    // We will calculate the final price with toppings later
    const finalPrice = parseFloat(item.price); // Placeholder
    
    // Create the item object to add to the cart
    const customizedItem = {
      id: item.drinkid,
      name: item.drinkname,
      price: finalPrice.toFixed(2),
      ice: iceLevel,
      sugar: sugarLevel,
      toppings: toppings
    };
    
    // Call the function passed down from App.jsx
    addToCart(customizedItem);

    // Navigate back to the order screen
    navigate('/order');
  };
  
  // --- Data for the buttons (from wireframe) ---
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

  return (
    <div className="custom-page">
    <h1 className="custom-title">Customization ({item.drinkname})</h1>
      <div className="custom-content">
        {/* Left Column: Ice, Sugar, Other */}
        <div className="custom-column">
          <section className="custom-section">
            <h2>ICE LEVEL (CHOOSE ONE)</h2>
            <div className="custom-grid grid-2-col">
              {iceOptions.map(name => (
                <button
                  key={name}
                  className={`option-btn ${iceLevel === name ? 'selected' : ''}`}
                  onClick={() => setIceLevel(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </section>

          <section className="custom-section">
            <h2>SUGAR LEVEL</h2>
            <div className="custom-grid grid-2-col">
              {sugarOptions.map(name => (
                <button
                  key={name}
                  className={`option-btn ${sugarLevel === name ? 'selected' : ''}`}
                  onClick={() => setSugarLevel(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </section>

          <section className="custom-section">
            <h2>OTHER CUSTOMIZATIONS OR RESTRICTIONS</h2>
            <textarea className="custom-textarea" rows="5"></textarea>
          </section>
        </div>

        {/* Right Column: Toppings, Confirm */}
        <div className="custom-column">
          <section className="custom-section">
            <h2>CHOOSE TOPPINGS (2 MAX)</h2>
            <div className="custom-grid grid-2-col">
              {toppingOptions.map(item => (
                <button
                  key={item.name}
                  className={`option-btn topping ${toppings.includes(item.name) ? 'selected' : ''}`}
                  onClick={() => handleToppingClick(item.name)}
                  // Disable button if max is reached and this item is not already selected
                  disabled={toppings.length >= 2 && !toppings.includes(item.name)}
                >
                  <span>{item.name}</span>
                  <span className="topping-price">({item.price})</span>
                </button>
              ))}
            </div>
          </section>
          
          <button className="confirm-btn" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomizationScreen;