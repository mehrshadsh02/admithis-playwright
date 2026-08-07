import { type Page } from '@playwright/test';
import { CartablePage } from '../pages/CartablePage';

export class CartableFlow {
  private readonly cartablePage: CartablePage;

  constructor(private readonly page: Page) {
    this.cartablePage = new CartablePage(this.page);
  }

  /**
   * جریان کامل پیدا کردن بیمار در کارتابل و ورود به فرم ویرایش/پذیرش
   */
  async locateAndOpenPatientAdmission(nationalCode: string): Promise<void> {

    await this.cartablePage.open();

    await this.cartablePage.searchPatientByNationalCode(nationalCode);

    await this.cartablePage.clickPatientAdmissionOrder();

    await this.cartablePage.confirmAdmissionOrder();

  }
}
