import { useState, useEffect } from "react";
import HMSNavbar from "../components/HMSNavbar";
import { useNavigate } from "react-router-dom";

export default function AdminCreateStaff() {
  const navigate = useNavigate();

  // Formularz
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    role: "Lekarz",
    specialty_id: ""
  });

  const [specialties, setSpecialties] = useState([]);
  const [errors, setErrors] = useState({}); // <-- stan błędów

  // Pobranie listy specjalizacji
  useEffect(() => {
    fetch("http://localhost:8000/specialties")
      .then(res => res.json())
      .then(data => setSpecialties(data))
      .catch(err => console.error("Błąd pobierania specjalizacji:", err));
  }, []);

  // Obsługa zmian w formularzu
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "role" && !(value === "Lekarz" || value === "Ordynator")) {
      setForm({ ...form, role: value, specialty_id: "" });
    } else {
      setForm({ ...form, [name]: value });
    }

    // Czyścimy błąd przy edycji pola
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  // Wysłanie formularza z walidacją
  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!form.first_name.trim()) newErrors.first_name = "Imię jest wymagane";
    if (!form.last_name.trim()) newErrors.last_name = "Nazwisko jest wymagane";
    if (!form.phone.trim()) newErrors.phone = "Telefon jest wymagany";
    if (!form.role) newErrors.role = "Rola jest wymagana";

    if ((form.role === "Lekarz" || form.role === "Ordynator") && !form.specialty_id) {
      newErrors.specialty_id = "Specjalizacja jest wymagana dla tej roli";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return; // przerwij wysyłanie jeśli są błędy

    // Przygotowanie payloadu
    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
      role: form.role,
      specialty_id: (form.role === "Lekarz" || form.role === "Ordynator")
        ? Number(form.specialty_id)
        : null
    };

    fetch("http://localhost:8000/admin/createStaff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Nie udało się dodać pracownika");
        navigate("/adminPanel");
      })
      .catch(err => alert(err.message));
  };

  return (
    <HMSNavbar>
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Dodaj pracownika</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Imię */}
          <div>
            <input
              name="first_name"
              placeholder="Imię"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.first_name && <p className="text-red-600 text-sm mt-1">{errors.first_name}</p>}
          </div>

          {/* Nazwisko */}
          <div>
            <input
              name="last_name"
              placeholder="Nazwisko"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.last_name && <p className="text-red-600 text-sm mt-1">{errors.last_name}</p>}
          </div>

          {/* Telefon */}
          <div>
            <input
              name="phone"
              placeholder="Telefon"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Rola */}
          <div>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Lekarz">Lekarz</option>
              <option value="Ordynator">Ordynator</option>
              <option value="Pielegniarz/Pielegniarka">Pielęgniarz/Pielęgniarka</option>
              <option value="Admin">Administrator</option>
              <option value="Osoba rejestrująca">Osoba rejestrująca</option>
              <option value="Laborant">Laborant</option>
            </select>
            {errors.role && <p className="text-red-600 text-sm mt-1">{errors.role}</p>}
          </div>

          {/* Specjalizacja */}
          <div>
            <select
              name="specialty_id"
              value={form.specialty_id}
              onChange={handleChange}
              disabled={!(form.role === "Lekarz" || form.role === "Ordynator")}
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500
                          ${!(form.role === "Lekarz" || form.role === "Ordynator")
                            ? "bg-gray-100 cursor-not-allowed text-gray-500"
                            : "bg-white text-gray-800"}`}
            >
              <option value="" disabled>-- Wybierz specjalizację --</option>
              {specialties.map(s => (
                <option key={s.specialty_id} value={s.specialty_id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.specialty_id && <p className="text-red-600 text-sm mt-1">{errors.specialty_id}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Zapisz pracownika
          </button>
        </form>
      </div>
    </HMSNavbar>
  );
}
