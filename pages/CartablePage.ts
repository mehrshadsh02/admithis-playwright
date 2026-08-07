import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartableLocator } from '../locators/CartableLocator';

export class CartablePage extends BasePage {
  public readonly locator: CartableLocator;

  constructor(page: Page) {
    super(page);
    this.locator = new CartableLocator(this.page);
  }

  /**
   * باز کردن صفحه کارتابل با استفاده از URL محیطی اختصاصی
   */
  async open(): Promise<void> {
    const targetUrl = process.env.CARTABLE_APP_URL || 'http://192.168.5.19:8021';
    await this.goto(targetUrl);
    await this.waitForPageReady();
  }

  async selectWard(wardName: string): Promise<void> {
    await this.safeClick(this.locator.wardSelect);
    await this.safeFill(this.locator.wardSelectInput, wardName);

    const option = this.page.locator('.ng-dropdown-panel .ng-option', {
      hasText: wardName,
    }).first();

    await expect(option).toBeVisible({ timeout: 10000 });
    await this.safeClick(option);
    await this.waitForPageReady();
  }

  /**
   * جستجوی بیمار با کد ملی در کارتابل
   */
  async searchPatientByNationalCode(nationalCode: string): Promise<void> {
    await this.selectWard('اورژانس تحت نظر');
    await this.safeFill(this.locator.nationalCodeFilter, nationalCode);
    await this.safeClick(this.locator.searchButton);
    await this.waitForPageReady();
    await this.locator.rowByNationalCode(nationalCode).dblclick();
    await this.waitForPageReady();
  }

  async confirmAdmissionOrder(): Promise<void> {
    await expect(this.locator.swalConfirmButton).toBeVisible({ timeout: 10000 });
    // بررسی اینکه دکمه حاوی متن "ذخیره" باشد
    await expect(this.locator.swalConfirmButton).toHaveText('ذخیره');
    await this.safeClick(this.locator.swalConfirmButton);
    await this.waitForPageReady();
  }

  async clickPatientAdmissionOrder(): Promise<void> {
    console.log('[CARTABLE] Waiting for cartable page...');

    await this.waitForPageReady();

    const cartableLanding = this.page.locator('app-cartable-landing');

    await cartableLanding.waitFor({
      state: 'attached',
      timeout: 60000,
    });

    const target = cartableLanding.getByText(
      /بستری\s+بیمار\s+تحت\s+نظر/
    ).first();

    await target.waitFor({
      state: 'visible',
      timeout: 30000,
    });

    await target.scrollIntoViewIfNeeded({
      timeout: 15000,
    });

    await target.click({
      timeout: 15000,
    });

    await this.waitForPageReady();
  }
}
