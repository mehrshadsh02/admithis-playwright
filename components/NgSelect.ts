import { expect, type Page } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class NgSelect extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  async selectByFormControl(
    formControlName: string,
    value: string
  ): Promise<void> {

    await this.waitUntilStable();

    const select = this.page.locator(
      `ng-select[formcontrolname="${formControlName}"]`
    );

    await this.safeClick(select);

    const input = select.locator("input[type='text']");

    await this.safeFill(input, value);

    const option = this.page
      .locator('.ng-option')
      .filter({ hasText: value })
      .first();

    await option.waitFor({
      state: 'visible',
      timeout: 30000,
    });

    await this.safeClick(option);

    await input.press('Tab').catch(() => {});

    await this.waitUntilStable();
  }
}