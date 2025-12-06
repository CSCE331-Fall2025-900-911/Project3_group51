const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Identify a customer by phone/email (does NOT auto-create)
export async function identifyCustomer({ phone, email }) {
  const res = await fetch(`${API}/customers/identify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, email }),
  });
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} on identifyCustomer`);
    err.status = res.status;
    throw err;
  }
  return res.json(); // { id, phone, email, points }
}

// Create a customer explicitly
export async function createCustomer({ name, phone, email }) {
  const res = await fetch(`${API}/customers/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, email }),
  });
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} on createCustomer`);
    err.status = res.status;
    throw err;
  }
  return res.json(); // { id, name, phone, email, points }
}
