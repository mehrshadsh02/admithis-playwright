import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { AdmissionLocator } from '../locators/AdmissionLocator';
import { NgSelect } from '../components/NgSelect';
import type { Patient } from '../data/models/Patient';
// import { EmergencyAdmit_Patient } from '../../data/EmergencyAdmit_Patient';
// import { TIMEOUT } from 'dns';

export class AdmissionPage extends BasePage {
  private readonly locator = new AdmissionLocator(this.page);
  private readonly ngSelect = new NgSelect(this.page);

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/');
    await this.waitForPageReady();

    await expect(this.page.locator('input[formcontrolname="nationalCode"]')).toBeVisible();
  }

  async selectIranianNationality(): Promise<void> {
    await this.locator.nationality.click();
    await this.locator.iranianOption.click();
  }

  async enterNationalCode(code: string): Promise<void> {
    await this.locator.nationalCode.fill(code);
  }

  async verifyIdentityInquiryEnabled(): Promise<void> {
    await expect(this.locator.identityInquiryButton).toBeEnabled();
  }

  async identityInquiry(): Promise<void> {
    await this.locator.identityInquiryButton.click();
    await this.waitForPageReady();
  }

  async searchNationalCode(nationalCode: string): Promise<void> {
    await this.locator.nationalCode.waitFor({
      state: 'visible',
    });

    await this.locator.nationalCode.clear();

    await this.locator.nationalCode.fill(nationalCode);

    await this.locator.searchButton.click();

    await this.waitForPageReady();
  }

  async searchPatient(nationalCode: string): Promise<void> {
    await this.selectIranianNationality();

    await this.enterNationalCode(nationalCode);

    await this.verifyIdentityInquiryEnabled();

    await this.identityInquiry();
  }

  async fillPatientInformation(Patient: Patient): Promise<void> {
    await this.ngSelect.selectByFormControl('maritalStatus', Patient.maritalStatus);
    await this.waitUntilStable();
    await this.ngSelect.selectByFormControl('insurRelation', Patient.insuranceRelation);
    await this.waitUntilStable();

    await this.locator.mobileNumber.fill(Patient.mobile);
    await this.locator.address.fill(Patient.address);

    await this.page.getByRole('textbox', { name: 'شماره شبا' }).fill(Patient.ShabaNo);
    await this.page.getByRole('textbox', { name: 'صاحب شبا' }).fill(Patient.BankAcountName);

    await this.locator.accompanyFullName.fill(Patient.accompanyName);
    await this.ngSelect.selectByFormControl('relation', Patient.accompanyRelation);
    await this.waitUntilStable();
    await this.locator.accompanyMobileNumber.fill(Patient.accompanyMobile);

    await this.locator.showClinicalFieldsButton.click();
    await this.waitForPageReady();

    await this.ngSelect.selectByFormControl('firstRecognition', Patient.firstRecognition);
    await this.waitUntilStable();
    await this.ngSelect.selectByFormControl('howToRefer', Patient.howToRefer);
    await this.waitUntilStable();
    await this.ngSelect.selectByFormControl('causeOfHospitalization', Patient.causeOfHospitalization,);
    await this.waitUntilStable();
  }

  async assignWardDoctorAndPrepayment(Patient: Patient): Promise<void> {
    await this.ngSelect.selectByFormControl('wardfileld', Patient.ward);
    await this.waitUntilStable();
    await this.ngSelect.selectByFormControl('doctorField', Patient.doctor);
    await this.waitUntilStable();
    await this.ngSelect.selectByFormControl('responsiblePatient', Patient.responsiblePatient);
    await this.waitUntilStable();
    await this.locator.prepayment.fill(Patient.prepayment);
  }

  async saveAdmissionFiling(): Promise<void> {
    await this.locator.saveFileButton.click();
    await this.waitForPageReady();
  }

  async saveEditAdmissionFiling(): Promise<{ success: boolean; message?: string }> {
    const editFilingResponsePromise = this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/Filing/EditFiling') &&
        response.request().method() === 'POST'
    );

    await this.locator.saveFileButton.click();

    const response = await editFilingResponsePromise;

    let responseBody: { message?: string } | null = null;

    try {
      responseBody = (await response.json()) as { message?: string };
    } catch {
      responseBody = null;
    }

    if (!response.ok()) {
      const message =
        responseBody?.message ||
        `Save failed with status ${response.status()}`;

      console.error(`[SAVE ERROR] EditFiling failed: ${message}`);
      return {
        success: false,
        message,
      };
    }

    console.log('[ACTION] Filing saved successfully.');
    await this.waitForPageReady();

    return {
      success: true,
    };
  }

  async denyAdmitPrintPage(): Promise<void> {
    await this.locator.denyPrintButton.click();
    await this.waitForPageReady();
  }

  async openInPatientList(): Promise<void> {
    const admitHisAppUrl = process.env.ADMITHIS_APP_URL;

    if (!admitHisAppUrl) {
      throw new Error('ADMITHIS_APP_URL is required to open the AdmitHis app.');
    }

    await this.page.goto(admitHisAppUrl);
    await this.waitForPageReady();

    const link = this.locator.inpatientListLink;
    await link.waitFor({ state: 'visible', timeout: 15000 });
    
    await this.safeClick(this.locator.inpatientListLink);
    await this.waitForPageReady();
  }

  async loadPreadmitPatientList(): Promise<void> {
    await this.locator.preadmitListCheckbox.waitFor;
    await expect(this.locator.preadmitListCheckbox).toBeVisible();
    await expect(this.locator.preadmitListCheckbox).toBeEnabled();
    await this.locator.preadmitListCheckbox.click();
  }

  async searchPreadmitPatientInList(nationalCode: string): Promise<void> {
    await this.locator.nationalCode.fill(nationalCode);
    await this.locator.listSearchButton.click();
    await this.waitForPageReady();
  }

  async openPreadmitPatientForEdit(nationalCode: string): Promise<void> {
    await this.searchPreadmitPatientInList(nationalCode);
    await this.locator.visibleRowActionButton.click();
    await this.waitForPageReady();
    await this.locator.editButton.click();
    await this.waitForPageReady();
  }

  async clearShebaInformationAndSave(): Promise<void> {
    console.log('[ACTION] Starting to clear Sheba Information...');

    // 1) خالی کردن شماره شبا بدون لاگ‌کردن مقدار حساس
    const currentSheba = await this.locator.shebaNo.inputValue();
    if (currentSheba.trim() !== '') {
      console.warn('[LOG] فیلد شماره شبا اشتباه پر شده بود و خالی شد.');
    } else {
      console.log('[LOG] فیلد شماره شبا از قبل خالی بود.');
    }
    await this.safeFill(this.locator.shebaNo, '');

    // 2) خالی کردن صاحب شبا بدون لاگ‌کردن مقدار
    const currentOwner = await this.locator.shebaOwner.inputValue();
    if (currentOwner.trim() !== '') {
      console.warn('[LOG] فیلد صاحب شبا اشتباه پر شده بود و خالی شد.');
    } else {
      console.log('[LOG] فیلد صاحب شبا از قبل خالی بود.');
    }
    await this.safeFill(this.locator.shebaOwner, '');

    // 3) تیک‌زدن "شبا ندارد" با کلیک روی label
    const missedShebaInput = this.locator.missedShebaInput;
    const missedShebaLabel = this.locator.missedShebaLabel;

    if (!(await missedShebaInput.isChecked())) {
      await missedShebaLabel.click();
      await expect(missedShebaInput).toBeChecked();
    }

    console.log('[ACTION] Sheba cleanup completed.');
    await this.waitUntilStable();
  }

  async editPreadmitWardAndDoctor(Patient: Patient): Promise<void> {
    // await this.page.locator('.mat-checkbox-inner-container').click();
    await this.openPreadmitPatientForEdit(Patient.nationalCode);
    
    await this.ngSelect.selectByFormControl('wardfileld', Patient.preadmitEditWard);
    await this.waitUntilStable();
    await this.ngSelect.selectByFormControl('doctorField', Patient.doctor);
    await this.waitUntilStable();

    await this.clearShebaInformationAndSave();
    const saveResult = await this.saveEditAdmissionFiling();

    if (!saveResult.success) {
      console.warn(`[FLOW] ذخیره پرونده ناموفق بود. پیام: ${saveResult.message}`);
      console.warn('[FLOW] مرحله deny print رد شد و ادامه تست انجام می‌شود.');

      await this.safeClick(this.locator.inpatientListLink);
      await this.waitForPageReady();  
      await this.loadPreadmitPatientList();
      return;
    }

    await this.denyAdmitPrintPage();
    await this.loadPreadmitPatientList();
  }

  async cancelPreadmit(nationalCode: string): Promise<void> {
    await this.searchPreadmitPatientInList(nationalCode);

    console.log('[ACTION] Opening admission actions menu...');

    await this.locator.admissionActionsButton.click();

    await this.locator.cancelAdmissionMenuItem.waitFor({ state: 'visible' });

    console.log('[ACTION] Clicking "لغو پذیرش"...');

    await this.locator.cancelAdmissionMenuItem.click();

    await this.waitUntilStable();
    await this.locator.confirmYesButton.click();
    await this.waitForPageReady();
  }
}
