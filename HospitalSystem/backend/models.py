from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class Patient(Base):
    __tablename__ = "patients"

    patient_id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    surname = Column(String)
    pesel = Column(String)
    date_of_birth = Column(Date)
    phone = Column(String)
    emergency_contact_phone = Column(String)
    email = Column(String)
    address = Column(String)

    users = relationship("User", back_populates="patient")
    hospitalizations = relationship("Hospitalization", back_populates="patient")


class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    pesel = Column(String(11), nullable=False)
    name = Column(String)
    surname = Column(String)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=True)

    patient = relationship("Patient", back_populates="users")

class HospitalStaff(Base):
    __tablename__ = "hospital_staff"

    staff_id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String)
    role = Column(String, nullable=False)
    specialty_id = Column(Integer, ForeignKey("specialties.specialty_id"), nullable = False)
    accounts = relationship("StaffAccount", back_populates="staff")
    hospitalizations = relationship("HospitalizationStaff", back_populates="staff")
    specialty = relationship("Specialties", back_populates="staff_members")


class StaffAccount(Base):
    __tablename__ = "staff_accounts"

    account_id = Column(Integer, primary_key=True, autoincrement=True)
    staff_id = Column(Integer, ForeignKey("hospital_staff.staff_id"), nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relacja do tabeli personelu
    staff = relationship("HospitalStaff", back_populates="accounts")



class Diagnostic(Base):
    __tablename__ = "diagnostics"

    diagnostic_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(Float)

    parameters = relationship("DiagnosticParameter", back_populates="diagnostic")
    patient_diagnostics = relationship("PatientDiagnostic", back_populates="diagnostic")


class DiagnosticParameter(Base):
    __tablename__ = "diagnostic_parameters"

    parameter_id = Column(Integer, primary_key=True, autoincrement=True)
    diagnostic_id = Column(Integer, ForeignKey("diagnostics.diagnostic_id"), nullable=False)
    name = Column(String, nullable=False)
    unit = Column(String)
    min_value = Column(Float)
    max_value = Column(Float)

    diagnostic = relationship("Diagnostic", back_populates="parameters")
    results = relationship("PatientDiagnosticResult", back_populates="parameter")


class PatientDiagnostic(Base):
    __tablename__ = "patient_diagnostics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    diagnostic_id = Column(Integer, ForeignKey("diagnostics.diagnostic_id"), nullable=False)
    ordered_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="Oczekuje")

    diagnostic = relationship("Diagnostic", back_populates="patient_diagnostics")
    results = relationship("PatientDiagnosticResult", back_populates="patient_diagnostic")
    user = relationship("User")


class PatientDiagnosticResult(Base):
    __tablename__ = "patient_diagnostic_results"

    result_id = Column(Integer, primary_key=True, autoincrement=True)
    patient_diagnostic_id = Column(Integer, ForeignKey("patient_diagnostics.id"), nullable=False)
    parameter_id = Column(Integer, ForeignKey("diagnostic_parameters.parameter_id"), nullable=False)
    value = Column(Float)
    min_value = Column(Float)
    max_value = Column(Float)
    status = Column(String, default="Oczekuje")

    patient_diagnostic = relationship("PatientDiagnostic", back_populates="results")
    parameter = relationship("DiagnosticParameter", back_populates="results")


class Hospitalization(Base):
    __tablename__ = "hospitalizations"

    hospitalization_id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=False)
    admitted_department_id = Column(Integer, ForeignKey("hospital_departments.department_id"), nullable=False)
    admitted_at = Column(DateTime, default=datetime.utcnow)
    discharge_at = Column(DateTime, nullable=True)
    discharge_type = Column(String, nullable=True)
    status = Column(String, default="ACTIVE")

    # Relacje do innych tabel
    patient = relationship("Patient", back_populates="hospitalizations")
    department = relationship("HospitalDepartment", back_populates="hospitalizations")
    transfers = relationship("DepartmentTransfer", back_populates="hospitalization")
    staff_assignments = relationship("HospitalizationStaff", back_populates="hospitalization")
    medical_notes = relationship("MedicalNotes", back_populates="hospitalization")


class HospitalDepartment(Base):
    __tablename__ = "hospital_departments"

    department_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    floor = Column(String, nullable=True)
    phone = Column(String, nullable=True)

    # Relacje
    hospitalizations = relationship("Hospitalization", back_populates="department")
    department_transfers_from = relationship(
        "DepartmentTransfer",
        foreign_keys="DepartmentTransfer.from_department_id",
        back_populates="from_department"
    )
    department_transfers_to = relationship(
        "DepartmentTransfer",
        foreign_keys="DepartmentTransfer.to_department_id",
        back_populates="to_department"
    )


class DepartmentTransfer(Base):
    __tablename__ = "department_transfers"

    transfer_id = Column(Integer, primary_key=True, index=True)
    hospitalization_id = Column(Integer, ForeignKey("hospitalizations.hospitalization_id"), nullable=False)
    from_department_id = Column(Integer, ForeignKey("hospital_departments.department_id"), nullable=False)
    to_department_id = Column(Integer, ForeignKey("hospital_departments.department_id"), nullable=False)
    transferred_at = Column(DateTime, default=datetime.utcnow)
    reason = Column(String, nullable=True)
    staff_id = Column(Integer, ForeignKey("hospital_staff.staff_id"), nullable=True)

    # Relacje
    hospitalization = relationship("Hospitalization", back_populates="transfers")
    from_department = relationship("HospitalDepartment", foreign_keys=[from_department_id], back_populates="department_transfers_from")
    to_department = relationship("HospitalDepartment", foreign_keys=[to_department_id], back_populates="department_transfers_to")
    staff = relationship("HospitalStaff")

class HospitalizationStaff(Base):
    __tablename__ = "hospitalization_staff"

    id = Column(Integer, primary_key=True, index=True)
    hospitalization_id = Column(Integer, ForeignKey("hospitalizations.hospitalization_id"), nullable=False)
    staff_id = Column(Integer, ForeignKey("hospital_staff.staff_id"), nullable=False)
    role = Column(String, nullable=False)  # PRIMARY_DOCTOR / CONSULTANT / NURSE
    assigned_at = Column(DateTime, default=datetime.utcnow)

    # Relacje
    hospitalization = relationship("Hospitalization", back_populates="staff_assignments")
    staff = relationship("HospitalStaff", back_populates="hospitalizations")




class MedicalNotes(Base):
    __tablename__ = "medical_notes"

    note_id = Column(Integer, primary_key=True, index=True)
    hospitalization_id = Column(Integer, ForeignKey("hospitalizations.hospitalization_id"), nullable=False)
    staff_id = Column(Integer, ForeignKey("hospital_staff.staff_id"), nullable=False)
    note_type = Column(String, nullable=False)  # DIAGNOSIS / DECISION / OBSERVATION
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relacje
    hospitalization = relationship("Hospitalization", back_populates="medical_notes")
    staff = relationship("HospitalStaff")



class Specialties(Base):
    __tablename__ = "specialties"

    specialty_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    # Relacja do personelu
    staff_members = relationship("HospitalStaff", back_populates="specialty")


