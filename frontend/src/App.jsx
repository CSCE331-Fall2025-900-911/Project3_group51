// frontend/src/App.jsx
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import HomeScreen from "./components/HomeScreen.jsx";
import OrderScreen from "./components/OrderScreen.jsx";
import CustomizationScreen from "./components/CustomizationScreen.jsx";
import LoginScreen from "./components/LoginScreen.jsx";

import ManagementMenu from "./components/ManagementMenu.jsx";
import TrendsScreen from "./components/TrendsScreen.jsx";
import InventoryScreen from "./components/InventoryScreen.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  const [cart, setCart] = useState([]);
  const addToCart = (item) => setCart((prev) => [...prev, item]);

  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/order" element={<OrderScreen cart={cart} />} />
      <Route path="/order/:drinkid" element={<CustomizationScreen addToCart={addToCart} />} />
      <Route path="/login" element={<LoginScreen />} />

      {/* Management entry page */}
      <Route
        path="/management"
        element={
          <ProtectedRoute requireRole="Manager">
            <ManagementMenu />
          </ProtectedRoute>
        }
      />

      {/* Management sub-pages */}
      <Route
        path="/management/trends"
        element={
          <ProtectedRoute requireRole="Manager">
            <TrendsScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/inventory"
        element={
          <ProtectedRoute requireRole="Manager">
            <InventoryScreen />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
