import React, { useState } from "react";
import { validateUser, getUserRole } from "../api/employees";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
    
        let firstLower = first.toLowerCase();
        let lastLower = last.toLowerCase();
        
        const { exists } = await validateUser(firstLower, lastLower);
        if (!exists) {
          setError("Employee not found.");
          setLoading(false);
          return;
        }

        const { role } = await getUserRole(firstLower, lastLower);
        if (!role) {
          setError("User role not found.");
          setLoading(false);
          return;
        }

        const user = {
          first : firstLower,
          last : lastLower,
          role : role.trim().toLowerCase()
        };

        localStorage.setItem("user", JSON.stringify(user));

        // Redirect based on role
        if (role.toLowerCase() === "employee") navigate("/cashier");
        else if (role.toLowerCase() === "manager") navigate("/management");
        else navigate("/");
        
    } catch (err) {
        setError("Error: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>POS Login</h1>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="text"
          placeholder="First name"
          value={first}
          onChange={(e) => setFirst(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="text"
          placeholder="Last name"
          value={last}
          onChange={(e) => setLast(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    background: "#f5f5f5",
  },
  title: {
    marginBottom: "1rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    background: "white",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    gap: "1rem",
  },
  input: {
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
  button: {
    background: "#1976d2",
    color: "white",
    padding: "0.75rem",
    fontSize: "1rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginTop: "1rem",
  },
};

export default LoginPage;