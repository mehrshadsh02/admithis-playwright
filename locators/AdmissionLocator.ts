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
    // return this.page.getByRole('textbox', { name: 'کد ملی/پاسپورت' });
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

  get shebaNo(): Locator {
  return this.page.locator('input[formcontrolname="shebaNo"]');
  }

  get shebaOwner(): Locator {
    return this.page.locator('input[formcontrolname="shebaOwner"]');
  }

  get missedSheba(): Locator {
    return this.page.locator('mat-checkbox[formcontrolname="missedSheba"]');
  }

  get missedShebaLabel(): Locator {
    return this.page.locator(
      'mat-checkbox[formcontrolname="missedSheba"] label.mat-checkbox-layout'
    );
  }

  get missedShebaInput(): Locator {
    return this.page.locator(
      'mat-checkbox[formcontrolname="missedSheba"] input[type="checkbox"]'
    );
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

  get spinner(): Locator {
  return this.page.locator('app-spinner .back-spenner');
  }

  get listSearchButton(): Locator {
    return this.page.locator('button.mat-tooltip-trigger.btn.btn-warning');
  }

  get visibleRowActionButton(): Locator {
    return this.page.locator('button.mat-tooltip-trigger.btn-action.ng-star-inserted');
  }

  // get editButton(): Locator {
  //   return this.page.locator('button.mat-tooltip-trigger.btn.btn-edit1');
  // }

  get editButton(): Locator {
    return this.page.locator('button').filter({has: this.page.locator('mat-icon', { hasText: 'edit' })});
  }

  get cancelButton(): Locator {
    return this.page.locator(
      "xpath=//button[not(@hidden) and .//mat-icon[normalize-space(.)='cancel']]",
    );
  }

  get confirmYesButton(): Locator {
    return this.page.locator('button.swal2-confirm').filter({ hasText: 'بله' });
  }

  get admissionActionsButton(): Locator {
  return this.page.locator('button[aria-label="Example icon-button with a menu"]');
  }

  get cancelAdmissionMenuItem(): Locator {
    return this.page.locator('button[mat-menu-item]').filter({ hasText: 'لغو پذیرش' });
  }

  get emergencyUnderSprevisionCheckbox(): Locator {
    return this.page.locator('mat-checkbox[formcontrolname="emergencyUnderSprevision"]');
  }

  get zeroPrepaymentDialog(): Locator {
    return this.page.locator('.swal2-popup').filter({hasText: 'مبلغ پیش پرداخت صفر است',});
  }

  get zeroPrepaymentConfirmButton(): Locator {
    return this.zeroPrepaymentDialog.getByRole('button', {name: 'بله',exact: true,});
  }

  get EmergencyPatientListLink(): Locator {
    return this.page.locator("//img[@src='assets/icons/patients-monitored.svg']/ancestor::a");
  }
  
  
}
