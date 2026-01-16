    import { useState } from "react";

    export default function PatientSearch() {
        const [pesel, setPesel] = useState("");
        const [patient, setPatient] = useState(null);
        const [error, setError] = useState("");

        const handleSearch = async () => {
            setError("");
            setPatient(null);

            if (pesel.length !== 11) {
                setError("PESEL musi mieć 11 cyfr");
                return;
            }

            try {
                const res = await fetch(
                    `http://localhost:8000/patients/pesel/${pesel}`
                );

                if (res.ok) {
                    const data = await res.json();
                    setPatient(data);
                } else {
                    setError("Pacjent nie znaleziony");
                }
            } catch (err) {
                setError("Błąd połączenia z serwerem");
            }
        };

        return (
            <div className="max-w-md mx-auto mt-10">
                <h1 className="text-xl font-semibold mb-4">
                    Wyszukaj pacjenta (PESEL)
                </h1>

                <input
                    type="text"
                    value={pesel}
                    onChange={(e) => setPesel(e.target.value)}
                    className="border border-blue-800 w-full px-2 py-1 mb-4 rounded"
                    placeholder="PESEL"
                />

                <button
                    onClick={handleSearch}
                    className="bg-blue-800 text-white px-4 py-2 rounded"
                >
                    Szukaj
                </button>

                {error && (
                    <div className="mt-4 text-red-600 font-medium">
                        {error}
                    </div>
                )}

                {patient && (
                    <div className="mt-6 border-2 border-green-700 p-4 rounded-xl">
                        <h2 className="text-lg font-semibold mb-3">
                            Dane pacjenta
                        </h2>

                        <p><strong>ID:</strong> {patient.patient_id}</p>
                        <p><strong>Imię:</strong> {patient.first_name}</p>
                        <p><strong>Nazwisko:</strong> {patient.last_name}</p>
                        <p><strong>PESEL:</strong> {patient.pesel}</p>
                        <p><strong>Data urodzenia:</strong> {patient.date_of_birth}</p>

                        <div className="mt-4 flex gap-3">
                            <button className="bg-green-700 text-white px-3 py-1 rounded">
                                Rozpocznij diagnostykę
                            </button>

                            <button className="bg-gray-700 text-white px-3 py-1 rounded">
                                Historia
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
