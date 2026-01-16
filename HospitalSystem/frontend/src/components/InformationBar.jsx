import Phone from "../assets/phone.png";
import Mail from "../assets/mail.png";
import Location from "../assets/location.png";

export default function InformationBar() {
	return (
		<div className='flex flex-row w-3/5 mt-20 justify-center gap-20'>
		{/* Lokalizacja */}
			<div className='flex items-center w-64'>
				<div className='w-12 h-12 bg-gray-100 rounded-full flex justify-center items-center flex-shrink-0'>
					<img src={Location} className='w-8 h-8 object-contain' alt='Location' />
				</div>
				<p className='ml-5 whitespace-nowrap'>ul. Przykładowa 10, Kraków</p>
			</div>

			{/* Email */}
			<div className='flex items-center w-64'>
				<div className='w-12 h-12 bg-gray-100 rounded-full flex justify-center items-center flex-shrink-0'>
					<img src={Mail} className='w-8 h-8 object-contain' alt='Mail' />
				</div>
				<p className='ml-5 whitespace-nowrap'>kontakt@szpitaljp2.krakow.pl</p>
			</div>

			{/* Telefon */}
			<div className='flex items-center w-64'>
				<div className='w-12 h-12 bg-gray-100 rounded-full flex justify-center items-center flex-shrink-0'>
					<img src={Phone} className='w-8 h-8 object-contain' alt='Phone' />
				</div>
				<p className='ml-5 whitespace-nowrap'>+48 123 456 789</p>
			</div>
		</div>
	);
}
