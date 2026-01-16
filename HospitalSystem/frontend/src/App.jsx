import { useState } from "react";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import InformationBar from "./components/InformationBar";
import Footer from "./components/Footer";
import GallerySliderImage1 from "./assets/GallerySliderImage1.jpg";
import GallerySliderImage2 from "./assets/GallerySliderImage2.png";
import GallerySliderImage3 from "./assets/GallerySliderImage3.jpg";
import FooterQuote from "./components/FooterQuote";

const galleryItems = [
	{
		title: "Wyspecjalizowana opieka, której możesz zaufać",
		description:
			"Nasza placówka oferuje kompleksową opiekę medyczną dostosowaną do indywidualnych potrzeb pacjentów. Nasz doświadczony zespół lekarzy i pielęgniarek zapewnia wsparcie, troskę i nowoczesne leczenie w przyjaznej atmosferze, dbając o każdy detal zdrowia i komfortu naszych pacjentów.",
		imgSrc: GallerySliderImage1,
		objectPosition: "object-center",
	},
	{
		title: "W służbie zdrowia i życia",
		description:
			"Twoje bezpieczeństwo jest naszą misją. W każdej sekundzie, każdego dnia, nasz zespół ratownictwa medycznego jest w pełnej gotowości, by nieść pomoc tam, gdzie jest ona najbardziej potrzebna. Wyposażeni w nowoczesny sprzęt i ogromne doświadczenie, dbamy o to, aby mieszkańcy naszego regionu mogli czuć się bezpiecznie. Nasz szpital to nie tylko budynki – to przede wszystkim ludzie, którzy z pasją ratują życie.",
		imgSrc: GallerySliderImage2,
		objectPosition: "object-right",
	},
	{
		title: "Zaawansowana Technologia w Służbie Zdrowia",
		description:
			"W naszym szpitalu nowoczesność spotyka się z troską o pacjenta. Dzięki najnowocześniejszym systemom chirurgicznym i innowacyjnym rozwiązaniom medycznym, zapewniamy precyzję, bezpieczeństwo i komfort podczas każdej procedury. Nasze zaawansowane technologie to nie tylko sprzęt – to gwarancja skutecznej opieki i szybszego powrotu do zdrowia.",
		imgSrc: GallerySliderImage3,
		objectPosition: "object-center",
	},
];

function App() {
	return (
		<>
			<Navbar />

			<div className='flex flex-col items-center justify-center'>
				<Header />
				<InformationBar />
			</div>

    <section className="text-center mt-33">
      <h1 className="text-3xl font-semibold mx-auto">
        Nowoczesna Opieka Medyczna Każdego Dnia
      </h1>
      <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
        Łączymy doświadczenie specjalistów, zaawansowaną technologię i troskę o pacjenta,
        aby zapewnić najwyższy standard leczenia i bezpieczeństwa.
      </p>
    </section>


			<section className='flex items-center gap-6 h-[400px] w-full max-w-5xl mt-15 mx-auto'>
				{galleryItems.map((item, idx) => (
					<div
						key={idx}
						className='relative group flex-grow transition-all w-56 h-[400px] duration-500 hover:w-full'>
						<img
							className={`h-full w-full object-cover ${item.objectPosition}`}
							src={item.imgSrc}
							alt={item.title}
						/>
						<div className='absolute inset-0 flex flex-col justify-end p-10 text-white bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300'>
							<h1 className='text-3xl'>{item.title}</h1>
							<p className='text-sm'>{item.description}</p>
						</div>
					</div>
				))}
			</section>
      
      <FooterQuote />
      <Footer></Footer>
		</>
	);
}

export default App;
