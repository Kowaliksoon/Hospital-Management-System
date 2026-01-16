import { useEffect, useState } from "react";
import FillDiagnosticForm from "./FillDiagnosticForm";

export default function PendingDiagnostics({refresh}) {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderToDelete, setOrderToDelete] = useState(null); // nowy stan

    const fetchOrders = async () => {
        try {
            const res = await fetch("http://localhost:8000/pending_diagnostics");
            if (!res.ok) throw new Error("Nie udało się pobrać zleceń");
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error(err);
            setError(err.message || "Błąd pobierania zleceń");
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [refresh]);

    const handleSelectOrder = (order) => setSelectedOrder(order);

    const handleDeleteOrder = async (orderId) => {
        try {
            const res = await fetch(`http://localhost:8000/patient_diagnostics/${orderId}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Nie udało się usunąć zlecenia");

            setOrderToDelete(null);
            fetchOrders();
        } catch (err) {
            console.error(err);
            setError(err.message || "Błąd przy usuwaniu zlecenia");
        }
    };

    return (
        <div className="max-w-5xl mx-auto mt-10 p-6 bg-gray-50 rounded-2xl shadow-lg border border-gray-300">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Zlecenia diagnostyczne do uzupełnienia</h1>

            {error && <div className="text-red-600 mb-3">{error}</div>}

            {orders.length === 0 ? (
                <div className="text-gray-500 italic">Brak zleceń do uzupełnienia</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse rounded-lg overflow-hidden shadow-sm">
                        <thead className="bg-blue-50">
                            <tr>
                                <th className="text-left px-4 py-2 text-gray-900 font-semibold border-b border-gray-300">Pacjent</th>
                                <th className="text-left px-4 py-2 text-gray-900 font-semibold border-b border-gray-300">PESEL</th>
                                <th className="text-left px-4 py-2 text-gray-900 font-semibold border-b border-gray-300">Badanie</th>
                                <th className="text-left px-4 py-2 text-gray-900 font-semibold border-b border-gray-300">Data zlecenia</th>
                                <th className="text-center px-4 py-2 text-gray-900 font-semibold border-b border-gray-300">Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => (
                                <tr
                                    key={order.id}
                                    className={`transition-colors duration-200 ${
                                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                    } hover:bg-blue-100`}
                                >
                                    <td className="px-4 py-3 text-gray-800 border-b border-gray-300">{order.patient_name} {order.patient_surname}</td>
                                    <td className="px-4 py-3 text-gray-800 border-b border-gray-300">{order.user_pesel}</td>
                                    <td className="px-4 py-3 text-gray-800 border-b border-gray-300">{order.diagnostic_name}</td>
                                    <td className="px-4 py-3 text-gray-800 border-b border-gray-300">{new Date(order.ordered_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-center border-b border-gray-300 flex justify-center gap-2">
                                        <button
                                            onClick={() => handleSelectOrder(order)}
                                            className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                                        >
                                            Wypełnij wyniki
                                        </button>
                                        <button
                                            onClick={() => setOrderToDelete(order)}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Usuń
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedOrder && (
                <FillDiagnosticForm order={selectedOrder} onClose={() => { setSelectedOrder(null); fetchOrders(); }} />
            )}

            {/* MODAL POTWIERDZENIA USUNIĘCIA */}
            {orderToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
                        <h3 className="text-lg font-semibold mb-4">Usuń zlecenie</h3>
                        <p className="mb-6">Czy na pewno chcesz usunąć zlecenie dla <strong>{orderToDelete.patient_name}</strong>?</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setOrderToDelete(null)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={() => handleDeleteOrder(orderToDelete.id)}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
                            >
                                Usuń
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
