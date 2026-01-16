import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import userProfile from "../assets/userProfile.png";
import logout from "../assets/logout.png";

export default function HMSNavbar({ children }) {
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);

  // Stan na dynamiczny zegar
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const staffId = localStorage.getItem("staff_id");
    if (!staffId) return;

    fetch(`http://localhost:8000/staffProfile/${staffId}`)
      .then(res => res.json())
      .then(data => setStaff(data));
  }, []);

  // Aktualizacja zegara co sekundę
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("staff_id");
    navigate("/staff/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="flex flex-col w-20 hover:w-64 transition-all duration-300 bg-gray-900 text-white shadow-lg h-screen overflow-hidden group">
        {/* Logo i profil */}
        <div className="flex flex-col items-center justify-center h-28 border-b border-gray-800 px-2">
          <h1 className="text-xl font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full text-center overflow-hidden">
            HMS
          </h1>

          {staff && (
            <Link
              to={`/staff/profile/${staff.staff_id}`}
              className="mt-2 flex flex-col items-center justify-center w-full"
            >
              {/* Białe kółko dla zdjęcia */}
              <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md overflow-hidden">
                <img
                  src={userProfile}
                  alt="Profil"
                  className="w-full h-full rounded-full"
                />
              </div>
              <span className="mt-2 text-sm font-medium text-white  hover:underline text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full truncate cursor-pointer">
                {staff.first_name} {staff.last_name}
              </span>
            </Link>
          )}
        </div>

        {/* Menu */}
<nav className="flex-1 mt-4 overflow-y-auto">
  {[
    { name: "Lista Pacjentów", to: "/patients", icon: "🧑" , disabled: staff?.role !== "Osoba rejestrująca"},
    { name: "Przydziel do Oddziału", to: "/patients/assignDepartment", icon: "🏥", disabled: staff?.role !== "Osoba rejestrująca"},
    { name: "Diagnostyka", to: "/patients/Diagnostics", icon: "🧪", disabled: staff?.role !== "Laborant" },
    { name: "Przydziel lekarzy", to: "/patients/assignStaff", icon: "👩‍⚕️",disabled: staff?.role !== "Ordynator" },
    { name: "Hospitalizacja", to: "/patients/medicalNotes", icon: "🛏️" },
    { name: "Lista zgonów", to: "/patients/deceased", icon: "⚰️" },  // nowa opcja
    { name: "Panel admina", to: staff?.role === "Admin" ? "/adminPanel" : "#", icon: "🛠️", disabled: staff?.role !== "Admin" },
  ].map((link, idx) => (
    <Link
      key={idx}
      to={link.to}
      onClick={e => link.disabled && e.preventDefault()}
      className={`flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 ${
        link.disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <span className="text-lg w-6 flex-shrink-0">{link.icon}</span>
      <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-40 truncate">
        {link.name}
      </span>
    </Link>
  ))}
</nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition"
          >
            <img src={logout} alt="Logout" className="w-4 h-4 flex-shrink-0" />
            <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-40 truncate">
              Wyloguj
            </span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between bg-white px-6 py-4 shadow-md border-b border-gray-300">
          {/* Lewa strona: tytuł */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">System Zarządzania Szpitalem</h1>
          </div>

          {/* Prawa strona: zegar i info */}
          <div className="flex items-center gap-6 text-gray-600 font-medium">
            {/* Zegar */}
            <div className="flex flex-col items-end text-right p-2 bg-gray-100 rounded-lg shadow-inner min-w-[160px]">
              <span className="text-sm text-gray-500">
                {currentTime.toLocaleDateString("pl-PL", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
              </span>
              <span className="text-lg font-semibold text-gray-800">
                {currentTime.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </div>
          </div>
        </header>

        {/* Tutaj trafia zawartość dzieci */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
