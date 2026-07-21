import { type Page } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class NgSelect extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  async selectByFormControl(formControlName: string, value: string): Promise<void> {
    const select = this.page.locator(`ng-select[formcontrolname="${formControlName}"]`);
    await select.waitFor({ state: 'visible' });
    await select.click();

    const input = select.locator("input[type='text']");
    await input.waitFor({ state: 'visible' });
    await input.fill(value);

    const option = this.page.locator('.ng-option').filter({ hasText: value }).first();

    await option.waitFor({ state: 'visible' });
    await option.click();
    await input.press('Tab').catch(() => undefined);
  }
}
