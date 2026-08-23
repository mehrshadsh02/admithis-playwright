import type { Patient } from '../models/Patient';

/**
 * PatientInformationInput
 *
 * اطلاعات پایه، هویتی، ارتباطی، همراه، بیمه، پزشکی،
 * ارجاع، ترخیص و سایر مشخصات بیمار.
 *
 * این type به‌صورت کامل از مدل Patient استخراج شده است
 * و محدود به فیلدهای استفاده‌شده در سناریوهای فعلی نیست.
 */
export type PatientInformationInput = Pick<
  Patient,
  // =========================================================
  // Patient Identity / Personal Information
  // =========================================================
  | 'nationalCode'
  | 'firstName'
  | 'lastName'
  | 'fatherName'
  | 'motherName'
  | 'grandFatherName'
  | 'identityCode'
  | 'sex'
  | 'birthDate'
  | 'birthPlace'
  | 'maritalStatus'
  | 'religion'

  // =========================================================
  // Patient Contact Information
  // =========================================================
  | 'mobile'
  | 'phone'
  | 'email'
  | 'address'
  | 'postalCode'
  | 'city'

  // =========================================================
  // Patient / Family / Responsible Person
  // =========================================================
  | 'responsiblePatientNationalCode'
  | 'responsiblePatientMobile'
  | 'responsiblePatientRelation'

  | 'familyName'
  | 'familyRelation'
  | 'familyMobile'
  | 'familyPhone'
  | 'familyAddress'
  | 'familyCity'
  | 'familyPostalCode'

  // =========================================================
  // Accompany
  // =========================================================
  | 'accompanyName'
  | 'accompanyRelation'
  | 'accompanyMobile'
  | 'accompanyNationalCode'
  | 'accompanyAddress'
  | 'accompanyCity'

  // =========================================================
  // Insurance
  // =========================================================
  | 'insuranceName'
  | 'insuranceFund'
  | 'insuranceRelation'
  | 'insuranceId'
  | 'insuranceNumber'
  | 'insuranceSerialNumber'
  | 'insurancePageNumber'
  | 'insuranceExpirationDate'
  | 'insuranceMax'

  | 'secondaryInsuranceName'
  | 'secondaryInsuranceId'
  | 'secondaryInsuranceNumber'
  | 'secondaryInsuranceMax'

  | 'insuranceNote'

  // =========================================================
  // Admission - General Information
  // =========================================================
  | 'firstRecognition'
  | 'howToRefer'
  | 'causeOfHospitalization'
  | 'diagnosis'
  | 'diagnosisCode'
  | 'admissionType'
  | 'patientClass'
  | 'priority'
  | 'admissionReason'

  // =========================================================
  // Bank / Sheba
  // =========================================================
  | 'ShabaNo'
  | 'BankAcountName'
  | 'shebaOwner'
  | 'hasSheba'

  // =========================================================
  // Medical / Clinical
  // =========================================================
  | 'sensitivity'
  | 'contagion'
  | 'pregnancy'
  | 'dangerousPatient'

  // =========================================================
  // Referral
  // =========================================================
  | 'referralDoctor'
  | 'referralCenter'

  // =========================================================
  // Discharge
  // =========================================================
  | 'dischargeDate'
  | 'dischargeTime'
  | 'dischargeStep'
  | 'dischargeDebt'

  // =========================================================
  // Other
  // =========================================================
  | 'passportNumber'
  | 'passportType'
  | 'residencePermit'

  | 'job'
  | 'jobId'

  | 'homeCity'
  | 'homeAddress'
  | 'homePhone'

  | 'workPlaceName'
  | 'workCity'
  | 'workAddress'
  | 'workPhone'

  | 'note1'
  | 'note2'

  // =========================================================
  // Test Specific
  // =========================================================
  | 'titleType'
  | 'fileFormationId'
  | 'admitId'
>;

/**
 * AdmissionAssignmentInput
 *
 * اطلاعات مربوط به تخصیص و مدیریت پذیرش شامل بخش،
 * تخت، پزشک، پذیرش اورژانس، بستری، پذیرش اولیه،
 * مسئول بیمار، پرداخت و ویرایش پذیرش.
 *
 * این type نیز تمامی فیلدهای مرتبط با عملیات پذیرش
 * را بدون وابستگی مستقیم به فیلدهای مورد استفاده فعلی نگهداری می‌کند.
 */
export type AdmissionAssignmentInput = Pick<
  Patient,
  // =========================================================
  // Patient Reference
  // =========================================================
  | 'nationalCode'
  | 'responsiblePatient'

  // =========================================================
  // Admission Assignment
  // =========================================================
  | 'ward'
  | 'wardId'
  | 'inpatientward'
  | 'inpatientWardId'
  | 'bed'
  | 'bedId'
  | 'doctor'
  | 'doctorId'
  | 'referenceDoctor'
  | 'referenceDoctorId'

  // =========================================================
  // Emergency Admission
  // =========================================================
  | 'emergencyWard'
  | 'emergencyWardId'
  | 'emergencyBed'
  | 'emergencyBedId'
  | 'emergencyDoctor'
  | 'emergencyDoctorId'
  | 'emergencyEditDoctor'
  | 'emergencyAdmitEditWard'
  | 'emergencyNo'
  | 'triageLevel'
  | 'accidentType'
  | 'entranceType'

  // =========================================================
  // Inpatient Admission
  // =========================================================
  | 'inpatientEditResponsiblePatient'
  | 'inpatientEditWard'
  | 'inpatientEditDoctor'
  | 'inpatientBed'
  | 'inpatientBedId'
  | 'inpatientAdmissionReason'

  // =========================================================
  // Pre-Admission
  // =========================================================
  | 'preadmitEditWard'
  | 'preadmitEditDoctor'
  | 'preadmitWard'
  | 'preadmitWardId'
  | 'preadmitBed'
  | 'preadmitBedId'

  // =========================================================
  // Payment / Cash / Pishpardakht
  // =========================================================
  | 'prepayment'
  | 'refundComment'
  | 'paymentAmount'
  | 'refundAmount'
  | 'paymentType'
  | 'cashType'

  // =========================================================
  // Admission Edit
  // =========================================================
  | 'admissionEditWard'
  | 'admissionEditDoctor'
  | 'admissionEditBed'
  | 'admissionEditResponsiblePatient'
>;
