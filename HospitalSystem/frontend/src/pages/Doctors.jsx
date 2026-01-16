import Navbar from "../components/Navbar";

export default function Doctors() {
  return (
    <div>
      <Navbar />
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-blue-700">🩺 Lista lekarzy</h2>
        <p className="mt-4 text-gray-600">Tutaj pojawią się informacje o lekarzach.</p>
      </div>
    </div>
  );
}
