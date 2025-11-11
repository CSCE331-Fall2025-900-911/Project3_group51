import React, { useEffect, useState } from "react";
import { getInventory } from "../api/management";
import "./ManagementScreen.css";
import { useNavigate } from "react-router-dom";

export default function InventoryScreen() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      setErr(""); setLoading(true);
      try {
        const data = await getInventory();
        if (alive) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="mgmt-wrap">
      <header className="mgmt-header">
        <h1>Inventory</h1>
        <div className="tabs">
          <button onClick={() => navigate("/management")}>⬅ Management</button>
          <button onClick={() => navigate("/management/trends")}>Ordering Trends</button>
        </div>
      </header>

      {err && <div className="error">⚠️ {err}</div>}
      {loading && <div className="loading">Loading…</div>}

      {!loading && !err && (
        <section className="card">
          <table className="table">
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Low?</th></tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={3} className="muted">No inventory rows</td></tr>
              ) : rows.map(r => {
                const qty = Number(r.qty ?? r.quantity ?? r.currentqty ?? 0);
                const threshold = Number(r.threshold ?? r.minqty ?? 0);
                const low = threshold > 0 && qty <= threshold;
                return (
                  <tr key={r.stockid ?? r.itemname ?? r.name}>
                    <td>{r.itemname ?? r.name}</td>
                    <td className={low ? "low" : ""}>{qty}</td>
                    <td>{low ? "⚠️ Reorder" : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
