import { Navigate } from "react-router-dom";

export default function RequireStaff({ children }) {
  const staffId = localStorage.getItem("staff_id");

  if (!staffId) {
    return <Navigate to="/staff/login" replace />;
  }

  return children;
}
