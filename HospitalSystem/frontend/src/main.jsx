import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RequireAdmin from "./components/RequireAdmin";
import "./index.css";
import App from "./App.jsx";
import Patients from "./pages/Patients.jsx";
import Doctors from "./pages/Doctors.jsx";
import PatientLogin from "./pages/PatientLogin.jsx";
import PatientProfile from "./pages/PatientProfile.jsx";
import StaffLogin from "./pages/StaffLogin.jsx";
import StaffProfile from "./pages/StaffProfile";
import AssignDepartment from "./pages/AssignDepartment.jsx";
import Diagnostics from "./pages/Diagnostics.jsx";
import AssignStaff from "./pages/AssignStaff.jsx";
import AddMedicalNotes from "./pages/AddMedicalNotes.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import AdminCreateStaff from "./pages/AdminCreateStaff.jsx";
import AdminCreateAccount from "./pages/AdminCreateAccount.jsx";
import AdminManageAccounts from "./pages/AdminManageAccounts.jsx";
import AdminManageDepartments from "./pages/AdminManageDepartments.jsx";
import AdminManageDiagnostics from "./pages/AdminManageDiagnostics.jsx";
import AdminManageSpecialties from "./pages/AdminManageSpecialties.jsx";
import Deceased from "./pages/Deceased.jsx";
import RequireStaff from "./components/RequireStaff.jsx";
import RequireOrdinator from "./components/RequireOrdinator.jsx";
import RequireRegistrant from "./components/RequireRegistrant.jsx";
import RequireLabTech from "./components/requireLaboratoryTechnician.jsx";
import { SnackbarProvider } from "notistack";

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<SnackbarProvider
			maxSnack={3}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
			<BrowserRouter>
				<Routes>
					<Route path='/' element={<App />} />
					<Route path='/doctors' element={<Doctors />} />
					<Route path='/users/login' element={<PatientLogin />} />
					<Route path='/profile/:user_id' element={<PatientProfile />} />
					<Route path='/staff/login' element={<StaffLogin />} />
					<Route
						path='/staff/profile/:staff_id'
						element={
							<RequireStaff>
								<StaffProfile />
							</RequireStaff>
						}
					/>
					<Route
						path='/patients/assignDepartment'
						element={
							<RequireStaff>
								<AssignDepartment />
							</RequireStaff>
						}
					/>
					<Route
						path='/patients/Diagnostics'
						element={
							<RequireLabTech>
								<RequireStaff>
									<Diagnostics />
								</RequireStaff>
							</RequireLabTech>
						}
					/>
					<Route
						path='/patients/assignStaff'
						element={
							<RequireOrdinator>
								<RequireStaff>
									<AssignStaff />
								</RequireStaff>
							</RequireOrdinator>
						}
					/>
					<Route
						path='/patients/medicalNotes'
						element={
							<RequireStaff>
								<AddMedicalNotes />
							</RequireStaff>
						}
					/>
					<Route
						path='/patients'
						element={
							<RequireRegistrant>
								<RequireStaff>
									<Patients />
								</RequireStaff>
							</RequireRegistrant>
						}
					/>
					<Route
						path='/patients/deceased'
						element={
							<RequireStaff>
								<Deceased />
							</RequireStaff>
						}
					/>
					<Route
						path='/adminPanel'
						element={
							<RequireAdmin>
								<AdminPanel />
							</RequireAdmin>
						}
					/>
					<Route
						path='/admin/staff/new'
						element={
							<RequireAdmin>
								<AdminCreateStaff />
							</RequireAdmin>
						}
					/>
					<Route
						path='/admin/staff/account'
						element={
							<RequireAdmin>
								<AdminCreateAccount />
							</RequireAdmin>
						}
					/>
					<Route
						path='/admin/staff/list'
						element={
							<RequireAdmin>
								<AdminManageAccounts />
							</RequireAdmin>
						}
					/>
					<Route
						path='/admin/department/list'
						element={
							<RequireAdmin>
								<AdminManageDepartments />
							</RequireAdmin>
						}
					/>
					<Route
						path='/admin/diagnostics'
						element={
							<RequireAdmin>
								<AdminManageDiagnostics />
							</RequireAdmin>
						}
					/>
					<Route
						path='/admin/specialties'
						element={
							<RequireAdmin>
								<AdminManageSpecialties />
							</RequireAdmin>
						}
					/>
				</Routes>
			</BrowserRouter>
		</SnackbarProvider>
	</StrictMode>
);
