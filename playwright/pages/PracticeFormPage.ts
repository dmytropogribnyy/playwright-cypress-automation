import { expect, Locator, Page } from '@playwright/test';

export interface PracticeFormData {
  firstName: string;
  lastName: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
}

export class PracticeFormPage {
  private readonly firstName: Locator;
  private readonly lastName: Locator;
  private readonly email: Locator;
  private readonly mobile: Locator;
  private readonly submit: Locator;
  private readonly modal: Locator;
  private readonly modalTable: Locator;

  constructor(private readonly page: Page) {
    this.firstName = page.locator('#firstName');
    this.lastName = page.locator('#lastName');
    this.email = page.locator('#userEmail');
    this.mobile = page.locator('#userNumber');
    this.submit = page.locator('#submit');
    this.modal = page.locator('.modal-content');
    this.modalTable = page.locator('.modal-content table');
  }

  async goto(): Promise<void> {
    await this.page.goto('/automation-practice-form');
    await expect(this.firstName).toBeVisible();
  }

  async fill(data: Partial<PracticeFormData>): Promise<void> {
    if (data.firstName !== undefined) await this.firstName.fill(data.firstName);
    if (data.lastName !== undefined) await this.lastName.fill(data.lastName);
    if (data.email !== undefined) await this.email.fill(data.email);
    if (data.mobile !== undefined) await this.mobile.fill(data.mobile);
    if (data.gender) {
      await this.page.locator(`label[for="gender-radio-${this.genderIndex(data.gender)}"]`).click();
    }
  }

  async submitForm(): Promise<void> {
    await this.submit.scrollIntoViewIfNeeded();
    await this.submit.click();
  }

  async assertSuccessModal(data: PracticeFormData): Promise<void> {
    await expect(this.modal).toBeVisible();
    await expect(this.modal).toContainText('Thanks for submitting the form');
    await expect(this.modalTable).toContainText(`${data.firstName} ${data.lastName}`);
    await expect(this.modalTable).toContainText(data.email);
    await expect(this.modalTable).toContainText(data.mobile);
    await expect(this.modalTable).toContainText(data.gender);
  }

  async assertModalNotVisible(): Promise<void> {
    await expect(this.modal).toHaveCount(0);
  }

  /**
   * The first invalid field gets aria-invalid via the :invalid pseudo-class
   * styling — we use the same CSS hook the page itself relies on.
   */
  async assertFieldInvalid(field: 'firstName' | 'lastName' | 'mobile'): Promise<void> {
    const map = { firstName: this.firstName, lastName: this.lastName, mobile: this.mobile };
    await expect(map[field]).toHaveCSS('border-color', /rgb\(220, 53, 69\)|rgba?\(255, ?0, ?0/);
  }

  private genderIndex(gender: PracticeFormData['gender']): number {
    return { Male: 1, Female: 2, Other: 3 }[gender];
  }
}
