import { Navigate } from "react-router-dom";

export default function RequireRegistrant({ children }) {
  const role = localStorage.getItem("role");
  const staffId = localStorage.getItem("staff_id");

  if (role !== "Osoba rejestrująca") {
    // Jeśli nie Rejestrant → przekieruj na profil
    return <Navigate to={`/staff/profile/${staffId}`} replace />;
  }

  // Jeśli Rejestrant → wyświetl children
  return children;
}
