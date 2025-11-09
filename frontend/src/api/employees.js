const API = import.meta.env.REACT_APP_API_URL || "http://localhost:3000/api";

export async function validateUser(first, last) {
    const res = await fetch(`${API}/employees/validate?first=${first}&last=${last}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export async function getUserRole(first, last) {
    const res = await fetch(`${API}/employees/role?first=${first}&last=${last}&ci=true`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}
