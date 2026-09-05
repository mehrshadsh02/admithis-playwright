import { expect, test } from '../../fixtures/test';
import { AdmissionPage } from '../../pages/AdmissionPage';
import { CashPage } from '../../pages/CashPage';
import { insuredAdult } from '../../data/preadmit';
import { traumaPatient } from '../../data/emergency';
import { adultInpatient } from '../../data/inpatient';
import { CartableFlow } from '../../flows/CartableFlow';
import { ApiClient } from '../../Api/ApiClient';
import { PatientApi } from '../../Api/PatientApi';
import { Database } from '../../DB/Database';
import { validateEmergencyAdmission } from '../../DB/Validators/EmergencyValidator';
import type { EmergencyAdmissionState } from '../../models/EmergencyAdmissionState';
import * as allure from 'allure-js-commons';

export interface EmergencyCreateResult {
  admitId: number;
  admitDate: string;
  titleType: number;
  fileFormationId: number;
}

test('001-Search Patient Test', async ({ page, context }) => {
  await allure.epic('Admission');
  await allure.feature('Patient Search');
  await allure.story('Search Patient');
  await allure.severity('critical');
  await context.addCookies([
    {
      name: 'token',
      value: process.env.COOKIE_TOKEN!,
      domain: '192.168.5.19',
      path: '/',
    },
  ]);

  const admission = new AdmissionPage(page);

  await test.step('1. Open Admission Page', async () => {
    await admission.open();
  });

  await test.step('2. Search Patient', async () => {
    await admission.searchPatientWithStrategies(insuredAdult);
  }); 
}); 

test('002-Create,Edit and Cancel preadmit filing', async ({ page, context }) => {
  await allure.epic('Admission');
  await allure.feature('Create,Edit and Cancel preadmit');
  await allure.story('PreAdmit');
  await allure.severity('critical');

  await context.addCookies([
    {
      name: 'token',
      value: process.env.COOKIE_TOKEN!,
      domain: '192.168.5.19',
      path: '/',
    },
  ]);

  const admission = new AdmissionPage(page);
  const cash = new CashPage(page);

  await test.step('Create preadmit', async () => {

    await admission.open();

    await admission.searchPatient(insuredAdult.nationalCode);

    await admission.fillPatientInformation(insuredAdult);

    await admission.assignWardDoctorAndPrepayment(insuredAdult);

    await admission.saveAdmissionFiling();

    await admission.denyAdmitPrintPage();

    await expect(page).toHaveURL(/8019/);
  });

  await test.step('Pay Pishpardakht', async () => {
    await cash.payPatientByNationalCode(insuredAdult.nationalCode);
  });

  await test.step('Edit PreAdmit', async () => {
    await admission.open();

    await admission.openInPatientList();

    await admission.loadPreadmitPatientList();

    await admission.editPreadmitWardAndDoctor(insuredAdult);
  });

  await test.step('Cancel PreAdmit', async () => {

    await admission.openInPatientList();

    await admission.loadPreadmitPatientList();

    await admission.cancelPreadmit(insuredAdult.nationalCode);
  });

  await test.step('Refund Pishpardakht', async () => {
    await cash.refundPatientByNationalCode(insuredAdult.nationalCode, insuredAdult.refundComment);
  });
});

test('003-Create,Edit and Cancel Emergency filing', async ({ page, context, request }) => {
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
    wardIdIn: 0,
  };

  await test.step('Create Emergency Filing', async () => {
    const admission = new AdmissionPage(page);

    await admission.open();

    await admission.selectEmergencyUnderObservation();

    await admission.searchPatient(traumaPatient.nationalCode);

    await admission.fillPatientInformation(traumaPatient);

    await admission.assignEmergencyWardDoctor(traumaPatient);

    createResult = await admission.saveAdmissionFilingEmergency();

    await admission.confirmZeroPrepaymentIfVisible();

    await admission.denyAdmitPrintPage();

    await expect(page).toHaveURL(/8019/);
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

    const result = await patientApi.getPatientByAdmitId(emergencyState.admitId);

    emergencyState.diagnosisName = result.hisAdmitDto.diagnosis;

    emergencyState.insuranceId = result.hisAdmitDto.insuranceID;

    emergencyState.insuranceExpDate = result.hisAdmitDto.insuranceExpDate;

    emergencyState.bedId = result.hisAdmitDto.bedId;

    emergencyState.wardIdIn = result.hisAdmitDto.wardIdIn;
  });

  await test.step('Validate Emergency Database', async () => {
    const db = new Database();

    try {
      await db.connect();

      await validateEmergencyAdmission(db, emergencyState);
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

test('004-Create and Edit Inpatient filing', async ({ page, context }) => {
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

    // await admission.searchPatientWithStrategies(adultInpatient);
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
