from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal

class PatientCreate(BaseModel):
    name: str
    surname: str
    pesel: str
    date_of_birth: date
    phone: str
    emergency_contact_phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: str

class UserCreate(BaseModel):
    name: str
    surname: str
    email: EmailStr
    pesel: str
    password: str

class UserLogin(BaseModel):
    pesel: str
    password: str

class StaffLogin(BaseModel):
    email: EmailStr
    password: str

class PatientDiagnosticCreate(BaseModel):
    user_id: int
    diagnostic_id: int
    ordered_at: str = None
    status: str = "Oczekuje"


class PatientDiagnosticResultCreate(BaseModel):
    patient_diagnostic_id: int
    parameter_id: int
    value: float
    status: str = "Oczekuje"

class ResultItem(BaseModel):
    parameter_id: int
    value: float

class FillDiagnosticRequest(BaseModel):
    order_id: int
    results: List[ResultItem]

class AssignDepartmentByPeselRequest(BaseModel):
    pesel: str
    admitted_department_id: int
    admitted_at: str = None
    status: str = "ACTIVE"
    staff_id: int 
    reason: str | None = None


class AssignStaffRequest(BaseModel):
    hospitalization_id: int
    staff_id: int
    role: str



class RemoveStaffRequest(BaseModel):
    staff_id: int


class MedicalNoteCreate(BaseModel):
    staff_id: int
    note_type: str
    content: str

# Schema do zwracania notatki
class MedicalNoteOut(BaseModel):
    note_id: int
    hospitalization_id: int
    staff_id: int
    staff_first_name: str
    staff_last_name: str
    note_type: str
    content: str
    created_at: datetime

    class Config:
        orm_mode = True



class DischargeHospitalizationRequest(BaseModel):
    staff_id: int
    discharge_type: str
    discharge_note: Optional[str] = None



class CreateStaffRequest(BaseModel):
    first_name: str
    last_name: str
    phone: str
    role: str
    specialty_id: Optional[int] = None



class StaffAccountCreate(BaseModel):
    staff_id: int
    email: EmailStr
    password: str

class AccountUpdate(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str | None = None
    role: str
    specialty: str | None = None



class DepartmentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    floor: int
    phone: Optional[str] = None

class DepartmentUpdate(BaseModel):
    name: str
    description: Optional[str] = None
    floor: Optional[int] = None
    phone: Optional[str] = None

class ParamCreate(BaseModel):
    name: str
    unit: str
    min_value: float
    max_value: float
    parameter_id: Optional[int] = None

class DiagnosticCreate(BaseModel):
    name: str
    description: str
    price: float

class DiagnosticOut(BaseModel):
    diagnostic_id: int
    name: str
    description: str
    price: float
    parameters: List[ParamCreate] = []

class DiagnosticParameterOut(BaseModel):
    parameter_id: int
    name: str
    unit: str
    min_value: float
    max_value: float


class SpecialtyCreate(BaseModel):
    name: str

class SpecialtyUpdate(BaseModel):
    name: str

class SpecialtyOut(BaseModel):
    specialty_id: int
    name: str


class PatientUpdate(BaseModel):
    name: str
    surname: str
    email: str
    phone: str
    emergency_contact_phone: str
    address: str
