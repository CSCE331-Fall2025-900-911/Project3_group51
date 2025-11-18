// frontend/src/api/management.js
// Handles all Management-related API calls (trends + inventory)

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Fetch overall ordering trends (top-selling items, etc.)
 * Returns: [{ itemname, qty, ... }]
 */
export async function getTrends() {
  const res = await fetch(`${API}/reports/trends`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * Fetch current inventory levels.
 * Returns: [{ stockid, itemname, qty, threshold, ... }]
 */
export async function getInventory() {
  const res = await fetch(`${API}/stock`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}
