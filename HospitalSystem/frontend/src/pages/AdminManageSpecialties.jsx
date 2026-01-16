import { useEffect, useState } from "react";
import HMSNavbar from "../components/HMSNavbar";
import { useSnackbar } from "notistack";

export default function AdminManageSpecialties() {
  const { enqueueSnackbar } = useSnackbar();

  const [specialties, setSpecialties] = useState([]);
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [error, setError] = useState("");

  // Modal usuwania
  const [deleteModal, setDeleteModal] = useState({ open: false, specialtyId: null, specialtyName: "" });

  /** Pobranie listy specjalizacji */
  const fetchSpecialties = async () => {
    try {
      const res = await fetch("http://localhost:8000/admin/specialties");
      const data = await res.json();
      setSpecialties(data);
    } catch (e) {
      console.error(e);
      enqueueSnackbar("Nie udało się pobrać specjalizacji", { variant: "error" });
    }
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  /** WALIDACJA **/
  const validate = () => {
    if (!formData.name.trim()) {
      setError("Nazwa specjalizacji jest wymagana");
      return false;
    }
    setError("");
    return true;
  };

  /** Zapis (dodanie / edycja) specjalizacji **/
  const handleSaveSpecialty = async () => {
    if (!validate()) return;

    try {
      const isEdit = !!editingSpecialty?.specialty_id;
      const url = isEdit
        ? `http://localhost:8000/admin/specialties/${editingSpecialty.specialty_id}`
        : "http://localhost:8000/admin/specialties";

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name }),
      });

      if (!res.ok) throw new Error("Błąd zapisu specjalizacji");

      await fetchSpecialties();
      setEditingSpecialty(null);
      setFormData({ name: "" });
      enqueueSnackbar(isEdit ? "Specjalizacja zaktualizowana" : "Specjalizacja dodana", { variant: "success" });
    } catch (e) {
      console.error(e);
      enqueueSnackbar("Nie udało się zapisać specjalizacji", { variant: "error" });
    }
  };

  /** Usuwanie specjalizacji **/
  const handleDeleteSpecialty = async () => {
    try {
      const res = await fetch(`http://localhost:8000/admin/specialties/${deleteModal.specialtyId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Błąd usuwania specjalizacji");

      await fetchSpecialties();
      enqueueSnackbar("Specjalizacja usunięta", { variant: "success" });
    } catch (e) {
      console.error(e);
      enqueueSnackbar("Nie udało się usunąć specjalizacji", { variant: "error" });
    } finally {
      setDeleteModal({ open: false, specialtyId: null, specialtyName: "" });
    }
  };

  return (
    <HMSNavbar>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Zarządzanie specjalizacjami</h2>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => { setEditingSpecialty({}); setFormData({ name: "" }); setError(""); }}
          >
            + Dodaj specjalizację
          </button>
        </div>

        {/* KARTY SPECJALIZACJI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {specialties.map(s => (
            <div key={s.specialty_id} className="bg-gray-50 shadow-md rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{s.name}</h3>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() => { setEditingSpecialty(s); setFormData({ name: s.name }); setError(""); }}
                >
                  Modyfikuj
                </button>
                <button
                  className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                  onClick={() => setDeleteModal({ open: true, specialtyId: s.specialty_id, specialtyName: s.name })}
                >
                  Usuń
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL EDYCJI / DODAWANIA */}
      {editingSpecialty && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {editingSpecialty?.specialty_id ? "Edycja specjalizacji" : "Nowa specjalizacja"}
              </h3>
              <button onClick={() => setEditingSpecialty(null)}>✕</button>
            </div>
            <div className="space-y-2">
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Nazwa specjalizacji"
                value={formData.name}
                onChange={e => setFormData({ name: e.target.value })}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="px-4 py-2 rounded-lg bg-gray-200" onClick={() => setEditingSpecialty(null)}>Anuluj</button>
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white" onClick={handleSaveSpecialty}>Zapisz</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL POTWIERDZENIA USUWANIA */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-2">Potwierdzenie usunięcia</h3>
            <p className="mb-4">Czy na pewno chcesz usunąć specjalizację <b>{deleteModal.specialtyName}</b>?</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200"
                onClick={() => setDeleteModal({ open: false, specialtyId: null, specialtyName: "" })}
              >
                Anuluj
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-500 text-white"
                onClick={handleDeleteSpecialty}
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}

    </HMSNavbar>
  );
}
