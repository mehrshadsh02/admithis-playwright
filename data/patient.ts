export interface Patient {
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
  preadmitEditWard: string;
  doctor: string;
  responsiblePatient: string;
  inpatientEditResponsiblePatient: string;

  prepayment: string;
  refundComment: string;
}

export const patient: Patient = {
  nationalCode: '1520554001',

  maritalStatus: 'مجرد',
  insuranceRelation: 'خود فرد',

  mobile: '09383509316',
  address: 'dfgdfgdfgd',

  ShabaNo: '012025000001425236252145',
  BankAcountName: 'مهرشاد شیخ الاسلامی',

  accompanyName: 'مهرشاد شیخ الاسلامی',
  accompanyRelation: 'خود فرد',
  accompanyMobile: '09383586316',

  firstRecognition: 'شکستگی',
  howToRefer: 'وسیله شخصی',
  causeOfHospitalization: 'دل درد',
  patientClass: 'بستری',

  ward: 'اطفال 2 - تخت خالی',
  bed: 'اتاق1 - تخت عمومي - تخت18',
  preadmitEditWard: 'اطفال 2 - تخت خالی',
  doctor: 'Siavash Siavash',
  responsiblePatient: 'خود فرد',
  inpatientEditResponsiblePatient: 'همسر',

  prepayment: '10000',
  refundComment: 'test',
};
