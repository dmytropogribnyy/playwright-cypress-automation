class SauceLoginPage {
  private readonly username = '[data-test="username"]';
  private readonly password = '[data-test="password"]';
  private readonly loginButton = '[data-test="login-button"]';
  private readonly errorBanner = '[data-test="error"]';

  visit(): void {
    cy.visit('/');
    cy.get(this.username).should('be.visible');
  }

  login(user: string, pass: string): void {
    cy.get(this.username).clear().type(user);
    cy.get(this.password).clear().type(pass, { log: false });
    cy.get(this.loginButton).click();
  }

  assertLoginError(message: string | RegExp): void {
    const banner = cy.get(this.errorBanner).should('be.visible');
    if (message instanceof RegExp) {
      banner.invoke('text').should('match', message);
    } else {
      banner.and('contain.text', message);
    }
  }
}

export const sauceLoginPage = new SauceLoginPage();
