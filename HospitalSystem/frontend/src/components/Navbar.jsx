import { Link } from "react-router-dom";

export default function Navbar() {
  const links = [
    { name: "Strona główna", to: "/" },
    { name: "Logowanie Pacjenta", to: "/users/login" },
    { name: "Logowanie Personelu", to: "/staff/login" },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-lg">
      {/* Logo / Tytuł */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">✚</span>
        <h1 className="font-bold text-lg md:text-xl tracking-wide">
          Szpital JP II
        </h1>
      </div>

      {/* Menu */}
      <ul className="flex gap-3">
        {links.map((link, idx) => (
          <li key={idx}>
            <Link
              to={link.to}
              className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:text-blue-900 hover:bg-blue-200/20"
            >
              {link.name}
              {/* Opcjonalnie subtelna animacja podkreślenia */}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-200 hover:w-full"></span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
