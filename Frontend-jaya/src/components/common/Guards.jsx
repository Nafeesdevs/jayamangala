import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PageLoader } from "./ui";

export function Protected({ children }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return children;
}

// customers only (admins are sent to the admin panel)
export function CustomerOnly({ children }) {
  const { user, ready, isAdmin } = useAuth();
  const loc = useLocation();
  if (!ready) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

export function AdminOnly({ children }) {
  const { user, ready, isAdmin } = useAuth();
  if (!ready) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
