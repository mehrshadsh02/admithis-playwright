import { expect, type Locator, type Page } from '@playwright/test';

export abstract class BaseComponent {
  protected constructor(protected readonly page: Page) {}

  protected async waitUntilStable(timeout = 30_000): Promise<void> {

    if (this.page.isClosed()) {
      throw new Error(
        '[BaseComponent] Cannot wait for stability because the page is closed.'
      );
    }
    const spinner = this.page.locator('.back-spenner').first();

     try {
      await spinner.waitFor({
        state: 'hidden',
        timeout,
      });
    } catch (error) {
      if (this.page.isClosed()) {
        throw new Error(
          '[BaseComponent] Page was closed while waiting for the spinner.'
        );
      }

      throw new Error(
        `[BaseComponent] Spinner remained visible for ${timeout}ms.`,
        { cause: error }
      );
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