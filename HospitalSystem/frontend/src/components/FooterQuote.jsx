function FooterQuote() {
  return (
    <section className="flex justify-center px-6 py-16">
      <div className="relative max-w-3xl bg-white rounded-2xl shadow-lg p-10 text-center border border-blue-200">
        
        {/* Dekoracja */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          {/* Możesz tu dodać ikonę, np. serce */}
        </div>

        {/* Cytat */}
        <p className="text-blue-900 italic text-lg md:text-xl leading-relaxed">
          „Medycyna to nie tylko nauka i technologia — to przede wszystkim
          spotkanie człowieka z człowiekiem, oparte na zaufaniu, empatii
          i odpowiedzialności.”
        </p>

        {/* Autor / podpis */}
        <span className="block mt-6 text-black text-sm font-medium">
          – Zespół Szpitala Specjalistycznego im. św. Jana Pawła II w Krakowie
        </span>
      </div>
    </section>
  );
}

export default FooterQuote;
