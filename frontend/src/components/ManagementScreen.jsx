import React from "react";
import { Link } from "react-router-dom";
import "./ManagementScreen.css";

const API = import.meta.env.VITE_API_URL;

export default function ManagementScreen() {

  return (
    <div className="mgmt-menu-wrap">
      <header className="mgmt-header">
        <h1>Management</h1>
        <a className="btn back-btn" href={`${API}/auth/logout`}>
          ⬅ Back to Login
        </a>
      </header>

      <main className="mgmt-main">
        <div className="menu-buttons">
          <Link to="/management/trends" className="menu-btn">
            Ordering Trends
          </Link>
          <Link to="/management/inventory" className="menu-btn">
            Inventory
          </Link>
          <Link to="/management/menu" className="menu-btn">
            Menu Management
          </Link>
          <Link to="/management/employees" className="menu-btn">
            Employee Management
          </Link>
        </div>
        <p className="hint">Choose a section above to view details.</p>
      </main>
    </div>
  );
}