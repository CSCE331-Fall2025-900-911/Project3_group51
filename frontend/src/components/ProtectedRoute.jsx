import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requireRole }) {
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null; // { first, last, role }

  if (!user) return <Navigate to="/login" replace />;
  if (requireRole && user.role !== requireRole) return <Navigate to="/" replace />;
  return children;
}