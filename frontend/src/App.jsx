import React, { useState } from 'react'; 
import { Routes, Route} from 'react-router-dom';
import HomeScreen from './components/HomeScreen.jsx';
import OrderScreen from './components/OrderScreen.jsx';
import CustomizationScreen from './components/CustomizationScreen.jsx'; 
import LoginScreen from './components/LoginScreen.jsx'; 
import CheckoutScreen from './components/CheckoutScreen.jsx';
import ConfirmationScreen from './components/ConfirmationScreen.jsx'; 
import CashierScreen from './components/CashierScreen.jsx';

function App() {
  
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart(prevCart => [...prevCart, item]);
    console.log("Cart updated:", [...cart, item]);
  };

  return (
    <>
      <Routes>
        <Route path="/" element= {<HomeScreen/>}/>
        
        <Route 
          path="/order" 
          element= {<OrderScreen cart={cart} />}
        />
        
        <Route 
          path="/order/:drinkid" 
          element= {<CustomizationScreen addToCart={addToCart} />}
        />
        
        <Route 
          path="/login" 
          element= {<LoginScreen/>}
        />
        
        <Route 
          path="/checkout"
          element= {<CheckoutScreen cart={cart} setCart={setCart} />}
        />
        
        <Route 
          path="/confirmation"
          element= {<ConfirmationScreen />}
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