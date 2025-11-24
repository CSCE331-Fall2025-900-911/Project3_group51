const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function getTrends() {
  const res = await fetch(`${API}/reports/trends`);
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

export async function updateStockQuantityByDrink(drinkid, quantity, restockDate) {
  const res = await fetch(`${API}/stock/drink/${drinkid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity, restock_date: restockDate }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json(); // { stockid }
}
