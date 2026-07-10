import { test, expect } from '@playwright/test';

test('Open Landing with token', async ({ page, context }) => {
  await context.addCookies([
    {
      name: 'token',
      value: process.env.COOKIE_TOKEN!,
      domain: '192.168.5.19',
      path: '/',
    },
  ]);

  await page.goto('/');

  await expect(page).toHaveURL(/1201/);
});