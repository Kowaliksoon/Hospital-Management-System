import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HMSNavbar from "../components/HMSNavbar";

export default function StaffProfile() {
  const { staff_id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);

useEffect(() => {
  const loggedStaff = localStorage.getItem("staff_id");
  if (!loggedStaff || loggedStaff !== staff_id) {
    navigate("/staff/login");
    return;
  }

  fetch(`http://localhost:8000/staffProfile/${staff_id}`)
    .then(res => res.json())
    .then(data => {
      setStaff(data);
      // zapis roli i id w localStorage
      localStorage.setItem("role", data.role);
    });
}, [staff_id, navigate]);

	

	return (
    <HMSNavbar>
      {staff && (
        <div className="max-w-xl bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Profil pracownika</h2>

          <div className="space-y-2 text-gray-700">
            <p><b>Imię:</b> {staff.first_name}</p>
            <p><b>Nazwisko:</b> {staff.last_name}</p>
            <p><b>Rola:</b> {staff.role}</p>
            <p><b>Telefon:</b> {staff.phone}</p>
          </div>
        </div>
      )}
    </HMSNavbar>
	);
}
