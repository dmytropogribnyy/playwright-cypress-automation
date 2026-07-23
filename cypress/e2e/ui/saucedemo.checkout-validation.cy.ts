import { sauceLoginPage } from '../../pages/SauceLoginPage';
import { sauceInventoryPage } from '../../pages/SauceInventoryPage';
import { sauceCartPage } from '../../pages/SauceCartPage';
import { sauceCheckoutPage } from '../../pages/SauceCheckoutPage';

describe('Commerce checkout — customer data validation', () => {
  beforeEach(() => {
    sauceLoginPage.visit();
    sauceLoginPage.login(
      Cypress.env('sauceUsername'),
      Cypress.env('saucePassword')
    );
    sauceInventoryPage.assertLoaded();
    sauceInventoryPage.addProductToCart('Sauce Labs Backpack');
    sauceInventoryPage.openCart();
    sauceCartPage.beginCheckout();
  });

  it('blocks checkout when postal code is missing', () => {
    sauceCheckoutPage.fillCustomer({
      firstName: 'Alex',
      lastName: 'Turner',
    });
    sauceCheckoutPage.continueToReview();
    sauceCheckoutPage.assertValidationError(/Postal Code is required/i);
    cy.url().should('include', '/checkout-step-one.html');
  });
});
