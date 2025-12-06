import React, { useEffect, useState } from "react";
import {
  getSalesReport,
  getUsageReport,
  getZReportSummary,
  generateZReport,
  resetTodayZReport,
} from "../api/management";
import "./ManagementScreen.css";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function TrendsScreen() {
  const [salesRows, setSalesRows] = useState([]);
  const [usageRows, setUsageRows] = useState([]);
  const [zSummary, setZSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [activeTab, setActiveTab] = useState("zreport"); // sales | usage | xreport | zreport

  const navigate = useNavigate();
  const { user } = useUser();
  const [storedUser, setStoredUser] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("currentUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Sync stored user when context user changes
  useEffect(() => {
    if (!user) return;
    const merged = {
      firstname: user.firstname || user.firstName || user.name,
      firstName: user.firstName || user.firstname || user.name,
      name: user.name || user.firstname || user.firstName,
      email: user.email || user.Email,
    };
    setStoredUser(merged);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("currentUser", JSON.stringify(merged));
      } catch {
        /* ignore */
      }
    }
  }, [user]);

  const fetchData = async () => {
    setErr("");
    setLoading(true);
    try {
      if (activeTab === "sales") {
        const data = await getSalesReport({ start, end });
        setSalesRows(Array.isArray(data) ? data : []);
      } else if (activeTab === "usage") {
        const data = await getUsageReport({ start, end });
        setUsageRows(Array.isArray(data) ? data : []);
      } else if (activeTab === "zreport") {
        const data = await getZReportSummary();
        setZSummary(data);
      }
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleGenerateZ = async () => {
    try {
      setLoading(true);
      const genBy =
        user?.firstname ||
        user?.firstName ||
        user?.name ||
        storedUser?.firstname ||
        storedUser?.firstName ||
        storedUser?.name ||
        "System";
      const genEmail =
        user?.email ||
        user?.Email ||
        storedUser?.email ||
        storedUser?.Email ||
        null;
      // persist the chosen name in session storage for future calls
      if (typeof window !== "undefined" && genBy) {
        sessionStorage.setItem(
          "currentUser",
          JSON.stringify({
            firstname: genBy,
            firstName: genBy,
            name: genBy,
            email: genEmail,
          })
        );
        setStoredUser({ firstname: genBy, firstName: genBy, name: genBy, email: genEmail });
      }
      await generateZReport(genBy, genEmail);
      const data = await getZReportSummary();
      setZSummary(data);
      setErr("");
    } catch (e) {
      setErr(e.message || "Failed to generate Z-report");
    } finally {
      setLoading(false);
    }
  };

  const handleResetZ = async () => {
    try {
      setLoading(true);
      await resetTodayZReport();
      const data = await getZReportSummary();
      setZSummary(data);
      setErr("");
    } catch (e) {
      setErr(e.message || "Failed to reset Z-report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mgmt-wrap">
      <header className="mgmt-header">
        <h1>Trend Analysis</h1>
        <div className="tabs">
          <button onClick={() => navigate("/management")}>Management</button>
          <button onClick={() => navigate("/management/inventory")}>
            Inventory
          </button>
        </div>
      </header>

      {err && <div className="error">{err}</div>}
      {loading && <div className="loading">Loading…</div>}

      <section className="card">
        <div className="mgmt-controls">
          <div className="date-controls">
            <label>
              <span className="muted">Start:</span>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
            <label>
              <span className="muted">End:</span>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </label>
            <button className="btn" onClick={fetchData}>
              Generate Reports
            </button>
          </div>
        </div>

        <div className="tabs" style={{ marginBottom: "0.75rem" }}>
          {[
            { id: "sales", label: "Sales Report" },
            { id: "usage", label: "Product Usage" },
            { id: "xreport", label: "X-Report (Hourly Today)" },
            { id: "zreport", label: "Z-Report" },
          ].map((t) => (
            <button
              key={t.id}
              className={`btn ${activeTab === t.id ? "btn-active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "sales" && (
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {salesRows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="muted">
                    No data
                  </td>
                </tr>
              ) : (
                salesRows.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.drinkname}</td>
                    <td>{r.total_quantity}</td>
                    <td>${parseFloat(r.total_sales).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === "usage" && (
          <table className="table">
            <thead>
              <tr>
                <th>Drink ID</th>
                <th>Total Used</th>
              </tr>
            </thead>
            <tbody>
              {usageRows.length === 0 ? (
                <tr>
                  <td colSpan={2} className="muted">
                    No data
                  </td>
                </tr>
              ) : (
                usageRows.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.drinkid}</td>
                    <td>{r.total_used}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === "xreport" && (
          <div className="muted">X-Report (Hourly Today) view placeholder.</div>
        )}

        {activeTab === "zreport" && (
          <div className="zreport-section">
            <p className="muted">
              Generate the end-of-day Z-Report. This can only be run once per
              day.
            </p>
            <div className="zreport-actions">
              <button className="btn" onClick={handleGenerateZ}>
                Generate Today's Z-Report
              </button>
              <button className="btn danger" onClick={handleResetZ}>
                Reset Today's Z-Report
              </button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Report Date</th>
                  <th>Total Sales</th>
                  <th>Total Voided</th>
                  <th>Calculated Tax</th>
                  <th>Generated By</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {zSummary?.reportDate
                      ? new Date(zSummary.reportDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    {zSummary
                      ? `$${parseFloat(
                          (zSummary.totalSales ??
                            zSummary.totalsales ??
                            0)
                        ).toFixed(2)}`
                      : "-"}
                  </td>
                  <td>
                    {zSummary
                      ? `$${parseFloat(
                          (zSummary.totalAmountVoided ??
                            zSummary.total_voids ??
                            0)
                        ).toFixed(2)}`
                      : "-"}
                  </td>
                  <td>
                    {zSummary
                      ? `$${parseFloat(
                          (zSummary.totalCalculatedTax ??
                            zSummary.calculated_tax ??
                            0)
                        ).toFixed(2)}`
                      : "-"}
                  </td>
                  <td>
                    {zSummary?.generatedByEmployeeName ||
                      zSummary?.generated_by ||
                      "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
