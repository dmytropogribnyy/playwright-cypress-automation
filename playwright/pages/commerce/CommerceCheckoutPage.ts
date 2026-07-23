import { expect, Page } from '@playwright/test';

export interface CheckoutCustomer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export interface OrderAmounts {
  subtotal: number;
  tax: number;
  total: number;
}

const parseCurrency = (value: string | null): number => {
  if (value === null) {
    throw new Error('Expected a currency value but received no text');
  }
  const parsed = Number(value.replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(parsed)) {
    throw new Error(`Unable to parse currency value: ${value}`);
  }
  return parsed;
};

export class CommerceCheckoutPage {
  constructor(private readonly page: Page) {}

  async fillCustomer(customer: Partial<CheckoutCustomer>): Promise<void> {
    if (customer.firstName !== undefined) {
      await this.page.getByTestId('firstName').fill(customer.firstName);
    }
    if (customer.lastName !== undefined) {
      await this.page.getByTestId('lastName').fill(customer.lastName);
    }
    if (customer.postalCode !== undefined) {
      await this.page.getByTestId('postalCode').fill(customer.postalCode);
    }
  }

  async continueToReview(): Promise<void> {
    await this.page.getByTestId('continue').click();
  }

  async submitCustomer(customer: CheckoutCustomer): Promise<void> {
    await this.fillCustomer(customer);
    await this.continueToReview();
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
  }

  async assertValidationError(message: RegExp): Promise<void> {
    await expect(this.page.getByTestId('error')).toContainText(message);
  }

  async assertProduct(productName: string): Promise<void> {
    await expect(
      this.page
        .locator('[data-test="inventory-item"]')
        .filter({ hasText: productName })
    ).toBeVisible();
  }

  async readOrderAmounts(): Promise<OrderAmounts> {
    return {
      subtotal: parseCurrency(
        await this.page.getByTestId('subtotal-label').textContent()
      ),
      tax: parseCurrency(await this.page.getByTestId('tax-label').textContent()),
      total: parseCurrency(
        await this.page.getByTestId('total-label').textContent()
      ),
    };
  }

  async finishOrder(): Promise<void> {
    await this.page.getByTestId('finish').click();
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
  }

  async assertOrderComplete(): Promise<void> {
    await expect(this.page.getByTestId('complete-header')).toHaveText(
      'Thank you for your order!'
    );
    await expect(this.page.getByTestId('back-to-products')).toBeVisible();
  }
}
