import { expect, Locator, Page } from '@playwright/test';

export class CommerceInventoryPage {
  constructor(private readonly page: Page) {}

  private product(productName: string): Locator {
    return this.page
      .locator('[data-test="inventory-item"]')
      .filter({ hasText: productName });
  }

  async assertLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.page.locator('[data-test="inventory-item"]')).not.toHaveCount(0);
  }

  async addProductToCart(productName: string): Promise<void> {
    const product = this.product(productName);
    await expect(product).toBeVisible();
    await product.getByRole('button', { name: /add to cart/i }).click();
    await expect(this.page.getByTestId('shopping-cart-badge')).toHaveText('1');
  }

  async openCart(): Promise<void> {
    await this.page.getByTestId('shopping-cart-link').click();
    await expect(this.page).toHaveURL(/cart\.html/);
  }
}
