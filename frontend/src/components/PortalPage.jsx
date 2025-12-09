import React from "react";
import { useNavigate } from "react-router-dom";
import "./PortalPage.css";

export default function PortalPage() {
  const navigate = useNavigate();

  return (
    <div className="portal-wrap">
      <div className="portal-card">
        <h1>Access Portal</h1>
        <p className="portal-sub">Direct-only entry to system screens.</p>
        <div className="portal-grid">
          <button onClick={() => navigate("/order")}>Customer Kiosk</button>
          <button onClick={() => navigate("/cashier")}>Cashier</button>
          <button onClick={() => navigate("/management")}>Manager</button>
          <button onClick={() => navigate("/menu-board")}>Menu Board</button>
        </div>
      </div>
    </div>
  );
}
