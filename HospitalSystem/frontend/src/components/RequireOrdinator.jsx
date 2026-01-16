import { Navigate } from "react-router-dom";

export default function RequireOrdinator({ children }) {
  const role = localStorage.getItem("role");
  const staffId = localStorage.getItem("staff_id");

  if (role !== "Ordynator") {
    return <Navigate to={`/staff/profile/${staffId}`} replace />;
  }

  return children;
}
