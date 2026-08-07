export interface Patient {
  // فیلدهای پایه و هویتی (اجباری برای همه سناریوها)
  nationalCode: string;
  mobile: string;
  address: string;

  // اطلاعات بیمه‌ای و عمومی (اختیاری بر اساس سناریو)
  maritalStatus: string;
  insuranceRelation: string;
  responsiblePatient: string;

  // اطلاعات بانکی (اختیاری)
  ShabaNo: string;
  BankAcountName: string;

  // اطلاعات همراه بیمار (اختیاری)
  accompanyName: string;
  accompanyRelation: string;
  accompanyMobile: string;

  // اطلاعات بالینی عمومی (اختیاری)
  firstRecognition: string;
  howToRefer: string;
  causeOfHospitalization: string;
  patientClass: string;

  // اطلاعات پذیرش و بخش (اختیاری)
  ward: string;
  inpatientward:string;
  bed: string;
  doctor: string;
  prepayment: string;
  refundComment: string;

  // فیلدهای اختصاصی سناریوی پیش‌پذیرش (Preadmit)
  preadmitEditWard: string;

  emergencyEditDoctor: string;

  // فیلدهای اختصاصی سناریوی اورژانس (Emergency)
  emergencyAdmitEditWard?: string; 
  triageLevel?: string;            
  accidentType?: string;           
  
  // فیلدهای اختصاصی سناریوی بستری (Inpatient)
  inpatientEditResponsiblePatient?: string;
}
