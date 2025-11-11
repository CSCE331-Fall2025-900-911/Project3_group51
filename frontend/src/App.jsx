import React, { useState } from 'react'; 
import { Routes, Route} from 'react-router-dom';
import HomeScreen from './components/HomeScreen.jsx';
import OrderScreen from './components/OrderScreen.jsx';
import CustomizationScreen from './components/CustomizationScreen.jsx'; 
import LoginScreen from './components/LoginScreen.jsx'; 
import CheckoutScreen from './components/CheckoutScreen.jsx';
import ConfirmationScreen from './components/ConfirmationScreen.jsx'; 
import CashierScreen from './components/CashierScreen.jsx';
import ManagementMenu from "./components/ManagementScreen.jsx";
import TrendsScreen from "./components/TrendsScreen.jsx";
import InventoryScreen from "./components/InventoryScreen.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

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
              {/* Management entry page */}
      <Route
        path="/management"
        element={
            <ManagementMenu />
        }
      />
         {/* Management sub-pages */}
      <Route
        path="/management/trends"
        element={
            <TrendsScreen />
        }
      />
      <Route
        path="/management/inventory"
        element={
            <InventoryScreen />
        }
      />
      </Routes>
    </>
  );
}

export default App;