export interface Patient {
  nationalCode: string;

  maritalStatus: string;
  insuranceRelation: string;

  mobile: string;
  address: string;

  accompanyName: string;
  accompanyRelation: string;
  accompanyMobile: string;

  firstRecognition: string;
  howToRefer: string;
  causeOfHospitalization: string;

  ward: string;
  doctor: string;
  responsiblePatient: string;

  prepayment: string;
}

export const patient: Patient = {
  nationalCode: '1520554001',

  maritalStatus: 'مجرد',
  insuranceRelation: 'خود فرد',

  mobile: '09383509316',
  address: 'dfgdfgdfgd',

  accompanyName: 'مهرشاد شیخ الاسلامی',
  accompanyRelation: 'خود فرد',
  accompanyMobile: '09383586316',

  firstRecognition: 'شکستگی',
  howToRefer: 'وسیله شخصی',
  causeOfHospitalization: 'دل درد',

  ward: 'اطفال 2 - تخت خالی',
  doctor: 'Siavash Siavash',
  responsiblePatient: 'خود فرد',

  prepayment: '10000',
};