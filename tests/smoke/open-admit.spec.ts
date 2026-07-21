import { expect, test } from '@playwright/test';

test('Open AdmitHis with token', async ({ page, context }) => {
  await context.addCookies([
    {
      name: 'token',
      value: process.env.COOKIE_TOKEN!,
      domain: '192.168.5.19',
      path: '/',
    },
  ]);

  await page.goto(process.env.ADMITHIS_APP_URL!);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveURL(/8019/);
  await expect(page.locator('input[formcontrolname="nationalCode"]')).toBeVisible();
});
