import { useEffect, useState } from "react";

export default function FillDiagnosticForm({ order, onClose }) {
    const [parameters, setParameters] = useState([]);
    const [results, setResults] = useState({});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchParameters = async () => {
            try {
                const res = await fetch(`http://localhost:8000/diagnostic_parameters/${order.diagnostic_id}`);
                if (!res.ok) throw new Error("Nie udało się pobrać parametrów diagnostyki");
                const data = await res.json();
                setParameters(data);

                const initResults = {};
                data.forEach(p => initResults[p.parameter_id] = "");
                setResults(initResults);
            } catch (err) {
                console.error(err);
                setError(err.message || "Błąd pobierania parametrów");
            }
        };

        fetchParameters();
    }, [order.diagnostic_id]);

    const handleResultChange = (paramId, value) => {
        setResults(prev => ({ ...prev, [paramId]: value }));
    };

    const handleSubmit = async () => {
        try {
            const payload = Object.entries(results).map(([paramId, value]) => ({
                parameter_id: parseInt(paramId),
                value
            }));

            const res = await fetch(`http://localhost:8000/fill_diagnostic_results`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order_id: order.id, results: payload })
            });

            if (!res.ok) throw new Error("Nie udało się zapisać wyników");

            setSuccess("Wyniki zapisane pomyślnie!");
            setError("");
            setTimeout(() => onClose(), 1000); // zamknięcie formularza po 1s
        } catch (err) {
            console.error(err);
            setError(err.message || "Błąd zapisu wyników");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                >
                    ✕
                </button>
                <h2 className="text-lg font-semibold mb-4">
                    Wypełnij wyniki: {order.diagnostic_name} dla {order.patient_name} {order.patient_surname}
                </h2>

                {error && <div className="text-red-600 mb-2">{error}</div>}
                {success && <div className="text-green-600 mb-2">{success}</div>}

                {parameters.map(p => (
                    <div key={p.parameter_id} className="mb-3">
                        <label className="block mb-1 font-medium">
                            {p.name} ({p.unit}) [{p.min_value}-{p.max_value}]
                        </label>
                        <input
                            type="text"
                            value={results[p.parameter_id]}
                            onChange={(e) => handleResultChange(p.parameter_id, e.target.value)}
                            className="border border-gray-400 px-2 py-1 rounded w-full"
                        />
                    </div>
                ))}

                <button
                    onClick={handleSubmit}
                    className="bg-blue-700 text-white px-4 py-2 rounded mt-2"
                >
                    Zapisz wyniki
                </button>
            </div>
        </div>
    );
}
