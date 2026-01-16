from fastapi import FastAPI, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User, Patient, HospitalStaff, StaffAccount,Diagnostic, DiagnosticParameter, PatientDiagnostic, PatientDiagnosticResult, Hospitalization, HospitalDepartment, DepartmentTransfer, HospitalizationStaff, MedicalNotes, Specialties
from schemas import UserCreate, UserLogin, StaffLogin, PatientDiagnosticCreate, PatientDiagnosticResultCreate, FillDiagnosticRequest, PatientCreate, AssignDepartmentByPeselRequest, AssignStaffRequest, RemoveStaffRequest, MedicalNoteCreate, MedicalNoteOut, DischargeHospitalizationRequest, CreateStaffRequest, StaffAccountCreate, AccountUpdate, DepartmentCreate, DepartmentUpdate, DiagnosticCreate, DiagnosticOut, DiagnosticParameterOut, ParamCreate, SpecialtyCreate, SpecialtyOut, SpecialtyUpdate, PatientUpdate
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # ← tymczasowo pozwól na wszystko
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():
    return {"message": "Działa FastAPI ✅"}


@app.get("/patients")
def get_patients(db: Session = Depends(get_db)):
    patients = db.query(Patient).order_by(Patient.patient_id.asc()).all()
    return patients



@app.put("/patients/{patient_id}")
def update_patient(patient_id: int, data: PatientUpdate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(
        Patient.patient_id == patient_id
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Pacjent nie istnieje")

    patient.name = data.name
    patient.surname = data.surname
    patient.email = data.email
    patient.phone = data.phone
    patient.emergency_contact_phone = data.emergency_contact_phone
    patient.address = data.address

    db.commit()
    return {"message": "Dane pacjenta zaktualizowane"}

@app.get("/patients/check-pesel/{pesel}")
def check_pesel(pesel: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.pesel == pesel).first()
    return {
        "exists": patient is not None
    }


@app.get("/users/{pesel}/status")
def get_user_status(pesel: str, db: Session = Depends(get_db)):
    # 1️⃣ Szukamy usera po PESEL
    user = db.query(User).filter(User.pesel == pesel).first()
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie istnieje")

    # 2️⃣ Sprawdzamy, czy istnieje rekord w Patient
    patient = db.query(Patient).filter(Patient.pesel == user.pesel).first()
    if not patient:
        # Nie ma w Patient → można normalnie tworzyć diagnostykę
        return {
            "patient_exists": False,
            "user_id": user.user_id,
            "name": user.name,
            "surname": user.surname,
            "pesel": user.pesel,
            "is_deceased": False
        }

    # 3️⃣ Sprawdzamy, czy pacjent zmarł
    hospitalizations = db.query(Hospitalization).filter(
        Hospitalization.patient_id == patient.patient_id
    ).all()
    is_deceased = any(h.discharge_type == "DEATH" for h in hospitalizations)

    # 4️⃣ Zwracamy dane usera i flagę deceased
    return {
        "patient_exists": True,
        "user_id": user.user_id,
        "name": user.name,
        "surname": user.surname,
        "pesel": user.pesel,
        "is_deceased": is_deceased
    }


@app.get("/patients/{pesel}/status")
def get_patient_status(pesel: str, db: Session = Depends(get_db)):
    # 1️⃣ Znajdź pacjenta po PESELu
    patient = db.query(Patient).filter(Patient.pesel == pesel).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Pacjent nie znaleziony")

    # 2️⃣ Pobierz wszystkie hospitalizacje pacjenta
    hospitalizations = db.query(Hospitalization).filter(
        Hospitalization.patient_id == patient.patient_id
    ).all()

    # 3️⃣ Flaga deceased
    is_deceased = any(h.discharge_type == "DEATH" for h in hospitalizations)

    # 4️⃣ Znajdź aktywną hospitalizację, jeśli istnieje
    active_hosp = None
    for h in hospitalizations:
        if h.status == "ACTIVE":
            # Pobierz nazwę oddziału z tabeli Departments
            department = db.query(HospitalDepartment).filter(HospitalDepartment.department_id == h.admitted_department_id).first()
            dept_name = department.name if department else None

            active_hosp = {
                "hospitalization_id": h.hospitalization_id,
                "admitted_department_id": h.admitted_department_id,
                "department_name": dept_name,  # nazwa z tabeli departments
                "admitted_at": h.admitted_at,
                "status": h.status
            }
            break

    # 5️⃣ Zwróć pacjenta + flagi + aktywną hospitalizację
    return {
        "patient_id": patient.patient_id,
        "name": patient.name,
        "surname": patient.surname,
        "pesel": patient.pesel,
        "is_deceased": is_deceased,
        "active_hospitalization": active_hosp
    }

from sqlalchemy.orm import joinedload

@app.get("/patients/deceased")
def get_deceased_patients(pesel: str = None, db: Session = Depends(get_db)):
    """
    Zwraca listę pacjentów, którzy zmarli (discharge_type = 'DEATH').
    Opcjonalnie filtruje po PESEL.
    Każdy pacjent zawiera:
      - PESEL
      - imię, nazwisko
      - data urodzenia
      - oddział podczas ostatniej hospitalizacji
      - data zgonu
      - notatka medyczna / przyczyna zgonu (discharge_note)
    """
    query = db.query(Hospitalization).filter(Hospitalization.discharge_type == "DEATH")

    if pesel:
        query = query.join(Patient).filter(Patient.pesel == pesel)

    hospitalizations = query.options(joinedload(Hospitalization.patient)).all()

    deceased_list = []
    for hosp in hospitalizations:
        patient = hosp.patient  # dzięki joinedload

        # Pobranie nazwy oddziału
        department_name = None
        if hosp.admitted_department_id:
            dep = db.query(HospitalDepartment).filter(
                HospitalDepartment.department_id == hosp.admitted_department_id
            ).first()
            department_name = dep.name if dep else None

        # Pobranie ostatniej notatki typu 'Decyzja' lub discharge_note
        note = (
            db.query(MedicalNotes)
            .filter(MedicalNotes.hospitalization_id == hosp.hospitalization_id)
            .filter(MedicalNotes.note_type.in_(["Decyzja", "Discharge"]))
            .order_by(MedicalNotes.created_at.desc())
            .first()
        )

        deceased_list.append({
            "patient_id": patient.patient_id,
            "pesel": patient.pesel,
            "name": patient.name,
            "surname": patient.surname,
            "date_of_birth": patient.date_of_birth,
            "department_name": department_name,
            "discharge_at": hosp.discharge_at,
            "discharge_note": note.content if note else ""
        })

    return deceased_list



@app.post("/userRegister")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email już istnieje")

    patient = db.query(Patient).filter(Patient.pesel == user.pesel).first()


    new_user = User(
        name=user.name,
        surname=user.surname,
        email=user.email,
        pesel=user.pesel,
        password_hash=user.password,
        patient_id=patient.patient_id if patient else None
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Użytkownik zarejestrowany", "user_id": new_user.user_id}


@app.post("/userLogin")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.pesel == user.pesel).first()
    if not db_user or db_user.password_hash != user.password:
        raise HTTPException(status_code=400, detail="Nieprawidłowy PESEL lub hasło")

    # 2️⃣ Jeśli brak patient_id, spróbuj przypisać po PESEL
    if not db_user.patient_id:
        patient = db.query(Patient).filter(Patient.pesel == db_user.pesel).first()
        if patient:
            db_user.patient_id = patient.patient_id
            db.commit()
            db.refresh(db_user)

    # 3️⃣ Zwróć odpowiedź
    return {
        "message": "Zalogowano pomyślnie",
        "user_id": db_user.user_id,
        "patient_id": db_user.patient_id  # <- dodane do frontendu, jeśli istnieje
    }


@app.get("/users/check-pesel/{pesel}")
def check_user_pesel(pesel: str, db: Session = Depends(get_db)):
    if not pesel or len(pesel) != 11 or not pesel.isdigit():
        raise HTTPException(status_code=400, detail="PESEL musi składać się z 11 cyfr")

    # Sprawdź, czy istnieje użytkownik z tym PESEL
    user = db.query(User).filter(User.pesel == pesel).first()
    exists = bool(user)

    return {"exists": exists}

@app.get("/patientProfile/{user_id}")
def get_patient_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie istnieje")

    patient = None
    if user.patient_id:
        patient = db.query(Patient).filter(Patient.patient_id == user.patient_id).first()

    return {
        "user": {
            "name": user.name,
            "surname": user.surname,
            "email": user.email,
            "pesel": user.pesel,
        },
        "patient": {
            "date_of_birth": patient.date_of_birth if patient else None,
            "phone": patient.phone if patient else None,
            "emergency_contact_phone": patient.emergency_contact_phone if patient else None,
            "address": patient.address if patient else None,
        } if patient else None
    }


@app.post("/staffLogin")
def staff_login(staff: StaffLogin, db: Session = Depends(get_db)):
    db_staff = db.query(StaffAccount).filter(StaffAccount.email == staff.email).first()
    if not db_staff or db_staff.password != staff.password:
        raise HTTPException(status_code=400, detail="Nieprawidłowy email lub hasło")

    return {
        "message": "Zalogowano pomyślnie",
        "staff_id": db_staff.staff_id,
        "email": db_staff.email
    }


@app.get("/staffProfile/{staff_id}")
def get_staff_profile(staff_id: int, db: Session = Depends(get_db)):
    staff = db.query(HospitalStaff).filter(HospitalStaff.staff_id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Personel nie istnieje")
    
    return {
        "staff_id": staff.staff_id,
        "first_name": staff.first_name,
        "last_name": staff.last_name,
        "role": staff.role,
        "phone": staff.phone
    }


@app.get("/patients/pesel/{pesel}")
def get_patient_by_pesel(pesel: str, db: Session = Depends(get_db)):
    if len(pesel) != 11 or not pesel.isdigit():
        raise HTTPException(
            status_code=400,
            detail="Nieprawidłowy PESEL"
        )

    patient = db.query(Patient).filter(Patient.pesel == pesel).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Pacjent nie znaleziony"
        )

    return {
        "patient_id": patient.patient_id,
        "name": patient.name,
        "surname": patient.surname,
        "pesel": patient.pesel,
        "date_of_birth": patient.date_of_birth,
        "phone": patient.phone,
        "emergency_contact_phone": patient.emergency_contact_phone,
        "address": patient.address,
    }


@app.get("/users/pesel/{pesel}")
def get_user_by_pesel(pesel: str, db: Session = Depends(get_db)):
    if len(pesel) != 11 or not pesel.isdigit():
        raise HTTPException(status_code=400, detail="Nieprawidłowy PESEL")

    user = db.query(User).filter(User.pesel == pesel).first()
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")

    patient = None
    if user.patient_id:
        patient = db.query(Patient).filter(Patient.patient_id == user.patient_id).first()

    return {
        "user_id": user.user_id,
        "pesel": user.pesel,
        "name": user.name,
        "surname": user.surname,
        "email": user.email,
        "patient": {
            "patient_id": patient.patient_id,
            "date_of_birth": patient.date_of_birth,
            "phone": patient.phone,
            "emergency_contact_phone": patient.emergency_contact_phone,
            "address": patient.address
        } if patient else None
    }




@app.get("/diagnostics")
def get_diagnostics(db: Session = Depends(get_db)):
    diagnostics = db.query(Diagnostic).all()
    return [{"diagnostic_id": d.diagnostic_id, "name": d.name, "description": d.description, "price": d.price} for d in diagnostics]



@app.get("/diagnostic_parameters/{diagnostic_id}")
def get_diagnostic_parameters(diagnostic_id: int, db: Session = Depends(get_db)):
    parameters = db.query(DiagnosticParameter).filter(DiagnosticParameter.diagnostic_id == diagnostic_id).all()
    return [
        {
            "parameter_id": p.parameter_id,
            "name": p.name,
            "unit": p.unit,
            "min_value": p.min_value,
            "max_value": p.max_value
        } for p in parameters
    ]







@app.post("/patient_diagnostics")
def create_patient_diagnostic(diagnostic: PatientDiagnosticCreate, db: Session = Depends(get_db)):
    ordered_at = diagnostic.ordered_at or datetime.utcnow().isoformat()
    patient_diag = PatientDiagnostic(
        user_id=diagnostic.user_id,
        diagnostic_id=diagnostic.diagnostic_id,
        ordered_at=ordered_at,
        status=diagnostic.status
    )
    db.add(patient_diag)
    db.commit()
    db.refresh(patient_diag)
    return {"id": patient_diag.id, "status": patient_diag.status}



@app.post("/patient_diagnostic_results")
def create_patient_diagnostic_result(result: PatientDiagnosticResultCreate, db: Session = Depends(get_db)):
    # Pobranie parametrów referencyjnych
    param = db.query(DiagnosticParameter).filter(DiagnosticParameter.parameter_id == result.parameter_id).first()
    if not param:
        raise HTTPException(status_code=404, detail="Parametr nie istnieje")

    new_result = PatientDiagnosticResult(
        patient_diagnostic_id=result.patient_diagnostic_id,
        parameter_id=result.parameter_id,
        value=result.value,
        min_value=param.min_value,
        max_value=param.max_value,
        status=result.status
    )
    db.add(new_result)
    db.commit()
    db.refresh(new_result)
    return {"result_id": new_result.result_id, "status": new_result.status}

@app.delete("/patient_diagnostics/{order_id}")
def delete_patient_diagnostic(order_id: int, db: Session = Depends(get_db)):
    order = db.query(PatientDiagnostic).filter(PatientDiagnostic.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Zlecenie nie istnieje")

    db.delete(order)
    db.commit()
    return {"message": "Zlecenie zostało usunięte"}


@app.get("/patient_results/{user_id}")
def get_patient_results(user_id: int, db: Session = Depends(get_db)):
    diagnostics = db.query(PatientDiagnostic).filter(PatientDiagnostic.user_id == user_id).all()
    result_list = []

    for diag in diagnostics:
        results = db.query(PatientDiagnosticResult).filter(PatientDiagnosticResult.patient_diagnostic_id == diag.id).all()
        result_list.append({
            "diagnostic_id": diag.diagnostic_id,
            "diagnostic_name": diag.diagnostic.name,
            "ordered_at": diag.ordered_at,
            "status": diag.status,
            "results": [
                {
                    "parameter_id": r.parameter_id,
                    "parameter_name": r.parameter.name,
                    "value": r.value,
                    "min_value": r.min_value,
                    "max_value": r.max_value,
                    "status": r.status
                } for r in results
            ]
        })
    return result_list



@app.get("/pending_diagnostics")
def get_pending_diagnostics(db: Session = Depends(get_db)):
    # Pobieramy wszystkie zlecenia ze statusem "Oczekuje"
    orders = db.query(PatientDiagnostic).filter(PatientDiagnostic.status == "Oczekuje").all()

    result = []
    for order in orders:
        # Pobranie danych pacjenta
        patient = db.query(User).filter(User.user_id == order.user_id).first()
        # Pobranie nazwy badania
        diagnostic = db.query(Diagnostic).filter(Diagnostic.diagnostic_id == order.diagnostic_id).first()

        result.append({
            "id": order.id,
            "diagnostic_id": order.diagnostic_id,
            "user_pesel": patient.pesel if patient else None,
            "patient_name": patient.name if patient else None,
            "patient_surname": patient.surname if patient else None,
            "diagnostic_name": diagnostic.name if diagnostic else None,
            "ordered_at": order.ordered_at,
            "status": order.status
        })

    return result



@app.get("/patients_with_department")
def get_patients_with_department(db: Session = Depends(get_db)):
    patients = db.query(Patient).order_by(Patient.patient_id).all()
    result = []

    for p in patients:
        # Szukamy aktywnej hospitalizacji pacjenta
        hospitalization = (
            db.query(Hospitalization)
            .filter(Hospitalization.patient_id == p.patient_id)
            .filter(Hospitalization.status == "ACTIVE")
            .order_by(Hospitalization.admitted_at.desc())
            .first()
        )
        if hospitalization and hospitalization.admitted_department_id:
            department = db.query(HospitalDepartment).get(hospitalization.admitted_department_id)
            department_name = department.name if department else "Nie przypisano"
        else:
            department_name = "Nie przypisano"

        result.append({
            "patient_id": p.patient_id,
            "name": p.name,
            "surname": p.surname,
            "pesel": p.pesel,
            "email": p.email,
            "phone": p.phone,
            "emergency_contact_phone": p.emergency_contact_phone,
            "address": p.address,
            "current_department": department_name
        })

    return result


@app.post("/fill_diagnostic_results")
def fill_diagnostic_results(request: FillDiagnosticRequest, db: Session = Depends(get_db)):
    # Pobranie zlecenia
    order = db.query(PatientDiagnostic).filter(PatientDiagnostic.id == request.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Zlecenie diagnostyczne nie istnieje")

    # Tworzenie wpisów dla każdego parametru
    for item in request.results:
        # Pobranie parametru (dla walidacji minimalnej/max)
        param = db.query(DiagnosticParameter).filter(DiagnosticParameter.parameter_id == item.parameter_id).first()
        if not param:
            raise HTTPException(status_code=404, detail=f"Parametr {item.parameter_id} nie istnieje")

        result_entry = PatientDiagnosticResult(
            patient_diagnostic_id=order.id,
            parameter_id=item.parameter_id,
            value=item.value,
            min_value=param.min_value,
            max_value=param.max_value,
            status="Wpisane"
        )
        db.add(result_entry)

    order.status = "Wpisane"

    db.commit()
    return {"message": "Wyniki zapisane pomyślnie"}


@app.post("/patientRegister")
def register_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    existing_patient = db.query(User).filter(Patient.pesel == patient.pesel).first()
    if existing_patient:
            raise HTTPException(status_code=400, detail="Pacjent o takim PESEL już istnieje")



    new_patient = Patient(
        name=patient.name,
        surname=patient.surname,
        pesel=patient.pesel,
        date_of_birth=patient.date_of_birth,
        phone=patient.phone,
        emergency_contact_phone=patient.emergency_contact_phone,
        email=patient.email,
        address=patient.address
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return {"message": "Pacjent zarejestrowany", "name": new_patient.name, "surname": new_patient.surname}



@app.post("/assign_department_by_pesel")
def assign_department(request: AssignDepartmentByPeselRequest, db: Session = Depends(get_db)):
    # 1. Szukamy pacjenta po PESEL
    patient = db.query(Patient).filter(Patient.pesel == request.pesel).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Pacjent nie istnieje")

    # 2. Sprawdzenie oddziału docelowego
    department = db.query(HospitalDepartment).filter(HospitalDepartment.department_id == request.admitted_department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Oddział nie istnieje")

    admitted_at = request.admitted_at or datetime.utcnow()

    # 3. Sprawdzenie czy pacjent już ma hospitalizację ACTIVE
    active_hosp = db.query(Hospitalization).filter(
        Hospitalization.patient_id == patient.patient_id,
        Hospitalization.status == "ACTIVE"
    ).first()

    if active_hosp:
        # To jest transfer
        if not request.reason:
            raise HTTPException(status_code=400, detail="Podaj powód transferu")

        # Tworzymy wpis transferu
        transfer = DepartmentTransfer(
            hospitalization_id=active_hosp.hospitalization_id,
            from_department_id=active_hosp.admitted_department_id,
            to_department_id=request.admitted_department_id,
            transferred_at=admitted_at,
            reason=request.reason,
            staff_id=request.staff_id
        )
        db.add(transfer)

        # Aktualizujemy hospitalizację
        active_hosp.admitted_department_id = request.admitted_department_id
        active_hosp.admitted_at = admitted_at
        db.commit()
        db.refresh(active_hosp)

        return {"message": f"Pacjent został przeniesiony do oddziału {department.name}", "hospitalization_id": active_hosp.hospitalization_id}

    else:
        # Pierwszy przydział pacjenta
        new_hosp = Hospitalization(
            patient_id=patient.patient_id,
            admitted_department_id=request.admitted_department_id,
            admitted_at=admitted_at,
            status=request.status
        )
        db.add(new_hosp)
        db.commit()
        db.refresh(new_hosp)

        return {"message": f"Pacjent przydzielony do oddziału {department.name}", "hospitalization_id": new_hosp.hospitalization_id}


@app.get("/hospital_departments")
def get_hospital_departments(db: Session = Depends(get_db)):
    departments = db.query(HospitalDepartment).all()
    return [
        {
            "department_id": d.department_id,
            "name": d.name,
            "description": d.description,
            "floor": d.floor,
            "phone": d.phone
        }
        for d in departments
    ]


@app.get("/patientsToDepartments/pesel/{pesel}")
def get_patient_by_pesel(pesel: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.pesel == pesel).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Pacjent nie istnieje")
    
    # Szukamy aktywnej hospitalizacji pacjenta
    active_hosp = db.query(Hospitalization).filter(
        Hospitalization.patient_id == patient.patient_id,
        Hospitalization.status == "ACTIVE"
    ).first()

    patient_data = {
        "patient_id": patient.patient_id,
        "name": patient.name,
        "surname": patient.surname,
        "pesel": patient.pesel,
        "active_hospitalization": None
    }

    if active_hosp:
        # Zakładamy, że relacja do oddziału istnieje lub join
        patient_data["active_hospitalization"] = {
            "hospitalization_id": active_hosp.hospitalization_id,
            "admitted_department_id": active_hosp.admitted_department_id,
            "department_name": active_hosp.department.name,  # jeśli masz relację Hospitalization -> HospitalDepartment
            "admitted_at": active_hosp.admitted_at,
            "status": active_hosp.status
        }

    return patient_data




@app.get("/departments/{department_id}/hospitalizations")
def get_active_hospitalizations_by_department(department_id: int, db: Session = Depends(get_db)):
    results = (
        db.query(
            Hospitalization.hospitalization_id,
            Patient.patient_id,
            Patient.name,
            Patient.surname,
            Patient.pesel
        )
        .join(Patient, Patient.patient_id == Hospitalization.patient_id)
        .filter(
            Hospitalization.admitted_department_id == department_id,
            Hospitalization.status == "ACTIVE"
        )
        .all()
    )

    return [
        {
            "hospitalization_id": h.hospitalization_id,
            "patient": {
                "patient_id": h.patient_id,
                "name": h.name,
                "surname": h.surname,
                "pesel": h.pesel
            }
        }
        for h in results
    ]



@app.get("/hospital_staff")
def get_hospital_staff(db: Session = Depends(get_db)):
    staff_list = db.query(HospitalStaff).options(joinedload(HospitalStaff.specialty)).all()
    
    return [
        {
            "staff_id": s.staff_id,
            "first_name": s.first_name,
            "last_name": s.last_name,
            "phone": s.phone,
            "role": s.role,
            "specialty_id": s.specialty_id,
            "specialty_name": s.specialty.name if s.specialty else None
        }
        for s in staff_list
    ]

@app.post("/assign_staff")
def assign_staff(request: AssignStaffRequest, db: Session = Depends(get_db)):
    # Sprawdzenie hospitalizacji
    hosp = db.query(Hospitalization).filter(Hospitalization.hospitalization_id == request.hospitalization_id).first()
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospitalizacja nie istnieje")
    
    # Sprawdzenie personelu
    staff = db.query(HospitalStaff).filter(HospitalStaff.staff_id == request.staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Personel nie istnieje")

    # Dodanie wpisu
    new_assignment = HospitalizationStaff(
        hospitalization_id=request.hospitalization_id,
        staff_id=request.staff_id,
        role=request.role
    )
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)

    return {"message": "Personel przypisany pomyślnie", "assignment_id": new_assignment.id}


@app.get("/hospitalizations/{hospitalization_id}/staff")
def get_hospitalization_staff(hospitalization_id: int, db: Session = Depends(get_db)):
    # Pobierz wszystkie przypisania personelu do tej hospitalizacji
    assignments = db.query(HospitalizationStaff).filter(
        HospitalizationStaff.hospitalization_id == hospitalization_id
    ).all()

    staff_list = []
    for a in assignments:
        staff = db.query(HospitalStaff).filter(HospitalStaff.staff_id == a.staff_id).first()
        if staff:
            staff_list.append({
                "staff_id": staff.staff_id,
                "first_name": staff.first_name,
                "last_name": staff.last_name,
                "role": a.role  # rola przypisana w hospitalizacji
            })

    return staff_list



@app.delete("/hospitalizations/{hospitalization_id}/remove_staff")
def remove_staff(hospitalization_id: int, request: RemoveStaffRequest, db: Session = Depends(get_db)):
    # Znajdź wpis w tabeli hospitalization_staff
    staff_entry = db.query(HospitalizationStaff).filter(
        HospitalizationStaff.hospitalization_id == hospitalization_id,
        HospitalizationStaff.staff_id == request.staff_id
    ).first()

    if not staff_entry:
        raise HTTPException(status_code=404, detail="Personel nie przypisany do tej hospitalizacji")

    db.delete(staff_entry)
    db.commit()

    return {"message": "Personel został usunięty"}


@app.get("/staff/{staff_id}/current-hospitalizations")
def get_current_hospitalizations_for_doctor(
    staff_id: int,
    db: Session = Depends(get_db)
):
    # 1. Pobierz aktywne przypisania lekarza
    assignments = db.query(HospitalizationStaff).filter(
        HospitalizationStaff.staff_id == staff_id,
    ).all()

    result = []

    # 2. Sprawdź każdą hospitalizację
    for a in assignments:
        hospitalization = db.query(Hospitalization).filter(
            Hospitalization.hospitalization_id == a.hospitalization_id,
            Hospitalization.discharge_at == None
        ).first()

        if not hospitalization:
            continue

        patient = db.query(Patient).filter(
            Patient.patient_id == hospitalization.patient_id
        ).first()

        result.append({
            "hospitalization_id": hospitalization.hospitalization_id,
            "patient_id": patient.patient_id if patient else None,
            "patient_name": patient.name if patient else None,
            "patient_surname": patient.surname if patient else None,
            "admitted_at": hospitalization.admitted_at,
            "doctor_role": a.role
        })

    
    return result



@app.post("/hospitalizations/{hospitalization_id}/medical_notes", response_model=MedicalNoteOut)
def create_medical_note(hospitalization_id: int, note: MedicalNoteCreate, db: Session = Depends(get_db)):
    db_note = MedicalNotes(
        hospitalization_id=hospitalization_id,
        staff_id=note.staff_id,
        note_type=note.note_type,
        content=note.content,
        created_at=datetime.utcnow()
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    staff = db.query(HospitalStaff).filter(HospitalStaff.staff_id == db_note.staff_id).first()

    return MedicalNoteOut(
        note_id=db_note.note_id,
        hospitalization_id=db_note.hospitalization_id,
        staff_id=db_note.staff_id,
        staff_first_name=staff.first_name if staff else "",
        staff_last_name=staff.last_name if staff else "",
        note_type=db_note.note_type,
        content=db_note.content,
        created_at=db_note.created_at
    )


@app.get("/hospitalizations/{hospitalization_id}/medical_notes", response_model=List[MedicalNoteOut])
def get_medical_notes(hospitalization_id: int, db: Session = Depends(get_db)):
    notes = (
        db.query(MedicalNotes)
        .join(HospitalStaff, MedicalNotes.staff_id == HospitalStaff.staff_id)
        .filter(MedicalNotes.hospitalization_id == hospitalization_id)
        .all()
    )

    result = []
    for n in notes:
        result.append(MedicalNoteOut(
            note_id=n.note_id,
            hospitalization_id=n.hospitalization_id,
            staff_id=n.staff_id,
            staff_first_name=n.staff.first_name,
            staff_last_name=n.staff.last_name,
            note_type=n.note_type,
            content=n.content,
            created_at=n.created_at
        ))
    return result


@app.post("/hospitalizations/{hospitalization_id}/discharge")
def discharge_hospitalization(
    hospitalization_id: int,
    request: DischargeHospitalizationRequest,  # <-- normalnie Pydantic
    db: Session = Depends(get_db)
):
    # Pobierz hospitalizację
    hosp = db.query(Hospitalization).filter(
        Hospitalization.hospitalization_id == hospitalization_id
    ).first()
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospitalizacja nie istnieje")

    if hosp.status != "ACTIVE":
        raise HTTPException(status_code=400, detail="Hospitalizacja nie jest aktywna")

    # Sprawdzenie czy staff jest prowadzącym
    lead_doctor_assignment = db.query(HospitalizationStaff).filter(
        HospitalizationStaff.hospitalization_id == hospitalization_id,
        HospitalizationStaff.staff_id == request.staff_id,
        HospitalizationStaff.role == "Lekarz prowadzący"
    ).first()
    if not lead_doctor_assignment:
        raise HTTPException(status_code=403, detail="Nie jesteś lekarzem prowadzącym tej hospitalizacji")

    # Wypis
    hosp.discharge_at = datetime.utcnow()
    hosp.discharge_type = request.discharge_type
    hosp.status = "DISCHARGED"
    db.commit()
    db.refresh(hosp)

    # Dodanie notatki DECISION jeśli jest powód
    if request.discharge_note:
        note = MedicalNotes(
            hospitalization_id=hospitalization_id,
            staff_id=request.staff_id,
            note_type="Decyzja",
            content=request.discharge_note,
            created_at=datetime.utcnow()
        )
        db.add(note)
        db.commit()
        db.refresh(note)

    return {
        "message": "Pacjent został wypisany",
        "hospitalization_id": hosp.hospitalization_id,
        "discharge_at": hosp.discharge_at,
        "discharge_type": hosp.discharge_type,
        "status": hosp.status
    }


@app.get("/specialties")
def get_specialties(db: Session = Depends(get_db)):
    specialties = db.query(Specialties).all()  # albo Specialty jeśli masz
    return [{"specialty_id": s.specialty_id, "name": s.name} for s in specialties]


@app.post("/admin/createStaff")
def create_hospital_staff(request: CreateStaffRequest, db: Session = Depends(get_db)):
    # 1. Tworzymy lekarza
    new_staff = HospitalStaff(
        first_name=request.first_name,
        last_name=request.last_name,
        phone=request.phone,
        role=request.role,
        specialty_id=request.specialty_id
    )
    db.add(new_staff)
    db.commit()
    db.refresh(new_staff)


    return {
        "message": "Pracownik dodany pomyślnie",
        "staff_id": new_staff.staff_id,
        "first_name": new_staff.first_name,
        "last_name": new_staff.last_name,
        "role": new_staff.role,
        "specialty_id": new_staff.specialty_id,
    }


@app.get("/admin/staff/without-account")
def get_staff_without_account(db: Session = Depends(get_db)):
    staff = (
        db.query(HospitalStaff)
        .outerjoin(StaffAccount, HospitalStaff.staff_id == StaffAccount.staff_id)
        .filter(StaffAccount.staff_id == None)
        .all()
    )

    return [
        {
            "staff_id": s.staff_id,
            "first_name": s.first_name,
            "last_name": s.last_name,
            "role": s.role,
            "phone": s.phone
        }
        for s in staff
    ]



@app.post("/admin/createAccount")
def create_staff_account(data: StaffAccountCreate, db: Session = Depends(get_db)):
    existing = db.query(StaffAccount).filter(
        StaffAccount.staff_id == data.staff_id
    ).first()

    if existing:
        raise HTTPException(400, "Pracownik ma już konto")


    account = StaffAccount(
        staff_id=data.staff_id,
        email=data.email,
        password=data.password
    )

    db.add(account)
    db.commit()
    return {"message": "Konto utworzone"}


@app.get("/admin/accounts")
def get_all_accounts(db: Session = Depends(get_db)):
    accounts = db.query(StaffAccount).all()
    specialties = {s.specialty_id: s.name for s in db.query(Specialties).all()}

    result = []

    for acc in accounts:
        staff = acc.staff
        specialty_name = specialties.get(staff.specialty_id) if staff.specialty_id else None

        result.append({
            "account_id": acc.account_id,
            "email": acc.email,
            "created_at": acc.created_at,
            "staff": {
                "first_name": staff.first_name,
                "last_name": staff.last_name,
                "role": staff.role,
                "phone": staff.phone,
                "specialty": specialty_name
            }
        })

    return result



@app.put("/admin/accounts/{account_id}")
def update_staff_account(account_id: int, data: AccountUpdate, db: Session = Depends(get_db)):
    """
    Aktualizacja konta lekarza/administrator: imię, nazwisko, email, telefon, rola, specjalizacja
    """
    # 1. Pobranie konta
    account = db.query(StaffAccount).filter(StaffAccount.account_id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Konto nie istnieje")

    staff = account.staff
    if not staff:
        raise HTTPException(status_code=404, detail="Personel powiązany z kontem nie istnieje")

    # 2. Aktualizacja pól
    staff.first_name = data.first_name
    staff.last_name = data.last_name
    staff.phone = data.phone
    staff.role = data.role

    # Znalezienie ID specjalizacji po nazwie, jeśli podano
# Znalezienie ID specjalizacji po nazwie lub ustawienie None jeśli pusty string
    if not data.specialty:
        staff.specialty_id = None
    else:
        try:
            # Spróbuj potraktować jako ID
            specialty_id = int(data.specialty)
            specialty = db.query(Specialties).filter(Specialties.specialty_id == specialty_id).first()
        except ValueError:
            # Jeśli nie ID, traktujemy jako nazwę
            specialty = db.query(Specialties).filter(Specialties.name == data.specialty).first()

        if not specialty:
            raise HTTPException(status_code=404, detail="Specjalizacja nie istnieje")
        
        staff.specialty_id = specialty.specialty_id

    # Aktualizacja emaila konta
    account.email = data.email

    db.commit()
    db.refresh(account)
    db.refresh(staff)

    # Zwrócenie zaktualizowanego obiektu w formacie jak w get_all_accounts
    specialty_name = staff.specialty.name if staff.specialty else None
    return {
        "account_id": account.account_id,
        "email": account.email,
        "created_at": account.created_at,
        "staff": {
            "first_name": staff.first_name,
            "last_name": staff.last_name,
            "role": staff.role,
            "phone": staff.phone,
            "specialty": specialty_name
        }
    }



@app.post("/admin/departments")
def create_department(
    data: DepartmentCreate,
    db: Session = Depends(get_db)
):
    department = HospitalDepartment(
        name=data.name,
        description=data.description,
        floor=data.floor,
        phone=data.phone
    )

    db.add(department)
    db.commit()
    db.refresh(department)

    return department



@app.put("/admin/departments/{department_id}")
def update_department(
    department_id: int,
    data: DepartmentUpdate,
    db: Session = Depends(get_db),
):
    department = db.query(HospitalDepartment).filter(
        HospitalDepartment.department_id == department_id
    ).first()
    if not department:
        raise HTTPException(status_code=404, detail="Oddział nie istnieje")

    department.name = data.name
    department.description = data.description
    department.floor = data.floor
    department.phone = data.phone

    db.commit()
    db.refresh(department)
    return department


@app.delete("/admin/departments/{department_id}")
def delete_department(department_id: int, db: Session = Depends(get_db)):
    department = db.query(HospitalDepartment).filter(HospitalDepartment.department_id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Oddział nie istnieje")
    
    db.delete(department)
    db.commit()
    return {"detail": "Oddział usunięty"}


@app.get("/admin/diagnostics/list", response_model=List[DiagnosticOut])
def get_diagnostics(db: Session = Depends(get_db)):
    diagnostics = db.query(Diagnostic).all()
    return diagnostics

# POST /admin/diagnostics - dodaj nowe badanie
@app.post("/admin/diagnostics", response_model=DiagnosticOut)
def create_diagnostic(data: DiagnosticCreate, db: Session = Depends(get_db)):
    new_diag = Diagnostic(**data.dict())
    db.add(new_diag)
    db.commit()
    db.refresh(new_diag)
    return new_diag

# PUT /admin/diagnostics/{diagnostic_id} - edytuj badanie
@app.put("/admin/diagnostics/{diagnostic_id}", response_model=DiagnosticOut)
def update_diagnostic(diagnostic_id: int, data: DiagnosticCreate, db: Session = Depends(get_db)):
    diag = db.query(Diagnostic).filter(Diagnostic.diagnostic_id == diagnostic_id).first()
    if not diag:
        raise HTTPException(status_code=404, detail="Badanie nie istnieje")
    for field, value in data.dict().items():
        setattr(diag, field, value)
    db.commit()
    db.refresh(diag)
    return diag

# POST /admin/diagnostic_parameters/{diagnostic_id} - przypisz lub edytuj parametry
@app.post("/admin/diagnostic_parameters/{diagnostic_id}", response_model=DiagnosticParameterOut)
def add_parameter(diagnostic_id: int, param: ParamCreate, db: Session = Depends(get_db)):
    diag = db.query(Diagnostic).filter(Diagnostic.diagnostic_id == diagnostic_id).first()
    if not diag:
        raise HTTPException(status_code=404, detail="Badanie nie istnieje")
    
    new_param = DiagnosticParameter(
        name=param.name,
        unit=param.unit,
        min_value=param.min_value,
        max_value=param.max_value,
        diagnostic_id=diagnostic_id
    )
    db.add(new_param)
    db.commit()
    db.refresh(new_param)
    return new_param



@app.put("/admin/diagnostic_parameters/{parameter_id}", response_model=DiagnosticParameterOut)
def update_parameter(parameter_id: int, param: ParamCreate, db: Session = Depends(get_db)):
    existing_param = db.query(DiagnosticParameter).filter(DiagnosticParameter.parameter_id == parameter_id).first()
    if not existing_param:
        raise HTTPException(status_code=404, detail="Parametr nie istnieje")
    
    existing_param.name = param.name
    existing_param.unit = param.unit
    existing_param.min_value = param.min_value
    existing_param.max_value = param.max_value

    db.commit()
    db.refresh(existing_param)
    return existing_param


# OPTIONAL: DELETE badania
@app.delete("/admin/diagnostics/{diagnostic_id}")
def delete_diagnostic(diagnostic_id: int, db: Session = Depends(get_db)):
    diag = db.query(Diagnostic).filter(Diagnostic.diagnostic_id == diagnostic_id).first()
    if not diag:
        raise HTTPException(status_code=404, detail="Badanie nie istnieje")
    db.delete(diag)
    db.commit()
    return {"detail": "Badanie usunięte"}

# OPTIONAL: DELETE parametr
@app.delete("/admin/diagnostic_parameters/{parameter_id}")
def delete_parameter(parameter_id: int, db: Session = Depends(get_db)):
    param = db.query(DiagnosticParameter).filter(DiagnosticParameter.parameter_id == parameter_id).first()
    if not param:
        raise HTTPException(status_code=404, detail="Parametr nie istnieje")
    db.delete(param)
    db.commit()
    return {"detail": "Parametr usunięty"}


@app.get("/admin/specialties", response_model=list[SpecialtyOut])
def list_specialties(db: Session = Depends(get_db)):
    return db.query(Specialties).order_by(Specialties.specialty_id).all()

@app.post("/admin/specialties", response_model=SpecialtyOut)
def create_specialty(specialty: SpecialtyCreate, db: Session = Depends(get_db)):
    db_specialty = Specialties(name=specialty.name)
    db.add(db_specialty)
    db.commit()
    db.refresh(db_specialty)
    return db_specialty

@app.put("/admin/specialties/{specialty_id}", response_model=SpecialtyOut)
def update_specialty(specialty_id: int, specialty: SpecialtyUpdate, db: Session = Depends(get_db)):
    db_specialty = db.query(Specialties).filter(Specialties.specialty_id == specialty_id).first()
    if not db_specialty:
        raise HTTPException(status_code=404, detail="Specialty not found")
    db_specialty.name = specialty.name
    db.commit()
    db.refresh(db_specialty)
    return db_specialty

@app.delete("/admin/specialties/{specialty_id}")
def delete_specialty(specialty_id: int, db: Session = Depends(get_db)):
    db_specialty = db.query(Specialties).filter(Specialties.specialty_id == specialty_id).first()
    if not db_specialty:
        raise HTTPException(status_code=404, detail="Specialty not found")
    db.delete(db_specialty)
    db.commit()
    return {"detail": "Deleted"}


@app.get("/patients/{user_id}/hospitalizations")
def get_patient_hospitalizations(
    user_id: int,
    db: Session = Depends(get_db)
):
    # 1️⃣ Pobierz usera
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user or not user.patient_id:
        raise HTTPException(status_code=404, detail="Pacjent nie istnieje")

    # 2️⃣ Pobierz hospitalizacje pacjenta
    hospitalizations = (
        db.query(Hospitalization)
        .filter(Hospitalization.patient_id == user.patient_id)
        .order_by(Hospitalization.admitted_at.desc())
        .all()
    )

    result = []

    for hosp in hospitalizations:
        # Oddział
        department = db.query(HospitalDepartment).filter(
            HospitalDepartment.department_id == hosp.admitted_department_id
        ).first()

        # Notatki
        notes = (
            db.query(MedicalNotes)
            .join(HospitalStaff, MedicalNotes.staff_id == HospitalStaff.staff_id)
            .filter(MedicalNotes.hospitalization_id == hosp.hospitalization_id)
            .order_by(MedicalNotes.created_at.desc())
            .all()
        )

        notes_data = []
        for n in notes:
            notes_data.append({
                "note_id": n.note_id,
                "type": n.note_type,
                "content": n.content,
                "author": f"{n.staff.first_name} {n.staff.last_name}",
                "created_at": n.created_at
            })

        # Transfery
        transfers = (
            db.query(DepartmentTransfer)
            .filter(DepartmentTransfer.hospitalization_id == hosp.hospitalization_id)
            .order_by(DepartmentTransfer.transferred_at.asc())
            .all()
        )

        transfers_data = []
        for t in transfers:
            from_dep = db.query(HospitalDepartment).filter(
                HospitalDepartment.department_id == t.from_department_id
            ).first()
            to_dep = db.query(HospitalDepartment).filter(
                HospitalDepartment.department_id == t.to_department_id
            ).first()

            transfers_data.append({
                "transfer_id": t.transfer_id,
                "from": from_dep.name if from_dep else None,
                "to": to_dep.name if to_dep else None,
                "date": t.transferred_at,
                "reason": t.reason
            })

        result.append({
            "hospitalization_id": hosp.hospitalization_id,
            "admitted_at": hosp.admitted_at,
            "discharge_at": hosp.discharge_at,
            "status": hosp.status,
            "department": department.name if department else None,
            "notes": notes_data,
            "transfers": transfers_data
        })

    return result
