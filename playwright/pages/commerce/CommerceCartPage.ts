import { expect, Page } from '@playwright/test';

export class CommerceCartPage {
  constructor(private readonly page: Page) {}

  async assertProduct(productName: string, quantity = 1): Promise<void> {
    const item = this.page
      .locator('[data-test="inventory-item"]')
      .filter({ hasText: productName });

    await expect(item).toBeVisible();
    await expect(item.getByTestId('item-quantity')).toHaveText(String(quantity));
  }

  async beginCheckout(): Promise<void> {
    await this.page.getByTestId('checkout').click();
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
  }
}
