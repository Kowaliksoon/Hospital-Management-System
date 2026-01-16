import HMSNavbar from "../components/HMSNavbar";
import { Link } from "react-router-dom";

export default function AdminPanel() {
  return (
    <HMSNavbar>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Panel administratora</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dodaj pracownika */}
          <Link
            to="/admin/staff/new"
            className="group relative p-6 bg-white rounded-xl shadow hover:shadow-lg transition border-l-4 border-blue-500"
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">
              Dodaj pracownika
            </h3>
            <p className="text-sm text-gray-500">
              Utwórz lekarza lub pielęgniarkę w systemie
            </p>
          </Link>

          {/* Utwórz konto */}
          <Link
            to="/admin/staff/account"
            className="group relative p-6 bg-white rounded-xl shadow hover:shadow-lg transition border-l-4 border-blue-500"
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">
              Utwórz konto
            </h3>
            <p className="text-sm text-gray-500">
              Przypisz login i hasło do pracownika
            </p>
          </Link>

          {/* Lista personelu */}
          <Link
            to="/admin/staff/list"
            className="group relative p-6 bg-white rounded-xl shadow hover:shadow-lg transition border-l-4 border-blue-500"
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">
              Lista personelu
            </h3>
            <p className="text-sm text-gray-500">
              Zarządzaj istniejącymi kontami
            </p>
          </Link>

          {/* Lista oddziałów */}
          <Link
            to="/admin/department/list"
            className="group relative p-6 bg-white rounded-xl shadow hover:shadow-lg transition border-l-4 border-blue-500"
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">
              Lista oddziałów
            </h3>
            <p className="text-sm text-gray-500">
              Zarządzaj istniejącymi oddziałami
            </p>
          </Link>

          {/* Diagnostyka */}
          <Link
            to="/admin/diagnostics"
            className="group relative p-6 bg-white rounded-xl shadow hover:shadow-lg transition border-l-4 border-blue-500"
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">
              Diagnostyka
            </h3>
            <p className="text-sm text-gray-500">
              Zarządzaj badaniami i ich parametrami
            </p>
          </Link>

          {/* Lista specjalizacji */}
          <Link
            to="/admin/specialties"
            className="group relative p-6 bg-white rounded-xl shadow hover:shadow-lg transition border-l-4 border-blue-500"
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">
              Lista specjalizacji
            </h3>
            <p className="text-sm text-gray-500">
              Zarządzaj specjalizacjami lekarzy
            </p>
          </Link>
        </div>
      </div>
    </HMSNavbar>
  );
}
