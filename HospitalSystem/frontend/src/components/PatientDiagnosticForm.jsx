import { useState, useEffect } from "react";

export default function PatientDiagnosticForm({ onNewDiagnostic }) {
    const [pesel, setPesel] = useState("");
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [diagnostics, setDiagnostics] = useState([]);
    const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);

    // Pobranie listy badań diagnostycznych przy pierwszym renderze
    useEffect(() => {
        fetch("http://localhost:8000/diagnostics")
            .then(res => res.json())
            .then(data => setDiagnostics(data))
            .catch(err => console.error("Błąd pobierania diagnostyk:", err));
    }, []);

    // Wyszukiwanie użytkownika po PESEL
    const handleSearch = async () => {
        setError("");
        setSuccess("");
        setUser(null);
        setSelectedDiagnostic(null);

        if (pesel.length !== 11) {
            setError("PESEL musi mieć 11 cyfr");
            return;
        }

        try {
            const res = await fetch(`http://localhost:8000/users/${pesel}/status`);
            if (!res.ok) throw new Error("Użytkownik nie znaleziony");

            const data = await res.json();

            if (data.is_deceased) {
                setError("Pacjent zmarł i nie można tworzyć dla niego zleceń diagnostycznych");
                return;
            }

            setUser(data);
        } catch (err) {
            console.error(err);
            setError(err.message || "Błąd wyszukiwania użytkownika");
        }
    };

    // Tworzenie zlecenia diagnostycznego
    const handleCreateOrder = async () => {
        if (!selectedDiagnostic) {
            setError("Wybierz badanie");
            return;
        }
        if (!user) {
            setError("Najpierw wyszukaj użytkownika");
            return;
        }

        const now = new Date();
        const tzOffset = now.getTimezoneOffset() * 60000; // w ms
        const localISOTime = new Date(now - tzOffset).toISOString();

        try {
            const res = await fetch(`http://localhost:8000/patient_diagnostics`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.user_id,
                    diagnostic_id: selectedDiagnostic,
                    ordered_at: localISOTime,
                    status: "Oczekuje"
                })
            });

            if (!res.ok) throw new Error("Nie udało się utworzyć zlecenia");

            setSuccess("Zlecenie diagnostyczne utworzone!");
            setError("");
            setSelectedDiagnostic(null);
            if (onNewDiagnostic) onNewDiagnostic();
        } catch (err) {
            console.error(err);
            setError(err.message || "Błąd przy tworzeniu zlecenia");
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md border border-gray-200">
            <h1 className="text-xl font-semibold mb-4">Wyszukaj użytkownika po PESEL</h1>

            <input
                type="text"
                value={pesel}
                onChange={(e) => setPesel(e.target.value)}
                className="border border-blue-800 w-full px-2 py-1 mb-4 rounded"
                placeholder="PESEL"
            />

            <button
                onClick={handleSearch}
                className="bg-blue-800 text-white px-4 py-2 rounded mb-4"
            >
                Szukaj
            </button>

            {error && <div className="text-red-600 mb-3">{error}</div>}
            {success && <div className="text-green-600 mb-3">{success}</div>}

            {user && (
                <div className="mb-4 p-4 border-2 border-blue-700 rounded-xl">
                    <h2 className="text-lg font-semibold mb-2">Dane użytkownika</h2>
                    <p><strong>Imię:</strong> {user.name}</p>
                    <p><strong>Nazwisko:</strong> {user.surname}</p>
                    <p><strong>PESEL:</strong> {user.pesel}</p>

                    <h3 className="mt-4 mb-2 font-semibold">Wybierz badanie</h3>
                    <select
                        className="border border-gray-400 px-2 py-1 rounded w-full mb-4"
                        onChange={(e) => setSelectedDiagnostic(parseInt(e.target.value))}
                        value={selectedDiagnostic || ""}
                    >
                        <option value="">-- Wybierz badanie --</option>
                        {diagnostics.map(d => (
                            <option key={d.diagnostic_id} value={d.diagnostic_id}>
                                {d.name} ({d.description})
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleCreateOrder}
                        className="bg-blue-700 text-white px-4 py-2 rounded mt-2"
                    >
                        Utwórz zlecenie
                    </button>
                </div>
            )}
        </div>
    );
}
