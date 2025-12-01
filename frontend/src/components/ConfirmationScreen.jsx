// frontend/src/components/ConfirmationScreen.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ConfirmationScreen.css";

import useLanguage from "../hooks/useLanguage";
import useTranslate from "../hooks/useTranslate";
import { CONFIRM_LABELS } from "./ConfirmationScreen.labels";

function ConfirmationScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  // Language + translation
  const { selectedLang } = useLanguage();
  const labels = useTranslate(CONFIRM_LABELS, selectedLang);

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
        <h1>{labels.thankYou}</h1>

        <p className="order-number">{labels.yourOrderNumber}</p>

        <h2 className="order-id">{orderNumber}</h2>

        <p className="wait-message">{labels.waitCounter}</p>

        <p className="redirect-message">{labels.redirectMsg}</p>
      </div>
    </div>
  );
}

export default ConfirmationScreen;
