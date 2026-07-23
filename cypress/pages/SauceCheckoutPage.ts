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

const parseCurrency = (value: string): number => {
  const parsed = Number(value.replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(parsed)) {
    throw new Error(`Unable to parse currency value: ${value}`);
  }
  return parsed;
};

class SauceCheckoutPage {
  private readonly firstName = '[data-test="firstName"]';
  private readonly lastName = '[data-test="lastName"]';
  private readonly postalCode = '[data-test="postalCode"]';
  private readonly continueButton = '[data-test="continue"]';
  private readonly finishButton = '[data-test="finish"]';
  private readonly errorBanner = '[data-test="error"]';

  fillCustomer(customer: Partial<CheckoutCustomer>): void {
    if (customer.firstName !== undefined) {
      cy.get(this.firstName).clear().type(customer.firstName);
    }
    if (customer.lastName !== undefined) {
      cy.get(this.lastName).clear().type(customer.lastName);
    }
    if (customer.postalCode !== undefined) {
      cy.get(this.postalCode).clear().type(customer.postalCode);
    }
  }

  continueToReview(): void {
    cy.get(this.continueButton).click();
  }

  submitCustomer(customer: CheckoutCustomer): void {
    this.fillCustomer(customer);
    this.continueToReview();
    cy.url().should('include', '/checkout-step-two.html');
  }

  assertValidationError(message: string | RegExp): void {
    const banner = cy.get(this.errorBanner).should('be.visible');
    if (message instanceof RegExp) {
      banner.invoke('text').should('match', message);
    } else {
      banner.should('contain.text', message);
    }
  }

  assertProduct(productName: string): void {
    cy.contains('[data-test="inventory-item"]', productName).should('be.visible');
  }

  readOrderAmounts(): Cypress.Chainable<OrderAmounts> {
    return cy
      .get('[data-test="subtotal-label"]')
      .invoke('text')
      .then((subtotalText) =>
        cy
          .get('[data-test="tax-label"]')
          .invoke('text')
          .then((taxText) =>
            cy
              .get('[data-test="total-label"]')
              .invoke('text')
              .then((totalText) => ({
                subtotal: parseCurrency(subtotalText),
                tax: parseCurrency(taxText),
                total: parseCurrency(totalText),
              }))
          )
      );
  }

  finishOrder(): void {
    cy.get(this.finishButton).should('be.enabled').click();
    cy.url().should('include', '/checkout-complete.html');
  }

  assertOrderComplete(): void {
    cy.get('[data-test="complete-header"]')
      .should('be.visible')
      .and('have.text', 'Thank you for your order!');
    cy.get('[data-test="back-to-products"]').should('be.visible');
  }
}

export const sauceCheckoutPage = new SauceCheckoutPage();
