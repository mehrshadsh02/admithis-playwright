import { expect, test } from '@playwright/test';
import { AdmissionPage } from '../../pages/AdmissionPage';
import { CashPage } from '../../pages/CashPage';
import { patient } from '../../data/patient';


test('Create preadmit filing and deny print page', async ({ page, context }) => {
  await context.addCookies([
    {
      name: 'token',
      value: process.env.COOKIE_TOKEN!,
      domain: '192.168.5.19',
      path: '/',
    },
  ]);

  const admission = new AdmissionPage(page);

  await admission.open();

  await admission.searchPatient(patient.nationalCode);

  await admission.fillPatientInformation(patient);

  await admission.assignWardDoctorAndPrepayment(patient);

  await admission.saveAdmissionFiling();

  await admission.denyAdmitPrintPage();

  await expect(page).toHaveURL(/8019/);

  const cash = new CashPage(page);

  await cash.payPatientByNationalCode(patient.nationalCode);

  await admission.openInpatientList();

  await admission.loadPreadmitPatientList();

  await admission.editPreadmitWardAndDoctor(patient);

  await admission.cancelPreadmit(patient.nationalCode);

  await cash.refundPatientByNationalCode(patient.nationalCode, patient.refundComment);
});
