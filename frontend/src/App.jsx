import React, { useState } from 'react'; 
import { Routes, Route, useLocation} from 'react-router-dom';
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
import MenuManagementScreen from "./components/MenuManagementScreen.jsx";
import EmployeeManagementScreen from "./components/EmployeeManagementScreen.jsx";
import ManagerPortal from "./components/ManagerPortal.jsx";

function App() {
  
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = sessionStorage.getItem("customerInfo");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const persistCustomer = (cust) => {
    setCustomer(cust);
    if (typeof window !== "undefined") {
      if (cust) {
        sessionStorage.setItem("customerInfo", JSON.stringify(cust));
      } else {
        sessionStorage.removeItem("customerInfo");
        sessionStorage.removeItem("identityPrompted");
      }
    }
  };

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
          element= {<OrderScreen cart={cart} setCart={setCart} customer={customer} setCustomer={persistCustomer} />}
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
          element= {<CheckoutScreen cart={cart} setCart={setCart} customer={customer} setCustomer={persistCustomer} />}
        />
        
        <Route 
          path="/confirmation"
          element= {<ConfirmationScreen />}
        />

      <Route 
        path="/cashier" 
        element= {<CashierScreen cart={cart} setCart={setCart} />}
      />
      <Route path="/manager-portal" element={<ManagerPortal />} />
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
      <Route
        path="/management/menu"
        element={<MenuManagementScreen />}
      />
      <Route
        path="/management/employees"
        element={<EmployeeManagementScreen />}
      />
      </Routes>
    </>
  );
}

export default App;
