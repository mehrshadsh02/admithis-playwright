import { type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CashLocator } from '../locators/CashLocator';

export class CashPage extends BasePage {
  private readonly locator = new CashLocator(this.page);

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    const cashAppUrl = process.env.CASH_APP_URL;

    if (!cashAppUrl) {
      throw new Error('CASH_APP_URL is required to open the Cash app.');
    }

    await this.page.goto(cashAppUrl);

    await this.page.evaluate(() => {
      localStorage.setItem('mac', '1');
    });
    
    await this.page.reload();
    await this.waitForPageReady();
  }

  async searchPatientByNationalCode(nationalCode: string): Promise<void> {
    await this.locator.nationalCode.waitFor({ state: 'visible' });
    await this.locator.nationalCode.fill(nationalCode);
    await this.locator.searchButton.click();
    await this.waitForPageReady();
    await this.locator.rowByNationalCode(nationalCode).waitFor({ state: 'visible' });
  }

  async payPatientByNationalCode(nationalCode: string): Promise<void> {
    await this.open();
    await this.searchPatientByNationalCode(nationalCode);
    await this.locator.rowByNationalCode(nationalCode).dblclick();
    await this.locator.paymentButton.waitFor({ state: 'visible' });
    await this.locator.paymentButton.click();
    await this.waitForPageReady();
    await this.locator.confirmYesButton.click();
    await this.waitForPageReady();
  }

  async refundPatientByNationalCode(nationalCode: string, comment: string): Promise<void> {
    await this.open();
    await this.searchPatientByNationalCode(nationalCode);
    await this.locator.rowByNationalCode(nationalCode).dblclick();
    await this.locator.refundComment.fill(comment);
    await this.locator.refundButton.waitFor({ state: 'visible' });
    await this.locator.refundButton.click();
    await this.waitForPageReady();
    await this.locator.confirmYesButton.click();
    await this.waitForPageReady();
  }
}
