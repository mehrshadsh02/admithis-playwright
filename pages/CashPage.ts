import { type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CashLocator } from '../locators/CashLocator';

export class CashPage extends BasePage {
  private readonly locator = new CashLocator(this.page);

  constructor(page: Page) {
    super(page);

    // Prevent Chrome print dialog / preview
    this.page.context().addInitScript(() => {
      Object.defineProperty(globalThis, 'print', {
        value: () => {},
        writable: false,
      });
    });

    // Prevent receipt popup from blocking the test
    this.page.on('popup', async (popup) => {
      try {
        console.log(
          `[CashPage] Popup detected: ${popup.url()}`
        );

        await popup.waitForLoadState('domcontentloaded').catch(
          () => {}
        );

        if (!popup.isClosed()) {
          await popup.close();

          console.log(
            '[CashPage] Receipt popup closed.'
          );
        }
      } catch (error) {
        console.log(
          '[CashPage] Popup handling error:',
          error
        );
      }
    });
  }

  async open(): Promise<void> {
    const cashAppUrl = process.env.CASH_APP_URL;

    if (!cashAppUrl) {
      throw new Error('CASH_APP_URL is required to open the Cash app.');
    }

    // await this.page.addInitScript('window.print = () => {};');

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

    console.log(
      `[ACTION] Searching for patient with National Code: ${nationalCode}`
    );

    const [response] = await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes('/api/Cash/GetPatients') &&
          res.request().method() === 'POST',
        { timeout: 30_000 }
      ),
      this.locator.searchButton.click()
    ]);

    if (!response.ok()) {
      throw new Error(
        `[CashPage] GetPatients API failed: ${response.status()} ${response.statusText()}`
      );
    }

    const responseBody = await response.json();

    if (
      !responseBody.isSuccess ||
      !Array.isArray(responseBody.resultObject)
    ) {
      throw new Error(
        `[CashPage] Invalid GetPatients response for national code: ${nationalCode}`
      );
    }

    if (responseBody.resultObject.length === 0) {
      throw new Error(
        `بازپرداخت بیمار در صندوق مشاهده نشد - کد ملی: ${nationalCode}`
      );
    }

    await this.locator
      .rowByNationalCode(nationalCode)
      .waitFor({ state: 'visible' });

    console.log(`[SUCCESS] Patient found and row is visible.`);
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
