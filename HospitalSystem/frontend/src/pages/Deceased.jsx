import { useEffect, useState } from "react";
import HMSNavbar from "../components/HMSNavbar";

export default function Deceased() {
  const [deceasedList, setDeceasedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtry
  const [peselFilter, setPeselFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [surnameFilter, setSurnameFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const fetchDeceased = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/patients/deceased");
      if (!res.ok) throw new Error("Błąd pobierania listy zgonów");
      const data = await res.json();
      setDeceasedList(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Błąd serwera");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeceased();
  }, []);

  // Filtracja po wszystkich kryteriach
  const filteredList = deceasedList.filter((p) => {
    return (
      (!peselFilter || p.pesel.includes(peselFilter)) &&
      (!nameFilter || p.name.toLowerCase().includes(nameFilter.toLowerCase())) &&
      (!surnameFilter || p.surname.toLowerCase().includes(surnameFilter.toLowerCase())) &&
      (!departmentFilter || (p.department_name || "").toLowerCase().includes(departmentFilter.toLowerCase()))
    );
  });

  return (
    <HMSNavbar>
      <div className="max-w-6xl mx-auto mt-6 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Lista zgonów</h1>

        {/* Filtry */}
        <div className="flex flex-wrap gap-2 mb-6">
          <input
            type="text"
            placeholder="Filtruj po PESEL"
            value={peselFilter}
            onChange={(e) => setPeselFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Filtruj po imieniu"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Filtruj po nazwisku"
            value={surnameFilter}
            onChange={(e) => setSurnameFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Filtruj po oddziale"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {loading && <p>Ładowanie danych...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && filteredList.length === 0 && <p>Brak zarejestrowanych zgonów.</p>}

        {/* Karty pacjentów */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((p) => (
            <div
              key={p.patient_id}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition"
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-400 p-4">
                <h2 className="text-xl font-bold text-white">{p.name} {p.surname}</h2>
                <p className="text-white/80 text-sm">PESEL: {p.pesel}</p>
              </div>

              <div className="p-4 space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-1">Dane pacjenta</h3>
                  <p className="text-gray-700 text-sm"><span className="font-medium">Data urodzenia:</span> {new Date(p.date_of_birth).toLocaleDateString()}</p>
                  <p className="text-gray-700 text-sm"><span className="font-medium">Oddział w którym przebywał:</span> {p.department_name || "-"}</p>
                </div>

                <div className="bg-red-50 p-3 rounded-lg">
                  <h3 className="font-semibold text-red-700 mb-1">Informacje o zgonie</h3>
                  <p className="text-gray-700 text-sm"><span className="font-medium">Data zgonu:</span> {p.discharge_at ? new Date(p.discharge_at).toLocaleString() : "-"}</p>
                  <p className="text-gray-700 text-sm"><span className="font-medium">Przyczyna:</span> {p.discharge_note || "-"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </HMSNavbar>
  );
}
