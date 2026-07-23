class SauceInventoryPage {
  private readonly inventoryItem = '[data-test="inventory-item"]';
  private readonly addToCartButton = 'button[data-test^="add-to-cart"]';
  private readonly cartBadge = '[data-test="shopping-cart-badge"]';
  private readonly cartLink = '[data-test="shopping-cart-link"]';

  assertLoaded(): void {
    cy.url().should('include', '/inventory.html');
    cy.get(this.inventoryItem).should('have.length.greaterThan', 0);
  }

  addFirstProductToCart(): void {
    cy.get(this.inventoryItem)
      .first()
      .find(this.addToCartButton)
      .click();
  }

  addProductToCart(productName: string): void {
    cy.contains(this.inventoryItem, productName)
      .should('be.visible')
      .within(() => {
        cy.get(this.addToCartButton).should('be.enabled').click();
      });
  }

  assertCartBadgeCount(count: number): void {
    cy.get(this.cartBadge).should('have.text', String(count));
  }

  openCart(): void {
    cy.get(this.cartLink).should('be.visible').click();
    cy.url().should('include', '/cart.html');
  }
}

export const sauceInventoryPage = new SauceInventoryPage();
