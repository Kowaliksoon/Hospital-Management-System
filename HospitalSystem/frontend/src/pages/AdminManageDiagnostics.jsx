import { useEffect, useState } from "react";
import HMSNavbar from "../components/HMSNavbar";
import { useSnackbar } from "notistack";

export default function AdminManageDiagnostics() {
  const { enqueueSnackbar } = useSnackbar();

  const [diagnostics, setDiagnostics] = useState([]);
  const [editingDiag, setEditingDiag] = useState(null);
  const [editingParamsDiag, setEditingParamsDiag] = useState(null);
  const [assigningParamsDiag, setAssigningParamsDiag] = useState(null);
  const [selectedDiag, setSelectedDiag] = useState(null);

  const [formData, setFormData] = useState({ name: "", description: "", price: "" });
  const [errors, setErrors] = useState({});

  const [paramData, setParamData] = useState([]);
  const [paramErrors, setParamErrors] = useState([]);

  const [confirmDelete, setConfirmDelete] = useState({ open: false, diagId: null, paramId: null });

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const fetchDiagnostics = async () => {
    try {
      const res = await fetch("http://localhost:8000/admin/diagnostics/list");
      const data = await res.json();
      setDiagnostics(data);
    } catch (e) {
      console.error(e);
      enqueueSnackbar("Nie udało się pobrać badań", { variant: "error" });
    }
  };

  /** WALIDACJA BADAŃ **/
  const validateDiag = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Nazwa jest wymagana";
    if (!formData.description) newErrors.description = "Opis jest wymagany";
    if (formData.price === "" || isNaN(formData.price)) newErrors.price = "Podaj poprawną cenę";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDiag = async () => {
    if (!validateDiag()) return;

    try {
      const isEdit = !!editingDiag?.diagnostic_id;
      const url = isEdit
        ? `http://localhost:8000/admin/diagnostics/${editingDiag.diagnostic_id}`
        : "http://localhost:8000/admin/diagnostics";

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
        }),
      });

      if (!res.ok) throw new Error("Błąd zapisu badania");
      const saved = await res.json();
      setDiagnostics(isEdit
        ? diagnostics.map(d => d.diagnostic_id === saved.diagnostic_id ? saved : d)
        : [...diagnostics, saved]
      );
      setEditingDiag(null);
      setFormData({ name: "", description: "", price: "" });
      enqueueSnackbar("Badanie zapisane pomyślnie!", { variant: "success" });
    } catch (e) {
      console.error(e);
      enqueueSnackbar("Nie udało się zapisać badania", { variant: "error" });
    }
  };

  /** PARAMETRY **/
  const addParam = () => {
    setParamData([...paramData, { parameter_id: null, name: "", unit: "", min_value: "", max_value: "" }]);
    setParamErrors([...paramErrors, {}]);
  };

  const removeParam = idx => {
    setParamData(paramData.filter((_, i) => i !== idx));
    setParamErrors(paramErrors.filter((_, i) => i !== idx));
  };

  const updateParam = (idx, field, value) => {
    const newParams = [...paramData];
    newParams[idx][field] = value;
    setParamData(newParams);
  };

  const validateParams = () => {
    const newErrors = paramData.map(p => ({
      name: !p.name ? "Wymagana" : "",
      unit: !p.unit ? "Wymagana" : "",
      min_value: p.min_value === "" ? "Wymagana" : "",
      max_value: p.max_value === "" ? "Wymagana" : "",
    }));
    setParamErrors(newErrors);
    return newErrors.every(e => !e.name && !e.unit && !e.min_value && !e.max_value);
  };

  /** ZAPIS PARAMETRÓW (modal u góry) **/
  const handleSaveNewParams = async () => {
    if (!selectedDiag) return enqueueSnackbar("Wybierz badanie", { variant: "warning" });
    if (!validateParams()) return;

    try {
      for (const p of paramData) {
        await fetch(`http://localhost:8000/admin/diagnostic_parameters/${selectedDiag.diagnostic_id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: p.name,
            unit: p.unit,
            min_value: Number(p.min_value),
            max_value: Number(p.max_value),
          }),
        });
      }
      await fetchDiagnostics();
      setAssigningParamsDiag(null);
      setSelectedDiag(null);
      setParamData([]);
      enqueueSnackbar("Parametry dodane pomyślnie!", { variant: "success" });
    } catch (e) {
      console.error(e);
      enqueueSnackbar("Nie udało się zapisać parametrów", { variant: "error" });
    }
  };

  /** ZAPIS PARAMETRÓW (modal w kartach) **/
  const handleSaveParam = async () => {
    if (!editingParamsDiag) return enqueueSnackbar("Wybierz badanie", { variant: "warning" });
    if (!validateParams()) return;

    try {
      for (const p of paramData) {
        if (p.parameter_id) {
          await fetch(`http://localhost:8000/admin/diagnostic_parameters/${p.parameter_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: p.name,
              unit: p.unit,
              min_value: Number(p.min_value),
              max_value: Number(p.max_value),
            }),
          });
        } else {
          await fetch(`http://localhost:8000/admin/diagnostic_parameters/${editingParamsDiag.diagnostic_id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: p.name,
              unit: p.unit,
              min_value: Number(p.min_value),
              max_value: Number(p.max_value),
            }),
          });
        }
      }
      await fetchDiagnostics();
      setEditingParamsDiag(null);
      setParamData([]);
      enqueueSnackbar("Parametry zapisane pomyślnie!", { variant: "success" });
    } catch (e) {
      console.error(e);
      enqueueSnackbar("Nie udało się zapisać parametrów", { variant: "error" });
    }
  };

  /** USUWANIE PARAMETRU **/
  const handleDeleteParam = async (diagId, paramId) => {
    try {
      await fetch(`http://localhost:8000/admin/diagnostic_parameters/${paramId}`, { method: "DELETE" });
      setParamData(paramData.filter(p => p.parameter_id !== paramId));
      setDiagnostics(diagnostics.map(d =>
        d.diagnostic_id === diagId
          ? { ...d, parameters: d.parameters.filter(p => p.parameter_id !== paramId) }
          : d
      ));
      enqueueSnackbar("Parametr usunięty pomyślnie!", { variant: "success" });
    } catch (e) {
      console.error(e);
      enqueueSnackbar("Nie udało się usunąć parametru", { variant: "error" });
    } finally {
      setConfirmDelete({ open: false, diagId: null, paramId: null });
    }
  };

  /** WYŚWIETLANIE KART I MODALI **/
  return (
    <HMSNavbar>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Zarządzanie diagnostyką</h2>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => { setEditingDiag({}); setFormData({ name: "", description: "", price: "" }); setErrors({}); }}
            >
              + Dodaj badanie
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={() => setAssigningParamsDiag(true)}
            >
              + Przypisz parametry
            </button>
          </div>
        </div>

        {/* KARTY BADAŃ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {diagnostics.map(diag => (
            <div key={diag.diagnostic_id} className="bg-gray-50 shadow-md rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{diag.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{diag.description}</p>
                <p className="text-sm text-gray-700 mt-2"><b>Cena:</b> {diag.price} zł</p>
                <div className="mt-3 space-y-1">
                  <h4 className="font-medium text-gray-800">Parametry:</h4>
                  {diag.parameters?.length > 0
                    ? diag.parameters.map(p => (
                        <p key={p.parameter_id} className="text-sm text-gray-700">{p.name} ({p.unit}) [{p.min_value}-{p.max_value}]</p>
                      ))
                    : <p className="text-sm text-gray-500">Brak parametrów</p>}
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() => { setEditingDiag(diag); setFormData({ name: diag.name, description: diag.description, price: diag.price }); setErrors({}); }}
                >
                  Edytuj
                </button>
                <button
                  className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  onClick={() => { setEditingParamsDiag(diag); setParamData(diag.parameters?.length ? diag.parameters.map(p => ({ ...p })) : []); setParamErrors([]); }}
                >
                  Parametry
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DODAWANIA / EDYCJI PARAMETRÓW */}
      {editingParamsDiag && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Parametry badania: {editingParamsDiag.name}</h3>
              <button onClick={() => setEditingParamsDiag(null)}>✕</button>
            </div>
            {paramData.length > 0
              ? paramData.map((p, idx) => (
                  <div key={idx} className="flex gap-2 items-center mb-2">
                    <div className="flex flex-col w-1/3">
                      <input placeholder="Nazwa" value={p.name} onChange={e => updateParam(idx, "name", e.target.value)} className="border rounded px-2 py-1" />
                      {paramErrors[idx]?.name && <p className="text-red-500 text-xs">{paramErrors[idx].name}</p>}
                    </div>
                    <div className="flex flex-col w-1/4">
                      <input placeholder="Jednostka" value={p.unit} onChange={e => updateParam(idx, "unit", e.target.value)} className="border rounded px-2 py-1" />
                      {paramErrors[idx]?.unit && <p className="text-red-500 text-xs">{paramErrors[idx].unit}</p>}
                    </div>
                    <div className="flex flex-col w-1/6">
                      <input type="number" placeholder="Min" value={p.min_value} onChange={e => updateParam(idx, "min_value", e.target.value)} className="border rounded px-2 py-1" />
                      {paramErrors[idx]?.min_value && <p className="text-red-500 text-xs">{paramErrors[idx].min_value}</p>}
                    </div>
                    <div className="flex flex-col w-1/6">
                      <input type="number" placeholder="Max" value={p.max_value} onChange={e => updateParam(idx, "max_value", e.target.value)} className="border rounded px-2 py-1" />
                      {paramErrors[idx]?.max_value && <p className="text-red-500 text-xs">{paramErrors[idx].max_value}</p>}
                    </div>
                    <button
                      onClick={() => p.parameter_id ? setConfirmDelete({ open: true, diagId: editingParamsDiag.diagnostic_id, paramId: p.parameter_id }) : removeParam(idx)}
                      className="px-2 py-1 bg-red-500 text-white rounded">✕</button>
                  </div>
                ))
              : <p className="text-sm text-gray-500 mb-2">Brak parametrów</p>}
            <div className="mt-4 flex justify-end gap-3">
              <button className="px-4 py-2 rounded-lg bg-gray-200" onClick={() => setEditingParamsDiag(null)}>Anuluj</button>
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white" onClick={handleSaveParam}>Zapisz zmiany</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DODAWANIA NOWYCH PARAMETRÓW */}
      {assigningParamsDiag && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Dodaj parametry do badania</h3>
              <button onClick={() => { setAssigningParamsDiag(null); setSelectedDiag(null); setParamData([]); setParamErrors([]); }}>✕</button>
            </div>
            <select
              className="w-full border rounded-lg px-3 py-2 mb-4"
              value={selectedDiag?.diagnostic_id || ""}
              onChange={e => {
                const diag = diagnostics.find(d => d.diagnostic_id === Number(e.target.value));
                setSelectedDiag(diag);
                setParamData([]);
                setParamErrors([]);
              }}
            >
              <option value="" disabled>Wybierz badanie</option>
              {diagnostics.map(d => (
                <option key={d.diagnostic_id} value={d.diagnostic_id}>{d.name}</option>
              ))}
            </select>

            {paramData.map((p, idx) => (
              <div key={idx} className="flex gap-2 items-center mb-2">
                <div className="flex flex-col w-1/3">
                  <input placeholder="Nazwa" value={p.name} onChange={e => updateParam(idx, "name", e.target.value)} className="border rounded px-2 py-1" />
                  {paramErrors[idx]?.name && <p className="text-red-500 text-xs">{paramErrors[idx].name}</p>}
                </div>
                <div className="flex flex-col w-1/4">
                  <input placeholder="Jednostka" value={p.unit} onChange={e => updateParam(idx, "unit", e.target.value)} className="border rounded px-2 py-1" />
                  {paramErrors[idx]?.unit && <p className="text-red-500 text-xs">{paramErrors[idx].unit}</p>}
                </div>
                <div className="flex flex-col w-1/6">
                  <input type="number" placeholder="Min" value={p.min_value} onChange={e => updateParam(idx, "min_value", e.target.value)} className="border rounded px-2 py-1" />
                  {paramErrors[idx]?.min_value && <p className="text-red-500 text-xs">{paramErrors[idx].min_value}</p>}
                </div>
                <div className="flex flex-col w-1/6">
                  <input type="number" placeholder="Max" value={p.max_value} onChange={e => updateParam(idx, "max_value", e.target.value)} className="border rounded px-2 py-1" />
                  {paramErrors[idx]?.max_value && <p className="text-red-500 text-xs">{paramErrors[idx].max_value}</p>}
                </div>
                <button onClick={() => removeParam(idx)} className="px-2 py-1 bg-red-500 text-white rounded">✕</button>
              </div>
            ))}
            <button onClick={addParam} className="px-3 py-1 bg-blue-500 text-white rounded mb-3">+ Nowy parametr</button>
            <div className="mt-4 flex justify-end gap-3">
              <button className="px-4 py-2 rounded-lg bg-gray-200" onClick={() => { setAssigningParamsDiag(null); setSelectedDiag(null); setParamData([]); setParamErrors([]); }}>Anuluj</button>
              <button className="px-4 py-2 rounded-lg bg-blue-500 text-white" onClick={handleSaveNewParams}>Zapisz parametry</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDYCJI / DODAWANIA BADAŃ */}
      {editingDiag && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{editingDiag?.diagnostic_id ? "Edycja badania" : "Nowe badanie"}</h3>
              <button onClick={() => setEditingDiag(null)}>✕</button>
            </div>
            <div className="space-y-2">
              <div className="flex flex-col">
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Nazwa"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
              </div>
              <div className="flex flex-col">
                <textarea
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Opis"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
                {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
              </div>
              <div className="flex flex-col">
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Cena"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                />
                {errors.price && <p className="text-red-500 text-xs">{errors.price}</p>}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="px-4 py-2 rounded-lg bg-gray-200" onClick={() => setEditingDiag(null)}>Anuluj</button>
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white" onClick={handleSaveDiag}>Zapisz</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL POTWIERDZENIA USUWANIA */}
      {confirmDelete.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">Potwierdź usunięcie</h3>
            <p className="mb-4">Na pewno chcesz usunąć ten parametr?</p>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setConfirmDelete({ open: false })}>Anuluj</button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded"
                onClick={() => handleDeleteParam(confirmDelete.diagId, confirmDelete.paramId)}
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
