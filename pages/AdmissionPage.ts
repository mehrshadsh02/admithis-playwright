import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { AdmissionLocator } from '../locators/AdmissionLocator';
import { NgSelect } from '../components/NgSelect';
import type { Patient } from '../data/patient';
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

  async fillPatientInformation(patient: Patient): Promise<void> {
    await this.ngSelect.selectByFormControl('maritalStatus', patient.maritalStatus);
    await this.waitUntilStable();
    await this.ngSelect.selectByFormControl('insurRelation', patient.insuranceRelation);
    await this.waitUntilStable();

    await this.locator.mobileNumber.fill(patient.mobile);
    await this.locator.address.fill(patient.address);

    await this.page.getByRole('textbox', { name: 'شماره شبا' }).fill(patient.ShabaNo);
    await this.page.getByRole('textbox', { name: 'صاحب شبا' }).fill(patient.BankAcountName);

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

  async assignWardDoctorAndPrepayment(patient: Patient): Promise<void> {
    await this.ngSelect.selectByFormControl('wardfileld', patient.ward);
    await this.waitUntilStable();
    await this.ngSelect.selectByFormControl('doctorField', patient.doctor);
    await this.waitUntilStable();
    await this.ngSelect.selectByFormControl('responsiblePatient', patient.responsiblePatient);
    await this.waitUntilStable();
    await this.locator.prepayment.fill(patient.prepayment);
  }

  async saveAdmissionFiling(): Promise<void> {
    await this.locator.saveFileButton.click();
    await this.waitForPageReady();
  }

  async denyAdmitPrintPage(): Promise<void> {
    await this.locator.denyPrintButton.click();
    await this.waitForPageReady();
  }

  async openInpatientList(): Promise<void> {
    const admitHisAppUrl = process.env.ADMITHIS_APP_URL;

    if (!admitHisAppUrl) {
      throw new Error('ADMITHIS_APP_URL is required to open the AdmitHis app.');
    }

    await this.page.goto(admitHisAppUrl);
    await this.waitForPageReady();
    await this.locator.inpatientListLink.click();
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

  async editPreadmitWardAndDoctor(patient: Patient): Promise<void> {
    // await this.page.locator('.mat-checkbox-inner-container').click();
    await this.openPreadmitPatientForEdit(patient.nationalCode);
    await this.ngSelect.selectByFormControl('wardfileld', patient.preadmitEditWard);
    await this.waitUntilStable();
    await this.ngSelect.selectByFormControl('doctorField', patient.doctor);
    await this.waitUntilStable();
    await this.saveAdmissionFiling();
    await this.denyAdmitPrintPage();
    await this.loadPreadmitPatientList();
  }

  async cancelPreadmit(nationalCode: string): Promise<void> {
    await this.searchPreadmitPatientInList(nationalCode);
    await this.locator.cancelButton.click();
    await this.waitForPageReady();
    await this.locator.confirmYesButton.click();
    await this.waitForPageReady();
  }
}
