// frontend/src/components/ConfirmationScreen.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ConfirmationScreen.css";

function ConfirmationScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedOrigin =
    typeof window !== "undefined"
      ? sessionStorage.getItem("orderOrigin") || "customer"
      : "customer";

  const redirectTo =
    location.state?.returnTo || (storedOrigin === "cashier" ? "/cashier" : "/");

  // Generate random order number
  const orderNumber = Math.floor(Math.random() * 1000) + 1;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(redirectTo);
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate, redirectTo]);

  return (
    <div className="confirmation-page">
      <div className="confirmation-box">
        <h1>Thank you for your order!</h1>

        <p className="order-number">Your order number is:</p>

        <h2 className="order-id">{orderNumber}</h2>

        <p className="wait-message">
          Please wait while we prepare your items.
        </p>

        <p className="redirect-message">
          Returning to the previous screen in 5 seconds...
        </p>
      </div>
    </div>
  );
}

export default ConfirmationScreen;
