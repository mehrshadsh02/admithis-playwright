import { expect, test } from '@playwright/test';
import { AdmissionPage } from '../../pages/AdmissionPage';
import { CashPage } from '../../pages/CashPage';
import { insuredAdult } from '../../data/preadmit';
import { traumaPatient } from '../../data/emergency';
import { adultInpatient } from '../../data/inpatient';
import { CartableFlow } from '../../flows/CartableFlow';
import type { Patient } from '../data/models/Patient';
import { ApiClient } from '../../Api/ApiClient';
import { PatientApi } from '../../Api/PatientApi';
import { Database } from '../../DB/Database';
import { validateEmergencyAdmission } from '../../DB/Validators/EmergencyValidator';
import type { EmergencyAdmissionState } from '../../models/EmergencyAdmissionState';

export interface EmergencyCreateResult {
  admitId: number;
  admitDate: string;
  titleType: number;
  fileFormationId: number;
}


test('001-Create,Edit and Cancel preadmit filing', async ({ page, context }) => {
  await context.addCookies([
    {
      name: 'token',
      value: process.env.COOKIE_TOKEN!,
      domain: '192.168.5.19',
      path: '/',
    },
  ]);

  await test.step('Create preadmit', async () => {
    const admission = new AdmissionPage(page);

    await admission.open();

    await admission.searchPatient(insuredAdult.nationalCode);

    await admission.fillPatientInformation(insuredAdult);

    await admission.assignWardDoctorAndPrepayment(insuredAdult);

    await admission.saveAdmissionFiling();

    await admission.denyAdmitPrintPage();

    await expect(page).toHaveURL(/8019/);
  });

  await test.step('Pay Pishpardakht', async () => {
    const cash = new CashPage(page);

    await cash.payPatientByNationalCode(insuredAdult.nationalCode);
  });

  await test.step('Edit PreAdmit', async () => {
    const admission = new AdmissionPage(page);
    
    await admission.openInPatientList();

    await admission.loadPreadmitPatientList();

    await admission.editPreadmitWardAndDoctor(insuredAdult);
  });

  await test.step('Cancel PreAdmit', async () => {
    const admission = new AdmissionPage(page);
    
    await admission.openInPatientList();

    await admission.loadPreadmitPatientList();

    await admission.cancelPreadmit(insuredAdult.nationalCode);
  });

  await test.step('Refund Pishpardakht', async () => {
    const cash = new CashPage(page);
    await cash.refundPatientByNationalCode(insuredAdult.nationalCode, insuredAdult.refundComment);
  });
});


test('002-Create,Edit and Cancel Emergency filing', async ({ page, context, request }) => {
  await context.addCookies([
    {
      name: 'token',
      value: process.env.COOKIE_TOKEN!,
      domain: '192.168.5.19',
      path: '/',
    },
  ]);

  let createResult: EmergencyCreateResult | undefined;

  // اطلاعاتی که برای DB Validation لازم داریم
  const emergencyState: EmergencyAdmissionState = {
    admitId: 0,
    admitDate: '',
    fileFormationId: 0,
    titleType: 0,
    diagnosisName: '',
    insuranceId: 0,
    insuranceExpDate: '',
    bedId: 0,
    wardIdIn:0,
  };

  await test.step('Create Emergency Filing', async () => {
    const admission = new AdmissionPage(page);

    await admission.open();

    await admission.selectEmergencyUnderObservation();

    await admission.searchPatient(traumaPatient.nationalCode);

    await admission.fillPatientInformation(traumaPatient);

    await admission.assignEmergencyWardDoctor(traumaPatient);

    // await admission.saveAdmissionFilingEmergency();

    // const result = await admission.saveAdmissionFiling();
    createResult = await admission.saveAdmissionFilingEmergency();

    await admission.confirmZeroPrepaymentIfVisible();

    await admission.denyAdmitPrintPage();

    await expect(page).toHaveURL(/8019/);

    // return result;
  });

 await test.step('Get Emergency Patient Data', async () => {
    if (!createResult) {
      throw new Error('Emergency admission create result was not captured.');
    }

    emergencyState.admitId = createResult.admitId;
    emergencyState.admitDate = createResult.admitDate;
    emergencyState.fileFormationId = createResult.fileFormationId;
    emergencyState.titleType = createResult.titleType;

    const apiClient = new ApiClient(request);
    const patientApi = new PatientApi(apiClient);

    const result = await patientApi.getPatientByAdmitId(
      emergencyState.admitId
    );

    emergencyState.diagnosisName =
      result.hisAdmitDto.diagnosis;

    emergencyState.insuranceId =
      result.hisAdmitDto.insuranceID;

    emergencyState.insuranceExpDate =
      result.hisAdmitDto.insuranceExpDate;

    emergencyState.bedId =
      result.hisAdmitDto.bedId;

    emergencyState.wardIdIn =
      result.hisAdmitDto.wardIdIn;  
  });

  await test.step('Validate Emergency Database', async () => {
    const db = new Database();

    try {
      await db.connect();

      await validateEmergencyAdmission(
        db,
        emergencyState
      );
    } finally {
      await db.close();
    }
  });

  await test.step('Edit Emergency Admit', async () => {
    const admission = new AdmissionPage(page);
    
    await admission.openEmengencyPatientList();

    await admission.editEmergencyPatientInformation(traumaPatient);
  });

  await test.step('Patient Admission Order From Cartable', async () => {
    const cartable = new CartableFlow(page);

    await cartable.locateAndOpenPatientAdmission(traumaPatient.nationalCode);
 
  });

  await test.step('Edit PreAdmit', async () => {
    const admission = new AdmissionPage(page);
    
    await admission.openEmengencyPatientList();

    await admission.sendtowardEmergencyPatient(traumaPatient);

    await admission.fillinformationEmergencyPatienttosendtoward(traumaPatient);

  });
});

test('003-Create and Edit Inpatient filing', async ({ page, context }) => {
  await context.addCookies([
    {
      name: 'token',
      value: process.env.COOKIE_TOKEN!,
      domain: '192.168.5.19',
      path: '/',
    },
  ]);

  await test.step('Create Inpatient', async () => {
    const admission = new AdmissionPage(page);

    await admission.open();

    await admission.searchPatient(adultInpatient.nationalCode);

    await admission.fillPatientInformationforInapatient(adultInpatient);

    await admission.assignInpatientWardDoctor(adultInpatient);

    await admission.saveAdmissionFiling();

    await admission.confirmZeroPrepaymentIfVisible();

    await admission.denyAdmitPrintPage();

    await expect(page).toHaveURL(/8019/);
  });

  await test.step('Edit Inpatient Admit', async () => {
    const admission = new AdmissionPage(page);
    
    await admission.openInPatientList();

    await admission.editInpatientInsur(adultInpatient);
  });

});

