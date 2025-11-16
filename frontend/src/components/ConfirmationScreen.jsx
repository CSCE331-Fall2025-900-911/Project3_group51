// frontend/src/components/ConfirmationScreen.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ConfirmationScreen.css'; // We will create this file next

function ConfirmationScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const storedOrigin =
    typeof window !== "undefined"
      ? sessionStorage.getItem("orderOrigin") || "customer"
      : "customer";
  const redirectTo =
    location.state?.returnTo || (storedOrigin === "cashier" ? "/cashier" : "/");

  // Generate a random order number for display
  const orderNumber = Math.floor(Math.random() * 1000) + 1;

  // This effect runs once when the component mounts
  useEffect(() => {
    // Set a timer to redirect back to the home screen after 5 seconds
    const timer = setTimeout(() => {
      navigate(redirectTo); // Navigate back to appropriate screen
    }, 5000); // 5000 milliseconds = 5 seconds

    // Clean up the timer if the component is unmounted early
    return () => clearTimeout(timer);
  }, [navigate]); // Add navigate as a dependency

  return (
    <div className="confirmation-page">
      <div className="confirmation-box">
        <h1>Thank You For Your Order!</h1>
        <p className="order-number">Your order number is:</p>
        <h2 className="order-id">{orderNumber}</h2>
        <p className="wait-message">Please wait at the counter for your order.</p>
        <p className="redirect-message">
          You will be redirected to the home screen shortly...
        </p>
      </div>
    </div>
  );
}

export default ConfirmationScreen;
