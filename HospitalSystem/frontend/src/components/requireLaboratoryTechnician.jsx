import { Navigate } from "react-router-dom";

export default function RequireLabTech({ children }) {
  const role = localStorage.getItem("role");
  const staffId = localStorage.getItem("staff_id");

  if (role !== "Laborant") {
    // Jeśli nie Laboratory Technician → przekieruj na profil
    return <Navigate to={`/staff/profile/${staffId}`} replace />;
  }

  // Jeśli Laboratory Technician → wyświetl children
  return children;
}
