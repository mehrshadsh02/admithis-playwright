import { expect, type Locator, type Page } from '@playwright/test';

export abstract class BaseComponent {
  protected constructor(protected readonly page: Page) {}

  protected async waitUntilStable(timeout = 30000): Promise<void> {
    const spinner = this.page.locator('.back-spenner');

    if (await spinner.count()) {
      await spinner.waitFor({
        state: 'hidden',
        timeout,
      }).catch(() => {});
    }
  }

  protected async safeClick(locator: Locator): Promise<void> {
    await this.waitUntilStable();

    await locator.scrollIntoViewIfNeeded();

    await expect(locator).toBeVisible();

    await expect(locator).toBeEnabled();

    await locator.click();

    await this.waitUntilStable();
  }

  protected async safeFill(locator: Locator, value: string): Promise<void> {
    await this.waitUntilStable();

    await locator.scrollIntoViewIfNeeded();

    await expect(locator).toBeVisible();

    await locator.fill(value);

    await this.waitUntilStable();
  }
}