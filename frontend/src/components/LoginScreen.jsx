import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get location for query params
  const { user, loading } = useUser();

  // Check for error param
  const queryParams = new URLSearchParams(location.search);
  const errorParam = queryParams.get("error");
  const [errorMessage, setErrorMessage] = React.useState("");

  useEffect(() => {
    if (errorParam) {
      setErrorMessage("Login failed. You may be unauthorized or an error occurred.");
    }
  }, [errorParam]);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    const role = user.role?.trim().toLowerCase();
    if (role === "employee") {
      navigate("/cashier");
    } else if (role === "manager") {
      navigate("/manager-portal");
    } else {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const googleLogin = () => {
    window.location.href = `${API}/auth/google`;
  };

  if (loading || user) {
    return <div style={styles.container}><h1>Loading...</h1></div>
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Employee Login</h1>

      {errorMessage && (
        <div style={styles.errorBox}>
          {errorMessage}
        </div>
      )}

      <div style={styles.form}>
        <button onClick={googleLogin} style={styles.googleButton}>
          Sign in with Google
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          style={styles.secondaryButton}
        >
          Back to Welcome
        </button>
      </div>
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
  secondaryButton: {
    background: "transparent",
    color: "#1976d2",
    padding: "0.5rem",
    fontSize: "0.9rem",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
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

  googleButton: {
    background: "#4285F4", // Google Blue
    color: "white",
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  errorBox: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "15px",
    border: "1px solid #ffcdd2",
    fontWeight: "bold",
  }
};

export default LoginPage;
