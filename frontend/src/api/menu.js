// Get the API base URL from the environment variable (VITE_ prefixed)
const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Fetches all menu items from the backend
 */
export async function getMenu() {
    const res = await fetch(`${API}/menu`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

/**
 * Fetches a single menu item by its ID
 * (We will need this for the CustomizationScreen)
 */
export async function getMenuItem(id) {
    const res = await fetch(`${API}/menu/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}