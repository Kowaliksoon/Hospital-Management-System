import { useEffect, useState } from "react";
import HMSNavbar from "../components/HMSNavbar";

export default function MyHospitalizations() {
	const [hospitalizations, setHospitalizations] = useState([]);
	const [showNoteModal, setShowNoteModal] = useState(false);
	const [showViewNotesModal, setShowViewNotesModal] = useState(false);
	const [activeHospitalization, setActiveHospitalization] = useState(null);
	const [showDischargeModal, setShowDischargeModal] = useState(false);
	const [dischargeNote, setDischargeNote] = useState("");
	const [dischargeType, setDischargeType] = useState("");
	const [noteType, setNoteType] = useState("");
	const [noteContent, setNoteContent] = useState("");
	const [notes, setNotes] = useState([]);

	const staffId = localStorage.getItem("staff_id");

	// Pobranie hospitalizacji
	useEffect(() => {
		if (!staffId) return;
		fetch(`http://localhost:8000/staff/${staffId}/current-hospitalizations`)
			.then(res => res.json())
			.then(data => setHospitalizations(Array.isArray(data) ? data : []));
	}, [staffId]);

	// MODAL DODAWANIA NOTATKI
	const openNoteModal = hospitalizationId => {
		setActiveHospitalization(hospitalizationId);
		setNoteType("");
		setNoteContent("");
		setShowNoteModal(true);
	};

	const closeNoteModal = () => {
		setShowNoteModal(false);
		setActiveHospitalization(null);
	};

	const saveNote = async () => {
		if (!noteType || !noteContent || !activeHospitalization) return;
		try {
			await fetch(
				`http://localhost:8000/hospitalizations/${activeHospitalization}/medical_notes`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						staff_id: parseInt(staffId),
						note_type: noteType,
						content: noteContent,
					}),
				}
			);
			closeNoteModal();
		} catch (err) {
			console.error(err);
			alert("Nie udało się zapisać notatki");
		}
	};

	// MODAL WYŚWIETLANIA NOTATEK
	const openViewNotesModal = async hospitalizationId => {
		setActiveHospitalization(hospitalizationId);
		try {
			const res = await fetch(
				`http://localhost:8000/hospitalizations/${hospitalizationId}/medical_notes`
			);
			const data = await res.json();
			// Dodaj pole showContent do każdej notatki
			const notesWithShowContent = Array.isArray(data)
				? data.map(note => ({ ...note, showContent: false }))
				: [];
			setNotes(notesWithShowContent);
			setShowViewNotesModal(true);
		} catch (err) {
			console.error(err);
			alert("Nie udało się pobrać notatek");
		}
	};

	const closeViewNotesModal = () => {
		setShowViewNotesModal(false);
		setActiveHospitalization(null);
		setNotes([]);
	};

	// MODAL WYPISU PACJENTA
	const openDischargeModal = hospitalizationId => {
		setActiveHospitalization(hospitalizationId);
		setDischargeType("");
    setDischargeNote("");
		setShowDischargeModal(true);
	};

	const closeDischargeModal = () => {
		setShowDischargeModal(false);
		setActiveHospitalization(null);
	};

	const dischargePatient = async () => {
  if (!dischargeType || !activeHospitalization) return;

  try {
    await fetch(
      `http://localhost:8000/hospitalizations/${activeHospitalization}/discharge`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discharge_type: dischargeType,
          discharge_note: dischargeNote,   // tutaj wysyłamy powód jako DECISION
          staff_id: parseInt(staffId)    // potrzebne do notatki medycznej
        })
      }
    );

    // 🔁 Odświeżenie listy hospitalizacji
    const res = await fetch(
      `http://localhost:8000/staff/${staffId}/current-hospitalizations`
    );
    const data = await res.json();
    setHospitalizations(Array.isArray(data) ? data : []);

    // Zamknięcie modalu i wyczyszczenie stanu
    closeDischargeModal();
    setNoteContent("");  // wyczyszczenie textarea
  } catch (err) {
    console.error(err);
    alert("Nie udało się wypisać pacjenta");
  }
};

	return (
		<>
			<HMSNavbar>

			<div className='max-w-5xl mx-auto px-4 py-6'>
				<h2 className='text-2xl font-semibold mb-6'>
					Moje obecne hospitalizacje
				</h2>

				{hospitalizations.length === 0 ? (
					<p className='text-gray-500'>Brak aktywnych hospitalizacji</p>
				) : (
					<div className='space-y-4'>
						{hospitalizations.map(h => (
							<div
								key={h.hospitalization_id}
								className='rounded-xl border border-gray-200 bg-white shadow-sm p-4'>
								<div className='flex justify-between items-start'>
									<div>
										<h5 className='text-lg font-semibold'>
											{h.patient_name} {h.patient_surname}
										</h5>
										<p className='text-sm text-gray-500'>
											Data przyjęcia:{" "}
											{new Date(h.admitted_at).toLocaleDateString()}
										</p>
										<p className='text-sm text-gray-500'>
											Rola: <span className='font-medium'>{h.doctor_role}</span>
										</p>
									</div>

									<div className='flex gap-2'>
										<button
											onClick={() => openViewNotesModal(h.hospitalization_id)}
											className='text-sm px-3 py-1 rounded-md border border-blue-500 text-blue-600 hover:bg-blue-50 transition'>
											Otwórz
										</button>

										<button
											onClick={() => openNoteModal(h.hospitalization_id)}
											className='text-sm px-3 py-1 rounded-md border border-green-500 text-green-600 hover:bg-green-50 transition'>
											Dodaj notkę
										</button>
										<button
											onClick={() => openDischargeModal(h.hospitalization_id)}
											disabled={h.doctor_role !== "Lekarz prowadzący"} // <-- tylko prowadzący może wypisać
											className={`text-sm px-3 py-1 rounded-md border text-red-600 hover:bg-red-50 transition
                      ${
												h.doctor_role === "Lekarz prowadzący"
													? "border-red-500"
													: "border-gray-300 text-gray-400 cursor-not-allowed"
											}`}>
											Wypisz
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* MODAL DODAWANIA NOTATKI */}
			{showNoteModal && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
					<div className='bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md p-6'>
						<h3 className='text-lg font-semibold mb-4'>
							Dodaj notatkę medyczną
						</h3>

						<div className='mb-4'>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Typ notatki
							</label>
							<select
								className='w-full rounded-lg border border-gray-300 px-3 py-2'
								value={noteType}
								onChange={e => setNoteType(e.target.value)}>
								<option value=''>— wybierz typ —</option>
								<option value='Diagnoza'>Diagnoza</option>
								<option value='Decyzja'>Decyzja</option>
								<option value='Obserwacja'>Obserwacja</option>
							</select>
						</div>

						<div className='mb-6'>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Treść notatki
							</label>
							<textarea
								className='w-full rounded-lg border border-gray-300 px-3 py-2'
								rows={4}
								value={noteContent}
								onChange={e => setNoteContent(e.target.value)}
							/>
						</div>

						<div className='flex justify-end gap-2'>
							<button
								onClick={closeNoteModal}
								className='px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-100 transition'>
								Anuluj
							</button>
							<button
								onClick={saveNote}
								disabled={!noteType || !noteContent}
								className='px-4 py-2 rounded-lg bg-green-500 text-white text-sm disabled:opacity-50'>
								Zapisz
							</button>
						</div>
					</div>
				</div>
			)}

			{/* MODAL WYŚWIETLANIA NOTATEK */}
			{showViewNotesModal && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
					<div className='bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg p-6'>
						<h3 className='text-xl font-bold mb-4'>Notatki medyczne</h3>

						{notes.length === 0 ? (
							<p className='text-gray-500 text-sm'>Brak notatek</p>
						) : notes.length === 1 ? (
							// Pełna notka
							<div className='p-4 border border-gray-200 rounded-lg bg-gray-50'>
								<p className='text-sm font-medium text-gray-700 mb-2'>
									Autor: {notes[0].staff_first_name} {notes[0].staff_last_name}
								</p>
								<p className='text-xs text-gray-500 mb-2'>
									Data: {new Date(notes[0].created_at).toLocaleString()}
								</p>
								<span className='inline-block mb-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full'>
									{notes[0].note_type}
								</span>
								<p className='text-sm text-gray-800 whitespace-pre-wrap'>
									{notes[0].content}
								</p>

								<button
									className='mt-4 px-4 py-2 text-sm bg-gray-300 text-black rounded hover:bg-gray-400 transition'
									onClick={() => openViewNotesModal(activeHospitalization)}>
									Wróć do listy
								</button>
							</div>
						) : (
							// Lista notek
							<ul className='space-y-3 max-h-[400px] overflow-y-auto'>
								{notes.map(note => (
									<li
										key={note.note_id}
										className='p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer transition'
										onClick={() => setNotes([note])}>
										<p className='text-sm font-medium text-gray-700'>
											{note.staff_first_name} {note.staff_last_name}
										</p>
										<p className='text-xs text-gray-500'>
											{new Date(note.created_at).toLocaleString()}
										</p>
										<span className='inline-block mt-1 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full'>
											{note.note_type}
										</span>
									</li>
								))}
							</ul>
						)}

						<div className='flex justify-end mt-4'>
							<button
								onClick={closeViewNotesModal}
								className='px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-100 transition'>
								Zamknij
							</button>
						</div>
					</div>
				</div>
			)}

			{/* MODAL WYPISU PACJENTA */}
			{showDischargeModal && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
					<div className='bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md p-6'>
						<h3 className='text-lg font-semibold mb-4'>Wypisz pacjenta</h3>

						<div className='mb-6'>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Typ wypisu
							</label>
							<select
								className='w-full rounded-lg border border-gray-300 px-3 py-2'
								value={dischargeType}
								onChange={e => setDischargeType(e.target.value)}>
								<option value=''>— wybierz —</option>
								<option value='HOME'>Do domu</option>
								<option value='DEATH'>Zgon</option>
								<option value='AMA'>Na żądanie</option>
							</select>
						</div>

						<div className='mb-4'>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Powód wypisu (notatka medyczna)
							</label>
							<textarea
								className='w-full rounded-lg border border-gray-300 px-3 py-2'
								rows={3}
								value={dischargeNote}
								onChange={e => setDischargeNote(e.target.value)}
								placeholder='Np. Pacjent wypisany do domu, stan stabilny...'
							/>
							<p className="mt-1 text-sm italic text-red-600">
								*W przypadku zgonu pacjenta należy wpisać przyczyny zgonu
							</p>
						</div>

						<div className='flex justify-end gap-2'>
							<button
								onClick={closeDischargeModal}
								className='px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-100'>
								Anuluj
							</button>
							<button
								onClick={dischargePatient}
								disabled={!dischargeType}
								className='px-4 py-2 rounded-lg bg-red-500 text-white text-sm disabled:opacity-50'>
								Wypisz
							</button>
						</div>
					</div>
				</div>
			)}
      </HMSNavbar>
		</>
	);
}
