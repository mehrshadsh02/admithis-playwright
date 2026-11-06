import { type Page, expect } from '@playwright/test';
import { LandingLocators } from '../locators/Landing.Locator';
import fs from 'fs';
import path from 'path';

export class LandingPage {
  readonly page: Page;
  readonly locators: LandingLocators;

  constructor(page: Page) {
    this.page = page;
    this.locators = new LandingLocators(page);
  }

  /**
   * باز کردن صفحه لندینگ، لاگین از طریق فرم Angular و استخراج توکن از ریسپانس شبکه
   */
  async loginAndGetToken(): Promise<string> {
    const baseUrl = process.env.LANDING_APP_URL || 'http://192.168.5.19:1201';
    const loginUrl = `${baseUrl.replace(/\/$/, '')}/login`;

    const username = process.env.LANDING_USERNAME || '30627';
    const password = process.env.LANDING_PASSWORD || '09383509316';
    const captcha = process.env.LANDING_CAPTCHA || '1';

    await this.page.goto(loginUrl, { waitUntil: 'domcontentloaded' });

    // اطمینان از لود شدن فرم لاگین
    await expect(this.locators.loginForm).toBeVisible();

    // پر کردن فیلدهای نام کاربری، گذرواژه و کد امنیتی
    await this.locators.usernameInput.fill(username);
    await this.locators.passwordInput.fill(password);
    await this.locators.captchaInput.fill(captcha);

    // اطمینان از اینکه فرم Angular معتبر شده و دکمه ورود از حالت disabled خارج شده است
    await expect(this.locators.loginButton).toBeEnabled();

    // شنود درخواست لاگین قبل از کلیک روی دکمه ورود
    const loginResponsePromise = this.page.waitForResponse(
      (res) => res.url().includes('/api/his/couldlogin') && res.request().method() === 'POST',
      { timeout: 20000 }
    );

    await this.locators.loginButton.click();

    const response = await loginResponsePromise;
    expect(response.ok(), `خطا در پاسخ وب‌سرویس لاگین: Status ${response.status()}`).toBeTruthy();

    const body = await response.json();
    expect(body.isSuccess, `لاگین انجام نشد: ${body.message}`).toBe(true);

    const token: string = body?.data?.userCouldSignin?.token;
    expect(token, 'فیلد token در پاسخ سرور وجود نداشت!').toBeTruthy();

    return token;
  }

  /**
   * آپدیت خودکار متغیرهای COOKIE_TOKEN و AUTH_BEARER در فایل .env و process.env
   */
  updateTokensInEnvFile(token: string): void {
    const bearerValue = `bearer ${token}`;

    // ۱. آپدیت در حافظه جاری برای اجرای فعلی
    process.env.COOKIE_TOKEN = token;
    process.env.AUTH_BEARER = bearerValue;

    // ۲. نوشتن داخل فایل .env پروژه
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';

    envContent = this.upsertEnvVariable(envContent, 'COOKIE_TOKEN', token);
    envContent = this.upsertEnvVariable(envContent, 'AUTH_BEARER', bearerValue);

    fs.writeFileSync(envPath, envContent, 'utf-8');
  }

  private upsertEnvVariable(content: string, key: string, value: string): string {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      return content.replace(regex, `${key}=${value}`);
    }
    return `${content.trimEnd()}\n${key}=${value}\n`;
  }
}