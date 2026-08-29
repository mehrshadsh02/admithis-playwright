import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { AdmissionLocator } from '../locators/AdmissionLocator';
import { NgSelect } from '../components/NgSelect';
import { logger } from '../helpers/logger';
import type { Patient } from '../data/models/Patient';
import type {PatientInformationInput ,AdmissionAssignmentInput,} from '../data/models/PatientAdmission.types';


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
    if ((await this.locator.nationalityValue.textContent())?.trim() === 'ایرانی') {
      return;
    }

    await this.locator.nationality.click();
    await expect(this.locator.iranianOption).toBeVisible();
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

  async searchByNationalCode(nationalCode: string): Promise<void> {
    await this.selectIranianNationality();
    await this.enterNationalCode(nationalCode);
    await this.verifyIdentityInquiryEnabled();
    await this.identityInquiry();
    await this.waitForPatientFieldsReady();
  }

  async searchByNationalCodeAndBirthDate(
    nationalCode: string,
    birthDate: string,
  ): Promise<void> {
    await this.selectIranianNationality();
    await this.enterNationalCode(nationalCode);
    await this.locator.birthDate.fill(birthDate);
    await expect(this.locator.identityInquiryByBirthDateButton).toBeEnabled();
    await this.locator.identityInquiryByBirthDateButton.click();
    await this.waitForPatientFieldsReady();
  }

  async searchByElectronicNumber(electronicNumber: string): Promise<void> {
    await this.locator.electronicNumber.click();
    await this.locator.electronicNumber.fill(electronicNumber);

    await this.locator.searchButton.click();

    await this.waitForPatientFieldsReady();
  }

  async searchByNameAndLastName(firstName: string, lastName: string): Promise<void> {
    await this.locator.firstName.fill(firstName);
    await this.locator.lastName.fill(lastName);
    await this.locator.searchButton.click();
    await this.waitForPatientFieldsReady();
  }

  async selectPatientFromResults(firstName: string,lastName: string,fatherName: string,nationalCode?: string): Promise<void> {
    // تابع کمکی برای ایجاد Regex منعطف جهت تطابق ی/ي و ک/ك و فاصله‌های اضافی
    const createFlexibleRegex = (text: string): RegExp => {
      const sanitized = text.trim()
        .replace(/[یي]/g, '[یي]')
        .replace(/[کك]/g, '[کك]');
      return new RegExp(`^\\s*${sanitized}\\s*$`, 'i');
    };

    let targetRow = this.locator.patientResultRows
      // بررسی دقیق ستون FirstName
      .filter({
        has: this.page.locator('td.mat-column-FirstName', {
          hasText: createFlexibleRegex(firstName),
        }),
      })
      // بررسی دقیق ستون LastName
      .filter({
        has: this.page.locator('td.mat-column-LastName', {
          hasText: createFlexibleRegex(lastName),
        }),
      })
      // بررسی دقیق ستون FatherName
      .filter({
        has: this.page.locator('td.mat-column-FatherName', {
          hasText: createFlexibleRegex(fatherName),
        }),
      });

    // اگر کدملی هم پاس داده شده بود و خواستی ردیف یکتا‌تر شود:
    if (nationalCode) {
      targetRow = targetRow.filter({
        has: this.page.locator('td.mat-column-NCode', {
          hasText: nationalCode.trim(),
        }),
      });
    }

    // انتخاب اولین ردیف مطابق با شرایط
    const selectedRow = targetRow.first();

    // اطمینان از Visible و پایدار بودن ردیف
    await expect(selectedRow, `ردیف مربوط به بیمار ${firstName} ${lastName} پیدا نشد`).toBeVisible();
    
    // کلیک روی ردیف جهت انتخاب
    await selectedRow.click();

    // انتظار برای اتمام انیمیشن‌ها یا درخواست‌های انگولار
    await this.waitForPageReady();
    await this.waitForPatientFieldsReady();
  }

  async resetPatientForm(): Promise<void> {
    await this.locator.refreshButton.click();

    await expect(this.locator.nationalCode).toBeEditable({
      timeout: 10000,
    });

    await this.waitForPatientFormReady();
  }

  private async waitForPatientFormReady(): Promise<void> {
    await expect(this.locator.nationalCode).toBeVisible();
    await expect(this.locator.firstName).toBeVisible();
    await expect(this.locator.lastName).toBeVisible();
  }

  private async waitForPatientFieldsReady(): Promise<void> {
    await this.waitUntilStable();
    await this.waitForPatientFormReady();
    await expect(this.locator.firstName).not.toHaveValue('');
    await expect(this.locator.lastName).not.toHaveValue('');
  }

  private async isPatientLoaded(): Promise<boolean> {
    try {
      await expect(this.locator.firstName).toHaveValue(/.+/, {
        timeout: 3000,
      });

      await expect(this.locator.lastName).toHaveValue(/.+/, {
        timeout: 3000,
      });

      return true;
    } catch {
      return false;
    }
  }

  async searchPatientWithStrategies(patient: Patient): Promise<void> {
    // 1. کد ملی
    // await this.resetPatientForm();

    await this.searchByNationalCode(patient.nationalCode);

    // if (await this.isPatientLoaded()) {
    //   return;
    // }

    // 2. کد ملی + تاریخ تولد
    await this.resetPatientForm();

    await this.searchByNationalCodeAndBirthDate(
      patient.nationalCode,
      patient.birthDate,
    );

    // if (await this.isPatientLoaded()) {
    //   return;
    // }

    // 3. نام و نام خانوادگی
    if (patient.firstName.trim() && patient.lastName.trim()) {
      await this.resetPatientForm();

      await this.searchByNameAndLastName(
        patient.firstName,
        patient.lastName,
      );

      await this.selectPatientFromResults(
        patient.firstName,
        patient.lastName,
        patient.fatherName,
        patient.nationalCode,
      );

      // if (await this.isPatientLoaded()) {
      //   return;
      // }
    }

    // 4. شماره الکترونیک
    if (patient.electronicNumber.trim()) {
      await this.resetPatientForm();

      await this.searchByElectronicNumber(
        patient.electronicNumber,
      );

      if (await this.isPatientLoaded()) {
        return;
      }
    }

    throw new Error(
      `Patient not found: ${patient.nationalCode}`,
    );
  }

  async searchPatient(nationalCode: string): Promise<void> {
    await this.searchByNationalCode(nationalCode);
  }

  async fillPatientInformation(patient: PatientInformationInput): Promise<void> {

    await this.fillIfEmpty(this.locator.firstName, patient.firstName);
    await this.fillIfEmpty(this.locator.lastName, patient.lastName);
    await this.fillIfEmpty(this.locator.fatherName, patient.fatherName);
    await this.fillIfEmpty(this.locator.birthDate, patient.birthDate);

    
    await this.ngSelect.selectIfEmptyByFormControl('maritalStatus',patient.maritalStatus);
    await this.waitUntilStable();
    
    await this.fillIfEmpty(this.page.getByRole('textbox', { name: 'شماره شبا' }), patient.ShabaNo);

    await this.fillIfEmpty(this.page.getByRole('textbox', { name: 'صاحب شبا' }),patient.BankAcountName);


    await this.ngSelect.selectIfEmptyByFormControl('sexuality',patient.sex);
    await this.waitUntilStable();

    await this.ngSelect.selectIfEmptyByFormControl('insuranceName',patient.insuranceName);
    await this.waitUntilStable();
    
    await this.ngSelect.selectIfEmptyByFormControl('insuranceFund',patient.insuranceFund);
    await this.waitUntilStable(); 
    
    await this.fillIfEmpty(this.locator.insuranceNumber, patient.insuranceNumber);
    await this.fillIfEmpty(this.locator.insuranceExpirationDate, patient.insuranceExpirationDate);

    await this.ngSelect.selectIfEmptyByFormControl('insurRelation',patient.insuranceRelation);
    await this.waitUntilStable();

    await this.fillIfEmpty(this.locator.mobileNumber, patient.mobile);
    await this.fillIfEmpty(this.locator.address, patient.address);

    await this.locator.accompanyFullName.fill(patient.accompanyName);
    await this.ngSelect.selectIfEmptyByFormControl('relation', patient.accompanyRelation);
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
      console.warn('[BUG] The Sheba field was filled in incorrectly and became empty.');
    } else {
      console.log('[BUG] The field of sheba was already empty');
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
    await this.waitForPageReady();
    // await this.loadPreadmitPatientList();
  }

  async cancelPreadmit(nationalCode: string): Promise<void> {
    await this.searchPatientInList(nationalCode);

    console.log('[ACTION] Opening admission actions menu...');

    await this.locator.admissionActionsButton.click();

    await this.locator.cancelAdmissionMenuItem.waitFor({ state: 'visible' });

    console.log('[ACTION] Clicking "Cancel Admission"...');

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

  async fillPatientInformationforInapatient(patient: PatientInformationInput): Promise<void> {

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

  async editInpatientInsur(patient: PatientInformationInput): Promise<void> {
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
