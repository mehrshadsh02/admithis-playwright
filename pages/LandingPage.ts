import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoginLocator } from '../locators/LoginLocator';

export class LoginPage extends BasePage {
  private readonly locator: LoginLocator;

  constructor(page: Page) {
    super(page);
    this.locator = new LoginLocator(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.locator.username.fill(username);
    await this.locator.password.fill(password);
    await this.locator.loginButton.click();
  }

  async verifyLogin(): Promise<void> {
    await expect(this.page).not.toHaveURL(/login/i);
  }
}