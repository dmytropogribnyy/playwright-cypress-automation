import { expect, Page } from '@playwright/test';

export class CommerceLoginPage {
  private readonly baseUrl =
    process.env.SAUCE_BASE_URL || 'https://www.saucedemo.com';

  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(this.baseUrl);
    await expect(this.page.getByTestId('username')).toBeVisible();
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.getByTestId('username').fill(username);
    await this.page.getByTestId('password').fill(password);
    await this.page.getByTestId('login-button').click();
  }

  async assertError(message: RegExp): Promise<void> {
    await expect(this.page.getByTestId('error')).toContainText(message);
  }
}
