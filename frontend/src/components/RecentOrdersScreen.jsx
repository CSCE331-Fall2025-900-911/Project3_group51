import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ManagementScreen.css";
import { getRecentOrderItems } from "../api/management";

function RecentOrdersScreen() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentOrderItems(50)
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load recent order items", err);
        setError("Could not load recent order items.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="mgmt-wrap recent-wrap">
      <header className="mgmt-header">
        <div>
          <h1 style={{ margin: 0 }}>Recent Order Items</h1>
          <p className="muted" style={{ marginTop: "4px" }}>
            Last {items.length} entries from newest to oldest
          </p>
        </div>
        <Link className="btn back-btn" to="/management">
          Back
        </Link>
      </header>

      <main className="mgmt-main" style={{ alignItems: "stretch" }}>
        {loading && <p className="loading">Loading…</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && (
          <div className="card mgmt-table-wrap">
            <table className="mgmt-table">
              <thead>
                <tr>
                  <th>Date/Time</th>
                  <th>Order #</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.orderitemid}>
                    <td>{new Date(row.date).toLocaleString()}</td>
                    <td className="nowrap">{row.orderid}</td>
                    <td>{row.drinkname}</td>
                    <td>{row.quantity}</td>
                    <td className="nowrap">${parseFloat(row.price).toFixed(2)}</td>
                    <td className="muted">{row.comments || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default RecentOrdersScreen;
