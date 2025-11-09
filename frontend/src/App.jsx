// frontend/src/App.jsx

import React, { useState } from 'react'; 
import { Routes, Route} from 'react-router-dom';
import HomeScreen from './components/HomeScreen.jsx';
import OrderScreen from './components/OrderScreen.jsx';
import CustomizationScreen from './components/CustomizationScreen.jsx'; 
import LoginScreen from './components/LoginScreen.jsx'; 
import CashierScreen from './components/CashierScreen.jsx';

function App() {
  
  // Create the "cart" state here, in the parent component
  const [cart, setCart] = useState([]);

  // Create a function to add an item to the cart
  const addToCart = (item) => {
    setCart(prevCart => [...prevCart, item]);
    console.log("Cart updated:", [...cart, item]);
  };

  return (
    <>
      <Routes>
        <Route path="/" element= {<HomeScreen/>}/>
        
        {/* 4. Pass the 'cart' state down to OrderScreen */}
        <Route 
          path="/order" 
          element= {<OrderScreen cart={cart} />}
        />
        
        {/* 5. Pass the 'addToCart' function down to CustomizationScreen */}
        <Route 
          path="/order/:drinkid" 
          element= {<CustomizationScreen addToCart={addToCart} />}
        />
        {}
        <Route 
          path="/login" 
          element= {<LoginScreen/>}
        />
        {}
        <Route 
          path="/cashier" 
          element= {<CashierScreen/>}
        />
      </Routes>
    </>
  );
}

export default App;