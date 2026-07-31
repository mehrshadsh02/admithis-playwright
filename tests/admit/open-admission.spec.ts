import { expect, test } from '@playwright/test';
import { AdmissionPage } from '../../pages/AdmissionPage';
import { CashPage } from '../../pages/CashPage';
import { patient } from '../../data/patient';

test('001-Create preadmit filing and deny print page', async ({ page, context }) => {
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

    await admission.searchPatient(patient.nationalCode);

    await admission.fillPatientInformation(patient);

    await admission.assignWardDoctorAndPrepayment(patient);

    await admission.saveAdmissionFiling();

    await admission.denyAdmitPrintPage();

    await expect(page).toHaveURL(/8019/);
  });

  await test.step('Pay Pishpardakht', async () => {
    const cash = new CashPage(page);

    await cash.payPatientByNationalCode(patient.nationalCode);
  });

  await test.step('Pay Pishpardakht2', async () => {
    const admission = new AdmissionPage(page);
    
    await admission.openInpatientList();

    await admission.loadPreadmitPatientList();

    await admission.editPreadmitWardAndDoctor(patient);

    await admission.cancelPreadmit(patient.nationalCode);

  });

  await test.step('Pay Pishpardakht3', async () => {
     const cash = new CashPage(page);
     await cash.refundPatientByNationalCode(patient.nationalCode, patient.refundComment);
  
  });



 
});

