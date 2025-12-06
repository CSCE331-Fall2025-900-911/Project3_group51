import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CheckoutScreen.css';

import useLanguage from "../hooks/useLanguage";
import useTranslate from "../hooks/useTranslate";
import { CHECKOUT_LABELS } from "./CheckoutScreen.labels";

import { createOrder, addOrderItem, updateOrderTotal } from '../api/orders.js';
import MagnifyControls from './MagnifyControls.jsx';

// Tax rate
const TAX_RATE = 0.0825;

function CheckoutScreen({ cart, setCart, customer, setCustomer }) {

  const navigate = useNavigate();
  const location = useLocation();

  // Language translation
  const { selectedLang } = useLanguage();
  const labels = useTranslate(CHECKOUT_LABELS, selectedLang);

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
  const [pointsToUse, setPointsToUse] = useState(0);

  // Price calculations
  const subtotal = cart.reduce(
    (acc, item) => acc + parseFloat(item.price) * (item.quantity ?? 1),
    0
  );

  const taxAmount = subtotal * TAX_RATE;
  const priceTotal = subtotal + taxAmount;

  const availablePoints = customer?.points ?? 0;
  const maxRedeemable = useMemo(
    () => Math.min(availablePoints, Math.round(priceTotal * 100)),
    [availablePoints, priceTotal]
  );

  const appliedPoints = Math.min(pointsToUse, maxRedeemable);
  const discount = appliedPoints / 100;
  const finalTotal = Math.max(priceTotal - discount, 0);
  const pointsEarned = Math.floor(finalTotal * 10); // 10 cents per point

const handleConfirmOrder = async () => { 
  // Check for selection and cart items
  if (!paymentType || cart.length === 0) {
    setError("Please select a payment type and ensure your cart is not empty.");
    return;
  }
  setLoading(true);
  setError(null);

  try {
    const { id: newOrderId } = await createOrder({
      customerid: customer?.id ?? null,
    });

    for (const item of cart) {
      await addOrderItem(item, newOrderId);
    }

    const updateResult = await updateOrderTotal(newOrderId, {
      totalprice: finalTotal,
      grossTotal: priceTotal,
      customerid: customer?.id ?? null,
      pointsUsed: appliedPoints,
    });

    if (customer && setCustomer) {
      const newBalance =
        typeof updateResult.pointsBalance === "number"
          ? updateResult.pointsBalance
          : (customer.points ?? 0) - appliedPoints + pointsEarned;
      setCustomer({ ...customer, points: newBalance });
    }

    setCart([]);
    // Pass paymentType to confirmation screen for potential use
    navigate("/confirmation", { state: { returnTo: completeReturnTo, paymentType: paymentType } }); 

  } catch (err) {
    console.error("Failed to create order:", err);
    const msg =
      err.details?.includes("Insufficient stock") ||
      err.message?.toLowerCase().includes("insufficient stock")
        ? "One or more items are out of stock. Please adjust your cart."
        : "Failed to submit order. Please try again.";
    setError(msg);
    setLoading(false);
  }
};

  return (
    <div className="checkout-page">
      
      {/* Header */}
      <header className="checkout-header">
        <div className="header-left">
            <MagnifyControls />
        </div>

        <h1 className="checkout-title">{labels.checkout}</h1>
        <button className="back-btn" onClick={() => navigate(returnTo)}>
          {labels.back}
        </button>
      </header>

      <div className="checkout-content">

        {/* Left Side: Payment Options */}
        <main className="payment-options">
          <h2>{labels.selectPayment}</h2>
          {error && <p className="error-message">{error}</p>}

          <div className="payment-grid">
            <button
              className={`payment-btn ${paymentType === "Cash" ? "selected" : ""}`}
              onClick={() => setPaymentType("Cash")} 
              disabled={loading}
            >
              {loading ? "..." : labels.cash}
            </button>

            <button
              className={`payment-btn ${paymentType === "Credit Card" ? "selected" : ""}`}
              onClick={() => setPaymentType("Credit Card")} 
              disabled={loading}
            >
              {loading ? "..." : labels.credit}
            </button>

            <button
              className={`payment-btn ${paymentType === "Mobile Pay" ? "selected" : ""}`}
              onClick={() => setPaymentType("Mobile Pay")} 
              disabled={loading}
            >
              {loading ? "..." : labels.mobile}
            </button>

            <button
              className={`payment-btn ${paymentType === "Cheque" ? "selected" : ""}`}
              onClick={() => setPaymentType("Cheque")} 
              disabled={loading}
            >
              {loading ? "..." : labels.cheque}
            </button>
          </div>
        </main>

        {/* Summary Sidebar */}
        <aside className="summary-sidebar">
          <div className="summary-box">
            <h3>{labels.salesSummary}</h3>

            <div className="summary-items">
              {cart.length === 0 ? (
                <p>{labels.noItems}</p>
              ) : (
                cart.map((item, index) => {
                  const qty = item.quantity ?? 1;
                  const lineTotal = (parseFloat(item.price) * qty).toFixed(2);
                  return (
                    <div key={index} className="summary-item">
                      <span>{item.name} x {qty}</span>
                      <span>${lineTotal}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="summary-total subtotal-row">
            <span>{labels.subtotal}</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-total tax-row">
            <span>{labels.tax}</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>

          <div className="summary-total total-row">
            <span>{labels.priceTotal}</span>
            <span>${priceTotal.toFixed(2)}</span>
          </div>

          {customer && (
            <>
              <div className="summary-total">
                <span>Available Points</span>
                <span>{availablePoints}</span>
              </div>
              <div className="summary-total" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                <span>Apply Points</span>
                <button
                  className="back-btn"
                  style={{ margin: 0, borderRadius: "8px" }}
                  onClick={() => setPointsToUse(maxRedeemable)}
                  disabled={loading || maxRedeemable === 0}
                >
                  Use {maxRedeemable} pts
                </button>
              </div>
              <div className="summary-total">
                <span>Points Applied</span>
                <span>{appliedPoints}</span>
              </div>
              <div className="summary-total">
                <span>Points Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            </>
          )}

          <div className="summary-total total-row">
            <span>Final Total</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>

          <div className="summary-total balance-row">
            <span>{labels.balance}</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>

          {/* NEW: Confirm Checkout Button */}
          <button 
            className="confirm-checkout-btn" 
            onClick={handleConfirmOrder}
            disabled={loading || !paymentType || cart.length === 0} 
          >
            {loading ? "Processing..." : labels.checkout}
          </button>
        </aside>
      </div>
    </div>
  );
}

export default CheckoutScreen;
