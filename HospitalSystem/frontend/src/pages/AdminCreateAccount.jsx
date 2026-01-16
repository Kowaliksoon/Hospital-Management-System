import { useEffect, useState } from "react";
import HMSNavbar from "../components/HMSNavbar";
import { useNavigate } from "react-router-dom";

export default function AdminCreateAccount() {
  const navigate = useNavigate();
    const [form, setForm] = useState({
    staff_id: "",
    email: "",
    password: ""
    });

const [staff, setStaff] = useState([]);


  useEffect(() => {
    fetch("http://localhost:8000/admin/staff/without-account")
      .then(res => res.json())
      .then(data => setStaff(data));
  }, []);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();

    fetch("http://localhost:8000/admin/createAccount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    }).then(() => navigate("/adminPanel"));
  };

  const selectedStaff = staff.find(
    s => s.staff_id === Number(form.staff_id)
  );

  return (
    <HMSNavbar>
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Utwórz konto pracownika
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* SELECT PRACOWNIKA */}
          <select
            name="staff_id"
            required
            disabled={staff.length === 0}
            value={form.staff_id}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500
              ${staff.length === 0 ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
          >
            <option value="">
              -- Wybierz pracownika --
            </option>

            {staff.map(s => (
              <option key={s.staff_id} value={s.staff_id}>
                {s.first_name} {s.last_name}
              </option>
            ))}
          </select>

          {/* INFO O PRACOWNIKU */}
          {selectedStaff && (
            <div className="p-4 bg-gray-50 border rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Wybrany pracownik
              </h3>

              <div className="text-sm text-gray-800 space-y-1">
                <p><span className="font-medium">Imię:</span> {selectedStaff.first_name}</p>
                <p><span className="font-medium">Nazwisko:</span> {selectedStaff.last_name}</p>
                <p><span className="font-medium">Rola:</span> {selectedStaff.role}</p>
                <p><span className="font-medium">Telefon:</span> {selectedStaff.phone || "—"}</p>
              </div>
            </div>
          )}

          {/* LOGIN */}
            <input
            type="email"
            name="email"
            placeholder="Email (login)"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />


          {/* HASŁO */}
          <input
            type="password"
            name="password"
            placeholder="Hasło"
            required
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />

          {staff.length === 0 && (
            <p className="text-sm text-gray-500">
              Wszyscy pracownicy posiadają już konta.
            </p>
          )}

          <button
            disabled={staff.length === 0}
            className={`w-full py-2 rounded transition text-white
              ${staff.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"}`}
          >
            Utwórz konto
          </button>
        </form>
      </div>
    </HMSNavbar>
  );
}
