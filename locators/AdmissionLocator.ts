import { type Locator, type Page } from '@playwright/test';

export class AdmissionLocator {
  constructor(private readonly page: Page) {}

  get nationality(): Locator {
  return this.page.locator(
    '.nationality-select > .ng-select-container > .ng-arrow-wrapper',);
  }

  get iranianOption(): Locator {
  return this.page
    .getByLabel('Options list')
    .getByText('ایرانی', { exact: true });
  }

  get nationalCode(): Locator {
    return this.page.locator("input[formcontrolname='nationalCode']");
  }

  get identityInquiryButton(): Locator {
    return this.page.getByRole('button', { name: 'استعلام هویت' });
  }
}