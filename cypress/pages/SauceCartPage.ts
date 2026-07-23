class SauceCartPage {
  private readonly cartItem = '[data-test="inventory-item"]';
  private readonly itemQuantity = '[data-test="item-quantity"]';
  private readonly checkoutButton = '[data-test="checkout"]';

  assertLoaded(): void {
    cy.url().should('include', '/cart.html');
    cy.get('[data-test="cart-list"]').should('be.visible');
  }

  assertProduct(productName: string, quantity = 1): void {
    cy.contains(this.cartItem, productName)
      .should('be.visible')
      .within(() => {
        cy.get(this.itemQuantity).should('have.text', String(quantity));
      });
  }

  beginCheckout(): void {
    cy.get(this.checkoutButton).should('be.enabled').click();
    cy.url().should('include', '/checkout-step-one.html');
  }
}

export const sauceCartPage = new SauceCartPage();
