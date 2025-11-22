import React from "react";
import { useNavigate } from "react-router-dom";
import "./ManagerPortal.css";

export default function ManagerPortal() {
  const navigate = useNavigate();
  return (
    <div className="mgr-portal">
      <div className="mgr-card">
        <h1>Manager Portal</h1>
        <p>Select a dashboard to continue.</p>
        <div className="mgr-actions">
          <button onClick={() => navigate("/management")}>
            Management Dashboard
          </button>
          <button onClick={() => navigate("/cashier")}>Cashier Screen</button>
          <button className="link" onClick={() => navigate("/")}>
            Back to Welcome
          </button>
        </div>
      </div>
    </div>
  );
}
