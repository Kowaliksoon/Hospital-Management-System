import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PatientDiagnostics from "../components/PatientDiagnostics";

export default function PatientProfile() {
  const { user_id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [hospitalizations, setHospitalizations] = useState([]);
  const [activeSection, setActiveSection] = useState("hospitalizations");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loggedUser = localStorage.getItem("user_id");
    if (!loggedUser || loggedUser !== user_id) {
      navigate("/users/login");
      return;
    }

    setLoading(true);
    setError("");

    // Fetch profilu pacjenta
    fetch(`http://localhost:8000/patientProfile/${user_id}`)
      .then(res => {
        if (!res.ok) throw new Error("Nie udało się pobrać profilu pacjenta");
        return res.json();
      })
      .then(setProfile)
      .catch(err => setError(err.message));

    // Fetch hospitalizacji
    fetch(`http://localhost:8000/patients/${user_id}/hospitalizations`)
      .then(res => {
        if (!res.ok) throw new Error("Nie udało się pobrać hospitalizacji");
        return res.json();
      })
      .then(data => {
        // upewnij się, że zawsze jest tablica
        setHospitalizations(Array.isArray(data) ? data : []);
      })
      .catch(() => setHospitalizations([]))
      .finally(() => setLoading(false));
  }, [user_id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Ładowanie profilu pacjenta...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Brak danych pacjenta
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto flex gap-8 items-start">

        {/* SIDEBAR – szerokość ~400px */}
        <div className="flex-shrink-0 min-w-[400px] max-w-[400px]">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg p-6 flex flex-col gap-6 border border-white/40">

            {/* USER INFO */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                {profile.user.name} <br />
                <span className="text-blue-600">{profile.user.surname}</span>
              </h2>
              <p className="text-sm text-gray-500 mt-2">PESEL: {profile.user.pesel}</p>
              <p className="text-sm text-gray-500">{profile.user.email}</p>
            </div>

            {/* KARTOTEKA */}
            {profile.patient && (
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-4 text-sm space-y-2 border">
                <p><b> Data urodzenia:</b> {profile.patient.date_of_birth}</p>
                <p><b> Telefon:</b> {profile.patient.phone}</p>
                <p><b> Kontakt alarmowy:</b> {profile.patient.emergency_contact_phone}</p>
                <p><b> Adres:</b> {profile.patient.address}</p>
              </div>
            )}

            <button
              onClick={() => {
                localStorage.removeItem("user_id");
                navigate("/users/login");
              }}
              className="mt-auto w-full py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:opacity-90 transition"
            >
              Wyloguj
            </button>
          </div>
        </div>

        {/* PRAWA KOLUMNA – reszta miejsca */}
        <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/40">

          {/* TABS */}
          <div className="flex gap-8 mb-8">
            <button
              onClick={() => setActiveSection("hospitalizations")}
              className={`relative font-semibold transition ${
                activeSection === "hospitalizations"
                  ? "text-black-600"
                  : "text-gray-400 hover:text-black-500"
              }`}
            >
              Hospitalizacje
              {activeSection === "hospitalizations" && (
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-blue-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveSection("diagnostics")}
              className={`relative font-semibold transition ${
                activeSection === "diagnostics"
                  ? "text-black-600"
                  : "text-gray-400 hover:text-black-500"
              }`}
            >
              Diagnostyka
              {activeSection === "diagnostics" && (
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          </div>

          {/* HOSPITALIZACJE */}
          {activeSection === "hospitalizations" && (
            <div className="space-y-6">
              {hospitalizations.length === 0 ? (
                <p className="text-gray-500 italic">Brak hospitalizacji</p>
              ) : (
                hospitalizations.map(h => (
                  <div
                    key={h.hospitalization_id}
                    className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 border hover:shadow-md transition"
                  >
                    {/* HEADER */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
<p className="font-semibold text-gray-800">
  {new Date(h.admitted_at).toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" })} –{" "}
  {h.discharge_at
    ? new Date(h.discharge_at).toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" })
    : " w trakcie"}
</p>
<p className="text-sm text-gray-500">
  Oddział: <b>{h.department}</b>
</p>
                      </div>

                      <span
                        className={`px-3 py-1 text-xs rounded-full font-semibold ${
                          h.status === "DISCHARGED"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {h.status}
                      </span>
                    </div>

                    {/* NOTES */}
                    <div className="mb-4 space-y-2">
                      <h4 className="font-semibold text-gray-700">Notatki medyczne</h4>
                      {Array.isArray(h.notes) && h.notes.length ? (
                        h.notes.map(n => (
                          <div key={n.note_id} className="bg-white rounded-xl p-3 border text-sm">
                            <div className="flex justify-between mb-1">
                              <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">
                                {n.type}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(n.created_at).toLocaleString("pl-PL", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p>{n.content}</p>
                            <p className="text-xs text-gray-500 mt-1">{n.author}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm italic text-gray-500">Brak notatek</p>
                      )}
                    </div>

                    {/* TRANSFERS */}
                    <div>
      <h4 className="font-semibold text-gray-700 mb-1">Transfery</h4>
      {Array.isArray(h.transfers) && h.transfers.length ? (
        h.transfers.map(t => {
          const transferDate = new Date(t.date).toLocaleString("pl-PL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <p key={t.transfer_id} className="text-sm text-gray-600">
              <b>{transferDate}</b>: {t.from} → {t.to} ({t.reason})
            </p>
          );
        })
                      ) : (
                        <p className="text-sm italic text-gray-500">Brak transferów</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* DIAGNOSTYKA */}
          {activeSection === "diagnostics" && (
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 border">
              <PatientDiagnostics userId={user_id} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
