function Footer() {
  return (
    <footer className="bg-blue-900 text-blue-100 mt-2">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 items-start">

        {/* Lewa kolumna – nazwa szpitala */}
        <div>
          <h2 className="text-xl font-semibold text-white leading-snug">
            Szpital Specjalistyczny<br />
            im. św. Jana Pawła II<br />
            w Krakowie
          </h2>
          <p className="mt-4 text-sm text-blue-200 leading-relaxed max-w-sm">
            Nowoczesna placówka medyczna świadcząca specjalistyczne usługi
            zdrowotne, oparta na wieloletnim doświadczeniu, innowacyjnych
            technologiach oraz trosce o pacjenta.
          </p>
        </div>

        {/* Środkowa kolumna – pusta (oddech wizualny) */}
        <div></div>

        {/* Prawa kolumna – kontakt */}
<div className="text-left pl-25">
  <h3 className="text-lg font-semibold text-white mb-4">
    Kontakt
  </h3>
  <ul className="space-y-2 text-sm text-blue-200">
    <li>📍 ul. Prądnicka 80, 31-202 Kraków</li>
    <li>📞 +48 12 614 20 00</li>
    <li>✉️ sekretariat@szpitaljp2.krakow.pl</li>
    <li>⏰ Całodobowa opieka medyczna</li>
  </ul>
</div>

      </div>

      {/* Dolny pasek */}
      <div className="border-t border-blue-800 py-6 text-center text-sm text-blue-300">
        © {new Date().getFullYear()} Szpital Specjalistyczny im. św. Jana Pawła II w Krakowie
      </div>
    </footer>
  );
}

export default Footer;
