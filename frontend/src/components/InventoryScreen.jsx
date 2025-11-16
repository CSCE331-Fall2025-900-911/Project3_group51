import React, { useEffect, useState, useMemo } from "react";
import { getInventory } from "../api/management";
import "./ManagementScreen.css";
import { useNavigate } from "react-router-dom";

export default function InventoryScreen() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // view / sort controls
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [sortBy, setSortBy] = useState("name"); // "name" | "qty"
  const [sortDir, setSortDir] = useState("asc"); // "asc" | "desc"

  const navigate = useNavigate();

  // Load inventory once
  useEffect(() => {
    let alive = true;
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const data = await getInventory();
        if (alive) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Normalize, filter, and sort rows for display
  const displayRows = useMemo(() => {
    const normalized = rows.map((r) => {
      const qty = Number(r.qty ?? r.quantity ?? r.currentqty ?? 0);
      const threshold = Number(r.threshold ?? r.minqty ?? 0);
      const low = threshold > 0 && qty <= threshold;

      return {
        key: r.stockid ?? r.itemname ?? r.name,
        name: r.itemname ?? r.name ?? "Unknown",
        qty,
        threshold,
        low,
      };
    });

    let filtered = normalized;
    if (showLowOnly) {
      filtered = filtered.filter((r) => r.low);
    }

    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        const cmp = a.name.localeCompare(b.name);
        return sortDir === "asc" ? cmp : -cmp;
      }
      if (sortBy === "qty") {
        const cmp = a.qty - b.qty;
        return sortDir === "asc" ? cmp : -cmp;
      }
      return 0;
    });

    return filtered;
  }, [rows, showLowOnly, sortBy, sortDir]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      // same field → flip direction
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  return (
    <div className="mgmt-wrap">
      <header className="mgmt-header">
        <h1>Inventory</h1>
        <div className="tabs">
          <button onClick={() => navigate("/management")}>⬅ Management</button>
          <button onClick={() => navigate("/management/trends")}>
            Ordering Trends
          </button>
        </div>
      </header>

      {err && <div className="error">⚠️ {err}</div>}
      {loading && <div className="loading">Loading…</div>}

      {!loading && !err && (
        <section className="card">
          {/* Controls row */}
          <div className="mgmt-controls">
            <label className="low-toggle">
              <input
                type="checkbox"
                checked={showLowOnly}
                onChange={(e) => setShowLowOnly(e.target.checked)}
              />
              <span>Show low stock only</span>
            </label>

            <div className="mgmt-controls-right">
              <span className="muted">Sort by:</span>
              <button
                className={`btn ${
                  sortBy === "name" ? "btn-active" : ""
                }`}
                onClick={() => toggleSort("name")}
              >
                Name {sortBy === "name" && (sortDir === "asc" ? "↑" : "↓")}
              </button>
              <button
                className={`btn ${
                  sortBy === "qty" ? "btn-active" : ""
                }`}
                onClick={() => toggleSort("qty")}
              >
                Qty {sortBy === "qty" && (sortDir === "asc" ? "↑" : "↓")}
              </button>
            </div>
          </div>

          {/* Table */}
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>On Hand</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="muted">
                    No inventory rows
                  </td>
                </tr>
              ) : (
                displayRows.map((r) => (
                  <tr key={r.key} className={r.low ? "low-row" : ""}>
                    <td>{r.name}</td>
                    <td className={r.low ? "low" : ""}>{r.qty}</td>
                    <td>
                      {r.low ? (
                        <span className="low-pill">⚠ Low stock</span>
                      ) : (
                        <span className="ok-pill">OK</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
