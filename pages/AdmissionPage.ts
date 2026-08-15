import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { AdmissionLocator } from '../locators/AdmissionLocator';
import { NgSelect } from '../components/NgSelect';
import type { Patient } from '../data/models/Patient';

type patientInformationInput = Pick<
  Patient,
  | 'maritalStatus'
  | 'insuranceRelation'
  | 'mobile'
  | 'address'
  | 'ShabaNo'
  | 'BankAcountName'
  | 'accompanyName'
  | 'accompanyRelation'
  | 'accompanyMobile'
  | 'firstRecognition'
  | 'howToRefer'
  | 'causeOfHospitalization'
  | 'patientClass'
>;

type AdmissionAssignmentInput = Pick<
  Patient,
  | 'nationalCode'
  | 'insuranceName'
  | 'ward'
  | 'bed'
  | 'doctor'
  | 'responsiblePatient'
  | 'prepayment'
  | 'preadmitEditWard'
  | 'emergencyEditDoctor'
  | 'inpatientward'
>;

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

  async selectEmergencyUnderObservation(): Promise<void> {
    const checkbox = this.locator.emergencyUnderSprevisionCheckbox;

    await checkbox.waitFor({
      state: 'visible',
    });

    const input = checkbox.locator('input[type="checkbox"]');

    await input.waitFor({
      state: 'attached',
    });

    await expect(input).toBeEnabled();

    if (!(await input.isChecked())) {
      await checkbox.click();
    }

    await expect(input).toBeChecked();

    await this.waitUntilStable();
  }

  async searchPatient(nationalCode: string): Promise<void> {
    await this.selectIranianNationality();

    await this.enterNationalCode(nationalCode);

    await this.verifyIdentityInquiryEnabled();

    await this.identityInquiry();
  }

  async fillPatientInformation(patient: patientInformationInput): Promise<void> {

    await this.ngSelect.selectIfEmptyByFormControl('maritalStatus',patient.maritalStatus);
    await this.waitUntilStable();

    await this.ngSelect.selectIfEmptyByFormControl('insurRelation',patient.insuranceRelation);
    await this.waitUntilStable();

    await this.fillIfEmpty(this.locator.mobileNumber, patient.mobile);
    await this.fillIfEmpty(this.locator.address, patient.address);

    await this.fillIfEmpty(this.page.getByRole('textbox', { name: 'شماره شبا' }), patient.ShabaNo);

    await this.fillIfEmpty(this.page.getByRole('textbox', { name: 'صاحب شبا' }),patient.BankAcountName);

    await this.locator.accompanyFullName.fill(patient.accompanyName);
    await this.ngSelect.selectByFormControl('relation', patient.accompanyRelation);
    await this.waitUntilStable();
    await this.locator.accompanyMobileNumber.fill(patient.accompanyMobile);

    await this.locator.showClinicalFieldsButton.click();
    await this.waitForPageReady();

    await this.ngSelect.selectByFormControl('firstRecognition', patient.firstRecognition);
    await this.waitUntilStable();
    await this.ngSelect.selectByFormControl('howToRefer', patient.howToRefer);
    await this.waitUntilStable();
    await this.ngSelect.selectByFormControl('causeOfHospitalization', patient.causeOfHospitalization,);
    await this.waitUntilStable();
  }

  async assignWardDoctorAndPrepayment(patient: AdmissionAssignmentInput): Promise<void> {
    await this.ngSelect.selectByFormControl('wardfileld', patient.ward);
    await this.waitUntilStable();
    await this.ngSelect.selectByFormControl('doctorField', patient.doctor);
    await this.waitUntilStable();
    await this.ngSelect.selectIfEmptyByFormControl('responsiblePatient',patient.responsiblePatient);
    await this.waitUntilStable();
    await this.locator.prepayment.fill(patient.prepayment);
  }

  async saveAdmissionFiling(): Promise<void> {
    await this.locator.saveFileButton.click();
    await this.waitForPageReady();
  }

  async saveAdmissionFilingEmergency(): Promise<{
    admitId: number;
    admitDate: string;
    titleType: number;
    fileFormationId: number;
  }> {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/Filing/AddFiling') &&
        response.request().method() === 'POST',
      {
        timeout: 30000,
      }
    );

    await this.locator.saveFileButton.click();

    await this.confirmZeroPrepaymentIfVisible();

    const response = await responsePromise;

    if (!response.ok()) {
      throw new Error(
        `AddFiling failed with status ${response.status()}`
      );
    }

    const json = (await response.json()) as {
      admitId: number;
      admitDate: string;
      titleType: number;
      fileFormationId: number;
    };

    await this.waitForPageReady();

    return {
      admitId: json.admitId,
      admitDate: json.admitDate,
      titleType: json.titleType,
      fileFormationId: json.fileFormationId,
    };
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

  async confirmZeroPrepaymentIfVisible(): Promise<void> {
    const dialog = this.locator.zeroPrepaymentDialog;
    const confirmButton = this.locator.zeroPrepaymentConfirmButton;

    try {
      await dialog.waitFor({
        state: 'visible',
        timeout: 10000,
      });
    } catch {
      // دیالوگ فقط برای پیش‌پرداخت صفر نمایش داده می‌شود.
      return;
    }

    await expect(dialog).toContainText(
      'مبلغ پیش پرداخت صفر است.آیا ادامه می دهید؟'
    );

    await expect(confirmButton).toBeVisible();
    await expect(confirmButton).toBeEnabled();

    await confirmButton.click();

    await expect(dialog).toBeHidden({
      timeout: 10000,
    });

    await this.waitForPageReady();
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

  async searchPatientInList(nationalCode: string): Promise<void> {
    await this.locator.nationalCode.fill(nationalCode);
    await this.locator.listSearchButton.click();
    await this.waitForPageReady();
  }

  async openPreadmitPatientForEdit(nationalCode: string): Promise<void> {
    await this.searchPatientInList(nationalCode);
    await this.locator.visibleRowActionButton.click();
    await this.waitForPageReady();
    await this.locator.editButton.click();
    await this.waitForPageReady();
  }

  async clearShebaInformationAndSave(): Promise<void> {
    console.log('[ACTION] Starting to clear Sheba Information...');

    const currentSheba = await this.locator.shebaNo.inputValue();
    if (currentSheba.trim() !== '') {
      console.warn('[LOG] فیلد شماره شبا اشتباه پر شده بود و خالی شد.');
    } else {
      console.log('[LOG] فیلد شماره شبا از قبل خالی بود.');
    }
    await this.safeFill(this.locator.shebaNo, '');

    const currentOwner = await this.locator.shebaOwner.inputValue();
    if (currentOwner.trim() !== '') {
      console.warn('[LOG] فیلد صاحب شبا اشتباه پر شده بود و خالی شد.');
    } else {
      console.log('[LOG] فیلد صاحب شبا از قبل خالی بود.');
    }
    await this.safeFill(this.locator.shebaOwner, '');

    const missedShebaInput = this.locator.missedShebaInput;
    const missedShebaLabel = this.locator.missedShebaLabel;

    if (!(await missedShebaInput.isChecked())) {
      await missedShebaLabel.click();
      await expect(missedShebaInput).toBeChecked();
    }

    console.log('[ACTION] Sheba cleanup completed.');
    await this.waitUntilStable();
  }

  async editPreadmitWardAndDoctor(patient: AdmissionAssignmentInput): Promise<void> {
    await this.openPreadmitPatientForEdit(patient.nationalCode);
    
    await this.ngSelect.selectByFormControl('wardfileld', patient.preadmitEditWard);
    await this.waitUntilStable();
    await this.ngSelect.selectByFormControl('doctorField', patient.doctor);
    await this.waitUntilStable();

    await this.clearShebaInformationAndSave();
    const saveResult = await this.saveEditAdmissionFiling();

    if (!saveResult.success) {
      console.warn(`[FLOW] ذخیره پرونده ناموفق بود. پیام: ${saveResult.message}`);
      console.warn('[FLOW] مرحله deny print رد شد و ادامه تست انجام می‌شود.');

      await this.safeClick(this.locator.inpatientListLink);
      await this.waitForPageReady();  
      // await this.loadPreadmitPatientList();
      return;
    }

    await this.denyAdmitPrintPage();
    await this.loadPreadmitPatientList();
  }

  async cancelPreadmit(nationalCode: string): Promise<void> {
    await this.searchPatientInList(nationalCode);

    console.log('[ACTION] Opening admission actions menu...');

    await this.locator.admissionActionsButton.click();

    await this.locator.cancelAdmissionMenuItem.waitFor({ state: 'visible' });

    console.log('[ACTION] Clicking "لغو پذیرش"...');

    await this.locator.cancelAdmissionMenuItem.click();

    await this.waitUntilStable();
    await this.locator.confirmYesButton.click();
    await this.waitForPageReady();
  }

  async openEmengencyPatientList(): Promise<void> {
    const admitHisAppUrl = process.env.ADMITHIS_APP_URL;

    if (!admitHisAppUrl) {
      throw new Error('ADMITHIS_APP_URL is required to open the AdmitHis app.');
    }

    await this.page.goto(admitHisAppUrl);
    await this.waitForPageReady();

    const link = this.locator.EmergencyPatientListLink;
    await link.waitFor({ state: 'visible', timeout: 15000 });
    
    await this.safeClick(this.locator.EmergencyPatientListLink);
    await this.waitForPageReady();
  }

  async searchEmergencytpatientInList(nationalCode: string): Promise<void> {
    await this.locator.nationalCode.fill(nationalCode);
    await this.locator.listSearchButton.click();
    await this.waitForPageReady();
  }

  async openEmergencyPatientForEdit(nationalCode: string): Promise<void> {
    await this.searchPatientInList(nationalCode);
    await this.waitForPageReady();
    await this.locator.editButton.click();
    await this.waitForPageReady();
    await this.locator.editButton.click();
    await this.waitForPageReady();
  }

  async editEmergencyPatientInformation(patient: AdmissionAssignmentInput): Promise<void> {
    await this.openEmergencyPatientForEdit(patient.nationalCode);
    
    await this.ngSelect.selectByFormControl('doctorField', patient.emergencyEditDoctor);
    await this.waitUntilStable();

    await this.clearShebaInformationAndSave();
    const saveResult = await this.saveEditAdmissionFiling();

    if (!saveResult.success) {
      console.warn(`[FLOW] ذخیره پرونده ناموفق بود. پیام: ${saveResult.message}`);
      console.warn('[FLOW] مرحله deny print رد شد و ادامه تست انجام می‌شود.');
      return;
    }

    await this.denyAdmitPrintPage();
  }

  async assignEmergencyWardDoctor(patient: AdmissionAssignmentInput): Promise<void> {
    await this.ngSelect.selectByFormControl('wardfileld', patient.ward);
    await this.waitUntilStable();
    await this.ngSelect.selectByFormControl('doctorField', patient.doctor);
    await this.waitUntilStable();
    await this.ngSelect.selectByFormControl('bedNum', patient.bed);
    await this.waitUntilStable();
    await this.ngSelect.selectIfEmptyByFormControl('responsiblePatient',patient.responsiblePatient);
    await this.waitUntilStable();
    await this.locator.prepayment.fill(patient.prepayment);
  }

  async sendtowardEmergencyPatient(patient: AdmissionAssignmentInput): Promise<void> {
    await this.searchPatientInList(patient.nationalCode);

    await this.page.getByRole('button', { description: 'انتقال به بخش', exact: true }).first().click();

    await this.waitForPageReady();
    await this.locator.editButton.click();
    await this.waitForPageReady();
  }

  async fillinformationEmergencyPatienttosendtoward(patient: AdmissionAssignmentInput): Promise<void> {

    await this.ngSelect.selectByFormControl('doctorField', patient.emergencyEditDoctor);
    await this.waitUntilStable();

    await this.ngSelect.selectByFormControl('wardfileld', patient.inpatientward);
    await this.waitUntilStable();

    await this.ngSelect.selectByFormControl('bedNum', patient.bed);
    await this.waitUntilStable();

    await this.clearShebaInformationAndSave();
    await this.locator.saveFileButton.click();
  }

  async fillPatientInformationforInapatient(patient: patientInformationInput): Promise<void> {

    await this.ngSelect.selectIfEmptyByFormControl('maritalStatus',patient.maritalStatus);
    await this.waitUntilStable();

    await this.ngSelect.selectIfEmptyByFormControl('insurRelation',patient.insuranceRelation);
    await this.waitUntilStable();

    await this.fillIfEmpty(this.locator.mobileNumber, patient.mobile);
    await this.fillIfEmpty(this.locator.address, patient.address);

    await this.fillIfEmpty(this.page.getByRole('textbox', { name: 'شماره شبا' }), patient.ShabaNo);

    await this.fillIfEmpty(this.page.getByRole('textbox', { name: 'صاحب شبا' }),patient.BankAcountName);

    await this.locator.accompanyFullName.fill(patient.accompanyName);
    await this.ngSelect.selectByFormControl('relation', patient.accompanyRelation);
    await this.waitUntilStable();
    await this.locator.accompanyMobileNumber.fill(patient.accompanyMobile);

    await this.locator.showClinicalFieldsButton.click();
    await this.waitForPageReady();

    await this.ngSelect.selectByFormControl('patientClass',patient.patientClass);
    await this.waitUntilStable();

    await this.ngSelect.selectByFormControl('firstRecognition', patient.firstRecognition);
    await this.waitUntilStable();
    await this.ngSelect.selectByFormControl('howToRefer', patient.howToRefer);
    await this.waitUntilStable();
    await this.ngSelect.selectByFormControl('causeOfHospitalization', patient.causeOfHospitalization,);
    await this.waitUntilStable();
  }

  async assignInpatientWardDoctor(patient: AdmissionAssignmentInput): Promise<void> {
    await this.ngSelect.selectByFormControl('wardfileld', patient.ward);
    await this.waitUntilStable();
    await this.ngSelect.selectByFormControl('doctorField', patient.doctor);
    await this.waitUntilStable();
    await this.ngSelect.selectByFormControl('bedNum', patient.bed);
    await this.waitUntilStable();
    await this.ngSelect.selectIfEmptyByFormControl('responsiblePatient',patient.responsiblePatient);
    await this.waitUntilStable();
    await this.locator.prepayment.fill(patient.prepayment);
  }

  async openInpatientAdmitForEdit(nationalCode: string): Promise<void> {
    await this.searchPatientInList(nationalCode);
    await this.locator.visibleRowActionButton.click();
    await this.waitForPageReady();
    await this.locator.editButton.click();
    await this.waitForPageReady();
  }

  async editInpatientInsur(patient: AdmissionAssignmentInput): Promise<void> {
    await this.openInpatientAdmitForEdit(patient.nationalCode);
    
    await this.ngSelect.selectByFormControl('insuranceName', patient.insuranceName);
    await this.waitUntilStable();

    await this.clearShebaInformationAndSave();
    const saveResult = await this.saveEditAdmissionFiling();

    if (!saveResult.success) {
      console.warn(`[FLOW] ذخیره پرونده ناموفق بود. پیام: ${saveResult.message}`);
      console.warn('[FLOW] مرحله deny print رد شد و ادامه تست انجام می‌شود.');

      await this.safeClick(this.locator.inpatientListLink);
      await this.waitForPageReady();  
      // await this.loadPreadmitPatientList();
      return;
    }

    await this.denyAdmitPrintPage();
    // await this.loadPreadmitPatientList();
  }

}
