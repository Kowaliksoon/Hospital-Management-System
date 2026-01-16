import { useEffect, useState } from "react";

export default function PatientDiagnostics({ userId }) {
    const [diagnostics, setDiagnostics] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchResults() {
            try {
                const res = await fetch(`http://localhost:8000/patient_results/${userId}`);
                if (!res.ok) throw new Error("Nie udało się pobrać wyników");
                const data = await res.json();
                setDiagnostics(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            }
        }

        fetchResults();
    }, [userId]);

    if (error) {
        return <div className="text-red-600">{error}</div>;
    }

    if (diagnostics.length === 0) {
        return <div className="text-gray-500">Brak zleconych badań.</div>;
    }

    return (
        <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Twoje badania</h3>

            <div className="flex flex-col gap-4">
                {diagnostics.map((diag, index) => (
                    <div
                        key={index}
                        className="border border-gray-300 rounded-xl p-4"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h4 className="font-semibold text-lg">
                                    {diag.diagnostic_name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                    Zlecono: {new Date(diag.ordered_at).toLocaleString()}
                                </p>
                            </div>

                            <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold
                                    ${diag.status === "Wpisane"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                            >
                                {diag.status}
                            </span>
                        </div>

                        {diag.status === "Wpisane" && (
                            <div className="mt-3">
                                <h5 className="font-semibold mb-2">Wyniki:</h5>

                                <div className="flex flex-col gap-2">
                                    {diag.results.map((res) => {
                                        const isOutOfRange =
                                            res.value < res.min_value ||
                                            res.value > res.max_value;

                                        return (
                                            <div
                                                key={res.parameter_id}
                                                className={`flex justify-between items-center p-2 rounded
                                                    ${isOutOfRange
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-green-100 text-green-700"
                                                    }`}
                                            >
                                                <span>{res.parameter_name}</span>
                                                <span>
                                                    {res.value} (norma: {res.min_value} – {res.max_value})
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
