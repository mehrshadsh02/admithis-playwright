import { expect, type Locator, type Page } from '@playwright/test';

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  async goto(path = ''): Promise<void> {
    await this.page.goto(path);
    await this.waitForPageReady();
  }

  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.waitUntilStable();
  }

  async waitUntilStable(timeout = 30000): Promise<void> {
    const spinner = this.page.locator('.back-spenner');

    if (await spinner.count()) {
      await spinner.waitFor({
        state: 'hidden',
        timeout,
      }).catch(() => {});
    }
  }

  async safeClick(locator: Locator): Promise<void> {
    await this.waitUntilStable();

    await locator.scrollIntoViewIfNeeded();

    await expect(locator).toBeVisible();

    await expect(locator).toBeEnabled();

    await locator.click();

    await this.waitUntilStable();
  }

  async safeFill(locator: Locator, value: string): Promise<void> {
    await this.waitUntilStable();

    await locator.scrollIntoViewIfNeeded();

    await expect(locator).toBeVisible();

    await locator.fill(value);

    await this.waitUntilStable();
  }

  async verifyUrl(url: RegExp | string): Promise<void> {
    await expect(this.page).toHaveURL(url);
  }
}