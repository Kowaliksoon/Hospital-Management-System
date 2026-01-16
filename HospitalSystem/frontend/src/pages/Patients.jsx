import HMSNavbar from "../components/HMSNavbar";
import { useEffect, useState } from "react";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [checkingPesel, setCheckingPesel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch pacjentów z polem current_department
  const fetchPatients = () => {
    fetch("http://localhost:8000/patients_with_department")
      .then(res => res.json())
      .then(data => setPatients(data))
      .catch(err => console.error("Błąd fetch:", err));
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // ------------------- EDYCJA PACJENTA -------------------
  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setForm({
      name: patient.name || "",
      surname: patient.surname || "",
      email: patient.email || "",
      phone: patient.phone || "",
      emergency_contact_phone: patient.emergency_contact_phone || "",
      address: patient.address || "",
      pesel: patient.pesel || ""
    });
    setErrors({});
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: null }));
  };

  const validateEditForm = async () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Imię jest wymagane";
    if (!form.surname.trim()) newErrors.surname = "Nazwisko jest wymagane";
    if (!form.email.includes("@")) newErrors.email = "Nieprawidłowy email";
    if (!/^\d{11}$/.test(form.pesel)) newErrors.pesel = "PESEL musi mieć 11 cyfr";

    if (form.phone && !/^\d{9,}$/.test(form.phone))
      newErrors.phone = "Numer telefonu musi mieć co najmniej 9 cyfr";

    if (!form.address || form.address.trim().length < 5)
      newErrors.address = "Adres musi mieć co najmniej 5 znaków";

    if (form.pesel !== editingPatient.pesel) {
      setCheckingPesel(true);
      const res = await fetch(
        `http://localhost:8000/patients/check-pesel/${form.pesel}`
      );
      const data = await res.json();
      setCheckingPesel(false);

      if (data.exists) newErrors.pesel = "Pacjent z tym PESEL już istnieje";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveChanges = async () => {
    const isValid = await validateEditForm();
    if (!isValid) return;

    await fetch(
      `http://localhost:8000/patients/${editingPatient.patient_id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      }
    );

    setEditingPatient(null);
    fetchPatients();
  };

  // ------------------- DODAWANIE PACJENTA -------------------
  const [newPatientForm, setNewPatientForm] = useState({
    name: "",
    surname: "",
    pesel: "",
    date_of_birth: "",
    phone: "",
    emergency_contact_phone: "",
    email: "",
    address: "",
  });

  const validateAddForm = () => {
    const newErrors = {};

    if (newPatientForm.name.trim().length < 2)
      newErrors.name = "Imię musi mieć co najmniej 2 znaki";
    if (newPatientForm.surname.trim().length < 2)
      newErrors.surname = "Nazwisko musi mieć co najmniej 2 znaki";
    if (!/^\d{11}$/.test(newPatientForm.pesel))
      newErrors.pesel = "PESEL musi składać się z 11 cyfr";
    if (!newPatientForm.date_of_birth)
      newErrors.date_of_birth = "Data urodzenia jest wymagana";
    else if (new Date(newPatientForm.date_of_birth) > new Date())
      newErrors.date_of_birth = "Data urodzenia nie może być z przyszłości";

    if (!newPatientForm.phone || !/^\d{9,}$/.test(newPatientForm.phone))
      newErrors.phone = "Numer telefonu musi mieć co najmniej 9 cyfr";

    if (!newPatientForm.address || newPatientForm.address.trim().length < 5)
      newErrors.address = "Adres musi mieć co najmniej 5 znaków";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPatient = async () => {
    if (!validateAddForm()) return;

    const payload = {
      ...newPatientForm,
      email: newPatientForm.email || null,
      emergency_contact_phone: newPatientForm.emergency_contact_phone || null,
    };

    try {
      const res = await fetch("http://localhost:8000/patientRegister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.detail);
        return;
      }

      const data = await res.json();
      alert(`Pacjent dodany: ${data.name} ${data.surname}`);
      setAddModalOpen(false);
      setNewPatientForm({
        name: "",
        surname: "",
        pesel: "",
        date_of_birth: "",
        phone: "",
        emergency_contact_phone: "",
        email: "",
        address: "",
      });
      setErrors({});
      fetchPatients();
    } catch {
      alert("Błąd serwera");
    }
  };

  // ------------------- FILTR PACJENTÓW -------------------
  const filteredPatients = patients.filter(p =>
    (p.pesel.includes(searchQuery) ||
     p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
     (p.current_department || "nie przypisano").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <HMSNavbar>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Lista pacjentów</h1>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Dodaj pacjenta
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Szukaj po imieniu, nazwisku, PESEL lub oddziale..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {filteredPatients.length === 0 ? (
          <div className="text-gray-500 italic">Brak pacjentów spełniających kryteria</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map(p => (
              <div
                key={p.patient_id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">{p.name} {p.surname}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="inline-block text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      PESEL: {p.pesel}
                    </span>
                    <span className="inline-block text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                      {p.current_department || "Nie przypisano"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">{p.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-500">Telefon</p>
                      <p className="font-medium">{p.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Kontakt alarmowy</p>
                      <p className="font-medium">{p.emergency_contact_phone}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500">Adres</p>
                    <p className="font-medium">{p.address}</p>
                  </div>
                </div>

                <button
                  onClick={() => openEditModal(p)}
                  className="mt-5 w-full px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
                >
                  Edytuj dane
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ------------------- MODAL EDYCJI ------------------- */}
      {editingPatient && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-semibold mb-4">Edycja danych pacjenta</h3>
            <div className="space-y-3">
              {[
                { name: "name", label: "Imię" },
                { name: "surname", label: "Nazwisko" },
                { name: "email", label: "Email" },
                { name: "phone", label: "Telefon" },
                { name: "emergency_contact_phone", label: "Telefon alarmowy" },
                { name: "address", label: "Adres" },
                { name: "pesel", label: "PESEL" }
              ].map(field => (
                <div key={field.name}>
                  <input
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.label}
                    className={`w-full border rounded-lg px-3 py-2 ${errors[field.name] ? "border-red-500" : ""}`}
                  />
                  {errors[field.name] && <p className="text-sm text-red-600 mt-1">{errors[field.name]}</p>}
                </div>
              ))}
            </div>
            {checkingPesel && <p className="text-sm text-gray-500 mt-2">Sprawdzanie PESEL...</p>}
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditingPatient(null)} className="px-4 py-2 border rounded-lg">Anuluj</button>
              <button onClick={saveChanges} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Zapisz zmiany</button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- MODAL DODAWANIA ------------------- */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[100vh] overflow-y-auto p-6">
            <h3 className="text-xl font-semibold mb-4">Dodaj nowego pacjenta</h3>
            <div className="space-y-3">
              {[
                { label: "Imię", name: "name", type: "text" },
                { label: "Nazwisko", name: "surname", type: "text" },
                { label: "PESEL", name: "pesel", type: "text" },
                { label: "Data urodzenia", name: "date_of_birth", type: "date" },
                { label: "Telefon", name: "phone", type: "text" },
                { label: "Telefon alarmowy", name: "emergency_contact_phone", type: "text" },
                { label: "Email", name: "email", type: "email" },
                { label: "Adres", name: "address", type: "text" }
              ].map(field => (
                <div key={field.name}>
                  <input
                    type={field.type}
                    value={newPatientForm[field.name]}
                    onChange={e =>
                      setNewPatientForm(prev => ({ ...prev, [field.name]: e.target.value }))
                    }
                    placeholder={field.label}
                    className={`w-full border rounded-lg px-3 py-2 ${
                      errors[field.name] ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors[field.name] && (
                    <p className="text-sm text-red-600 mt-1">{errors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setAddModalOpen(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Anuluj
              </button>
              <button
                onClick={handleAddPatient}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Dodaj pacjenta
              </button>
            </div>
          </div>
        </div>
      )}
    </HMSNavbar>
  );
}
