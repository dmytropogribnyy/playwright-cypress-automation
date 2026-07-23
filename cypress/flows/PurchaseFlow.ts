import { sauceLoginPage } from '../pages/SauceLoginPage';
import { sauceInventoryPage } from '../pages/SauceInventoryPage';
import { sauceCartPage } from '../pages/SauceCartPage';
import {
  sauceCheckoutPage,
  CheckoutCustomer,
  OrderAmounts,
} from '../pages/SauceCheckoutPage';

export interface PurchaseInput {
  username: string;
  password: string;
  productName: string;
  customer: CheckoutCustomer;
}

class PurchaseFlow {
  complete(input: PurchaseInput): Cypress.Chainable<OrderAmounts> {
    sauceLoginPage.visit();
    sauceLoginPage.login(input.username, input.password);

    sauceInventoryPage.assertLoaded();
    sauceInventoryPage.addProductToCart(input.productName);
    sauceInventoryPage.assertCartBadgeCount(1);
    sauceInventoryPage.openCart();

    sauceCartPage.assertLoaded();
    sauceCartPage.assertProduct(input.productName);
    sauceCartPage.beginCheckout();

    sauceCheckoutPage.submitCustomer(input.customer);
    sauceCheckoutPage.assertProduct(input.productName);

    return sauceCheckoutPage.readOrderAmounts().then((amounts) => {
      sauceCheckoutPage.finishOrder();
      sauceCheckoutPage.assertOrderComplete();
      return amounts;
    });
  }
}

export const purchaseFlow = new PurchaseFlow();
