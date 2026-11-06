import { test as setup } from '@playwright/test';
import { LandingPage } from '../../pages/LandingPage';

setup('Auto Login on Landing and update .env token', async ({ page }) => {
  const landingPage = new LandingPage(page);

  // ۱. انجام لاگین در صفحه http://192.168.5.19:1201/login و گرفتن توکن
  const token = await landingPage.loginAndGetToken();

  // ۲. قرار دادن توکن در فایل .env (نام کلید دقیق فایل .env خودتان را اینجا بگذارید)
  landingPage.updateTokensInEnvFile(token);
});