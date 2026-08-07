import { type Page, type Locator } from '@playwright/test';

export class CartableLocator {
  constructor(private readonly page: Page) {}

  get nationalCodeFilter(): Locator {
    return this.page.locator('input[formcontrolname="nationalCode"]').first();
  }

  get wardSelect(): Locator {
    return this.page.locator('ng-select[formcontrolname="ward"]');
  }

  get wardSelectInput(): Locator {
    return this.page.locator('ng-select[formcontrolname="ward"] input');
  }


  get searchButton(): Locator {
    return this.page.locator('button').filter({has: this.page.locator('mat-icon', { hasText: 'search' })});
  }

  get editButtons(): Locator {
    return this.page.locator('button').filter({has: this.page.locator('mat-icon', { hasText: 'edit' })});
  }
  
  get firstRow(): Locator {
    return this.page.locator('table tbody tr').first();
  }

  rowByNationalCode(nationalCode: string): Locator {
    return this.page.locator('tr').filter({ hasText: nationalCode }).first();
  }

  get patientAdmissionOrderCard(): Locator {
    return this.page.locator('img[alt="PatientAdmissionOrder"]').locator('xpath=ancestor::div[contains(@class, "card")]');
  }

  get patientAdmissionOrderTitle(): Locator {
    return this.patientAdmissionOrderCard.locator('p.text-color');
  }

  get swalConfirmButton(): Locator {
    return this.page.locator(
      '.swal2-actions button.swal2-confirm'
    );
  }
}
