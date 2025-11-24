import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInventory, updateStockQuantity, updateStockQuantityByDrink } from "../api/management";
import "./ManagementScreen.css";

export default function InventoryScreen() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [edits, setEdits] = useState({});
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const navigate = useNavigate();

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

  const displayRows = useMemo(() => {
    const normalized = rows.map((r) => {
      const qty = Number(r.qty ?? r.quantity ?? r.currentqty ?? 0);
      const threshold = Number(r.threshold ?? r.minqty ?? 0);
      const low = threshold > 0 && qty <= threshold;
      return {
        key: r.stockid ?? `drink-${r.drinkid ?? r.itemname ?? r.name}`,
        stockid: r.stockid,
        drinkid: r.drinkid,
        name: r.itemname ?? r.name ?? "Unknown",
        qty,
        threshold,
        low,
        restockDate: r.restock_date,
      };
    });

    let filtered = normalized;
    if (showLowOnly) filtered = filtered.filter((r) => r.low);

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
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const handleEditChange = (stockid, val) => {
    const parsed = val === "" ? "" : Number(val);
    if (Number.isNaN(parsed)) return;
    setEdits((prev) => ({ ...prev, [stockid]: parsed }));
  };

  const saveQty = async (row, override) => {
    try {
      setLoading(true);
      const quantity =
        override !== undefined ? override : edits[row.stockid] ?? row.qty;
      const restockDate = new Date().toISOString();
      if (row.stockid) {
        await updateStockQuantity(row.stockid, quantity, restockDate);
      } else {
        const { stockid } = await updateStockQuantityByDrink(
          row.drinkid,
          quantity,
          restockDate
        );
        row.stockid = stockid;
      }
      setRows((prev) =>
        prev.map((r) =>
          r.stockid === row.stockid
            ? { ...r, qty: quantity, restock_date: restockDate }
            : r.drinkid === row.drinkid
            ? { ...r, stockid: row.stockid, qty: quantity, restock_date: restockDate }
            : r
        )
      );
      setEdits((prev) => {
        const copy = { ...prev };
        delete copy[row.stockid];
        return copy;
      });
    } catch (e) {
      setErr(e.message || "Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

  const refillToTwenty = (row) => saveQty(row, 20);

  return (
    <div className="mgmt-wrap">
      <header className="mgmt-header">
        <h1>Inventory</h1>
        <div className="tabs">
          <button onClick={() => navigate("/management")}>← Management</button>
          <button onClick={() => navigate("/management/trends")}>
            Ordering Trends
          </button>
        </div>
      </header>

      {err && <div className="error">⚠️ {err}</div>}
      {loading && <div className="loading">Loading…</div>}

      {!loading && !err && (
        <section className="card">
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
                className={`btn ${sortBy === "name" ? "btn-active" : ""}`}
                onClick={() => toggleSort("name")}
              >
                Name {sortBy === "name" && (sortDir === "asc" ? "↑" : "↓")}
              </button>
              <button
                className={`btn ${sortBy === "qty" ? "btn-active" : ""}`}
                onClick={() => toggleSort("qty")}
              >
                Qty {sortBy === "qty" && (sortDir === "asc" ? "↑" : "↓")}
              </button>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>On Hand</th>
                <th>Last Restocked</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">
                    No inventory rows
                  </td>
                </tr>
              ) : (
                displayRows.map((r) => (
                  <tr key={r.key} className={r.low ? "low-row" : ""}>
                    <td>{r.name}</td>
                    <td className={r.low ? "low" : ""}>
                      <input
                        type="number"
                        min="0"
                        value={edits[r.stockid] !== undefined ? edits[r.stockid] : r.qty}
                        onChange={(e) => handleEditChange(r.stockid, e.target.value)}
                        className="inv-input"
                      />
                    </td>
                    <td>
                      {r.restockDate
                        ? new Date(r.restockDate).toLocaleString()
                        : "—"}
                    </td>
                    <td>
                      {r.low ? (
                        <span className="low-pill">Low stock</span>
                      ) : (
                        <span className="ok-pill">OK</span>
                      )}
                    </td>
                    <td className="inv-actions">
                      <button className="btn" onClick={() => saveQty(r)} disabled={loading}>
                        Save
                      </button>
                      <button
                        className="btn"
                        onClick={() => refillToTwenty(r)}
                        disabled={loading}
                      >
                        Refill to 20
                      </button>
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
