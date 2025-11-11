import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ManagementScreen.css";

export default function ManagementScreen() {
  const navigate = useNavigate();

  return (
    <div className="mgmt-menu-wrap">
      <header className="mgmt-header">
        <h1>Management</h1>
        <button className="btn back-btn" onClick={() => navigate("/login")}>
          ⬅ Back to Login
        </button>
      </header>

      <main className="mgmt-main">
        <div className="menu-buttons">
          <Link to="/management/trends" className="menu-btn">
            Ordering Trends
          </Link>
          <Link to="/management/inventory" className="menu-btn">
            Inventory
          </Link>
        </div>
        <p className="hint">Choose a section above to view details.</p>
      </main>
    </div>
  );
}
