import { Page } from '@playwright/test';
import { CommerceLoginPage } from '../pages/commerce/CommerceLoginPage';
import { CommerceInventoryPage } from '../pages/commerce/CommerceInventoryPage';
import { CommerceCartPage } from '../pages/commerce/CommerceCartPage';
import {
  CheckoutCustomer,
  CommerceCheckoutPage,
  OrderAmounts,
} from '../pages/commerce/CommerceCheckoutPage';

export interface PurchaseInput {
  username: string;
  password: string;
  productName: string;
  customer: CheckoutCustomer;
}

export class PurchaseFlow {
  private readonly loginPage: CommerceLoginPage;
  private readonly inventoryPage: CommerceInventoryPage;
  private readonly cartPage: CommerceCartPage;
  private readonly checkoutPage: CommerceCheckoutPage;

  constructor(page: Page) {
    this.loginPage = new CommerceLoginPage(page);
    this.inventoryPage = new CommerceInventoryPage(page);
    this.cartPage = new CommerceCartPage(page);
    this.checkoutPage = new CommerceCheckoutPage(page);
  }

  async complete(input: PurchaseInput): Promise<OrderAmounts> {
    await this.loginPage.goto();
    await this.loginPage.login(input.username, input.password);

    await this.inventoryPage.assertLoaded();
    await this.inventoryPage.addProductToCart(input.productName);
    await this.inventoryPage.openCart();

    await this.cartPage.assertProduct(input.productName);
    await this.cartPage.beginCheckout();

    await this.checkoutPage.submitCustomer(input.customer);
    await this.checkoutPage.assertProduct(input.productName);

    const amounts = await this.checkoutPage.readOrderAmounts();
    await this.checkoutPage.finishOrder();
    await this.checkoutPage.assertOrderComplete();
    return amounts;
  }
}
