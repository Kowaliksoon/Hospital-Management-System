import { useState } from "react";
import HMSNavbar from "../components/HMSNavbar";
import PatientDiagnosticForm from "../components/PatientDiagnosticForm";
import PendingDiagnostics from "../components/PendingDiagnostics";

export default function Diagnostics() {
	const [refreshList, setRefreshList] = useState(false);

	const handleNewDiagnostic = () => {
		// zmiana stanu spowoduje ponowne pobranie danych w PendingDiagnostics
		setRefreshList(prev => !prev);
	};

	return (
		<HMSNavbar>
			<PendingDiagnostics refresh={refreshList} />
			<PatientDiagnosticForm onNewDiagnostic={handleNewDiagnostic} />
		</HMSNavbar>
	);
}
