import React, { useEffect, useMemo, useState } from "react";
import { getTrends } from "../api/management";
import "./ManagementScreen.css";
import { useNavigate } from "react-router-dom";

export default function TrendsScreen() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      setErr(""); setLoading(true);
      try {
        const data = await getTrends();
        if (alive) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const grouped = useMemo(() => {
    const m = new Map();
    rows.forEach(r => {
      const key = r.itemname ?? r.item ?? "Unknown";
      m.set(key, (m.get(key) || 0) + Number(r.qty ?? r.quantity ?? 0));
    });
    return Array.from(m, ([item, total]) => ({ item, total }))
      .sort((a,b) => b.total - a.total);
  }, [rows]);

  return (
    <div className="mgmt-wrap">
      <header className="mgmt-header">
        <h1>Ordering Trends</h1>
        <div className="tabs">
          <button onClick={() => navigate("/management")}>⬅ Management</button>
          <button onClick={() => navigate("/management/inventory")}>Inventory</button>
        </div>
      </header>

      {err && <div className="error">⚠️ {err}</div>}
      {loading && <div className="loading">Loading…</div>}

      {!loading && !err && (
        <section className="card">
          <table className="table">
            <thead>
              <tr><th>Item</th><th>Total Ordered</th></tr>
            </thead>
            <tbody>
              {grouped.length === 0 ? (
                <tr><td colSpan={2} className="muted">No data</td></tr>
              ) : grouped.map(r => (
                <tr key={r.item}>
                  <td>{r.item}</td>
                  <td>{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}