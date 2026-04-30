import { sauceLoginPage } from '../../pages/SauceLoginPage';
import { sauceInventoryPage } from '../../pages/SauceInventoryPage';

describe('SauceDemo — login and add-to-cart flow', () => {
  it('logs in with valid credentials, adds a product, and shows badge=1', () => {
    sauceLoginPage.visit();
    sauceLoginPage.login(
      Cypress.env('sauceUsername'),
      Cypress.env('saucePassword')
    );

    sauceInventoryPage.assertLoaded();
    sauceInventoryPage.addFirstProductToCart();
    sauceInventoryPage.assertCartBadgeCount(1);
  });

  it('shows error when password is missing', () => {
    sauceLoginPage.visit();
    sauceLoginPage.login(Cypress.env('sauceUsername'), 'wrong_password');
    sauceLoginPage.assertLoginError(/Username and password do not match/i);
  });
});
