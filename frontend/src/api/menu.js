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

export async function createMenuItem(payload) {
    const res = await fetch(`${API}/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res.json(); // { id }
}

export async function updateMenuItem(id, payload) {
    const res = await fetch(`${API}/menu/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res.json();
}

export async function deleteMenuItem(id) {
    const res = await fetch(`${API}/menu/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res.json();
}

export async function uploadMenuImage(filename, base64Data) {
    const res = await fetch(`${API}/menu/upload-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, data: base64Data }),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res.json(); // { filename }
}
