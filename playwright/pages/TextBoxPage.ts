import { expect, Locator, Page } from '@playwright/test';

export interface TextBoxData {
  fullName: string;
  email: string;
  currentAddress: string;
  permanentAddress: string;
}

export class TextBoxPage {
  private readonly fullName: Locator;
  private readonly email: Locator;
  private readonly currentAddress: Locator;
  private readonly permanentAddress: Locator;
  private readonly submit: Locator;
  private readonly output: Locator;

  constructor(private readonly page: Page) {
    this.fullName = page.locator('#userName');
    this.email = page.locator('#userEmail');
    this.currentAddress = page.locator('#currentAddress');
    this.permanentAddress = page.locator('#permanentAddress');
    this.submit = page.getByRole('button', { name: 'Submit' });
    this.output = page.locator('#output');
  }

  async goto(): Promise<void> {
    await this.page.goto('/text-box');
    await expect(this.fullName).toBeVisible();
  }

  async fillAndSubmit(data: TextBoxData): Promise<void> {
    await this.fullName.fill(data.fullName);
    await this.email.fill(data.email);
    await this.currentAddress.fill(data.currentAddress);
    await this.permanentAddress.fill(data.permanentAddress);
    await this.submit.scrollIntoViewIfNeeded();
    await this.submit.click();
  }

  async assertSubmittedValues(data: TextBoxData): Promise<void> {
    await expect(this.output).toBeVisible();
    await expect(this.output.locator('#name')).toHaveText(`Name:${data.fullName}`);
    await expect(this.output.locator('#email')).toHaveText(`Email:${data.email}`);
    await expect(this.output.locator('p#currentAddress')).toContainText(data.currentAddress);
    await expect(this.output.locator('p#permanentAddress')).toContainText(data.permanentAddress);
  }
}
