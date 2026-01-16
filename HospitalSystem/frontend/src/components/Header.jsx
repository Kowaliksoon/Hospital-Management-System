import Logo from "../assets/Logo.png";

export default function Navbar() {
	return (
		<div className='flex flex-row w-3/5 border-b-3 border-blue-800 mt-30'>
			<div className='w-1/5 flex justify-center mb-6 mr-7'>
				<img src={Logo} className='max-w-[150px] h-auto object-contain' alt='Logo Szpitala' />
			</div>
			<div className='w-4/5'>
				<p className="font-sans text-2xl sm:text-3xl md:text-4xl lg:text-5xl ml-[20px]">Szpital Specjalistyczny im. św. Jana Pawła II w Krakowie</p>
			</div>
		</div>
	);
}
