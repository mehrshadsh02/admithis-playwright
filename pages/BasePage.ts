import { expect, type Locator, type Page } from '@playwright/test';
import { logger } from '../helpers/logger';

const SPINNER_SELECTOR = '.back-spenner';
const DEFAULT_STABILITY_TIMEOUT = 30_000;
const CARTABLE_CLICK_TIMEOUT = 15_000;
const CARTABLE_SCROLL_TIMEOUT = 5_000;

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  async goto(path = ''): Promise<void> {
    logger.info(`[Navigation] Navigating to: ${path || '/'}`);
    await this.page.goto(path);
    await this.waitForPageReady();
  }

  async waitForPageReady(): Promise<void> {
    logger.debug('[WaitEngine] Waiting for DOMContentLoaded...');
    await this.page.waitForLoadState('domcontentloaded');
    await this.waitUntilStable();
    logger.debug('[WaitEngine] Page ready and stable.');
  }

  async waitUntilStable(timeout = DEFAULT_STABILITY_TIMEOUT): Promise<void> {
    const spinner = this.page.locator(SPINNER_SELECTOR);

    try {
      if (!(await spinner.count())) {
        logger.debug('[WaitEngine] No Angular spinner found; page treated as stable.');
        return;
      }

      logger.debug(`[WaitEngine] Waiting for Angular spinner (${SPINNER_SELECTOR}) to hide...`);
      await spinner.first().waitFor({
        state: 'hidden',
        timeout,
      });
      logger.success('[WaitEngine] Angular spinner hidden; page is stable.');
    } catch (error) {
      logger.warn(`[WaitEngine] Spinner wait did not complete within ${timeout}ms; continuing.`, {
        error,
      });
    }
  }

  async safeClick(locator: Locator, description = 'Element'): Promise<void> {
    logger.info(`[SafeAction] Clicking on: ${description}`);

    try {
      await this.waitUntilStable();
      await locator.scrollIntoViewIfNeeded();
      await expect(locator).toBeVisible();
      await expect(locator).toBeEnabled();
      await locator.click();
      await this.waitUntilStable();
      logger.success(`[SafeAction] Clicked: ${description}`);
    } catch (error) {
      logger.error(`[SafeAction] Click failed on: ${description}`, error);
      throw error;
    }
  }

  async safeFill(locator: Locator, value: string, description = 'Input field'): Promise<void> {
    logger.info(`[SafeAction] Filling: ${description}`);

    try {
      await this.waitUntilStable();
      await locator.scrollIntoViewIfNeeded();
      await expect(locator).toBeVisible();
      await locator.fill(value);
      await this.waitUntilStable();
      logger.success(`[SafeAction] Filled: ${description}`);
    } catch (error) {
      logger.error(`[SafeAction] Fill failed on: ${description}`, error);
      throw error;
    }
  }

  async verifyUrl(url: RegExp | string): Promise<void> {
    logger.info(`[Assertion] Verifying URL pattern: ${String(url)}`);
    await expect(this.page).toHaveURL(url);
    logger.success(`[Assertion] URL verified: ${String(url)}`);
  }

  async fillIfEmpty(locator: Locator, value: string, description = 'Input field'): Promise<void> {
    try {
      await this.waitUntilStable();
      const currentValue = (await locator.inputValue()).trim();

      if (currentValue !== '') {
        logger.debug(`[SafeAction] ${description} already contains a value; skipping fill.`);
        return;
      }

      logger.info(`[SafeAction] ${description} is empty; filling it.`);
      await locator.fill(value);
      await this.waitUntilStable();
      logger.success(`[SafeAction] Filled empty ${description}.`);
    } catch (error) {
      logger.error(`[SafeAction] Fill-if-empty failed on: ${description}`, error);
      throw error;
    }
  }

  async safeClickCartable(locator: Locator, description = 'Cartable item'): Promise<void> {
    logger.info(`[SafeAction] Cartable click on: ${description}`);

    try {
      await this.waitUntilStable();
      await expect(locator).toBeAttached({ timeout: CARTABLE_CLICK_TIMEOUT });
      await expect(locator).toBeVisible({ timeout: CARTABLE_CLICK_TIMEOUT });
      await expect(locator).toBeEnabled({ timeout: CARTABLE_CLICK_TIMEOUT });

      try {
        await locator.scrollIntoViewIfNeeded({ timeout: CARTABLE_SCROLL_TIMEOUT });
      } catch (error) {
        logger.warn(`[SafeAction] Scroll container bypass for: ${description}`, { error });
      }

      await locator.click({ timeout: CARTABLE_CLICK_TIMEOUT });
      await this.waitUntilStable();
      logger.success(`[SafeAction] Cartable clicked: ${description}`);
    } catch (error) {
      logger.error(`[SafeAction] Cartable click failed on: ${description}`, error);
      throw error;
    }
  }
}
