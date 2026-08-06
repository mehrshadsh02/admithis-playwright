import { expect, test } from '@playwright/test';
import { AdmissionPage } from '../../pages/AdmissionPage';
import { CashPage } from '../../pages/CashPage';
import { insuredAdult } from '../../data/preadmit';
import { traumaPatient } from '../../data/emergency';

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

    await admission.cancelPreadmit(insuredAdult.nationalCode);
  });

  await test.step('Refund Pishpardakht', async () => {
    const cash = new CashPage(page);
    await cash.refundPatientByNationalCode(insuredAdult.nationalCode, insuredAdult.refundComment);
  });
});


test('002-Create,Edit and Cancel Emergency filing', async ({ page, context }) => {
  await context.addCookies([
    {
      name: 'token',
      value: process.env.COOKIE_TOKEN!,
      domain: '192.168.5.19',
      path: '/',
    },
  ]);

  await test.step('Create Emergency Filing', async () => {
    const admission = new AdmissionPage(page);

    await admission.open();

    await admission.searchPatient(traumaPatient.nationalCode);

    await admission.fillPatientInformation(traumaPatient);

    await admission.assignWardDoctorAndPrepayment(traumaPatient);

    await admission.saveAdmissionFiling();

    await admission.denyAdmitPrintPage();

    await expect(page).toHaveURL(/8019/);
  });

  // await test.step('Pay Pishpardakht', async () => {

  // });

  // await test.step('Edit PreAdmit', async () => {
 
  // });

  // await test.step('Refund Pishpardakht', async () => {
    
  // });
});

