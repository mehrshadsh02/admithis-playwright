import { expect, type Locator, type Page } from '@playwright/test';
import { logger } from '../helpers/logger';

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

  async waitUntilStable(timeout = 30000): Promise<void> {
    const spinner = this.page.locator('.back-spenner');

    try {
      if (await spinner.count()) {
        logger.debug('[WaitEngine] Angular spinner (.back-spenner) active. Waiting to hide...');
        await spinner.waitFor({
          state: 'hidden',
          timeout,
        });
        logger.debug('[WaitEngine] Angular spinner hidden.');
      }
    } catch {
      logger.warn(`[WaitEngine] Spinner wait exceeded ${timeout}ms or element detached.`);
    }

    // if (await spinner.count()) {
    //   await spinner.waitFor({
    //     state: 'hidden',
    //     timeout,
    //   }).catch(() => {});
    // }
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
      logger.error(`[SafeAction] Click failed on: ${description}`, { error: String(error) });
      throw error;
    }

    // await this.waitUntilStable();
    // await locator.scrollIntoViewIfNeeded();
    // await expect(locator).toBeVisible();
    // await expect(locator).toBeEnabled();
    // await locator.click();
    // await this.waitUntilStable();
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
      logger.error(`[SafeAction] Fill failed on: ${description}`, { error: String(error) });
      throw error;
    }

    // await this.waitUntilStable();
    // await locator.scrollIntoViewIfNeeded();
    // await expect(locator).toBeVisible();
    // await locator.fill(value);
    // await this.waitUntilStable();
  }

  async verifyUrl(url: RegExp | string): Promise<void> {
    logger.info(`[Assertion] Verifying URL pattern: ${String(url)}`);
    await expect(this.page).toHaveURL(url);
    logger.success(`[Assertion] URL verified: ${String(url)}`);
  }

  
  async fillIfEmpty(locator: Locator, value: string, description = 'Input field'): Promise<void> {
    await this.waitUntilStable();
    const currentValue = (await locator.inputValue()).trim();

    if (currentValue !== '') {
      logger.debug(`[SafeAction] ${description} already contains value, skipping fill.`);
      return;
    }

    logger.info(`[SafeAction] ${description} is empty, filling value...`);
    await locator.fill(value);
    await this.waitUntilStable();
  }

  async safeClickCartable(locator: Locator, description = 'Cartable item'): Promise<void> {
    logger.info(`[SafeAction] Cartable click on: ${description}`);

    // await this.waitUntilStable();
    // await expect(locator).toBeAttached({ timeout: 15000 });
    // await expect(locator).toBeVisible({ timeout: 15000 });
    // await expect(locator).toBeEnabled({ timeout: 15000 });

    try {
      await this.waitUntilStable();
      await expect(locator).toBeAttached({ timeout: 15000 });
      await expect(locator).toBeVisible({ timeout: 15000 });
      await expect(locator).toBeEnabled({ timeout: 15000 });
      try {
      await locator.scrollIntoViewIfNeeded({ timeout: 5000 });
    } catch {
      logger.warn(`[SafeAction] Scroll container bypass for: ${description}`);
    }

    await locator.click({ timeout: 15000 });
    await this.waitUntilStable();
    logger.success(`[SafeAction] Cartable clicked: ${description}`);
    } 
    catch (error) {
      logger.error(`[SafeAction] Cartable click failed on: ${description}`, { error: String(error) });
      throw error;
    }
  }
}