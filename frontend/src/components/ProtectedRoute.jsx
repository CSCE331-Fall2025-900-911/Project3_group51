import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext"; 

export default function ProtectedRoute({ children, requireRole }) {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const userRole = user.role.trim().toLowerCase();
  if (requireRole && userRole !== requireRole) {
    return <Navigate to="/" replace />;
  }
  return children;
}