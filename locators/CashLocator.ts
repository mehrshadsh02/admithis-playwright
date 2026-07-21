import { type Locator, type Page } from '@playwright/test';

export class CashLocator {
  constructor(private readonly page: Page) {}

  get nationalCode(): Locator {
    return this.page.locator("input[formcontrolname='nationalCode']");
  }

  get searchButton(): Locator {
    return this.page.locator("button.btn-warning:has(mat-icon:text('search'))");
  }

  rowByNationalCode(nationalCode: string): Locator {
    return this.page.locator('tr').filter({ hasText: nationalCode }).first();
  }

  get paymentButton(): Locator {
  return this.page.getByRole('button', { name: 'پرداخت', exact: true });
  }

  get refundComment(): Locator {
    return this.page.locator("input[formcontrolname='comment']");
  }

  get refundButton(): Locator {
    return this.page.getByRole('button', { name: 'بازپرداخت' });
  }

  get confirmYesButton(): Locator {
    return this.page.locator('button.swal2-confirm').filter({ hasText: 'بله' });
  }
}
