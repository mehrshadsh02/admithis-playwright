import { type Locator, type Page } from '@playwright/test';

export class LoginLocator {
  constructor(private readonly page: Page) {}

  get username(): Locator {
    return this.page.locator('');
  }

  get password(): Locator {
    return this.page.locator('');
  }

  get loginButton(): Locator {
    return this.page.locator('');
  }
}