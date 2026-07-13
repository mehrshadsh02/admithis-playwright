import { expect, type Page,type Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { AdmissionLocator } from '../locators/AdmissionLocator';
import type { Patient } from '../data/patient';


export class AdmissionPage extends BasePage {
    
  private readonly locator = new AdmissionLocator(this.page);
  
  private async selectNgOption(
    dropdown: Locator,
    option: string,
    ): Promise<void> {
    await dropdown.click();

    await this.page
        .getByRole('option', { name: option, exact: true })
        .click();
    }

  constructor(page: Page) {
    super(page);
  }

    async open(): Promise<void> {
        await this.goto('/');
        await this.waitForPageReady();

        await expect(
        this.page.locator('input[formcontrolname="nationalCode"]'),
        ).toBeVisible();
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
        await this.selectNgOption(this.locator.maritalStatus, patient.maritalStatus);

        await this.selectNgOption(
            this.locator.insuranceRelation,
            patient.insuranceRelation,
        );

        await this.locator.mobileNumber.fill(patient.mobile);

        await this.locator.address.fill(patient.address);
        }    
}