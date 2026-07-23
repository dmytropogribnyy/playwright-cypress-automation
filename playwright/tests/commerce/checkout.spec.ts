import { test, expect } from '../../fixtures/test';
import { PurchaseFlow } from '../../flows/PurchaseFlow';
import { CommerceLoginPage } from '../../pages/commerce/CommerceLoginPage';
import { CommerceInventoryPage } from '../../pages/commerce/CommerceInventoryPage';
import { CommerceCartPage } from '../../pages/commerce/CommerceCartPage';
import { CommerceCheckoutPage } from '../../pages/commerce/CommerceCheckoutPage';

const username = process.env.SAUCE_USERNAME || 'standard_user';
const password = process.env.SAUCE_PASSWORD || 'secret_sauce';
const productName = 'Sauce Labs Backpack';

test.describe('Commerce checkout migration parity', () => {
  test('completes checkout and reconciles the order total @smoke @critical @migration-parity', async ({
    page,
  }) => {
    const purchaseFlow = new PurchaseFlow(page);

    const { subtotal, tax, total } = await purchaseFlow.complete({
      username,
      password,
      productName,
      customer: {
        firstName: 'Alex',
        lastName: 'Turner',
        postalCode: '10001',
      },
    });

    expect(subtotal).toBeGreaterThan(0);
    expect(tax).toBeGreaterThan(0);
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  test('blocks checkout when postal code is missing @regression', async ({
    page,
  }) => {
    const loginPage = new CommerceLoginPage(page);
    const inventoryPage = new CommerceInventoryPage(page);
    const cartPage = new CommerceCartPage(page);
    const checkoutPage = new CommerceCheckoutPage(page);

    await loginPage.goto();
    await loginPage.login(username, password);
    await inventoryPage.assertLoaded();
    await inventoryPage.addProductToCart(productName);
    await inventoryPage.openCart();
    await cartPage.beginCheckout();

    await checkoutPage.fillCustomer({
      firstName: 'Alex',
      lastName: 'Turner',
    });
    await checkoutPage.continueToReview();
    await checkoutPage.assertValidationError(/Postal Code is required/i);
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });
});
