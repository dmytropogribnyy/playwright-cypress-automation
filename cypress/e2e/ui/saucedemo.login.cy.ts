import { sauceLoginPage } from '../../pages/SauceLoginPage';
import { sauceInventoryPage } from '../../pages/SauceInventoryPage';

describe('Commerce UI — authentication and cart readiness', () => {
  it('authenticates a valid customer, adds a product, and updates cart state', () => {
    sauceLoginPage.visit();
    sauceLoginPage.login(
      Cypress.env('sauceUsername'),
      Cypress.env('saucePassword')
    );

    sauceInventoryPage.assertLoaded();
    sauceInventoryPage.addFirstProductToCart();
    sauceInventoryPage.assertCartBadgeCount(1);
  });

  it('rejects invalid customer credentials with an actionable error', () => {
    sauceLoginPage.visit();
    sauceLoginPage.login(Cypress.env('sauceUsername'), 'wrong_password');
    sauceLoginPage.assertLoginError(/Username and password do not match/i);
  });
});
