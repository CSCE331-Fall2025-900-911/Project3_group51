// frontend/src/components/CheckoutScreen.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CheckoutScreen.css'; 
import { createOrder, addOrderItem, updateOrderTotal } from '../api/orders.js';

// 1. Define a constant for the tax rate (e.g., 8.25%)
const TAX_RATE = 0.0825;

// Receive the 'cart' state as a prop from App.jsx
function CheckoutScreen({ cart, setCart }) {
  const navigate = useNavigate();
  const location = useLocation();
  const storedOrigin =
    typeof window !== "undefined"
      ? sessionStorage.getItem("orderOrigin") || "customer"
      : "customer";
  const fallbackReturn = storedOrigin === "cashier" ? "/cashier" : "/order";
  const returnTo = location.state?.returnTo || fallbackReturn;
  const completeReturnTo =
    location.state?.completeReturnTo ||
    (storedOrigin === "cashier" ? "/cashier" : "/");
  const [paymentType, setPaymentType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Calculate subtotal, tax, and total
  const subtotal = cart.reduce((acc, item) => {
    return acc + (parseFloat(item.price) * item.quantity); // Multiply by quantity
  }, 0);
  
  const taxAmount = subtotal * TAX_RATE;
  const priceTotal = subtotal + taxAmount; // This is the new 'Price Total'

  const handlePaymentConfirm = async (type) => {
    setLoading(true);
    setError(null);
    console.log("Payment type selected:", type);

    try {
      // Create a new blank order and get its ID
      const { id: newOrderId } = await createOrder();
      
      // Loop through the cart and add each item to the new order
      for (const item of cart) {
        await addOrderItem(item, newOrderId);
      }

      // Finally, update the order's total price
      await updateOrderTotal(newOrderId, priceTotal);

      // If all successful, clear the cart and go to confirmation
      setCart([]);
      navigate('/confirmation', { state: { returnTo: completeReturnTo } }); // Navigate to the next screen with origin

    } catch (err) {
      console.error("Failed to create order:", err);
      setError("Failed to submit order. Please try again.");
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(returnTo); // Go back to the originating screen
  };

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <button className="back-btn" onClick={handleGoBack} disabled={loading}>
          &lt;- Back to Order
        </button>
        <h1 className="checkout-title">Checkout</h1>
      </header>

      <div className="checkout-content">
        {/* Left Side: Payment Options (from wireframe) */}
        <main className="payment-options">
          <h2>SELECT PAYMENT TYPE</h2>
          {error && <p className="error-message">{error}</p>}
          <div className="payment-grid">
            <button 
              className={`payment-btn ${paymentType === 'Cash' ? 'selected' : ''}`}
              onClick={() => handlePaymentConfirm('Cash')}
              disabled={loading || cart.length === 0}
            >
              {loading ? "Processing..." : "Cash"}
            </button>
            <button 
              className={`payment-btn ${paymentType === 'Credit Card' ? 'selected' : ''}`}
              onClick={() => handlePaymentConfirm('Credit Card')}
              disabled={loading || cart.length === 0}
            >
              {loading ? "Processing..." : "Credit Card"}
            </button>
            <button 
              className={`payment-btn ${paymentType === 'Mobile Pay' ? 'selected' : ''}`}
              onClick={() => handlePaymentConfirm('Mobile Pay')}
              disabled={loading || cart.length === 0}
            >
              {loading ? "Processing..." : "Mobile Pay"}
            </button>
            <button 
              className={`payment-btn ${paymentType === 'Cheque' ? 'selected' : ''}`}
              onClick={() => handlePaymentConfirm('Cheque')}
              disabled={loading || cart.length === 0}
            >
              {loading ? "Processing..." : "Cheque"}
            </button>
          </div>
        </main>

        {/* 3. Update the Summary Sidebar */}
        <aside className="summary-sidebar">
          <div className="summary-box">
            <h3>Sales Summary</h3>
            <div className="summary-items">
              {cart.length === 0 ? (
                <p>No items in cart.</p>
              ) : (
                cart.map((item, index) => {
                  const qty = item.quantity ?? 1;
                  const lineTotal = (parseFloat(item.price) * qty).toFixed(2);
                  return (
                    <div key={index} className="summary-item">
                      <span>
                        {item.name} x {qty}
                      </span>
                      <span>${lineTotal}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* New Subtotal Row */}
          <div className="summary-total subtotal-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          {/* New Tax Row */}
          <div className="summary-total tax-row">
            <span>Tax </span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>

          {/* Modified Price Total (now is the full total) */}
          <div className="summary-total total-row">
            <span>Price Total</span>
            <span>${priceTotal.toFixed(2)}</span>
          </div>
          
          {/* Modified Balance (now shows the total due) */}
          <div className="summary-total balance-row">
            <span>Balance</span>
            <span>${priceTotal.toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CheckoutScreen;
