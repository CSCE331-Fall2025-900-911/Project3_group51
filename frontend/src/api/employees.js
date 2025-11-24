// The environment variable MUST start with VITE_
const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function validateUser(first, last) {
    // Log the API path for debugging
    console.log(`Validating user at: ${API}/employees/validate?first=${first}&last=${last}`);
    
    const res = await fetch(`${API}/employees/validate?first=${first}&last=${last}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export async function getUserRole(first, last) {
    const res = await fetch(`${API}/employees/role?first=${first}&last=${last}&ci=true`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export async function getEmployees() {
    const res = await fetch(`${API}/employees`);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res.json();
}

export async function createEmployee(payload) {
    const res = await fetch(`${API}/employees`, {
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

export async function updateEmployee(id, payload) {
    const res = await fetch(`${API}/employees/${id}`, {
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

export async function deleteEmployee(id) {
    const res = await fetch(`${API}/employees/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res.json();
}
