import { type Locator, type Page } from '@playwright/test';

export class AdmissionLocator {
  constructor(private readonly page: Page) {}

  get nationality(): Locator {
    return this.page.locator('.nationality-select > .ng-select-container > .ng-arrow-wrapper');
  }

  get iranianOption(): Locator {
    return this.page.getByLabel('Options list').getByText('ایرانی', { exact: true });
  }

  get nationalCode(): Locator {
    return this.page.locator("input[formcontrolname='nationalCode']");
  }

  get identityInquiryButton(): Locator {
    return this.page.getByRole('button', { name: 'استحقاق درمان' });
  }

  get searchButton(): Locator {
    return this.page.locator('#button-addon3');
  }

  get maritalStatus(): Locator {
    return this.page.locator('[formcontrolname="maritalStatus"] .ng-select-container');
  }

  get insuranceRelation(): Locator {
    return this.page.locator('[formcontrolname="insurRelation"] .ng-select-container');
  }

  get mobileNumber(): Locator {
    return this.page.locator('input[formcontrolname="mobileNumber"]');
  }

  get address(): Locator {
    return this.page.locator('input[formcontrolname="address"]');
  }

  get accompanyFullName(): Locator {
    return this.page.locator('input[formcontrolname="accompanyfullName"]');
  }

  get accompanyMobileNumber(): Locator {
    return this.page.locator('input[formcontrolname="accompanyMobileNumber"]');
  }

  get showClinicalFieldsButton(): Locator {
    return this.page.locator('#button-addon2');
  }

  get prepayment(): Locator {
    return this.page.locator('input[formcontrolname="prepayment"]');
  }

  get saveFileButton(): Locator {
    return this.page.locator('button.btn-saveFile');
  }

  get denyPrintButton(): Locator {
    return this.page.locator('button.swal2-deny.swal2-styled');
  }

  get inpatientListLink(): Locator {
    return this.page.locator("//img[@src='assets/icons/inpatient.svg']/ancestor::a");
  }

  get preadmitListCheckbox(): Locator {
    return this.page.locator("xpath=//span[contains(@class,'mat-checkbox-inner-container')]");
  }

  get listSearchButton(): Locator {
    return this.page.locator('button.mat-tooltip-trigger.btn.btn-warning');
  }

  get visibleRowActionButton(): Locator {
    return this.page.locator('button.mat-tooltip-trigger.btn-action.ng-star-inserted');
  }

  get editButton(): Locator {
    return this.page.locator('button.mat-tooltip-trigger.btn.btn-edit1');
  }

  get cancelButton(): Locator {
    return this.page.locator(
      "xpath=//button[not(@hidden) and .//mat-icon[normalize-space(.)='cancel']]",
    );
  }

  get confirmYesButton(): Locator {
    return this.page.locator('button.swal2-confirm').filter({ hasText: 'بله' });
  }
}
