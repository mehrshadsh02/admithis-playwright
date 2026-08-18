import { expect, type Page } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class NgSelect extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  async selectByFormControl(formControlName: string, value: string): Promise<void> {
    await this.waitUntilStable();

    const select = this.page.locator(`ng-select[formcontrolname="${formControlName}"]`);

    await expect(select).toBeVisible({ timeout: 30000 });
    await this.safeClick(select);

    const panel = this.page.locator('.ng-dropdown-panel').last();
    await expect(panel).toBeVisible({ timeout: 10000 });

    const input = select.locator("input[type='text']");
    await expect(input).toBeVisible({ timeout: 10000 });

    await input.click();
    await input.clear();
    await input.fill(value);

    const option = panel.locator('.ng-option', { hasText: value }).first();
    await expect(option).toBeVisible({ timeout: 30000 });

    await option.click();

    await expect(panel)
      .toBeHidden({ timeout: 10000 })
      .catch(() => {});
    await this.waitUntilStable();
  }

  async selectIfEmptyByFormControl(formControlName: string, value: string): Promise<void> {
    await this.waitUntilStable();

    const select = this.page.locator(`ng-select[formcontrolname="${formControlName}"]`);

    await expect(select).toBeVisible({ timeout: 30000 });

    const selectedValues = select.locator('.ng-value-label');

    const selectedValueCount = await selectedValues.count();

    if (selectedValueCount > 0) {
      const selectedTexts = await selectedValues.allTextContents();

      const hasSelectedValue = selectedTexts.some((text) => text.trim().length > 0);

      if (hasSelectedValue) {
        return;
      }
    }

    await this.selectByFormControl(formControlName, value);
  }
}
