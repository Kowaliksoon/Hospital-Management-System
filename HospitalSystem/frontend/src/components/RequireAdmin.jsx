import { Navigate } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const role = localStorage.getItem("role");
  const staffId = localStorage.getItem("staff_id");


  if (role !== "Admin") {
    return <Navigate to={`/staff/profile/${staffId}`} replace />;
  }

  return children;
}
