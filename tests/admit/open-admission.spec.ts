import { expect, test } from '@playwright/test';
import { AdmissionPage } from '../../pages/AdmissionPage';
import { patient } from '../../data/patient';

test('Open Filing Page', async ({ page, context }) => {
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

  await expect(page).toHaveURL(/8019/);
});

