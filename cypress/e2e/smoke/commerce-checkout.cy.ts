import { purchaseFlow } from '../../flows/PurchaseFlow';

describe('Critical commerce journey — Cypress migration baseline', () => {
  it('completes checkout and reconciles the order total', () => {
    purchaseFlow
      .complete({
        username: Cypress.env('sauceUsername'),
        password: Cypress.env('saucePassword'),
        productName: 'Sauce Labs Backpack',
        customer: {
          firstName: 'Alex',
          lastName: 'Turner',
          postalCode: '10001',
        },
      })
      .then(({ subtotal, tax, total }) => {
        expect(subtotal).to.be.greaterThan(0);
        expect(tax).to.be.greaterThan(0);
        expect(total).to.be.closeTo(subtotal + tax, 0.001);
      });
  });
});
