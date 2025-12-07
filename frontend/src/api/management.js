const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function getTrends({ start, end } = {}) {
  const params = [];
  if (start) params.push(`start=${encodeURIComponent(start)}`);
  if (end) params.push(`end=${encodeURIComponent(end)}`);
  const qs = params.length ? `?${params.join("&")}` : "";
  const res = await fetch(`${API}/reports/trends${qs}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getInventory() {
  const res = await fetch(`${API}/reports/inventory`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getSalesReport({ start, end }) {
  const params = [];
  if (start) params.push(`start=${encodeURIComponent(start)}`);
  if (end) params.push(`end=${encodeURIComponent(end)}`);
  const qs = params.length ? `?${params.join("&")}` : "";
  const res = await fetch(`${API}/reports/sales${qs}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getUsageReport({ start, end }) {
  const params = [];
  if (start) params.push(`start=${encodeURIComponent(start)}`);
  if (end) params.push(`end=${encodeURIComponent(end)}`);
  const qs = params.length ? `?${params.join("&")}` : "";
  const res = await fetch(`${API}/reports/usage${qs}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getHourlyReport({ start, end } = {}) {
  const params = [];
  if (start) params.push(`start=${encodeURIComponent(start)}`);
  if (end) params.push(`end=${encodeURIComponent(end)}`);
  // default to today if neither provided
  if (params.length === 0) {
    const today = new Date().toISOString().slice(0, 10);
    params.push(`start=${today}`, `end=${today}`);
  }
  const qs = params.length ? `?${params.join("&")}` : "";
  const res = await fetch(`${API}/reports/hourly${qs}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getZReportSummary() {
  const res = await fetch(`${API}/zreport/summary`, { credentials: "include" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json(); // { reportDate, totalSales }
}

export async function generateZReport(generatedBy, generatedByEmail) {
  const res = await fetch(`${API}/zreport/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ generatedBy, generatedByEmail }),
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export async function resetTodayZReport() {
  const res = await fetch(`${API}/zreport/today`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export async function updateStockQuantity(stockid, quantity, restockDate) {
  const res = await fetch(`${API}/stock/${stockid}/quantity`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity, restock_date: restockDate }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export async function updateStockQuantityByDrink(drinkid, quantity, restockDate, alertLevel) {
  const res = await fetch(`${API}/stock/drink/${drinkid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity, restock_date: restockDate, alert_level: alertLevel }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json(); // { stockid }
}

export async function getRecentOrderItems(limit = 50) {
  const res = await fetch(`${API}/reports/recent-orderitems?limit=${limit}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export async function updateStockAlert(stockid, alertLevel) {
  const res = await fetch(`${API}/stock/${stockid}/alert`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alert_level: alertLevel }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}
