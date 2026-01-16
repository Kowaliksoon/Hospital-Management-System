import { useState, useEffect } from "react";
import HMSNavbar from "../components/HMSNavbar";

export default function AssignDepartment() {
  const [pesel, setPesel] = useState("");
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [reason, setReason] = useState("");
  const [isDeceased, setIsDeceased] = useState(false);

  const staff_id = localStorage.getItem("staff_id");

  // Pobranie listy oddziałów
  useEffect(() => {
    fetch("http://localhost:8000/hospital_departments")
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(err => console.error("Błąd pobierania oddziałów:", err));
  }, []);

  // Szukanie pacjenta po PESELu i sprawdzenie czy zmarł
  const handleSearch = async () => {
    setError("");
    setSuccess("");
    setPatient(null);
    setReason("");
    setSelectedDepartment("");
    setIsDeceased(false);

    if (pesel.length !== 11) {
      setError("PESEL musi mieć 11 cyfr");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/patients/${pesel}/status`);
      if (res.status === 404) {
        setError("Pacjent nie znaleziony");
        return;
      }
      if (!res.ok) {
        setError("Błąd serwera podczas pobierania pacjenta");
        return;
      }

      const data = await res.json();

      if (data.is_deceased) {
        setIsDeceased(true);
        setError("Pacjent zmarł i nie może być przydzielony do oddziału.");
      } else {
        setPatient(data);
      }
    } catch (err) {
      console.error(err);
      setError("Nie można połączyć się z serwerem");
    }
  };

  // Przydzielenie / transfer pacjenta
  const handleAssign = async () => {
    if (!patient) {
      setError("Najpierw wyszukaj pacjenta po PESEL");
      return;
    }

    if (isDeceased) {
      setError("Nie można przypisać pacjenta, który zmarł");
      return;
    }

    if (!selectedDepartment) {
      setError("Wybierz oddział!");
      return;
    }

    try {
      const payload = {
        pesel: patient.pesel,
        admitted_department_id: Number(selectedDepartment),
        admitted_at: new Date().toISOString(),
        status: "ACTIVE",
        staff_id: Number(staff_id),
      };

      // Dodanie powodu tylko jeśli pacjent już ma aktywną hospitalizację
      if (patient.active_hospitalization) {
        payload.reason = reason;
      }

      const res = await fetch(
        "http://localhost:8000/assign_department_by_pesel",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Nie udało się przydzielić pacjenta");
      }

      const data = await res.json();
      setSuccess(data.message);
      setError("");
      setSelectedDepartment("");
      setReason("");
      setPatient(null);
      setPesel("");
      setIsDeceased(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Błąd przy przydzielaniu pacjenta");
    }
  };

  return (
    <HMSNavbar>
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md border border-gray-200">
        <h1 className="text-xl font-semibold mb-4">Przydziel pacjenta do oddziału</h1>

        <input
          type="text"
          placeholder="PESEL pacjenta"
          value={pesel}
          onChange={e => setPesel(e.target.value)}
          className="border border-blue-800 w-full px-2 py-1 mb-4 rounded"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-800 text-white px-4 py-2 rounded mb-4"
        >
          Szukaj pacjenta
        </button>

        {error && <div className="text-red-600 mb-3">{error}</div>}
        {success && <div className="text-green-600 mb-3">{success}</div>}

        {/* Formularz przydzielania tylko jeśli pacjent żyje */}
        {patient && !isDeceased && (
          <div className="mb-4 p-4 border-2 border-blue-700 rounded-xl">
            <h2 className="text-lg font-semibold mb-2">Dane pacjenta</h2>
            <p><strong>Imię:</strong> {patient.name}</p>
            <p><strong>Nazwisko:</strong> {patient.surname}</p>
            <p><strong>PESEL:</strong> {patient.pesel}</p>

            {patient.active_hospitalization && (
              <p className="mb-2 text-gray-600">
                Pacjent aktualnie przebywa w oddziale:{" "}
                <strong>{patient.active_hospitalization.department_name}</strong>
              </p>
            )}

            <h3 className="mt-4 mb-2 font-semibold">Wybierz oddział</h3>
            <select
              className="border border-gray-400 px-2 py-1 rounded w-full mb-4"
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
            >
              <option value="">-- Wybierz oddział --</option>
              {departments.map(dep => (
                <option
                  key={dep.department_id}
                  value={dep.department_id}
                  disabled={
                    patient.active_hospitalization &&
                    dep.department_id === patient.active_hospitalization.admitted_department_id
                  }
                >
                  {dep.name} (piętro {dep.floor})
                </option>
              ))}
            </select>

            {patient.active_hospitalization && (
              <input
                type="text"
                placeholder="Powód przeniesienia"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="border border-gray-400 w-full px-2 py-1 mb-4 rounded"
              />
            )}

            <button
              onClick={handleAssign}
              className="bg-blue-700 text-white px-4 py-2 rounded mt-2"
            >
              {patient.active_hospitalization ? "Przenieś pacjenta" : "Przydziel pacjenta"}
            </button>
          </div>
        )}
      </div>
    </HMSNavbar>
  );
}
