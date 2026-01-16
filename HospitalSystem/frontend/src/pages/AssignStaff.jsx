import { useEffect, useState } from "react";
import HMSNavbar from "../components/HMSNavbar";

export default function AssignStaff() {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [hospitalizations, setHospitalizations] = useState([]);
  const [staffMap, setStaffMap] = useState({});

  // MODALE
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

  const [activeHospitalization, setActiveHospitalization] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // Lista personelu
  const [availableStaff, setAvailableStaff] = useState([]);

  // Pobranie listy personelu
  useEffect(() => {
    fetch("http://localhost:8000/hospital_staff")
      .then(res => res.json())
      .then(data => setAvailableStaff(Array.isArray(data) ? data : []));
  }, []);

  // Pobranie listy oddziałów
  useEffect(() => {
    fetch("http://localhost:8000/hospital_departments")
      .then(res => res.json())
      .then(setDepartments);
  }, []);

  // Pobranie hospitalizacji i przypisanego personelu
  useEffect(() => {
    if (!selectedDepartment) return;

    const fetchHospitalizations = async () => {
      const resHosp = await fetch(
        `http://localhost:8000/departments/${selectedDepartment}/hospitalizations`
      );
      const dataHosp = await resHosp.json();
      setHospitalizations(dataHosp);

      const staffMapTemp = {};
      await Promise.all(
        dataHosp.map(async (h) => {
          const resStaff = await fetch(
            `http://localhost:8000/hospitalizations/${h.hospitalization_id}/staff`
          );
          const dataStaff = await resStaff.json();
          staffMapTemp[h.hospitalization_id] = dataStaff;
        })
      );
      setStaffMap(staffMapTemp);
    };

    fetchHospitalizations();
  }, [selectedDepartment]);

  // Zamknięcie modali
  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedStaff("");
    setSelectedRole("");
    setActiveHospitalization(null);
  };

  const closeManageModal = () => {
    setShowManageModal(false);
    setActiveHospitalization(null);
  };

  // Zapisanie personelu do hospitalizacji
  const assignStaff = async () => {
    if (!selectedStaff || !selectedRole || !activeHospitalization) return;

    await fetch("http://localhost:8000/assign_staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hospitalization_id: activeHospitalization,
        staff_id: parseInt(selectedStaff),
        role: selectedRole
      })
    });

    // Odśwież listę przypisanego personelu
    const res = await fetch(
      `http://localhost:8000/hospitalizations/${activeHospitalization}/staff`
    );
    const data = await res.json();
    setStaffMap(prev => ({
      ...prev,
      [activeHospitalization]: data
    }));

    closeAssignModal();
  };

  // Usunięcie personelu z hospitalizacji
  const removeStaff = async (staff_id) => {
    if (!activeHospitalization) return;

    await fetch(`http://localhost:8000/hospitalizations/${activeHospitalization}/remove_staff`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staff_id })
    });

    // Odśwież listę przypisanego personelu
    const res = await fetch(
      `http://localhost:8000/hospitalizations/${activeHospitalization}/staff`
    );
    const data = await res.json();
    setStaffMap(prev => ({
      ...prev,
      [activeHospitalization]: data
    }));
  };

  return (
    <>
      <HMSNavbar>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h2 className="text-2xl font-semibold mb-6">Personel medyczny na oddziałach</h2>

          {/* SELECT ODDZIAŁ */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Oddział</label>
            <select
              className="w-full rounded-lg border border-blue-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
            >
              <option value="">— wybierz oddział —</option>
              {departments.map(dep => (
                <option key={dep.department_id} value={dep.department_id}>
                  {dep.name}
                </option>
              ))}
            </select>
          </div>

          {/* LISTA PACJENTÓW */}
          <div className="space-y-4">
            {selectedDepartment && hospitalizations.length === 0 ? (
              <div className="text-gray-500 italic p-4 border border-gray-200 rounded-xl bg-gray-50">
                Brak pacjentów na tym oddziale
              </div>
            ) : (
              hospitalizations.map(h => (
                <div
                  key={h.hospitalization_id}
                  className="rounded-xl border border-gray-200 bg-white shadow-sm p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-semibold">{h.patient.name} {h.patient.surname}</h5>
                      <p className="text-sm text-gray-500">PESEL: {h.patient.pesel}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setActiveHospitalization(h.hospitalization_id);
                          setShowAssignModal(true);
                        }}
                        className="text-sm px-3 py-1 rounded-md border border-blue-500 text-blue-600 hover:bg-blue-100 transition"
                      >
                        ➕ Przydziel personel
                      </button>

                      <button
                        onClick={() => {
                          setActiveHospitalization(h.hospitalization_id);
                          setShowManageModal(true);
                        }}
                        className="text-sm px-3 py-1 rounded-md border border-blue-500 text-blue-600 hover:bg-blue-100 transition"
                      >
                        ⚙️ Zarządzaj personelem
                      </button>
                    </div>
                  </div>

                  {/* LISTA PRZYPISANEGO PERSONELU */}
                  {staffMap[h.hospitalization_id]?.length > 0 && (
                    <div className="mt-4">
                      <ul className="flex flex-wrap gap-2">
                        {staffMap[h.hospitalization_id].map(s => (
                          <li
                            key={s.staff_id}
                            className="px-3 py-1 rounded-full bg-gray-100 text-sm"
                          >
                            {s.first_name} {s.last_name} <span className="ml-1 text-gray-500">({s.role})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* MODAL PRZYDZIELANIE PERSONELU */}
        {showAssignModal && activeHospitalization && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">Przydziel personel</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Personel</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  value={selectedStaff}
                  onChange={e => setSelectedStaff(e.target.value)}
                >
                  <option value="">— wybierz osobę —</option>
                {availableStaff
                  .filter(s => 
                    s.role.toLowerCase() !== "admin" && // pomijamy adminów
                    ["lekarz", "pielęgniarz/pielęgniarka", "ordynator"].includes(s.role.toLowerCase())
                  )
                  .map(s => {
                    const isAssigned = staffMap[activeHospitalization]?.some(
                      assigned => assigned.staff_id === s.staff_id
                    );
                    return (
                      <option
                        key={s.staff_id}
                        value={s.staff_id}
                        disabled={isAssigned}
                      >
                        {s.first_name} {s.last_name} — {s.role}{s.specialty_name ? ` (${s.specialty_name})` : ""} {isAssigned ? "(już przypisany)" : ""}
                      </option>
                    );
                  })}
                </select>

                {selectedStaff && (
                  <div className="mt-2 text-sm text-gray-600">
                    {(() => {
                      const staff = availableStaff.find(
                        s => s.staff_id === parseInt(selectedStaff)
                      );
                      if (!staff) return null;
                      return (
                        <>
                          <p><strong>Imię:</strong> {staff.first_name}</p>
                          <p><strong>Nazwisko:</strong> {staff.last_name}</p>
                          <p><strong>Rola w systemie:</strong> {staff.role}</p>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
              <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rola</label>
                  <select
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      value={selectedRole}
                      onChange={e => setSelectedRole(e.target.value)}
                  >
                      <option value="">— wybierz rolę —</option>
                      <option
                      value="Lekarz prowadzący"
                      disabled={staffMap[activeHospitalization]?.some(
                          s => s.role === "Lekarz prowadzący"
                      )}
                      >
                      Lekarz prowadzący
                      </option>
                      <option value="Konsultant">Konsultant</option>
                      <option value="Pielęgniarka/Pielęgniarz">Pielęgniarka/Pielęgniarz</option>
                  </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={closeAssignModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
                >
                  Anuluj
                </button>
                <button
                  onClick={assignStaff}
                  disabled={!selectedStaff || !selectedRole}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm disabled:opacity-50"
                >
                  Zapisz
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ZARZĄDZAJ PERSONELEM */}
        {showManageModal && activeHospitalization && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">Zarządzaj personelem</h3>

              {staffMap[activeHospitalization]?.length === 0 ? (
                <p className="text-sm text-gray-400">Brak przypisanego personelu</p>
              ) : (
                <ul className="space-y-2">
                  {staffMap[activeHospitalization].map(s => (
                    <li key={s.staff_id} className="flex justify-between items-center border p-2 rounded">
                      <div>
                        <p className="text-sm font-medium">{s.first_name} {s.last_name}</p>
                        <p className="text-xs text-gray-500">{s.role}</p>
                      </div>
                      <button
                        onClick={() => removeStaff(s.staff_id)}
                        className="px-2 py-1 text-xs text-red-600 border border-red-500 rounded hover:bg-red-50"
                      >
                        Usuń
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex justify-end mt-4">
                <button
                  onClick={closeManageModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        )}
      </HMSNavbar>
    </>
  );
}
