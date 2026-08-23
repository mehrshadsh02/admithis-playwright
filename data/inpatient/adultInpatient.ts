import type { Patient } from '../models/Patient';

export const adultInpatient: Patient = {
  // =========================================================
  // Patient Identity / Personal Information
  // =========================================================

  nationalCode: '3151025013',
  firstName: '',
  lastName: '',
  fatherName: '',
  motherName: '',
  grandFatherName: '',
  identityCode: '',
  nationality: '',
  sex: '',
  birthDate: '',
  birthPlace: '',
  maritalStatus: 'مجرد',
  religion: '',
  mobile: '09383509316',
  phone: '',
  email: '',
  address: 'dfgdfgdfgd',
  postalCode: '',
  city: '',

  // =========================================================
  // Patient / Family / Responsible Person
  // =========================================================

  responsiblePatient: 'خود فرد',
  responsiblePatientNationalCode: '',
  responsiblePatientMobile: '',
  responsiblePatientRelation: '',
  familyName: '',
  familyRelation: '',
  familyMobile: '',
  familyPhone: '',
  familyAddress: '',
  familyCity: '',
  familyPostalCode: '',

  // =========================================================
  // Accompany
  // =========================================================

  accompanyName: 'محمدپارسا محمدی',
  accompanyRelation: 'خود فرد',
  accompanyMobile: '09383586316',
  accompanyNationalCode: '',
  accompanyAddress: '',
  accompanyCity: '',

  // =========================================================
  // Insurance
  // =========================================================

  insuranceName: 'آزاد',
  insuranceRelation: 'خود فرد',
  insuranceId: '',
  insuranceNumber: '',
  insuranceSerialNumber: '',
  insurancePageNumber: '',
  insuranceExpirationDate: '',
  insuranceMax: '',
  secondaryInsuranceName: '',
  secondaryInsuranceId: '',
  secondaryInsuranceNumber: '',
  secondaryInsuranceMax: '',
  insuranceNote: '',

  // =========================================================
  // Admission - General
  // =========================================================

  firstRecognition: 'شکستگی',
  howToRefer: 'وسیله شخصی',
  causeOfHospitalization: 'دل درد',
  diagnosis: '',
  diagnosisCode: '',
  admissionType: '',
  patientClass: 'بستری',
  priority: '',
  ward: 'اطفال 2 - تخت خالی',
  wardId: '',
  inpatientward: '',
  inpatientWardId: '',
  bed: 'اتاق1 - تخت عمومي - تخت',
  bedId: '',
  doctor: 'Siavash Siavash',
  doctorId: '',
  referenceDoctor: '',
  referenceDoctorId: '',

  // =========================================================
  // Emergency Admission
  // =========================================================

  emergencyWard: '',
  emergencyWardId: '',
  emergencyBed: '',
  emergencyBedId: '',
  emergencyDoctor: '',
  emergencyDoctorId: '',
  emergencyEditDoctor: '',
  emergencyAdmitEditWard: '',
  emergencyNo: '',
  triageLevel: '',
  accidentType: '',
  entranceType: '',
  admissionReason: '',

  // =========================================================
  // Inpatient Admission
  // =========================================================

  inpatientEditResponsiblePatient: 'همسر',
  inpatientEditWard: '',
  inpatientEditDoctor: '',
  inpatientBed: '',
  inpatientBedId: '',
  inpatientAdmissionReason: '',

  // =========================================================
  // Pre-Admission
  // =========================================================

  preadmitEditWard: 'اطفال 2 - تخت خالی',
  preadmitEditDoctor: '',
  preadmitWard: '',
  preadmitWardId: '',
  preadmitBed: '',
  preadmitBedId: '',

  // =========================================================
  // Payment / Cash / Pishpardakht
  // =========================================================

  prepayment: '',
  refundComment: 'test',
  paymentAmount: '',
  refundAmount: '',
  paymentType: '',
  cashType: '',

  // =========================================================
  // Bank / Sheba
  // =========================================================

  ShabaNo: '012025000001425236252145',
  BankAcountName: 'محمدپارسا محمدی',
  shebaOwner: '',
  hasSheba: '',

  // =========================================================
  // Medical / Clinical
  // =========================================================

  sensitivity: '',
  contagion: '',
  pregnancy: '',
  dangerousPatient: '',

  // =========================================================
  // Referral
  // =========================================================

  referralDoctor: '',
  referralCenter: '',

  // =========================================================
  // Admission Edit
  // =========================================================

  admissionEditWard: '',
  admissionEditDoctor: '',
  admissionEditBed: '',
  admissionEditResponsiblePatient: '',

  // =========================================================
  // Discharge
  // =========================================================

  dischargeDate: '',
  dischargeTime: '',
  dischargeStep: '',
  dischargeDebt: '',

  // =========================================================
  // Other
  // =========================================================

  passportNumber: '',
  passportType: '',
  residencePermit: '',
  job: '',
  jobId: '',
  homeCity: '',
  homeAddress: '',
  homePhone: '',
  workPlaceName: '',
  workCity: '',
  workAddress: '',
  workPhone: '',
  note1: '',
  note2: '',

  // =========================================================
  // Test Specific
  // =========================================================

  titleType: '',
  fileFormationId: '',
  admitId: '',
};