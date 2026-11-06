import { type Page, type Locator } from '@playwright/test';

export class LandingLocators {
  readonly loginForm: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly captchaInput: Locator;
  readonly refreshCaptchaButton: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.loginForm = page.locator('form#login');
    
    // استفاده از formcontrolname و id ثابت برای پایداری ۱۰۰ درصدی در Angular
    this.usernameInput = page.locator('input#username[formcontrolname="UserName"]');
    this.passwordInput = page.locator('input[formcontrolname="Psw"]');
    this.captchaInput = page.locator('input[formcontrolname="Captcha"]');
    
    // دکمه رفرش کپچا (در صورت نیاز) و دکمه ورود
    this.refreshCaptchaButton = page.locator('button.btn-refresh');
    this.loginButton = page.locator('button#verify');
  }
}