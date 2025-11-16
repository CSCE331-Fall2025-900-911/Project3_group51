import React, { useEffect, useMemo, useState } from "react";
import { getTrends } from "../api/management";
import "./ManagementScreen.css";
import { useNavigate } from "react-router-dom";

export default function TrendsScreen() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // view / sort controls
  const [view, setView] = useState("top10");   // "top10" | "all"
  const [sortBy, setSortBy] = useState("total"); // "total" | "alpha"

  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const data = await getTrends();
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

  // Group by item + sort
  const grouped = useMemo(() => {
    const m = new Map();
    rows.forEach((r) => {
      const key = r.itemname ?? r.item ?? "Unknown";
      m.set(key, (m.get(key) || 0) + Number(r.qty ?? r.quantity ?? 0));
    });

    let arr = Array.from(m, ([item, total]) => ({ item, total }));

    if (sortBy === "alpha") {
      arr.sort((a, b) => a.item.localeCompare(b.item));
    } else {
      // total
      arr.sort((a, b) => b.total - a.total);
    }

    if (view === "top10") {
      arr = arr.slice(0, 10);
    }

    return arr;
  }, [rows, view, sortBy]);

  const maxTotal = useMemo(
    () => grouped.reduce((m, r) => Math.max(m, r.total), 0),
    [grouped]
  );

  return (
    <div className="mgmt-wrap">
      <header className="mgmt-header">
        <h1>Ordering Trends</h1>
        <div className="tabs">
          <button onClick={() => navigate("/management")}>
            ⬅ Management
          </button>
          <button onClick={() => navigate("/management/inventory")}>
            Inventory
          </button>
        </div>
      </header>

      {err && <div className="error">⚠️ {err}</div>}
      {loading && <div className="loading">Loading…</div>}

      {!loading && !err && (
        <section className="card">
          {/* Controls */}
          <div className="mgmt-controls">
            <div>
              <span className="muted">View:</span>
              <button
                className={`btn ${view === "top10" ? "btn-active" : ""}`}
                onClick={() => setView("top10")}
              >
                Top 10
              </button>
              <button
                className={`btn ${view === "all" ? "btn-active" : ""}`}
                onClick={() => setView("all")}
              >
                All items
              </button>
            </div>
            <div className="mgmt-controls-right">
              <span className="muted">Sort:</span>
              <button
                className={`btn ${sortBy === "total" ? "btn-active" : ""}`}
                onClick={() => setSortBy("total")}
              >
                By orders
              </button>
              <button
                className={`btn ${sortBy === "alpha" ? "btn-active" : ""}`}
                onClick={() => setSortBy("alpha")}
              >
                A–Z
              </button>
            </div>
          </div>

          <p className="muted trends-caption">
            Relative order volume for each drink based on all recorded orders.
          </p>

          {/* Table + bar chart */}
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Total Ordered</th>
                <th>Activity</th>
              </tr>
            </thead>
            <tbody>
              {grouped.length === 0 ? (
                <tr>
                  <td colSpan={3} className="muted">
                    No data
                  </td>
                </tr>
              ) : (
                grouped.map((r) => (
                  <tr key={r.item}>
                    <td>{r.item}</td>
                    <td>{r.total}</td>
                    <td>
                      <div className="trend-bar-wrap">
                        <div
                          className="trend-bar"
                          style={{
                            width:
                              maxTotal > 0
                                ? `${(r.total / maxTotal) * 100}%`
                                : "0%",
                          }}
                        />
                      </div>
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
