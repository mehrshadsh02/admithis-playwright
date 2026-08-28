export interface Patient {
  // =========================================================
  // Patient Identity / Personal Information
  // =========================================================

  nationalCode: string;
  electronicNumber: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  motherName: string;
  grandFatherName: string;
  identityCode: string;
  nationality: string;
  sex: string;
  birthDate: string;
  birthPlace: string;
  maritalStatus: string;
  religion: string;

  mobile: string;
  phone: string;
  email: string;

  address: string;
  postalCode: string;
  city: string;

  // =========================================================
  // Patient / Family / Responsible Person
  // =========================================================

  responsiblePatient: string;
  responsiblePatientNationalCode: string;
  responsiblePatientMobile: string;
  responsiblePatientRelation: string;

  familyName: string;
  familyRelation: string;
  familyMobile: string;
  familyPhone: string;
  familyAddress: string;
  familyCity: string;
  familyPostalCode: string;

  // =========================================================
  // Accompany
  // =========================================================

  accompanyName: string;
  accompanyRelation: string;
  accompanyMobile: string;
  accompanyNationalCode: string;
  accompanyAddress: string;
  accompanyCity: string;

  // =========================================================
  // Insurance
  // =========================================================

  insuranceName: string;
  insuranceFund: string;  
  insuranceRelation: string;
  insuranceId: string;
  insuranceNumber: string;
  insuranceSerialNumber: string;
  insurancePageNumber: string;
  insuranceExpirationDate: string;
  insuranceMax: string;

  secondaryInsuranceName: string;
  secondaryInsuranceId: string;
  secondaryInsuranceNumber: string;
  secondaryInsuranceMax: string;

  insuranceNote: string;

  // =========================================================
  // Admission - General
  // =========================================================

  firstRecognition: string;
  howToRefer: string;
  causeOfHospitalization: string;
  diagnosis: string;
  diagnosisCode: string;

  admissionType: string;
  patientClass: string;
  priority: string;

  ward: string;
  wardId: string;

  inpatientward: string;
  inpatientWardId: string;

  bed: string;
  bedId: string;

  doctor: string;
  doctorId: string;

  referenceDoctor: string;
  referenceDoctorId: string;

  // =========================================================
  // Emergency Admission
  // =========================================================

  emergencyWard: string;
  emergencyWardId: string;

  emergencyBed: string;
  emergencyBedId: string;

  emergencyDoctor: string;
  emergencyDoctorId: string;

  emergencyEditDoctor: string;
  emergencyAdmitEditWard: string;

  emergencyNo: string;

  triageLevel: string;
  accidentType: string;

  entranceType: string;

  admissionReason: string;

  // =========================================================
  // Inpatient Admission
  // =========================================================

  inpatientEditResponsiblePatient: string;

  inpatientEditWard: string;
  inpatientEditDoctor: string;

  inpatientBed: string;
  inpatientBedId: string;

  inpatientAdmissionReason: string;

  // =========================================================
  // Pre-Admission
  // =========================================================

  preadmitEditWard: string;
  preadmitEditDoctor: string;

  preadmitWard: string;
  preadmitWardId: string;

  preadmitBed: string;
  preadmitBedId: string;

  // =========================================================
  // Payment / Cash / Pishpardakht
  // =========================================================

  prepayment: string;
  refundComment: string;

  paymentAmount: string;
  refundAmount: string;

  paymentType: string;
  cashType: string;

  // =========================================================
  // Bank / Sheba
  // =========================================================

  ShabaNo: string;
  BankAcountName: string;

  shebaOwner: string;
  hasSheba: string;

  // =========================================================
  // Medical / Clinical
  // =========================================================

  sensitivity: string;
  contagion: string;

  pregnancy: string;
  dangerousPatient: string;

  // =========================================================
  // Referral
  // =========================================================

  referralDoctor: string;
  referralCenter: string;

  // =========================================================
  // Admission Edit
  // =========================================================

  admissionEditWard: string;
  admissionEditDoctor: string;

  admissionEditBed: string;
  admissionEditResponsiblePatient: string;

  // =========================================================
  // Discharge
  // =========================================================

  dischargeDate: string;
  dischargeTime: string;
  dischargeStep: string;
  dischargeDebt: string;

  // =========================================================
  // Other
  // =========================================================

  passportNumber: string;
  passportType: string;

  residencePermit: string;

  job: string;
  jobId: string;

  homeCity: string;
  homeAddress: string;
  homePhone: string;

  workPlaceName: string;
  workCity: string;
  workAddress: string;
  workPhone: string;

  note1: string;
  note2: string;

  // =========================================================
  // Test Specific
  // =========================================================

  titleType: string;
  fileFormationId: string;
  admitId: string;
}
