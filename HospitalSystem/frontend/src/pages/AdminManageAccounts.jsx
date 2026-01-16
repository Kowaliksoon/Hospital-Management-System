import { useEffect, useState } from "react";
import HMSNavbar from "../components/HMSNavbar";
import { useSnackbar } from "notistack";

// Import ikon
import PhoneIcon from "../assets/phone.png";
import EmailIcon from "../assets/mail.png";

export default function AdminManageAccounts() {
  const { enqueueSnackbar } = useSnackbar(); // <-- notistack
  const [accounts, setAccounts] = useState([]);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState(null);
  const [specialties, setSpecialties] = useState([]);

  // Pobranie kont
  useEffect(() => {
    fetch("http://localhost:8000/admin/accounts")
      .then(res => res.json())
      .then(data => setAccounts(data));
  }, []);

  // Pobranie listy specjalizacji
  useEffect(() => {
    fetch("http://localhost:8000/specialties")
      .then(res => res.json())
      .then(data => setSpecialties(data));
  }, []);

  // WALIDACJA FORMULARZA MODALA
  const validateForm = () => {
    if (!formData.first_name.trim()) {
      enqueueSnackbar("Pole Imię nie może być puste", { variant: "error" });
      return false;
    }
    if (!formData.last_name.trim()) {
      enqueueSnackbar("Pole Nazwisko nie może być puste", { variant: "error" });
      return false;
    }
    if (!formData.email.trim()) {
      enqueueSnackbar("Pole Email nie może być puste", { variant: "error" });
      return false;
    }
    if (!formData.email.includes("@")) {
      enqueueSnackbar("Nieprawidłowy format email", { variant: "error" });
      return false;
    }
    if (!formData.phone.trim()) {
      enqueueSnackbar("Pole Telefon nie może być puste", { variant: "error" });
      return false;
    }
    if (!formData.role.trim()) {
      enqueueSnackbar("Pole Rola nie może być puste", { variant: "error" });
      return false;
    }
    if ((formData.role === "Lekarz" || formData.role === "Ordynator") && !formData.specialty) {
      enqueueSnackbar("Wybierz specjalizację dla lekarza/ordynatora", { variant: "error" });
      return false;
    }
    return true;
  };

  // Funkcja do zapisu zmian
  const handleSave = async () => {
    if (!validateForm()) return; // <-- walidacja przed wysłaniem

    try {
      const res = await fetch(
        `http://localhost:8000/admin/accounts/${editingAccount.account_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) throw new Error("Błąd przy aktualizacji konta");

      const updatedAccount = await res.json();

      // Aktualizacja lokalnego stanu
      setAccounts(accounts.map(acc =>
        acc.account_id === updatedAccount.account_id ? updatedAccount : acc
      ));
      setEditingAccount(null);
      enqueueSnackbar("Konto zostało zaktualizowane", { variant: "success" });
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Nie udało się zaktualizować konta", { variant: "error" });
    }
  };

  return (
    <HMSNavbar>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Zarządzanie kontami lekarzy</h2>

        {accounts.length === 0 ? (
          <p className="text-gray-500 text-center">Brak kont do wyświetlenia.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {accounts.map(acc => (
              <div
                key={acc.account_id}
                className="bg-gray-50 shadow-md rounded-2xl p-5 flex flex-col justify-between transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                {/* IMIĘ + SPECJALIZACJA */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {acc.staff.first_name} {acc.staff.last_name}
                  </h3>
                  <p className="text-sm text-blue-600">
                    {acc.staff.specialty || "Brak specjalizacji"}
                  </p>
                </div>

                {/* INFO */}
                <div className="space-y-2 text-gray-700 text-sm">
                  <p className="flex items-center gap-2">
                    <img src={EmailIcon} alt="Email" className="w-4 h-4" />
                    <span>{acc.email}</span>
                  </p>
                  {acc.staff.phone && (
                    <p className="flex items-center gap-2">
                      <img src={PhoneIcon} alt="Phone" className="w-4 h-4" />
                      <span>{acc.staff.phone}</span>
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Rola:</span>{" "}
                    <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs">
                      {acc.staff.role}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Utworzono:</span>{" "}
                    {new Date(acc.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* AKCJE */}
                <div className="mt-4 flex justify-end">
                  <button
                    className="py-2 px-4 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    onClick={() => {
                      setEditingAccount(acc);
                      setFormData({
                        first_name: acc.staff.first_name,
                        last_name: acc.staff.last_name,
                        email: acc.email,
                        phone: acc.staff.phone || "",
                        role: acc.staff.role,
                        specialty: acc.staff.specialty || "",
                      });
                    }}
                  >
                    Modyfikacja
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL Modyfikacji */}
      {editingAccount && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Modyfikacja konta</h3>
              <button
                onClick={() => setEditingAccount(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {/* FORM */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Imię"
                className="w-full border rounded-lg px-3 py-2"
                value={formData.first_name}
                onChange={e =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Nazwisko"
                className="w-full border rounded-lg px-3 py-2"
                value={formData.last_name}
                onChange={e =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full border rounded-lg px-3 py-2"
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Telefon"
                className="w-full border rounded-lg px-3 py-2"
                value={formData.phone}
                onChange={e =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />

              {/* SELECT ROLA */}
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={formData.role}
                onChange={e => {
                  const role = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    role,
                    specialty: role === "Lekarz" || role === "Ordynator" ? prev.specialty : "",
                  }));
                }}
              >
                <option value="Lekarz">Lekarz</option>
                <option value="Ordynator">Ordynator</option>
                <option value="Pielegniarz/Pielegniarka">Pielęgniarz/Pielęgniarka</option>
                <option value="Admin">Administrator</option>
                <option value="Osoba rejestrująca">Osoba rejestrująca</option>
                <option value="Laborant">Laborant</option>
              </select>

              {/* SELECT SPECJALIZACJA */}
              <select
                className={`w-full border rounded-lg px-3 py-2 ${
                  formData.role === "Lekarz" || formData.role === "Ordynator"
                    ? "bg-white text-gray-800"
                    : "bg-gray-100 text-gray-500 cursor-not-allowed"
                }`}
                value={formData.specialty}
                onChange={e =>
                  setFormData({ ...formData, specialty: e.target.value })
                }
                disabled={!(formData.role === "Lekarz" || formData.role === "Ordynator")}
              >
                {!formData.specialty && <option value="">Brak specjalizacji</option>}
                {specialties.map(spec => (
                  <option key={spec.specialty_id} value={spec.specialty_id}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ACTIONS */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                onClick={() => setEditingAccount(null)}
              >
                Anuluj
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleSave}
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}
    </HMSNavbar>
  );
}
