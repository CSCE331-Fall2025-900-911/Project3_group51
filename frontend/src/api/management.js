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