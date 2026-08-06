export interface EmergencyAdmit_Patient {
  nationalCode: string;

  maritalStatus: string;
  insuranceRelation: string;

  mobile: string;
  address: string;

  ShabaNo: string;
  BankAcountName: string;

  accompanyName: string;
  accompanyRelation: string;
  accompanyMobile: string;

  firstRecognition: string;
  howToRefer: string;
  causeOfHospitalization: string;
  patientClass: string;

  ward: string;
  bed: string;
  EmergencyAdmitEditWard: string;
  doctor: string;
  responsiblePatient: string;
  inpatientEditResponsiblePatient: string;

  prepayment: string;
  refundComment: string;
}

export const EmergencyAdmit_Patient: EmergencyAdmit_Patient = {
  nationalCode: '1671637801',

  maritalStatus: 'متاهل',
  insuranceRelation: 'خود فرد',

  mobile: '09196964067',
  address: 'dfgdfgdfgd',

  ShabaNo: '012025000001425236252145',
  BankAcountName: 'پرویز پیرزاده',

  accompanyName: 'پرویز پیرزاده',
  accompanyRelation: 'خود فرد',
  accompanyMobile: '09383586316',

  firstRecognition: 'شکستگی',
  howToRefer: 'وسیله شخصی',
  causeOfHospitalization: 'دل درد',
  patientClass: 'بستری',

  ward: 'اورژانس تحت نظر - تخت خالی',
  bed: 'اتاق1 - تخت عمومي - تخت22',
  EmergencyAdmitEditWard: 'بستری موقت کرونا - تخت خالی',
  doctor: 'Siavash Siavash',
  responsiblePatient: 'اورژانس',
  inpatientEditResponsiblePatient: 'همسر',

  prepayment: '',
  refundComment: 'test',
};
