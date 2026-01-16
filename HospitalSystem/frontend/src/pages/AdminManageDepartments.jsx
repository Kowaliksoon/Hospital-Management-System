import { useEffect, useState } from "react";
import HMSNavbar from "../components/HMSNavbar";
import { useSnackbar } from "notistack";

export default function AdminManageDepartments() {
  const { enqueueSnackbar } = useSnackbar();
  const [departments, setDepartments] = useState([]);
  const [editingDept, setEditingDept] = useState(null);
  const [addDeptModal, setAddDeptModal] = useState(false);
  const [deleteDeptModal, setDeleteDeptModal] = useState(null); // do usuwania
  const [formData, setFormData] = useState({ name: "", description: "", floor: "", phone: "" });
  const [addFormData, setAddFormData] = useState({ name: "", description: "", floor: "", phone: "" });

  // Pobranie oddziałów
  const fetchDepartments = async () => {
    try {
      const res = await fetch("http://localhost:8000/hospital_departments");
      const data = await res.json();
      setDepartments(data);
    } catch (e) {
      console.error(e);
      enqueueSnackbar("Błąd pobierania oddziałów", { variant: "error" });
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Walidacja formularzy
  const validateDeptForm = (data) => {
    if (!data.name.trim()) {
      enqueueSnackbar("Pole Nazwa nie może być puste", { variant: "error" });
      return false;
    }
    if (!data.floor.toString().trim()) {
      enqueueSnackbar("Pole Piętro nie może być puste", { variant: "error" });
      return false;
    }
    if (data.phone && !/^\+?\d{7,15}$/.test(data.phone)) {
      enqueueSnackbar("Nieprawidłowy numer telefonu", { variant: "error" });
      return false;
    }
    return true;
  };

  // Zapis edycji
  const handleSaveEdit = async () => {
    if (!validateDeptForm(formData)) return;
    try {
      const res = await fetch(
        `http://localhost:8000/admin/departments/${editingDept.department_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      if (!res.ok) throw new Error("Błąd aktualizacji oddziału");
      await fetchDepartments();
      setEditingDept(null);
      enqueueSnackbar("Oddział został zaktualizowany", { variant: "success" });
    } catch (e) {
      console.error(e);
      enqueueSnackbar("Nie udało się zapisać zmian", { variant: "error" });
    }
  };

  // Dodawanie nowego oddziału
  const handleAddDept = async () => {
    if (!validateDeptForm(addFormData)) return;
    try {
      const res = await fetch("http://localhost:8000/admin/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addFormData.name,
          description: addFormData.description || null,
          floor: Number(addFormData.floor),
          phone: addFormData.phone || null,
        }),
      });
      if (!res.ok) throw new Error("Błąd tworzenia oddziału");
      await fetchDepartments();
      setAddDeptModal(false);
      setAddFormData({ name: "", description: "", floor: "", phone: "" });
      enqueueSnackbar("Oddział został utworzony", { variant: "success" });
    } catch (e) {
      console.error(e);
      enqueueSnackbar("Nie udało się utworzyć oddziału", { variant: "error" });
    }
  };

  // Usuwanie oddziału
  const handleDelete = async () => {
    if (!deleteDeptModal) return;
    try {
      const res = await fetch(
        `http://localhost:8000/admin/departments/${deleteDeptModal.department_id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Błąd usuwania oddziału");
      await fetchDepartments();
      enqueueSnackbar("Oddział został usunięty", { variant: "success" });
      setDeleteDeptModal(null);
    } catch (e) {
      console.error(e);
      enqueueSnackbar("Nie udało się usunąć oddziału", { variant: "error" });
    }
  };

  return (
    <HMSNavbar>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Zarządzanie oddziałami</h2>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => setAddDeptModal(true)}
          >
            + Dodaj oddział
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map(dep => (
            <div
              key={dep.department_id}
              className="bg-gray-50 shadow-md rounded-2xl p-5 flex flex-col justify-between transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{dep.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{dep.description}</p>
                <div className="text-sm text-gray-700 mt-3 space-y-1">
                  <p><b>Piętro:</b> {dep.floor}</p>
                  <p><b>Telefon:</b> {dep.phone}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() => {
                    setEditingDept(dep);
                    setFormData({
                      name: dep.name,
                      description: dep.description,
                      floor: dep.floor,
                      phone: dep.phone,
                    });
                  }}
                >
                  Modyfikuj
                </button>
                <button
                  className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                  onClick={() => setDeleteDeptModal(dep)}
                >
                  Usuń
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL EDYCJI */}
      {editingDept && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edycja oddziału</h3>
              <button onClick={() => setEditingDept(null)}>✕</button>
            </div>
            <div className="space-y-4">
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Nazwa"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <textarea
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Opis"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Piętro"
                value={formData.floor}
                onChange={e => setFormData({ ...formData, floor: e.target.value })}
              />
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Telefon"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="px-4 py-2 rounded-lg bg-gray-200" onClick={() => setEditingDept(null)}>Anuluj</button>
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white" onClick={handleSaveEdit}>Zapisz</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DODAWANIA */}
      {addDeptModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Nowy oddział</h3>
              <button onClick={() => setAddDeptModal(false)}>✕</button>
            </div>
            <div className="space-y-4">
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Nazwa"
                value={addFormData.name}
                onChange={e => setAddFormData({ ...addFormData, name: e.target.value })}
              />
              <textarea
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Opis"
                value={addFormData.description}
                onChange={e => setAddFormData({ ...addFormData, description: e.target.value })}
              />
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Piętro"
                value={addFormData.floor}
                onChange={e => setAddFormData({ ...addFormData, floor: e.target.value })}
              />
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Telefon"
                value={addFormData.phone}
                onChange={e => setAddFormData({ ...addFormData, phone: e.target.value })}
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="px-4 py-2 rounded-lg bg-gray-200" onClick={() => setAddDeptModal(false)}>Anuluj</button>
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white" onClick={handleAddDept}>Utwórz</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL USUWANIA */}
      {deleteDeptModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 text-center">
            <h3 className="text-xl font-semibold mb-4">Usuwanie oddziału</h3>
            <p className="text-gray-700 mb-6">
              Czy na pewno chcesz usunąć oddział <b>{deleteDeptModal.name}</b>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                onClick={() => setDeleteDeptModal(null)}
              >
                Anuluj
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                onClick={handleDelete}
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
